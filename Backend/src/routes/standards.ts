import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { standardSchema, standardUpdateSchema } from '../utils/validation';

const router = express.Router();

// Get all standards (public)
router.get('/', async (req, res) => {
  try {
    const standards = await prisma.standard.findMany({
      orderBy: { order: 'asc' },
      include: {
        subjects: {
          orderBy: { createdAt: 'desc' },
          include: {
            chapters: {
              orderBy: { createdAt: 'desc' },
              include: {
                _count: {
                  select: {
                    resources: true,
                  }
                }
              }
            },
          },
        },
        _count: {
          select: { subjects: true },
        },
      },
    });

    res.json(standards);
  } catch (error) {
    console.error('Get standards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single standard by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const standard = await prisma.standard.findUnique({
      where: { id },
      include: {
        subjects: {
          orderBy: { createdAt: 'desc' },
          include: {
            chapters: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!standard) {
      return res.status(404).json({ error: 'Standard not found' });
    }

    res.json(standard);
  } catch (error) {
    console.error('Get standard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create standard (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = standardSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, order } = value;

    // Check if order already exists
    const existingOrder = await prisma.standard.findUnique({
      where: { order },
    });

    if (existingOrder) {
      return res.status(400).json({ error: 'Order already exists' });
    }

    // Check if name already exists
    const existingName = await prisma.standard.findUnique({
      where: { name },
    });

    if (existingName) {
      return res.status(400).json({ error: 'Standard with this name already exists' });
    }

    const standard = await prisma.standard.create({
      data: {
        name,
        description,
        order,
      },
      include: {
        _count: {
          select: { subjects: true },
        },
      },
    });

    res.status(201).json(standard);
  } catch (error) {
    console.error('Create standard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update standard (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = standardUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if standard exists
    const existingStandard = await prisma.standard.findUnique({
      where: { id },
    });

    if (!existingStandard) {
      return res.status(404).json({ error: 'Standard not found' });
    }

    // Check for conflicts if updating name or order
    if (value.name && value.name !== existingStandard.name) {
      const nameConflict = await prisma.standard.findUnique({
        where: { name: value.name },
      });
      if (nameConflict) {
        return res.status(400).json({ error: 'Standard with this name already exists' });
      }
    }

    if (value.order && value.order !== existingStandard.order) {
      const orderConflict = await prisma.standard.findUnique({
        where: { order: value.order },
      });
      if (orderConflict) {
        return res.status(400).json({ error: 'Order already exists' });
      }
    }

    const updatedStandard = await prisma.standard.update({
      where: { id },
      data: value,
      include: {
        _count: {
          select: { subjects: true },
        },
      },
    });

    res.json(updatedStandard);
  } catch (error) {
    console.error('Update standard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete standard (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const standard = await prisma.standard.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subjects: true },
        },
      },
    });

    if (!standard) {
      return res.status(404).json({ error: 'Standard not found' });
    }

    if (standard._count.subjects > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete standard with associated subjects. Delete subjects first.' 
      });
    }

    await prisma.standard.delete({
      where: { id },
    });

    res.json({ message: 'Standard deleted successfully' });
  } catch (error) {
    console.error('Delete standard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch update order (admin only) - for drag and drop reordering
router.put('/batch/reorder', authenticateToken, async (req, res) => {
  try {
    const { standards } = req.body;

    if (!Array.isArray(standards)) {
      return res.status(400).json({ error: 'Standards array is required' });
    }

    // Validate that all items have id and order
    for (const item of standards) {
      if (!item.id || typeof item.order !== 'number') {
        return res.status(400).json({ error: 'Each item must have id and order' });
      }
    }

    // Use a transaction to update all orders atomically
    await prisma.$transaction(async (tx) => {
      // First, set all orders to negative values to avoid conflicts
      for (let i = 0; i < standards.length; i++) {
        await tx.standard.update({
          where: { id: standards[i].id },
          data: { order: -(i + 1) },
        });
      }

      // Then set the actual orders
      for (const item of standards) {
        await tx.standard.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
    });

    // Fetch updated standards
    const updatedStandards = await prisma.standard.findMany({
      orderBy: { order: 'asc' },
      include: {
        subjects: {
          include: {
            chapters: {
              orderBy: { createdAt: 'asc' },
              include: {
                _count: {
                  select: {
                    resources: true,
                  }
                }
              }
            },
          },
        },
        _count: {
          select: { subjects: true },
        },
      },
    });

    res.json(updatedStandards);
  } catch (error) {
    console.error('Batch reorder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
