import { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export { ThemeContext };

export function ThemeProvider({ children }) {
  // Support stateful themes: "light", "dark", "system"
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return "system";
  });

  // Calculate active isDark status dynamically
  const [isDark, setIsDark] = useState(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const html = document.documentElement;

    const updateTheme = () => {
      let activeDark = false;
      if (theme === "system") {
        activeDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        activeDark = theme === "dark";
      }

      setIsDark(activeDark);
      if (activeDark) {
        html.classList.add("dark");
        html.classList.remove("light");
      } else {
        html.classList.add("light");
        html.classList.remove("dark");
      }
    };

    updateTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => updateTheme();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  // Support legacy toggle function (toggles between light and dark) for backward compatibility
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
