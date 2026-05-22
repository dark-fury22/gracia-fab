import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthFullscreen.css";
import SEO from "../components/SEO";
import GraciaLogo from "../components/GraciaLogo";
import SocialLogin from "../components/SocialLogin";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.email || !formData.password) {
      return setError("Please fill in all fields");
    }
    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }
    try {
      setLoading(true);
      await register(formData.name, formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  <SEO
    title="Create Account"
    description="Join Gracia Fab today and discover personalized AI beauty recommendations for skincare, haircare, wigs and bridal looks."
    url="/register"
  />;
  return (
    <div className="auth-fullscreen">
      {/* Background image */}
      <div
        className="auth-bg"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&h=900&fit=crop')`,
        }}
      />

      <div className="auth-overlay" />

      {/* Navbar */}
      <div className="auth-topbar">
        <Link to="/" className="auth-brand">
          <GraciaLogo size="lg" />
        </Link>
        <div className="auth-topbar-links">
          <Link to="/login">Login</Link>
          <Link to="/products">Shop</Link>
          <Link to="/register" className="active">
            Register
          </Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      {/* Form */}
      <div className="auth-center">
        <form className="auth-glass-form" onSubmit={handleSubmit}>
          {error && <div className="auth-fullscreen-error">⚠️ {error}</div>}

          <div className="auth-glass-field">
            <span className="auth-field-icon">✨</span>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="auth-glass-field">
            <span className="auth-field-icon">👤</span>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
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

          <div className="auth-glass-field">
            <span className="auth-field-icon">🔐</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-glass-btn" disabled={loading}>
            {loading ? "Creating Account..." : "GET STARTED"}
          </button>

          <p className="auth-glass-footer">
            Already have an account? <Link to="/login">Sign in</Link>
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
        <p>© 2026 Gracia Fab. All Rights Reserved.</p>
      </div>
    </div>
  );
}

export default Register;
