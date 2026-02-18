import { LOGOS } from '@/lib/assets';
import { useSidebarState } from '@/hooks/useSidebarState';
import { Skin } from '@/hooks/useSkin';
import { ChevronDown, ChevronLeft, Home, BarChart3, Search, Shield, Settings, FileText, Users, Bell, Database, Activity, Lock, Eye, Layers, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  skin: Skin;
  activePage: string;
  onPageChange: (page: string) => void;
}

const sidebarGroups = [
  {
    id: 'main',
    title: 'الأساسية',
    items: [
      { id: 'home', label: 'الرئيسية', icon: Home },
      { id: 'kpi', label: 'المؤشرات القيادية', icon: BarChart3 },
      { id: 'inspect', label: 'تنفيذ الفحص', icon: Search },
    ]
  },
  {
    id: 'monitoring',
    title: 'الرصد والفحص',
    badge: 4,
    items: [
      { id: 'monitor', label: 'المراقبة النشطة', icon: Activity },
      { id: 'threats', label: 'صيد التهديدات', icon: Shield },
      { id: 'darkweb', label: 'رصد الدارك ويب', icon: Eye },
      { id: 'telegram', label: 'رصد تيليجرام', icon: Bell },
    ]
  },
  {
    id: 'admin',
    title: 'الإدارة والنظام',
    badge: 29,
    items: [
      { id: 'users', label: 'إدارة المستخدمين', icon: Users },
      { id: 'roles', label: 'الأدوار والصلاحيات', icon: Lock },
      { id: 'settings', label: 'إعدادات النظام', icon: Settings },
      { id: 'database', label: 'قاعدة البيانات', icon: Database },
    ]
  },
  {
    id: 'docs',
    title: 'التصميم والتوثيق',
    items: [
      { id: 'docs', label: 'التوثيق الشامل', icon: FileText },
      { id: 'brand', label: 'الهوية البصرية', icon: Layers },
      { id: 'help', label: 'المساعدة', icon: HelpCircle },
    ]
  }
];

export default function Sidebar({ skin, activePage, onPageChange }: SidebarProps) {
  const { openGroups, toggleGroup } = useSidebarState(sidebarGroups.map(g => g.id));

  return (
    <aside className="rasid-sidebar">
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={skin === 'gold' ? LOGOS.calligraphyGold : LOGOS.calligraphyLight}
          alt="راصد"
          style={{ height: 48, objectFit: 'contain' }}
        />
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0' }}>
        {sidebarGroups.map(group => (
          <div key={group.id} style={{ marginBottom: '0.25rem' }}>
            <div
              className="sidebar-group-title"
              onClick={() => toggleGroup(group.id)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {group.title}
                {group.badge && (
                  <span style={{
                    fontSize: '0.625rem',
                    background: 'var(--accent-glow)',
                    color: 'var(--accent-text)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '9999px',
                    fontWeight: 700
                  }}>
                    {group.badge}
                  </span>
                )}
              </span>
              <motion.span
                animate={{ rotate: openGroups[group.id] ? 0 : -90 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.span>
            </div>
            <AnimatePresence initial={false}>
              {openGroups[group.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  {group.items.map(item => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => onPageChange(item.id)}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* User info */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid rgba(255,255,255,.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--surface-0)',
          fontWeight: 700,
          fontSize: '0.875rem'
        }}>
          ر
        </div>
        <div>
          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            مسؤول النظام
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            admin@rasid.sa
          </div>
        </div>
      </div>
    </aside>
  );
}
