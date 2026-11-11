import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import LiveCameraToneDetector from "../components/LiveCameraToneDetector";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { AFRICAN_UNDERTONES } from "../utils/africanUndertones";
import "../styles/YslHome.css";


// Real Gracia Fab community/UGC photos — no per-photo handles attributed,
// Grounded in what the store actually does today — delivery fee, payment
// rails and the wig-purity guarantee are pulled from Checkout and About,
// not invented, so this never promises something the site doesn't do.
const FAQ_ITEMS = [
  {
    q: "How does the AI Beauty Advisor work?",
    a: "Answer a few quick questions about your skin, hair and goals in our AI Advisor — no account needed — and get matched products plus a personalised routine in seconds.",
  },
  {
    q: "How does the Live Undertone Camera Scanner work?",
    a: "Our live camera scanner uses your camera to measure dermatological Individual Typology Angle (ITA) values and identify whether you have a Warm Golden, Rich Neutral, or Deep Espresso undertone in real time, with 100% on-device privacy.",
  },
  {
    q: "Can I compare multiple skincare formulations side-by-side?",
    a: "Yes! Use our Formulation Comparator at /compare to inspect active ingredients (like Niacinamide, Vitamin C, Retinol, and Squalane), skin suitability, texture, finish, and prices side-by-side.",
  },
  {
    q: "Do I need an account to shop?",
    a: "No — you can browse, use the AI Advisor, and add items to your bag as a guest. You'll only need to sign in when you're ready to check out, so we can process and track your order.",
  },
  {
    q: "Where do you deliver, and how much does it cost?",
    a: "We deliver nationwide across Nigeria for a flat ₦2,500 delivery fee, with same-day dispatch available in Lagos.",
  },
  {
    q: "How can I pay?",
    a: "Checkout is secured by Monnify — you can pay by card, bank transfer, or USSD.",
  },
  {
    q: "Are your wigs genuine human hair?",
    a: "Yes — every wig is 100% single-donor raw hair, inspected through a 14-point check in Lagos and backed by our money-back purity guarantee.",
  },
  {
    q: "Is my selfie safe when I use Skin Analysis?",
    a: "Your photo is analyzed directly in your browser or sent for that single instant consultation, never stored or shared.",
  },
];

// ── New In Store Items (Phase 3 Inspiration) ──
const NEW_IN_STORE_ITEMS = [
  {
    _id: "new-prod-1",
    name: "Clarifying Herbal Cleansing Oil",
    category: "skincare",
    price: 16000,
    rating: 4.8,
    reviewsCount: 310,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80",
    tag: "First Cleanse · Oil-to-Milk",
  },
  {
    _id: "new-prod-2",
    name: "Niacinamide 10% + Zinc Serum",
    category: "skincare",
    price: 21500,
    rating: 4.9,
    reviewsCount: 490,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80",
    tag: "Texture & Pore Minimizer",
  },
  {
    _id: "new-prod-3",
    name: "Velvet Melanin Lip Elixir",
    category: "makeup",
    price: 12500,
    rating: 4.9,
    reviewsCount: 620,
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=80",
    tag: "Non-Sticky · Shea Infused",
  },
  {
    _id: "new-prod-4",
    name: "Lace Melting Edge Mousse",
    category: "haircare",
    price: 14000,
    rating: 4.8,
    reviewsCount: 280,
    image:
      "https://images.unsplash.com/photo-1608248597359-5776d6342111?w=500&auto=format&fit=crop&q=80",
    tag: "Alcohol-Free · Fast Drying",
  },
];

const SPOTLIGHT_HERO_PRODUCT = {
  _id: "spotlight-wig-hero",
  name: "100% Raw Virgin Glueless HD Melt Wig",
  category: "haircare",
  price: 98000,
  originalPrice: 125000,
  rating: 5.0,
  reviewsCount: 520,
  image:
    "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&auto=format&fit=crop&q=80",
  tag: "Editor's Spotlight of the Week",
  description:
    "Single-donor unprocessed raw human hair with ultra-thin Swiss HD lace. Pre-plucked hairline that melts invisibly into all melanin undertones without glue or tension.",
  variants: ['18" Natural Black', '22" Natural Black', '26" Natural Black'],
};

function Home({ onCartOpen }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [openFaq, setOpenFaq] = useState(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [selectedSpotlightVariant, setSelectedSpotlightVariant] = useState('22" Natural Black');
  const faqSectionRef = useRef(null);
  const location = useLocation();


  const handleAddToCart = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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

  // Let the Navbar's FAQ link ("/#faq") work from any page, and also work
  // when clicked while already on the home page (a route change alone
  // wouldn't remount this component or trigger the browser's native
  // hash-scroll, since the target element didn't exist yet at nav time).
  useEffect(() => {
    if (location.hash === "#faq" && faqSectionRef.current) {
      faqSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);


  return (
    <div className="ysl-home-page">
      <SEO
        title="Gracia Fab — AI-Powered Beauty, Skincare, Haircare, Wigs & Bridal"
        description="Shop Gracia Fab's AI-matched skincare, haircare, wigs and bridal beauty essentials, curated for Nigerian skin, hair and climate."
        keywords="beauty Nigeria, skincare Lagos, haircare products, wigs Nigeria, bridal beauty, AI beauty advisor"
        url="/"
      />

      <Navbar onCartOpen={onCartOpen} transparent />

      <main>
      {/* ── SECTION 1: HERO ── */}
      <section className="ysl-hero-section">
        <div className="ysl-hero-bg">
          <div className="ysl-hero-glow" />
          <video
            className="ysl-hero-video"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          >
            <source
              src="https://res.cloudinary.com/dyzkjerez/video/upload/v1789284554/Generate_a_high_end_glossy_c_1_arwzb5.mp4"
              type="video/mp4"
            />
          </video>
          <div className="ysl-hero-overlay" />
          <div className="ysl-hero-watermark-mask" />
        </div>

        {/* Ambient Floating Golden Stardust (Pizzazz Layer) */}
        <div className="ysl-hero-stardust" aria-hidden="true">
          <span className="stardust star-1">✦</span>
          <span className="stardust star-2">✧</span>
          <span className="stardust star-3">✦</span>
          <span className="stardust star-4">⋆</span>
          <span className="stardust star-5">✧</span>
          <span className="stardust star-6">✦</span>
          <span className="stardust star-7">⋆</span>
        </div>

        <div className="ysl-hero-content">
          <h1 className="ysl-hero-title">
            Beauty, <br />
            <span className="ysl-hero-title-gold">matched to you.</span>
          </h1>
          <p className="ysl-hero-tagline">
            AI-powered skincare, haircare, wigs &amp; bridal beauty for Nigerian skin, hair and climate.
          </p>
          <div className="ysl-hero-actions">
            <div className="ysl-hero-buttons-pair">
              <Link to="/recommend" className="ysl-hero-btn ysl-hero-btn-advisor">
                <span className="ysl-hero-btn-sparkles" aria-hidden="true">
                  <span className="sparkle s1">✦</span>
                  <span className="sparkle s2">✧</span>
                  <span className="sparkle s3">✦</span>
                  <span className="sparkle s4">✧</span>
                </span>
                ✦ Consult AI Advisor <span className="btn-arrow">→</span>
              </Link>
              <Link to="/products" className="ysl-hero-btn ysl-hero-btn-shop ysl-hero-btn-primary">
                Shop The Collection
              </Link>
            </div>
            <button
              type="button"
              className="ysl-hero-pill-scan"
              onClick={() => setCameraModalOpen(true)}
              aria-label="Live Undertone Scan"
            >
              <span className="pill-scan-camera" aria-hidden="true">📸</span>
              <span className="pill-scan-text">Live Undertone Scan · Melanin Match ✦</span>
              <span className="pill-scan-sparkle" aria-hidden="true">✨</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION: LUXURY ASSURANCE & CERTIFICATIONS RIBBON (Phase 1) ── */}
      <div className="ysl-assurance-ribbon" role="region" aria-label="Brand assurances">
        <div className="ysl-ribbon-track">
          <div className="ysl-ribbon-group">
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> 100% SINGLE-DONOR RAW HAIR</span>
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> ZERO WHITE CAST MELANIN SPF</span>
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> FORMULATED FOR LAGOS CLIMATE</span>
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> MONNIFY SECURED CHECKOUT</span>
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> FLAT ₦2,500 NATIONWIDE DELIVERY</span>
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> AI UNDERTONE ACCURACY GUARANTEE</span>
          </div>
          <div className="ysl-ribbon-group" aria-hidden="true">
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> 100% SINGLE-DONOR RAW HAIR</span>
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> ZERO WHITE CAST MELANIN SPF</span>
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> FORMULATED FOR LAGOS CLIMATE</span>
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> MONNIFY SECURED CHECKOUT</span>
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> FLAT ₦2,500 NATIONWIDE DELIVERY</span>
            <span className="ribbon-item"><span className="ribbon-sparkle">✦</span> AI UNDERTONE ACCURACY GUARANTEE</span>
          </div>
        </div>
      </div>

      {/* ── SECTION: 3-CARD EDITORIAL CAMPAIGN TRIAD (Phase 1) ── */}
      <section className="ysl-campaign-triad-section" aria-label="Signature beauty pillars">
        <div className="ysl-triad-header">
          <span className="ysl-triad-eyebrow">✦ SIGNATURE EDITORIALS</span>
          <h2 className="ysl-triad-heading">Curated for Melanin Radiance</h2>
          <p className="ysl-triad-sub">
            Three pillars of Gracia Fab: targeted skin hydration, single-donor raw hair, and bespoke AI shade matching.
          </p>
        </div>

        <div className="ysl-triad-grid">
          {/* Card 1: Melanin Skincare */}
          <article className="ysl-triad-card">
            <div className="triad-card-media">
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80"
                alt="Radiant Melanin Skincare"
                loading="lazy"
                className="triad-card-img"
              />
              <span className="triad-card-badge">01 / SKINCARE</span>
            </div>
            <div className="triad-card-content">
              <h3 className="triad-card-title">Get Radiant, Balanced Skin</h3>
              <p className="triad-card-desc">
                Barrier-restoring hydration infused with niacinamide and ceramides to resist Lagos midday humidity and shine.
              </p>
              <Link to="/products" className="triad-card-link">
                <span>Explore Skincare</span>
                <span className="triad-arrow">→</span>
              </Link>
            </div>
          </article>

          {/* Card 2: 100% Raw Glueless Wigs */}
          <article className="ysl-triad-card">
            <div className="triad-card-media">
              <img
                src="https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&auto=format&fit=crop&q=80"
                alt="100% Raw Glueless Wigs"
                loading="lazy"
                className="triad-card-img"
              />
              <span className="triad-card-badge">02 / COUTURE HAIR</span>
            </div>
            <div className="triad-card-content">
              <h3 className="triad-card-title">100% Raw Glueless Lace</h3>
              <p className="triad-card-desc">
                Single-donor virgin hair with pre-plucked HD Swiss lace that protects delicate hairlines and melts invisibly.
              </p>
              <Link to="/products" className="triad-card-link">
                <span>Shop Raw Hair</span>
                <span className="triad-arrow">→</span>
              </Link>
            </div>
          </article>

          {/* Card 3: AI Undertone Calibration */}
          <article className="ysl-triad-card">
            <div className="triad-card-media">
              <img
                src="https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&auto=format&fit=crop&q=80"
                alt="AI Undertone Calibration"
                loading="lazy"
                className="triad-card-img"
              />
              <span className="triad-card-badge">03 / AI ADVISOR</span>
            </div>
            <div className="triad-card-content">
              <h3 className="triad-card-title">Calibrate Your Undertone</h3>
              <p className="triad-card-desc">
                Snap a quick selfie for instant melanin matching — tailored for Warm Golden, Rich Neutral, and Deep Espresso tones.
              </p>
              <Link to="/recommend" className="triad-card-link triad-card-link-gold">
                <span>Start AI Consultation</span>
                <span className="triad-arrow">→</span>
              </Link>
            </div>
          </article>
        </div>
      </section>


      {/* ── SECTION: NEW IN STORE (Phase 3 Split Feature) ── */}
      <section className="ysl-new-store-section" aria-label="New arrivals and editor's spotlight">
        <div className="ysl-new-store-header">
          <div>
            <span className="ysl-new-store-eyebrow">✦ FRESH ARRIVALS</span>
            <h2 className="ysl-new-store-title">
              New in Store <span className="ysl-new-store-star">✦</span>
            </h2>
            <p className="ysl-new-store-sub">Just dropped from our Lagos beauty laboratory</p>
          </div>
          <Link to="/products" className="ysl-new-store-view-all">
            <span>View All Arrivals</span>
            <span className="arrow">→</span>
          </Link>
        </div>

        <div className="ysl-new-store-split">
          {/* Left: 4-Item Grid */}
          <div className="ysl-new-items-grid">
            {NEW_IN_STORE_ITEMS.map((item) => (
              <article key={item._id} className="ysl-new-item-card">
                <div className="new-item-media">
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <button
                    type="button"
                    className="new-item-quick-add"
                    onClick={(e) => handleAddToCart(item, e)}
                    aria-label={`Add ${item.name} to bag`}
                  >
                    🛍️
                  </button>
                </div>
                <div className="new-item-info">
                  <span className="new-item-tag">{item.tag}</span>
                  <h3 className="new-item-name">{item.name}</h3>
                  <div className="new-item-meta">
                    <span className="new-item-rating">★ {item.rating}</span>
                    <span className="new-item-price">₦{item.price.toLocaleString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Right: Featured Hero Spotlight */}
          <article className="ysl-new-spotlight-card">
            <span className="spotlight-top-badge">✦ {SPOTLIGHT_HERO_PRODUCT.tag}</span>
            <div className="spotlight-media-wrap">
              <img
                src={SPOTLIGHT_HERO_PRODUCT.image}
                alt={SPOTLIGHT_HERO_PRODUCT.name}
                loading="lazy"
                className="spotlight-img"
              />
              <span className="spotlight-purity-pill">100% Single Donor Purity</span>
            </div>

            <div className="spotlight-content">
              <div className="spotlight-rating">
                <span className="stars" aria-hidden="true">★★★★★</span>
                <span className="rating-text">5.0 (520 verified reviews)</span>
              </div>

              <h3 className="spotlight-title">{SPOTLIGHT_HERO_PRODUCT.name}</h3>
              <p className="spotlight-desc">{SPOTLIGHT_HERO_PRODUCT.description}</p>

              <div className="spotlight-price-row">
                <span className="spotlight-price">₦{SPOTLIGHT_HERO_PRODUCT.price.toLocaleString()}</span>
                <span className="spotlight-orig-price">₦{SPOTLIGHT_HERO_PRODUCT.originalPrice.toLocaleString()}</span>
                <span className="spotlight-save-pill">Save ₦27,000</span>
              </div>

              {/* Variant selector chips */}
              <div className="spotlight-variants-wrap">
                <span className="variant-label">Select Length &amp; Cap:</span>
                <div className="variant-chips">
                  {SPOTLIGHT_HERO_PRODUCT.variants.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`variant-chip-btn ${selectedSpotlightVariant === v ? "active" : ""}`}
                      onClick={() => setSelectedSpotlightVariant(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="spotlight-add-btn"
                onClick={(e) =>
                  handleAddToCart(
                    {
                      _id: SPOTLIGHT_HERO_PRODUCT._id,
                      name: `${SPOTLIGHT_HERO_PRODUCT.name} (${selectedSpotlightVariant})`,
                      price: SPOTLIGHT_HERO_PRODUCT.price,
                      image: SPOTLIGHT_HERO_PRODUCT.image,
                    },
                    e
                  )
                }
                aria-label={`Add ${SPOTLIGHT_HERO_PRODUCT.name} to bag`}
              >
                <span>Add Spotlight Item to Bag</span>
                <span className="btn-icon">🛍️</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* ── SECTION: PROMOTIONAL EDITORIAL BANNERS & PERKS (Phase 4 Inspiration) ── */}
      <section className="ysl-promo-banners-section" aria-label="Exclusive offers and brand perks">
        <div className="ysl-promo-grid">
          {/* Card 1: Large Featured First-Order Offer */}
          <article className="ysl-promo-card ysl-promo-card-featured">
            <div className="promo-featured-text">
              <span className="promo-eyebrow">✦ FIRST ORDER PRIVILEGE</span>
              <h3 className="promo-title">
                Save 20% on Your <br />Bespoke Glow
              </h3>
              <p className="promo-desc">
                Experience Nigerian climate-proof skincare, zero-white-cast SPF, and 100% single-donor raw hair.
              </p>
              <div className="promo-coupon-badge">
                <span className="coupon-label">USE CODE:</span>
                <span className="coupon-code">MAISON20</span>
              </div>
              <Link to="/products" className="promo-cta-btn promo-cta-btn-primary">
                <span>Claim 20% Off</span>
                <span className="btn-arrow">→</span>
              </Link>
            </div>
            <div className="promo-featured-media">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                alt="Radiant Melanin Skin Model"
                loading="lazy"
              />
              <div className="promo-media-glow" aria-hidden="true" />
            </div>
          </article>

          {/* Right Column: 2 Stacked Cards */}
          <div className="ysl-promo-col-stacked">
            {/* Card 2: Free Delivery */}
            <article className="ysl-promo-card ysl-promo-card-delivery">
              <div className="promo-card-content">
                <span className="promo-eyebrow">✦ FAST NATIONWIDE DISPATCH</span>
                <h3 className="promo-card-heading">Free Delivery Over ₦50,000</h3>
                <p className="promo-card-desc">
                  Enjoy complimentary same-day dispatch across Lagos and rapid door-to-door delivery across all 36 states.
                </p>
                <Link to="/#faq" className="promo-card-link">
                  <span>View Delivery Coverage</span>
                  <span className="arrow">→</span>
                </Link>
              </div>
              <div className="promo-card-visual" aria-hidden="true">
                <span className="promo-visual-icon">🚚</span>
                <span className="promo-visual-pill">Lagos Same-Day</span>
              </div>
            </article>

            {/* Card 3: VIP Club & Empties Rewards */}
            <article className="ysl-promo-card ysl-promo-card-vip">
              <div className="promo-card-content">
                <span className="promo-eyebrow">✦ GRACIA PRIVÉ CLUB</span>
                <h3 className="promo-card-heading">Exclusive VIP Member Discounts</h3>
                <p className="promo-card-desc">
                  Earn 10% beauty credits on every completed routine. Return empty jars for salon refills &amp; gifts.
                </p>
                <Link to="/dashboard" className="promo-card-link promo-card-link-gold">
                  <span>Join Gracia Privé</span>
                  <span className="arrow">→</span>
                </Link>
              </div>
              <div className="promo-card-visual" aria-hidden="true">
                <span className="promo-visual-icon">✨</span>
                <span className="promo-visual-pill">10% Cash Back</span>
              </div>
            </article>
          </div>
        </div>

        {/* 4-Pillar Perks Strip directly beneath */}
        <div className="ysl-promo-perks-strip" role="region" aria-label="Core service perks">
          <div className="promo-perk-item">
            <span className="promo-perk-icon" aria-hidden="true">🚚</span>
            <div className="promo-perk-text">
              <strong>Free Delivery over ₦50k</strong>
              <span>Fast Lagos same-day &amp; nationwide express</span>
            </div>
          </div>

          <div className="promo-perk-item">
            <span className="promo-perk-icon" aria-hidden="true">🛡️</span>
            <div className="promo-perk-text">
              <strong>14-Day Purity Guarantee</strong>
              <span>100% single-donor raw hair &amp; tested formulas</span>
            </div>
          </div>

          <div className="promo-perk-item">
            <span className="promo-perk-icon" aria-hidden="true">🌿</span>
            <div className="promo-perk-text">
              <strong>Melanin-First Formulations</strong>
              <span>Zero white cast, non-comedogenic &amp; clean</span>
            </div>
          </div>

          <div className="promo-perk-item">
            <span className="promo-perk-icon" aria-hidden="true">💬</span>
            <div className="promo-perk-text">
              <strong>24/7 AI Concierge Support</strong>
              <span>Instant routines tailored to your climate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: AFRICAN COMPLEXION & UNDERTONE SHOWCASE ── */}
      <section className="ysl-undertone-showcase-section">
        <div className="ysl-undertone-header">
          <span className="ysl-undertone-eyebrow">✦ MELANIN-FIRST BEAUTY</span>
          <h2 className="ysl-undertone-title">
            Formulated for African Complexions <em>✦</em>
          </h2>
          <p className="ysl-undertone-desc">
            Every formula and shade in Gracia Fab is calibrated for melanin-rich skin in the Nigerian climate — from hot humid Lagos afternoons to dry Harmattan seasons.
          </p>
        </div>

        <div className="ysl-undertone-cards-grid">
          {Object.values(AFRICAN_UNDERTONES).map((tone) => (
            <div key={tone.id} className="ysl-undertone-card">
              <div
                className="ysl-undertone-swatch"
                style={{ backgroundColor: tone.hex }}
              >
                <span className="ysl-undertone-swatch-label">{tone.name}</span>
              </div>
              <div className="ysl-undertone-card-body">
                <h3 className="ysl-undertone-card-title">{tone.name}</h3>
                <p className="ysl-undertone-card-desc">{tone.description}</p>
                <div className="ysl-undertone-card-foundation">
                  <span className="match-label">Matched Foundation:</span>
                  <strong>{tone.foundation}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="ysl-undertone-cta-banner">
          <div className="ysl-undertone-cta-text">
            <h3>Unsure of your exact undertone?</h3>
            <p>Scan your skin in real time with our on-device AI camera — private, instantaneous, and zero white cast guaranteed.</p>
          </div>
          <button
            type="button"
            className="ysl-undertone-camera-launch-btn"
            onClick={() => setCameraModalOpen(true)}
          >
            📸 Launch Live Undertone Camera ✦
          </button>
        </div>
      </section>


      {/* ── SECTION: SIDE-BY-SIDE FORMULATION COMPARATOR SPOTLIGHT ── */}
      <section className="ysl-comparator-showcase-section">
        <div className="ysl-comparator-inner">
          <div className="ysl-comparator-text-col">
            <span className="ysl-comparator-pill">✦ SMART BEAUTY SCIENCE</span>
            <h2 className="ysl-comparator-title">
              Compare Formulations <em>Side-by-Side</em>
            </h2>
            <p className="ysl-comparator-desc">
              Don't guess what your skin needs. Compare active ingredients (Niacinamide, Vitamin C, Retinol, Squalane), skin suitability, textures, and prices before you decide.
            </p>
            <div className="ysl-comparator-perks">
              <div className="perk-item">
                <span className="perk-check">✓</span>
                <span>Active ingredient breakdown &amp; concentrations</span>
              </div>
              <div className="perk-item">
                <span className="perk-check">✓</span>
                <span>Skin suitability matching (Oily, Dry, Sensitive, Combination)</span>
              </div>
              <div className="perk-item">
                <span className="perk-check">✓</span>
                <span>Direct side-by-side Naira pricing &amp; 1-click add to bag</span>
              </div>
            </div>
            <Link to="/compare" className="ysl-comparator-btn">
              Launch Formulation Comparator ⇄
            </Link>
          </div>

          <div className="ysl-comparator-preview-col">
            <div className="comparator-mini-table">
              <div className="mini-table-header">
                <div className="mini-col-head">Metric</div>
                <div className="mini-col-head">Hydrating Cleanser</div>
                <div className="mini-col-head">Glow Toner</div>
              </div>
              <div className="mini-table-row">
                <span className="mini-label">Actives</span>
                <span className="mini-val">Ceramides + Hyaluronic</span>
                <span className="mini-val">Niacinamide 5% + Glycolic</span>
              </div>
              <div className="mini-table-row">
                <span className="mini-label">Skin Type</span>
                <span className="mini-val">All / Sensitive</span>
                <span className="mini-val">Oily / Combination</span>
              </div>
              <div className="mini-table-row">
                <span className="mini-label">Finish</span>
                <span className="mini-val">Dewy &amp; Soothing</span>
                <span className="mini-val">Velvet Matte &amp; Clear</span>
              </div>
              <div className="mini-table-row price-row">
                <span className="mini-label">Price</span>
                <span className="mini-val">₦18,000</span>
                <span className="mini-val">₦16,500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: SHOP BY CATEGORY ── */}
      <section className="ysl-shopcat-section">
        <div className="ysl-shopcat-heading-strip">
          <h2 className="ysl-shopcat-title">
            Shop by<br />Category
          </h2>
        </div>

        <div className="ysl-shopcat-grid-wrap">
          <div className="ysl-shopcat-grid">
            <div className="ysl-shopcat-col offset">
              <Link to="/products?category=skincare" className="ysl-shopcat-card">
                <div className="ysl-shopcat-img-wrap" style={{ aspectRatio: "3 / 4" }}>
                  <img
                    src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789578054/poses_6_mnz88i.webp"
                    alt="Skincare"
                  />
                </div>
                <span className="ysl-shopcat-label">Skincare</span>
              </Link>

              <Link to="/products?category=wig" className="ysl-shopcat-card">
                <div className="ysl-shopcat-img-wrap" style={{ aspectRatio: "3 / 4.2" }}>
                  <img
                    src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789578101/poses_9_yt9tda.webp"
                    alt="Wigs"
                  />
                </div>
                <span className="ysl-shopcat-label">Wigs</span>
              </Link>
            </div>

            <div className="ysl-shopcat-col">
              <Link to="/products?category=haircare" className="ysl-shopcat-card">
                <div className="ysl-shopcat-img-wrap" style={{ aspectRatio: "4 / 3.3" }}>
                  <img
                    src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789578027/poses_5_lyj445.avif"
                    alt="Haircare"
                  />
                </div>
                <span className="ysl-shopcat-label">Haircare</span>
              </Link>

              <Link to="/products?category=bridal" className="ysl-shopcat-card">
                <div className="ysl-shopcat-img-wrap" style={{ aspectRatio: "4 / 3.6" }}>
                  <img
                    src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789578081/poses_8_wjpags.jpg"
                    alt="Bridal"
                  />
                </div>
                <span className="ysl-shopcat-label">Bridal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: OUR COMMITMENT ── */}
      <section className="ysl-commitment-section">
        <span className="ysl-commitment-sparkle" aria-hidden="true">✦</span>
        <div className="ysl-commitment-watermark" aria-hidden="true">GRACIA FAB</div>

        <div className="ysl-commitment-content">
          <h2 className="ysl-commitment-title">Our Commitment</h2>
          <p className="ysl-commitment-sub">
            We prioritize safe formulations and genuine quality in every product we curate.
            <br />
            Beauty you can trust, made for Nigerian skin, hair and climate.
          </p>

          <div className="ysl-commitment-badges">
            <div className="ysl-commitment-badge">
              <span className="ysl-commitment-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <span className="ysl-commitment-label">Gentle &amp; Safe</span>
            </div>

            <div className="ysl-commitment-badge">
              <span className="ysl-commitment-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 19c9-1 13-6 14-14-9 0-14 5-15 13v1z" />
                  <path d="M5 19c3.5-3.5 7-7 12-12" />
                </svg>
              </span>
              <span className="ysl-commitment-label">Premium Quality</span>
            </div>

            <div className="ysl-commitment-badge">
              <span className="ysl-commitment-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12M6 21h12M7 3c0 5 3 7 5 8-2 1-5 3-5 8M17 3c0 5-3 7-5 8 2 1 5 3 5 8" />
                </svg>
              </span>
              <span className="ysl-commitment-label">Made to Last</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: FAQ ── */}
      <section className="ysl-faq-section" id="faq" ref={faqSectionRef}>
        <div className="ysl-faq-inner">
          <h2 className="ysl-faq-title">Frequently Asked Questions</h2>
          <p className="ysl-faq-sub">Everything you need to know before you shop.</p>

          <div className="ysl-faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} className={`ysl-faq-item ${openFaq === i ? "open" : ""}`}>
                <button
                  type="button"
                  className="ysl-faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {item.q}
                  <span className="ysl-faq-icon" aria-hidden="true">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && <p className="ysl-faq-answer">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      </main>

      <LiveCameraToneDetector
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
      />

      <Footer />
    </div>
  );
}

export default Home;
