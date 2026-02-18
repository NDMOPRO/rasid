/**
 * Home — Rasid Lux Ultra Premium Dashboard
 * Matching pdpl-old reference with gold/silver dual skin
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Eye, Globe, Users, FileText, AlertTriangle,
  Search, Database, BarChart3, TrendingUp, TrendingDown,
  Activity, Radio, Building2, Menu, Bell, X,
  Lock, Fingerprint, Scale, BookOpen, Crosshair,
  ChevronLeft, ChevronRight, RefreshCw
} from "lucide-react";
import { useSkin, type Skin } from "@/hooks/useSkin";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { LOGOS, CHARACTERS } from "@/lib/assets";
import PremiumCard from "@/components/PremiumCard";
import ParticleField from "@/components/ParticleField";
import MiniSparkline from "@/components/MiniSparkline";
import Sidebar from "@/components/Sidebar";

/* ═══ Animated Number ═══ */
function AnimatedNumber({ value }: { value: number }) {
  const display = useAnimatedNumber(value, 1200);
  return <>{display.toLocaleString("ar-SA")}</>;
}

/* ═══ Section Header ═══ */
function SectionHeader({ icon: Icon, title, subtitle, action, onAction }: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="icon-box">
          <Icon />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="text-[9px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {action && (
        <button onClick={onAction} className="text-[11px] text-[var(--skin-text)] hover:underline font-medium">
          {action}
        </button>
      )}
    </div>
  );
}

/* ═══ KPI DATA ═══ */
const goldKPIs = [
  { key: "total", label: "إجمالي التسريبات", labelEn: "Total Leaks", value: 12847, trend: "+12%", trendUp: true, trendLabel: "من الشهر الماضي", icon: Database, gradient: "from-amber-500/10 to-amber-700/5", iconBg: "bg-amber-500/15", iconColor: "text-amber-400", glowColor: "rgba(212,175,55,0.15)", sparkColor: "#D4AF37", sparkData: [3, 5, 4, 7, 6, 8, 9] },
  { key: "critical", label: "تسريبات حرجة", labelEn: "Critical Leaks", value: 342, trend: "-8%", trendUp: false, trendLabel: "تحسن", icon: AlertTriangle, gradient: "from-red-500/10 to-red-700/5", iconBg: "bg-red-500/15", iconColor: "text-red-400", glowColor: "rgba(239,68,68,0.15)", sparkColor: "#ef4444", sparkData: [8, 6, 7, 5, 4, 3, 2] },
  { key: "darkweb", label: "رصد الدارك ويب", labelEn: "Dark Web Monitoring", value: 1893, trend: "+23%", trendUp: true, trendLabel: "نشاط متزايد", icon: Globe, gradient: "from-purple-500/10 to-purple-700/5", iconBg: "bg-purple-500/15", iconColor: "text-purple-400", glowColor: "rgba(168,85,247,0.15)", sparkColor: "#a855f7", sparkData: [2, 4, 3, 6, 5, 8, 9] },
  { key: "resolved", label: "تم المعالجة", labelEn: "Resolved", value: 9621, trend: "+31%", trendUp: true, trendLabel: "معدل حل ممتاز", icon: Shield, gradient: "from-emerald-500/10 to-emerald-700/5", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", glowColor: "rgba(16,185,129,0.15)", sparkColor: "#10b981", sparkData: [4, 5, 6, 7, 8, 9, 10] },
  { key: "sources", label: "مصادر الرصد", labelEn: "Monitoring Sources", value: 156, trend: "+5", trendUp: true, trendLabel: "مصدر جديد", icon: Radio, gradient: "from-cyan-500/10 to-cyan-700/5", iconBg: "bg-cyan-500/15", iconColor: "text-cyan-400", glowColor: "rgba(6,182,212,0.15)", sparkColor: "#06b6d4", sparkData: [5, 6, 5, 7, 6, 7, 8] },
  { key: "threats", label: "تهديدات نشطة", labelEn: "Active Threats", value: 47, trend: "-15%", trendUp: false, trendLabel: "انخفاض", icon: Crosshair, gradient: "from-orange-500/10 to-orange-700/5", iconBg: "bg-orange-500/15", iconColor: "text-orange-400", glowColor: "rgba(249,115,22,0.15)", sparkColor: "#f97316", sparkData: [9, 7, 8, 6, 5, 4, 3] },
  { key: "sectors", label: "القطاعات المتأثرة", labelEn: "Affected Sectors", value: 23, trend: "+2", trendUp: true, trendLabel: "قطاع جديد", icon: Building2, gradient: "from-blue-500/10 to-blue-700/5", iconBg: "bg-blue-500/15", iconColor: "text-blue-400", glowColor: "rgba(59,130,246,0.15)", sparkColor: "#3b82f6", sparkData: [3, 4, 5, 4, 5, 6, 6] },
  { key: "users", label: "المستخدمين النشطين", labelEn: "Active Users", value: 89, trend: "+12", trendUp: true, trendLabel: "مستخدم جديد", icon: Users, gradient: "from-pink-500/10 to-pink-700/5", iconBg: "bg-pink-500/15", iconColor: "text-pink-400", glowColor: "rgba(236,72,153,0.15)", sparkColor: "#ec4899", sparkData: [4, 5, 6, 7, 8, 9, 10] },
];

const silverKPIs = [
  { key: "policies", label: "السياسات المفعّلة", labelEn: "Active Policies", value: 48, trend: "+6", trendUp: true, trendLabel: "سياسة جديدة", icon: FileText, gradient: "from-slate-400/10 to-slate-600/5", iconBg: "bg-slate-400/15", iconColor: "text-slate-300", glowColor: "rgba(168,180,200,0.15)", sparkColor: "#A8B4C8", sparkData: [3, 4, 5, 6, 7, 8, 9] },
  { key: "compliance", label: "نسبة الامتثال", labelEn: "Compliance Rate", value: 94, displayValue: "94%", trend: "+3%", trendUp: true, trendLabel: "تحسن", icon: Shield, gradient: "from-emerald-500/10 to-emerald-700/5", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", glowColor: "rgba(16,185,129,0.15)", sparkColor: "#10b981", sparkData: [85, 87, 89, 91, 92, 93, 94] },
  { key: "dpia", label: "تقييمات الأثر", labelEn: "Impact Assessments", value: 127, trend: "+18", trendUp: true, trendLabel: "تقييم جديد", icon: Scale, gradient: "from-violet-500/10 to-violet-700/5", iconBg: "bg-violet-500/15", iconColor: "text-violet-400", glowColor: "rgba(139,92,246,0.15)", sparkColor: "#8b5cf6", sparkData: [5, 6, 7, 8, 9, 10, 11] },
  { key: "requests", label: "طلبات حقوق الأفراد", labelEn: "Individual Rights", value: 234, trend: "+42", trendUp: true, trendLabel: "طلب جديد", icon: Fingerprint, gradient: "from-cyan-500/10 to-cyan-700/5", iconBg: "bg-cyan-500/15", iconColor: "text-cyan-400", glowColor: "rgba(6,182,212,0.15)", sparkColor: "#06b6d4", sparkData: [8, 9, 10, 11, 12, 13, 14] },
  { key: "processing", label: "سجلات المعالجة", labelEn: "Processing Records", value: 1456, trend: "+89", trendUp: true, trendLabel: "سجل جديد", icon: BookOpen, gradient: "from-amber-500/10 to-amber-700/5", iconBg: "bg-amber-500/15", iconColor: "text-amber-400", glowColor: "rgba(245,158,11,0.15)", sparkColor: "#f59e0b", sparkData: [6, 7, 8, 9, 10, 11, 12] },
  { key: "breaches", label: "حوادث الخصوصية", labelEn: "Privacy Incidents", value: 12, trend: "-5", trendUp: false, trendLabel: "انخفاض", icon: AlertTriangle, gradient: "from-red-500/10 to-red-700/5", iconBg: "bg-red-500/15", iconColor: "text-red-400", glowColor: "rgba(239,68,68,0.15)", sparkColor: "#ef4444", sparkData: [18, 15, 14, 13, 12, 11, 12] },
  { key: "training", label: "التدريب والتوعية", labelEn: "Training", value: 312, trend: "+28", trendUp: true, trendLabel: "موظف مدرب", icon: Users, gradient: "from-blue-500/10 to-blue-700/5", iconBg: "bg-blue-500/15", iconColor: "text-blue-400", glowColor: "rgba(59,130,246,0.15)", sparkColor: "#3b82f6", sparkData: [5, 6, 7, 8, 9, 10, 11] },
  { key: "audits", label: "عمليات التدقيق", labelEn: "Audits", value: 36, trend: "+4", trendUp: true, trendLabel: "تدقيق جديد", icon: Search, gradient: "from-teal-500/10 to-teal-700/5", iconBg: "bg-teal-500/15", iconColor: "text-teal-400", glowColor: "rgba(20,184,166,0.15)", sparkColor: "#14b8a6", sparkData: [3, 4, 5, 4, 5, 6, 7] },
];

/* ═══ Table Data ═══ */
const goldTableData = [
  { id: 1, source: "الدارك ويب", type: "بيانات مالية", severity: "حرج", status: "قيد المعالجة", date: "2026-02-15" },
  { id: 2, source: "تيليجرام", type: "بيانات شخصية", severity: "عالي", status: "تم الحل", date: "2026-02-14" },
  { id: 3, source: "منتديات", type: "بيانات دخول", severity: "متوسط", status: "جديد", date: "2026-02-13" },
  { id: 4, source: "Paste Sites", type: "بريد إلكتروني", severity: "منخفض", status: "تم الحل", date: "2026-02-12" },
  { id: 5, source: "الدارك ويب", type: "وثائق سرية", severity: "حرج", status: "قيد المعالجة", date: "2026-02-11" },
];

const silverTableData = [
  { id: 1, source: "نظام HR", type: "بيانات موظفين", severity: "عالي", status: "مفتوح", date: "2026-02-15" },
  { id: 2, source: "CRM", type: "بيانات عملاء", severity: "متوسط", status: "مغلق", date: "2026-02-14" },
  { id: 3, source: "البريد", type: "مراسلات", severity: "منخفض", status: "قيد المراجعة", date: "2026-02-13" },
  { id: 4, source: "التخزين السحابي", type: "وثائق مالية", severity: "عالي", status: "مفتوح", date: "2026-02-12" },
  { id: 5, source: "قاعدة البيانات", type: "سجلات طبية", severity: "حرج", status: "مغلق", date: "2026-02-11" },
];

/* ═══ Chart Data ═══ */
const monthlyData = [
  { month: "يناير", value: 420 },
  { month: "فبراير", value: 580 },
  { month: "مارس", value: 350 },
  { month: "أبريل", value: 720 },
  { month: "مايو", value: 650 },
  { month: "يونيو", value: 890 },
];

/* ═══ Status Cards ═══ */
const statusCards = [
  { label: "جديد", labelEn: "New", value: 156, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", glow: "rgba(245,158,11,0.1)" },
  { label: "قيد المعالجة", labelEn: "In Progress", value: 89, icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10", glow: "rgba(59,130,246,0.1)" },
  { label: "تم الحل", labelEn: "Resolved", value: 342, icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "rgba(16,185,129,0.1)" },
  { label: "مغلق", labelEn: "Closed", value: 1205, icon: Lock, color: "text-slate-400", bg: "bg-slate-500/10", glow: "rgba(148,163,184,0.1)" },
];

/* ═══ Severity Badge ═══ */
function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    "حرج": "bg-red-500/15 text-red-400 border-red-500/20",
    "عالي": "bg-orange-500/15 text-orange-400 border-orange-500/20",
    "متوسط": "bg-amber-500/15 text-amber-400 border-amber-500/20",
    "منخفض": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${colors[severity] || "bg-slate-500/15 text-slate-400 border-slate-500/20"}`}>
      {severity}
    </span>
  );
}

/* ═══ Simple Bar Chart ═══ */
function BarChart({ data, skin }: { data: { month: string; value: number }[]; skin: Skin }) {
  const max = Math.max(...data.map(d => d.value));
  const barColor = skin === "gold" ? "#D4AF37" : "#A8B4C8";
  const barColorLight = skin === "gold" ? "rgba(212,175,55,0.3)" : "rgba(168,180,200,0.3)";

  return (
    <div className="flex items-end gap-3 h-48 px-2">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              className="w-full rounded-t-lg relative overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${barColor}, ${barColorLight})`,
                boxShadow: `0 0 12px ${barColorLight}`,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* Shine strip */}
              <div
                className="absolute top-0 left-0 w-1/3 h-full"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }}
              />
            </motion.div>
            <span className="text-[10px] text-muted-foreground">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN HOME PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { skin, setSkin } = useSkin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const kpis = skin === "gold" ? goldKPIs : silverKPIs;
  const tableData = skin === "gold" ? goldTableData : silverTableData;

  return (
    <div className="min-h-screen bg-[#0D1529] aurora-bg dot-grid">
      {/* Particle Background */}
      <ParticleField skin={skin} count={35} />

      {/* Sidebar */}
      <Sidebar skin={skin} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:mr-[280px] min-h-screen relative z-10">
        {/* TopBar */}
        <header className="glass-topbar sticky top-0 z-30 px-4 lg:px-6 py-3 flex items-center gap-4">
          {/* Mobile menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Workspace Switcher */}
          <div className="workspace-switcher">
            <button
              onClick={() => setSkin("gold")}
              className={`workspace-btn ${skin === "gold" ? "active" : ""}`}
            >
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                الرصد
              </span>
            </button>
            <button
              onClick={() => setSkin("silver")}
              className={`workspace-btn ${skin === "silver" ? "active" : ""}`}
            >
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                الخصوصية
              </span>
            </button>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث..."
                className="glass-input pr-10 pl-4 py-2 rounded-xl text-sm w-64"
              />
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 status-breathing" />
          </button>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 space-y-6 page-transition-enter">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {skin === "gold" ? "لوحة تحكم الرصد" : "لوحة تحكم الخصوصية"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {skin === "gold" ? "Monitoring Dashboard" : "Privacy Dashboard"}
              </p>
            </div>
            <motion.img
              src={CHARACTERS.armsCrossed}
              alt="راصد"
              className="h-16 object-contain character-float hidden sm:block"
              style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
            />
          </motion.div>

          {/* ═══ KPI CARDS ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((card, idx) => {
              const Icon = card.icon;
              return (
                <PremiumCard key={card.key} delay={idx * 0.08} className="group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 pointer-events-none`} />
                  <div className="relative p-5">
                    {/* Top: trend + icon */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${card.trendUp ? "text-emerald-400" : "text-red-400"}`}>{card.trend}</span>
                        {card.trendUp ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                        <span className="text-[9px] text-muted-foreground">{card.trendLabel}</span>
                      </div>
                      <motion.div
                        className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}
                        style={{ boxShadow: `0 0 16px ${card.glowColor}` }}
                        whileHover={{ rotate: -8, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className={`w-5 h-5 ${card.iconColor}`} />
                      </motion.div>
                    </div>

                    {/* Value */}
                    <div className="kpi-number premium-stat-enter">
                      {(card as any).displayValue ? String((card as any).displayValue) : <AnimatedNumber value={card.value} />}
                    </div>

                    {/* Label */}
                    <p className="text-xs text-muted-foreground mb-0.5">{card.label}</p>
                    <p className="text-[9px] text-muted-foreground/60">{card.labelEn}</p>

                    {/* Sparkline */}
                    <div className="mt-3">
                      <MiniSparkline data={card.sparkData} color={card.sparkColor} />
                    </div>

                    {/* Click hint */}
                    <p className="text-[9px] text-[var(--skin-text)]/40 mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Eye className="w-3 h-3" /> اضغط لعرض التفاصيل
                    </p>
                  </div>
                </PremiumCard>
              );
            })}
          </div>

          {/* ═══ SECOND ROW: Status + Chart ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Cards */}
            <PremiumCard delay={0.35}>
              <div className="p-5">
                <SectionHeader icon={Activity} title="حالة الحوادث" subtitle="Incident Status" />
                <div className="grid grid-cols-2 gap-3">
                  {statusCards.map((sc) => {
                    const SIcon = sc.icon;
                    return (
                      <motion.div
                        key={sc.label}
                        className={`p-4 rounded-xl ${sc.bg} border border-transparent hover:border-white/10 transition-all`}
                        style={{ boxShadow: `0 0 12px ${sc.glow}` }}
                        whileHover={{ scale: 1.03, y: -2 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <motion.div whileHover={{ rotate: -10 }}>
                            <SIcon className={`w-4.5 h-4.5 ${sc.color}`} />
                          </motion.div>
                          <span className="text-[11px] text-muted-foreground font-medium">{sc.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground"><AnimatedNumber value={sc.value} /></p>
                        <p className="text-[9px] text-muted-foreground/60 mt-0.5">{sc.labelEn}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </PremiumCard>

            {/* Bar Chart */}
            <PremiumCard delay={0.4}>
              <div className="p-5">
                <SectionHeader icon={BarChart3} title="التسريبات الشهرية" subtitle="Monthly Leaks" />
                <BarChart data={monthlyData} skin={skin} />
              </div>
            </PremiumCard>
          </div>

          {/* ═══ THIRD ROW: Table ═══ */}
          <PremiumCard delay={0.5}>
            <div className="p-5">
              <SectionHeader
                icon={skin === "gold" ? Database : FileText}
                title={skin === "gold" ? "آخر التسريبات المكتشفة" : "آخر سجلات المعالجة"}
                subtitle={skin === "gold" ? "Latest Detected Leaks" : "Latest Processing Records"}
                action="عرض الكل"
              />
              <div className="overflow-x-auto rounded-xl">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>المصدر</th>
                      <th>النوع</th>
                      <th>الخطورة</th>
                      <th>الحالة</th>
                      <th>التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row) => (
                      <tr key={row.id}>
                        <td className="font-mono text-[var(--skin-text)]">{row.id}</td>
                        <td>{row.source}</td>
                        <td>{row.type}</td>
                        <td><SeverityBadge severity={row.severity} /></td>
                        <td>
                          <span className="text-xs font-medium">{row.status}</span>
                        </td>
                        <td className="font-mono text-xs">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </PremiumCard>

          {/* ═══ FOURTH ROW: Buttons + Inputs Demo ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PremiumCard delay={0.6}>
              <div className="p-5">
                <SectionHeader icon={Activity} title="الأزرار" subtitle="Buttons" />
                <div className="flex flex-wrap gap-3">
                  <button className="glass-btn-primary hover-shine">زر رئيسي</button>
                  <button className="glass-btn-secondary">زر ثانوي</button>
                  <button className="glass-btn-primary hover-shine flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    بحث متقدم
                  </button>
                  <button className="glass-btn-secondary flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    تصدير التقرير
                  </button>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard delay={0.65}>
              <div className="p-5">
                <SectionHeader icon={Search} title="حقول الإدخال" subtitle="Input Fields" />
                <div className="space-y-3">
                  <input type="text" placeholder="البحث عن تسريب..." className="glass-input w-full px-4 py-2.5 rounded-xl text-sm" />
                  <input type="text" placeholder="البريد الإلكتروني..." className="glass-input w-full px-4 py-2.5 rounded-xl text-sm" />
                  <div className="flex gap-3">
                    <input type="text" placeholder="من تاريخ..." className="glass-input flex-1 px-4 py-2.5 rounded-xl text-sm" />
                    <input type="text" placeholder="إلى تاريخ..." className="glass-input flex-1 px-4 py-2.5 rounded-xl text-sm" />
                  </div>
                </div>
              </div>
            </PremiumCard>
          </div>

          {/* ═══ Assistant Card ═══ */}
          <PremiumCard delay={0.7}>
            <div className="p-5 flex items-center gap-4">
              <motion.img
                src={CHARACTERS.waving}
                alt="مساعد راصد"
                className="h-20 object-contain character-breathe"
                style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">مساعد راصد الذكي</h3>
                <p className="text-sm text-muted-foreground">
                  {skin === "gold"
                    ? "مرحباً! أنا مساعد راصد الذكي. أراقب التهديدات والتسريبات على مدار الساعة وأنبهك فوراً عند اكتشاف أي نشاط مشبوه."
                    : "مرحباً! أنا مساعد راصد للخصوصية. أساعدك في إدارة سياسات الخصوصية والامتثال لنظام حماية البيانات الشخصية."
                  }
                </p>
              </div>
              <button className="glass-btn-primary hover-shine text-sm">
                تحدث مع راصد
              </button>
            </div>
          </PremiumCard>

        </main>
      </div>
    </div>
  );
}
