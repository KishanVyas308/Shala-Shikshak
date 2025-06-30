"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
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
    // No file size limit
});
// Upload PDF file (admin only)
router.post('/pdf', auth_1.authenticateToken, upload.single('pdf'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            message: 'File uploaded successfully',
            url: fileUrl,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});
// Delete uploaded file (admin only)
router.delete('/pdf/:filename', auth_1.authenticateToken, (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(uploadsDir, filename);
        // Check if file exists
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        // Delete file
        fs_1.default.unlinkSync(filePath);
        res.json({ message: 'File deleted successfully' });
    }
    catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({ error: 'File deletion failed' });
    }
});
// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        return res.status(400).json({ error: 'File upload error: ' + error.message });
    }
    if (error.message === 'Only PDF files are allowed') {
        return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    next(error);
});
exports.default = router;
