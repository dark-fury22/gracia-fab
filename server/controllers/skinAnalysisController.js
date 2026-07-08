import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/Product.js";

let geminiClient = null;
const getGemini = () => {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const skinAnalysisSchema = {
  type: "OBJECT",
  properties: {
    overallCondition: {
      type: "STRING",
      description: "Overall condition of the skin",
      enum: ["great", "good", "fair", "needs_attention"]
    },
    skinTone: {
      type: "STRING",
      description: "Apparent skin tone shade group",
      enum: ["fair", "light", "medium", "tan", "deep", "rich"]
    },
    concerns: {
      type: "OBJECT",
      properties: {
        acne: {
          type: "OBJECT",
          properties: {
            detected: { type: "BOOLEAN" },
            severity: { type: "STRING", enum: ["none", "mild", "moderate", "visible"] },
            note: { type: "STRING" }
          },
          required: ["detected", "severity", "note"]
        },
        darkSpots: {
          type: "OBJECT",
          properties: {
            detected: { type: "BOOLEAN" },
            severity: { type: "STRING", enum: ["none", "mild", "moderate", "visible"] },
            note: { type: "STRING" }
          },
          required: ["detected", "severity", "note"]
        },
        oiliness: {
          type: "OBJECT",
          properties: {
            detected: { type: "BOOLEAN" },
            severity: { type: "STRING", enum: ["none", "mild", "moderate", "visible"] },
            note: { type: "STRING" }
          },
          required: ["detected", "severity", "note"]
        },
        dryness: {
          type: "OBJECT",
          properties: {
            detected: { type: "BOOLEAN" },
            severity: { type: "STRING", enum: ["none", "mild", "moderate", "visible"] },
            note: { type: "STRING" }
          },
          required: ["detected", "severity", "note"]
        },
        unevenTone: {
          type: "OBJECT",
          properties: {
            detected: { type: "BOOLEAN" },
            severity: { type: "STRING", enum: ["none", "mild", "moderate", "visible"] },
            note: { type: "STRING" }
          },
          required: ["detected", "severity", "note"]
        },
        redness: {
          type: "OBJECT",
          properties: {
            detected: { type: "BOOLEAN" },
            severity: { type: "STRING", enum: ["none", "mild", "moderate", "visible"] },
            note: { type: "STRING" }
          },
          required: ["detected", "severity", "note"]
        }
      },
      required: ["acne", "darkSpots", "oiliness", "dryness", "unevenTone", "redness"]
    },
    detectedSkinType: {
      type: "STRING",
      enum: ["oily", "dry", "combination", "normal", "sensitive"]
    },
    topConcerns: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    generalAdvice: {
      type: "STRING"
    },
    disclaimer: {
      type: "STRING"
    }
  },
  required: [
    "overallCondition",
    "skinTone",
    "concerns",
    "detectedSkinType",
    "topConcerns",
    "generalAdvice",
    "disclaimer"
  ]
};

// @route POST /api/skin-analysis
export const analyseSkin = async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg" } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ message: "No image provided" });
  }

  const gemini = getGemini();
  if (!gemini) {
    return res.status(503).json({
      message:
        "AI service not configured. Please add GEMINI_API_KEY to server .env",
    });
  }

  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔬 Skin analysis attempt ${attempt}/${MAX_RETRIES}...`);

      const model = gemini.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: skinAnalysisSchema
        }
      });

      const prompt = `You are a cosmetic beauty advisor AI for Gracia Fab, a Nigerian beauty store.
Analyse this selfie image for cosmetic skin indicators only.
This is NOT medical diagnosis — only cosmetic product recommendations.

Provide analysis based on values:
- overallCondition: great, good, fair, needs_attention
- skinTone: fair, light, medium, tan, deep, rich
- detectedSkinType: oily, dry, combination, normal, sensitive
- concerns severity values: none, mild, moderate, visible`;

      const result = await model.generateContent([
        { inlineData: { data: imageBase64, mimeType } },
        prompt,
      ]);

      const raw = result.response.text();
      const analysis = JSON.parse(raw.trim());
      console.log("✅ Analysis complete:", analysis.detectedSkinType);

      // Find matching products
      const skinType = analysis.detectedSkinType || "normal";
      const concerns = analysis.topConcerns || [];

      const products = await Product.find({
        category: "skincare",
        $or: [
          { "suitableFor.skinType": { $in: [skinType, "all"] } },
          {
            tags: {
              $elemMatch: {
                $regex: concerns.join("|") || "skincare",
                $options: "i",
              },
            },
          },
        ],
      })
        .sort({ isFeatured: -1, rating: -1 })
        .limit(6)
        .lean();

      const finalProducts =
        products.length > 0
          ? products
          : await Product.find({ category: "skincare" })
              .sort({ rating: -1 })
              .limit(4)
              .lean();

      return res.json({ success: true, analysis, products: finalProducts });
    } catch (err) {
      const is429 =
        err.message?.includes("429") ||
        err.status === 429 ||
        err.message?.includes("quota") ||
        err.message?.includes("Too Many");

      if (is429 && attempt < MAX_RETRIES) {
        const waitSec = attempt * 10; // 10s, 20s
        console.log(
          `⏳ Rate limited. Waiting ${waitSec}s before retry ${attempt + 1}...`,
        );
        await sleep(waitSec * 1000);
        continue; // retry
      }

      console.error(
        `❌ Skin analysis failed (attempt ${attempt}):`,
        err.message,
      );

      if (attempt === MAX_RETRIES) {
        if (is429) {
          return res.status(429).json({
            message:
              "AI is busy right now. Please wait 1-2 minutes and try again. (Free tier limit reached)",
          });
        }
        if (err.message?.includes("parse") || err.message?.includes("JSON")) {
          return res.status(400).json({
            message:
              "Could not read the image clearly. Please try a well-lit selfie facing the camera directly.",
          });
        }
        return res.status(500).json({
          message: "Analysis failed. Please try again with a clearer photo.",
        });
      }
    }
  }
};
