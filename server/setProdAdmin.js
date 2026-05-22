import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mongoose from 'mongoose'
import User from './models/User.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

await mongoose.connect(process.env.MONGO_URI)
const user = await User.findOneAndUpdate(
  { email: 'est0295@gmail.com' },
  { isAdmin: true },
  { new: true }
)
console.log('✅ Admin set:', user?.name, '| isAdmin:', user?.isAdmin)
process.exit(0)