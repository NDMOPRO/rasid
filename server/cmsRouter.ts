/**
 * CMS Router — tRPC procedures for Content Management System
 * Handles: Leaks CRUD, publish/unpublish, import, export, stats
 */
import { z } from "zod";
import { router, adminProcedure, rootAdminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, like, count, sql, type SQL } from "drizzle-orm";
import { getDb } from "./db";
import {
  leaks, importJobs, exportJobs, platformUsers, reports,
  knowledgeBase, auditLog,
} from "../drizzle/schema";
import { processExport, getExportJobs, getExportJobStatus } from "./exportEngine";
import { getImportJobs, getImportJobStatus, processImport, processPrivacyImport } from "./importEngine";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export const cmsRouter = router({
  // ═══════════════════════════════════════════════════════════════
  // ═══ Leaks Management ═════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  leaks: router({
    listAll: adminProcedure.input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      publishStatus: z.enum(["draft", "pending_review", "published", "archived"]).optional(),
      search: z.string().optional(),
      severity: z.string().optional(),
      sector: z.string().optional(),
      source: z.string().optional(),
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { items: [], total: 0 };

      const conditions: SQL[] = [];
      if (input.publishStatus) {
        conditions.push(eq(leaks.publishStatus, input.publishStatus));
      }
      if (input.severity && input.severity !== "all") {
        conditions.push(eq(leaks.severity, input.severity as any));
      }
      if (input.source && input.source !== "all") {
        conditions.push(eq(leaks.source, input.source as any));
      }
      if (input.sector) {
        conditions.push(like(leaks.sectorAr, `%${input.sector}%`));
      }
      if (input.search) {
        conditions.push(
          sql`(${leaks.title} LIKE ${`%${input.search}%`} OR ${leaks.titleAr} LIKE ${`%${input.search}%`} OR ${leaks.leakId} LIKE ${`%${input.search}%`})`
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const offset = (input.page - 1) * input.limit;

      const [items, [totalResult]] = await Promise.all([
        db.select().from(leaks).where(where).orderBy(desc(leaks.detectedAt)).limit(input.limit).offset(offset),
        db.select({ count: count() }).from(leaks).where(where),
      ]);

      return { items, total: totalResult.count };
    }),

    updatePublishStatus: adminProcedure.input(z.object({
      ids: z.array(z.number()),
      status: z.enum(["draft", "pending_review", "published", "archived"]),
      reviewNotes: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const updateData: any = {
        publishStatus: input.status,
        reviewNotes: input.reviewNotes || null,
      };

      if (input.status === "published") {
        updateData.publishedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
        updateData.publishedBy = (ctx as any).platformUser?.id || null;
      }

      for (const id of input.ids) {
        await db.update(leaks).set(updateData).where(eq(leaks.id, id));
      }

      return { success: true, updated: input.ids.length };
    }),

    bulkDelete: adminProcedure.input(z.object({
      ids: z.array(z.number()),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      for (const id of input.ids) {
        await db.delete(leaks).where(eq(leaks.id, id));
      }

      return { success: true, deleted: input.ids.length };
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      data: z.record(z.string(), z.any()),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const { id, data } = input;
      // Remove fields that shouldn't be updated directly
      delete data.id;
      delete data.createdAt;

      await db.update(leaks).set(data).where(eq(leaks.id, id));
      return { success: true };
    }),

    create: adminProcedure.input(z.object({
      leakId: z.string().optional(),
      title: z.string(),
      titleAr: z.string(),
      source: z.enum(["telegram", "darkweb", "paste"]),
      severity: z.enum(["critical", "high", "medium", "low"]),
      sector: z.string(),
      sectorAr: z.string(),
      piiTypes: z.array(z.string()).default([]),
      recordCount: z.number().default(0),
      status: z.enum(["new", "analyzing", "documented", "reported"]).default("new"),
      description: z.string().optional(),
      descriptionAr: z.string().optional(),
      sourceUrl: z.string().optional(),
      threatActor: z.string().optional(),
      leakPrice: z.string().optional(),
      breachMethod: z.string().optional(),
      breachMethodAr: z.string().optional(),
      region: z.string().optional(),
      regionAr: z.string().optional(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const leakId = input.leakId || `LK-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;

      await db.insert(leaks).values({
        ...input,
        leakId,
        piiTypes: input.piiTypes,
        publishStatus: "draft",
      });

      return { success: true, leakId };
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Import ═══════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  importData: adminProcedure.input(z.object({
    fileName: z.string(),
    fileType: z.enum(["json", "csv", "xlsx", "zip"]),
    content: z.string(),
    platform: z.enum(["leaks", "privacy"]),
  })).mutation(async ({ ctx, input }) => {
    const user = (ctx as any).platformUser;
    const userId = user?.id || 0;
    const userName = user?.displayName || "Admin";

    // Write content to temp file
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `import_${Date.now()}_${input.fileName}`);

    if (input.fileType === "json" || input.fileType === "csv") {
      fs.writeFileSync(tmpFile, input.content, "utf-8");
    } else {
      // Base64-encoded binary
      const buffer = Buffer.from(input.content, "base64");
      fs.writeFileSync(tmpFile, buffer);
    }

    try {
      if (input.platform === "privacy") {
        return await processPrivacyImport(tmpFile, input.fileType as "json" | "csv" | "xlsx", userId, userName);
      } else {
        return await processImport(tmpFile, input.fileType as "json" | "csv" | "xlsx" | "zip", userId, userName);
      }
    } catch (err: any) {
      // Clean up temp file on error
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `فشل الاستيراد: ${err.message}`,
      });
    }
  }),

  import: router({
    getJobs: adminProcedure.query(async () => {
      return getImportJobs();
    }),

    getJobStatus: adminProcedure.input(z.object({
      jobId: z.string(),
    })).query(async ({ input }) => {
      return getImportJobStatus(input.jobId);
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Export ═══════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  export: router({
    start: adminProcedure.input(z.object({
      type: z.enum(["full_platform", "section", "page", "single_record", "custom_query"]),
      format: z.enum(["zip", "json", "xlsx", "csv", "pdf"]),
      scope: z.string().optional(),
      filters: z.record(z.string(), z.any()).optional(),
    })).mutation(async ({ ctx, input }) => {
      const user = (ctx as any).platformUser;
      return processExport({
        ...input,
        userId: user?.id || 0,
        userName: user?.displayName || "Admin",
      });
    }),

    getJobs: adminProcedure.query(async () => {
      return getExportJobs();
    }),

    getJobStatus: adminProcedure.input(z.object({
      jobId: z.string(),
    })).query(async ({ input }) => {
      return getExportJobStatus(input.jobId);
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Users Management ═════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  users: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select({
        id: platformUsers.id,
        userId: platformUsers.userId,
        name: platformUsers.name,
        displayName: platformUsers.displayName,
        email: platformUsers.email,
        mobile: platformUsers.mobile,
        platformRole: platformUsers.platformRole,
        status: platformUsers.status,
        lastLoginAt: platformUsers.lastLoginAt,
        createdAt: platformUsers.createdAt,
      }).from(platformUsers).orderBy(platformUsers.id);
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      data: z.object({
        displayName: z.string().optional(),
        email: z.string().optional(),
        mobile: z.string().optional(),
        platformRole: z.enum(["root_admin", "director", "vice_president", "manager", "analyst", "viewer"]).optional(),
        status: z.enum(["active", "inactive", "suspended"]).optional(),
      }),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.update(platformUsers).set(input.data).where(eq(platformUsers.id, input.id));
      return { success: true };
    }),

    delete: rootAdminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.delete(platformUsers).where(eq(platformUsers.id, input.id));
      return { success: true };
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Reports Management ═══════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  reports: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(reports).orderBy(desc(reports.id));
    }),

    delete: adminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.delete(reports).where(eq(reports.id, input.id));
      return { success: true };
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Knowledge Base Management ════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  knowledgeBase: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.id));
    }),

    delete: adminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.delete(knowledgeBase).where(eq(knowledgeBase.id, input.id));
      return { success: true };
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Stats ════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;

    const [totalLeaks] = await db.select({ count: count() }).from(leaks);
    const [publishedLeaks] = await db.select({ count: count() }).from(leaks).where(eq(leaks.publishStatus, "published"));
    const [draftLeaks] = await db.select({ count: count() }).from(leaks).where(eq(leaks.publishStatus, "draft"));
    const [pendingLeaks] = await db.select({ count: count() }).from(leaks).where(eq(leaks.publishStatus, "pending_review"));
    const [archivedLeaks] = await db.select({ count: count() }).from(leaks).where(eq(leaks.publishStatus, "archived"));
    const [totalImports] = await db.select({ count: count() }).from(importJobs);
    const [totalExports] = await db.select({ count: count() }).from(exportJobs);

    const lastImportArr = await db.select().from(importJobs).orderBy(desc(importJobs.id)).limit(1);
    const lastExportArr = await db.select().from(exportJobs).orderBy(desc(exportJobs.id)).limit(1);

    return {
      totalLeaks: totalLeaks.count,
      publishedLeaks: publishedLeaks.count,
      draftLeaks: draftLeaks.count,
      pendingLeaks: pendingLeaks.count,
      archivedLeaks: archivedLeaks.count,
      totalImports: totalImports.count,
      totalExports: totalExports.count,
      lastImport: lastImportArr[0] || null,
      lastExport: lastExportArr[0] || null,
    };
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Widget Data API — Real DB Data for Dynamic Dashboards ═══
  // ═══════════════════════════════════════════════════════════════
  widgetData: adminProcedure.input(z.object({
    widgetType: z.string(),
    workspace: z.enum(["leaks", "privacy"]),
    config: z.record(z.string(), z.any()).optional(),
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return { type: input.widgetType, data: null };

    const { widgetType, workspace } = input;

    if (workspace === "leaks") {
      switch (widgetType) {
        case "stat-card": {
          const [total] = await db.select({ count: count() }).from(leaks);
          const [critical] = await db.select({ count: count() }).from(leaks).where(eq(leaks.severity, "critical"));
          const [newLeaks] = await db.select({ count: count() }).from(leaks).where(eq(leaks.status, "new"));
          return {
            type: "stat-card",
            data: {
              total: total.count,
              critical: critical.count,
              new: newLeaks.count,
            },
          };
        }
        case "bar-chart":
        case "pie-chart": {
          const severityCounts = await db
            .select({ severity: leaks.severity, count: count() })
            .from(leaks)
            .groupBy(leaks.severity);
          return {
            type: widgetType,
            data: {
              labels: severityCounts.map((s) => s.severity),
              values: severityCounts.map((s) => s.count),
            },
          };
        }
        case "line-chart": {
          const monthly = await db
            .select({
              month: sql`DATE_FORMAT(${leaks.detectedAt}, '%Y-%m')`.as("month"),
              count: count(),
            })
            .from(leaks)
            .groupBy(sql`DATE_FORMAT(${leaks.detectedAt}, '%Y-%m')`)
            .orderBy(sql`DATE_FORMAT(${leaks.detectedAt}, '%Y-%m')`)
            .limit(12);
          return {
            type: "line-chart",
            data: {
              labels: monthly.map((m: any) => m.month),
              values: monthly.map((m: any) => m.count),
            },
          };
        }
        case "source-breakdown": {
          const sources = await db
            .select({ source: leaks.source, count: count() })
            .from(leaks)
            .groupBy(leaks.source);
          return {
            type: "source-breakdown",
            data: {
              labels: sources.map((s) => s.source),
              values: sources.map((s) => s.count),
              total: sources.reduce((a, b) => a + b.count, 0),
            },
          };
        }
        case "data-table": {
          const recentLeaks = await db.select({
            id: leaks.id,
            leakId: leaks.leakId,
            title: leaks.title,
            titleAr: leaks.titleAr,
            severity: leaks.severity,
            status: leaks.status,
            source: leaks.source,
          }).from(leaks).orderBy(desc(leaks.detectedAt)).limit(10);
          return {
            type: "data-table",
            data: { rows: recentLeaks },
          };
        }
        case "live-feed": {
          const latest = await db.select({
            id: leaks.id,
            leakId: leaks.leakId,
            titleAr: leaks.titleAr,
            severity: leaks.severity,
            detectedAt: leaks.detectedAt,
          }).from(leaks).orderBy(desc(leaks.detectedAt)).limit(5);
          return {
            type: "live-feed",
            data: { items: latest },
          };
        }
        default:
          return { type: widgetType, data: null };
      }
    } else {
      // Privacy workspace
      const sitesTable = (await import("../drizzle/schema")).sites;
      const scansTable = (await import("../drizzle/schema")).scans;
      switch (widgetType) {
        case "stat-card": {
          const [totalSites] = await db.select({ count: count() }).from(sitesTable);
          const [totalScans] = await db.select({ count: count() }).from(scansTable);
          return {
            type: "stat-card",
            data: {
              totalSites: totalSites.count,
              totalScans: totalScans.count,
            },
          };
        }
        case "bar-chart":
        case "pie-chart": {
          const sectorCounts = await db
            .select({ sectorType: sitesTable.sectorType, count: count() })
            .from(sitesTable)
            .groupBy(sitesTable.sectorType);
          return {
            type: widgetType,
            data: {
              labels: sectorCounts.map((s: any) => s.sectorType),
              values: sectorCounts.map((s: any) => s.count),
            },
          };
        }
        case "line-chart": {
          const monthly = await db
            .select({
              month: sql`DATE_FORMAT(${scansTable.scanDate}, '%Y-%m')`.as("month"),
              count: count(),
            })
            .from(scansTable)
            .groupBy(sql`DATE_FORMAT(${scansTable.scanDate}, '%Y-%m')`)
            .orderBy(sql`DATE_FORMAT(${scansTable.scanDate}, '%Y-%m')`)
            .limit(12);
          return {
            type: "line-chart",
            data: {
              labels: monthly.map((m: any) => m.month),
              values: monthly.map((m: any) => m.count),
            },
          };
        }
        case "source-breakdown": {
          const sectors = await db
            .select({ sectorType: sitesTable.sectorType, count: count() })
            .from(sitesTable)
            .groupBy(sitesTable.sectorType);
          return {
            type: "source-breakdown",
            data: {
              labels: sectors.map((s: any) => s.sectorType || "غير محدد"),
              values: sectors.map((s: any) => s.count),
              total: sectors.reduce((a: number, b: any) => a + b.count, 0),
            },
          };
        }
        case "live-feed": {
          const latestScans = await db.select({
            id: scansTable.id,
            domain: scansTable.domain,
            complianceStatus: scansTable.complianceStatus,
            scanDate: scansTable.scanDate,
          }).from(scansTable).orderBy(desc(scansTable.scanDate)).limit(5);
          return {
            type: "live-feed",
            data: {
              items: latestScans.map((s: any) => ({
                severity: s.complianceStatus === "compliant" ? "low" : s.complianceStatus === "partially_compliant" ? "medium" : "critical",
                titleAr: s.domain,
                leakId: `SCAN-${s.id}`,
              })),
            },
          };
        }
        case "data-table": {
          const recentSites = await db.select({
            id: sitesTable.id,
            domain: sitesTable.domain,
            siteName: sitesTable.siteName,
            sectorType: sitesTable.sectorType,
            complianceStatus: sitesTable.complianceStatus,
          }).from(sitesTable).limit(10);
          return {
            type: "data-table",
            data: { rows: recentSites },
          };
        }
        default:
          return { type: widgetType, data: null };
      }
    }
  }),
});
