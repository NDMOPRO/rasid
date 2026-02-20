/**
 * CampaignTracker — متتبع الحملات
 * مربوط بـ leaks.list API
 */
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Calendar, Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function CampaignTracker() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [selectedActor, setSelectedActor] = useState<string | null>(null);

  const analysis = useMemo(() => {
    if (!leaks.length) return { campaigns: [], timeline: [] };
    const actorMap: Record<string, { leaks: any[]; sectors: Set<string>; firstSeen: string; lastSeen: string }> = {};
    leaks.forEach((l: any) => {
      const a = l.threatActorAr || l.threatActor || "غير معروف";
      if (!actorMap[a]) actorMap[a] = { leaks: [], sectors: new Set(), firstSeen: l.detectedAt || l.createdAt, lastSeen: l.detectedAt || l.createdAt };
      actorMap[a].leaks.push(l);
      actorMap[a].sectors.add(l.sectorAr || l.sector || "");
      const d = l.detectedAt || l.createdAt;
      if (d < actorMap[a].firstSeen) actorMap[a].firstSeen = d;
      if (d > actorMap[a].lastSeen) actorMap[a].lastSeen = d;
    });
    const campaigns = Object.entries(actorMap).map(([name, d]) => ({
      name, count: d.leaks.length, sectors: d.sectors.size,
      records: d.leaks.reduce((s, l) => s + (l.recordCount || 0), 0),
      critical: d.leaks.filter(l => l.severity === "critical").length,
      firstSeen: d.firstSeen, lastSeen: d.lastSeen,
    })).sort((a, b) => b.count - a.count);
    return { campaigns };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-gray-800" />)}</div>;

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div><h1 className="text-2xl font-bold text-white">متتبع الحملات</h1><p className="text-gray-400 text-sm mt-1">تتبع حملات التهديد ونشاط الجهات الفاعلة</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Target className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{analysis.campaigns.length}</div><div className="text-xs text-gray-400">حملة نشطة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{analysis.campaigns.reduce((s, c) => s + c.critical, 0)}</div><div className="text-xs text-gray-400">هجمات حرجة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{leaks.length}</div><div className="text-xs text-gray-400">إجمالي الحوادث</div></CardContent></Card>
      </div>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">نشاط الحملات</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.campaigns.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="الحوادث" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">تفاصيل الحملات</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-700"><th className="text-right text-gray-400 p-2">الجهة</th><th className="text-center text-gray-400 p-2">الحوادث</th><th className="text-center text-gray-400 p-2">السجلات</th><th className="text-center text-gray-400 p-2">القطاعات</th><th className="text-center text-gray-400 p-2">حرج</th><th className="text-center text-gray-400 p-2">أول ظهور</th><th className="text-center text-gray-400 p-2">آخر نشاط</th></tr></thead>
              <tbody>
                {analysis.campaigns.map((c, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="p-2 text-white font-medium">{c.name}</td>
                    <td className="p-2 text-center text-white">{c.count}</td>
                    <td className="p-2 text-center text-gray-300">{c.records.toLocaleString("ar-SA")}</td>
                    <td className="p-2 text-center"><Badge className="bg-purple-500/20 text-purple-400">{c.sectors}</Badge></td>
                    <td className="p-2 text-center"><Badge className="bg-red-500/20 text-red-400">{c.critical}</Badge></td>
                    <td className="p-2 text-center text-gray-400 text-xs">{c.firstSeen ? new Date(c.firstSeen).toLocaleDateString("ar-SA") : "---"}</td>
                    <td className="p-2 text-center text-gray-400 text-xs">{c.lastSeen ? new Date(c.lastSeen).toLocaleDateString("ar-SA") : "---"}</td>
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
