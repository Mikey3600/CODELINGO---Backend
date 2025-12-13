import express from "express";
import Question from "../models/Question.js";

const router = express.Router();

// GET /api/questions/:lessonId
router.get("/:lessonId", async (req, res) => {
  try {
    const { lessonId } = req.params;

    const questions = await Question.find({
      lessonId: lessonId,
      isActive: true
    })
    .sort({ order: 1 })
    .select("-correctAnswer -__v");

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No questions found for this lesson"
      });
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching questions",
      error: error.message
    });
  }
});

export default router;