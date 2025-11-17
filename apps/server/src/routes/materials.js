import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { prisma } from '../index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/materials');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow common document and media types
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|png|jpg|jpeg|gif|mp4|mp3|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, DOC, PPT, XLS, images, videos, ZIP'));
    }
  }
});

/**
 * GET /api/materials
 * Get all materials (public access)
 */
router.get('/', async (req, res) => {
  try {
    const materials = await prisma.material.findMany({
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(materials);
  } catch (error) {
    console.error('[MATERIALS_GET_ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

/**
 * POST /api/materials
 * Upload new material (requires auth)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, url, filePath, category } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!title || (!url && !filePath)) {
      return res.status(400).json({ error: 'Title and either URL or file path required' });
    }

    const material = await prisma.material.create({
      data: {
        title: title.trim(),
        url: url || null,
        filePath: filePath || null,
        category: category || 'notes',
        uploaderId: userId
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('[MATERIALS_POST_ERROR]', error);
    res.status(500).json({ error: 'Failed to upload material' });
  }
});

/**
 * POST /api/materials/upload
 * Upload file from device (requires auth)
 */
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, category } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Store relative path for serving
    const filePath = `/uploads/materials/${req.file.filename}`;
    const fileSize = req.file.size;
    const fileType = path.extname(req.file.originalname).substring(1);

    const material = await prisma.material.create({
      data: {
        title: title.trim(),
        filePath,
        fileSize,
        fileType,
        fileName: req.file.originalname,
        category: category || 'notes',
        uploaderId: userId
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('[MATERIALS_FILE_UPLOAD_ERROR]', error);
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
});

/**
 * GET /api/materials/:materialId
 * Get single material by ID
 */
router.get('/:materialId', async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('[MATERIALS_GET_SINGLE_ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

/**
 * DELETE /api/materials/:materialId
 * Delete material (only by uploader, requires auth)
 */
router.delete('/:materialId', authMiddleware, async (req, res) => {
  try {
    const { materialId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const material = await prisma.material.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (material.uploaderId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this material' });
    }

    await prisma.material.delete({
      where: { id: materialId }
    });

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('[MATERIALS_DELETE_ERROR]', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

export default router;
