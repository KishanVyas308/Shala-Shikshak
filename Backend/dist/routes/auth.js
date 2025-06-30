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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const validation_1 = require("../utils/validation");
const router = express_1.default.Router();
// Register admin (for development - remove in production)
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = validation_1.adminRegisterSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { name, email, password } = value;
        // Check if admin already exists
        const existingAdmin = yield prisma_1.prisma.admin.findUnique({
            where: { email },
        });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin already exists with this email' });
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        // Create admin
        const admin = yield prisma_1.prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        res.status(201).json({
            message: 'Admin registered successfully',
            admin,
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Login admin
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error, value } = validation_1.adminLoginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { email, password } = value;
        // Find admin
        const admin = yield prisma_1.prisma.admin.findUnique({
            where: { email },
        });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Check password
        const isValidPassword = yield bcryptjs_1.default.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate JWT token
        const options = { expiresIn: 350000 };
        const token = jsonwebtoken_1.default.sign({
            id: admin.id,
            email: admin.email,
            name: admin.name,
        }, process.env.JWT_SECRET || '', options);
        res.json({
            message: 'Login successful',
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Verify token
router.get('/verify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const admin = yield prisma_1.prisma.admin.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        if (!admin) {
            return res.status(401).json({ error: 'Admin not found' });
        }
        res.json({ admin });
    }
    catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
}));
exports.default = router;
