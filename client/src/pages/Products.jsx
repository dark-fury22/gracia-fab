import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "../styles/Products.css";
import API_URL from "../config";
import SmartSearch from "../components/SmartSearch";
import WishlistButton from "../components/WishlistButton";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";

// ── MAISON PRODUCT CATALOG WITH SIZES & SHADE SWATCHES (YSL Benchmark) ──
const MAISON_PRODUCTS = [
  // WIGS & RAW HAIR
  {
    _id: "prod-taylor-wave",
    name: "Taylor Wave Raw Frontal Unit",
    category: "wig",
    subCategory: "Body Wave",
    tags: ["HD Lace", "100% Raw Hair", "Glueless Ready"],
    rating: 4.9,
    reviewsCount: 42,
    badge: "BEST SELLER",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop&crop=face",
    sizes: [
      { label: "24 Inch — Standard", price: 295000 },
      { label: "28 Inch — Luxe Length", price: 340000 },
      { label: "30 Inch — Floor Sweep", price: 385000 },
    ],
    shades: [
      { name: "Natural Black #1B", color: "#1B1718" },
      { name: "Rich Dark Brown #2", color: "#3B261D" },
      { name: "Warm Chestnut #4", color: "#59382B" },
    ],
  },
  {
    _id: "prod-jett-clean",
    name: "Jett Clean 12A+ Bone Straight",
    category: "wig",
    subCategory: "Bone Straight",
    tags: ["100% Raw Hair", "Bleached Knots", "Beginner-Friendly"],
    rating: 5.0,
    reviewsCount: 88,
    badge: "EXCLUSIVE",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&h=750&fit=crop&crop=face",
    sizes: [
      { label: "26 Inch — Gloss", price: 310000 },
      { label: "30 Inch — Dramatic", price: 360000 },
      { label: "34 Inch — Ultra Long", price: 410000 },
    ],
    shades: [
      { name: "Natural Black #1B", color: "#181415" },
      { name: "Jet Black #1", color: "#0B090A" },
    ],
  },
  {
    _id: "prod-ruby-star",
    name: "Ruby Star Crimson Wave Unit",
    category: "wig",
    subCategory: "Colorways",
    tags: ["HD Lace", "Pre-Plucked", "100% Raw Hair"],
    rating: 4.9,
    reviewsCount: 39,
    badge: "LIMITED EDITION",
    image: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=600&h=750&fit=crop&crop=face",
    sizes: [
      { label: "24 Inch", price: 330000 },
      { label: "28 Inch", price: 375000 },
    ],
    shades: [
      { name: "Deep Ruby Wine", color: "#5C1523" },
      { name: "Vibrant Burgundy", color: "#7A1C2E" },
    ],
  },
  {
    _id: "prod-sedra-bob",
    name: "Sedra Blunt Cut HD Bob",
    category: "wig",
    subCategory: "Bobs",
    tags: ["HD Lace", "Glueless Ready", "Pre-Plucked"],
    rating: 4.8,
    reviewsCount: 63,
    badge: "ALLURE CHOICE",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=750&fit=crop&crop=face",
    sizes: [
      { label: "12 Inch — Jawline", price: 240000 },
      { label: "14 Inch — Collarbone", price: 265000 },
    ],
    shades: [
      { name: "Natural Black #1B", color: "#1B1718" },
      { name: "Honey Caramel Balayage", color: "#A87146" },
    ],
  },

  // SKINCARE (YSL Sample 2)
  {
    _id: "skin-barrier-restorative",
    name: "Pure Shots Barrier Restorative Cream",
    category: "skincare",
    subCategory: "Moisturizer",
    tags: ["Triple Ceramides", "Melanin Safe", "Clinical Glow"],
    rating: 5.0,
    reviewsCount: 114,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=750&fit=crop&crop=center",
    sizes: [
      { label: "50ml / 1.7 fl oz", price: 36000 },
      { label: "100ml / 3.4 fl oz (Vault Size)", price: 58000 },
    ],
  },
  {
    _id: "skin-niacinamide-serum",
    name: "Night Reboot Niacinamide Glow Serum",
    category: "skincare",
    subCategory: "Serum",
    tags: ["Pore Tightening", "Oil Balancing"],
    rating: 4.9,
    reviewsCount: 78,
    badge: "BEST SELLER",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=750&fit=crop&crop=center",
    sizes: [
      { label: "30ml / 1.0 fl oz", price: 28000 },
      { label: "50ml / 1.7 fl oz", price: 42000 },
    ],
  },
  {
    _id: "skin-invisible-spf50",
    name: "Invisible UV Shield SPF 50+ Fluid",
    category: "skincare",
    subCategory: "Sunscreen",
    tags: ["Zero White Cast", "Broad Spectrum"],
    rating: 5.0,
    reviewsCount: 230,
    badge: "MUST HAVE",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=750&fit=crop&crop=center",
    sizes: [{ label: "60ml / 2.0 fl oz", price: 32000 }],
  },
  {
    _id: "skin-rose-cleanse",
    name: "Pure Petal Clarifying Cream Cleanser",
    category: "skincare",
    subCategory: "Cleanser",
    tags: ["Sulfate-Free", "Gentle Barrier"],
    rating: 4.8,
    reviewsCount: 52,
    badge: null,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=750&fit=crop&crop=center",
    sizes: [{ label: "150ml / 5.1 fl oz", price: 24000 }],
  },

  // MAKEUP & COMPLEXION (YSL Sample 3)
  {
    _id: "makeup-all-hours-cushion",
    name: "All Hours Melanin Radiance Cushion",
    category: "makeup",
    subCategory: "Face",
    tags: ["Luminous Matte", "Transfer-Proof", "SPF 25"],
    rating: 5.0,
    reviewsCount: 165,
    badge: "EXCLUSIVE",
    image: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=600&h=750&fit=crop&crop=face",
    sizes: [{ label: "Compact 15g + Refill", price: 45000 }],
    shades: [
      { name: "BD65 Warm Cocoa", color: "#543324" },
      { name: "BR70 Deep Espresso", color: "#3D2319" },
      { name: "BD75 Rich Ebony", color: "#2E1B15" },
      { name: "B60 Golden Caramel", color: "#7B4D33" },
      { name: "B50 Honey Amber", color: "#9B6442" },
    ],
  },
  {
    _id: "makeup-velvet-lip-glaze",
    name: "Rouge Pur Couture Velvet Lip Glaze",
    category: "makeup",
    subCategory: "Lip",
    tags: ["Hyaluronic Plump", "Satin Shine"],
    rating: 4.9,
    reviewsCount: 92,
    badge: "STAFF PICK",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=750&fit=crop&crop=face",
    sizes: [{ label: "Full Size 6ml", price: 26000 }],
    shades: [
      { name: "Nude Audacious", color: "#8E5148" },
      { name: "Berry Seduction", color: "#6A1A2E" },
      { name: "Lagos Siren Red", color: "#8F1823" },
      { name: "Glazed Toffee", color: "#9E604A" },
    ],
  },
  {
    _id: "makeup-all-over-bronzer",
    name: "All-Over Sunlit Melanin Bronzer",
    category: "makeup",
    subCategory: "Cheek",
    tags: ["Non-Ashy", "Warm Terracotta Glow"],
    rating: 4.8,
    reviewsCount: 44,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop&crop=face",
    sizes: [{ label: "Luxury Palette 10g", price: 38000 }],
    shades: [
      { name: "Golden Sunset", color: "#8A5432" },
      { name: "Deep Sahara", color: "#5F341E" },
    ],
  },
  {
    _id: "makeup-lash-clash-volume",
    name: "Lash Clash Extreme Volume Mascara",
    category: "makeup",
    subCategory: "Eye",
    tags: ["24H Wear", "Smudge-Proof"],
    rating: 4.9,
    reviewsCount: 138,
    badge: "BEST SELLER",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=750&fit=crop&crop=face",
    sizes: [{ label: "Full Size 9ml", price: 24000 }],
    shades: [
      { name: "Over Noir #1", color: "#0A0A0A" },
      { name: "Deep Navy #2", color: "#16203B" },
    ],
  },

  // GIFT SETS & LUXURY VAULTS (YSL Sample 1)
  {
    _id: "set-raw-hair-vault",
    name: "The Grand Empress Raw Hair Vault",
    category: "gift-sets",
    subCategory: "Vault Collection",
    tags: ["Full Wig + 3 Bundles + HD Frontal", "Lagos Certified"],
    rating: 5.0,
    reviewsCount: 27,
    badge: "VIP EXCLUSIVE",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop&crop=face",
    sizes: [
      { label: "Complete 4-Piece Vault", price: 540000 },
    ],
  },
  {
    _id: "set-bridal-glow-trousseau",
    name: "Bespoke Bridal Radiance Gift Set",
    category: "gift-sets",
    subCategory: "Bridal Set",
    tags: ["Lace Melt Unit + 4-Step Skincare", "Signature Velvet Box"],
    rating: 5.0,
    reviewsCount: 33,
    badge: "LUXURY GIFT",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=750&fit=crop&crop=face",
    sizes: [
      { label: "Bridal Trousseau Box", price: 420000 },
    ],
  },
  {
    _id: "set-pure-shots-trio",
    name: "Pure Shots Clinical Skincare Discovery Trio",
    category: "gift-sets",
    subCategory: "Skincare Set",
    tags: ["Serum + Cream + Essence", "Complimentary Pouch"],
    rating: 4.9,
    reviewsCount: 65,
    badge: "STAFF PICK",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=750&fit=crop&crop=center",
    sizes: [
      { label: "3 x Travel Deluxe 30ml", price: 78000 },
    ],
  },

  // FRAGRANCE & HAIR MISTS (YSL Sample 4)
  {
    _id: "fragrance-oud-silk-mist",
    name: "Black Opium Silk Hair Perfume Mist",
    category: "fragrance",
    subCategory: "Hair Mist",
    tags: ["Argan Oil Infused", "UV Protection"],
    rating: 5.0,
    reviewsCount: 84,
    badge: "NEW DROP",
    image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=600&h=750&fit=crop&crop=face",
    sizes: [
      { label: "50ml Spray", price: 38000 },
      { label: "100ml Deluxe Flacon", price: 58000 },
    ],
  },
  {
    _id: "fragrance-rose-amber-extrait",
    name: "L'Ambre Noir Eau de Parfum",
    category: "fragrance",
    subCategory: "Fine Fragrance",
    tags: ["Warm Bourbon Vanilla", "Precious Amber"],
    rating: 4.9,
    reviewsCount: 112,
    badge: "ICONIC",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=750&fit=crop&crop=face",
    sizes: [
      { label: "50ml Eau de Parfum", price: 65000 },
      { label: "100ml Eau de Parfum", price: 95000 },
    ],
  },
];

// ── MAISON CATEGORY TABS MATCHING YSL BENCHMARK ──
const MAISON_TABS = [
  { id: "all", label: "ALL COLLECTIONS" },
  { id: "wig", label: "HAIRSTYLES & RAW WIGS" },
  { id: "skincare", label: "SKINCARE" },
  { id: "makeup", label: "MAKEUP & COMPLEXION" },
  { id: "gift-sets", label: "GIFT SETS & VAULTS" },
  { id: "fragrance", label: "HAIR MISTS & SCENTS" },
];

// ── "YOU MAY ALSO LIKE" RECOMMENDATIONS CAROUSEL (YSL Standard) ──
const CROSS_SELL_RECOMMENDATIONS = [
  {
    _id: "cross-lash-clash",
    name: "Lash Clash Extreme Volume Mascara",
    category: "Makeup",
    price: 24000,
    badge: "HOT PICK",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=600&fit=crop&crop=face",
    shades: [
      { name: "Over Noir", color: "#0D0D0D" },
      { name: "Deep Navy", color: "#17233B" },
      { name: "Emerald Glaze", color: "#143D2A" },
    ],
  },
  {
    _id: "cross-ambre-noir",
    name: "L'Ambre Noir Eau de Parfum 50ml",
    category: "Fragrance",
    price: 65000,
    badge: "BEST SELLER",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop&crop=face",
    sizes: [{ label: "50ml Eau de Parfum", price: 65000 }, { label: "100ml Deluxe", price: 95000 }],
  },
  {
    _id: "cross-pure-shots",
    name: "Night Reboot Niacinamide Serum",
    category: "Skincare",
    price: 28000,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=600&fit=crop&crop=center",
    sizes: [{ label: "30ml Bottle", price: 28000 }, { label: "50ml Bottle", price: 42000 }],
  },
  {
    _id: "cross-taylor-30",
    name: "Taylor Wave 12A+ Raw 30\" Unit",
    category: "Wig",
    price: 385000,
    badge: "VIP EDITORIAL",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=600&fit=crop&crop=face",
    sizes: [{ label: "30 Inch HD Frontal", price: 385000 }],
  },
];

function Products() {
  const [activeTab, setActiveTab] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [smartResults, setSmartResults] = useState(null);
  const [smartQuery, setSmartQuery] = useState("");
  const [isSmartMode, setIsSmartMode] = useState(false);

  // Selected variant state: { [productId]: { sizeIdx: number, shadeIdx: number } }
  const [selectedVariants, setSelectedVariants] = useState({});

  const { addToCart } = useCart();
  const { addToast } = useToast();

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const getCardPrice = (product) => {
    const variant = selectedVariants[product._id];
    if (product.sizes && product.sizes.length > 0) {
      const idx = variant?.sizeIdx || 0;
      return product.sizes[idx]?.price || product.price;
    }
    return product.price;
  };

  const handleSizeChange = (productId, sizeIdx) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), sizeIdx },
    }));
  };

  const handleShadeSelect = (productId, shadeIdx) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), shadeIdx },
    }));
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const variant = selectedVariants[product._id];
    const selectedSize = product.sizes ? product.sizes[variant?.sizeIdx || 0] : null;
    const selectedShade = product.shades ? product.shades[variant?.shadeIdx || 0] : null;

    const cartItem = {
      ...product,
      price: selectedSize ? selectedSize.price : product.price,
      selectedVariant: [selectedSize?.label, selectedShade?.name].filter(Boolean).join(" · "),
    };

    addToCart(cartItem);
    addToast(`Added ${product.name} to your bag 🛍️`, "success");
  };

  // Filter pipeline
  const displayedProducts = useMemo(() => {
    let list = [...MAISON_PRODUCTS];

    if (activeTab !== "all") {
      list = list.filter((p) => p.category === activeTab);
    }

    if (subFilter !== "all") {
      list = list.filter((p) => p.subCategory?.toLowerCase() === subFilter.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subCategory?.toLowerCase().includes(q)
      );
    }

    if (sort === "price_asc") list.sort((a, b) => getCardPrice(a) - getCardPrice(b));
    if (sort === "price_desc") list.sort((a, b) => getCardPrice(b) - getCardPrice(a));
    if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [activeTab, subFilter, search, sort, selectedVariants]);

  return (
    <div className="maison-catalog-page">
      {/* ── 1. Spotlight Hero Banner (Sample 5 - Black Opium Style) ── */}
      <section className="maison-spotlight-hero">
        <div className="maison-spotlight-inner">
          <span className="spotlight-tag">EXCLUSIVE MAISON LAUNCH</span>
          <h1 className="spotlight-title">
            THE RAW SILK &amp; BERRY GLOW VAULT
          </h1>
          <p className="spotlight-desc">
            Discover our haute-parfumerie hair mists, 12A+ single-donor raw tresses, and clinical melanin actives in an uncompromised luxury presentation.
          </p>
          <div className="spotlight-actions">
            <button
              className="btn-spotlight-primary"
              onClick={() => setActiveTab("wig")}
            >
              Explore Raw Wigs →
            </button>
            <button
              className="btn-spotlight-outline"
              onClick={() => setActiveTab("skincare")}
            >
              Shop Clinical Skincare
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Maison Category Navigation Bar (YSL Top Tabs) ── */}
      <nav className="maison-tabs-bar">
        <div className="maison-tabs-container">
          {MAISON_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`maison-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSubFilter("all");
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── 3. Sub-Category Pills & Toolbar ── */}
      <section className="maison-toolbar-section">
        <div className="maison-toolbar-container">
          <div className="maison-sub-pills">
            <button
              className={`sub-pill ${subFilter === "all" ? "active" : ""}`}
              onClick={() => setSubFilter("all")}
            >
              All Items
            </button>
            {activeTab === "wig" && (
              <>
                <button className={`sub-pill ${subFilter === "Bone Straight" ? "active" : ""}`} onClick={() => setSubFilter("Bone Straight")}>Bone Straight</button>
                <button className={`sub-pill ${subFilter === "Body Wave" ? "active" : ""}`} onClick={() => setSubFilter("Body Wave")}>Body Wave</button>
                <button className={`sub-pill ${subFilter === "Bobs" ? "active" : ""}`} onClick={() => setSubFilter("Bobs")}>Bobs &amp; Fringe</button>
                <button className={`sub-pill ${subFilter === "Colorways" ? "active" : ""}`} onClick={() => setSubFilter("Colorways")}>Colorways</button>
              </>
            )}
            {activeTab === "skincare" && (
              <>
                <button className={`sub-pill ${subFilter === "Moisturizer" ? "active" : ""}`} onClick={() => setSubFilter("Moisturizer")}>Moisturizers</button>
                <button className={`sub-pill ${subFilter === "Serum" ? "active" : ""}`} onClick={() => setSubFilter("Serum")}>Serums</button>
                <button className={`sub-pill ${subFilter === "Sunscreen" ? "active" : ""}`} onClick={() => setSubFilter("Sunscreen")}>Sun Care SPF 50+</button>
              </>
            )}
            {activeTab === "makeup" && (
              <>
                <button className={`sub-pill ${subFilter === "Face" ? "active" : ""}`} onClick={() => setSubFilter("Face")}>Complexion &amp; Cushion</button>
                <button className={`sub-pill ${subFilter === "Lip" ? "active" : ""}`} onClick={() => setSubFilter("Lip")}>Lip Glaze</button>
                <button className={`sub-pill ${subFilter === "Cheek" ? "active" : ""}`} onClick={() => setSubFilter("Cheek")}>Bronzer &amp; Glow</button>
              </>
            )}
          </div>

          <div className="maison-toolbar-right">
            <span className="maison-count-label">
              <strong>{displayedProducts.length}</strong> Products Found
            </span>

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

      {/* ── 4. 4-Column Luxury Grid with Sizes, Shade Swatches & In-Grid Editorial Card ── */}
      <section className="maison-grid-section">
        <div className="maison-grid-container">
          {displayedProducts.map((product, index) => {
            const variant = selectedVariants[product._id] || { sizeIdx: 0, shadeIdx: 0 };
            const currentPrice = getCardPrice(product);

            return (
              <div key={product._id} className="maison-product-card">
                {/* Image Container with Wishlist */}
                <div className="maison-card-media">
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="maison-card-img"
                    />
                  </Link>

                  {product.badge && (
                    <span className="maison-card-badge">{product.badge}</span>
                  )}

                  <div className="maison-card-wishlist">
                    <WishlistButton productId={product._id} />
                  </div>
                </div>

                {/* Information Block */}
                <div className="maison-card-info">
                  <Link to={`/products/${product._id}`} className="maison-card-title-link">
                    <h3 className="maison-card-title">{product.name}</h3>
                  </Link>

                  {/* Optional Shade Swatch Dots (Sample 3) */}
                  {product.shades && product.shades.length > 0 && (
                    <div className="maison-shade-swatches">
                      <span className="swatch-label">
                        {product.shades[variant.shadeIdx]?.name || "Select Shade"}
                      </span>
                      <div className="swatch-dots-row">
                        {product.shades.map((shade, sIdx) => (
                          <button
                            key={shade.name}
                            type="button"
                            className={`swatch-circle ${variant.shadeIdx === sIdx ? "active" : ""}`}
                            style={{ backgroundColor: shade.color }}
                            title={shade.name}
                            onClick={() => handleShadeSelect(product._id, sIdx)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size / Length Dropdown Selector (Sample 1, 2, 4) */}
                  {product.sizes && product.sizes.length > 1 ? (
                    <div className="maison-size-selector">
                      <select
                        value={variant.sizeIdx}
                        onChange={(e) => handleSizeChange(product._id, Number(e.target.value))}
                        className="maison-dropdown-select"
                      >
                        {product.sizes.map((s, idx) => (
                          <option key={s.label} value={idx}>
                            {s.label} — {formatPrice(s.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : product.sizes && product.sizes.length === 1 ? (
                    <span className="maison-single-size-label">
                      {product.sizes[0].label}
                    </span>
                  ) : null}

                  {/* Price */}
                  <div className="maison-card-price-row">
                    <span className="maison-card-price">{formatPrice(currentPrice)}</span>
                  </div>

                  {/* High-Contrast Solid Black ADD TO BAG Button (YSL Standard) */}
                  <button
                    className="btn-maison-add-to-bag"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    ADD TO BAG
                  </button>
                </div>
              </div>
            );
          })}

          {/* In-Grid Portrait Editorial Reel Card (YSL Fragrance/Gift Sets Sample) */}
          <div className="maison-ingrid-editorial-card">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&h=950&fit=crop&crop=face"
              alt="L'Atelier Gracia Fab"
              className="ingrid-bg-img"
            />
            <div className="ingrid-overlay">
              <span className="ingrid-eyebrow">L'ATELIER GRACIA FAB</span>
              <h3 className="ingrid-title">The Single-Donor Raw Hair Masterclass</h3>
              <div className="ingrid-play-icon">▶</div>
              <Link to="/about" className="ingrid-cta-link">
                DISCOVER THE CRAFTSMANSHIP →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. "YOU MAY ALSO LIKE" Cross-Sell Carousel (YSL Standard) ── */}
      <section className="maison-cross-sell-section">
        <div className="maison-cross-sell-container">
          <h2 className="maison-cross-sell-heading">YOU MAY ALSO LIKE</h2>

          <div className="maison-cross-sell-grid">
            {CROSS_SELL_RECOMMENDATIONS.map((item) => (
              <div key={item._id} className="cross-sell-card">
                <div className="cross-sell-media">
                  <img src={item.image} alt={item.name} />
                  {item.badge && <span className="cross-sell-badge">{item.badge}</span>}
                </div>

                <div className="cross-sell-info">
                  <h4 className="cross-sell-title">{item.name}</h4>

                  {item.shades && (
                    <div className="cross-sell-swatches">
                      {item.shades.map((s) => (
                        <span
                          key={s.name}
                          className="mini-swatch"
                          style={{ backgroundColor: s.color }}
                          title={s.name}
                        />
                      ))}
                    </div>
                  )}

                  <span className="cross-sell-price">{formatPrice(item.price)}</span>

                  <button
                    className="btn-cross-sell-add"
                    onClick={(e) => handleAddToCart(e, item)}
                  >
                    ADD TO BAG
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. "ONLINE EXCLUSIVES" 4-Card Luxury Services Grid (Sample 5) ── */}
      <section className="maison-online-exclusives">
        <div className="maison-exclusives-container">
          <h2 className="maison-exclusives-heading">ONLINE EXCLUSIVES</h2>

          <div className="maison-exclusives-grid">
            <div className="exclusive-feature-card">
              <div className="exclusive-media-frame">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"
                  alt="VIP Glow Club"
                />
              </div>
              <h4>VIP GLOW CLUB</h4>
              <p>Earn Streak Stars, unlock private sales, and receive luxury anniversary gifts.</p>
              <Link to="/dashboard" className="exclusive-card-link">LEARN MORE</Link>
            </div>

            <div className="exclusive-feature-card">
              <div className="exclusive-media-frame">
                <img
                  src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face"
                  alt="Virtual Try-On"
                />
              </div>
              <h4>VIRTUAL TRY-ON</h4>
              <p>Real-time AI skin tone detector and HD lace melting simulator for your phone.</p>
              <Link to="/skin-tone" className="exclusive-card-link">TRY IT NOW</Link>
            </div>

            <div className="exclusive-feature-card">
              <div className="exclusive-media-frame">
                <img
                  src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop&crop=face"
                  alt="Product Advisor"
                />
              </div>
              <h4>PRODUCT ADVISOR</h4>
              <p>Discover the precise raw texture or clinical skincare regimen for your needs.</p>
              <Link to="/recommend" className="exclusive-card-link">GET MATCHED</Link>
            </div>

            <div className="exclusive-feature-card">
              <div className="exclusive-media-frame">
                <img
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop&crop=face"
                  alt="The Art of Gifting"
                />
              </div>
              <h4>THE ART OF GIFTING</h4>
              <p>Enjoy complimentary black &amp; gold velvet packaging with personalized calligraphy cards.</p>
              <Link to="/services" className="exclusive-card-link">SHOP GIFTS</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SmartSearch AI Modal ── */}
      <SmartSearch
        isOpen={showSmartSearch}
        onClose={() => setShowSmartSearch(false)}
        onResults={(results, query) => {
          setSmartResults(results);
          setSmartQuery(query);
          setIsSmartMode(true);
        }}
      />
    </div>
  );
}

export default Products;
