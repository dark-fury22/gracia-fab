import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/About.css";
import SEO from "../components/SEO";

function About({ onCartOpen }) {
  return (
    <>
      <SEO
        title="Craftsmanship & Raw Hair Philosophy"
        description="Discover the science of 100% single-donor raw hair, precision HD melt lace, and AI complexion pairing at Gracia Fab. Tested and crafted in Lagos, Nigeria."
        keywords="raw hair Nigeria, single donor hair Lagos, HD melt lace, 12A raw hair, wig craftsmanship Nigeria"
        url="/about"
      />
      <Navbar onCartOpen={onCartOpen} />

      <div className="craft-page">
        {/* ── 1. Dark Cinematic Espresso Hero (Sample 2) ── */}
        <section className="craft-hero">
          <div className="craft-hero-inner">
            <div className="craft-hero-text">
              <span className="craft-eyebrow">OUR CRAFTSMANSHIP & PHILOSOPHY</span>
              <h1 className="craft-hero-title">
                Welcome to hair
                <br />
                <em className="craft-highlight">perfection.</em>
              </h1>
              <p className="craft-hero-sub">
                We reject synthetic coatings, acid-stripped cuticles, and mixed floor hair.
                Gracia Fab was founded on an uncompromising principle: every strand must be
                100% single-donor raw hair, preserved with natural cuticles intact and aligned.
              </p>

              <div className="craft-metrics-grid">
                <div className="craft-metric-item">
                  <strong>100%</strong>
                  <span>Single Donor</span>
                </div>
                <div className="craft-metric-item">
                  <strong>5+ Yrs</strong>
                  <span>Wear Longevity</span>
                </div>
                <div className="craft-metric-item">
                  <strong>0.08mm</strong>
                  <span>Invisible HD Lace</span>
                </div>
                <div className="craft-metric-item">
                  <strong>450°F</strong>
                  <span>Heat Resilient</span>
                </div>
              </div>
            </div>

            <div className="craft-hero-media">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=900&fit=crop&crop=face"
                alt="100% Single Donor Raw Hair Braid"
                className="craft-hero-img"
              />
              <div className="craft-hero-badge">
                <span>12A+ Grade</span>
                <strong>Raw Cuticle Hair</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. "The Unprocessed Difference" Split Section (Sample 2) ── */}
        <section className="craft-difference-split">
          <div className="craft-difference-inner">
            <div className="craft-difference-visual">
              <div className="craft-visual-frame">
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&h=850&fit=crop&crop=center"
                  alt="Raw Hair Macro Serum Application"
                  className="craft-macro-img"
                />
                <div className="craft-visual-tag">
                  <span>12A+ Raw Cuticle Hair</span>
                </div>
              </div>
            </div>

            <div className="craft-difference-copy">
              <span className="craft-eyebrow-terracotta">THE UNPROCESSED DIFFERENCE</span>
              <h2 className="craft-diff-title">
                Raw hair that acts like your own natural crown.
              </h2>
              <p className="craft-diff-lead">
                Unlike commercial "virgin hair" that has been bathed in acid to simulate softness and coated with silicones that wash away after two shampoos, authentic raw hair is pure, untouched human keratin.
              </p>
              <p className="craft-diff-body">
                It responds exactly like healthy natural hair: it absorbs moisture, holds curls effortlessly, can be lifted cleanly to 613 platinum blonde without melting, and maintains its natural fluid sway for over five years of continuous wear.
              </p>
              <a href="#sourcing" className="craft-text-link">
                Explore our sourcing standards →
              </a>
            </div>
          </div>
        </section>

        {/* ── 3. Dark Accent Quote Bar (Sample 2) ── */}
        <section className="craft-quote-bar">
          <div className="craft-quote-bar-inner">
            <p className="craft-quote-bar-text">
              "When you wear raw hair that has never been chemically stripped,
              <span className="craft-quote-accent"> you feel the weightless movement instantly.</span>"
            </p>
          </div>
        </section>

        {/* ── 4. "Beautiful hair requires pure craft" 4-Pillar Dark Card (Sample 2) ── */}
        <section className="craft-pillars-dark">
          <div className="craft-pillars-inner">
            <div className="craft-pillars-left">
              <span className="craft-eyebrow">STANDARDS OF EXCELLENCE</span>
              <h2 className="craft-pillars-title">
                Beautiful hair without compromise.
                <br />
                <span className="craft-pillars-italic">Crafted for royalty.</span>
              </h2>
              <p className="craft-pillars-sub">
                Every unit passes through a rigorous 14-point inspection in Lagos before being packaged in our signature velvet box.
              </p>
            </div>

            <div className="craft-pillars-right">
              <div className="craft-pillar-row">
                <span className="craft-pillar-num">01</span>
                <div className="craft-pillar-content">
                  <h3>Cuticles Intact & Aligned</h3>
                  <p>All strands face the exact same direction from root to tip. Zero matting, zero rat-nesting, and maximum natural bounce.</p>
                </div>
              </div>

              <div className="craft-pillar-row">
                <span className="craft-pillar-num">02</span>
                <div className="craft-pillar-content">
                  <h3>Single Donor Purity</h3>
                  <p>Cut directly from a single donor ponytail. Uniform elasticity and texture consistency from end to end.</p>
                </div>
              </div>

              <div className="craft-pillar-row">
                <span className="craft-pillar-num">03</span>
                <div className="craft-pillar-content">
                  <h3>HD Invisible Melt Lace</h3>
                  <p>Ultra-thin 0.08mm Swiss lace mesh that disappears into rich melanin skin tones under 4K sunlight.</p>
                </div>
              </div>

              <div className="craft-pillar-row">
                <span className="craft-pillar-num">04</span>
                <div className="craft-pillar-content">
                  <h3>Hand-Tied Density Ventilation</h3>
                  <p>Single-hair micro knots replicate the natural gradual emergence of hair follicles along the scalp.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. "What is a TOP 1% SMART raw wig?" 3-Column Breakdown (Sample 2) ── */}
        <section className="craft-smart-section">
          <div className="craft-smart-inner">
            <div className="craft-smart-header">
              <span className="craft-eyebrow-terracotta">THE AI BEAUTY REVOLUTION</span>
              <h2 className="craft-smart-title">
                What is a <span className="craft-smart-highlight">TOP 1% SMART</span> raw wig?
              </h2>
              <p className="craft-smart-sub">
                We combine ancestral hair craftsmanship with AI skin-tone detection to guarantee an effortless, custom match.
              </p>
            </div>

            <div className="craft-smart-grid">
              <div className="craft-smart-col">
                <span className="craft-col-num">01</span>
                <h3>AI Complexion Pairing</h3>
                <p>
                  Our proprietary AI Beauty Advisor analyzes undertones, complexion depth, and face shape to recommend optimal lace tints and hair densities.
                </p>
              </div>

              <div className="craft-smart-col">
                <span className="craft-col-num">02</span>
                <h3>Pre-Plucked Precision Hairline</h3>
                <p>
                  Graduated density with hand-plucked micro baby hairs creates an undetectable hairline transition right out of the box.
                </p>
              </div>

              <div className="craft-smart-col">
                <span className="craft-col-num">03</span>
                <h3>Ergonomic Glueless Cap System</h3>
                <p>
                  3D-contoured ear tabs, memory silicone grips, and an adjustable elastic tension band ensure a 10-second slip-on fit with zero messy glue.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Macro Inspection Gallery (Sample 2) ── */}
        <section className="craft-macro-gallery">
          <div className="craft-macro-header">
            <span className="craft-eyebrow">LABORATORY RIGOR</span>
            <h2 className="craft-macro-title">Macro Inspection Gallery</h2>
            <p className="craft-macro-sub">
              Every bundle is tested for heat recovery, bleach integrity, and lace sheer transparency.
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
              Never settle for less
              <br />
              than raw perfection.
            </h2>
            <p className="craft-final-sub">
              Experience the breath of fresh air that comes with lightweight, single-donor luxury hair.
            </p>

            <div className="craft-final-buttons">
              <Link to="/products" className="craft-btn-primary">
                Shop All Raw Wigs →
              </Link>
              <Link to="/recommend" className="craft-btn-outline">
                Take AI Complexion Quiz ✦
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
