import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import "./FloatingBackHeader.css";

function FloatingBackHeader({ onCartOpen, backLabel = "Back", showBrand = true }) {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <header className="floating-back-header" role="banner">
      <div className="floating-back-inner">
        {/* Left: Back / Return button */}
        <button
          type="button"
          onClick={handleBack}
          className="floating-back-btn"
          aria-label={`Go back to previous page`}
        >
          <span className="back-arrow" aria-hidden="true">←</span>
          <span className="back-text">{backLabel}</span>
        </button>

        {/* Center: Minimalist Luxury Wordmark */}
        {showBrand && (
          <Link to="/" className="floating-brand-mark" title="Gracia Fab Home">
            <span className="brand-name">GRACIA FAB</span>
            <span className="brand-sparkle">✦</span>
          </Link>
        )}

        {/* Right: Cart trigger */}
        <button
          type="button"
          onClick={onCartOpen}
          className="floating-cart-pill"
          aria-label={`Open shopping bag, ${cartCount} items`}
        >
          <span className="cart-icon" aria-hidden="true">🛍️</span>
          <span className="cart-label">Bag</span>
          <span className="cart-badge">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

export default FloatingBackHeader;

