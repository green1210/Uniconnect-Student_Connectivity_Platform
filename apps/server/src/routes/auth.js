import { Router } from 'express';
import { prisma } from '../index.js';
import jwt from 'jsonwebtoken';

const r = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

r.get('/me', (req, res) => {
  res.json({ user: req.user || null });
});

// Google OAuth callback
r.post('/google', async (req, res) => {
  try {
    const { email, name, picture, sub } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          avatar: picture,
          provider: 'google',
          providerId: sub,
          role: 'student'
        }
      });
    } else if (!user.avatar && picture) {
      // Update avatar if not set
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: picture }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GitHub OAuth callback
r.post('/github', async (req, res) => {
  try {
    const { email, name, avatar_url, id } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          avatar: avatar_url,
          provider: 'github',
          providerId: String(id),
          role: 'student'
        }
      });
    } else if (!user.avatar && avatar_url) {
      // Update avatar if not set
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: avatar_url }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Email/password registration
r.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user (in production, hash the password!)
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        provider: 'email',
        role: 'student'
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Email/password login
r.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In production, verify password hash here

    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default r;
