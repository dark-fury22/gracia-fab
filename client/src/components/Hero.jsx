import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

// ── Particle Canvas ──────────────────────────────
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.7 + 0.2;
        this.color =
          Math.random() > 0.5
            ? `rgba(252,163,17,${this.opacity})`
            : `rgba(254,147,140,${this.opacity})`;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.02 + Math.random() * 0.03;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += this.pulseSpeed;
        // Ensure size never goes below 0.1
        this.currentSize = Math.max(
          0.1,
          this.size + Math.sin(this.pulse) * 0.8,
        );
        if (
          this.x < 0 ||
          this.x > canvas.width ||
          this.y < 0 ||
          this.y > canvas.height
        )
          this.reset();
      }
      draw() {
        // Prevent negative radius crash
        const radius = Math.max(0.1, this.currentSize || this.size);
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = [];
    for (let i = 0; i < 80; i++) particles.push(new Particle());

    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.005;

      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(252,163,17,${0.08 * (1 - dist / 80)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Floating hexagons
      const shapes = [
        { x: canvas.width * 0.08, y: canvas.height * 0.2 },
        { x: canvas.width * 0.88, y: canvas.height * 0.75 },
        { x: canvas.width * 0.5, y: canvas.height * 0.92 },
      ];
      shapes.forEach((s, i) => {
        ctx.save();
        ctx.translate(
          s.x + Math.sin(t + i) * 15,
          s.y + Math.cos(t * 0.7 + i) * 10,
        );
        ctx.rotate(t * 0.3 + i);
        ctx.strokeStyle = `rgba(252,163,17,0.15)`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(252,163,17,0.3)";
        const size = 20 + Math.sin(t + i) * 5;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (k / 6) * Math.PI * 2;
          k === 0
            ? ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size)
            : ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
};

// ── Hero Component ────────────────────────────────
function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 20,
    });
  };

  return (
    <section className="hero" onMouseMove={handleMouseMove}>
      <ParticleCanvas />

      {/* Grid overlay */}
      <div className="hero-grid-overlay" />

      {/* Ambient glows */}
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />

      <div className="hero-inner">
        {/* ── LEFT: Text ── */}
        <div className="hero-content">
          <div className="hero-live-pill">
            <span className="hero-live-dot" />
            AI-Powered Beauty ✦ Gracia Fab
          </div>

          <h1 className="hero-title">
            Discover Your
            <br />
            <em>Signature</em>
            <br />
            Glow ✨
          </h1>

          <p className="hero-desc">
            Experience the transformative power of Gracia Fab and unveil your
            signature glow today. AI-curated just for you.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="hero-btn-primary">
              Shop Now →
            </Link>
            <Link to="/recommend" className="hero-btn-secondary">
              Get AI Picks
            </Link>
          </div>

          <div className="hero-social-proof">
            <div className="hero-avatars">
              <img
                src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face"
                alt="user"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face"
                alt="user"
              />
              <img
                src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=40&h=40&fit=crop&crop=face"
                alt="user"
              />
            </div>
            <div>
              <div className="hero-stars">⭐⭐⭐⭐⭐</div>
              <p>5k+ happy customers</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: 3D Image ── */}
        <div
          className="hero-visual"
          style={{
            transform: `perspective(1000px) rotateY(${-mousePos.x * 0.4}deg) rotateX(${mousePos.y * 0.25}deg)`,
          }}
        >
          {/* HUD corners */}
          <div className="hud-corner hud-tl" />
          <div className="hud-corner hud-tr" />
          <div className="hud-corner hud-bl" />
          <div className="hud-corner hud-br" />

          {/* Rotating rings */}
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />

          {/* Image */}
          <div className="hero-img-blob">
            <div className="hero-scanline" />
            <img
              src="https://i.pinimg.com/736x/0c/a0/c6/0ca0c6fafc3138bd78aaa9a6024a4332.jpg"
              alt="Gracia Fab Beauty"
              className="hero-model-img"
            />
            <div className="hero-img-overlay" />
          </div>

          {/* Float card — top right */}
          <div className="hero-float-card hero-float-top">
            <span className="float-emoji">💄</span>
            <div>
              <p className="float-label">New Arrivals</p>
              <p className="float-sub">Bridal Collection</p>
            </div>
          </div>

          {/* Float card — bottom left */}
          <div className="hero-float-card hero-float-bottom">
            <div className="hero-rating-circle">4.9</div>
            <div>
              <p className="float-label">Top Rated</p>
              <p className="float-stars">⭐⭐⭐⭐⭐</p>
            </div>
          </div>

          {/* AI bar — middle right */}
          <div className="hero-ai-bar">
            <p className="ai-bar-label">AI MATCH</p>
            <div className="ai-bar-graph">
              {[85, 60, 90, 45, 75].map((h, i) => (
                <div
                  key={i}
                  className={`ai-bar-col ${i === 2 ? "active" : ""}`}
                  style={{ height: h * 0.35 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
