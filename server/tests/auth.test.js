import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";

let mongod;

// The login OTP is emailed, never returned over the API — in non-production
// the controller also logs it via logger.info({ email, code }, "OTP generated
// (dev mode)") specifically so it can be recovered here without needing a
// real mailbox.
async function loginAndGetOtp(email, password) {
  const spy = vi.spyOn(logger, "info");
  const res = await request(app).post("/api/auth/login").send({ email, password });
  const call = spy.mock.calls.find(
    ([data, msg]) => msg === "OTP generated (dev mode)" && data?.email === email,
  );
  spy.mockRestore();
  return { res, code: call?.[0]?.code };
}

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

  it("accepts correct credentials but withholds the token pending OTP", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.requiresOtp).toBe(true);
    expect(res.body.token).toBeUndefined();
  });

  it("rejects an incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/verify-otp", () => {
  beforeEach(async () => {
    await User.create({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });
  });

  it("issues a token for the correct code", async () => {
    const { code } = await loginAndGetOtp("jane@example.com", "password123");
    expect(code).toMatch(/^\d{6}$/);

    const res = await request(app).post("/api/auth/verify-otp").send({
      email: "jane@example.com",
      code,
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe("jane@example.com");
  });

  it("rejects an incorrect code", async () => {
    await loginAndGetOtp("jane@example.com", "password123");

    const res = await request(app).post("/api/auth/verify-otp").send({
      email: "jane@example.com",
      code: "000000",
    });

    expect(res.status).toBe(400);
    expect(res.body.token).toBeUndefined();
  });

  it("rejects a code that's already been used", async () => {
    const { code } = await loginAndGetOtp("jane@example.com", "password123");

    await request(app).post("/api/auth/verify-otp").send({ email: "jane@example.com", code });
    const res = await request(app)
      .post("/api/auth/verify-otp")
      .send({ email: "jane@example.com", code });

    expect(res.status).toBe(400);
  });

  it("locks out after too many incorrect attempts", async () => {
    await loginAndGetOtp("jane@example.com", "password123");

    let res;
    for (let i = 0; i < 6; i++) {
      res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "jane@example.com", code: "111111" });
    }

    expect(res.status).toBe(429);
  });
});

describe("POST /api/auth/resend-otp", () => {
  it("sends a new code that supersedes the old one", async () => {
    await User.create({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    const { code: firstCode } = await loginAndGetOtp("jane@example.com", "password123");

    const spy = vi.spyOn(logger, "info");
    await request(app).post("/api/auth/resend-otp").send({ email: "jane@example.com" });
    const call = spy.mock.calls.find(
      ([data, msg]) =>
        msg === "OTP generated (dev mode)" && data?.email === "jane@example.com",
    );
    spy.mockRestore();
    const secondCode = call?.[0]?.code;

    expect(secondCode).toMatch(/^\d{6}$/);

    const staleRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({ email: "jane@example.com", code: firstCode });
    expect(staleRes.status).toBe(400);

    const freshRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({ email: "jane@example.com", code: secondCode });
    expect(freshRes.status).toBe(200);
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
