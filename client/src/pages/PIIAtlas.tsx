/**
 * PII Atlas — أطلس البيانات الشخصية ومختبر الأنماط
 * Interactive treemap visualization of PII data types with charts
 * Inspired by platform.rasid.live/pii-atlas
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Database, Globe, Users, MapPin, AlertTriangle,
  ChevronDown, Filter, BarChart3, TrendingUp, Eye,
  Fingerprint, Mail, Phone, CreditCard, Home, FileText,
  User, Hash, Lock, Layers, Activity, Zap
} from "lucide-react";
import { RASID_CHARACTERS } from "@/lib/characters";

/* ─── PII Data Types ─── */
interface PIIType {
  id: string;
  nameAr: string;
  nameEn: string;
  count: number;
  sensitivity: "high" | "medium" | "low";
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const piiTypes: PIIType[] = [
  { id: "phone", nameAr: "رقم الهاتف", nameEn: "Phone Number", count: 378, sensitivity: "high", icon: Phone, color: "#10b981", bgColor: "rgba(16,185,129,0.15)" },
  { id: "national_id", nameAr: "الهوية الوطنية", nameEn: "National ID", count: 329, sensitivity: "high", icon: Fingerprint, color: "#f59e0b", bgColor: "rgba(245,158,11,0.15)" },
  { id: "email", nameAr: "البريد الإلكتروني", nameEn: "Email", count: 257, sensitivity: "high", icon: Mail, color: "#3b82f6", bgColor: "rgba(59,130,246,0.15)" },
  { id: "full_name", nameAr: "الاسم الكامل", nameEn: "Full Name", count: 190, sensitivity: "medium", icon: User, color: "#8b5cf6", bgColor: "rgba(139,92,246,0.15)" },
  { id: "iban", nameAr: "رقم الآيبان", nameEn: "IBAN", count: 117, sensitivity: "high", icon: Hash, color: "#ef4444", bgColor: "rgba(239,68,68,0.15)" },
  { id: "address", nameAr: "العنوان", nameEn: "Address", count: 98, sensitivity: "medium", icon: Home, color: "#06b6d4", bgColor: "rgba(6,182,212,0.15)" },
  { id: "unspecified", nameAr: "غير محدد", nameEn: "Unspecified", count: 85, sensitivity: "low", icon: FileText, color: "#6b7280", bgColor: "rgba(107,114,128,0.15)" },
  { id: "credit_card", nameAr: "بطاقة الائتمان", nameEn: "Credit Card", count: 41, sensitivity: "high", icon: CreditCard, color: "#ec4899", bgColor: "rgba(236,72,153,0.15)" },
  { id: "passport", nameAr: "رقم الجواز", nameEn: "Passport", count: 38, sensitivity: "high", icon: Globe, color: "#14b8a6", bgColor: "rgba(20,184,166,0.15)" },
  { id: "iqama", nameAr: "رقم الإقامة", nameEn: "Iqama", count: 32, sensitivity: "high", icon: Lock, color: "#f97316", bgColor: "rgba(249,115,22,0.15)" },
  { id: "dob", nameAr: "تاريخ الميلاد", nameEn: "Date of Birth", count: 28, sensitivity: "medium", icon: Activity, color: "#a855f7", bgColor: "rgba(168,85,247,0.15)" },
  { id: "salary", nameAr: "بيانات الراتب", nameEn: "Salary Data", count: 22, sensitivity: "high", icon: Zap, color: "#eab308", bgColor: "rgba(234,179,8,0.15)" },
  { id: "medical", nameAr: "سجلات طبية", nameEn: "Medical Records", count: 18, sensitivity: "high", icon: Shield, color: "#dc2626", bgColor: "rgba(220,38,38,0.15)" },
  { id: "vehicle", nameAr: "بيانات المركبات", nameEn: "Vehicle Data", count: 15, sensitivity: "medium", icon: Layers, color: "#0ea5e9", bgColor: "rgba(14,165,233,0.15)" },
];

/* ─── Summary Stats ─── */
const summaryStats = [
  { label: "إجمالي الحوادث", value: "728", icon: Shield, color: "#f59e0b" },
  { label: "ادعاء البائع", value: "336.1M", icon: Database, color: "#ef4444" },
  { label: "أنواع البيانات", value: "276", icon: Fingerprint, color: "#3b82f6" },
  { label: "القطاعات المتأثرة", value: "112", icon: Users, color: "#8b5cf6" },
  { label: "المناطق", value: "18", icon: MapPin, color: "#10b981" },
  { label: "مستويات مستوى التأثير", value: "4", icon: AlertTriangle, color: "#ec4899" },
];

/* ─── Sectors Data ─── */
const sectors = [
  { name: "القطاع المالي", count: 187, pct: 26 },
  { name: "الاتصالات", count: 142, pct: 19 },
  { name: "التجزئة", count: 118, pct: 16 },
  { name: "الحكومي", count: 96, pct: 13 },
  { name: "الصحي", count: 78, pct: 11 },
  { name: "التعليم", count: 54, pct: 7 },
  { name: "النقل", count: 32, pct: 4 },
  { name: "أخرى", count: 21, pct: 3 },
];

/* ─── Source Filter ─── */
type SourceFilter = "all" | "darkweb" | "telegram" | "paste";
const sourceFilters: { id: SourceFilter; label: string }[] = [
  { id: "all", label: "جميع المصادر" },
  { id: "darkweb", label: "دارك ويب" },
  { id: "telegram", label: "تليجرام" },
  { id: "paste", label: "مواقع اللصق" },
];

/* ─── Sensitivity Filter ─── */
type SensitivityFilter = "all" | "high" | "medium" | "low";

/* ─── Treemap Cell Component ─── */
function TreemapCell({ item, totalArea, index }: { item: PIIType; totalArea: number; index: number }) {
  const [hovered, setHovered] = useState(false);
  const pct = (item.count / totalArea) * 100;
  const Icon = item.icon;

  // Calculate relative size for the cell
  const minSize = 80;
  const maxSize = 220;
  const size = Math.max(minSize, Math.min(maxSize, (pct / 25) * maxSize));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300"
      style={{
        flex: `${pct} 1 ${size}px`,
        minWidth: `${minSize}px`,
        minHeight: `${minSize}px`,
        background: hovered
          ? `linear-gradient(135deg, ${item.color}30, ${item.color}15)`
          : item.bgColor,
        border: `2px solid ${hovered ? item.color : item.color + '40'}`,
        boxShadow: hovered ? `0 0 20px ${item.color}30, inset 0 0 30px ${item.color}10` : 'none',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center gap-1">
        <Icon
          className="transition-all duration-300"
          style={{ color: item.color, width: hovered ? 28 : 22, height: hovered ? 28 : 22 }}
        />
        <span className="font-bold text-sm leading-tight" style={{ color: item.color }}>
          {item.nameAr}
        </span>
        <span className="text-xs opacity-70" style={{ color: item.color }}>
          {item.count}
        </span>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs sm:text-[10px] opacity-60 mt-0.5"
            style={{ color: item.color }}
          >
            {item.nameEn}
          </motion.div>
        )}
      </div>
      {/* Scan line effect on hover */}
      {hovered && (
        <motion.div
          className="absolute inset-x-0 h-px opacity-40"
          style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

/* ─── Horizontal Bar Chart ─── */
function HorizontalBarChart({ data }: { data: typeof sectors }) {
  const maxCount = Math.max(...data.map(d => d.count));
  return (
    <div className="overflow-x-hidden max-w-full space-y-3">
      {data.map((sector, i) => (
        <motion.div
          key={sector.name}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3"
        >
          <span className="text-xs text-muted-foreground w-24 text-left shrink-0">{sector.name}</span>
          <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${(sector.count / maxCount) * 100}%` }}
              transition={{ delay: i * 0.08 + 0.3, duration: 0.8, ease: "easeOut" }}
              style={{
                background: `linear-gradient(90deg, rgba(212,175,55,0.6), rgba(212,175,55,0.3))`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            </motion.div>
          </div>
          <span className="text-xs font-mono text-amber-400/80 w-10 text-left">{sector.count}</span>
          <span className="text-xs sm:text-[10px] text-muted-foreground w-8">{sector.pct}%</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Sensitivity Distribution Chart ─── */
function SensitivityChart({ data }: { data: PIIType[] }) {
  const high = data.filter(d => d.sensitivity === "high").length;
  const medium = data.filter(d => d.sensitivity === "medium").length;
  const low = data.filter(d => d.sensitivity === "low").length;
  const total = data.length;
  const bars = [
    { label: "عالية الحساسية", count: high, color: "#ef4444", pct: Math.round((high / total) * 100) },
    { label: "متوسطة", count: medium, color: "#f59e0b", pct: Math.round((medium / total) * 100) },
    { label: "منخفضة", count: low, color: "#10b981", pct: Math.round((low / total) * 100) },
  ];
  const maxCount = Math.max(...bars.map(b => b.count));

  return (
    <div className="flex items-end justify-center gap-4 sm:gap-8 h-40">
      {bars.map((bar, i) => (
        <div key={bar.label} className="flex flex-col items-center gap-2">
          <span className="text-xs font-mono" style={{ color: bar.color }}>{bar.count}</span>
          <motion.div
            className="w-14 rounded-t-lg relative overflow-hidden"
            initial={{ height: 0 }}
            animate={{ height: `${(bar.count / maxCount) * 120}px` }}
            transition={{ delay: i * 0.2, duration: 0.8 }}
            style={{ background: `linear-gradient(180deg, ${bar.color}, ${bar.color}60)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10" />
          </motion.div>
          <span className="text-xs sm:text-[10px] text-muted-foreground text-center leading-tight">{bar.label}</span>
          <span className="text-xs sm:text-[10px] opacity-50">{bar.pct}%</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Timeline Chart ─── */
function TimelineChart() {
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const incidents = [42, 38, 55, 61, 48, 72, 85, 67, 93, 78, 52, 37];
  const maxVal = Math.max(...incidents);

  return (
    <div className="flex items-end gap-1.5 h-32 px-2">
      {months.map((month, i) => (
        <div key={month} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            className="w-full rounded-t-sm relative overflow-hidden cursor-pointer group"
            initial={{ height: 0 }}
            animate={{ height: `${(incidents[i] / maxVal) * 100}px` }}
            transition={{ delay: i * 0.05, duration: 0.6 }}
            style={{
              background: `linear-gradient(180deg, rgba(212,175,55,0.7), rgba(212,175,55,0.2))`,
            }}
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {incidents[i]}
            </div>
          </motion.div>
          <span className="text-[8px] text-muted-foreground rotate-0 leading-none">{month.slice(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
export default function PIIAtlas() {
  const [sensitivityFilter, setSensitivityFilter] = useState<SensitivityFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [activeSection, setActiveSection] = useState<"hero" | "atlas" | "patterns" | "timeline">("hero");
  const [selectedPII, setSelectedPII] = useState<PIIType | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const atlasRef = useRef<HTMLDivElement>(null);
  const patternsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const filteredPII = useMemo(() => {
    return piiTypes.filter(p => {
      if (sensitivityFilter !== "all" && p.sensitivity !== sensitivityFilter) return false;
      return true;
    });
  }, [sensitivityFilter]);

  const totalCount = filteredPII.reduce((sum, p) => sum + p.count, 0);

  const highCount = piiTypes.filter(p => p.sensitivity === "high").length;
  const medCount = piiTypes.filter(p => p.sensitivity === "medium").length;
  const lowCount = piiTypes.filter(p => p.sensitivity === "low").length;

  const scrollToSection = (section: typeof activeSection) => {
    setActiveSection(section);
    const refs = { hero: heroRef, atlas: atlasRef, patterns: patternsRef, timeline: timelineRef };
    refs[section]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ─── Side Navigation Tabs ─── */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 max-md:hidden">
        {[
          { id: "hero" as const, label: "البداية" },
          { id: "atlas" as const, label: "الأطلس" },
          { id: "patterns" as const, label: "الأنماط" },
          { id: "timeline" as const, label: "الزمني" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => scrollToSection(tab.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 backdrop-blur-sm border ${
              activeSection === tab.id
                ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-lg shadow-amber-500/10"
                : "bg-card/50 border-border/30 text-muted-foreground hover:text-foreground hover:border-amber-500/30"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Hero Section ─── */}
      <div ref={heroRef} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,175,55,0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 50%, rgba(59,130,246,0.1) 0%, transparent 50%)`,
          }} />
        </div>

        <div className="relative z-10 p-3 sm:p-8 md:p-12 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">PII Atlas</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              background: "linear-gradient(135deg, #d4af37, #f5e6a3, #d4af37, #b8860b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            أطلس البيانات الشخصية ومختبر الأنماط
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm mb-8 max-w-xl mx-auto"
          >
            رصد وتحليل حالات الرصد الشخصية في المملكة العربية السعودية
          </motion.p>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {summaryStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="glass-card p-4 rounded-xl cursor-pointer hover:scale-105 transition-transform group"
                  style={{ borderColor: stat.color + '30' }}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: stat.color }} />
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs sm:text-[10px] text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <Button
              variant="outline"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              onClick={() => scrollToSection("atlas")}
            >
              استكشف الأطلس
              <ChevronDown className="w-4 h-4 mr-2 animate-bounce" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ─── Atlas Section: Treemap ─── */}
      <div ref={atlasRef} className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 px-3 py-1">
              <Database className="w-3.5 h-3.5 ml-1.5" />
              PII Atlas
            </Badge>
            <h2 className="text-2xl font-bold bg-gradient-to-l from-amber-400 to-amber-200 bg-clip-text text-transparent">
              أطلس البيانات الشخصية
            </h2>
          </div>

          {/* Sensitivity Filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "all" as const, label: "الكل" },
              { id: "high" as const, label: `عالية الحساسية(${highCount})` },
              { id: "medium" as const, label: `متوسطة(${medCount})` },
              { id: "low" as const, label: `منخفضة(${lowCount})` },
            ].map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={sensitivityFilter === f.id ? "default" : "outline"}
                className={sensitivityFilter === f.id
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30"
                  : "border-border/50 text-muted-foreground hover:border-amber-500/30"
                }
                onClick={() => setSensitivityFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Treemap Visualization */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3" style={{ minHeight: "300px" }}>
              <AnimatePresence mode="popLayout">
                {filteredPII.map((item, i) => (
                  <TreemapCell key={item.id} item={item} totalArea={totalCount} index={i} />
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Source Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {sourceFilters.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={sourceFilter === f.id ? "default" : "ghost"}
              className={sourceFilter === f.id
                ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                : "text-muted-foreground hover:text-foreground"
              }
              onClick={() => setSourceFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ─── Charts Section ─── */}
      <div ref={patternsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sensitivity Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              توزيع الحساسية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SensitivityChart data={piiTypes} />
          </CardContent>
        </Card>

        {/* Most Exposed Sectors */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              أكثر القطاعات تعرضاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={sectors} />
          </CardContent>
        </Card>
      </div>

      {/* ─── Timeline Section ─── */}
      <div ref={timelineRef}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              الحوادث عبر الزمن — 2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimelineChart />
          </CardContent>
        </Card>
      </div>

      {/* ─── Rasid Character Watermark ─── */}
      <div className="flex justify-center opacity-30 pointer-events-none">
        <img src={RASID_CHARACTERS.sunglasses} alt="Rasid" className="w-20 h-20 object-contain" />
      </div>

      {/* ─── Compare Patterns CTA ─── */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/20"
          onClick={() => {
            import("sonner").then(({ toast }) => toast.info("مقارنة الأنماط — قريباً"));
          }}
        >
          <Eye className="w-4 h-4 ml-2" />
          مقارنة الأنماط
        </Button>
      </div>
    </div>
  );
}
