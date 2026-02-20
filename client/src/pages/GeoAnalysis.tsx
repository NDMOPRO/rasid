/**
 * GeoAnalysis — التحليل الجغرافي
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Globe, AlertTriangle, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function GeoAnalysis() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { regions: [], countries: [], total: 0 };
    const regionMap: Record<string, { count: number; records: number }> = {};
    const countryMap: Record<string, { count: number; records: number }> = {};
    leaks.forEach((l: any) => {
      const r = l.regionAr || l.region || "غير محدد";
      const c = l.countryAr || l.country || "غير محدد";
      if (!regionMap[r]) regionMap[r] = { count: 0, records: 0 };
      regionMap[r].count++; regionMap[r].records += l.recordCount || 0;
      if (!countryMap[c]) countryMap[c] = { count: 0, records: 0 };
      countryMap[c].count++; countryMap[c].records += l.recordCount || 0;
    });
    return {
      regions: Object.entries(regionMap).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count),
      countries: Object.entries(countryMap).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count),
      total: leaks.length,
    };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">التحليل الجغرافي</h1><p className="text-muted-foreground text-sm mt-1">التوزيع الجغرافي لحوادث التسريب</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><MapPin className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.regions.length}</div><div className="text-xs text-muted-foreground">منطقة متأثرة</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Globe className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.countries.length}</div><div className="text-xs text-muted-foreground">دولة متأثرة</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.total}</div><div className="text-xs text-muted-foreground">إجمالي الحوادث</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">الحوادث حسب المنطقة</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.regions.slice(0, 10)} layout="vertical">
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
          <CardHeader><CardTitle className="text-foreground text-base">التوزيع حسب الدولة</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analysis.countries.slice(0, 8)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.countries.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">تفاصيل المناطق</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-right text-muted-foreground p-2">المنطقة</th><th className="text-center text-muted-foreground p-2">الحوادث</th><th className="text-center text-muted-foreground p-2">السجلات المتأثرة</th><th className="text-center text-muted-foreground p-2">النسبة</th></tr></thead>
              <tbody>
                {analysis.regions.map((r, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-2 text-foreground font-medium">{r.name}</td>
                    <td className="p-2 text-center text-foreground">{r.count}</td>
                    <td className="p-2 text-center text-muted-foreground">{r.records.toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center"><Badge className="bg-blue-500/20 text-blue-400">{analysis.total ? ((r.count / analysis.total) * 100).toFixed(1) : 0}%</Badge></td>
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
