import Groq from "groq-sdk";
import Product from "../models/Product.js";

let groqClient = null;
const getGroq = () => {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

// @desc  Semantic search — AI parses query into filters
// @route POST /api/search
export const semanticSearch = async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ message: "Query too short" });
  }

  try {
    // Step 1 — Ask Groq to parse the natural language query
    let filters = {};
    let keywords = query;

    try {
      const prompt = `You are a beauty product search assistant for a Nigerian beauty store called Gracia Fab.

Parse this search query and extract structured filters. Return ONLY valid JSON, no explanation.

Query: "${query}"

Return JSON with these optional fields (only include if clearly relevant):
{
  "categories": [],        // from: ["skincare", "haircare", "wig", "bridal"]
  "skinTypes": [],         // from: ["oily", "dry", "combination", "normal", "sensitive"]
  "hairTypes": [],         // from: ["straight", "wavy", "curly", "coily"]
  "concerns": [],          // e.g. ["acne", "dark spots", "frizz", "hair loss"]
  "maxPrice": null,        // number in NGN if mentioned
  "minPrice": null,
  "keywords": "",          // cleaned search keywords
  "intent": ""             // one of: "browse", "problem", "occasion", "ingredient"
}`;

      const completion = await getGroq().chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        max_tokens: 300,
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) filters = JSON.parse(jsonMatch[0]);
      if (filters.keywords) keywords = filters.keywords;
    } catch (aiErr) {
      console.log("AI parse failed, using basic search:", aiErr.message);
    }

    // Step 2 — Build MongoDB query from filters
    const mongoQuery = {};
    const orConditions = [];

    // Text search on name/description/tags
    if (keywords) {
      const regex = new RegExp(keywords.split(" ").join("|"), "i");
      orConditions.push(
        { name: regex },
        { description: regex },
        { tags: { $in: [regex] } },
        { brand: regex },
      );
    }

    // Category filter
    if (filters.categories?.length > 0) {
      mongoQuery.category = { $in: filters.categories };
    }

    // Skin type filter
    if (filters.skinTypes?.length > 0) {
      mongoQuery["suitableFor.skinType"] = {
        $in: [...filters.skinTypes, "all"],
      };
    }

    // Hair type filter
    if (filters.hairTypes?.length > 0) {
      mongoQuery["suitableFor.hairType"] = {
        $in: [...filters.hairTypes, "all"],
      };
    }

    // Concerns filter
    if (filters.concerns?.length > 0) {
      const concernRegex = new RegExp(filters.concerns.join("|"), "i");
      orConditions.push(
        { tags: { $in: filters.concerns } },
        { "suitableFor.concern": { $in: filters.concerns } },
        { description: concernRegex },
      );
    }

    // Price range
    if (filters.maxPrice) mongoQuery.price = { $lte: filters.maxPrice };
    if (filters.minPrice) {
      mongoQuery.price = { ...mongoQuery.price, $gte: filters.minPrice };
    }

    // Combine conditions
    const finalQuery =
      orConditions.length > 0
        ? { ...mongoQuery, $or: orConditions }
        : mongoQuery;

    const products = await Product.find(finalQuery)
      .sort({ isFeatured: -1, rating: -1 })
      .limit(20);

    // Step 3 — If no results, fallback to broad search
    let results = products;
    if (products.length === 0 && query) {
      const fallbackRegex = new RegExp(query.split(" ").join("|"), "i");
      results = await Product.find({
        $or: [
          { name: fallbackRegex },
          { description: fallbackRegex },
          { category: fallbackRegex },
          { tags: { $in: [fallbackRegex] } },
        ],
      }).limit(10);
    }

    res.json({
      results,
      total: results.length,
      parsedFilters: filters,
      query: query,
    });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc  Quick autocomplete suggestions
// @route GET /api/search/suggestions?q=...
export const getSearchSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);

  try {
    const regex = new RegExp(q, "i");
    const products = await Product.find({
      $or: [{ name: regex }, { category: regex }, { brand: regex }],
    })
      .select("name category brand")
      .limit(6);

    const suggestions = [
      ...new Set([
        ...products.map((p) => p.name),
        ...products.map((p) => p.category),
      ]),
    ].slice(0, 8);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json([]);
  }
};
