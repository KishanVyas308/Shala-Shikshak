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
// Get all standards (public)
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const standards = yield prisma_1.prisma.standard.findMany({
            orderBy: { order: 'asc' },
            include: {
                subjects: {
                    include: {
                        chapters: {
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                name: true,
                                order: true,
                                videoUrl: true,
                                solutionPdfUrl: true,
                                textbookPdfUrl: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { subjects: true },
                },
            },
        });
        res.json(standards);
    }
    catch (error) {
        console.error('Get standards error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Get single standard by ID (public)
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const standard = yield prisma_1.prisma.standard.findUnique({
            where: { id },
            include: {
                subjects: {
                    include: {
                        chapters: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
        if (!standard) {
            return res.status(404).json({ error: 'Standard not found' });
        }
        res.json(standard);
    }
    catch (error) {
        console.error('Get standard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Create standard (admin only)
router.post('/', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = validation_1.standardSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { name, description, order } = value;
        // Check if order already exists
        const existingOrder = yield prisma_1.prisma.standard.findUnique({
            where: { order },
        });
        if (existingOrder) {
            return res.status(400).json({ error: 'Order already exists' });
        }
        // Check if name already exists
        const existingName = yield prisma_1.prisma.standard.findUnique({
            where: { name },
        });
        if (existingName) {
            return res.status(400).json({ error: 'Standard with this name already exists' });
        }
        const standard = yield prisma_1.prisma.standard.create({
            data: {
                name,
                description,
                order,
            },
            include: {
                _count: {
                    select: { subjects: true },
                },
            },
        });
        res.status(201).json(standard);
    }
    catch (error) {
        console.error('Create standard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Update standard (admin only)
router.put('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { error, value } = validation_1.standardUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        // Check if standard exists
        const existingStandard = yield prisma_1.prisma.standard.findUnique({
            where: { id },
        });
        if (!existingStandard) {
            return res.status(404).json({ error: 'Standard not found' });
        }
        // Check for conflicts if updating name or order
        if (value.name && value.name !== existingStandard.name) {
            const nameConflict = yield prisma_1.prisma.standard.findUnique({
                where: { name: value.name },
            });
            if (nameConflict) {
                return res.status(400).json({ error: 'Standard with this name already exists' });
            }
        }
        if (value.order && value.order !== existingStandard.order) {
            const orderConflict = yield prisma_1.prisma.standard.findUnique({
                where: { order: value.order },
            });
            if (orderConflict) {
                return res.status(400).json({ error: 'Order already exists' });
            }
        }
        const updatedStandard = yield prisma_1.prisma.standard.update({
            where: { id },
            data: value,
            include: {
                _count: {
                    select: { subjects: true },
                },
            },
        });
        res.json(updatedStandard);
    }
    catch (error) {
        console.error('Update standard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Delete standard (admin only)
router.delete('/:id', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const standard = yield prisma_1.prisma.standard.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { subjects: true },
                },
            },
        });
        if (!standard) {
            return res.status(404).json({ error: 'Standard not found' });
        }
        if (standard._count.subjects > 0) {
            return res.status(400).json({
                error: 'Cannot delete standard with associated subjects. Delete subjects first.'
            });
        }
        yield prisma_1.prisma.standard.delete({
            where: { id },
        });
        res.json({ message: 'Standard deleted successfully' });
    }
    catch (error) {
        console.error('Delete standard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
