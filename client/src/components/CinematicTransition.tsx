/**
 * CinematicTransition — Smooth cinematic page transitions with multiple effects.
 * Wraps page content and animates entry/exit using CSS transitions.
 */
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

type TransitionType = "fade" | "slide-up" | "slide-right" | "zoom" | "blur" | "cinematic";

interface CinematicTransitionProps {
  children: React.ReactNode;
  /** Unique key to trigger transition on change (e.g., route path) */
  transitionKey: string;
  type?: TransitionType;
  duration?: number; // ms
  className?: string;
}

export function CinematicTransition({
  children,
  transitionKey,
  type = "cinematic",
  duration = 400,
  className,
}: CinematicTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(transitionKey);
  const [displayChildren, setDisplayChildren] = useState(children);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (transitionKey !== currentKey) {
      // Exit animation
      setIsVisible(false);
      timeoutRef.current = setTimeout(() => {
        setDisplayChildren(children);
        setCurrentKey(transitionKey);
        // Enter animation
        requestAnimationFrame(() => setIsVisible(true));
      }, duration / 2);
    } else {
      setDisplayChildren(children);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [transitionKey, children, currentKey, duration]);

  // Initial mount animation
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const transitionStyles: Record<TransitionType, { hidden: string; visible: string }> = {
    fade: {
      hidden: "opacity-0",
      visible: "opacity-100",
    },
    "slide-up": {
      hidden: "opacity-0 translate-y-8",
      visible: "opacity-100 translate-y-0",
    },
    "slide-right": {
      hidden: "opacity-0 -translate-x-8",
      visible: "opacity-100 translate-x-0",
    },
    zoom: {
      hidden: "opacity-0 scale-95",
      visible: "opacity-100 scale-100",
    },
    blur: {
      hidden: "opacity-0 blur-sm scale-[0.98]",
      visible: "opacity-100 blur-0 scale-100",
    },
    cinematic: {
      hidden: "opacity-0 scale-[0.97] translate-y-2 blur-[2px]",
      visible: "opacity-100 scale-100 translate-y-0 blur-0",
    },
  };

  const styles = transitionStyles[type];

  return (
    <div
      className={cn(
        "transition-all ease-out",
        isVisible ? styles.visible : styles.hidden,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {displayChildren}
    </div>
  );
}

export default CinematicTransition;
