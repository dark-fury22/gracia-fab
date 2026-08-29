import express from "express";
import {
  getLoyaltyInfo,
  redeemPoints,
} from "../controllers/loyaltyController.js";
import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { redeemPointsSchema } from "../validators/loyaltyValidators.js";

const router = express.Router();
router.get("/", protect, getLoyaltyInfo);
router.post("/redeem", protect, validate(redeemPointsSchema), redeemPoints);

export default router;
