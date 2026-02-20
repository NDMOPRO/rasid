import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GuideStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface GuideOverlayProps {
  steps: GuideStep[];
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const GUIDE_SESSION_KEY = "rasid_guide_session";

interface GuideSession {
  stepIndex: number;
  totalSteps: number;
  timestamp: number;
}

function saveGuideSession(stepIndex: number, totalSteps: number) {
  try {
    const session: GuideSession = { stepIndex, totalSteps, timestamp: Date.now() };
    localStorage.setItem(GUIDE_SESSION_KEY, JSON.stringify(session));
  } catch { /* localStorage unavailable */ }
}

function loadGuideSession(): GuideSession | null {
  try {
    const raw = localStorage.getItem(GUIDE_SESSION_KEY);
    if (!raw) return null;
    const session: GuideSession = JSON.parse(raw);
    // Expire after 30 minutes
    if (Date.now() - session.timestamp > 30 * 60 * 1000) {
      localStorage.removeItem(GUIDE_SESSION_KEY);
      return null;
    }
    return session;
  } catch { return null; }
}

function clearGuideSession() {
  try { localStorage.removeItem(GUIDE_SESSION_KEY); } catch { /* ignore */ }
}

export default function GuideOverlay({ steps, open, onClose, onComplete }: GuideOverlayProps) {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = loadGuideSession();
    return saved && saved.stepIndex < steps.length ? saved.stepIndex : 0;
  });
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Persist current step to localStorage (UI-15)
  useEffect(() => {
    if (open) {
      saveGuideSession(currentStep, steps.length);
    }
  }, [currentStep, open, steps.length]);

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
    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);
    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [updateSpotlight]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      clearGuideSession();
      onComplete?.();
      onClose();
      setCurrentStep(0);
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleClose = () => {
    // Keep session in localStorage so it can be restored on reload (UI-15)
    onClose();
  };

  if (!open || !steps.length) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
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
              className="absolute border-2 border-primary rounded-lg shadow-[0_0_20px_rgba(61,177,172,0.4)]"
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
            className="absolute z-[10000] bg-card border border-border rounded-xl shadow-2xl p-5 max-w-sm w-80"
            style={{ ...getTooltipPosition(), pointerEvents: "auto" }}
            dir="rtl"
          >
            <button onClick={handleClose} className="absolute top-2 left-2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-sm">{step.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{step.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button size="sm" variant="outline" onClick={prev} className="h-7 text-xs px-3">
                    <ChevronRight className="h-3 w-3 ml-1" />
                    السابق
                  </Button>
                )}
                <Button size="sm" onClick={next} className="h-7 text-xs px-3">
                  {isLast ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 ml-1" />
                      إنهاء
                    </>
                  ) : (
                    <>
                      التالي
                      <ChevronLeft className="h-3 w-3 mr-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1 mt-3">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentStep ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
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
