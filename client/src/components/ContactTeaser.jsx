import { useState } from "react";
import API_URL from "../config";
import "./ContactTeaser.css";

function ContactTeaser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in name, email and message.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus(data.message);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setError(err.message || "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-teaser">
      <div className="contact-inner">
        {/* Left */}
        <div className="contact-left">
          <h2>We're Here to Help! 🌟</h2>
          <p>
            Our friendly team is excited to answer your questions with beauty
            expert advice. Reach out anytime.
          </p>
          <div className="contact-team">
            <div className="contact-avatars">
              <img
                src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face"
                alt="team"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face"
                alt="team"
              />
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face"
                alt="team"
              />
            </div>
            <p>We're having 5k+ happy beautiful faces 😊</p>
          </div>
        </div>

        {/* Right — Form */}
        <div className="contact-right">
          <h3>Let's get in touch.</h3>

          {status ? (
            <div className="contact-teaser-success">✅ {status}</div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              {error && <div className="contact-teaser-error">⚠️ {error}</div>}

              <input
                className="contact-input"
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
              />
              <input
                className="contact-input"
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
              />
              <input
                className="contact-input"
                type="tel"
                name="phone"
                placeholder="Phone no."
                value={formData.phone}
                onChange={handleChange}
              />
              <select
                className="contact-input"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option value="">Reason for contact</option>
                <option>Product Inquiry</option>
                <option>Order Support</option>
                <option>Beauty Consultation</option>
                <option>Returns & Refunds</option>
                <option>Partnership</option>
                <option>Other</option>
              </select>
              <textarea
                className="contact-input contact-textarea"
                name="message"
                placeholder="Message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="contact-submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Let's connect 💌"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactTeaser;
