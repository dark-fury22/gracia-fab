import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import API_URL from "../config";
import "../styles/BeautyLanding.css";

// SEO page definitions — add as many as you want
export const LANDING_PAGES = {
  // SKINCARE
  "best-moisturiser-oily-skin-nigeria": {
    title: "Best Moisturiser for Oily Skin in Nigeria (2026)",
    h1: "Best Moisturiser for Oily Skin in Nigeria",
    description:
      "Discover the top oil-free moisturisers and skincare products for oily skin in Nigeria. Expert picks from Gracia Fab — delivered across Lagos, Abuja & more.",
    keywords:
      "best moisturiser oily skin Nigeria, oil-free moisturiser Lagos, skincare oily skin Nigeria",
    category: "skincare",
    skinType: "oily",
    intro: `Living in Nigeria with oily skin is a unique challenge. The hot, humid climate of Lagos and other cities can trigger excess sebum production, leaving skin looking shiny and prone to breakouts. The right moisturiser can transform your skin routine.`,
    tips: [
      'Look for "non-comedogenic" or "oil-free" on the label',
      "Use a toner with niacinamide to control sebum first",
      "Apply moisturiser even if your skin feels oily — dehydrated skin overproduces oil",
      "Gel-based formulas work best in Nigeria's heat",
      "Always use SPF in the morning — UV rays worsen oiliness",
    ],
    faq: [
      {
        q: "Should oily skin in Nigeria still use moisturiser?",
        a: "Yes! Skipping moisturiser causes your skin to produce even more oil. Choose lightweight, water-based formulas.",
      },
      {
        q: "What ingredients help control oiliness?",
        a: "Niacinamide, hyaluronic acid, salicylic acid, and zinc are excellent for oily skin in tropical climates.",
      },
      {
        q: "How often should I moisturise oily skin?",
        a: "Twice daily — morning and night. Always cleanse before applying.",
      },
    ],
  },
  "best-wig-oval-face-nigeria": {
    title: "Best Wigs for Oval Face Shape in Nigeria (2026)",
    h1: "Best Wigs for Oval Face Shape in Nigeria",
    description:
      "Find the perfect wig style for your oval face in Nigeria. Lace fronts, bobs, body waves and more — curated by Gracia Fab beauty experts.",
    keywords:
      "best wig oval face Nigeria, wig styles Lagos, lace front wigs Nigeria, oval face wig",
    category: "wig",
    intro: `If you have an oval face shape, you're in luck — it's considered the most versatile face shape for wigs. Almost any style works, but certain cuts enhance your natural beauty even more.`,
    tips: [
      "Most wig styles suit oval faces — you have maximum flexibility",
      "Long waves and curls elongate your natural features beautifully",
      "Bob wigs at jaw-length highlight your cheekbones",
      "Avoid extremely voluminous styles at the crown — they can make the face appear longer",
      "Side parts are universally flattering on oval faces",
    ],
    faq: [
      {
        q: "What is an oval face shape?",
        a: "An oval face is longer than it is wide, with a rounded jaw and forehead. Cheekbones are typically the widest point.",
      },
      {
        q: "What wig lengths suit oval faces?",
        a: "Medium to long lengths (12–24 inches) work beautifully. Short bobs also look stunning on oval faces.",
      },
      {
        q: "Are lace fronts good for oval faces?",
        a: "Yes! Lace fronts give a natural hairline that suits oval face shapes perfectly, especially with side parts.",
      },
    ],
  },
  "bridal-skincare-routine-nigeria": {
    title: "Bridal Skincare Routine for Nigerian Brides (2026)",
    h1: "Complete Bridal Skincare Routine for Nigerian Brides",
    description:
      "Start your bridal glow journey 4–8 weeks before your wedding. Gracia Fab's expert bridal skincare routine for Nigerian skin tones.",
    keywords:
      "bridal skincare Nigeria, wedding skincare routine Lagos, Nigerian bride glow routine",
    category: "bridal",
    intro: `Your wedding day is one of the most photographed days of your life. A consistent skincare routine starting 4–8 weeks before the ceremony gives your skin enough time to transform and glow naturally.`,
    tips: [
      "Start your bridal routine at least 6–8 weeks before your wedding",
      "Never try new products within 2 weeks of the wedding day",
      "Stay hydrated — drink at least 2 litres of water daily",
      "Get 7–8 hours of sleep for natural skin renewal",
      "Do a trial run of your full makeup look 4 weeks before",
    ],
    faq: [
      {
        q: "When should I start my bridal skincare routine?",
        a: "6–8 weeks before the wedding is ideal. This gives enough time for real improvements without rushing.",
      },
      {
        q: "What products do I need for a bridal glow?",
        a: "A good cleanser, vitamin C serum, moisturiser, SPF, and exfoliating treatment 2–3 times weekly.",
      },
      {
        q: "How do I avoid breakouts before my wedding?",
        a: "Keep to your routine, reduce stress, avoid sugary foods, and never pick at your skin.",
      },
    ],
  },
  "haircare-products-natural-hair-nigeria": {
    title: "Best Haircare Products for Natural Hair in Nigeria (2026)",
    h1: "Best Haircare Products for Natural Hair in Nigeria",
    description:
      "Top-rated haircare products for type 4 natural hair in Nigeria. Moisturisers, curl creams, growth oils and more from Gracia Fab.",
    keywords:
      "natural hair products Nigeria, type 4 hair Lagos, coily hair products Nigeria, natural hair care",
    category: "haircare",
    hairType: "coily",
    intro: `Natural hair in Nigeria deserves products formulated for our unique hair textures. From 4A to 4C coils, the right products lock in moisture, define curls, and promote healthy growth in Nigeria's climate.`,
    tips: [
      "The LOC method (Liquid, Oil, Cream) works beautifully for Nigerian natural hair",
      "Deep condition weekly to maintain moisture in dry harmattan conditions",
      "Protective styles reduce breakage and promote length retention",
      "Avoid sulfate shampoos that strip natural oils",
      "Castor oil massages stimulate scalp circulation for faster growth",
    ],
    faq: [
      {
        q: "How often should I wash natural hair in Nigeria?",
        a: "Every 1–2 weeks. Overwashing strips natural oils. Co-washing (conditioner only) can be done more frequently.",
      },
      {
        q: "What is the best oil for natural hair growth in Nigeria?",
        a: "Castor oil, peppermint oil, and rosemary oil are the top three proven growth-stimulating oils.",
      },
      {
        q: "How do I keep natural hair moisturised in Lagos heat?",
        a: "Seal moisture with heavy butters like shea after applying water-based products. Protective styles help retain moisture longer.",
      },
    ],
  },
  "skincare-routine-dark-skin-nigeria": {
    title: "Skincare Routine for Dark Skin in Nigeria (2026)",
    h1: "Best Skincare Routine for Dark Skin in Nigeria",
    description:
      "A dermatologist-approved skincare routine formulated for melanin-rich skin in Nigeria. Address hyperpigmentation, uneven tone, and dryness.",
    keywords:
      "skincare dark skin Nigeria, melanin skincare Lagos, hyperpigmentation treatment Nigeria",
    category: "skincare",
    intro: `Dark skin is beautiful but has unique needs. Melanin-rich skin is more prone to hyperpigmentation, post-inflammatory marks, and requires specific ingredients that enhance rather than disrupt your natural tone.`,
    tips: [
      "Vitamin C serums brighten and protect melanin-rich skin effectively",
      "Always use SPF — dark skin still gets sun damage and hyperpigmentation",
      "Avoid harsh bleaching creams — they damage your skin barrier long-term",
      "Niacinamide evens skin tone without compromising your melanin",
      "Retinol helps with dark spots but start slowly (2–3x weekly)",
    ],
    faq: [
      {
        q: "Does dark skin need SPF in Nigeria?",
        a: "Absolutely yes. Dark skin still suffers sun damage, which worsens hyperpigmentation and speeds up aging.",
      },
      {
        q: "What causes dark spots on melanin-rich skin?",
        a: "Post-inflammatory hyperpigmentation (PIH) from acne, sun exposure, and skin irritation are the main causes.",
      },
      {
        q: "How long does hyperpigmentation take to fade?",
        a: "With consistent vitamin C, niacinamide, and SPF use, most dark spots fade in 8–12 weeks.",
      },
    ],
  },
};

function BeautyLanding({ onCartOpen }) {
  const { slug } = useParams();
  const page = LANDING_PAGES[slug];
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!page) return;
    fetchProducts();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchProducts = async () => {
    try {
      let url = `${API_URL}/api/products?`;
      if (page.category) url += `category=${page.category}&`;
      if (page.skinType) url += `skinType=${page.skinType}&`;
      if (page.hairType) url += `hairType=${page.hairType}&`;

      const res = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (!page) {
    return (
      <>
        <Navbar onCartOpen={onCartOpen} />
        <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
          <h1>Page not found</h1>
          <Link to="/products">Browse all products →</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.title} | Gracia Fab</title>
        <meta name="description" content={page.description} />
        <meta name="keywords" content={page.keywords} />
        <link
          rel="canonical"
          href={`https://gracia-fab.vercel.app/beauty/${slug}`}
        />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta
          property="og:url"
          content={`https://gracia-fab.vercel.app/beauty/${slug}`}
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: page.h1,
            description: page.description,
            publisher: {
              "@type": "Organization",
              name: "Gracia Fab",
              url: "https://gracia-fab.vercel.app",
            },
            datePublished: "2026-01-01",
            dateModified: new Date().toISOString().split("T")[0],
          })}
        </script>
      </Helmet>

      <Navbar onCartOpen={onCartOpen} />

      <div className="landing-page">
        {/* Hero */}
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <div className="landing-breadcrumb">
              <Link to="/">Home</Link> / <Link to="/products">Products</Link> /{" "}
              {page.h1}
            </div>
            <h1>{page.h1}</h1>
            <p className="landing-intro">{page.intro}</p>
            <Link to="/recommend" className="landing-cta">
              ✦ Get AI Recommendations →
            </Link>
          </div>
        </section>

        {/* Products */}
        <section className="landing-products">
          <div className="landing-section-inner">
            <h2>Top Recommended Products</h2>
            {loading ? (
              <div className="landing-loading">Loading products...</div>
            ) : (
              <div className="landing-products-grid">
                {products.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    onCartOpen={onCartOpen}
                  />
                ))}
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link to="/products" className="landing-view-all">
                View all {page.category} products →
              </Link>
            </div>
          </div>
        </section>

        {/* Tips */}
        {page.tips && (
          <section className="landing-tips">
            <div className="landing-section-inner">
              <h2>Expert Beauty Tips</h2>
              <ul className="tips-list">
                {page.tips.map((tip, i) => (
                  <li key={i} className="tip-item">
                    <span className="tip-num">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* FAQ */}
        {page.faq && (
          <section className="landing-faq">
            <div className="landing-section-inner">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-list">
                {page.faq.map((item, i) => (
                  <div key={i} className="faq-item">
                    <h3>{item.q}</h3>
                    <p>{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="landing-bottom-cta">
          <div className="landing-section-inner">
            <h2>Not sure what's right for you?</h2>
            <p>
              Let our AI beauty advisor build a personalised routine for your
              skin and hair type.
            </p>
            <Link to="/recommend" className="landing-cta large">
              ✦ Try AI Beauty Advisor — Free
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default BeautyLanding;
