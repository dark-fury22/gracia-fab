import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import ThemeToggle from "./ThemeToggle";
import "./Navbar.css";

// ── YSL BENCHMARK MEGA-MENU DATA (Matching Screenshots 1, 2, 3, 4) ──
const MEGA_MENUS = {
  fragrance: {
    columns: [
      {
        title: "WOMEN'S FRAGRANCES",
        links: [
          { label: "Libre", url: "/products?category=fragrance&line=libre" },
          { label: "Black Opium", url: "/products?category=fragrance&line=black-opium" },
          { label: "Mon Paris", url: "/products?category=fragrance&line=mon-paris" },
          { label: "Fragrance Sets for Women", url: "/products?category=giftset" },
          { label: "VIEW ALL WOMEN'S FRAGRANCES", url: "/products?category=fragrance", isAll: true },
        ],
      },
      {
        title: "MEN'S FRAGRANCES",
        links: [
          { label: "MYSLF", url: "/products?category=fragrance&line=myslf" },
          { label: "Y", url: "/products?category=fragrance&line=y" },
          { label: "L'Homme", url: "/products?category=fragrance&line=lhomme" },
          { label: "Fragrance Sets for Men", url: "/products?category=giftset" },
          { label: "VIEW ALL MEN'S FRAGRANCES", url: "/products?category=fragrance", isAll: true },
        ],
      },
      {
        title: "LE VESTIAIRE DES PARFUMS",
        links: [
          { label: "Fragrances", url: "/products?category=fragrance" },
          { label: "Candles", url: "/products?category=fragrance" },
          { label: "Gift Sets", url: "/products?category=giftset" },
          { label: "Bath & Body", url: "/products?category=skincare" },
          { label: "VIEW ALL LE VESTIAIRE DES PARFUMS", url: "/products?category=fragrance", isAll: true },
        ],
      },
    ],
    cards: [
      {
        title: "LIBRE",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=fragrance",
      },
      {
        title: "MYSLF",
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=fragrance",
      },
      {
        title: "LE VESTIAIRE DES PARFUMS",
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=fragrance",
      },
    ],
  },
  makeup: {
    columns: [
      {
        title: "LIP",
        links: [
          { label: "Lipstick", url: "/products?category=makeup" },
          { label: "Lip Gloss", url: "/products?category=makeup" },
          { label: "Liquid Lipstick", url: "/products?category=makeup" },
          { label: "Lip Balm", url: "/products?category=makeup" },
          { label: "Lip Stain", url: "/products?category=makeup" },
          { label: "Lip Liner", url: "/products?category=makeup" },
          { label: "Custom Lip Creator", url: "/skin-tone" },
          { label: "VIEW ALL LIP", url: "/products?category=makeup", isAll: true },
        ],
      },
      {
        title: "EYE",
        links: [
          { label: "Mascara", url: "/products?category=makeup" },
          { label: "Eyeshadow", url: "/products?category=makeup" },
          { label: "Eyeliner", url: "/products?category=makeup" },
          { label: "Eyebrow", url: "/products?category=makeup" },
          { label: "VIEW ALL EYE", url: "/products?category=makeup", isAll: true },
        ],
      },
      {
        title: "FACE",
        links: [
          { label: "Blush & Bronzer", url: "/products?category=makeup" },
          { label: "Concealer", url: "/products?category=makeup" },
          { label: "Highlighter", url: "/products?category=makeup" },
          { label: "Foundation & Tinted Moisturizer", url: "/products?category=makeup" },
          { label: "Primer & Setting Powder", url: "/products?category=makeup" },
          { label: "VIEW ALL FACE", url: "/products?category=makeup", isAll: true },
        ],
      },
    ],
    cards: [
      {
        title: "LOVESHINE LIP OIL STICK",
        image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=makeup",
      },
      {
        title: "SOFT GLOW CUSHION FOUNDATION",
        image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=makeup",
      },
      {
        title: "LASH LATEX MASCARA",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=makeup",
      },
    ],
  },
  skincare: {
    columns: [
      {
        title: "SKINCARE BY CATEGORY",
        links: [
          { label: "Cleansers & Toners", url: "/products?category=skincare" },
          { label: "Eye & Lip Care", url: "/products?category=skincare" },
          { label: "Moisturizers", url: "/products?category=skincare" },
          { label: "Primers", url: "/products?category=skincare" },
          { label: "Serums", url: "/products?category=skincare" },
          { label: "VIEW ALL SKINCARE BY CATEGORY", url: "/products?category=skincare", isAll: true },
        ],
      },
      {
        title: "SKINCARE BY CONCERN",
        links: [
          { label: "Fine Lines & Wrinkles", url: "/products?category=skincare" },
          { label: "Brightening", url: "/products?category=skincare" },
          { label: "Hydration", url: "/products?category=skincare" },
          { label: "Dark Spots", url: "/products?category=skincare" },
          { label: "Firming", url: "/products?category=skincare" },
          { label: "VIEW ALL SKINCARE BY CONCERN", url: "/products?category=skincare", isAll: true },
        ],
      },
      {
        title: "SKINCARE BY COLLECTION",
        links: [
          { label: "NU", url: "/products?category=skincare" },
          { label: "Pure Shots", url: "/products?category=skincare" },
          { label: "Or Rouge", url: "/products?category=skincare" },
          { label: "VIEW ALL SKINCARE BY COLLECTION", url: "/products?category=skincare", isAll: true },
        ],
      },
    ],
    cards: [
      {
        title: "PURE SHOTS NIGHT REBOOT",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=skincare",
      },
      {
        title: "CERAMIDE BARRIER RESTORATIVE",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=skincare",
      },
      {
        title: "OR ROUGE HAUTE ELIXIR",
        image: "https://images.unsplash.com/photo-1608248597359-bb4387532d56?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=skincare",
      },
    ],
  },
  giftsets: {
    columns: [
      {
        title: "GIFT SETS BY CATEGORY",
        links: [
          { label: "Fragrance Gift Sets", url: "/products?category=giftset" },
          { label: "Makeup Gift Sets", url: "/products?category=giftset" },
          { label: "Skincare Vaults", url: "/products?category=giftset" },
          { label: "Luxury Minis", url: "/products?category=giftset" },
          { label: "VIEW ALL GIFT SETS", url: "/products?category=giftset", isAll: true },
        ],
      },
      {
        title: "BEST SELLERS",
        links: [
          { label: "Black Opium Vault", url: "/products?category=giftset" },
          { label: "Libre Golden Discovery Set", url: "/products?category=giftset" },
          { label: "Pure Shots Clinical Duo", url: "/products?category=giftset" },
          { label: "VIEW ALL BEST SELLERS", url: "/products?category=giftset", isAll: true },
        ],
      },
      {
        title: "THE ART OF GIFTING",
        links: [
          { label: "Complimentary Lacquer Box", url: "/products?category=giftset" },
          { label: "Personalized Calligraphy Card", url: "/products?category=giftset" },
          { label: "Bespoke Ribbon Dressing", url: "/products?category=giftset" },
          { label: "EXPLORE GIFTING", url: "/products?category=giftset", isAll: true },
        ],
      },
    ],
    cards: [
      {
        title: "BLACK OPIUM GIFT VAULT",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=giftset",
      },
      {
        title: "GOLDEN DISCOVERY DUO",
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=giftset",
      },
      {
        title: "CLINICAL GLOW SET",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
        url: "/products?category=giftset",
      },
    ],
  },
  services: {
    columns: [
      {
        title: "AI BEAUTY LAB",
        links: [
          { label: "AI Beauty Advisor", url: "/recommend" },
          { label: "AI Selfie Skin Analysis", url: "/skin-analysis" },
          { label: "Custom Routine Generator", url: "/routine-generator" },
          { label: "African Skin Tone Detector", url: "/skin-tone" },
          { label: "LAUNCH BEAUTY LAB", url: "/recommend", isAll: true },
        ],
      },
      {
        title: "STUDIO SERVICES",
        links: [
          { label: "Bespoke Bridal Fitting (Lagos)", url: "/services" },
          { label: "Custom Wig Ventilation & HD Lace", url: "/services" },
          { label: "Private Haute Fragrance Consultation", url: "/services" },
          { label: "BOOK CONSULTATION", url: "/services", isAll: true },
        ],
      },
      {
        title: "VIRTUAL CONCIERGE",
        links: [
          { label: "Live AI Consultation", url: "/recommend" },
          { label: "Concierge Telephone Hotline", url: "/contact" },
          { label: "Shade Match Guarantee", url: "/services" },
          { label: "CHAT NOW", url: "/contact", isAll: true },
        ],
      },
    ],
    cards: [
      {
        title: "AI CLINICAL SKIN SCAN",
        image: "https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?w=500&auto=format&fit=crop&q=80",
        url: "/skin-analysis",
      },
      {
        title: "BRIDAL GLAM FITTING",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80",
        url: "/services",
      },
      {
        title: "CUSTOM WIG VENTILATION",
        image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=500&auto=format&fit=crop&q=80",
        url: "/services",
      },
    ],
  },
};

function Navbar({ onCartOpen }) {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMega, setActiveMega] = useState(null); // 'fragrance' | 'makeup' | 'skincare' | 'giftsets' | 'services'

  const accountRef = useRef(null);
  const searchInputRef = useRef(null);
  const megaNavRef = useRef(null);

  const cartCount = cartItems.reduce((a, c) => a + c.quantity, 0);

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
    <header className="ysl-header" onMouseLeave={handleNavMouseLeave} ref={megaNavRef}>
      {/* ── Tier 1: Top Black Announcement Strip ── */}
      <div className="ysl-announcement-strip">
        <span className="ysl-announcement-text">
          Receive a Special Gift on orders above ₦35,000 across Nigeria ✦ Complimentary Maison Packaging
        </span>
      </div>

      {/* ── Tier 2: Maison Sub-Bar (Matching Screenshots 1, 2, 3) ── */}
      <div className="ysl-subbar">
        {/* Left: Boxed Currency Selector + Find Store + Customer Service */}
        <div className="ysl-subbar-left">
          <div className="ysl-currency-box" title="Selected Country / Currency">
            <span>₦ - NG (NGN)</span>
            <span className="ysl-currency-arrow">⌄</span>
          </div>
          <Link to="/contact" className="ysl-sub-link">
            FIND A STORE
          </Link>
          <Link to="/contact" className="ysl-sub-link">
            CUSTOMER SERVICE
          </Link>
        </div>

        {/* Center Maison Wordmark */}
        <div className="ysl-brand-center">
          <Link to="/" className="ysl-brand-wordmark" title="Gracia Fab Maison">
            GRACIA FAB
          </Link>
          <span className="ysl-brand-submark">PARIS · LAGOS</span>
        </div>

        {/* Right Utilities: Account, Beauty Club, My Cart */}
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

          <Link to="/register" className="ysl-sub-link ysl-beauty-club-link">
            <span className="ysl-star-icon">★</span>
            <span>BEAUTY CLUB</span>
          </Link>

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
            to="/products?category=fragrance"
            className={`ysl-cat-link ${activeMega === "fragrance" ? "active" : ""}`}
            onMouseEnter={() => handleCategoryHover("fragrance")}
            onClick={() => setActiveMega(activeMega === "fragrance" ? null : "fragrance")}
          >
            FRAGRANCE
          </Link>

          <Link
            to="/products?category=makeup"
            className={`ysl-cat-link ${activeMega === "makeup" ? "active" : ""}`}
            onMouseEnter={() => handleCategoryHover("makeup")}
            onClick={() => setActiveMega(activeMega === "makeup" ? null : "makeup")}
          >
            MAKEUP
          </Link>

          <Link
            to="/products?category=skincare"
            className={`ysl-cat-link ${activeMega === "skincare" ? "active" : ""}`}
            onMouseEnter={() => handleCategoryHover("skincare")}
            onClick={() => setActiveMega(activeMega === "skincare" ? null : "skincare")}
          >
            SKINCARE
          </Link>

          <Link
            to="/products?category=giftset"
            className={`ysl-cat-link ${activeMega === "giftsets" ? "active" : ""}`}
            onMouseEnter={() => handleCategoryHover("giftsets")}
            onClick={() => setActiveMega(activeMega === "giftsets" ? null : "giftsets")}
          >
            GIFTS &amp; SETS
          </Link>

          <Link
            to="/services"
            className={`ysl-cat-link ${activeMega === "services" ? "active" : ""}`}
            onMouseEnter={() => handleCategoryHover("services")}
            onClick={() => setActiveMega(activeMega === "services" ? null : "services")}
          >
            SERVICES
          </Link>

          <Link
            to="/recommend"
            className="ysl-cat-link"
            onMouseEnter={() => setActiveMega(null)}
          >
            BEAUTY CLUB
          </Link>

          <Link
            to="/products?filter=exclusives"
            className="ysl-cat-link"
            onMouseEnter={() => setActiveMega(null)}
          >
            EXCLUSIVE OFFERS
          </Link>
        </div>

        {/* Right Search Button [ 🔍 Search... ] */}
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
                placeholder="Search fragrances, melanin skincare, virgin hair, gift sets..."
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
                  navigate("/products?search=Black+Opium");
                  setSearchOpen(false);
                }}
              >
                Black Opium
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/products?search=Vitamin+C");
                  setSearchOpen(false);
                }}
              >
                Melanin Serum
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
                  navigate("/products?search=Gift+Vault");
                  setSearchOpen(false);
                }}
              >
                Gift Vaults
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
            <Link to="/products?category=fragrance" onClick={() => setMenuOpen(false)}>
              FRAGRANCE
            </Link>
            <Link to="/products?category=makeup" onClick={() => setMenuOpen(false)}>
              MAKEUP
            </Link>
            <Link to="/products?category=skincare" onClick={() => setMenuOpen(false)}>
              SKINCARE
            </Link>
            <Link to="/products?category=giftset" onClick={() => setMenuOpen(false)}>
              GIFTS &amp; SETS
            </Link>
            <Link to="/services" onClick={() => setMenuOpen(false)}>
              SERVICES
            </Link>
            <Link to="/recommend" onClick={() => setMenuOpen(false)}>
              BEAUTY CLUB
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
