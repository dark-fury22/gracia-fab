import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/About.css";
import SEO from "../components/SEO";

function About({ onCartOpen }) {
  return (
    <>
      <SEO
        title="About Gracia Fab"
        description="Gracia Fab is Nigeria's AI-powered beauty advisor — matching you to skincare, haircare, wigs and bridal beauty from one quick profile. Based in Lagos, shipping nationwide."
        keywords="AI beauty advisor Nigeria, skincare Lagos, haircare Nigeria, raw hair wigs, bridal beauty Nigeria"
        url="/about"
      />
      <Navbar onCartOpen={onCartOpen} />

      <div className="craft-page" role="main">
        {/* ── 1. Dark Cinematic Espresso Hero (Sample 2) ── */}
        <section className="craft-hero">
          <div className="craft-hero-inner">
            <div className="craft-hero-text">
              <span className="craft-eyebrow">WHO WE ARE</span>
              <h1 className="craft-hero-title">
                Beauty, matched
                <br />
                <em className="craft-highlight">to you.</em>
              </h1>
              <p className="craft-hero-sub">
                Gracia Fab is Nigeria's AI-powered beauty advisor and store. Answer a
                few quick questions once, and our AI matches you to skincare,
                haircare, wigs and bridal beauty picks curated for your skin, hair
                and climate — no guesswork, no repeat forms.
              </p>

              <div className="craft-metrics-grid">
                <div className="craft-metric-item">
                  <strong>4</strong>
                  <span>Categories, One Profile</span>
                </div>
                <div className="craft-metric-item">
                  <strong>AI</strong>
                  <span>Matched Recommendations</span>
                </div>
                <div className="craft-metric-item">
                  <strong>Lagos</strong>
                  <span>Based &amp; Inspected</span>
                </div>
                <div className="craft-metric-item">
                  <strong>NGN</strong>
                  <span>Nationwide Delivery</span>
                </div>
              </div>
            </div>

            <div className="craft-hero-media">
              <img
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=900&fit=crop&crop=face"
                alt="Gracia Fab beauty products"
                className="craft-hero-img"
              />
              <div className="craft-hero-badge">
                <span>AI-Matched</span>
                <strong>Skincare · Haircare · Wigs · Bridal</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Our Story ── */}
        <section className="craft-difference-split">
          <div className="craft-difference-inner">
            <div className="craft-difference-visual">
              <div className="craft-visual-frame">
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&h=850&fit=crop&crop=center"
                  alt="Gracia Fab skincare product"
                  className="craft-macro-img"
                />
                <div className="craft-visual-tag">
                  <span>One Profile, Every Category</span>
                </div>
              </div>
            </div>

            <div className="craft-difference-copy">
              <span className="craft-eyebrow-terracotta">WHY WE BUILT THIS</span>
              <h2 className="craft-diff-title">
                Beauty shopping shouldn't mean starting over on every page.
              </h2>
              <p className="craft-diff-lead">
                We kept seeing the same problem: a skin quiz here, a hair form there,
                a different questionnaire for every tool — and none of them talking
                to each other. So we built one AI Beauty Advisor that remembers what
                you tell it.
              </p>
              <p className="craft-diff-body">
                Tell it about your skin, hair, and goals once, and that profile
                carries across our Skin Analysis, Routine Generator and Skin Tone
                Detector — powering real product matches across skincare, haircare,
                wigs and bridal beauty, all from our Lagos-based store.
              </p>
              <Link to="/recommend" className="craft-text-link">
                Try the AI Beauty Advisor →
              </Link>
            </div>
          </div>
        </section>

        {/* ── 3. Dark Accent Quote Bar (Sample 2) ── */}
        <section className="craft-quote-bar">
          <div className="craft-quote-bar-inner">
            <p className="craft-quote-bar-text">
              "You shouldn't need four different apps to find products that actually
              <span className="craft-quote-accent"> suit your skin, your hair and your day.</span>"
            </p>
          </div>
        </section>

        {/* ── 4. Four ways we help you ── */}
        <section className="craft-pillars-dark">
          <div className="craft-pillars-inner">
            <div className="craft-pillars-left">
              <span className="craft-eyebrow">WHAT WE OFFER</span>
              <h2 className="craft-pillars-title">
                Four categories.
                <br />
                <span className="craft-pillars-italic">One matched experience.</span>
              </h2>
              <p className="craft-pillars-sub">
                Every product we carry is picked to work with your AI-matched
                profile, not just sit in a category page.
              </p>
            </div>

            <div className="craft-pillars-right">
              <div className="craft-pillar-row">
                <span className="craft-pillar-num">01</span>
                <div className="craft-pillar-content">
                  <h3>Skincare</h3>
                  <p>Cleansers, serums, moisturizers and treatments matched to your skin type and concerns — from brightening to hydration to anti-aging.</p>
                </div>
              </div>

              <div className="craft-pillar-row">
                <span className="craft-pillar-num">02</span>
                <div className="craft-pillar-content">
                  <h3>Haircare</h3>
                  <p>Growth, repair and everyday hair products chosen for your hair type and goals, with an AI-built routine to match.</p>
                </div>
              </div>

              <div className="craft-pillar-row">
                <span className="craft-pillar-num">03</span>
                <div className="craft-pillar-content">
                  <h3>Wigs</h3>
                  <p>Single-donor raw hair, HD lace and glueless caps — inspected in Lagos, with an AI skin-tone match for lace and density.</p>
                </div>
              </div>

              <div className="craft-pillar-row">
                <span className="craft-pillar-num">04</span>
                <div className="craft-pillar-content">
                  <h3>Bridal Beauty</h3>
                  <p>Skincare countdowns, makeup bundles and bridal wigs, matched to your wedding date so you can start prep with time to spare.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. How your AI match works ── */}
        <section className="craft-smart-section">
          <div className="craft-smart-inner">
            <div className="craft-smart-header">
              <span className="craft-eyebrow-terracotta">THE AI BEAUTY ADVISOR</span>
              <h2 className="craft-smart-title">
                How your <span className="craft-smart-highlight">AI match</span> works
              </h2>
              <p className="craft-smart-sub">
                No account required to get started — you'll only need to sign in
                when you're ready to check out.
              </p>
            </div>

            <div className="craft-smart-grid">
              <div className="craft-smart-col">
                <span className="craft-col-num">01</span>
                <h3>Tell Us About You</h3>
                <p>
                  A short wizard asks what you're shopping for, your skin and hair
                  type, and your goals — or your bridal style and wedding date if
                  that's what brought you here.
                </p>
              </div>

              <div className="craft-smart-col">
                <span className="craft-col-num">02</span>
                <h3>Get Matched Instantly</h3>
                <p>
                  We match you to real products from our catalog, plus a
                  personalised morning, night and weekly routine you can shop
                  straight from the results.
                </p>
              </div>

              <div className="craft-smart-col">
                <span className="craft-col-num">03</span>
                <h3>One Profile, Every Tool</h3>
                <p>
                  What you tell the AI Advisor carries over to Skin Analysis, the
                  Routine Generator and the Skin Tone Detector — so you never
                  answer the same question twice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Macro Inspection Gallery (Sample 2) ── */}
        <section className="craft-macro-gallery">
          <div className="craft-macro-header">
            <span className="craft-eyebrow">A CLOSER LOOK AT OUR WIGS</span>
            <h2 className="craft-macro-title">Macro Inspection Gallery</h2>
            <p className="craft-macro-sub">
              Our raw-hair wigs go through the same rigorous standards below — heat
              recovery, bleach integrity, and lace sheer transparency — before they
              reach the shop.
            </p>
          </div>

          <div className="craft-macro-cards">
            <div className="craft-lab-card">
              <div className="craft-lab-media">
                <img
                  src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&h=700&fit=crop&crop=face"
                  alt="Heat Styling Elasticity Test"
                />
              </div>
              <div className="craft-lab-info">
                <span className="craft-lab-stat">450°F Resilient</span>
                <h4>Thermal Styling Elasticity</h4>
                <p>Flat iron, crimp, or curl repeatedly. Wash and watch the natural wave pattern return with zero damage.</p>
              </div>
            </div>

            <div className="craft-lab-card">
              <div className="craft-lab-media">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=700&fit=crop&crop=face"
                  alt="Microscopic Cuticle Luster"
                />
              </div>
              <div className="craft-lab-info">
                <span className="craft-lab-stat">100% Intact</span>
                <h4>Microscopic Cuticle Alignment</h4>
                <p>Unstripped scales reflect light naturally without oily silicone coatings that wash away in hot water.</p>
              </div>
            </div>

            <div className="craft-lab-card">
              <div className="craft-lab-media">
                <img
                  src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=600&h=700&fit=crop&crop=face"
                  alt="HD Melt Lace Sheer Test"
                />
              </div>
              <div className="craft-lab-info">
                <span className="craft-lab-stat">0.08mm Swiss Mesh</span>
                <h4>HD Melt Transparency</h4>
                <p>Micro-fine Swiss lace that seamlessly melts into caramel, bronze, and deep espresso complexions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. Terracotta Callout Banner (Sample 2) ── */}
        <section className="craft-cta-strip">
          <div className="craft-cta-strip-inner">
            <p className="craft-cta-strip-text">
              Not sure which texture or lace shade matches your skin tone?
            </p>
            <Link to="/recommend" className="craft-cta-strip-btn">
              Take AI Complexion Quiz →
            </Link>
          </div>
        </section>

        {/* ── 8. "How do we compare?" The Raw Hair Truth Matrix (Sample 2) ── */}
        <section className="craft-matrix-section">
          <div className="craft-matrix-inner">
            <div className="craft-matrix-header">
              <span className="craft-eyebrow-terracotta">THE TRUTH MATRIX</span>
              <h2 className="craft-matrix-title">How do we compare?</h2>
              <p className="craft-matrix-sub">
                A transparent look at Gracia Fab 12A+ raw hair versus standard commercial alternatives.
              </p>
            </div>

            <div className="craft-table-wrapper">
              <table className="craft-comparison-table">
                <thead>
                  <tr>
                    <th>Quality Benchmark</th>
                    <th className="highlight-col">Gracia Fab 12A+ Raw Hair ✦</th>
                    <th>Standard Virgin Hair</th>
                    <th>Synthetic / Blends</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="row-title">Source & Purity</td>
                    <td className="highlight-col"><strong>100% Single Donor, Cuticles Intact</strong></td>
                    <td>Mixed bundles, floor sweepings</td>
                    <td>Plastic fibers & chemical filaments</td>
                  </tr>
                  <tr>
                    <td className="row-title">Expected Lifespan</td>
                    <td className="highlight-col"><strong>5+ Years of continuous wear</strong></td>
                    <td>3 – 6 Months before matting</td>
                    <td>2 – 4 Weeks maximum</td>
                  </tr>
                  <tr>
                    <td className="row-title">Bleaching Capacity</td>
                    <td className="highlight-col"><strong>Bleaches to #613 Platinum Blonde</strong></td>
                    <td>Max #27 Honey (turns brassy)</td>
                    <td>Cannot bleach (melts)</td>
                  </tr>
                  <tr>
                    <td className="row-title">Lace Construction</td>
                    <td className="highlight-col"><strong>0.08mm HD Swiss Melt Lace</strong></td>
                    <td>Thick opaque Korean lace</td>
                    <td>Hard plastic stiff grid</td>
                  </tr>
                  <tr>
                    <td className="row-title">Heat Tolerance</td>
                    <td className="highlight-col"><strong>Up to 450°F with full recovery</strong></td>
                    <td>Max 350°F, loses curl memory</td>
                    <td>Burns & fuses</td>
                  </tr>
                  <tr>
                    <td className="row-title">Glueless Wearability</td>
                    <td className="highlight-col"><strong>100% Glueless 3D Ergonomic Fit</strong></td>
                    <td>Requires heavy glue / adhesives</td>
                    <td>Non-breathable, itchy</td>
                  </tr>
                  <tr>
                    <td className="row-title">Silicon Coating</td>
                    <td className="highlight-col"><strong>Zero silicones — pure natural luster</strong></td>
                    <td>Heavy silicone bath (washes off)</td>
                    <td>Artificial chemical gloss</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── 9. "Where do we source?" Ethical Sourcing & Traceability (Sample 2) ── */}
        <section id="sourcing" className="craft-sourcing-section">
          <div className="craft-sourcing-inner">
            <div className="craft-sourcing-header">
              <span className="craft-eyebrow">GLOBAL TRACEABILITY</span>
              <h2 className="craft-sourcing-title">Where do we source?</h2>
              <p className="craft-sourcing-sub">
                Every bundle is ethically acquired through direct partnerships that support donor communities.
              </p>
            </div>

            <div className="craft-origins-grid">
              <div className="craft-origin-card">
                <span className="craft-origin-flag">🇮🇳</span>
                <h4>South Indian Temples</h4>
                <p className="craft-origin-type">Natural Body Wave & Soft Curl</p>
                <p className="craft-origin-desc">
                  Ethically gathered through sacred tonsure traditions. Renowned for its fine, silky strand structure and airy bounce.
                </p>
              </div>

              <div className="craft-origin-card">
                <span className="craft-origin-flag">🇻🇳</span>
                <h4>Vietnamese Highlands</h4>
                <p className="craft-origin-type">Super Double Drawn Bone Straight</p>
                <p className="craft-origin-desc">
                  Cold-water washed and nourished with herbal extracts. Known for unrivaled thickness from root to tip.
                </p>
              </div>

              <div className="craft-origin-card">
                <span className="craft-origin-flag">🇰🇭</span>
                <h4>Cambodian Villages</h4>
                <p className="craft-origin-type">Deep Wave & Coarse Textured</p>
                <p className="craft-origin-desc">
                  Naturally coarse and textured strands that blend impeccably with textured 3C–4C natural leave-out.
                </p>
              </div>

              <div className="craft-origin-card">
                <span className="craft-origin-flag">🇧🇷</span>
                <h4>Brazilian Coast</h4>
                <p className="craft-origin-type">Lustrous Natural Wave</p>
                <p className="craft-origin-desc">
                  Naturally full and rich in shine, holding dramatic pin curls and voluminous blowout styles for days.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 10. "The Art of the Finish" 3 Editorial Cards (Sample 2) ── */}
        <section className="craft-finish-section">
          <div className="craft-finish-inner">
            <div className="craft-finish-header">
              <span className="craft-eyebrow-terracotta">FINAL TOUCHES</span>
              <h2 className="craft-finish-title">The Art of the Finish</h2>
            </div>

            <div className="craft-finish-cards">
              <div className="craft-finish-card">
                <div className="craft-finish-media">
                  <img
                    src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=700&fit=crop&crop=face"
                    alt="Super Double Drawn Ends"
                  />
                </div>
                <h4>Super Double Drawn Ends</h4>
                <p>Every short hair is manually picked out, leaving thick, lush volume from roots all the way to the tips.</p>
              </div>

              <div className="craft-finish-card">
                <div className="craft-finish-media">
                  <img
                    src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=700&fit=crop&crop=face"
                    alt="Bleached & Tinted Knots"
                  />
                </div>
                <h4>Invisible Bleached Knots</h4>
                <p>Meticulously hand-bleached to eliminate dark follicle dots, delivering the illusion of hair growing from your scalp.</p>
              </div>

              <div className="craft-finish-card">
                <div className="craft-finish-media">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=700&fit=crop&crop=face"
                    alt="Zero Chemical Odor"
                  />
                </div>
                <h4>Zero Silicones or Odors</h4>
                <p>Fresh, clean, organic herbal scent without sulfur, acid baths, or cheap perfumes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 11. Dark Trust Guarantee Banner (Sample 2) ── */}
        <section className="craft-guarantee-banner">
          <div className="craft-guarantee-inner">
            <span className="craft-guarantee-badge">LAGOS CERTIFIED</span>
            <p className="craft-guarantee-text">
              100% money-back raw hair purity guarantee. Inspected, tested, and certified in Lagos, Nigeria.
            </p>
          </div>
        </section>

        {/* ── 12. Terracotta Final CTA Banner (Sample 2) ── */}
        <section className="craft-final-cta">
          <div className="craft-final-cta-inner">
            <h2 className="craft-final-title">
              Never settle for
              <br />
              a generic routine.
            </h2>
            <p className="craft-final-sub">
              Get matched to skincare, haircare, wigs and bridal beauty built around you.
            </p>

            <div className="craft-final-buttons">
              <Link to="/products" className="craft-btn-primary">
                Shop All Products →
              </Link>
              <Link to="/recommend" className="craft-btn-outline">
                Take the AI Beauty Quiz ✦
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default About;
