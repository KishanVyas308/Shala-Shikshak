import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { chapterSchema, chapterUpdateSchema } from '../utils/validation';
import { LocalFileService } from '../services/localFileService';
import * as fs from 'fs';

const router = express.Router();
const fileService = LocalFileService.getInstance();

// Utility function to safely delete a local file
const deleteLocalFileIfExists = async (fileUrl: string | null) => {
  if (!fileUrl) return;
  
  try {
    await fileService.deleteFile(fileUrl);
    console.log(`Successfully deleted local file: ${fileUrl}`);
  } catch (error) {
    console.error(`Error deleting local file ${fileUrl}:`, error);
    // Don't throw error - we don't want file deletion failure to prevent chapter deletion
  }
};

// Get all chapters for a subject (public)
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;

    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
      orderBy: { createdAt: 'desc' },
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
      subjectId, 
      videoUrl, 
      solutionPdfUrl, 
      solutionPdfFileName, 
      textbookPdfUrl, 
      textbookPdfFileName 
    } = value;

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return res.status(400).json({ error: 'Subject not found' });
    }

    const chapter = await prisma.chapter.create({
      data: {
        name,
        description,
        subjectId,
        videoUrl,
        solutionPdfUrl,
        solutionPdfFileName,
        textbookPdfUrl,
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

    // Clean up old PDF files if they're being replaced
    if (value.textbookPdfUrl && value.textbookPdfUrl !== existingChapter.textbookPdfUrl) {
      await deleteLocalFileIfExists(existingChapter.textbookPdfUrl);
    }
    
    if (value.solutionPdfUrl && value.solutionPdfUrl !== existingChapter.solutionPdfUrl) {
      await deleteLocalFileIfExists(existingChapter.solutionPdfUrl);
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
      await deleteLocalFileIfExists(chapter.textbookPdfUrl);
    }
    
    if (chapter.solutionPdfUrl) {
      await deleteLocalFileIfExists(chapter.solutionPdfUrl);
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

export default router;
