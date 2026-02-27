/**
 * Smart Monitor Router — New API endpoints for requirements DB-03 to DB-15, API-01 to API-21
 * متطلبات راصد الذكي - واجهات البرمجة الجديدة
 */
import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import {
  glossaryTerms, pageDescriptors, guideCatalog, aiGuideSteps,
  guideSessions, sessionSummaries, letterTemplates, systemEvents,
  knowledgeRefreshStatus, actionRuns, aiEvaluationSets,
  aiChatSessions, aiChatMessages, aiToolUsage, aiNavigationHistory,
} from "../drizzle/schema";
import { type Domain, domainGuard, checkNamingPolicy, getToolsForDomain } from "./domainIsolation";

const domainEnum = z.enum(['leaks', 'privacy']);

export const smartMonitorRouter = router({

  // ═══════════════════════════════════
  // Glossary (DB-03) — قاموس المصطلحات
  // ═══════════════════════════════════

  getGlossary: protectedProcedure.input(z.object({
    domain: domainEnum,
    search: z.string().optional(),
    includeForbidden: z.boolean().optional(),
  })).query(async ({ input }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return [];

    const conditions = [eq(glossaryTerms.domain, input.domain)];
    if (!input.includeForbidden) {
      conditions.push(eq(glossaryTerms.isActive, 1));
    }

    const results = await dbConn.select().from(glossaryTerms)
      .where(and(...conditions))
      .orderBy(asc(glossaryTerms.term));

    if (input.search) {
      const search = input.search.toLowerCase();
      return results.filter(t =>
        t.term.toLowerCase().includes(search) ||
        t.termEn?.toLowerCase().includes(search) ||
        t.definition.toLowerCase().includes(search)
      );
    }
    return results;
  }),

  addGlossaryTerm: adminProcedure.input(z.object({
    domain: domainEnum,
    term: z.string().min(1).max(255),
    termEn: z.string().optional(),
    synonyms: z.array(z.string()).optional(),
    definition: z.string().min(1),
    definitionEn: z.string().optional(),
    relatedPage: z.string().optional(),
    relatedEntity: z.string().optional(),
    exampleQuestions: z.array(z.string()).optional(),
    isForbidden: z.boolean().optional(),
    correctAlternative: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });

    const [result] = await dbConn.insert(glossaryTerms).values({
      domain: input.domain,
      term: input.term,
      termEn: input.termEn,
      synonyms: input.synonyms,
      definition: input.definition,
      definitionEn: input.definitionEn,
      relatedPage: input.relatedPage,
      relatedEntity: input.relatedEntity,
      exampleQuestions: input.exampleQuestions,
      isForbidden: input.isForbidden ? 1 : 0,
      correctAlternative: input.correctAlternative,
      createdBy: ctx.user.id,
    });

    // Log system event (DB-14)
    await dbConn.insert(systemEvents).values({
      domain: input.domain,
      eventType: 'glossary_updated',
      entityType: 'glossary_term',
      entityId: String(result.insertId),
      entityName: input.term,
      newValue: input as any,
      triggeredBy: ctx.user.id,
    });

    return { id: result.insertId, success: true };
  }),

  updateGlossaryTerm: adminProcedure.input(z.object({
    id: z.number(),
    term: z.string().optional(),
    definition: z.string().optional(),
    synonyms: z.array(z.string()).optional(),
    isForbidden: z.boolean().optional(),
    correctAlternative: z.string().optional(),
    isActive: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    const updateData: Record<string, any> = {};
    if (input.term !== undefined) updateData.term = input.term;
    if (input.definition !== undefined) updateData.definition = input.definition;
    if (input.synonyms !== undefined) updateData.synonyms = input.synonyms;
    if (input.isForbidden !== undefined) updateData.isForbidden = input.isForbidden ? 1 : 0;
    if (input.correctAlternative !== undefined) updateData.correctAlternative = input.correctAlternative;
    if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;

    await dbConn.update(glossaryTerms).set(updateData).where(eq(glossaryTerms.id, input.id));
    return { success: true };
  }),

  deleteGlossaryTerm: adminProcedure.input(z.object({
    id: z.number(),
  })).mutation(async ({ input }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    await dbConn.delete(glossaryTerms).where(eq(glossaryTerms.id, input.id));
    return { success: true };
  }),

  // Check naming policy on text (NAME-07)
  checkNaming: protectedProcedure.input(z.object({
    text: z.string(),
  })).query(({ input }) => {
    return checkNamingPolicy(input.text);
  }),

  // ═══════════════════════════════════════════
  // Page Descriptors (DB-04) — أوصاف الصفحات
  // ═══════════════════════════════════════════

  getPageDescriptors: protectedProcedure.input(z.object({
    domain: domainEnum,
    pageId: z.string().optional(),
  })).query(async ({ input }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return [];

    const conditions = [
      eq(pageDescriptors.domain, input.domain),
      eq(pageDescriptors.isActive, 1),
    ];
    if (input.pageId) {
      conditions.push(eq(pageDescriptors.pageId, input.pageId));
    }

    return dbConn.select().from(pageDescriptors)
      .where(and(...conditions))
      .orderBy(asc(pageDescriptors.titleAr));
  }),

  getPageContext: protectedProcedure.input(z.object({
    domain: domainEnum,
    pageId: z.string(),
    userRole: z.string().optional(),
  })).query(async ({ input }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return null;

    const [descriptor] = await dbConn.select().from(pageDescriptors)
      .where(and(
        eq(pageDescriptors.domain, input.domain),
        eq(pageDescriptors.pageId, input.pageId),
        eq(pageDescriptors.isActive, 1),
      ))
      .limit(1);

    if (!descriptor) return null;

    // Get role-specific suggestions
    const roleQuestions = descriptor.roleBasedQuestions as Record<string, string[]> | null;
    const suggestedForRole = input.userRole && roleQuestions
      ? roleQuestions[input.userRole] || descriptor.suggestedQuestions
      : descriptor.suggestedQuestions;

    return {
      ...descriptor,
      suggestedQuestions: suggestedForRole,
      allowedTools: getToolsForDomain(input.domain),
    };
  }),

  upsertPageDescriptor: adminProcedure.input(z.object({
    domain: domainEnum,
    pageId: z.string(),
    route: z.string(),
    titleAr: z.string(),
    titleEn: z.string().optional(),
    purpose: z.string(),
    purposeEn: z.string().optional(),
    mainElements: z.array(z.string()).optional(),
    commonTasks: z.array(z.string()).optional(),
    availableActions: z.array(z.string()).optional(),
    drillthroughLinks: z.array(z.object({ label: z.string(), route: z.string() })).optional(),
    suggestedQuestions: z.array(z.string()).optional(),
    roleBasedQuestions: z.record(z.array(z.string())).optional(),
  })).mutation(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    // Check if exists
    const [existing] = await dbConn.select().from(pageDescriptors)
      .where(and(
        eq(pageDescriptors.domain, input.domain),
        eq(pageDescriptors.pageId, input.pageId),
      )).limit(1);

    if (existing) {
      await dbConn.update(pageDescriptors).set({
        ...input,
        mainElements: input.mainElements,
        commonTasks: input.commonTasks,
        availableActions: input.availableActions,
        drillthroughLinks: input.drillthroughLinks,
        suggestedQuestions: input.suggestedQuestions,
        roleBasedQuestions: input.roleBasedQuestions,
      }).where(eq(pageDescriptors.id, existing.id));
      return { id: existing.id, updated: true };
    }

    const [result] = await dbConn.insert(pageDescriptors).values({
      ...input,
      mainElements: input.mainElements,
      commonTasks: input.commonTasks,
      availableActions: input.availableActions,
      drillthroughLinks: input.drillthroughLinks,
      suggestedQuestions: input.suggestedQuestions,
      roleBasedQuestions: input.roleBasedQuestions,
      createdBy: ctx.user.id,
    });
    return { id: result.insertId, updated: false };
  }),

  // ═══════════════════════════════════════════════
  // Guide Catalog + Sessions (DB-05, DB-06, DB-07)
  // ═══════════════════════════════════════════════

  listGuides: protectedProcedure.input(z.object({
    domain: domainEnum,
    category: z.string().optional(),
  })).query(async ({ input }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return [];

    const conditions = [
      eq(guideCatalog.domain, input.domain),
      eq(guideCatalog.isActive, 1),
    ];
    if (input.category) {
      conditions.push(eq(guideCatalog.category, input.category));
    }

    return dbConn.select().from(guideCatalog)
      .where(and(...conditions))
      .orderBy(asc(guideCatalog.sortOrder));
  }),

  getGuideSteps: protectedProcedure.input(z.object({
    guideId: z.number(),
    domain: domainEnum,
  })).query(async ({ input }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return [];

    return dbConn.select().from(aiGuideSteps)
      .where(and(
        eq(aiGuideSteps.guideId, input.guideId),
        eq(aiGuideSteps.domain, input.domain),
        eq(aiGuideSteps.isActive, 1),
      ))
      .orderBy(asc(aiGuideSteps.stepOrder));
  }),

  startGuide: protectedProcedure.input(z.object({
    guideId: z.number(),
    domain: domainEnum,
  })).mutation(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    // Get guide info
    const [guide] = await dbConn.select().from(guideCatalog)
      .where(eq(guideCatalog.id, input.guideId)).limit(1);
    if (!guide) throw new TRPCError({ code: 'NOT_FOUND', message: 'الدليل غير موجود' });

    // Check for existing active session
    const [existingSession] = await dbConn.select().from(guideSessions)
      .where(and(
        eq(guideSessions.userId, ctx.user.id),
        eq(guideSessions.guideId, input.guideId),
        eq(guideSessions.status, 'active'),
      )).limit(1);

    if (existingSession) {
      return { sessionId: existingSession.id, resumed: true, currentStep: existingSession.currentStepOrder };
    }

    const [result] = await dbConn.insert(guideSessions).values({
      userId: ctx.user.id,
      guideId: input.guideId,
      domain: input.domain,
      totalSteps: guide.stepCount,
    });

    return { sessionId: result.insertId, resumed: false, currentStep: 1 };
  }),

  updateGuideProgress: protectedProcedure.input(z.object({
    sessionId: z.number(),
    stepOrder: z.number(),
    action: z.enum(['next', 'previous', 'complete', 'abandon']),
  })).mutation(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    const [session] = await dbConn.select().from(guideSessions)
      .where(and(
        eq(guideSessions.id, input.sessionId),
        eq(guideSessions.userId, ctx.user.id),
      )).limit(1);

    if (!session) throw new TRPCError({ code: 'NOT_FOUND' });

    if (input.action === 'complete') {
      await dbConn.update(guideSessions).set({
        status: 'completed',
        completedAt: sql`NOW()`,
        currentStepOrder: session.totalSteps,
      }).where(eq(guideSessions.id, input.sessionId));
    } else if (input.action === 'abandon') {
      await dbConn.update(guideSessions).set({
        status: 'abandoned',
      }).where(eq(guideSessions.id, input.sessionId));
    } else {
      const newStep = input.action === 'next'
        ? Math.min(input.stepOrder + 1, session.totalSteps)
        : Math.max(input.stepOrder - 1, 1);
      await dbConn.update(guideSessions).set({
        currentStepOrder: newStep,
      }).where(eq(guideSessions.id, input.sessionId));
    }

    return { success: true };
  }),

  // Resume guide on page reload (UI-15)
  getActiveGuideSession: protectedProcedure.input(z.object({
    domain: domainEnum,
  })).query(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return null;

    const [session] = await dbConn.select().from(guideSessions)
      .where(and(
        eq(guideSessions.userId, ctx.user.id),
        eq(guideSessions.domain, input.domain),
        eq(guideSessions.status, 'active'),
      ))
      .orderBy(desc(guideSessions.lastActivityAt))
      .limit(1);

    return session || null;
  }),

  // ═══════════════════════════════════════════════
  // Session Summaries (DB-10) — ملخصات الجلسات
  // ═══════════════════════════════════════════════

  getRecentSummaries: protectedProcedure.input(z.object({
    domain: domainEnum,
    limit: z.number().min(1).max(10).optional(),
  })).query(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return [];

    return dbConn.select().from(sessionSummaries)
      .where(and(
        eq(sessionSummaries.userId, ctx.user.id),
        eq(sessionSummaries.domain, input.domain),
      ))
      .orderBy(desc(sessionSummaries.createdAt))
      .limit(input.limit || 3);
  }),

  // ═══════════════════════════════════════════════
  // Letter Templates (DB-13, RE-06, RE-07)
  // ═══════════════════════════════════════════════

  getLetterTemplates: protectedProcedure.input(z.object({
    domain: domainEnum,
    type: z.enum(['notification','warning','compliance','report','followup','response','custom']).optional(),
    toneLevel: z.enum(['brief','balanced','formal']).optional(),
  })).query(async ({ input }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return [];

    const conditions = [
      eq(letterTemplates.domain, input.domain),
      eq(letterTemplates.isActive, 1),
    ];
    if (input.type) conditions.push(eq(letterTemplates.templateType, input.type));
    if (input.toneLevel) conditions.push(eq(letterTemplates.toneLevel, input.toneLevel));

    return dbConn.select().from(letterTemplates)
      .where(and(...conditions))
      .orderBy(desc(letterTemplates.version));
  }),

  createLetterTemplate: adminProcedure.input(z.object({
    domain: domainEnum,
    templateType: z.enum(['notification','warning','compliance','report','followup','response','custom']),
    titleAr: z.string(),
    titleEn: z.string().optional(),
    contentAr: z.string(),
    contentEn: z.string().optional(),
    placeholders: z.array(z.object({ key: z.string(), label: z.string(), example: z.string() })).optional(),
    exampleInput: z.record(z.string()).optional(),
    exampleOutput: z.string().optional(),
    toneLevel: z.enum(['brief','balanced','formal']).optional(),
  })).mutation(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    const [result] = await dbConn.insert(letterTemplates).values({
      ...input,
      placeholders: input.placeholders,
      exampleInput: input.exampleInput,
      toneLevel: input.toneLevel || 'balanced',
      createdBy: ctx.user.id,
    });

    return { id: result.insertId, success: true };
  }),

  // ═══════════════════════════════════════════════
  // System Events (DB-14) — أحداث النظام
  // ═══════════════════════════════════════════════

  getSystemEvents: adminProcedure.input(z.object({
    domain: domainEnum,
    eventType: z.string().optional(),
    unprocessedOnly: z.boolean().optional(),
    limit: z.number().min(1).max(100).optional(),
  })).query(async ({ input }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return [];

    const conditions = [eq(systemEvents.domain, input.domain)];
    if (input.unprocessedOnly) {
      conditions.push(eq(systemEvents.isProcessed, 0));
    }

    return dbConn.select().from(systemEvents)
      .where(and(...conditions))
      .orderBy(desc(systemEvents.createdAt))
      .limit(input.limit || 50);
  }),

  // ═══════════════════════════════════════════════
  // Knowledge Refresh Status (DB-15)
  // ═══════════════════════════════════════════════

  getKnowledgeRefreshStatus: adminProcedure.input(z.object({
    domain: domainEnum,
  })).query(async ({ input }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return [];

    return dbConn.select().from(knowledgeRefreshStatus)
      .where(eq(knowledgeRefreshStatus.domain, input.domain))
      .orderBy(desc(knowledgeRefreshStatus.updatedAt));
  }),

  // ═══════════════════════════════════════════════
  // Action Runs (API-07, API-08) — سجل الإجراءات
  // ═══════════════════════════════════════════════

  getActionRuns: protectedProcedure.input(z.object({
    domain: domainEnum,
    conversationId: z.number().optional(),
    status: z.enum(['planned','previewed','confirmed','executing','completed','failed','rolled_back']).optional(),
    limit: z.number().min(1).max(100).optional(),
  })).query(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return [];

    const conditions = [
      eq(actionRuns.domain, input.domain),
      eq(actionRuns.userId, ctx.user.id),
    ];
    if (input.conversationId) conditions.push(eq(actionRuns.conversationId, input.conversationId));
    if (input.status) conditions.push(eq(actionRuns.status, input.status));

    return dbConn.select().from(actionRuns)
      .where(and(...conditions))
      .orderBy(desc(actionRuns.createdAt))
      .limit(input.limit || 20);
  }),

  // Rollback action (API-07, PR-10)
  rollbackAction: protectedProcedure.input(z.object({
    actionRunId: z.number(),
  })).mutation(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    const [action] = await dbConn.select().from(actionRuns)
      .where(and(
        eq(actionRuns.id, input.actionRunId),
        eq(actionRuns.userId, ctx.user.id),
      )).limit(1);

    if (!action) throw new TRPCError({ code: 'NOT_FOUND' });
    if (!action.isRollbackable) throw new TRPCError({ code: 'BAD_REQUEST', message: 'هذا الإجراء لا يدعم التراجع' });
    if (action.status !== 'completed') throw new TRPCError({ code: 'BAD_REQUEST', message: 'لا يمكن التراجع إلا عن إجراء مكتمل' });

    await dbConn.update(actionRuns).set({
      status: 'rolled_back',
      rolledBackAt: sql`NOW()`,
      rolledBackBy: ctx.user.id,
    }).where(eq(actionRuns.id, input.actionRunId));

    return { success: true, message: 'تم التراجع عن الإجراء بنجاح' };
  }),

  // ═══════════════════════════════════════════════
  // Navigation Consent (API-09, API-10, CHAT-03)
  // ═══════════════════════════════════════════════

  requestNavigation: protectedProcedure.input(z.object({
    domain: domainEnum,
    conversationId: z.number().optional(),
    fromPage: z.string(),
    toPage: z.string(),
    reason: z.string(),
  })).mutation(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    const [result] = await dbConn.insert(aiNavigationHistory).values({
      userId: ctx.user.id,
      fromPage: input.fromPage,
      toPage: input.toPage,
      reason: input.reason,
      domain: input.domain,
      conversationId: input.conversationId,
      consentStatus: 'pending',
    });

    return { requestId: result.insertId, requiresConsent: true };
  }),

  respondToNavigation: protectedProcedure.input(z.object({
    requestId: z.number(),
    approved: z.boolean(),
  })).mutation(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    await dbConn.update(aiNavigationHistory).set({
      consentStatus: input.approved ? 'approved' : 'denied',
    }).where(and(
      eq(aiNavigationHistory.id, input.requestId),
      eq(aiNavigationHistory.userId, ctx.user.id),
    ));

    return { approved: input.approved };
  }),

  // ═══════════════════════════════════════════════
  // System Health (API-21)
  // ═══════════════════════════════════════════════

  getSystemHealth: adminProcedure.query(async () => {
    const dbConn = await db.getDb();
    if (!dbConn) return { status: 'error', message: 'قاعدة البيانات غير متاحة' };

    // Get knowledge refresh statuses
    const refreshStatuses = await dbConn.select().from(knowledgeRefreshStatus)
      .orderBy(desc(knowledgeRefreshStatus.updatedAt));

    // Get recent tool usage stats
    const recentToolUsage = await dbConn.select({
      toolName: aiToolUsage.toolName,
      totalCalls: sql<number>`COUNT(*)`,
      avgTime: sql<number>`AVG(${aiToolUsage.executionTimeMs})`,
      errorRate: sql<number>`AVG(CASE WHEN ${aiToolUsage.success} = 0 THEN 1 ELSE 0 END)`,
    }).from(aiToolUsage)
      .groupBy(aiToolUsage.toolName)
      .limit(20);

    // Get active sessions count
    const [sessionStats] = await dbConn.select({
      activeSessions: sql<number>`COUNT(CASE WHEN ${aiChatSessions.sessionStatus} = 'active' THEN 1 END)`,
      totalSessions: sql<number>`COUNT(*)`,
    }).from(aiChatSessions);

    return {
      status: 'healthy',
      indexReady: true,
      knowledgeRefresh: refreshStatuses,
      toolUsageStats: recentToolUsage,
      sessionStats,
      lastChecked: new Date().toISOString(),
    };
  }),

  // ═══════════════════════════════════════════════
  // Evaluation Sets (GOV-02)
  // ═══════════════════════════════════════════════

  getEvaluationSets: adminProcedure.input(z.object({
    domain: domainEnum,
    category: z.string().optional(),
  })).query(async ({ input }) => {
    const dbConn = await db.getDb();
    if (!dbConn) return [];

    const conditions = [
      eq(aiEvaluationSets.domain, input.domain),
      eq(aiEvaluationSets.isActive, 1),
    ];

    return dbConn.select().from(aiEvaluationSets)
      .where(and(...conditions))
      .orderBy(asc(aiEvaluationSets.category));
  }),

  addEvaluationCase: adminProcedure.input(z.object({
    domain: domainEnum,
    question: z.string(),
    expectedAnswer: z.string(),
    expectedTools: z.array(z.string()).optional(),
    category: z.string().optional(),
    difficulty: z.enum(['easy','medium','hard']).optional(),
  })).mutation(async ({ input, ctx }) => {
    const dbConn = await db.getDb();
    if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    const [result] = await dbConn.insert(aiEvaluationSets).values({
      domain: input.domain,
      question: input.question,
      expectedAnswer: input.expectedAnswer,
      expectedTools: input.expectedTools,
      category: input.category,
      difficulty: input.difficulty || 'medium',
      createdBy: ctx.user.id,
    });

    return { id: result.insertId, success: true };
  }),

  // ═══════════════════════════════════════════════
  // Domain Tools Info (API-01)
  // ═══════════════════════════════════════════════

  getDomainTools: protectedProcedure.input(z.object({
    domain: domainEnum,
  })).query(({ input }) => {
    return {
      domain: input.domain,
      tools: getToolsForDomain(input.domain),
    };
  }),

  // Validate domain access (API-02)
  validateDomainAccess: protectedProcedure.input(z.object({
    domain: domainEnum,
    toolName: z.string(),
  })).query(({ input }) => {
    const error = domainGuard(input.toolName, input.domain);
    return {
      allowed: error === null,
      error,
    };
  }),

});
