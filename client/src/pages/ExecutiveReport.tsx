import { useState, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber, formatPercent, formatDate } from "@/lib/formatters";
import {
  Printer, FileText, Shield, Globe, CheckCircle2, XCircle,
  AlertTriangle, TrendingUp, BarChart3, Loader2, Minus,
  Building2, MapPin, Calendar, Eye,
} from "lucide-react";
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

import { LOGO_FULL_DARK } from "@/lib/rasidAssets";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
const LOGO_DARK = LOGO_FULL_DARK;

function ComplianceGauge({ value, size = 120 }: { value: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? "#059669" : value >= 60 ? "#10b981" : value >= 40 ? "#f59e0b" : value >= 20 ? "#f97316" : "#ef4444";
  return (
    <div
      className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{Math.round(value)}%</span>
      </div>
    </div>
  );
}

export default function ExecutiveReport() {
  const { playClick, playHover } = useSoundEffects();
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportDate] = useState(new Date());
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();

  // Fetch all data
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: clauseStats } = trpc.dashboard.clauseStats.useQuery();
  const { data: classificationStats } = trpc.dashboard.classificationStats.useQuery();
  const { data: sectorCompliance } = trpc.dashboard.sectorCompliance.useQuery();
  const { data: regionData } = trpc.executiveDashboard.regionHeatmap.useQuery({ period: "all" });

  const complianceRate = stats ? (stats.totalSites > 0 ? Math.round((stats.compliant / stats.totalSites) * 100) : 0) : 0;

  const handlePrint = () => {
    window.print();
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">جاري تحميل التقرير التنفيذي...</p>
        </div>
      </div>
    );
  }

  // Sort regions by compliance
  const sortedRegions = [...(regionData || [])].sort((a, b) => b.complianceRate - a.complianceRate);

  // Classification stats sorted
  const sortedClassifications = [...(classificationStats || [])].sort((a: any, b: any) => (Number(b.total) || 0) - (Number(a.total) || 0));

  // Sector compliance sorted
  const sortedSectors = (Array.isArray(sectorCompliance) ? [...sectorCompliance] : []).sort((a: any, b: any) => (Number(b.total) || 0) - (Number(a.total) || 0));

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Screen-only Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">التقرير التنفيذي</h1>
            <p className="text-muted-foreground">تقرير شامل لعرضه على القيادات</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
            طباعة التقرير
          </Button>
        </div>
      </div>

      {/* Printable Report Content */}
      <div ref={reportRef} className="print:p-0">
        {/* Report Header - Print */}
        <div className="hidden print:block mb-8">
          <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4">
            <div>
              <img src={LOGO_DARK} alt="راصد" className="h-16" />
            </div>
            <div className="text-start">
              <h1 className="text-2xl font-bold text-blue-900">التقرير التنفيذي</h1>
              <p className="text-sm text-gray-600">منصة راصد - رصد امتثال المواقع السعودية</p>
              <p className="text-sm text-gray-500">تاريخ التقرير: {formatDate(reportDate)}</p>
            </div>
          </div>
        </div>

        {/* Section 1: Compliance Overview */}
        <Card className="border-0 shadow-lg print:shadow-none print:border print:border-gray-200 overflow-hidden glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="bg-gradient-to-l from-blue-600 to-indigo-700 text-white print:bg-blue-600">
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
              نظرة عامة على الامتثال
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center stagger-children">
              <div className="col-span-2 md:col-span-1 flex justify-center">
                <ComplianceGauge value={complianceRate} size={140} />
              </div>
              {[
                { label: "إجمالي المواقع", value: stats?.totalSites || 0, icon: Globe, color: "text-blue-600" },
                { label: "ممتثل", value: stats?.compliant || 0, icon: CheckCircle2, color: "text-emerald-600" },
                { label: "ممتثل جزئياً", value: stats?.partiallyCompliant || 0, icon: AlertTriangle, color: "text-amber-600" },
                { label: "غير ممتثل", value: (stats?.nonCompliant || 0) + (stats?.noPolicy || 0), icon: XCircle, color: "text-red-600" },
              ].map((item) => (
                <div key={item.label} className="text-center space-y-2 cursor-pointer hover:scale-105 transition-transform" onClick={() => {
                    const statusMap: Record<string, string> = { "ممتثل": "compliant", "ممتثل جزئياً": "partially_compliant", "غير ممتثل": "non_compliant" };
                    openDrillDown({ complianceStatus: statusMap[item.label], title: item.label, subtitle: `${formatNumber(item.value)} موقع`, icon: <item.icon className={`w-6 h-6 ${item.color}`} /> });
                  }}>
                  <item.icon className={`w-8 h-8 mx-auto ${item.color}`} />
                  <p className="text-3xl font-bold">{formatNumber(item.value)}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Compliance Bar */}
            <div className="mt-6">
              <div className="flex rounded-full overflow-hidden h-6 shadow-inner">
                {[
                  { value: stats?.compliant || 0, color: "#059669", label: "ممتثل" },
                  { value: stats?.partiallyCompliant || 0, color: "#f59e0b", label: "جزئي" },
                  { value: stats?.nonCompliant || 0, color: "#ef4444", label: "غير ممتثل" },
                  { value: stats?.noPolicy || 0, color: "#6b7280", label: "لا يعمل" },
                ].map((seg, i) => {
                  const total = stats?.totalSites || 1;
                  const pct = (seg.value / total) * 100;
                  return pct > 0 ? (
                    <div key={i} className="h-full relative group" style={{ width: `${pct}%`, backgroundColor: seg.color }}>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold">
                        {pct >= 8 ? `${Math.round(pct)}%` : ""}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="flex justify-center gap-6 mt-3">
                {[
                  { label: "ممتثل", color: "#059669" },
                  { label: "ممتثل جزئياً", color: "#f59e0b" },
                  { label: "غير ممتثل", color: "#ef4444" },
                  { label: "لا يعمل", color: "#6b7280" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Article 12 Clauses Breakdown */}
        <Card className="border-0 shadow-lg print:shadow-none print:border print:border-gray-200 mt-6 print:break-before-page glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="bg-gradient-to-l from-emerald-600 to-blue-900 text-white print:bg-emerald-600">
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
              تحليل بنود المادة 12
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
              {clauseStats && (clauseStats as any[]).map((clause: any, i: number) => {
                const total = Number(clause.total) || 0;
                const compliant = Number(clause.compliant) || 0;
                const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;
                const clauseNames: Record<number, string> = {
                  1: "أنواع البيانات المعالجة",
                  2: "الغرض من المعالجة",
                  3: "آلية جمع البيانات",
                  4: "طريقة حفظ البيانات",
                  5: "طريقة إتلاف البيانات",
                  6: "حقوق أصحاب البيانات",
                  7: "حق التواصل والشكوى",
                  8: "آلية الإبلاغ عن التعديلات",
                };
                return (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border bg-card cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ clauseIndex: i, clauseCompliant: true, title: `البند ${i + 1}: ${clauseNames[i + 1]}`, subtitle: `${rate}% امتثال - ${formatNumber(compliant)} من ${formatNumber(total)}`, icon: <Shield className="w-6 h-6 text-emerald-500" /> })}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg"
                      style={{ backgroundColor: rate >= 60 ? "#059669" : rate >= 40 ? "#f59e0b" : "#ef4444" }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{clauseNames[i + 1] || `البند ${i + 1}`}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${rate}%`,
                              backgroundColor: rate >= 60 ? "#059669" : rate >= 40 ? "#f59e0b" : "#ef4444",
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold w-12 text-start">{rate}%</span>
                      </div>
                    </div>
                    <div className="text-start flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{formatNumber(compliant)} / {formatNumber(total)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Sector Comparison */}
        <Card className="border-0 shadow-lg print:shadow-none print:border print:border-gray-200 mt-6 print:break-before-page glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="bg-gradient-to-l from-[oklch(0.48_0.14_290)] to-primary text-white print:bg-primary btn-glow">
            <CardTitle className="flex items-center gap-2 text-white">
              <Building2 className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
              مقارنة القطاعات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-end py-3 px-2 font-bold">القطاع</th>
                    <th className="text-center py-3 px-2 font-bold">إجمالي</th>
                    <th className="text-center py-3 px-2 font-bold">ممتثل</th>
                    <th className="text-center py-3 px-2 font-bold">جزئي</th>
                    <th className="text-center py-3 px-2 font-bold">غير ممتثل</th>
                    <th className="text-center py-3 px-2 font-bold">لا يعمل</th>
                    <th className="text-center py-3 px-2 font-bold">متوسط النقاط</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSectors.slice(0, 15).map((sector: any, i: number) => (
                    <tr key={i} className="border-b hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => openDrillDown({ classification: sector.classification, title: sector.classification || "غير مصنف", subtitle: `${formatNumber(sector.total)} موقع`, icon: <Building2 className="w-6 h-6 text-primary" /> })}>
                      <td className="py-2.5 px-2 font-medium">{sector.classification || "غير مصنف"}</td>
                      <td className="text-center py-2.5 px-2">{formatNumber(sector.total)}</td>
                      <td className="text-center py-2.5 px-2 text-emerald-600 font-medium">{formatNumber(sector.compliant)}</td>
                      <td className="text-center py-2.5 px-2 text-amber-600">{formatNumber(sector.partial)}</td>
                      <td className="text-center py-2.5 px-2 text-red-600">{formatNumber(sector.non_compliant)}</td>
                      <td className="text-center py-2.5 px-2 text-gray-500">{formatNumber(sector.no_policy)}</td>
                      <td className="text-center py-2.5 px-2">
                        <Badge variant="outline" className={`${
                          Number(sector.avg_score) >= 60 ? "text-emerald-600 border-emerald-300" :
                          Number(sector.avg_score) >= 40 ? "text-amber-600 border-amber-300" :
                          "text-red-600 border-red-300"
                        }`}>
                          {Number(sector.avg_score || 0).toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Classification Breakdown */}
        <Card className="border-0 shadow-lg print:shadow-none print:border print:border-gray-200 mt-6 glass-card gold-sweep">
          <CardHeader className="bg-gradient-to-l from-amber-600 to-orange-700 text-white print:bg-amber-600">
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
              التصنيف حسب الفئة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
              {sortedClassifications.slice(0, 15).map((cls: any, i: number) => {
                const total = Number(cls.total) || 0;
                const compliant = Number(cls.compliant) || 0;
                const rate = total > 0 ? Math.round((compliant / total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all" onClick={() => openDrillDown({ classification: cls.classification, title: cls.classification || "غير مصنف", subtitle: `${formatNumber(total)} موقع - ${rate}% امتثال`, icon: <BarChart3 className="w-6 h-6 text-amber-500" /> })}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: rate >= 60 ? "#059669" : rate >= 40 ? "#f59e0b" : "#ef4444" }}>
                      {rate}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cls.classification || "غير مصنف"}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(total)} موقع</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Regional Compliance */}
        <Card className="border-0 shadow-lg print:shadow-none print:border print:border-gray-200 mt-6 print:break-before-page glass-card gold-sweep">
          <CardHeader className="bg-gradient-to-l from-blue-900 to-cyan-700 text-white print:bg-blue-900">
            <CardTitle className="flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5" />
              التوزيع الجغرافي للامتثال
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-center py-3 px-2 font-bold w-10">#</th>
                    <th className="text-end py-3 px-2 font-bold">المنطقة</th>
                    <th className="text-center py-3 px-2 font-bold">المواقع</th>
                    <th className="text-center py-3 px-2 font-bold">ممتثل</th>
                    <th className="text-center py-3 px-2 font-bold">جزئي</th>
                    <th className="text-center py-3 px-2 font-bold">غير ممتثل</th>
                    <th className="text-center py-3 px-2 font-bold">نسبة الامتثال</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRegions.map((region, i) => (
                    <tr key={region.id} className="border-b hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => openDrillDown({ title: region.name, subtitle: `${formatNumber(region.totalSites)} موقع - ${Math.round(region.complianceRate)}% امتثال`, icon: <MapPin className="w-6 h-6 text-blue-800" /> })}>
                      <td className="text-center py-2.5 px-2 font-bold text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 px-2 font-medium">{region.name}</td>
                      <td className="text-center py-2.5 px-2">{formatNumber(region.totalSites)}</td>
                      <td className="text-center py-2.5 px-2 text-emerald-600">{formatNumber(region.compliant)}</td>
                      <td className="text-center py-2.5 px-2 text-amber-600">{formatNumber(region.partial)}</td>
                      <td className="text-center py-2.5 px-2 text-red-600">{formatNumber(region.nonCompliant)}</td>
                      <td className="text-center py-2.5 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${region.complianceRate}%`,
                                backgroundColor: region.complianceRate >= 60 ? "#059669" : region.complianceRate >= 40 ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <span className="font-bold text-xs w-10 text-start">{Math.round(region.complianceRate)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Report Footer - Print */}
        <div className="hidden print:block mt-8 pt-4 border-t-2 border-gray-300">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              <p>منصة راصد - مكتب إدارة البيانات الوطنية</p>
              <p>تقرير تنفيذي سري - للاستخدام الداخلي فقط</p>
            </div>
            <div className="text-start">
              <p>تاريخ الإصدار: {formatDate(reportDate)}</p>
              <p>تم إنشاؤه تلقائياً بواسطة منصة راصد</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border { border: 1px solid #e5e7eb !important; }
          .print\\:border-gray-200 { border-color: #e5e7eb !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:break-before-page { break-before: page; }
          .print\\:bg-blue-600 { background-color: #2563eb !important; }
          .print\\:bg-emerald-600 { background-color: #059669 !important; }
          .print\\:bg-primary { background-color: #7c3aed !important; }
          .print\\:bg-amber-600 { background-color: #d97706 !important; }
          .print\\:bg-blue-900 { background-color: #0d9488 !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
