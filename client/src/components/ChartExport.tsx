/**
 * ChartExport — Chart export and drilldown capabilities.
 * Wraps any chart component with export (PNG, SVG, CSV) and drilldown functionality.
 */
import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface DrilldownLevel {
  label: string;
  data: any;
}

interface ChartExportProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  /** Raw data for CSV export */
  data?: Record<string, any>[];
  /** Enable drilldown functionality */
  drilldownLevels?: DrilldownLevel[];
  onDrilldown?: (level: number, data: any) => void;
  /** File name prefix for exports */
  exportPrefix?: string;
}

export function ChartExport({
  children,
  title,
  className,
  data,
  drilldownLevels,
  onDrilldown,
  exportPrefix = "rasid-chart",
}: ChartExportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentDrillLevel, setCurrentDrillLevel] = useState(0);

  // Export as PNG
  const exportPNG = useCallback(async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas").catch(() => ({ default: null }));
      
      if (html2canvas) {
        const canvas = await html2canvas(containerRef.current, {
          backgroundColor: "#0a0e1a",
          scale: 2,
        });
        const link = document.createElement("a");
        link.download = `${exportPrefix}-${new Date().toISOString().split("T")[0]}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        // Fallback: use SVG serialization
        const svgElement = containerRef.current.querySelector("svg");
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);
          
          img.onload = () => {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            ctx?.scale(2, 2);
            ctx?.drawImage(img, 0, 0);
            const link = document.createElement("a");
            link.download = `${exportPrefix}-${new Date().toISOString().split("T")[0]}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            URL.revokeObjectURL(url);
          };
          img.src = url;
        }
      }
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  }, [exportPrefix]);

  // Export as SVG
  const exportSVG = useCallback(() => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${exportPrefix}-${new Date().toISOString().split("T")[0]}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [exportPrefix]);

  // Export as CSV
  const exportCSV = useCallback(() => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      // BOM for Arabic support in Excel
      "\uFEFF",
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${exportPrefix}-${new Date().toISOString().split("T")[0]}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [data, exportPrefix]);

  // Export as JSON
  const exportJSON = useCallback(() => {
    if (!data || data.length === 0) return;
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${exportPrefix}-${new Date().toISOString().split("T")[0]}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [data, exportPrefix]);

  // Drilldown navigation
  const handleDrilldown = useCallback(
    (direction: "in" | "out") => {
      if (!drilldownLevels) return;
      const newLevel = direction === "in"
        ? Math.min(currentDrillLevel + 1, drilldownLevels.length - 1)
        : Math.max(currentDrillLevel - 1, 0);
      setCurrentDrillLevel(newLevel);
      onDrilldown?.(newLevel, drilldownLevels[newLevel]?.data);
    },
    [currentDrillLevel, drilldownLevels, onDrilldown]
  );

  return (
    <div className={cn("relative group", className)} dir="rtl">
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Export button */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 hover:text-white flex items-center justify-center text-sm border border-white/10 hover:border-white/20 transition-all"
            title="تصدير"
          >
            ⬇
          </button>
          {showExportMenu && (
            <div className="absolute top-10 left-0 w-36 rounded-lg bg-slate-800 border border-white/10 shadow-xl overflow-hidden z-30">
              <button onClick={exportPNG} disabled={isExporting} className="w-full px-3 py-2 text-right text-xs text-white/70 hover:bg-white/10 transition-colors">
                {isExporting ? "جاري التصدير..." : "📷 تصدير PNG"}
              </button>
              <button onClick={exportSVG} className="w-full px-3 py-2 text-right text-xs text-white/70 hover:bg-white/10 transition-colors">
                🎨 تصدير SVG
              </button>
              {data && data.length > 0 && (
                <>
                  <button onClick={exportCSV} className="w-full px-3 py-2 text-right text-xs text-white/70 hover:bg-white/10 transition-colors">
                    📊 تصدير CSV
                  </button>
                  <button onClick={exportJSON} className="w-full px-3 py-2 text-right text-xs text-white/70 hover:bg-white/10 transition-colors">
                    📋 تصدير JSON
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Drilldown buttons */}
        {drilldownLevels && drilldownLevels.length > 1 && (
          <>
            <button
              onClick={() => handleDrilldown("out")}
              disabled={currentDrillLevel === 0}
              className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 hover:text-white flex items-center justify-center text-sm border border-white/10 disabled:opacity-30 transition-all"
              title="رجوع"
            >
              ↑
            </button>
            <button
              onClick={() => handleDrilldown("in")}
              disabled={currentDrillLevel >= drilldownLevels.length - 1}
              className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 hover:text-white flex items-center justify-center text-sm border border-white/10 disabled:opacity-30 transition-all"
              title="تفصيل"
            >
              ↓
            </button>
            <span className="flex items-center px-2 text-[10px] text-white/40 bg-black/40 rounded-lg border border-white/5">
              {drilldownLevels[currentDrillLevel]?.label}
            </span>
          </>
        )}
      </div>

      {/* Chart content */}
      <div ref={containerRef}>
        {title && (
          <div className="absolute top-2 right-2 z-10 text-xs text-white/30 bg-black/30 px-2 py-1 rounded">
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default ChartExport;
