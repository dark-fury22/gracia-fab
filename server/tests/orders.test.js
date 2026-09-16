import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

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
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
  ]);
});

const deliveryAddress = {
  fullName: "Test Buyer",
  phone: "08012345678",
  address: "1 Main St",
  city: "Lagos",
  state: "Lagos",
};

async function registerUser(email = "buyer@example.com") {
  const res = await request(app).post("/api/auth/register").send({
    name: "Test Buyer",
    email,
    password: "password123",
  });
  return { token: res.body.token, userId: res.body._id };
}

async function createProduct(overrides = {}) {
  return Product.create({
    name: "Hydrating Serum",
    description: "A lightweight serum.",
    price: 5000,
    image: "https://example.com/serum.jpg",
    category: "skincare",
    stock: 10,
    ...overrides,
  });
}

describe("POST /api/orders", () => {
  it("requires authentication", async () => {
    const res = await request(app).post("/api/orders").send({});
    expect(res.status).toBe(401);
  });

  it("recalculates prices from the database and reduces stock", async () => {
    const { token } = await registerUser();
    // Client sends a bogus price — server must ignore it and use the DB price.
    const product = await createProduct({ price: 5000, stock: 10 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderItems: [{ product: product._id, quantity: 2, price: 1 }],
        deliveryAddress,
        deliveryPrice: 2500,
      });

    expect(res.status).toBe(201);
    expect(res.body.itemsPrice).toBe(10000);
    expect(res.body.totalPrice).toBe(12500);

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.stock).toBe(8);
  });

  it("rejects an order that exceeds available stock", async () => {
    const { token } = await registerUser();
    const product = await createProduct({ stock: 1 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderItems: [{ product: product._id, quantity: 5 }],
        deliveryAddress,
        deliveryPrice: 2500,
      });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/orders/myorders", () => {
  it("only returns the logged-in user's own orders", async () => {
    const buyer = await registerUser("buyer@example.com");
    const other = await registerUser("other@example.com");
    const product = await createProduct();

    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${buyer.token}`)
      .send({
        orderItems: [{ product: product._id, quantity: 1 }],
        deliveryAddress,
        deliveryPrice: 2500,
      });

    const res = await request(app)
      .get("/api/orders/myorders")
      .set("Authorization", `Bearer ${other.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

describe("GET /api/orders/:id", () => {
  it("returns 401 when accessing another user's order", async () => {
    const buyer = await registerUser("buyer@example.com");
    const other = await registerUser("other@example.com");
    const product = await createProduct();

    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${buyer.token}`)
      .send({
        orderItems: [{ product: product._id, quantity: 1 }],
        deliveryAddress,
        deliveryPrice: 2500,
      });

    const res = await request(app)
      .get(`/api/orders/${createRes.body._id}`)
      .set("Authorization", `Bearer ${other.token}`);

    expect(res.status).toBe(401);
  });

  it("returns 404 for a missing order", async () => {
    const { token } = await registerUser();
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/orders/${missingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe("PUT /api/admin/orders/:id (status updates & notifications)", () => {
  async function registerAdmin(email = "admin@example.com") {
    const { token, userId } = await registerUser(email);
    await User.findByIdAndUpdate(userId, { isAdmin: true });
    return { token, userId };
  }

  it("marking an order delivered no longer crashes (missing email template regression)", async () => {
    const buyer = await registerUser("buyer@example.com");
    const admin = await registerAdmin();
    const product = await createProduct();

    const createRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${buyer.token}`)
      .send({
        orderItems: [{ product: product._id, quantity: 1 }],
        deliveryAddress,
        deliveryPrice: 2500,
      });
    const orderId = createRes.body._id;

    // Jump the order straight to "shipped" — this test targets the
    // shipped→delivered notification step, not the full state machine.
    await Order.findByIdAndUpdate(orderId, { status: "shipped" });

    const deliveredRes = await request(app)
      .put(`/api/admin/orders/${orderId}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ status: "delivered" });

    expect(deliveredRes.status).toBe(200);
    expect(deliveredRes.body.status).toBe("delivered");
  });
});
