// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChevronsRight, Users, ShieldAlert, BarChart3, CalendarDays, Database } from 'lucide-react';
import { Link, useLocation } from "wouter";
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

const KpiCard = ({ title, value, icon: Icon }) => (
  <GlassCard className="flex flex-col justify-between">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-slate-300">{title}</h3>
      <Icon className="text-slate-400" size={24} />
    </div>
    <p className="text-4xl font-bold text-white mt-2">{value}</p>
  </GlassCard>
);

const CampaignBreachDetail = ({ breach }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mt-2">
        <p className="font-semibold text-white">{breach.title_ar}</p>
        <p className="text-sm text-slate-400">{breach.date} - {breach.exposed_records.toLocaleString('ar-SA')} سجل</p>
    </div>
);

const CampaignCard = ({ campaign, onExpand, isExpanded }) => (
    <GlassCard className="mb-4 transition-all duration-300 hover:border-cyan-400/50">
        <div className="cursor-pointer" onClick={() => onExpand(campaign.actor)}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold text-cyan-300">{campaign.actor}</h3>
                    <p className="text-slate-400 text-sm">Date Range: {campaign.dateRange}</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-semibold text-white">{campaign.incidents.toLocaleString('ar-SA')} <span className="text-sm text-slate-300">هجمات</span></p>
                    <p className="text-xl font-semibold text-white">{campaign.totalRecords.toLocaleString('ar-SA')} <span className="text-sm text-slate-300">سجل</span></p>
                </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {campaign.sectors.map(sector => (
                    <span key={sector} className="bg-slate-700/60 text-cyan-200 text-xs font-medium px-2.5 py-1 rounded-full">{sector}</span>
                ))}
            </div>
        </div>
        {isExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
                <h4 className="text-lg font-semibold text-slate-200 mb-2">الهجمات الفردية</h4>
                {campaign.breaches.map(breach => <CampaignBreachDetail key={breach.id} breach={breach} />)}
            </div>
        )}
    </GlassCard>
);

export default function CampaignTracker() {
  const { filteredRecords } = useFilters();
  const campaignsData = useMemo(() => analytics.getCampaigns(filteredRecords), [filteredRecords]);
  const [expandedCampaign, setExpandedCampaign] = useState(null);

  const largestCampaign = useMemo(() => 
    campaignsData.reduce((max, camp) => camp.totalRecords > max.totalRecords ? camp : max, campaignsData[0] || { actor: 'N/A', totalRecords: 0 })
  , [campaignsData]);

  const topCampaignsByIncidents = useMemo(() => 
    [...campaignsData].sort((a, b) => b.incidents - a.incidents).slice(0, 10)
  , [campaignsData]);

  const handleExpand = (actor) => {
    setExpandedCampaign(prev => prev === actor ? null : actor);
  };

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen font-sans" dir="rtl">
      <div className="mb-4"><GlobalFilterBar /></div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-400">تتبع الحملات | Campaign Tracker</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <KpiCard title="إجمالي الحملات" value={campaignsData.length.toLocaleString('ar-SA')} icon={ShieldAlert} />
        <KpiCard title="الحملة الأضخم (حسب السجلات)" value={largestCampaign.actor} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">قائمة الحملات</h2>
            <div className="max-h-[600px] overflow-y-auto pr-2">
                {campaignsData.map(campaign => (
                    <CampaignCard 
                        key={campaign.actor} 
                        campaign={campaign} 
                        onExpand={handleExpand}
                        isExpanded={expandedCampaign === campaign.actor}
                    />
                ))}
            </div>
        </div>
        <div className="lg:col-span-2">
            <GlassCard>
                <h2 className="text-2xl font-semibold text-slate-200 mb-4">أبرز الحملات حسب عدد الهجمات</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topCampaignsByIncidents} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" />
                        <YAxis dataKey="actor" type="category" stroke="#9ca3af" width={100} tick={{ fill: '#e2e8f0' }} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb' }}
                            labelStyle={{ color: '#f9fafb' }}
                        />
                        <Legend formatter={(value) => <span className="text-slate-300">{value}</span>} />
                        <Bar dataKey="incidents" name="عدد الهجمات" fill="#3DB1AC">
                            {topCampaignsByIncidents.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}