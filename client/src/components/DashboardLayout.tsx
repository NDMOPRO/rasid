/**
 * DashboardLayout — SDAIA Ultra Premium Design System
 * RTL-first sidebar with SDAIA official colors (#273470, #6459A7, #3DB1AC)
 * Glassmorphism, scan-line effects, and premium animations
 * - Mobile: auto-close sidebar on nav item click
 * - Groups: collapsed by default, only active group expanded
 * - Root Admin protection: AI control pages only visible to mruhaily
 * - Workspace Switcher: الخصوصية / حالات الرصد
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
  Home,
  Eye,
  Clipboard,
  QrCode,
  FolderOpen,
  Import,
  History,
  Wrench,
  PanelTop,
  ClipboardList,
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
  /** Which workspace: "shared" always shows, "privacy"/"leaks" show per active workspace, "admin" for admin only */
  workspace: "shared" | "privacy" | "leaks" | "admin";
}

/* ═══════════════════════════════════════════════════════════
   NAV GROUPS — Restructured per requirements
   ═══════════════════════════════════════════════════════════ */
const navGroups: NavGroup[] = [
  // ═══ القسم المشترك (ثابت في المنصتين) ═══
  {
    id: "shared_main",
    label: "الرئيسية",
    labelEn: "Home",
    icon: Home,
    workspace: "shared",
    items: [
      { label: "الرئيسية", labelEn: "Home", icon: Home, path: "/" },
    ],
  },
  {
    id: "shared_my_dashboard",
    label: "لوحتي",
    labelEn: "My Dashboard",
    icon: PanelTop,
    workspace: "shared",
    items: [
      { label: "لوحتي", labelEn: "My Dashboard", icon: PanelTop, path: "/my-custom-dashboard" },
    ],
  },
  {
    id: "shared_followups",
    label: "المتابعات",
    labelEn: "Follow-ups",
    icon: ClipboardList,
    workspace: "shared",
    items: [
      { label: "المتابعات", labelEn: "Follow-ups", icon: ClipboardList, path: "/cases" },
    ],
  },
  {
    id: "shared_reports",
    label: "التقارير",
    labelEn: "Reports",
    icon: BarChart3,
    workspace: "shared",
    items: [
      { label: "التقارير", labelEn: "Reports", icon: BarChart3, path: "/reports" },
    ],
  },
  {
    id: "shared_smart_rasid",
    label: "راصد الذكي",
    labelEn: "Smart Rasid",
    icon: Bot,
    workspace: "shared",
    items: [
      { label: "راصد الذكي", labelEn: "Smart Rasid AI", icon: Bot, path: "/smart-rasid" },
    ],
  },
  {
    id: "shared_verification",
    label: "التوثيق والتحقق (QR)",
    labelEn: "Verification & QR",
    icon: QrCode,
    workspace: "shared",
    items: [
      { label: "التحقق من الوثائق", labelEn: "Verify Document", icon: FileCheck, path: "/verify" },
      { label: "سجل التوثيقات", labelEn: "Documents Registry", icon: ScrollText, path: "/documents-registry" },
      { label: "إحصائيات التوثيق", labelEn: "Document Stats", icon: FileBarChart, path: "/document-stats" },
    ],
  },
  {
    id: "shared_admin",
    label: "الإدارة",
    labelEn: "Administration",
    icon: Crown,
    workspace: "shared",
    items: [
      { label: "نظرة عامة", labelEn: "Admin Overview", icon: Crown, path: "/admin", requiresAuth: true, rootAdminOnly: true },
      { label: "الأدوار والصلاحيات", labelEn: "Roles", icon: Shield, path: "/admin/roles", requiresAuth: true, rootAdminOnly: true },
      { label: "المجموعات", labelEn: "Groups", icon: Layers, path: "/admin/groups", requiresAuth: true, rootAdminOnly: true },
      { label: "مفاتيح الميزات", labelEn: "Features", icon: ToggleLeft, path: "/admin/feature-flags", requiresAuth: true, rootAdminOnly: true },
      { label: "إعدادات المظهر", labelEn: "Theme", icon: Palette, path: "/admin/theme", requiresAuth: true, rootAdminOnly: true },
      { label: "إدارة القوائم", labelEn: "Menus", icon: MenuLucide, path: "/admin/menus", requiresAuth: true, rootAdminOnly: true },
      { label: "سجل تدقيق الإدارة", labelEn: "Audit Log", icon: ScrollText, path: "/admin/audit-log", requiresAuth: true, rootAdminOnly: true },
      { label: "إدارة المستخدمين", labelEn: "Users", icon: Users, path: "/user-management", requiresAuth: true, minRole: "admin" },
    ],
  },

  // ═══ WORKSPACE: الخصوصية (Privacy) ═══
  {
    id: "privacy_dashboard",
    label: "لوحة الخصوصية",
    labelEn: "Privacy Dashboard",
    icon: Shield,
    workspace: "privacy",
    items: [
      { label: "لوحة الخصوصية", labelEn: "Privacy Dashboard", icon: Shield, path: "/leadership" },
    ],
  },
  {
    id: "privacy_sites",
    label: "المواقع",
    labelEn: "Sites",
    icon: Globe,
    workspace: "privacy",
    items: [
      { label: "المواقع", labelEn: "Sites", icon: Globe, path: "/sites" },
    ],
  },
  {
    id: "privacy_changes",
    label: "التغييرات",
    labelEn: "Changes",
    icon: Eye,
    workspace: "privacy",
    items: [
      { label: "رصد التغييرات", labelEn: "Change Detection", icon: Eye, path: "/change-detection" },
    ],
  },
  {
    id: "privacy_clauses",
    label: "البنود الثمانية (المادة 12)",
    labelEn: "8 Clauses (Article 12)",
    icon: FileText,
    workspace: "privacy",
    items: [
      { label: "البنود الثمانية", labelEn: "8 Clauses", icon: FileText, path: "/clauses" },
    ],
  },
  {
    id: "privacy_import",
    label: "الاستيراد والفحص",
    labelEn: "Import & Scan",
    icon: ScanSearch,
    workspace: "privacy",
    items: [
      { label: "الفحص", labelEn: "Scan", icon: ScanSearch, path: "/scan" },
      { label: "الفحص الجماعي", labelEn: "Batch Scan", icon: Import, path: "/batch-scan" },
      { label: "الفحص المتقدم", labelEn: "Advanced Scan", icon: Scan, path: "/advanced-scan" },
      { label: "الفحص العميق", labelEn: "Deep Scan", icon: Radar, path: "/deep-scan" },
    ],
  },
  {
    id: "privacy_history",
    label: "السجل",
    labelEn: "History",
    icon: History,
    workspace: "privacy",
    items: [
      { label: "سجل الفحوصات", labelEn: "Scan History", icon: History, path: "/scan-history" },
    ],
  },
  {
    id: "privacy_tools",
    label: "أدوات إضافية",
    labelEn: "Additional Tools",
    icon: Wrench,
    workspace: "privacy",
    items: [
      { label: "الفحص المباشر", labelEn: "Live Scan", icon: Radio, path: "/live-scan" },
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
      { label: "وضع العرض", labelEn: "Presentation", icon: PanelTop, path: "/presentation" },
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

  // ═══ WORKSPACE: حالات الرصد (Monitoring Cases) ═══
  {
    id: "leaks_dashboard",
    label: "لوحة حالات الرصد",
    labelEn: "Monitoring Dashboard",
    icon: Eye,
    workspace: "leaks",
    items: [
      { label: "لوحة حالات الرصد", labelEn: "Monitoring Dashboard", icon: Eye, path: "/national-overview" },
    ],
  },
  {
    id: "leaks_cases",
    label: "الحالات",
    labelEn: "Monitoring Cases",
    icon: ShieldAlert,
    workspace: "leaks",
    items: [
      { label: "سجل الحالات", labelEn: "Cases Log", icon: ShieldAlert, path: "/leaks" },
      { label: "سجل الحالات المتقدم", labelEn: "Cases Registry", icon: ScrollText, path: "/incidents-registry" },
    ],
  },
  {
    id: "leaks_analysis",
    label: "تحليل الحالات",
    labelEn: "Case Analysis",
    icon: ScanSearch,
    workspace: "leaks",
    items: [
      { label: "تشريح الحالات", labelEn: "Case Anatomy", icon: ScanSearch, path: "/leak-anatomy" },
      { label: "القطاعات المتضررة", labelEn: "Sector Analysis", icon: Layers, path: "/sector-analysis" },
      { label: "الخط الزمني", labelEn: "Timeline", icon: CalendarClock, path: "/leak-timeline" },
      { label: "تحليل الأثر", labelEn: "Impact Assessment", icon: BarChart3, path: "/impact-assessment" },
      { label: "التحليل الجغرافي", labelEn: "Geo Analysis", icon: Map, path: "/geo-analysis" },
    ],
  },
  {
    id: "leaks_sources",
    label: "مصادر النشر",
    labelEn: "Publishing Sources",
    icon: Globe,
    workspace: "leaks",
    items: [
      { label: "المصادر", labelEn: "Source Intelligence", icon: Globe, path: "/source-intelligence" },
      { label: "جهات النشر", labelEn: "Publishing Entities", icon: UserX, path: "/threat-actors-analysis" },
      { label: "ملفات المصادر", labelEn: "Source Profiles", icon: UserX, path: "/seller-profiles" },
    ],
  },
  {
    id: "leaks_history",
    label: "السجل",
    labelEn: "History",
    icon: History,
    workspace: "leaks",
    items: [
      { label: "سجل الحالات", labelEn: "Cases History", icon: History, path: "/incidents-registry" },
    ],
  },
  {
    id: "leaks_tools",
    label: "أدوات إضافية",
    labelEn: "Additional Tools",
    icon: Wrench,
    workspace: "leaks",
    items: [
      { label: "الرصد المباشر", labelEn: "Live Scan", icon: Scan, path: "/live-scan" },
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
    ],
  },

  // ═══ Admin system (hidden, accessed via shared admin) ═══
  {
    id: "admin_system",
    label: "إدارة النظام",
    labelEn: "System Admin",
    icon: Settings,
    workspace: "admin",
    items: [
      { label: "المشرف العام", labelEn: "Super Admin", icon: Crown, path: "/super-admin", requiresAuth: true, rootAdminOnly: true },
      { label: "لوحة الإدارة", labelEn: "Admin Panel", icon: Settings, path: "/admin-panel", requiresAuth: true, rootAdminOnly: true },
      { label: "صحة النظام", labelEn: "System Health", icon: Activity, path: "/system-health", requiresAuth: true, rootAdminOnly: true },
      { label: "مفاتيح API", labelEn: "API Keys", icon: KeyRound, path: "/api-keys", requiresAuth: true, minRole: "admin" },
      { label: "الاحتفاظ بالبيانات", labelEn: "Data Retention", icon: Archive, path: "/data-retention", requiresAuth: true, minRole: "admin" },
      { label: "سجل التدقيق", labelEn: "Audit Log", icon: ScrollText, path: "/audit-log", requiresAuth: true, minRole: "admin" },
      { label: "مهام الرصد", labelEn: "Monitoring Jobs", icon: Radio, path: "/monitoring-jobs", requiresAuth: true, minRole: "admin" },
      { label: "قنوات التنبيه", labelEn: "Alert Channels", icon: Bell, path: "/alert-channels", requiresAuth: true, minRole: "admin" },
      { label: "تحليلات الاستخدام", labelEn: "Usage Analytics", icon: BarChart3, path: "/usage-analytics", requiresAuth: true, rootAdminOnly: true },
    ],
  },
  {
    id: "admin_ai",
    label: "تحكم راصد الذكي",
    labelEn: "AI Control",
    icon: Sparkles,
    workspace: "admin",
    items: [
      { label: "إدارة السيناريوهات", labelEn: "Scenarios", icon: Sparkles, path: "/scenario-management", requiresAuth: true, rootAdminOnly: true },
      { label: "إدارة الذكاء الاصطناعي", labelEn: "AI Management", icon: Bot, path: "/ai-management", requiresAuth: true, rootAdminOnly: true },
      { label: "قاعدة المعرفة", labelEn: "Knowledge Base", icon: BookOpen, path: "/knowledge-base", requiresAuth: true, rootAdminOnly: true },
      { label: "سيناريوهات الشخصية", labelEn: "Personality", icon: HeartHandshake, path: "/personality-scenarios", requiresAuth: true, rootAdminOnly: true },
      { label: "مركز التدريب", labelEn: "Training Center", icon: GraduationCap, path: "/training-center", requiresAuth: true, rootAdminOnly: true },
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

/* ═══ Route → Workspace mapping ═══ */
const privacyPaths = new Set(
  navGroups.filter((g) => g.workspace === "privacy").flatMap((g) => g.items.map((i) => i.path))
);
const leaksPaths = new Set(
  navGroups.filter((g) => g.workspace === "leaks").flatMap((g) => g.items.map((i) => i.path))
);

function getWorkspaceForRoute(path: string): WorkspaceId {
  if (privacyPaths.has(path)) return "privacy";
  if (leaksPaths.has(path)) return "leaks";
  // Default to last selected or "leaks"
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
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>(() => {
    return getWorkspaceForRoute(location);
  });

  // Update workspace when route changes
  useEffect(() => {
    const ws = getWorkspaceForRoute(location);
    if (privacyPaths.has(location) || leaksPaths.has(location)) {
      setActiveWorkspace(ws);
      localStorage.setItem("rasid_workspace", ws);
    }
  }, [location]);

  // Filter nav groups: show shared + active workspace groups + admin if root
  const visibleGroups = navGroups.filter((g) => {
    if (g.workspace === "shared") return true;
    if (g.workspace === activeWorkspace) return true;
    if (g.workspace === "admin") return true; // admin groups handle their own visibility via rootAdminOnly
    return false;
  });

  // Determine which group is active
  const activeGroupId = visibleGroups.find((g) =>
    g.items.some((item) => item.path === location)
  )?.id;

  // Groups default to collapsed, only active group expanded
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

  const isGroupVisible = (group: NavGroup) => {
    return group.items.some(isItemVisible);
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => item.path === location);
  };

  const isDark = theme === "dark";
  const logoSrc = isDark ? FULL_LOGO_LIGHT : FULL_LOGO_DARK;
  const { playClick, playHover } = useSoundEffects();

  // Redirect unauthenticated users
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

      {/* ═══ SIDEBAR — SDAIA Frosted Glass (pdpl-old design) ═══ */}
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
        <div className={`flex items-center justify-center px-2 py-8 ${isDark ? 'border-b border-[rgba(61,177,172,0.1)]' : 'border-b border-[#edf0f7]'}`} style={{ minHeight: collapsed ? '72px' : '200px' }}>
          <motion.div
            className="relative flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{ width: collapsed ? '52px' : '100%', height: collapsed ? '52px' : '180px' }}
          >
            {/* Orbiting glow ring */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: collapsed ? '60px' : 'calc(100% + 16px)',
                height: collapsed ? '60px' : '190px',
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
              <div className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-[#6459A7]' : 'bg-[#1e3a8a]'}`} style={{ top: '20%', left: '50%', opacity: isDark ? 0.25 : 0.12, animation: 'orbit 12s linear infinite reverse' }} />
            </div>
            {/* Logo image */}
            <img
              src={collapsed ? RASID_LOGO : logoSrc}
              alt="منصة راصد - مكتب إدارة البيانات الوطنية"
              className="relative z-10 object-contain"
              style={{
                width: collapsed ? '44px' : '100%',
                height: collapsed ? '44px' : '170px',
                maxWidth: '260px',
                filter: isDark ? 'drop-shadow(0 0 15px rgba(61, 177, 172, 0.25)) drop-shadow(0 0 40px rgba(100, 89, 167, 0.12))' : 'drop-shadow(0 0 8px rgba(30, 58, 138, 0.08))',
                animation: 'logo-float 5s ease-in-out infinite',
              }}
            />
          </motion.div>
        </div>

        {/* Data flow line under logo */}
        <div className="data-flow-line mx-4 opacity-50" />

        {/* ═══ WORKSPACE SWITCHER ═══ */}
        {!collapsed && (
          <div className={`mx-3 my-2 flex rounded-lg overflow-hidden ${isDark ? 'bg-[rgba(61,177,172,0.06)] border border-[rgba(61,177,172,0.12)]' : 'bg-[rgba(30,58,138,0.03)] border border-[rgba(30,58,138,0.08)]'}`}>
            <button
              onClick={() => { setActiveWorkspace("leaks"); localStorage.setItem("rasid_workspace", "leaks"); playClick(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold transition-all duration-200 ${
                activeWorkspace === "leaks"
                  ? isDark
                    ? "bg-[rgba(61,177,172,0.15)] text-[#3DB1AC] shadow-sm"
                    : "bg-[rgba(30,58,138,0.08)] text-[#1e3a8a] shadow-sm"
                  : isDark
                    ? "text-[#D4DDEF]/50 hover:text-[#D4DDEF]/70"
                    : "text-[#5a6478] hover:text-[#1c2833]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>حالات الرصد</span>
            </button>
            <button
              onClick={() => { setActiveWorkspace("privacy"); localStorage.setItem("rasid_workspace", "privacy"); playClick(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold transition-all duration-200 ${
                activeWorkspace === "privacy"
                  ? isDark
                    ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e] shadow-sm"
                    : "bg-[rgba(22,163,74,0.08)] text-[#16a34a] shadow-sm"
                  : isDark
                    ? "text-[#D4DDEF]/50 hover:text-[#D4DDEF]/70"
                    : "text-[#5a6478] hover:text-[#1c2833]"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>الخصوصية</span>
            </button>
          </div>
        )}

        {/* Navigation with groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {visibleGroups.filter(isGroupVisible).map((group) => {
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

      {/* Rasid Smart Character Widget */}
      <RasidCharacterWidget />
    </div>
  );
}

/** Export ROOT_ADMIN_USER_ID for use in other components */
export { ROOT_ADMIN_USER_ID };
