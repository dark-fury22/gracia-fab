import express from "express";
import {
  semanticSearch,
  getSearchSuggestions,
  getCacheStats,
} from "../controllers/searchController.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import validate from "../middleware/validate.js";
import { searchSchema } from "../validators/aiValidators.js";

const router = express.Router();

// Public routes
router.post("/", validate(searchSchema), semanticSearch);
router.get("/suggestions", getSearchSuggestions);

// Authenticated version gets personalized results
router.post("/personalized", protect, validate(searchSchema), semanticSearch);

// Admin — see cache stats
router.get("/cache-stats", protect, admin, getCacheStats);

export default router;
