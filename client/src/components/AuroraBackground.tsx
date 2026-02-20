/**
 * AuroraBackground — Animated aurora borealis background effect.
 * Renders layered gradient blobs that shift and morph over time.
 */
import React from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "intense";
  /** Show aurora only in dark mode */
  darkOnly?: boolean;
}

export function AuroraBackground({
  children,
  className,
  variant = "default",
  darkOnly = true,
}: AuroraBackgroundProps) {
  const opacityMap = { subtle: "opacity-20", default: "opacity-30", intense: "opacity-50" };
  const opacityClass = opacityMap[variant];
  const darkPrefix = darkOnly ? "dark:" : "";

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Aurora Layer 1 — Cyan/Teal */}
      <div
        className={cn(
          "pointer-events-none absolute -top-1/2 -left-1/4 h-[120%] w-[150%] rounded-full blur-3xl",
          darkOnly ? `opacity-0 dark:${opacityClass.replace("opacity-", "opacity-")}` : opacityClass
        )}
        style={{
          background: "radial-gradient(ellipse at 30% 50%, rgba(0, 255, 200, 0.4), transparent 70%)",
          animation: "aurora-drift-1 20s ease-in-out infinite alternate",
        }}
      />
      {/* Aurora Layer 2 — Purple/Blue */}
      <div
        className={cn(
          "pointer-events-none absolute -bottom-1/3 -right-1/4 h-[100%] w-[130%] rounded-full blur-3xl",
          darkOnly ? `opacity-0 dark:${opacityClass.replace("opacity-", "opacity-")}` : opacityClass
        )}
        style={{
          background: "radial-gradient(ellipse at 70% 50%, rgba(128, 0, 255, 0.35), transparent 70%)",
          animation: "aurora-drift-2 25s ease-in-out infinite alternate",
        }}
      />
      {/* Aurora Layer 3 — Green/Emerald */}
      <div
        className={cn(
          "pointer-events-none absolute top-1/4 left-1/3 h-[80%] w-[80%] rounded-full blur-3xl",
          darkOnly ? `opacity-0 dark:${opacityClass.replace("opacity-", "opacity-")}` : opacityClass
        )}
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(0, 200, 100, 0.3), transparent 60%)",
          animation: "aurora-drift-3 18s ease-in-out infinite alternate",
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style>{`
        @keyframes aurora-drift-1 {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(5%, -3%) rotate(2deg) scale(1.05); }
          66% { transform: translate(-3%, 5%) rotate(-1deg) scale(0.95); }
          100% { transform: translate(2%, -2%) rotate(1deg) scale(1.02); }
        }
        @keyframes aurora-drift-2 {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(-5%, 3%) rotate(-2deg) scale(1.08); }
          100% { transform: translate(3%, -4%) rotate(1.5deg) scale(0.97); }
        }
        @keyframes aurora-drift-3 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(8%, -5%) scale(1.1); opacity: 0.5; }
          100% { transform: translate(-4%, 3%) scale(0.9); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}

export default AuroraBackground;
