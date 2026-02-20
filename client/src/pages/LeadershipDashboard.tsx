import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Globe, ShieldCheck, ShieldAlert, ShieldX, FileX, ScanSearch,
  Building2, Landmark, BarChart3, Target, Eye, Layers, Filter,
  ChevronLeft, ExternalLink, Mail, Phone, X, Wifi, WifiOff,
  CheckCircle2, XCircle, TrendingUp, Sparkles, History, ArrowUpRight, ArrowDownRight, Minus,
  Download, Loader2, Camera, Bell, BellRing, Eye as EyeIcon, GitCompare,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, RadialBarChart, RadialBar, Legend,
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter, ZAxis,
} from "recharts";
import { useState, useMemo, useCallback, useEffect, useRef, Fragment } from "react";
import { ScreenshotThumbnail } from "@/components/ScreenshotPreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useLocation } from "wouter";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

// ===== Constants =====
const COMPLIANCE_COLORS: Record<string, string> = {
  compliant: "#22c55e",
  partially_compliant: "#f59e0b",
  non_compliant: "#ef4444",
  no_policy: "#71717a",
};

const COMPLIANCE_LABELS: Record<string, string> = {
  compliant: "ممتثل",
  partially_compliant: "ممتثل جزئياً",
  non_compliant: "غير ممتثل",
  no_policy: "غير ممتثل",
  not_working: "لا يعمل",
};

const SECTOR_LABELS: Record<string, string> = {
  public: "القطاع الحكومي",
  private: "القطاع الخاص",
};

const CLAUSE_NAMES = [
  "تحديد الغرض من جمع البيانات الشخصية",
  "تحديد محتوى البيانات الشخصية المطلوب جمعها",
  "تحديد طريقة جمع البيانات الشخصية",
  "تحديد وسيلة حفظ البيانات الشخصية",
  "تحديد كيفية معالجة البيانات الشخصية",
  "تحديد كيفية إتلاف البيانات الشخصية",
  "تحديد حقوق صاحب البيانات الشخصية",
  "كيفية ممارسة صاحب البيانات لحقوقه",
];

const CLAUSE_SHORT = [
  "غرض الجمع", "محتوى البيانات", "طريقة الجمع", "وسيلة الحفظ",
  "كيفية المعالجة", "كيفية الإتلاف", "حقوق صاحب البيانات", "ممارسة الحقوق",
];

// ===== Filter Types =====
interface ActiveFilters {
  sectorType?: string;
  classification?: string;
  complianceStatus?: string;
  clauseNum?: number;
  clauseCompliant?: boolean;
  hasContactPage?: boolean;
  hasEmail?: boolean;
  siteStatus?: string;
}

// ===== Animation Variants =====
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};
const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { type: "spring" as const, stiffness: 400, damping: 17 } },
};

// ===== Animated Counter Hook =====
function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = ref.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setCount(current);
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = target;
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return count;
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const animated = useAnimatedCounter(value);
  return <span className={className}>{animated.toLocaleString("ar-SA-u-nu-latn")}</span>;
}

// ===== Main Component =====
export default function LeadershipDashboard() {
  const { playClick, playHover } = useSoundEffects();
  const { data, isLoading } = trpc.leadership.stats.useQuery();
  const [filters, setFilters] = useState<ActiveFilters>({});
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState("");
  const [drillDownFilters, setDrillDownFilters] = useState<ActiveFilters>({});
  const [drillDownPage, setDrillDownPage] = useState(1);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySiteId, setHistorySiteId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportingPptx, setExportingPptx] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  // Enhanced analytics queries
  const radarData = trpc.executiveDashboard.radarChart.useQuery();
  const heatmapData = trpc.executiveDashboard.heatmap.useQuery();
  const trendData = trpc.executiveDashboard.complianceTrend.useQuery();
  const sectorTrendData = trpc.executiveDashboard.sectorTrend.useQuery();
  const velocityData = trpc.executiveDashboard.improvementVelocity.useQuery();
  const benchmarkData = trpc.executiveDashboard.benchmarking.useQuery();
  const predictiveData = trpc.executiveDashboard.predictiveAnalytics.useQuery();
  const alertStats = trpc.executiveAlerts.stats.useQuery();
  const recentAlerts = trpc.executiveAlerts.list.useQuery({ limit: 5 });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const utils = trpc.useUtils();

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      utils.leadership.stats.invalidate();
      utils.executiveDashboard.radarChart.invalidate();
      utils.executiveDashboard.complianceTrend.invalidate();
      utils.executiveDashboard.improvementVelocity.invalidate();
      utils.executiveAlerts.stats.invalidate();
    }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, utils]);

  const exportLeadershipPptx = trpc.reports.exportLeadershipPdf.useMutation({
    onSuccess: async (result) => {
      try {
        const response = await fetch(result.url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }));
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch {
        window.open(result.url, '_blank');
      }
      setExportingPptx(false);
    },
    onError: () => setExportingPptx(false),
  });

  const exportPDF = useCallback(async () => {
    if (!dashboardRef.current || exporting) return;
    setExporting(true);
    try {
      const el = dashboardRef.current;
      // Temporarily expand for full capture
      const originalOverflow = el.style.overflow;
      el.style.overflow = 'visible';
      
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
      });
      
      el.style.overflow = originalOverflow;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const totalPdfHeight = imgHeight * ratio;
      
      let position = 0;
      let pageNum = 0;
      
      while (position < totalPdfHeight) {
        if (pageNum > 0) pdf.addPage();
        
        // Calculate source crop for this page
        const sourceY = (position / ratio);
        const sourceHeight = Math.min(pdfHeight / ratio, imgHeight - sourceY);
        
        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        const ctx = pageCanvas.getContext('2d')!;
        ctx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
        
        const pageImgData = pageCanvas.toDataURL('image/png');
        const pageImgHeight = sourceHeight * ratio;
        
        pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pageImgHeight);
        
        position += pdfHeight;
        pageNum++;
      }
      
      // Add footer to last page
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      const dateStr = new Date().toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });
      pdf.text(`\u062a\u0642\u0631\u064a\u0631 \u0644\u0648\u062d\u0629 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062a \u0627\u0644\u0642\u064a\u0627\u062f\u064a\u0629 - \u0645\u0646\u0635\u0629 \u0631\u0627\u0635\u062f - ${dateStr}`, pdfWidth / 2, pdfHeight - 5, { align: 'center' });
      
      pdf.save(`rasid-leadership-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  const siteHistory = trpc.leadership.siteHistory.useQuery(
    { siteId: historySiteId! },
    { enabled: historyOpen && historySiteId !== null }
  );

  const openHistory = useCallback((siteId: number) => {
    setHistorySiteId(siteId);
    setHistoryOpen(true);
  }, []);

  const drillDown = trpc.leadership.drillDown.useQuery(
    { ...drillDownFilters, page: drillDownPage, limit: 20 },
    { enabled: drillDownOpen }
  );

  const openDrillDown = useCallback((title: string, f: ActiveFilters) => {
    setDrillDownTitle(title);
    setDrillDownFilters({ ...filters, ...f });
    setDrillDownPage(1);
    setDrillDownOpen(true);
  }, [filters]);

  const toggleFilter = useCallback((key: keyof ActiveFilters, value: any) => {
    setFilters(prev => {
      const next = { ...prev };
      if (next[key] === value) {
        delete next[key];
      } else {
        (next as any)[key] = value;
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);
  const hasFilters = Object.keys(filters).length > 0;

  // ===== Filtered Data =====
  const filtered = useMemo(() => {
    if (!data) return null;
    const { general, clauses, sectors, categories } = data;

    // If no filters, return raw data
    if (!hasFilters) return { general, clauses, sectors, categories };

    // Filter sectors
    let filteredSectors = sectors;
    if (filters.sectorType) {
      filteredSectors = sectors.filter(s => s.sector === filters.sectorType);
    }

    // Filter categories
    let filteredCategories = categories;
    if (filters.classification) {
      filteredCategories = categories.filter(c => c.category === filters.classification);
    }

    // Determine the best data source for recalculating general stats
    // Priority: classification > sectorType (more specific wins)
    // Any single filter should recalculate the entire dashboard
    const needsRecalc = filters.sectorType || filters.classification || filters.complianceStatus || filters.siteStatus || filters.hasEmail || filters.hasContactPage;
    
    if (needsRecalc) {
      // Use the most specific filtered source available
      const source = filters.classification ? filteredCategories : filteredSectors;
      let g = {
        totalSites: source.reduce((s, x) => s + x.totalSites, 0),
        totalScans: source.reduce((s, x) => s + x.totalScans, 0),
        compliant: source.reduce((s, x) => s + x.compliant, 0),
        nonCompliant: source.reduce((s, x) => s + x.nonCompliant, 0),
        partiallyCompliant: source.reduce((s, x) => s + x.partiallyCompliant, 0),
        noPolicy: source.reduce((s, x) => s + x.noPolicy, 0),
        unreachable: general.unreachable,
      };

      // If only compliance status filter, filter from general
      if (filters.complianceStatus && !filters.sectorType && !filters.classification) {
        const statusKey = filters.complianceStatus === 'compliant' ? 'compliant' 
          : filters.complianceStatus === 'non_compliant' ? 'nonCompliant'
          : filters.complianceStatus === 'partially_compliant' ? 'partiallyCompliant'
          : filters.complianceStatus === 'no_policy' ? 'noPolicy' : '';
        if (statusKey) {
          const filteredCount = general[statusKey as keyof typeof general] as number;
          g = {
            totalSites: filteredCount,
            totalScans: filteredCount,
            compliant: statusKey === 'compliant' ? filteredCount : 0,
            nonCompliant: statusKey === 'nonCompliant' ? filteredCount : 0,
            partiallyCompliant: statusKey === 'partiallyCompliant' ? filteredCount : 0,
            noPolicy: statusKey === 'noPolicy' ? filteredCount : 0,
            unreachable: statusKey === 'noPolicy' ? filteredCount : 0,
          };
        }
      }

      // Apply compliance status filter on top of sector/classification
      if (filters.complianceStatus && (filters.sectorType || filters.classification)) {
        const statusKey = filters.complianceStatus === 'compliant' ? 'compliant' 
          : filters.complianceStatus === 'non_compliant' ? 'nonCompliant'
          : filters.complianceStatus === 'partially_compliant' ? 'partiallyCompliant'
          : filters.complianceStatus === 'no_policy' ? 'noPolicy' : '';
        if (statusKey) {
          const filteredCount = g[statusKey as keyof typeof g] as number;
          g = {
            totalSites: filteredCount,
            totalScans: filteredCount,
            compliant: statusKey === 'compliant' ? filteredCount : 0,
            nonCompliant: statusKey === 'nonCompliant' ? filteredCount : 0,
            partiallyCompliant: statusKey === 'partiallyCompliant' ? filteredCount : 0,
            noPolicy: statusKey === 'noPolicy' ? filteredCount : 0,
            unreachable: statusKey === 'noPolicy' ? filteredCount : 0,
          };
        }
      }

      const clauseData = clauses.map((c, i) => {
        const compliant = source.reduce((s, x) => s + (x.clauses[i]?.compliant || 0), 0);
        const total = g.compliant + g.nonCompliant + g.partiallyCompliant + g.noPolicy;
        return {
          ...c,
          compliant,
          nonCompliant: total - compliant,
          total,
          percentage: total > 0 ? Math.round((compliant / total) * 100) : 0,
        };
      });
      return { general: g, clauses: clauseData, sectors: filteredSectors, categories: filteredCategories };
    }

    return { general, clauses, sectors: filteredSectors, categories: filteredCategories };
  }, [data, filters, hasFilters]);

  if (isLoading || !data || !filtered) {
    return <LoadingSkeleton />;
  }

  const { general, clauses, sectors, categories } = filtered;
  const totalScanned = general.compliant + general.nonCompliant + general.partiallyCompliant + general.noPolicy;
  const pct = (v: number, t: number) => t > 0 ? Math.round((v / t) * 100) : 0;

  // Get unique classifications for filter
  const allClassifications = data.categories.map(c => c.category);

  return (
    <div ref={dashboardRef} className="space-y-8 pb-8 overflow-x-hidden max-w-full">
      <WatermarkLogo />
      {/* ===== HEADER ===== */}
      <div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-primary/5 via-primary/10 to-transparent p-6 border border-primary/10"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-10 -translate-y-10 blur-2xl btn-glow" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/8 rounded-full translate-x-8 translate-y-8 blur-xl btn-glow" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div
            className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <BarChart3 className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-l from-primary to-foreground bg-clip-text text-transparent gradient-text">
              لوحة المؤشرات القيادية
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              تحليل شامل لامتثال المواقع السعودية للمادة 12 من نظام حماية البيانات الشخصية
            </p>
          </div>
          <div className="me-auto flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                autoRefresh
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50"}`} />
              {autoRefresh ? 'تحديث تلقائي' : 'تحديث تلقائي'}
            </button>
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-all disabled:opacity-50 btn-glow"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exporting ? '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0635\u062f\u064a\u0631...' : '\u062a\u0635\u062f\u064a\u0631 PDF'}
            </button>
            <button
              onClick={() => { setExportingPptx(true); exportLeadershipPptx.mutate(); }}
              disabled={exportingPptx}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-medium transition-all disabled:opacity-50"
            >
              {exportingPptx ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {exportingPptx ? 'جاري التصدير...' : 'تصدير PPTX'}
            </button>
            <div
            >
              <Sparkles className="h-5 w-5 text-primary/40" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== FILTER BAR ===== */}
      <div
        className="space-y-3"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>التصفية:</span>
          </div>

          {/* Sector Filters */}
          <FilterChip
            label="القطاع الحكومي"
            icon={<Landmark className="h-3.5 w-3.5" />}
            active={filters.sectorType === "public"}
            onClick={() => toggleFilter("sectorType", "public")}
            color="blue"
          />
          <FilterChip
            label="القطاع الخاص"
            icon={<Building2 className="h-3.5 w-3.5" />}
            active={filters.sectorType === "private"}
            onClick={() => toggleFilter("sectorType", "private")}
            color="purple"
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Compliance Filters */}
          <FilterChip
            label="ممتثل"
            active={filters.complianceStatus === "compliant"}
            onClick={() => toggleFilter("complianceStatus", "compliant")}
            color="green"
          />
          <FilterChip
            label="ممتثل جزئياً"
            active={filters.complianceStatus === "partially_compliant"}
            onClick={() => toggleFilter("complianceStatus", "partially_compliant")}
            color="amber"
          />
          <FilterChip
            label="غير ممتثل"
            active={filters.complianceStatus === "non_compliant"}
            onClick={() => toggleFilter("complianceStatus", "non_compliant")}
            color="red"
          />
          <FilterChip
            label="لا يعمل"
            active={filters.complianceStatus === "no_policy"}
            onClick={() => toggleFilter("complianceStatus", "no_policy")}
            color="zinc"
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Site Status */}
          <FilterChip
            label="يعمل"
            icon={<Wifi className="h-3.5 w-3.5" />}
            active={filters.siteStatus === "active"}
            onClick={() => toggleFilter("siteStatus", "active")}
            color="green"
          />
          <FilterChip
            label="لا يعمل"
            icon={<WifiOff className="h-3.5 w-3.5" />}
            active={filters.siteStatus === "unreachable"}
            onClick={() => toggleFilter("siteStatus", "unreachable")}
            color="red"
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Contact/Email */}
          <FilterChip
            label="لديه بريد"
            icon={<Mail className="h-3.5 w-3.5" />}
            active={filters.hasEmail === true}
            onClick={() => toggleFilter("hasEmail", true)}
            color="blue"
          />
          <FilterChip
            label="لديه صفحة تواصل"
            icon={<Phone className="h-3.5 w-3.5" />}
            active={filters.hasContactPage === true}
            onClick={() => toggleFilter("hasContactPage", true)}
            color="blue"
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
            >
              <X className="h-3 w-3" />
              مسح الكل
            </button>
          )}
        </div>

        {/* Classification Filter Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">التصنيف:</span>
          {allClassifications.slice(0, 15).map(cls => (
            <FilterChip
              key={cls}
              label={cls}
              active={filters.classification === cls}
              onClick={() => toggleFilter("classification", cls)}
              color="slate"
              small
            />
          ))}
        </div>
      </div>

      {/* ===== GROUP 1: GENERAL MONITORING ===== */}
      <section>
        <SectionHeader
          icon={<Eye className="h-4.5 w-4.5" />}
          title="الرصد العام"
          subtitle="إحصائيات شاملة لجميع المواقع المرصودة"
          gradient="from-blue-500/20 to-cyan-500/20"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 stagger-children">
          <MetricCard
            label="إجمالي المواقع"
            value={general.totalSites}
            icon={<Globe className="h-5 w-5" />}
            color="blue"
            onClick={() => openDrillDown("جميع المواقع", {})}
          />
          <MetricCard
            label="إجمالي الفحوصات"
            value={general.totalScans}
            icon={<ScanSearch className="h-5 w-5" />}
            color="purple"
          />
          <MetricCard
            label="ممتثل"
            value={general.compliant}
            percentage={pct(general.compliant, totalScanned)}
            icon={<ShieldCheck className="h-5 w-5" />}
            color="green"
            onClick={() => openDrillDown("المواقع الممتثلة", { complianceStatus: "compliant" })}
          />
          <MetricCard
            label="غير ممتثل"
            value={general.nonCompliant}
            percentage={pct(general.nonCompliant, totalScanned)}
            icon={<ShieldX className="h-5 w-5" />}
            color="red"
            onClick={() => openDrillDown("المواقع غير الممتثلة", { complianceStatus: "non_compliant" })}
          />
          <MetricCard
            label="ممتثل جزئياً"
            value={general.partiallyCompliant}
            percentage={pct(general.partiallyCompliant, totalScanned)}
            icon={<ShieldAlert className="h-5 w-5" />}
            color="amber"
            onClick={() => openDrillDown("المواقع الممتثلة جزئياً", { complianceStatus: "partially_compliant" })}
          />
          <MetricCard
            label="لا يعمل"
            value={general.noPolicy}
            percentage={pct(general.noPolicy, totalScanned)}
            icon={<FileX className="h-5 w-5" />}
            color="zinc"
            onClick={() => openDrillDown("المواقع التي لا تعمل", { complianceStatus: "no_policy" })}
          />
        </div>

        {/* Compliance Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 stagger-children">
          <div>
            <CompliancePieChart
              compliant={general.compliant}
              nonCompliant={general.nonCompliant}
              partiallyCompliant={general.partiallyCompliant}
              noPolicy={general.noPolicy}
              onSliceClick={(status) => openDrillDown(COMPLIANCE_LABELS[status] || status, { complianceStatus: status })}
            />
          </div>
          <div>
            <ComplianceGauge compliant={general.compliant} total={totalScanned} />
          </div>
        </div>
      </section>

      {/* ===== GROUP 2: ARTICLE 12 CLAUSES ===== */}
      <section>
        <SectionHeader
          icon={<Target className="h-4.5 w-4.5" />}
          title="امتثال بنود المادة 12"
          subtitle="تحليل تفصيلي لكل بند من البنود الثمانية لنظام حماية البيانات الشخصية"
          gradient="from-emerald-500/20 to-blue-800/20"
        />

        {/* Clause Cards - Infographic Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 stagger-children">
          {clauses.map((c, i) => (
            <div key={c.clause}>
              <ClauseInfographicCard
                clause={c}
                index={i}
                onClickCompliant={() => openDrillDown(`بند ${c.clause}: ${CLAUSE_SHORT[i]} - ممتثل`, { clauseNum: c.clause, clauseCompliant: true })}
                onClickNonCompliant={() => openDrillDown(`بند ${c.clause}: ${CLAUSE_SHORT[i]} - غير ممتثل`, { clauseNum: c.clause, clauseCompliant: false })}
              />
            </div>
          ))}
        </div>

        {/* Radar + Bar Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 stagger-children">
          <div>
            <Card className="glass-card gold-sweep overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center btn-glow">
                    <BarChart3 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  نسبة الامتثال لكل بند
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={clauses.map(c => ({
                        name: `بند ${c.clause}`,
                        fullName: c.name,
                        percentage: c.percentage,
                        compliant: c.compliant,
                        nonCompliant: c.nonCompliant,
                        total: c.total,
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" width={55} tick={{ fill: "var(--color-foreground)", fontSize: 11, fontFamily: "Tajawal" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "12px",
                          direction: "rtl",
                          fontFamily: "Tajawal",
                          color: "var(--color-popover-foreground)",
                          boxShadow: "0 8px 32px -4px rgba(0,0,0,0.1)",
                        }}
                        formatter={(value: number, _name: string, props: any) => [
                          `${value}% (${props.payload.compliant}/${props.payload.total})`,
                          props.payload.fullName,
                        ]}
                      />
                      <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={24}>
                        {clauses.map((c, i) => (
                          <Cell key={i} fill={c.percentage >= 60 ? "#22c55e" : c.percentage >= 40 ? "#f59e0b" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="glass-card gold-sweep overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center btn-glow">
                    <Target className="h-3.5 w-3.5 text-primary" />
                  </div>
                  مخطط الامتثال الشبكي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={clauses.map(c => ({
                      subject: CLAUSE_SHORT[c.clause - 1],
                      value: c.percentage,
                      fullMark: 100,
                    }))}>
                      <PolarGrid stroke="var(--color-border)" strokeOpacity={0.5} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--color-foreground)", fontSize: 10, fontFamily: "Tajawal" }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 9 }} />
                      <Radar name="نسبة الامتثال" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== SECTOR COMPARISON ===== */}
      <section>
        <SectionHeader
          icon={<Landmark className="h-4.5 w-4.5" />}
          title="التحليل حسب القطاع"
          subtitle="مقارنة الامتثال بين القطاعين الحكومي والخاص"
          gradient="from-primary/20 to-[oklch(0.48_0.14_290)]/20"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 stagger-children">
          {sectors.map(s => (
            <div key={s.sector}>
              <SectorCard
                sector={s}
                onClickCompliance={(status) => openDrillDown(
                  `${SECTOR_LABELS[s.sector]} - ${COMPLIANCE_LABELS[status]}`,
                  { sectorType: s.sector, complianceStatus: status }
                )}
                onClickClause={(clauseNum, compliant) => openDrillDown(
                  `${SECTOR_LABELS[s.sector]} - بند ${clauseNum} (${compliant ? "ممتثل" : "غير ممتثل"})`,
                  { sectorType: s.sector, clauseNum, clauseCompliant: compliant }
                )}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORY BREAKDOWN ===== */}
      <section>
        <SectionHeader
          icon={<Layers className="h-4.5 w-4.5" />}
          title="التحليل حسب التصنيف"
          subtitle="تفصيل الامتثال حسب تصنيف المواقع"
          gradient="from-orange-500/20 to-amber-500/20"
        />

        {/* Category Stacked Bar Chart */}
        <div className="mt-4">
          <Card className="glass-card gold-sweep overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">توزيع الامتثال حسب التصنيف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categories.slice(0, 12).map(c => ({
                      name: c.category.length > 12 ? c.category.slice(0, 12) + '...' : c.category,
                      fullName: c.category,
                      compliant: c.compliant,
                      partial: c.partiallyCompliant,
                      nonCompliant: c.nonCompliant,
                      noPolicy: c.noPolicy,
                      total: c.totalSites,
                    }))}
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 9, fontFamily: "Tajawal" }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "12px",
                        direction: "rtl",
                        fontFamily: "Tajawal",
                        color: "var(--color-popover-foreground)",
                      }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = { compliant: "ممتثل", partial: "ممتثل جزئياً", nonCompliant: "غير ممتثل", noPolicy: "لا يعمل" };
                        return [value, labels[name] || name];
                      }}
                    />
                    <Bar dataKey="compliant" stackId="a" fill="#22c55e" />
                    <Bar dataKey="partial" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="nonCompliant" stackId="a" fill="#ef4444" />
                    <Bar dataKey="noPolicy" stackId="a" fill="#71717a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 justify-center mt-3">
                <LegendDot color="#22c55e" label="ممتثل" />
                <LegendDot color="#f59e0b" label="جزئياً" />
                <LegendDot color="#ef4444" label="غير ممتثل" />
                <LegendDot color="#71717a" label="لا يعمل" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Infographic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 stagger-children">
          {categories.map((cat, i) => (
            <div key={cat.category}>
              <CategoryInfographicCard
                category={cat}
                index={i}
                onClickCompliance={(status) => openDrillDown(
                  `${cat.category} - ${COMPLIANCE_LABELS[status]}`,
                  { classification: cat.category, complianceStatus: status }
                )}
                onClickClause={(clauseNum, compliant) => openDrillDown(
                  `${cat.category} - بند ${clauseNum} (${compliant ? "ممتثل" : "غير ممتثل"})`,
                  { classification: cat.category, clauseNum, clauseCompliant: compliant }
                )}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ===== GROUP 5: COMPLIANCE TRENDS ===== */}
      <section>
        <SectionHeader
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          title="اتجاهات الامتثال"
          subtitle="تطور معدلات الامتثال عبر الزمن مع توقعات مستقبلية"
          gradient="from-sky-500/20 to-indigo-500/20"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 stagger-children">
          {/* Compliance Trend Line Chart */}
          <div>
            <Card className="glass-card gold-sweep overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-sky-500" />
                  </div>
                  اتجاه معدل الامتثال الشهري
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {trendData.data && trendData.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData.data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "12px",
                            direction: "rtl",
                            fontFamily: "Tajawal",
                            color: "var(--color-popover-foreground)",
                          }}
                          formatter={(value: number, name: string) => {
                            const labels: Record<string, string> = { complianceRate: "معدل الامتثال", avgScore: "متوسط الدرجة" };
                            return [`${value}%`, labels[name] || name];
                          }}
                        />
                        <Area type="monotone" dataKey="complianceRate" stroke="#22c55e" fill="url(#colorCompliance)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      لا توجد بيانات اتجاهات بعد
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stacked Area Chart - Compliance Status Over Time */}
          <div>
            <Card className="glass-card gold-sweep overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Layers className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  توزيع حالات الامتثال عبر الزمن
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {trendData.data && trendData.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData.data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                        <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
                        <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: "12px",
                            direction: "rtl",
                            fontFamily: "Tajawal",
                            color: "var(--color-popover-foreground)",
                          }}
                          formatter={(value: number, name: string) => {
                            const labels: Record<string, string> = { compliant: "ممتثل", partial: "ممتثل جزئياً", nonCompliant: "غير ممتثل", noPolicy: "لا يعمل" };
                            return [value, labels[name] || name];
                          }}
                        />
                        <Area type="monotone" dataKey="compliant" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="partial" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="nonCompliant" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="noPolicy" stackId="1" stroke="#71717a" fill="#71717a" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      لا توجد بيانات اتجاهات بعد
                    </div>
                  )}
                </div>
                <div className="flex gap-4 justify-center mt-3">
                  <LegendDot color="#22c55e" label="ممتثل" />
                  <LegendDot color="#f59e0b" label="جزئياً" />
                  <LegendDot color="#ef4444" label="غير ممتثل" />
                  <LegendDot color="#71717a" label="لا يعمل" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Predictive Analytics */}
        {predictiveData.data?.forecast && predictiveData.data.forecast.length > 0 && (
          <div className="mt-4">
            <Card className="glass-card gold-sweep overflow-hidden border-dashed border-sky-500/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-xl bg-sky-500/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-sky-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">التوقعات المستقبلية</h3>
                    <p className="text-[10px] text-muted-foreground">بناءً على تحليل الانحدار الخطي للبيانات التاريخية</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
                  {predictiveData.data.forecast.map((f: any) => (
                    <div key={f.monthsAhead} className="text-center p-4 rounded-xl bg-sky-500/5 border border-sky-500/10">
                      <p className="text-xs text-muted-foreground mb-1">بعد {f.monthsAhead} أشهر</p>
                      <p className="text-2xl font-bold text-sky-400">{f.predictedRate}%</p>
                      <p className="text-[10px] text-muted-foreground">معدل امتثال متوقع</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* ===== GROUP 6: HEATMAP & VELOCITY ===== */}
      <section>
        <SectionHeader
          icon={<GitCompare className="h-4.5 w-4.5" />}
          title="خريطة الامتثال الحرارية وسرعة التحسين"
          subtitle="تحليل مرئي لمستويات الامتثال بين القطاعات والبنود"
          gradient="from-rose-500/20 to-pink-500/20"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 stagger-children">
          {/* Heatmap */}
          <div className="lg:col-span-2">
            <Card className="glass-card gold-sweep overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">خريطة حرارية: القطاعات × بنود المادة 12</CardTitle>
              </CardHeader>
              <CardContent>
                {heatmapData.data && heatmapData.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          <th className="text-end p-2 text-muted-foreground font-medium">القطاع / التصنيف</th>
                          {CLAUSE_SHORT.map((name, i) => (
                            <th key={i} className="p-2 text-center text-muted-foreground font-medium whitespace-nowrap">ب{i + 1}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {heatmapData.data.map((row: any, ri: number) => (
                          <tr key={ri} className="border-t border-[rgba(197,165,90,0.10)]/30">
                            <td className="p-2 font-medium whitespace-nowrap">
                              {row.sector} - {row.classification}
                              <span className="text-muted-foreground me-1">({row.total})</span>
                            </td>
                            {row.clauses.map((val: number, ci: number) => {
                              const bg = val >= 70 ? "bg-emerald-500" : val >= 40 ? "bg-amber-500" : "bg-red-500";
                              const opacity = Math.max(0.2, val / 100);
                              return (
                                <td key={ci} className="p-1.5 text-center">
                                  <div
                                    className={`${bg} rounded-md px-2 py-1.5 text-white font-bold text-[11px] min-w-[40px]`}
                                    style={{ opacity }}
                                    title={`${CLAUSE_SHORT[ci]}: ${val}%`}
                                  >
                                    {val}%
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    لا توجد بيانات للخريطة الحرارية
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Improvement Velocity */}
          <div>
            <Card className="glass-card gold-sweep overflow-hidden h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-rose-500/10 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                  </div>
                  سرعة التحسين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {velocityData.data ? (
                  <>
                    <div className="text-center py-4">
                      <div
                        className={`text-5xl font-bold ${
                          velocityData.data.velocity > 0 ? "text-emerald-500" : velocityData.data.velocity < 0 ? "text-red-500" : "text-muted-foreground"
                        }`}
                      >
                        {velocityData.data.velocity > 0 ? "+" : ""}{velocityData.data.velocity}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">مؤشر سرعة التحسين</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10">
                        <div className="flex items-center gap-2">
                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs font-medium">تحسنت</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-500">{velocityData.data.improved}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10">
                        <div className="flex items-center gap-2">
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                          <span className="text-xs font-medium">تراجعت</span>
                        </div>
                        <span className="text-lg font-bold text-red-500">{velocityData.data.declined}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Minus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium">بدون تغيير</span>
                        </div>
                        <span className="text-lg font-bold text-muted-foreground">{velocityData.data.unchanged}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    جاري التحميل...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== GROUP 7: BENCHMARKING ===== */}
      <section>
        <SectionHeader
          icon={<GitCompare className="h-4.5 w-4.5" />}
          title="المقارنة المعيارية"
          subtitle="مقارنة أداء الامتثال بين القطاعات والتصنيفات"
          gradient="from-blue-800/20 to-cyan-500/20"
        />

        {benchmarkData.data && benchmarkData.data.length > 0 && (
          <div className="mt-4">
            <Card className="glass-card gold-sweep overflow-hidden">
              <CardContent className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-end p-3 font-semibold text-muted-foreground">القطاع</th>
                        <th className="text-end p-3 font-semibold text-muted-foreground">التصنيف</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">عدد المواقع</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">متوسط الدرجة</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">أعلى</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">أدنى</th>
                        <th className="text-center p-3 font-semibold text-muted-foreground">معدل الامتثال</th>
                        <th className="p-3 font-semibold text-muted-foreground">التوزيع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarkData.data.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium">{row.sector}</td>
                          <td className="p-3">{row.classification}</td>
                          <td className="p-3 text-center font-bold">{row.siteCount}</td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${
                              row.avgScore >= 6 ? "text-emerald-500" : row.avgScore >= 4 ? "text-amber-500" : "text-red-500"
                            }`}>{row.avgScore}/8</span>
                          </td>
                          <td className="p-3 text-center text-emerald-500 font-medium">{row.maxScore}</td>
                          <td className="p-3 text-center text-red-500 font-medium">{row.minScore}</td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className={`text-[10px] ${
                              row.complianceRate >= 60 ? "border-emerald-500/30 text-emerald-500" :
                              row.complianceRate >= 40 ? "border-amber-500/30 text-amber-500" :
                              "border-red-500/30 text-red-500"
                            }`}>
                              {row.complianceRate}%
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex h-2 rounded-full overflow-hidden bg-muted/50 min-w-[100px]">
                              {row.compliant > 0 && <div className="bg-emerald-500" style={{ width: `${(row.compliant / row.siteCount) * 100}%` }} />}
                              {row.partial > 0 && <div className="bg-amber-500" style={{ width: `${(row.partial / row.siteCount) * 100}%` }} />}
                              {row.nonCompliant > 0 && <div className="bg-red-500" style={{ width: `${(row.nonCompliant / row.siteCount) * 100}%` }} />}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* ===== GROUP 8: EXECUTIVE ALERTS ===== */}
      <section>
        <SectionHeader
          icon={<BellRing className="h-4.5 w-4.5" />}
          title="التنبيهات التنفيذية"
          subtitle="تنبيهات المستوى القيادي للمؤشرات الحرجة"
          gradient="from-red-500/20 to-orange-500/20"
        />

        {alertStats.data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 stagger-children">
            <div>
              <Card className="glass-card gold-sweep border-red-500/20">
                <CardContent className="p-4 text-center">
                      <p className="text-4xl sm:text-3xl font-bold text-red-500">{alertStats.data.critical}</p>
                  <p className="text-xs text-muted-foreground mt-1">حرج</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="glass-card gold-sweep border-orange-500/20">
                <CardContent className="p-4 text-center">
                      <p className="text-4xl sm:text-3xl font-bold text-orange-500">{alertStats.data.high}</p>
                  <p className="text-xs text-muted-foreground mt-1">عالي</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="glass-card gold-sweep border-amber-500/20">
                <CardContent className="p-4 text-center">
                      <p className="text-4xl sm:text-3xl font-bold text-amber-500">{alertStats.data.medium}</p>
                  <p className="text-xs text-muted-foreground mt-1">متوسط</p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="glass-card gold-sweep border-sky-500/20">
                <CardContent className="p-4 text-center">
                      <p className="text-4xl sm:text-3xl font-bold text-sky-500">{alertStats.data.unacknowledged}</p>
                  <p className="text-xs text-muted-foreground mt-1">غير معالج</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {recentAlerts.data && recentAlerts.data.length > 0 && (
          <div className="mt-4 space-y-2">
            {recentAlerts.data.map((alert: any) => {
              const severityColors: Record<string, { bg: string; text: string; border: string }> = {
                critical: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30" },
                high: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/30" },
                medium: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
                low: { bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/30" },
              };
              const sc = severityColors[alert.severity] || severityColors.low;
              return (
                <div
                  key={alert.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${sc.border} ${sc.bg} transition-all hover:shadow-sm`}
                >
                  <div className={`h-10 w-10 rounded-xl ${sc.bg} flex items-center justify-center shrink-0`}>
                    <Bell className={`h-5 w-5 ${sc.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold truncate">{alert.title}</h4>
                      <Badge variant="outline" className={`text-[9px] ${sc.text} ${sc.border} shrink-0`}>
                        {alert.severity === 'critical' ? 'حرج' : alert.severity === 'high' ? 'عالي' : alert.severity === 'medium' ? 'متوسط' : 'منخفض'}
                      </Badge>
                    </div>
                    {alert.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.description}</p>}
                    {alert.suggestedAction && (
                      <p className="text-[10px] text-primary mt-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {alert.suggestedAction}
                      </p>
                    )}
                  </div>
                  {alert.isAcknowledged ? (
                    <Badge variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/30 shrink-0">تم المعالجة</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] text-amber-500 border-amber-500/30 shrink-0 animate-pulse">قيد الانتظار</Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== DRILL-DOWN DIALOG ===== */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center btn-glow">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              {drillDownTitle}
              {drillDown.data && (
                <Badge variant="outline" className="me-2">{drillDown.data.total} موقع</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            {drillDown.isLoading ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : drillDown.data?.sites.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد مواقع تطابق المعايير المحددة</p>
              </div>
            ) : (
              <div className="space-y-2 p-1">
                {drillDown.data?.sites.map((site: any, i: number) => (
                  <div
                    key={site.id}
                  >
                    <SiteDrillDownCard site={site} onNavigate={() => {
                      setDrillDownOpen(false);
                      navigate(`/sites/${site.id}`);
                    }} onShowHistory={() => openHistory(site.id)} />
                  </div>
                ))}

                {/* Pagination */}
                {drillDown.data && drillDown.data.total > 20 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => setDrillDownPage(p => Math.max(1, p - 1))}
                      disabled={drillDownPage <= 1}
                      className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm disabled:opacity-30 hover:bg-muted transition-colors"
                    >
                      السابق
                    </button>
                    <span className="text-sm text-muted-foreground">
                      صفحة {drillDownPage} من {Math.ceil(drillDown.data.total / 20)}
                    </span>
                    <button
                      onClick={() => setDrillDownPage(p => p + 1)}
                      disabled={drillDownPage >= Math.ceil((drillDown.data?.total || 0) / 20)}
                      className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm disabled:opacity-30 hover:bg-muted transition-colors"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ===== SITE HISTORY DIALOG ===== */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <History className="h-4 w-4 text-primary" />
              </div>
              سجل التغييرات التاريخي
              {siteHistory.data?.site && (
                <Badge variant="outline" className="me-2 text-xs">
                  {siteHistory.data.site.siteName || siteHistory.data.site.domain}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            {siteHistory.isLoading ? (
              <div className="space-y-4 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-3 h-3 rounded-full bg-muted/50 animate-pulse mt-1" />
                    <div className="flex-1 h-24 bg-muted/30 rounded-xl animate-pulse" />
                  </div>
                ))}
              </div>
            ) : !siteHistory.data?.history.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا يوجد سجل فحوصات لهذا الموقع</p>
              </div>
            ) : (
              <div className="p-2">
                {/* Site Info Header */}
                {siteHistory.data?.site && (
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 mb-4"
                  >
                    <ScreenshotThumbnail url={siteHistory.data.site.screenshotUrl} domain={siteHistory.data.site.domain} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{siteHistory.data.site.siteName || siteHistory.data.site.domain}</p>
                      <p className="text-xs text-muted-foreground">{siteHistory.data.site.domain}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{siteHistory.data.site.classification}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground">{SECTOR_LABELS[siteHistory.data.site.sectorType] || siteHistory.data.site.sectorType}</span>
                      </div>
                    </div>
                    <div className="text-center shrink-0">
                      <span className="text-2xl font-bold text-primary">{siteHistory.data.history.length}</span>
                      <p className="text-[10px] text-muted-foreground">فحص</p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute top-0 bottom-0 right-[22px] w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

                  <div className="space-y-1">
                    {siteHistory.data?.history.map((scan: any, i: number) => (
                      <div
                        key={scan.id}
                        className="relative flex gap-4 pe-2"
                      >
                        {/* Timeline Node */}
                        <div className="relative z-10 shrink-0 mt-3">
                          <div
                            className={`w-[11px] h-[11px] rounded-full border-2 ${
                              scan.complianceStatus === 'compliant' ? 'bg-emerald-500 border-emerald-300' :
                              scan.complianceStatus === 'partially_compliant' ? 'bg-amber-500 border-amber-300' :
                              scan.complianceStatus === 'non_compliant' ? 'bg-red-500 border-red-300' :
                              'bg-zinc-500 border-zinc-300'
                            }`}
                          />
                        </div>

                        {/* Scan Card */}
                        <div className={`flex-1 rounded-xl border p-3 mb-2 transition-all hover:shadow-md ${
                          scan.statusChanged && !scan.isFirst
                            ? 'border-primary/30 bg-primary/5 shadow-sm'
                            : 'border-border/50 bg-card/50 hover:bg-accent/20'
                        }`}>
                          {/* Date & Status Row */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                {new Date(scan.scanDate).toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                              {scan.isFirst && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-500/10 text-blue-500 border-blue-500/30">
                                  الفحص الأول
                                </Badge>
                              )}
                              {scan.statusChanged && !scan.isFirst && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30 animate-pulse btn-glow">
                                  تغيّر الحالة
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${
                              scan.complianceStatus === 'compliant' ? 'badge-compliant' :
                              scan.complianceStatus === 'partially_compliant' ? 'badge-partial' :
                              scan.complianceStatus === 'non_compliant' ? 'badge-non-compliant' :
                              'badge-no-policy'
                            }`}>
                              {COMPLIANCE_LABELS[scan.complianceStatus] || scan.complianceStatus}
                            </Badge>
                          </div>

                          {/* Score & Changes Row */}
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">النتيجة:</span>
                              <span className="text-sm font-bold" style={{
                                color: scan.overallScore >= 60 ? '#22c55e' : scan.overallScore >= 40 ? '#f59e0b' : '#ef4444'
                              }}>
                                {Math.round(scan.overallScore)}%
                              </span>
                            </div>
                            {!scan.isFirst && scan.scoreChange !== 0 && (
                              <div
                                className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                                  scan.scoreChange > 0
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-red-500/10 text-red-500'
                                }`}
                              >
                                {scan.scoreChange > 0 ? (
                                  <ArrowUpRight className="h-3 w-3" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3" />
                                )}
                                {scan.scoreChange > 0 ? '+' : ''}{Math.round(scan.scoreChange)}
                              </div>
                            )}
                            {!scan.isFirst && scan.scoreChange === 0 && (
                              <div className="flex items-center gap-0.5 text-xs text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted/30">
                                <Minus className="h-3 w-3" />
                                ثابت
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">البنود:</span>
                              <span className="text-xs font-semibold">{scan.clausesCompliant}/8</span>
                              {!scan.isFirst && scan.clauseChange !== 0 && (
                                <span className={`text-[10px] font-semibold ${
                                  scan.clauseChange > 0 ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                  ({scan.clauseChange > 0 ? '+' : ''}{scan.clauseChange})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Clause Dots */}
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: 8 }, (_, ci) => {
                              const compliant = scan[`clause${ci + 1}Compliant`];
                              return (
                                <div
                                  key={ci}
                                  className="flex flex-col items-center gap-0.5"
                                  title={`بند ${ci + 1}: ${CLAUSE_NAMES[ci]} - ${compliant ? 'ممتثل' : 'غير ممتثل'}`}
                                >
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold ${
                                    compliant
                                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                      : 'bg-red-500/10 text-red-400/60 border border-red-500/20'
                                  }`}>
                                    {ci + 1}
                                  </div>
                                </div>
                              );
                            })}
                            <span className="text-[9px] text-muted-foreground me-1">بنود المادة 12</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== SUB-COMPONENTS =====

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
      <div className="h-12 rounded-xl bg-muted/20 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ label, icon, active, onClick, color, small }: {
  label: string; icon?: React.ReactNode; active: boolean; onClick: () => void; color: string; small?: boolean;
}) {
  const colorMap: Record<string, { activeBg: string; activeText: string; activeBorder: string }> = {
    blue: { activeBg: "bg-blue-500/15", activeText: "text-blue-400", activeBorder: "border-blue-500/40" },
    purple: { activeBg: "bg-primary/15", activeText: "text-primary", activeBorder: "border-primary/40" },
    green: { activeBg: "bg-emerald-500/15", activeText: "text-emerald-400", activeBorder: "border-emerald-500/40" },
    amber: { activeBg: "bg-amber-500/15", activeText: "text-amber-400", activeBorder: "border-amber-500/40" },
    red: { activeBg: "bg-red-500/15", activeText: "text-red-400", activeBorder: "border-red-500/40" },
    zinc: { activeBg: "bg-zinc-500/15", activeText: "text-zinc-400", activeBorder: "border-zinc-500/40" },
    slate: { activeBg: "bg-slate-500/15", activeText: "text-slate-400", activeBorder: "border-slate-500/40" },
  };
  const c = colorMap[color] || colorMap.slate;

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 rounded-full border transition-all duration-200
        ${small ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"}
        font-medium
        ${active
          ? `${c.activeBg} ${c.activeText} ${c.activeBorder} shadow-sm`
          : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
        }
      `}
    >
      {icon}
      {label}
      {active && <X className="h-3 w-3 opacity-60" />}
    </button>
  );
}

function SectionHeader({ icon, title, subtitle, gradient }: {
  icon: React.ReactNode; title: string; subtitle: string; gradient: string;
}) {
  return (
    <div
      className="flex items-center gap-3 pb-3"
    >
      <div
        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-primary shadow-sm`}
      >
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, percentage, icon, color, onClick }: {
  label: string; value: number; percentage?: number; icon: React.ReactNode; color: string; onClick?: () => void;
}) {
  const colorMap: Record<string, { bg: string; text: string; gradient: string; glow: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500", gradient: "from-blue-500/20 to-blue-400/5", glow: "shadow-blue-500/10" },
    purple: { bg: "bg-primary/10", text: "text-primary", gradient: "from-primary/20 to-primary/5", glow: "shadow-primary/10" },
    green: { bg: "bg-emerald-500/10", text: "text-emerald-500", gradient: "from-emerald-500/20 to-emerald-400/5", glow: "shadow-emerald-500/10" },
    red: { bg: "bg-red-500/10", text: "text-red-500", gradient: "from-red-500/20 to-red-400/5", glow: "shadow-red-500/10" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-500", gradient: "from-amber-500/20 to-amber-400/5", glow: "shadow-amber-500/10" },
    zinc: { bg: "bg-zinc-500/10", text: "text-zinc-500", gradient: "from-zinc-500/20 to-zinc-400/5", glow: "shadow-zinc-500/10" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div>
      <Card
        className={`glass-card gold-sweep overflow-hidden group ${onClick ? "cursor-pointer" : ""}`}
        onClick={onClick}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        <CardContent className="p-4 relative">
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`h-8 w-8 rounded-xl ${c.bg} flex items-center justify-center ${c.text} transition-all`}
            >
              {icon}
            </div>
            <span className="text-sm sm:text-[11px] text-muted-foreground leading-tight font-medium">{label}</span>
          </div>
          <div className="flex items-end gap-1.5">
            <AnimatedNumber value={value} className="text-3xl sm:text-2xl font-bold leading-none" />
            {percentage !== undefined && (
              <span
                className={`text-xs font-semibold ${c.text} mb-0.5`}
              >
                ({percentage}%)
              </span>
            )}
          </div>
          {onClick && (
            <div className="mt-2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <ChevronLeft className="h-3 w-3" />
              اضغط للتفاصيل
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CompliancePieChart({ compliant, nonCompliant, partiallyCompliant, noPolicy, onSliceClick }: {
  compliant: number; nonCompliant: number; partiallyCompliant: number; noPolicy: number;
  onSliceClick: (status: string) => void;
}) {
  const pieData = [
    { name: "ممتثل", value: compliant, color: "#22c55e", key: "compliant" },
    { name: "ممتثل جزئياً", value: partiallyCompliant, color: "#f59e0b", key: "partially_compliant" },
    { name: "غير ممتثل", value: nonCompliant, color: "#ef4444", key: "non_compliant" },
    { name: "لا يعمل", value: noPolicy, color: "#71717a", key: "no_policy" },
  ];

  return (
    <Card className="glass-card gold-sweep overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center btn-glow">
            <Eye className="h-3.5 w-3.5 text-primary" />
          </div>
          توزيع حالات الامتثال
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                onClick={(_, index) => onSliceClick(pieData[index].key)}
                className="cursor-pointer"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  direction: "rtl",
                  fontFamily: "Tajawal",
                  color: "var(--color-popover-foreground)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {pieData.map(item => (
            <button
              key={item.name}
              onClick={() => onSliceClick(item.key)}
              className="flex items-center gap-1.5 text-xs hover:opacity-70 transition-opacity"
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-bold">{item.value}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ComplianceGauge({ compliant, total }: { compliant: number; total: number }) {
  const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;
  const gaugeColor = rate >= 60 ? "#22c55e" : rate >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <Card className="glass-card gold-sweep overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center btn-glow">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          </div>
          معدل الامتثال العام
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <div className="relative w-52 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={180} endAngle={0} data={[{ value: rate, fill: gaugeColor }]}>
              <RadialBar dataKey="value" cornerRadius={10} fill={gaugeColor} background={{ fill: "var(--color-muted)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              key={rate}
              className="text-4xl font-bold"
              style={{ color: gaugeColor }}
            >
              {rate}%
            </span>
            <span className="text-xs text-muted-foreground mt-1">معدل الامتثال الكامل</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-2">
          <span className="font-bold text-foreground">{compliant.toLocaleString("ar-SA-u-nu-latn")}</span> من أصل{" "}
          <span className="font-bold text-foreground">{total.toLocaleString("ar-SA-u-nu-latn")}</span> موقع ممتثل بالكامل
        </p>
      </CardContent>
    </Card>
  );
}

function ClauseInfographicCard({ clause, index, onClickCompliant, onClickNonCompliant }: {
  clause: { clause: number; name: string; compliant: number; nonCompliant: number; total: number; percentage: number };
  index: number;
  onClickCompliant: () => void;
  onClickNonCompliant: () => void;
}) {
  const color = clause.percentage >= 60 ? "emerald" : clause.percentage >= 40 ? "amber" : "red";
  const gradients: Record<string, string> = {
    emerald: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    amber: "from-amber-500/15 via-amber-500/5 to-transparent",
    red: "from-red-500/15 via-red-500/5 to-transparent",
  };
  const ringColors: Record<string, string> = {
    emerald: "#22c55e",
    amber: "#f59e0b",
    red: "#ef4444",
  };
  const circumference = 2 * Math.PI * 32;
  const strokeDashoffset = circumference - (clause.percentage / 100) * circumference;

  return (
    <Card className={`glass-card gold-sweep overflow-hidden group relative`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${gradients[color]} opacity-60`} />
      <CardContent className="p-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-bold">
            بند {clause.clause}
          </Badge>
          <div
            className="opacity-10"
          >
            <Target className="h-4 w-4" />
          </div>
        </div>

        {/* Circular Progress */}
        <div className="flex items-center gap-4 mb-3">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="32" fill="none" stroke="var(--color-muted)" strokeWidth="5" opacity="0.3" />
              <circle
                cx="36" cy="36" r="32" fill="none"
                stroke={ringColors[color]}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: ringColors[color] }}>
                {clause.percentage}%
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{clause.name}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 stagger-children">
          <button
            onClick={onClickCompliant}
            className="bg-emerald-500/10 rounded-lg p-2 text-center hover:bg-emerald-500/20 transition-colors group/btn"
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 group-hover/btn:scale-110 transition-transform" />
              <span className="text-[10px] text-emerald-400 font-medium">ممتثل</span>
            </div>
            <span className="text-sm font-bold text-emerald-400">{clause.compliant}</span>
          </button>
          <button
            onClick={onClickNonCompliant}
            className="bg-red-500/10 rounded-lg p-2 text-center hover:bg-red-500/20 transition-colors group/btn"
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <XCircle className="h-3 w-3 text-red-500 group-hover/btn:scale-110 transition-transform" />
              <span className="text-[10px] text-red-400 font-medium">غير ممتثل</span>
            </div>
            <span className="text-sm font-bold text-red-400">{clause.nonCompliant}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function SectorCard({ sector, onClickCompliance, onClickClause }: {
  sector: any;
  onClickCompliance: (status: string) => void;
  onClickClause: (clauseNum: number, compliant: boolean) => void;
}) {
  const total = sector.compliant + sector.nonCompliant + sector.partiallyCompliant + sector.noPolicy;
  const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;
  const isPublic = sector.sector === "public";

  return (
    <Card className="glass-card gold-sweep overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${isPublic ? "bg-blue-500/15 text-blue-500" : "bg-primary/15 text-primary"}`}
          >
            {isPublic ? <Landmark className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          </div>
          <div>
            <CardTitle className="text-base font-bold">{SECTOR_LABELS[sector.sector] || sector.sector}</CardTitle>
            <Badge variant="outline" className="text-[10px] mt-0.5">{sector.totalSites} موقع</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compliance Stats */}
        <div className="grid grid-cols-2 gap-2 stagger-children">
          {[
            { key: "compliant", label: "ممتثل", value: sector.compliant, color: "emerald" },
            { key: "non_compliant", label: "غير ممتثل", value: sector.nonCompliant, color: "red" },
            { key: "partially_compliant", label: "جزئياً", value: sector.partiallyCompliant, color: "amber" },
            { key: "no_policy", label: "لا يعمل", value: sector.noPolicy, color: "zinc" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => onClickCompliance(item.key)}
              className={`bg-${item.color}-500/10 rounded-lg p-2.5 hover:bg-${item.color}-500/20 transition-all text-end group/s`}
            >
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <div className="flex items-end gap-1">
                <span className={`text-lg font-bold text-${item.color}-500`}>{item.value}</span>
                <span className="text-[10px] text-muted-foreground mb-0.5">({pct(item.value)}%)</span>
              </div>
            </button>
          ))}
        </div>

        {/* Compliance Bar */}
        <div className="flex h-2.5 rounded-full overflow-hidden bg-muted/50">
          {sector.compliant > 0 && <div animate={{ width: `${pct(sector.compliant)}%` }} className="bg-emerald-500" />}
          {sector.partiallyCompliant > 0 && <div animate={{ width: `${pct(sector.partiallyCompliant)}%` }} className="bg-amber-500" />}
          {sector.nonCompliant > 0 && <div animate={{ width: `${pct(sector.nonCompliant)}%` }} className="bg-red-500" />}
          {sector.noPolicy > 0 && <div animate={{ width: `${pct(sector.noPolicy)}%` }} className="bg-zinc-500" />}
        </div>

        {/* Clause Bars */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">بنود المادة 12:</p>
          {sector.clauses.map((c: any, i: number) => {
            const clausePct = total > 0 ? Math.round((c.compliant / total) * 100) : 0;
            return (
              <button
                key={i}
                onClick={() => onClickClause(c.clause, true)}
                className="w-full flex items-center gap-2 hover:bg-muted/30 rounded-lg px-1 py-0.5 transition-colors group/c"
              >
                <span className="text-[10px] text-muted-foreground w-24 shrink-0 truncate text-end">
                  بند {c.clause}: {CLAUSE_SHORT[i]}
                </span>
                <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${clausePct}%`, backgroundColor: clausePct >= 60 ? "#22c55e" : clausePct >= 40 ? "#f59e0b" : "#ef4444", transition: "width 1s ease-out" }}
                  />
                </div>
                <span className="text-[10px] font-medium w-12 text-start">{clausePct}%</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryInfographicCard({ category, index, onClickCompliance, onClickClause }: {
  category: any; index: number;
  onClickCompliance: (status: string) => void;
  onClickClause: (clauseNum: number, compliant: boolean) => void;
}) {
  const total = category.compliant + category.nonCompliant + category.partiallyCompliant + category.noPolicy;
  const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;
  const complianceRate = pct(category.compliant);
  const rateColor = complianceRate >= 60 ? "#22c55e" : complianceRate >= 40 ? "#f59e0b" : "#ef4444";

  // Mini donut
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (complianceRate / 100) * circumference;

  return (
    <Card className="glass-card gold-sweep overflow-hidden group">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-12 h-12 shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="var(--color-muted)" strokeWidth="3" opacity="0.3" />
              <circle
                cx="22" cy="22" r="18" fill="none"
                stroke={rateColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold" style={{ color: rateColor }}>{complianceRate}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold truncate">{category.category}</h3>
            <p className="text-[10px] text-muted-foreground">{category.totalSites} موقع</p>
          </div>
        </div>

        {/* Compliance Mini Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3 stagger-children">
          {[
            { key: "compliant", label: "ممتثل", value: category.compliant, color: "emerald" },
            { key: "non_compliant", label: "غير ممتثل", value: category.nonCompliant, color: "red" },
            { key: "partially_compliant", label: "جزئي", value: category.partiallyCompliant, color: "amber" },
            { key: "no_policy", label: "بدون", value: category.noPolicy, color: "zinc" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => onClickCompliance(item.key)}
              className={`text-center rounded-lg py-1.5 bg-${item.color}-500/10 hover:bg-${item.color}-500/20 transition-colors`}
            >
              <span className={`text-xs font-bold text-${item.color}-500 block`}>{item.value}</span>
              <span className="text-[8px] text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Compliance Bar */}
        <div className="flex h-1.5 rounded-full overflow-hidden bg-muted/50 mb-3">
          {category.compliant > 0 && <div className="bg-emerald-500" style={{ width: `${pct(category.compliant)}%` }} />}
          {category.partiallyCompliant > 0 && <div className="bg-amber-500" style={{ width: `${pct(category.partiallyCompliant)}%` }} />}
          {category.nonCompliant > 0 && <div className="bg-red-500" style={{ width: `${pct(category.nonCompliant)}%` }} />}
          {category.noPolicy > 0 && <div className="bg-zinc-500" style={{ width: `${pct(category.noPolicy)}%` }} />}
        </div>

        {/* Clause Mini Bars */}
        <div className="space-y-1.5">
          {category.clauses.map((c: any, i: number) => {
            const clausePct = total > 0 ? Math.round((c.compliant / total) * 100) : 0;
            return (
              <button
                key={i}
                onClick={() => onClickClause(c.clause, true)}
                className="w-full flex items-center gap-1.5 hover:bg-muted/30 rounded px-0.5 transition-colors"
              >
                <span className="text-[9px] text-muted-foreground w-6 shrink-0">ب{c.clause}</span>
                <div className="flex-1 bg-muted/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${clausePct}%`,
                      backgroundColor: clausePct >= 60 ? "#22c55e" : clausePct >= 40 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
                <span className="text-[9px] font-medium w-8 text-start">{clausePct}%</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SiteDrillDownCard({ site, onNavigate, onShowHistory }: { site: any; onNavigate: () => void; onShowHistory: () => void }) {
  const statusColors: Record<string, string> = {
    compliant: "badge-compliant",
    partially_compliant: "badge-partial",
    non_compliant: "badge-non-compliant",
    no_policy: "badge-no-policy",
  };

  return (
    <div
      onClick={onNavigate}
      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 hover:bg-accent/30 hover:border-primary/20 transition-all cursor-pointer group"
    >
      {/* Screenshot with zoom */}
      <ScreenshotThumbnail url={site.screenshotUrl} domain={site.domain} size="sm" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate">{site.siteName || site.domain}</span>
          {site.complianceStatus && (
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 shrink-0 ${statusColors[site.complianceStatus] || ""}`}>
              {COMPLIANCE_LABELS[site.complianceStatus] || site.complianceStatus}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[11px] text-muted-foreground truncate">{site.domain}</span>
          {site.classification && (
            <span className="text-[10px] text-muted-foreground/70">{site.classification}</span>
          )}
        </div>
        {/* Clause compliance dots */}
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 8 }, (_, i) => {
            const compliant = site[`clause${i + 1}Compliant`];
            return (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${compliant ? "bg-emerald-500" : "bg-red-500/40"}`}
                title={`بند ${i + 1}: ${compliant ? "ممتثل" : "غير ممتثل"}`}
              />
            );
          })}
          <span className="text-[9px] text-muted-foreground me-1">البنود</span>
        </div>
      </div>

      {/* Score */}
      {site.overallScore !== null && site.overallScore !== undefined && (
        <div className="text-center shrink-0">
          <span className="text-lg font-bold" style={{
            color: site.overallScore >= 60 ? "#22c55e" : site.overallScore >= 40 ? "#f59e0b" : "#ef4444"
          }}>
            {Math.round(site.overallScore)}
          </span>
          <p className="text-[9px] text-muted-foreground">النتيجة</p>
        </div>
      )}

      {/* History Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onShowHistory(); }}
        className="h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-all btn-glow"
        title="سجل التغييرات التاريخي"
      >
        <History className="h-4 w-4" />
      </button>

      <ChevronLeft className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
