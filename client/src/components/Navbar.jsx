import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";
import GraciaLogo from "./GraciaLogo";

function Navbar({ onCartOpen }) {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        {/* Left */}
        <div className="navbar-left">
          <Link to="/products">Collection</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/recommend">✦ AI Advisor</Link>
        </div>

        {/* Center logo */}
        {/* Show icon only on mobile, full logo on desktop */}
        <Link to="/" className="navbar-logo-link">
          <span className="logo-desktop">
            <GraciaLogo size="sm" showText={true} />
          </span>
          <span className="logo-mobile">
            <GraciaLogo size="xs" showText={false} />
          </span>
        </Link>

        {/* Right */}
        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/dashboard" className="hide-mobile">
                My Account
              </Link>
              <Link to="/wishlist" className="hide-mobile">
                Saved
              </Link>
              {user?.isAdmin && (
                <Link to="/admin" className="hide-mobile">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="hide-mobile">
                Sign In
              </Link>
              <Link to="/register" className="btn-register hide-mobile">
                Join
              </Link>
            </>
          )}

          <ThemeToggle />

          <button className="cart-btn" onClick={onCartOpen}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>
            Collection
          </Link>
          <Link to="/recommend" onClick={() => setMenuOpen(false)}>
            ✦ Recommendations
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                My Account
              </Link>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
                Saved Items
              </Link>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)}>
                My Orders
              </Link>
              <Link to="/about" onClick={() => setMenuOpen(false)}>
                About Us
              </Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
              {user.isAdmin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <button className="mobile-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;
