interface SkeletonCardProps {
  lines?: number;
  hasAvatar?: boolean;
  hasImage?: boolean;
  className?: string;
}

export function SkeletonCard({
  lines = 3,
  hasAvatar = false,
  hasImage = false,
  className = '',
}: SkeletonCardProps) {
  return (
    <div className={`glass-card gold-sweep p-6 space-y-4 ${className}`}>
      {hasImage && (
        <div className="w-full h-40 rounded-xl bg-muted/50 animate-shimmer" />
      )}
      <div className="flex items-center gap-3">
        {hasAvatar && (
          <div className="w-10 h-10 rounded-full bg-muted/50 animate-shimmer flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted/50 animate-shimmer" />
          <div className="h-3 w-1/2 rounded bg-muted/50 animate-shimmer" style={{ animationDelay: '0.1s' }} />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-muted/50 animate-shimmer"
          style={{
            width: `${85 - i * 15}%`,
            animationDelay: `${(i + 1) * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
