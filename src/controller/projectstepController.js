// src/controllers/projectController.js
import {
  createProject,
  getProjectById,
  getAllProjects,
  updateProject,
  deleteProject,
  updateProjectStep,
  getProjectSteps,
} from '../models/projectstepModel.js';

export const createProjectController = async (req, res) => {
  try {
    const projectData = req.body;
    const newProject = await createProject(projectData);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllProjectsController = async (req, res) => {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectByIdController = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProjectController = async (req, res) => {
  try {
    const updates = req.body;
    const updatedProject = await updateProject(req.params.id, updates);
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProjectController = async (req, res) => {
  try {
    const deleted = await deleteProject(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Project not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update progress step in project
export const updateProjectStepController = async (req, res) => {
  try {
    const { stepId, status } = req.body;
    if (!stepId || !status) {
      return res.status(400).json({ message: 'stepId and status are required' });
    }
    const updatedStep = await updateProjectStep(req.params.id, stepId, status);
    if (!updatedStep) return res.status(404).json({ message: 'Step or project not found' });
    res.json(updatedStep);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all steps for a project
export const getProjectStepsController = async (req, res) => {
  try {
    const steps = await getProjectSteps(req.params.id);
    res.json(steps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};