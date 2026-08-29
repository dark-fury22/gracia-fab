import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../models/User.js";

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
  await User.deleteMany({});
});

describe("request body validation", () => {
  it("rejects registration with an invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "email" })]),
    );
  });

  it("rejects registration with a too-short password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "abc",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "password" })]),
    );
  });

  it("trims and lowercases email before it reaches the controller", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "  Jane@Example.com  ",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("jane@example.com");
  });

  it("rejects an order with a missing delivery address field", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Test Buyer",
      email: "buyer@example.com",
      password: "password123",
    });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${registerRes.body.token}`)
      .send({
        orderItems: [{ product: "507f1f77bcf86cd799439011", quantity: 1 }],
        deliveryAddress: {
          fullName: "Test Buyer",
          phone: "08012345678",
          address: "1 Main St",
          city: "Lagos",
          // state missing
        },
        deliveryPrice: 2500,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "deliveryAddress.state" }),
      ]),
    );
  });

  it("rejects a contact form submission with no message", async () => {
    const res = await request(app).post("/api/contact").send({
      name: "Jane",
      email: "jane@example.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "message" })]),
    );
  });
});
