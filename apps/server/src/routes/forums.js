import express from 'express';
import { prisma } from '../index.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/forums
 * Get all forum threads with author info
 */
router.get('/', async (req, res) => {
  try {
    const threads = await prisma.thread.findMany({
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
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(threads);
  } catch (error) {
    console.error('[FORUMS_GET_ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch forums' });
  }
});

/**
 * POST /api/forums
 * Create a new thread (requires auth)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, body, category } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const thread = await prisma.thread.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        category: category || 'general',
        authorId: userId
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

    res.status(201).json(thread);
  } catch (error) {
    console.error('[FORUMS_POST_ERROR]', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

/**
 * GET /api/forums/:threadId
 * Get single thread with all comments
 */
router.get('/:threadId', async (req, res) => {
  try {
    const { threadId } = req.params;

    // Increment view count
    await prisma.thread.update({
      where: { id: threadId },
      data: { views: { increment: 1 } }
    });

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
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
        comments: {
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
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json(thread);
  } catch (error) {
    console.error('[FORUMS_GET_THREAD_ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

/**
 * POST /api/forums/:threadId/comments
 * Add comment to thread (requires auth)
 */
router.post('/:threadId/comments', authMiddleware, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { body } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!body || body.trim().length === 0) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    const comment = await prisma.comment.create({
      data: {
        body: body.trim(),
        threadId,
        authorId: userId
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

    // Update thread's updatedAt
    await prisma.thread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('[FORUMS_COMMENT_ERROR]', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

/**
 * DELETE /api/forums/:threadId
 * Delete thread (only by author, requires auth)
 */
router.delete('/:threadId', authMiddleware, async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (thread.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this thread' });
    }

    // Delete comments first
    await prisma.comment.deleteMany({
      where: { threadId }
    });

    // Then delete thread
    await prisma.thread.delete({
      where: { id: threadId }
    });

    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('[FORUMS_DELETE_ERROR]', error);
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

export default router;
