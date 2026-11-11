// Brings an existing database up to date with the catalog in data/products.js
// without disturbing anything the team has changed through the admin
// dashboard.
//
//   - Catalog products missing from the database (matched by exact name,
//     ignoring case and extra spaces) are added. New ones start at stock 0,
//     i.e. out of stock until counted in the admin Inventory tab, unless the
//     catalog gives a count.
//   - Products that already exist only get their image filled in, and only
//     when it's empty or the placeholder. Nothing else is overwritten, and
//     products that aren't in the catalog are left alone.
//
// Dry run by default; pass --apply to write:
//   npm run catalog:sync            # shows what would change
//   npm run catalog:sync -- --apply # makes the change
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import catalog from "./products.js";
import Product from "../models/Product.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const apply = process.argv.includes("--apply");
const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
const isPlaceholder = (img) => !img || /product-placeholder/.test(img);

await mongoose.connect(process.env.MONGO_URI);

const existing = await Product.find().select("name image secondaryImage");
const byName = new Map(existing.map((p) => [norm(p.name), p]));

const toInsert = [];
const imageFixes = [];

for (const item of catalog) {
  const match = byName.get(norm(item.name));
  if (!match) {
    toInsert.push(item);
  } else if (isPlaceholder(match.image) && !isPlaceholder(item.image)) {
    imageFixes.push({ product: match, image: item.image });
  }
}

console.log(`Database has ${existing.length} products; catalog has ${catalog.length}.`);
console.log(`\nWill add ${toInsert.length} missing products (stock 0 unless the catalog gives a count):`);
for (const p of toInsert) console.log(`  + ${p.name}  [${p.category}]`);
console.log(`\nWill fill in the image for ${imageFixes.length} existing products that only have a placeholder:`);
for (const f of imageFixes) console.log(`  ~ ${f.product.name}`);

if (!apply) {
  console.log("\nDry run — nothing changed. Re-run with --apply to make these changes.");
} else {
  if (toInsert.length > 0) {
    // insertMany skips save hooks, so set isInStock from stock explicitly.
    await Product.insertMany(
      toInsert.map((p) => ({ ...p, stock: p.stock ?? 0, isInStock: (p.stock ?? 0) > 0 })),
    );
  }
  for (const f of imageFixes) {
    await Product.updateOne({ _id: f.product._id }, { $set: { image: f.image } });
  }
  console.log(`\nAdded ${toInsert.length} products and updated ${imageFixes.length} images.`);
}

await mongoose.disconnect();
