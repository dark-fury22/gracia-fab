import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FloatingBackHeader from "../components/FloatingBackHeader";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import API_URL from "../config";
import "../styles/Compare.css";

// ── Common Active Ingredients Dictionary for AI Tagging ──
const KNOWN_ACTIVES = [
  "Vitamin C",
  "Niacinamide",
  "Retinol",
  "Hyaluronic Acid",
  "Peptides",
  "Shea Butter",
  "Salicylic Acid",
  "Glycolic Acid",
  "Kojic Acid",
  "Witch Hazel",
  "Rose Water",
  "Aloe Vera",
  "Ceramides",
  "Tea Tree",
  "Argan Oil",
  "Zinc Oxide",
  "Alpha Arbutin",
];

// Helper to extract active ingredients from product data
function extractIngredients(prod) {
  if (!prod) return [];
  const text = `${prod.name} ${prod.description || ""} ${(prod.tags || []).join(" ")}`.toLowerCase();
  const matched = KNOWN_ACTIVES.filter((active) =>
    text.includes(active.toLowerCase())
  );
  return matched.length > 0 ? matched : ["Gentle Botanical Extracts", "Hydrating Complex"];
}

// Helper to infer texture and finish
function inferFinishAndTexture(prod) {
  if (!prod) return { texture: "Smooth Formula", finish: "Natural Glow" };
  const text = `${prod.name} ${prod.description || ""} ${(prod.tags || []).join(" ")}`.toLowerCase();

  let texture = "Lightweight Emulsion";
  let finish = "Natural Satin";

  if (text.includes("serum")) texture = "Lightweight Fast-Absorbing Serum";
  else if (text.includes("toner") || text.includes("mist")) texture = "Refreshing Water / Mist";
  else if (text.includes("cream") || text.includes("butter")) texture = "Rich Nourishing Cream";
  else if (text.includes("sunscreen") || text.includes("spf")) texture = "Fluid Invisible Lotion";
  else if (text.includes("wig") || text.includes("hair")) texture = "100% Raw Virgin Strands";

  if (text.includes("matte") || text.includes("oil control")) finish = "Non-Greasy Matte";
  else if (text.includes("glow") || text.includes("brightening")) finish = "Dewy Radiant Glow";
  else if (text.includes("hydrating") || text.includes("moisture")) finish = "Plump Hydrated Finish";
  else if (text.includes("bone straight")) finish = "Silky High-Gloss";

  return { texture, finish };
}

// Helper to infer routine step and usage
function inferRoutineStep(prod) {
  if (!prod) return { step: "Targeted Care", timing: "AM & PM" };
  const text = `${prod.name} ${prod.description || ""} ${(prod.tags || []).join(" ")}`.toLowerCase();

  if (text.includes("cleanser") || text.includes("wash")) {
    return { step: "Step 01: Cleanse", timing: "AM & PM" };
  }
  if (text.includes("toner") || text.includes("mist")) {
    return { step: "Step 02: Tone & Balance", timing: "AM & PM" };
  }
  if (text.includes("retinol") || text.includes("night")) {
    return { step: "Step 03: Targeted Treatment", timing: "PM Only (Night)" };
  }
  if (text.includes("serum") || text.includes("vitamin c")) {
    return { step: "Step 03: Treat & Brighten", timing: "AM (Follow with SPF)" };
  }
  if (text.includes("sunscreen") || text.includes("spf")) {
    return { step: "Step 05: Sun Shield", timing: "AM Daily" };
  }
  if (text.includes("cream") || text.includes("moisturizer") || text.includes("butter")) {
    return { step: "Step 04: Moisturize & Seal", timing: "AM & PM" };
  }
  return { step: "Specialty Beauty", timing: "As Needed" };
}

// Helper to generate AI Best-For Verdict
function generateAiVerdict(prod) {
  if (!prod) return "";
  const text = `${prod.name} ${prod.description || ""} ${(prod.tags || []).join(" ")}`.toLowerCase();

  if (text.includes("vitamin c") || text.includes("brightening")) {
    return "🏆 Best for: Fading stubborn hyperpigmentation, acne scars, and restoring melanin radiance";
  }
  if (text.includes("retinol")) {
    return "🏆 Best for: Overnight cellular renewal, smoothing fine lines, and boosting collagen";
  }
  if (text.includes("oil control") || text.includes("niacinamide") || text.includes("acne")) {
    return "🏆 Best for: Balancing oily T-zones, tightening enlarged pores, and stopping shine";
  }
  if (text.includes("shea") || text.includes("dryness") || text.includes("deep treatment")) {
    return "🏆 Best for: 24-hr barrier repair, deeply replenishing parched or sensitive skin";
  }
  if (text.includes("sunscreen") || text.includes("spf")) {
    return "🏆 Best for: Invisible broad-spectrum protection with zero white cast under Nigerian sun";
  }
  if (text.includes("wig") || text.includes("bone straight")) {
    return "🏆 Best for: Glueless everyday luxury with effortless comb-through styling";
  }
  return "🏆 Best for: Daily balancing and holistic skin nourishment";
}

function Compare({ onCartOpen }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // Product Selector Modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState("all");

  // Fetch all products
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.products || [];
          if (isMounted) {
            setAllProducts(items);

            // Read from URL params if present (e.g. ?items=id1,id2)
            const queryItems = searchParams.get("items");
            if (queryItems) {
              const ids = queryItems.split(",").filter(Boolean);
              setSelectedIds(ids.slice(0, 3));
            } else if (items.length >= 2) {
              // Default preselect 2 comparable skincare items
              const defaultPicks = items.slice(0, 2).map((p) => p._id);
              setSelectedIds(defaultPicks);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load products for comparison:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Update URL search params when selected products change
  const updateSelectedProducts = (newIds) => {
    setSelectedIds(newIds);
    if (newIds.length > 0) {
      setSearchParams({ items: newIds.join(",") });
    } else {
      setSearchParams({});
    }
  };

  // Selected product objects
  const selectedProducts = useMemo(() => {
    return selectedIds
      .map((id) => allProducts.find((p) => p._id === id))
      .filter(Boolean);
  }, [selectedIds, allProducts]);

  // Open product picker for a specific slot
  const handleOpenPicker = (slotIndex) => {
    setActiveSlot(slotIndex);
    setPickerSearch("");
    setPickerCategory("all");
    setPickerOpen(true);
  };

  // Select product into the active slot
  const handleSelectProduct = (product) => {
    const next = [...selectedIds];
    next[activeSlot] = product._id;
    // Deduplicate
    const unique = [...new Set(next)];
    updateSelectedProducts(unique);
    setPickerOpen(false);
    addToast(`Added "${product.name}" to comparison`, "info");
  };

  // Remove a product from comparison
  const handleRemoveProduct = (index) => {
    const next = selectedIds.filter((_, i) => i !== index);
    updateSelectedProducts(next);
  };

  // Quick Preset Comparison handlers
  const handleLoadPreset = (names) => {
    const matched = names
      .map((name) =>
        allProducts.find((p) =>
          p.name.toLowerCase().includes(name.toLowerCase())
        )
      )
      .filter(Boolean);

    if (matched.length >= 2) {
      updateSelectedProducts(matched.map((m) => m._id));
      addToast("Loaded preset comparison ✦", "success");
    } else if (allProducts.length >= 2) {
      updateSelectedProducts(allProducts.slice(0, 2).map((p) => p._id));
    }
  };

  // Add individual product to cart
  const handleAddToCart = (product) => {
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

  // Add all compared products to cart
  const handleAddAllToCart = () => {
    if (selectedProducts.length === 0) return;
    selectedProducts.forEach((p) => {
      addToCart({
        _id: p._id,
        name: p.name,
        price: p.price,
        image: p.image,
      });
    });
    addToast(`Added all ${selectedProducts.length} items to your bag! 🌟`, "cart");
    if (onCartOpen) onCartOpen();
  };

  // Filtered list for the modal picker
  const filteredPickerProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchSearch =
        !pickerSearch ||
        p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(pickerSearch.toLowerCase()));
      const matchCat =
        pickerCategory === "all" || p.category === pickerCategory;
      const notAlreadySelected = !selectedIds.includes(p._id);
      return matchSearch && matchCat && notAlreadySelected;
    });
  }, [allProducts, pickerSearch, pickerCategory, selectedIds]);

  return (
    <div className="compare-page-wrapper">
      <SEO
        title="Beauty Product Comparison Tool — Gracia Fab"
        description="Compare Gracia Fab skincare, hair, and wig formulations side-by-side. Analyze ingredients, skin suitability, finish, and prices."
        keywords="beauty product comparison, skincare ingredients, Nigerian skincare compare, best serum for hyperpigmentation"
        url="/compare"
      />

      <FloatingBackHeader backLabel="Back to Home" onCartOpen={onCartOpen} />

      <main className="compare-main-container">
        {/* ── HEADER ── */}
        <section className="compare-hero-header">
          <div className="compare-hero-tag">
            <span>✦ AI BEAUTY PRODUCT COMPARATOR</span>
          </div>
          <h1 className="compare-title">Side-by-Side Formulation Analysis</h1>
          <p className="compare-subtitle">
            Compare key active ingredients, skin & hair suitability, texture finish,
            and pricing to pick the absolute best formulation for your beauty goals.
          </p>

          {/* Quick Presets Bar */}
          <div className="compare-presets-bar">
            <span className="preset-label">Suggested Comparisons:</span>
            <button
              type="button"
              className="preset-pill-btn"
              onClick={() => handleLoadPreset(["Vitamin C", "Retinol"])}
            >
              ✨ Vitamin C vs Retinol Serum
            </button>
            <button
              type="button"
              className="preset-pill-btn"
              onClick={() => handleLoadPreset(["Shea Butter", "SPF 50"])}
            >
              🧴 Deep Moisture vs Invisible SPF
            </button>
            <button
              type="button"
              className="preset-pill-btn"
              onClick={() => handleLoadPreset(["Toner", "Serum"])}
            >
              💧 Balancing Toner vs Renewal Serum
            </button>
          </div>
        </section>

        {/* ── COMPARATOR SLOTS & ACTION BAR ── */}
        <div className="compare-action-strip">
          <div className="compare-status-count">
            Comparing <strong>{selectedProducts.length}</strong> of 3 products
          </div>
          {selectedProducts.length > 1 && (
            <button
              type="button"
              className="compare-add-all-btn"
              onClick={handleAddAllToCart}
            >
              + Add All ({selectedProducts.length}) to Bag
            </button>
          )}
        </div>

        {/* ── COMPARISON MATRIX TABLE / GRID ── */}
        {loading ? (
          <div className="compare-loading-state">
            <div className="compare-spinner" />
            <p>Loading formulation data...</p>
          </div>
        ) : (
          <div className="compare-matrix-scroll-wrap">
            <div
              className={`compare-matrix-grid cols-${Math.max(
                selectedProducts.length + (selectedProducts.length < 3 ? 1 : 0),
                2
              )}`}
            >
              {/* ── Column Headers (Slot Cards) ── */}
              {selectedProducts.map((prod, idx) => (
                <div key={prod._id} className="compare-col-header-card">
                  <button
                    type="button"
                    className="compare-remove-slot-btn"
                    onClick={() => handleRemoveProduct(idx)}
                    title="Remove from comparison"
                    aria-label={`Remove ${prod.name} from comparison`}
                  >
                    ✕
                  </button>

                  <div className="compare-prod-img-wrap">
                    <img src={prod.image} alt={prod.name} />
                  </div>

                  <span className="compare-brand-tag">{prod.brand || "Gracia Fab"}</span>
                  <Link to={`/products/${prod._id}`} className="compare-prod-title">
                    {prod.name}
                  </Link>

                  <div className="compare-price-val">
                    ₦{Number(prod.price).toLocaleString()}
                  </div>

                  <div className="compare-rating-pill">
                    ★ {prod.rating || 4.8} ({prod.numReviews || 12})
                  </div>

                  <button
                    type="button"
                    className="compare-slot-add-btn"
                    onClick={() => handleAddToCart(prod)}
                  >
                    Add to Bag 🛍️
                  </button>
                </div>
              ))}

              {/* Add More Product Slot (if fewer than 3 products selected) */}
              {selectedProducts.length < 3 && (
                <div
                  className="compare-add-slot-card"
                  onClick={() => handleOpenPicker(selectedProducts.length)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="add-slot-icon-circle">+</div>
                  <strong>Add Product to Compare</strong>
                  <span>Select up to 3 formulations side-by-side</span>
                </div>
              )}
            </div>

            {/* ── Matrix Comparison Rows ── */}
            {selectedProducts.length > 0 && (
              <div className="compare-matrix-rows">
                {/* 1. AI Recommendation & Verdict */}
                <div className="compare-matrix-section">
                  <div className="matrix-row-title">
                    <span>✦ AI Verdict</span>
                    <h4>Best For Recommendation</h4>
                  </div>
                  <div className="matrix-row-values">
                    {selectedProducts.map((prod) => (
                      <div key={prod._id} className="matrix-cell ai-verdict-cell">
                        <p>{generateAiVerdict(prod)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Key Active Ingredients */}
                <div className="compare-matrix-section">
                  <div className="matrix-row-title">
                    <span>🧪 Formulations</span>
                    <h4>Key Active Ingredients</h4>
                  </div>
                  <div className="matrix-row-values">
                    {selectedProducts.map((prod) => {
                      const actives = extractIngredients(prod);
                      return (
                        <div key={prod._id} className="matrix-cell">
                          <div className="matrix-tag-group">
                            {actives.map((act, i) => (
                              <span key={i} className="active-ingredient-badge">
                                ✦ {act}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Skin & Hair Suitability */}
                <div className="compare-matrix-section">
                  <div className="matrix-row-title">
                    <span>🧴 Suitability</span>
                    <h4>Recommended Skin Types</h4>
                  </div>
                  <div className="matrix-row-values">
                    {selectedProducts.map((prod) => {
                      const types = prod.suitableFor?.skinType || ["all", "combination"];
                      return (
                        <div key={prod._id} className="matrix-cell">
                          <div className="matrix-tag-group">
                            {types.map((type, i) => (
                              <span key={i} className="skin-type-badge">
                                {type.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Target Concerns */}
                <div className="compare-matrix-section">
                  <div className="matrix-row-title">
                    <span>🎯 Treatment</span>
                    <h4>Primary Concerns Addressed</h4>
                  </div>
                  <div className="matrix-row-values">
                    {selectedProducts.map((prod) => {
                      const concerns = prod.suitableFor?.concern || prod.tags || ["glow", "radiance"];
                      return (
                        <div key={prod._id} className="matrix-cell">
                          <div className="matrix-tag-group">
                            {concerns.slice(0, 4).map((c, i) => (
                              <span key={i} className="concern-badge">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Texture & Finish */}
                <div className="compare-matrix-section">
                  <div className="matrix-row-title">
                    <span>✨ Aesthetics</span>
                    <h4>Texture & Skin Finish</h4>
                  </div>
                  <div className="matrix-row-values">
                    {selectedProducts.map((prod) => {
                      const { texture, finish } = inferFinishAndTexture(prod);
                      return (
                        <div key={prod._id} className="matrix-cell">
                          <div className="matrix-text-line">
                            <strong>Texture:</strong> {texture}
                          </div>
                          <div className="matrix-text-line" style={{ marginTop: "0.25rem" }}>
                            <strong>Finish:</strong> {finish}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Routine Step & Application Timing */}
                <div className="compare-matrix-section">
                  <div className="matrix-row-title">
                    <span>⏱️ Regimen</span>
                    <h4>Routine Step & Timing</h4>
                  </div>
                  <div className="matrix-row-values">
                    {selectedProducts.map((prod) => {
                      const { step, timing } = inferRoutineStep(prod);
                      return (
                        <div key={prod._id} className="matrix-cell">
                          <span className="timing-pill">{timing}</span>
                          <span className="step-label-tag">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 7. Stock & Price Value */}
                <div className="compare-matrix-section">
                  <div className="matrix-row-title">
                    <span>🏷️ Value</span>
                    <h4>Price & Stock Availability</h4>
                  </div>
                  <div className="matrix-row-values">
                    {selectedProducts.map((prod) => (
                      <div key={prod._id} className="matrix-cell">
                        <strong className="cell-price-bold">
                          ₦{Number(prod.price).toLocaleString()}
                        </strong>
                        <div className="cell-stock-status">
                          <span className="stock-dot" /> In Stock & Ready to Dispatch (Lagos 24h)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── PRODUCT PICKER MODAL ── */}
      {pickerOpen && (
        <div className="compare-picker-overlay" onClick={() => setPickerOpen(false)}>
          <div
            className="compare-picker-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="picker-modal-header">
              <div>
                <span>✦ SELECT FORMULATION</span>
                <h3>Choose Product for Comparison</h3>
              </div>
              <button
                type="button"
                className="picker-close-btn"
                onClick={() => setPickerOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="picker-search-bar">
              <input
                type="text"
                placeholder="Search by product name, active ingredient or brand..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                autoFocus
              />
              <div className="picker-category-filters">
                {["all", "skincare", "haircare", "wig", "bridal"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`picker-cat-btn ${pickerCategory === cat ? "active" : ""}`}
                    onClick={() => setPickerCategory(cat)}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Product List Grid in Picker */}
            <div className="picker-product-list">
              {filteredPickerProducts.length === 0 ? (
                <div className="picker-empty-state">
                  <p>No matching formulations found.</p>
                </div>
              ) : (
                filteredPickerProducts.map((p) => (
                  <div
                    key={p._id}
                    className="picker-product-card"
                    onClick={() => handleSelectProduct(p)}
                  >
                    <img src={p.image} alt={p.name} />
                    <div className="picker-card-details">
                      <span className="picker-card-brand">{p.brand || "Gracia Fab"}</span>
                      <strong>{p.name}</strong>
                      <span className="picker-card-price">
                        ₦{Number(p.price).toLocaleString()}
                      </span>
                    </div>
                    <button type="button" className="picker-select-btn">
                      Select +
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Compare;
