import LogoMark from "./LogoMark";

const accent = "#7A2432";
const text1 = "#241310";

function GraciaLogo({ size = "md", showText = true, variant = "default" }) {
  const sizes = {
    xs: { icon: 28, text: 12, wordmark: 16 },
    sm: { icon: 34, text: 13, wordmark: 20 },
    md: { icon: 44, text: 15, wordmark: 25 },
    lg: { icon: 56, text: 18, wordmark: 32 },
  };

  const s = sizes[size] || sizes.md;

  if (variant === "editorial") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          textDecoration: "none",
          userSelect: "none",
        }}
      >
        <LogoMark
          style={{ height: s.icon, width: "auto", display: "block", flexShrink: 0, color: accent }}
        />
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: s.wordmark,
            color: accent,
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}
        >
          Gracia Fab
        </span>
        <span
          style={{
            color: accent,
            fontSize: s.wordmark * 0.6,
            lineHeight: 1,
            marginBottom: s.wordmark * 0.35,
            fontWeight: 700,
          }}
        >
          ✦
        </span>
      </div>
    );
  }

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
      {/* Brand icon */}
      <LogoMark
        style={{ height: s.icon, width: "auto", display: "block", flexShrink: 0, color: accent }}
      />

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
