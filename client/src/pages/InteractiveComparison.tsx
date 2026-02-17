import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  GitCompareArrows, Search, X, BarChart3, Shield, TrendingUp,
  CheckCircle, XCircle, Minus, Plus, Radar as RadarIcon,
  ArrowUpDown, Globe, Loader2, Download, Eye
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from "recharts";
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
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

const STATUS_LABELS: Record<string, string> = {
  compliant: "ممتثل",
  partially_compliant: "ممتثل جزئياً",
  non_compliant: "غير ممتثل",
  no_policy: "لا توجد سياسة",
  not_working: "لا يعمل",
};

const STATUS_COLORS: Record<string, string> = {
  compliant: "bg-green-100 bg-green-900/30 text-green-400",
  partially_compliant: "bg-amber-100 bg-amber-900/30 text-amber-400",
  non_compliant: "bg-red-100 bg-red-900/30 text-red-400",
  no_policy: "bg-gray-100 bg-gray-900/30 text-gray-400",
  not_working: "bg-gray-100 bg-gray-900/30 text-gray-400",
};

export default function InteractiveComparison() {
  const { playClick, playHover } = useSoundEffects();
  const [selectedSiteIds, setSelectedSiteIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const exportExcelMut = trpc.comparisonExport.exportExcel.useMutation();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();

  const { data: allSites, isLoading: sitesLoading } = trpc.comparisonDashboard.allSites.useQuery();
  const { data: comparisonData, isLoading: compareLoading } = trpc.comparisonDashboard.detailedCompare.useQuery(
    { siteIds: selectedSiteIds },
    { enabled: selectedSiteIds.length >= 2 }
  );

  const filteredSites = useMemo(() => {
    if (!allSites) return [];
    if (!searchQuery.trim()) return allSites;
    const q = searchQuery.toLowerCase();
    return allSites.filter((s: any) =>
      s.domain?.toLowerCase().includes(q) ||
      s.siteName?.toLowerCase().includes(q) ||
      s.classification?.toLowerCase().includes(q)
    );
  }, [allSites, searchQuery]);

  const toggleSite = (siteId: number) => {
    setSelectedSiteIds(prev => {
      if (prev.includes(siteId)) return prev.filter(id => id !== siteId);
      if (prev.length >= 8) {
        toast.error("الحد الأقصى 8 مواقع للمقارنة");
        return prev;
      }
      return [...prev, siteId];
    });
  };

  const removeSite = (siteId: number) => {
    setSelectedSiteIds(prev => prev.filter(id => id !== siteId));
  };

  const radarData = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return [];
    return Array.from({ length: 8 }, (_, i) => {
      const clauseNum = i + 1;
      const point: any = { clause: `بند ${clauseNum}`, fullName: CLAUSE_NAMES[clauseNum] };
      comparisonData.forEach((item: any, idx: number) => {
        const scan = item.latestScan;
        point[`site_${idx}`] = scan ? (scan[`clause${clauseNum}Compliant`] ? 100 : 0) : 0;
      });
      return point;
    });
  }, [comparisonData]);

  const scoreBarData = useMemo(() => {
    if (!comparisonData) return [];
    return comparisonData.map((item: any, idx: number) => ({
      name: item.site.siteName || item.site.domain,
      score: item.latestScan?.overallScore || 0,
      fill: COLORS[idx % COLORS.length],
      siteId: item.site.id,
    }));
  }, [comparisonData]);

  const trendData = useMemo(() => {
    if (!comparisonData) return [];
    const timeMap = new Map<string, any>();
    comparisonData.forEach((item: any, idx: number) => {
      (item.trendScans || []).forEach((scan: any) => {
        const date = new Date(scan.createdAt).toLocaleDateString("ar-SA-u-nu-latn", { month: "short", day: "numeric" });
        if (!timeMap.has(date)) timeMap.set(date, { date });
        timeMap.get(date)![`site_${idx}`] = scan.overallScore || 0;
      });
    });
    return Array.from(timeMap.values());
  }, [comparisonData]);

  const clauseComparisonData = useMemo(() => {
    if (!comparisonData) return [];
    return Array.from({ length: 8 }, (_, i) => {
      const clauseNum = i + 1;
      const row: any = { clause: `بند ${clauseNum}`, name: CLAUSE_NAMES[clauseNum], clauseIndex: clauseNum };
      comparisonData.forEach((item: any, idx: number) => {
        const scan = item.latestScan;
        row[`site_${idx}`] = scan ? (scan[`clause${clauseNum}Compliant`] ? 1 : 0) : 0;
      });
      return row;
    });
  }, [comparisonData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
              <GitCompareArrows className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text">لوحة المقارنة التفاعلية</span>
          </h1>
          <p className="text-muted-foreground mt-1">مقارنة بصرية شاملة بين المواقع مع رسوم بيانية تفاعلية</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: "المواقع المحددة" })}>
            {selectedSiteIds.length} / 8 مواقع محددة
          </Badge>
          {selectedSiteIds.length >= 2 && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={async () => {
              try {
                const result = await exportExcelMut.mutateAsync({ siteIds: selectedSiteIds });
                const blob = new Blob([Uint8Array.from(atob(result.base64), c => c.charCodeAt(0))], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = result.filename; a.click(); URL.revokeObjectURL(url);
                toast.success('تم تصدير التقرير');
              } catch { toast.error('فشل في التصدير'); }
            }} disabled={exportExcelMut.isPending}>
              <Download className="h-4 w-4" />
              {exportExcelMut.isPending ? 'جاري...' : 'تصدير Excel'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className="gap-1.5"
          >
            {showSearch ? <Eye className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            {showSearch ? "إخفاء البحث" : "إظهار البحث"}
          </Button>
          {selectedSiteIds.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setSelectedSiteIds([])} className="gap-1.5 text-red-600">
              <X className="h-4 w-4" />
              مسح الكل
            </Button>
          )}
        </div>
      </div>

      {selectedSiteIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSiteIds.map((id, idx) => {
            const site = allSites?.find((s: any) => s.id === id);
            return (
              <Badge
                key={id}
                variant="secondary"
                className="text-sm px-3 py-1.5 gap-2 cursor-pointer hover:bg-destructive/10"
                style={{ borderColor: COLORS[idx % COLORS.length], borderWidth: 2 }}
                onClick={() => removeSite(id)}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                {site?.siteName || site?.domain || `#${id}`}
                <X className="h-3 w-3 opacity-60" />
              </Badge>
            );
          })}
        </div>
      )}

      
        {showSearch && (
          <div
          >
            <Card className="glass-card gold-sweep">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  اختر المواقع للمقارنة (2-8 مواقع)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-3">
                  <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالنطاق أو الاسم أو التصنيف..."
                    className="pe-10"
                  />
                </div>
                <ScrollArea className="h-[280px]">
                  {sitesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : filteredSites.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>لا توجد نتائج</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 stagger-children">
                      {filteredSites.map((site: any) => {
                        const isSelected = selectedSiteIds.includes(site.id);
                        const idx = selectedSiteIds.indexOf(site.id);
                        return (
                          <button
                            key={site.id}
                            onClick={() => toggleSite(site.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border text-end transition-all duration-200 w-full ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/50"
                            }`}
                          >
                            {isSelected ? (
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}>
                                {idx + 1}
                              </span>
                            ) : (
                              <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate">{site.siteName || site.domain}</p>
                              <p className="text-xs text-muted-foreground truncate">{site.classification}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      

      {compareLoading && selectedSiteIds.length >= 2 && (
        <div className="flex items-center justify-center py-16 text-lg gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>جاري تحليل البيانات وإعداد المقارنة...</span>
        </div>
      )}

      {selectedSiteIds.length < 2 && (
        <div className="text-center py-16 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4">
          <GitCompareArrows className="h-12 w-12 text-muted-foreground/50" />
          <div className="text-lg font-medium text-muted-foreground">الرجاء تحديد موقعين على الأقل لبدء المقارنة</div>
          <p className="text-sm text-muted-foreground/80 max-w-md">استخدم لوحة البحث أعلاه لاختيار المواقع التي ترغب في مقارنتها. يمكنك مقارنة ما يصل إلى 8 مواقع في وقت واحد.</p>
        </div>
      )}

      {comparisonData && selectedSiteIds.length >= 2 && (
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 me-2" />نظرة عامة</TabsTrigger>
            <TabsTrigger value="clauses"><Shield className="w-4 h-4 me-2" />تفاصيل البنود</TabsTrigger>
            <TabsTrigger value="trends"><TrendingUp className="w-4 h-4 me-2" />اتجاهات الأداء</TabsTrigger>
            <TabsTrigger value="radar"><RadarIcon className="w-4 h-4 me-2" />مخطط راداري</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {(comparisonData as any[]).map((item, idx) => (
                <Card key={item.site.id} className="flex flex-col cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: `تفاصيل موقع ${item.site.siteName}`, subtitle: "نظرة عامة على الامتثال", icon: <Globe /> })}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="gradient-text text-sm font-medium truncate">{item.site.siteName || item.site.domain}</CardTitle>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="text-2xl font-bold mb-2">{item.latestScan?.overallScore || 0}%</div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={(e) => { e.stopPropagation(); openDrillDown({ title: "مواقع القطاع العام", sectorType: "public" }); }}>
                        {item.site.sectorType === 'public' ? 'قطاع عام' : 'قطاع خاص'}
                      </Badge>
                      <Badge variant="outline" className="truncate max-w-[120px] cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={(e) => { e.stopPropagation(); openDrillDown({ title: `تصنيف: ${item.site.classification}`, classification: item.site.classification }); }}>
                        {item.site.classification}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <Card className="glass-card gold-sweep">
                <CardHeader>
                  <CardTitle>مقارنة نقاط الامتثال</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreBarData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="score" onClick={(data) => openDrillDown({ title: `تفاصيل موقع ${data.name}`, subtitle: `نقاط الامتثال: ${data.score}%`})} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clauses" className="pt-6">
            <Card className="glass-card gold-sweep">
              <CardHeader>
                <CardTitle>مقارنة تفصيلية للبنود</CardTitle>
                <p className="text-sm text-muted-foreground">مقارنة حالة الامتثال لكل بند في سياسات الخصوصية.</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-end">
                    <thead className="border-b">
                      <tr className="[&_th]:px-4 [&_th]:py-3 [&_th]:font-semibold">
                        <th className="text-end sticky right-0 bg-card min-w-[150px]">البند</th>
                        {(comparisonData as any[]).map((item, idx) => (
                          <th key={item.site.id} className="text-center min-w-[120px] truncate">
                            <div className="flex items-center justify-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              {item.site.siteName}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clauseComparisonData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b hover:bg-muted/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: `تفاصيل البند: ${row.name}`, clauseIndex: row.clauseIndex })}>
                          <td className="px-4 py-3 font-medium sticky right-0 bg-card">
                            <div className="font-bold">{row.clause}</div>
                            <div className="text-xs text-muted-foreground">{row.name}</div>
                          </td>
                          {(comparisonData as any[]).map((_, colIndex) => (
                            <td key={colIndex} className="px-4 py-3 text-center">
                              {row[`site_${colIndex}`] === 1 ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="pt-6">
            <Card className="glass-card gold-sweep">
              <CardHeader>
                <CardTitle>اتجاهات نقاط الامتثال عبر الزمن</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    {(comparisonData as any[]).map((item, idx) => (
                      <Area
                        key={item.site.id}
                        type="monotone"
                        dataKey={`site_${idx}`}
                        name={item.site.siteName || item.site.domain}
                        stroke={COLORS[idx % COLORS.length]}
                        fill={COLORS[idx % COLORS.length]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                        onClick={() => openDrillDown({ title: `اتجاهات أداء ${item.site.siteName}`})}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="radar" className="pt-6">
            <Card className="glass-card gold-sweep">
              <CardHeader>
                <CardTitle>مخطط راداري لمقارنة البنود</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="fullName" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    {(comparisonData as any[]).map((item, idx) => (
                      <Radar
                        key={item.site.id}
                        name={item.site.siteName || item.site.domain}
                        dataKey={`site_${idx}`}
                        stroke={COLORS[idx % COLORS.length]}
                        fill={COLORS[idx % COLORS.length]}
                        fillOpacity={0.6}
                        onClick={() => openDrillDown({ title: `مقارنة رادارية لـ ${item.site.siteName}`})}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}

