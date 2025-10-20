
import {
  createChallenge,
  getChallengeById,
  getAllChallenges,
  updateChallenge,
  deleteChallenge,
} from '../models/challengeModel.js';

export const createChallengeController = async (req, res) => {
  try {
    const challengeData = req.body;
    const newChallenge = await createChallenge(challengeData);
    res.status(201).json(newChallenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllChallengesController = async (req, res) => {
  try {
    const challenges = await getAllChallenges();
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getChallengeByIdController = async (req, res) => {
  try {
    const challenge = await getChallengeById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateChallengeController = async (req, res) => {
  try {
    const updates = req.body;
    const updatedChallenge = await updateChallenge(req.params.id, updates);
    if (!updatedChallenge) return res.status(404).json({ message: 'Challenge not found' });
    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteChallengeController = async (req, res) => {
  try {
    const deleted = await deleteChallenge(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Challenge not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};