import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";
import "./SmartSearch.css";

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SmartSearch({ onResults, onClose, fullPage = false }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  const examples = [
    "products for oily skin under ₦10,000",
    "best wig for oval face",
    "bridal skincare routine",
    "curl cream for coily hair",
    "anti-aging serum",
    "haircare for hair loss",
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    fetch(
      `${API_URL}/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      })
      .catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".smart-search")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = useCallback(
    async (searchQuery) => {
      const q = searchQuery ?? query;

      if (!q.trim()) return;

      setShowSuggestions(false);
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ query: q }),
        });

        const data = await res.json();

        onResults?.(
          data.results || [],
          q,
          data.parsedFilters,
          data.aiUnderstanding,
        );

        onClose?.();
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },
    [onResults, onClose],
  );
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleSearch(query);
    if (e.key === "Escape") {
      setShowSuggestions(false);
      if (onClose) onClose();
    }
  };

  return (
    <div className={`smart-search ${fullPage ? "full-page" : ""}`}>
      {/* Search input */}
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Try: 'best serum for dark spots' or 'wig for round face'..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
          >
            ✕
          </button>
        )}
        <button
          className="search-btn"
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
        >
          {loading ? <span className="search-spinner" /> : "Search"}
        </button>
      </div>

      {/* AI badge */}
      <div className="search-ai-badge">
        ✦ AI-powered — understands natural language
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className="suggestion-item"
              onClick={() => {
                if (!s) return;
                setQuery(s);
                setShowSuggestions(false);
                handleSearch(s);
              }}
            >
              🔍 {s}
            </button>
          ))}
        </div>
      )}

      {/* Example searches */}
      {!query && (
        <div className="search-examples">
          <p className="examples-label">Try asking:</p>
          <div className="examples-grid">
            {examples.map((ex, i) => (
              <button
                key={i}
                className="example-chip"
                onClick={() => {
                  setQuery(ex);
                  handleSearch(ex);
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartSearch;
