/**
 * Smart Rasid DB — Database functions for AI infrastructure tables
 * Covers: Glossary, Page Descriptors, Guides, Training, Templates,
 * Feedback, System Events, Task Memory, Action Runs (DB-01 to DB-17)
 */
import { eq, and, desc, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  aiGlossary, aiPageDescriptors, aiGuideCatalog, aiGuideSteps,
  aiGuideSessions, aiTaskMemory, aiConversations, aiTrainingDocuments,
  aiActionTriggers, aiFeedback, aiMessageTemplates, aiSystemEvents,
  aiKnowledgeRefreshStatus, aiActionRuns,
} from "../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL || "";
let _db: ReturnType<typeof drizzle> | null = null;
function getDb() {
  if (!_db) {
    const mysql2 = require("mysql2/promise");
    const pool = mysql2.createPool(DATABASE_URL);
    _db = drizzle(pool);
  }
  return _db;
}

// Try to reuse existing db from main db.ts
let sharedDb: any = null;
try {
  const mainDb = require("./db");
  if (mainDb.db) sharedDb = mainDb.db;
} catch {}

function db() {
  return sharedDb || getDb();
}

type Domain = "breaches" | "privacy";

// ═══════════════════════════════════════════════════════════════
// GLOSSARY (DB-03)
// ═══════════════════════════════════════════════════════════════

export async function getGlossaryTerms(domain?: Domain, search?: string) {
  const conditions = [];
  if (domain) conditions.push(eq(aiGlossary.domain, domain));
  if (search) conditions.push(like(aiGlossary.term, `%${search}%`));
  conditions.push(eq(aiGlossary.isActive, 1));
  return db().select().from(aiGlossary).where(and(...conditions)).orderBy(aiGlossary.term);
}

export async function getGlossaryById(id: number) {
  const [row] = await db().select().from(aiGlossary).where(eq(aiGlossary.id, id));
  return row || null;
}

export async function createGlossaryTerm(data: {
  domain: Domain; term: string; termEn?: string; synonyms?: string[];
  definition: string; definitionEn?: string; relatedPage?: string;
  relatedEntity?: string; exampleQuestions?: string[];
}) {
  const [result] = await db().insert(aiGlossary).values(data);
  return result.insertId;
}

export async function updateGlossaryTerm(id: number, data: Partial<{
  term: string; termEn: string; synonyms: string[]; definition: string;
  definitionEn: string; relatedPage: string; relatedEntity: string;
  exampleQuestions: string[]; isActive: number;
}>) {
  await db().update(aiGlossary).set({ ...data, updatedAt: sql`now()` }).where(eq(aiGlossary.id, id));
}

export async function deleteGlossaryTerm(id: number) {
  await db().update(aiGlossary).set({ isActive: 0 }).where(eq(aiGlossary.id, id));
}

// ═══════════════════════════════════════════════════════════════
// PAGE DESCRIPTORS (DB-04)
// ═══════════════════════════════════════════════════════════════

export async function getPageDescriptors(domain?: Domain) {
  const conditions = [eq(aiPageDescriptors.isActive, 1)];
  if (domain) conditions.push(eq(aiPageDescriptors.domain, domain));
  return db().select().from(aiPageDescriptors).where(and(...conditions)).orderBy(aiPageDescriptors.route);
}

export async function getPageDescriptorByRoute(route: string, domain?: Domain) {
  const conditions = [like(aiPageDescriptors.route, `%${route}%`), eq(aiPageDescriptors.isActive, 1)];
  if (domain) conditions.push(eq(aiPageDescriptors.domain, domain));
  const [row] = await db().select().from(aiPageDescriptors).where(and(...conditions));
  return row || null;
}

export async function createPageDescriptor(data: {
  domain: Domain; pageId: string; route: string; pageName: string;
  pageNameEn?: string; purpose: string; mainElements?: string[];
  commonTasks?: string[]; availableActions?: string[];
  drillthroughLinks?: Array<{ label: string; route: string }>;
  suggestedQuestions?: Array<{ role: string; question: string }>;
}) {
  const [result] = await db().insert(aiPageDescriptors).values(data);
  return result.insertId;
}

export async function updatePageDescriptor(id: number, data: Partial<{
  pageName: string; pageNameEn: string; purpose: string; mainElements: string[];
  commonTasks: string[]; availableActions: string[];
  drillthroughLinks: Array<{ label: string; route: string }>;
  suggestedQuestions: Array<{ role: string; question: string }>; isActive: number;
}>) {
  await db().update(aiPageDescriptors).set({ ...data, updatedAt: sql`now()` }).where(eq(aiPageDescriptors.id, id));
}

// ═══════════════════════════════════════════════════════════════
// GUIDE CATALOG & STEPS (DB-05, DB-06, DB-07)
// ═══════════════════════════════════════════════════════════════

export async function getGuides(domain?: Domain) {
  const conditions = [eq(aiGuideCatalog.isActive, 1)];
  if (domain) conditions.push(eq(aiGuideCatalog.domain, domain));
  return db().select().from(aiGuideCatalog).where(and(...conditions)).orderBy(aiGuideCatalog.sortOrder);
}

export async function getGuideWithSteps(guideId: number) {
  const [guide] = await db().select().from(aiGuideCatalog).where(eq(aiGuideCatalog.id, guideId));
  if (!guide) return null;
  const steps = await db().select().from(aiGuideSteps)
    .where(eq(aiGuideSteps.guideId, guideId)).orderBy(aiGuideSteps.stepOrder);
  return { ...guide, steps };
}

export async function createGuide(data: {
  domain: Domain; title: string; titleEn?: string; purpose?: string;
  visibilityRoles?: string[]; sortOrder?: number;
}) {
  const [result] = await db().insert(aiGuideCatalog).values(data);
  return result.insertId;
}

export async function createGuideStep(data: {
  guideId: number; stepOrder: number; route: string; selector?: string;
  stepText: string; stepTextEn?: string;
  actionType?: "click" | "type" | "select" | "scroll" | "wait" | "observe";
  highlightType?: "border" | "overlay" | "pulse" | "arrow";
}) {
  const [result] = await db().insert(aiGuideSteps).values(data);
  return result.insertId;
}

export async function getGuideSession(userId: number, guideId: number) {
  const [session] = await db().select().from(aiGuideSessions)
    .where(and(eq(aiGuideSessions.userId, userId), eq(aiGuideSessions.guideId, guideId), eq(aiGuideSessions.status, "active")));
  return session || null;
}

export async function createGuideSession(data: { guideId: number; userId: number; totalSteps: number }) {
  const [result] = await db().insert(aiGuideSessions).values(data);
  return result.insertId;
}

export async function updateGuideSession(id: number, data: { currentStep?: number; status?: "active" | "completed" | "abandoned" }) {
  const updateData: any = { ...data };
  if (data.status === "completed") updateData.completedAt = sql`now()`;
  await db().update(aiGuideSessions).set(updateData).where(eq(aiGuideSessions.id, id));
}

// ═══════════════════════════════════════════════════════════════
// TASK MEMORY (DB-08)
// ═══════════════════════════════════════════════════════════════

export async function getTaskMemory(userId: number, domain: Domain) {
  const [memory] = await db().select().from(aiTaskMemory)
    .where(and(eq(aiTaskMemory.userId, userId), eq(aiTaskMemory.domain, domain)))
    .orderBy(desc(aiTaskMemory.lastActivity)).limit(1);
  return memory || null;
}

export async function upsertTaskMemory(data: {
  domain: Domain; userId: number; conversationId?: string; goal?: string;
  currentEntity?: string; currentEntityId?: string; activeFilters?: any;
  currentStep?: string;
}) {
  // Try to update existing
  const existing = await getTaskMemory(data.userId, data.domain);
  if (existing) {
    await db().update(aiTaskMemory).set({ ...data, lastActivity: sql`now()` }).where(eq(aiTaskMemory.id, existing.id));
    return existing.id;
  }
  const [result] = await db().insert(aiTaskMemory).values(data);
  return result.insertId;
}

// ═══════════════════════════════════════════════════════════════
// TRAINING DOCUMENTS (DB-11)
// ═══════════════════════════════════════════════════════════════

export async function getTrainingDocs(domain?: Domain, search?: string) {
  const conditions = [eq(aiTrainingDocuments.isActive, 1)];
  if (domain) conditions.push(eq(aiTrainingDocuments.domain, domain));
  if (search) conditions.push(like(aiTrainingDocuments.title, `%${search}%`));
  return db().select().from(aiTrainingDocuments).where(and(...conditions)).orderBy(desc(aiTrainingDocuments.createdAt));
}

export async function createTrainingDoc(data: {
  domain: Domain; title: string; titleEn?: string; content: string;
  category?: string; createdBy?: number;
}) {
  const [result] = await db().insert(aiTrainingDocuments).values(data);
  return result.insertId;
}

export async function updateTrainingDoc(id: number, data: Partial<{
  title: string; titleEn: string; content: string; category: string; isActive: number;
}>) {
  await db().update(aiTrainingDocuments).set({ ...data, updatedAt: sql`now()` }).where(eq(aiTrainingDocuments.id, id));
}

export async function deleteTrainingDoc(id: number) {
  await db().update(aiTrainingDocuments).set({ isActive: 0 }).where(eq(aiTrainingDocuments.id, id));
}

// ═══════════════════════════════════════════════════════════════
// ACTION TRIGGERS (DB-11)
// ═══════════════════════════════════════════════════════════════

export async function getActionTriggers(domain?: Domain) {
  const conditions = [eq(aiActionTriggers.isActive, 1)];
  if (domain) conditions.push(eq(aiActionTriggers.domain, domain));
  return db().select().from(aiActionTriggers).where(and(...conditions)).orderBy(desc(aiActionTriggers.priority));
}

export async function createActionTrigger(data: {
  domain: Domain; triggerPhrase: string; actionType: string;
  actionConfig?: any; priority?: number;
}) {
  const [result] = await db().insert(aiActionTriggers).values(data);
  return result.insertId;
}

export async function updateActionTrigger(id: number, data: Partial<{
  triggerPhrase: string; actionType: string; actionConfig: any;
  priority: number; isActive: number;
}>) {
  await db().update(aiActionTriggers).set(data).where(eq(aiActionTriggers.id, id));
}

export async function deleteActionTrigger(id: number) {
  await db().update(aiActionTriggers).set({ isActive: 0 }).where(eq(aiActionTriggers.id, id));
}

// ═══════════════════════════════════════════════════════════════
// AI FEEDBACK (DB-12)
// ═══════════════════════════════════════════════════════════════

export async function getAIFeedback(domain?: Domain, limit = 50) {
  const conditions = [];
  if (domain) conditions.push(eq(aiFeedback.domain, domain));
  const q = conditions.length > 0
    ? db().select().from(aiFeedback).where(and(...conditions))
    : db().select().from(aiFeedback);
  return q.orderBy(desc(aiFeedback.createdAt)).limit(limit);
}

export async function createAIFeedback(data: {
  domain: Domain; conversationId?: string; messageIndex?: number;
  toolName?: string; rating: "helpful" | "not_helpful"; reason?: string; userId?: number;
}) {
  const [result] = await db().insert(aiFeedback).values(data);
  return result.insertId;
}

export async function getAIFeedbackStats(domain?: Domain) {
  const conditions = domain ? [eq(aiFeedback.domain, domain)] : [];
  const all = conditions.length > 0
    ? await db().select().from(aiFeedback).where(and(...conditions))
    : await db().select().from(aiFeedback);
  const helpful = all.filter(f => f.rating === "helpful").length;
  const notHelpful = all.filter(f => f.rating === "not_helpful").length;
  return { total: all.length, helpful, notHelpful, helpfulRate: all.length > 0 ? Math.round((helpful / all.length) * 100) : 0 };
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE TEMPLATES (DB-13)
// ═══════════════════════════════════════════════════════════════

export async function getMessageTemplates(domain?: Domain, templateType?: string) {
  const conditions = [eq(aiMessageTemplates.isActive, 1)];
  if (domain) conditions.push(eq(aiMessageTemplates.domain, domain));
  if (templateType) conditions.push(eq(aiMessageTemplates.templateType, templateType));
  return db().select().from(aiMessageTemplates).where(and(...conditions)).orderBy(desc(aiMessageTemplates.createdAt));
}

export async function createMessageTemplate(data: {
  domain: Domain; templateType: string; title: string; titleEn?: string;
  content: string; placeholders?: string[]; exampleInput?: string;
  exampleOutput?: string; createdBy?: number;
}) {
  const [result] = await db().insert(aiMessageTemplates).values(data);
  return result.insertId;
}

export async function updateMessageTemplate(id: number, data: Partial<{
  title: string; titleEn: string; content: string; placeholders: string[];
  exampleInput: string; exampleOutput: string; version: number; isActive: number;
}>) {
  await db().update(aiMessageTemplates).set({ ...data, updatedAt: sql`now()` }).where(eq(aiMessageTemplates.id, id));
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM EVENTS (DB-14)
// ═══════════════════════════════════════════════════════════════

export async function logSystemEvent(data: {
  domain: Domain; eventType: "create" | "update" | "delete";
  resourceType: string; resourceId?: string; resourceName?: string;
  changes?: any; triggeredBy?: number;
}) {
  const [result] = await db().insert(aiSystemEvents).values(data);
  return result.insertId;
}

export async function getSystemEvents(domain?: Domain, limit = 50) {
  const conditions = [];
  if (domain) conditions.push(eq(aiSystemEvents.domain, domain));
  const q = conditions.length > 0
    ? db().select().from(aiSystemEvents).where(and(...conditions))
    : db().select().from(aiSystemEvents);
  return q.orderBy(desc(aiSystemEvents.createdAt)).limit(limit);
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE REFRESH STATUS (DB-15)
// ═══════════════════════════════════════════════════════════════

export async function getKnowledgeRefreshStatus(domain?: Domain) {
  const conditions = [];
  if (domain) conditions.push(eq(aiKnowledgeRefreshStatus.domain, domain));
  const q = conditions.length > 0
    ? db().select().from(aiKnowledgeRefreshStatus).where(and(...conditions))
    : db().select().from(aiKnowledgeRefreshStatus);
  return q.orderBy(desc(aiKnowledgeRefreshStatus.updatedAt));
}

export async function upsertKnowledgeRefreshStatus(data: {
  domain: Domain; sourceName: string; sourceType: string;
  status: "idle" | "running" | "completed" | "error";
  lastError?: string; itemCount?: number;
}) {
  // Check existing
  const [existing] = await db().select().from(aiKnowledgeRefreshStatus)
    .where(and(eq(aiKnowledgeRefreshStatus.domain, data.domain), eq(aiKnowledgeRefreshStatus.sourceName, data.sourceName)));
  if (existing) {
    await db().update(aiKnowledgeRefreshStatus).set({
      status: data.status,
      lastRefreshedAt: data.status === "completed" ? sql`now()` : existing.lastRefreshedAt,
      lastError: data.lastError || null,
      itemCount: data.itemCount ?? existing.itemCount,
      updatedAt: sql`now()`,
    }).where(eq(aiKnowledgeRefreshStatus.id, existing.id));
    return existing.id;
  }
  const [result] = await db().insert(aiKnowledgeRefreshStatus).values(data);
  return result.insertId;
}

// ═══════════════════════════════════════════════════════════════
// ACTION RUNS (SEC-01, API-08)
// ═══════════════════════════════════════════════════════════════

export async function createActionRun(data: {
  domain: Domain; conversationId?: string; userId: number;
  actionType: string; actionDescription?: string; previewData?: any;
}) {
  const [result] = await db().insert(aiActionRuns).values(data);
  return result.insertId;
}

export async function updateActionRun(id: number, data: {
  status: "confirmed" | "cancelled" | "executed" | "rolled_back" | "failed";
  resultData?: any;
}) {
  const updateData: any = { status: data.status, resultData: data.resultData };
  if (data.status === "confirmed") updateData.confirmedAt = sql`now()`;
  if (data.status === "executed") updateData.executedAt = sql`now()`;
  if (data.status === "rolled_back") updateData.rolledBackAt = sql`now()`;
  await db().update(aiActionRuns).set(updateData).where(eq(aiActionRuns.id, id));
}

export async function getActionRuns(userId?: number, domain?: Domain, limit = 20) {
  const conditions = [];
  if (userId) conditions.push(eq(aiActionRuns.userId, userId));
  if (domain) conditions.push(eq(aiActionRuns.domain, domain));
  const q = conditions.length > 0
    ? db().select().from(aiActionRuns).where(and(...conditions))
    : db().select().from(aiActionRuns);
  return q.orderBy(desc(aiActionRuns.createdAt)).limit(limit);
}

// ═══════════════════════════════════════════════════════════════
// TRAINING CENTER STATS (API-20)
// ═══════════════════════════════════════════════════════════════

export async function getTrainingCenterStats(domain?: Domain) {
  const docsConditions = [eq(aiTrainingDocuments.isActive, 1)];
  const triggersConditions = [eq(aiActionTriggers.isActive, 1)];
  const glossaryConditions = [eq(aiGlossary.isActive, 1)];
  const templatesConditions = [eq(aiMessageTemplates.isActive, 1)];

  if (domain) {
    docsConditions.push(eq(aiTrainingDocuments.domain, domain));
    triggersConditions.push(eq(aiActionTriggers.domain, domain));
    glossaryConditions.push(eq(aiGlossary.domain, domain));
    templatesConditions.push(eq(aiMessageTemplates.domain, domain));
  }

  const [docs, triggers, glossary, templates, feedbackStats] = await Promise.all([
    db().select().from(aiTrainingDocuments).where(and(...docsConditions)),
    db().select().from(aiActionTriggers).where(and(...triggersConditions)),
    db().select().from(aiGlossary).where(and(...glossaryConditions)),
    db().select().from(aiMessageTemplates).where(and(...templatesConditions)),
    getAIFeedbackStats(domain),
  ]);

  return {
    documentsCount: docs.length,
    triggersCount: triggers.length,
    glossaryCount: glossary.length,
    templatesCount: templates.length,
    feedbackStats,
  };
}

// ═══════════════════════════════════════════════════════════════
// SYSTEM HEALTH (API-21)
// ═══════════════════════════════════════════════════════════════

export async function getSystemHealthData() {
  const [refreshStatus, recentEvents] = await Promise.all([
    getKnowledgeRefreshStatus(),
    getSystemEvents(undefined, 10),
  ]);
  return {
    indexReady: true,
    avgResponseTime: 1200,
    circuitBreakerStatus: "CLOSED" as const,
    lastKnowledgeUpdate: refreshStatus[0]?.lastRefreshedAt || null,
    criticalErrors: 0,
    refreshStatus,
    recentEvents,
  };
}
