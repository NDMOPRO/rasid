/**
 * GlobalFilterBar - Unified filter bar for all analytics pages
 * Provides time range, sector, severity, and platform filters
 */
import { useFilters } from "@/contexts/FilterContext";
import { breachRecords, allSectors, allSeverities, allPlatforms } from "@/lib/breachData";
import { Filter, RotateCcw, Calendar, Building2, Shield, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";

const timeRangeOptions = [
  { value: "all", label: "الكل" },
  { value: "last30", label: "30 يوم" },
  { value: "last90", label: "90 يوم" },
  { value: "last180", label: "180 يوم" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
];

export default function GlobalFilterBar() {
  const { filters, setFilters, filteredRecords, resetFilters } = useFilters();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const total = breachRecords.length;
  const filtered = filteredRecords.length;
  const isFiltered = filters.timeRange !== "all" || filters.sector !== "all" || filters.severity !== "all" || filters.platform !== "all";

  const selectClass = `text-xs rounded-lg px-2 py-1.5 border outline-none cursor-pointer ${isDark ? "bg-[rgba(13,21,41,0.6)] border-[rgba(61,177,172,0.2)] text-white" : "bg-white border-[#e2e5ef] text-gray-800"}`;

  return (
    <div className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border ${isDark ? "bg-[rgba(13,21,41,0.4)] border-[rgba(61,177,172,0.1)]" : "bg-white/80 border-[#e2e5ef]"} backdrop-blur-sm`} dir="rtl">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Filter className="w-3.5 h-3.5 text-[#3DB1AC]" />
        <span className="font-medium">فلترة</span>
      </div>

      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3 text-muted-foreground" />
        <select className={selectClass} value={filters.timeRange} onChange={(e) => setFilters((prev) => ({ ...prev, timeRange: e.target.value }))}>
          {timeRangeOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <Building2 className="w-3 h-3 text-muted-foreground" />
        <select className={selectClass} value={filters.sector} onChange={(e) => setFilters((prev) => ({ ...prev, sector: e.target.value }))}>
          <option value="all">كل القطاعات</option>
          {allSectors.sort().map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <Shield className="w-3 h-3 text-muted-foreground" />
        <select className={selectClass} value={filters.severity} onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}>
          <option value="all">كل المستويات</option>
          {allSeverities.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <Globe className="w-3 h-3 text-muted-foreground" />
        <select className={selectClass} value={filters.platform} onChange={(e) => setFilters((prev) => ({ ...prev, platform: e.target.value }))}>
          <option value="all">كل المنصات</option>
          {allPlatforms.map((p) => (<option key={p} value={p}>{p}</option>))}
        </select>
      </div>

      <Badge variant="outline" className={`text-[10px] ${isFiltered ? "border-[#f59e0b] text-[#f59e0b]" : "border-[#3DB1AC] text-[#3DB1AC]"}`}>
        {filtered}/{total} حادثة
      </Badge>

      {isFiltered && (
        <button onClick={resetFilters} className="flex items-center gap-1 text-[10px] text-[#ef4444] hover:text-[#dc2626] transition-colors">
          <RotateCcw className="w-3 h-3" />
          إعادة تعيين
        </button>
      )}
    </div>
  );
}
