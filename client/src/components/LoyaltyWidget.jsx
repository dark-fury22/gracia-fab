import { useState, useEffect } from "react";
import API_URL from "../config";
import "./LoyaltyWidget.css";

const TIER_COLORS = {
  bronze: { bg: "#CD7F32", text: "#fff", emoji: "🥉" },
  silver: { bg: "#C0C0C0", text: "#333", emoji: "🥈" },
  gold: { bg: "#FFD700", text: "#333", emoji: "🥇" },
  platinum: { bg: "#E5E4E2", text: "#333", emoji: "💎" },
};

function LoyaltyWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);

    fetch(`${API_URL}/api/loyalty`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="loyalty-widget loading">Loading your rewards...</div>
    );
  if (!data) return null;

  const tier = TIER_COLORS[data.tier] || TIER_COLORS.bronze;
  const progress = data.nextTier
    ? Math.min(
        100,
        100 - (data.pointsToNext / (data.pointsToNext + data.points)) * 100,
      )
    : 100;

  return (
    <div className="loyalty-widget">
      {/* Tier badge */}
      <div className="loyalty-tier-badge" style={{ background: tier.bg }}>
        <span>{tier.emoji}</span>
        <span
          style={{
            color: tier.text,
            textTransform: "capitalize",
            fontWeight: 700,
          }}
        >
          {data.tier} Member
        </span>
      </div>

      {/* Points */}
      <div className="loyalty-points-row">
        <div className="loyalty-points-main">
          <span className="loyalty-points-num">
            {data.points.toLocaleString()}
          </span>
          <span className="loyalty-points-label">points</span>
        </div>
        <div className="loyalty-naira">
          ≈ ₦{data.nairaValue.toLocaleString()} discount available
        </div>
      </div>

      {/* Progress to next tier */}
      {data.nextTier && (
        <div className="loyalty-progress-section">
          <div className="loyalty-progress-label">
            <span>Progress to {data.nextTier}</span>
            <span>{data.pointsToNext} points to go</span>
          </div>
          <div className="loyalty-progress-bar">
            <div
              className="loyalty-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="loyalty-benefits">
        <p>✦ {data.tierBenefits[data.tier]}</p>
      </div>

      {/* Recent history */}
      {data.history?.length > 0 && (
        <div className="loyalty-history">
          <p className="loyalty-history-title">Recent Activity</p>
          {data.history.slice(0, 3).map((h, i) => (
            <div key={i} className="loyalty-history-item">
              <span className={h.type === "earn" ? "earn" : "redeem"}>
                {h.type === "earn" ? "+" : ""}
                {h.points} pts
              </span>
              <span>{h.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LoyaltyWidget;
