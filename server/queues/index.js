import { Queue } from "bullmq";
import IORedis from "ioredis";
import logger from "../utils/logger.js";

// ── Create Redis connection
// If no Redis URL, use a mock that just logs
let connection = null;

const getConnection = () => {
  if (connection) return connection;

  if (!process.env.REDIS_URL) {
    logger.warn("No REDIS_URL found — queue jobs will be logged only");
    return null;
  }

  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    tls: {}, // Upstash requires TLS
  });

  connection.on("connect", () => logger.info("Redis connected"));
  connection.on("error", (err) => logger.error({ err }, "Redis error"));

  return connection;
};

// ── Queue factory — creates a queue or null if no Redis
const createQueue = (name) => {
  const conn = getConnection();
  if (!conn) return null;
  return new Queue(name, {
    connection: conn,
    defaultJobOptions: {
      attempts: 3, // Retry up to 3 times
      backoff: {
        type: "exponential",
        delay: 5000, // Wait 5s, 10s, 20s between retries
      },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 50, // Keep last 50 failed jobs
    },
  });
};

// ── Export named queues
export const whatsappQueue = createQueue("whatsapp");
export const emailQueue = createQueue("email");
export const pointsQueue = createQueue("points");

// ── Helper to safely add to queue
//    If queue is null, just run the job immediately
export const addToQueue = async (queue, jobName, data, opts = {}) => {
  if (!queue) {
    logger.info({ jobName, data }, "No queue configured — job not enqueued");
    return null;
  }
  try {
    const job = await queue.add(jobName, data, opts);
    logger.info({ jobName, jobId: job.id }, "Job queued");
    return job;
  } catch (err) {
    logger.error({ err, jobName }, "Queue add error");
    return null;
  }
};
