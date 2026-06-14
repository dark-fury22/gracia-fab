import express from "express";
import { generateRoutine } from "../controllers/routineController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/generate", protect, generateRoutine);
export default router;
