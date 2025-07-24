import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth';
import { LocalFileService } from '../services/localFileService';
import { prisma } from '../lib/prisma';

const router = express.Router();
const fileService = LocalFileService.getInstance();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB limit
  },
});

// Upload PDF file locally (admin only)
router.post('/pdf', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const fileName = `${req.file.fieldname}-${uniqueSuffix}${ext}`;

    // Save file locally
    const localFile = await fileService.uploadPDF(
      req.file.buffer,
      fileName,
      req.file.originalname
    );

    res.json({
      message: 'File uploaded successfully',
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
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Delete file locally (admin only)
router.delete('/pdf/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Delete locally (fileId in this case is the filename or path)
    await fileService.deleteFile(fileId);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'File deletion failed' });
  }
});

// Get file info locally (admin only)
router.get('/pdf/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const fileInfo = await fileService.getFileInfo(fileId);

    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(fileInfo);
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

// List all uploaded files (admin only)
router.get('/files', authenticateToken, async (req, res) => {
  try {
    const files = await fileService.listFiles();
    res.json({ files });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

export default router;
