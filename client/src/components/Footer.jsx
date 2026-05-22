import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h3>Gracia Fab</h3>
          <p>
            Your AI-powered beauty advisor for skincare, haircare, wigs and
            bridal beauty — made for you.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram">
              📸
            </a>
            <a href="#" aria-label="TikTok">
              🎵
            </a>
            <a href="#" aria-label="Twitter">
              🐦
            </a>
            <a href="#" aria-label="Facebook">
              👥
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=skincare">Skincare</Link>
          <Link to="/products?category=haircare">Haircare</Link>
          <Link to="/products?category=wig">Wigs</Link>
          <Link to="/products?category=bridal">Bridal</Link>
        </div>

        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/dashboard">My Account</Link>
          <Link to="/my-orders">My Orders</Link>
          <Link to="/wishlist">Saved Items</Link>
          <Link to="/recommend">AI Advisor</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/">Privacy Policy</Link>
          <Link to="/">Terms of Use</Link>
          <Link to="/">FAQ</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Gracia Fab. All rights reserved.</p>
        <div className="footer-payments">
          <span title="Paystack">💳</span>
          <span title="Bank Transfer">🏦</span>
          <span title="USSD">📱</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
