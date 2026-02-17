import { Skeleton } from './ui/skeleton';

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar skeleton — deep navy */}
      <div className="w-[280px] border-e border-[rgba(197,165,90,0.12)] p-4 space-y-6" style={{ background: 'linear-gradient(180deg, #0B1D35 0%, #0F2847 50%, #0B1D35 100%)' }}>
        {/* Logo area */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <Skeleton className="h-3 w-24" />
          <div className="w-3/4 h-[1px] mt-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(197,165,90,0.25), transparent)' }} />
        </div>
        {/* Menu items */}
        <div className="space-y-1.5 px-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1">
        {/* Header skeleton */}
        <div className="h-16 border-b border-border/50 px-4 flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        {/* Content area */}
        <div className="p-6 space-y-6 bg-grid-pattern">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
