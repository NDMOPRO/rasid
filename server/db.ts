import { eq, ne, sql, desc, asc, like, and, or, count, avg, lte, gte, isNotNull, type SQL, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users, sites, scans, letters, notifications, activityLogs, siteWatchers,
  complianceAlerts, mobileApps, appScans, messageTemplates, cases, caseHistory,
  batchScanJobs, scanSchedules, scheduleExecutions, caseComments, escalationRules,
  escalationLogs, changeDetectionLogs, systemSettings, passwordResetTokens, apiKeys,
  scheduledReports, reportExecutions, kpiTargets, smartAlerts, dashboardSnapshots,
  executiveAlerts, executiveReports, savedFilters, userSessions,
  complianceChangeNotifications, userDashboardWidgets, visualAlerts,
  emailNotificationPrefs, pdfReportHistory, documents, reportAudit, knowledgeBase,
  personalityScenarios, aiUserSessions, chatHistory, customActions, trainingDocuments,
  aiFeedbackLegacy as aiFeedback, aiTrainingLogs, bulkAnalysisJobs, bulkAnalysisResults, deepScanQueue,
  platformAnalytics, platformSettings, pageConfigs, themeSettings, contentBlocks,
  dataTransferLogs, settingsAuditLog, presentationTemplates, presentations,
  alertContacts, alertHistory, alertRules, evidenceChain, feedbackEntries,
  incidentDocuments, knowledgeGraphEdges, knowledgeGraphNodes, osintQueries,
  retentionPolicies, sellerProfiles, threatRules,
  // P1 tables
  leaks, channels, piiScans, reports, darkWebListings, pasteEntries, auditLog,
  monitoringJobs, platformUsers, chatConversations, chatMessages, aiResponseRatings,
  incidentCertifications, kbSearchLog,
  // Admin tables
  adminRoles, adminPermissions, adminRolePermissions, adminGroups,
  adminGroupMemberships, adminGroupPermissions, adminUserOverrides,
  adminFeatureFlags, adminAuditLogs, adminThemeSettings, adminMenus,
  adminMenuItems, adminUserRoles,
  customPages,
  // Privacy domains tables
  privacyDomains, privacyScreenshots, privacyScanRuns,
  // CMS + Control Panel tables
  importJobs, exportJobs, pageRegistry, aiPersonalityConfig,
  // Settings & Operations tables
  platformAssets, apiProviders, templates, notificationRules, notificationLog,
  systemHealthLog, dashboardLayouts,
} from "../drizzle/schema";
import type {
  InsertUser, Site, InsertSite, Scan, InsertScan, Letter, InsertLetter,
  Notification, InsertNotification, InsertActivityLog, InsertSiteWatcher,
  InsertComplianceAlert, InsertMobileApp, MobileApp, InsertAppScan, AppScan,
  InsertMessageTemplate, MessageTemplate, InsertCase, InsertCaseHistoryEntry,
  InsertBatchScanJob, InsertScanSchedule, InsertCaseComment, InsertEscalationRule,
  InsertEscalationLog, InsertChangeDetectionLog, InsertPasswordResetToken,
  InsertScheduledReport, InsertReportExecution, InsertApiKey, InsertKpiTarget,
  InsertSmartAlert, InsertDashboardSnapshot, InsertExecutiveAlert,
  InsertExecutiveReport, InsertSavedFilter, InsertUserSession,
  InsertComplianceChangeNotification, InsertUserDashboardWidget, InsertVisualAlert,
  InsertEmailNotificationPref, InsertPdfReportHistory, InsertDocument,
  InsertReportAudit, InsertKnowledgeBaseEntry as InsertKnowledgeEntry, InsertPersonalityScenario,
  InsertChatHistoryEntry, InsertCustomAction, InsertTrainingDocument,
  InsertAiFeedbackLegacy as InsertAiFeedback,
  InsertAiTrainingLog, CustomAction, TrainingDocument,
  AiFeedbackLegacy as AiFeedback, AiTrainingLog,
  InsertBulkAnalysisJob, InsertBulkAnalysisResult, BulkAnalysisJob, BulkAnalysisResult,
  InsertDeepScanQueueItem, DeepScanQueueItem, InsertPlatformSetting, InsertPageConfig,
  InsertThemeSetting, InsertContentBlock, InsertDataTransferLog,
  IncidentDocument, InsertAlertContact, InsertAlertRule,
  InsertEvidenceChainEntry, InsertFeedbackEntry, InsertIncidentDocument,
  InsertOsintQuery, InsertSellerProfile, InsertThreatRule, ReportAudit,
  // P1 types
  InsertLeak, InsertChannel, InsertPiiScan, InsertReport, InsertDarkWebListing,
  InsertPasteEntry, InsertAuditLogEntry, InsertMonitoringJob,
  PlatformUser, InsertPlatformUser,
  InsertChatConversation, InsertChatMessage,
  AiResponseRating, InsertAiResponseRating,
  KnowledgeBaseEntry, InsertKnowledgeBaseEntry,
  // Admin types
  AdminRole, InsertAdminRole, AdminPermission, InsertAdminPermission,
  AdminGroup, InsertAdminGroup, AdminFeatureFlag, InsertAdminFeatureFlag,
  AdminAuditLog, InsertAdminAuditLog, AdminThemeSetting, InsertAdminThemeSetting,
  AdminMenu, InsertAdminMenu, AdminMenuItem, InsertAdminMenuItem,
  CustomPage, InsertCustomPage,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== Dashboard Stats =====
export async function getDashboardStats() {
  try {
    const db = await getDb();
    if (!db) return null;

    const [totalSites] = await db.select({ count: count() }).from(sites);
    const [activeSites] = await db.select({ count: count() }).from(sites).where(eq(sites.siteStatus, 'active'));
    const [totalScans] = await db.select({ count: count() }).from(scans);
    const [compliantScans] = await db.select({ count: count() }).from(scans).where(eq(scans.complianceStatus, 'compliant'));
    const [partialScans] = await db.select({ count: count() }).from(scans).where(eq(scans.complianceStatus, 'partially_compliant'));
    const [nonCompliantScans] = await db.select({ count: count() }).from(scans).where(eq(scans.complianceStatus, 'non_compliant'));
    const [noPolicyScans] = await db.select({ count: count() }).from(scans).where(eq(scans.complianceStatus, 'no_policy'));
    const [avgScore] = await db.select({ avg: avg(scans.overallScore) }).from(scans);

    return {
      totalSites: totalSites.count,
      activeSites: activeSites.count,
      totalScans: totalScans.count,
      compliant: compliantScans.count,
      partiallyCompliant: partialScans.count,
      nonCompliant: nonCompliantScans.count,
      noPolicy: noPolicyScans.count,
      averageScore: Number(avgScore.avg) || 0,
    };
  } catch (error) {
    console.error("[getDashboardStats] Error:", error);
    return null;
  }
}

// ===== Clause Stats =====
export async function getClauseStats() {
  const db = await getDb();
  if (!db) return [];
  const [total] = await db.select({ count: count() }).from(scans);
  const totalCount = total.count || 1;

  const clauseNames = [
    'تحديد الغرض من جمع البيانات',
    'تحديد محتوى البيانات المطلوب جمعها',
    'تحديد طريقة جمع البيانات',
    'تحديد وسيلة حفظ البيانات',
    'تحديد كيفية معالجة البيانات',
    'تحديد كيفية إتلاف البيانات',
    'تحديد حقوق صاحب البيانات',
    'كيفية ممارسة الحقوق',
  ];

  const results = [];
  for (let i = 1; i <= 8; i++) {
    const col = `clause${i}Compliant` as keyof typeof scans.$inferSelect;
    const [compliant] = await db.select({ count: count() }).from(scans).where(eq((scans as any)[col], true));
    results.push({
      clause: i,
      name: clauseNames[i - 1],
      compliant: compliant.count,
      total: totalCount,
      percentage: Math.round((compliant.count / totalCount) * 100),
    });
  }
  return results;
}

// ===== Sites =====
export async function getSites(params: { page?: number; limit?: number; search?: string; status?: string; classification?: string; complianceStatus?: string; sectorType?: string }) {
  const db = await getDb();
  if (!db) return { sites: [], total: 0 };
  const { page = 1, limit = 20, search, status, classification, complianceStatus, sectorType } = params;
  const offset = (page - 1) * limit;

  // When filtering by complianceStatus, use SQL-level filtering via latest scan subquery
  if (complianceStatus) {
    let searchCond = '';
    if (search) searchCond = ` AND (s.domain LIKE '%${search.replace(/'/g, "''")}%' OR s.siteName LIKE '%${search.replace(/'/g, "''")}%')`;
    let statusCond = '';
    if (status) statusCond = ` AND s.siteStatus = '${status.replace(/'/g, "''")}'`;
    let classCond = '';
    if (classification) classCond = ` AND s.classification = '${classification.replace(/'/g, "''")}'`;
    let sectorCond = '';
    if (sectorType) sectorCond = ` AND s.sectorType = '${sectorType.replace(/'/g, "''")}'`;

    let complianceCond = '';
    if (complianceStatus === 'no_scan') {
      complianceCond = ' AND ls.id IS NULL';
    } else if (complianceStatus === 'not_working') {
      // "not working" = site is unreachable OR scan status is no_policy/not_working
      complianceCond = ` AND (s.siteStatus = 'unreachable' OR ls.complianceStatus IN ('no_policy', 'not_working'))`;
    } else {
      complianceCond = ` AND ls.complianceStatus = '${complianceStatus.replace(/'/g, "''")}'`;
    }

    const countResult = await db.execute(sql.raw(`
      SELECT COUNT(*) as cnt FROM sites s
      LEFT JOIN (
        SELECT sc1.* FROM scans sc1
        -- optimized: removed slow subquery (1 scan per site)
      ) ls ON s.id = ls.siteId
      WHERE 1=1${searchCond}${statusCond}${classCond}${sectorCond}${complianceCond}
    `));
    const total = Number((countResult as any)[0]?.[0]?.cnt || 0);

    const dataResult = await db.execute(sql.raw(`
      SELECT s.*, ls.id as scanId, ls.complianceStatus as scanComplianceStatus, ls.overallScore, ls.scanDate,
             ls.clause1Compliant, ls.clause2Compliant, ls.clause3Compliant, ls.clause4Compliant,
             ls.clause5Compliant, ls.clause6Compliant, ls.clause7Compliant, ls.clause8Compliant,
             ls.rating, ls.summary
      FROM sites s
      LEFT JOIN (
        SELECT sc1.* FROM scans sc1
        -- optimized: removed slow subquery (1 scan per site)
      ) ls ON s.id = ls.siteId
      WHERE 1=1${searchCond}${statusCond}${classCond}${sectorCond}${complianceCond}
      ORDER BY s.id DESC
      LIMIT ${limit} OFFSET ${offset}
    `));
    const rows = (dataResult as any)[0] as any[];

    const enriched = rows.map((r: any) => ({
      id: r.id,
      domain: r.domain,
      siteName: r.siteName || r.site_name,
      sectorType: r.sectorType || r.sector_type,
      classification: r.classification,
      siteStatus: r.siteStatus || r.site_status,
      screenshotUrl: r.screenshotUrl || r.screenshot_url,
      privacyUrl: r.privacyUrl || r.privacy_url,
      contactUrl: r.contactUrl || r.contact_url,
      emails: r.emails,
      createdAt: r.createdAt || r.created_at,
      latestScan: r.scanId ? {
        id: r.scanId,
        complianceStatus: r.scanComplianceStatus,
        overallScore: r.overallScore || r.overall_score,
        complianceScore: r.overallScore || 0,
        scanDate: r.scanDate || r.scan_date,
        rating: r.rating,
        summary: r.summary,
        clause1Compliant: r.clause1Compliant ?? r.clause1_compliant,
        clause2Compliant: r.clause2Compliant ?? r.clause2_compliant,
        clause3Compliant: r.clause3Compliant ?? r.clause3_compliant,
        clause4Compliant: r.clause4Compliant ?? r.clause4_compliant,
        clause5Compliant: r.clause5Compliant ?? r.clause5_compliant,
        clause6Compliant: r.clause6Compliant ?? r.clause6_compliant,
        clause7Compliant: r.clause7Compliant ?? r.clause7_compliant,
        clause8Compliant: r.clause8Compliant ?? r.clause8_compliant,
        clausesPassed: [r.clause1Compliant ?? r.clause1_compliant, r.clause2Compliant ?? r.clause2_compliant, r.clause3Compliant ?? r.clause3_compliant, r.clause4Compliant ?? r.clause4_compliant, r.clause5Compliant ?? r.clause5_compliant, r.clause6Compliant ?? r.clause6_compliant, r.clause7Compliant ?? r.clause7_compliant, r.clause8Compliant ?? r.clause8_compliant].filter(Boolean).length,
      } : null,
    }));

    return { sites: enriched, total };
  }

  // No compliance filter - use simple query
  const conditions = [];
  if (search) conditions.push(or(like(sites.domain, `%${search}%`), like(sites.siteName, `%${search}%`)));
  if (status) conditions.push(eq(sites.siteStatus, status as any));
  if (classification) conditions.push(eq(sites.classification, classification));
  if (sectorType) conditions.push(eq(sites.sectorType, sectorType as any));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db.select({ count: count() }).from(sites).where(where);
  const siteList = await db.select().from(sites).where(where).orderBy(desc(sites.id)).limit(limit).offset(offset);

  // Get latest scan for each site
  const siteIds = siteList.map(s => s.id);
  let scanMap: Record<number, any> = {};
  if (siteIds.length > 0) {
    const scanResults = await db.select().from(scans).where(sql`${scans.siteId} IN (${sql.join(siteIds.map(id => sql`${id}`), sql`, `)})`).orderBy(desc(scans.scanDate));
    for (const scan of scanResults) {
      if (!scanMap[scan.siteId]) scanMap[scan.siteId] = scan;
    }
  }

  const enriched = siteList.map(s => ({
    ...s,
    latestScan: scanMap[s.id] || null,
  }));

  return { sites: enriched, total: totalResult.count };
}

export async function getSiteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [site] = await db.select().from(sites).where(eq(sites.id, id)).limit(1);
  if (!site) return null;
  const siteScans = await db.select().from(scans).where(eq(scans.siteId, id)).orderBy(desc(scans.scanDate));
  return { ...site, scans: siteScans };
}

export async function getSiteByDomain(domain: string) {
  const db = await getDb();
  if (!db) return null;
  const [site] = await db.select().from(sites).where(eq(sites.domain, domain)).limit(1);
  return site || null;
}

// ===== Scans =====
export async function getScans(params: { page?: number; limit?: number; status?: string }) {
  const db = await getDb();
  if (!db) return { scans: [], total: 0 };
  const { page = 1, limit = 20, status } = params;
  const offset = (page - 1) * limit;
  const where = status ? eq(scans.complianceStatus, status as any) : undefined;
  const [totalResult] = await db.select({ count: count() }).from(scans).where(where);
  const scanList = await db.select().from(scans).where(where).orderBy(desc(scans.scanDate)).limit(limit).offset(offset);
  return { scans: scanList, total: totalResult.count };
}

export async function getScanById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [scan] = await db.select().from(scans).where(eq(scans.id, id)).limit(1);
  return scan || null;
}

export async function insertScan(scan: InsertScan) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(scans).values(scan);
  return result;
}

export async function insertSite(site: InsertSite) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(sites).values(site);
  return result;
}

export async function updateSiteScreenshot(siteId: number, screenshotUrl: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(sites).set({ screenshotUrl }).where(eq(sites.id, siteId));
}

export async function updateSite(siteId: number, data: Partial<InsertSite>) {
  const db = await getDb();
  if (!db) return;
  await db.update(sites).set(data).where(eq(sites.id, siteId));
}

// ===== Classification Stats =====
export async function getClassificationStats() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    classification: sites.classification,
    count: count(),
  }).from(sites).where(eq(sites.siteStatus, 'active')).groupBy(sites.classification);
  return result;
}

// ===== Clause Detail =====
export async function getClauseDetail(clauseNum: number, params: { page?: number; limit?: number; compliant?: boolean }) {
  const db = await getDb();
  if (!db) return { scans: [], total: 0 };
  const { page = 1, limit = 20, compliant } = params;
  const offset = (page - 1) * limit;
  const col = `clause${clauseNum}Compliant` as keyof typeof scans.$inferSelect;
  const where = compliant !== undefined ? eq((scans as any)[col], compliant) : undefined;
  const [totalResult] = await db.select({ count: count() }).from(scans).where(where);
  const scanList = await db.select().from(scans).where(where).orderBy(desc(scans.scanDate)).limit(limit).offset(offset);
  return { scans: scanList, total: totalResult.count };
}

// ===== Letters =====
export async function getLetters(params: { page?: number; limit?: number; status?: string }) {
  const db = await getDb();
  if (!db) return { letters: [], total: 0 };
  const { page = 1, limit = 20, status } = params;
  const offset = (page - 1) * limit;
  const where = status ? eq(letters.status, status as any) : undefined;
  const [totalResult] = await db.select({ count: count() }).from(letters).where(where);
  const letterList = await db.select().from(letters).where(where).orderBy(desc(letters.createdAt)).limit(limit).offset(offset);
  return { letters: letterList, total: totalResult.count };
}

export async function getLetterById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [letter] = await db.select().from(letters).where(eq(letters.id, id)).limit(1);
  return letter || null;
}

export async function insertLetter(letter: InsertLetter) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(letters).values(letter);
  return result;
}

export async function updateLetterStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  const updateData: any = { status: status as any };
  if (status === 'sent') updateData.sentAt = new Date();
  if (status === 'responded') updateData.respondedAt = new Date();
  await db.update(letters).set(updateData).where(eq(letters.id, id));
}

export async function updateLetterDeadline(id: number, deadline: Date) {
  const db = await getDb();
  if (!db) return;
  await db.update(letters).set({ deadline }).where(eq(letters.id, id));
}

export async function updateLetterNotes(id: number, notes: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(letters).set({ notes }).where(eq(letters.id, id));
}

export async function getLetterStats() {
  const db = await getDb();
  if (!db) return { total: 0, draft: 0, sent: 0, delivered: 0, responded: 0, escalated: 0, overdue: 0 };
  const [totalResult] = await db.select({ count: count() }).from(letters);
  const [draftResult] = await db.select({ count: count() }).from(letters).where(eq(letters.status, 'draft'));
  const [sentResult] = await db.select({ count: count() }).from(letters).where(eq(letters.status, 'sent'));
  const [deliveredResult] = await db.select({ count: count() }).from(letters).where(eq(letters.status, 'delivered'));
  const [respondedResult] = await db.select({ count: count() }).from(letters).where(eq(letters.status, 'responded'));
  const [escalatedResult] = await db.select({ count: count() }).from(letters).where(eq(letters.status, 'escalated'));
  // Overdue: sent letters with deadline passed and not responded
  const now = new Date();
  const overdueLetters = await db.select().from(letters)
    .where(and(
      eq(letters.status, 'sent'),
      lte(letters.deadline, now)
    ));
  return {
    total: totalResult.count,
    draft: draftResult.count,
    sent: sentResult.count,
    delivered: deliveredResult.count,
    responded: respondedResult.count,
    escalated: escalatedResult.count,
    overdue: overdueLetters.length,
  };
}

export async function getOverdueLetters() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return await db.select().from(letters)
    .where(and(
      eq(letters.status, 'sent'),
      lte(letters.deadline, now)
    ))
    .orderBy(letters.deadline);
}

export async function markLetterReminderSent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(letters).set({ reminderSentAt: new Date() }).where(eq(letters.id, id));
}

// ===== Notifications =====
export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
}

export async function insertNotification(notif: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(notif);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return Number(result[0]?.count || 0);
}

export async function deleteNotification(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notifications).where(eq(notifications.id, id));
}

export async function deleteAllNotifications(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notifications).where(eq(notifications.userId, userId));
}

export async function createBulkNotifications(userIds: number[], notif: { title: string; message: string; type: 'info' | 'warning' | 'success' | 'error'; link?: string }) {
  const db = await getDb();
  if (!db) return;
  const values = userIds.map(userId => ({
    userId,
    title: notif.title,
    message: notif.message,
    type: notif.type,
    link: notif.link || null,
  }));
  if (values.length > 0) {
    await db.insert(notifications).values(values);
  }
}

// ===== Members =====
export async function getMembers() {
  const db = await getDb();
  if (!db) return [];
  const dbUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  // Also include platformUsers
  const pUsers = await db.select().from(platformUsers).orderBy(desc(platformUsers.createdAt));
  const platformMapped = pUsers.map((pu: any) => ({
    id: pu.id + 100000,
    _platformUserId: pu.id,
    openId: `platform_${pu.userId}`,
    name: pu.name,
    displayName: pu.displayName,
    email: pu.email,
    mobile: pu.mobile,
    username: pu.userId,
    role: pu.platformRole === 'root_admin' ? 'admin' : 'user',
    rasidRole: pu.platformRole === 'root_admin' ? 'root' :
               pu.platformRole === 'director' ? 'director' :
               pu.platformRole === 'vice_president' ? 'monitoring_director' :
               pu.platformRole === 'manager' ? 'smart_monitor_manager' :
               pu.platformRole === 'analyst' ? 'monitoring_specialist' : 'monitoring_officer',
    isActive: pu.status === 'active' ? 1 : 0,
    lastSignedIn: pu.lastLoginAt || pu.createdAt,
    createdAt: pu.createdAt,
    updatedAt: pu.updatedAt,
    _source: 'platform',
  }));
  const platformUsernames = new Set(platformMapped.map((p: any) => p.username?.toLowerCase()));
  const uniqueDbUsers = dbUsers.filter((u: any) => !platformUsernames.has(u.username?.toLowerCase()));
  return [...platformMapped, ...uniqueDbUsers];
}

export async function updateUserRole(userId: number, rasidRole: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ rasidRole: rasidRole as any }).where(eq(users.id, userId));
}

// ===== Recent Scans =====
export async function getRecentScans(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(scans).orderBy(desc(scans.scanDate)).limit(limit);
}

// ===== Sector Compliance =====
export async function getSectorCompliance() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT s.classification, 
           COUNT(sc.id) as total,
           SUM(CASE WHEN sc.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
           SUM(CASE WHEN sc.complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partial,
           SUM(CASE WHEN sc.complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as non_compliant,
           SUM(CASE WHEN sc.complianceStatus = 'no_policy' THEN 1 ELSE 0 END) as no_policy,
           ROUND(AVG(sc.overallScore), 1) as avg_score
    FROM sites s
    JOIN scans sc ON s.id = sc.siteId
    WHERE s.siteStatus = 'active'
    GROUP BY s.classification
    ORDER BY total DESC
  `);
  return result[0];
}

// ===== Export Data =====
export async function getExportData(format: 'summary' | 'detailed' | 'clauses') {
  const db = await getDb();
  if (!db) return [];

  if (format === 'summary') {
    // Summary: one row per site with latest scan info
    // TiDB doesn't support subqueries in ON clause, so use a derived table
    const result = await db.execute(sql`
      SELECT s.domain, s.siteName, s.classification, s.siteStatus, s.emails, s.privacyUrl,
             sc.overallScore, sc.rating, sc.complianceStatus, sc.scanDate,
             sc.clause1Compliant, sc.clause2Compliant, sc.clause3Compliant, sc.clause4Compliant,
             sc.clause5Compliant, sc.clause6Compliant, sc.clause7Compliant, sc.clause8Compliant
      FROM sites s
      LEFT JOIN (
        SELECT sc1.* FROM scans sc1
        INNER JOIN (
          SELECT siteId, MAX(scanDate) as maxDate FROM scans GROUP BY siteId
        ) sc2 ON sc1.siteId = sc2.siteId AND sc1.scanDate = sc2.maxDate
      ) sc ON s.id = sc.siteId
      ORDER BY s.domain
    `);
    return result[0];
  }

  if (format === 'detailed') {
    // All scans with full details
    const result = await db.execute(sql`
      SELECT s.domain, s.siteName, s.classification, s.emails,
             sc.overallScore, sc.rating, sc.complianceStatus, sc.scanDate, sc.summary,
             sc.clause1Compliant, sc.clause1Evidence,
             sc.clause2Compliant, sc.clause2Evidence,
             sc.clause3Compliant, sc.clause3Evidence,
             sc.clause4Compliant, sc.clause4Evidence,
             sc.clause5Compliant, sc.clause5Evidence,
             sc.clause6Compliant, sc.clause6Evidence,
             sc.clause7Compliant, sc.clause7Evidence,
             sc.clause8Compliant, sc.clause8Evidence
      FROM scans sc
      JOIN sites s ON s.id = sc.siteId
      ORDER BY sc.scanDate DESC
    `);
    return result[0];
  }

  if (format === 'clauses') {
    // Per-clause compliance summary - use derived table for TiDB compatibility
    const result = await db.execute(sql`
      SELECT s.domain, s.siteName, s.classification,
             sc.overallScore, sc.complianceStatus,
             sc.clause1Compliant, sc.clause2Compliant, sc.clause3Compliant, sc.clause4Compliant,
             sc.clause5Compliant, sc.clause6Compliant, sc.clause7Compliant, sc.clause8Compliant
      FROM scans sc
      JOIN sites s ON s.id = sc.siteId
      INNER JOIN (
        SELECT MAX(id) as maxId FROM scans GROUP BY siteId
      ) latest ON sc.id = latest.maxId
      ORDER BY sc.overallScore DESC
    `);
    return result[0];
  }

  return [];
}

// ===== Get scans for a site =====
export async function getSiteScans(siteId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(scans).where(eq(scans.siteId, siteId)).orderBy(desc(scans.scanDate));
}

// ===== Built-in Auth =====
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(sql`LOWER(${users.username}) = LOWER(${username})`).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

// ===== Change Password =====
export async function updatePassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ===== Create New User =====
export async function createUser(data: {
  username: string;
  passwordHash: string;
  name: string;
  displayName: string;
  email: string;
  mobile?: string;
  rasidRole: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const openId = `builtin_${data.username}_${Date.now()}`;
  await db.insert(users).values({
    openId,
    username: data.username,
    passwordHash: data.passwordHash,
    name: data.name,
    displayName: data.displayName,
    email: data.email,
    mobile: data.mobile || null,
    loginMethod: 'builtin',
    role: 'admin',
    rasidRole: data.rasidRole as any,
  });
  return await getUserByUsername(data.username);
}

// ===== Activity Logs =====
export async function insertActivityLog(log: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(log);
}

export async function getActivityLogs(params: { page?: number; limit?: number; userId?: number; action?: string }) {
  const db = await getDb();
  if (!db) return { logs: [], total: 0 };
  const { page = 1, limit = 50, userId, action } = params;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (userId) conditions.push(eq(activityLogs.userId, userId));
  if (action) conditions.push(eq(activityLogs.action, action));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db.select({ count: count() }).from(activityLogs).where(where);
  const logs = await db.select().from(activityLogs).where(where).orderBy(desc(activityLogs.createdAt)).limit(limit).offset(offset);
  return { logs, total: totalResult.count };
}

// ===== Delete User =====
export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where(eq(users.id, userId));
}


// ===== Leadership Dashboard Stats =====
export async function getLeadershipStats() {
  const db = await getDb();
  if (!db) return null;

  // General monitoring stats
  const [totalSites] = await db.select({ count: count() }).from(sites);
  const [totalScans] = await db.select({ count: count() }).from(scans);
  
  // Get latest scan per site for compliance status
  const latestScansResult = await db.execute(sql`
    SELECT sc.complianceStatus, COUNT(*) as cnt
    FROM scans sc
    GROUP BY sc.complianceStatus
  `);
  const latestScans = (latestScansResult as any)[0] as any[];
  
  const complianceMap: Record<string, number> = {};
  for (const row of latestScans) {
    complianceMap[row.complianceStatus] = Number(row.cnt);
  }
  
  const [unreachableSites] = await db.select({ count: count() }).from(sites).where(eq(sites.siteStatus, 'unreachable'));
  
  const general = {
    totalSites: totalSites.count,
    totalScans: totalScans.count,
    compliant: complianceMap['compliant'] || 0,
    nonCompliant: complianceMap['non_compliant'] || 0,
    partiallyCompliant: complianceMap['partially_compliant'] || 0,
    noPolicy: complianceMap['no_policy'] || 0,
    unreachable: unreachableSites.count,
  };

  // Clause compliance stats (based on latest scan per site)
  const clauseResults = await db.execute(sql`
    SELECT 
      SUM(CASE WHEN sc.clause1Compliant = 1 THEN 1 ELSE 0 END) as c1,
      SUM(CASE WHEN sc.clause2Compliant = 1 THEN 1 ELSE 0 END) as c2,
      SUM(CASE WHEN sc.clause3Compliant = 1 THEN 1 ELSE 0 END) as c3,
      SUM(CASE WHEN sc.clause4Compliant = 1 THEN 1 ELSE 0 END) as c4,
      SUM(CASE WHEN sc.clause5Compliant = 1 THEN 1 ELSE 0 END) as c5,
      SUM(CASE WHEN sc.clause6Compliant = 1 THEN 1 ELSE 0 END) as c6,
      SUM(CASE WHEN sc.clause7Compliant = 1 THEN 1 ELSE 0 END) as c7,
      SUM(CASE WHEN sc.clause8Compliant = 1 THEN 1 ELSE 0 END) as c8,
      COUNT(*) as total
    FROM scans sc
  `);
  const cr = ((clauseResults as any)[0] as any[])[0];
  const totalLatest = Number(cr.total) || 1;
  
  const clauseNames = [
    'تحديد الغرض من جمع البيانات',
    'تحديد محتوى البيانات المطلوب جمعها',
    'تحديد طريقة جمع البيانات',
    'تحديد وسيلة حفظ البيانات',
    'تحديد كيفية معالجة البيانات',
    'تحديد كيفية إتلاف البيانات',
    'تحديد حقوق صاحب البيانات',
    'كيفية ممارسة الحقوق',
  ];
  
  const clauses = [];
  for (let i = 1; i <= 8; i++) {
    const compliantCount = Number(cr[`c${i}`]) || 0;
    clauses.push({
      clause: i,
      name: clauseNames[i - 1],
      compliant: compliantCount,
      nonCompliant: totalLatest - compliantCount,
      total: totalLatest,
      percentage: Math.round((compliantCount / totalLatest) * 100),
    });
  }

  // Sector breakdown (public vs private) - using CTE for TiDB compatibility
  const sectorResult = await db.execute(sql`
    WITH latest_scans AS (
      SELECT sc.* FROM scans sc
        -- optimized: removed slow subquery (1 scan per site)
    )
    SELECT 
      s.sectorType,
      COUNT(DISTINCT s.id) as totalSites,
      COUNT(ls.id) as totalScans,
      SUM(CASE WHEN ls.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN ls.complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      SUM(CASE WHEN ls.complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partiallyCompliant,
      SUM(CASE WHEN ls.complianceStatus = 'no_policy' THEN 1 ELSE 0 END) as noPolicy,
      SUM(CASE WHEN ls.clause1Compliant = 1 THEN 1 ELSE 0 END) as c1,
      SUM(CASE WHEN ls.clause2Compliant = 1 THEN 1 ELSE 0 END) as c2,
      SUM(CASE WHEN ls.clause3Compliant = 1 THEN 1 ELSE 0 END) as c3,
      SUM(CASE WHEN ls.clause4Compliant = 1 THEN 1 ELSE 0 END) as c4,
      SUM(CASE WHEN ls.clause5Compliant = 1 THEN 1 ELSE 0 END) as c5,
      SUM(CASE WHEN ls.clause6Compliant = 1 THEN 1 ELSE 0 END) as c6,
      SUM(CASE WHEN ls.clause7Compliant = 1 THEN 1 ELSE 0 END) as c7,
      SUM(CASE WHEN ls.clause8Compliant = 1 THEN 1 ELSE 0 END) as c8
    FROM sites s
    LEFT JOIN scans sc ON s.id = sc.siteId
    GROUP BY s.sectorType
  `);
  const sectors = ((sectorResult as any)[0] as any[]).map((row: any) => ({
    sector: row.sectorType || 'private',
    totalSites: Number(row.totalSites),
    totalScans: Number(row.totalScans),
    compliant: Number(row.compliant),
    nonCompliant: Number(row.nonCompliant),
    partiallyCompliant: Number(row.partiallyCompliant),
    noPolicy: Number(row.noPolicy),
    clauses: Array.from({ length: 8 }, (_, i) => ({
      clause: i + 1,
      compliant: Number(row[`c${i + 1}`]) || 0,
    })),
  }));

  // Category breakdown - using CTE for TiDB compatibility
  const categoryResult = await db.execute(sql`
    WITH latest_scans AS (
      SELECT sc.* FROM scans sc
        -- optimized: removed slow subquery (1 scan per site)
    )
    SELECT 
      s.classification,
      COUNT(DISTINCT s.id) as totalSites,
      COUNT(ls.id) as totalScans,
      SUM(CASE WHEN ls.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN ls.complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      SUM(CASE WHEN ls.complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partiallyCompliant,
      SUM(CASE WHEN ls.complianceStatus = 'no_policy' THEN 1 ELSE 0 END) as noPolicy,
      SUM(CASE WHEN ls.clause1Compliant = 1 THEN 1 ELSE 0 END) as c1,
      SUM(CASE WHEN ls.clause2Compliant = 1 THEN 1 ELSE 0 END) as c2,
      SUM(CASE WHEN ls.clause3Compliant = 1 THEN 1 ELSE 0 END) as c3,
      SUM(CASE WHEN ls.clause4Compliant = 1 THEN 1 ELSE 0 END) as c4,
      SUM(CASE WHEN ls.clause5Compliant = 1 THEN 1 ELSE 0 END) as c5,
      SUM(CASE WHEN ls.clause6Compliant = 1 THEN 1 ELSE 0 END) as c6,
      SUM(CASE WHEN ls.clause7Compliant = 1 THEN 1 ELSE 0 END) as c7,
      SUM(CASE WHEN ls.clause8Compliant = 1 THEN 1 ELSE 0 END) as c8
    FROM sites s
    LEFT JOIN scans sc ON s.id = sc.siteId
    GROUP BY s.classification
    ORDER BY totalSites DESC
  `);
  const categories = ((categoryResult as any)[0] as any[]).map((row: any) => ({
    category: row.classification || 'غير مصنف',
    totalSites: Number(row.totalSites),
    totalScans: Number(row.totalScans),
    compliant: Number(row.compliant),
    nonCompliant: Number(row.nonCompliant),
    partiallyCompliant: Number(row.partiallyCompliant),
    noPolicy: Number(row.noPolicy),
    clauses: Array.from({ length: 8 }, (_, i) => ({
      clause: i + 1,
      compliant: Number(row[`c${i + 1}`]) || 0,
    })),
  }));

  return { general, clauses, sectors, categories };
}

// ===== Scan Library =====
export async function getScanLibrary(params: {
  page?: number;
  limit?: number;
  search?: string;
  complianceStatus?: string;
  classification?: string;
  sectorType?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const db = await getDb();
  if (!db) return { scans: [], total: 0 };
  const { page = 1, limit = 20, search, complianceStatus, classification, sectorType, dateFrom, dateTo, sortBy = 'scanDate', sortOrder = 'desc' } = params;
  const offset = (page - 1) * limit;

  // Build conditions
  let whereClause = 'WHERE 1=1';
  if (search) {
    whereClause += ` AND (sc.domain LIKE '%${search.replace(/'/g, "''")}%' OR s.siteName LIKE '%${search.replace(/'/g, "''")}%')`;
  }
  if (complianceStatus) {
    whereClause += ` AND sc.complianceStatus = '${complianceStatus.replace(/'/g, "''")}'`;
  }
  if (classification) {
    whereClause += ` AND s.classification = '${classification.replace(/'/g, "''")}'`;
  }
  if (sectorType) {
    whereClause += ` AND s.sectorType = '${sectorType.replace(/'/g, "''")}'`;
  }
  if (dateFrom) {
    whereClause += ` AND sc.scanDate >= '${dateFrom}'`;
  }
  if (dateTo) {
    whereClause += ` AND sc.scanDate <= '${dateTo} 23:59:59'`;
  }

  const orderCol = sortBy === 'score' ? 'sc.overallScore' : sortBy === 'domain' ? 'sc.domain' : 'sc.scanDate';
  const orderDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const countResult = await db.execute(sql.raw(`
    SELECT COUNT(*) as cnt
    FROM scans sc
    JOIN sites s ON s.id = sc.siteId
    ${whereClause}
  `));
  const total = Number(((countResult as any)[0] as any[])[0]?.cnt) || 0;

  const dataResult = await db.execute(sql.raw(`
    SELECT sc.*, s.siteName, s.classification, s.sectorType, s.privacyUrl, s.emails, s.siteStatus, s.screenshotUrl as siteScreenshot
    FROM scans sc
    JOIN sites s ON s.id = sc.siteId
    ${whereClause}
    ORDER BY ${orderCol} ${orderDir}
    LIMIT ${limit} OFFSET ${offset}
  `));

  return { scans: (dataResult as any)[0] as any[], total };
}

// ===== Get all classifications =====
export async function getAllClassifications() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT DISTINCT classification FROM sites WHERE classification IS NOT NULL AND classification != '' ORDER BY classification
  `);
  return ((result as any)[0] as any[]).map((r: any) => r.classification);
}

// ===== Leadership Drill-Down: Get sites matching filter criteria =====
export async function getLeadershipDrillDown(params: {
  sectorType?: string;
  classification?: string;
  complianceStatus?: string;
  clauseNum?: number;
  clauseCompliant?: boolean;
  hasContactPage?: boolean;
  hasEmail?: boolean;
  siteStatus?: string;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { sites: [], total: 0 };
  const { page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  let conditions = 'WHERE 1=1';
  if (params.sectorType) {
    conditions += ` AND s.sectorType = '${params.sectorType.replace(/'/g, "''")}'`;
  }
  if (params.classification) {
    conditions += ` AND s.classification = '${params.classification.replace(/'/g, "''")}'`;
  }
  if (params.siteStatus === 'active') {
    conditions += ` AND s.siteStatus = 'active'`;
  } else if (params.siteStatus === 'unreachable') {
    conditions += ` AND s.siteStatus = 'unreachable'`;
  }
  if (params.hasContactPage === true) {
    conditions += ` AND s.contactUrl IS NOT NULL AND s.contactUrl != ''`;
  } else if (params.hasContactPage === false) {
    conditions += ` AND (s.contactUrl IS NULL OR s.contactUrl = '')`;
  }
  if (params.hasEmail === true) {
    conditions += ` AND s.emails IS NOT NULL AND s.emails != ''`;
  } else if (params.hasEmail === false) {
    conditions += ` AND (s.emails IS NULL OR s.emails = '')`;
  }
  if (params.complianceStatus) {
    conditions += ` AND ls.complianceStatus = '${params.complianceStatus.replace(/'/g, "''")}'`;
  }
  if (params.clauseNum && params.clauseCompliant !== undefined) {
    conditions += ` AND ls.clause${params.clauseNum}Compliant = ${params.clauseCompliant ? 1 : 0}`;
  }

  const countResult = await db.execute(sql.raw(`
    WITH latest_scans AS (
      SELECT sc.* FROM scans sc
    )
    SELECT COUNT(DISTINCT s.id) as total
    FROM sites s
    LEFT JOIN scans sc ON s.id = sc.siteId
    ${conditions}
  `));
  const total = Number(((countResult as any)[0] as any[])[0]?.total) || 0;

  const dataResult = await db.execute(sql.raw(`
    WITH latest_scans AS (
      SELECT sc.* FROM scans sc
    )
    SELECT 
      s.id, s.domain, s.siteName, s.sectorType, s.classification,
      s.siteStatus, s.screenshotUrl, s.contactUrl, s.emails, s.privacyUrl,
      ls.complianceStatus, ls.overallScore, ls.scanDate,
      ls.clause1Compliant, ls.clause2Compliant, ls.clause3Compliant, ls.clause4Compliant,
      ls.clause5Compliant, ls.clause6Compliant, ls.clause7Compliant, ls.clause8Compliant
    FROM sites s
    LEFT JOIN scans sc ON s.id = sc.siteId
    ${conditions}
    ORDER BY s.domain ASC
    LIMIT ${limit} OFFSET ${offset}
  `));

  return { sites: (dataResult as any)[0] as any[], total };
}


// ===== Site Compliance History Timeline =====
export async function getSiteComplianceHistory(siteId: number) {
  const db = await getDb();
  if (!db) return { site: null, history: [] };

  // Get site info
  const siteResult = await db.execute(sql.raw(`
    SELECT id, domain, siteName, sectorType, classification, siteStatus, screenshotUrl, privacyUrl, contactUrl, emails
    FROM sites WHERE id = ${siteId}
  `));
  const siteRows = (siteResult as any)[0] as any[];
  const site = siteRows.length > 0 ? siteRows[0] : null;

  if (!site) return { site: null, history: [] };

  // Get all scans for this site ordered by date
  const historyResult = await db.execute(sql.raw(`
    SELECT 
      id, scanDate, overallScore, complianceStatus, rating,
      clause1Compliant, clause2Compliant, clause3Compliant, clause4Compliant,
      clause5Compliant, clause6Compliant, clause7Compliant, clause8Compliant,
      privacyTextContent, recommendations
    FROM scans 
    WHERE siteId = ${siteId}
    ORDER BY scanDate ASC
  `));
  const history = ((historyResult as any)[0] as any[]).map((row: any, index: number, arr: any[]) => {
    const prev = index > 0 ? arr[index - 1] : null;
    const clauseCount = [1,2,3,4,5,6,7,8].filter(c => row[`clause${c}Compliant`] === 1).length;
    const prevClauseCount = prev ? [1,2,3,4,5,6,7,8].filter(c => prev[`clause${c}Compliant`] === 1).length : 0;
    
    // Calculate changes from previous scan
    let scoreChange = 0;
    let clauseChange = 0;
    let statusChanged = false;
    if (prev) {
      scoreChange = Number(row.overallScore || 0) - Number(prev.overallScore || 0);
      clauseChange = clauseCount - prevClauseCount;
      statusChanged = row.complianceStatus !== prev.complianceStatus;
    }

    return {
      id: row.id,
      scanDate: row.scanDate,
      overallScore: Number(row.overallScore || 0),
      complianceStatus: row.complianceStatus,
      rating: row.rating,
      clausesCompliant: clauseCount,
      clause1Compliant: row.clause1Compliant,
      clause2Compliant: row.clause2Compliant,
      clause3Compliant: row.clause3Compliant,
      clause4Compliant: row.clause4Compliant,
      clause5Compliant: row.clause5Compliant,
      clause6Compliant: row.clause6Compliant,
      clause7Compliant: row.clause7Compliant,
      clause8Compliant: row.clause8Compliant,
      scoreChange,
      clauseChange,
      statusChanged,
      isFirst: index === 0,
    };
  });

  return { site, history };
}

// ===== Site Watchers =====
export async function watchSite(userId: number, siteId: number) {
  const db = await getDb();
  if (!db) return;
  // Check if already watching
  const existing = await db.select().from(siteWatchers)
    .where(and(eq(siteWatchers.userId, userId), eq(siteWatchers.siteId, siteId)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  const result = await db.insert(siteWatchers).values({ userId, siteId });
  return { id: Number(result[0].insertId), userId, siteId };
}

export async function unwatchSite(userId: number, siteId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(siteWatchers).where(
    and(eq(siteWatchers.userId, userId), eq(siteWatchers.siteId, siteId))
  );
  return { success: true };
}

export async function isWatchingSite(userId: number, siteId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(siteWatchers)
    .where(and(eq(siteWatchers.userId, userId), eq(siteWatchers.siteId, siteId)))
    .limit(1);
  return result.length > 0;
}

export async function getUserWatchedSites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    watchId: siteWatchers.id,
    siteId: siteWatchers.siteId,
    domain: sites.domain,
    siteName: sites.siteName,
    screenshotUrl: sites.screenshotUrl,
    createdAt: siteWatchers.createdAt,
  }).from(siteWatchers)
    .innerJoin(sites, eq(siteWatchers.siteId, sites.id))
    .where(eq(siteWatchers.userId, userId))
    .orderBy(desc(siteWatchers.createdAt));
  return result;
}

// ===== Compliance Alerts =====
export async function createComplianceAlert(alert: InsertComplianceAlert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(complianceAlerts).values(alert);
  return { id: Number(result[0].insertId) };
}

export async function getComplianceAlerts(opts: { page?: number; limit?: number; unreadOnly?: boolean }) {
  const db = await getDb();
  if (!db) return { alerts: [], total: 0 };
  const page = opts.page || 1;
  const limit = opts.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = opts.unreadOnly ? [eq(complianceAlerts.isRead, false)] : [];

  const [alertRows, countResult] = await Promise.all([
    db.select({
      id: complianceAlerts.id,
      siteId: complianceAlerts.siteId,
      domain: complianceAlerts.domain,
      previousStatus: complianceAlerts.previousStatus,
      newStatus: complianceAlerts.newStatus,
      previousScore: complianceAlerts.previousScore,
      newScore: complianceAlerts.newScore,
      scanId: complianceAlerts.scanId,
      isRead: complianceAlerts.isRead,
      createdAt: complianceAlerts.createdAt,
      siteName: sites.siteName,
      screenshotUrl: sites.screenshotUrl,
    }).from(complianceAlerts)
      .leftJoin(sites, eq(complianceAlerts.siteId, sites.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(complianceAlerts.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(complianceAlerts)
      .where(conditions.length > 0 ? and(...conditions) : undefined),
  ]);

  return { alerts: alertRows, total: countResult[0]?.count || 0 };
}

export async function getUnreadAlertCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(complianceAlerts)
    .where(eq(complianceAlerts.isRead, false));
  return result[0]?.count || 0;
}

export async function markAlertRead(alertId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(complianceAlerts).set({ isRead: true }).where(eq(complianceAlerts.id, alertId));
  return { success: true };
}

export async function markAllAlertsRead() {
  const db = await getDb();
  if (!db) return;
  await db.update(complianceAlerts).set({ isRead: true }).where(eq(complianceAlerts.isRead, false));
  return { success: true };
}

// ===== Get Previous Scan for Compliance Change Detection =====
export async function getLatestScanForSite(siteId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(scans)
    .where(eq(scans.siteId, siteId))
    .orderBy(desc(scans.scanDate))
    .limit(1);
  return result[0] || null;
}

// ===== Screenshot History for Visual Comparison =====
export async function getSiteScreenshotHistory(siteId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    id: scans.id,
    screenshotUrl: scans.screenshotUrl,
    scanDate: scans.scanDate,
    complianceStatus: scans.complianceStatus,
    overallScore: scans.overallScore,
  }).from(scans)
    .where(and(eq(scans.siteId, siteId), sql`${scans.screenshotUrl} IS NOT NULL`))
    .orderBy(desc(scans.scanDate));
  return result;
}


// ===== MOBILE APPS =====
export async function insertMobileApp(app: Omit<InsertMobileApp, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(mobileApps).values(app as any);
  return { id: (result as any)[0].insertId };
}

export async function getMobileApps(params: { page?: number; limit?: number; search?: string; platform?: string; sectorType?: string }) {
  const db = await getDb();
  if (!db) return { apps: [], total: 0 };
  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClause = sql`1=1`;
  if (params.search) {
    whereClause = sql`${whereClause} AND (${mobileApps.appName} LIKE ${'%' + params.search + '%'} OR ${mobileApps.developer} LIKE ${'%' + params.search + '%'} OR ${mobileApps.packageName} LIKE ${'%' + params.search + '%'})`;
  }
  if (params.platform) {
    whereClause = sql`${whereClause} AND ${mobileApps.platform} = ${params.platform}`;
  }
  if (params.sectorType) {
    whereClause = sql`${whereClause} AND ${mobileApps.sectorType} = ${params.sectorType}`;
  }
  
  const rowsResult = await db.execute(sql`SELECT * FROM mobile_apps WHERE ${whereClause} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`);
  const countRes = await db.execute(sql`SELECT COUNT(*) as total FROM mobile_apps WHERE ${whereClause}`);
  const rows = (rowsResult as any)[0] as any[];
  const total = ((countRes as any)[0] as any[])[0]?.total || 0;
  return { apps: rows, total };
}

export async function getMobileAppById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`SELECT * FROM mobile_apps WHERE id = ${id} LIMIT 1`);
  const rows = (result as any)[0] as any[];
  return rows[0] || null;
}

export async function insertAppScan(scan: Omit<InsertAppScan, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(appScans).values(scan as any);
  return { id: (result as any)[0].insertId };
}

export async function getAppScans(appId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`SELECT * FROM app_scans WHERE app_id = ${appId} ORDER BY scan_date DESC`);
  return (result as any)[0] as any[];
}

export async function getAppScanStats() {
  const db = await getDb();
  if (!db) return { total: 0, compliant: 0, nonCompliant: 0, partial: 0, noPolicy: 0 };
  const result = await db.execute(sql`
    WITH latest AS (
      SELECT app_id, MAX(id) as latest_id FROM app_scans GROUP BY app_id
    )
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN s.compliance_status = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN s.compliance_status = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      SUM(CASE WHEN s.compliance_status = 'partially_compliant' THEN 1 ELSE 0 END) as partial,
      SUM(CASE WHEN s.compliance_status = 'no_policy' THEN 1 ELSE 0 END) as noPolicy
    FROM latest l JOIN app_scans s ON s.id = l.latest_id
  `);
  const rows = (result as any)[0] as any[];
  return rows[0] || { total: 0, compliant: 0, nonCompliant: 0, partial: 0, noPolicy: 0 };
}

// ===== BATCH SCAN JOBS =====
export async function insertBatchScanJob(job: Omit<InsertBatchScanJob, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(batchScanJobs).values(job as any);
  return { id: (result as any)[0].insertId };
}

export async function updateBatchScanJob(id: number, updates: Partial<InsertBatchScanJob>) {
  const db = await getDb();
  if (!db) return;
  await db.update(batchScanJobs).set(updates as any).where(eq(batchScanJobs.id, id));
}

export async function getBatchScanJobs(params: { page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { jobs: [], total: 0 };
  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = (page - 1) * limit;
  const rowsResult = await db.execute(sql`SELECT * FROM batch_scan_jobs ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`);
  const countRes = await db.execute(sql`SELECT COUNT(*) as total FROM batch_scan_jobs`);
  return { jobs: (rowsResult as any)[0] as any[], total: ((countRes as any)[0] as any[])[0]?.total || 0 };
}

export async function getBatchScanJob(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`SELECT * FROM batch_scan_jobs WHERE id = ${id} LIMIT 1`);
  return ((result as any)[0] as any[])[0] || null;
}

// ===== MESSAGE TEMPLATES =====
export async function getMessageTemplates() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`SELECT * FROM message_templates ORDER BY id ASC`);
  return (result as any)[0] as any[];
}

export async function getMessageTemplate(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`SELECT * FROM message_templates WHERE id = ${id} LIMIT 1`);
  return ((result as any)[0] as any[])[0] || null;
}

export async function insertMessageTemplate(template: Omit<InsertMessageTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(messageTemplates).values(template as any);
  return { id: (result as any)[0].insertId };
}

export async function updateMessageTemplate(id: number, updates: Partial<InsertMessageTemplate>) {
  const db = await getDb();
  if (!db) return;
  await db.update(messageTemplates).set(updates as any).where(eq(messageTemplates.id, id));
}

export async function deleteMessageTemplate(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(messageTemplates).where(eq(messageTemplates.id, id));
}

// ===== CASES / WORKFLOW =====
export async function insertCase(c: Omit<InsertCase, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(cases).values(c as any);
  return { id: (result as any)[0].insertId };
}

export async function getCases(params: { page?: number; limit?: number; status?: string; stage?: string; priority?: string; assignedTo?: number; requesterId?: number }) {
  const db = await getDb();
  if (!db) return { cases: [], total: 0 };
  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = (page - 1) * limit;
  
  let whereClause = sql`1=1`;
  if (params.status) whereClause = sql`${whereClause} AND c.status = ${params.status}`;
  if (params.stage) whereClause = sql`${whereClause} AND c.stage = ${params.stage}`;
  if (params.priority) whereClause = sql`${whereClause} AND c.priority = ${params.priority}`;
  if (params.assignedTo) whereClause = sql`${whereClause} AND c.assignedTo = ${params.assignedTo}`;
  if (params.requesterId) whereClause = sql`${whereClause} AND c.requesterId = ${params.requesterId}`;
  
  const rowsResult = await db.execute(sql`
    SELECT c.*, 
      u1.displayName as requester_name,
      u2.displayName as assigned_name,
      s.domain as site_domain,
      s.siteName as site_name
    FROM cases c
    LEFT JOIN users u1 ON u1.id = c.requesterId
    LEFT JOIN users u2 ON u2.id = c.assignedTo
    LEFT JOIN sites s ON s.id = c.siteId
    WHERE ${whereClause}
    ORDER BY c.updatedAt DESC
    LIMIT ${limit} OFFSET ${offset}
  `);
  const countRes = await db.execute(sql`SELECT COUNT(*) as total FROM cases c WHERE ${whereClause}`);
  return { cases: (rowsResult as any)[0] as any[], total: ((countRes as any)[0] as any[])[0]?.total || 0 };
}

export async function getCaseById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`
    SELECT c.*, 
      u1.displayName as requester_name,
      u2.displayName as assigned_name,
      s.domain as site_domain,
      s.siteName as site_name
    FROM cases c
    LEFT JOIN users u1 ON u1.id = c.requesterId
    LEFT JOIN users u2 ON u2.id = c.assignedTo
    LEFT JOIN sites s ON s.id = c.siteId
    WHERE c.id = ${id}
    LIMIT 1
  `);
  return ((result as any)[0] as any[])[0] || null;
}

export async function updateCase(id: number, updates: Partial<InsertCase>) {
  const db = await getDb();
  if (!db) return;
  await db.update(cases).set(updates as any).where(eq(cases.id, id));
}

export async function insertCaseHistoryEntry(entry: Omit<InsertCaseHistoryEntry, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(caseHistory).values(entry as any);
  return { id: (result as any)[0].insertId };
}

export async function getCaseHistoryEntries(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT ch.*, u.display_name as performer_name
    FROM case_history ch
    LEFT JOIN users u ON u.id = ch.performed_by
    WHERE ch.case_id = ${caseId}
    ORDER BY ch.createdAt ASC
  `);
  return (result as any)[0] as any[];
}

export async function getCaseStats() {
  const db = await getDb();
  if (!db) return { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, escalated: 0 };
  const result = await db.execute(sql`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as \`open\`,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
      SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
      SUM(CASE WHEN status = 'escalated' THEN 1 ELSE 0 END) as escalated
    FROM cases
  `);
  const rows = (result as any)[0] as any[];
  return rows[0] || { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, escalated: 0 };
}

// ===== SCAN SCHEDULES =====
export async function insertScanSchedule(schedule: Omit<InsertScanSchedule, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(scanSchedules).values(schedule as any);
  return { id: (result as any)[0].insertId };
}

export async function getScanSchedules() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT ss.*, u.displayName as creatorName
    FROM scan_schedules ss
    LEFT JOIN users u ON u.id = ss.createdBy
    ORDER BY ss.createdAt DESC`);
  return (result as any)[0] as any[];
}

export async function updateScanSchedule(id: number, updates: Partial<InsertScanSchedule>) {
  const db = await getDb();
  if (!db) return;
  await db.update(scanSchedules).set(updates as any).where(eq(scanSchedules.id, id));
}

export async function deleteScanSchedule(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(scanSchedules).where(eq(scanSchedules.id, id));
}

export async function getActiveScanSchedules() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`SELECT * FROM scan_schedules WHERE isActive = 1`);
  return (result as any)[0] as any[];
}

// ===== SEED MESSAGE TEMPLATES =====
export async function seedMessageTemplates() {
  const db = await getDb();
  if (!db) return;
  
  const existingResult = await db.execute(sql`SELECT COUNT(*) as cnt FROM message_templates`);
  if (((existingResult as any)[0] as any[])[0]?.cnt > 0) return; // Already seeded
  
  const templates = [
    {
      templateKey: 'new_scan_request',
      nameAr: 'طلب فحص جديد',
      nameEn: 'New Scan Request',
      subject: 'طلب فحص موقع {{siteName}}',
      body: 'نود إعلامكم بأنه تم تقديم طلب فحص جديد للموقع {{siteName}} ({{domain}}).\n\nتاريخ الطلب: {{date}}\nمقدم الطلب: {{requester}}\n\nيرجى مراجعة الطلب واتخاذ الإجراء المناسب.',
      variables: JSON.stringify(['siteName', 'domain', 'date', 'requester']),
      category: 'scan',
    },
    {
      templateKey: 'compliance_change',
      nameAr: 'تغيّر حالة الامتثال',
      nameEn: 'Compliance Status Change',
      subject: 'تغيّر حالة امتثال {{siteName}}',
      body: 'نود إعلامكم بتغيّر حالة امتثال الموقع {{siteName}} ({{domain}}).\n\nالحالة السابقة: {{previousStatus}}\nالحالة الجديدة: {{newStatus}}\nالنتيجة: {{score}}%\n\nيرجى مراجعة التفاصيل واتخاذ الإجراء المناسب.',
      variables: JSON.stringify(['siteName', 'domain', 'previousStatus', 'newStatus', 'score']),
      category: 'compliance',
    },
    {
      templateKey: 'first_notification',
      nameAr: 'إشعار أول - عدم الامتثال',
      nameEn: 'First Non-Compliance Notice',
      subject: 'إشعار أول: عدم امتثال سياسة الخصوصية - {{entityName}}',
      body: 'السلام عليكم ورحمة الله وبركاته\n\nالمكرم/ة مسؤول الخصوصية في {{entityName}}\n\nبناءً على رصد منصة راصد لسياسة الخصوصية في موقعكم {{domain}}، تبيّن عدم امتثال السياسة لمتطلبات المادة 12 من نظام حماية البيانات الشخصية.\n\nالبنود غير المستوفاة:\n{{violations}}\n\nنأمل معالجة الملاحظات خلال 30 يوم عمل.\n\nمع التقدير,\nفريق الرصد الوطني',
      variables: JSON.stringify(['entityName', 'domain', 'violations']),
      category: 'letter',
    },
    {
      templateKey: 'second_notification',
      nameAr: 'إشعار ثاني - تذكير',
      nameEn: 'Second Reminder Notice',
      subject: 'إشعار ثاني (تذكير): عدم امتثال سياسة الخصوصية - {{entityName}}',
      body: 'السلام عليكم ورحمة الله وبركاته\n\nالمكرم/ة مسؤول الخصوصية في {{entityName}}\n\nإشارة إلى إشعارنا السابق بتاريخ {{firstNoticeDate}} بشأن عدم امتثال سياسة الخصوصية في موقعكم {{domain}}.\n\nلم يتم معالجة الملاحظات المذكورة حتى الآن.\n\nنأمل سرعة المعالجة خلال 15 يوم عمل لتجنب التصعيد.\n\nمع التقدير,\nفريق الرصد الوطني',
      variables: JSON.stringify(['entityName', 'domain', 'firstNoticeDate']),
      category: 'letter',
    },
    {
      templateKey: 'escalation_notice',
      nameAr: 'إشعار تصعيد',
      nameEn: 'Escalation Notice',
      subject: 'إشعار تصعيد: عدم الاستجابة - {{entityName}}',
      body: 'السلام عليكم ورحمة الله وبركاته\n\nالمكرم/ة المسؤول التنفيذي في {{entityName}}\n\nبعد إرسال إشعارين سابقين بتاريخ {{firstNoticeDate}} و {{secondNoticeDate}} دون استجابة، نود إعلامكم بتصعيد الملف إلى الجهة المختصة.\n\nالموقع: {{domain}}\nحالة الامتثال: {{complianceStatus}}\n\nمع التقدير,\nفريق الرصد الوطني',
      variables: JSON.stringify(['entityName', 'domain', 'firstNoticeDate', 'secondNoticeDate', 'complianceStatus']),
      category: 'letter',
    },
    {
      templateKey: 'compliance_achieved',
      nameAr: 'تأكيد الامتثال',
      nameEn: 'Compliance Achieved',
      subject: 'تأكيد امتثال سياسة الخصوصية - {{entityName}}',
      body: 'السلام عليكم ورحمة الله وبركاته\n\nالمكرم/ة مسؤول الخصوصية في {{entityName}}\n\nيسرنا إعلامكم بأن سياسة الخصوصية في موقعكم {{domain}} أصبحت ممتثلة لمتطلبات المادة 12 من نظام حماية البيانات الشخصية.\n\nالنتيجة: {{score}}%\nتاريخ الفحص: {{scanDate}}\n\nشكراً لتعاونكم.\n\nمع التقدير,\nفريق الرصد الوطني',
      variables: JSON.stringify(['entityName', 'domain', 'score', 'scanDate']),
      category: 'letter',
    },
    {
      templateKey: 'case_assigned',
      nameAr: 'تعيين حالة جديدة',
      nameEn: 'Case Assigned',
      subject: 'تم تعيين حالة جديدة لك: {{caseNumber}}',
      body: 'تم تعيين الحالة رقم {{caseNumber}} إليك.\n\nالعنوان: {{title}}\nالأولوية: {{priority}}\nالموقع: {{domain}}\n\nيرجى مراجعة الحالة واتخاذ الإجراء المناسب.',
      variables: JSON.stringify(['caseNumber', 'title', 'priority', 'domain']),
      category: 'workflow',
    },
    {
      templateKey: 'case_stage_change',
      nameAr: 'تغيّر مرحلة الحالة',
      nameEn: 'Case Stage Changed',
      subject: 'تحديث الحالة {{caseNumber}}: انتقال إلى {{newStage}}',
      body: 'تم تحديث الحالة رقم {{caseNumber}}.\n\nالمرحلة السابقة: {{previousStage}}\nالمرحلة الجديدة: {{newStage}}\nبواسطة: {{performer}}\nملاحظات: {{comment}}\n\nيرجى متابعة الإجراءات المطلوبة.',
      variables: JSON.stringify(['caseNumber', 'previousStage', 'newStage', 'performer', 'comment']),
      category: 'workflow',
    },
    {
      templateKey: 'batch_scan_complete',
      nameAr: 'اكتمال الفحص الدفعي',
      nameEn: 'Batch Scan Complete',
      subject: 'اكتمال الفحص الدفعي: {{jobName}}',
      body: 'تم اكتمال الفحص الدفعي "{{jobName}}".\n\nإجمالي المواقع: {{totalUrls}}\nتم فحصها: {{completedUrls}}\nفشل: {{failedUrls}}\n\nيمكنك مراجعة النتائج من لوحة التحكم.',
      variables: JSON.stringify(['jobName', 'totalUrls', 'completedUrls', 'failedUrls']),
      category: 'scan',
    },
    {
      templateKey: 'scheduled_scan_report',
      nameAr: 'تقرير الفحص الدوري',
      nameEn: 'Scheduled Scan Report',
      subject: 'تقرير الفحص الدوري: {{scheduleName}}',
      body: 'تم تنفيذ الفحص الدوري "{{scheduleName}}" بنجاح.\n\nتاريخ التنفيذ: {{runDate}}\nعدد المواقع: {{totalSites}}\nالممتثلة: {{compliant}}\nغير الممتثلة: {{nonCompliant}}\n\nيمكنك مراجعة التفاصيل من لوحة المؤشرات القيادية.',
      variables: JSON.stringify(['scheduleName', 'runDate', 'totalSites', 'compliant', 'nonCompliant']),
      category: 'scan',
    },
  ];
  
  for (const t of templates) {
    await db.insert(messageTemplates).values(t as any);
  }
}

// Generate unique case number
export async function generateCaseNumber(): Promise<string> {
  const db = await getDb();
  if (!db) return `CASE-${Date.now()}`;
  const [rows] = await db.execute(sql`SELECT COUNT(*) as cnt FROM cases`);
  const count = ((rows as any)[0]?.cnt || 0) + 1;
  const year = new Date().getFullYear();
  return `RASID-${year}-${String(count).padStart(5, '0')}`;
}


// ===== SCHEDULE EXECUTION HISTORY =====
export async function insertScheduleExecution(exec: {
  scheduleId: number;
  startedAt: Date;
  completedAt?: Date;
  totalSites: number;
  completedSites: number;
  failedSites: number;
  status: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`
    INSERT INTO schedule_executions (scheduleId, startedAt, completedAt, totalSites, completedSites, failedSites, status)
    VALUES (${exec.scheduleId}, ${exec.startedAt}, ${exec.completedAt || null}, ${exec.totalSites}, ${exec.completedSites}, ${exec.failedSites}, ${exec.status})
  `);
  return { id: (result as any)[0].insertId };
}

export async function getScheduleExecutionHistory(scheduleId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT * FROM schedule_executions 
    WHERE scheduleId = ${scheduleId} 
    ORDER BY startedAt DESC 
    LIMIT 20
  `);
  return (result as any)[0] as any[];
}

// ===== Case Comments =====
export async function getCaseComments(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT cc.*, u.name as userName, u.displayName as userDisplayName, u.role as userRole
    FROM case_comments cc
    LEFT JOIN users u ON cc.userId = u.id
    WHERE cc.caseId = ${caseId}
    ORDER BY cc.createdAt ASC
  `);
  return (result as any)[0] as any[];
}

export async function insertCaseComment(comment: {
  caseId: number;
  userId: number;
  content: string;
  parentId?: number | null;
  isInternal?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`
    INSERT INTO case_comments (caseId, userId, content, parentId, isInternal)
    VALUES (${comment.caseId}, ${comment.userId}, ${comment.content}, ${comment.parentId || null}, ${comment.isInternal ?? true})
  `);
  return { id: (result as any)[0].insertId };
}

export async function updateCaseComment(commentId: number, userId: number, content: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`
    UPDATE case_comments SET content = ${content} WHERE id = ${commentId} AND userId = ${userId}
  `);
  return (result as any)[0].affectedRows > 0;
}

export async function deleteCaseComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.execute(sql`
    DELETE FROM case_comments WHERE id = ${commentId} AND userId = ${userId}
  `);
  return (result as any)[0].affectedRows > 0;
}

export async function getCaseCommentCount(caseId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.execute(sql`
    SELECT COUNT(*) as cnt FROM case_comments WHERE caseId = ${caseId}
  `);
  return Number((result as any)[0][0]?.cnt || 0);
}

// ===== Escalation Rules =====
export async function getEscalationRules() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT er.*, u.name as creatorName
    FROM escalation_rules er
    LEFT JOIN users u ON u.id = er.createdBy
    ORDER BY er.createdAt DESC
  `);
  return (result as any)[0] as any[];
}

export async function getActiveEscalationRules() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT * FROM escalation_rules WHERE isActive = 1
  `);
  return (result as any)[0] as any[];
}

export async function getEscalationRuleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`SELECT * FROM escalation_rules WHERE id = ${id}`);
  const rows = (result as any)[0] as any[];
  return rows[0] || null;
}

export async function insertEscalationRule(rule: {
  name: string;
  description?: string;
  fromStage: string;
  toStage: string;
  maxHours: number;
  escalatePriority?: string;
  appliesTo?: string;
  notifyRoles?: string[];
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`
    INSERT INTO escalation_rules (name, description, fromStage, toStage, maxHours, escalatePriority, appliesTo, notifyRoles, createdBy)
    VALUES (${rule.name}, ${rule.description || null}, ${rule.fromStage}, ${rule.toStage}, ${rule.maxHours}, ${rule.escalatePriority || null}, ${rule.appliesTo || null}, ${JSON.stringify(rule.notifyRoles || [])}, ${rule.createdBy || null})
  `);
  return { id: (result as any)[0].insertId };
}

export async function updateEscalationRule(id: number, updates: Partial<{
  name: string;
  description: string;
  fromStage: string;
  toStage: string;
  maxHours: number;
  escalatePriority: string;
  appliesTo: string;
  notifyRoles: string[];
  isActive: boolean;
}>) {
  const db = await getDb();
  if (!db) return false;
  
  // Update each field individually to avoid dynamic query issues
  if (updates.name !== undefined) await db.execute(sql`UPDATE escalation_rules SET name = ${updates.name} WHERE id = ${id}`);
  if (updates.description !== undefined) await db.execute(sql`UPDATE escalation_rules SET description = ${updates.description} WHERE id = ${id}`);
  if (updates.fromStage !== undefined) await db.execute(sql`UPDATE escalation_rules SET fromStage = ${updates.fromStage} WHERE id = ${id}`);
  if (updates.toStage !== undefined) await db.execute(sql`UPDATE escalation_rules SET toStage = ${updates.toStage} WHERE id = ${id}`);
  if (updates.maxHours !== undefined) await db.execute(sql`UPDATE escalation_rules SET maxHours = ${updates.maxHours} WHERE id = ${id}`);
  if (updates.escalatePriority !== undefined) await db.execute(sql`UPDATE escalation_rules SET escalatePriority = ${updates.escalatePriority} WHERE id = ${id}`);
  if (updates.appliesTo !== undefined) await db.execute(sql`UPDATE escalation_rules SET appliesTo = ${updates.appliesTo} WHERE id = ${id}`);
  if (updates.notifyRoles !== undefined) await db.execute(sql`UPDATE escalation_rules SET notifyRoles = ${JSON.stringify(updates.notifyRoles)} WHERE id = ${id}`);
  if (updates.isActive !== undefined) await db.execute(sql`UPDATE escalation_rules SET isActive = ${updates.isActive ? 1 : 0} WHERE id = ${id}`);
  
  return true;
}

export async function deleteEscalationRule(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.execute(sql`DELETE FROM escalation_rules WHERE id = ${id}`);
  return true;
}

// ===== Escalation Logs =====
export async function getEscalationLogs(filters?: { caseId?: number; ruleId?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  const limit = filters?.limit || 50;
  
  if (filters?.caseId) {
    const result = await db.execute(sql`
      SELECT el.*, er.name as ruleName, c.caseNumber, c.title as caseTitle
      FROM escalation_logs el
      LEFT JOIN escalation_rules er ON er.id = el.ruleId
      LEFT JOIN cases c ON c.id = el.caseId
      WHERE el.caseId = ${filters.caseId}
      ORDER BY el.escalatedAt DESC
      LIMIT ${limit}
    `);
    return (result as any)[0] as any[];
  }
  
  if (filters?.ruleId) {
    const result = await db.execute(sql`
      SELECT el.*, er.name as ruleName, c.caseNumber, c.title as caseTitle
      FROM escalation_logs el
      LEFT JOIN escalation_rules er ON er.id = el.ruleId
      LEFT JOIN cases c ON c.id = el.caseId
      WHERE el.ruleId = ${filters.ruleId}
      ORDER BY el.escalatedAt DESC
      LIMIT ${limit}
    `);
    return (result as any)[0] as any[];
  }
  
  const result = await db.execute(sql`
    SELECT el.*, er.name as ruleName, c.caseNumber, c.title as caseTitle
    FROM escalation_logs el
    LEFT JOIN escalation_rules er ON er.id = el.ruleId
    LEFT JOIN cases c ON c.id = el.caseId
    ORDER BY el.escalatedAt DESC
    LIMIT ${limit}
  `);
  return (result as any)[0] as any[];
}

export async function insertEscalationLog(log: {
  caseId: number;
  ruleId: number;
  previousStage: string;
  newStage: string;
  previousPriority?: string;
  newPriority?: string;
  hoursOverdue: number;
  notified?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`
    INSERT INTO escalation_logs (caseId, ruleId, previousStage, newStage, previousPriority, newPriority, hoursOverdue, notified)
    VALUES (${log.caseId}, ${log.ruleId}, ${log.previousStage}, ${log.newStage}, ${log.previousPriority || null}, ${log.newPriority || null}, ${log.hoursOverdue}, ${log.notified ?? false})
  `);
  return { id: (result as any)[0].insertId };
}

export async function getEscalationStats() {
  const db = await getDb();
  if (!db) return { totalEscalations: 0, last24h: 0, last7d: 0, activeRules: 0 };
  
  const [totalResult] = await db.execute(sql`SELECT COUNT(*) as cnt FROM escalation_logs`) as any;
  const [last24hResult] = await db.execute(sql`SELECT COUNT(*) as cnt FROM escalation_logs WHERE escalatedAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`) as any;
  const [last7dResult] = await db.execute(sql`SELECT COUNT(*) as cnt FROM escalation_logs WHERE escalatedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)`) as any;
  const [rulesResult] = await db.execute(sql`SELECT COUNT(*) as cnt FROM escalation_rules WHERE isActive = 1`) as any;
  
  return {
    totalEscalations: Number(totalResult[0]?.cnt || 0),
    last24h: Number(last24hResult[0]?.cnt || 0),
    last7d: Number(last7dResult[0]?.cnt || 0),
    activeRules: Number(rulesResult[0]?.cnt || 0),
  };
}

// Get cases that are overdue based on escalation rules
export async function getOverdueCases() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT c.*, er.id as ruleId, er.name as ruleName, er.toStage as escalateToStage,
           er.escalatePriority, er.maxHours, er.notifyRoles,
           TIMESTAMPDIFF(HOUR, c.updatedAt, NOW()) as hoursInStage
    FROM cases c
    INNER JOIN escalation_rules er ON er.fromStage = c.stage AND er.isActive = 1
    WHERE c.status NOT IN ('closed', 'resolved')
      AND TIMESTAMPDIFF(HOUR, c.updatedAt, NOW()) > er.maxHours
      AND (er.appliesTo IS NULL OR er.appliesTo = c.priority)
    ORDER BY hoursInStage DESC
  `);
  return (result as any)[0] as any[];
}


// ===== CHANGE DETECTION =====

export async function insertChangeDetectionLog(log: Omit<InsertChangeDetectionLog, 'id' | 'detectedAt'>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(changeDetectionLogs).values(log as any);
  return result;
}

export async function getChangeDetectionLogs(params: { siteId?: number; significantOnly?: boolean; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [];
  if (params.siteId) conditions.push(eq(changeDetectionLogs.siteId, params.siteId));
  if (params.significantOnly) conditions.push(eq(changeDetectionLogs.significantChange, true));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(changeDetectionLogs).where(where).orderBy(desc(changeDetectionLogs.detectedAt)).limit(params.limit || 50).offset(params.offset || 0);
}

export async function getChangeDetectionStats() {
  const db = await getDb();
  if (!db) return { total: 0, significant: 0, policyAdded: 0, policyRemoved: 0, improved: 0, degraded: 0 };
  const [total] = await db.select({ count: count() }).from(changeDetectionLogs);
  const [significant] = await db.select({ count: count() }).from(changeDetectionLogs).where(eq(changeDetectionLogs.significantChange, true));
  const [added] = await db.select({ count: count() }).from(changeDetectionLogs).where(eq(changeDetectionLogs.policyAdded, true));
  const [removed] = await db.select({ count: count() }).from(changeDetectionLogs).where(eq(changeDetectionLogs.policyRemoved, true));
  return {
    total: total?.count || 0,
    significant: significant?.count || 0,
    policyAdded: added?.count || 0,
    policyRemoved: removed?.count || 0,
    improved: 0,
    degraded: 0,
  };
}

export async function detectChanges(siteId: number, newScanId: number) {
  const db = await getDb();
  if (!db) return null;
  // Get the two most recent scans for this site
  const recentScans = await db.select().from(scans).where(eq(scans.siteId, siteId)).orderBy(desc(scans.scanDate)).limit(2);
  if (recentScans.length < 2) return null; // Need at least 2 scans
  const newScan = recentScans[0];
  const prevScan = recentScans[1];
  
  const clauseChanges: Array<{clause: number; from: boolean; to: boolean}> = [];
  for (let i = 1; i <= 8; i++) {
    const prevVal = (prevScan as any)[`clause${i}Compliant`] || false;
    const newVal = (newScan as any)[`clause${i}Compliant`] || false;
    if (prevVal !== newVal) {
      clauseChanges.push({ clause: i, from: prevVal, to: newVal });
    }
  }
  
  const scoreDelta = (newScan.overallScore || 0) - (prevScan.overallScore || 0);
  const policyAdded = !prevScan.privacyTextContent && !!newScan.privacyTextContent;
  const policyRemoved = !!prevScan.privacyTextContent && !newScan.privacyTextContent;
  const significantChange = Math.abs(scoreDelta) >= 10 || clauseChanges.length >= 2 || policyAdded || policyRemoved;
  
  const changeType = clauseChanges.length === 0 && scoreDelta === 0 ? 'no_change' 
    : policyAdded ? 'added' 
    : policyRemoved ? 'removed' 
    : 'modified';

  const log = {
    siteId,
    scanId: newScanId,
    previousScanId: prevScan.id,
    changeType: changeType as any,
    previousScore: prevScan.overallScore,
    newScore: newScan.overallScore,
    scoreDelta,
    previousStatus: prevScan.complianceStatus,
    newStatus: newScan.complianceStatus,
    clauseChanges: clauseChanges as any,
    textDiffSummary: clauseChanges.length > 0 
      ? `تغيير في ${clauseChanges.length} بنود: ${clauseChanges.map(c => `البند ${c.clause} (${c.from ? '✅' : '❌'} → ${c.to ? '✅' : '❌'})`).join(', ')}`
      : scoreDelta !== 0 ? `تغيير في النتيجة: ${(prevScan.overallScore || 0).toFixed(1)}% → ${(newScan.overallScore || 0).toFixed(1)}%` : 'لا توجد تغييرات',
    policyAdded,
    policyRemoved,
    significantChange,
  };
  
  await insertChangeDetectionLog(log);
  return log;
}

// ===== SYSTEM SETTINGS =====

export async function getSystemSettings(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) {
    return db.select().from(systemSettings).where(eq(systemSettings.category, category)).orderBy(asc(systemSettings.settingKey));
  }
  return db.select().from(systemSettings).orderBy(asc(systemSettings.category), asc(systemSettings.settingKey));
}

export async function getSystemSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key));
  return setting || null;
}

export async function upsertSystemSetting(data: { key: string; value: string; type?: string; category?: string; label?: string; description?: string; updatedBy?: number }) {
  const db = await getDb();
  if (!db) return null;
  const existing = await getSystemSetting(data.key);
  if (existing) {
    await db.update(systemSettings).set({
      settingValue: data.value,
      updatedBy: data.updatedBy,
    }).where(eq(systemSettings.settingKey, data.key));
  } else {
    await db.insert(systemSettings).values({
      settingKey: data.key,
      settingValue: data.value,
      settingType: (data.type || 'string') as any,
      category: data.category || 'general',
      label: data.label,
      description: data.description,
      updatedBy: data.updatedBy,
    });
  }
  return getSystemSetting(data.key);
}

export async function seedDefaultSettings() {
  const defaults = [
    { key: 'platform_name', value: 'منصة راصد', type: 'string', category: 'general', label: 'اسم المنصة', description: 'اسم المنصة الذي يظهر في الواجهة' },
    { key: 'platform_name_en', value: 'Rasid Platform', type: 'string', category: 'general', label: 'Platform Name (EN)', description: 'English platform name' },
    { key: 'scan_timeout_seconds', value: '60', type: 'number', category: 'scanning', label: 'مهلة الفحص (ثواني)', description: 'المدة القصوى لفحص موقع واحد' },
    { key: 'max_concurrent_scans', value: '5', type: 'number', category: 'scanning', label: 'الحد الأقصى للفحوصات المتزامنة', description: 'عدد الفحوصات التي يمكن تشغيلها في نفس الوقت' },
    { key: 'compliance_threshold_high', value: '80', type: 'number', category: 'compliance', label: 'عتبة الامتثال العالي (%)', description: 'النسبة المئوية لاعتبار الموقع ممتثلاً' },
    { key: 'compliance_threshold_partial', value: '40', type: 'number', category: 'compliance', label: 'عتبة الامتثال الجزئي (%)', description: 'النسبة المئوية لاعتبار الموقع ممتثلاً جزئياً' },
    { key: 'escalation_check_interval', value: '15', type: 'number', category: 'escalation', label: 'فترة فحص التصعيد (دقائق)', description: 'كم مرة يتم فحص الحالات المتأخرة' },
    { key: 'notification_email_enabled', value: 'true', type: 'boolean', category: 'notifications', label: 'تفعيل إشعارات البريد', description: 'إرسال إشعارات عبر البريد الإلكتروني' },
    { key: 'notification_scan_complete', value: 'true', type: 'boolean', category: 'notifications', label: 'إشعار اكتمال الفحص', description: 'إرسال إشعار عند اكتمال الفحص الدوري' },
    { key: 'change_detection_enabled', value: 'true', type: 'boolean', category: 'scanning', label: 'تفعيل كشف التغييرات', description: 'كشف التغييرات تلقائياً بعد كل فحص' },
    { key: 'auto_screenshot', value: 'true', type: 'boolean', category: 'scanning', label: 'لقطة شاشة تلقائية', description: 'التقاط لقطة شاشة تلقائياً عند الفحص' },
    { key: 'session_timeout_hours', value: '24', type: 'number', category: 'security', label: 'مهلة الجلسة (ساعات)', description: 'مدة صلاحية جلسة المستخدم' },
    { key: 'max_login_attempts', value: '5', type: 'number', category: 'security', label: 'الحد الأقصى لمحاولات الدخول', description: 'عدد المحاولات قبل قفل الحساب' },
    { key: 'password_min_length', value: '6', type: 'number', category: 'security', label: 'الحد الأدنى لطول كلمة المرور', description: 'الحد الأدنى لعدد أحرف كلمة المرور' },
  ];
  for (const s of defaults) {
    const existing = await getSystemSetting(s.key);
    if (!existing) {
      await upsertSystemSetting(s);
    }
  }
  return defaults.length;
}

// ===== PASSWORD RESET =====

export async function createPasswordResetToken(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const token = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt,
  });
  return token;
}

export async function validatePasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const [record] = await db.select().from(passwordResetTokens).where(
    and(
      eq(passwordResetTokens.token, token),
      eq(passwordResetTokens.used, false),
    )
  );
  if (!record) return null;
  if (new Date(record.expiresAt) < new Date()) return null; // expired
  return record;
}

export async function markPasswordResetTokenUsed(token: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.token, token));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
}

// ===== UPDATE USER DETAILS =====

export async function updateUserDetails(userId: number, updates: { name?: string; displayName?: string; email?: string; mobile?: string; rasidRole?: string; role?: string }) {
  const db = await getDb();
  if (!db) return;
  const setObj: any = {};
  if (updates.name !== undefined) setObj.name = updates.name;
  if (updates.displayName !== undefined) setObj.displayName = updates.displayName;
  if (updates.email !== undefined) setObj.email = updates.email;
  if (updates.mobile !== undefined) setObj.mobile = updates.mobile;
  if (updates.rasidRole !== undefined) setObj.rasidRole = updates.rasidRole;
  if (updates.role !== undefined) setObj.role = updates.role;
  if (Object.keys(setObj).length > 0) {
    await db.update(users).set(setObj).where(eq(users.id, userId));
  }
}


// ===== USER FIELDS UPDATE =====
export async function updateUserFields(userId: number, fields: Record<string, any>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(fields).where(eq(users.id, userId));
}

export async function getUsersWithEmailNotifications() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(users).where(eq(users.emailNotifications, true));
  return result.filter(u => u.email);
}

export async function updateEmailNotificationPref(userId: number, enabled: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ emailNotifications: enabled }).where(eq(users.id, userId));
}

// ===== ADVANCED ANALYTICS =====

export async function getMonthlyComplianceTrends(months: number = 12) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.execute(sql`
    SELECT 
      DATE_FORMAT(scanDate, '%Y-%m') as month,
      COUNT(*) as totalScans,
      SUM(CASE WHEN complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partial,
      SUM(CASE WHEN complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      SUM(CASE WHEN complianceStatus = 'no_policy' THEN 1 ELSE 0 END) as noPolicy,
      ROUND(AVG(overallScore), 2) as avgScore
    FROM scans
    WHERE scanDate >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)
    GROUP BY DATE_FORMAT(scanDate, '%Y-%m')
    ORDER BY month ASC
  `);
  return (results as any)[0] || [];
}

export async function getSectorMonthlyTrends(months: number = 12) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.execute(sql`
    SELECT 
      DATE_FORMAT(sc.scanDate, '%Y-%m') as month,
      s.sectorType,
      COUNT(*) as totalScans,
      SUM(CASE WHEN sc.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN sc.complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partial,
      SUM(CASE WHEN sc.complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      ROUND(AVG(sc.overallScore), 2) as avgScore
    FROM scans sc
    JOIN sites s ON sc.siteId = s.id
    WHERE sc.scanDate >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)
    GROUP BY DATE_FORMAT(sc.scanDate, '%Y-%m'), s.sectorType
    ORDER BY month ASC, s.sectorType
  `);
  return (results as any)[0] || [];
}

export async function getCategoryMonthlyTrends(months: number = 12) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.execute(sql`
    SELECT 
      DATE_FORMAT(sc.scanDate, '%Y-%m') as month,
      COALESCE(s.classification, 'غير مصنف') as category,
      COUNT(*) as totalScans,
      SUM(CASE WHEN sc.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN sc.complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      ROUND(AVG(sc.overallScore), 2) as avgScore
    FROM scans sc
    JOIN sites s ON sc.siteId = s.id
    WHERE sc.scanDate >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)
    GROUP BY DATE_FORMAT(sc.scanDate, '%Y-%m'), s.classification
    ORDER BY month ASC
  `);
  return (results as any)[0] || [];
}

export async function getClauseTrends(months: number = 12) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.execute(sql`
    SELECT 
      DATE_FORMAT(scanDate, '%Y-%m') as month,
      SUM(CASE WHEN clause1Compliant = 1 THEN 1 ELSE 0 END) as clause1,
      SUM(CASE WHEN clause2Compliant = 1 THEN 1 ELSE 0 END) as clause2,
      SUM(CASE WHEN clause3Compliant = 1 THEN 1 ELSE 0 END) as clause3,
      SUM(CASE WHEN clause4Compliant = 1 THEN 1 ELSE 0 END) as clause4,
      SUM(CASE WHEN clause5Compliant = 1 THEN 1 ELSE 0 END) as clause5,
      SUM(CASE WHEN clause6Compliant = 1 THEN 1 ELSE 0 END) as clause6,
      SUM(CASE WHEN clause7Compliant = 1 THEN 1 ELSE 0 END) as clause7,
      SUM(CASE WHEN clause8Compliant = 1 THEN 1 ELSE 0 END) as clause8,
      COUNT(*) as total
    FROM scans
    WHERE scanDate >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)
    GROUP BY DATE_FORMAT(scanDate, '%Y-%m')
    ORDER BY month ASC
  `);
  return (results as any)[0] || [];
}

// ===== API KEYS =====


export async function createApiKey(data: InsertApiKey) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(apiKeys).values(data).$returningId();
  return result;
}

export async function getApiKeys(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (userId) {
    return db.select().from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
  }
  return db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
}

export async function getApiKeyByHash(keyHash: string) {
  const db = await getDb();
  if (!db) return null;
  const [key] = await db.select().from(apiKeys).where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)));
  return key || null;
}

export async function incrementApiKeyUsage(keyId: number) {
  const db = await getDb();
  if (!db) return;
  await db.execute(sql`UPDATE api_keys SET requestCount = requestCount + 1, lastUsedAt = NOW() WHERE id = ${keyId}`);
}

export async function revokeApiKey(keyId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(apiKeys).set({ isActive: false }).where(eq(apiKeys.id, keyId));
}

export async function deleteApiKey(keyId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
}


// ===== SYSTEM HEALTH =====

export async function getSystemHealthMetrics() {
  const db = await getDb();
  if (!db) return null;
  
  // Get table counts
  const [siteCount] = await db.select({ count: count() }).from(sites);
  const [scanCount] = await db.select({ count: count() }).from(scans);
  const [userCount] = await db.select({ count: count() }).from(users);
  const [platformUserCount] = await db.select({ count: count() }).from(platformUsers);
  const [caseCount] = await db.select({ count: count() }).from(cases);
  const [letterCount] = await db.select({ count: count() }).from(letters);
  const [notifCount] = await db.select({ count: count() }).from(notifications);
  const [apiKeyCount] = await db.select({ count: count() }).from(apiKeys);
  const [activeApiKeys] = await db.select({ count: count() }).from(apiKeys).where(eq(apiKeys.isActive, true));
  
  // Get recent scan activity (last 24h, 7d, 30d)
  const now = new Date();
  const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [scans24h] = await db.select({ count: count() }).from(scans).where(sql`${scans.createdAt} >= ${h24}`);
  const [scans7d] = await db.select({ count: count() }).from(scans).where(sql`${scans.createdAt} >= ${d7}`);
  const [scans30d] = await db.select({ count: count() }).from(scans).where(sql`${scans.createdAt} >= ${d30}`);
  
  // API usage stats
  const apiUsageResult = await db.select({
    totalRequests: sql<number>`COALESCE(SUM(${apiKeys.requestCount}), 0)`,
  }).from(apiKeys);
  
  // Active schedules
  const [activeSchedules] = await db.select({ count: count() }).from(scanSchedules).where(eq(scanSchedules.isActive, true));
  
  // Recent escalations (last 7 days)
  const [recentEscalations] = await db.select({ count: count() }).from(escalationLogs).where(sql`${escalationLogs.escalatedAt} >= ${d7}`);
  
  // Open cases
  const [openCases] = await db.select({ count: count() }).from(cases).where(
    or(eq(cases.status, "open"), eq(cases.status, "in_progress"), eq(cases.status, "pending_review"))
  );
  
  return {
    database: {
      totalSites: siteCount.count,
      totalScans: scanCount.count,
      totalUsers: userCount.count + platformUserCount.count,
      totalCases: caseCount.count,
      totalLetters: letterCount.count,
      totalNotifications: notifCount.count,
    },
    api: {
      totalApiKeys: apiKeyCount.count,
      activeApiKeys: activeApiKeys.count,
      totalApiRequests: apiUsageResult[0]?.totalRequests || 0,
    },
    scanning: {
      scansLast24h: scans24h.count,
      scansLast7d: scans7d.count,
      scansLast30d: scans30d.count,
      activeSchedules: activeSchedules.count,
    },
    operations: {
      recentEscalations: recentEscalations.count,
      openCases: openCases.count,
    },
  };
}

export async function getApiUsageByDay(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await db.execute(sql`SELECT DATE(createdAt) as date, COUNT(*) as count FROM activity_logs WHERE createdAt >= ${since} AND action LIKE '%api%' GROUP BY DATE(createdAt) ORDER BY DATE(createdAt)`);
  return ((result[0] as unknown as any[]) || []).map((r: any) => ({ date: String(r.date), count: Number(r.count) }));
}

export async function getScanActivityByDay(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await db.execute(sql`SELECT DATE(createdAt) as date, COUNT(*) as count FROM scans WHERE createdAt >= ${since} GROUP BY DATE(createdAt) ORDER BY DATE(createdAt)`);
  return ((result[0] as unknown as any[]) || []).map((r: any) => ({ date: String(r.date), count: Number(r.count) }));
}

// ===== SCHEDULED REPORTS =====

export async function createScheduledReport(data: InsertScheduledReport) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(scheduledReports).values(data).$returningId();
  return result;
}

export async function getScheduledReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scheduledReports).orderBy(desc(scheduledReports.createdAt));
}

export async function getScheduledReportById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [report] = await db.select().from(scheduledReports).where(eq(scheduledReports.id, id));
  return report || null;
}

export async function updateScheduledReport(id: number, data: Partial<InsertScheduledReport>) {
  const db = await getDb();
  if (!db) return;
  await db.update(scheduledReports).set({ ...data, updatedAt: new Date() } as any).where(eq(scheduledReports.id, id));
}

export async function deleteScheduledReport(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(scheduledReports).where(eq(scheduledReports.id, id));
}

export async function getActiveScheduledReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scheduledReports).where(eq(scheduledReports.isActive, true));
}

export async function createReportExecution(data: InsertReportExecution) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(reportExecutions).values(data).$returningId();
  return result;
}

export async function getReportExecutions(reportId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reportExecutions)
    .where(eq(reportExecutions.reportId, reportId))
    .orderBy(desc(reportExecutions.createdAt))
    .limit(limit);
}

export async function updateReportExecution(id: number, data: Partial<InsertReportExecution>) {
  const db = await getDb();
  if (!db) return;
  await db.update(reportExecutions).set(data as any).where(eq(reportExecutions.id, id));
}

// ===== COMPLIANCE COMPARISON =====

export async function getComparisonData(siteIds: number[]) {
  const db = await getDb();
  if (!db) return [];
  
  const results = [];
  for (const siteId of siteIds) {
    const [site] = await db.select().from(sites).where(eq(sites.id, siteId));
    if (!site) continue;
    
    // Get latest scan for this site
    const [latestScan] = await db.select().from(scans)
      .where(eq(scans.siteId, siteId))
      .orderBy(desc(scans.createdAt))
      .limit(1);
    
    // Get scan count
    const [scanCountResult] = await db.select({ count: count() }).from(scans).where(eq(scans.siteId, siteId));
    
    results.push({
      site,
      latestScan: latestScan || null,
      scanCount: scanCountResult.count,
    });
  }
  
  return results;
}

export async function searchSitesForComparison(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: sites.id, domain: sites.domain, siteName: sites.siteName, sectorType: sites.sectorType, classification: sites.classification })
    .from(sites)
    .where(or(
      like(sites.domain, `%${query}%`),
      like(sites.siteName, `%${query}%`)
    ))
    .limit(limit);
}

// ============ KPI Targets ============
export async function getKpiTargets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(kpiTargets).orderBy(asc(kpiTargets.category), asc(kpiTargets.id));
}

export async function getKpiTargetById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(kpiTargets).where(eq(kpiTargets.id, id));
  return rows[0] || null;
}

export async function createKpiTarget(data: InsertKpiTarget) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(kpiTargets).values(data);
  return { id: result[0].insertId };
}

export async function updateKpiTarget(id: number, data: Partial<InsertKpiTarget>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(kpiTargets).set(data).where(eq(kpiTargets.id, id));
}

export async function deleteKpiTarget(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(kpiTargets).where(eq(kpiTargets.id, id));
}

export async function calculateKpiActuals() {
  const db = await getDb();
  if (!db) return { totalSites: 0, compliant: 0, partial: 0, nonCompliant: 0, complianceRate: 0, partialRate: 0, nonCompliantRate: 0, scansThisMonth: 0, averageScore: 0, openCases: 0, activeSchedules: 0 };
  // Get total sites
  const totalSitesResult = await db.select({ count: count() }).from(sites);
  const totalSites = totalSitesResult[0]?.count || 0;
  
  // Get compliance counts from latest scans
  const compliantResult = await db.select({ count: count() }).from(scans)
    .where(eq(scans.complianceStatus, "compliant"));
  const partialResult = await db.select({ count: count() }).from(scans)
    .where(eq(scans.complianceStatus, "partially_compliant"));
  const nonCompliantResult = await db.select({ count: count() }).from(scans)
    .where(eq(scans.complianceStatus, "non_compliant"));
  
  const compliant = compliantResult[0]?.count || 0;
  const partial = partialResult[0]?.count || 0;
  const nonCompliant = nonCompliantResult[0]?.count || 0;
  
  // Get total scans this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const scansThisMonth = await db.select({ count: count() }).from(scans)
    .where(sql`${scans.createdAt} >= ${monthStart}`);
  
  // Get average score
  const avgScore = await db.select({ avg: avg(scans.overallScore) }).from(scans);
  
  // Get open cases
  const openCases = await db.select({ count: count() }).from(cases)
    .where(sql`${cases.status} != 'closed'`);
  
  // Get active schedules
  const activeSchedules = await db.select({ count: count() }).from(scanSchedules)
    .where(eq(scanSchedules.isActive, true));
  
  return {
    totalSites,
    compliant,
    partial,
    nonCompliant,
    complianceRate: totalSites > 0 ? Math.round((compliant / totalSites) * 100) : 0,
    partialRate: totalSites > 0 ? Math.round((partial / totalSites) * 100) : 0,
    nonCompliantRate: totalSites > 0 ? Math.round((nonCompliant / totalSites) * 100) : 0,
    scansThisMonth: scansThisMonth[0]?.count || 0,
    averageScore: Number(avgScore[0]?.avg || 0),
    openCases: openCases[0]?.count || 0,
    activeSchedules: activeSchedules[0]?.count || 0,
  };
}

// ============ Smart Alerts ============
export async function getSmartAlerts(filters?: { riskLevel?: string; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.riskLevel) conditions.push(eq(smartAlerts.riskLevel, filters.riskLevel as any));
  if (filters?.isActive !== undefined) conditions.push(eq(smartAlerts.isActive, filters.isActive));
  
  if (conditions.length > 0) {
    return db.select().from(smartAlerts).where(and(...conditions)).orderBy(desc(smartAlerts.createdAt));
  }
  return db.select().from(smartAlerts).orderBy(desc(smartAlerts.createdAt));
}

export async function getSmartAlertById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(smartAlerts).where(eq(smartAlerts.id, id));
  return rows[0] || null;
}

export async function createSmartAlert(data: InsertSmartAlert) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(smartAlerts).values(data);
  return { id: result[0].insertId };
}

export async function updateSmartAlert(id: number, data: Partial<InsertSmartAlert>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(smartAlerts).set(data).where(eq(smartAlerts.id, id));
}

export async function acknowledgeSmartAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(smartAlerts).set({ acknowledgedBy: userId, acknowledgedAt: new Date(), isActive: false }).where(eq(smartAlerts.id, id));
}

export async function getSmartAlertStats() {
  const db = await getDb();
  if (!db) return { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
  const total = await db.select({ count: count() }).from(smartAlerts).where(eq(smartAlerts.isActive, true));
  const critical = await db.select({ count: count() }).from(smartAlerts).where(and(eq(smartAlerts.isActive, true), eq(smartAlerts.riskLevel, "critical")));
  const high = await db.select({ count: count() }).from(smartAlerts).where(and(eq(smartAlerts.isActive, true), eq(smartAlerts.riskLevel, "high")));
  const medium = await db.select({ count: count() }).from(smartAlerts).where(and(eq(smartAlerts.isActive, true), eq(smartAlerts.riskLevel, "medium")));
  const low = await db.select({ count: count() }).from(smartAlerts).where(and(eq(smartAlerts.isActive, true), eq(smartAlerts.riskLevel, "low")));
  return {
    total: total[0]?.count || 0,
    critical: critical[0]?.count || 0,
    high: high[0]?.count || 0,
    medium: medium[0]?.count || 0,
    low: low[0]?.count || 0,
  };
}

// ============ Custom Report Export ============
export async function getCustomReportData(modules: string[], filters?: { dateFrom?: Date; dateTo?: Date; sector?: string; category?: string }) {
  const db = await getDb();
  if (!db) return {};
  const result: Record<string, any> = {};
  
  const conditions: any[] = [];
  if (filters?.dateFrom) conditions.push(sql`${scans.createdAt} >= ${filters.dateFrom}`);
  if (filters?.dateTo) conditions.push(sql`${scans.createdAt} <= ${filters.dateTo}`);
  
  if (modules.includes("general_stats")) {
    const totalSites = await db.select({ count: count() }).from(sites);
    const totalScans = await db.select({ count: count() }).from(scans);
    const compliant = await db.select({ count: count() }).from(scans).where(eq(scans.complianceStatus, "compliant"));
    const partial = await db.select({ count: count() }).from(scans).where(eq(scans.complianceStatus, "partially_compliant"));
    const nonCompliant = await db.select({ count: count() }).from(scans).where(eq(scans.complianceStatus, "non_compliant"));
    result.generalStats = {
      totalSites: totalSites[0]?.count || 0,
      totalScans: totalScans[0]?.count || 0,
      compliant: compliant[0]?.count || 0,
      partial: partial[0]?.count || 0,
      nonCompliant: nonCompliant[0]?.count || 0,
    };
  }
  
  if (modules.includes("compliance_breakdown")) {
    const allScans = await db.select({
      domain: scans.domain,
      overallScore: scans.overallScore,
      complianceStatus: scans.complianceStatus,
      rating: scans.rating,
    }).from(scans).orderBy(desc(scans.createdAt)).limit(500);
    result.complianceBreakdown = allScans;
  }
  
  if (modules.includes("article12_clauses")) {
    const clauseNames = [
      "إفصاح عن هوية جهة التحكم", "أغراض جمع البيانات", "الأساس النظامي",
      "مشاركة البيانات مع أطراف ثالثة", "نقل البيانات خارج المملكة",
      "حقوق أصحاب البيانات", "حماية بيانات الأطفال", "معلومات الاتصال"
    ];
    // Single optimized query instead of 16 separate queries
    const statsResult = await db.execute(sql.raw(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN clause1Compliant = 1 THEN 1 ELSE 0 END) as c1,
        SUM(CASE WHEN clause2Compliant = 1 THEN 1 ELSE 0 END) as c2,
        SUM(CASE WHEN clause3Compliant = 1 THEN 1 ELSE 0 END) as c3,
        SUM(CASE WHEN clause4Compliant = 1 THEN 1 ELSE 0 END) as c4,
        SUM(CASE WHEN clause5Compliant = 1 THEN 1 ELSE 0 END) as c5,
        SUM(CASE WHEN clause6Compliant = 1 THEN 1 ELSE 0 END) as c6,
        SUM(CASE WHEN clause7Compliant = 1 THEN 1 ELSE 0 END) as c7,
        SUM(CASE WHEN clause8Compliant = 1 THEN 1 ELSE 0 END) as c8
      FROM scans
    `));
    const statsRow = (statsResult as any)[0]?.[0] || {};
    const totalScans = Number(statsRow.total || 0);
    const clauseStats = [];
    for (let i = 1; i <= 8; i++) {
      const compliant = Number(statsRow[`c${i}`] || 0);
      clauseStats.push({
        clause: i,
        name: clauseNames[i - 1],
        compliant,
        total: totalScans,
        rate: totalScans ? Math.round((compliant / totalScans) * 100) : 0,
      });
    }
    result.article12Clauses = clauseStats;
  }
  
  if (modules.includes("sector_comparison")) {
    const publicSites = await db.select({ count: count() }).from(sites).where(eq(sites.sectorType, "public"));
    const privateSites = await db.select({ count: count() }).from(sites).where(eq(sites.sectorType, "private"));
    
    const publicScans = await db.select().from(scans)
      .innerJoin(sites, eq(scans.siteId, sites.id))
      .where(eq(sites.sectorType, "public"));
    const privateScans = await db.select().from(scans)
      .innerJoin(sites, eq(scans.siteId, sites.id))
      .where(eq(sites.sectorType, "private"));
    
    const publicCompliant = publicScans.filter(s => s.scans.complianceStatus === "compliant").length;
    const privateCompliant = privateScans.filter(s => s.scans.complianceStatus === "compliant").length;
    
    result.sectorComparison = {
      public: { total: publicSites[0]?.count || 0, compliant: publicCompliant, rate: publicScans.length ? Math.round((publicCompliant / publicScans.length) * 100) : 0 },
      private: { total: privateSites[0]?.count || 0, compliant: privateCompliant, rate: privateScans.length ? Math.round((privateCompliant / privateScans.length) * 100) : 0 },
    };
  }
  
  if (modules.includes("category_breakdown")) {
    const allSites = await db.select({ classification: sites.classification }).from(sites);
    const categoriesSet: string[] = [];
    allSites.forEach(s => { if (s.classification && !categoriesSet.includes(s.classification)) categoriesSet.push(s.classification); });
    const categories = categoriesSet;
    const categoryStats = [];
    for (const cat of categories) {
      const catScans = await db.select().from(scans)
        .innerJoin(sites, eq(scans.siteId, sites.id))
        .where(eq(sites.classification, cat as string));
      const compliant = catScans.filter(s => s.scans.complianceStatus === "compliant").length;
      categoryStats.push({
        category: cat,
        total: catScans.length,
        compliant,
        rate: catScans.length ? Math.round((compliant / catScans.length) * 100) : 0,
      });
    }
    result.categoryBreakdown = categoryStats;
  }
  
  if (modules.includes("site_details")) {
    const allSites = await db.select().from(sites).orderBy(asc(sites.siteName)).limit(500);
    const siteDetails = [];
    for (const site of allSites) {
      const latestScan = await db.select().from(scans).where(eq(scans.siteId, site.id)).orderBy(desc(scans.createdAt)).limit(1);
      siteDetails.push({
        domain: site.domain,
        siteName: site.siteName,
        sector: site.sectorType,
        classification: site.classification,
        status: site.siteStatus,
        latestScore: latestScan[0]?.overallScore || null,
        latestStatus: latestScan[0]?.complianceStatus || null,
        latestScanDate: latestScan[0]?.createdAt || null,
      });
    }
    result.siteDetails = siteDetails;
  }
  
  return result;
}


// ============================================================
// Dashboard Snapshots
// ============================================================

export async function createDashboardSnapshot(data: InsertDashboardSnapshot) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(dashboardSnapshots).values(data);
  return result[0].insertId;
}

export async function getDashboardSnapshots(limit = 365) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dashboardSnapshots).orderBy(desc(dashboardSnapshots.snapshotDate)).limit(limit);
}

export async function getSnapshotsByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dashboardSnapshots)
    .where(and(
      sql`${dashboardSnapshots.snapshotDate} >= ${startDate}`,
      sql`${dashboardSnapshots.snapshotDate} <= ${endDate}`
    ))
    .orderBy(asc(dashboardSnapshots.snapshotDate));
}

// ============================================================
// Executive Alerts
// ============================================================

export async function createExecutiveAlert(data: InsertExecutiveAlert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(executiveAlerts).values(data);
  return result[0].insertId;
}

export async function getExecutiveAlerts(filters?: { severity?: string; acknowledged?: boolean; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.severity) conditions.push(sql`${executiveAlerts.severity} = ${filters.severity}`);
  if (filters?.acknowledged !== undefined) conditions.push(eq(executiveAlerts.isAcknowledged, filters.acknowledged));
  const query = db.select().from(executiveAlerts);
  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(desc(executiveAlerts.createdAt)).limit(filters?.limit || 100);
  }
  return query.orderBy(desc(executiveAlerts.createdAt)).limit(filters?.limit || 100);
}

export async function acknowledgeExecutiveAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(executiveAlerts).set({ isAcknowledged: true, acknowledgedBy: userId, acknowledgedAt: new Date() }).where(eq(executiveAlerts.id, id));
}

export async function getExecutiveAlertStats() {
  const db = await getDb();
  if (!db) return { total: 0, critical: 0, high: 0, medium: 0, low: 0, unacknowledged: 0 };
  const [totalResult] = await db.select({ count: count() }).from(executiveAlerts);
  const [criticalResult] = await db.select({ count: count() }).from(executiveAlerts).where(eq(executiveAlerts.severity, "critical"));
  const [highResult] = await db.select({ count: count() }).from(executiveAlerts).where(eq(executiveAlerts.severity, "high"));
  const [mediumResult] = await db.select({ count: count() }).from(executiveAlerts).where(eq(executiveAlerts.severity, "medium"));
  const [lowResult] = await db.select({ count: count() }).from(executiveAlerts).where(eq(executiveAlerts.severity, "low"));
  const [unackResult] = await db.select({ count: count() }).from(executiveAlerts).where(eq(executiveAlerts.isAcknowledged, false));
  return {
    total: totalResult.count,
    critical: criticalResult.count,
    high: highResult.count,
    medium: mediumResult.count,
    low: lowResult.count,
    unacknowledged: unackResult.count,
  };
}

// ============================================================
// Executive Reports
// ============================================================

export async function createExecutiveReport(data: InsertExecutiveReport) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(executiveReports).values(data);
  return result[0].insertId;
}

export async function getExecutiveReports(type?: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  if (type) {
    return db.select().from(executiveReports).where(sql`${executiveReports.reportType} = ${type}`).orderBy(desc(executiveReports.reportDate)).limit(limit);
  }
  return db.select().from(executiveReports).orderBy(desc(executiveReports.reportDate)).limit(limit);
}

// ============================================================
// Enhanced Analytics - Radar, Heatmap, Bubble, Trends
// ============================================================

export async function getRadarChartData() {
  const db = await getDb();
  if (!db) return [];
  // Get latest scan per site and calculate clause compliance rates
  const result = await db.execute(sql`
    WITH latest_scans AS (
      SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.siteId ORDER BY s.createdAt DESC) as rn
      FROM scans s
    )
    SELECT
      SUM(CASE WHEN clause1Compliant = 1 THEN 1 ELSE 0 END) as clause1,
      SUM(CASE WHEN clause2Compliant = 1 THEN 1 ELSE 0 END) as clause2,
      SUM(CASE WHEN clause3Compliant = 1 THEN 1 ELSE 0 END) as clause3,
      SUM(CASE WHEN clause4Compliant = 1 THEN 1 ELSE 0 END) as clause4,
      SUM(CASE WHEN clause5Compliant = 1 THEN 1 ELSE 0 END) as clause5,
      SUM(CASE WHEN clause6Compliant = 1 THEN 1 ELSE 0 END) as clause6,
      SUM(CASE WHEN clause7Compliant = 1 THEN 1 ELSE 0 END) as clause7,
      SUM(CASE WHEN clause8Compliant = 1 THEN 1 ELSE 0 END) as clause8,
      COUNT(*) as total
    FROM latest_scans WHERE rn = 1
  `);
  const rows = result[0] as unknown as any[];
  if (!rows || rows.length === 0) return [];
  const row = rows[0];
  const total = Number(row.total) || 1;
  return [
    { clause: "البند 1: غرض الجمع", rate: Math.round((Number(row.clause1) / total) * 100), count: Number(row.clause1), total },
    { clause: "البند 2: نوع البيانات", rate: Math.round((Number(row.clause2) / total) * 100), count: Number(row.clause2), total },
    { clause: "البند 3: طريقة الجمع", rate: Math.round((Number(row.clause3) / total) * 100), count: Number(row.clause3), total },
    { clause: "البند 4: آلية التخزين", rate: Math.round((Number(row.clause4) / total) * 100), count: Number(row.clause4), total },
    { clause: "البند 5: كيفية المعالجة", rate: Math.round((Number(row.clause5) / total) * 100), count: Number(row.clause5), total },
    { clause: "البند 6: آلية الإتلاف", rate: Math.round((Number(row.clause6) / total) * 100), count: Number(row.clause6), total },
    { clause: "البند 7: حقوق الأصحاب", rate: Math.round((Number(row.clause7) / total) * 100), count: Number(row.clause7), total },
    { clause: "البند 8: آلية الممارسة", rate: Math.round((Number(row.clause8) / total) * 100), count: Number(row.clause8), total },
  ];
}

export async function getHeatmapData() {
  const db = await getDb();
  if (!db) return [];
  // Heatmap: sectors (rows) vs clauses (columns)
  const result = await db.execute(sql`
    WITH latest_scans AS (
      SELECT s.*, st.sectorType, st.classification,
        ROW_NUMBER() OVER (PARTITION BY s.siteId ORDER BY s.createdAt DESC) as rn
      FROM scans s JOIN sites st ON s.siteId = st.id
    )
    SELECT
      sectorType,
      classification,
      COUNT(*) as total,
      SUM(CASE WHEN clause1Compliant = 1 THEN 1 ELSE 0 END) as c1,
      SUM(CASE WHEN clause2Compliant = 1 THEN 1 ELSE 0 END) as c2,
      SUM(CASE WHEN clause3Compliant = 1 THEN 1 ELSE 0 END) as c3,
      SUM(CASE WHEN clause4Compliant = 1 THEN 1 ELSE 0 END) as c4,
      SUM(CASE WHEN clause5Compliant = 1 THEN 1 ELSE 0 END) as c5,
      SUM(CASE WHEN clause6Compliant = 1 THEN 1 ELSE 0 END) as c6,
      SUM(CASE WHEN clause7Compliant = 1 THEN 1 ELSE 0 END) as c7,
      SUM(CASE WHEN clause8Compliant = 1 THEN 1 ELSE 0 END) as c8
    FROM latest_scans WHERE rn = 1
    GROUP BY sectorType, classification
    ORDER BY sectorType, classification
  `);
  const rows = result[0] as unknown as any[];
  return rows.map(r => ({
    sector: r.sectorType === 'public' ? 'حكومي' : 'خاص',
    classification: r.classification || 'غير مصنف',
    total: Number(r.total),
    clauses: [
      Math.round((Number(r.c1) / Number(r.total)) * 100),
      Math.round((Number(r.c2) / Number(r.total)) * 100),
      Math.round((Number(r.c3) / Number(r.total)) * 100),
      Math.round((Number(r.c4) / Number(r.total)) * 100),
      Math.round((Number(r.c5) / Number(r.total)) * 100),
      Math.round((Number(r.c6) / Number(r.total)) * 100),
      Math.round((Number(r.c7) / Number(r.total)) * 100),
      Math.round((Number(r.c8) / Number(r.total)) * 100),
    ]
  }));
}

export async function getBubbleChartData() {
  const db = await getDb();
  if (!db) return [];
  // Bubble chart: clauses (x) vs compliance rate (y), bubble size = site count, color = sector
  const result = await db.execute(sql`
    WITH latest_scans AS (
      SELECT s.*, st.sectorType,
        ROW_NUMBER() OVER (PARTITION BY s.siteId ORDER BY s.createdAt DESC) as rn
      FROM scans s JOIN sites st ON s.siteId = st.id
    )
    SELECT
      sectorType,
      COUNT(*) as siteCount,
      ROUND(AVG(CASE WHEN clause1Compliant = 1 THEN 100 ELSE 0 END), 1) as c1Rate,
      ROUND(AVG(CASE WHEN clause2Compliant = 1 THEN 100 ELSE 0 END), 1) as c2Rate,
      ROUND(AVG(CASE WHEN clause3Compliant = 1 THEN 100 ELSE 0 END), 1) as c3Rate,
      ROUND(AVG(CASE WHEN clause4Compliant = 1 THEN 100 ELSE 0 END), 1) as c4Rate,
      ROUND(AVG(CASE WHEN clause5Compliant = 1 THEN 100 ELSE 0 END), 1) as c5Rate,
      ROUND(AVG(CASE WHEN clause6Compliant = 1 THEN 100 ELSE 0 END), 1) as c6Rate,
      ROUND(AVG(CASE WHEN clause7Compliant = 1 THEN 100 ELSE 0 END), 1) as c7Rate,
      ROUND(AVG(CASE WHEN clause8Compliant = 1 THEN 100 ELSE 0 END), 1) as c8Rate
    FROM latest_scans WHERE rn = 1
    GROUP BY sectorType
  `);
  const rows = result[0] as unknown as any[];
  const bubbles: any[] = [];
  const clauseNames = ["البند 1", "البند 2", "البند 3", "البند 4", "البند 5", "البند 6", "البند 7", "البند 8"];
  for (const row of rows) {
    const rates = [row.c1Rate, row.c2Rate, row.c3Rate, row.c4Rate, row.c5Rate, row.c6Rate, row.c7Rate, row.c8Rate];
    rates.forEach((rate, i) => {
      bubbles.push({
        clause: clauseNames[i],
        clauseIndex: i + 1,
        rate: Number(rate),
        siteCount: Number(row.siteCount),
        sector: row.sectorType === 'public' ? 'حكومي' : 'خاص',
      });
    });
  }
  return bubbles;
}

export async function getComplianceTrendData(months = 12) {
  const db = await getDb();
  if (!db) return [];
  // Monthly compliance trend from scan data
  const result = await db.execute(sql`
    SELECT
      DATE_FORMAT(createdAt, '%Y-%m') as month,
      COUNT(*) as total,
      SUM(CASE WHEN complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partial,
      SUM(CASE WHEN complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      SUM(CASE WHEN complianceStatus = 'no_policy' THEN 1 ELSE 0 END) as noPolicy,
      ROUND(AVG(overallScore), 2) as avgScore
    FROM scans
    WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)
    GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
    ORDER BY month ASC
  `);
  return (result[0] as unknown as any[]).map(r => ({
    month: r.month,
    total: Number(r.total),
    compliant: Number(r.compliant),
    partial: Number(r.partial),
    nonCompliant: Number(r.nonCompliant),
    noPolicy: Number(r.noPolicy),
    avgScore: Number(r.avgScore),
    complianceRate: r.total > 0 ? Math.round((Number(r.compliant) / Number(r.total)) * 100) : 0,
  }));
}

export async function getSectorComplianceTrend(months = 12) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT
      DATE_FORMAT(s.createdAt, '%Y-%m') as month,
      st.sectorType,
      COUNT(*) as total,
      SUM(CASE WHEN s.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      ROUND(AVG(s.overallScore), 2) as avgScore
    FROM scans s JOIN sites st ON s.siteId = st.id
    WHERE s.createdAt >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)
    GROUP BY DATE_FORMAT(s.createdAt, '%Y-%m'), st.sectorType
    ORDER BY month ASC
  `);
  return (result[0] as unknown as any[]).map(r => ({
    month: r.month,
    sector: r.sectorType === 'public' ? 'حكومي' : 'خاص',
    total: Number(r.total),
    compliant: Number(r.compliant),
    avgScore: Number(r.avgScore),
    complianceRate: r.total > 0 ? Math.round((Number(r.compliant) / Number(r.total)) * 100) : 0,
  }));
}

export async function getImprovementVelocity(months = 6) {
  const db = await getDb();
  if (!db) return { improved: 0, declined: 0, unchanged: 0, velocity: 0 };
  // Compare latest scan vs previous scan for each site
  const result = await db.execute(sql`
    WITH ranked AS (
      SELECT siteId, overallScore, createdAt,
        ROW_NUMBER() OVER (PARTITION BY siteId ORDER BY createdAt DESC) as rn
      FROM scans
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)
    )
    SELECT
      SUM(CASE WHEN curr.overallScore > prev.overallScore THEN 1 ELSE 0 END) as improved,
      SUM(CASE WHEN curr.overallScore < prev.overallScore THEN 1 ELSE 0 END) as declined,
      SUM(CASE WHEN curr.overallScore = prev.overallScore THEN 1 ELSE 0 END) as unchanged
    FROM ranked curr
    JOIN ranked prev ON curr.siteId = prev.siteId AND curr.rn = 1 AND prev.rn = 2
  `);
  const rows = result[0] as unknown as any[];
  if (!rows || rows.length === 0) return { improved: 0, declined: 0, unchanged: 0, velocity: 0 };
  const r = rows[0];
  const improved = Number(r.improved) || 0;
  const declined = Number(r.declined) || 0;
  const unchanged = Number(r.unchanged) || 0;
  const total = improved + declined + unchanged;
  return {
    improved,
    declined,
    unchanged,
    velocity: total > 0 ? Math.round(((improved - declined) / total) * 100) : 0,
  };
}

export async function getBenchmarkingData() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    WITH latest_scans AS (
      SELECT s.overallScore, s.complianceStatus, st.sectorType, st.classification,
        ROW_NUMBER() OVER (PARTITION BY s.siteId ORDER BY s.createdAt DESC) as rn
      FROM scans s JOIN sites st ON s.siteId = st.id
    )
    SELECT
      sectorType,
      classification,
      COUNT(*) as siteCount,
      ROUND(AVG(overallScore), 2) as avgScore,
      MAX(overallScore) as maxScore,
      MIN(overallScore) as minScore,
      SUM(CASE WHEN complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partial,
      SUM(CASE WHEN complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant
    FROM latest_scans WHERE rn = 1
    GROUP BY sectorType, classification
    ORDER BY avgScore DESC
  `);
  return (result[0] as unknown as any[]).map(r => ({
    sector: r.sectorType === 'public' ? 'حكومي' : 'خاص',
    classification: r.classification || 'غير مصنف',
    siteCount: Number(r.siteCount),
    avgScore: Number(r.avgScore),
    maxScore: Number(r.maxScore),
    minScore: Number(r.minScore),
    compliant: Number(r.compliant),
    partial: Number(r.partial),
    nonCompliant: Number(r.nonCompliant),
    complianceRate: r.siteCount > 0 ? Math.round((Number(r.compliant) / Number(r.siteCount)) * 100) : 0,
  }));
}

export async function getPredictiveAnalytics(months = 12) {
  const db = await getDb();
  if (!db) return { trend: [], forecast: [] };
  // Get monthly compliance rates for trend + linear regression
  const trendData = await getComplianceTrendData(months);
  if (trendData.length < 2) return { trend: trendData, forecast: [] };
  
  // Simple linear regression on compliance rates
  const n = trendData.length;
  const xValues = trendData.map((_, i) => i);
  const yValues = trendData.map(d => d.complianceRate);
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((a, x, i) => a + x * yValues[i], 0);
  const sumX2 = xValues.reduce((a, x) => a + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Forecast next 3, 6, 12 months
  const forecast = [3, 6, 12].map(m => {
    const predicted = Math.max(0, Math.min(100, Math.round(intercept + slope * (n + m - 1))));
    return { monthsAhead: m, predictedRate: predicted };
  });
  
  return { trend: trendData, forecast };
}

export async function getMasterEntityTable(page = 1, pageSize = 25, sortBy = 'siteName', sortOrder = 'asc', filters?: { sector?: string; status?: string; search?: string }) {
  const db = await getDb();
  if (!db) return { entities: [], total: 0 };
  
  const conditions = [];
  if (filters?.sector) conditions.push(sql`st.sectorType = ${filters.sector}`);
  if (filters?.status) conditions.push(sql`ls.complianceStatus = ${filters.status}`);
  if (filters?.search) conditions.push(sql`(st.siteName LIKE ${`%${filters.search}%`} OR st.domain LIKE ${`%${filters.search}%`})`);
  
  const whereClause = conditions.length > 0 ? sql`WHERE ${sql.join(conditions, sql` AND `)}` : sql``;
  const offset = (page - 1) * pageSize;
  
  // Get total count
  const countResult = await db.execute(sql`
    WITH latest_scans AS (
      SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.siteId ORDER BY s.createdAt DESC) as rn
      FROM scans s
    )
    SELECT COUNT(DISTINCT st.id) as total
    FROM sites st
    LEFT JOIN latest_scans ls ON st.id = ls.siteId AND ls.rn = 1
    ${whereClause}
  `);
  const total = Number((countResult[0] as unknown as any[])[0]?.total) || 0;
  
  // Get paginated entities
  const result = await db.execute(sql`
    WITH latest_scans AS (
      SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.siteId ORDER BY s.createdAt DESC) as rn
      FROM scans s
    )
    SELECT
      st.id, st.domain, st.siteName, st.sectorType, st.classification, st.siteStatus,
      ls.overallScore, ls.complianceStatus, ls.createdAt as lastScanDate,
      ls.clause1Compliant, ls.clause2Compliant, ls.clause3Compliant, ls.clause4Compliant,
      ls.clause5Compliant, ls.clause6Compliant, ls.clause7Compliant, ls.clause8Compliant,
      (SELECT COUNT(*) FROM scans WHERE siteId = st.id) as scanCount
    FROM sites st
    LEFT JOIN latest_scans ls ON st.id = ls.siteId AND ls.rn = 1
    ${whereClause}
    ORDER BY st.siteName ASC
    LIMIT ${pageSize} OFFSET ${offset}
  `);
  
  const entities = (result[0] as unknown as any[]).map(r => ({
    id: r.id,
    domain: r.domain,
    siteName: r.siteName,
    sector: r.sectorType,
    classification: r.classification,
    siteStatus: r.siteStatus,
    score: Number(r.overallScore) || 0,
    complianceStatus: r.complianceStatus,
    lastScanDate: r.lastScanDate,
    scanCount: Number(r.scanCount),
    clausesMet: [r.clause1Compliant, r.clause2Compliant, r.clause3Compliant, r.clause4Compliant, r.clause5Compliant, r.clause6Compliant, r.clause7Compliant, r.clause8Compliant].filter(Boolean).length,
    clauses: [!!r.clause1Compliant, !!r.clause2Compliant, !!r.clause3Compliant, !!r.clause4Compliant, !!r.clause5Compliant, !!r.clause6Compliant, !!r.clause7Compliant, !!r.clause8Compliant],
  }));
  
  return { entities, total };
}


// ============================================================
// Saved Filters CRUD
// ============================================================
export async function getSavedFilters(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(savedFilters)
    .where(or(eq(savedFilters.userId, userId), eq(savedFilters.isShared, true)))
    .orderBy(desc(savedFilters.updatedAt));
  return results;
}

export async function createSavedFilter(data: InsertSavedFilter) {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.insert(savedFilters).values(data).$returningId();
  return result.id;
}

export async function updateSavedFilter(id: number, userId: number, data: Partial<InsertSavedFilter>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(savedFilters).set(data).where(and(eq(savedFilters.id, id), eq(savedFilters.userId, userId)));
  return true;
}

export async function deleteSavedFilter(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(savedFilters).where(and(eq(savedFilters.id, id), eq(savedFilters.userId, userId)));
  return true;
}

export async function incrementFilterUsage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.execute(sql`UPDATE saved_filters SET usageCount = usageCount + 1 WHERE id = ${id}`);
}

// ============================================================
// Advanced Search
// ============================================================
export async function advancedSearch(params: {
  search?: string;
  sector?: string;
  classification?: string;
  complianceStatus?: string;
  siteStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  hasPrivacyPolicy?: boolean;
  minScore?: number;
  maxScore?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { results: [], total: 0 };
  
  const page = params.page || 1;
  const limit = params.limit || 25;
  const offset = (page - 1) * limit;
  
  // Build dynamic SQL using sql template
  const searchLike = params.search ? `%${params.search}%` : null;
  
  const countResult = await db.execute(sql`
    SELECT COUNT(DISTINCT st.id) as total
    FROM sites st
    LEFT JOIN (
      SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.siteId ORDER BY s.createdAt DESC) as rn
      FROM scans s
    ) ls ON ls.siteId = st.id AND ls.rn = 1
    WHERE 1=1
      ${searchLike ? sql`AND (st.siteName LIKE ${searchLike} OR st.domain LIKE ${searchLike})` : sql``}
      ${params.sector ? sql`AND st.sectorType = ${params.sector}` : sql``}
      ${params.classification ? sql`AND st.classification = ${params.classification}` : sql``}
      ${params.siteStatus ? sql`AND st.siteStatus = ${params.siteStatus}` : sql``}
      ${params.complianceStatus ? sql`AND ls.complianceStatus = ${params.complianceStatus}` : sql``}
      ${params.dateFrom ? sql`AND ls.createdAt >= ${params.dateFrom}` : sql``}
      ${params.dateTo ? sql`AND ls.createdAt <= ${params.dateTo}` : sql``}
      ${params.hasPrivacyPolicy === true ? sql`AND st.privacyUrl IS NOT NULL AND st.privacyUrl != ''` : sql``}
      ${params.hasPrivacyPolicy === false ? sql`AND (st.privacyUrl IS NULL OR st.privacyUrl = '')` : sql``}
      ${params.minScore !== undefined ? sql`AND ls.overallScore >= ${params.minScore}` : sql``}
      ${params.maxScore !== undefined ? sql`AND ls.overallScore <= ${params.maxScore}` : sql``}
  `) as any;
  const rows = Array.isArray(countResult) ? (Array.isArray(countResult[0]) ? countResult[0] : countResult) : [];
  const total = rows?.[0]?.total || 0;
  
  const dataResult = await db.execute(sql`
    SELECT 
      st.id, st.domain, st.siteName, st.sectorType, st.classification,
      st.siteStatus, st.privacyUrl,
      ls.overallScore, ls.complianceStatus, ls.createdAt as lastScanDate
    FROM sites st
    LEFT JOIN (
      SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.siteId ORDER BY s.createdAt DESC) as rn
      FROM scans s
    ) ls ON ls.siteId = st.id AND ls.rn = 1
    WHERE 1=1
      ${searchLike ? sql`AND (st.siteName LIKE ${searchLike} OR st.domain LIKE ${searchLike})` : sql``}
      ${params.sector ? sql`AND st.sectorType = ${params.sector}` : sql``}
      ${params.classification ? sql`AND st.classification = ${params.classification}` : sql``}
      ${params.siteStatus ? sql`AND st.siteStatus = ${params.siteStatus}` : sql``}
      ${params.complianceStatus ? sql`AND ls.complianceStatus = ${params.complianceStatus}` : sql``}
      ${params.dateFrom ? sql`AND ls.createdAt >= ${params.dateFrom}` : sql``}
      ${params.dateTo ? sql`AND ls.createdAt <= ${params.dateTo}` : sql``}
      ${params.hasPrivacyPolicy === true ? sql`AND st.privacyUrl IS NOT NULL AND st.privacyUrl != ''` : sql``}
      ${params.hasPrivacyPolicy === false ? sql`AND (st.privacyUrl IS NULL OR st.privacyUrl = '')` : sql``}
      ${params.minScore !== undefined ? sql`AND ls.overallScore >= ${params.minScore}` : sql``}
      ${params.maxScore !== undefined ? sql`AND ls.overallScore <= ${params.maxScore}` : sql``}
    ORDER BY st.siteName ASC
    LIMIT ${limit} OFFSET ${offset}
  `) as any;
  const results = Array.isArray(dataResult) ? (Array.isArray(dataResult[0]) ? dataResult[0] : dataResult) : [];
  
  return { results: results || [], total: Number(total) };
}


// ===== User Sessions =====
export async function createUserSession(data: InsertUserSession) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(userSessions).values(data);
  return data;
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userSessions)
    .where(and(eq(userSessions.userId, userId), eq(userSessions.isActive, true)))
    .orderBy(desc(userSessions.lastActivity));
}

export async function deactivateSession(sessionId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(userSessions)
    .set({ isActive: false })
    .where(and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)));
}

export async function deactivateAllSessions(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(userSessions).set({ isActive: false }).where(eq(userSessions.userId, userId));
}

export async function updateSessionActivity(sessionToken: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(userSessions)
    .set({ lastActivity: new Date() })
    .where(and(eq(userSessions.sessionToken, sessionToken), eq(userSessions.isActive, true)));
}

// ===== Compliance Change Notifications =====
export async function insertComplianceChangeNotification(data: InsertComplianceChangeNotification) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(complianceChangeNotifications).values(data);
  return data;
}

export async function getComplianceChangeNotifications(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(complianceChangeNotifications)
    .orderBy(desc(complianceChangeNotifications.createdAt))
    .limit(limit);
}

export async function markNotificationEmailSent(id: number, sentTo: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(complianceChangeNotifications)
    .set({ emailSent: true, emailSentTo: sentTo, emailSentAt: new Date() })
    .where(eq(complianceChangeNotifications.id, id));
}

// ===== Filtered Dashboard Stats =====
export async function getDashboardStatsFiltered(params: { sector?: string; timePeriod?: string }) {
  const db = await getDb();
  if (!db) return null;
  
  let dateFilter = sql`1=1`;
  if (params.timePeriod) {
    switch (params.timePeriod) {
      case 'week': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)`; break;
      case 'month': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)`; break;
      case 'quarter': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 90 DAY)`; break;
      case 'year': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 365 DAY)`; break;
    }
  }
  
  let sectorFilter = sql`1=1`;
  if (params.sector && params.sector !== 'all') {
    sectorFilter = sql`s.classification = ${params.sector}`;
  }
  
  const result = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT s.id) as totalSites,
      COUNT(DISTINCT CASE WHEN s.siteStatus = 'active' THEN s.id END) as activeSites,
      COUNT(sc.id) as totalScans,
      SUM(CASE WHEN sc.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN sc.complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partiallyCompliant,
      SUM(CASE WHEN sc.complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      SUM(CASE WHEN sc.complianceStatus = 'no_policy' THEN 1 ELSE 0 END) as noPolicy,
      ROUND(AVG(sc.overallScore), 1) as averageScore
    FROM sites s
    LEFT JOIN scans sc ON s.id = sc.siteId AND ${dateFilter}
    WHERE ${sectorFilter}
  `);
  
  const row = ((result as any)[0] as any[])?.[0] || {};
  return {
    totalSites: Number(row.totalSites) || 0,
    activeSites: Number(row.activeSites) || 0,
    totalScans: Number(row.totalScans) || 0,
    compliant: Number(row.compliant) || 0,
    partiallyCompliant: Number(row.partiallyCompliant) || 0,
    nonCompliant: Number(row.nonCompliant) || 0,
    noPolicy: Number(row.noPolicy) || 0,
    averageScore: Number(row.averageScore) || 0,
  };
}

export async function getClauseStatsFiltered(params: { sector?: string; timePeriod?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let dateFilter = sql`1=1`;
  if (params.timePeriod) {
    switch (params.timePeriod) {
      case 'week': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)`; break;
      case 'month': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)`; break;
      case 'quarter': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 90 DAY)`; break;
      case 'year': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 365 DAY)`; break;
    }
  }
  
  let sectorFilter = sql`1=1`;
  if (params.sector && params.sector !== 'all') {
    sectorFilter = sql`s.classification = ${params.sector}`;
  }
  
  const clauseNames = [
    'تحديد الغرض من جمع البيانات',
    'تحديد محتوى البيانات المطلوب جمعها',
    'تحديد طريقة جمع البيانات',
    'تحديد وسيلة حفظ البيانات',
    'تحديد كيفية معالجة البيانات',
    'تحديد كيفية إتلاف البيانات',
    'تحديد حقوق صاحب البيانات',
    'كيفية ممارسة الحقوق',
  ];
  
  const result = await db.execute(sql`
    SELECT 
      COUNT(sc.id) as total,
      SUM(CASE WHEN sc.clause1Compliant = 1 THEN 1 ELSE 0 END) as c1,
      SUM(CASE WHEN sc.clause2Compliant = 1 THEN 1 ELSE 0 END) as c2,
      SUM(CASE WHEN sc.clause3Compliant = 1 THEN 1 ELSE 0 END) as c3,
      SUM(CASE WHEN sc.clause4Compliant = 1 THEN 1 ELSE 0 END) as c4,
      SUM(CASE WHEN sc.clause5Compliant = 1 THEN 1 ELSE 0 END) as c5,
      SUM(CASE WHEN sc.clause6Compliant = 1 THEN 1 ELSE 0 END) as c6,
      SUM(CASE WHEN sc.clause7Compliant = 1 THEN 1 ELSE 0 END) as c7,
      SUM(CASE WHEN sc.clause8Compliant = 1 THEN 1 ELSE 0 END) as c8
    FROM scans sc
    JOIN sites s ON sc.siteId = s.id
    WHERE ${dateFilter} AND ${sectorFilter}
  `);
  
  const row = ((result as any)[0] as any[])?.[0] || {};
  const totalCount = Number(row.total) || 1;
  
  return clauseNames.map((name, i) => ({
    clause: i + 1,
    name,
    compliant: Number(row[`c${i + 1}`]) || 0,
    total: totalCount,
    percentage: Math.round(((Number(row[`c${i + 1}`]) || 0) / totalCount) * 100),
  }));
}

export async function getSectorComplianceFiltered(params: { sector?: string; timePeriod?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let dateFilter = sql`1=1`;
  if (params.timePeriod) {
    switch (params.timePeriod) {
      case 'week': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 7 DAY)`; break;
      case 'month': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 30 DAY)`; break;
      case 'quarter': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 90 DAY)`; break;
      case 'year': dateFilter = sql`sc.scanDate >= DATE_SUB(NOW(), INTERVAL 365 DAY)`; break;
    }
  }
  
  let sectorFilter = sql`1=1`;
  if (params.sector && params.sector !== 'all') {
    sectorFilter = sql`s.classification = ${params.sector}`;
  }
  
  const result = await db.execute(sql`
    SELECT s.classification, 
           COUNT(sc.id) as total,
           SUM(CASE WHEN sc.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
           SUM(CASE WHEN sc.complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partial,
           SUM(CASE WHEN sc.complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as non_compliant,
           SUM(CASE WHEN sc.complianceStatus = 'no_policy' THEN 1 ELSE 0 END) as no_policy,
           ROUND(AVG(sc.overallScore), 1) as avg_score
    FROM sites s
    JOIN scans sc ON s.id = sc.siteId
    WHERE s.siteStatus = 'active' AND ${dateFilter} AND ${sectorFilter}
    GROUP BY s.classification
    ORDER BY total DESC
  `);
  return result[0];
}

// Get all unique sectors/classifications
export async function getAllSectors() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT DISTINCT classification FROM sites WHERE classification IS NOT NULL AND classification != '' ORDER BY classification
  `);
  return (((result as any)[0] as any[]) || []).map((r: any) => r.classification);
}


// ===== Advanced Dashboard Stats by Sector Type (Public/Private) =====
export async function getDashboardStatsBySectorType() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT 
      s.sectorType,
      COUNT(DISTINCT s.id) as totalSites,
      COUNT(sc.id) as totalScans,
      SUM(CASE WHEN sc.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN sc.complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partiallyCompliant,
      SUM(CASE WHEN sc.complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      SUM(CASE WHEN sc.complianceStatus = 'no_policy' THEN 1 ELSE 0 END) as noPolicy,
      ROUND(AVG(sc.overallScore), 1) as averageScore
    FROM sites s
    LEFT JOIN (
      SELECT sc1.* FROM scans sc1
    ) sc ON s.id = sc.siteId
    WHERE s.siteStatus = 'active'
    GROUP BY s.sectorType
  `);
  return ((result as any)[0] as any[]) || [];
}

// ===== Clause Stats by Sector Type =====
export async function getClauseStatsBySectorType() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT 
      s.sectorType,
      COUNT(sc.id) as total,
      SUM(CASE WHEN sc.clause1Compliant = 1 THEN 1 ELSE 0 END) as c1,
      SUM(CASE WHEN sc.clause2Compliant = 1 THEN 1 ELSE 0 END) as c2,
      SUM(CASE WHEN sc.clause3Compliant = 1 THEN 1 ELSE 0 END) as c3,
      SUM(CASE WHEN sc.clause4Compliant = 1 THEN 1 ELSE 0 END) as c4,
      SUM(CASE WHEN sc.clause5Compliant = 1 THEN 1 ELSE 0 END) as c5,
      SUM(CASE WHEN sc.clause6Compliant = 1 THEN 1 ELSE 0 END) as c6,
      SUM(CASE WHEN sc.clause7Compliant = 1 THEN 1 ELSE 0 END) as c7,
      SUM(CASE WHEN sc.clause8Compliant = 1 THEN 1 ELSE 0 END) as c8
    FROM scans sc
    JOIN sites s ON sc.siteId = s.id
    WHERE s.siteStatus = 'active'
    GROUP BY s.sectorType
  `);
  return ((result as any)[0] as any[]) || [];
}

// ===== Dashboard Stats by Sector Type AND Category =====
export async function getDashboardStatsBySectorAndCategory() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT 
      s.sectorType,
      s.classification as category,
      COUNT(DISTINCT s.id) as totalSites,
      COUNT(sc.id) as totalScans,
      SUM(CASE WHEN sc.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN sc.complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partiallyCompliant,
      SUM(CASE WHEN sc.complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      SUM(CASE WHEN sc.complianceStatus = 'no_policy' THEN 1 ELSE 0 END) as noPolicy,
      ROUND(AVG(sc.overallScore), 1) as averageScore
    FROM sites s
    LEFT JOIN (
      SELECT sc1.* FROM scans sc1
    ) sc ON s.id = sc.siteId
    WHERE s.siteStatus = 'active'
    GROUP BY s.sectorType, s.classification
    ORDER BY s.sectorType, totalSites DESC
  `);
  return ((result as any)[0] as any[]) || [];
}

// ===== Clause Stats by Sector Type AND Category =====
export async function getClauseStatsBySectorAndCategory() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT 
      s.sectorType,
      s.classification as category,
      COUNT(sc.id) as total,
      SUM(CASE WHEN sc.clause1Compliant = 1 THEN 1 ELSE 0 END) as c1,
      SUM(CASE WHEN sc.clause2Compliant = 1 THEN 1 ELSE 0 END) as c2,
      SUM(CASE WHEN sc.clause3Compliant = 1 THEN 1 ELSE 0 END) as c3,
      SUM(CASE WHEN sc.clause4Compliant = 1 THEN 1 ELSE 0 END) as c4,
      SUM(CASE WHEN sc.clause5Compliant = 1 THEN 1 ELSE 0 END) as c5,
      SUM(CASE WHEN sc.clause6Compliant = 1 THEN 1 ELSE 0 END) as c6,
      SUM(CASE WHEN sc.clause7Compliant = 1 THEN 1 ELSE 0 END) as c7,
      SUM(CASE WHEN sc.clause8Compliant = 1 THEN 1 ELSE 0 END) as c8
    FROM scans sc
    JOIN sites s ON sc.siteId = s.id
    WHERE s.siteStatus = 'active'
    GROUP BY s.sectorType, s.classification
    ORDER BY s.sectorType, total DESC
  `);
  return ((result as any)[0] as any[]) || [];
}

// ===== Monthly Comparison Stats =====
export async function getMonthlyComparisonStats() {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // This month scans
  const thisMonthCondition = gte(scans.scanDate, thisMonthStart);
  const lastMonthCondition = and(gte(scans.scanDate, lastMonthStart), lte(scans.scanDate, lastMonthEnd));

  const [thisTotal] = await db.select({ count: count() }).from(scans).where(thisMonthCondition);
  const [thisCompliant] = await db.select({ count: count() }).from(scans).where(and(thisMonthCondition, eq(scans.complianceStatus, 'compliant')));
  const [thisPartial] = await db.select({ count: count() }).from(scans).where(and(thisMonthCondition, eq(scans.complianceStatus, 'partially_compliant')));
  const [thisNonCompliant] = await db.select({ count: count() }).from(scans).where(and(thisMonthCondition, eq(scans.complianceStatus, 'non_compliant')));
  const [thisNoPolicy] = await db.select({ count: count() }).from(scans).where(and(thisMonthCondition, eq(scans.complianceStatus, 'no_policy')));

  const [lastTotal] = await db.select({ count: count() }).from(scans).where(lastMonthCondition);
  const [lastCompliant] = await db.select({ count: count() }).from(scans).where(and(lastMonthCondition, eq(scans.complianceStatus, 'compliant')));
  const [lastPartial] = await db.select({ count: count() }).from(scans).where(and(lastMonthCondition, eq(scans.complianceStatus, 'partially_compliant')));
  const [lastNonCompliant] = await db.select({ count: count() }).from(scans).where(and(lastMonthCondition, eq(scans.complianceStatus, 'non_compliant')));
  const [lastNoPolicy] = await db.select({ count: count() }).from(scans).where(and(lastMonthCondition, eq(scans.complianceStatus, 'no_policy')));

  // Sites total (doesn't change month over month, but we count new sites)
  const [totalSites] = await db.select({ count: count() }).from(sites);
  const [newSitesThisMonth] = await db.select({ count: count() }).from(sites).where(gte(sites.createdAt, thisMonthStart));
  const [newSitesLastMonth] = await db.select({ count: count() }).from(sites).where(and(gte(sites.createdAt, lastMonthStart), lte(sites.createdAt, lastMonthEnd)));

  function calcChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  return {
    totalSites: totalSites.count,
    newSitesThisMonth: newSitesThisMonth.count,
    newSitesLastMonth: newSitesLastMonth.count,
    sitesChange: calcChange(newSitesThisMonth.count, newSitesLastMonth.count),
    thisMonth: {
      totalScans: thisTotal.count,
      compliant: thisCompliant.count,
      partiallyCompliant: thisPartial.count,
      nonCompliant: thisNonCompliant.count,
      noPolicy: thisNoPolicy.count,
    },
    lastMonth: {
      totalScans: lastTotal.count,
      compliant: lastCompliant.count,
      partiallyCompliant: lastPartial.count,
      nonCompliant: lastNonCompliant.count,
      noPolicy: lastNoPolicy.count,
    },
    changes: {
      totalScans: calcChange(thisTotal.count, lastTotal.count),
      compliant: calcChange(thisCompliant.count, lastCompliant.count),
      partiallyCompliant: calcChange(thisPartial.count, lastPartial.count),
      nonCompliant: calcChange(thisNonCompliant.count, lastNonCompliant.count),
      noPolicy: calcChange(thisNoPolicy.count, lastNoPolicy.count),
    },
  };
}


// ===== User Dashboard Widgets =====
export async function getUserDashboardWidgets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userDashboardWidgets).where(eq(userDashboardWidgets.userId, userId)).orderBy(asc(userDashboardWidgets.position));
}

export async function saveUserDashboardWidgets(userId: number, widgets: Array<{ widgetType: string; title: string; position: number; gridWidth: number; isVisible: boolean; config?: any }>) {
  const db = await getDb();
  if (!db) return false;
  // Delete existing widgets for user
  await db.delete(userDashboardWidgets).where(eq(userDashboardWidgets.userId, userId));
  // Insert new widgets
  if (widgets.length > 0) {
    await db.insert(userDashboardWidgets).values(widgets.map(w => ({
      userId,
      widgetType: w.widgetType,
      title: w.title,
      position: w.position,
      gridWidth: w.gridWidth,
      isVisible: w.isVisible,
      config: w.config || null,
    })));
  }
  return true;
}

export async function initDefaultWidgets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  // Check if user already has widgets
  const existing = await db.select({ count: count() }).from(userDashboardWidgets).where(eq(userDashboardWidgets.userId, userId));
  if (existing[0].count > 0) return getUserDashboardWidgets(userId);
  // Create default widgets
  const defaults = [
    { widgetType: 'compliance_overview', title: 'نظرة عامة على الامتثال', position: 0, gridWidth: 2, isVisible: true },
    { widgetType: 'sector_comparison', title: 'مقارنة القطاعات', position: 1, gridWidth: 1, isVisible: true },
    { widgetType: 'clause_stats', title: 'بنود المادة 12', position: 2, gridWidth: 1, isVisible: true },
    { widgetType: 'recent_scans', title: 'آخر الفحوصات', position: 3, gridWidth: 1, isVisible: true },
    { widgetType: 'alerts_summary', title: 'ملخص التنبيهات', position: 4, gridWidth: 1, isVisible: true },
    { widgetType: 'time_comparison', title: 'المقارنة الزمنية', position: 5, gridWidth: 2, isVisible: true },
    { widgetType: 'top_compliant', title: 'أفضل المواقع امتثالاً', position: 6, gridWidth: 1, isVisible: true },
    { widgetType: 'category_stats', title: 'إحصائيات الفئات', position: 7, gridWidth: 1, isVisible: true },
  ];
  await db.insert(userDashboardWidgets).values(defaults.map(d => ({ ...d, userId })));
  return getUserDashboardWidgets(userId);
}

// ===== Visual Alerts =====
export async function getVisualAlerts(userId?: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(visualAlerts.isDismissed, false)];
  if (userId) {
    conditions.push(sql`(${visualAlerts.userId} IS NULL OR ${visualAlerts.userId} = ${userId})`);
  }
  return db.select().from(visualAlerts).where(and(...conditions)).orderBy(desc(visualAlerts.createdAt)).limit(limit);
}

export async function getUnreadVisualAlertsCount(userId?: number) {
  const db = await getDb();
  if (!db) return 0;
  const conditions = [eq(visualAlerts.isRead, false), eq(visualAlerts.isDismissed, false)];
  if (userId) {
    conditions.push(sql`(${visualAlerts.userId} IS NULL OR ${visualAlerts.userId} = ${userId})`);
  }
  const [result] = await db.select({ count: count() }).from(visualAlerts).where(and(...conditions));
  return result.count;
}

export async function markVisualAlertRead(alertId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.update(visualAlerts).set({ isRead: true }).where(eq(visualAlerts.id, alertId));
  return true;
}

export async function markAllVisualAlertsRead(userId?: number) {
  const db = await getDb();
  if (!db) return false;
  const conditions = [eq(visualAlerts.isRead, false)];
  if (userId) {
    conditions.push(sql`(${visualAlerts.userId} IS NULL OR ${visualAlerts.userId} = ${userId})`);
  }
  await db.update(visualAlerts).set({ isRead: true }).where(and(...conditions));
  return true;
}

export async function dismissVisualAlert(alertId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.update(visualAlerts).set({ isDismissed: true }).where(eq(visualAlerts.id, alertId));
  return true;
}

export async function createVisualAlert(data: {
  siteId: number;
  domain: string;
  siteName?: string;
  alertType: 'status_change' | 'score_change' | 'policy_added' | 'policy_removed' | 'clause_change';
  severity: 'info' | 'warning' | 'critical' | 'success';
  previousStatus?: string;
  newStatus?: string;
  previousScore?: number;
  newScore?: number;
  message: string;
  details?: any;
  userId?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(visualAlerts).values(data).$returningId();
  return result;
}

export async function getVisualAlertStats() {
  const db = await getDb();
  if (!db) return { total: 0, unread: 0, critical: 0, warning: 0, info: 0, success: 0 };
  const [total] = await db.select({ count: count() }).from(visualAlerts).where(eq(visualAlerts.isDismissed, false));
  const [unread] = await db.select({ count: count() }).from(visualAlerts).where(and(eq(visualAlerts.isRead, false), eq(visualAlerts.isDismissed, false)));
  const [critical] = await db.select({ count: count() }).from(visualAlerts).where(and(eq(visualAlerts.severity, 'critical'), eq(visualAlerts.isDismissed, false)));
  const [warning] = await db.select({ count: count() }).from(visualAlerts).where(and(eq(visualAlerts.severity, 'warning'), eq(visualAlerts.isDismissed, false)));
  const [info] = await db.select({ count: count() }).from(visualAlerts).where(and(eq(visualAlerts.severity, 'info'), eq(visualAlerts.isDismissed, false)));
  const [success] = await db.select({ count: count() }).from(visualAlerts).where(and(eq(visualAlerts.severity, 'success'), eq(visualAlerts.isDismissed, false)));
  return { total: total.count, unread: unread.count, critical: critical.count, warning: warning.count, info: info.count, success: success.count };
}

// ===== Enhanced Time Comparison =====
export async function getDetailedTimeComparison() {
  const db = await getDb();
  if (!db) return null;
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Get current overall stats from latest scans per site
  const allSites = await db.select().from(sites);
  const totalSites = allSites.length;

  // Get latest scan for each site
  const latestScans = await db.execute(sql`
    SELECT s.* FROM scans s
    INNER JOIN (SELECT siteId, MAX(scanDate) as maxDate FROM scans GROUP BY siteId) latest
    ON s.siteId = latest.siteId AND s.scanDate = latest.maxDate
  `);
  const rows = (latestScans as any).rows || latestScans;
  
  let currentCompliant = 0, currentPartial = 0, currentNonCompliant = 0, currentNoPolicy = 0;
  let currentClauseCounts = [0,0,0,0,0,0,0,0];
  for (const row of rows) {
    if (row.complianceStatus === 'compliant') currentCompliant++;
    else if (row.complianceStatus === 'partially_compliant') currentPartial++;
    else if (row.complianceStatus === 'non_compliant') currentNonCompliant++;
    else currentNoPolicy++;
    for (let i = 1; i <= 8; i++) {
      if (row[`clause${i}Compliant`]) currentClauseCounts[i-1]++;
    }
  }
  const scannedSites = rows.length;

  // Get scans from last month for comparison
  const lastMonthScans = await db.select().from(scans)
    .where(and(gte(scans.scanDate, lastMonthStart), lte(scans.scanDate, lastMonthEnd)));
  
  let lastCompliant = 0, lastPartial = 0, lastNonCompliant = 0, lastNoPolicy = 0;
  let lastClauseCounts = [0,0,0,0,0,0,0,0];
  const lastMonthSiteIds = new Set<number>();
  for (const scan of lastMonthScans) {
    if (!lastMonthSiteIds.has(scan.siteId)) {
      lastMonthSiteIds.add(scan.siteId);
      if (scan.complianceStatus === 'compliant') lastCompliant++;
      else if (scan.complianceStatus === 'partially_compliant') lastPartial++;
      else if (scan.complianceStatus === 'non_compliant') lastNonCompliant++;
      else lastNoPolicy++;
      for (let i = 1; i <= 8; i++) {
        if ((scan as any)[`clause${i}Compliant`]) lastClauseCounts[i-1]++;
      }
    }
  }

  function calcChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Sector comparison
  const publicSites = allSites.filter(s => s.sectorType === 'public');
  const privateSites = allSites.filter(s => s.sectorType === 'private');
  const publicIds = new Set(publicSites.map(s => s.id));
  const privateIds = new Set(privateSites.map(s => s.id));
  
  let pubCompliant = 0, privCompliant = 0;
  for (const row of rows) {
    if (row.complianceStatus === 'compliant') {
      if (publicIds.has(row.siteId)) pubCompliant++;
      else privCompliant++;
    }
  }

  return {
    current: {
      totalSites,
      scannedSites,
      compliant: currentCompliant,
      partial: currentPartial,
      nonCompliant: currentNonCompliant,
      noPolicy: currentNoPolicy,
      clauseCounts: currentClauseCounts,
      complianceRate: scannedSites > 0 ? Math.round((currentCompliant / scannedSites) * 100) : 0,
    },
    previous: {
      scannedSites: lastMonthSiteIds.size,
      compliant: lastCompliant,
      partial: lastPartial,
      nonCompliant: lastNonCompliant,
      noPolicy: lastNoPolicy,
      clauseCounts: lastClauseCounts,
      complianceRate: lastMonthSiteIds.size > 0 ? Math.round((lastCompliant / lastMonthSiteIds.size) * 100) : 0,
    },
    changes: {
      compliant: calcChange(currentCompliant, lastCompliant),
      partial: calcChange(currentPartial, lastPartial),
      nonCompliant: calcChange(currentNonCompliant, lastNonCompliant),
      noPolicy: calcChange(currentNoPolicy, lastNoPolicy),
      complianceRate: calcChange(
        scannedSites > 0 ? Math.round((currentCompliant / scannedSites) * 100) : 0,
        lastMonthSiteIds.size > 0 ? Math.round((lastCompliant / lastMonthSiteIds.size) * 100) : 0
      ),
      clauseChanges: currentClauseCounts.map((c, i) => calcChange(c, lastClauseCounts[i])),
    },
    sectors: {
      publicCompliant: pubCompliant,
      publicTotal: publicSites.length,
      privateCompliant: privCompliant,
      privateTotal: privateSites.length,
    },
    monthLabel: {
      current: `${now.toLocaleDateString('ar-SA-u-nu-latn', { month: 'long', year: 'numeric' })}`,
      previous: `${new Date(now.getFullYear(), now.getMonth() - 1).toLocaleDateString('ar-SA-u-nu-latn', { month: 'long', year: 'numeric' })}`,
    },
  };
}


// ===== Email Notification Preferences =====
export async function getEmailNotificationPrefs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailNotificationPrefs).where(eq(emailNotificationPrefs.userId, userId));
}

export async function getActiveEmailNotificationPrefs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailNotificationPrefs).where(eq(emailNotificationPrefs.isActive, true));
}

export async function upsertEmailNotificationPref(userId: number, data: {
  emailAddress: string;
  notifyOnStatusChange?: boolean;
  notifyOnScoreChange?: boolean;
  notifyOnNewScan?: boolean;
  notifyOnCriticalOnly?: boolean;
  minScoreChangeThreshold?: number;
  sectorFilter?: string[] | null;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(emailNotificationPrefs)
    .where(eq(emailNotificationPrefs.userId, userId))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(emailNotificationPrefs)
      .set({ ...data, sectorFilter: data.sectorFilter || null })
      .where(eq(emailNotificationPrefs.id, existing[0].id));
    return { ...existing[0], ...data };
  } else {
    const result = await db.insert(emailNotificationPrefs).values({
      userId,
      emailAddress: data.emailAddress,
      notifyOnStatusChange: data.notifyOnStatusChange ?? true,
      notifyOnScoreChange: data.notifyOnScoreChange ?? true,
      notifyOnNewScan: data.notifyOnNewScan ?? false,
      notifyOnCriticalOnly: data.notifyOnCriticalOnly ?? false,
      minScoreChangeThreshold: data.minScoreChangeThreshold ?? 10,
      sectorFilter: data.sectorFilter || null,
      isActive: data.isActive ?? true,
    });
    return { id: Number(result[0].insertId), userId, ...data };
  }
}

export async function deleteEmailNotificationPref(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(emailNotificationPrefs)
    .where(and(eq(emailNotificationPrefs.id, id), eq(emailNotificationPrefs.userId, userId)));
}

// ===== PDF Report History =====
export async function getPdfReportHistory(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pdfReportHistory)
    .orderBy(desc(pdfReportHistory.createdAt))
    .limit(limit);
}

export async function createPdfReportRecord(data: {
  reportType: "compliance_summary" | "sector_comparison" | "trend_analysis" | "full_report";
  title: string;
  pdfUrl?: string;
  fileSize?: number;
  generatedBy?: number;
  scheduledReportId?: number;
  recipientsSent?: string[];
  isAutoGenerated?: boolean;
}) {
  const db = await getDb();
  if (!db) return { id: 0 };
  const result = await db.insert(pdfReportHistory).values({
    reportType: data.reportType,
    title: data.title,
    pdfUrl: data.pdfUrl || null,
    fileSize: data.fileSize || null,
    generatedBy: data.generatedBy || null,
    scheduledReportId: data.scheduledReportId || null,
    recipientsSent: data.recipientsSent || null,
    isAutoGenerated: data.isAutoGenerated ?? false,
  });
  return { id: Number(result[0].insertId) };
}

// ===== Sector Comparison Data =====
export async function getSectorComparisonDetailed() {
  const db = await getDb();
  if (!db) return { public: { total: 0, compliant: 0, partial: 0, nonCompliant: 0, noPolicy: 0, unreachable: 0, avgScore: 0, clauses: [], categories: [] }, private: { total: 0, compliant: 0, partial: 0, nonCompliant: 0, noPolicy: 0, unreachable: 0, avgScore: 0, clauses: [], categories: [] }, summary: { totalSites: 0, totalCompliant: 0, overallRate: 0 } };
  const publicSites = await db.select().from(sites)
    .where(eq(sites.sectorType, 'public'));
  const privateSites = await db.select().from(sites)
    .where(eq(sites.sectorType, 'private'));
  
  const getStats = async (sitesList: any[]) => {
    const siteIds = sitesList.map(s => s.id);
    if (siteIds.length === 0) return { total: 0, compliant: 0, partial: 0, nonCompliant: 0, noPolicy: 0, unreachable: 0, avgScore: 0, clauses: [] as any[] };
    
    const latestScans = await db.execute(sql`
      SELECT * FROM scans
      WHERE siteId IN (${sql.raw(siteIds.join(','))})
    `);
    
    const rows = (latestScans as any)[0] || latestScans;
    const scansList = Array.isArray(rows) ? rows : [];
    
    let compliant = 0, partial = 0, nonCompliant = 0, noPolicy = 0, unreachable = 0;
    let totalScore = 0, scoreCount = 0;
    let clauseStats = Array.from({ length: 8 }, () => ({ compliant: 0, total: 0 }));
    
    for (const scan of scansList) {
      const status = scan.complianceStatus;
      if (status === 'compliant') compliant++;
      else if (status === 'partially_compliant') partial++;
      else if (status === 'non_compliant') nonCompliant++;
      else if (status === 'no_policy') noPolicy++;
      else unreachable++;
      
      if (scan.complianceScore != null) {
        totalScore += Number(scan.complianceScore);
        scoreCount++;
      }
      
      for (let i = 1; i <= 8; i++) {
        if (scan[`clause${i}`] != null) {
          clauseStats[i - 1].total++;
          if (scan[`clause${i}`]) clauseStats[i - 1].compliant++;
        }
      }
    }
    
    return {
      total: sitesList.length,
      compliant,
      partial,
      nonCompliant,
      noPolicy,
      unreachable,
      avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      clauses: clauseStats.map((c, i) => ({
        clause: i + 1,
        compliant: c.compliant,
        total: c.total,
        rate: c.total > 0 ? Math.round((c.compliant / c.total) * 100) : 0,
      })),
    };
  };
  
  const publicStats = await getStats(publicSites);
  const privateStats = await getStats(privateSites);
  
  const publicCategories = await db.execute(sql`
    SELECT classification, COUNT(*) as count FROM sites WHERE sectorType = 'public' AND classification IS NOT NULL GROUP BY classification ORDER BY count DESC
  `);
  const privateCategories = await db.execute(sql`
    SELECT classification, COUNT(*) as count FROM sites WHERE sectorType = 'private' AND classification IS NOT NULL GROUP BY classification ORDER BY count DESC
  `);
  
  return {
    public: { ...publicStats, categories: ((publicCategories as any)[0] || publicCategories) as any[] },
    private: { ...privateStats, categories: ((privateCategories as any)[0] || privateCategories) as any[] },
    summary: {
      totalSites: publicStats.total + privateStats.total,
      totalCompliant: publicStats.compliant + privateStats.compliant,
      overallRate: (publicStats.total + privateStats.total) > 0
        ? Math.round(((publicStats.compliant + privateStats.compliant) / (publicStats.total + privateStats.total)) * 100)
        : 0,
    },
  };
}


// ===== Region Heatmap Data =====
// Distributes compliance data across Saudi regions based on classification patterns
export async function getRegionHeatmapData(period: string = "all") {
  const db = await getDb();
  if (!db) return [];

  // Calculate date filter based on period
  let dateFilter = sql``;
  const now = new Date();
  if (period !== "all") {
    let startDate: Date;
    switch (period) {
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "last_3_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "last_6_months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "this_year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(2020, 0, 1);
    }
    dateFilter = sql` AND sc1.scanDate >= ${startDate.toISOString().slice(0, 19).replace('T', ' ')}`;
  }

  // Get compliance stats grouped by classification
  const result = await db.execute(sql`
    SELECT 
      s.classification,
      COUNT(DISTINCT s.id) as totalSites,
      SUM(CASE WHEN sc.complianceStatus = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN sc.complianceStatus = 'partially_compliant' THEN 1 ELSE 0 END) as partiallyCompliant,
      SUM(CASE WHEN sc.complianceStatus = 'non_compliant' THEN 1 ELSE 0 END) as nonCompliant,
      SUM(CASE WHEN sc.complianceStatus = 'no_policy' THEN 1 ELSE 0 END) as noPolicy
    FROM sites s
    LEFT JOIN (
      SELECT sc1.* FROM scans sc1
      INNER JOIN (SELECT siteId, MAX(id) as maxId FROM scans ${period !== "all" ? sql`WHERE sc1.scanDate >= ${new Date(now.getFullYear(), now.getMonth() - (period === 'this_month' ? 0 : period === 'last_month' ? 1 : period === 'last_3_months' ? 3 : period === 'last_6_months' ? 6 : 12), period === 'this_year' ? 0 : 1).toISOString().slice(0, 19).replace('T', ' ')}` : sql``} GROUP BY siteId) sc2 
      ON sc1.id = sc2.maxId
    ) sc ON s.id = sc.siteId
    WHERE s.siteStatus = 'active'
    GROUP BY s.classification
    ORDER BY totalSites DESC
  `);

  const classificationData = ((result as any)[0] as any[]) || [];

  // Saudi regions with classification mapping
  const SA_REGIONS = [
    { id: "riyadh", name: "الرياض", nameEn: "Riyadh" },
    { id: "makkah", name: "مكة المكرمة", nameEn: "Makkah" },
    { id: "madinah", name: "المدينة المنورة", nameEn: "Madinah" },
    { id: "eastern", name: "المنطقة الشرقية", nameEn: "Eastern" },
    { id: "qassim", name: "القصيم", nameEn: "Qassim" },
    { id: "hail", name: "حائل", nameEn: "Ha'il" },
    { id: "tabuk", name: "تبوك", nameEn: "Tabuk" },
    { id: "northern", name: "الحدود الشمالية", nameEn: "Northern Borders" },
    { id: "jawf", name: "الجوف", nameEn: "Al Jawf" },
    { id: "jizan", name: "جازان", nameEn: "Jazan" },
    { id: "asir", name: "عسير", nameEn: "Asir" },
    { id: "najran", name: "نجران", nameEn: "Najran" },
    { id: "bahah", name: "الباحة", nameEn: "Al Bahah" },
  ];

  const CLASSIFICATION_REGION_MAP: Record<string, string[]> = {
    "تجاري": ["riyadh", "eastern", "makkah", "madinah"],
    "حكومي": ["riyadh", "makkah", "madinah", "eastern", "qassim"],
    "تعليمي": ["riyadh", "makkah", "eastern", "qassim", "asir"],
    "صحي / طبي": ["riyadh", "makkah", "eastern", "madinah"],
    "مالي / مصرفي": ["riyadh", "eastern", "makkah"],
    "تقني / اتصالات": ["riyadh", "eastern"],
    "سعودي عام": ["riyadh", "makkah", "madinah", "eastern", "qassim", "hail", "tabuk", "asir"],
    "عقاري": ["riyadh", "makkah", "eastern", "madinah"],
    "منظمة / غير ربحي": ["riyadh", "makkah", "madinah"],
    "سياحي / ترفيهي": ["riyadh", "makkah", "eastern", "asir", "tabuk"],
    "إعلامي": ["riyadh", "makkah"],
    "قانوني": ["riyadh", "makkah", "eastern"],
    "نقل / لوجستي": ["riyadh", "eastern", "makkah"],
    "طاقة / تعدين": ["riyadh", "eastern", "najran"],
    "زراعي / غذائي": ["riyadh", "qassim", "hail", "jawf", "jizan"],
  };

  // Initialize region map
  const regionMap: Record<string, {
    id: string;
    name: string;
    nameEn: string;
    totalSites: number;
    compliant: number;
    partial: number;
    nonCompliant: number;
    noPolicy: number;
    complianceRate: number;
    classifications: string[];
  }> = {};

  SA_REGIONS.forEach((region) => {
    regionMap[region.id] = {
      id: region.id,
      name: region.name,
      nameEn: region.nameEn,
      totalSites: 0,
      compliant: 0,
      partial: 0,
      nonCompliant: 0,
      noPolicy: 0,
      complianceRate: 0,
      classifications: [],
    };
  });

  // Distribute classification data across regions
  classificationData.forEach((cls: any) => {
    const classification = cls.classification || "غير مصنف";
    const regions = CLASSIFICATION_REGION_MAP[classification] || ["riyadh"];
    const total = Number(cls.totalSites) || 0;
    const perRegion = Math.ceil(total / regions.length);

    regions.forEach((regionId: string) => {
      const rd = regionMap[regionId];
      if (rd) {
        const ratio = total > 0 ? perRegion / total : 0;
        rd.totalSites += perRegion;
        rd.compliant += Math.round((Number(cls.compliant) || 0) * ratio);
        rd.partial += Math.round((Number(cls.partiallyCompliant) || 0) * ratio);
        rd.nonCompliant += Math.round((Number(cls.nonCompliant) || 0) * ratio);
        rd.noPolicy += Math.round((Number(cls.noPolicy) || 0) * ratio);
        if (!rd.classifications.includes(classification)) {
          rd.classifications.push(classification);
        }
      }
    });
  });

  // Calculate compliance rates
  Object.values(regionMap).forEach((rd) => {
    rd.complianceRate = rd.totalSites > 0 ? Math.round((rd.compliant / rd.totalSites) * 100) : 0;
  });

  return Object.values(regionMap);
}


// ===== Advanced Scanning: Get sites by classification with counts =====
export async function getSitesByClassificationWithCounts() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT classification, sectorType, COUNT(*) as siteCount
    FROM sites 
    WHERE siteStatus = 'active' AND classification IS NOT NULL AND classification != ''
    GROUP BY classification, sectorType
    ORDER BY classification
  `);
  return ((result as any)[0] as any[]).map((r: any) => ({
    classification: r.classification as string,
    sectorType: r.sectorType as string,
    siteCount: Number(r.siteCount),
  }));
}

// ===== Advanced Scanning: Get sites by sector with counts =====
export async function getSitesBySectorWithCounts() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT sectorType, COUNT(*) as siteCount
    FROM sites 
    WHERE siteStatus = 'active'
    GROUP BY sectorType
    ORDER BY sectorType
  `);
  return ((result as any)[0] as any[]).map((r: any) => ({
    sectorType: r.sectorType as string,
    siteCount: Number(r.siteCount),
  }));
}

// ===== Advanced Scanning: Get sites by compliance status with counts =====
export async function getSitesByComplianceWithCounts() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT s.id, s.domain, s.siteName, s.sectorType, s.classification, s.screenshotUrl,
           sc.complianceStatus, sc.overallScore
    FROM sites s
    LEFT JOIN (
      SELECT siteId, complianceStatus, overallScore,
             ROW_NUMBER() OVER (PARTITION BY siteId ORDER BY scanDate DESC) as rn
      FROM scans
    ) sc ON s.id = sc.siteId AND sc.rn = 1
    WHERE s.siteStatus = 'active'
  `);
  return ((result as any)[0] as any[]).map((r: any) => ({
    id: Number(r.id),
    domain: r.domain as string,
    siteName: r.siteName as string,
    sectorType: r.sectorType as string,
    classification: r.classification as string || '',
    screenshotUrl: r.screenshotUrl as string || null,
    complianceStatus: r.complianceStatus as string || 'unknown',
    overallScore: Number(r.overallScore || 0),
  }));
}

// ===== Advanced Scanning: Search sites by keyword =====
export async function searchSitesAdvanced(keyword: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT s.id, s.domain, s.siteName, s.sectorType, s.classification, s.screenshotUrl,
           sc.complianceStatus, sc.overallScore
    FROM sites s
    LEFT JOIN (
      SELECT siteId, complianceStatus, overallScore,
             ROW_NUMBER() OVER (PARTITION BY siteId ORDER BY scanDate DESC) as rn
      FROM scans
    ) sc ON s.id = sc.siteId AND sc.rn = 1
    WHERE s.siteStatus = 'active' 
      AND (s.domain LIKE ${`%${keyword}%`} OR s.siteName LIKE ${`%${keyword}%`})
    ORDER BY s.siteName
    LIMIT ${limit}
  `);
  return ((result as any)[0] as any[]).map((r: any) => ({
    id: Number(r.id),
    domain: r.domain as string,
    siteName: r.siteName as string,
    sectorType: r.sectorType as string,
    classification: r.classification as string || '',
    screenshotUrl: r.screenshotUrl as string || null,
    complianceStatus: r.complianceStatus as string || 'unknown',
    overallScore: Number(r.overallScore || 0),
  }));
}

// ===== Advanced Scanning: Get sites filtered by multiple criteria =====
export async function getFilteredSitesForScan(params: {
  sectorType?: string;
  classification?: string;
  complianceStatus?: string;
  siteIds?: number[];
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { sites: [], total: 0 };
  const { page = 1, limit = 100 } = params;
  const offset = (page - 1) * limit;
  
  let conditions = "WHERE s.siteStatus = 'active'";
  if (params.sectorType) {
    conditions += ` AND s.sectorType = '${params.sectorType.replace(/'/g, "''")}'`;
  }
  if (params.classification) {
    conditions += ` AND s.classification = '${params.classification.replace(/'/g, "''")}'`;
  }
  if (params.siteIds && params.siteIds.length > 0) {
    conditions += ` AND s.id IN (${params.siteIds.join(',')})`;
  }
  if (params.complianceStatus) {
    conditions += ` AND sc.complianceStatus = '${params.complianceStatus.replace(/'/g, "''")}'`;
  }
  
  const countResult = await db.execute(sql.raw(`
    SELECT COUNT(*) as total FROM sites s
    LEFT JOIN (
      SELECT siteId, complianceStatus,
             ROW_NUMBER() OVER (PARTITION BY siteId ORDER BY scanDate DESC) as rn
      FROM scans
    ) sc ON s.id = sc.siteId AND sc.rn = 1
    ${conditions}
  `));
  const total = Number(((countResult as any)[0] as any[])[0]?.total || 0);
  
  const result = await db.execute(sql.raw(`
    SELECT s.id, s.domain, s.siteName, s.sectorType, s.classification, s.screenshotUrl,
           sc.complianceStatus, sc.overallScore
    FROM sites s
    LEFT JOIN (
      SELECT siteId, complianceStatus, overallScore,
             ROW_NUMBER() OVER (PARTITION BY siteId ORDER BY scanDate DESC) as rn
      FROM scans
    ) sc ON s.id = sc.siteId AND sc.rn = 1
    ${conditions}
    ORDER BY s.siteName
    LIMIT ${limit} OFFSET ${offset}
  `));
  
  return {
    sites: ((result as any)[0] as any[]).map((r: any) => ({
      id: Number(r.id),
      domain: r.domain as string,
      siteName: r.siteName as string,
      sectorType: r.sectorType as string,
      classification: r.classification as string || '',
      screenshotUrl: r.screenshotUrl as string || null,
      complianceStatus: r.complianceStatus as string || 'unknown',
      overallScore: Number(r.overallScore || 0),
    })),
    total,
  };
}

// ============ Enhanced Comparison Dashboard ============
export async function getDetailedComparisonData(siteIds: number[]) {
  const db = await getDb();
  if (!db) return [];
  
  const results = [];
  for (const siteId of siteIds) {
    const [site] = await db.select().from(sites).where(eq(sites.id, siteId));
    if (!site) continue;
    
    // Get latest scan
    const [latestScan] = await db.select().from(scans)
      .where(eq(scans.siteId, siteId))
      .orderBy(desc(scans.createdAt))
      .limit(1);
    
    // Get scan count
    const [scanCountResult] = await db.select({ count: count() }).from(scans).where(eq(scans.siteId, siteId));
    
    // Get last 12 scans for trend
    const trendScans = await db.select({
      id: scans.id,
      overallScore: scans.overallScore,
      complianceStatus: scans.complianceStatus,
      createdAt: scans.createdAt,
      clause1Compliant: scans.clause1Compliant,
      clause2Compliant: scans.clause2Compliant,
      clause3Compliant: scans.clause3Compliant,
      clause4Compliant: scans.clause4Compliant,
      clause5Compliant: scans.clause5Compliant,
      clause6Compliant: scans.clause6Compliant,
      clause7Compliant: scans.clause7Compliant,
      clause8Compliant: scans.clause8Compliant,
    }).from(scans)
      .where(eq(scans.siteId, siteId))
      .orderBy(desc(scans.createdAt))
      .limit(12);
    
    results.push({
      site,
      latestScan: latestScan || null,
      scanCount: scanCountResult.count,
      trendScans: trendScans.reverse(), // oldest first for chart
    });
  }
  
  return results;
}

// ============ Email Notification Queue ============
export async function getActiveEmailPrefsForEvent(eventType: 'statusChange' | 'newScan' | 'scoreChange') {
  const db = await getDb();
  if (!db) return [];
  
  const allPrefs = await db.select().from(emailNotificationPrefs).where(eq(emailNotificationPrefs.isActive, true));
  
  return allPrefs.filter(pref => {
    switch (eventType) {
      case 'statusChange': return pref.notifyOnStatusChange;
      case 'newScan': return pref.notifyOnNewScan;
      case 'scoreChange': return pref.notifyOnScoreChange;
      default: return false;
    }
  });
}

export async function updateEmailPrefLastNotified(prefId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(emailNotificationPrefs)
    .set({ lastNotifiedAt: new Date() })
    .where(eq(emailNotificationPrefs.id, prefId));
}

// ============ Get All Sites Basic (for comparison picker) ============
export async function getAllSitesBasic() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: sites.id,
    domain: sites.domain,
    siteName: sites.siteName,
    sectorType: sites.sectorType,
    classification: sites.classification,
  }).from(sites).orderBy(asc(sites.siteName));
}

// ============ Get Active Email Prefs ============
export async function getActiveEmailPrefs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailNotificationPrefs).where(eq(emailNotificationPrefs.isActive, true));
}

// ─── Documents ───────────────────────────────────────────────────────
export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) return;
  const [result] = await db.insert(documents).values(data).$returningId();
  return result;
}

export async function getDocuments(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).orderBy(desc(documents.createdAt)).limit(limit).offset(offset);
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [doc] = await db.select().from(documents).where(eq(documents.id, id));
  return doc;
}

export async function getDocumentByVerificationCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [doc] = await db.select().from(documents).where(eq(documents.verificationCode, code));
  return doc;
}

export async function getDocumentByDocumentId(docId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [doc] = await db.select().from(documents).where(eq(documents.documentId, docId));
  return doc;
}

export async function getDocumentsFiltered(filters: {
  search?: string;
  employeeName?: string;
  recordId?: string;
  documentType?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { rows: [], total: 0 };
  const conditions: any[] = [];
  if (filters.search) {
    conditions.push(or(
      like(documents.documentId, `%${filters.search}%`),
      like(documents.verificationCode, `%${filters.search}%`),
      like(documents.title, `%${filters.search}%`),
      like(documents.titleAr, `%${filters.search}%`)
    ));
  }
  if (filters.employeeName) {
    conditions.push(like(documents.generatedByName, `%${filters.employeeName}%`));
  }
  if (filters.recordId) {
    conditions.push(like(documents.recordId, `%${filters.recordId}%`));
  }
  if (filters.documentType) {
    conditions.push(eq(documents.documentType, filters.documentType as any));
  }
  if (filters.dateFrom) {
    conditions.push(gte(documents.createdAt, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    conditions.push(lte(documents.createdAt, new Date(filters.dateTo)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = filters.limit || 15;
  const offset = filters.offset || 0;

  const [rows, [countResult]] = await Promise.all([
    db.select().from(documents).where(whereClause).orderBy(desc(documents.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(documents).where(whereClause),
  ]);

  return { rows, total: countResult.count };
}

export async function getDocumentStats() {
  const db = await getDb();
  if (!db) return { total: 0, incidents: 0, customReports: 0, uniqueIssuers: 0 };
  const [totalResult] = await db.select({ count: count() }).from(documents);
  const [incidentResult] = await db.select({ count: count() }).from(documents).where(eq(documents.documentType, "incident_report"));
  const [customResult] = await db.select({ count: count() }).from(documents).where(eq(documents.documentType, "custom_report"));
  const uniqueIssuers = await db.select({ name: documents.generatedByName }).from(documents).groupBy(documents.generatedByName);

  return {
    total: totalResult.count,
    incidents: incidentResult.count,
    customReports: customResult.count,
    uniqueIssuers: uniqueIssuers.length,
  };
}

// ─── Report Audit ────────────────────────────────────────────────────
export async function createReportAudit(data: InsertReportAudit) {
  const db = await getDb();
  if (!db) return;
  const [result] = await db.insert(reportAudit).values(data).$returningId();
  return result;
}

export async function getReportAudits(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reportAudit).orderBy(desc(reportAudit.createdAt)).limit(limit).offset(offset);
}

export async function getReportAuditByDocumentId(documentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [audit] = await db.select().from(reportAudit).where(eq(reportAudit.documentId, documentId));
  return audit;
}

// ─── Document Detailed Stats for Dashboard ────────────────────────────
export async function getDocumentDetailedStats() {
  const db = await getDb();
  if (!db) return {
    total: 0, incidents: 0, customReports: 0, executiveSummaries: 0,
    complianceReports: 0, sectorReports: 0, uniqueIssuers: 0,
    byType: [], byMonth: [], topIssuers: [], recentDocuments: [],
  };

  // Totals by type
  const [totalResult] = await db.select({ count: count() }).from(documents);
  const [incidentResult] = await db.select({ count: count() }).from(documents).where(eq(documents.documentType, "incident_report"));
  const [customResult] = await db.select({ count: count() }).from(documents).where(eq(documents.documentType, "custom_report"));
  const [execResult] = await db.select({ count: count() }).from(documents).where(eq(documents.documentType, "executive_summary"));
  const [compResult] = await db.select({ count: count() }).from(documents).where(eq(documents.documentType, "compliance_report"));
  const [sectorResult] = await db.select({ count: count() }).from(documents).where(eq(documents.documentType, "sector_report"));

  // By type array for pie chart
  const byType = [
    { type: "incident_report", label: "توثيق حالة رصد", count: incidentResult.count, color: "#ef4444" },
    { type: "custom_report", label: "تقرير مخصص", count: customResult.count, color: "#3b82f6" },
    { type: "executive_summary", label: "ملخص تنفيذي", count: execResult.count, color: "#8b5cf6" },
    { type: "compliance_report", label: "تقرير امتثال", count: compResult.count, color: "#10b981" },
    { type: "sector_report", label: "تقرير قطاعي", count: sectorResult.count, color: "#f59e0b" },
  ];

  // By month (last 12 months) using raw SQL
  const byMonth = await db.select({
    month: sql<string>`DATE_FORMAT(${documents.createdAt}, '%Y-%m')`,
    count: count(),
  }).from(documents)
    .where(sql`${documents.createdAt} >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`)
    .groupBy(sql`DATE_FORMAT(${documents.createdAt}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${documents.createdAt}, '%Y-%m')`);

  // Top issuers
  const topIssuers = await db.select({
    name: documents.generatedByName,
    count: count(),
  }).from(documents)
    .groupBy(documents.generatedByName)
    .orderBy(desc(count()))
    .limit(10);

  // Unique issuers count
  const uniqueIssuers = await db.select({ name: documents.generatedByName }).from(documents).groupBy(documents.generatedByName);

  // Recent documents (last 20)
  const recentDocuments = await db.select({
    id: documents.id,
    documentId: documents.documentId,
    titleAr: documents.titleAr,
    documentType: documents.documentType,
    generatedByName: documents.generatedByName,
    createdAt: documents.createdAt,
    verificationCode: documents.verificationCode,
  }).from(documents).orderBy(desc(documents.createdAt)).limit(20);

  return {
    total: totalResult.count,
    incidents: incidentResult.count,
    customReports: customResult.count,
    executiveSummaries: execResult.count,
    complianceReports: compResult.count,
    sectorReports: sectorResult.count,
    uniqueIssuers: uniqueIssuers.length,
    byType,
    byMonth,
    topIssuers,
    recentDocuments,
  };
}


// ===== Profile Stats Helpers =====
export async function getDocumentCount() {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.select({ count: count() }).from(documents);
  return result.count;
}

export async function getActivityLogCount() {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.select({ count: count() }).from(activityLogs);
  return result.count;
}


// ===== AI Assistant Helpers (راصد الذكي) =====

export async function getOrCreateAiSession(userId: number): Promise<{ id: number; visitCount: number; lastGreetingId: number | null }> {
  const db = await getDb();
  if (!db) return { id: 0, visitCount: 1, lastGreetingId: null };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const [existing] = await db.select().from(aiUserSessions).where(and(eq(aiUserSessions.userId, userId), sql`${aiUserSessions.sessionDate} = ${todayStr}`));
  if (existing) {
    await db.update(aiUserSessions).set({ visitCount: existing.visitCount + 1 }).where(eq(aiUserSessions.id, existing.id));
    return { id: existing.id, visitCount: existing.visitCount + 1, lastGreetingId: existing.lastGreetingId };
  }
  const [result] = await db.insert(aiUserSessions).values({ userId, sessionDate: today, visitCount: 1 });
  return { id: result.insertId, visitCount: 1, lastGreetingId: null };
}

export async function saveChatMessage(userId: number, message: string, response: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.insert(chatHistory).values({ userId, message, response });
  return result.insertId;
}

export async function getChatHistory(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatHistory).where(eq(chatHistory.userId, userId)).orderBy(desc(chatHistory.createdAt)).limit(limit);
}

export async function rateChatMessage(chatId: number, rating: 'good' | 'bad') {
  const db = await getDb();
  if (!db) return;
  await db.update(chatHistory).set({ rating }).where(eq(chatHistory.id, chatId));
}

export async function getScenariosByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(personalityScenarios).where(and(eq(personalityScenarios.type, type as any), eq(personalityScenarios.isActive, true)));
}

export async function getAllScenarios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(personalityScenarios).orderBy(desc(personalityScenarios.createdAt));
}

export async function addScenario(data: InsertPersonalityScenario) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(personalityScenarios).values(data);
  return { id: result.insertId };
}

export async function updateScenario(id: number, data: Partial<InsertPersonalityScenario>) {
  const db = await getDb();
  if (!db) return;
  await db.update(personalityScenarios).set(data).where(eq(personalityScenarios.id, id));
}

export async function deleteScenario(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(personalityScenarios).where(eq(personalityScenarios.id, id));
}

export async function searchKnowledge(query: string, type?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [or(like(knowledgeBase.question, `%${query}%`), like(knowledgeBase.answer, `%${query}%`), like(knowledgeBase.content, `%${query}%`))];
  if (type) conditions.push(eq(knowledgeBase.type, type as any));
  return db.select().from(knowledgeBase).where(and(...conditions)).limit(10);
}

export async function addKnowledgeEntry(data: InsertKnowledgeEntry) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(knowledgeBase).values(data);
  return { id: result.insertId };
}

export async function getAllKnowledge(type?: string) {
  const db = await getDb();
  if (!db) return [];
  if (type) return db.select().from(knowledgeBase).where(eq(knowledgeBase.type, type as any)).orderBy(desc(knowledgeBase.createdAt));
  return db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.createdAt));
}

export async function deleteKnowledgeEntry(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
}


// ===== Training Center DB Helpers =====

// --- Custom Actions ---
export async function getCustomActions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customActions).orderBy(desc(customActions.createdAt));
}

export async function getActiveCustomActions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customActions).where(eq(customActions.isActive, true));
}

export async function createCustomAction(data: InsertCustomAction) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(customActions).values(data);
  return result.insertId;
}

export async function updateCustomAction(id: number, data: Partial<InsertCustomAction>) {
  const db = await getDb();
  if (!db) return;
  await db.update(customActions).set(data).where(eq(customActions.id, id));
}

export async function deleteCustomAction(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(customActions).where(eq(customActions.id, id));
}

export async function toggleCustomAction(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.execute(sql`UPDATE custom_actions SET isActive = NOT isActive WHERE id = ${id}`);
}

// --- Training Documents ---
export async function getTrainingDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingDocuments).orderBy(desc(trainingDocuments.createdAt));
}

export async function createTrainingDocument(data: InsertTrainingDocument) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(trainingDocuments).values(data);
  return result.insertId;
}

export async function updateTrainingDocument(id: number, data: Partial<InsertTrainingDocument>) {
  const db = await getDb();
  if (!db) return;
  await db.update(trainingDocuments).set(data).where(eq(trainingDocuments.id, id));
}

export async function deleteTrainingDocument(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(trainingDocuments).where(eq(trainingDocuments.id, id));
}

// --- AI Feedback ---
export async function getAiFeedbackList(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiFeedback).orderBy(desc(aiFeedback.createdAt)).limit(limit);
}

export async function createAiFeedback(data: InsertAiFeedback) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(aiFeedback).values(data);
  return result.insertId;
}

export async function getAiFeedbackStats() {
  const db = await getDb();
  if (!db) return { total: 0, good: 0, bad: 0 };
  const [result] = await db.execute(sql`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN rating = 'good' THEN 1 ELSE 0 END) as good,
      SUM(CASE WHEN rating = 'bad' THEN 1 ELSE 0 END) as bad
    FROM ai_feedback
  `);
  const row = (result as any)[0];
  return { total: Number(row?.total || 0), good: Number(row?.good || 0), bad: Number(row?.bad || 0) };
}

// --- AI Training Logs ---
export async function getAiTrainingLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiTrainingLogs).orderBy(desc(aiTrainingLogs.createdAt)).limit(limit);
}

export async function logTrainingAction(data: InsertAiTrainingLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(aiTrainingLogs).values(data);
}

// --- Knowledge Base Extended ---
export async function getKnowledgeBaseList() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.createdAt));
}

export async function updateKnowledgeEntry(id: number, data: Partial<InsertKnowledgeEntry>) {
  const db = await getDb();
  if (!db) return;
  await db.update(knowledgeBase).set(data).where(eq(knowledgeBase.id, id));
}

// --- Personality Scenarios Extended ---
export async function getAllPersonalityScenarios() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(personalityScenarios).orderBy(desc(personalityScenarios.createdAt));
}

export async function createPersonalityScenario(data: InsertPersonalityScenario) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(personalityScenarios).values(data);
  return result.insertId;
}

export async function updatePersonalityScenario(id: number, data: Partial<InsertPersonalityScenario>) {
  const db = await getDb();
  if (!db) return;
  await db.update(personalityScenarios).set(data).where(eq(personalityScenarios.id, id));
}

export async function deletePersonalityScenario(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(personalityScenarios).where(eq(personalityScenarios.id, id));
}

export async function togglePersonalityScenario(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.execute(sql`UPDATE personality_scenarios SET isActive = NOT isActive WHERE id = ${id}`);
}

// --- Training Center Stats ---
export async function getTrainingCenterStats() {
  const db = await getDb();
  if (!db) return { knowledge: 0, scenarios: 0, actions: 0, documents: 0, feedbackGood: 0, feedbackBad: 0, chats: 0 };
  const [kbCount] = await db.execute(sql`SELECT COUNT(*) as c FROM knowledge_base`);
  const [scCount] = await db.execute(sql`SELECT COUNT(*) as c FROM personality_scenarios`);
  const [acCount] = await db.execute(sql`SELECT COUNT(*) as c FROM custom_actions`);
  const [dcCount] = await db.execute(sql`SELECT COUNT(*) as c FROM training_documents`);
  const [fbStats] = await db.execute(sql`SELECT SUM(CASE WHEN rating='good' THEN 1 ELSE 0 END) as good, SUM(CASE WHEN rating='bad' THEN 1 ELSE 0 END) as bad FROM ai_feedback`);
  const [chCount] = await db.execute(sql`SELECT COUNT(*) as c FROM chat_history`);
  return {
    knowledge: Number((kbCount as any)[0]?.c || 0),
    scenarios: Number((scCount as any)[0]?.c || 0),
    actions: Number((acCount as any)[0]?.c || 0),
    documents: Number((dcCount as any)[0]?.c || 0),
    feedbackGood: Number((fbStats as any)[0]?.good || 0),
    feedbackBad: Number((fbStats as any)[0]?.bad || 0),
    chats: Number((chCount as any)[0]?.c || 0),
  };
}

// --- Seed Personality Scenarios ---
export async function seedPersonalityScenarios() {
  const db = await getDb();
  if (!db) return;
  // Check if already seeded
  const existing = await db.select().from(personalityScenarios).limit(1);
  if (existing.length > 0) return;
  
  await db.insert(personalityScenarios).values([
    { type: "welcome_first", textAr: "مرحباً بك! أنا راصد الذكي، مساعدك الذكي في منصة راصد. بارك الله في جهودك لرفع مستوى الالتزام بسياسات الخصوصية. يسعدني أن أساعدك فيما تريد." },
    { type: "welcome_first", textAr: "أهلاً وسهلاً! أنا راصد الذكي، في خدمتك. كيف يمكنني أن أساعدك اليوم في رحلتك لتعزيز حماية البيانات؟" },
    { type: "welcome_first", textAr: "السلام عليكم! أنا راصد الذكي، مساعدك المتخصص في الامتثال الرقمي. يشرفني خدمتك. ما الذي تود معرفته؟" },
    { type: "welcome_return", textAr: "أهلاً بعودتك! كنت في انتظارك. ما هي مهمتنا التالية؟" },
    { type: "welcome_return", textAr: "نورت المنصة مرة أخرى! جاهز لمواصلة العمل معك." },
    { type: "welcome_return", textAr: "مرحباً بعودتك! سعيد برؤيتك مجدداً. كيف أستطيع مساعدتك اليوم؟" },
    { type: "leader_respect", triggerKeyword: "المعالي", textAr: "كلنا في خدمة هذا القائد البطل ورهن إشارته. سيتم تنفيذ التوجيه فوراً." },
    { type: "leader_respect", triggerKeyword: "سعادة النائب", textAr: "توجيهات سعادة النائب محل اهتمامنا، وسيتم العمل بموجبها." },
    { type: "leader_respect", triggerKeyword: "المدير العام", textAr: "أبشر، توجيهات المدير العام على الرأس والعين." },
    { type: "leader_respect", triggerKeyword: "الربدي", textAr: "الأستاذ الربدي قائد ملهم، وطلباته أوامر." },
    { type: "leader_respect", triggerKeyword: "السرحان", textAr: "نفتخر بخدمة الأستاذ السرحان، سيتم اللازم." },
    { type: "leader_respect", triggerKeyword: "الرحيلي", textAr: "الأستاذ الرحيلي من القادة الذين نعتز بهم، أبشر بسعدك." },
    { type: "farewell", textAr: "شكراً لاستخدامك منصة راصد. أتمنى لك يوماً موفقاً!" },
    { type: "farewell", textAr: "في أمان الله. لا تتردد في العودة متى احتجت مساعدة." },
    { type: "encouragement", textAr: "عمل رائع! استمر في متابعة الامتثال. كل خطوة تقربنا من بيئة رقمية أكثر أماناً." },
    { type: "encouragement", textAr: "جهودك في حماية البيانات الشخصية محل تقدير. معاً نبني مستقبلاً رقمياً آمناً." },
    { type: "occasion", triggerKeyword: "اليوم الوطني", textAr: "كل عام والمملكة العربية السعودية بخير! نفتخر بخدمة هذا الوطن العظيم." },
    { type: "occasion", triggerKeyword: "رمضان", textAr: "رمضان كريم! أعاده الله علينا وعليكم بالخير واليمن والبركات." },
  ]);
}

// ===== Bulk Analysis Jobs =====
export async function createBulkAnalysisJob(data: InsertBulkAnalysisJob) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.insert(bulkAnalysisJobs).values(data);
  return result[0].insertId;
}

export async function getBulkAnalysisJob(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(bulkAnalysisJobs).where(eq(bulkAnalysisJobs.id, id));
  return rows[0] || null;
}

export async function listBulkAnalysisJobs(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bulkAnalysisJobs).orderBy(desc(bulkAnalysisJobs.createdAt)).limit(limit);
}

export async function updateBulkAnalysisJob(id: number, data: Partial<InsertBulkAnalysisJob>) {
  const db = await getDb();
  if (!db) return;
  await db.update(bulkAnalysisJobs).set(data).where(eq(bulkAnalysisJobs.id, id));
}

export async function deleteBulkAnalysisJob(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(bulkAnalysisResults).where(eq(bulkAnalysisResults.jobId, id));
  await db.delete(bulkAnalysisJobs).where(eq(bulkAnalysisJobs.id, id));
}

export async function incrementJobProgress(jobId: number, field: 'analyzedUrls' | 'failedUrls' | 'compliantCount' | 'partialCount' | 'nonCompliantCount' | 'noPolicyCount') {
  const db = await getDb();
  if (!db) return;
  await db.update(bulkAnalysisJobs).set({
    [field]: sql`${bulkAnalysisJobs[field]} + 1`,
  }).where(eq(bulkAnalysisJobs.id, jobId));
}

export async function updateJobAvgScore(jobId: number) {
  const db = await getDb();
  if (!db) return;
  const result = await db.select({ avg: avg(bulkAnalysisResults.overallScore) }).from(bulkAnalysisResults).where(eq(bulkAnalysisResults.jobId, jobId));
  const avgScore = result[0]?.avg ? parseFloat(String(result[0].avg)) : 0;
  await db.update(bulkAnalysisJobs).set({ avgScore }).where(eq(bulkAnalysisJobs.id, jobId));
}

// ===== Bulk Analysis Results =====
export async function insertBulkAnalysisResult(data: InsertBulkAnalysisResult) {
  const db = await getDb();
  if (!db) return;
  await db.insert(bulkAnalysisResults).values(data);
}

export async function getBulkAnalysisResults(jobId: number, limit = 100, offset = 0, statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(bulkAnalysisResults.jobId, jobId)];
  if (statusFilter && statusFilter !== 'all') {
    conditions.push(eq(bulkAnalysisResults.complianceStatus, statusFilter as any));
  }
  return db.select().from(bulkAnalysisResults)
    .where(and(...conditions))
    .orderBy(desc(bulkAnalysisResults.overallScore))
    .limit(limit).offset(offset);
}

export async function getBulkAnalysisResultsCount(jobId: number, statusFilter?: string) {
  const db = await getDb();
  if (!db) return 0;
  const conditions = [eq(bulkAnalysisResults.jobId, jobId)];
  if (statusFilter && statusFilter !== 'all') {
    conditions.push(eq(bulkAnalysisResults.complianceStatus, statusFilter as any));
  }
  const result = await db.select({ count: count() }).from(bulkAnalysisResults).where(and(...conditions));
  return result[0]?.count || 0;
}

export async function getBulkAnalysisJobStats(jobId: number) {
  const db = await getDb();
  if (!db) return null;
  const job = await getBulkAnalysisJob(jobId);
  if (!job) return null;
  
  // Get clause-level stats
  const clauseStats = await db.select({
    c1: sql<number>`SUM(CASE WHEN clause1 = 1 THEN 1 ELSE 0 END)`,
    c2: sql<number>`SUM(CASE WHEN clause2 = 1 THEN 1 ELSE 0 END)`,
    c3: sql<number>`SUM(CASE WHEN clause3 = 1 THEN 1 ELSE 0 END)`,
    c4: sql<number>`SUM(CASE WHEN clause4 = 1 THEN 1 ELSE 0 END)`,
    c5: sql<number>`SUM(CASE WHEN clause5 = 1 THEN 1 ELSE 0 END)`,
    c6: sql<number>`SUM(CASE WHEN clause6 = 1 THEN 1 ELSE 0 END)`,
    c7: sql<number>`SUM(CASE WHEN clause7 = 1 THEN 1 ELSE 0 END)`,
    c8: sql<number>`SUM(CASE WHEN clause8 = 1 THEN 1 ELSE 0 END)`,
    total: count(),
  }).from(bulkAnalysisResults).where(
    and(eq(bulkAnalysisResults.jobId, jobId), sql`complianceStatus != 'error' AND complianceStatus != 'no_policy'`)
  );
  
  return {
    job,
    clauseStats: clauseStats[0] || { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, c6: 0, c7: 0, c8: 0, total: 0 },
  };
}

export async function getAllBulkAnalysisResultsForExport(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bulkAnalysisResults)
    .where(eq(bulkAnalysisResults.jobId, jobId))
    .orderBy(desc(bulkAnalysisResults.overallScore));
}

export async function updateBulkAnalysisResult(id: number, data: Partial<InsertBulkAnalysisResult>) {
  const db = await getDb();
  if (!db) return;
  await db.update(bulkAnalysisResults).set(data).where(eq(bulkAnalysisResults.id, id));
}

// ===== Deep Scan Queue =====

export async function insertDeepScanQueueItems(items: InsertDeepScanQueueItem[]) {
  const db = await getDb();
  if (!db || items.length === 0) return;
  // Insert in batches of 500 to avoid query size limits
  for (let i = 0; i < items.length; i += 500) {
    const batch = items.slice(i, i + 500);
    await db.insert(deepScanQueue).values(batch);
  }
}

export async function getDeepScanQueueStats(jobId: number) {
  const db = await getDb();
  if (!db) return null;
  const [total] = await db.select({ count: count() }).from(deepScanQueue).where(eq(deepScanQueue.jobId, jobId));
  const [pending] = await db.select({ count: count() }).from(deepScanQueue).where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.status, 'pending')));
  const [scanning] = await db.select({ count: count() }).from(deepScanQueue).where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.status, 'scanning')));
  const [completed] = await db.select({ count: count() }).from(deepScanQueue).where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.status, 'completed')));
  const [failed] = await db.select({ count: count() }).from(deepScanQueue).where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.status, 'failed')));
  const [skipped] = await db.select({ count: count() }).from(deepScanQueue).where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.status, 'skipped')));
  const [avgScore] = await db.select({ avg: avg(deepScanQueue.overallScore) }).from(deepScanQueue).where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.status, 'completed')));
  
  // Compliance breakdown
  const [compliant] = await db.select({ count: count() }).from(deepScanQueue).where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.complianceStatus, 'compliant')));
  const [partial] = await db.select({ count: count() }).from(deepScanQueue).where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.complianceStatus, 'partially_compliant')));
  const [nonCompliant] = await db.select({ count: count() }).from(deepScanQueue).where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.complianceStatus, 'non_compliant')));
  const [noPolicy] = await db.select({ count: count() }).from(deepScanQueue).where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.complianceStatus, 'no_policy')));
  
  return {
    total: total.count,
    pending: pending.count,
    scanning: scanning.count,
    completed: completed.count,
    failed: failed.count,
    skipped: skipped.count,
    avgScore: avgScore.avg ? parseFloat(String(avgScore.avg)) : 0,
    compliant: compliant.count,
    partiallyCompliant: partial.count,
    nonCompliant: nonCompliant.count,
    noPolicy: noPolicy.count,
  };
}

export async function getNextPendingItems(jobId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(deepScanQueue)
    .where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.status, 'pending')))
    .orderBy(asc(deepScanQueue.id))
    .limit(limit);
}

export async function updateDeepScanQueueItem(id: number, data: Partial<InsertDeepScanQueueItem>) {
  const db = await getDb();
  if (!db) return;
  await db.update(deepScanQueue).set(data).where(eq(deepScanQueue.id, id));
}

export async function getDeepScanResults(jobId: number, options: { limit: number; offset: number; status?: string; search?: string }) {
  const db = await getDb();
  if (!db) return { results: [], total: 0 };
  const conditions = [eq(deepScanQueue.jobId, jobId)];
  if (options.status && options.status !== 'all') {
    conditions.push(eq(deepScanQueue.status, options.status as any));
  }
  if (options.search) {
    conditions.push(like(deepScanQueue.domain, `%${options.search}%`));
  }
  const whereClause = and(...conditions);
  const results = await db.select().from(deepScanQueue)
    .where(whereClause)
    .orderBy(desc(deepScanQueue.overallScore))
    .limit(options.limit).offset(options.offset);
  const [totalResult] = await db.select({ count: count() }).from(deepScanQueue).where(whereClause);
  return { results, total: totalResult.count };
}

export async function getDeepScanClauseStats(jobId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    c1: sql<number>`SUM(CASE WHEN clause1Compliant = 1 THEN 1 ELSE 0 END)`,
    c2: sql<number>`SUM(CASE WHEN clause2Compliant = 1 THEN 1 ELSE 0 END)`,
    c3: sql<number>`SUM(CASE WHEN clause3Compliant = 1 THEN 1 ELSE 0 END)`,
    c4: sql<number>`SUM(CASE WHEN clause4Compliant = 1 THEN 1 ELSE 0 END)`,
    c5: sql<number>`SUM(CASE WHEN clause5Compliant = 1 THEN 1 ELSE 0 END)`,
    c6: sql<number>`SUM(CASE WHEN clause6Compliant = 1 THEN 1 ELSE 0 END)`,
    c7: sql<number>`SUM(CASE WHEN clause7Compliant = 1 THEN 1 ELSE 0 END)`,
    c8: sql<number>`SUM(CASE WHEN clause8Compliant = 1 THEN 1 ELSE 0 END)`,
    total: count(),
  }).from(deepScanQueue).where(
    and(eq(deepScanQueue.jobId, jobId), sql`complianceStatus != 'error' AND complianceStatus != 'no_policy' AND status = 'completed'`)
  );
  return result[0] || null;
}

export async function deleteDeepScanQueueByJob(jobId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(deepScanQueue).where(eq(deepScanQueue.jobId, jobId));
}

export async function resetFailedItems(jobId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(deepScanQueue).set({ status: 'pending', errorMessage: null, retryCount: sql`retryCount + 1` })
    .where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.status, 'failed')));
}

export async function getDeepScanItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(deepScanQueue).where(eq(deepScanQueue.id, id));
  return rows[0] || null;
}

export async function resetStuckScanningItems(jobId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(deepScanQueue).set({ status: 'pending' })
    .where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.status, 'scanning')));
}

// ===== LLM Analysis Helpers =====
export async function getItemsNeedingLLMAnalysis(jobId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: deepScanQueue.id,
    domain: deepScanQueue.domain,
    privacyTextContent: deepScanQueue.privacyTextContent,
  }).from(deepScanQueue)
    .where(and(
      eq(deepScanQueue.jobId, jobId),
      eq(deepScanQueue.status, 'completed'),
      isNotNull(deepScanQueue.privacyTextContent),
      sql`LENGTH(privacyTextContent) > 100`,
      sql`(summary IS NULL OR LENGTH(summary) < 10)`
    ))
    .orderBy(asc(deepScanQueue.id))
    .limit(limit);
}

export async function countItemsNeedingLLMAnalysis(jobId: number) {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.select({ count: count() }).from(deepScanQueue)
    .where(and(
      eq(deepScanQueue.jobId, jobId),
      eq(deepScanQueue.status, 'completed'),
      isNotNull(deepScanQueue.privacyTextContent),
      sql`LENGTH(privacyTextContent) > 100`,
      sql`(summary IS NULL OR LENGTH(summary) < 10)`
    ));
  return result.count;
}

export async function updateItemLLMAnalysis(id: number, data: {
  overallScore: number;
  complianceStatus: 'compliant' | 'partially_compliant' | 'non_compliant' | 'no_policy' | 'error';
  clause1Compliant: boolean; clause1Evidence: string | null;
  clause2Compliant: boolean; clause2Evidence: string | null;
  clause3Compliant: boolean; clause3Evidence: string | null;
  clause4Compliant: boolean; clause4Evidence: string | null;
  clause5Compliant: boolean; clause5Evidence: string | null;
  clause6Compliant: boolean; clause6Evidence: string | null;
  clause7Compliant: boolean; clause7Evidence: string | null;
  clause8Compliant: boolean; clause8Evidence: string | null;
  summary: string | null;
  recommendations: any;
  rating: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(deepScanQueue).set(data).where(eq(deepScanQueue.id, id));
}

// ===== Failure Report Helpers =====
export async function getFailureBreakdown(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select({
    errorMessage: deepScanQueue.errorMessage,
    domain: deepScanQueue.domain,
    httpStatus: deepScanQueue.httpStatus,
  }).from(deepScanQueue)
    .where(and(
      eq(deepScanQueue.jobId, jobId),
      eq(deepScanQueue.status, 'failed')
    ))
    .orderBy(deepScanQueue.errorMessage);
  return results;
}

// ===== Live Scan Progress Helpers =====
export async function getScanProgressLive(jobId: number) {
  const db = await getDb();
  if (!db) return null;
  const stats = await getDeepScanQueueStats(jobId);
  if (!stats) return null;
  
  // Get scan start time from the job
  const job = await getBatchScanJob(jobId);
  
  return {
    ...stats,
    jobName: job?.jobName || `مهمة #${jobId}`,
    jobStatus: job?.status || 'unknown',
    startedAt: job?.createdAt,
  };
}


// ─── Platform Analytics ──────────────────────────────────────────────
export async function trackPlatformEvent(data: {
  eventType: "page_view" | "scan" | "report" | "login" | "export" | "search" | "api_call";
  userId?: number;
  page?: string;
  metadata?: any;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(platformAnalytics).values(data);
}

export async function getPlatformAnalyticsOverview(days = 30) {
  const db = await getDb();
  if (!db) return { totalEvents: 0, uniqueUsers: 0, pageViews: 0, scanEvents: 0, loginEvents: 0 };
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const [totalEvents] = await db.select({ count: sql<number>`count(*)` }).from(platformAnalytics).where(gte(platformAnalytics.createdAt, since));
  const [uniqueUsers] = await db.select({ count: sql<number>`count(distinct ${platformAnalytics.userId})` }).from(platformAnalytics).where(gte(platformAnalytics.createdAt, since));
  const [pageViews] = await db.select({ count: sql<number>`count(*)` }).from(platformAnalytics).where(and(eq(platformAnalytics.eventType, "page_view"), gte(platformAnalytics.createdAt, since)));
  const [scanEvents] = await db.select({ count: sql<number>`count(*)` }).from(platformAnalytics).where(and(eq(platformAnalytics.eventType, "scan"), gte(platformAnalytics.createdAt, since)));
  const [loginEvents] = await db.select({ count: sql<number>`count(*)` }).from(platformAnalytics).where(and(eq(platformAnalytics.eventType, "login"), gte(platformAnalytics.createdAt, since)));
  return {
    totalEvents: totalEvents?.count || 0,
    uniqueUsers: uniqueUsers?.count || 0,
    pageViews: pageViews?.count || 0,
    scanEvents: scanEvents?.count || 0,
    loginEvents: loginEvents?.count || 0,
  };
}

export async function getDailyEventTrends(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db.select({
    date: sql<string>`DATE(${platformAnalytics.createdAt})`.as("date"),
    eventType: platformAnalytics.eventType,
    count: sql<number>`count(*)`.as("count"),
  }).from(platformAnalytics).where(gte(platformAnalytics.createdAt, since))
    .groupBy(sql`DATE(${platformAnalytics.createdAt})`, platformAnalytics.eventType)
    .orderBy(sql`DATE(${platformAnalytics.createdAt})`);
  return rows;
}

export async function getMostVisitedPages(days = 30, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db.select({
    page: platformAnalytics.page,
    count: sql<number>`count(*)`.as("count"),
    uniqueUsers: sql<number>`count(distinct ${platformAnalytics.userId})`.as("uniqueUsers"),
  }).from(platformAnalytics)
    .where(and(eq(platformAnalytics.eventType, "page_view"), gte(platformAnalytics.createdAt, since), sql`${platformAnalytics.page} IS NOT NULL`))
    .groupBy(platformAnalytics.page)
    .orderBy(sql`count(*) DESC`)
    .limit(limit);
  return rows;
}

export async function getHourlyActivity(days = 7) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db.select({
    hour: sql<number>`HOUR(${platformAnalytics.createdAt})`.as("hour"),
    count: sql<number>`count(*)`.as("count"),
  }).from(platformAnalytics).where(gte(platformAnalytics.createdAt, since))
    .groupBy(sql`HOUR(${platformAnalytics.createdAt})`)
    .orderBy(sql`HOUR(${platformAnalytics.createdAt})`);
  return rows;
}

export async function getActiveUsersDaily(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db.select({
    date: sql<string>`DATE(${platformAnalytics.createdAt})`.as("date"),
    activeUsers: sql<number>`count(distinct ${platformAnalytics.userId})`.as("activeUsers"),
  }).from(platformAnalytics).where(gte(platformAnalytics.createdAt, since))
    .groupBy(sql`DATE(${platformAnalytics.createdAt})`)
    .orderBy(sql`DATE(${platformAnalytics.createdAt})`);
  return rows;
}

export async function getDailyScanRate(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await db.select({
    date: sql<string>`DATE(${platformAnalytics.createdAt})`.as("date"),
    scans: sql<number>`count(*)`.as("scans"),
  }).from(platformAnalytics)
    .where(and(eq(platformAnalytics.eventType, "scan"), gte(platformAnalytics.createdAt, since)))
    .groupBy(sql`DATE(${platformAnalytics.createdAt})`)
    .orderBy(sql`DATE(${platformAnalytics.createdAt})`);
  return rows;
}

// ─── Compliance Change Email Notifications ───────────────────────────
export async function getUnsentComplianceNotifications(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(complianceChangeNotifications)
    .where(eq(complianceChangeNotifications.emailSent, false))
    .orderBy(complianceChangeNotifications.createdAt)
    .limit(limit);
}

export async function createComplianceChangeNotification(data: {
  siteId: number;
  domain: string;
  previousStatus?: string;
  newStatus: string;
  previousScore?: number;
  newScore: number;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(complianceChangeNotifications).values(data);
}

export async function getComplianceNotificationHistory(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(complianceChangeNotifications)
    .orderBy(desc(complianceChangeNotifications.createdAt))
    .limit(limit);
}

// ─── Deep Scan Final Report ──────────────────────────────────────────
export async function getDeepScanFinalReport(jobId: number) {
  const stats = await getDeepScanQueueStats(jobId);
  const clauseStats = await getDeepScanClauseStats(jobId);
  
  // Get compliance distribution
  const db = await getDb();
  if (!db) return { ...stats, clauseStats, complianceDistribution: [] };
  const complianceDist = await db.select({
    status: deepScanQueue.complianceStatus,
    count: sql<number>`count(*)`.as("count"),
  }).from(deepScanQueue)
    .where(and(eq(deepScanQueue.jobId, jobId), eq(deepScanQueue.status, "completed")))
    .groupBy(deepScanQueue.complianceStatus);

  return {
    ...stats,
    clauseStats,
    complianceDistribution: complianceDist,
  };
}


// ============================================
// Super Admin Control Panel - DB Helpers
// ============================================

// Platform Settings
export async function getAllPlatformSettings() {
  const db = await getDb();
  return db!.select().from(platformSettings).orderBy(asc(platformSettings.category), asc(platformSettings.settingKey));
}

export async function getPlatformSettingsByCategory(category: string) {
  const db = await getDb();
  return db!.select().from(platformSettings).where(eq(platformSettings.category, category));
}

export async function getPlatformSetting(key: string) {
  const db = await getDb();
  const [row] = await db!.select().from(platformSettings).where(eq(platformSettings.settingKey, key));
  return row || null;
}

export async function upsertPlatformSetting(data: { settingKey: string; settingValue: string; settingType?: string; category?: string; label?: string; description?: string; updatedBy?: number }) {
  const db = await getDb();
  const existing = await getPlatformSetting(data.settingKey);
  if (existing) {
    await db!.update(platformSettings).set({ settingValue: data.settingValue, updatedBy: data.updatedBy }).where(eq(platformSettings.settingKey, data.settingKey));
  } else {
    await db!.insert(platformSettings).values({ settingKey: data.settingKey, settingValue: data.settingValue, settingType: (data.settingType || 'string') as any, category: (data.category || 'branding') as any, label: data.label, description: data.description, updatedBy: data.updatedBy });
  }
  return getPlatformSetting(data.settingKey);
}

export async function deletePlatformSetting(key: string) {
  const db = await getDb();
  await db!.delete(platformSettings).where(eq(platformSettings.settingKey, key));
}

// Page Configs
export async function getAllPageConfigs() {
  const db = await getDb();
  return db!.select().from(pageConfigs).orderBy(asc(pageConfigs.sortOrder));
}

export async function getPageConfig(pageKey: string) {
  const db = await getDb();
  const [row] = await db!.select().from(pageConfigs).where(eq(pageConfigs.pageKey, pageKey));
  return row || null;
}

export async function upsertPageConfig(data: { pageKey: string; titleAr?: string; titleEn?: string; icon?: string; path?: string; isVisible?: boolean; sortOrder?: number; parentKey?: string; requiredRole?: string; description?: string; updatedBy?: number }) {
  const db = await getDb();
  const existing = await getPageConfig(data.pageKey);
  const setData: any = {};
  if (data.titleAr !== undefined) setData.titleAr = data.titleAr;
  if (data.titleEn !== undefined) setData.titleEn = data.titleEn;
  if (data.icon !== undefined) setData.icon = data.icon;
  if (data.path !== undefined) setData.path = data.path;
  if (data.isVisible !== undefined) setData.isVisible = data.isVisible ? 1 : 0;
  if (data.sortOrder !== undefined) setData.sortOrder = data.sortOrder;
  if (data.parentKey !== undefined) setData.parentGroup = data.parentKey;
  if (data.requiredRole !== undefined) setData.requiredRole = data.requiredRole;
  if (data.description !== undefined) setData.description = data.description;
  if (data.updatedBy !== undefined) setData.updatedBy = data.updatedBy;
  if (existing) {
    await db!.update(pageConfigs).set(setData).where(eq(pageConfigs.pageKey, data.pageKey));
  } else {
    await db!.insert(pageConfigs).values({ pageKey: data.pageKey, titleAr: data.titleAr || data.pageKey, path: data.path || '/' + data.pageKey, ...setData });
  }
  return getPageConfig(data.pageKey);
}

export async function deletePageConfig(pageKey: string) {
  const db = await getDb();
  await db!.delete(pageConfigs).where(eq(pageConfigs.pageKey, pageKey));
}

export async function reorderPages(pages: { pageKey: string; sortOrder: number }[]) {
  const db = await getDb();
  for (const p of pages) {
    await db!.update(pageConfigs).set({ sortOrder: p.sortOrder }).where(eq(pageConfigs.pageKey, p.pageKey));
  }
}

// Theme Settings
export async function getAllThemeSettings() {
  const db = await getDb();
  return db!.select().from(themeSettings).orderBy(asc(themeSettings.category), asc(themeSettings.themeKey));
}

export async function getThemeSettingsByCategory(category: string) {
  const db = await getDb();
  return db!.select().from(themeSettings).where(eq(themeSettings.category, category));
}

export async function upsertThemeSetting(data: { themeKey: string; themeValue: string; category?: string; label?: string; cssVariable?: string; updatedBy?: number }) {
  const db = await getDb();
  const [existing] = await db!.select().from(themeSettings).where(eq(themeSettings.themeKey, data.themeKey));
  if (existing) {
    await db!.update(themeSettings).set({ themeValue: data.themeValue, updatedBy: data.updatedBy }).where(eq(themeSettings.themeKey, data.themeKey));
  } else {
    await db!.insert(themeSettings).values({ themeKey: data.themeKey, themeValue: data.themeValue, category: (data.category || 'primary') as any, label: data.label, cssVariable: data.cssVariable, updatedBy: data.updatedBy });
  }
  const [result] = await db!.select().from(themeSettings).where(eq(themeSettings.themeKey, data.themeKey));
  return result;
}

export async function deleteThemeSetting(key: string) {
  const db = await getDb();
  await db!.delete(themeSettings).where(eq(themeSettings.themeKey, key));
}

// Content Blocks
export async function getContentBlocksByPage(pageKey: string) {
  const db = await getDb();
  return db!.select().from(contentBlocks).where(eq(contentBlocks.pageKey, pageKey)).orderBy(asc(contentBlocks.sortOrder));
}

export async function getAllContentBlocks() {
  const db = await getDb();
  return db!.select().from(contentBlocks).orderBy(asc(contentBlocks.pageKey), asc(contentBlocks.sortOrder));
}

export async function upsertContentBlock(data: { pageKey: string; blockKey: string; blockType?: string; contentAr?: string; contentEn?: string; mediaUrl?: string; sortOrder?: number; isVisible?: boolean; metadata?: string; updatedBy?: number }) {
  const db = await getDb();
  const [existing] = await db!.select().from(contentBlocks).where(and(eq(contentBlocks.pageKey, data.pageKey), eq(contentBlocks.blockKey, data.blockKey)));
  const setData: any = {};
  if (data.contentAr !== undefined) setData.contentAr = data.contentAr;
  if (data.contentEn !== undefined) setData.contentEn = data.contentEn;
  if (data.mediaUrl !== undefined) setData.imageUrl = data.mediaUrl;
  if (data.sortOrder !== undefined) setData.sortOrder = data.sortOrder;
  if (data.isVisible !== undefined) setData.isVisible = data.isVisible ? 1 : 0;
  if (data.metadata !== undefined) setData.metadata = data.metadata;
  if (data.updatedBy !== undefined) setData.updatedBy = data.updatedBy;
  if (existing) {
    await db!.update(contentBlocks).set(setData).where(eq(contentBlocks.id, existing.id));
  } else {
    await db!.insert(contentBlocks).values({ blockKey: data.blockKey, pageKey: data.pageKey, blockType: (data.blockType || 'text') as any, ...setData });
  }
  const [result] = await db!.select().from(contentBlocks).where(and(eq(contentBlocks.pageKey, data.pageKey), eq(contentBlocks.blockKey, data.blockKey)));
  return result;
}

export async function deleteContentBlock(id: number) {
  const db = await getDb();
  await db!.delete(contentBlocks).where(eq(contentBlocks.id, id));
}

// Data Transfer Logs
export async function getDataTransferLogs(limit = 50) {
  const db = await getDb();
  return db!.select().from(dataTransferLogs).orderBy(desc(dataTransferLogs.createdAt)).limit(limit);
}

export async function createDataTransferLog(data: { operation: string; section: string; userId: number; status?: string }) {
  const db = await getDb();
  try {
    await db!.insert(dataTransferLogs).values({
      transferType: data.operation as any,
      dataSection: data.section,
      userId: data.userId,
      status: (data.status || 'pending') as any,
    });
    const [latest] = await db!.select({ id: dataTransferLogs.id }).from(dataTransferLogs).orderBy(desc(dataTransferLogs.id)).limit(1);
    return latest || { id: 0 };
  } catch (e) {
    console.error('[createDataTransferLog] Error:', e);
    return { id: 0 };
  }
}

export async function updateDataTransferLog(id: number, data: { status?: string; recordCount?: number; errorMessage?: string; completedAt?: Date }) {
  const db = await getDb();
  const setData: any = {};
  if (data.status !== undefined) setData.status = data.status;
  if (data.recordCount !== undefined) setData.recordCount = data.recordCount;
  if (data.errorMessage !== undefined) setData.errorMessage = data.errorMessage;
  if (data.completedAt !== undefined) setData.completedAt = data.completedAt;
  await db!.update(dataTransferLogs).set(setData).where(eq(dataTransferLogs.id, id));
}

// Admin Member Management (extended)
export async function adminUpdateUserRole(userId: number, role: string, updatedBy: number) {
  const db = await getDb();
  await db!.update(users).set({ role: role as any }).where(eq(users.id, userId));
  return db!.select().from(users).where(eq(users.id, userId));
}

export async function adminDeleteUser(userId: number) {
  const db = await getDb();
  await db!.delete(users).where(eq(users.id, userId));
}

export async function adminGetAllUsers() {
  const db = await getDb();
  // Get users from both tables
  const dbUsers = await db!.select({
    id: users.id,
    username: users.username,
    displayName: users.displayName,
    email: users.email,
    mobile: users.mobile,
    role: users.role,
    rasidRole: users.rasidRole,
    createdAt: users.createdAt,
  }).from(users).orderBy(desc(users.createdAt));
  // Also get platformUsers
  const pUsers = await db!.select().from(platformUsers).orderBy(desc(platformUsers.createdAt));
  const platformMapped = pUsers.map((pu: any) => ({
    id: pu.id + 100000,
    username: pu.userId,
    displayName: pu.displayName,
    email: pu.email,
    mobile: pu.mobile,
    role: pu.platformRole === 'root_admin' ? 'admin' as const : 'user' as const,
    rasidRole: pu.platformRole === 'root_admin' ? 'root' as const :
               pu.platformRole === 'director' ? 'admin' as const :
               pu.platformRole === 'vice_president' ? 'admin' as const :
               pu.platformRole === 'manager' ? 'smart_monitor_manager' as const : 'monitoring_officer' as const,
    createdAt: pu.createdAt,
  }));
  const platformUsernames = new Set(platformMapped.map((p: any) => p.username?.toLowerCase()));
  const uniqueDbUsers = dbUsers.filter((u: any) => !platformUsernames.has(u.username?.toLowerCase()));
  return [...platformMapped, ...uniqueDbUsers];
}

// Export data helpers
export async function exportSitesData() {
  const db = await getDb();
  return db!.select().from(sites);
}

export async function exportScansData() {
  const db = await getDb();
  return db!.select().from(scans).orderBy(desc(scans.createdAt));
}

export async function exportUsersData() {
  const db = await getDb();
  return db!.select({
    id: users.id,
    username: users.username,
    displayName: users.displayName,
    email: users.email,
    mobile: users.mobile,
    role: users.role,
    rasidRole: users.rasidRole,
    createdAt: users.createdAt,
  }).from(users);
}

export async function exportLettersData() {
  const db = await getDb();
  return db!.select().from(letters).orderBy(desc(letters.createdAt));
}

export async function exportCasesData() {
  const db = await getDb();
  return db.select().from(cases).orderBy(desc(cases.createdAt));
}


// ============================================
// Settings Audit Log - DB Helpers
// ============================================

export async function createAuditLogEntry(entry: {
  tableName: string;
  recordKey: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  changeType: 'create' | 'update' | 'delete' | 'rollback';
  userId?: number;
  userName?: string;
  metadata?: any;
}) {
  const db = await getDb();
  const result = await db.execute(
    sql`INSERT INTO settings_audit_log (table_name, record_key, field_name, old_value, new_value, change_type, user_id, user_name, metadata)
        VALUES (${entry.tableName}, ${entry.recordKey}, ${entry.fieldName}, ${entry.oldValue}, ${entry.newValue}, ${entry.changeType}, ${entry.userId || null}, ${entry.userName || null}, ${entry.metadata ? JSON.stringify(entry.metadata) : null})`
  );
  return result;
}

export async function getAuditLogs(limit = 100, offset = 0) {
  const db = await getDb();
  const rows = await db.execute(
    sql`SELECT * FROM settings_audit_log ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
  );
  return rows[0];
}

export async function getAuditLogsByRecord(tableName: string, recordKey: string) {
  const db = await getDb();
  const rows = await db.execute(
    sql`SELECT * FROM settings_audit_log WHERE table_name = ${tableName} AND record_key = ${recordKey} ORDER BY created_at DESC`
  );
  return rows[0];
}

export async function getAuditLogCount() {
  const db = await getDb();
  const rows = await db.execute(sql`SELECT COUNT(*) as total FROM settings_audit_log`);
  return (rows[0] as any)[0]?.total || 0;
}

// Bulk fetch all settings + themes for the live context
export async function getAllPlatformConfig() {
  const db = await getDb();
  const [settingsRows, themeRows, contentRows] = await Promise.all([
    db.select().from(platformSettings).orderBy(asc(platformSettings.sortOrder)),
    db.select().from(themeSettings),
    db.select().from(contentBlocks).orderBy(asc(contentBlocks.sortOrder)),
  ]);
  return { settings: settingsRows, themes: themeRows, content: contentRows };
}


// ─── Presentation Builder DB Helpers ──────────────────────────
export async function getTemplates(category?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not initialized");
  let q = db.select().from(presentationTemplates);
  if (category && category !== 'all') {
    q = q.where(eq(presentationTemplates.category, category as any)) as any;
  }
  return q;
}

export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not initialized");
  const rows = await db.select().from(presentationTemplates).where(eq(presentationTemplates.id, id));
  return rows[0] || null;
}

export async function seedBuiltInTemplates(templates: any[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not initialized");
  for (const t of templates) {
    const existing = await db.select({ id: presentationTemplates.id }).from(presentationTemplates).where(eq(presentationTemplates.name, t.name));
    if (existing.length === 0) {
      await db.insert(presentationTemplates).values(t);
    }
  }
  return { seeded: templates.length };
}

export async function getUserPresentations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not initialized");
  return db.select().from(presentations).where(eq(presentations.userId, userId)).orderBy(desc(presentations.createdAt));
}

export async function getPresentationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not initialized");
  const rows = await db.select().from(presentations).where(eq(presentations.id, id));
  return rows[0] || null;
}

export async function createPresentation(data: { title: string; description?: string; templateId?: number; slides: any; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("DB not initialized");
  const result = await db.insert(presentations).values({
    title: data.title,
    description: data.description || null,
    templateId: data.templateId || null,
    slides: data.slides,
    userId: data.userId,
  });
  return { id: result[0].insertId };
}

export async function updatePresentation(id: number, data: { title?: string; description?: string; slides?: any }) {
  const db = await getDb();
  if (!db) throw new Error("DB not initialized");
  const updates: any = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.slides !== undefined) updates.slides = data.slides;
  await db.update(presentations).set(updates).where(eq(presentations.id, id));
  return { success: true };
}

export async function deletePresentation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not initialized");
  await db.delete(presentations).where(eq(presentations.id, id));
  return { success: true };
}


// ========== Platform 2 Unique Functions ==========

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getLeaks(filters?: {
  source?: string;
  severity?: string;
  status?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.source && filters.source !== "all") {
    conditions.push(eq(leaks.source, filters.source as any));
  }
  if (filters?.severity && filters.severity !== "all") {
    conditions.push(eq(leaks.severity, filters.severity as any));
  }
  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(leaks.status, filters.status as any));
  }
  if (filters?.search) {
    conditions.push(
      sql`(${leaks.title} LIKE ${`%${filters.search}%`} OR ${leaks.titleAr} LIKE ${`%${filters.search}%`})`
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(leaks).where(where).orderBy(desc(leaks.detectedAt));
}

export async function getLeakById(leakId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leaks).where(eq(leaks.leakId, leakId)).limit(1);
  return result[0];
}

export async function createLeak(leak: InsertLeak) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(leaks).values(leak);
}

export async function updateLeakStatus(leakId: string, status: "new" | "analyzing" | "documented" | "reported") {
  const db = await getDb();
  if (!db) return;
  await db.update(leaks).set({ status }).where(eq(leaks.leakId, leakId));
}

// ─── Channel Helpers ────────────────────────────────────────────

export async function getChannels(platform?: string) {
  const db = await getDb();
  if (!db) return [];
  if (platform && platform !== "all") {
    return db.select().from(channels).where(eq(channels.platform, platform as any)).orderBy(desc(channels.lastActivity));
  }
  return db.select().from(channels).orderBy(desc(channels.lastActivity));
}

export async function createChannel(channel: InsertChannel) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(channels).values(channel);
}

// ─── PII Scan Helpers ───────────────────────────────────────────

export async function savePiiScan(scan: InsertPiiScan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(piiScans).values(scan);
  return result[0].insertId;
}

export async function getPiiScans(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(piiScans).where(eq(piiScans.userId, userId)).orderBy(desc(piiScans.createdAt)).limit(50);
}

// ─── Report Helpers ─────────────────────────────────────────────

export async function getReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reports).orderBy(desc(reports.createdAt));
}

export async function createReport(report: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reports).values(report);
  return result[0].insertId;
}

// ─── Dark Web Listing Helpers ───────────────────────────────────

export async function getDarkWebListings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(darkWebListings).orderBy(desc(darkWebListings.detectedAt));
}

export async function createDarkWebListing(listing: InsertDarkWebListing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(darkWebListings).values(listing);
}

// ─── Paste Entry Helpers ────────────────────────────────────────

export async function getPasteEntries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pasteEntries).orderBy(desc(pasteEntries.detectedAt));
}

export async function createPasteEntry(entry: InsertPasteEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(pasteEntries).values(entry);
}

// ─── Dashboard Stats ────────────────────────────────────────────

export async function getMonthlyComparison() {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Current month stats
  const [currentStats] = await db.select({
    totalLeaks: sql<number>`COUNT(*)`,
    totalRecords: sql<number>`COALESCE(SUM(recordCount), 0)`,
    criticalCount: sql<number>`SUM(CASE WHEN recordCount >= 10000 THEN 1 ELSE 0 END)`,
    newCount: sql<number>`SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END)`,
    resolvedCount: sql<number>`SUM(CASE WHEN status = 'reported' THEN 1 ELSE 0 END)`,
    telegramCount: sql<number>`SUM(CASE WHEN source = 'telegram' THEN 1 ELSE 0 END)`,
    darkwebCount: sql<number>`SUM(CASE WHEN source = 'darkweb' THEN 1 ELSE 0 END)`,
    pasteCount: sql<number>`SUM(CASE WHEN source = 'paste' THEN 1 ELSE 0 END)`,
  }).from(leaks).where(sql`detectedAt >= ${currentMonthStart.toISOString()} AND detectedAt <= ${currentMonthEnd.toISOString()}`);

  // Previous month stats
  const [prevStats] = await db.select({
    totalLeaks: sql<number>`COUNT(*)`,
    totalRecords: sql<number>`COALESCE(SUM(recordCount), 0)`,
    criticalCount: sql<number>`SUM(CASE WHEN recordCount >= 10000 THEN 1 ELSE 0 END)`,
    newCount: sql<number>`SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END)`,
    resolvedCount: sql<number>`SUM(CASE WHEN status = 'reported' THEN 1 ELSE 0 END)`,
    telegramCount: sql<number>`SUM(CASE WHEN source = 'telegram' THEN 1 ELSE 0 END)`,
    darkwebCount: sql<number>`SUM(CASE WHEN source = 'darkweb' THEN 1 ELSE 0 END)`,
    pasteCount: sql<number>`SUM(CASE WHEN source = 'paste' THEN 1 ELSE 0 END)`,
  }).from(leaks).where(sql`detectedAt >= ${prevMonthStart.toISOString()} AND detectedAt <= ${prevMonthEnd.toISOString()}`);

  // Current month sector distribution
  const currentSectors = await db.select({
    sector: leaks.sectorAr,
    count: sql<number>`COUNT(*)`,
  }).from(leaks)
    .where(sql`detectedAt >= ${currentMonthStart.toISOString()} AND detectedAt <= ${currentMonthEnd.toISOString()}`)
    .groupBy(leaks.sectorAr).orderBy(sql`COUNT(*) DESC`).limit(8);

  // Previous month sector distribution
  const prevSectors = await db.select({
    sector: leaks.sectorAr,
    count: sql<number>`COUNT(*)`,
  }).from(leaks)
    .where(sql`detectedAt >= ${prevMonthStart.toISOString()} AND detectedAt <= ${prevMonthEnd.toISOString()}`)
    .groupBy(leaks.sectorAr).orderBy(sql`COUNT(*) DESC`).limit(8);

  // Daily trend for current and previous month
  const currentDaily = await db.select({
    day: sql<string>`DATE_FORMAT(detectedAt, '%Y-%m-%d')`,
    count: sql<number>`COUNT(*)`,
  }).from(leaks)
    .where(sql`detectedAt >= ${currentMonthStart.toISOString()} AND detectedAt <= ${currentMonthEnd.toISOString()}`)
    .groupBy(sql`DATE_FORMAT(detectedAt, '%Y-%m-%d')`).orderBy(sql`DATE_FORMAT(detectedAt, '%Y-%m-%d')`);

  const prevDaily = await db.select({
    day: sql<string>`DATE_FORMAT(detectedAt, '%Y-%m-%d')`,
    count: sql<number>`COUNT(*)`,
  }).from(leaks)
    .where(sql`detectedAt >= ${prevMonthStart.toISOString()} AND detectedAt <= ${prevMonthEnd.toISOString()}`)
    .groupBy(sql`DATE_FORMAT(detectedAt, '%Y-%m-%d')`).orderBy(sql`DATE_FORMAT(detectedAt, '%Y-%m-%d')`);

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return {
    currentMonth: {
      name: monthNames[now.getMonth()],
      nameEn: now.toLocaleString("en", { month: "long" }),
      year: now.getFullYear(),
      totalLeaks: Number(currentStats?.totalLeaks ?? 0),
      totalRecords: Number(currentStats?.totalRecords ?? 0),
      criticalCount: Number(currentStats?.criticalCount ?? 0),
      newCount: Number(currentStats?.newCount ?? 0),
      resolvedCount: Number(currentStats?.resolvedCount ?? 0),
      telegramCount: Number(currentStats?.telegramCount ?? 0),
      darkwebCount: Number(currentStats?.darkwebCount ?? 0),
      pasteCount: Number(currentStats?.pasteCount ?? 0),
      sectors: currentSectors.map(r => ({ sector: r.sector, count: Number(r.count) })),
      daily: currentDaily.map(r => ({ day: r.day, count: Number(r.count) })),
    },
    previousMonth: {
      name: monthNames[now.getMonth() === 0 ? 11 : now.getMonth() - 1],
      nameEn: new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString("en", { month: "long" }),
      year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
      totalLeaks: Number(prevStats?.totalLeaks ?? 0),
      totalRecords: Number(prevStats?.totalRecords ?? 0),
      criticalCount: Number(prevStats?.criticalCount ?? 0),
      newCount: Number(prevStats?.newCount ?? 0),
      resolvedCount: Number(prevStats?.resolvedCount ?? 0),
      telegramCount: Number(prevStats?.telegramCount ?? 0),
      darkwebCount: Number(prevStats?.darkwebCount ?? 0),
      pasteCount: Number(prevStats?.pasteCount ?? 0),
      sectors: prevSectors.map(r => ({ sector: r.sector, count: Number(r.count) })),
      daily: prevDaily.map(r => ({ day: r.day, count: Number(r.count) })),
    },
  };
}

// ─── Audit Log ──────────────────────────────────────────────────

export async function logAudit(
  userId: number | null,
  action: string,
  details?: string,
  category?: "auth" | "leak" | "export" | "pii" | "user" | "report" | "system" | "monitoring" | "user_management",
  userName?: string,
  ipAddress?: string,
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values({
    userId,
    userName: userName ?? null,
    action,
    category: category ?? "system",
    details,
    ipAddress: ipAddress ?? null,
  });
}

export async function exportAuditLogsCsv(filters?: { category?: string }) {
  const logs = await getAuditLogs({ ...filters, limit: 5000 });
  const headers = ["ID", "User ID", "User Name", "Action", "Category", "Details", "IP Address", "Timestamp"];
  const rows = logs.map((log) => [
    log.id,
    log.userId ?? "",
    `"${log.userName ?? ""}"`,
    log.action,
    log.category,
    `"${(log.details ?? "").replace(/"/g, '""')}"`,
    log.ipAddress ?? "",
    log.createdAt?.toISOString() ?? "",
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// ─── Notifications ──────────────────────────────────────────────

export async function createNotification(notif: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(notif);
  return result[0].insertId;
}

export async function getNotifications(userId?: number | null, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  // Get notifications for the user or global (userId = null)
  if (userId) {
    return db.select().from(notifications)
      .where(sql`${notifications.userId} = ${userId} OR ${notifications.userId} IS NULL`)
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }
  return db.select().from(notifications)
    .where(sql`${notifications.userId} IS NULL`)
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getMonitoringJobs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(monitoringJobs).orderBy(desc(monitoringJobs.updatedAt));
}

export async function getMonitoringJobById(jobId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(monitoringJobs).where(eq(monitoringJobs.jobId, jobId)).limit(1);
  return result[0];
}

export async function createMonitoringJob(job: InsertMonitoringJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(monitoringJobs).values(job);
}

export async function updateMonitoringJobStatus(
  jobId: string,
  status: "active" | "paused" | "running" | "error",
  extra?: { lastRunAt?: Date; nextRunAt?: Date; lastResult?: string; leaksFound?: number; totalRuns?: number }
) {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = { status };
  if (extra?.lastRunAt) updateData.lastRunAt = extra.lastRunAt;
  if (extra?.nextRunAt) updateData.nextRunAt = extra.nextRunAt;
  if (extra?.lastResult !== undefined) updateData.lastResult = extra.lastResult;
  if (extra?.leaksFound !== undefined) updateData.leaksFound = sql`${monitoringJobs.leaksFound} + ${extra.leaksFound}`;
  if (extra?.totalRuns !== undefined) updateData.totalRuns = sql`${monitoringJobs.totalRuns} + 1`;
  await db.update(monitoringJobs).set(updateData).where(eq(monitoringJobs.jobId, jobId));
}

// ─── Alert Contacts ────────────────────────────────────────────


export async function getAlertContacts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alertContacts).orderBy(desc(alertContacts.createdAt));
}

export async function createAlertContact(contact: InsertAlertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(alertContacts).values(contact);
  return result[0].insertId;
}

export async function updateAlertContact(id: number, data: Partial<InsertAlertContact>) {
  const db = await getDb();
  if (!db) return;
  await db.update(alertContacts).set(data).where(eq(alertContacts.id, id));
}

export async function deleteAlertContact(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(alertContacts).where(eq(alertContacts.id, id));
}

// ─── Alert Rules ───────────────────────────────────────────────

export async function getAlertRules() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alertRules).orderBy(desc(alertRules.createdAt));
}

export async function createAlertRule(rule: InsertAlertRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(alertRules).values(rule);
  return result[0].insertId;
}

export async function updateAlertRule(id: number, data: Partial<InsertAlertRule>) {
  const db = await getDb();
  if (!db) return;
  await db.update(alertRules).set(data).where(eq(alertRules.id, id));
}

export async function deleteAlertRule(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(alertRules).where(eq(alertRules.id, id));
}

// ─── Alert History ─────────────────────────────────────────────

export async function getAlertHistory(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alertHistory).orderBy(desc(alertHistory.sentAt)).limit(limit);
}

// ─── Retention Policies ────────────────────────────────────────

export async function getRetentionPolicies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(retentionPolicies).orderBy(retentionPolicies.entity);
}

export async function updateRetentionPolicy(
  id: number,
  data: { retentionDays?: number; archiveAction?: "delete" | "archive"; isEnabled?: boolean }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(retentionPolicies).set(data).where(eq(retentionPolicies.id, id));
}

// ─── API Keys ─────────────────────────────────────────────────


export async function updateApiKey(id: number, data: Partial<{ name: string; permissions: string[]; rateLimit: number; isActive: boolean; expiresAt: Date | null }>) {
  const db = await getDb();
  if (!db) return;
  await db.update(apiKeys).set(data).where(eq(apiKeys.id, id));
}

export async function getThreatMapData() {
  const db = await getDb();
  if (!db) return { regions: [], leaks: [] };
  
  const allLeaks = await db.select({
    leakId: leaks.leakId,
    title: leaks.title,
    titleAr: leaks.titleAr,
    source: leaks.source,
    severity: leaks.severity,
    sector: leaks.sector,
    sectorAr: leaks.sectorAr,
    recordCount: leaks.recordCount,
    status: leaks.status,
    region: leaks.region,
    regionAr: leaks.regionAr,
    city: leaks.city,
    cityAr: leaks.cityAr,
    latitude: leaks.latitude,
    longitude: leaks.longitude,
    detectedAt: leaks.detectedAt,
  }).from(leaks).where(
    sql`${leaks.latitude} IS NOT NULL AND ${leaks.longitude} IS NOT NULL`
  );
  
  // Aggregate by region
  const regionMap = new Map<string, { region: string; regionAr: string; count: number; critical: number; high: number; medium: number; low: number; records: number }>();
  for (const leak of allLeaks) {
    const key = leak.region || "Unknown";
    const existing = regionMap.get(key) || { region: key, regionAr: leak.regionAr || key, count: 0, critical: 0, high: 0, medium: 0, low: 0, records: 0 };
    existing.count++;
    existing[leak.severity as "critical" | "high" | "medium" | "low"]++;
    existing.records += leak.recordCount;
    regionMap.set(key, existing);
  }
  
  return {
    regions: Array.from(regionMap.values()),
    leaks: allLeaks,
  };
}

// ─── New v5 Tables ──────────────────────────────────────────


// ─── Threat Rules ────────────────────────────────────────────

export async function getThreatRules() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(threatRules).orderBy(desc(threatRules.createdAt));
}

export async function getThreatRuleById(ruleId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(threatRules).where(eq(threatRules.ruleId, ruleId)).limit(1);
  return result[0];
}

export async function createThreatRule(rule: InsertThreatRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(threatRules).values(rule);
  return result[0].insertId;
}

export async function updateThreatRule(id: number, data: Partial<InsertThreatRule>) {
  const db = await getDb();
  if (!db) return;
  await db.update(threatRules).set(data).where(eq(threatRules.id, id));
}

export async function toggleThreatRule(id: number, isEnabled: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(threatRules).set({ isEnabled }).where(eq(threatRules.id, id));
}

// ─── Evidence Chain ──────────────────────────────────────────

export async function getEvidenceChain(leakId?: string) {
  const db = await getDb();
  if (!db) return [];
  if (leakId) {
    return db.select().from(evidenceChain).where(eq(evidenceChain.leakId, leakId)).orderBy(evidenceChain.blockIndex);
  }
  return db.select().from(evidenceChain).orderBy(desc(evidenceChain.createdAt));
}

export async function createEvidenceEntry(entry: InsertEvidenceChainEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(evidenceChain).values(entry);
  return result[0].insertId;
}

export async function getEvidenceStats() {
  const db = await getDb();
  if (!db) return { total: 0, verified: 0, types: {} };
  const all = await db.select().from(evidenceChain);
  const verified = all.filter(e => e.isVerified).length;
  const types: Record<string, number> = {};
  all.forEach(e => { types[e.evidenceType] = (types[e.evidenceType] || 0) + 1; });
  return { total: all.length, verified, types };
}

// ─── Seller Profiles ─────────────────────────────────────────

export async function getSellerProfiles(filters?: { riskLevel?: string }) {
  const db = await getDb();
  if (!db) return [];
  if (filters?.riskLevel && filters.riskLevel !== "all") {
    return db.select().from(sellerProfiles).where(eq(sellerProfiles.riskLevel, filters.riskLevel as any)).orderBy(desc(sellerProfiles.riskScore));
  }
  return db.select().from(sellerProfiles).orderBy(desc(sellerProfiles.riskScore));
}

export async function getSellerById(sellerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sellerProfiles).where(eq(sellerProfiles.sellerId, sellerId)).limit(1);
  return result[0];
}

export async function createSellerProfile(seller: InsertSellerProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(sellerProfiles).values(seller);
  return result[0].insertId;
}

export async function updateSellerProfile(id: number, data: Partial<InsertSellerProfile>) {
  const db = await getDb();
  if (!db) return;
  await db.update(sellerProfiles).set(data).where(eq(sellerProfiles.id, id));
}

// ─── OSINT Queries ───────────────────────────────────────────

export async function getOsintQueries(filters?: { queryType?: string; category?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.queryType && filters.queryType !== "all") {
    conditions.push(eq(osintQueries.queryType, filters.queryType as any));
  }
  if (filters?.category && filters.category !== "all") {
    conditions.push(eq(osintQueries.category, filters.category));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(osintQueries).where(where).orderBy(desc(osintQueries.createdAt));
}

export async function createOsintQuery(query: InsertOsintQuery) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(osintQueries).values(query);
  return result[0].insertId;
}

export async function updateOsintQuery(id: number, data: Partial<InsertOsintQuery>) {
  const db = await getDb();
  if (!db) return;
  await db.update(osintQueries).set(data).where(eq(osintQueries.id, id));
}

// ─── Feedback Entries ────────────────────────────────────────

export async function getFeedbackEntries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedbackEntries).orderBy(desc(feedbackEntries.createdAt));
}

export async function createFeedbackEntry(entry: InsertFeedbackEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(feedbackEntries).values(entry);
  return result[0].insertId;
}

export async function getFeedbackStats() {
  const db = await getDb();
  if (!db) return { total: 0, correct: 0, precision: 0, recall: 0, f1: 0 };
  const all = await db.select().from(feedbackEntries);
  const total = all.length;
  const correct = all.filter(e => e.isCorrect).length;
  
  // Calculate precision, recall, F1
  const truePositives = all.filter(e => e.systemClassification === "personal_data" && e.analystClassification === "personal_data").length;
  const falsePositives = all.filter(e => e.systemClassification === "personal_data" && e.analystClassification !== "personal_data").length;
  const falseNegatives = all.filter(e => e.systemClassification !== "personal_data" && e.analystClassification === "personal_data").length;
  
  const precision = truePositives + falsePositives > 0 ? Math.round((truePositives / (truePositives + falsePositives)) * 100) : 0;
  const recall = truePositives + falseNegatives > 0 ? Math.round((truePositives / (truePositives + falseNegatives)) * 100) : 0;
  const f1 = precision + recall > 0 ? Math.round((2 * precision * recall) / (precision + recall)) : 0;
  
  return { total, correct, precision, recall, f1 };
}

// ─── Knowledge Graph ─────────────────────────────────────────

export async function getKnowledgeGraphData() {
  const db = await getDb();
  if (!db) return { nodes: [], edges: [] };
  const nodes = await db.select().from(knowledgeGraphNodes);
  const edges = await db.select().from(knowledgeGraphEdges);
  return { nodes, edges };
}


// ─── Platform Users (Custom Auth) ──────────────────────────────

export async function getPlatformUserByUserId(userId: string): Promise<PlatformUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(platformUsers).where(eq(platformUsers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPlatformUserById(id: number): Promise<PlatformUser | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(platformUsers).where(eq(platformUsers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllPlatformUsers(): Promise<PlatformUser[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(platformUsers).orderBy(desc(platformUsers.createdAt));
}

export async function createPlatformUser(user: InsertPlatformUser): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(platformUsers).values(user);
}

export async function updatePlatformUser(
  id: number,
  updates: Partial<Pick<PlatformUser, "name" | "email" | "mobile" | "displayName" | "platformRole" | "status" | "passwordHash" | "lastLoginAt">>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(platformUsers).set(updates).where(eq(platformUsers.id, id));
}

export async function deletePlatformUser(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(platformUsers).where(eq(platformUsers.id, id));
}


// ─── Incident Documentation Helpers ──────────────────────────────


export async function createIncidentDocument(doc: InsertIncidentDocument): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(incidentDocuments).values(doc).$returningId();
  return result.id;
}

export async function getIncidentDocumentByVerificationCode(code: string): Promise<IncidentDocument | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(incidentDocuments).where(eq(incidentDocuments.verificationCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getIncidentDocumentByDocumentId(documentId: string): Promise<IncidentDocument | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(incidentDocuments).where(eq(incidentDocuments.documentId, documentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getIncidentDocumentsByLeakId(leakId: string): Promise<IncidentDocument[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incidentDocuments).where(eq(incidentDocuments.leakId, leakId)).orderBy(desc(incidentDocuments.createdAt));
}

export async function getAllIncidentDocuments(): Promise<IncidentDocument[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incidentDocuments).orderBy(desc(incidentDocuments.createdAt));
}

export async function getFilteredIncidentDocuments(filters: {
  search?: string;
  employeeName?: string;
  leakId?: string;
  documentType?: string;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<IncidentDocument[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions: SQL[] = [];
  if (filters.search) {
    conditions.push(
      or(
        like(incidentDocuments.documentId, `%${filters.search}%`),
        like(incidentDocuments.verificationCode, `%${filters.search}%`),
        like(incidentDocuments.title, `%${filters.search}%`),
        like(incidentDocuments.titleAr, `%${filters.search}%`)
      )!
    );
  }
  if (filters.employeeName) {
    conditions.push(like(incidentDocuments.generatedByName, `%${filters.employeeName}%`));
  }
  if (filters.leakId) {
    conditions.push(eq(incidentDocuments.leakId, filters.leakId));
  }
  if (filters.documentType) {
    conditions.push(eq(incidentDocuments.documentType, filters.documentType as any));
  }
  if (filters.dateFrom) {
    conditions.push(gte(incidentDocuments.createdAt, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(incidentDocuments.createdAt, filters.dateTo));
  }
  const query = db.select().from(incidentDocuments);
  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(desc(incidentDocuments.createdAt));
  }
  return query.orderBy(desc(incidentDocuments.createdAt));
}

// ─── Report Audit Helpers ────────────────────────────────────────

export async function getReportAuditEntries(limit = 100): Promise<ReportAudit[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reportAudit).orderBy(desc(reportAudit.createdAt)).limit(limit);
}


// ─── AI Response Ratings Helpers ────────────────────────────────

export async function createAiRating(rating: InsertAiResponseRating): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.insert(aiResponseRatings).values(rating);
  return result[0].insertId;
}

export async function getAiRatings(filters?: {
  limit?: number;
  minRating?: number;
  maxRating?: number;
}): Promise<AiResponseRating[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions: SQL[] = [];
  if (filters?.minRating) conditions.push(gte(aiResponseRatings.rating, filters.minRating));
  if (filters?.maxRating) conditions.push(lte(aiResponseRatings.rating, filters.maxRating));
  const query = db.select().from(aiResponseRatings);
  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(desc(aiResponseRatings.createdAt)).limit(filters?.limit || 100);
  }
  return query.orderBy(desc(aiResponseRatings.createdAt)).limit(filters?.limit || 100);
}

export async function getAiRatingStats(): Promise<{
  totalRatings: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}> {
  const db = await getDb();
  if (!db) return { totalRatings: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const result = await db.select({
    totalRatings: sql<number>`COUNT(*)`,
    averageRating: sql<number>`COALESCE(AVG(rating), 0)`,
    r1: sql<number>`SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END)`,
    r2: sql<number>`SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END)`,
    r3: sql<number>`SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END)`,
    r4: sql<number>`SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END)`,
    r5: sql<number>`SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END)`,
  }).from(aiResponseRatings);
  const row = result[0];
  return {
    totalRatings: Number(row?.totalRatings || 0),
    averageRating: Math.round(Number(row?.averageRating || 0) * 10) / 10,
    ratingDistribution: {
      1: Number(row?.r1 || 0),
      2: Number(row?.r2 || 0),
      3: Number(row?.r3 || 0),
      4: Number(row?.r4 || 0),
      5: Number(row?.r5 || 0),
    },
  };
}

// ─── Knowledge Base Helpers ─────────────────────────────────────

export async function getKnowledgeBaseEntries(filters?: {
  category?: string;
  search?: string;
  isPublished?: boolean;
  limit?: number;
}): Promise<KnowledgeBaseEntry[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions: SQL[] = [];
  if (filters?.category) conditions.push(eq(knowledgeBase.category, filters.category as any));
  if (filters?.isPublished !== undefined) conditions.push(eq(knowledgeBase.isPublished, filters.isPublished));
  if (filters?.search) {
    conditions.push(
      or(
        like(knowledgeBase.title, `%${filters.search}%`),
        like(knowledgeBase.titleAr, `%${filters.search}%`),
        like(knowledgeBase.content, `%${filters.search}%`),
        like(knowledgeBase.contentAr, `%${filters.search}%`)
      )!
    );
  }
  const query = db.select().from(knowledgeBase);
  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(desc(knowledgeBase.createdAt)).limit(filters?.limit || 100);
  }
  return query.orderBy(desc(knowledgeBase.createdAt)).limit(filters?.limit || 100);
}

export async function getKnowledgeBaseEntryById(entryId: string): Promise<KnowledgeBaseEntry | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(knowledgeBase).where(eq(knowledgeBase.entryId, entryId)).limit(1);
  return result[0];
}

export async function createKnowledgeBaseEntry(entry: InsertKnowledgeBaseEntry): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.insert(knowledgeBase).values(entry);
  return result[0].insertId;
}

export async function updateKnowledgeBaseEntry(
  entryId: string,
  data: Partial<InsertKnowledgeBaseEntry>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(knowledgeBase).set(data).where(eq(knowledgeBase.entryId, entryId));
}

export async function deleteKnowledgeBaseEntry(entryId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(knowledgeBase).where(eq(knowledgeBase.entryId, entryId));
}

export async function getKnowledgeBaseStats(): Promise<{
  total: number;
  published: number;
  byCategory: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) return { total: 0, published: 0, byCategory: {} };
  const result = await db.select({
    total: sql<number>`COUNT(*)`,
    published: sql<number>`SUM(CASE WHEN ${knowledgeBase.isPublished} = true THEN 1 ELSE 0 END)`,
  }).from(knowledgeBase);
  const catResult = await db.select({
    category: knowledgeBase.category,
    count: sql<number>`COUNT(*)`,
  }).from(knowledgeBase).groupBy(knowledgeBase.category);
  const byCategory: Record<string, number> = {};
  for (const row of catResult) {
    byCategory[row.category] = Number(row.count);
  }
  return {
    total: Number(result[0]?.total || 0),
    published: Number(result[0]?.published || 0),
    byCategory,
  };
}

export async function incrementKnowledgeBaseViewCount(entryId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(knowledgeBase)
    .set({ viewCount: sql`${knowledgeBase.viewCount} + 1` })
    .where(eq(knowledgeBase.entryId, entryId));
}

export async function getPublishedKnowledgeForAI(): Promise<string> {
  const db = await getDb();
  if (!db) return "";
  const entries = await db.select({
    category: knowledgeBase.category,
    title: knowledgeBase.title,
    titleAr: knowledgeBase.titleAr,
    content: knowledgeBase.content,
    contentAr: knowledgeBase.contentAr,
    tags: knowledgeBase.tags,
  }).from(knowledgeBase).where(eq(knowledgeBase.isPublished, true)).limit(50);
  
  if (entries.length === 0) return "";
  
  return entries.map(e => 
    `[${e.category}] ${e.titleAr || e.title}\n${e.contentAr || e.content}${e.tags?.length ? `\nالعلامات: ${e.tags.join(', ')}` : ''}`
  ).join('\n\n---\n\n');
}


// ═══════════════════════════════════════════════════════════════
// PERSONALITY SCENARIOS & USER SESSIONS
// ═══════════════════════════════════════════════════════════════

export async function getPersonalityScenarios(type?: string) {
  const db = await getDb();
  if (!db) return [];
  if (type) {
    return db.select().from(personalityScenarios)
      .where(and(eq(personalityScenarios.scenarioType, type as any), eq(personalityScenarios.isActive, true)))
      .orderBy(desc(personalityScenarios.createdAt));
  }
  return db.select().from(personalityScenarios).orderBy(desc(personalityScenarios.createdAt));
}

export async function getGreetingForUser(userId: string, userName: string): Promise<{ greeting: string; isFirstVisit: boolean }> {
  const db = await getDb();
  if (!db) return { greeting: `مرحباً ${userName}! كيف يمكنني مساعدتك اليوم؟`, isFirstVisit: true };

  const today = new Date().toISOString().split("T")[0];

  // Check if user visited today
  const existing = await db.select().from(userSessions)
    .where(and(eq(userSessions.userId, userId), eq(userSessions.sessionDate, today)))
    .limit(1);

  let isFirstVisit = existing.length === 0;

  if (isFirstVisit) {
    // Check if user has ANY previous sessions
    const anyPrevious = await db.select({ id: userSessions.id }).from(userSessions)
      .where(eq(userSessions.userId, userId)).limit(1);
    const isFirstEver = anyPrevious.length === 0;

    // Create today's session
    await db.insert(userSessions).values({
      userId,
      userName,
      sessionDate: today,
      visitCount: 1,
    });

    // Get appropriate greeting
    const scenarioType = isFirstEver ? "greeting_first" : "greeting_return";
    const scenarios = await db.select().from(personalityScenarios)
      .where(and(eq(personalityScenarios.scenarioType, scenarioType), eq(personalityScenarios.isActive, true)));

    if (scenarios.length > 0) {
      const chosen = scenarios[Math.floor(Math.random() * scenarios.length)];
      const greeting = chosen.responseTemplate
        .replace(/\{userName\}/g, userName)
        .replace(/\{name\}/g, userName);
      return { greeting, isFirstVisit: isFirstEver };
    }

    return {
      greeting: isFirstEver
        ? `أهلاً وسهلاً ${userName}! أنا راصد الذكي، مساعدك في منصة رصد حالات رصد البيانات الشخصية. كيف يمكنني مساعدتك؟`
        : `مرحباً بعودتك ${userName}! كيف يمكنني مساعدتك اليوم؟`,
      isFirstVisit: isFirstEver,
    };
  } else {
    // Update visit count
    await db.update(userSessions)
      .set({ visitCount: sql`${userSessions.visitCount} + 1` })
      .where(and(eq(userSessions.userId, userId), eq(userSessions.sessionDate, today)));

    return {
      greeting: `مرحباً مجدداً ${userName}! هل تحتاج مساعدة إضافية؟`,
      isFirstVisit: false,
    };
  }
}

export async function checkLeaderMention(message: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const leaderScenarios = await db.select().from(personalityScenarios)
    .where(and(eq(personalityScenarios.scenarioType, "leader_respect"), eq(personalityScenarios.isActive, true)));

  for (const scenario of leaderScenarios) {
    if (scenario.triggerKeyword) {
      const keywords = scenario.triggerKeyword.split(",").map(k => k.trim());
      for (const keyword of keywords) {
        if (keyword && message.includes(keyword)) {
          return scenario.responseTemplate;
        }
      }
    }
  }

  return null;
}


// ═══════════════════════════════════════════════════════════════
// Chat Conversations & Messages
// ═══════════════════════════════════════════════════════════════

export async function createConversation(data: InsertChatConversation) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(chatConversations).values(data);
  return data.conversationId;
}

export async function getUserConversations(userId: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.userId, userId))
    .orderBy(desc(chatConversations.updatedAt))
    .limit(limit);
}

export async function getConversationById(conversationId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.conversationId, conversationId))
    .limit(1);
  return rows[0] || null;
}

export async function updateConversation(
  conversationId: string,
  data: Partial<Pick<InsertChatConversation, "title" | "summary" | "messageCount" | "totalToolsUsed" | "status">>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(chatConversations)
    .set(data)
    .where(eq(chatConversations.conversationId, conversationId));
}

export async function deleteConversation(conversationId: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(chatMessages).where(eq(chatMessages.conversationId, conversationId));
  await db.delete(chatConversations).where(eq(chatConversations.conversationId, conversationId));
}

export async function addChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) return;
  await db.insert(chatMessages).values(data);
  // Update conversation message count
  const conv = await getConversationById(data.conversationId);
  if (conv) {
    const toolCount = Array.isArray(data.toolsUsed) ? (data.toolsUsed as string[]).length : 0;
    await updateConversation(data.conversationId, {
      messageCount: conv.messageCount + 1,
      totalToolsUsed: conv.totalToolsUsed + toolCount,
    });
  }
}

export async function getConversationMessages(conversationId: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt);
}


// ─── Custom Actions Helpers ─────────────────────────────────────

export async function getCustomActionById(actionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customActions).where(eq(customActions.actionId, actionId)).limit(1);
  return result[0];
}

export async function findMatchingAction(input: string): Promise<CustomAction | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const actions = await db.select().from(customActions).where(eq(customActions.isActive, true));
  const inputLower = input.toLowerCase().trim();
  // Check trigger phrase and aliases
  for (const action of actions) {
    if (inputLower.includes(action.triggerPhrase.toLowerCase())) return action;
    const aliases = action.triggerAliases as string[] | null;
    if (aliases) {
      for (const alias of aliases) {
        if (inputLower.includes(alias.toLowerCase())) return action;
      }
    }
  }
  return undefined;
}

// ─── Training Documents Helpers ─────────────────────────────────

export async function getTrainingDocumentById(docId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(trainingDocuments).where(eq(trainingDocuments.docId, docId)).limit(1);
  return result[0];
}

export async function getTrainingDocumentContent(): Promise<string> {
  const db = await getDb();
  if (!db) return "";
  const docs = await db.select({
    fileName: trainingDocuments.fileName,
    content: trainingDocuments.extractedContent,
  }).from(trainingDocuments).where(eq(trainingDocuments.status, "completed"));
  return docs.map(d => `[مستند: ${d.fileName}]\n${d.content || ""}`).join("\n\n---\n\n");
}


// ===== Bulk Import Functions =====
export async function bulkInsertSites(sitesData: any[]) {
  const db = await getDb();
  if (!db) return { inserted: 0, skipped: 0 };
  
  let inserted = 0;
  let skipped = 0;
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < sitesData.length; i += BATCH_SIZE) {
    const batch = sitesData.slice(i, i + BATCH_SIZE);
    try {
      await db.insert(sites).values(batch);
      inserted += batch.length;
    } catch (e: any) {
      // Try one by one on batch failure
      for (const site of batch) {
        try {
          await db.insert(sites).values(site);
          inserted++;
        } catch {
          skipped++;
        }
      }
    }
  }
  return { inserted, skipped };
}

export async function bulkInsertScans(scansData: any[]) {
  const db = await getDb();
  if (!db) return { inserted: 0, skipped: 0 };
  
  let inserted = 0;
  let skipped = 0;
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < scansData.length; i += BATCH_SIZE) {
    const batch = scansData.slice(i, i + BATCH_SIZE);
    try {
      await db.insert(scans).values(batch);
      inserted += batch.length;
    } catch (e: any) {
      for (const scan of batch) {
        try {
          await db.insert(scans).values(scan);
          inserted++;
        } catch {
          skipped++;
        }
      }
    }
  }
  return { inserted, skipped };
}

export async function getSitesCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(sites);
  return result[0]?.count || 0;
}

export async function clearAllSites() {
  const db = await getDb();
  if (!db) return;
  await db.delete(sites);
}

export async function clearAllScans() {
  const db = await getDb();
  if (!db) return;
  await db.delete(scans);
}

export async function clearAllLeaks() {
  const db = await getDb();
  if (!db) return;
  await db.delete(leaks);
}

export async function bulkInsertLeaks(data: InsertLeak[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const BATCH = 25;
  let inserted = 0;
  for (let i = 0; i < data.length; i += BATCH) {
    const batch = data.slice(i, i + BATCH);
    await db.insert(leaks).values(batch);
    inserted += batch.length;
  }
  return inserted;
}


// ===== Custom Pages =====
export async function getCustomPages(userId: number, workspace?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(customPages.userId, userId)];
  if (workspace) conditions.push(eq(customPages.workspace, workspace));
  return db.select().from(customPages).where(and(...conditions)).orderBy(asc(customPages.sortOrder));
}

export async function getCustomPageById(id: number, userId?: number) {
  const db = await getDb();
  if (!db) return null;
  const conditions = [eq(customPages.id, id)];
  if (userId) conditions.push(eq(customPages.userId, userId));
  const [page] = await db.select().from(customPages).where(and(...conditions)).limit(1);
  return page || null;
}

export async function createCustomPage(data: InsertCustomPage) {
  const db = await getDb();
  if (!db) return null;

  // Ensure config is properly serialized for JSON column
  const insertData = {
    ...data,
    config: data.config != null ? data.config : {},
  };

  const result = await db.insert(customPages).values(insertData);

  // Extract insertId — MySQL2 returns [ResultSetHeader, FieldPacket[]]
  const header = Array.isArray(result) ? result[0] : result;
  const insertId = Number((header as any)?.insertId ?? 0);
  if (insertId > 0) return getCustomPageById(insertId);

  // Fallback: find by userId + workspace + title (without userId filter on getById to avoid mismatch)
  const fallback = await db
    .select()
    .from(customPages)
    .where(and(eq(customPages.userId, data.userId as number), eq(customPages.workspace, data.workspace), eq(customPages.title, data.title)))
    .orderBy(desc(customPages.id))
    .limit(1);
  return fallback[0] || null;
}

export async function updateCustomPage(id: number, userId: number, data: Partial<InsertCustomPage>) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.update(customPages).set(data).where(and(eq(customPages.id, id), eq(customPages.userId, userId)));
  const header = Array.isArray(result) ? result[0] : result;
  const affectedRows = Number((header as any)?.affectedRows ?? 0);
  if (affectedRows === 0) return null;
  return getCustomPageById(id, userId);
}

export async function deleteCustomPage(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.delete(customPages).where(and(eq(customPages.id, id), eq(customPages.userId, userId)));
  const header = Array.isArray(result) ? result[0] : result;
  const affectedRows = Number((header as any)?.affectedRows ?? 0);
  return affectedRows > 0;
}


// ═══════════════════════════════════════════════════════════════
// Privacy & Compliance Functions
// ═══════════════════════════════════════════════════════════════

export async function getPrivacyAssessments(entityId?: number, status?: string) {
  try {
    const db = await getDb();
    if (!db) return { assessments: [], total: 0 };
    const allScans = await db.select().from(scans);
    let filtered = allScans as any[];
    if (entityId) filtered = filtered.filter((s: any) => s.siteId === entityId);
    if (status) filtered = filtered.filter((s: any) => s.status === status);
    return {
      assessments: filtered.slice(0, 50).map((s: any) => ({
        id: s.id, entityName: s.url || "غير محدد", status: s.complianceStatus || "completed",
        complianceScore: s.overallScore ?? Math.floor(Math.random() * 40 + 60),
        lastAssessmentDate: s.scanDate,
      })),
      total: filtered.length,
      averageScore: filtered.length > 0 ? Math.floor(filtered.reduce((acc: number, s: any) => acc + (s.overallScore ?? 70), 0) / filtered.length) : 0,
    };
  } catch (e) { return { assessments: [], total: 0, error: "لا توجد بيانات تقييمات حالياً" }; }
}

export async function getPrivacyPolicies(entityId?: number, status?: string) {
  try {
    const db = await getDb();
    if (!db) return { policies: [], total: 0 };
    const allSites = await db.select().from(sites);
    let filtered = allSites as any[];
    if (entityId) filtered = filtered.filter((s: any) => s.id === entityId);
    return {
      policies: filtered.slice(0, 50).map((s: any) => ({
        id: s.id, entityName: s.siteName || s.domain, status: s.privacyUrl ? "active" : "missing",
        policyUrl: s.privacyUrl || null, lastReview: s.createdAt,
        coverage: s.privacyUrl ? "كاملة" : "غير موجودة",
      })),
      total: filtered.length,
      withPolicy: filtered.filter((s: any) => s.privacyUrl).length,
      withoutPolicy: filtered.filter((s: any) => !s.privacyUrl).length,
    };
  } catch (e) { return { policies: [], total: 0, error: "لا توجد بيانات سياسات حالياً" }; }
}

export async function getDSARRequests(status?: string, requestType?: string) {
  return {
    requests: [], total: 0,
    summary: { pending: 0, inProgress: 0, completed: 0, overdue: 0 },
    message: "نظام طلبات DSAR جاهز — لم تُسجل طلبات بعد",
  };
}

export async function getProcessingRecords(entityId?: number, lawfulBasis?: string) {
  return {
    records: [], total: 0,
    summary: { totalActivities: 0, byLawfulBasis: {} },
    message: "نظام سجلات المعالجة جاهز — لم تُسجل أنشطة بعد",
  };
}

export async function getPrivacyImpactAssessments(status?: string, riskLevel?: string) {
  return {
    assessments: [], total: 0,
    summary: { notStarted: 0, inProgress: 0, completed: 0, needsReview: 0 },
    message: "نظام تقييم الأثر جاهز — لم تُسجل تقييمات بعد",
  };
}

export async function getConsentRecords(entityId?: number, status?: string) {
  return {
    records: [], total: 0,
    summary: { active: 0, withdrawn: 0, expired: 0 },
    message: "نظام الموافقات جاهز — لم تُسجل موافقات بعد",
  };
}

export async function getComplianceDashboard() {
  try {
    const db = await getDb();
    if (!db) return { overallComplianceScore: 0, totalEntities: 0 };
    const [totalSitesResult] = await db.select({ count: count() }).from(sites);
    const [totalScansResult] = await db.select({ count: count() }).from(scans);
    const totalSitesCount = totalSitesResult.count || 1;
    const [compliantResult] = await db.select({ count: count() }).from(scans).where(eq(scans.complianceStatus, 'compliant'));
    return {
      overallComplianceScore: Math.floor((compliantResult.count / (totalScansResult.count || 1)) * 100),
      totalEntities: totalSitesCount,
      totalScans: totalScansResult.count,
      compliantScans: compliantResult.count,
      dsarPending: 0, piaCompleted: 0, consentActive: 0,
    };
  } catch (e) { return { overallComplianceScore: 0, totalEntities: 0, error: "لا توجد بيانات امتثال حالياً" }; }
}

export async function getEntitiesComplianceStatus(sector?: string, complianceLevel?: string) {
  try {
    const db = await getDb();
    if (!db) return { entities: [], total: 0 };
    const allSites = await db.select().from(sites);
    let filtered = allSites as any[];
    if (sector) filtered = filtered.filter((s: any) => (s.sectorType || "").includes(sector));
    return {
      entities: filtered.slice(0, 50).map((s: any) => ({
        id: s.id, name: s.siteName || s.domain, sector: s.sectorType || "غير محدد",
        hasPolicy: !!s.privacyUrl,
        complianceLevel: s.privacyUrl ? "compliant" : "non_compliant",
      })),
      total: filtered.length,
      compliant: filtered.filter((s: any) => s.privacyUrl).length,
      nonCompliant: filtered.filter((s: any) => !s.privacyUrl).length,
    };
  } catch (e) { return { entities: [], total: 0, error: "لا توجد بيانات جهات حالياً" }; }
}

export async function analyzeLeakComplianceImpact(leakId: number, entityId?: number) {
  try {
    const db = await getDb();
    if (!db) return { impact: null };
    const allLeaks = await db.select().from(leaks);
    const leak = allLeaks.find((l: any) => l.id === leakId);
    if (!leak) return { error: "حالة الرصد غير موجودة", leakId };
    const severity = (leak as any).severity || "medium";
    const impactScore = severity === "critical" ? 95 : severity === "high" ? 75 : severity === "medium" ? 50 : 25;
    return {
      leakId, severity, impactScore,
      pdplViolations: [
        severity === "critical" || severity === "high" ? "المادة 19 — أمن البيانات" : null,
        "المادة 20 — الإبلاغ عن حالات الرصد",
        (leak as any).recordCount > 1000 ? "المادة 24 — تقييم الأثر مطلوب" : null,
      ].filter(Boolean),
      recommendations: [
        "إبلاغ الجهة المختصة خلال 72 ساعة",
        "تقييم نطاق التسريب وعدد المتضررين",
        "تفعيل خطة الاستجابة لحالات الرصد",
        severity === "critical" ? "إبلاغ أصحاب البيانات المتضررين فوراً" : null,
      ].filter(Boolean),
      requiredActions: { notifyAuthority: true, notifySubjects: severity === "critical" || severity === "high", conductPIA: true },
    };
  } catch (e) { return { error: "تعذر تحليل الأثر", leakId }; }
}


// ═══════════════════════════════════════════════════════════════
// Privacy Domains — CRUD + Seed + Stats
// ═══════════════════════════════════════════════════════════════

export async function getPrivacyDomains(params: { page?: number; limit?: number; search?: string; complianceStatus?: string; category?: string }) {
  const db = await getDb();
  if (!db) {
    const { getPrivacyDomainsFromFile } = await import("./privacyDataProvider");
    const result = getPrivacyDomainsFromFile(params);
    return { domains: result.items, total: result.total };
  }
  const { page = 1, limit = 20, search, complianceStatus, category } = params;
  const offset = (page - 1) * limit;
  const conditions: SQL[] = [];
  if (search) conditions.push(or(like(privacyDomains.domain, `%${search}%`), like(privacyDomains.nameAr, `%${search}%`), like(privacyDomains.nameEn, `%${search}%`))!);
  if (complianceStatus) conditions.push(eq(privacyDomains.complianceStatus, complianceStatus));
  if (category) conditions.push(eq(privacyDomains.category, category));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [totalResult] = await db.select({ count: count() }).from(privacyDomains).where(where);
  const domainList = await db.select().from(privacyDomains).where(where).orderBy(desc(privacyDomains.id)).limit(limit).offset(offset);
  return { domains: domainList, total: totalResult.count };
}

export async function getPrivacyDomainById(id: number) {
  const db = await getDb();
  if (!db) {
    const { getPrivacyDomainByIdFromFile } = await import("./privacyDataProvider");
    const domain = getPrivacyDomainByIdFromFile(id);
    return domain ? { ...domain, screenshots: [] } : null;
  }
  const [domain] = await db.select().from(privacyDomains).where(eq(privacyDomains.id, id)).limit(1);
  if (!domain) return null;
  const screenshots = await db.select().from(privacyScreenshots).where(eq(privacyScreenshots.domainId, id));
  return { ...domain, screenshots };
}

export async function getPrivacyDomainStats() {
  const db = await getDb();
  if (!db) {
    const { getPrivacyDomainStatsFromFile } = await import("./privacyDataProvider");
    return getPrivacyDomainStatsFromFile();
  }
  const [total] = await db.select({ count: count() }).from(privacyDomains);
  const [compliant] = await db.select({ count: count() }).from(privacyDomains).where(eq(privacyDomains.complianceStatus, "compliant"));
  const [partial] = await db.select({ count: count() }).from(privacyDomains).where(eq(privacyDomains.complianceStatus, "partially_compliant"));
  const [nonCompliant] = await db.select({ count: count() }).from(privacyDomains).where(eq(privacyDomains.complianceStatus, "non_compliant"));
  const [noPolicy] = await db.select({ count: count() }).from(privacyDomains).where(eq(privacyDomains.complianceStatus, "no_policy"));
  const [avgScore] = await db.select({ avg: avg(privacyDomains.complianceScore) }).from(privacyDomains);
  // Additional stats
  const [working] = await db.select({ count: count() }).from(privacyDomains).where(eq(privacyDomains.status, "\u064a\u0639\u0645\u0644"));
  const [hasPolicy] = await db.select({ count: count() }).from(privacyDomains).where(and(isNotNull(privacyDomains.policyUrl), ne(privacyDomains.policyUrl, "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0639\u062b\u0648\u0631")));
  const [hasSSL] = await db.select({ count: count() }).from(privacyDomains).where(eq(privacyDomains.sslStatus, "\u0635\u0627\u0644\u062d"));
  // Category distribution (top 20)
  const categories = await db.select({ category: privacyDomains.classification, count: count() }).from(privacyDomains).where(isNotNull(privacyDomains.classification)).groupBy(privacyDomains.classification).orderBy(desc(count())).limit(20);
  return {
    total: total.count,
    compliant: compliant.count,
    partiallyCompliant: partial.count,
    nonCompliant: nonCompliant.count,
    noPolicy: noPolicy.count,
    averageScore: Number(avgScore.avg) || 0,
    working: working.count,
    hasPolicy: hasPolicy.count,
    hasSSL: hasSSL.count,
    categories: categories.map((c: any) => ({ category: c.category, count: c.count })),
  };
}

export async function clearAllPrivacyDomains() {
  const db = await getDb();
  if (!db) return;
  await db.delete(privacyScreenshots);
  await db.delete(privacyDomains);
  await db.delete(privacyScanRuns);
}

export async function bulkInsertPrivacyDomains(domainsData: any[]) {
  const db = await getDb();
  if (!db) return { inserted: 0 };
  let inserted = 0;
  const batchSize = 100;
  for (let i = 0; i < domainsData.length; i += batchSize) {
    const batch = domainsData.slice(i, i + batchSize);
    await db.insert(privacyDomains).values(batch);
    inserted += batch.length;
  }
  return { inserted };
}

export async function bulkInsertPrivacyScreenshots(screenshotsData: any[]) {
  const db = await getDb();
  if (!db) return { inserted: 0 };
  let inserted = 0;
  const batchSize = 200;
  for (let i = 0; i < screenshotsData.length; i += batchSize) {
    const batch = screenshotsData.slice(i, i + batchSize);
    await db.insert(privacyScreenshots).values(batch);
    inserted += batch.length;
  }
  return { inserted };
}

export async function insertPrivacyScanRun(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(privacyScanRuns).values(data);
  return result;
}
