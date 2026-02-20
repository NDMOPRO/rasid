import { useState, useEffect, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatPercent } from '@/lib/formatters';
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

// Helper to convert to Arabic numerals
function toArabicNumerals(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}
import {
  TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight,
  Calendar, BarChart3, Shield, ShieldAlert, ShieldX, FileX2,
  Building2, Landmark, Download, RefreshCw, Layers, ChevronLeft, ChevronRight
} from 'lucide-react';
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const CLAUSE_NAMES = [
  'الإفصاح عن جمع البيانات',
  'أغراض المعالجة',
  'مشاركة البيانات مع أطراف ثالثة',
  'حقوق أصحاب البيانات',
  'أمن البيانات',
  'الاحتفاظ بالبيانات',
  'بيانات الأطفال',
  'التحديثات والإشعارات',
];

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{toArabicNumerals(display)}{suffix}</span>;
}

function TrendIndicator({ change, size = 'md' }: { change: number; size?: 'sm' | 'md' | 'lg' }) {
  const isPositive = change > 0;
  const isNeutral = change === 0;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  if (isNeutral) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-600 font-medium ${sizeClasses[size]}`}>
        <Minus className="w-3 h-3" />
        <span>ثابت</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${sizeClasses[size]} ${
      isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
    } animate-in fade-in slide-in-from-bottom-1 duration-500`}>
      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      <span>{toArabicNumerals(Math.abs(change))}٪</span>
    </span>
  );
}

function ComparisonCard({
  title,
  icon: Icon,
  currentValue,
  previousValue,
  change,
  color,
  delay = 0,
  onClick,
}: {
  title: string;
  icon: any;
  currentValue: number;
  previousValue: number;
  change: number;
  color: string;
  delay?: number;
  onClick?: () => void;
}) {
  const colorMap: Record<string, { gradient: string; iconBg: string; barCurrent: string; barPrevious: string }> = {
    emerald: {
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 text-emerald-600',
      barCurrent: 'bg-gradient-to-l from-emerald-500 to-emerald-400',
      barPrevious: 'bg-emerald-200',
    },
    amber: {
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 text-amber-600',
      barCurrent: 'bg-gradient-to-l from-amber-500 to-amber-400',
      barPrevious: 'bg-amber-200',
    },
    red: {
      gradient: 'from-red-500/10 via-red-500/5 to-transparent',
      iconBg: 'bg-red-500/15 text-red-600',
      barCurrent: 'bg-gradient-to-l from-red-500 to-red-400',
      barPrevious: 'bg-red-200',
    },
    slate: {
      gradient: 'from-slate-500/10 via-slate-500/5 to-transparent',
      iconBg: 'bg-slate-500/15 text-slate-600',
      barCurrent: 'bg-gradient-to-l from-slate-500 to-slate-400',
      barPrevious: 'bg-slate-200',
    },
    blue: {
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-500/15 text-blue-600',
      barCurrent: 'bg-gradient-to-l from-blue-500 to-blue-400',
      barPrevious: 'bg-blue-200',
    },
  };

  const c = colorMap[color] || colorMap.blue;
  const maxVal = Math.max(currentValue, previousValue, 1);

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-500 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all' : ''}`}
     
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-bl ${c.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              <Icon className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
            </div>
            <h3 className="font-bold text-foreground">{title}</h3>
          </div>
          <TrendIndicator change={change} />
        </div>

        {/* Values comparison */}
        <div className="grid grid-cols-2 gap-4 mb-4 stagger-children">
          <div className="text-center p-3 rounded-xl bg-background/80 border border-border/30">
            <div className="text-xs text-muted-foreground mb-1">الشهر الحالي</div>
            <div className="text-2xl font-black text-foreground">
              <AnimatedCounter value={currentValue} />
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-background/50 border border-border/20">
            <div className="text-xs text-muted-foreground mb-1">الشهر السابق</div>
            <div className="text-2xl font-black text-muted-foreground/70">
              {toArabicNumerals(previousValue)}
            </div>
          </div>
        </div>

        {/* Visual bar comparison */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-[10px] text-muted-foreground w-14 text-start">الحالي</span>
            <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
              <div
                className={`h-full rounded-full ${c.barCurrent} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.max((currentValue / maxVal) * 100, 2)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-[10px] text-muted-foreground w-14 text-start">السابق</span>
            <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
              <div
                className={`h-full rounded-full ${c.barPrevious} transition-all duration-1000 ease-out`}
                style={{ width: `${Math.max((previousValue / maxVal) * 100, 2)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Difference */}
        <div className="mt-3 text-center">
          <span className="text-xs text-muted-foreground">
            الفرق: <span className={`font-bold ${change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {change > 0 ? '+' : ''}{toArabicNumerals(currentValue - previousValue)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ClauseComparisonRow({
  clauseIndex,
  name,
  currentCount,
  previousCount,
  change,
  totalCurrent,
  totalPrevious,
  delay = 0,
  onClick,
}: {
  clauseIndex: number;
  name: string;
  currentCount: number;
  previousCount: number;
  change: number;
  totalCurrent: number;
  totalPrevious: number;
  delay?: number;
  onClick?: () => void;
}) {
  const currentPct = totalCurrent > 0 ? Math.round((currentCount / totalCurrent) * 100) : 0;
  const previousPct = totalPrevious > 0 ? Math.round((previousCount / totalPrevious) * 100) : 0;

  const colors = [
    'from-blue-500 to-blue-400',
    'from-indigo-500 to-indigo-400',
    'from-[oklch(0.48_0.14_290)] to-primary',
    'from-primary to-[oklch(0.48_0.14_290)]',
    'from-fuchsia-500 to-fuchsia-400',
    'from-pink-500 to-pink-400',
    'from-rose-500 to-rose-400',
    'from-orange-500 to-orange-400',
  ];

  return (
    <div
      onClick={onClick}
      className={`group p-4 rounded-xl border border-border/30 bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all' : ''}`}
     
    >
      <div className="flex items-center justify-between flex-wrap mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[clauseIndex]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
            {toArabicNumerals(clauseIndex + 1)}
          </div>
          <span className="font-medium text-sm text-foreground">{name}</span>
        </div>
        <TrendIndicator change={change} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-3 stagger-children">
        <div>
          <div className="text-xs sm:text-[10px] text-muted-foreground mb-1">الحالي</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-l ${colors[clauseIndex]} transition-all duration-1000`}
                style={{ width: `${currentPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground w-10 text-start">{toArabicNumerals(currentPct)}٪</span>
          </div>
        </div>
        <div>
          <div className="text-xs sm:text-[10px] text-muted-foreground mb-1">السابق</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-gray-300 transition-all duration-1000"
                style={{ width: `${previousPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground w-10 text-start">{toArabicNumerals(previousPct)}٪</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TimeComparison() {
  const { playClick, playHover } = useSoundEffects();
  const { data, isLoading, refetch } = trpc.timeComparison.getDetailed.useQuery();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full p-6 space-y-6" dir="rtl">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center" dir="rtl">
        <p className="text-muted-foreground">لا تتوفر بيانات للمقارنة الزمنية</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
            </div>
            المقارنة الزمنية
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            مقارنة مؤشرات {data.monthLabel.current} مع {data.monthLabel.previous}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex items-center justify-center gap-4">
        <Badge variant="outline" className="px-4 py-2 text-sm bg-blue-50 border-blue-200 text-blue-700">
          <Calendar className="w-4 h-4 ms-2" />
          {data.monthLabel.previous}
        </Badge>
        <div className="flex items-center gap-1 text-muted-foreground">
          <ChevronRight className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
          <span className="text-xs font-medium">مقارنة</span>
          <ChevronLeft className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
        </div>
        <Badge variant="outline" className="px-4 py-2 text-sm bg-emerald-50 border-emerald-200 text-emerald-700">
          <Calendar className="w-4 h-4 ms-2" />
          {data.monthLabel.current}
        </Badge>
      </div>

      {/* Overall compliance rate comparison */}
      <Card
        onClick={() => openDrillDown({ title: 'نسبة الامتثال الإجمالية', subtitle: `مقارنة معدل الامتثال بين الشهرين`, icon: <Calendar /> })}
        className="overflow-hidden border-0 shadow-xl cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
      >
        <div className="bg-gradient-to-l from-blue-600 via-indigo-600 to-[oklch(0.42_0.14_290)] p-6 text-white">
          <div className="flex items-center justify-between flex-wrap">
            <div>
              <h2 className="text-lg font-bold opacity-90">نسبة الامتثال الإجمالية</h2>
              <p className="text-sm opacity-70 mt-1">مقارنة معدل الامتثال بين الشهرين</p>
            </div>
            <TrendIndicator change={data.changes.complianceRate} size="lg" />
          </div>
          <div className="grid grid-cols-2 gap-6 mt-6 stagger-children">
            <div className="text-center p-4 rounded-xl bg-[#C5A55A]/[0.05] dark:bg-white/10 backdrop-blur-sm">
              <div className="text-sm opacity-80 mb-2">{data.monthLabel.current}</div>
              <div className="text-3xl sm:text-5xl font-black">
                <AnimatedCounter value={data.current.complianceRate} suffix="٪" />
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#C5A55A]/[0.03] dark:bg-white/5">
              <div className="text-sm opacity-80 mb-2">{data.monthLabel.previous}</div>
              <div className="text-3xl sm:text-5xl font-black opacity-60">
                {toArabicNumerals(data.previous.complianceRate)}٪
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Status comparison cards */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          مقارنة حالات الامتثال
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <ComparisonCard
            title="ممتثل"
            icon={Shield}
            currentValue={data.current.compliant}
            previousValue={data.previous.compliant}
            change={data.changes.compliant}
            color="emerald"
            delay={0}
            onClick={() => openDrillDown({ title: 'المواقع الممتثلة', subtitle: `مقارنة المواقع الممتثلة بين الشهرين`, icon: <Shield />, complianceStatus: 'compliant' })}
          />
          <ComparisonCard
            title="ممتثل جزئياً"
            icon={ShieldAlert}
            currentValue={data.current.partial}
            previousValue={data.previous.partial}
            change={data.changes.partial}
            color="amber"
            delay={100}
            onClick={() => openDrillDown({ title: 'المواقع الممتثلة جزئياً', subtitle: `مقارنة المواقع الممتثلة جزئياً بين الشهرين`, icon: <ShieldAlert />, complianceStatus: 'partially_compliant' })}
          />
          <ComparisonCard
            title="غير ممتثل"
            icon={ShieldX}
            currentValue={data.current.nonCompliant}
            previousValue={data.previous.nonCompliant}
            change={data.changes.nonCompliant}
            color="red"
            delay={200}
            onClick={() => openDrillDown({ title: 'المواقع غير الممتثلة', subtitle: `مقارنة المواقع غير الممتثلة بين الشهرين`, icon: <ShieldX />, complianceStatus: 'non_compliant' })}
          />
          <ComparisonCard
            title="لا يعمل"
            icon={FileX2}
            currentValue={data.current.noPolicy}
            previousValue={data.previous.noPolicy}
            change={data.changes.noPolicy}
            color="slate"
            delay={300}
            onClick={() => openDrillDown({ title: 'المواقع التي لا تعمل', subtitle: `مقارنة المواقع التي لا تعمل بين الشهرين`, icon: <FileX2 />, complianceStatus: 'no_policy' })}
          />
        </div>
      </div>

      {/* Sector comparison */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-500" />
          مقارنة القطاعات
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          <Card
            onClick={() => openDrillDown({ title: 'مواقع القطاع العام', subtitle: `مقارنة امتثال مواقع القطاع العام`, icon: <Landmark />, sectorType: 'public' })}
            className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">القطاع العام</h3>
                  <p className="text-xs text-muted-foreground">إجمالي {toArabicNumerals(data.sectors.publicTotal)} موقع</p>
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-blue-950/30">
                <div className="text-3xl font-black text-blue-600">
                  {toArabicNumerals(data.sectors.publicCompliant)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">موقع ممتثل</div>
                <div className="text-sm font-bold text-blue-600 mt-1">
                  {data.sectors.publicTotal > 0 ? toArabicNumerals(Math.round((data.sectors.publicCompliant / data.sectors.publicTotal) * 100)) : '٠'}٪
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            onClick={() => openDrillDown({ title: 'مواقع القطاع الخاص', subtitle: `مقارنة امتثال مواقع القطاع الخاص`, icon: <Building2 />, sectorType: 'private' })}
            className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center btn-glow">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">القطاع الخاص</h3>
                  <p className="text-xs text-muted-foreground">إجمالي {toArabicNumerals(data.sectors.privateTotal)} موقع</p>
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-primary/15 btn-glow">
                <div className="text-3xl font-black text-primary">
                  {toArabicNumerals(data.sectors.privateCompliant)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">موقع ممتثل</div>
                <div className="text-sm font-bold text-primary mt-1">
                  {data.sectors.privateTotal > 0 ? toArabicNumerals(Math.round((data.sectors.privateCompliant / data.sectors.privateTotal) * 100)) : '٠'}٪
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clause-by-clause comparison */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          مقارنة بنود المادة ١٢
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
          {CLAUSE_NAMES.map((name, i) => (
            <ClauseComparisonRow
              key={i}
              clauseIndex={i}
              name={name}
              currentCount={data.current.clauseCounts[i]}
              previousCount={data.previous.clauseCounts[i]}
              change={data.changes.clauseChanges[i]}
              totalCurrent={data.current.scannedSites}
              totalPrevious={data.previous.scannedSites}
              delay={i * 50}
              onClick={() => openDrillDown({ title: `مقارنة بند: ${name}`, subtitle: `التغير في الامتثال للبند ${i + 1}`, icon: <BarChart3 />, clauseIndex: i })}
            />
          ))}
        </div>
      </div>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
