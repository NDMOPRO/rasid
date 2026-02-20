/**
 * DashboardLayout — SDAIA Ultra Premium Design System
 * RTL-first sidebar with SDAIA official colors (#273470, #6459A7, #3DB1AC)
 * Glassmorphism, scan-line effects, and premium animations
 * - Workspace Switcher in HEADER: حالات الرصد / الخصوصية
 * - Sidebar: الرئيسية (flat) + workspace groups + لوحة التحكم (flat)
 * - Full workspace switch: sidebar + dashboard + colors + header title
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Send, Globe, FileText, ScanSearch, ShieldAlert,
  BarChart3, Settings, ChevronRight, ChevronLeft, ChevronDown, Menu, X,
  Search, Shield, LogIn, LogOut, Users, Loader2, Radio, ScrollText, Bell,
  Archive, Map, CalendarClock, KeyRound, Crosshair, Link2, UserX, Radar,
  Brain, Network, Sun, Moon, Monitor, Bot, CheckCircle2, Scan, FileCheck,
  FileBarChart, Stamp, Sparkles, BookOpen, HeartHandshake, GraduationCap,
  Activity, Crown, Layers, Eye, QrCode, Home, Import, History,
  FolderOpen, Wrench, Clock, Download, FileDown, Database, Gauge, PanelLeft,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNdmoAuth } from "@/hooks/useNdmoAuth";
import { getLoginUrl } from "@/const";
import NotificationBell from "./NotificationBell";
import { useTheme } from "@/contexts/ThemeContext";
import { Redirect } from "wouter";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import CinematicMode, { CinematicButton } from "@/components/CinematicMode";
import RasidCharacterWidget from "@/components/RasidCharacterWidget";
import AddPageButton from "@/components/AddPageButton";
import CustomPagesList from "@/components/CustomPagesList";
import { useCustomPages } from "@/hooks/useCustomPages";

/* SDAIA Official FULL Logo URLs — local branding assets */
const FULL_LOGO_DARK = "/branding/logos/Rased_1_transparent.png";
const FULL_LOGO_LIGHT = "/branding/logos/Rased_1_transparent_1.png";
const RASID_LOGO = "/branding/logos/Rased_3_transparent.png";

const ROOT_ADMIN_USER_IDS_LIST = ["mruhaily", "aalrebdi", "msarhan", "malmoutaz"];
const ROOT_ADMIN_USER_ID = "mruhaily"; // backward compat export

/* ═══ Types ═══ */
type WorkspaceId = "leaks" | "privacy";

interface NavItem {
  label: string;
  labelEn: string;
  icon: React.ElementType;
  path: string;
  requiresAuth?: boolean;
  minRole?: string;
  rootAdminOnly?: boolean;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  items: NavItem[];
}

/* ═══ Workspace Colors ═══ */
const wsColors: Record<WorkspaceId, {
  title: string; titleEn: string;
  accent: string; accentLight: string;
  accentBg: string; accentBgLight: string;
  accentBorder: string; accentBorderLight: string;
}> = {
  leaks: {
    title: "لوحة مؤشرات الرصد", titleEn: "Monitoring Dashboard",
    accent: "#3DB1AC", accentLight: "#1e3a8a",
    accentBg: "rgba(61,177,172,0.1)", accentBgLight: "rgba(30,58,138,0.06)",
    accentBorder: "rgba(61,177,172,0.25)", accentBorderLight: "rgba(30,58,138,0.12)",
  },
  privacy: {
    title: "رصد سياسة الخصوصية", titleEn: "Privacy Monitoring",
    accent: "#22c55e", accentLight: "#16a34a",
    accentBg: "rgba(34,197,94,0.1)", accentBgLight: "rgba(22,163,74,0.06)",
    accentBorder: "rgba(34,197,94,0.25)", accentBorderLight: "rgba(22,163,74,0.12)",
  },
};

/* ═══ LEAKS SIDEBAR GROUPS — Simplified with Hub Pages ═══ */
const leaksNavGroups: NavGroup[] = [
  {
    id: "lk_post_monitoring",
    label: "ما بعد الرصد",
    labelEn: "Post-Monitoring",
    icon: ShieldAlert,
    items: [
      { label: "حالات الرصد", labelEn: "Leaks", icon: ShieldAlert, path: "/leaks" },
      { label: "التقارير", labelEn: "Reports", icon: BarChart3, path: "/reports" },
      { label: "التوصيات", labelEn: "Recommendations", icon: Brain, path: "/recommendations-hub" },
      { label: "راصد الذكي", labelEn: "Smart Rasid", icon: Bot, path: "/smart-rasid" },
    ],
  },
  {
    id: "lk_dashboards_hub",
    label: "لوحات المؤشرات",
    labelEn: "Dashboards",
    icon: LayoutDashboard,
    items: [
      { label: "مركز اللوحات", labelEn: "Dashboards Hub", icon: LayoutDashboard, path: "/breach-dashboards" },
      { label: "لوحة القيادة", labelEn: "Dashboard", icon: Gauge, path: "/national-overview" },
      { label: "خريطة التهديدات", labelEn: "Threat Map", icon: Map, path: "/threat-map" },
    ],
  },
  {
    id: "lk_operations_hub",
    label: "العمليات التشغيلية",
    labelEn: "Operations",
    icon: Activity,
    items: [
      { label: "مركز العمليات", labelEn: "Operations Hub", icon: Activity, path: "/breach-operations" },
      { label: "استيراد البيانات", labelEn: "Import Data", icon: Import, path: "/breach-import" },
      { label: "تصدير البيانات", labelEn: "Export Data", icon: Download, path: "/export-data" },
    ],
  },
];

/* ═══ PRIVACY SIDEBAR GROUPS — Simplified with Hub Pages ═══ */
const privacyNavGroups: NavGroup[] = [
  {
    id: "prv_core",
    label: "رصد الخصوصية",
    labelEn: "Privacy Monitoring",
    icon: Shield,
    items: [
      { label: "نظرة عامة", labelEn: "Overview", icon: Shield, path: "/leadership" },
      { label: "التقارير", labelEn: "Reports", icon: BarChart3, path: "/custom-reports" },
      { label: "التغييرات", labelEn: "Changes", icon: Eye, path: "/change-detection" },
      { label: "راصد الذكي", labelEn: "Smart Rasid", icon: Bot, path: "/smart-rasid" },
    ],
  },
  {
    id: "prv_dashboards_hub",
    label: "لوحات المؤشرات",
    labelEn: "Dashboards",
    icon: LayoutDashboard,
    items: [
      { label: "مركز اللوحات", labelEn: "Dashboards Hub", icon: LayoutDashboard, path: "/privacy-dashboards" },
      { label: "خريطة الامتثال", labelEn: "Compliance Heatmap", icon: Map, path: "/compliance-heatmap" },
      { label: "لوحة المؤشرات", labelEn: "KPI Dashboard", icon: Gauge, path: "/kpi-dashboard" },
    ],
  },
  {
    id: "prv_operations_hub",
    label: "العمليات التشغيلية",
    labelEn: "Operations",
    icon: Activity,
    items: [
      { label: "مركز العمليات", labelEn: "Operations Hub", icon: Activity, path: "/privacy-operations" },
      { label: "المواقع", labelEn: "Sites", icon: Globe, path: "/sites" },
      { label: "استيراد المواقع", labelEn: "Import Sites", icon: Import, path: "/privacy-import" },
      { label: "تصدير البيانات", labelEn: "Export Data", icon: Download, path: "/export-data" },
    ],
  },
];

/* ═══ CONTROL PANEL (لوحة التحكم) — shared admin panel ═══ */
const controlPanelGroup: NavGroup = {
  id: "control_panel",
  label: "لوحة التحكم",
  labelEn: "Control Panel",
  icon: Settings,
  items: [
    { label: "الإعدادات", labelEn: "Settings", icon: Settings, path: "/settings" },
    { label: "إدارة المستخدمين", labelEn: "Users", icon: Users, path: "/user-management", requiresAuth: true, minRole: "admin" },
    { label: "سجل المراجعة", labelEn: "Audit Log", icon: ScrollText, path: "/audit-log", requiresAuth: true, minRole: "admin" },
    { label: "لوحة التحكم الرئيسية", labelEn: "Control Panel", icon: PanelLeft, path: "/admin/control", requiresAuth: true, rootAdminOnly: true },
    { label: "إدارة المحتوى", labelEn: "Content Management", icon: Database, path: "/admin/cms", requiresAuth: true, rootAdminOnly: true },
    { label: "مركز العمليات", labelEn: "Operations Center", icon: Gauge, path: "/admin/operations", requiresAuth: true, rootAdminOnly: true },
    { label: "المشرف العام", labelEn: "Super Admin", icon: Crown, path: "/super-admin", requiresAuth: true, rootAdminOnly: true },
    { label: "إعدادات الإدارة", labelEn: "Admin Settings", icon: Wrench, path: "/admin/settings", requiresAuth: true, rootAdminOnly: true },
  ],
};

/* Build all items for route lookup */
const allNavItems = [
  { label: "الرئيسية", labelEn: "Home", icon: Home, path: "/" },
  ...leaksNavGroups.flatMap((g) => g.items),
  ...privacyNavGroups.flatMap((g) => g.items),
  ...controlPanelGroup.items,
];

const roleLabels: Record<string, string> = {
  executive: "تنفيذي", manager: "مدير", analyst: "محلل", viewer: "مشاهد",
};

/* Route → Workspace mapping */
const leaksPaths = new Set(leaksNavGroups.flatMap((g) => g.items.map((i) => i.path)));
const privacyPaths = new Set(privacyNavGroups.flatMap((g) => g.items.map((i) => i.path)));

function getWorkspaceForRoute(_path: string): WorkspaceId {
  // Workspace is determined only by user's explicit choice (login or switch button)
  return (localStorage.getItem("rasid_workspace") as WorkspaceId) || "leaks";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const prevLocationRef = useRef(location);

  const autoScrollPages = ["/smart-rasid", "/live-scan"];
  const enableAutoScroll = autoScrollPages.includes(location);
  const { containerRef: mainContentRef } = useAutoScroll<HTMLElement>({ enabled: enableAutoScroll, threshold: 200 });

  // ═══ SCROLL TO TOP on every page navigation ═══
  useEffect(() => {
    if (prevLocationRef.current !== location) {
      prevLocationRef.current = location;
    }
    // Always scroll to top on any location change
    const scrollReset = () => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
        mainContentRef.current.scrollLeft = 0;
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollReset();
    requestAnimationFrame(scrollReset);
    const t1 = setTimeout(scrollReset, 50);
    const t2 = setTimeout(scrollReset, 150);
    const t3 = setTimeout(scrollReset, 300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location, mainContentRef]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cinematicOpen, setCinematicOpen] = useState(false);
  const { user, isAuthenticated, loading, logout, isAdmin, isRootAdmin, ndmoRole } = useNdmoAuth();
  const { theme, themeMode, toggleTheme, switchable } = useTheme();

  const platformUserId = (user as any)?.userId ?? "";

  /* ═══ WORKSPACE STATE ═══ */
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>(() => getWorkspaceForRoute(location));

  // Workspace is now only changed via login page selection or the switch button
  // No auto-switching based on URL to ensure complete workspace isolation

  const ws = wsColors[activeWorkspace];
  const wsNavGroups = activeWorkspace === "privacy" ? privacyNavGroups : leaksNavGroups;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const allCurrentGroups = [...wsNavGroups, controlPanelGroup];
  const activeGroupId = allCurrentGroups.find((g) => g.items.some((item) => item.path === location))?.id;

  useEffect(() => {
    if (activeGroupId) {
      setExpandedGroups((prev) => {
        if (prev[activeGroupId]) return prev;
        return { ...prev, [activeGroupId]: true };
      });
    }
  }, [activeGroupId]);

  const currentPage = allNavItems.find((item) => item.path === location);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    playClick();
  };

  const handleNavClick = useCallback(() => {
    setMobileOpen(false);
  }, []);
  // Auto-close mobile sidebar on any route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isItemVisible = (item: NavItem) => {
    if (item.rootAdminOnly && !isRootAdmin) return false;
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.minRole === "admin" && !isAdmin) return false;
    return true;
  };

  const isDark = theme === "dark";
  const logoSrc = isDark ? FULL_LOGO_LIGHT : FULL_LOGO_DARK;
  const { playClick, playHover } = useSoundEffects();
  const accent = isDark ? ws.accent : ws.accentLight;

  /* ═══ CUSTOM PAGES ═══ */
  const {
    pages: customPages,
    createPage: createCustomPage,
    updatePage: updateCustomPage,
    deletePage: deleteCustomPage,
    isDeleting: isDeletingPage,
  } = useCustomPages(activeWorkspace);

  const handleCreatePage = async (pageType: "dashboard" | "table" | "report", title: string) => {
    try {
      const result = await createCustomPage(pageType, title);
      if (result) {
        toast.success(`تم إنشاء "${title}" بنجاح`);
        playClick();
        // Navigate to the new page
        setLocation(`/custom/${pageType}/${(result as any).id}`);
      }
    } catch (e) {
      toast.error("فشل إنشاء الصفحة");
    }
  };

  const handleDeletePage = async (id: number) => {
    try {
      await deleteCustomPage(id);
      toast.success("تم حذف الصفحة");
    } catch (e) {
      toast.error("فشل حذف الصفحة");
    }
  };

  const handleRenamePage = async (id: number, newTitle: string) => {
    try {
      await updateCustomPage(id, { title: newTitle });
      toast.success("تم تحديث الاسم");
    } catch (e) {
      toast.error("فشل تحديث الاسم");
    }
  };

  if (!loading && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const switchWorkspace = (wsId: WorkspaceId) => {
    setActiveWorkspace(wsId);
    localStorage.setItem("rasid_workspace", wsId);
    setExpandedGroups({});
    playClick();
    // Navigate to the default page of the target workspace
    if (wsId === "privacy") {
      setLocation("/leadership");
    } else {
      setLocation("/national-overview");
    }
  };

  // ═══ WORKSPACE GUARD: redirect if user is on a page that belongs to the other workspace ═══
  useEffect(() => {
    const currentWs = activeWorkspace;
    const isLeaksPage = leaksPaths.has(location);
    const isPrivacyPage = privacyPaths.has(location);
    // If user is on a leaks-only page but workspace is privacy, redirect
    if (currentWs === "privacy" && isLeaksPage && !isPrivacyPage) {
      setLocation("/leadership");
    }
    // If user is on a privacy-only page but workspace is leaks, redirect
    if (currentWs === "leaks" && isPrivacyPage && !isLeaksPage) {
      setLocation("/national-overview");
    }
  }, [activeWorkspace, location, setLocation]);

  /* ═══ Render nav item ═══ */
  const renderNavItem = (item: NavItem) => {
    if (!isItemVisible(item)) return null;
    const isActive = location === item.path;
    const Icon = item.icon;
    return (
      <Link key={item.path} href={item.path} onClick={() => { handleNavClick(); playClick(); }}>
        <motion.div
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`
            sidebar-nav-item flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
            group relative transition-colors duration-150
            ${isActive
              ? `sidebar-nav-item-active ${isDark ? 'border border-[rgba(61,177,172,0.25)]' : 'border border-[rgba(30,58,138,0.12)]'}`
              : isDark ? 'text-sidebar-foreground/60 hover:text-sidebar-foreground/80 hover:bg-white/[0.03]' : 'text-[#5a6478] hover:text-[#1c2833] hover:bg-black/[0.02]'
            }
          `}
          style={isActive ? { backgroundColor: isDark ? ws.accentBg : ws.accentBgLight, borderColor: isDark ? ws.accentBorder : ws.accentBorderLight } : undefined}
        >
          {isActive && (
            <motion.div
              layoutId="activeNav"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full"
              style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}66` }}
            />
          )}
          <div className="sidebar-nav-icon">
            <Icon className="w-4 h-4 flex-shrink-0" style={isActive ? { color: accent } : undefined} />
          </div>
          {!collapsed && (
            <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
          )}
          {!collapsed && item.rootAdminOnly && (
            <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 mr-auto">ROOT</span>
          )}
          {collapsed && (
            <div className={`absolute right-14 ${isDark ? 'bg-[rgba(26,37,80,0.95)] text-[#E1DEF5] border-[rgba(61,177,172,0.15)]' : 'bg-white text-[#1c2833] border-[#e2e5ef]'} backdrop-blur-xl text-xs py-1.5 px-3 rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border`}>
              {item.label}
            </div>
          )}
        </motion.div>
      </Link>
    );
  };

  /* ═══ Render nav group ═══ */
  const renderNavGroup = (group: NavGroup) => {
    const visibleItems = group.items.filter(isItemVisible);
    if (visibleItems.length === 0) return null;
    const isExpanded = expandedGroups[group.id] || false;
    const isActive = group.items.some((item) => item.path === location);
    const GroupIcon = group.icon;

    return (
      <div key={group.id} className="mb-1">
        {!collapsed ? (
          <button
            onClick={() => toggleGroup(group.id)}
            className={`
              sidebar-group-header w-full flex items-center justify-between flex-wrap px-3 py-2 rounded-lg
              text-xs font-semibold uppercase tracking-wider transition-colors duration-150
              ${isActive
                ? isDark ? "text-[#3DB1AC] bg-[rgba(61,177,172,0.08)]" : "text-[#1e3a8a] bg-[rgba(30,58,138,0.06)]"
                : isDark ? "text-[#D4DDEF]/60 hover:text-[#D4DDEF]/80" : "text-[#5a6478] hover:text-[#1c2833]"
              }
            `}
            style={isActive ? { color: accent, backgroundColor: isDark ? ws.accentBg : ws.accentBgLight } : undefined}
          >
            <div className="flex items-center gap-2">
              <GroupIcon className="w-3.5 h-3.5" />
              <span>{group.label}</span>
              <span className="text-[9px] opacity-50 font-normal normal-case">{group.labelEn}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`} />
          </button>
        ) : (
          <div className={`h-px ${isDark ? 'bg-[rgba(61,177,172,0.08)]' : 'bg-[#edf0f7]'} mx-2 my-2`} />
        )}

        <AnimatePresence initial={false}>
          {(isExpanded || collapsed) && (
            <motion.div
              initial={collapsed ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={collapsed ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={`space-y-0.5 ${collapsed ? "" : "mt-1 mr-2"}`}>
                {visibleItems.map(renderNavItem)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden overflow-x-hidden bg-background" style={{ maxWidth: '100vw' }}>
      {/* ═══ AURORA BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0 dark:block hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[50%] opacity-25" style={{ background: `radial-gradient(ellipse at 70% 20%, ${ws.accent}4D, transparent 70%)` }} />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] opacity-20" style={{ background: "radial-gradient(ellipse at 30% 80%, rgba(39, 52, 112, 0.25), transparent 60%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] opacity-10" style={{ background: "radial-gradient(ellipse at center, rgba(100, 89, 167, 0.2), transparent 50%)" }} />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`
          fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out flex flex-col
          ${collapsed ? "w-[72px]" : "w-[270px]"}
          ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          right-0 lg:right-auto bg-sidebar backdrop-blur-2xl
          ${isDark ? 'border-l border-[rgba(61,177,172,0.08)]' : 'border-l border-[#e2e5ef]'}
        `}
      >
        {/* Logo area */}
        <div className={`flex items-center justify-center px-2 py-8 ${isDark ? 'border-b border-[rgba(61,177,172,0.1)]' : 'border-b border-[#edf0f7]'}`} style={{ minHeight: collapsed ? '72px' : '200px' }}>
          <motion.div
            className="relative flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{ width: collapsed ? '52px' : '100%', height: collapsed ? '52px' : '180px' }}
          >
            <div className="absolute rounded-full pointer-events-none" style={{
              width: collapsed ? '60px' : 'calc(100% + 16px)', height: collapsed ? '60px' : '190px',
              border: isDark ? '1px solid rgba(61, 177, 172, 0.12)' : '1px solid rgba(30, 58, 138, 0.06)',
              animation: 'breathing-glow 4s ease-in-out infinite',
              boxShadow: isDark ? '0 0 30px rgba(61, 177, 172, 0.1), inset 0 0 30px rgba(100, 89, 167, 0.06)' : '0 0 20px rgba(30, 58, 138, 0.04)',
            }} />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#3DB1AC]' : 'bg-[#3b82f6]'}`} style={{ top: '8%', right: '12%', opacity: isDark ? 0.5 : 0.25, animation: 'orbit 6s linear infinite' }} />
              <div className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-[#6459A7]' : 'bg-[#1e3a8a]'}`} style={{ bottom: '15%', left: '8%', opacity: isDark ? 0.4 : 0.2, animation: 'orbit 8s linear infinite reverse' }} />
              <div className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#3DB1AC]' : 'bg-[#3b82f6]'}`} style={{ top: '50%', left: '3%', opacity: isDark ? 0.3 : 0.15, animation: 'orbit 10s linear infinite' }} />
            </div>
            <img
              src={collapsed ? RASID_LOGO : logoSrc}
              alt="منصة راصد - مكتب إدارة البيانات الوطنية"
              className="relative z-10 object-contain"
              style={{
                width: collapsed ? '44px' : '100%', height: collapsed ? '44px' : '170px', maxWidth: '260px',
                filter: isDark ? 'drop-shadow(0 0 15px rgba(61, 177, 172, 0.25)) drop-shadow(0 0 40px rgba(100, 89, 167, 0.12))' : 'drop-shadow(0 0 8px rgba(30, 58, 138, 0.08))',
                animation: 'logo-float 5s ease-in-out infinite',
              }}
            />
          </motion.div>
        </div>

        {/* Data flow line */}
        <div className="data-flow-line mx-4 opacity-50" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {/* الرئيسية — fixed at top */}
          {renderNavItem({ label: "الرئيسية", labelEn: "Home", icon: Home, path: "/" })}

          {/* ═══ USER CUSTOM PAGES ═══ */}
          {isAuthenticated && (
            <>
              <CustomPagesList
                pages={customPages}
                collapsed={collapsed}
                accent={accent}
                accentBg={isDark ? ws.accentBg : ws.accentBgLight}
                accentBorder={isDark ? ws.accentBorder : ws.accentBorderLight}
                onDeletePage={handleDeletePage}
                onRenamePage={handleRenamePage}
                onNavClick={handleNavClick}
                isDeleting={isDeletingPage}
              />
              <div className="mt-1">
                <AddPageButton
                  collapsed={collapsed}
                  onCreatePage={handleCreatePage}
                  accent={accent}
                />
              </div>
            </>
          )}

          {/* Separator */}
          <div className={`h-px ${isDark ? 'bg-[rgba(61,177,172,0.08)]' : 'bg-[#edf0f7]'} mx-2 my-2`} />

          {/* Workspace-specific groups */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWorkspace}
              initial={{ opacity: 0, x: activeWorkspace === "privacy" ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeWorkspace === "privacy" ? 8 : -8 }}
              transition={{ duration: 0.2 }}
            >
              {wsNavGroups.map(renderNavGroup)}
            </motion.div>
          </AnimatePresence>

          {/* Separator */}
          <div className={`h-px ${isDark ? 'bg-[rgba(61,177,172,0.08)]' : 'bg-[#edf0f7]'} mx-2 my-2`} />

          {/* لوحة التحكم — fixed at bottom */}
          {renderNavGroup(controlPanelGroup)}
        </nav>

        {/* User profile */}
        <div className={`p-3 ${isDark ? 'border-t border-[rgba(61,177,172,0.1)]' : 'border-t border-[#edf0f7]'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-[#3DB1AC]/50' : 'text-[#1e3a8a]/50'}`} />
            </div>
          ) : isAuthenticated && user ? (
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border`}
                style={{ backgroundColor: `${accent}1A`, borderColor: `${accent}33` }}>
                <span className="text-xs font-bold" style={{ color: accent }}>{user.name?.charAt(0) || "U"}</span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${isDark ? 'text-[#D4DDEF]' : 'text-[#1c2833]'} truncate`}>{user.name || "مستخدم"}</p>
                  <p className={`text-xs sm:text-[10px] ${isDark ? 'text-[#D4DDEF]/50' : 'text-[#5a6478]'} truncate`}>
                    {isRootAdmin ? "مدير النظام الرئيسي" : roleLabels[ndmoRole] || ndmoRole}
                    {isAdmin && !isRootAdmin && " (مشرف)"}
                    {isRootAdmin && " (Root)"}
                  </p>
                </div>
              )}
              {!collapsed && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm"
                    title={activeWorkspace === "leaks" ? "الانتقال إلى الخصوصية" : "الانتقال إلى التسريبات"}
                    className={`h-7 w-7 p-0 ${isDark ? 'text-[#D4DDEF]/50 hover:text-[#3DB1AC]' : 'text-[#5a6478] hover:text-[#1e3a8a]'}`}
                    onClick={() => switchWorkspace(activeWorkspace === "leaks" ? "privacy" : "leaks")}>
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm"
                    title="تسجيل الخروج"
                    className={`h-7 w-7 p-0 ${isDark ? 'text-[#D4DDEF]/50 hover:text-red-400' : 'text-[#5a6478] hover:text-red-600'}`}
                    onClick={() => {
                      logout();
                      localStorage.removeItem("rasid_workspace");
                      localStorage.removeItem("rasid_session");
                      toast("تم تسجيل الخروج");
                      window.location.href = "/login";
                    }}>
                    <LogOut className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <a href="/login">
              <Button variant="outline" size="sm"
                className={`gap-2 text-xs w-full ${isDark ? 'border-[rgba(61,177,172,0.2)] hover:bg-[rgba(61,177,172,0.1)] text-[#D4DDEF]' : 'border-[#d8dce8] hover:bg-[rgba(30,58,138,0.04)] text-[#1c2833]'} ${collapsed ? "px-0 justify-center" : ""}`}>
                <LogIn className="w-3.5 h-3.5" />
                {!collapsed && "تسجيل الدخول"}
              </Button>
            </a>
          )}
        </div>

        {/* Collapse toggle */}
        <div className={`p-2 ${isDark ? 'border-t border-[rgba(61,177,172,0.1)]' : 'border-t border-[#edf0f7]'} hidden lg:block`}>
          <Button variant="ghost" size="sm"
            className={`w-full justify-center ${isDark ? 'text-[#D4DDEF]/40 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}
            onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile close */}
        <button className={`absolute top-4 left-4 lg:hidden ${isDark ? 'text-[#D4DDEF]/50 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}
          onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto relative z-10" style={{ maxWidth: '100%' }}>
        {/* Top header with WORKSPACE SWITCHER */}
        <header
          className="min-h-14 flex items-center justify-between flex-wrap gap-y-1 px-3 sm:px-4 lg:px-6 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300"
          style={{
            backgroundColor: isDark ? 'rgba(13,21,41,0.85)' : 'rgba(255,255,255,0.95)',
            borderBottom: `1px solid ${isDark ? `${accent}14` : '#e2e5ef'}`,
          }}
        >
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>

            {/* Workspace title in header */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}1A` }}>
                {activeWorkspace === "privacy" ? <Shield className="w-4 h-4" style={{ color: accent }} /> : <ShieldAlert className="w-4 h-4" style={{ color: accent }} />}
              </div>
              <span className={`text-sm font-bold hidden sm:inline ${isDark ? 'text-[#D4DDEF]' : 'text-[#1c2833]'}`}>
                {activeWorkspace === "privacy" ? "رصد سياسة الخصوصية" : "حالات الرصد"}
              </span>
            </div>
          </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Live indicator */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border`}
              style={{ backgroundColor: `${accent}0D`, borderColor: `${accent}26` }}>
              <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}80` }} />
              <span className="text-xs font-medium" style={{ color: accent }}>مباشر</span>
            </div>

            {/* Date */}
            <div className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs sm:text-[10px] ${isDark ? 'text-[#D4DDEF]/60' : 'text-[#5a6478]'}`}>
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Theme Toggle */}
            {switchable && toggleTheme && (
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"
                onClick={() => { toggleTheme(); playClick(); }}>
                {themeMode === "light" && <Sun className="w-4 h-4" />}
                {themeMode === "dark" && <Moon className="w-4 h-4" />}
                {themeMode === "auto" && <Monitor className="w-4 h-4" />}
              </Button>
            )}

            {/* Search */}
            <Link href="/smart-rasid">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title="البحث الذكي">
                <Search className="w-4 h-4" />
              </Button>
            </Link>

            {/* Notifications */}
            <NotificationBell userId={user?.id} />

            {/* Export */}
            <Button variant="ghost" size="sm"
              className={`hidden lg:flex gap-1 text-xs ${isDark ? 'text-[#D4DDEF]/60 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}>
              <FileDown className="w-3.5 h-3.5" />
              <span>تصدير</span>
            </Button>

            {/* Cinematic Mode */}
            <CinematicButton onClick={() => setCinematicOpen(true)} />
          </div>
        </header>

        {/* Workspace title bar */}
        <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3" style={{
          backgroundColor: isDark ? `${accent}08` : `${accent}05`,
          borderBottom: `1px solid ${isDark ? `${accent}14` : `${accent}10`}`,
        }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}1A` }}>
            {activeWorkspace === "privacy" ? <Shield className="w-5 h-5" style={{ color: accent }} /> : <LayoutDashboard className="w-5 h-5" style={{ color: accent }} />}
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">{ws.title}</h2>
            <p className="text-xs sm:text-[10px] text-muted-foreground">{ws.titleEn}</p>
          </div>
        </div>

        {/* Page content */}
        <main ref={mainContentRef} data-scroll-container className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 relative max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <ParticleField count={30} className="z-0" />
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Cinematic Mode */}
      <CinematicMode isOpen={cinematicOpen} onClose={() => setCinematicOpen(false)} pageTitle={currentPage?.label}>
        {children}
      </CinematicMode>

      {/* Rasid Character */}
      <RasidCharacterWidget />
    </div>
  );
}

export { ROOT_ADMIN_USER_ID };
