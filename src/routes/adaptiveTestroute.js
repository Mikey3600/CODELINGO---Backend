import express from 'express';
import {
  createAdaptiveTest,
  getAdaptiveTestById,
  getAllAdaptiveTests,
  updateAdaptiveTest,
  deleteAdaptiveTest,
  submitAnswer,
  getTestResults,
} from '../models/adaptiveTestModel.js';

const router = express.Router();

// Create a new adaptive test
router.post('/', async (req, res) => {
  try {
    const testData = req.body;
    const newTest = await createAdaptiveTest(testData);
    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all adaptive tests
router.get('/', async (req, res) => {
  try {
    const tests = await getAllAdaptiveTests();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get test by ID
router.get('/:id', async (req, res) => {
  try {
    const test = await getAdaptiveTestById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Adaptive test not found' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update test by ID
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const updatedTest = await updateAdaptiveTest(req.params.id, updates);
    if (!updatedTest) return res.status(404).json({ message: 'Adaptive test not found' });
    res.json(updatedTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete test by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteAdaptiveTest(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Adaptive test not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit an answer
router.post('/:id/submit', async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer) return res.status(400).json({ message: 'Answer is required' });
    const result = await submitAnswer(req.params.id, answer);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get test results
router.get('/:id/results', async (req, res) => {
  try {
    const results = await getTestResults(req.params.id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
