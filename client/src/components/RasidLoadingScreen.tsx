import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   RasidLoadingScreen — شاشة تحميل فخمة بشخصية راصد المتحركة
   ═══════════════════════════════════════════════════════════════ */

const CHARACTER_WAVING = "/branding/characters/Character_1_waving_transparent.png";
const LOGO_GOLD = "/branding/logos/Rased_5_transparent.png";

const loadingMessages = [
  "جارٍ تجهيز لوحة التحكم...",
  "يتم تحليل البيانات...",
  "راصد يعمل من أجلك...",
  "جارٍ تحميل المؤشرات...",
  "لحظات وستكون جاهزاً...",
  "نظام الرصد الذكي جاهز...",
];

interface Props {
  show?: boolean;
  onFinish?: () => void;
  minDuration?: number;
}

export default function RasidLoadingScreen({ show = true, onFinish, minDuration = 2000 }: Props) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) return;
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(msgInterval);
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const start = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => onFinish?.(), 400);
      }
    }, 50);
    return () => clearInterval(progressInterval);
  }, [show, minDuration, onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0B1D35 0%, #0F2847 40%, #132F5A 70%, #0B1D35 100%)",
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 40 }).map((_, i) => {
              const size = Math.random() * 4 + 1;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: size,
                    height: size,
                    background: i % 4 === 0
                      ? "rgba(197, 165, 90, 0.5)"
                      : i % 4 === 1
                      ? "rgba(61, 177, 172, 0.4)"
                      : i % 4 === 2
                      ? "rgba(100, 89, 167, 0.35)"
                      : "rgba(255, 255, 255, 0.15)",
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    filter: size > 3 ? "blur(1px)" : "none",
                  }}
                  animate={{
                    y: [0, -(Math.random() * 40 + 20), 0],
                    x: [0, (Math.random() - 0.5) * 20, 0],
                    opacity: [0.1, 0.7, 0.1],
                    scale: [1, 1.3 + Math.random() * 0.5, 1],
                  }}
                  transition={{
                    duration: Math.random() * 5 + 4,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          </div>

          {/* Radial glow behind character */}
          <motion.div
            className="absolute"
            style={{
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(197,165,90,0.18) 0%, rgba(61,177,172,0.1) 35%, rgba(100,89,167,0.05) 55%, transparent 70%)",
              filter: "blur(50px)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.75, 0.4],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Character with bounce animation */}
          <motion.div
            className="relative z-10 mb-6"
            initial={{ y: 50, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 14, delay: 0.15 }}
          >
            <motion.img
              src={CHARACTER_WAVING}
              alt="راصد"
              className="h-44 w-auto drop-shadow-2xl select-none"
              draggable={false}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 1.5, -1.5, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Glow ring around character */}
            <motion.div
              className="absolute -inset-4 rounded-full pointer-events-none"
              style={{
                border: "1px solid rgba(197, 165, 90, 0.2)",
                boxShadow: "0 0 40px rgba(197, 165, 90, 0.1), inset 0 0 40px rgba(61, 177, 172, 0.05)",
              }}
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Logo */}
          <motion.img
            src={LOGO_GOLD}
            alt="راصد"
            className="h-12 w-auto mb-6 select-none"
            draggable={false}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              filter: "drop-shadow(0 0 20px rgba(197, 165, 90, 0.3))",
            }}
          />

          {/* Loading message with typewriter effect */}
          <motion.div className="relative z-10 text-center mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-sm font-medium"
                style={{ color: "rgba(212, 221, 239, 0.8)", fontFamily: "'Tajawal', sans-serif" }}
              >
                {loadingMessages[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Premium progress bar */}
          <motion.div
            className="relative z-10 w-64 h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255, 255, 255, 0.06)" }}
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #C5A55A, #3DB1AC, #6459A7, #C5A55A)",
                backgroundSize: "300% 100%",
                animation: "shimmer-gold 2.5s linear infinite",
                boxShadow: "0 0 16px rgba(197, 165, 90, 0.5), 0 0 32px rgba(61, 177, 172, 0.2)",
                transition: "width 0.1s ease-out",
              }}
            />
          </motion.div>

          {/* Percentage */}
          <motion.p
            className="relative z-10 mt-3 text-xs tabular-nums"
            style={{ color: "rgba(197, 165, 90, 0.6)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {Math.round(progress)}%
          </motion.p>

          {/* Bottom branding */}
          <motion.p
            className="absolute bottom-6 text-[10px] tracking-widest uppercase"
            style={{ color: "rgba(212, 221, 239, 0.25)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            مكتب إدارة البيانات الوطنية — NDMO
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
