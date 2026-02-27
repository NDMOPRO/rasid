# rasid - client-contexts

> Auto-extracted source code documentation

---

## `client/src/contexts/FilterContext.tsx`

```tsx
/**
 * FilterContext — Global filter state for breach analytics pages
 * Provides time range and sector filtering across all analytics pages
 */
import React, { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { breachRecords, type BreachRecord } from "@/lib/breachData";

interface FilterState {
  timeRange: string;       // "all" | "2024" | "2025" | "last30" | "last90" | custom
  sector: string;          // "all" | specific sector
  severity: string;        // "all" | "Critical" | "High" | "Medium" | "Low"
  platform: string;        // "all" | specific platform
}

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredRecords: BreachRecord[];
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  timeRange: "all",
  sector: "all",
  severity: "all",
  platform: "all",
};

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filteredRecords = useMemo(() => {
    let records = [...breachRecords];

    // Time range filter
    if (filters.timeRange !== "all") {
      const now = new Date();
      let cutoff: Date | null = null;

      if (filters.timeRange === "last30") {
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === "last90") {
        cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === "last180") {
        cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === "2025") {
        cutoff = new Date("2025-01-01");
        records = records.filter((r) => {
          const d = new Date(r.overview?.discovery_date || r.date || "");
          return d >= cutoff! && d < new Date("2026-01-01");
        });
        cutoff = null; // already filtered
      } else if (filters.timeRange === "2024") {
        cutoff = new Date("2024-01-01");
        records = records.filter((r) => {
          const d = new Date(r.overview?.discovery_date || r.date || "");
          return d >= cutoff! && d < new Date("2025-01-01");
        });
        cutoff = null;
      }

      if (cutoff) {
        records = records.filter((r) => {
          const d = new Date(r.overview?.discovery_date || r.date || "");
          return d >= cutoff!;
        });
      }
    }

    // Sector filter
    if (filters.sector !== "all") {
      records = records.filter((r) => r.sector === filters.sector);
    }

    // Severity filter
    if (filters.severity !== "all") {
      records = records.filter((r) => r.overview?.severity === filters.severity);
    }

    // Platform filter
    if (filters.platform !== "all") {
      records = records.filter((r) => r.overview?.source_platform === filters.platform);
    }

    return records;
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <FilterContext.Provider value={{ filters, setFilters, filteredRecords, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    // Fallback: return all records if no FilterProvider is wrapping
    return {
      filters: defaultFilters,
      setFilters: (() => {}) as React.Dispatch<React.SetStateAction<FilterState>>,
      filteredRecords: breachRecords,
      resetFilters: () => {},
    };
  }
  return ctx;
}

```

---

## `client/src/contexts/PlatformSettingsContext.tsx`

```tsx
import React, { createContext, useContext, useEffect, useMemo, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";

// Types
interface PlatformSetting {
  settingKey: string;
  settingValue: string;
  settingType?: string;
  category?: string;
  label?: string;
  description?: string;
}

interface ThemeSetting {
  themeKey: string;
  themeValue: string;
  themeType?: string;
  category?: string;
  label?: string;
  cssVariable?: string;
}

interface ContentBlock {
  blockKey: string;
  contentAr?: string;
  contentEn?: string;
  blockType?: string;
  mediaUrl?: string;
  isVisible?: number;
}

interface PlatformSettingsContextType {
  getSetting: (key: string, fallback?: string) => string;
  getTheme: (key: string, fallback?: string) => string;
  getContent: (key: string, lang?: "ar" | "en", fallback?: string) => string;
  getContentMedia: (key: string) => string | undefined;
  settings: Record<string, PlatformSetting>;
  themes: Record<string, ThemeSetting>;
  content: Record<string, ContentBlock>;
  isLoading: boolean;
  isReady: boolean;
  refresh: () => void;
}

const PlatformSettingsContext = createContext<PlatformSettingsContextType | undefined>(undefined);

// Map theme keys to CSS custom properties used in index.css
const THEME_TO_CSS_MAP: Record<string, string[]> = {
  theme_primary: ["--primary", "--sidebar-primary"],
  theme_secondary: ["--secondary"],
  theme_accent: ["--accent"],
  theme_bg_main: ["--background"],
  theme_bg_card: ["--card", "--popover"],
  theme_bg_sidebar: ["--sidebar-bg"],
  theme_text_primary: ["--foreground", "--card-foreground", "--popover-foreground"],
  theme_text_secondary: ["--muted-foreground"],
  theme_text_muted: ["--muted"],
  theme_border_color: ["--border", "--sidebar-border"],
  theme_border_input: ["--input"],
  theme_ring_color: ["--ring", "--sidebar-ring"],
  theme_destructive_color: ["--destructive"],
  theme_success_color: ["--success"],
  theme_warning_color: ["--warning"],
  theme_info_color: ["--info"],
};

function hexToOklch(hex: string): string | null {
  // Simple pass-through: if the value is already oklch or hsl, return as-is
  if (hex.startsWith("oklch") || hex.startsWith("hsl") || hex.startsWith("rgb")) return hex;
  if (!hex.startsWith("#")) return null;
  // Convert hex to RGB then to approximate OKLCH
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  // Linearize
  const lr = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const lg = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const lb = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  // To XYZ
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;
  // To OKLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bOk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(a * a + bOk * bOk);
  const H = (Math.atan2(bOk, a) * 180) / Math.PI;
  const hue = H < 0 ? H + 360 : H;
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(4)} ${hue.toFixed(1)})`;
}

// Apply CSS variables from theme settings to document root
function applyCSSVariables(themes: Record<string, ThemeSetting>) {
  const root = document.documentElement;

  Object.values(themes).forEach((t) => {
    // Apply via the cssVariable field from DB
    if (t.cssVariable && t.themeValue) {
      root.style.setProperty(t.cssVariable, t.themeValue);
    }

    // Apply via our mapping (for broader coverage)
    const cssVars = THEME_TO_CSS_MAP[t.themeKey];
    if (cssVars && t.themeValue) {
      cssVars.forEach((varName) => {
        root.style.setProperty(varName, t.themeValue);
      });
    }

    // Apply gradient for sidebar background
    if (t.themeKey === "theme_gradient_sidebar" && t.themeValue) {
      root.style.setProperty("--sidebar-bg", t.themeValue);
    }
  });
}

// Apply branding settings (favicon, title)
function applyBranding(settings: Record<string, PlatformSetting>) {
  const favicon = settings["branding_favicon"]?.settingValue;
  if (favicon) {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }

  const titleAr = settings["branding_platform_name_ar"]?.settingValue;
  const titleEn = settings["branding_platform_name_en"]?.settingValue;
  if (titleAr) {
    document.title = titleAr + (titleEn ? ` | ${titleEn}` : "");
  }
}

// Apply font settings
function applyFonts(settings: Record<string, PlatformSetting>) {
  const root = document.documentElement;

  const arHeadingFont = settings["typography_ar_heading_font"]?.settingValue;
  const arBodyFont = settings["typography_ar_body_font"]?.settingValue;
  const enFont = settings["typography_en_font"]?.settingValue;
  const baseSize = settings["typography_base_font_size"]?.settingValue;

  if (arBodyFont) root.style.setProperty("--font-ar", arBodyFont);
  if (arHeadingFont) root.style.setProperty("--font-ar-heading", arHeadingFont);
  if (enFont) root.style.setProperty("--font-en", enFont);
  if (baseSize) root.style.setProperty("--font-base-size", baseSize);

  // Load Google Fonts dynamically if needed
  const fontsToLoad = [arHeadingFont, arBodyFont, enFont].filter(Boolean);
  fontsToLoad.forEach((fontName) => {
    if (!fontName) return;
    const existingLink = document.querySelector(`link[href*="${encodeURIComponent(fontName)}"]`);
    if (!existingLink) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  });
}

// Apply layout settings
function applyLayout(settings: Record<string, PlatformSetting>) {
  const root = document.documentElement;

  const borderRadius = settings["layout_border_radius"]?.settingValue;
  if (borderRadius) root.style.setProperty("--radius", borderRadius);

  const sidebarWidth = settings["sidebar_width"]?.settingValue;
  if (sidebarWidth) root.style.setProperty("--sidebar-width", sidebarWidth);
}

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: configData, isLoading } = trpc.superAdmin.getAllConfig.useQuery(undefined, {
    staleTime: 10000, // Cache for 10s for faster live updates
    refetchOnWindowFocus: true,
  });

  const utils = trpc.useUtils();
  const appliedRef = useRef(false);

  // Build lookup maps
  const settingsMap = useMemo(() => {
    const map: Record<string, PlatformSetting> = {};
    if (configData?.settings && Array.isArray(configData.settings)) {
      (configData.settings as any[]).forEach((s) => {
        map[s.settingKey] = s;
      });
    }
    return map;
  }, [configData?.settings]);

  const themesMap = useMemo(() => {
    const map: Record<string, ThemeSetting> = {};
    if (configData?.themes && Array.isArray(configData.themes)) {
      (configData.themes as any[]).forEach((t) => {
        map[t.themeKey] = t;
      });
    }
    return map;
  }, [configData?.themes]);

  const contentMap = useMemo(() => {
    const map: Record<string, ContentBlock> = {};
    if (configData?.content && Array.isArray(configData.content)) {
      (configData.content as any[]).forEach((c) => {
        map[c.blockKey] = c;
      });
    }
    return map;
  }, [configData?.content]);

  // Apply CSS variables and branding when data changes
  useEffect(() => {
    if (!configData) return;
    applyCSSVariables(themesMap);
    applyBranding(settingsMap);
    applyFonts(settingsMap);
    applyLayout(settingsMap);
    appliedRef.current = true;
  }, [configData, themesMap, settingsMap]);

  // Getters
  const getSetting = useCallback((key: string, fallback = "") => {
    return settingsMap[key]?.settingValue ?? fallback;
  }, [settingsMap]);

  const getTheme = useCallback((key: string, fallback = "") => {
    return themesMap[key]?.themeValue ?? fallback;
  }, [themesMap]);

  const getContent = useCallback((key: string, lang: "ar" | "en" = "ar", fallback = "") => {
    const block = contentMap[key];
    if (!block) return fallback;
    return (lang === "ar" ? block.contentAr : block.contentEn) || fallback;
  }, [contentMap]);

  const getContentMedia = useCallback((key: string) => {
    return contentMap[key]?.mediaUrl || undefined;
  }, [contentMap]);

  const refresh = useCallback(() => {
    utils.superAdmin.getAllConfig.invalidate();
  }, [utils]);

  const value = useMemo(() => ({
    getSetting,
    getTheme,
    getContent,
    getContentMedia,
    settings: settingsMap,
    themes: themesMap,
    content: contentMap,
    isLoading,
    isReady: appliedRef.current && !isLoading,
    refresh,
  }), [getSetting, getTheme, getContent, getContentMedia, settingsMap, themesMap, contentMap, isLoading, refresh]);

  return (
    <PlatformSettingsContext.Provider value={value}>
      {children}
    </PlatformSettingsContext.Provider>
  );
}

export function usePlatformSettings() {
  const ctx = useContext(PlatformSettingsContext);
  if (!ctx) {
    return {
      getSetting: (_key: string, fallback = "") => fallback,
      getTheme: (_key: string, fallback = "") => fallback,
      getContent: (_key: string, _lang?: "ar" | "en", fallback = "") => fallback,
      getContentMedia: (_key: string) => undefined,
      settings: {} as Record<string, PlatformSetting>,
      themes: {} as Record<string, ThemeSetting>,
      content: {} as Record<string, ContentBlock>,
      isLoading: false,
      isReady: false,
      refresh: () => {},
    };
  }
  return ctx;
}

```

---

## `client/src/contexts/ThemeContext.tsx`

```tsx
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

```

---

