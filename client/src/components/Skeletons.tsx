import { cn } from '@/lib/utils';

/**
 * Premium Skeleton component with shimmer/shine animation effect.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted/60',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

// ========== KPI Card Skeleton ==========
export function KPICardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-16 h-6 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="absolute bottom-0 right-0 h-[3px] w-[40%] rounded-t-full">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}

// ========== Dashboard KPI Grid Skeleton ==========
export function KPIGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

// ========== Chart Skeleton ==========
export function ChartSkeleton({ height = 'h-72' }: { height?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-5', height)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-end gap-2 h-[calc(100%-3rem)] pt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <Skeleton
              className="w-full rounded-t-md"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== Pie Chart Skeleton ==========
export function PieChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 h-72">
      <Skeleton className="h-5 w-40 mb-4" />
      <div className="flex items-center justify-center h-[calc(100%-3rem)]">
        <Skeleton className="w-40 h-40 rounded-full" />
      </div>
    </div>
  );
}

// ========== Table Skeleton ==========
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      <div className="border-b border-[rgba(197,165,90,0.12)] bg-[rgba(197,165,90,0.04)] px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="border-b border-border/50 px-4 py-3">
          <div className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                className={cn('h-4 flex-1', colIdx === 0 && 'max-w-[200px]')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== Welcome Banner Skeleton ==========
export function WelcomeBannerSkeleton() {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 bg-primary/10" />
          <Skeleton className="h-4 w-80 bg-primary/10" />
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl bg-primary/10" />
          <Skeleton className="h-10 w-28 rounded-xl bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

// ========== Full Dashboard Skeleton ==========
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <WelcomeBannerSkeleton />
      <KPIGridSkeleton count={8} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableSkeleton rows={5} cols={4} />
        <TableSkeleton rows={5} cols={4} />
      </div>
    </div>
  );
}

// ========== Generic Page Skeleton ==========
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <KPIGridSkeleton count={4} />
      <ChartSkeleton />
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}

export { Skeleton };
