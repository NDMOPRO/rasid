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

    return { success: true, message: `Seeded: ${DEFAULT_ROLES.length} roles, ${allResources.length * 5} permissions, feature flags for ${PAGE_PERMISSIONS.length} pages, ${PAGE_REGISTRY_ENTRIES.length} page registry entries, ${AI_DEFAULTS.length} AI configs` };
  } catch (error) {
    console.error("[AdminSeed] Error:", error);
    return { success: false, message: String(error) };
  }
}
