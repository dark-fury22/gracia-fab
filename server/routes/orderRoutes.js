import express from 'express'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  verifyPayment
} from '../controllers/orderController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createOrder)
router.get('/myorders', protect, getMyOrders)
router.get('/:id', protect, getOrderById)
router.put('/:id/pay', protect, verifyPayment)

export default router