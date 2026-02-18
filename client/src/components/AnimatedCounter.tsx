/**
 * AnimatedCounter — PDPL Ultra Premium
 * Counts from 0 to target value when element enters viewport
 * Rule #3: No number without counter
 */
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  formatLarge?: boolean;
}

export default function AnimatedCounter({
  value,
  duration = 1500,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  formatLarge = true,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(eased * value);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  useEffect(() => {
    if (hasAnimated.current) {
      setCount(value);
    }
  }, [value]);

  const formatNumber = (n: number): string => {
    if (formatLarge && n >= 1_000_000) {
      return (n / 1_000_000).toFixed(1) + "M";
    }
    if (formatLarge && n >= 1_000) {
      return n >= 10_000
        ? Math.round(n).toLocaleString("en-US")
        : (n / 1_000).toFixed(1) + "K";
    }
    return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString("en-US");
  };

  const formatted = formatNumber(count);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
