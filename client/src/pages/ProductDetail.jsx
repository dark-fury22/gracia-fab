import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import "../styles/Products.css";
import API_URL from "../config";
import { useAuth } from "../context/AuthContext";

function ProductDetail({ onCartOpen }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/products/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("PRODUCT:", data);

        setProduct(data);
      } catch (err) {
        console.error("PRODUCT FETCH ERROR:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    if (onCartOpen) onCartOpen();
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "5rem" }}>Loading...</p>;
  if (!product)
    return (
      <p style={{ textAlign: "center", marginTop: "5rem" }}>
        Product not found
      </p>
    );

  return (
    <>
      <Navbar onCartOpen={onCartOpen} />
      <div className="detail-page">
        <button className="btn-back" onClick={() => navigate("/products")}>
          ← Back to Products
        </button>
        <div className="detail-grid">
          <div className="detail-image-wrapper">
            <img
              src={product?.image}
              alt={product.name}
              className="detail-image"
            />
          </div>
          <div className="detail-info">
            <span className="detail-category">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="detail-brand">by {product.brand}</p>
            <div className="detail-rating">
              {"⭐".repeat(Math.round(product?.rating || 0))}
              <span> ({product?.numReviews || 0} reviews)</span>
            </div>
            <p className="detail-price">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 0,
              }).format(product?.price)}
            </p>
            <p className="detail-desc">{product.description}</p>
            {product?.tags?.length > 0 && (
              <div className="detail-tags">
                {product?.tags?.map((tag, i) => (
                  <span key={i} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <button className="btn-add-cart" onClick={handleAddToCart}>
              {added ? "✅ Added to Bag!" : "Add to Bag"}
            </button>
          </div>
        </div>
        <ReviewSection productId={id} />
      </div>
      <Footer />
    </>
  );
}

// Add below the product detail section:
function ReviewSection({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: "", skinType: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${productId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await res.json();

      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    setError("");
    setSuccess("");

    e.preventDefault();
    if (!user) return setError("Please log in to leave a review");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reviews/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("Review submitted! ✅");
      setForm({
        rating: 5,
        comment: "",
        skinType: "",
      });
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="review-section">
      <div className="review-header">
        <h2>Customer Reviews</h2>
        {avg && (
          <div className="review-avg">
            <span className="review-avg-num">{avg}</span>
            <span className="review-stars">{"⭐".repeat(Math.round(avg))}</span>
            <span className="review-count">({reviews.length})</span>
          </div>
        )}
        {user && !showForm && (
          <button
            className="btn-write-review"
            onClick={() => setShowForm(true)}
          >
            Write a Review ✍️
          </button>
        )}
      </div>

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3>Your Review</h3>
          {error && <p className="review-error">⚠️ {error}</p>}
          {success && <p className="review-success">✅ {success}</p>}
          <div className="review-rating-pick">
            <label>Rating</label>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`star-btn ${s <= form.rating ? "active" : ""}`}
                  onClick={() => setForm({ ...form, rating: s })}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Skin Type (optional)</label>
            <select
              value={form.skinType}
              onChange={(e) => setForm({ ...form, skinType: e.target.value })}
            >
              <option value="">Select</option>
              <option>Oily</option>
              <option>Dry</option>
              <option>Combination</option>
              <option>Normal</option>
              <option>Sensitive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Your Review *</label>
            <textarea
              rows={4}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Tell others what you think about this product..."
              required
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              className="btn-submit-review"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              className="btn-cancel-review"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="reviews-empty">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-card-header">
                <div>
                  <strong className="reviewer-name">{review.name}</strong>
                  {review.verified && (
                    <span className="verified-badge">✅ Verified Purchase</span>
                  )}
                  {review.skinType && (
                    <span className="skin-type-badge">
                      {review.skinType} skin
                    </span>
                  )}
                </div>
                <div className="review-meta">
                  <span className="review-rating-stars">
                    {"⭐".repeat(review.rating)}
                  </span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default ProductDetail;
