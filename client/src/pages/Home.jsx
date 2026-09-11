import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import "../styles/YslHome.css";

// ── Sample 5 Benchmark Products ──
const SIGNATURE_COLLECTION = [
  {
    id: "bo-over-red",
    name: "Black Opium Over Red",
    subtitle: "Eau de Parfum",
    desc: "A juicy cherry accord colliding with iconic black coffee and white floral bouquet.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=85",
    prices: { "30ML": 115000, "50ML": 145000, "90ML": 185000 },
    badge: "BESTSELLER",
    rating: "4.9 (428)",
  },
  {
    id: "bo-illicit-green",
    name: "Black Opium Illicit Green",
    subtitle: "Eau de Parfum",
    desc: "Zesty green mandarin, sparkling fig accord and bold dark coffee energy.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85",
    prices: { "30ML": 110000, "50ML": 138000, "90ML": 178000 },
    badge: "ICONIC",
    rating: "4.8 (312)",
  },
  {
    id: "bo-le-parfum",
    name: "Black Opium Le Parfum",
    subtitle: "Warm Vanilla Eau de Parfum",
    desc: "An ultra-intense quartet of Madagascan vanillas merged with couture dark coffee.",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=85",
    prices: { "30ML": 125000, "50ML": 162000, "90ML": 210000 },
    badge: "EXCLUSIVE",
    rating: "5.0 (589)",
  },
  {
    id: "bo-pink-glaze",
    name: "Black Opium Pink Glaze",
    subtitle: "The New Fragrance",
    desc: "Irresistible glazed wild strawberry accord over sensual white florals and coffee.",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&auto=format&fit=crop&q=85",
    prices: { "30ML": 120000, "50ML": 155000, "90ML": 195000 },
    badge: "NEW",
    rating: "4.9 (184)",
  },
];

const ONLINE_EXCLUSIVES = [
  {
    title: "GRACIA FAB CLUB",
    desc: "Exclusive loyalty privileges, private vault pre-launches & luxury birthday gift boxes.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=85",
    linkText: "JOIN NOW",
    linkUrl: "/register",
  },
  {
    title: "VIRTUAL TRY ON",
    desc: "Experience lip shades, complexion tints and wig lengths live with our AI camera detector.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=85",
    linkText: "TRY LIVE",
    linkUrl: "/skin-tone",
  },
  {
    title: "PRODUCT ADVISOR",
    desc: "Personalized diagnostic matching your skin undertone, scalp health and climatic needs.",
    image: "https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?w=600&auto=format&fit=crop&q=85",
    linkText: "START DIAGNOSTIC",
    linkUrl: "/recommend",
  },
  {
    title: "THE ART OF GIFTING",
    desc: "Complimentary bespoke black & gold lacquer wrapping with personalized handwritten notes.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=85",
    linkText: "EXPLORE GIFTING",
    linkUrl: "/products?category=giftset",
  },
];

const SOCIAL_POSTS = [
  {
    id: 1,
    handle: "@graciafab",
    location: "Victoria Island, Lagos",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=85",
    tag: "#BlackOpiumPinkGlaze",
  },
  {
    id: 2,
    handle: "@amina.couture",
    location: "Abuja, Nigeria",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=85",
    tag: "#GraciaFabGlow",
  },
  {
    id: 3,
    handle: "@chidinma_glam",
    location: "Lekki Phase 1",
    image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&auto=format&fit=crop&q=85",
    tag: "#HauteBeautyLagos",
  },
  {
    id: 4,
    handle: "@zainab.atelier",
    location: "London · Lagos",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=85",
    tag: "#RawHairMaison",
  },
];

function Home({ onCartOpen }) {
  const { addToCart } = useCart();

  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({
    "bo-over-red": "50ML",
    "bo-illicit-green": "50ML",
    "bo-le-parfum": "50ML",
    "bo-pink-glaze": "50ML",
  });
  const [wishlistState, setWishlistState] = useState({});
  const [socialIndex, setSocialIndex] = useState(0);

  const overviewRef = useRef(null);
  const productRangeRef = useRef(null);
  const discoverMoreRef = useRef(null);
  const reviewsRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSizeChange = (prodId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [prodId]: size }));
  };

  const toggleWishlist = (prodId) => {
    setWishlistState((prev) => ({ ...prev, [prodId]: !prev[prodId] }));
  };

  const handleAddToCart = (item) => {
    const size = selectedSizes[item.id] || "50ML";
    const price = item.prices[size] || item.prices["50ML"];
    addToCart({
      _id: `${item.id}-${size}`,
      name: `${item.name} (${size})`,
      price,
      image: item.image,
      category: "fragrance",
    });
    if (onCartOpen) onCartOpen();
  };

  const nextSocial = () => {
    setSocialIndex((prev) => (prev + 1) % SOCIAL_POSTS.length);
  };

  const prevSocial = () => {
    setSocialIndex((prev) => (prev - 1 + SOCIAL_POSTS.length) % SOCIAL_POSTS.length);
  };

  return (
    <div className="ysl-home-page">
      <SEO
        title="Black Opium Pink Glaze — Haute Parfumerie & Luxury Beauty"
        description="Discover Gracia Fab's Black Opium Pink Glaze and Haute Parfumerie collection. Glazed wild strawberry accord, dark coffee sillage, raw virgin wigs and clinical melanin skincare."
        keywords="Black Opium Pink Glaze, YSL beauty Nigeria, luxury perfumes Lagos, raw virgin hair, melanin skincare Nigeria"
        url="/"
      />

      <Navbar onCartOpen={onCartOpen} />

      <main>
      {/* ── SECTION 1: CINEMATIC DARK HERO (Sample 5 Benchmark) ── */}
      <section className="ysl-hero-section" ref={overviewRef}>
        <div className="ysl-hero-bg">
          <div className="ysl-hero-glow" />
          <img
            src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=1920&auto=format&fit=crop&q=85"
            alt="Black Opium Pink Glaze campaign"
            className={`ysl-hero-img ${isPlaying ? "playing" : "paused"}`}
          />
          <div className="ysl-hero-overlay" />
        </div>

        <div className="ysl-hero-content">
          <span className="ysl-hero-badge">NEW</span>
          <h1 className="ysl-hero-title">
            BLACK OPIUM<br />PINK GLAZE
          </h1>
          <p className="ysl-hero-tagline">
            AN IRRESISTIBLE GLAZED STRAWBERRY ACCORD MERGES WITH SIGNATURE FLORAL COFFEE.
          </p>
          <div className="ysl-hero-actions">
            <Link to="/products?category=fragrance" className="ysl-hero-btn">
              DISCOVER
            </Link>
          </div>
        </div>

        {/* Hero Play / Pause icon in bottom left (exact YSL control) */}
        <button
          className="ysl-hero-playback-toggle"
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? "Pause visual animation" : "Play visual animation"}
          title={isPlaying ? "Pause animation" : "Play animation"}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
      </section>

      {/* ── SECTION 2: STICKY SUB-ANCHOR BAR (Sample 5 Benchmark) ── */}
      <nav className="ysl-sub-anchor-bar" aria-label="Page sections">
        <div className="ysl-anchor-container">
          <button onClick={() => scrollToSection(overviewRef)} className="ysl-anchor-item">
            OVERVIEW
          </button>
          <button onClick={() => scrollToSection(productRangeRef)} className="ysl-anchor-item">
            PRODUCT RANGE
          </button>
          <button onClick={() => scrollToSection(discoverMoreRef)} className="ysl-anchor-item">
            DISCOVER MORE
          </button>
          <button onClick={() => scrollToSection(reviewsRef)} className="ysl-anchor-item">
            REVIEWS
          </button>
        </div>
      </nav>

      {/* ── SECTION 3: SPLIT DARK FEATURE — THE NEW STRAWBERRY CRAZE ── */}
      <section className="ysl-strawberry-split" ref={discoverMoreRef}>
        <div className="ysl-strawberry-visual">
          <img
            src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1000&auto=format&fit=crop&q=85"
            alt="Glazed Strawberry Accord and Black Opium Flacon"
            className="ysl-strawberry-img"
          />
          <div className="ysl-strawberry-sparkles" />
        </div>

        <div className="ysl-strawberry-editorial">
          <span className="ysl-editorial-pill">EAU DE PARFUM</span>
          <h2 className="ysl-strawberry-heading">
            THE NEW STRAWBERRY CRAZE
          </h2>
          <p className="ysl-strawberry-body">
            A radical collision of mouthwatering glazed wild strawberries, radiant white peony,
            and the iconic darkness of roasted floral coffee. Unapologetic, magnetic, and formulated
            to linger with couture sillage in Nigeria's vibrant climate.
          </p>
          <div className="ysl-strawberry-notes-grid">
            <div className="ysl-note-box">
              <span className="ysl-note-role">TOP NOTE</span>
              <strong>Glazed Wild Strawberry</strong>
            </div>
            <div className="ysl-note-box">
              <span className="ysl-note-role">HEART NOTE</span>
              <strong>White Peony &amp; Orange Blossom</strong>
            </div>
            <div className="ysl-note-box">
              <span className="ysl-note-role">BASE NOTE</span>
              <strong>Dark Roasted Coffee &amp; Vanilla</strong>
            </div>
          </div>
          <Link to="/products?category=fragrance" className="ysl-strawberry-cta">
            EXPLORE THE SCENT
          </Link>
        </div>
      </section>

      {/* ── SECTION 4: 4-BOTTLE CAROUSEL (Sample 5 Benchmark) ── */}
      <section className="ysl-collection-carousel-section" ref={productRangeRef}>
        <div className="ysl-section-header">
          <h2 className="ysl-section-title">
            DISCOVER THE BLACK OPIUM COLLECTION
          </h2>
          <p className="ysl-section-subtitle">
            FOUR SENSORIAL SIGNATURES WITH UNAPOLOGETIC COUTURE SILLAGE
          </p>
        </div>

        <div className="ysl-carousel-grid">
          {SIGNATURE_COLLECTION.map((item) => {
            const currentSize = selectedSizes[item.id] || "50ML";
            const currentPrice = item.prices[currentSize] || item.prices["50ML"];
            const isFav = !!wishlistState[item.id];

            return (
              <div key={item.id} className="ysl-bottle-card">
                {/* Badge & Wishlist */}
                <div className="ysl-card-top-bar">
                  <span className="ysl-card-badge">{item.badge}</span>
                  <button
                    className={`ysl-card-heart ${isFav ? "active" : ""}`}
                    onClick={() => toggleWishlist(item.id)}
                    aria-label="Save to wishlist"
                  >
                    {isFav ? "❤️" : "♡"}
                  </button>
                </div>

                {/* Bottle Image */}
                <div className="ysl-bottle-img-wrap">
                  <img src={item.image} alt={item.name} className="ysl-bottle-img" />
                </div>

                {/* Card Info */}
                <div className="ysl-card-content">
                  <span className="ysl-card-subtitle">{item.subtitle}</span>
                  <h3 className="ysl-card-title">{item.name}</h3>
                  <div className="ysl-card-rating">
                    <span>★★★★★</span>
                    <span className="ysl-rating-count">{item.rating}</span>
                  </div>

                  {/* Size Dropdown Selector (YSL Style) */}
                  <div className="ysl-size-dropdown-row">
                    <label htmlFor={`size-${item.id}`}>SIZE:</label>
                    <select
                      id={`size-${item.id}`}
                      value={currentSize}
                      onChange={(e) => handleSizeChange(item.id, e.target.value)}
                      className="ysl-size-select"
                    >
                      <option value="30ML">30 ML — ₦{item.prices["30ML"].toLocaleString()}</option>
                      <option value="50ML">50 ML — ₦{item.prices["50ML"].toLocaleString()}</option>
                      <option value="90ML">90 ML — ₦{item.prices["90ML"].toLocaleString()}</option>
                    </select>
                  </div>

                  {/* Dynamic Price */}
                  <div className="ysl-card-price">
                    ₦{currentPrice.toLocaleString()}
                  </div>

                  {/* Solid Black ADD TO CART Button */}
                  <button
                    className="ysl-add-to-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 5: DRAMATIC DARK SPOTLIGHT SHOWCASE (Flacons on Pedestal) ── */}
      <section className="ysl-pedestal-showcase">
        <div className="ysl-spotlight-beam" />
        <div className="ysl-pedestal-atmosphere">
          <div className="ysl-pedestal-smoke" />
          <div className="ysl-pedestal-flacons">
            <img
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1400&auto=format&fit=crop&q=85"
              alt="4 Black Opium Flacons on Glossy Pedestal Table under Spotlight"
              className="ysl-pedestal-img"
            />
          </div>
          <div className="ysl-pedestal-reflection" />
        </div>

        <div className="ysl-pedestal-copy">
          <span className="ysl-pedestal-tag">HAUTE PARFUMERIE</span>
          <h2 className="ysl-pedestal-title">
            FOUR SENSORIAL SIGNATURES.<br />ONE UNAPOLOGETIC ATTITUDE.
          </h2>
          <p className="ysl-pedestal-desc">
            From the fiery crimson cherry of Over Red to the radiant glazed wild strawberry of Pink Glaze.
            Crafted for the bold Nigerian beauty who commands every room.
          </p>
          <div className="ysl-pedestal-buttons">
            <Link to="/products?category=fragrance" className="ysl-pedestal-btn primary">
              DISCOVER THE NOTES
            </Link>
            <Link to="/services" className="ysl-pedestal-btn secondary">
              BOOK PRIVATE FRAGRANCE CONSULTATION
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: ONLINE EXCLUSIVES (4 Cards) ── */}
      <section className="ysl-online-exclusives-section">
        <div className="ysl-section-header">
          <h2 className="ysl-section-title">ONLINE EXCLUSIVES</h2>
          <p className="ysl-section-subtitle">
            BESPOKE CONCIERGE &amp; ARTIFICIAL INTELLIGENCE SERVICES
          </p>
        </div>

        <div className="ysl-exclusives-grid">
          {ONLINE_EXCLUSIVES.map((card, idx) => (
            <div key={idx} className="ysl-exclusive-card">
              <div className="ysl-exclusive-img-wrap">
                <img src={card.image} alt={card.title} className="ysl-exclusive-img" />
              </div>
              <div className="ysl-exclusive-body">
                <h3 className="ysl-exclusive-title">{card.title}</h3>
                <p className="ysl-exclusive-desc">{card.desc}</p>
                <Link to={card.linkUrl} className="ysl-exclusive-cta">
                  {card.linkText} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 7: SOCIAL UGC CAROUSEL (@GRACIAFAB ON SOCIAL) ── */}
      <section className="ysl-social-section" ref={reviewsRef}>
        <div className="ysl-section-header">
          <h2 className="ysl-section-title">DISCOVER @GRACIAFAB ON SOCIAL</h2>
          <p className="ysl-section-subtitle">
            TAG #GRACIAFAB TO BE FEATURED IN OUR COUTURE BEAUTY VAULT
          </p>
        </div>

        <div className="ysl-social-carousel-wrap">
          <div className="ysl-social-grid">
            {[
              ...SOCIAL_POSTS.slice(socialIndex),
              ...SOCIAL_POSTS.slice(0, socialIndex),
            ].map((post) => (
              <div key={post.id} className="ysl-social-card">
                <img src={post.image} alt={post.tag} className="ysl-social-img" />
                <div className="ysl-social-hover-overlay">
                  <span className="ysl-social-handle">{post.handle}</span>
                  <span className="ysl-social-loc">{post.location}</span>
                  <span className="ysl-social-tag">{post.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="ysl-social-arrows">
            <button onClick={prevSocial} className="ysl-carousel-arrow" aria-label="Previous social slide">
              ←
            </button>
            <button onClick={nextSocial} className="ysl-carousel-arrow" aria-label="Next social slide">
              →
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: BOLD BRAND STATEMENT HEADER ── */}
      <section className="ysl-statement-section">
        <div className="ysl-statement-inner">
          <span className="ysl-statement-accent">MAISON DE BEAUTÉ</span>
          <h2 className="ysl-statement-headline">
            GRACIA FAB: YOUR BOLD BEAUTY OBSESSION
          </h2>
          <p className="ysl-statement-sub">
            COUTURE BEAUTY, HIGH-TECH FORMULATION &amp; RAW LUXURY FOR THE MODERN AFRICAN WOMAN.
          </p>
        </div>
      </section>
      </main>

      {/* ── SECTION 9: YSL 5-COLUMN BLACK LUXURY FOOTER ── */}
      <Footer />
    </div>
  );
}

export default Home;
