import express from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { chapterSchema, chapterUpdateSchema } from '../utils/validation';

const router = express.Router();

// Utility function to safely delete a file
const deleteFileIfExists = (filePath: string | null) => {
  if (!filePath) return;
  
  try {
    // Extract filename from URL path (e.g., "/uploads/filename.pdf" -> "filename.pdf")
    const filename = path.basename(filePath);
    
    // Skip if no valid filename
    if (!filename || filename === '.' || filename === '..') {
      console.warn(`Invalid filename extracted from path: ${filePath}`);
      return;
    }
    
    const fullPath = path.join(process.cwd(), 'uploads', filename);
    
    // Check if file exists before attempting to delete
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Successfully deleted file: ${fullPath}`);
    } else {
      console.warn(`File not found for deletion: ${fullPath}`);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
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

    const { name, description, order, subjectId, videoUrl, solutionPdfUrl, textbookPdfUrl } = value;

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
        textbookPdfUrl,
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
    if (value.textbookPdfUrl && value.textbookPdfUrl !== existingChapter.textbookPdfUrl) {
      deleteFileIfExists(existingChapter.textbookPdfUrl);
    }
    
    if (value.solutionPdfUrl && value.solutionPdfUrl !== existingChapter.solutionPdfUrl) {
      deleteFileIfExists(existingChapter.solutionPdfUrl);
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
    if (chapter.textbookPdfUrl) {
      deleteFileIfExists(chapter.textbookPdfUrl);
    }
    
    if (chapter.solutionPdfUrl) {
      deleteFileIfExists(chapter.solutionPdfUrl);
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
