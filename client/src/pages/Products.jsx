import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import "../styles/Products.css";
import SEO from "../components/SEO";
import "../styles/Products.css";
import API_URL from "../config";

const categories = ["all", "skincare", "haircare", "wig", "bridal"];
const sortOptions = [
  { value: "", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/products?`;
      if (activeCategory !== "all") url += `category=${activeCategory}&`;
      if (search) url += `search=${search}`;

      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const getSortedProducts = () => {
    const sorted = [...products];
    if (sort === "price_asc") return sorted.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") return sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") return sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  };

  const categoryLabels = {
    all: "All Products",
    skincare: "Skincare",
    haircare: "Haircare",
    wig: "Wigs & Hairstyles",
    bridal: "Bridal",
  };

  return (
    <div className="products-page">
      {/* Sidebar */}
      <aside className="products-sidebar">
        <div className="sidebar-section">
          <h3>Categories</h3>
          {categories.map((cat) => (
            <label key={cat} className="sidebar-option">
              <input
                type="radio"
                name="category"
                checked={activeCategory === cat}
                onChange={() => setActiveCategory(cat)}
              />
              <span>{categoryLabels[cat]}</span>
            </label>
          ))}
        </div>

        <div className="sidebar-section">
          <h3>Skin Type</h3>
          {["Oily", "Dry", "Combination", "Normal", "Sensitive"].map((type) => (
            <label key={type} className="sidebar-option">
              <input type="checkbox" />
              <span>{type}</span>
            </label>
          ))}
        </div>

        <div className="sidebar-section">
          <h3>Hair Type</h3>
          {["Straight", "Wavy", "Curly", "Coily / 4C"].map((type) => (
            <label key={type} className="sidebar-option">
              <input type="checkbox" />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="products-main">
        {/* Mobile category pills — shows on mobile instead of sidebar */}
        <div className="mobile-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`mobile-cat-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === "all" && "✨ All"}
              {cat === "skincare" && "🧴 Skincare"}
              {cat === "haircare" && "💆🏽‍♀️ Haircare"}
              {cat === "wig" && "👑 Wigs"}
              {cat === "bridal" && "💍 Bridal"}
            </button>
          ))}
        </div>
        {/* Header */}
        <div className="products-top-bar">
          <div>
            <h1>{categoryLabels[activeCategory]}</h1>
            <p className="products-count">
              {getSortedProducts().length} products
            </p>
          </div>
          <div className="products-top-right">
            <input
              type="text"
              placeholder="Search products..."
              className="products-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="products-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="products-loading">
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="products-error">⚠️ {error}</div>
        ) : getSortedProducts().length === 0 ? (
          <div className="products-empty">
            <p>No products found. Try a different filter.</p>
          </div>
        ) : (
          <div className="products-grid">
            {getSortedProducts().map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
