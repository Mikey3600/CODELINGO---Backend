
import express from 'express';
import {
  createChallenge,
  getChallengeById,
 
  updateChallenge,
  deleteChallenge,
} from '../services/challengeService.js';

const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const challengeData = req.body;
    const newChallenge = await createChallenge(challengeData);
    res.status(201).json(newChallenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.get('/:id', async (req, res) => {
  try {
    const challenge = await getChallengeById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const updatedChallenge = await updateChallenge(req.params.id, updates);
    if (!updatedChallenge) return res.status(404).json({ message: 'Challenge not found' });
    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteChallenge(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Challenge not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;