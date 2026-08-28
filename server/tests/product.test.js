import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import Product from "../models/Product.js";

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
  await Product.deleteMany({});
});

const sampleProduct = {
  name: "Hydrating Face Serum",
  description: "A lightweight serum for glowing skin.",
  price: 5500,
  image: "https://example.com/serum.jpg",
  category: "skincare",
  brand: "Gracia Fab",
};

describe("Product routes", () => {
  it("GET /api/products returns all products", async () => {
    await Product.create(sampleProduct);

    const res = await request(app).get("/api/products");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe(sampleProduct.name);
  });

  it("GET /api/products/:id returns a single product", async () => {
    const created = await Product.create(sampleProduct);

    const res = await request(app).get(`/api/products/${created._id}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe(sampleProduct.name);
  });

  it("GET /api/products/:id returns 404 for a missing product", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/products/${missingId}`);

    expect(res.status).toBe(404);
  });
});
