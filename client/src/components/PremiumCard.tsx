/**
 * PremiumCard — Glassmorphism card with shimmer, scan-line, hover-shine, 3D lift
 * Exact replica of pdpl-old PremiumCard
 */
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
  glow?: string;
}

export default function PremiumCard({ children, className = "", onClick, delay = 0, glow }: PremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={onClick ? { y: -4, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } } : { y: -2, transition: { duration: 0.3, ease: "easeOut" } }}
      onClick={onClick}
      className={`
        glass-card-premium hover-shine
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={glow ? { boxShadow: `0 0 0 1px ${glow}` } : undefined}
    >
      {/* Shimmer overlay */}
      <div className="shimmer-overlay" />
      {/* Scan-line */}
      <div className="scan-line" />
      {children}
    </motion.div>
  );
}
