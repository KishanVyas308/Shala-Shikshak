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
const auth_1 = require("../middleware/auth");
const googleDrive_1 = __importDefault(require("../services/googleDrive"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
const driveService = googleDrive_1.default.getInstance();
// Configure multer for memory storage (we'll upload to Google Drive, not local storage)
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});
// Upload PDF file to Google Drive (admin only)
router.post('/pdf', auth_1.authenticateToken, upload.single('pdf'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(req.file.originalname);
        const fileName = `${req.file.fieldname}-${uniqueSuffix}${ext}`;
        // Upload to Google Drive
        const driveFile = yield driveService.uploadPDF(req.file.buffer, fileName, req.file.originalname);
        res.json({
            message: 'File uploaded successfully to Google Drive',
            fileId: driveFile.id,
            fileName: driveFile.name,
            originalName: req.file.originalname,
            size: driveFile.size,
            viewingUrl: driveService.getPublicViewingLink(driveFile.id),
            embeddedUrl: driveService.getEmbeddedViewerLink(driveFile.id),
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
}));
// Delete file from Google Drive (admin only)
router.delete('/pdf/:fileId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileId } = req.params;
        // Delete from Google Drive
        yield driveService.deleteFile(fileId);
        res.json({ message: 'File deleted successfully from Google Drive' });
    }
    catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'File deletion failed' });
    }
}));
// Get file info from Google Drive (admin only)
router.get('/pdf/:fileId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileId } = req.params;
        const fileInfo = yield driveService.getFileInfo(fileId);
        res.json(Object.assign(Object.assign({}, fileInfo), { viewingUrl: driveService.getPublicViewingLink(fileId), embeddedUrl: driveService.getEmbeddedViewerLink(fileId) }));
    }
    catch (error) {
        console.error('Get file info error:', error);
        res.status(500).json({ error: 'Failed to get file info' });
    }
}));
// Upload PDF directly to a chapter (admin only)
router.post('/chapter/:chapterId/pdf', auth_1.authenticateToken, upload.single('pdf'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chapterId } = req.params;
        const { type } = req.body; // 'solution' or 'textbook'
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        if (!type || !['solution', 'textbook'].includes(type)) {
            return res.status(400).json({
                error: 'Type must be either "solution" or "textbook"'
            });
        }
        // Check if chapter exists
        const chapter = yield prisma_1.prisma.chapter.findUnique({
            where: { id: chapterId },
        });
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(req.file.originalname);
        const fileName = `${type}-${chapterId}-${uniqueSuffix}${ext}`;
        // Upload to Google Drive
        const driveFile = yield driveService.uploadPDF(req.file.buffer, fileName, req.file.originalname);
        // Delete old PDF if exists
        const oldFileId = type === 'solution' ? chapter.solutionPdfFileId : chapter.textbookPdfFileId;
        if (oldFileId) {
            try {
                yield driveService.deleteFile(oldFileId);
            }
            catch (error) {
                console.warn(`Failed to delete old ${type} PDF for chapter ${chapterId}:`, error);
            }
        }
        // Update chapter in database
        const updateData = type === 'solution'
            ? {
                solutionPdfUrl: driveService.getPublicViewingLink(driveFile.id),
                solutionPdfFileId: driveFile.id,
                solutionPdfFileName: req.file.originalname,
            }
            : {
                textbookPdfUrl: driveService.getPublicViewingLink(driveFile.id),
                textbookPdfFileId: driveFile.id,
                textbookPdfFileName: req.file.originalname,
            };
        const updatedChapter = yield prisma_1.prisma.chapter.update({
            where: { id: chapterId },
            data: updateData,
            include: {
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
        });
        res.json({
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} PDF uploaded successfully`,
            chapter: updatedChapter,
            fileInfo: {
                fileId: driveFile.id,
                fileName: driveFile.name,
                originalName: req.file.originalname,
                size: driveFile.size,
                viewingUrl: driveService.getPublicViewingLink(driveFile.id),
                embeddedUrl: driveService.getEmbeddedViewerLink(driveFile.id),
            },
        });
    }
    catch (error) {
        console.error('Chapter PDF upload error:', error);
        res.status(500).json({ error: 'PDF upload failed' });
    }
}));
// Delete PDF from a chapter (admin only)
router.delete('/chapter/:chapterId/pdf/:type', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chapterId, type } = req.params;
        if (!['solution', 'textbook'].includes(type)) {
            return res.status(400).json({
                error: 'Type must be either "solution" or "textbook"'
            });
        }
        // Check if chapter exists
        const chapter = yield prisma_1.prisma.chapter.findUnique({
            where: { id: chapterId },
        });
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        const fileId = type === 'solution' ? chapter.solutionPdfFileId : chapter.textbookPdfFileId;
        if (!fileId) {
            return res.status(404).json({
                error: `No ${type} PDF found for this chapter`
            });
        }
        // Delete from Google Drive
        yield driveService.deleteFile(fileId);
        // Update chapter in database
        const updateData = type === 'solution'
            ? {
                solutionPdfUrl: null,
                solutionPdfFileId: null,
                solutionPdfFileName: null,
            }
            : {
                textbookPdfUrl: null,
                textbookPdfFileId: null,
                textbookPdfFileName: null,
            };
        const updatedChapter = yield prisma_1.prisma.chapter.update({
            where: { id: chapterId },
            data: updateData,
            include: {
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
        });
        res.json({
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} PDF deleted successfully`,
            chapter: updatedChapter,
        });
    }
    catch (error) {
        console.error('Chapter PDF delete error:', error);
        res.status(500).json({ error: 'PDF deletion failed' });
    }
}));
// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 50MB.' });
        }
        return res.status(400).json({ error: 'File upload error: ' + error.message });
    }
    if (error.message === 'Only PDF files are allowed') {
        return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    next(error);
});
exports.default = router;
