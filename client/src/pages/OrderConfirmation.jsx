import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Orders.css";
import SEO from "../components/SEO";

function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "5rem" }}>Loading... 🌸</p>
    );

  return (
    <>
      <Navbar />
      <div className="confirmation-page">
        <div className="confirmation-card">
          <div className="confirmation-icon">🎉</div>
          <h1>Order Placed Successfully!</h1>
          <p className="confirmation-sub">
            Thank you for your order! We'll start processing it right away.
          </p>

          <div className="order-id-box">
            <span>Order ID:</span>
            <strong>#{order?._id?.slice(-8).toUpperCase()}</strong>
          </div>

          {order && (
            <div className="confirmation-details">
              <h3>Delivery Address</h3>
              <p>{order.deliveryAddress.fullName}</p>
              <p>{order.deliveryAddress.address}</p>
              <p>
                {order.deliveryAddress.city}, {order.deliveryAddress.state}
              </p>
              <p>📞 {order.deliveryAddress.phone}</p>
              {order && (
                <div
                  className={`payment-badge ${order.isPaid ? "paid" : "unpaid"}`}
                >
                  {order.isPaid ? "✅ Payment Confirmed" : "⏳ Payment Pending"}
                </div>
              )}

              <h3 style={{ marginTop: "1.5rem" }}>Items Ordered</h3>
              {order.orderItems.map((item, i) => (
                <div key={i} className="confirmation-item">
                  <img src={item.image} alt={item.name} />
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}

              <div className="confirmation-total">
                <span>Total Paid</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          )}

          <div className="confirmation-actions">
            <Link to="/products" className="btn-continue-shopping">
              Continue Shopping 🛍️
            </Link>
            <Link to="/my-orders" className="btn-view-orders">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OrderConfirmation;
