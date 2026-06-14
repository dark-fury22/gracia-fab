import Product from "../models/Product.js";
import User from "../models/User.js";
import Groq from "groq-sdk";

let groqClient = null;
const getGroq = () => {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

// @route POST /api/routine/generate
export const generateRoutine = async (req, res) => {
  const { skinType, ageRange, concerns, hairType, budget } = req.body;

  if (!skinType)
    return res.status(400).json({ message: "Skin type is required" });

  try {
    // Get all skincare products from DB for context
    const products = await Product.find({ category: "skincare" })
      .select("_id name price tags suitableFor brand")
      .limit(40)
      .lean();

    const productList = products
      .map(
        (p) =>
          `ID:${p._id}|${p.name}|₦${p.price}|${(p.tags || []).join(",")}|${(p.suitableFor?.skinType || []).join(",")}`,
      )
      .join("\n");

    const prompt = `You are a professional beauty advisor for Gracia Fab, a Nigerian beauty store.

Create a personalized skincare routine for this person:
- Skin type: ${skinType}
- Age range: ${ageRange || "20s-30s"}
- Main concerns: ${(concerns || []).join(", ") || "general skincare"}
- Budget per product: ${budget || "moderate"}
- Climate: Tropical Nigerian weather (hot, humid)

Available products in our store:
${productList}

Return ONLY valid JSON, no markdown:
{
  "morningRoutine": [
    {
      "step": 1,
      "type": "Cleanser",
      "instruction": "Brief instruction",
      "why": "Why this step matters for their skin",
      "productId": "matching_product_id_or_null",
      "productName": "product name if matched",
      "tip": "Pro tip"
    }
  ],
  "nightRoutine": [
    {
      "step": 1,
      "type": "Double Cleanse",
      "instruction": "Brief instruction",
      "why": "Why this step matters",
      "productId": null,
      "productName": null,
      "tip": "Pro tip"
    }
  ],
  "weeklyTreatments": [
    {
      "step": 1,
      "type": "Exfoliation",
      "frequency": "2-3x per week",
      "instruction": "Brief instruction",
      "why": "Why",
      "productId": null,
      "productName": null
    }
  ],
  "generalTips": ["tip1", "tip2", "tip3"],
  "estimatedMonthlyBudget": "₦XX,000 - ₦XX,000",
  "routineComplexity": "beginner|intermediate|advanced"
}`;

    const completion = await getGroq().chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse routine");

    const routine = JSON.parse(match[0]);

    // Enrich steps with full product data where matched
    const enrichStep = async (step) => {
      if (step.productId) {
        try {
          const product = await Product.findById(step.productId)
            .select("name price image _id")
            .lean();
          if (product) step.product = product;
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

    // Save to user's profile if authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          savedRoutines: {
            $each: [
              {
                profile: { skinType, ageRange, concerns },
                routine,
                createdAt: new Date(),
              },
            ],
            $slice: -5,
          },
        },
      });
    }

    res.json({ routine, profile: { skinType, ageRange, concerns } });
  } catch (err) {
    console.error("Routine generation error:", err.message);
    res
      .status(500)
      .json({ message: "Could not generate routine. Please try again." });
  }
};
