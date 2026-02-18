import { useState, useEffect, useMemo } from "react";
import DrillDownModal, { useDrillDown } from "@/components/DrillDownModal";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Building2, Landmark, TrendingUp, TrendingDown, Minus, Shield, ShieldAlert, ShieldX, ShieldOff,
  BarChart3, FileSpreadsheet, Download, ArrowLeftRight, CheckCircle2, XCircle, AlertTriangle,
  Layers, Scale, Trophy, Target, Zap, Eye
} from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/formatters";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const formatArabicNumber = formatNumber;
const formatArabicPercentage = (v: number) => formatPercent(v);

// ===== Animated Counter =====
function AnimatedCounter({ end, duration = 1500, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) { setCount(0); return; }
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{formatArabicNumber(count)}{suffix}</span>;
}

// ===== Circular Progress Ring =====
function ProgressRing({ value, size = 120, strokeWidth = 10, color = "#2563eb", bgColor = "#e5e7eb", label }: {
  value: number; size?: number; strokeWidth?: number; color?: string; bgColor?: string; label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (value / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, circumference]);

  return (
    <div
      className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <WatermarkLogo />
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color }}>{formatArabicNumber(value)}٪</span>
        {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
      </div>
    </div>
  );
}

// ===== Comparison Bar =====
function ComparisonBar({ publicValue, privateValue, label, publicColor = "#1e3a5f", privateColor = "#2563eb" }: {
  publicValue: number; privateValue: number; label: string; publicColor?: string; privateColor?: string;
}) {
  const total = publicValue + privateValue;
  const pubPercent = total > 0 ? (publicValue / total) * 100 : 50;
  const priPercent = total > 0 ? (privateValue / total) * 100 : 50;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-bold">{formatArabicNumber(total)}</span>
      </div>
      <div className="flex h-8 rounded-full overflow-hidden bg-muted/30">
        <div className="flex items-center justify-center text-white text-xs font-bold transition-all duration-1000 ease-out"
          style={{ width: `${pubPercent}%`, backgroundColor: publicColor, minWidth: pubPercent > 5 ? undefined : '20px' }}>
          {pubPercent > 10 && formatArabicNumber(publicValue)}
        </div>
        <div className="flex items-center justify-center text-white text-xs font-bold transition-all duration-1000 ease-out"
          style={{ width: `${priPercent}%`, backgroundColor: privateColor, minWidth: priPercent > 5 ? undefined : '20px' }}>
          {priPercent > 10 && formatArabicNumber(privateValue)}
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>القطاع العام: {formatArabicNumber(publicValue)} ({formatArabicNumber(Math.round(pubPercent))}٪)</span>
        <span>القطاع الخاص: {formatArabicNumber(privateValue)} ({formatArabicNumber(Math.round(priPercent))}٪)</span>
      </div>
    </div>
  );
}

// ===== Sector Hero Card =====
function SectorHeroCard({ title, icon: Icon, stats, color, gradient, delay = 0 }: {
  title: string;
  icon: any;
  stats: { total: number; compliant: number; partial: number; nonCompliant: number; noPolicy: number; avgScore: number };
  color: string;
  gradient: string;
  delay?: number;
}) {
  const complianceRate = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${delay}ms`, animationFillMode: 'both', animationDuration: '600ms' }}>
      <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-1 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        {/* Gradient Background */}
        <div className={`absolute inset-0 ${gradient} opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-500`} />
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        
        <CardHeader className="relative pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${gradient} shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="gradient-text text-lg">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                إجمالي المواقع: <span className="font-bold" style={{ color }}>{formatArabicNumber(stats.total)}</span>
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-4">
          {/* Main Score Ring */}
          <div className="flex items-center gap-6">
            <ProgressRing value={complianceRate} color={color} label="نسبة الامتثال" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/30">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-sm">ممتثل</span>
                <span className="font-bold text-emerald-600 ms-auto">{formatArabicNumber(stats.compliant)}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/30">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <span className="text-sm">جزئي</span>
                <span className="font-bold text-amber-600 ms-auto">{formatArabicNumber(stats.partial)}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-red-950/30">
                <ShieldX className="h-4 w-4 text-red-600" />
                <span className="text-sm">غير ممتثل</span>
                <span className="font-bold text-red-600 ms-auto">{formatArabicNumber(stats.nonCompliant)}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-950/30">
                <ShieldOff className="h-4 w-4 text-gray-500" />
                <span className="text-sm">لا يعمل</span>
                <span className="font-bold text-gray-500 ms-auto">{formatArabicNumber(stats.noPolicy)}</span>
              </div>
            </div>
          </div>
          
          {/* Average Score */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-l from-muted/50 to-transparent">
            <Target className="h-5 w-5" style={{ color }} />
            <span className="text-sm font-medium">متوسط الدرجة</span>
            <span className="font-bold text-lg ms-auto" style={{ color }}>
              <AnimatedCounter end={stats.avgScore} suffix="٪" />
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== Clause Comparison Card =====
function ClauseComparisonCard({ clauseNum, publicRate, privateRate, delay = 0 }: {
  clauseNum: number; publicRate: number; privateRate: number; delay?: number;
}) {
  const diff = publicRate - privateRate;
  const winner = diff > 0 ? 'public' : diff < 0 ? 'private' : 'tie';
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-3" style={{ animationDelay: `${delay}ms`, animationFillMode: 'both', animationDuration: '500ms' }}>
      <Card className="border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-bold">البند {formatArabicNumber(clauseNum)}</Badge>
            {winner === 'public' && <Badge className="bg-[#1e3a5f] text-white text-xs">العام أفضل</Badge>}
            {winner === 'private' && <Badge className="bg-[#2563eb] text-white text-xs">الخاص أفضل</Badge>}
            {winner === 'tie' && <Badge variant="secondary" className="text-xs">متساوي</Badge>}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Landmark className="h-3.5 w-3.5 text-[#1e3a5f]" />
              <span className="text-xs text-muted-foreground w-16">العام</span>
              <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#1e3a5f] rounded-full transition-all duration-1000 ease-out flex items-center justify-end pe-2"
                  style={{ width: `${Math.max(publicRate, 3)}%` }}>
                  {publicRate > 15 && <span className="text-[10px] text-white font-bold">{formatArabicNumber(publicRate)}٪</span>}
                </div>
              </div>
              {publicRate <= 15 && <span className="text-xs font-bold text-[#1e3a5f]">{formatArabicNumber(publicRate)}٪</span>}
            </div>
            
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-[#2563eb]" />
              <span className="text-xs text-muted-foreground w-16">الخاص</span>
              <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#2563eb] rounded-full transition-all duration-1000 ease-out flex items-center justify-end pe-2"
                  style={{ width: `${Math.max(privateRate, 3)}%` }}>
                  {privateRate > 15 && <span className="text-[10px] text-white font-bold">{formatArabicNumber(privateRate)}٪</span>}
                </div>
              </div>
              {privateRate <= 15 && <span className="text-xs font-bold text-[#2563eb]">{formatArabicNumber(privateRate)}٪</span>}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-1 pt-1">
            {diff > 0 ? <TrendingUp className="h-3.5 w-3.5 text-[#1e3a5f]" /> : diff < 0 ? <TrendingDown className="h-3.5 w-3.5 text-[#2563eb]" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
            <span className="text-xs font-medium text-muted-foreground">
              فرق: {formatArabicNumber(Math.abs(diff))}٪
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== Main Component =====
export default function SectorComparison() {
  const { playClick, playHover } = useSoundEffects();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();
  const { data, isLoading } = trpc.sectorComparison.detailed.useQuery();
  const exportMutation = trpc.sectorComparison.exportExcel.useMutation();
  const [activeTab, setActiveTab] = useState("overview");

  const handleExportExcel = async () => {
    try {
      const result = await exportMutation.mutateAsync();
      const byteArray = Uint8Array.from(atob(result.base64), c => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير التقرير بنجاح");
    } catch {
      toast.error("فشل في تصدير التقرير");
    }
  };

  if (isLoading || !data) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-muted/50 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
          {[1, 2].map(i => (
            <div key={i} className="h-96 bg-muted/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const publicStats = data.public;
  const privateStats = data.private;

  return (
    <div className="p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25">
            <Scale className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مقارنة القطاعات</h1>
            <p className="text-muted-foreground text-sm">مقارنة تفاعلية بين أداء القطاع العام والخاص</p>
          </div>
        </div>
        <Button onClick={handleExportExcel} disabled={exportMutation.isPending} variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          {exportMutation.isPending ? "جاري التصدير..." : "تصدير Excel"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 from-blue-950/30 to-indigo-950/30 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" onClick={() => openDrillDown({ title: 'إجمالي المواقع', subtitle: 'مقارنة بين القطاعين العام والخاص' })}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-600 shadow-lg">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المواقع</p>
                <p className="text-3xl font-bold text-blue-400">
                  <AnimatedCounter end={data.summary.totalSites} />
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 from-emerald-950/30 to-green-950/30 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep" onClick={() => openDrillDown({ title: 'إجمالي الممتثل', subtitle: 'المواقع الممتثلة في القطاعين', complianceStatus: 'compliant' })}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-600 shadow-lg">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الممتثل</p>
                <p className="text-3xl font-bold text-emerald-400">
                  <AnimatedCounter end={data.summary.totalCompliant} />
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 from-primary/15 to-primary/15 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep" onClick={() => openDrillDown({ title: 'نسبة الامتثال الكلية', subtitle: 'تفاصيل الامتثال العام' })}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary shadow-lg btn-glow">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نسبة الامتثال الكلية</p>
                <p className="text-3xl font-bold text-primary">
                  <AnimatedCounter end={data.summary.overallRate} suffix="٪" />
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="overview" className="gap-2 text-sm">
            <ArrowLeftRight className="h-4 w-4" />
            المقارنة العامة
          </TabsTrigger>
          <TabsTrigger value="clauses" className="gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            بنود المادة ١٢
          </TabsTrigger>
          <TabsTrigger value="details" className="gap-2 text-sm">
            <Eye className="h-4 w-4" />
            التفاصيل
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Side by Side Hero Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
            <SectorHeroCard
              title="القطاع العام"
              icon={Landmark}
              stats={publicStats}
              color="#1e3a5f"
              gradient="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e]"
              delay={100}
            />
            <SectorHeroCard
              title="القطاع الخاص"
              icon={Building2}
              stats={privateStats}
              color="#2563eb"
              gradient="bg-gradient-to-br from-[#2563eb] to-[#4f86f7]"
              delay={200}
            />
          </div>

          {/* Comparison Bars */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 glass-card gold-sweep" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
                المقارنة التفصيلية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ComparisonBar publicValue={publicStats.total} privateValue={privateStats.total} label="إجمالي المواقع" />
              <ComparisonBar publicValue={publicStats.compliant} privateValue={privateStats.compliant} label="ممتثل" publicColor="#059669" privateColor="#10b981" />
              <ComparisonBar publicValue={publicStats.partial} privateValue={privateStats.partial} label="ممتثل جزئياً" publicColor="#d97706" privateColor="#f59e0b" />
              <ComparisonBar publicValue={publicStats.nonCompliant} privateValue={privateStats.nonCompliant} label="غير ممتثل" publicColor="#dc2626" privateColor="#ef4444" />
              <ComparisonBar publicValue={publicStats.noPolicy} privateValue={privateStats.noPolicy} label="لا يعمل" publicColor="#6b7280" privateColor="#9ca3af" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clauses Tab */}
        <TabsContent value="clauses" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {Array.from({ length: 8 }, (_, i) => {
              const pubClause = publicStats.clauses[i] || { rate: 0 };
              const priClause = privateStats.clauses[i] || { rate: 0 };
              return (
                <ClauseComparisonCard
                  key={i}
                  clauseNum={i + 1}
                  publicRate={pubClause.rate}
                  privateRate={priClause.rate}
                  delay={i * 80}
                />
              );
            })}
          </div>
          
          {/* Legend */}
          <Card className="border-0 shadow-md animate-in fade-in duration-500 glass-card gold-sweep" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
            <CardContent className="p-4 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#1e3a5f]" />
                <span className="text-sm">القطاع العام</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#2563eb]" />
                <span className="text-sm">القطاع الخاص</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 mt-6">
          {/* Categories Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
            {/* Public Sector Categories */}
            <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep">
              <CardHeader className="bg-gradient-to-l from-[#1e3a5f]/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
                  <Landmark className="h-5 w-5" />
                  فئات القطاع العام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {publicStats.categories && publicStats.categories.length > 0 ? (
                  publicStats.categories.map((cat: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm">{cat.classification || 'غير مصنف'}</span>
                      <Badge variant="outline" className="font-bold">{formatArabicNumber(Number(cat.count))}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">لا توجد فئات</p>
                )}
              </CardContent>
            </Card>

            {/* Private Sector Categories */}
            <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-left-4 duration-500 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep">
              <CardHeader className="bg-gradient-to-l from-[#2563eb]/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-[#2563eb]">
                  <Building2 className="h-5 w-5" />
                  فئات القطاع الخاص
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {privateStats.categories && privateStats.categories.length > 0 ? (
                  privateStats.categories.map((cat: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm">{cat.classification || 'غير مصنف'}</span>
                      <Badge variant="outline" className="font-bold">{formatArabicNumber(Number(cat.count))}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">لا توجد فئات</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Summary Table */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 glass-card gold-sweep" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                جدول المقارنة الشامل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="p-3 text-start font-bold">المؤشر</th>
                      <th className="p-3 text-center font-bold text-[#1e3a5f]">القطاع العام</th>
                      <th className="p-3 text-center font-bold text-[#2563eb]">القطاع الخاص</th>
                      <th className="p-3 text-center font-bold">الأفضل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'إجمالي المواقع', pub: publicStats.total, pri: privateStats.total, higherBetter: true },
                      { label: 'ممتثل', pub: publicStats.compliant, pri: privateStats.compliant, higherBetter: true },
                      { label: 'ممتثل جزئياً', pub: publicStats.partial, pri: privateStats.partial, higherBetter: false },
                      { label: 'غير ممتثل', pub: publicStats.nonCompliant, pri: privateStats.nonCompliant, higherBetter: false },
                      { label: 'لا يعمل', pub: publicStats.noPolicy, pri: privateStats.noPolicy, higherBetter: false },
                      { label: 'متوسط الدرجة', pub: publicStats.avgScore, pri: privateStats.avgScore, higherBetter: true },
                    ].map((row, i) => {
                      const pubRate = publicStats.total > 0 ? (row.label === 'متوسط الدرجة' ? row.pub : Math.round((row.pub / publicStats.total) * 100)) : 0;
                      const priRate = privateStats.total > 0 ? (row.label === 'متوسط الدرجة' ? row.pri : Math.round((row.pri / privateStats.total) * 100)) : 0;
                      const winner = row.higherBetter ? (pubRate > priRate ? 'public' : priRate > pubRate ? 'private' : 'tie') : (pubRate < priRate ? 'public' : priRate < pubRate ? 'private' : 'tie');
                      
                      return (
                        <tr key={i} className="border-b hover:bg-muted/20 transition-colors">
                          <td className="p-3 font-medium">{row.label}</td>
                          <td className={`p-3 text-center font-bold ${winner === 'public' ? 'text-emerald-600' : ''}`}>
                            {formatArabicNumber(row.pub)}
                            {row.label !== 'متوسط الدرجة' && <span className="text-xs text-muted-foreground ms-1">({formatArabicNumber(pubRate)}٪)</span>}
                          </td>
                          <td className={`p-3 text-center font-bold ${winner === 'private' ? 'text-emerald-600' : ''}`}>
                            {formatArabicNumber(row.pri)}
                            {row.label !== 'متوسط الدرجة' && <span className="text-xs text-muted-foreground ms-1">({formatArabicNumber(priRate)}٪)</span>}
                          </td>
                          <td className="p-3 text-center">
                            {winner === 'public' && <Badge className="bg-[#1e3a5f] text-white text-xs">العام</Badge>}
                            {winner === 'private' && <Badge className="bg-[#2563eb] text-white text-xs">الخاص</Badge>}
                            {winner === 'tie' && <Badge variant="secondary" className="text-xs">متساوي</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
