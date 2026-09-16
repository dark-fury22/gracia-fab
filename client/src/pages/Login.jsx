import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./AuthFullscreen.css";
import SEO from "../components/SEO";
import GraciaLogo from "../components/GraciaLogo";
import SocialLogin from "../components/SocialLogin";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [remindDrops, setRemindDrops] = useState(true);
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
      const data = await login(formData.email, formData.password);
      navigate("/verify-code", { state: { email: data.email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" role="main">
      <SEO
        title="Sign In"
        description="Sign in to your Gracia Fab account for personalized AI beauty recommendations."
        url="/login"
      />

      <div className="auth-shell">
        <Link to="/" className="auth-logo-link" title="Return to Gracia Fab home">
          <GraciaLogo size="lg" variant="editorial" />
        </Link>

        <h1 className="auth-heading">Sign in</h1>
        <p className="auth-subheading">Sign in or create an account</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">⚠️ {error}</div>}

          <SocialLogin />

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="form-group auth-input-wrap">
            <label htmlFor="auth-email">Email</label>
            <div className="auth-input-with-action">
              <input
                id="auth-email"
                type="email"
                name="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
              <button
                type="submit"
                className="auth-inline-arrow"
                disabled={loading || !formData.email}
                aria-label="Submit email"
                title="Continue"
              >
                →
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <label className="auth-checkbox-label">
            <input
              type="checkbox"
              checked={remindDrops}
              onChange={(e) => setRemindDrops(e.target.checked)}
              className="auth-custom-checkbox"
            />
            <span className="auth-checkbox-text">
              Remind me about insider discounts & stylish drops 🔥
            </span>
          </label>

          <button
            type="submit"
            className="auth-submit btn-primary-action"
            disabled={loading}
          >
            {loading ? "Sending code…" : "Sign in →"}
          </button>
        </form>

        <p className="auth-toggle">
          Don't have an account? <Link to="/register">Sign up free</Link>
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

export default Login;
