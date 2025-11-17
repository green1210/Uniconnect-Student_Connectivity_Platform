import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// Get pending sync requests for current user
router.get('/requests', async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await prisma.syncRequest.findMany({
      where: { receiverId: userId, status: 'pending' },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });
    res.json(requests);
  } catch (err) {
    console.error('[SYNC_GET_REQUESTS]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Send sync request
router.post('/request/:userId', async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.userId;

    if (senderId === receiverId) {
      return res.status(400).json({ error: 'Cannot sync with yourself' });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already synced
    const existingSync = await prisma.sync.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId }
        ]
      }
    });

    if (existingSync) {
      return res.status(400).json({ error: 'Already synced with this user' });
    }

    // Check for existing request
    const existingRequest = await prisma.syncRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Sync request already exists' });
    }

    // Create sync request
    const syncRequest = await prisma.syncRequest.create({
      data: {
        senderId,
        receiverId
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        receiver: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(syncRequest);
  } catch (err) {
    console.error('[SYNC_CREATE_REQUEST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Accept sync request
router.post('/request/:requestId/accept', async (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.requestId;

    const syncRequest = await prisma.syncRequest.findUnique({
      where: { id: requestId }
    });

    if (!syncRequest) {
      return res.status(404).json({ error: 'Sync request not found' });
    }

    if (syncRequest.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }

    if (syncRequest.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${syncRequest.status}` });
    }

    // Update request status
    await prisma.syncRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });

    // Create sync relationship
    const sync = await prisma.sync.create({
      data: {
        user1Id: syncRequest.senderId,
        user2Id: syncRequest.receiverId
      }
    });

    res.json({ message: 'Sync request accepted', sync });
  } catch (err) {
    console.error('[SYNC_ACCEPT_REQUEST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Reject sync request
router.post('/request/:requestId/reject', async (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.requestId;

    const syncRequest = await prisma.syncRequest.findUnique({
      where: { id: requestId }
    });

    if (!syncRequest) {
      return res.status(404).json({ error: 'Sync request not found' });
    }

    if (syncRequest.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized to reject this request' });
    }

    if (syncRequest.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${syncRequest.status}` });
    }

    // Update request status
    const updatedRequest = await prisma.syncRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    });

    res.json({ message: 'Sync request rejected', request: updatedRequest });
  } catch (err) {
    console.error('[SYNC_REJECT_REQUEST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get synced users (list of users you're synced with)
router.get('/list', async (req, res) => {
  try {
    const userId = req.user.id;

    const syncs = await prisma.sync.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }]
      },
      include: {
        user1: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        user2: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    // Extract the other user from each sync
    const syncedUsers = syncs.map(sync => 
      sync.user1Id === userId ? sync.user2 : sync.user1
    );

    res.json(syncedUsers);
  } catch (err) {
    console.error('[SYNC_GET_LIST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Unsync with a user
router.delete('/:userId', async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = req.params.userId;

    const sync = await prisma.sync.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId }
        ]
      }
    });

    if (!sync) {
      return res.status(404).json({ error: 'Sync not found' });
    }

    await prisma.sync.delete({ where: { id: sync.id } });

    res.json({ message: 'Unsynced successfully' });
  } catch (err) {
    console.error('[SYNC_DELETE]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
