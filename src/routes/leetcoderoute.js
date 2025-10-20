import express from "express";
import { getProblemController, getUserSubmissionsController } from "../controller/leetcodecontroller.js";

const router = express.Router();

router.get("/problem/:slug", getProblemController);
router.get("/submissions/:username", getUserSubmissionsController);

export default router;
