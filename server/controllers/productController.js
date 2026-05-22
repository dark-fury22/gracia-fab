import Product from '../models/Product.js'

// @desc  Get all products
// @route GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query

    let filter = {}

    if (category) filter.category = category
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }

    const products = await Product.find(filter)
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
    const products = await Product.find({ isFeatured: true }).limit(6)
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}