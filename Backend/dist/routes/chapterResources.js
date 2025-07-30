"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../utils/validation");
const localFileService_1 = require("../services/localFileService");
const router = express_1.default.Router();
const fileService = localFileService_1.LocalFileService.getInstance();
// Configure multer for file uploads (30MB limit)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 30 * 1024 * 1024, // 30MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow PDF files for upload
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed for upload'));
        }
    }
});
// Utility function to safely delete a local file
const deleteLocalFileIfExists = (fileUrl) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fileUrl)
        return;
    try {
        yield fileService.deleteFile(fileUrl);
        console.log(`Successfully deleted local file: ${fileUrl}`);
    }
    catch (error) {
        console.error(`Error deleting local file ${fileUrl}:`, error);
        // Don't throw error - we don't want file deletion failure to prevent resource deletion
    }
});
// Get all resources for a chapter (public)
router.get('/chapter/:chapterId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chapterId } = req.params;
        const resources = yield prisma_1.prisma.chapterResource.findMany({
            where: { chapterId },
            orderBy: { createdAt: 'desc' },
            include: {
                chapter: {
                    select: {
                        id: true,
                        name: true,
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                standard: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        // Group resources by type
        const groupedResources = {
            svadhyay: resources.filter(r => r.type === 'svadhyay'),
            svadhyay_pothi: resources.filter(r => r.type === 'svadhyay_pothi'),
            other: resources.filter(r => r.type === 'other'),
        };
        res.json(groupedResources);
    }
    catch (error) {
        console.error('Get chapter resources error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get single resource by ID (public)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const resource = yield prisma_1.prisma.chapterResource.findUnique({
            where: { id },
            include: {
                chapter: {
                    select: {
                        id: true,
                        name: true,
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                standard: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json(resource);
    }
    catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Create chapter resource (admin only)
router.post('/', auth_1.authenticateToken, upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = validation_1.chapterResourceSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { title, description, type, resourceType, url, fileName, chapterId } = value;
        // Check if chapter exists
        const chapter = yield prisma_1.prisma.chapter.findUnique({
            where: { id: chapterId },
        });
        if (!chapter) {
            return res.status(400).json({ error: 'Chapter not found' });
        }
        let finalUrl = url;
        let finalFileName = fileName;
        // If file is uploaded, save it and use the local URL
        if (req.file) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path_1.default.extname(req.file.originalname);
            const generatedFileName = `chapter-${chapterId}-${type}-${uniqueSuffix}${ext}`;
            const uploadedFile = yield fileService.uploadPDF(req.file.buffer, generatedFileName, req.file.originalname);
            finalUrl = uploadedFile.url;
            finalFileName = uploadedFile.name;
        }
        const resource = yield prisma_1.prisma.chapterResource.create({
            data: {
                title,
                description,
                type,
                resourceType,
                url: finalUrl,
                fileName: finalFileName,
                chapterId,
            },
            include: {
                chapter: {
                    select: {
                        id: true,
                        name: true,
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                standard: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.status(201).json(resource);
    }
    catch (error) {
        console.error('Create chapter resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Update chapter resource (admin only)
router.put('/:id', auth_1.authenticateToken, upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const value = req.body;
        // Check if resource exists
        const existingResource = yield prisma_1.prisma.chapterResource.findUnique({
            where: { id },
        });
        if (!existingResource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        let finalUrl = value.url || existingResource.url;
        let finalFileName = existingResource.fileName;
        // If new file is uploaded
        if (req.file) {
            // Delete old file if it was uploaded (not external URL)
            if (existingResource.fileName && existingResource.url.includes('/uploads/')) {
                try {
                    yield fileService.deleteFile(existingResource.fileName);
                }
                catch (error) {
                    console.warn('Failed to delete old file:', error);
                }
            }
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path_1.default.extname(req.file.originalname);
            const generatedFileName = `chapter-${existingResource.chapterId}-${value.type || existingResource.type}-${uniqueSuffix}${ext}`;
            const uploadedFile = yield fileService.uploadPDF(req.file.buffer, generatedFileName, req.file.originalname);
            finalUrl = uploadedFile.url;
            finalFileName = uploadedFile.name;
        }
        // Clean up old file if URL is being replaced and it's a PDF
        if (value.url && value.url !== existingResource.url && existingResource.resourceType === 'pdf') {
            yield deleteLocalFileIfExists(existingResource.url);
        }
        const updatedResource = yield prisma_1.prisma.chapterResource.update({
            where: { id },
            data: Object.assign(Object.assign({}, value), { url: finalUrl, fileName: finalFileName }),
            include: {
                chapter: {
                    select: {
                        id: true,
                        name: true,
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                standard: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.json(updatedResource);
    }
    catch (error) {
        console.error('Update chapter resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Delete chapter resource (admin only)
router.delete('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const resource = yield prisma_1.prisma.chapterResource.findUnique({
            where: { id },
        });
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        // Delete associated file if it's a PDF
        if (resource.resourceType === 'pdf' && resource.url) {
            yield deleteLocalFileIfExists(resource.url);
        }
        // Delete the resource from database
        yield prisma_1.prisma.chapterResource.delete({
            where: { id },
        });
        res.json({
            message: 'Resource and associated files deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete chapter resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Remove file from resource (admin only) - keeps resource but removes file
router.delete('/:id/file', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const resource = yield prisma_1.prisma.chapterResource.findUnique({
            where: { id },
        });
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        if (!resource.fileName) {
            return res.status(400).json({ error: 'Resource has no uploaded file to remove' });
        }
        // Delete the physical file
        if (resource.url) {
            yield deleteLocalFileIfExists(resource.url);
        }
        // Update resource to remove file references
        const updatedResource = yield prisma_1.prisma.chapterResource.update({
            where: { id },
            data: {
                url: '',
                fileName: null,
            },
            include: {
                chapter: {
                    select: {
                        id: true,
                        name: true,
                        subject: {
                            select: {
                                id: true,
                                name: true,
                                standard: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.json(updatedResource);
    }
    catch (error) {
        console.error('Remove file from resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get resources grouped by type for a chapter (public)
router.get('/chapter/:chapterId/grouped', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chapterId } = req.params;
        // First verify the chapter exists
        const chapter = yield prisma_1.prisma.chapter.findUnique({
            where: { id: chapterId },
            include: {
                subject: {
                    include: {
                        standard: true,
                    },
                },
            },
        });
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        // Get all resources for this chapter
        const resources = yield prisma_1.prisma.chapterResource.findMany({
            where: { chapterId },
            orderBy: { createdAt: 'desc' },
        });
        // Group resources by type
        const groupedResources = {
            svadhyay: resources.filter(r => r.type === 'svadhyay'),
            svadhyay_pothi: resources.filter(r => r.type === 'svadhyay_pothi'),
            other: resources.filter(r => r.type === 'other'),
        };
        // Calculate counts
        const counts = {
            svadhyay: groupedResources.svadhyay.length,
            svadhyay_pothi: groupedResources.svadhyay_pothi.length,
            other: groupedResources.other.length,
            total: resources.length,
        };
        res.json({
            chapter: {
                id: chapter.id,
                name: chapter.name,
                subject: chapter.subject,
            },
            resources: groupedResources,
            counts,
        });
    }
    catch (error) {
        console.error('Get grouped chapter resources error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
