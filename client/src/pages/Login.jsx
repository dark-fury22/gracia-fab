import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthFullscreen.css";
import SEO from "../components/SEO";
import GraciaLogo from "../components/GraciaLogo";
import SocialLogin from "../components/SocialLogin";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      return setError("Please fill in all fields");
    }
    try {
      setLoading(true);
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  <SEO
    title="About Us"
    description="Learn about Gracia Fab — Nigeria's premier AI-powered beauty brand celebrating individuality through clean, cruelty-free beauty products."
    keywords="about Gracia Fab, Nigerian beauty brand, clean beauty Nigeria"
    url="/about"
  />;

  return (
    <div className="auth-fullscreen">
      {/* Background image */}
      <div
        className="auth-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=1400&h=900&fit=crop')`,
        }}
      />

      {/* Dark overlay */}
      <div className="auth-overlay" />

      {/* Navbar */}
      <div className="auth-topbar">
        <Link to="/" className="auth-brand">
          <GraciaLogo size="lg" />
        </Link>
        <div className="auth-topbar-links">
          <Link to="/login" className="active">
            Login
          </Link>
          <Link to="/products">Shop</Link>
          <Link to="/register">Register</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      {/* Form */}
      <div className="auth-center">
        <form className="auth-glass-form" onSubmit={handleSubmit}>
          {error && <div className="auth-fullscreen-error">⚠️ {error}</div>}

          <div className="auth-glass-field">
            <span className="auth-field-icon">👤</span>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
            />
          </div>

          <div className="auth-glass-field">
            <span className="auth-field-icon">🔒</span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-glass-btn" disabled={loading}>
            {loading ? "Signing in..." : "GET STARTED"}
          </button>

          <p className="auth-glass-footer">
            Don't have an account? <Link to="/register">Sign up free</Link>
          </p>
          <SocialLogin />
        </form>
      </div>

      {/* Bottom bar */}
      <div className="auth-bottombar">
        <div className="auth-bottom-links">
          <Link to="/about">About Us</Link>
          <Link to="/">Privacy Policy</Link>
          <Link to="/">Terms Of Use</Link>
        </div>
        <p>© 2024 Gracia Fab. All Rights Reserved.</p>
      </div>
    </div>
  );
}

export default Login;
