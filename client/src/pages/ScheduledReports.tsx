import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText, Plus, Play, Pause, Trash2, Clock, Calendar,
  Send, History, RefreshCw, Settings2
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const REPORT_TYPES: Record<string, string> = {
  compliance_summary: "ملخص الامتثال",
  sector_comparison: "مقارنة القطاعات",
  trend_analysis: "تحليل الاتجاهات",
  full_report: "التقرير الشامل",
};

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
};

const DAYS_OF_WEEK = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function ScheduledReports() {
  const { playClick, playHover } = useSoundEffects();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const { data: reports, isLoading } = trpc.scheduledReports.list.useQuery();

  // Create form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    reportType: "compliance_summary" as string,
    frequency: "weekly" as string,
    dayOfWeek: 0,
    dayOfMonth: 1,
    hour: 8,
    includeCharts: true,
  });

  const createMutation = trpc.scheduledReports.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء التقرير المجدول بنجاح");
      utils.scheduledReports.list.invalidate();
      setShowCreate(false);
      setForm({ name: "", description: "", reportType: "compliance_summary", frequency: "weekly", dayOfWeek: 0, dayOfMonth: 1, hour: 8, includeCharts: true });
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMutation = trpc.scheduledReports.toggle.useMutation({
    onSuccess: () => {
      utils.scheduledReports.list.invalidate();
      toast.success("تم تحديث حالة التقرير");
    },
  });

  const deleteMutation = trpc.scheduledReports.delete.useMutation({
    onSuccess: () => {
      utils.scheduledReports.list.invalidate();
      toast.success("تم حذف التقرير");
    },
  });

  const runNowMutation = trpc.scheduledReports.runNow.useMutation({
    onSuccess: () => {
      utils.scheduledReports.list.invalidate();
      toast.success("تم إرسال التقرير بنجاح");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div
      className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold gradient-text">التقارير المجدولة</h1>
            <p className="text-sm text-muted-foreground">إعداد تقارير تُرسل تلقائياً بالبريد الإلكتروني</p>
          </div>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ms-2" />
              تقرير جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء تقرير مجدول جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>اسم التقرير</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: تقرير الامتثال الأسبوعي"
                />
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف مختصر للتقرير"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 stagger-children">
                <div>
                  <Label>نوع التقرير</Label>
                  <Select value={form.reportType} onValueChange={(v) => setForm({ ...form, reportType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(REPORT_TYPES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>التكرار</Label>
                  <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 stagger-children">
                {form.frequency === "weekly" && (
                  <div>
                    <Label>يوم الإرسال</Label>
                    <Select value={String(form.dayOfWeek)} onValueChange={(v) => setForm({ ...form, dayOfWeek: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((d, i) => (
                          <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {form.frequency === "monthly" && (
                  <div>
                    <Label>يوم الشهر</Label>
                    <Select value={String(form.dayOfMonth)} onValueChange={(v) => setForm({ ...form, dayOfMonth: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>ساعة الإرسال</Label>
                  <Select value={String(form.hour)} onValueChange={(v) => setForm({ ...form, hour: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>{String(i).padStart(2, "0")}:00</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.includeCharts}
                  onCheckedChange={(v) => setForm({ ...form, includeCharts: v })}
                />
                <Label>تضمين الرسوم البيانية</Label>
              </div>
              <Button
                className="w-full"
                disabled={!form.name || createMutation.isPending}
                onClick={() => createMutation.mutate(form as any)}
              >
                {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء التقرير"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{reports?.length || 0}</p>
            <p className="text-sm text-muted-foreground">إجمالي التقارير</p>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{reports?.filter(r => r.isActive).length || 0}</p>
            <p className="text-sm text-muted-foreground">نشطة</p>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{reports?.filter(r => r.frequency === "weekly").length || 0}</p>
            <p className="text-sm text-muted-foreground">أسبوعية</p>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{reports?.filter(r => r.frequency === "monthly").length || 0}</p>
            <p className="text-sm text-muted-foreground">شهرية</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      ) : !reports || reports.length === 0 ? (
        <Card className="glass-card gold-sweep">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium mb-2">لا توجد تقارير مجدولة</p>
            <p className="text-sm text-muted-foreground mb-4">أنشئ تقريراً مجدولاً ليتم إرساله تلقائياً</p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 ms-2" />
              إنشاء أول تقرير
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className={!report.isActive ? "opacity-60" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{report.name}</h3>
                      <Badge variant={report.isActive ? "default" : "secondary"}>
                        {report.isActive ? "نشط" : "متوقف"}
                      </Badge>
                      <Badge variant="outline">
                        {REPORT_TYPES[report.reportType || "compliance_summary"]}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500 text-blue-600">
                        <Clock className="h-3 w-3 ms-1" />
                        {FREQUENCY_LABELS[report.frequency]}
                      </Badge>
                    </div>
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {report.lastSentAt && (
                        <span className="flex items-center gap-1">
                          <Send className="h-3 w-3" />
                          آخر إرسال: {new Date(report.lastSentAt).toLocaleString("ar-SA-u-nu-latn")}
                        </span>
                      )}
                      {report.nextSendAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          الإرسال التالي: {new Date(report.nextSendAt).toLocaleString("ar-SA-u-nu-latn")}
                        </span>
                      )}
                      <span>الساعة: {String(report.hour ?? 8).padStart(2, "0")}:00</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runNowMutation.mutate({ id: report.id })}
                      disabled={runNowMutation.isPending}
                    >
                      <Send className="h-4 w-4 ms-1" />
                      إرسال الآن
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMutation.mutate({ id: report.id, isActive: !report.isActive })}
                    >
                      {report.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من حذف هذا التقرير؟")) {
                          deleteMutation.mutate({ id: report.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {selectedReport === report.id && (
                  <ReportExecutionHistory reportId={report.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportExecutionHistory({ reportId }: { reportId: number }) {
  const { data: executions, isLoading } = trpc.scheduledReports.executions.useQuery({ reportId });

  if (isLoading) return <div className="mt-4 p-4 animate-pulse"><div className="h-16 bg-muted rounded" /></div>;
  if (!executions || executions.length === 0) {
    return (
      <div className="mt-4 p-4 border-t text-center text-sm text-muted-foreground">
        لا يوجد سجل تنفيذ بعد
      </div>
    );
  }

  return (
    <div className="mt-4 border-t pt-4 space-y-2">
      <h4 className="text-sm font-medium mb-2">سجل التنفيذ</h4>
      {executions.map((exec) => (
        <div key={exec.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
          <div className="flex items-center gap-2">
            <Badge variant={exec.status === "completed" ? "default" : exec.status === "failed" ? "destructive" : "secondary"}>
              {exec.status === "completed" ? "مكتمل" : exec.status === "failed" ? "فشل" : "قيد التنفيذ"}
            </Badge>
            <span className="text-muted-foreground">
              {new Date(exec.startedAt).toLocaleString("ar-SA-u-nu-latn")}
            </span>
          </div>
          {exec.completedAt && (
            <span className="text-xs text-muted-foreground">
              المدة: {Math.round((new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000)}ث
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
