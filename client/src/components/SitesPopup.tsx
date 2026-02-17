import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  WifiOff,
  Search,
  ExternalLink,
  Globe,
  Building2,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  BarChart3,
  Shield,
  ArrowUpRight,
  FileSpreadsheet,
} from "lucide-react";
import { downloadBase64File } from "@/lib/excelExport";
import { ScreenshotThumbnail } from "@/components/ScreenshotPreview";
import { toast } from "sonner";

export type SitesPopupFilter = {
  complianceStatus?: string;
  sectorType?: string;
  classification?: string;
  clauseIndex?: number;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: string;
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  compliant: {
    label: "ممتثل",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-950/30",
    border: "border-emerald-800",
  },
  partially_compliant: {
    label: "ممتثل جزئياً",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-950/30",
    border: "border-amber-800",
  },
  non_compliant: {
    label: "غير ممتثل",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-950/30",
    border: "border-red-800",
  },
  not_working: {
    label: "لا يعمل",
    icon: WifiOff,
    color: "text-gray-400",
    bg: "bg-gray-950/30",
    border: "border-gray-800",
  },
};

const SECTOR_LABELS: Record<string, string> = {
  public: "قطاع عام",
  private: "قطاع خاص",
};

export default function SitesPopup({
  open,
  onOpenChange,
  filter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: SitesPopupFilter | null;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const limit = 10;

  // Excel export mutation
  const exportExcel = trpc.dashboard.exportExcel.useMutation({
    onSuccess: (data: any) => {
      if (data?.base64) {
        downloadBase64File(data.base64, data.filename);
        toast.success("تم تصدير ملف Excel بنجاح");
      }
    },
    onError: () => toast.error("حدث خطأ أثناء التصدير"),
  });

  const handleExport = () => {
    exportExcel.mutate({
      type: "filtered" as any,
      complianceStatus: filter?.complianceStatus,
      sectorType: filter?.sectorType,
      title: filter?.title || "بيانات مفلترة",
    });
  };

  // Reset page when filter changes
  const filterKey = filter ? JSON.stringify(filter) : "";

  const { data, isLoading } = trpc.sites.list.useQuery(
    {
      page,
      limit,
      search: search || undefined,
      complianceStatus: filter?.complianceStatus || undefined,
      sectorType: filter?.sectorType || undefined,
      classification: filter?.classification || undefined,
    },
    { enabled: open && !!filter, placeholderData: (prev: any) => prev }
  );

  const sites = data?.sites || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleSiteClick = (siteId: number) => {
    onOpenChange(false);
    setLocation(`/sites/${siteId}`);
  };

  const getComplianceStatus = (site: any) => {
    const scan = site.latestScan;
    if (!scan) return "no_scan";
    return scan.complianceStatus || "non_compliant";
  };

  const getCompliancePercentage = (site: any) => {
    const scan = site.latestScan;
    if (!scan) return 0;
    return scan.complianceScore || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0" dir="rtl">
        {/* Header */}
        <div className={`p-6 pb-4 ${filter?.gradient ? `bg-gradient-to-l ${filter.gradient}` : "bg-gradient-to-l from-primary/10 to-primary/5"}`}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              {filter?.icon && (
                <div
                  className="w-12 h-12 rounded-2xl bg-gray-900/90 flex items-center justify-center shadow-lg backdrop-blur-sm"
                >
                  {filter.icon}
                </div>
              )}
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {filter?.title || "المواقع"}
                </DialogTitle>
                {filter?.subtitle && (
                  <p className="text-sm text-muted-foreground mt-0.5">{filter.subtitle}</p>
                )}
              </div>
              <div
                className="ms-auto flex items-center gap-2"
              >
                <Badge variant="secondary" className="text-lg px-4 py-1 font-bold shadow-sm">
                  {total} موقع
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={exportExcel.isPending || total === 0}
                  className="gap-1.5 bg-gray-900/80 backdrop-blur-sm hover:bg-emerald-950/30 border-emerald-800/50 text-emerald-400"
                >
                  {exportExcel.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  )}
                  تصدير Excel
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Search */}
          <div
            className="mt-4 relative"
          >
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث في المواقع..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pe-10 bg-gray-900/80 backdrop-blur-sm border-gray-700/50"
            />
          </div>

          {/* Active Filters */}
          <div
            className="flex flex-wrap gap-2 mt-3"
          >
            {filter?.complianceStatus && STATUS_CONFIG[filter.complianceStatus] && (
              <Badge className={`${STATUS_CONFIG[filter.complianceStatus].bg} ${STATUS_CONFIG[filter.complianceStatus].color} ${STATUS_CONFIG[filter.complianceStatus].border} border`}>
                {STATUS_CONFIG[filter.complianceStatus].label}
              </Badge>
            )}
            {filter?.sectorType && (
              <Badge variant="outline" className="gap-1">
                {filter.sectorType === "public" ? <Landmark className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                {SECTOR_LABELS[filter.sectorType] || filter.sectorType}
              </Badge>
            )}
            {filter?.classification && (
              <Badge variant="outline">{filter.classification}</Badge>
            )}
          </div>
        </div>

        {/* Sites List */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">جاري تحميل المواقع...</p>
            </div>
          ) : sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Globe className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">لا توجد مواقع مطابقة</p>
            </div>
          ) : (
            
              <div
                key={`${filterKey}-${page}-${search}`}
                className="space-y-2"
              >
                {sites.map((site: any, idx: number) => {
                  const status = getComplianceStatus(site);
                  const statusConf = STATUS_CONFIG[status];
                  const StatusIcon = statusConf?.icon || Globe;
                  const pct = getCompliancePercentage(site);

                  return (
                    <div
                      key={site.id}
                      onClick={() => handleSiteClick(site.id)}
                      className={`group relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${statusConf?.bg || "bg-card"} ${statusConf?.border || "border-border"}`}
                    >
                      {/* Screenshot Thumbnail */}
                      <ScreenshotThumbnail url={site.screenshotUrl} domain={site.domain} size="sm" />

                      {/* Status Icon */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${statusConf?.bg || "bg-muted"}`}
                        >
                          <StatusIcon className={`w-5 h-5 ${statusConf?.color || "text-muted-foreground"}`} />
                        </div>
                        {status === "partially_compliant" && (
                          <div className="absolute -bottom-1 -left-1 bg-amber-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                            {Math.round(pct)}%
                          </div>
                        )}
                      </div>

                      {/* Site Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm truncate text-foreground">
                            {site.siteName || site.domain}
                          </h4>
                          {site.sectorType && (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {SECTOR_LABELS[site.sectorType] || site.sectorType}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground truncate" dir="ltr">
                            {site.domain}
                          </span>
                          {site.classification && (
                            <span className="text-[10px] text-muted-foreground/70">• {site.classification}</span>
                          )}
                        </div>
                        {site.latestScan && (
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-muted-foreground/60" />
                              <span className={`text-xs font-medium ${statusConf?.color}`}>
                                {statusConf?.label || status}
                              </span>
                            </div>
                            {status === "partially_compliant" && (
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-xs text-muted-foreground">
                                  {site.latestScan.clausesPassed || 0}/8 بنود
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-muted-foreground/60" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(site.latestScan.scanDate).toLocaleDateString("ar-SA-u-nu-latn")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                      </div>

                      {/* Compliance bar */}
                      {status === "partially_compliant" && (
                        <div className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-xl overflow-hidden">
                          <div
                            animate={{ width: `${pct}%` }}
                            className="h-full bg-amber-400"
                          />
                        </div>
                      )}
                      {status === "compliant" && (
                        <div className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-xl bg-emerald-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            
          )}
        </div>

        {/* Footer / Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <span className="text-sm text-muted-foreground">
              صفحة {page} من {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
