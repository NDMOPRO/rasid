import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutDashboard, Table2, FileText, Sparkles, ChevronRight } from "lucide-react";

interface CreatePageModalProps {
  open: boolean;
  onClose: () => void;
  onCreatePage: (pageType: "dashboard" | "table" | "report", title: string) => void;
  workspace: string;
}

const PAGE_TYPES = [
  {
    type: "dashboard" as const,
    icon: LayoutDashboard,
    title: "لوحة مؤشرات",
    titleEn: "Dashboard",
    description: "أنشئ لوحة مؤشرات مخصصة بالسحب والإفلات",
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-400",
  },
  {
    type: "table" as const,
    icon: Table2,
    title: "جدول بيانات",
    titleEn: "Data Table",
    description: "اختر الأعمدة والفلاتر وأنشئ عرض مخصص",
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-400",
  },
  {
    type: "report" as const,
    icon: FileText,
    title: "تقرير",
    titleEn: "Report",
    description: "أنشئ تقرير ديناميكي مع أقسام قابلة للتخصيص",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    hoverBorder: "hover:border-amber-400",
  },
];

export default function CreatePageModal({ open, onClose, onCreatePage, workspace }: CreatePageModalProps) {
  const [step, setStep] = useState<"type" | "name">("type");
  const [selectedType, setSelectedType] = useState<"dashboard" | "table" | "report" | null>(null);
  const [title, setTitle] = useState("");

  const handleSelectType = (type: "dashboard" | "table" | "report") => {
    setSelectedType(type);
    setStep("name");
  };

  const handleCreate = () => {
    if (!selectedType || !title.trim()) return;
    onCreatePage(selectedType, title.trim());
    // Reset state
    setStep("type");
    setSelectedType(null);
    setTitle("");
    onClose();
  };

  const handleClose = () => {
    setStep("type");
    setSelectedType(null);
    setTitle("");
    onClose();
  };

  const selectedTypeInfo = PAGE_TYPES.find(p => p.type === selectedType);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
              border: "1px solid rgba(148, 163, 184, 0.15)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">
                    {step === "type" ? "إنشاء صفحة جديدة" : "تسمية الصفحة"}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {step === "type"
                      ? `${workspace === "leaks" ? "التسريبات" : "الخصوصية"} — اختر نوع الصفحة`
                      : `${selectedTypeInfo?.title} — أدخل اسم الصفحة`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                {step === "type" ? (
                  <motion.div
                    key="type-selection"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    {PAGE_TYPES.map((pt, i) => (
                      <motion.button
                        key={pt.type}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleSelectType(pt.type)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border ${pt.borderColor} ${pt.hoverBorder} ${pt.bgColor} transition-all duration-300 group hover:scale-[1.02]`}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pt.color} flex items-center justify-center shadow-lg`}>
                          <pt.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-slate-500 text-xs">{pt.titleEn}</span>
                            <span className="text-white font-bold text-base">{pt.title}</span>
                          </div>
                          <p className="text-slate-400 text-sm mt-1">{pt.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors rotate-180" />
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="name-input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Selected type preview */}
                    {selectedTypeInfo && (
                      <div className={`flex items-center gap-3 p-3 rounded-xl ${selectedTypeInfo.bgColor} border ${selectedTypeInfo.borderColor}`}>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedTypeInfo.color} flex items-center justify-center`}>
                          <selectedTypeInfo.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold text-sm">{selectedTypeInfo.title}</span>
                          <p className="text-slate-400 text-xs">{selectedTypeInfo.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Name input */}
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2 text-right">
                        اسم الصفحة
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        placeholder="مثال: لوحة المؤشرات الرئيسية"
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-white text-right placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                        dir="rtl"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => { setStep("type"); setSelectedType(null); setTitle(""); }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                      >
                        رجوع
                      </button>
                      <button
                        onClick={handleCreate}
                        disabled={!title.trim()}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all ${
                          title.trim()
                            ? `bg-gradient-to-r ${selectedTypeInfo?.color} hover:shadow-lg hover:scale-[1.02]`
                            : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        إنشاء الصفحة
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
