import express from "express";
import { generateRoutine } from "../controllers/routineController.js";
import validate from "../middleware/validate.js";
import { routineSchema } from "../validators/aiValidators.js";

const router = express.Router();
// Public, like /api/recommend — the controller never reads req.user, and
// gating it behind login broke the unified AI Advisor flow for anonymous
// shoppers who haven't registered yet.
router.post("/generate", validate(routineSchema), generateRoutine);
export default router;
