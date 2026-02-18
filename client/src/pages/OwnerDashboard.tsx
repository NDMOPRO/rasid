import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2, FileText, DollarSign, TrendingUp, TrendingDown,
  CalendarClock, AlertTriangle, ChevronRight, MapPin, Clock,
  Home as HomeIcon, Eye
} from "lucide-react";
import { useLocation } from "wouter";

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

const cityGradients: Record<string, string> = {
  riyadh: "from-amber-500 to-orange-600",
  jeddah: "from-cyan-500 to-blue-600",
  madinah: "from-emerald-500 to-teal-600",
};

export default function OwnerDashboard() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = trpc.ownerDashboard.stats.useQuery();
  const { data: properties, isLoading: propsLoading } = trpc.ownerDashboard.properties.useQuery();
  const { data: contracts, isLoading: contractsLoading } = trpc.ownerDashboard.contracts.useQuery();
  const { data: expiringContracts } = trpc.ownerDashboard.expiringContracts.useQuery();
  const { data: transactions } = trpc.ownerDashboard.transactions.useQuery({ limit: 10 });

  const isLoading = statsLoading || propsLoading || contractsLoading;

  const totalRevenue = parseFloat(stats?.totalRevenue || "0");
  const totalExpenses = parseFloat(stats?.totalExpenses || "0");
  const netIncome = totalRevenue - totalExpenses;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const hasData = (properties?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {lang === "ar" ? `مرحباً ${user?.name || ""}` : `Welcome, ${user?.name || "Owner"}`}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {lang === "ar" ? "نظرة عامة على عقاراتك وعقودك" : "Overview of your properties and contracts"}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboard.totalProperties")}</p>
                <p className="text-2xl font-bold">{stats?.totalProperties ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("dashboard.activeContracts")}</p>
                <p className="text-2xl font-bold">{stats?.activeContracts ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("financials.totalRevenue")}</p>
                <p className="text-xl font-bold">{totalRevenue.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">SAR</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-500/5 to-violet-500/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("financials.netIncome")}</p>
                <p className={`text-xl font-bold ${netIncome >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {netIncome.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">SAR</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {lang === "ar" ? "لا توجد عقارات مرتبطة بحسابك" : "No properties linked to your account"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {lang === "ar"
                ? "تأكد من أن بريدك الإلكتروني مسجل كمالك في العقارات لعرض البيانات هنا"
                : "Make sure your email is registered as the owner in properties to see data here"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Properties Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Properties */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    {lang === "ar" ? "عقاراتي" : "My Properties"}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {properties?.length ?? 0} {lang === "ar" ? "وحدة" : "units"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {properties?.map((property: any) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => setLocation(`/properties/${property.id}`)}
                  >
                    {/* City gradient bar */}
                    <div className={`w-1.5 h-14 rounded-full bg-gradient-to-b ${cityGradients[property.city] || "from-gray-400 to-gray-500"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{property.unitId}</span>
                        <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[property.unitStatus] || ""}`}>
                          {t(`status.${property.unitStatus}`)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {t(`city.${property.city}`)}
                        </span>
                        {property.neighborhood && (
                          <span>{lang === "ar" ? property.neighborhoodAr || property.neighborhood : property.neighborhood}</span>
                        )}
                        {property.buildingName && <span>{property.buildingName}</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* My Contracts */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    {lang === "ar" ? "عقودي" : "My Contracts"}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {contracts?.length ?? 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {contracts && contracts.length > 0 ? (
                  <div className="space-y-3">
                    {contracts.map((contract: any) => {
                      const daysLeft = contract.endDate
                        ? Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null;
                      return (
                        <div
                          key={contract.id}
                          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer group"
                          onClick={() => setLocation(`/contracts/${contract.id}`)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{contract.contractNumber}</span>
                              <Badge className={`text-[10px] px-1.5 py-0 ${contractStatusColors[contract.contractStatus] || ""}`}>
                                {t(`contractStatus.${contract.contractStatus}`)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {contract.contractType && (
                                <span>{t(`contractType.${contract.contractType}`)}</span>
                              )}
                              {contract.monthlyRent && (
                                <span className="font-medium">{parseFloat(contract.monthlyRent).toLocaleString()} SAR/{lang === "ar" ? "شهر" : "mo"}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {contract.endDate && (
                              <div className="text-xs">
                                <span className="text-muted-foreground">
                                  {new Date(contract.endDate).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-SA")}
                                </span>
                                {daysLeft !== null && daysLeft > 0 && daysLeft <= 60 && (
                                  <div className={`text-[10px] font-medium mt-0.5 ${daysLeft <= 7 ? "text-red-600" : daysLeft <= 30 ? "text-amber-600" : "text-blue-600"}`}>
                                    {daysLeft} {lang === "ar" ? "يوم" : "days"}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {lang === "ar" ? "لا توجد عقود" : "No contracts found"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Expiring Contracts Alert */}
            {expiringContracts && expiringContracts.length > 0 && (
              <Card className="border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    {lang === "ar" ? "عقود قريبة الانتهاء" : "Expiring Soon"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {expiringContracts.map((c: any) => {
                    const daysLeft = c.endDate
                      ? Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : 0;
                    return (
                      <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-amber-200/50 dark:border-amber-800/30 last:border-0">
                        <div>
                          <p className="text-xs font-medium">{c.contractNumber}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(c.endDate).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-SA")}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${daysLeft <= 7 ? "border-red-300 text-red-600" : "border-amber-300 text-amber-600"}`}>
                          {daysLeft} {lang === "ar" ? "يوم" : "d"}
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Financial Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  {lang === "ar" ? "الملخص المالي" : "Financial Summary"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">{t("financials.totalRevenue")}</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{totalRevenue.toLocaleString()} SAR</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-sm text-muted-foreground">{t("financials.totalExpenses")}</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{totalExpenses.toLocaleString()} SAR</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium">{t("financials.netIncome")}</span>
                  </div>
                  <span className={`text-sm font-bold ${netIncome >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {netIncome.toLocaleString()} SAR
                  </span>
                </div>
                {(stats?.pendingPayments ?? 0) > 0 && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {stats?.pendingPayments} {lang === "ar" ? "مدفوعات معلقة" : "pending payments"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  {lang === "ar" ? "آخر المعاملات" : "Recent Transactions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((txn: any) => (
                      <div key={txn.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                        <div>
                          <p className="text-xs font-medium">{txn.category}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(txn.transactionDate).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-SA")}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold ${txn.transactionType === "revenue" ? "text-emerald-600" : "text-red-600"}`}>
                          {txn.transactionType === "revenue" ? "+" : "-"}{parseFloat(txn.amount).toLocaleString()} SAR
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {lang === "ar" ? "لا توجد معاملات" : "No transactions yet"}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
