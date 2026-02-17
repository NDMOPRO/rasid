import type { ReactNode } from 'react';

type IconEffect = 'pulse' | 'spin' | 'bounce' | 'shake' | 'glow' | 'morph';

interface AnimatedIconProps {
  children: ReactNode;
  effect?: IconEffect;
  size?: number;
  color?: string;
  className?: string;
  active?: boolean;
}

const effectVariants: Record<IconEffect, any> = {
  pulse: {
    animate: {
      scale: [1, 1.15, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  spin: {
    animate: {
      rotate: 360,
      transition: { duration: 8, repeat: Infinity, ease: 'linear' },
    },
  },
  bounce: {
    animate: {
      y: [0, -4, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  shake: {
    animate: {
      x: [0, -2, 2, -2, 0],
      transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 },
    },
  },
  glow: {
    animate: {
      filter: [
        'drop-shadow(0 0 2px rgba(30, 58, 95, 0.3))',
        'drop-shadow(0 0 8px rgba(74, 122, 181, 0.6))',
        'drop-shadow(0 0 2px rgba(30, 58, 95, 0.3))',
      ],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  morph: {
    animate: {
      scale: [1, 1.1, 0.95, 1.05, 1],
      rotate: [0, 5, -5, 3, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  },
};

export function AnimatedIcon({
  children,
  effect = 'pulse',
  className = '',
  active = true,
}: AnimatedIconProps) {
  const variant = effectVariants[effect];

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      {...(active ? variant : {})}
    >
      {children}
    </div>
  );
}
