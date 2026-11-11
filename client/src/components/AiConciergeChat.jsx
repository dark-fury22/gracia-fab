import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import API_URL from "../config";
import "./AiConciergeChat.css";

const QUICK_PROMPTS = [
  "✨ Recommend skincare for hyperpigmentation",
  "👑 Best glueless raw wig for beginner",
  "🌸 How long does delivery to Lagos take?",
  "🎨 How do I find my foundation undertone?",
  "👰🏽 Help me prepare a bridal beauty routine",
];

const KNOWLEDGE_BASE = [
  {
    keywords: ["hyperpigmentation", "dark spots", "vitamin c", "serum", "brighten", "even skin"],
    reply: "For melanin-rich skin facing hyperpigmentation or sun spots in Nigeria's climate, we recommend a Vitamin C or Niacinamide brightening serum — they even out tone without bleaching agents.",
    link: { text: "Shop Brightening Skincare →", url: "/products?category=skincare" },
  },
  {
    keywords: ["wig", "hair", "raw", "virgin", "glueless", "beginner", "bone straight", "frontal", "closure"],
    reply: "For everyday effortless wear, look for our glueless, HD lace raw virgin units with pre-bleached knots — no glue or salon appointment required.",
    link: { text: "Shop Raw Wigs →", url: "/products?category=wig" },
  },
  {
    keywords: ["delivery", "shipping", "lagos", "abuja", "nationwide", "timeline", "dispatch", "monnify", "payment"],
    reply: "Orders within **Lagos** are fulfilled via VIP dispatch within **24 hours**. For Abuja, Port Harcourt, and nationwide delivery across Nigeria, parcels arrive in **2–3 business days**. All orders above ₦35,000 receive complimentary Maison packaging & gift.",
  },
  {
    keywords: ["undertone", "shade", "skin tone", "detector", "foundation", "complexion"],
    reply: "You can use our live **AI Skin Tone Detector** directly with your phone camera! It maps African undertones (Warm Golden, Rich Neutral, Deep Red/Espresso) and gives exact foundation matches.",
    link: { text: "Launch Skin Tone Detector →", url: "/skin-tone" },
  },
  {
    keywords: ["bridal", "wedding", "bride", "glam"],
    reply: "For your big day, we recommend starting a bridal skincare and beauty routine 4–8 weeks ahead — our AI Beauty Advisor can build one matched to your skin, hair and wedding date.",
    link: { text: "Build Bridal Routine →", url: "/recommend" },
  },
];

const INITIAL_MESSAGES = [
  {
    sender: "ai",
    text: "Hello! I am your Gracia Fab AI Concierge. How may I assist you with melanin skincare, raw virgin wigs, haircare, or bridal beauty today?",
  },
];

function AiConciergeChat({ onCartOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { addToCart } = useCart();
  const { addToast } = useToast();

  // Scroll to bottom on new message or when typing indicator appears
  useEffect(() => {
    if (
      messagesEndRef.current &&
      typeof messagesEndRef.current.scrollIntoView === "function"
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when conversation is started and chat is open
  useEffect(() => {
    if (isOpen && hasStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, hasStarted]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleAddToCart = useCallback(
    (product) => {
      if (!product) return;
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      if (addToast) {
        addToast(`Added "${product.name}" to your bag`, "cart");
      }
      if (onCartOpen) {
        onCartOpen();
      }
    },
    [addToCart, addToast, onCartOpen]
  );

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setInputVal("");
    setIsTyping(false);
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isTyping) return;

    // Add user message
    const userMsg = { sender: "user", text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputVal("");
    setIsTyping(true);
    setHasPrompted(false);

    try {
      // Prepare multi-turn history for backend
      const history = nextMessages.slice(-8).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
            products: Array.isArray(data.products) ? data.products : [],
          },
        ]);
        setIsTyping(false);
        return;
      }
      throw new Error("Empty reply");
    } catch {
      // Graceful offline fallback using KNOWLEDGE_BASE keyword matching
      const lower = text.toLowerCase();
      let match = KNOWLEDGE_BASE.find((k) =>
        k.keywords.some((w) => lower.includes(w))
      );

      if (!match) {
        match = {
          reply:
            "Thank you for asking! I can help match you with the right melanin skincare, raw virgin wigs, haircare routines, or bridal beauty formulations. Feel free to ask about hyperpigmentation, glueless wigs, skin tone matching, or delivery timelines.",
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
    }
  };

  // Helper to safely render bold text (**bold**) and linebreaks
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={lIdx} className="ysl-chat-line">
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          {lIdx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* ── Floating Chat Button (Bottom-Right) ── */}
      {!isOpen && (
        <div className="ysl-floating-chat-container">
          {hasPrompted && (
            <div
              className="ysl-floating-badge"
              onClick={() => setIsOpen(true)}
              role="button"
              tabIndex={0}
            >
              <span>✦ Ask AI Concierge</span>
            </div>
          )}
          <button
            className="ysl-floating-chat-bubble"
            onClick={() => {
              setIsOpen(true);
              setHasPrompted(false);
            }}
            aria-label="Open Gracia Fab AI Concierge Chat"
            title="Chat with Gracia Fab AI Concierge"
          >
            <span className="ysl-bubble-sparkle">✦</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Chat Widget Modal ── */}
      {isOpen && (
        <aside
          className="ysl-chat-modal"
          role="dialog"
          aria-label="Gracia Fab AI Concierge Chat"
          aria-modal="true"
        >
          {/* Header */}
          <div className="ysl-chat-header">
            <div className="ysl-chat-header-left">
              <span className="ysl-chat-gold-mark">✦</span>
              <div className="ysl-chat-title-group">
                <span className="ysl-chat-title">AI Beauty Concierge</span>
                <span className="ysl-chat-subtitle">Gracia Fab Maison</span>
              </div>
            </div>
            <div className="ysl-chat-header-actions">
              {hasStarted && (
                <button
                  type="button"
                  className="ysl-chat-action-btn"
                  onClick={handleResetChat}
                  aria-label="New conversation"
                  title="New Conversation"
                >
                  ↻
                </button>
              )}
              <button
                type="button"
                className="ysl-chat-action-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize Chat"
                title="Minimize"
              >
                ⌄
              </button>
              <button
                type="button"
                className="ysl-chat-action-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Screen 1: Disclaimer & Hero Consultation View ── */}
          {!hasStarted ? (
            <div className="ysl-chat-intro-view">
              <div className="ysl-chat-hero-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=85"
                  alt="Gracia Fab AI Beauty Consultation"
                  className="ysl-chat-hero-img"
                />
                <div className="ysl-chat-hero-badge">
                  <span>✦ 24/7 AI BEAUTY ADVISOR</span>
                </div>
              </div>

              <div className="ysl-chat-intro-content">
                <div className="ysl-chat-intro-text">
                  <h3>Personalized Beauty Concierge</h3>
                  <p className="ysl-chat-disclaimer">
                    You are speaking with Gracia Fab's AI advisor. Our automated beauty intelligence assists with hyperpigmentation, glueless raw virgin wigs, African undertones, and bridal care. By continuing, you agree to our{" "}
                    <Link to="/terms">Terms of Use</Link> and{" "}
                    <Link to="/privacy">Privacy Policy</Link>.
                  </p>
                </div>

                <button
                  type="button"
                  className="ysl-chat-start-btn"
                  onClick={() => setHasStarted(true)}
                >
                  Start Consultation <span>→</span>
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
                    className={`ysl-chat-bubble-wrap ${
                      msg.sender === "user" ? "user" : "ai"
                    }`}
                  >
                    <div className="ysl-chat-bubble">
                      <div className="ysl-chat-text-content">
                        {renderFormattedText(msg.text)}
                      </div>

                      {/* Product Recommendations from live catalog */}
                      {Array.isArray(msg.products) && msg.products.length > 0 && (
                        <div className="ysl-chat-products-list">
                          {msg.products.map((prod) => (
                            <div key={prod._id} className="ysl-chat-product-card">
                              <Link
                                to={`/products/${prod._id}`}
                                className="ysl-chat-prod-link"
                                onClick={() => setIsOpen(false)}
                              >
                                <img
                                  src={
                                    prod.image ||
                                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80"
                                  }
                                  alt={prod.name}
                                  className="ysl-chat-prod-img"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80";
                                  }}
                                />
                              </Link>
                              <div className="ysl-chat-prod-info">
                                <Link
                                  to={`/products/${prod._id}`}
                                  className="ysl-chat-prod-title"
                                  onClick={() => setIsOpen(false)}
                                >
                                  <strong>{prod.name}</strong>
                                </Link>
                                <span className="ysl-chat-prod-price">
                                  ₦{Number(prod.price || 0).toLocaleString()}
                                </span>
                                <button
                                  type="button"
                                  className="ysl-chat-add-btn"
                                  onClick={() => handleAddToCart(prod)}
                                >
                                  + Add to Bag
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Fallback Quick Link */}
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
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about skincare, wigs, undertones..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="ysl-chat-input"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  className="ysl-chat-send-btn"
                  aria-label="Send message"
                  disabled={!inputVal.trim() || isTyping}
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