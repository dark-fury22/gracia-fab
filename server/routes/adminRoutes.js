import express from 'express'
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllUsers,
  uploadImage
} from '../controllers/adminController.js'
import protect from '../middleware/authMiddleware.js'
import admin from '../middleware/adminMiddleware.js'
import validate from '../middleware/validate.js'
import {
  createProductSchema,
  updateProductSchema,
  uploadImageSchema,
} from '../validators/adminValidators.js'
import { updateOrderStatusSchema } from '../validators/orderValidators.js'

const router = express.Router()

// All routes protected by both auth and admin middleware
router.use(protect, admin)

router.get('/stats', getDashboardStats)
router.get('/orders', getAllOrders)
router.put('/orders/:id', validate(updateOrderStatusSchema), updateOrderStatus)
router.get('/products', getAllProducts)
router.post('/products', validate(createProductSchema), createProduct)
router.post('/upload', validate(uploadImageSchema), uploadImage)
router.put('/products/:id', validate(updateProductSchema), updateProduct)
router.delete('/products/:id', deleteProduct)
router.get('/users', getAllUsers)

export default router
