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
