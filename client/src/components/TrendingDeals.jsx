import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./TrendingDeals.css";

function TrendingDeals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/featured")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.slice(0, 3));
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

                {/* Circular image */}
                <div className="deal-img-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="deal-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="deal-info">
                  <span className="deal-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p className="deal-desc">
                    {product.description.substring(0, 60)}...
                  </p>
                  <div className="deal-bottom">
                    <span className="deal-price">
                      {formatPrice(product.price)}
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
