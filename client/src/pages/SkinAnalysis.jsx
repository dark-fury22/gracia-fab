import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PhotoUpload from "../components/PhotoUpload";
import API_URL from "../config";
import "../styles/SkinAnalysis.css";

const SEVERITY_COLOR = {
  none: "var(--success)",
  mild: "#F0A500",
  moderate: "#E55A00",
  visible: "var(--error)",
};

const CONCERN_LABELS = {
  acne: { label: "Acne & Breakouts", emoji: "🔴" },
  darkSpots: { label: "Dark Spots", emoji: "🟤" },
  oiliness: { label: "Excess Oil", emoji: "✨" },
  dryness: { label: "Dryness", emoji: "💧" },
  unevenTone: { label: "Uneven Skin Tone", emoji: "🎨" },
  redness: { label: "Redness", emoji: "🌸" },
};

const OVERALL_LABELS = {
  great: { label: "Great Skin!", color: "var(--success)", emoji: "🌟" },
  good: { label: "Good Condition", color: "#4A8B5E", emoji: "✅" },
  fair: { label: "Fair Condition", color: "#F0A500", emoji: "👍" },
  needs_attention: {
    label: "Needs Some Care",
    color: "var(--accent)",
    emoji: "💡",
  },
};

function SkinAnalysis({ onCartOpen }) {
  const [countdown, setCountdown] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState("upload");

  // Compress image aggressively before sending to server
  // Target: under 500KB regardless of original size
  const resizeAndCompress = (dataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Step 1: Calculate target size
          // Max dimension 600px — enough for AI analysis
          const MAX_DIMENSION = 600;
          const scale = Math.min(
            MAX_DIMENSION / img.width,
            MAX_DIMENSION / img.height,
            1, // never upscale
          );

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(img.width * scale);
          canvas.height = Math.floor(img.height * scale);

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Step 2: Start with 70% quality JPEG
          let quality = 0.7;
          let dataResult = canvas.toDataURL("image/jpeg", quality);

          // Step 3: Keep reducing quality until under 400KB
          // 400KB in base64 ≈ 533KB raw ≈ safe for 10mb limit
          const TARGET_SIZE = 400 * 1024; // 400KB in characters

          while (dataResult.length > TARGET_SIZE && quality > 0.2) {
            quality -= 0.1;
            dataResult = canvas.toDataURL("image/jpeg", quality);
          }

          console.log(
            `📸 Image compressed: ${Math.round(dataResult.length / 1024)}KB at quality ${Math.round(quality * 100)}%`,
          );
          resolve(dataResult);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = dataUrl;
    });
  };

  const handlePhotoSelected = async (url) => {
    setPhoto(url);
    setError("");
    setStep("ready");
  };

  const runAnalysis = async () => {
    if (!photo) return;
    setStep("analysing");
    setLoading(true);
    setError("");

    let data = null;
    try {
      const token = localStorage.getItem("token");

      // Compress before sending
      const compressed = await resizeAndCompress(photo);

      // Remove the data:image/jpeg;base64, prefix — only send raw base64
      const base64 = compressed.replace(/^data:image\/[a-z]+;base64,/, "");
      const mimeType = "image/jpeg";

      console.log(`📤 Sending ${Math.round(base64.length / 1024)}KB to server`);

      const response = await fetch(`${API_URL}/api/skin-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (response.status === 413) {
        throw new Error(
          "Photo is still too large. Please try a smaller image.",
        );
      }

      data = await response.json();
      if (!response.ok) throw new Error(data.message || "Analysis failed");

      setResult(data);
      setStep("result");
    } catch (err) {
      if (
        err.message?.toLowerCase().includes("wait") ||
        err.message?.toLowerCase().includes("busy")
      ) {
        // Start countdown for rate limiting
        setError(err.message);

        let secs = (data && data.retryAfter) || 60;
        setCountdown(secs);

        const timer = setInterval(() => {
          secs--;

          setCountdown(secs);

          if (secs <= 0) {
            clearInterval(timer);
            setCountdown(0);
            setError("");
          }
        }, 1000);
      } else {
        setError(
          err.message ||
            "Analysis failed. Please try again with a clearer photo.",
        );
      }

      setStep("ready");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhoto(null);
    setResult(null);
    setStep("upload");
    setError("");
  };

  const overall = result?.analysis
    ? OVERALL_LABELS[result.analysis.overallCondition] || OVERALL_LABELS.fair
    : null;

  return (
    <>
      <Navbar onCartOpen={onCartOpen} />
      <div className="skin-analysis-page">
        {/* Hero header */}
        <div className="sa-header">
          <span className="sa-badge">✦ AI-Powered</span>
          <h1>AI Skin Analysis</h1>
          <p>
            Upload a selfie and our AI analyses your skin to recommend the
            perfect products for your concerns.
          </p>
          <div className="sa-disclaimer">
            ⚕️ For cosmetic product guidance only — not a medical diagnosis.
            Consult a dermatologist for medical concerns.
          </div>
        </div>

        {/* Upload step */}
        {(step === "upload" || step === "ready") && (
          <div className="sa-upload-section">
            {error && (
              <div className="sa-error">
                ⚠️ {error}
                {countdown > 0 && (
                  <div className="sa-countdown">
                    Retry available in {countdown}s...
                    <div
                      className="sa-countdown-bar"
                      style={{
                        width: `${(countdown / 60) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {!photo ? (
              <div className="sa-upload-zone">
                <div className="sa-upload-icon">🤳</div>
                <h2>Upload Your Selfie</h2>
                <p>
                  For best results: face the camera directly in natural light,
                  no filters
                </p>
                <PhotoUpload
                  label="Add Selfie for Analysis"
                  onPhotoSelected={handlePhotoSelected}
                />
              </div>
            ) : (
              <div className="sa-preview-section">
                <img
                  src={photo}
                  alt="Your selfie"
                  className="sa-preview-photo"
                />
                <div className="sa-preview-actions">
                  <h3>Photo ready for analysis!</h3>
                  <p>
                    Our AI will analyse your skin concerns and recommend
                    products.
                  </p>
                  <button
                    className="sa-analyse-btn"
                    onClick={runAnalysis}
                    disabled={loading || countdown > 0}
                  >
                    {loading
                      ? "🔬 Analysing..."
                      : countdown > 0
                        ? `⏳ Please wait ${countdown}s...`
                        : "🔬 Analyse My Skin"}
                  </button>
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="sa-how-it-works">
              <h3>How It Works</h3>
              <div className="sa-steps">
                {[
                  {
                    icon: "📸",
                    title: "Upload Selfie",
                    desc: "Take or upload a clear face photo",
                  },
                  {
                    icon: "🤖",
                    title: "AI Analysis",
                    desc: "Claude AI scans for 6 skin concerns",
                  },
                  {
                    icon: "✨",
                    title: "Get Results",
                    desc: "See your skin profile instantly",
                  },
                  {
                    icon: "🛍️",
                    title: "Shop Smarter",
                    desc: "Products matched to your skin",
                  },
                ].map((s, i) => (
                  <div key={i} className="sa-step">
                    <div className="sa-step-icon">{s.icon}</div>
                    <strong>{s.title}</strong>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analysing */}
        {step === "analysing" && (
          <div className="sa-analysing">
            <img
              src={photo}
              alt="Analysing..."
              className="sa-analysing-photo"
            />
            <div className="sa-analysing-content">
              <div className="sa-analysing-spinner" />
              <h3>Analysing Your Skin...</h3>
              <p>Our AI is scanning for acne, dark spots, oiliness, and more</p>
              <div className="sa-analysing-steps">
                {[
                  "Reading skin texture...",
                  "Detecting concerns...",
                  "Matching products...",
                ].map((s, i) => (
                  <div key={i} className="sa-analysing-step">
                    <div
                      className="sa-analysing-dot"
                      style={{ animationDelay: `${i * 0.4}s` }}
                    />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {step === "result" && result && (
          <div className="sa-results">
            {/* Overall badge */}
            <div className="sa-overall" style={{ borderColor: overall.color }}>
              <span className="sa-overall-emoji">{overall.emoji}</span>
              <div>
                <h2>{overall.label}</h2>
                <p>{result.analysis.generalAdvice}</p>
              </div>
              <div className="sa-skin-type-chip">
                {result.analysis.detectedSkinType} skin
              </div>
            </div>

            {/* Concerns grid */}
            <div className="sa-concerns-section">
              <h3>Skin Analysis Results</h3>
              <div className="sa-concerns-grid">
                {Object.entries(result.analysis.concerns || {}).map(
                  ([key, val]) => {
                    const label = CONCERN_LABELS[key];
                    if (!label) return null;
                    return (
                      <div
                        key={key}
                        className={`sa-concern-card ${val.detected ? "detected" : ""}`}
                      >
                        <div className="sa-concern-top">
                          <span className="sa-concern-emoji">
                            {label.emoji}
                          </span>
                          <span className="sa-concern-label">
                            {label.label}
                          </span>
                          <span
                            className="sa-concern-badge"
                            style={{ color: SEVERITY_COLOR[val.severity] }}
                          >
                            {val.severity === "none" ? "✓ Clear" : val.severity}
                          </span>
                        </div>
                        {val.detected && val.note && (
                          <p className="sa-concern-note">{val.note}</p>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Recommended products */}
            {result.products?.length > 0 && (
              <div className="sa-products-section">
                <h3>🛍️ Recommended for Your Skin</h3>
                <p className="sa-products-sub">
                  Products matched to your analysis results
                </p>
                <div className="sa-products-grid">
                  {result.products.map((p) => (
                    <Link
                      key={p._id}
                      to={`/products/${p._id}`}
                      className="sa-product-card"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop";
                        }}
                      />
                      <div className="sa-product-info">
                        <span className="sa-product-category">
                          {p.category}
                        </span>
                        <p className="sa-product-name">{p.name}</p>
                        <p className="sa-product-price">
                          ₦{p.price?.toLocaleString()}
                        </p>
                        <span className="sa-product-cta">View Product →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="sa-result-actions">
              <button className="sa-btn-retry" onClick={reset}>
                📸 Analyse Another Photo
              </button>
              <Link to="/routine-generator" className="sa-btn-routine">
                ✨ Generate My Skincare Routine →
              </Link>
            </div>

            {/* Disclaimer */}
            <div className="sa-result-disclaimer">
              ⚕️ {result.analysis.disclaimer}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default SkinAnalysis;
