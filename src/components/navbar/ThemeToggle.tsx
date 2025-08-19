import React, { useCallback, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) return stored;
  } catch {}
  return "system";
};

const applyTheme = (t: Theme) => {
  if (t === "dark") document.documentElement.classList.add("dark");
  else if (t === "light") document.documentElement.classList.remove("dark");
  else {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }
};

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch {}
      return next;
    });
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/6 dark:bg-white/4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaTeal/30 transition"
      aria-pressed={theme === "dark"}
    >
      <svg
        className="w-5 h-5 text-karibaNavy dark:text-karibaSand"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        {document.documentElement.classList.contains("dark") ? (
          <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            fill="currentColor"
          />
        ) : (
          <path
            d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
};

export default ThemeToggle;
