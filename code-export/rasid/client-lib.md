# rasid - client-lib

> Auto-extracted source code documentation

---

## `client/src/lib/breachAnalytics.ts`

```typescript
// @ts-nocheck
import { breachRecords, BreachRecord } from "./breachData";

function topN(map: Record<string, number>, n = 10) {
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

function countBy(arr: string[]) {
  const m: Record<string, number> = {};
  arr.forEach((v) => { if (v) m[v] = (m[v] || 0) + 1; });
  return m;
}

export function getPiiFrequency(lang: "en" | "ar" = "ar", records?: BreachRecord[]) {
  const data = records || breachRecords;
  const field = lang === "ar" ? "data_types_ar" : "data_types";
  const all = data.flatMap((r) => (r as any)[field] || []);
  return topN(countBy(all), 30);
}

export function getPiiCoOccurrence(topK = 15, records?: BreachRecord[]) {
  const data = records || breachRecords;
  const freq = getPiiFrequency("ar", data);
  const topTypes = freq.slice(0, topK).map((t) => t.name);
  const matrix: { type1: string; type2: string; count: number }[] = [];
  data.forEach((r) => {
    const types = (r.data_types_ar || []).filter((t: string) => topTypes.includes(t));
    for (let i = 0; i < types.length; i++)
      for (let j = i + 1; j < types.length; j++)
        matrix.push({ type1: types[i], type2: types[j], count: 1 });
  });
  const agg: Record<string, number> = {};
  matrix.forEach((m) => {
    const k = `${m.type1}||${m.type2}`;
    agg[k] = (agg[k] || 0) + 1;
  });
  return Object.entries(agg)
    .map(([k, count]) => { const [type1, type2] = k.split("||"); return { type1, type2, count }; })
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}

export function getSectorBreakdown(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const sectorMap: Record<string, { count: number; records: number }> = {};
  data.forEach((r) => {
    const s = r.sector || "غير محدد";
    if (!sectorMap[s]) sectorMap[s] = { count: 0, records: 0 };
    sectorMap[s].count++;
    sectorMap[s].records += r.overview?.exposed_records || 0;
  });
  return Object.entries(sectorMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count);
}

export function getSectorPiiMatrix(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const matrix: Record<string, Record<string, number>> = {};
  data.forEach((r) => {
    const s = r.sector || "غير محدد";
    if (!matrix[s]) matrix[s] = {};
    (r.data_types_ar || []).forEach((t: string) => { matrix[s][t] = (matrix[s][t] || 0) + 1; });
  });
  return matrix;
}

export function getTimelineData(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const monthly: Record<string, { count: number; records: number }> = {};
  data.forEach((r) => {
    const d = r.date || r.overview?.discovery_date;
    if (!d) return;
    const month = d.substring(0, 7);
    if (!monthly[month]) monthly[month] = { count: 0, records: 0 };
    monthly[month].count++;
    monthly[month].records += r.overview?.exposed_records || 0;
  });
  return Object.entries(monthly).map(([month, v]) => ({ month, ...v })).sort((a, b) => a.month.localeCompare(b.month));
}

export function getYearlyTrend(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const yearly: Record<string, number> = {};
  data.forEach((r) => {
    const d = r.date || r.overview?.discovery_date;
    if (!d) return;
    const year = d.substring(0, 4);
    yearly[year] = (yearly[year] || 0) + 1;
  });
  return Object.entries(yearly).map(([year, count]) => ({ year, count })).sort((a, b) => a.year.localeCompare(b.year));
}

export function getThreatActorProfiles(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const actors: Record<string, { count: number; records: number; sectors: Set<string>; methods: Set<string> }> = {};
  data.forEach((r) => {
    const a = r.threat_actor || r.attacker_info?.name || "Unknown";
    if (!actors[a]) actors[a] = { count: 0, records: 0, sectors: new Set(), methods: new Set() };
    actors[a].count++;
    actors[a].records += r.overview?.exposed_records || 0;
    if (r.sector) actors[a].sectors.add(r.sector);
    if (r.overview?.attack_method_en) actors[a].methods.add(r.overview.attack_method_en);
  });
  return Object.entries(actors)
    .map(([name, v]) => ({ name, count: v.count, records: v.records, sectors: [...v.sectors], methods: [...v.methods] }))
    .sort((a, b) => b.count - a.count);
}

export function getImpactDistribution(records?: BreachRecord[]) {
  const data = records || breachRecords;
  return data
    .map((r) => ({
      id: r.id, title: r.title_ar,
      records: r.overview?.exposed_records || 0,
      severity: r.overview?.severity || "Unknown",
      sector: r.sector, piiCount: r.data_types_count || 0,
      fine: parseFloat(String(r.pdpl_analysis?.estimated_fine_sar || r.ai_analysis?.pdpl_analysis?.estimated_fine_sar || "0").replace(/[^0-9.]/g, "")) || 0,
    }))
    .sort((a, b) => b.records - a.records);
}

export function getSeverityBreakdown(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const sev = countBy(data.map((r) => r.overview?.severity).filter(Boolean) as string[]);
  return Object.entries(sev).map(([name, count]) => ({ name, count }));
}

export function getPlatformDistribution(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const platforms = countBy(data.map((r) => r.overview?.source_platform).filter(Boolean) as string[]);
  return topN(platforms, 10);
}

export function getPriceAnalysis(records?: BreachRecord[]) {
  const data = records || breachRecords;
  return data
    .filter((r) => r.leak_source?.price_usd && r.leak_source.price_usd > 0)
    .map((r) => ({ id: r.id, title: r.title_ar, price: r.leak_source.price_usd, records: r.overview?.exposed_records || 0, pricePerRecord: r.leak_source.price_usd / Math.max(r.overview?.exposed_records || 1, 1) }))
    .sort((a, b) => (b.price || 0) - (a.price || 0));
}

export function getAttackMethodBreakdown(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const methods = countBy(data.map((r) => r.overview?.attack_method_en || r.overview?.attack_method).filter(Boolean) as string[]);
  return topN(methods, 15);
}

export function getPdplViolations(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const articles: Record<string, number> = {};
  let totalFines = 0;
  data.forEach((r) => {
    const pdpl = r.pdpl_analysis || r.ai_analysis?.pdpl_analysis;
    if (!pdpl) return;
    const va = pdpl.violated_articles;
    const artList = Array.isArray(va) ? va : typeof va === 'string' ? va.replace(/Articles?\s*/i, '').split(/[,،]+/).map((s: string) => s.trim()).filter(Boolean) : [];
    artList.forEach((a: string) => { articles[`Article ${a.replace(/^Article\s*/i, '')}`] = (articles[`Article ${a.replace(/^Article\s*/i, '')}`] || 0) + 1; });
    const fineStr = String(pdpl.estimated_fine_sar || "0");
    const fineParts = fineStr.split(/[-–]/).map((s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0).filter((n: number) => n > 0);
    const fine = fineParts.length > 0 ? fineParts.reduce((a: number, b: number) => a + b, 0) / fineParts.length : 0;
    totalFines += fine;
  });
  return {
    articles: topN(articles, 20), totalFines,
    incidentsWithViolations: data.filter((r) => { const pdpl = r.pdpl_analysis || r.ai_analysis?.pdpl_analysis; return pdpl?.violated_articles?.length > 0; }).length,
  };
}

export function getComplianceGaps(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const gaps: Record<string, number> = {};
  data.forEach((r) => {
    const pdpl = r.pdpl_analysis || r.ai_analysis?.pdpl_analysis;
    (pdpl?.compliance_gaps || []).forEach((g: string) => { gaps[g] = (gaps[g] || 0) + 1; });
  });
  return topN(gaps, 15);
}

export function getRecommendationFrequency(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const recs: Record<string, number> = {};
  data.forEach((r) => {
    (r.ai_analysis?.recommendations || []).forEach((rec: string) => { recs[rec] = (recs[rec] || 0) + 1; });
  });
  return topN(recs, 20);
}

export function getCampaigns(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const groups: Record<string, BreachRecord[]> = {};
  data.forEach((r) => {
    const actor = r.threat_actor || r.attacker_info?.name || "Unknown";
    if (!groups[actor]) groups[actor] = [];
    groups[actor].push(r);
  });
  return Object.entries(groups)
    .filter(([, recs]) => recs.length >= 2)
    .map(([actor, recs]) => {
      const sorted = recs.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      return {
        actor, incidents: recs.length,
        totalRecords: recs.reduce((s, r) => s + (r.overview?.exposed_records || 0), 0),
        sectors: [...new Set(recs.map((r) => r.sector).filter(Boolean))],
        dateRange: `${sorted[0]?.date || "?"} → ${sorted[sorted.length - 1]?.date || "?"}`,
        breaches: sorted,
      };
    })
    .sort((a, b) => b.incidents - a.incidents);
}

export function compareIncidents(ids: string[], records?: BreachRecord[]) {
  const data = records || breachRecords;
  return data.filter((r) => ids.includes(r.id));
}

export function getExecutiveSummary(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const totalRecords = data.reduce((s, r) => s + (r.overview?.exposed_records || 0), 0);
  const sectors = getSectorBreakdown(data);
  const actors = getThreatActorProfiles(data);
  const platforms = getPlatformDistribution(data);
  const severities = getSeverityBreakdown(data);
  const pdpl = getPdplViolations(data);
  return {
    totalIncidents: data.length, totalRecords,
    totalSectors: sectors.length, totalActors: actors.length,
    totalPiiTypes: new Set(data.flatMap((r) => r.data_types_ar || [])).size,
    topSector: sectors[0] || { name: "N/A", count: 0 },
    topAttacker: actors[0] || { name: "N/A", count: 0 },
    topPlatform: platforms[0] || { name: "N/A", count: 0 },
    topMethod: getAttackMethodBreakdown(data)[0] || { name: "N/A", count: 0 },
    severities, estimatedFines: pdpl.totalFines,
    criticalCount: severities.find((s) => s.name === "Critical")?.count || 0,
    highCount: severities.find((s) => s.name === "High")?.count || 0,
  };
}

export function getIncidentById(id: string) {
  return breachRecords.find((r) => r.id === id);
}

```

---

## `client/src/lib/breachData.ts`

```typescript
// @ts-nocheck
// Data loaded from CDN
const BREACH_DATA_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/bUJvkvCfCGUNRpsw.json";
let rawData: any[] = [];
try {
  const resp = await fetch(BREACH_DATA_URL);
  rawData = await resp.json();
} catch(e) { /* fallback empty */ }

export interface BreachOverview {
  discovery_date: string;
  attack_method: string;
  attack_method_ar: string;
  attack_method_en: string;
  exposed_records: number;
  data_size: string;
  source_platform: string;
  source_url: string;
  severity: string;
  confidence_level: string;
}

export interface LeakSource {
  platform: string;
  url: string;
  discovery_date: string;
  price?: string;
  price_usd?: number;
}

export interface AttackerInfo {
  name: string;
  aliases: string[];
  known_targets: string[];
  threat_level: string;
  profile_url: string;
}

export interface AiAnalysis {
  analysis_date: string;
  impact_assessment: string;
  impact_assessment_en: string;
  confidence_percentage: number;
  executive_summary: string;
  executive_summary_en: string;
  recommendations: string[];
  recommendations_en: string[];
  pdpl_analysis: {
    violated_articles: string[];
    estimated_fine_sar: string;
    compliance_gaps: string[];
    compliance_gaps_en: string[];
    required_actions: string[];
    required_actions_en: string[];
  };
  confidence_level: string;
}

export interface PdplAnalysis {
  violated_articles: string[];
  estimated_fine_sar: string;
  compliance_gaps: string[];
  compliance_gaps_en: string[];
  required_actions: string[];
  required_actions_en: string[];
}

export interface BreachRecord {
  id: string;
  victim: string;
  title_en: string;
  title_ar: string;
  date: string;
  category: string;
  overview: BreachOverview;
  leak_source: LeakSource;
  attacker_info: AttackerInfo;
  data_types: string[];
  data_types_ar: string[];
  data_types_count: number;
  data_sensitivity: string;
  data_samples: any[];
  sample_fields: string[];
  sample_fields_en: string[];
  total_sample_records: number;
  ai_analysis: AiAnalysis;
  pdpl_analysis: PdplAnalysis;
  description_en: string;
  description_ar: string;
  sector: string;
  threat_actor: string;
  sources: any[];
}

export const breachRecords: BreachRecord[] = rawData as BreachRecord[];

export const totalIncidents = breachRecords.length;
export const totalRecordsExposed = breachRecords.reduce(
  (sum, r) => sum + (r.overview?.exposed_records || 0),
  0
);

export const allSectors = [...new Set(breachRecords.map((r) => r.sector).filter(Boolean))];
export const allThreatActors = [...new Set(breachRecords.map((r) => r.threat_actor).filter(Boolean))];
export const allPlatforms = [...new Set(breachRecords.map((r) => r.overview?.source_platform).filter(Boolean))];
export const allDataTypes = [...new Set(breachRecords.flatMap((r) => r.data_types || []))];
export const allDataTypesAr = [...new Set(breachRecords.flatMap((r) => r.data_types_ar || []))];
export const allSeverities = [...new Set(breachRecords.map((r) => r.overview?.severity).filter(Boolean))];
export const allAttackMethods = [...new Set(breachRecords.map((r) => r.overview?.attack_method_en).filter(Boolean))];

```

---

## `client/src/lib/characters.ts`

```typescript
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

```

---

## `client/src/lib/excelExport.ts`

```typescript
/**
 * Professional Excel Export Utility for RASID Platform
 * Creates beautifully formatted Arabic RTL Excel files
 */

import { trpc } from "@/lib/trpc";

// Helper to download base64 as file
export function downloadBase64File(base64: string, filename: string) {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export types
export type DashboardExportType =
  | "overview"
  | "clauses"
  | "sectors"
  | "categories"
  | "all";

export type SitesExportFilter = {
  complianceStatus?: string;
  sectorType?: string;
  classification?: string;
  title?: string;
};

```

---

## `client/src/lib/exportUtils.ts`

```typescript

```

---

## `client/src/lib/formatters.ts`

```typescript
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

```

---

## `client/src/lib/i18n.tsx`

```tsx

```

---

## `client/src/lib/leadershipPdfExport.ts`

```typescript
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LOGO_FULL_DARK } from "@/lib/rasidAssets";

const COLORS = {
  primary: [39, 52, 112] as [number, number, number],
  accent: [59, 130, 246] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  dark: [30, 41, 59] as [number, number, number],
  light: [248, 250, 252] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  text: [51, 65, 85] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
};

interface LeadershipData {
  general: {
    totalSites: number;
    totalScans: number;
    compliant: number;
    nonCompliant: number;
    partiallyCompliant: number;
    noPolicy: number;
    unreachable: number;
    avgScore: number;
  };
  sectorBreakdown?: Array<{ sectorType: string; total: number; compliant: number; nonCompliant: number; partial: number; avgScore: number }>;
  clauseBreakdown?: Array<{ clauseNum: number; clauseTitle: string; compliant: number; total: number }>;
  classificationBreakdown?: Array<{ classification: string; total: number; compliant: number }>;
  topCompliant?: Array<{ name: string; domain: string; score: number }>;
  bottomCompliant?: Array<{ name: string; domain: string; score: number }>;
}

export async function generateLeadershipPDF(data: LeadershipData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 15;
  let y = 0;

  const dateStr = new Date().toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" });

  // Helper functions
  const addHeader = () => {
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pw, 8, "F");
    doc.setFillColor(...COLORS.gold);
    doc.rect(0, 8, pw, 1.5, "F");
  };

  const addFooter = (pageNum: number) => {
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, ph - 10, pw, 10, "F");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.white);
    doc.text(`${pageNum}`, pw / 2, ph - 4, { align: "center" });
    doc.text("RASID Platform", m, ph - 4);
    doc.text(dateStr, pw - m, ph - 4, { align: "right" });
  };

  const checkBreak = (h: number) => {
    if (y + h > ph - 20) {
      doc.addPage();
      addHeader();
      y = 15;
    }
  };

  const sectionTitle = (title: string) => {
    checkBreak(18);
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(m, y, pw - m * 2, 9, 2, 2, "F");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.white);
    doc.text(title, pw - m - 4, y + 6.5, { align: "right" });
    y += 13;
  };

  // ===== COVER PAGE =====
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pw, ph, "F");

  // Gold accent lines
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, ph * 0.35, pw, 1, "F");
  doc.rect(0, ph * 0.65, pw, 0.5, "F");

  // Logo
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = LOGO_FULL_DARK;
    });
    if (img.complete && img.naturalWidth > 0) {
      doc.addImage(img, "PNG", pw / 2 - 25, 40, 50, 25);
    }
  } catch {}

  doc.setFontSize(28);
  doc.setTextColor(...COLORS.white);
  doc.text("RASID Leadership Dashboard", pw / 2, ph * 0.42, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.gold);
  doc.text("Compliance Monitoring Report", pw / 2, ph * 0.48, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  doc.text(dateStr, pw / 2, ph * 0.55, { align: "center" });
  doc.text("SDAIA - Saudi Data & AI Authority", pw / 2, ph * 0.60, { align: "center" });

  // Classification badge
  doc.setFillColor(...COLORS.gold);
  doc.roundedRect(pw / 2 - 20, ph * 0.70, 40, 8, 2, 2, "F");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.primary);
  doc.text("CONFIDENTIAL", pw / 2, ph * 0.70 + 5.5, { align: "center" });

  // ===== PAGE 2: General Stats =====
  doc.addPage();
  addHeader();
  y = 15;

  sectionTitle("General Compliance Overview");

  const g = data.general;
  const totalWithScans = g.compliant + g.nonCompliant + g.partiallyCompliant + g.noPolicy;
  const complianceRate = totalWithScans > 0 ? Math.round((g.compliant / totalWithScans) * 100) : 0;

  // Stats grid
  const statsItems = [
    { label: "Total Sites", value: String(g.totalSites), color: COLORS.accent },
    { label: "Total Scans", value: String(g.totalScans), color: COLORS.accent },
    { label: "Compliant", value: String(g.compliant), color: COLORS.success },
    { label: "Partially Compliant", value: String(g.partiallyCompliant), color: COLORS.warning },
    { label: "Non-Compliant", value: String(g.nonCompliant), color: COLORS.danger },
    { label: "No Policy", value: String(g.noPolicy), color: COLORS.muted },
    { label: "Unreachable", value: String(g.unreachable), color: COLORS.muted },
    { label: "Compliance Rate", value: `${complianceRate}%`, color: complianceRate >= 50 ? COLORS.success : COLORS.danger },
  ];

  const colW = (pw - m * 2 - 15) / 4;
  statsItems.forEach((item, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = m + col * (colW + 5);
    const cy = y + row * 28;

    doc.setFillColor(...COLORS.light);
    doc.roundedRect(x, cy, colW, 24, 2, 2, "F");

    // Color indicator
    doc.setFillColor(...(item.color as [number, number, number]));
    doc.roundedRect(x + colW - 3, cy + 2, 2, 20, 1, 1, "F");

    doc.setFontSize(16);
    doc.setTextColor(...COLORS.dark);
    doc.text(item.value, x + colW / 2, cy + 10, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(item.label, x + colW / 2, cy + 18, { align: "center" });
  });

  y += 62;

  // Compliance distribution bar
  checkBreak(25);
  sectionTitle("Compliance Distribution");

  const barY = y;
  const barW = pw - m * 2;
  const barH = 12;
  const total = g.compliant + g.nonCompliant + g.partiallyCompliant + g.noPolicy;

  if (total > 0) {
    let bx = m;
    const segments = [
      { value: g.compliant, color: COLORS.success, label: "Compliant" },
      { value: g.partiallyCompliant, color: COLORS.warning, label: "Partial" },
      { value: g.nonCompliant, color: COLORS.danger, label: "Non-Compliant" },
      { value: g.noPolicy, color: COLORS.muted, label: "No Policy" },
    ];

    segments.forEach((seg) => {
      const w = (seg.value / total) * barW;
      if (w > 0) {
        doc.setFillColor(...(seg.color as [number, number, number]));
        doc.roundedRect(bx, barY, w, barH, 1, 1, "F");
        if (w > 15) {
          doc.setFontSize(8);
          doc.setTextColor(...COLORS.white);
          doc.text(`${Math.round((seg.value / total) * 100)}%`, bx + w / 2, barY + 7.5, { align: "center" });
        }
        bx += w;
      }
    });

    y = barY + barH + 8;

    // Legend
    let lx = m;
    segments.forEach((seg) => {
      doc.setFillColor(...(seg.color as [number, number, number]));
      doc.circle(lx + 2, y, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.text);
      doc.text(`${seg.label} (${seg.value})`, lx + 6, y + 1.5);
      lx += 45;
    });
    y += 10;
  }

  // ===== Sector Breakdown =====
  if (data.sectorBreakdown && data.sectorBreakdown.length > 0) {
    checkBreak(30);
    sectionTitle("Sector Breakdown");

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["Sector", "Total", "Compliant", "Non-Compliant", "Partial", "Avg Score"]],
      body: data.sectorBreakdown.map((s) => [
        s.sectorType || "N/A",
        String(s.total),
        String(s.compliant),
        String(s.nonCompliant),
        String(s.partial),
        `${s.avgScore}%`,
      ]),
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 7, halign: "center" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { cellPadding: 2 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ===== Clause Breakdown =====
  if (data.clauseBreakdown && data.clauseBreakdown.length > 0) {
    checkBreak(30);
    sectionTitle("Article 12 Clause Compliance");

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["Clause", "Title", "Compliant", "Total", "Rate"]],
      body: data.clauseBreakdown.map((c) => [
        String(c.clauseNum),
        c.clauseTitle || `Clause ${c.clauseNum}`,
        String(c.compliant),
        String(c.total),
        c.total > 0 ? `${Math.round((c.compliant / c.total) * 100)}%` : "N/A",
      ]),
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 7, halign: "center" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { cellPadding: 2 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ===== Top/Bottom Sites =====
  if (data.topCompliant && data.topCompliant.length > 0) {
    checkBreak(30);
    sectionTitle("Top Compliant Sites");

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["#", "Site", "Domain", "Score"]],
      body: data.topCompliant.slice(0, 10).map((s, i) => [
        String(i + 1),
        s.name,
        s.domain,
        `${s.score}%`,
      ]),
      headStyles: { fillColor: COLORS.success, textColor: COLORS.white, fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 7, halign: "center" },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      styles: { cellPadding: 2 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (data.bottomCompliant && data.bottomCompliant.length > 0) {
    checkBreak(30);
    sectionTitle("Lowest Compliant Sites");

    autoTable(doc, {
      startY: y,
      margin: { left: m, right: m },
      head: [["#", "Site", "Domain", "Score"]],
      body: data.bottomCompliant.slice(0, 10).map((s, i) => [
        String(i + 1),
        s.name,
        s.domain,
        `${s.score}%`,
      ]),
      headStyles: { fillColor: COLORS.danger, textColor: COLORS.white, fontSize: 8, halign: "center" },
      bodyStyles: { fontSize: 7, halign: "center" },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      styles: { cellPadding: 2 },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) addFooter(i);
  }

  doc.save(`rasid-leadership-report-${new Date().toISOString().split("T")[0]}.pdf`);
}

```

---

## `client/src/lib/mockData.ts`

```typescript
/**
 * Fallback data for the NDMO Leak Monitor platform
 * Based on real Saudi Arabian data breach incidents
 * Used only when API is unavailable — primary data comes from tRPC API
 */

export interface LeakRecord {
  id: string;
  title: string;
  titleAr: string;
  source: "telegram" | "darkweb" | "paste";
  severity: "critical" | "high" | "medium" | "low";
  sector: string;
  sectorAr: string;
  piiTypes: string[];
  recordCount: number;
  detectedAt: string;
  status: "new" | "analyzing" | "documented" | "reported";
  description: string;
  descriptionAr: string;
}

export interface MonitoringChannel {
  id: string;
  name: string;
  platform: string;
  subscribers: number;
  status: "active" | "paused" | "flagged";
  lastActivity: string;
  leaksDetected: number;
  riskLevel: "high" | "medium" | "low";
}

export interface PIIMatch {
  type: string;
  typeAr: string;
  pattern: string;
  count: number;
  sample: string;
  category: string;
}

export const leakRecords: LeakRecord[] = [
  {
    id: "LK-2024-0001",
    title: "Ministry of Foreign Affairs — 1.4M Employee Records",
    titleAr: "وزارة الخارجية — 1.4 مليون سجل موظف",
    source: "darkweb",
    severity: "critical",
    sector: "Government",
    sectorAr: "حكومة",
    piiTypes: ["National ID", "Full Name", "Email", "Phone", "Job Title", "Diplomatic Credentials"],
    recordCount: 1400000,
    detectedAt: "2024-01-13T14:30:00",
    status: "reported",
    description: "Massive breach of Saudi Ministry of Foreign Affairs employee database posted on BreachForums by threat actor 'IntelBroker'. Contains 1.4M records including diplomatic credentials, national IDs, and personal contact information.",
    descriptionAr: "اختراق ضخم لقاعدة بيانات موظفي وزارة الخارجية السعودية نُشر على BreachForums بواسطة مهاجم 'IntelBroker'. يحتوي على 1.4 مليون سجل تشمل بيانات اعتماد دبلوماسية وأرقام هوية ومعلومات اتصال شخصية.",
  },
  {
    id: "LK-2024-0003",
    title: "Saudi Aramco — Contractor Data Exposure",
    titleAr: "أرامكو السعودية — تعرض بيانات المقاولين",
    source: "darkweb",
    severity: "critical",
    sector: "Energy",
    sectorAr: "طاقة",
    piiTypes: ["National ID", "Passport", "Full Name", "Email", "Security Clearance"],
    recordCount: 500000,
    detectedAt: "2024-03-15T09:00:00",
    status: "documented",
    description: "Contractor and employee data from Saudi Aramco's third-party vendor system exposed on XSS.is forum. Includes security clearance levels and access credentials.",
    descriptionAr: "بيانات مقاولين وموظفين من نظام مورد خارجي لأرامكو السعودية تم كشفها على منتدى XSS.is. تشمل مستويات التصريح الأمني وبيانات الوصول.",
  },
  {
    id: "LK-2024-0005",
    title: "Al Rajhi Bank — Customer Financial Data",
    titleAr: "مصرف الراجحي — بيانات عملاء مالية",
    source: "darkweb",
    severity: "critical",
    sector: "Banking",
    sectorAr: "بنوك",
    piiTypes: ["IBAN", "National ID", "Full Name", "Account Balance", "Transaction History"],
    recordCount: 850000,
    detectedAt: "2024-04-10T11:20:00",
    status: "reported",
    description: "Customer financial records from Al Rajhi Bank including IBANs, account balances, and transaction histories offered for sale at $90,000 on Exploit.in.",
    descriptionAr: "سجلات مالية لعملاء مصرف الراجحي تشمل أرقام آيبان وأرصدة حسابات وتاريخ المعاملات معروضة للبيع بسعر 90,000 دولار على Exploit.in.",
  },
  {
    id: "LK-2024-0026",
    title: "STC — 2.3M Customer Records",
    titleAr: "STC — 2.3 مليون سجل عميل",
    source: "telegram",
    severity: "critical",
    sector: "Telecom",
    sectorAr: "اتصالات",
    piiTypes: ["National ID", "Phone", "Email", "IMEI", "Address"],
    recordCount: 2300000,
    detectedAt: "2024-03-15T12:15:00",
    status: "documented",
    description: "Massive STC customer database leaked on Telegram channel 'KSA Data Dumps'. Contains 2.3M records with national IDs, phone numbers, IMEI numbers, and billing addresses.",
    descriptionAr: "تسريب ضخم لقاعدة بيانات عملاء STC على قناة تيليجرام 'KSA Data Dumps'. يحتوي على 2.3 مليون سجل مع أرقام هوية وأرقام هواتف وأرقام IMEI وعناوين الفوترة.",
  },
  {
    id: "LK-2025-0010",
    title: "GOSI — Social Insurance Records",
    titleAr: "التأمينات الاجتماعية — سجلات التأمين",
    source: "darkweb",
    severity: "critical",
    sector: "Government",
    sectorAr: "حكومة",
    piiTypes: ["National ID", "Salary", "Employer", "Insurance Number"],
    recordCount: 920000,
    detectedAt: "2025-03-10T11:00:00",
    status: "analyzing",
    description: "920,000 GOSI social insurance records detected on XSS.is forum. Contains salary information, employer details, and insurance numbers for Saudi workers.",
    descriptionAr: "تم اكتشاف 920,000 سجل تأمينات اجتماعية على منتدى XSS.is. يحتوي على معلومات الرواتب وتفاصيل أصحاب العمل وأرقام التأمين للعمال السعوديين.",
  },
  {
    id: "LK-2025-0013",
    title: "Absher Platform — 3.2M Credentials",
    titleAr: "منصة أبشر — 3.2 مليون بيانات اعتماد",
    source: "darkweb",
    severity: "critical",
    sector: "Government",
    sectorAr: "حكومة",
    piiTypes: ["National ID", "Password", "Email", "Phone"],
    recordCount: 3200000,
    detectedAt: "2025-05-01T16:30:00",
    status: "new",
    description: "3.2M Absher platform credentials detected on BreachForums. Combo list format with national IDs, passwords, and associated email addresses.",
    descriptionAr: "تم اكتشاف 3.2 مليون بيانات اعتماد منصة أبشر على BreachForums. بصيغة Combo List مع أرقام هوية وكلمات مرور وعناوين بريد إلكتروني مرتبطة.",
  },
  {
    id: "LK-2025-0015",
    title: "Hajj 2025 — Pilgrim Records",
    titleAr: "حج 2025 — سجلات الحجاج",
    source: "telegram",
    severity: "critical",
    sector: "Government",
    sectorAr: "حكومة",
    piiTypes: ["Passport", "Full Name", "Phone", "Nationality", "Health Records"],
    recordCount: 750000,
    detectedAt: "2025-07-15T08:20:00",
    status: "documented",
    description: "750,000 Hajj pilgrim records from the 2025 season detected for sale at $30,000. Contains passport numbers, health records, and personal details.",
    descriptionAr: "تم اكتشاف 750,000 سجل حاج من موسم 2025 معروض للبيع بسعر 30,000 دولار. يحتوي على أرقام جوازات سفر وسجلات صحية وبيانات شخصية.",
  },
  {
    id: "LK-2025-0020",
    title: "Tawakkalna — Health Data Exposure",
    titleAr: "توكلنا — تعرض البيانات الصحية",
    source: "darkweb",
    severity: "critical",
    sector: "Healthcare",
    sectorAr: "صحة",
    piiTypes: ["National ID", "Vaccination Status", "PCR Results", "Health Conditions"],
    recordCount: 2100000,
    detectedAt: "2025-04-20T14:00:00",
    status: "analyzing",
    description: "2.1M Tawakkalna health records detected on XSS.is. Includes vaccination status, PCR results, and health conditions linked to national IDs.",
    descriptionAr: "تم اكتشاف 2.1 مليون سجل صحي من توكلنا على XSS.is. يشمل حالة التطعيم ونتائج PCR والحالات الصحية مرتبطة بأرقام الهوية.",
  },
];

export const telegramChannels: MonitoringChannel[] = [
  { id: "CH-TG-001", name: "Saudi Leaks تسريبات سعودية", platform: "Telegram", subscribers: 45000, status: "flagged", lastActivity: "2026-02-10T16:00:00", leaksDetected: 18, riskLevel: "high" },
  { id: "CH-TG-002", name: "KSA Data Dumps", platform: "Telegram", subscribers: 28000, status: "active", lastActivity: "2026-02-09T14:00:00", leaksDetected: 12, riskLevel: "high" },
  { id: "CH-TG-003", name: "Gulf Hackers الخليج", platform: "Telegram", subscribers: 67000, status: "flagged", lastActivity: "2026-02-10T10:00:00", leaksDetected: 24, riskLevel: "high" },
  { id: "CH-TG-004", name: "InfoStealer Logs SA", platform: "Telegram", subscribers: 15000, status: "active", lastActivity: "2026-02-08T18:00:00", leaksDetected: 8, riskLevel: "medium" },
  { id: "CH-TG-005", name: "Combo Lists KSA", platform: "Telegram", subscribers: 32000, status: "flagged", lastActivity: "2026-02-10T12:00:00", leaksDetected: 15, riskLevel: "high" },
  { id: "CH-TG-006", name: "Saudi Gov Leaks حكومي", platform: "Telegram", subscribers: 9500, status: "active", lastActivity: "2026-02-07T09:00:00", leaksDetected: 6, riskLevel: "medium" },
  { id: "CH-TG-007", name: "Banking Data SA", platform: "Telegram", subscribers: 11000, status: "active", lastActivity: "2026-02-06T15:00:00", leaksDetected: 4, riskLevel: "medium" },
  { id: "CH-TG-008", name: "Healthcare Dumps KSA", platform: "Telegram", subscribers: 7500, status: "active", lastActivity: "2026-02-05T11:00:00", leaksDetected: 3, riskLevel: "low" },
];

export const darkWebSources: MonitoringChannel[] = [
  { id: "CH-DW-001", name: "BreachForums — Saudi Section", platform: "Dark Web", subscribers: 0, status: "flagged", lastActivity: "2026-02-10T20:00:00", leaksDetected: 22, riskLevel: "high" },
  { id: "CH-DW-002", name: "XSS.is — KSA Threads", platform: "Dark Web", subscribers: 0, status: "active", lastActivity: "2026-02-09T15:00:00", leaksDetected: 14, riskLevel: "high" },
  { id: "CH-DW-003", name: "Exploit.in — Saudi Market", platform: "Dark Web", subscribers: 0, status: "active", lastActivity: "2026-02-08T12:00:00", leaksDetected: 9, riskLevel: "high" },
  { id: "CH-DW-004", name: "RaidForums Archive — SA", platform: "Dark Web", subscribers: 0, status: "active", lastActivity: "2026-01-15T09:00:00", leaksDetected: 7, riskLevel: "medium" },
  { id: "CH-DW-005", name: "LeakBase — Saudi Data", platform: "Dark Web", subscribers: 0, status: "active", lastActivity: "2026-02-07T18:00:00", leaksDetected: 5, riskLevel: "medium" },
];

export const pasteSources: MonitoringChannel[] = [
  { id: "CH-PS-001", name: "Pastebin — Saudi PII", platform: "Paste", subscribers: 0, status: "active", lastActivity: "2026-02-10T23:00:00", leaksDetected: 11, riskLevel: "high" },
  { id: "CH-PS-002", name: "Ghostbin — KSA Dumps", platform: "Paste", subscribers: 0, status: "active", lastActivity: "2026-02-09T17:00:00", leaksDetected: 6, riskLevel: "medium" },
  { id: "CH-PS-003", name: "PrivateBin — SA Credentials", platform: "Paste", subscribers: 0, status: "active", lastActivity: "2026-02-08T14:00:00", leaksDetected: 4, riskLevel: "medium" },
  { id: "CH-PS-004", name: "JustPaste.it — Saudi Data", platform: "Paste", subscribers: 0, status: "active", lastActivity: "2026-02-06T10:00:00", leaksDetected: 3, riskLevel: "low" },
];

export const piiPatterns: PIIMatch[] = [
  { type: "National ID", typeAr: "رقم الهوية الوطنية", pattern: "1\\d{9}", count: 4850000, sample: "10XXXXXXXX", category: "Identity" },
  { type: "Iqama Number", typeAr: "رقم الإقامة", pattern: "2\\d{9}", count: 1920000, sample: "20XXXXXXXX", category: "Identity" },
  { type: "Saudi Phone", typeAr: "رقم جوال سعودي", pattern: "05\\d{8}", count: 6340000, sample: "05XXXXXXXX", category: "Contact" },
  { type: "Saudi Email", typeAr: "بريد إلكتروني سعودي", pattern: ".*@.*\\.sa", count: 1280000, sample: "user@domain.sa", category: "Contact" },
  { type: "IBAN", typeAr: "رقم الحساب البنكي", pattern: "SA\\d{22}", count: 895000, sample: "SA0000XXXXXXXXXXXX", category: "Financial" },
  { type: "Passport", typeAr: "رقم جواز السفر", pattern: "[A-Z]\\d{8}", count: 750000, sample: "A12345678", category: "Identity" },
  { type: "Arabic Full Name", typeAr: "الاسم الكامل بالعربية", pattern: "NER Detection", count: 5120000, sample: "محمد بن عبدالله", category: "Personal" },
  { type: "Medical Record", typeAr: "سجل طبي", pattern: "MRN-\\d+", count: 2100000, sample: "MRN-XXXXXXX", category: "Health" },
];

export const monthlyTrends = [
  { month: "سبتمبر", monthEn: "Sep", leaks: 8, records: 1850000, telegram: 4, darkweb: 3, paste: 1 },
  { month: "أكتوبر", monthEn: "Oct", leaks: 11, records: 2450000, telegram: 5, darkweb: 4, paste: 2 },
  { month: "نوفمبر", monthEn: "Nov", leaks: 14, records: 3200000, telegram: 7, darkweb: 4, paste: 3 },
  { month: "ديسمبر", monthEn: "Dec", leaks: 9, records: 1920000, telegram: 4, darkweb: 3, paste: 2 },
  { month: "يناير", monthEn: "Jan", leaks: 16, records: 4100000, telegram: 8, darkweb: 5, paste: 3 },
  { month: "فبراير", monthEn: "Feb", leaks: 12, records: 3500000, telegram: 6, darkweb: 4, paste: 2 },
];

export const sectorDistribution = [
  { sector: "حكومة", sectorEn: "Government", count: 28, percentage: 33 },
  { sector: "اتصالات", sectorEn: "Telecom", count: 14, percentage: 16 },
  { sector: "بنوك", sectorEn: "Banking", count: 12, percentage: 14 },
  { sector: "صحة", sectorEn: "Healthcare", count: 10, percentage: 12 },
  { sector: "طاقة", sectorEn: "Energy", count: 8, percentage: 9 },
  { sector: "تعليم", sectorEn: "Education", count: 6, percentage: 7 },
  { sector: "تجزئة", sectorEn: "Retail", count: 4, percentage: 5 },
  { sector: "تأمين", sectorEn: "Insurance", count: 3, percentage: 4 },
];

export const sourceDistribution = [
  { source: "تليجرام", sourceEn: "Telegram", count: 35, percentage: 41 },
  { source: "الدارك ويب", sourceEn: "Dark Web", count: 32, percentage: 38 },
  { source: "مواقع اللصق", sourceEn: "Paste Sites", count: 18, percentage: 21 },
];

export const severityStats = {
  critical: 28,
  high: 24,
  medium: 19,
  low: 14,
};

export const dashboardStats = {
  totalLeaks: 85,
  totalRecords: 28500000,
  activeMonitors: 17,
  piiDetected: 23255000,
  criticalAlerts: 28,
  avgResponseTime: "1.8h",
};

```

---

## `client/src/lib/pdfExport.ts`

```typescript
/**
 * PDF Export utility using html2canvas + jsPDF
 * Handles oklch/oklab color format issues in Tailwind CSS 4
 */
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function sanitizeColorsForCapture(container: HTMLElement): () => void {
  const originals: Array<{ el: HTMLElement; prop: string; value: string }> = [];
  const allElements = container.querySelectorAll("*");
  const colorProps = [
    "color", "backgroundColor", "borderColor", "borderTopColor",
    "borderRightColor", "borderBottomColor", "borderLeftColor",
    "outlineColor", "textDecorationColor", "fill", "stroke",
  ];
  const processElement = (el: HTMLElement) => {
    const computed = getComputedStyle(el);
    for (const prop of colorProps) {
      const val = computed.getPropertyValue(prop);
      if (val && (val.includes("oklch") || val.includes("oklab") || val.includes("color("))) {
        const camelProp = prop.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
        originals.push({ el, prop: camelProp, value: (el.style as any)[camelProp] });
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = val;
          ctx.fillRect(0, 0, 1, 1);
          const imgData2 = ctx.getImageData(0, 0, 1, 1).data;
          const r = imgData2[0], g = imgData2[1], b = imgData2[2], a = imgData2[3];
          (el.style as any)[camelProp] = a < 255 ? `rgba(${r},${g},${b},${(a / 255).toFixed(2)})` : `rgb(${r},${g},${b})`;
        }
      }
    }
  };
  allElements.forEach((el) => processElement(el as HTMLElement));
  processElement(container);
  return () => {
    for (const { el, prop, value } of originals) {
      (el.style as any)[prop] = value;
    }
  };
}

export interface PdfExportOptions {
  filename?: string;
  orientation?: "portrait" | "landscape";
  scale?: number;
  onProgress?: (stage: string) => void;
}

export async function exportElementToPdf(
  elementId: string,
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    filename = `rasid-report-${new Date().toISOString().slice(0, 10)}.pdf`,
    orientation = "portrait",
    scale = 2,
    onProgress,
  } = options;
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);
  onProgress?.("جاري تجهيز الصفحة...");
  const restoreColors = sanitizeColorsForCapture(element);
  try {
    onProgress?.("جاري التقاط الصورة...");
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    onProgress?.("جاري إنشاء PDF...");
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const imgRatio = canvas.height / canvas.width;
    const contentHeight = contentWidth * imgRatio;
    if (contentHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);
    } else {
      let yOffset = 0;
      const pageContentHeight = pageHeight - margin * 2;
      const sourcePageHeight = (pageContentHeight / contentHeight) * canvas.height;
      while (yOffset < canvas.height) {
        if (yOffset > 0) pdf.addPage();
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sourcePageHeight, canvas.height - yOffset);
        const ctx = pageCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, yOffset, canvas.width, pageCanvas.height, 0, 0, pageCanvas.width, pageCanvas.height);
        }
        const sliceData = pageCanvas.toDataURL("image/png");
        const sliceHeight = (pageCanvas.height / canvas.width) * contentWidth;
        pdf.addImage(sliceData, "PNG", margin, margin, contentWidth, sliceHeight);
        yOffset += sourcePageHeight;
      }
    }
    pdf.save(filename);
    onProgress?.("تم التصدير بنجاح");
  } finally {
    restoreColors();
  }
}

```

---

## `client/src/lib/pdfGenerator.ts`

```typescript
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Rasid branding colors
const COLORS = {
  primary: [0, 102, 178] as [number, number, number],     // Blue
  secondary: [212, 175, 55] as [number, number, number],   // Gold
  dark: [30, 41, 59] as [number, number, number],          // Dark blue
  light: [241, 245, 249] as [number, number, number],      // Light gray
  success: [16, 185, 129] as [number, number, number],     // Green
  warning: [245, 158, 11] as [number, number, number],     // Amber
  danger: [239, 68, 68] as [number, number, number],       // Red
  white: [255, 255, 255] as [number, number, number],
  text: [51, 65, 85] as [number, number, number],
};

import { LOGO_FULL_DARK } from "@/lib/rasidAssets";
const LOGO_URL = LOGO_FULL_DARK;

interface ReportData {
  title: string;
  modules: string[];
  data: Record<string, any>;
  dateFrom?: string;
  dateTo?: string;
  generatedBy?: string;
}

export async function generateProfessionalPDF(reportData: ReportData): Promise<Blob> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 0;

  // Helper: Add page header
  const addHeader = () => {
    // Top bar
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, 0, pageWidth, 8, "F");
    doc.setFillColor(...COLORS.secondary);
    doc.rect(0, 8, pageWidth, 2, "F");
  };

  // Helper: Add page footer
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFillColor(...COLORS.dark);
    doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.white);
    doc.text(`${pageNum} / ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: "center" });
    doc.text("RASID Platform - Confidential", margin, pageHeight - 5);
    doc.text(new Date().toLocaleDateString("ar-SA-u-nu-latn"), pageWidth - margin, pageHeight - 5, { align: "right" });
  };

  // Helper: Check page break
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 25) {
      doc.addPage();
      addHeader();
      y = 18;
    }
  };

  // Helper: Add section title
  const addSectionTitle = (title: string) => {
    checkPageBreak(20);
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, "F");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.white);
    doc.text(title, pageWidth - margin - 5, y + 7, { align: "right" });
    y += 15;
  };

  // ========== COVER PAGE ==========
  addHeader();

  // Title area
  y = 50;
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 80, 5, 5, "F");

  // Logo placeholder
  doc.setFillColor(...COLORS.primary);
  doc.circle(pageWidth / 2, y + 20, 15, "F");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.white);
  doc.text("R", pageWidth / 2, y + 25, { align: "center" });

  // Title
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.dark);
  doc.text(reportData.title || "RASID Report", pageWidth / 2, y + 48, { align: "center" });

  // Subtitle
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  doc.text("RASID Platform - Compliance Monitoring", pageWidth / 2, y + 58, { align: "center" });

  // Date range
  if (reportData.dateFrom || reportData.dateTo) {
    doc.setFontSize(10);
    const dateText = `${reportData.dateFrom || "..."} - ${reportData.dateTo || "..."}`;
    doc.text(dateText, pageWidth / 2, y + 68, { align: "center" });
  }

  // Metadata
  y = 145;
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const metaItems = [
    ["Report Date", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
    ["Generated By", reportData.generatedBy || "System"],
    ["Modules", reportData.modules.length.toString()],
    ["Classification", "Confidential"],
  ];
  metaItems.forEach(([label, value], i) => {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(label, pageWidth / 2 + 30, y + i * 8, { align: "right" });
    doc.setTextColor(...COLORS.dark);
    doc.text(value, pageWidth / 2 - 30, y + i * 8);
  });

  addFooter(1, 1); // Will be updated later

  // ========== DATA PAGES ==========
  const data = reportData.data;

  // Module: General Stats
  if (data.general_stats) {
    doc.addPage();
    addHeader();
    y = 18;
    addSectionTitle("General Statistics");
    
    const gs = data.general_stats;
    const statsRows = [
      ["Total Sites", String(gs.totalSites || 0)],
      ["Total Scans", String(gs.totalScans || 0)],
      ["Compliant", String(gs.compliant || 0)],
      ["Partially Compliant", String(gs.partiallyCompliant || 0)],
      ["Non-Compliant", String(gs.nonCompliant || 0)],
      ["No Policy", String(gs.noPolicy || 0)],
      ["Compliance Rate", `${gs.totalSites > 0 ? Math.round((gs.compliant / gs.totalSites) * 100) : 0}%`],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: statsRows,
      theme: "grid",
      margin: { left: margin, right: margin },
      headStyles: { fillColor: COLORS.primary, fontSize: 10, halign: "center" },
      bodyStyles: { fontSize: 10, halign: "center" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { halign: "left", fontStyle: "bold", cellWidth: 80 },
        1: { halign: "center" },
      },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Module: Compliance Breakdown
  if (data.compliance_breakdown) {
    checkPageBreak(50);
    addSectionTitle("Compliance Breakdown");
    
    const cb = data.compliance_breakdown;
    if (Array.isArray(cb) && cb.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Status", "Count", "Percentage"]],
        body: cb.map((item: any) => [
          item.status || item.complianceStatus || "Unknown",
          String(item.count || 0),
          `${item.percentage || 0}%`,
        ]),
        theme: "grid",
        margin: { left: margin, right: margin },
        headStyles: { fillColor: COLORS.primary, fontSize: 10, halign: "center" },
        bodyStyles: { fontSize: 10, halign: "center" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Module: Article 12 Clauses
  if (data.article12_clauses) {
    checkPageBreak(50);
    addSectionTitle("Article 12 Clauses Compliance");
    
    const clauses = data.article12_clauses;
    if (Array.isArray(clauses) && clauses.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Clause", "Compliant", "Total", "Rate"]],
        body: clauses.map((c: any) => [
          `Clause ${c.clause || c.clauseNumber || "?"}`,
          String(c.compliant || 0),
          String(c.total || 0),
          `${c.percentage || c.rate || 0}%`,
        ]),
        theme: "grid",
        margin: { left: margin, right: margin },
        headStyles: { fillColor: COLORS.primary, fontSize: 10, halign: "center" },
        bodyStyles: { fontSize: 10, halign: "center" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data: any) => {
          if (data.section === "body" && data.column.index === 3) {
            const val = parseInt(data.cell.text[0]);
            if (val >= 70) data.cell.styles.textColor = COLORS.success;
            else if (val >= 40) data.cell.styles.textColor = COLORS.warning;
            else data.cell.styles.textColor = COLORS.danger;
          }
        },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Module: Sector Comparison
  if (data.sector_comparison) {
    checkPageBreak(50);
    addSectionTitle("Sector Comparison");
    
    const sectors = data.sector_comparison;
    if (Array.isArray(sectors) && sectors.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Sector", "Total Sites", "Compliant", "Compliance Rate"]],
        body: sectors.map((s: any) => [
          s.sector || s.sectorType || "Unknown",
          String(s.total || s.count || 0),
          String(s.compliant || 0),
          `${s.complianceRate || s.rate || 0}%`,
        ]),
        theme: "grid",
        margin: { left: margin, right: margin },
        headStyles: { fillColor: COLORS.primary, fontSize: 10, halign: "center" },
        bodyStyles: { fontSize: 10, halign: "center" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Module: Category Breakdown
  if (data.category_breakdown) {
    checkPageBreak(50);
    addSectionTitle("Category Breakdown");
    
    const cats = data.category_breakdown;
    if (Array.isArray(cats) && cats.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Category", "Total", "Compliant", "Rate"]],
        body: cats.map((c: any) => [
          c.category || c.classification || "Unknown",
          String(c.total || c.count || 0),
          String(c.compliant || 0),
          `${c.complianceRate || c.rate || 0}%`,
        ]),
        theme: "grid",
        margin: { left: margin, right: margin },
        headStyles: { fillColor: COLORS.primary, fontSize: 10, halign: "center" },
        bodyStyles: { fontSize: 10, halign: "center" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Module: Site Details
  if (data.site_details) {
    checkPageBreak(50);
    addSectionTitle("Site Details");
    
    const sites = data.site_details;
    if (Array.isArray(sites) && sites.length > 0) {
      const siteRows = sites.slice(0, 100).map((s: any) => [
        s.siteName || s.domain || "Unknown",
        s.domain || "",
        s.sectorType === "public" ? "Public" : "Private",
        s.overallScore != null ? `${Math.round(Number(s.overallScore))}%` : "N/A",
        s.complianceStatus || "Unknown",
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Entity", "Domain", "Sector", "Score", "Status"]],
        body: siteRows,
        theme: "grid",
        margin: { left: margin, right: margin },
        headStyles: { fillColor: COLORS.primary, fontSize: 9, halign: "center" },
        bodyStyles: { fontSize: 8, halign: "center" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { halign: "left", cellWidth: 40 },
          1: { halign: "left", cellWidth: 40 },
        },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Update page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

```

---

## `client/src/lib/permissions.ts`

```typescript
/**
 * نظام الصلاحيات المركزي لمنصة راصد
 * يضمن أن root_admin و admin و superadmin لديهم وصول كامل
 */

type UserLike = {
  role?: string;
  rasidRole?: string;
  platformRole?: string;
} | null | undefined;

/** التحقق من أن المستخدم مدير (أي نوع من أنواع المدراء) */
export function isAdminUser(user: UserLike): boolean {
  if (!user) return false;
  const role = user.role?.toLowerCase() || '';
  const rasidRole = user.rasidRole?.toLowerCase() || '';
  const platformRole = (user as any)?.platformRole?.toLowerCase() || '';
  
  const adminRoles = ['admin', 'root_admin', 'superadmin', 'root', 'director'];
  return adminRoles.includes(role) || adminRoles.includes(rasidRole) || adminRoles.includes(platformRole);
}

/** التحقق من أن المستخدم root admin */
export function isRootAdmin(user: UserLike): boolean {
  if (!user) return false;
  const role = user.role?.toLowerCase() || '';
  const rasidRole = user.rasidRole?.toLowerCase() || '';
  return role === 'root_admin' || role === 'superadmin' || rasidRole === 'root_admin' || rasidRole === 'root';
}

/** التحقق من أن المستخدم لديه صلاحية معينة */
export function hasPermission(user: UserLike, _permission: string): boolean {
  // المدراء لديهم كل الصلاحيات
  if (isAdminUser(user)) return true;
  // يمكن توسيع هذا لاحقاً بنظام صلاحيات مفصل
  return false;
}

/** الحصول على اسم الدور بالعربية */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    root_admin: 'مدير النظام الرئيسي',
    root: 'روت راصد',
    superadmin: 'مدير النظام',
    admin: 'مدير',
    director: 'مدير إدارة',
    smart_monitor_manager: 'مدير راصد الذكي',
    monitoring_director: 'مدير إدارة الرصد',
    monitoring_specialist: 'أخصائي رصد',
    monitoring_officer: 'مسؤول رصد',
    manager: 'مدير قسم',
    analyst: 'محلل',
    viewer: 'مشاهد',
    user: 'مستخدم',
  };
  return labels[role] || role;
}

/** الحصول على لون الدور */
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    root_admin: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    root: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    superadmin: 'text-red-400 bg-red-500/10 border-red-500/20',
    admin: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    director: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    smart_monitor_manager: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    monitoring_director: 'text-green-400 bg-green-500/10 border-green-500/20',
    monitoring_specialist: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    monitoring_officer: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    user: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  };
  return colors[role] || colors.user;
}

```

---

## `client/src/lib/rasidAssets.ts`

```typescript
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

```

---

## `client/src/lib/scanSounds.ts`

```typescript
/**
 * Scan Sound Effects - Web Audio API synthesized sounds
 * No external audio files needed - all sounds are generated programmatically
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted: boolean) {
  isMuted = muted;
}

export function getMuted(): boolean {
  return isMuted;
}

// ===== HELPER: Play a tone =====
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
  delay: number = 0,
) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch {
    // Silently fail if audio context is not available
  }
}

// ===== HELPER: Play noise burst =====
function playNoise(duration: number, volume: number = 0.05, delay: number = 0) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime + delay);
  } catch {}
}

// ===== 1. SCAN START - Engine startup whoosh =====
export function playScanStart() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    // Rising sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.4);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
    // Accompanying noise whoosh
    playNoise(0.3, 0.04, 0.05);
    // Confirmation beep
    playTone(880, 0.15, 'sine', 0.08, 0.5);
    playTone(1100, 0.2, 'sine', 0.1, 0.6);
  } catch {}
}

// ===== 2. STAGE COMPLETE - Success chime =====
export function playStageComplete() {
  if (isMuted) return;
  // Two-note ascending chime
  playTone(523, 0.15, 'sine', 0.12, 0);     // C5
  playTone(659, 0.15, 'sine', 0.12, 0.1);   // E5
  playTone(784, 0.25, 'sine', 0.1, 0.2);    // G5
}

// ===== 3. PRIVACY PAGE DISCOVERED - Discovery alert =====
export function playDiscoveryAlert() {
  if (isMuted) return;
  // Magical discovery sound
  playTone(660, 0.12, 'sine', 0.1, 0);
  playTone(880, 0.12, 'sine', 0.1, 0.08);
  playTone(1100, 0.12, 'sine', 0.12, 0.16);
  playTone(1320, 0.3, 'sine', 0.1, 0.24);
  // Sparkle noise
  playNoise(0.15, 0.03, 0.2);
}

// ===== 4. ERROR/FAILURE - Warning sound =====
export function playErrorSound() {
  if (isMuted) return;
  // Low descending tone
  playTone(440, 0.2, 'sawtooth', 0.06, 0);
  playTone(330, 0.3, 'sawtooth', 0.06, 0.15);
}

// ===== 5. SCAN COMPLETE - Victory fanfare =====
export function playScanComplete() {
  if (isMuted) return;
  // Triumphant fanfare
  playTone(523, 0.15, 'sine', 0.12, 0);      // C5
  playTone(659, 0.15, 'sine', 0.12, 0.12);   // E5
  playTone(784, 0.15, 'sine', 0.12, 0.24);   // G5
  playTone(1047, 0.4, 'sine', 0.15, 0.36);   // C6
  // Harmony
  playTone(523, 0.5, 'triangle', 0.06, 0.36); // C5 harmony
  playTone(784, 0.5, 'triangle', 0.06, 0.36); // G5 harmony
  // Sparkle
  playNoise(0.2, 0.03, 0.5);
  playTone(1568, 0.1, 'sine', 0.04, 0.6);
  playTone(2093, 0.15, 'sine', 0.03, 0.7);
}

// ===== 6. CLAUSE PASS - Quick positive beep =====
export function playClausePass() {
  if (isMuted) return;
  playTone(880, 0.08, 'sine', 0.08, 0);
  playTone(1100, 0.12, 'sine', 0.08, 0.06);
}

// ===== 7. CLAUSE FAIL - Quick negative beep =====
export function playClauseFail() {
  if (isMuted) return;
  playTone(440, 0.12, 'triangle', 0.06, 0);
  playTone(350, 0.15, 'triangle', 0.06, 0.08);
}

// ===== 8. SITE COMPLETE - Subtle tick =====
export function playSiteComplete() {
  if (isMuted) return;
  playTone(1200, 0.05, 'sine', 0.05, 0);
}

// ===== 9. SCREENSHOT CAPTURED - Camera shutter =====
export function playScreenshotCapture() {
  if (isMuted) return;
  playNoise(0.08, 0.08, 0);
  playTone(2000, 0.04, 'sine', 0.06, 0.03);
}

// ===== 10. PROGRESS MILESTONE (25%, 50%, 75%) =====
export function playMilestone() {
  if (isMuted) return;
  playTone(660, 0.1, 'sine', 0.1, 0);
  playTone(880, 0.1, 'sine', 0.1, 0.08);
  playTone(660, 0.15, 'sine', 0.08, 0.16);
}

// ===== 11. CONSOLE LOG TICK - Very subtle =====
export function playLogTick() {
  if (isMuted) return;
  playTone(800, 0.02, 'sine', 0.02, 0);
}

```

---

## `client/src/lib/soundManager.ts`

```typescript
/**
 * Sound Manager for Smart Rasid Console
 * Uses Web Audio API to generate cyber-themed sound effects
 * No external audio files needed - all sounds are synthesized
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private _muted: boolean = false;
  private _volume: number = 0.3;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Load preferences from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rasid-sound-prefs");
      if (saved) {
        try {
          const prefs = JSON.parse(saved);
          this._muted = prefs.muted ?? false;
          this._volume = prefs.volume ?? 0.3;
        } catch {}
      }
    }
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  private savePrefs() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "rasid-sound-prefs",
        JSON.stringify({ muted: this._muted, volume: this._volume })
      );
    }
    this.listeners.forEach((fn) => fn());
  }

  get muted() {
    return this._muted;
  }

  get volume() {
    return this._volume;
  }

  setMuted(muted: boolean) {
    this._muted = muted;
    this.savePrefs();
  }

  setVolume(volume: number) {
    this._volume = Math.max(0, Math.min(1, volume));
    this.savePrefs();
  }

  toggleMute() {
    this._muted = !this._muted;
    this.savePrefs();
    return this._muted;
  }

  onChange(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // ─── Typing Sound (keyboard click) ─────────────────────────
  playTyping() {
    if (this._muted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "highpass";
      filter.frequency.value = 2000;

      osc.type = "square";
      osc.frequency.value = 3500 + Math.random() * 1500;

      gain.gain.setValueAtTime(this._volume * 0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    } catch {}
  }

  // ─── Message Received (notification ping) ──────────────────
  playMessageReceived() {
    if (this._muted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(this._volume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  // ─── Alert Sound (critical finding) ────────────────────────
  playAlert() {
    if (this._muted) return;
    try {
      const ctx = this.getContext();

      // Two-tone alert
      for (let i = 0; i < 2; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.value = i === 0 ? 800 : 600;

        const start = ctx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(this._volume * 0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.12);
      }
    } catch {}
  }

  // ─── Success Sound (task completed) ────────────────────────
  playSuccess() {
    if (this._muted) return;
    try {
      const ctx = this.getContext();
      const notes = [523, 659, 784]; // C5, E5, G5

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        const start = ctx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(this._volume * 0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {}
  }

  // ─── Send Message (whoosh) ─────────────────────────────────
  playSend() {
    if (this._muted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(this._volume * 0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }

  // ─── Thinking/Processing (subtle beep loop) ───────────────
  playThinking() {
    if (this._muted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = 440;

      gain.gain.setValueAtTime(this._volume * 0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  // ─── Tool Activation (digital blip) ───────────────────────
  playToolActivation() {
    if (this._muted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "bandpass";
      filter.frequency.value = 1500;
      filter.Q.value = 5;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(this._volume * 0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // ─── Welcome Greeting (warm chime) ────────────────────────
  playGreeting() {
    if (this._muted) return;
    try {
      const ctx = this.getContext();
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        const start = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(this._volume * 0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch {}
  }

  // ─── Error Sound ──────────────────────────────────────────
  playError() {
    if (this._muted) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(this._volume * 0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }
}

// Singleton instance
export const soundManager = new SoundManager();

```

---

## `client/src/lib/trpc.ts`

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers";

export const trpc = createTRPCReact<AppRouter>();

```

---

## `client/src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

---

