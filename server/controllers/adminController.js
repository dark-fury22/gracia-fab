import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from '../utils/logger.js'
import { ALLOWED_UPLOAD_MIME_TYPES } from '../validators/adminValidators.js'

const MIME_TO_EXTENSION = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

// @desc   Get dashboard stats
// @route  GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalUsers = await User.countDocuments()

    const revenueData = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])

    const totalRevenue = revenueData[0]?.total || 0

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc   Get all orders
// @route  GET /api/admin/orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc   Get all products (admin)
// @route  GET /api/admin/products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc   Create product
// @route  POST /api/admin/products
export const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, image,
      category, brand, stock,
      tags, isFeatured
    } = req.body

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      brand,
      stock,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      isFeatured: isFeatured || false,
      suitableFor: {}
    })

    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc   Update product
// @route  PUT /api/admin/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const {
      name, description, price, image,
      category, brand, stock,
      tags, isFeatured
    } = req.body

    product.name = name || product.name
    product.description = description || product.description
    product.price = price ?? product.price
product.image = image ?? product.image
    product.category = category || product.category
    product.brand = brand || product.brand
    product.stock = stock ?? product.stock
    product.tags = tags
      ? tags.split(',').map(t => t.trim())
      : product.tags
    product.isFeatured = isFeatured ?? product.isFeatured

    const updatedProduct = await product.save()
    res.json(updatedProduct)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc   Delete product
// @route  DELETE /api/admin/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    await product.deleteOne()
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc   Get all users
// @route  GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc   Upload product image
// @route  POST /api/admin/upload
export const uploadImage = async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body

    // mimeType is already restricted to ALLOWED_UPLOAD_MIME_TYPES by
    // uploadImageSchema, so this lookup can't produce an attacker-chosen
    // extension (e.g. .svg, which could embed a script and serve as
    // stored XSS when the uploaded file's URL is opened directly).
    const extension = MIME_TO_EXTENSION[mimeType]
    if (!extension) {
      return res.status(400).json({ message: 'Unsupported image type' })
    }

    // Create unique filename
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const uploadPath = path.join(__dirname, '../public/uploads', filename)

    // Ensure uploads folder exists
    fs.mkdirSync(path.dirname(uploadPath), { recursive: true })

    // Decode base64 and write
    const buffer = Buffer.from(imageBase64, 'base64')
    fs.writeFileSync(uploadPath, buffer)

    // Construct dynamic absolute URL
    const host = req.get('host')
    const protocol = req.protocol
    const imageUrl = `${protocol}://${host}/uploads/${filename}`

    logger.info({ uploadPath, imageUrl }, 'Image uploaded')

    res.status(201).json({ success: true, url: imageUrl })
  } catch (error) {
    logger.error({ err: error }, 'uploadImage error')
    res.status(500).json({ message: error.message })
  }
}