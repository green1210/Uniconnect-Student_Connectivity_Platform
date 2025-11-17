import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { prisma } from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * Generate a unique username from email or name
 */
async function generateUniqueUsername(email, name) {
  let baseUsername = '';
  
  if (name && name.trim()) {
    baseUsername = name.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 20);
  }
  
  if (!baseUsername && email) {
    baseUsername = email.split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 20);
  }
  
  if (!baseUsername) {
    baseUsername = 'user';
  }
  
  let username = baseUsername;
  let attempts = 0;
  
  while (attempts < 10) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) return username;
    const randomNum = Math.floor(Math.random() * 900) + 100;
    username = `${baseUsername}_${randomNum}`;
    attempts++;
  }
  
  return `${baseUsername}_${Date.now().toString().slice(-6)}`;
}

/**
 * POST /api/profile/upload-avatar
 * Upload profile photo
 */
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/profiles/${req.file.filename}`;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl }
    });

    res.json({ avatar: updatedUser.avatar });
  } catch (error) {
    console.error('[AVATAR_UPLOAD_ERROR]', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

/**
 * POST /api/profile/upload-banner
 * Upload profile banner
 */
router.post('/upload-banner', upload.single('banner'), async (req, res) => {
  try {
    const userId = req.auth.userId;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const bannerUrl = `/uploads/profiles/${req.file.filename}`;
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: { banner: bannerUrl },
      create: {
        userId,
        banner: bannerUrl
      }
    });

    res.json({ banner: updatedProfile.banner });
  } catch (error) {
    console.error('[BANNER_UPLOAD_ERROR]', error);
    res.status(500).json({ error: 'Failed to upload banner' });
  }
});

/**
 * GET /api/profile
 * Get current user's profile (requires auth)
 */
router.get('/', async (req, res) => {
  try {
    console.log('[PROFILE_GET] Auth object:', req.auth);
    const userId = req.auth.userId;
    let userEmail = req.auth.sessionClaims?.email;
    console.log('[PROFILE_GET] User ID:', userId);
    console.log('[PROFILE_GET] User Email from JWT:', userEmail);

    // If email not in JWT, fetch from Clerk API
    if (!userEmail) {
      try {
        console.log('[PROFILE_GET] Email not in JWT, fetching from Clerk API...');
        const clerkUser = await clerkClient.users.getUser(userId);
        userEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
        console.log('[PROFILE_GET] Email from Clerk API:', userEmail);
      } catch (clerkError) {
        console.error('[PROFILE_GET] Failed to fetch email from Clerk:', clerkError.message);
      }
    }

    // First try to find user by Clerk ID
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            posts: true,
            threads: true,
            materials: true,
            projects: true
          }
        }
      }
    });

    // If not found by ID, try to find by email (existing user in DB)
    if (!user && userEmail) {
      console.log('[PROFILE_GET] User not found by ID, trying email:', userEmail);
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
          profile: true,
          posts: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          _count: {
            select: {
              posts: true,
              threads: true,
              materials: true,
              projects: true
            }
          }
        }
      });

      // If found by email, update the ID to match Clerk
      if (user) {
        console.log('[PROFILE_GET] Found user by email, updating ID to match Clerk');
        user = await prisma.user.update({
          where: { email: userEmail },
          data: { id: userId },
          include: {
            profile: true,
            posts: {
              orderBy: { createdAt: 'desc' },
              take: 10
            },
            _count: {
              select: {
                posts: true,
                threads: true,
                materials: true,
                projects: true
              }
            }
          }
        });
      }
    }

    console.log('[PROFILE_GET] User found:', !!user);

    // If still not found, create new user with Clerk data
    if (!user) {
      console.log('[PROFILE] User not in DB, creating from Clerk:', userId);
      
      // Fetch full user data from Clerk if not already fetched
      let userName = req.auth.sessionClaims?.name;
      if (!userEmail || !userName) {
        try {
          console.log('[PROFILE_GET] Fetching full user data from Clerk API...');
          const clerkUser = await clerkClient.users.getUser(userId);
          userEmail = userEmail || clerkUser.emailAddresses?.[0]?.emailAddress;
          userName = userName || clerkUser.firstName + (clerkUser.lastName ? ' ' + clerkUser.lastName : '');
          console.log('[PROFILE_GET] Clerk user data:', { email: userEmail, name: userName });
        } catch (clerkError) {
          console.error('[PROFILE_GET] Failed to fetch user from Clerk:', clerkError.message);
        }
      }
      
      const username = await generateUniqueUsername(userEmail, userName);
      
      user = await prisma.user.create({
        data: {
          id: userId,
          email: userEmail || `user-${userId}@temp.com`,
          name: userName,
          username,
          role: 'student'
        },
        include: {
          profile: true,
          posts: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          _count: {
            select: {
              posts: true,
              threads: true,
              materials: true,
              projects: true
            }
          }
        }
      });
      console.log('[PROFILE_GET] User created:', user.id);
    } else if (user.email && user.email.includes('@temp.com') && userEmail && !userEmail.includes('@temp.com')) {
      // If user has temp email but we have real email, update it
      console.log('[PROFILE_GET] Updating temp email to real email:', userEmail);
      user = await prisma.user.update({
        where: { id: userId },
        data: { email: userEmail },
        include: {
          profile: true,
          posts: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          _count: {
            select: {
              posts: true,
              threads: true,
              materials: true,
              projects: true
            }
          }
        }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('[PROFILE_GET_CURRENT_ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

/**
 * GET /api/profile/check-admin
 * Check if current user is admin and return user details
 */
router.get('/check-admin', async (req, res) => {
  try {
    const userId = req.auth.userId;
    const userEmail = req.auth.sessionClaims?.email;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: userEmail }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user,
      isAdmin: user.role === 'admin',
      message: user.role === 'admin' ? 'You are an admin' : 'You are not an admin'
    });
  } catch (error) {
    console.error('[CHECK_ADMIN_ERROR]', error);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

/**
 * POST /api/profile/make-admin
 * Make current user an admin (for development/setup)
 */
router.post('/make-admin', async (req, res) => {
  try {
    const userId = req.auth.userId;
    const userEmail = req.auth.sessionClaims?.email;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: userEmail }
        ]
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    res.json({
      success: true,
      message: 'User promoted to admin',
      user: updatedUser
    });
  } catch (error) {
    console.error('[MAKE_ADMIN_ERROR]', error);
    res.status(500).json({ error: 'Failed to make admin' });
  }
});

/**
 * GET /api/profile/:userId
 * Get user profile by ID
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            posts: true,
            threads: true,
            materials: true,
            projects: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('[PROFILE_GET_ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /api/profile
 * Update current user's profile (requires auth)
 */
router.put('/', async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { name, username, avatar, bio, university, major, year, interests, banner } = req.body;

    // Update user base info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(avatar && { avatar })
      }
    });

    // Upsert profile details
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: {
        ...(bio !== undefined && { bio }),
        ...(university && { university }),
        ...(major && { major }),
        ...(year && { year }),
        ...(interests && { interests }),
        ...(banner && { banner })
      },
      create: {
        userId,
        bio: bio || null,
        university: university || null,
        major: major || null,
        year: year || null,
        interests: interests || [],
        banner: banner || null
      }
    });

    res.json({
      ...updatedUser,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('[PROFILE_UPDATE_CURRENT_ERROR]', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * PUT /api/profile/:userId
 * Update user profile by ID (requires auth and ownership)
 */
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, username, avatar, bio, university, major, year, interests, banner } = req.body;

    // Verify user owns this profile
    if (req.auth.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    // Update user base info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(avatar && { avatar })
      }
    });

    // Upsert profile details
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: {
        ...(bio !== undefined && { bio }),
        ...(university && { university }),
        ...(major && { major }),
        ...(year && { year }),
        ...(interests && { interests }),
        ...(banner && { banner })
      },
      create: {
        userId,
        bio: bio || null,
        university: university || null,
        major: major || null,
        year: year || null,
        interests: interests || [],
        banner: banner || null
      }
    });

    res.json({
      ...updatedUser,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('[PROFILE_UPDATE_ERROR]', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * GET /api/profile/search?q=query
 * Search users by name or email
 * Used for user search feature in Feed page
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        profile: {
          select: {
            university: true,
            major: true
          }
        }
      },
      take: 10
    });

    res.json(users);
  } catch (error) {
    console.error('[PROFILE_SEARCH_ERROR]', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;
