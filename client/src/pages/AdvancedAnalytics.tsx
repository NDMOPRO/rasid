import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BarChart3, PieChart, GitBranch } from "lucide-react";
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const CLAUSE_NAMES: Record<string, string> = {
  clause1: "الإفصاح عن جمع البيانات",
  clause2: "تحديد الغرض من الجمع",
  clause3: "الأساس القانوني للمعالجة",
  clause4: "حقوق أصحاب البيانات",
  clause5: "مشاركة البيانات مع أطراف ثالثة",
  clause6: "حماية البيانات وأمنها",
  clause7: "الاحتفاظ بالبيانات وحذفها",
  clause8: "معلومات الاتصال بمسؤول الحماية",
};

const STATUS_COLORS: Record<string, string> = {
  compliant: "#10b981",
  partial: "#f59e0b",
  nonCompliant: "#ef4444",
  noPolicy: "#6b7280",
};

export default function AdvancedAnalytics() {
  const { playClick, playHover } = useSoundEffects();
  const [months, setMonths] = useState(12);
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();

  const { data: monthlyData, isLoading: loadingMonthly } = trpc.analytics.monthlyTrends.useQuery({ months });
  const { data: sectorData, isLoading: loadingSector } = trpc.analytics.sectorTrends.useQuery({ months });
  const { data: categoryData, isLoading: loadingCategory } = trpc.analytics.categoryTrends.useQuery({ months });
  const { data: clauseData, isLoading: loadingClause } = trpc.analytics.clauseTrends.useQuery({ months });

  const monthlyTrends = (monthlyData?.trends || []) as any[];
  const sectorTrends = (sectorData?.trends || []) as any[];
  const categoryTrends = (categoryData?.trends || []) as any[];
  const clauseTrends = (clauseData?.trends || []) as any[];

  // Compute max values for chart scaling
  const maxMonthlyTotal = useMemo(() => Math.max(...monthlyTrends.map((t: any) => Number(t.totalScans) || 0), 1), [monthlyTrends]);
  const maxClauseTotal = useMemo(() => Math.max(...clauseTrends.map((t: any) => Number(t.total) || 0), 1), [clauseTrends]);

  return (
    <div
      className="overflow-x-hidden max-w-full space-y-6" dir="rtl">
      <WatermarkLogo />
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">التحليلات المتقدمة</h1>
          <p className="text-muted-foreground mt-1">اتجاهات الامتثال الشهرية مع مقارنة بين القطاعات والتصنيفات</p>
        </div>
        <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">آخر 3 أشهر</SelectItem>
            <SelectItem value="6">آخر 6 أشهر</SelectItem>
            <SelectItem value="12">آخر 12 شهر</SelectItem>
            <SelectItem value="24">آخر 24 شهر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="trends" className="gap-2"><TrendingUp className="h-4 w-4" /> اتجاهات الامتثال</TabsTrigger>
          <TabsTrigger value="sectors" className="gap-2"><BarChart3 className="h-4 w-4" /> مقارنة القطاعات</TabsTrigger>
          <TabsTrigger value="categories" className="gap-2"><PieChart className="h-4 w-4" /> التصنيفات</TabsTrigger>
          <TabsTrigger value="clauses" className="gap-2"><GitBranch className="h-4 w-4" /> بنود المادة 12</TabsTrigger>
        </TabsList>

        {/* Monthly Compliance Trends */}
        <TabsContent value="trends">
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="gradient-text">اتجاهات الامتثال الشهرية</CardTitle>
              <CardDescription>توزيع حالات الامتثال عبر الأشهر</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMonthly ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">جاري التحميل...</div>
              ) : monthlyTrends.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">لا توجد بيانات كافية</div>
              ) : (
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex gap-6 justify-center text-sm">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> ممتثل</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> ممتثل جزئياً</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> غير ممتثل</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /> لا يعمل</span>
                  </div>
                  {/* Stacked Bar Chart */}
                  <div className="flex items-end gap-1 h-64 border-b border-e border-border pt-4 px-2">
                    {monthlyTrends.map((t: any, i: number) => {
                      const total = Number(t.totalScans) || 1;
                      const compliant = Number(t.compliant) || 0;
                      const partial = Number(t.partial) || 0;
                      const nonComp = Number(t.nonCompliant) || 0;
                      const noPolicy = Number(t.noPolicy) || 0;
                      const heightPct = (total / maxMonthlyTotal) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: `اتجاهات الامتثال`, subtitle: `بيانات تفصيلية لشهر ${t.month}`, icon: <TrendingUp /> })}>
                          <div className="w-full flex flex-col rounded-t overflow-hidden" style={{ height: `${heightPct}%` }}>
                            <div style={{ flex: compliant, backgroundColor: STATUS_COLORS.compliant }} />
                            <div style={{ flex: partial, backgroundColor: STATUS_COLORS.partial }} />
                            <div style={{ flex: nonComp, backgroundColor: STATUS_COLORS.nonCompliant }} />
                            <div style={{ flex: noPolicy, backgroundColor: STATUS_COLORS.noPolicy }} />
                          </div>
                          <span className="text-xs sm:text-[10px] text-muted-foreground rotate-[-45deg] origin-top-right whitespace-nowrap">{t.month}</span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-popover text-popover-foreground border rounded-lg p-2 text-xs hidden group-hover:block z-10 min-w-32 shadow-lg">
                            <div className="font-bold mb-1">{t.month}</div>
                            <div>إجمالي: {total}</div>
                            <div className="text-emerald-500">ممتثل: {compliant}</div>
                            <div className="text-amber-500">ممتثل جزئياً: {partial}</div>
                            <div className="text-red-500">غير ممتثل: {nonComp}</div>
                            <div className="text-gray-400">لا يعمل: {noPolicy}</div>
                            <div className="mt-1 font-semibold">المعدل: {t.avgScore}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Summary Table */}
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-end p-2">الشهر</th>
                          <th className="text-center p-2">إجمالي</th>
                          <th className="text-center p-2">ممتثل</th>
                          <th className="text-center p-2">ممتثل جزئياً</th>
                          <th className="text-center p-2">غير ممتثل</th>
                          <th className="text-center p-2">لا يعمل</th>
                          <th className="text-center p-2">المعدل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyTrends.map((t: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-muted/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: `اتجاهات الامتثال`, subtitle: `بيانات تفصيلية لشهر ${t.month}`, icon: <TrendingUp /> })}>
                            <td className="p-2 font-medium">{t.month}</td>
                            <td className="text-center p-2">{t.totalScans}</td>
                            <td className="text-center p-2 text-emerald-600">{t.compliant}</td>
                            <td className="text-center p-2 text-amber-600">{t.partial}</td>
                            <td className="text-center p-2 text-red-600">{t.nonCompliant}</td>
                            <td className="text-center p-2 text-gray-500">{t.noPolicy}</td>
                            <td className="text-center p-2 font-bold">{t.avgScore}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sector Comparison */}
        <TabsContent value="sectors">
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader>
              <CardTitle>مقارنة القطاعات</CardTitle>
              <CardDescription>مقارنة معدلات الامتثال بين القطاع العام والخاص عبر الأشهر</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSector ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">جاري التحميل...</div>
              ) : sectorTrends.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">لا توجد بيانات كافية</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-6 justify-center text-sm">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> القطاع العام</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary/50 inline-block btn-glow" /> القطاع الخاص</span>
                  </div>
                  {/* Grouped Bar Chart */}
                  {(() => {
                    const monthsSet = Array.from(new Set(sectorTrends.map((t: any) => t.month)));
                    const maxTotal = Math.max(...sectorTrends.map((t: any) => Number(t.totalScans) || 0), 1);
                    return (
                      <div className="flex items-end gap-2 h-64 border-b border-e border-border pt-4 px-2">
                        {monthsSet.map((month, i) => {
                          const publicData = sectorTrends.find((t: any) => t.month === month && t.sectorType === "public");
                          const privateData = sectorTrends.find((t: any) => t.month === month && t.sectorType === "private");
                          const pubCompliant = Number(publicData?.compliant || 0);
                          const pubTotal = Number(publicData?.totalScans || 0);
                          const privCompliant = Number(privateData?.compliant || 0);
                          const privTotal = Number(privateData?.totalScans || 0);
                          const pubRate = pubTotal > 0 ? (pubCompliant / pubTotal * 100) : 0;
                          const privRate = privTotal > 0 ? (privCompliant / privTotal * 100) : 0;
                          return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: `مقارنة القطاعات`, subtitle: `بيانات تفصيلية لشهر ${month}`, icon: <BarChart3 /> })}>
                              <div className="flex items-end gap-1 h-48 w-full justify-center" style={{ height: "100%" }}>
                                <div className="w-[45%] bg-blue-500 rounded-t transition-all" style={{ height: `${pubRate}%`, minHeight: pubTotal > 0 ? "4px" : "0" }} />
                                <div className="w-[45%] bg-primary/50 rounded-t transition-all btn-glow" style={{ height: `${privRate}%`, minHeight: privTotal > 0 ? "4px" : "0" }} />
                              </div>
                              <span className="text-xs sm:text-[10px] text-muted-foreground">{month.slice(5)}</span>
                              <div className="absolute bottom-full mb-2 bg-popover text-popover-foreground border rounded-lg p-2 text-xs hidden group-hover:block z-10 min-w-36 shadow-lg">
                                <div className="font-bold mb-1">{month}</div>
                                <div className="text-blue-500">عام: {pubCompliant}/{pubTotal} ({pubRate.toFixed(0)}%)</div>
                                <div className="text-primary">خاص: {privCompliant}/{privTotal} ({privRate.toFixed(0)}%)</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {/* Sector Summary Table */}
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-end p-2">الشهر</th>
                          <th className="text-center p-2">عام - إجمالي</th>
                          <th className="text-center p-2">عام - ممتثل</th>
                          <th className="text-center p-2">عام - معدل</th>
                          <th className="text-center p-2">خاص - إجمالي</th>
                          <th className="text-center p-2">خاص - ممتثل</th>
                          <th className="text-center p-2">خاص - معدل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from(new Set(sectorTrends.map((t: any) => t.month))).map((month, i) => {
                          const pub = sectorTrends.find((t: any) => t.month === month && t.sectorType === "public");
                          const priv = sectorTrends.find((t: any) => t.month === month && t.sectorType === "private");
                          return (
                            <tr key={i} className="border-b hover:bg-muted/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: `مقارنة القطاعات`, subtitle: `بيانات تفصيلية لشهر ${month}`, icon: <BarChart3 /> })}>
                              <td className="p-2 font-medium">{month}</td>
                              <td className="text-center p-2">{pub?.totalScans || 0}</td>
                              <td className="text-center p-2 text-blue-600">{pub?.compliant || 0}</td>
                              <td className="text-center p-2 font-bold text-blue-600">{pub?.avgScore || 0}%</td>
                              <td className="text-center p-2">{priv?.totalScans || 0}</td>
                              <td className="text-center p-2 text-primary">{priv?.compliant || 0}</td>
                              <td className="text-center p-2 font-bold text-primary">{priv?.avgScore || 0}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Breakdown */}
        <TabsContent value="categories">
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader>
              <CardTitle>تحليل التصنيفات</CardTitle>
              <CardDescription>معدلات الامتثال حسب تصنيف الجهة عبر الأشهر</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCategory ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">جاري التحميل...</div>
              ) : categoryTrends.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">لا توجد بيانات كافية</div>
              ) : (
                <div className="space-y-4">
                  {/* Category cards */}
                  {(() => {
                    const categories = Array.from(new Set(categoryTrends.map((t: any) => t.category)));
                    const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#eab308", "#6366f1", "#ef4444"];
                    return (
                      <>
                        <div className="flex gap-4 flex-wrap justify-center text-sm">
                          {categories.map((cat, i) => (
                            <span key={cat} className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                              {cat}
                            </span>
                          ))}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-end p-2">الشهر</th>
                                {categories.map((cat) => (
                                  <th key={cat} className="text-center p-2">{cat}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from(new Set(categoryTrends.map((t: any) => t.month))).map((month, i) => (
                                <tr key={i} className="border-b hover:bg-muted/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: `تحليل التصنيفات`, subtitle: `بيانات تفصيلية لشهر ${month}`, icon: <PieChart /> })}>
                                  <td className="p-2 font-medium">{month}</td>
                                  {categories.map((cat) => {
                                    const d = categoryTrends.find((t: any) => t.month === month && t.category === cat);
                                    return (
                                      <td key={cat} className="text-center p-2">
                                        {d ? (
                                          <span className="font-bold">{d.avgScore}%</span>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Article 12 Clause Trends */}
        <TabsContent value="clauses">
          <Card className="glass-card gold-sweep">
            <CardHeader>
              <CardTitle>اتجاهات بنود المادة 12</CardTitle>
              <CardDescription>نسبة الامتثال لكل بند من بنود المادة 12 عبر الأشهر</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClause ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">جاري التحميل...</div>
              ) : clauseTrends.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">لا توجد بيانات كافية</div>
              ) : (
                <div className="space-y-4">
                  {/* Clause heatmap */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-end p-2 min-w-40">البند</th>
                          {clauseTrends.map((t: any, i: number) => (
                            <th key={i} className="text-center p-2 text-xs">{t.month}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((clauseNum) => (
                          <tr key={clauseNum} className="border-b">
                            <td className="p-2 text-xs font-medium">{CLAUSE_NAMES[`clause${clauseNum}`]}</td>
                            {clauseTrends.map((t: any, i: number) => {
                              const val = Number(t[`clause${clauseNum}`]) || 0;
                              const total = Number(t.total) || 1;
                              const pct = Math.round((val / total) * 100);
                              const bg = pct >= 80 ? "bg-emerald-500/20 text-emerald-700" :
                                         pct >= 50 ? "bg-amber-500/20 text-amber-700" :
                                         "bg-red-500/20 text-red-700";
                              return (
                                <td key={i} className={`text-center p-2 text-xs font-bold ${bg} cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all`} onClick={() => openDrillDown({ title: `اتجاهات بنود المادة 12`, subtitle: `بيانات تفصيلية عن ${CLAUSE_NAMES[`clause${clauseNum}`]} لشهر ${t.month}`, icon: <GitBranch />, clauseIndex: clauseNum })}>
                                  {pct}%
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Clause bar chart for latest month */}
                  {clauseTrends.length > 0 && (() => {
                    const latest = clauseTrends[clauseTrends.length - 1];
                    const total = Number(latest.total) || 1;
                    return (
                      <Card className="mt-4 glass-card gold-sweep">
                        <CardHeader>
                          <CardTitle className="text-base">آخر شهر: {latest.month}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((clauseNum) => {
                            const val = Number(latest[`clause${clauseNum}`]) || 0;
                            const pct = Math.round((val / total) * 100);
                            const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
                            return (
                              <div key={clauseNum} className="flex items-center gap-3 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ title: `اتجاهات بنود المادة 12`, subtitle: `بيانات تفصيلية عن ${CLAUSE_NAMES[`clause${clauseNum}`]} لشهر ${latest.month}`, icon: <GitBranch />, clauseIndex: clauseNum })}>
                                <span className="text-xs w-48 shrink-0">{CLAUSE_NAMES[`clause${clauseNum}`]}</span>
                                <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                                  <div className={`h-full ${color} rounded-full transition-all flex items-center justify-end px-2`} style={{ width: `${pct}%` }}>
                                    <span className="text-xs sm:text-[10px] text-white font-bold">{pct}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
