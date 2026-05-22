import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Recommend.css";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";
import config from "../config";

const steps = ["About Your Skin", "About Your Hair", "Your Goals"];

function Recommend() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth(); // ← add this line
  const navigate = useNavigate(); // make sure this exists too

  <SEO
    title="AI Beauty Recommendations"
    description="Get personalized beauty recommendations from Gracia Fab's AI advisor. Tell us about your skin, hair and goals for custom product picks."
    keywords="AI beauty advisor Nigeria, personalized skincare, hair recommendations"
    url="/recommend"
  />;

  const [formData, setFormData] = useState({
    skinType: "",
    skinConcerns: "",
    hairType: "",
    hairConcerns: "",
    lookingFor: "",
    budget: "",
    occasion: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("${config.API_URL}/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setResults(data.recommendations);
    } catch (err) {
      setError("Failed to get recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <>
      <Navbar />
      <div className="recommend-page">
        {/* Header */}
        <div className="recommend-header">
          <h1>Get Your Beauty Recommendations ✨</h1>
          <p>
            Answer a few quick questions and our AI will find your perfect
            products
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

            {/* Step 1 — Skin */}
            {step === 0 && (
              <div className="step-content">
                <h2>🧴 Tell us about your skin</h2>

                <div className="form-group">
                  <label>What is your skin type?</label>
                  <select
                    name="skinType"
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

                <button className="btn-next" onClick={() => setStep(1)}>
                  Next → Hair Profile
                </button>
              </div>
            )}

            {/* Step 2 — Hair */}
            {step === 1 && (
              <div className="step-content">
                <h2>💆🏽‍♀️ Tell us about your hair</h2>

                <div className="form-group">
                  <label>What is your hair type?</label>
                  <select
                    name="hairType"
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
                  <button className="btn-back-step" onClick={() => setStep(0)}>
                    ← Back
                  </button>
                  <button className="btn-next" onClick={() => setStep(2)}>
                    Next → Your Goals
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Goals */}
            {step === 2 && (
              <div className="step-content">
                <h2>🎯 What are you looking for?</h2>

                <div className="form-group">
                  <label>What are you shopping for?</label>
                  <select
                    name="lookingFor"
                    value={formData.lookingFor}
                    onChange={handleChange}
                  >
                    <option value="">Select category</option>
                    <option value="skincare products">Skincare Products</option>
                    <option value="haircare products">Haircare Products</option>
                    <option value="wig or hairstyle">Wig or Hairstyle</option>
                    <option value="bridal beauty">Bridal Beauty</option>
                    <option value="everything">
                      Everything — Surprise me!
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>What's your budget? (₦)</label>
                  <select
                    name="budget"
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

                <div className="form-group">
                  <label>What's the occasion?</label>
                  <select
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleChange}
                  >
                    <option value="">Select occasion</option>
                    <option value="everyday">Everyday</option>
                    <option value="special occasion">Special Occasion</option>
                    <option value="wedding or bridal">Wedding / Bridal</option>
                    <option value="work or office">Work / Office</option>
                    <option value="vacation">Vacation</option>
                  </select>
                </div>

                {error && <div className="recommend-error">⚠️ {error}</div>}

                <div className="step-buttons">
                  <button className="btn-back-step" onClick={() => setStep(1)}>
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
                        {rec.product && formatPrice(rec.product.price)}
                      </span>
                      <Link
                        to={`/products/${rec.product?._id}`}
                        className="btn-view-product"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add this Save button after the results grid */}
            <button
              className="btn-save-rec"
              onClick={async () => {
                if (!user) return navigate("/login");
                try {
                  const token = localStorage.getItem("token");
                  await fetch(
                    "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wishlist/recommendations/save",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        profile: formData,
                        productIds: results.map((r) => r.product._id),
                      }),
                    },
                  );
                  alert("Recommendations saved to your wishlist! 💖");
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              💾 Save These Recommendations
            </button>

            <button
              className="btn-retry"
              onClick={() => {
                setResults(null);
                setStep(0);
              }}
            >
              🔄 Start Over
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Recommend;
