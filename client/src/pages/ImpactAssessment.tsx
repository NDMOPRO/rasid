/**
 * ImpactAssessment — تقييم الأثر
 * مربوط بـ leaks.list API
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingUp, Users, Shield, BarChart3, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

export default function ImpactAssessment() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { severity: [], totalRecords: 0, avgRecords: 0, topImpact: [] };
    const sevMap: Record<string, { count: number; records: number }> = {};
    let totalRecords = 0;
    leaks.forEach((l: any) => {
      const s = l.severity || "unknown";
      if (!sevMap[s]) sevMap[s] = { count: 0, records: 0 };
      sevMap[s].count++;
      sevMap[s].records += l.recordCount || 0;
      totalRecords += l.recordCount || 0;
    });
    const severity = Object.entries(sevMap).map(([name, d]) => ({ name: name === "critical" ? "حرج" : name === "high" ? "عالي" : name === "medium" ? "متوسط" : "منخفض", ...d }));
    const topImpact = [...leaks].sort((a: any, b: any) => (b.recordCount || 0) - (a.recordCount || 0)).slice(0, 10);
    return { severity, totalRecords, avgRecords: Math.round(totalRecords / leaks.length), topImpact };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-gray-800" />)}</div>;

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div><h1 className="text-2xl font-bold text-white">تقييم الأثر</h1><p className="text-gray-400 text-sm mt-1">تحليل حجم وتأثير حوادث التسريب</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Users className="h-6 w-6 text-red-400 mx-auto mb-2" /><div className="text-xl font-bold text-white">{analysis.totalRecords.toLocaleString("ar-SA")}</div><div className="text-xs text-gray-400">إجمالي السجلات المتأثرة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><BarChart3 className="h-6 w-6 text-blue-400 mx-auto mb-2" /><div className="text-xl font-bold text-white">{analysis.avgRecords.toLocaleString("ar-SA")}</div><div className="text-xs text-gray-400">متوسط السجلات لكل حادثة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 text-amber-400 mx-auto mb-2" /><div className="text-xl font-bold text-white">{leaks.length}</div><div className="text-xs text-gray-400">إجمالي الحوادث</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" /><div className="text-xl font-bold text-white">{analysis.topImpact[0]?.recordCount?.toLocaleString("ar-SA") || 0}</div><div className="text-xs text-gray-400">أكبر حادثة</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader><CardTitle className="text-white text-base">توزيع الخطورة</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={analysis.severity} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.severity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader><CardTitle className="text-white text-base">السجلات حسب الخطورة</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.severity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="records" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">أكبر 10 حوادث تأثيراً</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-700"><th className="text-right text-gray-400 p-2">#</th><th className="text-right text-gray-400 p-2">الحادثة</th><th className="text-center text-gray-400 p-2">السجلات</th><th className="text-center text-gray-400 p-2">القطاع</th><th className="text-center text-gray-400 p-2">الخطورة</th></tr></thead>
              <tbody>
                {analysis.topImpact.map((l: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-2 text-gray-500">{i + 1}</td>
                    <td className="p-2 text-white font-medium">{l.titleAr || l.title}</td>
                    <td className="p-2 text-center text-red-400 font-bold">{(l.recordCount || 0).toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center text-gray-300">{l.sectorAr || l.sector}</td>
                    <td className="p-2 text-center"><Badge className={l.severity === "critical" ? "bg-red-500/20 text-red-400" : l.severity === "high" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}>{l.severity === "critical" ? "حرج" : l.severity === "high" ? "عالي" : l.severity === "medium" ? "متوسط" : "منخفض"}</Badge></td>
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
