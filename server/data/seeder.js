import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import products from './products.js'
import Product from '../models/Product.js'

// This correctly finds the .env file no matter where you run from
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env') })

// Debug line — shows us what URI was loaded
console.log('🔍 MONGO_URI:', process.env.MONGO_URI ? 'Found ✅' : 'NOT FOUND ❌')

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB Connected')

    await Product.deleteMany()
    console.log('🗑️  Existing products cleared')

    await Product.insertMany(products)
    console.log(`🌱 ${products.length} products seeded successfully!`)

    process.exit(0)
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    process.exit(1)
  }
}

seedProducts()