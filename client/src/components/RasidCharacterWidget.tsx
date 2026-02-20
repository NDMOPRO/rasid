import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Bot, X, Sparkles, MessageCircle, Zap, ChevronLeft, Send, Shield, Loader2, Maximize2, Volume2 } from "lucide-react";
import { Streamdown } from "streamdown";

/* ═══════════════════════════════════════════════════════════════
   RasidCharacterWidget — ويدجت راصد الذكي العائم الإبهاري
   يظهر في كل الصفحات مع تأثيرات حركية متقدمة + حقل إدخال
   + محادثة مصغرة مع Streaming (CHAT-01 to CHAT-07)
   ═══════════════════════════════════════════════════════════════ */

/** Streaming status indicator types (CHAT-06) */
type StreamingStatus = "idle" | "understanding" | "fetching" | "executing" | "preparing" | "streaming";

const STATUS_LABELS: Record<StreamingStatus, string> = {
  idle: "",
  understanding: "يفهم طلبك...",
  fetching: "يجلب البيانات...",
  executing: "ينفذ الأدوات...",
  preparing: "يُعد الرد...",
  streaming: "يكتب...",
};

interface MiniMessage {
  role: "user" | "assistant";
  content: string;
}

const CHARACTERS = {
  waving: "/branding/characters/Character_1_waving_transparent.png",
  standing: "/branding/characters/Character_6_standing_shmagh_transparent.png",
  sunglasses: "/branding/characters/Character_4_sunglasses_transparent.png",
  shmagh: "/branding/characters/Character_2_shmagh_transparent.png",
  crossed: "/branding/characters/Character_5_arms_crossed_shmagh_transparent.png",
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
  "/leaks": "💡 اضغط على أي حالة رصد لعرض التفاصيل والأدلة",
  "/privacy": "💡 تابع مؤشرات الامتثال لنظام حماية البيانات",
  "/sites": "💡 يمكنك فحص أي موقع لمعرفة حالة الامتثال",
  "/reports": "💡 يمكنك تصدير التقارير بصيغة PDF",
  "/dark-web": "💡 راقب التهديدات الجديدة في الدارك ويب",
  "/evidence-chain": "💡 وثّق الأدلة الرقمية لضمان سلسلة الحفظ",
  "/smart-rasid": "💡 اسألني أي سؤال عن بياناتك!",
};

// Proactive idle suggestions — domain-aware (UI-16, UI-17)
const IDLE_SUGGESTIONS: Record<string, { text: string; delay: number }[]> = {
  "/overview": [
    { text: "🔍 لاحظت أنك في لوحة المعلومات — هل تريد ملخصاً تنفيذياً سريعاً؟", delay: 45000 },
    { text: "📊 يمكنني تحليل اتجاهات حالات الرصد لك", delay: 90000 },
  ],
  "/leaks": [
    { text: "⚠️ هل تريد مساعدة في تحليل حالات الرصد الحالية؟", delay: 30000 },
    { text: "🔗 يمكنني ربط حالات الرصد المتشابهة وإيجاد الأنماط", delay: 75000 },
  ],
  "/privacy": [
    { text: "🛡️ هل تريد معرفة أي البنود تحتاج اهتماماً أكبر؟", delay: 40000 },
  ],
  "/sites": [
    { text: "🌐 يمكنني فحص أي موقع جديد لحالة الامتثال", delay: 35000 },
  ],
  "/reports": [
    { text: "📄 هل تريد إنشاء تقرير تنفيذي شامل؟", delay: 30000 },
  ],
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
  const [miniMessage, setMiniMessage] = useState("");

  // Inline chat state (CHAT-01 to CHAT-07)
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<MiniMessage[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>("idle");
  const [streamingContent, setStreamingContent] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Welcome message on first open (CHAT-04)
  const [showWelcome, setShowWelcome] = useState(true);

  /** SSE Streaming chat — token-by-token (API-03, CHAT-01, UI-04) */
  const handleMiniSend = async () => {
    if (!miniMessage.trim()) return;
    const userMsg = miniMessage.trim();

    if (chatMode) {
      setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
      setMiniMessage("");
      setShowWelcome(false);
      setIsAILoading(true);
      setStreamingStatus("understanding");
      setStreamingContent("");

      try {
        const response = await fetch("/api/rasid/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMsg,
            history: chatMessages.map(m => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok || !response.body) {
          // Fallback to tRPC if SSE endpoint unavailable (API-06)
          setStreamingStatus("fetching");
          const fallbackRes = await fetch("/api/trpc/smartRasid.chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ json: { message: userMsg, history: chatMessages.map(m => ({ role: m.role, content: m.content })) } }),
          });
          const data = await fallbackRes.json();
          const aiResp = data?.result?.data?.json?.response || data?.result?.data?.response || "عذراً، لم أتمكن من الرد.";
          setChatMessages(prev => [...prev, { role: "assistant", content: aiResp }]);
          setIsAILoading(false);
          setStreamingStatus("idle");
          return;
        }

        // Stream SSE tokens
        setStreamingStatus("streaming");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              const eventType = line.slice(7).trim();
              // Next data line
              const dataIdx = lines.indexOf(line) + 1;
              if (dataIdx < lines.length && lines[dataIdx].startsWith("data: ")) {
                try {
                  const payload = JSON.parse(lines[dataIdx].slice(6));
                  if (eventType === "token" && payload.text) {
                    accumulated += payload.text;
                    setStreamingContent(accumulated);
                  } else if (eventType === "thinking") {
                    setStreamingStatus("understanding");
                  } else if (eventType === "tool") {
                    setStreamingStatus(payload.status === "running" ? "executing" : "preparing");
                  } else if (eventType === "done") {
                    accumulated = payload.response || accumulated;
                  } else if (eventType === "error") {
                    accumulated = accumulated || "عذراً، حدث خطأ.";
                  }
                } catch {}
              }
            } else if (line.startsWith("data: ")) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (payload.text) {
                  accumulated += payload.text;
                  setStreamingContent(accumulated);
                }
              } catch {}
            }
          }
        }

        setChatMessages(prev => [...prev, { role: "assistant", content: accumulated || "عذراً، لم أتمكن من الرد." }]);
        setStreamingContent("");
      } catch (err) {
        setChatMessages(prev => [...prev, { role: "assistant", content: "عذراً، حدث خطأ. حاول مرة أخرى." }]);
      } finally {
        setIsAILoading(false);
        setStreamingStatus("idle");
        setStreamingContent("");
      }
    } else {
      setIsExpanded(false);
      setLocation(`/app/smart-rasid?q=${encodeURIComponent(userMsg)}`);
      setMiniMessage("");
    }
  };

  // Auto-scroll chat to bottom (including during streaming)
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAILoading, streamingContent]);

  const handleQuickAction = (action: string) => {
    if (chatMode) {
      setMiniMessage(action);
      // Auto-send in chat mode
      setChatMessages(prev => [...prev, { role: "user", content: action }]);
      setShowWelcome(false);
      handleMiniSend();
    } else {
      setIsExpanded(false);
      setLocation(`/app/smart-rasid?q=${encodeURIComponent(action)}`);
    }
  };

  // Toggle between menu mode and inline chat mode
  const toggleChatMode = useCallback(() => {
    setChatMode(prev => !prev);
    setShowWelcome(true);
  }, []);

  // TTS: Speak last assistant message (CHAT-07)
  const speakLastMessage = useCallback(() => {
    const lastAssistant = [...chatMessages].reverse().find(m => m.role === "assistant");
    if (lastAssistant && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(lastAssistant.content.replace(/[#*|_`]/g, ""));
      utterance.lang = "ar-SA";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }, [chatMessages]);

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

  // Proactive idle assistance (UI-16, UI-17)
  useEffect(() => {
    if (isExpanded || hasInteracted) return;
    const matchedPage = Object.entries(IDLE_SUGGESTIONS).find(([path]) => location.includes(path));
    if (!matchedPage) return;

    const timers: NodeJS.Timeout[] = [];
    matchedPage[1].forEach((suggestion, idx) => {
      const timer = setTimeout(() => {
        setBubbleText(suggestion.text);
        setShowBubble(true);
        setCurrentChar("waving");
        bubbleTimer.current = setTimeout(() => {
          setShowBubble(false);
          setCurrentChar("standing");
        }, 8000);
      }, suggestion.delay);
      timers.push(timer);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [location, isExpanded, hasInteracted]);

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
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[100]" dir="rtl">
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
            className="absolute bottom-20 left-0 w-[calc(100vw-2rem)] sm:w-80 max-w-80 rounded-2xl overflow-hidden shadow-2xl"
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
                animate={isAILoading ? { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] } : { rotate: [0, 3, -3, 0] }}
                transition={{ duration: isAILoading ? 0.8 : 2, repeat: Infinity }}
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#D4DDEF]">راصد الذكي</p>
                <div className="flex items-center gap-1.5">
                  {streamingStatus !== "idle" ? (
                    <>
                      <Loader2 className="h-2.5 w-2.5 text-[#C5A55A] animate-spin" />
                      <p className="text-[10px] text-[#C5A55A]/80">{STATUS_LABELS[streamingStatus]}</p>
                    </>
                  ) : (
                    <>
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[10px] text-emerald-400/80">متصل ومستعد</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Toggle chat/menu mode */}
                <button
                  onClick={toggleChatMode}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
                  title={chatMode ? "وضع القائمة" : "وضع المحادثة"}
                >
                  {chatMode ? <Zap className="h-3.5 w-3.5 text-[#3DB1AC]" /> : <MessageCircle className="h-3.5 w-3.5 text-[#C5A55A]" />}
                </button>
                {/* Expand to full page */}
                <button
                  onClick={() => { setIsExpanded(false); goToSmartRasid(); }}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
                  title="فتح الصفحة الكاملة"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-[#D4DDEF]/50" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-[#D4DDEF]/50" />
                </button>
              </div>
            </div>

            {chatMode ? (
              /* ═══ INLINE CHAT MODE (CHAT-01 to CHAT-07) ═══ */
              <>
                {/* Chat Messages Area */}
                <div ref={chatScrollRef} className="h-[280px] overflow-y-auto px-3 pt-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                  {/* Welcome Message (CHAT-04) */}
                  {showWelcome && chatMessages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-4"
                    >
                      <motion.img
                        src={CHARACTERS.waving}
                        alt="راصد"
                        className="h-16 w-auto mx-auto mb-2"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <p className="text-xs font-medium text-[#D4DDEF]">أهلاً! أنا راصد الذكي</p>
                      <p className="text-[10px] text-[#D4DDEF]/50 mt-1">كيف أقدر أساعدك اليوم؟</p>
                      {/* Quick prompts as suggestions */}
                      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                        {quickPrompts.map((p, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setMiniMessage(p.text);
                              // Use handleMiniSend which now supports SSE
                              setTimeout(() => {
                                const input = document.querySelector('[data-mini-chat-input]') as HTMLInputElement;
                                if (input) {
                                  input.value = p.text;
                                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                                  nativeInputValueSetter?.call(input, p.text);
                                  input.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                              }, 0);
                              setShowWelcome(false);
                              setChatMessages(prev => [...prev, { role: "user", content: p.text }]);
                              setIsAILoading(true);
                              setStreamingStatus("understanding");
                              setStreamingContent("");
                              // Use SSE streaming
                              fetch("/api/rasid/stream", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ message: p.text, history: [] }),
                              }).then(async (res) => {
                                if (!res.ok || !res.body) {
                                  // Fallback to tRPC
                                  const fallback = await fetch("/api/trpc/smartRasid.chat", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ json: { message: p.text, history: [] } }),
                                  });
                                  const data = await fallback.json();
                                  const resp = data?.result?.data?.json?.response || data?.result?.data?.response || "عذراً.";
                                  setChatMessages(prev => [...prev, { role: "assistant", content: resp }]);
                                  return;
                                }
                                const reader = res.body.getReader();
                                const decoder = new TextDecoder();
                                let buf = "", acc = "";
                                setStreamingStatus("streaming");
                                while (true) {
                                  const { done, value } = await reader.read();
                                  if (done) break;
                                  buf += decoder.decode(value, { stream: true });
                                  const lines = buf.split("\n");
                                  buf = lines.pop() || "";
                                  for (const line of lines) {
                                    if (line.startsWith("data: ")) {
                                      try {
                                        const d = JSON.parse(line.slice(6));
                                        if (d.text) { acc += d.text; setStreamingContent(acc); }
                                        if (d.response) acc = d.response;
                                      } catch {}
                                    }
                                  }
                                }
                                setChatMessages(prev => [...prev, { role: "assistant", content: acc || "عذراً." }]);
                                setStreamingContent("");
                              }).catch(() => {
                                setChatMessages(prev => [...prev, { role: "assistant", content: "عذراً، حدث خطأ." }]);
                              }).finally(() => {
                                setIsAILoading(false);
                                setStreamingStatus("idle");
                                setStreamingContent("");
                              });
                              setMiniMessage("");
                            }}
                            className="text-[10px] px-2.5 py-1.5 rounded-lg text-[#D4DDEF]/70 hover:text-[#D4DDEF]"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            {p.icon} {p.text}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Chat Messages */}
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] ${
                          msg.role === "user"
                            ? "text-white"
                            : "text-[#D4DDEF]/80"
                        }`}
                        style={{
                          background: msg.role === "user"
                            ? "linear-gradient(135deg, #C5A55A, #b8963f)"
                            : "rgba(255,255,255,0.04)",
                          border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.06)" : "none",
                        }}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-xs dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-1">
                            <Streamdown>{msg.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Streaming content — token-by-token (UI-04) */}
                  {isAILoading && streamingContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div
                        className="max-w-[85%] rounded-xl px-3 py-2 text-[11px] text-[#D4DDEF]/80"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="prose prose-xs dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-1">
                          <Streamdown>{streamingContent}</Streamdown>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Loading indicator */}
                  {isAILoading && !streamingContent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div
                        className="rounded-xl px-3 py-2 flex items-center gap-2"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <Loader2 className="h-3 w-3 text-[#C5A55A] animate-spin" />
                        <span className="text-[10px] text-[#D4DDEF]/50">{STATUS_LABELS[streamingStatus] || "يفكر..."}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {/* TTS Button (CHAT-07) */}
                    {chatMessages.some(m => m.role === "assistant") && (
                      <button
                        onClick={speakLastMessage}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors flex-shrink-0"
                        title="استمع للرد"
                      >
                        <Volume2 className="h-3.5 w-3.5 text-[#D4DDEF]/40" />
                      </button>
                    )}
                    <input
                      type="text"
                      value={miniMessage}
                      onChange={(e) => setMiniMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && miniMessage.trim()) {
                          handleMiniSend();
                        }
                      }}
                      placeholder="اكتب رسالتك هنا..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#C5A55A]/50 text-right"
                      dir="rtl"
                      disabled={isAILoading}
                    />
                    <button
                      onClick={handleMiniSend}
                      disabled={!miniMessage.trim() || isAILoading}
                      className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 flex-shrink-0"
                      style={{ background: miniMessage.trim() ? "linear-gradient(135deg, #C5A55A, #b8963f)" : "rgba(255,255,255,0.05)" }}
                    >
                      {isAILoading ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" /> : <Send className="h-3.5 w-3.5 text-white rotate-180" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ═══ MENU MODE (Original) ═══ */
              <>
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
                    onClick={toggleChatMode}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(197, 165, 90, 0.12)" }}>
                      <MessageCircle className="h-4 w-4 text-[#C5A55A]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#D4DDEF]">محادثة مصغرة</p>
                      <p className="text-[10px] text-[#D4DDEF]/40">تحدث مع راصد مباشرة هنا</p>
                    </div>
                    <ChevronLeft className="h-3.5 w-3.5 text-[#D4DDEF]/30" />
                  </motion.button>

                  <motion.button
                    whileHover={{ x: -4, backgroundColor: "rgba(61, 177, 172, 0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => goToSmartRasid()}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(61, 177, 172, 0.12)" }}>
                      <Zap className="h-4 w-4 text-[#3DB1AC]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#D4DDEF]">الصفحة الكاملة</p>
                      <p className="text-[10px] text-[#D4DDEF]/40">افتح راصد الذكي بالكامل</p>
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
                </div>
              </>
            )}

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5">
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
