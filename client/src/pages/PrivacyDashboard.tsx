import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import {
  Shield, CheckCircle, XCircle, AlertCircle, WifiOff, Globe,
  ScanSearch, ChevronLeft, BarChart3, Hash, FileCheck, Layers,
  Landmark, Building,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  COMPLIANCE_COLORS,
  ARTICLE_12_CLAUSES,
} from "../../../shared/compliance";
import { formatNumber } from "@/lib/formatters";

type SectorFilter = "all" | "public" | "private";

const SECTOR_LABELS: Record<SectorFilter, string> = {
  all: "الكل",
  public: "قطاع عام",
  private: "قطاع خاص",
};

export default function PrivacyDashboard() {
  const [, setLocation] = useLocation();
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Pull from privacyDomains (the new 24,983 domains table)
  const { data: pdStats, isLoading: loadingStats } = trpc.privacyDomains.stats.useQuery();
  const { data: clauseStats, isLoading: loadingClauses } = trpc.dashboard.clauseStats.useQuery();
  const { data: sectorCompliance, isLoading: loadingSector } = trpc.dashboard.sectorCompliance.useQuery();
  const { data: clauseBySector } = trpc.dashboard.clauseStatsBySectorType.useQuery();
  const { data: clauseBySectorCategory } = trpc.dashboard.clauseStatsBySectorAndCategory.useQuery();

  const isLoading = loadingStats || loadingClauses || loadingSector;

  const filteredStats = useMemo(() => {
    if (!pdStats) return null;
    if (sectorFilter === "all") {
      return {
        totalSites: pdStats.total || 0,
        totalScans: pdStats.total || 0,
        compliant: pdStats.compliant || 0,
        nonCompliant: pdStats.nonCompliant || 0,
        partial: pdStats.partiallyCompliant || 0,
        notWorking: pdStats.noPolicy || 0,
      };
    }
    if (sectorCompliance && Array.isArray(sectorCompliance)) {
      const sd = sectorCompliance.find((s: any) => s.sectorType === sectorFilter);
      if (sd) {
        return {
          totalSites: (sd as any).total || 0,
          totalScans: 0,
          compliant: (sd as any).compliant || 0,
          nonCompliant: (sd as any).nonCompliant || 0,
          partial: (sd as any).partial || 0,
          notWorking: (sd as any).notWorking || 0,
        };
      }
    }
    return {
      totalSites: pdStats.total || 0,
      totalScans: pdStats.total || 0,
      compliant: pdStats.compliant || 0,
      nonCompliant: pdStats.nonCompliant || 0,
      partial: pdStats.partiallyCompliant || 0,
      notWorking: pdStats.noPolicy || 0,
    };
  }, [pdStats, sectorCompliance, sectorFilter]);

  const filteredClauseStats = useMemo(() => {
    if (sectorFilter === "all") {
      return Array.isArray(clauseStats) ? clauseStats : [];
    }
    if (clauseBySector && Array.isArray(clauseBySector)) {
      const sd = clauseBySector.filter((c: any) => c.sectorType === sectorFilter);
      if (sd.length > 0) {
        return ARTICLE_12_CLAUSES.map((clause, idx) => {
          const m = sd.find((c: any) => c.clause === idx + 1 || c.clauseNumber === idx + 1);
          return {
            clause: idx + 1,
            name: clause.name,
            compliant: m ? (m as any).compliant || 0 : 0,
            total: m ? (m as any).total || 1 : 1,
            percentage: m ? (m as any).percentage || 0 : 0,
          };
        });
      }
    }
    return Array.isArray(clauseStats) ? clauseStats : [];
  }, [clauseStats, clauseBySector, sectorFilter]);

  const categories = useMemo(() => {
    if (!clauseBySectorCategory || !Array.isArray(clauseBySectorCategory)) return [];
    const cats = new Set<string>();
    clauseBySectorCategory.forEach((item: any) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [clauseBySectorCategory]);

  const pieData = useMemo(() => {
    if (!filteredStats) return [];
    return [
      { name: "ممتثل", value: filteredStats.compliant, color: COMPLIANCE_COLORS.compliant },
      { name: "ممتثل جزئياً", value: filteredStats.partial, color: COMPLIANCE_COLORS.partially_compliant },
      { name: "غير ممتثل", value: filteredStats.nonCompliant, color: COMPLIANCE_COLORS.non_compliant },
      { name: "لا يعمل", value: filteredStats.notWorking, color: COMPLIANCE_COLORS.not_working },
    ].filter(d => d.value > 0);
  }, [filteredStats]);

  const drillDown = (filter: string) => {
    const params = new URLSearchParams();
    if (filter === "compliant") params.set("complianceStatus", "compliant");
    else if (filter === "partial") params.set("complianceStatus", "partially_compliant");
    else if (filter === "non_compliant") params.set("complianceStatus", "non_compliant");
    else if (filter === "not_working") params.set("status", "not_working");
    if (sectorFilter !== "all") params.set("sectorType", sectorFilter);
    setLocation(`/app/privacy/sites?${params.toString()}`);
  };

  const drillDownClause = (clauseNum: number) => {
    setLocation(`/app/clauses/${clauseNum}`);
  };

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6 p-6">
        <h1 className="text-2xl font-bold">لوحة الخصوصية</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const total = filteredStats?.totalSites || 1;
  const pct = (val: number) => total > 0 ? Math.round((val / total) * 100) : 0;

  const statusCards = [
    { label: "إجمالي المواقع السعودية", value: filteredStats?.totalSites ?? 0, percent: null as number | null, icon: Globe, color: "text-blue-400", bgColor: "bg-blue-400/10", borderColor: "border-blue-400/30", filter: "all", barColor: "" },
    { label: "إجمالي عدد الفحوصات", value: filteredStats?.totalScans ?? 0, percent: null as number | null, icon: ScanSearch, color: "text-purple-400", bgColor: "bg-purple-400/10", borderColor: "border-purple-400/30", filter: "", barColor: "" },
    { label: "ممتثل", value: filteredStats?.compliant ?? 0, percent: pct(filteredStats?.compliant ?? 0), icon: CheckCircle, color: "text-emerald-400", bgColor: "bg-emerald-400/10", borderColor: "border-emerald-400/30", filter: "compliant", barColor: "#22c55e" },
    { label: "غير ممتثل", value: filteredStats?.nonCompliant ?? 0, percent: pct(filteredStats?.nonCompliant ?? 0), icon: XCircle, color: "text-red-400", bgColor: "bg-red-400/10", borderColor: "border-red-400/30", filter: "non_compliant", barColor: "#ef4444" },
    { label: "ممتثل جزئياً", value: filteredStats?.partial ?? 0, percent: pct(filteredStats?.partial ?? 0), icon: AlertCircle, color: "text-amber-400", bgColor: "bg-amber-400/10", borderColor: "border-amber-400/30", filter: "partial", barColor: "#f59e0b" },
    { label: "لا يعمل", value: filteredStats?.notWorking ?? 0, percent: pct(filteredStats?.notWorking ?? 0), icon: WifiOff, color: "text-gray-400", bgColor: "bg-gray-400/10", borderColor: "border-gray-400/30", filter: "not_working", barColor: "#71717a" },
  ];

  return (
    <div className="space-y-8 p-2 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          لوحة الخصوصية — بنود المادة 12
        </h1>
        <p className="text-muted-foreground mt-1">
          رصد شامل لامتثال المواقع السعودية لنظام حماية البيانات الشخصية
        </p>
      </div>

      {/* Sector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Tabs value={sectorFilter} onValueChange={(v) => setSectorFilter(v as SectorFilter)}>
          <TabsList className="bg-card border">
            <TabsTrigger value="all" className="gap-1"><Globe className="h-4 w-4" />الكل</TabsTrigger>
            <TabsTrigger value="public" className="gap-1"><Landmark className="h-4 w-4" />قطاع عام</TabsTrigger>
            <TabsTrigger value="private" className="gap-1"><Building className="h-4 w-4" />قطاع خاص</TabsTrigger>
          </TabsList>
        </Tabs>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-card border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">جميع الفئات</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      {/* Group 1: Overall Monitoring */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          المجموعة الأولى: الرصد العام
          {sectorFilter !== "all" && <Badge variant="outline">{SECTOR_LABELS[sectorFilter]}</Badge>}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                className={`${card.bgColor} border ${card.borderColor} ${card.filter ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}
                onClick={() => card.filter && drillDown(card.filter)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap mb-2">
                    <Icon className={`h-5 w-5 ${card.color}`} />
                    {card.percent !== null && (
                      <Badge variant="outline" className={`${card.color} text-xs`}>{card.percent}%</Badge>
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${card.color}`}>{formatNumber(card.value)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
                  {card.percent !== null && card.barColor && (
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <div className="h-1.5 rounded-full" style={{ width: `${Math.min(card.percent, 100)}%`, backgroundColor: card.barColor }} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">توزيع حالات الامتثال</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value: number, name: string) => [`${formatNumber(value)} (${pct(value)}%)`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Group 2: Article 12 Clauses */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          المجموعة الثانية: الامتثال حسب بنود المادة 12
          {sectorFilter !== "all" && <Badge variant="outline">{SECTOR_LABELS[sectorFilter]}</Badge>}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          النسبة محسوبة من المواقع التي لها سياسة متاحة وتعمل (المقام: {formatNumber(total)} موقع)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ARTICLE_12_CLAUSES.map((clause, idx) => {
            const stat = filteredClauseStats[idx] || { compliant: 0, total: 1, percentage: 0 };
            const compliantCount = (stat as any).compliant || 0;
            const percentage = (stat as any).percentage || 0;
            return (
              <Card key={clause.number} className="cursor-pointer hover:scale-[1.02] transition-transform border-primary/20 hover:border-primary/50"
                onClick={() => drillDownClause(clause.number)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap mb-2">
                    <Badge variant="outline" className="text-xs">بند {clause.number}</Badge>
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-bold text-primary">{formatNumber(compliantCount)}</span>
                      <span className="text-xs text-muted-foreground">مستوفى</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium mb-3 leading-relaxed min-h-[2.5rem]">{clause.shortName}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: percentage >= 70 ? '#22c55e' : percentage >= 40 ? '#f59e0b' : '#ef4444' }} />
                    </div>
                    <span className="text-sm font-bold min-w-[3rem] text-left">{percentage}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ChevronLeft className="h-3 w-3" />اضغط للتفاصيل
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bar Chart */}
        {filteredClauseStats.length > 0 && (
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">نسبة الامتثال حسب البنود الثمانية</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredClauseStats.map((s: any, idx: number) => ({
                    name: ARTICLE_12_CLAUSES[idx]?.shortName || `بند ${idx + 1}`,
                    percentage: s.percentage || 0,
                  }))} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                    <RechartsTooltip formatter={(value: number) => [`${value}%`, "نسبة الامتثال"]} />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {filteredClauseStats.map((_: any, idx: number) => {
                        const pctVal = (_ as any).percentage || 0;
                        return <Cell key={idx} fill={pctVal >= 70 ? '#22c55e' : pctVal >= 40 ? '#f59e0b' : '#ef4444'} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Sector + Category Pivot */}
      {Array.isArray(clauseBySectorCategory) && clauseBySectorCategory.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            تحليل حسب القطاع والفئة
          </h2>
          <Card>
            <CardContent className="p-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2 font-medium">الفئة</th>
                    <th className="text-center p-2 font-medium">القطاع</th>
                    <th className="text-center p-2 font-medium text-emerald-500">ممتثل</th>
                    <th className="text-center p-2 font-medium text-amber-500">جزئي</th>
                    <th className="text-center p-2 font-medium text-red-500">غير ممتثل</th>
                    <th className="text-center p-2 font-medium">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {clauseBySectorCategory.slice(0, 30).map((row: any, idx: number) => (
                    <tr key={idx} className="border-b border-muted hover:bg-muted/50 cursor-pointer"
                      onClick={() => setLocation(`/app/sites?sectorType=${row.sectorType}&category=${row.category}`)}>
                      <td className="p-2">{row.category || "غير مصنف"}</td>
                      <td className="text-center p-2">
                        <Badge variant="outline" className="text-xs">{row.sectorType === "public" ? "عام" : "خاص"}</Badge>
                      </td>
                      <td className="text-center p-2 text-emerald-500 font-medium">{row.compliant || 0}</td>
                      <td className="text-center p-2 text-amber-500 font-medium">{row.partial || 0}</td>
                      <td className="text-center p-2 text-red-500 font-medium">{row.nonCompliant || 0}</td>
                      <td className="text-center p-2 font-bold">{row.total || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
