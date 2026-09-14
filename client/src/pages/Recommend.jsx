import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RoutineStepCard from "../components/RoutineStepCard";
import SEO from "../components/SEO";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { useBeautyProfile } from "../hooks/useBeautyProfile";
import API_URL from "../config";
import "../styles/Recommend.css";
import "../styles/RoutineGenerator.css";

const SHOPPING_FOR_OPTIONS = [
  { id: "skincare", label: "Skincare", emoji: "🧴" },
  { id: "haircare", label: "Haircare", emoji: "💆🏽‍♀️" },
  { id: "wig", label: "Wigs", emoji: "💇🏽‍♀️" },
  { id: "bridal", label: "Bridal Beauty", emoji: "👰🏽" },
  { id: "everything", label: "Everything — Surprise Me", emoji: "✨" },
];

const AGE_RANGES = ["Teens (13-19)", "20s", "30s", "40s", "50+"];

const LOOKING_FOR_MAP = {
  skincare: "skincare products",
  haircare: "haircare products",
  wig: "wig or hairstyle",
  bridal: "bridal beauty",
  everything: "everything",
};

function Recommend({ onCartOpen }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { profile, updateProfile } = useBeautyProfile();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [resultTab, setResultTab] = useState("picks"); // picks | routine
  const [routine, setRoutine] = useState(null);
  const [routineLoading, setRoutineLoading] = useState(false);
  const [routineError, setRoutineError] = useState("");
  const [routineTab, setRoutineTab] = useState("morning");

  // Pre-filled from whatever the shared beauty profile already knows —
  // a selfie in Skin Analysis or an earlier visit here means these
  // questions don't get asked twice.
  const [formData, setFormData] = useState({
    shoppingFor: profile.shoppingFor || "",
    skinType: profile.skinType || "",
    skinConcerns: profile.skinConcerns || "",
    ageRange: profile.ageRange || "",
    hairType: profile.hairType || "",
    hairConcerns: profile.hairConcerns || "",
    budget: profile.budget || "",
    occasion: profile.occasion || "",
    weddingDate: profile.weddingDate || "",
    bridalStyle: profile.bridalStyle || "",
  });

  const isBridal = formData.shoppingFor === "bridal";
  const steps = isBridal
    ? ["What You Need", "About Your Skin", "Bridal Details", "Your Budget"]
    : ["What You Need", "About Your Skin", "About Your Hair", "Your Goals"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectShoppingFor = (id) => {
    setFormData((f) => ({ ...f, shoppingFor: id }));
    setStep(1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        skinType: formData.skinType,
        skinConcerns: formData.skinConcerns,
        hairType: isBridal ? "" : formData.hairType,
        hairConcerns: isBridal ? "" : formData.hairConcerns,
        lookingFor: LOOKING_FOR_MAP[formData.shoppingFor] || "everything",
        budget: formData.budget,
        occasion: isBridal ? "wedding or bridal" : formData.occasion,
      };
      const response = await fetch(`${API_URL}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setResults(data.recommendations);
      setResultTab("picks");
      setRoutine(null);
      // Remember everything for next time, wherever they land.
      updateProfile(formData);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Failed to get recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBag = (product) => {
    if (!product) return;
    addToCart(product);
    addToast(`Added ${product.name} to your bag 🛍️`, "cart");
    if (onCartOpen) onCartOpen();
  };

  const loadRoutine = async () => {
    if (routine || routineLoading) return;
    setRoutineLoading(true);
    setRoutineError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/routine/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          skinType: formData.skinType,
          ageRange: formData.ageRange,
          concerns: formData.skinConcerns
            ? formData.skinConcerns.split(",").map((c) => c.trim()).filter(Boolean)
            : [],
          budget: formData.budget,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRoutine(data.routine);
      setRoutineTab("morning");
    } catch (err) {
      setRoutineError(
        err.message || "Could not build your routine. Please try again.",
      );
    } finally {
      setRoutineLoading(false);
    }
  };

  const handleResultTab = (tab) => {
    setResultTab(tab);
    if (tab === "routine") loadRoutine();
  };

  const handleSaveRecommendation = async () => {
    if (!user) return; // handled by the inline sign-up prompt instead

    try {
      const token = localStorage.getItem("token");
      const productIds = results
        .map((r) => r.product?._id || r.product)
        .filter(Boolean);

      const response = await fetch(
        `${API_URL}/api/wishlist/recommendations/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profile: {
              skinType: formData.skinType || "",
              hairType: formData.hairType || "",
              occasion: formData.occasion || "",
            },
            productIds,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setSaved(true);
    } catch (err) {
      addToast(err.message || "Failed to save your picks", "error");
    }
  };

  const currentRoutineSteps = routine
    ? routineTab === "morning"
      ? routine.morningRoutine
      : routineTab === "night"
        ? routine.nightRoutine
        : routine.weeklyTreatments
    : [];

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <>
      <SEO
        title="AI Beauty Advisor"
        description="Get personalized skincare, haircare, wig and bridal beauty recommendations from Gracia Fab's AI advisor — matched products and a routine, from one shared profile."
        keywords="AI beauty advisor Nigeria, personalized skincare, hair recommendations, bridal beauty AI"
        url="/recommend"
      />
      <Navbar onCartOpen={onCartOpen} />
      <div className="recommend-page" role="main">
        {/* Header */}
        <div className="recommend-header">
          <h1>Your AI Beauty Advisor ✨</h1>
          <p>
            One quick profile — matched products and a full routine, no
            re-typing anything.
          </p>
        </div>

        {!results ? (
          <div className="recommend-card">
            {/* Step Indicator */}
            <div className="step-indicator">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
                >
                  <div className="step-circle">{i < step ? "✓" : i + 1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            {/* Step 0 — What are you shopping for */}
            {step === 0 && (
              <div className="step-content">
                <h2>What are you shopping for?</h2>
                <div className="shopping-for-grid">
                  {SHOPPING_FOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`shopping-for-option ${formData.shoppingFor === opt.id ? "active" : ""}`}
                      onClick={() => selectShoppingFor(opt.id)}
                    >
                      <span className="shopping-for-emoji">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1 — Skin */}
            {step === 1 && (
              <div className="step-content">
                <h2>🧴 Tell us about your skin</h2>

                <div className="form-group">
                  <label>What is your skin type?</label>
                  <select
                    name="skinType"
                    aria-label="What is your skin type?"
                    value={formData.skinType}
                    onChange={handleChange}
                  >
                    <option value="">Select skin type</option>
                    <option value="oily">Oily</option>
                    <option value="dry">Dry</option>
                    <option value="combination">Combination</option>
                    <option value="normal">Normal</option>
                    <option value="sensitive">Sensitive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>What are your main skin concerns?</label>
                  <input
                    type="text"
                    name="skinConcerns"
                    placeholder="e.g. dark spots, acne, dryness, uneven tone"
                    value={formData.skinConcerns}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Age range</label>
                  <select
                    name="ageRange"
                    aria-label="Age range"
                    value={formData.ageRange}
                    onChange={handleChange}
                  >
                    <option value="">Prefer not to say</option>
                    {AGE_RANGES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="step-buttons">
                  <button className="btn-back-step" onClick={() => setStep(0)}>
                    ← Back
                  </button>
                  <button className="btn-next" onClick={() => setStep(2)}>
                    Next → {isBridal ? "Bridal Details" : "Hair Profile"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Hair (or Bridal Details) */}
            {step === 2 && !isBridal && (
              <div className="step-content">
                <h2>💆🏽‍♀️ Tell us about your hair</h2>

                <div className="form-group">
                  <label>What is your hair type?</label>
                  <select
                    name="hairType"
                    aria-label="What is your hair type?"
                    value={formData.hairType}
                    onChange={handleChange}
                  >
                    <option value="">Select hair type</option>
                    <option value="straight">Straight</option>
                    <option value="wavy">Wavy</option>
                    <option value="curly">Curly</option>
                    <option value="coily">Coily / 4C</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>What are your hair concerns?</label>
                  <input
                    type="text"
                    name="hairConcerns"
                    placeholder="e.g. hair loss, dryness, frizz, slow growth"
                    value={formData.hairConcerns}
                    onChange={handleChange}
                  />
                </div>

                <div className="step-buttons">
                  <button className="btn-back-step" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button className="btn-next" onClick={() => setStep(3)}>
                    Next → Your Goals
                  </button>
                </div>
              </div>
            )}

            {step === 2 && isBridal && (
              <div className="step-content">
                <h2>👰🏽 A few bridal details</h2>

                <div className="form-group">
                  <label>When's the big day?</label>
                  <input
                    type="date"
                    name="weddingDate"
                    aria-label="Wedding date"
                    value={formData.weddingDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>What's your bridal style?</label>
                  <input
                    type="text"
                    name="bridalStyle"
                    placeholder="e.g. natural glam, full glam, raw wig + lace front"
                    value={formData.bridalStyle}
                    onChange={handleChange}
                  />
                </div>

                <div className="step-buttons">
                  <button className="btn-back-step" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button className="btn-next" onClick={() => setStep(3)}>
                    Next → Your Budget
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Goals */}
            {step === 3 && (
              <div className="step-content">
                <h2>🎯 Last step</h2>

                <div className="form-group">
                  <label>What's your budget? (₦)</label>
                  <select
                    name="budget"
                    aria-label="What's your budget?"
                    value={formData.budget}
                    onChange={handleChange}
                  >
                    <option value="">Any budget</option>
                    <option value="under 10000">Under ₦10,000</option>
                    <option value="10000 to 50000">₦10,000 – ₦50,000</option>
                    <option value="50000 to 100000">₦50,000 – ₦100,000</option>
                    <option value="above 100000">Above ₦100,000</option>
                  </select>
                </div>

                {!isBridal && (
                  <div className="form-group">
                    <label>What's the occasion?</label>
                    <select
                      name="occasion"
                      aria-label="What's the occasion?"
                      value={formData.occasion}
                      onChange={handleChange}
                    >
                      <option value="">Select occasion</option>
                      <option value="everyday">Everyday</option>
                      <option value="special occasion">Special Occasion</option>
                      <option value="work or office">Work / Office</option>
                      <option value="vacation">Vacation</option>
                    </select>
                  </div>
                )}

                {error && <div className="recommend-error">⚠️ {error}</div>}

                <div className="step-buttons">
                  <button className="btn-back-step" onClick={() => setStep(2)}>
                    ← Back
                  </button>
                  <button
                    className="btn-submit"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading
                      ? "🤖 AI is thinking..."
                      : "✨ Get My Recommendations"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div className="results-section">
            <h2>✨ Your Personalized Picks</h2>
            <p className="results-subtitle">
              Based on your beauty profile, our AI recommends:
            </p>

            {/* Result tabs */}
            <div className="result-tabs">
              <button
                className={`result-tab ${resultTab === "picks" ? "active" : ""}`}
                onClick={() => handleResultTab("picks")}
              >
                🛍️ Shop The Picks
              </button>
              <button
                className={`result-tab ${resultTab === "routine" ? "active" : ""}`}
                onClick={() => handleResultTab("routine")}
              >
                📋 Your Routine
              </button>
            </div>

            {resultTab === "picks" && (
              <>
                <div className="results-grid">
                  {results.map((rec, index) => (
                    <div key={index} className="result-card">
                      <div className="result-image-wrapper">
                        <img
                          src={rec.product?.image}
                          alt={rec.product?.name}
                          className="result-image"
                        />
                        <span className="result-number">#{index + 1} Pick</span>
                      </div>
                      <div className="result-info">
                        <span className="result-category">
                          {rec.product?.category}
                        </span>
                        <h3>{rec.product?.name}</h3>
                        <p className="result-brand">by {rec.product?.brand}</p>
                        <div className="result-reason">
                          <p>
                            💬 <strong>Why this?</strong> {rec.reason}
                          </p>
                        </div>
                        <div className="result-tip">
                          <p>
                            💡 <strong>Pro tip:</strong> {rec.tip}
                          </p>
                        </div>
                        <div className="result-footer">
                          <span className="result-price">
                            {rec.product && formatPrice(rec.product?.price)}
                          </span>
                          <div className="result-actions">
                            <button
                              className="btn-add-to-bag-sm"
                              onClick={() => handleAddToBag(rec.product)}
                              disabled={!rec.product}
                            >
                              Add to Bag
                            </button>
                            <Link
                              to={`/products/${rec.product?._id}`}
                              className="btn-view-product"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {user ? (
                  saved ? (
                    <div className="save-success">
                      ✓ Saved to your account
                    </div>
                  ) : (
                    <button
                      className="btn-save-rec"
                      onClick={handleSaveRecommendation}
                    >
                      💾 Save These Recommendations
                    </button>
                  )
                ) : (
                  <div className="save-signup-prompt">
                    <p>Create a free account to save these picks for later.</p>
                    <Link to="/register" className="btn-signup-inline">
                      Save My Picks — Sign Up Free
                    </Link>
                  </div>
                )}
              </>
            )}

            {resultTab === "routine" && (
              <div className="routine-tab-panel">
                {routineLoading && (
                  <p className="routine-loading">🤖 Building your routine...</p>
                )}
                {routineError && (
                  <div className="recommend-error">⚠️ {routineError}</div>
                )}
                {routine && (
                  <>
                    <div className="rg-result-meta" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
                      <span>💰 {routine.estimatedMonthlyBudget}</span>
                      <span>📊 {routine.routineComplexity} level</span>
                    </div>
                    <div className="rg-tabs">
                      <button
                        className={`rg-tab ${routineTab === "morning" ? "active" : ""}`}
                        onClick={() => setRoutineTab("morning")}
                      >
                        ☀️ Morning ({routine.morningRoutine?.length || 0})
                      </button>
                      <button
                        className={`rg-tab ${routineTab === "night" ? "active" : ""}`}
                        onClick={() => setRoutineTab("night")}
                      >
                        🌙 Night ({routine.nightRoutine?.length || 0})
                      </button>
                      <button
                        className={`rg-tab ${routineTab === "weekly" ? "active" : ""}`}
                        onClick={() => setRoutineTab("weekly")}
                      >
                        📅 Weekly ({routine.weeklyTreatments?.length || 0})
                      </button>
                    </div>
                    <div className="rg-steps-list">
                      {(currentRoutineSteps || []).map((s, i) => (
                        <RoutineStepCard key={i} step={s} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              className="btn-retry"
              onClick={() => {
                setResults(null);
                setStep(0);
              }}
            >
              ← Edit My Answers
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Recommend;
