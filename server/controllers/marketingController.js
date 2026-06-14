import User from "../models/User.js";
import Product from "../models/Product.js";
import Groq from "groq-sdk";
import { addToQueue, emailQueue } from "../queues/index.js";

let groqClient = null;
const getGroq = () => {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

// Generate personalized email content with AI
const generateEmailContent = async (userName, products, topCategory) => {
  try {
    const productList = products
      .map((p) => `${p.name} (₦${p.price?.toLocaleString()})`)
      .join(", ");

    const completion = await getGroq().chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Write a short, friendly beauty email for a Nigerian beauty store customer.

Customer name: ${userName}
They've been viewing: ${topCategory} products
Recommended products: ${productList}

Requirements:
- 2-3 short sentences max
- Warm and encouraging tone
- Mention 1-2 products naturally
- End with a call to action
- No emojis in the subject line

Return ONLY JSON: {"subject": "...", "body": "..."}`,
        },
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 250,
      temperature: 0.6,
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
};

// @desc  Send marketing emails to interested users
//        Run this via a scheduled job or manually
export const sendMarketingEmails = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find users with recent interests who haven't received email this week
    const users = await User.find({
      "interests.0": { $exists: true },
      "emailPreferences.marketing": { $ne: false },
      $or: [
        { "emailPreferences.lastSent": { $lt: oneWeekAgo } },
        { "emailPreferences.lastSent": { $exists: false } },
      ],
    }).limit(50);

    console.log(`📧 Processing ${users.length} users for marketing emails`);
    let sent = 0;

    for (const user of users) {
      try {
        // Find their top interest category
        const categoryCounts = {};
        for (const interest of user.interests || []) {
          categoryCounts[interest.category] =
            (categoryCounts[interest.category] || 0) + interest.viewCount;
        }
        const topCategory = Object.entries(categoryCounts).sort(
          (a, b) => b[1] - a[1],
        )[0]?.[0];

        if (!topCategory) continue;

        // Get recommended products for their interests
        const viewedIds = (user.interests || [])
          .map((i) => i.productId?.toString())
          .filter(Boolean);
        const products = await Product.find({
          category: topCategory,
          _id: { $nin: viewedIds }, // Don't recommend what they already saw
        })
          .sort({ rating: -1 })
          .limit(3)
          .lean();

        if (products.length === 0) continue;

        // Generate AI email content
        const content = await generateEmailContent(
          user.name?.split(" ")[0] || "Beauty Lover",
          products,
          topCategory,
        );

        if (!content) continue;

        // Build HTML email
        const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#14213D,#1C2E52);padding:32px;text-align:center;">
    <h1 style="color:#FCA311;font-style:italic;margin:0;">Gracia Fab</h1>
    <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px;">Your Beauty Update</p>
  </div>
  <div style="padding:32px;">
    <p style="color:rgba(255,255,255,0.9);font-size:16px;line-height:1.7;">${content.body}</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0;">
      ${products
        .map(
          (p) => `
        <div style="background:#14213D;border-radius:10px;overflow:hidden;text-align:center;">
          <img src="${p.image}" alt="${p.name}" style="width:100%;height:120px;object-fit:cover;">
          <div style="padding:10px;">
            <p style="font-size:12px;color:rgba(255,255,255,0.9);margin:0 0 4px;font-weight:600;">${p.name}</p>
            <p style="color:#FCA311;font-size:13px;font-weight:700;margin:0;">₦${p.price?.toLocaleString()}</p>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="https://gracia-fab.vercel.app/products?category=${topCategory}"
         style="background:#FCA311;color:#000;padding:14px 32px;border-radius:30px;text-decoration:none;font-weight:bold;display:inline-block;">
        Shop Now →
      </a>
    </div>
  </div>
  <div style="padding:16px;text-align:center;border-top:1px solid #14213D;">
    <p style="font-size:11px;color:rgba(255,255,255,0.3);">
      You're receiving this because you're a Gracia Fab member.
      <a href="https://gracia-fab.vercel.app/dashboard" style="color:rgba(255,255,255,0.5);">Unsubscribe</a>
    </p>
  </div>
</div>`;

        // Queue the email
        await addToQueue(emailQueue, "marketing-email", {
          to: user.email,
          subject: content.subject,
          html,
          type: "marketing",
        });

        // Update last sent date
        user.emailPreferences = {
          ...(user.emailPreferences || {}),
          lastSent: new Date(),
        };
        await user.save();
        sent++;
      } catch (userErr) {
        console.error(`Email failed for ${user.email}:`, userErr.message);
      }
    }

    console.log(`✅ Queued ${sent} marketing emails`);
    return sent;
  } catch (err) {
    console.error("Marketing email batch error:", err.message);
    throw err;
  }
};
