import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

// GraciaLogo.jsx
// Place this file in: client/src/components/GraciaLogo.jsx

function GraciaLogo({ size = "md", showText = true }) {
  const { theme } = useTheme();
  const sizes = {
    xs: { w: 32, h: 32, textSize: 0 },
    sm: { w: 38, h: 38, textSize: 11 },
    md: { w: 52, h: 52, textSize: 13 },
    lg: { w: 72, h: 72, textSize: 17 },
    xl: { w: 100, h: 100, textSize: 22 },
  };

  const { w, h } = sizes[size] || sizes.md;

  // Theme-aware colors
  const stroke = theme === "dark" ? "#FCA311" : "#FE938C";
  const stroke2 = theme === "dark" ? "#E59310" : "#C49792";
  const textPrimary = theme === "dark" ? "#FFFFFF" : "#2C1810";
  const textAccent = theme === "dark" ? "#FCA311" : "#FE938C";
  const strokeWidth = size === "xs" ? 5 : 6.5;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        transition: "all 0.3s ease",
        transform: isHovered ? "scale(1.03)" : "scale(1)",
        filter: isHovered ? `drop-shadow(0 0 8px ${stroke}55)` : "none",
        cursor: "pointer",
      }}
    >
      {/* ── Icon ── */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 210"
        width={w}
        height={h}
        fill="none"
        aria-label="Gracia Fab logo icon"
      >
        {/* ── Crescent arc (C-shape, opening to the right) ── */}
        {/* Center ≈ (88,105), radius 82 */}
        <path
          d="M 148,42 A 82,82 0 1,0 148,168"
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Leaves / botanical elements at top of head ── */}
        {/* Main leaf 1 — upper right, large */}
        <path
          d="M 120,42 C 126,24 148,26 144,46 C 140,62 122,60 120,42 Z"
          stroke={stroke}
          strokeWidth="2.2"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Leaf 1 vein */}
        <path
          d="M 120,42 C 130,40 140,44 144,46"
          stroke={stroke}
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />

        {/* Leaf 2 — pointing upper right */}
        <path
          d="M 130,36 C 138,18 160,22 154,42 C 150,58 132,54 130,36 Z"
          stroke={stroke}
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Leaf 2 vein */}
        <path
          d="M 130,36 C 142,34 150,40 154,42"
          stroke={stroke}
          strokeWidth="1"
          fill="none"
          opacity="0.45"
        />

        {/* Leaf 3 — small, top */}
        <path
          d="M 118,34 C 122,20 136,22 134,36 C 132,48 120,46 118,34 Z"
          stroke={stroke2}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* Leaf 4 — small, right side */}
        <path
          d="M 144,44 C 154,32 168,38 164,54 C 160,66 146,62 144,44 Z"
          stroke={stroke2}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
          opacity="0.75"
        />

        {/* ── Face profile (front contour only, facing right) ── */}
        {/* Forehead → nose bridge → nose → lips → chin → neck */}
        <path
          d={`
            M 114,46
            C 126,42 136,54 141,68
            C 145,78 149,85 150,92
            C 151,98 148,104 145,110
            C 144,114 143,118 144,122
            C 145,128 140,135 133,140
            C 126,145 118,150 112,158
          `}
          stroke={stroke}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── Hair — main flow (from back of head, flowing down-right) ── */}
        <path
          d={`
            M 114,46
            C 100,42 84,50 76,64
            C 70,76 68,92 70,108
            C 72,124 80,140 90,152
            C 96,160 103,166 108,172
          `}
          stroke={stroke}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hair strand 2 */}
        <path
          d={`
            M 78,67
            C 72,84 70,102 72,118
            C 74,132 82,146 92,156
          `}
          stroke={stroke}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Hair strand 3 */}
        <path
          d={`
            M 72,92
            C 70,108 72,124 78,138
            C 83,148 92,156 98,164
          `}
          stroke={stroke2}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          opacity="0.65"
        />

        {/* Hair strand 4 — innermost */}
        <path
          d={`
            M 76,110
            C 76,124 80,138 88,150
            C 93,158 100,164 104,170
          `}
          stroke={stroke2}
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: sizes[size]?.textSize || 13,
              color: textPrimary,
              letterSpacing: "0.02em",
            }}
          >
            Gracia
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: (sizes[size]?.textSize || 13) * 0.72,
              color: textAccent,
              letterSpacing: "0.28em",
              marginTop: 1,
            }}
          >
            FAB
          </span>
        </div>
      )}
    </div>
  );
}

export default GraciaLogo;
