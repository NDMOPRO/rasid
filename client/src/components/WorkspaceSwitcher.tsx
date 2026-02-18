/**
 * WorkspaceSwitcher — Professional workspace navigation for Rasid Platform
 * 2 main workspaces: الخصوصية (Privacy) + حالات الرصد (Incidents)
 * Shared section always visible + admin section for authorized users
 * Animated transitions, role-based visibility, localStorage persistence
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Shield,
  Eye,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export type WorkspaceId = "privacy" | "leaks" | "shared" | "admin";

export interface Workspace {
  id: WorkspaceId;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  description: string;
  color: string;
  colorLight: string;
  adminOnly?: boolean;
  rootAdminOnly?: boolean;
}

export const workspaces: Workspace[] = [
  {
    id: "privacy",
    label: "الخصوصية",
    labelEn: "Privacy",
    icon: Shield,
    description: "رصد سياسات الخصوصية والامتثال للمادة 12",
    color: "rgba(34, 197, 94, 0.9)",
    colorLight: "rgba(22, 163, 74, 0.9)",
  },
  {
    id: "leaks",
    label: "حالات الرصد",
    labelEn: "Monitoring Cases",
    icon: Eye,
    description: "لوحة حالات الرصد والتحليلات",
    color: "rgba(61, 177, 172, 0.9)",
    colorLight: "rgba(30, 58, 138, 0.9)",
  },
];

/** Map each route path to its workspace */
export const routeWorkspaceMap: Record<string, WorkspaceId> = {
  // ═══ Shared routes (always visible) ═══
  "/": "shared",
  "/my-custom-dashboard": "shared",
  "/cases": "shared",
  "/reports": "shared",
  "/smart-rasid": "shared",
  "/verify": "shared",
  "/documents-registry": "shared",
  "/document-stats": "shared",
  "/notifications": "shared",
  "/activity-logs": "shared",
  "/profile": "shared",
  "/change-password": "shared",
  "/members": "shared",
  "/settings": "shared",
  "/user-management": "shared",

  // ═══ Admin routes ═══
  "/admin": "admin",
  "/admin/roles": "admin",
  "/admin/groups": "admin",
  "/admin/feature-flags": "admin",
  "/admin/audit-log": "admin",
  "/admin/theme": "admin",
  "/admin/menus": "admin",
  "/admin-panel": "admin",
  "/super-admin": "admin",
  "/system-health": "admin",
  "/api-keys": "admin",
  "/data-retention": "admin",
  "/audit-log": "admin",
  "/monitoring-jobs": "admin",
  "/alert-channels": "admin",
  "/usage-analytics": "admin",
  "/scenario-management": "admin",
  "/ai-management": "admin",
  "/knowledge-base": "admin",
  "/personality-scenarios": "admin",
  "/training-center": "admin",

  // ═══ Privacy workspace ═══
  "/leadership": "privacy",
  "/sites": "privacy",
  "/change-detection": "privacy",
  "/clauses": "privacy",
  "/scan": "privacy",
  "/batch-scan": "privacy",
  "/scan-history": "privacy",
  "/scan-library": "privacy",
  "/scan-schedules": "privacy",
  "/advanced-scan": "privacy",
  "/deep-scan": "privacy",
  "/compliance-comparison": "privacy",
  "/compliance-heatmap": "privacy",
  "/advanced-analytics": "privacy",
  "/kpi-dashboard": "privacy",
  "/time-comparison": "privacy",
  "/sector-comparison": "privacy",
  "/interactive-comparison": "privacy",
  "/strategy-coverage": "privacy",
  "/real-time": "privacy",
  "/custom-reports": "privacy",
  "/scheduled-reports": "privacy",
  "/pdf-reports": "privacy",
  "/executive-report": "privacy",
  "/letters": "privacy",
  "/improvement-tracker": "privacy",
  "/export-data": "privacy",
  "/presentation": "privacy",
  "/presentation-builder": "privacy",
  "/bulk-analysis": "privacy",
  "/advanced-search": "privacy",
  "/smart-alerts": "privacy",
  "/visual-alerts": "privacy",
  "/email-notifications": "privacy",
  "/email-management": "privacy",
  "/message-templates": "privacy",
  "/escalation": "privacy",
  "/mobile-apps": "privacy",
  "/live-scan": "privacy",

  // ═══ Privacy: structured /app routes ═══
  "/app/overview": "shared",
  "/app/privacy": "privacy",
  "/app/privacy/sites": "privacy",

  // ═══ Leaks/Incidents workspace ═══
  "/national-overview": "leaks",
  "/leaks": "leaks",
  "/incidents-registry": "leaks",
  "/leak-anatomy": "leaks",
  "/source-intelligence": "leaks",
  "/sector-analysis": "leaks",
  "/leak-timeline": "leaks",
  "/threat-actors-analysis": "leaks",
  "/impact-assessment": "leaks",
  "/geo-analysis": "leaks",
  "/executive-brief": "leaks",
  "/incident-compare": "leaks",
  "/campaign-tracker": "leaks",
  "/recommendations-hub": "leaks",
  "/pdpl-compliance": "leaks",
  "/pii-atlas": "leaks",
  "/pii-classifier": "leaks",
  "/evidence-chain": "leaks",
  "/feedback-accuracy": "leaks",
  "/report-approval": "leaks",
  "/telegram": "leaks",
  "/darkweb": "leaks",
  "/paste-sites": "leaks",
  "/osint-tools": "leaks",
  "/threat-rules": "leaks",
  "/knowledge-graph": "leaks",
  "/threat-map": "leaks",
  "/seller-profiles": "leaks",

  // ═══ Leaks: structured /app routes ═══
  "/app/incidents": "leaks",
  "/app/incidents/list": "leaks",
};

/** Get workspace for a given route, handling dynamic routes */
export function getWorkspaceForRoute(path: string): WorkspaceId {
  if (routeWorkspaceMap[path]) return routeWorkspaceMap[path];
  if (path.startsWith("/sites/")) return "privacy";
  if (path.startsWith("/clauses/")) return "privacy";
  if (path.startsWith("/scan-execution/")) return "privacy";
  if (path.startsWith("/app/privacy/")) return "privacy";
  if (path.startsWith("/app/incidents/")) return "leaks";
  if (path.startsWith("/incident/")) return "leaks";
  if (path.startsWith("/verify/")) return "shared";
  if (path.startsWith("/admin")) return "admin";
  // Default to shared for unknown routes
  return "shared";
}

/** Determine the active "switchable" workspace (privacy or leaks) from route */
export function getActiveMainWorkspace(path: string): "privacy" | "leaks" {
  const ws = getWorkspaceForRoute(path);
  if (ws === "privacy") return "privacy";
  if (ws === "leaks") return "leaks";
  // For shared/admin, check localStorage or default to privacy
  const stored = localStorage.getItem("rasid-workspace");
  if (stored === "leaks") return "leaks";
  return "privacy";
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

  const activeMainWs = getActiveMainWorkspace(location);
  const activeWs = workspaces.find((w) => w.id === activeMainWs) || workspaces[0];

  const handleSelect = (ws: Workspace) => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, ws.id);
    onWorkspaceChange?.(ws.id);
    // Navigate to the main page of the selected workspace
    if (ws.id === "privacy") {
      navigate("/leadership");
    } else if (ws.id === "leaks") {
      navigate("/national-overview");
    }
  };

  const ActiveIcon = activeWs.icon;
  const accentColor = isDark ? activeWs.color : activeWs.colorLight;

  if (collapsed) {
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
            <ActiveIcon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
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
                  اختر المنصة
                </div>
                {workspaces.map((ws) => {
                  const Icon = ws.icon;
                  const isActive = ws.id === activeMainWs;
                  const wsColor = isDark ? ws.color : ws.colorLight;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => handleSelect(ws)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${
                        isActive
                          ? isDark ? "bg-[rgba(61,177,172,0.08)]" : "bg-[rgba(30,58,138,0.04)]"
                          : isDark ? "hover:bg-[rgba(61,177,172,0.04)]" : "hover:bg-[rgba(30,58,138,0.02)]"
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
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: wsColor }} />
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

  // Expanded: professional workspace selector with 2 tabs
  return (
    <div className="relative px-3 py-3">
      {/* Two-tab switcher */}
      <div className={`flex rounded-xl overflow-hidden ${isDark ? "bg-[rgba(13,21,41,0.6)] border border-[rgba(61,177,172,0.1)]" : "bg-[#f0f2f8] border border-[#e2e5ef]"}`}>
        {workspaces.map((ws) => {
          const Icon = ws.icon;
          const isActive = ws.id === activeMainWs;
          const wsColor = isDark ? ws.color : ws.colorLight;
          return (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 transition-all duration-200 relative ${
                isActive
                  ? ""
                  : isDark
                  ? "hover:bg-[rgba(61,177,172,0.04)]"
                  : "hover:bg-[rgba(30,58,138,0.02)]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="workspace-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg, ${wsColor.replace("0.9", "0.15")}, ${wsColor.replace("0.9", "0.08")})`
                      : `linear-gradient(135deg, ${wsColor.replace("0.9", "0.1")}, ${wsColor.replace("0.9", "0.05")})`,
                    border: `1px solid ${wsColor.replace("0.9", "0.25")}`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-2">
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? wsColor : isDark ? "#D4DDEF80" : "#5a6478" }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: isActive ? wsColor : isDark ? "#D4DDEF80" : "#5a6478" }}
                >
                  {ws.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
