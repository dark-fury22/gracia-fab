import Order from '../models/Order.js'
import https from 'https'
import fetch from 'node-fetch'

// @desc   Create new order
// @route  POST /api/orders
export const createOrder = async (req, res) => {
  const {
    orderItems,
    deliveryAddress,
    itemsPrice,
    deliveryPrice,
    totalPrice
  } = req.body

  try {
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' })
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      deliveryAddress,
      itemsPrice,
      deliveryPrice,
      totalPrice
    })

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc   Verify Paystack payment & mark order as paid
// @route  PUT /api/orders/:id/pay
export const verifyPayment = async (req, res) => {
  const { reference } = req.body

  console.log('🔍 Verifying payment reference:', reference)
  console.log('🔑 Secret key exists:', !!process.env.PAYSTACK_SECRET_KEY)

  if (!reference) {
    return res.status(400).json({ message: 'Payment reference is required' })
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ message: 'Paystack secret key not configured' })
  }

  try {
    // Verify with Paystack using fetch
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const paystackData = await paystackRes.json()

    console.log('📦 Paystack response status:', paystackData.status)
    console.log('📦 Paystack data status:', paystackData.data?.status)

    // Check if verification was successful
    if (!paystackData.status) {
      console.error('❌ Paystack error:', paystackData.message)
      return res.status(400).json({
        message: `Paystack error: ${paystackData.message}`
      })
    }

    const txStatus = paystackData.data?.status

    // Accept both 'success' and 'abandoned' for test mode
    if (txStatus !== 'success') {
      console.error('❌ Transaction not successful. Status:', txStatus)
      return res.status(400).json({
        message: `Transaction status: ${txStatus}. Payment not completed.`
      })
    }

    // Find and update the order
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.isPaid = true
    order.status = 'processing'
    order.paidAt = Date.now()
    order.paymentResult = {
      reference: paystackData.data.reference,
      status: paystackData.data.status,
      amount: paystackData.data.amount / 100
    }

    const updatedOrder = await order.save()
    console.log('✅ Order marked as paid:', updatedOrder._id)

    res.json(updatedOrder)

  } catch (error) {
    console.error('❌ Verification error:', error.message)
    res.status(500).json({ message: `Verification failed: ${error.message}` })
  }
}

// @desc   Get logged in user orders
// @route  GET /api/orders/myorders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc   Get order by ID
// @route  GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}