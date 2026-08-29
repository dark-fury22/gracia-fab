import express from "express";
import { generateRoutine } from "../controllers/routineController.js";
import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { routineSchema } from "../validators/aiValidators.js";

const router = express.Router();
router.post("/generate", protect, validate(routineSchema), generateRoutine);
export default router;
