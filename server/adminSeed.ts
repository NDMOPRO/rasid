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
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── Default Roles ───
const DEFAULT_ROLES = [
  { id: "role-super-admin", name: "مدير النظام الأعلى", nameEn: "Super Admin", description: "صلاحيات كاملة بدون قيود", descriptionEn: "Full unrestricted access", isSystem: true, priority: 100, color: "#ef4444" },
  { id: "role-admin", name: "مدير النظام", nameEn: "Admin", description: "إدارة كاملة مع بعض القيود", descriptionEn: "Full management with some restrictions", isSystem: true, priority: 80, color: "#f59e0b" },
  { id: "role-analyst", name: "محلل", nameEn: "Analyst", description: "عرض وتحليل البيانات والتقارير", descriptionEn: "View and analyze data and reports", isSystem: true, priority: 60, color: "#3b82f6" },
  { id: "role-viewer", name: "مشاهد", nameEn: "Viewer", description: "عرض البيانات فقط بدون تعديل", descriptionEn: "View-only access", isSystem: true, priority: 40, color: "#6b7280" },
  { id: "role-guest", name: "زائر", nameEn: "Guest", description: "وصول محدود جداً", descriptionEn: "Very limited access", isSystem: true, priority: 20, color: "#9ca3af" },
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

const ACTIONS = ["view", "create", "edit", "delete", "manage", "export"] as const;

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
          ...role,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 2. Seed Permissions (pages × actions + features × actions)
    const allResources = [...PAGE_PERMISSIONS, ...FEATURE_PERMISSIONS];
    for (const res of allResources) {
      const resourceType = res.resourceId.startsWith("page:") ? "page" : "feature";
      const actions = resourceType === "page" ? ["view", "edit", "enable", "disable", "manage"] : ["view", "enable", "disable"];
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
            action: action as any,
            description: `${action} ${res.nameEn}`,
            createdAt: now,
          });
        }
      }
    }

    // 3. Seed Role Permissions
    for (const [roleId, actions] of Object.entries(ROLE_PERMISSION_MAP)) {
      const allPerms = await db.select().from(adminPermissions);
      for (const perm of allPerms) {
        if (actions.includes(perm.action) || (roleId === "role-admin" && perm.action === "manage")) {
          const rpId = `rp-${roleId}-${perm.id}`;
          const existing = await db.select().from(adminRolePermissions).where(eq(adminRolePermissions.id, rpId)).limit(1);
          if (existing.length === 0) {
            await db.insert(adminRolePermissions).values({
              id: rpId,
              roleId,
              permissionId: perm.id,
              effect: "allow",
              createdAt: now,
            });
          }
        }
      }
    }

    // 4. Assign root admin user to super-admin role
    const rootUser = await db.select().from(platformUsers).where(eq(platformUsers.userId, "mruhaily")).limit(1);
    if (rootUser.length > 0) {
      const existing = await db.select().from(adminUserRoles)
        .where(eq(adminUserRoles.userId, rootUser[0].id)).limit(1);
      if (existing.length === 0) {
        await db.insert(adminUserRoles).values({
          id: `ur-${rootUser[0].id}-role-super-admin`,
          userId: rootUser[0].id,
          roleId: "role-super-admin",
          assignedAt: now,
        });
      }
    }

    // 5. Seed Feature Flags for all pages
    for (const page of PAGE_PERMISSIONS) {
      const ffKey = page.resourceId;
      const existing = await db.select().from(adminFeatureFlags).where(eq(adminFeatureFlags.key, ffKey)).limit(1);
      if (existing.length === 0) {
        await db.insert(adminFeatureFlags).values({
          id: `ff-${ffKey}`,
          key: ffKey,
          displayName: page.name,
          displayNameEn: page.nameEn,
          description: `التحكم في إظهار/إخفاء صفحة ${page.name}`,
          isEnabled: true,
          targetType: "all",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { success: true, message: `Seeded: ${DEFAULT_ROLES.length} roles, ${allResources.length * 5} permissions, feature flags for ${PAGE_PERMISSIONS.length} pages` };
  } catch (error) {
    console.error("[AdminSeed] Error:", error);
    return { success: false, message: String(error) };
  }
}
