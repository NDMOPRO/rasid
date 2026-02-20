import { useState, useEffect, useRef, useCallback } from "react";

interface ProactiveSuggestion {
  message: string;
  action?: string;
}

interface UseProactiveAssistanceOptions {
  idleTimeoutMs?: number;
  enabled?: boolean;
  currentPage?: string;
}

const pageSuggestions: Record<string, ProactiveSuggestion[]> = {
  "/": [
    { message: "هل تريد ملخصاً سريعاً لأحدث حالات الرصد؟", action: "ملخص لوحة المعلومات" },
    { message: "يمكنني مساعدتك في تحليل الاتجاهات الأخيرة", action: "تحليل الاتجاهات" },
  ],
  "/leaks": [
    { message: "هل تحتاج مساعدة في تصفية حالات الرصد؟", action: "تصفية حالات الرصد" },
    { message: "يمكنني تحليل الارتباطات بين حالات الرصد", action: "تحليل الارتباطات" },
  ],
  "/sites": [
    { message: "هل تريد فحص موقع جديد؟", action: "بدء فحص جديد" },
    { message: "يمكنني عرض إحصائيات الامتثال للمواقع", action: "إحصائيات الامتثال" },
  ],
  "/reports": [
    { message: "هل تريد إنشاء تقرير تنفيذي جديد؟", action: "إنشاء تقرير" },
  ],
  "/smart-rasid": [
    { message: "جرب سؤالي عن أحدث حالات الرصد أو طلب تحليل شامل", action: "ملخص شامل" },
  ],
};

const defaultSuggestions: ProactiveSuggestion[] = [
  { message: "هل تحتاج مساعدة؟ يمكنني إرشادك لأي ميزة في المنصة", action: "دليل استخدام المنصة" },
  { message: "اضغط Ctrl+K للوصول السريع لأي صفحة", action: undefined },
];

export function useProactiveAssistance({
  idleTimeoutMs = 60000,
  enabled = true,
  currentPage = "/",
}: UseProactiveAssistanceOptions = {}) {
  const [suggestion, setSuggestion] = useState<ProactiveSuggestion | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSuggestion(null);
    setDismissed(false);

    if (!enabled) return;

    timerRef.current = setTimeout(() => {
      const suggestions = pageSuggestions[currentPage] || defaultSuggestions;
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setSuggestion(randomSuggestion);
    }, idleTimeoutMs);
  }, [enabled, currentPage, idleTimeoutMs]);

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

  return { suggestion, dismiss };
}
