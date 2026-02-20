/**
 * IncidentCompare — مقارنة الحوادث
 * مربوط بـ leaks.list API
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GitCompare, Plus, X, AlertTriangle } from "lucide-react";

const severityLabels: Record<string, string> = { critical: "حرج", high: "عالي", medium: "متوسط", low: "منخفض" };
const severityColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-amber-500/20 text-amber-400", medium: "bg-blue-500/20 text-blue-400", low: "bg-gray-500/20 text-gray-400" };

export default function IncidentCompare() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (idx: number) => {
    setSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : prev.length < 4 ? [...prev, idx] : prev);
  };

  const compared = useMemo(() => selected.map(i => leaks[i]).filter(Boolean), [selected, leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-gray-800" />)}</div>;

  const fields = [
    { key: "severity", label: "الخطورة", render: (l: any) => <Badge className={severityColors[l.severity]}>{severityLabels[l.severity] || l.severity}</Badge> },
    { key: "recordCount", label: "السجلات", render: (l: any) => <span className="text-red-400 font-bold">{(l.recordCount || 0).toLocaleString("ar-SA")}</span> },
    { key: "sector", label: "القطاع", render: (l: any) => <span>{l.sectorAr || l.sector || "---"}</span> },
    { key: "organization", label: "المنظمة", render: (l: any) => <span>{l.organizationAr || l.organization || "---"}</span> },
    { key: "source", label: "المصدر", render: (l: any) => <span>{l.sourceAr || l.source || "---"}</span> },
    { key: "threatActor", label: "الجهة المهددة", render: (l: any) => <span>{l.threatActorAr || l.threatActor || "---"}</span> },
    { key: "leakType", label: "نوع التسريب", render: (l: any) => <span>{l.leakTypeAr || l.leakType || "---"}</span> },
    { key: "region", label: "المنطقة", render: (l: any) => <span>{l.regionAr || l.region || "---"}</span> },
    { key: "detectedAt", label: "تاريخ الاكتشاف", render: (l: any) => <span>{l.detectedAt ? new Date(l.detectedAt).toLocaleDateString("ar-SA") : "---"}</span> },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div><h1 className="text-2xl font-bold text-white">مقارنة الحوادث</h1><p className="text-gray-400 text-sm mt-1">اختر حتى 4 حوادث للمقارنة</p></div>
      {compared.length >= 2 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><GitCompare className="h-5 w-5 text-blue-400" />جدول المقارنة</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-right text-gray-400 p-2 w-32">الحقل</th>
                    {compared.map((l: any, i: number) => <th key={i} className="text-center text-white p-2 min-w-[180px]">{(l.titleAr || l.title || "").substring(0, 30)}<Button variant="ghost" size="sm" className="text-red-400 mr-1" onClick={() => toggle(selected[i])}><X className="h-3 w-3" /></Button></th>)}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, i) => (
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="p-2 text-gray-400 font-medium">{f.label}</td>
                      {compared.map((l: any, j: number) => <td key={j} className="p-2 text-center text-white">{f.render(l)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        <h3 className="text-white font-medium">اختر الحوادث ({selected.length}/4)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] overflow-auto">
          {leaks.slice(0, 50).map((l: any, i: number) => (
            <button key={i} onClick={() => toggle(i)} className={`p-3 rounded-lg border text-right transition-all ${selected.includes(i) ? "border-blue-500 bg-blue-500/10" : "border-gray-700 bg-gray-800/30 hover:bg-gray-800/50"}`}>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">{(l.titleAr || l.title || "").substring(0, 50)}</span>
                <Badge className={severityColors[l.severity]}>{severityLabels[l.severity]}</Badge>
              </div>
              <p className="text-gray-500 text-xs mt-1">{l.sectorAr || l.sector} • {(l.recordCount || 0).toLocaleString("ar-SA")} سجل</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
