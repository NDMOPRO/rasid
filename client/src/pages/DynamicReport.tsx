import { useState, useCallback, useEffect } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, GripVertical, FileText, Download, Eye, Settings,
  Type, BarChart3, Table2, Image, ChevronUp, ChevronDown,
  Sparkles, Save, Printer, FileDown, AlignRight, AlignCenter,
  Heading1, Heading2, List, ListOrdered, Quote, Minus
} from "lucide-react";
import { trpc } from "../lib/trpc";

// Report section types
const SECTION_TYPES = [
  {
    id: "heading",
    icon: Heading1,
    title: "عنوان رئيسي",
    description: "عنوان كبير لقسم جديد",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "subheading",
    icon: Heading2,
    title: "عنوان فرعي",
    description: "عنوان أصغر لقسم فرعي",
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "paragraph",
    icon: Type,
    title: "فقرة نصية",
    description: "نص حر قابل للتعديل",
    color: "from-slate-500 to-slate-600",
  },
  {
    id: "stat-summary",
    icon: BarChart3,
    title: "ملخص إحصائي",
    description: "كروت أرقام رئيسية",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "chart",
    icon: BarChart3,
    title: "رسم بياني",
    description: "مخطط بيانات تفاعلي",
    color: "from-emerald-500 to-green-600",
  },
  {
    id: "table",
    icon: Table2,
    title: "جدول بيانات",
    description: "جدول مع صفوف وأعمدة",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "image",
    icon: Image,
    title: "صورة / لقطة",
    description: "صورة أو لقطة شاشة",
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "quote",
    icon: Quote,
    title: "اقتباس",
    description: "نص مقتبس أو ملاحظة مهمة",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "divider",
    icon: Minus,
    title: "فاصل",
    description: "خط فاصل بين الأقسام",
    color: "from-gray-500 to-gray-600",
  },
  {
    id: "bullet-list",
    icon: List,
    title: "قائمة نقطية",
    description: "قائمة بنقاط",
    color: "from-teal-500 to-cyan-600",
  },
  {
    id: "numbered-list",
    icon: ListOrdered,
    title: "قائمة مرقمة",
    description: "قائمة بأرقام",
    color: "from-sky-500 to-blue-600",
  },
];

interface ReportSection {
  instanceId: string;
  typeId: string;
  content: string;
  config: Record<string, any>;
}

export default function DynamicReport() {
  const params = useParams<{ id: string }>();
  const pageId = params?.id ? parseInt(params.id) : null;

  const [sections, setSections] = useState<ReportSection[]>([]);
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);

  const pageQuery = pageId ? trpc.customPages.getById.useQuery({ id: pageId }) : null;
  const updatePage = trpc.customPages.update.useMutation();
  const pageTitle = pageQuery?.data?.title || "تقرير جديد";

  // Load saved sections from config when page data arrives
  useEffect(() => {
    if (pageQuery?.data?.config) {
      const config = pageQuery.data.config as Record<string, any>;
      if (Array.isArray(config.sections) && config.sections.length > 0) {
        setSections(config.sections);
        setIsEditMode(false);
      }
    }
  }, [pageQuery?.data]);

  const handleSave = async () => {
    if (!pageId) return;
    await updatePage.mutateAsync({
      id: pageId,
      config: { sections },
    });
  };

  const addSection = (type: typeof SECTION_TYPES[0], index?: number) => {
    const newSection: ReportSection = {
      instanceId: `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      typeId: type.id,
      content: "",
      config: {},
    };
    if (index !== undefined && index !== null) {
      setSections(prev => [...prev.slice(0, index + 1), newSection, ...prev.slice(index + 1)]);
    } else {
      setSections(prev => [...prev, newSection]);
    }
    setShowSectionPicker(false);
    setInsertIndex(null);
  };

  const removeSection = (instanceId: string) => {
    setSections(prev => prev.filter(s => s.instanceId !== instanceId));
  };

  const moveSection = (instanceId: string, direction: "up" | "down") => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.instanceId === instanceId);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;
      const newArr = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
      return newArr;
    });
  };

  const updateSectionContent = (instanceId: string, content: string) => {
    setSections(prev => prev.map(s => s.instanceId === instanceId ? { ...s, content } : s));
  };

  const renderSectionContent = (section: ReportSection) => {
    const sectionType = SECTION_TYPES.find(t => t.id === section.typeId);
    if (!sectionType) return null;

    switch (section.typeId) {
      case "heading":
        return isEditMode ? (
          <input
            type="text"
            value={section.content}
            onChange={(e) => updateSectionContent(section.instanceId, e.target.value)}
            placeholder="اكتب العنوان الرئيسي..."
            className="w-full text-2xl font-bold text-white bg-transparent border-none outline-none placeholder:text-slate-600"
            dir="rtl"
          />
        ) : (
          <h1 className="text-2xl font-bold text-white">{section.content || "عنوان رئيسي"}</h1>
        );

      case "subheading":
        return isEditMode ? (
          <input
            type="text"
            value={section.content}
            onChange={(e) => updateSectionContent(section.instanceId, e.target.value)}
            placeholder="اكتب العنوان الفرعي..."
            className="w-full text-lg font-semibold text-slate-200 bg-transparent border-none outline-none placeholder:text-slate-600"
            dir="rtl"
          />
        ) : (
          <h2 className="text-lg font-semibold text-slate-200">{section.content || "عنوان فرعي"}</h2>
        );

      case "paragraph":
        return isEditMode ? (
          <textarea
            value={section.content}
            onChange={(e) => updateSectionContent(section.instanceId, e.target.value)}
            placeholder="اكتب النص هنا..."
            className="w-full min-h-[100px] text-sm text-slate-300 bg-transparent border-none outline-none placeholder:text-slate-600 resize-y leading-relaxed"
            dir="rtl"
          />
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{section.content || "فقرة نصية..."}</p>
        );

      case "stat-summary":
        return (
          <div className="overflow-x-hidden max-w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-slate-500 text-xs mt-1">مؤشر {i}</p>
              </div>
            ))}
          </div>
        );

      case "chart":
        return (
          <div className="h-48 rounded-xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">رسم بياني</p>
              {isEditMode && <button className="text-cyan-400 text-xs mt-1 hover:underline">تخصيص البيانات</button>}
            </div>
          </div>
        );

      case "table":
        return (
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/30 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">العمود 1</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">العمود 2</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-slate-400">العمود 3</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-600 text-sm">لا توجد بيانات</td></tr>
              </tbody>
            </table>
          </div>
        );

      case "image":
        return (
          <div className="h-48 rounded-xl bg-slate-800/50 border-2 border-dashed border-slate-700/50 flex items-center justify-center">
            <div className="text-center">
              <Image className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">اسحب صورة هنا أو اضغط للاختيار</p>
            </div>
          </div>
        );

      case "quote":
        return isEditMode ? (
          <div className="border-r-4 border-violet-500 pr-4">
            <textarea
              value={section.content}
              onChange={(e) => updateSectionContent(section.instanceId, e.target.value)}
              placeholder="اكتب الاقتباس..."
              className="w-full min-h-[60px] text-sm text-slate-300 italic bg-transparent border-none outline-none placeholder:text-slate-600 resize-y"
              dir="rtl"
            />
          </div>
        ) : (
          <blockquote className="border-r-4 border-violet-500 pr-4 text-sm text-slate-300 italic">
            {section.content || "اقتباس..."}
          </blockquote>
        );

      case "divider":
        return <hr className="border-slate-700/50 my-2" />;

      case "bullet-list":
      case "numbered-list":
        return isEditMode ? (
          <textarea
            value={section.content}
            onChange={(e) => updateSectionContent(section.instanceId, e.target.value)}
            placeholder="اكتب كل عنصر في سطر..."
            className="w-full min-h-[80px] text-sm text-slate-300 bg-transparent border-none outline-none placeholder:text-slate-600 resize-y"
            dir="rtl"
          />
        ) : (
          section.typeId === "bullet-list" ? (
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1" dir="rtl">
              {(section.content || "عنصر 1\nعنصر 2").split("\n").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1" dir="rtl">
              {(section.content || "عنصر 1\nعنصر 2").split("\n").map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          )
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{pageTitle}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {sections.length} قسم • {isEditMode ? "وضع التعديل" : "وضع المعاينة"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditMode && (
            <>
              <button
                onClick={() => { setInsertIndex(null); setShowSectionPicker(true); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                إضافة قسم
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
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">
            <FileDown className="w-4 h-4" />
            تصدير PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">
            <Printer className="w-4 h-4" />
            طباعة
          </button>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isEditMode
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {isEditMode ? <Eye className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            {isEditMode ? "معاينة" : "تعديل"}
          </button>
        </div>
      </div>

      {/* Report Content */}
      {sections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32"
        >
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center mb-6">
            <FileText className="w-12 h-12 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">تقرير فارغ</h3>
          <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
            ابدأ بإضافة أقسام لبناء التقرير. اضغط "إضافة قسم" واختر النوع المطلوب.
          </p>
          <button
            onClick={() => setShowSectionPicker(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-violet-500/25 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            إضافة قسم
          </button>
          {/* Templates */}
          <div className="mt-8 w-full max-w-2xl">
            <p className="text-slate-500 text-xs text-center mb-4">أو اختر من النماذج الجاهزة</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "تقرير تنفيذي", desc: "ملخص للقيادة", icon: "📋" },
                { name: "تقرير تحليلي", desc: "تحليل مفصل", icon: "📊" },
                { name: "تقرير شهري", desc: "مراجعة شهرية", icon: "📅" },
              ].map((template) => (
                <button
                  key={template.name}
                  onClick={() => {
                    const templateSections: ReportSection[] = [
                      { instanceId: `t-${Date.now()}-1`, typeId: "heading", content: pageTitle, config: {} },
                      { instanceId: `t-${Date.now()}-2`, typeId: "paragraph", content: "ملخص تنفيذي للتقرير...", config: {} },
                      { instanceId: `t-${Date.now()}-3`, typeId: "stat-summary", content: "", config: {} },
                      { instanceId: `t-${Date.now()}-4`, typeId: "divider", content: "", config: {} },
                      { instanceId: `t-${Date.now()}-5`, typeId: "subheading", content: "التفاصيل", config: {} },
                      { instanceId: `t-${Date.now()}-6`, typeId: "chart", content: "", config: {} },
                      { instanceId: `t-${Date.now()}-7`, typeId: "table", content: "", config: {} },
                      { instanceId: `t-${Date.now()}-8`, typeId: "divider", content: "", config: {} },
                      { instanceId: `t-${Date.now()}-9`, typeId: "subheading", content: "التوصيات", config: {} },
                      { instanceId: `t-${Date.now()}-10`, typeId: "bullet-list", content: "توصية 1\nتوصية 2\nتوصية 3", config: {} },
                    ];
                    setSections(templateSections);
                  }}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/30 hover:bg-slate-800 transition-all text-right"
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
        <div className="max-w-[95vw] sm:max-w-4xl mx-auto space-y-1">
          <AnimatePresence>
            {sections.map((section, index) => {
              const sectionType = SECTION_TYPES.find(t => t.id === section.typeId);
              const Icon = sectionType?.icon || Type;
              return (
                <motion.div
                  key={section.instanceId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="group relative"
                >
                  {/* Section */}
                  <div className="flex gap-2">
                    {/* Controls */}
                    {isEditMode && (
                      <div className="flex flex-col items-center gap-0.5 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveSection(section.instanceId, "up")} className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-700">
                          <ChevronUp className="w-3 h-3 text-slate-500" />
                        </button>
                        <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />
                        <button onClick={() => moveSection(section.instanceId, "down")} className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-700">
                          <ChevronDown className="w-3 h-3 text-slate-500" />
                        </button>
                        <button onClick={() => removeSection(section.instanceId)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/20 mt-1">
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    )}

                    {/* Content */}
                    <div className={`flex-1 p-4 rounded-xl transition-all ${
                      isEditMode ? "hover:bg-slate-800/30 border border-transparent hover:border-slate-700/30" : ""
                    }`}>
                      {renderSectionContent(section)}
                    </div>
                  </div>

                  {/* Insert between sections */}
                  {isEditMode && (
                    <div className="flex items-center justify-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setInsertIndex(index); setShowSectionPicker(true); }}
                        className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 hover:border-violet-500/50 flex items-center justify-center hover:bg-violet-500/20 transition-all"
                      >
                        <Plus className="w-3 h-3 text-slate-500 hover:text-violet-400" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Section Picker Modal */}
      <AnimatePresence>
        {showSectionPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={() => setShowSectionPicker(false)}
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">إضافة قسم</h2>
                    <p className="text-slate-400 text-xs">{SECTION_TYPES.length} نوع متاح</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSectionPicker(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="grid grid-cols-2 gap-3">
                  {SECTION_TYPES.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addSection(type, insertIndex ?? undefined)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/30 transition-all text-right group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center flex-shrink-0`}>
                        <type.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold">{type.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">{type.description}</p>
                      </div>
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
