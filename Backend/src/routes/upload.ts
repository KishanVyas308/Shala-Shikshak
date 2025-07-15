import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth';
import GoogleDriveService from '../services/googleDrive';

const router = express.Router();
const driveService = GoogleDriveService.getInstance();

// Configure multer for memory storage (we'll upload to Google Drive, not local storage)
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
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Upload PDF file to Google Drive (admin only)
router.post('/pdf', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const fileName = `${req.file.fieldname}-${uniqueSuffix}${ext}`;

    // Upload to Google Drive
    const driveFile = await driveService.uploadPDF(
      req.file.buffer,
      fileName,
      req.file.originalname
    );

    res.json({
      message: 'File uploaded successfully to Google Drive',
      fileId: driveFile.id,
      fileName: driveFile.name,
      originalName: req.file.originalname,
      size: driveFile.size,
      viewingUrl: driveService.getPublicViewingLink(driveFile.id),
      embeddedUrl: driveService.getEmbeddedViewerLink(driveFile.id),
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Delete file from Google Drive (admin only)
router.delete('/pdf/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Delete from Google Drive
    await driveService.deleteFile(fileId);

    res.json({ message: 'File deleted successfully from Google Drive' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'File deletion failed' });
  }
});

// Get file info from Google Drive (admin only)
router.get('/pdf/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;

    const fileInfo = await driveService.getFileInfo(fileId);

    res.json({
      ...fileInfo,
      viewingUrl: driveService.getPublicViewingLink(fileId),
      embeddedUrl: driveService.getEmbeddedViewerLink(fileId),
    });
  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

// Error handling middleware for multer
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
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

export default router;
