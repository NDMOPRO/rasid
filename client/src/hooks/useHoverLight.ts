import { useRef, useCallback, useEffect } from 'react';

export function useHoverLight() {
  const ref = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current || !lightRef.current) return;
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!ref.current || !lightRef.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      lightRef.current.style.left = `${x}px`;
      lightRef.current.style.top = `${y}px`;
      lightRef.current.style.opacity = '1';
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (lightRef.current) {
      lightRef.current.style.opacity = '0';
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Desktop only
    const mq = window.matchMedia('(pointer: fine)');
    if (!mq.matches) return;

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return { ref, lightRef };
}
