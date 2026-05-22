import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true }
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    default: 0
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  category: {
    type: String,
    required: true,
    enum: ['skincare', 'haircare', 'wig', 'hairstyle', 'bridal']
  },
  tags: [String],
  suitableFor: {
    skinType: [String],
    hairType: [String],
    concern: [String]
  },
  brand: { type: String, default: 'BeautyAI Pick' },
  countInStock: { type: Number, default: 10 },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true })

const Product = mongoose.model('Product', productSchema)
export default Product