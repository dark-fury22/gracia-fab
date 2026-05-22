import User from '../models/User.js'

// @desc   Get user wishlist
// @route  GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        model: 'Product'
      })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user.wishlist || [])
  } catch (error) {
    console.error('getWishlist error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// @desc   Add product to wishlist
// @route  POST /api/wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Initialize wishlist if it doesn't exist
    if (!user.wishlist) user.wishlist = []

    const alreadyExists = user.wishlist.some(
      id => id.toString() === req.params.productId
    )

    if (alreadyExists) {
      return res.status(400).json({ message: 'Already in wishlist' })
    }

    user.wishlist.push(req.params.productId)
    await user.save()

    res.json({ message: 'Added to wishlist ❤️', wishlist: user.wishlist })
  } catch (error) {
    console.error('addToWishlist error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// @desc   Remove product from wishlist
// @route  DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.wishlist = (user.wishlist || []).filter(
      id => id.toString() !== req.params.productId
    )

    await user.save()
    res.json({ message: 'Removed from wishlist', wishlist: user.wishlist })
  } catch (error) {
    console.error('removeFromWishlist error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// @desc   Save a recommendation session
// @route  POST /api/wishlist/recommendations/save
export const saveRecommendation = async (req, res) => {
  try {
    const { profile, productIds } = req.body
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!user.savedRecommendations) user.savedRecommendations = []

    user.savedRecommendations.push({
      date: new Date(),
      profile: profile || {},
      products: productIds || []
    })

    // Keep only last 5
    if (user.savedRecommendations.length > 5) {
      user.savedRecommendations = user.savedRecommendations.slice(-5)
    }

    await user.save()
    res.json({ message: 'Recommendation saved! 💾' })
  } catch (error) {
    console.error('saveRecommendation error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

// @desc   Get saved recommendations
// @route  GET /api/wishlist/recommendations/saved
export const getSavedRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedRecommendations.products',
        model: 'Product'
      })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const recs = user.savedRecommendations || []
    res.json(recs.reverse())
  } catch (error) {
    console.error('getSavedRecommendations error:', error.message)
    res.status(500).json({ message: error.message })
  }
}