import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

// ─────────────────────────────────────────
//  SMART QUERY PARSER (No API needed)
//  Understands natural language using rules
// ─────────────────────────────────────────
const parseQuery = (query) => {
  const q = query.toLowerCase().trim();
  const result = {
    categories: [],
    skinTypes: [],
    hairTypes: [],
    concerns: [],
    priceRange: null,
    keywords: q,
    intent: "browse",
  };

  // ── Category detection
  if (
    /\b(serum|moistur|cleanser|toner|sunscreen|spf|face|skin|cream|lotion|glow|brightening)\b/.test(
      q,
    )
  )
    result.categories.push("skincare");
  if (
    /\b(hair|curl|scalp|shampoo|conditioner|growth|natural hair|braid|locs)\b/.test(
      q,
    )
  )
    result.categories.push("haircare");
  if (/\b(wig|lace|frontal|closure|bob|afro|weave|hair piece)\b/.test(q))
    result.categories.push("wig");
  if (/\b(bride|bridal|wedding|occasion|ceremony|pre-wedding)\b/.test(q))
    result.categories.push("bridal");

  // ── Skin type detection
  if (/\b(oily|greasy|shiny|pores)\b/.test(q)) result.skinTypes.push("oily");
  if (/\b(dry|flaky|tight|parched)\b/.test(q)) result.skinTypes.push("dry");
  if (/\b(combination|combo|t-zone)\b/.test(q))
    result.skinTypes.push("combination");
  if (/\b(normal)\b/.test(q)) result.skinTypes.push("normal");
  if (/\b(sensitive|react|irritat|redness)\b/.test(q))
    result.skinTypes.push("sensitive");

  // ── Hair type
  if (/\b(straight|relaxed)\b/.test(q)) result.hairTypes.push("straight");
  if (/\b(wavy)\b/.test(q)) result.hairTypes.push("wavy");
  if (/\b(curly|curl)\b/.test(q)) result.hairTypes.push("curly");
  if (/\b(coily|4c|natural|kinky)\b/.test(q)) result.hairTypes.push("coily");

  // ── Concern detection
  const concernMap = {
    acne: /\b(acne|pimple|breakout|blemish|spot)\b/,
    "dark spots": /\b(dark spot|hyperpigmentation|uneven|patch|melanin)\b/,
    "hair loss": /\b(hair loss|thinning|bald|growth|shedding)\b/,
    frizz: /\b(frizz|fizzy|puff)\b/,
    aging: /\b(aging|wrinkle|fine line|anti-age|mature)\b/,
    brightening: /\b(bright|dull|glow|radiant|lighten)\b/,
    moisturizing: /\b(moistur|hydrat|dry|water)\b/,
  };
  for (const [concern, regex] of Object.entries(concernMap)) {
    if (regex.test(q)) result.concerns.push(concern);
  }

  // ── Price range
  const budgetMatch = q.match(/under\s*[₦#]?\s*(\d[\d,]*)/i);
  if (budgetMatch) {
    result.priceRange = { max: parseInt(budgetMatch[1].replace(",", "")) };
  }
  if (/\b(cheap|affordable|budget|low.price)\b/.test(q)) {
    result.priceRange = { max: result.priceRange?.max || 10000 };
  }
  if (/\b(premium|luxury|high.end)\b/.test(q)) {
    result.priceRange = { min: 20000 };
  }

  // ── Intent
  if (/\b(acne|dark spot|hair loss|frizz|dull)\b/.test(q))
    result.intent = "problem";
  if (/\b(bride|wedding|gift)\b/.test(q)) result.intent = "occasion";
  if (/\b(vitamin|retinol|niacinamide|spf)\b/.test(q))
    result.intent = "ingredient";

  return result;
};

// ─────────────────────────────────────────
//  OPTIONAL: Groq AI enhances the parse
//  If Groq fails, falls back to rule-based
// ─────────────────────────────────────────
let groqClient = null;
const getGroq = () => {
  if (!groqClient && process.env.GROQ_API_KEY) {
    const Groq = require("groq-sdk");
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const enhanceWithAI = async (query, baseParse) => {
  const groq = getGroq();
  if (!groq) return baseParse;

  try {
    const prompt = `Extract search intent from this beauty query. Return ONLY JSON, no markdown.

Query: "${query}"

Return: {"keywords":"","categories":[],"skinTypes":[],"concerns":[],"priceRange":null}

Categories: skincare, haircare, wig, bridal
SkinTypes: oily, dry, combination, normal, sensitive`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 200,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return baseParse;

    const aiParse = JSON.parse(match[0]);

    // Merge AI results with rule-based (AI fills gaps)
    return {
      ...baseParse,
      categories: [
        ...new Set([...baseParse.categories, ...(aiParse.categories || [])]),
      ],
      skinTypes: [
        ...new Set([...baseParse.skinTypes, ...(aiParse.skinTypes || [])]),
      ],
      concerns: [
        ...new Set([...baseParse.concerns, ...(aiParse.concerns || [])]),
      ],
      keywords: aiParse.keywords || baseParse.keywords,
      priceRange: baseParse.priceRange || aiParse.priceRange,
    };
  } catch {
    return baseParse; // graceful fallback
  }
};

// ─────────────────────────────────────────
//  HYBRID SCORING ENGINE
// ─────────────────────────────────────────
const scoreProduct = (product, query, filters, userProfile) => {
  const text = [
    product.name,
    product.description,
    product.category,
    product.brand,
    ...(product.tags || []),
    ...(product.suitableFor?.skinType || []),
    ...(product.suitableFor?.hairType || []),
    ...(product.suitableFor?.concern || []),
  ]
    .join(" ")
    .toLowerCase();

  const words = (filters.keywords || query)
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const matched = words.filter((w) => text.includes(w));

  // AI score — keyword relevance
  let aiScore = words.length > 0 ? (matched.length / words.length) * 100 : 50;
  if (product.name.toLowerCase().includes(query.toLowerCase()))
    aiScore = Math.min(100, aiScore + 40);

  // Filter score — structured match
  let filterMatches = 0;
  let filterTotal = 0;

  if (filters.categories?.length) {
    filterTotal++;
    if (filters.categories.includes(product.category)) filterMatches++;
  }
  if (filters.skinTypes?.length) {
    filterTotal++;
    const st = product.suitableFor?.skinType || [];
    if (filters.skinTypes.some((s) => st.includes(s) || st.includes("all")))
      filterMatches++;
  }
  if (filters.hairTypes?.length) {
    filterTotal++;
    const ht = product.suitableFor?.hairType || [];
    if (filters.hairTypes.some((h) => ht.includes(h) || ht.includes("all")))
      filterMatches++;
  }
  if (filters.concerns?.length) {
    filterTotal++;
    const tags = (product.tags || []).join(" ").toLowerCase();
    if (filters.concerns.some((c) => tags.includes(c.toLowerCase())))
      filterMatches++;
  }
  if (filters.priceRange?.max) {
    filterTotal++;
    if (product.price <= filters.priceRange.max) filterMatches++;
  }
  if (filters.priceRange?.min) {
    filterTotal++;
    if (product.price >= filters.priceRange.min) filterMatches++;
  }

  const filterScore =
    filterTotal > 0 ? (filterMatches / filterTotal) * 100 : 50;

  // Personal score
  let personalScore = 50;
  if (userProfile) {
    let pm = 0,
      pt = 0;
    if (userProfile.skinType) {
      pt++;
      const st = product.suitableFor?.skinType || [];
      if (st.includes(userProfile.skinType) || st.includes("all")) pm++;
    }
    if (userProfile.hairType) {
      pt++;
      const ht = product.suitableFor?.hairType || [];
      if (ht.includes(userProfile.hairType) || ht.includes("all")) pm++;
    }
    if (userProfile.wishlistIds?.includes(product._id.toString())) {
      pm += 1.5;
      pt += 1.5;
    }
    if (userProfile.purchasedCategories?.includes(product.category)) {
      pm += 0.5;
      pt += 0.5;
    }
    personalScore = pt > 0 ? Math.min(100, (pm / pt) * 100) : 50;
  }

  // Quality score
  const qualityScore = Math.min(
    100,
    ((product.rating || 0) / 5) * 50 +
      Math.min(25, product.numReviews || 0) +
      (product.isFeatured ? 25 : 0),
  );

  return (
    aiScore * 0.4 + filterScore * 0.3 + personalScore * 0.2 + qualityScore * 0.1
  );
};

// ─────────────────────────────────────────
//  MAIN SEARCH ROUTE
//  POST /api/search
// ─────────────────────────────────────────
export const semanticSearch = async (req, res) => {
  const { query } = req.body;
  const userId = req.user?._id;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ message: "Search query too short" });
  }

  const start = Date.now();

  try {
    // Step 1: Parse with rules (always works, no API needed)
    let filters = parseQuery(query);

    // Step 2: Optionally enhance with Groq AI (silent fail)
    filters = await enhanceWithAI(query, filters);

    // Step 3: User profile for personalization
    let userProfile = null;
    if (userId) {
      try {
        const user = await User.findById(userId)
          .select("skinType hairType wishlist")
          .lean();
        const orders = await Order.find({ user: userId, isPaid: true })
          .select("orderItems")
          .limit(10)
          .lean();

        const purchasedCats = new Set();
        for (const o of orders) {
          for (const item of o.orderItems || []) {
            const p = await Product.findById(item.product)
              .select("category")
              .lean();
            if (p) purchasedCats.add(p.category);
          }
        }

        userProfile = {
          skinType: user?.skinType,
          hairType: user?.hairType,
          wishlistIds: (user?.wishlist || []).map(String),
          purchasedCategories: [...purchasedCats],
        };
      } catch {
        /* personalization fails silently */
      }
    }

    // Step 4: Score all products
    const allProducts = await Product.find({}).lean();
    const scored = allProducts
      .map((p) => ({
        product: p,
        score: scoreProduct(p, query, filters, userProfile),
      }))
      .filter((s) => s.score >= 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, 18)
      .map((s) => ({ ...s.product, _score: Math.round(s.score) }));

    // Step 5: Fallback — if no results, return broad match
    let results = scored;
    if (results.length === 0) {
      const rx = new RegExp(
        query
          .split(" ")
          .filter((w) => w.length > 2)
          .join("|"),
        "i",
      );
      const fallback = await Product.find({
        $or: [{ name: rx }, { description: rx }, { category: rx }],
      })
        .limit(8)
        .lean();
      results = fallback;
    }

    res.json({
      results,
      total: results.length,
      query,
      parsedFilters: filters,
      personalized: !!userProfile,
      aiEnhanced: !!process.env.GROQ_API_KEY,
      responseMs: Date.now() - start,
    });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getSearchSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);

  try {
    const rx = new RegExp(q, "i");
    const products = await Product.find({
      $or: [{ name: rx }, { category: rx }, { brand: rx }],
    })
      .select("name category brand")
      .limit(8)
      .lean();

    const suggestions = [
      ...new Set([
        ...products.map((p) => p.name),
        ...products.map((p) => p.category),
        ...products.map((p) => p.brand).filter(Boolean),
      ]),
    ].slice(0, 8);

    res.json(suggestions);
  } catch {
    res.json([]);
  }
};
