import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Contact.css";
import SEO from "../components/SEO";

function Contact({ onCartOpen }) {
  <SEO
    title="Contact Us"
    description="Get in touch with Gracia Fab. We're here to help with product questions, orders and personalized beauty advice."
    keywords="contact Gracia Fab, beauty support Nigeria, customer service"
    url="/contact"
  />;
  return (
    <>
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
              simply want personalized beauty recommendations.
            </p>
          </div>
        </section>

        {/* Form + Info */}
        <section className="contact-main">
          <div className="contact-main-inner">
            {/* Form */}
            <div className="contact-form-card">
              <h2>Send Us a Message</h2>
              <div className="contact-form-grid">
                <div className="contact-field">
                  <label>Name</label>
                  <input type="text" placeholder="Your full name" />
                </div>
                <div className="contact-field">
                  <label>Email</label>
                  <input type="email" placeholder="your@email.com" />
                </div>
                <div className="contact-field contact-full">
                  <label>Phone</label>
                  <input type="tel" placeholder="e.g. 08012345678" />
                </div>
                <div className="contact-field contact-full">
                  <label>Subject</label>
                  <select>
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
                  <label>Message</label>
                  <textarea rows={5} placeholder="Tell us how we can help..." />
                </div>
              </div>
              <button className="contact-submit-btn">Send Message 💌</button>
            </div>

            {/* Info cards */}
            <div className="contact-info">
              <div className="contact-info-card">
                <span className="contact-info-icon">📧</span>
                <h3>Email Us</h3>
                <p>
                  Have a question or need assistance? Email us at
                  hello@graciafab.com and get immediate support.
                </p>
              </div>
              <div className="contact-info-card">
                <span className="contact-info-icon">🏪</span>
                <h3>Visit Our Store</h3>
                <p>
                  Prefer to speak with us in person? Stop by the Gracia Fab
                  boutique in Lagos, Nigeria to get immediate support.
                </p>
              </div>
              <div className="contact-info-card">
                <span className="contact-info-icon">📞</span>
                <h3>Call Support</h3>
                <p>
                  If you need quick support, give us a call and speak directly
                  with our beauty specialists.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* We're Here to Help */}
        <section className="contact-help">
          <div className="contact-help-inner">
            <div className="contact-help-header">
              <h2>We're Here to Help</h2>
              <p>
                Your beauty journey matters to us. If you need support, want to
                collaborate, or have feedback to share, our customer care team
                is ready to respond.
              </p>
            </div>
            <div className="contact-help-grid">
              <div className="contact-help-card contact-help-feature">
                <img
                  src="https://i.pinimg.com/736x/cb/39/d4/cb39d4d73a49e29996ddb619845cd5d9.jpg"
                  alt="Customer Support"
                />
              </div>
              <div className="contact-help-card">
                <h3>Customer Support</h3>
                <p>
                  At Gracia Fab, your satisfaction is our top priority. Whether
                  you need assistance, product details, or order help, we're
                  here to guide you.
                </p>
                <p>
                  If you need questions about your order, shipping, or returns,
                  don't hesitate — reach out. We provide prompt and helpful
                  assistance. No concern is too small.
                </p>
              </div>
              <div className="contact-help-card">
                <h3>Connect With Us</h3>
                <p>
                  We love building meaningful connections with our community.
                  Share your experiences, find more about what inspires you and
                  explore our beauty world together.
                </p>
                <p>
                  Reach us through email, phone, or social media. No matter how
                  you choose to connect, we'll make sure you're heard and that
                  every interaction reflects our love for beauty and glow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default Contact;
