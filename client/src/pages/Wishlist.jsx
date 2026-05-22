import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import WishlistButton from "../components/WishlistButton";
import "../styles/Wishlist.css";
import SEO from "../components/SEO";
import config from "../config";

function Wishlist() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [savedRecs, setSavedRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("wishlist");
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchWishlist();
    fetchSavedRecs();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("${config.API_URL}/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      // Always ensure it's an array
      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedRecs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/wishlist/recommendations/saved",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setSavedRecs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSavedRecs([]);
    }
  };

  const handleAddToCart = (product) => {
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
    <>
      <SEO
        title="My Wishlist"
        description="View your saved Gracia Fab products and recommendations."
        url="/wishlist"
      />
      <Navbar />
      <div className="wishlist-page">
        <div className="wishlist-header">
          <h1>My Saved Items 💖</h1>
          <p>Your favourite products and recommendations in one place</p>
        </div>

        {/* Tabs */}
        <div className="wishlist-tabs">
          <button
            className={`wishlist-tab ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
          >
            ❤️ Wishlist ({wishlist.length})
          </button>
          <button
            className={`wishlist-tab ${activeTab === "recs" ? "active" : ""}`}
            onClick={() => setActiveTab("recs")}
          >
            ✨ Saved Recommendations ({savedRecs.length})
          </button>
        </div>

        {/* Wishlist Tab */}
        {activeTab === "wishlist" &&
          (loading ? (
            <p className="wishlist-loading">Loading your wishlist... 🌸</p>
          ) : wishlist.length === 0 ? (
            <div className="wishlist-empty">
              <p>🤍 Your wishlist is empty!</p>
              <p>Tap the heart icon on any product to save it here.</p>
              <Link to="/products" className="btn-browse">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map((product) => (
                <div key={product._id} className="wishlist-card">
                  <div className="wishlist-img-wrapper">
                    <img
                      src={product?.image}
                      alt={product.name}
                      className="wishlist-img"
                    />
                    <div className="wishlist-heart">
                      <WishlistButton
                        productId={product._id}
                        onRemove={fetchWishlist}
                      />
                    </div>
                  </div>
                  <div className="wishlist-info">
                    <span className="wishlist-category">
                      {product.category}
                    </span>
                    <h3>{product.name}</h3>
                    <p className="wishlist-brand">{product.brand}</p>
                    <p className="wishlist-price">
                      {formatPrice(product?.price)}
                    </p>
                    <div className="wishlist-actions">
                      <button
                        className="btn-cart"
                        onClick={() => handleAddToCart(product)}
                      >
                        {addedId === product._id
                          ? "✅ Added!"
                          : "🛒 Add to Cart"}
                      </button>
                      <Link
                        to={`/products/${product._id}`}
                        className="btn-details"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* Saved Recommendations Tab */}
        {activeTab === "recs" &&
          (savedRecs.length === 0 ? (
            <div className="wishlist-empty">
              <p>✨ No saved recommendations yet!</p>
              <p>Get recommendations and save them to view later.</p>
              <Link to="/recommend" className="btn-browse">
                Get Recommendations
              </Link>
            </div>
          ) : (
            <div className="saved-recs">
              {savedRecs.map((rec, index) => (
                <div key={index} className="saved-rec-card">
                  <div className="saved-rec-header">
                    <h3>Recommendation #{savedRecs.length - index}</h3>
                    <span className="saved-rec-date">
                      {new Date(rec.date).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {rec.profile && (
                    <div className="saved-rec-profile">
                      {rec.profile.skinType && (
                        <span>🧴 {rec.profile.skinType} skin</span>
                      )}
                      {rec.profile.hairType && (
                        <span>💆 {rec.profile.hairType} hair</span>
                      )}
                      {rec.profile.occasion && (
                        <span>🎯 {rec.profile.occasion}</span>
                      )}
                    </div>
                  )}

                  <div className="saved-rec-products">
                    {rec.products?.map((product, i) => (
                      <div key={i} className="saved-rec-product">
                        <img
                          src={product?.image}
                          alt={product.name}
                          className="saved-rec-img"
                        />
                        <div className="saved-rec-info">
                          <p className="saved-rec-name">{product.name}</p>
                          <p className="saved-rec-price">
                            {formatPrice(product?.price)}
                          </p>
                        </div>
                        <Link
                          to={`/products/${product._id}`}
                          className="btn-rec-view"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
      <Footer />
    </>
  );
}

export default Wishlist;
