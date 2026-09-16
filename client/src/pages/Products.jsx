import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../styles/Products.css";
import SmartSearch from "../components/SmartSearch";
import WishlistButton from "../components/WishlistButton";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import API_URL from "../config";

// ── Gracia Fab's real product categories ──
const CATEGORY_TABS = [
  { id: "all", label: "ALL COLLECTIONS" },
  { id: "skincare", label: "SKINCARE" },
  { id: "haircare", label: "HAIRCARE" },
  { id: "wig", label: "WIGS" },
  { id: "bridal", label: "BRIDAL" },
];

const VALID_CATEGORIES = new Set(CATEGORY_TABS.map((t) => t.id));
const VALID_SORTS = new Set(["price_asc", "price_desc", "rating"]);

function Products() {
  const [searchParams] = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const requestedSort = searchParams.get("sort");
  const requestedSearch = searchParams.get("search") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    VALID_CATEGORIES.has(requestedCategory) ? requestedCategory : "all",
  );
  const [search, setSearch] = useState(requestedSearch);
  const [sort, setSort] = useState(VALID_SORTS.has(requestedSort) ? requestedSort : "");
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [smartResults, setSmartResults] = useState(null);
  const [smartQuery, setSmartQuery] = useState("");
  const [isSmartMode, setIsSmartMode] = useState(false);

  const { addToCart } = useCart();
  const { addToast } = useToast();

  // Fetch the real catalog once — category/search/sort are applied client-side
  // below so switching tabs doesn't require a re-fetch.
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/products`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    addToast(`Added ${product.name} to your bag 🛍️`, "success");
  };

  // Filter pipeline
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (activeTab !== "all") {
      list = list.filter((p) => p.category === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q),
      );
    }

    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [products, activeTab, search, sort]);

  const displayedProducts =
    isSmartMode && smartResults ? smartResults : filteredProducts;

  const clearSmartSearch = () => {
    setSmartResults(null);
    setSmartQuery("");
    setIsSmartMode(false);
  };

  return (
    <div className="maison-catalog-page" role="main">
      {/* ── 0. Breadcrumb ── */}
      <nav className="maison-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">← Back to Home</Link>
      </nav>

      {/* ── 1. Spotlight Hero Banner ── */}
      <section className="maison-spotlight-hero">
        <div className="maison-spotlight-inner">
          <span className="spotlight-tag">GRACIA FAB COLLECTIONS</span>
          <h1 className="spotlight-title">
            SKINCARE, HAIRCARE, WIGS &amp; BRIDAL BEAUTY
          </h1>
          <p className="spotlight-desc">
            Discover clinical skincare, nourishing haircare, 12A+ raw wigs,
            and bespoke bridal beauty — curated for Nigerian skin, hair and
            climate.
          </p>
          <div className="spotlight-actions">
            <button
              className="btn-spotlight-primary"
              onClick={() => setActiveTab("wig")}
            >
              Explore Wigs →
            </button>
            <button
              className="btn-spotlight-outline"
              onClick={() => setActiveTab("skincare")}
            >
              Shop Skincare
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Category Navigation Bar ── */}
      <nav className="maison-tabs-bar" aria-label="Product collection tabs">
        <div className="maison-tabs-container">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`maison-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── 3. Toolbar ── */}
      <section className="maison-toolbar-section">
        <div className="maison-toolbar-container">
          <span className="maison-count-label">
            <strong>{displayedProducts.length}</strong> Products Found
          </span>

          <div className="maison-toolbar-right">
            <input
              type="text"
              placeholder="Search collections..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="maison-search-input"
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="maison-sort-select"
              aria-label="Sort products"
            >
              <option value="">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <button
              className="maison-ai-advisor-btn"
              onClick={() => setShowSmartSearch(true)}
            >
              ✦ AI Advisor
            </button>
          </div>
        </div>
      </section>

      {isSmartMode && smartResults && (
        <div className="maison-smart-banner">
          <span>
            ✦ AI results for <strong>"{smartQuery}"</strong> — {smartResults.length} found
          </span>
          <button className="maison-smart-banner-clear" onClick={clearSmartSearch}>
            ✕ Clear
          </button>
        </div>
      )}

      {/* ── 4. Product Grid ── */}
      <section className="maison-grid-section">
        <div className="maison-grid-container">
          {loading ? (
            <p className="maison-empty-state">Loading products…</p>
          ) : displayedProducts.length === 0 ? (
            <p className="maison-empty-state">
              No products match right now — check back soon.
            </p>
          ) : (
            displayedProducts.map((product) => {
              const outOfStock =
                product.isInStock === false || product.stock === 0;

              return (
                <div key={product._id} className="maison-product-card">
                  <div className="maison-card-media">
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="maison-card-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop";
                        }}
                      />

                      {outOfStock ? (
                        <span className="maison-card-badge out-of-stock">
                          Out of Stock
                        </span>
                      ) : (
                        product.isFeatured && (
                          <span className="maison-card-badge">Featured</span>
                        )
                      )}
                    </Link>

                    <div className="maison-card-wishlist">
                      <WishlistButton productId={product._id} />
                    </div>
                  </div>

                  <div className="maison-card-info">
                    <Link to={`/products/${product._id}`} className="maison-card-title-link">
                      <h3 className="maison-card-title">{product.name}</h3>
                    </Link>

                    <div className="maison-card-price-row">
                      <span className="maison-card-price">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button
                      className="btn-maison-add-to-bag"
                      disabled={outOfStock}
                      onClick={(e) => handleAddToCart(e, product)}
                    >
                      {outOfStock ? "SOLD OUT" : "ADD TO BAG"}
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* In-Grid Portrait Editorial Card */}
          {!loading && displayedProducts.length > 0 && (
            <div className="maison-ingrid-editorial-card">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&h=950&fit=crop&crop=face"
                alt="The Gracia Fab Craft"
                className="ingrid-bg-img"
              />
              <div className="ingrid-overlay">
                <span className="ingrid-eyebrow">GRACIA FAB</span>
                <h3 className="ingrid-title">The Single-Donor Raw Hair Standard</h3>
                <Link to="/about" className="ingrid-cta-link">
                  DISCOVER THE CRAFTSMANSHIP →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SmartSearch AI Modal ── */}
      {showSmartSearch && (
        <div
          className="maison-smart-modal-overlay"
          onClick={() => setShowSmartSearch(false)}
        >
          <div
            className="maison-smart-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="maison-smart-modal-close"
              onClick={() => setShowSmartSearch(false)}
              aria-label="Close AI search"
            >
              ✕
            </button>
            <SmartSearch
              onClose={() => setShowSmartSearch(false)}
              onResults={(results, query) => {
                setSmartResults(results);
                setSmartQuery(query);
                setIsSmartMode(true);
                setShowSmartSearch(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
