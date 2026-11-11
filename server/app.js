import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import logger from "./utils/logger.js";
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
import Order from "./models/Order.js";
import { isValidWebhookSignature } from "./services/monnify.js";
import { confirmOrderPayment } from "./services/orderPayment.js";
import loyaltyRoutes from "./routes/loyaltyRoutes.js";
import skinAnalysisRoutes from "./routes/skinAnalysisRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Trust Render's reverse proxy for the first hop, so req.ip (and
// express-rate-limit's IP-based keying) reflects the real visitor instead
// of throwing on the X-Forwarded-For header Render always sets.
// https://express-rate-limit.github.io/ERR_ERL_UNEXPECTED_X_FORWARDED_FOR/
app.set("trust proxy", 1);

// ── Structured request logging — every request gets a log line with
// method, path, status code and response time.
app.use(pinoHttp({ logger }));

// Ensure public/uploads folder exists
const uploadsDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Security headers (helmet protects against common attacks)
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }),
);

// ── CORS configuration — must be early to affect all routes
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

// Functional tests reuse this same `app` (and its in-memory limiter state)
// across dozens of requests per file — real caps there would make test
// outcomes depend on how many earlier tests happened to run, not on the
// behavior under test. Limits stay exactly as configured outside tests.
const isTest = process.env.NODE_ENV === "test";

// ── General rate limit: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTest ? 100000 : 100, // max 100 requests
  message: {
    message: "Too many requests, please slow down and try again in a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Strict limit for auth routes (stop password guessing in prod; relaxed in dev/test)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest || process.env.NODE_ENV !== "production" ? 1000 : 10,
  message: {
    message: "Too many login attempts. Please wait 15 minutes.",
  },
});

// ── AI routes are expensive — limit them
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTest ? 100000 : 5, // only 5 AI calls per minute
  message: {
    message: "Too many AI requests. Please wait a moment.",
  },
});

// ── Conversational chat limiter: allows natural multi-turn dialogue while preventing abuse
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isTest ? 100000 : 30, // 30 messages per minute
  message: {
    message: "You're chatting quite fast! Please wait a moment for our AI advisor.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Apply general rate limit to all /api/ routes
app.use("/api/", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);
app.use("/api/auth/resend-otp", authLimiter);
app.use("/api/recommend", aiLimiter);
app.use("/api/search", aiLimiter);

// ── Monnify Webhook — payment notifications straight from Monnify, so an order
// still gets marked paid if the customer closes the tab before the checkout
// page confirms it. Must be RAW body (before JSON parsing) for the signature.
//
// The payload is never trusted on its own: we only take the paymentReference
// from it and re-query Monnify for the real status (Monnify's own guidance —
// and necessary because sandbox webhooks aren't signed at all). In production
// a valid `monnify-signature` is still required, to turn away junk early.
app.post(
  "/api/webhooks/monnify",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["monnify-signature"];

    if (signature || process.env.NODE_ENV === "production") {
      if (!isValidWebhookSignature(req.body, signature)) {
        logger.warn("Invalid Monnify webhook signature");
        return res.status(400).json({ message: "Invalid signature" });
      }
    }

    let event;
    try {
      event = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ message: "Invalid JSON" });
    }
    logger.info({ eventType: event.eventType }, "Monnify webhook received");

    if (event.eventType === "SUCCESSFUL_TRANSACTION") {
      try {
        const reference = event.eventData?.paymentReference;
        const order = reference
          ? await Order.findOne({ paymentReference: reference })
          : null;

        if (order && !order.isPaid) {
          const result = await confirmOrderPayment(order);
          if (result.ok) {
            logger.info({ orderId: order._id }, "Order marked as paid via webhook");
          } else {
            logger.warn(
              { orderId: order._id, reason: result.message },
              "Webhook payment not confirmed",
            );
          }
        }
      } catch (err) {
        // Non-2xx makes Monnify retry (every 5 min, up to 12 times) — what we
        // want if e.g. their status API was briefly unreachable.
        logger.error({ err }, "Webhook processing error");
        return res.status(500).json({ message: "Processing error" });
      }
    }

    res.json({ received: true });
  },
);

// ── Global Body Parsers (after the Monnify webhook, before routes that require JSON body)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ── AI Beauty Chat (Gemini or Groq fallback)
app.post("/api/chat", chatLimiter, async (req, res) => {
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

    const systemInstruction = `You are a warm, luxury beauty concierge for Gracia Fab, an upscale Nigerian beauty maison.
You assist customers with melanin-rich skincare (hyperpigmentation, sun protection, hydration), raw virgin glueless wigs, bridal beauty, and haircare.
Keep responses concise (2-3 sentences max), elegant, and actionable.
When relevant, recommend 1 or 2 specific products from our catalog below by adding PRODUCTS: ["id1", "id2"] at the very end of your response.

Available products:
${productList}`;

    let reply = "";

    // Try Gemini first
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Select model (Gemini 2.0 Flash or 1.5 Flash)
        const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });

        // Build Gemini chat history format:
        // Must start with 'user', alternate between 'user' and 'model', and end with 'model' before sendMessage
        const geminiHistory = [];
        for (const m of history.slice(-8)) {
          const role = (m.role === "assistant" || m.sender === "ai") ? "model" : "user";
          const text = (m.content || m.text || "").trim();
          if (!text) continue;
          if (geminiHistory.length === 0 && role === "model") {
            continue; // Gemini requires the first turn in history to be 'user'
          }
          const last = geminiHistory[geminiHistory.length - 1];
          if (last && last.role === role) {
            last.parts[0].text += `\n${text}`;
          } else {
            geminiHistory.push({ role, parts: [{ text }] });
          }
        }
        if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === "user") {
          geminiHistory.pop();
        }

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(message);
        reply = result.response.text();
      } catch (geminiErr) {
        logger.warn({ err: geminiErr }, "Chat Gemini failed, falling back to Groq");
      }
    }

    // Fallback to Groq
    if (!reply && process.env.GROQ_API_KEY) {
      const Groq = (await import("groq-sdk")).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const groqMessages = [
        { role: "system", content: systemInstruction },
        ...history.slice(-6).map((m) => ({
          role: (m.role === "assistant" || m.sender === "ai") ? "assistant" : "user",
          content: m.text || m.content || "",
        })).filter(m => m.content.trim().length > 0),
        { role: "user", content: message },
      ];

      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        max_tokens: 300,
        temperature: 0.7,
        messages: groqMessages,
      });
      reply = completion.choices[0]?.message?.content || "";
    }

    if (!reply) {
      reply =
        "Welcome to Gracia Fab! I am here to help you find the perfect skincare, haircare, glueless raw wigs, or bridal beauty formulations. How may I assist you today? ✨";
    }

    // Extract recommended product IDs
    let recommendedProducts = [];
    const prodMatch = reply.match(/PRODUCTS:\s*\[([^\]]+)\]/i);
    if (prodMatch) {
      reply = reply.replace(/PRODUCTS:\s*\[[^\]]+\]/i, "").trim();
      const rawIds = prodMatch[1].match(/[a-f0-9]{24}|[a-zA-Z0-9_-]{8,}/gi);
      if (rawIds?.length) {
        recommendedProducts = await Product.find({
          _id: { $in: rawIds },
        })
          .select("name price image _id category")
          .limit(2)
          .lean();
      }
    }

    res.json({ reply, products: recommendedProducts });
  } catch (err) {
    logger.error({ err }, "Chat error");
    res.json({
      reply: "I'm having a brief moment! Feel free to ask about our skincare, haircare, raw wigs, or bridal beauty services ✨",
      products: [],
    });
  }
});

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
app.use("/api/routine", routineRoutes);

app.get("/", (req, res) => {
  res.json({ message: "💄 BeautyAI API is running!" });
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

app.use(notFound);
app.use(errorHandler);

export default app;
