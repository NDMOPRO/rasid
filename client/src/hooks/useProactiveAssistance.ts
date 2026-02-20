import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useProactiveAssistance — الدعم الاستباقي (UI-16, UI-17)
 * يراقب خمول المستخدم ويقترح مساعدة ذكية بناءً على سياق الصفحة
 * الخمول: 60 ثانية بدون أي تفاعل (حركة فأرة، لوحة مفاتيح، نقر، لمس)
 */

export interface ProactiveSuggestion {
  message: string;
  type: "tip" | "suggestion" | "warning";
  action?: string;
  route?: string;
  prompt?: string;
}

interface UseProactiveAssistanceOptions {
  idleTimeoutMs?: number;
  enabled?: boolean;
  currentPage?: string;
}

const pageSuggestions: Record<string, ProactiveSuggestion[]> = {
  "/": [
    { message: "هل تريد ملخصاً سريعاً لأحدث حالات الرصد؟", type: "suggestion", action: "ملخص لوحة المعلومات", prompt: "أعطني ملخص لوحة المعلومات" },
    { message: "يمكنني مساعدتك في تحليل الاتجاهات الأخيرة", type: "suggestion", action: "تحليل الاتجاهات", prompt: "حلل اتجاهات حالات الرصد" },
  ],
  "/overview": [
    { message: "هل تريد تحليل اتجاهات حالات الرصد لهذا الشهر؟", type: "suggestion", action: "تحليل", prompt: "حلل اتجاهات حالات الرصد لهذا الشهر" },
    { message: "يمكنك تصدير ملخص تنفيذي بضغطة واحدة", type: "tip", action: "تصدير", route: "/reports" },
  ],
  "/leaks": [
    { message: "هناك حالات رصد بحاجة لمراجعة. هل تريد رؤيتها؟", type: "suggestion", action: "عرض", prompt: "أعطني حالات الرصد الجديدة" },
    { message: "يمكنني تصنيف حالات الرصد تلقائياً حسب القطاع", type: "tip", action: "تصنيف", prompt: "صنف حالات الرصد حسب القطاع" },
    { message: "هل تحتاج مساعدة في تصفية حالات الرصد؟", type: "suggestion", action: "تصفية حالات الرصد", prompt: "أعطني حالات الرصد واسعة النطاق" },
    { message: "يمكنني تحليل الارتباطات بين حالات الرصد", type: "suggestion", action: "تحليل الارتباطات", prompt: "حلل الارتباطات بين حالات الرصد" },
  ],
  "/incidents": [
    { message: "هناك حالات رصد بحاجة لمراجعة", type: "suggestion", action: "عرض", prompt: "أعطني حالات الرصد الجديدة" },
  ],
  "/privacy": [
    { message: "هل تريد تقريراً عن نسب الامتثال حسب القطاع؟", type: "suggestion", action: "تقرير", prompt: "قارن امتثال القطاعات" },
    { message: "يمكنك فحص أي موقع للتأكد من وجود سياسة خصوصية", type: "tip", action: "فحص", route: "/sites" },
  ],
  "/sites": [
    { message: "هل تريد فحص موقع جديد؟", type: "suggestion", action: "بدء فحص جديد", prompt: "ابدأ فحص جديد" },
    { message: "يمكنني عرض إحصائيات الامتثال للمواقع", type: "suggestion", action: "إحصائيات الامتثال", prompt: "أعرض إحصائيات الامتثال" },
  ],
  "/reports": [
    { message: "هل تحتاج تقريراً تنفيذياً شاملاً؟", type: "suggestion", action: "إنشاء", prompt: "أنشئ تقرير تنفيذي" },
  ],
  "/dark-web": [
    { message: "هل تريد رؤية آخر عروض الدارك ويب المتعلقة بالسعودية؟", type: "suggestion", action: "عرض", prompt: "ما آخر عروض الدارك ويب؟" },
  ],
  "/advanced-analytics": [
    { message: "يمكنني إنشاء لوحة مؤشرات مخصصة لك", type: "tip", action: "إنشاء", prompt: "أنشئ لوحة مؤشرات تنفيذية" },
  ],
  "/smart-rasid": [
    { message: "جرب سؤالي عن أحدث حالات الرصد أو طلب تحليل شامل", type: "tip", action: "ملخص شامل", prompt: "أعطني ملخص شامل" },
  ],
  "/training-center": [
    { message: "يمكنك إضافة وثائق تدريب لتحسين أداء راصد الذكي", type: "tip", action: "إضافة وثيقة" },
  ],
  "/cases": [
    { message: "هل تريد ملخصاً لحالة القضايا المفتوحة؟", type: "suggestion", action: "ملخص", prompt: "كم قضية مفتوحة؟" },
  ],
};

const defaultSuggestions: ProactiveSuggestion[] = [
  { message: "هل تحتاج مساعدة؟ يمكنني إرشادك لأي ميزة في المنصة", type: "tip", action: "دليل استخدام المنصة", prompt: "ما الذي يمكنك فعله؟" },
  { message: "اضغط على أيقونة راصد الذكي للحصول على مساعدة فورية", type: "tip" },
];

export function useProactiveAssistance({
  idleTimeoutMs = 60000,
  enabled = true,
  currentPage = "/",
}: UseProactiveAssistanceOptions = {}) {
  const [suggestion, setSuggestion] = useState<ProactiveSuggestion | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const shownRef = useRef<Set<string>>(new Set());

  // Reset on page change
  useEffect(() => {
    setSuggestion(null);
    setDismissed(false);
  }, [currentPage]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSuggestion(null);

    if (!enabled || dismissed) return;

    timerRef.current = setTimeout(() => {
      const basePath = "/" + (currentPage.split("/")[1] || "");
      const suggestions = pageSuggestions[basePath] || pageSuggestions[currentPage] || defaultSuggestions;
      // Filter out already shown suggestions
      const available = suggestions.filter(s => !shownRef.current.has(s.message));
      if (available.length === 0) return;

      const chosen = available[Math.floor(Math.random() * available.length)];
      shownRef.current.add(chosen.message);
      setSuggestion(chosen);
    }, idleTimeoutMs);
  }, [enabled, currentPage, idleTimeoutMs, dismissed]);

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

  const accept = useCallback(() => {
    const current = suggestion;
    setSuggestion(null);
    return current;
  }, [suggestion]);

  return { suggestion, dismiss, accept };
}
