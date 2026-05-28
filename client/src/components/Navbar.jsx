import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import GraciaLogo from "./GraciaLogo";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

function Navbar({ onCartOpen }) {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const labRef = useRef(null);
  const accountRef = useRef(null);

  const cartCount = cartItems.reduce((a, c) => a + c.quantity, 0);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (labRef.current && !labRef.current.contains(e.target)) {
        setLabOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setLabOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        {/* ── Left ── */}
        <div className="navbar-left">
          <Link
            to="/products"
            className={`nav-link ${isActive("/products") ? "active" : ""}`}
          >
            Collection
          </Link>
          <Link
            to="/about"
            className={`nav-link ${isActive("/about") ? "active" : ""}`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${isActive("/contact") ? "active" : ""}`}
          >
            Contact
          </Link>

          {/* Beauty Lab Dropdown */}
          <div className="nav-dropdown" ref={labRef}>
            <button
              className={`nav-link nav-dropdown-trigger ${
                labOpen ||
                isActive("/recommend") ||
                isActive("/skin-tone") ||
                isActive("/virtual-tryon")
                  ? "active"
                  : ""
              }`}
              onClick={() => setLabOpen((o) => !o)}
            >
              <span className="lab-icon">✦</span>
              Beauty Lab
              <svg
                className={`dropdown-arrow ${labOpen ? "open" : ""}`}
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {labOpen && (
              <div className="dropdown-menu">
                <Link
                  to="/recommend"
                  className="dropdown-item"
                  onClick={() => setLabOpen(false)}
                >
                  <span className="dropdown-item-icon">🤖</span>
                  <div>
                    <strong>AI Advisor</strong>
                    <p>Get personalized recommendations</p>
                  </div>
                </Link>
                <Link
                  to="/skin-tone"
                  className="dropdown-item"
                  onClick={() => setLabOpen(false)}
                >
                  <span className="dropdown-item-icon">✨</span>
                  <div>
                    <strong>Skin Tone</strong>
                    <p>Detect your complexion</p>
                  </div>
                </Link>
                <Link
                  to="/virtual-tryon"
                  className="dropdown-item"
                  onClick={() => setLabOpen(false)}
                >
                  <span className="dropdown-item-icon">💄</span>
                  <div>
                    <strong>Virtual Try-On</strong>
                    <p>Try lipstick & wig styles</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Center — Logo ── */}
        <Link to="/" className="navbar-logo-link">
          <span className="logo-desktop">
            <GraciaLogo size="sm" showText={true} />
          </span>
          <span className="logo-mobile">
            <GraciaLogo size="xs" showText={false} />
          </span>
        </Link>

        {/* ── Right ── */}
        <div className="navbar-right">
          {user ? (
            <>
              {/* Account dropdown */}
              <div className="nav-dropdown" ref={accountRef}>
                <button
                  className={`nav-link nav-dropdown-trigger ${accountOpen ? "active" : ""}`}
                  onClick={() => setAccountOpen((o) => !o)}
                >
                  <span className="nav-avatar">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hide-tablet">
                    {user.name?.split(" ")[0]}
                  </span>
                  <svg
                    className={`dropdown-arrow ${accountOpen ? "open" : ""}`}
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                  >
                    <path
                      d="M1 1L5 5L9 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {accountOpen && (
                  <div className="dropdown-menu dropdown-right">
                    <Link to="/dashboard" className="dropdown-item">
                      <span className="dropdown-item-icon">👤</span>
                      <div>
                        <strong>My Account</strong>
                        <p>Profile & orders</p>
                      </div>
                    </Link>
                    <Link to="/my-orders" className="dropdown-item">
                      <span className="dropdown-item-icon">📦</span>
                      <div>
                        <strong>My Orders</strong>
                        <p>Track & view orders</p>
                      </div>
                    </Link>
                    <Link to="/wishlist" className="dropdown-item">
                      <span className="dropdown-item-icon">❤️</span>
                      <div>
                        <strong>Saved Items</strong>
                        <p>Wishlist & recommendations</p>
                      </div>
                    </Link>
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        className="dropdown-item dropdown-item-accent"
                      >
                        <span className="dropdown-item-icon">👑</span>
                        <div>
                          <strong>Admin Panel</strong>
                          <p>Manage store</p>
                        </div>
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-item dropdown-item-danger"
                      onClick={handleLogout}
                    >
                      <span className="dropdown-item-icon">🚪</span>
                      <div>
                        <strong>Sign Out</strong>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link hide-tablet">
                Sign In
              </Link>
              <Link to="/register" className="nav-btn-register">
                Join Free
              </Link>
            </>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Cart */}
          <button
            className="nav-cart-btn"
            onClick={onCartOpen}
            aria-label="Open cart"
          >
            🛍️
            {cartCount > 0 && (
              <span className="nav-cart-badge">{cartCount}</span>
            )}
          </button>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <span className={`burger-line ${menuOpen ? "open" : ""}`} />
            <span className={`burger-line ${menuOpen ? "open" : ""}`} />
            <span className={`burger-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/products" onClick={() => setMenuOpen(false)}>
            🛍️ Collection
          </Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>
            ✦ About
          </Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>
            📞 Contact
          </Link>

          <div className="mobile-menu-section">Beauty Lab</div>
          <Link to="/recommend" onClick={() => setMenuOpen(false)}>
            🤖 AI Advisor
          </Link>
          <Link to="/skin-tone" onClick={() => setMenuOpen(false)}>
            ✨ Skin Tone Detector
          </Link>
          <Link to="/virtual-tryon" onClick={() => setMenuOpen(false)}>
            💄 Virtual Try-On
          </Link>

          {user && (
            <>
              <div className="mobile-menu-section">My Account</div>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                👤 Profile
              </Link>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)}>
                📦 My Orders
              </Link>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
                ❤️ Saved Items
              </Link>
              {user.isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  👑 Admin Panel
                </Link>
              )}
              <button className="mobile-logout" onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </>
          )}

          {!user && (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                🔑 Sign In
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                ✨ Join Free
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
