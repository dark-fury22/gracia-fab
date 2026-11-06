import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import "./CartDrawer.css";

function CartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Inert accessibility attribute
  useEffect(() => {
    if (drawerRef.current) drawerRef.current.inert = !isOpen;
  }, [isOpen]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price || 0);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  const handleStartConsultation = () => {
    onClose();
    navigate("/recommend");
  };

  const handleBrowseCatalog = () => {
    onClose();
    navigate("/products");
  };

  return (
    <>
      {/* Dark Luxury Backdrop Overlay */}
      {isOpen && (
        <div
          className="drawer-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Centered Luxury Modal on Desktop / Bottom Sheet on Mobile */}
      <aside
        ref={drawerRef}
        className={`cart-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Shopping Bag"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-header-title">
            <span className="drawer-header-sparkle">✦</span>
            <h2>My Shopping Bag</h2>
            <span className="drawer-count-badge">({cartCount})</span>
          </div>
          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Close shopping bag"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping / Delivery Trust Bar */}
        <div className="drawer-delivery-strip">
          <span className="delivery-icon">🚚</span>
          <span>Flat ₦2,500 Nationwide Delivery · Lagos Same-Day Dispatch</span>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="drawer-empty">
              <span className="drawer-empty-icon">🛍️</span>
              <h3>Your bag is empty</h3>
              <p>
                Discover personalized skincare, 100% raw human hair wigs, and beauty rituals tailored to your skin &amp; hair.
              </p>
              <div className="drawer-empty-actions">
                <button
                  type="button"
                  className="btn-drawer-advisor"
                  onClick={handleStartConsultation}
                >
                  ✦ Consult AI Beauty Advisor
                </button>
                <button
                  type="button"
                  className="btn-drawer-shop"
                  onClick={handleBrowseCatalog}
                >
                  Browse All Collections →
                </button>
              </div>
            </div>
          ) : (
            <div className="drawer-items-list">
              {cartItems.map((item) => (
                <div key={item._id} className="drawer-item">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300"}
                    alt={item.name}
                    className="drawer-item-img"
                  />
                  <div className="drawer-item-info">
                    <p className="drawer-item-name">{item.name}</p>
                    <p className="drawer-item-price">
                      {formatPrice(item.price)}
                    </p>
                    <div className="drawer-qty">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="drawer-remove"
                    onClick={() => removeFromCart(item._id)}
                    aria-label={`Remove ${item.name} from bag`}
                    title="Remove item"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-subtotal">
              <div className="subtotal-label-wrap">
                <span className="subtotal-title">Subtotal</span>
                <span className="subtotal-note">Taxes &amp; delivery calculated at checkout</span>
              </div>
              <span className="subtotal-amount">{formatPrice(cartTotal)}</span>
            </div>
            <button
              type="button"
              className="btn-drawer-checkout"
              onClick={handleCheckout}
            >
              Proceed to Checkout ({formatPrice(cartTotal)}) →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
