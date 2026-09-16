import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import API_URL from "../config";
import "../styles/YslHome.css";


// Real Gracia Fab community/UGC photos — no per-photo handles attributed,
// since we don't have real customer posts to credit yet. Split into 3
// explicit columns (rather than CSS multi-column) so the first column can
// start lower than the other two, matching the staggered Pinterest-style
// layout in the reference design.
const COMMUNITY_COLUMNS = [
  [
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789303968/comm_1_he724a.jpg", ratio: "1 / 1" },
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789304026/comm_3_erojul.jpg", ratio: "3 / 5" },
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789304095/comm_8_o2m0l7.webp", ratio: "4 / 3.6" },
  ],
  [
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789304042/comm_4_mb6m9i.webp", ratio: "3 / 4" },
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789304077/comm_6_mmjgxd.jpg", ratio: "3 / 4.3" },
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789576206/poses_r1jfr7.avif", ratio: "3 / 4" },
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789576229/poses_1_spktdm.webp", ratio: "4 / 5" },
  ],
  [
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789303989/comm_2_pxlxxa.jpg", ratio: "3 / 4.2" },
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789304059/comm_5_hykbme.webp", ratio: "1 / 1" },
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789576253/poses_2_u3sh5d.webp", ratio: "4 / 5.6" },
    { src: "https://res.cloudinary.com/dyzkjerez/image/upload/v1789576285/poses_4_oti0mw.webp", ratio: "3 / 4" },
  ],
];

// Grounded in what the store actually does today — delivery fee, payment
// rails and the wig-purity guarantee are pulled from Checkout and About,
// not invented, so this never promises something the site doesn't do.
const FAQ_ITEMS = [
  {
    q: "How does the AI Beauty Advisor work?",
    a: "Answer a few quick questions about your skin, hair and goals in our AI Advisor — no account needed — and get matched products plus a personalised routine in seconds.",
  },
  {
    q: "Do I need an account to shop?",
    a: "No — you can browse, use the AI Advisor, and add items to your bag as a guest. You'll only need to sign in when you're ready to check out, so we can process and track your order.",
  },
  {
    q: "Where do you deliver, and how much does it cost?",
    a: "We deliver nationwide across Nigeria for a flat ₦2,500 delivery fee, calculated at checkout.",
  },
  {
    q: "How can I pay?",
    a: "Checkout is secured by Paystack — you can pay by card, bank transfer, or USSD.",
  },
  {
    q: "Are your wigs genuine human hair?",
    a: "Yes — every wig is 100% single-donor raw hair, inspected through a 14-point check in Lagos and backed by our money-back purity guarantee.",
  },
  {
    q: "Is my selfie safe when I use Skin Analysis?",
    a: "Your photo is sent directly to our AI for that one analysis and isn't stored on our servers.",
  },
];

function Home({ onCartOpen }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const bestSellersTrackRef = useRef(null);
  const faqSectionRef = useRef(null);
  const location = useLocation();

  // Let the Navbar's FAQ link ("/#faq") work from any page, and also work
  // when clicked while already on the home page (a route change alone
  // wouldn't remount this component or trigger the browser's native
  // hash-scroll, since the target element didn't exist yet at nav time).
  useEffect(() => {
    if (location.hash === "#faq" && faqSectionRef.current) {
      faqSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/products/featured`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setFeaturedProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setFeaturedProducts([]);
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keeps the arrow buttons dynamic — disabled once there's nothing left
  // to scroll to in that direction, instead of always looking clickable.
  useEffect(() => {
    const track = bestSellersTrackRef.current;
    if (!track || featuredProducts.length === 0) return;

    const updateScrollState = () => {
      setCanScrollLeft(track.scrollLeft > 4);
      setCanScrollRight(
        track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
      );
    };

    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [featuredProducts]);

  const scrollBestSellers = (direction) => {
    const track = bestSellersTrackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  };

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount || 0);


  return (
    <div className="ysl-home-page">
      <SEO
        title="Gracia Fab — AI-Powered Beauty, Skincare, Haircare, Wigs & Bridal"
        description="Shop Gracia Fab's AI-matched skincare, haircare, wigs and bridal beauty essentials, curated for Nigerian skin, hair and climate."
        keywords="beauty Nigeria, skincare Lagos, haircare products, wigs Nigeria, bridal beauty, AI beauty advisor"
        url="/"
      />

      <Navbar onCartOpen={onCartOpen} transparent />

      <main>
      {/* ── SECTION 1: HERO ── */}
      <section className="ysl-hero-section">
        <div className="ysl-hero-bg">
          <div className="ysl-hero-glow" />
          <video
            className="ysl-hero-video"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          >
            <source
              src="https://res.cloudinary.com/dyzkjerez/video/upload/v1789284554/Generate_a_high_end_glossy_c_1_arwzb5.mp4"
              type="video/mp4"
            />
          </video>
          <div className="ysl-hero-overlay" />
          <div className="ysl-hero-watermark-mask" />
        </div>

        <div className="ysl-hero-content">
          <h1 className="ysl-hero-title">
            Beauty, matched<br />to you.
          </h1>
          <p className="ysl-hero-tagline">
            AI-powered skincare, haircare, wigs &amp; bridal beauty for Nigerian skin, hair and climate.
          </p>
          <div className="ysl-hero-actions">
            <Link to="/products" className="ysl-hero-btn">
              <span className="ysl-hero-btn-sparkles" aria-hidden="true">
                <span className="sparkle s1">✦</span>
                <span className="sparkle s2">✧</span>
                <span className="sparkle s3">✦</span>
                <span className="sparkle s4">✧</span>
              </span>
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION: BEST SELLERS ── */}
      {!featuredLoading && featuredProducts.length > 0 && (
        <section className="ysl-bestsellers-section">
          <div className="ysl-bestsellers-header">
            <div>
              <h2 className="ysl-bestsellers-title">
                Best Sellers <span className="ysl-bestsellers-star">✦</span>
              </h2>
              <p className="ysl-bestsellers-sub">Meet our most-loved picks</p>
            </div>
            <div className="ysl-bestsellers-arrows">
              <button
                className="ysl-carousel-arrow-btn"
                onClick={() => scrollBestSellers(-1)}
                disabled={!canScrollLeft}
                aria-label="Scroll best sellers left"
              >
                ←
              </button>
              <button
                className="ysl-carousel-arrow-btn"
                onClick={() => scrollBestSellers(1)}
                disabled={!canScrollRight}
                aria-label="Scroll best sellers right"
              >
                →
              </button>
            </div>
          </div>

          <div className="ysl-bestsellers-track" ref={bestSellersTrackRef}>
            {featuredProducts.map((product) => (
              <Link
                to={`/products/${product._id}`}
                key={product._id}
                className="ysl-bestseller-card"
                onMouseEnter={() => setHoveredProductId(product._id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <div className="ysl-bestseller-media">
                  <img
                    src={
                      hoveredProductId === product._id && product.secondaryImage
                        ? product.secondaryImage
                        : product.image
                    }
                    alt={product.name}
                    className="ysl-bestseller-img"
                  />
                  <span className="ysl-bestseller-sparkle">✦✦</span>
                </div>
                <h3 className="ysl-bestseller-name">{product.name}</h3>
                <span className="ysl-bestseller-price">{formatPrice(product.price)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION: AI BEAUTY ADVISOR ── */}
      <section className="ysl-ai-finder-section">
        <h2 className="ysl-ai-finder-title">
          AI Beauty <em>Advisor</em>
        </h2>
        <p className="ysl-ai-finder-heading">
          Find your perfect skincare, haircare, wig &amp; bridal picks with our AI Beauty Advisor, in just 4 simple steps.
        </p>
        <Link to="/recommend" className="ysl-ai-finder-btn">
          GET MATCHED
        </Link>

        <div className="ysl-ai-finder-images">
          <div className="ysl-ai-finder-img-wrap side">
            <img
              src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789292993/Gemini_Generated_Image_7pnrs27pnrs27pnr_rmvtpv.jpg"
              alt="Gracia Fab customer"
            />
          </div>
          <div className="ysl-ai-finder-img-wrap center">
            <img
              src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789293017/Gemini_Generated_Image_74kcfa74kcfa74kc_tdc1oz.jpg"
              alt="Gracia Fab customer"
            />
          </div>
          <div className="ysl-ai-finder-img-wrap side">
            <img
              src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789293050/Gemini_Generated_Image_alh6m3alh6m3alh6_bg6uwe.jpg"
              style={{ objectPosition: "88% 35%" }}
              alt="Gracia Fab customer"
            />
          </div>
        </div>

        <div className="ysl-ai-finder-steps">
          <span>TELL US ABOUT YOU</span>
          <span>SHARE YOUR CONCERNS</span>
          <span>AI FINDS YOUR MATCH</span>
          <span>SHOP YOUR PICKS</span>
        </div>
        <div className="ysl-ai-finder-progress" />
      </section>

      {/* ── SECTION: SHOP BY CATEGORY ── */}
      <section className="ysl-shopcat-section">
        <div className="ysl-shopcat-heading-strip">
          <h2 className="ysl-shopcat-title">
            Shop by<br />Category
          </h2>
        </div>

        <div className="ysl-shopcat-grid-wrap">
          <div className="ysl-shopcat-grid">
            <div className="ysl-shopcat-col offset">
              <Link to="/products?category=skincare" className="ysl-shopcat-card">
                <div className="ysl-shopcat-img-wrap" style={{ aspectRatio: "3 / 4" }}>
                  <img
                    src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789578054/poses_6_mnz88i.webp"
                    alt="Skincare"
                  />
                </div>
                <span className="ysl-shopcat-label">Skincare</span>
              </Link>

              <Link to="/products?category=wig" className="ysl-shopcat-card">
                <div className="ysl-shopcat-img-wrap" style={{ aspectRatio: "3 / 4.2" }}>
                  <img
                    src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789578101/poses_9_yt9tda.webp"
                    alt="Wigs"
                  />
                </div>
                <span className="ysl-shopcat-label">Wigs</span>
              </Link>
            </div>

            <div className="ysl-shopcat-col">
              <Link to="/products?category=haircare" className="ysl-shopcat-card">
                <div className="ysl-shopcat-img-wrap" style={{ aspectRatio: "4 / 3.3" }}>
                  <img
                    src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789578027/poses_5_lyj445.avif"
                    alt="Haircare"
                  />
                </div>
                <span className="ysl-shopcat-label">Haircare</span>
              </Link>

              <Link to="/products?category=bridal" className="ysl-shopcat-card">
                <div className="ysl-shopcat-img-wrap" style={{ aspectRatio: "4 / 3.6" }}>
                  <img
                    src="https://res.cloudinary.com/dyzkjerez/image/upload/v1789578081/poses_8_wjpags.jpg"
                    alt="Bridal"
                  />
                </div>
                <span className="ysl-shopcat-label">Bridal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: COMMUNITY ── */}
      <section className="ysl-community-section">
        <div className="ysl-community-header">
          <h2 className="ysl-community-title">
            Loved by you <span className="ysl-community-star">✦</span>
          </h2>
          <p className="ysl-community-sub">Tag us on IG @graciafab</p>
        </div>

        <div className="ysl-community-grid">
          {COMMUNITY_COLUMNS.map((column, colIdx) => (
            <div
              key={colIdx}
              className={`ysl-community-col ${colIdx === 0 ? "offset" : ""}`}
            >
              {column.map((photo, idx) => (
                <div
                  key={idx}
                  className="ysl-community-item"
                  style={{ aspectRatio: photo.ratio }}
                >
                  <img src={photo.src} alt="Gracia Fab community" loading="lazy" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="ysl-community-cta-wrap">
          <Link to="/register" className="ysl-community-cta-btn">
            Join the community <span className="ysl-community-star">✦</span>
          </Link>
        </div>
      </section>

      {/* ── SECTION: OUR COMMITMENT ── */}
      <section className="ysl-commitment-section">
        <span className="ysl-commitment-sparkle" aria-hidden="true">✦</span>
        <div className="ysl-commitment-watermark" aria-hidden="true">GRACIA FAB</div>

        <div className="ysl-commitment-content">
          <h2 className="ysl-commitment-title">Our Commitment</h2>
          <p className="ysl-commitment-sub">
            We prioritize safe formulations and genuine quality in every product we curate.
            <br />
            Beauty you can trust, made for Nigerian skin, hair and climate.
          </p>

          <div className="ysl-commitment-badges">
            <div className="ysl-commitment-badge">
              <span className="ysl-commitment-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <span className="ysl-commitment-label">Gentle &amp; Safe</span>
            </div>

            <div className="ysl-commitment-badge">
              <span className="ysl-commitment-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 19c9-1 13-6 14-14-9 0-14 5-15 13v1z" />
                  <path d="M5 19c3.5-3.5 7-7 12-12" />
                </svg>
              </span>
              <span className="ysl-commitment-label">Premium Quality</span>
            </div>

            <div className="ysl-commitment-badge">
              <span className="ysl-commitment-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12M6 21h12M7 3c0 5 3 7 5 8-2 1-5 3-5 8M17 3c0 5-3 7-5 8 2 1 5 3 5 8" />
                </svg>
              </span>
              <span className="ysl-commitment-label">Made to Last</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: FAQ ── */}
      <section className="ysl-faq-section" id="faq" ref={faqSectionRef}>
        <div className="ysl-faq-inner">
          <h2 className="ysl-faq-title">Frequently Asked Questions</h2>
          <p className="ysl-faq-sub">Everything you need to know before you shop.</p>

          <div className="ysl-faq-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={item.q} className={`ysl-faq-item ${openFaq === i ? "open" : ""}`}>
                <button
                  type="button"
                  className="ysl-faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  {item.q}
                  <span className="ysl-faq-icon" aria-hidden="true">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && <p className="ysl-faq-answer">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      </main>

      <Footer />
    </div>
  );
}

export default Home;
