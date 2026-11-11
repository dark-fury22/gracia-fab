import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import SEO from "../components/SEO";
import "../styles/Checkout.css";
import API_URL from "../config";

function Checkout({ onCartOpen }) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Once the order is saved, the server's totals are authoritative: it prices
  // items from the database and sets the delivery fee, and Monnify must be
  // charged exactly that amount or verification rejects it. Before then we
  // show an estimate — keep DELIVERY_ESTIMATE in sync with
  // server/config/shipping.js.
  const DELIVERY_ESTIMATE = 2500;
  const [serverTotals, setServerTotals] = useState(null);
  const subtotal = serverTotals?.itemsPrice ?? cartTotal;
  const deliveryPrice = serverTotals?.deliveryPrice ?? DELIVERY_ESTIMATE;
  const totalPrice = serverTotals?.totalPrice ?? cartTotal + deliveryPrice;

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
      };

      const response = await fetch(`${API_URL}/api/orders`, {
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
      setServerTotals({
        itemsPrice: data.itemsPrice,
        deliveryPrice: data.deliveryPrice,
        totalPrice: data.totalPrice,
      });
      setOrderReady(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Ask the server to start a payment, then open the Monnify modal.
  // The server issues the payment reference (saved on the order so its
  // webhook can find it) and the amount (its own order total), plus the
  // public Monnify API key and contract code — no payment keys live in the
  // client build.
  const handlePayment = async () => {
    if (!window.MonnifySDK) {
      setError(
        "The payment window couldn't load. Check your connection and refresh the page.",
      );
      return;
    }

    let session;
    try {
      setPayLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/pay/init`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      session = await response.json();
      if (!response.ok) {
        throw new Error(session.message || "Couldn't start payment");
      }
    } catch (err) {
      setError(err.message);
      setPayLoading(false);
      return;
    }
    setPayLoading(false);

    let completed = false;
    window.MonnifySDK.initialize({
      amount: session.amount,
      currency: session.currency,
      reference: session.reference,
      customerFullName: session.customerName,
      customerEmail: session.customerEmail,
      apiKey: session.apiKey,
      contractCode: session.contractCode,
      paymentDescription: `Gracia Fab order #${orderId.slice(-8).toUpperCase()}`,
      isTestMode: session.isTestMode,
      metadata: { phone: formData.phone },
      onComplete: (response) => {
        completed = true;
        verifyPayment(response?.paymentReference || session.reference);
      },
      onClose: () => {
        if (!completed) {
          setError("Payment was cancelled. You can try again.");
        }
      },
    });
  };

  // Step 3 — Verify payment on backend (the server re-checks with Monnify)
  const verifyPayment = async (reference) => {
    try {
      setPayLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/orders/${orderId}/pay`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      if (/PENDING/.test(err.message)) {
        // Bank transfers can take a moment to land. Monnify's webhook will
        // mark the order paid once it does, so don't alarm the customer.
        setError(
          `We're waiting for your bank to confirm the transfer. ` +
            `Your order will update automatically — check My Orders shortly. ` +
            `Reference: ${reference}`,
        );
      } else {
        setError(
          `We couldn't confirm your payment yet. If you were charged, ` +
            `please contact support with reference: ${reference}`,
        );
      }
      console.error("Payment verification error:", err);
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <>
      <SEO title="Checkout" url="/checkout" />
      <Navbar onCartOpen={onCartOpen} />
      <div className="checkout-page" role="main">
        <h1>Checkout 📦</h1>

        <div className="checkout-steps">
          <div className={`checkout-step ${!orderReady ? "current" : "done"}`}>
            <span className="checkout-step-num">
              {orderReady ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : (
                "1"
              )}
            </span>
            <span className="checkout-step-label">Delivery Details</span>
          </div>
          <div className="checkout-step-connector" />
          <div className={`checkout-step ${orderReady ? "current" : ""}`}>
            <span className="checkout-step-num">2</span>
            <span className="checkout-step-label">Payment</span>
          </div>
        </div>

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
                        aria-label="State"
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
                    onClick={handlePayment}
                    disabled={payLoading}
                  >
                    {payLoading ? "Processing..." : "💳 Pay Now"}
                  </button>

                  <p className="payment-secure">
                    🔒 Secured by Monnify · Card · Bank Transfer · USSD
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
                <span>{formatPrice(subtotal)}</span>
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
