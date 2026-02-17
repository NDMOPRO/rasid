/**
 * DashboardLayout — SDAIA Ultra Premium Design System with Workspace Navigation
 * RTL-first sidebar with SDAIA official colors (#273470, #6459A7, #3DB1AC)
 * 4 Workspaces: Leaks & Analytics, Monitoring, Platform Settings, Users & Training
 * Glassmorphism, scan-line effects, and premium animations
 * - Mobile: auto-close sidebar on nav item click
 * - Groups: collapsed by default, only active group expanded
 * - Root Admin protection: AI control pages only visible to mruhaily
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Send,
  Globe,
  FileText,
  ScanSearch,
  ShieldAlert,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Menu,
  X,
  Search,
  Shield,
  LogIn,
  LogOut,
  Users,
  Loader2,
  Radio,
  ScrollText,
  Bell,
  Archive,
  Map,
  CalendarClock,
  KeyRound,
  Crosshair,
  Link2,
  UserX,
  Radar,
  Brain,
  Network,
  Sun,
  Moon,
  Monitor,
  Bot,
  CheckCircle2,
  Scan,
  FileCheck,
  FileBarChart,
  Stamp,
  Sparkles,
  BookOpen,
  HeartHandshake,
  GraduationCap,
  Activity,
  Crown,
  Layers,
  ToggleLeft,
  Palette,
  Menu as MenuLucide,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNdmoAuth } from "@/hooks/useNdmoAuth";
import { getLoginUrl } from "@/const";
import NotificationBell from "./NotificationBell";
import { useTheme } from "@/contexts/ThemeContext";
import { Redirect } from "wouter";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import CinematicMode, { CinematicButton } from "@/components/CinematicMode";
import WorkspaceSwitcher, {
  type WorkspaceId,
  getWorkspaceForRoute,
} from "./WorkspaceSwitcher";

/* SDAIA Official FULL Logo URLs (with "منصة راصد" + "مكتب إدارة البيانات الوطنية") */
const FULL_LOGO_DARK = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/vyIfeykxwXasuonx.png";
const FULL_LOGO_LIGHT = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/tSiomIdoNdNFAtOB.png";
const RASID_LOGO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/ziWPuMClYqvYmkJG.png";

/** Root Admin userId — protected from any modifications */
const ROOT_ADMIN_USER_ID = "mruhaily";

interface NavItem {
  label: string;
  labelEn: string;
  icon: React.ElementType;
  path: string;
  requiresAuth?: boolean;
  minRole?: string;
  /** Only visible to root admin (mruhaily) */
  rootAdminOnly?: boolean;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  items: NavItem[];
  /** Which workspace this group belongs to */
  workspace: WorkspaceId;
}

const navGroups: NavGroup[] = [
  // ═══════════════════════════════════════════════════════════
  // WORKSPACE 1: الرصد والتحليلات (Leaks & Analytics)
  // ═══════════════════════════════════════════════════════════
  {
    id: "home",
    label: "البداية",
    labelEn: "Home",
    icon: LayoutDashboard,
    workspace: "leaks",
    items: [
      { label: "الرئيسية", labelEn: "Home", icon: LayoutDashboard, path: "/" },
      { label: "راصد الذكي", labelEn: "Smart Rasid AI", icon: Bot, path: "/smart-rasid" },
    ],
  },
  {
    id: "atlas",
    label: "الأطلس",
    labelEn: "Atlas",
    icon: Network,
    workspace: "leaks",
    items: [
      { label: "النظرة الوطنية", labelEn: "National Overview", icon: LayoutDashboard, path: "/national-overview" },
      { label: "تشريح حالات الرصد", labelEn: "Leak Anatomy", icon: ScanSearch, path: "/leak-anatomy" },
      { label: "القطاعات المتضررة", labelEn: "Affected Sectors", icon: Network, path: "/sector-analysis" },
      { label: "الخط الزمني", labelEn: "Timeline", icon: CalendarClock, path: "/leak-timeline" },
    ],
  },
  {
    id: "advanced_analysis",
    label: "التحليل المتقدم",
    labelEn: "Advanced Analysis",
    icon: BarChart3,
    workspace: "leaks",
    items: [
      { label: "مصادر البيع", labelEn: "Threat Actors", icon: UserX, path: "/threat-actors-analysis" },
      { label: "تحليل الأثر", labelEn: "Impact Analysis", icon: ShieldAlert, path: "/impact-assessment" },
      { label: "المصادر", labelEn: "Sources", icon: Globe, path: "/source-intelligence" },
      { label: "التحليل الجغرافي", labelEn: "Geo Analysis", icon: Map, path: "/geo-analysis" },
    ],
  },
  {
    id: "reports_compare",
    label: "التقارير والمقارنة",
    labelEn: "Reports & Comparison",
    icon: FileBarChart,
    workspace: "leaks",
    items: [
      { label: "التقارير التنفيذية", labelEn: "Executive Reports", icon: LayoutDashboard, path: "/executive-brief" },
      { label: "المقارنة", labelEn: "Comparison", icon: Link2, path: "/incident-compare" },
      { label: "الحملات", labelEn: "Campaigns", icon: Crosshair, path: "/campaign-tracker" },
    ],
  },
  {
    id: "records_compliance",
    label: "السجلات والامتثال",
    labelEn: "Records & Compliance",
    icon: ScrollText,
    workspace: "leaks",
    items: [
      { label: "سجل الحوادث", labelEn: "Incidents Registry", icon: ScrollText, path: "/incidents-registry" },
      { label: "التوصيات", labelEn: "Recommendations", icon: Brain, path: "/recommendations-hub" },
      { label: "الامتثال PDPL", labelEn: "PDPL Compliance", icon: Shield, path: "/pdpl-compliance" },
    ],
  },
  {
    id: "analysis",
    label: "التحليل",
    labelEn: "Analysis",
    icon: ScanSearch,
    workspace: "leaks",
    items: [
      { label: "سجل الحوادث", labelEn: "Incident Log", icon: ShieldAlert, path: "/leaks" },
      { label: "أطلس البيانات الشخصية", labelEn: "PII Atlas", icon: Network, path: "/pii-atlas" },
      { label: "مختبر الأنماط", labelEn: "Pattern Lab", icon: ScanSearch, path: "/pii-classifier" },
      { label: "عدسة الأثر والحقوق", labelEn: "Impact & Rights", icon: Link2, path: "/evidence-chain" },
      { label: "الاتجاهات والمقارنات", labelEn: "Trends & Comparisons", icon: Brain, path: "/feedback-accuracy" },
      { label: "مركز التقارير", labelEn: "Reports Center", icon: BarChart3, path: "/reports" },
      { label: "التحقق من المصادقة", labelEn: "Document Verification", icon: FileCheck, path: "/verify" },
      { label: "المصادقة على التقارير", labelEn: "Report Approval", icon: Stamp, path: "/report-approval" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // WORKSPACE 2: الرصد والمراقبة (Monitoring & Surveillance)
  // ═══════════════════════════════════════════════════════════
  {
    id: "live_monitoring",
    label: "الرصد المباشر",
    labelEn: "Live Monitoring",
    icon: Scan,
    workspace: "monitoring",
    items: [
      { label: "الرصد المباشر", labelEn: "Live Scan", icon: Scan, path: "/live-scan" },
      { label: "رصد تليجرام", labelEn: "Telegram", icon: Send, path: "/telegram" },
      { label: "الدارك ويب", labelEn: "Dark Web", icon: Globe, path: "/darkweb" },
      { label: "مواقع اللصق", labelEn: "Paste Sites", icon: FileText, path: "/paste-sites" },
    ],
  },
  {
    id: "threat_tools",
    label: "أدوات التهديدات",
    labelEn: "Threat Tools",
    icon: Crosshair,
    workspace: "monitoring",
    items: [
      { label: "أدوات OSINT", labelEn: "OSINT Tools", icon: Radar, path: "/osint-tools" },
      { label: "قواعد صيد التهديدات", labelEn: "Threat Rules", icon: Crosshair, path: "/threat-rules" },
      { label: "رسم المعرفة", labelEn: "Knowledge Graph", icon: Network, path: "/knowledge-graph" },
      { label: "خريطة التهديدات", labelEn: "Threat Map", icon: Map, path: "/threat-map" },
      { label: "ملفات البائعين", labelEn: "Seller Profiles", icon: UserX, path: "/seller-profiles" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // WORKSPACE 3: إعدادات المنصة (Platform Settings)
  // ═══════════════════════════════════════════════════════════
  {
    id: "operations",
    label: "العمليات",
    labelEn: "Operations",
    icon: Activity,
    workspace: "settings",
    items: [
      { label: "مهام الرصد", labelEn: "Monitoring Jobs", icon: Radio, path: "/monitoring-jobs", requiresAuth: true, minRole: "admin" },
      { label: "قنوات التنبيه", labelEn: "Alert Channels", icon: Bell, path: "/alert-channels", requiresAuth: true, minRole: "admin" },
      { label: "التقارير المجدولة", labelEn: "Scheduled Reports", icon: CalendarClock, path: "/scheduled-reports", requiresAuth: true, minRole: "admin" },
    ],
  },
  {
    id: "admin",
    label: "الإدارة",
    labelEn: "Administration",
    icon: Shield,
    workspace: "settings",
    items: [
      { label: "مفاتيح API", labelEn: "API Keys", icon: KeyRound, path: "/api-keys", requiresAuth: true, minRole: "admin" },
      { label: "الاحتفاظ بالبيانات", labelEn: "Data Retention", icon: Archive, path: "/data-retention", requiresAuth: true, minRole: "admin" },
      { label: "سجل التدقيق", labelEn: "Audit Log", icon: ScrollText, path: "/audit-log", requiresAuth: true, minRole: "admin" },
      { label: "سجل التوثيقات", labelEn: "Documents Registry", icon: FileBarChart, path: "/documents-registry", requiresAuth: true, minRole: "admin" },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // WORKSPACE 4: المستخدمين والتدريب (Users & Training)
  // ═══════════════════════════════════════════════════════════
  {
    id: "user_mgmt",
    label: "إدارة المستخدمين",
    labelEn: "User Management",
    icon: Users,
    workspace: "users",
    items: [
      { label: "إدارة المستخدمين", labelEn: "User Management", icon: Users, path: "/user-management", requiresAuth: true, minRole: "admin" },
    ],
  },
  {
    id: "ai_control",
    label: "تحكم راصد الذكي",
    labelEn: "AI Control",
    icon: Sparkles,
    workspace: "users",
    items: [
      { label: "قاعدة المعرفة", labelEn: "Knowledge Base", icon: BookOpen, path: "/knowledge-base", requiresAuth: true, rootAdminOnly: true },
      { label: "سيناريوهات الشخصية", labelEn: "Personality", icon: HeartHandshake, path: "/personality-scenarios", requiresAuth: true, rootAdminOnly: true },
      { label: "مركز التدريب", labelEn: "Training Center", icon: GraduationCap, path: "/training-center", requiresAuth: true, rootAdminOnly: true },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // WORKSPACE 5: لوحة التحكم (Admin Dashboard)
  // ═══════════════════════════════════════════════════════════
  {
    id: "admin_overview",
    label: "النظرة العامة",
    labelEn: "Overview",
    icon: Crown,
    workspace: "admin",
    items: [
      { label: "نظرة عامة", labelEn: "Admin Overview", icon: Crown, path: "/admin", requiresAuth: true, rootAdminOnly: true },
    ],
  },
  {
    id: "admin_access",
    label: "الوصول والصلاحيات",
    labelEn: "Access & Permissions",
    icon: Shield,
    workspace: "admin",
    items: [
      { label: "الأدوار والصلاحيات", labelEn: "Roles & Permissions", icon: Shield, path: "/admin/roles", requiresAuth: true, rootAdminOnly: true },
      { label: "المجموعات", labelEn: "Groups", icon: Layers, path: "/admin/groups", requiresAuth: true, rootAdminOnly: true },
    ],
  },
  {
    id: "admin_config",
    label: "التهيئة",
    labelEn: "Configuration",
    icon: Settings,
    workspace: "admin",
    items: [
      { label: "مفاتيح الميزات", labelEn: "Feature Flags", icon: ToggleLeft, path: "/admin/feature-flags", requiresAuth: true, rootAdminOnly: true },
      { label: "إعدادات المظهر", labelEn: "Theme Settings", icon: Palette, path: "/admin/theme", requiresAuth: true, rootAdminOnly: true },
      { label: "إدارة القوائم", labelEn: "Menu Management", icon: MenuLucide, path: "/admin/menus", requiresAuth: true, rootAdminOnly: true },
    ],
  },
  {
    id: "admin_audit",
    label: "التدقيق",
    labelEn: "Audit",
    icon: ScrollText,
    workspace: "admin",
    items: [
      { label: "سجل تدقيق الإدارة", labelEn: "Admin Audit Log", icon: ScrollText, path: "/admin/audit-log", requiresAuth: true, rootAdminOnly: true },
    ],
  },
];

const allNavItems = navGroups.flatMap((g) => g.items);

const roleLabels: Record<string, string> = {
  executive: "تنفيذي",
  manager: "مدير",
  analyst: "محلل",
  viewer: "مشاهد",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const prevLocationRef = useRef(location);

  // Auto-scroll: follows any new content growing downward (AI typing, scans, verification, etc.)
  const autoScrollPages = ["/smart-rasid", "/live-scan"];
  const enableAutoScroll = autoScrollPages.includes(location);
  const { containerRef: mainContentRef } = useAutoScroll<HTMLElement>({ enabled: enableAutoScroll, threshold: 200 });

  // Scroll to top on EVERY page navigation (robust: multiple attempts + requestAnimationFrame)
  useEffect(() => {
    if (prevLocationRef.current !== location) {
      prevLocationRef.current = location;
      const scrollReset = () => {
        if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };
      // Immediate
      scrollReset();
      // After paint
      requestAnimationFrame(scrollReset);
      // After lazy-loaded content settles
      const t1 = setTimeout(scrollReset, 50);
      const t2 = setTimeout(scrollReset, 150);
      const t3 = setTimeout(scrollReset, 300);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [location, mainContentRef]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cinematicOpen, setCinematicOpen] = useState(false);
  const { user, isAuthenticated, loading, logout, isAdmin, ndmoRole } = useNdmoAuth();
  const { theme, themeMode, toggleTheme, switchable } = useTheme();

  // Get the platform userId for root admin check
  const platformUserId = (user as any)?.userId ?? "";
  const isRootAdmin = platformUserId === ROOT_ADMIN_USER_ID;

  // Active workspace from current route
  const activeWorkspace = getWorkspaceForRoute(location);

  // Filter nav groups by active workspace
  const workspaceGroups = navGroups.filter((g) => g.workspace === activeWorkspace);

  // Determine which group is active based on current location
  const activeGroupId = workspaceGroups.find((g) =>
    g.items.some((item) => item.path === location)
  )?.id;

  // Groups default to collapsed, only active group is expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      initial[g.id] = false;
    });
    if (activeGroupId) {
      initial[activeGroupId] = true;
    }
    return initial;
  });

  // Update expanded groups when location changes
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

  // Close mobile sidebar on navigation
  const handleNavClick = useCallback(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }, [mobileOpen]);

  const isItemVisible = (item: NavItem) => {
    if (item.rootAdminOnly && !isRootAdmin) return false;
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.minRole === "admin" && !isAdmin) return false;
    return true;
  };

  const isGroupVisible = (group: NavGroup) => {
    return group.items.some(isItemVisible);
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => item.path === location);
  };

  const isDark = theme === "dark";
  const logoSrc = isDark ? FULL_LOGO_LIGHT : FULL_LOGO_DARK;
  const { playClick, playHover } = useSoundEffects();

  // Redirect unauthenticated users to login page
  if (!loading && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ═══ AURORA BACKGROUND — SDAIA Navy/Teal ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0 dark:block hidden">
        <div
          className="absolute top-0 right-0 w-[60%] h-[50%] opacity-25"
          style={{
            background: "radial-gradient(ellipse at 70% 20%, rgba(61, 177, 172, 0.3), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[50%] h-[40%] opacity-20"
          style={{
            background: "radial-gradient(ellipse at 30% 80%, rgba(39, 52, 112, 0.25), transparent 60%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] opacity-10"
          style={{
            background: "radial-gradient(ellipse at center, rgba(100, 89, 167, 0.2), transparent 50%)",
          }}
        />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══ SIDEBAR — SDAIA Frosted Glass ═══ */}
      <aside
        className={`
          fixed lg:relative z-50 h-full
          transition-all duration-300 ease-in-out
          flex flex-col
          ${collapsed ? "w-[72px]" : "w-[270px]"}
          ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          right-0 lg:right-auto
          bg-sidebar
          backdrop-blur-2xl
          ${isDark ? 'border-l border-[rgba(61,177,172,0.08)]' : 'border-l border-[#e2e5ef]'}
        `}
      >
        {/* Logo area — Full Brand Logo with Creative Effects */}
        <div className={`flex items-center justify-center px-2 py-4 ${isDark ? 'border-b border-[rgba(61,177,172,0.1)]' : 'border-b border-[#edf0f7]'}`} style={{ minHeight: collapsed ? '60px' : '130px' }}>
          <motion.div
            className="relative flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{ width: collapsed ? '52px' : '100%', height: collapsed ? '52px' : '120px' }}
          >
            {/* Orbiting glow ring */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: collapsed ? '60px' : 'calc(100% + 16px)',
                height: collapsed ? '60px' : '130px',
                border: isDark ? '1px solid rgba(61, 177, 172, 0.12)' : '1px solid rgba(30, 58, 138, 0.06)',
                animation: 'breathing-glow 4s ease-in-out infinite',
                boxShadow: isDark ? '0 0 30px rgba(61, 177, 172, 0.1), inset 0 0 30px rgba(100, 89, 167, 0.06)' : '0 0 20px rgba(30, 58, 138, 0.04)',
              }}
            />
            {/* Floating particles around logo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#3DB1AC]' : 'bg-[#3b82f6]'}`} style={{ top: '8%', right: '12%', opacity: isDark ? 0.5 : 0.25, animation: 'orbit 6s linear infinite' }} />
              <div className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-[#6459A7]' : 'bg-[#1e3a8a]'}`} style={{ bottom: '15%', left: '8%', opacity: isDark ? 0.4 : 0.2, animation: 'orbit 8s linear infinite reverse' }} />
              <div className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#3DB1AC]' : 'bg-[#3b82f6]'}`} style={{ top: '50%', left: '3%', opacity: isDark ? 0.3 : 0.15, animation: 'orbit 10s linear infinite' }} />
            </div>
            {/* Logo image */}
            <img
              src={logoSrc}
              alt="منصة راصد - مكتب إدارة البيانات الوطنية"
              className="relative z-10 object-contain"
              style={{
                width: collapsed ? '44px' : '100%',
                height: collapsed ? '44px' : '110px',
                maxWidth: '260px',
                filter: isDark ? 'drop-shadow(0 0 15px rgba(61, 177, 172, 0.25)) drop-shadow(0 0 40px rgba(100, 89, 167, 0.12))' : 'drop-shadow(0 0 8px rgba(30, 58, 138, 0.08))',
                animation: 'logo-float 5s ease-in-out infinite',
              }}
            />
          </motion.div>
        </div>

        {/* ═══ WORKSPACE SWITCHER ═══ */}
        <div className={`${isDark ? 'border-b border-[rgba(61,177,172,0.08)]' : 'border-b border-[#edf0f7]'}`}>
          <WorkspaceSwitcher
            collapsed={collapsed}
            isAdmin={isAdmin}
            isRootAdmin={isRootAdmin}
          />
        </div>

        {/* Data flow line */}
        <div className="data-flow-line mx-4 opacity-50" />

        {/* Navigation with groups — filtered by active workspace */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {workspaceGroups.filter(isGroupVisible).map((group) => {
            const isExpanded = expandedGroups[group.id];
            const isActive = isGroupActive(group);
            const GroupIcon = group.icon;
            const visibleItems = group.items.filter(isItemVisible);

            return (
              <div key={group.id} className="mb-1">
                {/* Group header */}
                {!collapsed ? (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`
                      sidebar-group-header w-full flex items-center justify-between px-3 py-2 rounded-lg
                      text-xs font-semibold uppercase tracking-wider
                      ${isActive
                        ? isDark ? "text-[#3DB1AC] bg-[rgba(61,177,172,0.08)]" : "text-[#1e3a8a] bg-[rgba(30,58,138,0.06)]"
                        : isDark ? "text-[#D4DDEF]/60" : "text-[#5a6478]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <GroupIcon className="w-3.5 h-3.5" />
                      <span>{group.label}</span>
                      <span className="text-[9px] opacity-60 font-normal normal-case">{group.labelEn}</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`}
                    />
                  </button>
                ) : (
                  <div className={`h-px ${isDark ? 'bg-[rgba(61,177,172,0.08)]' : 'bg-[#edf0f7]'} mx-2 my-2`} />
                )}

                {/* Group items */}
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
                        {visibleItems.map((item) => {
                          const isItemActive = location === item.path;
                          const Icon = item.icon;
                          return (
                            <Link key={item.path} href={item.path} onClick={() => { handleNavClick(); playClick(); }}>
                              <motion.div
                                whileHover={{ x: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                  sidebar-nav-item flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                                  group relative
                                  ${isItemActive
                                    ? `sidebar-nav-item-active ${isDark ? 'border border-[rgba(61,177,172,0.25)]' : 'border border-[rgba(30,58,138,0.12)]'}`
                                    : isDark ? 'text-sidebar-foreground/60' : 'text-[#5a6478]'
                                  }
                                `}
                              >
                                {/* Active indicator bar */}
                                {isItemActive && (
                                  <motion.div
                                    layoutId="activeNav"
                                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 ${isDark ? 'bg-[#3DB1AC]' : 'bg-[#1e3a8a]'} rounded-l-full`}
                                    style={{ boxShadow: isDark ? '0 0 8px rgba(61, 177, 172, 0.4)' : '0 0 6px rgba(30, 58, 138, 0.2)' }}
                                  />
                                )}
                                <div className="sidebar-nav-icon">
                                  <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isItemActive ? (isDark ? "text-[#3DB1AC]" : "text-[#1e3a8a]") : ""}`} />
                                </div>
                                {!collapsed && (
                                  <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
                                )}
                                {/* Root admin badge */}
                                {!collapsed && item.rootAdminOnly && (
                                  <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 mr-auto">
                                    ROOT
                                  </span>
                                )}
                                {collapsed && (
                                  <div className={`absolute right-14 ${isDark ? 'bg-[rgba(26,37,80,0.9)] text-[#E1DEF5] border-[rgba(61,177,172,0.15)]' : 'bg-white text-[#1c2833] border-[#e2e5ef]'} backdrop-blur-xl text-xs py-1 px-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border`}>
                                    {item.label}
                                  </div>
                                )}
                              </motion.div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User profile / login at bottom */}
        <div className={`p-3 ${isDark ? 'border-t border-[rgba(61,177,172,0.1)]' : 'border-t border-[#edf0f7]'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-[#3DB1AC]/50' : 'text-[#1e3a8a]/50'}`} />
            </div>
          ) : isAuthenticated && user ? (
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
              <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-[rgba(61,177,172,0.15)] border-[rgba(61,177,172,0.25)]' : 'bg-[rgba(30,58,138,0.08)] border-[rgba(30,58,138,0.15)]'} flex items-center justify-center flex-shrink-0 border`}>
                <span className={`text-xs font-bold ${isDark ? 'text-[#3DB1AC]' : 'text-[#1e3a8a]'}`}>
                  {user.name?.charAt(0) || "U"}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${isDark ? 'text-[#D4DDEF]' : 'text-[#1c2833]'} truncate`}>{user.name || "مستخدم"}</p>
                  <p className={`text-[10px] ${isDark ? 'text-[#D4DDEF]/50' : 'text-[#5a6478]'} truncate`}>
                    {isRootAdmin ? "مدير النظام الرئيسي" : roleLabels[ndmoRole] || ndmoRole}
                    {isAdmin && !isRootAdmin && " (مشرف)"}
                    {isRootAdmin && " (Root)"}
                  </p>
                </div>
              )}
              {!collapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 ${isDark ? 'text-[#D4DDEF]/50 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}
                  onClick={() => {
                    logout();
                    toast("تم تسجيل الخروج");
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <a href="/login">
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 text-xs w-full ${isDark ? 'border-[rgba(61,177,172,0.2)] hover:bg-[rgba(61,177,172,0.1)] text-[#D4DDEF]' : 'border-[#d8dce8] hover:bg-[rgba(30,58,138,0.04)] text-[#1c2833]'} ${collapsed ? "px-0 justify-center" : ""}`}
              >
                <LogIn className="w-3.5 h-3.5" />
                {!collapsed && "تسجيل الدخول"}
              </Button>
            </a>
          )}
        </div>

        {/* Collapse toggle */}
        <div className={`p-2 ${isDark ? 'border-t border-[rgba(61,177,172,0.1)]' : 'border-t border-[#edf0f7]'} hidden lg:block`}>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-center ${isDark ? 'text-[#D4DDEF]/40 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile close */}
        <button
          className={`absolute top-4 left-4 lg:hidden ${isDark ? 'text-[#D4DDEF]/50 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top header — SDAIA frosted glass */}
        <header className={`h-16 flex items-center justify-between px-4 lg:px-6 backdrop-blur-xl sticky top-0 z-30 ${isDark ? 'border-b border-[rgba(61,177,172,0.08)] bg-[rgba(13,21,41,0.7)]' : 'border-b border-[#e2e5ef] bg-white/90'}`}>
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {currentPage?.label || "لوحة القيادة"}
              </h2>
              <p className="text-xs text-muted-foreground">{currentPage?.labelEn || "Dashboard"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {switchable && toggleTheme && (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground dark:hover:bg-[rgba(61,177,172,0.08)] relative"
                onClick={() => { toggleTheme(); playClick(); }}
                title={
                  themeMode === "light" ? "الوضع الفاتح — انقر للتبديل إلى الداكن"
                    : themeMode === "dark" ? "الوضع الداكن — انقر للتبديل إلى التلقائي"
                    : "تلقائي (حسب النظام) — انقر للتبديل إلى الفاتح"
                }
              >
                {themeMode === "light" && <Sun className="w-4 h-4" />}
                {themeMode === "dark" && <Moon className="w-4 h-4" />}
                {themeMode === "auto" && <Monitor className="w-4 h-4" />}
                {themeMode === "auto" && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-background" />
                )}
              </Button>
            )}

            {/* Search — link to Smart Rasid */}
            <Link href="/smart-rasid">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground dark:hover:bg-[rgba(61,177,172,0.08)]"
                title="البحث الذكي"
              >
                <Search className="w-4 h-4" />
              </Button>
            </Link>

            {/* Real-time Notifications */}
            <NotificationBell userId={user?.id} />

            {/* Cinematic Mode Button */}
            <CinematicButton onClick={() => setCinematicOpen(true)} />

            {/* Status indicator — SDAIA teal glow */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-[rgba(61,177,172,0.08)] border-[rgba(61,177,172,0.2)]' : 'bg-[rgba(30,58,138,0.04)] border-[rgba(30,58,138,0.12)]'} border`}>
              <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#3DB1AC]' : 'bg-[#10b981]'} animate-pulse-glow`} style={{ boxShadow: isDark ? '0 0 6px rgba(61, 177, 172, 0.5)' : '0 0 4px rgba(16, 185, 129, 0.4)' }} />
              <span className={`text-xs font-medium ${isDark ? 'text-[#3DB1AC]' : 'text-[#10b981]'}`}>نشط</span>
            </div>
          </div>
        </header>

        {/* Page content with particle background */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 lg:p-6 relative">
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

      {/* Cinematic Mode Overlay */}
      <CinematicMode
        isOpen={cinematicOpen}
        onClose={() => setCinematicOpen(false)}
        pageTitle={allNavItems.find((i: NavItem) => i.path === location)?.label}
      >
        {children}
      </CinematicMode>
    </div>
  );
}

/** Export ROOT_ADMIN_USER_ID for use in other components */
export { ROOT_ADMIN_USER_ID };
