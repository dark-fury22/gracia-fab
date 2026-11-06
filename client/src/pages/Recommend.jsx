import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import FloatingBackHeader from "../components/FloatingBackHeader";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import LiveCameraToneDetector from "../components/LiveCameraToneDetector";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { useBeautyProfile } from "../hooks/useBeautyProfile";
import { AFRICAN_UNDERTONES } from "../utils/africanUndertones";
import API_URL from "../config";
import "../styles/Recommend.css";

// ── Default Curated 4-Step Routine ──
const DEFAULT_ROUTINE = [
  {
    _id: "prod-cleanser-1",
    step: "Step 01 / Cleanse",
    name: "Hydrating Face Cleanser",
    category: "skincare",
    price: 18000,
    rating: 4.8,
    reviewsCount: 1240,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80",
    benefit: "Gently purifies without stripping natural moisture",
  },
  {
    _id: "prod-toner-2",
    step: "Step 02 / Tone",
    name: "Glow Balancing Toner",
    category: "skincare",
    price: 16500,
    rating: 4.7,
    reviewsCount: 980,
    image:
      "https://images.unsplash.com/photo-1608248597359-5776d6342111?w=500&auto=format&fit=crop&q=80",
    benefit: "Refines pores and restores skin pH balance",
  },
  {
    _id: "prod-moisturizer-3",
    step: "Step 03 / Hydrate",
    name: "Radiance Rich Moisturizer",
    category: "skincare",
    price: 24000,
    rating: 4.8,
    reviewsCount: 1520,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80",
    benefit: "Deep nourishing hydration with barrier protection",
  },
  {
    _id: "prod-spf-4",
    step: "Step 04 / Protect",
    name: "Daily Invisible SPF 50+",
    category: "skincare",
    price: 20000,
    rating: 4.9,
    reviewsCount: 720,
    image:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&auto=format&fit=crop&q=80",
    benefit: "Zero white cast formula for melanin-rich skin",
  },
];

const SKIN_TYPES = [
  "Combination Skin",
  "Oily / Acne-Prone",
  "Dry / Dehydrated",
  "Normal / Balanced",
  "Sensitive / Reactive",
];

const HAIR_TYPES = [
  "4C Coily & Tight Curls",
  "4A / 4B Kinky Hair",
  "3B / 3C Curly",
  "Relaxed / Heat-Treated",
  "Protective Braids & Locs",
];

const CLIMATE_CONCERNS = [
  { id: "hyper", label: "Hyperpigmentation & Dark Spots", icon: "☀️" },
  { id: "oil", label: "Midday Shine & Lagos Humidity", icon: "💧" },
  { id: "dry", label: "Harmattan Dryness & Flaking", icon: "🍂" },
  { id: "sun", label: "Sun Protection (Zero White Cast)", icon: "🛡️" },
  { id: "edges", label: "Edge Protection & Lace Tension", icon: "🌸" },
  { id: "pores", label: "Enlarged Pores & Texture", icon: "✨" },
];

function Recommend({ onCartOpen, initialStep = 1 }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const beautyContext = useBeautyProfile() || {};
  const profile = beautyContext.profile || {};
  const updateProfile = beautyContext.updateProfile || (() => {});

  // Stepper State: 1 = Focus/Intro, 2 = Profile, 3 = Concerns, 4 = Undertone, 5 = Routine Result
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  // Form selections
  const [selectedGoal, setSelectedGoal] = useState("skincare");
  const [selectedSkinType, setSelectedSkinType] = useState(
    profile.skinType || "Combination Skin"
  );
  const [selectedHairType, setSelectedHairType] = useState(
    profile.hairType || "4C Coily & Tight Curls"
  );
  const [selectedConcerns, setSelectedConcerns] = useState([
    "Hyperpigmentation & Dark Spots",
    "Sun Protection (Zero White Cast)",
  ]);
  const [selectedToneKey, setSelectedToneKey] = useState(
    profile.skinTone?.key || "warm-golden"
  );

  // Routine & Cart
  const [routineItems, setRoutineItems] = useState(DEFAULT_ROUTINE);
  const [wishlist, setWishlist] = useState({});

  // Chat State inside Results view
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "ai",
      time: "11:24 AM",
      text: "Hello beautiful! ✨ I've curated this ritual for your exact profile. What questions can I answer about your ingredients?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  const containerRef = useRef(null);

  // Auto-fetch products to enrich routine if live API is available
  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/api/products?limit=8`);
        if (res.ok) {
          const data = await res.json();
          const prods = Array.isArray(data) ? data : data.products || [];
          if (prods.length >= 4 && isMounted) {
            const mapped = DEFAULT_ROUTINE.map((item, idx) => {
              const live = prods[idx];
              if (!live) return item;
              return {
                ...item,
                _id: live._id || item._id,
                name: live.name || item.name,
                price: live.price || item.price,
                image: live.image || item.image,
                rating: live.rating || item.rating,
              };
            });
            setRoutineItems(mapped);
          }
        }
      } catch {
        // Fallback to DEFAULT_ROUTINE
      }
    }
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToTop = () => {
    if (containerRef.current && typeof containerRef.current.scrollIntoView === "function") {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    scrollToTop();
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    scrollToTop();
  };

  const toggleConcern = (concernLabel) => {
    setSelectedConcerns((prev) =>
      prev.includes(concernLabel)
        ? prev.filter((c) => c !== concernLabel)
        : [...prev, concernLabel]
    );
  };

  const handleToneDetected = (toneData) => {
    setSelectedToneKey(toneData.key || "warm-golden");
    updateProfile({ skinTone: toneData });
    addToast(`Detected ${toneData.name || toneData.undertone}! ✨`, "success");
    handleNextStep();
  };

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

  const handleAddEntireRoutine = () => {
    routineItems.forEach((item) => {
      addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
      });
    });
    const total = routineItems.reduce((acc, c) => acc + (c.price || 0), 0);
    addToast(
      `Added complete 4-step routine (₦${total.toLocaleString()}) to your bag! 🌟`,
      "cart"
    );
    if (onCartOpen) onCartOpen();
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const next = !prev[id];
      if (next) addToast("Saved to your wishlist ❤️", "info");
      return { ...prev, [id]: next };
    });
  };

  const handleSendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || isAiTyping) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: "user",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text,
      },
    ]);
    setChatInput("");
    setIsAiTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: data.reply || "For your skin type, hydration and gentle exfoliation keep your glow balanced! ✨",
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: "For melanin-rich skin in the Nigerian climate, layering light hydration beneath a non-comedogenic SPF 50+ prevents midday oiliness while protecting against dark spots ✨",
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const totalRoutinePrice = routineItems.reduce((acc, c) => acc + (c.price || 0), 0);
  const activeTone = AFRICAN_UNDERTONES[selectedToneKey] || AFRICAN_UNDERTONES["warm-golden"];

  return (
    <div className="advisor-flow-page" ref={containerRef}>
      <SEO
        title="AI Beauty Advisor &amp; Consultation — Gracia Fab"
        description="Experience luxury step-by-step skincare, glueless raw wigs, and bridal beauty consultation calibrated for African complexions."
        keywords="AI beauty advisor, Nigerian skincare, melanin undertone detector, raw wigs Lagos"
        url="/recommend"
      />

      {/* ── 0. Floating Luxury Header (No Full Navbar Clutter) ── */}
      <FloatingBackHeader backLabel="Back to Home" onCartOpen={onCartOpen} />

      <main className="advisor-flow-container">
        {/* ── Top Progress Stepper ── */}
        <div className="advisor-stepper-bar">
          <div className="stepper-dots">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <button
                key={stepNum}
                type="button"
                className={`stepper-dot ${currentStep === stepNum ? "active" : ""} ${currentStep > stepNum ? "completed" : ""
                  }`}
                onClick={() => setCurrentStep(stepNum)}
                aria-label={`Go to step ${stepNum}`}
              >
                <span className="dot-number">{stepNum}</span>
              </button>
            ))}
          </div>
          <div className="stepper-label">
            {currentStep === 1 && "Step 01 / Beauty Focus"}
            {currentStep === 2 && "Step 02 / Skin & Hair Profile"}
            {currentStep === 3 && "Step 03 / Climate Concerns"}
            {currentStep === 4 && "Step 04 / Undertone Calibration"}
            {currentStep === 5 && "Step 05 / Your Custom Ritual"}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            STEP 1: CONSULTATION FOCUS / HERO
            ═════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <section className="advisor-step-card step-intro-card">
            <div className="advisor-hero-banner">
              <div className="advisor-hero-content">
                <div className="advisor-hero-tag">
                  <span>✦ AI BEAUTY ADVISOR</span>
                </div>
                <h1 className="advisor-hero-title">Your Personal Beauty Expert</h1>
                <p className="advisor-hero-subhead">
                  Get personalized skincare, makeup and haircare advice, find the
                  perfect products, and build a routine that works for you.
                </p>
                <div className="advisor-hero-cta-group">
                  <button
                    type="button"
                    className="advisor-hero-primary-btn"
                    onClick={handleNextStep}
                  >
                    Start Your Beauty Consultation <span>→</span>
                  </button>
                  <button
                    type="button"
                    className="advisor-hero-camera-btn"
                    onClick={() => setCameraModalOpen(true)}
                  >
                    📸 Snap Undertone Selfie ✦
                  </button>
                </div>
              </div>
            </div>

            {/* 4-Pillar Trust Strip */}
            <div className="advisor-value-strip">
              <div className="advisor-value-item">
                <span className="advisor-value-icon">✦</span>
                <div className="advisor-value-text">
                  <strong>Personalized</strong>
                  <span>Recommendations</span>
                </div>
              </div>
              <div className="advisor-value-item">
                <span className="advisor-value-icon">🌸</span>
                <div className="advisor-value-text">
                  <strong>Expert Beauty Advice</strong>
                  <span>Powered by AI</span>
                </div>
              </div>
              <div className="advisor-value-item">
                <span className="advisor-value-icon">🛍️</span>
                <div className="advisor-value-text">
                  <strong>Shop Your Perfect</strong>
                  <span>Matches</span>
                </div>
              </div>
              <div className="advisor-value-item">
                <span className="advisor-value-icon">🛡️</span>
                <div className="advisor-value-text">
                  <strong>Trusted Quality,</strong>
                  <span>Always</span>
                </div>
              </div>
            </div>

            {/* 4 Primary Intent Action Cards */}
            <div className="advisor-step-body">
              <h2 className="step-question-heading">
                What would you like Gracia Fab to curate today?
              </h2>
              <p className="step-question-sub">
                Select your primary intention to begin the guided consultation.
              </p>

              <div className="advisor-action-tiles-grid">
                <button
                  type="button"
                  className={`advisor-action-tile ${selectedGoal === "skincare" ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedGoal("skincare");
                    handleNextStep();
                  }}
                >
                  <span className="tile-icon">🧴</span>
                  <div className="tile-text">
                    <strong>Find the right skincare</strong>
                    <span>for my skin type</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`advisor-action-tile ${selectedGoal === "makeup" ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedGoal("makeup");
                    handleNextStep();
                  }}
                >
                  <span className="tile-icon">💄</span>
                  <div className="tile-text">
                    <strong>Get a makeup</strong>
                    <span>recommendation for my undertone</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`advisor-action-tile ${selectedGoal === "routine" ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedGoal("routine");
                    handleNextStep();
                  }}
                >
                  <span className="tile-icon">📋</span>
                  <div className="tile-text">
                    <strong>Build a complete</strong>
                    <span>beauty routine</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`advisor-action-tile ${selectedGoal === "haircare" ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedGoal("haircare");
                    handleNextStep();
                  }}
                >
                  <span className="tile-icon">💆🏽‍♀️</span>
                  <div className="tile-text">
                    <strong>Explore haircare</strong>
                    <span>and raw wig solutions</span>
                  </div>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 2: SKIN & HAIR PROFILE
            ═════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <section className="advisor-step-card">
            <div className="step-header-area">
              <span className="step-eyebrow">✦ STEP 02 / SKIN &amp; HAIR TYPE</span>
              <h2 className="step-question-heading">How does your skin &amp; hair behave daily?</h2>
              <p className="step-question-sub">
                Helps us balance hydration, sebum control, and active ingredient potency.
              </p>
            </div>

            <div className="step-options-section">
              <label className="section-field-label">Your Skin Type</label>
              <div className="pills-selection-grid">
                {SKIN_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`pill-option-btn ${selectedSkinType === type ? "selected" : ""}`}
                    onClick={() => setSelectedSkinType(type)}
                  >
                    {selectedSkinType === type ? "✓ " : ""}{type}
                  </button>
                ))}
              </div>
            </div>

            <div className="step-options-section">
              <label className="section-field-label">Your Hair &amp; Crown Texture</label>
              <div className="pills-selection-grid">
                {HAIR_TYPES.map((hair) => (
                  <button
                    key={hair}
                    type="button"
                    className={`pill-option-btn ${selectedHairType === hair ? "selected" : ""}`}
                    onClick={() => setSelectedHairType(hair)}
                  >
                    {selectedHairType === hair ? "✓ " : ""}{hair}
                  </button>
                ))}
              </div>
            </div>

            <div className="step-nav-footer">
              <button type="button" className="step-back-btn" onClick={handlePrevStep}>
                ← Back
              </button>
              <button type="button" className="step-next-btn" onClick={handleNextStep}>
                Continue to Climate Concerns →
              </button>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 3: CLIMATE & CONCERNS
            ═════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <section className="advisor-step-card">
            <div className="step-header-area">
              <span className="step-eyebrow">✦ STEP 03 / CLIMATE &amp; TARGETED CARE</span>
              <h2 className="step-question-heading">What challenges does your skin face?</h2>
              <p className="step-question-sub">
                Select all that apply. Formulated for high humidity, heat, and seasonal Harmattan.
              </p>
            </div>

            <div className="concerns-chips-grid">
              {CLIMATE_CONCERNS.map((item) => {
                const isSelected = selectedConcerns.includes(item.label);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`concern-chip-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleConcern(item.label)}
                  >
                    <span className="chip-icon">{item.icon}</span>
                    <span className="chip-text">{item.label}</span>
                    {isSelected && <span className="chip-check">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="step-nav-footer">
              <button type="button" className="step-back-btn" onClick={handlePrevStep}>
                ← Back
              </button>
              <button type="button" className="step-next-btn" onClick={handleNextStep}>
                Continue to Melanin Undertone →
              </button>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 4: AFRICAN UNDERTONE CALIBRATION
            ═════════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <section className="advisor-step-card">
            <div className="step-header-area">
              <span className="step-eyebrow">✦ STEP 04 / UNDERTONE HARMONY</span>
              <h2 className="step-question-heading">Calibrate your exact African undertone</h2>
              <p className="step-question-sub">
                Ensures seamless shade pairing, zero white cast, and radiant pigment harmony.
              </p>
            </div>

            {/* Quick Camera Action Banner */}
            <div className="live-undertone-scan-banner">
              <div className="scan-banner-info">
                <span className="scan-icon">📸</span>
                <div>
                  <strong>Live African Undertone Detection</strong>
                  <p>Snap a private selfie with your camera to detect your exact ITA value in real time.</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-launch-camera"
                onClick={() => setCameraModalOpen(true)}
              >
                📸 Snap Undertone Selfie ✦
              </button>
            </div>

            {/* 3 Swatch Cards */}
            <div className="undertone-swatches-grid">
              {Object.values(AFRICAN_UNDERTONES).map((tone) => (
                <div
                  key={tone.id}
                  className={`undertone-select-card ${selectedToneKey === tone.id ? "selected" : ""}`}
                  onClick={() => setSelectedToneKey(tone.id)}
                >
                  <div className="tone-swatch-box" style={{ backgroundColor: tone.hex }}>
                    <span className="swatch-label">{tone.name}</span>
                  </div>
                  <div className="tone-details">
                    <h4>{tone.name}</h4>
                    <p>{tone.description}</p>
                    <div className="tone-foundation-row">
                      <span>Match:</span>
                      <strong>{tone.foundation}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="step-nav-footer">
              <button type="button" className="step-back-btn" onClick={handlePrevStep}>
                ← Back
              </button>
              <button
                type="button"
                className="step-next-btn primary-glow"
                onClick={handleNextStep}
              >
                Reveal My Custom Ritual ✨
              </button>
            </div>
          </section>
        )}

        {/* ═════════════════════════════════════════════════════════════
            STEP 5: THE GRAND REVEAL (YOUR BESPOKE RITUAL)
            ═════════════════════════════════════════════════════════════ */}
        {currentStep === 5 && (
          <section className="advisor-step-card ritual-reveal-card">
            <div className="reveal-header">
              <span className="reveal-sparkle-badge">✦ YOUR BESPOKE GRACIA FAB RITUAL</span>
              <h2 className="reveal-title">Crafted for your skin, crown &amp; climate</h2>
              <div className="reveal-summary-pill">
                <span>{selectedSkinType}</span>
                <span className="pill-divider">•</span>
                <span style={{ color: activeTone.hex }}>{activeTone.name}</span>
                <span className="pill-divider">•</span>
                <span>{selectedConcerns[0] || "Radiant Care"}</span>
              </div>
            </div>

            {/* 4-Step Routine Products Row */}
            <div className="routine-showcase-container">
              <div className="routine-card-header">
                <div>
                  <h3 className="routine-title">
                    <span className="routine-sparkle">✦</span> 4-Step Daily Ritual
                  </h3>
                  <p className="routine-subtitle">
                    A simple routine for healthy, radiant skin.
                  </p>
                </div>
                <div className="routine-actions-top">
                  <button
                    type="button"
                    className="add-all-routine-btn"
                    onClick={handleAddEntireRoutine}
                  >
                    + Add All ({totalRoutinePrice.toLocaleString()} NGN)
                  </button>
                  <button
                    type="button"
                    className="view-full-routine-link"
                    onClick={() => setCurrentStep(2)}
                  >
                    Refine Answers ↺
                  </button>
                </div>
              </div>

              <div className="routine-products-row">
                {routineItems.map((prod) => (
                  <div key={prod._id} className="routine-prod-card">
                    <div className="routine-prod-img-wrap">
                      <button
                        type="button"
                        className={`routine-wishlist-heart ${wishlist[prod._id] ? "active" : ""}`}
                        onClick={() => toggleWishlist(prod._id)}
                        aria-label="Add to wishlist"
                      >
                        {wishlist[prod._id] ? "❤️" : "♡"}
                      </button>
                      <Link to={`/products/${prod._id}`}>
                        <img src={prod.image} alt={prod.name} className="routine-prod-img" />
                      </Link>
                    </div>

                    <div className="routine-prod-info">
                      <span className="routine-step-tag">{prod.step}</span>
                      <Link to={`/products/${prod._id}`} className="routine-prod-title">
                        {prod.name}
                      </Link>

                      <div className="routine-rating-row">
                        <span className="star-icon">★</span>
                        <span className="rating-val">{prod.rating}</span>
                        <span className="review-count">
                          ({prod.reviewsCount ? `${(prod.reviewsCount / 1000).toFixed(1)}k` : "1.2k"})
                        </span>
                      </div>

                      <div className="routine-price-val">
                        ₦{Number(prod.price).toLocaleString()}
                      </div>

                      <button
                        type="button"
                        className="routine-add-btn"
                        onClick={() => handleAddToCart(prod)}
                      >
                        Add to Cart ↗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Suite */}
            <div className="reveal-bottom-actions">
              <button
                type="button"
                className="btn-add-entire-ritual"
                onClick={handleAddEntireRoutine}
              >
                + Add Complete Ritual to Bag (₦{totalRoutinePrice.toLocaleString()})
              </button>

              <Link to="/products" className="btn-browse-matched-catalog">
                Explore All Matched Products in Shop →
              </Link>
            </div>

            {/* Collapsible Ask AI Advisor */}
            <div className="reveal-chat-accordion">
              <button
                type="button"
                className="reveal-chat-toggle"
                onClick={() => setChatOpen((prev) => !prev)}
              >
                <span>✦ Have questions about your routine? Ask the AI Advisor</span>
                <span>{chatOpen ? "−" : "+"}</span>
              </button>

              {chatOpen && (
                <div className="reveal-chat-drawer">
                  <div className="chat-messages-scroll">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`chat-bubble-row ${msg.sender === "user" ? "user" : "ai"}`}>
                        <div className="chat-bubble-text">
                          <p>{msg.text}</p>
                          <span className="chat-time">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="chat-bubble-row ai">
                        <div className="chat-bubble-text typing">
                          <span>•</span><span>•</span><span>•</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="chat-input-row">
                    <input
                      type="text"
                      placeholder="e.g. Can I use this with retinol?"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    />
                    <button type="button" onClick={handleSendChatMessage}>
                      Ask →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Live Camera Undertone Modal */}
      <LiveCameraToneDetector
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onDetected={handleToneDetected}
      />

      <Footer />
    </div>
  );
}

export default Recommend;
