import { useState, useCallback } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Plus, GripVertical, X, Settings, Maximize2, Minimize2,
  BarChart3, PieChart, TrendingUp, Activity, Globe, Users,
  Shield, AlertTriangle, Database, Eye, FileText, Hash,
  ChevronDown, Check, Palette, Save, RotateCcw, Sparkles,
  LayoutGrid, List, Layers
} from "lucide-react";
import { trpc } from "../lib/trpc";

// Widget types available for drag-and-drop
const WIDGET_CATALOG = [
  {
    id: "stat-card",
    category: "إحصائيات",
    categoryEn: "Statistics",
    icon: Hash,
    title: "كرت إحصائي",
    description: "رقم كبير مع عنوان ومؤشر تغيير",
    defaultSize: "small",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "bar-chart",
    category: "رسوم بيانية",
    categoryEn: "Charts",
    icon: BarChart3,
    title: "رسم أعمدة",
    description: "مخطط أعمدة للمقارنة بين القيم",
    defaultSize: "medium",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "pie-chart",
    category: "رسوم بيانية",
    categoryEn: "Charts",
    icon: PieChart,
    title: "رسم دائري",
    description: "مخطط دائري لتوزيع النسب",
    defaultSize: "medium",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "line-chart",
    category: "رسوم بيانية",
    categoryEn: "Charts",
    icon: TrendingUp,
    title: "رسم خطي",
    description: "مخطط خطي لعرض الاتجاهات",
    defaultSize: "medium",
    color: "from-emerald-500 to-green-600",
  },
  {
    id: "live-feed",
    category: "مباشر",
    categoryEn: "Live",
    icon: Activity,
    title: "تغذية مباشرة",
    description: "عرض آخر الأحداث والتنبيهات",
    defaultSize: "large",
    color: "from-red-500 to-rose-600",
  },
  {
    id: "map-widget",
    category: "خرائط",
    categoryEn: "Maps",
    icon: Globe,
    title: "خريطة تفاعلية",
    description: "خريطة جغرافية مع نقاط بيانات",
    defaultSize: "large",
    color: "from-teal-500 to-cyan-600",
  },
  {
    id: "progress-ring",
    category: "إحصائيات",
    categoryEn: "Statistics",
    icon: PieChart,
    title: "حلقة تقدم",
    description: "نسبة مئوية في شكل حلقة",
    defaultSize: "small",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "data-table",
    category: "جداول",
    categoryEn: "Tables",
    icon: List,
    title: "جدول مصغر",
    description: "جدول بيانات مختصر",
    defaultSize: "large",
    color: "from-slate-500 to-gray-600",
  },
  {
    id: "status-grid",
    category: "حالات",
    categoryEn: "Status",
    icon: LayoutGrid,
    title: "شبكة حالات",
    description: "عرض حالات متعددة في شبكة",
    defaultSize: "medium",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "source-breakdown",
    category: "تحليل",
    categoryEn: "Analysis",
    icon: Layers,
    title: "توزيع المصادر",
    description: "تحليل المصادر مع أشرطة تقدم",
    defaultSize: "medium",
    color: "from-sky-500 to-blue-600",
  },
];

interface PlacedWidget {
  instanceId: string;
  widgetId: string;
  title: string;
  size: "small" | "medium" | "large";
  config: Record<string, any>;
}

const SIZE_CLASSES = {
  small: "col-span-1",
  medium: "col-span-2",
  large: "col-span-3",
};

const SIZE_LABELS = {
  small: "صغير (1/4)",
  medium: "متوسط (1/2)",
  large: "كبير (3/4)",
};

export default function DynamicDashboard() {
  const params = useParams<{ id: string }>();
  const pageId = params?.id ? parseInt(params.id) : null;

  const [widgets, setWidgets] = useState<PlacedWidget[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [catalogFilter, setCatalogFilter] = useState<string>("all");
  const [isEditMode, setIsEditMode] = useState(true);

  // Get page data if we have an ID
  const pageQuery = pageId ? trpc.customPages.getById.useQuery({ id: pageId }) : null;
  const updatePage = trpc.customPages.update.useMutation();

  const pageTitle = pageQuery?.data?.title || "لوحة مؤشرات جديدة";

  const addWidget = useCallback((catalogItem: typeof WIDGET_CATALOG[0]) => {
    const newWidget: PlacedWidget = {
      instanceId: `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      widgetId: catalogItem.id,
      title: catalogItem.title,
      size: catalogItem.defaultSize as "small" | "medium" | "large",
      config: {},
    };
    setWidgets(prev => [...prev, newWidget]);
    setShowCatalog(false);
  }, []);

  const removeWidget = useCallback((instanceId: string) => {
    setWidgets(prev => prev.filter(w => w.instanceId !== instanceId));
  }, []);

  const resizeWidget = useCallback((instanceId: string, size: "small" | "medium" | "large") => {
    setWidgets(prev => prev.map(w => w.instanceId === instanceId ? { ...w, size } : w));
  }, []);

  const handleSave = async () => {
    if (!pageId) return;
    await updatePage.mutateAsync({
      id: pageId,
      config: { widgets },
    });
  };

  const categories = ["all", ...new Set(WIDGET_CATALOG.map(w => w.category))];

  const filteredCatalog = catalogFilter === "all"
    ? WIDGET_CATALOG
    : WIDGET_CATALOG.filter(w => w.category === catalogFilter);

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {widgets.length} عنصر • {isEditMode ? "وضع التعديل" : "وضع العرض"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode && (
            <>
              <button
                onClick={() => setShowCatalog(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                إضافة عنصر
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                حفظ
              </button>
            </>
          )}
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

      {/* Widgets Grid */}
      {widgets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">لوحة فارغة</h3>
          <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
            ابدأ بإضافة عناصر لبناء لوحة المؤشرات الخاصة بك. اضغط على "إضافة عنصر" واختر من الكتالوج.
          </p>
          <button
            onClick={() => setShowCatalog(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            إضافة عنصر
          </button>
          {/* Templates */}
          <div className="mt-8 w-full max-w-2xl">
            <p className="text-slate-500 text-xs text-center mb-4">أو اختر من النماذج الجاهزة</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "لوحة قيادية", desc: "مؤشرات عامة للقيادة", icon: "📊" },
                { name: "لوحة تشغيلية", desc: "مؤشرات الفريق التشغيلي", icon: "⚙️" },
                { name: "لوحة تحليلية", desc: "تحليلات متقدمة", icon: "🔬" },
              ].map((template) => (
                <button
                  key={template.name}
                  onClick={() => {
                    // Load template widgets
                    const templateWidgets: PlacedWidget[] = [
                      { instanceId: `t-${Date.now()}-1`, widgetId: "stat-card", title: "إجمالي الحالات", size: "small", config: {} },
                      { instanceId: `t-${Date.now()}-2`, widgetId: "stat-card", title: "حالات جديدة", size: "small", config: {} },
                      { instanceId: `t-${Date.now()}-3`, widgetId: "stat-card", title: "نسبة الإنجاز", size: "small", config: {} },
                      { instanceId: `t-${Date.now()}-4`, widgetId: "line-chart", title: "الاتجاه الشهري", size: "medium", config: {} },
                      { instanceId: `t-${Date.now()}-5`, widgetId: "pie-chart", title: "التوزيع", size: "medium", config: {} },
                      { instanceId: `t-${Date.now()}-6`, widgetId: "source-breakdown", title: "المصادر", size: "medium", config: {} },
                    ];
                    setWidgets(templateWidgets);
                  }}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 hover:bg-slate-800 transition-all text-right group"
                >
                  <span className="text-2xl">{template.icon}</span>
                  <p className="text-white text-sm font-semibold mt-2">{template.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{template.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 auto-rows-[200px]">
          <AnimatePresence>
            {widgets.map((widget) => {
              const catalogItem = WIDGET_CATALOG.find(c => c.id === widget.widgetId);
              const Icon = catalogItem?.icon || BarChart3;
              return (
                <motion.div
                  key={widget.instanceId}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`${SIZE_CLASSES[widget.size]} rounded-xl overflow-hidden relative group`}
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                  }}
                >
                  {/* Widget Header */}
                  <div className="flex items-center justify-between flex-wrap p-4 border-b border-slate-700/30">
                    <div className="flex items-center gap-2">
                      {isEditMode && (
                        <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                      )}
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${catalogItem?.color || "from-cyan-500 to-blue-600"} flex items-center justify-center`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-white text-sm font-semibold">{widget.title}</span>
                    </div>
                    {isEditMode && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Size toggle */}
                        <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
                          {(["small", "medium", "large"] as const).map(s => (
                            <button
                              key={s}
                              onClick={() => resizeWidget(widget.instanceId, s)}
                              className={`px-2 py-1 rounded text-xs transition-colors ${
                                widget.size === s
                                  ? "bg-cyan-500 text-white"
                                  : "text-slate-400 hover:text-white"
                              }`}
                            >
                              {s === "small" ? "S" : s === "medium" ? "M" : "L"}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => removeWidget(widget.instanceId)}
                          className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Widget Body - Placeholder */}
                  <div className="flex-1 p-4 flex items-center justify-center">
                    <div className="text-center">
                      <Icon className={`w-10 h-10 mx-auto mb-2 text-slate-600`} />
                      <p className="text-slate-500 text-xs">{catalogItem?.description}</p>
                      {isEditMode && (
                        <button className="mt-2 text-cyan-400 text-xs hover:underline">
                          تخصيص البيانات
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add Widget Card */}
          {isEditMode && (
            <motion.button
              layout
              onClick={() => setShowCatalog(true)}
              className="col-span-1 rounded-xl border-2 border-dashed border-slate-700/50 hover:border-cyan-500/30 flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-800/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <span className="text-slate-500 group-hover:text-slate-300 text-sm transition-colors">إضافة عنصر</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Widget Catalog Modal */}
      <AnimatePresence>
        {showCatalog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={() => setShowCatalog(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl mx-4 max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                border: "1px solid rgba(148, 163, 184, 0.15)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap p-5 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <LayoutGrid className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">كتالوج العناصر</h2>
                    <p className="text-slate-400 text-xs">{WIDGET_CATALOG.length} عنصر متاح</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCatalog(false)}
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
                    onClick={() => setCatalogFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      catalogFilter === cat
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat === "all" ? "الكل" : cat}
                  </button>
                ))}
              </div>

              {/* Catalog Grid */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-2 gap-3">
                  {filteredCatalog.map((item) => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addWidget(item)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-all text-right group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">{item.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">{item.description}</p>
                      </div>
                      <Plus className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
