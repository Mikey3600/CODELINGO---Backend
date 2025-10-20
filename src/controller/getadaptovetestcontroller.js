// src/controllers/adaptiveTestController.js
import {
  createAdaptiveTest,
  getAdaptiveTestById,
  getAdaptiveTestsByUser,
  updateAdaptiveTest,
  deleteAdaptiveTest,
} from '../models/adaptiveTestModel.js';

// 🧩 Create a new adaptive test
export const createAdaptiveTestController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { testData, currentLevel, score, startedAt, finishedAt } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const newTest = await createAdaptiveTest({
      userId,
      testData,
      currentLevel,
      score,
      startedAt: startedAt || new Date().toISOString(),
      finishedAt: finishedAt || null,
    });

    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Get a single test by ID
export const getAdaptiveTestByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await getAdaptiveTestById(id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📋 Get all tests for the logged-in user
export const getUserAdaptiveTestsController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const tests = await getAdaptiveTestsByUser(userId);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✏️ Update an adaptive test
export const updateAdaptiveTestController = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTest = await updateAdaptiveTest(id, updates);
    if (!updatedTest) return res.status(404).json({ message: 'Test not found' });
    res.json(updatedTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Delete an adaptive test
export const deleteAdaptiveTestController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTest = await deleteAdaptiveTest(id);
    if (!deletedTest) return res.status(404).json({ message: 'Test not found' });
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
