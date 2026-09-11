import "./TrustTicker.css";

function TrustTicker() {
  const items = [
    "FAST SHIPPING IN LAGOS & NATIONWIDE",
    "100% RAW VIRGIN HAIR · SINGLE DONOR",
    "AI-POWERED SKIN & UNDERTONE MATCHING",
    "DERMATOLOGIST & STYLIST FORMULATED",
    "UNDETECTABLE HD LACE MELT",
    "SECURE PAYSTACK CHECKOUT IN ₦",
  ];

  return (
    <div className="trust-ticker-wrap" aria-label="Brand Guarantees">
      <div className="trust-ticker-track">
        {/* Double the list for seamless continuous loop */}
        {[...items, ...items].map((item, idx) => (
          <div key={idx} className="trust-ticker-item">
            <span className="ticker-bullet">✦</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrustTicker;
