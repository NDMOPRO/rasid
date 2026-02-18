
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitCompare, Search, X, BarChart3, Shield,
  CheckCircle, XCircle, Minus, Download, FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";
import { ScreenshotThumbnail } from "@/components/ScreenshotPreview";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

const CLAUSE_NAMES: Record<number, string> = {
  1: "هوية المتحكم",
  2: "غرض المعالجة",
  3: "الأساس النظامي",
  4: "مدة الاحتفاظ",
  5: "حقوق أصحاب البيانات",
  6: "آلية تقديم الشكاوى",
  7: "مشاركة البيانات",
  8: "حماية البيانات",
};

type ComparisonItem = {
  site: {
    id: number;
    domain: string;
    siteName: string | null;
    sectorType: string | null;
    classification: string | null;
    [key: string]: any;
  };
  latestScan: {
    complianceScore: number | null;
    complianceStatus: string | null;
    clause1: boolean | null;
    clause2: boolean | null;
    clause3: boolean | null;
    clause4: boolean | null;
    clause5: boolean | null;
    clause6: boolean | null;
    clause7: boolean | null;
    clause8: boolean | null;
    scanDate: string | Date | null;
    [key: string]: any;
  } | null;
  scanCount: number;
};

function getSiteName(item: ComparisonItem): string {
  return item.site.siteName || item.site.domain;
}

function getComplianceScore(item: ComparisonItem): number {
  if (!item.latestScan) return 0;
  if (item.latestScan.complianceScore != null) return Number(item.latestScan.complianceScore);
  // Calculate from clauses
  let compliant = 0;
  for (let i = 1; i <= 8; i++) {
    if ((item.latestScan as any)[`clause${i}`]) compliant++;
  }
  return Math.round((compliant / 8) * 100);
}

function getClauseStatus(item: ComparisonItem, clause: number): boolean | null {
  if (!item.latestScan) return null;
  return (item.latestScan as any)[`clause${clause}`] ?? null;
}

function getCompliantClausesCount(item: ComparisonItem): number {
  if (!item.latestScan) return 0;
  let count = 0;
  for (let i = 1; i <= 8; i++) {
    if ((item.latestScan as any)[`clause${i}`]) count++;
  }
  return count;
}

export default function ComplianceComparison() {
  const { playClick, playHover } = useSoundEffects();
  const [selectedSiteIds, setSelectedSiteIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();
  const exportExcelMut = trpc.comparisonExport.exportExcel.useMutation();

  const { data: allSitesData } = trpc.sites.list.useQuery({ page: 1, limit: 500 });
  const allSites = allSitesData?.sites || [];

  const { data: comparison, isLoading: isComparing } = trpc.complianceComparison.compare.useQuery(
    { siteIds: selectedSiteIds },
    { enabled: selectedSiteIds.length >= 2 }
  ) as { data: ComparisonItem[] | undefined; isLoading: boolean };

  const filteredSites = useMemo(() => {
    if (!allSites.length) return [];
    if (!searchQuery) return allSites;
    return allSites.filter((s: any) =>
      (s.siteName || "").includes(searchQuery) || s.domain.includes(searchQuery)
    );
  }, [allSites, searchQuery]);

  const toggleSite = (siteId: number) => {
    setSelectedSiteIds(prev =>
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : prev.length < 8
          ? [...prev, siteId]
          : prev
    );
  };

  const removeSite = (siteId: number) => {
    setSelectedSiteIds(prev => prev.filter(id => id !== siteId));
  };

  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (!comparison) return [];
    return Array.from({ length: 8 }, (_, i) => {
      const clause = i + 1;
      const entry: any = { clause: `البند ${clause}`, clauseName: CLAUSE_NAMES[clause] };
      comparison.forEach((item) => {
        const name = getSiteName(item);
        entry[name] = getClauseStatus(item, clause) ? 100 : 0;
      });
      return entry;
    });
  }, [comparison]);

  // Prepare bar chart data
  const barData = useMemo(() => {
    if (!comparison) return [];
    return comparison.map((item) => {
      const name = getSiteName(item);
      return {
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        score: getComplianceScore(item),
        compliantClauses: getCompliantClausesCount(item),
        item: item
      };
    });
  }, [comparison]);

  return (
    <div
      className="p-6 space-y-6" dir="rtl">
      <WatermarkLogo />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <GitCompare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">مقارنة الامتثال</h1>
            <p className="text-sm text-muted-foreground">مقارنة حالة الامتثال بين جهتين أو أكثر جنباً إلى جنب</p>
          </div>
        </div>
        {selectedSiteIds.length >= 2 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 hover:shadow-lg transition-all" disabled={exportExcelMut.isPending} onClick={async () => {
              try {
                const result = await exportExcelMut.mutateAsync({ siteIds: selectedSiteIds });
                const blob = new Blob([Uint8Array.from(atob(result.base64), c => c.charCodeAt(0))], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = result.filename; a.click(); URL.revokeObjectURL(url);
                toast.success('تم تصدير التقرير بنجاح');
              } catch { toast.error('فشل في تصدير التقرير'); }
            }}>
              <FileSpreadsheet className="w-4 h-4" />
              {exportExcelMut.isPending ? 'جاري التصدير...' : 'تصدير Excel'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 stagger-children">
        {/* Site Selection Panel */}
        <Card className="lg:col-span-1 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="gradient-text text-base">اختيار الجهات</CardTitle>
            <p className="text-xs text-muted-foreground">اختر 2-8 جهات للمقارنة</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute end-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pe-9"
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Selected sites */}
            {selectedSiteIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedSiteIds.map((id, idx) => {
                  const site = allSites.find((s: any) => s.id === id);
                  return (
                    <Badge key={id} variant="secondary" className="text-xs cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" style={{ borderColor: COLORS[idx] }} onClick={() => openDrillDown({ title: "الجهات المحددة", subtitle: `عرض الجهات التي تم تحديدها للمقارنة`, siteId: id })}>
                      {(site as any)?.siteName?.substring(0, 15) || (site as any)?.domain?.substring(0, 15) || id}
                      <button onClick={(e) => { e.stopPropagation(); removeSite(id); }} className="me-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {filteredSites.map((site: any) => (
                  <div
                    key={site.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${selectedSiteIds.includes(site.id) ? "bg-primary/5 border border-primary/20" : ""}`}
                    onClick={() => toggleSite(site.id)}
                  >
                    <Checkbox checked={selectedSiteIds.includes(site.id)} />
                    <ScreenshotThumbnail url={site.screenshotUrl} domain={site.domain} size="xs" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{site.siteName || site.domain}</p>
                      <p className="text-xs text-muted-foreground truncate">{site.domain}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {selectedSiteIds.length < 2 && (
              <p className="text-xs text-center text-muted-foreground">
                اختر جهتين على الأقل لبدء المقارنة
              </p>
            )}
          </CardContent>
        </Card>

        {/* Comparison Results */}
        <div className="lg:col-span-3 space-y-6">
          {selectedSiteIds.length < 2 ? (
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-12 text-center">
                <GitCompare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-lg font-medium mb-2">اختر جهتين على الأقل</p>
                <p className="text-sm text-muted-foreground">حدد الجهات من القائمة الجانبية لعرض المقارنة التفصيلية</p>
              </CardContent>
            </Card>
          ) : isComparing ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6"><div className="h-32 bg-muted rounded" /></CardContent>
                </Card>
              ))}
            </div>
          ) : comparison && comparison.length > 0 ? (
            <>
              {/* Score Comparison Bar Chart */}
              <Card className="cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" onClick={() => openDrillDown({ title: "مقارنة نسب الامتثال", subtitle: "عرض تفصيلي لنسب امتثال الجهات" })}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    مقارنة نسب الامتثال
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => `${v}%`} />
                      <Bar dataKey="score" name="نسبة الامتثال" fill="#3b82f6" radius={[0, 4, 4, 0]} onClick={(data) => openDrillDown({ title: `تفاصيل امتثال ${data.name}`, subtitle: `نسبة الامتثال: ${data.score}%`, siteId: data.item.site.id })} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card className="cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all glass-card gold-sweep" onClick={() => openDrillDown({ title: "مقارنة بنود المادة 12", subtitle: "تحليل تفصيلي لامتثال كل جهة ببنود المادة 12" })}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    مقارنة بنود المادة 12
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData} onClick={(e: any) => e && e.activeLabel && openDrillDown({ title: `تفاصيل البند`, subtitle: `تحليل امتثال الجهات للبند ${e.activeLabel}`, clauseIndex: parseInt(e.activeLabel.split(' ')[1]) })}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="clause" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} />
                      {comparison.map((item, idx) => (
                        <Radar
                          key={item.site.id}
                          name={getSiteName(item)}
                          dataKey={getSiteName(item)}
                          stroke={COLORS[idx]}
                          fill={COLORS[idx]}
                          fillOpacity={0.15}
                        />
                      ))}
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Detailed Clause Comparison Table */}
              <Card className="glass-card gold-sweep">
                <CardHeader>
                  <CardTitle className="text-base">جدول مقارنة تفصيلي</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-[600px] overflow-y-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-end font-semibold sticky top-0 bg-card z-10">البند</th>
                          {comparison.map((item, idx) => (
                            <th key={item.site.id} className="p-2 text-center font-semibold sticky top-0 bg-card z-10" style={{ color: COLORS[idx] }}>
                              {getSiteName(item)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 8 }, (_, i) => {
                          const clause = i + 1;
                          return (
                            <tr key={clause} className="border-b hover:bg-muted/50">
                              <td className="p-2 font-medium cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: `البند ${clause}: ${CLAUSE_NAMES[clause]}`, subtitle: "تحليل الامتثال لهذا البند عبر الجهات", clauseIndex: clause })}>{CLAUSE_NAMES[clause]}</td>
                              {comparison.map((item) => {
                                const status = getClauseStatus(item, clause);
                                return (
                                  <td key={item.site.id} className="p-2 text-center cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: `امتثال ${getSiteName(item)}`, subtitle: `حالة البند ${clause}: ${status ? 'ملتزم' : 'غير ملتزم'}`, siteId: item.site.id, clauseIndex: clause })}>
                                    {status === true && <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />}
                                    {status === false && <XCircle className="h-5 w-5 text-red-500 mx-auto" />}
                                    {status === null && <Minus className="h-5 w-5 text-gray-400 mx-auto" />}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="glass-card gold-sweep">
              <CardContent className="p-12 text-center">
                <p>لم يتم العثور على بيانات للمقارنة.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
