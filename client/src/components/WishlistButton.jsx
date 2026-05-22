import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

function WishlistButton({ productId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) checkWishlist();
  }, [user, productId]);

  const checkWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setIsWishlisted(data.some((item) => item._id === productId));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return navigate("/login");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const method = isWishlisted ? "DELETE" : "POST";

      await fetch(`${API_URL}/api/wishlist/${productId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      style={{
        background: "none",
        border: "none",
        fontSize: "1.4rem",
        cursor: "pointer",
        padding: "0.2rem",
        transition: "transform 0.2s",
        transform: loading ? "scale(0.9)" : "scale(1)",
      }}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isWishlisted ? "❤️" : "🤍"}
    </button>
  );
}

export default WishlistButton;
