import { useState, useCallback, useEffect, useMemo } from 'react';
import DrillDownModal, { useDrillDown } from "@/components/DrillDownModal";
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatNumber } from '@/lib/formatters';
import {
  GripVertical, Settings2, Eye, EyeOff, Plus, Save, RotateCcw,
  Shield, ShieldAlert, ShieldX, FileX2, Building2, Landmark,
  BarChart3, Calendar, Bell, TrendingUp, Star, Layers,
  ArrowUpRight, ArrowDownRight, Minus, CheckCircle2
} from 'lucide-react';
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

function toAr(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

// Widget type definitions
const WIDGET_CATALOG = [
  { type: 'compliance_overview', title: 'نظرة عامة على الامتثال', icon: Shield, color: 'from-emerald-500 to-blue-800', defaultWidth: 2 },
  { type: 'sector_comparison', title: 'مقارنة القطاعات', icon: Building2, color: 'from-blue-500 to-indigo-500', defaultWidth: 1 },
  { type: 'clause_stats', title: 'بنود المادة ١٢', icon: BarChart3, color: 'from-[oklch(0.48_0.14_290)] to-primary', defaultWidth: 1 },
  { type: 'recent_scans', title: 'آخر الفحوصات', icon: Calendar, color: 'from-orange-500 to-amber-500', defaultWidth: 1 },
  { type: 'alerts_summary', title: 'ملخص التنبيهات', icon: Bell, color: 'from-red-500 to-rose-500', defaultWidth: 1 },
  { type: 'time_comparison', title: 'المقارنة الزمنية', icon: TrendingUp, color: 'from-cyan-500 to-blue-500', defaultWidth: 2 },
  { type: 'top_compliant', title: 'أفضل المواقع امتثالاً', icon: Star, color: 'from-yellow-500 to-orange-500', defaultWidth: 1 },
  { type: 'category_stats', title: 'إحصائيات الفئات', icon: Layers, color: 'from-pink-500 to-fuchsia-500', defaultWidth: 1 },
];

interface WidgetData {
  widgetType: string;
  title: string;
  position: number;
  gridWidth: number;
  isVisible: boolean;
  config?: any;
}

// Mini widget renderers
function ComplianceOverviewWidget({ stats }: { stats: any }) {
  if (!stats) return <WidgetSkeleton />;
  const items = [
    { label: 'ممتثل', value: stats.compliant || 0, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'جزئي', value: stats.partiallyCompliant || 0, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'غير ممتثل', value: stats.nonCompliant || 0, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'لا يعمل', value: stats.noPolicy || 0, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];
  const total = items.reduce((s, i) => s + i.value, 0);
  return (
    <div
      className="space-y-3">
      <WatermarkLogo />
      <div className="text-center p-3 rounded-xl bg-gradient-to-l from-emerald-500/10 to-blue-800/10">
        <div className="text-3xl font-black text-emerald-600">{toAr(total > 0 ? Math.round((items[0].value / total) * 100) : 0)}٪</div>
        <div className="text-xs text-muted-foreground">نسبة الامتثال</div>
      </div>
      <div className="grid grid-cols-2 gap-2 stagger-children">
        {items.map((item, i) => (
          <div key={i} className={`p-2 rounded-lg ${item.bg} text-center`}>
            <div className={`text-lg font-bold ${item.color}`}>{toAr(item.value)}</div>
            <div className="text-[10px] text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectorComparisonWidget({ stats }: { stats: any }) {
  if (!stats) return <WidgetSkeleton />;
  const publicStats = stats.bySectorType?.find((s: any) => s.sectorType === 'public');
  const privateStats = stats.bySectorType?.find((s: any) => s.sectorType === 'private');
  return (
    <div className="space-y-3">
      {[{ label: 'القطاع العام', data: publicStats, icon: Landmark, color: 'blue' },
        { label: 'القطاع الخاص', data: privateStats, icon: Building2, color: 'purple' }].map((sector, i) => (
        <div key={i} className={`p-3 rounded-xl bg-${sector.color}-950/20 border border-${sector.color}-200/30`}>
          <div className="flex items-center gap-2 mb-2">
            <sector.icon className={`w-4 h-4 text-${sector.color}-600`} />
            <span className="text-sm font-bold">{sector.label}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">الامتثال</span>
            <span className={`text-lg font-black text-${sector.color}-600`}>
              {toAr(sector.data?.complianceRate || 0)}٪
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClauseStatsWidget({ clauseStats }: { clauseStats: any }) {
  if (!clauseStats) return <WidgetSkeleton />;
  const clauses = clauseStats?.clauses || [];
  return (
    <div className="space-y-2">
      {clauses.slice(0, 8).map((clause: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[oklch(0.48_0.14_290)] to-primary flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {toAr(i + 1)}
          </div>
          <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[oklch(0.48_0.14_290)] to-primary"
              style={{ width: `${clause.complianceRate || 0}%` }}
            />
          </div>
          <span className="text-xs font-bold w-10 text-start">{toAr(Math.round(clause.complianceRate || 0))}٪</span>
        </div>
      ))}
    </div>
  );
}

function RecentScansWidget({ scans }: { scans: any }) {
  if (!scans) return <WidgetSkeleton />;
  const recentList = scans?.slice?.(0, 5) || [];
  const statusColors: Record<string, string> = {
    compliant: 'bg-emerald-100 text-emerald-700',
    partially_compliant: 'bg-amber-100 text-amber-700',
    non_compliant: 'bg-red-100 text-red-700',
    no_policy: 'bg-slate-100 text-slate-700',
  };
  const statusLabels: Record<string, string> = {
    compliant: 'ممتثل',
    partially_compliant: 'جزئي',
    non_compliant: 'غير ممتثل',
    no_policy: 'لا يعمل',
  };
  return (
    <div className="space-y-2">
      {recentList.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">لا توجد فحوصات حديثة</p>
      ) : recentList.map((scan: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{scan.domain || scan.url}</div>
          </div>
          <Badge className={`text-[10px] ${statusColors[scan.complianceStatus] || 'bg-gray-100'}`}>
            {statusLabels[scan.complianceStatus] || scan.complianceStatus}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function AlertsSummaryWidget({ alertStats }: { alertStats: any }) {
  if (!alertStats) return <WidgetSkeleton />;
  const items = [
    { label: 'حرجة', value: alertStats.critical || 0, color: 'bg-red-100 text-red-700' },
    { label: 'تحذيرية', value: alertStats.warning || 0, color: 'bg-amber-100 text-amber-700' },
    { label: 'معلوماتية', value: alertStats.info || 0, color: 'bg-blue-100 text-blue-700' },
    { label: 'نجاح', value: alertStats.success || 0, color: 'bg-emerald-100 text-emerald-700' },
  ];
  return (
    <div className="space-y-3">
      <div className="text-center p-3 rounded-xl bg-gradient-to-l from-red-500/10 to-rose-500/10">
        <div className="text-3xl font-black text-red-600">{toAr(alertStats.unread || 0)}</div>
        <div className="text-xs text-muted-foreground">تنبيهات غير مقروءة</div>
      </div>
      <div className="grid grid-cols-2 gap-2 stagger-children">
        {items.map((item, i) => (
          <div key={i} className={`p-2 rounded-lg ${item.color} text-center`}>
            <div className="text-lg font-bold">{toAr(item.value)}</div>
            <div className="text-[10px]">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeComparisonWidget({ comparison }: { comparison: any }) {
  if (!comparison) return <WidgetSkeleton />;
  const items = [
    { label: 'ممتثل', current: comparison.current?.compliant || 0, previous: comparison.previous?.compliant || 0, change: comparison.changes?.compliant || 0 },
    { label: 'جزئي', current: comparison.current?.partial || 0, previous: comparison.previous?.partial || 0, change: comparison.changes?.partial || 0 },
    { label: 'غير ممتثل', current: comparison.current?.nonCompliant || 0, previous: comparison.previous?.nonCompliant || 0, change: comparison.changes?.nonCompliant || 0 },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{comparison.monthLabel?.current || 'الحالي'}</span>
        <span>مقابل</span>
        <span>{comparison.monthLabel?.previous || 'السابق'}</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
          <span className="text-sm font-medium">{item.label}</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{toAr(item.current)}</span>
            <span className="text-xs text-muted-foreground">←</span>
            <span className="text-xs text-muted-foreground">{toAr(item.previous)}</span>
            <span className={`text-xs font-bold ${item.change > 0 ? 'text-emerald-600' : item.change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {item.change > 0 ? '+' : ''}{toAr(item.change)}٪
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopCompliantWidget({ stats }: { stats: any }) {
  // Show top compliant sites from stats
  return (
    <div className="space-y-2">
      <div className="text-center p-3 rounded-xl bg-gradient-to-l from-yellow-500/10 to-orange-500/10">
        <Star className="w-8 h-8 text-yellow-500 mx-auto mb-1" />
        <div className="text-xs text-muted-foreground">أفضل المواقع أداءً</div>
      </div>
      <div className="space-y-1">
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
              {toAr(i)}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium">موقع ممتثل #{toAr(i)}</div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryStatsWidget({ stats }: { stats: any }) {
  if (!stats) return <WidgetSkeleton />;
  const categories = stats.byCategory?.slice?.(0, 6) || [];
  return (
    <div className="space-y-2">
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>
      ) : categories.map((cat: any, i: number) => (
        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
          <span className="text-xs font-medium truncate flex-1">{cat.classification || cat.category}</span>
          <Badge variant="outline" className="text-[10px]">{toAr(cat.total || 0)} موقع</Badge>
        </div>
      ))}
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-16 rounded-xl" />
      <div className="grid grid-cols-2 gap-2 stagger-children">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
    </div>
  );
}

// Widget renderer
function WidgetRenderer({ widget, data }: { widget: WidgetData; data: any }) {
  switch (widget.widgetType) {
    case 'compliance_overview':
      return <ComplianceOverviewWidget stats={data.stats} />;
    case 'sector_comparison':
      return <SectorComparisonWidget stats={data.stats} />;
    case 'clause_stats':
      return <ClauseStatsWidget clauseStats={data.clauseStats} />;
    case 'recent_scans':
      return <RecentScansWidget scans={data.recentScans} />;
    case 'alerts_summary':
      return <AlertsSummaryWidget alertStats={data.alertStats} />;
    case 'time_comparison':
      return <TimeComparisonWidget comparison={data.comparison} />;
    case 'top_compliant':
      return <TopCompliantWidget stats={data.stats} />;
    case 'category_stats':
      return <CategoryStatsWidget stats={data.stats} />;
    default:
      return <p className="text-sm text-muted-foreground text-center py-4">عنصر غير معروف</p>;
  }
}

export default function MyDashboard() {
  const { playClick, playHover } = useSoundEffects();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();

  const [isEditing, setIsEditing] = useState(false);
  const [localWidgets, setLocalWidgets] = useState<WidgetData[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Fetch data
  const { data: widgets, isLoading: widgetsLoading, refetch: refetchWidgets } = trpc.userWidgets.getWidgets.useQuery();
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: clauseStats } = trpc.dashboard.clauseStats.useQuery();
  const { data: recentScans } = trpc.dashboard.recentScans.useQuery();
  const { data: alertStats } = trpc.visualAlerts.getStats.useQuery();
  const { data: comparison } = trpc.timeComparison.getDetailed.useQuery();

  const saveWidgetsMutation = trpc.userWidgets.saveWidgets.useMutation({
    onSuccess: () => {
      toast.success('تم حفظ تخصيص لوحتك بنجاح');
      refetchWidgets();
      setIsEditing(false);
    },
  });

  // Sync local state with server data
  useEffect(() => {
    if (widgets) {
      setLocalWidgets(widgets.map((w: any) => ({
        widgetType: w.widgetType,
        title: w.title || '',
        position: w.position,
        gridWidth: w.gridWidth,
        isVisible: w.isVisible,
        config: w.config,
      })));
    }
  }, [widgets]);

  const allData = useMemo(() => ({
    stats,
    clauseStats,
    recentScans,
    alertStats,
    comparison,
  }), [stats, clauseStats, recentScans, alertStats, comparison]);

  const visibleWidgets = localWidgets.filter(w => w.isVisible).sort((a, b) => a.position - b.position);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newWidgets = [...localWidgets];
    const dragItem = newWidgets[dragIndex];
    newWidgets.splice(dragIndex, 1);
    newWidgets.splice(index, 0, dragItem);
    // Update positions
    newWidgets.forEach((w, i) => w.position = i);
    setLocalWidgets(newWidgets);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const toggleWidgetVisibility = (widgetType: string) => {
    setLocalWidgets(prev => prev.map(w =>
      w.widgetType === widgetType ? { ...w, isVisible: !w.isVisible } : w
    ));
  };

  const toggleWidgetWidth = (widgetType: string) => {
    setLocalWidgets(prev => prev.map(w =>
      w.widgetType === widgetType ? { ...w, gridWidth: w.gridWidth === 1 ? 2 : 1 } : w
    ));
  };

  const handleSave = () => {
    saveWidgetsMutation.mutate({ widgets: localWidgets });
  };

  const handleReset = () => {
    if (widgets) {
      setLocalWidgets(widgets.map((w: any) => ({
        widgetType: w.widgetType,
        title: w.title || '',
        position: w.position,
        gridWidth: w.gridWidth,
        isVisible: w.isVisible,
        config: w.config,
      })));
    }
    setIsEditing(false);
  };

  const addWidget = (type: string) => {
    const catalog = WIDGET_CATALOG.find(c => c.type === type);
    if (!catalog) return;
    const exists = localWidgets.find(w => w.widgetType === type);
    if (exists) {
      toggleWidgetVisibility(type);
      return;
    }
    setLocalWidgets(prev => [...prev, {
      widgetType: type,
      title: catalog.title,
      position: prev.length,
      gridWidth: catalog.defaultWidth,
      isVisible: true,
    }]);
  };

  if (widgetsLoading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.48_0.14_290)] to-primary flex items-center justify-center text-white shadow-lg">
              <Layers className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
            </div>
            لوحتي
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            خصص لوحتك باختيار وترتيب المؤشرات المفضلة لديك
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                إلغاء
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-2 bg-gradient-to-l from-[oklch(0.48_0.14_290)] to-primary text-white hover:opacity-90" disabled={saveWidgetsMutation.isPending}>
                <Save className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                {saveWidgetsMutation.isPending ? 'جارٍ الحفظ...' : 'حفظ التخصيص'}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
              <Settings2 className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
              تخصيص اللوحة
            </Button>
          )}
        </div>
      </div>

      {/* Edit mode: Add widgets */}
      {isEditing && (
        <Card className="border-dashed border-2 border-primary/30 bg-primary/10 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 btn-glow">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
              إضافة أو إخفاء العناصر
            </h3>
            <div className="flex flex-wrap gap-2">
              {WIDGET_CATALOG.map(catalog => {
                const widget = localWidgets.find(w => w.widgetType === catalog.type);
                const isActive = widget?.isVisible !== false;
                return (
                  <button
                    key={catalog.type}
                    onClick={() => { addWidget(catalog.type); openDrillDown({ title: catalog.title, subtitle: 'إضافة ودجت جديد' }); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-muted/50 text-muted-foreground border border-border/50 opacity-60'
                    }`}
                  >
                    <catalog.icon className="w-4 h-4" />
                    {catalog.title}
                    {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {visibleWidgets.map((widget, index) => {
          const catalog = WIDGET_CATALOG.find(c => c.type === widget.widgetType);
          if (!catalog) return null;

          return (
            <div
              key={widget.widgetType}
              className={`${widget.gridWidth === 2 ? 'md:col-span-2' : ''} ${
                isEditing ? 'cursor-grab active:cursor-grabbing' : ''
              } ${dragIndex === index ? 'opacity-50' : ''}`}
              draggable={isEditing}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <Card className={`glass-card gold-sweep overflow-hidden transition-all duration-300 hover:shadow-lg ${
                isEditing ? 'border-dashed border-2 border-primary/30' : 'border-border/50'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isEditing && <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />}
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${catalog.color} flex items-center justify-center text-white shadow-sm`}>
                        <catalog.icon className="w-4 h-4" />
                      </div>
                      <CardTitle className="gradient-text text-sm font-bold">{widget.title || catalog.title}</CardTitle>
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWidgetWidth(widget.widgetType)}
                          className="h-7 px-2 text-xs"
                        >
                          {widget.gridWidth === 2 ? 'نصف' : 'كامل'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWidgetVisibility(widget.widgetType)}
                          className="h-7 px-2 text-xs text-red-500 hover:text-red-700"
                        >
                          <EyeOff className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <WidgetRenderer widget={widget} data={allData} />
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {visibleWidgets.length === 0 && (
        <div className="text-center py-12">
          <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">لا توجد عناصر مرئية. اضغط على "تخصيص اللوحة" لإضافة عناصر.</p>
        </div>
      )}
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
