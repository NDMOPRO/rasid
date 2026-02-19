/**
 * operationsRouter.ts — مركز العمليات
 * الأقسام: صحة النظام | الإشعارات المتقدمة | النسخ الاحتياطي | الجلسات | سجل التدقيق | البذر | تخصيص لوحة القيادة
 * rootAdminProcedure فقط
 */

import { z } from "zod";
import { router, rootAdminProcedure } from "./_core/trpc";
import { eq, desc, sql, like, and, or, count, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import {
  systemHealthLog, notificationRules, notificationLog,
  backups, userSessions, dashboardLayouts,
  adminAuditLogs, platformSettings, users,
  leaks, platformUsers,
} from "../drizzle/schema";

export const operationsRouter = router({
  // ═══════════════════════════════════════════
  // القسم 7: صحة النظام (System Health)
  // ═══════════════════════════════════════════

  getHealthStatus: rootAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { services: [], lastCheck: null };
    // Get latest health check for each service
    const services = ["database", "llm", "api", "railway"] as const;
    const results = [];
    for (const svc of services) {
      const [latest] = await db.select().from(systemHealthLog)
        .where(eq(systemHealthLog.service, svc))
        .orderBy(desc(systemHealthLog.checkedAt))
        .limit(1);
      results.push({
        service: svc,
        status: latest?.status ?? "unknown",
        responseTime: latest?.responseTime ?? null,
        errorMessage: latest?.errorMessage ?? null,
        lastChecked: latest?.checkedAt ?? null,
      });
    }
    return { services: results, lastCheck: results[0]?.lastChecked };
  }),

  runHealthCheck: rootAdminProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: false, results: [] };
    const results: Array<{ service: string; status: string; responseTime: number; error?: string }> = [];

    // 1. Database check
    try {
      const start = Date.now();
      await db.execute(sql`SELECT 1`);
      const elapsed = Date.now() - start;
      await db.insert(systemHealthLog).values({
        service: "database", status: "healthy", responseTime: elapsed,
      });
      results.push({ service: "database", status: "healthy", responseTime: elapsed });
    } catch (err: any) {
      await db.insert(systemHealthLog).values({
        service: "database", status: "down", responseTime: 0, errorMessage: err.message,
      });
      results.push({ service: "database", status: "down", responseTime: 0, error: err.message });
    }

    // 2. LLM check (OpenAI-compatible)
    try {
      const start = Date.now();
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(10000),
        });
        const elapsed = Date.now() - start;
        const status = res.ok ? "healthy" : "degraded";
        await db.insert(systemHealthLog).values({
          service: "llm", status, responseTime: elapsed,
          errorMessage: res.ok ? null : `HTTP ${res.status}`,
        });
        results.push({ service: "llm", status, responseTime: elapsed });
      } else {
        await db.insert(systemHealthLog).values({
          service: "llm", status: "down", responseTime: 0, errorMessage: "لا يوجد مفتاح API",
        });
        results.push({ service: "llm", status: "down", responseTime: 0, error: "لا يوجد مفتاح API" });
      }
    } catch (err: any) {
      await db.insert(systemHealthLog).values({
        service: "llm", status: "down", responseTime: 0, errorMessage: err.message,
      });
      results.push({ service: "llm", status: "down", responseTime: 0, error: err.message });
    }

    // 3. Railway / App check
    try {
      const start = Date.now();
      const elapsed = Date.now() - start;
      const uptime = process.uptime();
      const memUsage = process.memoryUsage();
      await db.insert(systemHealthLog).values({
        service: "railway", status: "healthy", responseTime: elapsed,
        metadata: { uptime: Math.round(uptime), memoryMB: Math.round(memUsage.heapUsed / 1024 / 1024) },
      });
      results.push({ service: "railway", status: "healthy", responseTime: elapsed });
    } catch (err: any) {
      results.push({ service: "railway", status: "down", responseTime: 0, error: err.message });
    }

    return { success: true, results };
  }),

  getHealthHistory: rootAdminProcedure
    .input(z.object({
      service: z.enum(["database", "llm", "api", "railway"]).optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.service) conditions.push(eq(systemHealthLog.service, input.service));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const rows = await db.select().from(systemHealthLog)
        .where(where)
        .orderBy(desc(systemHealthLog.checkedAt))
        .limit(input?.limit ?? 50);
      return rows;
    }),

  // ═══════════════════════════════════════════
  // القسم 8: الإشعارات المتقدمة (Notifications)
  // ═══════════════════════════════════════════

  getNotificationRules: rootAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(notificationRules);
    return rows;
  }),

  upsertNotificationRule: rootAdminProcedure
    .input(z.object({
      ruleId: z.string().min(1),
      name: z.string().min(1),
      nameAr: z.string().min(1),
      trigger: z.string(),
      conditions: z.any().optional(),
      channels: z.any(),
      recipients: z.any(),
      templateId: z.string().optional(),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const existing = await db.select().from(notificationRules)
        .where(eq(notificationRules.ruleId, input.ruleId)).limit(1);

      if (existing.length > 0) {
        await db.update(notificationRules).set({
          name: input.name,
          nameAr: input.nameAr,
          trigger: input.trigger as any,
          conditions: input.conditions ?? null,
          channels: input.channels,
          recipients: input.recipients,
          templateId: input.templateId ?? null,
          isActive: input.isActive ? 1 : 0,
        }).where(eq(notificationRules.ruleId, input.ruleId));
      } else {
        await db.insert(notificationRules).values({
          ruleId: input.ruleId,
          name: input.name,
          nameAr: input.nameAr,
          trigger: input.trigger as any,
          conditions: input.conditions ?? null,
          channels: input.channels,
          recipients: input.recipients,
          templateId: input.templateId ?? null,
          isActive: input.isActive ? 1 : 0,
          createdBy: ctx.user?.id ?? null,
        });
      }
      return { success: true };
    }),

  deleteNotificationRule: rootAdminProcedure
    .input(z.object({ ruleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(notificationRules).where(eq(notificationRules.ruleId, input.ruleId));
      return { success: true };
    }),

  getNotificationLog: rootAdminProcedure
    .input(z.object({
      limit: z.number().default(50),
      channel: z.string().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.channel) conditions.push(eq(notificationLog.channel, input.channel as any));
      if (input?.status) conditions.push(eq(notificationLog.status, input.status as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const rows = await db.select().from(notificationLog)
        .where(where)
        .orderBy(desc(notificationLog.sentAt))
        .limit(input?.limit ?? 50);
      return rows;
    }),

  // ═══════════════════════════════════════════
  // القسم 9: النسخ الاحتياطي (Backup & Restore)
  // ═══════════════════════════════════════════

  getBackups: rootAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(backups).orderBy(desc(backups.createdAt));
    return rows;
  }),

  createBackup: rootAdminProcedure
    .input(z.object({
      type: z.enum(["full", "incremental", "config_only"]).default("full"),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const backupName = input.name || `backup-${input.type}-${new Date().toISOString().split("T")[0]}`;
      await db.insert(backups).values({
        name: backupName,
        type: input.type,
        status: "pending",
        createdBy: ctx.user?.id ?? null,
      });
      // Note: actual backup execution (mysqldump) would be triggered by a background worker
      return { success: true, name: backupName };
    }),

  deleteBackup: rootAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(backups).where(eq(backups.id, input.id));
      return { success: true };
    }),

  // ═══════════════════════════════════════════
  // القسم 10: إدارة الجلسات (Session Management)
  // ═══════════════════════════════════════════

  getActiveSessions: rootAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select({
      id: userSessions.id,
      userId: userSessions.userId,
      deviceInfo: userSessions.deviceInfo,
      ipAddress: userSessions.ipAddress,
      isActive: userSessions.isActive,
      lastActivity: userSessions.lastActivity,
      createdAt: userSessions.createdAt,
      expiresAt: userSessions.expiresAt,
    }).from(userSessions)
      .where(eq(userSessions.isActive, 1))
      .orderBy(desc(userSessions.lastActivity));
    return rows;
  }),

  terminateSession: rootAdminProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(userSessions)
        .set({ isActive: 0 })
        .where(eq(userSessions.id, input.sessionId));
      return { success: true };
    }),

  terminateAllSessions: rootAdminProcedure
    .input(z.object({ exceptSessionId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      if (input.exceptSessionId) {
        await db.execute(sql`UPDATE user_sessions SET isActive = 0 WHERE isActive = 1 AND id != ${input.exceptSessionId}`);
      } else {
        await db.update(userSessions).set({ isActive: 0 }).where(eq(userSessions.isActive, 1));
      }
      return { success: true };
    }),

  getSessionSettings: rootAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { sessionDuration: 8, maxDevices: 3, autoLogoutMinutes: 30 };
    // Read from platformSettings
    const keys = ["session_duration_hours", "max_devices_per_user", "auto_logout_minutes"];
    const rows = await db.select().from(platformSettings)
      .where(sql`${platformSettings.settingKey} IN (${sql.join(keys.map(k => sql`${k}`), sql`, `)})`);
    const map: Record<string, string> = {};
    rows.forEach(r => { map[r.settingKey] = r.settingValue ?? ""; });
    return {
      sessionDuration: parseInt(map.session_duration_hours || "8"),
      maxDevices: parseInt(map.max_devices_per_user || "3"),
      autoLogoutMinutes: parseInt(map.auto_logout_minutes || "30"),
    };
  }),

  updateSessionSettings: rootAdminProcedure
    .input(z.object({
      sessionDuration: z.number().min(1).max(72),
      maxDevices: z.number().min(1).max(10),
      autoLogoutMinutes: z.number().min(5).max(480),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const updates = [
        { key: "session_duration_hours", value: String(input.sessionDuration) },
        { key: "max_devices_per_user", value: String(input.maxDevices) },
        { key: "auto_logout_minutes", value: String(input.autoLogoutMinutes) },
      ];
      for (const u of updates) {
        await db.update(platformSettings)
          .set({ settingValue: u.value, updatedBy: ctx.user?.id ?? null })
          .where(eq(platformSettings.settingKey, u.key));
      }
      return { success: true };
    }),

  // ═══════════════════════════════════════════
  // القسم 11: سجل التدقيق المتقدم (Advanced Audit)
  // ═══════════════════════════════════════════

  getAuditLogs: rootAdminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      search: z.string().optional(),
      userId: z.number().optional(),
      action: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { logs: [], total: 0 };
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.search) {
        conditions.push(or(
          like(adminAuditLogs.aalAction, `%${input.search}%`),
          like(adminAuditLogs.aalUserName, `%${input.search}%`),
          like(adminAuditLogs.aalResourceName, `%${input.search}%`),
        ));
      }
      if (input?.userId) conditions.push(eq(adminAuditLogs.aalUserId, input.userId));
      if (input?.action) conditions.push(eq(adminAuditLogs.aalAction, input.action));
      if (input?.dateFrom) conditions.push(gte(adminAuditLogs.aalCreatedAt, new Date(input.dateFrom).getTime()));
      if (input?.dateTo) conditions.push(lte(adminAuditLogs.aalCreatedAt, new Date(input.dateTo).getTime()));

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const [totalResult] = await db.select({ count: count() }).from(adminAuditLogs).where(where);
      const logs = await db.select().from(adminAuditLogs)
        .where(where)
        .orderBy(desc(adminAuditLogs.aalCreatedAt))
        .limit(limit)
        .offset(offset);

      return { logs, total: totalResult.count };
    }),

  getAuditRetentionSettings: rootAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { retentionDays: 365, autoDelete: true };
    const rows = await db.select().from(platformSettings)
      .where(sql`${platformSettings.settingKey} IN ('audit_retention_days', 'audit_auto_delete')`);
    const map: Record<string, string> = {};
    rows.forEach(r => { map[r.settingKey] = r.settingValue ?? ""; });
    return {
      retentionDays: parseInt(map.audit_retention_days || "365"),
      autoDelete: map.audit_auto_delete !== "false",
    };
  }),

  updateAuditRetention: rootAdminProcedure
    .input(z.object({
      retentionDays: z.number().min(30).max(3650),
      autoDelete: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const updates = [
        { key: "audit_retention_days", value: String(input.retentionDays) },
        { key: "audit_auto_delete", value: String(input.autoDelete) },
      ];
      for (const u of updates) {
        await db.update(platformSettings)
          .set({ settingValue: u.value, updatedBy: ctx.user?.id ?? null })
          .where(eq(platformSettings.settingKey, u.key));
      }
      return { success: true };
    }),

  // ═══════════════════════════════════════════
  // القسم 12: بيانات البذر (Seed Data)
  // ═══════════════════════════════════════════

  getDbStats: rootAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { tables: 0, leaksCount: 0, usersCount: 0 };
    try {
      const [leaksCount] = await db.select({ count: count() }).from(leaks);
      const [usersCount] = await db.select({ count: count() }).from(platformUsers);
      // Count tables
      const tablesResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE()`);
      const tableCount = Number((tablesResult as any)[0]?.[0]?.cnt || 0);
      return {
        tables: tableCount,
        leaksCount: leaksCount.count,
        usersCount: usersCount.count,
      };
    } catch {
      return { tables: 0, leaksCount: 0, usersCount: 0 };
    }
  }),

  deleteAllLeaks: rootAdminProcedure
    .input(z.object({ confirmPhrase: z.literal("أؤكد حذف جميع حالات الرصد") }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(leaks);
      return { success: true };
    }),

  deleteTestData: rootAdminProcedure
    .input(z.object({ confirmPhrase: z.literal("أؤكد حذف بيانات الاختبار") }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      // Delete leaks that have test-related source
      await db.execute(sql`DELETE FROM leaks WHERE source LIKE '%test%' OR source LIKE '%seed%'`);
      return { success: true };
    }),

  // ═══════════════════════════════════════════
  // القسم 13: تخصيص لوحة القيادة (Dashboard Layouts)
  // ═══════════════════════════════════════════

  getDashboardLayouts: rootAdminProcedure
    .input(z.object({
      targetRole: z.string().optional(),
      isTemplate: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.targetRole) conditions.push(eq(dashboardLayouts.targetRole, input.targetRole));
      if (input?.isTemplate !== undefined) conditions.push(eq(dashboardLayouts.isTemplate, input.isTemplate ? 1 : 0));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const rows = await db.select().from(dashboardLayouts).where(where);
      return rows;
    }),

  upsertDashboardLayout: rootAdminProcedure
    .input(z.object({
      id: z.number().optional(),
      name: z.string().min(1),
      nameAr: z.string().min(1),
      dataSource: z.string().optional(),
      layout: z.any(),
      filters: z.any().optional(),
      isDefault: z.boolean().default(false),
      isTemplate: z.boolean().default(false),
      isLocked: z.boolean().default(false),
      targetRole: z.string().optional(),
      targetGroupId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      if (input.id) {
        await db.update(dashboardLayouts).set({
          name: input.name,
          nameAr: input.nameAr,
          dataSource: input.dataSource ?? null,
          layout: input.layout,
          filters: input.filters ?? null,
          isDefault: input.isDefault ? 1 : 0,
          isTemplate: input.isTemplate ? 1 : 0,
          isLocked: input.isLocked ? 1 : 0,
          targetRole: input.targetRole ?? null,
          targetGroupId: input.targetGroupId ?? null,
        }).where(eq(dashboardLayouts.id, input.id));
      } else {
        await db.insert(dashboardLayouts).values({
          name: input.name,
          nameAr: input.nameAr,
          userId: ctx.user?.id ?? null,
          dataSource: input.dataSource ?? null,
          layout: input.layout,
          filters: input.filters ?? null,
          isDefault: input.isDefault ? 1 : 0,
          isTemplate: input.isTemplate ? 1 : 0,
          isLocked: input.isLocked ? 1 : 0,
          targetRole: input.targetRole ?? null,
          targetGroupId: input.targetGroupId ?? null,
        });
      }
      return { success: true };
    }),

  deleteDashboardLayout: rootAdminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(dashboardLayouts).where(eq(dashboardLayouts.id, input.id));
      return { success: true };
    }),
});
