// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { breachRecords } from '@/lib/breachData';
import { Link, useLocation } from 'wouter';
import { Search, ChevronDown, BarChart, PieChart, LineChart, AlertTriangle, ShieldCheck, Database, Calendar, Users, Building, Target } from 'lucide-react';
import { useFilters } from "@/contexts/FilterContext";
import GlobalFilterBar from "@/components/GlobalFilterBar";

const IncidentsRegistry = () => {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sector: 'all',
    severity: 'all',
    platform: 'all',
    startDate: '',
    endDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const uniqueSectors = useMemo(() => [...new Set(breachRecords.map(r => r.sector))], []);
  const uniqueSeverities = useMemo(() => [...new Set(breachRecords.map(r => r.overview.severity))], []);
  const uniquePlatforms = useMemo(() => [...new Set(breachRecords.map(r => r.overview.source_platform))], []);

  const filteredData = useMemo(() => {
    return breachRecords.filter(record => {
      const recordDate = new Date(record.date);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      return (
        (searchTerm === '' ||
          record.title_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.victim.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filters.sector === 'all' || record.sector === filters.sector) &&
        (filters.severity === 'all' || record.overview.severity === filters.severity) &&
        (filters.platform === 'all' || record.overview.source_platform === filters.platform) &&
        (!startDate || recordDate >= startDate) &&
        (!endDate || recordDate <= endDate)
      );
    });
  }, [searchTerm, filters]);

  const totalFilteredRecords = useMemo(() => {
    return filteredData.reduce((acc, record) => acc + record.overview.exposed_records, 0);
  }, [filteredData]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatNumber = (num) => new Intl.NumberFormat('ar-SA').format(num);

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 border-red-400';
      case 'High': return 'text-amber-400 border-amber-400';
      case 'Medium': return 'text-yellow-400 border-yellow-400';
      case 'Low': return 'text-sky-400 border-sky-400';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 text-white p-3 sm:p-8 font-sans">
      <div className="mb-4"><GlobalFilterBar /></div>
      <header className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-cyan-400">سجل الحالات المتقدم</h1>
        <p className="text-slate-400">Advanced Incidents Registry</p>
      </header>

      {/* Filters Section */}
      <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="ابحث في الحوادث..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
          {/* Other filters */}
          <div className="relative">
            <select name="sector" value={filters.sector} onChange={handleFilterChange} className="w-full appearance-none bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="all">كل القطاعات</option>
              {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
          <div className="relative">
            <select name="severity" value={filters.severity} onChange={handleFilterChange} className="w-full appearance-none bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="all">كل المستويات</option>
              {uniqueSeverities.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
          <div className="relative">
            <select name="platform" value={filters.platform} onChange={handleFilterChange} className="w-full appearance-none bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="all">كل المنصات</option>
              {uniquePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between flex-wrap bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8">
        <div>
          <span className="text-slate-400">الحوادث المعروضة: </span>
          <span className="font-bold text-cyan-400 text-lg">{formatNumber(filteredData.length)}</span>
        </div>
        <div>
          <span className="text-slate-400">إجمالي ادعاءات البائع: </span>
          <span className="font-bold text-amber-400 text-lg">{formatNumber(totalFilteredRecords)}</span>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedData.map(record => (
          <Link key={record.id} href={`/incident/${record.id}`}>
            <a className="block bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-100 mb-2 flex-1" style={{ minHeight: '56px' }}>{record.title_ar}</h3>
                <span className={`text-xs font-bold border rounded-full px-2 py-0.5 ${getSeverityClass(record.overview.severity)}`}>{record.overview.severity}</span>
              </div>
              <div className="text-slate-400 space-y-3 text-sm mt-4">
                <div className="flex items-center"><Building size={16} className="ml-2 text-cyan-400" /><span>{record.sector}</span></div>
                <div className="flex items-center"><Calendar size={16} className="ml-2 text-cyan-400" /><span>{new Date(record.date).toLocaleDateString('ar-SA')}</span></div>
                <div className="flex items-center"><Database size={16} className="ml-2 text-cyan-400" /><span>{record.overview.source_platform}</span></div>
                <div className="flex items-center"><Users size={16} className="ml-2 text-amber-400" /><span>{formatNumber(record.overview.exposed_records)} سجل</span></div>
                <div className="flex items-center"><Target size={16} className="ml-2 text-red-400" /><span>{record.data_types_count} نوع بيانات</span></div>
              </div>
            </a>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-4">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            السابق
          </button>
          <span className="text-slate-300">صفحة {currentPage} من {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default IncidentsRegistry;