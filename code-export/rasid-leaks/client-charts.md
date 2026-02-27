# rasid-leaks - client-charts

> Auto-extracted source code documentation

---

## `client/src/components/charts/UltraPremiumCharts.tsx`

```tsx
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend,
} from "recharts";
import { useState } from "react";

// ─── Color Palettes ────────────────────────────────────────────
export const CHART_COLORS = {
  primary: "hsl(var(--card))",
  accent: "#3b82f6",
  gold: "#d4af37",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  purple: "#8b5cf6",
  pink: "#ec4899",
  emerald: "#10b981",
  slate: "#64748b",
};

export const COMPLIANCE_COLORS = {
  compliant: "#22c55e",
  partial: "#f59e0b",
  nonCompliant: "#ef4444",
  noPolicy: "#94a3b8",
  unreachable: "#6b7280",
};

export const GRADIENT_PALETTES = [
  ["hsl(var(--card))", "#3b82f6"],
  ["#22c55e", "#10b981"],
  ["#f59e0b", "#f97316"],
  ["#ef4444", "#dc2626"],
  ["#8b5cf6", "#a855f7"],
  ["#06b6d4", "#0ea5e9"],
  ["#ec4899", "#f43f5e"],
  ["#d4af37", "#eab308"],
];

const DONUT_COLORS = [
  CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger,
  CHART_COLORS.slate, CHART_COLORS.info, CHART_COLORS.purple,
];

// ─── Custom Tooltip ────────────────────────────────────────────
function GlassTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl p-3 border border-[#C5A55A]/10 dark:border-white/10 shadow-xl backdrop-blur-xl min-w-[140px]">
      {label && <p className="text-xs text-muted-foreground mb-1.5 font-medium">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-foreground font-semibold">{typeof entry.value === 'number' ? entry.value.toLocaleString('ar-SA') : entry.value}</span>
          {entry.name && <span className="text-muted-foreground text-xs">({entry.name})</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Animated Donut Chart ──────────────────────────────────────
interface DonutChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title?: string;
  centerLabel?: string;
  centerValue?: string | number;
  height?: number;
  showLegend?: boolean;
  onSliceClick?: (entry: any) => void;
}

export function AnimatedDonutChart({
  data, title, centerLabel, centerValue, height = 280, showLegend = true, onSliceClick,
}: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div
      className="w-full"
    >
      {title && <h3 className="text-sm font-semibold text-foreground mb-3 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={(entry) => onSliceClick?.(entry)}
            style={{ cursor: onSliceClick ? "pointer" : "default" }}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color || DONUT_COLORS[index % DONUT_COLORS.length]}
                stroke="transparent"
                strokeWidth={activeIndex === index ? 3 : 0}
                style={{
                  filter: activeIndex === index ? "brightness(1.2) drop-shadow(0 0 8px rgba(0,0,0,0.3))" : "none",
                  transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                  transformOrigin: "center",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<GlassTooltip />} />
          {/* Center text */}
          {(centerLabel || centerValue) && (
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
              {centerValue && (
                <tspan x="50%" dy="-8" className="fill-foreground text-2xl font-bold">
                  {centerValue}
                </tspan>
              )}
              {centerLabel && (
                <tspan x="50%" dy="22" className="fill-muted-foreground text-xs">
                  {centerLabel}
                </tspan>
              )}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {data.map((entry, index) => (
            <div
              key={index}
              className={`flex items-center gap-1.5 text-xs cursor-pointer transition-opacity ${
                activeIndex !== null && activeIndex !== index ? "opacity-50" : "opacity-100"
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || DONUT_COLORS[index % DONUT_COLORS.length] }} />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-semibold text-foreground">{entry.value.toLocaleString('ar-SA')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Animated Bar Chart ────────────────────────────────────────
interface BarChartProps {
  data: Array<Record<string, any>>;
  bars: Array<{ dataKey: string; name: string; color: string; stackId?: string }>;
  xAxisKey: string;
  title?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
  stacked?: boolean;
  showGrid?: boolean;
  onBarClick?: (entry: any) => void;
}

export function AnimatedBarChart({
  data, bars, xAxisKey, title, height = 300, layout = "horizontal", stacked = false, showGrid = true, onBarClick,
}: BarChartProps) {
  return (
    <div
      className="w-full"
    >
      {title && <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout={layout === "vertical" ? "vertical" : "horizontal"} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30" />}
          {layout === "vertical" ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis dataKey={xAxisKey} type="category" tick={{ fontSize: 11 }} width={80} className="text-muted-foreground" />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            </>
          )}
          <Tooltip content={<GlassTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {bars.map((bar, i) => (
            <Bar
              key={i}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              stackId={stacked ? "stack" : bar.stackId}
              radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              animationBegin={i * 200}
              animationDuration={1000}
              animationEasing="ease-out"
              onClick={onBarClick}
              style={{ cursor: onBarClick ? "pointer" : "default" }}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Animated Area Chart ───────────────────────────────────────
interface AreaChartProps {
  data: Array<Record<string, any>>;
  areas: Array<{ dataKey: string; name: string; color: string; gradientId?: string }>;
  xAxisKey: string;
  title?: string;
  height?: number;
  showGrid?: boolean;
}

export function AnimatedAreaChart({
  data, areas, xAxisKey, title, height = 300, showGrid = true,
}: AreaChartProps) {
  return (
    <div
      className="w-full"
    >
      {title && <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            {areas.map((area, i) => (
              <linearGradient key={i} id={area.gradientId || `gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={area.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30" />}
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} className="text-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
          <Tooltip content={<GlassTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {areas.map((area, i) => (
            <Area
              key={i}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color}
              fill={`url(#${area.gradientId || `gradient-${area.dataKey}`})`}
              strokeWidth={2}
              animationBegin={i * 200}
              animationDuration={1200}
              animationEasing="ease-out"
              dot={{ r: 3, fill: area.color, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: area.color, stroke: "#fff", strokeWidth: 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Animated Radar Chart ──────────────────────────────────────
interface RadarChartProps {
  data: Array<{ subject: string; value: number; fullMark?: number }>;
  title?: string;
  height?: number;
  color?: string;
  fillOpacity?: number;
}

export function AnimatedRadarChart({
  data, title, height = 300, color = CHART_COLORS.primary, fillOpacity = 0.3,
}: RadarChartProps) {
  return (
    <div
      className="w-full"
    >
      {title && <h3 className="text-sm font-semibold text-foreground mb-3 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="currentColor" className="text-border/40" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} className="text-muted-foreground" />
          <PolarRadiusAxis tick={{ fontSize: 9 }} className="text-muted-foreground" />
          <Radar
            name="القيمة"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={fillOpacity}
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <Tooltip content={<GlassTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Animated Line Chart ───────────────────────────────────────
interface LineChartProps {
  data: Array<Record<string, any>>;
  lines: Array<{ dataKey: string; name: string; color: string; dashed?: boolean }>;
  xAxisKey: string;
  title?: string;
  height?: number;
  showGrid?: boolean;
}

export function AnimatedLineChart({
  data, lines, xAxisKey, title, height = 300, showGrid = true,
}: LineChartProps) {
  return (
    <div
      className="w-full"
    >
      {title && <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30" />}
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} className="text-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
          <Tooltip content={<GlassTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {lines.map((line, i) => (
            <Line
              key={i}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.dashed ? "5 5" : undefined}
              dot={{ r: 3, fill: line.color, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: line.color, stroke: "#fff", strokeWidth: 2 }}
              animationBegin={i * 200}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Stat Card with Animated Counter ───────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
  trend?: number;
  suffix?: string;
  onClick?: () => void;
}

export function AnimatedStatCard({ label, value, icon, color = CHART_COLORS.primary, trend, suffix, onClick }: StatCardProps) {
  return (
    <div
      className={`glass-card rounded-xl p-4 border border-[#C5A55A]/10 dark:border-white/10 relative overflow-hidden group ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">
            {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
            {suffix && <span className="text-sm text-muted-foreground mr-1">{suffix}</span>}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              <span>{trend >= 0 ? "▲" : "▼"}</span>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-[#C5A55A]/[0.03] dark:bg-white/5" style={{ color }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Progress Ring ─────────────────────────────────────────────
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function ProgressRing({ value, max = 100, size = 80, strokeWidth = 6, color = CHART_COLORS.primary, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(value / max, 1);
  const offset = circumference - percent * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border/20" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">{Math.round(percent * 100)}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

```

---

