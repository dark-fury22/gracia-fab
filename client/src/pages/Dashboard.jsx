import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useBeautyProfile } from "../hooks/useBeautyProfile";
import { useToast } from "../hooks/useToast";
import GraciaLogo from "../components/GraciaLogo";
import EditProfileModal from "../components/EditProfileModal";
import LoyaltyWidget from "../components/LoyaltyWidget";
import SEO from "../components/SEO";
import API_URL from "../config";
import "../styles/Dashboard.css";

const DEFAULT_ADDRESS =
  "No 60 Enugu Road by Igbere Street, Umuahia, Abia, 440233 Umuahia Oyo, Nigeria";

// Available skin tone reference definitions
const SKIN_TONES = [
  {
    id: "fair",
    label: "Fair Complexion",
    emoji: "🌸",
    hex: "#FDDBB4",
    undertone: "Cool / Rosy Undertone",
    description: "Porcelain to pale — burns easily in the sun; thrives on daily mineral SPF 50+ and gentle barrier hydration.",
  },
  {
    id: "light",
    label: "Light Complexion",
    emoji: "🌼",
    hex: "#F5C89A",
    undertone: "Warm Neutral / Ivory",
    description: "Light beige to warm ivory — burns occasionally; responds well to Vitamin C brightening serums and gentle chemical exfoliants.",
  },
  {
    id: "medium",
    label: "Medium Complexion",
    emoji: "✨",
    hex: "#D4A574",
    undertone: "Golden / Warm Olive",
    description: "Golden to olive — rarely burns; thrives on Niacinamide pore refining, warm tone cosmetics, and daily UV protection.",
  },
  {
    id: "tan",
    label: "Tan / Warm Caramel",
    emoji: "🌻",
    hex: "#B8834A",
    undertone: "Warm Golden / Caramel",
    description: "Rich melanin with high natural resilience, but prone to post-inflammatory hyperpigmentation (PIH). Thrives on Vitamin C, Kojic Acid, and non-comedogenic hydration.",
  },
  {
    id: "deep",
    label: "Deep / Warm Chocolate",
    emoji: "🌹",
    hex: "#8B5E3C",
    undertone: "Rich Bronze / Warm Mahogany",
    description: "Deep melanin complexion — prone to surface ashiness and PIH marks. Thrives on squalane, unrefined shea butter, gentle retinoids, and zero-white-cast SPF.",
  },
  {
    id: "rich",
    label: "Rich / Deep Ebony",
    emoji: "💎",
    hex: "#4A2C1A",
    undertone: "Deep Espresso / Cool Ebony",
    description: "The deepest, most melanin-rich complexion. Thrives on botanical lipid oils (argan, marula), hydrating hyaluronic layers, and gold-flecked radiance enhancers.",
  },
];

// Curated routine blueprints by skin type
const getRoutineSteps = (skinType) => {
  const normalized = (skinType || "combination").toLowerCase();

  const routines = {
    oily: {
      morning: [
        {
          step: 1,
          type: "Clarifying Cleanser",
          badge: "STEP 01 / PURIFY",
          timing: "Morning · Daily",
          instruction: "Deeply clarifies pores and controls excess sebum with tea tree and salicylic acid.",
          product: {
            _id: "oil-cleanse-1",
            name: "Purifying Gel Cleanser with Tea Tree",
            brand: "Gracia Fab Skincare",
            price: 18000,
            rating: 4.8,
            reviews: 940,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=360&h=360&fit=crop",
          },
        },
        {
          step: 2,
          type: "Sebum Balancing Toner",
          badge: "STEP 02 / BALANCE",
          timing: "Morning · Daily",
          instruction: "Tightens pores and minimizes oil breakthrough throughout humid Lagos days.",
          product: {
            _id: "oil-toner-1",
            name: "Niacinamide & Zinc Balancing Toner",
            brand: "Gracia Fab Skincare",
            price: 16500,
            rating: 4.7,
            reviews: 820,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=360&h=360&fit=crop",
          },
        },
        {
          step: 3,
          type: "Antioxidant Radiance Serum",
          badge: "STEP 03 / BRIGHTEN",
          timing: "Morning · Daily",
          instruction: "Lightweight 12% Vitamin C and alpha arbutin fading dark acne marks without greasiness.",
          product: {
            _id: "oil-serum-1",
            name: "Radiance Vitamin C Oil-Free Serum",
            brand: "Gracia Fab Skincare",
            price: 22000,
            rating: 4.9,
            reviews: 1150,
            image: "https://images.unsplash.com/photo-1608248597359-002d0b5e9f80?w=360&h=360&fit=crop",
          },
        },
        {
          step: 4,
          type: "Oil-Free Water Cream",
          badge: "STEP 04 / HYDRATE",
          timing: "Morning · Daily",
          instruction: "Featherlight water-gel bursting with hyaluronic acid for weightless hydration.",
          product: {
            _id: "oil-moist-1",
            name: "Hydra-Gel Matte Day Moisturizer",
            brand: "Gracia Fab Skincare",
            price: 23000,
            rating: 4.8,
            reviews: 730,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=360&h=360&fit=crop",
          },
        },
        {
          step: 5,
          type: "Matte Finish Sunscreen",
          badge: "STEP 05 / PROTECT",
          timing: "Morning · Daily",
          instruction: "Broad-spectrum SPF 50+ dry-touch gel that leaves zero shine and zero white cast.",
          product: {
            _id: "oil-spf-1",
            name: "Invisible Matte UV Shield SPF 50+",
            brand: "Gracia Fab Skincare",
            price: 20000,
            rating: 4.9,
            reviews: 910,
            image: "https://images.unsplash.com/photo-1567928815114-1e03c46e3006?w=360&h=360&fit=crop",
          },
        },
      ],
      night: [
        {
          step: 1,
          type: "Gentle Micellar Melt",
          badge: "STEP 01 / DISSOLVE",
          timing: "Nightly",
          instruction: "Effortlessly breaks down sunscreen and environmental pollutants without stripping skin.",
          product: {
            _id: "oil-melt-1",
            name: "Clarifying Micellar Cleansing Milk",
            brand: "Gracia Fab Skincare",
            price: 17500,
            rating: 4.8,
            reviews: 580,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=360&h=360&fit=crop",
          },
        },
        {
          step: 2,
          type: "BHA Pore Refining Toner",
          badge: "STEP 02 / UNCLOG",
          timing: "Nightly · 3x Weekly",
          instruction: "Salicylic acid clears congestion deep inside pores, reducing blackheads and bumps.",
          product: {
            _id: "oil-bha-1",
            name: "Salicylic BHA Exfoliating Elixir",
            brand: "Gracia Fab Skincare",
            price: 19000,
            rating: 4.8,
            reviews: 690,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=360&h=360&fit=crop",
          },
        },
        {
          step: 3,
          type: "Cellular Night Retinoid",
          badge: "STEP 03 / RESURFACE",
          timing: "Nightly",
          instruction: "Encapsulated retinol accelerates cell turnover to smooth texture and fade stubborn acne spots.",
          product: {
            _id: "oil-ret-1",
            name: "Cellular Night Retinol Renewal",
            brand: "Gracia Fab Skincare",
            price: 28000,
            rating: 4.9,
            reviews: 1040,
            image: "https://images.unsplash.com/photo-1608248597359-002d0b5e9f80?w=360&h=360&fit=crop",
          },
        },
        {
          step: 4,
          type: "Centella Barrier Calming Gel",
          badge: "STEP 04 / SOOTHE",
          timing: "Nightly",
          instruction: "Cica and squalane soothe irritation while you sleep, maintaining a resilient skin barrier.",
          product: {
            _id: "oil-cica-1",
            name: "Centella Asiatica Night Calming Gel",
            brand: "Gracia Fab Skincare",
            price: 24000,
            rating: 4.7,
            reviews: 620,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=360&h=360&fit=crop",
          },
        },
      ],
      weekly: [
        {
          step: 1,
          type: "Kaolin Clay Detox Mask",
          badge: "WEEKLY 01 / DETOX",
          timing: "1-2x Weekly",
          instruction: "Draws out trapped sebum, refines skin texture, and leaves skin refreshed and velvety.",
          product: {
            _id: "oil-clay-1",
            name: "Kaolin Pore Clarifying Mud Mask",
            brand: "Gracia Fab Skincare",
            price: 16500,
            rating: 4.7,
            reviews: 490,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=360&h=360&fit=crop",
          },
        },
        {
          step: 2,
          type: "Melanin-Safe Gentle Peel",
          badge: "WEEKLY 02 / GLOW",
          timing: "1x Weekly (PM)",
          instruction: "Lactic acid blend tailored for melanin skin to sweep away dullness without hyperpigmentation.",
          product: {
            _id: "oil-peel-1",
            name: "Melanin Radiance AHA Glow Peel",
            brand: "Gracia Fab Skincare",
            price: 21000,
            rating: 4.9,
            reviews: 580,
            image: "https://images.unsplash.com/photo-1608248597359-002d0b5e9f80?w=360&h=360&fit=crop",
          },
        },
      ],
    },
    dry: {
      morning: [
        {
          step: 1,
          type: "Nourishing Oat Milk Cleanser",
          badge: "STEP 01 / CLEANSE",
          timing: "Morning · Daily",
          instruction: "Creamy, non-foaming cleanser that comforts parched skin and reinforces the lipid barrier.",
          product: {
            _id: "dry-cleanse-1",
            name: "Nourishing Oat Milk Cream Wash",
            brand: "Gracia Fab Skincare",
            price: 18500,
            rating: 4.9,
            reviews: 670,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=360&h=360&fit=crop",
          },
        },
        {
          step: 2,
          type: "Milky Hyaluronic Essence",
          badge: "STEP 02 / INFUSE",
          timing: "Morning · Daily",
          instruction: "Multi-molecular hyaluronic acid deeply plumps tight, dry skin with lasting dewiness.",
          product: {
            _id: "dry-essence-1",
            name: "Milky Hydration Barrier Essence",
            brand: "Gracia Fab Skincare",
            price: 17500,
            rating: 4.8,
            reviews: 540,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=360&h=360&fit=crop",
          },
        },
        {
          step: 3,
          type: "Vitamin C & Squalane Serum",
          badge: "STEP 03 / NOURISH",
          timing: "Morning · Daily",
          instruction: "Lipid-soluble Vitamin C infused in pure sugarcane squalane for intense radiance and comfort.",
          product: {
            _id: "dry-serum-1",
            name: "Squalane + Vitamin C Radiance Serum",
            brand: "Gracia Fab Skincare",
            price: 24000,
            rating: 4.9,
            reviews: 820,
            image: "https://images.unsplash.com/photo-1608248597359-002d0b5e9f80?w=360&h=360&fit=crop",
          },
        },
        {
          step: 4,
          type: "Rich Ceramide Barrier Cream",
          badge: "STEP 04 / SEAL",
          timing: "Morning · Daily",
          instruction: "Dense, velvety moisturizer packed with ceramides, unrefined shea, and fatty acids.",
          product: {
            _id: "dry-cream-1",
            name: "Ultra-Rich Ceramide Barrier Balm",
            brand: "Gracia Fab Skincare",
            price: 26000,
            rating: 4.8,
            reviews: 950,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=360&h=360&fit=crop",
          },
        },
        {
          step: 5,
          type: "Dewy Glow Sunscreen SPF 50+",
          badge: "STEP 05 / PROTECT",
          timing: "Morning · Daily",
          instruction: "Hydrating, glow-enhancing sunscreen leaving zero chalky cast on dark and dry skin.",
          product: {
            _id: "dry-spf-1",
            name: "Dewy Radiance UV Elixir SPF 50+",
            brand: "Gracia Fab Skincare",
            price: 21000,
            rating: 4.9,
            reviews: 790,
            image: "https://images.unsplash.com/photo-1567928815114-1e03c46e3006?w=360&h=360&fit=crop",
          },
        },
      ],
      night: [
        {
          step: 1,
          type: "Melt-Away Cleansing Balm",
          badge: "STEP 01 / DISSOLVE",
          timing: "Nightly",
          instruction: "Luxurious shea butter balm that melts SPF and makeup while conditioning lashes and skin.",
          product: {
            _id: "dry-balm-1",
            name: "Melt-Away Cleansing Butter Balm",
            brand: "Gracia Fab Skincare",
            price: 19500,
            rating: 4.9,
            reviews: 810,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=360&h=360&fit=crop",
          },
        },
        {
          step: 2,
          type: "Rosewater Calming Mist",
          badge: "STEP 02 / SOOTHE",
          timing: "Nightly",
          instruction: "Distilled organic rosewater and chamomile extract to calm tight evening skin.",
          product: {
            _id: "dry-mist-1",
            name: "Restorative Rosewater Facial Mist",
            brand: "Gracia Fab Skincare",
            price: 15000,
            rating: 4.7,
            reviews: 490,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=360&h=360&fit=crop",
          },
        },
        {
          step: 3,
          type: "Peptide Night Recovery Serum",
          badge: "STEP 03 / REPAIR",
          timing: "Nightly",
          instruction: "Multi-peptide complex replenishing collagen and deeply hydrating overnight.",
          product: {
            _id: "dry-pep-1",
            name: "Copper Peptide Cell Recovery Elixir",
            brand: "Gracia Fab Skincare",
            price: 27000,
            rating: 4.9,
            reviews: 640,
            image: "https://images.unsplash.com/photo-1608248597359-002d0b5e9f80?w=360&h=360&fit=crop",
          },
        },
        {
          step: 4,
          type: "Overnight Intensive Sleeping Mask",
          badge: "STEP 04 / RESTORE",
          timing: "Nightly",
          instruction: "Locks in vital moisture until morning so you wake up with radiant, glass-like skin.",
          product: {
            _id: "dry-sleep-1",
            name: "Overnight Ceramide Recovery Mask",
            brand: "Gracia Fab Skincare",
            price: 28000,
            rating: 4.8,
            reviews: 730,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=360&h=360&fit=crop",
          },
        },
      ],
      weekly: [
        {
          step: 1,
          type: "Golden Honey Moisture Mask",
          badge: "WEEKLY 01 / QUENCH",
          timing: "2x Weekly",
          instruction: "Pure botanical raw honey and propolis delivering intensive comfort to dry areas.",
          product: {
            _id: "dry-honey-1",
            name: "Golden Honey Moisture Glow Mask",
            brand: "Gracia Fab Skincare",
            price: 17500,
            rating: 4.8,
            reviews: 620,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=360&h=360&fit=crop",
          },
        },
        {
          step: 2,
          type: "Lactic Acid Gentle Brightening Peel",
          badge: "WEEKLY 02 / POLISH",
          timing: "1x Weekly",
          instruction: "Hydrating AHA that smooths flakiness without stripping lipid moisture.",
          product: {
            _id: "dry-lac-1",
            name: "Lactic Acid 5% Gentle Radiance Peel",
            brand: "Gracia Fab Skincare",
            price: 21500,
            rating: 4.9,
            reviews: 510,
            image: "https://images.unsplash.com/photo-1608248597359-002d0b5e9f80?w=360&h=360&fit=crop",
          },
        },
      ],
    },
    combination: {
      morning: [
        {
          step: 1,
          type: "Gentle Foaming Cleanser",
          badge: "STEP 01 / CLEANSE",
          timing: "Morning · Daily",
          instruction: "Gently lifts overnight excess oil from T-zone without stripping cheek moisture.",
          product: {
            _id: "comb-cleanse-1",
            name: "Hydrating Foam Face Cleanser",
            brand: "Gracia Fab Skincare",
            price: 18000,
            rating: 4.8,
            reviews: 1240,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=360&h=360&fit=crop",
          },
        },
        {
          step: 2,
          type: "Balancing Pore Toner",
          badge: "STEP 02 / BALANCE",
          timing: "Morning · Daily",
          instruction: "Refines enlarged pores and restores skin pH balance before active treatments.",
          product: {
            _id: "comb-toner-1",
            name: "Glow Niacinamide Balancing Toner",
            brand: "Gracia Fab Skincare",
            price: 16500,
            rating: 4.7,
            reviews: 980,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=360&h=360&fit=crop",
          },
        },
        {
          step: 3,
          type: "Antioxidant Vitamin C Serum",
          badge: "STEP 03 / TREAT",
          timing: "Morning · Daily",
          instruction: "15% Vitamin C complex that brightens hyperpigmentation and shields against UV damage.",
          product: {
            _id: "comb-serum-1",
            name: "Radiance Vitamin C 15% Serum",
            brand: "Gracia Fab Skincare",
            price: 22000,
            rating: 4.9,
            reviews: 1520,
            image: "https://images.unsplash.com/photo-1608248597359-002d0b5e9f80?w=360&h=360&fit=crop",
          },
        },
        {
          step: 4,
          type: "Ceramide Radiance Day Cream",
          badge: "STEP 04 / HYDRATE",
          timing: "Morning · Daily",
          instruction: "Weightless ceramide-squalane lotion locking in cellular hydration with a radiant finish.",
          product: {
            _id: "comb-moist-1",
            name: "Radiance Day Cream Moisturizer",
            brand: "Gracia Fab Skincare",
            price: 24000,
            rating: 4.8,
            reviews: 840,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=360&h=360&fit=crop",
          },
        },
        {
          step: 5,
          type: "Invisible Sunscreen SPF 50+",
          badge: "STEP 05 / PROTECT",
          timing: "Morning · Daily",
          instruction: "Melanin-safe SPF 50+ fluid that dries 100% invisible with zero white cast or grease.",
          product: {
            _id: "comb-spf-1",
            name: "Daily Invisible Shield SPF 50+",
            brand: "Gracia Fab Skincare",
            price: 20000,
            rating: 4.9,
            reviews: 720,
            image: "https://images.unsplash.com/photo-1567928815114-1e03c46e3006?w=360&h=360&fit=crop",
          },
        },
      ],
      night: [
        {
          step: 1,
          type: "Double Cleanse Balm",
          badge: "STEP 01 / MELT & CLEANSE",
          timing: "Nightly",
          instruction: "Dissolves SPF, makeup, and urban impurities without dehydrating delicate skin.",
          product: {
            _id: "comb-balm-1",
            name: "Melt-Away Cleansing Oil-Balm",
            brand: "Gracia Fab Skincare",
            price: 19500,
            rating: 4.8,
            reviews: 650,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=360&h=360&fit=crop",
          },
        },
        {
          step: 2,
          type: "Restorative Calming Mist",
          badge: "STEP 02 / PREPARE",
          timing: "Nightly",
          instruction: "Rosewater & centella mist that replenishes moisture and cools nighttime inflammation.",
          product: {
            _id: "comb-mist-1",
            name: "Centella Restorative Mist",
            brand: "Gracia Fab Skincare",
            price: 15000,
            rating: 4.7,
            reviews: 430,
            image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=360&h=360&fit=crop",
          },
        },
        {
          step: 3,
          type: "Cellular Night Retinoid",
          badge: "STEP 03 / RENEW",
          timing: "Nightly · 3-4x Weekly",
          instruction: "Cellular renewal retinoid + peptides smoothing fine lines and fading dark spots.",
          product: {
            _id: "comb-ret-1",
            name: "Cellular Night Retinoid Elixir",
            brand: "Gracia Fab Skincare",
            price: 28000,
            rating: 4.9,
            reviews: 890,
            image: "https://images.unsplash.com/photo-1608248597359-002d0b5e9f80?w=360&h=360&fit=crop",
          },
        },
        {
          step: 4,
          type: "Barrier Intensive Recovery Cream",
          badge: "STEP 04 / SEAL & RESTORE",
          timing: "Nightly",
          instruction: "Deeply nourishing night cream with shea butter, peptides, and ceramides for morning bounce.",
          product: {
            _id: "comb-night-1",
            name: "Barrier Intensive Night Recovery Cream",
            brand: "Gracia Fab Skincare",
            price: 26000,
            rating: 4.8,
            reviews: 780,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=360&h=360&fit=crop",
          },
        },
      ],
      weekly: [
        {
          step: 1,
          type: "Melanin-Safe Gentle AHA Exfoliator",
          badge: "WEEKLY 01 / RESURFACE",
          timing: "1-2x Weekly (PM)",
          instruction: "Lactic & Salicylic blend gently sweeping away dead cells without irritating melanin.",
          product: {
            _id: "comb-peel-1",
            name: "Melanin-Safe Gentle AHA Exfoliator",
            brand: "Gracia Fab Skincare",
            price: 21000,
            rating: 4.9,
            reviews: 510,
            image: "https://images.unsplash.com/photo-1608248597359-002d0b5e9f80?w=360&h=360&fit=crop",
          },
        },
        {
          step: 2,
          type: "Golden Honey Moisture Mask",
          badge: "WEEKLY 02 / NOURISH",
          timing: "1-2x Weekly",
          instruction: "Deep quenching honey & squalane glow mask leaving skin plump, supple, and radiant.",
          product: {
            _id: "comb-mask-1",
            name: "Golden Honey Moisture Glow Mask",
            brand: "Gracia Fab Skincare",
            price: 17500,
            rating: 4.8,
            reviews: 620,
            image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=360&h=360&fit=crop",
          },
        },
      ],
    },
  };

  return routines[normalized] || routines.combination;
};

// Fallback routine empties / staples
const DEFAULT_EMPTIES = [
  {
    _id: "empty-1",
    name: "Hydrating Face Cleanser",
    brand: "Gracia Fab Skincare",
    price: 18000,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=360&h=360&fit=crop",
  },
  {
    _id: "empty-2",
    name: "Radiance Vitamin C 15% Serum",
    brand: "Gracia Fab Skincare",
    price: 22000,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1608248597359-002d0b5e9f80?w=360&h=360&fit=crop",
  },
  {
    _id: "empty-3",
    name: "Daily Invisible Shield SPF 50+",
    brand: "Gracia Fab Skincare",
    price: 20000,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1567928815114-1e03c46e3006?w=360&h=360&fit=crop",
  },
  {
    _id: "empty-4",
    name: "Glow Niacinamide Balancing Toner",
    brand: "Gracia Fab Skincare",
    price: 16500,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=360&h=360&fit=crop",
  },
];

function Dashboard({ onCartOpen }) {
  const { user, logout } = useAuth();
  const { addToCart, cartItems } = useCart();
  const cartCount = (cartItems || []).reduce((acc, item) => acc + (item.quantity || 1), 0);
  const { profile, updateProfile, resetProfile } = useBeautyProfile();
  const toastContext = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/products");
    }
  };

  // Tab management: handle query param ?tab=beauty-profile or location.state
  const searchTab = new URLSearchParams(location.search).get("tab");
  const [selectedTab, setSelectedTab] = useState(null);
  const activeTab = selectedTab || location.state?.tab || searchTab || "profile";
  const setActiveTab = (tab) => setSelectedTab(tab);

  // Sub-tabs for Beauty Routine (morning, night, weekly)
  const [routineTab, setRoutineTab] = useState("morning");

  // Profile modal and form state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [marketingEmail, setMarketingEmail] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [userAddress, setUserAddress] = useState(DEFAULT_ADDRESS);

  // Password state
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // AI Saved Recommendations state
  const [savedRecommendations, setSavedRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Beauty Profile Quick Editor
  const [isEditingBeautyProfile, setIsEditingBeautyProfile] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const editForm = editFormData || {
    skinType: profile?.skinType || "combination",
    skinConcerns: profile?.skinConcerns || "Hyperpigmentation & Glow",
    hairType: profile?.hairType || "coily",
    budget: profile?.budget || "Moderate (₦10,000–₦25,000)",
  };
  const setEditForm = (updater) => {
    if (typeof updater === "function") {
      setEditFormData((prev) => updater(prev || editForm));
    } else {
      setEditFormData(updater);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Fetch real orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/orders/myorders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchOrders error:", err);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user && (activeTab === "orders" || activeTab === "beauty-profile")) {
      fetchOrders();
    }
  }, [user, activeTab]);

  // Fetch saved AI recommendation sessions
  useEffect(() => {
    const fetchSavedRecs = async () => {
      try {
        setLoadingRecs(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_URL}/api/wishlist/recommendations/saved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSavedRecommendations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("fetchSavedRecs error:", err);
      } finally {
        setLoadingRecs(false);
      }
    };

    if (user && activeTab === "beauty-profile") {
      fetchSavedRecs();
    }
  }, [user, activeTab]);

  // Notification helper
  const notify = (msg, type = "success") => {
    if (toastContext?.addToast) {
      toastContext.addToast(msg, type);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 3500);
    }
  };

  const handleProfileSave = async ({ name, email }) => {
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
        }),
      );

      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Profile save error:", err);
      setErrorMsg(err.message || "Failed to update profile. Please try again.");
      throw err;
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      setPasswordSaving(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwordData.newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setPasswordSuccess("Password updated successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(err.message || "Failed to update password. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleBuyAgain = (order) => {
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach((item) => addToCart(item));
    } else {
      addToCart({
        _id: order._id,
        name: order.name,
        price: order.totalPrice,
        image: order.image,
      });
    }
    notify("Item re-added to bag!");
    if (onCartOpen) onCartOpen();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  // ── Beauty Profile Logic ──────────────────────────────
  const skinType = profile?.skinType;
  const currentRoutine = useMemo(() => {
    return getRoutineSteps(skinType || "combination");
  }, [skinType]);

  const activeRoutineSteps = currentRoutine[routineTab] || currentRoutine.morning;

  const totalRoutinePrice = useMemo(() => {
    return activeRoutineSteps.reduce((acc, step) => acc + (step.product?.price || 0), 0);
  }, [activeRoutineSteps]);

  // Detected Skin Tone object
  const toneId = profile?.skinTone?.id;
  const toneLabel = profile?.skinTone?.label;
  const toneHex = profile?.skinTone?.hex;
  const detectedTone = useMemo(() => {
    if (toneId) {
      return (
        SKIN_TONES.find((t) => t.id === toneId) || {
          id: toneId,
          label: toneLabel || "Melanin Tone",
          hex: toneHex || "#B8834A",
          undertone: "Warm Golden / Caramel",
          description: "Detected melanin tone with tailored active formulation guidance.",
        }
      );
    }
    // Default tailored tone for Gracia Fab
    return SKIN_TONES[3]; // Tan / Warm Caramel
  }, [toneId, toneLabel, toneHex]);

  // Replenishment items extracted from past orders or fallback staples
  const emptiesList = useMemo(() => {
    if (orders && orders.length > 0) {
      const items = [];
      const seen = new Set();
      orders.forEach((o) => {
        (o.orderItems || []).forEach((item) => {
          if (item?._id && !seen.has(item._id)) {
            seen.add(item._id);
            items.push(item);
          }
        });
      });
      if (items.length > 0) return items.slice(0, 4);
    }
    return DEFAULT_EMPTIES;
  }, [orders]);

  // Bulk reorder entire routine
  const handleReorderEntireRoutine = () => {
    activeRoutineSteps.forEach((s) => {
      if (s.product) {
        addToCart(s.product);
      }
    });
    const label = routineTab === "morning" ? "Morning" : routineTab === "night" ? "Night" : "Weekly";
    notify(`All ${activeRoutineSteps.length} ${label} routine essentials added to bag! 🛍️`);
    if (onCartOpen) onCartOpen();
  };

  // Add individual step item
  const handleAddStepToBag = (product, stepName) => {
    addToCart(product);
    notify(`Added ${product.name || stepName} to bag!`);
    if (onCartOpen) onCartOpen();
  };

  // Save updated beauty profile
  const handleSaveBeautyProfile = (e) => {
    e.preventDefault();
    updateProfile({
      skinType: editForm.skinType,
      skinConcerns: editForm.skinConcerns,
      hairType: editForm.hairType,
      budget: editForm.budget,
    });
    setIsEditingBeautyProfile(false);
    notify("Beauty profile updated! Regimens tailored. ✨");
  };

  if (!user) return null;

  const firstName = user.name ? user.name.split(" ")[0] : "there";
  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "E";

  return (
    <div className="account-page">
      <SEO
        title="My Beauty Profile & Account | Gracia Fab"
        description="View your AI beauty profile, custom day & night routines, tone matches, orders, and rewards."
        url="/dashboard"
      />

      {/* Account Top Bar with Back Button */}
      <header className="account-topbar">
        <button
          type="button"
          onClick={handleBack}
          className="account-back-btn"
          aria-label="Return to previous page"
          title="Return to previous page"
        >
          <span className="account-back-arrow" aria-hidden="true">←</span>
          <span className="account-back-text">Back to Store</span>
        </button>

        <Link to="/" className="account-logo-link" title="Gracia Fab Home">
          <GraciaLogo size="md" variant="editorial" />
        </Link>

        <div className="account-topbar-right">
          <button
            type="button"
            onClick={onCartOpen}
            className="account-cart-pill"
            aria-label={`Open shopping bag, ${cartCount} items`}
            title="Shopping Bag"
          >
            <span className="cart-icon" aria-hidden="true">🛍️</span>
            <span className="cart-badge">{cartCount}</span>
          </button>
          <div className="account-avatar-badge" title={user.name}>
            {userInitial}
          </div>
        </div>
      </header>

      <h1 className="sr-only">My Account & Beauty Profile</h1>

      {/* Main Account Shell */}
      <div className="account-shell">
        {/* Left Navigation Sidebar */}
        <aside className="account-sidebar">
          <button
            type="button"
            onClick={handleBack}
            className="account-nav-back-link"
            title="Return to previous page"
          >
            ← Continue Shopping
          </button>
          <button
            className={`account-nav-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`account-nav-item ${activeTab === "beauty-profile" ? "active" : ""}`}
            onClick={() => setActiveTab("beauty-profile")}
          >
            👑 My Beauty Profile <span className="nav-ai-pill">✦ AI</span>
          </button>
          <button
            className={`account-nav-item ${activeTab === "rewards" ? "active" : ""}`}
            onClick={() => setActiveTab("rewards")}
          >
            ✨ Streak Rewards
          </button>
          <button
            className={`account-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`account-nav-item ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            🔒 Security
          </button>
        </aside>

        {/* Right Content Area */}
        <main className="account-main">
          {successMsg && <div className="account-alert-success">{successMsg}</div>}
          {errorMsg && <div className="account-alert-error">⚠️ {errorMsg}</div>}

          {/* ══════════════════════════════════════════
              TAB: MY BEAUTY PROFILE HUB
          ══════════════════════════════════════════ */}
          {activeTab === "beauty-profile" && (
            <div className="beauty-hub-view">
              {/* 1. Header Hero Card */}
              <div className="account-card beauty-hub-header-card">
                <div className="beauty-hub-header-meta">
                  <span className="beauty-hub-tag">✦ AI BEAUTY CONCIERGE IDENTITY</span>
                  <h2 className="beauty-hub-title">My Beauty Profile & Daily Rituals</h2>
                  <p className="beauty-hub-desc">
                    Your formulation blueprint tailored for melanin-rich skin, high-humidity climates,
                    and personalized morning & night care regimens.
                  </p>
                </div>

                {/* Profile Attributes Summary Grid */}
                <div className="beauty-profile-summary-grid">
                  <div className="profile-summary-pill">
                    <span className="summary-pill-label">🧴 Skin Type</span>
                    <strong className="summary-pill-val">
                      {profile?.skinType
                        ? profile.skinType.charAt(0).toUpperCase() + profile.skinType.slice(1)
                        : "Combination"}
                    </strong>
                  </div>

                  <div className="profile-summary-pill">
                    <span className="summary-pill-label">🎯 Primary Focus</span>
                    <strong className="summary-pill-val">
                      {profile?.skinConcerns || "Hyperpigmentation & Glow"}
                    </strong>
                  </div>

                  <div className="profile-summary-pill">
                    <span className="summary-pill-label">💇🏽‍♀️ Hair Texture</span>
                    <strong className="summary-pill-val">
                      {profile?.hairType
                        ? profile.hairType.charAt(0).toUpperCase() + profile.hairType.slice(1)
                        : "Coily (4A–4C)"}
                    </strong>
                  </div>

                  <div className="profile-summary-pill">
                    <span className="summary-pill-label">💰 Target Budget</span>
                    <strong className="summary-pill-val">
                      {profile?.budget || "Moderate (₦10k–₦25k)"}
                    </strong>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="beauty-hub-header-actions">
                  <button
                    type="button"
                    className="beauty-hub-btn-edit"
                    onClick={() => setIsEditingBeautyProfile(!isEditingBeautyProfile)}
                  >
                    {isEditingBeautyProfile ? "✕ Close Editor" : "✏️ Quick Edit Profile"}
                  </button>
                  <Link to="/advisor" className="beauty-hub-btn-advisor">
                    ✦ Open AI Beauty Advisor →
                  </Link>
                  <button
                    type="button"
                    className="beauty-hub-btn-reset"
                    onClick={() => {
                      if (window.confirm("Reset your beauty consultation profile to default?")) {
                        resetProfile();
                        notify("Beauty profile reset to defaults.");
                      }
                    }}
                  >
                    Reset
                  </button>
                </div>

                {/* Expandable Quick Editor */}
                {isEditingBeautyProfile && (
                  <form className="beauty-profile-edit-panel" onSubmit={handleSaveBeautyProfile}>
                    <h4 className="edit-panel-heading">Adjust Your Beauty Attributes</h4>
                    <div className="edit-fields-grid">
                      <div className="edit-form-field">
                        <label>Skin Type</label>
                        <select
                          value={editForm.skinType}
                          onChange={(e) =>
                            setEditForm({ ...editForm, skinType: e.target.value })
                          }
                        >
                          <option value="combination">Combination Skin</option>
                          <option value="oily">Oily Skin</option>
                          <option value="dry">Dry / Dehydrated Skin</option>
                          <option value="sensitive">Sensitive Skin</option>
                          <option value="normal">Balanced / Normal</option>
                        </select>
                      </div>

                      <div className="edit-form-field">
                        <label>Primary Concerns</label>
                        <input
                          type="text"
                          value={editForm.skinConcerns}
                          onChange={(e) =>
                            setEditForm({ ...editForm, skinConcerns: e.target.value })
                          }
                          placeholder="e.g. Dark spots, Acne, Glow"
                        />
                      </div>

                      <div className="edit-form-field">
                        <label>Hair Type / Focus</label>
                        <select
                          value={editForm.hairType}
                          onChange={(e) =>
                            setEditForm({ ...editForm, hairType: e.target.value })
                          }
                        >
                          <option value="coily">Coily (4A, 4B, 4C)</option>
                          <option value="curly">Curly (3A, 3B, 3C)</option>
                          <option value="wavy">Wavy Hair</option>
                          <option value="straight">Straight Hair</option>
                          <option value="wigs">Raw Virgin Wigs & Units</option>
                        </select>
                      </div>

                      <div className="edit-form-field">
                        <label>Budget Level</label>
                        <select
                          value={editForm.budget}
                          onChange={(e) =>
                            setEditForm({ ...editForm, budget: e.target.value })
                          }
                        >
                          <option value="Budget (under ₦10,000/item)">
                            Budget (under ₦10,000/item)
                          </option>
                          <option value="Moderate (₦10,000–₦25,000)">
                            Moderate (₦10,000–₦25,000)
                          </option>
                          <option value="Luxury (₦25,000+)">
                            Luxury / High Performance (₦25,000+)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="edit-panel-actions">
                      <button type="submit" className="edit-panel-save-btn">
                        Save Changes ✦
                      </button>
                      <button
                        type="button"
                        className="edit-panel-cancel-btn"
                        onClick={() => setIsEditingBeautyProfile(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* 2. Detected Skin Tone & Complexion Card */}
              <div className="account-card beauty-tone-match-card">
                <div className="tone-match-content">
                  <div className="tone-swatch-col">
                    <div
                      className="tone-color-circle"
                      style={{ background: detectedTone.hex }}
                      title={detectedTone.label}
                    />
                    <span className="tone-code-label">{detectedTone.label}</span>
                    <span className="tone-undertone-badge">{detectedTone.undertone}</span>
                  </div>

                  <div className="tone-info-col">
                    <div className="tone-info-header">
                      <h3>{detectedTone.emoji} Complexion & Melanin Profile</h3>
                      <Link to="/skin-tone" className="tone-rescan-btn">
                        📸 Retake Selfie Scan →
                      </Link>
                    </div>
                    <p className="tone-desc-text">{detectedTone.description}</p>

                    <div className="tone-tags-row">
                      <span className="tone-tag">Niacinamide</span>
                      <span className="tone-tag">Vitamin C 15%</span>
                      <span className="tone-tag">Invisible SPF 50+</span>
                      <span className="tone-tag">Non-Comedogenic Barrier</span>
                    </div>

                    <div className="tone-actions-row">
                      <Link to="/products?category=makeup" className="tone-match-link">
                        💄 Shop Foundation & Concealer Matches →
                      </Link>
                      <Link to="/compare" className="tone-compare-link">
                        ⚖️ Compare Formulations →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Saved Daily Regimens (AM / PM / Weekly) */}
              <div className="account-card beauty-routine-card">
                <div className="routine-card-header">
                  <div>
                    <span className="routine-card-tag">DAILY BEAUTY RITUALS</span>
                    <h3 className="routine-card-title">Saved Skincare Regimen</h3>
                    <p className="routine-card-sub">
                      Curated specifically for your{" "}
                      <strong>
                        {profile?.skinType
                          ? profile.skinType.charAt(0).toUpperCase() + profile.skinType.slice(1)
                          : "Combination"}
                      </strong>{" "}
                      skin in Nigerian weather conditions.
                    </p>
                  </div>

                  {/* Sub-tab pills */}
                  <div className="routine-subtabs-nav">
                    <button
                      type="button"
                      className={`routine-subtab-btn ${routineTab === "morning" ? "active" : ""}`}
                      onClick={() => setRoutineTab("morning")}
                    >
                      ☀️ Morning ({currentRoutine.morning.length})
                    </button>
                    <button
                      type="button"
                      className={`routine-subtab-btn ${routineTab === "night" ? "active" : ""}`}
                      onClick={() => setRoutineTab("night")}
                    >
                      🌙 Night ({currentRoutine.night.length})
                    </button>
                    <button
                      type="button"
                      className={`routine-subtab-btn ${routineTab === "weekly" ? "active" : ""}`}
                      onClick={() => setRoutineTab("weekly")}
                    >
                      📅 Weekly ({currentRoutine.weekly.length})
                    </button>
                  </div>
                </div>

                {/* Routine Summary & Bulk Reorder Bar */}
                <div className="beauty-routine-summary-bar">
                  <div className="routine-summary-info">
                    <span className="routine-val-label">
                      {routineTab === "morning"
                        ? "☀️ Morning Regimen"
                        : routineTab === "night"
                          ? "🌙 Night Restoration"
                          : "📅 Weekly Treatments"}
                    </span>
                    <span className="routine-val-price">
                      Estimated Investment: <strong>{formatPrice(totalRoutinePrice)}</strong> (
                      {activeRoutineSteps.length} products)
                    </span>
                  </div>

                  <button
                    type="button"
                    className="routine-bulk-reorder-btn"
                    onClick={handleReorderEntireRoutine}
                  >
                    + Reorder Entire Routine ({formatPrice(totalRoutinePrice)})
                  </button>
                </div>

                {/* Steps List */}
                <div className="beauty-steps-list">
                  {activeRoutineSteps.map((stepItem, idx) => (
                    <div key={stepItem.product?._id || idx} className="beauty-step-card">
                      <div className="step-card-num-wrap">
                        <span className="step-card-num">0{idx + 1}</span>
                      </div>

                      <div className="step-card-thumb-wrap">
                        <img
                          src={stepItem.product?.image}
                          alt={stepItem.product?.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=360&h=360&fit=crop";
                          }}
                        />
                      </div>

                      <div className="step-card-details">
                        <div className="step-card-meta-line">
                          <span className="step-badge-pill">{stepItem.badge}</span>
                          <span className="step-timing-pill">{stepItem.timing}</span>
                        </div>
                        <h4 className="step-card-prod-title">
                          <Link to={`/products/${stepItem.product?._id}`}>
                            {stepItem.product?.name}
                          </Link>
                        </h4>
                        <p className="step-card-instruction">{stepItem.instruction}</p>
                        <div className="step-card-rating">
                          ★ {stepItem.product?.rating || 4.8} · ({stepItem.product?.reviews || 850} reviews)
                        </div>
                      </div>

                      <div className="step-card-action-col">
                        <span className="step-card-price">
                          {formatPrice(stepItem.product?.price || 18000)}
                        </span>
                        <button
                          type="button"
                          className="step-card-add-btn"
                          onClick={() => handleAddStepToBag(stepItem.product, stepItem.type)}
                        >
                          + Add to Bag
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="routine-card-footer">
                  <Link to="/routine-generator" className="routine-custom-link">
                    ✨ Generate a Fully Customized Routine in AI Routine Generator →
                  </Link>
                </div>
              </div>

              {/* 4. Previous AI Recommendations History */}
              <div className="account-card beauty-history-card">
                <div className="history-card-header">
                  <div>
                    <span className="history-card-tag">SAVED SESSIONS</span>
                    <h3 className="history-card-title">Previous AI Consultations</h3>
                    <p className="history-card-sub">
                      Past recommendations generated for your profile by the Gracia Fab Beauty Advisor.
                    </p>
                  </div>
                  <Link to="/advisor" className="history-new-consult-btn">
                    ✦ New Consultation
                  </Link>
                </div>

                {loadingRecs ? (
                  <p className="history-empty-text">Loading saved consultations...</p>
                ) : savedRecommendations.length > 0 ? (
                  <div className="history-sessions-list">
                    {savedRecommendations.map((session, sIdx) => (
                      <div key={session._id || sIdx} className="history-session-item">
                        <div className="session-item-header">
                          <span className="session-num-badge">
                            Consultation #{session.number || sIdx + 1}
                          </span>
                          <span className="session-date-text">
                            {session.date ? new Date(session.date).toLocaleDateString() : "Recent"}
                          </span>
                        </div>

                        <div className="session-products-row">
                          {(session.products || []).map((p) => (
                            <div key={p._id || p.name} className="session-prod-tile">
                              <img
                                src={p.image}
                                alt={p.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=160&h=160&fit=crop";
                                }}
                              />
                              <div className="session-prod-info">
                                <h5>{p.name}</h5>
                                <span className="session-prod-price">
                                  {formatPrice(p.price || 18000)}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="session-prod-add-btn"
                                onClick={() => handleAddStepToBag(p, p.name)}
                              >
                                + Bag
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="history-empty-box">
                    <p className="history-empty-text">
                      No saved consultations yet. You can chat with our AI Beauty Advisor anytime
                      to receive tailored formulations and save them to your account.
                    </p>
                    <Link to="/advisor" className="history-cta-link">
                      Start Your First AI Consultation →
                    </Link>
                  </div>
                )}
              </div>

              {/* 5. Quick Reorder Shortcuts (Empties Replenishment) */}
              <div className="account-card beauty-empties-card">
                <div className="empties-header">
                  <div>
                    <span className="empties-tag">1-CLICK REPLENISHMENT</span>
                    <h3 className="empties-title">🧴 Replenish Your Routine Empties</h3>
                    <p className="empties-sub">
                      Running low? Quick 1-click reorder for your daily staples with same-day Lagos dispatch.
                    </p>
                  </div>
                </div>

                <div className="empties-grid">
                  {emptiesList.map((item) => (
                    <div key={item._id} className="empty-item-tile">
                      <div className="empty-item-img-wrap">
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=240&h=240&fit=crop";
                          }}
                        />
                      </div>
                      <div className="empty-item-details">
                        <h4 className="empty-item-title">{item.name}</h4>
                        <span className="empty-item-brand">{item.brand || "Gracia Fab"}</span>
                        <div className="empty-item-price-line">
                          <strong className="empty-price">{formatPrice(item.price || 18000)}</strong>
                          <span className="empty-stock-badge">In Stock</span>
                        </div>
                        <span className="empty-delivery-badge">⚡ Express Lagos Delivery</span>
                      </div>
                      <button
                        type="button"
                        className="empty-reorder-btn"
                        onClick={() => handleAddStepToBag(item, item.name)}
                      >
                        ⚡ Replenish & Reorder
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB 2: PROFILE (Standard Account View)
          ══════════════════════════════════════════ */}
          {activeTab === "profile" && (
            <div className="profile-view">
              {/* Streak Stars Banner Card */}
              <div className="account-card streak-banner-card">
                <div className="streak-banner-content">
                  <p className="streak-greeting">Hi, {firstName} !</p>
                  <p className="streak-balance">
                    Your current ✨ streak stars balance: <strong>10 ✨</strong>
                  </p>
                  <button
                    type="button"
                    className="streak-view-link"
                    onClick={() => setActiveTab("rewards")}
                  >
                    View your ✨ streak stars →
                  </button>
                </div>
              </div>

              {/* User Personal Info Card */}
              <div className="account-card">
                <div className="account-card-header">
                  <h3>{user.name || "Esther Obisesan"}</h3>
                  <button
                    type="button"
                    className="account-action-btn"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit
                  </button>
                </div>
                <div className="account-field-row">
                  <span className="account-field-label">Email</span>
                  <span className="account-field-val">{user.email}</span>
                </div>
              </div>

              {/* Addresses Card */}
              <div className="account-card">
                <div className="account-card-header">
                  <h3>Addresses</h3>
                  <button
                    type="button"
                    className="account-action-btn"
                    onClick={() => {
                      const newAddr = prompt("Enter delivery address:", userAddress);
                      if (newAddr) setUserAddress(newAddr);
                    }}
                  >
                    Add
                  </button>
                </div>

                <div className="account-address-tile">
                  <span className="account-pin-icon" aria-hidden="true">
                    📍
                  </span>
                  <div className="account-address-info">
                    <p className="account-address-title">
                      {user.name || "Esther Obisesan"}{" "}
                      <span className="account-default-pill">Default</span>
                    </p>
                    <p className="account-address-text">{userAddress}</p>
                  </div>
                  <span className="account-chevron" aria-hidden="true">
                    ›
                  </span>
                </div>
              </div>

              {/* Marketing Preferences Card */}
              <div className="account-card">
                <h3 className="account-card-heading-plain">Marketing preferences</h3>
                <div className="account-toggle-row">
                  <span className="account-toggle-label">
                    <span className="account-mail-icon" aria-hidden="true">
                      ✉
                    </span>{" "}
                    Email
                  </span>
                  <button
                    type="button"
                    className={`account-switch ${marketingEmail ? "on" : "off"}`}
                    onClick={() => setMarketingEmail(!marketingEmail)}
                    aria-label="Toggle marketing email preferences"
                  >
                    <span className="switch-knob">
                      {marketingEmail && <span className="switch-check">✓</span>}
                    </span>
                  </button>
                </div>
              </div>

              {/* Sign Out Actions */}
              <div className="account-signout-row">
                <button
                  type="button"
                  className="account-btn-signout"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
                <button
                  type="button"
                  className="account-link-signout-all"
                  onClick={handleLogout}
                >
                  Sign out of all devices
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB 3: ORDERS
          ══════════════════════════════════════════ */}
          {activeTab === "orders" && (
            <div className="orders-view">
              {loadingOrders ? (
                <div className="account-card">
                  <p>Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="account-card">
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/products" className="account-btn-signout" style={{ marginTop: "1rem" }}>
                    Start Shopping →
                  </Link>
                </div>
              ) : (
                <div className="orders-cards-list">
                  {orders.map((order, idx) => {
                    const itemImage =
                      order.orderItems?.[0]?.image ||
                      order.image ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=360&fit=crop&crop=face";
                    const orderNum = order._id ? order._id.slice(-5) : "16610";

                    return (
                      <div key={order._id || idx} className="account-card order-item-card">
                        <div className="order-item-layout">
                          <div className="order-item-thumb-wrap">
                            <img
                              src={itemImage}
                              alt={order.name || "Order Item"}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=360&fit=crop";
                              }}
                            />
                          </div>

                          <div className="order-item-info">
                            <h4 className="order-status-text">
                              {order.status || "On its way"}
                            </h4>
                            <p className="order-meta-text">
                              #{orderNum} · {formatPrice(order.totalPrice || 80000)} NGN
                            </p>
                          </div>

                          <button
                            type="button"
                            className="order-btn-buyagain"
                            onClick={() => handleBuyAgain(order)}
                          >
                            Buy again
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB 4: STREAK REWARDS
          ══════════════════════════════════════════ */}
          {activeTab === "rewards" && (
            <div className="rewards-view">
              <LoyaltyWidget />
            </div>
          )}

          {/* ══════════════════════════════════════════
              TAB 5: SECURITY
          ══════════════════════════════════════════ */}
          {activeTab === "security" && (
            <div className="account-card">
              <div className="account-card-header">
                <h3>Change password</h3>
              </div>

              {passwordSuccess && (
                <div className="account-alert-success">{passwordSuccess}</div>
              )}
              {passwordError && (
                <div className="account-alert-error">⚠️ {passwordError}</div>
              )}

              <form onSubmit={handlePasswordUpdate}>
                <div className="form-group">
                  <label>New password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="At least 6 characters"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm new password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Repeat new password"
                  />
                </div>
                <button
                  type="submit"
                  className="account-btn-primary"
                  disabled={passwordSaving}
                >
                  {passwordSaving ? "Updating…" : "Update password"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Account Bottom Legal Bar */}
      <footer className="account-legal-footer">
        <div className="account-legal-links">
          <span className="account-region-select">Nigeria ⌄</span>
          <Link to="/">Refund policy</Link>
          <Link to="/">Shipping</Link>
          <Link to="/">Privacy policy</Link>
          <Link to="/">Terms of service</Link>
          <Link to="/contact">Contact information</Link>
        </div>
      </footer>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSave={handleProfileSave}
      />
    </div>
  );
}

export default Dashboard;
