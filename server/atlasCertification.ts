/**
 * Atlas Incident Certification Service
 * Generates professional HTML certification documents with QR codes
 * for Atlas breach incidents (110 real Saudi breach incidents from breachRawData.json)
 */
import crypto from "crypto";
import QRCode from "qrcode";
import { RASID_LOGO_DARK_BASE64, RASID_LOGO_LIGHT_BASE64 } from "./logoBase64";

const RASID_LOGO_DARK_BG = RASID_LOGO_DARK_BASE64;
const RASID_LOGO_LIGHT_BG = RASID_LOGO_LIGHT_BASE64;

// ─── Utility Functions ───────────────────────────────────────
export function generateVerificationCode(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `NDMO-ATL-${year}-${random}`;
}

export function generateDocumentId(): string {
  return `ATL-DOC-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export function generateContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 200,
    margin: 2,
    color: { dark: "#0a2540", light: "#ffffff" },
    errorCorrectionLevel: "H",
  });
}

// ─── Severity Labels ─────────────────────────────────────────
const severityLabels: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  Critical: { ar: "عالية الأهمية", en: "Critical", color: "#dc2626", bg: "#dc26261a" },
  High: { ar: "عالية", en: "High", color: "#ea580c", bg: "#ea580c1a" },
  Medium: { ar: "متوسطة", en: "Medium", color: "#d97706", bg: "#d977061a" },
  Low: { ar: "منخفضة", en: "Low", color: "#0d9488", bg: "#0d94881a" },
  Informational: { ar: "إعلامية", en: "Informational", color: "#6366f1", bg: "#6366f11a" },
};

// ─── Atlas Incident Interface ────────────────────────────────
export interface AtlasIncident {
  id: string;
  victim: string;
  title_en: string;
  title_ar: string;
  date: string;
  category: string;
  sector: string;
  threat_actor: string;
  description_en: string;
  description_ar: string;
  overview: {
    discovery_date: string;
    attack_method: string;
    attack_method_ar: string;
    exposed_records: number;
    data_size: string;
    source_platform: string;
    source_url: string;
    severity: string;
    confidence_level: string;
  };
  attacker_info: {
    alias: string;
    price_usd: number;
    price_display: string;
    platform: string;
    group: string;
    known_attacks: string;
  };
  data_types: string[];
  data_types_ar: string[];
  data_types_count: number;
  data_sensitivity: string;
  ai_analysis: {
    analysis_date: string;
    impact_assessment: string;
    confidence_percentage: number;
    executive_summary: string;
    recommendations: string[];
  };
  pdpl_analysis: {
    violated_articles: string;
    estimated_fine_sar: string;
    risk_level: string;
  };
  evidence_images?: string[];
  leak_source?: {
    sector?: string;
    region?: string;
    region_en?: string;
    original_url?: string;
  };
  sources?: Array<{ name: string; url: string }>;
}

// ─── Result Interface ────────────────────────────────────────
export interface AtlasCertificationResult {
  documentId: string;
  verificationCode: string;
  contentHash: string;
  htmlContent: string;
  incidentId: string;
  title: string;
  titleAr: string;
  generatedAt: string;
}

// ─── Main Generation Function ────────────────────────────────
export async function generateAtlasCertification(
  incident: AtlasIncident,
  generatedByName: string,
  verifyBaseUrl: string
): Promise<AtlasCertificationResult> {
  const documentId = generateDocumentId();
  const verificationCode = generateVerificationCode();
  const generatedAt = new Date().toISOString();
  const generatedAtFormatted = new Date().toLocaleString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Riyadh",
  });
  const hijriDate = new Date().toLocaleDateString("ar-SA-u-ca-islamic", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const verifyUrl = `${verifyBaseUrl}/public/verify/${verificationCode}`;
  const qrDataUrl = await generateQRCode(verifyUrl);

  // Severity info
  const severity = severityLabels[incident.overview.severity] || severityLabels.Medium;

  // Build content for hashing
  const contentForHash = JSON.stringify({
    documentId,
    verificationCode,
    incidentId: incident.id,
    title: incident.title_ar,
    severity: incident.overview.severity,
    recordCount: incident.overview.exposed_records,
    generatedAt,
    generatedByName,
  });
  const contentHash = generateContentHash(contentForHash);

  // PII types badges
  const piiList = (incident.data_types_ar || [])
    .map(
      (t) =>
        `<span style="display:inline-block;background:#f1f5f9;color:#0a2540;border:1px solid #e2e8f0;border-radius:6px;padding:4px 12px;margin:3px;font-size:11px;font-weight:600;">${t}</span>`
    )
    .join("");

  // Evidence screenshots
  const screenshotSection = (incident.evidence_images || [])
    .slice(0, 4)
    .map(
      (url) =>
        `<img src="${url}" style="width:47%;border-radius:8px;border:2px solid #e2e8f0;margin:4px;box-shadow:0 2px 8px rgba(0,0,0,0.06);" />`
    )
    .join("");

  // AI Analysis section
  const aiSection = incident.ai_analysis?.executive_summary
    ? `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-top:24px;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <div style="width:4px;height:24px;background:linear-gradient(180deg,#0d9488,#06b6d4);border-radius:2px;"></div>
        <h3 style="color:#0a2540;font-size:15px;margin:0;font-weight:800;">تحليل الذكاء الاصطناعي ${incident.ai_analysis.confidence_percentage ? `<span style="font-size:11px;color:#0d9488;font-weight:500;margin-right:8px;">(نسبة الثقة: ${incident.ai_analysis.confidence_percentage}%)</span>` : ""}</h3>
      </div>
      <p style="font-size:12px;color:#334155;line-height:2.2;text-align:right;margin:0;">${incident.ai_analysis.executive_summary}</p>
      ${
        incident.ai_analysis.recommendations && incident.ai_analysis.recommendations.length > 0
          ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;">
             <h4 style="color:#0a2540;font-size:12px;margin:0 0 10px 0;text-align:right;font-weight:700;">التوصيات:</h4>
             <ul style="margin:0;padding:0;list-style:none;">
               ${incident.ai_analysis.recommendations.map((r) => `<li style="font-size:11px;color:#334155;margin:8px 0;text-align:right;padding-right:14px;border-right:3px solid #0d9488;line-height:1.8;">${r}</li>`).join("")}
             </ul>
           </div>`
          : ""
      }
    </div>`
    : "";

  // PDPL Analysis section
  const pdplSection = incident.pdpl_analysis
    ? `
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-top:24px;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        <div style="width:4px;height:24px;background:linear-gradient(180deg,#d97706,#f59e0b);border-radius:2px;"></div>
        <h3 style="color:#0a2540;font-size:15px;margin:0;font-weight:800;">تحليل نظام حماية البيانات الشخصية (PDPL)</h3>
      </div>
      <table style="width:100%;border-collapse:collapse;direction:rtl;">
        <tr>
          <td style="padding:10px 14px;font-size:12px;color:#64748b;font-weight:600;width:35%;border-bottom:1px solid #fde68a;">المواد المنتهكة</td>
          <td style="padding:10px 14px;font-size:12px;color:#92400e;font-weight:700;border-bottom:1px solid #fde68a;">${incident.pdpl_analysis.violated_articles}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #fde68a;">الغرامات التقديرية</td>
          <td style="padding:10px 14px;font-size:12px;color:#dc2626;font-weight:800;border-bottom:1px solid #fde68a;">${incident.pdpl_analysis.estimated_fine_sar} ريال</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-size:12px;color:#64748b;font-weight:600;">مستوى المخاطر</td>
          <td style="padding:10px 14px;font-size:12px;color:#92400e;font-weight:700;">${incident.pdpl_analysis.risk_level}</td>
        </tr>
      </table>
    </div>`
    : "";

  // Sources section
  const sourcesSection = (incident.sources && incident.sources.length > 0)
    ? `
    <div style="margin-top:24px;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
        <div style="width:4px;height:24px;background:linear-gradient(180deg,#6366f1,#8b5cf6);border-radius:2px;"></div>
        <h3 style="color:#0a2540;font-size:15px;margin:0;font-weight:800;">مصادر التحقق</h3>
      </div>
      <table style="width:100%;border-collapse:collapse;direction:rtl;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <th style="padding:10px 14px;border:1px solid #e2e8f0;font-size:10px;text-align:right;background:#f1f5f9;color:#0a2540;font-weight:700;">#</th>
          <th style="padding:10px 14px;border:1px solid #e2e8f0;font-size:10px;text-align:right;background:#f1f5f9;color:#0a2540;font-weight:700;">المصدر</th>
          <th style="padding:10px 14px;border:1px solid #e2e8f0;font-size:10px;text-align:right;background:#f1f5f9;color:#0a2540;font-weight:700;">الرابط</th>
        </tr>
        ${incident.sources.slice(0, 6).map((s, i) => `
          <tr style="background:${i % 2 === 0 ? "#fff" : "#f8fafc"}">
            <td style="padding:8px 14px;border:1px solid #e2e8f0;font-size:11px;text-align:right;font-weight:700;">${i + 1}</td>
            <td style="padding:8px 14px;border:1px solid #e2e8f0;font-size:11px;text-align:right;">${s.name}</td>
            <td style="padding:8px 14px;border:1px solid #e2e8f0;font-size:10px;text-align:right;font-family:'Courier New',monospace;color:#6366f1;word-break:break-all;">${s.url}</td>
          </tr>`).join("")}
      </table>
    </div>`
    : "";

  // ─── Build the full HTML document ───────────────────────────
  const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Tajawal', 'Noto Kufi Arabic', sans-serif;
      background: #fff;
      color: #1e293b;
      direction: rtl;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page { max-width: 820px; margin: 0 auto; padding: 0; position: relative; }
    @page { size: A4; margin: 8mm; }
    @media print {
      body { -webkit-print-color-adjust: exact !important; }
      .page { padding: 0; max-width: 100%; }
      .no-print { display: none !important; }
    }
    .info-table { width: 100%; border-collapse: collapse; direction: rtl; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
    .info-table td { padding: 11px 18px; border-bottom: 1px solid #f1f5f9; font-size: 12px; text-align: right; vertical-align: middle; }
    .info-table .label-cell { background: #f8fafc; color: #64748b; width: 32%; font-weight: 600; }
    .info-table .value-cell { font-weight: 600; color: #0f172a; }
    .badge { display: inline-block; border-radius: 6px; padding: 4px 14px; font-size: 11px; font-weight: 700; }
  </style>
</head>
<body>
  <div class="page">

    <!-- WATERMARK -->
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:0;overflow:hidden;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);white-space:nowrap;">
        <div style="font-size:72px;font-weight:900;color:rgba(220,38,38,0.035);letter-spacing:20px;line-height:200px;">
          سري جداً &nbsp; TOP SECRET &nbsp; سري جداً<br/>
          TOP SECRET &nbsp; سري جداً &nbsp; TOP SECRET<br/>
          سري جداً &nbsp; TOP SECRET &nbsp; سري جداً
        </div>
      </div>
    </div>

    <!-- TOP CLASSIFICATION BANNER -->
    <div style="background:linear-gradient(135deg,#7f1d1d,#991b1b,#b91c1c);padding:10px 24px;text-align:center;position:relative;z-index:1;">
      <p style="color:#fecaca;font-size:12px;font-weight:800;letter-spacing:4px;margin:0;">
        سري جداً — TOP SECRET — تصنيف: مقيّد
      </p>
    </div>

    <!-- DOCUMENT HEADER -->
    <div style="background:linear-gradient(180deg,#0a2540 0%,#0c3054 100%);padding:28px 36px;position:relative;z-index:1;">
      <div style="position:absolute;inset:0;opacity:0.04;background-image:repeating-linear-gradient(45deg,transparent,transparent 30px,rgba(255,255,255,1) 30px,rgba(255,255,255,1) 31px);pointer-events:none;"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;">
        <div style="text-align:right;flex:1;">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px;">
            <img src="${RASID_LOGO_DARK_BG}" alt="منصة راصد" style="height:56px;object-fit:contain;" />
            <div style="width:1px;height:40px;background:rgba(255,255,255,0.15);"></div>
            <div>
              <p style="font-size:14px;color:white;font-weight:800;margin:0;">منصة راصد الوطنية — أطلس الحوادث</p>
              <p style="font-size:10px;color:rgba(255,255,255,0.5);margin:3px 0 0 0;">NDMO Rasid Platform — Atlas Incident Certification</p>
            </div>
          </div>
        </div>
        <div style="text-align:left;">
          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:14px 18px;">
            <p style="font-size:9px;color:rgba(255,255,255,0.4);margin:0;">رقم الوثيقة</p>
            <p style="font-size:13px;color:white;font-family:'Courier New',monospace;font-weight:800;margin:4px 0 0 0;letter-spacing:0.5px;">${documentId}</p>
          </div>
        </div>
      </div>

      <!-- Document meta bar -->
      <div style="display:flex;gap:12px;margin-top:18px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.1);flex-wrap:wrap;position:relative;z-index:1;">
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 14px;flex:1;min-width:130px;">
          <p style="font-size:9px;color:rgba(255,255,255,0.4);margin:0;">تاريخ الإصدار (ميلادي)</p>
          <p style="font-size:11px;color:white;font-weight:700;margin:3px 0 0 0;">${generatedAtFormatted}</p>
        </div>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 14px;flex:1;min-width:130px;">
          <p style="font-size:9px;color:rgba(255,255,255,0.4);margin:0;">تاريخ الإصدار (هجري)</p>
          <p style="font-size:11px;color:white;font-weight:700;margin:3px 0 0 0;">${hijriDate}</p>
        </div>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 14px;flex:1;min-width:130px;">
          <p style="font-size:9px;color:rgba(255,255,255,0.4);margin:0;">صادر بواسطة</p>
          <p style="font-size:11px;color:white;font-weight:700;margin:3px 0 0 0;">${generatedByName}</p>
        </div>
        <div style="background:rgba(220,38,38,0.15);border:1px solid rgba(220,38,38,0.3);border-radius:8px;padding:10px 14px;">
          <p style="font-size:9px;color:#fca5a5;margin:0;">التصنيف</p>
          <p style="font-size:12px;color:#fecaca;font-weight:900;margin:3px 0 0 0;">سري جداً</p>
        </div>
      </div>
    </div>

    <!-- DOCUMENT TITLE -->
    <div style="padding:26px 36px;background:linear-gradient(135deg,#f0fdf4,#ecfdf5,#f0f9ff);border-bottom:2px solid #e2e8f0;position:relative;z-index:1;">
      <div style="text-align:center;">
        <h2 style="font-size:21px;font-weight:900;color:#0a2540;margin:0;">شهادة توثيق حالة رصد</h2>
        <p style="font-size:11px;color:#64748b;margin-top:5px;font-weight:500;">Atlas Personal Data Breach Incident Certification</p>
        <div style="width:60px;height:3px;background:linear-gradient(90deg,#0d9488,#06b6d4);margin:14px auto 0;border-radius:2px;"></div>
      </div>
    </div>

    <!-- CONTENT BODY -->
    <div style="padding:28px 36px;position:relative;z-index:1;">

      <!-- Incident Overview Table -->
      <div style="margin-bottom:28px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <div style="width:4px;height:26px;background:linear-gradient(180deg,#0a2540,#0d9488);border-radius:2px;"></div>
          <h3 style="color:#0a2540;font-size:16px;margin:0;font-weight:900;">معلومات الحادثة</h3>
        </div>
        <table class="info-table">
          <tr>
            <td class="label-cell">رقم الحادثة</td>
            <td class="value-cell" style="font-family:'Courier New',monospace;color:#6366f1;font-weight:800;">${incident.id}</td>
          </tr>
          <tr>
            <td class="label-cell">عنوان الحادثة</td>
            <td class="value-cell" style="font-size:13px;font-weight:800;color:#0a2540;">${incident.title_ar}</td>
          </tr>
          <tr>
            <td class="label-cell">الجهة المتضررة</td>
            <td class="value-cell" style="font-weight:700;">${incident.victim}</td>
          </tr>
          <tr>
            <td class="label-cell">تصنيف مستوى التأثير</td>
            <td class="value-cell">
              <span class="badge" style="background:${severity.bg};color:${severity.color};border:1px solid ${severity.color}33;">${severity.ar} — ${severity.en}</span>
            </td>
          </tr>
          <tr>
            <td class="label-cell">القطاع</td>
            <td class="value-cell" style="font-weight:700;">${incident.sector}</td>
          </tr>
          <tr>
            <td class="label-cell">عدد ادعاء البائع</td>
            <td class="value-cell" style="font-size:15px;font-weight:900;color:#dc2626;">${incident.overview.exposed_records.toLocaleString()} سجل</td>
          </tr>
          <tr>
            <td class="label-cell">حجم البيانات</td>
            <td class="value-cell">${incident.overview.data_size}</td>
          </tr>
          <tr>
            <td class="label-cell">المنصة المصدر</td>
            <td class="value-cell">${incident.overview.source_platform}</td>
          </tr>
          <tr>
            <td class="label-cell">أسلوب الهجوم</td>
            <td class="value-cell">${incident.overview.attack_method_ar || incident.overview.attack_method}</td>
          </tr>
          ${incident.attacker_info?.alias ? `<tr><td class="label-cell">الجهة الفاعلة / البائع</td><td class="value-cell" style="color:#dc2626;font-weight:800;">${incident.attacker_info.alias}</td></tr>` : ""}
          ${incident.attacker_info?.price_display ? `<tr><td class="label-cell">السعر المعروض</td><td class="value-cell" style="font-weight:700;">${incident.attacker_info.price_display}</td></tr>` : ""}
          ${incident.attacker_info?.platform ? `<tr><td class="label-cell">منصة العرض</td><td class="value-cell">${incident.attacker_info.platform}</td></tr>` : ""}
          ${incident.leak_source?.region ? `<tr><td class="label-cell">المنطقة</td><td class="value-cell">${incident.leak_source.region}</td></tr>` : ""}
          <tr>
            <td class="label-cell">تاريخ الرصد</td>
            <td class="value-cell">${incident.date ? new Date(incident.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "—"}</td>
          </tr>
          <tr>
            <td class="label-cell">مستوى الثقة</td>
            <td class="value-cell">${incident.overview.confidence_level}%</td>
          </tr>
        </table>
      </div>

      <!-- Description -->
      ${incident.description_ar ? `
      <div style="margin-bottom:28px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <div style="width:4px;height:26px;background:linear-gradient(180deg,#0a2540,#0d9488);border-radius:2px;"></div>
          <h3 style="color:#0a2540;font-size:16px;margin:0;font-weight:900;">وصف الحادثة</h3>
        </div>
        <p style="font-size:12px;color:#334155;line-height:2.2;text-align:right;background:#f8fafc;padding:20px;border-radius:10px;border:1px solid #e2e8f0;">${incident.description_ar}</p>
      </div>` : ""}

      <!-- PII Types -->
      <div style="margin-bottom:28px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <div style="width:4px;height:26px;background:linear-gradient(180deg,#dc2626,#ea580c);border-radius:2px;"></div>
          <h3 style="color:#0a2540;font-size:16px;margin:0;font-weight:900;">أنواع البيانات الشخصية المعروضة</h3>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">${piiList}</div>
      </div>

      <!-- Evidence Screenshots -->
      ${screenshotSection ? `
      <div style="margin-bottom:28px;page-break-inside:avoid;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <div style="width:4px;height:26px;background:linear-gradient(180deg,#6366f1,#8b5cf6);border-radius:2px;"></div>
          <h3 style="color:#0a2540;font-size:16px;margin:0;font-weight:900;">لقطات الأدلة</h3>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">${screenshotSection}</div>
      </div>` : ""}

      <!-- AI Analysis -->
      ${aiSection}

      <!-- PDPL Analysis -->
      ${pdplSection}

      <!-- Sources -->
      ${sourcesSection}

    </div>

    <!-- VERIFICATION & QR CODE SECTION -->
    <div style="margin:0 36px;padding:26px;background:linear-gradient(135deg,#0a2540,#0c3054);border-radius:14px;position:relative;z-index:1;overflow:hidden;page-break-inside:avoid;">
      <div style="position:absolute;inset:0;opacity:0.03;background-image:repeating-linear-gradient(-45deg,transparent,transparent 20px,rgba(255,255,255,1) 20px,rgba(255,255,255,1) 21px);pointer-events:none;"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;position:relative;z-index:1;">
        <div style="text-align:right;flex:1;min-width:250px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <div style="width:34px;height:34px;background:rgba(13,148,136,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:18px;color:#5eead4;">✓</span>
            </div>
            <h3 style="color:white;font-size:16px;margin:0;font-weight:900;">التحقق من صحة الوثيقة</h3>
          </div>
          <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:14px 18px;margin-bottom:12px;">
            <p style="font-size:9px;color:rgba(255,255,255,0.4);margin:0;">كود التحقق</p>
            <p style="font-size:17px;color:#5eead4;font-family:'Courier New',monospace;font-weight:900;margin:5px 0 0 0;letter-spacing:1.5px;">${verificationCode}</p>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px 18px;margin-bottom:12px;">
            <p style="font-size:9px;color:rgba(255,255,255,0.4);margin:0;">بصمة المحتوى (SHA-256)</p>
            <p style="font-size:9px;color:rgba(255,255,255,0.55);font-family:'Courier New',monospace;margin:5px 0 0 0;word-break:break-all;line-height:1.6;">${contentHash}</p>
          </div>
          <p style="font-size:10px;color:rgba(255,255,255,0.35);margin:0;line-height:1.8;">
            امسح رمز QR أو أدخل كود التحقق في منصة راصد للتحقق من صحة ومصداقية هذه الوثيقة
          </p>
        </div>
        <div style="text-align:center;">
          <div style="background:white;border-radius:12px;padding:10px;display:inline-block;box-shadow:0 4px 24px rgba(0,0,0,0.3);">
            <img src="${qrDataUrl}" style="width:150px;height:150px;border-radius:6px;" />
          </div>
          <p style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:10px;">امسح للتحقق من صحة الوثيقة</p>
        </div>
      </div>
    </div>

    <!-- LEGAL DISCLAIMER -->
    <div style="margin:24px 36px;padding:18px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;position:relative;z-index:1;page-break-inside:avoid;">
      <div style="display:flex;align-items:start;gap:12px;">
        <div style="width:28px;height:28px;background:#dc26261a;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
          <span style="font-size:14px;color:#dc2626;">!</span>
        </div>
        <div>
          <p style="font-size:12px;color:#991b1b;font-weight:800;margin:0;">إخلاء مسؤولية وتحذير قانوني</p>
          <p style="font-size:10px;color:#7f1d1d;line-height:2;margin:8px 0 0 0;">
            هذه الوثيقة صادرة من منصة راصد التابعة لمكتب إدارة البيانات الوطنية وتحتوي على بيانات مصنفة. أي استخدام أو نسخ أو توزيع لهذه الوثيقة خارج نطاق المهام الرسمية المعتمدة يُعد مخالفة صريحة للأنظمة واللوائح المعمول بها ويستوجب المساءلة النظامية.
          </p>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="padding:22px 36px;text-align:center;position:relative;z-index:1;">
      <div style="width:100%;height:1px;background:linear-gradient(90deg,transparent,#cbd5e1,transparent);margin-bottom:18px;"></div>
      <img src="${RASID_LOGO_LIGHT_BG}" alt="منصة راصد" style="height:36px;object-fit:contain;margin-bottom:10px;" />
      <p style="font-size:11px;color:#0d9488;font-weight:700;margin-top:10px;">❝ حماية البيانات الشخصية متطلب وطني ❞</p>
      <p style="font-size:9px;color:#94a3b8;margin-top:8px;">© ${new Date().getFullYear()} NDMO — جميع الحقوق محفوظة | هذه الوثيقة محمية بموجب نظام حماية البيانات الشخصية</p>
    </div>

    <!-- BOTTOM CLASSIFICATION BANNER -->
    <div style="background:linear-gradient(135deg,#7f1d1d,#991b1b,#b91c1c);padding:10px 24px;text-align:center;position:relative;z-index:1;">
      <p style="color:#fecaca;font-size:12px;font-weight:800;letter-spacing:4px;margin:0;">
        سري جداً — TOP SECRET — تصنيف: مقيّد
      </p>
    </div>

  </div>
</body>
</html>`;

  return {
    documentId,
    verificationCode,
    contentHash,
    htmlContent,
    incidentId: incident.id,
    title: incident.title_en,
    titleAr: incident.title_ar,
    generatedAt,
  };
}
