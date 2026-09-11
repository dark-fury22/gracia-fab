import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import GraciaLogo from "../components/GraciaLogo";
import EditProfileModal from "../components/EditProfileModal";
import LoyaltyWidget from "../components/LoyaltyWidget";
import SEO from "../components/SEO";
import API_URL from "../config";
import "../styles/Dashboard.css";

const DEFAULT_ADDRESS =
  "No 60 Enugu Road by Igbere Street, Umuahia, Abia, 440233 Umuahia Oyo, Nigeria";

const SAMPLE_ORDERS = [
  {
    _id: "16610",
    name: "Bone Straight 30\" HD Frontal Lace",
    status: "On its way",
    totalPrice: 80000,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=360&fit=crop&crop=face",
  },
];

function Dashboard() {
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [marketingEmail, setMarketingEmail] = useState(true);
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [userAddress, setUserAddress] = useState(DEFAULT_ADDRESS);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Fetch real orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user && activeTab === "orders") {
      fetchOrders();
    }
  }, [user, activeTab]);

  const handleProfileSave = async ({ name, email }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

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

      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Profile save error:", err);
    }
  };

  const handleBuyAgain = (order) => {
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach((item) => addToCart(item));
    } else {
      addToCart({
        _id: order._id,
        name: order.name,
        price: order.totalPrice,
        image: order.image,
      });
    }
    setSuccessMsg("Item re-added to bag!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(price);

  if (!user) return null;

  const firstName = user.name ? user.name.split(" ")[0] : "there";
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "E";

  return (
    <div className="account-page">
      <SEO
        title="My Account"
        description="Manage your Gracia Fab profile, track orders, and view streak rewards."
        url="/dashboard"
      />

      {/* Account Top Bar */}
      <header className="account-topbar">
        <Link to="/" className="account-logo-link" title="Gracia Fab Home">
          <GraciaLogo size="md" variant="editorial" />
        </Link>
        <div className="account-avatar-badge" title={user.name}>
          {userInitial}
        </div>
      </header>

      {/* Main Account Shell */}
      <div className="account-shell">
        {/* Left Navigation Sidebar */}
        <aside className="account-sidebar">
          <button
            className={`account-nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`account-nav-item ${activeTab === "rewards" ? "active" : ""}`}
            onClick={() => setActiveTab("rewards")}
          >
            ✨ Streak Rewards
          </button>
          <button
            className={`account-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
        </aside>

        {/* Right Content Area */}
        <main className="account-main">
          {successMsg && <div className="account-alert-success">{successMsg}</div>}

          {/* ── TAB 1: PROFILE (Matching Image 4) ── */}
          {activeTab === "profile" && (
            <div className="profile-view">
              {/* Streak Stars Banner Card */}
              <div className="account-card streak-banner-card">
                <div className="streak-banner-content">
                  <p className="streak-greeting">Hi, {firstName} !</p>
                  <p className="streak-balance">
                    Your current ✨ streak stars balance: <strong>10 ✨</strong>
                  </p>
                  <button
                    type="button"
                    className="streak-view-link"
                    onClick={() => setActiveTab("rewards")}
                  >
                    View your ✨ streak stars →
                  </button>
                </div>
              </div>

              {/* User Personal Info Card */}
              <div className="account-card">
                <div className="account-card-header">
                  <h3>{user.name || "Esther Obisesan"}</h3>
                  <button
                    type="button"
                    className="account-action-btn"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit
                  </button>
                </div>
                <div className="account-field-row">
                  <span className="account-field-label">Email</span>
                  <span className="account-field-val">{user.email}</span>
                </div>
              </div>

              {/* Addresses Card */}
              <div className="account-card">
                <div className="account-card-header">
                  <h3>Addresses</h3>
                  <button
                    type="button"
                    className="account-action-btn"
                    onClick={() => {
                      const newAddr = prompt("Enter delivery address:", userAddress);
                      if (newAddr) setUserAddress(newAddr);
                    }}
                  >
                    Add
                  </button>
                </div>

                <div className="account-address-tile">
                  <span className="account-pin-icon" aria-hidden="true">
                    📍
                  </span>
                  <div className="account-address-info">
                    <p className="account-address-title">
                      {user.name || "Esther Obisesan"}{" "}
                      <span className="account-default-pill">Default</span>
                    </p>
                    <p className="account-address-text">{userAddress}</p>
                  </div>
                  <span className="account-chevron" aria-hidden="true">
                    ›
                  </span>
                </div>
              </div>

              {/* Marketing Preferences Card */}
              <div className="account-card">
                <h3 className="account-card-heading-plain">Marketing preferences</h3>
                <div className="account-toggle-row">
                  <span className="account-toggle-label">
                    <span className="account-mail-icon" aria-hidden="true">
                      ✉
                    </span>{" "}
                    Email
                  </span>
                  <button
                    type="button"
                    className={`account-switch ${marketingEmail ? "on" : "off"}`}
                    onClick={() => setMarketingEmail(!marketingEmail)}
                    aria-label="Toggle marketing email preferences"
                  >
                    <span className="switch-knob">
                      {marketingEmail && <span className="switch-check">✓</span>}
                    </span>
                  </button>
                </div>
              </div>

              {/* Sign Out Actions */}
              <div className="account-signout-row">
                <button
                  type="button"
                  className="account-btn-signout"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
                <button
                  type="button"
                  className="account-link-signout-all"
                  onClick={handleLogout}
                >
                  Sign out of all devices
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: ORDERS (Matching Image 2) ── */}
          {activeTab === "orders" && (
            <div className="orders-view">
              {loadingOrders ? (
                <div className="account-card">
                  <p>Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="account-card">
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/products" className="account-btn-signout" style={{ marginTop: "1rem" }}>
                    Start Shopping →
                  </Link>
                </div>
              ) : (
                <div className="orders-cards-list">
                  {orders.map((order, idx) => {
                    const itemImage =
                      order.orderItems?.[0]?.image ||
                      order.image ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=360&fit=crop&crop=face";
                    const orderNum = order._id ? order._id.slice(-5) : "16610";

                    return (
                      <div key={order._id || idx} className="account-card order-item-card">
                        <div className="order-item-layout">
                          <div className="order-item-thumb-wrap">
                            <img
                              src={itemImage}
                              alt={order.name || "Order Item"}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=360&fit=crop";
                              }}
                            />
                          </div>

                          <div className="order-item-info">
                            <h4 className="order-status-text">
                              {order.status || "On its way"}
                            </h4>
                            <p className="order-meta-text">
                              #{orderNum} · {formatPrice(order.totalPrice || 80000)} NGN
                            </p>
                          </div>

                          <button
                            type="button"
                            className="order-btn-buyagain"
                            onClick={() => handleBuyAgain(order)}
                          >
                            Buy again
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: STREAK REWARDS ── */}
          {activeTab === "rewards" && (
            <div className="rewards-view">
              <LoyaltyWidget />
            </div>
          )}
        </main>
      </div>

      {/* Account Bottom Legal Bar */}
      <footer className="account-legal-footer">
        <div className="account-legal-links">
          <span className="account-region-select">Nigeria ⌄</span>
          <Link to="/">Refund policy</Link>
          <Link to="/">Shipping</Link>
          <Link to="/">Privacy policy</Link>
          <Link to="/">Terms of service</Link>
          <Link to="/contact">Contact information</Link>
        </div>
      </footer>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleProfileSave}
      />
    </div>
  );
}

export default Dashboard;
