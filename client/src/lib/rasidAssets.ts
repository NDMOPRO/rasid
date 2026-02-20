/**
 * Rasid Platform - Official Logo & Character Assets
 * All images are transparent PNGs/SVGs hosted on CDN
 * Updated per Ultra Premium Design Prompt v2
 * 
 * === LOGOS (SVG + PNG) ===
 * - LOGO_SVG_DARK: SVG logo for dark backgrounds
 * - LOGO_SVG_LIGHT: SVG logo for light backgrounds
 * - LOGO_SVG_FULL_TEXT: SVG full logo with text (light bg)
 * - LOGO_SVG_GOLD_TEXT: SVG gold logo with text
 * - LOGO_PNG_DARK: PNG dark logo for light backgrounds
 * - LOGO_PNG_GOLD: PNG gold logo for light backgrounds
 * - LOGO_PNG_CREAM: PNG cream logo for dark backgrounds
 * - LOGO_CALLIGRAPHY_NAVY_GOLD: Arabic calligraphy navy+gold
 * - LOGO_CALLIGRAPHY_NAVY: Arabic calligraphy navy only
 * - LOGO_CALLIGRAPHY_GOLD: Arabic calligraphy gold only
 * - LOGO_CALLIGRAPHY_CREAM: Arabic calligraphy cream only
 * 
 * === CHARACTERS (PNG + GIF) ===
 * - CHARACTER_WAVING: Waving gesture - welcome/login
 * - CHARACTER_SHAMAGH: Standing with shmagh - reports
 * - CHARACTER_HANDS_ON_HIPS: Hands on hips - dashboards
 * - CHARACTER_GLASSES: With sunglasses - analytics
 * - CHARACTER_ARMS_CROSSED: Arms crossed - leadership
 * - CHARACTER_STANDING_SHAMAGH: Standing with shmagh - settings
 */

// === LOGOS — SVG ===

/** SVG logo for dark backgrounds */
export const LOGO_SVG_DARK = "/branding/logos/Rased_1_transparent.png";

/** SVG logo for light backgrounds */
export const LOGO_SVG_LIGHT = "/branding/logos/Rased_1_transparent_1.png";

/** SVG full logo with text — light bg */
export const LOGO_SVG_FULL_TEXT = "/branding/logos/Rased_3_transparent.png";

/** SVG gold logo with text */
export const LOGO_SVG_GOLD_TEXT = "/branding/logos/Rased_5_transparent.png";

// === LOGOS — PNG ===

/** PNG dark logo — for light backgrounds */
export const LOGO_PNG_DARK = "/branding/logos/Rased_1_transparent.png";

/** PNG gold logo — for light backgrounds */
export const LOGO_PNG_GOLD = "/branding/logos/Rased_5_transparent.png";

/** PNG cream logo — for dark backgrounds */
export const LOGO_PNG_CREAM = "/branding/logos/Rased_1_transparent_1.png";

// === LOGOS — Arabic Calligraphy ===

/** Arabic calligraphy navy+gold */
export const LOGO_CALLIGRAPHY_NAVY_GOLD = "/branding/logos/Rased_4_transparent.png";

/** Arabic calligraphy navy only */
export const LOGO_CALLIGRAPHY_NAVY = "/branding/logos/Rased_6_transparent.png";

/** Arabic calligraphy gold only */
export const LOGO_CALLIGRAPHY_GOLD = "/branding/logos/Rased_5_transparent.png";

/** Arabic calligraphy cream only */
export const LOGO_CALLIGRAPHY_CREAM = "/branding/logos/Rased_7_transparent.png";

// === LEGACY ALIASES (backward compatibility) ===
export const LOGO_FULL_DARK = LOGO_PNG_DARK;
export const LOGO_CALLIGRAPHY_GOLD_DARK = LOGO_CALLIGRAPHY_NAVY_GOLD;
export const LOGO_FULL_GOLD = LOGO_PNG_GOLD;
export const LOGO_CALLIGRAPHY_DARK = LOGO_CALLIGRAPHY_NAVY;
export const LOGO_FULL_LIGHT_GOLD = LOGO_PNG_CREAM;
export const LOGO_WATERMARK = LOGO_CALLIGRAPHY_CREAM;

// === CHARACTERS (PNG + GIF) ===

export const CHARACTERS = {
  waving: {
    png: "/branding/characters/Character_1_waving_transparent.png",
    gif: "/branding/characters/Character_1_waving_transparent.png"
  },
  shamagh: {
    png: "/branding/characters/Character_1_waving_transparent.png",
    gif: "/branding/characters/Character_1_waving_transparent.png"
  },
  handsOnHips: {
    png: "/branding/characters/Character_1_waving_transparent.png",
    gif: "/branding/characters/Character_1_waving_transparent.png"
  },
  glasses: {
    png: "/branding/characters/Character_1_waving_transparent.png",
    gif: "/branding/characters/Character_1_waving_transparent.png"
  },
  armsCrossed: {
    png: "/branding/characters/Character_1_waving_transparent.png",
    gif: "/branding/characters/Character_1_waving_transparent.png"
  },
  standingShamagh: {
    png: "/branding/characters/Character_1_waving_transparent.png",
    gif: "/branding/characters/Character_1_waving_transparent.png"
  }
} as const;

// Legacy character exports (backward compatibility)
export const CHARACTER_WAVING = CHARACTERS.waving.png;
export const CHARACTER_SHMAGH = CHARACTERS.shamagh.png;
export const CHARACTER_STANDING = CHARACTERS.handsOnHips.png;
export const CHARACTER_STANDING_ALT = CHARACTERS.handsOnHips.png;
export const CHARACTER_SUNGLASSES = CHARACTERS.glasses.png;
export const CHARACTER_ARMS_CROSSED = CHARACTERS.armsCrossed.png;
export const CHARACTER_STANDING_SHMAGH = CHARACTERS.standingShamagh.png;

// === NEW LARGE LOGOS (Rased 6 = cream/gold for dark bg, Rased 3 = navy/gold for light bg) ===

/** Large logo - cream/gold calligraphy with text (for dark backgrounds) */
export const LOGO_LARGE_CREAM_GOLD = '/branding/logos/Rased_3_transparent.png';

/** Large logo - navy/gold calligraphy with text (for light backgrounds) */
export const LOGO_LARGE_NAVY_GOLD = '/branding/logos/Rased_3_transparent.png';

// === QUANTUM LEAP DESIGN ASSETS ===

/** QuantumLeap logo white (for dark backgrounds / login branding) */
export const QL_LOGO_WHITE = '/branding/logos/Rased_3_transparent.png';

/** QuantumLeap logo dark (for light backgrounds / mobile login) */
export const QL_LOGO_DARK = '/branding/logos/Rased_3_transparent.png';

/** QuantumLeap logo main (footer) */
export const QL_LOGO_MAIN = '/branding/logos/Rased_3_transparent.png';

/** QuantumLeap NDMO office logo (footer) */
export const QL_LOGO_OFFICE = '/branding/logos/Rased_3_transparent.png';

/** QuantumLeap character standing (login branding) */
export const QL_CHAR_STANDING = '/branding/logos/Rased_3_transparent.png';

// === USAGE MAPPING ===
export const PAGE_ASSETS = {
  login: {
    logo: LOGO_SVG_GOLD_TEXT,
    character: CHARACTERS.waving,
  },
  sidebar: {
    logo: LOGO_CALLIGRAPHY_NAVY_GOLD,
    logoCollapsed: LOGO_CALLIGRAPHY_NAVY,
    logoDark: LOGO_SVG_DARK,
    logoLight: LOGO_SVG_LIGHT,
  },
  home: {
    character: CHARACTERS.armsCrossed,
    watermark: LOGO_CALLIGRAPHY_CREAM,
  },
  analytics: {
    character: CHARACTERS.glasses,
    watermark: LOGO_CALLIGRAPHY_CREAM,
  },
  reports: {
    character: CHARACTERS.shamagh,
    watermark: LOGO_CALLIGRAPHY_CREAM,
  },
  leadership: {
    character: CHARACTERS.armsCrossed,
    watermark: LOGO_CALLIGRAPHY_CREAM,
  },
  settings: {
    character: CHARACTERS.standingShamagh,
    watermark: LOGO_CALLIGRAPHY_CREAM,
  },
  notFound: {
    character: CHARACTERS.handsOnHips,
    logo: LOGO_PNG_CREAM,
  },
  emptyState: {
    character: CHARACTERS.handsOnHips,
  },
  smartRasid: {
    character: CHARACTERS.glasses,
    logo: LOGO_CALLIGRAPHY_GOLD,
  },
} as const;
