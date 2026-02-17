
interface NotificationBadgeProps {
  count: number;
  level?: 'info' | 'warning' | 'critical';
  className?: string;
}

const levelStyles = {
  info: {
    bg: 'bg-[#4A7AB5]',
    pulse: 'rgba(74, 122, 181, 0.4)',
  },
  warning: {
    bg: 'bg-amber-500',
    pulse: 'rgba(245, 158, 11, 0.4)',
  },
  critical: {
    bg: 'bg-[#EB3D63]',
    pulse: 'rgba(235, 61, 99, 0.4)',
  },
};

export function NotificationBadge({
  count,
  level = 'info',
  className = '',
}: NotificationBadgeProps) {
  const styles = levelStyles[level];

  return (
    <>
      {count > 0 && (
        <div
          className={`relative ${className}`}
        >
          <span
            className={`
              inline-flex items-center justify-center
              min-w-[18px] h-[18px] px-1
              text-[10px] font-bold text-white
              rounded-full ${styles.bg}
              ${level === 'critical' ? 'animate-notification-pulse' : ''}
            `}
          >
            {count > 99 ? '99+' : count}
          </span>
          {level === 'critical' && (
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: styles.pulse, opacity: 0.3 }}
            />
          )}
        </div>
      )}
    </>
  );
}
