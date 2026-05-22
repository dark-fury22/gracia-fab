import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import "../styles/Products.css";
import config from "../config";

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
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products/${id}`,
        );
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
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
              src={product.image}
              alt={product.name}
              className="detail-image"
            />
          </div>
          <div className="detail-info">
            <span className="detail-category">{product.category}</span>
            <h1>{product.name}</h1>
            <p className="detail-brand">by {product.brand}</p>
            <div className="detail-rating">
              {"⭐".repeat(Math.round(product.rating))}
              <span> ({product.numReviews} reviews)</span>
            </div>
            <p className="detail-price">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 0,
              }).format(product.price)}
            </p>
            <p className="detail-desc">{product.description}</p>
            {product.tags.length > 0 && (
              <div className="detail-tags">
                {product.tags.map((tag, i) => (
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
      </div>
      <Footer />
    </>
  );
}

export default ProductDetail;
