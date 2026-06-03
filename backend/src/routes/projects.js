import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();
const projectModel = new Project();

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await projectModel.getAllProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await projectModel.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/status/:status - Get projects by status
router.get('/status/:status', async (req, res) => {
  try {
    const projects = await projectModel.getProjectsByStatus(req.params.status);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects by status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const { name, description, icon, href, status, tags } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const project = await projectModel.createProject({
      name,
      description,
      icon,
      href,
      status,
      tags: tags || []
    });
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const project = await projectModel.updateProject(req.params.id, updates);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await projectModel.deleteProject(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;