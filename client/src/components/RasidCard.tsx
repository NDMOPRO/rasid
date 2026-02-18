import { ReactNode } from 'react';
import { useHoverLight } from '@/hooks/useHoverLight';
import { motion } from 'framer-motion';

interface RasidCardProps {
  children: ReactNode;
  className?: string;
  watermarkIcon?: ReactNode;
  delay?: number;
}

export default function RasidCard({ children, className = '', watermarkIcon, delay = 0 }: RasidCardProps) {
  const { ref, lightRef } = useHoverLight();

  return (
    <motion.div
      ref={ref}
      className={`rasid-card hover-light ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        ref={lightRef}
        className="hover-light-effect"
        style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)', pointerEvents: 'none', opacity: 0, transform: 'translate(-50%, -50%)', zIndex: 1, transition: 'opacity 300ms ease' }}
      />
      {watermarkIcon && (
        <div className="card-watermark">{watermarkIcon}</div>
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </motion.div>
  );
}
