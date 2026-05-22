import "./Features.css";

const features = [
  {
    icon: "✦",
    title: "Skincare",
    desc: "Personalized routines crafted for your unique skin type and concerns.",
  },
  {
    icon: "◈",
    title: "Haircare",
    desc: "Curated treatments for every hair texture, goal and lifestyle.",
  },
  {
    icon: "◇",
    title: "Wigs & Styles",
    desc: "Discover wig styles that complement your face shape and occasion.",
  },
  {
    icon: "❋",
    title: "Bridal Beauty",
    desc: "Look breathtaking on your most special day with expert curation.",
  },
];

function Features() {
  return (
    <section className="features">
      <div className="features-inner">
        <div className="features-header">
          <h2>
            Everything You Need
            <br />
            to <span>Glow</span>
          </h2>
          <p>
            BeautyAI covers every dimension of your beauty — powered by
            intelligent recommendations.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
