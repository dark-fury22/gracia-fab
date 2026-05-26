import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
})

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [{
    name:     { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image:    String,
    price:    { type: Number, required: true },
    product:  {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  }],
  deliveryAddress: {
    fullName: String,
    phone:    String,
    address:  String,
    city:     String,
    state:    String
  },
  paymentResult: {
    reference: String,
    status:    String,
    amount:    Number,
    channel:   String,
    paidAt:    String
  },
  itemsPrice:    { type: Number, required: true },
  deliveryPrice: { type: Number, required: true },
  totalPrice:    { type: Number, required: true },
  isPaid:        { type: Boolean, default: false },
  paidAt:        Date,

  // ── The state machine: only these values allowed, in this order
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  // Track when each stage happened
  statusHistory: [{
    status:    String,
    changedAt: { type: Date, default: Date.now },
    note:      String
  }],

  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date
}, { timestamps: true })

// ── Method to safely advance order status
orderSchema.methods.advanceStatus = function(newStatus, note = '') {
  const validTransitions = {
    'pending':    ['paid', 'cancelled'],
    'paid':       ['processing', 'cancelled'],
    'processing': ['shipped'],
    'shipped':    ['delivered'],
    'delivered':  [],
    'cancelled':  []
  }

  const allowed = validTransitions[this.status] || []
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Cannot change order from "${this.status}" to "${newStatus}"`
    )
  }

  this.status = newStatus
  this.statusHistory.push({ status: newStatus, note })

  if (newStatus === 'delivered') {
    this.isDelivered = true
    this.deliveredAt = new Date()
  }
  if (newStatus === 'paid') {
    this.isPaid = true
    this.paidAt = new Date()
  }

  return this
}

export default mongoose.model('Order', orderSchema)
export default Order