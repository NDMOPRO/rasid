import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Database,
  Eye,
  ClipboardList,
} from "lucide-react";

export default function Overview() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.overview.stats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">الرئيسية</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const siteCards = [
    {
      label: "إجمالي المواقع",
      value: stats?.sites?.total ?? 0,
      icon: Database,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      onClick: () => setLocation("/app/privacy/sites"),
    },
    {
      label: "ممتثل",
      value: stats?.sites?.compliant ?? 0,
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      onClick: () => setLocation("/app/privacy/sites?status=compliant"),
    },
    {
      label: "غير ممتثل",
      value: stats?.sites?.nonCompliant ?? 0,
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      onClick: () => setLocation("/app/privacy/sites?status=non_compliant"),
    },
    {
      label: "بدون سياسة",
      value: stats?.sites?.noPolicy ?? 0,
      icon: Eye,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      onClick: () => setLocation("/app/privacy/sites?noPolicy=true"),
    },
  ];

  const incidentCards = [
    {
      label: "إجمالي الوقائع",
      value: stats?.incidents?.total ?? 0,
      icon: AlertTriangle,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
      onClick: () => setLocation("/app/incidents/list"),
    },
    {
      label: "قيد التحقق",
      value: stats?.incidents?.investigating ?? 0,
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      onClick: () => setLocation("/app/incidents/list?status=investigating"),
    },
    {
      label: "مؤكدة",
      value: stats?.incidents?.confirmed ?? 0,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      onClick: () => setLocation("/app/incidents/list?status=confirmed"),
    },
    {
      label: "مغلقة",
      value: stats?.incidents?.closed ?? 0,
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      onClick: () => setLocation("/app/incidents/list?status=closed"),
    },
  ];

  const followupCards = [
    {
      label: "المتابعات المفتوحة",
      value: stats?.followups?.open ?? 0,
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      onClick: () => setLocation("/app/followups?status=open"),
    },
    {
      label: "قيد التنفيذ",
      value: stats?.followups?.inProgress ?? 0,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      onClick: () => setLocation("/app/followups?status=in_progress"),
    },
    {
      label: "بانتظار الاعتماد",
      value: stats?.followups?.pendingApproval ?? 0,
      icon: Shield,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      onClick: () => setLocation("/app/followups?status=pending_approval"),
    },
    {
      label: "مكتملة",
      value: stats?.followups?.completed ?? 0,
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      onClick: () => setLocation("/app/followups?status=completed"),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الرئيسية</h1>
        <Badge variant="outline" className="text-gold border-gold/30">
          لوحة المؤشرات الرئيسية
        </Badge>
      </div>

      {/* Privacy Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-gold" />
          <h2 className="text-lg font-semibold">الخصوصية</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {siteCards.map((card) => (
            <div
              key={card.label}
              className="stat-card gold-edge"
              onClick={card.onClick}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold">{card.value.toLocaleString("ar-SA")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Incidents Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-gold" />
          <h2 className="text-lg font-semibold">وقائع تسرب البيانات الشخصية</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {incidentCards.map((card) => (
            <div
              key={card.label}
              className="stat-card gold-edge"
              onClick={card.onClick}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold">{card.value.toLocaleString("ar-SA")}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Follow-ups Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-gold" />
          <h2 className="text-lg font-semibold">المتابعات</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {followupCards.map((card) => (
            <div
              key={card.label}
              className="stat-card gold-edge"
              onClick={card.onClick}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold">{card.value.toLocaleString("ar-SA")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
