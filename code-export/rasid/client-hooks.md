# rasid - client-hooks

> Auto-extracted source code documentation

---

## `client/src/hooks/index.ts`

```typescript
/**
 * Rasid Smart Hooks — Central export for all custom hooks.
 */

export { useSpeechRecognition } from "./useSpeechRecognition";
export { useProactiveAssistance } from "./useProactiveAssistance";
export { usePageContext } from "./usePageContext";
export { usePWA } from "./usePWA";

```

---

## `client/src/hooks/useAutoScroll.ts`

```typescript
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

```

---

## `client/src/hooks/useComposition.ts`

```typescript
import { useRef } from "react";
import { usePersistFn } from "./usePersistFn";

export interface UseCompositionReturn<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  onCompositionStart: React.CompositionEventHandler<T>;
  onCompositionEnd: React.CompositionEventHandler<T>;
  onKeyDown: React.KeyboardEventHandler<T>;
  isComposing: () => boolean;
}

export interface UseCompositionOptions<
  T extends HTMLInputElement | HTMLTextAreaElement,
> {
  onKeyDown?: React.KeyboardEventHandler<T>;
  onCompositionStart?: React.CompositionEventHandler<T>;
  onCompositionEnd?: React.CompositionEventHandler<T>;
}

type TimerResponse = ReturnType<typeof setTimeout>;

export function useComposition<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
>(options: UseCompositionOptions<T> = {}): UseCompositionReturn<T> {
  const {
    onKeyDown: originalOnKeyDown,
    onCompositionStart: originalOnCompositionStart,
    onCompositionEnd: originalOnCompositionEnd,
  } = options;

  const c = useRef(false);
  const timer = useRef<TimerResponse | null>(null);
  const timer2 = useRef<TimerResponse | null>(null);

  const onCompositionStart = usePersistFn((e: React.CompositionEvent<T>) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (timer2.current) {
      clearTimeout(timer2.current);
      timer2.current = null;
    }
    c.current = true;
    originalOnCompositionStart?.(e);
  });

  const onCompositionEnd = usePersistFn((e: React.CompositionEvent<T>) => {
    // 使用两层 setTimeout 来处理 Safari 浏览器中 compositionEnd 先于 onKeyDown 触发的问题
    timer.current = setTimeout(() => {
      timer2.current = setTimeout(() => {
        c.current = false;
      });
    });
    originalOnCompositionEnd?.(e);
  });

  const onKeyDown = usePersistFn((e: React.KeyboardEvent<T>) => {
    // 在 composition 状态下，阻止 ESC 和 Enter（非 shift+Enter）事件的冒泡
    if (
      c.current &&
      (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey))
    ) {
      e.stopPropagation();
      return;
    }
    originalOnKeyDown?.(e);
  });

  const isComposing = usePersistFn(() => {
    return c.current;
  });

  return {
    onCompositionStart,
    onCompositionEnd,
    onKeyDown,
    isComposing,
  };
}

```

---

## `client/src/hooks/useCustomPages.ts`

```typescript
import { useState, useCallback, useEffect } from "react";
import { trpc } from "../lib/trpc";

export type PageType = "dashboard" | "table" | "report";
export type WorkspaceId = "leaks" | "privacy";

export interface CustomPage {
  id: number;
  userId: number;
  workspace: string;
  pageType: string;
  title: string;
  icon: string;
  sortOrder: number;
  config: any;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
}

export function useCustomPages(workspace: WorkspaceId) {
  const utils = trpc.useUtils();

  // Fetch pages for this workspace
  const pagesQuery = trpc.customPages.list.useQuery(
    { workspace },
    { 
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  );

  const createMutation = trpc.customPages.create.useMutation({
    onSuccess: () => {
      utils.customPages.list.invalidate();
    },
  });

  const updateMutation = trpc.customPages.update.useMutation({
    onSuccess: () => {
      utils.customPages.list.invalidate();
    },
  });

  const deleteMutation = trpc.customPages.delete.useMutation({
    onSuccess: () => {
      utils.customPages.list.invalidate();
    },
  });

  const pages = (pagesQuery.data || []) as CustomPage[];
  const isLoading = pagesQuery.isLoading;

  const createPage = useCallback(
    async (pageType: PageType, title: string, config?: any) => {
      const maxSort = pages.reduce((max, p) => Math.max(max, p.sortOrder), 0);
      const result = await createMutation.mutateAsync({
        workspace,
        pageType,
        title,
        icon: pageType === "dashboard" ? "LayoutDashboard" : pageType === "table" ? "Table2" : "FileText",
        sortOrder: maxSort + 1,
        config: config || {},
      });
      return result;
    },
    [workspace, pages, createMutation]
  );

  const updatePage = useCallback(
    async (id: number, data: { title?: string; icon?: string; sortOrder?: number; config?: any }) => {
      return updateMutation.mutateAsync({ id, ...data });
    },
    [updateMutation]
  );

  const deletePage = useCallback(
    async (id: number) => {
      return deleteMutation.mutateAsync({ id });
    },
    [deleteMutation]
  );

  return {
    pages,
    isLoading,
    createPage,
    updatePage,
    deletePage,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch: () => utils.customPages.list.invalidate(),
  };
}

```

---

## `client/src/hooks/useMobile.tsx`

```tsx
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

```

---

## `client/src/hooks/useNdmoAuth.ts`

```typescript
import { useAuth } from "@/_core/hooks/useAuth";
import { isAdminUser, isRootAdmin as checkRootAdmin } from "@/lib/permissions";

/** Root Admin userIds — all 4 system admins have full root privileges */
const ROOT_ADMIN_USER_IDS = ["mruhaily", "aalrebdi", "msarhan", "malmoutaz"];

export type NdmoRole = "executive" | "manager" | "analyst" | "viewer";

export function useNdmoAuth() {
  const auth = useAuth();

  const ndmoRole: NdmoRole = (auth.user as any)?.ndmoRole ?? "viewer";

  // Root Admin check — all 4 system admins have root privileges
  // context.ts sets username = pUser.userId.toUpperCase(), so we check both username and userId fields
  const platformUserId = (auth.user as any)?.username ?? (auth.user as any)?.userId ?? "";
  const isRootAdmin = ROOT_ADMIN_USER_IDS.includes(String(platformUserId).toLowerCase()) 
    || auth.user?.role === "root_admin" 
    || auth.user?.role === "admin"
    || auth.user?.role === "superadmin"
    || (auth.user as any)?.rasidRole === "root_admin"
    || (auth.user as any)?.platformRole === "root_admin"
    || checkRootAdmin(auth.user);

  // If root admin, grant admin status regardless of DB role
  const isAdmin = isRootAdmin || isAdminUser(auth.user);

  // Permission checks — root admins get everything
  const canManageLeaks = isAdmin || ndmoRole === "executive" || ndmoRole === "manager" || ndmoRole === "analyst";
  const canExport = isAdmin || ndmoRole === "executive" || ndmoRole === "manager";
  const canManageUsers = isAdmin || ndmoRole === "executive";
  const canCreateReports = isAdmin || ndmoRole === "executive" || ndmoRole === "manager";
  const canViewDashboard = true; // Everyone can view
  const canClassifyPii = isAdmin || ndmoRole === "executive" || ndmoRole === "manager" || ndmoRole === "analyst";

  // AI Control pages — all root admins
  const canManageAI = isRootAdmin;

  return {
    ...auth,
    ndmoRole,
    isAdmin,
    isRootAdmin,
    canManageLeaks,
    canExport,
    canManageUsers,
    canCreateReports,
    canViewDashboard,
    canClassifyPii,
    canManageAI,
  };
}

```

---

## `client/src/hooks/usePWA.ts`

```typescript
/**
 * usePWA — Hook for Progressive Web App features.
 * Handles service worker registration, install prompt, and update notifications.
 */
import { useState, useEffect, useCallback } from "react";

interface PWAState {
  /** Whether the app can be installed */
  canInstall: boolean;
  /** Whether the app is running as a standalone PWA */
  isStandalone: boolean;
  /** Whether a service worker update is available */
  updateAvailable: boolean;
  /** Whether the service worker is registered */
  isRegistered: boolean;
  /** Trigger the install prompt */
  install: () => Promise<boolean>;
  /** Apply the pending update */
  applyUpdate: () => void;
}

export function usePWA(): PWAState {
  const [canInstall, setCanInstall] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true);

  // Register service worker
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        setIsRegistered(true);

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                setWaitingWorker(newWorker);
              }
            });
          }
        });

        // Check for existing waiting worker
        if (registration.waiting) {
          setUpdateAvailable(true);
          setWaitingWorker(registration.waiting);
        }
      })
      .catch((err) => {
        console.warn("[PWA] Service worker registration failed:", err);
      });

    // Listen for controller change (after update)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    return result.outcome === "accepted";
  }, [deferredPrompt]);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
  }, [waitingWorker]);

  return {
    canInstall,
    isStandalone,
    updateAvailable,
    isRegistered,
    install,
    applyUpdate,
  };
}

export default usePWA;

```

---

## `client/src/hooks/usePageContext.ts`

```typescript
import { useMemo } from "react";
import { useLocation } from "wouter";

export interface PageContext {
  path: string;
  title: string;
  section: string;
  description: string;
}

const pageMap: Record<string, { title: string; section: string; description: string }> = {
  "/": { title: "لوحة المعلومات", section: "رئيسية", description: "عرض ملخص شامل لحالات الرصد والإحصائيات" },
  "/leaks": { title: "حالات الرصد", section: "تنفيذي", description: "عرض وإدارة حالات الرصد المكتشفة" },
  "/sites": { title: "المواقع المراقبة", section: "تنفيذي", description: "إدارة المواقع الخاضعة للمراقبة" },
  "/reports": { title: "التقارير", section: "تنفيذي", description: "عرض وإنشاء التقارير" },
  "/scan": { title: "الفحص", section: "تنفيذي", description: "إدارة عمليات الفحص" },
  "/cases": { title: "القضايا", section: "تنفيذي", description: "إدارة القضايا والمتابعات" },
  "/members": { title: "الأعضاء", section: "إداري", description: "إدارة أعضاء الفريق" },
  "/settings": { title: "الإعدادات", section: "إداري", description: "إعدادات النظام" },
  "/smart-rasid": { title: "راصد الذكي", section: "ذكاء اصطناعي", description: "المساعد الذكي للمنصة" },
  "/dark-web": { title: "مراقبة الويب المظلم", section: "متقدم", description: "مراقبة التهديدات في الويب المظلم" },
  "/threat-map": { title: "خريطة التهديدات", section: "متقدم", description: "عرض جغرافي للتهديدات" },
  "/advanced-analytics": { title: "التحليلات المتقدمة", section: "تحليلات", description: "تحليلات وإحصائيات متقدمة" },
  "/knowledge-base": { title: "قاعدة المعرفة", section: "موارد", description: "مقالات وسياسات ومعلومات مرجعية" },
  "/evidence-chain": { title: "سلسلة الأدلة", section: "متقدم", description: "توثيق الأدلة الرقمية" },
  "/activity-logs": { title: "سجل النشاط", section: "إداري", description: "سجل نشاطات المستخدمين" },
  "/system-health": { title: "صحة النظام", section: "إداري", description: "مراقبة صحة وأداء النظام" },
  "/training-center": { title: "مركز التدريب", section: "ذكاء اصطناعي", description: "تدريب وتحسين المساعد الذكي" },
  "/bulk-analysis": { title: "التحليل الجماعي", section: "ذكاء اصطناعي", description: "تحليل دفعات كبيرة من البيانات" },
};

export function usePageContext(): PageContext {
  const [location] = useLocation();

  return useMemo(() => {
    const basePath = "/" + (location.split("/")[1] || "");
    const info = pageMap[basePath] || pageMap[location] || {
      title: "صفحة غير معروفة",
      section: "عام",
      description: "",
    };
    return { path: location, ...info };
  }, [location]);
}

```

---

## `client/src/hooks/usePermission.ts`

```typescript

```

---

## `client/src/hooks/usePersistFn.ts`

```typescript
import { useRef } from "react";

type noop = (...args: any[]) => any;

/**
 * usePersistFn instead of useCallback to reduce cognitive load
 */
export function usePersistFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  const persistFn = useRef<T>(null);
  if (!persistFn.current) {
    persistFn.current = function (this: unknown, ...args) {
      return fnRef.current!.apply(this, args);
    } as T;
  }

  return persistFn.current!;
}

```

---

## `client/src/hooks/useProactiveAssistance.ts`

```typescript
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useProactiveAssistance — الدعم الاستباقي (UI-16, UI-17)
 * يراقب خمول المستخدم ويقترح مساعدة ذكية بناءً على سياق الصفحة
 * الخمول: 60 ثانية بدون أي تفاعل (حركة فأرة، لوحة مفاتيح، نقر، لمس)
 */

export interface ProactiveSuggestion {
  message: string;
  type: "tip" | "suggestion" | "warning";
  action?: string;
  route?: string;
  prompt?: string;
}

interface UseProactiveAssistanceOptions {
  idleTimeoutMs?: number;
  enabled?: boolean;
  currentPage?: string;
}

const pageSuggestions: Record<string, ProactiveSuggestion[]> = {
  "/": [
    { message: "هل تريد ملخصاً سريعاً لأحدث حالات الرصد؟", type: "suggestion", action: "ملخص لوحة المعلومات", prompt: "أعطني ملخص لوحة المعلومات" },
    { message: "يمكنني مساعدتك في تحليل الاتجاهات الأخيرة", type: "suggestion", action: "تحليل الاتجاهات", prompt: "حلل اتجاهات حالات الرصد" },
  ],
  "/overview": [
    { message: "هل تريد تحليل اتجاهات حالات الرصد لهذا الشهر؟", type: "suggestion", action: "تحليل", prompt: "حلل اتجاهات حالات الرصد لهذا الشهر" },
    { message: "يمكنك تصدير ملخص تنفيذي بضغطة واحدة", type: "tip", action: "تصدير", route: "/reports" },
  ],
  "/leaks": [
    { message: "هناك حالات رصد بحاجة لمراجعة. هل تريد رؤيتها؟", type: "suggestion", action: "عرض", prompt: "أعطني حالات الرصد الجديدة" },
    { message: "يمكنني تصنيف حالات الرصد تلقائياً حسب القطاع", type: "tip", action: "تصنيف", prompt: "صنف حالات الرصد حسب القطاع" },
    { message: "هل تحتاج مساعدة في تصفية حالات الرصد؟", type: "suggestion", action: "تصفية حالات الرصد", prompt: "أعطني حالات الرصد واسعة النطاق" },
    { message: "يمكنني تحليل الارتباطات بين حالات الرصد", type: "suggestion", action: "تحليل الارتباطات", prompt: "حلل الارتباطات بين حالات الرصد" },
  ],
  "/incidents": [
    { message: "هناك حالات رصد بحاجة لمراجعة", type: "suggestion", action: "عرض", prompt: "أعطني حالات الرصد الجديدة" },
  ],
  "/privacy": [
    { message: "هل تريد تقريراً عن نسب الامتثال حسب القطاع؟", type: "suggestion", action: "تقرير", prompt: "قارن امتثال القطاعات" },
    { message: "يمكنك فحص أي موقع للتأكد من وجود سياسة خصوصية", type: "tip", action: "فحص", route: "/sites" },
  ],
  "/sites": [
    { message: "هل تريد فحص موقع جديد؟", type: "suggestion", action: "بدء فحص جديد", prompt: "ابدأ فحص جديد" },
    { message: "يمكنني عرض إحصائيات الامتثال للمواقع", type: "suggestion", action: "إحصائيات الامتثال", prompt: "أعرض إحصائيات الامتثال" },
  ],
  "/reports": [
    { message: "هل تحتاج تقريراً تنفيذياً شاملاً؟", type: "suggestion", action: "إنشاء", prompt: "أنشئ تقرير تنفيذي" },
  ],
  "/dark-web": [
    { message: "هل تريد رؤية آخر عروض الدارك ويب المتعلقة بالسعودية؟", type: "suggestion", action: "عرض", prompt: "ما آخر عروض الدارك ويب؟" },
  ],
  "/advanced-analytics": [
    { message: "يمكنني إنشاء لوحة مؤشرات مخصصة لك", type: "tip", action: "إنشاء", prompt: "أنشئ لوحة مؤشرات تنفيذية" },
  ],
  "/smart-rasid": [
    { message: "جرب سؤالي عن أحدث حالات الرصد أو طلب تحليل شامل", type: "tip", action: "ملخص شامل", prompt: "أعطني ملخص شامل" },
  ],
  "/training-center": [
    { message: "يمكنك إضافة وثائق تدريب لتحسين أداء راصد الذكي", type: "tip", action: "إضافة وثيقة" },
  ],
  "/cases": [
    { message: "هل تريد ملخصاً لحالة القضايا المفتوحة؟", type: "suggestion", action: "ملخص", prompt: "كم قضية مفتوحة؟" },
  ],
};

const defaultSuggestions: ProactiveSuggestion[] = [
  { message: "هل تحتاج مساعدة؟ يمكنني إرشادك لأي ميزة في المنصة", type: "tip", action: "دليل استخدام المنصة", prompt: "ما الذي يمكنك فعله؟" },
  { message: "اضغط على أيقونة راصد الذكي للحصول على مساعدة فورية", type: "tip" },
];

export function useProactiveAssistance({
  idleTimeoutMs = 60000,
  enabled = true,
  currentPage = "/",
}: UseProactiveAssistanceOptions = {}) {
  const [suggestion, setSuggestion] = useState<ProactiveSuggestion | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const shownRef = useRef<Set<string>>(new Set());

  // Reset on page change
  useEffect(() => {
    setSuggestion(null);
    setDismissed(false);
  }, [currentPage]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSuggestion(null);

    if (!enabled || dismissed) return;

    timerRef.current = setTimeout(() => {
      const basePath = "/" + (currentPage.split("/")[1] || "");
      const suggestions = pageSuggestions[basePath] || pageSuggestions[currentPage] || defaultSuggestions;
      // Filter out already shown suggestions
      const available = suggestions.filter(s => !shownRef.current.has(s.message));
      if (available.length === 0) return;

      const chosen = available[Math.floor(Math.random() * available.length)];
      shownRef.current.add(chosen.message);
      setSuggestion(chosen);
    }, idleTimeoutMs);
  }, [enabled, currentPage, idleTimeoutMs, dismissed]);

  useEffect(() => {
    if (!enabled) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handler = () => {
      if (dismissed) return;
      resetTimer();
    };

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, resetTimer, dismissed]);

  const dismiss = useCallback(() => {
    setSuggestion(null);
    setDismissed(true);
  }, []);

  const accept = useCallback(() => {
    const current = suggestion;
    setSuggestion(null);
    return current;
  }, [suggestion]);

  return { suggestion, dismiss, accept };
}

```

---

## `client/src/hooks/useSoundEffects.ts`

```typescript
/**
 * useSoundEffects — Ultra Premium sound feedback hook
 * Provides subtle audio feedback for interactions
 */
import { useCallback, useRef } from "react";

const audioCtxRef = { current: null as AudioContext | null };

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  } catch {
    return null;
  }
}

function playTone(freq: number, duration: number, volume: number = 0.03, type: OscillatorType = "sine") {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silently fail
  }
}

export function useSoundEffects() {
  const enabled = useRef(true);

  const playClick = useCallback(() => {
    if (!enabled.current) return;
    playTone(800, 0.08, 0.02, "sine");
  }, []);

  const playHover = useCallback(() => {
    if (!enabled.current) return;
    playTone(600, 0.05, 0.01, "sine");
  }, []);

  const playSuccess = useCallback(() => {
    if (!enabled.current) return;
    playTone(523, 0.1, 0.02, "sine");
    setTimeout(() => playTone(659, 0.1, 0.02, "sine"), 100);
    setTimeout(() => playTone(784, 0.15, 0.02, "sine"), 200);
  }, []);

  const playError = useCallback(() => {
    if (!enabled.current) return;
    playTone(300, 0.15, 0.02, "sawtooth");
    setTimeout(() => playTone(250, 0.2, 0.02, "sawtooth"), 150);
  }, []);

  const playNotification = useCallback(() => {
    if (!enabled.current) return;
    playTone(880, 0.08, 0.02, "sine");
    setTimeout(() => playTone(1100, 0.12, 0.02, "sine"), 100);
  }, []);

  const toggle = useCallback(() => {
    enabled.current = !enabled.current;
  }, []);

  return {
    playClick,
    playHover,
    playSuccess,
    playError,
    playNotification,
    toggle,
    isEnabled: enabled.current,
  };
}

```

---

## `client/src/hooks/useSpeechRecognition.ts`

```typescript
import { useState, useRef, useCallback, useEffect } from "react";

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}

export function useSpeechRecognition({
  lang = "ar-SA",
  continuous = false,
  interimResults = true,
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const SpeechRecognition =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognition;

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      onError?.("المتصفح لا يدعم التعرف على الصوت");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      setTranscript(text);

      if (finalTranscript) {
        onResult?.(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      const errorMessages: Record<string, string> = {
        "no-speech": "لم يتم اكتشاف كلام",
        "audio-capture": "لا يمكن الوصول إلى الميكروفون",
        "not-allowed": "تم رفض إذن الميكروفون",
        "network": "خطأ في الشبكة",
      };
      onError?.(errorMessages[event.error] || `خطأ: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [SpeechRecognition, lang, continuous, interimResults, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}

```

---

## `client/src/hooks/useWebSocket.ts`

```typescript
/**
 * useWebSocket — React hook for real-time WebSocket notifications
 * Connects to the socket.io server and provides notification events
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface WsNotification {
  id?: number;
  type: string;
  title: string;
  titleAr: string;
  message?: string;
  messageAr?: string;
  severity: string;
  relatedId?: string;
  createdAt?: string;
}

export interface WsJobUpdate {
  jobId: string;
  status: string;
  lastResult?: string;
  leaksFound?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  lastNotification: WsNotification | null;
  lastJobUpdate: WsJobUpdate | null;
  notifications: WsNotification[];
  clearNotifications: () => void;
}

export function useWebSocket(userId?: number): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<WsNotification | null>(null);
  const [lastJobUpdate, setLastJobUpdate] = useState<WsJobUpdate | null>(null);
  const [notifications, setNotifications] = useState<WsNotification[]>([]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io({
      path: "/api/ws",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("[WS] Connected");

      // Join user room if authenticated
      if (userId) {
        socket.emit("join", userId);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("[WS] Disconnected");
    });

    socket.on("notification", (notif: WsNotification) => {
      setLastNotification(notif);
      setNotifications((prev) => [notif, ...prev].slice(0, 100));
    });

    socket.on("job_update", (update: WsJobUpdate) => {
      setLastJobUpdate(update);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return {
    isConnected,
    lastNotification,
    lastJobUpdate,
    notifications,
    clearNotifications,
  };
}

```

---

