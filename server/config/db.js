import mongoose from 'mongoose'
import logger from '../utils/logger.js'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    logger.info({ host: conn.connection.host }, 'MongoDB connected')
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection error')
    // Flush before exiting so the log line isn't lost — pino's dev
    // transport runs in a worker thread and is not written synchronously.
    logger.flush(() => process.exit(1))
  }
}

export default connectDB
