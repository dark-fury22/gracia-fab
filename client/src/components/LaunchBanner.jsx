import { Link } from "react-router-dom";
import "./LaunchBanner.css";

function LaunchBanner() {
  return (
    <section className="launch-banner">
      <img
        className="launch-bg-img"
        src="https://i.pinimg.com/736x/99/fe/33/99fe338260c364d0bff6d73aa6ee389b.jpg"
        alt=""
        aria-hidden="true"
      />
      <div className="launch-scrim" />

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
      </div>
    </section>
  );
}

export default LaunchBanner;
