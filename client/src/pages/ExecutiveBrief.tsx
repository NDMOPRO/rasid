// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { breachRecords } from "@/lib/breachData";
import * as analytics from "@/lib/breachAnalytics";
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";
import { exportElementToPdf } from "@/lib/pdfExport";
import { Link } from "wouter";
import { Award, Users, Building, Siren, ShieldAlert, FileText, TrendingUp, Target, Scale, CheckCircle, Download, Loader2 } from 'lucide-react';

const COLORS = ["#3DB1AC", "#6459A7", "#273470", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const KpiCard = ({ title, value, icon: Icon, unit = '' }) => (
  <GlassCard className="flex flex-col justify-between">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-slate-300">{title}</h3>
      <Icon className="text-slate-400" size={28} />
    </div>
    <p className="text-4xl font-bold text-white mt-4">{value} <span className="text-2xl text-slate-300">{unit}</span></p>
  </GlassCard>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-white/20 p-3 rounded-lg text-white">
        <p className="label">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function ExecutiveBrief() {
  const { filteredRecords } = useFilters();
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const summary = useMemo(() => analytics.getExecutiveSummary(filteredRecords), [filteredRecords]);
  const severityData = useMemo(() => analytics.getSeverityBreakdown(filteredRecords), [filteredRecords]);
  const topSectors = useMemo(() => analytics.getSectorBreakdown(filteredRecords).slice(0, 5), [filteredRecords]);
  const topActors = useMemo(() => analytics.getThreatActorProfiles(filteredRecords).slice(0, 5), [filteredRecords]);
  const topRecommendations = useMemo(() => analytics.getRecommendationFrequency(filteredRecords).slice(0, 5), [filteredRecords]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(value);
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportElementToPdf('executive-brief-content', {
        filename: `rasid-executive-brief-${new Date().toISOString().slice(0, 10)}.pdf`,
        orientation: 'portrait',
        onProgress: (stage) => setExportStatus(stage),
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      setExportStatus('فشل التصدير');
    } finally {
      setExporting(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[300px]">
          <GlobalFilterBar />
        </div>
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3DB1AC] hover:bg-[#2d9a95] text-white font-medium text-sm transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? exportStatus || 'جاري التصدير...' : 'تصدير PDF'}
        </button>
      </div>

      <div id="executive-brief-content" className="p-8 bg-slate-900 text-white rounded-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">الملخص التنفيذي</h1>
          <p className="text-xl text-slate-300">Executive Brief</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
          <KpiCard title="إجمالي الحوادث" value={summary.totalIncidents} icon={Siren} />
          <KpiCard title="إجمالي ادعاءات البائع" value={new Intl.NumberFormat().format(summary.totalRecords)} icon={FileText} />
          <KpiCard title="القطاعات المتأثرة" value={summary.totalSectors} icon={Building} />
          <KpiCard title="الجهات المهاجمة" value={summary.totalActors} icon={Users} />
          <KpiCard title="أنواع البيانات" value={summary.totalPiiTypes} icon={ShieldAlert} />
          <KpiCard title="الغرامات التقديرية" value={formatCurrency(summary.estimatedFines)} icon={Scale} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <GlassCard className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">توزيع مستوى التأثير</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={severityData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" labelLine={false}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value, entry) => <span className="text-slate-300">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">أبرز 5 قطاعات مستهدفة</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSectors} layout="vertical" margin={{ right: 20, left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} tick={{ fill: '#cbd5e1' }} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(100,116,139,0.2)'}} />
                <Bar dataKey="count" fill="#3DB1AC" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <GlassCard className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">أبرز 5 جهات مهاجمة</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topActors} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#cbd5e1' }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(100,116,139,0.2)'}} />
                <Bar dataKey="count" fill="#6459A7" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">أهم التوصيات</h2>
            <ul className="space-y-4">
              {topRecommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="text-green-400 mt-1 mr-3 flex-shrink-0" size={20} />
                  <span className="text-slate-200">{rec.name} ({rec.count})</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        <GlassCard>
          <h2 className="text-2xl font-semibold mb-4 text-cyan-300">النتائج الرئيسية</h2>
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
            <p>
              يُظهر التحليل الشامل لحالات الرصد المسجلة وجود <strong className="text-amber-400">{summary.totalIncidents}</strong> حادثة، أثرت على ما مجموعه <strong className="text-amber-400">{new Intl.NumberFormat().format(summary.totalRecords)}</strong> سجل. القطاع الأكثر استهدافًا هو <strong className="text-cyan-400">{summary.topSector.name}</strong>، بينما كانت الجهة المهاجمة الأكثر نشاطًا هي <strong className="text-red-400">{summary.topAttacker.name}</strong>. تم تصنيف <strong className="text-red-500">{summary.criticalCount}</strong> حوادث على أنها عالية الأهمية و <strong className="text-orange-500">{summary.highCount}</strong> على أنها عالية مستوى التأثير، مما يستدعي اهتمامًا فوريًا. المنصة الأكثر شيوعًا كمصدر للحالات رصد كانت <strong className="text-purple-400">{summary.topPlatform.name}</strong>، والأسلوب الهجومي الأكثر استخدامًا هو <strong className="text-indigo-400">{summary.topMethod.name}</strong>. إجمالي الغرامات التقديرية لمخالفات نظام حماية البيانات الشخصية تصل إلى <strong className="text-amber-400">{formatCurrency(summary.estimatedFines)}</strong>، مما يؤكد على الأثر المالي الكبير لهذه الحوادث.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
