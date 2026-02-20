/**
 * HolographicCard — A card with holographic/iridescent effect on hover.
 * Uses CSS transforms and gradient overlays for a 3D holographic appearance.
 */
import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
  disabled?: boolean;
}

export function HolographicCard({
  children,
  className,
  intensity = "medium",
  disabled = false,
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({});

  const intensityMap = { low: 5, medium: 10, high: 20 };
  const maxTilt = intensityMap[intensity];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (0.5 - y) * maxTilt;
      const tiltY = (x - 0.5) * maxTilt;
      setTransform(`perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`);
      setGlareStyle({
        background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
        opacity: 1,
      });
    },
    [disabled, maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("");
    setGlareStyle({ opacity: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-xl transition-transform duration-300 ease-out",
        "bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-800/80",
        "border border-white/10 backdrop-blur-sm",
        "shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10",
        className
      )}
      style={{ transform, willChange: "transform" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Holographic rainbow overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(255,0,128,0.05) 0%,
            rgba(0,255,255,0.08) 25%,
            rgba(128,0,255,0.05) 50%,
            rgba(0,255,128,0.08) 75%,
            rgba(255,128,0,0.05) 100%
          )`,
          mixBlendMode: "overlay",
        }}
      />
      {/* Glare effect */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={glareStyle}
      />
      {/* Content */}
      <div className="relative z-0">{children}</div>
    </div>
  );
}

export default HolographicCard;
