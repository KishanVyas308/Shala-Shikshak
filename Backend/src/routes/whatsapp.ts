import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get active WhatsApp link (public route)
router.get('/active', async (req, res) => {
  try {
    const activeLink = await prisma.whatsAppLink.findFirst({
      where: {
        isActive: true
      }
    });

    res.json({
      success: true,
      data: activeLink
    });
  } catch (error) {
    console.error('Error fetching active WhatsApp link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active WhatsApp link'
    });
  }
});

// Get all WhatsApp links (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const links = await prisma.whatsAppLink.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Error fetching WhatsApp links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch WhatsApp links'
    });
  }
});

// Create new WhatsApp link (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Name and URL are required'
      });
    }

    // Validate WhatsApp URL format
    const whatsappUrlPattern = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/;
    if (!whatsappUrlPattern.test(url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid WhatsApp group invite URL format'
      });
    }

    const newLink = await prisma.whatsAppLink.create({
      data: {
        name,
        description,
        url,
        isActive: false
      }
    });

    res.status(201).json({
      success: true,
      data: newLink,
      message: 'WhatsApp link created successfully'
    });
  } catch (error) {
    console.error('Error creating WhatsApp link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create WhatsApp link'
    });
  }
});

// Update WhatsApp link (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Name and URL are required'
      });
    }

    // Validate WhatsApp URL format
    const whatsappUrlPattern = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/;
    if (!whatsappUrlPattern.test(url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid WhatsApp group invite URL format'
      });
    }

    const updatedLink = await prisma.whatsAppLink.update({
      where: { id },
      data: {
        name,
        description,
        url
      }
    });

    res.json({
      success: true,
      data: updatedLink,
      message: 'WhatsApp link updated successfully'
    });
  } catch (error) {
    console.error('Error updating WhatsApp link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update WhatsApp link'
    });
  }
});

// Set active WhatsApp link (admin only)
router.patch('/:id/activate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // First, deactivate all links
    await prisma.whatsAppLink.updateMany({
      data: {
        isActive: false
      }
    });

    // Then activate the selected link
    const activatedLink = await prisma.whatsAppLink.update({
      where: { id },
      data: {
        isActive: true
      }
    });

    res.json({
      success: true,
      data: activatedLink,
      message: 'WhatsApp link activated successfully'
    });
  } catch (error) {
    console.error('Error activating WhatsApp link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate WhatsApp link'
    });
  }
});

// Deactivate all WhatsApp links (admin only)
router.patch('/deactivate-all', authenticateToken, async (req, res) => {
  try {
    await prisma.whatsAppLink.updateMany({
      data: {
        isActive: false
      }
    });

    res.json({
      success: true,
      message: 'All WhatsApp links deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating WhatsApp links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate WhatsApp links'
    });
  }
});

// Delete WhatsApp link (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.whatsAppLink.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'WhatsApp link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting WhatsApp link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete WhatsApp link'
    });
  }
});

export default router;
