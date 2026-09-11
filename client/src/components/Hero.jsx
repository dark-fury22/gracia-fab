import { Link } from "react-router-dom";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <img
        className="hero-bg-img"
        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&auto=format&fit=crop&q=85"
        alt="Gracia Fab Luxury Beauty"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1600&auto=format&fit=crop&q=80";
        }}
      />
      <div className="hero-scrim" />

      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-live-pill">
            <span className="hero-live-dot" />
            100% RAW VIRGIN HAIR &amp; CLINICAL SKINCARE ✦
          </div>

          <h1 className="hero-title">
            Smooth &amp; Silky
            <br />
            <em>Melanin</em> Perfection
          </h1>

          <p className="hero-desc">
            Raw virgin hair, undetectable HD lace wigs, and clinical skincare formulated
            for Africa's climate — custom-matched to you with AI.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="hero-btn-primary">
              Shop Collection →
            </Link>
            <Link to="/recommend" className="hero-btn-secondary">
              ✦ AI Beauty Picks
            </Link>
          </div>

          <div className="hero-social-proof">
            <div className="hero-avatars">
              <img
                src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face"
                alt="user"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face"
                alt="user"
              />
              <img
                src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=40&h=40&fit=crop&crop=face"
                alt="user"
              />
            </div>
            <div>
              <div className="hero-stars">⭐⭐⭐⭐⭐</div>
              <p>5k+ happy customers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
