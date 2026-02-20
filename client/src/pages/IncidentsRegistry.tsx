/**
 * IncidentsRegistry — سجل الحوادث
 * مربوط بـ leaks.list API
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Shield, FileText, Download, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const severityLabels: Record<string, string> = { critical: "حرج", high: "عالي", medium: "متوسط", low: "منخفض" };
const severityColors: Record<string, string> = { critical: "bg-red-500/20 text-red-400", high: "bg-amber-500/20 text-amber-400", medium: "bg-blue-500/20 text-blue-400", low: "bg-gray-500/20 text-muted-foreground" };

export default function IncidentsRegistry() {
  const { data: leaks = [], isLoading } = trpc.leaks.list.useQuery();
  const [search, setSearch] = useState("");
  const [sevFilter, setSevFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const filtered = useMemo(() => {
    let result = [...leaks];
    if (search) result = result.filter((l: any) => (l.titleAr || l.title || "").includes(search) || (l.organizationAr || l.organization || "").includes(search) || (l.sectorAr || l.sector || "").includes(search));
    if (sevFilter !== "all") result = result.filter((l: any) => l.severity === sevFilter);
    return result.sort((a: any, b: any) => new Date(b.detectedAt || b.createdAt).getTime() - new Date(a.detectedAt || a.createdAt).getTime());
  }, [leaks, search, sevFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-card" />)}</div>;

  return (
    <div className="min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold text-foreground">سجل الحوادث</h1><p className="text-muted-foreground text-sm mt-1">قائمة شاملة بجميع حوادث التسريب</p></div>
        <Badge className="bg-gray-700 text-muted-foreground text-lg px-4 py-2">{filtered.length} حادثة</Badge>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Input placeholder="بحث..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="glass-card gold-sweep text-foreground max-w-xs" />
        <div className="flex gap-1">
          {["all", "critical", "high", "medium", "low"].map(f => (
            <button key={f} onClick={() => { setSevFilter(f); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs ${sevFilter === f ? "bg-blue-600 text-foreground" : "bg-card text-muted-foreground hover:bg-gray-700"}`}>
              {f === "all" ? "الكل" : severityLabels[f]}
            </button>
          ))}
        </div>
      </div>
      <Card className="glass-card gold-sweep">
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-gray-900/50">
                <th className="text-right text-muted-foreground p-3">الحادثة</th>
                <th className="text-center text-muted-foreground p-3">الخطورة</th>
                <th className="text-center text-muted-foreground p-3">القطاع</th>
                <th className="text-center text-muted-foreground p-3">المنظمة</th>
                <th className="text-center text-muted-foreground p-3">السجلات</th>
                <th className="text-center text-muted-foreground p-3">التاريخ</th>
              </tr></thead>
              <tbody>
                {paged.map((l: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-card/30">
                    <td className="p-3 text-foreground font-medium max-w-xs truncate">{l.titleAr || l.title}</td>
                    <td className="p-3 text-center"><Badge className={severityColors[l.severity]}>{severityLabels[l.severity]}</Badge></td>
                    <td className="p-3 text-center text-muted-foreground">{l.sectorAr || l.sector || "---"}</td>
                    <td className="p-3 text-center text-muted-foreground">{(l.organizationAr || l.organization || "---").substring(0, 25)}</td>
                    <td className="p-3 text-center text-red-400 font-bold">{(l.recordCount || 0).toLocaleString("ar-SA")}</td>
                    <td className="p-3 text-center text-muted-foreground text-xs">{l.detectedAt ? new Date(l.detectedAt).toLocaleDateString("ar-SA") : "---"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border-border text-muted-foreground"><ChevronRight className="h-4 w-4" /></Button>
          <span className="text-muted-foreground text-sm">صفحة {page} من {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border-border text-muted-foreground"><ChevronLeft className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
