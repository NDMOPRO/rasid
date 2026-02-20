/**
 * LeakDetailDrilldown — Reusable deep-drill component for leak details
 * Fetches full incident details from API and shows all tabs + "Document Incident" button
 * Updated to show ALL fields from final_v3_database.json 1:1
 */
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Shield,
  Eye,
  Brain,
  Download,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Hash,
  Calendar,
  Globe,
  User,
  Database,
  Fingerprint,
  CheckCircle2,
  Printer,
  QrCode,
  ChevronLeft,
  Lock,
  Skull,
  DollarSign,
  Zap,
  Link2,
  Table,
  Scale,
  Building2,
  MapPin,
  Image,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ComplianceWarningDialog from "./ComplianceWarningDialog";

const severityLabel = (s: string) => {
  switch (s) {
    case "critical": return "واسع النطاق";
    case "high": return "مرتفع التأثير";
    case "medium": return "متوسط التأثير";
    default: return "محدود التأثير";
  }
};

const severityColor = (s: string) => {
  switch (s) {
    case "critical": return "text-red-400 bg-red-500/10 border-red-500/30";
    case "high": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    default: return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  }
};

const sourceLabel = (s: string) => {
  switch (s) {
    case "telegram": return "تليجرام";
    case "darkweb": return "دارك ويب";
    default: return "موقع لصق";
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case "new": return "جديد";
    case "analyzing": return "قيد التحليل";
    case "documented": return "موثّق";
    default: return "مكتمل";
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "new": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    case "analyzing": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "documented": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    default: return "text-violet-400 bg-violet-500/10 border-violet-500/30";
  }
};

type TabId = "overview" | "sample" | "evidence" | "ai";

interface LeakDetailDrilldownProps {
  leak: any;
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function LeakDetailDrilldown({ leak, open, onClose, onBack, showBackButton }: LeakDetailDrilldownProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<{ documentId: string; verificationCode: string; htmlContent: string } | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showComplianceWarning, setShowComplianceWarning] = useState(false);

  const leakId = leak?.leakId;
  const { data: fullDetail, isLoading: detailLoading } = trpc.leaks.detail.useQuery(
    { leakId: leakId! },
    { enabled: !!leakId && open }
  );

  useEffect(() => {
    if (open) {
      setActiveTab("overview");
      setGeneratedDoc(null);
    }
  }, [leakId, open]);

  const generateDocMutation = trpc.documentation.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedDoc(data);
      setIsGeneratingDoc(false);
      toast.success("تم توثيق الحادثة بنجاح", { description: `رقم التحقق: ${data.verificationCode}` });
    },
    onError: (err) => {
      setIsGeneratingDoc(false);
      toast.error("خطأ في التوثيق", { description: err.message });
    },
  });

  const handleGenerateDoc = useCallback(() => {
    if (!leakId) return;
    setShowComplianceWarning(true);
  }, [leakId]);

  const handleConfirmGenerate = useCallback(() => {
    if (!leakId) return;
    setShowComplianceWarning(false);
    setIsGeneratingDoc(true);
    generateDocMutation.mutate({
      title: detail?.title || '',
      titleAr: detail?.titleAr || '',
      documentType: 'incident_report' as const,
      coreData: {
        leakId,
        severity: detail?.severity,
        source: detail?.source,
        recordCount: detail?.recordCount,
        threatActor: detail?.threatActor,
        victim: detail?.victim,
        sectorAr: detail?.sectorAr,
        breachMethodAr: detail?.breachMethodAr,
      },
      description: detail?.descriptionAr || '',
      baseUrl: window.location.origin,
      recordId: leakId,
    });
  }, [leakId]);

  const handlePrintDoc = useCallback(() => {
    if (!generatedDoc) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatedDoc.htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  }, [generatedDoc]);

  const handleDownloadDoc = useCallback(async () => {
    if (!generatedDoc || !leakId) return;
    try {
      const printToolbar = `
        <div id="print-toolbar" dir="rtl" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#0a2540,#0c3054);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 20px rgba(0,0,0,0.3);font-family:'Tajawal',sans-serif;">
          <div style="display:flex;align-items:center;gap:12px;">
            <button onclick="document.getElementById('print-toolbar').style.display='none';window.print();setTimeout(()=>document.getElementById('print-toolbar').style.display='flex',500);" style="background:linear-gradient(135deg,#0d9488,#06b6d4);color:white;border:none;padding:10px 28px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Tajawal',sans-serif;display:flex;align-items:center;gap:8px;">
              ⬇ حفظ كـ PDF
            </button>
            <span style="color:rgba(255,255,255,0.5);font-size:12px;">اختر "حفظ كـ PDF" من نافذة الطباعة</span>
          </div>
          <span style="color:rgba(255,255,255,0.4);font-size:11px;">منصة راصد — توثيق حالة رصد</span>
        </div>
        <div style="height:56px;"></div>
      `;
      const htmlWithToolbar = generatedDoc.htmlContent.replace('<div class="page">', printToolbar + '<div class="page">');
      toast.info("جاري تحميل الملف...");
      const blob = new Blob([htmlWithToolbar], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `توثيق-حادثة-${leakId}-${generatedDoc.verificationCode}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("تم تحميل الملف — افتحه في المتصفح واختر طباعة > حفظ كـ PDF");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("حدث خطأ أثناء تحميل الملف");
    }
  }, [generatedDoc, leakId]);

  if (!open || !leak) return null;

  const detail = fullDetail || leak;
  const sampleData = (detail.sampleData as Array<Record<string, string>>) || [];
  const piiTypes = (detail.piiTypes as string[]) || [];
  const piiTypesAr = (detail.piiTypesAr as string[]) || [];
  const aiRecommendations = (detail.aiRecommendationsAr as string[]) || (detail.aiRecommendations as string[]) || [];
  const evidence = detail.evidence || [];
  const evidenceFiles = (detail.evidenceFiles as string[]) || [];
  const screenshotUrls = (detail.screenshotUrls as string[]) || [];
  const sourcesInfo = (detail.sourcesInfo as Array<{ name: string; url: string }>) || [];
  const attackerInfo = (detail.attackerInfo as Record<string, any>) || {};
  const aiAnalysis = (detail.aiAnalysis as Record<string, any>) || {};
  const pdplAnalysis = (detail.pdplAnalysis as Record<string, any>) || {};
  const overviewData = (detail.overviewData as Record<string, any>) || {};
  const sampleFields = (detail.sampleFields as string[]) || [];
  const sampleFieldsEn = (detail.sampleFieldsEn as string[]) || [];
  const allEvidenceImages = [...evidenceFiles, ...screenshotUrls.filter((u: string) => !evidenceFiles.includes(u))];

  const tabs = [
    { id: "overview" as TabId, label: "نظرة عامة", icon: Eye },
    { id: "sample" as TabId, label: `البيانات المسربة (${sampleData.length})`, icon: Table },
    { id: "ai" as TabId, label: "تحليل AI", icon: Brain },
    { id: "evidence" as TabId, label: `المصادر والأدلة (${allEvidenceImages.length + sourcesInfo.length})`, icon: Shield },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-card border border-border rounded-2xl shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {detailLoading && !fullDetail ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-muted-foreground mr-3">جاري تحميل التفاصيل...</span>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border p-4">
                    <div className="flex items-center gap-3">
                      {showBackButton && onBack && (
                        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30">
                        <Shield className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-foreground font-bold text-sm truncate">{detail.titleAr}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{detail.leakId}</span>
                          {detail.victim && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {detail.victim}
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${severityColor(detail.severity)}`}>
                            {severityLabel(detail.severity)}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColor(detail.status)}`}>
                            {statusLabel(detail.status)}
                          </span>
                          {detail.threatActor && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                              <Skull className="w-3 h-3" /> {detail.threatActor}
                            </span>
                          )}
                          {detail.leakPrice && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> {detail.leakPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!generatedDoc ? (
                          <Button
                            size="sm"
                            onClick={handleGenerateDoc}
                            disabled={isGeneratingDoc}
                            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-xs gap-1.5"
                          >
                            {isGeneratingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                            توثيق حادثة التسرب
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="outline" onClick={handlePrintDoc} className="text-xs gap-1">
                              <Printer className="w-3 h-3" /> طباعة
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleDownloadDoc} className="text-xs gap-1">
                              <Download className="w-3 h-3" /> تحميل PDF
                            </Button>
                            <a href={`/public/verify/${generatedDoc.verificationCode}`} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-teal-400 hover:text-teal-300 px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20">
                              <QrCode className="w-3 h-3" /> {generatedDoc.verificationCode}
                            </a>
                          </div>
                        )}
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-3 bg-secondary/50 rounded-lg p-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                              activeTab === tab.id
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* ═══ OVERVIEW TAB ═══ */}
                    {activeTab === "overview" && (
                      <>
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Globe className="w-3 h-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground">المصدر</p>
                            </div>
                            <p className="text-sm font-medium text-foreground">{sourceLabel(detail.source)}</p>
                            {detail.sourcePlatform && <p className="text-[10px] text-muted-foreground mt-1">{detail.sourcePlatform}</p>}
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Database className="w-3 h-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground">السجلات المكشوفة</p>
                            </div>
                            <p className="text-sm font-bold text-red-400">{detail.recordCount?.toLocaleString()}</p>
                            {overviewData.data_size && <p className="text-[10px] text-muted-foreground mt-1">{overviewData.data_size}</p>}
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Zap className="w-3 h-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground">طريقة الاختراق</p>
                            </div>
                            <p className="text-sm text-foreground font-medium">{detail.breachMethodAr || "غير محدد"}</p>
                            {detail.breachMethod && detail.breachMethod !== detail.breachMethodAr && (
                              <p className="text-[10px] text-muted-foreground mt-1" dir="ltr">{detail.breachMethod}</p>
                            )}
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground">تاريخ الاكتشاف</p>
                            </div>
                            <p className="text-sm text-foreground">{detail.detectedAt ? new Date(detail.detectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
                          </div>
                        </div>

                        {/* Threat Actor & Source Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-gradient-to-br from-red-500/5 to-red-500/10 rounded-xl p-4 border border-red-500/20">
                            <h4 className="text-xs font-semibold text-red-400 mb-3 flex items-center gap-1.5">
                              <Skull className="w-3.5 h-3.5" /> معلومات المهاجم / البائع
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">الاسم المستعار</span>
                                <span className="text-sm font-mono text-red-400 font-bold">{detail.threatActor || attackerInfo.alias || "مجهول"}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">السعر المطلوب</span>
                                <span className="text-sm font-mono text-amber-400 font-bold">{detail.leakPrice || attackerInfo.price || "غير محدد"}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">المنصة</span>
                                <span className="text-sm text-foreground">{detail.sourcePlatform || attackerInfo.platform || sourceLabel(detail.source)}</span>
                              </div>
                              {attackerInfo.group && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">المجموعة</span>
                                  <span className="text-sm text-foreground">{attackerInfo.group}</span>
                                </div>
                              )}
                              {attackerInfo.known_attacks && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">هجمات معروفة</span>
                                  <span className="text-sm text-foreground">{attackerInfo.known_attacks}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-violet-500/5 to-violet-500/10 rounded-xl p-4 border border-violet-500/20">
                            <h4 className="text-xs font-semibold text-violet-400 mb-3 flex items-center gap-1.5">
                              <Link2 className="w-3.5 h-3.5" /> مصدر الرصد
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">القطاع</span>
                                <span className="text-sm text-foreground">{detail.sectorAr}</span>
                              </div>
                              {detail.category && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">التصنيف</span>
                                  <span className="text-sm text-foreground">{detail.category}</span>
                                </div>
                              )}
                              {detail.regionAr && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">المنطقة</span>
                                  <span className="text-sm text-foreground">{detail.regionAr} {detail.cityAr ? `— ${detail.cityAr}` : ""}</span>
                                </div>
                              )}
                              {detail.dataSensitivity && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">حساسية البيانات</span>
                                  <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">{detail.dataSensitivity}</Badge>
                                </div>
                              )}
                              {detail.sourceUrl && (
                                <div className="mt-2 pt-2 border-t border-border/30">
                                  <a href={detail.sourceUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 rounded-lg p-2">
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate font-mono" dir="ltr">{detail.sourceUrl}</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> وصف الحادثة
                          </h4>
                          <p className="text-sm text-foreground leading-relaxed">{detail.descriptionAr || "لا يوجد وصف متاح"}</p>
                          {detail.description && detail.description !== detail.descriptionAr && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                              <p className="text-[10px] text-muted-foreground mb-1">English Description</p>
                              <p className="text-xs text-muted-foreground leading-relaxed" dir="ltr">{detail.description}</p>
                            </div>
                          )}
                        </div>

                        {/* PII Types - Arabic & English */}
                        {(piiTypesAr.length > 0 || piiTypes.length > 0) && (
                          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                              <Fingerprint className="w-3.5 h-3.5" />
                              أنواع البيانات الشخصية المكتشفة ({piiTypesAr.length || piiTypes.length} نوع)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {(piiTypesAr.length > 0 ? piiTypesAr : piiTypes).map((type: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                                  <Lock className="w-3 h-3 text-red-400 shrink-0" />
                                  <div>
                                    <span className="text-xs text-foreground block">{type}</span>
                                    {piiTypesAr.length > 0 && piiTypes[i] && (
                                      <span className="text-[10px] text-muted-foreground" dir="ltr">{piiTypes[i]}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ═══ SAMPLE DATA TAB ═══ */}
                    {activeTab === "sample" && (
                      <div className="space-y-4">
                        {sampleData.length > 0 ? (
                          <>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                              <p className="text-xs text-red-400">تنبيه: البيانات أدناه عينات توضيحية من حالة الرصد لأغراض التوثيق فقط</p>
                            </div>

                            {/* Sample Fields */}
                            {sampleFields.length > 0 && (
                              <div className="bg-secondary/30 rounded-xl p-3 border border-border/30">
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2">حقول العينة ({sampleFields.length} حقل)</h4>
                                <div className="flex flex-wrap gap-2">
                                  {sampleFields.map((f: string, i: number) => (
                                    <span key={i} className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                                      {f} {sampleFieldsEn[i] ? `(${sampleFieldsEn[i]})` : ""}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="overflow-x-auto rounded-lg border border-border">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-secondary/50">
                                    <th className="p-2.5 text-right font-medium text-muted-foreground border-b border-border whitespace-nowrap">#</th>
                                    {Object.keys(sampleData[0]).map((key) => (
                                      <th key={key} className="p-2.5 text-right font-medium text-muted-foreground border-b border-border whitespace-nowrap">
                                        {key}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sampleData.map((row: Record<string, string>, i: number) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                                      <td className="p-2.5 text-muted-foreground font-mono">{i + 1}</td>
                                      {Object.values(row).map((val: string, j: number) => (
                                        <td key={j} className="p-2.5 text-foreground whitespace-nowrap">{val}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-[10px] text-muted-foreground text-center">
                              عرض {sampleData.length} عينة من أصل {detail.recordCount?.toLocaleString()} سجل مسرب
                              {detail.totalSampleRecords ? ` (إجمالي العينات: ${detail.totalSampleRecords})` : ""}
                            </p>
                          </>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Database className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">لا توجد عينات بيانات متاحة لحالة الرصد هذه</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ═══ AI ANALYSIS TAB ═══ */}
                    {activeTab === "ai" && (
                      <div className="space-y-4">
                        {(detail.aiSummaryAr || aiAnalysis.executive_summary) ? (
                          <>
                            {/* Executive Summary */}
                            <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/20">
                              <div className="flex items-center gap-2 mb-3">
                                <Brain className="w-4 h-4 text-purple-400" />
                                <h4 className="text-xs font-semibold text-purple-400">الملخص التنفيذي</h4>
                                {(detail.aiConfidence || aiAnalysis.confidence_percentage) && (
                                  <Badge variant="outline" className="text-[10px] mr-auto border-purple-500/30 text-purple-400">
                                    ثقة: {detail.aiConfidence || aiAnalysis.confidence_percentage}%
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-foreground leading-relaxed">{detail.aiSummaryAr || aiAnalysis.executive_summary}</p>
                              {(detail.aiSummary || aiAnalysis.executive_summary_en) && (
                                <div className="mt-3 pt-3 border-t border-border/30">
                                  <p className="text-[10px] text-muted-foreground mb-1">English Summary</p>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed" dir="ltr">{detail.aiSummary || aiAnalysis.executive_summary_en}</p>
                                </div>
                              )}
                            </div>

                            {/* Impact Assessment */}
                            {(aiAnalysis.impact_assessment || detail.aiSeverity) && (
                              <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                                <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" /> تقييم الأثر
                                </h4>
                                <div className="flex items-center gap-3">
                                  <Badge className={`${severityColor(detail.aiSeverity || 'high')} text-xs`}>
                                    {aiAnalysis.impact_assessment || severityLabel(detail.aiSeverity || '')}
                                  </Badge>
                                  {aiAnalysis.impact_assessment_en && (
                                    <span className="text-[10px] text-muted-foreground">{aiAnalysis.impact_assessment_en}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Recommendations */}
                            {aiRecommendations.length > 0 && (
                              <div className="bg-teal-500/5 rounded-xl p-4 border border-teal-500/20">
                                <h4 className="text-xs font-semibold text-teal-400 mb-3">التوصيات</h4>
                                <div className="space-y-2">
                                  {aiRecommendations.map((rec: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
                                      <p className="text-xs text-foreground">{rec}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* PDPL Analysis */}
                            {(pdplAnalysis.violated_articles || pdplAnalysis.risk_level) && (
                              <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
                                <h4 className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
                                  <Scale className="w-3.5 h-3.5" /> تحليل نظام حماية البيانات الشخصية (PDPL)
                                </h4>
                                <div className="space-y-2">
                                  {pdplAnalysis.violated_articles && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">المواد المنتهكة</span>
                                      <span className="text-sm text-amber-400 font-medium">{pdplAnalysis.violated_articles}</span>
                                    </div>
                                  )}
                                  {pdplAnalysis.estimated_fine_sar && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">الغرامة المقدرة (ريال)</span>
                                      <span className="text-sm text-red-400 font-bold">{pdplAnalysis.estimated_fine_sar}</span>
                                    </div>
                                  )}
                                  {pdplAnalysis.risk_level && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">مستوى المخاطر</span>
                                      <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">{pdplAnalysis.risk_level}</Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {(detail.enrichedAt || aiAnalysis.analysis_date) && (
                              <p className="text-[10px] text-muted-foreground text-center">
                                تاريخ التحليل: {aiAnalysis.analysis_date || (detail.enrichedAt ? new Date(detail.enrichedAt).toLocaleDateString("ar-SA") : "")}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">لم يتم إثراء حالة الرصد بالذكاء الاصطناعي بعد</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ═══ SOURCES & EVIDENCE TAB ═══ */}
                    {activeTab === "evidence" && (
                      <div className="space-y-4">
                        {/* Sources List */}
                        {sourcesInfo.length > 0 && (
                          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> المصادر ({sourcesInfo.length})
                            </h4>
                            <div className="space-y-2">
                              {sourcesInfo.map((src: { name: string; url: string }, i: number) => (
                                <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary/80 border border-border/30 transition-colors group">
                                  <div className="p-1.5 rounded-lg bg-primary/10">
                                    <ExternalLink className="w-3 h-3 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground">{src.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate" dir="ltr">{src.url}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Evidence Images */}
                        {allEvidenceImages.length > 0 && (
                          <>
                            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                              <Image className="w-3.5 h-3.5" /> صور الأدلة ({allEvidenceImages.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {allEvidenceImages.map((url: string, i: number) => (
                                <div
                                  key={i}
                                  className="rounded-lg overflow-hidden border border-border bg-secondary/30 cursor-pointer hover:border-primary/50 transition-all group"
                                  onClick={() => setLightboxUrl(url)}
                                >
                                  <img
                                    src={url}
                                    alt={`Evidence ${i + 1}`}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                  <div className="p-2 flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">دليل #{i + 1}</span>
                                    <span className="text-[10px] text-primary flex items-center gap-1">
                                      <Eye className="w-3 h-3" /> اضغط للتكبير
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Evidence Chain */}
                        {evidence.length > 0 && (
                          <>
                            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mt-4">
                              <Hash className="w-3.5 h-3.5" /> سلسلة الأدلة الرقمية ({evidence.length})
                            </h4>
                            <div className="overflow-x-auto rounded-lg border border-border">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-secondary/50">
                                    <th className="p-2.5 text-right font-medium text-muted-foreground border-b border-border">#</th>
                                    <th className="p-2.5 text-right font-medium text-muted-foreground border-b border-border">النوع</th>
                                    <th className="p-2.5 text-right font-medium text-muted-foreground border-b border-border">بصمة المحتوى</th>
                                    <th className="p-2.5 text-right font-medium text-muted-foreground border-b border-border">التاريخ</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {evidence.map((e: any, i: number) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                                      <td className="p-2.5 text-muted-foreground">{e.blockIndex}</td>
                                      <td className="p-2.5 text-foreground">{e.evidenceType}</td>
                                      <td className="p-2.5 font-mono text-indigo-400 text-[10px]">{e.contentHash?.substring(0, 24)}...</td>
                                      <td className="p-2.5 text-foreground">{new Date(e.createdAt).toLocaleDateString("ar-SA")}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}

                        {allEvidenceImages.length === 0 && evidence.length === 0 && sourcesInfo.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            <Shield className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">لا توجد أدلة أو مصادر متاحة لحالة الرصد هذه</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compliance Warning */}
      <ComplianceWarningDialog
        open={showComplianceWarning}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setShowComplianceWarning(false)}
        reportType="توثيق الحادثة"
      />

      {/* Screenshot Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setLightboxUrl(null)} className="absolute -top-10 left-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
              <img src={lightboxUrl} alt="Evidence Screenshot" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/10 object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
