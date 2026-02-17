
interface DataFlowLineProps {
  className?: string;
  color?: string;
}

export function DataFlowLine({
  className = '',
  color = 'var(--sdaia-accent)',
}: DataFlowLineProps) {
  return (
    <div className={`relative h-px w-full overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-border/30" />
      <div
        className="absolute inset-y-0 w-1/4"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
    </div>
  );
}
