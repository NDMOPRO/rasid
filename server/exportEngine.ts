/**
 * Export Engine — CMS Data Export
 * Supports: ZIP (full platform), JSON, XLSX, CSV, PDF
 * Export scopes: full_platform, section, page, single_record, custom_query
 */
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import archiver from "archiver";
import ExcelJS from "exceljs";
import { getDb } from "./db";
import {
  leaks, exportJobs, platformUsers, reports, auditLog,
  knowledgeBase, evidenceChain,
} from "../drizzle/schema";
import { eq, desc, and, like, sql, type SQL } from "drizzle-orm";

// ─── Types ──────────────────────────────────────────────────────
export interface ExportOptions {
  type: "full_platform" | "section" | "page" | "single_record" | "custom_query";
  format: "zip" | "json" | "xlsx" | "csv" | "pdf";
  scope?: string;
  filters?: Record<string, any>;
  userId: number;
  userName: string;
}

export interface ExportResult {
  jobId: string;
  filePath: string;
  totalRecords: number;
}

// ─── Export Directory ───────────────────────────────────────────
const EXPORT_DIR = path.join(process.cwd(), "public", "uploads", "exports");

function ensureExportDir() {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

// ─── Fetch Data by Scope ────────────────────────────────────────
async function fetchLeaks(filters?: Record<string, any>) {
  const db = await getDb();
  if (!db) return [];
  const conditions: SQL[] = [];
  if (filters?.severity) conditions.push(eq(leaks.severity, filters.severity));
  if (filters?.source) conditions.push(eq(leaks.source, filters.source));
  if (filters?.sector) conditions.push(like(leaks.sectorAr, `%${filters.sector}%`));
  if (filters?.publishStatus) conditions.push(eq(leaks.publishStatus, filters.publishStatus));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(leaks).where(where).orderBy(desc(leaks.detectedAt));
}

async function fetchUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: platformUsers.id,
    userId: platformUsers.userId,
    name: platformUsers.name,
    displayName: platformUsers.displayName,
    email: platformUsers.email,
    platformRole: platformUsers.platformRole,
    status: platformUsers.status,
    lastLoginAt: platformUsers.lastLoginAt,
    createdAt: platformUsers.createdAt,
  }).from(platformUsers);
}

async function fetchReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).orderBy(desc(reports.id));
}

async function fetchAuditLog() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLog).orderBy(desc(auditLog.id)).limit(5000);
}

async function fetchKnowledgeBase() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.id));
}

// ─── Write JSON ─────────────────────────────────────────────────
function writeJson(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Write CSV ──────────────────────────────────────────────────
function writeCsv(filePath: string, data: any[]) {
  if (data.length === 0) {
    fs.writeFileSync(filePath, "", "utf-8");
    return;
  }
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(",")
  );
  fs.writeFileSync(filePath, [headers.join(","), ...rows].join("\n"), "utf-8");
}

// ─── Write XLSX ─────────────────────────────────────────────────
async function writeXlsx(filePath: string, data: any[], sheetName: string = "Data") {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  if (data.length === 0) {
    await workbook.xlsx.writeFile(filePath);
    return;
  }
  const headers = Object.keys(data[0]);
  sheet.addRow(headers);
  // Style header row
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A5F" },
  };
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  for (const row of data) {
    sheet.addRow(headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      return typeof val === "object" ? JSON.stringify(val) : val;
    }));
  }

  // Auto-width columns
  headers.forEach((_, i) => {
    const col = sheet.getColumn(i + 1);
    col.width = Math.min(40, Math.max(12, headers[i].length + 4));
  });

  await workbook.xlsx.writeFile(filePath);
}

// ─── Create Full Platform ZIP ───────────────────────────────────
async function createFullPlatformZip(jobId: string): Promise<{ filePath: string; totalRecords: number }> {
  const timestamp = new Date().toISOString().slice(0, 10);
  const zipFileName = `rasid-export-${timestamp}-${jobId.slice(0, 8)}.zip`;
  const zipPath = path.join(EXPORT_DIR, zipFileName);
  const tempDir = path.join(EXPORT_DIR, `temp-${jobId}`);
  fs.mkdirSync(tempDir, { recursive: true });

  let totalRecords = 0;

  // 1. Leaks
  const leaksData = await fetchLeaks();
  totalRecords += leaksData.length;
  const leaksDir = path.join(tempDir, "01_حالات_الرصد");
  fs.mkdirSync(leaksDir, { recursive: true });
  writeJson(path.join(leaksDir, "monitoring_cases.json"), leaksData);
  writeCsv(path.join(leaksDir, "monitoring_cases.csv"), leaksData);
  await writeXlsx(path.join(leaksDir, "monitoring_cases.xlsx"), leaksData, "حالات الرصد");

  // 2. Users
  const usersData = await fetchUsers();
  totalRecords += usersData.length;
  const usersDir = path.join(tempDir, "03_المستخدمين");
  fs.mkdirSync(usersDir, { recursive: true });
  writeJson(path.join(usersDir, "users.json"), usersData);

  // 3. Reports
  const reportsData = await fetchReports();
  totalRecords += reportsData.length;
  const reportsDir = path.join(tempDir, "04_التقارير");
  fs.mkdirSync(reportsDir, { recursive: true });
  writeJson(path.join(reportsDir, "reports.json"), reportsData);

  // 4. Audit Log
  const auditData = await fetchAuditLog();
  totalRecords += auditData.length;
  const auditDir = path.join(tempDir, "05_سجل_التدقيق");
  fs.mkdirSync(auditDir, { recursive: true });
  writeJson(path.join(auditDir, "audit_log.json"), auditData);

  // 5. Knowledge Base
  const kbData = await fetchKnowledgeBase();
  totalRecords += kbData.length;
  const kbDir = path.join(tempDir, "06_قاعدة_المعرفة");
  fs.mkdirSync(kbDir, { recursive: true });
  writeJson(path.join(kbDir, "knowledge_base.json"), kbData);

  // 6. Summary
  writeJson(path.join(tempDir, "export-summary.json"), {
    exportDate: new Date().toISOString(),
    platform: "منصة راصد",
    totalLeaks: leaksData.length,
    totalUsers: usersData.length,
    totalReports: reportsData.length,
    totalAuditEntries: auditData.length,
    totalKnowledgeBase: kbData.length,
  });

  // 7. README
  fs.writeFileSync(path.join(tempDir, "README.md"), `# تصدير منصة راصد\n\nتاريخ التصدير: ${timestamp}\n\nيحتوي هذا الملف على تصدير كامل لبيانات المنصة.\n`, "utf-8");

  // Create ZIP
  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(tempDir, false);
    archive.finalize();
  });

  // Clean up temp dir
  fs.rmSync(tempDir, { recursive: true, force: true });

  return { filePath: `/uploads/exports/${zipFileName}`, totalRecords };
}

// ─── Main Export Function ───────────────────────────────────────
export async function processExport(options: ExportOptions): Promise<ExportResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  ensureExportDir();
  const jobId = randomUUID();

  // Create export job record
  await db.insert(exportJobs).values({
    jobId,
    exportType: options.type,
    exportFormat: options.format,
    scope: options.scope || null,
    filters: options.filters || null,
    status: "processing",
    exportedBy: options.userId,
    exportedByName: options.userName,
    startedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
  });

  try {
    let filePath = "";
    let totalRecords = 0;

    if (options.type === "full_platform") {
      const result = await createFullPlatformZip(jobId);
      filePath = result.filePath;
      totalRecords = result.totalRecords;
    } else {
      // Section/page/single/custom exports
      let data: any[] = [];
      const scope = options.scope || "leaks";

      switch (scope) {
        case "leaks":
          data = await fetchLeaks(options.filters);
          break;
        case "users":
          data = await fetchUsers();
          break;
        case "reports":
          data = await fetchReports();
          break;
        case "audit":
          data = await fetchAuditLog();
          break;
        case "knowledge_base":
          data = await fetchKnowledgeBase();
          break;
        default:
          data = await fetchLeaks(options.filters);
      }

      totalRecords = data.length;
      const timestamp = new Date().toISOString().slice(0, 10);
      const baseName = `rasid-${scope}-${timestamp}-${jobId.slice(0, 8)}`;

      switch (options.format) {
        case "json":
          const jsonPath = path.join(EXPORT_DIR, `${baseName}.json`);
          writeJson(jsonPath, data);
          filePath = `/uploads/exports/${baseName}.json`;
          break;
        case "csv":
          const csvPath = path.join(EXPORT_DIR, `${baseName}.csv`);
          writeCsv(csvPath, data);
          filePath = `/uploads/exports/${baseName}.csv`;
          break;
        case "xlsx":
          const xlsxPath = path.join(EXPORT_DIR, `${baseName}.xlsx`);
          await writeXlsx(xlsxPath, data, scope);
          filePath = `/uploads/exports/${baseName}.xlsx`;
          break;
        case "zip":
          // Wrap single section in ZIP
          const tempDir = path.join(EXPORT_DIR, `temp-${jobId}`);
          fs.mkdirSync(tempDir, { recursive: true });
          writeJson(path.join(tempDir, `${scope}.json`), data);
          writeCsv(path.join(tempDir, `${scope}.csv`), data);
          await writeXlsx(path.join(tempDir, `${scope}.xlsx`), data, scope);

          const zipPath = path.join(EXPORT_DIR, `${baseName}.zip`);
          await new Promise<void>((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver("zip", { zlib: { level: 9 } });
            output.on("close", resolve);
            archive.on("error", reject);
            archive.pipe(output);
            archive.directory(tempDir, false);
            archive.finalize();
          });
          fs.rmSync(tempDir, { recursive: true, force: true });
          filePath = `/uploads/exports/${baseName}.zip`;
          break;
        default:
          filePath = "";
      }
    }

    const fileFullPath = path.join(process.cwd(), "public", filePath);
    const fileSize = fs.existsSync(fileFullPath) ? fs.statSync(fileFullPath).size : 0;

    // Finalize job
    await db.update(exportJobs).set({
      status: "completed",
      totalRecords,
      fileSizeBytes: fileSize,
      fileUrl: filePath,
      completedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    }).where(eq(exportJobs.jobId, jobId));

    return { jobId, filePath, totalRecords };

  } catch (err: any) {
    await db.update(exportJobs).set({
      status: "failed",
      completedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    }).where(eq(exportJobs.jobId, jobId));
    throw err;
  }
}

// ─── Get Export Jobs ────────────────────────────────────────────
export async function getExportJobs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exportJobs).orderBy(desc(exportJobs.id));
}

// ─── Get Export Job Status ──────────────────────────────────────
export async function getExportJobStatus(jobId: string) {
  const db = await getDb();
  if (!db) return null;
  const [job] = await db.select().from(exportJobs).where(eq(exportJobs.jobId, jobId)).limit(1);
  return job || null;
}
