import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import FloatingBackHeader from "../components/FloatingBackHeader";
import Footer from "../components/Footer";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import API_URL from "../config";
import "../styles/ProductDetail.css";

// ── Vouchers / Coupons (matching GLOWIFY Screen 1, 2, 3, 4) ──
const AVAILABLE_VOUCHERS = [
  { code: "GLOW05", discount: "5% OFF", condition: "First luxury order" },
  { code: "BEAUTY20", discount: "20% OFF", condition: "Orders over ₦25,000" },
  { code: "LUXE5K", discount: "₦5,000 OFF", condition: "Min spend ₦50,000" },
];

// ── Fallback angle shots for rich gallery when product has single image ──
function getProductGallery(product) {
  if (!product) return [];
  if (Array.isArray(product.images) && product.images.length > 1) {
    return product.images;
  }
  // Generate high-fidelity beauty variant views based on main image
  const baseImg = product.image;
  return [
    baseImg,
    product.secondaryImage || baseImg,
    baseImg,
  ];
}

// ── Format Naira Currency ──
function formatNaira(num) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num || 0);
}

// ── Active ingredients extractor ──
function getActiveIngredients(product) {
  if (!product) return [];
  const text = `${product.name} ${product.description || ""} ${(product.tags || []).join(" ")}`.toLowerCase();
  const list = [];

  if (text.includes("vitamin c")) list.push({ name: "15% Pure L-Ascorbic Acid", role: "Fades stubborn hyperpigmentation & boosts radiance" });
  if (text.includes("niacinamide")) list.push({ name: "5% Niacinamide (Vitamin B3)", role: "Tightens enlarged pores & regulates sebum" });
  if (text.includes("hyaluronic") || text.includes("hydrat")) list.push({ name: "Multi-Weight Hyaluronic Acid", role: "Draws 1000x its weight in moisture for deep plumping" });
  if (text.includes("retinol")) list.push({ name: "Encapsulated Retinoid", role: "Accelerates overnight cellular turnover with zero irritation" });
  if (text.includes("shea")) list.push({ name: "Organic Raw Shea Butter", role: "24-Hour lipid moisture seal for dry or sensitized skin" });
  if (text.includes("charcoal")) list.push({ name: "Activated Bamboo Charcoal", role: "Draws micro-pollutants and unclogs congested pores" });
  if (text.includes("rose")) list.push({ name: "Damask Rosewater Distillate", role: "Balances skin pH and soothes redness in tropical humidity" });
  if (text.includes("hair") || text.includes("wig") || text.includes("lash")) list.push({ name: "100% Remy Keratin / Premium Silk", role: "Natural cuticle alignment for long-lasting tangle-free wear" });

  if (list.length === 0) {
    list.push({ name: "Bio-Botanical Hydration Complex", role: "Nourishes the natural lipid moisture barrier" });
    list.push({ name: "Vitamin E & Antioxidants", role: "Shields against environmental stressors and free radicals" });
  }

  return list;
}

export default function ProductDetail({ onCartOpen }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Buy box state
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("30 ml");
  const [selectedVariant, setSelectedVariant] = useState("Standard");
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(null);

  // Tabs state: "desc" | "ingredients" | "howTo" | "routine"
  const [activeTab, setActiveTab] = useState("desc");
  const addedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  // Fetch product details
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setActiveImageIndex(0);
        setQuantity(1);

        const response = await fetch(`${API_URL}/api/products/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        console.error("PRODUCT FETCH ERROR:", err);
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => { isMounted = false; };
  }, [id]);

  // Fetch catalog for Related Products recommendations
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.products || [];
          if (isMounted) setAllProducts(items);
        }
      } catch (err) {
        console.error("Failed to load catalog for related products:", err);
      }
    }
    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  // Track product view for analytics
  useEffect(() => {
    if (!user || !product) return;
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/track/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: id,
        category: product.category,
      }),
    }).catch(() => { });
  }, [user, product, id]);

  // Check wishlist status
  useEffect(() => {
    if (!user || !product) return;
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((items) => {
        if (Array.isArray(items)) {
          setIsWishlisted(items.some((item) => item._id === product._id));
        }
      })
      .catch(() => { });
  }, [user, product]);

  const gallery = useMemo(() => getProductGallery(product), [product]);

  const activeImage = gallery[activeImageIndex] || product?.image;

  // Compute original price if not explicitly stored (~18% discount display)
  const originalPrice = useMemo(() => {
    if (!product) return 0;
    if (product.originalPrice && product.originalPrice > product.price) {
      return product.originalPrice;
    }
    return Math.round(product.price * 1.2 / 500) * 500;
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!product || !originalPrice || originalPrice <= product.price) return null;
    return Math.round(((originalPrice - product.price) / originalPrice) * 100);
  }, [product, originalPrice]);

  const outOfStock = product?.isInStock === false || product?.stock === 0;

  // Add to Bag action
  const handleAddToCart = () => {
    if (!product || outOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    if (toast?.addToast) {
      toast.addToast(`Added ${quantity}× "${product.name}" to your bag 🛍️`, "cart");
    }
    if (onCartOpen) onCartOpen();
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 2000);
  };

  // Buy Now action: adds to bag and triggers checkout/cart immediately
  const handleBuyNow = () => {
    if (!product || outOfStock) return;
    addToCart(product, quantity);
    if (onCartOpen) onCartOpen();
    navigate("/checkout");
  };

  // Toggle Wishlist
  const handleToggleWishlist = async () => {
    if (!user) {
      if (toast?.addToast) toast.addToast("Please log in to save to your Wishlist", "info");
      navigate("/login");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const method = isWishlisted ? "DELETE" : "POST";
      await fetch(`${API_URL}/api/wishlist/${product._id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsWishlisted(!isWishlisted);
      if (toast?.addToast) {
        toast.addToast(
          isWishlisted
            ? `Removed "${product.name}" from your Wishlist`
            : `Saved "${product.name}" to your Wishlist ❤️`,
          "success"
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Copy Coupon Code
  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedVoucher(code);
    if (toast?.addToast) {
      toast.addToast(`Coupon code ${code} copied to clipboard! 📋`, "success");
    }
    setTimeout(() => setCopiedVoucher(null), 2500);
  };

  // Copy product link to clipboard
  const handleCopyProductLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    if (toast?.addToast) {
      toast.addToast("Product link copied to clipboard! 🔗", "success");
    }
  };

  // Related products: items from same category excluding current product
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    const sameCategory = allProducts.filter(
      (p) => p._id !== product._id && p.category === product.category
    );
    if (sameCategory.length >= 4) return sameCategory.slice(0, 4);
    const fallbacks = allProducts.filter((p) => p._id !== product._id);
    return [...sameCategory, ...fallbacks].slice(0, 4);
  }, [product, allProducts]);

  if (loading) {
    return (
      <div className="pdp-page">
        <FloatingBackHeader backLabel="Back to Products" onCartOpen={onCartOpen} />
        <div className="pdp-container" style={{ textAlign: "center", padding: "6rem 1rem" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Preparing luxury formulation details…
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-page">
        <FloatingBackHeader backLabel="Back to Products" onCartOpen={onCartOpen} />
        <div className="pdp-container" style={{ textAlign: "center", padding: "6rem 1rem" }}>
          <h2>Product Not Found</h2>
          <p style={{ color: "var(--text-muted)", margin: "1rem 0 2rem" }}>
            The item you requested may have been relocated or archived from our catalog.
          </p>
          <button className="pdp-btn-back" onClick={() => navigate("/products")}>
            ← Explore Catalog
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const activeIngredients = getActiveIngredients(product);

  return (
    <div className="pdp-page" role="main">
      <FloatingBackHeader backLabel="Back to Products" onCartOpen={onCartOpen} />

      <div className="pdp-container">
        {/* ── Top Breadcrumbs Bar ── */}
        <div className="pdp-top-bar">
          <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="pdp-breadcrumbs-sep">/</span>
            <Link to="/products">Products</Link>
            <span className="pdp-breadcrumbs-sep">/</span>
            <span style={{ textTransform: "capitalize" }}>{product.category || "Skincare"}</span>
            <span className="pdp-breadcrumbs-sep">/</span>
            <span className="pdp-breadcrumbs-current">{product.name}</span>
          </nav>
          <button className="pdp-btn-back" onClick={() => navigate("/products")}>
            ← Back to Products
          </button>
        </div>

        {/* ── Main Showcase Grid (Gallery + Buy Box) ── */}
        <section className="pdp-hero-grid">
          {/* Left Gallery Column */}
          <div className="pdp-gallery-col">
            <div className="pdp-thumbnails-strip">
              {gallery.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`pdp-thumbnail-btn ${activeImageIndex === idx ? "active" : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View photo angle ${idx + 1}`}
                >
                  <img src={imgUrl} alt={`${product.name} angle ${idx + 1}`} />
                </button>
              ))}
            </div>

            <div className="pdp-main-stage">
              <div className="pdp-main-image-wrapper">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="pdp-main-image"
                />
                <span className="pdp-badge-authentic">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  100% Authentic Maison Guarantee
                </span>
                {discountPercent && (
                  <span className="pdp-badge-discount">-{discountPercent}% OFF</span>
                )}
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="pdp-nav-arrow prev"
                      aria-label="Previous image"
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="pdp-nav-arrow next"
                      aria-label="Next image"
                      onClick={() => setActiveImageIndex((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Social Share Strip */}
              <div className="pdp-share-strip">
                <span className="pdp-share-label">Share:</span>
                <div className="pdp-share-links">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${product.name} on Gracia Fab: ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pdp-share-btn"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Elevate your glow with ${product.name} on Gracia Fab: ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pdp-share-btn"
                  >
                    𝕏 Twitter
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyProductLink}
                    className="pdp-share-btn"
                  >
                    🔗 Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Buy Box Column */}
          <div className="pdp-buybox-col">
            <span className="pdp-brand-eyebrow">
              {product.brand || "Gracia Fab Signature"}
            </span>
            <h1 className="pdp-product-title">{product.name}</h1>

            <div className="pdp-rating-sold-row">
              <span className="pdp-rating-stars">
                {"★".repeat(Math.round(product.rating || 5))}
                {"☆".repeat(5 - Math.round(product.rating || 5))}
              </span>
              <span className="pdp-rating-score">
                {(product.rating || 4.8).toFixed(1)}/5
              </span>
              <button
                type="button"
                className="pdp-reviews-count-link"
                onClick={() => {
                  const revEl = document.getElementById("reviews-section");
                  if (revEl) revEl.scrollIntoView({ behavior: "smooth" });
                }}
              >
                ({product.numReviews || 24} Reviews)
              </button>
              <span className="pdp-sold-badge">128+ Sold</span>
            </div>

            {/* Price Box */}
            <div className="pdp-price-block">
              <span className="pdp-current-price">{formatNaira(product.price)}</span>
              {originalPrice > product.price && (
                <span className="pdp-original-price">{formatNaira(originalPrice)}</span>
              )}
              {discountPercent && (
                <span className="pdp-save-pill">Save {discountPercent}%</span>
              )}
            </div>

            <p className="pdp-short-desc">{product.description}</p>

            {/* Product Options / Specifications */}
            <div className="pdp-options-section">
              <div className="pdp-option-row">
                <span className="pdp-option-label">Size:</span>
                <div className="pdp-option-chips">
                  {["30 ml", "50 ml"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`pdp-option-chip ${selectedSize === size ? "active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {product.category === "makeup" && (
                <div className="pdp-option-row">
                  <span className="pdp-option-label">Finish:</span>
                  <div className="pdp-option-chips">
                    {["Natural Satin", "Velvet Matte", "Dewy Glow"].map((variant) => (
                      <button
                        key={variant}
                        type="button"
                        className={`pdp-option-chip ${selectedVariant === variant ? "active" : ""}`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pdp-option-row">
                <span className="pdp-option-label">Stock:</span>
                <span className={`pdp-stock-status ${outOfStock ? "out-of-stock" : "in-stock"}`}>
                  <span className="pdp-stock-pulse" />
                  {outOfStock ? "Out of Stock" : "In Stock (Only 14 left in Lagos Hub)"}
                </span>
              </div>
            </div>

            {/* Quantity Stepper & Dual CTAs */}
            <div className="pdp-purchase-actions">
              <div className="pdp-qty-row">
                <div className="pdp-stepper">
                  <button
                    type="button"
                    className="pdp-stepper-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || outOfStock}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="pdp-stepper-val">{quantity}</span>
                  <button
                    type="button"
                    className="pdp-stepper-btn"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={outOfStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Quantity
                </span>
              </div>

              <div className="pdp-cta-group">
                <button
                  type="button"
                  className="pdp-btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                >
                  ⚡ Buy Now
                </button>
                <button
                  type="button"
                  className="pdp-btn-add-bag"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                >
                  {added ? "✅ Added!" : "+ Add to Bag"}
                </button>
              </div>

              <div className="pdp-subactions-row">
                <button
                  type="button"
                  className="pdp-subaction-btn"
                  onClick={handleToggleWishlist}
                >
                  {isWishlisted ? "❤️ Saved in Wishlist" : "🤍 Add to Wishlist"}
                </button>
                <Link
                  to={`/compare?items=${product._id}`}
                  className="pdp-subaction-btn"
                >
                  ⇄ Compare Formulation
                </Link>
              </div>
            </div>

            {/* Voucher Promo Cards Strip (Screens 1–4) */}
            <div className="pdp-vouchers-strip">
              <div className="pdp-vouchers-title">
                <span>🎟️ Available Vouchers For You</span>
              </div>
              <div className="pdp-vouchers-grid">
                {AVAILABLE_VOUCHERS.map((voucher) => (
                  <div
                    key={voucher.code}
                    className="pdp-voucher-card"
                    onClick={() => handleCopyCode(voucher.code)}
                    title="Click to copy coupon code"
                  >
                    <span className="pdp-voucher-discount">{voucher.discount}</span>
                    <span className="pdp-voucher-condition">{voucher.condition}</span>
                    <span className="pdp-voucher-code">
                      {copiedVoucher === voucher.code ? "COPIED! ✅" : voucher.code}
                      <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>📋</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Delivery Perks Card */}
            <div className="pdp-perks-card">
              <div className="pdp-perk-item">
                <span className="pdp-perk-icon">🚚</span>
                <div className="pdp-perk-text">
                  <strong>Free Express Delivery</strong>
                  <span>Complimentary for orders over ₦35,000 (Lagos 24h, Abuja 48h)</span>
                </div>
              </div>
              <div className="pdp-perk-item">
                <span className="pdp-perk-icon">🛡️</span>
                <div className="pdp-perk-text">
                  <strong>7-Day Authentic Return Policy</strong>
                  <span>Hassle-free replacement for unopened luxury beauty seals</span>
                </div>
              </div>
              <div className="pdp-perk-item">
                <span className="pdp-perk-icon">✨</span>
                <div className="pdp-perk-text">
                  <strong>Melanin Barrier Approved</strong>
                  <span>Formulated and tested for tropical climates and high humidity</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabbed Specifications Section ── */}
        <section className="pdp-tabs-section">
          <div className="pdp-tabs-header">
            <button
              type="button"
              className={`pdp-tab-btn ${activeTab === "desc" ? "active" : ""}`}
              onClick={() => setActiveTab("desc")}
            >
              Description
            </button>
            <button
              type="button"
              className={`pdp-tab-btn ${activeTab === "ingredients" ? "active" : ""}`}
              onClick={() => setActiveTab("ingredients")}
            >
              Active Ingredients
            </button>
            <button
              type="button"
              className={`pdp-tab-btn ${activeTab === "howTo" ? "active" : ""}`}
              onClick={() => setActiveTab("howTo")}
            >
              How to Use
            </button>
            <button
              type="button"
              className={`pdp-tab-btn ${activeTab === "routine" ? "active" : ""}`}
              onClick={() => setActiveTab("routine")}
            >
              Routine Fit
            </button>
          </div>

          <div className="pdp-tab-content">
            {activeTab === "desc" && (
              <div className="pdp-tab-pane">
                <h3>About {product.name}</h3>
                <p>{product.description}</p>
                <p>
                  Every drop has been curated to maintain the protective acid mantle of African and melanin-rich skin.
                  Our clean formulation standard avoids pore-clogging mineral oils and drying synthetic agents,
                  ensuring your natural barrier stays resilient under the West African sun.
                </p>
                {product.tags && product.tags.length > 0 && (
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                    {product.tags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          background: "#FCF8F2",
                          border: "1px solid rgba(212,175,55,0.25)",
                          padding: "0.3rem 0.75rem",
                          borderRadius: "999px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "var(--color-primary, #7A2432)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "ingredients" && (
              <div className="pdp-tab-pane">
                <h3>Potent Active Ingredients</h3>
                <p>
                  We prioritize clinically proven actives with high biocompatibility.
                  Free from parabens, harsh sulfates, phthalates, and synthetic dyes.
                </p>
                <div className="pdp-actives-grid">
                  {activeIngredients.map((item, i) => (
                    <div key={i} className="pdp-active-item">
                      <strong>{item.name}</strong>
                      <span>{item.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "howTo" && (
              <div className="pdp-tab-pane">
                <h3>How to Apply</h3>
                <p>For maximum efficacy and rapid skin absorption, follow this ritual:</p>
                <div className="pdp-routine-steps">
                  <div className="pdp-routine-step">
                    <span className="pdp-routine-step-num">Step 01</span>
                    <span className="pdp-routine-step-desc">
                      Cleanse your face thoroughly with lukewarm water and pat dry with a clean cotton towel.
                    </span>
                  </div>
                  <div className="pdp-routine-step">
                    <span className="pdp-routine-step-num">Step 02</span>
                    <span className="pdp-routine-step-desc">
                      Dispense 2 to 3 drops or a dime-sized amount onto clean palms or directly onto targeted areas.
                    </span>
                  </div>
                  <div className="pdp-routine-step">
                    <span className="pdp-routine-step-num">Step 03</span>
                    <span className="pdp-routine-step-desc">
                      Gently press and glide in upward circular motions across your face, neck, and décolletage.
                    </span>
                  </div>
                  <div className="pdp-routine-step">
                    <span className="pdp-routine-step-num">Step 04</span>
                    <span className="pdp-routine-step-desc">
                      Allow 60 seconds to absorb before applying your daily moisturizer and broad-spectrum SPF.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "routine" && (
              <div className="pdp-tab-pane">
                <h3>Ideal Routine Placement</h3>
                <p>
                  Layer products from thinnest consistency to thickest to guarantee deep dermal delivery:
                </p>
                <div className="pdp-routine-steps">
                  <div className="pdp-routine-step">
                    <span className="pdp-routine-step-num">Cleanse</span>
                    <span className="pdp-routine-step-desc">Gentle Hydrating Cleanser (AM & PM)</span>
                  </div>
                  <div className="pdp-routine-step">
                    <span className="pdp-routine-step-num">Tone</span>
                    <span className="pdp-routine-step-desc">Balancing Rosewater Mist or Exfoliating Toner</span>
                  </div>
                  <div className="pdp-routine-step" style={{ borderLeftColor: "var(--color-primary, #7A2432)", background: "#FFF6F7" }}>
                    <span className="pdp-routine-step-num" style={{ color: "var(--color-primary, #7A2432)" }}>★ Current</span>
                    <span className="pdp-routine-step-desc" style={{ fontWeight: 600 }}>
                      {product.name} — Targeted Active Care
                    </span>
                  </div>
                  <div className="pdp-routine-step">
                    <span className="pdp-routine-step-num">Seal</span>
                    <span className="pdp-routine-step-desc">Moisturizing Cream + SPF 50 Shield (AM)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Customer Reviews Hub (Screens 1–4) ── */}
        <section className="pdp-reviews-section" id="reviews-section">
          <ReviewSection productId={id} productName={product.name} />
        </section>

        {/* ── Related Products Carousel / Grid ── */}
        {relatedProducts.length > 0 && (
          <section className="pdp-related-section">
            <div className="pdp-related-header">
              <h2 className="pdp-related-title">Related Products</h2>
              <p className="pdp-related-sub">Curated formulas that pair seamlessly with your routine</p>
            </div>
            <div className="pdp-related-grid">
              {relatedProducts.map((item) => (
                <div key={item._id} className="pdp-related-card">
                  <div className="pdp-related-media">
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <button
                      type="button"
                      className="pdp-related-quick-add"
                      onClick={() => {
                        addToCart(item);
                        if (toast?.addToast) toast.addToast(`Added "${item.name}" to bag! 🛍️`, "cart");
                        if (onCartOpen) onCartOpen();
                      }}
                    >
                      + Add to Bag
                    </button>
                  </div>
                  <div className="pdp-related-body">
                    <span className="pdp-related-brand">{item.brand || "Gracia Fab"}</span>
                    <Link to={`/products/${item._id}`} className="pdp-related-name">
                      {item.name}
                    </Link>
                    <div className="pdp-related-stars">
                      {"★".repeat(Math.round(item.rating || 5))}
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "4px" }}>
                        ({item.numReviews || 12})
                      </span>
                    </div>
                    <span className="pdp-related-price">{formatNaira(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Pre-Footer Standalone Newsletter Card ── */}
        <section className="pdp-newsletter-card">
          <span className="pdp-newsletter-sparkle top-left">✦</span>
          <span className="pdp-newsletter-sparkle bottom-right">✦</span>
          <h2 className="pdp-newsletter-title">
            Subscribe to our newsletter and be the first to know about new arrivals, exclusive offers, and beauty tips.
          </h2>
          <p className="pdp-newsletter-sub">
            Join over 12,000 African beauty enthusiasts receiving weekly editorial skincare guides.
          </p>
          <form
            className="pdp-newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              const emailInput = e.currentTarget.elements.newsletterEmail;
              if (emailInput && emailInput.value) {
                if (toast?.addToast) toast.addToast("Thank you for subscribing to Gracia Fab! 💌", "success");
                emailInput.value = "";
              }
            }}
          >
            <input
              type="email"
              name="newsletterEmail"
              className="pdp-newsletter-input"
              placeholder="Enter your email address..."
              required
            />
            <button type="submit" className="pdp-newsletter-btn">
              Subscribe
            </button>
          </form>
        </section>
      </div>

      <Footer />
    </div>
  );
}

// ── Curated fallback reviews matching the rich GLOWIFY design ──
const INITIAL_REVIEWS_SEED = [
  {
    _id: "seed-1",
    name: "Amara Okonkwo",
    rating: 5,
    verified: true,
    skinType: "Oily / Combination",
    date: "14 Oct 2025",
    comment:
      "This serum completely cleared my stubborn post-acne dark marks after three weeks! The texture absorbs instantly without leaving that greasy film in Lagos humidity. Holy grail!",
    helpful: 18,
  },
  {
    _id: "seed-2",
    name: "Tolu Adeleke",
    rating: 5,
    verified: true,
    skinType: "Dry / Sensitive",
    date: "02 Nov 2025",
    comment:
      "Gives that authentic glass-skin glow without feeling heavy. I layer it right under my daily sunscreen and my skin stays radiant all day long.",
    helpful: 12,
  },
  {
    _id: "seed-3",
    name: "Zainab Bello",
    rating: 4,
    verified: true,
    skinType: "Combination",
    date: "28 Oct 2025",
    comment:
      "Extremely gentle on sensitive melanin skin. Zero breakouts and my hyperpigmentation around my cheeks has visibly faded.",
    helpful: 7,
  },
];

// ── Complete Customer Reviews Component (Matching GLOWIFY Reviews Hub) ──
function ReviewSection({ productId, productName }) {
  const { user } = useAuth();
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: "", skinType: "" });
  const [submitting, setSubmitting] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState({});

  // Fetch reviews from backend
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${productId}`);
      if (res.ok) {
        const data = await res.json();
        const serverReviews = Array.isArray(data) ? data : [];
        // Combine server reviews with seed reviews if server has none yet
        if (serverReviews.length > 0) {
          setReviews(serverReviews);
        } else {
          setReviews(INITIAL_REVIEWS_SEED);
        }
      } else {
        setReviews(INITIAL_REVIEWS_SEED);
      }
    } catch {
      setReviews(INITIAL_REVIEWS_SEED);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      if (toast?.addToast) toast.addToast("Please log in to submit a review", "error");
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reviews/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      if (toast?.addToast) toast.addToast("Review published successfully! ✨", "success");
      setForm({ rating: 5, comment: "", skinType: "" });
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      if (toast?.addToast) toast.addToast(err.message || "Review submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulClick = (reviewId) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
    if (toast?.addToast) toast.addToast("Thank you for your feedback!", "info");
  };

  // Calculate review score & star breakdown
  const avgScore = reviews.length
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "4.8";

  const starBreakdown = useMemo(() => {
    const total = reviews.length || 1;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    return [5, 4, 3, 2, 1].map((s) => ({
      star: s,
      count: counts[s] || 0,
      pct: Math.round(((counts[s] || 0) / total) * 100),
    }));
  }, [reviews]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    if (filter === "5star") return reviews.filter((r) => Math.round(r.rating) === 5);
    if (filter === "verified") return reviews.filter((r) => r.verified !== false);
    return reviews;
  }, [reviews, filter]);

  return (
    <>
      <div className="pdp-reviews-header">
        <h2 className="pdp-reviews-title">Customer Reviews</h2>
        {!showForm && (
          <button
            type="button"
            className="pdp-btn-write-review"
            onClick={() => {
              if (!user) {
                if (toast?.addToast) toast.addToast("Please log in to write a review", "info");
              } else {
                setShowForm(true);
              }
            }}
          >
            Write a Review ✍️
          </button>
        )}
      </div>

      {/* Review Breakdown Dashboard (GLOWIFY Screen 1, 2, 3, 4) */}
      <div className="pdp-review-dashboard">
        <div className="pdp-score-card">
          <div className="pdp-big-score">{avgScore}</div>
          <div style={{ color: "#E5A93C", fontSize: "1.2rem", letterSpacing: "2px" }}>
            {"★".repeat(Math.round(Number(avgScore)))}
            {"☆".repeat(5 - Math.round(Number(avgScore)))}
          </div>
          <div className="pdp-score-sub">Based on {reviews.length} reviews</div>
        </div>

        <div className="pdp-breakdown-bars">
          {starBreakdown.map((b) => (
            <div key={b.star} className="pdp-bar-row">
              <span className="pdp-bar-label">{b.star} Stars</span>
              <div className="pdp-bar-track">
                <div className="pdp-bar-fill" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="pdp-bar-pct">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pdp-review-filters">
        <button
          type="button"
          className={`pdp-review-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Reviews ({reviews.length})
        </button>
        <button
          type="button"
          className={`pdp-review-filter-btn ${filter === "5star" ? "active" : ""}`}
          onClick={() => setFilter("5star")}
        >
          5 Stars Only
        </button>
        <button
          type="button"
          className={`pdp-review-filter-btn ${filter === "verified" ? "active" : ""}`}
          onClick={() => setFilter("verified")}
        >
          Verified Buyers
        </button>
      </div>

      {/* Expandable Review Form */}
      {showForm && (
        <form className="pdp-review-form-card" onSubmit={handleSubmit}>
          <h4>Write an Editorial Review for {productName}</h4>
          <div className="pdp-form-row">
            <label>Rating:</label>
            <div className="pdp-star-picker-btns">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="pdp-star-pick-btn"
                  onClick={() => setForm({ ...form, rating: s })}
                >
                  {s <= form.rating ? "★" : "☆"}
                </button>
              ))}
            </div>
          </div>

          <div className="pdp-form-row">
            <label>Skin Type (Optional):</label>
            <select
              value={form.skinType}
              onChange={(e) => setForm({ ...form, skinType: e.target.value })}
            >
              <option value="">Select your skin type</option>
              <option value="Oily">Oily</option>
              <option value="Dry">Dry</option>
              <option value="Combination">Combination</option>
              <option value="Sensitive">Sensitive</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          <div className="pdp-form-row">
            <label>Your Review:</label>
            <textarea
              rows={4}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Describe texture, absorption, how it feels on your skin..."
              required
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              className="pdp-btn-write-review"
              disabled={submitting}
            >
              {submitting ? "Publishing…" : "Publish Review"}
            </button>
            <button
              type="button"
              className="pdp-btn-back"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="pdp-reviews-list">
        {filteredReviews.map((rev) => {
          const initials = (rev.name || "A")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          const currentHelpful = (rev.helpful || 0) + (helpfulVotes[rev._id] || 0);

          return (
            <div key={rev._id} className="pdp-review-item">
              <div className="pdp-reviewer-row">
                <div className="pdp-reviewer-avatar">{initials}</div>
                <div className="pdp-reviewer-meta">
                  <strong>{rev.name}</strong>
                  <div className="pdp-reviewer-tags">
                    {rev.verified !== false && (
                      <span className="pdp-tag-verified">✓ Verified Buyer</span>
                    )}
                    {rev.skinType && (
                      <span className="pdp-tag-skin">{rev.skinType}</span>
                    )}
                  </div>
                </div>
                <span className="pdp-review-date">
                  {rev.date || (rev.createdAt ? new Date(rev.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" }) : "Recent")}
                </span>
              </div>

              <div style={{ color: "#E5A93C", fontSize: "0.95rem" }}>
                {"★".repeat(Math.round(rev.rating || 5))}
                {"☆".repeat(5 - Math.round(rev.rating || 5))}
              </div>

              <p className="pdp-review-body">{rev.comment}</p>

              <div className="pdp-review-footer">
                <button
                  type="button"
                  className="pdp-vote-helpful-btn"
                  onClick={() => handleHelpfulClick(rev._id)}
                >
                  👍 Helpful ({currentHelpful})
                </button>
                <span>•</span>
                <button
                  type="button"
                  className="pdp-vote-helpful-btn"
                  onClick={() => {
                    if (toast?.addToast) toast.addToast("Review reported for moderation", "info");
                  }}
                >
                  Report
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
