import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, MapPin, CheckCircle2 } from "lucide-react";

/**
 * LiveGuideOverlay — تراكب الدليل المباشر (UI-14, UI-15)
 * يعرض خطوات الدليل الاسترشادي داخل الواجهة مع إضاءة العناصر
 */

export interface GuideStep {
  stepOrder: number;
  route: string;
  selector?: string;
  stepText: string;
  actionType: "click" | "type" | "select" | "scroll" | "wait" | "observe";
  highlightType: "border" | "overlay" | "pulse" | "arrow";
}

interface LiveGuideOverlayProps {
  isActive: boolean;
  guideTitle: string;
  steps: GuideStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
  onComplete: () => void;
}

export default function LiveGuideOverlay({
  isActive,
  guideTitle,
  steps,
  currentStep,
  onStepChange,
  onClose,
  onComplete,
}: LiveGuideOverlayProps) {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Highlight the target element
  useEffect(() => {
    if (!isActive || !step?.selector) {
      setHighlightRect(null);
      return;
    }

    const el = document.querySelector(step.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlightRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add highlight class
      el.classList.add("guide-highlight-active");
      return () => {
        el.classList.remove("guide-highlight-active");
      };
    } else {
      setHighlightRect(null);
    }
  }, [isActive, step, currentStep]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      onStepChange(currentStep + 1);
    }
  }, [currentStep, isLastStep, onComplete, onStepChange]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  }, [currentStep, onStepChange]);

  if (!isActive || !step) return null;

  return (
    <AnimatePresence>
      <div ref={overlayRef} className="fixed inset-0 z-[250] pointer-events-none">
        {/* Semi-transparent overlay with cutout for highlighted element */}
        {highlightRect && (
          <svg className="absolute inset-0 w-full h-full pointer-events-auto">
            <defs>
              <mask id="guide-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={highlightRect.x - 8}
                  y={highlightRect.y - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.5)"
              mask="url(#guide-mask)"
            />
            {/* Highlight border */}
            <rect
              x={highlightRect.x - 8}
              y={highlightRect.y - 8}
              width={highlightRect.width + 16}
              height={highlightRect.height + 16}
              rx="8"
              fill="none"
              stroke="#C5A55A"
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Step card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-lg pointer-events-auto"
          style={{
            background: "linear-gradient(135deg, rgba(15, 40, 71, 0.98), rgba(11, 29, 53, 0.99))",
            border: "1px solid rgba(197, 165, 90, 0.25)",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#C5A55A]" />
              <span className="text-xs font-medium text-[#D4DDEF]">{guideTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#D4DDEF]/50">
                {currentStep + 1} / {steps.length}
              </span>
              <button
                onClick={onClose}
                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-white/5"
              >
                <X className="h-3 w-3 text-[#D4DDEF]/40" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/5">
            <div
              className="h-full bg-gradient-to-l from-[#C5A55A] to-[#b8963f] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Step content */}
          <div className="p-5">
            <p className="text-sm text-[#D4DDEF] leading-relaxed">{step.stepText}</p>
            {step.actionType !== "observe" && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A55A]/10 text-[#C5A55A]">
                  {step.actionType === "click" ? "انقر" :
                   step.actionType === "type" ? "اكتب" :
                   step.actionType === "select" ? "اختر" :
                   step.actionType === "scroll" ? "مرر" :
                   step.actionType === "wait" ? "انتظر" : "لاحظ"}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-xs text-[#D4DDEF]/60 hover:text-[#D4DDEF] disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              السابق
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
              style={{
                background: isLastStep
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #C5A55A, #b8963f)",
                color: "white",
              }}
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  إنهاء
                </>
              ) : (
                <>
                  التالي
                  <ChevronLeft className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
