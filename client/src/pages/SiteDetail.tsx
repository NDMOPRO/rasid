import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowRight, Globe, Mail, Phone, Shield, ExternalLink, CheckCircle, XCircle,
  FileText, Send, Loader2, Clock, TrendingUp, TrendingDown, Minus, ShieldCheck,
  ShieldX, ShieldAlert, FileX, BarChart3, History, AlertTriangle, Camera, Eye,
  Presentation, Server, Lock, FileSearch, User, MapPin, BookOpen, Languages,
} from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ScreenshotZoomDialog } from "@/components/ScreenshotPreview";
import { useAuth } from "@/_core/hooks/useAuth";
import { Images, ChevronLeft, ChevronRight, ArrowLeftRight, Stamp } from "lucide-react";
import ReportCustomizer from "@/components/ReportCustomizer";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const clauseNames = [
  "تحديد الغرض من جمع البيانات الشخصية",
  "تحديد محتوى البيانات الشخصية المطلوب جمعها",
  "تحديد طريقة جمع البيانات الشخصية",
  "تحديد وسيلة حفظ البيانات الشخصية",
  "تحديد كيفية معالجة البيانات الشخصية",
  "تحديد كيفية إتلاف البيانات الشخصية",
  "تحديد حقوق صاحب البيانات الشخصية",
  "كيفية ممارسة صاحب البيانات لحقوقه",
];

const statusLabels: Record<string, string> = {
  compliant: "ممتثل",
  partially_compliant: "ممتثل جزئياً",
  non_compliant: "غير ممتثل",
  no_policy: "غير ممتثل",
  not_working: "لا يعمل",
};

const statusIcons: Record<string, React.ReactNode> = {
  compliant: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
  partially_compliant: <ShieldAlert className="h-4 w-4 text-amber-500" />,
  non_compliant: <ShieldX className="h-4 w-4 text-red-500" />,
  no_policy: <ShieldX className="h-4 w-4 text-red-500" />,
  not_working: <FileX className="h-4 w-4 text-zinc-500" />,
};

export default function SiteDetail() {
  const { playClick, playHover } = useSoundEffects();
  const [match, params] = useRoute("/sites/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const id = parseInt(params?.id || "0");
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<any>(null);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [showReportCustomizer, setShowReportCustomizer] = useState(false);

  const { data: site, isLoading } = trpc.sites.getById.useQuery({ id }, { enabled: id > 0 });

  const generateLetter = trpc.letters.generateLetter.useMutation({
    onSuccess: (data) => {
      setGeneratedLetter(data);
      setShowLetterPreview(true);
      toast.success("تم إنشاء الخطاب بنجاح");
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const exportPptx = trpc.reports.exportPptx.useMutation({
    onSuccess: async (data) => {
      try {
        const response = await fetch(data.url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }));
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch {
        window.open(data.url, '_blank');
      }
      toast.success('تم تصدير التقرير بنجاح');
    },
    onError: (err) => toast.error(`خطأ في التصدير: ${err.message}`),
  });

  if (isLoading) {
    return (
    <div className="space-y-6">
      <WatermarkLogo />
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <Card className="glass-card gold-sweep animate-pulse"><CardContent className="p-6"><div className="h-40 bg-muted rounded" /></CardContent></Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-card gold-sweep animate-pulse"><CardContent className="p-4"><div className="h-20 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-1">الموقع غير موجود</h3>
        <Button variant="outline" size="sm" onClick={() => setLocation("/sites")} className="mt-4 gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للقائمة
        </Button>
      </div>
    );
  }

  const latestScan = site.scans?.[0];
  const score = Math.round(latestScan?.overallScore || 0);
  const clauseCount = latestScan ? [1, 2, 3, 4, 5, 6, 7, 8].filter(i => (latestScan as any)[`clause${i}Compliant`]).length : 0;

  // Calculate trend from scan history
  const prevScan = site.scans?.[1];
  const scoreDiff = prevScan ? score - Math.round(prevScan.overallScore || 0) : 0;

  const handleGenerateLetter = () => {
    if (!latestScan) return;
    generateLetter.mutate({ siteId: site.id, scanId: latestScan.id });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={() => setLocation("/sites")} className="gap-2 hover:gap-3 transition-all">
        <ArrowRight className="h-4 w-4" />
        العودة للقائمة
      </Button>

      {/* ===== Site Header Card ===== */}
      <Card className="glass-card gold-sweep overflow-hidden">
        <div className="relative">
          {/* Screenshot Banner */}
          {(() => {
            const ssUrl = site.screenshotUrl || `https://image.thum.io/get/width/1200/crop/400/https://${site.domain}`;
            return (
              <div className="relative h-48 overflow-hidden cursor-pointer group" onClick={() => setShowScreenshot(true)}>
                <img
                  src={ssUrl}
                  alt={`لقطة شاشة ${site.domain}`}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <button className="absolute top-3 start-3 p-2 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100">
                  <Eye className="h-4 w-4" />
                </button>
                <div className="absolute bottom-3 end-3 flex items-center gap-1.5 text-xs text-white/70 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
                  <Camera className="h-3 w-3" />
                  {site.screenshotUrl ? 'لقطة شاشة فعلية' : 'لقطة مباشرة'}
                </div>
              </div>
            );
          })()}
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              {/* Left: Site Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm shrink-0">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold truncate">{site.siteName || site.domain}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{site.domain}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant="outline" className="text-xs">{site.classification || "غير مصنف"}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {site.sectorType === "public" ? "حكومي" : "خاص"}
                    </Badge>
                    <Badge variant="outline" className={site.siteStatus === "active" ? "badge-compliant" : "badge-no-policy"}>
                      {site.siteStatus === "active" ? "نشط" : "غير متاح"}
                    </Badge>
                    {latestScan && (
                      <Badge variant="outline" className={getStatusBadgeClass(latestScan.complianceStatus || "")}>
                        {statusIcons[latestScan.complianceStatus || ""]}
                        <span className="me-1">{statusLabels[latestScan.complianceStatus || ""] || "-"}</span>
                      </Badge>
                    )}
                    {latestScan?.detectedLanguage && (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Globe className="h-3 w-3" />
                        {latestScan.detectedLanguage === 'ar' ? 'عربي' : latestScan.detectedLanguage === 'en' ? 'إنجليزي' : latestScan.detectedLanguage}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Score & Actions */}
              <div className="flex items-center gap-6 shrink-0">
                {latestScan && (
                  <>
                    {/* Score Circle */}
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-muted/30"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeDasharray={`${score}, 100`}
                          className={getScoreTextClass(score)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-bold ${getScoreTextClass(score)}`}>{score}%</span>
                        <span className="text-[9px] text-muted-foreground">الامتثال</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">البنود:</span>
                        <span className="text-sm font-bold">{clauseCount}/8</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <History className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">الفحوصات:</span>
                        <span className="text-sm font-bold">{site.scans?.length || 0}</span>
                      </div>
                      {scoreDiff !== 0 && (
                        <div className="flex items-center gap-1.5">
                          {scoreDiff > 0 ? (
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                          )}
                          <span className={`text-xs font-medium ${scoreDiff > 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {scoreDiff > 0 ? "+" : ""}{scoreDiff}%
                          </span>
                        </div>
                      )}
                      {user && latestScan && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportPptx.mutate({ siteId: site.id })}
                          disabled={exportPptx.isPending}
                          className="gap-1.5 mt-1"
                        >
                          {exportPptx.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Presentation className="h-3.5 w-3.5" />
                          )}
                          تصدير PPTX
                        </Button>
                      )}
                      {user && latestScan.complianceStatus !== "compliant" && (
                        <Button
                          size="sm"
                          onClick={handleGenerateLetter}
                          disabled={generateLetter.isPending}
                          className="gap-1.5 mt-1"
                        >
                          {generateLetter.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FileText className="h-3.5 w-3.5" />
                          )}
                          إنشاء خطاب
                        </Button>
                      )}
                      {user && latestScan && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowReportCustomizer(true)}
                          className="gap-1.5 mt-1 border-primary/30 text-primary hover:bg-primary/10 btn-glow"
                        >
                          <Stamp className="h-3.5 w-3.5" />
                          إصدار وثيقة رسمية
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Contact Info Row */}
            <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-[rgba(197,165,90,0.10)]/50">
              {site.emails && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{site.emails}</span>
                </div>
              )}
              {(site as any).phones && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{(site as any).phones}</span>
                </div>
              )}
              {site.privacyUrl && (
                <a href={site.privacyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline transition-colors">
                  <Shield className="h-4 w-4" />
                  صفحة الخصوصية
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {site.contactUrl && (
                <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline transition-colors">
                  <Phone className="h-4 w-4" />
                  صفحة التواصل
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {(site as any).workingUrl && (
                <a href={(site as any).workingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline transition-colors">
                  <Globe className="h-4 w-4" />
                  الرابط العامل
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {(site as any).cms && (
                <div className="flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">CMS: {(site as any).cms}</span>
                </div>
              )}
              {(site as any).sslStatus && (
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">SSL: {(site as any).sslStatus}</span>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* ===== Clause Mini Indicators ===== */}
      {latestScan && (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 stagger-children">
          {clauseNames.map((name, i) => {
            const num = i + 1;
            const compliant = (latestScan as any)[`clause${num}Compliant`];
            return (
              <div
                key={num}
                className={`p-2.5 rounded-xl text-center border transition-all hover:shadow-sm ${
                  compliant
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}
              >
                <div className={`text-lg font-bold ${compliant ? "text-emerald-500" : "text-red-500"}`}>
                  {compliant ? <CheckCircle className="h-5 w-5 mx-auto" /> : <XCircle className="h-5 w-5 mx-auto" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">بند {num}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Tabs ===== */}
      {latestScan && (
        <Tabs defaultValue="clauses" dir="rtl">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="clauses">البنود الثمانية</TabsTrigger>
            <TabsTrigger value="privacy-analysis">تحليل الخصوصية</TabsTrigger>
            <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
            <TabsTrigger value="history">الجدول الزمني</TabsTrigger>
            <TabsTrigger value="screenshots" className="gap-1.5">
              <Images className="h-3.5 w-3.5" />
              مقارنة بصرية
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clauses" className="space-y-3 mt-4">
            {clauseNames.map((name, i) => {
              const num = i + 1;
              const compliant = (latestScan as any)[`clause${num}Compliant`];
              const evidence = (latestScan as any)[`clause${num}Evidence`];
              return (
                <Card key={num} className={`glass-card gold-sweep overflow-hidden transition-all hover:shadow-md`}>
                  <div className={`h-1 ${compliant ? "bg-emerald-500" : "bg-red-500"}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        compliant ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}>
                        {compliant ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm">البند {num}: {name}</h3>
                          <Badge variant="outline" className={`shrink-0 ${compliant ? "badge-compliant" : "badge-non-compliant"}`}>
                            {compliant ? "ممتثل" : "غير ممتثل"}
                          </Badge>
                        </div>
                        {evidence && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{evidence}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ===== Privacy Analysis Tab ===== */}
          <TabsContent value="privacy-analysis" className="mt-4 space-y-4">
            {/* Site Technical Info */}
            <Card className="glass-card gold-sweep">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  معلومات الموقع التقنية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(site as any).siteNameAr && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">الاسم بالعربية</p>
                      <p className="text-sm font-medium">{(site as any).siteNameAr}</p>
                    </div>
                  )}
                  {(site as any).siteNameEn && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">الاسم بالإنجليزية</p>
                      <p className="text-sm font-medium">{(site as any).siteNameEn}</p>
                    </div>
                  )}
                  {(site as any).siteTitle && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 md:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">عنوان الصفحة</p>
                      <p className="text-sm font-medium">{(site as any).siteTitle}</p>
                    </div>
                  )}
                  {(site as any).siteDescription && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 md:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">وصف الموقع</p>
                      <p className="text-sm font-medium leading-relaxed">{(site as any).siteDescription}</p>
                    </div>
                  )}
                  {(site as any).cms && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">نظام إدارة المحتوى</p>
                      <p className="text-sm font-medium">{(site as any).cms}</p>
                    </div>
                  )}
                  {(site as any).sslStatus && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">حالة SSL</p>
                      <p className="text-sm font-medium">{(site as any).sslStatus}</p>
                    </div>
                  )}
                  {(site as any).mxRecords && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 md:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">سجلات MX</p>
                      <p className="text-sm font-medium">{(site as any).mxRecords}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Policy Details */}
            <Card className="glass-card gold-sweep">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-primary" />
                  تفاصيل سياسة الخصوصية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(latestScan as any)?.privacyTitle && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 md:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">عنوان صفحة الخصوصية</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyTitle}</p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyLanguage && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">لغة السياسة</p>
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Languages className="h-3.5 w-3.5" />
                        {(latestScan as any).privacyLanguage}
                      </p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyStatusCode && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">رمز الحالة</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyStatusCode}</p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyLastUpdate && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">آخر تحديث</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyLastUpdate}</p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyDiscoveryMethod && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">طريقة الاكتشاف</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyDiscoveryMethod}</p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyConfidence != null && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">مستوى الثقة</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyConfidence}%</p>
                    </div>
                  )}
                  {((latestScan as any)?.privacyWordCount != null || (latestScan as any)?.privacyCharCount != null) && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">حجم المحتوى</p>
                      <p className="text-sm font-medium">
                        {(latestScan as any).privacyWordCount && <span>{(latestScan as any).privacyWordCount.toLocaleString()} كلمة</span>}
                        {(latestScan as any).privacyWordCount && (latestScan as any).privacyCharCount && <span className="mx-1">·</span>}
                        {(latestScan as any).privacyCharCount && <span>{(latestScan as any).privacyCharCount.toLocaleString()} حرف</span>}
                      </p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyRobotsStatus && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">حالة Robots</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyRobotsStatus}</p>
                    </div>
                  )}
                  {(latestScan as any)?.crawlStatus && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">حالة الزحف</p>
                      <p className="text-sm font-medium">{(latestScan as any).crawlStatus}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Entity / Contact Info */}
            <Card className="glass-card gold-sweep">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  معلومات الجهة المسؤولة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(latestScan as any)?.privacyEntityName && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 md:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">اسم الجهة</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyEntityName}</p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyDpo && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">مسؤول حماية البيانات (DPO)</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyDpo}</p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyEmails && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">البريد الإلكتروني</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyEmails}</p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyPhones && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">الهاتف</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyPhones}</p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyAddress && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 md:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> العنوان</p>
                      <p className="text-sm font-medium">{(latestScan as any).privacyAddress}</p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyContactForm && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 md:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">نموذج التواصل</p>
                      <a href={(latestScan as any).privacyContactForm} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{(latestScan as any).privacyContactForm}</a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Mentions Analysis */}
            <Card className="glass-card gold-sweep">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  تحليل محتوى السياسة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'أنواع البيانات', field: 'mentionsDataTypes', detail: 'dataTypesList' },
                    { label: 'الغرض من المعالجة', field: 'mentionsPurpose', detail: 'purposeList' },
                    { label: 'الأساس القانوني', field: 'mentionsLegalBasis', detail: null },
                    { label: 'حقوق الأفراد', field: 'mentionsRights', detail: 'rightsList' },
                    { label: 'فترة الاحتفاظ', field: 'mentionsRetention', detail: null },
                    { label: 'أطراف ثالثة', field: 'mentionsThirdParties', detail: 'thirdPartiesList' },
                    { label: 'نقل عبر الحدود', field: 'mentionsCrossBorder', detail: null },
                    { label: 'إجراءات الأمان', field: 'mentionsSecurity', detail: null },
                    { label: 'ملفات تعريف الارتباط', field: 'mentionsCookies', detail: null },
                    { label: 'حماية الأطفال', field: 'mentionsChildren', detail: null },
                  ].map((item) => {
                    const val = (latestScan as any)?.[item.field];
                    const isYes = val === 'نعم';
                    const detailVal = item.detail ? (latestScan as any)?.[item.detail] : null;
                    return (
                      <div key={item.field} className={`p-3 rounded-xl border text-center transition-all ${
                        isYes ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
                      }`} title={detailVal || ''}>
                        <div className={`text-lg mb-1 ${isYes ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isYes ? <CheckCircle className="h-5 w-5 mx-auto" /> : <XCircle className="h-5 w-5 mx-auto" />}
                        </div>
                        <p className="text-xs font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{isYes ? 'مذكور' : 'غير مذكور'}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Detail lists */}
                <div className="mt-4 space-y-3">
                  {(latestScan as any)?.dataTypesList && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1.5 font-semibold">أنواع البيانات المذكورة:</p>
                      <p className="text-sm leading-relaxed">{(latestScan as any).dataTypesList}</p>
                    </div>
                  )}
                  {(latestScan as any)?.purposeList && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1.5 font-semibold">أغراض المعالجة:</p>
                      <p className="text-sm leading-relaxed">{(latestScan as any).purposeList}</p>
                    </div>
                  )}
                  {(latestScan as any)?.rightsList && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1.5 font-semibold">حقوق أصحاب البيانات:</p>
                      <p className="text-sm leading-relaxed">{(latestScan as any).rightsList}</p>
                    </div>
                  )}
                  {(latestScan as any)?.thirdPartiesList && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1.5 font-semibold">الأطراف الثالثة:</p>
                      <p className="text-sm leading-relaxed">{(latestScan as any).thirdPartiesList}</p>
                    </div>
                  )}
                  {(latestScan as any)?.privacyInternalLinks && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1.5 font-semibold">الروابط الداخلية:</p>
                      <p className="text-sm leading-relaxed">{(latestScan as any).privacyInternalLinks}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-base">ملخص التحليل والتوصيات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestScan.summary && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed">{latestScan.summary}</p>
                  </div>
                )}
                {Array.isArray(latestScan.recommendations) && latestScan.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">التوصيات:</h4>
                    {latestScan.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10 btn-glow">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 btn-glow">
                          <span className="text-xs font-bold text-primary">{i + 1}</span>
                        </div>
                        <span className="text-sm leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  الجدول الزمني للفحوصات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Timeline */}
                <div className="relative">
                  <div className="absolute top-0 bottom-0 right-5 w-0.5 bg-border" />
                  <div className="space-y-6">
                    {site.scans?.map((scan, idx) => {
                      const scanScore = Math.round(scan.overallScore || 0);
                      const prevScore = site.scans?.[idx + 1] ? Math.round(site.scans[idx + 1].overallScore || 0) : null;
                      const diff = prevScore !== null ? scanScore - prevScore : null;
                      const scanClauseCount = [1, 2, 3, 4, 5, 6, 7, 8].filter(i => (scan as any)[`clause${i}Compliant`]).length;

                      return (
                        <div key={scan.id} className="relative flex gap-4 pe-3">
                          {/* Timeline Dot */}
                          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                            idx === 0 ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border"
                          }`}>
                            {idx === 0 ? (
                              <Clock className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-medium text-muted-foreground">{idx + 1}</span>
                            )}
                          </div>

                          {/* Content */}
                          <div className={`flex-1 p-4 rounded-xl border transition-all ${
                            idx === 0 ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-muted/20 border-border/50"
                          }`}>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {scan.scanDate ? new Date(scan.scanDate).toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" }) : "-"}
                                </span>
                                {idx === 0 && <Badge className="text-[10px]">الأحدث</Badge>}
                              </div>
                              <Badge variant="outline" className={getStatusBadgeClass(scan.complianceStatus || "")}>
                                {statusLabels[scan.complianceStatus || ""] || "-"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <span className={`text-lg font-bold ${getScoreTextClass(scanScore)}`}>{scanScore}%</span>
                              <span className="text-xs text-muted-foreground">التقييم: {scan.rating}</span>
                              <span className="text-xs text-muted-foreground">البنود: {scanClauseCount}/8</span>
                              {diff !== null && diff !== 0 && (
                                <span className={`text-xs font-medium flex items-center gap-0.5 ${diff > 0 ? "text-emerald-500" : "text-red-500"}`}>
                                  {diff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                  {diff > 0 ? "+" : ""}{diff}%
                                </span>
                              )}
                            </div>
                            {/* Mini clause indicators */}
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div
                                  key={i}
                                  className={`h-1.5 flex-1 rounded-full ${(scan as any)[`clause${i}Compliant`] ? "bg-emerald-500" : "bg-red-500/40"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Screenshot Visual Comparison Tab ===== */}
          <TabsContent value="screenshots" className="mt-4">
            <ScreenshotComparison siteId={site.id} domain={site.domain} />
          </TabsContent>
        </Tabs>
      )}

      {/* No scans message */}
      {!latestScan && (
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-12 text-center">
            <ShieldAlert className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">لم يتم فحص هذا الموقع بعد</h3>
            <p className="text-sm text-muted-foreground mb-4">قم بإجراء فحص جديد لتحليل مدى امتثال الموقع</p>
            <Button onClick={() => setLocation("/scan")} className="gap-2">
              <Shield className="h-4 w-4" />
              فحص الموقع
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Letter Preview Dialog */}
      <Dialog open={showLetterPreview} onOpenChange={setShowLetterPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              خطاب تم إنشاؤه
            </DialogTitle>
          </DialogHeader>
          {generatedLetter && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 text-sm stagger-children">
                <div>
                  <span className="text-muted-foreground">إلى:</span>
                  <span className="me-2 font-medium">{generatedLetter.recipientEmail || "لم يتم تحديد بريد"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">الموضوع:</span>
                  <span className="me-2 font-medium">{generatedLetter.subject}</span>
                </div>
              </div>
              <div className="border border-border/50 rounded-lg p-4 bg-muted/20">
                <pre className="whitespace-pre-wrap text-sm leading-7 font-[Tajawal]">
                  {generatedLetter.body}
                </pre>
              </div>
              {generatedLetter.missingClauses?.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">البنود غير المستوفاة:</span> {generatedLetter.missingClauses.length} بنود
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLetterPreview(false)}>
              إغلاق
            </Button>
            <Button onClick={() => { setShowLetterPreview(false); setLocation("/letters"); }} className="gap-2">
              <Send className="h-4 w-4" />
              الذهاب للخطابات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Customizer */}
      {showReportCustomizer && latestScan && (
        <Dialog open={showReportCustomizer} onOpenChange={setShowReportCustomizer}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إصدار وثيقة رسمية</DialogTitle>
            </DialogHeader>
            <ReportCustomizer
              defaultData={{
                recordId: String(latestScan.id),
                domain: site.domain,
                complianceScore: latestScan.overallScore || 0,
                sectorType: site.sectorType || '',
                description: `تقرير امتثال لموقع ${site.siteName || site.domain}`,
                coreData: {
                  siteName: site.siteName || site.domain,
                  siteId: site.id,
                  scanId: latestScan.id,
                  complianceStatus: latestScan.complianceStatus || '',
                  clauseResults: clauseNames.map((name, i) => ({
                    name,
                    compliant: !!(latestScan as any)[`clause${i + 1}Compliant`],
                    evidence: (latestScan as any)[`clause${i + 1}Evidence`] || '',
                  })),
                },
              }}
              onGenerated={() => {
                setShowReportCustomizer(false);
                toast.success('تم إصدار الوثيقة بنجاح');
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Screenshot Preview Dialog with Zoom */}
      <ScreenshotZoomDialog
        url={site.screenshotUrl || `https://image.thum.io/get/width/1200/https://${site.domain}`}
        domain={site.domain}
        open={showScreenshot}
        onOpenChange={setShowScreenshot}
      />
    </div>
  );
}

function ScreenshotComparison({ siteId, domain }: { siteId: number; domain: string }) {
  const { data: screenshots, isLoading } = trpc.screenshots.history.useQuery({ siteId });
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(1);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side');
  const [sliderPos, setSliderPos] = useState(50);
  const [showFullscreen, setShowFullscreen] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="glass-card gold-sweep">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">جاري تحميل لقطات الشاشة...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = screenshots || [];
  if (items.length === 0) {
    return (
      <Card className="glass-card gold-sweep">
        <CardContent className="p-12 text-center">
          <Images className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">لا توجد لقطات شاشة للمقارنة</h3>
          <p className="text-sm text-muted-foreground">سيتم التقاط لقطات شاشة عند إجراء فحوصات جديدة</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 1) {
    return (
      <Card className="glass-card gold-sweep">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">توجد لقطة شاشة واحدة فقط. سيتم تفعيل المقارنة بعد إجراء فحص آخر.</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-border/50">
            <img src={items[0].screenshotUrl!} alt={domain} className="w-full h-auto" loading="lazy" />
          </div>
          <div className="mt-3 text-center">
            <Badge variant="outline">
              {items[0].scanDate ? new Date(items[0].scanDate).toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const left = items[leftIdx];
  const right = items[rightIdx] || items[items.length > 1 ? 1 : 0];

  const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="glass-card gold-sweep">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">مقارنة بصرية بين الفحوصات</span>
              <Badge variant="secondary" className="text-xs">{items.length} لقطة</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('side-by-side')}
                className="text-xs h-8"
              >
                جنب إلى جنب
              </Button>
              <Button
                variant={viewMode === 'slider' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('slider')}
                className="text-xs h-8"
              >
                شريط مقارنة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {items.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => {
              if (leftIdx === idx) return;
              if (rightIdx === idx) return;
              // Set the clicked one as left, keep right
              if (idx < rightIdx) setLeftIdx(idx);
              else setRightIdx(idx);
            }}
            className={`shrink-0 p-2 rounded-xl border-2 transition-all duration-300 ${
              idx === leftIdx
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                : idx === rightIdx
                ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
                : 'border-border/50 hover:border-primary/30 hover:bg-muted/50'
            }`}
          >
            <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted mb-1.5">
              {item.screenshotUrl && (
                <img src={item.screenshotUrl} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
              )}
            </div>
            <div className="text-[10px] text-center">
              <div className="font-medium">{formatDate(item.scanDate)}</div>
              <div className={`mt-0.5 ${item.complianceStatus === 'compliant' ? 'text-emerald-500' : item.complianceStatus === 'partially_compliant' ? 'text-amber-500' : 'text-red-500'}`}>
                {Math.round(item.overallScore || 0)}%
              </div>
            </div>
            {idx === leftIdx && <Badge className="text-[8px] h-4 mt-1 bg-blue-500 w-full justify-center">قبل</Badge>}
            {idx === rightIdx && <Badge className="text-[8px] h-4 mt-1 bg-amber-500 w-full justify-center">بعد</Badge>}
          </button>
        ))}
      </div>

      {/* Comparison View */}
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {/* Left (Before) */}
          <Card className="glass-card gold-sweep border-blue-500/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <CardTitle className="text-sm">قبل - {formatDate(left?.scanDate)}</CardTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={getStatusBadgeClass(left?.complianceStatus || '')}>
                    {statusLabels[left?.complianceStatus || ''] || '-'}
                  </Badge>
                  <span className={`text-sm font-bold ${getScoreTextClass(Math.round(left?.overallScore || 0))}`}>
                    {Math.round(left?.overallScore || 0)}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div
                className="rounded-xl overflow-hidden border border-border/50 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => left?.screenshotUrl && setShowFullscreen(left.screenshotUrl)}
              >
                {left?.screenshotUrl ? (
                  <img src={left.screenshotUrl} alt="قبل" className="w-full h-auto" loading="lazy" />
                ) : (
                  <div className="h-48 bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right (After) */}
          <Card className="glass-card gold-sweep border-amber-500/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <CardTitle className="text-sm">بعد - {formatDate(right?.scanDate)}</CardTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={getStatusBadgeClass(right?.complianceStatus || '')}>
                    {statusLabels[right?.complianceStatus || ''] || '-'}
                  </Badge>
                  <span className={`text-sm font-bold ${getScoreTextClass(Math.round(right?.overallScore || 0))}`}>
                    {Math.round(right?.overallScore || 0)}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div
                className="rounded-xl overflow-hidden border border-border/50 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => right?.screenshotUrl && setShowFullscreen(right.screenshotUrl)}
              >
                {right?.screenshotUrl ? (
                  <img src={right.screenshotUrl} alt="بعد" className="w-full h-auto" loading="lazy" />
                ) : (
                  <div className="h-48 bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Slider Comparison Mode */
        <Card className="glass-card gold-sweep">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-xs">قبل: {formatDate(left?.scanDate)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-xs">بعد: {formatDate(right?.scanDate)}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">اسحب الشريط للمقارنة</span>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="relative rounded-xl overflow-hidden border border-border/50" style={{ aspectRatio: '16/10' }}>
              {/* Right image (full) */}
              {right?.screenshotUrl && (
                <img
                  src={right.screenshotUrl}
                  alt="بعد"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  loading="lazy"
                />
              )}
              {/* Left image (clipped) */}
              {left?.screenshotUrl && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={left.screenshotUrl}
                    alt="قبل"
                    className="w-full h-full object-cover object-top"
                    style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: 'none' }}
                    loading="lazy"
                  />
                </div>
              )}
              {/* Slider handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center">
                  <ArrowLeftRight className="h-4 w-4 text-zinc-600" />
                </div>
              </div>
              {/* Invisible range input for slider control */}
              <input
                type="range"
                min={5}
                max={95}
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
              {/* Labels */}
              <div className="absolute top-3 end-3 z-10">
                <Badge className="bg-blue-500/90 text-white text-xs">قبل</Badge>
              </div>
              <div className="absolute top-3 start-3 z-10">
                <Badge className="bg-amber-500/90 text-white text-xs">بعد</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Change Summary */}
      {left && right && (
        <Card className="glass-card gold-sweep">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreTextClass(Math.round(left.overallScore || 0))}`}>
                  {Math.round(left.overallScore || 0)}%
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(left.scanDate)}</div>
              </div>
              <div className="flex flex-col items-center">
                {(() => {
                  const diff = Math.round((right.overallScore || 0) - (left.overallScore || 0));
                  return (
                    <>
                      {diff > 0 ? (
                        <TrendingUp className="h-6 w-6 text-emerald-500" />
                      ) : diff < 0 ? (
                        <TrendingDown className="h-6 w-6 text-red-500" />
                      ) : (
                        <Minus className="h-6 w-6 text-muted-foreground" />
                      )}
                      <span className={`text-sm font-bold ${
                        diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-500' : 'text-muted-foreground'
                      }`}>
                        {diff > 0 ? '+' : ''}{diff}%
                      </span>
                    </>
                  );
                })()}
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreTextClass(Math.round(right.overallScore || 0))}`}>
                  {Math.round(right.overallScore || 0)}%
                </div>
                <div className="text-xs text-muted-foreground">{formatDate(right.scanDate)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fullscreen Preview */}
      <Dialog open={!!showFullscreen} onOpenChange={() => setShowFullscreen(null)}>
        <DialogContent className="max-w-5xl p-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Camera className="h-4 w-4 text-primary" />
              لقطة شاشة - {domain}
            </DialogTitle>
          </DialogHeader>
          {showFullscreen && (
            <div className="rounded-lg overflow-hidden bg-muted">
              <img src={showFullscreen} alt={domain} className="w-full h-auto max-h-[80vh] object-contain" loading="lazy" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}

function getScoreTextClass(score: number) {
  if (score >= 75) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  if (score >= 25) return "text-orange-500";
  return "text-red-500";
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "compliant": return "badge-compliant";
    case "partially_compliant": return "badge-partial";
    case "non_compliant": return "badge-non-compliant";
    case "no_policy": return "badge-no-policy";
    default: return "";
  }
}
