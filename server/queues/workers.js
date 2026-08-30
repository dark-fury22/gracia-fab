import { Worker } from "bullmq";
import IORedis from "ioredis";

// WhatsApp service
import { sendWhatsApp } from "../services/whatsappService.js";

// Email service (Nodemailer — install below)
import { sendEmail } from "../services/emailService.js";

// Loyalty controller
import { awardPoints } from "../controllers/loyaltyController.js";
import logger from "../utils/logger.js";

let workers = [];

export const startWorkers = () => {
  if (!process.env.REDIS_URL) {
    logger.warn("No Redis — workers not started (jobs will be skipped)");
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
      logger.info({ jobId: job.id, type }, "Processing WhatsApp job");
      await sendWhatsApp(phone, message);
    },
    {
      connection,
      concurrency: 2, // Process 2 messages at the same time
    },
  );

  whatsappWorker.on("completed", (job) =>
    logger.info({ jobId: job.id }, "WhatsApp job sent successfully"),
  );
  whatsappWorker.on("failed", (job, err) =>
    logger.error({ err, jobId: job?.id }, "WhatsApp job failed"),
  );

  // ── Email Worker
  const emailWorker = new Worker(
    "email",
    async (job) => {
      const { to, subject, html, type } = job.data;
      logger.info({ jobId: job.id, type, to }, "Processing email job");
      await sendEmail({ to, subject, html });
    },
    { connection, concurrency: 5 },
  );

  emailWorker.on("completed", (job) =>
    logger.info({ jobId: job.id }, "Email job sent"),
  );
  emailWorker.on("failed", (job, err) =>
    logger.error({ err, jobId: job?.id }, "Email job failed"),
  );

  // ── Points Worker
  const pointsWorker = new Worker(
    "points",
    async (job) => {
      const { userId, points, reason } = job.data;
      logger.info({ jobId: job.id, points, userId }, "Processing points job");
      await awardPoints(userId, points, reason);
    },
    { connection, concurrency: 10 },
  );

  pointsWorker.on("failed", (job, err) =>
    logger.error({ err, jobId: job?.id }, "Points job failed"),
  );

  workers = [whatsappWorker, emailWorker, pointsWorker];
  logger.info("Queue workers started (WhatsApp, Email, Points)");
};

export const stopWorkers = async () => {
  for (const worker of workers) {
    await worker.close();
  }
};
