import { Link } from "react-router-dom";
import "./LaunchBanner.css";

function LaunchBanner() {
  return (
    <section className="launch-banner">
      <div className="launch-inner">
        <div className="launch-content">
          <span className="launch-eyebrow">Ultimate Bundles</span>
          <h2>
            Our Latest Beauty Care
            <br />
            Innovation
          </h2>
          <p className="launch-accent">Available Now! 🎉</p>
          <p className="launch-desc">
            Get ready to elevate your beauty routine with our premium beauty
            care products. Our innovative formulas are designed to enhance your
            natural radiance and glow.
          </p>
          <Link to="/products?category=bridal" className="launch-btn">
            Check details →
          </Link>
        </div>

        <div className="launch-visual">
          <div className="launch-product-orbit">
            <img
              src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop"
              alt="Beauty Product"
              className="launch-product-img"
            />
            <div className="launch-orbit-ring" />
            <div className="launch-orbit-dot launch-dot-1">✦</div>
            <div className="launch-orbit-dot launch-dot-2">💎</div>
            <div className="launch-orbit-dot launch-dot-3">🌸</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LaunchBanner;
