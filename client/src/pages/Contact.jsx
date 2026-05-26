import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import API_URL from "../config";
import "../styles/Contact.css";

function Contact({ onCartOpen }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.message) {
      return setError("Please fill in your name, email and message.");
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setSuccess(data.message);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Contact Us" url="/contact" />
      <Navbar onCartOpen={onCartOpen} />
      <div className="contact-page">
        {/* Header */}
        <section className="contact-header-section">
          <div className="contact-header-inner">
            <span className="contact-eyebrow">Contact Us</span>
            <h1>
              Get in Touch with
              <br />
              <em>Gracia Fab</em>
            </h1>
            <p>
              At Gracia Fab, we love hearing from our customers. Whether you
              have questions about our products, need help with your order, or
              want personalized beauty advice.
            </p>
          </div>
        </section>

        {/* Form + Info */}
        <section className="contact-main">
          <div className="contact-main-inner">
            {/* Form */}
            <div className="contact-form-card">
              <h2>Send Us a Message 💌</h2>

              {success && <div className="contact-success">✅ {success}</div>}
              {error && <div className="contact-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="contact-form-grid">
                  <div className="contact-field">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="contact-field">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="contact-field contact-full">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="e.g. 08012345678"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="contact-field contact-full">
                    <label>Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="">Choose a subject</option>
                      <option>Product Inquiry</option>
                      <option>Order Support</option>
                      <option>Returns & Refunds</option>
                      <option>Beauty Consultation</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="contact-field contact-full">
                    <label>Message *</label>
                    <textarea
                      name="message"
                      rows={5}
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="contact-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message 💌"}
                </button>
              </form>
            </div>

            {/* Info cards */}
            <div className="contact-info">
              {/* Email — opens mail app */}
              <a
                href="mailto:hello@graciafab.com?subject=Beauty Inquiry"
                className="contact-info-card contact-info-link"
              >
                <span className="contact-info-icon">📧</span>
                <div>
                  <h3>Email Us</h3>
                  <p>hello@graciafab.com — we reply within 24 hours.</p>
                  <span className="contact-info-action">Tap to email →</span>
                </div>
              </a>

              {/* Store — opens Google Maps */}
              <a
                href="https://maps.google.com/?q=Victoria+Island+Lagos+Nigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info-card contact-info-link"
              >
                <span className="contact-info-icon">🏪</span>
                <div>
                  <h3>Visit Our Store</h3>
                  <p>Victoria Island, Lagos, Nigeria.</p>
                  <span className="contact-info-action">Get directions →</span>
                </div>
              </a>

              {/* Phone — opens phone dialer */}
              <a
                href="tel:+2348012345678"
                className="contact-info-card contact-info-link"
              >
                <span className="contact-info-icon">📞</span>
                <div>
                  <h3>Call Support</h3>
                  <p>Mon–Sat, 9am–6pm WAT.</p>
                  <span className="contact-info-action">Tap to call →</span>
                </div>
              </a>

              {/* WhatsApp — opens WhatsApp directly */}
              <a
                href="https://wa.me/2348012345678?text=Hi%20Gracia%20Fab!%20I%20need%20help%20with..."
                target="_blank"
                rel="noopener noreferrer"
                className="contact-info-card contact-info-link"
              >
                <span className="contact-info-icon">💬</span>
                <div>
                  <h3>WhatsApp Us</h3>
                  <p>Chat with us instantly on WhatsApp.</p>
                  <span className="contact-info-action">Open WhatsApp →</span>
                </div>
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default Contact;
