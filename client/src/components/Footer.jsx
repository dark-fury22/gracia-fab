import { useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config";
import "./Footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signupError, setSignupError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSignupError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/contact/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Subscription failed.");

      setSubmitted(true);
      setEmail("");
      setPhone("");
    } catch (err) {
      setSignupError(
        err.message || "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="ysl-footer">
      {/* ── 5-Column Luxury Main Grid ── */}
      <div className="ysl-footer-top">
        {/* Column 1: Exclusive Beauty */}
        <div className="ysl-footer-col">
          <h3 className="ysl-footer-col-title">EXCLUSIVE BEAUTY</h3>
          <ul className="ysl-footer-links">
            <li><Link to="/about">About Gracia Fab</Link></li>
            <li><Link to="/services">Haute Beauty Services</Link></li>
            <li><Link to="/recommend">AI Beauty Advisor</Link></li>
            <li><Link to="/skin-analysis">AI Skin Analysis</Link></li>
            <li><Link to="/routine-generator">Routine Generator</Link></li>
            <li><Link to="/skin-tone">Skin Tone Detector</Link></li>
            <li><Link to="/products?filter=exclusives">Online Exclusives</Link></li>
          </ul>
        </div>

        {/* Column 2: Shop */}
        <div className="ysl-footer-col">
          <h3 className="ysl-footer-col-title">SHOP</h3>
          <ul className="ysl-footer-links">
            <li><Link to="/products?category=fragrance">Fragrances</Link></li>
            <li><Link to="/products?category=makeup">Makeup</Link></li>
            <li><Link to="/products?category=skincare">Melanin Skincare</Link></li>
            <li><Link to="/products?category=giftset">Gift Sets &amp; Vaults</Link></li>
            <li><Link to="/products?category=wig">HD Lace Frontal Wigs</Link></li>
            <li><Link to="/products?category=haircare">Raw Virgin Bundles</Link></li>
            <li><Link to="/products">View All Products</Link></li>
          </ul>
        </div>

        {/* Column 3: Customer Care */}
        <div className="ysl-footer-col">
          <h3 className="ysl-footer-col-title">CUSTOMER CARE</h3>
          <ul className="ysl-footer-links">
            <li><Link to="/contact">Contact Concierge</Link></li>
            <li><Link to="/my-orders">Track Your Order</Link></li>
            <li><Link to="/contact">Shipping &amp; Delivery</Link></li>
            <li><Link to="/contact">Returns &amp; Exchanges</Link></li>
            <li><Link to="/contact">Payment Options</Link></li>
            <li><Link to="/contact">Product &amp; Hair FAQs</Link></li>
            <li><Link to="/dashboard">VIP Account Login</Link></li>
          </ul>
        </div>

        {/* Column 4: Legal & Privacy */}
        <div className="ysl-footer-col">
          <h3 className="ysl-footer-col-title">LEGAL &amp; PRIVACY</h3>
          <ul className="ysl-footer-links">
            <li><Link to="/terms">Terms of Sale</Link></li>
            <li><Link to="/privacy">Privacy Notice</Link></li>
            <li><Link to="/cookies">Cookie Preferences</Link></li>
            <li><Link to="/accessibility">Accessibility</Link></li>
            <li><Link to="/compliance">Authenticity Guarantee</Link></li>
            <li><Link to="/terms">Security &amp; Encryption</Link></li>
          </ul>
        </div>

        {/* Column 5: Sign Up (Dual Field + Phone + Consent) */}
        <div className="ysl-footer-col ysl-footer-signup-col">
          <h3 className="ysl-footer-col-title">SIGN UP FOR EXCLUSIVE PRIVILEGES</h3>
          <p className="ysl-footer-signup-desc">
            Be the first to know about private vault drops, luxury gifts, and personalized AI beauty consultations.
          </p>

          {submitted ? (
            <div className="ysl-signup-success">
              <span className="ysl-check-icon">✓</span>
              <span>WELCOME TO THE GRACIA FAB PRIVILEGE CLUB. CHECK YOUR INBOX FOR YOUR SPECIAL GIFT CODE.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="ysl-signup-form">
              {signupError && (
                <div className="ysl-signup-error">⚠️ {signupError}</div>
              )}

              <div className="ysl-input-group">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ysl-footer-input"
                />
              </div>

              <div className="ysl-input-group">
                <input
                  type="tel"
                  placeholder="Enter mobile phone (+234...)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="ysl-footer-input"
                />
              </div>

              <label className="ysl-consent-label">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                  className="ysl-consent-checkbox"
                />
                <span>
                  I agree to receive communications from Gracia Fab and accept the{" "}
                  <Link to="/privacy">Privacy Policy</Link>.
                </span>
              </label>

              <button
                type="submit"
                className="ysl-footer-submit-btn"
                disabled={submitting}
              >
                {submitting ? "SUBMITTING…" : "SUBMIT"}
              </button>
            </form>
          )}

          <div className="ysl-footer-hotline">
            <span className="ysl-hotline-label">CONCIERGE HOTLINE:</span>
            <a href="tel:+234800472242" className="ysl-hotline-number">
              +234 800 GRACIA (9AM - 8PM WAT)
            </a>
          </div>

          <div className="ysl-footer-social-row">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.74 1.4-.04 2.66-.88 3.17-2.18.3-0.74.34-1.57.34-2.37V.02z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="X Twitter">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Country / Currency Selector & Bottom Bar ── */}
      <div className="ysl-footer-bottom">
        <div className="ysl-footer-country">
          <span className="ysl-flag">🇳🇬</span>
          <span className="ysl-country-name">NIGERIA · NAIJA (NGN ₦)</span>
          <span className="ysl-country-change">CHANGE REGION</span>
        </div>

        <div className="ysl-footer-copy">
          © 2026 GRACIA FAB BEAUTY MAISON. ALL RIGHTS RESERVED.
        </div>

        <div className="ysl-footer-payment-badges">
          <span className="ysl-pay-badge">PAYSTACK SECURED</span>
          <span className="ysl-pay-badge">MASTERCARD</span>
          <span className="ysl-pay-badge">VISA</span>
          <span className="ysl-pay-badge">VERVE</span>
          <span className="ysl-pay-badge">BANK TRANSFER</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
