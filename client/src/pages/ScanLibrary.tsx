import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  ScanSearch,
  Globe,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  FileX,
  ExternalLink,
  Clock,
  ArrowUpDown,
  X,
  Library,
  Eye,
  ImageIcon,
  Camera,
  FileSpreadsheet,
  Loader2,
  Download,
} from "lucide-react";
import { downloadBase64File } from "@/lib/excelExport";
import { ScreenshotZoomDialog } from "@/components/ScreenshotPreview";
import { toast } from "sonner";
import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const STATUS_LABELS: Record<string, string> = {
  compliant: "ممتثلة",
  partially_compliant: "ممتثلة جزئياً",
  non_compliant: "غير ممتثلة",
  no_policy: "بدون سياسة خصوصية",
};

const STATUS_COLORS: Record<string, string> = {
  compliant: "badge-compliant",
  partially_compliant: "badge-partial",
  non_compliant: "badge-non-compliant",
  no_policy: "badge-no-policy",
};

const CLAUSE_NAMES = [
  "تحديد الغرض من جمع البيانات",
  "تحديد محتوى البيانات المطلوب جمعها",
  "تحديد طريقة جمع البيانات",
  "تحديد وسيلة حفظ البيانات",
  "تحديد كيفية معالجة البيانات",
  "تحديد كيفية إتلاف البيانات",
  "تحديد حقوق صاحب البيانات",
  "كيفية ممارسة الحقوق",
];

export default function ScanLibrary() {
  const { playClick, playHover } = useSoundEffects();
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [complianceStatus, setComplianceStatus] = useState("");
  const [classification, setClassification] = useState("");
  const [sectorType, setSectorType] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const limit = 15;

  const queryInput = useMemo(() => ({
    page,
    limit,
    search: search || undefined,
    complianceStatus: complianceStatus || undefined,
    classification: classification || undefined,
    sectorType: sectorType || undefined,
    sortBy,
    sortOrder,
  }), [page, search, complianceStatus, classification, sectorType, sortBy, sortOrder]);

  const { data, isLoading } = trpc.scanLibrary.list.useQuery(queryInput);
  const { data: classifications } = trpc.scanLibrary.classifications.useQuery();

  // Excel export mutation
  const exportExcel = trpc.reports.exportExcel.useMutation({
    onSuccess: (data: any) => {
      if (data?.base64) {
        downloadBase64File(data.base64, data.filename);
        toast.success("تم تصدير ملف Excel بنجاح");
      }
    },
    onError: () => toast.error("حدث خطأ أثناء التصدير"),
  });

  const handleExcelExport = useCallback(() => {
    exportExcel.mutate({ type: "summary" });
  }, [exportExcel]);

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setComplianceStatus("");
    setClassification("");
    setSectorType("");
    setSortBy("scanDate");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilters = search || complianceStatus || classification || sectorType;

  return (
    <div
      className="overflow-x-hidden max-w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
          <Library className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold gradient-text">مكتبة الفحوصات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            أرشيف شامل لجميع عمليات الفحص مع لقطات الشاشة الفعلية للمواقع
          </p>
        </div>
        {data && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {data.total.toLocaleString("ar-SA-u-nu-latn")} فحص
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExcelExport}
              disabled={exportExcel.isPending}
              className="gap-1.5 hover:bg-emerald-950/30 border-emerald-800/50 text-emerald-400"
            >
              {exportExcel.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              تصدير Excel
            </Button>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <Card className="glass-card gold-sweep animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
        <CardContent className="p-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم الموقع أو النطاق..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pe-10"
              />
            </div>
            <Button onClick={handleSearch} size="default">
              <Search className="h-4 w-4 ms-1" />
              بحث
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary/10 border-primary/30" : ""}
            >
              <Filter className="h-4 w-4 ms-1" />
              تصفية
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="default" onClick={handleClearFilters}>
                <X className="h-4 w-4 ms-1" />
                مسح
              </Button>
            )}
          </div>

          {/* Filter Row */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-[rgba(197,165,90,0.10)]/50 animate-in slide-in-from-top-2 duration-200 stagger-children">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">حالة الامتثال</label>
                <Select value={complianceStatus} onValueChange={(v) => { setComplianceStatus(v === "all" ? "" : v); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="compliant">ممتثلة</SelectItem>
                    <SelectItem value="partially_compliant">ممتثلة جزئياً</SelectItem>
                    <SelectItem value="non_compliant">غير ممتثلة</SelectItem>
                    <SelectItem value="no_policy">بدون سياسة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">التصنيف</label>
                <Select value={classification} onValueChange={(v) => { setClassification(v === "all" ? "" : v); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {classifications?.map((c: string) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">القطاع</label>
                <Select value={sectorType} onValueChange={(v) => { setSectorType(v === "all" ? "" : v); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="public">حكومي</SelectItem>
                    <SelectItem value="private">خاص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">الترتيب</label>
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scanDate">التاريخ</SelectItem>
                    <SelectItem value="score">النتيجة</SelectItem>
                    <SelectItem value="domain">النطاق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card gold-sweep animate-pulse overflow-hidden">
              <div className="h-40 bg-muted" />
              <CardContent className="p-4"><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : data && data.scans.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {data.scans.map((scan: any, index: number) => (
              <ScanCard
                key={scan.id}
                scan={scan}
                index={index}
                onView={() => setSelectedScan(scan)}
                onSiteClick={() => setLocation(`/sites/${scan.siteId}`)}
                onImageClick={(url: string) => setImagePreview(url)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground me-2">
                صفحة {page} من {totalPages}
              </span>
            </div>
          )}
        </>
      ) : (
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-4 sm:p-12 text-center">
            <ScanSearch className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">لا توجد نتائج</h3>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? "جرب تغيير معايير البحث أو التصفية" : "لم يتم إجراء أي فحوصات بعد"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Scan Detail Dialog */}
      {selectedScan && (
        <ScanDetailDialog
          scan={selectedScan}
          open={!!selectedScan}
          onClose={() => setSelectedScan(null)}
          onSiteClick={() => { setSelectedScan(null); setLocation(`/sites/${selectedScan.siteId}`); }}
          onImageClick={(url: string) => { setSelectedScan(null); setImagePreview(url); }}
        />
      )}

      {/* Image Preview Dialog with Zoom */}
      <ScreenshotZoomDialog
        url={imagePreview || ""}
        domain=""
        open={!!imagePreview}
        onOpenChange={(v) => !v && setImagePreview(null)}
      />
    </div>
  );
}

function ScanCard({ scan, index, onView, onSiteClick, onImageClick }: {
  scan: any;
  index: number;
  onView: () => void;
  onSiteClick: () => void;
  onImageClick: (url: string) => void;
}) {
  const score = Math.round(scan.overallScore || 0);
  const scoreColor = score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : score >= 25 ? "text-orange-500" : "text-red-500";
  const scoreBg = score >= 75 ? "from-emerald-500/20 to-emerald-500/5" : score >= 50 ? "from-amber-500/20 to-amber-500/5" : score >= 25 ? "from-orange-500/20 to-orange-500/5" : "from-red-500/20 to-red-500/5";
  const clauseCount = [1, 2, 3, 4, 5, 6, 7, 8].filter(i => scan[`clause${i}Compliant`]).length;
  const screenshotUrl = scan.screenshotUrl || scan.siteScreenshot;
  const [imgError, setImgError] = useState(false);

  return (
    <Card
      className="glass-card gold-sweep group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
     
      onClick={onView}
    >
      {/* Screenshot Section */}
      <div className="relative h-44 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
        {screenshotUrl && !imgError ? (
          <>
            <img
              src={screenshotUrl}
              alt={`لقطة شاشة ${scan.domain}`}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Expand button */}
            <button
              className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); onImageClick(screenshotUrl); }}
              title="تكبير الصورة"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
            <Globe className="h-10 w-10 mb-2" />
            <span className="text-xs">لا تتوفر لقطة شاشة</span>
          </div>
        )}

        {/* Domain overlay on screenshot */}
        <div className="absolute bottom-0 right-0 left-0 p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${screenshotUrl && !imgError ? "text-white" : "text-foreground"}`}>
                {scan.domain}
              </p>
              {scan.siteName && scan.siteName !== scan.domain && (
                <p className={`text-xs truncate ${screenshotUrl && !imgError ? "text-white/70" : "text-muted-foreground"}`}>
                  {scan.siteName}
                </p>
              )}
            </div>
            <Badge variant="outline" className={`shrink-0 text-xs sm:text-[10px] border-white/30 ${screenshotUrl && !imgError ? "text-white bg-black/30 backdrop-blur-sm" : STATUS_COLORS[scan.complianceStatus] || ""}`}>
              {STATUS_LABELS[scan.complianceStatus] || scan.complianceStatus}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Score & Rating */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${scoreBg} flex items-center justify-center`}>
            <svg className="w-12 h-12 -rotate-90 absolute inset-0" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-muted/20"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${score}, 100`}
                className={scoreColor}
                strokeLinecap="round"
              />
            </svg>
            <span className={`text-xs font-bold ${scoreColor} z-10`}>
              {score}%
            </span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">التقييم: <span className="font-medium text-foreground">{scan.rating || "-"}</span></p>
            <p className="text-xs text-muted-foreground">البنود الممتثلة: <span className="font-medium text-foreground">{clauseCount}/8</span></p>
          </div>
        </div>

        {/* Clause Mini Indicators */}
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${scan[`clause${i}Compliant`] ? "bg-emerald-500" : "bg-red-500/40"}`}
              title={`بند ${i}: ${scan[`clause${i}Compliant`] ? "ممتثل" : "غير ممتثل"}`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between flex-wrap text-xs sm:text-[10px] text-muted-foreground pt-2 border-t border-[rgba(197,165,90,0.10)]/50">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {scan.scanDate ? new Date(scan.scanDate).toLocaleDateString("ar-SA-u-nu-latn") : "-"}
          </div>
          <div className="flex items-center gap-1.5">
            {screenshotUrl && !imgError && (
              <div className="flex items-center gap-0.5 text-primary/60">
                <Camera className="h-3 w-3" />
              </div>
            )}
            {scan.classification && <Badge variant="outline" className="text-[9px] px-1 py-0">{scan.classification}</Badge>}
            {scan.sectorType && (
              <Badge variant="outline" className="text-[9px] px-1 py-0">
                {scan.sectorType === "public" ? "حكومي" : "خاص"}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScanDetailDialog({ scan, open, onClose, onSiteClick, onImageClick }: {
  scan: any;
  open: boolean;
  onClose: () => void;
  onSiteClick: () => void;
  onImageClick: (url: string) => void;
}) {
  const score = Math.round(scan.overallScore || 0);
  const scoreColor = score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : score >= 25 ? "text-orange-500" : "text-red-500";
  const screenshotUrl = scan.screenshotUrl || scan.siteScreenshot;
  const [imgError, setImgError] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Screenshot Header */}
        {screenshotUrl && !imgError ? (
          <div className="relative h-56 overflow-hidden rounded-t-lg">
            <img
              src={screenshotUrl}
              alt={`لقطة شاشة ${scan.domain}`}
              className="w-full h-full object-cover object-top"
              loading="lazy"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <button
              className="absolute top-3 start-3 p-2 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-all"
              onClick={() => onImageClick(screenshotUrl)}
              title="تكبير الصورة"
            >
              <Eye className="h-4 w-4" />
            </button>
            <div className="absolute bottom-4 right-4 left-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-5 w-5 text-white/80" />
                <span className="text-lg font-bold text-white">{scan.domain}</span>
              </div>
              {scan.siteName && scan.siteName !== scan.domain && (
                <p className="text-sm text-white/70">{scan.siteName}</p>
              )}
            </div>
          </div>
        ) : (
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              تفاصيل الفحص - {scan.domain}
            </DialogTitle>
          </DialogHeader>
        )}

        <div className="space-y-4 p-6">
          {/* Overview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
            <div className="text-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>{score}%</span>
              <p className="text-xs text-muted-foreground mt-1">النتيجة</p>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{scan.siteName || scan.domain}</span>
                <Badge variant="outline" className={STATUS_COLORS[scan.complianceStatus] || ""}>
                  {STATUS_LABELS[scan.complianceStatus] || scan.complianceStatus}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">التقييم: {scan.rating || "-"}</p>
              <p className="text-xs text-muted-foreground">
                تاريخ الفحص: {scan.scanDate ? new Date(scan.scanDate).toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" }) : "-"}
              </p>
              {scan.classification && (
                <p className="text-xs text-muted-foreground">التصنيف: {scan.classification}</p>
              )}
            </div>
          </div>

          {/* Summary */}
          {scan.summary && (
            <div>
              <h4 className="text-sm font-semibold mb-2">ملخص التحليل</h4>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg">{scan.summary}</p>
            </div>
          )}

          {/* Clauses */}
          <div>
            <h4 className="text-sm font-semibold mb-3">تفصيل البنود الثمانية</h4>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
                const isCompliant = scan[`clause${i}Compliant`];
                const evidence = scan[`clause${i}Evidence`];
                return (
                  <div key={i} className={`p-3 rounded-lg border transition-all duration-200 ${isCompliant ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isCompliant ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      <span className="text-sm font-medium">بند {i}: {CLAUSE_NAMES[i - 1]}</span>
                      <Badge variant="outline" className={`me-auto text-xs sm:text-[10px] ${isCompliant ? "badge-compliant" : "badge-non-compliant"}`}>
                        {isCompliant ? "ممتثل" : "غير ممتثل"}
                      </Badge>
                    </div>
                    {evidence && (
                      <p className="text-xs text-muted-foreground mt-1 pe-6 leading-relaxed">{evidence}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-[rgba(197,165,90,0.10)]/50">
            <Button variant="outline" size="sm" onClick={onSiteClick}>
              <Eye className="h-3.5 w-3.5 ms-1" />
              عرض تفاصيل الموقع
            </Button>
            {scan.privacyUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={scan.privacyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 ms-1" />
                  صفحة الخصوصية
                </a>
              </Button>
            )}
            {screenshotUrl && !imgError && (
              <Button variant="outline" size="sm" onClick={() => onImageClick(screenshotUrl)}>
                <Camera className="h-3.5 w-3.5 ms-1" />
                عرض اللقطة
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
