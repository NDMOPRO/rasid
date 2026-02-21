/**
 * ReportCustomizer — Advanced report generation dialog with customization options
 * Allows users to customize report content, format, and scope before generation
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Download,
  Loader2,
  Calendar,
  Building2,
  Shield,
  BarChart3,
  Filter,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Printer,
  QrCode,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ComplianceWarningDialog from "./ComplianceWarningDialog";

const SECTORS = [
  "الاتصالات وتقنية المعلومات",
  "القطاع الحكومي",
  "الرعاية الصحية",
  "القطاع المالي والبنوك",
  "التعليم",
  "التجزئة والتجارة الإلكترونية",
  "النقل والطيران",
  "الطاقة والبتروكيماويات",
  "العقارات",
  "التوظيف والموارد البشرية",
  "الضيافة والسياحة",
  "التأمين",
  "الخدمات اللوجستية",
  "الإعلام والترفيه",
  "الزراعة والغذاء",
  "الخدمات القانونية",
];

const SEVERITY_OPTIONS = [
  { value: "critical", label: "واسع النطاق", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  { value: "high", label: "عالي", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { value: "medium", label: "متوسط", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  { value: "low", label: "منخفض", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
];

const SOURCE_OPTIONS = [
  { value: "telegram", label: "تليجرام" },
  { value: "darkweb", label: "دارك ويب" },
  { value: "paste", label: "مواقع اللصق" },
];

const REPORT_SECTIONS = [
  { id: "summary", label: "الملخص التنفيذي", description: "نظرة عامة على أهم النتائج والتوصيات" },
  { id: "statistics", label: "الإحصائيات العامة", description: "أرقام وإحصائيات شاملة عن حالات الرصد" },
  { id: "leaks", label: "تفاصيل حالات الرصد", description: "قائمة مفصلة بجميع حالات الرصد" },
  { id: "sectors", label: "تحليل القطاعات", description: "توزيع حالات الرصد حسب القطاعات" },
  { id: "threats", label: "تحليل التهديدات", description: "الجهات الفاعلة وأساليب الاختراق" },
  { id: "pii", label: "البيانات الشخصية المكشوفة", description: "أنواع البيانات الشخصية المسربة" },
  { id: "recommendations", label: "التوصيات", description: "توصيات لتعزيز حماية البيانات" },
  { id: "timeline", label: "الجدول الزمني", description: "تسلسل زمني لحالات الرصد" },
];

interface ReportCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export default function ReportCustomizer({ open, onClose }: ReportCustomizerProps) {
  const [step, setStep] = useState<"customize" | "warning" | "generating" | "done">("customize");
  const [reportTitle, setReportTitle] = useState("تقرير رصد تسرب البيانات الشخصية");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(["critical", "high", "medium", "low"]);
  const [selectedSources, setSelectedSources] = useState<string[]>(["telegram", "darkweb", "paste"]);
  const [selectedSections, setSelectedSections] = useState<string[]>(REPORT_SECTIONS.map((s) => s.id));
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeSampleData, setIncludeSampleData] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const { refetch: fetchPdfData } = trpc.reports.exportPdf.useQuery({}, { enabled: false });

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const toggleSeverity = (sev: string) => {
    setSelectedSeverities((prev) =>
      prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]
    );
  };

  const toggleSource = (src: string) => {
    setSelectedSources((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    );
  };

  const toggleSection = (sec: string) => {
    setSelectedSections((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  const handleProceedToWarning = () => {
    if (selectedSeverities.length === 0) {
      toast.error("يرجى اختيار مستوى تأثير واحد على الأقل");
      return;
    }
    if (selectedSources.length === 0) {
      toast.error("يرجى اختيار مصدر واحد على الأقل");
      return;
    }
    if (selectedSections.length === 0) {
      toast.error("يرجى اختيار قسم واحد على الأقل للتقرير");
      return;
    }
    setStep("warning");
  };

  const handleConfirmGenerate = async () => {
    setStep("generating");
    try {
      const { data } = await fetchPdfData();
      if (!data) throw new Error("No data");

      // Build the report HTML
      const now = new Date();
      const verificationCode = `RPT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const filterDescription = [
        selectedSectors.length > 0 ? `القطاعات: ${selectedSectors.join("، ")}` : "جميع القطاعات",
        `مستويات التأثير: ${selectedSeverities.map((s) => SEVERITY_OPTIONS.find((o) => o.value === s)?.label).join("، ")}`,
        `المصادر: ${selectedSources.map((s) => SOURCE_OPTIONS.find((o) => o.value === s)?.label).join("، ")}`,
        dateFrom ? `من: ${dateFrom}` : "",
        dateTo ? `إلى: ${dateTo}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<title>${reportTitle}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Tajawal', sans-serif; background: #0a0f1a; color: #e2e8f0; direction: rtl; }
  .page { max-width: 900px; margin: 0 auto; padding: 40px; }
  .header { background: linear-gradient(135deg, #0d1526, #1a2744); border: 1px solid rgba(6,182,212,0.2); border-radius: 16px; padding: 30px; margin-bottom: 30px; }
  .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .logo-section { display: flex; align-items: center; gap: 15px; }
  .logo-text { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #06b6d4, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .logo-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
  .verification-box { background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); border-radius: 12px; padding: 12px 16px; text-align: center; }
  .verification-code { font-family: monospace; font-size: 14px; color: #06b6d4; font-weight: 700; letter-spacing: 1px; }
  .verification-label { font-size: 10px; color: #64748b; margin-bottom: 4px; }
  .report-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
  .report-meta { display: flex; gap: 20px; flex-wrap: wrap; }
  .meta-item { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
  .section { background: rgba(15,23,42,0.5); border: 1px solid rgba(100,116,139,0.2); border-radius: 12px; padding: 24px; margin-bottom: 20px; }
  .section-title { font-size: 16px; font-weight: 700; color: #06b6d4; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(6,182,212,0.2); }
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
  .stat-card { background: rgba(6,182,212,0.05); border: 1px solid rgba(6,182,212,0.15); border-radius: 10px; padding: 16px; text-align: center; }
  .stat-value { font-size: 24px; font-weight: 800; color: #06b6d4; }
  .stat-label { font-size: 11px; color: #94a3b8; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: rgba(6,182,212,0.1); color: #06b6d4; padding: 10px 12px; text-align: right; font-weight: 600; border-bottom: 1px solid rgba(6,182,212,0.2); }
  td { padding: 10px 12px; border-bottom: 1px solid rgba(100,116,139,0.1); color: #cbd5e1; }
  tr:hover td { background: rgba(6,182,212,0.03); }
  .severity-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }
  .severity-critical { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
  .severity-high { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
  .severity-medium { background: rgba(234,179,8,0.15); color: #eab308; border: 1px solid rgba(234,179,8,0.3); }
  .severity-low { background: rgba(6,182,212,0.15); color: #06b6d4; border: 1px solid rgba(6,182,212,0.3); }
  .footer { text-align: center; padding: 20px; color: #475569; font-size: 10px; border-top: 1px solid rgba(100,116,139,0.2); margin-top: 30px; }
  .footer-motto { font-size: 12px; color: #06b6d4; font-weight: 600; margin-bottom: 8px; }
  .filter-info { background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #a78bfa; margin-bottom: 20px; }
  .rec-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-bottom: 1px solid rgba(100,116,139,0.1); }
  .rec-bullet { width: 6px; height: 6px; border-radius: 50%; background: #10b981; margin-top: 6px; flex-shrink: 0; }
  @media print { body { background: white; color: #1e293b; } .page { padding: 20px; } .header { background: #f8fafc; border-color: #e2e8f0; } .section { background: #f8fafc; border-color: #e2e8f0; } .section-title { color: #0891b2; } .stat-card { background: #f0fdfa; border-color: #99f6e4; } .stat-value { color: #0891b2; } th { background: #f0fdfa; color: #0891b2; } td { color: #334155; } .footer { color: #94a3b8; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div class="logo-section">
        <div>
          <div class="logo-text">منصة راصد</div>
          <div class="logo-sub">NDMO — مكتب إدارة البيانات الوطنية</div>
        </div>
      </div>
      <div class="verification-box">
        <div class="verification-label">رمز التحقق</div>
        <div class="verification-code">${verificationCode}</div>
      </div>
    </div>
    <div class="report-title">${reportTitle}</div>
    <div class="report-meta">
      <div class="meta-item">📅 تاريخ الإصدار: ${now.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</div>
      <div class="meta-item">🕐 الوقت: ${now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh" })}</div>
      <div class="meta-item">📊 النوع: تقرير مخصص</div>
    </div>
  </div>

  <div class="filter-info">
    🔍 معايير التصفية: ${filterDescription}
  </div>

  ${selectedSections.includes("summary") ? `
  <div class="section">
    <div class="section-title">📋 الملخص التنفيذي</div>
    <p style="font-size:13px;line-height:1.8;color:#cbd5e1;">
      يقدم هذا التقرير نظرة شاملة على حالات رصد البيانات الشخصية المرصودة عبر منصة راصد التابعة لمكتب إدارة البيانات الوطنية.
      تم رصد ${data.stats?.totalLeaks ?? 0} حالة رصد أثرت على ${(data.stats?.totalRecords ?? 0).toLocaleString()} سجل بيانات شخصية.
      يتضمن التقرير تحليلاً تفصيلياً لحالات الرصد حسب القطاعات والمصادر ومستويات التأثير، مع توصيات لتعزيز حماية البيانات.
    </p>
  </div>` : ""}

  ${selectedSections.includes("statistics") ? `
  <div class="section">
    <div class="section-title">📊 الإحصائيات العامة</div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${data.stats?.totalLeaks ?? 0}</div>
        <div class="stat-label">إجمالي حالات الرصد</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(data.stats?.totalRecords ?? 0).toLocaleString()}</div>
        <div class="stat-label">العدد المُدّعى</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats?.newLeaks ?? 0}</div>
        <div class="stat-label">حالات رصد جديدة</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats?.piiDetected ?? 0}</div>
        <div class="stat-label">أنواع بيانات مكتشفة</div>
      </div>
    </div>
  </div>` : ""}

  ${selectedSections.includes("leaks") ? `
  <div class="section">
    <div class="section-title">🔓 تفاصيل حالات الرصد</div>
    <table>
      <thead>
        <tr>
          <th>الرمز</th>
          <th>العنوان</th>
          <th>القطاع</th>
          <th>حجم التأثير</th>
          <th>السجلات</th>
          <th>المصدر</th>
          <th>الحالة</th>
        </tr>
      </thead>
      <tbody>
        ${data.leaksSummary.slice(0, 50).map((l: any) => `
        <tr>
          <td style="font-family:monospace;color:#06b6d4;font-size:10px;">${l.leakId || "—"}</td>
          <td>${l.title}</td>
          <td>${l.sector}</td>
          <td><span class="severity-badge severity-${l.severity}">${l.severity === "critical" ? "واسع النطاق" : l.severity === "high" ? "عالي" : l.severity === "medium" ? "متوسط" : "منخفض"}</span></td>
          <td>${Number(l.records).toLocaleString()}</td>
          <td>${l.source === "telegram" ? "تليجرام" : l.source === "darkweb" ? "دارك ويب" : "موقع لصق"}</td>
          <td>${l.status === "new" ? "جديد" : l.status === "analyzing" ? "قيد التحليل" : l.status === "documented" ? "موثّق" : "تم التوثيق"}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    ${data.leaksSummary.length > 50 ? `<p style="text-align:center;font-size:11px;color:#64748b;margin-top:12px;">عرض 50 من أصل ${data.leaksSummary.length} حالة رصد</p>` : ""}
  </div>` : ""}

  ${selectedSections.includes("recommendations") ? `
  <div class="section">
    <div class="section-title">💡 التوصيات</div>
    <div style="space-y:8px;">
      <div class="rec-item"><div class="rec-bullet"></div><div>تطبيق التشفير الإلزامي للبيانات الحساسة في جميع القطاعات</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>إنشاء فريق استجابة وطني لحالات رصد البيانات الشخصية</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>تحديث معايير PDPL للقطاع الصحي وقطاع الاتصالات</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>إلزام الجهات بتوثيق حالات الرصد خلال 72 ساعة</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>تطوير نظام إنذار مبكر متكامل مع منصة راصد</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>إطلاق برنامج توعية وطني لحماية البيانات الشخصية</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>تعزيز ضوابط الوصول لقواعد البيانات الحساسة</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>تدقيق أمني دوري للبنية التحتية الرقمية</div></div>
    </div>
  </div>` : ""}

  <div class="footer">
    <div class="footer-motto">❝ حماية البيانات الشخصية متطلب وطني ❞</div>
    <p>هذا التقرير صادر من منصة راصد — مكتب إدارة البيانات الوطنية (NDMO)</p>
    <p>رمز التحقق: ${verificationCode} | تاريخ الإصدار: ${now.toISOString()}</p>
    <p style="margin-top:8px;">⚠️ هذا التقرير سري ومخصص للاستخدام الرسمي فقط</p>
  </div>
</div>
</body>
</html>`;

      setGeneratedReport({
        htmlContent,
        verificationCode,
        title: reportTitle,
        generatedAt: now.toISOString(),
      });
      setStep("done");
      toast.success("تم إنشاء التقرير بنجاح", {
        description: `رمز التحقق: ${verificationCode}`,
      });
    } catch (err) {
      toast.error("فشل إنشاء التقرير");
      setStep("customize");
    }
  };

  const handlePrint = () => {
    if (!generatedReport) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatedReport.htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleDownload = () => {
    if (!generatedReport) return;
    const blob = new Blob([generatedReport.htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${generatedReport.verificationCode}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setStep("customize");
    setGeneratedReport(null);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        {open && step !== "warning" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-card border border-border rounded-2xl shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/20 border border-primary/30">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-bold text-sm">
                      {step === "done" ? "التقرير جاهز" : step === "generating" ? "جاري إنشاء التقرير..." : "إنشاء تقرير مخصص"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {step === "done" ? "يمكنك طباعة أو تحميل التقرير" : step === "generating" ? "يرجى الانتظار..." : "خصّص محتوى التقرير ونطاقه قبل الإصدار"}
                    </p>
                  </div>
                  <button onClick={handleClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {step === "generating" && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-12 h-12 text-primary" />
                    </motion.div>
                    <p className="text-muted-foreground text-sm">جاري تجميع البيانات وإنشاء التقرير...</p>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === "done" && generatedReport && (
                  <div className="space-y-5">
                    <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-400">تم إنشاء التقرير بنجاح</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          رمز التحقق: <span className="font-mono text-primary">{generatedReport.verificationCode}</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-3">معاينة التقرير</h4>
                      <div className="rounded-lg border border-border overflow-hidden bg-[#0a0f1a]" style={{ height: 400 }}>
                        <iframe
                          srcDoc={generatedReport.htmlContent}
                          className="w-full h-full"
                          title="Report Preview"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1 gap-2" onClick={handlePrint}>
                        <Printer className="w-4 h-4" />
                        طباعة التقرير
                      </Button>
                      <Button className="flex-1 gap-2" variant="outline" onClick={handleDownload}>
                        <Download className="w-4 h-4" />
                        تحميل HTML
                      </Button>
                    </div>
                  </div>
                )}

                {step === "customize" && (
                  <div className="space-y-6">
                    {/* Report Title */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 block">عنوان التقرير</label>
                      <input
                        type="text"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-colors"
                        dir="rtl"
                      />
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        النطاق الزمني (اختياري)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                        />
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Severity Filter */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        مستويات التأثير
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SEVERITY_OPTIONS.map((sev) => (
                          <button
                            key={sev.value}
                            onClick={() => toggleSeverity(sev.value)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                              selectedSeverities.includes(sev.value)
                                ? sev.color
                                : "text-muted-foreground bg-secondary/30 border-border/50 opacity-50"
                            }`}
                          >
                            {sev.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Source Filter */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        مصادر الرصد
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SOURCE_OPTIONS.map((src) => (
                          <button
                            key={src.value}
                            onClick={() => toggleSource(src.value)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                              selectedSources.includes(src.value)
                                ? "text-primary bg-primary/10 border-primary/30"
                                : "text-muted-foreground bg-secondary/30 border-border/50 opacity-50"
                            }`}
                          >
                            {src.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sector Filter */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        القطاعات (اترك فارغاً لتضمين الكل)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {SECTORS.map((sector) => (
                          <button
                            key={sector}
                            onClick={() => toggleSector(sector)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                              selectedSectors.includes(sector)
                                ? "text-violet-400 bg-violet-500/10 border-violet-500/30"
                                : "text-muted-foreground bg-secondary/30 border-border/50 hover:border-border"
                            }`}
                          >
                            {sector}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Report Sections */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5" />
                        أقسام التقرير
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {REPORT_SECTIONS.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => toggleSection(section.id)}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-right transition-all ${
                              selectedSections.includes(section.id)
                                ? "bg-primary/5 border-primary/30"
                                : "bg-secondary/20 border-border/50 opacity-60"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                              selectedSections.includes(section.id)
                                ? "bg-primary border-primary"
                                : "border-border"
                            }`}>
                              {selectedSections.includes(section.id) && (
                                <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{section.label}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{section.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="bg-secondary/20 rounded-xl p-4 border border-border/30 space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground">خيارات إضافية</h4>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeEvidence}
                          onChange={(e) => setIncludeEvidence(e.target.checked)}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-xs text-foreground">تضمين لقطات الأدلة</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeSampleData}
                          onChange={(e) => setIncludeSampleData(e.target.checked)}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-xs text-foreground">تضمين عينات البيانات المسربة</span>
                      </label>
                    </div>

                    {/* Generate Button */}
                    <Button
                      className="w-full gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-6"
                      onClick={handleProceedToWarning}
                    >
                      <FileText className="w-5 h-5" />
                      إصدار التقرير
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compliance Warning */}
      <ComplianceWarningDialog
        open={step === "warning"}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setStep("customize")}
        reportType="التقرير"
      />
    </>
  );
}
