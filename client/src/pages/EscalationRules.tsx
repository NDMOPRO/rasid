import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  AlertTriangle, Plus, Clock, ArrowUpRight, Loader2, Trash2,
  Pencil, Play, Shield, TrendingUp, History, Zap, Timer,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight,
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const stageLabels: Record<string, string> = {
  submission: "تقديم",
  intake_validation: "التحقق",
  define_field: "تحديد المجال",
  legal_review: "المراجعة القانونية",
  jurisdiction_check: "فحص الاختصاص",
  measure_justification: "تبرير الإجراء",
  decision: "القرار",
  registered: "مسجّل",
  closed: "مغلق",
};

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 border-gray-200",
  medium: "bg-blue-100 text-blue-600 border-blue-200",
  high: "bg-amber-100 text-amber-600 border-amber-200",
  critical: "bg-red-100 text-red-600 border-red-200",
};

export default function EscalationRules() {
  const { playClick, playHover } = useSoundEffects();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [addOpen, setAddOpen] = useState(false);
  const [editRule, setEditRule] = useState<any>(null);
  const [tab, setTab] = useState("rules");

  const [form, setForm] = useState({
    name: "",
    description: "",
    fromStage: "submission",
    toStage: "intake_validation",
    maxHours: 48,
    escalatePriority: "" as string,
    appliesTo: "" as string,
  });

  const { data: rules, isLoading, refetch } = trpc.escalation.rules.useQuery();
  const { data: logs, isLoading: logsLoading } = trpc.escalation.logs.useQuery({});
  const { data: stats } = trpc.escalation.stats.useQuery();

  const createMutation = trpc.escalation.createRule.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء قاعدة التصعيد بنجاح");
      setAddOpen(false);
      resetForm();
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = trpc.escalation.updateRule.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث القاعدة");
      setEditRule(null);
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.escalation.deleteRule.useMutation({
    onSuccess: () => {
      toast.success("تم حذف القاعدة");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const runNowMutation = trpc.escalation.runNow.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      fromStage: "submission",
      toStage: "intake_validation",
      maxHours: 48,
      escalatePriority: "",
      appliesTo: "",
    });
  };

  const handleCreate = () => {
    if (!form.name) {
      toast.error("يرجى إدخال اسم القاعدة");
      return;
    }
    createMutation.mutate({
      ...form,
      escalatePriority: form.escalatePriority || undefined,
      appliesTo: form.appliesTo || undefined,
    } as any);
  };

  const handleToggle = (rule: any) => {
    updateMutation.mutate({ id: rule.id, isActive: !rule.isActive });
  };

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours} ساعة`;
    const days = Math.floor(hours / 24);
    const remaining = hours % 24;
    if (remaining === 0) return `${days} يوم`;
    return `${days} يوم و ${remaining} ساعة`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ar-SA-u-nu-latn", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div
      className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 gradient-text">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
            نظام التصعيد التلقائي
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة قواعد التصعيد التلقائي للحالات المتأخرة
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => runNowMutation.mutate()}
                disabled={runNowMutation.isPending}
              >
                {runNowMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                فحص الآن
              </Button>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    قاعدة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>إنشاء قاعدة تصعيد جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>اسم القاعدة *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="مثال: تصعيد حالات التقديم المتأخرة"
                      />
                    </div>
                    <div>
                      <Label>الوصف</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="وصف اختياري للقاعدة..."
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 stagger-children">
                      <div>
                        <Label>من مرحلة</Label>
                        <Select value={form.fromStage} onValueChange={(v) => setForm({ ...form, fromStage: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(stageLabels).filter(([k]) => k !== "closed").map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>إلى مرحلة</Label>
                        <Select value={form.toStage} onValueChange={(v) => setForm({ ...form, toStage: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(stageLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>الحد الأقصى (ساعات) *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={form.maxHours}
                        onChange={(e) => setForm({ ...form, maxHours: parseInt(e.target.value) || 48 })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        سيتم التصعيد إذا بقيت الحالة في المرحلة المحددة أكثر من {formatHours(form.maxHours)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 stagger-children">
                      <div>
                        <Label>رفع الأولوية إلى</Label>
                        <Select value={form.escalatePriority} onValueChange={(v) => setForm({ ...form, escalatePriority: v })}>
                          <SelectTrigger><SelectValue placeholder="بدون تغيير" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">منخفضة</SelectItem>
                            <SelectItem value="medium">متوسطة</SelectItem>
                            <SelectItem value="high">عالية</SelectItem>
                            <SelectItem value="critical">حرجة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>تطبق على أولوية</Label>
                        <Select value={form.appliesTo} onValueChange={(v) => setForm({ ...form, appliesTo: v })}>
                          <SelectTrigger><SelectValue placeholder="جميع الأولويات" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">منخفضة</SelectItem>
                            <SelectItem value="medium">متوسطة</SelectItem>
                            <SelectItem value="high">عالية</SelectItem>
                            <SelectItem value="critical">حرجة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
                      إنشاء القاعدة
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">قواعد نشطة</p>
                  <p className="text-2xl font-bold">{stats.activeRules}</p>
                </div>
                <Shield className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي التصعيدات</p>
                  <p className="text-2xl font-bold">{stats.totalEscalations}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">آخر 24 ساعة</p>
                  <p className="text-2xl font-bold">{stats.last24h}</p>
                </div>
                <Zap className="h-8 w-8 text-red-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card-scan">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">آخر 7 أيام</p>
                  <p className="text-2xl font-bold">{stats.last7d}</p>
                </div>
                <History className="h-8 w-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="rules" className="gap-1">
            <Shield className="h-4 w-4" />
            قواعد التصعيد
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1">
            <History className="h-4 w-4" />
            سجل التصعيدات
          </TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !rules || rules.length === 0 ? (
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <AlertTriangle className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">لا توجد قواعد تصعيد</h3>
                <p className="text-sm text-muted-foreground/70 mt-1">أنشئ قاعدة جديدة لبدء التصعيد التلقائي</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {rules.map((rule: any) => (
                <Card key={rule.id} className={`transition-all ${!rule.isActive ? "opacity-60" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold text-base">{rule.name}</h3>
                          <Badge variant={rule.isActive ? "default" : "secondary"} className="text-xs">
                            {rule.isActive ? "نشطة" : "معطّلة"}
                          </Badge>
                          {rule.appliesTo && (
                            <Badge variant="outline" className={`text-xs ${priorityColors[rule.appliesTo]}`}>
                              {priorityLabels[rule.appliesTo]} فقط
                            </Badge>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm flex-wrap">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4 text-amber-500" />
                            <span className="text-muted-foreground">من</span>
                            <Badge variant="outline">{stageLabels[rule.fromStage] || rule.fromStage}</Badge>
                            <span className="text-muted-foreground">إلى</span>
                            <Badge variant="outline">{stageLabels[rule.toStage] || rule.toStage}</Badge>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Timer className="h-4 w-4 text-blue-500" />
                            <span>{formatHours(rule.maxHours)}</span>
                          </div>
                          {rule.escalatePriority && (
                            <div className="flex items-center gap-1.5">
                              <ChevronUp className="h-4 w-4 text-red-500" />
                              <span>رفع إلى: <strong>{priorityLabels[rule.escalatePriority]}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleToggle(rule)}
                            title={rule.isActive ? "تعطيل" : "تفعيل"}
                          >
                            {rule.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذه القاعدة؟")) {
                                deleteMutation.mutate({ id: rule.id });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          {logsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !logs || logs.length === 0 ? (
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <History className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground">لا توجد تصعيدات بعد</h3>
                <p className="text-sm text-muted-foreground/70 mt-1">ستظهر هنا سجلات التصعيد التلقائي عند حدوثها</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="font-medium text-sm">
                            {log.caseNumber ? `حالة ${log.caseNumber}` : `حالة #${log.caseId}`}
                          </span>
                          {log.caseTitle && (
                            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                              - {log.caseTitle}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap mt-1">
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            {stageLabels[log.previousStage] || log.previousStage} → {stageLabels[log.newStage] || log.newStage}
                          </span>
                          {log.previousPriority !== log.newPriority && (
                            <span className="flex items-center gap-1">
                              <ChevronUp className="h-3 w-3 text-red-500" />
                              {priorityLabels[log.previousPriority] || log.previousPriority} → {priorityLabels[log.newPriority] || log.newPriority}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            متأخرة {Math.round(log.hoursOverdue)} ساعة
                          </span>
                          <span>{formatDate(log.escalatedAt)}</span>
                        </div>
                        {log.ruleName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            القاعدة: {log.ruleName}
                          </p>
                        )}
                      </div>
                      <Badge variant={log.notified ? "default" : "secondary"} className="text-xs shrink-0">
                        {log.notified ? "تم الإشعار" : "بدون إشعار"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
