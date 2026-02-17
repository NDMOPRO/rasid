import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { LOGO_SVG_DARK, LOGO_SVG_LIGHT, LOGO_LARGE_CREAM_GOLD, LOGO_LARGE_NAVY_GOLD } from "@/lib/rasidAssets";

interface AnimatedLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: "sidebar" | "header" | "login" | "splash" | "default";
}

/* ── Particle Field ── */
function ParticleField({ count = 10, color = "#C5A55A" }: { count?: number; color?: string }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    dur: 3 + Math.random() * 5,
    delay: Math.random() * 3,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            left: `${p.x}%`, top: `${p.y}%`,
            background: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Gold Shimmer Sweep ── */
function GoldShimmer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(197,165,90,0.15) 45%, rgba(197,165,90,0.3) 50%, rgba(197,165,90,0.15) 55%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}

/* ── Orbital Ring ── */
function OrbitalRing({
  radius, duration, color, size = 4, reverse = false,
}: { radius: number; duration: number; color: string; size?: number; reverse?: boolean }) {
  return (
    <div
      className="absolute"
      style={{ top: "50%", left: "50%", marginTop: -size / 2, marginLeft: -size / 2 }}
    >
      <div
        style={{
          width: size, height: size, borderRadius: "50%",
          background: color,
          boxShadow: `0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color}40`,
          transform: `translateX(${radius}px)`,
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Main AnimatedLogo Component
   ══════════════════════════════════════════════════════════════════════ */
export function AnimatedLogo({
  size = 64,
  showText = true,
  className = "",
  variant = "default",
}: AnimatedLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Use large calligraphy logo for sidebar/header/login, SVG for default
  const useLargeLogo = variant === "sidebar" || variant === "header" || variant === "login" || variant === "splash";
  const logoSrc = useLargeLogo
    ? (isDark ? LOGO_LARGE_CREAM_GOLD : LOGO_LARGE_NAVY_GOLD)
    : (isDark ? LOGO_SVG_DARK : LOGO_SVG_LIGHT);

  const goldColor = "#C5A55A";
  const goldGlow = "rgba(197,165,90,0.5)";
  const tealColor = isDark ? "#3DB1AC" : "#273470";

  // Sidebar/login variant: large logo matching pdpl.rasid.vip (~120-140px)
  // Header variant allows smaller sizes for navbar/collapsed states
  const displaySize = (variant === "sidebar" || variant === "login" || variant === "splash") ? Math.max(size, 120) : size;
  const containerSize = displaySize + (displaySize > 80 ? 40 : 20);

  return (
    <div
      className={`flex flex-col items-center cursor-pointer select-none relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative" style={{ width: containerSize, height: containerSize }}>
        {/* Particle field */}
        {displaySize > 60 && <ParticleField count={variant === "splash" ? 20 : (displaySize > 100 ? 10 : 5)} color={goldColor} />}

        {/* Pulsing gold glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(197,165,90,0.12) 0%, transparent 70%)`,
          }}
        />

        {/* Secondary glow */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: `radial-gradient(circle, ${isDark ? "rgba(61,177,172,0.08)" : "rgba(39,52,112,0.06)"} 0%, transparent 60%)`,
          }}
        />

        {/* Orbital particles */}
        {displaySize > 60 && (
          <>
            <OrbitalRing radius={containerSize / 2.2} duration={10} color={goldColor} size={displaySize > 100 ? 5 : 3} />
            <OrbitalRing radius={containerSize / 2.8} duration={14} color={tealColor} size={displaySize > 100 ? 3.5 : 2} reverse />
            {displaySize > 100 && <OrbitalRing radius={containerSize / 3.5} duration={8} color={`${goldColor}80`} size={2.5} />}
          </>
        )}

        {/* Gold shimmer sweep */}
        <GoldShimmer />

        {/* Main logo with glow */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            filter: isHovered
              ? [
                  `drop-shadow(0 0 8px ${goldGlow}) drop-shadow(0 0 20px ${goldGlow})`,
                  `drop-shadow(0 0 16px ${goldGlow}) drop-shadow(0 0 35px ${goldGlow})`,
                  `drop-shadow(0 0 8px ${goldGlow}) drop-shadow(0 0 20px ${goldGlow})`,
                ]
              : [
                  `drop-shadow(0 0 4px ${goldGlow}) drop-shadow(0 0 10px ${goldGlow})`,
                  `drop-shadow(0 0 10px ${goldGlow}) drop-shadow(0 0 22px ${goldGlow})`,
                  `drop-shadow(0 0 4px ${goldGlow}) drop-shadow(0 0 10px ${goldGlow})`,
                ],
          }}
        >
          
            <img
              key={`${isDark ? "dark" : "light"}-${variant}`}
              src={logoSrc}
              alt="راصد"
              style={{
                width: displaySize,
                height: "auto",
                objectFit: "contain",
                maxHeight: displaySize,
              }}
            />
          
        </div>

        {/* Rotating gold ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: `1px solid rgba(197,165,90,0.1)` }}
        />
      </div>

      {/* Text below logo */}
      {showText && (
        <div
          className="flex flex-col items-center mt-1 gap-0"
        >
          <span
            className="text-base font-bold tracking-tight"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #F5F0E0, #C5A55A, #F5F0E0)"
                : "linear-gradient(135deg, #0F1B3D, #C5A55A, #0F1B3D)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            منصة راصد
          </span>
          <span
            className="text-[8px] tracking-[0.12em]"
            style={{ color: isDark ? "rgba(197,165,90,0.5)" : "rgba(15,27,61,0.4)" }}
          >
            مكتب إدارة البيانات الوطنية
          </span>
        </div>
      )}
    </div>
  );
}

export default AnimatedLogo;
