import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

import fetch from "node-fetch";
import app from "../app.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

let mongod;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.PAYSTACK_SECRET_KEY = "sk_test_dummy";
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
  fetch.mockReset();
});

const deliveryAddress = {
  fullName: "Test Buyer",
  phone: "08012345678",
  address: "1 Main St",
  city: "Lagos",
  state: "Lagos",
};

async function setupOrder() {
  const email = "buyer@example.com";
  const registerRes = await request(app).post("/api/auth/register").send({
    name: "Test Buyer",
    email,
    password: "password123",
  });
  const token = registerRes.body.token;

  const product = await Product.create({
    name: "Hydrating Serum",
    description: "A lightweight serum.",
    price: 5000,
    image: "https://example.com/serum.jpg",
    category: "skincare",
    stock: 10,
  });

  const orderRes = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${token}`)
    .send({
      orderItems: [{ product: product._id, quantity: 1 }],
      deliveryAddress,
      deliveryPrice: 2500,
    });

  return { token, order: orderRes.body, email };
}

function mockPaystackSuccess({ amount, email }) {
  fetch.mockResolvedValueOnce({
    json: async () => ({
      status: true,
      data: {
        status: "success",
        amount,
        reference: "ref_123",
        paid_at: "2026-01-01T00:00:00.000Z",
        customer: { email },
      },
    }),
  });
}

describe("PUT /api/orders/:id/pay", () => {
  it("marks the order paid when Paystack confirms success", async () => {
    const { token, order, email } = await setupOrder();
    mockPaystackSuccess({ amount: order.totalPrice * 100, email });

    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reference: "ref_123" });

    expect(res.status).toBe(200);
    expect(res.body.isPaid).toBe(true);
    expect(res.body.status).toBe("processing");
  });

  it("rejects when the paid amount doesn't match the order total", async () => {
    const { token, order, email } = await setupOrder();
    mockPaystackSuccess({ amount: 100, email });

    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reference: "ref_123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/amount mismatch/i);
  });

  it("rejects a payment reference for the wrong customer", async () => {
    const { token, order } = await setupOrder();
    mockPaystackSuccess({
      amount: order.totalPrice * 100,
      email: "someone-else@example.com",
    });

    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reference: "ref_123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email mismatch/i);
  });

  it("rejects double payment on an already-paid order", async () => {
    const { token, order, email } = await setupOrder();
    mockPaystackSuccess({ amount: order.totalPrice * 100, email });

    const first = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reference: "ref_123" });
    expect(first.status).toBe(200);

    mockPaystackSuccess({ amount: order.totalPrice * 100, email });
    const second = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reference: "ref_123" });

    expect(second.status).toBe(400);
    expect(second.body.message).toMatch(/already paid/i);
  });
});
