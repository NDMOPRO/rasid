import { Skin } from '@/hooks/useSkin';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { Search, Bell, Menu, X } from 'lucide-react';

interface TopBarProps {
  skin: Skin;
  onSkinChange: (skin: Skin) => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function TopBar({ skin, onSkinChange, onToggleSidebar, sidebarOpen = true }: TopBarProps) {
  return (
    <header style={{
      height: 56,
      background: 'var(--surface-1)',
      borderBottom: '1px solid rgba(255,255,255,.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--surface-2)',
        borderRadius: 'var(--radius)',
        padding: '0.375rem 0.75rem',
        border: '1px solid rgba(255,255,255,.06)',
        flex: '0 1 320px',
      }}>
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="بحث سريع..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'Tajawal',
            fontSize: '0.875rem',
            width: '100%',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Workspace Switcher */}
        <WorkspaceSwitcher skin={skin} onSwitch={onSkinChange} />

        {/* Notifications */}
        <button style={{
          position: 'relative',
          background: 'var(--surface-2)',
          border: '1px solid rgba(255,255,255,.06)',
          borderRadius: 'var(--radius)',
          padding: '0.5rem',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all var(--transition-default)',
        }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: -4,
            left: -4,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#DC2626',
            color: '#fff',
            fontSize: '0.625rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>3</span>
        </button>

        {/* Sidebar Toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 'var(--radius)',
              padding: '0.5rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--transition-default)',
            }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
      </div>
    </header>
  );
}
