import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, FileCheck, FileBarChart, Users, TrendingUp,
  Loader2, PieChart as PieChartIcon, BarChart3, Clock,
  Shield, AlertTriangle, FileSpreadsheet, Layers, Download,
  Printer, Eye, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, Legend,
} from "recharts";
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const typeLabels: Record<string, string> = {
  incident_report: "توثيق حالة رصد",
  custom_report: "تقرير مخصص",
  executive_summary: "ملخص تنفيذي",
  compliance_report: "تقرير امتثال",
  sector_report: "تقرير قطاعي",
};

const typeColors: Record<string, string> = {
  incident_report: "#ef4444",
  custom_report: "#3b82f6",
  executive_summary: "#8b5cf6",
  compliance_report: "#10b981",
  sector_report: "#f59e0b",
};

const typeIcons: Record<string, React.ReactNode> = {
  incident_report: <AlertTriangle className="h-4 w-4" />,
  custom_report: <FileSpreadsheet className="h-4 w-4" />,
  executive_summary: <FileBarChart className="h-4 w-4" />,
  compliance_report: <Shield className="h-4 w-4" />,
  sector_report: <Layers className="h-4 w-4" />,
};

const monthNames: Record<string, string> = {
  "01": "يناير", "02": "فبراير", "03": "مارس", "04": "أبريل",
  "05": "مايو", "06": "يونيو", "07": "يوليو", "08": "أغسطس",
  "09": "سبتمبر", "10": "أكتوبر", "11": "نوفمبر", "12": "ديسمبر",
};

function StatCard({ icon, label, value, color, delay, onClick }: {
  icon: React.ReactNode; label: string; value: number; color: string; delay: number; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" : ""}
    >
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
        <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity`} style={{ background: `linear-gradient(135deg, ${color}, transparent)` }} />
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{label}</p>
              <p
                className="text-3xl font-bold gradient-text"
              >
                {value.toLocaleString("ar-SA")}
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: `${color}15` }}>
              <div style={{ color }}>{icon}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-xl p-3 text-sm" dir="rtl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: entry.color }} />
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-xl p-3 text-sm" dir="rtl">
      <p className="font-semibold">{d.name}</p>
      <p>العدد: <strong>{d.value}</strong></p>
    </div>
  );
}

export default function DocumentStats() {
  const { playClick, playHover } = useSoundEffects();
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.documentation.detailedStats.useQuery();
  const [activeType, setActiveType] = useState<string | null>(null);
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();

  const pieData = useMemo(() => {
    if (!stats?.byType) return [];
    return stats.byType.filter((t: any) => t.count > 0).map((t: any) => ({
      name: t.label,
      value: t.count,
      color: t.color,
      type: t.type,
    }));
  }, [stats]);

  const monthData = useMemo(() => {
    if (!stats?.byMonth) return [];
    return stats.byMonth.map((m: any) => {
      const [year, month] = m.month.split("-");
      return {
        name: `${monthNames[month] || month} ${year}`,
        "الوثائق": m.count,
      };
    });
  }, [stats]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1" dir="rtl">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 btn-glow">
              <PieChartIcon className="h-6 w-6 text-primary" />
            </div>
            إحصائيات الوثائق
          </h1>
          <p className="text-muted-foreground mt-1">
            تحليل شامل لجميع الوثائق والتقارير المُصدرة من المنصة
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLocation("/documents-registry")} className="gap-2">
            <Eye className="h-4 w-4" />
            سجل الوثائق
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
        <StatCard icon={<FileText className="h-5 w-5" />} label="إجمالي الوثائق" value={stats.total} color="#3b82f6" delay={0} onClick={() => openDrillDown({ title: "إجمالي الوثائق" })} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="توثيق حالات الرصد" value={stats.incidents} color="#ef4444" delay={0.05} onClick={() => openDrillDown({ title: "وثائق حالات الرصد", subtitle: "جميع وثائق حالات الرصد" })} />
        <StatCard icon={<FileSpreadsheet className="h-5 w-5" />} label="تقارير مخصصة" value={stats.customReports} color="#3b82f6" delay={0.1} onClick={() => openDrillDown({ title: "تقارير مخصصة", subtitle: "جميع التقارير المخصصة" })} />
        <StatCard icon={<FileBarChart className="h-5 w-5" />} label="ملخصات تنفيذية" value={stats.executiveSummaries} color="#8b5cf6" delay={0.15} onClick={() => openDrillDown({ title: "ملخصات تنفيذية", subtitle: "جميع الملخصات التنفيذية" })} />
        <StatCard icon={<Shield className="h-5 w-5" />} label="تقارير امتثال" value={stats.complianceReports} color="#10b981" delay={0.2} onClick={() => openDrillDown({ title: "تقارير امتثال", subtitle: "جميع تقارير الامتثال" })} />
        <StatCard icon={<Users className="h-5 w-5" />} label="مُصدرون فريدون" value={stats.uniqueIssuers} color="#f59e0b" delay={0.25} onClick={() => openDrillDown({ title: "المُصدرون النشطون" })} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
        {/* Pie Chart - Documents by Type */}
        <div>
          <Card className="overflow-hidden glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                توزيع الوثائق حسب النوع
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-full md:w-1/2 h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1200}
                          onMouseEnter={(_, idx) => setActiveType(pieData[idx]?.type)}
                          onMouseLeave={() => setActiveType(null)}
                          onClick={(data) => openDrillDown({ title: `وثائق من نوع: ${data.name}` })}
                        >
                          {pieData.map((entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="transparent"
                              opacity={activeType && activeType !== entry.type ? 0.3 : 1}
                              style={{ transition: "opacity 0.3s ease", cursor: "pointer" }}
                              className="hover:scale-[1.02] transition-transform"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-2">
                    {pieData.map((entry: any, i: number) => (
                      <div
                        key={entry.type}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] ${
                          activeType === entry.type ? "border-primary bg-primary/5 shadow-sm" : "border-transparent hover:bg-muted/50"
                        }`}
                        onMouseEnter={() => setActiveType(entry.type)}
                        onMouseLeave={() => setActiveType(null)}
                        onClick={() => openDrillDown({ title: `وثائق من نوع: ${entry.name}` })}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                          <span className="text-sm font-medium">{entry.name}</span>
                        </div>
                        <Badge variant="secondary" className="font-mono">{entry.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  لا توجد وثائق بعد
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Area Chart - Documents Over Time */}
        <div>
          <Card className="overflow-hidden glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                الوثائق عبر الزمن (آخر 12 شهر)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthData.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="docGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="الوثائق"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="url(#docGradient)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  لا توجد بيانات زمنية بعد
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Top Issuers + Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
        {/* Top Issuers */}
        <div>
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                أكثر المُصدرين نشاطاً
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topIssuers && stats.topIssuers.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.topIssuers.map((issuer: any) => ({
                        name: issuer.name || "غير معروف",
                        "الوثائق": issuer.count,
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="الوثائق" fill="#8b5cf6" radius={[0, 6, 6, 0]} animationDuration={1200} className="cursor-pointer" onClick={(data) => openDrillDown({ title: `وثائق صادرة من: ${data.name}` })} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  لا توجد بيانات بعد
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <div>
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                آخر الوثائق المُصدرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentDocuments && stats.recentDocuments.length > 0 ? (
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  
                    {stats.recentDocuments.slice(0, 8).map((doc: any, i: number) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group hover:shadow-md hover:scale-[1.01]"
                        onClick={() => openDrillDown({ title: `تفاصيل وثيقة: ${doc.titleAr || doc.documentId}` })}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 rounded-lg" style={{ background: `${typeColors[doc.documentType] || "#666"}15` }}>
                            <span style={{ color: typeColors[doc.documentType] || "#666" }}>
                              {typeIcons[doc.documentType] || <FileText className="h-4 w-4" />}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{doc.titleAr || doc.documentId}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.generatedByName} • {new Date(doc.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0" style={{ borderColor: typeColors[doc.documentType] || "#666", color: typeColors[doc.documentType] || "#666" }}>
                          {typeLabels[doc.documentType] || doc.documentType}
                        </Badge>
                      </div>
                    ))}
                  
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  لا توجد وثائق بعد
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Type Breakdown Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          تفصيل أنواع الوثائق
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
          {Object.entries(typeLabels).map(([type, label], i) => {
            const count = stats.byType?.find((t: any) => t.type === type)?.count || 0;
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            const color = typeColors[type];
            return (
              <div
                key={type}
                onClick={() => openDrillDown({ title: `وثائق من نوع: ${label}` })}
                className="cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
              >
                <Card className="relative overflow-hidden group h-full glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: color }} />
                  <CardContent className="p-4 text-center">
                    <div className="p-2.5 rounded-xl mx-auto w-fit mb-2" style={{ background: `${color}15` }}>
                      <span style={{ color }}>{typeIcons[type]}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                    <p className="text-2xl font-bold" style={{ color }}>{count}</p>
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        animate={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{percentage}% من الإجمالي</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}

