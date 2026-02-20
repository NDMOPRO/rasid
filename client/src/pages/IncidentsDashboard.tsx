import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { AlertTriangle, Clock, CheckCircle, ShieldAlert, Database, TrendingUp } from "lucide-react";

export default function IncidentsDashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.incidents.stats.useQuery();

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6">
        <h1 className="text-2xl font-bold">لوحة حالات الرصد</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statusCards = [
    { label: "إجمالي الوقائع", value: stats?.total ?? 0, icon: AlertTriangle, color: "text-orange-400", bgColor: "bg-orange-400/10", filter: "" },
    { label: "قيد التحقق", value: stats?.investigating ?? 0, icon: Clock, color: "text-yellow-400", bgColor: "bg-yellow-400/10", filter: "investigating" },
    { label: "مؤكدة", value: stats?.confirmed ?? 0, icon: ShieldAlert, color: "text-red-400", bgColor: "bg-red-400/10", filter: "confirmed" },
    { label: "مغلقة", value: stats?.closed ?? 0, icon: CheckCircle, color: "text-emerald-400", bgColor: "bg-emerald-400/10", filter: "closed" },
  ];

  const impactCards = [
    { label: "محتواة", value: stats?.contained ?? 0, icon: AlertTriangle, color: "text-purple-400", bgColor: "bg-purple-400/10", param: "status=contained" },
    { label: "تم الحل", value: stats?.resolved ?? 0, icon: TrendingUp, color: "text-teal-400", bgColor: "bg-teal-400/10", param: "status=resolved" },
    { label: "تقدير السجلات", value: stats?.totalEstimatedRecords ?? 0, icon: Database, color: "text-blue-400", bgColor: "bg-blue-400/10", param: "" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap">
        <h1 className="text-2xl font-bold">لوحة حالات الرصد</h1>
        <Badge variant="outline" className="text-gold border-gold/30">وقائع تسرب البيانات الشخصية</Badge>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">حالة الوقائع</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card) => (
            <div
              key={card.label}
              className="stat-card gold-edge"
              onClick={() => setLocation(`/app/incidents/list${card.filter ? `?status=${card.filter}` : ""}`)}
            >
              <div className="flex items-center justify-between flex-wrap mb-3">
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

      <section>
        <h2 className="text-lg font-semibold mb-4">مستوى الأثر</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {impactCards.map((card) => (
            <div
              key={card.label}
              className="stat-card gold-edge"
              onClick={() => setLocation(`/app/incidents/list?${card.param}`)}
            >
              <div className="flex items-center justify-between flex-wrap mb-3">
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
