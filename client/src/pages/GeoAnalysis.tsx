// @ts-nocheck
import React, { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Treemap, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Map, MapPin, Target } from 'lucide-react';
import { breachRecords } from '@/lib/breachData';
import * as analytics from '@/lib/breachAnalytics';
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";

const COLORS = ["#3DB1AC", "#6459A7", "#273470", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const regionKeywords = {
  'Riyadh': ['Riyadh', 'الرياض'],
  'Makkah': ['Makkah', 'مكة', 'Jeddah', 'جدة'],
  'Eastern Province': ['Dammam', 'الدمام', 'Khobar', 'الخبر', 'Dhahran', 'الظهران', 'Eastern', 'الشرقية'],
  'Madinah': ['Madinah', 'المدينة المنورة'],
  'Asir': ['Asir', 'عسير', 'Abha', 'أبها'],
  'Tabuk': ['Tabuk', 'تبوك'],
  'Qassim': ['Qassim', 'القصيم', 'Buraidah', 'بريدة'],
  'Jazan': ['Jazan', 'جازان'],
  'Hail': ['Hail', 'حائل'],
  'Najran': ['Najran', 'نجران'],
  'Al Jouf': ['Al Jouf', 'الجوف', 'Sakaka', 'سكاكا'],
  'Al Baha': ['Al Baha', 'الباحة'],
  'Northern Borders': ['Northern Borders', 'الحدود الشمالية', 'Arar', 'عرعر'],
};

const getRegionFromRecord = (record) => {
  const searchText = `${record.victim} ${record.sector}`.toLowerCase();
  for (const region in regionKeywords) {
    if (regionKeywords[region].some(keyword => searchText.includes(keyword.toLowerCase()))) {
      return region;
    }
  }
  return 'غير محدد'; // Unspecified
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="overflow-x-hidden max-w-full bg-slate-900/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-white text-sm">
      <div className="mb-4"><GlobalFilterBar /></div>
        <p className="font-bold">{label || data.name}</p>
        {Object.entries(data).map(([key, value]) => {
          if (key !== 'name' && key !== 'children' && key !== 'value') {
            return <p key={key}>{`${key}: ${value}`}</p>;
          }
          return null;
        })}
        <p>العدد: {data.value || data.count}</p>
      </div>
    );
  }
  return null;
};

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const KpiCard = ({ title, value, icon: Icon }) => (
  <GlassCard className="flex flex-col justify-between">
    <div className="flex justify-between items-center">
      <h3 className="text-lg text-slate-300">{title}</h3>
      <Icon className="text-amber-400" size={28} />
    </div>
    <p className="text-2xl sm:text-4xl font-bold text-white mt-4">{value}</p>
  </GlassCard>
);

export default function GeoAnalysis() {
  const { filteredRecords } = useFilters();
  const geoData = useMemo(() => {
    const regionCounts = filteredRecords.reduce((acc, record) => {
      const region = getRegionFromRecord(record);
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    const mostTargeted = Object.entries(regionCounts).reduce((a, b) => b[1] > a[1] ? b : a, ['N/A', 0]);
    
    return {
      totalRegions: Object.keys(regionCounts).filter(r => r !== 'غير محدد').length,
      mostTargetedRegion: mostTargeted[0],
    };
  }, [filteredRecords]);

  const sectorsByCategory = useMemo(() => {
    const sectorData = analytics.getSectorBreakdown(filteredRecords);
    const categoryMap = {};
    filteredRecords.forEach(rec => {
      if (!categoryMap[rec.sector]) {
        categoryMap[rec.sector] = rec.category;
      }
    });

    const grouped = sectorData.reduce((acc, sector) => {
      const category = categoryMap[sector.name] || 'غير مصنف';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ name: sector.name, count: sector.count });
      return acc;
    }, {});

    return Object.entries(grouped).map(([category, sectors]) => ({ category, ...sectors.reduce((acc, s) => ({...acc, [s.name]: s.count}), {}) }));
  }, [filteredRecords]);

  const categoryTreemapData = useMemo(() => {
    const categoryCounts = filteredRecords.reduce((acc, record) => {
      const category = record.category || 'غير مصنف';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(categoryCounts).map(([name, count]) => ({ name, size: count }));
  }, [filteredRecords]);

  const sensitivityData = useMemo(() => {
    const sensitivityCounts = filteredRecords.reduce((acc, record) => {
      const sensitivity = record.data_sensitivity || 'غير محدد';
      acc[sensitivity] = (acc[sensitivity] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(sensitivityCounts).map(([name, value]) => ({ name, value }));
  }, [filteredRecords]);

  const allSectors = useMemo(() => [...new Set(sectorsByCategory.flatMap(d => Object.keys(d).filter(k => k !== 'category')))], [sectorsByCategory]);

  return (
    <div dir="rtl" className="p-3 sm:p-8 text-white min-h-screen bg-slate-900">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold">التحليل الجغرافي</h1>
        <p className="text-slate-400 text-lg">Geographic Analysis</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard title="إجمالي المناطق المتأثرة" value={geoData.totalRegions} icon={Map} />
        <KpiCard title="المنطقة الأكثر استهدافاً" value={geoData.mostTargetedRegion} icon={Target} />
        <KpiCard title="إجمالي الحوادث" value={filteredRecords.length} icon={MapPin} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <GlassCard>
          <h2 className="text-2xl font-bold mb-4">القطاعات حسب الفئة</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sectorsByCategory} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis type="category" dataKey="category" stroke="#94a3b8" width={100} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
              <Legend />
              {allSectors.map((sector, i) => (
                <Bar key={sector} dataKey={sector} stackId="a" fill={COLORS[i % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <h2 className="text-2xl font-bold mb-4">فئات الحوادث</h2>
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={categoryTreemapData}
              dataKey="size"
              ratio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent colors={COLORS} />}
            />
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">توزيع حساسية البيانات</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={sensitivityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {sensitivityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}

const CustomizedContent = ({ root, depth, x, y, width, height, index, colors, name }) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#1e293b',
          strokeWidth: 2,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 + 7}
        textAnchor="middle"
        fill="#fff"
        fontSize={14}
      >
        {name}
      </text>
    </g>
  );
};