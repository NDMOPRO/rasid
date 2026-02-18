import { useState, useEffect, useRef } from 'react';

export function useAnimatedNumber(target: number, duration: number = 1200) {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number>(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return current;
}
