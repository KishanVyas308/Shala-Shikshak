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
const router = express_1.default.Router();
// Get all chapters for a subject (public)
router.get('/subject/:subjectId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subjectId } = req.params;
        const chapters = yield prisma_1.prisma.chapter.findMany({
            where: { subjectId },
            orderBy: { createdAt: 'desc' },
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
                resources: {
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        resources: true,
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
// Get single chapter by ID with resources (public)
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
                resources: {
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        resources: true,
                    },
                },
            },
        });
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        // Group resources by type for easier frontend consumption
        const groupedResources = {
            svadhyay: chapter.resources.filter(r => r.type === 'svadhyay'),
            svadhyay_pothi: chapter.resources.filter(r => r.type === 'svadhyay_pothi'),
            other: chapter.resources.filter(r => r.type === 'other'),
        };
        res.json(Object.assign(Object.assign({}, chapter), { groupedResources }));
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
        const { name, description, subjectId } = value;
        // Check if subject exists
        const subject = yield prisma_1.prisma.subject.findUnique({
            where: { id: subjectId },
        });
        if (!subject) {
            return res.status(400).json({ error: 'Subject not found' });
        }
        const chapter = yield prisma_1.prisma.chapter.create({
            data: {
                name,
                description,
                subjectId,
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
                resources: true,
                _count: {
                    select: {
                        resources: true,
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
        const value = req.body;
        // Check if chapter exists
        const existingChapter = yield prisma_1.prisma.chapter.findUnique({
            where: { id },
        });
        if (!existingChapter) {
            return res.status(404).json({ error: 'Chapter not found' });
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
                resources: {
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        resources: true,
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
            include: {
                resources: true,
            },
        });
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        // Delete the chapter from database (this will cascade delete resources)
        yield prisma_1.prisma.chapter.delete({
            where: { id },
        });
        res.json({
            message: 'Chapter and associated resources deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete chapter error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
