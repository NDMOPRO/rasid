import { useCallback } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  separator?: boolean;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
  separator = true,
}: AnimatedCounterProps) {
  const formatNumber = useCallback(
    (num: number) => {
      const fixed = num.toFixed(decimals);
      if (!separator) return fixed;
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    },
    [decimals, separator]
  );

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{formatNumber(value)}{suffix}
    </span>
  );
}

export default AnimatedCounter;
