import { Link } from "react-router-dom";
import "./DifferenceSection.css";

function DifferenceSection() {
  return (
    <section className="diff-section" aria-label="The Gracia Fab Difference">
      <div className="diff-inner">
        {/* Left Macro Visual */}
        <div className="diff-visual">
          <div className="diff-img-card">
            <img
              src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=1000&fit=crop&crop=center"
              alt="Raw Virgin Hair and Skincare Macro"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=1000&fit=crop";
              }}
            />
            <div className="diff-floating-pill">
              <span className="diff-pill-icon">👑</span>
              <div>
                <strong>Single-Donor Quality</strong>
                <small>Grade 12A Raw Virgin Hair</small>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="diff-content">
          <span className="diff-eyebrow">OUR CRAFTSMANSHIP</span>
          <h2 className="diff-title">The Gracia Fab Difference</h2>
          <p className="diff-intro">
            We don't do synthetic shortcuts or generic formulations. Every wig, bundle, and skincare item is engineered for durability, effortless styling, and radiant health in Nigeria's climate.
          </p>

          <div className="diff-pillars">
            <div className="diff-pillar">
              <div className="diff-pillar-icon">🌿</div>
              <div className="diff-pillar-text">
                <h4>100% Raw Cuticle-Aligned Hair</h4>
                <p>
                  Zero silicon coatings or acid baths. Can be bleached to blonde (#613), permed, or dyed while retaining natural bounce and longevity for 3+ years.
                </p>
              </div>
            </div>

            <div className="diff-pillar">
              <div className="diff-pillar-icon">🔬</div>
              <div className="diff-pillar-text">
                <h4>AI-Powered Melanin Skincare</h4>
                <p>
                  Formulated specifically for melanin-rich complexions. Lightweight, non-comedogenic serums that hydrate without greasiness in humid weather.
                </p>
              </div>
            </div>

            <div className="diff-pillar">
              <div className="diff-pillar-icon">✨</div>
              <div className="diff-pillar-text">
                <h4>Real HD Melt &amp; Pre-Plucked Lace</h4>
                <p>
                  Ultra-thin Swiss HD lace that dissolves seamlessly into all undertones, paired with pre-plucked hairlines for that scalp-like illusion.
                </p>
              </div>
            </div>
          </div>

          <div className="diff-action">
            <Link to="/about" className="diff-cta">
              Explore Our Standards →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DifferenceSection;
