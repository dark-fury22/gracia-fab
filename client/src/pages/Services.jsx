import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import "../styles/Services.css";

const CLINICAL_SKINCARE = [
  {
    _id: "skin-barrier-cream",
    name: "Melanin Barrier Restorative Cream",
    category: "skincare",
    price: 36000,
    rating: 4.9,
    reviewsCount: 128,
    benefits: "Deep Ceramide Repair · Non-Greasy",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=600&fit=crop&crop=center",
  },
  {
    _id: "skin-niacinamide-drops",
    name: "Niacinamide 10% + Zinc Glow Drops",
    category: "skincare",
    price: 28000,
    rating: 5.0,
    reviewsCount: 94,
    benefits: "Pore Minimizing · Oil Balancing",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=600&fit=crop&crop=center",
  },
  {
    _id: "skin-sunscreen-spf50",
    name: "Invisible Melanin Defense SPF 50+",
    category: "skincare",
    price: 32000,
    rating: 4.9,
    reviewsCount: 215,
    benefits: "Zero White Cast · Broad Spectrum",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=600&fit=crop&crop=center",
  },
  {
    _id: "skin-rose-mist",
    name: "Rose & Hibiscus Hydrating Mist",
    category: "skincare",
    price: 22000,
    rating: 4.8,
    reviewsCount: 86,
    benefits: "Instant Dewy Refresh · Antioxidant",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&h=600&fit=crop&crop=center",
  },
];

function Services({ onCartOpen }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "AI Skin Consultation",
    date: "",
    notes: "",
  });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const handleAddToCart = (item) => {
    addToCart(item);
    addToast(`Added ${item.name} to your bag 🛍️`, "success");
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSubmitted(true);
  };

  return (
    <>
      <SEO
        title="Beauty Redefined — Skincare & Services"
        description="Enhance your natural glow with science & care. Explore Gracia Fab's AI skin analysis, bespoke bridal consultations, raw wig customization, and clinical skincare in Nigeria."
        keywords="beauty services Nigeria, AI skin analysis Lagos, bridal beauty consultation, clinical skincare Nigeria, wig customization Lagos"
        url="/services"
      />
      <Navbar onCartOpen={onCartOpen} />

      <div className="services-page" role="main">
        {/* ═════════════════════════════════════════════════════════════════════
            1. "BEAUTY REDEFINED" FLUTED GLASSMORPHIC HERO (Matching Sample)
           ═════════════════════════════════════════════════════════════════════ */}
        <section className="beauty-redefined-hero">
          {/* Ambient fluted backdrop layer */}
          <div className="fluted-wall-texture" />
          <div className="hero-magenta-glow" />

          <div className="beauty-hero-container">
            {/* Top Navigation Preview Capsule Bar & Lotus Emblem */}
            <div className="beauty-hero-topbar">
              <div className="beauty-capsule-nav">
                <Link to="/" className="capsule-nav-item">Home</Link>
                <Link to="/about" className="capsule-nav-item">About</Link>
                <Link to="/products" className="capsule-nav-item">Products</Link>
                <Link to="/services" className="capsule-nav-item active">Services</Link>
                <Link to="/contact" className="capsule-nav-item">Contact</Link>
              </div>

              <div className="beauty-lotus-emblem" title="Gracia Fab Lotus Mark">
                <svg width="34" height="28" viewBox="0 0 34 28" fill="none">
                  <path
                    d="M17 2C15.5 8 13 14 7 18C13 17 16 13 17 2Z"
                    fill="currentColor"
                    opacity="0.9"
                  />
                  <path
                    d="M17 2C18.5 8 21 14 27 18C21 17 18 13 17 2Z"
                    fill="currentColor"
                    opacity="0.9"
                  />
                  <path
                    d="M17 0C17 7 11 15 2 19C9 20 15 17 17 26C19 17 25 20 32 19C23 15 17 7 17 0Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>

            {/* Main Split Content */}
            <div className="beauty-hero-content-split">
              {/* Left Column: Typography, CTAs & Floating Cards */}
              <div className="beauty-hero-left">
                <h1 className="beauty-redefined-title">
                  Beauty
                  <br />
                  Rede<span className="title-gradient-glow">fined</span>
                </h1>

                <p className="beauty-redefined-tagline">
                  Enhance Your Natural Glow With Science &amp; Care
                </p>

                {/* Primary Action Row: Pill Button + Social Proof Avatars */}
                <div className="beauty-hero-actions">
                  <a href="#services-grid" className="btn-discover-more">
                    <span>Discover More</span>
                    <div className="discover-arrow-circle">→</div>
                  </a>

                  <div className="beauty-social-proof">
                    <div className="avatar-cluster">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
                        alt="Customer 1"
                        className="avatar-img"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&h=100&fit=crop&crop=face"
                        alt="Customer 2"
                        className="avatar-img"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face"
                        alt="Customer 3"
                        className="avatar-img"
                      />
                    </div>
                    <span className="social-proof-text">
                      Trusted by 10K+<br />Happy Customers
                    </span>
                  </div>
                </div>

                {/* Bottom-Left Floating Glassmorphic Cards Matching Sample */}
                <div className="beauty-hero-floating-cards">
                  {/* Card 1: Skincare Bottles & Jars Visual Card */}
                  <div className="glass-card-products">
                    <img
                      src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=320&h=320&fit=crop&crop=center"
                      alt="Clinical Skincare Jars & Bottles"
                      className="glass-card-product-img"
                    />
                    <div className="glass-card-shine" />
                  </div>

                  {/* Card 2: 98% Visible Glow Improvement Glass Pill Card */}
                  <div className="glass-card-stat">
                    <div className="stat-pill-badge">
                      <span className="sparkle-star">✨</span>
                      <span>Skin Confidence</span>
                    </div>

                    <div className="stat-number">98%</div>
                    <div className="stat-label">Visible Glow Improvement</div>

                    <Link
                      to="/skin-analysis"
                      className="stat-action-arrow"
                      title="Start AI Skin Analysis"
                    >
                      →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Luminous Model in Satin */}
              <div className="beauty-hero-right">
                <div className="radiant-model-frame">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&h=1100&fit=crop&crop=face"
                    alt="Radiant Glowing Melanin Model in Satin"
                    className="radiant-model-img"
                  />
                  <div className="model-soft-vignette" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════
            2. THE 4 GRACIA FAB SIGNATURE BEAUTY SERVICES
           ═════════════════════════════════════════════════════════════════════ */}
        <section id="services-grid" className="services-suite-section">
          <div className="services-suite-container">
            <div className="services-suite-header">
              <span className="services-eyebrow">CLINICAL &amp; BESPOKE CARE</span>
              <h2 className="services-suite-title">
                Science-Backed Beauty Services
              </h2>
              <p className="services-suite-sub">
                Designed specifically for Nigerian skin tones, tropical climates, and raw hair longevity.
              </p>
            </div>

            <div className="services-cards-grid">
              {/* Service 1 */}
              <div className="service-feature-card">
                <div className="service-card-num">01</div>
                <div className="service-card-icon">🔬</div>
                <h3 className="service-card-title">AI Clinical Skin &amp; Tone Scan</h3>
                <p className="service-card-desc">
                  Instant computer-vision analysis of hyperpigmentation, oil balance, barrier hydration, and undertone depth in seconds.
                </p>
                <div className="service-card-meta">
                  <span>Free Online Tool</span>
                  <span>Results in 5s</span>
                </div>
                <Link to="/skin-analysis" className="service-card-link">
                  Launch Skin Analysis →
                </Link>
              </div>

              {/* Service 2 */}
              <div className="service-feature-card highlighted">
                <div className="service-card-num">02</div>
                <div className="service-card-icon">💍</div>
                <h3 className="service-card-title">Bespoke Bridal Fitting &amp; Glow</h3>
                <p className="service-card-desc">
                  Comprehensive 8-week wedding radiance protocol, custom lace melting to your undertone, and in-person studio trial in Lagos or Abuja.
                </p>
                <div className="service-card-meta">
                  <span>1-on-1 Specialist</span>
                  <span>VIP Lounge Access</span>
                </div>
                <a href="#consultation-booking" className="service-card-link">
                  Book Bridal Fitting →
                </a>
              </div>

              {/* Service 3 */}
              <div className="service-feature-card">
                <div className="service-card-num">03</div>
                <div className="service-card-icon">✂️</div>
                <h3 className="service-card-title">Custom Wig Ventilation &amp; Knot Bleach</h3>
                <p className="service-card-desc">
                  Professional salon customization for your raw hair units: hairline micro-plucking, bleached knots, and invisible glueless band installations.
                </p>
                <div className="service-card-meta">
                  <span>Lagos Salon Studio</span>
                  <span>48h Turnaround</span>
                </div>
                <a href="#consultation-booking" className="service-card-link">
                  Request Customization →
                </a>
              </div>

              {/* Service 4 */}
              <div className="service-feature-card">
                <div className="service-card-num">04</div>
                <div className="service-card-icon">📋</div>
                <h3 className="service-card-title">AI Climate Routine Generator</h3>
                <p className="service-card-desc">
                  Get a tailored AM/PM routine formulated specifically for Nigerian heat and humidity, focusing on pore clarity and moisture retention.
                </p>
                <div className="service-card-meta">
                  <span>Instant Algorithm</span>
                  <span>Personalized PDF</span>
                </div>
                <Link to="/routine-generator" className="service-card-link">
                  Generate Routine →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════
            3. CLINICAL GLOW METRICS & PROVEN RESULTS
           ═════════════════════════════════════════════════════════════════════ */}
        <section className="clinical-metrics-section">
          <div className="clinical-metrics-container">
            <div className="metric-box">
              <span className="metric-val">98%</span>
              <p className="metric-txt">Visible glow &amp; radiance improvement within 14 days</p>
            </div>
            <div className="metric-box">
              <span className="metric-val">100%</span>
              <p className="metric-txt">Melanin-safe, cruelty-free clean active formulations</p>
            </div>
            <div className="metric-box">
              <span className="metric-val">15,000+</span>
              <p className="metric-txt">Nigerian women matched with their ideal beauty routine</p>
            </div>
            <div className="metric-box">
              <span className="metric-val">24h</span>
              <p className="metric-txt">Express doorstep delivery across Lagos and Abuja</p>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════
            4. CURATED CLINICAL SKINCARE SHELF (NAIRA ₦)
           ═════════════════════════════════════════════════════════════════════ */}
        <section className="skincare-shelf-section">
          <div className="skincare-shelf-container">
            <div className="skincare-shelf-header">
              <div>
                <span className="services-eyebrow">ACTIVE DERMATOLOGY</span>
                <h2 className="skincare-shelf-title">Clinical Skincare Essentials</h2>
              </div>
              <Link to="/products?category=skincare" className="shelf-view-all">
                View All Skincare →
              </Link>
            </div>

            <div className="skincare-products-grid">
              {CLINICAL_SKINCARE.map((item) => (
                <div key={item._id} className="clinical-item-card">
                  <div className="clinical-item-media">
                    <img src={item.image} alt={item.name} />
                    <button
                      className="clinical-add-btn"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Bag +
                    </button>
                  </div>
                  <div className="clinical-item-info">
                    <span className="clinical-item-benefit">{item.benefits}</span>
                    <h4 className="clinical-item-title">{item.name}</h4>
                    <div className="clinical-item-price-row">
                      <span className="clinical-item-price">{formatPrice(item.price)}</span>
                      <span className="clinical-item-stars">★ {item.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════════════════
            5. CONSULTATION BOOKING & INQUIRY FORM
           ═════════════════════════════════════════════════════════════════════ */}
        <section id="consultation-booking" className="booking-section">
          <div className="booking-container">
            <div className="booking-inner-grid">
              <div className="booking-info-col">
                <span className="services-eyebrow-light">RESERVE A SESSION</span>
                <h2 className="booking-col-title">
                  Experience Bespoke Care in Lagos or Virtually.
                </h2>
                <p className="booking-col-desc">
                  Whether preparing for your wedding day or diagnosing stubborn skin concerns, our certified beauty advisors and wig artisans are here for you.
                </p>
                <div className="booking-perks">
                  <div className="perk-item">
                    <span>✦</span>
                    <p>Complimentary 20-minute video or in-person consultation</p>
                  </div>
                  <div className="perk-item">
                    <span>✦</span>
                    <p>Custom shade matching with physical HD lace swatches</p>
                  </div>
                  <div className="perk-item">
                    <span>✦</span>
                    <p>Personalized product regimen curated for your budget</p>
                  </div>
                </div>
              </div>

              <div className="booking-form-col">
                {bookingSubmitted ? (
                  <div className="booking-success-box">
                    <div className="success-icon">✨</div>
                    <h3>Consultation Request Received</h3>
                    <p>
                      Thank you! Our senior aesthetician will reach out via WhatsApp / Email within 2 business hours to confirm your appointment time.
                    </p>
                    <button
                      className="btn-book-another"
                      onClick={() => setBookingSubmitted(false)}
                    >
                      Book Another Session
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="booking-form">
                    <h3 className="form-title">Book an Appointment</h3>

                    <div className="form-row-dual">
                      <div className="form-group">
                        <label>Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Chioma Adebayo"
                          value={bookingForm.name}
                          onChange={(e) =>
                            setBookingForm({ ...bookingForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>WhatsApp Phone</label>
                        <input
                          type="tel"
                          required
                          placeholder="0803 123 4567"
                          value={bookingForm.phone}
                          onChange={(e) =>
                            setBookingForm({ ...bookingForm, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="chioma@example.com"
                        value={bookingForm.email}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, email: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-row-dual">
                      <div className="form-group">
                        <label>Service Type</label>
                        <select
                          value={bookingForm.service}
                          aria-label="Service type"
                          onChange={(e) =>
                            setBookingForm({ ...bookingForm, service: e.target.value })
                          }
                        >
                          <option value="AI Skin Consultation">AI Clinical Skin Consultation</option>
                          <option value="Bridal Glow & Fitting">Bespoke Bridal Fitting</option>
                          <option value="Wig Knot Bleaching & Customization">Wig Knot Bleaching &amp; Customization</option>
                          <option value="Climate Routine Planning">Climate Routine Planning</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Preferred Date</label>
                        <input
                          type="date"
                          required
                          aria-label="Preferred date"
                          value={bookingForm.date}
                          onChange={(e) =>
                            setBookingForm({ ...bookingForm, date: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Specific Skin Concerns or Wig Specs (Optional)</label>
                      <textarea
                        rows="3"
                        placeholder="Tell us about your skin goals, wedding date, or wig length requirements..."
                        value={bookingForm.notes}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, notes: e.target.value })
                        }
                      />
                    </div>

                    <button type="submit" className="btn-submit-booking">
                      Confirm Consultation Booking →
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default Services;
