import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText, Download, Clock, FileSpreadsheet, Loader2, CheckCircle2, Calendar,
  Building2, Landmark, Filter, Zap, History, FileDown, BarChart3, Shield, Layers
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const REPORT_MODULES = [
  { id: "compliance_summary", label: "ملخص الامتثال", icon: Shield, description: "نظرة عامة على حالة الامتثال" },
  { id: "sector_comparison", label: "مقارنة القطاعات", icon: BarChart3, description: "مقارنة بين القطاع العام والخاص" },
  { id: "clause_analysis", label: "تحليل البنود", icon: Layers, description: "تحليل تفصيلي لبنود المادة 12" },
  { id: "site_details", label: "تفاصيل المواقع", icon: Building2, description: "قائمة المواقع وحالتها" },
  { id: "trend_analysis", label: "تحليل الاتجاهات", icon: Zap, description: "تطور الامتثال عبر الزمن" },
];

export default function PdfReports() {
  const { playClick, playHover } = useSoundEffects();
  const generateMutation = trpc.pdfReports.generate.useMutation();
  const recordMutation = trpc.pdfReports.record.useMutation();
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = trpc.pdfReports.history.useQuery({ limit: 20 });

  const [selectedModules, setSelectedModules] = useState<string[]>(["compliance_summary"]);
  const [title, setTitle] = useState("تقرير راصد الشامل");
  const [sector, setSector] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleModule = (id: string) => {
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedModules.length === 0) {
      toast.error("يرجى اختيار قسم واحد على الأقل");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateMutation.mutateAsync({
        modules: selectedModules,
        title,
        sector: sector !== "all" ? sector : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      // Record the report
      await recordMutation.mutateAsync({
        reportType: selectedModules.includes("compliance_summary") ? "compliance_summary" : 
                    selectedModules.includes("sector_comparison") ? "sector_comparison" :
                    selectedModules.includes("trend_analysis") ? "trend_analysis" : "full_report",
        title,
      });

      // Create a simple PDF-like report as downloadable HTML
      const reportHtml = generateReportHtml(result.data, title);
      const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("تم إنشاء التقرير بنجاح");
      refetchHistory();
    } catch {
      toast.error("فشل في إنشاء التقرير");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[oklch(0.48_0.14_290)] to-primary shadow-lg shadow-primary/25">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">تقارير PDF التلقائية</h1>
            <p className="text-muted-foreground text-sm">إنشاء تقارير دورية احترافية بصيغة PDF</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
        {/* Report Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Title */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                عنوان التقرير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان التقرير"
                className="text-lg"
              />
            </CardContent>
          </Card>

          {/* Module Selection */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                أقسام التقرير
              </CardTitle>
              <CardDescription>اختر الأقسام التي تريد تضمينها في التقرير</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {REPORT_MODULES.map((mod) => {
                const Icon = mod.icon;
                const isSelected = selectedModules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-primary/50 bg-primary/5 shadow-sm"
                        : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                    }`}
                  >
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted/50'}`}>
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <Label className="font-medium cursor-pointer">{mod.label}</Label>
                      <p className="text-xs text-muted-foreground">{mod.description}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                فلاتر التقرير
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
                <div className="space-y-2">
                  <Label>القطاع</Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع القطاعات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع القطاعات</SelectItem>
                      <SelectItem value="public">القطاع العام</SelectItem>
                      <SelectItem value="private">القطاع الخاص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>من تاريخ</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>إلى تاريخ</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} dir="ltr" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Generate Button */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-left-4 duration-500 glass-card gold-sweep" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            <CardContent className="p-5 space-y-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || selectedModules.length === 0}
                className="w-full gap-2 h-12 text-base"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <FileDown className="h-5 w-5" />
                    إنشاء التقرير
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                سيتم إنشاء تقرير يتضمن {formatNumber(selectedModules.length)} قسم
              </p>
            </CardContent>
          </Card>

          {/* Report History */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-left-4 duration-500 glass-card gold-sweep" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-5 w-5 text-primary" />
                سجل التقارير
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {historyLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-muted/30 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : history && history.length > 0 ? (
                history.map((report: any) => (
                  <div key={report.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgba(197,165,90,0.08)] transition-all duration-200">
                    <div className="p-2 rounded-lg bg-primary/15 btn-glow">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString('ar-SA-u-nu-latn')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {report.reportType === 'compliance_summary' ? 'امتثال' :
                       report.reportType === 'sector_comparison' ? 'قطاعات' :
                       report.reportType === 'trend_analysis' ? 'اتجاهات' : 'شامل'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">لا توجد تقارير سابقة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Generate a professional HTML report
function generateReportHtml(data: any, title: string): string {
  const now = new Date().toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Tajawal', sans-serif; background: #f8fafc; color: #1e293b; direction: rtl; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; padding: 40px; text-align: center; }
    .header h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
    .header p { opacity: 0.8; font-size: 14px; }
    .container { max-width: 900px; margin: 0 auto; padding: 30px; }
    .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section h2 { font-size: 20px; font-weight: 700; color: #1e3a5f; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .stat-card { background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-card .value { font-size: 28px; font-weight: 800; color: #2563eb; }
    .stat-card .label { font-size: 12px; color: #64748b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #1e3a5f; color: white; padding: 10px 12px; text-align: center; font-weight: 600; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; }
    tr:hover { background: #f8fafc; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fef2f2; color: #991b1b; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-gray { background: #f1f5f9; color: #475569; }
    @media print { body { background: white; } .section { box-shadow: none; border: 1px solid #e2e8f0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 ${title}</h1>
    <p>تاريخ الإنشاء: ${now} | منصة راصد - مكتب إدارة البيانات الوطنية</p>
  </div>
  <div class="container">
    ${data.overview ? `
    <div class="section">
      <h2>ملخص الامتثال العام</h2>
      <div class="grid">
        <div class="stat-card">
          <div class="value">${data.overview.totalSites || 0}</div>
          <div class="label">إجمالي المواقع</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color:#059669">${data.overview.compliant || 0}</div>
          <div class="label">ممتثل</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color:#d97706">${data.overview.partial || 0}</div>
          <div class="label">ممتثل جزئياً</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color:#dc2626">${data.overview.nonCompliant || 0}</div>
          <div class="label">غير ممتثل</div>
        </div>
      </div>
    </div>` : ''}
    ${data.sectorComparison ? `
    <div class="section">
      <h2>مقارنة القطاعات</h2>
      <table>
        <thead><tr><th>المؤشر</th><th>القطاع العام</th><th>القطاع الخاص</th></tr></thead>
        <tbody>
          <tr><td>إجمالي المواقع</td><td>${data.sectorComparison.public?.total || 0}</td><td>${data.sectorComparison.private?.total || 0}</td></tr>
          <tr><td>ممتثل</td><td>${data.sectorComparison.public?.compliant || 0}</td><td>${data.sectorComparison.private?.compliant || 0}</td></tr>
          <tr><td>نسبة الامتثال</td><td>${data.sectorComparison.public?.rate || 0}%</td><td>${data.sectorComparison.private?.rate || 0}%</td></tr>
        </tbody>
      </table>
    </div>` : ''}
    ${data.clauses ? `
    <div class="section">
      <h2>تحليل بنود المادة ١٢</h2>
      <table>
        <thead><tr><th>البند</th><th>ممتثل</th><th>الإجمالي</th><th>النسبة</th></tr></thead>
        <tbody>
          ${(data.clauses || []).map((c: any, i: number) => `
          <tr>
            <td>البند ${i + 1}</td>
            <td>${c.compliant || 0}</td>
            <td>${c.total || 0}</td>
            <td><span class="badge ${(c.rate || 0) >= 50 ? 'badge-green' : 'badge-red'}">${c.rate || 0}%</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}
  </div>
  <div class="footer">
    <p>تم إنشاء هذا التقرير تلقائياً بواسطة منصة راصد | مكتب إدارة البيانات الوطنية (NDMO)</p>
  </div>
</body>
</html>`;
}
