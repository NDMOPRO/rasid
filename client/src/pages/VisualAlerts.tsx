import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Bell, BellOff, Check, CheckCheck, Trash2, AlertTriangle,
  AlertCircle, Info, CheckCircle2, Shield, ShieldAlert, ShieldX,
  ArrowUpRight, ArrowDownRight, ExternalLink, Eye, Filter,
  RefreshCw, X
} from 'lucide-react';
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

function toAr(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

const SEVERITY_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string; label: string; pulse: string }> = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-950/30',
    border: 'border-red-800',
    label: 'حرج',
    pulse: 'animate-pulse',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-950/30',
    border: 'border-amber-800',
    label: 'تحذير',
    pulse: '',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bg: 'bg-blue-950/30',
    border: 'border-blue-800',
    label: 'معلومات',
    pulse: '',
  },
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-800',
    label: 'نجاح',
    pulse: '',
  },
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  status_change: 'تغيير حالة',
  score_change: 'تغيير درجة',
  policy_added: 'إضافة سياسة',
  policy_removed: 'إزالة سياسة',
  clause_change: 'تغيير بنود',
};

const STATUS_LABELS: Record<string, string> = {
  compliant: 'ممتثل',
  partially_compliant: 'ممتثل جزئياً',
  non_compliant: 'غير ممتثل',
  no_policy: 'لا يعمل',
};

function AlertCard({ alert, onMarkRead, onDismiss }: {
  alert: any;
  onMarkRead: (id: number) => void;
  onDismiss: (id: number) => void;
}) {
  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
  const Icon = config.icon;
  const timeAgo = getTimeAgo(new Date(alert.createdAt));

  return (
    <div className={`group relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} p-4 transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5 ${
      !alert.isRead ? 'ring-2 ring-offset-1 ring-blue-400/30' : 'opacity-80'
    }`}>
      <WatermarkLogo />
      {/* Unread indicator */}
      {!alert.isRead && (
        <div className="absolute top-3 start-3 w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
      )}

      <div className="flex items-start gap-3">
        {/* Severity icon */}
        <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0 ${config.pulse}`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className={`text-[10px] ${config.color} border-current`}>
              {config.label}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {ALERT_TYPE_LABELS[alert.alertType] || alert.alertType}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          </div>

          <h3 className="font-bold text-sm text-foreground mb-1">
            {alert.siteName || alert.domain}
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {alert.message}
          </p>

          {/* Status change visual */}
          {alert.alertType === 'status_change' && alert.previousStatus && alert.newStatus && (
            <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-background/50">
              <Badge variant="outline" className="text-[10px]">
                {STATUS_LABELS[alert.previousStatus] || alert.previousStatus}
              </Badge>
              <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
              <Badge variant="outline" className="text-[10px] font-bold">
                {STATUS_LABELS[alert.newStatus] || alert.newStatus}
              </Badge>
            </div>
          )}

          {/* Score change visual */}
          {alert.alertType === 'score_change' && alert.previousScore != null && alert.newScore != null && (
            <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-background/50">
              <span className="text-xs text-muted-foreground">الدرجة:</span>
              <span className="text-sm font-bold">{toAr(alert.previousScore)}</span>
              {alert.newScore > alert.previousScore ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-bold ${alert.newScore > alert.previousScore ? 'text-emerald-600' : 'text-red-600'}`}>
                {toAr(alert.newScore)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!alert.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(alert.id)}
              className="h-7 w-7 p-0"
              title="تعليم كمقروء"
            >
              <Check className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(alert.id)}
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
            title="تجاهل"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${toAr(diffMins)} دقيقة`;
  if (diffHours < 24) return `منذ ${toAr(diffHours)} ساعة`;
  if (diffDays < 7) return `منذ ${toAr(diffDays)} يوم`;
  return date.toLocaleDateString('ar-SA-u-nu-latn');
}

export default function VisualAlerts() {
  const { playClick, playHover } = useSoundEffects();
  const [filter, setFilter] = useState<string>('all');
  const utils = trpc.useUtils();

  const { data: alerts, isLoading, refetch } = trpc.visualAlerts.getAlerts.useQuery({ limit: 100 });
  const { data: stats } = trpc.visualAlerts.getStats.useQuery();

  const markReadMutation = trpc.visualAlerts.markRead.useMutation({
    onSuccess: () => {
      utils.visualAlerts.getAlerts.invalidate();
      utils.visualAlerts.getStats.invalidate();
      utils.visualAlerts.getUnreadCount.invalidate();
    },
  });

  const markAllReadMutation = trpc.visualAlerts.markAllRead.useMutation({
    onSuccess: () => {
      toast.success('تم تعليم جميع التنبيهات كمقروءة');
      utils.visualAlerts.getAlerts.invalidate();
      utils.visualAlerts.getStats.invalidate();
      utils.visualAlerts.getUnreadCount.invalidate();
    },
  });

  const dismissMutation = trpc.visualAlerts.dismiss.useMutation({
    onSuccess: () => {
      utils.visualAlerts.getAlerts.invalidate();
      utils.visualAlerts.getStats.invalidate();
    },
  });

  const filteredAlerts = alerts?.filter((a: any) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !a.isRead;
    return a.severity === filter;
  }) || [];

  const filterButtons = [
    { key: 'all', label: 'الكل', count: stats?.total || 0 },
    { key: 'unread', label: 'غير مقروءة', count: stats?.unread || 0 },
    { key: 'critical', label: 'حرجة', count: stats?.critical || 0, color: 'text-red-600' },
    { key: 'warning', label: 'تحذيرية', count: stats?.warning || 0, color: 'text-amber-600' },
    { key: 'info', label: 'معلوماتية', count: stats?.info || 0, color: 'text-blue-600' },
    { key: 'success', label: 'نجاح', count: stats?.success || 0, color: 'text-emerald-600' },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <Skeleton className="h-12 w-64" />
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9 w-20 rounded-lg" />)}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg relative">
              <Bell className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
              {(stats?.unread || 0) > 0 && (
                <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {toAr(stats?.unread || 0)}
                </div>
              )}
            </div>
            التنبيهات الذكية
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            إشعارات فورية عند تغير حالة امتثال أي موقع
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
            تحديث
          </Button>
          {(stats?.unread || 0) > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              className="gap-2"
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
              تعليم الكل كمقروء
            </Button>
          )}
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {[
          { label: 'إجمالي التنبيهات', value: stats?.total || 0, icon: Bell, gradient: 'from-blue-500 to-indigo-500' },
          { label: 'غير مقروءة', value: stats?.unread || 0, icon: Eye, gradient: 'from-[oklch(0.48_0.14_290)] to-primary' },
          { label: 'حرجة', value: stats?.critical || 0, icon: AlertTriangle, gradient: 'from-red-500 to-rose-500' },
          { label: 'نجاح', value: stats?.success || 0, icon: CheckCircle2, gradient: 'from-emerald-500 to-blue-800' },
        ].map((stat, i) => (
          <Card key={i} className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-sm`}>
                  <stat.icon className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
                </div>
                <div>
                  <div className="text-2xl font-black text-foreground">{toAr(stat.value)}</div>
                  <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filterButtons.map(btn => (
          <button
            key={btn.key}
            onClick={() => setFilter(btn.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === btn.key
                ? 'bg-foreground text-background shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <span className={btn.color || ''}>{btn.label}</span>
            <Badge variant="outline" className="text-[10px] h-5 px-1.5">
              {toAr(btn.count)}
            </Badge>
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground mb-1">لا توجد تنبيهات</h3>
            <p className="text-sm text-muted-foreground/70">
              {filter === 'all' ? 'لم يتم تسجيل أي تنبيهات بعد' : 'لا توجد تنبيهات مطابقة للفلتر المحدد'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert: any) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkRead={(id) => markReadMutation.mutate({ alertId: id })}
              onDismiss={(id) => dismissMutation.mutate({ alertId: id })}
            />
          ))
        )}
      </div>
    </div>
  );
}
