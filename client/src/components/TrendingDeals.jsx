import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import "./TrendingDeals.css";
import API_URL from "../config";

const DEFAULT_TRENDING = [
  {
    _id: "trending-1",
    name: "Bone Straight 30\" Frontal Lace Unit",
    category: "Wigs & Closures",
    price: 185000,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop&crop=face",
  },
  {
    _id: "trending-2",
    name: "100% Raw Virgin Body Wave 3-Bundle Set",
    category: "Raw Bundles",
    price: 145000,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=750&fit=crop&crop=face",
  },
  {
    _id: "trending-3",
    name: "Melanin Radiance Barrier Restorative Cream",
    category: "Clinical Skincare",
    price: 36000,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=750&fit=crop&crop=center",
  },
];

function TrendingDeals() {
  const [products, setProducts] = useState(DEFAULT_TRENDING);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products/featured`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.slice(0, 3));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAdd = (product) => {
    addToCart(product);
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <section className="trending-deals">
      <div className="trending-inner">
        <div className="trending-header">
          <div>
            <h2>Trending Deals</h2>
            <p>Discover unbeatable offers on top beauty essentials.</p>
          </div>
          <Link to="/products" className="trending-see-all">
            New Arrival ↓
          </Link>
        </div>

        {loading ? (
          <div className="trending-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="deal-skeleton" />
            ))}
          </div>
        ) : (
          <div className="trending-grid">
            {products.map((product, i) => (
              <div key={product._id} className="deal-card">
                {/* Discount badge */}
                <div className="deal-badge">
                  {i === 0 ? "50% Off" : i === 1 ? "30% Off" : "20% Off"}
                </div>

                {/* Full-bleed image */}
                <img
                  src={product?.image}
                  alt={product.name}
                  className="deal-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop";
                  }}
                />
                <div className="deal-scrim" />

                {/* Info overlay */}
                <div className="deal-info">
                  <span className="deal-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <div className="deal-bottom">
                    <span className="deal-price">
                      {formatPrice(product?.price)}
                    </span>
                    <button
                      className="deal-cart-btn"
                      onClick={() => handleAdd(product)}
                    >
                      {addedId === product._id ? "✓" : "+"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TrendingDeals;
