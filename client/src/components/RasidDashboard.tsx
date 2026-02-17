import { memo } from "react";
import RasidChart from "./RasidChart";
import { BarChart3, AlertTriangle, Shield, TrendingUp } from "lucide-react";

interface DashboardKPIs {
  totalIncidents: number;
  totalRecords: number;
  criticalCount: number;
  highCount: number;
}

interface DashboardChart {
  type: string;
  title: string;
  data: any;
}

interface RasidDashboardProps {
  title: string;
  dashboardType: string;
  kpis: DashboardKPIs;
  charts: DashboardChart[];
  summary?: string;
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("ar-SA");
};

const KPICard = memo(function KPICard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-${color}-500/20 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-sm p-4 shadow-lg`}>
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, var(--tw-gradient-from), transparent)` }} />
      <div className="flex items-center gap-3 rtl:flex-row-reverse">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${color}-500/10`}>
          <Icon className={`h-5 w-5 text-${color}-400`} />
        </div>
        <div className="text-right flex-1">
          <p className="text-xs text-slate-400 font-[Tajawal]">{label}</p>
          <p className="text-xl font-bold text-white font-[Tajawal]">{value}</p>
        </div>
      </div>
    </div>
  );
});

const RasidDashboard = memo(function RasidDashboard({
  title,
  dashboardType,
  kpis,
  charts,
  summary,
}: RasidDashboardProps) {
  const typeLabels: Record<string, string> = {
    executive: "لوحة تنفيذية",
    sector: "لوحة قطاعية",
    threat: "لوحة التهديدات",
    compliance: "لوحة الامتثال",
    custom: "لوحة مخصصة",
  };

  return (
    <div className="my-4 rounded-2xl border border-sky-500/20 bg-slate-950/60 backdrop-blur-sm overflow-hidden shadow-xl shadow-sky-500/5">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-l from-sky-600/20 via-indigo-600/10 to-transparent px-6 py-4 border-b border-sky-500/10">
        <div className="flex items-center justify-between rtl:flex-row-reverse">
          <div className="text-right">
            <h3 className="text-lg font-bold text-white font-[Tajawal]">{title}</h3>
            <p className="text-xs text-sky-300/70 font-[Tajawal]">
              {typeLabels[dashboardType] || dashboardType} — {charts.length} مخطط
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
            <BarChart3 className="h-5 w-5 text-sky-400" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        <KPICard
          icon={BarChart3}
          label="إجمالي الحوادث"
          value={formatNumber(kpis.totalIncidents)}
          color="sky"
        />
        <KPICard
          icon={TrendingUp}
          label="ادعاء البائع"
          value={formatNumber(kpis.totalRecords)}
          color="indigo"
        />
        <KPICard
          icon={AlertTriangle}
          label="عالي الأهمية"
          value={formatNumber(kpis.criticalCount)}
          color="red"
        />
        <KPICard
          icon={Shield}
          label="عالي"
          value={formatNumber(kpis.highCount)}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pt-0">
        {charts.map((chart, idx) => (
          <RasidChart
            key={`dashboard-chart-${idx}`}
            chartConfig={{
              type: chart.type,
              data: chart.data,
              options: {
                plugins: {
                  title: { display: true, text: chart.title },
                },
              },
            }}
          />
        ))}
      </div>

      {summary && (
        <div className="px-6 pb-4">
          <p className="text-center text-sm text-slate-400 font-[Tajawal]">{summary}</p>
        </div>
      )}
    </div>
  );
});

export default RasidDashboard;
