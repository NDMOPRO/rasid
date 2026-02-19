/**
 * Admin Seed Data — Default roles, permissions, and feature flags
 * Run via: npx tsx server/adminSeed.ts
 */
import { getDb } from "./db";
import {
  adminRoles,
  adminPermissions,
  adminRolePermissions,
  adminFeatureFlags,
  adminUserRoles,
  platformUsers,
  pageRegistry,
  aiPersonalityConfig,
  platformSettings,
  templates,
  notificationRules,
  dashboardLayouts,
  apiProviders,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── Default Roles ───
const DEFAULT_ROLES = [
  { id: "role-super-admin", roleName: "مدير النظام الأعلى", roleNameEn: "Super Admin", roleDescription: "صلاحيات كاملة بدون قيود", roleDescriptionEn: "Full unrestricted access", isSystem: 1, rolePriority: 100, roleColor: "#ef4444" },
  { id: "role-admin", roleName: "مدير النظام", roleNameEn: "Admin", roleDescription: "إدارة كاملة مع بعض القيود", roleDescriptionEn: "Full management with some restrictions", isSystem: 1, rolePriority: 80, roleColor: "#f59e0b" },
  { id: "role-analyst", roleName: "محلل", roleNameEn: "Analyst", roleDescription: "عرض وتحليل البيانات والتقارير", roleDescriptionEn: "View and analyze data and reports", isSystem: 1, rolePriority: 60, roleColor: "#3b82f6" },
  { id: "role-viewer", roleName: "مشاهد", roleNameEn: "Viewer", roleDescription: "عرض البيانات فقط بدون تعديل", roleDescriptionEn: "View-only access", isSystem: 1, rolePriority: 40, roleColor: "#6b7280" },
  { id: "role-guest", roleName: "زائر", roleNameEn: "Guest", roleDescription: "وصول محدود جداً", roleDescriptionEn: "Very limited access", isSystem: 1, rolePriority: 20, roleColor: "#9ca3af" },
];

// ─── Default Permissions (all platform pages + key features) ───
const PAGE_PERMISSIONS = [
  { resourceId: "page:dashboard", name: "لوحة المؤشرات", nameEn: "Dashboard" },
  { resourceId: "page:smart-rasid", name: "راصد الذكي", nameEn: "Smart Rasid" },
  { resourceId: "page:national-overview", name: "النظرة الوطنية", nameEn: "National Overview" },
  { resourceId: "page:leaks", name: "حالات الرصد", nameEn: "Leaks" },
  { resourceId: "page:leak-anatomy", name: "تشريح الحالة", nameEn: "Leak Anatomy" },
  { resourceId: "page:sector-analysis", name: "تحليل القطاعات", nameEn: "Sector Analysis" },
  { resourceId: "page:leak-timeline", name: "الخط الزمني", nameEn: "Leak Timeline" },
  { resourceId: "page:threat-actors-analysis", name: "تحليل الجهات المهددة", nameEn: "Threat Actors" },
  { resourceId: "page:impact-assessment", name: "تقييم الأثر", nameEn: "Impact Assessment" },
  { resourceId: "page:source-intelligence", name: "استخبارات المصادر", nameEn: "Source Intelligence" },
  { resourceId: "page:geo-analysis", name: "التحليل الجغرافي", nameEn: "Geo Analysis" },
  { resourceId: "page:executive-brief", name: "الملخص التنفيذي", nameEn: "Executive Brief" },
  { resourceId: "page:incident-compare", name: "مقارنة حالات الرصد", nameEn: "Incident Compare" },
  { resourceId: "page:campaign-tracker", name: "تتبع الحملات", nameEn: "Campaign Tracker" },
  { resourceId: "page:incidents-registry", name: "سجل حالات الرصد", nameEn: "Incidents Registry" },
  { resourceId: "page:recommendations-hub", name: "مركز التوصيات", nameEn: "Recommendations Hub" },
  { resourceId: "page:pdpl-compliance", name: "الامتثال", nameEn: "PDPL Compliance" },
  { resourceId: "page:pii-atlas", name: "أطلس البيانات", nameEn: "PII Atlas" },
  { resourceId: "page:pii-classifier", name: "مصنف البيانات", nameEn: "PII Classifier" },
  { resourceId: "page:evidence-chain", name: "سلسلة الأدلة", nameEn: "Evidence Chain" },
  { resourceId: "page:feedback-accuracy", name: "دقة النتائج", nameEn: "Feedback Accuracy" },
  { resourceId: "page:reports", name: "التقارير", nameEn: "Reports" },
  { resourceId: "page:verify", name: "التحقق من التوثيق", nameEn: "Verify Document" },
  { resourceId: "page:report-approval", name: "اعتماد التقارير", nameEn: "Report Approval" },
  { resourceId: "page:live-scan", name: "الرصد المباشر", nameEn: "Live Scan" },
  { resourceId: "page:telegram", name: "رصد تيليجرام", nameEn: "Telegram Monitor" },
  { resourceId: "page:darkweb", name: "رصد الدارك ويب", nameEn: "Dark Web Monitor" },
  { resourceId: "page:paste-sites", name: "مواقع اللصق", nameEn: "Paste Sites" },
  { resourceId: "page:osint-tools", name: "أدوات OSINT", nameEn: "OSINT Tools" },
  { resourceId: "page:threat-rules", name: "قواعد التهديد", nameEn: "Threat Rules" },
  { resourceId: "page:knowledge-graph", name: "الرسم المعرفي", nameEn: "Knowledge Graph" },
  { resourceId: "page:threat-map", name: "خريطة التهديدات", nameEn: "Threat Map" },
  { resourceId: "page:seller-profiles", name: "ملفات البائعين", nameEn: "Seller Profiles" },
  { resourceId: "page:monitoring-jobs", name: "مهام الرصد", nameEn: "Monitoring Jobs" },
  { resourceId: "page:alert-channels", name: "قنوات التنبيه", nameEn: "Alert Channels" },
  { resourceId: "page:scheduled-reports", name: "التقارير المجدولة", nameEn: "Scheduled Reports" },
  { resourceId: "page:api-keys", name: "مفاتيح API", nameEn: "API Keys" },
  { resourceId: "page:data-retention", name: "سياسات الاحتفاظ", nameEn: "Data Retention" },
  { resourceId: "page:audit-log", name: "سجل التدقيق", nameEn: "Audit Log" },
  { resourceId: "page:documents-registry", name: "سجل التوثيقات", nameEn: "Documents Registry" },
  { resourceId: "page:user-management", name: "إدارة المستخدمين", nameEn: "User Management" },
  { resourceId: "page:knowledge-base", name: "قاعدة المعرفة", nameEn: "Knowledge Base" },
  { resourceId: "page:personality-scenarios", name: "سيناريوهات الشخصية", nameEn: "Personality Scenarios" },
  { resourceId: "page:training-center", name: "مركز التدريب", nameEn: "Training Center" },
  { resourceId: "page:settings", name: "الإعدادات", nameEn: "Settings" },
];

const FEATURE_PERMISSIONS = [
  { resourceId: "feature:ai-chat", name: "المحادثة الذكية", nameEn: "AI Chat" },
  { resourceId: "feature:sse-streaming", name: "البث المباشر", nameEn: "SSE Streaming" },
  { resourceId: "feature:pdf-export", name: "تصدير PDF", nameEn: "PDF Export" },
  { resourceId: "feature:csv-export", name: "تصدير CSV", nameEn: "CSV Export" },
  { resourceId: "feature:incident-certification", name: "توثيق حالات الرصد", nameEn: "Incident Certification" },
  { resourceId: "feature:live-scanning", name: "الرصد المباشر", nameEn: "Live Scanning" },
  { resourceId: "feature:ai-enrichment", name: "إثراء بالذكاء الاصطناعي", nameEn: "AI Enrichment" },
];

// ─── Role → Permission defaults ───
const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  "role-admin": ["view", "create", "edit", "delete", "manage", "export"],
  "role-analyst": ["view", "create", "edit", "export"],
  "role-viewer": ["view"],
  "role-guest": ["view"],
};

export async function seedAdminData(): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: "Database not available" };

  const now = Date.now();

  try {
    // 1. Seed Roles
    for (const role of DEFAULT_ROLES) {
      const existing = await db.select().from(adminRoles).where(eq(adminRoles.id, role.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(adminRoles).values({
          id: role.id,
          roleName: role.roleName,
          roleNameEn: role.roleNameEn,
          roleDescription: role.roleDescription,
          roleDescriptionEn: role.roleDescriptionEn,
          isSystem: role.isSystem,
          rolePriority: role.rolePriority,
          roleColor: role.roleColor,
          roleStatus: "active",
          roleCreatedAt: now,
          roleUpdatedAt: now,
        });
      }
    }

    // 2. Seed Permissions (pages × actions + features × actions)
    const allResources = [...PAGE_PERMISSIONS, ...FEATURE_PERMISSIONS];
    for (const res of allResources) {
      const resourceType = res.resourceId.startsWith("page:") ? "page" : "feature";
      const actions = resourceType === "page"
        ? ["view", "edit", "enable", "disable", "manage"] as const
        : ["view", "enable", "disable"] as const;
      for (const action of actions) {
        const permId = `perm-${res.resourceId}-${action}`;
        const existing = await db.select().from(adminPermissions).where(eq(adminPermissions.id, permId)).limit(1);
        if (existing.length === 0) {
          await db.insert(adminPermissions).values({
            id: permId,
            resourceType: resourceType as any,
            resourceId: res.resourceId,
            resourceName: res.name,
            resourceNameEn: res.nameEn,
            permAction: action as any,
            permDescription: `${action} ${res.nameEn}`,
            permCreatedAt: now,
          });
        }
      }
    }

    // 3. Seed Role Permissions
    for (const [roleId, actions] of Object.entries(ROLE_PERMISSION_MAP)) {
      const allPerms = await db.select().from(adminPermissions);
      for (const perm of allPerms) {
        if (actions.includes(perm.permAction) || (roleId === "role-admin" && perm.permAction === "manage")) {
          const rpId = `rp-${roleId}-${perm.id}`;
          const existing = await db.select().from(adminRolePermissions).where(eq(adminRolePermissions.id, rpId)).limit(1);
          if (existing.length === 0) {
            await db.insert(adminRolePermissions).values({
              id: rpId,
              rpRoleId: roleId,
              rpPermissionId: perm.id,
              rpEffect: "allow",
              rpCreatedAt: now,
            });
          }
        }
      }
    }

    // 4. Assign root admin user to super-admin role
    const rootUser = await db.select().from(platformUsers).where(eq(platformUsers.userId, "mruhaily")).limit(1);
    if (rootUser.length > 0) {
      const existing = await db.select().from(adminUserRoles)
        .where(eq(adminUserRoles.urUserId, rootUser[0].id)).limit(1);
      if (existing.length === 0) {
        await db.insert(adminUserRoles).values({
          id: `ur-${rootUser[0].id}-role-super-admin`,
          urUserId: rootUser[0].id,
          urRoleId: "role-super-admin",
          urAssignedAt: now,
        });
      }
    }

    // 5. Seed Feature Flags for all pages
    for (const page of PAGE_PERMISSIONS) {
      const ffKey = page.resourceId;
      const existing = await db.select().from(adminFeatureFlags).where(eq(adminFeatureFlags.ffKey, ffKey)).limit(1);
      if (existing.length === 0) {
        await db.insert(adminFeatureFlags).values({
          id: `ff-${ffKey}`,
          ffKey: ffKey,
          ffDisplayName: page.name,
          ffDisplayNameEn: page.nameEn,
          ffDescription: `التحكم في إظهار/إخفاء صفحة ${page.name}`,
          ffIsEnabled: 1,
          ffTargetType: "all",
          ffCreatedAt: now,
          ffUpdatedAt: now,
        });
      }
    }

    // 6. Seed Page Registry for CMS
    const PAGE_REGISTRY_ENTRIES = [
      { pageId: "national-overview", path: "/national-overview", nameAr: "النظرة الوطنية", nameEn: "National Overview", category: "main" as const, sortOrder: 1 },
      { pageId: "leaks", path: "/leaks", nameAr: "حالات الرصد", nameEn: "Leaks", category: "main" as const, sortOrder: 2 },
      { pageId: "leak-anatomy", path: "/leak-anatomy", nameAr: "تشريح حالة الرصد", nameEn: "Leak Anatomy", category: "analysis" as const, sortOrder: 3 },
      { pageId: "sector-analysis", path: "/sector-analysis", nameAr: "تحليل القطاعات", nameEn: "Sector Analysis", category: "analysis" as const, sortOrder: 4 },
      { pageId: "leak-timeline", path: "/leak-timeline", nameAr: "الجدول الزمني", nameEn: "Leak Timeline", category: "analysis" as const, sortOrder: 5 },
      { pageId: "threat-actors-analysis", path: "/threat-actors-analysis", nameAr: "تحليل الجهات المهددة", nameEn: "Threat Actors", category: "analysis" as const, sortOrder: 6 },
      { pageId: "impact-assessment", path: "/impact-assessment", nameAr: "تقييم الأثر", nameEn: "Impact Assessment", category: "analysis" as const, sortOrder: 7 },
      { pageId: "source-intelligence", path: "/source-intelligence", nameAr: "استخبارات المصادر", nameEn: "Source Intelligence", category: "monitoring" as const, sortOrder: 8 },
      { pageId: "geo-analysis", path: "/geo-analysis", nameAr: "التحليل الجغرافي", nameEn: "Geo Analysis", category: "analysis" as const, sortOrder: 9 },
      { pageId: "incident-compare", path: "/incident-compare", nameAr: "مقارنة الحالات", nameEn: "Incident Compare", category: "analysis" as const, sortOrder: 10 },
      { pageId: "smart-rasid", path: "/smart-rasid", nameAr: "راصد الذكي", nameEn: "Smart Rasid", category: "main" as const, sortOrder: 11 },
      { pageId: "live-scan", path: "/live-scan", nameAr: "الفحص المباشر", nameEn: "Live Scan", category: "monitoring" as const, sortOrder: 12 },
      { pageId: "telegram", path: "/telegram", nameAr: "مراقبة تيليجرام", nameEn: "Telegram Monitor", category: "monitoring" as const, sortOrder: 13 },
      { pageId: "darkweb", path: "/darkweb", nameAr: "مراقبة الدارك ويب", nameEn: "Dark Web Monitor", category: "monitoring" as const, sortOrder: 14 },
      { pageId: "paste-sites", path: "/paste-sites", nameAr: "مواقع اللصق", nameEn: "Paste Sites", category: "monitoring" as const, sortOrder: 15 },
      { pageId: "reports", path: "/reports", nameAr: "التقارير", nameEn: "Reports", category: "main" as const, sortOrder: 16 },
      { pageId: "settings", path: "/settings", nameAr: "الإعدادات", nameEn: "Settings", category: "admin" as const, sortOrder: 17 },
      { pageId: "admin-cms", path: "/admin/cms", nameAr: "إدارة المحتوى", nameEn: "CMS", category: "admin" as const, sortOrder: 18 },
      { pageId: "admin-control-panel", path: "/admin/control-panel", nameAr: "لوحة التحكم الرئيسية", nameEn: "Control Panel", category: "admin" as const, sortOrder: 19 },
    ];
    for (const page of PAGE_REGISTRY_ENTRIES) {
      const existing = await db.select().from(pageRegistry).where(eq(pageRegistry.pageId, page.pageId)).limit(1);
      if (existing.length === 0) {
        await db.insert(pageRegistry).values({
          pageId: page.pageId,
          path: page.path,
          nameAr: page.nameAr,
          nameEn: page.nameEn,
          category: page.category,
          sortOrder: page.sortOrder,
          isActive: 1,
        });
      }
    }

    // 7. Seed default AI personality config
    const AI_DEFAULTS = [
      { key: "system_prompt", value: "أنت راصد الذكي — مساعد أمن سيبراني متخصص في رصد وتحليل حالات تسرب البيانات.", type: "string" as const, desc: "التعليمات الأساسية لراصد الذكي" },
      { key: "personality_tone", value: "professional", type: "string" as const, desc: "نبرة الشخصية: professional / friendly / technical" },
      { key: "language_preference", value: "ar", type: "string" as const, desc: "اللغة المفضلة" },
      { key: "creativity_level", value: "0.3", type: "number" as const, desc: "مستوى الإبداع (temperature)" },
    ];
    for (const cfg of AI_DEFAULTS) {
      const existing = await db.select().from(aiPersonalityConfig).where(eq(aiPersonalityConfig.configKey, cfg.key)).limit(1);
      if (existing.length === 0) {
        await db.insert(aiPersonalityConfig).values({
          configKey: cfg.key,
          configValue: cfg.value,
          configType: cfg.type,
          description: cfg.desc,
        });
      }
    }

    // 8. Seed default platform settings
    const PLATFORM_SETTINGS = [
      { key: "platform_name", value: "\u0631\u0627\u0635\u062f", type: "string" as const, label: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u0635\u0629", cat: "general", sort: 1 },
      { key: "platform_name_en", value: "Rasid", type: "string" as const, label: "Platform Name (EN)", cat: "general", sort: 2 },
      { key: "default_language", value: "ar", type: "string" as const, label: "\u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629", cat: "general", sort: 3 },
      { key: "session_timeout_hours", value: "8", type: "number" as const, label: "\u0645\u062f\u0629 \u0627\u0644\u062c\u0644\u0633\u0629 (\u0633\u0627\u0639\u0627\u062a)", cat: "security", sort: 1 },
      { key: "max_login_attempts", value: "5", type: "number" as const, label: "\u0623\u0642\u0635\u0649 \u0645\u062d\u0627\u0648\u0644\u0627\u062a \u062f\u062e\u0648\u0644", cat: "security", sort: 2 },
      { key: "enforce_2fa", value: "false", type: "boolean" as const, label: "\u0625\u0644\u0632\u0627\u0645 \u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629 \u0627\u0644\u062b\u0646\u0627\u0626\u064a\u0629", cat: "security", sort: 3 },
      { key: "maintenance_mode", value: "false", type: "boolean" as const, label: "\u0648\u0636\u0639 \u0627\u0644\u0635\u064a\u0627\u0646\u0629", cat: "maintenance", sort: 1 },
      { key: "support_email", value: "support@rasid.sa", type: "string" as const, label: "\u0628\u0631\u064a\u062f \u0627\u0644\u062f\u0639\u0645", cat: "contact", sort: 1 },
    ];
    for (const s of PLATFORM_SETTINGS) {
      const existing = await db.select().from(platformSettings).where(eq(platformSettings.settingKey, s.key)).limit(1);
      if (existing.length === 0) {
        await db.insert(platformSettings).values({
          settingKey: s.key,
          settingValue: s.value,
          settingType: s.type,
          label: s.label,
          category: s.cat,
          sortOrder: s.sort,
          isEditable: 1,
        });
      }
    }

    // 9. Seed default templates
    const DEFAULT_TEMPLATES = [
      { id: "report-monthly", name: "Monthly Report", nameAr: "\u0627\u0644\u062a\u0642\u0631\u064a\u0631 \u0627\u0644\u0634\u0647\u0631\u064a", type: "report" as const, format: "pdf" as const, isDefault: 1 },
      { id: "report-executive", name: "Executive Brief", nameAr: "\u0627\u0644\u0645\u0644\u062e\u0635 \u0627\u0644\u062a\u0646\u0641\u064a\u0630\u064a", type: "report" as const, format: "pdf" as const, isDefault: 0 },
      { id: "notif-new-leak", name: "New Leak Alert", nameAr: "\u062a\u0646\u0628\u064a\u0647 \u062d\u0627\u0644\u0629 \u0631\u0635\u062f \u062c\u062f\u064a\u062f\u0629", type: "notification" as const, format: "email" as const, isDefault: 1 },
      { id: "export-full", name: "Full Export", nameAr: "\u062a\u0635\u062f\u064a\u0631 \u0643\u0627\u0645\u0644", type: "export" as const, format: "xlsx" as const, isDefault: 1 },
    ];
    for (const t of DEFAULT_TEMPLATES) {
      const existing = await db.select().from(templates).where(eq(templates.templateId, t.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(templates).values({
          templateId: t.id,
          name: t.name,
          nameAr: t.nameAr,
          type: t.type,
          format: t.format,
          isDefault: t.isDefault,
          isActive: 1,
          content: "",
        });
      }
    }

    // 10. Seed default notification rules
    const DEFAULT_NOTIF_RULES = [
      { id: "rule-new-leak", name: "New Leak Alert", nameAr: "\u062a\u0646\u0628\u064a\u0647 \u062d\u0627\u0644\u0629 \u0631\u0635\u062f \u062c\u062f\u064a\u062f\u0629", trigger: "new_leak" },
      { id: "rule-high-sev", name: "High Severity Alert", nameAr: "\u062a\u0646\u0628\u064a\u0647 \u062e\u0637\u0648\u0631\u0629 \u0639\u0627\u0644\u064a\u0629", trigger: "high_severity" },
      { id: "rule-system-error", name: "System Error Alert", nameAr: "\u062a\u0646\u0628\u064a\u0647 \u062e\u0637\u0623 \u0646\u0638\u0627\u0645", trigger: "system_error" },
    ];
    for (const r of DEFAULT_NOTIF_RULES) {
      const existing = await db.select().from(notificationRules).where(eq(notificationRules.ruleId, r.id)).limit(1);
      if (existing.length === 0) {
        await db.insert(notificationRules).values({
          ruleId: r.id,
          name: r.name,
          nameAr: r.nameAr,
          trigger: r.trigger as any,
          channels: JSON.stringify(["in_app", "email"]),
          recipients: JSON.stringify(["admin"]),
          isActive: 1,
        });
      }
    }

    // 11. Seed default dashboard layout
    const existingLayout = await db.select().from(dashboardLayouts).where(eq(dashboardLayouts.name, "default-global")).limit(1);
    if (existingLayout.length === 0) {
      await db.insert(dashboardLayouts).values({
        name: "default-global",
        nameAr: "التخطيط الافتراضي",
        dataSource: "dashboard",
        layout: JSON.stringify([
          { widgetId: "stats-cards", size: "full", visible: true },
          { widgetId: "severity-chart", size: "half", visible: true },
          { widgetId: "timeline-chart", size: "half", visible: true },
          { widgetId: "world-heatmap", size: "full", visible: true },
          { widgetId: "activity-feed", size: "half", visible: true },
          { widgetId: "trend-predictions", size: "half", visible: true },
        ]),
        isDefault: 1,
        isTemplate: 1,
        isLocked: 0,
      });
    }

    // 12. Seed page registry entries for new admin pages
    const NEW_ADMIN_PAGES = [
      { pageId: "admin-settings", path: "/admin/settings", nameAr: "\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645", nameEn: "System Settings", category: "admin" as const, sortOrder: 20 },
      { pageId: "admin-operations", path: "/admin/operations", nameAr: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a", nameEn: "Operations Center", category: "admin" as const, sortOrder: 21 },
    ];
    for (const page of NEW_ADMIN_PAGES) {
      const existing = await db.select().from(pageRegistry).where(eq(pageRegistry.pageId, page.pageId)).limit(1);
      if (existing.length === 0) {
        await db.insert(pageRegistry).values({
          pageId: page.pageId,
          path: page.path,
          nameAr: page.nameAr,
          nameEn: page.nameEn,
          category: page.category,
          sortOrder: page.sortOrder,
          isActive: 1,
        });
      }
    }

    return { success: true, message: `Seeded: ${DEFAULT_ROLES.length} roles, ${allResources.length * 5} permissions, feature flags for ${PAGE_PERMISSIONS.length} pages, ${PAGE_REGISTRY_ENTRIES.length + NEW_ADMIN_PAGES.length} page registry entries, ${AI_DEFAULTS.length} AI configs, ${PLATFORM_SETTINGS.length} platform settings, ${DEFAULT_TEMPLATES.length} templates, ${DEFAULT_NOTIF_RULES.length} notification rules, 1 dashboard layout` };
  } catch (error) {
    console.error("[AdminSeed] Error:", error);
    return { success: false, message: String(error) };
  }
}
