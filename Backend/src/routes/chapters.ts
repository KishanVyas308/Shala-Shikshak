import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { chapterSchema, chapterUpdateSchema } from '../utils/validation';
import GoogleDriveService from '../services/googleDrive';

const router = express.Router();
const driveService = GoogleDriveService.getInstance();

// Utility function to safely delete a file from Google Drive
const deleteGoogleDriveFileIfExists = async (fileId: string | null) => {
  if (!fileId) return;
  
  try {
    await driveService.deleteFile(fileId);
    console.log(`Successfully deleted file from Google Drive: ${fileId}`);
  } catch (error) {
    console.error(`Error deleting file from Google Drive ${fileId}:`, error);
    // Don't throw error - we don't want file deletion failure to prevent chapter deletion
  }
};

// Get all chapters for a subject (public)
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;

    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
      orderBy: { order: 'asc' },
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
      },
    });

    res.json(chapters);
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single chapter by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await prisma.chapter.findUnique({
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
      },
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    console.error('Get chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create chapter (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = chapterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { 
      name, 
      description, 
      order, 
      subjectId, 
      videoUrl, 
      solutionPdfUrl, 
      solutionPdfFileId, 
      solutionPdfFileName, 
      textbookPdfUrl, 
      textbookPdfFileId, 
      textbookPdfFileName 
    } = value;

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return res.status(400).json({ error: 'Subject not found' });
    }

    // Check if order already exists for this subject
    const existingOrder = await prisma.chapter.findUnique({
      where: {
        order_subjectId: {
          order,
          subjectId,
        },
      },
    });

    if (existingOrder) {
      return res.status(400).json({ 
        error: 'Chapter with this order already exists for this subject' 
      });
    }

    const chapter = await prisma.chapter.create({
      data: {
        name,
        description,
        order,
        subjectId,
        videoUrl,
        solutionPdfUrl,
        solutionPdfFileId,
        solutionPdfFileName,
        textbookPdfUrl,
        textbookPdfFileId,
        textbookPdfFileName,
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
      },
    });

    res.status(201).json(chapter);
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update chapter (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = chapterUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if chapter exists
    const existingChapter = await prisma.chapter.findUnique({
      where: { id },
    });

    if (!existingChapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Check for order conflict if updating order
    if (value.order && value.order !== existingChapter.order) {
      const orderConflict = await prisma.chapter.findUnique({
        where: {
          order_subjectId: {
            order: value.order,
            subjectId: existingChapter.subjectId,
          },
        },
      });
      if (orderConflict) {
        return res.status(400).json({ 
          error: 'Chapter with this order already exists for this subject' 
        });
      }
    }

    // Clean up old PDF files if they're being replaced
    if (value.textbookPdfFileId && value.textbookPdfFileId !== existingChapter.textbookPdfFileId) {
      await deleteGoogleDriveFileIfExists(existingChapter.textbookPdfFileId);
    }
    
    if (value.solutionPdfFileId && value.solutionPdfFileId !== existingChapter.solutionPdfFileId) {
      await deleteGoogleDriveFileIfExists(existingChapter.solutionPdfFileId);
    }

    const updatedChapter = await prisma.chapter.update({
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
      },
    });

    res.json(updatedChapter);
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete chapter (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await prisma.chapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Delete associated PDF files before deleting the chapter
    if (chapter.textbookPdfFileId) {
      await deleteGoogleDriveFileIfExists(chapter.textbookPdfFileId);
    }
    
    if (chapter.solutionPdfFileId) {
      await deleteGoogleDriveFileIfExists(chapter.solutionPdfFileId);
    }

    // Delete the chapter from database
    await prisma.chapter.delete({
      where: { id },
    });

    res.json({ 
      message: 'Chapter and associated files deleted successfully' 
    });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch reorder chapters (admin only)
router.put('/batch/reorder', authenticateToken, async (req, res) => {
  try {
    const { chapters } = req.body;

    if (!Array.isArray(chapters)) {
      return res.status(400).json({ error: 'Chapters must be an array' });
    }

    // Validate that all chapters have id and order
    for (const chapter of chapters) {
      if (!chapter.id || typeof chapter.order !== 'number') {
        return res.status(400).json({ 
          error: 'Each chapter must have an id and order' 
        });
      }
    }

    // Use a transaction to update all chapters atomically
    await prisma.$transaction(async (tx) => {
      for (const chapter of chapters) {
        await tx.chapter.update({
          where: { id: chapter.id },
          data: { order: chapter.order },
        });
      }
    });

    res.json({ message: 'Chapters reordered successfully' });
  } catch (error) {
    console.error('Batch reorder chapters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
