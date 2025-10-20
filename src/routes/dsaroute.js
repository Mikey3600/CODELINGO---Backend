
import express from 'express';
import {
  createProblem,
  getProblemById,
  getAllProblems,
  updateProblem,
  deleteProblem,
  syncProblemsFromSource,
} from '../models/dsaproblem.js';

const router = express.Router();

// Create a new problem
router.post('/', async (req, res) => {
  try {
    const problemData = req.body;
    const newProblem = await createProblem(problemData);
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await getAllProblems();
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get problem by ID
router.get('/:id', async (req, res) => {
  try {
    const problem = await getProblemById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update problem by ID
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const updatedProblem = await updateProblem(req.params.id, updates);
    if (!updatedProblem) return res.status(404).json({ message: 'Problem not found' });
    res.json(updatedProblem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete problem by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteProblem(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Problem not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync problems from external source
router.post('/sync', async (req, res) => {
  try {
    const result = await syncProblemsFromSource();
    res.json({ message: 'Problems synced successfully', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;