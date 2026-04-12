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

/* ═══ LEAKS SIDEBAR GROUPS — Full Navigation ═══ */
const leaksNavGroups: NavGroup[] = [
  {
    id: "lk_main",
    label: "الرئيسية",
    labelEn: "Main",
    icon: Home,
    items: [
      { label: "راصد الذكي", labelEn: "Smart Rasid", icon: Bot, path: "/smart-rasid" },
      { label: "لوحة القيادة الرئيسية", labelEn: "Dashboard", icon: Gauge, path: "/national-overview" },
      { label: "حالات الرصد", labelEn: "Leaks", icon: ShieldAlert, path: "/leaks" },
      { label: "التقارير", labelEn: "Reports", icon: BarChart3, path: "/reports" },
      { label: "التوصيات", labelEn: "Recommendations", icon: Brain, path: "/recommendations-hub" },
    ],
  },
  {
    id: "lk_dashboards",
    label: "لوحات المؤشرات",
    labelEn: "Dashboards",
    icon: LayoutDashboard,
    items: [
      { label: "خريطة التهديدات", labelEn: "Threat Map", icon: Map, path: "/threat-map" },
      { label: "تحليل القطاعات", labelEn: "Sector Analysis", icon: Layers, path: "/sector-analysis" },
      { label: "تحليل الأثر", labelEn: "Impact Assessment", icon: Crosshair, path: "/impact-assessment" },
      { label: "التحليل الجغرافي", labelEn: "Geo Analysis", icon: Globe, path: "/geo-analysis" },
      { label: "استخبارات المصادر", labelEn: "Source Intelligence", icon: Radar, path: "/source-intelligence" },
      { label: "تحليل جهات النشر", labelEn: "Threat Actors", icon: Users, path: "/threat-actors-analysis" },
      { label: "أطلس البيانات الشخصية", labelEn: "PII Atlas", icon: Network, path: "/pii-atlas" },
      { label: "رسم المعرفة", labelEn: "Knowledge Graph", icon: Brain, path: "/knowledge-graph" },
      { label: "الخط الزمني للحالات", labelEn: "Leak Timeline", icon: Activity, path: "/leak-timeline" },
      { label: "امتثال PDPL", labelEn: "PDPL Compliance", icon: Shield, path: "/pdpl-compliance" },
      { label: "مقاييس الدقة", labelEn: "Accuracy Metrics", icon: BarChart3, path: "/feedback-accuracy" },
      { label: "الملخص التنفيذي", labelEn: "Executive Brief", icon: FileText, path: "/executive-brief" },
      { label: "مقارنة الحالات", labelEn: "Incident Compare", icon: BarChart3, path: "/incident-compare" },
      { label: "متتبع الحملات", labelEn: "Campaign Tracker", icon: Sparkles, path: "/campaign-tracker" },
    ],
  },
  {
    id: "lk_operations",
    label: "المؤشرات التشغيلية",
    labelEn: "Operations",
    icon: Activity,
    items: [
      { label: "الرصد المباشر", labelEn: "Live Scan", icon: Radio, path: "/live-scan" },
      { label: "رصد تليجرام", labelEn: "Telegram", icon: Send, path: "/telegram" },
      { label: "رصد الدارك ويب", labelEn: "Dark Web", icon: Globe, path: "/darkweb" },
      { label: "مواقع اللصق", labelEn: "Paste Sites", icon: FileText, path: "/paste-sites" },
      { label: "مهام الرصد", labelEn: "Monitoring Jobs", icon: CalendarClock, path: "/monitoring-jobs" },
      { label: "مختبر أنماط البيانات", labelEn: "PII Classifier", icon: ScanSearch, path: "/pii-classifier" },
      { label: "سلسلة الأدلة", labelEn: "Evidence Chain", icon: Link2, path: "/evidence-chain" },
      { label: "قواعد الرصد", labelEn: "Threat Rules", icon: Crosshair, path: "/threat-rules" },
      { label: "أدوات OSINT", labelEn: "OSINT Tools", icon: Radar, path: "/osint-tools" },
      { label: "ملفات المصادر", labelEn: "Seller Profiles", icon: UserX, path: "/seller-profiles" },
      { label: "قنوات التنبيه", labelEn: "Alert Channels", icon: Bell, path: "/alert-channels" },
      { label: "سجل الحالات", labelEn: "Incidents Registry", icon: Archive, path: "/incidents-registry" },
      { label: "استيراد البيانات", labelEn: "Import Data", icon: Import, path: "/breach-import" },
      { label: "تصدير البيانات", labelEn: "Export Data", icon: Download, path: "/export-data" },
    ],
  },
];

/* ═══ PRIVACY SIDEBAR GROUPS — Full Navigation ═══ */
const privacyNavGroups: NavGroup[] = [
  {
    id: "prv_main",
    label: "الرئيسية",
    labelEn: "Main",
    icon: Home,
    items: [
      { label: "راصد الذكي", labelEn: "Smart Rasid", icon: Bot, path: "/smart-rasid" },
      { label: "لوحة القيادة", labelEn: "Dashboard", icon: Gauge, path: "/leadership" },
      { label: "التقارير", labelEn: "Reports", icon: BarChart3, path: "/custom-reports" },
      { label: "التغييرات", labelEn: "Changes", icon: Eye, path: "/change-detection" },
    ],
  },
  {
    id: "prv_dashboards",
    label: "لوحات المؤشرات",
    labelEn: "Dashboards",
    icon: LayoutDashboard,
    items: [
      { label: "خريطة الامتثال", labelEn: "Compliance Heatmap", icon: Map, path: "/compliance-heatmap" },
      { label: "لوحة مؤشرات الأداء", labelEn: "KPI Dashboard", icon: Gauge, path: "/kpi-dashboard" },
      { label: "اللوحة الحية", labelEn: "Real-time", icon: Radio, path: "/real-time" },
      { label: "التحليلات المتقدمة", labelEn: "Advanced Analytics", icon: BarChart3, path: "/advanced-analytics" },
      { label: "مقارنة الامتثال", labelEn: "Compliance Comparison", icon: BarChart3, path: "/compliance-comparison" },
      { label: "المقارنة الزمنية", labelEn: "Time Comparison", icon: CalendarClock, path: "/time-comparison" },
      { label: "مقارنة القطاعات", labelEn: "Sector Comparison", icon: Layers, path: "/sector-comparison" },
      { label: "تغطية الاستراتيجية", labelEn: "Strategy Coverage", icon: Shield, path: "/strategy-coverage" },
      { label: "التقرير التنفيذي", labelEn: "Executive Report", icon: FileText, path: "/executive-report" },
      { label: "التقارير المخصصة", labelEn: "Custom Reports", icon: FileText, path: "/custom-reports" },
      { label: "تقارير PDF", labelEn: "PDF Reports", icon: FileText, path: "/pdf-reports" },
      { label: "التقارير المجدولة", labelEn: "Scheduled Reports", icon: CalendarClock, path: "/scheduled-reports" },
      { label: "التنبيهات الذكية", labelEn: "Smart Alerts", icon: Bell, path: "/smart-alerts" },
      { label: "منشئ العروض", labelEn: "Presentation Builder", icon: Eye, path: "/presentation-builder" },
    ],
  },
  {
    id: "prv_operations",
    label: "المؤشرات التشغيلية",
    labelEn: "Operations",
    icon: Activity,
    items: [
      { label: "إدارة المواقع", labelEn: "Sites", icon: Globe, path: "/sites" },
      { label: "الفحص المباشر", labelEn: "Live Scan", icon: Radio, path: "/advanced-scan" },
      { label: "الفحص الجماعي", labelEn: "Batch Scan", icon: Import, path: "/batch-scan" },
      { label: "الفحص العميق", labelEn: "Deep Scan", icon: Radar, path: "/deep-scan" },
      { label: "مكتبة الفحوصات", labelEn: "Scan Library", icon: FolderOpen, path: "/scan-library" },
      { label: "جدولة الفحوصات", labelEn: "Scan Schedules", icon: CalendarClock, path: "/scan-schedules" },
      { label: "سجل الفحوصات", labelEn: "Scan History", icon: History, path: "/scan-history" },
      { label: "البنود الثمانية", labelEn: "8 Clauses", icon: FileText, path: "/clauses" },
      { label: "الخطابات", labelEn: "Letters", icon: Send, path: "/letters" },
      { label: "متتبع التحسين", labelEn: "Improvement Tracker", icon: CheckCircle2, path: "/improvement-tracker" },
      { label: "البحث المتقدم", labelEn: "Advanced Search", icon: Search, path: "/advanced-search" },
      { label: "استيراد المواقع", labelEn: "Import Sites", icon: Import, path: "/privacy-import" },
      { label: "تصدير البيانات", labelEn: "Export Data", icon: Download, path: "/export-data" },
    ],
  },
];

/* ═══ CONTROL PANEL items — moved to user menu dropdown ═══ */
const controlPanelItems: NavItem[] = [
  { label: "الإعدادات", labelEn: "Settings", icon: Settings, path: "/settings" },
  { label: "إدارة المستخدمين", labelEn: "Users", icon: Users, path: "/user-management", requiresAuth: true, minRole: "admin" },
  { label: "سجل المراجعة", labelEn: "Audit Log", icon: ScrollText, path: "/audit-log", requiresAuth: true, minRole: "admin" },
  { label: "لوحة التحكم الرئيسية", labelEn: "Control Panel", icon: PanelLeft, path: "/admin/control", requiresAuth: true, rootAdminOnly: true },
  { label: "إدارة المحتوى", labelEn: "Content Management", icon: Database, path: "/admin/cms", requiresAuth: true, rootAdminOnly: true },
  { label: "مركز العمليات", labelEn: "Operations Center", icon: Gauge, path: "/admin/operations", requiresAuth: true, rootAdminOnly: true },
  { label: "المشرف العام", labelEn: "Super Admin", icon: Crown, path: "/super-admin", requiresAuth: true, rootAdminOnly: true },
  { label: "إعدادات الإدارة", labelEn: "Admin Settings", icon: Wrench, path: "/admin/settings", requiresAuth: true, rootAdminOnly: true },
];

/* Build all items for route lookup */
const allNavItems = [
  { label: "الرئيسية", labelEn: "Home", icon: Home, path: "/" },
  ...leaksNavGroups.flatMap((g) => g.items),
  ...privacyNavGroups.flatMap((g) => g.items),
  ...controlPanelItems,
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
  const [customSearchQuery, setCustomSearchQuery] = useState("");

  const allCurrentGroups = wsNavGroups;
  const activeGroupId = allCurrentGroups.find((g) => g.items.some((item) => item.path === location))?.id;

  // Groups stay collapsed by default — user must click to expand
  // No auto-expand on route match

  const currentPage = allNavItems.find((item) => item.path === location);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    playClick();
  };

  const handleNavClick = useCallback(() => {
    setMobileOpen(false);
  }, []);
  // Auto-close mobile sidebar and user menu on any route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
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

  const customPageTypesCount = new Set(customPages.map((page) => page.pageType)).size;

  useEffect(() => {
    setCustomSearchQuery("");
  }, [activeWorkspace]);

  const handleCreatePage = async (pageType: "dashboard" | "table" | "report", title: string): Promise<boolean> => {
    try {
      const result = await createCustomPage(pageType, title);
      if (!result) {
        toast.error("تعذر إنشاء الصفحة، حاول مرة أخرى");
        return false;
      }

      toast.success(`تم إنشاء "${title}" بنجاح`);
      playClick();
      setLocation(`/custom/${pageType}/${(result as any).id}`);
      return true;
    } catch (e) {
      toast.error("فشل إنشاء الصفحة");
      return false;
    }
  };

  const handleDeletePage = async (id: number) => {
    const target = customPages.find((p) => p.id === id);
    const confirmed = window.confirm(`هل أنت متأكد من حذف الصفحة "${target?.title || ""}"؟`);
    if (!confirmed) return;

    try {
      const result = await deleteCustomPage(id);
      if (!(result as any)?.success) {
        toast.error("تعذر حذف الصفحة");
        return;
      }

      if (location.startsWith(`/custom/`) && location.endsWith(`/${id}`)) {
        setLocation(activeWorkspace === "privacy" ? "/leadership" : "/national-overview");
      }
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
          whileHover={{ x: -3, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
          whileTap={{ scale: 0.97 }}
          className={`
            sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
            group relative transition-all duration-200 ease-out
            ${isActive
              ? `sidebar-nav-item-active ${isDark ? 'border border-[rgba(61,177,172,0.3)] shadow-[0_0_12px_rgba(61,177,172,0.08)]' : 'border border-[rgba(30,58,138,0.15)] shadow-[0_2px_8px_rgba(30,58,138,0.06)]'}`
              : isDark ? 'text-sidebar-foreground/60 hover:text-sidebar-foreground/90 hover:bg-white/[0.04]' : 'text-[#5a6478] hover:text-[#1c2833] hover:bg-black/[0.03]'
            }
          `}
          style={isActive ? { backgroundColor: isDark ? ws.accentBg : ws.accentBgLight, borderColor: isDark ? ws.accentBorder : ws.accentBorderLight } : undefined}
        >
          {isActive && (
            <motion.div
              layoutId="activeNav"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-l-full"
              style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}80, 0 0 4px ${accent}40` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <div className={`sidebar-nav-icon transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`}>
            <Icon className="w-4 h-4 flex-shrink-0" style={isActive ? { color: accent, filter: `drop-shadow(0 0 4px ${accent}40)` } : undefined} />
          </div>
          {!collapsed && (
            <span className={`text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${isActive ? '' : ''}`}>{item.label}</span>
          )}
          {!collapsed && item.rootAdminOnly && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20 mr-auto font-semibold">ROOT</span>
          )}
          {collapsed && (
            <div className={`absolute right-14 ${isDark ? 'bg-[rgba(20,30,65,0.97)] text-[#E1DEF5] border-[rgba(61,177,172,0.2)]' : 'bg-white text-[#1c2833] border-[#e2e5ef]'} backdrop-blur-2xl text-xs py-2 px-3.5 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 border`}>
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
      <div key={group.id} className="mb-1.5">
        {!collapsed ? (
          <button
            onClick={() => toggleGroup(group.id)}
            className={`
              sidebar-group-header w-full flex items-center justify-between flex-wrap px-3 py-2.5 rounded-xl
              text-xs font-semibold uppercase tracking-wider transition-all duration-200 ease-out
              ${isActive
                ? isDark ? "text-[#3DB1AC] bg-[rgba(61,177,172,0.1)]" : "text-[#1e3a8a] bg-[rgba(30,58,138,0.07)]"
                : isDark ? "text-[#D4DDEF]/50 hover:text-[#D4DDEF]/80 hover:bg-white/[0.02]" : "text-[#5a6478] hover:text-[#1c2833] hover:bg-black/[0.01]"
              }
            `}
            style={isActive ? { color: accent, backgroundColor: isDark ? ws.accentBg : ws.accentBgLight } : undefined}
          >
            <div className="flex items-center gap-2">
              <GroupIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'scale-110' : ''}`} />
              <span>{group.label}</span>
              <span className="text-[9px] opacity-40 font-normal normal-case">{group.labelEn}</span>
            </div>
            <motion.div animate={{ rotate: isExpanded ? 0 : -90 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </button>
        ) : (
          <div className={`h-px ${isDark ? 'bg-[rgba(61,177,172,0.1)]' : 'bg-[#edf0f7]'} mx-2 my-2.5`} />
        )}

        <AnimatePresence initial={false}>
          {(isExpanded || collapsed) && (
            <motion.div
              initial={collapsed ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={collapsed ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
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
          fixed lg:relative z-50 h-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col
          ${collapsed ? "w-[72px]" : "w-[270px]"}
          ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          right-0 lg:right-auto bg-sidebar backdrop-blur-2xl
          ${isDark ? 'border-l border-[rgba(61,177,172,0.1)] shadow-[2px_0_24px_rgba(0,0,0,0.15)]' : 'border-l border-[#e2e5ef] shadow-[2px_0_12px_rgba(0,0,0,0.03)]'}
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
          {/* Workspace-specific groups */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWorkspace}
              initial={{ opacity: 0, x: activeWorkspace === "privacy" ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeWorkspace === "privacy" ? 8 : -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Group 1: الرئيسية */}
              {renderNavGroup(wsNavGroups[0])}

              {/* Group 2: مخصص — user-created pages */}
              {isAuthenticated && (
                <div className="mb-1">
                  {!collapsed ? (
                    <button
                      onClick={() => toggleGroup("custom_pages")}
                      className={`
                        sidebar-group-header w-full flex items-center justify-between flex-wrap px-3 py-2 rounded-lg
                        text-xs font-semibold uppercase tracking-wider transition-colors duration-150
                        ${customPages.length > 0 && customPages.some((p: any) => location === `/custom/${p.pageType}/${p.id}`)
                          ? isDark ? "text-[#3DB1AC] bg-[rgba(61,177,172,0.08)]" : "text-[#1e3a8a] bg-[rgba(30,58,138,0.06)]"
                          : isDark ? "text-[#D4DDEF]/60 hover:text-[#D4DDEF]/80" : "text-[#5a6478] hover:text-[#1c2833]"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>مخصص</span>
                        <span className="text-[9px] opacity-50 font-normal normal-case">Custom</span>
                        {!collapsed && customPages.length > 0 && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                              isDark
                                ? "bg-[#3DB1AC]/10 border-[#3DB1AC]/30 text-[#91e5e1]"
                                : "bg-[#1e3a8a]/5 border-[#1e3a8a]/20 text-[#1e3a8a]"
                            }`}
                          >
                            {customPages.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedGroups["custom_pages"] ? "" : "-rotate-90"}`} />
                    </button>
                  ) : (
                    <div className={`h-px ${isDark ? 'bg-[rgba(61,177,172,0.08)]' : 'bg-[#edf0f7]'} mx-2 my-2`} />
                  )}
                  <AnimatePresence initial={false}>
                    {(expandedGroups["custom_pages"] || collapsed) && (
                      <motion.div
                        initial={collapsed ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={collapsed ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className={`space-y-0.5 ${collapsed ? "" : "mt-1 mr-2"}`}>
                          {!collapsed && customPages.length > 0 && (
                            <div className="px-1 pb-1">
                              <div className="relative">
                                <Search className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${isDark ? "text-slate-400" : "text-[#7a859c]"}`} />
                                <input
                                  value={customSearchQuery}
                                  onChange={(e) => setCustomSearchQuery(e.target.value)}
                                  placeholder="ابحث داخل الصفحات المخصصة"
                                  className={`w-full rounded-md text-[11px] py-1.5 pr-7 pl-2 border transition-colors focus:outline-none focus:ring-1 ${
                                    isDark
                                      ? "bg-white/[0.03] border-white/10 text-slate-100 placeholder:text-slate-400/70"
                                      : "bg-[#f8faff] border-[#e6ebf5] text-[#1c2833] placeholder:text-[#7a859c]"
                                  }`}
                                  style={{ "--tw-ring-color": accent } as React.CSSProperties}
                                />
                              </div>
                              <p className={`mt-1 text-[10px] ${isDark ? "text-slate-400/80" : "text-[#7a859c]"}`}>
                                {customPages.length} صفحة • {customPageTypesCount} أنواع
                              </p>
                            </div>
                          )}
                          <CustomPagesList
                            pages={customPages}
                            collapsed={collapsed}
                            accent={accent}
                            accentBg={isDark ? ws.accentBg : ws.accentBgLight}
                            accentBorder={isDark ? ws.accentBorder : ws.accentBorderLight}
                            searchQuery={customSearchQuery}
                            onDeletePage={handleDeletePage}
                            onRenamePage={handleRenamePage}
                            onNavClick={handleNavClick}
                            isDeleting={isDeletingPage}
                          />
                          <div className="mt-1 px-1">
                            <AddPageButton
                              collapsed={collapsed}
                              onCreatePage={handleCreatePage}
                              accent={accent}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Group 3: لوحات المؤشرات */}
              {renderNavGroup(wsNavGroups[1])}

              {/* Group 4: المؤشرات التشغيلية */}
              {renderNavGroup(wsNavGroups[2])}
            </motion.div>
          </AnimatePresence>
        </nav>

        {/* User profile with dropdown menu */}
        <div className={`p-3 ${isDark ? 'border-t border-[rgba(61,177,172,0.1)]' : 'border-t border-[#edf0f7]'} relative`}>
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-[#3DB1AC]/50' : 'text-[#1e3a8a]/50'}`} />
            </div>
          ) : isAuthenticated && user ? (
            <>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`w-full flex items-center gap-3 ${collapsed ? "justify-center" : ""} rounded-lg px-2 py-2 transition-colors ${
                  isDark ? "hover:bg-white/[0.04]" : "hover:bg-black/[0.02]"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border`}
                  style={{ backgroundColor: `${accent}1A`, borderColor: `${accent}33` }}>
                  <span className="text-xs font-bold" style={{ color: accent }}>{user.name?.charAt(0) || "U"}</span>
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-right">
                      <p className={`text-xs font-medium ${isDark ? 'text-[#D4DDEF]' : 'text-[#1c2833]'} truncate`}>{user.name || "مستخدم"}</p>
                      <p className={`text-xs sm:text-[10px] ${isDark ? 'text-[#D4DDEF]/50' : 'text-[#5a6478]'} truncate`}>
                        {isRootAdmin ? "مدير النظام الرئيسي" : roleLabels[ndmoRole] || ndmoRole}
                      </p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${userMenuOpen ? "rotate-180" : ""} ${isDark ? "text-[#D4DDEF]/40" : "text-[#5a6478]"}`} />
                  </>
                )}
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && !collapsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full right-2 left-2 mb-2 rounded-xl overflow-hidden shadow-2xl z-[60]"
                    style={{
                      background: isDark
                        ? "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))"
                        : "rgba(255,255,255,0.98)",
                      border: isDark
                        ? "1px solid rgba(61, 177, 172, 0.15)"
                        : "1px solid rgba(0,0,0,0.08)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    {/* Switch Platform */}
                    <button
                      onClick={() => {
                        switchWorkspace(activeWorkspace === "leaks" ? "privacy" : "leaks");
                        setUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors ${
                        isDark ? "text-slate-300 hover:bg-white/[0.06] hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <ArrowRightLeft className="w-4 h-4" style={{ color: accent }} />
                      <span className="font-medium">
                        {activeWorkspace === "leaks" ? "التبديل إلى رصد الخصوصية" : "التبديل إلى رصد التسريبات"}
                      </span>
                    </button>

                    <div className={`h-px mx-3 ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`} />

                    {/* Control Panel */}
                    <button
                      onClick={() => {
                        setLocation("/admin/control");
                        setUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors ${
                        isDark ? "text-slate-300 hover:bg-white/[0.06] hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Settings className="w-4 h-4" style={{ color: accent }} />
                      <span className="font-medium">لوحة التحكم</span>
                    </button>

                    <div className={`h-px mx-3 ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`} />

                    {/* Logout */}
                    <button
                      onClick={() => {
                        logout();
                        localStorage.removeItem("rasid_workspace");
                        localStorage.removeItem("rasid_session");
                        toast("تم تسجيل الخروج");
                        window.location.href = "/login";
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors ${
                        isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">تسجيل الخروج</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
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
          className="app-header min-h-14 flex items-center justify-between flex-wrap gap-y-1 px-3 sm:px-4 lg:px-6 backdrop-blur-2xl sticky top-0 z-30 transition-all duration-300"
          style={{
            backgroundColor: isDark ? 'rgba(13,21,41,0.92)' : 'rgba(255,255,255,0.97)',
            borderBottom: `1px solid ${isDark ? `${accent}18` : '#e2e5ef'}`,
            boxShadow: isDark ? `0 1px 12px rgba(0,0,0,0.2), 0 0 1px ${accent}10` : '0 1px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-muted-foreground hover:text-foreground transition-colors duration-200" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>

            {/* Workspace title in header */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200" style={{ backgroundColor: `${accent}1A`, boxShadow: `0 0 8px ${accent}10` }}>
                {activeWorkspace === "privacy" ? <Shield className="w-4 h-4" style={{ color: accent }} /> : <ShieldAlert className="w-4 h-4" style={{ color: accent }} />}
              </div>
              <span className={`text-sm font-bold hidden sm:inline ${isDark ? 'text-[#D4DDEF]' : 'text-[#1c2833]'}`}>
                {activeWorkspace === "privacy" ? "رصد سياسة الخصوصية" : "حالات الرصد"}
              </span>
            </div>
          </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Live indicator */}
            <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-200`}
              style={{ backgroundColor: `${accent}0D`, borderColor: `${accent}26` }}>
              <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}90` }} />
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

        {/* Page content */}
        <main ref={mainContentRef} data-scroll-container className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 relative max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <ParticleField count={30} className="z-0" />
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
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
