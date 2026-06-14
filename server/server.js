import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import recommendRoutes from "./routes/recommendRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import crypto from "crypto";
import loyaltyRoutes from "./routes/loyaltyRoutes.js";
import fetch from "node-fetch";
import { startWorkers } from "./queues/workers.js";
import skinAnalysisRoutes from "./routes/skinAnalysisRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import cron from "node-cron";
import { sendMarketingEmails } from "./controllers/marketingController.js";

dotenv.config();

const app = express();

connectDB();
startWorkers();

// ── Security headers (helmet protects against common attacks)
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }),
);

// ── General rate limit: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // max 100 requests
  message: {
    message: "Too many requests, please slow down and try again in a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Strict limit for auth routes (stop password guessing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // only 10 login attempts
  message: {
    message: "Too many login attempts. Please wait 15 minutes.",
  },
});

// ── AI routes are expensive — limit them
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // only 5 AI calls per minute
  message: {
    message: "Too many AI requests. Please wait a moment.",
  },
});

// ── Paystack Webhook — receives payment confirmations directly from Paystack
// Must be RAW body (before JSON parsing) for signature verification
app.post(
  "/api/webhooks/paystack",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["x-paystack-signature"];
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Step 1: Verify this actually came from Paystack
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.body)
      .digest("hex");

    if (hash !== signature) {
      console.log("❌ Invalid Paystack webhook signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(req.body);
    console.log("📩 Paystack webhook event:", event.event);

    // Step 2: Handle the payment success event
    if (event.event === "charge.success") {
      try {
        const reference = event.data.reference;
        const amount = event.data.amount / 100; // Convert kobo to NGN

        // Find order by reference
        const Order = (await import("./models/Order.js")).default;
        const order = await Order.findOne({
          "paymentResult.reference": reference,
        });

        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.status = "processing";
          order.paymentResult = {
            reference,
            status: "success",
            amount,
            channel: event.data.channel,
            paidAt: event.data.paid_at,
          };
          await order.save();
          console.log(`✅ Order ${order._id} marked as paid via webhook`);
        }
      } catch (err) {
        console.error("Webhook processing error:", err.message);
      }
    }

    // Always respond quickly to Paystack
    res.json({ received: true });
  },
);

// ── AI Beauty Chat (Gemini or Groq fallback)
app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  try {
    const Product = (await import("./models/Product.js")).default;
    const products = await Product.find({})
      .select("name price category tags image _id")
      .limit(30)
      .lean();
    const productList = products
      .map((p) => `ID:${p._id} | ${p.name} | ${p.category} | ₦${p.price}`)
      .join("\n");

    const systemInstruction = `You are a friendly beauty advisor for Gracia Fab, a Nigerian beauty store.
Help with skincare, haircare, wigs, and bridal beauty.
Keep responses to 2-3 sentences max. Be warm and helpful.
If recommending products from our catalog, add "PRODUCTS: ["id1","id2"]" at the end.

Available products:
${productList}`;

    let reply = "";

    // Try Gemini first
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction,
        });

        // Build Gemini chat history format
        const geminiHistory = history.slice(-6).map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content || m.text }],
        }));

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(message);
        reply = result.response.text();
      } catch (geminiErr) {
        console.log("Chat Gemini failed, using Groq:", geminiErr.message);
      }
    }

    // Fallback to Groq
    if (!reply && process.env.GROQ_API_KEY) {
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemInstruction },
          ...history.slice(-6).map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.text || m.content,
          })),
          { role: "user", content: message },
        ],
      });
      reply = completion.choices[0]?.message?.content || "";
    }

    if (!reply) {
      reply =
        "I'm here to help with your beauty questions! Please ask me about skincare, haircare, or our products 💄";
    }

    // Extract recommended product IDs
    let recommendedProducts = [];
    const prodMatch = reply.match(/PRODUCTS:\s*\[([^\]]+)\]/);
    if (prodMatch) {
      reply = reply.replace(/PRODUCTS:\s*\[[^\]]+\]/, "").trim();
      const ids = prodMatch[1]
        .match(/"([^"]+)"/g)
        ?.map((id) => id.replace(/"/g, ""));
      if (ids?.length) {
        recommendedProducts = await Product.find({
          _id: { $in: ids },
        })
          .select("name price image _id")
          .limit(2);
      }
    }

    res.json({ reply, products: recommendedProducts });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.json({
      reply: "I'm having a quick break! Try again in a moment 💄",
      products: [],
    });
  }
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL, // Vercel URL
      "https://gracia-fab.vercel.app", // your actual Vercel URL
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/api/", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/recommend", aiLimiter);
app.use("/api/search", aiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/recommend", recommendRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/sitemap.xml", sitemapRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/skin-analysis", skinAnalysisRoutes);
app.use("/api/track", trackingRoutes);

app.use(notFound);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({ message: "💄 BeautyAI API is running!" });
});

// TEMPORARY DEBUG ROUTE — remove after testing
app.get("/api/debug-paystack/:ref", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${req.params.ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV,
  });
});

cron.schedule("0 10 * * *", async () => {
  console.log("📧 Running daily marketing email job...");
  await sendMarketingEmails();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
