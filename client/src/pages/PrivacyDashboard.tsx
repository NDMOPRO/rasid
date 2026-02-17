import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Shield, CheckCircle, XCircle, AlertCircle, WifiOff, Eye, Phone } from "lucide-react";

export default function PrivacyDashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.privacy.stats.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">لوحة الخصوصية</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statusCards = [
    { label: "ممتثل", value: stats?.compliant ?? 0, icon: CheckCircle, color: "text-emerald-400", bgColor: "bg-emerald-400/10", filter: "compliant" },
    { label: "ممتثل جزئياً", value: stats?.partial ?? 0, icon: AlertCircle, color: "text-amber-400", bgColor: "bg-amber-400/10", filter: "partial" },
    { label: "غير ممتثل", value: stats?.nonCompliant ?? 0, icon: XCircle, color: "text-red-400", bgColor: "bg-red-400/10", filter: "non_compliant" },
    { label: "لا يعمل", value: stats?.notWorking ?? 0, icon: WifiOff, color: "text-gray-400", bgColor: "bg-gray-400/10", filter: "not_working" },
  ];

  const qualityCards = [
    { label: "بدون سياسة خصوصية", value: stats?.noPolicy ?? 0, icon: Eye, color: "text-orange-400", bgColor: "bg-orange-400/10", param: "noPolicy=true" },
    { label: "بدون معلومات تواصل", value: stats?.noContact ?? 0, icon: Phone, color: "text-purple-400", bgColor: "bg-purple-400/10", param: "noContact=true" },
    { label: "إجمالي المواقع", value: stats?.total ?? 0, icon: Shield, color: "text-gold", bgColor: "bg-gold/10", param: "" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة الخصوصية</h1>
        <Badge variant="outline" className="text-gold border-gold/30">امتثال المواقع</Badge>
      </div>

      {/* Status Cards */}
      <section>
        <h2 className="text-lg font-semibold mb-4">حالة المواقع</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card) => (
            <div
              key={card.label}
              className="stat-card gold-edge"
              onClick={() => setLocation(`/app/privacy/sites?status=${card.filter}`)}
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

      {/* Quality Cards */}
      <section>
        <h2 className="text-lg font-semibold mb-4">جودة سياسة الخصوصية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {qualityCards.map((card) => (
            <div
              key={card.label}
              className="stat-card gold-edge"
              onClick={() => setLocation(`/app/privacy/sites?${card.param}`)}
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
