import express from "express";
import { registerUser, loginUser, getMe, healthCheck } from "../controllers/authcontrollers.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/health", healthCheck);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

export default router;


