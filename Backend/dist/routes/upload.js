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
const localFileService_1 = require("../services/localFileService");
const pdfCompressor_1 = require("../utils/pdfCompressor");
const router = express_1.default.Router();
const fileService = localFileService_1.LocalFileService.getInstance();
// Configure multer for memory storage
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
        fileSize: 30 * 1024 * 1024, // 30MB limit
    },
});
// Upload PDF file locally (admin only)
router.post('/pdf', auth_1.authenticateToken, upload.single('pdf'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Check if compression is requested (default: true for files > 2MB)
        const shouldCompress = req.body.compress !== 'false' || req.file.size > 2 * 1024 * 1024;
        // Check if Ghostscript is available for compression
        const ghostscriptAvailable = yield (0, pdfCompressor_1.checkGhostscriptAvailability)();
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(req.file.originalname);
        const fileName = `${req.file.fieldname}-${uniqueSuffix}${ext}`;
        // If compression is disabled, not available, or file is small, upload directly
        if (!shouldCompress || !ghostscriptAvailable) {
            const localFile = yield fileService.uploadPDF(req.file.buffer, fileName, req.file.originalname);
            const message = !ghostscriptAvailable
                ? 'File uploaded successfully (Ghostscript not available for compression)'
                : 'File uploaded successfully (no compression)';
            res.json({
                message,
                fileId: localFile.id,
                fileName: localFile.name,
                originalName: req.file.originalname,
                size: localFile.size,
                url: localFile.url,
                filePath: localFile.filePath,
                // Add compatibility fields for existing frontend
                viewingUrl: localFile.url,
                embeddedUrl: localFile.url,
            });
            return;
        }
        // First, save the original file temporarily
        const tempFile = yield fileService.uploadPDF(req.file.buffer, `temp-${fileName}`, req.file.originalname);
        try {
            // Compress the PDF
            const compressedFileName = `compressed-${fileName}`;
            const compressedFilePath = path_1.default.join(path_1.default.dirname(tempFile.filePath), compressedFileName);
            const compressionResult = yield (0, pdfCompressor_1.compressPDF)(tempFile.filePath, compressedFilePath);
            if (!compressionResult.success) {
                throw new Error(compressionResult.error || 'Compression failed');
            }
            // Read the compressed file
            const fs = require('fs').promises;
            const compressedBuffer = yield fs.readFile(compressedFilePath);
            // Save the compressed file with the final name
            const finalFile = yield fileService.uploadPDF(compressedBuffer, fileName, req.file.originalname);
            // Clean up temporary files
            yield fileService.deleteFile(tempFile.filePath);
            yield fs.unlink(compressedFilePath);
            console.log(`PDF compressed: Original size: ${compressionResult.originalSize} bytes, Compressed size: ${compressionResult.compressedSize} bytes, Ratio: ${compressionResult.compressionRatio}%`);
            res.json({
                message: 'File uploaded and compressed successfully',
                fileId: finalFile.id,
                fileName: finalFile.name,
                originalName: req.file.originalname,
                size: finalFile.size,
                originalSize: compressionResult.originalSize.toString(),
                compressionRatio: `${compressionResult.compressionRatio}%`,
                url: finalFile.url,
                filePath: finalFile.filePath,
                // Add compatibility fields for existing frontend
                viewingUrl: finalFile.url,
                embeddedUrl: finalFile.url,
            });
        }
        catch (compressionError) {
            console.warn('PDF compression failed, using original file:', compressionError);
            // If compression fails, use the original file
            res.json({
                message: 'File uploaded successfully (compression failed, using original)',
                fileId: tempFile.id,
                fileName: tempFile.name,
                originalName: req.file.originalname,
                size: tempFile.size,
                url: tempFile.url,
                filePath: tempFile.filePath,
                // Add compatibility fields for existing frontend
                viewingUrl: tempFile.url,
                embeddedUrl: tempFile.url,
            });
        }
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
}));
// Delete file locally (admin only)
router.delete('/pdf/:fileId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileId } = req.params;
        // Delete locally (fileId in this case is the filename or path)
        yield fileService.deleteFile(fileId);
        res.json({ message: 'File deleted successfully' });
    }
    catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'File deletion failed' });
    }
}));
// Get file info locally (admin only)
router.get('/pdf/:fileId', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileId } = req.params;
        const fileInfo = yield fileService.getFileInfo(fileId);
        if (!fileInfo) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.json(fileInfo);
    }
    catch (error) {
        console.error('Get file info error:', error);
        res.status(500).json({ error: 'Failed to get file info' });
    }
}));
// List all uploaded files (admin only)
router.get('/files', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield fileService.listFiles();
        res.json({ files });
    }
    catch (error) {
        console.error('List files error:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
}));
// Check Ghostscript availability for PDF compression
router.get('/compression-status', auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isAvailable = yield (0, pdfCompressor_1.checkGhostscriptAvailability)();
        res.json({
            ghostscriptAvailable: isAvailable,
            compressionEnabled: isAvailable,
            message: isAvailable
                ? 'PDF compression is available and enabled'
                : 'PDF compression is disabled - Ghostscript not found'
        });
    }
    catch (error) {
        console.error('Compression status check error:', error);
        res.status(500).json({
            ghostscriptAvailable: false,
            compressionEnabled: false,
            error: 'Failed to check compression status'
        });
    }
}));
exports.default = router;
