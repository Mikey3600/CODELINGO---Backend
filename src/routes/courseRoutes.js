import express from "express";
import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/coursecontroller.js";

import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllCourses);
router.get("/:id", getCourse);

// ADMIN (later you will add role middleware)
router.post("/", protect, createCourse);
router.put("/:id", protect, updateCourse);
router.delete("/:id", protect, deleteCourse);

export default router;

