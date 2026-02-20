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
