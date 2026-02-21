import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Lightbulb, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * GuideOverlay — الدليل الحي (UI-14, UI-15, DB-05, DB-06, DB-07)
 * Enhanced with: session persistence, route-based navigation,
 * action type indicators, and highlight styles
 */

export interface GuideStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  route?: string; // Route to navigate to for this step
  actionType?: "click" | "type" | "select" | "scroll" | "wait" | "observe";
  highlightType?: "border" | "overlay" | "pulse" | "arrow";
}

interface GuideOverlayProps {
  steps: GuideStep[];
  open: boolean;
  guideId?: number | string;
  guideName?: string;
  onClose: () => void;
  onComplete?: () => void;
  initialStep?: number;
}

const SESSION_STORAGE_KEY = "rasid_guide_session";

/** Recover guide session from storage (UI-15) */
export function getStoredGuideSession(): { guideId: string; currentStep: number } | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    // Expire after 30 minutes
    if (Date.now() - data.timestamp > 30 * 60 * 1000) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return { guideId: data.guideId, currentStep: data.currentStep };
  } catch {
    return null;
  }
}

const ACTION_LABELS: Record<string, string> = {
  click: "اضغط على العنصر المُبرز",
  type: "اكتب في الحقل المُبرز",
  select: "اختر من القائمة المُبرزة",
  scroll: "مرر للأسفل",
  wait: "انتظر لحظة...",
  observe: "لاحظ العنصر المُبرز",
};

export default function GuideOverlay({ steps, open, guideId, guideName, onClose, onComplete, initialStep = 0 }: GuideOverlayProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Save session to storage for recovery (UI-15)
  useEffect(() => {
    if (open && guideId) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        guideId: String(guideId),
        currentStep,
        timestamp: Date.now(),
      }));
    }
  }, [open, guideId, currentStep]);

  const updateSpotlight = useCallback(() => {
    if (!open || !steps[currentStep]) return;
    const el = document.querySelector(steps[currentStep].target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setSpotlightRect(null);
    }
  }, [currentStep, open, steps]);

  useEffect(() => {
    // Navigate to step's route if specified
    if (open && step?.route) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes(step.route)) {
        setLocation(step.route);
        // Wait for navigation and DOM update
        setTimeout(updateSpotlight, 800);
        return;
      }
    }

    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    // Watch for DOM changes to re-highlight
    const observer = new MutationObserver(() => {
      setTimeout(updateSpotlight, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
      observer.disconnect();
    };
  }, [updateSpotlight, open, step, setLocation]);

  const next = () => {
    if (isLast) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      onComplete?.();
      onClose();
      setCurrentStep(0);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleClose = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentStep(0);
    onClose();
  };

  if (!open || !steps.length) return null;

  const padding = 8;

  const getTooltipPosition = (): React.CSSProperties => {
    if (!spotlightRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const pos = step.position || "bottom";
    switch (pos) {
      case "top":
        return { bottom: window.innerHeight - spotlightRect.top + padding + 12, left: spotlightRect.left + spotlightRect.width / 2, transform: "translateX(-50%)" };
      case "bottom":
        return { top: spotlightRect.bottom + padding + 12, left: spotlightRect.left + spotlightRect.width / 2, transform: "translateX(-50%)" };
      case "left":
        return { top: spotlightRect.top + spotlightRect.height / 2, right: window.innerWidth - spotlightRect.left + padding + 12, transform: "translateY(-50%)" };
      case "right":
        return { top: spotlightRect.top + spotlightRect.height / 2, left: spotlightRect.right + padding + 12, transform: "translateY(-50%)" };
      default:
        return { top: spotlightRect.bottom + padding + 12, left: spotlightRect.left + spotlightRect.width / 2, transform: "translateX(-50%)" };
    }
  };

  // Get highlight border color based on type
  const getHighlightClass = () => {
    const type = step?.highlightType || "border";
    switch (type) {
      case "pulse": return "border-2 border-[#C5A55A] rounded-lg shadow-[0_0_20px_rgba(197,165,90,0.4)] animate-pulse";
      case "overlay": return "border-2 border-[#C5A55A] rounded-lg bg-[#C5A55A]/10 shadow-[0_0_20px_rgba(197,165,90,0.3)]";
      case "arrow": return "border-2 border-dashed border-[#3DB1AC] rounded-lg shadow-[0_0_15px_rgba(61,177,172,0.3)]";
      default: return "border-2 border-[#C5A55A] rounded-lg shadow-[0_0_20px_rgba(197,165,90,0.4)]";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: "auto" }}
        >
          {/* Overlay with spotlight cutout */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
            <defs>
              <mask id="guide-spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {spotlightRect && (
                  <rect
                    x={spotlightRect.left - padding}
                    y={spotlightRect.top - padding}
                    width={spotlightRect.width + padding * 2}
                    height={spotlightRect.height + padding * 2}
                    rx="8"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0" y="0" width="100%" height="100%"
              fill="rgba(0,0,0,0.6)"
              mask="url(#guide-spotlight-mask)"
              style={{ pointerEvents: "auto" }}
              onClick={handleClose}
            />
          </svg>

          {/* Spotlight border glow */}
          {spotlightRect && (
            <motion.div
              layoutId="guide-spotlight"
              className={cn("absolute", getHighlightClass())}
              style={{
                top: spotlightRect.top - padding,
                left: spotlightRect.left - padding,
                width: spotlightRect.width + padding * 2,
                height: spotlightRect.height + padding * 2,
                pointerEvents: "none",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[10000] rounded-2xl shadow-2xl p-5 max-w-sm w-80"
            style={{
              ...getTooltipPosition(),
              pointerEvents: "auto",
              background: "linear-gradient(135deg, rgba(15, 40, 71, 0.98), rgba(11, 29, 53, 0.99))",
              border: "1px solid rgba(197, 165, 90, 0.25)",
              backdropFilter: "blur(20px)",
            }}
            dir="rtl"
          >
            <button onClick={handleClose} className="absolute top-2 left-2 text-[#D4DDEF]/40 hover:text-[#D4DDEF] transition-colors">
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(197, 165, 90, 0.15)" }}>
                <MapPin className="h-4 w-4 text-[#C5A55A]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#D4DDEF]">{step.title}</h3>
                {guideName && <p className="text-[10px] text-[#D4DDEF]/40">{guideName}</p>}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #C5A55A, #3DB1AC)" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <p className="text-xs text-[#D4DDEF]/70 leading-relaxed mb-3">{step.description}</p>

            {/* Action type indicator */}
            {step.actionType && step.actionType !== "observe" && (
              <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg" style={{ background: "rgba(61, 177, 172, 0.1)" }}>
                <div className="h-1.5 w-1.5 rounded-full bg-[#3DB1AC] animate-pulse" />
                <span className="text-[10px] text-[#3DB1AC]">{ACTION_LABELS[step.actionType] || ""}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#D4DDEF]/40">
                {currentStep + 1} / {steps.length}
              </span>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prev}
                    className="h-7 px-3 rounded-lg text-xs font-medium text-[#D4DDEF]/60 hover:bg-white/5 transition-colors flex items-center gap-1"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <ChevronRight className="h-3 w-3" />
                    السابق
                  </button>
                )}
                <button
                  onClick={next}
                  className="h-7 px-3 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1"
                  style={{ background: isLast ? "linear-gradient(135deg, #3DB1AC, #2dd4bf)" : "linear-gradient(135deg, #C5A55A, #b8963f)" }}
                >
                  {isLast ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      إنهاء
                    </>
                  ) : (
                    <>
                      التالي
                      <ChevronLeft className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1 mt-3">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentStep ? "w-4 bg-[#C5A55A]" : i < currentStep ? "w-1.5 bg-[#3DB1AC]" : "w-1.5 bg-white/10"
                  )}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
