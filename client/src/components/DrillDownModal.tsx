import { useState, useCallback, useMemo, type ReactNode } from "react";
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
  CheckCircle2, AlertTriangle, XCircle, WifiOff, Search,
  ExternalLink, Globe, Building2, Landmark, ChevronLeft,
  ChevronRight, Loader2, Eye, BarChart3, Shield,
  ArrowUpRight, ArrowRight, ChevronDown, X, FileSpreadsheet,
  ShieldCheck, ShieldAlert, ShieldX, Layers, Target,
  TrendingUp, Hash, Percent, Activity, MapPin,
} from "lucide-react";
import { ScreenshotThumbnail } from "@/components/ScreenshotPreview";
import { downloadBase64File } from "@/lib/excelExport";
import { toast } from "sonner";
import {
  COMPLIANCE_LABELS,
  ARTICLE_12_CLAUSES,
} from "../../../shared/compliance";

// ─── Types ──────────────────────────────────────────────────
export type DrillDownFilter = {
  complianceStatus?: string;
  sectorType?: string;
  classification?: string;
  clauseIndex?: number;
  clauseCompliant?: boolean;
  siteStatus?: string;
  hasContactPage?: boolean;
  hasEmail?: boolean;
  region?: string;
  siteId?: number;
  stage?: string;
  priority?: string;
  status?: string;
  category?: string;
  period?: string;
  alertType?: string;
  scanType?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: string;
};

export type DrillDownLevel = {
  type: "sites" | "breakdown" | "clauses" | "sectors" | "custom";
  filter: DrillDownFilter;
  data?: any;
};

// ─── Status Config ──────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string; darkBg: string }> = {
  compliant: {
    label: "ممتثل",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    darkBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  partially_compliant: {
    label: "ممتثل جزئياً",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    darkBg: "bg-amber-100 dark:bg-amber-900/40",
  },
  non_compliant: {
    label: "غير ممتثل",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    darkBg: "bg-red-100 dark:bg-red-900/40",
  },
  not_working: {
    label: "لا يعمل",
    icon: WifiOff,
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-950/30",
    border: "border-gray-200 dark:border-gray-800",
    darkBg: "bg-gray-100 dark:bg-gray-900/40",
  },
  no_policy: {
    label: "بدون سياسة",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    darkBg: "bg-red-100 dark:bg-red-900/40",
  },
};

const SECTOR_LABELS: Record<string, string> = {
  public: "قطاع عام",
  private: "قطاع خاص",
};

// ─── Helper Functions ───────────────────────────────────────
function getComplianceStatus(site: any): string {
  if (site.complianceStatus) return site.complianceStatus;
  if (site.latestScan?.complianceStatus) return site.latestScan.complianceStatus;
  return "non_compliant";
}

function getCompliancePercentage(site: any): number {
  const scan = site.latestScan || site;
  let passed = 0;
  for (let i = 1; i <= 8; i++) {
    if (scan[`clause${i}Compliant`]) passed++;
  }
  return (passed / 8) * 100;
}

// ─── Breakdown Card ─────────────────────────────────────────
function BreakdownCard({
  title, value, total, icon: Icon, color, gradient, onClick, delay = 0,
}: {
  title: string; value: number; total: number; icon: any;
  color: string; gradient: string; onClick?: () => void; delay?: number;
}) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" : ""
      } bg-card border-border`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {onClick && (
          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value.toLocaleString("ar-SA")}</div>
      <div className="text-xs text-muted-foreground mt-1">{title}</div>
      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          animate={{ width: `${pct}%` }}
          className={`h-full rounded-full bg-gradient-to-l ${gradient}`}
        />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">{pct}% من الإجمالي</div>
    </div>
  );
}

// ─── Clause Detail Card ─────────────────────────────────────
function ClauseDetailCard({
  clauseNum, name, compliant, total, onClick, delay = 0,
}: {
  clauseNum: number; name: string; compliant: number; total: number;
  onClick?: () => void; delay?: number;
}) {
  const pct = total > 0 ? ((compliant / total) * 100).toFixed(1) : "0";
  const pctNum = Number(pct);
  const barColor = pctNum >= 70 ? "from-emerald-500 to-blue-800" : pctNum >= 40 ? "from-amber-400 to-orange-500" : "from-rose-500 to-red-600";
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 ${
        onClick ? "cursor-pointer hover:shadow-md hover:bg-accent/50 active:scale-[0.99]" : ""
      } bg-card border-border`}
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary">{clauseNum}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              animate={{ width: `${pct}%` }}
              className={`h-full rounded-full bg-gradient-to-l ${barColor}`}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground shrink-0">{pct}%</span>
        </div>
      </div>
      <div className="text-start shrink-0">
        <div className="text-sm font-bold">{compliant.toLocaleString("ar-SA")}</div>
        <div className="text-[10px] text-muted-foreground">من {total.toLocaleString("ar-SA")}</div>
      </div>
      {onClick && <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />}
    </div>
  );
}

// ─── Site Row ───────────────────────────────────────────────
function SiteRow({ site, idx, onClick }: { site: any; idx: number; onClick: () => void }) {
  const status = getComplianceStatus(site);
  const statusConf = STATUS_CONFIG[status];
  const StatusIcon = statusConf?.icon || Globe;
  const pct = getCompliancePercentage(site);
  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${statusConf?.bg || "bg-card"} ${statusConf?.border || "border-border"}`}
    >
      <ScreenshotThumbnail url={site.screenshotUrl} domain={site.domain} size="sm" />
      <div className="relative shrink-0">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${statusConf?.darkBg || "bg-muted"}`}
        >
          <StatusIcon className={`w-5 h-5 ${statusConf?.color || "text-muted-foreground"}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm truncate">{site.siteName || site.domain}</h4>
          {site.sectorType && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              {SECTOR_LABELS[site.sectorType] || site.sectorType}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate" dir="ltr">{site.domain}</span>
          {site.classification && (
            <span className="text-[10px] text-muted-foreground/70">• {site.classification}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-muted-foreground/60" />
            <span className={`text-xs font-medium ${statusConf?.color}`}>{statusConf?.label || status}</span>
          </div>
          {(status === "partially_compliant" || status === "compliant") && (
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground">{Math.round(pct)}% امتثال</span>
            </div>
          )}
          {(site.scanDate || site.latestScan?.scanDate) && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground">
                {new Date(site.scanDate || site.latestScan?.scanDate).toLocaleDateString("ar-SA-u-nu-latn")}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
      </div>
      {status === "partially_compliant" && (
        <div className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-xl overflow-hidden">
          <div animate={{ width: `${pct}%` }} className="h-full bg-amber-400" />
        </div>
      )}
      {status === "compliant" && (
        <div className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-xl bg-emerald-400" />
      )}
    </div>
  );
}

// ─── Site Detail View (inside modal) ────────────────────────
function SiteDetailView({ siteId }: { siteId: number }) {
  const [, setLocation] = useLocation();
  const [expandedScan, setExpandedScan] = useState<number | null>(null);
  const siteHistory = trpc.leadership.siteHistory.useQuery({ siteId });
  const data = siteHistory.data;

  if (siteHistory.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!data) return <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>;

  const site = data.site;
  const history = data.history || [];
  const latestScan = history[0];
  const status = latestScan?.complianceStatus || "non_compliant";
  const statusConf = STATUS_CONFIG[status];

  return (
    <div className="space-y-4">
      {/* Site Header */}
      <div className={`p-4 rounded-xl border ${statusConf?.bg} ${statusConf?.border}`}>
        <div className="flex items-center gap-4">
          <ScreenshotThumbnail url={site?.screenshotUrl} domain={site?.domain} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg">{site?.siteName || site?.domain}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground" dir="ltr">{site?.domain}</span>
              <Badge variant="outline" className="text-[10px]">{SECTOR_LABELS[site?.sectorType] || site?.sectorType}</Badge>
              {site?.classification && <Badge variant="outline" className="text-[10px]">{site.classification}</Badge>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${statusConf?.bg} ${statusConf?.color} ${statusConf?.border} border`}>
                {statusConf?.label}
              </Badge>
              {latestScan?.overallScore != null && (
                <Badge variant="outline">{Math.round(latestScan.overallScore)}% درجة الامتثال</Badge>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocation(`/sites/${siteId}`)} className="gap-1 shrink-0">
            <ExternalLink className="w-3.5 h-3.5" />
            عرض الصفحة الكاملة
          </Button>
        </div>
      </div>

      {/* Clause Compliance */}
      {latestScan && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            بنود المادة ١٢
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ARTICLE_12_CLAUSES.map((clause, i) => {
              const isCompliant = (latestScan as any)[`clause${i + 1}Compliant`];
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ${isCompliant ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"}`}
                  onClick={() => toast.info(`البند ${i + 1}: ${clause.name} - ${isCompliant ? "ممتثل ✓" : "غير ممتثل ✗"}`)}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCompliant ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-red-100 dark:bg-red-900/40"}`}>
                    {isCompliant ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{clause.name}</div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${isCompliant ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {isCompliant ? "ممتثل" : "غير ممتثل"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scan History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            سجل الفحوصات ({history.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((scan: any, idx: number) => {
              const sc = STATUS_CONFIG[scan.complianceStatus];
              return (
                <div
                  key={scan.id || idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${sc?.bg} ${sc?.border} ${expandedScan === idx ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setExpandedScan(expandedScan === idx ? null : idx)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sc?.darkBg}`}>
                    {sc?.icon && <sc.icon className={`w-4 h-4 ${sc.color}`} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${sc?.color}`}>{sc?.label}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(scan.overallScore || 0)}%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(scan.scanDate).toLocaleDateString("ar-SA-u-nu-latn")} - {new Date(scan.scanDate).toLocaleTimeString("ar-SA-u-nu-latn")}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {scan.clausesPassed || 0}/8 بنود
                  </div>
                  {expandedScan === idx && (
                    <div className="w-full mt-2 pt-2 border-t grid grid-cols-2 gap-1">
                      {ARTICLE_12_CLAUSES.map((c, ci) => {
                        const comp = (scan as any)[`clause${ci + 1}Compliant`];
                        return (
                          <div key={ci} className={`text-[10px] flex items-center gap-1 p-1 rounded ${comp ? 'text-emerald-600' : 'text-red-600'}`}>
                            {comp ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span className="truncate">{c.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact Info */}
      {(site?.contactUrl || site?.emails || site?.privacyUrl) && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            معلومات التواصل
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {site.privacyUrl && (
              <a href={site.privacyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs truncate">صفحة الخصوصية</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground me-auto" />
              </a>
            )}
            {site.contactUrl && (
              <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-xs truncate">صفحة التواصل</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground me-auto" />
              </a>
            )}
            {site.emails && (
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-xs truncate">{site.emails}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main DrillDownModal Component ──────────────────────────
export default function DrillDownModal({
  open,
  onOpenChange,
  filter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: DrillDownFilter | null;
}) {
  const [stack, setStack] = useState<DrillDownLevel[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const limit = 10;

  // Current level is either the top of stack or the initial filter
  const currentLevel = stack.length > 0 ? stack[stack.length - 1] : filter ? { type: "sites" as const, filter } : null;
  const currentFilter = currentLevel?.filter || filter;

  // Reset state when modal opens/closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setStack([]);
      setPage(1);
      setSearch("");
      setSelectedSiteId(null);
    }
    onOpenChange(newOpen);
  }, [onOpenChange]);

  // Push a new drill-down level
  const pushLevel = useCallback((level: DrillDownLevel) => {
    setStack((prev) => [...prev, level]);
    setPage(1);
    setSearch("");
    setSelectedSiteId(null);
  }, []);

  // Pop back one level
  const popLevel = useCallback(() => {
    if (selectedSiteId) {
      setSelectedSiteId(null);
      return;
    }
    setStack((prev) => prev.slice(0, -1));
    setPage(1);
    setSearch("");
  }, [selectedSiteId]);

  // Build the query params
  const queryParams = useMemo(() => {
    if (!currentFilter) return null;
    return {
      sectorType: currentFilter.sectorType,
      classification: currentFilter.classification,
      complianceStatus: currentFilter.complianceStatus,
      clauseNum: currentFilter.clauseIndex !== undefined ? currentFilter.clauseIndex + 1 : undefined,
      clauseCompliant: currentFilter.clauseCompliant,
      hasContactPage: currentFilter.hasContactPage,
      hasEmail: currentFilter.hasEmail,
      siteStatus: currentFilter.siteStatus,
      page,
      limit,
    };
  }, [currentFilter, page]);

  // Fetch sites data
  const sitesQuery = trpc.leadership.drillDown.useQuery(
    queryParams as any,
    { enabled: open && !!queryParams && !selectedSiteId }
  );

  // Excel export
  const exportExcel = trpc.dashboard.exportExcel.useMutation({
    onSuccess: (data: any) => {
      downloadBase64File(data.base64, data.filename);
      toast.success("تم تصدير الملف بنجاح");
    },
    onError: () => toast.error("فشل تصدير الملف"),
  });

  const sites = (sitesQuery.data as any)?.sites || [];
  const total = (sitesQuery.data as any)?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const isLoading = sitesQuery.isLoading;

  // Filter sites by search
  const filteredSites = useMemo(() => {
    if (!search) return sites;
    const s = search.toLowerCase();
    return sites.filter((site: any) =>
      (site.domain || "").toLowerCase().includes(s) ||
      (site.siteName || "").toLowerCase().includes(s) ||
      (site.classification || "").toLowerCase().includes(s)
    );
  }, [sites, search]);

  // Breadcrumb
  const breadcrumbs = useMemo(() => {
    const crumbs = [{ label: filter?.title || "التفاصيل", level: -1 }];
    stack.forEach((level, i) => {
      crumbs.push({ label: level.filter.title, level: i });
    });
    if (selectedSiteId) {
      const site = sites.find((s: any) => s.id === selectedSiteId);
      crumbs.push({ label: site?.siteName || site?.domain || `موقع #${selectedSiteId}`, level: stack.length });
    }
    return crumbs;
  }, [filter, stack, selectedSiteId, sites]);

  if (!filter) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="p-6 pb-4 border-b bg-gradient-to-l from-primary/5 to-transparent">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentFilter?.icon && (
                  <div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10"
                  >
                    {currentFilter.icon}
                  </div>
                )}
                <div>
                  <DialogTitle className="text-lg font-bold">{currentFilter?.title}</DialogTitle>
                  {currentFilter?.subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">{currentFilter.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!selectedSiteId && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={exportExcel.isPending || total === 0}
                    onClick={() => {
                    exportExcel.mutate({
                      type: "filtered",
                      complianceStatus: currentFilter?.complianceStatus,
                      sectorType: currentFilter?.sectorType,
                      classification: currentFilter?.classification,
                    } as any);
                    }}
                    className="gap-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    تصدير Excel
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Breadcrumb */}
          {(stack.length > 0 || selectedSiteId) && (
            <div
              className="flex items-center gap-1 mt-3 text-xs flex-wrap"
            >
              <Button variant="ghost" size="sm" onClick={() => { setStack([]); setSelectedSiteId(null); setPage(1); setSearch(""); }} className="h-6 px-2 text-xs text-primary">
                {filter.title}
              </Button>
              {stack.map((level, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStack((prev) => prev.slice(0, i + 1));
                      setSelectedSiteId(null);
                      setPage(1);
                      setSearch("");
                    }}
                    className="h-6 px-2 text-xs text-primary"
                  >
                    {level.filter.title}
                  </Button>
                </span>
              ))}
              {selectedSiteId && (
                <span className="flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">
                    {sites.find((s: any) => s.id === selectedSiteId)?.siteName || `موقع #${selectedSiteId}`}
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Back button + Search */}
          {!selectedSiteId && (
            <div className="flex items-center gap-2 mt-3">
              {stack.length > 0 && (
                <Button variant="outline" size="sm" onClick={popLevel} className="gap-1 shrink-0">
                  <ChevronRight className="w-4 h-4" />
                  رجوع
                </Button>
              )}
              <div className="relative flex-1">
                <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في المواقع..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pe-10"
                />
              </div>
              <Badge variant="outline" className="shrink-0">{total.toLocaleString("ar-SA")} موقع</Badge>
            </div>
          )}
          {selectedSiteId && (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={popLevel} className="gap-1">
                <ChevronRight className="w-4 h-4" />
                رجوع للقائمة
              </Button>
            </div>
          )}

          {/* Active Filters */}
          {!selectedSiteId && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentFilter?.complianceStatus && STATUS_CONFIG[currentFilter.complianceStatus] && (
                <Badge className={`${STATUS_CONFIG[currentFilter.complianceStatus].bg} ${STATUS_CONFIG[currentFilter.complianceStatus].color} ${STATUS_CONFIG[currentFilter.complianceStatus].border} border text-[10px]`}>
                  {STATUS_CONFIG[currentFilter.complianceStatus].label}
                </Badge>
              )}
              {currentFilter?.sectorType && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  {currentFilter.sectorType === "public" ? <Landmark className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                  {SECTOR_LABELS[currentFilter.sectorType] || currentFilter.sectorType}
                </Badge>
              )}
              {currentFilter?.classification && (
                <Badge variant="outline" className="text-[10px]">{currentFilter.classification}</Badge>
              )}
              {currentFilter?.clauseIndex !== undefined && (
                <Badge variant="outline" className="text-[10px]">البند {currentFilter.clauseIndex + 1}</Badge>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          
            {selectedSiteId ? (
              <div
                key={`site-${selectedSiteId}`}
              >
                <SiteDetailView siteId={selectedSiteId} />
              </div>
            ) : isLoading ? (
              <div
                key="loading"
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">جاري تحميل البيانات...</p>
              </div>
            ) : filteredSites.length === 0 ? (
              <div
                key="empty"
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <Globe className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">لا توجد مواقع مطابقة</p>
              </div>
            ) : (
              <div
                key={`sites-${page}-${search}-${JSON.stringify(currentFilter)}`}
                className="space-y-2"
              >
                {filteredSites.map((site: any, idx: number) => (
                  <SiteRow
                    key={site.id}
                    site={site}
                    idx={idx}
                    onClick={() => setSelectedSiteId(site.id)}
                  />
                ))}
              </div>
            )}
          
        </div>

        {/* Footer / Pagination */}
        {!selectedSiteId && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="gap-1">
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="gap-1">
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Hook for easy integration ──────────────────────────────
export function useDrillDown() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<DrillDownFilter | null>(null);

  const openDrillDown = useCallback((f: DrillDownFilter) => {
    setFilter(f);
    setOpen(true);
  }, []);

  const closeDrillDown = useCallback(() => {
    setOpen(false);
  }, []);

  return { open, setOpen, filter, openDrillDown, closeDrillDown };
}
