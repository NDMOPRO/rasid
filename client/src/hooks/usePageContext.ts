import { useMemo } from "react";
import { useLocation } from "wouter";

export interface PageContext {
  path: string;
  title: string;
  section: string;
  description: string;
}

/** Page Context Pack for AI (UI-06, UI-07, PR-12) */
export interface PageContextPack {
  route: string;
  pageId: string;
  activeFilters?: Record<string, any>;
  currentEntityId?: string;
  availableActions?: string[];
  userRole?: string;
}

const pageMap: Record<string, {
  title: string;
  section: string;
  description: string;
  domain: "breaches" | "privacy";
  pageId: string;
  availableActions: string[];
  suggestedQuestions: string[];
}> = {
  "/": { title: "لوحة المعلومات", section: "رئيسية", description: "عرض ملخص شامل لحالات الرصد والإحصائيات", domain: "breaches", pageId: "overview_dashboard", availableActions: ["view_stats", "filter_by_period", "export_report"], suggestedQuestions: ["كم حالة رصد جديدة اليوم؟", "ما أبرز حالات الرصد واسعة النطاق؟", "أعطني ملخص تنفيذي"] },
  "/overview": { title: "لوحة المعلومات", section: "رئيسية", description: "عرض ملخص شامل لحالات الرصد والإحصائيات", domain: "breaches", pageId: "overview_dashboard", availableActions: ["view_stats", "filter_by_period", "export_report"], suggestedQuestions: ["كم حالة رصد جديدة اليوم؟", "ما أبرز حالات الرصد واسعة النطاق؟", "أعطني ملخص تنفيذي"] },
  "/leaks": { title: "حالات الرصد", section: "تنفيذي", description: "عرض وإدارة حالات الرصد المكتشفة", domain: "breaches", pageId: "incidents_list", availableActions: ["view_details", "filter", "create_case", "export"], suggestedQuestions: ["صنف حالات الرصد حسب القطاع", "كم حالة رصد واسعة النطاق؟", "حلل الاتجاهات"] },
  "/incidents": { title: "حالات الرصد", section: "تنفيذي", description: "عرض وإدارة حالات الرصد المكتشفة", domain: "breaches", pageId: "incidents_list", availableActions: ["view_details", "filter", "create_case", "export"], suggestedQuestions: ["صنف حالات الرصد حسب القطاع", "كم حالة رصد واسعة النطاق؟", "حلل الاتجاهات"] },
  "/sites": { title: "المواقع المراقبة", section: "تنفيذي", description: "إدارة المواقع الخاضعة للمراقبة", domain: "privacy", pageId: "privacy_sites", availableActions: ["view_site", "filter", "scan", "export"], suggestedQuestions: ["كم موقع تم رصده؟", "أي المواقع لا تملك سياسة خصوصية؟", "ابدأ فحص جديد"] },
  "/privacy": { title: "لوحة الخصوصية", section: "الخصوصية", description: "مؤشرات الامتثال وحالة الجهات", domain: "privacy", pageId: "privacy_dashboard", availableActions: ["view_compliance", "filter_by_sector", "generate_report"], suggestedQuestions: ["كم نسبة الامتثال العامة؟", "ما أكثر البنود نقصاً؟", "قارن القطاعات"] },
  "/reports": { title: "التقارير", section: "تنفيذي", description: "عرض وإنشاء التقارير", domain: "breaches", pageId: "reports_list", availableActions: ["create_report", "view_report", "export", "schedule"], suggestedQuestions: ["أنشئ تقرير تنفيذي", "كم تقرير تم إنشاؤه هذا الشهر؟", "جدول تقرير أسبوعي"] },
  "/scan": { title: "الفحص", section: "تنفيذي", description: "إدارة عمليات الفحص", domain: "breaches", pageId: "scan_page", availableActions: ["start_scan", "view_results"], suggestedQuestions: ["ابدأ فحص مباشر", "ما آخر نتائج الفحص؟"] },
  "/cases": { title: "القضايا", section: "تنفيذي", description: "إدارة القضايا والمتابعات", domain: "breaches", pageId: "cases_list", availableActions: ["view_case", "create_case", "update_status"], suggestedQuestions: ["كم قضية مفتوحة؟", "ما القضايا المعلقة؟"] },
  "/members": { title: "الأعضاء", section: "إداري", description: "إدارة أعضاء الفريق", domain: "breaches", pageId: "members_list", availableActions: ["manage_users", "assign_roles"], suggestedQuestions: ["من المستخدمون النشطون؟", "أضف مستخدم جديد"] },
  "/settings": { title: "الإعدادات", section: "إداري", description: "إعدادات النظام", domain: "breaches", pageId: "settings_page", availableActions: ["manage_settings", "api_keys"], suggestedQuestions: ["ما إعدادات المنصة الحالية؟", "أين مفاتيح API؟"] },
  "/smart-rasid": { title: "راصد الذكي", section: "ذكاء اصطناعي", description: "المساعد الذكي للمنصة", domain: "breaches", pageId: "smart_rasid_full", availableActions: ["chat", "analyze", "generate_report", "guide"], suggestedQuestions: ["ما الجديد في المنصة؟", "حلل بياناتي", "ساعدني في إنشاء تقرير"] },
  "/dark-web": { title: "مراقبة الويب المظلم", section: "متقدم", description: "مراقبة التهديدات في الويب المظلم", domain: "breaches", pageId: "dark_web_monitor", availableActions: ["view_listings", "search"], suggestedQuestions: ["ما آخر عروض الدارك ويب؟", "كم قائمة نشطة؟"] },
  "/threat-map": { title: "خريطة التهديدات", section: "متقدم", description: "عرض جغرافي للتهديدات", domain: "breaches", pageId: "threat_map", availableActions: ["view_map", "filter_by_region"], suggestedQuestions: ["أعرض خريطة التهديدات", "ما أكثر المناطق تأثراً؟"] },
  "/advanced-analytics": { title: "التحليلات المتقدمة", section: "تحليلات", description: "تحليلات وإحصائيات متقدمة", domain: "breaches", pageId: "advanced_analytics", availableActions: ["view_analytics", "compare", "export"], suggestedQuestions: ["حلل الاتجاهات هذا الشهر", "قارن القطاعات"] },
  "/knowledge-base": { title: "قاعدة المعرفة", section: "موارد", description: "مقالات وسياسات ومعلومات مرجعية", domain: "breaches", pageId: "knowledge_base", availableActions: ["search", "view_article"], suggestedQuestions: ["ابحث عن سياسة الخصوصية", "ما أنواع PII المدعومة؟"] },
  "/evidence-chain": { title: "سلسلة الأدلة", section: "متقدم", description: "توثيق الأدلة الرقمية", domain: "breaches", pageId: "evidence_chain", availableActions: ["view_evidence", "add_evidence", "verify"], suggestedQuestions: ["كم دليل موثق؟", "تحقق من سلامة الأدلة"] },
  "/activity-logs": { title: "سجل النشاط", section: "إداري", description: "سجل نشاطات المستخدمين", domain: "breaches", pageId: "activity_logs", availableActions: ["view_logs", "filter", "export"], suggestedQuestions: ["من سجل دخول اليوم؟", "أعرض آخر الإجراءات"] },
  "/system-health": { title: "صحة النظام", section: "إداري", description: "مراقبة صحة وأداء النظام", domain: "breaches", pageId: "system_health", availableActions: ["view_health", "check_status"], suggestedQuestions: ["ما حالة النظام؟", "هل هناك أخطاء حرجة؟"] },
  "/training-center": { title: "مركز التدريب", section: "ذكاء اصطناعي", description: "تدريب وتحسين المساعد الذكي", domain: "breaches", pageId: "training_center", availableActions: ["manage_documents", "manage_triggers", "test"], suggestedQuestions: ["كم وثيقة تدريب؟", "أضف وثيقة جديدة"] },
  "/bulk-analysis": { title: "التحليل الجماعي", section: "ذكاء اصطناعي", description: "تحليل دفعات كبيرة من البيانات", domain: "breaches", pageId: "bulk_analysis", availableActions: ["upload", "analyze", "export"], suggestedQuestions: ["حلل ملف CSV", "استورد بيانات جديدة"] },
  "/breach-dashboards": { title: "لوحات مؤشرات الرصد", section: "رئيسية", description: "لوحات مؤشرات حالات الرصد", domain: "breaches", pageId: "breach_dashboards_hub", availableActions: ["view_dashboard", "filter", "drill_down"], suggestedQuestions: ["أعرض لوحة مؤشرات تنفيذية", "حلل اتجاهات حالات الرصد"] },
  "/privacy-dashboards": { title: "لوحات مؤشرات الخصوصية", section: "رئيسية", description: "لوحات مؤشرات الامتثال", domain: "privacy", pageId: "privacy_dashboards_hub", availableActions: ["view_compliance", "filter", "compare_sectors"], suggestedQuestions: ["قارن امتثال القطاعات", "ما نسبة تغطية البنود الثمانية؟"] },
  "/admin": { title: "لوحة الإدارة", section: "إداري", description: "التحكم الكامل بالمنصة", domain: "breaches", pageId: "admin_panel", availableActions: ["manage_users", "manage_settings", "view_audit_log", "manage_features"], suggestedQuestions: ["من سجل دخول اليوم؟", "أعرض سجل المراجعة", "ما إعدادات المنصة الحالية؟"] },
};

export function usePageContext(): PageContext {
  const [location] = useLocation();

  return useMemo(() => {
    const basePath = "/" + (location.split("/")[1] || "");
    const info = pageMap[basePath] || pageMap[location] || {
      title: "صفحة غير معروفة",
      section: "عام",
      description: "",
      domain: "breaches" as const,
      pageId: "unknown",
      availableActions: [],
      suggestedQuestions: [],
    };
    return { path: location, title: info.title, section: info.section, description: info.description };
  }, [location]);
}

/** Enhanced hook for AI context pack (UI-06, UI-07, PR-12, GOV-01) */
export function useAIPageContext(overrides?: Partial<PageContextPack>): {
  pageContext: PageContextPack;
  domain: "breaches" | "privacy";
  suggestedQuestions: string[];
} {
  const [location] = useLocation();

  return useMemo(() => {
    const basePath = "/" + (location.split("/")[1] || "");
    const meta = pageMap[basePath] || pageMap[location] || {
      title: "صفحة غير معروفة",
      section: "عام",
      description: "",
      domain: "breaches" as const,
      pageId: location.replace(/\//g, "_").replace(/^_/, "") || "unknown",
      availableActions: [],
      suggestedQuestions: ["ساعدني", "ما الذي يمكنك فعله؟"],
    };

    // Determine domain from route
    const isPrivacyRoute = location.includes("privacy") || location.includes("sites") || location.includes("clauses") || location.includes("compliance");
    const domain: "breaches" | "privacy" = isPrivacyRoute ? "privacy" : meta.domain;

    const pageContext: PageContextPack = {
      route: location,
      pageId: meta.pageId,
      availableActions: meta.availableActions,
      ...overrides,
    };

    return {
      pageContext,
      domain,
      suggestedQuestions: meta.suggestedQuestions || [],
    };
  }, [location, overrides]);
}
