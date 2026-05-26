import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config";
import "./SkinToneDetector.css";

// ── Skin tone definitions ──────────────────
const SKIN_TONES = [
  {
    id: "fair",
    label: "Fair",
    emoji: "🌸",
    hex: "#FDDBB4",
    description: "Porcelain to pale — tends to burn easily in the sun.",
    tips: [
      "Use SPF 50+ every single day",
      "Look for lightweight, non-comedogenic formulas",
      "Hyaluronic acid and gentle AHAs work well",
      "Avoid heavy, oil-based foundations",
    ],
    searchQuery: "lightweight moisturiser sensitive skin",
  },
  {
    id: "light",
    label: "Light",
    emoji: "🌼",
    hex: "#F5C89A",
    description: "Light beige to warm ivory — burns sometimes, tans slowly.",
    tips: [
      "SPF 30–50 daily is essential",
      "Vitamin C serum helps maintain even tone",
      "Gentle exfoliation 2x weekly prevents dullness",
      'Look for "light to medium" shade foundations',
    ],
    searchQuery: "brightening vitamin c serum",
  },
  {
    id: "medium",
    label: "Medium",
    emoji: "✨",
    hex: "#D4A574",
    description: "Golden to olive — tans easily, rarely burns.",
    tips: [
      "SPF 30 daily keeps hyperpigmentation away",
      "Niacinamide controls oil and evens tone",
      "Chemical exfoliants work beautifully on this tone",
      "Warm-toned products complement your undertone",
    ],
    searchQuery: "niacinamide toner oily skin",
  },
  {
    id: "tan",
    label: "Tan",
    emoji: "🌻",
    hex: "#B8834A",
    description: "Warm caramel — rich melanin, tans deeply.",
    tips: [
      "SPF is critical — melanin does NOT fully protect from UV",
      "Kojic acid and vitamin C fade dark spots gently",
      "Avoid harsh physical scrubs that cause inflammation",
      "Look for hydrating formulas with glycerin and shea",
    ],
    searchQuery: "dark spot treatment hyperpigmentation",
  },
  {
    id: "deep",
    label: "Deep",
    emoji: "🌹",
    hex: "#8B5E3C",
    description: "Rich chocolate — beautiful deep melanin, prone to ashy skin.",
    tips: [
      "Daily SPF protects against PIH (post-inflammatory marks)",
      "Shea butter and plant oils prevent ashiness",
      "Retinol (start slow) improves texture and evenness",
      "Avoid alcohol-heavy products that cause dryness",
    ],
    searchQuery: "shea butter moisturiser dry skin",
  },
  {
    id: "rich",
    label: "Rich",
    emoji: "💎",
    hex: "#4A2C1A",
    description: "Ebony — the deepest, most melanin-rich complexion.",
    tips: [
      "Rich oils like argan, jojoba, and marula are your best friends",
      "Glycolic acid gently exfoliates without over-drying",
      "Heavy-duty moisturisers prevent ashiness",
      "Vitamin C is a game-changer for radiance and even tone",
    ],
    searchQuery: "glow serum radiance dark skin",
  },
];

// ── RGB → Lab colour space conversion ──
const rgbToLab = (r, g, b) => {
  // Normalize to 0-1
  let R = r / 255;
  let G = g / 255;
  let B = b / 255;

  // Gamma correction
  R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
  G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
  B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;

  // Convert to XYZ (D65 illuminant)
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const Y = (R * 0.2126 + G * 0.7152 + B * 0.0722) / 1.0;
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;

  const f = (v) => (v > 0.008856 ? Math.pow(v, 1 / 3) : 7.787 * v + 16 / 116);

  const L = 116 * f(Y) - 16;
  const a = 500 * (f(X) - f(Y));
  const bVal = 200 * (f(Y) - f(Z));

  return { L, a, b: bVal };
};

// ── Calculate ITA angle (Individual Typology Angle) ──
// ITA > 55 = Very Light, ITA < -30 = Very Dark
const getITA = (L, b) => {
  return Math.atan((L - 50) / b) * (180 / Math.PI);
};

// ── Map ITA to skin tone ──
const itaToTone = (ita) => {
  if (ita > 55) return "fair";
  if (ita > 41) return "light";
  if (ita > 28) return "medium";
  if (ita > 10) return "tan";
  if (ita > -30) return "deep";
  return "rich";
};

// ── Analyse image pixels ──
const analyseImage = (img) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const SIZE = 200;
    canvas.width = SIZE;
    canvas.height = SIZE;

    img.onload = () => {
      try {
        // Draw image scaled to 200×200
        ctx.drawImage(img, 0, 0, SIZE, SIZE);

        // Sample a 60×60 region in the centre (likely the face)
        const startX = Math.floor(SIZE * 0.3);
        const startY = Math.floor(SIZE * 0.25);
        const region = 60;

        const data = ctx.getImageData(startX, startY, region, region).data;

        let totalL = 0;
        let totalB = 0;
        let samples = 0;

        // Sample every 4th pixel for speed
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a < 128) continue; // skip transparent pixels

          // Only sample skin-like pixels (exclude very dark/bright backgrounds)
          const brightness = (r + g + b) / 3;
          if (brightness < 30 || brightness > 240) continue;

          const lab = rgbToLab(r, g, b);
          totalL += lab.L;
          totalB += lab.b;
          samples++;
        }

        if (samples === 0) {
          reject(new Error("Could not detect skin in image"));
          return;
        }

        const avgL = totalL / samples;
        const avgB = totalB / samples;
        const ita = getITA(avgL, avgB || 1);
        const toneId = itaToTone(ita);

        resolve({
          toneId,
          ita: Math.round(ita * 10) / 10,
          avgL: Math.round(avgL),
          samples,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error("Image failed to load"));
  });
};

function SkinToneDetector() {
  const fileInputRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [step, setStep] = useState("upload"); // 'upload' | 'analysing' | 'result'

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)");
      return;
    }

    const url = URL.createObjectURL(file);
    setPhoto(url);
    setError("");
    runAnalysis(url);
  }, []);

  const runAnalysis = useCallback(async (photoUrl) => {
    setStep("analysing");
    setLoading(true);
    setError("");

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = photoUrl;

      const analysis = await analyseImage(img);
      const tone = SKIN_TONES.find((t) => t.id === analysis.toneId);

      setResult({ ...analysis, tone });
      setStep("result");

      // Fetch recommended products
      try {
        const res = await fetch(`${API_URL}/api/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: tone.searchQuery }),
        });
        const data = await res.json();
        setProducts((data.results || []).slice(0, 3));
      } catch {
        setProducts([]);
      }
    } catch (err) {
      setError(
        "Could not analyse image. Please try a clearer photo facing forward.",
      );
      setStep("upload");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setPhoto(null);
    setResult(null);
    setStep("upload");
    setError("");
    setProducts([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="skin-detector">
      {/* Header */}
      <div className="skin-detector-header">
        <h1>✨ Skin Tone Detector</h1>
        <p>
          Upload a selfie and our AI analyses your skin tone to recommend the
          perfect products for your complexion.
        </p>
      </div>

      {/* Upload step */}
      {step === "upload" && (
        <div className="skin-upload-area">
          {error && <div className="skin-error">⚠️ {error}</div>}

          <div
            className="skin-dropzone"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="skin-dropzone-icon">📸</div>
            <h3>Upload Your Selfie</h3>
            <p>Face the camera straight-on, in good lighting</p>
            <span className="skin-dropzone-btn">Choose Photo</span>
            <p className="skin-dropzone-note">
              Your photo is processed locally — never sent to any server
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {/* Tips for best results */}
          <div className="skin-tips-box">
            <h4>📷 Tips for accurate results</h4>
            <ul>
              <li>Face the camera directly</li>
              <li>Use natural daylight if possible</li>
              <li>Remove glasses and heavy filters</li>
              <li>Make sure your face fills most of the frame</li>
            </ul>
          </div>
        </div>
      )}

      {/* Analysing */}
      {step === "analysing" && (
        <div className="skin-analysing">
          {photo && (
            <img src={photo} alt="Your selfie" className="skin-preview-img" />
          )}
          <div className="skin-analysing-loader">
            <div className="skin-spinner" />
            <p>Analysing your skin tone...</p>
          </div>
        </div>
      )}

      {/* Result */}
      {step === "result" && result && (
        <div className="skin-result">
          {/* Side by side: photo + result */}
          <div className="skin-result-top">
            <img src={photo} alt="Your selfie" className="skin-result-photo" />

            <div className="skin-result-info">
              <div className="skin-tone-chip">
                <div
                  className="skin-tone-swatch"
                  style={{ background: result.tone.hex }}
                />
                <div>
                  <h2>
                    {result.tone.emoji} {result.tone.label} Skin Tone
                  </h2>
                  <p>{result.tone.description}</p>
                </div>
              </div>

              {/* Tone scale */}
              <div className="skin-tone-scale">
                {SKIN_TONES.map((t, i) => (
                  <div
                    key={t.id}
                    className={`skin-scale-dot ${t.id === result.toneId ? "active" : ""}`}
                    style={{ background: t.hex }}
                    title={t.label}
                  >
                    {t.id === result.toneId && (
                      <span className="skin-scale-pointer">▼</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="skin-scale-labels">
                <span>Fair</span>
                <span>Rich</span>
              </div>
            </div>
          </div>

          {/* Skincare tips */}
          <div className="skin-result-tips">
            <h3>💡 Skincare Tips for Your Tone</h3>
            <ul>
              {result.tone.tips.map((tip, i) => (
                <li key={i}>
                  <span className="tip-bullet">✦</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Product recommendations */}
          {products.length > 0 && (
            <div className="skin-result-products">
              <h3>🛍️ Recommended for Your Skin Tone</h3>
              <div className="skin-products-grid">
                {products.map((p) => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    className="skin-product-card"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop";
                      }}
                    />
                    <div className="skin-product-info">
                      <p className="skin-product-name">{p.name}</p>
                      <p className="skin-product-price">
                        ₦{p.price?.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/recommend" className="skin-ai-cta">
                ✦ Get full AI routine for your skin →
              </Link>
            </div>
          )}

          {/* Action buttons */}
          <div className="skin-result-actions">
            <button className="skin-btn-retry" onClick={reset}>
              📸 Try Another Photo
            </button>
            <Link to="/products" className="skin-btn-shop">
              🛍️ Shop for My Skin
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkinToneDetector;
