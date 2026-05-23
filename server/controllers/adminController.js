import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'

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

// @desc   Update order status
// @route  PUT /api/admin/orders/:id
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.status = req.body.status || order.status
    if (req.body.status === 'delivered') {
      order.isDelivered = true
      order.deliveredAt = Date.now()
    }

    const updatedOrder = await order.save()
    res.json(updatedOrder)
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
      category, brand, countInStock,
      tags, isFeatured
    } = req.body

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category,
      brand,
      countInStock,
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
      category, brand, countInStock,
      tags, isFeatured
    } = req.body

    product.name = name || product.name
    product.description = description || product.description
    product.price = price ?? product.price
product.image = image ?? product.image
    product.category = category || product.category
    product.brand = brand || product.brand
    product.countInStock = countInStock ?? product.countInStock
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