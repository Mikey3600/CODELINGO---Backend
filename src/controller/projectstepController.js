
import projectService from '../services/projectService.js';

export const createProjectController = async (req, res, next) => {
    try {
        
        const projectData = { 
            ...req.body, 
            user_id: req.user.id 
        };
        const newProject = await projectService.createProject(projectData);
        res.status(201).json(newProject);
    } catch (error) {
        next(error);
    }
};

export const getAllProjectsController = async (req, res, next) => {
    try {
       
        const projects = await projectService.getAllProjects(); 
        res.json(projects);
    } catch (error) {
        next(error);
    }
};

export const getProjectByIdController = async (req, res, next) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
       
        res.json(project);
    } catch (error) {
        next(error);
    }
};

export const updateProjectController = async (req, res, next) => {
    try {
        const updates = req.body;
        const updatedProject = await projectService.updateProject(req.params.id, updates);
        
        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(updatedProject);
    } catch (error) {
        next(error);
    }
};

export const deleteProjectController = async (req, res, next) => {
    try {
        const deleted = await projectService.deleteProject(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const updateProjectStepController = async (req, res, next) => {
    try {
        const { stepId, status } = req.body;
        
        if (!stepId || !status) {
            return res.status(400).json({ message: 'stepId and status are required' });
        }
        
        const updatedProject = await projectService.updateProjectStep(req.params.id, stepId, status);
        
        if (!updatedProject) {
            return res.status(404).json({ message: 'Project or step not found' });
        }
        
        
        res.json(updatedProject.steps); 
    } catch (error) {
        next(error);
    }
};

export const getProjectStepsController = async (req, res, next) => {
    try {
      
        const project = await projectService.getProjectById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json(project.steps);
    } catch (error) {
        next(error);
    }
};