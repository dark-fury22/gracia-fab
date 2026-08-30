import "dotenv/config";
import connectDB from "./config/db.js";
import { startWorkers } from "./queues/workers.js";
import cron from "node-cron";
import { sendMarketingEmails } from "./controllers/marketingController.js";
import app from "./app.js";
import logger from "./utils/logger.js";

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
