/**
 * LeakTimeline — الخط الزمني للتسريبات
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, AlertTriangle, TrendingUp, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const severityColors: Record<string, string> = { critical: "border-red-500 bg-red-500/10", high: "border-amber-500 bg-amber-500/10", medium: "border-blue-500 bg-blue-500/10", low: "border-gray-500 bg-gray-500/10" };
const severityLabels: Record<string, string> = { critical: "حرج", high: "عالي", medium: "متوسط", low: "منخفض" };
const severityBadge: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-amber-500/20 text-amber-400", medium: "bg-blue-500/20 text-blue-400", low: "bg-gray-500/20 text-muted-foreground" };

export default function LeakTimeline() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [filter, setFilter] = useState<string>("all");

  const { monthly, filtered, stats } = useMemo(() => {
    const sorted = [...leaks].sort((a: any, b: any) => new Date(b.detectedAt || b.createdAt).getTime() - new Date(a.detectedAt || a.createdAt).getTime());
    const fil = filter === "all" ? sorted : sorted.filter((l: any) => l.severity === filter);
    const monthMap: Record<string, number> = {};
    sorted.forEach((l: any) => {
      const d = new Date(l.detectedAt || l.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const monthly = Object.entries(monthMap).sort().map(([month, count]) => ({ month, count }));
    const thisMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 7);
    return {
      monthly,
      filtered: fil,
      stats: {
        total: leaks.length,
        thisMonth: monthMap[thisMonth] || 0,
        lastMonth: monthMap[lastMonth] || 0,
        trend: (monthMap[thisMonth] || 0) - (monthMap[lastMonth] || 0),
      },
    };
  }, [leaks, filter]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">الخط الزمني للتسريبات</h1><p className="text-muted-foreground text-sm mt-1">تتبع الحوادث عبر الزمن</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Calendar className="h-6 w-6 text-blue-400 mx-auto mb-2" /><div className="text-xl font-bold text-foreground">{stats.total}</div><div className="text-xs text-muted-foreground">إجمالي الحوادث</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Clock className="h-6 w-6 text-emerald-400 mx-auto mb-2" /><div className="text-xl font-bold text-foreground">{stats.thisMonth}</div><div className="text-xs text-muted-foreground">هذا الشهر</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 text-amber-400 mx-auto mb-2" /><div className="text-xl font-bold text-foreground">{stats.lastMonth}</div><div className="text-xs text-muted-foreground">الشهر الماضي</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><TrendingUp className={`h-6 w-6 mx-auto mb-2 ${stats.trend > 0 ? "text-red-400" : "text-emerald-400"}`} /><div className={`text-xl font-bold ${stats.trend > 0 ? "text-red-400" : "text-emerald-400"}`}>{stats.trend > 0 ? "+" : ""}{stats.trend}</div><div className="text-xs text-muted-foreground">التغيير</div></CardContent></Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">اتجاه الحوادث الشهري</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="flex gap-2 flex-wrap">
        {["all", "critical", "high", "medium", "low"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === f ? "bg-blue-600 text-foreground" : "bg-card text-muted-foreground hover:bg-gray-700"}`}>
            {f === "all" ? "الكل" : severityLabels[f]} ({f === "all" ? leaks.length : leaks.filter((l: any) => l.severity === f).length})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.slice(0, 30).map((l: any, i: number) => (
          <div key={i} className={`p-4 rounded-lg border-r-4 border border-border/50 ${severityColors[l.severity] || "border-gray-500 bg-gray-500/10"}`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-foreground font-medium text-sm">{l.titleAr || l.title}</p>
                <p className="text-muted-foreground text-xs mt-1">{l.sectorAr || l.sector} • {l.organizationAr || l.organization} • {l.recordCount?.toLocaleString("ar-SA")} سجل</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={severityBadge[l.severity] || "bg-gray-500/20 text-muted-foreground"}>{severityLabels[l.severity] || l.severity}</Badge>
                <span className="text-muted-foreground text-xs">{l.detectedAt ? new Date(l.detectedAt).toLocaleDateString("ar-SA") : ""}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
