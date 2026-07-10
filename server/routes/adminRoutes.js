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

const router = express.Router()

// All routes protected by both auth and admin middleware
router.use(protect, admin)

router.get('/stats', getDashboardStats)
router.get('/orders', getAllOrders)
router.put('/orders/:id', updateOrderStatus)
router.get('/products', getAllProducts)
router.post('/products', createProduct)
router.post('/upload', uploadImage)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)
router.get('/users', getAllUsers)

export default router