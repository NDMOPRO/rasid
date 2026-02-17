import { useSoundEffects } from '@/hooks/useSoundEffects';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverLift?: boolean;
  scanLine?: boolean;
  glowColor?: string;
}

export function GlassCard({
  children,
  className = '',
  onClick,
  hoverLift = true,
  scanLine = true,
  glowColor,
}: GlassCardProps) {
  const { playHover } = useSoundEffects();

  return (
    <div
      className={`glass-card gold-sweep group relative overflow-hidden rounded-2xl p-6 cursor-pointer ${className}`}
      style={glowColor ? { borderColor: `${glowColor}30` } : undefined}
      onMouseEnter={() => playHover()}
      onClick={onClick}
    >
      {/* Scan Line Effect */}
      {scanLine && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--sdaia-primary)]/20 to-transparent animate-scan" />
        </div>
      )}

      {/* Glow border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: glowColor
            ? `inset 0 0 0 1px ${glowColor}40, 0 0 20px ${glowColor}15`
            : 'inset 0 0 0 1px rgba(30, 58, 138, 0.15), 0 0 20px rgba(30, 58, 138, 0.08)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
