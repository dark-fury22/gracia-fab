import express from "express";
import { analyseSkin } from "../controllers/skinAnalysisController.js";
import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { skinAnalysisSchema } from "../validators/aiValidators.js";

const router = express.Router();
router.post("/", protect, validate(skinAnalysisSchema), analyseSkin);
export default router;
