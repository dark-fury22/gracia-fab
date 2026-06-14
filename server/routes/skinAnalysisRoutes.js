import express from "express";
import { analyseSkin } from "../controllers/skinAnalysisController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, analyseSkin);
export default router;
