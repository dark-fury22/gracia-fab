import { useState } from "react";
import API_URL from "../config";
import "./Newsletter.css";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(""); // 'success' | 'error' | ''
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/contact/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Subscription failed. Please try again.");
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

        <div className="newsletter-form-wrap">
          {status === "success" ? (
            <div className="newsletter-success">✅ {message}</div>
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
                    if (status) setStatus("");
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
                <p className="newsletter-error">⚠️ {message}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
