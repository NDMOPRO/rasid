import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  CalendarClock, Plus, Trash2, Loader2, Clock, RefreshCw,
  Power, PowerOff, PlayCircle, History, CheckCircle2, XCircle,
  Zap, Timer, Server
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const frequencyLabels: Record<string, string> = {
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
};

const targetLabels: Record<string, string> = {
  all_sites: "جميع المواقع",
  sector: "حسب القطاع",
  category: "حسب التصنيف",
  specific_sites: "مواقع محددة",
  all_apps: "جميع التطبيقات",
};

const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function ScanSchedules() {
  const { playClick, playHover } = useSoundEffects();
  const [addOpen, setAddOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    frequency: "weekly" as "daily" | "weekly" | "monthly",
    dayOfWeek: 0,
    dayOfMonth: 1,
    hour: 2,
    targetType: "all_sites" as "all_sites" | "sector" | "category" | "specific_sites" | "all_apps",
  });

  const { data: schedules, isLoading, refetch } = trpc.scanSchedules.list.useQuery();
  const { data: cronStatus } = trpc.cronEngine.status.useQuery(undefined, { refetchInterval: 10000 });
  const { data: executionHistory } = trpc.cronEngine.history.useQuery(
    { scheduleId: selectedScheduleId! },
    { enabled: !!selectedScheduleId }
  );

  const createMutation = trpc.scanSchedules.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الجدولة بنجاح");
      setAddOpen(false);
      setFormData({ name: "", description: "", frequency: "weekly", dayOfWeek: 0, dayOfMonth: 1, hour: 2, targetType: "all_sites" });
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = trpc.scanSchedules.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الجدولة");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.scanSchedules.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الجدولة");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const startCronMutation = trpc.cronEngine.start.useMutation({
    onSuccess: () => toast.success("تم تشغيل محرك الجدولة"),
    onError: (err: any) => toast.error(err.message),
  });

  const stopCronMutation = trpc.cronEngine.stop.useMutation({
    onSuccess: () => toast.success("تم إيقاف محرك الجدولة"),
    onError: (err: any) => toast.error(err.message),
  });

  const runNowMutation = trpc.cronEngine.runNow.useMutation({
    onSuccess: () => {
      toast.success("تم تنفيذ الفحص بنجاح");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleCreate = () => {
    if (!formData.name) {
      toast.error("يرجى إدخال اسم الجدولة");
      return;
    }
    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      frequency: formData.frequency,
      dayOfWeek: formData.frequency === "weekly" ? formData.dayOfWeek : undefined,
      dayOfMonth: formData.frequency === "monthly" ? formData.dayOfMonth : undefined,
      hour: formData.hour,
      targetType: formData.targetType,
    });
  };

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 gradient-text">
            <CalendarClock className="h-7 w-7 text-primary" />
            جدولة الفحص الدوري
          </h1>
          <p className="text-muted-foreground mt-1">إعداد فحوصات تلقائية دورية للمواقع والتطبيقات</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                جدولة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>إنشاء جدولة فحص جديدة</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>اسم الجدولة *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="مثال: فحص أسبوعي للمواقع الحكومية" />
                </div>
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="وصف اختياري" />
                </div>
                <div className="grid grid-cols-2 gap-4 stagger-children">
                  <div className="space-y-2">
                    <Label>التكرار</Label>
                    <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">يومي</SelectItem>
                        <SelectItem value="weekly">أسبوعي</SelectItem>
                        <SelectItem value="monthly">شهري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الهدف</Label>
                    <Select value={formData.targetType} onValueChange={(v) => setFormData({ ...formData, targetType: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(targetLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.frequency === "weekly" && (
                  <div className="space-y-2">
                    <Label>يوم الأسبوع</Label>
                    <Select value={String(formData.dayOfWeek)} onValueChange={(v) => setFormData({ ...formData, dayOfWeek: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {dayNames.map((d, i) => (
                          <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.frequency === "monthly" && (
                  <div className="space-y-2">
                    <Label>يوم الشهر</Label>
                    <Select value={String(formData.dayOfMonth)} onValueChange={(v) => setFormData({ ...formData, dayOfMonth: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>الساعة (بتوقيت السعودية)</Label>
                  <Select value={String(formData.hour)} onValueChange={(v) => setFormData({ ...formData, hour: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={String(i)}>{`${i.toString().padStart(2, "0")}:00`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
                  إنشاء الجدولة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cron Engine Status Card */}
      <div>
        <Card className="border-2 border-primary/20 bg-gradient-to-l from-primary/5 to-transparent glass-card gold-sweep">
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cronStatus?.running ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <Server className={`h-7 w-7 ${cronStatus?.running ? "text-green-500" : "text-red-500"}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    محرك الجدولة التلقائية
                    <Badge variant={cronStatus?.running ? "default" : "destructive"} className="text-xs">
                      {cronStatus?.running ? "يعمل" : "متوقف"}
                    </Badge>
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    {cronStatus?.running && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        يفحص الجدولات كل 5 دقائق
                      </span>
                    )}
                    {cronStatus?.lastCheck && (
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        آخر فحص: {new Date(cronStatus.lastCheck).toLocaleTimeString("ar-SA-u-nu-latn")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cronStatus?.running ? (
                  <Button
                    variant="outline"
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => stopCronMutation.mutate()}
                    disabled={stopCronMutation.isPending}
                  >
                    {stopCronMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PowerOff className="h-4 w-4" />}
                    إيقاف المحرك
                  </Button>
                ) : (
                  <Button
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => startCronMutation.mutate()}
                    disabled={startCronMutation.isPending}
                  >
                    {startCronMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
                    تشغيل المحرك
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-24" /></Card>
          ))}
        </div>
      ) : schedules && schedules.length > 0 ? (
        <div className="space-y-3">
          
            {(schedules as any[]).map((s: any, i: number) => (
              <div
                key={s.id}
              >
                <Card className="hover:shadow-md transition-all duration-200 glass-card gold-sweep">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <RefreshCw className={`h-6 w-6 ${s.is_active ? "animate-spin-slow" : ""}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {s.name}
                            <Badge variant={s.is_active ? "default" : "secondary"}>
                              {s.is_active ? "نشط" : "متوقف"}
                            </Badge>
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {frequencyLabels[s.frequency] || s.frequency}
                              {s.frequency === "weekly" && s.day_of_week != null && ` - ${dayNames[s.day_of_week]}`}
                              {s.frequency === "monthly" && s.day_of_month && ` - يوم ${s.day_of_month}`}
                              {` - الساعة ${String(s.hour || 0).padStart(2, "0")}:00`}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {targetLabels[s.target_type] || s.target_type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                            {s.last_run_at && (
                              <span>آخر تشغيل: {new Date(s.last_run_at).toLocaleDateString("ar-SA-u-nu-latn", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                            {s.next_run_at && (
                              <span className="text-primary">التشغيل القادم: {new Date(s.next_run_at).toLocaleDateString("ar-SA-u-nu-latn", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                          onClick={() => {
                            setSelectedScheduleId(s.id);
                            setHistoryOpen(true);
                          }}
                        >
                          <History className="h-3.5 w-3.5" />
                          السجل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 btn-glow"
                          onClick={() => {
                            if (confirm("هل تريد تنفيذ هذه الجدولة الآن؟")) {
                              runNowMutation.mutate({ scheduleId: s.id });
                            }
                          }}
                          disabled={runNowMutation.isPending}
                        >
                          {runNowMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                          تنفيذ الآن
                        </Button>
                        <Switch
                          checked={s.is_active}
                          onCheckedChange={() => updateMutation.mutate({ id: s.id, isActive: !s.is_active })}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 h-8 w-8"
                          onClick={() => { if (confirm("هل تريد حذف هذه الجدولة؟")) deleteMutation.mutate({ id: s.id }); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          
        </div>
      ) : (
        <Card className="border-dashed glass-card gold-sweep">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarClock className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">لا توجد جدولات</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">أنشئ جدولة فحص دوري جديدة</p>
          </CardContent>
        </Card>
      )}

      {/* Execution History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              سجل التنفيذ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {executionHistory && (executionHistory as any[]).length > 0 ? (
              (executionHistory as any[]).map((exec: any, i: number) => (
                <div
                  key={exec.id || i}
                >
                  <Card className="hover:shadow-sm transition-shadow glass-card gold-sweep">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap">
                        <div className="flex items-center gap-3">
                          {exec.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : exec.status === "failed" ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={exec.status === "completed" ? "default" : exec.status === "failed" ? "destructive" : "secondary"}>
                                {exec.status === "completed" ? "مكتمل" : exec.status === "failed" ? "فشل" : "قيد التنفيذ"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {exec.started_at ? new Date(exec.started_at).toLocaleDateString("ar-SA-u-nu-latn", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>إجمالي: {exec.total_sites || 0}</span>
                              <span className="text-green-600">نجح: {exec.completed_sites || 0}</span>
                              <span className="text-red-500">فشل: {exec.failed_sites || 0}</span>
                              {exec.completed_at && exec.started_at && (
                                <span>المدة: {Math.round((new Date(exec.completed_at).getTime() - new Date(exec.started_at).getTime()) / 1000)}ث</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا يوجد سجل تنفيذ بعد</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
