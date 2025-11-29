import express from "express";
import {
  getLessonsBySkill,
  getLessonWithQuestions,
  createLesson,
  updateLesson,
  deleteLesson,
  addQuestion,
} from "../controllers/lessoncontroller.js";

import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/skill/:skillId", protect, getLessonsBySkill);
router.get("/:lessonId", protect, getLessonWithQuestions);

router.post("/", protect, createLesson);
router.put("/:lessonId", protect, updateLesson);
router.delete("/:lessonId", protect, deleteLesson);

router.post("/add-question", protect, addQuestion);

export default router;

