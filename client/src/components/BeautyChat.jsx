import { useState, useRef, useEffect } from "react";
import API_URL from "../config";
import "./BeautyChat.css";

const QUICK_QUESTIONS = [
  "What's good for oily skin?",
  "Best wig for oval face?",
  "How to fade dark spots?",
  "Bridal skincare routine?",
];

function BeautyChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your Gracia Fab beauty advisor ✨ Ask me anything about skincare, haircare, wigs, or bridal beauty!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build conversation history for context
      const history = messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.text,
      }));

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.slice(-6), // last 6 messages for context
        }),
      });

      const data = await res.json();
      const reply = {
        role: "assistant",
        text: data.reply || "Sorry, I could not respond. Try again!",
        products: data.products || [],
      };

      setMessages((prev) => [...prev, reply]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong. Please try again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        className={`chat-fab ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Beauty Advisor Chat"
      >
        {open ? "✕" : "💬"}
        {!open && unread > 0 && (
          <span className="chat-fab-badge">{unread}</span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-avatar">✨</div>
            <div>
              <strong>Gracia Fab Advisor</strong>
              <p>Beauty AI · Always available</p>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg-${msg.role}`}>
                {msg.role === "assistant" && (
                  <span className="chat-msg-avatar">✨</span>
                )}
                <div className="chat-msg-bubble">
                  <p>{msg.text}</p>
                  {msg.products?.length > 0 && (
                    <div className="chat-products">
                      {msg.products.slice(0, 2).map((p) => (
                        <a
                          key={p._id}
                          href={`/products/${p._id}`}
                          className="chat-product-chip"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=60&h=60&fit=crop";
                            }}
                          />

                          <span>{p.name}</span>

                          <span className="chip-price">
                            ₦{p.price?.toLocaleString()}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg chat-msg-assistant">
                <span className="chat-msg-avatar">✨</span>
                <div className="chat-msg-bubble chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {/* Quick questions — show only at start */}
            {messages.length === 1 && !loading && (
              <div className="chat-quick">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className="chat-quick-btn"
                    onClick={() => sendMessage(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask about skincare, haircare..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button
              className="chat-send"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default BeautyChat;
