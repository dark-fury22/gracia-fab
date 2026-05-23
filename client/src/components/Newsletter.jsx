import { useState } from "react";
import "./Newsletter.css";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // 'success' | 'error' | ''
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      return;
    }

    try {
      setLoading(true);
      // Store in localStorage as simple subscriber list
      const subscribers = JSON.parse(
        localStorage.getItem("gf_subscribers") || "[]",
      );
      if (subscribers.includes(email)) {
        setStatus("already");
        return;
      }
      subscribers.push(email);
      localStorage.setItem("gf_subscribers", JSON.stringify(subscribers));
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter">
      <div className="newsletter-inner">
        <div className="newsletter-content">
          <h2>Subscribe Newsletter 💌</h2>
          <p>
            Get the latest beauty tips, product launches and exclusive offers
            straight to your inbox.
          </p>
        </div>

        {status === "success" ? (
          <div className="newsletter-success">
            ✅ You're subscribed! Welcome to the Gracia Fab family 🌸
          </div>
        ) : status === "already" ? (
          <div className="newsletter-success">
            💛 You're already subscribed! Check your inbox for our latest
            updates.
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="newsletter-input-wrap">
              <input
                type="email"
                className="newsletter-input"
                placeholder="Your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setStatus("");
                }}
              />
              <button
                type="submit"
                className="newsletter-btn"
                disabled={loading}
              >
                {loading ? "..." : "Submit ✦"}
              </button>
            </div>
            {status === "error" && (
              <p className="newsletter-error">Please enter a valid email.</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export default Newsletter;
