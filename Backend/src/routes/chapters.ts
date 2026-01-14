import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { chapterSchema, chapterUpdateSchema } from '../utils/validation';

const router = express.Router();

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
            textbookUrl: true,
            standard: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        resources: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            resources: true,
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

// Get single chapter by ID with resources (public)
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
            textbookUrl: true,
            standard: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        resources: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Group resources by type for easier frontend consumption
    const groupedResources = {
      svadhyay: chapter.resources.filter(r => r.type === 'svadhyay'),
      svadhyay_pothi: chapter.resources.filter(r => r.type === 'svadhyay_pothi'),
      other: chapter.resources.filter(r => r.type === 'other'),
    };

    res.json({
      ...chapter,
      groupedResources,
    });
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

    const { name, description, subjectId } = value;

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return res.status(400).json({ error: 'Subject not found' });
    }

    // Get the highest order number for this subject
    const lastChapter = await prisma.chapter.findFirst({
      where: { subjectId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = lastChapter ? lastChapter.order + 1 : 0;

    const chapter = await prisma.chapter.create({
      data: {
        name,
        description,
        subjectId,
        order: nextOrder,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            textbookUrl: true,
            standard: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        resources: true,
        _count: {
          select: {
            resources: true,
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
    const value =  req.body
    
   

    // Check if chapter exists
    const existingChapter = await prisma.chapter.findUnique({
      where: { id },
    });

    if (!existingChapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const updatedChapter = await prisma.chapter.update({
      where: { id },
      data: value,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            textbookUrl: true,
            standard: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        resources: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            resources: true,
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

// Reorder chapters (admin only)
router.put('/reorder/:subjectId', authenticateToken, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { chapterIds } = req.body; // Array of chapter IDs in new order

    if (!Array.isArray(chapterIds) || chapterIds.length === 0) {
      return res.status(400).json({ error: 'chapterIds must be a non-empty array' });
    }

    // Verify all chapters belong to this subject
    const chapters = await prisma.chapter.findMany({
      where: {
        id: { in: chapterIds },
        subjectId,
      },
    });

    if (chapters.length !== chapterIds.length) {
      return res.status(400).json({ error: 'Some chapters do not belong to this subject' });
    }

    // Update order for each chapter
    const updatePromises = chapterIds.map((chapterId, index) =>
      prisma.chapter.update({
        where: { id: chapterId },
        data: { order: index },
      })
    );

    await Promise.all(updatePromises);

    // Fetch updated chapters
    const updatedChapters = await prisma.chapter.findMany({
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
        resources: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });

    res.json(updatedChapters);
  } catch (error) {
    console.error('Reorder chapters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete chapter (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        resources: true,
      },
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Delete the chapter from database (this will cascade delete resources)
    await prisma.chapter.delete({
      where: { id },
    });

    res.json({ 
      message: 'Chapter and associated resources deleted successfully' 
    });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
