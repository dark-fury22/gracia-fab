import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import LogoMark from "./LogoMark";
import "./Navbar.css";

// ── Primary nav links ──
const NAV_LINKS = [
  { label: "HOME", url: "/" },
  { label: "BEAUTY ADVISOR", url: "/recommend" },
  { label: "SHOP", url: "/products" },
  { label: "ABOUT", url: "/about" },
];

function Navbar({ onCartOpen, transparent = false }) {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const accountRef = useRef(null);
  const searchInputRef = useRef(null);

  const cartCount = cartItems.reduce((a, c) => a + c.quantity, 0);

  // Only the transparent (hero-overlay) variant needs to react to scroll —
  // it starts see-through over the hero video, then turns solid once the
  // user scrolls past it so the nav stays legible over ordinary content.
  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => setScrolled(window.scrollY > 80);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Autofocus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close menus on route change — adjusting state during render (rather
  // than in an effect) avoids an extra commit on every navigation.
  const locationKey = `${location.pathname}${location.search}`;
  const [prevLocationKey, setPrevLocationKey] = useState(locationKey);
  if (locationKey !== prevLocationKey) {
    setPrevLocationKey(locationKey);
    setMenuOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <header
      className={`ysl-header ${transparent ? "ysl-header--transparent" : ""} ${transparent && scrolled ? "ysl-header--scrolled" : ""}`}
    >
      {/* ── Single-row header: nav links, logo, and utilities all on one
          line, with the links and utilities balancing the centered logo ── */}
      <div className="ysl-subbar">
        {/* Left: Primary Navigation */}
        <div className="ysl-subbar-left">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.url}
              to={link.url}
              className={`ysl-cat-link ${location.pathname === link.url ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center Maison Wordmark */}
        <div className="ysl-brand-center">
          <Link to="/" className="ysl-brand-wordmark" title="Gracia Fab Maison">
            <LogoMark className="ysl-brand-icon" />
            <span className="ysl-brand-text">GRACIA FAB</span>
          </Link>
        </div>

        {/* Right Utilities: Account, My Cart */}
        <div className="ysl-subbar-right">
          {user ? (
            <div className="ysl-account-wrap" ref={accountRef}>
              <button
                className="ysl-sub-link ysl-account-trigger"
                onClick={() => setAccountOpen((o) => !o)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>ACCOUNT</span>
              </button>
              {accountOpen && (
                <div className="ysl-account-dropdown">
                  <Link to="/dashboard" onClick={() => setAccountOpen(false)}>
                    My Account ({user.name?.split(" ")[0]})
                  </Link>
                  <Link to="/my-orders" onClick={() => setAccountOpen(false)}>
                    My Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setAccountOpen(false)}>
                    Saved Items
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin" onClick={() => setAccountOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <button className="ysl-logout-btn" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="ysl-sub-link">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>ACCOUNT</span>
            </Link>
          )}

          <button
            className="ysl-sub-link ysl-cart-utility-btn"
            onClick={onCartOpen}
            aria-label="Open Cart"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>MY CART ({cartCount})</span>
          </button>

          {/* Search — not shown on the home page, which has no separate
              search bar to justify it. */}
          {!transparent && (
            <button
              className="ysl-search-pill-btn"
              onClick={() => setSearchOpen((o) => !o)}
              aria-label="Open Search"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search...</span>
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            className="ysl-mobile-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
          >
            <span className={`ysl-burger-line ${menuOpen ? "open" : ""}`} />
            <span className={`ysl-burger-line ${menuOpen ? "open" : ""}`} />
            <span className={`ysl-burger-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Search Overlay Drawer ── */}
      {searchOpen && (
        <div className="ysl-search-drawer">
          <div className="ysl-search-inner">
            <form onSubmit={handleSearchSubmit} className="ysl-search-form">
              <input
                ref={searchInputRef}
                type="text"
                className="ysl-search-input"
                placeholder="Search skincare, haircare, wigs, bridal beauty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="ysl-search-submit-btn">
                SEARCH
              </button>
              <button
                type="button"
                className="ysl-search-close-btn"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                ✕
              </button>
            </form>
            <div className="ysl-search-suggestions">
              <span className="ysl-suggest-label">TRENDING NOW:</span>
              <button
                type="button"
                onClick={() => {
                  navigate("/products?search=Serum");
                  setSearchOpen(false);
                }}
              >
                Skincare Serums
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/products?search=Bone+Straight");
                  setSearchOpen(false);
                }}
              >
                Bone Straight Wigs
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/products?search=Bridal");
                  setSearchOpen(false);
                }}
              >
                Bridal Beauty
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/products?search=Haircare");
                  setSearchOpen(false);
                }}
              >
                Haircare
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Navigation Drawer ── */}
      {menuOpen && (
        <div className="ysl-mobile-drawer">
          <div className="ysl-mobile-top">
            <span className="ysl-mobile-brand">GRACIA FAB</span>
            <button
              className="ysl-mobile-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>

          <nav className="ysl-mobile-categories" aria-label="Mobile Navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.url}
                to={link.url}
                onClick={() => setMenuOpen(false)}
                className={location.pathname === link.url ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={location.pathname === "/dashboard" ? "active" : ""}
                >
                  ACCOUNT
                </Link>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className={location.pathname === "/admin" ? "active" : ""}
                  >
                    ADMIN PANEL
                  </Link>
                )}
                <button
                  type="button"
                  className="ysl-mobile-link-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    onCartOpen?.();
                  }}
                  aria-label={`Open Cart, ${cartCount} items`}
                >
                  <span>MY CART</span>
                  <span className="ysl-mobile-cart-badge">{cartCount}</span>
                </button>
                <button
                  type="button"
                  className="ysl-mobile-link-btn ysl-mobile-logout"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <span>SIGN OUT</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className={location.pathname === "/login" ? "active" : ""}
                >
                  ACCOUNT
                </Link>
                <button
                  type="button"
                  className="ysl-mobile-link-btn"
                  onClick={() => {
                    setMenuOpen(false);
                    onCartOpen?.();
                  }}
                  aria-label={`Open Cart, ${cartCount} items`}
                >
                  <span>MY CART</span>
                  <span className="ysl-mobile-cart-badge">{cartCount}</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
