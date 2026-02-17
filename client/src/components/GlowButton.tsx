import { useSoundEffects } from '@/hooks/useSoundEffects';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'full';
  loading?: boolean;
  icon?: ReactNode;
}

const variantStyles = {
  primary: {
    bg: 'bg-gradient-to-r from-[#1E3A5F] via-[#273470] to-[#6459A7]',
    glow: '0 0 20px rgba(30, 58, 95, 0.4), 0 0 40px rgba(39, 52, 112, 0.2)',
    hoverGlow: '0 0 30px rgba(30, 58, 95, 0.6), 0 0 60px rgba(39, 52, 112, 0.3), 0 0 80px rgba(100, 89, 167, 0.15)',
    text: 'text-white',
  },
  accent: {
    bg: 'bg-gradient-to-r from-[#1E3A5F] to-[#2A4F7A]',
    glow: '0 0 20px rgba(30, 58, 95, 0.3)',
    hoverGlow: '0 0 30px rgba(30, 58, 95, 0.5), 0 0 60px rgba(42, 79, 122, 0.2)',
    text: 'text-white',
  },
  secondary: {
    bg: 'bg-gradient-to-r from-[#6459A7] to-[#7C70CA]',
    glow: '0 0 20px rgba(100, 89, 167, 0.3)',
    hoverGlow: '0 0 30px rgba(100, 89, 167, 0.5), 0 0 60px rgba(100, 89, 167, 0.2)',
    text: 'text-white',
  },
  danger: {
    bg: 'bg-gradient-to-r from-[#EB3D63] to-[#d42f53]',
    glow: '0 0 20px rgba(235, 61, 99, 0.3)',
    hoverGlow: '0 0 30px rgba(235, 61, 99, 0.5), 0 0 60px rgba(235, 61, 99, 0.2)',
    text: 'text-white',
  },
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
  full: 'w-full px-6 py-3 text-base rounded-xl',
};

export function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  onClick,
  disabled,
  className = '',
  ...props
}: GlowButtonProps) {
  const { playClick } = useSoundEffects();
  const styles = variantStyles[variant];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    playClick();
    onClick?.(e);
  };

  return (
    <button
      className={`
        relative font-bold transition-all duration-300
        animate-gradient-shift bg-[length:200%_200%]
        ${styles.bg} ${styles.text} ${sizeStyles[size]}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
        flex items-center justify-center gap-2
        ${className}
      `}
      style={{ boxShadow: styles.glow }}
      onMouseEnter={(e) => { if (!disabled && !loading) (e.currentTarget as HTMLElement).style.boxShadow = styles.hoverGlow; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = styles.glow; }}
      onClick={handleClick}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
