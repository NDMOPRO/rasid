/**
 * Unified number and date formatting utilities for RASID platform.
 * All numbers displayed in the platform use English (Western) numerals for consistency.
 */

/** Convert any Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) to Western numerals (0123456789) */
export function toEnglishDigits(str: string): string {
  return str
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06F0));
}

/** Format a number with comma separators (English numerals) */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US");
}

/** Format a percentage with % sign */
export function formatPercent(value: number | string | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || value === "") return "0%";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0%";
  return `${num.toFixed(decimals)}%`;
}

/** Format a date in Arabic locale with English numerals */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const formatted = d.toLocaleDateString("ar-SA-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return toEnglishDigits(formatted);
}

/** Format a date with time */
export function formatDateTime(date: Date | string | number | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const formatted = d.toLocaleDateString("ar-SA-u-nu-latn", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return toEnglishDigits(formatted);
}

/** Format a short date */
export function formatShortDate(date: Date | string | number | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  const formatted = d.toLocaleDateString("ar-SA-u-nu-latn", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return toEnglishDigits(formatted);
}
