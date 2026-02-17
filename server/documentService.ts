import crypto from "crypto";
import QRCode from "qrcode";

const PLATFORM_PREFIX = "RASID";
// Transparent PNG logo for documents
const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/LnmTJuRvbpTTsXZh.png";
const PLATFORM_NAME = "منصة راصد";
const PLATFORM_NAME_EN = "Rasid Platform";
const ORG_NAME = "مكتب إدارة البيانات الوطنية";
const PRIMARY_COLOR = "#0ea5e9";
const PRIMARY_DARK = "#0284c7";

// ─── Verification Code Generation ────────────────────────────────────
export function generateVerificationCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${PLATFORM_PREFIX}-${timestamp}-${random}`;
}

// ─── Document ID Generation ──────────────────────────────────────────
export function generateDocumentId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `DOC-${timestamp}-${random}`;
}

// ─── SHA-256 Content Hash ────────────────────────────────────────────
export function generateContentHash(data: {
  documentId: string;
  verificationCode: string;
  recordId?: string;
  title: string;
  coreData: Record<string, any>;
  date: string;
  issuerName: string;
}): string {
  const jsonString = JSON.stringify(data);
  return crypto.createHash("sha256").update(jsonString).digest("hex");
}

// ─── QR Code Generation ─────────────────────────────────────────────
export async function generateQRCode(verificationUrl: string): Promise<string> {
  return QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: "H",
    color: {
      dark: PRIMARY_COLOR,
      light: "#ffffff",
    },
  });
}

// ─── Hijri Date Conversion (approximate) ─────────────────────────────
function toHijriDate(date: Date): string {
  try {
    return date.toLocaleDateString("ar-SA-u-ca-islamic-nu-latn", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Riyadh",
    });
  } catch {
    return date.toLocaleDateString("ar-SA", { timeZone: "Asia/Riyadh" });
  }
}

function toGregorianDate(date: Date): string {
  return date.toLocaleDateString("ar-SA-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Riyadh",
  });
}

function toGregorianDateTime(date: Date): string {
  return date.toLocaleString("ar-SA-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Riyadh",
  });
}

// ─── Severity Color ──────────────────────────────────────────────────
function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case "critical": case "حرج": return "#ef4444";
    case "high": case "عالي": return "#f97316";
    case "medium": case "متوسط": return "#eab308";
    case "low": case "منخفض": return "#22c55e";
    default: return "#6b7280";
  }
}

function getComplianceColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

// ─── Document Types ──────────────────────────────────────────────────
interface DocumentGenerationInput {
  recordId?: string;
  title: string;
  titleAr: string;
  documentType: "incident_report" | "custom_report" | "executive_summary" | "compliance_report" | "sector_report";
  issuerName: string;
  baseUrl: string;
  coreData: Record<string, any>;
  description?: string;
  classifications?: string[];
  evidence?: Array<{ url: string; caption?: string }>;
  aiAnalysis?: { confidence: number; summary: string; recommendations: string[] };
  evidenceChain?: Array<{ hash: string; date: string; description: string }>;
  complianceScore?: number;
  sectorType?: string;
  domain?: string;
}

interface DocumentGenerationOutput {
  documentId: string;
  verificationCode: string;
  contentHash: string;
  htmlContent: string;
  generatedAt: Date;
}

// ─── Main Document Generation ────────────────────────────────────────
export async function generateDocument(input: DocumentGenerationInput): Promise<DocumentGenerationOutput> {
  const documentId = generateDocumentId();
  const verificationCode = generateVerificationCode();
  const generatedAt = new Date();

  const contentHash = generateContentHash({
    documentId,
    verificationCode,
    recordId: input.recordId,
    title: input.title,
    coreData: input.coreData,
    date: generatedAt.toISOString(),
    issuerName: input.issuerName,
  });

  const verificationUrl = `${input.baseUrl}/public/verify/${verificationCode}`;
  const qrDataUrl = await generateQRCode(verificationUrl);

  const htmlContent = buildDocumentHTML({
    ...input,
    documentId,
    verificationCode,
    contentHash,
    qrDataUrl,
    verificationUrl,
    generatedAt,
  });

  return {
    documentId,
    verificationCode,
    contentHash,
    htmlContent,
    generatedAt,
  };
}

// ─── HTML Document Builder ───────────────────────────────────────────
function buildDocumentHTML(params: DocumentGenerationInput & {
  documentId: string;
  verificationCode: string;
  contentHash: string;
  qrDataUrl: string;
  verificationUrl: string;
  generatedAt: Date;
}): string {
  const hijriDate = toHijriDate(params.generatedAt);
  const gregorianDate = toGregorianDate(params.generatedAt);
  const dateTime = toGregorianDateTime(params.generatedAt);

  const docTypeLabels: Record<string, string> = {
    incident_report: "توثيق حادثة",
    custom_report: "تقرير مخصص",
    executive_summary: "ملخص تنفيذي",
    compliance_report: "تقرير امتثال",
    sector_report: "تقرير قطاعي",
  };

  // Build core data rows
  const coreDataRows = Object.entries(params.coreData)
    .filter(([_, v]) => v !== null && v !== undefined && v !== "")
    .map(([key, value]) => {
      const isSeverity = key.includes("خطورة") || key.includes("severity") || key.includes("مستوى");
      const isScore = key.includes("نسبة") || key.includes("score") || key.includes("درجة");
      let displayValue = String(value);
      let style = "";
      if (isSeverity) {
        style = `color: ${getSeverityColor(displayValue)}; font-weight: 700;`;
      }
      if (isScore) {
        const num = parseFloat(displayValue);
        if (!isNaN(num)) {
          style = `color: ${getComplianceColor(num)}; font-weight: 700;`;
          displayValue = `${num}%`;
        }
      }
      return `<tr><td style="padding: 10px 14px; background: #f8fafc; font-weight: 600; color: #374151; width: 35%; border-bottom: 1px solid #e5e7eb;">${key}</td><td style="padding: 10px 14px; border-bottom: 1px solid #e5e7eb;${style ? ' ' + style : ''}">${displayValue}</td></tr>`;
    })
    .join("\n");

  // Build classifications badges
  const classificationsBadges = (params.classifications || [])
    .map(c => `<span style="display: inline-block; padding: 4px 12px; margin: 3px; border-radius: 20px; border: 1px solid ${PRIMARY_COLOR}40; background: ${PRIMARY_COLOR}10; color: ${PRIMARY_COLOR}; font-size: 13px;">${c}</span>`)
    .join("");

  // Build evidence images
  const evidenceImages = (params.evidence || [])
    .map(e => `<div style="display: inline-block; width: 48%; margin: 1%; vertical-align: top;"><img src="${e.url}" alt="${e.caption || ''}" style="width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />${e.caption ? `<p style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 4px;">${e.caption}</p>` : ''}</div>`)
    .join("");

  // Build AI analysis section
  const aiSection = params.aiAnalysis ? `
    <div style="margin-top: 20px; padding: 16px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 10px; border-right: 4px solid ${PRIMARY_COLOR};">
      <h3 style="margin: 0 0 10px 0; color: ${PRIMARY_COLOR}; font-size: 16px;">🤖 التحليل الآلي (AI)</h3>
      <p style="margin: 0 0 8px 0;"><strong>نسبة الثقة:</strong> <span style="color: ${getComplianceColor(params.aiAnalysis.confidence)}; font-weight: 700;">${params.aiAnalysis.confidence}%</span></p>
      <p style="margin: 0 0 8px 0;">${params.aiAnalysis.summary}</p>
      ${params.aiAnalysis.recommendations.length > 0 ? `
        <div style="margin-top: 10px;">
          <strong>التوصيات:</strong>
          <ul style="margin: 5px 0; padding-right: 20px;">${params.aiAnalysis.recommendations.map(r => `<li style="margin: 4px 0;">${r}</li>`).join("")}</ul>
        </div>
      ` : ''}
    </div>
  ` : '';

  // Build evidence chain table
  const evidenceChainRows = (params.evidenceChain || [])
    .map((e, i) => `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${i + 1}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${e.description}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-family: 'Courier New', monospace; font-size: 11px; color: #7c3aed; direction: ltr;">${e.hash.substring(0, 16)}...</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; direction: ltr;">${e.date}</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${params.titleAr} - ${PLATFORM_NAME}</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Tajawal', sans-serif; color: #1f2937; background: #fff; line-height: 1.7; direction: rtl; }
    .page { max-width: 800px; margin: 0 auto; padding: 30px; }
    table { width: 100%; border-collapse: collapse; }
    @media print {
      body { background: #fff !important; }
      .no-print { display: none !important; }
      .page { padding: 15px; max-width: 100%; }
      .header-gradient { background: #f0f9ff !important; color: #0c4a6e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .verification-section { background: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 2px solid ${PRIMARY_COLOR};">
      <div style="text-align: right;">
        <img src="${LOGO_URL}" alt="${PLATFORM_NAME}" style="height: 60px; width: auto;" />
        <p style="font-size: 12px; color: #6b7280; margin-top: 4px;">${ORG_NAME}</p>
      </div>
      <div class="header-gradient" style="background: linear-gradient(135deg, ${PRIMARY_COLOR}, ${PRIMARY_DARK}); color: #fff; padding: 10px 20px; border-radius: 8px; text-align: center;">
        <div style="font-size: 18px; font-weight: 800;">${PLATFORM_NAME}</div>
        <div style="font-size: 11px; opacity: 0.9;">${PLATFORM_NAME_EN}</div>
      </div>
    </div>

    <!-- Document Title -->
    <div style="margin-top: 20px; padding: 16px 20px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 10px; border-right: 4px solid ${PRIMARY_COLOR};">
      <h1 style="font-size: 20px; font-weight: 800; color: #0c4a6e; margin: 0;">${params.titleAr}</h1>
      <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 10px; font-size: 13px; color: #475569;">
        <span><strong>نوع الوثيقة:</strong> ${docTypeLabels[params.documentType] || params.documentType}</span>
        <span style="direction: ltr;"><strong style="direction: rtl;">رقم الوثيقة:</strong> <code style="font-family: 'Courier New', monospace; color: ${PRIMARY_COLOR}; font-weight: 700;">${params.documentId}</code></span>
        <span><strong>تاريخ الإصدار:</strong> ${hijriDate} — ${gregorianDate}</span>
        <span><strong>المُصدِر:</strong> ${params.issuerName}</span>
      </div>
    </div>

    <!-- Core Data Table -->
    ${coreDataRows ? `
    <div style="margin-top: 20px;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0c4a6e; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid ${PRIMARY_COLOR}40;">📋 البيانات الأساسية</h3>
      <table style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        ${coreDataRows}
      </table>
    </div>
    ` : ''}

    <!-- Description -->
    ${params.description ? `
    <div style="margin-top: 20px;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0c4a6e; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid ${PRIMARY_COLOR}40;">📝 الوصف التفصيلي</h3>
      <div style="padding: 14px; background: #f8fafc; border-radius: 8px; line-height: 1.8;">${params.description}</div>
    </div>
    ` : ''}

    <!-- Classifications -->
    ${classificationsBadges ? `
    <div style="margin-top: 20px;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0c4a6e; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid ${PRIMARY_COLOR}40;">🏷️ التصنيفات</h3>
      <div>${classificationsBadges}</div>
    </div>
    ` : ''}

    <!-- Evidence Images -->
    ${evidenceImages ? `
    <div style="margin-top: 20px;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0c4a6e; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid ${PRIMARY_COLOR}40;">📸 الأدلة المرفقة</h3>
      <div style="padding: 10px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; margin-bottom: 10px; font-size: 12px; color: #b91c1c;">⚠️ تنبيه أمني: البيانات المعروضة لأغراض التوثيق الرسمي فقط</div>
      <div>${evidenceImages}</div>
    </div>
    ` : ''}

    <!-- AI Analysis -->
    ${aiSection}

    <!-- Evidence Chain -->
    ${evidenceChainRows ? `
    <div style="margin-top: 20px;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0c4a6e; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid ${PRIMARY_COLOR}40;">🔗 سلسلة الأدلة الرقمية</h3>
      <table style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead><tr style="background: #f1f5f9;"><th style="padding: 8px; text-align: center;">#</th><th style="padding: 8px;">الوصف</th><th style="padding: 8px;">البصمة</th><th style="padding: 8px;">التاريخ</th></tr></thead>
        <tbody>${evidenceChainRows}</tbody>
      </table>
    </div>
    ` : ''}

    <!-- Verification Section -->
    <div class="verification-section" style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-radius: 12px; border: 1px solid #86efac;">
      <h3 style="font-size: 16px; font-weight: 700; color: #166534; margin-bottom: 14px; text-align: center;">✅ قسم التحقق من صحة الوثيقة</h3>
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div style="flex: 1; min-width: 250px;">
          <div style="margin-bottom: 10px;">
            <span style="font-size: 12px; color: #6b7280;">رمز التحقق:</span>
            <div style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; color: ${PRIMARY_COLOR}; letter-spacing: 1px; direction: ltr; text-align: right;">${params.verificationCode}</div>
          </div>
          <div>
            <span style="font-size: 12px; color: #6b7280;">بصمة المحتوى (SHA-256):</span>
            <div style="font-family: 'Courier New', monospace; font-size: 11px; color: #7c3aed; direction: ltr; text-align: right; word-break: break-all;">${params.contentHash.substring(0, 32)}...</div>
          </div>
        </div>
        <div style="text-align: center;">
          <img src="${params.qrDataUrl}" alt="QR Code" style="width: 120px; height: 120px; border: 2px solid ${PRIMARY_COLOR}40; border-radius: 8px;" />
          <p style="font-size: 11px; color: #6b7280; margin-top: 4px;">امسح للتحقق</p>
        </div>
      </div>
      <p style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 12px; padding-top: 12px; border-top: 1px solid #bbf7d0;">
        للتحقق من صحة هذه الوثيقة، امسح رمز QR أو أدخل رمز التحقق في صفحة التحقق على المنصة
      </p>
    </div>

    <!-- Footer -->
    <div style="margin-top: 30px; padding-top: 16px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
      <p style="font-weight: 700; color: #6b7280;">${PLATFORM_NAME} — ${ORG_NAME}</p>
      <p style="margin-top: 4px;">رصد امتثال المواقع السعودية لنظام حماية البيانات الشخصية</p>
      <p style="margin-top: 4px;">© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Report-specific Document Generation ─────────────────────────────
export async function generateReportDocument(input: {
  title: string;
  titleAr: string;
  reportType: string;
  issuerName: string;
  baseUrl: string;
  filters: Record<string, any>;
  sections: string[];
  statistics: Record<string, any>;
  records?: Array<Record<string, any>>;
}): Promise<DocumentGenerationOutput> {
  const coreData: Record<string, string> = {
    "نوع التقرير": input.reportType,
    "عدد الأقسام المضمنة": String(input.sections.length),
  };

  if (input.filters.dateFrom) coreData["من تاريخ"] = input.filters.dateFrom;
  if (input.filters.dateTo) coreData["إلى تاريخ"] = input.filters.dateTo;
  if (input.filters.sectors) coreData["القطاعات"] = Array.isArray(input.filters.sectors) ? input.filters.sectors.join("، ") : input.filters.sectors;
  if (input.statistics.totalSites) coreData["إجمالي المواقع"] = String(input.statistics.totalSites);
  if (input.statistics.avgScore !== undefined) coreData["متوسط الامتثال"] = `${input.statistics.avgScore}%`;

  const description = `تقرير مخصص تم إنشاؤه بواسطة ${input.issuerName}. يتضمن الأقسام التالية: ${input.sections.join("، ")}.`;

  return generateDocument({
    title: input.title,
    titleAr: input.titleAr,
    documentType: "custom_report",
    issuerName: input.issuerName,
    baseUrl: input.baseUrl,
    recordId: undefined,
    coreData,
    description,
    classifications: input.sections,
  });
}
