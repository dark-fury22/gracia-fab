import User from "../models/User.js";
import logger from "../utils/logger.js";

// Points rules
const POINTS_RULES = {
  PER_NAIRA: 0.01, // ₦1 = 0.01 points (so ₦1000 = 10 points)
  REVIEW: 50, // 50 points for writing a review
  REFERRAL: 200, // 200 points for referring a friend
  DAILY_LOGIN: 5, // 5 points for logging in daily
  FIRST_PURCHASE: 100, // Bonus 100 points on first-ever purchase
};

// How many points needed per tier
const TIERS = {
  bronze: 0,
  silver: 500,
  gold: 2000,
  platinum: 5000,
};

// Calculate tier from total points earned
const getTier = (totalPoints) => {
  if (totalPoints >= TIERS.platinum) return "platinum";
  if (totalPoints >= TIERS.gold) return "gold";
  if (totalPoints >= TIERS.silver) return "silver";
  return "bronze";
};

// @desc  Award points to user
export const awardPoints = async (userId, points, reason) => {
  try {
    // $inc/$push are atomic at the document level, so concurrent purchases
    // (e.g. two orders paid for at once) can't clobber each other the way a
    // find -> mutate -> save round trip would.
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { loyaltyPoints: points },
        $push: { pointsHistory: { points, reason, type: "earn" } },
      },
      { new: true },
    );
    if (!user) return;

    const totalEarned = user.pointsHistory
      .filter((h) => h.type === "earn")
      .reduce((sum, h) => sum + h.points, 0);

    const tier = getTier(totalEarned);
    if (tier !== user.loyaltyTier) {
      user.loyaltyTier = tier;
      await user.save();
    }

    logger.info({ points, user: user.name, reason }, "Points awarded");
    return user.loyaltyPoints;
  } catch (err) {
    logger.error({ err }, "awardPoints error");
    throw err; // Rethrow so BullMQ can retry the points job
  }
};

// @desc  Get user's loyalty info
// @route GET /api/loyalty
export const getLoyaltyInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "loyaltyPoints loyaltyTier totalSpent pointsHistory name",
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // Calculate points to next tier
    const totalEarned = (user.pointsHistory || [])
      .filter((h) => h.type === "earn")
      .reduce((sum, h) => sum + h.points, 0);

    const tierOrder = ["bronze", "silver", "gold", "platinum"];
    const currentIdx = tierOrder.indexOf(user.loyaltyTier);
    const nextTier = tierOrder[currentIdx + 1];
    const pointsToNext = nextTier ? TIERS[nextTier] - totalEarned : 0;

    res.json({
      points: user.loyaltyPoints,
      tier: user.loyaltyTier,
      totalEarned,
      nextTier,
      pointsToNext: Math.max(0, pointsToNext),
      nairaValue: Math.floor(user.loyaltyPoints / 100) * 500,
      history: (user.pointsHistory || []).slice(-10).reverse(),
      tierBenefits: {
        bronze: "Earn 1% back on purchases",
        silver: "Earn 1.5% back + free delivery on orders over ₦20,000",
        gold: "Earn 2% back + priority support + early access",
        platinum: "Earn 3% back + free delivery always + VIP access",
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Redeem points at checkout
// @route POST /api/loyalty/redeem
export const redeemPoints = async (req, res) => {
  const { pointsToRedeem } = req.body;

  // 100 points = ₦500 discount
  const REDEEM_RATE = 500 / 100;

  try {
    if (pointsToRedeem < 100) {
      return res.status(400).json({
        message: "Minimum redemption is 100 points (= ₦500)",
      });
    }

    const discount = pointsToRedeem * REDEEM_RATE;

    // Conditioned on loyaltyPoints >= pointsToRedeem so the check-then-act
    // is atomic — two concurrent redemptions can't both pass a stale read
    // and drive the balance negative.
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, loyaltyPoints: { $gte: pointsToRedeem } },
      {
        $inc: { loyaltyPoints: -pointsToRedeem },
        $push: {
          pointsHistory: {
            points: -pointsToRedeem,
            reason: `Redeemed for ₦${discount.toLocaleString()} discount`,
            type: "redeem",
          },
        },
      },
      { new: true },
    );

    if (!user) {
      const existing = await User.findById(req.user._id).select(
        "loyaltyPoints",
      );
      if (!existing) return res.status(404).json({ message: "User not found" });
      return res.status(400).json({
        message: `You only have ${existing.loyaltyPoints} points`,
      });
    }

    res.json({
      success: true,
      pointsRedeemed: pointsToRedeem,
      discountAmount: discount,
      remainingPoints: user.loyaltyPoints,
      message: `✅ Redeemed ${pointsToRedeem} points for ₦${discount.toLocaleString()} off!`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
