import Groq from "groq-sdk";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

// ─────────────────────────────────────────
//  ITEM 6: QUERY CACHE
//  Think of this like a notepad where we
//  write down AI answers so we don't have
//  to ask again for 1 hour
// ─────────────────────────────────────────
const queryCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const getCached = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    queryCache.delete(key);
    return null;
  }
  console.log(`📦 Cache HIT for: "${key}"`);
  return item.value;
};

const setCache = (key, value) => {
  queryCache.set(key, {
    value,
    expiry: Date.now() + CACHE_TTL_MS,
  });
  console.log(`💾 Cached: "${key}" (${queryCache.size} items in cache)`);
};

// Clear old cache entries every 30 mins (housekeeping)
setInterval(
  () => {
    const now = Date.now();
    for (const [key, item] of queryCache.entries()) {
      if (now > item.expiry) queryCache.delete(key);
    }
  },
  30 * 60 * 1000,
);

// ─────────────────────────────────────────
//  ITEM 7: SERVER-SIDE AI SEARCH
//  Groq reads the query like a human and
//  extracts structured filters from it
// ─────────────────────────────────────────
let groqClient = null;
const getGroq = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const parseQueryWithAI = async (query) => {
  // Check cache first
  const cacheKey = `parse:${query.toLowerCase().trim()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const prompt = `You are a beauty product search AI for a Nigerian beauty store (Gracia Fab).

Parse this search query and extract structured filters.
Return ONLY valid JSON, no explanation, no markdown.

Query: "${query}"

Available values:
- categories: skincare, haircare, wig, bridal
- skinTypes:  oily, dry, combination, normal, sensitive
- hairTypes:  straight, wavy, curly, coily
- priceRange: budget (<5000), mid (5000-30000), premium (>30000)

Return this exact JSON structure (omit fields that don't apply):
{
  "categories":  [],
  "skinTypes":   [],
  "hairTypes":   [],
  "concerns":    [],
  "ingredients": [],
  "priceRange":  null,
  "occasion":    null,
  "keywords":    "",
  "intent":      "browse|problem|occasion|ingredient|gift",
  "confidence":  0.0
}`;

  try {
    const completion = await getGroq().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : {};

    // Store in cache so we don't call AI for same query again
    setCache(cacheKey, parsed);
    return parsed;
  } catch (err) {
    console.log("AI parse failed, using empty filters:", err.message);
    return {};
  }
};

// ─────────────────────────────────────────
//  ITEM 8: PERSONALIZATION LAYER
//  Loads the user's profile, purchase
//  history, and wishlist to score products
//  higher if they match who the user is
// ─────────────────────────────────────────
const loadUserProfile = async (userId) => {
  if (!userId) return null;

  try {
    // Get user preferences
    const user = await User.findById(userId).select(
      "skinType hairType wishlist loyaltyTier",
    );

    if (!user) return null;

    // Get their purchase history (what categories they buy)
    const orders = await Order.find({
      user: userId,
      isPaid: true,
    })
      .select("orderItems")
      .limit(20)
      .lean();

    // Extract categories and brands they've bought
    const purchasedCategories = new Set();
    const purchasedProductIds = new Set();

    for (const order of orders) {
      for (const item of order.orderItems || []) {
        if (item.product) purchasedProductIds.add(item.product.toString());
      }
    }

    // Get categories from purchased products
    if (purchasedProductIds.size > 0) {
      const purchasedProducts = await Product.find({
        _id: { $in: [...purchasedProductIds] },
      })
        .select("category brand")
        .lean();

      for (const p of purchasedProducts) {
        purchasedCategories.add(p.category);
      }
    }

    return {
      skinType: user.skinType || null,
      hairType: user.hairType || null,
      wishlistIds: (user.wishlist || []).map((id) => id.toString()),
      purchasedCategories: [...purchasedCategories],
      loyaltyTier: user.loyaltyTier || "bronze",
      isPremium: ["gold", "platinum"].includes(user.loyaltyTier),
    };
  } catch (err) {
    console.error("loadUserProfile error:", err.message);
    return null;
  }
};

// ─────────────────────────────────────────
//  ITEM 5: HYBRID SCORING ENGINE
//  Every product gets 4 scores combined:
//
//  1. AI Score       (40%) — query relevance
//  2. Filter Score   (30%) — exact filter match
//  3. Personal Score (20%) — matches user profile
//  4. Quality Score  (10%) — rating + reviews
//
//  Final = weighted sum → sort descending
// ─────────────────────────────────────────
const scoreProduct = (product, query, parsedFilters, userProfile) => {
  let aiScore = 0; // out of 100
  let filterScore = 0; // out of 100
  let personalScore = 0; // out of 100
  let qualityScore = 0; // out of 100

  // ── AI Score: keyword + semantic match
  const searchText =
    `${product.name} ${product.description} ${(product.tags || []).join(" ")} ${product.brand} ${product.category}`.toLowerCase();
  const queryWords = (parsedFilters.keywords || query)
    .toLowerCase()
    .split(/\s+/);

  let wordMatches = 0;
  for (const word of queryWords) {
    if (word.length > 2 && searchText.includes(word)) wordMatches++;
  }
  aiScore = Math.min(100, (wordMatches / Math.max(queryWords.length, 1)) * 100);

  // Boost if product name directly contains the query
  if (product.name.toLowerCase().includes(query.toLowerCase())) {
    aiScore = Math.min(100, aiScore + 30);
  }

  // ── Filter Score: category, skin type, hair type, price
  let filterMatches = 0;
  let totalFilters = 0;

  if (parsedFilters.categories?.length > 0) {
    totalFilters++;
    if (parsedFilters.categories.includes(product.category)) filterMatches++;
  }

  if (parsedFilters.skinTypes?.length > 0) {
    totalFilters++;
    const productSkinTypes = product.suitableFor?.skinType || [];
    if (
      parsedFilters.skinTypes.some((st) => productSkinTypes.includes(st)) ||
      productSkinTypes.includes("all")
    )
      filterMatches++;
  }

  if (parsedFilters.hairTypes?.length > 0) {
    totalFilters++;
    const productHairTypes = product.suitableFor?.hairType || [];
    if (
      parsedFilters.hairTypes.some((ht) => productHairTypes.includes(ht)) ||
      productHairTypes.includes("all")
    )
      filterMatches++;
  }

  if (parsedFilters.concerns?.length > 0) {
    totalFilters++;
    const productTags = (product.tags || []).map((t) => t.toLowerCase());
    const productConcerns = (product.suitableFor?.concern || []).map((c) =>
      c.toLowerCase(),
    );
    if (
      parsedFilters.concerns.some(
        (c) =>
          productTags.includes(c.toLowerCase()) ||
          productConcerns.includes(c.toLowerCase()),
      )
    )
      filterMatches++;
  }

  if (parsedFilters.priceRange) {
    totalFilters++;
    const price = product.price;
    if (
      (parsedFilters.priceRange === "budget" && price < 5000) ||
      (parsedFilters.priceRange === "mid" && price >= 5000 && price <= 30000) ||
      (parsedFilters.priceRange === "premium" && price > 30000)
    )
      filterMatches++;
  }

  filterScore = totalFilters > 0 ? (filterMatches / totalFilters) * 100 : 50; // neutral if no filters

  // ── Personal Score: matches user's known profile
  if (userProfile) {
    let personalMatches = 0;
    let personalTotal = 0;

    // User's skin type
    if (userProfile.skinType) {
      personalTotal++;
      const productSkinTypes = product.suitableFor?.skinType || [];
      if (
        productSkinTypes.includes(userProfile.skinType) ||
        productSkinTypes.includes("all")
      )
        personalMatches++;
    }

    // User's hair type
    if (userProfile.hairType) {
      personalTotal++;
      const productHairTypes = product.suitableFor?.hairType || [];
      if (
        productHairTypes.includes(userProfile.hairType) ||
        productHairTypes.includes("all")
      )
        personalMatches++;
    }

    // Has user bought from this category before? (familiarity boost)
    if (userProfile.purchasedCategories.includes(product.category)) {
      personalMatches += 0.5;
      personalTotal += 0.5;
    }

    // Is this in their wishlist? (high intent signal)
    if (userProfile.wishlistIds.includes(product._id.toString())) {
      personalMatches += 1;
      personalTotal += 1;
    }

    personalScore =
      personalTotal > 0
        ? Math.min(100, (personalMatches / personalTotal) * 100)
        : 50;
  } else {
    personalScore = 50; // neutral if no user profile
  }

  // ── Quality Score: rating + reviews + featured
  const ratingScore = ((product.rating || 0) / 5) * 60; // max 60
  const reviewScore = Math.min(20, product.numReviews || 0); // max 20
  const featuredBonus = product.isFeatured ? 20 : 0; // max 20
  qualityScore = Math.min(100, ratingScore + reviewScore + featuredBonus);

  // ── HYBRID FINAL SCORE (Item 5)
  const finalScore =
    aiScore * 0.4 +
    filterScore * 0.3 +
    personalScore * 0.2 +
    qualityScore * 0.1;

  return {
    finalScore: Math.round(finalScore * 10) / 10,
    breakdown: {
      ai: Math.round(aiScore),
      filter: Math.round(filterScore),
      personal: Math.round(personalScore),
      quality: Math.round(qualityScore),
    },
  };
};

// ─────────────────────────────────────────
//  MAIN SEARCH ENDPOINT
//  Combines all 4 items into one flow
// ─────────────────────────────────────────

// @route POST /api/search
export const semanticSearch = async (req, res) => {
  const { query } = req.body;
  const userId = req.user?._id; // optional — works for both guests and logged-in users

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ message: "Search query too short" });
  }

  const startTime = Date.now();
  console.log(`🔍 Search: "${query}" | User: ${userId || "guest"}`);

  try {
    // ── Step 1: Parse query with AI (Item 7) — cached (Item 6)
    const parsedFilters = await parseQueryWithAI(query);
    console.log("📋 Parsed filters:", JSON.stringify(parsedFilters));

    // ── Step 2: Load user profile for personalization (Item 8)
    const userProfile = await loadUserProfile(userId);
    if (userProfile) {
      console.log(
        `👤 User profile: skin=${userProfile.skinType}, hair=${userProfile.hairType}`,
      );
    }

    // ── Step 3: Fetch all products from DB
    const allProducts = await Product.find({}).lean();

    // ── Step 4: Score every product (Item 5 — hybrid ranking)
    const scored = allProducts.map((product) => {
      const { finalScore, breakdown } = scoreProduct(
        product,
        query,
        parsedFilters,
        userProfile,
      );
      return { product, finalScore, breakdown };
    });

    // ── Step 5: Sort by final score (highest first)
    scored.sort((a, b) => b.finalScore - a.finalScore);

    // ── Step 6: Filter out very low scores (irrelevant products)
    const MINIMUM_SCORE = 15;
    const relevant = scored.filter((s) => s.finalScore >= MINIMUM_SCORE);

    // Return top 16 results
    const results = relevant.slice(0, 16).map((s) => ({
      ...s.product,
      _score: s.finalScore,
      _breakdown: s.breakdown,
    }));

    const elapsed = Date.now() - startTime;
    console.log(`✅ Found ${results.length} results in ${elapsed}ms`);

    res.json({
      results,
      total: results.length,
      query,
      parsedFilters,
      personalized: !!userProfile,
      responseTimeMs: elapsed,

      // Show user what the AI understood
      aiUnderstanding: {
        categories: parsedFilters.categories || [],
        skinTypes: parsedFilters.skinTypes || [],
        concerns: parsedFilters.concerns || [],
        intent: parsedFilters.intent || "browse",
      },
    });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/search/suggestions?q=...
export const getSearchSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);

  // Cache suggestions too
  const cacheKey = `suggest:${q.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const regex = new RegExp(q, "i");
    const products = await Product.find({
      $or: [
        { name: regex },
        { category: regex },
        { brand: regex },
        { tags: regex },
      ],
    })
      .select("name category brand tags")
      .limit(8)
      .lean();

    const suggestions = [
      ...new Set([
        ...products.map((p) => p.name),
        ...products.map((p) => p.category),
        ...products.flatMap((p) => p.tags || []).slice(0, 4),
      ]),
    ]
      .filter((s) => s.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 8);

    setCache(cacheKey, suggestions);
    res.json(suggestions);
  } catch {
    res.json([]);
  }
};

// @route GET /api/search/cache-stats  (admin tool)
export const getCacheStats = async (req, res) => {
  const entries = [];
  for (const [key, item] of queryCache.entries()) {
    entries.push({
      key,
      expiresIn: Math.round((item.expiry - Date.now()) / 1000) + "s",
    });
  }
  res.json({
    totalCachedQueries: queryCache.size,
    entries,
  });
};
