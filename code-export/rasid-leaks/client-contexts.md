# rasid-leaks - client-contexts

> Auto-extracted source code documentation

---

## `client/src/contexts/FilterContext.tsx`

```tsx
/**
 * FilterContext — Global filter state for breach analytics pages
 * Provides time range and sector filtering across all analytics pages
 */
import React, { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { breachRecords, type BreachRecord } from "@/lib/breachData";

interface FilterState {
  timeRange: string;       // "all" | "2024" | "2025" | "last30" | "last90" | custom
  sector: string;          // "all" | specific sector
  severity: string;        // "all" | "Critical" | "High" | "Medium" | "Low"
  platform: string;        // "all" | specific platform
}

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredRecords: BreachRecord[];
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  timeRange: "all",
  sector: "all",
  severity: "all",
  platform: "all",
};

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filteredRecords = useMemo(() => {
    let records = [...breachRecords];

    // Time range filter
    if (filters.timeRange !== "all") {
      const now = new Date();
      let cutoff: Date | null = null;

      if (filters.timeRange === "last30") {
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === "last90") {
        cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === "last180") {
        cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === "2025") {
        cutoff = new Date("2025-01-01");
        records = records.filter((r) => {
          const d = new Date(r.overview?.discovery_date || r.date || "");
          return d >= cutoff! && d < new Date("2026-01-01");
        });
        cutoff = null; // already filtered
      } else if (filters.timeRange === "2024") {
        cutoff = new Date("2024-01-01");
        records = records.filter((r) => {
          const d = new Date(r.overview?.discovery_date || r.date || "");
          return d >= cutoff! && d < new Date("2025-01-01");
        });
        cutoff = null;
      }

      if (cutoff) {
        records = records.filter((r) => {
          const d = new Date(r.overview?.discovery_date || r.date || "");
          return d >= cutoff!;
        });
      }
    }

    // Sector filter
    if (filters.sector !== "all") {
      records = records.filter((r) => r.sector === filters.sector);
    }

    // Severity filter
    if (filters.severity !== "all") {
      records = records.filter((r) => r.overview?.severity === filters.severity);
    }

    // Platform filter
    if (filters.platform !== "all") {
      records = records.filter((r) => r.overview?.source_platform === filters.platform);
    }

    return records;
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <FilterContext.Provider value={{ filters, setFilters, filteredRecords, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    // Fallback: return all records if no FilterProvider is wrapping
    return {
      filters: defaultFilters,
      setFilters: (() => {}) as React.Dispatch<React.SetStateAction<FilterState>>,
      filteredRecords: breachRecords,
      resetFilters: () => {},
    };
  }
  return ctx;
}

```

---

## `client/src/contexts/GuideContext.tsx`

```tsx
/**
 * GuideContext — نظام الدليل الاسترشادي الحي التفاعلي الشامل
 * يعمل في كل صفحات المنصة بلا استثناء
 * يتنقل بين الصفحات ويضغط ويكتب وينفذ الإعدادات ويشرح بالصوت
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { GuideStep } from "@/components/GuideOverlay";

export interface GuideDef {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  steps: GuideStep[];
}

interface GuideContextType {
  isOpen: boolean;
  currentGuide: GuideDef | null;
  startGuide: (guideId: string) => void;
  startCustomGuide: (guide: GuideDef) => void;
  stopGuide: () => void;
  getAllGuides: () => GuideDef[];
  getGuidesByCategory: (category: string) => GuideDef[];
  getCategories: () => string[];
  getGuideForRoute: (route: string) => GuideDef | undefined;
}

const GuideContext = createContext<GuideContextType | null>(null);

export function useGuide() {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error("useGuide must be used within GuideProvider");
  return ctx;
}

// ═══════════════════════════════════════════════════════════════
// كتالوج الأدلة التفاعلية الشامل — كل مهام المنصة بلا استثناء
// كل خطوة تتضمن: تنقل + إضاءة + صوت + تنفيذ تلقائي
// ═══════════════════════════════════════════════════════════════

const GUIDE_CATALOG: GuideDef[] = [

  // ════════════════════════════
  // 🏠 جولة شاملة في المنصة
  // ════════════════════════════
  {
    id: "full-tour",
    title: "جولة شاملة في المنصة",
    description: "جولة تفاعلية كاملة تتنقل بين أهم أقسام المنصة وتشرح كل شي",
    category: "البداية",
    steps: [
      { target: "[data-sidebar], nav, aside", title: "القائمة الجانبية", description: "هذه القائمة الجانبية. منها تتنقل بين كل أقسام المنصة. لاحظ الأقسام المختلفة.", position: "left", route: "/", action: "observe", voiceText: "مرحباً بك في منصة راصد! هذه القائمة الجانبية للتنقل بين كل أقسام المنصة.", delay: 3000 },
      { target: "main", title: "الصفحة الرئيسية", description: "هنا تظهر لوحة المعلومات الرئيسية مع أهم المؤشرات والإحصائيات.", position: "bottom", route: "/", action: "observe", voiceText: "الصفحة الرئيسية تعرض لوحة المعلومات مع أهم المؤشرات.", delay: 2500 },
      { target: "a[href='/leaks']", title: "حالات الرصد", description: "سأنتقل الآن لصفحة حالات الرصد لنرى الحالات المكتشفة.", position: "left", action: "click", voiceText: "الآن سننتقل لصفحة حالات الرصد.", delay: 2000 },
      { target: "main", title: "جدول الحالات", description: "هذا جدول حالات الرصد. يعرض كل الحالات المكتشفة مع التفاصيل والحالة.", position: "bottom", route: "/leaks", action: "observe", voiceText: "جدول حالات الرصد يعرض كل الحالات مع تفاصيلها.", delay: 3000 },
      { target: "a[href='/live-scan']", title: "الرصد المباشر", description: "سأنتقل للرصد المباشر حيث تبدأ عمليات المسح الفوري.", position: "left", action: "click", voiceText: "الآن ننتقل للرصد المباشر.", delay: 2000 },
      { target: "main", title: "صفحة الرصد المباشر", description: "من هنا تبدأ عمليات الرصد المباشر وترى النتائج في الوقت الفعلي.", position: "bottom", route: "/live-scan", action: "observe", voiceText: "صفحة الرصد المباشر للمسح الفوري.", delay: 2500 },
      { target: "a[href='/atlas/overview']", title: "أطلس التحليلات", description: "سأنتقل لنظام أطلس للتحليلات المتقدمة.", position: "left", action: "click", voiceText: "الآن ننتقل لنظام أطلس للتحليلات المتقدمة.", delay: 2000 },
      { target: "main", title: "لوحة أطلس", description: "نظام أطلس يقدم تحليلات متقدمة للحالة رصدات مع رسوم بيانية تفاعلية.", position: "bottom", route: "/atlas/overview", action: "observe", voiceText: "أطلس يقدم تحليلات متقدمة مع رسوم بيانية تفاعلية.", delay: 3000 },
      { target: "a[href='/smart-rasid']", title: "راصد الذكي", description: "سأنتقل لراصد الذكي — مساعدك الذكي الذي يجيب على أسئلتك.", position: "left", action: "click", voiceText: "الآن ننتقل لراصد الذكي، مساعدك الذكي.", delay: 2000 },
      { target: "textarea, .chat-input, [data-chat-input]", title: "تحدث مع راصد", description: "سأكتب لك سؤال تجريبي لتشوف كيف يعمل راصد الذكي.", position: "top", route: "/smart-rasid", action: "type", typeText: "ملخص لوحة المعلومات", voiceText: "يمكنك كتابة أي سؤال هنا وراصد سيجيبك. سأكتب لك سؤال تجريبي.", delay: 2000 },
      { target: "a[href='/settings']", title: "الإعدادات", description: "أخيراً، صفحة الإعدادات لضبط المنصة حسب احتياجاتك.", position: "left", action: "click", voiceText: "وأخيراً صفحة الإعدادات لضبط المنصة.", delay: 2000 },
      { target: "main", title: "انتهت الجولة!", description: "هذه كانت جولة سريعة في أهم أقسام المنصة. يمكنك تشغيل دليل تفصيلي لأي قسم من زر الدليل.", position: "bottom", route: "/settings", action: "observe", voiceText: "انتهت الجولة! يمكنك تشغيل دليل تفصيلي لأي قسم من زر الدليل في الأعلى.", delay: 3000 },
    ],
  },

  // ════════════════════════════
  // 🤖 راصد الذكي
  // ════════════════════════════
  {
    id: "smart-rasid",
    title: "دليل راصد الذكي الكامل",
    description: "تعلم كيف تستخدم راصد الذكي بكل إمكانياته",
    category: "راصد الذكي",
    steps: [
      { target: "a[href='/smart-rasid']", title: "فتح راصد الذكي", description: "سأفتح لك صفحة راصد الذكي.", position: "left", action: "click", voiceText: "سأفتح لك صفحة راصد الذكي.", delay: 1500 },
      { target: "textarea, .chat-input", title: "حقل المحادثة", description: "هذا حقل المحادثة. اكتب أي سؤال أو طلب وراصد سيجيبك بذكاء.", position: "top", route: "/smart-rasid", action: "focus", voiceText: "هذا حقل المحادثة. اكتب أي سؤال وراصد سيجيبك.", delay: 2000 },
      { target: "textarea, .chat-input", title: "كتابة سؤال", description: "سأكتب لك سؤال تجريبي: ملخص لوحة المعلومات", position: "top", route: "/smart-rasid", action: "type", typeText: "أعطني ملخص شامل للوحة المعلومات", voiceText: "سأكتب سؤال تجريبي لتشوف كيف يعمل.", delay: 1500 },
      { target: "button:has(.lucide-send), button[type='submit']", title: "إرسال الرسالة", description: "الآن سأضغط زر الإرسال لإرسال السؤال لراصد.", position: "top", route: "/smart-rasid", action: "click", voiceText: "الآن أضغط إرسال.", delay: 2000 },
      { target: "button:has(.lucide-mic), .lucide-mic", title: "الإدخال الصوتي", description: "يمكنك أيضاً التحدث بدل الكتابة بالضغط على المايكروفون.", position: "top", route: "/smart-rasid", action: "observe", voiceText: "يمكنك التحدث بدل الكتابة من زر المايكروفون.", delay: 2500 },
      { target: "button:has(.lucide-paperclip), .lucide-paperclip", title: "إرفاق ملفات", description: "يمكنك إرفاق ملفات CSV أو JSON أو Excel لتحليلها.", position: "top", route: "/smart-rasid", action: "observe", voiceText: "يمكنك إرفاق ملفات لتحليلها.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📊 لوحة المعلومات الرئيسية
  // ════════════════════════════
  {
    id: "dashboard",
    title: "دليل لوحة المعلومات",
    description: "تعرف على لوحة المعلومات الرئيسية وكل مكوناتها",
    category: "لوحات المؤشرات",
    steps: [
      { target: "a[href='/']", title: "فتح الرئيسية", description: "سأفتح الصفحة الرئيسية.", position: "left", action: "click", voiceText: "سأفتح الصفحة الرئيسية.", delay: 1500 },
      { target: ".glass-card:first-child, .card:first-child, .stat-card:first-child", title: "بطاقات الإحصائيات", description: "هذه البطاقات تعرض أهم المؤشرات. مرر الماوس فوقها لرؤية التفاصيل.", position: "bottom", route: "/", action: "hover", voiceText: "بطاقات الإحصائيات تعرض أهم المؤشرات.", delay: 2500 },
      { target: ".recharts-wrapper, canvas, [data-chart], svg.recharts-surface", title: "الرسوم البيانية", description: "رسوم بيانية تفاعلية تعرض تحليلات مرئية للبيانات.", position: "bottom", route: "/", action: "observe", voiceText: "الرسوم البيانية تعرض تحليلات مرئية للبيانات.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🛡️ إدارة حالات الرصد
  // ════════════════════════════
  {
    id: "leaks",
    title: "دليل إدارة حالات الرصد",
    description: "تعلم كيف تعرض وتبحث وتدير حالات الرصد",
    category: "إدارة الحالات",
    steps: [
      { target: "a[href='/leaks']", title: "فتح حالات الرصد", description: "سأفتح صفحة حالات الرصد.", position: "left", action: "click", voiceText: "سأفتح صفحة حالات الرصد.", delay: 1500 },
      { target: ".stat-card, [data-stat], .grid > div:first-child", title: "ملخص الحالات", description: "بطاقات الملخص تعرض عدد الحالات حسب الحالة والتأثير.", position: "bottom", route: "/leaks", action: "observe", voiceText: "بطاقات الملخص تعرض عدد الحالات.", delay: 2500 },
      { target: "input[placeholder*='بحث'], input[placeholder*='search'], input[type='search']", title: "البحث", description: "سأكتب في حقل البحث لتصفية الحالات.", position: "bottom", route: "/leaks", action: "type", typeText: "حالة رصد", voiceText: "يمكنك البحث عن أي حالة من هنا.", delay: 2000 },
      { target: "table, [role='table'], .leak-table", title: "جدول الحالات", description: "الجدول يعرض كل الحالات. اضغط على أي صف لرؤية التفاصيل.", position: "top", route: "/leaks", action: "observe", voiceText: "اضغط على أي حالة لرؤية تفاصيلها.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📡 الرصد المباشر
  // ════════════════════════════
  {
    id: "live-scan",
    title: "دليل الرصد المباشر",
    description: "تعلم كيف تبدأ عملية رصد مباشرة",
    category: "تشغيل الرصد",
    steps: [
      { target: "a[href='/live-scan']", title: "فتح الرصد المباشر", description: "سأفتح صفحة الرصد المباشر.", position: "left", action: "click", voiceText: "سأفتح صفحة الرصد المباشر.", delay: 1500 },
      { target: "main", title: "واجهة الرصد", description: "هذه واجهة الرصد المباشر. من هنا تبدأ عمليات المسح الفوري.", position: "bottom", route: "/live-scan", action: "observe", voiceText: "واجهة الرصد المباشر لبدء عمليات المسح.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📱 رصد تليجرام
  // ════════════════════════════
  {
    id: "telegram",
    title: "دليل رصد تليجرام",
    description: "تعلم كيف تراقب قنوات تليجرام",
    category: "تشغيل الرصد",
    steps: [
      { target: "a[href='/telegram']", title: "فتح رصد تليجرام", description: "سأفتح صفحة رصد تليجرام.", position: "left", action: "click", voiceText: "سأفتح صفحة رصد تليجرام.", delay: 1500 },
      { target: "main", title: "قنوات تليجرام", description: "هنا تدير قنوات تليجرام المراقبة وترى آخر الحالات المكتشفة.", position: "bottom", route: "/telegram", action: "observe", voiceText: "إدارة قنوات تليجرام المراقبة.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🌐 رصد الدارك ويب
  // ════════════════════════════
  {
    id: "darkweb",
    title: "دليل رصد الدارك ويب",
    description: "تعلم كيف تراقب الدارك ويب",
    category: "تشغيل الرصد",
    steps: [
      { target: "a[href='/darkweb']", title: "فتح رصد الدارك ويب", description: "سأفتح صفحة رصد الدارك ويب.", position: "left", action: "click", voiceText: "سأفتح صفحة رصد الدارك ويب.", delay: 1500 },
      { target: "main", title: "الدارك ويب", description: "هنا تراقب المنتديات المظلمة وتكتشف الحالات.", position: "bottom", route: "/darkweb", action: "observe", voiceText: "مراقبة المنتديات المظلمة واكتشاف الحالات.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🗺️ خريطة التهديدات
  // ════════════════════════════
  {
    id: "threat-map",
    title: "دليل خريطة التهديدات",
    description: "تعرف على الخريطة الجغرافية للتهديدات",
    category: "لوحات المؤشرات",
    steps: [
      { target: "a[href='/threat-map']", title: "فتح الخريطة", description: "سأفتح خريطة التهديدات.", position: "left", action: "click", voiceText: "سأفتح خريطة التهديدات الجغرافية.", delay: 1500 },
      { target: "main", title: "الخريطة التفاعلية", description: "خريطة تفاعلية تعرض مواقع التهديدات جغرافياً. استخدم التكبير والتصغير.", position: "bottom", route: "/threat-map", action: "observe", voiceText: "خريطة تفاعلية تعرض مواقع التهديدات جغرافياً.", delay: 3000 },
    ],
  },

  // ════════════════════════════
  // 🔬 أطلس التحليلات
  // ════════════════════════════
  {
    id: "atlas",
    title: "دليل أطلس التحليلات الكامل",
    description: "جولة في كل أقسام نظام أطلس",
    category: "أطلس",
    steps: [
      { target: "a[href='/atlas/overview']", title: "نظرة عامة على أطلس", description: "سأفتح نظرة عامة على أطلس.", position: "left", action: "click", voiceText: "سأفتح نظرة عامة على نظام أطلس.", delay: 1500 },
      { target: "main", title: "لوحة أطلس الرئيسية", description: "هذه اللوحة الرئيسية لأطلس مع تحليلات متقدمة.", position: "bottom", route: "/atlas/overview", action: "observe", voiceText: "اللوحة الرئيسية لأطلس مع تحليلات متقدمة.", delay: 2500 },
      { target: "a[href='/atlas/incidents']", title: "سجل حالات الرصد", description: "سأنتقل لسجل حالات رصد أطلس.", position: "left", action: "click", voiceText: "الآن ننتقل لسجل حالات الرصد.", delay: 2000 },
      { target: "main", title: "جدول حالات الرصد", description: "سجل كل حالات الرصد مع التصنيفات والتفاصيل.", position: "bottom", route: "/atlas/incidents", action: "observe", voiceText: "سجل كل حالات الرصد مع التصنيفات.", delay: 2500 },
      { target: "a[href='/atlas/pii-atlas']", title: "أطلس البيانات الشخصية", description: "سأنتقل لأطلس البيانات الشخصية.", position: "left", action: "click", voiceText: "الآن ننتقل لأطلس البيانات الشخصية.", delay: 2000 },
      { target: "main", title: "خريطة البيانات الشخصية", description: "تصنيف وتحليل البيانات الشخصية المكتشفة.", position: "bottom", route: "/atlas/pii-atlas", action: "observe", voiceText: "تصنيف وتحليل البيانات الشخصية.", delay: 2500 },
      { target: "a[href='/atlas/trends']", title: "الاتجاهات", description: "سأنتقل لتحليل الاتجاهات.", position: "left", action: "click", voiceText: "الآن ننتقل لتحليل الاتجاهات.", delay: 2000 },
      { target: "main", title: "تحليل الاتجاهات", description: "رسوم بيانية تعرض اتجاهات الحالات عبر الزمن.", position: "bottom", route: "/atlas/trends", action: "observe", voiceText: "اتجاهات الحالات عبر الزمن.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // ⚙️ الإعدادات
  // ════════════════════════════
  {
    id: "settings",
    title: "دليل الإعدادات الكامل",
    description: "تعلم كيف تضبط كل إعدادات المنصة",
    category: "الإعدادات",
    steps: [
      { target: "a[href='/settings']", title: "فتح الإعدادات", description: "سأفتح صفحة الإعدادات.", position: "left", action: "click", voiceText: "سأفتح صفحة الإعدادات.", delay: 1500 },
      { target: "main", title: "صفحة الإعدادات", description: "من هنا تضبط كل إعدادات المنصة: اللغة، المظهر، الإشعارات، والمزيد.", position: "bottom", route: "/settings", action: "observe", voiceText: "صفحة الإعدادات لضبط كل شي.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 👥 إدارة المستخدمين
  // ════════════════════════════
  {
    id: "user-management",
    title: "دليل إدارة المستخدمين",
    description: "تعلم كيف تدير المستخدمين والصلاحيات",
    category: "الإدارة",
    steps: [
      { target: "a[href='/user-management']", title: "فتح إدارة المستخدمين", description: "سأفتح صفحة إدارة المستخدمين.", position: "left", action: "click", voiceText: "سأفتح إدارة المستخدمين.", delay: 1500 },
      { target: "main", title: "قائمة المستخدمين", description: "هنا تدير المستخدمين وتضيف جدد وتحدد صلاحياتهم.", position: "bottom", route: "/user-management", action: "observe", voiceText: "إدارة المستخدمين والصلاحيات.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📋 التقارير
  // ════════════════════════════
  {
    id: "reports",
    title: "دليل إدارة التقارير",
    description: "تعلم كيف تنشئ وتدير التقارير",
    category: "التقارير والتنبيهات",
    steps: [
      { target: "a[href='/app/reports']", title: "فتح التقارير", description: "سأفتح قائمة التقارير.", position: "left", action: "click", voiceText: "سأفتح قائمة التقارير.", delay: 1500 },
      { target: "main", title: "قائمة التقارير", description: "هنا ترى كل التقارير. يمكنك إنشاء تقرير جديد أو تعديل الموجود.", position: "bottom", route: "/app/reports", action: "observe", voiceText: "قائمة التقارير مع إمكانية الإنشاء والتعديل.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🔔 قنوات التنبيه
  // ════════════════════════════
  {
    id: "alert-channels",
    title: "دليل قنوات التنبيه",
    description: "تعلم كيف تعد قنوات التنبيه",
    category: "التقارير والتنبيهات",
    steps: [
      { target: "a[href='/alert-channels']", title: "فتح قنوات التنبيه", description: "سأفتح صفحة قنوات التنبيه.", position: "left", action: "click", voiceText: "سأفتح قنوات التنبيه.", delay: 1500 },
      { target: "main", title: "إعداد القنوات", description: "أضف قنوات تنبيه: بريد إلكتروني، رسائل قصيرة، سلاك، وغيرها.", position: "bottom", route: "/alert-channels", action: "observe", voiceText: "أضف قنوات تنبيه مثل البريد والرسائل.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // ⚖️ امتثال PDPL
  // ════════════════════════════
  {
    id: "pdpl",
    title: "دليل امتثال نظام حماية البيانات",
    description: "تعرف على أدوات الامتثال لنظام PDPL",
    category: "التقارير والتنبيهات",
    steps: [
      { target: "a[href='/pdpl-compliance']", title: "فتح الامتثال", description: "سأفتح صفحة امتثال PDPL.", position: "left", action: "click", voiceText: "سأفتح صفحة الامتثال.", delay: 1500 },
      { target: "main", title: "لوحة الامتثال", description: "حالة الامتثال لنظام حماية البيانات الشخصية السعودي.", position: "bottom", route: "/pdpl-compliance", action: "observe", voiceText: "حالة الامتثال لنظام حماية البيانات.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📚 قاعدة المعرفة
  // ════════════════════════════
  {
    id: "knowledge-base",
    title: "دليل قاعدة المعرفة",
    description: "تعرف على قاعدة المعرفة والمقالات",
    category: "المعرفة والتدريب",
    steps: [
      { target: "a[href='/knowledge-base']", title: "فتح قاعدة المعرفة", description: "سأفتح قاعدة المعرفة.", position: "left", action: "click", voiceText: "سأفتح قاعدة المعرفة.", delay: 1500 },
      { target: "main", title: "المقالات والأدلة", description: "مقالات وأدلة شاملة عن المنصة وأمن المعلومات.", position: "bottom", route: "/knowledge-base", action: "observe", voiceText: "مقالات وأدلة شاملة.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🎓 مركز التدريب
  // ════════════════════════════
  {
    id: "training",
    title: "دليل مركز التدريب",
    description: "تعرف على الدورات التدريبية",
    category: "المعرفة والتدريب",
    steps: [
      { target: "a[href='/training-center']", title: "فتح مركز التدريب", description: "سأفتح مركز التدريب.", position: "left", action: "click", voiceText: "سأفتح مركز التدريب.", delay: 1500 },
      { target: "main", title: "الدورات", description: "دورات تدريبية عن استخدام المنصة وأمن المعلومات.", position: "bottom", route: "/training-center", action: "observe", voiceText: "دورات تدريبية متنوعة.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🔗 سلسلة الأدلة
  // ════════════════════════════
  {
    id: "evidence-chain",
    title: "دليل سلسلة الأدلة",
    description: "تعرف على سلسلة الأدلة الرقمية",
    category: "إدارة الحالات",
    steps: [
      { target: "a[href='/evidence-chain']", title: "فتح سلسلة الأدلة", description: "سأفتح سلسلة الأدلة.", position: "left", action: "click", voiceText: "سأفتح سلسلة الأدلة الرقمية.", delay: 1500 },
      { target: "main", title: "البلوكتشين", description: "سلسلة أدلة محمية بالبلوكتشين لضمان سلامة البيانات.", position: "bottom", route: "/evidence-chain", action: "observe", voiceText: "سلسلة أدلة محمية بالبلوكتشين.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📥 استيراد البيانات
  // ════════════════════════════
  {
    id: "breach-import",
    title: "دليل استيراد البيانات",
    description: "تعلم كيف تستورد بيانات الحالات",
    category: "إدارة الحالات",
    steps: [
      { target: "a[href='/breach-import']", title: "فتح الاستيراد", description: "سأفتح صفحة استيراد البيانات.", position: "left", action: "click", voiceText: "سأفتح صفحة استيراد البيانات.", delay: 1500 },
      { target: "main", title: "رفع الملفات", description: "ارفع ملف CSV أو JSON وربط الحقول ثم اضغط استيراد.", position: "bottom", route: "/breach-import", action: "observe", voiceText: "ارفع ملف وربط الحقول ثم استورد.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📤 تصدير البيانات
  // ════════════════════════════
  {
    id: "export-data",
    title: "دليل تصدير البيانات",
    description: "تعلم كيف تصدر البيانات",
    category: "إدارة الحالات",
    steps: [
      { target: "a[href='/export-data']", title: "فتح التصدير", description: "سأفتح صفحة تصدير البيانات.", position: "left", action: "click", voiceText: "سأفتح صفحة التصدير.", delay: 1500 },
      { target: "main", title: "خيارات التصدير", description: "اختر الصيغة: CSV, JSON, PDF, Excel واضغط تصدير.", position: "bottom", route: "/export-data", action: "observe", voiceText: "اختر صيغة التصدير واضغط تصدير.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // ⚖️ القضايا
  // ════════════════════════════
  {
    id: "cases",
    title: "دليل إدارة القضايا",
    description: "تعلم كيف تدير القضايا والمتابعات",
    category: "القضايا",
    steps: [
      { target: "a[href='/cases']", title: "فتح القضايا", description: "سأفتح صفحة القضايا.", position: "left", action: "click", voiceText: "سأفتح صفحة القضايا.", delay: 1500 },
      { target: "main", title: "قائمة القضايا", description: "إدارة القضايا المفتوحة ومتابعة حالتها.", position: "bottom", route: "/cases", action: "observe", voiceText: "إدارة القضايا ومتابعة حالتها.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📊 تحليل القطاعات
  // ════════════════════════════
  {
    id: "sector-analysis",
    title: "دليل تحليل القطاعات",
    description: "تعرف على توزيع الحالات حسب القطاعات",
    category: "لوحات المؤشرات",
    steps: [
      { target: "a[href='/sector-analysis']", title: "فتح تحليل القطاعات", description: "سأفتح تحليل القطاعات.", position: "left", action: "click", voiceText: "سأفتح تحليل القطاعات.", delay: 1500 },
      { target: "main", title: "توزيع القطاعات", description: "توزيع الحالات على القطاعات المختلفة مع نسب كل قطاع.", position: "bottom", route: "/sector-analysis", action: "observe", voiceText: "توزيع الحالات على القطاعات.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🎯 تحليل الأثر
  // ════════════════════════════
  {
    id: "impact",
    title: "دليل تحليل الأثر",
    description: "تعرف على أدوات تقييم أثر الحالات",
    category: "لوحات المؤشرات",
    steps: [
      { target: "a[href='/impact-assessment']", title: "فتح تحليل الأثر", description: "سأفتح تحليل الأثر.", position: "left", action: "click", voiceText: "سأفتح تحليل الأثر.", delay: 1500 },
      { target: "main", title: "تقييم الأثر", description: "تقييم أثر الحالات على المنظمة والأفراد.", position: "bottom", route: "/impact-assessment", action: "observe", voiceText: "تقييم أثر الحالات.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🔍 الملخص التنفيذي
  // ════════════════════════════
  {
    id: "executive-brief",
    title: "دليل الملخص التنفيذي",
    description: "تعرف على الملخص التنفيذي للقيادة",
    category: "لوحات المؤشرات",
    steps: [
      { target: "a[href='/executive-brief']", title: "فتح الملخص التنفيذي", description: "سأفتح الملخص التنفيذي.", position: "left", action: "click", voiceText: "سأفتح الملخص التنفيذي.", delay: 1500 },
      { target: "main", title: "الملخص", description: "ملخص تنفيذي شامل للقيادة مع أهم المؤشرات والتوصيات.", position: "bottom", route: "/executive-brief", action: "observe", voiceText: "ملخص تنفيذي شامل للقيادة.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🔑 مفاتيح API
  // ════════════════════════════
  {
    id: "api-keys",
    title: "دليل مفاتيح API",
    description: "تعلم كيف تدير مفاتيح الوصول البرمجي",
    category: "الإعدادات",
    steps: [
      { target: "a[href='/api-keys']", title: "فتح مفاتيح API", description: "سأفتح مفاتيح API.", position: "left", action: "click", voiceText: "سأفتح مفاتيح الوصول البرمجي.", delay: 1500 },
      { target: "main", title: "إدارة المفاتيح", description: "أنشئ وأدر مفاتيح API للوصول البرمجي.", position: "bottom", route: "/api-keys", action: "observe", voiceText: "إنشاء وإدارة مفاتيح الوصول.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📝 سجل المراجعة
  // ════════════════════════════
  {
    id: "audit-log",
    title: "دليل سجل المراجعة",
    description: "تعرف على سجل المراجعة",
    category: "الإدارة",
    steps: [
      { target: "a[href='/audit-log']", title: "فتح سجل المراجعة", description: "سأفتح سجل المراجعة.", position: "left", action: "click", voiceText: "سأفتح سجل المراجعة.", delay: 1500 },
      { target: "main", title: "سجل الأنشطة", description: "كل الأنشطة والعمليات على المنصة مسجلة هنا.", position: "bottom", route: "/audit-log", action: "observe", voiceText: "سجل كل الأنشطة والعمليات.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 👤 الملف الشخصي
  // ════════════════════════════
  {
    id: "profile",
    title: "دليل الملف الشخصي",
    description: "تعلم كيف تعدل ملفك الشخصي",
    category: "الإعدادات",
    steps: [
      { target: "a[href='/profile']", title: "فتح الملف الشخصي", description: "سأفتح الملف الشخصي.", position: "left", action: "click", voiceText: "سأفتح الملف الشخصي.", delay: 1500 },
      { target: "main", title: "بياناتك", description: "عدل بياناتك الشخصية وكلمة المرور وإعدادات الإشعارات.", position: "bottom", route: "/profile", action: "observe", voiceText: "عدل بياناتك وإعداداتك.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🤖 إدارة الذكاء الاصطناعي
  // ════════════════════════════
  {
    id: "ai-management",
    title: "دليل إدارة الذكاء الاصطناعي",
    description: "تعلم كيف تضبط إعدادات AI",
    category: "الإعدادات",
    steps: [
      { target: "a[href='/ai-management']", title: "فتح إدارة AI", description: "سأفتح إدارة الذكاء الاصطناعي.", position: "left", action: "click", voiceText: "سأفتح إدارة الذكاء الاصطناعي.", delay: 1500 },
      { target: "main", title: "إعدادات AI", description: "اضبط النموذج والشخصية والسيناريوهات.", position: "bottom", route: "/ai-management", action: "observe", voiceText: "اضبط إعدادات الذكاء الاصطناعي.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🌐 رسم المعرفة
  // ════════════════════════════
  {
    id: "knowledge-graph",
    title: "دليل رسم المعرفة",
    description: "تعرف على شبكة العلاقات",
    category: "لوحات المؤشرات",
    steps: [
      { target: "a[href='/knowledge-graph']", title: "فتح رسم المعرفة", description: "سأفتح رسم المعرفة.", position: "left", action: "click", voiceText: "سأفتح رسم المعرفة.", delay: 1500 },
      { target: "main", title: "شبكة العلاقات", description: "رسم بياني تفاعلي يعرض العلاقات بين الكيانات.", position: "bottom", route: "/knowledge-graph", action: "observe", voiceText: "شبكة العلاقات بين الكيانات.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📊 استخبارات المصادر
  // ════════════════════════════
  {
    id: "source-intelligence",
    title: "دليل استخبارات المصادر",
    description: "تحليل مصادر الحالات",
    category: "لوحات المؤشرات",
    steps: [
      { target: "a[href='/source-intelligence']", title: "فتح استخبارات المصادر", description: "سأفتح استخبارات المصادر.", position: "left", action: "click", voiceText: "سأفتح استخبارات المصادر.", delay: 1500 },
      { target: "main", title: "تحليل المصادر", description: "تحليل مصادر الحالات وتتبع أنماط النشر.", position: "bottom", route: "/source-intelligence", action: "observe", voiceText: "تحليل مصادر الحالات.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 📅 مهام الرصد
  // ════════════════════════════
  {
    id: "monitoring-jobs",
    title: "دليل مهام الرصد",
    description: "تعلم كيف تنشئ مهام رصد مجدولة",
    category: "تشغيل الرصد",
    steps: [
      { target: "a[href='/monitoring-jobs']", title: "فتح مهام الرصد", description: "سأفتح مهام الرصد.", position: "left", action: "click", voiceText: "سأفتح مهام الرصد المجدولة.", delay: 1500 },
      { target: "main", title: "المهام المجدولة", description: "أنشئ مهام رصد تعمل تلقائياً حسب الجدول.", position: "bottom", route: "/monitoring-jobs", action: "observe", voiceText: "إنشاء مهام رصد مجدولة.", delay: 2500 },
    ],
  },

  // ════════════════════════════
  // 🎨 تبديل المظهر
  // ════════════════════════════
  {
    id: "theme-toggle",
    title: "دليل تبديل المظهر",
    description: "تعلم كيف تبدل بين المظهر الداكن والفاتح",
    category: "البداية",
    steps: [
      { target: "[data-theme-toggle], button:has(.lucide-sun), button:has(.lucide-moon)", title: "زر تبديل المظهر", description: "هذا زر تبديل المظهر. سأضغطه لتشوف الفرق.", position: "bottom", action: "click", voiceText: "سأبدل المظهر لتشوف الفرق.", delay: 2000 },
      { target: "main", title: "المظهر الجديد", description: "لاحظ كيف تغير المظهر. يمكنك التبديل في أي وقت.", position: "bottom", action: "observe", voiceText: "لاحظ كيف تغير المظهر.", delay: 3000 },
      { target: "[data-theme-toggle], button:has(.lucide-sun), button:has(.lucide-moon)", title: "إرجاع المظهر", description: "سأرجع المظهر للأصلي.", position: "bottom", action: "click", voiceText: "سأرجع المظهر.", delay: 2000 },
    ],
  },
];

// ─── Route to Guide mapping ───
const ROUTE_GUIDE_MAP: Record<string, string> = {
  "/": "dashboard",
  "/leaks": "leaks",
  "/smart-rasid": "smart-rasid",
  "/live-scan": "live-scan",
  "/telegram": "telegram",
  "/darkweb": "darkweb",
  "/threat-map": "threat-map",
  "/sector-analysis": "sector-analysis",
  "/impact-assessment": "impact",
  "/executive-brief": "executive-brief",
  "/atlas/overview": "atlas",
  "/atlas/incidents": "atlas",
  "/atlas/pii-atlas": "atlas",
  "/atlas/trends": "atlas",
  "/settings": "settings",
  "/user-management": "user-management",
  "/audit-log": "audit-log",
  "/app/reports": "reports",
  "/alert-channels": "alert-channels",
  "/pdpl-compliance": "pdpl",
  "/knowledge-base": "knowledge-base",
  "/training-center": "training",
  "/evidence-chain": "evidence-chain",
  "/breach-import": "breach-import",
  "/export-data": "export-data",
  "/cases": "cases",
  "/profile": "profile",
  "/api-keys": "api-keys",
  "/ai-management": "ai-management",
  "/knowledge-graph": "knowledge-graph",
  "/source-intelligence": "source-intelligence",
  "/monitoring-jobs": "monitoring-jobs",
};

export function GuideProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<GuideDef | null>(null);

  const startGuide = useCallback((guideId: string) => {
    const guide = GUIDE_CATALOG.find(g => g.id === guideId);
    if (guide) {
      setCurrentGuide(guide);
      setIsOpen(true);
    }
  }, []);

  const startCustomGuide = useCallback((guide: GuideDef) => {
    setCurrentGuide(guide);
    setIsOpen(true);
  }, []);

  const stopGuide = useCallback(() => {
    setIsOpen(false);
    setCurrentGuide(null);
  }, []);

  const getAllGuides = useCallback(() => GUIDE_CATALOG, []);

  const getGuidesByCategory = useCallback((category: string) => {
    return GUIDE_CATALOG.filter(g => g.category === category);
  }, []);

  const getCategories = useCallback(() => {
    return [...new Set(GUIDE_CATALOG.map(g => g.category))];
  }, []);

  const getGuideForRoute = useCallback((route: string) => {
    const guideId = ROUTE_GUIDE_MAP[route];
    if (guideId) return GUIDE_CATALOG.find(g => g.id === guideId);
    return undefined;
  }, []);

  return (
    <GuideContext.Provider value={{ isOpen, currentGuide, startGuide, startCustomGuide, stopGuide, getAllGuides, getGuidesByCategory, getCategories, getGuideForRoute }}>
      {children}
    </GuideContext.Provider>
  );
}

export { GUIDE_CATALOG };
export default GuideContext;

```

---

## `client/src/contexts/PlatformSettingsContext.tsx`

```tsx
import React, { createContext, useContext, useEffect, useMemo, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";

// Types
interface PlatformSetting {
  settingKey: string;
  settingValue: string;
  settingType?: string;
  category?: string;
  label?: string;
  description?: string;
}

interface ThemeSetting {
  themeKey: string;
  themeValue: string;
  themeType?: string;
  category?: string;
  label?: string;
  cssVariable?: string;
}

interface ContentBlock {
  blockKey: string;
  contentAr?: string;
  contentEn?: string;
  blockType?: string;
  mediaUrl?: string;
  isVisible?: number;
}

interface PlatformSettingsContextType {
  getSetting: (key: string, fallback?: string) => string;
  getTheme: (key: string, fallback?: string) => string;
  getContent: (key: string, lang?: "ar" | "en", fallback?: string) => string;
  getContentMedia: (key: string) => string | undefined;
  settings: Record<string, PlatformSetting>;
  themes: Record<string, ThemeSetting>;
  content: Record<string, ContentBlock>;
  isLoading: boolean;
  isReady: boolean;
  refresh: () => void;
}

const PlatformSettingsContext = createContext<PlatformSettingsContextType | undefined>(undefined);

// Map theme keys to CSS custom properties used in index.css
const THEME_TO_CSS_MAP: Record<string, string[]> = {
  theme_primary: ["--primary", "--sidebar-primary"],
  theme_secondary: ["--secondary"],
  theme_accent: ["--accent"],
  theme_bg_main: ["--background"],
  theme_bg_card: ["--card", "--popover"],
  theme_bg_sidebar: ["--sidebar-bg"],
  theme_text_primary: ["--foreground", "--card-foreground", "--popover-foreground"],
  theme_text_secondary: ["--muted-foreground"],
  theme_text_muted: ["--muted"],
  theme_border_color: ["--border", "--sidebar-border"],
  theme_border_input: ["--input"],
  theme_ring_color: ["--ring", "--sidebar-ring"],
  theme_destructive_color: ["--destructive"],
  theme_success_color: ["--success"],
  theme_warning_color: ["--warning"],
  theme_info_color: ["--info"],
};

function hexToOklch(hex: string): string | null {
  // Simple pass-through: if the value is already oklch or hsl, return as-is
  if (hex.startsWith("oklch") || hex.startsWith("hsl") || hex.startsWith("rgb")) return hex;
  if (!hex.startsWith("#")) return null;
  // Convert hex to RGB then to approximate OKLCH
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  // Linearize
  const lr = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const lg = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const lb = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  // To XYZ
  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.0721750 * lb;
  const z = 0.0193339 * lr + 0.1191920 * lg + 0.9503041 * lb;
  // To OKLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bOk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(a * a + bOk * bOk);
  const H = (Math.atan2(bOk, a) * 180) / Math.PI;
  const hue = H < 0 ? H + 360 : H;
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(4)} ${hue.toFixed(1)})`;
}

// Apply CSS variables from theme settings to document root
function applyCSSVariables(themes: Record<string, ThemeSetting>) {
  const root = document.documentElement;

  Object.values(themes).forEach((t) => {
    // Apply via the cssVariable field from DB
    if (t.cssVariable && t.themeValue) {
      root.style.setProperty(t.cssVariable, t.themeValue);
    }

    // Apply via our mapping (for broader coverage)
    const cssVars = THEME_TO_CSS_MAP[t.themeKey];
    if (cssVars && t.themeValue) {
      cssVars.forEach((varName) => {
        root.style.setProperty(varName, t.themeValue);
      });
    }

    // Apply gradient for sidebar background
    if (t.themeKey === "theme_gradient_sidebar" && t.themeValue) {
      root.style.setProperty("--sidebar-bg", t.themeValue);
    }
  });
}

// Apply branding settings (favicon, title)
function applyBranding(settings: Record<string, PlatformSetting>) {
  const favicon = settings["branding_favicon"]?.settingValue;
  if (favicon) {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }

  const titleAr = settings["branding_platform_name_ar"]?.settingValue;
  const titleEn = settings["branding_platform_name_en"]?.settingValue;
  if (titleAr) {
    document.title = titleAr + (titleEn ? ` | ${titleEn}` : "");
  }
}

// Apply font settings
function applyFonts(settings: Record<string, PlatformSetting>) {
  const root = document.documentElement;

  const arHeadingFont = settings["typography_ar_heading_font"]?.settingValue;
  const arBodyFont = settings["typography_ar_body_font"]?.settingValue;
  const enFont = settings["typography_en_font"]?.settingValue;
  const baseSize = settings["typography_base_font_size"]?.settingValue;

  if (arBodyFont) root.style.setProperty("--font-ar", arBodyFont);
  if (arHeadingFont) root.style.setProperty("--font-ar-heading", arHeadingFont);
  if (enFont) root.style.setProperty("--font-en", enFont);
  if (baseSize) root.style.setProperty("--font-base-size", baseSize);

  // Load Google Fonts dynamically if needed
  const fontsToLoad = [arHeadingFont, arBodyFont, enFont].filter(Boolean);
  fontsToLoad.forEach((fontName) => {
    if (!fontName) return;
    const existingLink = document.querySelector(`link[href*="${encodeURIComponent(fontName)}"]`);
    if (!existingLink) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  });
}

// Apply layout settings
function applyLayout(settings: Record<string, PlatformSetting>) {
  const root = document.documentElement;

  const borderRadius = settings["layout_border_radius"]?.settingValue;
  if (borderRadius) root.style.setProperty("--radius", borderRadius);

  const sidebarWidth = settings["sidebar_width"]?.settingValue;
  if (sidebarWidth) root.style.setProperty("--sidebar-width", sidebarWidth);
}

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: configData, isLoading } = trpc.superAdmin.getAllConfig.useQuery(undefined, {
    staleTime: 10000, // Cache for 10s for faster live updates
    refetchOnWindowFocus: true,
  });

  const utils = trpc.useUtils();
  const appliedRef = useRef(false);

  // Build lookup maps
  const settingsMap = useMemo(() => {
    const map: Record<string, PlatformSetting> = {};
    if (configData?.settings && Array.isArray(configData.settings)) {
      (configData.settings as any[]).forEach((s) => {
        map[s.settingKey] = s;
      });
    }
    return map;
  }, [configData?.settings]);

  const themesMap = useMemo(() => {
    const map: Record<string, ThemeSetting> = {};
    if (configData?.themes && Array.isArray(configData.themes)) {
      (configData.themes as any[]).forEach((t) => {
        map[t.themeKey] = t;
      });
    }
    return map;
  }, [configData?.themes]);

  const contentMap = useMemo(() => {
    const map: Record<string, ContentBlock> = {};
    if (configData?.content && Array.isArray(configData.content)) {
      (configData.content as any[]).forEach((c) => {
        map[c.blockKey] = c;
      });
    }
    return map;
  }, [configData?.content]);

  // Apply CSS variables and branding when data changes
  useEffect(() => {
    if (!configData) return;
    applyCSSVariables(themesMap);
    applyBranding(settingsMap);
    applyFonts(settingsMap);
    applyLayout(settingsMap);
    appliedRef.current = true;
  }, [configData, themesMap, settingsMap]);

  // Getters
  const getSetting = useCallback((key: string, fallback = "") => {
    return settingsMap[key]?.settingValue ?? fallback;
  }, [settingsMap]);

  const getTheme = useCallback((key: string, fallback = "") => {
    return themesMap[key]?.themeValue ?? fallback;
  }, [themesMap]);

  const getContent = useCallback((key: string, lang: "ar" | "en" = "ar", fallback = "") => {
    const block = contentMap[key];
    if (!block) return fallback;
    return (lang === "ar" ? block.contentAr : block.contentEn) || fallback;
  }, [contentMap]);

  const getContentMedia = useCallback((key: string) => {
    return contentMap[key]?.mediaUrl || undefined;
  }, [contentMap]);

  const refresh = useCallback(() => {
    utils.superAdmin.getAllConfig.invalidate();
  }, [utils]);

  const value = useMemo(() => ({
    getSetting,
    getTheme,
    getContent,
    getContentMedia,
    settings: settingsMap,
    themes: themesMap,
    content: contentMap,
    isLoading,
    isReady: appliedRef.current && !isLoading,
    refresh,
  }), [getSetting, getTheme, getContent, getContentMedia, settingsMap, themesMap, contentMap, isLoading, refresh]);

  return (
    <PlatformSettingsContext.Provider value={value}>
      {children}
    </PlatformSettingsContext.Provider>
  );
}

export function usePlatformSettings() {
  const ctx = useContext(PlatformSettingsContext);
  if (!ctx) {
    return {
      getSetting: (_key: string, fallback = "") => fallback,
      getTheme: (_key: string, fallback = "") => fallback,
      getContent: (_key: string, _lang?: "ar" | "en", fallback = "") => fallback,
      getContentMedia: (_key: string) => undefined,
      settings: {} as Record<string, PlatformSetting>,
      themes: {} as Record<string, ThemeSetting>,
      content: {} as Record<string, ContentBlock>,
      isLoading: false,
      isReady: false,
      refresh: () => {},
    };
  }
  return ctx;
}

```

---

## `client/src/contexts/ThemeContext.tsx`

```tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";
type ThemeMode = "light" | "dark" | "auto";

/** Dynamic color themes that can be applied on top of light/dark mode */
type ColorTheme = "default" | "ocean" | "emerald" | "sunset" | "royal" | "crimson";

/** Design styles — 7 Ultra Premium visual theme skins */
export type DesignStyle = "sdaia" | "atlas" | "luxury" | "cyber" | "minimal" | "silver" | "gold3d";

interface DesignStyleDef {
  id: DesignStyle;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  tier: "premium" | "ultra";
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme?: () => void;
  setThemeMode?: (mode: ThemeMode) => void;
  switchable: boolean;
  isDark: boolean;
  /** Dynamic color theme */
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  /** Available color themes */
  colorThemes: { id: ColorTheme; name: string; nameAr: string; primary: string; accent: string }[];
  /** Design style — separate for light and dark */
  lightDesignStyle: DesignStyle;
  darkDesignStyle: DesignStyle;
  setLightDesignStyle: (style: DesignStyle) => void;
  setDarkDesignStyle: (style: DesignStyle) => void;
  /** Active design style based on current theme */
  activeDesignStyle: DesignStyle;
  /** Default theme mode — what loads on first visit */
  defaultThemeMode: ThemeMode;
  setDefaultThemeMode: (mode: ThemeMode) => void;
  /** Enable/disable individual modes */
  lightModeEnabled: boolean;
  darkModeEnabled: boolean;
  setLightModeEnabled: (enabled: boolean) => void;
  setDarkModeEnabled: (enabled: boolean) => void;
  /** Available design styles */
  designStyles: DesignStyleDef[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

const DESIGN_STYLES: DesignStyleDef[] = [
  {
    id: "sdaia",
    name: "SDAIA Royal",
    nameAr: "سدايا الملكي",
    description: "Official SDAIA design with glassmorphism, teal & navy accents",
    descriptionAr: "التصميم الرسمي لسدايا مع تأثيرات زجاجية وألوان تركوازية وكحلية",
    tier: "ultra",
  },
  {
    id: "atlas",
    name: "Atlas Modern",
    nameAr: "أطلس العصري",
    description: "Elegant purple gradients with cream undertones",
    descriptionAr: "تدرجات بنفسجية أنيقة مع لمسات كريمية دافئة",
    tier: "ultra",
  },
  {
    id: "luxury",
    name: "Luxury Gold",
    nameAr: "الذهب الفاخر",
    description: "Premium gold & navy with 3D bevel cards and shimmer effects",
    descriptionAr: "ذهبي فاخر مع كحلي عميق وبطاقات ثلاثية الأبعاد وتأثيرات لمعان",
    tier: "ultra",
  },
  {
    id: "cyber",
    name: "Cyber Neon",
    nameAr: "سايبر نيون",
    description: "Electric neon green with scan-line effects and pulsing borders",
    descriptionAr: "نيون أخضر كهربائي مع تأثيرات مسح ضوئي وحدود نابضة",
    tier: "ultra",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    nameAr: "البسيط النظيف",
    description: "Clean zinc palette with no effects — pure focus",
    descriptionAr: "تصميم نظيف بدون تأثيرات — تركيز صافي على المحتوى",
    tier: "premium",
  },
  {
    id: "silver",
    name: "Silver Steel",
    nameAr: "الفضي الصناعي",
    description: "Industrial chrome dashboard with 3D bevel cards and metallic shimmer",
    descriptionAr: "لوحة تحكم كروم صناعية مع بطاقات ثلاثية الأبعاد ولمعان معدني فضي",
    tier: "ultra",
  },
  {
    id: "gold3d",
    name: "Gold Luxury 3D",
    nameAr: "الذهبي ثلاثي الأبعاد",
    description: "Premium gold control dashboard with 3D embossed cards and golden shimmer",
    descriptionAr: "لوحة تحكم ذهبية فاخرة مع بطاقات محفورة ثلاثية الأبعاد ولمعان ذهبي",
    tier: "ultra",
  },
];

const COLOR_THEMES: ThemeContextType["colorThemes"] = [
  { id: "default", name: "Default", nameAr: "الافتراضي", primary: "#06b6d4", accent: "#8b5cf6" },
  { id: "ocean", name: "Ocean", nameAr: "المحيط", primary: "#0ea5e9", accent: "#06b6d4" },
  { id: "emerald", name: "Emerald", nameAr: "الزمرد", primary: "#10b981", accent: "#059669" },
  { id: "sunset", name: "Sunset", nameAr: "الغروب", primary: "#f59e0b", accent: "#ef4444" },
  { id: "royal", name: "Royal", nameAr: "الملكي", primary: "#8b5cf6", accent: "#6366f1" },
  { id: "crimson", name: "Crimson", nameAr: "القرمزي", primary: "#ef4444", accent: "#ec4899" },
];

const VALID_STYLES = DESIGN_STYLES.map(s => s.id);

function getSystemTheme(): Theme {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === "auto") return getSystemTheme();
  return mode;
}

function isValidStyle(s: string | null): s is DesignStyle {
  return s !== null && VALID_STYLES.includes(s as DesignStyle);
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  switchable = true,
}: ThemeProviderProps) {
  // ═══ Enable/Disable modes ═══
  const [lightModeEnabled, setLightModeEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem("rasid-lightModeEnabled");
    return stored !== null ? stored === "true" : true;
  });
  const [darkModeEnabled, setDarkModeEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem("rasid-darkModeEnabled");
    return stored !== null ? stored === "true" : true;
  });

  // ═══ Default theme mode ═══
  const [defaultThemeModeStored, setDefaultThemeModeStored] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("rasid-defaultThemeMode");
    if (stored === "light" || stored === "dark" || stored === "auto") return stored;
    return defaultTheme;
  });

  // ═══ Theme mode ═══
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (switchable) {
      const stored = localStorage.getItem("rasid-themeMode");
      if (stored === "light" || stored === "dark" || stored === "auto") {
        return stored;
      }
      const oldStored = localStorage.getItem("themeMode") || localStorage.getItem("theme");
      if (oldStored === "light" || oldStored === "dark") {
        return oldStored;
      }
    }
    return defaultThemeModeStored;
  });

  const [theme, setTheme] = useState<Theme>(() => resolveTheme(themeMode));

  // ═══ Color theme ═══
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem("rasid-colorTheme");
    if (stored && COLOR_THEMES.some(t => t.id === stored)) {
      return stored as ColorTheme;
    }
    return "default";
  });

  // ═══ Separate design styles for light and dark modes ═══
  const [lightDesignStyle, setLightDesignStyleState] = useState<DesignStyle>(() => {
    const stored = localStorage.getItem("rasid-lightDesignStyle");
    if (isValidStyle(stored)) return stored;
    return "atlas";
  });
  const [darkDesignStyle, setDarkDesignStyleState] = useState<DesignStyle>(() => {
    const stored = localStorage.getItem("rasid-darkDesignStyle");
    if (isValidStyle(stored)) return stored;
    return "atlas";
  });

  // ═══ Enforce mode availability ═══
  useEffect(() => {
    const resolved = resolveTheme(themeMode);
    if (resolved === "light" && !lightModeEnabled && darkModeEnabled) {
      setThemeModeState("dark");
    } else if (resolved === "dark" && !darkModeEnabled && lightModeEnabled) {
      setThemeModeState("light");
    }
  }, [lightModeEnabled, darkModeEnabled, themeMode]);

  // ═══ Listen for OS color scheme changes when in auto mode ═══
  useEffect(() => {
    if (themeMode !== "auto") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      if (newTheme === "dark" && !darkModeEnabled && lightModeEnabled) {
        setTheme("light");
      } else if (newTheme === "light" && !lightModeEnabled && darkModeEnabled) {
        setTheme("dark");
      } else {
        setTheme(newTheme);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode, lightModeEnabled, darkModeEnabled]);

  // ═══ Update resolved theme when mode changes ═══
  useEffect(() => {
    setTheme(resolveTheme(themeMode));
  }, [themeMode]);

  // ═══ Apply theme to DOM ═══
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-transitioning");

    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    if (switchable) {
      localStorage.setItem("rasid-themeMode", themeMode);
      localStorage.setItem("rasid-theme", theme);
    }

    const timer = setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 500);

    return () => clearTimeout(timer);
  }, [theme, themeMode, switchable]);

  // ═══ Apply color theme CSS variables ═══
  useEffect(() => {
    const themeData = COLOR_THEMES.find(t => t.id === colorTheme);
    if (themeData) {
      document.documentElement.style.setProperty("--theme-primary", themeData.primary);
      document.documentElement.style.setProperty("--theme-accent", themeData.accent);
      document.documentElement.setAttribute("data-color-theme", colorTheme);
      localStorage.setItem("rasid-colorTheme", colorTheme);
    }
  }, [colorTheme]);

  // ═══ Toggle cycles ═══
  const toggleTheme = switchable
    ? () => {
        setThemeModeState((prev) => {
          if (lightModeEnabled && darkModeEnabled) {
            if (prev === "light") return "dark";
            if (prev === "dark") return "auto";
            return "light";
          }
          if (lightModeEnabled && !darkModeEnabled) return "light";
          if (!lightModeEnabled && darkModeEnabled) return "dark";
          return prev;
        });
      }
    : undefined;

  const setThemeMode = switchable
    ? (mode: ThemeMode) => {
        const resolved = resolveTheme(mode);
        if (resolved === "light" && !lightModeEnabled) return;
        if (resolved === "dark" && !darkModeEnabled) return;
        setThemeModeState(mode);
      }
    : undefined;

  const setColorTheme = useCallback((ct: ColorTheme) => {
    setColorThemeState(ct);
  }, []);

  const setLightDesignStyle = useCallback((s: DesignStyle) => {
    setLightDesignStyleState(s);
    localStorage.setItem("rasid-lightDesignStyle", s);
  }, []);
  const setDarkDesignStyle = useCallback((s: DesignStyle) => {
    setDarkDesignStyleState(s);
    localStorage.setItem("rasid-darkDesignStyle", s);
  }, []);
  const setDefaultThemeMode = useCallback((mode: ThemeMode) => {
    setDefaultThemeModeStored(mode);
    localStorage.setItem("rasid-defaultThemeMode", mode);
  }, []);
  const setLightModeEnabled = useCallback((enabled: boolean) => {
    setLightModeEnabledState(enabled);
    localStorage.setItem("rasid-lightModeEnabled", String(enabled));
  }, []);
  const setDarkModeEnabled = useCallback((enabled: boolean) => {
    setDarkModeEnabledState(enabled);
    localStorage.setItem("rasid-darkModeEnabled", String(enabled));
  }, []);

  const activeDesignStyle = theme === "dark" ? darkDesignStyle : lightDesignStyle;

  // ═══ Apply design style as data attribute ═══
  useEffect(() => {
    document.documentElement.setAttribute("data-design-style", activeDesignStyle);
  }, [activeDesignStyle]);

  // ═══ LIGHT MODE: Nuclear fix for ALL dark-only inline styles ═══
  // Strips backdrop-filter, fixes rgba backgrounds/borders in light mode
  useEffect(() => {
    if (theme === "dark") return;
    let fixing = false;
    const fixLightStyles = (el: Element) => {
      if (!(el instanceof HTMLElement)) return;
      const s = el.style;
      // NUCLEAR: Strip ALL backdrop-filter in light mode
      if (s.backdropFilter && s.backdropFilter !== "none") {
        s.backdropFilter = "none";
      }
      // Also strip -webkit-backdrop-filter
      if ((s as any).webkitBackdropFilter && (s as any).webkitBackdropFilter !== "none") {
        (s as any).webkitBackdropFilter = "none";
      }
      // Fix near-invisible white-alpha backgrounds
      const bg = s.background || s.backgroundColor;
      if (bg && /rgba\(255,\s*255,\s*255,\s*0\.0[1-9]/.test(bg)) {
        s.background = bg.replace(
          /rgba\(255,\s*255,\s*255,\s*0\.0([1-9])\)/g,
          (_, d: string) => `rgba(120, 100, 200, 0.0${Math.min(Number(d) + 2, 9)})`
        );
      }
      // Fix dark semi-transparent backgrounds (rgba(26,37,80,0.8) etc)
      if (bg && /rgba\(\s*\d{1,2},\s*\d{1,2},\s*\d{1,2},/.test(bg)) {
        s.background = "rgba(255,255,255,0.95)";
      }
      // Fix near-invisible white-alpha borders
      const bd = s.border || s.borderColor;
      if (bd && /rgba\(255,\s*255,\s*255,\s*0\.0[1-9]/.test(bd)) {
        const prop = s.border ? "border" : "borderColor";
        (s as any)[prop] = bd.replace(
          /rgba\(255,\s*255,\s*255,\s*0\.0([1-9])\)/g,
          (_, d: string) => `rgba(120, 100, 200, 0.${Math.min(Number(d) + 5, 15).toString().padStart(1, '0')})`
        );
      }
    };
    // Fix existing elements
    fixing = true;
    document.querySelectorAll("[style]").forEach(fixLightStyles);
    fixing = false;
    // Watch for new elements or style changes
    const observer = new MutationObserver((mutations) => {
      if (fixing) return;
      fixing = true;
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "style") {
          fixLightStyles(m.target as Element);
        }
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n instanceof HTMLElement) {
              fixLightStyles(n);
              n.querySelectorAll("[style]").forEach(fixLightStyles);
            }
          });
        }
      }
      fixing = false;
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"], childList: true, subtree: true });
    return () => observer.disconnect();
  }, [theme]);

  return (
    <ThemeContext.Provider value={{
      theme, themeMode, toggleTheme, setThemeMode, switchable,
      isDark: theme === "dark",
      colorTheme, setColorTheme, colorThemes: COLOR_THEMES,
      lightDesignStyle, darkDesignStyle,
      setLightDesignStyle, setDarkDesignStyle,
      activeDesignStyle,
      defaultThemeMode: defaultThemeModeStored,
      setDefaultThemeMode,
      lightModeEnabled, darkModeEnabled,
      setLightModeEnabled, setDarkModeEnabled,
      designStyles: DESIGN_STYLES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

```

---

## `client/src/contexts/atlas/DataContext.tsx`

```tsx
/**
 * DataContext — Provides atlas data to all atlas visualization pages
 * Tries tRPC API first (live DB), falls back to static atlas_data.json
 */
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

export interface PiiItem {
  name: string;
  nameAr: string;
  count: number;
  sensitivity: "high" | "medium" | "low";
  topSectors: { sector: string; count: number }[];
  sourceDistribution: Record<string, number>;
  severityDistribution: Record<string, number>;
}

export interface IncidentDetail {
  id: string;
  title: string;
  titleEn: string;
  records: number;
  date: string;
  sector: string;
  sectorEn: string;
  source: string;
  severity: string;
  region: string;
  city: string;
  description: string;
  piiTypes: string[];
  status: string;
  threatActor: string;
  breachMethod: string;
  sourcePlatform: string;
  evidenceUrls?: { url: string; type: string; filename: string }[];
  descriptionEn?: string;
  price?: string;
  sourceUrl?: string;
  aiAnalysis?: string;
  samples?: string;
  totalSampleRecords?: number;
  breachMethodEn?: string;
  piiTypesEn?: string[];
  imageUrls?: string[];
}

export interface PatternItem {
  id: string;
  source: string;
  sourceKey: string;
  severity: string;
  severityKey: string;
  count: number;
  records: number;
  sectorCount: number;
  sectors: string[];
  piiTypes: string[];
  topIncidents: { id: string; title: string; records: number; date: string; sector: string }[];
  incidents: IncidentDetail[];
}

export interface SectorItem {
  name: string;
  count: number;
  records: number;
  sources: Record<string, number>;
  severities: Record<string, number>;
  piiTypes: string[];
  regions: string[];
}

export interface AtlasData {
  summary: {
    totalIncidents: number;
    totalRecords: number;
    totalPiiTypes: number;
    totalSectors: number;
    totalRegions: number;
    severityDistribution: Record<string, number>;
    sourceDistribution: Record<string, { count: number; records: number }>;
  };
  piiAtlas: PiiItem[];
  sectors: SectorItem[];
  patterns: PatternItem[];
  monthly: { month: string; count: number; records: number }[];
  regions: { name: string; count: number; records: number }[];
}

interface DataContextType {
  data: AtlasData | null;
  loading: boolean;
  allIncidents: IncidentDetail[];
}

const DataContext = createContext<DataContextType>({ data: null, loading: true, allIncidents: [] });

function extractIncidents(d: AtlasData): IncidentDetail[] {
  const incidents: IncidentDetail[] = [];
  const seen = new Set<string>();
  d.patterns.forEach(p => {
    if (p.incidents) {
      p.incidents.forEach(inc => {
        if (!seen.has(inc.id)) {
          seen.add(inc.id);
          incidents.push(inc);
        }
      });
    }
  });
  return incidents;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AtlasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [allIncidents, setAllIncidents] = useState<IncidentDetail[]>([]);

  // Try tRPC API first (live DB data)
  const { data: apiData, isLoading: apiLoading, isError: apiError } = trpc.atlas.getAtlasData.useQuery(
    undefined,
    { retry: 1, staleTime: 5 * 60 * 1000 }
  );

  useEffect(() => {
    if (apiLoading) return;

    if (!apiError && apiData && (apiData as any).summary?.totalIncidents > 0) {
      // Use live DB data
      const d = apiData as unknown as AtlasData;
      setData(d);
      setAllIncidents(extractIncidents(d));
      setLoading(false);
    } else {
      // Fallback to static JSON
      fetch("https://files.manuscdn.com/user_upload_by_module/session_file/310519663340926600/TxutLTYoaCOCEAjl.json")
        .then(r => r.json())
        .then((d: AtlasData) => {
          setData(d);
          setAllIncidents(extractIncidents(d));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [apiData, apiLoading, apiError]);

  return (
    <DataContext.Provider value={{ data, loading, allIncidents }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

```

---

