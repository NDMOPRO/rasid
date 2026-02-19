import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, FileText, DollarSign, TrendingUp, Clock, AlertTriangle, MapPin, Users, Bell, ChevronRight, CalendarClock } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  prospect: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  contract_pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  onboarding: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  setup_in_progress: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  ready_for_listing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  live: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  terminated: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const contractStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  under_review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  pending_signature: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  terminated: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  renewed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

function ExpiringContractsWidget({ t, setLocation }: { t: (key: string) => string; setLocation: (path: string) => void }) {
  const { data: expiring, isLoading } = trpc.contracts.expiring.useQuery({ daysAhead: 60 });
  const checkNotifications = trpc.contracts.checkExpiryNotifications.useMutation();

  if (isLoading || !expiring || expiring.length === 0) return null;

  const urgent = expiring.filter((c: any) => {
    if (!c.endDate) return false;
    const days = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 7;
  });
  const warning = expiring.filter((c: any) => {
    if (!c.endDate) return false;
    const days = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 7 && days <= 30;
  });
  const upcoming = expiring.filter((c: any) => {
    if (!c.endDate) return false;
    const days = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 30;
  });

  return (
    <Card className={urgent.length > 0 ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10" : "border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10"}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {urgent.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CalendarClock className="h-4 w-4 text-amber-500" />
            )}
            {urgent.length > 0 ? "Contract Expiry Alerts" : "Upcoming Contract Renewals"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => checkNotifications.mutate()}
            disabled={checkNotifications.isPending}
          >
            <Bell className="h-3.5 w-3.5 me-1" />
            {checkNotifications.isPending ? "Sending..." : "Send Alerts"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {urgent.map((c: any) => {
            const days = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-red-100/60 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/30 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" onClick={() => setLocation(`/contracts/${c.id}`)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.contractNumber}</p>
                    <p className="text-xs text-muted-foreground">{c.ownerNameEn || c.ownerNameAr || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 text-xs">
                    {days}d left
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                </div>
              </div>
            );
          })}
          {warning.map((c: any) => {
            const days = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-100/40 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-900/20 transition-colors" onClick={() => setLocation(`/contracts/${c.id}`)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.contractNumber}</p>
                    <p className="text-xs text-muted-foreground">{c.ownerNameEn || c.ownerNameAr || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 text-xs">
                    {days}d left
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                </div>
              </div>
            );
          })}
          {upcoming.map((c: any) => {
            const days = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-blue-50/40 dark:bg-blue-900/10 border border-blue-200/40 dark:border-blue-800/20 cursor-pointer hover:bg-blue-50/60 dark:hover:bg-blue-900/20 transition-colors" onClick={() => setLocation(`/contracts/${c.id}`)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <CalendarClock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.contractNumber}</p>
                    <p className="text-xs text-muted-foreground">{c.ownerNameEn || c.ownerNameAr || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 text-xs">
                    {days}d left
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { t } = useI18n();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = parseFloat(stats?.financialSummary?.totalRevenue || "0");
  const totalExpenses = parseFloat(stats?.financialSummary?.totalExpenses || "0");
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("dashboard.subtitle")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/properties")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("dashboard.totalProperties")}</p>
                <p className="text-3xl font-bold mt-1">{stats?.propertyStats?.total ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/contracts")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("dashboard.activeContracts")}</p>
                <p className="text-3xl font-bold mt-1">{stats?.contractStats?.total ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation("/financials")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("dashboard.netIncome")}</p>
                <p className="text-3xl font-bold mt-1">
                  {netIncome.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ms-1">SAR</span>
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t("dashboard.expiringSoon")}</p>
                <p className="text-3xl font-bold mt-1">{stats?.contractStats?.expiringSoon ?? 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties by City */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {t("dashboard.propertiesByCity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.propertyStats?.byCity && stats.propertyStats.byCity.length > 0 ? (
              <div className="space-y-3">
                {stats.propertyStats.byCity.map((item: any) => {
                  const total = stats.propertyStats.total || 1;
                  const pct = Math.round((item.count / total) * 100);
                  return (
                    <div key={item.city} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{t(`city.${item.city}`)}</span>
                        <span className="text-muted-foreground">{item.count} {t("dashboard.units")} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Building2 className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">{t("dashboard.noProperties")}</p>
                <p className="text-xs">{t("dashboard.addFirstProperty")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Properties by Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t("dashboard.propertyStatus")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.propertyStats?.byStatus && stats.propertyStats.byStatus.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.propertyStats.byStatus.map((item: any) => (
                  <div key={item.status} className={`px-3 py-2 rounded-lg text-sm font-medium ${statusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
                    {t(`status.${item.status}`)}: {item.count}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">{t("dashboard.noStatusData")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract Status + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              {t("dashboard.contractStatus")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.contractStats?.byStatus && stats.contractStats.byStatus.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.contractStats.byStatus.map((item: any) => (
                  <div key={item.status} className={`px-3 py-2 rounded-lg text-sm font-medium ${contractStatusColors[item.status] || "bg-gray-100 text-gray-700"}`}>
                    {t(`contractStatus.${item.status}`)}: {item.count}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">{t("dashboard.noContracts")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {t("dashboard.recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stats.recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{activity.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{activity.entityType}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">{t("dashboard.noActivity")}</p>
                <p className="text-xs">{t("dashboard.activityHint")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expiring Contracts Alert */}
      <ExpiringContractsWidget t={t} setLocation={setLocation} />

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">{t("dashboard.quickActions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => setLocation("/properties")} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-accent hover:border-primary/20 transition-all group">
              <Building2 className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium">{t("dashboard.addProperty")}</span>
            </button>
            <button onClick={() => setLocation("/contracts")} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-accent hover:border-primary/20 transition-all group">
              <FileText className="h-6 w-6 text-muted-foreground group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-medium">{t("dashboard.newContract")}</span>
            </button>
            <button onClick={() => setLocation("/financials")} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-accent hover:border-primary/20 transition-all group">
              <DollarSign className="h-6 w-6 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
              <span className="text-sm font-medium">{t("dashboard.recordPayment")}</span>
            </button>
            <button onClick={() => setLocation("/ai")} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-accent hover:border-primary/20 transition-all group">
              <Users className="h-6 w-6 text-muted-foreground group-hover:text-purple-500 transition-colors" />
              <span className="text-sm font-medium">{t("dashboard.askMensun")}</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
