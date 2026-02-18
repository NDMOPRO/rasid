/**
 * NationalOverview — النظرة الوطنية
 * Matches breachdash design: KPI cards, severity distribution, sector analysis,
 * leak methods, leak platforms, and quick navigation cards
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldAlert, Database, AlertTriangle, DollarSign,
  Shield, Globe, Target, Users, Fingerprint, BarChart3,
  TrendingUp, TrendingDown, Equal, ArrowUpRight,
  ScanSearch, Network, CalendarClock, UserX, Map, Link2,
  Crosshair, ScrollText, Brain, FileBarChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { breachRecords, totalIncidents, totalRecordsExposed } from "@/lib/breachData";
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";
import { Link } from "wouter";

/* ─── helpers ─── */
function fmt(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString("en-US");
}

const severityColors: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Medium: "#3b82f6",
  Low: "#22c55e",
};

const severityLabels: Record<string, string> = {
  Critical: "عالي الأهمية",
  High: "مرتفع",
  Medium: "متوسط",
  Low: "منخفض",
};

/* ─── animation variants ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function NationalOverview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { filteredRecords } = useFilters();
  const records = filteredRecords;

  /* ─── KPI computations ─── */
  const stats = useMemo(() => {
    const total = records.length;
    const exposed = records.reduce((s, r) => s + (r.overview?.exposed_records || 0), 0);
    const critical = records.filter(r => r.overview?.severity === "Critical").length;
    const totalPrice = records.reduce((s, r) => s + ((r as any).attacker_info?.price_usd || 0), 0);
    const ransomware = records.filter(r => r.category === "Ransomware").length;
    const dataBreach = records.filter(r => r.category === "Data Breach").length;
    const highSev = records.filter(r => r.overview?.severity === "High").length;
    const sectors = new Set(records.map(r => r.sector).filter(Boolean));
    const dataTypes = new Set(records.flatMap(r => r.data_types || []));
    const avgConf = records.reduce((s, r) => s + ((r as any).ai_analysis?.confidence_percentage || 0), 0) / Math.max(total, 1);
    return { total, exposed, critical, totalPrice, ransomware, dataBreach, highSev, sectors: sectors.size, dataTypes: dataTypes.size, avgConf: Math.round(avgConf) };
  }, [records]);

  /* ─── Severity distribution ─── */
  const severityData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const sev = r.overview?.severity || "Unknown";
      counts[sev] = (counts[sev] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / Math.max(records.length, 1)) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  /* ─── Top sectors ─── */
  const topSectors = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const s = r.sector;
      if (s) counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [records]);

  /* ─── Leak methods ─── */
  const leakMethods = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const m = r.category || "غير محدد";
      counts[m] = (counts[m] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  /* ─── Leak platforms ─── */
  const leakPlatforms = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const p = r.overview?.source_platform || "غير محدد";
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  /* ─── Quick nav cards ─── */
  const quickNav = [
    { label: "تشريح حالات الرصد", labelEn: "Leak Anatomy", icon: ScanSearch, path: "/leak-anatomy", color: "#3DB1AC" },
    { label: "القطاعات المتضررة", labelEn: "Affected Sectors", icon: Network, path: "/sector-analysis", color: "#6459A7" },
    { label: "الخط الزمني", labelEn: "Timeline", icon: CalendarClock, path: "/leak-timeline", color: "#f59e0b" },
    { label: "مصادر حالة الرصد", labelEn: "Threat Actors", icon: UserX, path: "/threat-actors-analysis", color: "#ef4444" },
    { label: "التحليل الجغرافي", labelEn: "Geo Analysis", icon: Map, path: "/geo-analysis", color: "#3b82f6" },
    { label: "سجل الحالات", labelEn: "Registry", icon: ScrollText, path: "/incidents-registry", color: "#22c55e" },
  ];

  const mainKpis = [
    { label: "إجمالي الحوادث", labelEn: "Total Incidents", value: stats.total, icon: ShieldAlert, color: "#ef4444" },
    { label: "ادعاء البائع", labelEn: "ادعاء البائع", value: fmt(stats.exposed), icon: Database, color: "#3DB1AC" },
    { label: "حوادث عالية الأهمية", labelEn: "Critical Incidents", value: stats.critical, icon: AlertTriangle, color: "#f59e0b" },
    { label: "إجمالي السعر المطلوب", labelEn: "Total Asking Price", value: "$" + fmt(stats.totalPrice), icon: DollarSign, color: "#6459A7" },
  ];

  const miniStats = [
    { label: "حالات رصد فدية", value: stats.ransomware, icon: Target, color: "#ef4444" },
    { label: "حالة رصد بيانات", value: stats.dataBreach, icon: Globe, color: "#3b82f6" },
    { label: "مرتفعة مستوى التأثير", value: stats.highSev, icon: Shield, color: "#f59e0b" },
    { label: "قطاعات متأثرة", value: stats.sectors, icon: Users, color: "#22c55e" },
    { label: "أنواع بيانات", value: stats.dataTypes, icon: Fingerprint, color: "#6459A7" },
    { label: "ثقة التحليل", value: stats.avgConf + "%", icon: BarChart3, color: "#3DB1AC" },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <GlobalFilterBar />

      {/* Page Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">النظرة الوطنية</h1>
        <p className="text-sm text-muted-foreground mt-1">National Overview</p>
      </div>

      {/* ═══ Main KPI Cards ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainKpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
              <Card className={`relative overflow-hidden border ${isDark ? "border-[rgba(61,177,172,0.15)] bg-[rgba(13,21,41,0.6)]" : "border-[#e2e5ef] bg-white"} backdrop-blur-xl`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                      <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                  <p className="text-[10px] text-muted-foreground/60">{kpi.labelEn}</p>
                </CardContent>
                {/* Decorative gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${kpi.color}, transparent)` }} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ═══ Mini Stat Cards ═══ */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {miniStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} custom={i + 4} variants={cardVariants} initial="hidden" animate="visible">
              <Card className={`text-center border ${isDark ? "border-[rgba(61,177,172,0.1)] bg-[rgba(13,21,41,0.4)]" : "border-[#e2e5ef] bg-white/80"} backdrop-blur-sm`}>
                <CardContent className="p-4">
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ═══ Charts Grid ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <motion.div custom={10} variants={cardVariants} initial="hidden" animate="visible">
          <Card className={`border ${isDark ? "border-[rgba(61,177,172,0.15)] bg-[rgba(13,21,41,0.6)]" : "border-[#e2e5ef] bg-white"} backdrop-blur-xl`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#3DB1AC]" />
                توزيع مستوى التأثير
                <span className="text-[10px] text-muted-foreground font-normal">Severity Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {severityData.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{severityLabels[item.name] || item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{item.count}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5" style={{ borderColor: severityColors[item.name], color: severityColors[item.name] }}>
                        {item.pct}%
                      </Badge>
                    </div>
                  </div>
                  <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-100"}`}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: severityColors[item.name] || "#6b7280" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Affected Sectors */}
        <motion.div custom={11} variants={cardVariants} initial="hidden" animate="visible">
          <Card className={`border ${isDark ? "border-[rgba(61,177,172,0.15)] bg-[rgba(13,21,41,0.6)]" : "border-[#e2e5ef] bg-white"} backdrop-blur-xl`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Network className="w-4 h-4 text-[#6459A7]" />
                أكثر القطاعات تضرراً
                <span className="text-[10px] text-muted-foreground font-normal">Most Affected Sectors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {topSectors.slice(0, 8).map((item, idx) => {
                const maxCount = topSectors[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const colors = ["#3DB1AC", "#6459A7", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e", "#ec4899", "#8b5cf6"];
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                      <span className="text-muted-foreground font-mono">{item.count}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-100"}`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: colors[idx % colors.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.05 }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Leak Methods */}
        <motion.div custom={12} variants={cardVariants} initial="hidden" animate="visible">
          <Card className={`border ${isDark ? "border-[rgba(61,177,172,0.15)] bg-[rgba(13,21,41,0.6)]" : "border-[#e2e5ef] bg-white"} backdrop-blur-xl`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ef4444]" />
                أساليب حالة الرصد
                <span className="text-[10px] text-muted-foreground font-normal">Leak Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leakMethods.map((item, idx) => {
                const maxCount = leakMethods[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.count}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5" style={{ borderColor: colors[idx % colors.length], color: colors[idx % colors.length] }}>
                          {Math.round((item.count / records.length) * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-100"}`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: colors[idx % colors.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Leak Platforms */}
        <motion.div custom={13} variants={cardVariants} initial="hidden" animate="visible">
          <Card className={`border ${isDark ? "border-[rgba(61,177,172,0.15)] bg-[rgba(13,21,41,0.6)]" : "border-[#e2e5ef] bg-white"} backdrop-blur-xl`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#3b82f6]" />
                منصات حالة الرصد
                <span className="text-[10px] text-muted-foreground font-normal">Leak Platforms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leakPlatforms.map((item, idx) => {
                const maxCount = leakPlatforms[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const colors = ["#3b82f6", "#6459A7", "#3DB1AC", "#f59e0b"];
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.count}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5" style={{ borderColor: colors[idx % colors.length], color: colors[idx % colors.length] }}>
                          {Math.round((item.count / records.length) * 100)}%
                        </Badge>
                      </div>
                    </div>
                    <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-[rgba(255,255,255,0.05)]" : "bg-gray-100"}`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: colors[idx % colors.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══ Latest Incidents ═══ */}
      <motion.div custom={14} variants={cardVariants} initial="hidden" animate="visible">
        <Card className={`border ${isDark ? "border-[rgba(61,177,172,0.15)] bg-[rgba(13,21,41,0.6)]" : "border-[#e2e5ef] bg-white"} backdrop-blur-xl`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ef4444]" />
              أحدث الحوادث
              <span className="text-[10px] text-muted-foreground font-normal">Latest Incidents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {records.slice(0, 5).map((r) => (
                <Link key={r.id} href={`/incident/${r.id}`}>
                  <div className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isDark ? "hover:bg-[rgba(61,177,172,0.08)]" : "hover:bg-gray-50"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${severityColors[r.overview?.severity] || "#6b7280"}15` }}>
                        <Database className="w-4 h-4" style={{ color: severityColors[r.overview?.severity] || "#6b7280" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{r.title_ar}</p>
                        <p className="text-[10px] text-muted-foreground">{r.sector} · {r.overview?.source_platform}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">{r.overview?.discovery_date}</p>
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: severityColors[r.overview?.severity], color: severityColors[r.overview?.severity] }}>
                        {severityLabels[r.overview?.severity] || r.overview?.severity}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ Quick Navigation Cards ═══ */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-[#3DB1AC]" />
          استكشف الأطلس
          <span className="text-xs text-muted-foreground font-normal">Explore Atlas</span>
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {quickNav.map((nav, i) => {
            const Icon = nav.icon;
            return (
              <motion.div key={nav.path} custom={i + 15} variants={cardVariants} initial="hidden" animate="visible">
                <Link href={nav.path}>
                  <Card className={`cursor-pointer transition-all duration-200 border ${isDark ? "border-[rgba(61,177,172,0.1)] bg-[rgba(13,21,41,0.4)] hover:border-[rgba(61,177,172,0.3)] hover:bg-[rgba(13,21,41,0.6)]" : "border-[#e2e5ef] bg-white hover:border-[#3DB1AC]/30 hover:shadow-md"}`}>
                    <CardContent className="p-4 text-center">
                      <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${nav.color}15` }}>
                        <Icon className="w-5 h-5" style={{ color: nav.color }} />
                      </div>
                      <p className="text-sm font-medium">{nav.label}</p>
                      <p className="text-[10px] text-muted-foreground">{nav.labelEn}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer stats */}
      <div className={`text-center py-4 text-xs text-muted-foreground border-t ${isDark ? "border-[rgba(61,177,172,0.08)]" : "border-[#e2e5ef]"}`}>
        <span className="font-mono">{stats.total}</span> حادثة · <span className="font-mono">+{fmt(stats.exposed)}</span> سجل
      </div>
    </div>
  );
}
