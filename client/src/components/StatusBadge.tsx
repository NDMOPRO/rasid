interface StatusBadgeProps {
  status: 'active' | 'warning' | 'critical' | 'resolved';
  label: string;
}

const statusStyles: Record<string, { bg: string; color: string; dot: string }> = {
  active: { bg: 'rgba(52,211,153,.1)', color: '#34D399', dot: '#34D399' },
  warning: { bg: 'rgba(251,191,36,.1)', color: '#FBBF24', dot: '#FBBF24' },
  critical: { bg: 'rgba(248,113,113,.1)', color: '#F87171', dot: '#F87171' },
  resolved: { bg: 'rgba(148,163,184,.1)', color: '#94A3B8', dot: '#94A3B8' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const s = statusStyles[status];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.25rem 0.625rem',
      borderRadius: '9999px',
      background: s.bg,
      color: s.color,
      fontSize: '0.75rem',
      fontWeight: 600,
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: s.dot,
        boxShadow: `0 0 6px ${s.dot}`,
      }} />
      {label}
    </span>
  );
}
