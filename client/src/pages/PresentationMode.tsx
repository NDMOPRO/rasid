import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";
import SaudiHeatmapSlide from "@/components/SaudiHeatmapSlide";
import CountUp from "react-countup";
import {
  Globe, ShieldCheck, ShieldAlert, ShieldX, WifiOff, ScanSearch,
  Play, Pause, ChevronRight, ChevronLeft, Maximize, Minimize,
  Eye, Shield, Activity, TrendingUp, TrendingDown, Minus,
  BarChart3, Target, Layers, FileCheck, Clock, Zap,
  Building, Landmark, ArrowUpRight, ArrowDownRight,
  Download, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  COMPLIANCE_LABELS,
  ARTICLE_12_CLAUSES,
} from "../../../shared/compliance";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

// ─── Constants ─────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; icon: any; gradient: string; color: string; textColor: string }> = {
  compliant: { label: "ممتثل", icon: ShieldCheck, gradient: "from-emerald-500 to-blue-900", color: "#22c55e", textColor: "text-emerald-400" },
  partially_compliant: { label: "ممتثل جزئياً", icon: ShieldAlert, gradient: "from-amber-400 to-orange-500", color: "#f59e0b", textColor: "text-amber-400" },
  non_compliant: { label: "غير ممتثل", icon: ShieldX, gradient: "from-rose-500 to-red-600", color: "#ef4444", textColor: "text-rose-400" },
  not_working: { label: "لا يعمل", icon: WifiOff, gradient: "from-slate-400 to-zinc-600", color: "#94a3b8", textColor: "text-slate-400" },
};

const SECTOR_LABELS: Record<string, string> = { public: "قطاع عام", private: "قطاع خاص" };
const SECTOR_ICONS: Record<string, any> = { public: Landmark, private: Building };

const SLIDE_DURATION = 12000; // 12 seconds per slide

// ─── Animated Background ───────────────────────────────────
function PresentationBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <WatermarkLogo />
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-[#030712]" />
      {/* Animated gradient orbs */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-primary/15 to-primary/10 blur-[120px]"
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-blue-600/10 to-indigo-900/10 blur-[100px]"
      />
      <div
        className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-emerald-600/8 to-blue-950/5 blur-[80px]"
      />
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
    </div>
  );
}

// ─── Animated Number ───────────────────────────────────────
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return (
    <span className={className}>
      <CountUp end={value} duration={2.5} separator="," useEasing />
    </span>
  );
}

// ─── Trend Badge ───────────────────────────────────────────
function TrendBadge({ change }: { change?: number }) {
  if (change === undefined || change === null) return null;
  const isUp = change > 0;
  const isDown = change < 0;
  return (
    <div className={`flex items-center gap-1 text-sm font-bold ${isUp ? "text-emerald-400" : isDown ? "text-rose-400" : "text-slate-400"}`}>
      {isUp ? <ArrowUpRight className="w-4 h-4" /> : isDown ? <ArrowDownRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
      {Math.abs(change)}
    </div>
  );
}

// ─── Circular Progress ─────────────────────────────────────
function CircularProgress({ value, size = 120, strokeWidth = 8, color, label, count }: {
  value: number; size?: number; strokeWidth?: number; color: string; label: string; count: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round" strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-black text-white">{Math.round(value)}%</span>
        <span className="text-xs text-white/60">{count.toLocaleString()}</span>
      </div>
      <span className="text-sm font-bold text-white/80 mt-1">{label}</span>
    </div>
  );
}

// ─── Slide 1: Hero Overview ────────────────────────────────
function SlideHeroOverview({ data, mc }: { data: any; mc: any }) {
  const totalSites = Number(data?.totalSites) || 0;
  const totalScans = Number(data?.totalScans) || 0;
  const compliant = Number(data?.compliant) || 0;
  const nonCompliant = Number(data?.nonCompliant) || 0;
  const partial = Number(data?.partiallyCompliant) || 0;
  const noPolicy = Number(data?.noPolicy) || 0;

  const kpis = [
    { label: "إجمالي المواقع", value: totalSites, icon: Globe, gradient: "from-blue-500 to-indigo-600", trend: mc?.sitesChange },
    { label: "عدد الفحوصات", value: totalScans, icon: ScanSearch, gradient: "from-indigo-500 to-[oklch(0.42_0.14_290)]", trend: mc?.changes?.totalScans },
    { label: "ممتثل", value: compliant, icon: ShieldCheck, gradient: "from-emerald-500 to-blue-900", trend: mc?.changes?.compliant },
    { label: "غير ممتثل", value: nonCompliant, icon: ShieldX, gradient: "from-rose-500 to-red-600", trend: mc?.changes?.nonCompliant },
    { label: "ممتثل جزئياً", value: partial, icon: ShieldAlert, gradient: "from-amber-400 to-orange-500", trend: mc?.changes?.partiallyCompliant },
    { label: "لا يعمل", value: noPolicy, icon: WifiOff, gradient: "from-slate-400 to-zinc-600", trend: mc?.changes?.noPolicy },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8 py-6"
      dir="rtl"
    >
      {/* Title */}
      <div
        className="text-center mb-10"
      >
        <div className="flex items-center justify-center gap-4 mb-3">
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(0.48_0.14_290)] to-primary flex items-center justify-center shadow-2xl shadow-primary/30"
          >
            <Eye className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-l from-white via-blue-200 to-blue-300 bg-clip-text text-transparent">
              منصة راصد الذكي
            </h1>
            <p className="text-lg text-white/50 font-medium">لوحة المؤشرات القيادية — المادة ١٢ من نظام حماية البيانات الشخصية</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 w-full max-w-7xl stagger-children">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="relative overflow-hidden rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-5"
            >
              <div
                className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${kpi.gradient} rounded-full blur-2xl opacity-20`}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendBadge change={kpi.trend} />
                </div>
                <div className="text-3xl font-black text-white mb-1">
                  <AnimatedNumber value={kpi.value} />
                </div>
                <p className="text-sm font-bold text-white/60">{kpi.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly comparison */}
      {mc && (
        <div
          className="mt-8 px-6 py-4 rounded-2xl bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl border border-[#C5A55A]/10 dark:border-white/10 max-w-4xl w-full"
        >
          <div className="flex items-center justify-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>مقارنة شهرية</span>
            </div>
            <div className="h-4 w-px bg-[#C5A55A]/[0.08] dark:bg-white/20" />
            <span>مواقع جديدة: <strong className="text-emerald-400">{mc.newSitesThisMonth || 0}</strong></span>
            <div className="h-4 w-px bg-[#C5A55A]/[0.08] dark:bg-white/20" />
            <span>فحوصات جديدة: <strong className="text-blue-400">{mc.newScansThisMonth || 0}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Slide 2: Compliance Distribution ──────────────────────
function SlideComplianceDistribution({ data }: { data: any }) {
  const totalScans = Number(data?.totalScans) || 1;
  const statuses = [
    { key: "compliant", value: Number(data?.compliant) || 0 },
    { key: "partially_compliant", value: Number(data?.partiallyCompliant) || 0 },
    { key: "non_compliant", value: Number(data?.nonCompliant) || 0 },
    { key: "not_working", value: Number(data?.noPolicy) || 0 },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8 py-6"
      dir="rtl"
    >
      <h2
        className="text-3xl font-black text-white mb-2"
      >
        <Shield className="inline w-8 h-8 ms-2 text-primary" />
        توزيع حالات الامتثال
      </h2>
      <p className="text-white/50 mb-10">نظرة شاملة على حالة امتثال المواقع السعودية</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl w-full stagger-children">
        {statuses.map((s, i) => {
          const config = STATUS_CONFIG[s.key];
          const pct = (s.value / totalScans) * 100;
          const Icon = config.icon;
          return (
            <div
              key={s.key}
              className="flex flex-col items-center"
            >
              <div className="relative mb-4">
                <CircularProgress value={pct} size={140} strokeWidth={10} color={config.color} label={config.label} count={s.value} />
              </div>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-xl mb-3`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xl font-black text-white">{s.value.toLocaleString()}</span>
              <span className="text-sm font-bold text-white/60">{config.label}</span>
              <span className={`text-lg font-black ${config.textColor}`}>{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Slide 3: Article 12 Clauses ───────────────────────────
function SlideArticle12({ clauseStats }: { clauseStats: any[] }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8 py-6"
      dir="rtl"
    >
      <h2
        className="text-3xl font-black text-white mb-2"
      >
        <FileCheck className="inline w-8 h-8 ms-2 text-primary" />
        بنود المادة ١٢
      </h2>
      <p className="text-white/50 mb-8">تحليل مستوى الامتثال لكل بند من بنود المادة الثانية عشرة</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl w-full stagger-children">
        {(clauseStats || []).map((clause: any, i: number) => {
          const pct = Number(clause.percentage) || 0;
          const total = Number(clause.total) || 0;
          const compliant = Number(clause.compliant) || 0;
          const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
          const bgColor = pct >= 70 ? "from-emerald-500/20 to-emerald-600/5" : pct >= 40 ? "from-amber-500/20 to-amber-600/5" : "from-rose-500/20 to-rose-600/5";
          const name = ARTICLE_12_CLAUSES[i]?.name || clause.name || `بند ${i + 1}`;

          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-gradient-to-br ${bgColor} backdrop-blur-xl p-5`}
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="border-[#C5A55A]/20 dark:border-white/20 text-white/70 text-xs">
                  بند {i + 1}
                </Badge>
                <span className="text-2xl font-black" style={{ color }}>{pct}%</span>
              </div>
              <p className="text-sm font-bold text-white/80 mb-3 line-clamp-2 min-h-[2.5rem]">{name}</p>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#C5A55A]/[0.05] dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/50">
                <span>ممتثل: {compliant.toLocaleString()}</span>
                <span>الإجمالي: {total.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Slide 4: Sector Comparison ────────────────────────────
function SlideSectorComparison({ sectorData }: { sectorData: any[] }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8 py-6"
      dir="rtl"
    >
      <h2
        className="text-3xl font-black text-white mb-2"
      >
        <Building className="inline w-8 h-8 ms-2 text-primary" />
        مقارنة القطاعات
      </h2>
      <p className="text-white/50 mb-8">تحليل مقارن بين القطاع العام والقطاع الخاص</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full stagger-children">
        {(sectorData || []).map((sector: any, i: number) => {
          const SectorIcon = SECTOR_ICONS[sector.sectorType] || Building;
          const total = Number(sector.total) || 1;
          const compliant = Number(sector.compliant) || 0;
          const partial = Number(sector.partiallyCompliant) || 0;
          const nonCompliant = Number(sector.nonCompliant) || 0;
          const noPolicy = Number(sector.noPolicy) || 0;
          const complianceRate = Math.round((compliant / total) * 100);

          return (
            <div
              key={sector.sectorType}
              className="rounded-3xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-8 relative overflow-hidden"
            >
              <div
                className={`absolute -top-10 ${i === 0 ? "-right-10" : "-left-10"} w-40 h-40 bg-gradient-to-br ${i === 0 ? "from-blue-500/15" : "from-[oklch(0.48_0.14_290)]/15"} rounded-full blur-3xl`}
              />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${i === 0 ? "from-blue-500 to-indigo-600" : "from-[oklch(0.48_0.14_290)] to-primary"} flex items-center justify-center shadow-xl`}>
                    <SectorIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{SECTOR_LABELS[sector.sectorType] || sector.sectorType}</h3>
                    <p className="text-white/50">{total.toLocaleString()} موقع</p>
                  </div>
                  <div className="me-auto">
                    <span className={`text-4xl font-black ${complianceRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                      {complianceRate}%
                    </span>
                    <p className="text-xs text-white/50 text-center">نسبة الامتثال</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "ممتثل", value: compliant, color: "#22c55e", gradient: "from-emerald-500 to-blue-900" },
                    { label: "ممتثل جزئياً", value: partial, color: "#f59e0b", gradient: "from-amber-400 to-orange-500" },
                    { label: "غير ممتثل", value: nonCompliant, color: "#ef4444", gradient: "from-rose-500 to-red-600" },
                    { label: "لا يعمل", value: noPolicy, color: "#94a3b8", gradient: "from-slate-400 to-zinc-600" },
                  ].map((item, j) => {
                    const pct = Math.round((item.value / total) * 100);
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm text-white/60 w-24 text-start">{item.label}</span>
                        <div className="flex-1 h-3 rounded-full bg-[#C5A55A]/[0.05] dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-l ${item.gradient}`}
                            animate={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-white w-16 text-end">{item.value.toLocaleString()}</span>
                        <span className="text-xs text-white/40 w-10">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Slide 5: Summary & Recommendations ────────────────────
function SlideSummary({ data, mc }: { data: any; mc: any }) {
  const totalScans = Number(data?.totalScans) || 1;
  const compliant = Number(data?.compliant) || 0;
  const complianceRate = Math.round((compliant / totalScans) * 100);
  const isImproving = mc?.changes?.compliant > 0;

  const recommendations = [
    { text: "متابعة المواقع غير الممتثلة وإرسال إشعارات تحسين", priority: "عاجل", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
    { text: "جدولة فحوصات دورية أسبوعية لضمان استمرار الامتثال", priority: "مهم", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { text: "إصدار تقارير شهرية مفصلة للجهات الرقابية", priority: "مستمر", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { text: "تعزيز التواصل مع المواقع الممتثلة جزئياً لرفع مستوى الامتثال", priority: "تطوير", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  ];

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-8 py-6"
      dir="rtl"
    >
      <h2
        className="text-3xl font-black text-white mb-2"
      >
        <Target className="inline w-8 h-8 ms-2 text-primary" />
        الملخص والتوصيات
      </h2>
      <p className="text-white/50 mb-8">نتائج الرصد والتوصيات التنفيذية</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full stagger-children">
        {/* Summary Card */}
        <div
          className="rounded-3xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-8"
        >
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            ملخص الأداء
          </h3>
          <div className="text-center mb-6">
            <div
              className={`text-7xl font-black ${complianceRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}
            >
              {complianceRate}%
            </div>
            <p className="text-white/60 mt-2">نسبة الامتثال الكلية</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#C5A55A]/[0.03] dark:bg-white/5 border border-[#C5A55A]/10 dark:border-white/10">
              <span className="text-white/70">الاتجاه العام</span>
              <span className={`font-bold ${isImproving ? "text-emerald-400" : "text-rose-400"}`}>
                {isImproving ? "↑ تحسن" : "↓ تراجع"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#C5A55A]/[0.03] dark:bg-white/5 border border-[#C5A55A]/10 dark:border-white/10">
              <span className="text-white/70">مواقع جديدة هذا الشهر</span>
              <span className="font-bold text-blue-400">{mc?.newSitesThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#C5A55A]/[0.03] dark:bg-white/5 border border-[#C5A55A]/10 dark:border-white/10">
              <span className="text-white/70">فحوصات جديدة هذا الشهر</span>
              <span className="font-bold text-primary">{mc?.newScansThisMonth || 0}</span>
            </div>
          </div>
        </div>

        {/* Recommendations Card */}
        <div
          className="rounded-3xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-8"
        >
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            التوصيات التنفيذية
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${rec.bg}`}
              >
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className={`${rec.color} border-current shrink-0 mt-0.5`}>
                    {rec.priority}
                  </Badge>
                  <p className="text-sm text-white/80 leading-relaxed">{rec.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Presentation Mode Component ──────────────────────
export default function PresentationMode() {
  const { playClick, playHover } = useSoundEffects();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesContainerRef = useRef<HTMLDivElement>(null);

  const stats = trpc.dashboard.stats.useQuery();
  const clauseStats = trpc.dashboard.clauseStats.useQuery();
  const sectorTypeStats = trpc.dashboard.statsBySectorType.useQuery();
  const monthlyComparison = trpc.dashboard.monthlyComparison.useQuery();

  const regionHeatmap = trpc.executiveDashboard.regionHeatmap.useQuery();

  const d = stats.data;
  const mc = monthlyComparison.data;
  const clauses = clauseStats.data || [];
  const sectors = sectorTypeStats.data || [];
  const regions = regionHeatmap.data || [];

  const TOTAL_SLIDES = 6;

  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const goNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % TOTAL_SLIDES);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + TOTAL_SLIDES) % TOTAL_SLIDES);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.key === "ArrowLeft" ? goNext() : goPrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // ─── PDF Export ───────────────────────────────────────────
  const handleExportPDF = useCallback(async () => {
    if (isExporting || !slidesContainerRef.current) return;
    setIsExporting(true);
    const wasPlaying = isPlaying;
    setIsPlaying(false);

    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [297, 167], // 16:9 landscape
      });

      const savedSlide = currentSlide;

      for (let i = 0; i < TOTAL_SLIDES; i++) {
        setCurrentSlide(i);
        // Wait for animations to settle
        await new Promise((r) => setTimeout(r, 1500));

        const slideEl = slidesContainerRef.current;
        if (!slideEl) continue;

        const canvas = await html2canvas(slideEl, {
          backgroundColor: "#030712",
          scale: 2,
          useCORS: true,
          logging: false,
          width: slideEl.offsetWidth,
          height: slideEl.offsetHeight,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, 297, 167);
      }

      // Add metadata
      pdf.setProperties({
        title: "منصة راصد - العرض التقديمي",
        subject: "تقرير الامتثال - المادة ١٢",
        creator: "منصة راصد",
      });

      const dateStr = new Date().toLocaleDateString("ar-SA").replace(/\//g, "-");
      pdf.save(`راصد-العرض-التقديمي-${dateStr}.pdf`);

      // Restore state
      setCurrentSlide(savedSlide);
      if (wasPlaying) setIsPlaying(true);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, isPlaying, currentSlide]);

  const slideNames = ["نظرة عامة", "توزيع الامتثال", "بنود المادة ١٢", "مقارنة القطاعات", "الخريطة الحرارية", "الملخص والتوصيات"];

  if (stats.isLoading) {
    return (
      <div className="fixed inset-0 bg-[#030712] flex items-center justify-center" dir="rtl">
        <PresentationBackground />
        <div
          className="relative z-10 flex flex-col items-center gap-6"
        >
          <div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[oklch(0.48_0.14_290)] to-primary flex items-center justify-center shadow-2xl"
          >
            <Eye className="w-10 h-10 text-white" />
          </div>
          <p className="text-white/60 text-lg font-bold">جاري تحميل العرض التقديمي...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-[#030712] overflow-hidden select-none" dir="rtl">
      <PresentationBackground />

      {/* Slides */}
      <div ref={slidesContainerRef} className="relative z-10 h-full">
        
          {currentSlide === 0 && <SlideHeroOverview key="s0" data={d} mc={mc} />}
          {currentSlide === 1 && <SlideComplianceDistribution key="s1" data={d} />}
          {currentSlide === 2 && <SlideArticle12 key="s2" clauseStats={clauses as any[]} />}
          {currentSlide === 3 && <SlideSectorComparison key="s3" sectorData={sectors as any[]} />}
          {currentSlide === 4 && <SaudiHeatmapSlide key="s4" regionData={regions as any[]} />}
          {currentSlide === 5 && <SlideSummary key="s5" data={d} mc={mc} />}
        
      </div>

      {/* Bottom Controls Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Progress bar */}
        <div className="h-1 bg-[#C5A55A]/[0.05] dark:bg-white/10">
          <div
            className="h-full bg-gradient-to-l from-[oklch(0.48_0.14_290)] to-primary"
            key={currentSlide}
            animate={{ width: isPlaying ? "100%" : `${((Date.now() % SLIDE_DURATION) / SLIDE_DURATION) * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-6 py-3 bg-black/60 backdrop-blur-xl border-t border-[#C5A55A]/10 dark:border-white/10">
          {/* Left: Slide indicators */}
          <div className="flex items-center gap-2">
            {slideNames.map((name, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  i === currentSlide
                    ? "bg-primary/30 text-primary border border-primary/50"
                    : "text-white/40 hover:text-white/70 hover:bg-[#C5A55A]/[0.03] dark:bg-white/5"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Center: Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goPrev}
              className="text-white/60 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10 rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white/60 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10 rounded-xl"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goNext}
              className="text-white/60 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10 rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Right: Fullscreen + PDF + info */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">
              {currentSlide + 1} / {TOTAL_SLIDES}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="text-white/60 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10 rounded-xl"
              title="تصدير PDF"
            >
              {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white/60 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10 rounded-xl"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleDateString("ar-SA")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
