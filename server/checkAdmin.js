import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import mongoose from 'mongoose'
import User from './models/User.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

await mongoose.connect(process.env.MONGO_URI)
console.log('✅ Connected')

const users = await User.find({}).select('name email isAdmin')
console.log('All users:')
users.forEach(u => {
  console.log(`  ${u.name} | ${u.email} | isAdmin: ${u.isAdmin}`)
})

process.exit(0)