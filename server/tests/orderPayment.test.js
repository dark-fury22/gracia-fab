import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { markOrderPaid } from "../services/orderPayment.js";

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
  ]);
});

async function makeUnpaidOrder({ stock = 10, quantity = 2 } = {}) {
  const user = await User.create({
    name: "Buyer",
    email: "buyer@example.com",
    password: "password123",
  });
  const product = await Product.create({
    name: "Hydrating Serum",
    description: "A lightweight serum.",
    price: 5000,
    image: "https://example.com/serum.jpg",
    category: "skincare",
    stock,
  });
  const order = await Order.create({
    user: user._id,
    orderItems: [
      {
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      },
    ],
    itemsPrice: 5000 * quantity,
    deliveryPrice: 2500,
    totalPrice: 5000 * quantity + 2500,
    status: "pending",
    isPaid: false,
  });
  return { order, product };
}

describe("markOrderPaid", () => {
  it("decrements stock exactly once when verify and webhook race", async () => {
    const { order, product } = await makeUnpaidOrder({ stock: 10, quantity: 2 });

    const results = await Promise.all([
      markOrderPaid({ _id: order._id }, { reference: "r1", status: "success" }),
      markOrderPaid({ _id: order._id }, { reference: "r1", status: "success" }),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
    expect((await Product.findById(product._id)).stock).toBe(8);
  });

  it("marks a product out of stock when the last unit sells", async () => {
    const { order, product } = await makeUnpaidOrder({ stock: 2, quantity: 2 });

    await markOrderPaid({ _id: order._id }, { reference: "r2", status: "success" });

    const updated = await Product.findById(product._id);
    expect(updated.stock).toBe(0);
    expect(updated.isInStock).toBe(false);
  });
});
