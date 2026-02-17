import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Zap,
  BarChart3,
  ShieldCheck,
  Clock,
  Globe,
  Star,
  RefreshCw,
  Eye,
} from "lucide-react";
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const CATEGORY_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  compliance: { label: "الامتثال", icon: ShieldCheck, color: "from-emerald-500 to-emerald-600" },
  scanning: { label: "الفحص", icon: BarChart3, color: "from-blue-500 to-blue-600" },
  response: { label: "الاستجابة", icon: Clock, color: "from-amber-500 to-amber-600" },
  coverage: { label: "التغطية", icon: Globe, color: "from-primary to-[oklch(0.48_0.14_290)]" },
  quality: { label: "الجودة", icon: Star, color: "from-rose-500 to-rose-600" },
};

const PERIOD_LABELS: Record<string, string> = {
  monthly: "شهري",
  quarterly: "ربع سنوي",
  yearly: "سنوي",
};

function getStatusColor(actual: number, target: number, direction: string, greenThreshold: number, yellowThreshold: number): "green" | "yellow" | "red" {
  if (direction === "higher_is_better") {
    const pct = target > 0 ? (actual / target) * 100 : 0;
    if (pct >= (greenThreshold / target) * 100 || actual >= greenThreshold) return "green";
    if (pct >= (yellowThreshold / target) * 100 || actual >= yellowThreshold) return "yellow";
    return "red";
  } else {
    if (actual <= greenThreshold) return "green";
    if (actual <= yellowThreshold) return "yellow";
    return "red";
  }
}

function getProgressPct(actual: number, target: number, direction: string): number {
  if (direction === "higher_is_better") {
    return target > 0 ? Math.min((actual / target) * 100, 100) : 0;
  } else {
    if (target === 0) return 100;
    const ratio = actual / target;
    return Math.max(0, Math.min(100, (2 - ratio) * 50));
  }
}

function mapActualValue(kpi: any, actuals: any): number {
  const name = kpi.name?.toLowerCase() || "";
  if (name.includes("overall compliance") || name.includes("الامتثال الكلية")) return actuals.complianceRate || 0;
  if (name.includes("monthly scans") || name.includes("الفحوصات الشهرية")) return actuals.scansThisMonth || 0;
  if (name.includes("average compliance") || name.includes("متوسط نسبة")) return Math.round(actuals.averageScore || 0);
  if (name.includes("case resolution") || name.includes("حل الحالات")) return actuals.openCases > 0 ? Math.max(0, 100 - actuals.openCases * 2) : 100;
  if (name.includes("site coverage") || name.includes("تغطية")) return actuals.totalSites > 0 ? Math.round(((actuals.compliant + actuals.partial) / actuals.totalSites) * 100) : 0;
  if (name.includes("non-compliant") || name.includes("غير الممتثلة") || name.includes("غير ممتثل")) return actuals.nonCompliantRate || 0;
  if (name.includes("active schedules") || name.includes("الجداول النشطة")) return actuals.activeSchedules || 0;
  if (name.includes("open cases") || name.includes("الحالات المفتوحة")) return actuals.openCases || 0;
  return 0;
}

export default function KpiDashboard() {
  const { playClick, playHover } = useSoundEffects();
  const [showCreate, setShowCreate] = useState(false);
  const [editKpi, setEditKpi] = useState<any>(null);
  const [form, setForm] = useState({
    name: "", nameAr: "", category: "compliance", targetValue: 80,
    unit: "%", period: "monthly", direction: "higher_is_better",
    thresholdGreen: 80, thresholdYellow: 60,
  });

  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();
  const utils = trpc.useUtils();
  const targets = trpc.kpiDashboard.getTargets.useQuery();
  const actuals = trpc.kpiDashboard.getActuals.useQuery();
  const createTarget = trpc.kpiDashboard.createTarget.useMutation({
    onSuccess: () => { utils.kpiDashboard.getTargets.invalidate(); setShowCreate(false); resetForm(); toast.success("تم إنشاء المؤشر"); },
    onError: (e) => toast.error(e.message),
  });
  const updateTarget = trpc.kpiDashboard.updateTarget.useMutation({
    onSuccess: () => { utils.kpiDashboard.getTargets.invalidate(); setEditKpi(null); resetForm(); toast.success("تم تحديث المؤشر"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteTarget = trpc.kpiDashboard.deleteTarget.useMutation({
    onSuccess: () => { utils.kpiDashboard.getTargets.invalidate(); toast.success("تم حذف المؤشر"); },
    onError: (e) => toast.error(e.message),
  });
  const seedDefaults = trpc.kpiDashboard.seedDefaults.useMutation({
    onSuccess: (data) => {
      utils.kpiDashboard.getTargets.invalidate();
      if (data.seeded) toast.success(`تم إنشاء ${data.count} مؤشرات افتراضية`);
      else toast.info(data.message);
    },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ name: "", nameAr: "", category: "compliance", targetValue: 80, unit: "%", period: "monthly", direction: "higher_is_better", thresholdGreen: 80, thresholdYellow: 60 });
  }

  function openEdit(kpi: any) {
    setForm({
      name: kpi.name || "", nameAr: kpi.nameAr || "", category: kpi.category || "compliance",
      targetValue: kpi.targetValue || 0, unit: kpi.unit || "%", period: kpi.period || "monthly",
      direction: kpi.direction || "higher_is_better", thresholdGreen: kpi.thresholdGreen || 80, thresholdYellow: kpi.thresholdYellow || 60,
    });
    setEditKpi(kpi);
  }

  const kpiList = targets.data || [];
  const actualsData = actuals.data;

  // Group by category
  const grouped: Record<string, any[]> = {};
  kpiList.forEach((kpi: any) => {
    const cat = kpi.category || "compliance";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(kpi);
  });

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <WatermarkLogo />
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 gradient-text">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-900 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              مؤشرات الأداء الرئيسية (KPI)
            </h1>
            <p className="text-muted-foreground mt-1">مراقبة الأداء الفعلي مقابل الأهداف المحددة</p>
          </div>
          <div className="flex gap-2">
            {kpiList.length === 0 && (
              <Button variant="outline" onClick={() => seedDefaults.mutate()} disabled={seedDefaults.isPending} className="gap-2">
                {seedDefaults.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 transition-transform duration-300 hover:scale-110" />}
                إنشاء مؤشرات افتراضية
              </Button>
            )}
            <Button variant="outline" onClick={() => { utils.kpiDashboard.getActuals.invalidate(); utils.kpiDashboard.getTargets.invalidate(); }} className="gap-2">
              <RefreshCw className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
              تحديث
            </Button>
            <Button onClick={() => { resetForm(); setShowCreate(true); }} className="gap-2">
              <Plus className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
              إضافة مؤشر
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {actualsData && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            {[
              { label: "نسبة الامتثال", value: `${actualsData.complianceRate}%`, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-950/30" },
              { label: "فحوصات الشهر", value: actualsData.scansThisMonth, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-950/30" },
              { label: "الحالات المفتوحة", value: actualsData.openCases, icon: Clock, color: "text-amber-600", bg: "bg-amber-950/30" },
              { label: "متوسط النسبة", value: `${Math.round(actualsData.averageScore)}%`, icon: Star, color: "text-primary", bg: "bg-primary/15" },
            ].map((item, idx) => (
              <div key={item.label}>
                <Card
                  className={`${item.bg} border-none cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                  onClick={() => {
                    const filterMap: Record<number, DrillDownFilter> = {
                      0: { complianceStatus: "compliant", title: "المواقع الممتثلة", subtitle: `نسبة الامتثال: ${actualsData?.complianceRate}%`, icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />, gradient: "from-emerald-500 to-blue-900" },
                      1: { title: "فحوصات هذا الشهر", subtitle: `${actualsData?.scansThisMonth} فحص`, icon: <BarChart3 className="w-6 h-6 text-blue-500" />, gradient: "from-blue-500 to-blue-600" },
                      2: { title: "الحالات المفتوحة", subtitle: `${actualsData?.openCases} حالة`, icon: <Clock className="w-6 h-6 text-amber-500" />, gradient: "from-amber-500 to-amber-600" },
                      3: { title: "جميع المواقع", subtitle: `متوسط النسبة: ${Math.round(actualsData?.averageScore || 0)}%`, icon: <Star className="w-6 h-6 text-primary" />, gradient: "from-primary to-[oklch(0.48_0.14_290)]" },
                    };
                    const f = filterMap[idx];
                    if (f) openDrillDown(f);
                  }}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                      <div>
                        <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                      </div>
                      <Eye className="w-4 h-4 text-muted-foreground/40 me-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards by Category */}
      {Object.entries(grouped).map(([category, kpis], catIdx) => {
        const catInfo = CATEGORY_LABELS[category] || { label: category, icon: Target, color: "from-gray-500 to-gray-600" };
        const CatIcon = catInfo.icon;
        return (
          <div key={category}>
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${catInfo.color} flex items-center justify-center`}>
                    <CatIcon className="w-4 h-4 text-white" />
                  </div>
                  {catInfo.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                  {kpis.map((kpi: any, idx: number) => {
                    const actual = actualsData ? mapActualValue(kpi, actualsData) : 0;
                    const progress = getProgressPct(actual, kpi.targetValue, kpi.direction);
                    const status = getStatusColor(actual, kpi.targetValue, kpi.direction, kpi.thresholdGreen || 80, kpi.thresholdYellow || 60);
                    const statusColors = {
                      green: { bg: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-200", badge: "bg-emerald-100 bg-emerald-900/30 text-emerald-400" },
                      yellow: { bg: "bg-amber-500", text: "text-amber-600", ring: "ring-amber-200", badge: "bg-amber-100 bg-amber-900/30 text-amber-400" },
                      red: { bg: "bg-red-500", text: "text-red-600", ring: "ring-red-200", badge: "bg-red-100 bg-red-900/30 text-red-400" },
                    }[status];

                    return (
                      <div
                        key={kpi.id}
                        className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          const name = kpi.name?.toLowerCase() || "";
                          let f: DrillDownFilter = { title: kpi.nameAr || kpi.name, subtitle: `الفعلي: ${actual} ${kpi.unit} | الهدف: ${kpi.targetValue} ${kpi.unit}`, icon: <CatIcon className="w-6 h-6 text-white" />, gradient: catInfo.color };
                          if (name.includes("compliance") || name.includes("الامتثال")) f.complianceStatus = "compliant";
                          else if (name.includes("non-compliant") || name.includes("غير ممتثل")) f.complianceStatus = "non_compliant";
                          openDrillDown(f);
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium">{kpi.nameAr}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] px-1.5">{PERIOD_LABELS[kpi.period] || kpi.period}</Badge>
                              <span>{kpi.direction === "higher_is_better" ? "↑ أعلى أفضل" : "↓ أقل أفضل"}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(kpi)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm("حذف هذا المؤشر؟")) deleteTarget.mutate({ id: kpi.id }); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className={`font-bold text-lg ${statusColors.text}`}>
                              {actual} {kpi.unit}
                            </span>
                            <span className="text-muted-foreground">
                              الهدف: {kpi.targetValue} {kpi.unit}
                            </span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              animate={{ width: `${progress}%` }}
                              className={`h-full rounded-full ${statusColors.bg}`}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors.badge}`}>
                              {status === "green" ? "ممتاز" : status === "yellow" ? "مقبول" : "يحتاج تحسين"}
                            </span>
                            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                          </div>
                        </div>

                        {/* Thresholds */}
                        <div className="flex gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            أخضر: {kpi.thresholdGreen}{kpi.unit}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            أصفر: {kpi.thresholdYellow}{kpi.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}

      {kpiList.length === 0 && !targets.isLoading && (
        <Card className="text-center py-12 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent>
            <Target className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد مؤشرات أداء</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإنشاء مؤشرات أداء أو استخدم المؤشرات الافتراضية</p>
            <Button onClick={() => seedDefaults.mutate()} disabled={seedDefaults.isPending} className="gap-2">
              <Zap className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
              إنشاء مؤشرات افتراضية
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate || !!editKpi} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditKpi(null); resetForm(); } }}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editKpi ? "تعديل مؤشر الأداء" : "إضافة مؤشر أداء جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 stagger-children">
              <div>
                <Label>الاسم (English)</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Compliance Rate" />
              </div>
              <div>
                <Label>الاسم (عربي)</Label>
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} placeholder="نسبة الامتثال" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 stagger-children">
              <div>
                <Label>الفئة</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance">الامتثال</SelectItem>
                    <SelectItem value="scanning">الفحص</SelectItem>
                    <SelectItem value="response">الاستجابة</SelectItem>
                    <SelectItem value="coverage">التغطية</SelectItem>
                    <SelectItem value="quality">الجودة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الفترة</Label>
                <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">شهري</SelectItem>
                    <SelectItem value="quarterly">ربع سنوي</SelectItem>
                    <SelectItem value="yearly">سنوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 stagger-children">
              <div>
                <Label>القيمة المستهدفة</Label>
                <Input type="number" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })} />
              </div>
              <div>
                <Label>الوحدة</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="%" />
              </div>
              <div>
                <Label>الاتجاه</Label>
                <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="higher_is_better">أعلى أفضل</SelectItem>
                    <SelectItem value="lower_is_better">أقل أفضل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 stagger-children">
              <div>
                <Label>عتبة الأخضر</Label>
                <Input type="number" value={form.thresholdGreen} onChange={(e) => setForm({ ...form, thresholdGreen: Number(e.target.value) })} />
              </div>
              <div>
                <Label>عتبة الأصفر</Label>
                <Input type="number" value={form.thresholdYellow} onChange={(e) => setForm({ ...form, thresholdYellow: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditKpi(null); resetForm(); }}>إلغاء</Button>
            <Button
              onClick={() => {
                if (!form.name || !form.nameAr) { toast.error("يرجى ملء جميع الحقول"); return; }
                if (editKpi) {
                  updateTarget.mutate({ id: editKpi.id, ...form } as any);
                } else {
                  createTarget.mutate(form as any);
                }
              }}
              disabled={createTarget.isPending || updateTarget.isPending}
            >
              {(createTarget.isPending || updateTarget.isPending) ? <Loader2 className="w-4 h-4 animate-spin ms-2" /> : null}
              {editKpi ? "تحديث" : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
