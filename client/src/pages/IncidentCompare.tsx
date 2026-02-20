// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { breachRecords } from '@/lib/breachData';
import * as analytics from '@/lib/breachAnalytics';
import { Link, useLocation, useRoute } from 'wouter';
import { Scale, Users, Calendar, ShieldCheck, FileText, Crosshair, HardDrive, AlertTriangle } from 'lucide-react';
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";

const COLORS = ["#3DB1AC", "#6459A7", "#273470", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const severityToNumber = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 5;
    case 'high': return 4;
    case 'medium': return 3;
    case 'low': return 2;
    default: return 1;
  }
};

const ComparisonCard = ({ incident }) => {
  if (!incident) {
    return (
      <div className="overflow-x-hidden max-w-full bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center justify-center h-full">
      <div className="mb-4"><GlobalFilterBar /></div>
        <p className="text-slate-400">اختر حادثة لعرض التفاصيل</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
      <h3 className="text-xl font-bold text-white truncate">{incident.title_ar}</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-300"><Users size={16} className="text-cyan-400" /><span>القطاع:</span><strong className="text-white">{incident.sector}</strong></div>
        <div className="flex items-center gap-2 text-slate-300"><Calendar size={16} className="text-cyan-400" /><span>التاريخ:</span><strong className="text-white">{incident.date}</strong></div>
        <div className="flex items-center gap-2 text-slate-300"><HardDrive size={16} className="text-cyan-400" /><span>ادعاء البائع:</span><strong className="text-white">{incident.overview.exposed_records?.toLocaleString('ar-SA')}</strong></div>
        <div className="flex items-center gap-2 text-slate-300"><AlertTriangle size={16} className="text-cyan-400" /><span>مستوى التأثير:</span><strong className="text-white">{incident.overview.severity}</strong></div>
        <div className="flex items-center gap-2 text-slate-300"><FileText size={16} className="text-cyan-400" /><span>عدد أنواع البيانات:</span><strong className="text-white">{incident.data_types_count}</strong></div>
        <div className="flex items-center gap-2 text-slate-300"><Crosshair size={16} className="text-cyan-400" /><span>الجهة المهاجمة:</span><strong className="text-white">{incident.threat_actor}</strong></div>
        <div className="flex items-center gap-2 text-slate-300 col-span-2"><ShieldCheck size={16} className="text-cyan-400" /><span>أسلوب التسرب:</span><strong className="text-white">{incident.overview.attack_method_ar}</strong></div>
      </div>
    </div>
  );
};

export default function IncidentCompare() {
  const { filteredRecords } = useFilters();
  const [selectedId1, setSelectedId1] = useState(filteredRecords[0]?.id || '');
  const [selectedId2, setSelectedId2] = useState(filteredRecords[1]?.id || '');

  const { incidents, piiUnion } = useMemo(() => {
    if (!selectedId1 || !selectedId2) return { incidents: [null, null], piiUnion: [] };
    const data = analytics.compareIncidents([selectedId1, selectedId2], filteredRecords);
    const incident1 = data.find(inc => inc.id === selectedId1);
    const incident2 = data.find(inc => inc.id === selectedId2);
    
    const piiSet = new Set([...(incident1?.data_types_ar || []), ...(incident2?.data_types_ar || [])]);
    return {
      incidents: [incident1, incident2],
      piiUnion: Array.from(piiSet)
    };
  }, [selectedId1, selectedId2]);

  const radarData = useMemo(() => {
    const [inc1, inc2] = incidents;
    if (!inc1 || !inc2) return [];

    const metrics = [
      { subject: 'السجلات', key: 'exposed_records', max: Math.max(inc1.overview.exposed_records, inc2.overview.exposed_records) },
      { subject: 'أنواع البيانات', key: 'data_types_count', max: Math.max(inc1.data_types_count, inc2.data_types_count) },
      { subject: 'مستوى التأثير', key: 'severity', max: 5 },
    ];

    return metrics.map(m => ({
      subject: m.subject,
      A: m.key === 'severity' ? severityToNumber(inc1.overview.severity) : (inc1.overview[m.key] || inc1[m.key]),
      B: m.key === 'severity' ? severityToNumber(inc2.overview.severity) : (inc2.overview[m.key] || inc2[m.key]),
      fullMark: m.max,
    }));
  }, [incidents]);

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen text-white" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-300">مقارنة الحوادث | Incident Compare</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <label htmlFor="incident1" className="block mb-2 text-sm font-medium text-slate-300">اختر الحادثة الأولى</label>
          <select id="incident1" value={selectedId1} onChange={e => setSelectedId1(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500">
            {filteredRecords.map(rec => <option key={rec.id} value={rec.id}>{rec.title_ar}</option>)}
          </select>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <label htmlFor="incident2" className="block mb-2 text-sm font-medium text-slate-300">اختر الحادثة الثانية</label>
          <select id="incident2" value={selectedId2} onChange={e => setSelectedId2(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500">
            {filteredRecords.map(rec => <option key={rec.id} value={rec.id}>{rec.title_ar}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8">
        <ComparisonCard incident={incidents[0]} />
        <ComparisonCard incident={incidents[1]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">مقارنة المقاييس (Radar Chart)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'white' }} />
              <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={{ fill: 'transparent' }}/>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend wrapperStyle={{ color: 'white' }} payload={[
                  { value: incidents[0]?.title_ar || 'الحادثة الأولى', type: 'line', color: '#3DB1AC' },
                  { value: incidents[1]?.title_ar || 'الحادثة الثانية', type: 'line', color: '#f59e0b' },
              ]}/>
              <Radar name={incidents[0]?.title_ar} dataKey="A" stroke="#3DB1AC" fill="#3DB1AC" fillOpacity={0.6} />
              <Radar name={incidents[1]?.title_ar} dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">مقارنة أنواع البيانات الشخصية المرصودة</h2>
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-cyan-300 uppercase bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-r-lg">نوع البيان</th>
                  <th scope="col" className="px-6 py-3 text-center">{incidents[0]?.title_ar || 'الحادثة 1'}</th>
                  <th scope="col" className="px-6 py-3 text-center rounded-l-lg">{incidents[1]?.title_ar || 'الحادثة 2'}</th>
                </tr>
              </thead>
              <tbody>
                {piiUnion.map((pii, index) => (
                  <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{pii}</td>
                    <td className="px-6 py-4 text-center">
                      {incidents[0]?.data_types_ar.includes(pii) ? 
                        <ShieldCheck className="h-5 w-5 text-green-400 mx-auto" /> : 
                        <span className="text-slate-500">-</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {incidents[1]?.data_types_ar.includes(pii) ? 
                        <ShieldCheck className="h-5 w-5 text-green-400 mx-auto" /> : 
                        <span className="text-slate-500">-</span>}
                    </td>
                  </tr>
                ))}
                 {piiUnion.length === 0 && (
                    <tr>
                        <td colSpan={3} className="text-center py-8 text-slate-400">لم يتم تحديد حوادث أو لا توجد بيانات PII للمقارنة.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}