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
import { _resetMonnifyTokenCache } from "../services/monnify.js";

let mongod;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret";
  process.env.MONNIFY_API_KEY = "MK_TEST_dummy";
  process.env.MONNIFY_SECRET_KEY = "secret_dummy";
  process.env.MONNIFY_CONTRACT_CODE = "1234567890";
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
  _resetMonnifyTokenCache();
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
    });

  return { token, order: orderRes.body, email, product };
}

async function initPayment(token, orderId) {
  return request(app)
    .post(`/api/orders/${orderId}/pay/init`)
    .set("Authorization", `Bearer ${token}`)
    .send();
}

// Mocks Monnify's login + transaction-query endpoints.
function mockMonnify({ paymentStatus = "PAID", amountPaid, email }) {
  fetch.mockImplementation(async (url) => ({
    status: 200,
    json: async () =>
      String(url).includes("/api/v1/auth/login")
        ? {
            requestSuccessful: true,
            responseBody: { accessToken: "tok_test", expiresIn: 3600 },
          }
        : {
            requestSuccessful: true,
            responseBody: {
              paymentReference: new URL(url).searchParams.get(
                "paymentReference",
              ),
              transactionReference: "MNFY|TEST|001",
              paymentStatus,
              amountPaid: String(amountPaid),
              paymentMethod: "CARD",
              paidOn: "2026-01-01 00:00:00",
              customer: { email },
            },
          },
  }));
}

describe("POST /api/orders/:id/pay/init", () => {
  it("issues a reference tied to the order and returns the server's total", async () => {
    const { token, order } = await setupOrder();

    const res = await initPayment(token, order._id);

    expect(res.status).toBe(200);
    expect(res.body.reference).toMatch(new RegExp(`^GF-${order._id}-`));
    expect(res.body.amount).toBe(7500);
    expect(res.body.apiKey).toBe("MK_TEST_dummy");
    expect(res.body.contractCode).toBe("1234567890");

    const saved = await Order.findById(order._id);
    expect(saved.paymentReference).toBe(res.body.reference);
  });

  it("refuses to start payment on someone else's order", async () => {
    const { order } = await setupOrder();
    const other = await request(app).post("/api/auth/register").send({
      name: "Other",
      email: "other@example.com",
      password: "password123",
    });

    const res = await initPayment(other.body.token, order._id);
    expect(res.status).toBe(401);
  });

  it("fails cleanly when Monnify isn't configured", async () => {
    const { token, order } = await setupOrder();
    const saved = process.env.MONNIFY_API_KEY;
    delete process.env.MONNIFY_API_KEY;

    const res = await initPayment(token, order._id);

    process.env.MONNIFY_API_KEY = saved;
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/temporarily unavailable/i);
  });
});

describe("PUT /api/orders/:id/pay", () => {
  it("marks the order paid when Monnify confirms PAID", async () => {
    const { token, order, email } = await setupOrder();
    const init = await initPayment(token, order._id);
    mockMonnify({ amountPaid: order.totalPrice, email });

    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reference: init.body.reference });

    expect(res.status).toBe(200);
    expect(res.body.isPaid).toBe(true);
    expect(res.body.status).toBe("processing");
    expect(res.body.paymentResult.transactionReference).toBe("MNFY|TEST|001");
  });

  it("rejects when Monnify says the payment isn't complete", async () => {
    const { token, order, email } = await setupOrder();
    await initPayment(token, order._id);
    mockMonnify({ paymentStatus: "PENDING", amountPaid: 0, email });

    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not successful \(PENDING\)/i);
  });

  it("rejects when the paid amount is less than the order total", async () => {
    const { token, order, email } = await setupOrder();
    await initPayment(token, order._id);
    mockMonnify({ amountPaid: 100, email });

    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/amount mismatch/i);
  });

  it("rejects a payment made by a different customer", async () => {
    const { token, order } = await setupOrder();
    await initPayment(token, order._id);
    mockMonnify({
      amountPaid: order.totalPrice,
      email: "someone-else@example.com",
    });

    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email mismatch/i);
  });

  it("rejects a reference that wasn't issued for this order", async () => {
    const { token, order, email } = await setupOrder();
    await initPayment(token, order._id);
    mockMonnify({ amountPaid: order.totalPrice, email });

    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({ reference: "GF-some-other-order-123" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/does not match/i);
  });

  it("rejects verification before a payment was started", async () => {
    const { token, order, email } = await setupOrder();
    mockMonnify({ amountPaid: order.totalPrice, email });

    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no payment has been started/i);
  });

  it("rejects double payment on an already-paid order", async () => {
    const { token, order, email } = await setupOrder();
    await initPayment(token, order._id);
    mockMonnify({ amountPaid: order.totalPrice, email });

    const first = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(first.status).toBe(200);

    const second = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(second.status).toBe(400);
    expect(second.body.message).toMatch(/already paid/i);
  });

  it("commits stock only once payment is confirmed", async () => {
    const { token, order, email, product } = await setupOrder();
    await initPayment(token, order._id);
    expect((await Product.findById(product._id)).stock).toBe(10);

    mockMonnify({ amountPaid: order.totalPrice, email });
    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(200);
    expect((await Product.findById(product._id)).stock).toBe(9);
  });

  it("does not touch stock when payment fails", async () => {
    const { token, order, email, product } = await setupOrder();
    await initPayment(token, order._id);
    mockMonnify({ amountPaid: 100, email }); // amount mismatch

    await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect((await Product.findById(product._id)).stock).toBe(10);
  });

  it("keeps a paid order paid and flags it when stock ran out mid-payment", async () => {
    const { token, order, email, product } = await setupOrder();
    await initPayment(token, order._id);
    // Someone else bought the last units while this customer was paying.
    await Product.updateOne({ _id: product._id }, { stock: 0 });

    mockMonnify({ amountPaid: order.totalPrice, email });
    const res = await request(app)
      .put(`/api/orders/${order._id}/pay`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.isPaid).toBe(true);
    expect((await Product.findById(product._id)).stock).toBe(0);

    const saved = await Order.findById(order._id);
    expect(saved.statusHistory.at(-1).note).toMatch(/out of stock/i);
  });
});
