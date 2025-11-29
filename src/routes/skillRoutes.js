import express from "express";
import {
  getSkillsByCourse,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/skillcontroller.js";

import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// LOGGED-IN USERS ONLY
router.get("/course/:courseId", protect, getSkillsByCourse);
router.get("/:id", protect, getSkill);

router.post("/", protect, createSkill);
router.put("/:id", protect, updateSkill);
router.delete("/:id", protect, deleteSkill);

export default router;

