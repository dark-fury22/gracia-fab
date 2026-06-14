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
const callAI = async (prompt, retries = 2) => {
  // Try Gemini
  const gemini = getGemini();
  if (gemini) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
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
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        max_tokens: 2000,
      });
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
Create a skincare routine. Return ONLY valid JSON, nothing else.

Customer profile:
- Skin type: ${skinType}
- Age: ${ageRange || "20s"}
- Concerns: ${(concerns || []).join(", ") || "general care"}
- Budget: ${budget || "moderate"}
- Location: Nigeria (tropical, hot, humid)

Store products available (use exact IDs when relevant):
${productList}

Return this exact JSON structure:
{
  "morningRoutine": [
    {"step":1,"type":"Gentle Cleanser","instruction":"Wash face with lukewarm water","why":"Removes overnight oils","productId":null,"productName":null,"tip":"In Lagos heat, cleanse twice daily"},
    {"step":2,"type":"Toner","instruction":"Apply with cotton pad","why":"Balances skin pH","productId":null,"productName":null,"tip":"Look for niacinamide for oily skin"},
    {"step":3,"type":"Moisturiser","instruction":"Apply small amount evenly","why":"Hydration is key even for oily skin","productId":null,"productName":null,"tip":"Gel formulas work well in humidity"},
    {"step":4,"type":"SPF 50 Sunscreen","instruction":"Apply generously as last step","why":"UV protection is critical for dark skin","productId":null,"productName":null,"tip":"Reapply every 2 hours outdoors"}
  ],
  "nightRoutine": [
    {"step":1,"type":"Double Cleanse","instruction":"Oil cleanser then foaming cleanser","why":"Removes sunscreen and makeup fully","productId":null,"productName":null,"tip":"Never sleep with makeup on"},
    {"step":2,"type":"Treatment Serum","instruction":"Apply 2-3 drops to face","why":"Active ingredients work overnight","productId":null,"productName":null,"tip":"Vitamin C for dark spots, retinol for aging"},
    {"step":3,"type":"Night Moisturiser","instruction":"Apply generous amount","why":"Skin repairs overnight","productId":null,"productName":null,"tip":"Shea butter works great for dry patches"}
  ],
  "weeklyTreatments": [
    {"step":1,"type":"Exfoliator","frequency":"2x per week","instruction":"Gentle circular motions","why":"Removes dead skin cells","productId":null,"productName":null},
    {"step":2,"type":"Face Mask","frequency":"1x per week","instruction":"Leave on 15-20 mins","why":"Deep treatment boost","productId":null,"productName":null}
  ],
  "generalTips": [
    "Drink at least 2 litres of water daily — Lagos heat dehydrates skin fast",
    "Change your pillowcase every 3 days to prevent breakouts",
    "Always patch test new products on your jaw first"
  ],
  "estimatedMonthlyBudget": "NGN 15,000 - NGN 25,000",
  "routineComplexity": "beginner"
}`;

    const raw = await callAI(prompt);
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
