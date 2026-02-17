interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function AnimatedProgressBar({
  value,
  max = 100,
  color = 'var(--sdaia-accent)',
  height = 8,
  className = '',
  showLabel = false,
  label,
}: AnimatedProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5 text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showLabel && (
            <span className="font-bold text-foreground">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-muted/50"
        style={{ height }}
      >
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color, width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
