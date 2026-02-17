import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'wouter';

/**
 * NProgress-style thin progress bar at the top of the page.
 * Shows during route transitions and lazy loading.
 */
export default function TopProgressBar() {
  const [location] = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevLocationRef = useRef(location);

  const startProgress = useCallback(() => {
    setIsVisible(true);
    setProgress(0);

    let current = 0;
    timerRef.current = setInterval(() => {
      current += Math.random() * 15;
      if (current > 90) {
        current = 90;
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setProgress(current);
    }, 100);
  }, []);

  const completeProgress = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(100);
    setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 400);
  }, []);

  useEffect(() => {
    if (location !== prevLocationRef.current) {
      prevLocationRef.current = location;
      startProgress();
      const completeTimer = setTimeout(completeProgress, 300);
      return () => clearTimeout(completeTimer);
    }
  }, [location, startProgress, completeProgress]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <div
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-gradient-to-r from-primary via-primary/80 to-primary/60"
          style={{ width: `${progress}%`, opacity: 1 }}
        >
          <div className="absolute end-0 top-0 h-full w-24 bg-gradient-to-l from-white/40 to-transparent rounded-full shadow-[0_0_10px_var(--primary),0_0_5px_var(--primary)]" />
        </div>
      )}
    </>
  );
}
