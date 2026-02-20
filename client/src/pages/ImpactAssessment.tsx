/// @ts-nocheck
import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { breachRecords } from '@/lib/breachData';
import * as analytics from '@/lib/breachAnalytics';
import { ShieldAlert, FileText, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";

const COLORS = ["#3DB1AC", "#6459A7", "#273470", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];
const SEVERITY_COLORS = { 'Critical': '#ef4444', 'High': '#f59e0b', 'Medium': '#8b5cf6', 'Low': '#3DB1AC' };

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const KpiCard = ({ title, value, icon: Icon }) => (
  <GlassCard>
    <div className="flex items-center justify-between flex-wrap">
      <div>
        <p className="text-slate-300 text-lg">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className="bg-slate-700/50 p-3 rounded-full">
        <Icon className="h-6 w-6 text-cyan-400" />
      </div>
    </div>
  </GlassCard>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="overflow-x-hidden max-w-full bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white">
      <div className="mb-4"><GlobalFilterBar /></div>
        <p className="font-bold text-lg mb-2">{label}</p>
        {Object.entries(data).map(([key, value]) => {
            if (key === 'fill' || key === 'name') return null;
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return <p key={key} className="text-sm"><span className="font-semibold text-cyan-300">{formattedKey}:</span> {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}</p>
        })}
      </div>
    );
  }
  return null;
};

export default function ImpactAssessment() {
  const { filteredRecords } = useFilters();
  const impactData = useMemo(() => analytics.getImpactDistribution(filteredRecords), [filteredRecords]);
  const severityBreakdown = useMemo(() => analytics.getSeverityBreakdown(filteredRecords), [filteredRecords]);

  const kpiStats = useMemo(() => {
    if (!impactData || impactData.length === 0) {
      return { totalRecords: 0, avgRecords: 0, maxRecords: 0, totalFines: 0 };
    }
    const totalRecords = impactData.reduce((sum, item) => sum + item.records, 0);
    const totalFines = impactData.reduce((sum, item) => sum + item.fine, 0);
    const maxRecords = Math.max(...impactData.map(item => item.records));
    return {
      totalRecords,
      avgRecords: totalRecords / impactData.length,
      maxRecords,
      totalFines,
    };
  }, [impactData]);

  const topIncidentsByRecords = useMemo(() => {
    return [...impactData]
      .sort((a, b) => b.records - a.records)
      .slice(0, 20)
      .map(d => ({ ...d, title: d.title.length > 25 ? `${d.title.substring(0, 25)}...` : d.title }));
  }, [impactData]);

  const finesBySector = useMemo(() => {
    const sectorFines = impactData.reduce((acc, incident) => {
      if (!acc[incident.sector]) {
        acc[incident.sector] = 0;
      }
      acc[incident.sector] += incident.fine;
      return acc;
    }, {});
    return Object.entries(sectorFines).map(([name, fine]) => ({ name, fine })).sort((a, b) => b.fine - a.fine);
  }, [impactData]);

  const recordsVsPiiData = useMemo(() => {
    return impactData.map(d => ({ ...d, title: d.title.length > 20 ? `${d.title.substring(0, 20)}...` : d.title }));
  }, [impactData]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-3 sm:p-8 font-sans" dir="rtl">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-cyan-400">تحليل الأثر | Impact Assessment</h1>
        <p className="text-slate-400 mt-2">نظرة شاملة على تأثير حالات الرصد</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="إجمالي ادعاءات البائع" value={kpiStats.totalRecords.toLocaleString('ar-SA')} icon={FileText} />
        <KpiCard title="متوسط السجلات لكل حادثة" value={Math.round(kpiStats.avgRecords).toLocaleString('ar-SA')} icon={BarChart3} />
        <KpiCard title="أكبر عدد سجلات في حادثة واحدة" value={kpiStats.maxRecords.toLocaleString('ar-SA')} icon={ShieldAlert} />
        <KpiCard title="إجمالي الغرامات التقديرية (SAR)" value={`${(kpiStats.totalFines / 1_000_000).toFixed(1)} مليون`} icon={PieChartIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <GlassCard className="h-[500px]">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">أبرز 20 حادثة حسب ادعاء البائع</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={topIncidentsByRecords} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis type="number" stroke="#94a3b8" tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
              <YAxis dataKey="title" type="category" stroke="#94a3b8" width={120} tick={{ fill: '#cbd5e1', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
              <Bar dataKey="records" name="ادعاء البائع" fill="#3DB1AC" background={{ fill: '#1e293b' }} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="h-[500px]">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">توزيع الحوادث حسب مستوى التأثير</h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={severityBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={150} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {severityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="h-[500px]">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">تقدير الغرامات حسب القطاع (SAR)</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={finesBySector} margin={{ top: 5, right: 20, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
              <Bar dataKey="fine" name="الغرامة التقديرية" fill="#6459A7" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="h-[500px]">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">ادعاء البائع مقابل عدد أنواع البيانات الشخصية</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={recordsVsPiiData} margin={{ top: 5, right: 20, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="title" stroke="#94a3b8" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#3DB1AC" label={{ value: 'ادعاء البائع', angle: -90, position: 'insideLeft', fill: '#3DB1AC' }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" label={{ value: 'أنواع البيانات', angle: 90, position: 'insideRight', fill: '#ef4444' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
                <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                <Bar yAxisId="left" dataKey="records" name="السجلات" fill="#3DB1AC" />
                <Bar yAxisId="right" dataKey="piiCount" name="أنواع البيانات" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}