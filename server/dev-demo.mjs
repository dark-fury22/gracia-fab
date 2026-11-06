// Temporary local-demo bootstrap: spins up an in-memory MongoDB, seeds it
// with the real product catalog, then boots the real server against it.
// No real .env / credentials required. Delete this file when done.
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import Product from "./models/Product.js";
import products from "./data/products.js";
import User from "./models/User.js";

const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri();

process.env.MONGO_URI = uri;
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "dev-local-demo-secret-not-for-production";
process.env.PORT = process.env.PORT || "5000";
process.env.NODE_ENV = "development";

await mongoose.connect(uri);
await Product.deleteMany();
await Product.insertMany(products);
console.log(`Seeded ${products.length} products into in-memory MongoDB`);

await User.deleteMany();
await User.create([
  {
    name: "Gracia Fab Admin",
    email: "admin@graciafab.com",
    password: "password123",
    isAdmin: true,
  },
  {
    name: "Amara Okonkwo",
    email: "demo@graciafab.com",
    password: "password123",
    isAdmin: false,
    skinType: "oily",
    hairType: "curly",
    loyaltyPoints: 350,
    loyaltyTier: "gold",
  },
]);
console.log("Seeded demo users: admin@graciafab.com & demo@graciafab.com (password: password123)");

await mongoose.disconnect();

await import("./server.js");
