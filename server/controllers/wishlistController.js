import User from "../models/User.js";
import logger from "../utils/logger.js";

// @desc   Get user wishlist
// @route  GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      model: "Product",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.wishlist || []);
  } catch (error) {
    logger.error({ err: error }, "getWishlist error");
    res.status(500).json({ message: error.message });
  }
};

// @desc   Add product to wishlist
// @route  POST /api/wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize wishlist if it doesn't exist
    if (!user.wishlist) user.wishlist = [];

    const alreadyExists = user.wishlist.some(
      (id) => id.toString() === req.params.productId,
    );

    if (alreadyExists) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    user.wishlist.push(req.params.productId);
    await user.save();

    res.json({ message: "Added to wishlist ❤️", wishlist: user.wishlist });
  } catch (error) {
    logger.error({ err: error }, "addToWishlist error");
    res.status(500).json({ message: error.message });
  }
};

// @desc   Remove product from wishlist
// @route  DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = (user.wishlist || []).filter(
      (id) => id.toString() !== req.params.productId,
    );

    await user.save();
    res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    logger.error({ err: error }, "removeFromWishlist error");
    res.status(500).json({ message: error.message });
  }
};

// @desc   Save a recommendation session
// @route  POST /api/wishlist/recommendations/save
export const saveRecommendation = async (req, res) => {
  try {
    const { profile, productIds, products } = req.body;

    logger.info(
      { userId: req.user._id, productIds },
      "Saving recommendation for user",
    );

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Initialize if missing
    if (!Array.isArray(user.savedRecommendations)) {
      user.savedRecommendations = [];
    }

    // Build the product ID list from either field
    const ids = productIds || (products || []).map((p) => p._id || p);
    const validIds = ids.filter(Boolean);

    // Create the new recommendation entry
    const newRec = {
      date: new Date(),
      profile: profile || {},
      products: validIds,
    };

    user.savedRecommendations.push(newRec);

    // Keep only the last 10 saved recommendations
    if (user.savedRecommendations.length > 10) {
      user.savedRecommendations = user.savedRecommendations.slice(-10);
    }

    await user.save();
    logger.info("Recommendation saved successfully");

    res.status(201).json({
      success: true,
      message: "Recommendation saved! ✨",
      count: user.savedRecommendations.length,
    });
  } catch (error) {
    logger.error({ err: error }, "saveRecommendation error");
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get saved recommendations
// @route  GET /api/wishlist/recommendations/saved
export const getSavedRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.savedRecommendations || user.savedRecommendations.length === 0) {
      return res.json([]);
    }

    // Populate product details for each saved rec
    const populated = await User.findById(req.user._id).populate({
      path: "savedRecommendations.products",
      model: "Product",
      select: "name image price category brand rating",
    });

    const recs = (populated.savedRecommendations || [])
      .reverse()
      .map((rec, index) => ({
        _id: rec._id,
        date: rec.date,
        profile: rec.profile || {},
        products: (rec.products || []).filter(Boolean),
        number: populated.savedRecommendations.length - index,
      }));

    res.json(recs);
  } catch (error) {
    logger.error({ err: error }, "getSavedRecommendations error");
    res.status(500).json({ message: error.message });
  }
};
