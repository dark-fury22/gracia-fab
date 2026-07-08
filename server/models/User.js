import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      type: String,
      default: "",
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },

    skinType: {
      type: String,
      enum: ["oily", "dry", "combination", "normal", "sensitive"],
      default: "normal",
    },

    hairType: {
      type: String,
      enum: ["straight", "wavy", "curly", "coily"],
      default: "straight",
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    savedRecommendations: [
      {
        date: {
          type: Date,
          default: Date.now,
        },

        profile: {
          type: Object,
        },

        products: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
        ],
      },
    ],

    isAdmin: {
      type: Boolean,
      default: false,
    },

    // ── Loyalty System
    loyaltyPoints: {
      type: Number,
      default: 0,
    },

    loyaltyTier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    pointsHistory: [
      {
        points: Number,

        reason: String,

        type: {
          type: String,
          enum: ["earn", "redeem"],
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Add inside userSchema:
    interests: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        category: String,
        viewCount: { type: Number, default: 1 },
        lastViewed: { type: Date, default: Date.now },
      },
    ],
    emailPreferences: {
      marketing: { type: Boolean, default: true },
      lastSent: Date,
    },
  },

  { timestamps: true },
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
