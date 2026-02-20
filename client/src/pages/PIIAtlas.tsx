/**
 * PIIAtlas — أطلس البيانات الشخصية
 * مربوط بـ leaks.list API
 */
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Fingerprint, Shield, AlertTriangle, Database } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#14b8a6"];

export default function PIIAtlas() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const analysis = useMemo(() => {
    if (!leaks.length) return { piiTypes: [], total: 0, totalRecords: 0 };
    const map: Record<string, { count: number; records: number }> = {};
    leaks.forEach((l: any) => {
      const types = l.piiTypesAr || l.piiTypes || [];
      const arr = Array.isArray(types) ? types : typeof types === "string" ? types.split(",").map((t: string) => t.trim()) : [];
      arr.forEach((t: string) => {
        if (!t) return;
        if (!map[t]) map[t] = { count: 0, records: 0 };
        map[t].count++;
        map[t].records += l.recordCount || 0;
      });
    });
    const piiTypes = Object.entries(map).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count);
    return { piiTypes, total: leaks.length, totalRecords: piiTypes.reduce((s, p) => s + p.records, 0) };
  }, [leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-gray-800" />)}</div>;

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div><h1 className="text-2xl font-bold text-white">أطلس البيانات الشخصية</h1><p className="text-gray-400 text-sm mt-1">تحليل أنواع البيانات الشخصية المسربة (PII)</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Fingerprint className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{analysis.piiTypes.length}</div><div className="text-xs text-gray-400">نوع بيانات شخصية</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{analysis.total}</div><div className="text-xs text-gray-400">حوادث تسريب</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Database className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{analysis.totalRecords.toLocaleString("ar-SA")}</div><div className="text-xs text-gray-400">سجلات متأثرة</div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader><CardTitle className="text-white text-base">أكثر أنواع البيانات تسريباً</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analysis.piiTypes.slice(0, 12)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={130} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader><CardTitle className="text-white text-base">توزيع الأنواع</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={analysis.piiTypes.slice(0, 10)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, percent }) => `${name.substring(0, 12)} ${(percent * 100).toFixed(0)}%`}>
                  {analysis.piiTypes.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">تفاصيل أنواع البيانات الشخصية</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.piiTypes.map((p, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-900/50 border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{p.name}</span>
                  <Badge className="bg-purple-500/20 text-purple-400">{p.count}</Badge>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${analysis.piiTypes[0]?.count ? (p.count / analysis.piiTypes[0].count) * 100 : 0}%` }} />
                </div>
                <p className="text-gray-500 text-xs mt-1">{p.records.toLocaleString("ar-SA")} سجل متأثر</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
