// @ts-nocheck
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { breachRecords } from "@/lib/breachData";
import * as analytics from "@/lib/breachAnalytics";
import { Link, useLocation, useRoute } from "wouter";
import { FileText, Users, KeyRound, BarChart3, PieChart as PieChartIcon, AlertTriangle, ShieldCheck, ArrowRight, Target, Scale, Landmark, Fingerprint, Mail, Phone, Calendar, MapPin, Briefcase, Database } from 'lucide-react';
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
    <div className="flex items-center justify-between">
      <p className="text-lg text-slate-300">{title}</p>
      <Icon className="w-8 h-8 text-amber-400" />
    </div>
    <p className="text-4xl font-bold text-white mt-2">{value}</p>
    {subtext && <p className="text-sm text-slate-400 mt-1">{subtext}</p>}
  </GlassCard>
);

export default function LeakAnatomy() {
  const { filteredRecords } = useFilters();
  const piiFrequency = useMemo(() => analytics.getPiiFrequency('ar', filteredRecords).slice(0, 30), [filteredRecords]);
  const piiCoOccurrence = useMemo(() => analytics.getPiiCoOccurrence(10, filteredRecords), [filteredRecords]);

  const piiSensitivity = useMemo(() => {
    const sensitivityMap = {
      'High': ['كلمة المرور', 'بيانات بنكية', 'رقم الهوية الوطنية', 'جواز السفر', 'بيانات صحية'],
      'Medium': ['الاسم الكامل', 'البريد الإلكتروني', 'رقم الهاتف', 'تاريخ الميلاد', 'العنوان الفعلي', 'عنوان IP'],
      'Low': ['اسم المستخدم', 'ملفات تعريف الارتباط (Cookies)', 'بيانات الموقع الجغرافي', 'الجنس']
    };
    const sensitivityCounts = { 'حساسية عالية': 0, 'حساسية متوسطة': 0, 'حساسية منخفضة': 0 };
    filteredRecords.forEach(record => {
      record.data_types_ar.forEach(pii => {
        if (sensitivityMap.High.includes(pii)) sensitivityCounts['حساسية عالية']++;
        else if (sensitivityMap.Medium.includes(pii)) sensitivityCounts['حساسية متوسطة']++;
        else if (sensitivityMap.Low.includes(pii)) sensitivityCounts['حساسية منخفضة']++;
      });
    });
    return Object.entries(sensitivityCounts).map(([name, count]) => ({ name, value: count }));
  }, [filteredRecords]);

  const kpis = useMemo(() => {
    const allPiiTypes = new Set(filteredRecords.flatMap(r => r.data_types_ar));
    const totalIncidents = filteredRecords.length;
    const totalPiiInstances = filteredRecords.reduce((acc, r) => acc + r.data_types_count, 0);
    const mostCommon = piiFrequency[0]?.name || 'N/A';
    return {
      totalTypes: allPiiTypes.size,
      mostCommonType: mostCommon,
      avgTypesPerIncident: (totalPiiInstances / totalIncidents).toFixed(1),
    };
  }, [piiFrequency]);

  const coOccurrenceMatrix = useMemo(() => {
    const types = [...new Set(piiCoOccurrence.flatMap(d => [d.type1, d.type2]))];
    const matrix = types.map(type1 => 
      types.map(type2 => {
        if (type1 === type2) return 1; // Self-occurrence is max
        const pair = piiCoOccurrence.find(d => (d.type1 === type1 && d.type2 === type2) || (d.type1 === type2 && d.type2 === type1));
        return pair ? pair.count : 0;
      })
    );
    const maxCount = Math.max(...piiCoOccurrence.map(d => d.count));
    return { types, matrix, maxCount };
  }, [piiCoOccurrence]);

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen" dir="rtl">
      <div className="mb-4"><GlobalFilterBar /></div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-amber-400">تشريح حالات الرصد | Leak Anatomy</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard title="إجمالي أنواع البيانات الشخصية" value={kpis.totalTypes} icon={Fingerprint} subtext="الأنواع الفريدة التي تم رصدها" />
        <KpiCard title="البيان الأكثر شيوعاً" value={kpis.mostCommonType} icon={KeyRound} subtext="الأكثر ظهوراً في حالات الرصد" />
        <KpiCard title="متوسط الأنواع لكل حالة رصد" value={kpis.avgTypesPerIncident} icon={BarChart3} subtext="متوسط عدد أنواع البيانات لكل حالة رصد" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <GlassCard className="lg:col-span-3 h-[600px]">
          <h2 className="text-2xl font-bold mb-4 text-amber-300">تكرار أنواع البيانات الشخصية (أعلى 30)</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={piiFrequency} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={120} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#f59e0b' }}
              />
              <Bar dataKey="count" fill="#3DB1AC" name="عدد مرات الظهور" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="lg:col-span-2 h-[600px] flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-amber-300">البيانات حسب مستوى الحساسية</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={piiSensitivity}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={"80%"}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                  return (
                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {piiSensitivity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#10b981'][index % 3]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="mt-8">
        <h2 className="text-2xl font-bold mb-6 text-amber-300">مصفوفة الارتباط بين أنواع البيانات</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr>
                <th className="p-2 border-b border-slate-600"></th>
                {coOccurrenceMatrix.types.map((type, i) => (
                  <th key={i} className="p-2 border-b border-slate-600 transform -rotate-45 h-24 w-10 text-xs">{type}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coOccurrenceMatrix.types.map((type1, i) => (
                <tr key={i}>
                  <th className="p-2 border-r border-slate-600 text-right text-xs">{type1}</th>
                  {coOccurrenceMatrix.matrix[i].map((count, j) => {
                    const opacity = count > 0 ? Math.max(0.2, count / coOccurrenceMatrix.maxCount) : 0;
                    const isDiagonal = i === j;
                    return (
                      <td key={j} className="p-2 border border-slate-700 relative">
                        <div style={{ backgroundColor: isDiagonal ? '#6459A7' : '#3DB1AC', opacity: isDiagonal ? 1 : opacity, width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}></div>
                        <span className="relative text-white font-bold">{count > 0 && !isDiagonal ? count : ''}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
}