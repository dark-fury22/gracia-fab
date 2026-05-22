import { Link } from "react-router-dom";
import "./BrandStory.css";

function BrandStory() {
  return (
    <section className="brand-story">
      <div className="brand-inner">
        {/* Left — image */}
        <div className="brand-visual">
          <div className="brand-img-frame">
            <img
              src="https://i.pinimg.com/736x/99/fe/33/99fe338260c364d0bff6d73aa6ee389b.jpg"
              alt="Gracia Fab Brand Story"
              className="brand-img"
            />
          </div>
          <div className="brand-floating-badge">
            <span>🌿</span>
            <div>
              <p>100% Natural</p>
              <small>Ingredients</small>
            </div>
          </div>
        </div>

        {/* Right — content */}
        <div className="brand-content">
          <span className="brand-eyebrow">Our Story</span>
          <h2>
            Gracia Fab Sets the
            <br />
            Standard in <em className="brand-highlight">Beauty Excellence.</em>
          </h2>

          <div className="brand-features">
            <div className="brand-feature">
              <div className="brand-feature-icon">🧴</div>
              <div>
                <h4>Specialized Skincare Solutions</h4>
                <p>
                  Discover personalized skincare solutions designed to cater to
                  your unique beauty needs.
                </p>
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">💄</div>
              <div>
                <h4>Artisanal Beauty Creations</h4>
                <p>
                  Indulge in premium beauty creations meticulously crafted to
                  elevate your natural beauty.
                </p>
              </div>
            </div>
            <div className="brand-feature">
              <div className="brand-feature-icon">✦</div>
              <div>
                <h4>AI-Powered Recommendations</h4>
                <p>
                  Smart beauty advice tailored specifically to your skin type,
                  hair texture and lifestyle.
                </p>
              </div>
            </div>
          </div>

          <Link to="/recommend" className="brand-cta">
            Get My Recommendations →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BrandStory;
