import express from "express";
import { askTutor, revealSolution } from "../controllers/tutorcontroller.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Ask AI tutor (text only)
router.post("/ask", protect, askTutor);

// Ask AI tutor with file upload
router.post(
  "/ask/upload",
  protect,
  upload.single("file"),
  askTutor
);

// Reveal full solution
router.post("/solution", protect, revealSolution);

export default router;


