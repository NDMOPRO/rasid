import { useRef, useEffect, memo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register all Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title
);

// Set global defaults for RTL and Arabic
ChartJS.defaults.font.family = "Tajawal, sans-serif";
ChartJS.defaults.color = "#e2e8f0";

interface RasidChartProps {
  chartConfig: {
    type: string;
    data: any;
    options?: any;
  };
  summary?: string;
}

const RasidChart = memo(function RasidChart({ chartConfig, summary }: RasidChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !chartConfig) return;

    // Destroy previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Deep merge options with dark theme defaults
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart" as const,
      },
      plugins: {
        legend: {
          position: "bottom" as const,
          rtl: true,
          labels: {
            color: "#e2e8f0",
            font: { family: "Tajawal", size: 12 },
            padding: 16,
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          color: "#f1f5f9",
          font: { family: "Tajawal", size: 16, weight: "bold" as const },
          padding: { bottom: 16 },
          ...(chartConfig.options?.plugins?.title || {}),
        },
        tooltip: {
          rtl: true,
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleFont: { family: "Tajawal", size: 13 },
          bodyFont: { family: "Tajawal", size: 12 },
          borderColor: "rgba(56, 189, 248, 0.3)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: chartConfig.type === "radar" || chartConfig.type === "pie" || chartConfig.type === "doughnut" || chartConfig.type === "polarArea"
        ? undefined
        : {
            x: {
              ticks: { color: "#94a3b8", font: { family: "Tajawal", size: 11 } },
              grid: { color: "rgba(148, 163, 184, 0.1)" },
              ...(chartConfig.options?.scales?.x || {}),
            },
            y: {
              ticks: { color: "#94a3b8", font: { family: "Tajawal", size: 11 } },
              grid: { color: "rgba(148, 163, 184, 0.1)" },
              ...(chartConfig.options?.scales?.y || {}),
            },
            ...(chartConfig.options?.scales?.y1
              ? {
                  y1: {
                    ticks: { color: "#94a3b8", font: { family: "Tajawal", size: 11 } },
                    grid: { drawOnChartArea: false },
                    ...chartConfig.options.scales.y1,
                  },
                }
              : {}),
          },
      ...(chartConfig.options || {}),
    };

    // Override nested plugins to keep our defaults
    if (chartConfig.options?.plugins) {
      options.plugins = { ...options.plugins, ...chartConfig.options.plugins };
    }

    try {
      chartRef.current = new ChartJS(ctx, {
        type: chartConfig.type as any,
        data: chartConfig.data,
        options,
      });
    } catch (e) {
      console.error("Chart render error:", e);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartConfig]);

  return (
    <div className="my-4 rounded-xl border border-sky-500/20 bg-slate-900/60 backdrop-blur-sm p-4 shadow-lg shadow-sky-500/5">
      <div className="relative h-[360px] w-full">
        <canvas ref={canvasRef} />
      </div>
      {summary && (
        <p className="mt-3 text-center text-sm text-slate-400 font-[Tajawal]">{summary}</p>
      )}
    </div>
  );
});

export default RasidChart;
