import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { prisma } from '../index.js';
import authMiddleware from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/feed');
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
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

/**
 * POST /api/feed/upload-media
 * Upload media file for post
 */
router.post('/upload-media', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mediaUrl = `/uploads/feed/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    res.json({ mediaUrl, mediaType });
  } catch (error) {
    console.error('[FEED_UPLOAD_ERROR]', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

/**
 * GET /api/feed
 * Get all posts with author info, ordered by newest first
 */
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    console.error('[FEED_GET_ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

/**
 * POST /api/feed
 * Create a new post
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, mediaUrl, mediaType } = req.body;
    const userId = req.auth.userId;

    // Content is optional if media is provided
    if ((!content || content.trim().length === 0) && !mediaUrl) {
      return res.status(400).json({ error: 'Post content or media is required' });
    }

    // Get or create user
    let user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const post = await prisma.post.create({
      data: {
        content: content?.trim() || '',
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || 'image',
        authorId: user.id
      },
      include: {
        author: {
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

    res.status(201).json(post);
  } catch (error) {
    console.error('[FEED_POST_ERROR]', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

/**
 * DELETE /api/feed/:postId
 * Delete a post (only by author)
 */
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.auth.userId;

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // Delete associated media file if exists
    if (post.mediaUrl) {
      const filePath = path.join(__dirname, '../../', post.mediaUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('[FEED_DELETE_ERROR]', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

/**
 * PUT /api/feed/:postId
 * Update a post (only by author)
 */
router.put('/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.auth.userId;

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content cannot be empty' });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { content: content.trim() },
      include: {
        author: {
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

    res.json(updatedPost);
  } catch (error) {
    console.error('[FEED_UPDATE_ERROR]', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

/**
 * POST /api/feed/:postId/like
 * Toggle like on a post
 */
router.post('/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.auth.userId;

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });
      res.json({ liked: false });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          postId
        }
      });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('[FEED_LIKE_ERROR]', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

export default router;
