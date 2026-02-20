import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX, Globe, ScanSearch,
  BarChart3, Users, Clock, Bell, FileText, FolderKanban,
  TrendingUp, AlertTriangle, CheckCircle2, XCircle, Loader2,
  ArrowLeft, Gauge, Activity, CalendarClock, Briefcase,
  Crown, UserCog, Eye, Zap, Target, ClipboardCheck,
} from "lucide-react";
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const ROLE_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  permissions: string[];
  quickActions: Array<{ label: string; path: string; icon: React.ReactNode }>;
}> = {
  root: {
    title: "مسؤول النظام الرئيسي",
    subtitle: "صلاحيات كاملة على جميع أقسام النظام",
    icon: <Crown className="h-6 w-6" />,
    color: "text-amber-500",
    bgGradient: "from-amber-500/10 to-amber-600/5",
    permissions: [
      "إدارة جميع المستخدمين والأدوار",
      "الوصول الكامل لجميع البيانات",
      "إدارة إعدادات النظام",
      "تشغيل وإيقاف محرك الجدولة",
      "إدارة الجدولات والفحوصات",
      "تصدير جميع التقارير",
      "إدارة القوالب والخطابات",
    ],
    quickActions: [
      { label: "إدارة المستخدمين", path: "/members", icon: <Users className="h-4 w-4" /> },
      { label: "محرك الجدولة", path: "/scan-schedules", icon: <CalendarClock className="h-4 w-4" /> },
      { label: "التقارير", path: "/reports", icon: <BarChart3 className="h-4 w-4" /> },
      { label: "سجل النشاطات", path: "/activity-logs", icon: <Activity className="h-4 w-4" /> },
    ],
  },
  admin: {
    title: "مدير النظام",
    subtitle: "إدارة شاملة للنظام والمستخدمين",
    icon: <UserCog className="h-6 w-6" />,
    color: "text-blue-500",
    bgGradient: "from-blue-500/10 to-blue-600/5",
    permissions: [
      "إدارة المستخدمين والصلاحيات",
      "إنشاء وتعديل الجدولات",
      "تشغيل الفحوصات الدورية",
      "إدارة المواقع والتطبيقات",
      "تصدير التقارير",
      "إدارة القوالب والخطابات",
    ],
    quickActions: [
      { label: "إدارة المستخدمين", path: "/members", icon: <Users className="h-4 w-4" /> },
      { label: "الجدولة", path: "/scan-schedules", icon: <CalendarClock className="h-4 w-4" /> },
      { label: "فحص جديد", path: "/scan", icon: <ScanSearch className="h-4 w-4" /> },
      { label: "التقارير", path: "/reports", icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  smart_monitor_manager: {
    title: "مدير منصة راصد الذكي",
    subtitle: "إدارة عمليات الرصد الذكي والتحليلات",
    icon: <Zap className="h-6 w-6" />,
    color: "text-primary",
    bgGradient: "from-primary/10 to-primary/5",
    permissions: [
      "إدارة الفحوصات التلقائية",
      "مراجعة نتائج الذكاء الاصطناعي",
      "إدارة الجدولات",
      "تصدير التقارير التحليلية",
      "مراقبة أداء المنصة",
    ],
    quickActions: [
      { label: "الجدولة التلقائية", path: "/scan-schedules", icon: <CalendarClock className="h-4 w-4" /> },
      { label: "المؤشرات القيادية", path: "/leadership", icon: <Gauge className="h-4 w-4" /> },
      { label: "فحص دفعي", path: "/batch-scan", icon: <ScanSearch className="h-4 w-4" /> },
      { label: "التقارير", path: "/reports", icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  monitoring_director: {
    title: "مدير الرصد",
    subtitle: "الإشراف على عمليات الرصد وتوزيع المهام",
    icon: <Target className="h-6 w-6" />,
    color: "text-emerald-500",
    bgGradient: "from-emerald-500/10 to-emerald-600/5",
    permissions: [
      "الإشراف على فريق الرصد",
      "توزيع المهام والحالات",
      "مراجعة نتائج الفحوصات",
      "إعداد التقارير الإشرافية",
      "إدارة الخطابات الرسمية",
    ],
    quickActions: [
      { label: "إدارة الحالات", path: "/cases", icon: <FolderKanban className="h-4 w-4" /> },
      { label: "المواقع", path: "/sites", icon: <Globe className="h-4 w-4" /> },
      { label: "الخطابات", path: "/letters", icon: <FileText className="h-4 w-4" /> },
      { label: "التقارير", path: "/reports", icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  monitoring_specialist: {
    title: "أخصائي رصد",
    subtitle: "تنفيذ عمليات الفحص والتحليل المتقدم",
    icon: <Eye className="h-6 w-6" />,
    color: "text-cyan-500",
    bgGradient: "from-cyan-500/10 to-cyan-600/5",
    permissions: [
      "تنفيذ فحوصات المواقع",
      "تحليل نتائج الامتثال",
      "إعداد تقارير الفحص",
      "إدارة الحالات المسندة",
      "التواصل مع الجهات",
    ],
    quickActions: [
      { label: "فحص جديد", path: "/scan", icon: <ScanSearch className="h-4 w-4" /> },
      { label: "حالاتي", path: "/cases", icon: <FolderKanban className="h-4 w-4" /> },
      { label: "المواقع", path: "/sites", icon: <Globe className="h-4 w-4" /> },
      { label: "مكتبة الفحوصات", path: "/scan-library", icon: <ClipboardCheck className="h-4 w-4" /> },
    ],
  },
  monitoring_officer: {
    title: "مسؤول رصد",
    subtitle: "تنفيذ مهام الرصد الأساسية والمتابعة",
    icon: <Shield className="h-6 w-6" />,
    color: "text-orange-500",
    bgGradient: "from-orange-500/10 to-orange-600/5",
    permissions: [
      "تنفيذ الفحوصات الأساسية",
      "متابعة الحالات المسندة",
      "رفع التقارير للمشرف",
      "عرض نتائج الامتثال",
    ],
    quickActions: [
      { label: "فحص جديد", path: "/scan", icon: <ScanSearch className="h-4 w-4" /> },
      { label: "حالاتي", path: "/cases", icon: <FolderKanban className="h-4 w-4" /> },
      { label: "المواقع", path: "/sites", icon: <Globe className="h-4 w-4" /> },
      { label: "التنبيهات", path: "/notifications", icon: <Bell className="h-4 w-4" /> },
    ],
  },
  viewer: {
    title: "مستعرض",
    subtitle: "عرض البيانات والتقارير فقط",
    icon: <Briefcase className="h-6 w-6" />,
    color: "text-slate-500",
    bgGradient: "from-slate-500/10 to-slate-600/5",
    permissions: [
      "عرض لوحة التحكم",
      "عرض نتائج الفحوصات",
      "عرض التقارير",
      "عرض المواقع والتطبيقات",
    ],
    quickActions: [
      { label: "لوحة التحكم", path: "/", icon: <BarChart3 className="h-4 w-4" /> },
      { label: "المواقع", path: "/sites", icon: <Globe className="h-4 w-4" /> },
      { label: "التقارير", path: "/reports", icon: <BarChart3 className="h-4 w-4" /> },
      { label: "المؤشرات", path: "/leadership", icon: <Gauge className="h-4 w-4" /> },
    ],
  },
};

const statusLabels: Record<string, string> = {
  compliant: "ممتثلة",
  partially_compliant: "ممتثلة جزئياً",
  non_compliant: "غير ممتثلة",
  no_policy: "لا توجد سياسة",
};

export default function RoleDashboard() {
  const { playClick, playHover } = useSoundEffects();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data, isLoading } = trpc.roleDashboard.getData.useQuery();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();

  // Get built-in session
  let builtInUser: any = null;
  const builtInSession = localStorage.getItem("rasid_session");
  if (builtInSession) {
    try { builtInUser = JSON.parse(builtInSession); } catch {}
  }

  const rasidRole = builtInUser?.rasidRole || (user as any)?.rasidRole || data?.role || "monitoring_officer";
  const roleConfig = ROLE_CONFIG[rasidRole] || ROLE_CONFIG.viewer;

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6">
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Role Header */}
      <div>
        <Card className={`glass-card gold-sweep overflow-hidden bg-gradient-to-l ${roleConfig.bgGradient} border-2 border-primary/10`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-background/80 backdrop-blur flex items-center justify-center shadow-lg ${roleConfig.color}`}>
                  {roleConfig.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">{roleConfig.title}</h1>
                  <p className="text-muted-foreground text-sm mt-1">{roleConfig.subtitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                      onClick={() => openDrillDown({ title: "دور المستخدم", subtitle: roleConfig.title, icon: <UserCog /> })}>
                      {rasidRole}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {builtInUser?.name || user?.name || "مستخدم"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {roleConfig.quickActions.map((action, i) => (
          <div
            key={action.path}
          >
            <Card className="glass-card gold-sweep cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group border-primary/10 hover:border-primary/30 elev-2"
              onClick={() => setLocation(action.path)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 btn-glow">
                  {action.icon}
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <div>
          <Card
            className="glass-card gold-sweep cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
            onClick={() => openDrillDown({ title: "المواقع النشطة", icon: <Globe /> })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">إجمالي المواقع</p>
                  <p className="text-2xl font-bold mt-1">{stats?.totalSites || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stats?.activeSites || 0} نشط</p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/10"><Globe className="h-5 w-5 text-blue-500" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card
            className="glass-card gold-sweep cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
            onClick={() => openDrillDown({ title: "الفحوصات المكتملة", icon: <ScanSearch /> })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">الفحوصات</p>
                  <p className="text-2xl font-bold mt-1">{stats?.totalScans || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">فحص مكتمل</p>
                </div>
                <div className="p-2.5 rounded-xl bg-primary/10 btn-glow"><ScanSearch className="h-5 w-5 text-primary" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card
            className="glass-card gold-sweep cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
            onClick={() => openDrillDown({ title: "المواقع الممتثلة", icon: <ShieldCheck />, complianceStatus: "compliant" })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">ممتثلة</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-500">{stats?.compliant || 0}</p>
                  <p
                    className="text-xs text-muted-foreground mt-1 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); openDrillDown({ title: "المواقع الممتثلة جزئياً", icon: <ShieldAlert />, complianceStatus: "partially_compliant" }); }}
                  >
                    {stats?.partiallyCompliant || 0} جزئياً
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10"><ShieldCheck className="h-5 w-5 text-emerald-500" /></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card
            className="glass-card gold-sweep cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
            onClick={() => openDrillDown({ title: "المواقع غير الممتثلة", icon: <ShieldX />, complianceStatus: "non_compliant" })}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">غير ممتثلة</p>
                  <p className="text-2xl font-bold mt-1 text-red-500">{(stats?.nonCompliant || 0) + (stats?.noPolicy || 0)}</p>
                  <p
                    className="text-xs text-muted-foreground mt-1 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); openDrillDown({ title: "مواقع بدون سياسة", icon: <ShieldX />, complianceStatus: "no_policy" }); }}
                  >
                    {stats?.noPolicy || 0} بدون سياسة
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-red-500/10"><ShieldX className="h-5 w-5 text-red-500" /></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
        {/* My Cases */}
        {(rasidRole !== 'viewer') && (
          <div>
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-primary" />
                  حالاتي المسندة
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.myCases && data.myCases.length > 0 ? (
                  <div className="space-y-2">
                    {(data.myCases as any[]).map((c: any) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-accent/30 hover:bg-accent/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                        onClick={() => openDrillDown({ title: "تفاصيل الحالة", subtitle: c.title, icon: <FolderKanban /> })}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-2 h-2 rounded-full ${c.priority === 'critical' ? 'bg-red-500' : c.priority === 'high' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{c.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.domain || '-'}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {c.stage === 'new' ? 'جديدة' : c.stage === 'in_progress' ? 'قيد المعالجة' : c.stage}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا توجد حالات مسندة إليك</p>
                  </div>
                )}
                <Button variant="ghost" className="w-full mt-3 text-xs" onClick={() => setLocation("/cases")}>
                  عرض جميع الحالات
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Alerts */}
        <div>
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                أحدث التنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.alerts && data.alerts.length > 0 ? (
                <div className="space-y-2">
                  {(data.alerts as any[]).map((alert: any) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-accent/30 hover:bg-accent/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                      onClick={() => openDrillDown({ title: "تفاصيل التنبيه", subtitle: alert.domain, icon: <Bell />, complianceStatus: alert.new_status })}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {alert.new_status === 'non_compliant' || alert.new_status === 'no_policy' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                        ) : alert.new_status === 'compliant' ? (
                          <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{alert.domain}</p>
                          <p className="text-xs text-muted-foreground">
                            {statusLabels[alert.previous_status] || '-'} → {statusLabels[alert.new_status] || '-'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {alert.created_at ? new Date(alert.created_at).toLocaleDateString("ar-SA-u-nu-latn") : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد تنبيهات حديثة</p>
                </div>
              )}
              <Button variant="ghost" className="w-full mt-3 text-xs" onClick={() => setLocation("/notifications")}>
                عرض جميع التنبيهات
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scans */}
        <div>
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ScanSearch className="h-4 w-4 text-primary" />
                آخر الفحوصات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.recentScans && data.recentScans.length > 0 ? (
                <div className="space-y-2">
                  {(data.recentScans as any[]).map((scan: any) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-accent/30 hover:bg-accent/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                      onClick={() => openDrillDown({ title: "تفاصيل الفحص", subtitle: scan.domain, icon: <ScanSearch /> })}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{scan.domain}</p>
                          <p className="text-xs text-muted-foreground">
                            {scan.scan_date ? new Date(scan.scan_date).toLocaleDateString("ar-SA-u-nu-latn") : scan.scanDate ? new Date(scan.scanDate).toLocaleDateString("ar-SA-u-nu-latn") : '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-sm font-bold ${getScoreColor(Number(scan.overall_score || scan.overallScore || 0))}`}>
                          {Math.round(Number(scan.overall_score || scan.overallScore || 0))}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ScanSearch className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد فحوصات حديثة</p>
                </div>
              )}
              <Button variant="ghost" className="w-full mt-3 text-xs" onClick={() => setLocation("/scan-library")}>
                عرض مكتبة الفحوصات
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Card */}
        <div>
          <Card className="glass-card-scan">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                صلاحياتك
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roleConfig.permissions.map((perm, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm">{perm}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedules (for admin roles) */}
      {(rasidRole === 'root' || rasidRole === 'admin' || rasidRole === 'smart_monitor_manager') && data?.schedules && (
        <div>
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                الجدولات القادمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.schedules.length > 0 ? (
                <div className="space-y-2">
                  {(data.schedules as any[]).map((s: any) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-accent/30 hover:bg-accent/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                      onClick={() => openDrillDown({ title: "تفاصيل الجدولة", subtitle: s.name, icon: <CalendarClock /> })}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">التكرار: {s.cron.split(' ').slice(0, 2).join(' ')} * * *</p>
                        </div>
                      </div>
                      <Badge variant={s.is_active ? "default" : "outline"} className="text-xs shrink-0">
                        {s.is_active ? "نشطة" : "متوقفة"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarClock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد جدولات قادمة</p>
                </div>
              )}
              <Button variant="ghost" className="w-full mt-3 text-xs" onClick={() => setLocation("/scan-schedules")}>
                إدارة الجدولة
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 90) return "text-emerald-500";
  if (score >= 70) return "text-amber-500";
  return "text-red-500";
}

