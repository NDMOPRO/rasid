import { ReactNode, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface RasidCardProps {
  children: ReactNode;
  className?: string;
  watermarkIcon?: ReactNode;
  delay?: number;
  noPad?: boolean;
}

export default function RasidCard({ children, className = '', watermarkIcon, delay = 0, noPad }: RasidCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mx = (x / rect.width) * 100;
    const my = (y / rect.height) * 100;

    // 3D tilt — subtle
    const rotateY = ((x / rect.width) - 0.5) * 6;
    const rotateX = ((y / rect.height) - 0.5) * -4;

    el.style.setProperty('--mx', `${mx}%`);
    el.style.setProperty('--my', `${my}%`);
    el.style.setProperty('--rx', `${rotateX}deg`);
    el.style.setProperty('--ry', `${rotateY}deg`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--lift', '0px');
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '35%');
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={`lux-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 0.61, 0.36, 1] }}
      style={noPad ? { padding: 0 } : undefined}
    >
      {/* Rim highlight */}
      <div className="lux-card-rim" />

      {/* Hover light — separate div to avoid ::after conflict */}
      <div className="lux-card-hover-light" />

      {/* Watermark icon */}
      {watermarkIcon && (
        <div className="card-watermark">{watermarkIcon}</div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 5 }}>
        {children}
      </div>
    </motion.div>
  );
}
