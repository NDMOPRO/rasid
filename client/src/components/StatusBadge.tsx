interface StatusBadgeProps {
  status: 'critical' | 'warning' | 'active' | 'resolved';
  label: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-badge-dot" />
      {label}
    </span>
  );
}
