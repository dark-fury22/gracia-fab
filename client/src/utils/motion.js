// Scroll-triggered, springy entrance animations for the whole site.
//
// Instead of wiring animation code into every page, this file holds one
// "motion map": which elements animate, and from which direction. startMotion()
// tags matching elements (including ones that appear later, e.g. the next
// page of products or a newly opened route) and springs them in as they
// scroll into view. The look lives in styles/motion.css.
//
// Directions: "up" | "down" | "left" | "right" | "zoom", or "mix" to cycle
// through directions so neighbouring cards arrive from different sides.
// `stagger` (ms) delays each sibling a little more than the last.

const MIX = ["left", "up", "right", "zoom", "down"];

export const MOTION_MAP = [
  // ── Shop / catalog
  { selector: ".glow-catalog-hero > *", from: "zoom" },
  { selector: ".glow-filter-sidebar", from: "left" },
  { selector: ".glow-catalog-toolbar", from: "down" },
  { selector: ".glow-product-card", from: "mix", stagger: 70 },
  { selector: ".glow-product-list-card", from: "mix", stagger: 60 },

  // ── Home
  { selector: ".ysl-triad-card", from: "mix", stagger: 110 },
  { selector: ".ysl-promo-card", from: "mix", stagger: 110 },
  { selector: ".ysl-shopcat-col", from: "mix", stagger: 120 },
  { selector: ".product-card", from: "mix", stagger: 70 },
  { selector: ".promo-perk-item, .perk-item", from: "up", stagger: 80 },
  { selector: ".ysl-commitment-badge", from: "zoom", stagger: 100 },
  { selector: ".ysl-undertone-showcase-section, .ysl-comparator-showcase-section", from: "up" },
  { selector: ".ysl-faq-section", from: "up" },

  // ── Product detail
  { selector: ".pdp-gallery-col", from: "left" },
  { selector: ".pdp-buybox-col", from: "right" },
  { selector: ".pdp-perk-item", from: "up", stagger: 80 },
  { selector: ".pdp-tabs-section, .pdp-reviews-section, .pdp-related-section", from: "up" },
  { selector: ".pdp-routine-step", from: "mix", stagger: 70 },

  // ── About / Compare / Advisor
  { selector: ".craft-pillar-row", from: "mix", stagger: 90 },
  { selector: ".craft-lab-card, .craft-finish-card, .craft-origin-card", from: "mix", stagger: 90 },
  { selector: ".craft-metric-item", from: "zoom", stagger: 90 },
  { selector: ".compare-matrix-section", from: "up", stagger: 60 },
  { selector: ".advisor-value-item", from: "up", stagger: 80 },
  { selector: ".advisor-step-card", from: "zoom" },

  // ── Cart, footer, admin
  { selector: ".cart-items > *", from: "left", stagger: 70 },
  { selector: ".cart-summary", from: "right" },
  { selector: ".ysl-footer-brand-col, .ysl-footer-col, .ysl-footer-newsletter-col", from: "up", stagger: 90 },
  { selector: ".stat-card", from: "zoom", stagger: 80 },
];

const MAX_STAGGER_STEPS = 8; // cap so long lists don't make people wait

function siblingIndex(el, selector) {
  const parent = el.parentElement;
  if (!parent) return 0;
  let i = 0;
  for (const child of parent.children) {
    if (child === el) return i;
    if (child.matches(selector)) i += 1;
  }
  return i;
}

export function startMotion(root = document) {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return () => {};
  }
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const reveal = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          reveal.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );

  // Track what *this* run observes. Checking only for an existing data-reveal
  // tag isn't enough: if startMotion is stopped and started again (React
  // StrictMode does exactly that in development), elements tagged by the
  // previous run would never be observed again and would stay invisible.
  const observed = new WeakSet();

  const scan = () => {
    for (const rule of MOTION_MAP) {
      for (const el of root.querySelectorAll(rule.selector)) {
        if (observed.has(el) || el.classList.contains("is-revealed")) continue;
        if (!el.dataset.reveal) {
          const index = siblingIndex(el, rule.selector);
          el.dataset.reveal =
            rule.from === "mix" ? MIX[index % MIX.length] : rule.from;
          if (rule.stagger) {
            el.style.setProperty(
              "--reveal-delay",
              `${(index % MAX_STAGGER_STEPS) * rule.stagger}ms`,
            );
          }
        }
        observed.add(el);
        reveal.observe(el);
      }
    }
  };

  // Elements are only hidden once this class is on <html>, so content never
  // stays invisible if this script doesn't run.
  document.documentElement.classList.add("motion-ready");
  scan();

  let scheduled = false;
  const mutations = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  });
  mutations.observe(root.body || root, { childList: true, subtree: true });

  return () => {
    mutations.disconnect();
    reveal.disconnect();
    document.documentElement.classList.remove("motion-ready");
  };
}
