import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const storedTheme = localStorage.getItem("algarve-theme") as Theme | null;
    return storedTheme || "light";
  });
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

  // Color application is handled by useSiteSettings hook

  useEffect(() => {
    const root = document.documentElement;

    const getSystemTheme = (): "dark" | "light" => {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    const applyTheme = (t: Theme) => {
      const resolved = t === "system" ? getSystemTheme() : t;
      setResolvedTheme(resolved);

      root.classList.remove("dark", "light");
      root.classList.add(resolved);
    };

    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("algarve-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context) {
    return context;
  }

  if (typeof window === "undefined") {
    return {
      theme: "light",
      resolvedTheme: "light",
      setTheme: () => {},
    } satisfies ThemeContextValue;
  }

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
