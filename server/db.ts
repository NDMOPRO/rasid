import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";

let _db: any = null;

function getDb() {
  if (!_db) {
    const pool = mysql.createPool(process.env.DATABASE_URL!);
    _db = drizzle(pool, { schema, mode: "default" });
  }
  return _db;
}

const db: any = new Proxy({}, {
  get(_, prop) {
    return (getDb() as any)[prop];
  }
});
import { eq, desc, asc, and, or, like, sql, count, gte, lte, isNull, isNotNull, inArray } from "drizzle-orm";
import {
  users, sites, siteScans, siteRequirements, privacyPolicyVersions, complianceClauses,
  incidents, incidentTimeline, incidentAttachments, incidentDatasets,
  followups, followupTasks, approvals,
  reports, reportTemplates, scheduledReports,
  pages, menus, catalogs, featureFlags, platformSettings,
  roles, userRoles, groups, groupMembers,
  auditLog, systemEvents, notifications,
  aiConversations, aiMessages, aiTaskState, glossaryTerms, pageDescriptors, guideCatalog, messageTemplatesCatalog,
  dashboardLayouts, letters, verificationRecords, breachSources, threatActors, backups, uiPolicies
} from "../drizzle/schema";

// ═══════════════════════════════════════════════════
// USER HELPERS
// ═══════════════════════════════════════════════════

export async function getAllUsers() {
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserById(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function getUserByOpenId(openId: string) {
  const [user] = await db.select().from(users).where(eq(users.openId, openId));
  return user;
}

export async function upsertUser(data: { openId: string; name?: string | null; email?: string | null; loginMethod?: string | null; lastSignedIn?: Date }) {
  const existing = await getUserByOpenId(data.openId);
  if (existing) {
    await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.openId, data.openId));
    return getUserByOpenId(data.openId);
  }
  await db.insert(users).values({ ...data, openId: data.openId } as any);
  return getUserByOpenId(data.openId);
}

export async function updateUser(id: number, data: Partial<typeof users.$inferInsert>) {
  await db.update(users).set(data).where(eq(users.id, id));
  return getUserById(id);
}

// ═══════════════════════════════════════════════════
// PRIVACY SITES
// ═══════════════════════════════════════════════════

export async function getSites(filters?: { status?: string; sector?: string; search?: string; limit?: number; offset?: number }) {
  const conditions = [];
  if (filters?.status) conditions.push(eq(sites.complianceStatus, filters.status as any));
  if (filters?.sector) conditions.push(eq(sites.sector, filters.sector));
  if (filters?.search) conditions.push(or(like(sites.siteNameAr, `%${filters.search}%`), like(sites.url, `%${filters.search}%`)));
  
  const query = db.select().from(sites).where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(sites.updatedAt))
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);
  return query;
}

export async function getSiteById(id: number) {
  const [site] = await db.select().from(sites).where(eq(sites.id, id));
  return site;
}

export async function createSite(data: typeof sites.$inferInsert) {
  const [result] = await db.insert(sites).values(data);
  return getSiteById(result.insertId);
}

export async function updateSite(id: number, data: Partial<typeof sites.$inferInsert>) {
  await db.update(sites).set(data).where(eq(sites.id, id));
  return getSiteById(id);
}

export async function getSiteStats() {
  const total = await db.select({ count: count() }).from(sites);
  const compliant = await db.select({ count: count() }).from(sites).where(eq(sites.complianceStatus, "compliant"));
  const partial = await db.select({ count: count() }).from(sites).where(eq(sites.complianceStatus, "partial"));
  const nonCompliant = await db.select({ count: count() }).from(sites).where(eq(sites.complianceStatus, "non_compliant"));
  const notWorking = await db.select({ count: count() }).from(sites).where(eq(sites.complianceStatus, "not_working"));
  const noPolicy = await db.select({ count: count() }).from(sites).where(eq(sites.hasPrivacyPolicy, false));
  const noContact = await db.select({ count: count() }).from(sites).where(eq(sites.hasContactInfo, false));
  
  return {
    total: total[0].count,
    compliant: compliant[0].count,
    partial: partial[0].count,
    nonCompliant: nonCompliant[0].count,
    notWorking: notWorking[0].count,
    noPolicy: noPolicy[0].count,
    noContact: noContact[0].count,
  };
}

export async function getSiteSectorDistribution() {
  return db.select({ sector: sites.sector, count: count() }).from(sites)
    .where(isNotNull(sites.sector))
    .groupBy(sites.sector)
    .orderBy(desc(count()));
}

// ═══════════════════════════════════════════════════
// SITE SCANS
// ═══════════════════════════════════════════════════

export async function getScansBySiteId(siteId: number) {
  return db.select().from(siteScans).where(eq(siteScans.siteId, siteId)).orderBy(desc(siteScans.createdAt));
}

export async function createScan(data: typeof siteScans.$inferInsert) {
  const [result] = await db.insert(siteScans).values(data);
  const [scan] = await db.select().from(siteScans).where(eq(siteScans.id, result.insertId));
  return scan;
}

// ═══════════════════════════════════════════════════
// SITE REQUIREMENTS
// ═══════════════════════════════════════════════════

export async function getRequirementsBySiteId(siteId: number) {
  return db.select().from(siteRequirements).where(eq(siteRequirements.siteId, siteId)).orderBy(asc(siteRequirements.clauseNumber));
}

// ═══════════════════════════════════════════════════
// PRIVACY POLICY VERSIONS
// ═══════════════════════════════════════════════════

export async function getPolicyVersionsBySiteId(siteId: number) {
  return db.select().from(privacyPolicyVersions).where(eq(privacyPolicyVersions.siteId, siteId)).orderBy(desc(privacyPolicyVersions.version));
}

// ═══════════════════════════════════════════════════
// INCIDENTS
// ═══════════════════════════════════════════════════

export async function getIncidents(filters?: { status?: string; severity?: string; sector?: string; search?: string; limit?: number; offset?: number }) {
  const conditions = [];
  if (filters?.status) conditions.push(eq(incidents.status, filters.status as any));
  if (filters?.severity) conditions.push(eq(incidents.severity, filters.severity as any));
  if (filters?.sector) conditions.push(eq(incidents.sector, filters.sector));
  if (filters?.search) conditions.push(or(like(incidents.title, `%${filters.search}%`), like(incidents.titleAr, `%${filters.search}%`)));
  
  return db.select().from(incidents).where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(incidents.updatedAt))
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);
}

export async function getIncidentById(id: number) {
  const [incident] = await db.select().from(incidents).where(eq(incidents.id, id));
  return incident;
}

export async function createIncident(data: typeof incidents.$inferInsert) {
  const [result] = await db.insert(incidents).values(data);
  return getIncidentById(result.insertId);
}

export async function updateIncident(id: number, data: Partial<typeof incidents.$inferInsert>) {
  await db.update(incidents).set(data).where(eq(incidents.id, id));
  return getIncidentById(id);
}

export async function getIncidentStats() {
  const total = await db.select({ count: count() }).from(incidents);
  const investigating = await db.select({ count: count() }).from(incidents).where(eq(incidents.status, "investigating"));
  const confirmed = await db.select({ count: count() }).from(incidents).where(eq(incidents.status, "confirmed"));
  const contained = await db.select({ count: count() }).from(incidents).where(eq(incidents.status, "contained"));
  const resolved = await db.select({ count: count() }).from(incidents).where(eq(incidents.status, "resolved"));
  const closed = await db.select({ count: count() }).from(incidents).where(eq(incidents.status, "closed"));
  const totalRecords = await db.select({ sum: sql<number>`COALESCE(SUM(estimatedRecords), 0)` }).from(incidents);
  
  return {
    total: total[0].count,
    investigating: investigating[0].count,
    confirmed: confirmed[0].count,
    contained: contained[0].count,
    resolved: resolved[0].count,
    closed: closed[0].count,
    totalEstimatedRecords: totalRecords[0].sum || 0,
  };
}

export async function getIncidentTimeline(incidentId: number) {
  return db.select().from(incidentTimeline).where(eq(incidentTimeline.incidentId, incidentId)).orderBy(desc(incidentTimeline.eventDate));
}

export async function getIncidentDatasets(incidentId: number) {
  return db.select().from(incidentDatasets).where(eq(incidentDatasets.incidentId, incidentId));
}

// ═══════════════════════════════════════════════════
// FOLLOW-UPS
// ═══════════════════════════════════════════════════

export async function getFollowups(filters?: { status?: string; type?: string; limit?: number; offset?: number }) {
  const conditions = [];
  if (filters?.status) conditions.push(eq(followups.status, filters.status as any));
  if (filters?.type) conditions.push(eq(followups.type, filters.type as any));
  
  return db.select().from(followups).where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(followups.updatedAt))
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);
}

export async function getFollowupById(id: number) {
  const [followup] = await db.select().from(followups).where(eq(followups.id, id));
  return followup;
}

export async function createFollowup(data: typeof followups.$inferInsert) {
  const [result] = await db.insert(followups).values(data);
  return getFollowupById(result.insertId);
}

export async function getFollowupStats() {
  const total = await db.select({ count: count() }).from(followups);
  const open = await db.select({ count: count() }).from(followups).where(eq(followups.status, "open"));
  const inProgress = await db.select({ count: count() }).from(followups).where(eq(followups.status, "in_progress"));
  const pendingApproval = await db.select({ count: count() }).from(followups).where(eq(followups.status, "pending_approval"));
  const completed = await db.select({ count: count() }).from(followups).where(eq(followups.status, "completed"));
  const overdue = await db.select({ count: count() }).from(followups).where(eq(followups.status, "overdue"));
  
  return { total: total[0].count, open: open[0].count, inProgress: inProgress[0].count, pendingApproval: pendingApproval[0].count, completed: completed[0].count, overdue: overdue[0].count };
}

// ═══════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════

export async function getReports(filters?: { type?: string; status?: string; limit?: number; offset?: number }) {
  const conditions = [];
  if (filters?.type) conditions.push(eq(reports.type, filters.type as any));
  if (filters?.status) conditions.push(eq(reports.status, filters.status as any));
  
  return db.select().from(reports).where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(reports.updatedAt))
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);
}

export async function getReportById(id: number) {
  const [report] = await db.select().from(reports).where(eq(reports.id, id));
  return report;
}

export async function createReport(data: typeof reports.$inferInsert) {
  const [result] = await db.insert(reports).values(data);
  return getReportById(result.insertId);
}

export async function getReportTemplates() {
  return db.select().from(reportTemplates).where(eq(reportTemplates.isActive, true)).orderBy(asc(reportTemplates.name));
}

export async function getScheduledReports() {
  return db.select().from(scheduledReports).orderBy(desc(scheduledReports.updatedAt));
}

// ═══════════════════════════════════════════════════
// ADMIN: PAGES, MENUS, CATALOGS
// ═══════════════════════════════════════════════════

export async function getPages() {
  return db.select().from(pages).orderBy(asc(pages.sortOrder));
}

export async function getMenus() {
  return db.select().from(menus).orderBy(asc(menus.sortOrder));
}

export async function getCatalogs(type?: string) {
  const conditions = type ? [eq(catalogs.catalogType, type)] : [];
  return db.select().from(catalogs).where(conditions.length ? and(...conditions) : undefined).orderBy(asc(catalogs.sortOrder));
}

export async function getFeatureFlags() {
  return db.select().from(featureFlags).orderBy(asc(featureFlags.featureKey));
}

export async function getRoles() {
  return db.select().from(roles).orderBy(asc(roles.name));
}

export async function getGroups() {
  return db.select().from(groups).orderBy(asc(groups.name));
}

// ═══════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════

export async function getAuditLog(filters?: { userId?: number; action?: string; entityType?: string; limit?: number; offset?: number }) {
  const conditions = [];
  if (filters?.userId) conditions.push(eq(auditLog.userId, filters.userId));
  if (filters?.action) conditions.push(eq(auditLog.action, filters.action));
  if (filters?.entityType) conditions.push(eq(auditLog.entityType, filters.entityType));
  
  return db.select().from(auditLog).where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(auditLog.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);
}

export async function createAuditEntry(data: typeof auditLog.$inferInsert) {
  const [result] = await db.insert(auditLog).values(data);
  return result.insertId;
}

// ═══════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════

export async function getUserNotifications(userId: number) {
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function markNotificationRead(id: number) {
  await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, id));
}

export async function getUnreadNotificationCount(userId: number) {
  const result = await db.select({ count: count() }).from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0].count;
}

// ═══════════════════════════════════════════════════
// AI CONVERSATIONS
// ═══════════════════════════════════════════════════

export async function getConversations(userId: number) {
  return db.select().from(aiConversations).where(eq(aiConversations.userId, userId)).orderBy(desc(aiConversations.updatedAt));
}

export async function getConversationMessages(conversationId: number) {
  return db.select().from(aiMessages).where(eq(aiMessages.conversationId, conversationId)).orderBy(asc(aiMessages.createdAt));
}

export async function createConversation(userId: number, title?: string, pageContext?: string) {
  const [result] = await db.insert(aiConversations).values({ userId, title, pageContext });
  const [conv] = await db.select().from(aiConversations).where(eq(aiConversations.id, result.insertId));
  return conv;
}

export async function addMessage(conversationId: number, role: "user" | "assistant" | "system", content: string, metadata?: any) {
  const [result] = await db.insert(aiMessages).values({ conversationId, role, content, metadata });
  await db.update(aiConversations).set({ updatedAt: new Date() }).where(eq(aiConversations.id, conversationId));
  const [msg] = await db.select().from(aiMessages).where(eq(aiMessages.id, result.insertId));
  return msg;
}

// ═══════════════════════════════════════════════════
// DASHBOARD LAYOUTS
// ═══════════════════════════════════════════════════

export async function getUserDashboardLayouts(userId: number) {
  return db.select().from(dashboardLayouts).where(or(eq(dashboardLayouts.userId, userId), eq(dashboardLayouts.isTemplate, true))).orderBy(desc(dashboardLayouts.updatedAt));
}

export async function saveDashboardLayout(data: typeof dashboardLayouts.$inferInsert) {
  if (data.id) {
    await db.update(dashboardLayouts).set(data).where(eq(dashboardLayouts.id, data.id as number));
    const [layout] = await db.select().from(dashboardLayouts).where(eq(dashboardLayouts.id, data.id as number));
    return layout;
  }
  const [result] = await db.insert(dashboardLayouts).values(data);
  const [layout] = await db.select().from(dashboardLayouts).where(eq(dashboardLayouts.id, result.insertId));
  return layout;
}

// ═══════════════════════════════════════════════════
// VERIFICATION
// ═══════════════════════════════════════════════════

export async function verifyDocument(code: string) {
  const [record] = await db.select().from(verificationRecords).where(eq(verificationRecords.code, code));
  if (record) {
    await db.update(verificationRecords).set({ verifiedCount: (record.verifiedCount || 0) + 1, lastVerifiedAt: new Date() }).where(eq(verificationRecords.id, record.id));
  }
  return record;
}

// ═══════════════════════════════════════════════════
// OVERVIEW STATS (combined)
// ═══════════════════════════════════════════════════

export async function getOverviewStats() {
  const siteStats = await getSiteStats();
  const incidentStats = await getIncidentStats();
  const followupStats = await getFollowupStats();
  
  return { sites: siteStats, incidents: incidentStats, followups: followupStats };
}

// ═══════════════════════════════════════════════════
// PLATFORM SETTINGS
// ═══════════════════════════════════════════════════

export async function getSettings() {
  return db.select().from(platformSettings).orderBy(asc(platformSettings.category));
}

export async function updateSetting(key: string, value: string, userId?: number) {
  const [existing] = await db.select().from(platformSettings).where(eq(platformSettings.settingKey, key));
  if (existing) {
    await db.update(platformSettings).set({ settingValue: value, updatedBy: userId }).where(eq(platformSettings.id, existing.id));
  } else {
    await db.insert(platformSettings).values({ settingKey: key, settingValue: value, updatedBy: userId });
  }
}

// ═══════════════════════════════════════════════════
// GLOSSARY & PAGE DESCRIPTORS
// ═══════════════════════════════════════════════════

export async function getGlossary() {
  return db.select().from(glossaryTerms).orderBy(asc(glossaryTerms.term));
}

export async function getPageDescriptor(slug: string) {
  const [descriptor] = await db.select().from(pageDescriptors).where(eq(pageDescriptors.pageSlug, slug));
  return descriptor;
}

export async function getGuides() {
  return db.select().from(guideCatalog).where(eq(guideCatalog.isActive, true)).orderBy(asc(guideCatalog.sortOrder));
}
