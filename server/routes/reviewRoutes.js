import express from "express";
import {
  addReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { addReviewSchema } from "../validators/reviewValidators.js";

const router = express.Router();
router.get("/:productId", getProductReviews);
router.post("/:productId", protect, validate(addReviewSchema), addReview);
router.delete("/:id", protect, deleteReview);

export default router;
