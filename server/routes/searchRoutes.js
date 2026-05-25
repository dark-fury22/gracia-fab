import express from "express";
import {
  semanticSearch,
  getSearchSuggestions,
} from "../controllers/searchController.js";

const router = express.Router();
router.post("/", semanticSearch);
router.get("/suggestions", getSearchSuggestions);

export default router;
