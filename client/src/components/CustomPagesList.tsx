/**
 * CustomPagesList — Renders user-created pages in the sidebar
 * Shows icons based on page type, with context menu for rename/delete
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Table2, FileText, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { CustomPage } from "@/hooks/useCustomPages";

interface CustomPagesListProps {
  pages: CustomPage[];
  collapsed: boolean;
  accent: string;
  accentBg: string;
  accentBorder: string;
  searchQuery?: string;
  onDeletePage: (id: number) => void;
  onRenamePage: (id: number, newTitle: string) => void;
  onNavClick: () => void;
  isDeleting: boolean;
}

const PAGE_TYPE_ICONS: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  table: Table2,
  report: FileText,
};

const PAGE_TYPE_COLORS: Record<string, string> = {
  dashboard: "#3DB1AC",
  table: "#22c55e",
  report: "#f59e0b",
};

export default function CustomPagesList({
  pages,
  collapsed,
  accent,
  accentBg,
  accentBorder,
  searchQuery = "",
  onDeletePage,
  onRenamePage,
  onNavClick,
  isDeleting,
}: CustomPagesListProps) {
  const [location] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [contextMenu, setContextMenu] = useState<{ id: number; x: number; y: number } | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const contextRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus rename input
  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  const getPagePath = (page: CustomPage) => {
    return `/custom/${page.pageType}/${page.id}`;
  };

  const handleContextMenu = (e: React.MouseEvent, pageId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ id: pageId, x: e.clientX, y: e.clientY });
  };

  const startRename = (page: CustomPage) => {
    setRenamingId(page.id);
    setRenameValue(page.title);
    setContextMenu(null);
  };

  const confirmRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenamePage(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  };

  if (pages.length === 0) return null;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visiblePages = normalizedQuery
    ? pages.filter((page) =>
        page.title.toLowerCase().includes(normalizedQuery) ||
        page.pageType.toLowerCase().includes(normalizedQuery)
      )
    : pages;

  if (visiblePages.length === 0) {
    return (
      <div
        className={`px-3 py-2.5 text-[11px] rounded-lg border ${
          isDark
            ? "text-slate-300/70 border-white/10 bg-white/[0.02]"
            : "text-[#5a6478] border-[#e6ebf5] bg-[#f8faff]"
        }`}
      >
        لا توجد صفحات مطابقة للبحث.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <AnimatePresence>
        {visiblePages.map((page, index) => {
          const Icon = PAGE_TYPE_ICONS[page.pageType] || LayoutDashboard;
          const typeColor = PAGE_TYPE_COLORS[page.pageType] || accent;
          const pagePath = getPagePath(page);
          const isActive = location === pagePath;

          return (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.03 }}
            >
              {renamingId === page.id ? (
                <div className="px-3 py-1.5">
                  <input
                    ref={renameRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename();
                      if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); }
                    }}
                    onBlur={confirmRename}
                    dir="rtl"
                    className={`
                      w-full px-2 py-1 rounded text-[13px] font-medium
                      ${isDark
                        ? "bg-slate-800 border-[rgba(61,177,172,0.3)] text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                      }
                      border focus:outline-none focus:ring-1 transition-all
                    `}
                    style={{ '--tw-ring-color': accent } as React.CSSProperties}
                  />
                </div>
              ) : (
                <Link href={pagePath} onClick={onNavClick}>
                  <motion.div
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onContextMenu={(e) => handleContextMenu(e, page.id)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                      group relative transition-colors duration-150
                      ${isActive
                        ? isDark
                          ? "border border-[rgba(61,177,172,0.25)]"
                          : "border border-[rgba(30,58,138,0.12)]"
                        : isDark
                          ? "text-sidebar-foreground/60 hover:text-sidebar-foreground/80 hover:bg-white/[0.03]"
                          : "text-[#5a6478] hover:text-[#1c2833] hover:bg-black/[0.02]"
                      }
                    `}
                    style={isActive ? { backgroundColor: accentBg, borderColor: accentBorder } : undefined}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeCustomNav"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full"
                        style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}66` }}
                      />
                    )}

                    {/* Icon */}
                    <div className="sidebar-nav-icon">
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        style={isActive ? { color: typeColor } : { color: `${typeColor}80` }}
                      />
                    </div>

                    {/* Label */}
                    {!collapsed && (
                      <span className="text-[13px] font-medium whitespace-nowrap truncate flex-1">
                        {page.title}
                      </span>
                    )}

                    {/* More button (on hover) */}
                    {!collapsed && (
                      <button
                        aria-label="خيارات الصفحة"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleContextMenu(e, page.id);
                        }}
                        className={`
                          w-5 h-5 rounded flex items-center justify-center flex-shrink-0
                          opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity
                          ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}
                        `}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </button>
                    )}

                    {/* Collapsed tooltip */}
                    {collapsed && (
                      <div className={`absolute right-14 ${isDark ? 'bg-[rgba(26,37,80,0.95)] text-[#E1DEF5] border-[rgba(61,177,172,0.15)]' : 'bg-white text-[#1c2833] border-[#e2e5ef]'} backdrop-blur-xl text-xs py-1.5 px-3 rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border`}>
                        {page.title}
                      </div>
                    )}
                  </motion.div>
                </Link>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[100] rounded-lg overflow-hidden shadow-2xl"
            style={{
              top: contextMenu.y,
              left: contextMenu.x - 160,
              width: 160,
              background: isDark
                ? "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))"
                : "rgba(255,255,255,0.98)",
              border: isDark
                ? "1px solid rgba(61, 177, 172, 0.15)"
                : "1px solid rgba(0,0,0,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <button
              onClick={() => {
                const page = pages.find(p => p.id === contextMenu.id);
                if (page) startRename(page);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                isDark ? "text-slate-300 hover:bg-white/[0.06] hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Pencil className="w-3 h-3" />
              <span>إعادة تسمية</span>
            </button>
            <button
              onClick={() => {
                onDeletePage(contextMenu.id);
                setContextMenu(null);
              }}
              disabled={isDeleting}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
              }`}
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              <span>حذف</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
