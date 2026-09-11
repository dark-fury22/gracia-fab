import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
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

  return (
    <div className="auth-page">
      <SEO
        title="Create Account"
        description="Join Gracia Fab today and discover personalized AI beauty recommendations for skincare, haircare, wigs and bridal looks."
        url="/register"
      />

      <div className="auth-shell">
        <Link to="/" className="auth-logo-link">
          <GraciaLogo size="lg" />
        </Link>

        <h1 className="auth-heading">Create account</h1>
        <p className="auth-subheading">Join free and get your AI beauty picks</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">⚠️ {error}</div>}

          <SocialLogin />

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="auth-submit btn-primary-action"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account →"}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <div className="auth-legal">
        <p>
          By continuing, you agree to our <Link to="/">Terms of service</Link>
        </p>
        <Link to="/" className="auth-privacy-link">
          Privacy policy
        </Link>
      </div>
    </div>
  );
}

export default Register;
