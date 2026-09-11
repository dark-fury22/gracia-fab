import { useState } from "react";
import { Link } from "react-router-dom";
import "./TextureShowcase.css";

const textures = [
  {
    id: "straight",
    name: "Bone Straight",
    tagline: "Mirror-Sleek & Zero Frizz",
    desc: "Single donor raw hair with 100% aligned cuticles. Holds heat styling and stays pin-straight even in humid coastal weather.",
    img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=800&fit=crop&crop=center",
    spec: "30-Day Heat Memory · Grade 12A Raw",
    category: "wig",
  },
  {
    id: "body-wave",
    name: "Body Wave",
    tagline: "Voluminous Bouncy Waves",
    desc: "Naturally steamed deep S-pattern that bounces back after washing. Easy to flat-iron straight or amplify with wand curls.",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=800&fit=crop&crop=center",
    spec: "Natural High Density · Unprocessed",
    category: "haircare",
  },
  {
    id: "curly",
    name: "Deep Wave & Curly",
    tagline: "Rich Coils & Defined Hydration",
    desc: "Full-bodied texture designed to blend seamlessly with afro and textured leave-outs. Wet-and-go definition with minimal shedding.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=center",
    spec: "Maximum Fullness · Low Maintenance",
    category: "wig",
  },
];

function TextureShowcase() {
  const [activeTexture, setActiveTexture] = useState("straight");

  return (
    <section className="texture-section" aria-label="Texture Showcase">
      <div className="texture-inner">
        <div className="texture-header">
          <span className="texture-eyebrow">Texture Guide</span>
          <h2>Explore Signature Textures</h2>
          <p>
            From pin-straight glass hair to rich defined waves — crafted from 100% single-donor virgin strands.
          </p>
        </div>

        <div className="texture-grid">
          {textures.map((item) => (
            <div
              key={item.id}
              className={`texture-card ${activeTexture === item.id ? "active" : ""}`}
              onClick={() => setActiveTexture(item.id)}
            >
              <div className="texture-img-wrap">
                <img
                  src={item.img}
                  alt={item.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop";
                  }}
                />
                <div className="texture-badge">{item.name}</div>
                <div className="texture-overlay">
                  <span className="texture-spec">{item.spec}</span>
                </div>
              </div>

              <div className="texture-info">
                <h3>{item.name}</h3>
                <p className="texture-tagline">{item.tagline}</p>
                <p className="texture-desc">{item.desc}</p>
                <Link
                  to={`/products?category=${item.category}`}
                  className="texture-btn"
                >
                  Shop This Texture →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TextureShowcase;
