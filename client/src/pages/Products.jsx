import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../styles/Products.css";
import SmartSearch from "../components/SmartSearch";
import WishlistButton from "../components/WishlistButton";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import API_URL from "../config";

// ── Canonical Category Tabs / Facets ──
const CATEGORIES = [
  { id: "skincare", label: "Skincare" },
  { id: "haircare", label: "Haircare" },
  { id: "wig", label: "Wigs (100% Raw Hair)" },
  { id: "bridal", label: "Bridal Beauty" },
];

const SUITABILITY_OPTIONS = [
  { id: "oily", label: "Oily / Acne-Prone", type: "skin" },
  { id: "dry", label: "Dry / Dehydrated", type: "skin" },
  { id: "sensitive", label: "Sensitive / Gentle", type: "skin" },
  { id: "combination", label: "Combination", type: "skin" },
  { id: "curly", label: "Curly & Coily (3C–4C)", type: "hair" },
];

const PRICE_PRESETS = [
  { label: "Under ₦10,000", min: 0, max: 10000 },
  { label: "₦10,000 – ₦25,000", min: 10000, max: 25000 },
  { label: "₦25,000 – ₦50,000", min: 25000, max: 50000 },
  { label: "Above ₦50,000", min: 50000, max: Infinity },
];

const ITEMS_PER_PAGE = 12;

function Products({ onCartOpen }) {
  const [searchParams] = useSearchParams();
  const catalogTopRef = useRef(null);

  // Read URL query params on initial load
  const initialCategory = searchParams.get("category");
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "featured";

  // Data fetching state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [initialCategory] : []
  );
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceInput, setPriceInput] = useState({ min: "", max: "" });
  const [appliedPriceRange, setAppliedPriceRange] = useState({ min: null, max: null });
  const [minRating, setMinRating] = useState(null);
  const [selectedSuitabilities, setSelectedSuitabilities] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState(initialSort);

  // UI view controls
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Accordion open/collapse states
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(true);
  const [suitabilityOpen, setSuitabilityOpen] = useState(true);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // AI SmartSearch Modal state
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [smartResults, setSmartResults] = useState(null);
  const [smartQuery, setSmartQuery] = useState("");
  const [isSmartMode, setIsSmartMode] = useState(false);

  // Pre-footer Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle");

  const { addToCart } = useCart();
  const { addToast } = useToast();

  // Fetch full product catalog
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

  // Sync category param from URL if navigated via Navbar / Home
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && !selectedCategories.includes(cat)) {
      // Syncing from an external source (the URL) when it changes, not a
      // value derivable at render time — the filter stays user-editable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategories([cat]);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Derive dynamic list of brands and counts from loaded products
  const availableBrands = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        const b = p.brand.trim();
        counts[b] = (counts[b] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // Derive dynamic category product counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Format currency in Nigerian Naira
  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (selectedCategories.length > 0) {
      list = list.filter((p) => selectedCategories.includes(p.category));
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      list = list.filter((p) => p.brand && selectedBrands.includes(p.brand.trim()));
    }

    // Price range filter
    if (appliedPriceRange.min !== null) {
      list = list.filter((p) => (p.price || 0) >= appliedPriceRange.min);
    }
    if (appliedPriceRange.max !== null) {
      list = list.filter((p) => (p.price || 0) <= appliedPriceRange.max);
    }

    // Rating filter
    if (minRating !== null) {
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }

    // Skin & Hair suitability filter
    if (selectedSuitabilities.length > 0) {
      list = list.filter((p) => {
        const skinTypes = p.suitableFor?.skinType || [];
        const hairTypes = p.suitableFor?.hairType || [];
        const tags = p.tags || [];
        const allAttributes = [...skinTypes, ...hairTypes, ...tags].map((s) =>
          String(s).toLowerCase()
        );

        return selectedSuitabilities.some(
          (suit) =>
            allAttributes.includes(suit.toLowerCase()) ||
            allAttributes.includes("all")
        );
      });
    }

    // Keyword search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === "newest") {
      list.sort((a, b) => String(b._id || "").localeCompare(String(a._id || "")));
    } else {
      // featured / popularity
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return list;
  }, [
    products,
    selectedCategories,
    selectedBrands,
    appliedPriceRange,
    minRating,
    selectedSuitabilities,
    search,
    sort,
  ]);

  // Determine effective displayed products (Smart Mode vs Filtered)
  const activeProducts = isSmartMode && smartResults ? smartResults : filteredProducts;

  // Pagination calculation
  const totalProducts = activeProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = activeProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Filter actions
  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
    setCurrentPage(1);
  };

  const toggleBrand = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
    setCurrentPage(1);
  };

  const toggleSuitability = (suitId) => {
    setSelectedSuitabilities((prev) =>
      prev.includes(suitId) ? prev.filter((s) => s !== suitId) : [...prev, suitId]
    );
    setCurrentPage(1);
  };

  const handleApplyPrice = (e) => {
    if (e) e.preventDefault();
    const min = priceInput.min !== "" ? Number(priceInput.min) : null;
    const max = priceInput.max !== "" ? Number(priceInput.max) : null;
    setAppliedPriceRange({ min, max });
    setCurrentPage(1);
  };

  const handlePricePreset = (preset) => {
    setPriceInput({
      min: preset.min > 0 ? String(preset.min) : "",
      max: preset.max < Infinity ? String(preset.max) : "",
    });
    setAppliedPriceRange({
      min: preset.min > 0 ? preset.min : null,
      max: preset.max < Infinity ? preset.max : null,
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceInput({ min: "", max: "" });
    setAppliedPriceRange({ min: null, max: null });
    setMinRating(null);
    setSelectedSuitabilities([]);
    setSearch("");
    setSort("featured");
    setCurrentPage(1);
    setSmartResults(null);
    setIsSmartMode(false);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    appliedPriceRange.min !== null ||
    appliedPriceRange.max !== null ||
    minRating !== null ||
    selectedSuitabilities.length > 0 ||
    search.trim().length > 0 ||
    isSmartMode;

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    addToast(`Added "${product.name}" to your bag 🛍️`, "cart");
    if (onCartOpen) onCartOpen();
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("submitting");
    try {
      const res = await fetch(`${API_URL}/api/contact/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      if (!res.ok) throw new Error("Failed");
      setNewsletterStatus("success");
      addToast("Welcome to the Gracia Fab Beauty Club! ✨", "success");
      setNewsletterEmail("");
    } catch {
      setNewsletterStatus("error");
      addToast("Subscription failed. Please try again.", "error");
    }
  };

  return (
    <div className="glow-catalog-page" ref={catalogTopRef}>
      {/* ── 1. Editorial Header Banner ── */}
      <section className="glow-catalog-hero">
        <div className="glow-catalog-hero-inner">
          <nav className="glow-catalog-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="crumb-sep">/</span>
            <span>Products</span>
          </nav>
          <h1 className="glow-catalog-hero-title">Discover Our Beauty Collection</h1>
          <p className="glow-catalog-hero-desc">
            Curated clinical skincare, 100% single-donor raw human hair wigs, and bespoke bridal beauty formulated for Nigerian complexions and climate.
          </p>
        </div>
      </section>

      {/* ── 2. Two-Column Catalog Layout (Sidebar Filter Rail + Main Catalog) ── */}
      <div className="glow-catalog-container">
        {/* Mobile Filter Drawer Overlay Backdrop */}
        {mobileFilterOpen && (
          <div
            className="glow-mobile-filter-backdrop"
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Filter Sidebar Rail ── */}
        <aside
          className={`glow-filter-sidebar ${mobileFilterOpen ? "mobile-open" : ""}`}
          aria-label="Product filters"
        >
          <div className="sidebar-sticky-inner">
            <div className="sidebar-header">
              <div className="sidebar-title-group">
                <span className="sidebar-icon" aria-hidden="true">✦</span>
                <h2 className="sidebar-heading">Filters</h2>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="sidebar-clear-all-btn"
                  onClick={clearAllFilters}
                >
                  Clear All
                </button>
              )}
              {/* Mobile Drawer Close Button */}
              <button
                type="button"
                className="sidebar-mobile-close-btn"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>

            {/* Accordion 1: Categories */}
            <div className="filter-group">
              <button
                type="button"
                className="filter-group-header"
                onClick={() => setCategoryOpen(!categoryOpen)}
                aria-expanded={categoryOpen}
              >
                <span>Categories</span>
                <span className="accordion-chevron">{categoryOpen ? "−" : "+"}</span>
              </button>

              {categoryOpen && (
                <div className="filter-group-content">
                  {CATEGORIES.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id);
                    const count = categoryCounts[cat.id] || 0;
                    return (
                      <label key={cat.id} className="filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.id)}
                        />
                        <span className="checkbox-custom" />
                        <span className="checkbox-text">{cat.label}</span>
                        <span className="checkbox-count">({count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion 2: Brands */}
            {availableBrands.length > 0 && (
              <div className="filter-group">
                <button
                  type="button"
                  className="filter-group-header"
                  onClick={() => setBrandOpen(!brandOpen)}
                  aria-expanded={brandOpen}
                >
                  <span>Brands</span>
                  <span className="accordion-chevron">{brandOpen ? "−" : "+"}</span>
                </button>

                {brandOpen && (
                  <div className="filter-group-content">
                    {(showAllBrands ? availableBrands : availableBrands.slice(0, 5)).map(
                      (item) => {
                        const isChecked = selectedBrands.includes(item.brand);
                        return (
                          <label key={item.brand} className="filter-checkbox-label">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleBrand(item.brand)}
                            />
                            <span className="checkbox-custom" />
                            <span className="checkbox-text">{item.brand}</span>
                            <span className="checkbox-count">({item.count})</span>
                          </label>
                        );
                      }
                    )}
                    {availableBrands.length > 5 && (
                      <button
                        type="button"
                        className="filter-toggle-more-btn"
                        onClick={() => setShowAllBrands(!showAllBrands)}
                      >
                        {showAllBrands ? "− Show Less" : `+ More Brands (${availableBrands.length - 5})`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Accordion 3: Price Range (Naira) */}
            <div className="filter-group">
              <button
                type="button"
                className="filter-group-header"
                onClick={() => setPriceOpen(!priceOpen)}
                aria-expanded={priceOpen}
              >
                <span>Price Range (₦)</span>
                <span className="accordion-chevron">{priceOpen ? "−" : "+"}</span>
              </button>

              {priceOpen && (
                <div className="filter-group-content">
                  {/* Preset Pills */}
                  <div className="price-presets-wrap">
                    {PRICE_PRESETS.map((p) => {
                      const isActive =
                        appliedPriceRange.min === (p.min > 0 ? p.min : null) &&
                        appliedPriceRange.max === (p.max < Infinity ? p.max : null);
                      return (
                        <button
                          key={p.label}
                          type="button"
                          className={`price-preset-chip ${isActive ? "active" : ""}`}
                          onClick={() => handlePricePreset(p)}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Min / Max Input Fields */}
                  <form onSubmit={handleApplyPrice} className="price-inputs-form">
                    <div className="price-inputs-row">
                      <div className="price-input-col">
                        <label htmlFor="min-price" className="price-label">Min (₦)</label>
                        <input
                          id="min-price"
                          type="number"
                          placeholder="0"
                          value={priceInput.min}
                          onChange={(e) =>
                            setPriceInput({ ...priceInput, min: e.target.value })
                          }
                          className="price-field"
                        />
                      </div>
                      <span className="price-dash">–</span>
                      <div className="price-input-col">
                        <label htmlFor="max-price" className="price-label">Max (₦)</label>
                        <input
                          id="max-price"
                          type="number"
                          placeholder="100,000"
                          value={priceInput.max}
                          onChange={(e) =>
                            setPriceInput({ ...priceInput, max: e.target.value })
                          }
                          className="price-field"
                        />
                      </div>
                    </div>
                    <button type="submit" className="price-apply-btn">
                      APPLY
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Accordion 4: Customer Rating */}
            <div className="filter-group">
              <button
                type="button"
                className="filter-group-header"
                onClick={() => setRatingOpen(!ratingOpen)}
                aria-expanded={ratingOpen}
              >
                <span>Customer Rating</span>
                <span className="accordion-chevron">{ratingOpen ? "−" : "+"}</span>
              </button>

              {ratingOpen && (
                <div className="filter-group-content">
                  {[5, 4, 3].map((stars) => {
                    const isChecked = minRating === stars;
                    return (
                      <label key={stars} className="filter-checkbox-label">
                        <input
                          type="radio"
                          name="rating-filter"
                          checked={isChecked}
                          onChange={() => setMinRating(isChecked ? null : stars)}
                        />
                        <span className="checkbox-custom radio" />
                        <span className="rating-stars-gold">
                          {"★".repeat(stars)}
                          {"☆".repeat(5 - stars)}
                        </span>
                        <span className="checkbox-text">
                          {stars === 5 ? "5.0 only" : `${stars}.0 & Up`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion 5: Skin & Hair Suitability */}
            <div className="filter-group">
              <button
                type="button"
                className="filter-group-header"
                onClick={() => setSuitabilityOpen(!suitabilityOpen)}
                aria-expanded={suitabilityOpen}
              >
                <span>Skin &amp; Hair Type</span>
                <span className="accordion-chevron">{suitabilityOpen ? "−" : "+"}</span>
              </button>

              {suitabilityOpen && (
                <div className="filter-group-content">
                  {SUITABILITY_OPTIONS.map((item) => {
                    const isChecked = selectedSuitabilities.includes(item.id);
                    return (
                      <label key={item.id} className="filter-checkbox-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSuitability(item.id)}
                        />
                        <span className="checkbox-custom" />
                        <span className="checkbox-text">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Drawer Bottom Apply */}
            <div className="mobile-drawer-footer">
              <button
                type="button"
                className="mobile-apply-btn"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters ({filteredProducts.length} Results)
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Catalog Content Area ── */}
        <main className="glow-catalog-main">
          {/* Top Control Bar (Search, Sort, View Modes) */}
          <div className="glow-catalog-toolbar">
            <div className="toolbar-left">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                className="mobile-filter-trigger-btn"
                onClick={() => setMobileFilterOpen(true)}
              >
                <span className="filter-icon">⚙️</span>
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="filter-badge">
                    {selectedCategories.length +
                      selectedBrands.length +
                      (appliedPriceRange.min !== null || appliedPriceRange.max !== null ? 1 : 0) +
                      (minRating ? 1 : 0) +
                      selectedSuitabilities.length}
                  </span>
                )}
              </button>

              {/* Results Count */}
              <span className="catalog-results-count">
                Showing{" "}
                <strong>
                  {totalProducts === 0
                    ? 0
                    : `${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, totalProducts)}`}
                </strong>{" "}
                of <strong>{totalProducts}</strong> results
              </span>
            </div>

            <div className="toolbar-right">
              {/* Live Search Input */}
              <div className="catalog-search-wrap">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="catalog-search-input"
                  aria-label="Search products"
                />
                {search && (
                  <button
                    type="button"
                    className="catalog-search-clear"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setCurrentPage(1);
                }}
                className="catalog-sort-select"
                aria-label="Sort products by"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>

              {/* Grid / List Mode Switcher */}
              <div className="view-mode-switch" role="group" aria-label="Catalog view mode">
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  title="List view"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="4" width="18" height="3" rx="1" />
                    <rect x="3" y="10.5" width="18" height="3" rx="1" />
                    <rect x="3" y="17" width="18" height="3" rx="1" />
                  </svg>
                </button>
              </div>

              {/* AI Smart Search Advisor Trigger */}
              <button
                type="button"
                className="catalog-ai-advisor-btn"
                onClick={() => setShowSmartSearch(true)}
              >
                ✦ AI Advisor
              </button>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="glow-active-filters-bar">
              <span className="active-filters-label">Active Filters:</span>

              {selectedCategories.map((catId) => {
                const cat = CATEGORIES.find((c) => c.id === catId);
                return (
                  <button
                    key={catId}
                    type="button"
                    className="filter-pill-tag"
                    onClick={() => toggleCategory(catId)}
                  >
                    <span>{cat?.label || catId}</span>
                    <span className="pill-remove">✕</span>
                  </button>
                );
              })}

              {selectedBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  className="filter-pill-tag"
                  onClick={() => toggleBrand(brand)}
                >
                  <span>{brand}</span>
                  <span className="pill-remove">✕</span>
                </button>
              ))}

              {(appliedPriceRange.min !== null || appliedPriceRange.max !== null) && (
                <button
                  type="button"
                  className="filter-pill-tag"
                  onClick={() => {
                    setPriceInput({ min: "", max: "" });
                    setAppliedPriceRange({ min: null, max: null });
                  }}
                >
                  <span>
                    Price: {appliedPriceRange.min ? `₦${appliedPriceRange.min.toLocaleString()}` : "₦0"} –{" "}
                    {appliedPriceRange.max ? `₦${appliedPriceRange.max.toLocaleString()}` : "Any"}
                  </span>
                  <span className="pill-remove">✕</span>
                </button>
              )}

              {minRating !== null && (
                <button
                  type="button"
                  className="filter-pill-tag"
                  onClick={() => setMinRating(null)}
                >
                  <span>★ {minRating}.0+</span>
                  <span className="pill-remove">✕</span>
                </button>
              )}

              {selectedSuitabilities.map((suitId) => {
                const suit = SUITABILITY_OPTIONS.find((s) => s.id === suitId);
                return (
                  <button
                    key={suitId}
                    type="button"
                    className="filter-pill-tag"
                    onClick={() => toggleSuitability(suitId)}
                  >
                    <span>{suit?.label || suitId}</span>
                    <span className="pill-remove">✕</span>
                  </button>
                );
              })}

              {search && (
                <button
                  type="button"
                  className="filter-pill-tag"
                  onClick={() => setSearch("")}
                >
                  <span>Query: "{search}"</span>
                  <span className="pill-remove">✕</span>
                </button>
              )}

              <button
                type="button"
                className="filter-clear-all-link"
                onClick={clearAllFilters}
              >
                Reset All
              </button>
            </div>
          )}

          {/* SmartSearch Active Query Alert Banner */}
          {isSmartMode && smartResults && (
            <div className="glow-smart-active-banner">
              <span>
                ✦ AI Matched results for <strong>"{smartQuery}"</strong> ({smartResults.length} found)
              </span>
              <button
                type="button"
                className="smart-banner-clear-btn"
                onClick={() => {
                  setSmartResults(null);
                  setIsSmartMode(false);
                }}
              >
                ✕ Clear AI Search
              </button>
            </div>
          )}

          {/* ── Product Cards Display (Grid vs List) ── */}
          {loading ? (
            <div className="glow-catalog-loading">
              <span className="loading-spinner" aria-hidden="true">✦</span>
              <p>Loading Gracia Fab collections…</p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="glow-catalog-empty">
              <span className="empty-icon">🛍️</span>
              <h3>No products match your filters</h3>
              <p>Try adjusting your search query, price range, or category filters.</p>
              <button
                type="button"
                className="empty-reset-btn"
                onClick={clearAllFilters}
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* ── GRID MODE (4-Column Layout) ── */
            <div className="glow-products-grid">
              {paginatedProducts.map((product) => {
                const outOfStock = product.isInStock === false || product.stock === 0;
                const discount = product.originalPrice && product.originalPrice > product.price
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : product.discountPercent || null;

                return (
                  <article key={product._id} className="glow-product-card">
                    <div className="card-media-wrap">
                      <Link to={`/products/${product._id}`} className="card-img-link">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="card-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80";
                          }}
                        />
                      </Link>

                      {/* Badges */}
                      <div className="card-badges-wrap">
                        {outOfStock ? (
                          <span className="card-badge badge-sold-out">Sold Out</span>
                        ) : discount ? (
                          <span className="card-badge badge-discount">-{discount}%</span>
                        ) : product.isFeatured ? (
                          <span className="card-badge badge-featured">Featured</span>
                        ) : null}
                      </div>

                      {/* Wishlist Button */}
                      <div className="card-wishlist-wrap">
                        <WishlistButton productId={product._id} />
                      </div>

                      {/* Hover Overlay Action Bar */}
                      {!outOfStock && (
                        <div className="card-hover-actions">
                          <button
                            type="button"
                            className="card-quick-add-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                            aria-label={`Add ${product.name} to bag`}
                          >
                            <span>+ ADD TO BAG</span>
                            <span className="bag-icon">🛍️</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="card-details">
                      {product.brand && (
                        <span className="card-brand">{product.brand}</span>
                      )}

                      <Link to={`/products/${product._id}`} className="card-title-link">
                        <h3 className="card-title">{product.name}</h3>
                      </Link>

                      {/* Rating Row */}
                      <div className="card-rating-row">
                        <span className="card-stars-gold">
                          {"★".repeat(Math.round(product.rating || 5))}
                        </span>
                        <span className="card-rating-val">{product.rating || "4.8"}</span>
                        <span className="card-reviews-count">
                          ({product.numReviews || product.reviewsCount || 16})
                        </span>
                      </div>

                      {/* Price Row */}
                      <div className="card-price-row">
                        <span className="card-current-price">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="card-strikethrough-price">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Touch-Friendly Direct Add Button for Mobile */}
                      <button
                        type="button"
                        className="card-touch-add-btn"
                        disabled={outOfStock}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        {outOfStock ? "Sold Out" : "+ Add to Bag"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* ── LIST MODE (Horizontal Detailed Rows) ── */
            <div className="glow-products-list">
              {paginatedProducts.map((product) => {
                const outOfStock = product.isInStock === false || product.stock === 0;

                return (
                  <article key={product._id} className="glow-product-list-card">
                    <div className="list-card-media">
                      <Link to={`/products/${product._id}`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="list-card-img"
                        />
                      </Link>
                      <div className="card-wishlist-wrap">
                        <WishlistButton productId={product._id} />
                      </div>
                    </div>

                    <div className="list-card-center">
                      {product.brand && (
                        <span className="card-brand">{product.brand}</span>
                      )}
                      <Link to={`/products/${product._id}`} className="card-title-link">
                        <h3 className="list-card-title">{product.name}</h3>
                      </Link>
                      <p className="list-card-desc">{product.description}</p>

                      <div className="card-rating-row">
                        <span className="card-stars-gold">
                          {"★".repeat(Math.round(product.rating || 5))}
                        </span>
                        <span className="card-rating-val">{product.rating || "4.8"}</span>
                        <span className="card-reviews-count">
                          ({product.numReviews || product.reviewsCount || 16} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="list-card-right">
                      <div className="card-price-row">
                        <span className="card-current-price">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="card-strikethrough-price">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      <span className={`list-stock-status ${outOfStock ? "out" : "in"}`}>
                        {outOfStock ? "• Out of Stock" : "• In Stock · Lagos Dispatch"}
                      </span>

                      <button
                        type="button"
                        className="list-add-btn"
                        disabled={outOfStock}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        {outOfStock ? "Sold Out" : "Add to Bag 🛍️"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* ── 3. Numbered Pagination Bar ── */}
          {totalPages > 1 && (
            <nav className="glow-pagination" aria-label="Catalog pagination">
              <button
                type="button"
                className="pagination-arrow-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Previous page"
              >
                ‹ Prev
              </button>

              <div className="pagination-pages-group">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`pagination-number-btn ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => handlePageChange(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="pagination-arrow-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Next page"
              >
                Next ›
              </button>
            </nav>
          )}

          {/* ── 4. Standalone Pre-Footer Newsletter Card (Matching Screen 2 & 3) ── */}
          <section className="glow-catalog-newsletter" aria-label="Catalog newsletter sign up">
            <div className="newsletter-card-inner">
              <span className="newsletter-sparkle" aria-hidden="true">✦</span>
              <h3 className="newsletter-heading">
                Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and beauty tips.
              </h3>

              {newsletterStatus === "success" ? (
                <div className="newsletter-success-box">
                  <span>✓ You&rsquo;re subscribed! Check your inbox for your welcome privilege code.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="newsletter-form-row">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="newsletter-input"
                    aria-label="Email address for beauty newsletter"
                  />
                  <button
                    type="submit"
                    className="newsletter-submit-btn"
                    disabled={newsletterStatus === "submitting"}
                  >
                    {newsletterStatus === "submitting" ? "SUBSCRIBING..." : "SUBSCRIBE"}
                  </button>
                </form>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* ── SmartSearch AI Modal (Preserved) ── */}
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
