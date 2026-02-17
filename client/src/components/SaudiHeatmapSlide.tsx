import { useState, useMemo } from "react";
import { MapPin, Shield, AlertTriangle, XCircle, Activity, Wifi } from "lucide-react";

// ─── Saudi Arabia Region Paths (simplified SVG) ───────────
// Approximate polygon coordinates for 13 administrative regions
const REGION_PATHS: Record<string, { path: string; cx: number; cy: number }> = {
  riyadh: {
    path: "M 380,180 L 420,160 L 480,170 L 510,210 L 520,280 L 500,340 L 460,370 L 400,360 L 370,320 L 350,260 L 360,210 Z",
    cx: 430, cy: 270,
  },
  makkah: {
    path: "M 200,280 L 260,260 L 310,270 L 350,260 L 370,320 L 360,370 L 320,400 L 280,420 L 240,400 L 200,370 L 190,320 Z",
    cx: 280, cy: 340,
  },
  madinah: {
    path: "M 200,160 L 260,140 L 310,150 L 350,160 L 380,180 L 360,210 L 350,260 L 310,270 L 260,260 L 220,240 L 200,200 Z",
    cx: 280, cy: 200,
  },
  eastern: {
    path: "M 480,170 L 540,130 L 600,140 L 620,180 L 630,240 L 620,310 L 580,360 L 540,380 L 500,340 L 520,280 L 510,210 Z",
    cx: 560, cy: 260,
  },
  qassim: {
    path: "M 350,130 L 400,120 L 420,130 L 420,160 L 380,180 L 350,160 Z",
    cx: 385, cy: 148,
  },
  hail: {
    path: "M 280,90 L 340,80 L 380,90 L 400,120 L 350,130 L 310,150 L 260,140 L 260,110 Z",
    cx: 330, cy: 110,
  },
  tabuk: {
    path: "M 140,60 L 200,50 L 260,60 L 280,90 L 260,110 L 200,160 L 160,140 L 130,110 L 120,80 Z",
    cx: 200, cy: 100,
  },
  northern: {
    path: "M 340,40 L 400,30 L 460,40 L 480,70 L 460,100 L 400,120 L 380,90 L 340,80 Z",
    cx: 410, cy: 70,
  },
  jawf: {
    path: "M 220,30 L 280,20 L 340,40 L 340,80 L 280,90 L 260,60 L 220,50 Z",
    cx: 280, cy: 55,
  },
  jizan: {
    path: "M 200,400 L 240,400 L 260,430 L 250,460 L 220,470 L 190,450 L 185,420 Z",
    cx: 222, cy: 435,
  },
  asir: {
    path: "M 280,420 L 320,400 L 360,370 L 400,360 L 420,390 L 400,430 L 360,450 L 310,460 L 260,430 Z",
    cx: 340, cy: 415,
  },
  najran: {
    path: "M 400,430 L 460,370 L 500,380 L 520,420 L 500,460 L 450,470 L 400,460 Z",
    cx: 460, cy: 430,
  },
  bahah: {
    path: "M 240,400 L 280,420 L 260,430 L 250,460 L 230,450 L 220,420 Z",
    cx: 252, cy: 428,
  },
};

// ─── Color scale based on compliance rate ─────────────────
function getComplianceColor(rate: number, opacity = 1): string {
  if (rate >= 70) return `rgba(34, 197, 94, ${opacity})`; // green
  if (rate >= 50) return `rgba(234, 179, 8, ${opacity})`; // yellow
  if (rate >= 30) return `rgba(249, 115, 22, ${opacity})`; // orange
  return `rgba(239, 68, 68, ${opacity})`; // red
}

function getComplianceGlow(rate: number): string {
  if (rate >= 70) return "0 0 20px rgba(34, 197, 94, 0.4)";
  if (rate >= 50) return "0 0 20px rgba(234, 179, 8, 0.4)";
  if (rate >= 30) return "0 0 20px rgba(249, 115, 22, 0.4)";
  return "0 0 20px rgba(239, 68, 68, 0.4)";
}

interface RegionData {
  id: string;
  name: string;
  nameEn: string;
  totalSites: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  noPolicy: number;
  complianceRate: number;
  classifications: string[];
}

// ─── Animated Pulse Dot ───────────────────────────────────
function PulseDot({ cx, cy, color, delay = 0 }: { cx: number; cy: number; color: string; delay?: number }) {
  return (
    <g>
      <circle
        cx={cx} cy={cy} r={3}
        fill={color}
      />
      <circle
        cx={cx} cy={cy} r={3}
        fill="none" stroke={color} strokeWidth={1}
      />
    </g>
  );
}

// ─── Region Tooltip ───────────────────────────────────────
function RegionTooltip({ region, x, y }: { region: RegionData; x: number; y: number }) {
  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -110%)" }}
    >
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-[#C5A55A]/20 dark:border-white/20 p-4 min-w-[220px] shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4" style={{ color: getComplianceColor(region.complianceRate) }} />
          <span className="text-white font-black text-lg">{region.name}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">نسبة الامتثال</span>
            <span className="font-black text-lg" style={{ color: getComplianceColor(region.complianceRate) }}>
              {region.complianceRate}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#C5A55A]/[0.05] dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ backgroundColor: getComplianceColor(region.complianceRate) }}
              animate={{ width: `${region.complianceRate}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-white/70">ممتثل: <strong className="text-emerald-400">{region.compliant}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-white/70">جزئي: <strong className="text-amber-400">{region.partial}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-400" />
              <span className="text-white/70">غير ممتثل: <strong className="text-rose-400">{region.nonCompliant}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-slate-400" />
              <span className="text-white/70">لا يعمل: <strong className="text-slate-400">{region.noPolicy}</strong></span>
            </div>
          </div>
          <div className="text-xs text-white/40 mt-1">
            إجمالي المواقع: {region.totalSites}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Heatmap Slide ───────────────────────────────────
export default function SaudiHeatmapSlide({ regionData }: { regionData: RegionData[] }) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const regionMap = useMemo(() => {
    const map: Record<string, RegionData> = {};
    regionData.forEach((r) => { map[r.id] = r; });
    return map;
  }, [regionData]);

  const totalSites = useMemo(() => regionData.reduce((sum, r) => sum + r.totalSites, 0), [regionData]);
  const avgCompliance = useMemo(() => {
    const total = regionData.reduce((sum, r) => sum + r.complianceRate, 0);
    return regionData.length ? Math.round(total / regionData.length) : 0;
  }, [regionData]);

  // Top 3 regions by compliance
  const topRegions = useMemo(() =>
    [...regionData].sort((a, b) => b.complianceRate - a.complianceRate).slice(0, 3),
    [regionData]
  );

  // Bottom 3 regions
  const bottomRegions = useMemo(() =>
    [...regionData].filter(r => r.totalSites > 0).sort((a, b) => a.complianceRate - b.complianceRate).slice(0, 3),
    [regionData]
  );

  const hoveredData = hoveredRegion ? regionMap[hoveredRegion] : null;
  const hoveredPath = hoveredRegion ? REGION_PATHS[hoveredRegion] : null;

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-6 py-4"
      dir="rtl"
    >
      {/* Title */}
      <div
        className="text-center mb-4"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-900 flex items-center justify-center shadow-xl"
          >
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">
            الخريطة الحرارية — التوزيع الجغرافي للامتثال
          </h2>
        </div>
        <p className="text-white/50 text-sm">توزيع مستوى الامتثال عبر مناطق المملكة العربية السعودية</p>
      </div>

      <div className="flex gap-6 w-full max-w-7xl flex-1 min-h-0">
        {/* Map Area */}
        <div
          className="flex-1 relative rounded-3xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl overflow-hidden"
        >
          {/* Map SVG */}
          <div className="relative w-full h-full p-4">
            <svg
              viewBox="100 10 560 480"
              className="w-full h-full"
              style={{ filter: "drop-shadow(0 0 30px rgba(139, 92, 246, 0.1))" }}
            >
              {/* Background glow */}
              <defs>
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.05)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <filter id="regionGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect x="100" y="10" width="560" height="480" fill="url(#mapGlow)" />

              {/* Region paths */}
              {Object.entries(REGION_PATHS).map(([id, { path, cx, cy }]) => {
                const region = regionMap[id];
                const rate = region?.complianceRate || 0;
                const isHovered = hoveredRegion === id;
                const fillColor = region ? getComplianceColor(rate, isHovered ? 0.8 : 0.5) : "rgba(100,100,100,0.2)";
                const strokeColor = isHovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)";

                return (
                  <g key={id}>
                    <path
                      d={path}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 2 : 1}
                      style={{
                        cursor: "pointer",
                        filter: isHovered ? "url(#regionGlow)" : "none",
                      }}
                      onMouseEnter={() => setHoveredRegion(id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    />
                    {/* Region label */}
                    <text
                      x={cx}
                      y={cy - 8}
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      opacity={0.9}
                    >
                      {region?.name || id}
                    </text>
                    <text
                      x={cx}
                      y={cy + 6}
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      fill={getComplianceColor(rate)}
                      fontSize="11"
                      fontWeight="900"
                    >
                      {rate}%
                    </text>
                    {/* Animated pulse on each region center */}
                    {region && region.totalSites > 0 && (
                      <PulseDot
                        cx={cx}
                        cy={cy + 16}
                        color={getComplianceColor(rate)}
                        delay={Math.random() * 2}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            
              {hoveredData && hoveredPath && (
                <RegionTooltip
                  region={hoveredData}
                  x={(hoveredPath.cx / 660) * 100}
                  y={(hoveredPath.cy / 490) * 100}
                />
              )}
            
          </div>
        </div>

        {/* Side Panel */}
        <div
          className="w-80 flex flex-col gap-4"
        >
          {/* Summary Stats */}
          <div className="rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-5">
            <h3 className="text-sm font-bold text-white/60 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              ملخص جغرافي
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-xl bg-[#C5A55A]/[0.03] dark:bg-white/5">
                <div className="text-2xl font-black text-white">{totalSites}</div>
                <div className="text-xs text-white/50">إجمالي المواقع</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-[#C5A55A]/[0.03] dark:bg-white/5">
                <div className="text-2xl font-black" style={{ color: getComplianceColor(avgCompliance) }}>
                  {avgCompliance}%
                </div>
                <div className="text-xs text-white/50">متوسط الامتثال</div>
              </div>
            </div>
          </div>

          {/* Top Regions */}
          <div className="rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-5">
            <h3 className="text-sm font-bold text-emerald-400 mb-3">🏆 أعلى المناطق امتثالاً</h3>
            <div className="space-y-2">
              {topRegions.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#C5A55A]/[0.03] dark:bg-white/5"
                  onMouseEnter={() => setHoveredRegion(r.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/40 w-5">{i + 1}</span>
                    <span className="text-sm font-bold text-white">{r.name}</span>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{r.complianceRate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Regions */}
          <div className="rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-5">
            <h3 className="text-sm font-bold text-rose-400 mb-3">⚠️ أقل المناطق امتثالاً</h3>
            <div className="space-y-2">
              {bottomRegions.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#C5A55A]/[0.03] dark:bg-white/5"
                  onMouseEnter={() => setHoveredRegion(r.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/40 w-5">{i + 1}</span>
                    <span className="text-sm font-bold text-white">{r.name}</span>
                  </div>
                  <span className="text-sm font-black text-rose-400">{r.complianceRate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-4">
            <h3 className="text-xs font-bold text-white/50 mb-2">مقياس الألوان</h3>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-3 rounded-full" style={{
                background: "linear-gradient(to left, #22c55e, #eab308, #f97316, #ef4444)"
              }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>100%</span>
              <span>70%</span>
              <span>50%</span>
              <span>30%</span>
              <span>0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
