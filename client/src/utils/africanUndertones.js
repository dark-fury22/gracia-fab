// ── African Undertone Definitions ─────────────────────────
export const AFRICAN_UNDERTONES = {
  "warm-golden": {
    id: "warm-golden",
    name: "Warm Golden",
    badge: "☀️ Warm Golden Undertone",
    emoji: "☀️",
    hex: "#C48A45",
    foundation: "Warm Golden Honey / Caramel Glow (Shade 420)",
    description:
      "Golden-yellow, warm honey, and amber undertones. Melanin lights up with warm bronze, olive, and golden pigments.",
    skincareFocus:
      "Vitamin C 15%, Niacinamide pore refining, and radiant dewy finish moisturizers.",
    recommendedTags: ["Vitamin C", "Niacinamide", "Dewy Glow", "Warm Bronze"],
  },
  "rich-neutral": {
    id: "rich-neutral",
    name: "Rich Neutral",
    badge: "👑 Rich Neutral Undertone",
    emoji: "👑",
    hex: "#8B5433",
    foundation: "Rich Neutral Cocoa / Mahogany Satin (Shade 480)",
    description:
      "Balanced red and yellow melanin pigments. Seamlessly flatters neutral mahogany, chestnut, and balanced earthy tones.",
    skincareFocus:
      "Multi-ceramide barrier hydration, centella calming essence, and invisible mineral SPF 50+.",
    recommendedTags: ["Ceramides", "Rosewater", "Invisible SPF", "Mahogany"],
  },
  "deep-espresso": {
    id: "deep-espresso",
    name: "Deep Espresso",
    badge: "💎 Deep Espresso Undertone",
    emoji: "💎",
    hex: "#442314",
    foundation: "Deep Espresso Velvet / Cool Ebony (Shade 540)",
    description:
      "Deep, rich melanin with cool espresso, cocoa, and blue-black undertones. Radiates with nutrient-dense botanical lipids.",
    skincareFocus:
      "Pure unrefined shea butter, sugarcane squalane, marula oil, and zero-white-cast sun protection.",
    recommendedTags: ["Squalane", "Pure Shea", "Zero-White-Cast", "Deep Cocoa"],
  },
};

// ── Color Space Utilities (RGB → Lab → ITA) ───────────────
export function rgbToLab(r, g, b) {
  let R = r / 255;
  let G = g / 255;
  let B = b / 255;

  R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
  G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
  B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;

  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const Y = (R * 0.2126 + G * 0.7152 + B * 0.0722) / 1.0;
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;

  const f = (v) => (v > 0.008856 ? Math.pow(v, 1 / 3) : 7.787 * v + 16 / 116);

  const L = 116 * f(Y) - 16;
  const a = 500 * (f(X) - f(Y));
  const bVal = 200 * (f(Y) - f(Z));

  return { L, a, b: bVal };
}

export function getITA(L, b) {
  return Math.atan((L - 50) / (b || 1)) * (180 / Math.PI);
}

// ── Melanin & African Undertone Classifier ─────────────────
export function classifyAfricanComplexion(avgL, avgA, avgB) {
  const ita = getITA(avgL, avgB);

  // Tone Category & Hex
  let toneId;
  let toneLabel;
  let toneHex;

  if (ita > 50) {
    toneId = "fair";
    toneLabel = "Fair / Golden Ivory";
    toneHex = "#FDDBB4";
  } else if (ita > 35) {
    toneId = "light";
    toneLabel = "Light / Warm Beige";
    toneHex = "#F5C89A";
  } else if (ita > 20) {
    toneId = "medium";
    toneLabel = "Medium / Golden Olive";
    toneHex = "#D4A574";
  } else if (ita > 5) {
    toneId = "tan";
    toneLabel = "Tan / Warm Caramel";
    toneHex = "#B8834A";
  } else if (ita > -25) {
    toneId = "deep";
    toneLabel = "Deep / Warm Chocolate";
    toneHex = "#8B5E3C";
  } else {
    toneId = "rich";
    toneLabel = "Rich / Deep Ebony";
    toneHex = "#4A2C1A";
  }

  // African Undertone Determination
  let undertoneKey;
  if (avgL < 38 || ita < -30) {
    undertoneKey = "deep-espresso";
  } else if (avgB >= 15 || avgB / Math.max(avgA, 1) >= 1.08) {
    undertoneKey = "warm-golden";
  } else {
    undertoneKey = "rich-neutral";
  }

  const undertoneInfo = AFRICAN_UNDERTONES[undertoneKey];

  return {
    toneId,
    toneLabel,
    toneHex,
    ita: Math.round(ita * 10) / 10,
    undertoneKey,
    undertone: undertoneInfo.name,
    undertoneBadge: undertoneInfo.badge,
    undertoneDesc: undertoneInfo.description,
    foundationMatch: undertoneInfo.foundation,
    skincareFocus: undertoneInfo.skincareFocus,
    recommendedTags: undertoneInfo.recommendedTags,
  };
}

