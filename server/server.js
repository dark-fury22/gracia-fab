import "dotenv/config";
import dns from "dns";
import connectDB from "./config/db.js";
import { startWorkers } from "./queues/workers.js";
import cron from "node-cron";
import { sendMarketingEmails } from "./controllers/marketingController.js";
import app from "./app.js";
import logger from "./utils/logger.js";

// Render's outbound network doesn't route IPv6, but Node's default DNS
// order can still hand back an AAAA record first (e.g. for Gmail's SMTP
// host) — that connection then hangs until it times out instead of
// falling back to IPv4. Preferring IPv4 results avoids that for every
// outbound connection this process makes (Mongo, SMTP, any future API call).
dns.setDefaultResultOrder("ipv4first");

connectDB();
startWorkers();

cron.schedule("0 10 * * *", async () => {
  logger.info("Running daily marketing email job");
  await sendMarketingEmails();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server running");
});
