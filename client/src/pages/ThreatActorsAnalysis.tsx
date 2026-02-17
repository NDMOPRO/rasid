// @ts-nocheck
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Users, Target, Bomb, ServerCrash } from 'lucide-react';
import { Link } from "wouter";
import * as analytics from "@/lib/breachAnalytics";
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";

const COLORS = ["#3DB1AC","#6459A7","#273470","#f59e0b","#ef4444","#10b981","#8b5cf6","#ec4899","#06b6d4","#84cc16"];

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const KpiCard = ({ title, value, icon: Icon, subtitle }) => (
  <GlassCard>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-lg text-slate-300">{title}</p>
        <p className="text-4xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="bg-slate-700/50 p-4 rounded-full">
        <Icon className="h-8 w-8 text-amber-400" />
      </div>
    </div>
  </GlassCard>
);

export default function ThreatActorsAnalysis() {
  const { filteredRecords } = useFilters();
  const actorProfiles = useMemo(() => analytics.getThreatActorProfiles(filteredRecords), [filteredRecords]);
  const attackMethods = useMemo(() => analytics.getAttackMethodBreakdown(filteredRecords), [filteredRecords]);

  const top20ActorsByIncidents = useMemo(() => 
    [...actorProfiles].sort((a, b) => b.count - a.count).slice(0, 20),
    [actorProfiles]
  );

  const mostActiveActor = useMemo(() => {
    if (!actorProfiles || actorProfiles.length === 0) return { name: 'N/A', count: 0 };
    return actorProfiles.reduce((max, actor) => actor.count > max.count ? actor : max, actorProfiles[0]);
  }, [actorProfiles]);

  const mostDestructiveActor = useMemo(() => {
    if (!actorProfiles || actorProfiles.length === 0) return { name: 'N/A', records: 0 };
    return actorProfiles.reduce((max, actor) => actor.records > max.records ? actor : max, actorProfiles[0]);
  }, [actorProfiles]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/80 backdrop-blur-md border border-white/20 p-3 rounded-lg text-white">
      <div className="mb-4"><GlobalFilterBar /></div>
          <p className="label font-bold">{`${label}`}</p>
          <p className="intro">{`عدد الحوادث: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div dir="rtl" className="p-4 md:p-8 bg-slate-900 min-h-screen text-slate-100">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">تحليل المهاجمين</h1>
        <p className="text-lg text-slate-400">Threat Actors Analysis</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard title="إجمالي المهاجمين" value={actorProfiles.length} icon={Users} subtitle="Total Unique Actors" />
        <KpiCard title="المهاجم الأكثر نشاطًا" value={mostActiveActor.name} icon={Target} subtitle={`بـ ${mostActiveActor.count} حادثة`} />
        <KpiCard title="المهاجم الأكثر تدميرًا" value={mostDestructiveActor.name} icon={Bomb} subtitle={`تسبب في رصد ${mostDestructiveActor.records.toLocaleString('ar-SA')} سجل`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassCard className="col-span-1">
          <h2 className="text-2xl font-bold mb-4 text-white">أبرز 20 مهاجمًا (حسب عدد الحوادث)</h2>
          <p className="text-slate-400 mb-6">Top 20 Actors by Incident Count</p>
          <div style={{ height: '600px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={top20ActorsByIncidents} margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} tick={{ fill: '#e2e8f0' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
                <Bar dataKey="count" name="عدد الحوادث" fill="#3DB1AC" barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="col-span-1">
          <h2 className="text-2xl font-bold mb-4 text-white">أساليب الهجوم الشائعة</h2>
          <p className="text-slate-400 mb-6">Common Attack Methods</p>
          <div style={{ height: '600px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackMethods} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#e2e8f0' }} />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.2)' }} />
                <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                <Bar dataKey="count" name="عدد الحوادث">
                  {attackMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-white">جدول أبرز المهاجمين</h2>
          <p className="text-slate-400 mb-6">Top Actors Table</p>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-slate-300">
              <thead className="bg-slate-700/50 text-slate-100">
                <tr>
                  <th className="p-4">اسم المهاجم (Actor)</th>
                  <th className="p-4">الحوادث (Incidents)</th>
                  <th className="p-4">السجلات المسربة (Records)</th>
                  <th className="p-4">القطاعات المستهدفة (Sectors)</th>
                  <th className="p-4">الأساليب المستخدمة (Methods)</th>
                </tr>
              </thead>
              <tbody>
                {top20ActorsByIncidents.map((actor, index) => (
                  <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="p-4 font-semibold text-white">{actor.name}</td>
                    <td className="p-4 text-center">{actor.count}</td>
                    <td className="p-4 text-center">{actor.records.toLocaleString('ar-SA')}</td>
                    <td className="p-4 max-w-xs truncate">{actor.sectors.join(', ')}</td>
                    <td className="p-4 max-w-xs truncate">{actor.methods.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}