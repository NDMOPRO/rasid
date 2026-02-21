/**
 * API-16: Chart PNG Persistence
 * حفظ المخططات كـ PNG وتقديمها عبر مسار ثابت
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const CHARTS_DIR = path.join(process.cwd(), "public", "uploads", "charts");

/**
 * Ensure charts directory exists
 */
function ensureChartsDir(): void {
  if (!fs.existsSync(CHARTS_DIR)) {
    fs.mkdirSync(CHARTS_DIR, { recursive: true });
  }
}

/**
 * Generate a unique chart filename
 */
function generateChartFilename(chartType: string, dataType: string): string {
  const timestamp = Date.now();
  const hash = crypto.randomBytes(4).toString("hex");
  return `chart_${chartType}_${dataType}_${timestamp}_${hash}.json`;
}

/**
 * Save chart configuration to disk for later rendering
 * Returns the URL path to access the chart
 */
export function persistChartConfig(
  chartConfig: any,
  chartType: string,
  dataType: string,
  insights?: string[],
  summary?: string
): { chartId: string; chartUrl: string; configPath: string } {
  ensureChartsDir();

  const filename = generateChartFilename(chartType, dataType);
  const chartId = filename.replace(".json", "");
  const filePath = path.join(CHARTS_DIR, filename);

  const chartPayload = {
    chartId,
    chartConfig,
    chartType,
    dataType,
    insights: insights || [],
    summary: summary || "",
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(filePath, JSON.stringify(chartPayload, null, 2), "utf-8");

  const chartUrl = `/uploads/charts/${filename}`;

  return { chartId, chartUrl, configPath: filePath };
}

/**
 * Load a persisted chart config by ID
 */
export function loadChartConfig(chartId: string): any | null {
  const filename = chartId.endsWith(".json") ? chartId : `${chartId}.json`;
  const filePath = path.join(CHARTS_DIR, filename);

  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * List all persisted charts
 */
export function listCharts(): Array<{ chartId: string; chartUrl: string; createdAt: string }> {
  ensureChartsDir();

  const files = fs.readdirSync(CHARTS_DIR).filter(f => f.endsWith(".json"));
  return files.map(f => {
    try {
      const raw = fs.readFileSync(path.join(CHARTS_DIR, f), "utf-8");
      const data = JSON.parse(raw);
      return {
        chartId: data.chartId || f.replace(".json", ""),
        chartUrl: `/uploads/charts/${f}`,
        createdAt: data.createdAt || "",
      };
    } catch {
      return { chartId: f.replace(".json", ""), chartUrl: `/uploads/charts/${f}`, createdAt: "" };
    }
  });
}

/**
 * Delete old charts (retention cleanup)
 */
export function cleanupOldCharts(maxAgeDays: number = 30): number {
  ensureChartsDir();

  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(CHARTS_DIR).filter(f => f.endsWith(".json"));
  let deleted = 0;

  for (const file of files) {
    const filePath = path.join(CHARTS_DIR, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    } catch {
      // skip
    }
  }

  return deleted;
}
