import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AiConciergeChat.css";

const QUICK_PROMPTS = [
  "✨ Recommend skincare for hyperpigmentation",
  "👑 Best glueless raw wig for beginner",
  "🌸 How long does delivery to Lagos take?",
  "🎨 How do I find my foundation undertone?",
];

const KNOWLEDGE_BASE = [
  {
    keywords: ["hyperpigmentation", "dark spots", "vitamin c", "serum", "brighten", "even skin"],
    reply: "For melanin-rich skin facing hyperpigmentation or sun spots in Nigeria's climate, we recommend a Vitamin C or Niacinamide brightening serum — they even out tone without bleaching agents.",
    link: { text: "Shop Brightening Skincare →", url: "/products?category=skincare" },
  },
  {
    keywords: ["wig", "hair", "raw", "virgin", "glueless", "beginner", "bone straight", "frontal"],
    reply: "For everyday effortless wear, look for our glueless, HD lace raw units with pre-bleached knots — no glue or salon appointment required.",
    link: { text: "Shop Raw Wigs →", url: "/products?category=wig" },
  },
  {
    keywords: ["delivery", "shipping", "lagos", "nationwide", "timeline", "dispatch", "paystack"],
    reply: "Orders within **Lagos** are fulfilled via VIP dispatch within **24 hours**. For Abuja, Port Harcourt, and nationwide delivery across Nigeria, parcels arrive in **2–3 business days**. All orders above ₦35,000 receive complimentary Maison packaging & gift.",
  },
  {
    keywords: ["undertone", "shade", "skin tone", "detector", "foundation", "complexion"],
    reply: "You can use our live **AI Skin Tone Detector** directly with your phone camera! It maps African undertones (Warm Golden, Rich Neutral, Deep Red/Espresso) and gives exact foundation matches. Would you like to try it now?",
    link: { text: "Launch Skin Tone Detector →", url: "/skin-tone" },
  },
  {
    keywords: ["bridal", "wedding", "bride"],
    reply: "For your big day, we recommend starting a bridal skincare and beauty routine 4–8 weeks ahead — our AI Beauty Advisor can build one matched to your skin, hair and wedding date.",
    link: { text: "Get Matched →", url: "/recommend" },
  },
];

function AiConciergeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello, I am your Gracia Fab AI Beauty Advisor. How may I assist you with skincare, haircare, wigs, or bridal beauty today?",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // AI answer matching
    setTimeout(() => {
      const lower = text.toLowerCase();
      let match = KNOWLEDGE_BASE.find((k) =>
        k.keywords.some((w) => lower.includes(w))
      );

      if (!match) {
        match = {
          reply: "Thank you for asking! I can help match you to the right skincare, haircare, wig or bridal beauty products. Feel free to ask about hyperpigmentation, raw wigs, skin tone matching, or bridal prep.",
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: match.reply,
          link: match.link,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* ── Floating Chat Button (Bottom-Right) ── */}
      {!isOpen && (
        <button
          className="ysl-floating-chat-bubble"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Concierge Chat"
          title="Chat with Gracia Fab AI Concierge"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        </button>
      )}

      {/* ── Chat Widget Modal (Matching Screenshot 5) ── */}
      {isOpen && (
        <aside
          className="ysl-chat-modal"
          role="dialog"
          aria-label="Gracia Fab AI Concierge Chat"
        >
          {/* Header */}
          <div className="ysl-chat-header">
            <div className="ysl-chat-header-left">
              <span className="ysl-chat-gold-mark">✦</span>
              <span className="ysl-chat-title">Chat</span>
            </div>
            <div className="ysl-chat-header-actions">
              <button
                className="ysl-chat-action-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize Chat"
                title="Minimize"
              >
                ⌄
              </button>
              <button
                className="ysl-chat-action-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Screen 1: YSL AI Bot Disclaimer & Hero (Matching Screenshot 5) ── */}
          {!hasStarted ? (
            <div className="ysl-chat-intro-view">
              <div className="ysl-chat-hero-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=85"
                  alt="Gracia Fab AI Beauty Consultation"
                  className="ysl-chat-hero-img"
                />
              </div>

              <div className="ysl-chat-intro-content">
                <p className="ysl-chat-disclaimer">
                  You're chatting with an AI bot, not a human. Responses are automated—see
                  our <Link to="/terms">Acceptable Use Policy</Link> for details. By continuing,
                  you confirm you agree to Gracia Fab Beauty's <Link to="/terms">Terms of Use</Link>,
                  have read the <Link to="/privacy">Privacy Policy</Link>, and consent to this
                  conversation being recorded. Please don't share sensitive financial or health info.
                </p>

                <button
                  className="ysl-chat-start-btn"
                  onClick={() => setHasStarted(true)}
                >
                  Start Conversation
                </button>
              </div>
            </div>
          ) : (
            /* ── Screen 2: Interactive AI Chat Conversation ── */
            <div className="ysl-chat-active-view">
              <div className="ysl-chat-messages">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`ysl-chat-bubble-wrap ${msg.sender === "user" ? "user" : "ai"}`}
                  >
                    <div className="ysl-chat-bubble">
                      <p>{msg.text}</p>

                      {/* Quick Link */}
                      {msg.link && (
                        <Link
                          to={msg.link.url}
                          className="ysl-chat-link-btn"
                          onClick={() => setIsOpen(false)}
                        >
                          {msg.link.text}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="ysl-chat-bubble-wrap ai">
                    <div className="ysl-chat-bubble ysl-typing-dots">
                      <span>•</span>
                      <span>•</span>
                      <span>•</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips */}
              <div className="ysl-chat-quick-chips">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="ysl-quick-chip"
                    onClick={() => handleSend(prompt.replace(/^[^\w]+/, ""))}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="ysl-chat-input-bar"
              >
                <input
                  type="text"
                  placeholder="Ask Gracia Fab AI..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="ysl-chat-input"
                />
                <button
                  type="submit"
                  className="ysl-chat-send-btn"
                  aria-label="Send message"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </aside>
      )}
    </>
  );
}

export default AiConciergeChat;
