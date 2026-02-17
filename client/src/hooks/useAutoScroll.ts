/**
 * useAutoScroll — Global hook that auto-scrolls a container when new content appears at the bottom.
 * Uses MutationObserver to detect DOM changes (new children, text changes, attribute changes).
 * Respects user scroll position: if user scrolled up manually, auto-scroll pauses.
 * Resumes auto-scroll when user scrolls back near the bottom.
 * 
 * IMPORTANT: Delayed activation prevents interference with page-load animations (framer-motion).
 * The observer only activates after a configurable delay (default 3s) to let initial animations settle.
 */
import { useEffect, useRef, useCallback } from "react";

interface UseAutoScrollOptions {
  /** Enable/disable auto-scroll (default: true) */
  enabled?: boolean;
  /** Threshold in pixels from bottom to consider "near bottom" (default: 150) */
  threshold?: number;
  /** Scroll behavior (default: "smooth") */
  behavior?: ScrollBehavior;
  /** Delay in ms before activating MutationObserver (default: 3000) — prevents animation interference */
  activationDelay?: number;
}

export function useAutoScroll<T extends HTMLElement>(
  options: UseAutoScrollOptions = {}
) {
  const { enabled = true, threshold = 150, behavior = "smooth", activationDelay = 3000 } = options;
  const containerRef = useRef<T>(null);
  const isNearBottomRef = useRef(false); // Start as false — don't auto-scroll on initial load
  const lastScrollTopRef = useRef(0);
  const isActivatedRef = useRef(false); // Tracks whether the observer is "armed"
  const userHasScrolledRef = useRef(false); // Only activate after user actually scrolls down

  // Check if user is near the bottom of the container
  const checkNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return false;
    const { scrollTop, scrollHeight, clientHeight } = el;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, [threshold]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, [behavior]);

  // Force scroll to bottom (ignores user position)
  const forceScrollToBottom = useCallback(() => {
    isNearBottomRef.current = true;
    isActivatedRef.current = true;
    scrollToBottom();
  }, [scrollToBottom]);

  // Delayed activation — prevents auto-scroll during initial page animations
  useEffect(() => {
    if (!enabled) return;
    isActivatedRef.current = false;
    isNearBottomRef.current = false;
    userHasScrolledRef.current = false;

    const timer = setTimeout(() => {
      isActivatedRef.current = true;
    }, activationDelay);

    return () => clearTimeout(timer);
  }, [enabled, activationDelay]);

  // Track user scroll position
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const handleScroll = () => {
      const currentTop = el.scrollTop;
      
      // Mark that user has interacted with scroll
      if (currentTop > 50) {
        userHasScrolledRef.current = true;
      }

      // If user scrolled UP manually, pause auto-scroll
      if (currentTop < lastScrollTopRef.current - 10) {
        isNearBottomRef.current = checkNearBottom();
      } else {
        // Scrolling down or programmatic scroll
        isNearBottomRef.current = checkNearBottom();
      }
      lastScrollTopRef.current = currentTop;
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [enabled, checkNearBottom]);

  // MutationObserver to detect new content — only active after delay
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const observer = new MutationObserver(() => {
      // Only auto-scroll if:
      // 1. Observer is activated (past the delay)
      // 2. User was near bottom
      if (isActivatedRef.current && isNearBottomRef.current) {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    });

    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [enabled, scrollToBottom]);

  // Also listen for custom events (rasid-typewriter-tick, etc.)
  // These events ALWAYS trigger scroll regardless of activation delay
  useEffect(() => {
    if (!enabled) return;

    const handleTick = () => {
      // Custom events (AI typing, scan results) always force activation
      isActivatedRef.current = true;
      isNearBottomRef.current = true;
      requestAnimationFrame(() => scrollToBottom());
    };

    window.addEventListener("rasid-typewriter-tick", handleTick);
    window.addEventListener("rasid-auto-scroll", handleTick);
    return () => {
      window.removeEventListener("rasid-typewriter-tick", handleTick);
      window.removeEventListener("rasid-auto-scroll", handleTick);
    };
  }, [enabled, scrollToBottom]);

  return { containerRef, scrollToBottom, forceScrollToBottom };
}

/**
 * Dispatch a custom event to trigger auto-scroll from any component.
 * Call this whenever new content is added dynamically.
 */
export function triggerAutoScroll() {
  window.dispatchEvent(new Event("rasid-auto-scroll"));
}
