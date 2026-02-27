# rasid - client-styles

> Auto-extracted source code documentation

---

## `client/src/styles/design-tokens.css`

```css
:root {
  --font-family-ar: 'Cairo', 'Tajawal', 'Noto Kufi Arabic', sans-serif;
  --font-family-en: 'DM Sans', 'Inter', sans-serif;
  --text-h1: 700 2rem/1.2 var(--font-family-ar);
  --text-h2: 700 1.5rem/1.25 var(--font-family-ar);
  --text-h3: 600 1.25rem/1.3 var(--font-family-ar);
  --text-subtitle: 600 1rem/1.4 var(--font-family-ar);
  --text-body: 400 0.875rem/1.5 var(--font-family-ar);
  --text-caption: 400 0.75rem/1.4 var(--font-family-ar);
  --fs-h1: 2rem;
  --fs-h2: 1.5rem;
  --fs-h3: 1.25rem;
  --fs-subtitle: 1rem;
  --fs-body: 0.875rem;
  --fs-caption: 0.75rem;
  --space-0: 0px; --space-1: 4px; --space-2: 8px; --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px; --space-8: 32px;
  --space-10: 40px; --space-12: 48px; --space-16: 64px;
  --radius-xs: 4px; --radius-sm: 6px; --radius-md: 8px;
  --radius-lg: 12px; --radius-xl: 16px; --radius-full: 9999px;
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.16);
  --neutral-50: #f9fafb; --neutral-100: #f3f4f6; --neutral-200: #e5e7eb;
  --neutral-300: #d1d5db; --neutral-400: #9ca3af; --neutral-500: #6b7280;
  --neutral-600: #4b5563; --neutral-700: #374151; --neutral-800: #1f2937;
  --neutral-900: #111827;
  --color-success: #10b981; --color-warning: #f59e0b;
  --color-danger: #ef4444; --color-info: #3b82f6;
  --transition-fast: 150ms cubic-bezier(0.4,0,0.2,1);
  --transition-normal: 200ms cubic-bezier(0.4,0,0.2,1);
  --min-tap: 44px;
}

@media (max-width: 768px) {
  :root { --fs-h1: 1.5rem; --fs-h2: 1.25rem; --fs-h3: 1.125rem; }
}

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  min-height: var(--min-tap); padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md); font: var(--text-body); font-weight: 600;
  cursor: pointer; transition: all var(--transition-normal); border: 1px solid transparent;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
.btn-primary { background: var(--platform-primary); color: white; }
.btn-primary:hover:not(:disabled) { filter: brightness(1.1); }
.btn-secondary { background: transparent; color: var(--platform-primary); border-color: var(--platform-primary); }
.btn-ghost { background: transparent; color: var(--neutral-600); }
.btn-danger { background: var(--color-danger); color: white; }

html, body { overflow-x: hidden; max-width: 100vw; }

.dark .surface { background: rgba(26,37,80,0.6); border-color: rgba(61,177,172,0.1); color: #E1DEF5; }

*:focus-visible {
  outline: 2px solid var(--platform-focus, #3DB1AC);
  outline-offset: 2px; border-radius: 4px;
}

```

---

## `client/src/styles/platform-theme.css`

```css
:root, [data-platform="rasid"] {
  --platform-primary: #273470;
  --platform-primary-light: #3DB1AC;
  --platform-accent: #6459A7;
  --platform-focus: #3DB1AC;
  --platform-focus-ring: rgba(61,177,172,0.35);
  --platform-nav-active: #3DB1AC;
  --platform-nav-active-glow: rgba(61,177,172,0.4);
  --chart-1: #3DB1AC; --chart-2: #6459A7; --chart-3: #273470;
  --chart-4: #EB3D63; --chart-5: #F59E0B; --chart-6: #10B981;
}

[data-platform="emerald"] {
  --platform-primary: #065f46;
  --platform-primary-light: #34d399;
  --platform-accent: #059669;
  --platform-focus: #34d399;
  --platform-focus-ring: rgba(52,211,153,0.35);
  --platform-nav-active: #34d399;
  --platform-nav-active-glow: rgba(52,211,153,0.4);
  --chart-1: #34d399; --chart-2: #059669; --chart-3: #065f46;
}

.dark:root, .dark[data-platform="rasid"] { --platform-primary: #3DB1AC; }
.dark[data-platform="emerald"] { --platform-primary: #34d399; }

```

---

