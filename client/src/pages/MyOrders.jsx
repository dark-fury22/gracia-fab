import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "../styles/Orders.css";
import SEO from "../components/SEO";
import config from "../config";

function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/myorders",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);

  const statusColor = {
    pending: "#f39c12",
    processing: "#3498db",
    shipped: "#9b59b6",
    delivered: "#27ae60",
    cancelled: "#e74c3c",
  };

  return (
    <>
      <Navbar />
      <div className="orders-page">
        <h1>My Orders 📦</h1>

        {loading ? (
          <p className="orders-loading">Loading your orders... 🌸</p>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <p>You haven't placed any orders yet!</p>
            <Link to="/products" className="btn-shop-now">
              Shop Now 🛍️
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <p className="order-id">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className="order-status"
                    style={{ backgroundColor: statusColor[order.status] }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="order-items-preview">
                  {order.orderItems.map((item, i) => (
                    <img
                      key={i}
                      src={item.image}
                      alt={item.name}
                      className="order-item-thumb"
                      title={item.name}
                    />
                  ))}
                  <span className="order-items-count">
                    {order.orderItems.length} item(s)
                  </span>
                </div>

                <div className="order-footer">
                  <span className="order-total">
                    {formatPrice(order.totalPrice)}
                  </span>
                  <Link
                    to={`/order-confirmation/${order._id}`}
                    className="btn-view-order"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default MyOrders;
