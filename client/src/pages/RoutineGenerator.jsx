import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../config";
import "../styles/RoutineGenerator.css";

const SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive"];
const AGE_RANGES = ["Teens (13-19)", "20s", "30s", "40s", "50+"];
const CONCERNS = [
  "Acne & Breakouts",
  "Dark Spots",
  "Anti-Aging",
  "Brightening",
  "Hydration",
  "Large Pores",
  "Redness",
  "Uneven Tone",
];
const BUDGETS = [
  "Budget (under ₦5,000/product)",
  "Moderate (₦5k-₦15k)",
  "Premium (₦15k+)",
];

function StepCard({ step, index }) {
  return (
    <div className="rg-step-card">
      <div className="rg-step-number">{step.step}</div>
      <div className="rg-step-content">
        <div className="rg-step-header">
          <strong>{step.type}</strong>
          {step.frequency && (
            <span className="rg-step-freq">{step.frequency}</span>
          )}
        </div>
        <p className="rg-step-instruction">{step.instruction}</p>
        {step.why && <p className="rg-step-why">💡 {step.why}</p>}
        {step.tip && <p className="rg-step-tip">✦ {step.tip}</p>}

        {step.product ? (
          <Link
            to={`/products/${step.product._id}`}
            className="rg-step-product"
          >
            <img
              src={step.product.image}
              alt={step.product.name}
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&h=80&fit=crop";
              }}
            />
            <div>
              <span>{step.product.name}</span>
              <span className="rg-step-price">
                ₦{step.product.price?.toLocaleString()}
              </span>
            </div>
            <span className="rg-step-shop">Shop →</span>
          </Link>
        ) : step.productName ? (
          <div className="rg-step-suggestion">
            🛍️ Look for: <em>{step.productName}</em>
            <Link to="/products" className="rg-browse-link">
              Browse Products →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RoutineGenerator({ onCartOpen }) {
  const [form, setForm] = useState({
    skinType: "",
    ageRange: "",
    concerns: [],
    budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("morning");

  const toggleConcern = (c) => {
    setForm((f) => ({
      ...f,
      concerns: f.concerns.includes(c)
        ? f.concerns.filter((x) => x !== c)
        : [...f.concerns, c],
    }));
  };

  const handleGenerate = async () => {
    if (!form.skinType) return setError("Please select your skin type");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/routine/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
      setActiveTab("morning");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Failed to generate routine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentSteps = result?.routine
    ? activeTab === "morning"
      ? result.routine.morningRoutine
      : activeTab === "night"
        ? result.routine.nightRoutine
        : result.routine.weeklyTreatments
    : [];

  return (
    <>
      <Navbar onCartOpen={onCartOpen} />
      <div className="routine-generator">
        {!result ? (
          /* ── Input form ── */
          <>
            <div className="rg-header">
              <span className="rg-badge">✦ AI-Powered</span>
              <h1>AI Routine Generator</h1>
              <p>
                Tell us about your skin and we'll build your perfect morning and
                night routine with products from our store.
              </p>
            </div>

            <div className="rg-form-card">
              {error && <div className="rg-error">⚠️ {error}</div>}

              {/* Skin Type */}
              <div className="rg-field">
                <label>What's your skin type? *</label>
                <div className="rg-options-row">
                  {SKIN_TYPES.map((s) => (
                    <button
                      key={s}
                      className={`rg-option-btn ${form.skinType === s.toLowerCase() ? "active" : ""}`}
                      onClick={() =>
                        setForm((f) => ({ ...f, skinType: s.toLowerCase() }))
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age range */}
              <div className="rg-field">
                <label>Age range</label>
                <div className="rg-options-row">
                  {AGE_RANGES.map((a) => (
                    <button
                      key={a}
                      className={`rg-option-btn ${form.ageRange === a ? "active" : ""}`}
                      onClick={() => setForm((f) => ({ ...f, ageRange: a }))}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concerns (multi-select) */}
              <div className="rg-field">
                <label>Main skin concerns (pick all that apply)</label>
                <div className="rg-options-row">
                  {CONCERNS.map((c) => (
                    <button
                      key={c}
                      className={`rg-option-btn ${form.concerns.includes(c) ? "active" : ""}`}
                      onClick={() => toggleConcern(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="rg-field">
                <label>Budget per product</label>
                <div className="rg-options-row">
                  {BUDGETS.map((b) => (
                    <button
                      key={b}
                      className={`rg-option-btn ${form.budget === b ? "active" : ""}`}
                      onClick={() => setForm((f) => ({ ...f, budget: b }))}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="rg-generate-btn"
                onClick={handleGenerate}
                disabled={loading || !form.skinType}
              >
                {loading ? (
                  <>
                    <span className="rg-spinner" />
                    Building Your Routine...
                  </>
                ) : (
                  "✨ Generate My Routine"
                )}
              </button>
            </div>
          </>
        ) : (
          /* ── Results ── */
          <>
            <div className="rg-result-header">
              <h1>Your Personalised Routine ✨</h1>
              <p>
                Built for <strong>{result.profile.skinType}</strong> skin
                {result.profile.ageRange ? ` · ${result.profile.ageRange}` : ""}
                {result.profile.concerns?.length > 0
                  ? ` · ${result.profile.concerns.slice(0, 2).join(", ")}`
                  : ""}
              </p>
              <div className="rg-result-meta">
                <span>💰 {result.routine.estimatedMonthlyBudget}</span>
                <span>📊 {result.routine.routineComplexity} level</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="rg-tabs">
              <button
                className={`rg-tab ${activeTab === "morning" ? "active" : ""}`}
                onClick={() => setActiveTab("morning")}
              >
                ☀️ Morning ({result.routine.morningRoutine?.length || 0} steps)
              </button>
              <button
                className={`rg-tab ${activeTab === "night" ? "active" : ""}`}
                onClick={() => setActiveTab("night")}
              >
                🌙 Night ({result.routine.nightRoutine?.length || 0} steps)
              </button>
              <button
                className={`rg-tab ${activeTab === "weekly" ? "active" : ""}`}
                onClick={() => setActiveTab("weekly")}
              >
                📅 Weekly ({result.routine.weeklyTreatments?.length || 0} steps)
              </button>
            </div>

            {/* Steps */}
            <div className="rg-steps-list">
              {(currentSteps || []).map((step, i) => (
                <StepCard key={i} step={step} index={i} />
              ))}
            </div>

            {/* General tips */}
            {result.routine.generalTips?.length > 0 && (
              <div className="rg-tips-card">
                <h3>💡 General Tips for Your Skin</h3>
                <ul>
                  {result.routine.generalTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="rg-actions">
              <button
                className="rg-regenerate-btn"
                onClick={() => setResult(null)}
              >
                ↩ Edit Profile & Regenerate
              </button>
              <Link to="/products?category=skincare" className="rg-shop-btn">
                🛍️ Shop Skincare Products →
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default RoutineGenerator;
