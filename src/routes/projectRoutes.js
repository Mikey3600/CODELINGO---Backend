// src/routes/projectRoutes.js
import express from 'express';
import {
  createProject,
  getProjectById,
  getAllProjects,
  updateProject,
  deleteProject,
} from '../models/projectstepModel.js';

const router = express.Router();

// Create a new project
router.post('/', async (req, res) => {
  try {
    const projectData = req.body;
    const newProject = await createProject(projectData);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project by ID
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const updatedProject = await updateProject(req.params.id, updates);
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteProject(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Project not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;