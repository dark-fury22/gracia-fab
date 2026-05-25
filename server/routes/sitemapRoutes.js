import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// @route GET /sitemap.xml
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}).select("_id updatedAt");
    const baseUrl = "https://graciafab.com";

    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "weekly" },
      { url: "/products", priority: "0.9", changefreq: "daily" },
      { url: "/recommend", priority: "0.9", changefreq: "weekly" },
      { url: "/about", priority: "0.7", changefreq: "monthly" },
      { url: "/contact", priority: "0.6", changefreq: "monthly" },
      { url: "/login", priority: "0.5", changefreq: "monthly" },
      { url: "/register", priority: "0.5", changefreq: "monthly" },
    ];

    const landingPages = [
      "best-moisturiser-oily-skin-nigeria",
      "best-wig-oval-face-nigeria",
      "bridal-skincare-routine-nigeria",
      "haircare-products-natural-hair-nigeria",
      "skincare-routine-dark-skin-nigeria",
      ...landingPages.map((slug) => ({
        url: `/beauty/${slug}`,
        priority: "0.85",
        changefreq: "monthly",
      })),
    ];

    const productPages = products.map((p) => ({
      url: `/products/${p._id}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: p.updatedAt?.toISOString().split("T")[0],
    }));

    const allPages = [...staticPages, ...productPages];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
  </url>`,
  )
  .join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
