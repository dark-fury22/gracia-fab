import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import request from "supertest";
import crypto from "crypto";
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

afterEach(() => {
  vi.unstubAllEnvs();
});

function sign(payload) {
  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha512", process.env.MONNIFY_SECRET_KEY)
    .update(body)
    .digest("hex");
  return { body, signature };
}

function successEvent(paymentReference, extra = {}) {
  return {
    eventType: "SUCCESSFUL_TRANSACTION",
    eventData: {
      paymentReference,
      transactionReference: "MNFY|TEST|001",
      amountPaid: 7500,
      paymentStatus: "PAID",
      ...extra,
    },
  };
}

// What Monnify's API says when we re-query — the source of truth.
function mockMonnifyQuery({ paymentStatus = "PAID", amountPaid = 7500 } = {}) {
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
              paymentMethod: "ACCOUNT_TRANSFER",
              paidOn: "2026-01-01 00:00:00",
              customer: { email: "buyer@example.com" },
            },
          },
  }));
}

async function createPendingOrder({ reference, stock = 10 } = {}) {
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
        price: 5000,
        quantity: 1,
      },
    ],
    itemsPrice: 5000,
    deliveryPrice: 2500,
    totalPrice: 7500,
    isPaid: false,
    status: "pending",
    paymentReference: reference,
  });
  return { order, product };
}

describe("POST /api/webhooks/monnify", () => {
  it("rejects a request with an invalid signature", async () => {
    const { body } = sign(successEvent("GF-x-1"));

    const res = await request(app)
      .post("/api/webhooks/monnify")
      .set("Content-Type", "application/json")
      .set("monnify-signature", "not-the-real-signature")
      .send(body);

    expect(res.status).toBe(400);
  });

  it("requires a signature in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { body } = sign(successEvent("GF-x-1"));

    const res = await request(app)
      .post("/api/webhooks/monnify")
      .set("Content-Type", "application/json")
      .send(body);

    expect(res.status).toBe(400);
  });

  it("marks the order paid after re-confirming with Monnify", async () => {
    const { order, product } = await createPendingOrder({ reference: "GF-a-1" });
    mockMonnifyQuery();
    const { body, signature } = sign(successEvent("GF-a-1"));

    const res = await request(app)
      .post("/api/webhooks/monnify")
      .set("Content-Type", "application/json")
      .set("monnify-signature", signature)
      .send(body);

    expect(res.status).toBe(200);
    const updated = await Order.findById(order._id);
    expect(updated.isPaid).toBe(true);
    expect(updated.status).toBe("processing");
    expect(updated.paymentResult.channel).toBe("ACCOUNT_TRANSFER");
    expect((await Product.findById(product._id)).stock).toBe(9);
  });

  it("accepts an unsigned sandbox webhook but still re-confirms with Monnify", async () => {
    const { order } = await createPendingOrder({ reference: "GF-b-1" });
    mockMonnifyQuery();
    const { body } = sign(successEvent("GF-b-1"));

    const res = await request(app)
      .post("/api/webhooks/monnify")
      .set("Content-Type", "application/json")
      .send(body);

    expect(res.status).toBe(200);
    expect((await Order.findById(order._id)).isPaid).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("paymentReference=GF-b-1"),
      expect.anything(),
    );
  });

  it("does not trust a forged payload when Monnify says it isn't paid", async () => {
    const { order, product } = await createPendingOrder({ reference: "GF-c-1" });
    mockMonnifyQuery({ paymentStatus: "PENDING", amountPaid: 0 });
    // Payload claims PAID; Monnify's API disagrees.
    const { body } = sign(successEvent("GF-c-1"));

    const res = await request(app)
      .post("/api/webhooks/monnify")
      .set("Content-Type", "application/json")
      .send(body);

    expect(res.status).toBe(200);
    expect((await Order.findById(order._id)).isPaid).toBe(false);
    expect((await Product.findById(product._id)).stock).toBe(10);
  });

  it("does not double-count a replayed webhook for an already-paid order", async () => {
    const { order, product } = await createPendingOrder({ reference: "GF-d-1" });
    mockMonnifyQuery();
    const { body, signature } = sign(successEvent("GF-d-1"));

    for (let i = 0; i < 2; i += 1) {
      const res = await request(app)
        .post("/api/webhooks/monnify")
        .set("Content-Type", "application/json")
        .set("monnify-signature", signature)
        .send(body);
      expect(res.status).toBe(200);
    }

    expect((await Order.findById(order._id)).isPaid).toBe(true);
    expect((await Product.findById(product._id)).stock).toBe(9);
  });

  it("asks Monnify to retry when the status lookup fails", async () => {
    await createPendingOrder({ reference: "GF-e-1" });
    fetch.mockRejectedValue(new Error("network down"));
    const { body } = sign(successEvent("GF-e-1"));

    const res = await request(app)
      .post("/api/webhooks/monnify")
      .set("Content-Type", "application/json")
      .send(body);

    expect(res.status).toBe(500);
  });
});
