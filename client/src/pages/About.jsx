import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/About.css";
import SEO from "../components/SEO";

const stats = [
  { number: "+5K", label: "Happy Customers" },
  { number: "+200", label: "Products Available" },
  { number: "4.9★", label: "Average Rating" },
  { number: "100%", label: "Authentic Products" },
];

const team = [
  {
    name: "Dr Pastra Etie Arinze",
    role: "Founder & GMD",
    img: "https://res.cloudinary.com/dyzkjerez/image/upload/v1778840697/597857690_1158227046476150_6996214699199997289_n.jpg_wwxrey.jpg",
  },
  {
    name: "",
    role: "Head of Beauty",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
  },
  {
    name: "",
    role: " Product Manager",
    img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=300&h=300&fit=crop&crop=face",
  },
];

function About({ onCartOpen }) {
  <SEO
    title="About Us"
    description="Learn about Gracia Fab — Nigeria's premier AI-powered beauty brand celebrating individuality through clean, cruelty-free beauty products."
    keywords="about Gracia Fab, Nigerian beauty brand, clean beauty Nigeria"
    url="/about"
  />;
  return (
    <>
      <Navbar onCartOpen={onCartOpen} />
      <div className="about-page">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero-inner">
            <div className="about-hero-text">
              <span className="about-eyebrow">Our Mission</span>
              <h1>
                Beauty
                <br />
                <em>Phase</em>
              </h1>
              <p className="about-hero-tagline">
                Just like the moon, your beauty has many phases — and each one
                deserves to shine.
              </p>
              <p className="about-hero-desc">
                Our mission is to celebrate individuality through clean,
                cruelty-free formulas that enhance your natural radiance at
                every stage.
              </p>
            </div>
            <div className="about-hero-img">
              <img
                src="https://i.pinimg.com/736x/5e/08/33/5e08336846c62c3a83b5df214d35f56f.jpg"
                alt="Gracia Fab Beauty"
              />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="about-stats">
          <div className="about-stats-inner">
            {stats.map((s, i) => (
              <div key={i} className="about-stat">
                <h2>{s.number}</h2>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="about-story">
          <div className="about-story-inner">
            <div className="about-story-img">
              <img
                src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=700&fit=crop"
                alt="Our Story"
              />
            </div>
            <div className="about-story-content">
              <span className="about-eyebrow">Redefining Radiance</span>
              <h2>Where Beauty Meets Intelligence</h2>
              <p>
                Gracia Fab was born from a simple belief: every woman deserves
                to feel effortlessly beautiful. We combine cutting-edge AI
                technology with carefully curated beauty products to give you
                personalized recommendations that actually work.
              </p>
              <p>
                More than makeup, Gracia Fab is a movement toward self-love and
                authenticity. We're committed to sustainability, ethical
                sourcing and cruelty-free practices because beauty should never
                come at a cost to others or the planet. When you glow, you own
                your glow.
              </p>
              <div className="about-values">
                <div className="about-value">
                  <span>🌿</span>
                  <div>
                    <h4>Clean Formulas</h4>
                    <p>No harmful ingredients — ever.</p>
                  </div>
                </div>
                <div className="about-value">
                  <span>✦</span>
                  <div>
                    <h4>AI-Powered</h4>
                    <p>Smart recommendations for your needs.</p>
                  </div>
                </div>
                <div className="about-value">
                  <span>💚</span>
                  <div>
                    <h4>Cruelty-Free</h4>
                    <p>Ethical beauty for a better world.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="about-team">
          <div className="about-team-inner">
            <div className="about-section-header">
              <h2>Meet the Team</h2>
              <p>The passionate people behind Gracia Fab</p>
            </div>
            <div className="about-team-grid">
              {team.map((member, i) => (
                <div key={i} className="about-team-card">
                  <div className="about-team-img">
                    <img src={member.img} alt={member.name} />
                  </div>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default About;
