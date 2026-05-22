import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import "../styles/Cart.css";
import SEO from "../components/SEO";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } =
    useCart();
  const navigate = useNavigate();

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <>
      <SEO
        title="My Cart"
        description="Review your Gracia Fab cart and proceed to checkout."
        url="/cart"
      />
      <Navbar />
      <div className="cart-page">
        <h1>Your Cart 🛒</h1>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p>🛍️ Your cart is empty!</p>
            <Link to="/products" className="btn-shop">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p className="cart-item-brand">{item.brand}</p>
                    <p className="cart-item-price">{formatPrice(item.price)}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-control">
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
                    <p className="cart-item-subtotal">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      className="btn-remove"
                      onClick={() => removeFromCart(item._id)}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}

              <button className="btn-clear" onClick={clearCart}>
                🗑️ Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Items</span>
                <span>{cartItems.reduce((a, i) => a + i.quantity, 0)}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>₦2,500</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>{formatPrice(cartTotal + 2500)}</span>
              </div>
              <button
                className="btn-checkout"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout →
              </button>
              <Link to="/products" className="btn-continue">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Cart;
