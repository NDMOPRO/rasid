// @ts-nocheck
import React, { useMemo } from 'react';
import { BarChart, Bar, Treemap, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Building, FileText, ShieldAlert } from 'lucide-react';
import { breachRecords } from "@/lib/breachData";
import * as analytics from "@/lib/breachAnalytics";
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";

const COLORS = ["#3DB1AC", "#6459A7", "#273470", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const KpiCard = ({ title, value, icon: Icon }) => (
  <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center space-x-4 rtl:space-x-reverse">
    <div className="bg-slate-900/50 p-3 rounded-full">
      <Icon className="w-8 h-8 text-cyan-400" />
    </div>
    <div>
      <h3 className="text-lg text-slate-300">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const CustomTreemapTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { name, count } = payload[0].payload;
        return (
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/20 p-3 rounded-lg text-white">
      <div className="mb-4"><GlobalFilterBar /></div>
                <p className="font-bold">{name}</p>
                <p>عدد الحوادث: {count}</p>
            </div>
        );
    }
    return null;
};

const SectorHeatmap = ({ data }) => {
    const piiTypes = useMemo(() => Object.keys(Object.values(data)[0] || {}), [data]);
    const sectors = useMemo(() => Object.keys(data), [data]);

    const maxCount = useMemo(() => {
        return Math.max(...sectors.flatMap(sector => piiTypes.map(pii => data[sector][pii] || 0)));
    }, [data, sectors, piiTypes]);

    const getColor = (value) => {
        if (!value) return 'bg-slate-800/20';
        const intensity = Math.min(value / (maxCount * 0.6), 1);
        return `rgba(61, 177, 172, ${intensity})`; // Using the main color #3DB1AC
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="p-3 text-slate-300 font-semibold sticky left-0 bg-slate-800/60 backdrop-blur-xl">القطاع</th>
                        {piiTypes.map(pii => (
                            <th key={pii} className="p-3 text-slate-300 font-semibold whitespace-nowrap">{pii}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sectors.map(sector => (
                        <tr key={sector} className="hover:bg-slate-700/50 border-t border-white/5">
                            <td className="p-3 text-white font-medium whitespace-nowrap sticky left-0 bg-slate-800/60 backdrop-blur-xl">{sector}</td>
                            {piiTypes.map(pii => {
                                const value = data[sector][pii] || 0;
                                return (
                                    <td key={pii} className="p-0 text-center">
                                        <div style={{ backgroundColor: getColor(value) }} className="w-full h-full flex items-center justify-center p-3">
                                            <span className="text-white font-mono">{value > 0 ? value : '-'}</span>
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default function SectorAnalysis() {
  const { filteredRecords } = useFilters();
    const sectorBreakdown = useMemo(() => analytics.getSectorBreakdown(filteredRecords), [filteredRecords]);
    const sectorPiiMatrix = useMemo(() => analytics.getSectorPiiMatrix(filteredRecords), [filteredRecords]);

    const totalSectors = sectorBreakdown.length;
    const mostAffectedSector = useMemo(() => {
        if (!sectorBreakdown.length) return { name: 'N/A', count: 0 };
        return sectorBreakdown.reduce((max, current) => (current.count > max.count ? current : max), sectorBreakdown[0]);
    }, [sectorBreakdown]);
    const totalRecords = useMemo(() => sectorBreakdown.reduce((sum, sector) => sum + sector.records, 0), [sectorBreakdown]);

    const topSectorsByRecords = useMemo(() => {
        return [...sectorBreakdown]
            .sort((a, b) => b.records - a.records)
            .slice(0, 15)
            .map(d => ({ ...d, name: d.name.split(' ').slice(0, 3).join(' ') }));
    }, [sectorBreakdown]);

    const treemapData = useMemo(() => sectorBreakdown.map(d => ({...d, name: d.name.split(' ').slice(0,2).join(' ')})), [sectorBreakdown]);

    return (
        <div dir="rtl" className="p-4 md:p-8 text-white bg-slate-900 min-h-screen">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-cyan-400">تحليل القطاعات</h1>
                <p className="text-lg text-slate-400">Sector Analysis</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <KpiCard title="إجمالي القطاعات المتأثرة" value={totalSectors.toLocaleString('ar-SA')} icon={Building} />
                <KpiCard title="القطاع الأكثر تأثراً" value={mostAffectedSector.name} icon={ShieldAlert} />
                <KpiCard title="إجمالي ادعاءات البائع" value={totalRecords.toLocaleString('ar-SA')} icon={FileText} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold mb-4 text-white">توزيع الحوادث حسب القطاع</h2>
                    <p className="text-slate-400 mb-6">Treemap of sectors by incident count</p>
                    <ResponsiveContainer width="100%" height={400}>
                        <Treemap
                            data={treemapData}
                            dataKey="count"
                            ratio={4 / 3}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomTreemapTooltip />}
                        >
                            {treemapData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Treemap>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold mb-4 text-white">أكثر 15 قطاعاً من حيث ادعاء البائع</h2>
                    <p className="text-slate-400 mb-6">Top 15 sectors by records exposed</p>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={topSectorsByRecords} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fill: '#e2e8f0', fontSize: 12 }} width={150} />
                            <Tooltip 
                                cursor={{ fill: 'rgba(100, 116, 139, 0.3)' }}
                                contentStyle={{ 
                                    backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    color: '#fff'
                                }}
                            />
                            <Legend formatter={(value) => <span className="text-slate-300">{value}</span>} />
                            <Bar dataKey="records" name="ادعاء البائع" fill="#3DB1AC" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-8 bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4 text-white">مصفوفة القطاعات مقابل أنواع البيانات الشخصية</h2>
                <p className="text-slate-400 mb-6">Sector vs. PII Heatmap</p>
                <SectorHeatmap data={sectorPiiMatrix} />
            </div>
        </div>
    );
}