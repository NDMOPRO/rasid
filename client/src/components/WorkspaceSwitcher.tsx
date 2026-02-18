import { Skin } from '@/hooks/useSkin';
import { Shield, Eye } from 'lucide-react';

interface WorkspaceSwitcherProps {
  skin: Skin;
  onSwitch: (skin: Skin) => void;
}

export default function WorkspaceSwitcher({ skin, onSwitch }: WorkspaceSwitcherProps) {
  return (
    <div className="workspace-switcher">
      <button
        className={skin === 'gold' ? 'active' : ''}
        onClick={() => onSwitch('gold')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <Eye size={16} />
          الرصد
        </span>
      </button>
      <button
        className={skin === 'silver' ? 'active' : ''}
        onClick={() => onSwitch('silver')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <Shield size={16} />
          الخصوصية
        </span>
      </button>
    </div>
  );
}
