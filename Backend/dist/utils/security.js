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
exports.validateImageDimensions = exports.formatFileSize = exports.generateSafeFilename = exports.validateFileType = exports.FileOperationError = exports.getWatermarkConfig = exports.imageSecurityHeaders = exports.preventDirectAccess = exports.logImageAccess = exports.validateChapterAccess = exports.pdfProcessingRateLimit = exports.imageRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiting for image requests
exports.imageRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many image requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiting for PDF processing
exports.pdfProcessingRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 PDF processing requests per hour
    message: 'Too many PDF processing requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
// Middleware to validate chapter access
const validateChapterAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chapterId } = req.params;
        // You can add additional logic here to check if user has access to this chapter
        // For now, we'll just check if the chapter exists (this is already done in the routes)
        next();
    }
    catch (error) {
        console.error('Chapter access validation error:', error);
        res.status(500).json({ error: 'Access validation failed' });
    }
});
exports.validateChapterAccess = validateChapterAccess;
// Middleware to log image access
const logImageAccess = (req, res, next) => {
    const userAgent = req.get('User-Agent') || 'unknown';
    const ip = req.ip || 'unknown';
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Image Access: ${req.originalUrl} | IP: ${ip} | User-Agent: ${userAgent}`);
    next();
};
exports.logImageAccess = logImageAccess;
// Middleware to prevent direct image access
const preventDirectAccess = (req, res, next) => {
    const referer = req.get('Referer');
    const origin = req.get('Origin');
    // Allow access from your domains
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://yourdomain.com' // Add your production domain
    ];
    const isAllowedOrigin = allowedOrigins.some(allowedOrigin => (origin === null || origin === void 0 ? void 0 : origin.startsWith(allowedOrigin)) || (referer === null || referer === void 0 ? void 0 : referer.startsWith(allowedOrigin)));
    if (!isAllowedOrigin && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Direct access not allowed' });
    }
    next();
};
exports.preventDirectAccess = preventDirectAccess;
// Security headers for images
const imageSecurityHeaders = (req, res, next) => {
    // Prevent caching of sensitive images
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    // Prevent embedding in other sites
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    // Prevent content type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
};
exports.imageSecurityHeaders = imageSecurityHeaders;
const getWatermarkConfig = (userId) => {
    return {
        text: `${userId ? `User: ${userId}` : 'Shala Shikshak'} - ${new Date().toLocaleDateString()}`,
        fontSize: 24,
        opacity: 0.1,
        angle: -45,
        color: '#000000'
    };
};
exports.getWatermarkConfig = getWatermarkConfig;
// Error handling for file operations
class FileOperationError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'FileOperationError';
    }
}
exports.FileOperationError = FileOperationError;
// Utility function to validate file types
const validateFileType = (mimetype, allowedTypes) => {
    return allowedTypes.includes(mimetype);
};
exports.validateFileType = validateFileType;
// Utility function to generate safe filenames
const generateSafeFilename = (originalName) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}-${randomString}.${extension}`;
};
exports.generateSafeFilename = generateSafeFilename;
// Utility function to format file size
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
// Utility function to validate image dimensions
const validateImageDimensions = (width, height) => {
    const maxWidth = 4096;
    const maxHeight = 4096;
    const minWidth = 100;
    const minHeight = 100;
    return width >= minWidth && width <= maxWidth && height >= minHeight && height <= maxHeight;
};
exports.validateImageDimensions = validateImageDimensions;
