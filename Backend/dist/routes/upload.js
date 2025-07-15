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
