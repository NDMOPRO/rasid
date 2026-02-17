import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe, Shield, ShieldCheck, ShieldAlert, ShieldX,
  ScanSearch, TrendingUp, TrendingDown, Building2, Building, Landmark,
  ChevronDown, Eye, Activity, WifiOff,
  FileCheck, Layers, Gauge,
  Download, ArrowUpRight, ArrowDownRight, Minus, Sparkles, Zap, Target,
  FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, BarChart3,
  Users, Percent, Hash, Award, Star, Trophy, Crown, Flame,
  Clock, Radio, Wifi, Signal,
} from "lucide-react";
import CountUp from "react-countup";
import { toast } from "sonner";
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { downloadBase64File } from "@/lib/excelExport";
import { formatNumber, formatPercent } from "@/lib/formatters";
import {
  COMPLIANCE_LABELS,
  COMPLIANCE_COLORS,
  ARTICLE_12_CLAUSES,
} from "../../../shared/compliance";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
} from "recharts";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

// ─── Constants ───────────────────────────────────────────────
const SECTOR_TYPE_LABELS: Record<string, string> = {
  public: "قطاع عام",
  private: "قطاع خاص",
};

const SECTOR_TYPE_ICONS: Record<string, any> = {
  public: Landmark,
  private: Building,
};

const STATUS_ICONS: Record<string, any> = {
  compliant: ShieldCheck,
  partially_compliant: ShieldAlert,
  non_compliant: ShieldX,
  not_working: WifiOff,
};

const STATUS_GRADIENTS: Record<string, string> = {
  compliant: "from-emerald-500 to-blue-900",
  partially_compliant: "from-amber-400 to-orange-500",
  non_compliant: "from-rose-500 to-red-600",
  not_working: "from-slate-400 to-zinc-600",
};

const STATUS_BG: Record<string, string> = {
  compliant: "bg-emerald-500/8 border-emerald-500/20",
  partially_compliant: "bg-amber-500/8 border-amber-500/20",
  non_compliant: "bg-rose-500/8 border-rose-500/20",
  not_working: "bg-slate-500/8 border-slate-500/20",
};

const STATUS_TEXT: Record<string, string> = {
  compliant: "text-emerald-400",
  partially_compliant: "text-amber-400",
  non_compliant: "text-rose-400",
  not_working: "text-slate-400",
};

const STATUS_LABELS: Record<string, string> = {
  compliant: "ممتثل",
  partially_compliant: "ممتثل جزئياً",
  non_compliant: "غير ممتثل",
  not_working: "لا يعمل",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  compliant: "لديه صفحة سياسة خصوصية تحتوي على جميع البنود الثمانية",
  partially_compliant: "لديه صفحة سياسة خصوصية لكنها تفتقر لبعض البنود",
  non_compliant: "ليس لديه صفحة سياسة خصوصية",
  not_working: "الموقع لا يعمل أو غير متاح",
};

const CHART_COLORS = {
  compliant: "#10b981",
  partial: "#f59e0b",
  nonCompliant: "#ef4444",
  noPolicy: "#94a3b8",
};

// ─── Enhanced Animated Background with Floating Shapes ──────
function AnimatedMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <WatermarkLogo />
      {/* Primary gradient orb */}
      <div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"
        style={{ top: "-10%", right: "-5%" }}
      />
      {/* Secondary gradient orb */}
      <div
        className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-emerald-500/15 to-transparent blur-3xl"
        style={{ bottom: "10%", left: "-5%" }}
      />
      {/* Floating hexagonal shapes */}
      {[
        { size: 40, top: "15%", left: "10%", delay: 0, duration: 10 },
        { size: 30, top: "60%", left: "80%", delay: 2, duration: 12 },
        { size: 25, top: "30%", left: "70%", delay: 4, duration: 14 },
        { size: 35, top: "75%", left: "20%", delay: 1, duration: 11 },
        { size: 20, top: "45%", left: "50%", delay: 3, duration: 13 },
      ].map((hex, i) => (
        <div
          key={i}
          className="absolute border border-primary/10 dark:border-primary/20"
          style={{
            width: hex.size,
            height: hex.size,
            top: hex.top,
            left: hex.left,
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            background: "linear-gradient(135deg, var(--sdaia-glow), transparent)",
          }}
        />
      ))}
      {/* Orbiting particles */}
      <div className="absolute top-1/4 right-1/4">
        <div
          className="w-2 h-2 rounded-full bg-primary/30 btn-glow"
          style={{ transformOrigin: "60px 0px" }}
        />
      </div>
      <div className="absolute bottom-1/3 left-1/3">
        <div
          className="w-1.5 h-1.5 rounded-full bg-emerald-400/30"
          style={{ transformOrigin: "0px 50px" }}
        />
      </div>
    </div>
  );
}

// ─── Real-time Clock Component ──────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const timeStr = time.toLocaleTimeString("ar-SA-u-nu-latn", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = time.toLocaleDateString("ar-SA-u-nu-latn", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  return (
    <div
      className="flex items-center gap-3"
    >
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-sm border border-[#C5A55A]/10 dark:border-white/10">
        <div
        >
          <Clock className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-bold tabular-nums">{timeStr}</span>
      </div>
      <span className="text-xs text-muted-foreground/70 hidden md:inline">{dateStr}</span>
    </div>
  );
}

// ─── Live Status Indicator ──────────────────────────────────
function LiveStatusIndicator() {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
    >
      <div
        className="w-2 h-2 rounded-full bg-emerald-500"
      />
      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">مباشر</span>
      <Signal className="w-3 h-3 text-emerald-500" />
    </div>
  );
}

// ─── SVG Circular Progress Ring ──────────────────────────────
function CircularProgress({ 
  value, size = 56, stroke = 5, color = "emerald",
  children 
}: { 
  value: number; size?: number; stroke?: number; color?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  const colorMap: Record<string, string> = {
    emerald: "stroke-emerald-500",
    amber: "stroke-amber-500",
    rose: "stroke-rose-500",
    red: "stroke-red-500",
    blue: "stroke-blue-500",
    indigo: "stroke-indigo-500",
    purple: "stroke-primary",
    slate: "stroke-slate-500",
    zinc: "stroke-zinc-500",
    primary: "stroke-primary",
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={stroke}
          className="stroke-muted/30"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={stroke}
          strokeLinecap="round"
          className={colorMap[color] || "stroke-primary"}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Trend Indicator ───────────────────────────────────────────
function TrendBadge({ change, size = "sm" }: { change: number; size?: "sm" | "md" }) {
  const isUp = change > 0;
  const isFlat = change === 0;
  const isNew = Math.abs(change) >= 100;
  const sizeClasses = size === "md" ? "text-xs px-2.5 py-1" : "text-[10px] px-2 py-0.5";

  if (isFlat) {
    return (
      <span className={`${sizeClasses} inline-flex items-center gap-0.5 rounded-full bg-muted/60 text-muted-foreground font-semibold`}>
        <Minus className="w-3 h-3" />
        ثابت
      </span>
    );
  }

  if (isNew) {
    return (
      <span
        className={`${sizeClasses} inline-flex items-center gap-0.5 rounded-full font-bold bg-blue-500/10 text-blue-400`}
      >
        <Sparkles className="w-3 h-3" />
        جديد
      </span>
    );
  }

  return (
    <span
      className={`${sizeClasses} inline-flex items-center gap-0.5 rounded-full font-bold ${
        isUp
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-rose-500/10 text-rose-400"
      }`}
    >
      {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(change)}٪
    </span>
  );
}

// ─── Excel Export Button ───────────────────────────────────
function ExcelExportButton({
  onClick, loading = false, size = "sm", label = "تصدير Excel",
}: {
  onClick: () => void; loading?: boolean; size?: "sm" | "icon"; label?: string;
}) {
  return (
    <div>
      <Button
        variant="outline"
        size={size}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        disabled={loading}
        className="gap-1.5 text-emerald-400 border-emerald-700 hover:bg-emerald-950/30 transition-all rounded-xl"
      >
        <FileSpreadsheet className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        {size !== "icon" && <span className="text-xs font-bold">{label}</span>}
      </Button>
    </div>
  );
}

// ─── Premium Section Header ─────────────────────────────────
function SectionHeader({ 
  icon: Icon, title, subtitle, action 
}: { 
  icon: any; title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold-a15)] to-[var(--gold-a10)] flex items-center justify-center border border-[var(--gold-a20)]"
          style={{ boxShadow: 'var(--bevel-gold), var(--elev-1)' }}
        >
          <Icon className="w-5 h-5 text-[var(--gold-500)] dark:text-[var(--gold-300)]" />
        </div>
        <div>
          <h3 className="text-lg font-black">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground/80">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── COMPLIANCE DONUT CHART ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════
function ComplianceDonutChart({
  compliant, partial, nonCompliant, noPolicy, total,
  onSliceClick,
}: {
  compliant: number; partial: number; nonCompliant: number; noPolicy: number; total: number;
  onSliceClick?: (status: string) => void;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const data = [
    { name: "ممتثل", value: compliant, key: "compliant", color: CHART_COLORS.compliant },
    { name: "ممتثل جزئياً", value: partial, key: "partially_compliant", color: CHART_COLORS.partial },
    { name: "غير ممتثل", value: nonCompliant, key: "non_compliant", color: CHART_COLORS.nonCompliant },
    { name: "لا يعمل", value: noPolicy, key: "not_working", color: CHART_COLORS.noPolicy },
  ].filter(d => d.value > 0);

  const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

  return (
    <div
      className="relative overflow-hidden rounded-3xl glass-card gold-sweep elev-2 p-6"
    >
      <SectionHeader
        icon={PieChart}
        title="توزيع الامتثال"
        subtitle="نسبة كل حالة من إجمالي الفحوصات"
      />
      <div className="flex items-center gap-6 mt-4">
        <div className="relative w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(_, index) => onSliceClick?.(data[index].key)}
                style={{ cursor: "pointer" }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.key}
                    fill={entry.color}
                    opacity={activeIndex !== null && activeIndex !== index ? 0.4 : 1}
                    stroke={activeIndex === index ? entry.color : "transparent"}
                    strokeWidth={activeIndex === index ? 3 : 0}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0];
                  return (
                    <div className="glass-card gold-sweep p-3 rounded-xl elev-2 text-xs">
                      <p className="font-bold">{d.name}</p>
                      <p className="text-muted-foreground">{d.value} موقع ({total > 0 ? Math.round((Number(d.value) / total) * 100) : 0}٪)</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-black text-primary"
              key={complianceRate}
            >
              {complianceRate}٪
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">نسبة الامتثال</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex-1 space-y-3">
          {data.map((item, idx) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div
                key={item.key}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => onSliceClick?.(item.key)}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className="w-3 h-3 rounded-full shadow-sm transition-transform group-hover:scale-125"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}40` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{item.name}</span>
                    <span className="text-xs font-black">{item.value}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-muted/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                      animate={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold w-8 text-start">{pct}٪</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── ARTICLE 12 CLAUSES BAR CHART ──────────────────────────
// ═══════════════════════════════════════════════════════════════
function ClausesBarChart({ clauseData, onBarClick }: { clauseData: any[]; onBarClick?: (clause: number) => void }) {
  const chartData = useMemo(() => {
    return (clauseData || []).map((c: any, idx: number) => ({
      name: `بند ${c.clause || idx + 1}`,
      clause: c.clause || idx + 1,
      compliant: c.compliant || 0,
      nonCompliant: (c.total || 0) - (c.compliant || 0),
      percentage: c.percentage ?? (c.total > 0 ? Math.round((c.compliant / c.total) * 100) : 0),
    }));
  }, [clauseData]);

  return (
    <div
      className="relative overflow-hidden rounded-3xl glass-card gold-sweep elev-2 p-6"
    >
      <SectionHeader
        icon={BarChart3}
        title="بنود المادة ١٢"
        subtitle="مقارنة الامتثال لكل بند"
      />
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fontFamily: "Tajawal", fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)", opacity: 0.3 }}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: "Tajawal", fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)", opacity: 0.3 }}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="glass-card gold-sweep p-3 rounded-xl elev-2 text-xs" dir="rtl">
                    <p className="font-bold mb-1">{label}</p>
                    {payload.map((p: any) => (
                      <p key={p.dataKey} style={{ color: p.fill }}>
                        {p.dataKey === "compliant" ? "ممتثل" : "غير ممتثل"}: {p.value}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="compliant"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data) => onBarClick?.(data.clause)}
            />
            <Bar
              dataKey="nonCompliant"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              opacity={0.7}
              cursor="pointer"
              onClick={(data) => onBarClick?.(data.clause)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="font-medium text-muted-foreground">ممتثل</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-500/70" />
          <span className="font-medium text-muted-foreground">غير ممتثل</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── SECTOR RADAR CHART ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
function SectorRadarChart({ clausesBySector }: { clausesBySector: Record<string, any[]> }) {
  const radarData = useMemo(() => {
    const publicClauses = clausesBySector["public"] || [];
    const privateClauses = clausesBySector["private"] || [];
    return ARTICLE_12_CLAUSES.map((clause, idx) => {
      const pub = publicClauses.find((c: any) => c.clause === idx + 1);
      const priv = privateClauses.find((c: any) => c.clause === idx + 1);
      return {
        subject: `بند ${idx + 1}`,
        "قطاع عام": pub?.percentage ?? 0,
        "قطاع خاص": priv?.percentage ?? 0,
      };
    });
  }, [clausesBySector]);

  if (radarData.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-3xl glass-card gold-sweep elev-2 p-6"
    >
      <SectionHeader
        icon={Target}
        title="رادار المقارنة القطاعية"
        subtitle="مقارنة امتثال القطاعين لبنود المادة ١٢"
      />
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border)" opacity={0.3} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fontFamily: "Tajawal", fill: "var(--muted-foreground)" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 8, fill: "var(--muted-foreground)" }}
            />
            <Radar
              name="قطاع عام"
              dataKey="قطاع عام"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="قطاع خاص"
              dataKey="قطاع خاص"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "Tajawal" }}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="glass-card gold-sweep p-3 rounded-xl elev-2 text-xs" dir="rtl">
                    <p className="font-bold mb-1">{label}</p>
                    {payload.map((p: any) => (
                      <p key={p.dataKey} style={{ color: p.stroke }}>
                        {p.name}: {p.value}٪
                      </p>
                    ))}
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── MONTHLY TREND AREA CHART ───────────────────────────────
// ═══════════════════════════════════════════════════════════════
function MonthlyTrendChart({ mc }: { mc: any }) {
  if (!mc) return null;
  const trendData = [
    {
      name: "الشهر الماضي",
      ممتثل: mc.lastMonth.compliant || 0,
      "غير ممتثل": mc.lastMonth.nonCompliant || 0,
      جزئي: mc.lastMonth.partiallyCompliant || 0,
    },
    {
      name: "الشهر الحالي",
      ممتثل: mc.thisMonth.compliant || 0,
      "غير ممتثل": mc.thisMonth.nonCompliant || 0,
      جزئي: mc.thisMonth.partiallyCompliant || 0,
    },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-3xl glass-card gold-sweep elev-2 p-6"
    >
      <SectionHeader
        icon={TrendingUp}
        title="الاتجاه الشهري"
        subtitle="مقارنة بين الشهر الحالي والشهر الماضي"
      />
      <div className="mt-4 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="gradCompliant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradNonCompliant" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPartial" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fontFamily: "Tajawal", fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: "Tajawal", fill: "var(--muted-foreground)" }}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="glass-card gold-sweep p-3 rounded-xl elev-2 text-xs" dir="rtl">
                    <p className="font-bold mb-1">{label}</p>
                    {payload.map((p: any) => (
                      <p key={p.dataKey} style={{ color: p.stroke }}>
                        {p.dataKey}: {p.value}
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="ممتثل" stroke="#10b981" fill="url(#gradCompliant)" strokeWidth={2} />
            <Area type="monotone" dataKey="غير ممتثل" stroke="#ef4444" fill="url(#gradNonCompliant)" strokeWidth={2} />
            <Area type="monotone" dataKey="جزئي" stroke="#f59e0b" fill="url(#gradPartial)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── ULTRA PREMIUM KPI Hero Card ─────────────────────────────
// ═══════════════════════════════════════════════════════════════
function HeroKPICard({
  title, value, icon: Icon, gradient, delay = 0,
  subtitle, trend, onClick, lastMonthValue, accentColor = "blue",
}: {
  title: string; value: number; icon: any; gradient: string; delay?: number;
  subtitle?: string; trend?: number; onClick?: () => void;
  lastMonthValue?: number; accentColor?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={onClick ? "cursor-pointer group" : "group"}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl glass-card gold-sweep transition-all duration-500 hover:translate-y-[-4px]" style={{ animation: `card-entrance 0.5s ease-out ${delay * 0.1}s both` }}>
        {/* Animated gradient orb */}
        <div
          className={`absolute -top-8 -left-8 w-36 h-36 bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-25`}
          style={{ animation: 'gold-pulse 4s ease-in-out infinite' }}
        />
        {/* Secondary ambient orb */}
        <div
          className={`absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br ${gradient} rounded-full blur-2xl opacity-15`}
        />
        <div className="relative p-5">
          {/* Top row: Icon + Trend */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl ring-4 ring-white/10 icon-premium`}
              style={{ boxShadow: `0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)` }}
            >
              <Icon className="w-7 h-7 text-white drop-shadow-md" />
            </div>
            {trend !== undefined && <TrendBadge change={trend} />}
          </div>
          {/* Value with counting animation */}
          <div
            className="text-4xl font-black tracking-tight mb-1 bg-gradient-to-l from-foreground to-foreground/70 bg-clip-text text-transparent"
          >
            <CountUp end={value} duration={2} delay={delay} separator="," useEasing />
          </div>
          {/* Title */}
          <p className="text-sm font-bold text-foreground/80 mb-1">{title}</p>
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-muted-foreground/80">{subtitle}</p>
          )}
          {/* Last month comparison */}
          {lastMonthValue !== undefined && (
            <div className="mt-2 text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              الشهر الماضي: {formatNumber(lastMonthValue)}
            </div>
          )}
          {/* Bottom accent bar — stronger */}
          <div
            className={`absolute bottom-0 right-0 left-0 h-[2.5px] bg-gradient-to-l ${gradient}`}
            style={{ opacity: 0.8, boxShadow: `0 -2px 8px rgba(0,0,0,0.1)` }}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── ULTRA PREMIUM Compliance Status Card ────────────────────
// ═══════════════════════════════════════════════════════════════
function PremiumStatusCard({
  statusKey, label, value, total, description, icon: Icon,
  gradient, textColor, trend, onClick, delay = 0,
}: {
  statusKey: string; label: string; value: number; total: number;
  description: string; icon: any; gradient: string; textColor: string;
  trend?: number; onClick?: () => void; delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div
      className="cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl glass-card gold-sweep transition-all duration-400 hover:translate-y-[-3px]">
        {/* Scan effect overlay */}
        <div className="scan-effect" />
        {/* Background glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-l ${gradient}`}
        />

        <div className="relative p-5 flex items-center gap-5">
          {/* Circular progress with icon */}
          <CircularProgress value={pct} size={64} stroke={5} color={statusKey === "compliant" ? "emerald" : statusKey === "partially_compliant" ? "amber" : statusKey === "non_compliant" ? "rose" : "slate"}>
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
              animate={hovered ? { rotate: [0, -12, 12, 0], scale: 1.1 } : {}}
            >
              <Icon className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
          </CircularProgress>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-sm font-black ${textColor}`}>{label}</span>
              {trend !== undefined && <TrendBadge change={trend} />}
            </div>
            <div className="flex items-baseline gap-3 mb-2">
              <span
                className="text-3xl font-black"
              >
                <CountUp end={value} duration={1.5} separator="," />
              </span>
              <span className={`text-lg font-black ${textColor}`}>{pct}٪</span>
            </div>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed">{description}</p>
          </div>

          {/* Hover arrow indicator */}
          <div
            className="shrink-0"
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground -rotate-90" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── ULTRA PREMIUM Clause KPI Card ───────────────────────────
// ═══════════════════════════════════════════════════════════════
function PremiumClauseCard({
  clause, name, compliant, total, percentage, delay = 0, onClick,
}: {
  clause: number; name: string; compliant: number; total: number;
  percentage: number; delay?: number; onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const color = percentage >= 70 ? "emerald" : percentage >= 40 ? "amber" : "rose";
  const gradientMap: Record<string, string> = {
    emerald: "from-emerald-400 to-blue-900",
    amber: "from-amber-400 to-orange-500",
    rose: "from-rose-400 to-red-600",
  };
  const gradient = gradientMap[color];
  const nonCompliant = total - compliant;

  return (
    <div
      className={onClick ? "cursor-pointer group" : "group"}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl glass-card gold-sweep transition-all duration-400 h-full">
        {/* Scan effect overlay */}
        <div className="scan-effect" />
        {/* Background glow */}
        <div
          className={`absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br ${gradient} rounded-full blur-3xl`}
        />

        <div className="relative p-5">
          {/* Header: clause number + percentage */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl ring-4 ring-white/10`}
              animate={hovered ? { rotate: [0, -8, 8, 0], scale: 1.1 } : {}}
            >
              <span className="text-white font-black text-base drop-shadow-sm">{clause}</span>
            </div>
            
            <CircularProgress value={percentage} size={48} stroke={4} color={color}>
              <span className={`text-xs font-black ${
                color === "emerald" ? "text-emerald-400" :
                color === "amber" ? "text-amber-400" :
                "text-rose-400"
              }`}>{percentage}٪</span>
            </CircularProgress>
          </div>

          {/* Clause name */}
          <p className="text-xs font-bold text-foreground/80 mb-4 line-clamp-2 leading-relaxed min-h-[2.5rem]">{name}</p>

          {/* Stats row */}
          <div className="flex items-center justify-between text-[11px] mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-emerald-400 font-bold">{compliant} ممتثل</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span className="text-rose-400 font-bold">{nonCompliant} غير ممتثل</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-l ${gradient}`}
              animate={{ width: `${percentage}%` }}
            />
          </div>

          {/* Hover indicator */}
          
            {hovered && onClick && (
              <div
                className="mt-3 text-center"
              >
                <span className="text-[10px] text-primary font-bold">انقر لعرض التفاصيل ←</span>
              </div>
            )}
          
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── ULTRA PREMIUM Sector KPI Card ───────────────────────────
// ═══════════════════════════════════════════════════════════════
function PremiumSectorCard({
  sectorType, stats, delay = 0, onStatusClick, onExport,
}: {
  sectorType: string; stats: any; delay?: number;
  onStatusClick?: (status: string) => void;
  onExport?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = SECTOR_TYPE_ICONS[sectorType] || Building2;
  const label = SECTOR_TYPE_LABELS[sectorType] || sectorType;
  const gradient = sectorType === "public" ? "from-blue-500 to-indigo-600" : "from-[oklch(0.48_0.14_290)] to-[oklch(0.55_0.14_270)]";
  const accentColor = sectorType === "public" ? "blue" : "purple";

  const complianceData = {
    compliant: Number(stats?.compliant) || 0,
    partiallyCompliant: Number(stats?.partiallyCompliant) || 0,
    nonCompliant: Number(stats?.nonCompliant) || 0,
    noPolicy: Number(stats?.noPolicy) || 0,
  };
  const total = complianceData.compliant + complianceData.partiallyCompliant + complianceData.nonCompliant + complianceData.noPolicy;
  const complianceRate = total > 0 ? Math.round((complianceData.compliant / total) * 100) : 0;

  const statusItems = [
    { key: "compliant", label: "ممتثل", val: complianceData.compliant, icon: ShieldCheck, gradient: STATUS_GRADIENTS.compliant, color: "emerald" },
    { key: "partially_compliant", label: "ممتثل جزئياً", val: complianceData.partiallyCompliant, icon: ShieldAlert, gradient: STATUS_GRADIENTS.partially_compliant, color: "amber" },
    { key: "non_compliant", label: "غير ممتثل", val: complianceData.nonCompliant, icon: ShieldX, gradient: STATUS_GRADIENTS.non_compliant, color: "rose" },
    { key: "not_working", label: "لا يعمل", val: complianceData.noPolicy, icon: WifiOff, gradient: STATUS_GRADIENTS.not_working, color: "slate" },
  ];

  // Mini donut data for sector card
  const sectorDonutData = statusItems.filter(s => s.val > 0).map(s => ({
    name: s.label,
    value: s.val,
    color: s.color === "emerald" ? "#10b981" : s.color === "amber" ? "#f59e0b" : s.color === "rose" ? "#ef4444" : "#94a3b8",
  }));

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl glass-card gold-sweep transition-all duration-500">
        {/* Scan effect overlay */}
        <div className="scan-effect" />
        {/* Background mesh */}
        <div
          className={`absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br ${gradient} rounded-full blur-3xl`}
        />

        {/* Header */}
        <div className="relative p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl ring-4 ring-white/10`}
                animate={hovered ? { rotate: [0, -6, 6, 0], scale: 1.05 } : {}}
              >
                <Icon className="w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div>
                <h3 className="text-xl font-black">{label}</h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <Badge variant="outline" className="text-xs font-bold rounded-lg">{Number(stats?.totalSites) || 0} موقع</Badge>
                  <div className="flex items-center gap-1.5">
                    <CircularProgress value={complianceRate} size={32} stroke={3} color={accentColor}>
                      <Trophy className={`w-3.5 h-3.5 text-${accentColor}-500`} />
                    </CircularProgress>
                    <span className={`text-xl font-black text-${accentColor}-400`}>{complianceRate}٪</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mini donut */}
              <div className="hidden md:block w-20 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sectorDonutData} cx="50%" cy="50%" innerRadius={22} outerRadius={35} dataKey="value" strokeWidth={0} paddingAngle={2}>
                      {sectorDonutData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {onExport && <ExcelExportButton onClick={onExport} label="تصدير" />}
            </div>
          </div>
        </div>

        {/* Status cards grid */}
        <div className="relative px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            {statusItems.map((item, idx) => {
              const ItemIcon = item.icon;
              const itemPct = total > 0 ? Math.round((item.val / total) * 100) : 0;
              return (
                <div
                  key={item.key}
                  className="cursor-pointer"
                  onClick={() => onStatusClick?.(item.key)}
                >
                  <div className={`relative overflow-hidden p-4 rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-sm hover:shadow-lg transition-all duration-300`}>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`}
                    />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}
                        >
                          <ItemIcon className="w-4.5 h-4.5 text-white" />
                        </div>
                      </div>
                      <div className="text-2xl font-black mb-0.5">{item.val}</div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${STATUS_TEXT[item.key]}`}>{item.label}</span>
                        <span className="text-[10px] text-muted-foreground font-semibold">{itemPct}٪</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ─── ULTRA PREMIUM Category Card ─────────────────────────────
// ═══════════════════════════════════════════════════════════════
function PremiumCategoryCard({ category, stats, delay = 0, onClick }: { category: string; stats: any; delay?: number; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const total = Number(stats.totalScans) || (Number(stats.compliant) + Number(stats.partiallyCompliant) + Number(stats.nonCompliant) + Number(stats.noPolicy));
  const compliant = Number(stats.compliant) || 0;
  const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;
  const color = rate >= 70 ? "emerald" : rate >= 40 ? "amber" : "rose";
  const gradientMap: Record<string, string> = {
    emerald: "from-emerald-400 to-blue-900",
    amber: "from-amber-400 to-orange-500",
    rose: "from-rose-400 to-red-600",
  };
  const gradient = gradientMap[color];

  return (
    <div
      className={onClick ? "cursor-pointer group" : "group"}
      onClick={onClick}
     onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="h-full relative overflow-hidden rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl shadow-md hover:shadow-xl transition-all duration-400">
        {/* Glow */}
        <div
          className={`absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl`}
        />

        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs font-bold rounded-lg">{category || "غير مصنف"}</Badge>
            <div className="flex items-center gap-2">
              <CircularProgress value={rate} size={40} stroke={3.5} color={color}>
                <span className={`text-[10px] font-black ${
                  color === "emerald" ? "text-emerald-400" :
                  color === "amber" ? "text-amber-400" :
                  "text-rose-400"
                }`}>{rate}٪</span>
              </CircularProgress>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] stagger-children">
            {[
              { color: "bg-emerald-500", shadow: "shadow-emerald-500/30", label: "ممتثل", val: compliant },
              { color: "bg-amber-500", shadow: "shadow-amber-500/30", label: "جزئي", val: Number(stats.partiallyCompliant) || 0 },
              { color: "bg-rose-500", shadow: "shadow-rose-500/30", label: "غير ممتثل", val: Number(stats.nonCompliant) || 0 },
              { color: "bg-slate-500", shadow: "shadow-slate-500/30", label: "لا يعمل", val: Number(stats.noPolicy) || 0 },
            ].map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${s.color} shadow-sm ${s.shadow}`} />
                <span className="font-semibold">{s.label}: <span className="font-black">{s.val}</span></span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="mt-3 pt-3 border-t border-[rgba(197,165,90,0.10)]/30 flex items-center justify-between text-[10px] text-muted-foreground"
          >
            <span>إجمالي المواقع: <span className="font-bold">{Number(stats.totalSites) || 0}</span></span>
            {onClick && (
              <span
                className="text-primary font-bold"
              >
                عرض ←
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PDF Export ─────────────────────────────────────────────
async function exportDashboardPDF(dashboardRef: React.RefObject<HTMLDivElement | null>) {
  if (!dashboardRef.current) return;
  toast.info("جاري إنشاء تقرير PDF...", { duration: 3000 });
  try {
    const html2canvas = (await import("html2canvas-pro")).default;
    const { jsPDF } = await import("jspdf");
    const element = dashboardRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff", windowWidth: 1200 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    pdf.setFillColor(0, 100, 80);
    pdf.rect(0, 0, pageWidth, 35, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text("منصة راصد", pageWidth - margin, 15, { align: "right" });
    pdf.setFontSize(10);
    pdf.text("لوحة المؤشرات القيادية — رصد سياسة الخصوصية", pageWidth - margin, 24, { align: "right" });
    pdf.setFontSize(8);
    const dateStr = new Date().toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" });
    pdf.text(`تاريخ التقرير: ${dateStr}`, pageWidth - margin, 31, { align: "right" });
    const contentWidth = pageWidth - margin * 2;
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = contentWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;
    let yPos = 40;
    const availableHeight = pageHeight - yPos - 15;
    if (scaledHeight <= availableHeight) {
      pdf.addImage(imgData, "PNG", margin, yPos, contentWidth, scaledHeight);
    } else {
      let srcY = 0;
      while (srcY < imgHeight) {
        const sliceHeight = Math.min((availableHeight / ratio), imgHeight - srcY);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = imgWidth;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, srcY, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);
          const sliceData = sliceCanvas.toDataURL("image/png");
          if (srcY > 0) { pdf.addPage(); yPos = 10; }
          pdf.addImage(sliceData, "PNG", margin, yPos, contentWidth, sliceHeight * ratio);
        }
        srcY += sliceHeight;
      }
    }
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`المادة 12 من نظام حماية البيانات الشخصية — منصة راصد`, pageWidth / 2, pageHeight - 5, { align: "center" });
      pdf.text(`صفحة ${i} من ${totalPages}`, margin, pageHeight - 5);
    }
    pdf.save(`rasid-dashboard-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("تم تصدير التقرير بنجاح");
  } catch (error) {
    console.error("PDF export error:", error);
    toast.error("حدث خطأ أثناء تصدير التقرير");
  }
}

// ═══════════════════════════════════════════════════════════════
// ─── Main Dashboard Component ────────────────────────────────
// ═══════════════════════════════════════════════════════════════
export default function Home() {
  const { playClick, playHover } = useSoundEffects();
  const [activeTab, setActiveTab] = useState("overview");
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  // ─── Popup state ─────────────────────────────────────────
  const { open: popupOpen, setOpen: setPopupOpen, filter: popupFilter, openDrillDown: openPopup } = useDrillDown();

  // ─── Excel export mutation ──────────────────────────────
  const exportExcel = trpc.dashboard.exportExcel.useMutation({
    onSuccess: (data) => {
      if (data.base64) {
        downloadBase64File(data.base64, data.filename);
        toast.success("تم تصدير ملف Excel بنجاح");
      } else {
        toast.error("لا توجد بيانات للتصدير");
      }
      setExportLoading(null);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التصدير");
      setExportLoading(null);
    },
  });

  const handleExcelExport = useCallback((type: string, extra?: any) => {
    setExportLoading(type);
    exportExcel.mutate({ type: type as any, ...extra });
  }, [exportExcel]);

  // ─── Fetch all data ──────────────────────────────────────
  const stats = trpc.dashboard.stats.useQuery();
  const clauseStats = trpc.dashboard.clauseStats.useQuery();
  const sectorTypeStats = trpc.dashboard.statsBySectorType.useQuery();
  const clausesBySectorType = trpc.dashboard.clauseStatsBySectorType.useQuery();
  const statsBySectorAndCategory = trpc.dashboard.statsBySectorAndCategory.useQuery();
  const monthlyComparison = trpc.dashboard.monthlyComparison.useQuery();

  // ─── Process sector type data ────────────────────────────
  const sectorTypeData = useMemo(() => {
    const raw = sectorTypeStats.data || [];
    const result: Record<string, any> = {};
    (raw as any[]).forEach((row: any) => {
      result[row.sectorType] = row;
    });
    return result;
  }, [sectorTypeStats.data]);

  // ─── Process clause stats by sector type ─────────────────
  const clausesBySector = useMemo(() => {
    const raw = clausesBySectorType.data || [];
    const result: Record<string, any[]> = {};
    (raw as any[]).forEach((row: any) => {
      const st = row.sectorType;
      if (!result[st]) result[st] = [];
      const total = Number(row.total) || 1;
      for (let i = 1; i <= 8; i++) {
        const existing = result[st].find((c: any) => c.clause === i);
        if (!existing) {
          result[st].push({
            clause: i,
            name: ARTICLE_12_CLAUSES[i - 1]?.name || `بند ${i}`,
            compliant: Number(row[`c${i}`]) || 0,
            total,
            percentage: Math.round(((Number(row[`c${i}`]) || 0) / total) * 100),
          });
        }
      }
    });
    return result;
  }, [clausesBySectorType.data]);

  // ─── Process category data ───────────────────────────────
  const categoryData = useMemo(() => {
    const raw = statsBySectorAndCategory.data || [];
    const result: Record<string, any[]> = {};
    (raw as any[]).forEach((row: any) => {
      const key = row.sectorType || "other";
      if (!result[key]) result[key] = [];
      result[key].push(row);
    });
    return result;
  }, [statsBySectorAndCategory.data]);

  const mc = monthlyComparison.data;
  const d = stats.data;
  const isLoading = stats.isLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl border border-[#C5A55A]/20 dark:border-white/20 animate-pulse">
              <div className="p-5 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-muted/40" />
                <div className="h-10 bg-muted/40 rounded-lg w-24" />
                <div className="h-4 bg-muted/30 rounded-lg w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalSites = Number(d?.totalSites) || 0;
  const totalScans = Number(d?.totalScans) || 0;
  const compliant = Number(d?.compliant) || 0;
  const partial = Number(d?.partiallyCompliant) || 0;
  const nonCompliant = Number(d?.nonCompliant) || 0;
  const noPolicy = Number(d?.noPolicy) || 0;

  return (
    <div className="relative p-4 md:p-6 space-y-8" dir="rtl">
      {/* Background animated mesh */}
      <AnimatedMesh />

      {/* ═══ Sites Popup Dialog ═══ */}
      <DrillDownModal open={popupOpen} onOpenChange={setPopupOpen} filter={popupFilter} />

      {/* ═══ Header ═══ */}
      <div
        className="relative"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl ring-4 ring-primary/20 icon-premium"
              style={{ boxShadow: '0 8px 30px rgba(197,165,90,0.25), inset 0 1px 0 rgba(245,230,163,0.2)' }}
            >
              <Eye className="w-8 h-8 text-white drop-shadow-md" style={{ animation: 'icon-pulse 3s ease-in-out infinite' }} />
              <div
                className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-background shadow-lg shadow-emerald-400/50"
                style={{ animation: 'gold-pulse 2s ease-in-out infinite' }}
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #C5A55A 0%, #F5E6A3 30%, #C5A55A 60%, #8B7332 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gold-shimmer-sweep 5s ease-in-out infinite',
                }}
              >
                رصد سياسة الخصوصية
              </h1>
              <p className="text-sm text-muted-foreground/80 font-medium">لوحة المؤشرات القيادية — المادة ١٢ من نظام حماية البيانات الشخصية</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Live status + clock */}
            <LiveStatusIndicator />
            <LiveClock />
            <ExcelExportButton
              onClick={() => handleExcelExport("all")}
              loading={exportLoading === "all"}
              label="تصدير الكل"
            />
            <div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hidden sm:flex hover:bg-primary hover:text-white transition-all rounded-xl btn-glow"
                onClick={() => exportDashboardPDF(dashboardRef)}
              >
                <Download className="w-4 h-4" />
                <span className="text-xs font-bold">تصدير PDF</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Monthly comparison bar */}
        {mc && (
          <div
            className="mt-5 p-5 rounded-2xl glass-card gold-sweep"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2.5 text-sm">
                <div
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
                >
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="font-black">المقارنة الشهرية</span>
              </div>
              <div className="flex items-center gap-6 flex-wrap text-xs">
                {[
                  { label: "الفحوصات", val: mc.thisMonth.totalScans, change: mc.changes.totalScans, color: "text-blue-400" },
                  { label: "ممتثل", val: mc.thisMonth.compliant, change: mc.changes.compliant, color: "text-emerald-400" },
                  { label: "غير ممتثل", val: mc.thisMonth.nonCompliant, change: mc.changes.nonCompliant, color: "text-rose-400" },
                  { label: "جزئي", val: mc.thisMonth.partiallyCompliant, change: mc.changes.partiallyCompliant, color: "text-amber-400" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2"
                  >
                    <span className="text-muted-foreground font-medium">{item.label}:</span>
                    <span className={`font-black ${item.color}`}>{item.val}</span>
                    <TrendBadge change={item.change} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Dashboard Content ═══ */}
      <div ref={dashboardRef} className="relative">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Premium Tab Navigation */}
          <div className="rounded-2xl glass-card gold-sweep p-1.5 mb-6">
            <TabsList className="grid grid-cols-4 w-full bg-transparent gap-1.5 stagger-children">
              {[
                { value: "overview", icon: Gauge, label: "الرصد العام", shortLabel: "عام" },
                { value: "clauses", icon: FileCheck, label: "بنود المادة ١٢", shortLabel: "البنود" },
                { value: "sectors", icon: Building2, label: "حسب القطاع", shortLabel: "القطاع" },
                { value: "categories", icon: Layers, label: "حسب الفئة", shortLabel: "الفئة" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 text-xs md:text-sm font-bold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all duration-300 btn-glow"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ═══ TAB 1: General Overview ═══ */}
          <TabsContent value="overview" className="space-y-8 mt-0">
            <div className="flex justify-end">
              <ExcelExportButton
                onClick={() => handleExcelExport("overview")}
                loading={exportLoading === "overview"}
                label="تصدير الرصد العام"
              />
            </div>

            {/* Hero KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
              <HeroKPICard
                title="إجمالي المواقع السعودية"
                value={totalSites}
                icon={Globe}
                gradient="from-blue-500 to-indigo-600"
                delay={0}
                trend={mc?.sitesChange}
                lastMonthValue={mc ? (totalSites - (mc.newSitesThisMonth || 0)) : undefined}
                accentColor="blue"
                onClick={() => openPopup({
                  title: "جميع المواقع السعودية",
                  subtitle: `إجمالي ${totalSites} موقع مسجل في المنصة`,
                  icon: <Globe className="w-6 h-6 text-blue-500" />,
                  gradient: "from-blue-500/20 to-blue-600/5",
                })}
              />
              <HeroKPICard
                title="إجمالي عدد الفحوصات"
                value={totalScans}
                icon={ScanSearch}
                gradient="from-indigo-500 to-[oklch(0.42_0.14_290)]"
                delay={0.08}
                trend={mc?.changes.totalScans}
                lastMonthValue={mc?.lastMonth.totalScans}
                accentColor="indigo"
                onClick={() => openPopup({
                  title: "جميع المواقع المفحوصة",
                  subtitle: `${totalScans} عملية فحص تمت`,
                  icon: <ScanSearch className="w-6 h-6 text-indigo-500" />,
                  gradient: "from-indigo-500/20 to-indigo-600/5",
                })}
              />
              <HeroKPICard
                title="المواقع الممتثلة"
                value={compliant}
                icon={ShieldCheck}
                gradient={STATUS_GRADIENTS.compliant}
                delay={0.16}
                subtitle={totalScans > 0 ? `${Math.round((compliant / totalScans) * 100)}٪ من الفحوصات` : undefined}
                trend={mc?.changes.compliant}
                lastMonthValue={mc?.lastMonth.compliant}
                accentColor="emerald"
                onClick={() => openPopup({
                  complianceStatus: "compliant",
                  title: "المواقع الممتثلة",
                  subtitle: STATUS_DESCRIPTIONS.compliant,
                  icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
                  gradient: "from-emerald-500/20 to-emerald-600/5",
                })}
              />
              <HeroKPICard
                title="غير ممتثل"
                value={nonCompliant}
                icon={ShieldX}
                gradient={STATUS_GRADIENTS.non_compliant}
                delay={0.24}
                subtitle={totalScans > 0 ? `${Math.round((nonCompliant / totalScans) * 100)}٪ من الفحوصات` : undefined}
                trend={mc?.changes.nonCompliant}
                lastMonthValue={mc?.lastMonth.nonCompliant}
                accentColor="rose"
                onClick={() => openPopup({
                  complianceStatus: "non_compliant",
                  title: "المواقع غير الممتثلة",
                  subtitle: STATUS_DESCRIPTIONS.non_compliant,
                  icon: <ShieldX className="w-6 h-6 text-rose-500" />,
                  gradient: "from-rose-500/20 to-rose-600/5",
                })}
              />
              <HeroKPICard
                title="ممتثل جزئياً"
                value={partial}
                icon={ShieldAlert}
                gradient={STATUS_GRADIENTS.partially_compliant}
                delay={0.32}
                subtitle={totalScans > 0 ? `${Math.round((partial / totalScans) * 100)}٪ من الفحوصات` : undefined}
                trend={mc?.changes.partiallyCompliant}
                lastMonthValue={mc?.lastMonth.partiallyCompliant}
                accentColor="amber"
                onClick={() => openPopup({
                  complianceStatus: "partially_compliant",
                  title: "المواقع الممتثلة جزئياً",
                  subtitle: STATUS_DESCRIPTIONS.partially_compliant,
                  icon: <ShieldAlert className="w-6 h-6 text-amber-500" />,
                  gradient: "from-amber-500/20 to-amber-600/5",
                })}
              />
              <HeroKPICard
                title="لا يعمل"
                value={noPolicy}
                icon={WifiOff}
                gradient={STATUS_GRADIENTS.not_working}
                delay={0.40}
                subtitle={totalScans > 0 ? `${Math.round((noPolicy / totalScans) * 100)}٪ من الفحوصات` : undefined}
                trend={mc?.changes.noPolicy}
                lastMonthValue={mc?.lastMonth.noPolicy}
                accentColor="slate"
                onClick={() => openPopup({
                  complianceStatus: "not_working",
                  title: "المواقع التي لا تعمل",
                  subtitle: STATUS_DESCRIPTIONS.not_working,
                  icon: <WifiOff className="w-6 h-6 text-slate-500" />,
                  gradient: "from-slate-500/20 to-slate-600/5",
                })}
              />
            </div>

            {/* ═══ Interactive Charts Row ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
              {/* Compliance Donut Chart */}
              <ComplianceDonutChart
                compliant={compliant}
                partial={partial}
                nonCompliant={nonCompliant}
                noPolicy={noPolicy}
                total={totalScans}
                onSliceClick={(status) => openPopup({
                  complianceStatus: status,
                  title: `المواقع: ${STATUS_LABELS[status]}`,
                  subtitle: STATUS_DESCRIPTIONS[status],
                  icon: (() => {
                    const I = STATUS_ICONS[status];
                    return <I className={`w-6 h-6 ${STATUS_TEXT[status]}`} />;
                  })(),
                  gradient: `from-${status === "compliant" ? "emerald" : status === "partially_compliant" ? "amber" : status === "non_compliant" ? "rose" : "slate"}-500/20 to-transparent`,
                })}
              />

              {/* Monthly Trend Chart */}
              <MonthlyTrendChart mc={mc} />
            </div>

            {/* Compliance Status Detail Cards */}
            <div
            >
              <div className="rounded-3xl bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl border border-[#C5A55A]/10 dark:border-white/10 shadow-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <SectionHeader
                    icon={Shield}
                    title="توزيع حالات الامتثال"
                    action={
                      <ExcelExportButton
                        onClick={() => handleExcelExport("overview")}
                        loading={exportLoading === "overview"}
                        size="icon"
                      />
                    }
                  />
                </div>
                <div className="space-y-3">
                  {[
                    { key: "compliant", label: "ممتثل", value: compliant },
                    { key: "partially_compliant", label: "ممتثل جزئياً", value: partial },
                    { key: "non_compliant", label: "غير ممتثل", value: nonCompliant },
                    { key: "not_working", label: "لا يعمل", value: noPolicy },
                  ].map((item, idx) => {
                    const changeKey = item.key === "partially_compliant" ? "partiallyCompliant" : item.key === "non_compliant" ? "nonCompliant" : item.key === "not_working" ? "noPolicy" : "compliant";
                    const change = mc?.changes?.[changeKey as keyof typeof mc.changes];
                    return (
                      <PremiumStatusCard
                        key={item.key}
                        statusKey={item.key}
                        label={item.label}
                        value={item.value}
                        total={totalScans}
                        description={STATUS_DESCRIPTIONS[item.key]}
                        icon={STATUS_ICONS[item.key]}
                        gradient={STATUS_GRADIENTS[item.key]}
                        textColor={STATUS_TEXT[item.key]}
                        trend={change}
                        delay={0.6 + idx * 0.1}
                        onClick={() => openPopup({
                          complianceStatus: item.key,
                          title: `المواقع: ${item.label}`,
                          subtitle: STATUS_DESCRIPTIONS[item.key],
                          icon: (() => {
                            const I = STATUS_ICONS[item.key];
                            return <I className={`w-6 h-6 ${STATUS_TEXT[item.key]}`} />;
                          })(),
                          gradient: `from-${item.key === "compliant" ? "emerald" : item.key === "partially_compliant" ? "amber" : item.key === "non_compliant" ? "rose" : "slate"}-500/20 to-transparent`,
                        })}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ TAB 2: Article 12 Clauses ═══ */}
          <TabsContent value="clauses" className="space-y-6 mt-0">
            <SectionHeader
              icon={FileCheck}
              title="الامتثال حسب بنود المادة ١٢"
              subtitle="نسبة امتثال المواقع لكل بند — انقر على أي بند لعرض تفاصيله"
              action={
                <ExcelExportButton
                  onClick={() => handleExcelExport("clauses")}
                  loading={exportLoading === "clauses"}
                  label="تصدير البنود"
                />
              }
            />

            {/* Interactive Bar Chart */}
            <ClausesBarChart
              clauseData={clauseStats.data || []}
              onBarClick={(clause) => openPopup({
                clauseIndex: clause,
                title: `بند ${clause}: ${ARTICLE_12_CLAUSES[clause - 1]?.name}`,
                subtitle: `تفاصيل الامتثال للبند ${clause}`,
                icon: <FileCheck className="w-6 h-6 text-primary" />,
                gradient: "from-primary/20 to-primary/5",
              })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
              {(clauseStats.data || []).map((clause: any, idx: number) => (
                <PremiumClauseCard
                  key={clause.clause || idx}
                  clause={clause.clause || idx + 1}
                  name={clause.name || ARTICLE_12_CLAUSES[idx]?.name || `بند ${idx + 1}`}
                  compliant={clause.compliant || 0}
                  total={clause.total || 0}
                  percentage={clause.percentage ?? (clause.total > 0 ? Math.round((clause.compliant / clause.total) * 100) : 0)}
                  delay={idx * 0.08}
                  onClick={() => openPopup({
                    clauseIndex: clause.clause || idx + 1,
                    title: `بند ${clause.clause || idx + 1}: ${clause.name || ARTICLE_12_CLAUSES[idx]?.name}`,
                    subtitle: `${clause.compliant} موقع ممتثل من أصل ${clause.total}`,
                    icon: <FileCheck className="w-6 h-6 text-primary" />,
                    gradient: "from-primary/20 to-primary/5",
                  })}
                />
              ))}
            </div>
          </TabsContent>

          {/* ═══ TAB 3: By Sector Type ═══ */}
          <TabsContent value="sectors" className="space-y-8 mt-0">
            <SectionHeader
              icon={Building2}
              title="الامتثال حسب القطاع"
              action={
                <ExcelExportButton
                  onClick={() => handleExcelExport("sectors")}
                  loading={exportLoading === "sectors"}
                  label="تصدير القطاعات"
                />
              }
            />

            {["public", "private"].map((st, idx) => (
              <PremiumSectorCard
                key={st}
                sectorType={st}
                stats={sectorTypeData[st]}
                delay={idx * 0.15}
                onStatusClick={(status) => openPopup({
                  complianceStatus: status,
                  sectorType: st,
                  title: `${STATUS_LABELS[status]} — ${SECTOR_TYPE_LABELS[st]}`,
                  subtitle: `${STATUS_DESCRIPTIONS[status]} في ${SECTOR_TYPE_LABELS[st]}`,
                  icon: (() => {
                    const I = STATUS_ICONS[status];
                    return I ? <I className={`w-6 h-6 ${STATUS_TEXT[status]}`} /> : null;
                  })(),
                  gradient: `from-${st === "public" ? "blue" : "purple"}-500/20 to-transparent`,
                })}
                onExport={() => handleExcelExport("filtered", { sectorType: st, title: SECTOR_TYPE_LABELS[st] })}
              />
            ))}

            {/* Radar Chart for sector comparison */}
            <SectorRadarChart clausesBySector={clausesBySector} />

            {/* Clause comparison between sectors */}
            <div
            >
              <div className="rounded-3xl bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl border border-[#C5A55A]/10 dark:border-white/10 shadow-lg p-6">
                <SectionHeader
                  icon={Target}
                  title="مقارنة الامتثال بين القطاعين — بنود المادة ١٢"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 stagger-children">
                  {["public", "private"].map((st) => {
                    const clauseData = clausesBySector[st] || [];
                    const SIcon = SECTOR_TYPE_ICONS[st] || Building2;
                    const sGradient = st === "public" ? "from-blue-500 to-indigo-600" : "from-[oklch(0.48_0.14_290)] to-[oklch(0.55_0.14_270)]";
                    return (
                      <div key={st}>
                        <div className="flex items-center gap-3 mb-5">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sGradient} flex items-center justify-center shadow-lg`}
                          >
                            <SIcon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-black text-sm">{SECTOR_TYPE_LABELS[st]}</span>
                        </div>
                        <div className="space-y-3">
                          {clauseData.map((clause: any, idx: number) => {
                            const pct = clause.percentage ?? 0;
                            const barGradient = pct >= 70 ? "from-emerald-400 to-blue-800" : pct >= 40 ? "from-amber-400 to-orange-500" : "from-rose-400 to-red-500";
                            const textColor = pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-rose-400";
                            return (
                              <div
                                key={clause.clause || idx}
                                className="flex items-center gap-3"
                              >
                                <span className="text-xs font-black w-7 text-center text-muted-foreground bg-muted/30 rounded-lg py-1">{clause.clause}</span>
                                <div className="flex-1">
                                  <div className="h-2.5 bg-muted/20 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full bg-gradient-to-l ${barGradient}`}
                                      animate={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                                <span className={`text-xs font-black w-12 text-start ${textColor}`}>{pct}٪</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ TAB 4: By Category ═══ */}
          <TabsContent value="categories" className="space-y-8 mt-0">
            <SectionHeader
              icon={Layers}
              title="الامتثال حسب الفئة"
              action={
                <ExcelExportButton
                  onClick={() => handleExcelExport("categories")}
                  loading={exportLoading === "categories"}
                  label="تصدير الفئات"
                />
              }
            />

            {["public", "private"].map((st, stIdx) => {
              const SIcon = SECTOR_TYPE_ICONS[st] || Building2;
              const categories = categoryData[st] || [];
              if (categories.length === 0) return null;
              const sGradient = st === "public" ? "from-blue-500 to-indigo-600" : "from-[oklch(0.48_0.14_290)] to-[oklch(0.55_0.14_270)]";

              return (
                <div
                  key={st}
                >
                  <div className="rounded-3xl bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl border border-[#C5A55A]/10 dark:border-white/10 shadow-lg">
                    <div className="p-6 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sGradient} flex items-center justify-center shadow-xl ring-4 ring-white/10`}
                          >
                            <SIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black">{SECTOR_TYPE_LABELS[st]} — حسب الفئة</h4>
                            <p className="text-xs text-muted-foreground/80">
                              توزيع الامتثال لكل فئة ({categories.length} فئة) — انقر على أي فئة لعرض مواقعها
                            </p>
                          </div>
                        </div>
                        <ExcelExportButton
                          onClick={() => handleExcelExport("filtered", { sectorType: st, title: `${SECTOR_TYPE_LABELS[st]} - الفئات` })}
                          loading={exportLoading === "filtered"}
                          size="icon"
                        />
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
                        {categories.map((cat: any, idx: number) => (
                          <PremiumCategoryCard
                            key={cat.category || idx}
                            category={cat.category}
                            stats={cat}
                            delay={idx * 0.05}
                            onClick={() => openPopup({
                              classification: cat.category,
                              sectorType: st,
                              title: `${cat.category || "غير مصنف"} — ${SECTOR_TYPE_LABELS[st]}`,
                              subtitle: `مواقع فئة "${cat.category || "غير مصنف"}" في ${SECTOR_TYPE_LABELS[st]}`,
                              icon: <Layers className={`w-6 h-6 ${st === "public" ? "text-blue-500" : "text-primary"}`} />,
                              gradient: `from-${st === "public" ? "blue" : "purple"}-500/20 to-transparent`,
                            })}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
