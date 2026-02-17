/**
 * Professional Excel Export Helper for RASID Platform
 * Creates beautifully formatted Arabic RTL Excel files with:
 * - Rasid logo header
 * - Export date (Hijri + Gregorian)
 * - Employee name and job title
 * - Professional styling with branded colors
 * - Arabic encoding support (UTF-8)
 */
import ExcelJS from "exceljs";

// Transparent PNG logo for Excel documents
const RASID_LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/LnmTJuRvbpTTsXZh.png";

const BRAND_COLORS = {
  primary: "FF0D4F8B",      // Rasid blue
  primaryLight: "FFE8F0FE",  // Light blue bg
  headerBg: "FF0D4F8B",     // Header background
  headerText: "FFFFFFFF",   // White header text
  altRowBg: "FFF0F4F8",     // Alternating row bg
  borderColor: "FFD0D5DD",  // Cell border
  compliant: "FF16A34A",    // Green
  nonCompliant: "FFDC2626", // Red
  partial: "FFD97706",      // Amber
  noPolicy: "FF6B7280",     // Gray
  textDark: "FF1F2937",     // Dark text
  textMuted: "FF6B7280",    // Muted text
  footerBg: "FFF8FAFC",     // Footer bg
};

const RASID_ROLE_LABELS: Record<string, string> = {
  root: "مسؤول النظام الرئيسي",
  admin: "مدير النظام",
  smart_monitor_manager: "مدير منصة راصد الذكي",
  monitoring_director: "مدير الرصد",
  monitoring_specialist: "أخصائي رصد",
  monitoring_officer: "مسؤول رصد",
  requester: "مقدم طلب",
  respondent: "مستجيب",
  ndmo_desk: "مكتب NDMO",
  legal_advisor: "مستشار قانوني",
  director: "مدير",
  board_secretary: "أمين مجلس",
  auditor: "مدقق",
};

const STATUS_MAP: Record<string, string> = {
  compliant: "ممتثل",
  partially_compliant: "ممتثل جزئياً",
  non_compliant: "غير ممتثل",
  no_policy: "غير ممتثل",
  not_working: "لا يعمل",
};

let cachedLogoBuffer: Uint8Array | null = null;

async function fetchLogo(): Promise<Uint8Array | null> {
  if (cachedLogoBuffer) return cachedLogoBuffer;
  try {
    const response = await fetch(RASID_LOGO_URL);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    cachedLogoBuffer = new Uint8Array(arrayBuffer);
    return cachedLogoBuffer;
  } catch {
    return null;
  }
}

function getArabicDate(): string {
  const now = new Date();
  const gregorian = now.toLocaleDateString("ar-SA-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
    calendar: "gregory",
  });
  let hijri = "";
  try {
    hijri = now.toLocaleDateString("ar-SA-u-nu-latn", {
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "islamic-umalqura",
    });
  } catch {
    hijri = "";
  }
  const time = now.toLocaleTimeString("ar-SA-u-nu-latn", { hour: "2-digit", minute: "2-digit" });
  return hijri ? `${gregorian} | ${hijri} | ${time}` : `${gregorian} | ${time}`;
}

export interface ExcelExportOptions {
  title: string;
  subtitle?: string;
  userName: string;
  userRole: string;
  sheets: ExcelSheetData[];
}

export interface ExcelSheetData {
  name: string;
  columns: { header: string; key: string; width: number }[];
  rows: Record<string, any>[];
  summaryRow?: Record<string, any>;
}

export async function createProfessionalExcel(options: ExcelExportOptions): Promise<Buffer> {
  const { title, subtitle, userName, userRole, sheets } = options;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "منصة راصد";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Fetch logo
  const logoBuffer = await fetchLogo();

  const roleLabel = RASID_ROLE_LABELS[userRole] || userRole || "مستخدم";
  const dateStr = getArabicDate();

  for (const sheetData of sheets) {
    const ws = workbook.addWorksheet(sheetData.name, {
      views: [{ rightToLeft: true }],
      properties: { defaultColWidth: 15 },
    });

    const colCount = sheetData.columns.length;

    // ===== HEADER SECTION (Rows 1-7) =====
    // Row 1-3: Logo area + Title
    ws.mergeCells(1, 1, 3, colCount);
    const titleCell = ws.getCell(1, 1);
    titleCell.value = "";
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLORS.primaryLight } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Add logo if available
    if (logoBuffer) {
      const imageId = workbook.addImage({ buffer: logoBuffer as any, extension: "png" });
      ws.addImage(imageId, {
        tl: { col: colCount - 2.5, row: 0.2 },
        ext: { width: 160, height: 55 },
      });
    }

    // Row 1 height for logo
    ws.getRow(1).height = 25;
    ws.getRow(2).height = 25;
    ws.getRow(3).height = 20;

    // Row 4: Title
    ws.mergeCells(4, 1, 4, colCount);
    const titleRow = ws.getRow(4);
    titleRow.getCell(1).value = title;
    titleRow.getCell(1).font = { bold: true, size: 16, name: "Arial", color: { argb: BRAND_COLORS.primary } };
    titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    titleRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLORS.primaryLight } };
    titleRow.height = 30;

    // Row 5: Subtitle or description
    ws.mergeCells(5, 1, 5, colCount);
    const subtitleRow = ws.getRow(5);
    subtitleRow.getCell(1).value = subtitle || "تقرير مُصدَّر من منصة راصد لرصد الامتثال";
    subtitleRow.getCell(1).font = { size: 10, name: "Arial", color: { argb: BRAND_COLORS.textMuted } };
    subtitleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    subtitleRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLORS.primaryLight } };
    subtitleRow.height = 20;

    // Row 6: Export date + Employee info
    ws.mergeCells(6, 1, 6, colCount);
    const infoRow = ws.getRow(6);
    infoRow.getCell(1).value = `تاريخ التصدير: ${dateStr}  |  المصدِّر: ${userName} - ${roleLabel}`;
    infoRow.getCell(1).font = { size: 10, name: "Arial", color: { argb: BRAND_COLORS.textMuted }, italic: true };
    infoRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    infoRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLORS.primaryLight } };
    infoRow.height = 22;

    // Row 7: Separator
    ws.mergeCells(7, 1, 7, colCount);
    ws.getRow(7).height = 5;
    ws.getRow(7).getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLORS.primary } };

    // ===== DATA HEADER (Row 8) =====
    ws.columns = sheetData.columns.map((col) => ({
      key: col.key,
      width: col.width,
    }));

    const headerRow = ws.getRow(8);
    sheetData.columns.forEach((col, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = col.header;
      cell.font = { bold: true, size: 12, name: "Arial", color: { argb: BRAND_COLORS.headerText } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLORS.headerBg } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: BRAND_COLORS.borderColor } },
        bottom: { style: "thin", color: { argb: BRAND_COLORS.borderColor } },
        left: { style: "thin", color: { argb: BRAND_COLORS.borderColor } },
        right: { style: "thin", color: { argb: BRAND_COLORS.borderColor } },
      };
    });
    headerRow.height = 30;

    // ===== DATA ROWS =====
    sheetData.rows.forEach((row, rowIdx) => {
      const dataRow = ws.getRow(9 + rowIdx);
      sheetData.columns.forEach((col, colIdx) => {
        const cell = dataRow.getCell(colIdx + 1);
        cell.value = row[col.key] ?? "";
        cell.font = { size: 11, name: "Arial", color: { argb: BRAND_COLORS.textDark } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: BRAND_COLORS.borderColor } },
          bottom: { style: "thin", color: { argb: BRAND_COLORS.borderColor } },
          left: { style: "thin", color: { argb: BRAND_COLORS.borderColor } },
          right: { style: "thin", color: { argb: BRAND_COLORS.borderColor } },
        };

        // Alternating row colors
        if (rowIdx % 2 === 0) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLORS.altRowBg } };
        }

        // Color compliance status cells
        const val = String(cell.value);
        if (val === "ممتثل") {
          cell.font = { bold: true, size: 11, name: "Arial", color: { argb: BRAND_COLORS.compliant } };
        } else if (val === "غير ممتثل") {
          cell.font = { bold: true, size: 11, name: "Arial", color: { argb: BRAND_COLORS.nonCompliant } };
        } else if (val === "ممتثل جزئياً") {
          cell.font = { bold: true, size: 11, name: "Arial", color: { argb: BRAND_COLORS.partial } };
        } else if (val === "لا يعمل") {
          cell.font = { bold: true, size: 11, name: "Arial", color: { argb: BRAND_COLORS.noPolicy } };
        }
      });
      dataRow.height = 24;
    });

    // ===== SUMMARY ROW =====
    if (sheetData.summaryRow) {
      const summaryRowNum = 9 + sheetData.rows.length;
      const sRow = ws.getRow(summaryRowNum);
      sheetData.columns.forEach((col, colIdx) => {
        const cell = sRow.getCell(colIdx + 1);
        cell.value = sheetData.summaryRow![col.key] ?? "";
        cell.font = { bold: true, size: 12, name: "Arial", color: { argb: BRAND_COLORS.primary } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLORS.primaryLight } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "medium", color: { argb: BRAND_COLORS.primary } },
          bottom: { style: "medium", color: { argb: BRAND_COLORS.primary } },
          left: { style: "thin", color: { argb: BRAND_COLORS.borderColor } },
          right: { style: "thin", color: { argb: BRAND_COLORS.borderColor } },
        };
      });
      sRow.height = 28;
    }

    // ===== FOOTER =====
    const footerRowNum = 9 + sheetData.rows.length + (sheetData.summaryRow ? 1 : 0) + 1;
    ws.mergeCells(footerRowNum, 1, footerRowNum, colCount);
    const footerRow = ws.getRow(footerRowNum);
    footerRow.getCell(1).value = "© منصة راصد - جميع الحقوق محفوظة | هذا التقرير سري ومخصص للاستخدام الداخلي فقط";
    footerRow.getCell(1).font = { size: 9, name: "Arial", color: { argb: BRAND_COLORS.textMuted }, italic: true };
    footerRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    footerRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_COLORS.footerBg } };
    footerRow.height = 20;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer as ArrayBuffer) as Buffer;
}

// ===== Helper: Convert compliance status to Arabic =====
export function statusToArabic(status: string): string {
  return STATUS_MAP[status] || status || "-";
}

export function boolToCompliance(val: any): string {
  return val ? "ممتثل" : "غير ممتثل";
}

export { RASID_ROLE_LABELS, STATUS_MAP, BRAND_COLORS };
