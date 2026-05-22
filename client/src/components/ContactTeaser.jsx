import "./ContactTeaser.css";

function ContactTeaser() {
  return (
    <section className="contact-teaser">
      <div className="contact-inner">
        {/* Left */}
        <div className="contact-left">
          <h2>
            Need Assistance?
            <br />
            We're Here to Help!
          </h2>
          <p>
            Our friendly team is excited to makeup your questions with our
            beauty expert answers.
          </p>
          <div className="contact-team">
            <div className="contact-avatars">
              <img
                src="https://res.cloudinary.com/dyzkjerez/image/upload/v1778840697/597857690_1158227046476150_6996214699199997289_n.jpg_wwxrey.jpg"
                alt="team"
              />
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face"
                alt="team"
              />
              <img
                src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=40&h=40&fit=crop&crop=face"
                alt="team"
              />
            </div>
            <p>We're having 5k+ happy beautiful faces 😊</p>
          </div>
        </div>

        {/* Right — Quick form */}
        <div className="contact-right">
          <h3>Let's get in touch.</h3>
          <div className="contact-form">
            <input
              type="text"
              placeholder="Your name"
              className="contact-input"
            />
            <input
              type="email"
              placeholder="Your email"
              className="contact-input"
            />
            <input
              type="tel"
              placeholder="Phone no."
              className="contact-input"
            />
            <select className="contact-input">
              <option value="">Reason for contact</option>
              <option>Product Inquiry</option>
              <option>Order Support</option>
              <option>Returns</option>
              <option>Other</option>
            </select>
            <textarea
              placeholder="Message"
              className="contact-input contact-textarea"
              rows={3}
            />
            <button className="contact-submit">Let's connect 💌</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactTeaser;
