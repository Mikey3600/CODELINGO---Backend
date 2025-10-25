import express from 'express';
import {
  createAdaptiveTest,
  getAdaptiveTestById,
  getAllAdaptiveTests,
  updateAdaptiveTest,
  deleteAdaptiveTest,
  submitAnswer,
  getTestResults,
} from '../services/getadaptiveservices.js';
import { generateAdaptiveTest } from '../services/geminiservices.js'; // 👈 added

const router = express.Router();


router.post('/generate', async (req, res) => {
  try {
    const { topic, numQuestions, userId } = req.body;

    if (!topic || !userId) {
      return res.status(400).json({ error: 'Topic and userId are required' });
    }

    const generatedTest = await generateAdaptiveTest(topic, numQuestions || 5, userId);
    res.status(201).json({
      message: 'Adaptive test generated successfully using Gemini AI',
      test: generatedTest,
    });
  } catch (error) {
    console.error('Gemini Test Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const testData = req.body;
    const newTest = await createAdaptiveTest(testData);
    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const tests = await getAllAdaptiveTests();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const test = await getAdaptiveTestById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Adaptive test not found' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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


router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteAdaptiveTest(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Adaptive test not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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


router.get('/:id/results', async (req, res) => {
  try {
    const results = await getTestResults(req.params.id);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

