// @ts-nocheck
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ShieldAlert, Landmark, AlertTriangle, PieChart as PieChartIcon } from 'lucide-react';
import { Link } from 'wouter';
import { breachRecords } from "@/lib/breachData";
import * as analytics from "@/lib/breachAnalytics";
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";

const COLORS = ["#3DB1AC", "#6459A7", "#273470", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const frameRate = 1000 / 60;
  const totalFrames = Math.round(duration / frameRate);

  useEffect(() => {
    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      setCount(Math.round(end * progress));

      if (frame === totalFrames) {
        clearInterval(counter);
        setCount(end); // Ensure it ends on the exact number
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [end, duration, totalFrames]);

  return count;
};

const KpiCard = ({ title, value, icon: Icon, unit = '' }) => {
    const animatedValue = useCounter(value);
    return (
        <GlassCard className="flex flex-col justify-between">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-300">{title}</h3>
                <Icon className="text-amber-400" size={28} />
            </div>
            <div>
                <p className="text-4xl font-bold text-white text-right">{animatedValue.toLocaleString()}{unit && <span className="text-2xl ml-2">{unit}</span>}</p>
            </div>
        </GlassCard>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-slate-900/80 border border-slate-700 rounded-lg text-white">
      <div className="mb-4"><GlobalFilterBar /></div>
        <p className="label">{`${label} : ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export default function PdplCompliance() {
  const { filteredRecords } = useFilters();
  const pdplData = useMemo(() => analytics.getPdplViolations(filteredRecords), [filteredRecords]);
  const complianceGaps = useMemo(() => analytics.getComplianceGaps(filteredRecords), [filteredRecords]);
  const impactData = useMemo(() => analytics.getImpactDistribution(filteredRecords), [filteredRecords]);

  const topIncidentsByFine = useMemo(() => 
    impactData
      .filter(d => d.pdpl_analysis?.estimated_fine_sar > 0)
      .sort((a, b) => b.pdpl_analysis.estimated_fine_sar - a.pdpl_analysis.estimated_fine_sar)
      .slice(0, 5),
  [impactData]);

  const requiredActionsFrequency = useMemo(() => {
      const actions = impactData.flatMap(d => d.pdpl_analysis?.required_actions || []);
      const frequency = {};
      actions.forEach(action => {
          frequency[action] = (frequency[action] || 0) + 1;
      });
      return Object.entries(frequency).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
  }, [impactData]);

  const totalFines = useMemo(() => pdplData.totalFines, [pdplData]);

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen" dir="rtl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-amber-400">امتثال PDPL</h1>
        <p className="text-slate-400 text-lg">PDPL Compliance Analysis</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard title="إجمالي المخالفات" value={pdplData.articles.reduce((acc, a) => acc + a.count, 0)} icon={AlertTriangle} />
        <KpiCard title="إجمالي الغرامات المقدرة" value={totalFines} icon={Landmark} unit="ريال" />
        <KpiCard title="الحوادث المتضمنة مخالفات" value={pdplData.incidentsWithViolations} icon={ShieldAlert} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <GlassCard>
          <h2 className="text-2xl font-bold mb-4 text-slate-200">تكرار المواد المخالفة</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pdplData.articles} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} tick={{ fill: '#cbd5e1' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
              <Bar dataKey="count" name="عدد المخالفات" fill="#3DB1AC" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h2 className="text-2xl font-bold mb-4 text-slate-200">فجوات الامتثال</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={complianceGaps}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={70}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {complianceGaps.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <GlassCard className="lg:col-span-3">
            <h2 className="text-2xl font-bold mb-4 text-slate-200">أبرز الحوادث حسب الغرامة</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="p-3">الحادثة</th>
                            <th className="p-3">القطاع</th>
                            <th className="p-3">الغرامة المقدرة (ريال)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topIncidentsByFine.map(incident => (
                            <tr key={incident.id} className="border-b border-slate-800 hover:bg-slate-700/50">
                                <td className="p-3">
                                    <Link href={`/incident/${incident.id}`} className="text-amber-400 hover:underline">{incident.title_ar}</Link>
                                </td>
                                <td className="p-3 text-slate-300">{incident.sector}</td>
                                <td className="p-3 font-mono text-red-400">{incident.pdpl_analysis.estimated_fine_sar.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
        <GlassCard className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-slate-200">الإجراءات التصحيحية المطلوبة</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={requiredActionsFrequency} margin={{ top: 5, right: 20, left: 20, bottom: 90 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
                    <Bar dataKey="count" name="التكرار" fill="#6459A7" />
                </BarChart>
            </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}