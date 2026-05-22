import "./Newsletter.css";

function Newsletter() {
  return (
    <section className="newsletter">
      <div className="newsletter-inner">
        <div className="newsletter-content">
          <h2>Subscribe Newsletter</h2>
          <p>
            Get the latest beauty tips, product launches and exclusive offers
            straight to your inbox.
          </p>
        </div>
        <div className="newsletter-form">
          <input
            type="email"
            placeholder="Your email"
            className="newsletter-input"
          />
          <button className="newsletter-btn">Submit ✦</button>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
