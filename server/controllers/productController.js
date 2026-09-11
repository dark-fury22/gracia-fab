import Product from '../models/Product.js'
import { asSafeString, escapeRegex } from '../utils/queryHelpers.js'

// @desc  Get all products
// @route GET /api/products
export const getProducts = async (req, res) => {
  try {
    const category = asSafeString(req.query.category)
    const search = asSafeString(req.query.search)

    let filter = {}

    if (category) filter.category = category
    if (search) {
      const pattern = escapeRegex(search).slice(0, 100)
      filter.$or = [
        { name: { $regex: pattern, $options: 'i' } },
        { tags: { $regex: pattern, $options: 'i' } }
      ]
    }

    const products = await Product.find(filter).lean()
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc  Get single product
// @route GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product) {
      res.json(product)
    } else {
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc  Get featured products
// @route GET /api/products/featured
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(6).lean()
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}