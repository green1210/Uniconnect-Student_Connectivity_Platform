import { Router } from 'express';
import { db } from '../lib/db.js';
const r = Router();

r.get('/stats', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const stats = await db.stats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

export default r;
