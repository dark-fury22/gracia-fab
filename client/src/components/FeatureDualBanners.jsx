import { Link } from "react-router-dom";
import "./FeatureDualBanners.css";

function FeatureDualBanners() {
  return (
    <section className="dual-banners-section" aria-label="Personalized Services">
      <div className="dual-banners-inner">
        <div className="dual-card dual-card-quiz">
          <span className="dual-card-eyebrow">✦ SMART ADVISOR</span>
          <h3>Find Your Signature Style</h3>
          <p>
            Unsure which lace tint or hair texture matches your undertone? Take our 60-second AI Beauty Quiz for customized hair &amp; skincare recommendations.
          </p>
          <Link to="/recommend" className="dual-card-btn">
            Take AI Beauty Quiz →
          </Link>
        </div>

        <div className="dual-card dual-card-consult">
          <span className="dual-card-eyebrow">👑 BRIDAL CONCIERGE</span>
          <h3>Bridal &amp; Custom Wig Fitting</h3>
          <p>
            Planning your wedding day or need a custom-fitted virgin hair unit? Reserve a private consultation with our Lagos beauty stylists.
          </p>
          <Link to="/beauty/bridal-skincare-routine-nigeria" className="dual-card-btn">
            Explore Bridal Services →
          </Link>
        </div>
      </div>

      {/* Signature Arched Graphic Motif matching the designer benchmark */}
      <div className="dual-arch-wrap">
        <div className="dual-arch-shape" />
      </div>
    </section>
  );
}

export default FeatureDualBanners;
