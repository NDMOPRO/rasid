import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileSpreadsheet, FileText, Download, BarChart3,
  Shield, Building2, Globe, ListChecks, Clock,
  CheckCircle2, Loader2, FileDown
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

function downloadBase64File(base64: string, filename: string, mime: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: typeof FileSpreadsheet;
  color: string;
  bgColor: string;
  type: 'overview' | 'clauses' | 'sectors' | 'categories' | 'all' | 'filtered';
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'overview',
    title: 'الرصد العام',
    description: 'تصدير ملخص شامل لحالة الامتثال والإحصائيات العامة',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-950/30',
    type: 'overview',
  },
  {
    id: 'clauses',
    title: 'بنود المادة 12',
    description: 'تصدير تفاصيل الامتثال لكل بند من بنود المادة 12',
    icon: ListChecks,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-950/30',
    type: 'clauses',
  },
  {
    id: 'sectors',
    title: 'القطاعات',
    description: 'تصدير بيانات الامتثال مصنفة حسب القطاعات',
    icon: Building2,
    color: 'text-primary',
    bgColor: 'bg-primary/15',
    type: 'sectors',
  },
  {
    id: 'categories',
    title: 'التصنيفات',
    description: 'تصدير بيانات الامتثال حسب تصنيف المواقع',
    icon: Globe,
    color: 'text-amber-600',
    bgColor: 'bg-amber-950/30',
    type: 'categories',
  },
  {
    id: 'all',
    title: 'تصدير شامل',
    description: 'تصدير جميع البيانات في ملف واحد متعدد الأوراق',
    icon: FileSpreadsheet,
    color: 'text-red-600',
    bgColor: 'bg-red-950/30',
    type: 'all',
  },
];

export default function ExportData() {
  const { playClick, playHover } = useSoundEffects();
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [recentExports, setRecentExports] = useState<{ id: string; title: string; time: string }[]>([]);

  const exportMut = (trpc.reports.exportExcel as any).useMutation({
    onSuccess: (data: any, variables: any) => {
      if (data?.base64) {
        const opt = EXPORT_OPTIONS.find(o => o.type === variables.type);
        const filename = `rasid-${variables.type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
        downloadBase64File(data.base64, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        toast.success('تم التصدير بنجاح', { description: `تم تحميل ملف ${opt?.title || variables.type}` });
        setRecentExports(prev => [
          { id: variables.type, title: opt?.title || variables.type, time: new Date().toLocaleTimeString('ar-SA-u-nu-latn') },
          ...prev.slice(0, 9),
        ]);
      }
      setExportingId(null);
    },
    onError: (err: any) => {
      toast.error('فشل التصدير', { description: err.message });
      setExportingId(null);
    },
  });

  const handleExport = (opt: ExportOption) => {
    setExportingId(opt.id);
    exportMut.mutate({ type: opt.type });
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <FileDown className="h-7 w-7 text-primary" />
              مركز تصدير البيانات
            </h1>
            <p className="text-muted-foreground mt-1">
              تصدير بيانات الامتثال والفحوصات بتنسيقات متعددة
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 ms-1" />
            آخر تحديث: {new Date().toLocaleDateString('ar-SA-u-nu-latn')}
          </Badge>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {EXPORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isExporting = exportingId === opt.id;
            return (
              <Card
                key={opt.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group ${
                  isExporting ? 'ring-2 ring-primary/50' : ''
                }`}
                onClick={() => !isExporting && handleExport(opt)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${opt.bgColor}`}>
                      <Icon className={`h-6 w-6 ${opt.color}`} />
                    </div>
                    {isExporting ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Download className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <CardTitle className="gradient-text text-lg mt-2">{opt.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {opt.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                        جاري التصدير...
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-4 w-4 ms-2" />
                        تصدير Excel
                      </>
                    )}
                  </Button>
                </CardContent>
                {/* Decorative accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${opt.bgColor} opacity-60`} />
              </Card>
            );
          })}
        </div>

        {/* Recent Exports */}
        {recentExports.length > 0 && (
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                التصديرات الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentExports.map((exp, i) => (
                  <div
                    key={`${exp.id}-${i}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium">{exp.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{exp.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-muted/30 border-dashed glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">ملاحظة مهمة</p>
                <p>
                  جميع البيانات المُصدّرة تحتوي على معلومات حساسة تتعلق بامتثال المواقع.
                  يرجى التعامل مع الملفات المُصدّرة بسرية تامة وعدم مشاركتها مع جهات غير مخوّلة.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
