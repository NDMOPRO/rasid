import { useState, useMemo } from "react";
import DrillDownModal, { useDrillDown } from "@/components/DrillDownModal";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatNumber, formatPercent } from "@/lib/formatters";
import {
  Map, Globe, TrendingUp, TrendingDown,
  CheckCircle2, XCircle, AlertTriangle, Loader2, Download,
  BarChart3, Layers, ThermometerSun, MapPin, Minus, Calendar
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

type TimePeriod = "all" | "this_month" | "last_month" | "last_3_months" | "last_6_months" | "this_year";

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "all", label: "جميع الفترات" },
  { value: "this_month", label: "هذا الشهر" },
  { value: "last_month", label: "الشهر الماضي" },
  { value: "last_3_months", label: "آخر 3 أشهر" },
  { value: "last_6_months", label: "آخر 6 أشهر" },
  { value: "this_year", label: "هذا العام" },
];

// Saudi Arabia 13 Administrative Regions with approximate SVG positions
const SA_REGIONS = [
  { id: "riyadh", name: "الرياض", nameEn: "Riyadh", cx: 320, cy: 340, r: 55 },
  { id: "makkah", name: "مكة المكرمة", nameEn: "Makkah", cx: 145, cy: 370, r: 40 },
  { id: "madinah", name: "المدينة المنورة", nameEn: "Madinah", cx: 160, cy: 260, r: 40 },
  { id: "eastern", name: "المنطقة الشرقية", nameEn: "Eastern", cx: 450, cy: 280, r: 55 },
  { id: "qassim", name: "القصيم", nameEn: "Qassim", cx: 280, cy: 240, r: 30 },
  { id: "hail", name: "حائل", nameEn: "Ha'il", cx: 250, cy: 190, r: 35 },
  { id: "tabuk", name: "تبوك", nameEn: "Tabuk", cx: 140, cy: 150, r: 45 },
  { id: "northern", name: "الحدود الشمالية", nameEn: "Northern Borders", cx: 330, cy: 120, r: 40 },
  { id: "jawf", name: "الجوف", nameEn: "Al Jawf", cx: 230, cy: 120, r: 35 },
  { id: "jizan", name: "جازان", nameEn: "Jazan", cx: 130, cy: 480, r: 25 },
  { id: "asir", name: "عسير", nameEn: "Asir", cx: 170, cy: 440, r: 35 },
  { id: "najran", name: "نجران", nameEn: "Najran", cx: 240, cy: 470, r: 30 },
  { id: "bahah", name: "الباحة", nameEn: "Al Bahah", cx: 150, cy: 410, r: 20 },
];

function getHeatColor(percentage: number): string {
  if (percentage >= 80) return "#059669";
  if (percentage >= 60) return "#10b981";
  if (percentage >= 40) return "#f59e0b";
  if (percentage >= 20) return "#f97316";
  return "#ef4444";
}

function getHeatBgColor(percentage: number): string {
  if (percentage >= 80) return "rgba(5, 150, 105, 0.15)";
  if (percentage >= 60) return "rgba(16, 185, 129, 0.15)";
  if (percentage >= 40) return "rgba(245, 158, 11, 0.15)";
  if (percentage >= 20) return "rgba(249, 115, 22, 0.15)";
  return "rgba(239, 68, 68, 0.15)";
}

interface RegionData {
  id: string;
  name: string;
  nameEn: string;
  totalSites: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  noPolicy: number;
  complianceRate: number;
  classifications: string[];
}

function AnimatedRegionBubble({ region, data, index, onClick, isSelected }: {
  region: typeof SA_REGIONS[0];
  data: RegionData;
  index: number;
  onClick: () => void;
  isSelected: boolean;
}) {
  const color = getHeatColor(data.complianceRate);
  const scale = Math.max(0.6, Math.min(1.4, data.totalSites / 200));
  const r = region.r * scale;

  return (
    <g
      onClick={onClick}
      className="cursor-pointer transition-all duration-300"
      style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
    >
      {/* Outer glow */}
      <circle
        cx={region.cx}
        cy={region.cy}
        r={r + 8}
        fill={color}
        opacity={isSelected ? 0.3 : 0.1}
        className="transition-all duration-300"
      >
        <animate attributeName="r" values={`${r + 6};${r + 12};${r + 6}`} dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values={isSelected ? "0.3;0.5;0.3" : "0.1;0.2;0.1"} dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Main bubble */}
      <circle
        cx={region.cx}
        cy={region.cy}
        r={r}
        fill={color}
        opacity={0.85}
        stroke={isSelected ? "#fff" : color}
        strokeWidth={isSelected ? 3 : 1}
        className="transition-all duration-300 hover:opacity-100"
      />

      {/* Inner highlight */}
      <circle
        cx={region.cx - r * 0.2}
        cy={region.cy - r * 0.2}
        r={r * 0.4}
        fill="white"
        opacity={0.15}
      />

      {/* Percentage text */}
      <text
        x={region.cx}
        y={region.cy - 4}
        textAnchor="middle"
        fill="white"
        fontSize={r > 30 ? "14" : "11"}
        fontWeight="bold"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
      >
        {Math.round(data.complianceRate)}%
      </text>

      {/* Region name */}
      <text
        x={region.cx}
        y={region.cy + (r > 30 ? 14 : 10)}
        textAnchor="middle"
        fill="white"
        fontSize={r > 30 ? "10" : "8"}
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
      >
        {region.name}
      </text>

      {/* Sites count badge */}
      <g transform={`translate(${region.cx + r * 0.6}, ${region.cy - r * 0.6})`}>
        <circle r="12" fill="#1e293b" stroke={color} strokeWidth="1.5" />
        <text textAnchor="middle" y="4" fill="white" fontSize="8" fontWeight="bold">
          {data.totalSites > 999 ? `${Math.round(data.totalSites / 100) / 10}k` : data.totalSites}
        </text>
      </g>
    </g>
  );
}

function RegionDetailCard({ data, onClose }: { data: RegionData; onClose: () => void }) {
  const color = getHeatColor(data.complianceRate);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: getHeatBgColor(data.complianceRate) }}>
              <MapPin className="w-5 h-5 transition-transform duration-300 hover:scale-110" style={{ color }} />
            </div>
            <div>
              <span>{data.name}</span>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                إجمالي المواقع: {formatNumber(data.totalSites)}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Compliance rate circle */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="8"
                  strokeDasharray={`${data.complianceRate * 3.14} ${314 - data.complianceRate * 3.14}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold gradient-text" style={{ color }}>{Math.round(data.complianceRate)}%</span>
                <span className="text-xs text-muted-foreground">نسبة الامتثال</span>
              </div>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {[
              { label: "ممتثل", value: data.compliant, icon: CheckCircle2, color: "#059669", bg: "rgba(5,150,105,0.1)" },
              { label: "ممتثل جزئياً", value: data.partial, icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
              { label: "غير ممتثل", value: data.nonCompliant, icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
              { label: "لا يعمل", value: data.noPolicy, icon: Minus, color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3 border" style={{ background: item.bg }}>
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 transition-transform duration-300 hover:scale-110" style={{ color: item.color }} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <p className="text-xl font-bold mt-1" style={{ color: item.color }}>{formatNumber(item.value)}</p>
              </div>
            ))}
          </div>

          {/* Classifications in this region */}
          {data.classifications.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">التصنيفات في هذه المنطقة:</p>
              <div className="flex flex-wrap gap-2">
                {data.classifications.map((cls) => (
                  <Badge key={cls} variant="outline" className="text-xs">{cls}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HeatmapLegend() {
  const levels = [
    { label: "ممتاز (٨٠٪+)", color: "#059669" },
    { label: "جيد (٦٠-٨٠٪)", color: "#10b981" },
    { label: "متوسط (٤٠-٦٠٪)", color: "#f59e0b" },
    { label: "ضعيف (٢٠-٤٠٪)", color: "#f97316" },
    { label: "حرج (أقل من ٢٠٪)", color: "#ef4444" },
  ];

  return (
    <div
      className="overflow-x-hidden max-w-full flex flex-wrap gap-3 justify-center">
      <WatermarkLogo />
      {levels.map((level) => (
        <div key={level.label} className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ background: level.color }} />
          <span className="text-xs text-white/70">{level.label}</span>
        </div>
      ))}
    </div>
  );
}

function exportHeatmapToCSV(regionData: RegionData[]) {
  const BOM = "\uFEFF";
  const header = "المنطقة,إجمالي المواقع,ممتثل,ممتثل جزئياً,غير ممتثل,لا يعمل,نسبة الامتثال,التصنيفات\n";
  const rows = regionData
    .sort((a, b) => b.complianceRate - a.complianceRate)
    .map((rd) =>
      `"${rd.name}",${rd.totalSites},${rd.compliant},${rd.partial},${rd.nonCompliant},${rd.noPolicy},${Math.round(rd.complianceRate)}%,"${rd.classifications.join("، ")}"`
    )
    .join("\n");
  const csv = BOM + header + rows;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rasid-compliance-heatmap-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("تم تصدير بيانات خريطة الامتثال بنجاح");
}

export default function ComplianceHeatmap() {
  const { playClick, playHover } = useSoundEffects();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");

  const { data: regionDataRaw, isLoading } = trpc.executiveDashboard.regionHeatmap.useQuery({ period: timePeriod });

  const regionData: RegionData[] = useMemo(() => {
    if (!regionDataRaw) return [];
    return regionDataRaw.map((r) => ({
      id: r.id,
      name: r.name,
      nameEn: r.nameEn,
      totalSites: r.totalSites,
      compliant: r.compliant,
      partial: r.partial,
      nonCompliant: r.nonCompliant,
      noPolicy: r.noPolicy,
      complianceRate: r.complianceRate,
      classifications: r.classifications,
    }));
  }, [regionDataRaw]);

  const selectedRegionData = regionData.find((r) => r.id === selectedRegion);

  // Summary stats
  const totalRegionSites = regionData.reduce((s, r) => s + r.totalSites, 0);
  const totalCompliant = regionData.reduce((s, r) => s + r.compliant, 0);
  const avgCompliance = totalRegionSites > 0 ? (totalCompliant / totalRegionSites) * 100 : 0;
  const bestRegion = [...regionData].sort((a, b) => b.complianceRate - a.complianceRate)[0];
  const worstRegion = [...regionData].filter((r) => r.totalSites > 0).sort((a, b) => a.complianceRate - b.complianceRate)[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">جاري تحميل خريطة الامتثال...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-800 to-emerald-600 flex items-center justify-center shadow-lg"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <Map className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">خريطة الامتثال الحرارية</h1>
            <p className="text-muted-foreground">التوزيع الجغرافي لامتثال المواقع حسب مناطق المملكة</p>
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {/* Time Period Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportHeatmapToCSV(regionData)}
            className="gap-2"
          >
            <Download className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
            تصدير Excel
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="gap-2"
          >
            <Map className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
            خريطة
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="gap-2"
          >
            <Layers className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
            شبكة
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
        {[
          {
            label: "إجمالي المواقع المرصودة",
            value: formatNumber(totalRegionSites),
            icon: Globe,
            gradient: "from-blue-500 to-indigo-600",
          },
          {
            label: "متوسط نسبة الامتثال",
            value: formatPercent(avgCompliance),
            icon: ThermometerSun,
            gradient: "from-emerald-500 to-blue-900",
          },
          {
            label: "أفضل منطقة",
            value: bestRegion?.name || "-",
            sub: bestRegion ? `${Math.round(bestRegion.complianceRate)}%` : "",
            icon: TrendingUp,
            gradient: "from-green-500 to-emerald-600",
          },
          {
            label: "أضعف منطقة",
            value: worstRegion?.name || "-",
            sub: worstRegion ? `${Math.round(worstRegion.complianceRate)}%` : "",
            icon: TrendingDown,
            gradient: "from-red-500 to-rose-600",
          },
        ].map((card, i) => (
          <Card
            key={card.label}
            className="overflow-hidden border-0 shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all"
            style={{ animation: `fadeIn 0.5s ease-out ${i * 0.1}s both` }}
            onClick={() => openDrillDown({ title: card.label, subtitle: card.value })}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-end">
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-xl font-bold mt-0.5">{card.value}</p>
                  {"sub" in card && card.sub && (
                    <p className="text-xs text-muted-foreground">{card.sub}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      {viewMode === "map" ? (
        <Card className="overflow-hidden border-0 shadow-xl cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap">
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                خريطة المملكة العربية السعودية
              </CardTitle>
              <CardDescription>انقر على أي منطقة لعرض التفاصيل</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* SVG Map */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <svg width="100%" height="100%">
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <svg viewBox="0 0 600 560" className="w-full max-w-[95vw] sm:max-w-3xl mx-auto relative z-10">
                <defs>
                  <style>{`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: scale(0.8); }
                      to { opacity: 1; transform: scale(1); }
                    }
                  `}</style>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Saudi Arabia outline (simplified) */}
                <path
                  d="M80,100 L200,60 L350,80 L500,100 L530,200 L520,350 L480,400 L400,450 L300,500 L200,510 L130,490 L100,440 L90,350 L80,250 Z"
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                />

                {/* Connection lines between regions */}
                {regionData.length > 1 && regionData.map((rd) => {
                  const region = SA_REGIONS.find((r) => r.id === rd.id);
                  const riyadh = SA_REGIONS.find((r) => r.id === "riyadh");
                  if (!region || !riyadh || region.id === "riyadh") return null;
                  return (
                    <line
                      key={`line-${rd.id}`}
                      x1={riyadh.cx} y1={riyadh.cy}
                      x2={region.cx} y2={region.cy}
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="1"
                      strokeDasharray="3,6"
                    />
                  );
                })}

                {/* Region bubbles */}
                {SA_REGIONS.map((region, i) => {
                  const data = regionData.find((r) => r.id === region.id);
                  if (!data) return null;
                  return (
                    <AnimatedRegionBubble
                      key={region.id}
                      region={region}
                      data={data}
                      index={i}
                      onClick={() => { setSelectedRegion(region.id); openDrillDown({ title: region.name, subtitle: `منطقة ${region.name} - تفاصيل الامتثال`, region: region.id }); }}
                      isSelected={selectedRegion === region.id}
                    />
                  );
                })}

                {/* Title */}
                <text x="300" y="540" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="12">
                  المملكة العربية السعودية - خريطة الامتثال الحرارية
                </text>
              </svg>

              {/* Legend */}
              <div className="mt-4">
                <HeatmapLegend />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {[...regionData]
            .sort((a, b) => b.complianceRate - a.complianceRate)
            .map((rd, i) => {
              const color = getHeatColor(rd.complianceRate);
              return (
                <Card
                  key={rd.id}
                  className="overflow-hidden border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  onClick={() => { setSelectedRegion(rd.id); openDrillDown({ title: rd.name, subtitle: `منطقة ${rd.name} - تفاصيل الامتثال`, region: rd.id }); }}
                  style={{ animation: `fadeIn 0.5s ease-out ${i * 0.05}s both` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ background: getHeatBgColor(rd.complianceRate) }}
                        >
                          <MapPin className="w-6 h-6" style={{ color }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{rd.name}</h3>
                          <p className="text-xs text-muted-foreground">{formatNumber(rd.totalSites)} موقع</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="text-2xl font-bold" style={{ color }}>
                          {Math.round(rd.complianceRate)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${rd.complianceRate}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                        }}
                      />
                    </div>

                    {/* Mini stats */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        ممتثل {formatNumber(rd.compliant)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        جزئي {formatNumber(rd.partial)}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        غير ممتثل {formatNumber(rd.nonCompliant)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {/* Region Detail Dialog */}
      {selectedRegionData && (
        <RegionDetailCard
          data={selectedRegionData}
          onClose={() => setSelectedRegion(null)}
        />
      )}

      {/* Ranking Table */}
      <Card className="overflow-hidden border-0 shadow-lg cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            ترتيب المناطق حسب نسبة الامتثال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...regionData]
              .sort((a, b) => b.complianceRate - a.complianceRate)
              .map((rd, i) => {
                const color = getHeatColor(rd.complianceRate);
                return (
                  <div
                    key={rd.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => { setSelectedRegion(rd.id); openDrillDown({ title: rd.name, subtitle: `منطقة ${rd.name} - تفاصيل الامتثال`, region: rd.id }); }}
                    style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s both` }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{
                        background: i < 3 ? `linear-gradient(135deg, ${color}, ${color}dd)` : "hsl(var(--muted))",
                        color: i < 3 ? "white" : "inherit",
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap mb-1">
                        <span className="font-medium">{rd.name}</span>
                        <span className="text-sm font-bold" style={{ color }}>
                          {Math.round(rd.complianceRate)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${rd.complianceRate}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-end w-20">
                      {formatNumber(rd.totalSites)} موقع
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
