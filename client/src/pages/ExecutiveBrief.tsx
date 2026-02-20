/**
 * ExecutiveBrief — الموجز التنفيذي
 * مربوط بـ dashboard.stats + leaks.list APIs
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, AlertTriangle, Shield, TrendingUp, Users, Building2, BarChart3, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

export default function ExecutiveBrief() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: leaks = [], isLoading: leaksLoading } = trpc.leaks.list.useQuery();
  const isLoading = statsLoading || leaksLoading;

  const brief = useMemo(() => {
    if (!leaks.length) return null;
    const totalRecords = leaks.reduce((s: number, l: any) => s + (l.recordCount || 0), 0);
    const sevMap: Record<string, number> = {};
    const sectorMap: Record<string, number> = {};
    const recentLeaks = [...leaks].sort((a: any, b: any) => new Date(b.detectedAt || b.createdAt).getTime() - new Date(a.detectedAt || a.createdAt).getTime()).slice(0, 5);
    leaks.forEach((l: any) => {
      sevMap[l.severity] = (sevMap[l.severity] || 0) + 1;
      const s = l.sectorAr || l.sector || "غير محدد";
      sectorMap[s] = (sectorMap[s] || 0) + 1;
    });
    const severity = Object.entries(sevMap).map(([name, count]) => ({ name: name === "critical" ? "حرج" : name === "high" ? "عالي" : name === "medium" ? "متوسط" : "منخفض", count }));
    const topSectors = Object.entries(sectorMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
    return { totalLeaks: leaks.length, totalRecords, severity, topSectors, recentLeaks };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-gray-800" />)}</div>;

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3"><FileText className="h-8 w-8 text-blue-400" /><div><h1 className="text-2xl font-bold text-white">الموجز التنفيذي</h1><p className="text-gray-400 text-sm">ملخص شامل لحالة أمن البيانات</p></div></div>
      {brief && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30"><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{brief.totalLeaks}</div><div className="text-xs text-gray-400">إجمالي الحوادث</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30"><CardContent className="p-4 text-center"><Users className="h-6 w-6 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{brief.totalRecords.toLocaleString("ar-SA")}</div><div className="text-xs text-gray-400">سجلات متأثرة</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30"><CardContent className="p-4 text-center"><Building2 className="h-6 w-6 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{brief.topSectors.length}</div><div className="text-xs text-gray-400">قطاعات متأثرة</div></CardContent></Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30"><CardContent className="p-4 text-center"><Shield className="h-6 w-6 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{brief.severity.find(s => s.name === "حرج")?.count || 0}</div><div className="text-xs text-gray-400">حوادث حرجة</div></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader><CardTitle className="text-white text-base">توزيع الخطورة</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={brief.severity} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {brief.severity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader><CardTitle className="text-white text-base">أكثر القطاعات تأثراً</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={brief.topSectors} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader><CardTitle className="text-white text-base">آخر الحوادث</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {brief.recentLeaks.map((l: any, i: number) => (
                  <div key={i} className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-lg bg-gray-900/30 border border-gray-700/50">
                    <div>
                      <p className="text-white font-medium text-sm">{l.titleAr || l.title}</p>
                      <p className="text-gray-500 text-xs mt-1">{l.sectorAr || l.sector} • {l.organizationAr || l.organization}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={l.severity === "critical" ? "bg-red-500/20 text-red-400" : l.severity === "high" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}>
                        {l.severity === "critical" ? "حرج" : l.severity === "high" ? "عالي" : l.severity === "medium" ? "متوسط" : "منخفض"}
                      </Badge>
                      <span className="text-gray-500 text-xs">{l.detectedAt ? new Date(l.detectedAt).toLocaleDateString("ar-SA") : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
