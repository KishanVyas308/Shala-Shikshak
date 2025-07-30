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
// Get all subjects for a standard (public)
router.get('/standard/:standardId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { standardId } = req.params;
        const subjects = yield prisma_1.prisma.subject.findMany({
            where: { standardId },
            include: {
                chapters: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                    include: {
                        resources: {
                            select: {
                                id: true,
                                type: true,
                                resourceType: true,
                            }
                        }
                    }
                },
                standard: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: { chapters: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(subjects);
    }
    catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get single subject by ID (public)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const subject = yield prisma_1.prisma.subject.findUnique({
            where: { id },
            include: {
                chapters: {
                    orderBy: { createdAt: 'desc' },
                },
                standard: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json(subject);
    }
    catch (error) {
        console.error('Get subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Create subject (admin only)
router.post('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = validation_1.subjectSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { name, description, standardId } = value;
        // Check if standard exists
        const standard = yield prisma_1.prisma.standard.findUnique({
            where: { id: standardId },
        });
        if (!standard) {
            return res.status(400).json({ error: 'Standard not found' });
        }
        // Check if subject already exists for this standard
        const existingSubject = yield prisma_1.prisma.subject.findUnique({
            where: {
                name_standardId: {
                    name,
                    standardId,
                },
            },
        });
        if (existingSubject) {
            return res.status(400).json({
                error: 'Subject with this name already exists for this standard'
            });
        }
        const subject = yield prisma_1.prisma.subject.create({
            data: {
                name,
                description,
                standardId,
            },
            include: {
                standard: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: { chapters: true },
                },
            },
        });
        res.status(201).json(subject);
    }
    catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Update subject (admin only)
router.put('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // const { error, value } = subjectUpdateSchema.validate(req.body);
        const value = req.body;
        // if (error) {
        //   return res.status(400).json({ error: error.details[0].message });
        // }
        // Check if subject exists
        const existingSubject = yield prisma_1.prisma.subject.findUnique({
            where: { id },
        });
        if (!existingSubject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        // Check for name conflict if updating name
        if (value.name && value.name !== existingSubject.name) {
            const nameConflict = yield prisma_1.prisma.subject.findUnique({
                where: {
                    name_standardId: {
                        name: value.name,
                        standardId: existingSubject.standardId,
                    },
                },
            });
            if (nameConflict) {
                return res.status(400).json({
                    error: 'Subject with this name already exists for this standard'
                });
            }
        }
        const updatedSubject = yield prisma_1.prisma.subject.update({
            where: { id },
            data: value,
            include: {
                standard: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: { chapters: true },
                },
            },
        });
        res.json(updatedSubject);
    }
    catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Delete subject (admin only)
router.delete('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const subject = yield prisma_1.prisma.subject.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { chapters: true },
                },
            },
        });
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        if (subject._count.chapters > 0) {
            return res.status(400).json({
                error: 'Cannot delete subject with associated chapters. Delete chapters first.'
            });
        }
        yield prisma_1.prisma.subject.delete({
            where: { id },
        });
        res.json({ message: 'Subject deleted successfully' });
    }
    catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
