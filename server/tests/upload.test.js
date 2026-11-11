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
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(async () => ({
        secure_url:
          "https://res.cloudinary.com/demo/image/upload/v1/gracia-fab/products/abc.png",
      })),
    },
  },
}));

import { v2 as cloudinary } from "cloudinary";
import app from "../app.js";
import User from "../models/User.js";

const uploadsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/uploads",
);
// 1×1 transparent PNG.
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

let mongod;
let token;

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
  const email = "admin@example.com";
  const res = await request(app).post("/api/auth/register").send({
    name: "Admin",
    email,
    password: "password123",
  });
  await User.updateOne({ email }, { isAdmin: true });
  token = res.body.token;
  cloudinary.uploader.upload.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function upload() {
  return request(app)
    .post("/api/admin/upload")
    .set("Authorization", `Bearer ${token}`)
    .send({ imageBase64: PNG_BASE64, mimeType: "image/png" });
}

describe("POST /api/admin/upload", () => {
  it("stores the image on Cloudinary when it's configured", async () => {
    vi.stubEnv("CLOUDINARY_URL", "cloudinary://key:secret@demo");

    const res = await upload();

    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      `data:image/png;base64,${PNG_BASE64}`,
      expect.objectContaining({ folder: "gracia-fab/products" }),
    );
  });

  it("refuses in production without Cloudinary instead of using Render's disk", async () => {
    vi.stubEnv("CLOUDINARY_URL", "");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "");
    vi.stubEnv("NODE_ENV", "production");

    const res = await upload();

    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/cloudinary/i);
    expect(cloudinary.uploader.upload).not.toHaveBeenCalled();
  });

  it("falls back to local disk in development", async () => {
    vi.stubEnv("CLOUDINARY_URL", "");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "");
    vi.stubEnv("NODE_ENV", "development");

    const res = await upload();

    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/\/uploads\/img-\d+-\d+\.png$/);
    const file = path.join(uploadsDir, res.body.url.split("/uploads/")[1]);
    expect(fs.existsSync(file)).toBe(true);
    fs.unlinkSync(file);
  });

  it("returns a generic error if Cloudinary fails", async () => {
    vi.stubEnv("CLOUDINARY_URL", "cloudinary://key:secret@demo");
    cloudinary.uploader.upload.mockRejectedValueOnce(
      new Error("Invalid api_key 'key'"),
    );

    const res = await upload();

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Image upload failed. Please try again.");
  });
});
