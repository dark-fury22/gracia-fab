import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";
import "../styles/Checkout.css";
import config from "../config";

function Checkout({ onCartOpen }) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const deliveryPrice = 2500;
  const totalPrice = cartTotal + deliveryPrice;

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderReady, setOrderReady] = useState(false);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1 — Save order to DB first
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) return navigate("/login");
    if (cartItems.length === 0) return setError("Your cart is empty!");

    const { fullName, phone, address, city, state } = formData;
    if (!fullName || !phone || !address || !city || !state) {
      return setError("Please fill in all delivery details");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          product: item._id,
        })),
        deliveryAddress: formData,
        itemsPrice: cartTotal,
        deliveryPrice,
        totalPrice,
      };

      const response = await fetch("${config.API_URL}/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create order");

      setOrderId(data._id);
      setOrderReady(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Launch Paystack popup manually
  const handlePaystackPayment = () => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    if (!publicKey || !publicKey.startsWith("pk_")) {
      setError("Paystack public key is missing. Check your .env file.");
      return;
    }

    const amountInKobo = Math.round(totalPrice * 100);

    // ✅ Paystack requires a plain function — NOT async
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email: user.email,
      amount: amountInKobo,
      currency: "NGN",
      ref: `gf_${Date.now()}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: formData.fullName,
          },
          {
            display_name: "Phone",
            variable_name: "phone",
            value: formData.phone,
          },
        ],
      },

      // ✅ Plain function — no async/await here
      callback: function (response) {
        verifyPayment(response.reference);
      },

      onClose: function () {
        setError("Payment was cancelled. You can try again.");
      },
    });

    handler.openIframe();
  };

  // Step 3 — Verify payment on backend
  const verifyPayment = async (reference) => {
    try {
      setPayLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders/${orderId}/pay`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reference }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      setError(
        `Payment received but verification failed. ` +
          `Please contact support with reference: ${reference}`,
      );
      console.error("Payment verification error:", err);
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <>
      <SEO title="Checkout" url="/checkout" />
      <Navbar onCartOpen={onCartOpen} />
      <div className="checkout-page">
        <h1>Checkout 📦</h1>

        <div className="checkout-layout">
          {/* Left — Form or Payment */}
          <div className="checkout-form-section">
            {!orderReady ? (
              <>
                <h2>Delivery Details</h2>
                {error && <div className="checkout-error">⚠️ {error}</div>}

                <form onSubmit={handleCreateOrder}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 08012345678"
                    />
                  </div>

                  <div className="form-group">
                    <label>Delivery Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="House number, Street name"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Lagos"
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      >
                        <option value="">Select state</option>
                        {[
                          "Abia",
                          "Adamawa",
                          "Akwa Ibom",
                          "Anambra",
                          "Bauchi",
                          "Bayelsa",
                          "Benue",
                          "Borno",
                          "Cross River",
                          "Delta",
                          "Ebonyi",
                          "Edo",
                          "Ekiti",
                          "Enugu",
                          "FCT",
                          "Gombe",
                          "Imo",
                          "Jigawa",
                          "Kaduna",
                          "Kano",
                          "Katsina",
                          "Kebbi",
                          "Kogi",
                          "Kwara",
                          "Lagos",
                          "Nasarawa",
                          "Niger",
                          "Ogun",
                          "Ondo",
                          "Osun",
                          "Oyo",
                          "Plateau",
                          "Rivers",
                          "Sokoto",
                          "Taraba",
                          "Yobe",
                          "Zamfara",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-place-order"
                    disabled={loading}
                  >
                    {loading ? "Saving Order..." : "→ Continue to Payment"}
                  </button>
                </form>
              </>
            ) : (
              /* Payment Step */
              <div className="payment-step">
                <h2>Complete Payment</h2>
                {error && <div className="checkout-error">⚠️ {error}</div>}

                <div className="payment-ready">
                  <div className="payment-success-icon">✅</div>
                  <p className="payment-saved-text">
                    Order saved! Complete your payment below.
                  </p>

                  <div className="payment-amount">
                    <span>Amount to Pay:</span>
                    <strong>{formatPrice(totalPrice)}</strong>
                  </div>

                  <div className="payment-details">
                    <p>📦 {cartItems.length} item(s)</p>
                    <p>
                      📍 {formData.city}, {formData.state}
                    </p>
                    <p>📧 {user.email}</p>
                  </div>

                  <button
                    className="btn-pay"
                    onClick={handlePaystackPayment}
                    disabled={payLoading}
                  >
                    {payLoading ? "Processing..." : "💳 Pay with Paystack"}
                  </button>

                  <p className="payment-secure">
                    🔒 Secured by Paystack · Cards · Bank Transfer · USSD
                  </p>

                  <button
                    className="btn-back-to-form"
                    onClick={() => setOrderReady(false)}
                  >
                    ← Edit Delivery Details
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right — Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="checkout-items">
              {cartItems.map((item) => (
                <div key={item._id} className="checkout-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="checkout-item-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop";
                    }}
                  />
                  <div className="checkout-item-info">
                    <p className="checkout-item-name">{item.name}</p>
                    <p className="checkout-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="checkout-item-price">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="total-row">
                <span>Delivery</span>
                <span>{formatPrice(deliveryPrice)}</span>
              </div>
              <div className="total-row grand">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Checkout;
