import express from "express";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// @route POST /api/track/view
// Called when user views a product
router.post("/view", protect, async (req, res) => {
  const { productId, category } = req.body;
  if (!productId) return res.json({ ok: true });

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.json({ ok: true });

    const existing = user.interests?.find(
      (i) => i.productId?.toString() === productId,
    );

    if (existing) {
      existing.viewCount++;
      existing.lastViewed = new Date();
    } else {
      if (!user.interests) user.interests = [];
      user.interests.push({ productId, category, viewCount: 1 });
      // Keep only last 20 interests
      if (user.interests.length > 20) {
        user.interests = user.interests.slice(-20);
      }
    }

    await user.save();
    res.json({ ok: true });
  } catch {
    res.json({ ok: true }); // Silent fail
  }
});

export default router;
