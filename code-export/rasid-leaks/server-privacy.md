# rasid-leaks - server-privacy

> Auto-extracted source code documentation

---

## `server/privacy/routers/privacyRouter.ts`

```typescript
/**
 * Privacy Workspace Router — APIs for privacy compliance features
 * DSAR, Consent, Processing Records, DPIA, Assessments, Mobile Apps
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, adminProcedure, privacyProcedure } from "../../_core/trpc";
import { eq, desc, and, count, sql, like, or } from "drizzle-orm";
import { db as drizzleDb } from "../../_core/drizzleDb";
import {
  dsarRequests,
  consentRecords,
  processingRecords,
  dpiaAssessments,
  privacyAssessments,
  mobileAppPrivacy,
} from "../../../drizzle/schema";

// ═══════════════════════════════════════════════════════════════
// DSAR Requests Router
// ═══════════════════════════════════════════════════════════════
const dsarRouter = router({
  list: privacyProcedure
    .input(z.object({
      status: z.string().optional(),
      requestType: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const filters: any[] = [];
      if (input?.status) filters.push(eq(dsarRequests.status, input.status as any));
      if (input?.requestType) filters.push(eq(dsarRequests.requestType, input.requestType as any));
      if (input?.search) {
        filters.push(or(
          like(dsarRequests.requesterName, `%${input.search}%`),
          like(dsarRequests.requestNumber, `%${input.search}%`),
          like(dsarRequests.entityName, `%${input.search}%`),
        ));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [items, [totalResult]] = await Promise.all([
        drizzleDb.select().from(dsarRequests).where(where).orderBy(desc(dsarRequests.createdAt)).limit(limit).offset((page - 1) * limit),
        drizzleDb.select({ count: count() }).from(dsarRequests).where(where),
      ]);

      // Stats
      const [pendingCount] = await drizzleDb.select({ count: count() }).from(dsarRequests).where(eq(dsarRequests.status, "pending"));
      const [overdueCount] = await drizzleDb.select({ count: count() }).from(dsarRequests).where(eq(dsarRequests.status, "overdue"));
      const [completedCount] = await drizzleDb.select({ count: count() }).from(dsarRequests).where(eq(dsarRequests.status, "completed"));

      return {
        requests: items,
        total: totalResult?.count ?? 0,
        stats: {
          total: totalResult?.count ?? 0,
          pending: pendingCount?.count ?? 0,
          overdue: overdueCount?.count ?? 0,
          completed: completedCount?.count ?? 0,
        },
      };
    }),

  create: privacyProcedure
    .input(z.object({
      requesterName: z.string().min(1),
      requesterEmail: z.string().email().optional(),
      requesterPhone: z.string().optional(),
      requestType: z.enum(["access", "correction", "deletion", "portability", "objection", "restriction"]),
      description: z.string().optional(),
      entityName: z.string().optional(),
      entityDomain: z.string().optional(),
      deadline: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const requestNumber = `DSAR-${Date.now().toString(36).toUpperCase()}`;
      const [result] = await drizzleDb.insert(dsarRequests).values({
        ...input,
        requestNumber,
        deadline: input.deadline ? new Date(input.deadline) : undefined,
      } as any);
      return { id: result.insertId, requestNumber };
    }),

  updateStatus: privacyProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "in_progress", "completed", "rejected", "overdue"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await drizzleDb.update(dsarRequests)
        .set({
          status: input.status,
          notes: input.notes,
          completedAt: input.status === "completed" ? new Date() : undefined,
          updatedAt: new Date(),
        } as any)
        .where(eq(dsarRequests.id, input.id));
      return { success: true };
    }),
});

// ═══════════════════════════════════════════════════════════════
// Consent Records Router
// ═══════════════════════════════════════════════════════════════
const consentRouter = router({
  list: privacyProcedure
    .input(z.object({
      status: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const filters: any[] = [];
      if (input?.status) filters.push(eq(consentRecords.status, input.status as any));
      if (input?.search) {
        filters.push(or(
          like(consentRecords.siteDomain, `%${input.search}%`),
          like(consentRecords.siteName, `%${input.search}%`),
        ));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [items, [totalResult]] = await Promise.all([
        drizzleDb.select().from(consentRecords).where(where).orderBy(desc(consentRecords.createdAt)).limit(limit).offset((page - 1) * limit),
        drizzleDb.select({ count: count() }).from(consentRecords).where(where),
      ]);

      const [activeCount] = await drizzleDb.select({ count: count() }).from(consentRecords).where(eq(consentRecords.status, "active"));
      const [notImplCount] = await drizzleDb.select({ count: count() }).from(consentRecords).where(eq(consentRecords.status, "not_implemented"));

      return {
        records: items,
        total: totalResult?.count ?? 0,
        stats: {
          total: totalResult?.count ?? 0,
          active: activeCount?.count ?? 0,
          notImplemented: notImplCount?.count ?? 0,
        },
      };
    }),

  create: privacyProcedure
    .input(z.object({
      siteDomain: z.string().min(1),
      siteName: z.string().optional(),
      consentType: z.enum(["cookie", "marketing", "analytics", "third_party", "data_processing", "other"]),
      status: z.enum(["active", "withdrawn", "expired", "not_implemented"]).default("not_implemented"),
      consentMechanism: z.string().optional(),
      consentText: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const [result] = await drizzleDb.insert(consentRecords).values(input as any);
      return { id: result.insertId };
    }),

  update: privacyProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "withdrawn", "expired", "not_implemented"]).optional(),
      consentMechanism: z.string().optional(),
      consentText: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await drizzleDb.update(consentRecords)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq(consentRecords.id, id));
      return { success: true };
    }),
});

// ═══════════════════════════════════════════════════════════════
// Processing Records (ROPA) Router
// ═══════════════════════════════════════════════════════════════
const processingRouter = router({
  list: privacyProcedure
    .input(z.object({
      lawfulBasis: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const filters: any[] = [];
      if (input?.lawfulBasis) filters.push(eq(processingRecords.lawfulBasis, input.lawfulBasis as any));
      if (input?.status) filters.push(eq(processingRecords.status, input.status as any));
      if (input?.search) {
        filters.push(or(
          like(processingRecords.activityName, `%${input.search}%`),
          like(processingRecords.activityNameAr, `%${input.search}%`),
        ));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [items, [totalResult]] = await Promise.all([
        drizzleDb.select().from(processingRecords).where(where).orderBy(desc(processingRecords.createdAt)).limit(limit).offset((page - 1) * limit),
        drizzleDb.select({ count: count() }).from(processingRecords).where(where),
      ]);

      return {
        records: items,
        total: totalResult?.count ?? 0,
      };
    }),

  create: privacyProcedure
    .input(z.object({
      activityName: z.string().min(1),
      activityNameAr: z.string().optional(),
      purpose: z.string().min(1),
      purposeAr: z.string().optional(),
      dataCategories: z.any().optional(),
      lawfulBasis: z.enum(["consent", "contract", "legal_obligation", "vital_interest", "public_interest", "legitimate_interest"]),
      retentionPeriod: z.string().optional(),
      entityName: z.string().optional(),
      controllerName: z.string().optional(),
      dpoContact: z.string().optional(),
      crossBorderTransfer: z.boolean().default(false),
      securityMeasures: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const [result] = await drizzleDb.insert(processingRecords).values({
        ...input,
        crossBorderTransfer: input.crossBorderTransfer ? 1 : 0,
      } as any);
      return { id: result.insertId };
    }),

  update: privacyProcedure
    .input(z.object({
      id: z.number(),
      activityName: z.string().optional(),
      purpose: z.string().optional(),
      lawfulBasis: z.enum(["consent", "contract", "legal_obligation", "vital_interest", "public_interest", "legitimate_interest"]).optional(),
      status: z.enum(["active", "under_review", "archived"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await drizzleDb.update(processingRecords)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(eq(processingRecords.id, id));
      return { success: true };
    }),
});

// ═══════════════════════════════════════════════════════════════
// DPIA Router
// ═══════════════════════════════════════════════════════════════
const dpiaRouter = router({
  list: privacyProcedure
    .input(z.object({
      status: z.string().optional(),
      riskLevel: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const filters: any[] = [];
      if (input?.status) filters.push(eq(dpiaAssessments.status, input.status as any));
      if (input?.riskLevel) filters.push(eq(dpiaAssessments.riskLevel, input.riskLevel as any));
      if (input?.search) {
        filters.push(or(
          like(dpiaAssessments.projectName, `%${input.search}%`),
          like(dpiaAssessments.entityName, `%${input.search}%`),
        ));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [items, [totalResult]] = await Promise.all([
        drizzleDb.select().from(dpiaAssessments).where(where).orderBy(desc(dpiaAssessments.createdAt)).limit(limit).offset((page - 1) * limit),
        drizzleDb.select({ count: count() }).from(dpiaAssessments).where(where),
      ]);

      const [highRiskCount] = await drizzleDb.select({ count: count() }).from(dpiaAssessments).where(eq(dpiaAssessments.riskLevel, "high"));
      const [criticalCount] = await drizzleDb.select({ count: count() }).from(dpiaAssessments).where(eq(dpiaAssessments.riskLevel, "critical"));

      return {
        assessments: items,
        total: totalResult?.count ?? 0,
        stats: {
          total: totalResult?.count ?? 0,
          highRisk: highRiskCount?.count ?? 0,
          critical: criticalCount?.count ?? 0,
        },
      };
    }),

  create: privacyProcedure
    .input(z.object({
      projectName: z.string().min(1),
      projectNameAr: z.string().optional(),
      description: z.string().optional(),
      entityName: z.string().optional(),
      riskLevel: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      dataTypes: z.any().optional(),
      risks: z.any().optional(),
      mitigations: z.any().optional(),
      recommendations: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await drizzleDb.insert(dpiaAssessments).values({
        ...input,
        assessorId: ctx.user?.id,
        assessorName: ctx.user?.name,
      } as any);
      return { id: result.insertId };
    }),

  updateStatus: privacyProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["not_started", "in_progress", "completed", "needs_review"]),
      dpoApproval: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      await drizzleDb.update(dpiaAssessments)
        .set({
          status: input.status,
          dpoApproval: input.dpoApproval ? 1 : 0,
          dpoApprovalDate: input.dpoApproval ? new Date() : undefined,
          completedAt: input.status === "completed" ? new Date() : undefined,
          updatedAt: new Date(),
        } as any)
        .where(eq(dpiaAssessments.id, input.id));
      return { success: true };
    }),
});

// ═══════════════════════════════════════════════════════════════
// Privacy Assessments Router
// ═══════════════════════════════════════════════════════════════
const assessmentRouter = router({
  list: privacyProcedure
    .input(z.object({
      status: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const filters: any[] = [];
      if (input?.status) filters.push(eq(privacyAssessments.status, input.status as any));
      if (input?.search) {
        filters.push(or(
          like(privacyAssessments.entityName, `%${input.search}%`),
          like(privacyAssessments.entityDomain, `%${input.search}%`),
        ));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [items, [totalResult]] = await Promise.all([
        drizzleDb.select().from(privacyAssessments).where(where).orderBy(desc(privacyAssessments.createdAt)).limit(limit).offset((page - 1) * limit),
        drizzleDb.select({ count: count() }).from(privacyAssessments).where(where),
      ]);

      return {
        assessments: items,
        total: totalResult?.count ?? 0,
      };
    }),

  create: privacyProcedure
    .input(z.object({
      entityName: z.string().min(1),
      entityDomain: z.string().optional(),
      assessmentType: z.enum(["full", "quick", "clause_specific", "follow_up"]).default("full"),
    }))
    .mutation(async ({ input, ctx }) => {
      const [result] = await drizzleDb.insert(privacyAssessments).values({
        ...input,
        assessorId: ctx.user?.id,
        assessorName: ctx.user?.name,
      } as any);
      return { id: result.insertId };
    }),

  updateScores: privacyProcedure
    .input(z.object({
      id: z.number(),
      clause1Score: z.number().min(0).max(100).optional(),
      clause2Score: z.number().min(0).max(100).optional(),
      clause3Score: z.number().min(0).max(100).optional(),
      clause4Score: z.number().min(0).max(100).optional(),
      clause5Score: z.number().min(0).max(100).optional(),
      clause6Score: z.number().min(0).max(100).optional(),
      clause7Score: z.number().min(0).max(100).optional(),
      clause8Score: z.number().min(0).max(100).optional(),
      findings: z.any().optional(),
      recommendations: z.any().optional(),
      status: z.enum(["draft", "in_progress", "completed", "overdue"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const scores = [
        data.clause1Score ?? 0, data.clause2Score ?? 0, data.clause3Score ?? 0, data.clause4Score ?? 0,
        data.clause5Score ?? 0, data.clause6Score ?? 0, data.clause7Score ?? 0, data.clause8Score ?? 0,
      ].filter(s => s > 0);
      const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      await drizzleDb.update(privacyAssessments)
        .set({
          ...data,
          overallScore,
          completedAt: data.status === "completed" ? new Date() : undefined,
          updatedAt: new Date(),
        } as any)
        .where(eq(privacyAssessments.id, id));
      return { success: true, overallScore };
    }),
});

// ═══════════════════════════════════════════════════════════════
// Mobile App Privacy Router
// ═══════════════════════════════════════════════════════════════
const mobileAppsRouter = router({
  list: privacyProcedure
    .input(z.object({
      platform: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const filters: any[] = [];
      if (input?.platform) filters.push(eq(mobileAppPrivacy.platform, input.platform as any));
      if (input?.status) filters.push(eq(mobileAppPrivacy.status, input.status as any));
      if (input?.search) {
        filters.push(or(
          like(mobileAppPrivacy.appName, `%${input.search}%`),
          like(mobileAppPrivacy.developer, `%${input.search}%`),
        ));
      }

      const where = filters.length > 0 ? and(...filters) : undefined;
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [items, [totalResult]] = await Promise.all([
        drizzleDb.select().from(mobileAppPrivacy).where(where).orderBy(desc(mobileAppPrivacy.createdAt)).limit(limit).offset((page - 1) * limit),
        drizzleDb.select({ count: count() }).from(mobileAppPrivacy).where(where),
      ]);

      const [compliantCount] = await drizzleDb.select({ count: count() }).from(mobileAppPrivacy).where(eq(mobileAppPrivacy.status, "compliant"));
      const [nonCompliantCount] = await drizzleDb.select({ count: count() }).from(mobileAppPrivacy).where(eq(mobileAppPrivacy.status, "non_compliant"));

      return {
        apps: items,
        total: totalResult?.count ?? 0,
        stats: {
          total: totalResult?.count ?? 0,
          compliant: compliantCount?.count ?? 0,
          nonCompliant: nonCompliantCount?.count ?? 0,
        },
      };
    }),

  create: privacyProcedure
    .input(z.object({
      appName: z.string().min(1),
      appNameAr: z.string().optional(),
      packageId: z.string().optional(),
      platform: z.enum(["ios", "android", "both"]),
      developer: z.string().optional(),
      category: z.string().optional(),
      privacyPolicyUrl: z.string().optional(),
      permissions: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const [result] = await drizzleDb.insert(mobileAppPrivacy).values(input as any);
      return { id: result.insertId };
    }),
});

// ═══════════════════════════════════════════════════════════════
// Combined Privacy Router
// ═══════════════════════════════════════════════════════════════
export const privacyRouter = router({
  dsar: dsarRouter,
  consent: consentRouter,
  processing: processingRouter,
  dpia: dpiaRouter,
  assessment: assessmentRouter,
  mobileApps: mobileAppsRouter,
});

```

---

