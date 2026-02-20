/**
 * Rasid Character Images — Transparent PNG variants uploaded to CDN
 * Use these across the platform for consistent character rendering.
 */
export const RASID_CHARACTERS = {
  /** Arms crossed with red/white shmagh — confident pose */
  armsCrossedShmagh: "/branding/characters/Character_5_arms_crossed_shmagh_transparent.png",
  /** Waving hand — friendly greeting pose */
  waving: "/branding/characters/Character_1_waving_transparent.png",
  /** Sunglasses with arms crossed — cool/professional pose */
  sunglasses: "/branding/characters/Character_4_sunglasses_transparent.png",
  /** Standing with red/white shmagh — neutral pose */
  shmagh: "/branding/characters/Character_2_shmagh_transparent.png",
  /** Hands on hips — confident/ready pose */
  handsOnHips: "/branding/characters/Character_3_dark_bg_transparent.png",
  /** Standing with red/white shmagh — full body */
  standingShmagh: "/branding/characters/Character_6_standing_shmagh_transparent.png",
} as const;

/** Default character for login page */
export const LOGIN_CHARACTER = RASID_CHARACTERS.armsCrossedShmagh;

/** Default character for Smart Rasid AI chat */
export const AI_CHAT_CHARACTER = RASID_CHARACTERS.waving;

/** Default character for loading/welcome screens */
export const WELCOME_CHARACTER = RASID_CHARACTERS.handsOnHips;
