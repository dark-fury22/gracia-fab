import express from 'express'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  saveRecommendation,
  getSavedRecommendations
} from '../controllers/wishlistController.js'
import protect from '../middleware/authMiddleware.js'
import validate from '../middleware/validate.js'
import validateObjectId from '../middleware/validateObjectId.js'
import { saveRecommendationSchema } from '../validators/wishlistValidators.js'

const router = express.Router()

router.get('/', protect, getWishlist)
router.post('/:productId', protect, validateObjectId('productId'), addToWishlist)
router.delete('/:productId', protect, validateObjectId('productId'), removeFromWishlist)
router.post('/recommendations/save', protect, validate(saveRecommendationSchema), saveRecommendation)
router.get('/recommendations/saved', protect, getSavedRecommendations)

export default router
