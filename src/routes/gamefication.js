import express from 'express';
import {
  getUserPoints,
  addPointsToUser,
  getLeaderboard,
  redeemReward,
} from '../models/gamification.js';

const router = express.Router();

// 🔹 Get user points
router.get('/points/:userId', async (req, res) => {
  try {
    const points = await getUserPoints(req.params.userId);
    res.json({ userId: req.params.userId, points });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Add points
router.post('/points/:userId/add', async (req, res) => {
  try {
    const { points } = req.body;
    if (typeof points !== 'number' || points <= 0) {
      return res.status(400).json({ message: 'Points must be a positive number' });
    }
    const updatedPoints = await addPointsToUser(req.params.userId, points);
    res.json({ userId: req.params.userId, points: updatedPoints });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Redeem reward
router.post('/redeem', async (req, res) => {
  try {
    const { userId, rewardId } = req.body;
    if (!userId || !rewardId) {
      return res.status(400).json({ message: 'userId and rewardId are required' });
    }
    const result = await redeemReward(userId, rewardId);
    res.json({ message: 'Reward redeemed successfully', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
