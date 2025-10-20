// src/controllers/dsaController.js
import {
  fetchDSAProblemsFromSource,
  getDSAProblems,
  cacheDSAProblems,
  syncDSAProblemsWithSource,
} from '../models/dsaproblem.js';

export const getDSAProblemsController = async (req, res) => {
  try {
    let problems = await getDSAProblems();
    if (!problems || problems.length === 0) {
      problems = await fetchDSAProblemsFromSource();
      await cacheDSAProblems(problems);
    }
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshDSAProblemsController = async (req, res) => {
  try {
    const problems = await syncDSAProblemsWithSource();
    await cacheDSAProblems(problems);
    res.json({ message: 'DSA problems synced successfully', count: problems.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};