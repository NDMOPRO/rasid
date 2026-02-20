// @ts-nocheck
import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { breachRecords } from '@/lib/breachData';
import * as analytics from '@/lib/breachAnalytics';
import { Link } from 'wouter';
import { Package, TrendingUp, CircleDollarSign, ExternalLink } from 'lucide-react';
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";

const COLORS = ["#3DB1AC", "#6459A7", "#273470", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const KpiCard = ({ title, value, icon: Icon, subtext }) => (
  <GlassCard>
    <div className="flex items-center justify-between flex-wrap">
      <p className="text-lg text-slate-300">{title}</p>
      <Icon className="h-8 w-8 text-slate-400" />
    </div>
    <p className="text-2xl sm:text-4xl font-bold text-white mt-2">{value}</p>
    {subtext && <p className="text-sm text-slate-400 mt-1">{subtext}</p>}
  </GlassCard>
);

export default function SourceIntelligence() {
  const { filteredRecords } = useFilters();
  const platformDistribution = useMemo(() => analytics.getPlatformDistribution(filteredRecords), [filteredRecords]);
  const priceAnalysis = useMemo(() => analytics.getPriceAnalysis(filteredRecords), [filteredRecords]);

  const totalPlatforms = useMemo(() => new Set(filteredRecords.map(r => r.leak_source.platform)).size, [filteredRecords]);
  const dominantPlatform = useMemo(() => platformDistribution.length > 0 ? platformDistribution[0].name : 'N/A', [platformDistribution]);
  const incidentsWithPricing = useMemo(() => priceAnalysis.filter(p => p.price > 0).length, [priceAnalysis]);

  const pricedLeaksForChart = useMemo(() => 
    priceAnalysis
      .filter(p => p.price > 0)
      .sort((a, b) => b.price - a.price)
      .slice(0, 10),
    [priceAnalysis]
  );

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen bg-slate-900 text-white p-3 sm:p-8 font-sans" dir="rtl">
      <div className="mb-4"><GlobalFilterBar /></div>
      <header className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-cyan-400">استخبارات المصادر | Source Intelligence</h1>
        <p className="text-slate-400 mt-2">تحليل منصات رصد البيانات وأسعارها.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard title="إجمالي المنصات" value={totalPlatforms} icon={Package} subtext="العدد الكلي للمنصات المكتشفة" />
        <KpiCard title="المنصة المهيمنة" value={dominantPlatform} icon={TrendingUp} subtext="الأكثر ظهوراً في حالات الرصد" />
        <KpiCard title="حالات رصد مسعّرة" value={incidentsWithPricing} icon={CircleDollarSign} subtext="عدد حالات الرصد التي لها سعر محدد" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-8 mb-8">
        <GlassCard className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-amber-400">توزيع المنصات</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {platformDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }}
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => label}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-4 text-red-400">أغلى 10 حالات رصد</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pricedLeaksForChart} layout="vertical" margin={{ right: 20, left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="title" type="category" stroke="#94a3b8" width={120} tick={{ fill: '#e2e8f0' }} />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.2)' }}
                labelStyle={{ color: '#f59e0b' }}
                formatter={(value, name) => [name === 'price' ? `$${Number(value).toLocaleString()}` : value, name === 'price' ? 'السعر' : '']}
              />
              <Bar dataKey="price" fill="#ef4444" name="السعر" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-2xl font-bold mb-4 text-green-400">جدول المصادر</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="p-4">المنصة</th>
                <th className="p-4">السعر (USD)</th>
                <th className="p-4">ادعاء البائع</th>
                <th className="p-4">الرابط</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="p-4">{record.leak_source.platform}</td>
                  <td className="p-4">{record.leak_source.price ? `$${record.leak_source.price.toLocaleString()}` : 'غير محدد'}</td>
                  <td className="p-4">{record.overview.exposed_records.toLocaleString()}</td>
                  <td className="p-4">
                    <a href={record.leak_source.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
                      <span>زيارة المصدر</span>
                      <ExternalLink size={16} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}