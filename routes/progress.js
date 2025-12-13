import express from 'express';
import UserProgress from '../models/Userprogress.js';
import Question from '../models/Question.js';

const router = express.Router();

// POST /api/progress/submit
router.post('/submit', async (req, res) => {
  try {
    const { userId, languageCode, lessonId, questionId, answer } = req.body;

    if (!userId || !languageCode || !lessonId || !questionId || answer === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const isCorrect = question.correctAnswer === answer;

    const totalQuestions = await Question.countDocuments({
      lessonId,
      isActive: true
    });

    let progress = await UserProgress.findOne({ userId, languageCode, lessonId });

    if (!progress) {
      progress = new UserProgress({
        userId,
        languageCode,
        lessonId,
        totalQuestions,
        completedQuestions: 1,
        correctAnswers: isCorrect ? 1 : 0,
        attempts: 1
      });
    } else {
      progress.completedQuestions += 1;
      if (isCorrect) progress.correctAnswers += 1;
      progress.attempts += 1;
      progress.lastAttemptDate = Date.now();
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        progress: {
          completedQuestions: progress.completedQuestions,
          totalQuestions: progress.totalQuestions,
          correctAnswers: progress.correctAnswers,
          score: progress.score,
          isCompleted: progress.isCompleted
        }
      }
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting answer',
      error: error.message
    });
  }
});

// GET /api/progress/:userId/c
router.get('/:userId/c', async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await UserProgress.find({
      userId,
      languageCode: 'c'
    })
      .populate('lessonId', 'title description difficulty')
      .sort({ updatedAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching progress',
      error: error.message
    });
  }
});

export default router;
