import { useState, useEffect, useMemo } from "react";
import DrillDownModal, { useDrillDown } from "@/components/DrillDownModal";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPercent, formatDateTime } from "@/lib/formatters";
import {
  Activity, Globe, Shield, CheckCircle2, XCircle, AlertTriangle,
  Loader2, RefreshCw, Wifi, WifiOff, Clock, ScanSearch,
  TrendingUp, TrendingDown, Minus, Bell, Zap, Server,
  BarChart3, Eye
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

function PulsingDot({ color = "#10b981" }: { color?: string }) {
  return (
    <span className="relative flex h-3 w-3">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full h-3 w-3"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.round(start + (diff * step) / steps));
      if (step >= steps) {
        clearInterval(timer);
        setDisplay(value);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{formatNumber(display)}</span>;
}

function LiveStatusIndicator({ isConnected }: { isConnected: boolean }) {
  return (
    <div
      className="flex items-center gap-2">
      <WatermarkLogo />
      {isConnected ? (
        <>
          <PulsingDot color="#10b981" />
          <span className="text-sm text-emerald-500 font-medium">متصل مباشر</span>
          <Wifi className="w-4 h-4 text-emerald-500" />
        </>
      ) : (
        <>
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-red-500 font-medium">غير متصل</span>
          <WifiOff className="w-4 h-4 text-red-500" />
        </>
      )}
    </div>
  );
}

export default function RealTimeDashboard() {
  const { playClick, playHover } = useSoundEffects();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [refreshCount, setRefreshCount] = useState(0);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.dashboard.stats.useQuery();
  
  // Fetch recent scans
  const { data: recentScans, refetch: refetchScans } = trpc.dashboard.recentScans.useQuery();
  
  // Fetch visual alerts
  const { data: visualAlerts, refetch: refetchAlerts } = trpc.visualAlerts.getAlerts.useQuery({ limit: 10 });
  
  // Fetch system health
  const { data: systemHealth, refetch: refetchHealth } = trpc.systemHealth.metrics.useQuery();
  
  // Fetch cron engine status
  const { data: cronStatus, refetch: refetchCron } = trpc.cronEngine.status.useQuery();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refetchStats();
      refetchScans();
      refetchAlerts();
      refetchHealth();
      refetchCron();
      setLastRefreshTime(new Date());
      setRefreshCount((c) => c + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const manualRefresh = () => {
    refetchStats();
    refetchScans();
    refetchAlerts();
    refetchHealth();
    refetchCron();
    setLastRefreshTime(new Date());
    setRefreshCount((c) => c + 1);
  };

  const complianceRate = stats
    ? stats.totalSites > 0
      ? Math.round((stats.compliant / stats.totalSites) * 100)
      : 0
    : 0;

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">جاري تحميل لوحة الإحصائيات المباشرة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[oklch(0.48_0.14_290)] to-primary flex items-center justify-center shadow-lg animate-pulse">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 gradient-text">
              لوحة الإحصائيات المباشرة
              <LiveStatusIndicator isConnected={autoRefresh} />
            </h1>
            <p className="text-muted-foreground">
              آخر تحديث: {formatDateTime(lastRefreshTime)} — تحديث #{refreshCount}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            {autoRefresh ? <Wifi className="w-4 h-4 transition-transform duration-300 hover:scale-110" /> : <WifiOff className="w-4 h-4 transition-transform duration-300 hover:scale-110" />}
            {autoRefresh ? "تحديث تلقائي" : "متوقف"}
          </Button>
          <Button variant="outline" size="sm" onClick={manualRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
            تحديث الآن
          </Button>
        </div>
      </div>

      {/* Live KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          {
            label: "إجمالي المواقع",
            value: stats?.totalSites || 0,
            icon: Globe,
            gradient: "from-blue-500 to-indigo-600",
            pulse: false,
          },
          {
            label: "نسبة الامتثال",
            value: complianceRate,
            suffix: "%",
            icon: Shield,
            gradient: complianceRate >= 60 ? "from-emerald-500 to-blue-900" : "from-amber-500 to-orange-600",
            pulse: true,
          },
          {
            label: "ممتثل",
            value: stats?.compliant || 0,
            icon: CheckCircle2,
            gradient: "from-green-500 to-emerald-600",
            pulse: false,
          },
          {
            label: "غير ممتثل",
            value: stats?.nonCompliant || 0,
            icon: XCircle,
            gradient: "from-red-500 to-rose-600",
            pulse: (stats?.nonCompliant || 0) > 0,
          },
        ].map((card, i) => (
          <Card
            key={card.label}
            className="overflow-hidden border-0 shadow-lg relative"
            style={{ animation: `fadeIn 0.5s ease-out ${i * 0.1}s both` }}
          >
            {card.pulse && (
              <div className="absolute top-3 start-3">
                <PulsingDot color={card.gradient.includes("emerald") ? "#10b981" : "#ef4444"} />
              </div>
            )}
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 text-end">
                  <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                  <p className="text-3xl font-bold">
                    <AnimatedCounter value={card.value} />
                    {card.suffix || ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {[
          { label: "ممتثل جزئياً", value: stats?.partiallyCompliant || 0, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "لا يعمل", value: stats?.noPolicy || 0, icon: Minus, color: "text-gray-500", bg: "bg-gray-500/10" },
          { label: "إجمالي الفحوصات", value: stats?.totalScans || 0, icon: ScanSearch, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "المواقع النشطة", value: stats?.activeSites || 0, icon: Eye, color: "text-primary", bg: "bg-primary/10" },
        ].map((item, i) => (
          <Card key={item.label} onClick={() => openDrillDown({ title: item.label, subtitle: 'بيانات المراقبة الحية' })} className="border-0 shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all" style={{ animation: `fadeIn 0.5s ease-out ${0.4 + i * 0.1}s both` }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="text-end flex-1">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold"><AnimatedCounter value={item.value} /></p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
        {/* Recent Scans Feed */}
        <Card className="border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanSearch className="w-5 h-5 text-primary" />
                آخر الفحوصات
                <PulsingDot />
              </div>
              <Badge variant="outline" className="text-xs">
                مباشر
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {recentScans && recentScans.length > 0 ? (
                recentScans.slice(0, 10).map((scan: any, i: number) => {
                  const statusColor =
                    scan.complianceStatus === "compliant" ? "text-emerald-500" :
                    scan.complianceStatus === "partially_compliant" ? "text-amber-500" :
                    scan.complianceStatus === "non_compliant" ? "text-red-500" :
                    "text-gray-500";
                  const statusLabel =
                    scan.complianceStatus === "compliant" ? "ممتثل" :
                    scan.complianceStatus === "partially_compliant" ? "ممتثل جزئياً" :
                    scan.complianceStatus === "non_compliant" ? "غير ممتثل" :
                    "لا يعمل";
                  return (
                    <div
                      key={scan.id}
                      className="flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors"
                      style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s both` }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 btn-glow">
                        <Globe className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{scan.domain || scan.url}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(scan.scanDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={`text-xs ${statusColor}`}>
                          {statusLabel}
                        </Badge>
                        {scan.overallScore != null && (
                          <span className="text-xs font-bold">{Math.round(scan.overallScore)}%</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <ScanSearch className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد فحوصات حديثة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Alerts Feed */}
        <Card className="border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                التنبيهات المباشرة
                <PulsingDot color="#f59e0b" />
              </div>
              <Badge variant="outline" className="text-xs">
                {visualAlerts?.length || 0} تنبيه
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {visualAlerts && visualAlerts.length > 0 ? (
                visualAlerts.slice(0, 10).map((alert: any, i: number) => {
                  const typeColor =
                    alert.alertType === "status_degraded" ? "text-red-500" :
                    alert.alertType === "status_improved" ? "text-emerald-500" :
                    alert.alertType === "score_dropped" ? "text-orange-500" :
                    "text-blue-500";
                  const typeLabel =
                    alert.alertType === "status_degraded" ? "تراجع" :
                    alert.alertType === "status_improved" ? "تحسن" :
                    alert.alertType === "score_dropped" ? "انخفاض" :
                    "تغيير";
                  return (
                    <div
                      key={alert.id}
                      className={`flex items-center gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${!alert.isRead ? "bg-primary/5" : ""}`}
                      style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s both` }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        alert.alertType === "status_improved" ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}>
                        {alert.alertType === "status_improved" ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {alert.siteName || `موقع #${alert.siteId}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alert.previousStatus} → {alert.newStatus}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={`text-xs ${typeColor}`}>
                          {typeLabel}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(alert.detectedAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد تنبيهات حديثة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        {/* Server Status */}
        <Card className="border-0 shadow-lg cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="w-5 h-5 text-primary" />
              حالة الخادم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">وقت التشغيل</span>
              <span className="text-sm font-medium">{systemHealth?.server?.uptimeFormatted || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الذاكرة المستخدمة</span>
              <span className="text-sm font-medium">
                {systemHealth?.server?.memoryUsed || 0} / {systemHealth?.server?.memoryTotal || 0} MB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إصدار Node.js</span>
              <span className="text-sm font-medium">{systemHealth?.server?.nodeVersion || "—"}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-blue-800 transition-all duration-1000"
                style={{
                  width: `${systemHealth?.server ? Math.round((systemHealth.server.memoryUsed / systemHealth.server.memoryTotal) * 100) : 0}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cron Engine Status */}
        <Card className="border-0 shadow-lg cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-5 h-5 text-primary" />
              محرك الجدولة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الحالة</span>
              <div className="flex items-center gap-2">
                <PulsingDot color={cronStatus?.running ? "#10b981" : "#ef4444"} />
                <span className={`text-sm font-medium ${cronStatus?.running ? "text-emerald-500" : "text-red-500"}`}>
                  {cronStatus?.running ? "يعمل" : "متوقف"}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">آخر فحص</span>
              <span className="text-sm font-medium">
                {cronStatus?.lastCheck ? formatDateTime(cronStatus.lastCheck) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الفاصل الزمني</span>
              <span className="text-sm font-medium">كل 5 دقائق</span>
            </div>
          </CardContent>
        </Card>

        {/* Database Health */}
        <Card className="border-0 shadow-lg cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-primary" />
              إحصائيات قاعدة البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إجمالي المواقع</span>
              <span className="text-sm font-bold">{formatNumber(systemHealth?.database?.totalSites || stats?.totalSites || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إجمالي الفحوصات</span>
              <span className="text-sm font-bold">{formatNumber(systemHealth?.database?.totalScans || stats?.totalScans || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إجمالي المستخدمين</span>
              <span className="text-sm font-bold">{formatNumber(systemHealth?.database?.totalUsers || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">الحالات النشطة</span>
              <span className="text-sm font-bold">{formatNumber(systemHealth?.database?.totalCases || 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Distribution Bar */}
      <Card className="border-0 shadow-lg cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            التوزيع المباشر لحالات الامتثال
            <PulsingDot />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "ممتثل", value: stats?.compliant || 0, color: "#059669", bg: "bg-emerald-500" },
              { label: "ممتثل جزئياً", value: stats?.partiallyCompliant || 0, color: "#f59e0b", bg: "bg-amber-500" },
              { label: "غير ممتثل", value: stats?.nonCompliant || 0, color: "#ef4444", bg: "bg-red-500" },
              { label: "لا يعمل", value: stats?.noPolicy || 0, color: "#6b7280", bg: "bg-gray-500" },
            ].map((item, i) => {
              const total = stats?.totalSites || 1;
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.label} style={{ animation: `fadeIn 0.5s ease-out ${i * 0.1}s both` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${item.bg}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{formatNumber(item.value)}</span>
                      <span className="text-xs text-muted-foreground">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total bar */}
          <div className="mt-6 flex rounded-full overflow-hidden h-6 shadow-inner">
            {[
              { value: stats?.compliant || 0, color: "#059669" },
              { value: stats?.partiallyCompliant || 0, color: "#f59e0b" },
              { value: stats?.nonCompliant || 0, color: "#ef4444" },
              { value: stats?.noPolicy || 0, color: "#6b7280" },
            ].map((seg, i) => {
              const total = stats?.totalSites || 1;
              const pct = (seg.value / total) * 100;
              return (
                <div
                  key={i}
                  className="h-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: seg.color,
                  }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
