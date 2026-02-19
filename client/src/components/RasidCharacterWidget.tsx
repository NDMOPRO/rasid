import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Bot, X, Sparkles, MessageCircle, Zap, ChevronLeft, Send, Shield } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   RasidCharacterWidget — ويدجت راصد الذكي العائم الإبهاري
   يظهر في كل الصفحات مع تأثيرات حركية متقدمة + حقل إدخال
   ═══════════════════════════════════════════════════════════════ */

const CHARACTERS = {
  waving: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/LourdpawbeFjzxpF.png",
  standing: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/XCKlnhEgEcNWsLEB.png",
  sunglasses: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/glsbsWKPuWnmCuiU.png",
  shmagh: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/cPbwcXQQKHCHhPDD.png",
  crossed: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/MNRoXtmiCwlpGuQF.png",
};

type CharacterState = "standing" | "waving" | "sunglasses" | "shmagh" | "crossed";

const greetings = [
  "مرحباً! أنا راصد 👋",
  "كيف أقدر أساعدك؟",
  "هل تحتاج تحليل بيانات؟",
  "اضغط للتحدث معي!",
  "راصد الذكي جاهز لخدمتك",
];

const tips: Record<string, string> = {
  "/overview": "💡 يمكنك تصفية البيانات حسب الفترة الزمنية",
  "/incidents": "💡 اضغط على أي حالة لعرض التفاصيل الكاملة",
  "/privacy": "💡 تابع مؤشرات الامتثال لنظام حماية البيانات",
  "/reports": "💡 يمكنك تصدير التقارير بصيغة PDF",
  "/smart-rasid": "💡 اسألني أي سؤال عن بياناتك!",
};

const quickPrompts = [
  { text: "أعطني ملخص حالات الرصد", icon: "📊" },
  { text: "كم نسبة الامتثال؟", icon: "🛡️" },
  { text: "آخر التنبيهات", icon: "🔔" },
];

export default function RasidCharacterWidget() {
  const [location, setLocation] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [currentChar, setCurrentChar] = useState<CharacterState>("standing");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bubbleTimer = useRef<NodeJS.Timeout | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax effect on character based on mouse
  const rotateX = useTransform(mouseY, [0, window.innerHeight], [2, -2]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-2, 2]);

  // Show contextual tip based on current page
  useEffect(() => {
    const matchedTip = Object.entries(tips).find(([path]) => location.includes(path));
    if (matchedTip && !hasInteracted) {
      const timer = setTimeout(() => {
        setBubbleText(matchedTip[1]);
        setShowBubble(true);
        bubbleTimer.current = setTimeout(() => setShowBubble(false), 5000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location, hasInteracted]);

  // Periodic greeting animation
  useEffect(() => {
    if (hasInteracted) return;
    const interval = setInterval(() => {
      setPulseCount((p) => p + 1);
      if (pulseCount > 0 && pulseCount % 5 === 0) {
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        setBubbleText(randomGreeting);
        setShowBubble(true);
        setCurrentChar("waving");
        setTimeout(() => {
          setShowBubble(false);
          setCurrentChar("standing");
        }, 4000);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [hasInteracted, pulseCount]);

  // Track mouse for parallax
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isExpanded]);

  const handleClick = useCallback(() => {
    setHasInteracted(true);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setShowBubble(false);
    setIsExpanded(!isExpanded);
    setCurrentChar(isExpanded ? "standing" : "sunglasses");
  }, [isExpanded]);

  const goToSmartRasid = (initialMessage?: string) => {
    setIsExpanded(false);
    if (initialMessage) {
      // Store the message to be picked up by SmartRasid page
      sessionStorage.setItem("rasid_widget_message", initialMessage);
    }
    setLocation("/smart-rasid");
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    goToSmartRasid(trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]" dir="rtl">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute bottom-full mb-3 right-0 min-w-[180px] max-w-[240px]"
          >
            <div
              className="relative px-4 py-3 rounded-2xl text-sm font-medium shadow-xl"
              style={{
                background: "linear-gradient(135deg, rgba(15, 40, 71, 0.95), rgba(11, 29, 53, 0.98))",
                border: "1px solid rgba(197, 165, 90, 0.25)",
                color: "#D4DDEF",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(197,165,90,0.1)",
              }}
            >
              {bubbleText}
              <div
                className="absolute -bottom-2 right-6 w-4 h-4 rotate-45"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 40, 71, 0.95), rgba(11, 29, 53, 0.98))",
                  borderRight: "1px solid rgba(197, 165, 90, 0.25)",
                  borderBottom: "1px solid rgba(197, 165, 90, 0.25)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-20 left-0 w-80 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(15, 40, 71, 0.98), rgba(11, 29, 53, 0.99))",
              border: "1px solid rgba(197, 165, 90, 0.2)",
              backdropFilter: "blur(30px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(197,165,90,0.08)",
            }}
          >
            {/* Header */}
            <div className="p-4 flex items-center gap-3 border-b border-white/5">
              <motion.img
                src={CHARACTERS.sunglasses}
                alt="راصد"
                className="h-12 w-auto"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#D4DDEF]">راصد الذكي</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-emerald-400/80">متصل ومستعد</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-[#D4DDEF]/50" />
              </button>
            </div>

            {/* Input Field */}
            <div className="px-3 pt-3">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(197, 165, 90, 0.15)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 bg-transparent text-xs text-[#D4DDEF] placeholder-[#D4DDEF]/30 outline-none"
                  dir="rtl"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{
                    background: inputValue.trim() ? "linear-gradient(135deg, #C5A55A, #b8963f)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  <Send className="h-3.5 w-3.5 text-white rotate-180" />
                </motion.button>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="px-3 pt-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goToSmartRasid(prompt.text)}
                  className="text-[10px] px-2.5 py-1.5 rounded-lg text-[#D4DDEF]/70 hover:text-[#D4DDEF] transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {prompt.icon} {prompt.text}
                </motion.button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="p-3 space-y-2">
              <motion.button
                whileHover={{ x: -4, backgroundColor: "rgba(197, 165, 90, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => goToSmartRasid()}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(197, 165, 90, 0.12)" }}>
                  <MessageCircle className="h-4 w-4 text-[#C5A55A]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#D4DDEF]">محادثة جديدة</p>
                  <p className="text-[10px] text-[#D4DDEF]/40">تحدث مع راصد الذكي</p>
                </div>
                <ChevronLeft className="h-3.5 w-3.5 text-[#D4DDEF]/30" />
              </motion.button>

              <motion.button
                whileHover={{ x: -4, backgroundColor: "rgba(61, 177, 172, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setIsExpanded(false); setLocation("/overview"); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(61, 177, 172, 0.12)" }}>
                  <Zap className="h-4 w-4 text-[#3DB1AC]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#D4DDEF]">تحليل سريع</p>
                  <p className="text-[10px] text-[#D4DDEF]/40">عرض ملخص المؤشرات</p>
                </div>
                <ChevronLeft className="h-3.5 w-3.5 text-[#D4DDEF]/30" />
              </motion.button>

              <motion.button
                whileHover={{ x: -4, backgroundColor: "rgba(139, 92, 246, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setIsExpanded(false); setLocation("/privacy"); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(139, 92, 246, 0.12)" }}>
                  <Shield className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#D4DDEF]">الخصوصية والامتثال</p>
                  <p className="text-[10px] text-[#D4DDEF]/40">لوحة مؤشرات PDPL</p>
                </div>
                <ChevronLeft className="h-3.5 w-3.5 text-[#D4DDEF]/30" />
              </motion.button>

              <motion.button
                whileHover={{ x: -4, backgroundColor: "rgba(100, 89, 167, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setIsExpanded(false); setLocation("/reports"); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(100, 89, 167, 0.12)" }}>
                  <Sparkles className="h-4 w-4 text-[#6459A7]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#D4DDEF]">التقارير الذكية</p>
                  <p className="text-[10px] text-[#D4DDEF]/40">إنشاء تقرير تلقائي</p>
                </div>
                <ChevronLeft className="h-3.5 w-3.5 text-[#D4DDEF]/30" />
              </motion.button>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/5">
              <p className="text-[9px] text-center text-[#D4DDEF]/25">
                راصد الذكي — مدعوم بالذكاء الاصطناعي
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button with Character */}
      <motion.button
        onClick={handleClick}
        onHoverStart={() => { setIsHovered(true); setCurrentChar("waving"); }}
        onHoverEnd={() => { setIsHovered(false); if (!isExpanded) setCurrentChar("standing"); }}
        className="relative h-16 w-16 rounded-full flex items-center justify-center cursor-pointer outline-none"
        style={{
          background: "linear-gradient(135deg, #0F2847, #132F5A)",
          border: "2px solid rgba(197, 165, 90, 0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(197,165,90,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
          rotateX,
          rotateY,
          perspective: 800,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isExpanded ? { rotate: 0 } : {}}
      >
        {/* Orbiting ring */}
        <motion.div
          className="absolute inset-[-4px] rounded-full pointer-events-none"
          style={{
            border: "1px solid rgba(197, 165, 90, 0.15)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Pulse rings */}
        {!isExpanded && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "1px solid rgba(197, 165, 90, 0.2)" }}
              animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "1px solid rgba(61, 177, 172, 0.15)" }}
              animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
          </>
        )}

        {/* Character image */}
        <motion.img
          src={CHARACTERS[currentChar]}
          alt="راصد"
          className="h-11 w-auto object-contain select-none relative z-10"
          draggable={false}
          animate={
            isHovered
              ? { y: [0, -3, 0], scale: 1.05 }
              : { y: [0, -2, 0] }
          }
          transition={{
            duration: isHovered ? 0.6 : 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            filter: "drop-shadow(0 2px 8px rgba(197, 165, 90, 0.3))",
          }}
        />

        {/* Sparkle particles around FAB */}
        {isHovered && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: i % 2 === 0 ? "#C5A55A" : "#3DB1AC",
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                }}
                animate={{
                  x: Math.cos((i * 72 * Math.PI) / 180) * 35,
                  y: Math.sin((i * 72 * Math.PI) / 180) * 35,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}

        {/* Online indicator */}
        <motion.div
          className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, #3DB1AC, #2dd4bf)",
            border: "2px solid #0F2847",
            boxShadow: "0 0 8px rgba(61, 177, 172, 0.5)",
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
}
