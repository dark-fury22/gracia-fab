import { useTheme } from "../context/ThemeContext";

function GraciaLogo({ size = "md", showText = true }) {
  const { theme } = useTheme();
  const sizes = {
    xs: { icon: 32, text: 0 },
    sm: { icon: 38, text: 11 },
    md: { icon: 48, text: 13 },
    lg: { icon: 64, text: 17 },
  };

  const s = sizes[size] || sizes.md;
  const accent = theme === "dark" ? "#FCA311" : "#FE938C";
  const alt = theme === "dark" ? "#E59310" : "#C49792";
  const text1 = theme === "dark" ? "#FFFFFF" : "#2C1810";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        textDecoration: "none",
      }}
    >
      {/* SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 210"
        width={s.icon}
        height={s.icon}
        fill="none"
        style={{ flexShrink: 0, display: "block" }}
      >
        {/* Crescent arc */}
        <path
          d="M 148,42 A 82,82 0 1,0 148,168"
          stroke={accent}
          strokeWidth="6.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Leaf 1 */}
        <path
          d="M 120,42 C 126,24 148,26 144,46 C 140,62 122,60 120,42 Z"
          stroke={accent}
          strokeWidth="2.2"
          fill="none"
        />
        {/* Leaf 2 */}
        <path
          d="M 130,36 C 138,18 160,22 154,42 C 150,58 132,54 130,36 Z"
          stroke={accent}
          strokeWidth="2"
          fill="none"
        />
        {/* Leaf 3 */}
        <path
          d="M 118,34 C 122,20 136,22 134,36 C 132,48 120,46 118,34 Z"
          stroke={alt}
          strokeWidth="1.8"
          fill="none"
          opacity="0.85"
        />
        {/* Leaf 4 */}
        <path
          d="M 144,44 C 154,32 168,38 164,54 C 160,66 146,62 144,44 Z"
          stroke={alt}
          strokeWidth="1.8"
          fill="none"
          opacity="0.75"
        />
        {/* Face profile */}
        <path
          d="M 114,46 C 126,42 136,54 141,68 C 145,78 149,85 150,92 C 151,98 148,104 145,110 C 144,114 143,118 144,122 C 145,128 140,135 133,140 C 126,145 118,150 112,158"
          stroke={accent}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Hair main */}
        <path
          d="M 114,46 C 100,42 84,50 76,64 C 70,76 68,92 70,108 C 72,124 80,140 90,152 C 96,160 103,166 108,172"
          stroke={accent}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Hair 2 */}
        <path
          d="M 78,67 C 72,84 70,102 72,118 C 74,132 82,146 92,156"
          stroke={accent}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Hair 3 */}
        <path
          d="M 72,92 C 70,108 72,124 78,138 C 83,148 92,156 98,164"
          stroke={alt}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>

      {/* Wordmark */}
      {showText && s.text > 0 && (
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: s.text,
              color: text1,
              letterSpacing: "0.02em",
            }}
          >
            Gracia
          </span>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: s.text * 0.72,
              color: accent,
              letterSpacing: "0.28em",
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
