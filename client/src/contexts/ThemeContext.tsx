import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";
type ThemeMode = "light" | "dark" | "auto";

/** Dynamic color themes that can be applied on top of light/dark mode */
type ColorTheme = "default" | "ocean" | "emerald" | "sunset" | "royal" | "crimson" | "ultra-premium";

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme?: () => void;
  setThemeMode?: (mode: ThemeMode) => void;
  switchable: boolean;
  /** Dynamic color theme */
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  /** Available color themes */
  colorThemes: { id: ColorTheme; name: string; nameAr: string; primary: string; accent: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

const COLOR_THEMES: ThemeContextType["colorThemes"] = [
  { id: "default", name: "Default", nameAr: "الافتراضي", primary: "#06b6d4", accent: "#8b5cf6" },
  { id: "ocean", name: "Ocean", nameAr: "المحيط", primary: "#0ea5e9", accent: "#06b6d4" },
  { id: "emerald", name: "Emerald", nameAr: "الزمرد", primary: "#10b981", accent: "#059669" },
  { id: "sunset", name: "Sunset", nameAr: "الغروب", primary: "#f59e0b", accent: "#ef4444" },
  { id: "royal", name: "Royal", nameAr: "الملكي", primary: "#8b5cf6", accent: "#6366f1" },
  { id: "crimson", name: "Crimson", nameAr: "القرمزي", primary: "#ef4444", accent: "#ec4899" },
  { id: "ultra-premium", name: "Ultra Premium", nameAr: "الذهبي الفاخر", primary: "#D4A017", accent: "#FFD700" },
];

function getSystemTheme(): Theme {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === "auto") return getSystemTheme();
  return mode;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (switchable) {
      const stored = localStorage.getItem("themeMode");
      if (stored === "light" || stored === "dark" || stored === "auto") {
        return stored;
      }
      const oldStored = localStorage.getItem("theme");
      if (oldStored === "light" || oldStored === "dark") {
        return oldStored;
      }
    }
    return defaultTheme;
  });

  const [theme, setTheme] = useState<Theme>(() => resolveTheme(themeMode));

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem("colorTheme");
    if (stored && COLOR_THEMES.some(t => t.id === stored)) {
      return stored as ColorTheme;
    }
    return "default";
  });

  // Listen for OS color scheme changes when in auto mode
  useEffect(() => {
    if (themeMode !== "auto") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  // Update resolved theme when mode changes
  useEffect(() => {
    setTheme(resolveTheme(themeMode));
  }, [themeMode]);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    if (switchable) {
      localStorage.setItem("themeMode", themeMode);
      localStorage.setItem("theme", theme);
    }
  }, [theme, themeMode, switchable]);

  // Apply color theme CSS variables
  useEffect(() => {
    const themeData = COLOR_THEMES.find(t => t.id === colorTheme);
    if (themeData) {
      document.documentElement.style.setProperty("--theme-primary", themeData.primary);
      document.documentElement.style.setProperty("--theme-accent", themeData.accent);
      document.documentElement.setAttribute("data-color-theme", colorTheme);
      localStorage.setItem("colorTheme", colorTheme);
    }
  }, [colorTheme]);

  // Toggle cycles: light → dark → auto → light
  const toggleTheme = switchable
    ? () => {
        setThemeModeState((prev) => {
          if (prev === "light") return "dark";
          if (prev === "dark") return "auto";
          return "light";
        });
      }
    : undefined;

  const setThemeMode = switchable
    ? (mode: ThemeMode) => {
        setThemeModeState(mode);
      }
    : undefined;

  const setColorTheme = useCallback((ct: ColorTheme) => {
    setColorThemeState(ct);
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme, themeMode, toggleTheme, setThemeMode, switchable,
      colorTheme, setColorTheme, colorThemes: COLOR_THEMES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
