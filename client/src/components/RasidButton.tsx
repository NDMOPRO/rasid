import { ReactNode, useRef, useCallback } from 'react';

interface RasidButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'ghost';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function RasidButton({ children, variant = 'primary', onClick, className = '', disabled }: RasidButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', `${mx}%`);
    el.style.setProperty('--my', `${my}%`);
  }, []);

  return (
    <button
      ref={ref}
      className={`lux-btn lux-btn-${variant} ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      disabled={disabled}
    >
      <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        {children}
      </span>
    </button>
  );
}
