/**
 * Import Engine — CMS Data Import
 * Supports: ZIP (PDPL_Package format), JSON, XLSX, CSV
 * All imported records start as "draft" until admin publishes them
 */
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import AdmZip from "adm-zip";
import ExcelJS from "exceljs";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { getDb } from "./db";
import { leaks, importJobs, sites, privacyDomains } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── Types ──────────────────────────────────────────────────────
export interface ImportResult {
  jobId: string;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  errors: Array<{ record: number; error: string }>;
}

interface RawLeakData {
  leakId?: string;
  title?: string;
  titleAr?: string;
  source?: string;
  severity?: string;
  sector?: string;
  sectorAr?: string;
  piiTypes?: string[] | string;
  recordCount?: number | string;
  status?: string;
  description?: string;
  descriptionAr?: string;
  aiConfidence?: number | string;
  aiSummaryAr?: string;
  sourceUrl?: string;
  threatActor?: string;
  leakPrice?: string;
  breachMethod?: string;
  breachMethodAr?: string;
  region?: string;
  regionAr?: string;
  screenshotUrls?: string[] | string;
  [key: string]: any;
}

// ─── Severity Map (Arabic → English) ────────────────────────────
const severityMap: Record<string, string> = {
  "واسع النطاق": "critical",
  "مرتفع التأثير": "high",
  "متوسط التأثير": "medium",
  "محدود التأثير": "low",
  "critical": "critical",
  "high": "high",
  "medium": "medium",
  "low": "low",
};

const statusMap: Record<string, string> = {
  "جديد": "new",
  "قيد التحليل": "analyzing",
  "موثّق": "documented",
  "تم التوثيق": "reported",
  "new": "new",
  "analyzing": "analyzing",
  "documented": "documented",
  "reported": "reported",
};

const sourceMap: Record<string, string> = {
  "تليجرام": "telegram",
  "دارك ويب": "darkweb",
  "مواقع اللصق": "paste",
  "telegram": "telegram",
  "darkweb": "darkweb",
  "paste": "paste",
};

// ─── Generate Leak ID ───────────────────────────────────────────
function generateLeakId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `LK-${year}-${num}`;
}

// ─── Normalize Raw Data → DB Format ─────────────────────────────
function normalizeLeakData(raw: RawLeakData): any {
  const piiTypes = typeof raw.piiTypes === "string"
    ? raw.piiTypes.split(",").map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(raw.piiTypes) ? raw.piiTypes : [];

  const screenshotUrls = typeof raw.screenshotUrls === "string"
    ? raw.screenshotUrls.split(",").map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(raw.screenshotUrls) ? raw.screenshotUrls : [];

  return {
    leakId: raw.leakId || generateLeakId(),
    title: raw.title || raw.titleAr || "Untitled",
    titleAr: raw.titleAr || raw.title || "بدون عنوان",
    source: (sourceMap[raw.source || ""] || "paste") as "telegram" | "darkweb" | "paste",
    severity: (severityMap[raw.severity || ""] || "medium") as "critical" | "high" | "medium" | "low",
    sector: raw.sector || raw.sectorAr || "أخرى",
    sectorAr: raw.sectorAr || raw.sector || "أخرى",
    piiTypes: piiTypes,
    recordCount: typeof raw.recordCount === "string"
      ? parseInt(raw.recordCount.replace(/,/g, "")) || 0
      : raw.recordCount || 0,
    status: (statusMap[raw.status || ""] || "new") as "new" | "analyzing" | "documented" | "reported",
    description: raw.description || "",
    descriptionAr: raw.descriptionAr || "",
    aiConfidence: typeof raw.aiConfidence === "string"
      ? parseInt(raw.aiConfidence) || null
      : raw.aiConfidence || null,
    aiSummaryAr: raw.aiSummaryAr || null,
    sourceUrl: raw.sourceUrl || null,
    threatActor: raw.threatActor || null,
    leakPrice: raw.leakPrice || null,
    breachMethod: raw.breachMethod || null,
    breachMethodAr: raw.breachMethodAr || null,
    region: raw.region || null,
    regionAr: raw.regionAr || null,
    screenshotUrls: screenshotUrls,
    sampleData: raw.sampleData || null,
    publishStatus: "draft" as const,
  };
}

// ─── Parse JSON File ────────────────────────────────────────────
async function parseJsonFile(filePath: string): Promise<RawLeakData[]> {
  const content = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(content);
  return Array.isArray(data) ? data : [data];
}

// ─── Parse CSV File ─────────────────────────────────────────────
async function parseCsvFile(filePath: string): Promise<RawLeakData[]> {
  return new Promise((resolve, reject) => {
    const results: RawLeakData[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row: any) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// ─── Parse XLSX File ────────────────────────────────────────────
async function parseXlsxFile(filePath: string): Promise<RawLeakData[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headers: string[] = [];
  const results: RawLeakData[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell) => {
        headers.push(String(cell.value || "").trim());
      });
    } else {
      const obj: any = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) obj[header] = cell.value;
      });
      results.push(obj);
    }
  });

  return results;
}

// ─── Parse ZIP (PDPL_Package format) ────────────────────────────
async function parseZipFile(filePath: string): Promise<{ records: RawLeakData[]; images: Map<string, Buffer[]> }> {
  const zip = new AdmZip(filePath);
  const entries = zip.getEntries();
  const records: RawLeakData[] = [];
  const images = new Map<string, Buffer[]>();

  for (const entry of entries) {
    const name = entry.entryName.toLowerCase();

    // Parse JSON files
    if (name.endsWith(".json") && !name.includes("__macosx")) {
      try {
        const content = entry.getData().toString("utf-8");
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          records.push(...data);
        } else {
          records.push(data);
        }
      } catch { /* skip invalid JSON */ }
    }

    // Parse CSV files
    if (name.endsWith(".csv") && !name.includes("__macosx")) {
      try {
        const content = entry.getData().toString("utf-8");
        const parsed = await new Promise<RawLeakData[]>((resolve, reject) => {
          const results: RawLeakData[] = [];
          Readable.from(content)
            .pipe(csvParser())
            .on("data", (row: any) => results.push(row))
            .on("end", () => resolve(results))
            .on("error", reject);
        });
        records.push(...parsed);
      } catch { /* skip invalid CSV */ }
    }

    // Collect images
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(name) && !name.includes("__macosx")) {
      const parts = entry.entryName.split("/");
      // Try to extract leak ID from folder name
      const leakFolder = parts.find((p) => /^LK-/i.test(p)) || parts[parts.length - 2] || "unknown";
      const existing = images.get(leakFolder) || [];
      existing.push(entry.getData());
      images.set(leakFolder, existing);
    }
  }

  return { records, images };
}

// ─── Save Evidence Images ───────────────────────────────────────
async function saveEvidenceImages(leakId: string, imageBuffers: Buffer[]): Promise<string[]> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "evidence", leakId);
  fs.mkdirSync(uploadDir, { recursive: true });

  const urls: string[] = [];
  for (let i = 0; i < imageBuffers.length; i++) {
    const fileName = `screenshot_${i + 1}.png`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, imageBuffers[i]);
    urls.push(`/uploads/evidence/${leakId}/${fileName}`);
  }
  return urls;
}

// ─── Main Import Function ───────────────────────────────────────
export async function processImport(
  filePath: string,
  fileType: "zip" | "json" | "xlsx" | "csv",
  userId: number,
  userName: string
): Promise<ImportResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const jobId = randomUUID();
  const fileSize = fs.statSync(filePath).size;

  // Create import job record
  await db.insert(importJobs).values({
    jobId,
    fileName: path.basename(filePath),
    fileType,
    fileSizeBytes: fileSize,
    status: "processing",
    importedBy: userId,
    importedByName: userName,
    startedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
  });

  const errors: Array<{ record: number; error: string }> = [];
  let totalRecords = 0;
  let successRecords = 0;
  let failedRecords = 0;

  try {
    let rawRecords: RawLeakData[] = [];
    let imageMap = new Map<string, Buffer[]>();

    switch (fileType) {
      case "json":
        rawRecords = await parseJsonFile(filePath);
        break;
      case "csv":
        rawRecords = await parseCsvFile(filePath);
        break;
      case "xlsx":
        rawRecords = await parseXlsxFile(filePath);
        break;
      case "zip":
        const zipResult = await parseZipFile(filePath);
        rawRecords = zipResult.records;
        imageMap = zipResult.images;
        break;
    }

    totalRecords = rawRecords.length;

    // Update job with total
    await db.update(importJobs)
      .set({ totalRecords })
      .where(eq(importJobs.jobId, jobId));

    // Process each record
    for (let i = 0; i < rawRecords.length; i++) {
      try {
        const normalized = normalizeLeakData(rawRecords[i]);

        // Check for associated images
        const leakImages = imageMap.get(normalized.leakId) || [];
        if (leakImages.length > 0) {
          const imageUrls = await saveEvidenceImages(normalized.leakId, leakImages);
          normalized.screenshotUrls = [
            ...(normalized.screenshotUrls || []),
            ...imageUrls,
          ];
        }

        await db.insert(leaks).values(normalized);
        successRecords++;

        // Update progress every 10 records
        if ((i + 1) % 10 === 0) {
          await db.update(importJobs)
            .set({ processedRecords: i + 1, successRecords, failedRecords })
            .where(eq(importJobs.jobId, jobId));
        }
      } catch (err: any) {
        failedRecords++;
        errors.push({ record: i + 1, error: err.message || "Unknown error" });
      }
    }

    // Finalize job
    await db.update(importJobs).set({
      status: failedRecords === totalRecords ? "failed" : "completed",
      processedRecords: totalRecords,
      successRecords,
      failedRecords,
      errorLog: errors.length > 0 ? errors : null,
      completedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    }).where(eq(importJobs.jobId, jobId));

  } catch (err: any) {
    await db.update(importJobs).set({
      status: "failed",
      errorLog: [{ record: 0, error: err.message }],
      completedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    }).where(eq(importJobs.jobId, jobId));

    throw err;
  } finally {
    // Clean up temp file
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }
  }

  return { jobId, totalRecords, successRecords, failedRecords, errors };
}

// ─── Privacy Domain Import ──────────────────────────────────────
interface RawPrivacyData {
  [key: string]: any;
}

/**
 * Arabic column header → privacyDomains field mapping
 * Supports both Arabic headers (from Excel/CSV) and English field names
 */
const arabicToFieldMap: Record<string, string> = {
  // Arabic headers
  "النطاق": "domain",
  "الحالة": "status",
  "الرابط الفعال": "workingUrl",
  "اسم الموقع بالعربية": "nameAr",
  "اسم الموقع بالإنجليزية": "nameEn",
  "العنوان": "title",
  "الوصف": "description",
  "الفئة": "category",
  "البريد الإلكتروني": "email",
  "أرقام الهاتف": "phone",
  "سجلات MX": "mxRecords",
  "نظام إدارة المحتوى": "cms",
  "حالة SSL": "sslStatus",
  "رابط السياسة": "policyUrl",
  "عنوان السياسة": "policyTitle",
  "كود الحالة": "policyStatusCode",
  "لغة السياسة": "policyLanguage",
  "اسم الجهة": "entityName",
  "البريد": "entityEmail",
  "الهاتف": "entityPhone",
  "مسؤول حماية البيانات": "dpo",
  "نموذج الاتصال": "contactForm",
  "طريقة الاكتشاف": "discoveryMethod",
  "مسار لقطة الشاشة": "screenshotUrl",
  "مسار النص الكامل": "fullTextPath",
  // English aliases
  "domain": "domain",
  "status": "status",
  "workingUrl": "workingUrl",
  "working_url": "workingUrl",
  "nameAr": "nameAr",
  "name_ar": "nameAr",
  "nameEn": "nameEn",
  "name_en": "nameEn",
  "name": "nameAr",
  "title": "title",
  "description": "description",
  "category": "category",
  "email": "email",
  "phone": "phone",
  "mxRecords": "mxRecords",
  "mx_records": "mxRecords",
  "cms": "cms",
  "sslStatus": "sslStatus",
  "ssl_status": "sslStatus",
  "policyUrl": "policyUrl",
  "policy_url": "policyUrl",
  "policyTitle": "policyTitle",
  "policy_title": "policyTitle",
  "policyStatusCode": "policyStatusCode",
  "policy_status_code": "policyStatusCode",
  "policyLanguage": "policyLanguage",
  "policy_language": "policyLanguage",
  "entityName": "entityName",
  "entity_name": "entityName",
  "entityEmail": "entityEmail",
  "entity_email": "entityEmail",
  "entityPhone": "entityPhone",
  "entity_phone": "entityPhone",
  "dpo": "dpo",
  "contactForm": "contactForm",
  "contact_form": "contactForm",
  "discoveryMethod": "discoveryMethod",
  "discovery_method": "discoveryMethod",
  "screenshotUrl": "screenshotUrl",
  "screenshot_url": "screenshotUrl",
  "fullTextPath": "fullTextPath",
  "full_text_path": "fullTextPath",
  "url": "workingUrl",
  "sectorType": "category",
  "sector_type": "category",
  "classification": "classification",
  // Additional columns from full Excel exports
  "finalUrl": "finalUrl",
  "final_url": "finalUrl",
  "الرابط النهائي": "finalUrl",
  "httpsWww": "httpsWww",
  "https_www": "httpsWww",
  "httpsNoWww": "httpsNoWww",
  "https_no_www": "httpsNoWww",
  "httpWww": "httpWww",
  "http_www": "httpWww",
  "httpNoWww": "httpNoWww",
  "http_no_www": "httpNoWww",
  "policyFinalUrl": "policyFinalUrl",
  "policy_final_url": "policyFinalUrl",
  "crawlStatus": "crawlStatus",
  "crawl_status": "crawlStatus",
  "internalLinks": "internalLinks",
  "internal_links": "internalLinks",
  "policyLastUpdate": "policyLastUpdate",
  "policy_last_update": "policyLastUpdate",
  "policyConfidence": "policyConfidence",
  "policy_confidence": "policyConfidence",
  "policyWordCount": "policyWordCount",
  "policy_word_count": "policyWordCount",
  "policyCharCount": "policyCharCount",
  "policy_char_count": "policyCharCount",
  "robotsStatus": "robotsStatus",
  "robots_status": "robotsStatus",
  "entityAddress": "entityAddress",
  "entity_address": "entityAddress",
  "complianceScore": "complianceScore",
  "compliance_score": "complianceScore",
  "complianceStatus": "complianceStatus",
  "compliance_status": "complianceStatus",
  "التصنيف": "classification",
  "حالة الزحف": "crawlStatus",
  "درجة الامتثال": "complianceScore",
  "حالة الامتثال": "complianceStatus",
  "عنوان الجهة": "entityAddress",
};

function normalizePrivacyData(raw: RawPrivacyData): Record<string, any> {
  // Map raw keys (Arabic or English) to normalized field names
  const mapped: Record<string, any> = {};
  for (const [key, value] of Object.entries(raw)) {
    const trimmedKey = String(key).trim();
    const field = arabicToFieldMap[trimmedKey];
    if (field && value !== null && value !== undefined && String(value).trim() !== "") {
      mapped[field] = String(value).trim();
    }
  }

  // Clean domain
  let domain = (mapped.domain || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim();

  return {
    domain: domain || null,
    status: mapped.status || null,
    workingUrl: mapped.workingUrl || (domain ? `https://${domain}` : null),
    finalUrl: mapped.finalUrl || null,
    nameAr: mapped.nameAr || null,
    nameEn: mapped.nameEn || null,
    title: mapped.title || null,
    description: mapped.description || null,
    category: mapped.category || null,
    email: mapped.email || null,
    phone: mapped.phone || null,
    mxRecords: mapped.mxRecords || null,
    cms: mapped.cms || null,
    sslStatus: mapped.sslStatus || null,
    policyUrl: mapped.policyUrl || null,
    policyTitle: mapped.policyTitle || null,
    policyStatusCode: mapped.policyStatusCode || null,
    policyLanguage: mapped.policyLanguage || null,
    policyLastUpdate: mapped.policyLastUpdate || null,
    discoveryMethod: mapped.discoveryMethod || null,
    policyConfidence: mapped.policyConfidence || null,
    policyWordCount: mapped.policyWordCount ? parseInt(mapped.policyWordCount, 10) || null : null,
    policyCharCount: mapped.policyCharCount ? parseInt(mapped.policyCharCount, 10) || null : null,
    robotsStatus: mapped.robotsStatus || null,
    entityName: mapped.entityName || null,
    entityEmail: mapped.entityEmail || null,
    entityPhone: mapped.entityPhone || null,
    entityAddress: mapped.entityAddress || null,
    dpo: mapped.dpo || null,
    contactForm: mapped.contactForm || null,
    complianceScore: mapped.complianceScore ? parseInt(mapped.complianceScore, 10) || 0 : 0,
    complianceStatus: mapped.complianceStatus || null,
    screenshotUrl: mapped.screenshotUrl || null,
    classification: mapped.classification || null,
    httpsWww: mapped.httpsWww || null,
    httpsNoWww: mapped.httpsNoWww || null,
    httpWww: mapped.httpWww || null,
    httpNoWww: mapped.httpNoWww || null,
    policyFinalUrl: mapped.policyFinalUrl || null,
    internalLinks: mapped.internalLinks || null,
    crawlStatus: mapped.crawlStatus || null,
    fullTextPath: mapped.fullTextPath || null,
  };
}

export async function processPrivacyImport(
  filePath: string,
  fileType: "json" | "xlsx" | "csv",
  userId: number,
  userName: string
): Promise<ImportResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const jobId = randomUUID();
  const fileSize = fs.statSync(filePath).size;

  await db.insert(importJobs).values({
    jobId,
    fileName: path.basename(filePath),
    fileType,
    fileSizeBytes: fileSize,
    status: "processing",
    importedBy: userId,
    importedByName: userName,
    startedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
  });

  const errors: Array<{ record: number; error: string }> = [];
  let totalRecords = 0;
  let successRecords = 0;
  let failedRecords = 0;

  try {
    let rawRecords: RawPrivacyData[] = [];

    switch (fileType) {
      case "json":
        rawRecords = await parseJsonFile(filePath);
        break;
      case "csv":
        rawRecords = await parseCsvFile(filePath);
        break;
      case "xlsx":
        rawRecords = await parseXlsxFile(filePath);
        break;
    }

    totalRecords = rawRecords.length;

    await db.update(importJobs)
      .set({ totalRecords })
      .where(eq(importJobs.jobId, jobId));

    // Batch insert with ALL columns explicit (no DEFAULT keyword)
    const BATCH_SIZE = 200;
    for (let i = 0; i < rawRecords.length; i += BATCH_SIZE) {
      const batch = rawRecords.slice(i, i + BATCH_SIZE);
      const validRows: Array<Record<string, any>> = [];

      for (let j = 0; j < batch.length; j++) {
        const recordIndex = i + j + 1;
        try {
          const normalized = normalizePrivacyData(batch[j]);
          if (!normalized.domain) {
            throw new Error("النطاق مطلوب — العمود الإلزامي الوحيد");
          }
          validRows.push({ ...normalized, _idx: recordIndex });
        } catch (err: any) {
          failedRecords++;
          errors.push({ record: recordIndex, error: err.message || "Unknown error" });
        }
      }

      if (validRows.length === 0) continue;

      // Build Drizzle values with ALL columns explicit to avoid DEFAULT keyword
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      const drizzleValues = validRows.map((row) => ({
        domain: row.domain,
        status: row.status ?? null,
        workingUrl: row.workingUrl ?? null,
        finalUrl: row.finalUrl ?? null,
        nameAr: row.nameAr ?? null,
        nameEn: row.nameEn ?? null,
        title: row.title ?? null,
        description: row.description ?? null,
        category: row.category ?? null,
        cms: row.cms ?? null,
        sslStatus: row.sslStatus ?? null,
        mxRecords: row.mxRecords ?? null,
        email: row.email ?? null,
        phone: row.phone ?? null,
        policyUrl: row.policyUrl ?? null,
        policyTitle: row.policyTitle ?? null,
        policyStatusCode: row.policyStatusCode ?? null,
        policyLanguage: row.policyLanguage ?? null,
        policyLastUpdate: row.policyLastUpdate ?? null,
        discoveryMethod: row.discoveryMethod ?? null,
        policyConfidence: row.policyConfidence ?? null,
        policyWordCount: row.policyWordCount ?? null,
        policyCharCount: row.policyCharCount ?? null,
        robotsStatus: row.robotsStatus ?? null,
        entityName: row.entityName ?? null,
        entityEmail: row.entityEmail ?? null,
        entityPhone: row.entityPhone ?? null,
        entityAddress: row.entityAddress ?? null,
        dpo: row.dpo ?? null,
        contactForm: row.contactForm ?? null,
        mentionsDataTypes: 0,
        dataTypesList: null as string | null,
        mentionsPurpose: 0,
        purposeList: null as string | null,
        mentionsLegalBasis: 0,
        mentionsRights: 0,
        rightsList: null as string | null,
        mentionsRetention: 0,
        mentionsThirdParties: 0,
        thirdPartiesList: null as string | null,
        mentionsCrossBorder: 0,
        mentionsSecurity: 0,
        mentionsCookies: 0,
        mentionsChildren: 0,
        complianceScore: row.complianceScore ?? 0,
        complianceStatus: row.complianceStatus ?? null,
        screenshotUrl: row.screenshotUrl ?? null,
        httpsWww: row.httpsWww ?? null,
        httpsNoWww: row.httpsNoWww ?? null,
        httpWww: row.httpWww ?? null,
        httpNoWww: row.httpNoWww ?? null,
        classification: row.classification ?? null,
        policyFinalUrl: row.policyFinalUrl ?? null,
        internalLinks: row.internalLinks ?? null,
        crawlStatus: row.crawlStatus ?? null,
        fullTextPath: row.fullTextPath ?? null,
        importedAt: now,
        lastScanAt: null as string | null,
        scanRunId: null as number | null,
      }));

      try {
        await db.insert(privacyDomains).values(drizzleValues);
        successRecords += validRows.length;
      } catch (batchErr: any) {
        // If batch fails, fallback to one-by-one inserts
        for (let k = 0; k < drizzleValues.length; k++) {
          try {
            await db.insert(privacyDomains).values(drizzleValues[k]);
            successRecords++;
          } catch (err: any) {
            failedRecords++;
            errors.push({ record: validRows[k]._idx, error: err.message || "Unknown error" });
          }
        }
      }

      // Update progress every batch
      await db.update(importJobs)
        .set({ processedRecords: Math.min(i + BATCH_SIZE, totalRecords), successRecords, failedRecords })
        .where(eq(importJobs.jobId, jobId));
    }

    await db.update(importJobs).set({
      status: failedRecords === totalRecords ? "failed" : "completed",
      processedRecords: totalRecords,
      successRecords,
      failedRecords,
      errorLog: errors.length > 0 ? errors : null,
      completedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    }).where(eq(importJobs.jobId, jobId));

  } catch (err: any) {
    await db.update(importJobs).set({
      status: "failed",
      errorLog: [{ record: 0, error: err.message }],
      completedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    }).where(eq(importJobs.jobId, jobId));
    throw err;
  } finally {
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }
  }

  return { jobId, totalRecords, successRecords, failedRecords, errors };
}

// ─── Get Import Jobs ────────────────────────────────────────────
export async function getImportJobs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(importJobs).orderBy(importJobs.id);
}

// ─── Get Import Job Status ──────────────────────────────────────
export async function getImportJobStatus(jobId: string) {
  const db = await getDb();
  if (!db) return null;
  const [job] = await db.select().from(importJobs).where(eq(importJobs.jobId, jobId)).limit(1);
  return job || null;
}
