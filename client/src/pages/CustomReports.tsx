import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FileDown,
  FileSpreadsheet,
  Presentation,
  BarChart3,
  Shield,
  Building2,
  Globe,
  ListChecks,
  Layers,
  CalendarDays,
  Download,
  Eye,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { generateProfessionalPDF, downloadBlob } from "@/lib/pdfGenerator";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const MODULES = [
  { id: "general_stats", label: "الإحصائيات العامة", description: "إجمالي المواقع والفحوصات ونسب الامتثال", icon: BarChart3, color: "from-blue-500 to-blue-600" },
  { id: "compliance_breakdown", label: "تفاصيل الامتثال", description: "قائمة تفصيلية بحالة امتثال كل موقع", icon: ListChecks, color: "from-emerald-500 to-emerald-600" },
  { id: "article12_clauses", label: "بنود المادة 12", description: "تحليل البنود الثمانية مع نسب الامتثال لكل بند", icon: Shield, color: "from-primary to-[oklch(0.48_0.14_290)]" },
  { id: "sector_comparison", label: "مقارنة القطاعات", description: "مقارنة الامتثال بين القطاع الحكومي والخاص", icon: Building2, color: "from-amber-500 to-amber-600" },
  { id: "category_breakdown", label: "تحليل التصنيفات", description: "توزيع الامتثال حسب تصنيف الجهات", icon: Layers, color: "from-rose-500 to-rose-600" },
  { id: "site_details", label: "تفاصيل المواقع", description: "بيانات تفصيلية لكل موقع مع آخر فحص", icon: Globe, color: "from-cyan-500 to-cyan-600" },
];

export default function CustomReports() {
  const { playClick, playHover } = useSoundEffects();
  const [selectedModules, setSelectedModules] = useState<string[]>(["general_stats", "article12_clauses"]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const previewQuery = trpc.customReports.getData.useQuery(
    { modules: selectedModules, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined },
    { enabled: previewMode && selectedModules.length > 0 }
  );

  const exportExcel = trpc.customReports.exportExcel.useMutation({
    onSuccess: (data) => {
      const byteChars = atob(data.base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير التقرير بنجاح (Excel)");
    },
    onError: (err) => toast.error(err.message),
  });

  const exportPptx = trpc.customReports.exportPptx.useMutation({
    onSuccess: async (data) => {
      try {
        const response = await fetch(data.url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }));
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch {
        window.open(data.url, '_blank');
      }
      toast.success("تم تصدير التقرير بنجاح (PowerPoint)");
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
    setPreviewMode(false);
  };

  const [pdfLoading, setPdfLoading] = useState(false);
  const data = previewQuery.data as any;

  const handleExport = (format: "excel" | "pptx") => {
    if (selectedModules.length === 0) {
      toast.error("يرجى اختيار وحدة بيانات واحدة على الأقل");
      return;
    }
    const params = { modules: selectedModules, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined };
    if (format === "excel") exportExcel.mutate(params);
    else exportPptx.mutate(params);
  };

  const handleExportPDF = async () => {
    if (selectedModules.length === 0) {
      toast.error("يرجى اختيار وحدة بيانات واحدة على الأقل");
      return;
    }
    setPdfLoading(true);
    try {
      // First get the data if not already loaded
      if (!data) {
        setPreviewMode(true);
        toast.info("جاري تحميل البيانات...");
        setPdfLoading(false);
        return;
      }
      const reportData = {
        title: "تقرير راصد - رصد الامتثال",
        modules: selectedModules,
        data: {
          general_stats: data.generalStats,
          compliance_breakdown: data.complianceBreakdown,
          article12_clauses: data.article12Clauses,
          sector_comparison: data.sectorComparison,
          category_breakdown: data.categoryBreakdown,
          site_details: data.siteDetails,
        },
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const blob = await generateProfessionalPDF(reportData);
      const filename = `rasid-report-${new Date().toISOString().split("T")[0]}.pdf`;
      downloadBlob(blob, filename);
      toast.success("تم تصدير التقرير بنجاح (PDF)");
    } catch (err: any) {
      toast.error(`خطأ في تصدير PDF: ${err.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="overflow-x-hidden max-w-full p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 gradient-text">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.48_0.14_290)] flex items-center justify-center">
                <FileDown className="w-5 h-5 text-white" />
              </div>
              تصدير تقارير مخصصة
            </h1>
            <p className="text-muted-foreground mt-1">اختر البيانات والفترة الزمنية وصيغة التصدير</p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {selectedModules.length} وحدات مختارة
          </Badge>
        </div>
      </div>

      {/* Date Range */}
      <div>
        <Card className="glass-card-scan">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              الفترة الزمنية
            </CardTitle>
            <CardDescription>اختياري - حدد فترة زمنية لتصفية البيانات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>من تاريخ</Label>
                <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPreviewMode(false); }} />
              </div>
              <div className="flex-1">
                <Label>إلى تاريخ</Label>
                <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPreviewMode(false); }} />
              </div>
              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); setPreviewMode(false); }}>
                  مسح
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Selection */}
      <div>
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-emerald-500" />
              وحدات البيانات
            </CardTitle>
            <CardDescription>اختر البيانات التي تريد تضمينها في التقرير</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {MODULES.map((mod, idx) => {
                const isSelected = selectedModules.includes(mod.id);
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-transparent bg-muted/30 hover:border-muted-foreground/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mod.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isSelected} className="mt-0.5" />
                          <span className="font-medium text-sm">{mod.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div>
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-3">
                <Button
                  onClick={() => setPreviewMode(true)}
                  variant="outline"
                  disabled={selectedModules.length === 0 || previewQuery.isLoading}
                  className="gap-2"
                >
                  {previewQuery.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  معاينة البيانات
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleExportPDF}
                  disabled={selectedModules.length === 0 || pdfLoading}
                  className="gap-2 bg-red-600 hover:bg-red-700"
                >
                  {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  تصدير PDF
                </Button>
                <Button
                  onClick={() => handleExport("excel")}
                  disabled={selectedModules.length === 0 || exportExcel.isPending}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {exportExcel.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  تصدير Excel
                </Button>
                <Button
                  onClick={() => handleExport("pptx")}
                  disabled={selectedModules.length === 0 || exportPptx.isPending}
                  className="gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  {exportPptx.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4" />}
                  تصدير PowerPoint
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      
        {previewMode && data && (
          <div
            className="space-y-4"
          >
            {data.generalStats && (
              <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    الإحصائيات العامة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-children">
                    {[
                      { label: "إجمالي المواقع", value: data.generalStats.totalSites, color: "text-blue-600" },
                      { label: "إجمالي الفحوصات", value: data.generalStats.totalScans, color: "text-indigo-600" },
                      { label: "ممتثل", value: data.generalStats.compliant, color: "text-emerald-600" },
                      { label: "ممتثل جزئياً", value: data.generalStats.partial, color: "text-amber-600" },
                      { label: "غير ممتثل", value: data.generalStats.nonCompliant, color: "text-red-600" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/50">
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.article12Clauses && (
              <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    بنود المادة 12
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-end p-2">#</th>
                          <th className="text-end p-2">البند</th>
                          <th className="text-center p-2">ممتثل</th>
                          <th className="text-center p-2">الإجمالي</th>
                          <th className="text-center p-2">النسبة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.article12Clauses.map((c: any) => (
                          <tr key={c.clause} className="border-b hover:bg-muted/30">
                            <td className="p-2 font-medium">{c.clause}</td>
                            <td className="p-2">{c.name}</td>
                            <td className="p-2 text-center text-emerald-600 font-medium">{c.compliant}</td>
                            <td className="p-2 text-center">{c.total}</td>
                            <td className="p-2 text-center">
                              <Badge variant={c.rate >= 70 ? "default" : c.rate >= 40 ? "secondary" : "destructive"}>
                                {c.rate}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {data.sectorComparison && (
              <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-500" />
                    مقارنة القطاعات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 stagger-children">
                    {[
                      { label: "القطاع الحكومي", data: data.sectorComparison.public, color: "blue" },
                      { label: "القطاع الخاص", data: data.sectorComparison.private, color: "emerald" },
                    ].map((sector) => (
                      <div key={sector.label} className="p-4 rounded-xl bg-muted/30 text-center">
                        <div className="font-medium mb-2">{sector.label}</div>
                        <div className="text-3xl font-bold text-primary">{sector.data.rate}%</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {sector.data.compliant} ممتثل من {sector.data.total}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.complianceBreakdown && (
              <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-emerald-500" />
                    تفاصيل الامتثال ({data.complianceBreakdown.length} سجل)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="text-end p-2">النطاق</th>
                          <th className="text-center p-2">النسبة</th>
                          <th className="text-center p-2">الحالة</th>
                          <th className="text-center p-2">التقييم</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.complianceBreakdown.slice(0, 20).map((s: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-muted/30">
                            <td className="p-2 font-mono text-xs">{s.domain}</td>
                            <td className="p-2 text-center font-medium">{s.overallScore?.toFixed(1)}%</td>
                            <td className="p-2 text-center">
                              <Badge variant={s.complianceStatus === "compliant" ? "default" : s.complianceStatus === "partially_compliant" ? "secondary" : "destructive"} className="text-xs">
                                {s.complianceStatus === "compliant" ? "ممتثل" : s.complianceStatus === "partially_compliant" ? "ممتثل جزئياً" : "غير ممتثل"}
                              </Badge>
                            </td>
                            <td className="p-2 text-center text-xs">{s.rating || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.complianceBreakdown.length > 20 && (
                      <p className="text-center text-xs text-muted-foreground mt-2">
                        يظهر 20 من أصل {data.complianceBreakdown.length} سجل - التقرير الكامل يتضمن جميع السجلات
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.categoryBreakdown && (
              <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-rose-500" />
                    تحليل التصنيفات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
                    {data.categoryBreakdown.map((cat: any) => (
                      <div key={cat.category} className="p-3 rounded-lg bg-muted/30 text-center">
                        <div className="text-sm font-medium truncate">{cat.category || "غير مصنف"}</div>
                        <div className="text-xl font-bold text-primary mt-1">{cat.rate}%</div>
                        <div className="text-xs text-muted-foreground">{cat.compliant}/{cat.total}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {data.siteDetails && (
              <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-500" />
                    تفاصيل المواقع ({data.siteDetails.length} موقع)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    سيتم تضمين {data.siteDetails.length} موقع في التقرير المصدّر
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      
    </div>
  );
}
