import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import Product from "../models/Product.js";
import User from "../models/User.js";

// ── Lazy clients ──────────────────────────
let geminiClient = null;
let groqClient = null;

const getGemini = () => {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
};

const getGroq = () => {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

// ── Sleep helper for retry delays ─────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Call AI with Gemini first, Groq fallback ─
const callAI = async (prompt, schema = null, retries = 2) => {
  // Try Gemini
  const gemini = getGemini();
  if (gemini) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const config = {
          model: "gemini-2.0-flash"
        };
        if (schema) {
          config.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: schema
          };
        }
        const model = gemini.getGenerativeModel(config);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("✅ Gemini responded for routine");
        return text;
      } catch (err) {
        if (err.message?.includes("429") || err.status === 429) {
          // Rate limited — wait and retry
          const waitMs = (attempt + 1) * 5000; // 5s, 10s, 15s
          console.log(
            `⏳ Gemini rate limited. Waiting ${waitMs / 1000}s before retry ${attempt + 1}/${retries}...`,
          );
          if (attempt < retries) await sleep(waitMs);
        } else {
          console.log("Gemini error, trying Groq:", err.message);
          break; // Non-rate-limit error → fall through to Groq immediately
        }
      }
    }
  }

  // Fall back to Groq
  const groq = getGroq();
  if (groq) {
    try {
      console.log("🔄 Using Groq fallback for routine...");
      const config = {
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      };
      if (schema) {
        config.response_format = { type: "json_object" };
      }
      const completion = await groq.chat.completions.create(config);
      return completion.choices[0]?.message?.content || "";
    } catch (groqErr) {
      console.error("Groq also failed:", groqErr.message);
      throw new Error("Both AI services failed. Please try again in a moment.");
    }
  }

  throw new Error(
    "No AI service configured. Add GEMINI_API_KEY or GROQ_API_KEY to server .env",
  );
};

// ── Parse JSON safely from AI response ────
const parseJSON = (text) => {
  const clean = text.replace(/```json|```/g, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not extract JSON from AI response");
  return JSON.parse(match[0]);
};

const routineSchema = {
  type: "OBJECT",
  properties: {
    morningRoutine: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          step: { type: "INTEGER" },
          type: { type: "STRING" },
          instruction: { type: "STRING" },
          why: { type: "STRING" },
          productId: { type: "STRING" },
          productName: { type: "STRING" },
          tip: { type: "STRING" }
        },
        required: ["step", "type", "instruction", "why"]
      }
    },
    nightRoutine: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          step: { type: "INTEGER" },
          type: { type: "STRING" },
          instruction: { type: "STRING" },
          why: { type: "STRING" },
          productId: { type: "STRING" },
          productName: { type: "STRING" },
          tip: { type: "STRING" }
        },
        required: ["step", "type", "instruction", "why"]
      }
    },
    weeklyTreatments: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          step: { type: "INTEGER" },
          type: { type: "STRING" },
          frequency: { type: "STRING" },
          instruction: { type: "STRING" },
          why: { type: "STRING" },
          productId: { type: "STRING" },
          productName: { type: "STRING" }
        },
        required: ["step", "type", "frequency", "instruction", "why"]
      }
    },
    generalTips: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    estimatedMonthlyBudget: { type: "STRING" },
    routineComplexity: { type: "STRING", enum: ["beginner", "intermediate", "advanced"] }
  },
  required: [
    "morningRoutine",
    "nightRoutine",
    "weeklyTreatments",
    "generalTips",
    "estimatedMonthlyBudget",
    "routineComplexity"
  ]
};

// @route POST /api/routine/generate
export const generateRoutine = async (req, res) => {
  const { skinType, ageRange, concerns, budget } = req.body;

  if (!skinType) {
    return res.status(400).json({ message: "Skin type is required" });
  }

  try {
    // Get skincare products for context
    const products = await Product.find({ category: "skincare" })
      .select("_id name price tags suitableFor brand")
      .limit(30)
      .lean();

    const productList = products
      .map(
        (p) =>
          `ID:${p._id}|${p.name}|NGN${p.price}|tags:${(p.tags || []).join(",")}|skin:${(p.suitableFor?.skinType || []).join(",")}`,
      )
      .join("\n");

    const prompt = `You are a beauty advisor at Gracia Fab, a Nigerian beauty store.
Create a skincare routine.

Customer profile:
- Skin type: ${skinType}
- Age: ${ageRange || "20s"}
- Concerns: ${(concerns || []).join(", ") || "general care"}
- Budget: ${budget || "moderate"}
- Location: Nigeria (tropical, hot, humid)

Store products available (use exact IDs when relevant):
${productList}

Response format must match the requested routine schema. Set productId and productName to exact values from store products when matching, or leave empty if recommending generic types.`;

    const raw = await callAI(prompt, routineSchema);
    const routine = parseJSON(raw);

    // Enrich steps with product data from DB
    const enrichStep = async (step) => {
      if (step.productId && step.productId !== "null") {
        try {
          const p = await Product.findById(step.productId)
            .select("name price image _id")
            .lean();
          if (p) step.product = p;
          else step.productId = null;
        } catch {
          step.productId = null;
        }
      }
      return step;
    };

    routine.morningRoutine = await Promise.all(
      (routine.morningRoutine || []).map(enrichStep),
    );
    routine.nightRoutine = await Promise.all(
      (routine.nightRoutine || []).map(enrichStep),
    );
    routine.weeklyTreatments = await Promise.all(
      (routine.weeklyTreatments || []).map(enrichStep),
    );

    console.log("✅ Routine generated successfully");
    res.json({ routine, profile: { skinType, ageRange, concerns } });
  } catch (err) {
    console.error("❌ generateRoutine error:", err.message);

    if (err.message?.includes("rate") || err.message?.includes("429")) {
      return res.status(429).json({
        message: "AI is busy. Please wait 30 seconds and try again.",
      });
    }

    res.status(500).json({
      message: err.message || "Could not generate routine. Please try again.",
    });
  }
};
