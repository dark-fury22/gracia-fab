import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      required: true,
    },

    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
    },

    // Optional second photo (e.g. a different angle) shown when a shopper
    // hovers the product card — falls back to `image` when not set.
    secondaryImage: {
      type: String,
    },

    category: {
      type: String,
      required: true,
    },

    tags: [String],

    suitableFor: {
      skinType: [String],
      hairType: [String],
      concern: [String],
    },

    brand: {
      type: String,
    },

    // Stock management. Defaults to 0: a product nobody has counted is
    // treated as out of stock rather than given an invented quantity.
    // Counts are entered from the admin dashboard's Inventory tab.
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Kept in step with `stock` by the pre-save hook below (and by the bulk
    // stock update), so restocking a sold-out product makes it buyable again.
    isInStock: {
      type: Boolean,
      default: false,
    },

    reviews: [reviewSchema],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: "text", description: "text" });
productSchema.index({ isFeatured: 1 });

productSchema.pre("save", function syncIsInStock(next) {
  if (this.isNew || this.isModified("stock")) {
    this.isInStock = this.stock > 0;
  }
  next();
});

export default mongoose.model("Product", productSchema);
