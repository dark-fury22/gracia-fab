// One-off: mark never-counted products as out of stock in an existing
// database.
//
// Products seeded before the stock default changed to 0 got an invented
// stock of 50. This finds the products whose catalog entry (data/products.js)
// has no stock count AND whose database stock is still exactly 50 — i.e.
// untouched since seeding — and sets them to 0. Anything an admin has since
// edited (any value other than 50) is left alone.
//
// Dry run by default; pass --apply to write:
//   npm run stock:zero-uncounted            # shows what would change
//   npm run stock:zero-uncounted -- --apply # makes the change
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import products from "./products.js";
import Product from "../models/Product.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const OLD_DEFAULT = 50;
const apply = process.argv.includes("--apply");

const uncountedNames = products
  .filter((p) => p.stock === undefined || p.stock === null)
  .map((p) => p.name);

await mongoose.connect(process.env.MONGO_URI);

const targets = await Product.find({
  name: { $in: uncountedNames },
  stock: OLD_DEFAULT,
}).select("name stock");

console.log(
  `${uncountedNames.length} catalog products have no stock count; ` +
    `${targets.length} of them still show the old default of ${OLD_DEFAULT} in the database.`,
);
for (const p of targets) console.log(`  - ${p.name}`);

if (!apply) {
  console.log("\nDry run — nothing changed. Re-run with --apply to set these to 0.");
} else if (targets.length > 0) {
  const result = await Product.updateMany(
    { _id: { $in: targets.map((p) => p._id) } },
    { $set: { stock: 0, isInStock: false } },
  );
  console.log(`\nSet ${result.modifiedCount} products to 0 (out of stock).`);
}

await mongoose.disconnect();
