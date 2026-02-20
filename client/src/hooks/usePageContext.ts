import { useMemo } from "react";
import { useLocation } from "wouter";

export interface PageContext {
  path: string;
  title: string;
  section: string;
  description: string;
}

const pageMap: Record<string, { title: string; section: string; description: string }> = {
  "/": { title: "لوحة المعلومات", section: "رئيسية", description: "عرض ملخص شامل لحالات الرصد والإحصائيات" },
  "/leaks": { title: "حالات الرصد", section: "تنفيذي", description: "عرض وإدارة حالات الرصد المكتشفة" },
  "/sites": { title: "المواقع المراقبة", section: "تنفيذي", description: "إدارة المواقع الخاضعة للمراقبة" },
  "/reports": { title: "التقارير", section: "تنفيذي", description: "عرض وإنشاء التقارير" },
  "/scan": { title: "الفحص", section: "تنفيذي", description: "إدارة عمليات الفحص" },
  "/cases": { title: "القضايا", section: "تنفيذي", description: "إدارة القضايا والمتابعات" },
  "/members": { title: "الأعضاء", section: "إداري", description: "إدارة أعضاء الفريق" },
  "/settings": { title: "الإعدادات", section: "إداري", description: "إعدادات النظام" },
  "/smart-rasid": { title: "راصد الذكي", section: "ذكاء اصطناعي", description: "المساعد الذكي للمنصة" },
  "/dark-web": { title: "مراقبة الويب المظلم", section: "متقدم", description: "مراقبة التهديدات في الويب المظلم" },
  "/threat-map": { title: "خريطة التهديدات", section: "متقدم", description: "عرض جغرافي للتهديدات" },
  "/advanced-analytics": { title: "التحليلات المتقدمة", section: "تحليلات", description: "تحليلات وإحصائيات متقدمة" },
  "/knowledge-base": { title: "قاعدة المعرفة", section: "موارد", description: "مقالات وسياسات ومعلومات مرجعية" },
  "/evidence-chain": { title: "سلسلة الأدلة", section: "متقدم", description: "توثيق الأدلة الرقمية" },
  "/activity-logs": { title: "سجل النشاط", section: "إداري", description: "سجل نشاطات المستخدمين" },
  "/system-health": { title: "صحة النظام", section: "إداري", description: "مراقبة صحة وأداء النظام" },
  "/training-center": { title: "مركز التدريب", section: "ذكاء اصطناعي", description: "تدريب وتحسين المساعد الذكي" },
  "/bulk-analysis": { title: "التحليل الجماعي", section: "ذكاء اصطناعي", description: "تحليل دفعات كبيرة من البيانات" },
};

export function usePageContext(): PageContext {
  const [location] = useLocation();

  return useMemo(() => {
    const basePath = "/" + (location.split("/")[1] || "");
    const info = pageMap[basePath] || pageMap[location] || {
      title: "صفحة غير معروفة",
      section: "عام",
      description: "",
    };
    return { path: location, ...info };
  }, [location]);
}
