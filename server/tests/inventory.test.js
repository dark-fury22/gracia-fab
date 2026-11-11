import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

let mongod;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret";
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Product.deleteMany({})]);
});

async function registerUser({ email = "user@example.com", isAdmin = false } = {}) {
  const res = await request(app).post("/api/auth/register").send({
    name: "Someone",
    email,
    password: "password123",
  });
  if (isAdmin) await User.updateOne({ email }, { isAdmin: true });
  return res.body.token;
}

function createProduct(overrides = {}) {
  return Product.create({
    name: "Hydrating Serum",
    description: "A lightweight serum.",
    price: 5000,
    image: "https://example.com/serum.jpg",
    category: "skincare",
    ...overrides,
  });
}

describe("Product stock defaults", () => {
  it("treats a product with no stock count as out of stock", async () => {
    const product = await createProduct();
    expect(product.stock).toBe(0);
    expect(product.isInStock).toBe(false);
  });

  it("makes a sold-out product buyable again when it's restocked", async () => {
    const product = await createProduct({ stock: 0 });
    product.stock = 5;
    await product.save();
    expect((await Product.findById(product._id)).isInStock).toBe(true);
  });

  it("refuses an order for an uncounted product", async () => {
    const token = await registerUser();
    const product = await createProduct();

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderItems: [{ product: product._id, quantity: 1 }],
        deliveryAddress: {
          fullName: "A",
          phone: "08000000000",
          address: "1 St",
          city: "Lagos",
          state: "Lagos",
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/only has 0 left/i);
  });
});

describe("PUT /api/admin/products/stock", () => {
  it("sets stock for several products and syncs availability", async () => {
    const token = await registerUser({ isAdmin: true });
    const a = await createProduct({ name: "A", stock: 0 });
    const b = await createProduct({ name: "B", stock: 7 });

    const res = await request(app)
      .put("/api/admin/products/stock")
      .set("Authorization", `Bearer ${token}`)
      .send({
        updates: [
          { id: String(a._id), stock: 12 },
          { id: String(b._id), stock: 0 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.updated).toBe(2);
    expect(res.body.notFound).toEqual([]);

    const [ua, ub] = await Promise.all([
      Product.findById(a._id),
      Product.findById(b._id),
    ]);
    expect(ua.stock).toBe(12);
    expect(ua.isInStock).toBe(true);
    expect(ub.stock).toBe(0);
    expect(ub.isInStock).toBe(false);
  });

  it("reports rows that don't match any product", async () => {
    const token = await registerUser({ isAdmin: true });
    const a = await createProduct({ name: "A" });
    const missing = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .put("/api/admin/products/stock")
      .set("Authorization", `Bearer ${token}`)
      .send({
        updates: [
          { id: String(a._id), stock: 3 },
          { id: missing, stock: 4 },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.updated).toBe(1);
    expect(res.body.notFound).toEqual([missing]);
  });

  it("rejects negative or fractional stock", async () => {
    const token = await registerUser({ isAdmin: true });
    const a = await createProduct({ name: "A" });

    for (const stock of [-1, 2.5]) {
      const res = await request(app)
        .put("/api/admin/products/stock")
        .set("Authorization", `Bearer ${token}`)
        .send({ updates: [{ id: String(a._id), stock }] });
      expect(res.status).toBe(400);
    }
  });

  it("is admin-only", async () => {
    const token = await registerUser();
    const a = await createProduct({ name: "A" });

    const res = await request(app)
      .put("/api/admin/products/stock")
      .set("Authorization", `Bearer ${token}`)
      .send({ updates: [{ id: String(a._id), stock: 99 }] });

    expect(res.status).toBe(401);
    expect((await Product.findById(a._id)).stock).toBe(0);
  });
});
