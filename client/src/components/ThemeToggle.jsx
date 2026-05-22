import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      aria-label="Toggle theme"
    >
      <span className="toggle-track">
        <span className="toggle-thumb">{theme === "light" ? "☀️" : "🌙"}</span>
      </span>
    </button>
  );
}

export default ThemeToggle;
