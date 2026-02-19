// @ts-nocheck
import React, { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Calendar, TrendingUp, AlertOctagon, BarChart3, Users, Shield, Target, Scale, FileText, GanttChartSquare, Landmark, ArrowRight, ArrowLeft, Clock, Zap } from 'lucide-react';
import { useLocation, Link } from "wouter";
import { breachRecords } from "@/lib/breachData";
import * as analytics from "@/lib/breachAnalytics";
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";

const COLORS = ["#3DB1AC", "#6459A7", "#273470", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
const SEVERITY_COLORS = {
  "Critical": "#ef4444",
  "High": "#f59e0b",
  "Medium": "#3b82f6",
  "Low": "#22c55e",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-3 text-sm text-white">
      <div className="mb-4"><GlobalFilterBar /></div>
        <p className="label font-bold">{`${label}`}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{`${p.name}: ${p.value.toLocaleString()}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const KpiCard = ({ title, value, icon: Icon, subtext }) => (
  <GlassCard>
    <div className="flex items-center justify-between">
      <p className="text-slate-300 text-md">{title}</p>
      <Icon className="text-slate-400" size={24} />
    </div>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
    {subtext && <p className="text-slate-400 text-sm mt-1">{subtext}</p>}
  </GlassCard>
);

export default function LeakTimeline() {
  const { filteredRecords } = useFilters();
  const timelineData = useMemo(() => analytics.getTimelineData(filteredRecords), [filteredRecords]);
  const yearlyData = useMemo(() => analytics.getYearlyTrend(filteredRecords), [filteredRecords]);

  const { kpiData, cumulativeData, severityByMonthData } = useMemo(() => {
    if (!timelineData || timelineData.length === 0) {
      return { kpiData: {}, cumulativeData: [], severityByMonthData: [] };
    }

    let cumulativeRecords = 0;
    const cumulative = timelineData.map(monthData => {
      const monthRecords = monthData.records.reduce((sum, rec) => sum + (rec.overview.exposed_records || 0), 0);
      cumulativeRecords += monthRecords;
      return {
        month: monthData.month,
        cumulativeRecords: cumulativeRecords
      };
    });

    const severityByMonth = timelineData.map(monthData => {
      const severities = { month: monthData.month, Critical: 0, High: 0, Medium: 0, Low: 0 };
      monthData.records.forEach(rec => {
        if (severities[rec.overview.severity] !== undefined) {
          severities[rec.overview.severity]++;
        }
      });
      return severities;
    });

    const earliestDate = new Date(Math.min(...timelineData.flatMap(m => m.records.map(r => new Date(r.date).getTime()))));
    const latestDate = new Date(Math.max(...timelineData.flatMap(m => m.records.map(r => new Date(r.date).getTime()))));
    const peakMonth = timelineData.reduce((max, month) => month.count > max.count ? month : max, timelineData[0]);
    const avgPerMonth = (filteredRecords.length / timelineData.length).toFixed(1);

    return {
      kpiData: {
        earliest: earliestDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' }),
        latest: latestDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' }),
        peak: `${peakMonth.month} (${peakMonth.count} حالات رصد)`,
        avg: avgPerMonth,
      },
      cumulativeData: cumulative,
      severityByMonthData: severityByMonth,
    };
  }, [timelineData]);

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen" dir="rtl">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-cyan-400">الخط الزمني والتوجهات</h1>
        <p className="text-xl text-slate-300">Timeline & Trends</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="أقدم حالة رصد" value={kpiData.earliest} icon={Calendar} subtext="Earliest Leak" />
        <KpiCard title="أحدث حالة رصد" value={kpiData.latest} icon={Clock} subtext="Latest Leak" />
        <KpiCard title="شهر الذروة" value={kpiData.peak} icon={TrendingUp} subtext="Peak Month" />
        <KpiCard title="متوسط حالات الرصد شهرياً" value={kpiData.avg} icon={BarChart3} subtext="Avg. Incidents / Month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="h-[400px]">
          <h2 className="text-xl font-bold mb-4 text-cyan-300">حالات الرصد الشهرية (Monthly Incidents)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="حالات الرصد" stroke="#3DB1AC" fill="rgba(61, 177, 172, 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="h-[400px]">
          <h2 className="text-xl font-bold mb-4 text-cyan-300">التوجه السنوي (Yearly Trend)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="حالات الرصد" fill="#6459A7" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="h-[400px]">
          <h2 className="text-xl font-bold mb-4 text-cyan-300">العدد المُدّعى المتراكم (Cumulative Records Exposed)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativeData} margin={{ top: 5, right: 20, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="cumulativeRecords" name="السجلات المتراكمة" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="h-[400px]">
          <h2 className="text-xl font-bold mb-4 text-cyan-300">توزيع مستوى التأثير شهرياً (Monthly Severity Breakdown)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityByMonthData} stackOffset="sign" margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ bottom: 0 }} />
              <Bar dataKey="Critical" name="عالية الأهمية" stackId="a" fill={SEVERITY_COLORS.Critical} />
              <Bar dataKey="High" name="عالية" stackId="a" fill={SEVERITY_COLORS.High} />
              <Bar dataKey="Medium" name="متوسطة" stackId="a" fill={SEVERITY_COLORS.Medium} />
              <Bar dataKey="Low" name="منخفضة" stackId="a" fill={SEVERITY_COLORS.Low} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}