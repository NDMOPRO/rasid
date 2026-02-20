import { useState, useCallback } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Settings, GripVertical, Filter, Search, Download,
  SortAsc, SortDesc, Eye, EyeOff, Columns, Table2, Sparkles,
  ChevronDown, ArrowUpDown, FileSpreadsheet, Trash2, Check
} from "lucide-react";
import { trpc } from "../lib/trpc";

// Available columns that can be added to the table
const AVAILABLE_COLUMNS = {
  leaks: [
    { id: "id", label: "المعرف", labelEn: "ID", type: "number", category: "أساسي" },
    { id: "title", label: "العنوان", labelEn: "Title", type: "text", category: "أساسي" },
    { id: "status", label: "الحالة", labelEn: "Status", type: "badge", category: "أساسي" },
    { id: "severity", label: "مستوى التأثير", labelEn: "Severity", type: "badge", category: "أساسي" },
    { id: "source", label: "المصدر", labelEn: "Source", type: "text", category: "مصادر" },
    { id: "platform", label: "المنصة", labelEn: "Platform", type: "text", category: "مصادر" },
    { id: "recordCount", label: "العدد المُدّعى", labelEn: "Claimed Count", type: "number", category: "بيانات" },
    { id: "piiTypes", label: "أنواع البيانات الشخصية", labelEn: "PII Types", type: "tags", category: "بيانات" },
    { id: "affectedSectors", label: "القطاعات المتأثرة", labelEn: "Affected Sectors", type: "tags", category: "بيانات" },
    { id: "discoveredAt", label: "تاريخ الاكتشاف", labelEn: "Discovered At", type: "date", category: "تواريخ" },
    { id: "reportedAt", label: "تاريخ البلاغ", labelEn: "Reported At", type: "date", category: "تواريخ" },
    { id: "assignedTo", label: "المسؤول", labelEn: "Assigned To", type: "text", category: "فريق" },
    { id: "verificationStatus", label: "حالة التحقق", labelEn: "Verification", type: "badge", category: "فريق" },
    { id: "samples", label: "العينات المتاحة", labelEn: "Samples", type: "boolean", category: "بيانات" },
    { id: "askingPrice", label: "السعر المطلوب", labelEn: "Asking Price", type: "currency", category: "بيانات" },
    { id: "seller", label: "البائع", labelEn: "Seller", type: "text", category: "مصادر" },
  ],
  privacy: [
    { id: "id", label: "المعرف", labelEn: "ID", type: "number", category: "أساسي" },
    { id: "domain", label: "النطاق", labelEn: "Domain", type: "text", category: "أساسي" },
    { id: "siteName", label: "اسم الموقع", labelEn: "Site Name", type: "text", category: "أساسي" },
    { id: "complianceStatus", label: "حالة الامتثال", labelEn: "Compliance", type: "badge", category: "أساسي" },
    { id: "score", label: "النتيجة", labelEn: "Score", type: "number", category: "أساسي" },
    { id: "sectorType", label: "نوع القطاع", labelEn: "Sector Type", type: "badge", category: "تصنيف" },
    { id: "category", label: "الفئة", labelEn: "Category", type: "text", category: "تصنيف" },
    { id: "classification", label: "التصنيف", labelEn: "Classification", type: "text", category: "تصنيف" },
    { id: "clause1", label: "بند 1", labelEn: "Clause 1", type: "boolean", category: "بنود المادة 12" },
    { id: "clause2", label: "بند 2", labelEn: "Clause 2", type: "boolean", category: "بنود المادة 12" },
    { id: "clause3", label: "بند 3", labelEn: "Clause 3", type: "boolean", category: "بنود المادة 12" },
    { id: "clause4", label: "بند 4", labelEn: "Clause 4", type: "boolean", category: "بنود المادة 12" },
    { id: "clause5", label: "بند 5", labelEn: "Clause 5", type: "boolean", category: "بنود المادة 12" },
    { id: "clause6", label: "بند 6", labelEn: "Clause 6", type: "boolean", category: "بنود المادة 12" },
    { id: "clause7", label: "بند 7", labelEn: "Clause 7", type: "boolean", category: "بنود المادة 12" },
    { id: "clause8", label: "بند 8", labelEn: "Clause 8", type: "boolean", category: "بنود المادة 12" },
    { id: "lastScan", label: "آخر فحص", labelEn: "Last Scan", type: "date", category: "تواريخ" },
    { id: "screenshot", label: "لقطة الشاشة", labelEn: "Screenshot", type: "image", category: "أساسي" },
  ],
};

interface SelectedColumn {
  id: string;
  label: string;
  visible: boolean;
  width: number;
  sortDirection?: "asc" | "desc" | null;
}

export default function DynamicTable() {
  const params = useParams<{ id: string }>();
  const pageId = params?.id ? parseInt(params.id) : null;

  const [selectedColumns, setSelectedColumns] = useState<SelectedColumn[]>([]);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [columnFilter, setColumnFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(true);
  const [workspace] = useState<"leaks" | "privacy">(
    (localStorage.getItem("rasid_workspace") || "leaks") as "leaks" | "privacy"
  );

  const pageQuery = pageId ? trpc.customPages.getById.useQuery({ id: pageId }) : null;
  const pageTitle = pageQuery?.data?.title || "جدول بيانات جديد";

  // Fetch real data from DB
  const tableDataQuery = trpc.cms.widgetData.useQuery(
    { widgetType: "data-table", workspace },
    { staleTime: 30000, refetchOnWindowFocus: false, enabled: selectedColumns.length > 0 }
  );

  const availableColumns = AVAILABLE_COLUMNS[workspace];
  const categories = ["all", ...new Set(availableColumns.map(c => c.category))];
  const filteredColumns = columnFilter === "all"
    ? availableColumns
    : availableColumns.filter(c => c.category === columnFilter);

  const addColumn = (col: typeof availableColumns[0]) => {
    if (selectedColumns.find(c => c.id === col.id)) return;
    setSelectedColumns(prev => [...prev, {
      id: col.id,
      label: col.label,
      visible: true,
      width: 150,
    }]);
  };

  const removeColumn = (colId: string) => {
    setSelectedColumns(prev => prev.filter(c => c.id !== colId));
  };

  const toggleColumnVisibility = (colId: string) => {
    setSelectedColumns(prev => prev.map(c =>
      c.id === colId ? { ...c, visible: !c.visible } : c
    ));
  };

  const toggleSort = (colId: string) => {
    setSelectedColumns(prev => prev.map(c =>
      c.id === colId
        ? { ...c, sortDirection: c.sortDirection === "asc" ? "desc" : c.sortDirection === "desc" ? null : "asc" }
        : c
    ));
  };

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {selectedColumns.length} عمود محدد • {selectedColumns.filter(c => c.visible).length} ظاهر
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode && (
            <button
              onClick={() => setShowColumnPicker(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <Columns className="w-4 h-4" />
              إضافة أعمدة
            </button>
          )}
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            تصدير
          </button>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isEditMode
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {isEditMode ? <Eye className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            {isEditMode ? "معاينة" : "تعديل"}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {selectedColumns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-500/20 flex items-center justify-center mb-6">
            <Table2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">جدول فارغ</h3>
          <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
            ابدأ بإضافة أعمدة لبناء الجدول الخاص بك. اضغط على "إضافة أعمدة" واختر البيانات المطلوبة.
          </p>
          <button
            onClick={() => setShowColumnPicker(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105"
          >
            <Columns className="w-5 h-5" />
            إضافة أعمدة
          </button>
          {/* Quick templates */}
          <div className="mt-8 w-full max-w-2xl">
            <p className="text-slate-500 text-xs text-center mb-4">أو اختر من النماذج الجاهزة</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "جدول أساسي", desc: "الأعمدة الأساسية", cols: ["id", "title", "status", "severity", "discoveredAt"] },
                { name: "جدول المصادر", desc: "تفاصيل المصادر", cols: ["id", "title", "source", "platform", "seller", "askingPrice"] },
                { name: "جدول البيانات", desc: "تحليل البيانات", cols: ["id", "title", "recordCount", "piiTypes", "affectedSectors", "samples"] },
              ].map((template) => (
                <button
                  key={template.name}
                  onClick={() => {
                    const cols = template.cols.map(colId => {
                      const col = availableColumns.find(c => c.id === colId);
                      return col ? { id: col.id, label: col.label, visible: true, width: 150 } : null;
                    }).filter(Boolean) as SelectedColumn[];
                    setSelectedColumns(cols);
                  }}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800 transition-all text-right"
                >
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400 mb-2" />
                  <p className="text-white text-sm font-semibold">{template.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{template.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Search & Filters Bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في الجدول..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                dir="rtl"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-700 transition-colors">
              <Filter className="w-4 h-4" />
              فلاتر
            </button>
          </div>

          {/* Selected Columns Bar (Edit Mode) */}
          {isEditMode && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-slate-500 text-xs">الأعمدة:</span>
              {selectedColumns.map(col => (
                <div
                  key={col.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/50 text-sm group"
                >
                  <GripVertical className="w-3 h-3 text-slate-600 cursor-grab" />
                  <span className={col.visible ? "text-white" : "text-slate-500 line-through"}>{col.label}</span>
                  <button
                    onClick={() => toggleColumnVisibility(col.id)}
                    className="w-4 h-4 flex items-center justify-center"
                  >
                    {col.visible ? (
                      <Eye className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-slate-600" />
                    )}
                  </button>
                  <button
                    onClick={() => removeColumn(col.id)}
                    className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowColumnPicker(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-slate-700/50 text-slate-500 text-sm hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
              >
                <Plus className="w-3 h-3" />
                إضافة
              </button>
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl overflow-hidden border border-slate-700/30" style={{ background: "rgba(15, 23, 42, 0.8)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {selectedColumns.filter(c => c.visible).map(col => (
                      <th
                        key={col.id}
                        className="px-4 py-3 text-right text-xs font-semibold text-slate-400 cursor-pointer hover:text-white transition-colors"
                        onClick={() => toggleSort(col.id)}
                      >
                        <div className="flex items-center gap-1.5 justify-end">
                          {col.sortDirection === "asc" && <SortAsc className="w-3 h-3 text-emerald-400" />}
                          {col.sortDirection === "desc" && <SortDesc className="w-3 h-3 text-emerald-400" />}
                          {!col.sortDirection && <ArrowUpDown className="w-3 h-3 text-slate-600" />}
                          {col.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableDataQuery.isLoading ? (
                    <tr>
                      <td colSpan={selectedColumns.filter(c => c.visible).length} className="px-4 py-12 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-slate-400 text-sm">جاري تحميل البيانات...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (() => {
                    const rows = (tableDataQuery.data?.data as any)?.rows || [];
                    if (rows.length === 0) {
                      return (
                        <tr>
                          <td colSpan={selectedColumns.filter(c => c.visible).length} className="px-4 py-16 text-center">
                            <p className="text-slate-500 text-sm">لا توجد بيانات بعد</p>
                            <p className="text-slate-600 text-xs mt-1">قم بتغذية المنصة ببيانات عبر صفحة الاستيراد</p>
                          </td>
                        </tr>
                      );
                    }
                    return rows.map((row: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        {selectedColumns.filter(c => c.visible).map(col => (
                          <td key={col.id} className="px-4 py-3 text-sm text-slate-300 truncate max-w-[200px]">
                            {row[col.id] !== undefined && row[col.id] !== null
                              ? typeof row[col.id] === "object"
                                ? JSON.stringify(row[col.id])
                                : String(row[col.id])
                              : "—"}
                          </td>
                        ))}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Column Picker Modal */}
      <AnimatePresence>
        {showColumnPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={() => setShowColumnPicker(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg mx-4 max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                border: "1px solid rgba(148, 163, 184, 0.15)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between flex-wrap p-5 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <Columns className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">اختيار الأعمدة</h2>
                    <p className="text-slate-400 text-xs">{availableColumns.length} عمود متاح</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowColumnPicker(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-700/30 overflow-x-auto">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setColumnFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      columnFilter === cat
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat === "all" ? "الكل" : cat}
                  </button>
                ))}
              </div>

              {/* Columns List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-2">
                {filteredColumns.map(col => {
                  const isSelected = selectedColumns.some(c => c.id === col.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => isSelected ? removeColumn(col.id) : addColumn(col)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-right ${
                        isSelected
                          ? "bg-emerald-500/10 border border-emerald-500/30"
                          : "bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/20"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        isSelected ? "bg-emerald-500" : "bg-slate-700"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-white text-sm font-medium">{col.label}</span>
                        <span className="text-slate-500 text-xs mr-2">{col.labelEn}</span>
                      </div>
                      <span className="text-slate-600 text-xs">{col.type}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
