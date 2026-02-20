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
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0B1D35 0%, #0F2847 40%, #132F5A 70%, #0B1D35 100%)",
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 4 + 1,
                  height: Math.random() * 4 + 1,
                  background: i % 3 === 0
                    ? "rgba(197, 165, 90, 0.4)"
                    : i % 3 === 1
                    ? "rgba(61, 177, 172, 0.3)"
                    : "rgba(100, 89, 167, 0.3)",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Radial glow behind character */}
          <motion.div
            className="absolute"
            style={{
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(197,165,90,0.15) 0%, rgba(61,177,172,0.08) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Character with bounce animation */}
          <motion.div
            className="relative z-10 mb-6"
            initial={{ y: 40, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 }}
          >
            <motion.img
              src={CHARACTER_WAVING}
              alt="راصد"
              className="h-44 w-auto drop-shadow-2xl select-none"
              draggable={false}
              animate={{
                y: [0, -8, 0],
                rotate: [0, 1, -1, 0],
              }}
              transition={{
                duration: 3,
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
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
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
                backgroundSize: "200% 100%",
                animation: "shimmer-gold 2s linear infinite",
                boxShadow: "0 0 12px rgba(197, 165, 90, 0.4)",
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
