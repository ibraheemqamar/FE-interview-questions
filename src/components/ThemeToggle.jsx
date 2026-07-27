import { useEffect, useState } from "react";

// Light/dark theme switch. The actual <html data-theme> attribute is first set
// by the inline no-flash script in index.html (before paint); this component
// just reflects and mutates that choice, persisting it to localStorage so it
// sticks across reloads. Keys/values are kept in sync with that script.
const STORAGE_KEY = "fid-theme";
const THEME_COLOR = { light: "#f8fafc", dark: "#0f172a" };

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch { /* localStorage blocked */ }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
    // Keep the mobile browser chrome color matched to the page.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  const isDark = theme === "dark";
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label="Toggle color theme"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
