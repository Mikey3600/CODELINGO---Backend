import express from 'express';
import Lesson from '../models/Lesson.js';

const router = express.Router();

// GET /api/lessons/c
router.get('/c', async (req, res) => {
  try {
    const lessons = await Lesson.find({
      languageCode: 'c',
      isActive: true
    })
      .sort({ order: 1 })
      .select('-__v');

    if (!lessons || lessons.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No lessons found for C language'
      });
    }

    res.status(200).json({
      success: true,
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    console.error('Error fetching C lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lessons',
      error: error.message
    });
  }
});

export default router;
