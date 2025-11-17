import { Router } from 'express';
import { db } from '../lib/db.js';
import authMiddleware from '../middleware/auth.js';
const r = Router();

r.get('/', async (req, res) => {
  try {
    const projects = await db.getProjects(20);
    res.json(projects);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load projects' });
  }
});

r.post('/', authMiddleware, async (req, res) => {
  const { name, summary, description, coverImage, tags, teamSize, lookingFor, category, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  
  const userId = req.auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const project = await db.createProject(
      name, 
      summary || '', 
      userId,
      description,
      coverImage,
      tags,
      teamSize,
      lookingFor,
      category,
      status
    );
    res.status(201).json(project);
  } catch (e) {
    console.error('Create project error:', e);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Join a project
r.post('/:projectId/join', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const result = await db.joinProject(projectId, userId);
    res.json(result);
  } catch (e) {
    console.error('Join project error:', e);
    res.status(500).json({ error: e.message || 'Failed to join project' });
  }
});

// Leave a project
r.post('/:projectId/leave', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const result = await db.leaveProject(projectId, userId);
    res.json(result);
  } catch (e) {
    console.error('Leave project error:', e);
    res.status(500).json({ error: 'Failed to leave project' });
  }
});

// Get project members
r.get('/:projectId/members', async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const members = await db.getProjectMembers(projectId);
    res.json(members);
  } catch (e) {
    console.error('Get project members error:', e);
    res.status(500).json({ error: 'Failed to get project members' });
  }
});

// Update project status
r.patch('/:projectId/status', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const project = await db.updateProjectStatus(projectId, status);
    res.json(project);
  } catch (e) {
    console.error('Update project status error:', e);
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

// Get project messages
r.get('/:projectId/messages', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const messages = await db.getProjectMessages(projectId);
    res.json(messages);
  } catch (e) {
    console.error('Get project messages error:', e);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send project message
r.post('/:projectId/messages', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;
  const userId = req.auth?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content required' });
  }
  
  try {
    const message = await db.sendProjectMessage(projectId, userId, content);
    res.status(201).json(message);
  } catch (e) {
    console.error('Send project message error:', e);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default r;
