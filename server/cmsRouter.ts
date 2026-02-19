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
import { getImportJobs, getImportJobStatus } from "./importEngine";

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
});
