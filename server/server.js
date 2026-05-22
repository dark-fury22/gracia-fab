import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import recommendRoutes from './routes/recommendRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import sitemapRoutes from './routes/sitemapRoutes.js'
import { createRequire } from 'module'

dotenv.config()
connectDB()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,           // Vercel URL
    'https://gracia-fab.vercel.app',    // your actual Vercel URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/recommend', recommendRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/admin', adminRoutes)
app.use('/sitemap.xml', sitemapRoutes)

app.get('/', (req, res) => {
  res.json({ message: '💄 BeautyAI API is running!' })
})

// TEMPORARY DEBUG ROUTE — remove after testing
app.get('/api/debug-paystack/:ref', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${req.params.ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    )
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})