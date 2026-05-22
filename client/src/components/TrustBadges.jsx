import "./TrustBadges.css";

const badges = [
  { icon: "🚚", title: "Free Shipping", sub: "On orders above ₦20,000" },
  { icon: "↩️", title: "Easy Returns", sub: "7-day return policy" },
  { icon: "✅", title: "100% Authentic", sub: "Genuine products only" },
  { icon: "🔒", title: "Secure Payment", sub: "Powered by Paystack" },
];

function TrustBadges() {
  return (
    <div className="trust-badges">
      <div className="trust-inner">
        {badges.map((b, i) => (
          <div key={i} className="trust-item">
            <span className="trust-icon">{b.icon}</span>
            <div>
              <p className="trust-title">{b.title}</p>
              <p className="trust-sub">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrustBadges;
