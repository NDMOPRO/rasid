import WorkspaceSwitcher from './WorkspaceSwitcher';
import { Bell, Search, Menu, X } from 'lucide-react';

type SkinType = 'gold' | 'silver';

interface TopBarProps {
  skin: SkinType;
  onSkinChange: (skin: SkinType) => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function TopBar({ skin, onSkinChange, onToggleSidebar, sidebarOpen = true }: TopBarProps) {
  return (
    <header className="lux-topbar">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        {/* Right side: toggle + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lux-btn lux-btn-ghost"
              style={{ padding: '0.5rem', minHeight: 'auto', border: 'none' }}
            >
              <span style={{ position: 'relative', zIndex: 2, display: 'flex' }}>
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </span>
            </button>
          )}

          {/* Search bar — recessed metallic */}
          <div style={{ position: 'relative', maxWidth: 380, flex: 1 }}>
            <Search size={15} style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }} />
            <input
              className="lux-input"
              placeholder="بحث في المنصة..."
              style={{
                paddingRight: '2.25rem',
                minHeight: 38,
              }}
            />
          </div>
        </div>

        {/* Left side: switcher + notifications */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <WorkspaceSwitcher skin={skin} onSwitch={onSkinChange} />

          {/* Notification bell — metallic button */}
          <button
            className="lux-btn lux-btn-ghost"
            style={{ padding: '0.5rem', minHeight: 'auto', border: 'none', position: 'relative' }}
          >
            <span style={{ position: 'relative', zIndex: 2, display: 'flex' }}>
              <Bell size={18} />
            </span>
            <span style={{
              position: 'absolute',
              top: 4,
              left: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--danger)',
              boxShadow: '0 0 6px var(--danger)',
              zIndex: 3,
            }} />
          </button>
        </div>
      </div>
    </header>
  );
}
