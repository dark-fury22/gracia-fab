import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/Product.js";

// ── Lazy init — only created when first called
let geminiClient = null;

const getGemini = () => {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not set in server .env file");
    }
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
};

// @route POST /api/skin-analysis
// @access Private (logged in users only)
export const analyseSkin = async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg" } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ message: "No image provided" });
  }

  try {
    const genAI = getGemini();

    // Use gemini-1.5-flash — free, fast, supports images
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("🔬 Running Gemini skin analysis...");

    const prompt = `You are a cosmetic beauty advisor AI for Gracia Fab, a Nigerian beauty store.

Analyse this selfie image and assess the following visible cosmetic skin indicators.
IMPORTANT: This is for cosmetic product recommendations ONLY — not medical diagnosis.
DO NOT give any medical advice. Only comment on what you can visibly see.

Respond ONLY with valid JSON. No markdown. No explanation. Just the JSON object:

{
  "overallCondition": "great",
  "skinTone": "medium",
  "concerns": {
    "acne": {
      "detected": false,
      "severity": "none",
      "note": "Skin looks clear"
    },
    "darkSpots": {
      "detected": false,
      "severity": "none",
      "note": "Even tone visible"
    },
    "oiliness": {
      "detected": false,
      "severity": "none",
      "note": ""
    },
    "dryness": {
      "detected": false,
      "severity": "none",
      "note": ""
    },
    "unevenTone": {
      "detected": false,
      "severity": "none",
      "note": ""
    },
    "redness": {
      "detected": false,
      "severity": "none",
      "note": ""
    }
  },
  "detectedSkinType": "normal",
  "topConcerns": [],
  "generalAdvice": "Your skin looks healthy! Keep up with daily SPF and hydration especially in Nigeria's tropical climate.",
  "disclaimer": "For cosmetic guidance only. Consult a dermatologist for medical skin concerns."
}

Use these exact values:
- overallCondition: "great" | "good" | "fair" | "needs_attention"
- skinTone: "fair" | "light" | "medium" | "tan" | "deep" | "rich"
- severity: "none" | "mild" | "moderate" | "visible"
- detectedSkinType: "oily" | "dry" | "combination" | "normal" | "sensitive"
- topConcerns: array of strings like ["acne", "dark spots"] — can be empty`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
      prompt,
    ]);

    const raw = result.response.text();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Could not parse Gemini response");
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log(
      "✅ Skin analysis done:",
      analysis.detectedSkinType,
      "|",
      analysis.overallCondition,
    );

    // Find matching products based on skin type and concerns
    const skinType = analysis.detectedSkinType || "normal";
    const topConcerns = analysis.topConcerns || [];

    const tagSearchTerms = [...topConcerns, skinType].filter(Boolean);

    const products = await Product.find({
      category: "skincare",
      $or: [
        { "suitableFor.skinType": { $in: [skinType, "all"] } },
        {
          "suitableFor.concern": {
            $elemMatch: { $regex: topConcerns.join("|"), $options: "i" },
          },
        },
        {
          tags: {
            $elemMatch: { $regex: tagSearchTerms.join("|"), $options: "i" },
          },
        },
      ],
    })
      .sort({ isFeatured: -1, rating: -1 })
      .limit(6)
      .lean();

    // If no specific match, return top-rated skincare
    const finalProducts =
      products.length > 0
        ? products
        : await Product.find({ category: "skincare" })
            .sort({ rating: -1 })
            .limit(4)
            .lean();

    res.json({
      success: true,
      analysis,
      products: finalProducts,
    });
  } catch (err) {
    console.error("❌ Skin analysis error:", err.message);

    if (err.message.includes("GEMINI_API_KEY")) {
      return res.status(503).json({
        message:
          "AI service not configured. Please add GEMINI_API_KEY to server .env",
      });
    }

    if (err.message.includes("quota") || err.message.includes("rate")) {
      return res.status(429).json({
        message: "Too many requests. Please wait a moment and try again.",
      });
    }

    if (err.message.includes("image") || err.message.includes("parse")) {
      return res.status(400).json({
        message:
          "Could not analyse this image. Please try a clearer selfie facing the camera directly.",
      });
    }

    res.status(500).json({
      message:
        "Analysis failed. Please try again with a clearer photo in good lighting.",
    });
  }
};
