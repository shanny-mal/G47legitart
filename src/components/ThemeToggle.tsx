// src/components/ThemeToggle.tsx
import { useEffect, useState, type JSX } from "react";

type Theme = "dark" | "light" | null;

const THEME_KEY = "theme";

export default function ThemeToggle(): JSX.Element {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(THEME_KEY) as Theme) ?? null;
    } catch {
      return null;
    }
  });

  // apply theme to document element
  useEffect(() => {
    const apply = (t: Theme) => {
      if (t === "dark") {
        document.documentElement.classList.add("dark");
      } else if (t === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        // follow system preference
        const prefersDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      }
    };

    apply(theme);
  }, [theme]);

  // listen to system theme changes, but only if user hasn't set a theme
  useEffect(() => {
    const mq =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (!mq) return;

    const handler = (e: MediaQueryListEvent) => {
      // only auto-update when no explicit user theme stored
      try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored) return;
      } catch {
        // ignore
      }

      if (e.matches) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    };

    // add listener (use addEventListener if available)
    if (typeof mq.addEventListener === "function")
      mq.addEventListener("change", handler);
    else mq.addListener(handler);

    return () => {
      if (typeof mq.removeEventListener === "function")
        mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  // toggle handler: if user toggles, we set a persistent preference
  const toggle = () => {
    const newTheme: Theme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch {
      // ignore localStorage errors
    }
    setTheme(newTheme);
  };

  // optional: a "reset to system" function

  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        aria-label="Toggle color theme"
        className="p-2 rounded border dark:border-gray-700 bg-white/70 dark:bg-[#072231]/70 hover:bg-white/90 dark:hover:bg-[#07283a]/90 transition"
      >
        {isDark ? "🌙" : "☀️"}
      </button>

      {/* small accessible "follow system" reset button (optional UI) */}
      {/* <button onClick={resetToSystem} className="text-xs text-gray-500 hover:underline">System</button> */}
    </div>
  );
}
