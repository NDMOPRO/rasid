/**
 * Sidebar — Glass sidebar with collapsible groups, skin-aware accent
 * Matching pdpl-old DashboardLayout sidebar
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Eye, Globe, Users, FileText, AlertTriangle,
  Search, Database, BarChart3, Settings, ChevronDown,
  Crosshair, Lock, Fingerprint, Scale, BookOpen, Bell,
  Activity, Server, Wifi, Layers
} from "lucide-react";
import { LOGOS } from "@/lib/assets";
import type { Skin } from "@/hooks/useSkin";

interface SidebarProps {
  skin: Skin;
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarGroup {
  id: string;
  title: string;
  titleEn: string;
  icon: React.ElementType;
  items: { id: string; label: string; labelEn: string; icon: React.ElementType }[];
}

const goldGroups: SidebarGroup[] = [
  {
    id: "monitoring",
    title: "الرصد والمراقبة",
    titleEn: "Monitoring",
    icon: Eye,
    items: [
      { id: "dashboard", label: "لوحة التحكم", labelEn: "Dashboard", icon: BarChart3 },
      { id: "leaks", label: "رصد التسريبات", labelEn: "Leak Detection", icon: Search },
      { id: "darkweb", label: "الدارك ويب", labelEn: "Dark Web", icon: Globe },
      { id: "threats", label: "صيد التهديدات", labelEn: "Threat Hunting", icon: Crosshair },
    ],
  },
  {
    id: "analysis",
    title: "التحليل والتقارير",
    titleEn: "Analysis",
    icon: BarChart3,
    items: [
      { id: "reports", label: "التقارير", labelEn: "Reports", icon: FileText },
      { id: "alerts", label: "التنبيهات", labelEn: "Alerts", icon: AlertTriangle },
      { id: "database", label: "قاعدة البيانات", labelEn: "Database", icon: Database },
    ],
  },
  {
    id: "management",
    title: "الإدارة",
    titleEn: "Management",
    icon: Settings,
    items: [
      { id: "users", label: "المستخدمين", labelEn: "Users", icon: Users },
      { id: "settings", label: "الإعدادات", labelEn: "Settings", icon: Settings },
      { id: "notifications", label: "الإشعارات", labelEn: "Notifications", icon: Bell },
    ],
  },
];

const silverGroups: SidebarGroup[] = [
  {
    id: "privacy",
    title: "الخصوصية والامتثال",
    titleEn: "Privacy & Compliance",
    icon: Lock,
    items: [
      { id: "dashboard", label: "لوحة التحكم", labelEn: "Dashboard", icon: BarChart3 },
      { id: "impact", label: "تقييم الأثر", labelEn: "Impact Assessment", icon: Scale },
      { id: "processing", label: "سجل المعالجة", labelEn: "Processing Log", icon: BookOpen },
      { id: "rights", label: "حقوق الأفراد", labelEn: "Individual Rights", icon: Fingerprint },
    ],
  },
  {
    id: "governance",
    title: "السياسات والحوكمة",
    titleEn: "Policies",
    icon: Shield,
    items: [
      { id: "policies", label: "السياسات", labelEn: "Policies", icon: FileText },
      { id: "audit", label: "التدقيق", labelEn: "Audit", icon: Search },
      { id: "alerts", label: "التنبيهات", labelEn: "Alerts", icon: AlertTriangle },
    ],
  },
  {
    id: "management",
    title: "الإدارة",
    titleEn: "Management",
    icon: Settings,
    items: [
      { id: "users", label: "المستخدمين", labelEn: "Users", icon: Users },
      { id: "settings", label: "الإعدادات", labelEn: "Settings", icon: Settings },
      { id: "notifications", label: "الإشعارات", labelEn: "Notifications", icon: Bell },
    ],
  },
];

const STORAGE_KEY = "rasid-sidebar-collapsed";

export default function Sidebar({ skin, isOpen, onClose }: SidebarProps) {
  const groups = skin === "gold" ? goldGroups : silverGroups;
  const [activeItem, setActiveItem] = useState("dashboard");

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    const def: Record<string, boolean> = {};
    [...goldGroups, ...silverGroups].forEach(g => { def[g.id] = true; });
    if (groups[0]) def[groups[0].id] = false;
    return def;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleGroup = (id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          glass-sidebar fixed top-0 right-0 h-full z-50
          w-[280px] flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-center border-b border-white/5">
          <motion.img
            src={LOGOS.calligraphyLight}
            alt="راصد"
            className="h-12 object-contain"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {groups.map((group) => (
            <div key={group.id} className="mb-2">
              <button
                onClick={() => toggleGroup(group.id)}
                className="sidebar-group-header w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-right"
              >
                <group.icon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 text-right">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{group.title}</span>
                  <span className="text-[9px] text-muted-foreground/50 block">{group.titleEn}</span>
                </div>
                <motion.div
                  animate={{ rotate: collapsed[group.id] ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {!collapsed[group.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5 mt-1 mr-2">
                      {group.items.map((item) => {
                        const isActive = activeItem === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveItem(item.id)}
                            className={`
                              sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right
                              ${isActive ? "sidebar-nav-item-active" : "text-muted-foreground hover:text-foreground"}
                            `}
                          >
                            <item.icon className="sidebar-nav-icon w-4.5 h-4.5" />
                            <div className="flex-1 text-right">
                              <span className="text-sm font-medium">{item.label}</span>
                              <span className="text-[9px] text-muted-foreground/50 block">{item.labelEn}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--skin-gradient-from)] to-[var(--skin-gradient-to)] flex items-center justify-center">
              <span className="text-sm font-bold text-[#0D1529]">م</span>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm font-semibold text-foreground">مدير النظام</p>
              <p className="text-[10px] text-muted-foreground">admin@rasid.sa</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
