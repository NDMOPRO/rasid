import { LOGOS } from '@/lib/assets';
import { useSidebarState } from '@/hooks/useSidebarState';
import {
  ChevronDown, Home, BarChart3, Search, Shield, Settings,
  FileText, Users, Bell, Database, Activity, Lock, Eye,
  Layers, HelpCircle, Globe, Server, Wifi, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SkinType = 'gold' | 'silver';

interface SidebarProps {
  skin: SkinType;
  activePage: string;
  onPageChange: (page: string) => void;
}

const goldGroups = [
  {
    id: 'monitoring',
    title: 'الرصد والمراقبة',
    items: [
      { id: 'home', label: 'لوحة التحكم', icon: Activity },
      { id: 'threats', label: 'صيد التهديدات', icon: AlertTriangle },
      { id: 'darkweb', label: 'رصد الدارك ويب', icon: Globe },
      { id: 'leaks', label: 'التسريبات', icon: Eye },
    ],
  },
  {
    id: 'analysis',
    title: 'التحليل والتقارير',
    items: [
      { id: 'reports', label: 'التقارير', icon: FileText },
      { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
      { id: 'search', label: 'البحث المتقدم', icon: Search },
    ],
  },
  {
    id: 'system',
    title: 'إدارة النظام',
    items: [
      { id: 'users', label: 'المستخدمون', icon: Users },
      { id: 'alerts', label: 'التنبيهات', icon: Bell },
      { id: 'sources', label: 'مصادر البيانات', icon: Database },
      { id: 'infra', label: 'البنية التحتية', icon: Server },
      { id: 'settings', label: 'الإعدادات', icon: Settings },
    ],
  },
];

const silverGroups = [
  {
    id: 'privacy',
    title: 'الخصوصية والامتثال',
    items: [
      { id: 'home', label: 'لوحة التحكم', icon: Activity },
      { id: 'policies', label: 'السياسات', icon: Shield },
      { id: 'compliance', label: 'الامتثال', icon: Lock },
      { id: 'dpia', label: 'تقييمات الأثر', icon: Layers },
    ],
  },
  {
    id: 'governance',
    title: 'الحوكمة',
    items: [
      { id: 'classification', label: 'تصنيف البيانات', icon: Database },
      { id: 'access', label: 'طلبات الوصول', icon: Users },
      { id: 'audit', label: 'التدقيق', icon: Search },
    ],
  },
  {
    id: 'system',
    title: 'إدارة النظام',
    items: [
      { id: 'reports', label: 'التقارير', icon: FileText },
      { id: 'connectivity', label: 'الاتصال الآمن', icon: Wifi },
      { id: 'settings', label: 'الإعدادات', icon: Settings },
    ],
  },
];

export default function Sidebar({ skin, activePage, onPageChange }: SidebarProps) {
  const groups = skin === 'gold' ? goldGroups : silverGroups;
  const { openGroups, toggleGroup } = useSidebarState(groups.map(g => g.id));

  return (
    <aside className="lux-sidebar">
      {/* Logo area — metallic header */}
      <div style={{
        padding: '1.25rem 1.125rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        borderBottom: '2px solid rgba(100,120,160,.12)',
        background: 'linear-gradient(180deg, rgba(35,48,72,.60), rgba(28,40,62,.40))',
        boxShadow: 'inset 0 -1px 0 rgba(5,10,20,.30), inset 0 1px 0 rgba(140,165,210,.06)',
      }}>
        <img
          src={skin === 'gold' ? LOGOS.calligraphyGold : LOGOS.calligraphyLight}
          alt="راصد"
          style={{ height: 32 }}
        />
        <div style={{
          fontSize: '0.6875rem',
          color: 'var(--accent-text)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          opacity: 0.8,
        }}>
          {skin === 'gold' ? 'الرصد' : 'الخصوصية'}
        </div>
      </div>

      {/* Navigation Groups */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.75rem 0',
      }}>
        {groups.map(group => (
          <div key={group.id} style={{ marginBottom: '0.375rem' }}>
            <div
              className="sidebar-group-title"
              onClick={() => toggleGroup(group.id)}
            >
              <span>{group.title}</span>
              <motion.span
                animate={{ rotate: openGroups[group.id] ? 0 : -90 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex' }}
              >
                <ChevronDown size={12} />
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
                        <span style={{ opacity: 0.65, display: 'flex' }}>
                          <Icon size={16} />
                        </span>
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

      {/* User Footer — metallic panel */}
      <div style={{
        padding: '0.875rem 1.125rem',
        borderTop: '2px solid rgba(100,120,160,.12)',
        background: 'linear-gradient(180deg, rgba(28,40,62,.40), rgba(35,48,72,.60))',
        boxShadow: 'inset 0 1px 0 rgba(140,165,210,.06), inset 0 -1px 0 rgba(5,10,20,.20)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'linear-gradient(165deg, rgba(50,65,100,.80), rgba(35,48,78,.90))',
          border: '2px solid rgba(100,120,160,.22)',
          borderTopColor: 'rgba(140,165,210,.28)',
          borderBottomColor: 'rgba(20,30,50,.40)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-text)',
          fontSize: '0.8125rem',
          fontWeight: 700,
          boxShadow: '0 2px 4px rgba(0,0,0,.25), inset 0 1px 0 rgba(160,180,220,.15)',
        }}>
          م
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            مدير النظام
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
            admin@rasid.sa
          </div>
        </div>
      </div>
    </aside>
  );
}
