import { Worker } from "bullmq";
import IORedis from "ioredis";

// WhatsApp service
import { sendWhatsApp } from "../services/whatsappService.js";

// Email service (Nodemailer — install below)
import { sendEmail } from "../services/emailService.js";

// Loyalty controller
import { awardPoints } from "../controllers/loyaltyController.js";

let workers = [];

export const startWorkers = () => {
  if (!process.env.REDIS_URL) {
    console.log("⚠️  No Redis — workers not started (jobs will be skipped)");
    return;
  }

  const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: {},
  });

  // ── WhatsApp Worker
  // Processes one WhatsApp job at a time
  const whatsappWorker = new Worker(
    "whatsapp",
    async (job) => {
      const { phone, message, type } = job.data;
      console.log(`📱 Processing WhatsApp job #${job.id}: ${type}`);
      await sendWhatsApp(phone, message);
    },
    {
      connection,
      concurrency: 2, // Process 2 messages at the same time
    },
  );

  whatsappWorker.on("completed", (job) =>
    console.log(`✅ WhatsApp job #${job.id} sent successfully`),
  );
  whatsappWorker.on("failed", (job, err) =>
    console.error(`❌ WhatsApp job #${job?.id} failed: ${err.message}`),
  );

  // ── Email Worker
  const emailWorker = new Worker(
    "email",
    async (job) => {
      const { to, subject, html, type } = job.data;
      console.log(`📧 Processing email job #${job.id}: ${type} → ${to}`);
      await sendEmail({ to, subject, html });
    },
    { connection, concurrency: 5 },
  );

  emailWorker.on("completed", (job) =>
    console.log(`✅ Email job #${job.id} sent`),
  );
  emailWorker.on("failed", (job, err) =>
    console.error(`❌ Email job #${job?.id} failed: ${err.message}`),
  );

  // ── Points Worker
  const pointsWorker = new Worker(
    "points",
    async (job) => {
      const { userId, points, reason } = job.data;
      console.log(
        `🏆 Processing points job #${job.id}: +${points} for user ${userId}`,
      );
      await awardPoints(userId, points, reason);
    },
    { connection, concurrency: 10 },
  );

  pointsWorker.on("failed", (job, err) =>
    console.error(`❌ Points job #${job?.id} failed: ${err.message}`),
  );

  workers = [whatsappWorker, emailWorker, pointsWorker];
  console.log("🚀 Queue workers started (WhatsApp, Email, Points)");
};

export const stopWorkers = async () => {
  for (const worker of workers) {
    await worker.close();
  }
};
