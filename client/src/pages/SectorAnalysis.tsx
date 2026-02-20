/**
 * SectorAnalysis — تحليل القطاعات
 * مربوط بـ leaks.list + dashboard.stats APIs
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Shield, AlertTriangle, BarChart3, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function SectorAnalysis() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { sectors: [], total: 0 };
    const map: Record<string, { count: number; records: number; critical: number; high: number; medium: number; low: number }> = {};
    leaks.forEach((l: any) => {
      const s = l.sectorAr || l.sector || "غير محدد";
      if (!map[s]) map[s] = { count: 0, records: 0, critical: 0, high: 0, medium: 0, low: 0 };
      map[s].count++;
      map[s].records += l.recordCount || 0;
      if (l.severity === "critical") map[s].critical++;
      else if (l.severity === "high") map[s].high++;
      else if (l.severity === "medium") map[s].medium++;
      else map[s].low++;
    });
    const sectors = Object.entries(map).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count);
    return { sectors, total: leaks.length };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">تحليل القطاعات</h1><p className="text-muted-foreground text-sm mt-1">توزيع حوادث التسريب حسب القطاعات</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Building2 className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.sectors.length}</div><div className="text-xs text-muted-foreground">قطاع متأثر</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.total}</div><div className="text-xs text-muted-foreground">إجمالي الحوادث</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Shield className="h-8 w-8 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.sectors.reduce((s, sec) => s + sec.critical, 0)}</div><div className="text-xs text-muted-foreground">حوادث حرجة</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">توزيع الحوادث حسب القطاع</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.sectors.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={120} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">نسبة القطاعات</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analysis.sectors.slice(0, 8)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.sectors.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">تفاصيل القطاعات</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-right text-muted-foreground p-2">القطاع</th>
                <th className="text-center text-muted-foreground p-2">الحوادث</th>
                <th className="text-center text-muted-foreground p-2">السجلات</th>
                <th className="text-center text-muted-foreground p-2">حرج</th>
                <th className="text-center text-muted-foreground p-2">عالي</th>
                <th className="text-center text-muted-foreground p-2">متوسط</th>
              </tr></thead>
              <tbody>
                {analysis.sectors.map((s, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-2 text-foreground font-medium">{s.name}</td>
                    <td className="p-2 text-center text-foreground">{s.count}</td>
                    <td className="p-2 text-center text-muted-foreground">{s.records.toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center"><Badge className="bg-red-500/20 text-red-400">{s.critical}</Badge></td>
                    <td className="p-2 text-center"><Badge className="bg-amber-500/20 text-amber-400">{s.high}</Badge></td>
                    <td className="p-2 text-center"><Badge className="bg-blue-500/20 text-blue-400">{s.medium}</Badge></td>
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
