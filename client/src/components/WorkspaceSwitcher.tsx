/**
 * WorkspaceSwitcher — Professional workspace navigation for Rasid Platform
 * 4 workspaces: Leaks & Analytics, Monitoring, Platform Settings, Users & Training
 * Animated transitions, role-based visibility, localStorage persistence
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  ShieldAlert,
  Radar,
  Settings,
  GraduationCap,
  ChevronDown,
  Crown,
  Shield,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export type WorkspaceId = "leaks" | "privacy" | "monitoring" | "settings" | "users" | "admin";

export interface Workspace {
  id: WorkspaceId;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  description: string;
  color: string;
  colorLight: string;
  /** Only visible to admin users */
  adminOnly?: boolean;
  /** Only visible to root admin (mruhaily) */
  rootAdminOnly?: boolean;
}

export const workspaces: Workspace[] = [
  {
    id: "leaks",
    label: "الرصد والتحليلات",
    labelEn: "Leaks & Analytics",
    icon: ShieldAlert,
    description: "لوحة المؤشرات الرئيسية وتحليلات حالات الرصد",
    color: "rgba(61, 177, 172, 0.9)",
    colorLight: "rgba(30, 58, 138, 0.9)",
  },
  {
    id: "privacy",
    label: "الخصوصية",
    labelEn: "Privacy",
    icon: Shield,
    description: "رصد سياسة الخصوصية ولوحة القيادة",
    color: "rgba(34, 197, 94, 0.9)",
    colorLight: "rgba(22, 163, 74, 0.9)",
  },
  {
    id: "monitoring",
    label: "الرصد والمراقبة",
    labelEn: "Monitoring",
    icon: Radar,
    description: "أدوات الرصد المباشر ومصادر التهديدات",
    color: "rgba(100, 89, 167, 0.9)",
    colorLight: "rgba(124, 58, 237, 0.9)",
  },
  {
    id: "settings",
    label: "إعدادات المنصة",
    labelEn: "Platform Settings",
    icon: Settings,
    description: "إدارة العمليات والتقارير والتدقيق",
    color: "rgba(234, 179, 8, 0.9)",
    colorLight: "rgba(202, 138, 4, 0.9)",
    adminOnly: true,
  },
  {
    id: "users",
    label: "المستخدمين والتدريب",
    labelEn: "Users & Training",
    icon: GraduationCap,
    description: "إدارة المستخدمين وتدريب راصد الذكي",
    color: "rgba(239, 68, 68, 0.9)",
    colorLight: "rgba(220, 38, 38, 0.9)",
    rootAdminOnly: true,
  },
  {
    id: "admin",
    label: "لوحة التحكم",
    labelEn: "Admin Dashboard",
    icon: Crown,
    description: "إدارة الأدوار والصلاحيات والمظهر والقوائم",
    color: "rgba(168, 85, 247, 0.9)",
    colorLight: "rgba(147, 51, 234, 0.9)",
    rootAdminOnly: true,
  },
];

/** Map each route path to its workspace */
export const routeWorkspaceMap: Record<string, WorkspaceId> = {
  // ═══ Workspace: الخصوصية (Privacy) ═══
  "/": "privacy",
  "/leadership": "privacy",

  // ═══ Workspace 1: الرصد والتحليلات ═══
  "/smart-rasid": "leaks",
  "/national-overview": "leaks",
  "/leak-anatomy": "leaks",
  "/sector-analysis": "leaks",
  "/leak-timeline": "leaks",
  "/threat-actors-analysis": "leaks",
  "/impact-assessment": "leaks",
  "/source-intelligence": "leaks",
  "/geo-analysis": "leaks",
  "/executive-brief": "leaks",
  "/incident-compare": "leaks",
  "/campaign-tracker": "leaks",
  "/incidents-registry": "leaks",
  "/recommendations-hub": "leaks",
  "/pdpl-compliance": "leaks",
  "/leaks": "leaks",
  "/pii-atlas": "leaks",
  "/pii-classifier": "leaks",
  "/evidence-chain": "leaks",
  "/feedback-accuracy": "leaks",
  "/reports": "leaks",
  "/verify": "leaks",
  "/report-approval": "leaks",

  // ═══ Workspace 2: الرصد والمراقبة ═══
  "/live-scan": "monitoring",
  "/telegram": "monitoring",
  "/darkweb": "monitoring",
  "/paste-sites": "monitoring",
  "/osint-tools": "monitoring",
  "/threat-rules": "monitoring",
  "/knowledge-graph": "monitoring",
  "/threat-map": "monitoring",
  "/seller-profiles": "monitoring",

  // ═══ Rasid Platform Routes (التسريبات) ═══

  // ═══ Workspace 3: إعدادات المنصة ═══
  "/monitoring-jobs": "settings",
  "/alert-channels": "settings",
  "/scheduled-reports": "settings",
  "/api-keys": "settings",
  "/data-retention": "settings",
  "/audit-log": "settings",
  "/documents-registry": "settings",

  // ═══ Workspace 4: المستخدمين والتدريب ═══
  "/user-management": "users",
  "/knowledge-base": "users",
  "/personality-scenarios": "users",
  "/training-center": "users",

  // ═══ Workspace 5: لوحة التحكم ═══
  "/admin": "admin",
  "/admin/roles": "admin",
  "/admin/groups": "admin",
  "/admin/feature-flags": "admin",
  "/admin/audit-log": "admin",
  "/admin/theme": "admin",
  "/admin/menus": "admin",
};

/** Get workspace for a given route, handling dynamic routes like /incident/:id */
export function getWorkspaceForRoute(path: string): WorkspaceId {
  // Direct match
  if (routeWorkspaceMap[path]) return routeWorkspaceMap[path];
  // Dynamic routes
  if (path.startsWith("/incident/")) return "leaks";
  if (path.startsWith("/verify/")) return "leaks";
  if (path.startsWith("/admin")) return "admin";
  // Default
  return "leaks";
}

const STORAGE_KEY = "rasid-workspace";

interface WorkspaceSwitcherProps {
  collapsed: boolean;
  isAdmin: boolean;
  isRootAdmin: boolean;
  onWorkspaceChange?: (ws: WorkspaceId) => void;
}

export default function WorkspaceSwitcher({
  collapsed,
  isAdmin,
  isRootAdmin,
  onWorkspaceChange,
}: WorkspaceSwitcherProps) {
  const [location, navigate] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);

  // Determine active workspace from current route
  const activeWsId = getWorkspaceForRoute(location);
  const activeWs = workspaces.find((w) => w.id === activeWsId) || workspaces[0];

  // Filter visible workspaces based on role
  const visibleWorkspaces = workspaces.filter((ws) => {
    if (ws.rootAdminOnly && !isRootAdmin) return false;
    if (ws.adminOnly && !isAdmin) return false;
    return true;
  });

  const handleSelect = (ws: Workspace) => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, ws.id);
    onWorkspaceChange?.(ws.id);
    // Navigate to first page of workspace
    const firstRoute = Object.entries(routeWorkspaceMap).find(
      ([, wsId]) => wsId === ws.id
    );
    if (firstRoute && firstRoute[0] !== location) {
      navigate(firstRoute[0]);
    }
  };

  const ActiveIcon = activeWs.icon;
  const accentColor = isDark ? activeWs.color : activeWs.colorLight;

  if (collapsed) {
    // Collapsed: show only icon with color indicator
    return (
      <div className="relative px-2 py-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: `${accentColor.replace("0.9", "0.15")}`,
              border: `1px solid ${accentColor.replace("0.9", "0.3")}`,
            }}
          >
            <ActiveIcon
              className="w-5 h-5"
              style={{ color: accentColor }}
            />
          </div>
        </button>

        {/* Collapsed dropdown */}
        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                className={`absolute right-14 top-0 z-[70] w-64 rounded-xl shadow-2xl overflow-hidden ${
                  isDark
                    ? "bg-[rgba(13,21,41,0.95)] border border-[rgba(61,177,172,0.15)]"
                    : "bg-white border border-[#e2e5ef]"
                } backdrop-blur-xl`}
              >
                <div className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-[#D4DDEF]/40" : "text-[#5a6478]"}`}>
                  مساحات العمل
                </div>
                {visibleWorkspaces.map((ws) => {
                  const Icon = ws.icon;
                  const isActive = ws.id === activeWsId;
                  const wsColor = isDark ? ws.color : ws.colorLight;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => handleSelect(ws)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${
                        isActive
                          ? isDark
                            ? "bg-[rgba(61,177,172,0.08)]"
                            : "bg-[rgba(30,58,138,0.04)]"
                          : isDark
                          ? "hover:bg-[rgba(61,177,172,0.04)]"
                          : "hover:bg-[rgba(30,58,138,0.02)]"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${wsColor.replace("0.9", "0.12")}`,
                          border: `1px solid ${wsColor.replace("0.9", "0.25")}`,
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: wsColor }} />
                      </div>
                      <div className="text-right flex-1 min-w-0">
                        <p className={`text-xs font-medium ${isDark ? "text-[#D4DDEF]" : "text-[#1c2833]"}`}>
                          {ws.label}
                        </p>
                        <p className={`text-[10px] ${isDark ? "text-[#D4DDEF]/40" : "text-[#5a6478]"}`}>
                          {ws.labelEn}
                        </p>
                      </div>
                      {isActive && (
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: wsColor }}
                        />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded: full workspace selector
  return (
    <div className="relative px-3 py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
          isDark
            ? "hover:bg-[rgba(61,177,172,0.06)]"
            : "hover:bg-[rgba(30,58,138,0.03)]"
        }`}
        style={{
          background: `${accentColor.replace("0.9", "0.06")}`,
          border: `1px solid ${accentColor.replace("0.9", "0.15")}`,
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: `${accentColor.replace("0.9", "0.15")}`,
            boxShadow: `0 0 12px ${accentColor.replace("0.9", "0.15")}`,
          }}
        >
          <ActiveIcon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 text-right min-w-0">
          <p className={`text-[13px] font-bold ${isDark ? "text-[#D4DDEF]" : "text-[#1c2833]"} truncate`}>
            {activeWs.label}
          </p>
          <p className={`text-[10px] ${isDark ? "text-[#D4DDEF]/50" : "text-[#5a6478]"} truncate`}>
            {activeWs.labelEn}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isDark ? "text-[#D4DDEF]/40" : "text-[#5a6478]"}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className={`absolute right-3 left-3 top-full mt-1 z-[70] rounded-xl shadow-2xl overflow-hidden ${
                isDark
                  ? "bg-[rgba(13,21,41,0.97)] border border-[rgba(61,177,172,0.15)]"
                  : "bg-white border border-[#e2e5ef] shadow-lg"
              } backdrop-blur-xl`}
            >
              <div className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-[#D4DDEF]/40 border-b border-[rgba(61,177,172,0.08)]" : "text-[#5a6478] border-b border-[#edf0f7]"}`}>
                تبديل مساحة العمل
              </div>
              {visibleWorkspaces.map((ws) => {
                const Icon = ws.icon;
                const isActive = ws.id === activeWsId;
                const wsColor = isDark ? ws.color : ws.colorLight;
                return (
                  <motion.button
                    key={ws.id}
                    whileHover={{ x: -2 }}
                    onClick={() => handleSelect(ws)}
                    className={`w-full flex items-center gap-3 px-3 py-3 transition-all ${
                      isActive
                        ? isDark
                          ? "bg-[rgba(61,177,172,0.08)]"
                          : "bg-[rgba(30,58,138,0.04)]"
                        : isDark
                        ? "hover:bg-[rgba(61,177,172,0.04)]"
                        : "hover:bg-[rgba(30,58,138,0.02)]"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: isActive
                          ? `${wsColor.replace("0.9", "0.2")}`
                          : `${wsColor.replace("0.9", "0.08")}`,
                        border: `1px solid ${wsColor.replace("0.9", isActive ? "0.35" : "0.15")}`,
                        boxShadow: isActive ? `0 0 15px ${wsColor.replace("0.9", "0.2")}` : "none",
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: wsColor }}
                      />
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <p className={`text-[13px] font-medium ${isDark ? "text-[#D4DDEF]" : "text-[#1c2833]"}`}>
                        {ws.label}
                      </p>
                      <p className={`text-[10px] ${isDark ? "text-[#D4DDEF]/50" : "text-[#5a6478]"}`}>
                        {ws.description}
                      </p>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="wsIndicator"
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: wsColor, boxShadow: `0 0 8px ${wsColor}` }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
