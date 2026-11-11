import express from 'express'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  verifyPayment,
  initPayment
} from '../controllers/orderController.js'
import protect from '../middleware/authMiddleware.js'
import validate from '../middleware/validate.js'
import { createOrderSchema, verifyPaymentSchema } from '../validators/orderValidators.js'

const router = express.Router()

router.post('/', protect, validate(createOrderSchema), createOrder)
router.get('/myorders', protect, getMyOrders)
router.get('/:id', protect, getOrderById)
router.post('/:id/pay/init', protect, initPayment)
router.put('/:id/pay', protect, validate(verifyPaymentSchema), verifyPayment)

export default router
