# rasid-leaks - client-styles

> Auto-extracted source code documentation

---

## `client/src/styles/atlas-login.css`

```css
/* ═══════════════════════════════════════════════════════════════════
   ATLAS LOGIN PAGE — Ultra Premium Luxury Tech
   Glass morphism + 3D Gold Bevel + Depth effects
   Exact 1:1 match with rasid-atlas LoginPage
   ═══════════════════════════════════════════════════════════════════ */
.login-page { background: #060B18; }
.login-bg { background: radial-gradient(ellipse 120% 80% at 50% 40%, #0d1a30 0%, #060B18 70%); }
.login-orb { position: absolute; border-radius: 50%; filter: blur(100px); animation: login-orb-drift 20s ease-in-out infinite; }
.login-orb-gold { top: -15%; right: -8%; width: 550px; height: 550px; background: rgba(197,165,90,0.08); animation-delay: 0s; }
.login-orb-navy { bottom: -20%; left: -10%; width: 600px; height: 600px; background: rgba(30,64,175,0.06); animation-delay: -7s; }
.login-orb-teal { top: 40%; left: 30%; width: 350px; height: 350px; background: rgba(100,255,218,0.03); animation-delay: -14s; }
@keyframes login-orb-drift {
  0%, 100% { transform: translate(0,0) scale(1); }
  25% { transform: translate(20px,-15px) scale(1.05); }
  50% { transform: translate(-10px,20px) scale(0.95); }
  75% { transform: translate(15px,10px) scale(1.02); }
}
.login-main-card {
  background: rgba(12,18,35,0.45);
  backdrop-filter: blur(40px) saturate(1.4);
  -webkit-backdrop-filter: blur(40px) saturate(1.4);
  border: 2px solid transparent;
  border-image: linear-gradient(135deg,
    rgba(197,165,90,0.65) 0%, rgba(212,185,106,0.2) 20%,
    rgba(197,165,90,0.55) 40%, rgba(170,140,70,0.15) 60%,
    rgba(197,165,90,0.5) 80%, rgba(212,185,106,0.6) 100%) 1;
  box-shadow:
    0 0 40px rgba(197,165,90,0.12), 0 0 80px rgba(197,165,90,0.06),
    0 0 160px rgba(197,165,90,0.03), 0 30px 100px rgba(0,0,0,0.55),
    0 15px 40px rgba(0,0,0,0.35), 0 5px 15px rgba(0,0,0,0.25),
    inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.25);
  min-height: 580px;
}
.login-brand-panel {
  background: linear-gradient(160deg, rgba(10,25,47,0.97) 0%, rgba(13,28,52,0.95) 30%, rgba(16,32,58,0.92) 60%, rgba(10,20,40,0.97) 100%);
  border-left: 1px solid rgba(197,165,90,0.18);
  position: relative;
}
.login-brand-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 50% 45%, rgba(197,165,90,0.04) 0%, transparent 70%);
  pointer-events: none;
}
.login-gold-line {
  background: linear-gradient(90deg, transparent 0%, rgba(197,165,90,0.15) 20%, rgba(197,165,90,0.5) 50%, rgba(197,165,90,0.15) 80%, transparent 100%);
}
.login-ring-spin { animation: login-ring-rotate 40s linear infinite; }
.login-ring-spin-reverse { animation: login-ring-rotate 50s linear infinite reverse; }
@keyframes login-ring-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.login-character-float { animation: login-char-float 4s ease-in-out infinite; }
@keyframes login-char-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.login-character-glow {
  background: radial-gradient(circle, rgba(197,165,90,0.12) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(30px);
}
.login-float { animation: login-float-el 6s ease-in-out infinite; }
@keyframes login-float-el {
  0%, 100% { transform: rotate(45deg) translateY(0); }
  50% { transform: rotate(45deg) translateY(-12px); }
}
.login-platform-badge {
  display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
  border-radius: 9999px; background: rgba(197,165,90,0.06);
  border: 1px solid rgba(197,165,90,0.12); backdrop-filter: blur(8px);
  transition: all 0.25s ease;
}
.login-platform-badge:hover {
  background: rgba(197,165,90,0.1); border-color: rgba(197,165,90,0.25);
  transform: translateY(-2px);
}
.login-form-panel {
  background: linear-gradient(160deg, rgba(14,22,42,0.85) 0%, rgba(10,18,35,0.9) 50%, rgba(8,14,30,0.95) 100%);
}
.login-form-glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%);
  border-radius: inherit;
}
.login-header-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(197,165,90,0.12), rgba(197,165,90,0.04));
  border: 1px solid rgba(197,165,90,0.2);
  box-shadow: 0 0 20px rgba(197,165,90,0.08);
}
.login-gold-divider {
  width: 24px; height: 1px;
  background: linear-gradient(90deg, rgba(197,165,90,0.5), rgba(197,165,90,0.1));
}
.login-input-wrapper {
  position: relative; border-radius: 14px; padding: 1.5px;
  background: linear-gradient(135deg, rgba(100,110,140,0.3) 0%, rgba(60,70,100,0.2) 50%, rgba(100,110,140,0.3) 100%);
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03);
}
.login-input-wrapper.focused {
  background: linear-gradient(135deg, rgba(197,165,90,0.5) 0%, rgba(197,165,90,0.15) 25%, rgba(197,165,90,0.4) 50%, rgba(197,165,90,0.1) 75%, rgba(197,165,90,0.45) 100%);
  box-shadow: 0 0 20px rgba(197,165,90,0.12), 0 0 40px rgba(197,165,90,0.06), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04);
}
.login-input-wrapper.has-error {
  background: linear-gradient(135deg, rgba(255,107,122,0.4) 0%, rgba(255,107,122,0.15) 50%, rgba(255,107,122,0.35) 100%);
  box-shadow: 0 0 16px rgba(255,107,122,0.1);
}
.login-input {
  width: 100%; height: 48px; padding-right: 3rem; padding-left: 1rem;
  border-radius: 12.5px; border: none; background: rgba(12,18,35,0.8);
  color: #e2e8f0; font-size: 0.875rem; font-family: 'Tajawal', sans-serif;
  outline: none; transition: background 0.2s ease;
}
.login-input::placeholder { color: rgba(148,163,184,0.5); }
.login-input:focus { background: rgba(14,22,42,0.9); }
.login-input.has-toggle { padding-left: 3rem; }
.login-input-icon-right {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: rgba(148,163,184,0.5); z-index: 2; transition: color 0.2s ease;
}
.login-input-wrapper.focused .login-input-icon-right { color: rgba(197,165,90,0.7); }
.login-input-toggle {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: rgba(148,163,184,0.5); z-index: 2; transition: color 0.2s ease;
  background: none; border: none; padding: 4px;
}
.login-input-toggle:hover { color: rgba(197,165,90,0.7); }
.login-section-divider {
  height: 1px; margin: 0.25rem 0;
  background: linear-gradient(90deg, transparent 0%, rgba(197,165,90,0.2) 30%, rgba(197,165,90,0.35) 50%, rgba(197,165,90,0.2) 70%, transparent 100%);
}
.login-submit-btn {
  position: relative; width: 100%; height: 54px; border-radius: 14px; padding: 2.5px;
  background: linear-gradient(135deg, rgba(212,185,106,0.7) 0%, rgba(197,165,90,0.25) 20%, rgba(212,185,106,0.6) 45%, rgba(170,140,70,0.2) 70%, rgba(197,165,90,0.65) 100%);
  border: none; cursor: pointer; transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(197,165,90,0.18), 0 8px 40px rgba(0,0,0,0.3), 0 0 30px rgba(197,165,90,0.08), inset 0 1px 0 rgba(255,255,255,0.08);
}
.login-submit-btn.hover {
  background: linear-gradient(135deg, rgba(212,185,106,0.85) 0%, rgba(197,165,90,0.4) 20%, rgba(212,185,106,0.75) 45%, rgba(170,140,70,0.35) 70%, rgba(197,165,90,0.8) 100%);
  box-shadow: 0 6px 28px rgba(197,165,90,0.25), 0 14px 48px rgba(0,0,0,0.3), 0 0 50px rgba(197,165,90,0.12), inset 0 1px 0 rgba(255,255,255,0.1);
  transform: translateY(-2px);
}
.login-submit-btn.active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(197,165,90,0.1), 0 4px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2);
}
.login-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
.login-btn-inner {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  width: 100%; height: 100%; border-radius: 12px;
  background: linear-gradient(160deg, #0d1f3c 0%, #0A192F 50%, #081428 100%);
  color: #C5A55A; font-weight: 600; font-size: 0.9375rem;
  font-family: 'Tajawal', sans-serif; transition: all 0.2s ease;
}
.login-submit-btn.hover .login-btn-inner {
  background: linear-gradient(160deg, #112240 0%, #0d1f3c 50%, #0A192F 100%);
  color: #d4b96a;
}
.login-error-card {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem;
  border-radius: 12px; background: rgba(255,107,122,0.06);
  border: 1px solid rgba(255,107,122,0.15); backdrop-filter: blur(8px);
  animation: login-error-shake 0.4s ease;
}
@keyframes login-error-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
.login-footer-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(197,165,90,0.15) 30%, rgba(197,165,90,0.25) 50%, rgba(197,165,90,0.15) 70%, transparent 100%);
}
@media (prefers-reduced-motion: reduce) {
  .login-orb, .login-character-float, .login-ring-spin, .login-ring-spin-reverse, .login-float { animation: none !important; }
  .login-submit-btn, .login-input-wrapper, .login-platform-badge { transition-duration: 0.01ms !important; }
}
@media (max-width: 1024px) {
  .login-main-card { max-width: 480px; border-image: none; border: 1.5px solid rgba(197,165,90,0.25); border-radius: 1.25rem; }
  .login-form-panel { border-radius: 1.25rem; }
}
@media (max-width: 640px) {
  .login-main-card { margin: 1rem; min-height: auto; }
  .login-form-panel { padding: 1.5rem !important; }
}

/* ─── Additional Animations for Login ─── */
@keyframes gold-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes gold-shimmer-sweep {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
@keyframes subtle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes orbital-spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes orbital-spin-reverse {
  from { transform: translate(-50%, -50%) rotate(360deg); }
  to { transform: translate(-50%, -50%) rotate(0deg); }
}

```

---

## `client/src/styles/design-tokens.css`

```css
/* ═══════════════════════════════════════════════════════
   Design Tokens — Rasid Breach Monitoring Platform
   نظام التصميم الموحد لمنصة راصد لرصد التسريبات
   ═══════════════════════════════════════════════════════ */

:root {
  /* ── Typography ── */
  --font-family-ar: 'Tajawal', 'Cairo', 'Noto Kufi Arabic', sans-serif;
  --font-family-en: 'DM Sans', 'Inter', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-h1: 700 2rem/1.2 var(--font-family-ar);
  --text-h2: 700 1.5rem/1.25 var(--font-family-ar);
  --text-h3: 600 1.25rem/1.3 var(--font-family-ar);
  --text-subtitle: 600 1rem/1.4 var(--font-family-ar);
  --text-body: 400 0.875rem/1.5 var(--font-family-ar);
  --text-caption: 400 0.75rem/1.4 var(--font-family-ar);
  --text-micro: 500 0.625rem/1.4 var(--font-family-ar);
  --fs-h1: 2rem;
  --fs-h2: 1.5rem;
  --fs-h3: 1.25rem;
  --fs-subtitle: 1rem;
  --fs-body: 0.875rem;
  --fs-caption: 0.75rem;
  --fs-micro: 0.625rem;

  /* ── Spacing ── */
  --space-0: 0px; --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px; --space-8: 32px;
  --space-10: 40px; --space-12: 48px; --space-16: 64px;

  /* ── Border Radius ── */
  --radius-xs: 4px; --radius-sm: 6px; --radius-md: 8px;
  --radius-lg: 12px; --radius-xl: 16px; --radius-2xl: 24px;
  --radius-full: 9999px;

  /* ── Shadows ── */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.16);

  /* ── Neutral Colors ── */
  --neutral-50: #f9fafb; --neutral-100: #f3f4f6; --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db; --neutral-400: #9ca3af; --neutral-500: #6b7280;
  --neutral-600: #4b5563; --neutral-700: #374151; --neutral-800: #1f2937;
  --neutral-900: #111827;

  /* ── Semantic Colors ── */
  --color-success: #10b981; --color-warning: #f59e0b;
  --color-danger: #ef4444; --color-info: #3b82f6;

  /* ── Chart Colors — SDAIA Official ── */
  --chart-1: #3DB1AC; --chart-2: #6459A7; --chart-3: #273470;
  --chart-4: #EB3D63; --chart-5: #F59E0B; --chart-6: #10B981;
  --chart-7: #3b82f6; --chart-8: #ec4899;

  /* ── Transitions ── */
  --transition-fast: 150ms cubic-bezier(0.4,0,0.2,1);
  --transition-normal: 200ms cubic-bezier(0.4,0,0.2,1);
  --transition-slow: 300ms cubic-bezier(0.4,0,0.2,1);

  /* ── Glassmorphism ── */
  --glass-bg: rgba(255,255,255,0.08);
  --glass-border: rgba(255,255,255,0.12);
  --glass-blur: 16px;

  /* ── Glow — SDAIA Official ── */
  --glow-primary: rgba(61,177,172,0.4);
  --glow-accent: rgba(100,89,167,0.4);
  --glow-success: rgba(16,185,129,0.4);
  --glow-danger: rgba(235,61,99,0.4);

  /* ── Misc ── */
  --min-tap: 44px;
}

/* ── Dark Mode Overrides ── */
.dark {
  --glass-bg: rgba(15,23,42,0.6);
  --glass-border: rgba(61,177,172,0.15);
}

/* ═══════════════════════════════════════════════════════
   Responsive Typography — Mobile (< 640px)
   ═══════════════════════════════════════════════════════ */
@media (max-width: 640px) {
  :root {
    --fs-h1: 1.5rem;
    --fs-h2: 1.25rem;
    --fs-h3: 1.125rem;
    --fs-subtitle: 0.9375rem;
  }
}

@media (max-width: 768px) {
  :root {
    --fs-h1: 1.5rem;
    --fs-h2: 1.25rem;
    --fs-h3: 1.125rem;
  }
}

/* ═══════════════════════════════════════════════════════
   Glassmorphism Cards
   ═══════════════════════════════════════════════════════ */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  transition: all var(--transition-normal);
}

.glass-card:hover {
  border-color: rgba(61,177,172,0.25);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(61,177,172,0.1);
  transform: translateY(-2px);
}

.dark .glass-card {
  background: rgba(15,23,42,0.6);
  border-color: rgba(61,177,172,0.1);
}

.dark .glass-card:hover {
  border-color: rgba(61,177,172,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(61,177,172,0.08);
}

/* ═══════════════════════════════════════════════════════
   Glow Effects — SDAIA Official
   ═══════════════════════════════════════════════════════ */
.glow-primary {
  box-shadow: 0 0 15px var(--glow-primary), 0 0 30px rgba(61,177,172,0.15);
}

.glow-accent {
  box-shadow: 0 0 15px var(--glow-accent), 0 0 30px rgba(100,89,167,0.15);
}

.glow-success {
  box-shadow: 0 0 15px var(--glow-success), 0 0 30px rgba(16,185,129,0.15);
}

.glow-danger {
  box-shadow: 0 0 15px var(--glow-danger), 0 0 30px rgba(235,61,99,0.15);
}

/* Glow on hover for interactive elements */
.glow-hover:hover {
  box-shadow: 0 0 20px var(--glow-primary), 0 0 40px rgba(61,177,172,0.2);
  transition: box-shadow var(--transition-normal);
}

/* Pulsing glow animation */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 10px var(--glow-primary); }
  50% { box-shadow: 0 0 25px var(--glow-primary), 0 0 50px rgba(61,177,172,0.15); }
}

.glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* ═══════════════════════════════════════════════════════
   Buttons — SDAIA Design System
   ═══════════════════════════════════════════════════════ */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  min-height: var(--min-tap); padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md); font: var(--text-body); font-weight: 600;
  cursor: pointer; transition: all var(--transition-normal); border: 1px solid transparent;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.btn-primary { background: var(--platform-primary, #273470); color: white; }
.btn-primary:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 0 15px var(--glow-primary); }
.btn-secondary { background: transparent; color: var(--platform-primary, #273470); border-color: var(--platform-primary, #273470); }
.btn-secondary:hover:not(:disabled) { background: rgba(61,177,172,0.08); }
.btn-ghost { background: transparent; color: var(--neutral-600); }
.btn-ghost:hover:not(:disabled) { background: rgba(107,114,128,0.08); }
.btn-danger { background: var(--color-danger); color: white; }
.btn-danger:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 0 15px var(--glow-danger); }

/* ═══════════════════════════════════════════════════════
   Surface & Layout
   ═══════════════════════════════════════════════════════ */
html, body { overflow-x: hidden; max-width: 100vw; }

.dark .surface {
  background: rgba(26,37,80,0.6);
  border-color: rgba(61,177,172,0.1);
  color: #E1DEF5;
}

/* ═══════════════════════════════════════════════════════
   Focus Visible — Accessibility
   ═══════════════════════════════════════════════════════ */
*:focus-visible {
  outline: 2px solid var(--platform-focus, #3DB1AC);
  outline-offset: 2px;
  border-radius: 4px;
}

/* ═══════════════════════════════════════════════════════
   Mobile Sidebar Overlay
   ═══════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    z-index: 40;
    transition: opacity var(--transition-normal);
  }
}

/* ═══════════════════════════════════════════════════════
   Scan Line Animation (for GlassCard)
   ═══════════════════════════════════════════════════════ */
@keyframes scan {
  0% { top: -1px; }
  100% { top: calc(100% + 1px); }
}

.animate-scan {
  animation: scan 2s linear infinite;
}

/* ═══════════════════════════════════════════════════════
   Gold Sweep Animation (for premium cards)
   ═══════════════════════════════════════════════════════ */
.gold-sweep::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255,215,0,0.03) 45%,
    rgba(255,215,0,0.06) 50%,
    rgba(255,215,0,0.03) 55%,
    transparent 60%
  );
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  pointer-events: none;
  border-radius: inherit;
}

.gold-sweep:hover::before {
  transform: translateX(100%);
}

/* ═══════════════════════════════════════════════════════
   Severity Badge Colors
   ═══════════════════════════════════════════════════════ */
.severity-critical { --severity-color: #ef4444; --severity-bg: rgba(239,68,68,0.15); }
.severity-high { --severity-color: #f97316; --severity-bg: rgba(249,115,22,0.15); }
.severity-medium { --severity-color: #f59e0b; --severity-bg: rgba(245,158,11,0.15); }
.severity-low { --severity-color: #10b981; --severity-bg: rgba(16,185,129,0.15); }

```

---

## `client/src/styles/platform-theme.css`

```css
/* ═══════════════════════════════════════════════════════
   Platform Themes — Rasid Breach Monitoring Platform
   ثيمات المنصة - راصد لرصد التسريبات
   ═══════════════════════════════════════════════════════ */

/* ── Rasid Theme (Default) ── */
:root, [data-platform="rasid"] {
  --platform-primary: #273470;
  --platform-primary-light: #3DB1AC;
  --platform-accent: #6459A7;
  --platform-focus: #3DB1AC;
  --platform-focus-ring: rgba(61,177,172,0.35);
  --platform-nav-active: #3DB1AC;
  --platform-nav-active-glow: rgba(61,177,172,0.4);
  --platform-bg: #f8fafc;
  --platform-surface: #ffffff;
  --platform-text: #1e293b;
  --platform-text-muted: #64748b;
  --platform-border: #e2e8f0;
  --chart-1: #3DB1AC; --chart-2: #6459A7; --chart-3: #273470;
  --chart-4: #EB3D63; --chart-5: #F59E0B; --chart-6: #10B981;
  --chart-7: #3b82f6; --chart-8: #ec4899;
}

/* ── Emerald Theme ── */
[data-platform="emerald"] {
  --platform-primary: #065f46;
  --platform-primary-light: #34d399;
  --platform-accent: #059669;
  --platform-focus: #34d399;
  --platform-focus-ring: rgba(52,211,153,0.35);
  --platform-nav-active: #34d399;
  --platform-nav-active-glow: rgba(52,211,153,0.4);
  --chart-1: #34d399; --chart-2: #059669; --chart-3: #065f46;
  --chart-4: #f59e0b; --chart-5: #ef4444; --chart-6: #8b5cf6;
}

/* ── Dark Mode — Rasid ── */
.dark:root, .dark[data-platform="rasid"] {
  --platform-primary: #3DB1AC;
  --platform-primary-light: #5ee0db;
  --platform-bg: #0a0f1e;
  --platform-surface: rgba(15,23,42,0.8);
  --platform-text: #e2e8f0;
  --platform-text-muted: #94a3b8;
  --platform-border: rgba(61,177,172,0.15);
}

/* ── Dark Mode — Emerald ── */
.dark[data-platform="emerald"] {
  --platform-primary: #34d399;
  --platform-primary-light: #6ee7b7;
  --platform-bg: #0a1a14;
  --platform-surface: rgba(6,95,70,0.15);
  --platform-text: #e2e8f0;
  --platform-text-muted: #94a3b8;
  --platform-border: rgba(52,211,153,0.15);
}

/* ── Dynamic Color Theme Overrides ── */
[data-color-theme="ocean"] {
  --platform-primary-light: #0ea5e9;
  --platform-accent: #06b6d4;
  --platform-nav-active: #0ea5e9;
  --platform-nav-active-glow: rgba(14,165,233,0.4);
}

[data-color-theme="sunset"] {
  --platform-primary-light: #f59e0b;
  --platform-accent: #ef4444;
  --platform-nav-active: #f59e0b;
  --platform-nav-active-glow: rgba(245,158,11,0.4);
}

[data-color-theme="royal"] {
  --platform-primary-light: #8b5cf6;
  --platform-accent: #6366f1;
  --platform-nav-active: #8b5cf6;
  --platform-nav-active-glow: rgba(139,92,246,0.4);
}

[data-color-theme="crimson"] {
  --platform-primary-light: #ef4444;
  --platform-accent: #ec4899;
  --platform-nav-active: #ef4444;
  --platform-nav-active-glow: rgba(239,68,68,0.4);
}

```

---

## `client/src/styles/premium-3d-themes.css`

```css
/* ═══════════════════════════════════════════════════════════════════
   PREMIUM 3D THEMES — Silver Steel & Gold Luxury
   Inspired by real control dashboard 3D aesthetic
   ═══════════════════════════════════════════════════════════════════ */

/* ═══ Shared 3D Keyframes ═══ */
@keyframes metallic-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes gauge-pulse {
  0%, 100% { filter: drop-shadow(0 0 4px var(--metal-glow)); }
  50% { filter: drop-shadow(0 0 12px var(--metal-glow)); }
}

@keyframes panel-glow {
  0%, 100% { box-shadow: var(--card-shadow), inset 0 1px 0 var(--bevel-top); }
  50% { box-shadow: var(--card-shadow), inset 0 1px 0 var(--bevel-top), 0 0 20px var(--metal-glow); }
}

@keyframes data-flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.7; }
  94% { opacity: 1; }
  97% { opacity: 0.8; }
  98% { opacity: 1; }
}

@keyframes bevel-breathe {
  0%, 100% { border-color: var(--bevel-border); }
  50% { border-color: var(--bevel-border-glow); }
}

/* ═══════════════════════════════════════════════════════════════════
   THEME: Silver Steel — Industrial Chrome Dashboard
   Colors: #3A4A5C (slate blue), #8A9BB0 (silver), #C8D0DC (chrome)
   ═══════════════════════════════════════════════════════════════════ */

/* --- Silver Steel Dark --- */
.dark[data-design-style="silver"] {
  --background: #1C2635;
  --foreground: #D0D8E4;
  --card: #283548;
  --card-foreground: #D0D8E4;
  --primary: #8A9BB0;
  --primary-foreground: #1C2635;
  --secondary: #5A7090;
  --accent: #A8B8CC;
  --muted: rgba(138, 155, 176, 0.12);
  --muted-foreground: rgba(208, 216, 228, 0.6);
  --border: rgba(138, 155, 176, 0.18);
  --ring: #8A9BB0;
  --destructive: #E05555;

  /* 3D Metal System */
  --metal-primary: #C8D0DC;
  --metal-secondary: #8A9BB0;
  --metal-dark: #3A4A5C;
  --metal-glow: rgba(168, 184, 204, 0.3);
  --metal-gradient: linear-gradient(145deg, #C8D0DC 0%, #8A9BB0 40%, #5A7090 70%, #3A4A5C 100%);
  --metal-text: linear-gradient(180deg, #E8EDF4 0%, #A8B8CC 50%, #8A9BB0 100%);

  /* Bevel & Emboss */
  --bevel-top: rgba(200, 208, 220, 0.15);
  --bevel-bottom: rgba(0, 0, 0, 0.4);
  --bevel-border: rgba(138, 155, 176, 0.2);
  --bevel-border-glow: rgba(168, 184, 204, 0.35);

  /* Card 3D */
  --card-bg: linear-gradient(165deg, #2E3E50 0%, #283548 40%, #222F40 100%);
  --card-shadow: 0 4px 16px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(200,208,220,0.08);
  --card-hover-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.25), inset 0 1px 0 rgba(200,208,220,0.12), 0 0 24px rgba(138,155,176,0.1);
  --card-border: 1px solid rgba(138, 155, 176, 0.15);
  --card-hover-border: 1px solid rgba(168, 184, 204, 0.25);

  /* Panel groove (inset effect) */
  --panel-inset: inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(200,208,220,0.05);
}

/* --- Silver Steel Light --- */
.light[data-design-style="silver"] {
  --background: #E8ECF2;
  --foreground: #2A3545;
  --card: #F0F3F8;
  --card-foreground: #2A3545;
  --primary: #3A4A5C;
  --primary-foreground: #FFFFFF;
  --secondary: #5A7090;
  --accent: #4A5A6C;
  --muted: rgba(58, 74, 92, 0.06);
  --muted-foreground: rgba(42, 53, 69, 0.6);
  --border: rgba(58, 74, 92, 0.12);
  --ring: #3A4A5C;
  --destructive: #DC3545;

  /* 3D Metal System — Light */
  --metal-primary: #5A6A7C;
  --metal-secondary: #3A4A5C;
  --metal-dark: #2A3545;
  --metal-glow: rgba(58, 74, 92, 0.15);
  --metal-gradient: linear-gradient(145deg, #8A9BB0 0%, #5A7090 40%, #3A4A5C 100%);
  --metal-text: linear-gradient(180deg, #2A3545 0%, #3A4A5C 50%, #5A7090 100%);

  /* Bevel & Emboss — Light */
  --bevel-top: rgba(255, 255, 255, 0.9);
  --bevel-bottom: rgba(58, 74, 92, 0.15);
  --bevel-border: rgba(58, 74, 92, 0.12);
  --bevel-border-glow: rgba(58, 74, 92, 0.2);

  /* Card 3D — Light */
  --card-bg: linear-gradient(165deg, #FFFFFF 0%, #F5F7FA 40%, #EDF0F5 100%);
  --card-shadow: 0 2px 8px rgba(58,74,92,0.08), 0 4px 16px rgba(58,74,92,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
  --card-hover-shadow: 0 4px 16px rgba(58,74,92,0.12), 0 8px 32px rgba(58,74,92,0.06), inset 0 1px 0 rgba(255,255,255,0.95);
  --card-border: 1px solid rgba(58, 74, 92, 0.1);
  --card-hover-border: 1px solid rgba(58, 74, 92, 0.18);

  --panel-inset: inset 0 1px 2px rgba(58,74,92,0.06), inset 0 -1px 0 rgba(255,255,255,0.8);
}

/* --- Silver Steel Cards --- */
.dark[data-design-style="silver"] .glass-card,
.dark[data-design-style="silver"] [data-slot="card"] {
  background: var(--card-bg) !important;
  border: var(--card-border) !important;
  box-shadow: var(--card-shadow) !important;
  border-radius: 14px !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.dark[data-design-style="silver"] .glass-card::before,
.dark[data-design-style="silver"] [data-slot="card"]::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(200,208,220,0.2) 30%, rgba(200,208,220,0.3) 50%, rgba(200,208,220,0.2) 70%, transparent 100%);
  pointer-events: none;
  z-index: 1;
}

.dark[data-design-style="silver"] .glass-card:hover,
.dark[data-design-style="silver"] [data-slot="card"]:hover {
  box-shadow: var(--card-hover-shadow) !important;
  border: var(--card-hover-border) !important;
  transform: translateY(-3px) scale(1.005);
}

.light[data-design-style="silver"] .glass-card,
.light[data-design-style="silver"] [data-slot="card"] {
  background: var(--card-bg) !important;
  border: var(--card-border) !important;
  box-shadow: var(--card-shadow) !important;
  border-radius: 14px !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.light[data-design-style="silver"] .glass-card:hover,
.light[data-design-style="silver"] [data-slot="card"]:hover {
  box-shadow: var(--card-hover-shadow) !important;
  border: var(--card-hover-border) !important;
  transform: translateY(-2px);
}

/* --- Silver Steel KPI Cards --- */
.dark[data-design-style="silver"] .kpi-card,
.dark[data-design-style="silver"] .stat-card {
  background: linear-gradient(165deg, #2E3E50 0%, #283548 60%, #232D3C 100%) !important;
  border: 1px solid rgba(138, 155, 176, 0.18) !important;
  box-shadow: 0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(200,208,220,0.1), inset 0 -2px 6px rgba(0,0,0,0.2) !important;
  border-radius: 14px !important;
  position: relative;
  overflow: hidden;
}

.dark[data-design-style="silver"] .kpi-card::after,
.dark[data-design-style="silver"] .stat-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #5A7090, #8A9BB0, #C8D0DC, #8A9BB0, #5A7090);
  background-size: 200% 100%;
  animation: metallic-shimmer 4s ease-in-out infinite;
}

.dark[data-design-style="silver"] .kpi-card:hover,
.dark[data-design-style="silver"] .stat-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 10px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(200,208,220,0.15), 0 0 30px rgba(138,155,176,0.08) !important;
}

.light[data-design-style="silver"] .kpi-card,
.light[data-design-style="silver"] .stat-card {
  background: linear-gradient(165deg, #FFFFFF 0%, #F5F7FA 60%, #EDF0F5 100%) !important;
  border: 1px solid rgba(58, 74, 92, 0.1) !important;
  box-shadow: 0 2px 10px rgba(58,74,92,0.06), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 3px rgba(58,74,92,0.04) !important;
  border-radius: 14px !important;
}

.light[data-design-style="silver"] .kpi-card::after,
.light[data-design-style="silver"] .stat-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #8A9BB0, #5A7090, #3A4A5C, #5A7090, #8A9BB0);
  background-size: 200% 100%;
  animation: metallic-shimmer 4s ease-in-out infinite;
}

/* --- Silver Steel Sidebar --- */
.dark[data-design-style="silver"] .sidebar-nav-item:hover {
  background: rgba(138, 155, 176, 0.1);
  box-shadow: inset 0 1px 0 rgba(200,208,220,0.05);
}
.dark[data-design-style="silver"] .sidebar-nav-item:hover .sidebar-nav-icon {
  color: #C8D0DC;
  filter: drop-shadow(0 0 4px rgba(168,184,204,0.3));
}
.dark[data-design-style="silver"] .sidebar-nav-item-active {
  background: linear-gradient(90deg, rgba(138,155,176,0.15), rgba(138,155,176,0.05));
  box-shadow: inset 0 1px 0 rgba(200,208,220,0.08), inset 0 -1px 0 rgba(0,0,0,0.2);
}
.dark[data-design-style="silver"] .sidebar-nav-item-active::after {
  background: linear-gradient(180deg, #C8D0DC, #8A9BB0, #5A7090);
  box-shadow: 0 0 8px rgba(168,184,204,0.4);
}
.light[data-design-style="silver"] .sidebar-nav-item:hover {
  background: rgba(58, 74, 92, 0.06);
}
.light[data-design-style="silver"] .sidebar-nav-item:hover .sidebar-nav-icon {
  color: #3A4A5C;
}
.light[data-design-style="silver"] .sidebar-nav-item-active {
  background: rgba(58, 74, 92, 0.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
}
.light[data-design-style="silver"] .sidebar-nav-item-active::after {
  background: linear-gradient(180deg, #5A7090, #3A4A5C);
}

/* --- Silver Steel Tables --- */
.dark[data-design-style="silver"] table thead tr {
  background: linear-gradient(180deg, #2E3E50, #283548);
  box-shadow: inset 0 1px 0 rgba(200,208,220,0.08), inset 0 -1px 0 rgba(0,0,0,0.3);
}
.dark[data-design-style="silver"] table thead th {
  border-bottom: 1px solid rgba(138, 155, 176, 0.15);
  color: #A8B8CC;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}
.dark[data-design-style="silver"] table tbody tr {
  border-bottom: 1px solid rgba(138, 155, 176, 0.06);
}
.dark[data-design-style="silver"] table tbody tr:hover {
  background: rgba(138, 155, 176, 0.06);
  box-shadow: inset 0 0 0 1px rgba(138,155,176,0.08);
}
.light[data-design-style="silver"] table thead tr {
  background: linear-gradient(180deg, #F5F7FA, #EDF0F5);
}
.light[data-design-style="silver"] table thead th {
  border-bottom: 1px solid rgba(58, 74, 92, 0.1);
  color: #3A4A5C;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}
.light[data-design-style="silver"] table tbody tr:hover {
  background: rgba(58, 74, 92, 0.03);
}

/* --- Silver Steel Inputs --- */
.dark[data-design-style="silver"] input,
.dark[data-design-style="silver"] select,
.dark[data-design-style="silver"] textarea {
  background: linear-gradient(180deg, #222F40, #263344) !important;
  border: 1px solid rgba(138, 155, 176, 0.15) !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), inset 0 -1px 0 rgba(200,208,220,0.04) !important;
  color: #D0D8E4 !important;
  border-radius: 10px !important;
}
.dark[data-design-style="silver"] input:focus,
.dark[data-design-style="silver"] select:focus,
.dark[data-design-style="silver"] textarea:focus {
  border-color: rgba(138, 155, 176, 0.35) !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2), 0 0 0 3px rgba(138,155,176,0.1) !important;
}

/* --- Silver Steel Buttons --- */
.dark[data-design-style="silver"] button[class*="primary"],
.dark[data-design-style="silver"] .btn-primary {
  background: linear-gradient(165deg, #5A7090, #3A4A5C) !important;
  border: 1px solid rgba(138, 155, 176, 0.25) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(200,208,220,0.15), inset 0 -1px 0 rgba(0,0,0,0.2) !important;
  color: #E8EDF4 !important;
  position: relative;
  overflow: hidden;
}
.dark[data-design-style="silver"] button[class*="primary"]:hover,
.dark[data-design-style="silver"] .btn-primary:hover {
  background: linear-gradient(165deg, #6A80A0, #4A5A6C) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(200,208,220,0.2), 0 0 15px rgba(138,155,176,0.1) !important;
}

/* --- Silver Steel Dialogs --- */
.dark[data-design-style="silver"] [role="dialog"] {
  background: linear-gradient(165deg, #2E3E50, #283548) !important;
  border: 1px solid rgba(138, 155, 176, 0.2) !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,208,220,0.1) !important;
  border-radius: 16px !important;
}

/* --- Silver Steel Scrollbar --- */
.dark[data-design-style="silver"] ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #5A7090, #3A4A5C);
  border-radius: 4px;
}
.dark[data-design-style="silver"] ::-webkit-scrollbar-track {
  background: #1C2635;
}


/* ═══════════════════════════════════════════════════════════════════
   THEME: Gold Luxury 3D — Premium Gold Control Dashboard
   Colors: #F7B558 (gold), #C9B9A2 (champagne), #1E2A40 (navy)
   ═══════════════════════════════════════════════════════════════════ */

/* --- Gold Luxury 3D Dark --- */
.dark[data-design-style="gold3d"] {
  --background: #141E30;
  --foreground: #F0E6D3;
  --card: #1E2A40;
  --card-foreground: #F0E6D3;
  --primary: #F7B558;
  --primary-foreground: #141E30;
  --secondary: #C9B9A2;
  --accent: #D4A44C;
  --muted: rgba(247, 181, 88, 0.08);
  --muted-foreground: rgba(240, 230, 211, 0.6);
  --border: rgba(201, 185, 162, 0.15);
  --ring: #F7B558;
  --destructive: #EB3D63;

  /* 3D Metal System — Gold */
  --metal-primary: #F7B558;
  --metal-secondary: #C9B9A2;
  --metal-dark: #8B6914;
  --metal-glow: rgba(247, 181, 88, 0.35);
  --metal-gradient: linear-gradient(145deg, #F7D78C 0%, #F7B558 30%, #C9A040 60%, #8B6914 100%);
  --metal-text: linear-gradient(180deg, #FFF0D0 0%, #F7B558 40%, #C9A040 100%);

  /* Bevel & Emboss — Gold */
  --bevel-top: rgba(247, 215, 140, 0.18);
  --bevel-bottom: rgba(0, 0, 0, 0.45);
  --bevel-border: rgba(201, 185, 162, 0.2);
  --bevel-border-glow: rgba(247, 181, 88, 0.35);

  /* Card 3D — Gold */
  --card-bg: linear-gradient(165deg, #243350 0%, #1E2A40 40%, #192438 100%);
  --card-shadow: 0 4px 16px rgba(0,0,0,0.45), 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(247,215,140,0.06);
  --card-hover-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(247,215,140,0.1), 0 0 30px rgba(247,181,88,0.08);
  --card-border: 1px solid rgba(201, 185, 162, 0.12);
  --card-hover-border: 1px solid rgba(247, 181, 88, 0.22);

  --panel-inset: inset 0 2px 4px rgba(0,0,0,0.35), inset 0 -1px 0 rgba(247,215,140,0.04);
}

/* --- Gold Luxury 3D Light --- */
.light[data-design-style="gold3d"] {
  --background: #F5F0E8;
  --foreground: #2C1810;
  --card: #FFFBF5;
  --card-foreground: #2C1810;
  --primary: #B8860B;
  --primary-foreground: #FFFFFF;
  --secondary: #8B6914;
  --accent: #A0782C;
  --muted: rgba(184, 134, 11, 0.06);
  --muted-foreground: rgba(44, 24, 16, 0.6);
  --border: rgba(184, 134, 11, 0.1);
  --ring: #B8860B;
  --destructive: #DC3545;

  /* 3D Metal System — Gold Light */
  --metal-primary: #B8860B;
  --metal-secondary: #8B6914;
  --metal-dark: #5C4409;
  --metal-glow: rgba(184, 134, 11, 0.15);
  --metal-gradient: linear-gradient(145deg, #D4A44C 0%, #B8860B 40%, #8B6914 100%);
  --metal-text: linear-gradient(180deg, #5C4409 0%, #8B6914 50%, #B8860B 100%);

  /* Bevel & Emboss — Gold Light */
  --bevel-top: rgba(255, 255, 255, 0.9);
  --bevel-bottom: rgba(184, 134, 11, 0.12);
  --bevel-border: rgba(184, 134, 11, 0.1);
  --bevel-border-glow: rgba(184, 134, 11, 0.2);

  /* Card 3D — Gold Light */
  --card-bg: linear-gradient(165deg, #FFFFFF 0%, #FFFDF8 40%, #FFF8EE 100%);
  --card-shadow: 0 2px 8px rgba(139,105,20,0.06), 0 4px 16px rgba(139,105,20,0.03), inset 0 1px 0 rgba(255,255,255,0.9);
  --card-hover-shadow: 0 4px 16px rgba(139,105,20,0.1), 0 8px 32px rgba(139,105,20,0.05), inset 0 1px 0 rgba(255,255,255,0.95);
  --card-border: 1px solid rgba(184, 134, 11, 0.08);
  --card-hover-border: 1px solid rgba(184, 134, 11, 0.16);

  --panel-inset: inset 0 1px 2px rgba(139,105,20,0.04), inset 0 -1px 0 rgba(255,255,255,0.8);
}

/* --- Gold 3D Cards --- */
.dark[data-design-style="gold3d"] .glass-card,
.dark[data-design-style="gold3d"] [data-slot="card"] {
  background: var(--card-bg) !important;
  border: var(--card-border) !important;
  box-shadow: var(--card-shadow) !important;
  border-radius: 14px !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Gold bevel top edge */
.dark[data-design-style="gold3d"] .glass-card::before,
.dark[data-design-style="gold3d"] [data-slot="card"]::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(247,181,88,0.15) 20%, rgba(247,215,140,0.3) 50%, rgba(247,181,88,0.15) 80%, transparent 100%);
  pointer-events: none;
  z-index: 1;
}

.dark[data-design-style="gold3d"] .glass-card:hover,
.dark[data-design-style="gold3d"] [data-slot="card"]:hover {
  box-shadow: var(--card-hover-shadow) !important;
  border: var(--card-hover-border) !important;
  transform: translateY(-3px) scale(1.005);
}

.light[data-design-style="gold3d"] .glass-card,
.light[data-design-style="gold3d"] [data-slot="card"] {
  background: var(--card-bg) !important;
  border: var(--card-border) !important;
  box-shadow: var(--card-shadow) !important;
  border-radius: 14px !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.light[data-design-style="gold3d"] .glass-card:hover,
.light[data-design-style="gold3d"] [data-slot="card"]:hover {
  box-shadow: var(--card-hover-shadow) !important;
  border: var(--card-hover-border) !important;
  transform: translateY(-2px);
}

/* --- Gold 3D KPI Cards --- */
.dark[data-design-style="gold3d"] .kpi-card,
.dark[data-design-style="gold3d"] .stat-card {
  background: linear-gradient(165deg, #243350 0%, #1E2A40 60%, #192438 100%) !important;
  border: 1px solid rgba(201, 185, 162, 0.15) !important;
  box-shadow: 0 6px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(247,215,140,0.08), inset 0 -2px 6px rgba(0,0,0,0.25) !important;
  border-radius: 14px !important;
  position: relative;
  overflow: hidden;
}

.dark[data-design-style="gold3d"] .kpi-card::after,
.dark[data-design-style="gold3d"] .stat-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #8B6914, #C9A040, #F7B558, #F7D78C, #F7B558, #C9A040, #8B6914);
  background-size: 200% 100%;
  animation: metallic-shimmer 3s ease-in-out infinite;
}

.dark[data-design-style="gold3d"] .kpi-card:hover,
.dark[data-design-style="gold3d"] .stat-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(247,215,140,0.12), 0 0 35px rgba(247,181,88,0.06) !important;
  border-color: rgba(247, 181, 88, 0.2) !important;
}

.light[data-design-style="gold3d"] .kpi-card,
.light[data-design-style="gold3d"] .stat-card {
  background: linear-gradient(165deg, #FFFFFF 0%, #FFFDF8 60%, #FFF8EE 100%) !important;
  border: 1px solid rgba(184, 134, 11, 0.08) !important;
  box-shadow: 0 2px 10px rgba(139,105,20,0.05), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 3px rgba(139,105,20,0.03) !important;
  border-radius: 14px !important;
}

.light[data-design-style="gold3d"] .kpi-card::after,
.light[data-design-style="gold3d"] .stat-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #C9A040, #B8860B, #8B6914, #B8860B, #C9A040);
  background-size: 200% 100%;
  animation: metallic-shimmer 3s ease-in-out infinite;
}

/* --- Gold 3D Sidebar --- */
.dark[data-design-style="gold3d"] .sidebar-nav-item:hover {
  background: rgba(247, 181, 88, 0.06);
  box-shadow: inset 0 1px 0 rgba(247,215,140,0.04);
}
.dark[data-design-style="gold3d"] .sidebar-nav-item:hover .sidebar-nav-icon {
  color: #F7B558;
  filter: drop-shadow(0 0 6px rgba(247,181,88,0.4));
}
.dark[data-design-style="gold3d"] .sidebar-nav-item-active {
  background: linear-gradient(90deg, rgba(247,181,88,0.1), rgba(247,181,88,0.03));
  box-shadow: inset 0 1px 0 rgba(247,215,140,0.06), inset 0 -1px 0 rgba(0,0,0,0.2);
}
.dark[data-design-style="gold3d"] .sidebar-nav-item-active::after {
  background: linear-gradient(180deg, #F7D78C, #F7B558, #C9A040, #8B6914);
  box-shadow: 0 0 10px rgba(247,181,88,0.5);
}
.light[data-design-style="gold3d"] .sidebar-nav-item:hover {
  background: rgba(184, 134, 11, 0.05);
}
.light[data-design-style="gold3d"] .sidebar-nav-item:hover .sidebar-nav-icon {
  color: #B8860B;
}
.light[data-design-style="gold3d"] .sidebar-nav-item-active {
  background: rgba(184, 134, 11, 0.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
}
.light[data-design-style="gold3d"] .sidebar-nav-item-active::after {
  background: linear-gradient(180deg, #D4A44C, #B8860B, #8B6914);
}

/* --- Gold 3D Tables --- */
.dark[data-design-style="gold3d"] table thead tr {
  background: linear-gradient(180deg, #243350, #1E2A40);
  box-shadow: inset 0 1px 0 rgba(247,215,140,0.06), inset 0 -1px 0 rgba(0,0,0,0.35);
}
.dark[data-design-style="gold3d"] table thead th {
  border-bottom: 1px solid rgba(201, 185, 162, 0.12);
  color: #C9B9A2;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}
.dark[data-design-style="gold3d"] table tbody tr {
  border-bottom: 1px solid rgba(201, 185, 162, 0.05);
}
.dark[data-design-style="gold3d"] table tbody tr:hover {
  background: rgba(247, 181, 88, 0.04);
  box-shadow: inset 0 0 0 1px rgba(247,181,88,0.06);
}
.light[data-design-style="gold3d"] table thead tr {
  background: linear-gradient(180deg, #FFFDF8, #FFF8EE);
}
.light[data-design-style="gold3d"] table thead th {
  border-bottom: 1px solid rgba(184, 134, 11, 0.08);
  color: #8B6914;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}
.light[data-design-style="gold3d"] table tbody tr:hover {
  background: rgba(184, 134, 11, 0.03);
}

/* --- Gold 3D Inputs --- */
.dark[data-design-style="gold3d"] input,
.dark[data-design-style="gold3d"] select,
.dark[data-design-style="gold3d"] textarea {
  background: linear-gradient(180deg, #192438, #1C2840) !important;
  border: 1px solid rgba(201, 185, 162, 0.12) !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(247,215,140,0.03) !important;
  color: #F0E6D3 !important;
  border-radius: 10px !important;
}
.dark[data-design-style="gold3d"] input:focus,
.dark[data-design-style="gold3d"] select:focus,
.dark[data-design-style="gold3d"] textarea:focus {
  border-color: rgba(247, 181, 88, 0.3) !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.25), 0 0 0 3px rgba(247,181,88,0.08) !important;
}

/* --- Gold 3D Buttons --- */
.dark[data-design-style="gold3d"] button[class*="primary"],
.dark[data-design-style="gold3d"] .btn-primary {
  background: linear-gradient(165deg, #C9A040, #8B6914) !important;
  border: 1px solid rgba(247, 181, 88, 0.3) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(247,215,140,0.25), inset 0 -1px 0 rgba(0,0,0,0.25) !important;
  color: #141E30 !important;
  font-weight: 700 !important;
}
.dark[data-design-style="gold3d"] button[class*="primary"]:hover,
.dark[data-design-style="gold3d"] .btn-primary:hover {
  background: linear-gradient(165deg, #D4B050, #A07A1C) !important;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(247,215,140,0.3), 0 0 20px rgba(247,181,88,0.12) !important;
}

/* --- Gold 3D Dialogs --- */
.dark[data-design-style="gold3d"] [role="dialog"] {
  background: linear-gradient(165deg, #243350, #1E2A40) !important;
  border: 1px solid rgba(201, 185, 162, 0.18) !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(247,215,140,0.08) !important;
  border-radius: 16px !important;
}

/* --- Gold 3D Scrollbar --- */
.dark[data-design-style="gold3d"] ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A040, #8B6914);
  border-radius: 4px;
}
.dark[data-design-style="gold3d"] ::-webkit-scrollbar-track {
  background: #141E30;
}

/* --- Gold 3D Tabs --- */
.dark[data-design-style="gold3d"] [role="tablist"] {
  background: rgba(30, 42, 64, 0.6);
  border: 1px solid rgba(201, 185, 162, 0.1);
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}
.dark[data-design-style="gold3d"] [role="tab"][data-state="active"] {
  background: linear-gradient(165deg, rgba(247,181,88,0.15), rgba(201,185,162,0.08));
  border: 1px solid rgba(247, 181, 88, 0.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(247,215,140,0.08);
  color: #F7B558;
}

/* --- Silver Steel Tabs --- */
.dark[data-design-style="silver"] [role="tablist"] {
  background: rgba(40, 53, 72, 0.6);
  border: 1px solid rgba(138, 155, 176, 0.1);
  border-radius: 12px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}
.dark[data-design-style="silver"] [role="tab"][data-state="active"] {
  background: linear-gradient(165deg, rgba(138,155,176,0.15), rgba(90,112,144,0.08));
  border: 1px solid rgba(138, 155, 176, 0.2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(200,208,220,0.08);
  color: #C8D0DC;
}

/* --- Metallic Text Utility --- */
.dark[data-design-style="silver"] .metallic-text,
.dark[data-design-style="silver"] .kpi-value {
  background: linear-gradient(180deg, #E8EDF4 0%, #A8B8CC 50%, #8A9BB0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark[data-design-style="gold3d"] .metallic-text,
.dark[data-design-style="gold3d"] .kpi-value {
  background: linear-gradient(180deg, #FFF0D0 0%, #F7B558 40%, #C9A040 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* --- 3D Icon Boxes --- */
.dark[data-design-style="silver"] .icon-box,
.dark[data-design-style="silver"] .kpi-icon {
  background: linear-gradient(145deg, #3A4A5C, #283548) !important;
  border: 1px solid rgba(138, 155, 176, 0.2) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(200,208,220,0.1), inset 0 -1px 0 rgba(0,0,0,0.2) !important;
  border-radius: 12px !important;
}

.dark[data-design-style="gold3d"] .icon-box,
.dark[data-design-style="gold3d"] .kpi-icon {
  background: linear-gradient(145deg, #2A3A50, #1E2A40) !important;
  border: 1px solid rgba(201, 185, 162, 0.15) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(247,215,140,0.06), inset 0 -1px 0 rgba(0,0,0,0.25) !important;
  border-radius: 12px !important;
}

/* --- Badge Styles --- */
.dark[data-design-style="silver"] .badge,
.dark[data-design-style="silver"] [class*="badge"] {
  box-shadow: inset 0 1px 0 rgba(200,208,220,0.1), 0 2px 4px rgba(0,0,0,0.2);
}

.dark[data-design-style="gold3d"] .badge,
.dark[data-design-style="gold3d"] [class*="badge"] {
  box-shadow: inset 0 1px 0 rgba(247,215,140,0.08), 0 2px 4px rgba(0,0,0,0.25);
}

/* --- Tooltip 3D --- */
.dark[data-design-style="silver"] [role="tooltip"] {
  background: linear-gradient(165deg, #2E3E50, #283548) !important;
  border: 1px solid rgba(138, 155, 176, 0.2) !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(200,208,220,0.08) !important;
}

.dark[data-design-style="gold3d"] [role="tooltip"] {
  background: linear-gradient(165deg, #243350, #1E2A40) !important;
  border: 1px solid rgba(201, 185, 162, 0.15) !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(247,215,140,0.06) !important;
}

```

---

## `client/src/styles/ultra-themes.css`

```css
/* ═══════════════════════════════════════════════════════════════════
   Ultra Premium Theme System — 5 Themes × 2 Modes = 10 Configurations
   + 10 Sidebar Designs (5 Light + 5 Dark)
   ═══════════════════════════════════════════════════════════════════ */

/* ═══ Theme Transition ═══ */
html.theme-transitioning * {
  transition: background-color 0.4s ease, border-color 0.3s ease,
              color 0.3s ease, box-shadow 0.3s ease, fill 0.3s ease !important;
}

/* ═══════════════════════════════════════════════════════════════════
   THEME 1: SDAIA Royal — Official SDAIA Design
   ═══════════════════════════════════════════════════════════════════ */

.dark[data-design-style="sdaia"] {
  --background: #0D1529;
  --foreground: #E1DEF5;
  --card: rgba(39, 52, 112, 0.35);
  --card-foreground: #E1DEF5;
  --popover: #1A2550;
  --popover-foreground: #E1DEF5;
  --primary: #3DB1AC;
  --primary-foreground: #FFFFFF;
  --secondary: #6459A7;
  --secondary-foreground: #FFFFFF;
  --accent: #273470;
  --accent-foreground: #FFFFFF;
  --muted: rgba(100, 89, 167, 0.15);
  --muted-foreground: rgba(225, 222, 245, 0.6);
  --destructive: #EB3D63;
  --destructive-foreground: #FFFFFF;
  --border: rgba(61, 177, 172, 0.15);
  --input: rgba(39, 52, 112, 0.35);
  --ring: #3DB1AC;
  --chart-1: #3DB1AC;
  --chart-2: #6459A7;
  --chart-3: #F59E0B;
  --chart-4: #EB3D63;
  --chart-5: #10B981;
  --sidebar: rgba(13, 21, 41, 0.95);
  --sidebar-foreground: #E1DEF5;
  --sidebar-primary: #3DB1AC;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: rgba(61, 177, 172, 0.12);
  --sidebar-accent-foreground: #E1DEF5;
  --sidebar-border: rgba(61, 177, 172, 0.08);
  --sidebar-ring: #3DB1AC;
  --glass-bg: rgba(39, 52, 112, 0.25);
  --glass-border: rgba(61, 177, 172, 0.12);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  --glass-hover-bg: rgba(39, 52, 112, 0.35);
  --glass-hover-border: rgba(61, 177, 172, 0.25);
  --glow-color: rgba(61, 177, 172, 0.4);
  --glow-strong: rgba(61, 177, 172, 0.8);
  --page-bg: #0D1529;
  --sidebar-bg-custom: rgba(13, 21, 41, 0.95);
}

.light[data-design-style="sdaia"] {
  --background: #F8F9FC;
  --foreground: #1A2550;
  --card: rgba(255, 255, 255, 0.9);
  --card-foreground: #1A2550;
  --popover: #FFFFFF;
  --popover-foreground: #1A2550;
  --primary: #273470;
  --primary-foreground: #FFFFFF;
  --secondary: #6459A7;
  --secondary-foreground: #FFFFFF;
  --accent: #3DB1AC;
  --accent-foreground: #FFFFFF;
  --muted: rgba(39, 52, 112, 0.06);
  --muted-foreground: rgba(26, 37, 80, 0.6);
  --destructive: #DC3545;
  --destructive-foreground: #FFFFFF;
  --border: rgba(39, 52, 112, 0.1);
  --input: rgba(39, 52, 112, 0.06);
  --ring: #273470;
  --chart-1: #273470;
  --chart-2: #3DB1AC;
  --chart-3: #F59E0B;
  --chart-4: #DC3545;
  --chart-5: #10B981;
  --sidebar: #FFFFFF;
  --sidebar-foreground: #1A2550;
  --sidebar-primary: #273470;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: rgba(39, 52, 112, 0.06);
  --sidebar-accent-foreground: #1A2550;
  --sidebar-border: rgba(39, 52, 112, 0.06);
  --sidebar-ring: #273470;
  --glass-bg: rgba(255, 255, 255, 0.85);
  --glass-border: rgba(39, 52, 112, 0.08);
  --glass-shadow: 0 4px 16px rgba(39, 52, 112, 0.06);
  --glass-hover-bg: rgba(255, 255, 255, 0.95);
  --glass-hover-border: rgba(39, 52, 112, 0.15);
  --glow-color: rgba(39, 52, 112, 0.15);
  --glow-strong: rgba(39, 52, 112, 0.3);
  --page-bg: #F8F9FC;
  --sidebar-bg-custom: #FFFFFF;
}

/* ─── SDAIA Cards ─── */
.dark[data-design-style="sdaia"] .glass-card,
.dark[data-design-style="sdaia"] [data-slot="card"] {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 1.25rem;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.dark[data-design-style="sdaia"] .glass-card:hover,
.dark[data-design-style="sdaia"] [data-slot="card"]:hover {
  background: var(--glass-hover-bg);
  border-color: var(--glass-hover-border);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 20px var(--glow-color), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.light[data-design-style="sdaia"] .glass-card,
.light[data-design-style="sdaia"] [data-slot="card"] {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 1.25rem;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.light[data-design-style="sdaia"] .glass-card:hover,
.light[data-design-style="sdaia"] [data-slot="card"]:hover {
  background: var(--glass-hover-bg);
  border-color: var(--glass-hover-border);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(39, 52, 112, 0.08);
}

/* ─── SDAIA Sidebar ─── */
.dark[data-design-style="sdaia"] .sidebar-nav-item:hover {
  background: rgba(61, 177, 172, 0.08); color: #E1DEF5;
}
.dark[data-design-style="sdaia"] .sidebar-nav-item:hover .sidebar-nav-icon {
  filter: drop-shadow(0 0 6px rgba(61, 177, 172, 0.5)); color: #3DB1AC;
}
.dark[data-design-style="sdaia"] .sidebar-nav-item-active {
  background: rgba(61, 177, 172, 0.12) !important; color: #3DB1AC !important;
}
.dark[data-design-style="sdaia"] .sidebar-nav-item-active::after {
  background: linear-gradient(180deg, #3DB1AC, #6459A7) !important;
}
.light[data-design-style="sdaia"] .sidebar-nav-item:hover {
  background: rgba(39, 52, 112, 0.05); color: #1A2550;
}
.light[data-design-style="sdaia"] .sidebar-nav-item:hover .sidebar-nav-icon {
  filter: drop-shadow(0 0 4px rgba(39, 52, 112, 0.3)); color: #273470;
}
.light[data-design-style="sdaia"] .sidebar-nav-item-active {
  background: rgba(39, 52, 112, 0.08) !important; color: #273470 !important;
}
.light[data-design-style="sdaia"] .sidebar-nav-item-active::after {
  background: linear-gradient(180deg, #273470, #3DB1AC) !important;
}

/* ─── SDAIA Tables ─── */
.dark[data-design-style="sdaia"] table thead tr { background: rgba(13, 21, 41, 0.6); }
.dark[data-design-style="sdaia"] table thead th { border-bottom: 1px solid rgba(61, 177, 172, 0.12); }
.dark[data-design-style="sdaia"] table tbody tr:hover { background: rgba(61, 177, 172, 0.06); }
.light[data-design-style="sdaia"] table thead tr { background: rgba(248, 249, 252, 0.8); }
.light[data-design-style="sdaia"] table thead th { border-bottom: 1px solid rgba(39, 52, 112, 0.08); }
.light[data-design-style="sdaia"] table tbody tr:hover { background: rgba(39, 52, 112, 0.04); }

/* ─── SDAIA Scrollbar ─── */
.dark[data-design-style="sdaia"] ::-webkit-scrollbar { width: 6px; height: 6px; }
.dark[data-design-style="sdaia"] ::-webkit-scrollbar-track { background: rgba(13, 21, 41, 0.5); }
.dark[data-design-style="sdaia"] ::-webkit-scrollbar-thumb { background: rgba(61, 177, 172, 0.3); border-radius: 3px; }
.dark[data-design-style="sdaia"] ::-webkit-scrollbar-thumb:hover { background: rgba(61, 177, 172, 0.5); }
.light[data-design-style="sdaia"] ::-webkit-scrollbar-track { background: rgba(248, 249, 252, 0.8); }
.light[data-design-style="sdaia"] ::-webkit-scrollbar-thumb { background: rgba(39, 52, 112, 0.15); border-radius: 3px; }
.light[data-design-style="sdaia"] ::-webkit-scrollbar-thumb:hover { background: rgba(39, 52, 112, 0.3); }

/* ─── SDAIA Glow ─── */
.dark[data-design-style="sdaia"] .glow-teal { box-shadow: 0 0 24px rgba(61, 177, 172, 0.2), 0 0 60px rgba(61, 177, 172, 0.08); }
.dark[data-design-style="sdaia"] .glow-purple { box-shadow: 0 0 24px rgba(100, 89, 167, 0.2), 0 0 60px rgba(100, 89, 167, 0.08); }
.light[data-design-style="sdaia"] .glow-teal { box-shadow: 0 0 16px rgba(61, 177, 172, 0.12); }
.light[data-design-style="sdaia"] .glow-purple { box-shadow: 0 0 16px rgba(100, 89, 167, 0.12); }

/* ─── SDAIA Inputs ─── */
.dark[data-design-style="sdaia"] input:not([type="checkbox"]):not([type="radio"]),
.dark[data-design-style="sdaia"] textarea,
.dark[data-design-style="sdaia"] select {
  background: rgba(26, 37, 80, 0.5) !important; border-color: rgba(61, 177, 172, 0.12);
}
.dark[data-design-style="sdaia"] input:focus,
.dark[data-design-style="sdaia"] textarea:focus {
  border-color: rgba(61, 177, 172, 0.4) !important;
  box-shadow: 0 0 0 2px rgba(61, 177, 172, 0.15), 0 0 20px rgba(61, 177, 172, 0.08) !important;
}

/* ─── SDAIA Dialogs ─── */
.dark[data-design-style="sdaia"] [data-slot="dialog-overlay"] { background: rgba(13, 21, 41, 0.7); backdrop-filter: blur(8px); }
.dark[data-design-style="sdaia"] [data-slot="dialog-content"] {
  background: linear-gradient(180deg, rgba(26, 37, 80, 0.95) 0%, rgba(13, 21, 41, 0.98) 100%);
  border-color: rgba(61, 177, 172, 0.12); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}
.light[data-design-style="sdaia"] [data-slot="dialog-content"] {
  background: #FFFFFF; border-color: rgba(39, 52, 112, 0.08);
  box-shadow: 0 16px 48px rgba(39, 52, 112, 0.1);
}

/* ─── SDAIA Tabs ─── */
.dark[data-design-style="sdaia"] [role="tablist"] { background: rgba(26, 37, 80, 0.5); border-color: rgba(61, 177, 172, 0.08); }
.dark[data-design-style="sdaia"] [role="tab"][data-state="active"] { background: rgba(61, 177, 172, 0.15); box-shadow: 0 2px 8px rgba(61, 177, 172, 0.1); }
.light[data-design-style="sdaia"] [role="tablist"] { background: rgba(248, 249, 252, 0.8); border-color: rgba(39, 52, 112, 0.06); }
.light[data-design-style="sdaia"] [role="tab"][data-state="active"] { background: #FFFFFF; box-shadow: 0 2px 8px rgba(39, 52, 112, 0.06); }

/* ─── SDAIA Light Text Overrides ─── */
.light[data-design-style="sdaia"] .text-white { color: #1A2550 !important; }
.light[data-design-style="sdaia"] .text-gray-200, .light[data-design-style="sdaia"] .text-gray-300 { color: #475569 !important; }
.light[data-design-style="sdaia"] .text-gray-400, .light[data-design-style="sdaia"] .text-gray-500 { color: #64748b !important; }
.light[data-design-style="sdaia"] .bg-white\/5 { background-color: rgba(39, 52, 112, 0.04) !important; }
.light[data-design-style="sdaia"] .border-white\/5 { border-color: rgba(39, 52, 112, 0.08) !important; }
.light[data-design-style="sdaia"] .hover\:bg-white\/5:hover { background-color: rgba(39, 52, 112, 0.06) !important; }
.light[data-design-style="sdaia"] .hover\:text-white:hover { color: #1A2550 !important; }
.light[data-design-style="sdaia"] .recharts-text { fill: #64748b !important; }
.light[data-design-style="sdaia"] .recharts-cartesian-grid-horizontal line,
.light[data-design-style="sdaia"] .recharts-cartesian-grid-vertical line { stroke: rgba(39, 52, 112, 0.06) !important; }

/* ─── SDAIA Shimmer ─── */
.dark[data-design-style="sdaia"] .shimmer-text {
  background: linear-gradient(90deg, #E1DEF5 0%, #3DB1AC 25%, #6459A7 50%, #3DB1AC 75%, #E1DEF5 100%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}
.light[data-design-style="sdaia"] .shimmer-text {
  background: linear-gradient(90deg, #1A2550 0%, #273470 25%, #3DB1AC 50%, #273470 75%, #1A2550 100%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}

/* ─── SDAIA Background ─── */
.dark[data-design-style="sdaia"] {
  background-image:
    radial-gradient(900px 500px at 20% 10%, rgba(61, 177, 172, 0.04), transparent 60%),
    radial-gradient(800px 480px at 80% 0%, rgba(39, 52, 112, 0.06), transparent 55%);
}


/* ═══════════════════════════════════════════════════════════════════
   THEME 3: Luxury Gold — Premium Black & Gold
   ═══════════════════════════════════════════════════════════════════ */

.dark[data-design-style="luxury"] {
  --background: #0A0A0F;
  --foreground: #F0ECE2;
  --card: rgba(20, 18, 30, 0.8);
  --card-foreground: #F0ECE2;
  --popover: #14121E;
  --popover-foreground: #F0ECE2;
  --primary: #D4AF37;
  --primary-foreground: #0A0A0F;
  --secondary: #8B7355;
  --secondary-foreground: #F0ECE2;
  --accent: #C5A55A;
  --accent-foreground: #0A0A0F;
  --muted: rgba(139, 115, 85, 0.15);
  --muted-foreground: rgba(240, 236, 226, 0.5);
  --destructive: #FF4D6A;
  --destructive-foreground: #FFFFFF;
  --border: rgba(212, 175, 55, 0.12);
  --input: rgba(20, 18, 30, 0.8);
  --ring: #D4AF37;
  --chart-1: #D4AF37;
  --chart-2: #C5A55A;
  --chart-3: #8B7355;
  --chart-4: #FF4D6A;
  --chart-5: #4ECDC4;
  --sidebar: rgba(10, 10, 15, 0.98);
  --sidebar-foreground: #F0ECE2;
  --sidebar-primary: #D4AF37;
  --sidebar-primary-foreground: #0A0A0F;
  --sidebar-accent: rgba(212, 175, 55, 0.08);
  --sidebar-accent-foreground: #F0ECE2;
  --sidebar-border: rgba(212, 175, 55, 0.08);
  --sidebar-ring: #D4AF37;
  --glass-bg: rgba(20, 18, 30, 0.7);
  --glass-border: rgba(212, 175, 55, 0.1);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 1px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  --glass-hover-bg: rgba(20, 18, 30, 0.85);
  --glass-hover-border: rgba(212, 175, 55, 0.25);
  --glow-color: rgba(212, 175, 55, 0.3);
  --glow-strong: rgba(212, 175, 55, 0.6);
  --page-bg: #0A0A0F;
  --sidebar-bg-custom: rgba(10, 10, 15, 0.98);
}

.light[data-design-style="luxury"] {
  --background: #FFFDF7;
  --foreground: #1A1510;
  --card: rgba(255, 253, 247, 0.95);
  --card-foreground: #1A1510;
  --popover: #FFFDF7;
  --popover-foreground: #1A1510;
  --primary: #8B6914;
  --primary-foreground: #FFFFFF;
  --secondary: #A08050;
  --secondary-foreground: #FFFFFF;
  --accent: #D4AF37;
  --accent-foreground: #1A1510;
  --muted: rgba(139, 105, 20, 0.06);
  --muted-foreground: rgba(26, 21, 16, 0.5);
  --destructive: #DC3545;
  --destructive-foreground: #FFFFFF;
  --border: rgba(139, 105, 20, 0.1);
  --input: rgba(139, 105, 20, 0.06);
  --ring: #8B6914;
  --chart-1: #8B6914;
  --chart-2: #D4AF37;
  --chart-3: #A08050;
  --chart-4: #DC3545;
  --chart-5: #2a8a86;
  --sidebar: #FFFDF7;
  --sidebar-foreground: #1A1510;
  --sidebar-primary: #8B6914;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: rgba(139, 105, 20, 0.06);
  --sidebar-accent-foreground: #1A1510;
  --sidebar-border: rgba(139, 105, 20, 0.06);
  --sidebar-ring: #8B6914;
  --glass-bg: rgba(255, 253, 247, 0.9);
  --glass-border: rgba(139, 105, 20, 0.08);
  --glass-shadow: 0 4px 16px rgba(139, 105, 20, 0.06);
  --glass-hover-bg: rgba(255, 253, 247, 0.98);
  --glass-hover-border: rgba(139, 105, 20, 0.15);
  --glow-color: rgba(139, 105, 20, 0.15);
  --glow-strong: rgba(139, 105, 20, 0.3);
  --page-bg: #FFFDF7;
  --sidebar-bg-custom: #FFFDF7;
}

/* ─── Luxury Cards ─── */
.dark[data-design-style="luxury"] .glass-card,
.dark[data-design-style="luxury"] [data-slot="card"] {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow); border-radius: 1.25rem;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.dark[data-design-style="luxury"] .glass-card:hover,
.dark[data-design-style="luxury"] [data-slot="card"]:hover {
  background: var(--glass-hover-bg); border-color: var(--glass-hover-border);
  transform: translateY(-3px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), 0 0 30px var(--glow-color), 0 0 1px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
.light[data-design-style="luxury"] .glass-card,
.light[data-design-style="luxury"] [data-slot="card"] {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow); border-radius: 1.25rem;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.light[data-design-style="luxury"] .glass-card:hover,
.light[data-design-style="luxury"] [data-slot="card"]:hover {
  background: var(--glass-hover-bg); border-color: var(--glass-hover-border);
  transform: translateY(-2px); box-shadow: 0 8px 24px rgba(139, 105, 20, 0.08);
}

/* ─── Luxury Sidebar ─── */
.dark[data-design-style="luxury"] .sidebar-nav-item:hover { background: rgba(212, 175, 55, 0.06); color: #F0ECE2; }
.dark[data-design-style="luxury"] .sidebar-nav-item:hover .sidebar-nav-icon { filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.4)); color: #D4AF37; }
.dark[data-design-style="luxury"] .sidebar-nav-item-active { background: rgba(212, 175, 55, 0.1) !important; color: #D4AF37 !important; }
.dark[data-design-style="luxury"] .sidebar-nav-item-active::after { background: linear-gradient(180deg, #D4AF37, #8B7355) !important; }
.light[data-design-style="luxury"] .sidebar-nav-item:hover { background: rgba(139, 105, 20, 0.04); color: #1A1510; }
.light[data-design-style="luxury"] .sidebar-nav-item:hover .sidebar-nav-icon { filter: drop-shadow(0 0 4px rgba(139, 105, 20, 0.3)); color: #8B6914; }
.light[data-design-style="luxury"] .sidebar-nav-item-active { background: rgba(139, 105, 20, 0.08) !important; color: #8B6914 !important; }
.light[data-design-style="luxury"] .sidebar-nav-item-active::after { background: linear-gradient(180deg, #8B6914, #D4AF37) !important; }

/* ─── Luxury Tables ─── */
.dark[data-design-style="luxury"] table thead tr { background: rgba(20, 18, 30, 0.6); }
.dark[data-design-style="luxury"] table thead th { border-bottom: 1px solid rgba(212, 175, 55, 0.1); }
.dark[data-design-style="luxury"] table tbody tr:hover { background: rgba(212, 175, 55, 0.04); }
.light[data-design-style="luxury"] table thead tr { background: rgba(255, 253, 247, 0.8); }
.light[data-design-style="luxury"] table thead th { border-bottom: 1px solid rgba(139, 105, 20, 0.08); }
.light[data-design-style="luxury"] table tbody tr:hover { background: rgba(139, 105, 20, 0.03); }

/* ─── Luxury Scrollbar ─── */
.dark[data-design-style="luxury"] ::-webkit-scrollbar { width: 6px; height: 6px; }
.dark[data-design-style="luxury"] ::-webkit-scrollbar-track { background: rgba(10, 10, 15, 0.5); }
.dark[data-design-style="luxury"] ::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.25); border-radius: 3px; }
.dark[data-design-style="luxury"] ::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.45); }
.light[data-design-style="luxury"] ::-webkit-scrollbar-track { background: rgba(255, 253, 247, 0.8); }
.light[data-design-style="luxury"] ::-webkit-scrollbar-thumb { background: rgba(139, 105, 20, 0.15); border-radius: 3px; }
.light[data-design-style="luxury"] ::-webkit-scrollbar-thumb:hover { background: rgba(139, 105, 20, 0.3); }

/* ─── Luxury Glow ─── */
.dark[data-design-style="luxury"] .glow-teal { box-shadow: 0 0 24px rgba(78, 205, 196, 0.15), 0 0 60px rgba(78, 205, 196, 0.06); }
.dark[data-design-style="luxury"] .glow-purple { box-shadow: 0 0 24px rgba(139, 115, 85, 0.2), 0 0 60px rgba(139, 115, 85, 0.08); }
.dark[data-design-style="luxury"] .glow-gold { box-shadow: 0 0 24px rgba(212, 175, 55, 0.25), 0 0 60px rgba(212, 175, 55, 0.1); }
.dark[data-design-style="luxury"] .glow-crimson { box-shadow: 0 0 24px rgba(255, 77, 106, 0.2), 0 0 60px rgba(255, 77, 106, 0.08); }
.light[data-design-style="luxury"] .glow-teal { box-shadow: 0 0 16px rgba(42, 138, 134, 0.1); }
.light[data-design-style="luxury"] .glow-gold { box-shadow: 0 0 16px rgba(139, 105, 20, 0.12); }

/* ─── Luxury Inputs ─── */
.dark[data-design-style="luxury"] input:not([type="checkbox"]):not([type="radio"]),
.dark[data-design-style="luxury"] textarea,
.dark[data-design-style="luxury"] select { background: rgba(20, 18, 30, 0.7) !important; border-color: rgba(212, 175, 55, 0.1); }
.dark[data-design-style="luxury"] input:focus,
.dark[data-design-style="luxury"] textarea:focus {
  border-color: rgba(212, 175, 55, 0.35) !important;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.12), 0 0 20px rgba(212, 175, 55, 0.06) !important;
}

/* ─── Luxury Dialogs ─── */
.dark[data-design-style="luxury"] [data-slot="dialog-overlay"] { background: rgba(10, 10, 15, 0.7); backdrop-filter: blur(8px); }
.dark[data-design-style="luxury"] [data-slot="dialog-content"] {
  background: linear-gradient(180deg, rgba(20, 18, 30, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%);
  border-color: rgba(212, 175, 55, 0.12); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(212, 175, 55, 0.06);
}
.light[data-design-style="luxury"] [data-slot="dialog-content"] {
  background: #FFFDF7; border-color: rgba(139, 105, 20, 0.08);
  box-shadow: 0 16px 48px rgba(139, 105, 20, 0.08);
}

/* ─── Luxury Tabs ─── */
.dark[data-design-style="luxury"] [role="tablist"] { background: rgba(20, 18, 30, 0.5); border-color: rgba(212, 175, 55, 0.08); }
.dark[data-design-style="luxury"] [role="tab"][data-state="active"] { background: rgba(212, 175, 55, 0.12); box-shadow: 0 2px 8px rgba(212, 175, 55, 0.08); }
.light[data-design-style="luxury"] [role="tablist"] { background: rgba(255, 253, 247, 0.8); border-color: rgba(139, 105, 20, 0.06); }
.light[data-design-style="luxury"] [role="tab"][data-state="active"] { background: #FFFFFF; box-shadow: 0 2px 8px rgba(139, 105, 20, 0.06); }

/* ─── Luxury Light Text Overrides ─── */
.light[data-design-style="luxury"] .text-white { color: #1A1510 !important; }
.light[data-design-style="luxury"] .text-gray-200, .light[data-design-style="luxury"] .text-gray-300 { color: #57534e !important; }
.light[data-design-style="luxury"] .text-gray-400, .light[data-design-style="luxury"] .text-gray-500 { color: #78716c !important; }
.light[data-design-style="luxury"] .bg-white\/5 { background-color: rgba(139, 105, 20, 0.04) !important; }
.light[data-design-style="luxury"] .border-white\/5 { border-color: rgba(139, 105, 20, 0.08) !important; }
.light[data-design-style="luxury"] .hover\:bg-white\/5:hover { background-color: rgba(139, 105, 20, 0.06) !important; }
.light[data-design-style="luxury"] .hover\:text-white:hover { color: #1A1510 !important; }
.light[data-design-style="luxury"] .recharts-text { fill: #78716c !important; }
.light[data-design-style="luxury"] .recharts-cartesian-grid-horizontal line,
.light[data-design-style="luxury"] .recharts-cartesian-grid-vertical line { stroke: rgba(139, 105, 20, 0.06) !important; }

/* ─── Luxury Shimmer ─── */
.dark[data-design-style="luxury"] .shimmer-text {
  background: linear-gradient(90deg, #F0ECE2 0%, #D4AF37 25%, #C5A55A 50%, #D4AF37 75%, #F0ECE2 100%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: luxury-shine 4s linear infinite;
}
.light[data-design-style="luxury"] .shimmer-text {
  background: linear-gradient(90deg, #1A1510 0%, #8B6914 25%, #D4AF37 50%, #8B6914 75%, #1A1510 100%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: luxury-shine 4s linear infinite;
}

/* ─── Luxury Background ─── */
.dark[data-design-style="luxury"] {
  background-image:
    radial-gradient(900px 500px at 20% 10%, rgba(212, 175, 55, 0.04), transparent 60%),
    radial-gradient(800px 480px at 80% 0%, rgba(139, 115, 85, 0.03), transparent 55%);
}


/* ═══════════════════════════════════════════════════════════════════
   THEME 4: Cyber Neon — Cyberpunk Neon Glow
   ═══════════════════════════════════════════════════════════════════ */

.dark[data-design-style="cyber"] {
  --background: #0A0E14;
  --foreground: #C5D0DC;
  --card: rgba(15, 22, 32, 0.85);
  --card-foreground: #C5D0DC;
  --popover: #0F1620;
  --popover-foreground: #C5D0DC;
  --primary: #00FF88;
  --primary-foreground: #0A0E14;
  --secondary: #00D4FF;
  --secondary-foreground: #0A0E14;
  --accent: #00FF88;
  --accent-foreground: #0A0E14;
  --muted: rgba(0, 255, 136, 0.08);
  --muted-foreground: rgba(197, 208, 220, 0.5);
  --destructive: #FF3366;
  --destructive-foreground: #FFFFFF;
  --border: rgba(0, 255, 136, 0.12);
  --input: rgba(15, 22, 32, 0.85);
  --ring: #00FF88;
  --chart-1: #00FF88;
  --chart-2: #00D4FF;
  --chart-3: #FFD700;
  --chart-4: #FF3366;
  --chart-5: #A855F7;
  --sidebar: rgba(10, 14, 20, 0.98);
  --sidebar-foreground: #C5D0DC;
  --sidebar-primary: #00FF88;
  --sidebar-primary-foreground: #0A0E14;
  --sidebar-accent: rgba(0, 255, 136, 0.06);
  --sidebar-accent-foreground: #C5D0DC;
  --sidebar-border: rgba(0, 255, 136, 0.06);
  --sidebar-ring: #00FF88;
  --glass-bg: rgba(15, 22, 32, 0.75);
  --glass-border: rgba(0, 255, 136, 0.1);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 255, 136, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  --glass-hover-bg: rgba(15, 22, 32, 0.9);
  --glass-hover-border: rgba(0, 255, 136, 0.25);
  --glow-color: rgba(0, 255, 136, 0.3);
  --glow-strong: rgba(0, 255, 136, 0.7);
  --page-bg: #0A0E14;
  --sidebar-bg-custom: rgba(10, 14, 20, 0.98);
}

.light[data-design-style="cyber"] {
  --background: #F0F4F8;
  --foreground: #0A0E14;
  --card: rgba(255, 255, 255, 0.92);
  --card-foreground: #0A0E14;
  --popover: #FFFFFF;
  --popover-foreground: #0A0E14;
  --primary: #059669;
  --primary-foreground: #FFFFFF;
  --secondary: #0891B2;
  --secondary-foreground: #FFFFFF;
  --accent: #059669;
  --accent-foreground: #FFFFFF;
  --muted: rgba(5, 150, 105, 0.06);
  --muted-foreground: rgba(10, 14, 20, 0.5);
  --destructive: #DC2626;
  --destructive-foreground: #FFFFFF;
  --border: rgba(5, 150, 105, 0.1);
  --input: rgba(5, 150, 105, 0.06);
  --ring: #059669;
  --chart-1: #059669;
  --chart-2: #0891B2;
  --chart-3: #D97706;
  --chart-4: #DC2626;
  --chart-5: #7C3AED;
  --sidebar: #FFFFFF;
  --sidebar-foreground: #0A0E14;
  --sidebar-primary: #059669;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: rgba(5, 150, 105, 0.06);
  --sidebar-accent-foreground: #0A0E14;
  --sidebar-border: rgba(5, 150, 105, 0.06);
  --sidebar-ring: #059669;
  --glass-bg: rgba(255, 255, 255, 0.88);
  --glass-border: rgba(5, 150, 105, 0.08);
  --glass-shadow: 0 4px 16px rgba(5, 150, 105, 0.06);
  --glass-hover-bg: rgba(255, 255, 255, 0.96);
  --glass-hover-border: rgba(5, 150, 105, 0.15);
  --glow-color: rgba(5, 150, 105, 0.15);
  --glow-strong: rgba(5, 150, 105, 0.3);
  --page-bg: #F0F4F8;
  --sidebar-bg-custom: #FFFFFF;
}

/* ─── Cyber Cards ─── */
.dark[data-design-style="cyber"] .glass-card,
.dark[data-design-style="cyber"] [data-slot="card"] {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow); border-radius: 1.25rem;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  animation: neon-border 4s ease-in-out infinite;
}
.dark[data-design-style="cyber"] .glass-card:hover,
.dark[data-design-style="cyber"] [data-slot="card"]:hover {
  background: var(--glass-hover-bg); border-color: var(--glass-hover-border);
  transform: translateY(-3px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), 0 0 30px var(--glow-color), 0 0 60px rgba(0, 255, 136, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.05);
  animation: none;
}
.light[data-design-style="cyber"] .glass-card,
.light[data-design-style="cyber"] [data-slot="card"] {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow); border-radius: 1.25rem;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.light[data-design-style="cyber"] .glass-card:hover,
.light[data-design-style="cyber"] [data-slot="card"]:hover {
  background: var(--glass-hover-bg); border-color: var(--glass-hover-border);
  transform: translateY(-2px); box-shadow: 0 8px 24px rgba(5, 150, 105, 0.08);
}

/* ─── Cyber Sidebar ─── */
.dark[data-design-style="cyber"] .sidebar-nav-item:hover { background: rgba(0, 255, 136, 0.06); color: #C5D0DC; }
.dark[data-design-style="cyber"] .sidebar-nav-item:hover .sidebar-nav-icon { filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.6)); color: #00FF88; }
.dark[data-design-style="cyber"] .sidebar-nav-item-active { background: rgba(0, 255, 136, 0.1) !important; color: #00FF88 !important; }
.dark[data-design-style="cyber"] .sidebar-nav-item-active::after { background: linear-gradient(180deg, #00FF88, #00D4FF) !important; }
.light[data-design-style="cyber"] .sidebar-nav-item:hover { background: rgba(5, 150, 105, 0.04); color: #0A0E14; }
.light[data-design-style="cyber"] .sidebar-nav-item:hover .sidebar-nav-icon { filter: drop-shadow(0 0 4px rgba(5, 150, 105, 0.3)); color: #059669; }
.light[data-design-style="cyber"] .sidebar-nav-item-active { background: rgba(5, 150, 105, 0.08) !important; color: #059669 !important; }
.light[data-design-style="cyber"] .sidebar-nav-item-active::after { background: linear-gradient(180deg, #059669, #0891B2) !important; }

/* ─── Cyber Tables ─── */
.dark[data-design-style="cyber"] table thead tr { background: rgba(15, 22, 32, 0.6); }
.dark[data-design-style="cyber"] table thead th { border-bottom: 1px solid rgba(0, 255, 136, 0.1); }
.dark[data-design-style="cyber"] table tbody tr:hover { background: rgba(0, 255, 136, 0.04); }
.light[data-design-style="cyber"] table thead tr { background: rgba(240, 244, 248, 0.8); }
.light[data-design-style="cyber"] table thead th { border-bottom: 1px solid rgba(5, 150, 105, 0.08); }
.light[data-design-style="cyber"] table tbody tr:hover { background: rgba(5, 150, 105, 0.03); }

/* ─── Cyber Scrollbar ─── */
.dark[data-design-style="cyber"] ::-webkit-scrollbar { width: 6px; height: 6px; }
.dark[data-design-style="cyber"] ::-webkit-scrollbar-track { background: rgba(10, 14, 20, 0.5); }
.dark[data-design-style="cyber"] ::-webkit-scrollbar-thumb { background: rgba(0, 255, 136, 0.2); border-radius: 3px; }
.dark[data-design-style="cyber"] ::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 136, 0.4); }
.light[data-design-style="cyber"] ::-webkit-scrollbar-track { background: rgba(240, 244, 248, 0.8); }
.light[data-design-style="cyber"] ::-webkit-scrollbar-thumb { background: rgba(5, 150, 105, 0.15); border-radius: 3px; }
.light[data-design-style="cyber"] ::-webkit-scrollbar-thumb:hover { background: rgba(5, 150, 105, 0.3); }

/* ─── Cyber Glow ─── */
.dark[data-design-style="cyber"] .glow-teal { box-shadow: 0 0 24px rgba(0, 212, 255, 0.25), 0 0 60px rgba(0, 212, 255, 0.1); }
.dark[data-design-style="cyber"] .glow-purple { box-shadow: 0 0 24px rgba(168, 85, 247, 0.2), 0 0 60px rgba(168, 85, 247, 0.08); }
.dark[data-design-style="cyber"] .glow-gold { box-shadow: 0 0 24px rgba(255, 215, 0, 0.2), 0 0 60px rgba(255, 215, 0, 0.08); }
.dark[data-design-style="cyber"] .glow-crimson { box-shadow: 0 0 24px rgba(255, 51, 102, 0.25), 0 0 60px rgba(255, 51, 102, 0.1); }
.light[data-design-style="cyber"] .glow-teal { box-shadow: 0 0 16px rgba(8, 145, 178, 0.12); }
.light[data-design-style="cyber"] .glow-gold { box-shadow: 0 0 16px rgba(217, 119, 6, 0.12); }

/* ─── Cyber Inputs ─── */
.dark[data-design-style="cyber"] input:not([type="checkbox"]):not([type="radio"]),
.dark[data-design-style="cyber"] textarea,
.dark[data-design-style="cyber"] select { background: rgba(15, 22, 32, 0.7) !important; border-color: rgba(0, 255, 136, 0.1); }
.dark[data-design-style="cyber"] input:focus,
.dark[data-design-style="cyber"] textarea:focus {
  border-color: rgba(0, 255, 136, 0.35) !important;
  box-shadow: 0 0 0 2px rgba(0, 255, 136, 0.12), 0 0 20px rgba(0, 255, 136, 0.06) !important;
}

/* ─── Cyber Dialogs ─── */
.dark[data-design-style="cyber"] [data-slot="dialog-overlay"] { background: rgba(10, 14, 20, 0.7); backdrop-filter: blur(8px); }
.dark[data-design-style="cyber"] [data-slot="dialog-content"] {
  background: linear-gradient(180deg, rgba(15, 22, 32, 0.95) 0%, rgba(10, 14, 20, 0.98) 100%);
  border-color: rgba(0, 255, 136, 0.12); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 255, 136, 0.04);
}
.light[data-design-style="cyber"] [data-slot="dialog-content"] {
  background: #FFFFFF; border-color: rgba(5, 150, 105, 0.08);
  box-shadow: 0 16px 48px rgba(5, 150, 105, 0.08);
}

/* ─── Cyber Tabs ─── */
.dark[data-design-style="cyber"] [role="tablist"] { background: rgba(15, 22, 32, 0.5); border-color: rgba(0, 255, 136, 0.08); }
.dark[data-design-style="cyber"] [role="tab"][data-state="active"] { background: rgba(0, 255, 136, 0.1); box-shadow: 0 2px 8px rgba(0, 255, 136, 0.08); }
.light[data-design-style="cyber"] [role="tablist"] { background: rgba(240, 244, 248, 0.8); border-color: rgba(5, 150, 105, 0.06); }
.light[data-design-style="cyber"] [role="tab"][data-state="active"] { background: #FFFFFF; box-shadow: 0 2px 8px rgba(5, 150, 105, 0.06); }

/* ─── Cyber Light Text Overrides ─── */
.light[data-design-style="cyber"] .text-white { color: #0A0E14 !important; }
.light[data-design-style="cyber"] .text-gray-200, .light[data-design-style="cyber"] .text-gray-300 { color: #374151 !important; }
.light[data-design-style="cyber"] .text-gray-400, .light[data-design-style="cyber"] .text-gray-500 { color: #6B7280 !important; }
.light[data-design-style="cyber"] .bg-white\/5 { background-color: rgba(5, 150, 105, 0.04) !important; }
.light[data-design-style="cyber"] .border-white\/5 { border-color: rgba(5, 150, 105, 0.08) !important; }
.light[data-design-style="cyber"] .hover\:bg-white\/5:hover { background-color: rgba(5, 150, 105, 0.06) !important; }
.light[data-design-style="cyber"] .hover\:text-white:hover { color: #0A0E14 !important; }
.light[data-design-style="cyber"] .recharts-text { fill: #6B7280 !important; }
.light[data-design-style="cyber"] .recharts-cartesian-grid-horizontal line,
.light[data-design-style="cyber"] .recharts-cartesian-grid-vertical line { stroke: rgba(5, 150, 105, 0.06) !important; }

/* ─── Cyber Shimmer ─── */
.dark[data-design-style="cyber"] .shimmer-text {
  background: linear-gradient(90deg, #C5D0DC 0%, #00FF88 25%, #00D4FF 50%, #00FF88 75%, #C5D0DC 100%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}
.light[data-design-style="cyber"] .shimmer-text {
  background: linear-gradient(90deg, #0A0E14 0%, #059669 25%, #0891B2 50%, #059669 75%, #0A0E14 100%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}

/* ─── Cyber Background ─── */
.dark[data-design-style="cyber"] {
  background-image:
    radial-gradient(600px at 20% 30%, rgba(0, 255, 136, 0.03), transparent),
    radial-gradient(600px at 80% 70%, rgba(0, 212, 255, 0.02), transparent);
}


/* ═══════════════════════════════════════════════════════════════════
   THEME 5: Minimal Clean — Swiss Design
   ═══════════════════════════════════════════════════════════════════ */

.dark[data-design-style="minimal"] {
  --background: #18181b;
  --foreground: #e4e4e7;
  --card: rgba(39, 39, 42, 0.85);
  --card-foreground: #e4e4e7;
  --popover: #27272a;
  --popover-foreground: #e4e4e7;
  --primary: #a1a1aa;
  --primary-foreground: #18181b;
  --secondary: #3f3f46;
  --secondary-foreground: #e4e4e7;
  --accent: #52525b;
  --accent-foreground: #e4e4e7;
  --muted: rgba(63, 63, 70, 0.5);
  --muted-foreground: #a1a1aa;
  --destructive: #ef4444;
  --destructive-foreground: #FFFFFF;
  --border: rgba(63, 63, 70, 0.6);
  --input: rgba(39, 39, 42, 0.8);
  --ring: #a1a1aa;
  --chart-1: #a1a1aa;
  --chart-2: #71717a;
  --chart-3: #d4d4d8;
  --chart-4: #ef4444;
  --chart-5: #22c55e;
  --sidebar: rgba(24, 24, 27, 0.98);
  --sidebar-foreground: #e4e4e7;
  --sidebar-primary: #a1a1aa;
  --sidebar-primary-foreground: #18181b;
  --sidebar-accent: rgba(63, 63, 70, 0.4);
  --sidebar-accent-foreground: #e4e4e7;
  --sidebar-border: rgba(63, 63, 70, 0.4);
  --sidebar-ring: #a1a1aa;
  --glass-bg: rgba(39, 39, 42, 0.75);
  --glass-border: rgba(63, 63, 70, 0.5);
  --glass-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  --glass-hover-bg: rgba(39, 39, 42, 0.9);
  --glass-hover-border: rgba(82, 82, 91, 0.6);
  --glow-color: rgba(161, 161, 170, 0.15);
  --glow-strong: rgba(161, 161, 170, 0.3);
  --page-bg: #18181b;
  --sidebar-bg-custom: rgba(24, 24, 27, 0.98);
}

.light[data-design-style="minimal"] {
  --background: #FFFFFF;
  --foreground: #18181b;
  --card: rgba(255, 255, 255, 0.95);
  --card-foreground: #18181b;
  --popover: #FFFFFF;
  --popover-foreground: #18181b;
  --primary: #52525b;
  --primary-foreground: #FFFFFF;
  --secondary: #e4e4e7;
  --secondary-foreground: #18181b;
  --accent: #71717a;
  --accent-foreground: #FFFFFF;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --destructive: #dc2626;
  --destructive-foreground: #FFFFFF;
  --border: #e4e4e7;
  --input: #f4f4f5;
  --ring: #52525b;
  --chart-1: #52525b;
  --chart-2: #71717a;
  --chart-3: #a1a1aa;
  --chart-4: #dc2626;
  --chart-5: #16a34a;
  --sidebar: #FFFFFF;
  --sidebar-foreground: #18181b;
  --sidebar-primary: #52525b;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #f4f4f5;
  --sidebar-accent-foreground: #18181b;
  --sidebar-border: #e4e4e7;
  --sidebar-ring: #52525b;
  --glass-bg: rgba(255, 255, 255, 0.95);
  --glass-border: #e4e4e7;
  --glass-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  --glass-hover-bg: #FFFFFF;
  --glass-hover-border: #d4d4d8;
  --glow-color: rgba(0, 0, 0, 0.04);
  --glow-strong: rgba(0, 0, 0, 0.08);
  --page-bg: #FFFFFF;
  --sidebar-bg-custom: #FFFFFF;
}

/* ─── Minimal Cards ─── */
.dark[data-design-style="minimal"] .glass-card,
.dark[data-design-style="minimal"] [data-slot="card"] {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow); border-radius: 0.75rem;
  transition: all 0.3s ease;
}
.dark[data-design-style="minimal"] .glass-card:hover,
.dark[data-design-style="minimal"] [data-slot="card"]:hover {
  background: var(--glass-hover-bg); border-color: var(--glass-hover-border);
  transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.light[data-design-style="minimal"] .glass-card,
.light[data-design-style="minimal"] [data-slot="card"] {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow); border-radius: 0.75rem;
  transition: all 0.3s ease;
}
.light[data-design-style="minimal"] .glass-card:hover,
.light[data-design-style="minimal"] [data-slot="card"]:hover {
  background: var(--glass-hover-bg); border-color: var(--glass-hover-border);
  transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* ─── Minimal Sidebar ─── */
.dark[data-design-style="minimal"] .sidebar-nav-item:hover { background: rgba(63, 63, 70, 0.3); color: #e4e4e7; }
.dark[data-design-style="minimal"] .sidebar-nav-item:hover .sidebar-nav-icon { color: #a1a1aa; }
.dark[data-design-style="minimal"] .sidebar-nav-item-active { background: rgba(63, 63, 70, 0.5) !important; color: #FFFFFF !important; }
.dark[data-design-style="minimal"] .sidebar-nav-item-active::after { background: #a1a1aa !important; }
.light[data-design-style="minimal"] .sidebar-nav-item:hover { background: #f4f4f5; color: #18181b; }
.light[data-design-style="minimal"] .sidebar-nav-item:hover .sidebar-nav-icon { color: #52525b; }
.light[data-design-style="minimal"] .sidebar-nav-item-active { background: #f4f4f5 !important; color: #18181b !important; }
.light[data-design-style="minimal"] .sidebar-nav-item-active::after { background: #52525b !important; }

/* ─── Minimal Tables ─── */
.dark[data-design-style="minimal"] table thead tr { background: #1f1f23; }
.dark[data-design-style="minimal"] table thead th { border-bottom: 1px solid #3f3f46; }
.dark[data-design-style="minimal"] table tbody tr:hover { background: #27272a; }
.light[data-design-style="minimal"] table thead tr { background: #f4f4f5; }
.light[data-design-style="minimal"] table thead th { border-bottom: 1px solid #e4e4e7; }
.light[data-design-style="minimal"] table tbody tr:hover { background: #f4f4f5; }

/* ─── Minimal Scrollbar ─── */
.dark[data-design-style="minimal"] ::-webkit-scrollbar { width: 6px; height: 6px; }
.dark[data-design-style="minimal"] ::-webkit-scrollbar-track { background: #18181b; }
.dark[data-design-style="minimal"] ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
.dark[data-design-style="minimal"] ::-webkit-scrollbar-thumb:hover { background: #52525b; }
.light[data-design-style="minimal"] ::-webkit-scrollbar-track { background: #fafafa; }
.light[data-design-style="minimal"] ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 3px; }
.light[data-design-style="minimal"] ::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }

/* ─── Minimal Glow — No glow ─── */
[data-design-style="minimal"] .glow-teal,
[data-design-style="minimal"] .glow-purple,
[data-design-style="minimal"] .glow-gold,
[data-design-style="minimal"] .glow-crimson { box-shadow: none !important; }

/* ─── Minimal Inputs ─── */
.dark[data-design-style="minimal"] input:not([type="checkbox"]):not([type="radio"]),
.dark[data-design-style="minimal"] textarea,
.dark[data-design-style="minimal"] select { background: #27272a !important; border-color: #3f3f46; }
.dark[data-design-style="minimal"] input:focus,
.dark[data-design-style="minimal"] textarea:focus {
  border-color: #71717a !important; box-shadow: 0 0 0 2px rgba(113, 113, 122, 0.2) !important;
}

/* ─── Minimal Dialogs ─── */
.dark[data-design-style="minimal"] [data-slot="dialog-overlay"] { background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); }
.dark[data-design-style="minimal"] [data-slot="dialog-content"] {
  background: #27272a; border-color: #3f3f46; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
}
.light[data-design-style="minimal"] [data-slot="dialog-content"] {
  background: #FFFFFF; border-color: #e4e4e7; box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
}

/* ─── Minimal Tabs ─── */
.dark[data-design-style="minimal"] [role="tablist"] { background: #27272a; border-color: #3f3f46; }
.dark[data-design-style="minimal"] [role="tab"][data-state="active"] { background: #3f3f46; }
.light[data-design-style="minimal"] [role="tablist"] { background: #f4f4f5; border-color: #e4e4e7; }
.light[data-design-style="minimal"] [role="tab"][data-state="active"] { background: #FFFFFF; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); }

/* ─── Minimal Light Text Overrides ─── */
.light[data-design-style="minimal"] .text-white { color: #18181b !important; }
.light[data-design-style="minimal"] .text-gray-200, .light[data-design-style="minimal"] .text-gray-300 { color: #52525b !important; }
.light[data-design-style="minimal"] .text-gray-400, .light[data-design-style="minimal"] .text-gray-500 { color: #71717a !important; }
.light[data-design-style="minimal"] .bg-white\/5 { background-color: #f4f4f5 !important; }
.light[data-design-style="minimal"] .border-white\/5 { border-color: #e4e4e7 !important; }
.light[data-design-style="minimal"] .hover\:bg-white\/5:hover { background-color: #e4e4e7 !important; }
.light[data-design-style="minimal"] .hover\:text-white:hover { color: #18181b !important; }
.light[data-design-style="minimal"] .recharts-text { fill: #71717a !important; }
.light[data-design-style="minimal"] .recharts-cartesian-grid-horizontal line,
.light[data-design-style="minimal"] .recharts-cartesian-grid-vertical line { stroke: #e4e4e7 !important; }

/* ─── Minimal Shimmer — No shimmer ─── */
[data-design-style="minimal"] .shimmer-text {
  -webkit-text-fill-color: currentColor !important; background: none !important; animation: none !important;
}


/* ═══════════════════════════════════════════════════════════════════
   SHARED KEYFRAMES
   ═══════════════════════════════════════════════════════════════════ */

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes luxury-shine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes neon-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes neon-border {
  0%, 100% { border-color: rgba(0, 255, 136, 0.1); }
  50% { border-color: rgba(0, 255, 136, 0.25); }
}

```

---

