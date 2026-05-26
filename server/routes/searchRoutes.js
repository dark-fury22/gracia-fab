import express from "express";
import {
  semanticSearch,
  getSearchSuggestions,
  getCacheStats,
} from "../controllers/searchController.js";
import protect from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.post("/", semanticSearch);
router.get("/suggestions", getSearchSuggestions);

// Admin — see cache stats
router.get("/cache-stats", protect, admin, getCacheStats);

export default router;
