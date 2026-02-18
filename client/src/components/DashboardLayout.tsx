/**
 * DashboardLayout — SDAIA Ultra Premium Design System
 * RTL-first sidebar with SDAIA official colors (#273470, #6459A7, #3DB1AC)
 * Glassmorphism, scan-line effects, and premium animations
 * - Mobile: auto-close sidebar on nav item click
 * - Groups: collapsed by default, only active group expanded
 * - Root Admin protection: AI control pages only visible to mruhaily
 * - Workspace Switcher: الخصوصية / حالات الرصد — changes ENTIRE layout
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
  Activity, Crown, Layers, ToggleLeft, Palette, Home, Eye, QrCode,
  FolderOpen, Import, History, Wrench, PanelTop, ClipboardList, Clock,
  Download, FileDown,
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
import RasidCharacterWidget from "@/components/RasidCharacterWidget";

/* SDAIA Official FULL Logo URLs */
const FULL_LOGO_DARK = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/vyIfeykxwXasuonx.png";
const FULL_LOGO_LIGHT = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/tSiomIdoNdNFAtOB.png";
const RASID_LOGO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/ziWPuMClYqvYmkJG.png";

/** Root Admin userId — protected from any modifications */
const ROOT_ADMIN_USER_ID = "mruhaily";

/* ═══ Workspace Types ═══ */
type WorkspaceId = "privacy" | "leaks";

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

/* ═══ Workspace config ═══ */
const workspaceConfig: Record<WorkspaceId, {
  title: string;
  titleEn: string;
  accentColor: string;
  accentColorLight: string;
  accentBg: string;
  accentBgLight: string;
  accentBorder: string;
  accentBorderLight: string;
  headerBg: string;
  headerBgLight: string;
}> = {
  leaks: {
    title: "رصد حالات التسرب",
    titleEn: "Monitoring Cases",
    accentColor: "#3DB1AC",
    accentColorLight: "#1e3a8a",
    accentBg: "rgba(61,177,172,0.15)",
    accentBgLight: "rgba(30,58,138,0.08)",
    accentBorder: "rgba(61,177,172,0.25)",
    accentBorderLight: "rgba(30,58,138,0.12)",
    headerBg: "rgba(13,21,41,0.85)",
    headerBgLight: "rgba(255,255,255,0.95)",
  },
  privacy: {
    title: "رصد سياسة الخصوصية",
    titleEn: "Privacy Monitoring",
    accentColor: "#22c55e",
    accentColorLight: "#16a34a",
    accentBg: "rgba(34,197,94,0.15)",
    accentBgLight: "rgba(22,163,74,0.08)",
    accentBorder: "rgba(34,197,94,0.25)",
    accentBorderLight: "rgba(22,163,74,0.12)",
    headerBg: "rgba(13,21,41,0.85)",
    headerBgLight: "rgba(255,255,255,0.95)",
  },
};

/* ═══ SHARED NAV ITEMS (flat, no groups — always visible) ═══ */
const sharedNavItems: NavItem[] = [
  { label: "الرئيسية", labelEn: "Home", icon: Home, path: "/" },
  { label: "لوحتي", labelEn: "My Dashboard", icon: PanelTop, path: "/my-custom-dashboard" },
  { label: "المتابعات", labelEn: "Follow-ups", icon: ClipboardList, path: "/cases" },
  { label: "التقارير", labelEn: "Reports", icon: BarChart3, path: "/reports" },
  { label: "راصد الذكي", labelEn: "Smart Rasid", icon: Bot, path: "/smart-rasid" },
  { label: "التوثيق والتحقق", labelEn: "Verification & QR", icon: QrCode, path: "/verify" },
  { label: "الإدارة", labelEn: "Administration", icon: Crown, path: "/admin", requiresAuth: true, minRole: "admin" },
];

/* ═══ PRIVACY WORKSPACE NAV GROUPS ═══ */
const privacyNavGroups: NavGroup[] = [
  {
    id: "prv_main",
    label: "لوحة الخصوصية",
    labelEn: "Privacy Dashboard",
    icon: Shield,
    items: [
      { label: "لوحة الخصوصية", labelEn: "Privacy Dashboard", icon: Shield, path: "/leadership" },
      { label: "المواقع", labelEn: "Sites", icon: Globe, path: "/sites" },
      { label: "التغييرات", labelEn: "Changes", icon: Eye, path: "/change-detection" },
      { label: "البنود الثمانية (المادة 12)", labelEn: "8 Clauses", icon: FileText, path: "/clauses" },
      { label: "الاستيراد والفحص", labelEn: "Import & Scan", icon: ScanSearch, path: "/scan" },
      { label: "السجل", labelEn: "History", icon: History, path: "/scan-history" },
    ],
  },
  {
    id: "prv_tools",
    label: "أدوات إضافية",
    labelEn: "Additional Tools",
    icon: Wrench,
    items: [
      { label: "الفحص المباشر", labelEn: "Live Scan", icon: Radio, path: "/live-scan" },
      { label: "الفحص الجماعي", labelEn: "Batch Scan", icon: Import, path: "/batch-scan" },
      { label: "الفحص المتقدم", labelEn: "Advanced Scan", icon: Scan, path: "/advanced-scan" },
      { label: "الفحص العميق", labelEn: "Deep Scan", icon: Radar, path: "/deep-scan" },
      { label: "مكتبة الفحوصات", labelEn: "Scan Library", icon: FolderOpen, path: "/scan-library" },
      { label: "جدولة الفحوصات", labelEn: "Scan Schedules", icon: CalendarClock, path: "/scan-schedules" },
      { label: "مقارنة الامتثال", labelEn: "Compliance Comparison", icon: Link2, path: "/compliance-comparison" },
      { label: "خريطة الامتثال", labelEn: "Compliance Heatmap", icon: Map, path: "/compliance-heatmap" },
      { label: "التحليلات المتقدمة", labelEn: "Advanced Analytics", icon: BarChart3, path: "/advanced-analytics" },
      { label: "لوحة المؤشرات", labelEn: "KPI Dashboard", icon: Activity, path: "/kpi-dashboard" },
      { label: "المقارنة الزمنية", labelEn: "Time Comparison", icon: CalendarClock, path: "/time-comparison" },
      { label: "مقارنة القطاعات", labelEn: "Sector Comparison", icon: Layers, path: "/sector-comparison" },
      { label: "المقارنة التفاعلية", labelEn: "Interactive Compare", icon: Link2, path: "/interactive-comparison" },
      { label: "تغطية الاستراتيجية", labelEn: "Strategy Coverage", icon: Shield, path: "/strategy-coverage" },
      { label: "اللوحة الحية", labelEn: "Real-time", icon: Radio, path: "/real-time" },
      { label: "التقارير المخصصة", labelEn: "Custom Reports", icon: FileBarChart, path: "/custom-reports" },
      { label: "التقارير المجدولة", labelEn: "Scheduled Reports", icon: CalendarClock, path: "/scheduled-reports" },
      { label: "تقارير PDF", labelEn: "PDF Reports", icon: FileText, path: "/pdf-reports" },
      { label: "التقرير التنفيذي", labelEn: "Executive Report", icon: LayoutDashboard, path: "/executive-report" },
      { label: "الخطابات", labelEn: "Letters", icon: Send, path: "/letters" },
      { label: "متتبع التحسين", labelEn: "Improvement Tracker", icon: CheckCircle2, path: "/improvement-tracker" },
      { label: "تصدير البيانات", labelEn: "Export Data", icon: Archive, path: "/export-data" },
      { label: "منشئ العروض", labelEn: "Presentation Builder", icon: Layers, path: "/presentation-builder" },
      { label: "التحليل الجماعي", labelEn: "Bulk Analysis", icon: Brain, path: "/bulk-analysis" },
      { label: "البحث المتقدم", labelEn: "Advanced Search", icon: Search, path: "/advanced-search" },
      { label: "التنبيهات الذكية", labelEn: "Smart Alerts", icon: Bell, path: "/smart-alerts" },
      { label: "التنبيهات المرئية", labelEn: "Visual Alerts", icon: Eye, path: "/visual-alerts" },
      { label: "إشعارات البريد", labelEn: "Email Notifications", icon: Send, path: "/email-notifications" },
      { label: "إدارة البريد", labelEn: "Email Management", icon: Send, path: "/email-management" },
      { label: "قوالب الرسائل", labelEn: "Message Templates", icon: FileText, path: "/message-templates" },
      { label: "قواعد التصعيد", labelEn: "Escalation Rules", icon: ShieldAlert, path: "/escalation" },
      { label: "التطبيقات", labelEn: "Mobile Apps", icon: Monitor, path: "/mobile-apps" },
    ],
  },
];

/* ═══ LEAKS WORKSPACE NAV GROUPS ═══ */
const leaksNavGroups: NavGroup[] = [
  {
    id: "lk_main",
    label: "لوحة حالات الرصد",
    labelEn: "Monitoring Dashboard",
    icon: Eye,
    items: [
      { label: "لوحة حالات الرصد", labelEn: "Monitoring Dashboard", icon: Eye, path: "/national-overview" },
      { label: "سجل الحالات", labelEn: "Cases Log", icon: ShieldAlert, path: "/leaks" },
      { label: "تحليل الحالات", labelEn: "Case Analysis", icon: ScanSearch, path: "/leak-anatomy" },
      { label: "مصادر النشر", labelEn: "Publishing Sources", icon: Globe, path: "/source-intelligence" },
      { label: "الرصد المباشر", labelEn: "Live Monitoring", icon: Scan, path: "/live-scan" },
    ],
  },
  {
    id: "lk_tools",
    label: "أدوات إضافية",
    labelEn: "Additional Tools",
    icon: Wrench,
    items: [
      { label: "سجل الحالات المتقدم", labelEn: "Cases Registry", icon: ScrollText, path: "/incidents-registry" },
      { label: "القطاعات المتضررة", labelEn: "Sector Analysis", icon: Layers, path: "/sector-analysis" },
      { label: "الخط الزمني", labelEn: "Timeline", icon: CalendarClock, path: "/leak-timeline" },
      { label: "تحليل الأثر", labelEn: "Impact Assessment", icon: BarChart3, path: "/impact-assessment" },
      { label: "التحليل الجغرافي", labelEn: "Geo Analysis", icon: Map, path: "/geo-analysis" },
      { label: "جهات النشر", labelEn: "Publishing Entities", icon: UserX, path: "/threat-actors-analysis" },
      { label: "ملفات المصادر", labelEn: "Source Profiles", icon: UserX, path: "/seller-profiles" },
      { label: "رصد المنصات", labelEn: "Telegram", icon: Send, path: "/telegram" },
      { label: "مواقع النشر", labelEn: "Publishing Sites", icon: Globe, path: "/darkweb" },
      { label: "مواقع اللصق", labelEn: "Paste Sites", icon: FileText, path: "/paste-sites" },
      { label: "أدوات البحث", labelEn: "Search Tools", icon: Radar, path: "/osint-tools" },
      { label: "قواعد الرصد", labelEn: "Monitoring Rules", icon: Crosshair, path: "/threat-rules" },
      { label: "رسم المعرفة", labelEn: "Knowledge Graph", icon: Network, path: "/knowledge-graph" },
      { label: "خريطة الرصد", labelEn: "Monitoring Map", icon: Map, path: "/threat-map" },
      { label: "التقارير التنفيذية", labelEn: "Executive Brief", icon: LayoutDashboard, path: "/executive-brief" },
      { label: "المقارنة", labelEn: "Comparison", icon: Link2, path: "/incident-compare" },
      { label: "الحملات", labelEn: "Campaigns", icon: Crosshair, path: "/campaign-tracker" },
      { label: "التوصيات", labelEn: "Recommendations", icon: Brain, path: "/recommendations-hub" },
      { label: "الامتثال PDPL", labelEn: "PDPL Compliance", icon: Shield, path: "/pdpl-compliance" },
      { label: "المصادقة على التقارير", labelEn: "Report Approval", icon: Stamp, path: "/report-approval" },
      { label: "أطلس البيانات الشخصية", labelEn: "PII Atlas", icon: Network, path: "/pii-atlas" },
      { label: "مختبر الأنماط", labelEn: "Pattern Lab", icon: ScanSearch, path: "/pii-classifier" },
      { label: "عدسة الأثر والحقوق", labelEn: "Impact & Rights", icon: Link2, path: "/evidence-chain" },
      { label: "الاتجاهات والمقارنات", labelEn: "Trends", icon: Brain, path: "/feedback-accuracy" },
      { label: "مهام الرصد", labelEn: "Monitoring Jobs", icon: Radio, path: "/monitoring-jobs" },
      { label: "قنوات التنبيه", labelEn: "Alert Channels", icon: Bell, path: "/alert-channels" },
    ],
  },
];

/* ═══ ADMIN NAV GROUPS (only for root admin) ═══ */
const adminNavGroups: NavGroup[] = [
  {
    id: "admin_system",
    label: "إدارة النظام",
    labelEn: "System Admin",
    icon: Settings,
    items: [
      { label: "المشرف العام", labelEn: "Super Admin", icon: Crown, path: "/super-admin", requiresAuth: true, rootAdminOnly: true },
      { label: "لوحة الإدارة", labelEn: "Admin Panel", icon: Settings, path: "/admin-panel", requiresAuth: true, rootAdminOnly: true },
      { label: "صحة النظام", labelEn: "System Health", icon: Activity, path: "/system-health", requiresAuth: true, rootAdminOnly: true },
      { label: "مفاتيح API", labelEn: "API Keys", icon: KeyRound, path: "/api-keys", requiresAuth: true, minRole: "admin" },
      { label: "الاحتفاظ بالبيانات", labelEn: "Data Retention", icon: Archive, path: "/data-retention", requiresAuth: true, minRole: "admin" },
      { label: "سجل التدقيق", labelEn: "Audit Log", icon: ScrollText, path: "/audit-log", requiresAuth: true, minRole: "admin" },
      { label: "تحليلات الاستخدام", labelEn: "Usage Analytics", icon: BarChart3, path: "/usage-analytics", requiresAuth: true, rootAdminOnly: true },
      { label: "إدارة المستخدمين", labelEn: "Users", icon: Users, path: "/user-management", requiresAuth: true, minRole: "admin" },
    ],
  },
  {
    id: "admin_ai",
    label: "تحكم راصد الذكي",
    labelEn: "AI Control",
    icon: Sparkles,
    items: [
      { label: "إدارة السيناريوهات", labelEn: "Scenarios", icon: Sparkles, path: "/scenario-management", requiresAuth: true, rootAdminOnly: true },
      { label: "إدارة الذكاء الاصطناعي", labelEn: "AI Management", icon: Bot, path: "/ai-management", requiresAuth: true, rootAdminOnly: true },
      { label: "قاعدة المعرفة", labelEn: "Knowledge Base", icon: BookOpen, path: "/knowledge-base", requiresAuth: true, rootAdminOnly: true },
      { label: "سيناريوهات الشخصية", labelEn: "Personality", icon: HeartHandshake, path: "/personality-scenarios", requiresAuth: true, rootAdminOnly: true },
      { label: "مركز التدريب", labelEn: "Training Center", icon: GraduationCap, path: "/training-center", requiresAuth: true, rootAdminOnly: true },
    ],
  },
];

/* Build all items for route lookup */
const allNavItems = [
  ...sharedNavItems,
  ...privacyNavGroups.flatMap((g) => g.items),
  ...leaksNavGroups.flatMap((g) => g.items),
  ...adminNavGroups.flatMap((g) => g.items),
];

const roleLabels: Record<string, string> = {
  executive: "تنفيذي",
  manager: "مدير",
  analyst: "محلل",
  viewer: "مشاهد",
};

/* ═══ Route → Workspace mapping ═══ */
const privacyPaths = new Set(privacyNavGroups.flatMap((g) => g.items.map((i) => i.path)));
const leaksPaths = new Set(leaksNavGroups.flatMap((g) => g.items.map((i) => i.path)));

function getWorkspaceForRoute(path: string): WorkspaceId {
  if (privacyPaths.has(path)) return "privacy";
  if (leaksPaths.has(path)) return "leaks";
  return (localStorage.getItem("rasid_workspace") as WorkspaceId) || "leaks";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const prevLocationRef = useRef(location);

  // Auto-scroll for specific pages
  const autoScrollPages = ["/smart-rasid", "/live-scan"];
  const enableAutoScroll = autoScrollPages.includes(location);
  const { containerRef: mainContentRef } = useAutoScroll<HTMLElement>({ enabled: enableAutoScroll, threshold: 200 });

  // Scroll to top on page navigation
  useEffect(() => {
    if (prevLocationRef.current !== location) {
      prevLocationRef.current = location;
      const scrollReset = () => {
        if (mainContentRef.current) mainContentRef.current.scrollTop = 0;
        window.scrollTo(0, 0);
      };
      scrollReset();
      requestAnimationFrame(scrollReset);
      const t1 = setTimeout(scrollReset, 50);
      const t2 = setTimeout(scrollReset, 150);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [location, mainContentRef]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cinematicOpen, setCinematicOpen] = useState(false);
  const { user, isAuthenticated, loading, logout, isAdmin, ndmoRole } = useNdmoAuth();
  const { theme, themeMode, toggleTheme, switchable } = useTheme();

  // Root admin check
  const platformUserId = (user as any)?.userId ?? "";
  const isRootAdmin = platformUserId === ROOT_ADMIN_USER_ID;

  // ═══ WORKSPACE STATE ═══
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>(() => getWorkspaceForRoute(location));

  // Update workspace when route changes
  useEffect(() => {
    if (privacyPaths.has(location)) {
      setActiveWorkspace("privacy");
      localStorage.setItem("rasid_workspace", "privacy");
    } else if (leaksPaths.has(location)) {
      setActiveWorkspace("leaks");
      localStorage.setItem("rasid_workspace", "leaks");
    }
  }, [location]);

  const wsConfig = workspaceConfig[activeWorkspace];
  const wsNavGroups = activeWorkspace === "privacy" ? privacyNavGroups : leaksNavGroups;

  // Groups default to collapsed, only active group expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Find active group
  const activeGroupId = wsNavGroups.find((g) => g.items.some((item) => item.path === location))?.id
    || adminNavGroups.find((g) => g.items.some((item) => item.path === location))?.id;

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
    if (mobileOpen) setMobileOpen(false);
  }, [mobileOpen]);

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
  const accent = isDark ? wsConfig.accentColor : wsConfig.accentColorLight;

  // Redirect unauthenticated users
  if (!loading && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  /* ═══ Render a single nav item ═══ */
  const renderNavItem = (item: NavItem, showLabel = true) => {
    if (!isItemVisible(item)) return null;
    const isItemActive = location === item.path;
    const Icon = item.icon;
    return (
      <Link key={item.path} href={item.path} onClick={() => { handleNavClick(); playClick(); }}>
        <motion.div
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`
            sidebar-nav-item flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
            group relative transition-colors duration-150
            ${isItemActive
              ? `sidebar-nav-item-active ${isDark ? `border border-[${wsConfig.accentBorder}]` : `border border-[${wsConfig.accentBorderLight}]`}`
              : isDark ? 'text-sidebar-foreground/60 hover:text-sidebar-foreground/80 hover:bg-white/[0.03]' : 'text-[#5a6478] hover:text-[#1c2833] hover:bg-black/[0.02]'
            }
          `}
          style={isItemActive ? { backgroundColor: isDark ? wsConfig.accentBg : wsConfig.accentBgLight, borderColor: isDark ? wsConfig.accentBorder : wsConfig.accentBorderLight } : undefined}
        >
          {/* Active indicator bar */}
          {isItemActive && (
            <motion.div
              layoutId="activeNav"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full"
              style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}66` }}
            />
          )}
          <div className="sidebar-nav-icon">
            <Icon className="w-4 h-4 flex-shrink-0" style={isItemActive ? { color: accent } : undefined} />
          </div>
          {showLabel && !collapsed && (
            <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
          )}
          {!collapsed && item.rootAdminOnly && (
            <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 mr-auto">ROOT</span>
          )}
          {collapsed && (
            <div className={`absolute right-14 ${isDark ? 'bg-[rgba(26,37,80,0.9)] text-[#E1DEF5] border-[rgba(61,177,172,0.15)]' : 'bg-white text-[#1c2833] border-[#e2e5ef]'} backdrop-blur-xl text-xs py-1 px-2 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border`}>
              {item.label}
            </div>
          )}
        </motion.div>
      </Link>
    );
  };

  /* ═══ Render a nav group ═══ */
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
              w-full flex items-center justify-between px-3 py-2 rounded-lg
              text-xs font-semibold tracking-wider transition-colors duration-150
              ${isActive
                ? `bg-[${isDark ? wsConfig.accentBg : wsConfig.accentBgLight}]`
                : isDark ? "text-[#D4DDEF]/60 hover:text-[#D4DDEF]/80" : "text-[#5a6478] hover:text-[#1c2833]"
              }
            `}
            style={isActive ? { color: accent, backgroundColor: isDark ? wsConfig.accentBg : wsConfig.accentBgLight } : undefined}
          >
            <div className="flex items-center gap-2">
              <GroupIcon className="w-3.5 h-3.5" />
              <span>{group.label}</span>
              <span className="text-[9px] opacity-50 font-normal">{group.labelEn}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`} />
          </button>
        ) : (
          <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-black/5'} mx-2 my-2`} />
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
                {visibleItems.map((item) => renderNavItem(item))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ═══ AURORA BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0 dark:block hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[50%] opacity-25" style={{ background: `radial-gradient(ellipse at 70% 20%, ${wsConfig.accentColor}4D, transparent 70%)` }} />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] opacity-20" style={{ background: "radial-gradient(ellipse at 30% 80%, rgba(39, 52, 112, 0.25), transparent 60%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] opacity-10" style={{ background: "radial-gradient(ellipse at center, rgba(100, 89, 167, 0.2), transparent 50%)" }} />
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

      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`
          fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out flex flex-col
          ${collapsed ? "w-[72px]" : "w-[270px]"}
          ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          right-0 lg:right-auto bg-sidebar backdrop-blur-2xl
          ${isDark ? 'border-l border-white/[0.06]' : 'border-l border-[#e2e5ef]'}
        `}
      >
        {/* Logo area */}
        <div className={`flex items-center justify-center px-2 py-6 ${isDark ? 'border-b border-white/[0.06]' : 'border-b border-[#edf0f7]'}`} style={{ minHeight: collapsed ? '72px' : '160px' }}>
          <motion.div
            className="relative flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{ width: collapsed ? '52px' : '100%', height: collapsed ? '52px' : '140px' }}
          >
            {/* Orbiting glow ring */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: collapsed ? '60px' : 'calc(100% + 16px)',
                height: collapsed ? '60px' : '150px',
                border: `1px solid ${accent}1F`,
                animation: 'breathing-glow 4s ease-in-out infinite',
                boxShadow: `0 0 30px ${accent}1A, inset 0 0 30px rgba(100, 89, 167, 0.06)`,
              }}
            />
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute w-1.5 h-1.5 rounded-full" style={{ top: '8%', right: '12%', opacity: 0.4, backgroundColor: accent, animation: 'orbit 6s linear infinite' }} />
              <div className="absolute w-1 h-1 rounded-full bg-[#6459A7]" style={{ bottom: '15%', left: '8%', opacity: 0.3, animation: 'orbit 8s linear infinite reverse' }} />
            </div>
            <img
              src={collapsed ? RASID_LOGO : logoSrc}
              alt="منصة راصد - مكتب إدارة البيانات الوطنية"
              className="relative z-10 object-contain"
              style={{
                width: collapsed ? '44px' : '100%',
                height: collapsed ? '44px' : '130px',
                maxWidth: '260px',
                filter: `drop-shadow(0 0 15px ${accent}40) drop-shadow(0 0 40px rgba(100, 89, 167, 0.12))`,
                animation: 'logo-float 5s ease-in-out infinite',
              }}
            />
          </motion.div>
        </div>

        {/* ═══ WORKSPACE SWITCHER — Prominent tabs ═══ */}
        {!collapsed && (
          <div className={`mx-3 mt-3 mb-2 flex rounded-xl overflow-hidden ${isDark ? 'bg-white/[0.04] border border-white/[0.08]' : 'bg-black/[0.02] border border-black/[0.06]'}`}>
            <button
              onClick={() => { setActiveWorkspace("leaks"); localStorage.setItem("rasid_workspace", "leaks"); playClick(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-bold transition-all duration-300 rounded-lg m-0.5 ${
                activeWorkspace === "leaks"
                  ? "text-white shadow-lg"
                  : isDark ? "text-[#D4DDEF]/50 hover:text-[#D4DDEF]/70" : "text-[#5a6478] hover:text-[#1c2833]"
              }`}
              style={activeWorkspace === "leaks" ? { backgroundColor: workspaceConfig.leaks.accentColor, boxShadow: `0 4px 12px ${workspaceConfig.leaks.accentColor}40` } : undefined}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>حالات الرصد</span>
            </button>
            <button
              onClick={() => { setActiveWorkspace("privacy"); localStorage.setItem("rasid_workspace", "privacy"); playClick(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs font-bold transition-all duration-300 rounded-lg m-0.5 ${
                activeWorkspace === "privacy"
                  ? "text-white shadow-lg"
                  : isDark ? "text-[#D4DDEF]/50 hover:text-[#D4DDEF]/70" : "text-[#5a6478] hover:text-[#1c2833]"
              }`}
              style={activeWorkspace === "privacy" ? { backgroundColor: workspaceConfig.privacy.accentColor, boxShadow: `0 4px 12px ${workspaceConfig.privacy.accentColor}40` } : undefined}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>الخصوصية</span>
            </button>
          </div>
        )}

        {/* Data flow line */}
        <div className="data-flow-line mx-4 opacity-30" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {/* Shared flat items */}
          <div className="space-y-0.5 mb-3">
            {sharedNavItems.map((item) => renderNavItem(item))}
          </div>

          {/* Separator */}
          <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'} mx-2 my-2`} />

          {/* Workspace-specific groups */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWorkspace}
              initial={{ opacity: 0, x: activeWorkspace === "privacy" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeWorkspace === "privacy" ? 10 : -10 }}
              transition={{ duration: 0.2 }}
            >
              {wsNavGroups.map(renderNavGroup)}
            </motion.div>
          </AnimatePresence>

          {/* Admin groups (only for admin) */}
          {isRootAdmin && (
            <>
              <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'} mx-2 my-2`} />
              {adminNavGroups.map(renderNavGroup)}
            </>
          )}
        </nav>

        {/* User profile */}
        <div className={`p-3 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-[#edf0f7]'}`}>
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: `${accent}80` }} />
            </div>
          ) : isAuthenticated && user ? (
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border" style={{ backgroundColor: `${accent}1A`, borderColor: `${accent}33` }}>
                <span className="text-xs font-bold" style={{ color: accent }}>{user.name?.charAt(0) || "U"}</span>
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
                <Button variant="ghost" size="sm" className={`h-7 w-7 p-0 ${isDark ? 'text-[#D4DDEF]/50 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}
                  onClick={() => { logout(); toast("تم تسجيل الخروج"); }}>
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <a href="/login">
              <Button variant="outline" size="sm" className={`gap-2 text-xs w-full ${collapsed ? "px-0 justify-center" : ""}`}>
                <LogIn className="w-3.5 h-3.5" />
                {!collapsed && "تسجيل الدخول"}
              </Button>
            </a>
          )}
        </div>

        {/* Collapse toggle */}
        <div className={`p-2 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-[#edf0f7]'} hidden lg:block`}>
          <Button variant="ghost" size="sm" className={`w-full justify-center ${isDark ? 'text-[#D4DDEF]/40 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}
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
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top header — changes with workspace */}
        <header
          className="h-16 flex items-center justify-between px-4 lg:px-6 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300"
          style={{
            backgroundColor: isDark ? wsConfig.headerBg : wsConfig.headerBgLight,
            borderBottom: `1px solid ${isDark ? `${accent}14` : '#e2e5ef'}`,
          }}
        >
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            {/* Workspace title in header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}1A` }}>
                {activeWorkspace === "privacy" ? <Shield className="w-5 h-5" style={{ color: accent }} /> : <Eye className="w-5 h-5" style={{ color: accent }} />}
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">{wsConfig.title}</h2>
                <p className="text-[10px] text-muted-foreground">
                  {currentPage?.label && currentPage.label !== wsConfig.title ? currentPage.label : wsConfig.titleEn}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border`} style={{ backgroundColor: `${accent}0D`, borderColor: `${accent}26` }}>
              <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}80` }} />
              <span className="text-xs font-medium" style={{ color: accent }}>مباشر</span>
            </div>

            {/* Date/Time */}
            <div className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] ${isDark ? 'text-[#D4DDEF]/60' : 'text-[#5a6478]'}`}>
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Theme Toggle */}
            {switchable && toggleTheme && (
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative"
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

            {/* Export buttons */}
            <Button variant="ghost" size="sm" className={`hidden lg:flex gap-1 text-xs ${isDark ? 'text-[#D4DDEF]/60 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}>
              <FileDown className="w-3.5 h-3.5" />
              <span>تصدير الكل</span>
            </Button>

            {/* Cinematic Mode */}
            <CinematicButton onClick={() => setCinematicOpen(true)} />
          </div>
        </header>

        {/* Page content */}
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
        pageTitle={currentPage?.label}
      >
        {children}
      </CinematicMode>

      {/* Rasid Smart Character Widget */}
      <RasidCharacterWidget />
    </div>
  );
}

/** Export ROOT_ADMIN_USER_ID for use in other components */
export { ROOT_ADMIN_USER_ID };
