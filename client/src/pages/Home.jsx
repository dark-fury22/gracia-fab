import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import "../styles/YslHome.css";

const ONLINE_EXCLUSIVES = [
  {
    title: "GRACIA FAB CLUB",
    desc: "Exclusive loyalty privileges, private vault pre-launches & luxury birthday gift boxes.",
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=85",
    linkText: "JOIN NOW",
    linkUrl: "/register",
  },
  {
    title: "VIRTUAL TRY ON",
    desc: "Experience lip shades, complexion tints and wig lengths live with our AI camera detector.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=85",
    linkText: "TRY LIVE",
    linkUrl: "/skin-tone",
  },
  {
    title: "PRODUCT ADVISOR",
    desc: "Personalized diagnostic matching your skin undertone, scalp health and climatic needs.",
    image: "https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?w=600&auto=format&fit=crop&q=85",
    linkText: "START DIAGNOSTIC",
    linkUrl: "/recommend",
  },
];

const SOCIAL_POSTS = [
  {
    id: 1,
    handle: "@graciafab",
    location: "Victoria Island, Lagos",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=85",
    tag: "#GraciaFabBeauty",
  },
  {
    id: 2,
    handle: "@amina.couture",
    location: "Abuja, Nigeria",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=85",
    tag: "#GraciaFabGlow",
  },
  {
    id: 3,
    handle: "@chidinma_glam",
    location: "Lekki Phase 1",
    image: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&auto=format&fit=crop&q=85",
    tag: "#HauteBeautyLagos",
  },
  {
    id: 4,
    handle: "@zainab.atelier",
    location: "London · Lagos",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=85",
    tag: "#RawHairMaison",
  },
];

function Home({ onCartOpen }) {
  const [socialIndex, setSocialIndex] = useState(0);

  const nextSocial = () => {
    setSocialIndex((prev) => (prev + 1) % SOCIAL_POSTS.length);
  };

  const prevSocial = () => {
    setSocialIndex((prev) => (prev - 1 + SOCIAL_POSTS.length) % SOCIAL_POSTS.length);
  };

  return (
    <div className="ysl-home-page">
      <SEO
        title="Gracia Fab — AI-Powered Beauty, Skincare, Haircare, Wigs & Bridal"
        description="Shop Gracia Fab's AI-matched skincare, haircare, wigs and bridal beauty essentials, curated for Nigerian skin, hair and climate."
        keywords="beauty Nigeria, skincare Lagos, haircare products, wigs Nigeria, bridal beauty, AI beauty advisor"
        url="/"
      />

      <Navbar onCartOpen={onCartOpen} />

      <main>
      {/* ── SECTION 1: HERO ── */}
      <section className="ysl-hero-section">
        <div className="ysl-hero-bg">
          <div className="ysl-hero-glow" />
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1920&auto=format&fit=crop&q=85"
            alt="Gracia Fab beauty"
            className="ysl-hero-img playing"
          />
          <div className="ysl-hero-overlay" />
        </div>

        <div className="ysl-hero-content">
          <span className="ysl-hero-badge">AI BEAUTY ADVISOR</span>
          <h1 className="ysl-hero-title">
            SKINCARE. HAIRCARE.<br />WIGS. BRIDAL.
          </h1>
          <p className="ysl-hero-tagline">
            AI-MATCHED BEAUTY ESSENTIALS FOR NIGERIAN SKIN, HAIR AND CLIMATE.
          </p>
          <div className="ysl-hero-actions">
            <Link to="/products" className="ysl-hero-btn">
              SHOP NOW
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: ONLINE EXCLUSIVES ── */}
      <section className="ysl-online-exclusives-section">
        <div className="ysl-section-header">
          <h2 className="ysl-section-title">ONLINE EXCLUSIVES</h2>
          <p className="ysl-section-subtitle">
            BESPOKE CONCIERGE &amp; ARTIFICIAL INTELLIGENCE SERVICES
          </p>
        </div>

        <div className="ysl-exclusives-grid">
          {ONLINE_EXCLUSIVES.map((card, idx) => (
            <div key={idx} className="ysl-exclusive-card">
              <div className="ysl-exclusive-img-wrap">
                <img src={card.image} alt={card.title} className="ysl-exclusive-img" />
              </div>
              <div className="ysl-exclusive-body">
                <h3 className="ysl-exclusive-title">{card.title}</h3>
                <p className="ysl-exclusive-desc">{card.desc}</p>
                <Link to={card.linkUrl} className="ysl-exclusive-cta">
                  {card.linkText} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: SOCIAL UGC CAROUSEL (@GRACIAFAB ON SOCIAL) ── */}
      <section className="ysl-social-section">
        <div className="ysl-section-header">
          <h2 className="ysl-section-title">DISCOVER @GRACIAFAB ON SOCIAL</h2>
          <p className="ysl-section-subtitle">
            TAG #GRACIAFAB TO BE FEATURED IN OUR COUTURE BEAUTY VAULT
          </p>
        </div>

        <div className="ysl-social-carousel-wrap">
          <div className="ysl-social-grid">
            {[
              ...SOCIAL_POSTS.slice(socialIndex),
              ...SOCIAL_POSTS.slice(0, socialIndex),
            ].map((post) => (
              <div key={post.id} className="ysl-social-card">
                <img src={post.image} alt={post.tag} className="ysl-social-img" />
                <div className="ysl-social-hover-overlay">
                  <span className="ysl-social-handle">{post.handle}</span>
                  <span className="ysl-social-loc">{post.location}</span>
                  <span className="ysl-social-tag">{post.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="ysl-social-arrows">
            <button onClick={prevSocial} className="ysl-carousel-arrow" aria-label="Previous social slide">
              ←
            </button>
            <button onClick={nextSocial} className="ysl-carousel-arrow" aria-label="Next social slide">
              →
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: BOLD BRAND STATEMENT HEADER ── */}
      <section className="ysl-statement-section">
        <div className="ysl-statement-inner">
          <span className="ysl-statement-accent">MAISON DE BEAUTÉ</span>
          <h2 className="ysl-statement-headline">
            GRACIA FAB: YOUR BOLD BEAUTY OBSESSION
          </h2>
          <p className="ysl-statement-sub">
            COUTURE BEAUTY, HIGH-TECH FORMULATION &amp; RAW LUXURY FOR THE MODERN AFRICAN WOMAN.
          </p>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
