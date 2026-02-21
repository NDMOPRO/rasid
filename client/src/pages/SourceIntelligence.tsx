/**
 * SourceIntelligence — استخبارات المصادر
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio, Globe, Database, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function SourceIntelligence() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { sources: [], types: [], total: 0 };
    const srcMap: Record<string, { count: number; records: number }> = {};
    const typeMap: Record<string, number> = {};
    leaks.forEach((l: any) => {
      const s = l.sourceAr || l.source || "غير محدد";
      const t = l.leakTypeAr || l.leakType || "غير محدد";
      if (!srcMap[s]) srcMap[s] = { count: 0, records: 0 };
      srcMap[s].count++; srcMap[s].records += l.recordCount || 0;
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    return {
      sources: Object.entries(srcMap).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count),
      types: Object.entries(typeMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      total: leaks.length,
    };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">استخبارات المصادر</h1><p className="text-muted-foreground text-sm mt-1">تحليل مصادر وأنواع التسريبات</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Radio className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.sources.length}</div><div className="text-xs text-muted-foreground">مصدر</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Database className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.types.length}</div><div className="text-xs text-muted-foreground">نوع تسريب</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Eye className="h-8 w-8 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-foreground">{analysis.total}</div><div className="text-xs text-muted-foreground">إجمالي</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">المصادر الأكثر نشاطاً</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.sources.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={130} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">أنواع التسريبات</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analysis.types.slice(0, 8)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name.substring(0, 15)} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.types.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">تفاصيل المصادر</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border"><th className="text-right text-muted-foreground p-2">المصدر</th><th className="text-center text-muted-foreground p-2">حالات الرصد</th><th className="text-center text-muted-foreground p-2">السجلات</th><th className="text-center text-muted-foreground p-2">النسبة</th></tr></thead>
              <tbody>
                {analysis.sources.map((s, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-2 text-foreground font-medium">{s.name}</td>
                    <td className="p-2 text-center text-foreground">{s.count}</td>
                    <td className="p-2 text-center text-muted-foreground">{s.records.toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center"><Badge className="bg-purple-500/20 text-purple-400">{analysis.total ? ((s.count / analysis.total) * 100).toFixed(1) : 0}%</Badge></td>
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
