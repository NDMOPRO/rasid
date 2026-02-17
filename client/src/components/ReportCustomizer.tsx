import { useState, useCallback } from "react";
import { FileText, Settings, Palette, Download, Eye, CheckCircle2, Loader2, FileOutput, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ComplianceWarningDialog from "./ComplianceWarningDialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ReportCustomizerProps {
  /** Pre-fill data from a scan result or other source */
  defaultData?: {
    recordId?: string;
    domain?: string;
    complianceScore?: number;
    sectorType?: string;
    coreData?: Record<string, any>;
    description?: string;
    classifications?: string[];
  };
  onGenerated?: (result: any) => void;
}

const REPORT_TYPES = [
  { value: "compliance_report", label: "تقرير امتثال", icon: "✅", desc: "تقرير شامل عن حالة الامتثال لنظام حماية البيانات" },
  { value: "incident_report", label: "توثيق حادثة", icon: "🔴", desc: "توثيق رسمي لحادثة تسريب أو انتهاك بيانات" },
  { value: "executive_summary", label: "ملخص تنفيذي", icon: "📊", desc: "ملخص مختصر للإدارة العليا" },
  { value: "sector_report", label: "تقرير قطاعي", icon: "🏢", desc: "تقرير شامل عن قطاع محدد" },
  { value: "custom_report", label: "تقرير مخصص", icon: "📋", desc: "تقرير بتنسيق مخصص حسب الحاجة" },
];

export default function ReportCustomizer({ defaultData, onGenerated }: ReportCustomizerProps) {
  const [step, setStep] = useState(1);
  const [showWarning, setShowWarning] = useState(false);

  // Form state
  const [reportType, setReportType] = useState(defaultData?.complianceScore !== undefined ? "compliance_report" : "custom_report");
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState(defaultData?.description || "");
  const [includeAiAnalysis, setIncludeAiAnalysis] = useState(true);
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);

  const generateMutation = trpc.documentation.generate.useMutation({
    onSuccess: (result) => {
      toast.success(`✅ تم إصدار الوثيقة بنجاح - رقم الوثيقة: ${result.documentId}`);
      onGenerated?.(result);
      setStep(4);
    },
    onError: (err) => {
      toast.error(`❌ خطأ في إصدار الوثيقة: ${err.message}`);
    },
  });

  const handleGenerateClick = useCallback(() => {
    if (!titleAr.trim()) {
      toast.error("يرجى إدخال عنوان الوثيقة");
      return;
    }
    setShowWarning(true);
  }, [titleAr, toast]);

  const handleConfirmGenerate = useCallback(() => {
    setShowWarning(false);
    generateMutation.mutate({
      recordId: defaultData?.recordId,
      title: title || titleAr,
      titleAr,
      documentType: reportType as any,
      coreData: {
        ...defaultData?.coreData,
        domain: defaultData?.domain,
        complianceScore: defaultData?.complianceScore,
        sectorType: defaultData?.sectorType,
        includeAiAnalysis,
        includeEvidence,
        includeRecommendations,
      },
      description,
      classifications: defaultData?.classifications,
      complianceScore: defaultData?.complianceScore,
      sectorType: defaultData?.sectorType,
      domain: defaultData?.domain,
      baseUrl: window.location.origin,
    });
  }, [reportType, title, titleAr, description, defaultData, includeAiAnalysis, includeEvidence, includeRecommendations, generateMutation]);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            <span className={`text-sm ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
              {s === 1 ? "نوع التقرير" : s === 2 ? "التفاصيل" : "المراجعة"}
            </span>
            {s < 3 && <div className={`h-px w-8 ${step > s ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      
        {/* Step 1: Report Type */}
        {step === 1 && (
          <div
            key="step1"
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-foreground">اختر نوع التقرير</h3>
            <div className="grid gap-3">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setReportType(type.value)}
                  className={`flex items-center gap-4 rounded-xl border p-4 text-end transition-all hover:shadow-md ${
                    reportType === type.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50 bg-card/50 hover:border-border"
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{type.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{type.desc}</div>
                  </div>
                  {reportType === type.value && (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                التالي
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div
            key="step2"
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-foreground">تفاصيل التقرير</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">عنوان التقرير (عربي) *</label>
                <Input
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: تقرير امتثال موقع example.com"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">عنوان التقرير (إنجليزي)</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Compliance Report for example.com"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">وصف إضافي</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أضف أي ملاحظات أو وصف إضافي..."
                  className="w-full h-24 rounded-md border border-border bg-background px-3 py-2 text-sm resize-none"
                />
              </div>

              {/* Options */}
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  خيارات المحتوى
                </h4>
                {[
                  { key: "ai", label: "تضمين تحليل الذكاء الاصطناعي", state: includeAiAnalysis, setter: setIncludeAiAnalysis },
                  { key: "evidence", label: "تضمين سلسلة الأدلة", state: includeEvidence, setter: setIncludeEvidence },
                  { key: "recs", label: "تضمين التوصيات", state: includeRecommendations, setter: setIncludeRecommendations },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={opt.state}
                      onChange={(e) => opt.setter(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm text-foreground">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>السابق</Button>
              <Button onClick={() => setStep(3)}>التالي</Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div
            key="step3"
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-foreground">مراجعة قبل الإصدار</h3>
            <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">نوع التقرير</div>
                  <div className="text-sm font-medium text-foreground">
                    {REPORT_TYPES.find(t => t.value === reportType)?.icon} {REPORT_TYPES.find(t => t.value === reportType)?.label}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">العنوان</div>
                  <div className="text-sm font-medium text-foreground">{titleAr || "—"}</div>
                </div>
                {defaultData?.domain && (
                  <div>
                    <div className="text-xs text-muted-foreground">النطاق</div>
                    <div className="text-sm font-mono text-foreground" dir="ltr">{defaultData.domain}</div>
                  </div>
                )}
                {defaultData?.complianceScore !== undefined && (
                  <div>
                    <div className="text-xs text-muted-foreground">درجة الامتثال</div>
                    <div className="text-sm font-bold text-foreground">{defaultData.complianceScore}%</div>
                  </div>
                )}
              </div>
              {description && (
                <div>
                  <div className="text-xs text-muted-foreground">الوصف</div>
                  <div className="text-sm text-foreground">{description}</div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgba(197,165,90,0.10)]/50">
                {includeAiAnalysis && <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">تحليل ذكاء اصطناعي</span>}
                {includeEvidence && <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">سلسلة أدلة</span>}
                {includeRecommendations && <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">توصيات</span>}
              </div>
            </div>

            {/* Security notice */}
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <Shield className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-xs text-muted-foreground">
                سيتم إصدار وثيقة رسمية مع رمز تحقق فريد وبصمة SHA-256. سيتم تسجيل هذا الإجراء في سجل التدقيق.
              </p>
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>السابق</Button>
              <Button
                onClick={handleGenerateClick}
                disabled={generateMutation.isPending}
                className="bg-gradient-to-l from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white"
              >
                {generateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    جارٍ الإصدار...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FileOutput className="h-4 w-4" />
                    إصدار الوثيقة
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && generateMutation.data && (
          <div
            key="step4"
            className="text-center space-y-4"
          >
            <div
            >
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-foreground">تم إصدار الوثيقة بنجاح</h3>
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 space-y-2 text-end">
              <div className="flex justify-between text-sm">
                <span className="font-mono text-foreground" dir="ltr">{generateMutation.data.documentId}</span>
                <span className="text-muted-foreground">رقم الوثيقة</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-mono text-foreground" dir="ltr">{generateMutation.data.verificationCode}</span>
                <span className="text-muted-foreground">رمز التحقق</span>
              </div>
            </div>
            {(generateMutation.data as any).qrCodeDataUrl && (
              <div className="flex justify-center">
                <img src={(generateMutation.data as any).qrCodeDataUrl} alt="QR Code" className="w-32 h-32 rounded-lg" />
              </div>
            )}
            <Button onClick={() => { setStep(1); setTitleAr(""); setTitle(""); setDescription(""); }} variant="outline">
              إصدار وثيقة جديدة
            </Button>
          </div>
        )}
      

      {/* Compliance Warning Dialog */}
      <ComplianceWarningDialog
        open={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={handleConfirmGenerate}
        documentType={REPORT_TYPES.find(t => t.value === reportType)?.label || "تقرير"}
        isLoading={generateMutation.isPending}
      />
    </div>
  );
}
