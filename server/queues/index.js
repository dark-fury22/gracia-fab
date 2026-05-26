import { Queue } from "bullmq";
import IORedis from "ioredis";

// ── Create Redis connection
// If no Redis URL, use a mock that just logs
let connection = null;

const getConnection = () => {
  if (connection) return connection;

  if (!process.env.REDIS_URL) {
    console.log("⚠️  No REDIS_URL found — queue jobs will be logged only");
    return null;
  }

  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    tls: {}, // Upstash requires TLS
  });

  connection.on("connect", () => console.log("✅ Redis connected"));
  connection.on("error", (err) =>
    console.error("❌ Redis error:", err.message),
  );

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
    console.log(`📋 [No Queue] ${jobName}:`, JSON.stringify(data).slice(0, 80));
    return null;
  }
  try {
    const job = await queue.add(jobName, data, opts);
    console.log(`📬 Queued "${jobName}" → job #${job.id}`);
    return job;
  } catch (err) {
    console.error(`Queue add error for "${jobName}":`, err.message);
    return null;
  }
};
