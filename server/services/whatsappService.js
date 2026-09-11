import twilio from "twilio";
import logger from "../utils/logger.js";

// Initialize only if credentials exist
let client = null;
const getClient = () => {
  if (!client && process.env.TWILIO_ACCOUNT_SID) {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  return client;
};

const formatNigerianNumber = (phone) => {
  // Convert 08012345678 → +2348012345678
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    return `whatsapp:+234${clean.slice(1)}`;
  }
  if (clean.startsWith("234")) {
    return `whatsapp:+${clean}`;
  }
  return `whatsapp:${phone}`;
};

export const sendWhatsApp = async (phone, message) => {
  const wa = getClient();
  if (!wa) {
    logger.info(
      { phone, preview: message.slice(0, 50) },
      "WhatsApp not configured — message not sent",
    );
    return;
  }

  try {
    const to = formatNigerianNumber(phone);
    await wa.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to,
      body: message,
    });
    logger.info({ phone }, "WhatsApp sent");
  } catch (err) {
    logger.error({ err, phone }, "WhatsApp failed");
    throw err; // Rethrow so BullMQ can retry
  }
};

// Pre-built message templates
export const messages = {
  orderConfirmed: (name, orderId, total) =>
    `✅ *Order Confirmed!*\n\nHi ${name}! Your Gracia Fab order #${orderId} has been confirmed.\n\n💳 Total: ₦${total.toLocaleString()}\n\nWe'll notify you when it ships. Thank you for shopping with us! 💄\n\n_Gracia Fab Beauty_`,

  orderShipped: (name, orderId) =>
    `🚚 *Your Order is on its Way!*\n\nHi ${name}! Order #${orderId} has been shipped and is heading to you.\n\nExpected delivery: 2–5 business days 📦\n\nTrack your order on the app.\n\n_Gracia Fab Beauty_`,

  orderDelivered: (name) =>
    `🎉 *Order Delivered!*\n\nHi ${name}! Your Gracia Fab order has been delivered. We hope you love your new beauty products!\n\n✨ Don't forget to leave a review — it helps other beauty lovers.\n\n_Gracia Fab Beauty_`,

  welcomeMessage: (name) =>
    `💄 *Welcome to Gracia Fab!*\n\nHi ${name}! You've just joined Nigeria's premier AI-powered beauty community.\n\n✦ Get personalized skincare recommendations\n✦ Shop premium beauty products\n✦ Earn loyalty points on every purchase\n\nVisit: gracia-fab.vercel.app\n\n_Gracia Fab Beauty_`,
};
