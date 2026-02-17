// @ts-nocheck
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLocation, Link } from 'wouter';
import { Layers, Target, Shield, FileText, ArrowRight } from 'lucide-react';
import { breachRecords } from '@/lib/breachData';
import * as analytics from '@/lib/breachAnalytics';
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";

const COLORS = ["#3DB1AC", "#6459A7", "#273470", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg text-white">
      <div className="mb-4"><GlobalFilterBar /></div>
        <p className="label font-bold text-lg">{`${label}`}</p>
        <p className="intro text-cyan-400">{`العدد : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const RecommendationsHub = () => {
  const recommendationFrequency = useMemo(() => analytics.getRecommendationFrequency(filteredRecords), []);
  const totalUniqueRecommendations = useMemo(() => recommendationFrequency.length, [recommendationFrequency]);
  const mostCommonRecommendation = useMemo(() => recommendationFrequency.reduce((max, current) => (current.count > max.count ? current : max), recommendationFrequency[0] || { name: 'N/A', count: 0 }), [recommendationFrequency]);

  const recommendationsByCategory = useMemo(() => {
    const categories = {
      'الأمن السيبراني': [],
      'الامتثال والحوكمة': [],
      'تقني': [],
    };
    // This is a mock categorization. In a real scenario, you'd have a mapping.
    recommendationFrequency.forEach(rec => {
      if (rec.name.toLowerCase().includes('security') || rec.name.toLowerCase().includes('encryption') || rec.name.toLowerCase().includes('access control')) {
        categories['الأمن السيبراني'].push(rec);
      } else if (rec.name.toLowerCase().includes('pdpl') || rec.name.toLowerCase().includes('compliance') || rec.name.toLowerCase().includes('policy')) {
        categories['الامتثال والحوكمة'].push(rec);
      } else {
        categories['تقني'].push(rec);
      }
    });
    return categories;
  }, [recommendationFrequency]);

  const recommendationBySector = useMemo(() => {
      const sectorMap = {};
      breachRecords.forEach(record => {
          if (record.ai_analysis && record.ai_analysis.recommendations) {
              record.ai_analysis.recommendations.forEach(rec => {
                  if (!sectorMap[record.sector]) {
                      sectorMap[record.sector] = {};
                  }
                  sectorMap[record.sector][rec] = (sectorMap[record.sector][rec] || 0) + 1;
              });
          }
      });
      const result = [];
      Object.keys(sectorMap).forEach(sector => {
          let totalRecs = 0;
          Object.values(sectorMap[sector]).forEach(count => totalRecs += count);
          result.push({ name: sector, count: totalRecs });
      });
      return result.sort((a, b) => b.count - a.count);
  }, []);


  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans" dir="rtl">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-cyan-400">مركز التوصيات | Recommendations Hub</h1>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center space-x-4 space-x-reverse">
          <div className="bg-cyan-500/20 p-4 rounded-full">
            <Layers className="h-8 w-8 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg text-slate-300">إجمالي التوصيات الفريدة</h2>
            <p className="text-4xl font-bold text-white">{totalUniqueRecommendations}</p>
          </div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center space-x-4 space-x-reverse">
          <div className="bg-amber-500/20 p-4 rounded-full">
            <Target className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg text-slate-300">التوصية الأكثر شيوعًا</h2>
            <p className="text-2xl font-bold text-white truncate">{mostCommonRecommendation.name}</p>
            <p className="text-sm text-slate-400">تكررت {mostCommonRecommendation.count} مرات</p>
          </div>
        </div>
      </div>

      {/* Top 20 Recommendations Chart */}
      <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-10">
        <h2 className="text-2xl font-bold mb-6">أبرز 20 توصية | Top 20 Recommendations</h2>
        <div style={{ height: '600px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recommendationFrequency.slice(0, 20)} layout="vertical" margin={{ top: 5, right: 20, left: 150, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" width={150} stroke="#9ca3af" tick={{ fontSize: 12, fill: '#d1d5db' }} interval={0} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Bar dataKey="count" name="التردد" fill="#3DB1AC" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Recommendations by Sector Chart */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">توزيع التوصيات حسب القطاع</h2>
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recommendationBySector.slice(0,10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }}/>
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                  <Bar dataKey="count" name="عدد التوصيات" fill="#6459A7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommendations by Category */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">التوصيات حسب الفئة</h2>
            <div className="space-y-6">
              {Object.entries(recommendationsByCategory).map(([category, recs]) => (
                <div key={category}>
                  <h3 className="text-xl font-semibold text-cyan-400 mb-3 flex items-center">
                    {category === 'الأمن السيبراني' && <Shield className="w-6 h-6 ml-2 text-red-500" />}
                    {category === 'الامتثال والحوكمة' && <FileText className="w-6 h-6 ml-2 text-amber-500" />}
                    {category === 'تقني' && <Layers className="w-6 h-6 ml-2 text-blue-500" />}
                    {category}
                  </h3>
                  <ul className="space-y-2 pr-8">
                    {recs.slice(0, 5).map((rec, index) => (
                      <li key={index} className="flex items-center text-slate-300 hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4 ml-3 text-cyan-600" />
                        <span>{rec.name} <span className="text-xs text-slate-500">({rec.count})</span></span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
      </div>

    </div>
  );
};

export default RecommendationsHub;