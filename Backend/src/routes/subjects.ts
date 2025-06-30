import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { subjectSchema, subjectUpdateSchema } from '../utils/validation';

const router = express.Router();

// Get all subjects for a standard (public)
router.get('/standard/:standardId', async (req, res) => {
  try {
    const { standardId } = req.params;

    const subjects = await prisma.subject.findMany({
      where: { standardId },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            name: true,
            order: true,
            videoUrl: true,
            solutionPdfUrl: true,
            textbookPdfUrl: true,
          },
        },
        standard: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { chapters: true },
        },
      },
    });

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single subject by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
        },
        standard: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create subject (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = subjectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, order, standardId } = value;

    // Check if standard exists
    const standard = await prisma.standard.findUnique({
      where: { id: standardId },
    });

    if (!standard) {
      return res.status(400).json({ error: 'Standard not found' });
    }

    // Check if subject already exists for this standard
    const existingSubject = await prisma.subject.findUnique({
      where: {
        name_standardId: {
          name,
          standardId,
        },
      },
    });

    if (existingSubject) {
      return res.status(400).json({ 
        error: 'Subject with this name already exists for this standard' 
      });
    }

    // Check if order already exists for this standard
    const existingOrder = await prisma.subject.findUnique({
      where: {
        order_standardId: {
          order,
          standardId,
        },
      },
    });

    if (existingOrder) {
      return res.status(400).json({ 
        error: 'Order already exists for this standard' 
      });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        description,
        order,
        standardId,
      },
      include: {
        standard: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { chapters: true },
        },
      },
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update subject (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = subjectUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id },
    });

    if (!existingSubject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Check for name conflict if updating name
    if (value.name && value.name !== existingSubject.name) {
      const nameConflict = await prisma.subject.findUnique({
        where: {
          name_standardId: {
            name: value.name,
            standardId: existingSubject.standardId,
          },
        },
      });
      if (nameConflict) {
        return res.status(400).json({ 
          error: 'Subject with this name already exists for this standard' 
        });
      }
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: value,
      include: {
        standard: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { chapters: true },
        },
      },
    });

    res.json(updatedSubject);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete subject (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        _count: {
          select: { chapters: true },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    if (subject._count.chapters > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete subject with associated chapters. Delete chapters first.' 
      });
    }

    await prisma.subject.delete({
      where: { id },
    });

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch reorder subjects (admin only)
router.put('/batch/reorder', authenticateToken, async (req, res) => {
  try {
    const { subjects } = req.body;

    if (!Array.isArray(subjects)) {
      return res.status(400).json({ error: 'Subjects must be an array' });
    }

    // Validate that all subjects have id and order
    for (const subject of subjects) {
      if (!subject.id || typeof subject.order !== 'number') {
        return res.status(400).json({ 
          error: 'Each subject must have an id and order' 
        });
      }
    }

    // Use a transaction to update all subjects atomically
    await prisma.$transaction(async (tx) => {
      for (const subject of subjects) {
        await tx.subject.update({
          where: { id: subject.id },
          data: { order: subject.order },
        });
      }
    });

    res.json({ message: 'Subjects reordered successfully' });
  } catch (error) {
    console.error('Batch reorder subjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
