import { Component } from "react";

// Last line of defence: if a page throws while rendering, show a way out
// instead of a blank screen.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Page crashed:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "32px 16px",
          textAlign: "center",
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.6rem" }}>
          Something went wrong on this page
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 420 }}>
          Reloading usually fixes it. If it keeps happening, please let us
          know.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 22px",
              borderRadius: 999,
              border: "none",
              background: "var(--accent)",
              color: "var(--white)",
              font: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
          <a
            href="/"
            style={{
              padding: "10px 22px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              color: "var(--text)",
              textDecoration: "none",
            }}
          >
            Go to home
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
