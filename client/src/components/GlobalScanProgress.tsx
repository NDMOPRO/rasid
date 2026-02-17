import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Radar, ChevronLeft } from "lucide-react";

/**
 * Global scan progress indicator that appears in the top header bar
 * when a deep scan is actively running. Shows a compact progress bar
 * with percentage and links to the deep scan page.
 */
export function GlobalScanProgress() {
  const [location, setLocation] = useLocation();
  
  const { data: progress } = trpc.deepScan.liveProgress.useQuery(
    { jobId: 30001 },
    { refetchInterval: 3000 }
  );

  // Don't show if no progress data or scan is not active
  if (!progress || !progress.isActive) return null;

  // Don't show on the deep scan page itself (it has its own progress bar)
  if (location === "/deep-scan") return null;

  const total = progress.total || 1;
  const completed = progress.completed || 0;
  const failed = progress.failed || 0;
  const processed = completed + failed;
  const percent = Math.round((processed / total) * 100);
  const completedPercent = ((completed / total) * 100).toFixed(1);
  const failedPercent = ((failed / total) * 100).toFixed(1);

  // Calculate rate
  const scanning = progress.scanning || 0;

  return (
    
      <div
        onClick={() => setLocation("/deep-scan")}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 cursor-pointer transition-all duration-300 border border-primary/20 group"
        title="انقر للانتقال إلى صفحة المسح العميق"
      >
        {/* Pulsing radar icon */}
        <div className="relative">
          <Radar className="h-4 w-4 text-primary" />
          <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Progress info */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground whitespace-nowrap">
            المسح العميق
          </span>
          
          {/* Mini progress bar */}
          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${completedPercent}%` }}
              />
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${failedPercent}%` }}
              />
            </div>
          </div>

          <span className="text-xs font-bold text-primary tabular-nums">
            {percent}%
          </span>

          {scanning > 0 && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:inline">
              ({scanning} جاري)
            </span>
          )}
        </div>

        {/* Arrow to navigate */}
        <ChevronLeft className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    
  );
}
