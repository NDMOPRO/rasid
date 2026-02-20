/**
 * PredictiveAnalytics — AI-powered predictive analytics visualization.
 * Shows trend lines, forecasts, and confidence intervals using SVG.
 */
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  value: number;
  predicted?: boolean;
}

interface PredictiveAnalyticsProps {
  data: DataPoint[];
  title?: string;
  className?: string;
  height?: number;
  forecastDays?: number;
  showConfidenceInterval?: boolean;
  metricLabel?: string;
  trendDirection?: "up" | "down" | "stable";
}

function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function PredictiveAnalytics({
  data,
  title,
  className,
  height = 300,
  forecastDays = 7,
  showConfidenceInterval = true,
  metricLabel = "القيمة",
  trendDirection,
}: PredictiveAnalyticsProps) {
  const width = 700;
  const padding = { top: 30, right: 30, bottom: 40, left: 60 };

  const { allPoints, forecast, confidenceBand, trend } = useMemo(() => {
    const historical = data.filter((d) => !d.predicted);
    const regressionPoints = historical.map((d, i) => ({ x: i, y: d.value }));
    const { slope, intercept } = linearRegression(regressionPoints);

    // Generate forecast
    const forecastPoints: DataPoint[] = [];
    const n = historical.length;
    for (let i = 0; i < forecastDays; i++) {
      const x = n + i;
      const predictedValue = Math.max(0, slope * x + intercept);
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      forecastPoints.push({
        date: date.toISOString().split("T")[0],
        value: Math.round(predictedValue),
        predicted: true,
      });
    }

    const allPts = [...historical, ...forecastPoints];

    // Confidence band (±15% of predicted value)
    const band = forecastPoints.map((p) => ({
      date: p.date,
      upper: Math.round(p.value * 1.15),
      lower: Math.round(Math.max(0, p.value * 0.85)),
    }));

    const dir = trendDirection || (slope > 0.5 ? "up" : slope < -0.5 ? "down" : "stable");

    return { allPoints: allPts, forecast: forecastPoints, confidenceBand: band, trend: dir };
  }, [data, forecastDays, trendDirection]);

  const maxValue = useMemo(() => Math.max(...allPoints.map((d) => d.value), 1) * 1.2, [allPoints]);
  const minValue = 0;

  const scaleX = (i: number) => padding.left + (i / Math.max(allPoints.length - 1, 1)) * (width - padding.left - padding.right);
  const scaleY = (v: number) => padding.top + (1 - (v - minValue) / (maxValue - minValue)) * (height - padding.top - padding.bottom);

  const historicalPath = useMemo(() => {
    const historical = allPoints.filter((d) => !d.predicted);
    return historical.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.value)}`).join(" ");
  }, [allPoints]);

  const forecastPath = useMemo(() => {
    const histLen = allPoints.filter((d) => !d.predicted).length;
    const forecastPts = allPoints.filter((d) => d.predicted);
    if (forecastPts.length === 0) return "";
    const startIdx = histLen - 1;
    const startPoint = allPoints[startIdx];
    let path = `M ${scaleX(startIdx)} ${scaleY(startPoint.value)}`;
    forecastPts.forEach((d, i) => {
      path += ` L ${scaleX(histLen + i)} ${scaleY(d.value)}`;
    });
    return path;
  }, [allPoints]);

  const trendColors = { up: "#10b981", down: "#ef4444", stable: "#f59e0b" };
  const trendLabels = { up: "اتجاه صاعد", down: "اتجاه هابط", stable: "مستقر" };
  const trendIcons = { up: "↗", down: "↘", stable: "→" };

  return (
    <div className={cn("relative rounded-xl bg-slate-900/50 p-6 border border-white/10", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4" dir="rtl">
        <div>
          {title && <h3 className="text-lg font-bold text-white/90">{title}</h3>}
          <p className="text-sm text-white/50">التحليل التنبؤي — {metricLabel}</p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${trendColors[trend]}22`, color: trendColors[trend] }}
        >
          <span className="text-lg">{trendIcons[trend]}</span>
          <span>{trendLabels[trend]}</span>
        </div>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = scaleY(minValue + pct * (maxValue - minValue));
          const val = Math.round(minValue + pct * (maxValue - minValue));
          return (
            <g key={pct}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" />
              <text x={padding.left - 8} y={y + 4} fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="end">
                {val.toLocaleString("ar-SA")}
              </text>
            </g>
          );
        })}

        {/* Confidence band */}
        {showConfidenceInterval && confidenceBand.length > 0 && (
          <path
            d={(() => {
              const histLen = allPoints.filter((d) => !d.predicted).length;
              const upper = confidenceBand.map((b, i) => `${scaleX(histLen + i)} ${scaleY(b.upper)}`);
              const lower = [...confidenceBand].reverse().map((b, i) => `${scaleX(histLen + confidenceBand.length - 1 - i)} ${scaleY(b.lower)}`);
              return `M ${upper.join(" L ")} L ${lower.join(" L ")} Z`;
            })()}
            fill="rgba(139,92,246,0.1)"
            stroke="none"
          />
        )}

        {/* Divider line between historical and forecast */}
        {(() => {
          const histLen = allPoints.filter((d) => !d.predicted).length;
          if (histLen > 0 && histLen < allPoints.length) {
            const x = scaleX(histLen - 1);
            return (
              <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
            );
          }
          return null;
        })()}

        {/* Historical line */}
        <path d={historicalPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Forecast line */}
        {forecastPath && (
          <path d={forecastPath} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="6 3" strokeLinejoin="round" />
        )}

        {/* Data points */}
        {allPoints.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(d.value)}
            r={d.predicted ? 3 : 4}
            fill={d.predicted ? "#8b5cf6" : "#06b6d4"}
            stroke={d.predicted ? "#8b5cf688" : "#06b6d488"}
            strokeWidth="2"
          />
        ))}

        {/* Legend */}
        <g transform={`translate(${padding.left + 10}, ${height - 15})`}>
          <circle cx="0" cy="0" r="4" fill="#06b6d4" />
          <text x="8" y="4" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Tajawal">بيانات فعلية</text>
          <circle cx="100" cy="0" r="4" fill="#8b5cf6" />
          <text x="108" y="4" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Tajawal">توقعات</text>
          {showConfidenceInterval && (
            <>
              <rect x="190" y="-5" width="15" height="10" fill="rgba(139,92,246,0.2)" rx="2" />
              <text x="210" y="4" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Tajawal">فاصل الثقة</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

export default PredictiveAnalytics;
