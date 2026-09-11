import { Link } from "react-router-dom";
import "./StyleShowcase.css";

const styles = [
  {
    id: 1,
    title: "Bone Straight 30\" HD Lace",
    tag: "Raw Vietnamese",
    price: "₦185,000",
    category: "wig",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop&crop=face",
  },
  {
    id: 2,
    title: "Glueless Body Wave Unit",
    tag: "Pre-Plucked 13x4",
    price: "₦160,000",
    category: "wig",
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=750&fit=crop&crop=face",
  },
  {
    id: 3,
    title: "Honey Caramel Balayage Bob",
    tag: "Custom Colored",
    price: "₦125,000",
    category: "wig",
    img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&h=750&fit=crop&crop=face",
  },
  {
    id: 4,
    title: "Melanin Radiance Barrier Kit",
    tag: "Clinical Skincare",
    price: "₦48,000",
    category: "skincare",
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=750&fit=crop&crop=center",
  },
];

function StyleShowcase() {
  return (
    <section className="styles-section" aria-label="Style Showcase">
      <div className="styles-inner">
        <div className="styles-header">
          <div>
            <span className="styles-eyebrow">CURATED COLLECTION</span>
            <h2>Discover Signature Looks</h2>
          </div>
          <Link to="/products" className="styles-see-all">
            Explore All 24+ Looks →
          </Link>
        </div>

        <div className="styles-grid">
          {styles.map((item) => (
            <Link
              to={`/products?category=${item.category}`}
              key={item.id}
              className="style-card"
            >
              <div className="style-img-wrap">
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop";
                  }}
                />
                <div className="style-badge">{item.tag}</div>
                <div className="style-gradient" />
              </div>

              <div className="style-details">
                <h3>{item.title}</h3>
                <div className="style-bottom-row">
                  <span className="style-price">{item.price}</span>
                  <span className="style-link-text">Shop Look →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StyleShowcase;
