/**
 * AddPageButton — Premium "+" button for sidebar
 * Opens CreatePageModal to create new dynamic pages
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutDashboard, Table2, FileText, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface AddPageButtonProps {
  collapsed: boolean;
  onCreatePage: (pageType: "dashboard" | "table" | "report", title: string) => void;
  accent: string;
}

const PAGE_TYPES = [
  {
    type: "dashboard" as const,
    icon: LayoutDashboard,
    title: "لوحة مؤشرات",
    titleEn: "Dashboard",
    color: "#3DB1AC",
  },
  {
    type: "table" as const,
    icon: Table2,
    title: "جدول بيانات",
    titleEn: "Data Table",
    color: "#22c55e",
  },
  {
    type: "report" as const,
    icon: FileText,
    title: "تقرير",
    titleEn: "Report",
    color: "#f59e0b",
  },
];

export default function AddPageButton({ collapsed, onCreatePage, accent }: AddPageButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedType, setSelectedType] = useState<"dashboard" | "table" | "report" | null>(null);
  const [pageName, setPageName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowNameInput(false);
        setSelectedType(null);
        setPageName("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when name input shows
  useEffect(() => {
    if (showNameInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNameInput]);

  const handleSelectType = (type: "dashboard" | "table" | "report") => {
    setSelectedType(type);
    setShowNameInput(true);
  };

  const handleCreate = () => {
    if (!selectedType || !pageName.trim()) return;
    onCreatePage(selectedType, pageName.trim());
    setShowDropdown(false);
    setShowNameInput(false);
    setSelectedType(null);
    setPageName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreate();
    if (e.key === "Escape") {
      setShowDropdown(false);
      setShowNameInput(false);
      setSelectedType(null);
      setPageName("");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The "+" Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setShowDropdown(!showDropdown);
          setShowNameInput(false);
          setSelectedType(null);
          setPageName("");
        }}
        className={`
          w-full flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
          transition-all duration-200 group relative
          ${isDark
            ? "text-[#3DB1AC]/70 hover:text-[#3DB1AC] hover:bg-[rgba(61,177,172,0.08)] border border-dashed border-[rgba(61,177,172,0.2)] hover:border-[rgba(61,177,172,0.4)]"
            : "text-[#1e3a8a]/60 hover:text-[#1e3a8a] hover:bg-[rgba(30,58,138,0.04)] border border-dashed border-[rgba(30,58,138,0.15)] hover:border-[rgba(30,58,138,0.3)]"
          }
        `}
      >
        <div className={`
          w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0
          ${isDark ? "bg-[rgba(61,177,172,0.15)]" : "bg-[rgba(30,58,138,0.08)]"}
        `}>
          <Plus className="w-3.5 h-3.5" />
        </div>
        {!collapsed && (
          <span className="text-[12px] font-medium">إنشاء صفحة</span>
        )}
        {collapsed && (
          <div className={`absolute right-14 ${isDark ? 'bg-[rgba(26,37,80,0.95)] text-[#E1DEF5] border-[rgba(61,177,172,0.15)]' : 'bg-white text-[#1c2833] border-[#e2e5ef]'} backdrop-blur-xl text-xs py-1.5 px-3 rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border`}>
            إنشاء صفحة
          </div>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`
              absolute z-[60] mt-1 rounded-xl overflow-hidden shadow-2xl
              ${collapsed ? "right-0 w-64" : "right-0 left-0"}
            `}
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))"
                : "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))",
              border: isDark
                ? "1px solid rgba(61, 177, 172, 0.15)"
                : "1px solid rgba(30, 58, 138, 0.1)",
              backdropFilter: "blur(20px)",
              boxShadow: isDark
                ? "0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(61,177,172,0.05)"
                : "0 20px 40px rgba(0,0,0,0.1)",
            }}
          >
            {!showNameInput ? (
              <>
                {/* Header */}
                <div className={`px-3 py-2.5 border-b ${isDark ? "border-slate-700/50" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
                    <span className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      صفحة جديدة
                    </span>
                  </div>
                </div>

                {/* Page Type Options */}
                <div className="p-1.5 space-y-0.5">
                  {PAGE_TYPES.map((pt, i) => (
                    <motion.button
                      key={pt.type}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSelectType(pt.type)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-150 group/item
                        ${isDark
                          ? "hover:bg-white/[0.06] text-slate-300 hover:text-white"
                          : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                        }
                      `}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110"
                        style={{ backgroundColor: `${pt.color}1A` }}
                      >
                        <pt.icon className="w-4 h-4" style={{ color: pt.color }} />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-[13px] font-semibold">{pt.title}</div>
                        <div className={`text-[10px] ${isDark ? "text-slate-500" : "text-gray-400"}`}>
                          {pt.titleEn}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Name Input Step */}
                <div className={`px-3 py-2.5 border-b ${isDark ? "border-slate-700/50" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2">
                    {selectedType && (
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${PAGE_TYPES.find(p => p.type === selectedType)?.color}1A` }}
                      >
                        {selectedType === "dashboard" && <LayoutDashboard className="w-3 h-3" style={{ color: PAGE_TYPES[0].color }} />}
                        {selectedType === "table" && <Table2 className="w-3 h-3" style={{ color: PAGE_TYPES[1].color }} />}
                        {selectedType === "report" && <FileText className="w-3 h-3" style={{ color: PAGE_TYPES[2].color }} />}
                      </div>
                    )}
                    <span className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {PAGE_TYPES.find(p => p.type === selectedType)?.title}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اسم الصفحة..."
                    dir="rtl"
                    className={`
                      w-full px-3 py-2 rounded-lg text-sm
                      ${isDark
                        ? "bg-slate-800/80 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-[rgba(61,177,172,0.4)]"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[rgba(30,58,138,0.3)]"
                      }
                      border focus:outline-none focus:ring-1 focus:ring-opacity-20 transition-all
                    `}
                    style={{ 
                      // @ts-ignore
                      '--tw-ring-color': accent,
                    } as React.CSSProperties}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowNameInput(false);
                        setSelectedType(null);
                        setPageName("");
                      }}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      }`}
                    >
                      رجوع
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!pageName.trim()}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all ${
                        pageName.trim()
                          ? "hover:shadow-lg hover:scale-[1.02]"
                          : "opacity-40 cursor-not-allowed"
                      }`}
                      style={{
                        backgroundColor: pageName.trim() ? accent : isDark ? "#334155" : "#d1d5db",
                      }}
                    >
                      إنشاء
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
