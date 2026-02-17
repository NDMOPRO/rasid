import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, BarChart3, PieChart, FileSpreadsheet, Loader2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
} from "recharts";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const sectorColors: Record<string, string> = {
  "تجاري": "#3b82f6",
  "سعودي عام": "#8b5cf6",
  "تقني / اتصالات": "#06b6d4",
  "منظمة / غير ربحي": "#f59e0b",
  "صحي / طبي": "#ef4444",
  "تعليمي": "#22c55e",
  "حكومي": "#ec4899",
  "مالي / مصرفي": "#f97316",
  "عقاري": "#84cc16",
  "تجارة إلكترونية": "#6366f1",
  "طاقة / نفط": "#14b8a6",
  "نقل / لوجستي": "#a855f7",
};

export default function Reports() {
  const { playClick, playHover } = useSoundEffects();
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: clauseStats } = trpc.dashboard.clauseStats.useQuery();
  const { data: classStats } = trpc.dashboard.classificationStats.useQuery();
  const { data: sectorData } = trpc.dashboard.sectorCompliance.useQuery();
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportType, setExportType] = useState<"summary" | "detailed" | "clauses">("summary");

  const exportCsv = trpc.reports.exportCsv.useMutation({
    onSuccess: (data) => {
      if (!data.csv) { toast.error("لا توجد بيانات للتصدير"); return; }
      const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير التقرير بنجاح");
    },
    onError: (err) => toast.error(`خطأ في التصدير: ${err.message}`),
  });

  const exportExcel = trpc.reports.exportExcel.useMutation({
    onSuccess: (data) => {
      if (!data.base64) { toast.error("لا توجد بيانات للتصدير"); return; }
      const binary = atob(data.base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير التقرير بنجاح");
    },
    onError: (err) => toast.error(`خطأ في التصدير: ${err.message}`),
  });

  const isExporting = exportCsv.isPending || exportExcel.isPending;

  const handleExport = () => {
    if (exportFormat === "csv") {
      exportCsv.mutate({ type: exportType });
    } else {
      exportExcel.mutate({ type: exportType });
    }
  };

  const classData = (classStats || []).map((c: any) => ({
    name: c.classification || "غير مصنف",
    value: c.count,
  }));

  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#6366f1"];

  // Sector compliance data for chart
  const sectorChartData = (sectorData as any[] || []).slice(0, 10).map((s: any) => ({
    name: s.classification || "غير مصنف",
    total: Number(s.total),
    compliant: Number(s.compliant),
    avgScore: Number(s.avg_score),
  }));

  return (
    <div className="space-y-6">
      <WatermarkLogo />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">التقارير</h1>
          <p className="text-muted-foreground text-sm mt-1">
            تقارير تحليلية شاملة عن امتثال المواقع السعودية
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={exportType} onValueChange={(v) => setExportType(v as any)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">ملخص شامل</SelectItem>
              <SelectItem value="clauses">تقرير البنود</SelectItem>
              <SelectItem value="detailed">تقرير مفصل</SelectItem>
            </SelectContent>
          </Select>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : exportFormat === "excel" ? (
              <FileSpreadsheet className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? "جاري التصدير..." : "تصدير"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <Card className="glass-card gold-sweep">
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-primary">{stats?.totalSites?.toLocaleString("ar-SA-u-nu-latn") || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">إجمالي المواقع</div>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-emerald-400">{stats?.compliant || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">ممتثلة</div>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-amber-400">{stats?.partiallyCompliant || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">ممتثلة جزئياً</div>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-red-400">{(stats?.nonCompliant || 0) + (stats?.noPolicy || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">غير ممتثلة</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
        <Card className="glass-card gold-sweep">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              امتثال البنود الثمانية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clauseStats?.map((c) => ({
                    name: `بند ${c.clause}`,
                    percentage: c.percentage,
                    compliant: c.compliant,
                    total: c.total,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 11, fontFamily: "Tajawal" }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#888", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(23,23,30,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      direction: "rtl",
                      fontFamily: "Tajawal",
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value}% (${props.payload.compliant}/${props.payload.total})`,
                      "نسبة الامتثال",
                    ]}
                  />
                  <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card gold-sweep">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              توزيع التصنيفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie
                    data={classData.slice(0, 10)}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {classData.slice(0, 10).map((_: any, i: number) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(23,23,30,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      direction: "rtl",
                      fontFamily: "Tajawal",
                    }}
                  />
                </RPieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {classData.slice(0, 10).map((item: any, i: number) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium">({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Compliance Table */}
      <Card className="glass-card gold-sweep">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            امتثال القطاعات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(197,165,90,0.12)] bg-[rgba(197,165,90,0.04)]">
                  <th className="text-end py-3 px-4 font-medium text-muted-foreground">القطاع</th>
                  <th className="text-end py-3 px-4 font-medium text-muted-foreground">الإجمالي</th>
                  <th className="text-end py-3 px-4 font-medium text-muted-foreground">ممتثلة</th>
                  <th className="text-end py-3 px-4 font-medium text-muted-foreground">جزئياً</th>
                  <th className="text-end py-3 px-4 font-medium text-muted-foreground">غير ممتثلة</th>
                  <th className="text-end py-3 px-4 font-medium text-muted-foreground">بدون سياسة</th>
                  <th className="text-end py-3 px-4 font-medium text-muted-foreground">المعدل</th>
                </tr>
              </thead>
              <tbody>
                {(sectorData as any[] || []).map((sector: any) => (
                  <tr key={sector.classification} className="border-b border-border/30 hover:bg-[rgba(197,165,90,0.08)] transition-all duration-200">
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sectorColors[sector.classification] || "#888" }} />
                        {sector.classification || "غير مصنف"}
                      </div>
                    </td>
                    <td className="py-3 px-4">{Number(sector.total).toLocaleString("ar-SA-u-nu-latn")}</td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">{Number(sector.compliant)}</td>
                    <td className="py-3 px-4 text-amber-400 font-medium">{Number(sector.partial)}</td>
                    <td className="py-3 px-4 text-red-400 font-medium">{Number(sector.non_compliant)}</td>
                    <td className="py-3 px-4 text-zinc-400">{Number(sector.no_policy)}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold" style={{ color: getScoreColor(Number(sector.avg_score)) }}>
                        {Number(sector.avg_score).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}
