import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import ThemeToggle from "./ThemeToggle";
import LogoMark from "./LogoMark";
import "./Navbar.css";

// ── Mega-menu data for Gracia Fab's real product categories ──
const MEGA_MENUS = {
  skincare: {
    columns: [
      {
        title: "SKINCARE",
        links: [
          { label: "Shop All Skincare", url: "/products?category=skincare" },
          { label: "AI Skin Analysis (Selfie)", url: "/skin-analysis" },
          { label: "Custom Routine Generator", url: "/routine-generator" },
          { label: "VIEW ALL SKINCARE", url: "/products?category=skincare", isAll: true },
        ],
      },
    ],
    cards: [
      {
        title: "CLINICAL SKINCARE",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=skincare",
      },
      {
        title: "MOISTURIZERS & SERUMS",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=skincare",
      },
    ],
  },
  haircare: {
    columns: [
      {
        title: "HAIRCARE",
        links: [
          { label: "Shop All Haircare", url: "/products?category=haircare" },
          { label: "AI Beauty Advisor", url: "/recommend" },
          { label: "VIEW ALL HAIRCARE", url: "/products?category=haircare", isAll: true },
        ],
      },
    ],
    cards: [
      {
        title: "HAIRCARE ESSENTIALS",
        image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=haircare",
      },
      {
        title: "SCALP & GROWTH CARE",
        image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=haircare",
      },
    ],
  },
  wig: {
    columns: [
      {
        title: "WIGS",
        links: [
          { label: "Shop All Wigs", url: "/products?category=wig" },
          { label: "Skin Tone Detector", url: "/skin-tone" },
          { label: "VIEW ALL WIGS", url: "/products?category=wig", isAll: true },
        ],
      },
    ],
    cards: [
      {
        title: "RAW WIGS & FRONTALS",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=wig",
      },
      {
        title: "BOBS & COLORWAYS",
        image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=wig",
      },
    ],
  },
  bridal: {
    columns: [
      {
        title: "BRIDAL",
        links: [
          { label: "Shop All Bridal", url: "/products?category=bridal" },
          { label: "AI Beauty Advisor", url: "/recommend" },
          { label: "VIEW ALL BRIDAL", url: "/products?category=bridal", isAll: true },
        ],
      },
    ],
    cards: [
      {
        title: "BRIDAL BEAUTY",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=bridal",
      },
      {
        title: "WEDDING DAY GLOW",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=bridal",
      },
    ],
  },
};

function Navbar({ onCartOpen, transparent = false }) {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMega, setActiveMega] = useState(null); // 'skincare' | 'haircare' | 'wig' | 'bridal'
  const [scrolled, setScrolled] = useState(false);

  const accountRef = useRef(null);
  const searchInputRef = useRef(null);
  const megaNavRef = useRef(null);

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
      if (megaNavRef.current && !megaNavRef.current.contains(e.target)) {
        setActiveMega(null);
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
    setActiveMega(null);
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

  const handleCategoryHover = (key) => {
    if (MEGA_MENUS[key]) {
      setActiveMega(key);
    } else {
      setActiveMega(null);
    }
  };

  const handleNavMouseLeave = () => {
    setActiveMega(null);
  };

  return (
    <header
      className={`ysl-header ${transparent ? "ysl-header--transparent" : ""} ${transparent && scrolled ? "ysl-header--scrolled" : ""}`}
      onMouseLeave={handleNavMouseLeave}
      ref={megaNavRef}
    >
      {/* ── Tier 2: Maison Sub-Bar (Matching Screenshots 1, 2, 3) ── */}
      <div className="ysl-subbar">
        {/* Empty spacer — keeps the centered wordmark centered against
            the utilities on the right (see ysl-subbar-right below). */}
        <div className="ysl-subbar-left" aria-hidden="true" />

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

          <div className="ysl-theme-toggle-wrap">
            <ThemeToggle />
          </div>

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

      {/* ── Tier 3: Primary Category Navigation Bar (Matching Screenshots 1, 2, 3) ── */}
      <nav className="ysl-category-nav" aria-label="Product categories">
        <div className="ysl-category-links">
          <Link
            to="/products?category=skincare"
            className={`ysl-cat-link ${activeMega === "skincare" ? "active" : ""}`}
            onMouseEnter={() => handleCategoryHover("skincare")}
            onClick={() => setActiveMega(activeMega === "skincare" ? null : "skincare")}
          >
            SKINCARE
          </Link>

          <Link
            to="/products?category=haircare"
            className={`ysl-cat-link ${activeMega === "haircare" ? "active" : ""}`}
            onMouseEnter={() => handleCategoryHover("haircare")}
            onClick={() => setActiveMega(activeMega === "haircare" ? null : "haircare")}
          >
            HAIRCARE
          </Link>

          <Link
            to="/products?category=wig"
            className={`ysl-cat-link ${activeMega === "wig" ? "active" : ""}`}
            onMouseEnter={() => handleCategoryHover("wig")}
            onClick={() => setActiveMega(activeMega === "wig" ? null : "wig")}
          >
            WIGS
          </Link>

          <Link
            to="/products?category=bridal"
            className={`ysl-cat-link ${activeMega === "bridal" ? "active" : ""}`}
            onMouseEnter={() => handleCategoryHover("bridal")}
            onClick={() => setActiveMega(activeMega === "bridal" ? null : "bridal")}
          >
            BRIDAL
          </Link>
        </div>

        {/* Right Search Button [ 🔍 Search... ] — not shown on the home
            page, which has no separate search bar to justify it. */}
        {!transparent && (
          <div className="ysl-search-container">
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
          </div>
        )}
      </nav>

      {/* ── FULL-WIDTH LUXURY MEGA-MENU OVERLAY (Matching Screenshots 1, 2, 3, 4) ── */}
      {activeMega && MEGA_MENUS[activeMega] && (
        <div
          className="ysl-mega-menu-overlay"
          onMouseEnter={() => setActiveMega(activeMega)}
          onMouseLeave={handleNavMouseLeave}
        >
          <div className="ysl-mega-menu-inner">
            {/* Left 3 Text Columns */}
            <div className="ysl-mega-columns-left">
              {MEGA_MENUS[activeMega].columns.map((col, idx) => (
                <div key={idx} className="ysl-mega-text-col">
                  <h4 className="ysl-mega-col-heading">{col.title}</h4>
                  <ul className="ysl-mega-col-list">
                    {col.links.map((lnk, lIdx) => (
                      <li key={lIdx}>
                        <Link
                          to={lnk.url}
                          className={`ysl-mega-nav-link ${lnk.isAll ? "view-all" : ""}`}
                          onClick={() => setActiveMega(null)}
                        >
                          {lnk.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Right 3 Visual Cards */}
            <div className="ysl-mega-cards-right">
              {MEGA_MENUS[activeMega].cards.map((card, cIdx) => (
                <Link
                  key={cIdx}
                  to={card.url}
                  className="ysl-mega-visual-card"
                  onClick={() => setActiveMega(null)}
                >
                  <div className="ysl-mega-card-img-wrap">
                    <img src={card.image} alt={card.title} className="ysl-mega-card-img" />
                  </div>
                  <strong className="ysl-mega-card-title">{card.title}</strong>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

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

          <div className="ysl-mobile-categories">
            <Link to="/products?category=skincare" onClick={() => setMenuOpen(false)}>
              SKINCARE
            </Link>
            <Link to="/products?category=haircare" onClick={() => setMenuOpen(false)}>
              HAIRCARE
            </Link>
            <Link to="/products?category=wig" onClick={() => setMenuOpen(false)}>
              WIGS
            </Link>
            <Link to="/products?category=bridal" onClick={() => setMenuOpen(false)}>
              BRIDAL
            </Link>
            <Link to="/products" onClick={() => setMenuOpen(false)}>
              VIEW ALL COLLECTIONS
            </Link>
          </div>

          <div className="ysl-mobile-section-divider">AI BEAUTY LAB</div>
          <div className="ysl-mobile-sublinks">
            <Link to="/recommend" onClick={() => setMenuOpen(false)}>
              ✦ AI Beauty Advisor
            </Link>
            <Link to="/skin-analysis" onClick={() => setMenuOpen(false)}>
              🔬 AI Skin Analysis (Selfie)
            </Link>
            <Link to="/routine-generator" onClick={() => setMenuOpen(false)}>
              ✨ Custom Routine Generator
            </Link>
            <Link to="/skin-tone" onClick={() => setMenuOpen(false)}>
              🎨 Skin Tone Detector
            </Link>
          </div>

          <div className="ysl-mobile-section-divider">SERVICES &amp; ACCOUNT</div>
          <div className="ysl-mobile-sublinks">
            <Link to="/about" onClick={() => setMenuOpen(false)}>
              About Gracia Fab
            </Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>
              Customer Concierge
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                  My Account ({user.name})
                </Link>
                <Link to="/my-orders" onClick={() => setMenuOpen(false)}>
                  Track Orders
                </Link>
                <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
                  Saved Items
                </Link>
                <button className="ysl-mobile-logout" onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Sign In / Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
