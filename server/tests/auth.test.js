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

describe("POST /api/auth/register", () => {
  it("creates a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe("jane@example.com");
    expect(res.body.password).toBeUndefined();
  });

  it("rejects a duplicate email", async () => {
    await User.create({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await User.create({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects an incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/profile", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
  });

  it("returns the logged-in user's profile", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${registerRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("jane@example.com");
  });
});
