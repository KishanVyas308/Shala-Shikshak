import express from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { chapterResourceSchema, chapterResourceUpdateSchema } from '../utils/validation';
import { LocalFileService } from '../services/localFileService';

const router = express.Router();
const fileService = LocalFileService.getInstance();

// Configure multer for file uploads (30MB limit)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files for upload
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for upload'));
    }
  }
});

// Utility function to safely delete a local file
const deleteLocalFileIfExists = async (fileUrl: string | null) => {
  if (!fileUrl) return;
  
  try {
    await fileService.deleteFile(fileUrl);
    console.log(`Successfully deleted local file: ${fileUrl}`);
  } catch (error) {
    console.error(`Error deleting local file ${fileUrl}:`, error);
    // Don't throw error - we don't want file deletion failure to prevent resource deletion
  }
};

// Get all resources for a chapter (public)
router.get('/chapter/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params;

    const resources = await prisma.chapterResource.findMany({
      where: { chapterId },
      orderBy: { createdAt: 'desc' },
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
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
        },
      },
    });

    // Group resources by type
    const groupedResources = {
      svadhyay: resources.filter(r => r.type === 'svadhyay'),
      svadhyay_pothi: resources.filter(r => r.type === 'svadhyay_pothi'),
      other: resources.filter(r => r.type === 'other'),
    };

    res.json(groupedResources);
  } catch (error) {
    console.error('Get chapter resources error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single resource by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await prisma.chapterResource.findUnique({
      where: { id },
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
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
        },
      },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create chapter resource (admin only)
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { error, value } = chapterResourceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { 
      title, 
      description, 
      type, 
      resourceType, 
      url, 
      fileName, 
      chapterId 
    } = value;

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      return res.status(400).json({ error: 'Chapter not found' });
    }

    let finalUrl = url;
    let finalFileName = fileName;

    // If file is uploaded, save it and use the local URL
    if (req.file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(req.file.originalname);
      const generatedFileName = `chapter-${chapterId}-${type}-${uniqueSuffix}${ext}`;
      
      const uploadedFile = await fileService.uploadPDF(
        req.file.buffer,
        generatedFileName,
        req.file.originalname
      );
      
      finalUrl = uploadedFile.url;
      finalFileName = uploadedFile.name;
    }

    const resource = await prisma.chapterResource.create({
      data: {
        title,
        description,
        type,
        resourceType,
        url: finalUrl,
        fileName: finalFileName,
        chapterId,
      },
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
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
        },
      },
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Create chapter resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update chapter resource (admin only)
router.put('/:id', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const value = req.body;


    // Check if resource exists
    const existingResource = await prisma.chapterResource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    let finalUrl = value.url || existingResource.url;
    let finalFileName = existingResource.fileName;

    // If new file is uploaded
    if (req.file) {
      // Delete old file if it was uploaded (not external URL)
      if (existingResource.fileName && existingResource.url.includes('/uploads/')) {
        try {
          await fileService.deleteFile(existingResource.fileName);
        } catch (error) {
          console.warn('Failed to delete old file:', error);
        }
      }
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(req.file.originalname);
      const generatedFileName = `chapter-${existingResource.chapterId}-${value.type || existingResource.type}-${uniqueSuffix}${ext}`;
      
      const uploadedFile = await fileService.uploadPDF(
        req.file.buffer,
        generatedFileName,
        req.file.originalname
      );
      
      finalUrl = uploadedFile.url;
      finalFileName = uploadedFile.name;
    }

    // Clean up old file if URL is being replaced and it's a PDF
    if (value.url && value.url !== existingResource.url && existingResource.resourceType === 'pdf') {
      await deleteLocalFileIfExists(existingResource.url);
    }

    const updatedResource = await prisma.chapterResource.update({
      where: { id },
      data: {
        ...value,
        url: finalUrl,
        fileName: finalFileName,
      },
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
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
        },
      },
    });

    res.json(updatedResource);
  } catch (error) {
    console.error('Update chapter resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete chapter resource (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await prisma.chapterResource.findUnique({
      where: { id },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Delete associated file if it's a PDF
    if (resource.resourceType === 'pdf' && resource.url) {
      await deleteLocalFileIfExists(resource.url);
    }

    // Delete the resource from database
    await prisma.chapterResource.delete({
      where: { id },
    });

    res.json({ 
      message: 'Resource and associated files deleted successfully' 
    });
  } catch (error) {
    console.error('Delete chapter resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove file from resource (admin only) - keeps resource but removes file
router.delete('/:id/file', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await prisma.chapterResource.findUnique({
      where: { id },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    if (!resource.fileName) {
      return res.status(400).json({ error: 'Resource has no uploaded file to remove' });
    }

    // Delete the physical file
    if (resource.url) {
      await deleteLocalFileIfExists(resource.url);
    }

    // Update resource to remove file references
    const updatedResource = await prisma.chapterResource.update({
      where: { id },
      data: {
        url: '',
        fileName: null,
      },
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
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
        },
      },
    });

    res.json(updatedResource);
  } catch (error) {
    console.error('Remove file from resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get resources grouped by type for a chapter (public)
router.get('/chapter/:chapterId/grouped', async (req, res) => {
  try {
    const { chapterId } = req.params;

    // First verify the chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        subject: {
          include: {
            standard: true,
          },
        },
      },
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Get all resources for this chapter
    const resources = await prisma.chapterResource.findMany({
      where: { chapterId },
      orderBy: { createdAt: 'desc' },
    });

    // Group resources by type
    const groupedResources = {
      svadhyay: resources.filter(r => r.type === 'svadhyay'),
      svadhyay_pothi: resources.filter(r => r.type === 'svadhyay_pothi'),
      other: resources.filter(r => r.type === 'other'),
    };

    // Calculate counts
    const counts = {
      svadhyay: groupedResources.svadhyay.length,
      svadhyay_pothi: groupedResources.svadhyay_pothi.length,
      other: groupedResources.other.length,
      total: resources.length,
    };

    res.json({
      chapter: {
        id: chapter.id,
        name: chapter.name,
        subject: chapter.subject,
      },
      resources: groupedResources,
      counts,
    });
  } catch (error) {
    console.error('Get grouped chapter resources error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
