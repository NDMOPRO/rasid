/**
 * Chart3D — 3D bar chart visualization using CSS 3D transforms.
 * No external 3D library required — pure CSS transforms for performance.
 */
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Chart3DDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface Chart3DProps {
  data: Chart3DDataPoint[];
  title?: string;
  height?: number;
  className?: string;
  variant?: "bars" | "columns";
  showValues?: boolean;
  animated?: boolean;
}

const DEFAULT_COLORS = [
  "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#84cc16",
];

export function Chart3D({
  data,
  title,
  height = 300,
  className,
  variant = "bars",
  showValues = true,
  animated = true,
}: Chart3DProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  return (
    <div className={cn("relative rounded-xl bg-slate-900/50 p-6 border border-white/10", className)}>
      {title && (
        <h3 className="mb-4 text-lg font-bold text-white/90 text-right">{title}</h3>
      )}

      {/* 3D Scene Container */}
      <div
        className="relative mx-auto"
        style={{
          height,
          perspective: "800px",
          perspectiveOrigin: "50% 40%",
        }}
      >
        {/* 3D Floor */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)",
            transform: "rotateX(60deg)",
            transformOrigin: "bottom",
          }}
        />

        {/* 3D Bars */}
        <div className="flex items-end justify-around h-full px-4 gap-2">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 60);
            const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
            const delay = animated ? `${index * 0.1}s` : "0s";

            return (
              <div key={index} className="flex flex-col items-center flex-1 max-w-[80px]">
                {/* Value label */}
                {showValues && (
                  <span
                    className="text-xs font-mono text-white/70 mb-1"
                    style={{
                      animation: animated ? `fadeInUp 0.5s ease-out ${delay} both` : undefined,
                    }}
                  >
                    {item.value.toLocaleString("ar-SA")}
                  </span>
                )}

                {/* 3D Bar */}
                <div
                  className="relative w-full group cursor-pointer"
                  style={{
                    height: `${barHeight}px`,
                    animation: animated ? `growUp 0.8s ease-out ${delay} both` : undefined,
                    transformStyle: "preserve-3d",
                    transform: "rotateX(-5deg) rotateY(-10deg)",
                  }}
                >
                  {/* Front face */}
                  <div
                    className="absolute inset-0 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                    style={{
                      background: `linear-gradient(180deg, ${color}dd, ${color}88)`,
                      boxShadow: `0 0 20px ${color}33, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}
                  />
                  {/* Right face (3D depth) */}
                  <div
                    className="absolute top-0 right-0 h-full w-3 rounded-tr-md"
                    style={{
                      background: `linear-gradient(180deg, ${color}99, ${color}44)`,
                      transform: "skewY(-30deg)",
                      transformOrigin: "top right",
                    }}
                  />
                  {/* Top face (3D depth) */}
                  <div
                    className="absolute top-0 left-0 right-0 h-3 rounded-t-md"
                    style={{
                      background: `linear-gradient(135deg, ${color}ee, ${color}aa)`,
                      transform: "skewX(-30deg)",
                      transformOrigin: "top left",
                    }}
                  />
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      boxShadow: `0 0 30px ${color}66, 0 0 60px ${color}22`,
                    }}
                  />
                </div>

                {/* Label */}
                <span className="text-xs text-white/60 mt-2 text-center truncate w-full" dir="rtl">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes growUp {
          from { transform: rotateX(-5deg) rotateY(-10deg) scaleY(0); opacity: 0; }
          to { transform: rotateX(-5deg) rotateY(-10deg) scaleY(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Chart3D;
