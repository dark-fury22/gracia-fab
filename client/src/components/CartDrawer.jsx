import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./CartDrawer.css";

function CartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="drawer-overlay" onClick={onClose} />}

      {/* Drawer */}
      <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h2>My Bag ({cartItems.length})</h2>
          <button className="drawer-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="drawer-empty">
              <p>Your bag is empty</p>
              <button
                className="btn-drawer-shop"
                onClick={() => {
                  onClose();
                  navigate("/products");
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item._id} className="drawer-item">
                  <img
                    src={item.image}
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
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="drawer-remove"
                    onClick={() => removeFromCart(item._id)}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-subtotal">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <button className="btn-drawer-checkout" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
