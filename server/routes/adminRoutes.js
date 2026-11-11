import express from 'express'
import {
  getDashboardStats,
  getAllOrders,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllUsers,
  uploadImage,
  bulkUpdateStock
} from '../controllers/adminController.js'
import { updateOrderStatus } from '../controllers/orderController.js'
import protect from '../middleware/authMiddleware.js'
import admin from '../middleware/adminMiddleware.js'
import validate from '../middleware/validate.js'
import {
  createProductSchema,
  updateProductSchema,
  uploadImageSchema,
  bulkStockSchema,
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
// Must come before /products/:id so "stock" isn't read as a product id.
router.put('/products/stock', validate(bulkStockSchema), bulkUpdateStock)
router.put('/products/:id', validate(updateProductSchema), updateProduct)
router.delete('/products/:id', deleteProduct)
router.get('/users', getAllUsers)

export default router
