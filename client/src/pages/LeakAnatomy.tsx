/**
 * LeakAnatomy — تشريح التسريب
 * مربوط بـ leaks.list API - عرض تفصيلي لحادثة واحدة
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Shield, Users, Calendar, Building2, Globe, Fingerprint, ChevronLeft, ChevronRight } from "lucide-react";

const severityLabels: Record<string, string> = { critical: "حرج", high: "عالي", medium: "متوسط", low: "منخفض" };
const severityColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400 border-red-500/30", high: "bg-amber-500/20 text-amber-400 border-amber-500/30", medium: "bg-blue-500/20 text-blue-400 border-blue-500/30", low: "bg-gray-500/20 text-gray-400 border-gray-500/30" };

export default function LeakAnatomy() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return leaks;
    return leaks.filter((l: any) => (l.titleAr || l.title || "").includes(search) || (l.organizationAr || l.organization || "").includes(search));
  }, [leaks, search]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-gray-800" />)}</div>;

  const leak: any = filtered[selectedIndex] || null;

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div><h1 className="text-2xl font-bold text-white">تشريح التسريب</h1><p className="text-gray-400 text-sm mt-1">عرض تفصيلي لكل حادثة تسريب</p></div>
      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder="بحث عن حادثة..." value={search} onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }} className="bg-gray-800 border-gray-700 text-white max-w-xs" />
        <Badge className="bg-gray-700 text-gray-300">{filtered.length} حادثة</Badge>
        <div className="flex items-center gap-1 mr-auto">
          <Button variant="outline" size="sm" disabled={selectedIndex <= 0} onClick={() => setSelectedIndex(i => i - 1)} className="border-gray-600 text-gray-400"><ChevronRight className="h-4 w-4" /></Button>
          <span className="text-gray-400 text-sm px-2">{selectedIndex + 1} / {filtered.length}</span>
          <Button variant="outline" size="sm" disabled={selectedIndex >= filtered.length - 1} onClick={() => setSelectedIndex(i => i + 1)} className="border-gray-600 text-gray-400"><ChevronLeft className="h-4 w-4" /></Button>
        </div>
      </div>
      {leak ? (
        <div className="space-y-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">{leak.titleAr || leak.title}</h2>
                  <p className="text-gray-400 text-sm">{leak.descriptionAr || leak.description || "لا يوجد وصف"}</p>
                </div>
                <Badge className={`text-lg px-4 py-2 ${severityColors[leak.severity] || "bg-gray-500/20 text-gray-400"}`}>{severityLabels[leak.severity] || leak.severity}</Badge>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Users className="h-5 w-5 text-red-400" /><span className="text-gray-400 text-sm">السجلات المتأثرة</span></div><p className="text-2xl font-bold text-white">{(leak.recordCount || 0).toLocaleString("ar-SA")}</p></CardContent></Card>
            <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Building2 className="h-5 w-5 text-blue-400" /><span className="text-gray-400 text-sm">المنظمة</span></div><p className="text-lg font-bold text-white">{leak.organizationAr || leak.organization || "---"}</p></CardContent></Card>
            <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Shield className="h-5 w-5 text-purple-400" /><span className="text-gray-400 text-sm">القطاع</span></div><p className="text-lg font-bold text-white">{leak.sectorAr || leak.sector || "---"}</p></CardContent></Card>
            <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Calendar className="h-5 w-5 text-emerald-400" /><span className="text-gray-400 text-sm">تاريخ الاكتشاف</span></div><p className="text-lg font-bold text-white">{leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA") : "---"}</p></CardContent></Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader><CardTitle className="text-white text-base">معلومات إضافية</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "المصدر", value: leak.sourceAr || leak.source },
                  { label: "نوع التسريب", value: leak.leakTypeAr || leak.leakType },
                  { label: "الجهة المهددة", value: leak.threatActorAr || leak.threatActor },
                  { label: "المنطقة", value: leak.regionAr || leak.region },
                  { label: "الدولة", value: leak.countryAr || leak.country },
                  { label: "الحالة", value: leak.statusAr || leak.status },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between p-2 rounded bg-gray-900/30">
                    <span className="text-gray-400 text-sm">{item.label}</span>
                    <span className="text-white text-sm font-medium">{item.value || "---"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader><CardTitle className="text-white text-base">البيانات الشخصية المسربة</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(leak.piiTypesAr || leak.piiTypes) ? (leak.piiTypesAr || leak.piiTypes) : typeof (leak.piiTypesAr || leak.piiTypes) === "string" ? (leak.piiTypesAr || leak.piiTypes).split(",") : []).map((t: string, i: number) => (
                    <Badge key={i} className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Fingerprint className="h-3 w-3 ml-1" />{t.trim()}</Badge>
                  ))}
                  {(!leak.piiTypesAr && !leak.piiTypes) && <p className="text-gray-400 text-sm">لا توجد بيانات</p>}
                </div>
              </CardContent>
            </Card>
          </div>
          {(leak.aiRecommendationsAr || leak.aiRecommendations) && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader><CardTitle className="text-white text-base">توصيات الذكاء الاصطناعي</CardTitle></CardHeader>
              <CardContent><p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{leak.aiRecommendationsAr || leak.aiRecommendations}</p></CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-12 text-center text-gray-400">لا توجد حوادث مطابقة</CardContent></Card>
      )}
    </div>
  );
}
