import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import crypto from "crypto";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

let mongod;

beforeAll(async () => {
  process.env.PAYSTACK_SECRET_KEY = "sk_test_dummy";
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Order.deleteMany({})]);
});

function signPayload(payload) {
  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return { body, signature };
}

describe("POST /api/webhooks/paystack", () => {
  it("rejects a request with an invalid signature", async () => {
    const { body } = signPayload({
      event: "charge.success",
      data: { reference: "ref_1" },
    });

    const res = await request(app)
      .post("/api/webhooks/paystack")
      .set("Content-Type", "application/json")
      .set("x-paystack-signature", "not-the-real-signature")
      .send(body);

    expect(res.status).toBe(400);
  });

  it("marks the matching order as paid on a valid charge.success event", async () => {
    const user = await User.create({
      name: "Buyer",
      email: "buyer2@example.com",
      password: "password123",
    });
    const order = await Order.create({
      user: user._id,
      orderItems: [],
      itemsPrice: 5000,
      deliveryPrice: 2500,
      totalPrice: 7500,
      isPaid: false,
      status: "pending",
      paymentResult: { reference: "ref_webhook_1" },
    });

    const { body, signature } = signPayload({
      event: "charge.success",
      data: {
        reference: "ref_webhook_1",
        amount: 750000,
        channel: "card",
        paid_at: "2026-01-01T00:00:00.000Z",
      },
    });

    const res = await request(app)
      .post("/api/webhooks/paystack")
      .set("Content-Type", "application/json")
      .set("x-paystack-signature", signature)
      .send(body);

    expect(res.status).toBe(200);

    const updated = await Order.findById(order._id);
    expect(updated.isPaid).toBe(true);
    expect(updated.status).toBe("processing");
  });

  it("does not double-count an already-paid order replayed on the webhook", async () => {
    const user = await User.create({
      name: "Buyer",
      email: "buyer3@example.com",
      password: "password123",
    });
    const order = await Order.create({
      user: user._id,
      orderItems: [],
      itemsPrice: 5000,
      deliveryPrice: 2500,
      totalPrice: 7500,
      isPaid: true,
      paidAt: new Date("2026-01-01T00:00:00.000Z"),
      status: "processing",
      paymentResult: { reference: "ref_webhook_2", amount: 7500 },
    });

    const { body, signature } = signPayload({
      event: "charge.success",
      data: {
        reference: "ref_webhook_2",
        amount: 750000,
        channel: "card",
        paid_at: "2026-02-01T00:00:00.000Z",
      },
    });

    const res = await request(app)
      .post("/api/webhooks/paystack")
      .set("Content-Type", "application/json")
      .set("x-paystack-signature", signature)
      .send(body);

    expect(res.status).toBe(200);

    const updated = await Order.findById(order._id);
    // paidAt should be unchanged — the handler skips already-paid orders.
    expect(updated.paidAt.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });
});
