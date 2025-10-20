// src/controllers/gamificationController.js
import {
  getUserStats,
  incrementUserXP,
  resetUserStreak,
  getLeaderboard,
} from '../models/gamification.js';

// 📊 Get user XP and streak
export const getUserStatsController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const stats = await getUserStats(userId);
    res.json({
      xp: stats?.xp || 0,
      streak: stats?.streak || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➕ Add XP to user (and auto-increment streak)
export const addUserXPController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (typeof amount !== 'number' || amount <= 0)
      return res.status(400).json({ message: 'Invalid XP amount' });

    const updatedStats = await incrementUserXP(userId, amount);
    res.json({
      xp: updatedStats.xp,
      streak: updatedStats.streak,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔁 Reset user streak
export const resetUserStreakController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const updatedStats = await resetUserStreak(userId);
    res.json({ streak: updatedStats.streak });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🏆 Get leaderboard (sorted by XP)
export const getLeaderboardController = async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
