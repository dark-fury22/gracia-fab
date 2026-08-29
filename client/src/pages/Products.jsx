import { useState, useEffect } from "react";
import "../styles/Products.css";
import API_URL from "../config";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import SmartSearch from "../components/SmartSearch";
import { useMemo } from "react";

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
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [smartResults, setSmartResults] = useState(null);
  const [smartQuery, setSmartQuery] = useState("");
  const [skinFilters, setSkinFilters] = useState([]);
  const [hairFilters, setHairFilters] = useState([]);
  const [aiUnderstanding, setAiUnderstanding] = useState(null);
  const [isSmartMode, setIsSmartMode] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/products?`;
      if (activeCategory !== "all") url += `category=${activeCategory}&`;
      if (search) url += `search=${search}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Kicks off an async fetch that sets state on completion — not a value
    // derivable at render time.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [activeCategory, search, sort]);

  const sortedProducts = useMemo(() => {
    if (!products.length) return [];
    const sorted = [...products];

    if (sort === "price_asc") return sorted.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") return sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") return sorted.sort((a, b) => b.rating - a.rating);

    return sorted;
  }, [products, sort]);

  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((p) => {
      const skinMatch =
        skinFilters.length === 0 ||
        skinFilters.some((f) => p.skinType?.includes(f));

      const hairMatch =
        hairFilters.length === 0 ||
        hairFilters.some((f) => p.hairType?.includes(f));

      return skinMatch && hairMatch;
    });
  }, [sortedProducts, skinFilters, hairFilters]);
  const displayedProducts = isSmartMode
    ? smartResults?.length
      ? smartResults
      : filteredProducts
    : filteredProducts;

  const categoryLabels = {
    all: "All Products",
    skincare: "Skincare",
    haircare: "Haircare",
    wig: "Wigs & Hairstyles",
    bridal: "Bridal",
  };

  const toggleFilter = (value, setState) => {
    setState((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  return (
    <div className="products-page">
      {/* Sidebar */}
      <aside className="products-sidebar">
        <div className="sidebar-section">
          <h3>Categories</h3>
          {categories.map((cat) => (
            <label
              key={cat}
              className={`sidebar-option ${activeCategory === cat ? "active" : ""}`}
            >
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
              <input
                type="checkbox"
                checked={skinFilters.includes(type)}
                onChange={() => toggleFilter(type, setSkinFilters)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>

        <div className="sidebar-section">
          <h3>Hair Type</h3>
          {["Straight", "Wavy", "Curly", "Coily / 4C"].map((type) => (
            <label key={type} className="sidebar-option">
              <input
                type="checkbox"
                checked={hairFilters.includes(type)}
                onChange={() => toggleFilter(type, setHairFilters)}
              />
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
            <p className="products-count">{filteredProducts.length} products</p>
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
            <button
              className="btn-smart-search"
              onClick={() => setShowSmartSearch(true)}
            >
              ✦ AI Search
            </button>
          </div>
        </div>

        {smartResults && (
          <div className="smart-results-banner">
            <div>
              <span>
                ✦ AI results for: <strong>"{smartQuery}"</strong> —{" "}
                {smartResults.length} found
              </span>
              {aiUnderstanding?.categories?.length > 0 && (
                <span className="ai-tags">
                  {aiUnderstanding.categories.map((c) => (
                    <span key={c} className="ai-tag">
                      📦 {c}
                    </span>
                  ))}
                  {aiUnderstanding.skinTypes?.map((s) => (
                    <span key={s} className="ai-tag">
                      ✨ {s} skin
                    </span>
                  ))}
                  {aiUnderstanding.concerns?.map((c) => (
                    <span key={c} className="ai-tag">
                      🎯 {c}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSmartResults(null);
                setSmartQuery("");
                setAiUnderstanding(null);
                setIsSmartMode(false);
              }}
            >
              ✕ Clear
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="products-state-card">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="products-state-icon"
            >
              <rect x="3" y="7" width="18" height="14" rx="2" />
              <path d="M3 7l2-4h14l2 4" />
              <path d="M9 11a3 3 0 0 0 6 0" />
            </svg>
            <h3>We couldn't load the shelves</h3>
            <p>{error}. Give it another try.</p>
            <button className="btn-products-retry" onClick={fetchProducts}>
              Try Again
            </button>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="products-state-card">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              className="products-state-icon"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <h3>No products match yet</h3>
            <p>Try a different category or clear your filters.</p>
          </div>
        ) : (
          <div className="products-grid">
            {displayedProducts.map((p) => (
              <ProductCard key={p._id?.toString?.() || p.name} product={p} />
            ))}
          </div>
        )}
      </div>
      {showSmartSearch && (
        <div
          className="smart-search-modal-overlay"
          onClick={() => setShowSmartSearch(false)}
        >
          <div
            className="smart-search-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="smart-search-close"
              onClick={() => setShowSmartSearch(false)}
            >
              ✕
            </button>

            <h2 className="smart-search-title">✦ AI Beauty Search</h2>

            <p className="smart-search-subtitle">
              Ask anything — I understand natural language
            </p>

            <SmartSearch
              onResults={(results, query, parsedFilters, ai) => {
                setSmartResults(results);
                setSmartQuery(query);
                setAiUnderstanding(ai);
                setShowSmartSearch(false);
              }}
              onClose={() => setShowSmartSearch(false)}
              fullPage
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
