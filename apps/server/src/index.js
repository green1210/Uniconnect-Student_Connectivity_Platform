import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authMiddleware from './middleware/auth.js';
import feedRoutes from './routes/feed.js';
import authRoutes from './routes/auth.js';
import forumRoutes from './routes/forums.js';
import projectRoutes from './routes/projects.js';
import materialRoutes from './routes/materials.js';
import aiRoutes from './routes/ai.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhooks.js';
import syncRoutes from './routes/sync.js';

dotenv.config();
const app = express();
app.use(cors());

// Webhook routes need raw body for signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// Regular JSON parsing for other routes - increased limit for media uploads (base64)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.path}`);
  next();
});

export const prisma = new PrismaClient();

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

// Serve uploaded files (avatars etc.)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Public routes (no auth required)
app.use('/api/auth', authRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/projects', projectRoutes);

// Materials routes (mixed public/protected)
app.use('/api/materials', materialRoutes);

// Apply auth middleware for remaining routes
app.use('/api', authMiddleware);

// Protected routes (auth required)
app.use('/api/feed', feedRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sync', syncRoutes);

// Global error handler (must be last and have 4 params)
app.use((err, req, res, next) => {
  console.error('[EXPRESS_ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
let currentPort = DEFAULT_PORT;
const MAX_RETRIES = 5;

function startServer(portToTry, retriesLeft) {
  const server = app.listen(portToTry, () => console.log(`API running on :${portToTry}`));

  server.on('error', (error) => {
    if (error && error.code === 'EADDRINUSE') {
      console.error(`[SERVER_ERROR] Port ${portToTry} in use.`);
      if (retriesLeft > 0) {
        const nextPort = portToTry + 1;
        console.log(`[SERVER] Retrying on port ${nextPort} (${retriesLeft} retries left)`);
        setTimeout(() => startServer(nextPort, retriesLeft - 1), 500);
        return;
      }
      console.error('[SERVER_ERROR] No available ports. Exiting.');
      process.exit(1);
    }

    console.error('[SERVER_ERROR]', error && error.message ? error.message : error);
    process.exit(1);
  });

  return server;
}

startServer(currentPort, MAX_RETRIES);

// Catch ALL errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION]', reason instanceof Error ? reason.message : reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT_EXCEPTION]', error.message);
  process.exit(1);
});

// server errors are handled in startServer

