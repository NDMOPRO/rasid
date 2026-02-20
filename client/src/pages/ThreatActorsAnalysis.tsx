/**
 * ThreatActorsAnalysis — تحليل مصادر التهديد
 * مربوط بـ leaks.list API
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserX, AlertTriangle, Shield, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function ThreatActorsAnalysis() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { actors: [], total: 0 };
    const map: Record<string, { count: number; records: number; critical: number; sectors: Set<string> }> = {};
    leaks.forEach((l: any) => {
      const a = l.threatActorAr || l.threatActor || "غير معروف";
      if (!map[a]) map[a] = { count: 0, records: 0, critical: 0, sectors: new Set() };
      map[a].count++;
      map[a].records += l.recordCount || 0;
      if (l.severity === "critical") map[a].critical++;
      map[a].sectors.add(l.sectorAr || l.sector || "");
    });
    const actors = Object.entries(map).map(([name, d]) => ({ name, count: d.count, records: d.records, critical: d.critical, sectors: d.sectors.size })).sort((a, b) => b.count - a.count);
    return { actors, total: leaks.length };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-gray-800" />)}</div>;

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div><h1 className="text-2xl font-bold text-white">تحليل مصادر التهديد</h1><p className="text-gray-400 text-sm mt-1">تحليل الجهات الفاعلة وراء حوادث التسريب</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><UserX className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{analysis.actors.length}</div><div className="text-xs text-gray-400">جهة تهديد</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Target className="h-8 w-8 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{analysis.total}</div><div className="text-xs text-gray-400">إجمالي الهجمات</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Shield className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{analysis.actors.reduce((s, a) => s + a.critical, 0)}</div><div className="text-xs text-gray-400">هجمات حرجة</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader><CardTitle className="text-white text-base">أنشط الجهات</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.actors.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={140} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader><CardTitle className="text-white text-base">توزيع الجهات</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analysis.actors.slice(0, 8)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name.substring(0, 15)} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.actors.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">تفاصيل الجهات</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-700"><th className="text-right text-gray-400 p-2">الجهة</th><th className="text-center text-gray-400 p-2">الهجمات</th><th className="text-center text-gray-400 p-2">السجلات</th><th className="text-center text-gray-400 p-2">حرج</th><th className="text-center text-gray-400 p-2">القطاعات</th></tr></thead>
              <tbody>
                {analysis.actors.map((a, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-2 text-white font-medium">{a.name}</td>
                    <td className="p-2 text-center text-white">{a.count}</td>
                    <td className="p-2 text-center text-gray-300">{a.records.toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center"><Badge className="bg-red-500/20 text-red-400">{a.critical}</Badge></td>
                    <td className="p-2 text-center"><Badge className="bg-purple-500/20 text-purple-400">{a.sectors}</Badge></td>
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
