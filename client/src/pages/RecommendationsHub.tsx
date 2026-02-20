/**
 * RecommendationsHub — مركز التوصيات
 * مربوط بـ leaks.list API (aiRecommendations)
 */
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Shield, AlertTriangle, CheckCircle, Filter } from "lucide-react";

const severityLabels: Record<string, string> = { critical: "حرج", high: "عالي", medium: "متوسط", low: "منخفض" };
const severityColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-amber-500/20 text-amber-400", medium: "bg-blue-500/20 text-blue-400", low: "bg-gray-500/20 text-gray-400" };

export default function RecommendationsHub() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [filter, setFilter] = useState("all");

  const recommendations = useMemo(() => {
    return leaks.filter((l: any) => l.aiRecommendationsAr || l.aiRecommendations).map((l: any) => ({
      title: l.titleAr || l.title,
      severity: l.severity,
      sector: l.sectorAr || l.sector,
      recommendation: l.aiRecommendationsAr || l.aiRecommendations,
      organization: l.organizationAr || l.organization,
      recordCount: l.recordCount,
    })).filter((r: any) => filter === "all" || r.severity === filter);
  }, [leaks, filter]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-gray-800" />)}</div>;

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div><h1 className="text-2xl font-bold text-white">مركز التوصيات</h1><p className="text-gray-400 text-sm mt-1">توصيات الذكاء الاصطناعي لمعالجة حوادث التسريب</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Lightbulb className="h-8 w-8 text-amber-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{recommendations.length}</div><div className="text-xs text-gray-400">توصية متاحة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{recommendations.filter(r => r.severity === "critical").length}</div><div className="text-xs text-gray-400">توصيات حرجة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-white">{leaks.length}</div><div className="text-xs text-gray-400">إجمالي الحوادث</div></CardContent></Card>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["all", "critical", "high", "medium", "low"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm ${filter === f ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
            {f === "all" ? "الكل" : severityLabels[f]}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-12 text-center text-gray-400">لا توجد توصيات متاحة</CardContent></Card>
        ) : recommendations.slice(0, 30).map((r, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                  <span className="text-white font-medium text-sm">{r.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={severityColors[r.severity]}>{severityLabels[r.severity]}</Badge>
                  <Badge className="bg-gray-700 text-gray-300">{r.sector}</Badge>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-gray-900/30 rounded-lg p-3">{r.recommendation}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>{r.organization}</span>
                <span>{(r.recordCount || 0).toLocaleString("ar-SA")} سجل متأثر</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
