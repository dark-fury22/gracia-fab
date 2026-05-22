import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";
import SEO from "../components/SEO";
import config from "../config";

const tabs = [
  { id: "profile", label: "👤 My Profile" },
  { id: "orders", label: "📦 My Orders" },
  { id: "security", label: "🔒 Security" },
];

function Dashboard() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    skinType: "",
    hairType: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  // Fetch profile details
  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  // Fetch orders when tab changes
  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("${config.API_URL}/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProfileData({
        name: data.name || "",
        email: data.email || "",
        skinType: data.skinType || "",
        hairType: data.hairType || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
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
      setLoadingOrders(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("${config.API_URL}/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Update token and user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
        }),
      );

      setProfileSuccess("✅ Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError("New passwords do not match");
    }
    if (passwordData.newPassword.length < 6) {
      return setPasswordError("Password must be at least 6 characters");
    }

    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("${config.API_URL}/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPasswordSuccess("✅ Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setProfileLoading(false);
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

  if (!user) return null;

  return (
    <>
      <SEO
        title="My Dashboard"
        description="Manage your Gracia Fab account, view orders and update your beauty profile."
        url="/dashboard"
      />
      <Navbar />
      <div className="dashboard-page">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="dashboard-header-info">
            <h1>Welcome back, {user.name?.split(" ")[0]}! 👋</h1>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="dashboard-layout">
          {/* Sidebar */}
          <div className="dashboard-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`sidebar-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
            <button
              className="sidebar-tab logout-tab"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              🚪 Logout
            </button>
          </div>

          {/* Main Content */}
          <div className="dashboard-content">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="dashboard-card">
                <h2>My Profile</h2>
                <p className="dashboard-card-sub">
                  Update your personal information
                </p>

                {profileSuccess && (
                  <div className="dashboard-success">{profileSuccess}</div>
                )}
                {profileError && (
                  <div className="dashboard-error">⚠️ {profileError}</div>
                )}

                <form onSubmit={handleProfileUpdate}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Skin Type</label>
                      <select
                        value={profileData.skinType}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            skinType: e.target.value,
                          })
                        }
                      >
                        <option value="">Select skin type</option>
                        <option value="oily">Oily</option>
                        <option value="dry">Dry</option>
                        <option value="combination">Combination</option>
                        <option value="normal">Normal</option>
                        <option value="sensitive">Sensitive</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Hair Type</label>
                      <select
                        value={profileData.hairType}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            hairType: e.target.value,
                          })
                        }
                      >
                        <option value="">Select hair type</option>
                        <option value="straight">Straight</option>
                        <option value="wavy">Wavy</option>
                        <option value="curly">Curly</option>
                        <option value="coily">Coily / 4C</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-save"
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Saving..." : "💾 Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="dashboard-card">
                <h2>My Orders</h2>
                <p className="dashboard-card-sub">
                  Track and view your order history
                </p>

                {loadingOrders ? (
                  <p className="dashboard-loading">Loading orders... 🌸</p>
                ) : orders.length === 0 ? (
                  <div className="dashboard-empty">
                    <p>No orders yet!</p>
                    <Link to="/products" className="btn-shop-link">
                      Start Shopping 🛍️
                    </Link>
                  </div>
                ) : (
                  <div className="dashboard-orders">
                    {orders.map((order) => (
                      <div key={order._id} className="dashboard-order-card">
                        <div className="dashboard-order-header">
                          <div>
                            <p className="dashboard-order-id">
                              #{order._id.slice(-8).toUpperCase()}
                            </p>
                            <p className="dashboard-order-date">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-NG",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <div className="dashboard-order-badges">
                            <span
                              className="order-status-badge"
                              style={{
                                backgroundColor: statusColor[order.status],
                              }}
                            >
                              {order.status.toUpperCase()}
                            </span>
                            <span
                              className={`payment-status-badge
                                ${order.isPaid ? "paid" : "unpaid"}`}
                            >
                              {order.isPaid ? "✅ Paid" : "⏳ Unpaid"}
                            </span>
                          </div>
                        </div>

                        <div className="dashboard-order-items">
                          {order.orderItems.map((item, i) => (
                            <img
                              key={i}
                              src={item.image}
                              alt={item.name}
                              className="order-thumb"
                              title={item.name}
                            />
                          ))}
                        </div>

                        <div className="dashboard-order-footer">
                          <span className="dashboard-order-total">
                            {formatPrice(order.totalPrice)}
                          </span>
                          <Link
                            to={`/order-confirmation/${order._id}`}
                            className="btn-order-detail"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="dashboard-card">
                <h2>Security</h2>
                <p className="dashboard-card-sub">Update your password</p>

                {passwordSuccess && (
                  <div className="dashboard-success">{passwordSuccess}</div>
                )}
                {passwordError && (
                  <div className="dashboard-error">⚠️ {passwordError}</div>
                )}

                <form onSubmit={handlePasswordUpdate}>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Repeat new password"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Updating..." : "🔒 Update Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Dashboard;
