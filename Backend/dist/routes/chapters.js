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
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../utils/validation");
const googleDrive_1 = __importDefault(require("../services/googleDrive"));
const router = express_1.default.Router();
const driveService = googleDrive_1.default.getInstance();
// Utility function to safely delete a file from Google Drive
const deleteGoogleDriveFileIfExists = (fileId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fileId)
        return;
    try {
        yield driveService.deleteFile(fileId);
        console.log(`Successfully deleted file from Google Drive: ${fileId}`);
    }
    catch (error) {
        console.error(`Error deleting file from Google Drive ${fileId}:`, error);
        // Don't throw error - we don't want file deletion failure to prevent chapter deletion
    }
});
// Get all chapters for a subject (public)
router.get('/subject/:subjectId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectId } = req.params;
        const chapters = yield prisma_1.prisma.chapter.findMany({
            where: { subjectId },
            orderBy: { order: 'asc' },
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
        res.json(chapters);
    }
    catch (error) {
        console.error('Get chapters error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get single chapter by ID (public)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const chapter = yield prisma_1.prisma.chapter.findUnique({
            where: { id },
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
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        res.json(chapter);
    }
    catch (error) {
        console.error('Get chapter error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Create chapter (admin only)
router.post('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = validation_1.chapterSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { name, description, order, subjectId, videoUrl, solutionPdfUrl, solutionPdfFileId, solutionPdfFileName, textbookPdfUrl, textbookPdfFileId, textbookPdfFileName } = value;
        // Check if subject exists
        const subject = yield prisma_1.prisma.subject.findUnique({
            where: { id: subjectId },
        });
        if (!subject) {
            return res.status(400).json({ error: 'Subject not found' });
        }
        // Check if order already exists for this subject
        const existingOrder = yield prisma_1.prisma.chapter.findUnique({
            where: {
                order_subjectId: {
                    order,
                    subjectId,
                },
            },
        });
        if (existingOrder) {
            return res.status(400).json({
                error: 'Chapter with this order already exists for this subject'
            });
        }
        const chapter = yield prisma_1.prisma.chapter.create({
            data: {
                name,
                description,
                order,
                subjectId,
                videoUrl,
                solutionPdfUrl,
                solutionPdfFileId,
                solutionPdfFileName,
                textbookPdfUrl,
                textbookPdfFileId,
                textbookPdfFileName,
            },
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
        res.status(201).json(chapter);
    }
    catch (error) {
        console.error('Create chapter error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Update chapter (admin only)
router.put('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { error, value } = validation_1.chapterUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        // Check if chapter exists
        const existingChapter = yield prisma_1.prisma.chapter.findUnique({
            where: { id },
        });
        if (!existingChapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        // Check for order conflict if updating order
        if (value.order && value.order !== existingChapter.order) {
            const orderConflict = yield prisma_1.prisma.chapter.findUnique({
                where: {
                    order_subjectId: {
                        order: value.order,
                        subjectId: existingChapter.subjectId,
                    },
                },
            });
            if (orderConflict) {
                return res.status(400).json({
                    error: 'Chapter with this order already exists for this subject'
                });
            }
        }
        // Clean up old PDF files if they're being replaced
        if (value.textbookPdfFileId && value.textbookPdfFileId !== existingChapter.textbookPdfFileId) {
            yield deleteGoogleDriveFileIfExists(existingChapter.textbookPdfFileId);
        }
        if (value.solutionPdfFileId && value.solutionPdfFileId !== existingChapter.solutionPdfFileId) {
            yield deleteGoogleDriveFileIfExists(existingChapter.solutionPdfFileId);
        }
        const updatedChapter = yield prisma_1.prisma.chapter.update({
            where: { id },
            data: value,
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
        res.json(updatedChapter);
    }
    catch (error) {
        console.error('Update chapter error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Delete chapter (admin only)
router.delete('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const chapter = yield prisma_1.prisma.chapter.findUnique({
            where: { id },
        });
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        // Delete associated PDF files before deleting the chapter
        if (chapter.textbookPdfFileId) {
            yield deleteGoogleDriveFileIfExists(chapter.textbookPdfFileId);
        }
        if (chapter.solutionPdfFileId) {
            yield deleteGoogleDriveFileIfExists(chapter.solutionPdfFileId);
        }
        // Delete the chapter from database
        yield prisma_1.prisma.chapter.delete({
            where: { id },
        });
        res.json({
            message: 'Chapter and associated files deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete chapter error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Batch reorder chapters (admin only)
router.put('/batch/reorder', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chapters } = req.body;
        if (!Array.isArray(chapters)) {
            return res.status(400).json({ error: 'Chapters must be an array' });
        }
        // Validate that all chapters have id and order
        for (const chapter of chapters) {
            if (!chapter.id || typeof chapter.order !== 'number') {
                return res.status(400).json({
                    error: 'Each chapter must have an id and order'
                });
            }
        }
        // Use a transaction to update all chapters atomically
        yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            for (const chapter of chapters) {
                yield tx.chapter.update({
                    where: { id: chapter.id },
                    data: { order: chapter.order },
                });
            }
        }));
        res.json({ message: 'Chapters reordered successfully' });
    }
    catch (error) {
        console.error('Batch reorder chapters error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
