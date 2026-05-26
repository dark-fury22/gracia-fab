import express from "express";
import {
  getLoyaltyInfo,
  redeemPoints,
} from "../controllers/loyaltyController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getLoyaltyInfo);
router.post("/redeem", protect, redeemPoints);

export default router;
