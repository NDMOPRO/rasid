/**
 * CinematicMode — Global presentation/cinematic overlay for any page
 * Features:
 * - Fullscreen mode
 * - Auto-scroll with configurable timer (5s, 10s, 15s, 30s)
 * - Arrow navigation (up/down scroll)
 * - Font size control (zoom in/out)
 * - Cinematic dark overlay with premium styling
 * - Keyboard shortcuts: Esc=exit, Space=toggle auto, ↑↓=scroll, +/-=font size, F=fullscreen
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  X,
  Timer,
  Monitor,
  Type,
} from "lucide-react";

const RASID_LOGO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/DnIAzRZfiCrhzgYz.svg";

const TIMER_OPTIONS = [
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
  { label: "15s", value: 15000 },
  { label: "30s", value: 30000 },
];

const FONT_SIZES = [
  { label: "صغير", value: 0.85, labelEn: "S" },
  { label: "عادي", value: 1, labelEn: "M" },
  { label: "كبير", value: 1.15, labelEn: "L" },
  { label: "أكبر", value: 1.3, labelEn: "XL" },
  { label: "ضخم", value: 1.5, labelEn: "2XL" },
];

interface CinematicModeProps {
  isOpen: boolean;
  onClose: () => void;
  /** The page content to display in cinematic mode */
  children: React.ReactNode;
  /** Page title for the header */
  pageTitle?: string;
}

export default function CinematicMode({ isOpen, onClose, children, pageTitle }: CinematicModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [timerValue, setTimerValue] = useState(10000);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(1); // default "عادي"
  const [showControls, setShowControls] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const hideControlsRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await overlayRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Auto-scroll logic (timer-based)
  useEffect(() => {
    if (isAutoPlay && contentRef.current) {
      autoScrollRef.current = setInterval(() => {
        if (contentRef.current) {
          contentRef.current.scrollBy({ top: 200, behavior: "smooth" });
        }
      }, timerValue);
    }
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [isAutoPlay, timerValue]);

  // Auto-scroll on new content (MutationObserver)
  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    });
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [isOpen]);

  // Scroll up/down
  const scrollUp = useCallback(() => {
    contentRef.current?.scrollBy({ top: -300, behavior: "smooth" });
  }, []);

  const scrollDown = useCallback(() => {
    contentRef.current?.scrollBy({ top: 300, behavior: "smooth" });
  }, []);

  // Font size
  const increaseFontSize = useCallback(() => {
    setFontSizeIndex((prev) => Math.min(prev + 1, FONT_SIZES.length - 1));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSizeIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case " ":
          e.preventDefault();
          setIsAutoPlay((prev) => !prev);
          break;
        case "ArrowUp":
          e.preventDefault();
          scrollUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          scrollDown();
          break;
        case "+":
        case "=":
          increaseFontSize();
          break;
        case "-":
          decreaseFontSize();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, scrollUp, scrollDown, increaseFontSize, decreaseFontSize, toggleFullscreen]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!isOpen) return;
    const resetTimer = () => {
      setShowControls(true);
      if (hideControlsRef.current) clearTimeout(hideControlsRef.current);
      hideControlsRef.current = setTimeout(() => setShowControls(false), 4000);
    };
    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      if (hideControlsRef.current) clearTimeout(hideControlsRef.current);
    };
  }, [isOpen]);

  // Exit fullscreen on close
  useEffect(() => {
    if (!isOpen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentFontSize = FONT_SIZES[fontSizeIndex];

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-[#030712] flex flex-col"
        dir="rtl"
      >
        {/* Aurora background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(61,177,172,0.15) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        {/* Header */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-20 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/80 to-transparent"
            >
              <div className="flex items-center gap-3">
                <img src={RASID_LOGO} alt="راصد" className="h-7 object-contain" style={{ filter: "drop-shadow(0 1px 4px rgba(61,177,172,0.3))" }} />
                {pageTitle && (
                  <span className="text-sm font-semibold text-teal-300/80">{pageTitle}</span>
                )}
                <span className="text-[10px] text-slate-500 border border-slate-700/50 rounded px-2 py-0.5">
                  الوضع السينمائي
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700/50 rounded-lg px-3 py-1.5 border border-slate-700/40"
              >
                <X className="w-3.5 h-3.5" />
                خروج
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto relative z-10 px-4 lg:px-8 py-6"
          style={{ fontSize: `${currentFontSize.value}rem` }}
        >
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>

        {/* Bottom Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-20 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-t from-black/80 to-transparent"
            >
              {/* Font Size Controls */}
              <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl px-2 py-1.5 border border-slate-700/40">
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSizeIndex === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                  title="تصغير الخط"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-teal-400 font-mono min-w-[28px] text-center">
                  {currentFontSize.labelEn}
                </span>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSizeIndex === FONT_SIZES.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                  title="تكبير الخط"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Scroll Controls */}
              <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl px-2 py-1.5 border border-slate-700/40">
                <button
                  onClick={scrollUp}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                  title="تمرير لأعلى"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollDown}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                  title="تمرير لأسفل"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Auto-play + Timer */}
              <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl px-2 py-1.5 border border-slate-700/40 relative">
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isAutoPlay
                      ? "bg-teal-500/20 text-teal-400"
                      : "hover:bg-slate-700/50 text-slate-400 hover:text-white"
                  }`}
                  title={isAutoPlay ? "إيقاف التشغيل التلقائي" : "تشغيل تلقائي"}
                >
                  {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowTimerPicker(!showTimerPicker)}
                    className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    title="تحديد الوقت"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono">{timerValue / 1000}s</span>
                  </button>
                  {showTimerPicker && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700/50 rounded-xl p-2 flex gap-1 shadow-2xl">
                      {TIMER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setTimerValue(opt.value);
                            setShowTimerPicker(false);
                          }}
                          className={`text-[10px] px-3 py-1.5 rounded-lg transition-colors ${
                            timerValue === opt.value
                              ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                title={isFullscreen ? "خروج من الشاشة الكاملة" : "شاشة كاملة"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard shortcuts hint */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="flex items-center gap-3 text-[9px] text-slate-600">
                <span><kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[8px] border border-slate-700/30">Esc</kbd> خروج</span>
                <span><kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[8px] border border-slate-700/30">Space</kbd> تشغيل/إيقاف</span>
                <span><kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[8px] border border-slate-700/30">↑↓</kbd> تمرير</span>
                <span><kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[8px] border border-slate-700/30">+/-</kbd> حجم الخط</span>
                <span><kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[8px] border border-slate-700/30">F</kbd> شاشة كاملة</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

/** Cinematic mode trigger button — place in DashboardLayout header */
export function CinematicButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border transition-all duration-200
        border-slate-700/40 text-slate-400 hover:text-teal-300 hover:border-teal-500/30 hover:bg-teal-500/5
        dark:border-slate-700/40 dark:text-slate-400 dark:hover:text-teal-300 dark:hover:border-teal-500/30 dark:hover:bg-teal-500/5"
      title="الوضع السينمائي"
    >
      <Monitor className="w-3.5 h-3.5" />
      <span>سينمائي</span>
    </button>
  );
}
