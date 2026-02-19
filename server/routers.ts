import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, rootAdminProcedure, assertNotRootAdmin, router } from "./_core/trpc";
// Root admin user ID for permission checks
const ROOT_ADMIN_USER_ID = "mruhaily";
// ═══ PROTECTED ROOT ADMINS — Cannot be deleted, downgraded, or deactivated ═══
const PROTECTED_ROOT_ADMINS = ["mruhaily", "aalrebdi", "msarhan", "malmoutaz"];
function isProtectedAdmin(userId: string): boolean {
  return PROTECTED_ROOT_ADMINS.includes(userId.toLowerCase());
}
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import ExcelJS from "exceljs";
import { createProfessionalExcel, statusToArabic, boolToCompliance, type ExcelSheetData } from "./excelHelper";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";
import { ONE_YEAR_MS } from "@shared/const";
import { storagePut } from "./storage";
import PptxGenJS from "pptxgenjs";
import cron from "node-cron";
import { notifyOwner } from "./_core/notification";
import { processChat, getGreeting, learnFromDocument, RASID_AVATAR, RASID_AVATAR_ALT, RASID_AVATAR_ALT2 } from "./aiAssistant";
import { startDeepScanJob, pauseScan, resumeScan, cancelScan, getActiveScanJobId, isScanPaused, deepScanDomain, setFastScanMode } from "./deepScanner";
import { processSmartRasidQuery, searchKnowledge, generateEmbedding } from "./_core/rag";
import { broadcastNotification } from "./websocket";
import { triggerJob, toggleJobStatus } from "./scheduler";
import { enrichLeak, enrichAllPending } from "./enrichment";
import { executeRetentionPolicies, previewRetention } from "./retention";
import { executeScan, quickScan } from "./scanEngine";
import { rasidAIChat } from "./rasidAI";
import { adminRouter } from "./adminRouter";
import { cmsRouter } from "./cmsRouter";
import { controlPanelRouter } from "./controlPanelRouter";
import { settingsRouter } from "./settingsRouter";
import { operationsRouter } from "./operationsRouter";
import {
  aiChatSessions, aiChatMessages, aiRatings, aiSearchLog,
  aiScenarios, aiCustomCommands, knowledgeBase,
  platformSettings, pageConfigs, themeSettings, contentBlocks, dataTransferLogs,
  sites, scans, users, letters, cases
} from "../drizzle/schema";
import { eq, desc, asc, and, count, sql, like, or } from "drizzle-orm";

// Import P1 db functions directly (P1 code uses direct references, not db.* prefix)
import {
  getLeaks, getLeakById, createLeak, updateLeakStatus,
  getChannels, savePiiScan, getPiiScans,
  getDarkWebListings, getPasteEntries, getDashboardStats,
  getAllUsers, updateUserRole, getAuditLogs, exportAuditLogsCsv,
  createNotification,
  getMonitoringJobs, getMonitoringJobById,
  getRetentionPolicies, updateRetentionPolicy,
  getThreatMapData, getThreatRules, getThreatRuleById, createThreatRule, toggleThreatRule,
  getEvidenceChain, createEvidenceEntry, getEvidenceStats,
  getSellerProfiles, getSellerById, createSellerProfile, updateSellerProfile,
  getOsintQueries, createOsintQuery,
  getFeedbackEntries, createFeedbackEntry, getFeedbackStats,
  getKnowledgeGraphData,
  getPlatformUserByUserId, getPlatformUserById, getAllPlatformUsers,
  createPlatformUser, updatePlatformUser, deletePlatformUser,
  createAiRating, getAiRatings, getAiRatingStats,
  getKnowledgeBaseEntries, getKnowledgeBaseEntryById,
  createKnowledgeBaseEntry, updateKnowledgeBaseEntry, deleteKnowledgeBaseEntry,
  getKnowledgeBaseStats, incrementKnowledgeBaseViewCount,
  getAllPersonalityScenarios, createPersonalityScenario,
  updatePersonalityScenario, deletePersonalityScenario,
  getGreetingForUser, checkLeaderMention,
} from "./db";

function getAuthUser(ctx: { user: any; platformUser?: any }) {
  if (ctx.platformUser) {
    return {
      id: ctx.platformUser.id as number,
      name: (ctx.platformUser.displayName ?? ctx.platformUser.name) as string,
    };
  }
  return {
    id: (ctx.user?.id ?? 0) as number,
    name: (ctx.user?.name ?? "System") as string,
  };
}

const { logAudit, updateConversation, deleteConversation, getConversationById, getUserConversations, getConversationMessages, createConversation, addChatMessage } = db as any;

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  cms: cmsRouter,
  controlPanel: controlPanelRouter,
  adminSettings: settingsRouter,
  operations: operationsRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      // Log logout activity if user is authenticated
      if (ctx.user) {
        await db.insertActivityLog({
          userId: ctx.user.id,
          username: ctx.user.name || '',
          action: 'logout',
          details: `تسجيل خروج: ${ctx.user.name || 'unknown'}`,
          ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
          userAgent: ctx.req.headers['user-agent'] || '',
        });
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    builtinLogin: publicProcedure.input(z.object({
      username: z.string().min(1),
      password: z.string().min(1),
      rememberMe: z.boolean().optional().default(false),
    })).mutation(async ({ input, ctx }) => {
      // Try platformUsers table first (where seed data lives)
      const pUser = await getPlatformUserByUserId(input.username.toUpperCase()) || await getPlatformUserByUserId(input.username);
      if (pUser && pUser.passwordHash) {
        const valid = await bcrypt.compare(input.password, pUser.passwordHash);
        if (!valid) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        if (pUser.status !== 'active') throw new TRPCError({ code: 'UNAUTHORIZED', message: 'الحساب معطل' });
        const secret = new TextEncoder().encode(ENV.cookieSecret);
        const token = await new SignJWT({ platformUserId: pUser.id, userId: pUser.userId })
          .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
          .setExpirationTime(Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000))
          .sign(secret);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie('platform_session', token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
        await updatePlatformUser(pUser.id, { lastLoginAt: new Date() });
        return {
          success: true,
          user: {
            id: pUser.id,
            name: pUser.name,
            displayName: pUser.displayName,
            email: pUser.email,
            mobile: pUser.mobile,
            role: pUser.platformRole === 'root_admin' ? 'admin' as const : 'user' as const,
            rasidRole: pUser.platformRole === 'root_admin' ? 'root' as const : 'monitoring_officer' as const,
            username: pUser.userId,
          },
        };
      }
      // Fallback to users table
      const user = await db.getUserByUsername(input.username);
      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
      }
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
      }
      await db.updateLastSignedIn(user.id);
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const token = await new SignJWT({ platformUserId: user.id, userId: user.username || '' })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000))
        .sign(secret);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie('platform_session', token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          displayName: user.displayName,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          rasidRole: user.rasidRole,
          username: user.username,
        },
      };
    }),
  }),

  dashboard: router({
    stats: publicProcedure.query(async () => {
      // Return leak-based stats for the monitoring dashboard
      const allLeaks = await db.getLeaks();
      const totalLeaks = allLeaks.length;
      const totalRecords = allLeaks.reduce((s: number, l: any) => s + (l.recordCount || 0), 0);
      const newLeaks = allLeaks.filter((l: any) => l.status === 'new').length;
      const analyzingLeaks = allLeaks.filter((l: any) => l.status === 'analyzing').length;
      const documentedLeaks = allLeaks.filter((l: any) => l.status === 'documented').length;
      const completedLeaks = allLeaks.filter((l: any) => l.status === 'reported').length;
      const enrichedLeaks = allLeaks.filter((l: any) => l.enrichedAt).length;
      // PII distribution
      const piiMap: Record<string, number> = {};
      allLeaks.forEach((l: any) => { ((l.piiTypes as string[]) || []).forEach((t: string) => { piiMap[t] = (piiMap[t] || 0) + 1; }); });
      const piiDistribution = Object.entries(piiMap).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
      // Sector distribution
      const secMap: Record<string, number> = {};
      allLeaks.forEach((l: any) => { const s = l.sectorAr || l.sector || 'غير محدد'; secMap[s] = (secMap[s] || 0) + 1; });
      const sectorDistribution = Object.entries(secMap).map(([sector, count]) => ({ sector, count })).sort((a, b) => b.count - a.count);
      // Source distribution
      const srcMap: Record<string, number> = {};
      allLeaks.forEach((l: any) => { const s = l.source || 'unknown'; srcMap[s] = (srcMap[s] || 0) + 1; });
      const sourceDistribution = Object.entries(srcMap).map(([source, count]) => ({ source, count }));
      // Monthly trend
      const monthMap: Record<string, number> = {};
      allLeaks.forEach((l: any) => { const d = l.detectedAt ? new Date(l.detectedAt) : new Date(l.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; monthMap[key] = (monthMap[key] || 0) + 1; });
      const monthlyTrend = Object.entries(monthMap).sort().map(([month, count]) => ({ month, count }));
      // Recent leaks
      const recentLeaks = allLeaks.slice(0, 10);
      return {
        totalLeaks, totalRecords, newLeaks, analyzingLeaks, documentedLeaks, completedLeaks, enrichedLeaks,
        distinctPiiTypes: Object.keys(piiMap).length,
        distinctSectors: Object.keys(secMap).length,
        piiDistribution, sectorDistribution, sourceDistribution, monthlyTrend, recentLeaks,
        telegramLeaks: allLeaks.filter((l: any) => l.source === 'telegram').length,
        darkwebLeaks: allLeaks.filter((l: any) => l.source === 'darkweb').length,
        pasteLeaks: allLeaks.filter((l: any) => l.source === 'paste').length,
      };
    }),
    clauseStats: publicProcedure.query(async () => {
      return await db.getClauseStats();
    }),
    recentScans: publicProcedure.query(async () => {
      return await db.getRecentScans(10);
    }),
    classificationStats: publicProcedure.query(async () => {
      return await db.getClassificationStats();
    }),
    sectorCompliance: publicProcedure.query(async () => {
      return await db.getSectorCompliance();
    }),
    // Filtered dashboard endpoints
    statsFiltered: publicProcedure.input(z.object({
      sector: z.string().optional(),
      timePeriod: z.string().optional(),
    })).query(async ({ input }) => {
      return await db.getDashboardStatsFiltered(input);
    }),
    clauseStatsFiltered: publicProcedure.input(z.object({
      sector: z.string().optional(),
      timePeriod: z.string().optional(),
    })).query(async ({ input }) => {
      return await db.getClauseStatsFiltered(input);
    }),
    sectorComplianceFiltered: publicProcedure.input(z.object({
      sector: z.string().optional(),
      timePeriod: z.string().optional(),
    })).query(async ({ input }) => {
      return await db.getSectorComplianceFiltered(input);
    }),
    complianceTrend: publicProcedure.input(z.object({
      months: z.number().optional().default(12),
    })).query(async ({ input }) => {
      return await db.getComplianceTrendData(input.months);
    }),
    sectors: publicProcedure.query(async () => {
      return await db.getAllSectors();
    }),
    statsBySectorType: publicProcedure.query(async () => {
      return await db.getDashboardStatsBySectorType();
    }),
    clauseStatsBySectorType: publicProcedure.query(async () => {
      return await db.getClauseStatsBySectorType();
    }),
    statsBySectorAndCategory: publicProcedure.query(async () => {
      return await db.getDashboardStatsBySectorAndCategory();
    }),
    clauseStatsBySectorAndCategory: publicProcedure.query(async () => {
      return await db.getClauseStatsBySectorAndCategory();
    }),
    monthlyComparison: publicProcedure.query(async () => {
      // Merge both data sources: getMonthlyComparison (for MonthlyComparison component)
      // and getMonthlyComparisonStats (for PresentationMode component)
      const [leakData, scanData] = await Promise.all([
        db.getMonthlyComparison(),
        db.getMonthlyComparisonStats(),
      ]);
      // Return merged object with all fields both consumers need
      return {
        ...leakData,
        // Fields from scanData needed by PresentationMode
        totalSites: scanData?.totalSites ?? 0,
        newSitesThisMonth: scanData?.newSitesThisMonth ?? 0,
        newSitesLastMonth: scanData?.newSitesLastMonth ?? 0,
        sitesChange: scanData?.sitesChange ?? 0,
        newScansThisMonth: scanData?.thisMonth?.totalScans ?? 0,
        changes: scanData?.changes ?? { totalScans: 0, compliant: 0, partiallyCompliant: 0, nonCompliant: 0, noPolicy: 0 },
      };
    }),
    exportExcel: protectedProcedure.input(z.object({
      type: z.enum(['overview', 'clauses', 'sectors', 'categories', 'all', 'filtered']),
      complianceStatus: z.string().optional(),
      sectorType: z.string().optional(),
      classification: z.string().optional(),
      title: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const sheets: ExcelSheetData[] = [];
      if (input.type === 'overview' || input.type === 'all') {
        const stats = await db.getDashboardStats();
        const s = stats as any;
        const total = Number(s?.totalScans) || 1;
        sheets.push({
          name: 'الرصد العام',
          columns: [
            { header: 'المؤشر', key: 'indicator', width: 30 },
            { header: 'القيمة', key: 'value', width: 15 },
            { header: 'النسبة', key: 'percentage', width: 15 },
          ],
          rows: [
            { indicator: 'إجمالي المواقع', value: Number(s?.totalSites) || 0, percentage: '100%' },
            { indicator: 'إجمالي الفحوصات', value: Number(s?.totalScans) || 0, percentage: '100%' },
            { indicator: 'ممتثل', value: Number(s?.compliant) || 0, percentage: `${Math.round((Number(s?.compliant) || 0) / total * 100)}%` },
            { indicator: 'غير ممتثل', value: Number(s?.nonCompliant) || 0, percentage: `${Math.round((Number(s?.nonCompliant) || 0) / total * 100)}%` },
            { indicator: 'ممتثل جزئياً', value: Number(s?.partiallyCompliant) || 0, percentage: `${Math.round((Number(s?.partiallyCompliant) || 0) / total * 100)}%` },
            { indicator: 'لا يعمل', value: Number(s?.noPolicy) || 0, percentage: `${Math.round((Number(s?.noPolicy) || 0) / total * 100)}%` },
          ],
        });
      }
      if (input.type === 'clauses' || input.type === 'all') {
        const clauseData = await db.getClauseStats();
        sheets.push({
          name: 'بنود المادة 12',
          columns: [
            { header: 'رقم البند', key: 'clause', width: 12 },
            { header: 'اسم البند', key: 'name', width: 40 },
            { header: 'عدد الممتثلين', key: 'compliant', width: 18 },
            { header: 'الإجمالي', key: 'total', width: 12 },
            { header: 'نسبة الامتثال', key: 'percentage', width: 18 },
          ],
          rows: (clauseData as any[]).map((c: any) => ({ clause: c.clause, name: c.name, compliant: c.compliant, total: c.total, percentage: `${c.percentage}%` })),
        });
      }
      if (input.type === 'sectors' || input.type === 'all') {
        const sectorData = await db.getDashboardStatsBySectorType();
        sheets.push({
          name: 'حسب القطاع',
          columns: [
            { header: 'القطاع', key: 'sector', width: 18 },
            { header: 'إجمالي المواقع', key: 'totalSites', width: 18 },
            { header: 'ممتثل', key: 'compliant', width: 12 },
            { header: 'ممتثل جزئياً', key: 'partial', width: 18 },
            { header: 'غير ممتثل', key: 'nonCompliant', width: 15 },
            { header: 'لا يعمل', key: 'noPolicy', width: 12 },
            { header: 'نسبة الامتثال', key: 'rate', width: 18 },
          ],
          rows: (sectorData as any[]).map((r: any) => {
            const t = Number(r.compliant) + Number(r.partiallyCompliant) + Number(r.nonCompliant) + Number(r.noPolicy);
            return { sector: r.sectorType === 'public' ? 'قطاع عام' : 'قطاع خاص', totalSites: Number(r.totalSites) || 0, compliant: Number(r.compliant) || 0, partial: Number(r.partiallyCompliant) || 0, nonCompliant: Number(r.nonCompliant) || 0, noPolicy: Number(r.noPolicy) || 0, rate: t > 0 ? `${Math.round((Number(r.compliant) / t) * 100)}%` : '0%' };
          }),
        });
      }
      if (input.type === 'categories' || input.type === 'all') {
        const catData = await db.getDashboardStatsBySectorAndCategory();
        sheets.push({
          name: 'حسب الفئة',
          columns: [
            { header: 'القطاع', key: 'sector', width: 15 },
            { header: 'الفئة', key: 'category', width: 25 },
            { header: 'إجمالي المواقع', key: 'totalSites', width: 18 },
            { header: 'ممتثل', key: 'compliant', width: 12 },
            { header: 'ممتثل جزئياً', key: 'partial', width: 18 },
            { header: 'غير ممتثل', key: 'nonCompliant', width: 15 },
            { header: 'لا يعمل', key: 'noPolicy', width: 12 },
            { header: 'نسبة الامتثال', key: 'rate', width: 18 },
          ],
          rows: (catData as any[]).map((r: any) => {
            const t = Number(r.compliant) + Number(r.partiallyCompliant) + Number(r.nonCompliant) + Number(r.noPolicy);
            return { sector: r.sectorType === 'public' ? 'قطاع عام' : 'قطاع خاص', category: r.category || 'غير مصنف', totalSites: Number(r.totalSites) || 0, compliant: Number(r.compliant) || 0, partial: Number(r.partiallyCompliant) || 0, nonCompliant: Number(r.nonCompliant) || 0, noPolicy: Number(r.noPolicy) || 0, rate: t > 0 ? `${Math.round((Number(r.compliant) / t) * 100)}%` : '0%' };
          }),
        });
      }
      if (input.type === 'filtered') {
        const exportData = await db.getExportData('summary') as any[];
        let filtered = exportData || [];
        if (input.complianceStatus) filtered = filtered.filter((r: any) => r.complianceStatus === input.complianceStatus);
        if (input.sectorType) {
          const sitesResult = await db.getSites({ sectorType: input.sectorType, limit: 99999 });
          const domains = new Set((sitesResult?.sites || []).map((s: any) => s.domain));
          filtered = filtered.filter((r: any) => domains.has(r.domain));
        }
        sheets.push({
          name: input.title || 'بيانات مفلترة',
          columns: [
            { header: 'النطاق', key: 'domain', width: 30 },
            { header: 'الاسم', key: 'siteName', width: 25 },
            { header: 'التصنيف', key: 'classification', width: 18 },
            { header: 'النتيجة', key: 'score', width: 12 },
            { header: 'حالة الامتثال', key: 'status', width: 18 },
            { header: 'بند 1', key: 'c1', width: 12 },
            { header: 'بند 2', key: 'c2', width: 12 },
            { header: 'بند 3', key: 'c3', width: 12 },
            { header: 'بند 4', key: 'c4', width: 12 },
            { header: 'بند 5', key: 'c5', width: 12 },
            { header: 'بند 6', key: 'c6', width: 12 },
            { header: 'بند 7', key: 'c7', width: 12 },
            { header: 'بند 8', key: 'c8', width: 12 },
          ],
          rows: filtered.map((r: any) => ({
            domain: r.domain, siteName: r.siteName || '', classification: r.classification || '',
            score: r.overallScore ?? 0, status: statusToArabic(r.complianceStatus),
            c1: boolToCompliance(r.clause1Compliant), c2: boolToCompliance(r.clause2Compliant),
            c3: boolToCompliance(r.clause3Compliant), c4: boolToCompliance(r.clause4Compliant),
            c5: boolToCompliance(r.clause5Compliant), c6: boolToCompliance(r.clause6Compliant),
            c7: boolToCompliance(r.clause7Compliant), c8: boolToCompliance(r.clause8Compliant),
          })),
        });
      }
      const buffer = await createProfessionalExcel({
        title: input.type === 'all' ? 'تقرير لوحة المتابعة الشامل' : input.type === 'overview' ? 'تقرير الرصد العام' : input.type === 'clauses' ? 'تقرير بنود المادة 12' : input.type === 'sectors' ? 'تقرير القطاعات' : input.type === 'categories' ? 'تقرير التصنيفات' : input.title || 'تقرير بيانات مفلترة',
        userName: ctx.user?.name || ctx.user?.displayName || 'مستخدم',
        userRole: ctx.user?.rasidRole || ctx.user?.role || 'user',
        sheets,
      });
      const base64 = buffer.toString('base64');
      const filename = `rasid-dashboard-${input.type}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      return { base64, filename };
    }),
  }),

  sites: router({
    list: publicProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      search: z.string().optional(),
      status: z.string().optional(),
      classification: z.string().optional(),
      complianceStatus: z.string().optional(),
      sectorType: z.string().optional(),
    })).query(async ({ input }) => {
      return await db.getSites(input);
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getSiteById(input.id);
    }),
    getByDomain: publicProcedure.input(z.object({ domain: z.string() })).query(async ({ input }) => {
      return await db.getSiteByDomain(input.domain);
    }),
  }),

  scans: router({
    list: publicProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      status: z.string().optional(),
    })).query(async ({ input }) => {
      return await db.getScans(input);
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getScanById(input.id);
    }),
    newScan: protectedProcedure.input(z.object({
      url: z.string(),
    })).mutation(async ({ input, ctx }) => {
      // Extract domain
      let domain = input.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

      // Step 0: Capture screenshot of the site
      let screenshotUrl: string | null = null;
      try {
        screenshotUrl = await captureScreenshot(input.url, domain);
      } catch (e) {
        console.warn('Screenshot capture failed:', e);
      }

      // Step 1: Use the advanced deep scanner with all 20 strategies + AI analysis
      setFastScanMode(false); // Enable full AI analysis for individual scans
      let scanResult;
      try {
        scanResult = await deepScanDomain(domain);
      } finally {
        setFastScanMode(true); // Re-enable fast mode for batch scans
      }

      // Step 2: Save site if not exists
      let site = await db.getSiteByDomain(domain);
      if (!site) {
        await db.insertSite({
          domain,
          siteName: scanResult.siteName || domain,
          siteStatus: scanResult.siteReachable ? 'active' : 'inactive',
          privacyUrl: scanResult.privacyUrl || null,
          contactUrl: scanResult.contactUrl || null,
          emails: scanResult.contactEmails || null,
          classification: 'سعودي عام',
          screenshotUrl: screenshotUrl || scanResult.screenshotUrl || undefined,
        });
        site = await db.getSiteByDomain(domain);
      } else {
        // Update site with latest scan data
        await db.updateSite(site.id, {
          privacyUrl: scanResult.privacyUrl || site.privacyUrl || null,
          contactUrl: scanResult.contactUrl || site.contactUrl || null,
          emails: scanResult.contactEmails || site.emails || null,
          siteStatus: scanResult.siteReachable ? 'active' : site.siteStatus,
          screenshotUrl: screenshotUrl || scanResult.screenshotUrl || site.screenshotUrl || undefined,
        });
      }

      if (!site) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create site' });

       // Step 3: Save scan using deepScanDomain results (already includes AI analysis)
      const score = scanResult.overallScore || 0;
      const status = scanResult.complianceStatus === 'error' ? 'non_compliant' as const : scanResult.complianceStatus;
      await db.insertScan({
        siteId: site.id,
        domain,
        overallScore: score,
        rating: scanResult.rating || (status === 'no_policy' ? 'غير ممتثل' : 'ضعيف'),
        complianceStatus: status,
        summary: scanResult.summary || (status === 'no_policy' ? 'الموقع لا يحتوي على صفحة سياسة خصوصية' : 'تحليل غير مكتمل'),
        clause1Compliant: scanResult.clause1Compliant || false,
        clause1Evidence: scanResult.clause1Evidence || '',
        clause2Compliant: scanResult.clause2Compliant || false,
        clause2Evidence: scanResult.clause2Evidence || '',
        clause3Compliant: scanResult.clause3Compliant || false,
        clause3Evidence: scanResult.clause3Evidence || '',
        clause4Compliant: scanResult.clause4Compliant || false,
        clause4Evidence: scanResult.clause4Evidence || '',
        clause5Compliant: scanResult.clause5Compliant || false,
        clause5Evidence: scanResult.clause5Evidence || '',
        clause6Compliant: scanResult.clause6Compliant || false,
        clause6Evidence: scanResult.clause6Evidence || '',
        clause7Compliant: scanResult.clause7Compliant || false,
        clause7Evidence: scanResult.clause7Evidence || '',
        clause8Compliant: scanResult.clause8Compliant || false,
        clause8Evidence: scanResult.clause8Evidence || '',
        recommendations: scanResult.recommendations || [],
        screenshotUrl: screenshotUrl || scanResult.screenshotUrl || undefined,
        scannedBy: ctx.user.id,
      });

      // Log scan activity
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'scan_site',
        details: `تم فحص الموقع: ${domain} - النتيجة: ${score}%`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });

      // Step 5: Detect compliance change and create alert
      try {
        const previousScan = await db.getLatestScanForSite(site.id);
        if (previousScan && previousScan.complianceStatus !== status) {
          // Compliance status changed - create alert
          await db.createComplianceAlert({
            siteId: site.id,
            domain,
            previousStatus: previousScan.complianceStatus,
            newStatus: status,
            previousScore: previousScan.overallScore,
            newScore: score,
          });
          // Also notify owner
          const { notifyOwner } = await import('./_core/notification');
          const statusLabels: Record<string, string> = {
            compliant: 'ممتثل', partially_compliant: 'ممتثل جزئياً',
            non_compliant: 'غير ممتثل', no_policy: 'غير ممتثل', not_working: 'لا يعمل',
          };
          await notifyOwner({
            title: `تغيّر حالة امتثال: ${domain}`,
            content: `تغيّرت حالة امتثال الموقع ${domain} من "${statusLabels[previousScan.complianceStatus || ''] || 'غير معروف'}" إلى "${statusLabels[status]}". النتيجة: ${score}%`,
          }).catch(() => {});
          
          // Record compliance change notification
          await db.insertComplianceChangeNotification({
            siteId: site.id,
            domain,
            previousStatus: previousScan.complianceStatus || null,
            newStatus: status,
            previousScore: previousScan.overallScore || 0,
            newScore: score,
          });
          
          // Send email notifications to users with email alerts enabled
          try {
            const { sendNotificationEmail, isEmailConfigured, buildRasidEmailTemplate, sendEmail } = await import('./email');
            if (isEmailConfigured()) {
              const usersToNotify = await db.getUsersWithEmailNotifications();
              const prevLabel = statusLabels[previousScan.complianceStatus || ''] || 'غير معروف';
              const newLabel = statusLabels[status];
              const scoreChange = score - (previousScan.overallScore || 0);
              const scoreChangeText = scoreChange > 0 ? `+${scoreChange}` : `${scoreChange}`;
              const isImproved = score > (previousScan.overallScore || 0);
              
              for (const u of usersToNotify) {
                if (u.email) {
                  const html = buildRasidEmailTemplate({
                    title: `تغيّر حالة امتثال: ${domain}`,
                    body: `
                      <p>مرحباً ${u.displayName || u.name || ''},</p>
                      <p>تم رصد تغيير في حالة امتثال الموقع <strong>${domain}</strong>.</p>
                      <table>
                        <tr><th>الموقع</th><td>${domain}</td></tr>
                        <tr><th>الحالة السابقة</th><td style="color: ${isImproved ? '#ef4444' : '#22c55e'}">${prevLabel} (${previousScan.overallScore || 0}%)</td></tr>
                        <tr><th>الحالة الجديدة</th><td style="color: ${isImproved ? '#22c55e' : '#ef4444'}">${newLabel} (${score}%)</td></tr>
                        <tr><th>التغيير</th><td style="color: ${isImproved ? '#22c55e' : '#ef4444'}; font-weight: bold">${scoreChangeText}% ${isImproved ? '↑ تحسن' : '↓ تراجع'}</td></tr>
                        <tr><th>تاريخ الفحص</th><td>${new Date().toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
                      </table>
                      ${!isImproved ? '<p style="color: #ef4444; font-weight: bold">⚠️ يرجى الانتباه: تراجع في مستوى الامتثال</p>' : '<p style="color: #22c55e; font-weight: bold">✅ تحسن في مستوى الامتثال</p>'}
                    `,
                  });
                  await sendEmail({
                    to: u.email,
                    subject: `${isImproved ? '✅' : '⚠️'} تغيّر امتثال: ${domain} - ${newLabel}`,
                    html,
                  }).catch(() => {});
                }
              }
            }
          } catch (emailErr) {
            console.warn('Failed to send compliance change emails:', emailErr);
          }
        }
      } catch (alertErr) {
        console.warn('Failed to create compliance alert:', alertErr);
      }

      return {
        domain,
        status,
        score,
        rating: scanResult.rating || 'غير ممتثل',
        privacyUrl: scanResult.privacyUrl,
        siteId: site.id,
      };
    }),
  }),

  clauses: router({
    detail: publicProcedure.input(z.object({
      clauseNum: z.number().min(1).max(8),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      compliant: z.boolean().optional(),
    })).query(async ({ input }) => {
      return await db.getClauseDetail(input.clauseNum, input);
    }),
  }),

  letters: router({
    list: protectedProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      status: z.string().optional(),
    })).query(async ({ input }) => {
      return await db.getLetters(input);
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getLetterById(input.id);
    }),
    create: protectedProcedure.input(z.object({
      siteId: z.number(),
      scanId: z.number().optional(),
      recipientEmail: z.string(),
      subject: z.string(),
      body: z.string(),
    })).mutation(async ({ input, ctx }) => {
      return await db.insertLetter({
        ...input,
        createdBy: ctx.user.id,
        status: 'draft',
      });
    }),
    updateStatus: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.string(),
    })).mutation(async ({ input }) => {
      return await db.updateLetterStatus(input.id, input.status);
    }),
    generateLetter: protectedProcedure.input(z.object({
      siteId: z.number(),
      scanId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      const scan = await db.getScanById(input.scanId);
      if (!scan) throw new TRPCError({ code: 'NOT_FOUND', message: 'الفحص غير موجود' });

      const site = await db.getSiteById(input.siteId);
      if (!site) throw new TRPCError({ code: 'NOT_FOUND', message: 'الموقع غير موجود' });

      const missingClauses = [];
      const clauseNames = [
        'تحديد الغرض من جمع البيانات الشخصية',
        'تحديد محتوى البيانات الشخصية المطلوب جمعها',
        'تحديد طريقة جمع البيانات الشخصية',
        'تحديد وسيلة حفظ البيانات الشخصية',
        'تحديد كيفية معالجة البيانات الشخصية',
        'تحديد كيفية إتلاف البيانات الشخصية',
        'تحديد حقوق صاحب البيانات الشخصية',
        'تحديد كيفية ممارسة صاحب البيانات الشخصية لحقوقه',
      ];
      for (let i = 1; i <= 8; i++) {
        if (!(scan as any)[`clause${i}Compliant`]) {
          missingClauses.push(`${i}. ${clauseNames[i - 1]}`);
        }
      }

      const subject = `إشعار بشأن الامتثال لنظام حماية البيانات الشخصية - ${scan.domain}`;
      const body = `السلام عليكم ورحمة الله وبركاته،

نود إبلاغكم بأنه تم فحص موقعكم (${scan.domain}) ضمن مبادرة رصد الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL)، وتحديداً المادة 12 منه.

نتيجة الفحص: ${scan.rating} (${Math.round(scan.overallScore || 0)}%)

البنود غير المستوفاة:
${missingClauses.join('\n')}

${scan.summary ? `ملخص التحليل:\n${scan.summary}\n` : ''}
نأمل منكم مراجعة سياسة الخصوصية الخاصة بموقعكم وتحديثها لتتوافق مع متطلبات نظام حماية البيانات الشخصية.

مع خالص التحية،
فريق راصد`;

      // Auto-save as draft letter
      const recipientEmail = site.emails?.split(',')[0]?.trim() || '';
      await db.insertLetter({
        siteId: input.siteId,
        scanId: input.scanId,
        recipientEmail,
        subject,
        body,
        createdBy: ctx.user.id,
        status: 'draft',
      });

      return { subject, body, missingClauses, recipientEmail };
    }),
    sendLetter: protectedProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      // Mark as sent (actual email sending would be integrated here)
      await db.updateLetterStatus(input.id, 'sent');
      return { success: true };
    }),
    setDeadline: protectedProcedure.input(z.object({
      id: z.number(),
      deadline: z.date(),
    })).mutation(async ({ input }) => {
      await db.updateLetterDeadline(input.id, input.deadline);
      return { success: true };
    }),
    addNotes: protectedProcedure.input(z.object({
      id: z.number(),
      notes: z.string(),
    })).mutation(async ({ input }) => {
      await db.updateLetterNotes(input.id, input.notes);
      return { success: true };
    }),
    stats: protectedProcedure.query(async () => {
      return await db.getLetterStats();
    }),
    overdue: protectedProcedure.query(async () => {
      return await db.getOverdueLetters();
    }),
    escalate: protectedProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      const letter = await db.getLetterById(input.id);
      if (!letter) throw new TRPCError({ code: 'NOT_FOUND', message: 'الخطاب غير موجود' });
      const newLevel = (letter.escalationLevel || 0) + 1;
      await db.updateLetterStatus(input.id, 'escalated');
      return { success: true, newLevel };
    }),
  }),

  notifications: router({
    list: publicProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(50),
      unreadOnly: z.boolean().optional().default(false),
    }).optional()).query(async ({ ctx, input }) => {
      if (!ctx.user?.id) return [];
      return await db.getUserNotifications(ctx.user.id);
    }),
    unreadCount: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) return { count: 0 };
      const count = await db.getUnreadNotificationCount(ctx.user.id);
      return { count };
    }),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.markNotificationRead(input.id);
      return { success: true };
    }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteNotification(input.id);
      return { success: true };
    }),
    deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deleteAllNotifications(ctx.user.id);
      return { success: true };
    }),
    // Compliance change notifications
    complianceChanges: protectedProcedure.query(async () => {
      return await db.getComplianceChangeNotifications(50);
    }),
  }),

  // ===== Change Password =====
  account: router({
    profile: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'المستخدم غير موجود' });
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        rasidRole: user.rasidRole,
        loginMethod: user.loginMethod,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      };
    }),
    updateProfile: protectedProcedure.input(z.object({
      displayName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      mobile: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const updates: any = {};
      if (input.displayName !== undefined) updates.displayName = input.displayName;
      if (input.email !== undefined) updates.email = input.email;
      if (input.mobile !== undefined) updates.mobile = input.mobile;
      await db.updateUserDetails(ctx.user.id, updates);
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'update_profile',
        details: `تم تحديث الملف الشخصي: ${Object.keys(updates).join(', ')}`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      return { success: true };
    }),
    changePassword: protectedProcedure.input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6),
    })).mutation(async ({ input, ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'لا يمكن تغيير كلمة المرور لهذا الحساب' });
      }
      const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'كلمة المرور الحالية غير صحيحة' });
      }
      const hash = await bcrypt.hash(input.newPassword, 10);
      await db.updatePassword(ctx.user.id, hash);
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: user.username || user.name || '',
        action: 'change_password',
        details: 'تم تغيير كلمة المرور',
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      return { success: true };
    }),
    // Session management
    sessions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSessions(ctx.user.id);
    }),
    terminateSession: protectedProcedure.input(z.object({
      sessionId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      await db.deactivateSession(input.sessionId, ctx.user.id);
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'terminate_session',
        details: `تم إنهاء جلسة #${input.sessionId}`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      return { success: true };
    }),
    terminateAllSessions: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deactivateAllSessions(ctx.user.id);
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'terminate_all_sessions',
        details: 'تم إنهاء جميع الجلسات',
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      return { success: true };
    }),
    // Email notification preferences
    updateEmailNotifications: protectedProcedure.input(z.object({
      enabled: z.boolean(),
    })).mutation(async ({ input, ctx }) => {
      await db.updateUserFields(ctx.user.id, { emailNotifications: input.enabled });
      return { success: true };
    }),
    // Profile activity stats
    profileStats: protectedProcedure.query(async () => {
      const stats = await db.getDashboardStats();
      const totalScans = Number(stats?.totalScans) || 0;
      const totalSites = Number(stats?.totalSites) || 0;
      const totalDocs = await db.getDocumentCount();
      const totalActivities = await db.getActivityLogCount();
      return { totalScans, totalSites, totalDocs, totalActivities };
    }),
  }),

  members: router({
    list: protectedProcedure.query(async () => {
      return await db.getMembers();
    }),
    updateRole: protectedProcedure.input(z.object({
      userId: z.number(),
      rasidRole: z.string(),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'ليس لديك صلاحية لتعديل الأدوار' });
      // Protect root admin
      const targetUser = await db.getUserById?.(input.userId) || await db.getMembers().then(m => (m as any[])?.find((u: any) => u.id === input.userId));
      if (targetUser) assertNotRootAdmin(targetUser.username || targetUser.name);
      await db.updateUserRole(input.userId, input.rasidRole);
      // Log activity
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'update_role',
        details: `تم تغيير دور المستخدم #${input.userId} إلى ${input.rasidRole}`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      return { success: true };
    }),
    createUser: protectedProcedure.input(z.object({
      username: z.string().min(3),
      password: z.string().min(6),
      name: z.string().min(1),
      displayName: z.string().min(1),
      email: z.string().email(),
      mobile: z.string().optional(),
      rasidRole: z.string(),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'ليس لديك صلاحية لإضافة مستخدمين' });
      // Check if username exists
      const existing = await db.getUserByUsername(input.username);
      if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'اسم المستخدم مستخدم بالفعل' });
      const hash = await bcrypt.hash(input.password, 10);
      const newUser = await db.createUser({
        username: input.username,
        passwordHash: hash,
        name: input.name,
        displayName: input.displayName,
        email: input.email,
        mobile: input.mobile,
        rasidRole: input.rasidRole,
      });
      // Log activity
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'create_user',
        details: `تم إنشاء مستخدم جديد: ${input.username} (${input.displayName})`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      return newUser;
    }),
    deleteUser: protectedProcedure.input(z.object({
      userId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'ليس لديك صلاحية لحذف المستخدمين' });
      if (input.userId === ctx.user.id) throw new TRPCError({ code: 'BAD_REQUEST', message: 'لا يمكنك حذف حسابك الخاص' });
      // Protect root admin
      const targetUser = await db.getUserById?.(input.userId) || await db.getMembers().then(m => (m as any[])?.find((u: any) => u.id === input.userId));
      if (targetUser) assertNotRootAdmin(targetUser.username || targetUser.name);
      await db.deleteUser(input.userId);
      // Log activity
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'delete_user',
        details: `تم حذف المستخدم #${input.userId}`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      return { success: true };
    }),
  }),

  // ===== Leadership Dashboard =====
  leadership: router({
    stats: publicProcedure.query(async () => {
      return await db.getLeadershipStats();
    }),
    drillDown: publicProcedure.input(z.object({
      sectorType: z.string().optional(),
      classification: z.string().optional(),
      complianceStatus: z.string().optional(),
      clauseNum: z.number().min(1).max(8).optional(),
      clauseCompliant: z.boolean().optional(),
      hasContactPage: z.boolean().optional(),
      hasEmail: z.boolean().optional(),
      siteStatus: z.string().optional(),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
    })).query(async ({ input }) => {
      return await db.getLeadershipDrillDown(input);
    }),
    siteHistory: publicProcedure.input(z.object({
      siteId: z.number(),
    })).query(async ({ input }) => {
      return await db.getSiteComplianceHistory(input.siteId);
    }),
  }),

  // ===== Scan Library =====
  scanLibrary: router({
    list: publicProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      search: z.string().optional(),
      complianceStatus: z.string().optional(),
      classification: z.string().optional(),
      sectorType: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.string().optional(),
    })).query(async ({ input }) => {
      return await db.getScanLibrary(input);
    }),
    classifications: publicProcedure.query(async () => {
      return await db.getAllClassifications();
    }),
  }),

  // ===== Compliance Alerts =====
  alerts: router({
    list: publicProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      unreadOnly: z.boolean().optional().default(false),
    })).query(async ({ input }) => {
      return await db.getComplianceAlerts(input);
    }),
    unreadCount: publicProcedure.query(async () => {
      return await db.getUnreadAlertCount();
    }),
    markRead: protectedProcedure.input(z.object({
      alertId: z.number(),
    })).mutation(async ({ input }) => {
      return await db.markAlertRead(input.alertId);
    }),
    markAllRead: protectedProcedure.mutation(async () => {
      return await db.markAllAlertsRead();
    }),
    // Alert contacts management
    contacts: router({
      list: protectedProcedure.query(async () => {
        return await db.getAlertContacts();
      }),
      create: protectedProcedure.input(z.object({
        name: z.string(),
        type: z.string(),
        value: z.string(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        return await db.createAlertContact(input as any);
      }),
      update: protectedProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        type: z.string().optional(),
        value: z.string().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateAlertContact(id, data as any);
      }),
      delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        return await db.deleteAlertContact(input.id);
      }),
    }),
    // Alert rules management
    rules: router({
      list: protectedProcedure.query(async () => {
        return await db.getAlertRules();
      }),
      create: protectedProcedure.input(z.object({
        name: z.string(),
        condition: z.string(),
        severity: z.string(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        return await db.createAlertRule(input as any);
      }),
      update: protectedProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        condition: z.string().optional(),
        severity: z.string().optional(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateAlertRule(id, data as any);
      }),
      delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        return await db.deleteAlertRule(input.id);
      }),
    }),
    // Alert history
    history: protectedProcedure.query(async () => {
      return await db.getAlertHistory(100);
    }),
    // Alert stats
    stats: protectedProcedure.query(async () => {
      const contacts = await db.getAlertContacts();
      const rules = await db.getAlertRules();
      const history = await db.getAlertHistory(1000);
      return {
        totalSent: history.length,
        totalFailed: 0,
        activeRules: rules.filter((r: any) => r.isActive).length,
        activeContacts: contacts.filter((c: any) => c.isActive).length,
      };
    }),
  }),

  // ===== Site Watchers =====
  watchers: router({
    watch: protectedProcedure.input(z.object({
      siteId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      return await db.watchSite(ctx.user.id, input.siteId);
    }),
    unwatch: protectedProcedure.input(z.object({
      siteId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      return await db.unwatchSite(ctx.user.id, input.siteId);
    }),
    isWatching: protectedProcedure.input(z.object({
      siteId: z.number(),
    })).query(async ({ input, ctx }) => {
      return await db.isWatchingSite(ctx.user.id, input.siteId);
    }),
    myWatched: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserWatchedSites(ctx.user.id);
    }),
  }),

  // ===== Screenshot History for Visual Comparison =====
  screenshots: router({
    history: publicProcedure.input(z.object({
      siteId: z.number(),
    })).query(async ({ input }) => {
      return await db.getSiteScreenshotHistory(input.siteId);
    }),
  }),

  // ===== Activity Logs =====
  activityLogs: router({
    list: protectedProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(50),
      userId: z.number().optional(),
      action: z.string().optional(),
    })).query(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN', message: 'ليس لديك صلاحية للوصول لسجل النشاطات' });
      return await db.getActivityLogs(input);
    }),
  }),

  // ===== Mobile Apps =====
  mobileApps: router({
    list: publicProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      search: z.string().optional(),
      platform: z.string().optional(),
      sectorType: z.string().optional(),
    })).query(async ({ input }) => {
      return await db.getMobileApps(input);
    }),
    get: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getMobileAppById(input.id);
    }),
    scans: publicProcedure.input(z.object({ appId: z.number() })).query(async ({ input }) => {
      return await db.getAppScans(input.appId);
    }),
    stats: publicProcedure.query(async () => {
      return await db.getAppScanStats();
    }),
    scan: protectedProcedure.input(z.object({
      storeUrl: z.string().url(),
      platform: z.enum(['android', 'ios', 'huawei']),
      sectorType: z.enum(['public', 'private']).optional(),
      entityName: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      // Extract app info from store
      const appInfo = await extractAppInfo(input.storeUrl, input.platform);
      
      // Insert or find the app
      const appResult = await db.insertMobileApp({
        appName: appInfo.appName || 'Unknown',
        developer: appInfo.developer || '',
        platform: input.platform,
        storeUrl: input.storeUrl,
        packageName: appInfo.packageName || '',
        privacyPolicyUrl: appInfo.privacyPolicyUrl || '',
        iconUrl: appInfo.iconUrl || '',
        downloads: appInfo.downloads || '',
        category: appInfo.category || '',
        sectorType: input.sectorType || 'private',
        entityName: input.entityName || '',
      });
      if (!appResult) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'فشل في إضافة التطبيق' });
      
      // Analyze privacy policy if found
      let analysis = null;
      if (appInfo.privacyPolicyUrl) {
        try {
          const resp = await fetch(appInfo.privacyPolicyUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RasidBot/1.0)' },
            signal: AbortSignal.timeout(15000),
          });
          const html = await resp.text();
          const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 10000);
          if (text.length > 100) {
            analysis = await analyzeCompliance(text, appInfo.appName || input.storeUrl);
          }
        } catch {}
      }
      
      const scanData: any = {
        appId: appResult.id,
        overallScore: analysis?.overall_score || 0,
        complianceStatus: !appInfo.privacyPolicyUrl ? 'no_policy' : analysis ? (analysis.overall_score >= 75 ? 'compliant' : analysis.overall_score >= 40 ? 'partially_compliant' : 'non_compliant') : 'no_policy',
        summary: analysis?.summary || 'لم يتم العثور على سياسة خصوصية',
        clause1Compliant: analysis?.clause_1?.compliant || false,
        clause1Evidence: analysis?.clause_1?.evidence || '',
        clause2Compliant: analysis?.clause_2?.compliant || false,
        clause2Evidence: analysis?.clause_2?.evidence || '',
        clause3Compliant: analysis?.clause_3?.compliant || false,
        clause3Evidence: analysis?.clause_3?.evidence || '',
        clause4Compliant: analysis?.clause_4?.compliant || false,
        clause4Evidence: analysis?.clause_4?.evidence || '',
        clause5Compliant: analysis?.clause_5?.compliant || false,
        clause5Evidence: analysis?.clause_5?.evidence || '',
        clause6Compliant: analysis?.clause_6?.compliant || false,
        clause6Evidence: analysis?.clause_6?.evidence || '',
        clause7Compliant: analysis?.clause_7?.compliant || false,
        clause7Evidence: analysis?.clause_7?.evidence || '',
        clause8Compliant: analysis?.clause_8?.compliant || false,
        clause8Evidence: analysis?.clause_8?.evidence || '',
        recommendations: analysis?.recommendations || [],
        scannedBy: ctx.user.id,
      };
      
      await db.insertAppScan(scanData);
      
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'scan_app',
        details: `فحص تطبيق: ${appInfo.appName || input.storeUrl} (${input.platform})`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      
      return { appId: appResult.id, ...scanData };
    }),
  }),

  // ===== Batch Scanning =====
  batchScan: router({
    jobs: protectedProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
    })).query(async ({ input }) => {
      return await db.getBatchScanJobs(input);
    }),
    job: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getBatchScanJob(input.id);
    }),
    upload: protectedProcedure.input(z.object({
      urls: z.array(z.object({
        url: z.string(),
        entityName: z.string().optional(),
        sectorType: z.string().optional(),
        classification: z.string().optional(),
      })),
      jobName: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const job = await db.insertBatchScanJob({
        jobName: input.jobName || `فحص دفعي - ${new Date().toLocaleDateString('ar-SA-u-nu-latn')}`,
        totalUrls: input.urls.length,
        completedUrls: 0,
        failedUrls: 0,
        status: 'running',
        createdBy: ctx.user.id,
        startedAt: new Date(),
      });
      if (!job) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'فشل في إنشاء مهمة الفحص' });
      
      // Process in background (non-blocking)
      processBatchScan(job.id, input.urls, ctx.user.id).catch(console.error);
      
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'batch_scan',
        details: `بدء فحص دفعي: ${input.urls.length} موقع`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      
       return { jobId: job.id, totalUrls: input.urls.length };
    }),
    cancel: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.updateBatchScanJob(input.id, { status: 'cancelled', completedAt: new Date() });
      return { success: true };
    }),
    exportJobExcel: protectedProcedure.input(z.object({ jobId: z.number() })).mutation(async ({ input, ctx }) => {
      const job = await db.getBatchScanJob(input.jobId);
      if (!job) throw new TRPCError({ code: 'NOT_FOUND', message: 'مهمة الفحص غير موجودة' });
      // Get all scans that were created during this job's timeframe
      const jobStarted = job.startedAt || job.started_at || job.created_at || job.createdAt;
      const jobCompleted = job.completedAt || job.completed_at || new Date().toISOString();
      const startTime = new Date(jobStarted);
      startTime.setSeconds(startTime.getSeconds() - 5);
      const endTime = new Date(jobCompleted);
      endTime.setMinutes(endTime.getMinutes() + 5);
      const allScans = await db.getRecentScans(500);
      const jobScans = (allScans as any[]).filter((s: any) => {
        const scanTime = new Date(s.createdAt || s.created_at);
        return scanTime >= startTime && scanTime <= endTime;
      });
      const totalUrls = job.totalUrls || job.total_urls || 0;
      const completedUrls = job.completedUrls || job.completed_urls || 0;
      const failedUrls = job.failedUrls || job.failed_urls || 0;
      const jobName = job.jobName || job.job_name || `فحص #${job.id}`;
      const sheets: ExcelSheetData[] = [
        {
          name: 'ملخص الفحص',
          columns: [
            { header: 'المعلومة', key: 'label', width: 30 },
            { header: 'القيمة', key: 'value', width: 25 },
          ],
          rows: [
            { label: 'اسم المهمة', value: jobName },
            { label: 'الحالة', value: statusToArabic(job.status) },
            { label: 'إجمالي المواقع', value: totalUrls },
            { label: 'المواقع المكتملة', value: completedUrls },
            { label: 'المواقع الفاشلة', value: failedUrls },
            { label: 'نسبة الإنجاز', value: totalUrls > 0 ? `${Math.round(((completedUrls + failedUrls) / totalUrls) * 100)}%` : '0%' },
            { label: 'تاريخ البدء', value: jobStarted ? new Date(jobStarted).toLocaleString('ar-SA-u-nu-latn') : '-' },
            { label: 'تاريخ الانتهاء', value: jobCompleted ? new Date(jobCompleted).toLocaleString('ar-SA-u-nu-latn') : '-' },
          ],
        },
      ];
      if (jobScans.length > 0) {
        sheets.push({
          name: 'نتائج الفحص التفصيلية',
          columns: [
            { header: '#', key: 'num', width: 6 },
            { header: 'النطاق', key: 'domain', width: 30 },
            { header: 'النتيجة', key: 'score', width: 10 },
            { header: 'حالة الامتثال', key: 'status', width: 18 },
            { header: 'التقييم', key: 'rating', width: 15 },
            { header: 'بند 1', key: 'c1', width: 10 },
            { header: 'بند 2', key: 'c2', width: 10 },
            { header: 'بند 3', key: 'c3', width: 10 },
            { header: 'بند 4', key: 'c4', width: 10 },
            { header: 'بند 5', key: 'c5', width: 10 },
            { header: 'بند 6', key: 'c6', width: 10 },
            { header: 'بند 7', key: 'c7', width: 10 },
            { header: 'بند 8', key: 'c8', width: 10 },
            { header: 'تاريخ الفحص', key: 'date', width: 20 },
          ],
          rows: jobScans.map((s: any, i: number) => ({
            num: i + 1,
            domain: s.domain || '',
            score: s.overallScore ?? 0,
            status: statusToArabic(s.complianceStatus),
            rating: s.rating || '',
            c1: boolToCompliance(s.clause1Compliant),
            c2: boolToCompliance(s.clause2Compliant),
            c3: boolToCompliance(s.clause3Compliant),
            c4: boolToCompliance(s.clause4Compliant),
            c5: boolToCompliance(s.clause5Compliant),
            c6: boolToCompliance(s.clause6Compliant),
            c7: boolToCompliance(s.clause7Compliant),
            c8: boolToCompliance(s.clause8Compliant),
            date: new Date(s.createdAt || s.created_at).toLocaleString('ar-SA-u-nu-latn'),
          })),
        });
        // Clause summary
        const clauseNames = ['تحديد الغرض', 'تحديد المحتوى', 'طريقة الجمع', 'حقوق الأفراد', 'الإفصاح والمشاركة', 'حماية البيانات', 'الاحتفاظ والإتلاف', 'التحديث والإخطار'];
        const clauseStats = clauseNames.map((name, idx) => {
          const key = `clause${idx + 1}Compliant`;
          const compliant = jobScans.filter((s: any) => s[key]).length;
          return { clause: `بند ${idx + 1}`, name, compliant, total: jobScans.length, rate: jobScans.length > 0 ? `${Math.round((compliant / jobScans.length) * 100)}%` : '0%' };
        });
        sheets.push({
          name: 'ملخص بنود المادة 12',
          columns: [
            { header: 'رقم البند', key: 'clause', width: 12 },
            { header: 'اسم البند', key: 'name', width: 30 },
            { header: 'عدد الممتثلين', key: 'compliant', width: 15 },
            { header: 'الإجمالي', key: 'total', width: 12 },
            { header: 'نسبة الامتثال', key: 'rate', width: 15 },
          ],
          rows: clauseStats,
        });
      }
      const buffer = await createProfessionalExcel({
        title: `تقرير فحص: ${jobName}`,
        subtitle: `إجمالي: ${totalUrls} موقع | مكتمل: ${completedUrls} | فاشل: ${failedUrls}`,
        userName: ctx.user?.name || ctx.user?.displayName || 'مستخدم',
        userRole: ctx.user?.rasidRole || ctx.user?.role || 'user',
        sheets,
      });
      const base64 = buffer.toString('base64');
      const filename = `rasid_scan_job_${input.jobId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      return { base64, filename };
    }),
  }),
  // ===== Advanced Scanning =====
  advancedScan: router({
    // Get classification list with site counts
    classificationCounts: protectedProcedure.query(async () => {
      return await db.getSitesByClassificationWithCounts();
    }),
    // Get sector list with site counts
    sectorCounts: protectedProcedure.query(async () => {
      return await db.getSitesBySectorWithCounts();
    }),
    // Search sites by keyword
    searchSites: protectedProcedure.input(z.object({
      keyword: z.string().min(1),
      limit: z.number().optional().default(50),
    })).query(async ({ input }) => {
      return await db.searchSitesAdvanced(input.keyword, input.limit);
    }),
    // Get filtered sites for selection
    filteredSites: protectedProcedure.input(z.object({
      sectorType: z.string().optional(),
      classification: z.string().optional(),
      complianceStatus: z.string().optional(),
      siteIds: z.array(z.number()).optional(),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(100),
    })).query(async ({ input }) => {
      return await db.getFilteredSitesForScan(input);
    }),
    // Execute advanced scan with options
    execute: protectedProcedure.input(z.object({
      // Input method: 'manual' | 'category' | 'search' | 'urls' | 'selection'
      inputMethod: z.string(),
      // Sites to scan (array of site IDs or URLs)
      siteIds: z.array(z.number()).optional(),
      urls: z.array(z.string()).optional(),
      // Advanced options
      options: z.object({
        deepScan: z.boolean().optional().default(false),
        parallelScan: z.boolean().optional().default(false),
        captureScreenshots: z.boolean().optional().default(true),
        extractText: z.boolean().optional().default(true),
        scanApps: z.boolean().optional().default(false),
        bypassDynamic: z.boolean().optional().default(false),
        scanDepth: z.number().optional().default(1),
        timeout: z.number().optional().default(30),
      }).optional(),
      jobName: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      // Collect URLs to scan
      let urlsToScan: Array<{ url: string; siteId?: number; siteName?: string; sectorType?: string; classification?: string }> = [];

      if (input.siteIds && input.siteIds.length > 0) {
        // Get site details for selected site IDs
        const filtered = await db.getFilteredSitesForScan({ siteIds: input.siteIds, limit: 5000 });
        urlsToScan = filtered.sites.map(s => ({
          url: `https://${s.domain}`,
          siteId: s.id,
          siteName: s.siteName,
          sectorType: s.sectorType,
          classification: s.classification,
        }));
      }

      if (input.urls && input.urls.length > 0) {
        for (const u of input.urls) {
          const cleanUrl = u.trim();
          if (!cleanUrl) continue;
          const fullUrl = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
          urlsToScan.push({ url: fullUrl });
        }
      }

      if (urlsToScan.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'لم يتم تحديد أي مواقع للفحص' });
      }

      const opts = input.options || { deepScan: false, parallelScan: false, captureScreenshots: true, extractText: true, scanApps: false, bypassDynamic: false, scanDepth: 1, timeout: 30 };
      const jobName = input.jobName || `فحص متقدم - ${new Date().toLocaleDateString('ar-SA-u-nu-latn')} (${urlsToScan.length} موقع)`;

      // Create batch job
      const job = await db.insertBatchScanJob({
        jobName,
        totalUrls: urlsToScan.length,
        completedUrls: 0,
        failedUrls: 0,
        status: 'running',
        createdBy: ctx.user.id,
        startedAt: new Date(),
      });
      if (!job) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'فشل في إنشاء مهمة الفحص' });

      // Process in background
      processAdvancedScan(job.id, urlsToScan, ctx.user.id, opts).catch(console.error);

      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'advanced_scan',
        details: `بدء فحص متقدم: ${urlsToScan.length} موقع - الخيارات: ${opts.deepScan ? 'عميق' : 'عادي'}, ${opts.parallelScan ? 'متوازي' : 'تسلسلي'}`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });

      return { jobId: job.id, totalUrls: urlsToScan.length, jobName };
    }),
  }),
  // ===== Message Templates =====
  messageTemplates: router({
    list: protectedProcedure.query(async () => {
      return await db.getMessageTemplates();
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getMessageTemplate(input.id);
    }),
    create: adminProcedure.input(z.object({
      templateKey: z.string(),
      nameAr: z.string(),
      nameEn: z.string().optional(),
      subject: z.string(),
      body: z.string(),
      variables: z.any().optional(),
      category: z.string().optional(),
    })).mutation(async ({ input }) => {
      return await db.insertMessageTemplate(input as any);
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      nameAr: z.string().optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await db.updateMessageTemplate(id, updates as any);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteMessageTemplate(input.id);
      return { success: true };
    }),
    seed: adminProcedure.mutation(async () => {
      await db.seedMessageTemplates();
      return { success: true };
    }),
  }),

  // ===== Cases / Workflow =====
  cases: router({
    list: protectedProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      status: z.string().optional(),
      stage: z.string().optional(),
      priority: z.string().optional(),
      assignedTo: z.number().optional(),
      requesterId: z.number().optional(),
    })).query(async ({ input }) => {
      return await db.getCases(input);
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getCaseById(input.id);
    }),
    stats: protectedProcedure.query(async () => {
      return await db.getCaseStats();
    }),
    create: protectedProcedure.input(z.object({
      title: z.string(),
      description: z.string().optional(),
      siteId: z.number().optional(),
      appId: z.number().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      assignedTo: z.number().optional(),
    })).mutation(async ({ input, ctx }) => {
      const caseNumber = await db.generateCaseNumber();
      const result = await db.insertCase({
        caseNumber,
        title: input.title,
        description: input.description,
        siteId: input.siteId,
        appId: input.appId,
        requesterId: ctx.user.id,
        assignedTo: input.assignedTo,
        priority: input.priority || 'medium',
        stage: 'submission',
        status: 'open',
      });
      if (!result) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'فشل في إنشاء الحالة' });
      
      await db.insertCaseHistoryEntry({
        caseId: result.id,
        toStage: 'submission',
        action: 'إنشاء حالة جديدة',
        comment: input.description || '',
        performedBy: ctx.user.id,
      });
      
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'create_case',
        details: `إنشاء حالة: ${caseNumber} - ${input.title}`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      
      return { id: result.id, caseNumber };
    }),
    updateStage: protectedProcedure.input(z.object({
      caseId: z.number(),
      newStage: z.string(),
      comment: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const existing = await db.getCaseById(input.caseId);
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'الحالة غير موجودة' });
      
      await db.updateCase(input.caseId, {
        stage: input.newStage as any,
        status: input.newStage === 'closed' ? 'closed' : input.newStage === 'registered' ? 'resolved' : 'in_progress',
      });
      
      await db.insertCaseHistoryEntry({
        caseId: input.caseId,
        fromStage: existing.stage,
        toStage: input.newStage,
        action: `انتقال من ${existing.stage} إلى ${input.newStage}`,
        comment: input.comment || '',
        performedBy: ctx.user.id,
      });
      
      return { success: true };
    }),
    assign: protectedProcedure.input(z.object({
      caseId: z.number(),
      assignedTo: z.number(),
    })).mutation(async ({ input, ctx }) => {
      await db.updateCase(input.caseId, { assignedTo: input.assignedTo });
      await db.insertCaseHistoryEntry({
        caseId: input.caseId,
        toStage: 'assignment',
        action: 'تعيين مسؤول',
        comment: `تم التعيين بواسطة ${ctx.user.name}`,
        performedBy: ctx.user.id,
      });
      return { success: true };
    }),
    history: protectedProcedure.input(z.object({ caseId: z.number() })).query(async ({ input }) => {
      return await db.getCaseHistoryEntries(input.caseId);
    }),
    // ===== Case Comments =====
    comments: protectedProcedure.input(z.object({ caseId: z.number() })).query(async ({ input }) => {
      return await db.getCaseComments(input.caseId);
    }),
    commentCount: protectedProcedure.input(z.object({ caseId: z.number() })).query(async ({ input }) => {
      return await db.getCaseCommentCount(input.caseId);
    }),
    addComment: protectedProcedure.input(z.object({
      caseId: z.number(),
      content: z.string().min(1),
      parentId: z.number().optional(),
      isInternal: z.boolean().optional().default(true),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.insertCaseComment({
        caseId: input.caseId,
        userId: ctx.user.id,
        content: input.content,
        parentId: input.parentId,
        isInternal: input.isInternal,
      });
      if (!result) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'فشل في إضافة التعليق' });
      
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'add_comment',
        details: `إضافة تعليق على الحالة #${input.caseId}`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      
      return result;
    }),
    updateComment: protectedProcedure.input(z.object({
      commentId: z.number(),
      content: z.string().min(1),
    })).mutation(async ({ input, ctx }) => {
      const success = await db.updateCaseComment(input.commentId, ctx.user.id, input.content);
      if (!success) throw new TRPCError({ code: 'FORBIDDEN', message: 'لا يمكنك تعديل هذا التعليق' });
      return { success: true };
    }),
    deleteComment: protectedProcedure.input(z.object({
      commentId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      const success = await db.deleteCaseComment(input.commentId, ctx.user.id);
      if (!success) throw new TRPCError({ code: 'FORBIDDEN', message: 'لا يمكنك حذف هذا التعليق' });
      return { success: true };
    }),
  }),

  // ===== Scan Schedules =====
  scanSchedules: router({
    list: protectedProcedure.query(async () => {
      return await db.getScanSchedules();
    }),
    create: adminProcedure.input(z.object({
      name: z.string(),
      description: z.string().optional(),
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      dayOfWeek: z.number().optional(),
      dayOfMonth: z.number().optional(),
      hour: z.number().optional(),
      targetType: z.enum(['all_sites', 'sector', 'category', 'specific_sites', 'all_apps']).optional(),
      targetFilter: z.any().optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.insertScanSchedule({
        ...input as any,
        isActive: true,
        createdBy: ctx.user.id,
      });
      return result;
    }),
    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      frequency: z.string().optional(),
      isActive: z.boolean().optional(),
      hour: z.number().optional(),
      dayOfWeek: z.number().optional(),
      dayOfMonth: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await db.updateScanSchedule(id, updates as any);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteScanSchedule(input.id);
      return { success: true };
    }),
  }),

  reports: router({
    exportCsv: protectedProcedure.input(z.object({
      type: z.enum(['summary', 'detailed', 'clauses']),
    })).mutation(async ({ input }) => {
      const data = await db.getExportData(input.type) as any[];
      if (!data || data.length === 0) return { csv: '', filename: 'empty.csv' };

      const statusMap: Record<string, string> = {
        compliant: 'ممتثل',
        partially_compliant: 'ممتثل جزئياً',
        non_compliant: 'غير ممتثل',
        no_policy: 'غير ممتثل',
        not_working: 'لا يعمل',
      };

      // Build CSV
      const headers = input.type === 'summary'
        ? ['النطاق', 'الاسم', 'التصنيف', 'الحالة', 'البريد', 'رابط الخصوصية', 'النتيجة', 'التقييم', 'حالة الامتثال', 'تاريخ الفحص', 'بند 1', 'بند 2', 'بند 3', 'بند 4', 'بند 5', 'بند 6', 'بند 7', 'بند 8']
        : input.type === 'clauses'
        ? ['النطاق', 'الاسم', 'التصنيف', 'النتيجة', 'حالة الامتثال', 'بند 1', 'بند 2', 'بند 3', 'بند 4', 'بند 5', 'بند 6', 'بند 7', 'بند 8']
        : ['النطاق', 'الاسم', 'التصنيف', 'البريد', 'النتيجة', 'التقييم', 'حالة الامتثال', 'تاريخ الفحص', 'الملخص'];

      const boolToAr = (v: any) => v ? 'ممتثل' : 'غير ممتثل';

      const rows = data.map((row: any) => {
        if (input.type === 'summary') {
          return [
            row.domain, row.siteName || '', row.classification || '', row.siteStatus || '',
            row.emails || '', row.privacyUrl || '',
            row.overallScore ?? '', row.rating || '', statusMap[row.complianceStatus] || row.complianceStatus || '',
            row.scanDate ? new Date(row.scanDate).toLocaleDateString('ar-SA-u-nu-latn') : '',
            boolToAr(row.clause1Compliant), boolToAr(row.clause2Compliant),
            boolToAr(row.clause3Compliant), boolToAr(row.clause4Compliant),
            boolToAr(row.clause5Compliant), boolToAr(row.clause6Compliant),
            boolToAr(row.clause7Compliant), boolToAr(row.clause8Compliant),
          ];
        } else if (input.type === 'clauses') {
          return [
            row.domain, row.siteName || '', row.classification || '',
            row.overallScore ?? '', statusMap[row.complianceStatus] || row.complianceStatus || '',
            boolToAr(row.clause1Compliant), boolToAr(row.clause2Compliant),
            boolToAr(row.clause3Compliant), boolToAr(row.clause4Compliant),
            boolToAr(row.clause5Compliant), boolToAr(row.clause6Compliant),
            boolToAr(row.clause7Compliant), boolToAr(row.clause8Compliant),
          ];
        } else {
          return [
            row.domain, row.siteName || '', row.classification || '', row.emails || '',
            row.overallScore ?? '', row.rating || '', statusMap[row.complianceStatus] || row.complianceStatus || '',
            row.scanDate ? new Date(row.scanDate).toLocaleDateString('ar-SA-u-nu-latn') : '',
            (row.summary || '').replace(/[\n\r,]/g, ' '),
          ];
        }
      });

      const escapeCsv = (val: any) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csv = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
      const filename = `rasid_${input.type}_${new Date().toISOString().slice(0, 10)}.csv`;
      return { csv, filename };
    }),

    exportExcel: protectedProcedure.input(z.object({
      type: z.enum(['summary', 'detailed', 'clauses']),
    })).mutation(async ({ input, ctx }) => {
      const data = await db.getExportData(input.type) as any[];
      if (!data || data.length === 0) return { base64: '', filename: 'empty.xlsx' };

      const columns = input.type === 'summary' ? [
        { header: 'النطاق', key: 'domain', width: 30 },
        { header: 'الاسم', key: 'siteName', width: 25 },
        { header: 'التصنيف', key: 'classification', width: 18 },
        { header: 'الحالة', key: 'siteStatus', width: 12 },
        { header: 'البريد', key: 'emails', width: 30 },
        { header: 'النتيجة', key: 'overallScore', width: 10 },
        { header: 'التقييم', key: 'rating', width: 12 },
        { header: 'حالة الامتثال', key: 'complianceStatus', width: 16 },
        { header: 'بند 1', key: 'c1', width: 12 }, { header: 'بند 2', key: 'c2', width: 12 },
        { header: 'بند 3', key: 'c3', width: 12 }, { header: 'بند 4', key: 'c4', width: 12 },
        { header: 'بند 5', key: 'c5', width: 12 }, { header: 'بند 6', key: 'c6', width: 12 },
        { header: 'بند 7', key: 'c7', width: 12 }, { header: 'بند 8', key: 'c8', width: 12 },
      ] : [
        { header: 'النطاق', key: 'domain', width: 30 },
        { header: 'الاسم', key: 'siteName', width: 25 },
        { header: 'التصنيف', key: 'classification', width: 18 },
        { header: 'النتيجة', key: 'overallScore', width: 10 },
        { header: 'حالة الامتثال', key: 'complianceStatus', width: 16 },
        { header: 'بند 1', key: 'c1', width: 12 }, { header: 'بند 2', key: 'c2', width: 12 },
        { header: 'بند 3', key: 'c3', width: 12 }, { header: 'بند 4', key: 'c4', width: 12 },
        { header: 'بند 5', key: 'c5', width: 12 }, { header: 'بند 6', key: 'c6', width: 12 },
        { header: 'بند 7', key: 'c7', width: 12 }, { header: 'بند 8', key: 'c8', width: 12 },
      ];

      const rows = data.map((row: any) => {
        const base: any = {
          domain: row.domain, siteName: row.siteName || '', classification: row.classification || '',
          overallScore: row.overallScore ?? 0, complianceStatus: statusToArabic(row.complianceStatus),
          c1: boolToCompliance(row.clause1Compliant), c2: boolToCompliance(row.clause2Compliant),
          c3: boolToCompliance(row.clause3Compliant), c4: boolToCompliance(row.clause4Compliant),
          c5: boolToCompliance(row.clause5Compliant), c6: boolToCompliance(row.clause6Compliant),
          c7: boolToCompliance(row.clause7Compliant), c8: boolToCompliance(row.clause8Compliant),
        };
        if (input.type === 'summary') {
          base.siteStatus = row.siteStatus === 'active' ? 'نشط' : 'غير متاح';
          base.emails = row.emails || '';
          base.rating = row.rating || '';
        }
        return base;
      });

      const buffer = await createProfessionalExcel({
        title: input.type === 'summary' ? 'تقرير الامتثال التفصيلي' : 'تقرير الامتثال',
        userName: ctx.user?.name || ctx.user?.displayName || 'مستخدم',
        userRole: ctx.user?.rasidRole || ctx.user?.role || 'user',
        sheets: [{ name: 'تقرير الامتثال', columns, rows }],
      });
      const base64 = buffer.toString('base64');
      const filename = `rasid_${input.type}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      return { base64, filename };
    }),

    // ===== PowerPoint Export =====
    exportPptx: protectedProcedure.input(z.object({
      siteId: z.number(),
    })).mutation(async ({ input }) => {
      const siteData = await db.getSiteById(input.siteId);
      if (!siteData) throw new TRPCError({ code: 'NOT_FOUND', message: 'الموقع غير موجود' });

      const latestScan = siteData.scans?.[0];
      if (!latestScan) throw new TRPCError({ code: 'NOT_FOUND', message: 'لا يوجد فحص لهذا الموقع' });

      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'منصة راصد';
      pptx.company = 'الهيئة السعودية للبيانات والذكاء الاصطناعي';
      pptx.subject = `تقرير امتثال - ${siteData.domain}`;
      pptx.title = `تقرير امتثال ${siteData.siteName || siteData.domain}`;

      const PRIMARY = '1E3A5F';
      const ACCENT = '3B82F6';
      const GREEN = '22C55E';
      const RED = 'EF4444';
      const AMBER = 'F59E0B';
      const GRAY = '6B7280';
      const WHITE = 'FFFFFF';
      const LIGHT_BG = 'F8FAFC';

      const statusMap: Record<string, string> = {
        compliant: 'ممتثل',
        partially_compliant: 'ممتثل جزئياً',
        non_compliant: 'غير ممتثل',
        no_policy: 'غير ممتثل',
        not_working: 'لا يعمل',
      };
      const statusColor: Record<string, string> = {
        compliant: GREEN,
        partially_compliant: AMBER,
        non_compliant: RED,
        no_policy: GRAY,
      };

      const clauseNames = [
        'الهوية ومعلومات الاتصال',
        'الغرض من جمع البيانات',
        'الأساس النظامي للمعالجة',
        'الجهات التي تُفصح لها البيانات',
        'نقل البيانات خارج المملكة',
        'مدة الاحتفاظ بالبيانات',
        'حقوق صاحب البيانات',
        'آلية تقديم الشكاوى',
      ];

      // ===== SLIDE 1: Cover =====
      const slide1 = pptx.addSlide();
      slide1.background = { color: PRIMARY };
      slide1.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: '100%',
        fill: { type: 'solid', color: PRIMARY },
      });
      // Decorative accent bar
      slide1.addShape(pptx.ShapeType.rect, {
        x: 0, y: 4.8, w: '100%', h: 0.08,
        fill: { type: 'solid', color: ACCENT },
      });
      slide1.addText('تقرير امتثال سياسة الخصوصية', {
        x: 0.5, y: 1.0, w: 9, h: 1,
        fontSize: 28, fontFace: 'Arial', color: WHITE,
        bold: true, align: 'right', rtlMode: true,
      });
      slide1.addText(siteData.siteName || siteData.domain, {
        x: 0.5, y: 2.0, w: 9, h: 0.8,
        fontSize: 22, fontFace: 'Arial', color: ACCENT,
        bold: true, align: 'right', rtlMode: true,
      });
      slide1.addText(siteData.domain, {
        x: 0.5, y: 2.7, w: 9, h: 0.5,
        fontSize: 16, fontFace: 'Arial', color: 'B0BEC5',
        align: 'right', rtlMode: true,
      });
      const scanDateStr = latestScan.scanDate ? new Date(latestScan.scanDate).toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
      slide1.addText(`تاريخ الفحص: ${scanDateStr}`, {
        x: 0.5, y: 3.5, w: 9, h: 0.4,
        fontSize: 14, fontFace: 'Arial', color: 'B0BEC5',
        align: 'right', rtlMode: true,
      });
      slide1.addText('منصة راصد - الهيئة السعودية للبيانات والذكاء الاصطناعي', {
        x: 0.5, y: 5.0, w: 9, h: 0.4,
        fontSize: 11, fontFace: 'Arial', color: '78909C',
        align: 'right', rtlMode: true,
      });

      // ===== SLIDE 2: Overall Score =====
      const slide2 = pptx.addSlide();
      slide2.background = { color: LIGHT_BG };
      slide2.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.8,
        fill: { type: 'solid', color: PRIMARY },
      });
      slide2.addText('نتيجة الامتثال العامة', {
        x: 0.5, y: 0.1, w: 9, h: 0.6,
        fontSize: 20, fontFace: 'Arial', color: WHITE,
        bold: true, align: 'right', rtlMode: true,
      });

      const score = Number(latestScan.overallScore || 0);
      const compStatus = latestScan.complianceStatus || 'no_policy';
      const sColor = statusColor[compStatus] || GRAY;

      // Score box
      slide2.addShape(pptx.ShapeType.roundRect, {
        x: 3.0, y: 1.2, w: 4.0, h: 2.5,
        fill: { type: 'solid', color: WHITE },
        shadow: { type: 'outer', blur: 10, offset: 3, color: '00000020' },
        rectRadius: 0.2,
      });
      slide2.addText(`${score}%`, {
        x: 3.0, y: 1.3, w: 4.0, h: 1.5,
        fontSize: 54, fontFace: 'Arial', color: sColor,
        bold: true, align: 'center',
      });
      slide2.addText(statusMap[compStatus] || compStatus, {
        x: 3.0, y: 2.7, w: 4.0, h: 0.6,
        fontSize: 18, fontFace: 'Arial', color: sColor,
        bold: true, align: 'center', rtlMode: true,
      });
      slide2.addText(latestScan.rating || '', {
        x: 3.0, y: 3.2, w: 4.0, h: 0.4,
        fontSize: 14, fontFace: 'Arial', color: GRAY,
        align: 'center', rtlMode: true,
      });

      // Info boxes
      const infoItems = [
        { label: 'القطاع', value: siteData.sectorType === 'public' ? 'حكومي' : 'خاص' },
        { label: 'التصنيف', value: siteData.classification || '-' },
        { label: 'الحالة', value: siteData.siteStatus === 'active' ? 'نشط' : 'غير متاح' },
        { label: 'البريد', value: siteData.emails || '-' },
      ];
      infoItems.forEach((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const xPos = col === 0 ? 5.5 : 0.5;
        const yPos = 4.0 + row * 0.7;
        slide2.addText(`${item.label}: ${item.value}`, {
          x: xPos, y: yPos, w: 4.0, h: 0.5,
          fontSize: 12, fontFace: 'Arial', color: '374151',
          align: 'right', rtlMode: true,
        });
      });

      // ===== SLIDE 3: Article 12 Clauses =====
      const slide3 = pptx.addSlide();
      slide3.background = { color: LIGHT_BG };
      slide3.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.8,
        fill: { type: 'solid', color: PRIMARY },
      });
      slide3.addText('تحليل بنود المادة 12', {
        x: 0.5, y: 0.1, w: 9, h: 0.6,
        fontSize: 20, fontFace: 'Arial', color: WHITE,
        bold: true, align: 'right', rtlMode: true,
      });

      const compliantCount = [1,2,3,4,5,6,7,8].filter(c => (latestScan as any)[`clause${c}Compliant`]).length;
      slide3.addText(`${compliantCount} من 8 بنود ممتثلة`, {
        x: 0.5, y: 0.95, w: 9, h: 0.4,
        fontSize: 13, fontFace: 'Arial', color: GRAY,
        align: 'right', rtlMode: true,
      });

      // Clause table
      const clauseRows: PptxGenJS.TableRow[] = [
        [
          { text: 'الحالة', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 11, fontFace: 'Arial' } },
          { text: 'البند', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'right', fontSize: 11, fontFace: 'Arial' } },
          { text: '#', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 11, fontFace: 'Arial' } },
        ],
      ];
      for (let i = 1; i <= 8; i++) {
        const isCompliant = (latestScan as any)[`clause${i}Compliant`];
        clauseRows.push([
          { text: isCompliant ? '✓ ممتثل' : '✗ غير ممتثل', options: { color: isCompliant ? GREEN : RED, align: 'center', fontSize: 10, fontFace: 'Arial', bold: true } },
          { text: clauseNames[i - 1], options: { align: 'right', fontSize: 10, fontFace: 'Arial', color: '374151' } },
          { text: String(i), options: { align: 'center', fontSize: 10, fontFace: 'Arial', color: '374151' } },
        ]);
      }
      slide3.addTable(clauseRows, {
        x: 0.8, y: 1.5, w: 8.4,
        border: { type: 'solid', pt: 0.5, color: 'E5E7EB' },
        rowH: 0.4,
        colW: [2.0, 5.4, 1.0],
        autoPage: false,
      });

      // ===== SLIDE 4: Clause Evidence =====
      const slide4 = pptx.addSlide();
      slide4.background = { color: LIGHT_BG };
      slide4.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.8,
        fill: { type: 'solid', color: PRIMARY },
      });
      slide4.addText('أدلة الامتثال لكل بند', {
        x: 0.5, y: 0.1, w: 9, h: 0.6,
        fontSize: 20, fontFace: 'Arial', color: WHITE,
        bold: true, align: 'right', rtlMode: true,
      });

      let yPos4 = 1.1;
      let currentEvidenceSlide = slide4;
      for (let i = 1; i <= 8; i++) {
        const isCompliant = (latestScan as any)[`clause${i}Compliant`];
        const evidence = (latestScan as any)[`clause${i}Evidence`] || 'لا يوجد دليل';
        if (yPos4 > 4.8) {
          // Add new slide if running out of space
          currentEvidenceSlide = pptx.addSlide();
          currentEvidenceSlide.background = { color: LIGHT_BG };
          currentEvidenceSlide.addShape(pptx.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: 0.8,
            fill: { type: 'solid', color: PRIMARY },
          });
          currentEvidenceSlide.addText('أدلة الامتثال (تابع)', {
            x: 0.5, y: 0.1, w: 9, h: 0.6,
            fontSize: 20, fontFace: 'Arial', color: WHITE,
            bold: true, align: 'right', rtlMode: true,
          });
          yPos4 = 1.1;
        }
        currentEvidenceSlide.addText(`بند ${i}: ${clauseNames[i - 1]}`, {
          x: 0.5, y: yPos4, w: 9, h: 0.3,
          fontSize: 11, fontFace: 'Arial', color: isCompliant ? GREEN : RED,
          bold: true, align: 'right', rtlMode: true,
        });
        currentEvidenceSlide.addText(evidence.slice(0, 200), {
          x: 0.5, y: yPos4 + 0.3, w: 9, h: 0.3,
          fontSize: 9, fontFace: 'Arial', color: '6B7280',
          align: 'right', rtlMode: true,
        });
        yPos4 += 0.7;
      }

      // ===== SLIDE 5: Recommendations =====
      const slide5 = pptx.addSlide();
      slide5.background = { color: LIGHT_BG };
      slide5.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: '100%', h: 0.8,
        fill: { type: 'solid', color: PRIMARY },
      });
      slide5.addText('التوصيات', {
        x: 0.5, y: 0.1, w: 9, h: 0.6,
        fontSize: 20, fontFace: 'Arial', color: WHITE,
        bold: true, align: 'right', rtlMode: true,
      });

      const recs = Array.isArray(latestScan.recommendations) ? latestScan.recommendations : [];
      if (recs.length === 0) {
        slide5.addText('لا توجد توصيات - الموقع ممتثل لجميع البنود', {
          x: 0.5, y: 1.5, w: 9, h: 0.5,
          fontSize: 14, fontFace: 'Arial', color: GREEN,
          align: 'right', rtlMode: true,
        });
      } else {
        recs.forEach((rec: string, idx: number) => {
          slide5.addShape(pptx.ShapeType.roundRect, {
            x: 0.5, y: 1.2 + idx * 0.7, w: 9, h: 0.55,
            fill: { type: 'solid', color: WHITE },
            shadow: { type: 'outer', blur: 5, offset: 2, color: '00000010' },
            rectRadius: 0.1,
          });
          slide5.addText(`${idx + 1}. ${rec}`, {
            x: 0.7, y: 1.25 + idx * 0.7, w: 8.6, h: 0.45,
            fontSize: 12, fontFace: 'Arial', color: '374151',
            align: 'right', rtlMode: true, valign: 'middle',
          });
        });
      }

      // ===== SLIDE 6: History (if multiple scans) =====
      if (siteData.scans.length > 1) {
        const slide6 = pptx.addSlide();
        slide6.background = { color: LIGHT_BG };
        slide6.addShape(pptx.ShapeType.rect, {
          x: 0, y: 0, w: '100%', h: 0.8,
          fill: { type: 'solid', color: PRIMARY },
        });
        slide6.addText('تاريخ الامتثال', {
          x: 0.5, y: 0.1, w: 9, h: 0.6,
          fontSize: 20, fontFace: 'Arial', color: WHITE,
          bold: true, align: 'right', rtlMode: true,
        });

        const historyRows: PptxGenJS.TableRow[] = [
          [
            { text: 'البنود الممتثلة', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
            { text: 'الحالة', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
            { text: 'النتيجة', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
            { text: 'التاريخ', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          ],
        ];
        siteData.scans.slice(0, 10).forEach((scan: any) => {
          const clauseCount = [1,2,3,4,5,6,7,8].filter(c => scan[`clause${c}Compliant`]).length;
          historyRows.push([
            { text: `${clauseCount}/8`, options: { align: 'center', fontSize: 10, fontFace: 'Arial', color: '374151' } },
            { text: statusMap[scan.complianceStatus] || '-', options: { align: 'center', fontSize: 10, fontFace: 'Arial', color: statusColor[scan.complianceStatus] || GRAY } },
            { text: `${Number(scan.overallScore || 0)}%`, options: { align: 'center', fontSize: 10, fontFace: 'Arial', color: '374151' } },
            { text: scan.scanDate ? new Date(scan.scanDate).toLocaleDateString('ar-SA-u-nu-latn') : '-', options: { align: 'center', fontSize: 10, fontFace: 'Arial', color: '374151' } },
          ]);
        });
        slide6.addTable(historyRows, {
          x: 0.8, y: 1.2, w: 8.4,
          border: { type: 'solid', pt: 0.5, color: 'E5E7EB' },
          rowH: 0.4,
          colW: [2.0, 2.5, 1.5, 2.4],
          autoPage: false,
        });
      }

      // ===== SLIDE 7: Closing =====
      const slideEnd = pptx.addSlide();
      slideEnd.background = { color: PRIMARY };
      slideEnd.addShape(pptx.ShapeType.rect, {
        x: 0, y: 4.8, w: '100%', h: 0.08,
        fill: { type: 'solid', color: ACCENT },
      });
      slideEnd.addText('شكراً لكم', {
        x: 0.5, y: 1.5, w: 9, h: 1,
        fontSize: 36, fontFace: 'Arial', color: WHITE,
        bold: true, align: 'center', rtlMode: true,
      });
      slideEnd.addText('منصة راصد - رصد امتثال المواقع السعودية لنظام حماية البيانات الشخصية', {
        x: 0.5, y: 2.8, w: 9, h: 0.5,
        fontSize: 14, fontFace: 'Arial', color: '78909C',
        align: 'center', rtlMode: true,
      });
      slideEnd.addText('الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)', {
        x: 0.5, y: 3.3, w: 9, h: 0.4,
        fontSize: 12, fontFace: 'Arial', color: '78909C',
        align: 'center', rtlMode: true,
      });

      // Generate PPTX and upload to S3 for reliable download
      const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
      const filename = `rasid_${siteData.domain.replace(/\./g, '_')}_${new Date().toISOString().slice(0, 10)}.pptx`;
      const fileKey = `reports/pptx/rasid_${siteData.domain.replace(/\./g, '_')}_${new Date().toISOString().slice(0, 10)}-${Date.now()}.pptx`;
      const { url } = await storagePut(fileKey, Buffer.from(pptxBuffer), 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      return { url, filename };
    }),

    // ===== Leadership Dashboard PDF Export =====
    exportLeadershipPdf: protectedProcedure.mutation(async () => {
      const stats = await db.getLeadershipStats();
      if (!stats) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'فشل في جلب بيانات المؤشرات' });

      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'منصة راصد';
      pptx.company = 'الهيئة السعودية للبيانات والذكاء الاصطناعي';
      pptx.subject = 'تقرير لوحة المؤشرات القيادية';
      pptx.title = 'تقرير لوحة المؤشرات القيادية - منصة راصد';

      const PRIMARY = '1E3A5F';
      const ACCENT = '3B82F6';
      const GREEN = '22C55E';
      const RED = 'EF4444';
      const AMBER = 'F59E0B';
      const GRAY = '6B7280';
      const WHITE = 'FFFFFF';
      const LIGHT_BG = 'F8FAFC';

      const dateStr = new Date().toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });

      // ===== SLIDE 1: Cover =====
      const slide1 = pptx.addSlide();
      slide1.background = { color: PRIMARY };
      slide1.addShape(pptx.ShapeType.rect, { x: 0, y: 4.8, w: '100%', h: 0.08, fill: { type: 'solid', color: ACCENT } });
      slide1.addText('تقرير لوحة المؤشرات القيادية', {
        x: 0.5, y: 1.2, w: 9, h: 1, fontSize: 32, fontFace: 'Arial', color: WHITE, bold: true, align: 'right', rtlMode: true,
      });
      slide1.addText('منصة راصد - رصد امتثال المواقع السعودية لنظام حماية البيانات الشخصية', {
        x: 0.5, y: 2.3, w: 9, h: 0.6, fontSize: 16, fontFace: 'Arial', color: 'B0BEC5', align: 'right', rtlMode: true,
      });
      slide1.addText(`تاريخ التقرير: ${dateStr}`, {
        x: 0.5, y: 3.2, w: 9, h: 0.4, fontSize: 14, fontFace: 'Arial', color: '78909C', align: 'right', rtlMode: true,
      });
      slide1.addText('الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)', {
        x: 0.5, y: 5.0, w: 9, h: 0.4, fontSize: 11, fontFace: 'Arial', color: '78909C', align: 'right', rtlMode: true,
      });

      // ===== SLIDE 2: General Stats =====
      const slide2 = pptx.addSlide();
      slide2.background = { color: LIGHT_BG };
      slide2.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.8, fill: { type: 'solid', color: PRIMARY } });
      slide2.addText('المؤشرات العامة للرصد', {
        x: 0.5, y: 0.1, w: 9, h: 0.6, fontSize: 20, fontFace: 'Arial', color: WHITE, bold: true, align: 'right', rtlMode: true,
      });

      const g = stats.general;
      const totalWithScans = g.compliant + g.nonCompliant + g.partiallyCompliant + g.noPolicy;
      const complianceRate = totalWithScans > 0 ? Math.round((g.compliant / totalWithScans) * 100) : 0;

      const statItems = [
        { label: 'إجمالي المواقع', value: String(g.totalSites), color: ACCENT },
        { label: 'إجمالي الفحوصات', value: String(g.totalScans), color: ACCENT },
        { label: 'ممتثلة', value: String(g.compliant), color: GREEN },
        { label: 'ممتثلة جزئياً', value: String(g.partiallyCompliant), color: AMBER },
        { label: 'غير ممتثلة', value: String(g.nonCompliant), color: RED },
        { label: 'لا يعمل', value: String(g.noPolicy), color: GRAY },
        { label: 'غير متاحة', value: String(g.unreachable), color: GRAY },
        { label: 'معدل الامتثال', value: `${complianceRate}%`, color: complianceRate >= 50 ? GREEN : RED },
      ];

      statItems.forEach((item, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const xPos = 7.2 - col * 2.3;
        const yPos = 1.2 + row * 1.8;
        slide2.addShape(pptx.ShapeType.roundRect, {
          x: xPos, y: yPos, w: 2.1, h: 1.5,
          fill: { type: 'solid', color: WHITE },
          shadow: { type: 'outer', blur: 8, offset: 2, color: '00000015' },
          rectRadius: 0.15,
        });
        slide2.addText(item.value, {
          x: xPos, y: yPos + 0.15, w: 2.1, h: 0.8,
          fontSize: 28, fontFace: 'Arial', color: item.color, bold: true, align: 'center',
        });
        slide2.addText(item.label, {
          x: xPos, y: yPos + 0.9, w: 2.1, h: 0.4,
          fontSize: 11, fontFace: 'Arial', color: GRAY, align: 'center', rtlMode: true,
        });
      });

      // ===== SLIDE 3: Article 12 Clauses =====
      const slide3 = pptx.addSlide();
      slide3.background = { color: LIGHT_BG };
      slide3.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.8, fill: { type: 'solid', color: PRIMARY } });
      slide3.addText('بنود المادة 12 - نسب الامتثال', {
        x: 0.5, y: 0.1, w: 9, h: 0.6, fontSize: 20, fontFace: 'Arial', color: WHITE, bold: true, align: 'right', rtlMode: true,
      });

      const clauseRows: PptxGenJS.TableRow[] = [
        [
          { text: 'النسبة', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 11, fontFace: 'Arial' } },
          { text: 'غير ممتثل', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 11, fontFace: 'Arial' } },
          { text: 'ممتثل', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 11, fontFace: 'Arial' } },
          { text: 'البند', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'right', fontSize: 11, fontFace: 'Arial' } },
          { text: '#', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 11, fontFace: 'Arial' } },
        ],
      ];
      stats.clauses.forEach((c) => {
        const pctColor = c.percentage >= 50 ? GREEN : (c.percentage >= 25 ? AMBER : RED);
        clauseRows.push([
          { text: `${c.percentage}%`, options: { color: pctColor, align: 'center', fontSize: 10, fontFace: 'Arial', bold: true } },
          { text: String(c.nonCompliant), options: { color: RED, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: String(c.compliant), options: { color: GREEN, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: c.name, options: { align: 'right', fontSize: 10, fontFace: 'Arial', color: '374151' } },
          { text: String(c.clause), options: { align: 'center', fontSize: 10, fontFace: 'Arial', color: '374151' } },
        ]);
      });
      slide3.addTable(clauseRows, {
        x: 0.5, y: 1.1, w: 9, border: { type: 'solid', pt: 0.5, color: 'E5E7EB' },
        rowH: 0.4, colW: [1.2, 1.5, 1.5, 4.0, 0.8], autoPage: false,
      });

      // ===== SLIDE 4: Sector Comparison =====
      const slide4 = pptx.addSlide();
      slide4.background = { color: LIGHT_BG };
      slide4.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.8, fill: { type: 'solid', color: PRIMARY } });
      slide4.addText('مقارنة القطاعات', {
        x: 0.5, y: 0.1, w: 9, h: 0.6, fontSize: 20, fontFace: 'Arial', color: WHITE, bold: true, align: 'right', rtlMode: true,
      });

      const sectorLabels: Record<string, string> = { public: 'القطاع الحكومي', private: 'القطاع الخاص' };
      stats.sectors.forEach((sector, idx) => {
        const xBase = idx === 0 ? 5.2 : 0.3;
        const sName = sectorLabels[sector.sector] || sector.sector;
        const sTotal = sector.totalSites;
        const sCompliant = sector.compliant;
        const sRate = sTotal > 0 ? Math.round((sCompliant / sTotal) * 100) : 0;

        slide4.addShape(pptx.ShapeType.roundRect, {
          x: xBase, y: 1.1, w: 4.5, h: 4.0,
          fill: { type: 'solid', color: WHITE },
          shadow: { type: 'outer', blur: 8, offset: 2, color: '00000015' },
          rectRadius: 0.15,
        });
        slide4.addText(sName, {
          x: xBase, y: 1.2, w: 4.5, h: 0.5, fontSize: 16, fontFace: 'Arial', color: PRIMARY, bold: true, align: 'center', rtlMode: true,
        });
        slide4.addText(`${sRate}%`, {
          x: xBase, y: 1.7, w: 4.5, h: 0.6, fontSize: 32, fontFace: 'Arial', color: sRate >= 50 ? GREEN : RED, bold: true, align: 'center',
        });
        slide4.addText('معدل الامتثال', {
          x: xBase, y: 2.2, w: 4.5, h: 0.3, fontSize: 10, fontFace: 'Arial', color: GRAY, align: 'center', rtlMode: true,
        });

        const sectorStats = [
          { label: 'إجمالي', value: sTotal, color: ACCENT },
          { label: 'ممتثلة', value: sCompliant, color: GREEN },
          { label: 'جزئية', value: sector.partiallyCompliant, color: AMBER },
          { label: 'غير ممتثلة', value: sector.nonCompliant, color: RED },
          { label: 'لا يعمل', value: sector.noPolicy, color: GRAY },
        ];
        sectorStats.forEach((ss, si) => {
          const yy = 2.7 + si * 0.4;
          slide4.addText(`${ss.label}: ${ss.value}`, {
            x: xBase + 0.3, y: yy, w: 3.9, h: 0.35,
            fontSize: 11, fontFace: 'Arial', color: ss.color, align: 'right', rtlMode: true,
          });
        });
      });

      // ===== SLIDE 5: Category Breakdown =====
      const slide5 = pptx.addSlide();
      slide5.background = { color: LIGHT_BG };
      slide5.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.8, fill: { type: 'solid', color: PRIMARY } });
      slide5.addText('توزيع التصنيفات', {
        x: 0.5, y: 0.1, w: 9, h: 0.6, fontSize: 20, fontFace: 'Arial', color: WHITE, bold: true, align: 'right', rtlMode: true,
      });

      const catRows: PptxGenJS.TableRow[] = [
        [
          { text: 'النسبة', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: 'لا يعمل', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: 'غير ممتثلة', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: 'جزئية', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: 'ممتثلة', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: 'الإجمالي', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: 'التصنيف', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'right', fontSize: 10, fontFace: 'Arial' } },
        ],
      ];
      stats.categories.slice(0, 15).forEach((cat) => {
        const catTotal = cat.totalSites || 1;
        const catRate = Math.round((cat.compliant / catTotal) * 100);
        const rColor = catRate >= 50 ? GREEN : (catRate >= 25 ? AMBER : RED);
        catRows.push([
          { text: `${catRate}%`, options: { color: rColor, align: 'center', fontSize: 9, fontFace: 'Arial', bold: true } },
          { text: String(cat.noPolicy), options: { color: GRAY, align: 'center', fontSize: 9, fontFace: 'Arial' } },
          { text: String(cat.nonCompliant), options: { color: RED, align: 'center', fontSize: 9, fontFace: 'Arial' } },
          { text: String(cat.partiallyCompliant), options: { color: AMBER, align: 'center', fontSize: 9, fontFace: 'Arial' } },
          { text: String(cat.compliant), options: { color: GREEN, align: 'center', fontSize: 9, fontFace: 'Arial' } },
          { text: String(cat.totalSites), options: { align: 'center', fontSize: 9, fontFace: 'Arial', color: '374151' } },
          { text: cat.category, options: { align: 'right', fontSize: 9, fontFace: 'Arial', color: '374151' } },
        ]);
      });
      slide5.addTable(catRows, {
        x: 0.3, y: 1.1, w: 9.4, border: { type: 'solid', pt: 0.5, color: 'E5E7EB' },
        rowH: 0.35, colW: [1.0, 1.2, 1.2, 1.0, 1.0, 1.0, 3.0], autoPage: false,
      });

      // ===== SLIDE 6: Sector Clause Comparison =====
      const slide6 = pptx.addSlide();
      slide6.background = { color: LIGHT_BG };
      slide6.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.8, fill: { type: 'solid', color: PRIMARY } });
      slide6.addText('مقارنة بنود المادة 12 حسب القطاع', {
        x: 0.5, y: 0.1, w: 9, h: 0.6, fontSize: 20, fontFace: 'Arial', color: WHITE, bold: true, align: 'right', rtlMode: true,
      });

      const clauseCompRows: PptxGenJS.TableRow[] = [
        [
          { text: 'خاص', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: 'حكومي', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: 'الإجمالي', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'center', fontSize: 10, fontFace: 'Arial' } },
          { text: 'البند', options: { bold: true, color: WHITE, fill: { color: PRIMARY }, align: 'right', fontSize: 10, fontFace: 'Arial' } },
        ],
      ];
      const publicSector = stats.sectors.find(s => s.sector === 'public');
      const privateSector = stats.sectors.find(s => s.sector === 'private');
      stats.clauses.forEach((c) => {
        const pubC = publicSector?.clauses.find(cl => cl.clause === c.clause);
        const prvC = privateSector?.clauses.find(cl => cl.clause === c.clause);
        const pubTotal = publicSector?.totalSites || 1;
        const prvTotal = privateSector?.totalSites || 1;
        const pubPct = pubC ? Math.round((pubC.compliant / pubTotal) * 100) : 0;
        const prvPct = prvC ? Math.round((prvC.compliant / prvTotal) * 100) : 0;
        clauseCompRows.push([
          { text: `${prvPct}%`, options: { color: prvPct >= 50 ? GREEN : RED, align: 'center', fontSize: 10, fontFace: 'Arial', bold: true } },
          { text: `${pubPct}%`, options: { color: pubPct >= 50 ? GREEN : RED, align: 'center', fontSize: 10, fontFace: 'Arial', bold: true } },
          { text: `${c.percentage}%`, options: { color: c.percentage >= 50 ? GREEN : RED, align: 'center', fontSize: 10, fontFace: 'Arial', bold: true } },
          { text: `بند ${c.clause}: ${c.name}`, options: { align: 'right', fontSize: 10, fontFace: 'Arial', color: '374151' } },
        ]);
      });
      slide6.addTable(clauseCompRows, {
        x: 0.5, y: 1.1, w: 9, border: { type: 'solid', pt: 0.5, color: 'E5E7EB' },
        rowH: 0.42, colW: [1.5, 1.5, 1.5, 4.5], autoPage: false,
      });

      // ===== SLIDE 7: Closing =====
      const slideEnd = pptx.addSlide();
      slideEnd.background = { color: PRIMARY };
      slideEnd.addShape(pptx.ShapeType.rect, { x: 0, y: 4.8, w: '100%', h: 0.08, fill: { type: 'solid', color: ACCENT } });
      slideEnd.addText('شكراً لكم', {
        x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 36, fontFace: 'Arial', color: WHITE, bold: true, align: 'center', rtlMode: true,
      });
      slideEnd.addText(`تقرير لوحة المؤشرات القيادية - ${dateStr}`, {
        x: 0.5, y: 2.8, w: 9, h: 0.5, fontSize: 14, fontFace: 'Arial', color: '78909C', align: 'center', rtlMode: true,
      });
      slideEnd.addText('منصة راصد - الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)', {
        x: 0.5, y: 3.3, w: 9, h: 0.4, fontSize: 12, fontFace: 'Arial', color: '78909C', align: 'center', rtlMode: true,
      });

      const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
      const filename = `rasid_leadership_report_${new Date().toISOString().slice(0, 10)}.pptx`;
      const fileKey = `reports/pptx/rasid_leadership_report_${new Date().toISOString().slice(0, 10)}-${Date.now()}.pptx`;
      const { url } = await storagePut(fileKey, Buffer.from(pptxBuffer), 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      return { url, filename };
    }),
  }),

  // ===== Cron Engine =====
  cronEngine: router({
    status: protectedProcedure.query(async () => {
      return { running: cronEngineRunning, lastCheck: lastCronCheck?.toISOString() || null };
    }),
    start: adminProcedure.mutation(async () => {
      startCronEngine();
      return { success: true, message: 'تم تشغيل محرك الجدولة' };
    }),
    stop: adminProcedure.mutation(async () => {
      stopCronEngine();
      return { success: true, message: 'تم إيقاف محرك الجدولة' };
    }),
    runNow: adminProcedure.input(z.object({ scheduleId: z.number() })).mutation(async ({ input }) => {
      await executeSchedule(input.scheduleId);
      return { success: true, message: 'تم تنفيذ الجدولة' };
    }),
    history: protectedProcedure.input(z.object({ scheduleId: z.number() })).query(async ({ input }) => {
      return await db.getScheduleExecutionHistory(input.scheduleId);
    }),
  }),

  // ===== Role Dashboard =====
  roleDashboard: router({
    getData: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      const builtInSession = (ctx.req as any).headers?.['x-rasid-session'];
      let rasidRole = (user as any)?.rasidRole || 'monitoring_officer';
      
      // Get role-specific data
      const dashStats = await db.getDashboardStats();
      const caseStats = await db.getCaseStats();
      
      // Get user-specific cases
      const myCases = await db.getCases({ assignedTo: user?.id, limit: 5 });
      const myRequests = await db.getCases({ requesterId: user?.id, limit: 5 });
      
      // Get recent alerts
      const alerts = await db.getComplianceAlerts({ limit: 5 });
      
      // Get recent scans
      const recentScans = await db.getScans({ limit: 5 });
      
      // Get schedules
      const schedules = await db.getScanSchedules();
      
      return {
        role: rasidRole,
        stats: dashStats,
        caseStats,
        myCases: myCases.cases,
        myRequests: myRequests.cases,
        alerts: alerts.alerts,
        recentScans: recentScans.scans,
        schedules,
      };
    }),
  }),

  // ===== Escalation System =====
  escalation: router({
    rules: protectedProcedure.query(async () => {
      return await db.getEscalationRules();
    }),
    getRule: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getEscalationRuleById(input.id);
    }),
    createRule: adminProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      fromStage: z.string(),
      toStage: z.string(),
      maxHours: z.number().min(1),
      escalatePriority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      appliesTo: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      notifyRoles: z.array(z.string()).optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.insertEscalationRule({
        ...input,
        createdBy: ctx.user.id,
      });
      if (!result) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'فشل في إنشاء قاعدة التصعيد' });
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'create_escalation_rule',
        details: `إنشاء قاعدة تصعيد: ${input.name}`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
        userAgent: ctx.req.headers['user-agent'] || '',
      });
      return result;
    }),
    updateRule: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      fromStage: z.string().optional(),
      toStage: z.string().optional(),
      maxHours: z.number().min(1).optional(),
      escalatePriority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      appliesTo: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      notifyRoles: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await db.updateEscalationRule(id, updates as any);
      return { success: true };
    }),
    deleteRule: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteEscalationRule(input.id);
      return { success: true };
    }),
    logs: protectedProcedure.input(z.object({
      caseId: z.number().optional(),
      ruleId: z.number().optional(),
      limit: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getEscalationLogs(input || {});
    }),
    stats: protectedProcedure.query(async () => {
      return await db.getEscalationStats();
    }),
    runNow: adminProcedure.mutation(async () => {
      const count = await checkAndEscalateCases();
      return { success: true, escalatedCount: count, message: `تم تصعيد ${count} حالة` };
    }),
  }),

  // ===== CHANGE DETECTION =====
  changeDetection: router({
    logs: protectedProcedure.input(z.object({
      siteId: z.number().optional(),
      significantOnly: z.boolean().optional(),
      limit: z.number().optional(),
      offset: z.number().optional(),
    })).query(async ({ input }) => {
      return db.getChangeDetectionLogs(input);
    }),
    stats: protectedProcedure.query(async () => {
      return db.getChangeDetectionStats();
    }),
    detect: protectedProcedure.input(z.object({
      siteId: z.number(),
      scanId: z.number(),
    })).mutation(async ({ input }) => {
      const result = await db.detectChanges(input.siteId, input.scanId);
      return result;
    }),
  }),

  // ===== SYSTEM SETTINGS =====
  settings: router({
    list: protectedProcedure.input(z.object({
      category: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      return db.getSystemSettings(input?.category);
    }),
    get: protectedProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
      return db.getSystemSetting(input.key);
    }),
    update: adminProcedure.input(z.object({
      key: z.string(),
      value: z.string(),
      type: z.string().optional(),
      category: z.string().optional(),
      label: z.string().optional(),
      description: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.upsertSystemSetting({
        key: input.key,
        value: input.value,
        type: input.type,
        category: input.category,
        label: input.label,
        description: input.description,
        updatedBy: ctx.user.id,
      });
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'settings_update',
        details: `تحديث إعداد: ${input.key} = ${input.value}`,
      });
      return result;
    }),
    seed: adminProcedure.mutation(async () => {
      const count = await db.seedDefaultSettings();
      return { success: true, count };
    }),
    emailStatus: protectedProcedure.query(async () => {
      const { isEmailConfigured, getSmtpConfig } = await import('./email');
      const config = getSmtpConfig();
      return {
        configured: isEmailConfigured(),
        host: config.host || '',
        port: config.port,
        user: config.user ? config.user.substring(0, 3) + '***' : '',
        from: config.from || '',
        fromName: config.fromName || '',
        secure: config.secure,
      };
    }),
    saveSmtpConfig: adminProcedure.input(z.object({
      host: z.string(),
      port: z.number().min(1).max(65535),
      user: z.string(),
      pass: z.string(),
      from: z.string(),
      fromName: z.string(),
      secure: z.boolean().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { updateSmtpConfig } = await import('./email');
      // Save to system_settings table
      const smtpSettings = [
        { key: 'smtp_host', value: input.host, label: 'خادم SMTP', category: 'email' },
        { key: 'smtp_port', value: String(input.port), label: 'منفذ SMTP', category: 'email' },
        { key: 'smtp_user', value: input.user, label: 'مستخدم SMTP', category: 'email' },
        { key: 'smtp_pass', value: input.pass, label: 'كلمة مرور SMTP', category: 'email' },
        { key: 'smtp_from', value: input.from, label: 'بريد المرسل', category: 'email' },
        { key: 'smtp_from_name', value: input.fromName, label: 'اسم المرسل', category: 'email' },
        { key: 'smtp_secure', value: input.secure ? 'true' : 'false', label: 'اتصال آمن', category: 'email' },
      ];
      for (const s of smtpSettings) {
        await db.upsertSystemSetting({ key: s.key, value: s.value, type: 'string', category: s.category, label: s.label, updatedBy: ctx.user.id });
      }
      // Update in-memory config
      updateSmtpConfig({
        host: input.host,
        port: input.port,
        user: input.user,
        pass: input.pass,
        from: input.from,
        fromName: input.fromName,
        secure: input.secure ?? input.port === 465,
      });
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'smtp_config_update',
        details: `تحديث إعدادات SMTP: ${input.host}:${input.port}`,
      });
      return { success: true };
    }),
    verifySmtp: adminProcedure.mutation(async () => {
      const { verifySmtpConnection, isEmailConfigured } = await import('./email');
      if (!isEmailConfigured()) {
        return { success: false, error: 'خدمة البريد غير مهيأة. يرجى ضبط إعدادات SMTP أولاً.' };
      }
      return verifySmtpConnection();
    }),
    sendTestEmail: adminProcedure.input(z.object({
      to: z.string().email(),
    })).mutation(async ({ input }) => {
      const { sendEmail, buildRasidEmailTemplate, isEmailConfigured } = await import('./email');
      if (!isEmailConfigured()) {
        return { success: false, error: 'خدمة البريد غير مهيأة. يرجى ضبط إعدادات SMTP.' };
      }
      const html = buildRasidEmailTemplate({
        title: 'رسالة اختبارية',
        body: '<p>هذه رسالة اختبارية من منصة راصد. إذا وصلتك هذه الرسالة، فإن خدمة البريد الإلكتروني تعمل بشكل صحيح.</p>',
      });
      return sendEmail({ to: input.to, subject: '✉️ رسالة اختبارية - منصة راصد', html });
    }),
  }),

  // ===== PASSWORD RESET =====
  passwordReset: router({
    request: publicProcedure.input(z.object({
      email: z.string().email(),
    })).mutation(async ({ input }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user) {
        // Don't reveal if email exists
        return { success: true, message: 'إذا كان البريد مسجلاً، سيتم إرسال رابط إعادة التعيين' };
      }
      const token = await db.createPasswordResetToken(user.id);
      // In production, send email with reset link
      // For now, notify owner with the token
      await notifyOwner({
        title: 'طلب إعادة تعيين كلمة المرور',
        content: `المستخدم ${user.displayName || user.name} (${user.email}) طلب إعادة تعيين كلمة المرور. رمز التحقق: ${token}`,
      }).catch(() => {});
      return { success: true, message: 'إذا كان البريد مسجلاً، سيتم إرسال رابط إعادة التعيين' };
    }),
    validate: publicProcedure.input(z.object({
      token: z.string(),
    })).query(async ({ input }) => {
      const record = await db.validatePasswordResetToken(input.token);
      return { valid: !!record };
    }),
    reset: publicProcedure.input(z.object({
      token: z.string(),
      newPassword: z.string().min(6),
    })).mutation(async ({ input }) => {
      const record = await db.validatePasswordResetToken(input.token);
      if (!record) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'رمز التحقق غير صالح أو منتهي الصلاحية' });
      }
      const passwordHash = await bcrypt.hash(input.newPassword, 10);
      await db.updatePassword(record.userId, passwordHash);
      await db.markPasswordResetTokenUsed(input.token);
      return { success: true, message: 'تم إعادة تعيين كلمة المرور بنجاح' };
    }),
  }),

  // ===== ADMIN: UPDATE USER DETAILS =====
  adminUsers: router({
    updateDetails: adminProcedure.input(z.object({
      userId: z.number(),
      name: z.string().optional(),
      displayName: z.string().optional(),
      email: z.string().optional(),
      mobile: z.string().optional(),
      rasidRole: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      await db.updateUserDetails(input.userId, input);
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'user_update',
        details: `تحديث بيانات المستخدم #${input.userId}`,
      });
      return { success: true };
    }),
    resetPassword: adminProcedure.input(z.object({
      userId: z.number(),
      newPassword: z.string().min(6),
    })).mutation(async ({ input, ctx }) => {
      const passwordHash = await bcrypt.hash(input.newPassword, 10);
      await db.updatePassword(input.userId, passwordHash);
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'password_reset_admin',
        details: `إعادة تعيين كلمة مرور المستخدم #${input.userId}`,
      });
      return { success: true };
    }),
  }),

  // ===== ADVANCED ANALYTICS =====
  analytics: router({
    monthlyTrends: protectedProcedure.input(z.object({
      months: z.number().min(1).max(60).default(12),
    }).optional()).query(async ({ input }) => {
      const months = input?.months || 12;
      const trends = await db.getMonthlyComplianceTrends(months);
      return { trends };
    }),

    sectorTrends: protectedProcedure.input(z.object({
      months: z.number().min(1).max(60).default(12),
    }).optional()).query(async ({ input }) => {
      const months = input?.months || 12;
      const trends = await db.getSectorMonthlyTrends(months);
      return { trends };
    }),

    categoryTrends: protectedProcedure.input(z.object({
      months: z.number().min(1).max(60).default(12),
    }).optional()).query(async ({ input }) => {
      const months = input?.months || 12;
      const trends = await db.getCategoryMonthlyTrends(months);
      return { trends };
    }),

    clauseTrends: protectedProcedure.input(z.object({
      months: z.number().min(1).max(60).default(12),
    }).optional()).query(async ({ input }) => {
      const months = input?.months || 12;
      const trends = await db.getClauseTrends(months);
      return { trends };
    }),
  }),

  // ===== API KEYS MANAGEMENT =====
  apiKeys: router({
    list: adminProcedure.query(async ({ ctx }) => {
      const keys = await db.getApiKeys();
      return { keys };
    }),

    create: adminProcedure.input(z.object({
      name: z.string().min(1).max(100),
      permissions: z.array(z.string()).default(["read:sites", "read:scans", "read:stats"]),
    })).mutation(async ({ input, ctx }) => {
      const crypto = await import('crypto');
      const rawKey = `rsk_${crypto.randomBytes(32).toString('hex')}`;
      const keyHash = await bcrypt.hash(rawKey, 10);
      const keyPrefix = rawKey.substring(0, 12);
      const result = await db.createApiKey({
        userId: ctx.user.id,
        keyHash,
        keyPrefix,
        name: input.name,
        permissions: input.permissions,
      });
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'api_key_created',
        details: `إنشاء مفتاح API: ${input.name}`,
      });
      return { key: rawKey, id: (result as any)?.id, prefix: keyPrefix };
    }),

    revoke: adminProcedure.input(z.object({
      keyId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      await db.revokeApiKey(input.keyId);
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'api_key_revoked',
        details: `إلغاء مفتاح API #${input.keyId}`,
      });
      return { success: true };
    }),

    delete: adminProcedure.input(z.object({
      keyId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      await db.deleteApiKey(input.keyId);
      return { success: true };
    }),
  }),

  // ===== SYSTEM HEALTH DASHBOARD =====
  systemHealth: router({
    metrics: adminProcedure.query(async () => {
      const metrics = await db.getSystemHealthMetrics();
      if (!metrics) return null;
      
      // Add server runtime info
      const uptime = process.uptime();
      const memUsage = process.memoryUsage();
      
      return {
        ...metrics,
        server: {
          uptime: Math.floor(uptime),
          uptimeFormatted: formatUptime(uptime),
          memoryUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          memoryTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          memoryRss: Math.round(memUsage.rss / 1024 / 1024),
          nodeVersion: process.version,
          platform: process.platform,
          pid: process.pid,
        },
      };
    }),

    scanActivity: adminProcedure.input(z.object({
      days: z.number().min(1).max(90).default(30),
    }).optional()).query(async ({ input }) => {
      return db.getScanActivityByDay(input?.days || 30);
    }),

    apiUsage: adminProcedure.input(z.object({
      days: z.number().min(1).max(90).default(30),
    }).optional()).query(async ({ input }) => {
      return db.getApiUsageByDay(input?.days || 30);
    }),
  }),

  // ===== SCHEDULED REPORTS =====
  scheduledReports: router({
    list: adminProcedure.query(async () => {
      return db.getScheduledReports();
    }),

    getById: adminProcedure.input(z.object({
      id: z.number(),
    })).query(async ({ input }) => {
      return db.getScheduledReportById(input.id);
    }),

    create: adminProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      reportType: z.enum(["compliance_summary", "sector_comparison", "trend_analysis", "full_report", "monthly_comparison"]),
      frequency: z.enum(["daily", "weekly", "monthly"]),
      dayOfWeek: z.number().min(0).max(6).optional(),
      dayOfMonth: z.number().min(1).max(31).optional(),
      hour: z.number().min(0).max(23).default(8),
      recipients: z.array(z.number()).optional(),
      filters: z.any().optional(),
      includeCharts: z.boolean().default(true),
    })).mutation(async ({ input, ctx }) => {
      const nextSendAt = calculateNextSendTime(input.frequency, input.hour, input.dayOfWeek, input.dayOfMonth);
      const result = await db.createScheduledReport({
        ...input,
        recipients: input.recipients || [],
        filters: input.filters || {},
        nextSendAt,
        createdBy: ctx.user.id,
      });
      return result;
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      reportType: z.enum(["compliance_summary", "sector_comparison", "trend_analysis", "full_report", "monthly_comparison"]).optional(),
      frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
      dayOfWeek: z.number().min(0).max(6).optional(),
      dayOfMonth: z.number().min(1).max(31).optional(),
      hour: z.number().min(0).max(23).optional(),
      recipients: z.array(z.number()).optional(),
      filters: z.any().optional(),
      includeCharts: z.boolean().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (data.frequency || data.hour !== undefined || data.dayOfWeek !== undefined || data.dayOfMonth !== undefined) {
        const report = await db.getScheduledReportById(id);
        if (report) {
          const freq = data.frequency || report.frequency;
          const hr = data.hour ?? report.hour ?? 8;
          const dow = data.dayOfWeek ?? report.dayOfWeek;
          const dom = data.dayOfMonth ?? report.dayOfMonth;
          (data as any).nextSendAt = calculateNextSendTime(freq, hr, dow ?? undefined, dom ?? undefined);
        }
      }
      await db.updateScheduledReport(id, data as any);
      return { success: true };
    }),

    delete: adminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      await db.deleteScheduledReport(input.id);
      return { success: true };
    }),

    toggle: adminProcedure.input(z.object({
      id: z.number(),
      isActive: z.boolean(),
    })).mutation(async ({ input }) => {
      await db.updateScheduledReport(input.id, { isActive: input.isActive });
      return { success: true };
    }),

    executions: adminProcedure.input(z.object({
      reportId: z.number(),
    })).query(async ({ input }) => {
      return db.getReportExecutions(input.reportId);
    }),

    runNow: adminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      const report = await db.getScheduledReportById(input.id);
      if (!report) throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
      await executeScheduledReport(report);
      return { success: true };
    }),
  }),

  // ===== COMPLIANCE COMPARISON =====
  complianceComparison: router({
    search: protectedProcedure.input(z.object({
      query: z.string().min(1),
    })).query(async ({ input }) => {
      return db.searchSitesForComparison(input.query);
    }),

    compare: protectedProcedure.input(z.object({
      siteIds: z.array(z.number()).min(2).max(10),
    })).query(async ({ input }) => {
      return db.getComparisonData(input.siteIds);
    }),
  }),

  // ===== CUSTOM REPORT EXPORT =====
  customReports: router({
    getData: protectedProcedure.input(z.object({
      modules: z.array(z.string()).min(1),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      sector: z.string().optional(),
      category: z.string().optional(),
    })).query(async ({ input }) => {
      const filters: any = {};
      if (input.dateFrom) filters.dateFrom = new Date(input.dateFrom);
      if (input.dateTo) filters.dateTo = new Date(input.dateTo);
      if (input.sector) filters.sector = input.sector;
      if (input.category) filters.category = input.category;
      return db.getCustomReportData(input.modules, filters);
    }),

    exportExcel: protectedProcedure.input(z.object({
      modules: z.array(z.string()).min(1),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const filters: any = {};
      if (input.dateFrom) filters.dateFrom = new Date(input.dateFrom);
      if (input.dateTo) filters.dateTo = new Date(input.dateTo);
      const data = await db.getCustomReportData(input.modules, filters);
      
      const sheets: ExcelSheetData[] = [];
      if (data.generalStats) {
        sheets.push({
          name: 'الإحصائيات العامة',
          columns: [{ header: 'المؤشر', key: 'label', width: 30 }, { header: 'القيمة', key: 'value', width: 20 }],
          rows: [
            { label: 'إجمالي المواقع', value: data.generalStats.totalSites },
            { label: 'إجمالي الفحوصات', value: data.generalStats.totalScans },
            { label: 'ممتثل', value: data.generalStats.compliant },
            { label: 'ممتثل جزئياً', value: data.generalStats.partial },
            { label: 'غير ممتثل', value: data.generalStats.nonCompliant },
          ],
        });
      }
      if (data.complianceBreakdown) {
        sheets.push({
          name: 'تفاصيل الامتثال',
          columns: [
            { header: 'النطاق', key: 'domain', width: 35 }, { header: 'النسبة', key: 'score', width: 15 },
            { header: 'الحالة', key: 'status', width: 20 }, { header: 'التقييم', key: 'rating', width: 15 },
          ],
          rows: data.complianceBreakdown.map((s: any) => ({ domain: s.domain, score: s.overallScore, status: statusToArabic(s.complianceStatus), rating: s.rating })),
        });
      }
      if (data.article12Clauses) {
        sheets.push({
          name: 'بنود المادة 12',
          columns: [
            { header: 'رقم البند', key: 'clause', width: 12 }, { header: 'اسم البند', key: 'name', width: 40 },
            { header: 'ممتثل', key: 'compliant', width: 12 }, { header: 'الإجمالي', key: 'total', width: 12 },
            { header: 'النسبة %', key: 'rate', width: 12 },
          ],
          rows: data.article12Clauses.map((c: any) => ({ clause: c.clause, name: c.name, compliant: c.compliant, total: c.total, rate: `${c.rate}%` })),
        });
      }
      if (data.sectorComparison) {
        sheets.push({
          name: 'مقارنة القطاعات',
          columns: [
            { header: 'القطاع', key: 'sector', width: 20 }, { header: 'الإجمالي', key: 'total', width: 15 },
            { header: 'ممتثل', key: 'compliant', width: 15 }, { header: 'النسبة %', key: 'rate', width: 15 },
          ],
          rows: [
            { sector: 'حكومي', total: data.sectorComparison.public.total, compliant: data.sectorComparison.public.compliant, rate: `${data.sectorComparison.public.rate}%` },
            { sector: 'خاص', total: data.sectorComparison.private.total, compliant: data.sectorComparison.private.compliant, rate: `${data.sectorComparison.private.rate}%` },
          ],
        });
      }
      if (data.siteDetails) {
        sheets.push({
          name: 'تفاصيل المواقع',
          columns: [
            { header: 'النطاق', key: 'domain', width: 35 }, { header: 'اسم الموقع', key: 'siteName', width: 30 },
            { header: 'القطاع', key: 'sector', width: 15 }, { header: 'التصنيف', key: 'classification', width: 20 },
            { header: 'النسبة', key: 'score', width: 12 }, { header: 'الحالة', key: 'status', width: 20 },
          ],
          rows: data.siteDetails.map((s: any) => ({ domain: s.domain, siteName: s.siteName, sector: s.sector, classification: s.classification, score: s.latestScore, status: statusToArabic(s.latestStatus) })),
        });
      }
      
      const buffer = await createProfessionalExcel({
        title: 'تقرير مخصص - منصة راصد',
        subtitle: `الوحدات: ${input.modules.length} | ${input.dateFrom ? `من ${input.dateFrom}` : ''} ${input.dateTo ? `إلى ${input.dateTo}` : ''}`.trim(),
        userName: ctx.user?.name || ctx.user?.displayName || 'مستخدم',
        userRole: ctx.user?.rasidRole || ctx.user?.role || 'user',
        sheets,
      });
      const base64 = buffer.toString('base64');
      
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'custom_report_export',
        details: `تصدير تقرير مخصص (Excel) - الوحدات: ${input.modules.join(', ')}`,
      });
      
      return { base64, filename: `rasid-custom-report-${Date.now()}.xlsx` };
    }),

    exportPptx: protectedProcedure.input(z.object({
      modules: z.array(z.string()).min(1),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const filters: any = {};
      if (input.dateFrom) filters.dateFrom = new Date(input.dateFrom);
      if (input.dateTo) filters.dateTo = new Date(input.dateTo);
      const data = await db.getCustomReportData(input.modules, filters);
      
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'منصة راصد';
      pptx.title = 'تقرير مخصص - منصة راصد';
      
      // Cover slide
      const cover = pptx.addSlide();
      cover.background = { color: '1a5276' };
      cover.addText('تقرير مخصص', { x: 1, y: 1.5, w: 11, h: 1.5, fontSize: 36, color: 'FFFFFF', align: 'center', fontFace: 'Arial', bold: true });
      cover.addText('منصة الرصد الذكي - راصد', { x: 1, y: 3, w: 11, h: 1, fontSize: 20, color: 'B0C4DE', align: 'center', fontFace: 'Arial' });
      const dateStr = new Date().toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' });
      cover.addText(dateStr, { x: 1, y: 4, w: 11, h: 0.8, fontSize: 16, color: 'B0C4DE', align: 'center', fontFace: 'Arial' });
      
      if (data.generalStats) {
        const slide = pptx.addSlide();
        slide.addText('الإحصائيات العامة', { x: 0.5, y: 0.3, w: 12, h: 0.8, fontSize: 24, color: '1a5276', bold: true, align: 'right', fontFace: 'Arial' });
        const statsRows: any[][] = [
          [{ text: 'المؤشر', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }, { text: 'القيمة', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }],
          ['إجمالي المواقع', String(data.generalStats.totalSites)],
          ['إجمالي الفحوصات', String(data.generalStats.totalScans)],
          ['ممتثل', String(data.generalStats.compliant)],
          ['ممتثل جزئياً', String(data.generalStats.partial)],
          ['غير ممتثل', String(data.generalStats.nonCompliant)],
        ];
        slide.addTable(statsRows, { x: 1, y: 1.5, w: 11, h: 3, fontSize: 14, fontFace: 'Arial', border: { pt: 1, color: 'CCCCCC' }, align: 'center' });
      }
      
      if (data.article12Clauses) {
        const slide = pptx.addSlide();
        slide.addText('بنود المادة 12', { x: 0.5, y: 0.3, w: 12, h: 0.8, fontSize: 24, color: '1a5276', bold: true, align: 'right', fontFace: 'Arial' });
        const clauseRows: any[][] = [
          [{ text: '#', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }, { text: 'البند', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }, { text: 'ممتثل', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }, { text: 'الإجمالي', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }, { text: 'النسبة %', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }],
        ];
        data.article12Clauses.forEach((c: any) => {
          clauseRows.push([String(c.clause), c.name, String(c.compliant), String(c.total), `${c.rate}%`]);
        });
        slide.addTable(clauseRows, { x: 0.5, y: 1.5, w: 12, h: 4, fontSize: 12, fontFace: 'Arial', border: { pt: 1, color: 'CCCCCC' }, align: 'center' });
      }
      
      if (data.sectorComparison) {
        const slide = pptx.addSlide();
        slide.addText('مقارنة القطاعات', { x: 0.5, y: 0.3, w: 12, h: 0.8, fontSize: 24, color: '1a5276', bold: true, align: 'right', fontFace: 'Arial' });
        const sectorRows: any[][] = [
          [{ text: 'القطاع', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }, { text: 'الإجمالي', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }, { text: 'ممتثل', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }, { text: 'النسبة %', options: { bold: true, color: 'FFFFFF', fill: { color: '1a5276' } } }],
          ['حكومي', String(data.sectorComparison.public.total), String(data.sectorComparison.public.compliant), `${data.sectorComparison.public.rate}%`],
          ['خاص', String(data.sectorComparison.private.total), String(data.sectorComparison.private.compliant), `${data.sectorComparison.private.rate}%`],
        ];
        slide.addTable(sectorRows, { x: 2, y: 1.5, w: 9, h: 2, fontSize: 14, fontFace: 'Arial', border: { pt: 1, color: 'CCCCCC' }, align: 'center' });
      }
      
      // Closing slide
      const closing = pptx.addSlide();
      closing.background = { color: '1a5276' };
      closing.addText('شكراً لكم', { x: 1, y: 2, w: 11, h: 1.5, fontSize: 36, color: 'FFFFFF', align: 'center', fontFace: 'Arial', bold: true });
      closing.addText('منصة الرصد الذكي - راصد', { x: 1, y: 3.5, w: 11, h: 1, fontSize: 18, color: 'B0C4DE', align: 'center', fontFace: 'Arial' });
      
      const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
      const customFilename = `rasid-custom-report-${Date.now()}.pptx`;
      const fileKey = `reports/pptx/${customFilename}`;
      const { url } = await storagePut(fileKey, Buffer.from(pptxBuffer), 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'custom_report_export',
        details: `تصدير تقرير مخصص (PPTX) - الوحدات: ${input.modules.join(', ')}`,
      });
      
      return { url, filename: customFilename };
    }),
  }),

  // ===== KPI DASHBOARD =====
  kpiDashboard: router({
    getTargets: protectedProcedure.query(async () => {
      return db.getKpiTargets();
    }),

    getActuals: protectedProcedure.query(async () => {
      return db.calculateKpiActuals();
    }),

    createTarget: adminProcedure.input(z.object({
      name: z.string().min(1),
      nameAr: z.string().min(1),
      category: z.enum(['compliance', 'scanning', 'response', 'coverage', 'quality']),
      targetValue: z.number().min(0),
      unit: z.string().default('%'),
      period: z.enum(['monthly', 'quarterly', 'yearly']).default('monthly'),
      direction: z.enum(['higher_is_better', 'lower_is_better']).default('higher_is_better'),
      thresholdGreen: z.number().default(80),
      thresholdYellow: z.number().default(60),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.createKpiTarget({ ...input, updatedBy: ctx.user.id });
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'kpi_target_create',
        details: `إنشاء مؤشر أداء: ${input.nameAr}`,
      });
      return result;
    }),

    updateTarget: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      nameAr: z.string().optional(),
      category: z.enum(['compliance', 'scanning', 'response', 'coverage', 'quality']).optional(),
      targetValue: z.number().min(0).optional(),
      unit: z.string().optional(),
      period: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
      direction: z.enum(['higher_is_better', 'lower_is_better']).optional(),
      thresholdGreen: z.number().optional(),
      thresholdYellow: z.number().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await db.updateKpiTarget(id, { ...data, updatedBy: ctx.user.id });
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'kpi_target_update',
        details: `تحديث مؤشر أداء #${id}`,
      });
      return { success: true };
    }),

    deleteTarget: adminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input, ctx }) => {
      await db.deleteKpiTarget(input.id);
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'kpi_target_delete',
        details: `حذف مؤشر أداء #${input.id}`,
      });
      return { success: true };
    }),

    seedDefaults: adminProcedure.mutation(async ({ ctx }) => {
      const existing = await db.getKpiTargets();
      if (existing.length > 0) return { seeded: false, message: 'المؤشرات موجودة مسبقاً' };
      
      const defaults = [
        { name: 'Overall Compliance Rate', nameAr: 'نسبة الامتثال الكلية', category: 'compliance' as const, targetValue: 80, unit: '%', period: 'monthly' as const, direction: 'higher_is_better' as const, thresholdGreen: 80, thresholdYellow: 60 },
        { name: 'Monthly Scans Target', nameAr: 'عدد الفحوصات الشهرية', category: 'scanning' as const, targetValue: 100, unit: 'فحص', period: 'monthly' as const, direction: 'higher_is_better' as const, thresholdGreen: 80, thresholdYellow: 50 },
        { name: 'Average Compliance Score', nameAr: 'متوسط نسبة الامتثال', category: 'compliance' as const, targetValue: 75, unit: '%', period: 'monthly' as const, direction: 'higher_is_better' as const, thresholdGreen: 75, thresholdYellow: 50 },
        { name: 'Case Resolution Rate', nameAr: 'نسبة حل الحالات', category: 'response' as const, targetValue: 90, unit: '%', period: 'monthly' as const, direction: 'higher_is_better' as const, thresholdGreen: 90, thresholdYellow: 70 },
        { name: 'Site Coverage', nameAr: 'تغطية المواقع المفحوصة', category: 'coverage' as const, targetValue: 95, unit: '%', period: 'quarterly' as const, direction: 'higher_is_better' as const, thresholdGreen: 90, thresholdYellow: 70 },
        { name: 'Non-Compliant Reduction', nameAr: 'تقليل الجهات غير الممتثلة', category: 'quality' as const, targetValue: 10, unit: '%', period: 'quarterly' as const, direction: 'lower_is_better' as const, thresholdGreen: 10, thresholdYellow: 20 },
        { name: 'Active Schedules', nameAr: 'الجداول النشطة', category: 'scanning' as const, targetValue: 10, unit: 'جدول', period: 'monthly' as const, direction: 'higher_is_better' as const, thresholdGreen: 8, thresholdYellow: 5 },
        { name: 'Open Cases Target', nameAr: 'الحالات المفتوحة (أقل أفضل)', category: 'response' as const, targetValue: 20, unit: 'حالة', period: 'monthly' as const, direction: 'lower_is_better' as const, thresholdGreen: 20, thresholdYellow: 40 },
      ];
      
      for (const d of defaults) {
        await db.createKpiTarget({ ...d, updatedBy: ctx.user.id });
      }
      
      return { seeded: true, count: defaults.length };
    }),
  }),

  // ===== SMART ALERTS (AI-POWERED) =====
  smartAlerts: router({
    list: protectedProcedure.input(z.object({
      riskLevel: z.string().optional(),
      isActive: z.boolean().optional(),
    }).optional()).query(async ({ input }) => {
      return db.getSmartAlerts(input || {});
    }),

    stats: protectedProcedure.query(async () => {
      return db.getSmartAlertStats();
    }),

    getById: protectedProcedure.input(z.object({
      id: z.number(),
    })).query(async ({ input }) => {
      return db.getSmartAlertById(input.id);
    }),

    acknowledge: protectedProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input, ctx }) => {
      await db.acknowledgeSmartAlert(input.id, ctx.user.id);
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'smart_alert_acknowledge',
        details: `تأكيد استلام تنبيه ذكي #${input.id}`,
      });
      return { success: true };
    }),

    runAnalysis: adminProcedure.mutation(async ({ ctx }) => {
      // Get all sites with their latest scans
      const allSitesResult = await db.getSites({ page: 1, limit: 200 });
      const allSites = allSitesResult.sites || [];
      let alertsCreated = 0;
      
      for (const site of allSites) {
        try {
          const historyResult = await db.getSiteComplianceHistory(site.id);
          const history = historyResult.history || [];
          if (!history || history.length < 2) continue;
          
          // Analyze trend
          const recent = history.slice(-5);
          const scores = recent.map((h: any) => h.overallScore || 0);
          const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
          const latestScore = scores[scores.length - 1] || 0;
          const previousScore = scores.length > 1 ? scores[scores.length - 2] : latestScore;
          const trend = latestScore - previousScore;
          
          // Calculate risk factors
          const factors: any[] = [];
          let riskScore = 0;
          
          if (trend < -10) {
            factors.push({ factor: 'declining_score', weight: 0.3, description: `انخفاض النسبة بمقدار ${Math.abs(trend).toFixed(1)} نقطة` });
            riskScore += 30;
          } else if (trend < 0) {
            factors.push({ factor: 'slight_decline', weight: 0.15, description: `انخفاض طفيف بمقدار ${Math.abs(trend).toFixed(1)} نقطة` });
            riskScore += 15;
          }
          
          if (latestScore < 30) {
            factors.push({ factor: 'very_low_score', weight: 0.35, description: `نسبة امتثال منخفضة جداً: ${latestScore.toFixed(1)}%` });
            riskScore += 35;
          } else if (latestScore < 50) {
            factors.push({ factor: 'low_score', weight: 0.25, description: `نسبة امتثال منخفضة: ${latestScore.toFixed(1)}%` });
            riskScore += 25;
          }
          
          if (avgScore < 40) {
            factors.push({ factor: 'low_average', weight: 0.2, description: `متوسط النسبة التاريخي منخفض: ${avgScore.toFixed(1)}%` });
            riskScore += 20;
          }
          
          // Check for missing clauses
          const latestScan = (history as any[])[history.length - 1] as any;
          let missingClauses = 0;
          for (let i = 1; i <= 8; i++) {
            if (!(latestScan as any)[`clause${i}Compliant`]) missingClauses++;
          }
          if (missingClauses >= 6) {
            factors.push({ factor: 'many_missing_clauses', weight: 0.25, description: `${missingClauses} بنود غير مستوفاة من أصل 8` });
            riskScore += 25;
          } else if (missingClauses >= 4) {
            factors.push({ factor: 'some_missing_clauses', weight: 0.15, description: `${missingClauses} بنود غير مستوفاة من أصل 8` });
            riskScore += 15;
          }
          
          if (factors.length === 0 || riskScore < 20) continue;
          
          // Determine risk level
          let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
          if (riskScore >= 70) riskLevel = 'critical';
          else if (riskScore >= 50) riskLevel = 'high';
          else if (riskScore >= 30) riskLevel = 'medium';
          
          // Generate recommendations
          const recommendations: string[] = [];
          if (latestScore < 50) recommendations.push('مراجعة سياسة الخصوصية وتحديثها لتشمل جميع البنود المطلوبة');
          if (missingClauses >= 4) recommendations.push(`إضافة ${missingClauses} بنود مفقودة إلى صفحة الخصوصية`);
          if (trend < -10) recommendations.push('التحقق من التغييرات الأخيرة على الموقع التي أدت لانخفاض الامتثال');
          recommendations.push('جدولة فحص دوري لمتابعة التقدم');
          
          const predictedChange = riskScore >= 50 
            ? `يُتوقع انخفاض إضافي في نسبة الامتثال خلال الفترة القادمة` 
            : `قد تنخفض نسبة الامتثال إذا لم يتم اتخاذ إجراءات تصحيحية`;
          
          await db.createSmartAlert({
            siteId: site.id,
            riskLevel,
            riskScore,
            predictedChange,
            factors: JSON.stringify(factors),
            recommendations: JSON.stringify(recommendations),
            analysisData: JSON.stringify({ scores, avgScore, latestScore, trend, missingClauses }),
            isActive: true,
          });
          alertsCreated++;
        } catch (e) {
          // Skip sites with errors
          continue;
        }
      }
      
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'smart_alerts_analysis',
        details: `تشغيل تحليل التنبيهات الذكية - تم إنشاء ${alertsCreated} تنبيه`,
      });
      
      return { success: true, alertsCreated };
    }),

    runAiAnalysis: adminProcedure.mutation(async ({ ctx }) => {
      // Use LLM to analyze compliance data and generate smart alerts
      const allSitesResult = await db.getSites({ page: 1, limit: 5000 });
      const allSites = allSitesResult.sites || [];
      const sitesWithScans: any[] = [];
      
      for (const site of allSites.slice(0, 50)) { // Limit to 50 for LLM
        const historyResult = await db.getSiteComplianceHistory(site.id);
        const history = historyResult.history || [];
        if (history && history.length > 0) {
          sitesWithScans.push({
            id: site.id,
            domain: site.domain,
            siteName: site.siteName,
            scores: history.map((h: any) => ({ score: h.overallScore, status: h.complianceStatus, date: h.createdAt })),
          });
        }
      }
      
      if (sitesWithScans.length === 0) return { success: false, message: 'لا توجد بيانات كافية للتحليل' };
      
      const prompt = `أنت محلل امتثال ذكي. حلل بيانات المواقع التالية وحدد الجهات المعرضة لخطر انخفاض الامتثال.

البيانات:
${JSON.stringify(sitesWithScans.slice(0, 20), null, 2)}

لكل جهة معرضة للخطر، أعطني:
1. معرف الموقع (siteId)
2. مستوى الخطر (critical/high/medium/low)
3. درجة الخطر (0-100)
4. التغيير المتوقع
5. العوامل المؤثرة
6. التوصيات

أجب بصيغة JSON فقط كمصفوفة من الكائنات.`;
      
      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'أنت محلل بيانات متخصص في تحليل امتثال المواقع لنظام حماية البيانات الشخصية السعودي. أجب بصيغة JSON فقط.' },
            { role: 'user', content: prompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'smart_alerts',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  alerts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        siteId: { type: 'number' },
                        riskLevel: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                        riskScore: { type: 'number' },
                        predictedChange: { type: 'string' },
                        factors: { type: 'array', items: { type: 'object', properties: { factor: { type: 'string' }, weight: { type: 'number' }, description: { type: 'string' } }, required: ['factor', 'weight', 'description'], additionalProperties: false } },
                        recommendations: { type: 'array', items: { type: 'string' } },
                      },
                      required: ['siteId', 'riskLevel', 'riskScore', 'predictedChange', 'factors', 'recommendations'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['alerts'],
                additionalProperties: false,
              },
            },
          },
        });
        
        const content = response.choices?.[0]?.message?.content;
        if (!content) return { success: false, message: 'لم يتم الحصول على نتائج من الذكاء الاصطناعي' };
        
        const parsed = JSON.parse(content as string);
        let alertsCreated = 0;
        
        for (const alert of (parsed.alerts || [])) {
          if (!alert.siteId || !alert.riskLevel) continue;
          await db.createSmartAlert({
            siteId: alert.siteId,
            riskLevel: alert.riskLevel,
            riskScore: alert.riskScore || 50,
            predictedChange: alert.predictedChange || '',
            factors: JSON.stringify(alert.factors || []),
            recommendations: JSON.stringify(alert.recommendations || []),
            analysisData: JSON.stringify({ source: 'ai', model: 'llm' }),
            isActive: true,
          });
          alertsCreated++;
        }
        
        await db.insertActivityLog({
          userId: ctx.user.id,
          username: ctx.user.name || '',
          action: 'smart_alerts_ai_analysis',
          details: `تحليل ذكاء اصطناعي - تم إنشاء ${alertsCreated} تنبيه`,
        });
        
        return { success: true, alertsCreated };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }),
  }),

  // ============================================================
  // Enhanced Executive Dashboard Analytics
  // ============================================================
  executiveDashboard: router({
    // Radar chart data for Article 12 clauses
    radarChart: protectedProcedure.query(async () => {
      return db.getRadarChartData();
    }),

    // Heatmap data: sectors vs clauses
    heatmap: protectedProcedure.query(async () => {
      return db.getHeatmapData();
    }),

    // Region heatmap data: geographic compliance distribution
    regionHeatmap: publicProcedure.input(z.object({
      period: z.enum(["this_month", "last_month", "last_3_months", "last_6_months", "this_year", "all"]).default("all"),
    }).optional()).query(async ({ input }) => {
      return db.getRegionHeatmapData(input?.period || "all");
    }),

    // Bubble chart data: clauses vs sectors
    bubbleChart: protectedProcedure.query(async () => {
      return db.getBubbleChartData();
    }),

    // Compliance trend over time
    complianceTrend: protectedProcedure.input(z.object({ months: z.number().default(12) }).optional()).query(async ({ input }) => {
      return db.getComplianceTrendData(input?.months || 12);
    }),

    // Sector compliance trend
    sectorTrend: protectedProcedure.input(z.object({ months: z.number().default(12) }).optional()).query(async ({ input }) => {
      return db.getSectorComplianceTrend(input?.months || 12);
    }),

    // Improvement velocity
    improvementVelocity: protectedProcedure.input(z.object({ months: z.number().default(6) }).optional()).query(async ({ input }) => {
      return db.getImprovementVelocity(input?.months || 6);
    }),

    // Benchmarking data
    benchmarking: protectedProcedure.query(async () => {
      return db.getBenchmarkingData();
    }),

    // Predictive analytics with linear regression
    predictiveAnalytics: protectedProcedure.input(z.object({ months: z.number().default(12) }).optional()).query(async ({ input }) => {
      return db.getPredictiveAnalytics(input?.months || 12);
    }),

    // Master entity table with pagination and filtering
    entityTable: protectedProcedure.input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(25),
      sortBy: z.string().default('siteName'),
      sortOrder: z.string().default('asc'),
      sector: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      return db.getMasterEntityTable(
        input?.page || 1,
        input?.pageSize || 25,
        input?.sortBy || 'siteName',
        input?.sortOrder || 'asc',
        { sector: input?.sector, status: input?.status, search: input?.search }
      );
    }),

    // Dashboard snapshots
    snapshots: protectedProcedure.input(z.object({ limit: z.number().default(365) }).optional()).query(async ({ input }) => {
      return db.getDashboardSnapshots(input?.limit || 365);
    }),

    // Create snapshot (admin only)
    createSnapshot: adminProcedure.mutation(async () => {
      const stats = await db.getLeadershipStats();
      const radarData = await db.getRadarChartData();
      if (!stats) return { success: false, id: 0 };
      const g = stats.general;
      const snapshot = {
        snapshotDate: new Date(),
        totalWebsites: g.totalSites,
        compliantCount: g.compliant,
        partialCount: g.partiallyCompliant,
        nonCompliantCount: g.nonCompliant,
        noPolicyCount: g.noPolicy,
        averageScore: "0",
        criterion1Rate: String(radarData[0]?.rate || 0),
        criterion2Rate: String(radarData[1]?.rate || 0),
        criterion3Rate: String(radarData[2]?.rate || 0),
        criterion4Rate: String(radarData[3]?.rate || 0),
        criterion5Rate: String(radarData[4]?.rate || 0),
        criterion6Rate: String(radarData[5]?.rate || 0),
        criterion7Rate: String(radarData[6]?.rate || 0),
        criterion8Rate: String(radarData[7]?.rate || 0),
        sectorBreakdown: stats.sectors,
        domainTypeBreakdown: stats.categories,
      };
      const id = await db.createDashboardSnapshot(snapshot);
      return { success: true, id };
    }),
  }),

  // ============================================================
  // Executive Alerts Management
  // ============================================================
  executiveAlerts: router({
    list: protectedProcedure.input(z.object({
      severity: z.string().optional(),
      acknowledged: z.boolean().optional(),
      limit: z.number().default(100),
    }).optional()).query(async ({ input }) => {
      return db.getExecutiveAlerts({
        severity: input?.severity,
        acknowledged: input?.acknowledged,
        limit: input?.limit || 100,
      });
    }),

    stats: protectedProcedure.query(async () => {
      return db.getExecutiveAlertStats();
    }),

    acknowledge: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      await db.acknowledgeExecutiveAlert(input.id, ctx.user.id);
      return { success: true };
    }),

    create: adminProcedure.input(z.object({
      severity: z.enum(["critical", "high", "medium", "low"]),
      alertType: z.string(),
      entityId: z.number().optional(),
      entityName: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
      suggestedAction: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createExecutiveAlert(input);
      return { success: true, id };
    }),

    // Auto-generate alerts based on current data
    generateAlerts: adminProcedure.mutation(async () => {
      const statsData = await db.getLeadershipStats();
      if (!statsData) return { success: true, alertsCreated: 0 };
      const s = statsData.general;
      const alertsCreated: number[] = [];
      
      // Critical: Non-compliant rate > 30%
      const nonCompliantRate = s.totalSites > 0 ? (s.nonCompliant / s.totalSites) * 100 : 0;
      if (nonCompliantRate > 30) {
        const id = await db.createExecutiveAlert({
          severity: "critical",
          alertType: "high_non_compliance",
          title: `معدل عدم الامتثال مرتفع: ${Math.round(nonCompliantRate)}%`,
          description: `${s.nonCompliant} جهة من أصل ${s.totalSites} غير ممتثلة`,
          suggestedAction: "مراجعة الجهات غير الممتثلة وإرسال خطابات إشعار عاجلة",
        });
        alertsCreated.push(id);
      }
      
      // High: No policy sites > 10%
      const noPolicyRate = s.totalSites > 0 ? (s.noPolicy / s.totalSites) * 100 : 0;
      if (noPolicyRate > 10) {
        const id = await db.createExecutiveAlert({
          severity: "high",
          alertType: "missing_policies",
          title: `${s.noPolicy} جهة لا تعمل`,
          description: `${Math.round(noPolicyRate)}% من الجهات لا تملك سياسة خصوصية منشورة`,
          suggestedAction: "التواصل مع الجهات لإلزامها بنشر سياسة خصوصية",
        });
        alertsCreated.push(id);
      }
      
      return { success: true, alertsCreated: alertsCreated.length };
    }),
  }),

  // ============================================================
  // Advanced Search & Saved Filters
  // ============================================================
  advancedSearch: router({
    search: protectedProcedure.input(z.object({
      search: z.string().optional(),
      sector: z.string().optional(),
      classification: z.string().optional(),
      complianceStatus: z.string().optional(),
      siteStatus: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      hasPrivacyPolicy: z.boolean().optional(),
      minScore: z.number().optional(),
      maxScore: z.number().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(25),
    })).query(async ({ input }) => {
      return db.advancedSearch(input);
    }),

    // Saved Filters CRUD
    savedFilters: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getSavedFilters(ctx.user.id);
      }),

      create: protectedProcedure.input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        filters: z.record(z.string(), z.any()),
        isDefault: z.boolean().default(false),
        isShared: z.boolean().default(false),
      })).mutation(async ({ input, ctx }) => {
        const id = await db.createSavedFilter({
          userId: ctx.user.id,
          name: input.name,
          description: input.description || null,
          filters: input.filters,
          isDefault: input.isDefault,
          isShared: input.isShared,
        });
        return { success: true, id };
      }),

      update: protectedProcedure.input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        filters: z.record(z.string(), z.any()).optional(),
        isDefault: z.boolean().optional(),
        isShared: z.boolean().optional(),
      })).mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await db.updateSavedFilter(id, ctx.user.id, data as any);
        return { success: true };
      }),

      delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
        await db.deleteSavedFilter(input.id, ctx.user.id);
        return { success: true };
      }),

      use: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
        await db.incrementFilterUsage(input.id);
        return { success: true };
      }),
    }),
  }),

  // ============================================================
  // PDF Report Generation
  // ============================================================
  // ===== Time Comparison =====
  timeComparison: router({
    getDetailed: protectedProcedure.query(async () => {
      return await db.getDetailedTimeComparison();
    }),
  }),

  // ===== User Dashboard Widgets =====
  userWidgets: router({
    getWidgets: protectedProcedure.query(async ({ ctx }) => {
      return await db.initDefaultWidgets(ctx.user.id);
    }),
    saveWidgets: protectedProcedure.input(z.object({
      widgets: z.array(z.object({
        widgetType: z.string(),
        title: z.string(),
        position: z.number(),
        gridWidth: z.number(),
        isVisible: z.boolean(),
        config: z.any().optional(),
      })),
    })).mutation(async ({ ctx, input }) => {
      return await db.saveUserDashboardWidgets(ctx.user.id, input.widgets);
    }),
  }),

  // ===== Visual Alerts =====
  visualAlerts: router({
    getAlerts: protectedProcedure.input(z.object({
      limit: z.number().optional().default(50),
    }).optional()).query(async ({ ctx, input }) => {
      return await db.getVisualAlerts(ctx.user.id, input?.limit || 50);
    }),
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadVisualAlertsCount(ctx.user.id);
    }),
    getStats: protectedProcedure.query(async () => {
      return await db.getVisualAlertStats();
    }),
    markRead: protectedProcedure.input(z.object({
      alertId: z.number(),
    })).mutation(async ({ input }) => {
      return await db.markVisualAlertRead(input.alertId);
    }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      return await db.markAllVisualAlertsRead(ctx.user.id);
    }),
    dismiss: protectedProcedure.input(z.object({
      alertId: z.number(),
    })).mutation(async ({ input }) => {
      return await db.dismissVisualAlert(input.alertId);
    }),
    create: protectedProcedure.input(z.object({
      siteId: z.number(),
      domain: z.string(),
      siteName: z.string().optional(),
      alertType: z.enum(['status_change', 'score_change', 'policy_added', 'policy_removed', 'clause_change']),
      severity: z.enum(['info', 'warning', 'critical', 'success']),
      previousStatus: z.string().optional(),
      newStatus: z.string().optional(),
      previousScore: z.number().optional(),
      newScore: z.number().optional(),
      message: z.string(),
      details: z.any().optional(),
    })).mutation(async ({ input }) => {
      return await db.createVisualAlert(input);
    }),
  }),

  pdfReports: router({
    generate: protectedProcedure.input(z.object({
      modules: z.array(z.string()),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      sector: z.string().optional(),
      category: z.string().optional(),
      title: z.string().default("تقرير راصد"),
    })).mutation(async ({ input }) => {
      const data = await db.getCustomReportData(input.modules, {
        dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
        dateTo: input.dateTo ? new Date(input.dateTo) : undefined,
        sector: input.sector,
        category: input.category,
      });
      return { success: true, data, title: input.title };
    }),
    history: protectedProcedure.input(z.object({ limit: z.number().default(20) })).query(async ({ input }) => {
      return await db.getPdfReportHistory(input.limit);
    }),
    record: protectedProcedure.input(z.object({
      reportType: z.enum(['compliance_summary', 'sector_comparison', 'trend_analysis', 'full_report']),
      title: z.string(),
      pdfUrl: z.string().optional(),
      fileSize: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      return await db.createPdfReportRecord({ ...input, generatedBy: ctx.user.id });
    }),
  }),
  emailNotifications: router({
    getPrefs: protectedProcedure.query(async ({ ctx }) => {
      const prefs = await db.getEmailNotificationPrefs(ctx.user.id);
      return prefs.length > 0 ? prefs[0] : null;
    }),
    savePrefs: protectedProcedure.input(z.object({
      emailAddress: z.string().email(),
      notifyOnStatusChange: z.boolean().default(true),
      notifyOnScoreChange: z.boolean().default(true),
      notifyOnNewScan: z.boolean().default(false),
      notifyOnCriticalOnly: z.boolean().default(false),
      minScoreChangeThreshold: z.number().min(1).max(100).default(10),
      sectorFilter: z.array(z.string()).nullable().optional(),
      isActive: z.boolean().default(true),
    })).mutation(async ({ ctx, input }) => {
      return await db.upsertEmailNotificationPref(ctx.user.id, input);
    }),
    deletePrefs: protectedProcedure.mutation(async ({ ctx }) => {
      const prefs = await db.getEmailNotificationPrefs(ctx.user.id);
      if (prefs.length > 0) {
        await db.deleteEmailNotificationPref(prefs[0].id, ctx.user.id);
      }
      return { success: true };
    }),
    testEmail: protectedProcedure.input(z.object({
      emailAddress: z.string().email(),
    })).mutation(async ({ input }) => {
      try {
        const { sendNotificationEmail, isEmailConfigured } = await import('./email');
        if (!isEmailConfigured()) {
          return { success: false, error: 'خدمة البريد الإلكتروني غير مُعدة. يرجى إعداد SMTP أولاً.' };
        }
        const result = await sendNotificationEmail({
          to: input.emailAddress,
          title: 'اختبار إشعارات راصد',
          message: 'هذا بريد اختباري من منصة راصد للتأكد من عمل نظام الإشعارات بشكل صحيح.',
          type: 'info',
        });
        return result;
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }),
  }),
  sectorComparison: router({
    detailed: protectedProcedure.query(async () => {
      return await db.getSectorComparisonDetailed();
    }),
    exportExcel: protectedProcedure.mutation(async ({ ctx }) => {
      const data = await db.getSectorComparisonDetailed();
      const sheets: ExcelSheetData[] = [
        {
          name: 'ملخص المقارنة',
          columns: [
            { header: 'المؤشر', key: 'indicator', width: 25 },
            { header: 'القطاع العام', key: 'public', width: 18 },
            { header: 'القطاع الخاص', key: 'private', width: 18 },
            { header: 'الإجمالي', key: 'total', width: 18 },
          ],
          rows: [
            { indicator: 'إجمالي المواقع', public: data.public.total, private: data.private.total, total: data.summary.totalSites },
            { indicator: 'ممتثل', public: data.public.compliant, private: data.private.compliant, total: data.summary.totalCompliant },
            { indicator: 'ممتثل جزئياً', public: data.public.partial, private: data.private.partial, total: data.public.partial + data.private.partial },
            { indicator: 'غير ممتثل', public: data.public.nonCompliant, private: data.private.nonCompliant, total: data.public.nonCompliant + data.private.nonCompliant },
            { indicator: 'لا يعمل', public: data.public.noPolicy, private: data.private.noPolicy, total: data.public.noPolicy + data.private.noPolicy },
            { indicator: 'متوسط الدرجة', public: `${data.public.avgScore}%`, private: `${data.private.avgScore}%`, total: `${data.summary.overallRate}%` },
          ],
        },
        {
          name: 'بنود المادة 12',
          columns: [
            { header: 'البند', key: 'clause', width: 15 },
            { header: 'القطاع العام - ممتثل', key: 'pubCompliant', width: 20 },
            { header: 'القطاع العام - نسبة', key: 'pubRate', width: 18 },
            { header: 'القطاع الخاص - ممتثل', key: 'priCompliant', width: 20 },
            { header: 'القطاع الخاص - نسبة', key: 'priRate', width: 18 },
          ],
          rows: Array.from({ length: 8 }, (_, i) => {
            const pubClause = data.public.clauses[i] || { compliant: 0, total: 0, rate: 0 };
            const priClause = data.private.clauses[i] || { compliant: 0, total: 0, rate: 0 };
            return { clause: `البند ${i + 1}`, pubCompliant: `${pubClause.compliant}/${pubClause.total}`, pubRate: `${pubClause.rate}%`, priCompliant: `${priClause.compliant}/${priClause.total}`, priRate: `${priClause.rate}%` };
          }),
        },
      ];
      const buffer = await createProfessionalExcel({
        title: 'تقرير مقارنة القطاعات',
        userName: ctx.user?.name || ctx.user?.displayName || 'مستخدم',
        userRole: ctx.user?.rasidRole || ctx.user?.role || 'user',
        sheets,
      });
      return { base64: buffer.toString('base64'), filename: `مقارنة_القطاعات_${new Date().toISOString().split('T')[0]}.xlsx` };
    }),
  }),
  // ===== Enhanced Comparison Dashboard =====
  comparisonDashboard: router({
    search: protectedProcedure.input(z.object({
      query: z.string().min(1),
    })).query(async ({ input }) => {
      return db.searchSitesForComparison(input.query);
    }),
    detailedCompare: protectedProcedure.input(z.object({
      siteIds: z.array(z.number()).min(2).max(8),
    })).query(async ({ input }) => {
      return db.getDetailedComparisonData(input.siteIds);
    }),
    allSites: protectedProcedure.query(async () => {
      const allSites = await db.getAllSitesBasic();
      return allSites;
    }),
  }),
  // ===== Enhanced Email Notifications =====
  enhancedEmail: router({
    getSmtpConfig: adminProcedure.query(async () => {
      const { getSmtpConfig, isEmailConfigured } = await import('./email');
      const config = getSmtpConfig();
      return {
        host: config.host,
        port: config.port,
        user: config.user ? config.user.replace(/(.{2}).*(@.*)/, '$1***$2') : '',
        from: config.from,
        fromName: config.fromName,
        secure: config.secure,
        isConfigured: isEmailConfigured(),
      };
    }),
    updateSmtpConfig: adminProcedure.input(z.object({
      host: z.string().min(1),
      port: z.number().min(1).max(65535),
      user: z.string().min(1),
      pass: z.string().min(1),
      from: z.string().email(),
      fromName: z.string().optional(),
      secure: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const { updateSmtpConfig } = await import('./email');
      updateSmtpConfig(input);
      return { success: true };
    }),
    verifyConnection: adminProcedure.mutation(async () => {
      const { verifySmtpConnection } = await import('./email');
      return await verifySmtpConnection();
    }),
    sendTestEmail: adminProcedure.input(z.object({
      to: z.string().email(),
    })).mutation(async ({ input }) => {
      const { sendNotificationEmail, isEmailConfigured } = await import('./email');
      if (!isEmailConfigured()) {
        return { success: false, error: 'خدمة البريد غير مُعدة' };
      }
      return await sendNotificationEmail({
        to: input.to,
        title: 'اختبار إشعارات منصة راصد',
        message: 'هذا بريد اختباري للتأكد من عمل نظام الإشعارات. إذا وصلك هذا البريد فإن الإعدادات صحيحة.',
        type: 'success',
      });
    }),
    sendBulkNotification: adminProcedure.input(z.object({
      subject: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
      recipientType: z.enum(['all', 'admins', 'specific']).default('all'),
      specificEmails: z.array(z.string().email()).optional(),
    })).mutation(async ({ input }) => {
      const { sendNotificationEmail, isEmailConfigured } = await import('./email');
      if (!isEmailConfigured()) {
        return { success: false, error: 'خدمة البريد غير مُعدة', sent: 0 };
      }
      let recipients: string[] = [];
      if (input.recipientType === 'specific' && input.specificEmails) {
        recipients = input.specificEmails;
      } else {
        const users = await db.getUsersWithEmailNotifications();
        if (input.recipientType === 'admins') {
          recipients = users.filter(u => u.role === 'admin' && u.email).map(u => u.email!);
        } else {
          recipients = users.filter(u => u.email).map(u => u.email!);
        }
      }
      let sent = 0;
      for (const email of recipients) {
        try {
          const result = await sendNotificationEmail({
            to: email,
            title: input.subject,
            message: input.message,
            type: input.type,
          });
          if (result.success) sent++;
        } catch { /* skip */ }
      }
      return { success: true, sent, total: recipients.length };
    }),
    // Get email notification stats
    getStats: adminProcedure.query(async () => {
      const allPrefs = await db.getActiveEmailPrefs();
      const usersWithEmail = await db.getUsersWithEmailNotifications();
      return {
        totalSubscribers: allPrefs.length,
        activeSubscribers: allPrefs.filter((p: any) => p.isActive).length,
        usersWithEmailEnabled: usersWithEmail.length,
      };
    }),
  }),

  // ─── Official Documentation System ──────────────────────────────────
  documentation: router({
    generate: protectedProcedure.input(z.object({
      recordId: z.string().optional(),
      title: z.string(),
      titleAr: z.string(),
      documentType: z.enum(["incident_report", "custom_report", "executive_summary", "compliance_report", "sector_report"]),
      coreData: z.record(z.string(), z.any()),
      description: z.string().optional(),
      classifications: z.array(z.string()).optional(),
      evidence: z.array(z.object({ url: z.string(), caption: z.string().optional() })).optional(),
      aiAnalysis: z.object({
        confidence: z.number(),
        summary: z.string(),
        recommendations: z.array(z.string()),
      }).optional(),
      evidenceChain: z.array(z.object({ hash: z.string(), date: z.string(), description: z.string() })).optional(),
      complianceScore: z.number().optional(),
      sectorType: z.string().optional(),
      domain: z.string().optional(),
      baseUrl: z.string(),
    })).mutation(async ({ input, ctx }) => {
      const { generateDocument } = await import('./documentService');
      const result = await generateDocument({
        ...input,
        issuerName: ctx.user.name || ctx.user.email || 'مستخدم',
      });
      // Save to database
      const doc = await db.createDocument({
        documentId: result.documentId,
        recordId: input.recordId || null,
        verificationCode: result.verificationCode,
        contentHash: result.contentHash,
        documentType: input.documentType,
        title: input.title,
        titleAr: input.titleAr,
        generatedBy: ctx.user.id,
        generatedByName: ctx.user.name || ctx.user.email || 'مستخدم',
        htmlContent: result.htmlContent,
        metadata: { coreData: input.coreData, classifications: input.classifications },
        isVerified: true,
      });
      // Log to report audit
      await db.createReportAudit({
        reportId: result.documentId,
        documentId: result.documentId,
        reportType: input.documentType,
        generatedBy: ctx.user.id,
        generatedByName: ctx.user.name || ctx.user.email || 'مستخدم',
        complianceAcknowledged: true,
        acknowledgedAt: new Date(),
        filters: input.coreData,
        metadata: { title: input.title, titleAr: input.titleAr },
      });
      // Log to activity
      await db.insertActivityLog({
        userId: ctx.user.id,
        action: 'document_generated',
        details: `تم إصدار وثيقة: ${input.titleAr} (${result.documentId})`,
        ipAddress: 'system',
      });
      return result;
    }),

    verify: publicProcedure.input(z.object({
      code: z.string(),
    })).query(async ({ input }) => {
      const doc = await db.getDocumentByVerificationCode(input.code);
      if (!doc) return { valid: false, document: null };
      return {
        valid: true,
        document: {
          documentId: doc.documentId,
          recordId: doc.recordId,
          verificationCode: doc.verificationCode,
          contentHash: doc.contentHash,
          documentType: doc.documentType,
          title: doc.title,
          titleAr: doc.titleAr,
          generatedByName: doc.generatedByName,
          createdAt: doc.createdAt,
          isVerified: doc.isVerified,
        },
      };
    }),

    list: protectedProcedure.query(async () => {
      return db.getDocuments(100, 0);
    }),

    listFiltered: protectedProcedure.input(z.object({
      search: z.string().optional(),
      employeeName: z.string().optional(),
      recordId: z.string().optional(),
      documentType: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      page: z.number().default(1),
    })).query(async ({ input }) => {
      const limit = 15;
      const offset = (input.page - 1) * limit;
      return db.getDocumentsFiltered({
        search: input.search,
        employeeName: input.employeeName,
        recordId: input.recordId,
        documentType: input.documentType,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        limit,
        offset,
      });
    }),

    getById: publicProcedure.input(z.object({
      id: z.number(),
    })).query(async ({ input }) => {
      return db.getDocumentById(input.id);
    }),

    stats: protectedProcedure.query(async () => {
      return db.getDocumentStats();
    }),
    // Enhanced stats for the Document Statistics Dashboard
    detailedStats: protectedProcedure.query(async () => {
      return db.getDocumentDetailedStats();
    }),
    // Get HTML content for PDF export / printing
    getHtmlContent: protectedProcedure.input(z.object({
      documentId: z.string(),
    })).query(async ({ input }) => {
      const doc = await db.getDocumentByDocumentId(input.documentId);
      if (!doc) return { found: false, html: '', title: '' };
      return { found: true, html: doc.htmlContent || '', title: doc.titleAr || doc.title || '' };
    }),
  }),

  // ─── Report Audit ──────────────────────────────────────────────────
  reportAudit: router({
    list: protectedProcedure.query(async () => {
      return db.getReportAudits(100, 0);
    }),
    create: protectedProcedure.input(z.object({
      reportId: z.string().optional(),
      documentId: z.string().optional(),
      reportType: z.string(),
      complianceAcknowledged: z.boolean(),
      filters: z.record(z.string(), z.any()).optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    })).mutation(async ({ input, ctx }) => {
      return db.createReportAudit({
        ...input,
        generatedBy: ctx.user.id,
        generatedByName: ctx.user.name || ctx.user.email || 'مستخدم',
        acknowledgedAt: input.complianceAcknowledged ? new Date() : null,
      });
    }),
  }),

  // ===== AI Assistant Router (راصد الذكي) =====
  ai: router({
    getGreeting: protectedProcedure.query(async ({ ctx }) => {
      const greeting = await getGreeting(ctx.user.id, ctx.user.name || 'مستخدم');
      return {
        greeting,
        avatar: RASID_AVATAR,
        avatarAlt: RASID_AVATAR_ALT,
        avatarAlt2: RASID_AVATAR_ALT2,
        name: 'راصد الذكي',
      };
    }),

    // Legacy chat (kept for backward compat)
    chat: protectedProcedure.input(z.object({
      message: z.string().min(1).max(5000),
    })).mutation(async ({ input, ctx }) => {
      const result = await processChat(ctx.user.id, ctx.user.name || 'مستخدم', input.message);
      return result;
    }),

    // ===== Enhanced RAG Chat =====
    ragChat: protectedProcedure.input(z.object({
      message: z.string().min(1).max(5000),
      sessionId: z.string().optional(),
      history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })).optional(),
    })).mutation(async ({ input, ctx }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });

      // Create or get session
      let sessionId = input.sessionId;
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        await dbConn.insert(aiChatSessions).values({
          sessionId,
          userId: ctx.user.id,
          userName: ctx.user.name || 'مستخدم',
          title: input.message.substring(0, 100),
          messageCount: 0,
        });
      }

      // Save user message
      const userMsgId = `msg_${Date.now()}_u`;
      await dbConn.insert(aiChatMessages).values({
        sessionId,
        messageId: userMsgId,
        msgRole: 'user',
        content: input.message,
      });

      // Build messages array
      const messages = [
        ...(input.history || []).map(h => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        { role: 'user' as const, content: input.message },
      ];

      // Process with RAG
      const result = await processSmartRasidQuery(
        messages,
        ctx.user.id,
        ctx.user.name || 'مستخدم',
        sessionId
      );

      return {
        ...result,
        sessionId,
      };
    }),

    // ===== Session Management =====
    getSessions: protectedProcedure.input(z.object({
      limit: z.number().min(1).max(100).optional(),
    }).optional()).query(async ({ input, ctx }) => {
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      return dbConn.select()
        .from(aiChatSessions)
        .where(eq(aiChatSessions.userId, ctx.user.id))
        .orderBy(desc(aiChatSessions.updatedAt))
        .limit(input?.limit || 20);
    }),

    getSessionMessages: protectedProcedure.input(z.object({
      sessionId: z.string(),
    })).query(async ({ input, ctx }) => {
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      // Verify session belongs to user
      const [session] = await dbConn.select()
        .from(aiChatSessions)
        .where(and(eq(aiChatSessions.sessionId, input.sessionId), eq(aiChatSessions.userId, ctx.user.id)));
      if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: 'الجلسة غير موجودة' });
      return dbConn.select()
        .from(aiChatMessages)
        .where(eq(aiChatMessages.sessionId, input.sessionId))
        .orderBy(aiChatMessages.createdAt);
    }),

    deleteSession: protectedProcedure.input(z.object({
      sessionId: z.string(),
    })).mutation(async ({ input, ctx }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      // Verify ownership
      const [session] = await dbConn.select()
        .from(aiChatSessions)
        .where(and(eq(aiChatSessions.sessionId, input.sessionId), eq(aiChatSessions.userId, ctx.user.id)));
      if (!session) throw new TRPCError({ code: 'NOT_FOUND' });
      await dbConn.delete(aiChatMessages).where(eq(aiChatMessages.sessionId, input.sessionId));
      await dbConn.delete(aiChatSessions).where(eq(aiChatSessions.sessionId, input.sessionId));
      return { success: true };
    }),

    // ===== Star Rating (1-5) =====
    rateMessage: protectedProcedure.input(z.object({
      messageId: z.string(),
      sessionId: z.string(),
      rating: z.number().min(1).max(5),
      feedback: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      await dbConn.insert(aiRatings).values({
        messageId: input.messageId,
        sessionId: input.sessionId,
        userId: ctx.user.id,
        rating: input.rating,
        feedback: input.feedback,
      });
      return { success: true };
    }),

    // ===== Export Session =====
    exportSession: protectedProcedure.input(z.object({
      sessionId: z.string(),
      format: z.enum(['json', 'markdown']),
    })).query(async ({ input, ctx }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const [session] = await dbConn.select().from(aiChatSessions)
        .where(and(eq(aiChatSessions.sessionId, input.sessionId), eq(aiChatSessions.userId, ctx.user.id)));
      if (!session) throw new TRPCError({ code: 'NOT_FOUND' });

      const msgs = await dbConn.select().from(aiChatMessages)
        .where(eq(aiChatMessages.sessionId, input.sessionId))
        .orderBy(aiChatMessages.createdAt);

      if (input.format === 'json') {
        return { data: JSON.stringify({ session, messages: msgs }, null, 2), contentType: 'application/json' };
      }

      let md = `# محادثة: ${session.title}\n`;
      md += `**المستخدم:** ${session.userName}\n`;
      md += `**التاريخ:** ${session.createdAt}\n`;
      md += `**عدد الرسائل:** ${session.messageCount}\n\n---\n\n`;

      for (const msg of msgs) {
        if ((msg as any).msgRole === 'system' || (msg as any).role === 'system') continue;
        const role = (msg as any).msgRole || (msg as any).role;
        const label = role === 'user' ? 'المستخدم' : 'راصد الذكي';
        md += `### ${label}\n${msg.content}\n\n`;
      }

      return { data: md, contentType: 'text/markdown' };
    }),

    // ===== Semantic Search =====
    semanticSearch: protectedProcedure.input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(20).optional(),
    })).query(async ({ input }) => {
      return searchKnowledge(input.query, input.limit || 5);
    }),

    // ===== Search Stats (Admin) =====
    getSearchStats: adminProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const topQueries = await dbConn.select({
        query: aiSearchLog.query,
        searchCount: count(),
      })
        .from(aiSearchLog)
        .groupBy(aiSearchLog.query)
        .orderBy(desc(count()))
        .limit(20);

      const [avgResults] = await dbConn.select({
        avgCount: sql<number>`COALESCE(AVG(${aiSearchLog.resultsCount}), 0)`,
        avgScore: sql<number>`COALESCE(AVG(${aiSearchLog.topScore}), 0)`,
        totalSearches: count(),
      }).from(aiSearchLog);

      const zeroResults = await dbConn.select()
        .from(aiSearchLog)
        .where(eq(aiSearchLog.resultsCount, 0))
        .orderBy(desc(aiSearchLog.createdAt))
        .limit(20);

      return {
        topQueries,
        averageResultsCount: avgResults?.avgCount || 0,
        averageTopScore: avgResults?.avgScore || 0,
        totalSearches: avgResults?.totalSearches || 0,
        knowledgeGaps: zeroResults,
      };
    }),

    // ===== Chat Stats (Admin) =====
    getChatStats: adminProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const [sessionStats] = await dbConn.select({
        totalSessions: count(),
        totalMessages: sql<number>`COALESCE(SUM(${aiChatSessions.messageCount}), 0)`,
        totalTokens: sql<number>`COALESCE(SUM(${aiChatSessions.totalTokens}), 0)`,
      }).from(aiChatSessions);

      const [ratingStats] = await dbConn.select({
        avgRating: sql<number>`COALESCE(AVG(${aiRatings.rating}), 0)`,
        totalRatings: count(),
      }).from(aiRatings);

      const recentSessions = await dbConn.select()
        .from(aiChatSessions)
        .orderBy(desc(aiChatSessions.updatedAt))
        .limit(10);

      return {
        totalSessions: sessionStats?.totalSessions || 0,
        totalMessages: sessionStats?.totalMessages || 0,
        totalTokens: sessionStats?.totalTokens || 0,
        avgRating: ratingStats?.avgRating || 0,
        totalRatings: ratingStats?.totalRatings || 0,
        recentSessions,
      };
    }),

    // ===== All Sessions (Admin) =====
    getAllSessions: adminProcedure.input(z.object({
      limit: z.number().min(1).max(200).optional(),
    }).optional()).query(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      return dbConn.select()
        .from(aiChatSessions)
        .orderBy(desc(aiChatSessions.updatedAt))
        .limit(input?.limit || 50);
    }),

    // ===== Regenerate Embeddings (Admin) =====
    regenerateEmbeddings: adminProcedure.mutation(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const entries = await dbConn.select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.isActive, true as any));

      let processed = 0;
      let failed = 0;

      for (const entry of entries) {
        const text = [entry.title, entry.question, entry.answer, entry.content].filter(Boolean).join(' ');
        if (!text.trim()) continue;

        try {
          const embedding = await generateEmbedding(text);
          if (embedding.length > 0) {
            await dbConn.update(knowledgeBase)
              .set({ embedding, embeddingModel: 'text-embedding-3-small' })
              .where(eq(knowledgeBase.id, entry.id));
            processed++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      return { processed, failed, total: entries.length };
    }),

    // ===== Knowledge CRUD (Enhanced) =====
    getChatHistory: protectedProcedure.input(z.object({
      limit: z.number().min(1).max(100).optional(),
    }).optional()).query(async ({ input, ctx }) => {
      const history = await db.getChatHistory(ctx.user.id, input?.limit || 50);
      return history;
    }),

    rateFeedback: protectedProcedure.input(z.object({
      chatId: z.number(),
      rating: z.enum(['good', 'bad']),
    })).mutation(async ({ input }) => {
      await db.rateChatMessage(input.chatId, input.rating);
      return { success: true };
    }),

    uploadDocument: protectedProcedure.input(z.object({
      content: z.string().min(10),
      source: z.string().min(1),
    })).mutation(async ({ input }) => {
      const result = await learnFromDocument(input.content, input.source);
      return result;
    }),

    addKnowledge: adminProcedure.input(z.object({
      type: z.enum(['qa', 'document', 'feedback', 'article', 'faq', 'regulation', 'term', 'guide']),
      title: z.string().optional(),
      question: z.string().optional(),
      answer: z.string().optional(),
      content: z.string().optional(),
      source: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })).mutation(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      // Generate embedding for the content
      const text = [input.title, input.question, input.answer, input.content].filter(Boolean).join(' ');
      const embedding = text.trim() ? await generateEmbedding(text) : [];
      await dbConn.insert(knowledgeBase).values({
        ...input,
        tags: input.tags || [],
        embedding: embedding.length > 0 ? embedding : undefined,
        embeddingModel: embedding.length > 0 ? 'text-embedding-3-small' : undefined,
        isActive: true,
      } as any);
      return { success: true };
    }),

    getScenarios: adminProcedure.input(z.object({
      type: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      if (input?.type) {
        return db.getScenariosByType(input.type);
      }
      return db.getAllScenarios();
    }),

    addScenario: adminProcedure.input(z.object({
      type: z.enum(['welcome_first', 'welcome_return', 'leader_respect', 'farewell', 'encouragement', 'occasion']),
      triggerKeyword: z.string().optional(),
      textAr: z.string().min(1),
    })).mutation(async ({ input }) => {
      await db.addScenario(input);
      return { success: true };
    }),

    deleteScenario: adminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      await db.deleteScenario(input.id);
      return { success: true };
    }),

    toggleScenario: adminProcedure.input(z.object({
      id: z.number(),
      isActive: z.boolean(),
    })).mutation(async ({ input }) => {
      await db.updateScenario(input.id, { isActive: input.isActive });
      return { success: true };
    }),

    getKnowledgeEntries: adminProcedure.input(z.object({
      type: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      return db.getAllKnowledge(input?.type);
    }),

    deleteKnowledge: adminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      await db.deleteKnowledgeEntry(input.id);
      return { success: true };
    }),
    updateKnowledge: adminProcedure.input(z.object({
      id: z.number(),
      question: z.string().optional(),
      answer: z.string().optional(),
      content: z.string().optional(),
      source: z.string().optional(),
      type: z.enum(['qa', 'document', 'feedback']).optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateKnowledgeEntry(id, data);
      return { success: true };
    }),

    // ===== Enhanced Scenarios (new table) =====
    getEnhancedScenarios: adminProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      return dbConn.select().from(aiScenarios).orderBy(desc(aiScenarios.priority));
    }),

    createEnhancedScenario: adminProcedure.input(z.object({
      name: z.string().min(1),
      type: z.enum(['greeting', 'farewell', 'help', 'error', 'report', 'custom_command', 'persona', 'escalation', 'vip_response']),
      triggerPattern: z.string().optional(),
      systemPrompt: z.string().optional(),
      responseTemplate: z.string().optional(),
      conditions: z.any().optional(),
      priority: z.number().optional(),
    })).mutation(async ({ input, ctx }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const scenarioData = { ...input, scenarioType: input.type, createdBy: ctx.user.id } as any;
      delete scenarioData.type;
      await dbConn.insert(aiScenarios).values(scenarioData);
      return { success: true };
    }),

    updateEnhancedScenario: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.enum(['greeting', 'farewell', 'help', 'error', 'report', 'custom_command', 'persona', 'escalation', 'vip_response']).optional(),
      triggerPattern: z.string().optional(),
      systemPrompt: z.string().optional(),
      responseTemplate: z.string().optional(),
      conditions: z.any().optional(),
      priority: z.number().optional(),
      isEnabled: z.boolean().optional(),
    })).mutation(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const { id, ...data } = input;
      await dbConn.update(aiScenarios).set(data as any).where(eq(aiScenarios.id, id));
      return { success: true };
    }),

    deleteEnhancedScenario: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      await dbConn.delete(aiScenarios).where(eq(aiScenarios.id, input.id));
      return { success: true };
    }),

    // ===== Custom Commands =====
    getCustomCommands: adminProcedure.query(async () => {
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      return dbConn.select().from(aiCustomCommands);
    }),

    createCustomCommand: adminProcedure.input(z.object({
      command: z.string().min(1),
      description: z.string().optional(),
      handler: z.string().min(1),
      parameters: z.any().optional(),
      exampleUsage: z.string().optional(),
    })).mutation(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      await dbConn.insert(aiCustomCommands).values(input);
      return { success: true };
    }),

    deleteCustomCommand: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      await dbConn.delete(aiCustomCommands).where(eq(aiCustomCommands.id, input.id));
      return { success: true };
    }),
    // ===== Messages (for SmartRasidFAB) =====
    messages: protectedProcedure.input(z.object({
      conversationId: z.string().optional(),
    }).optional()).query(async ({ ctx, input }) => {
      if (!input?.conversationId) return [];
      const dbConn = await db.getDb();
      if (!dbConn) return [];
      return dbConn.select().from(aiChatMessages)
        .where(eq(aiChatMessages.sessionId, input.conversationId))
        .orderBy(aiChatMessages.createdAt);
    }),
    // ===== Suggestions =====
    suggestions: protectedProcedure.query(async () => {
      return [
        'ما هي آخر نتائج الفحص؟',
        'أظهر لي إحصائيات الامتثال',
        'ما هي المواقع غير الملتزمة؟',
        'أعطني ملخص عن حالة الخصوصية',
      ];
    }),
    // ===== Create Conversation =====
    createConversation: protectedProcedure.input(z.object({
      title: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const dbConn = await db.getDb();
      if (!dbConn) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      await dbConn.insert(aiChatSessions).values({
        sessionId,
        userId: ctx.user.id,
        userName: ctx.user.name || 'مستخدم',
        title: input?.title || 'محادثة جديدة',
        messageCount: 0,
      });
      return { id: sessionId };
    }),
    // ===== Send Message =====
    sendMessage: protectedProcedure.input(z.object({
      conversationId: z.string(),
      message: z.string().min(1).max(5000),
    })).mutation(async ({ ctx, input }) => {
      const result = await processChat(ctx.user.id, ctx.user.name || 'مستخدم', input.message);
      return result;
    }),
  }),
  // ===== Training Center Router (مركز تدريب راصد الذكي) =====
  trainingCenter: router({
    getStats: adminProcedure.query(async () => {
      return db.getTrainingCenterStats();
    }),
    // --- Custom Actions ---
    listActions: adminProcedure.query(async () => {
      return db.getCustomActions();
    }),
    createAction: adminProcedure.input(z.object({
      triggerPhrase: z.string().min(1),
      aliases: z.array(z.string()).optional(),
      actionType: z.enum(['call_function', 'custom_code', 'redirect', 'api_call']),
      actionTarget: z.string().optional(),
      description: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const id = await db.createCustomAction(input as any);
      await db.logTrainingAction({ action: 'action_added', entityType: 'custom_action', entityId: id || undefined, details: input.triggerPhrase, performedBy: ctx.user.id });
      return { success: true, id };
    }),
    updateAction: adminProcedure.input(z.object({
      id: z.number(),
      triggerPhrase: z.string().optional(),
      aliases: z.array(z.string()).optional(),
      actionType: z.enum(['call_function', 'custom_code', 'redirect', 'api_call']).optional(),
      actionTarget: z.string().optional(),
      description: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await db.updateCustomAction(id, data as any);
      await db.logTrainingAction({ action: 'action_updated', entityType: 'custom_action', entityId: id, performedBy: ctx.user.id });
      return { success: true };
    }),
    deleteAction: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteCustomAction(input.id);
      return { success: true };
    }),
    toggleAction: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.toggleCustomAction(input.id);
      return { success: true };
    }),
    // --- Training Documents ---
    listDocuments: adminProcedure.query(async () => {
      return db.getTrainingDocuments();
    }),
    uploadDocument: adminProcedure.input(z.object({
      fileName: z.string(),
      fileUrl: z.string(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const id = await db.createTrainingDocument({ ...input, uploadedBy: ctx.user.id, status: 'pending' });
      await db.logTrainingAction({ action: 'document_uploaded', entityType: 'training_document', entityId: id || undefined, details: input.fileName, performedBy: ctx.user.id });
      return { success: true, id };
    }),
    processDocument: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
      await db.updateTrainingDocument(input.id, { status: 'processing' });
      // In a real implementation, this would trigger document processing
      // For now, mark as completed after a brief delay
      setTimeout(async () => {
        try {
          await db.updateTrainingDocument(input.id, { status: 'completed' });
          await db.logTrainingAction({ action: 'document_processed', entityType: 'training_document', entityId: input.id, performedBy: ctx.user.id });
        } catch (e) { console.error('[TrainingCenter] Document processing error:', e); }
      }, 2000);
      return { success: true };
    }),
    deleteDocument: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteTrainingDocument(input.id);
      return { success: true };
    }),
    // --- AI Feedback ---
    listFeedback: adminProcedure.input(z.object({
      limit: z.number().min(1).max(200).optional(),
    }).optional()).query(async ({ input }) => {
      return db.getAiFeedbackList(input?.limit || 50);
    }),
    feedbackStats: adminProcedure.query(async () => {
      return db.getAiFeedbackStats();
    }),
    submitFeedback: protectedProcedure.input(z.object({
      chatHistoryId: z.number(),
      rating: z.enum(['good', 'bad']),
      category: z.enum(['accuracy', 'relevance', 'completeness', 'tone', 'other']).optional(),
      notes: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      await db.createAiFeedback({ ...input, userId: ctx.user.id });
      await db.logTrainingAction({ action: 'feedback_received', entityType: 'ai_feedback', details: `${input.rating} - ${input.category || 'general'}`, performedBy: ctx.user.id });
      return { success: true };
    }),
    // --- Personality Scenarios (extended) ---
    listScenarios: adminProcedure.query(async () => {
      return db.getAllPersonalityScenarios();
    }),
    createScenario: adminProcedure.input(z.object({
      type: z.enum(['welcome_first', 'welcome_return', 'leader_respect', 'farewell', 'encouragement', 'occasion']),
      triggerKeyword: z.string().optional(),
      textAr: z.string().min(1),
    })).mutation(async ({ input, ctx }) => {
      const id = await db.createPersonalityScenario(input);
      await db.logTrainingAction({ action: 'scenario_added', entityType: 'personality_scenario', entityId: id || undefined, details: input.type, performedBy: ctx.user.id });
      return { success: true, id };
    }),
    updateScenario: adminProcedure.input(z.object({
      id: z.number(),
      type: z.enum(['welcome_first', 'welcome_return', 'leader_respect', 'farewell', 'encouragement', 'occasion']).optional(),
      triggerKeyword: z.string().optional(),
      textAr: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await db.updatePersonalityScenario(id, data);
      await db.logTrainingAction({ action: 'scenario_updated', entityType: 'personality_scenario', entityId: id, performedBy: ctx.user.id });
      return { success: true };
    }),
    deleteScenario: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deletePersonalityScenario(input.id);
      return { success: true };
    }),
    toggleScenario: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.togglePersonalityScenario(input.id);
      return { success: true };
    }),
    // --- Knowledge Base (extended) ---
    listKnowledge: adminProcedure.query(async () => {
      return db.getKnowledgeBaseList();
    }),
    createKnowledge: adminProcedure.input(z.object({
      type: z.enum(['qa', 'document', 'feedback']),
      question: z.string().optional(),
      answer: z.string().optional(),
      content: z.string().optional(),
      source: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      await db.addKnowledgeEntry(input);
      await db.logTrainingAction({ action: 'knowledge_added', entityType: 'knowledge_base', details: input.question || input.source || '', performedBy: ctx.user.id });
      return { success: true };
    }),
    updateKnowledge: adminProcedure.input(z.object({
      id: z.number(),
      question: z.string().optional(),
      answer: z.string().optional(),
      content: z.string().optional(),
      source: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      await db.updateKnowledgeEntry(id, data);
      await db.logTrainingAction({ action: 'knowledge_updated', entityType: 'knowledge_base', entityId: id, performedBy: ctx.user.id });
      return { success: true };
    }),
    deleteKnowledge: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteKnowledgeEntry(input.id);
      return { success: true };
    }),
    // --- Training Logs ---
    listLogs: adminProcedure.input(z.object({
      limit: z.number().min(1).max(500).optional(),
    }).optional()).query(async ({ input }) => {
      return db.getAiTrainingLogs(input?.limit || 100);
    }),
    // --- Seed Data ---
    seedScenarios: adminProcedure.mutation(async () => {
      await db.seedPersonalityScenarios();
      return { success: true };
    }),
  }),
  // ===== Bulk Privacy Policy Analysis =====
  bulkAnalysis: router({
    listJobs: protectedProcedure.query(async () => {
      return db.listBulkAnalysisJobs();
    }),
    getJob: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getBulkAnalysisJob(input.id);
    }),
    getJobStats: protectedProcedure.input(z.object({ jobId: z.number() })).query(async ({ input }) => {
      return db.getBulkAnalysisJobStats(input.jobId);
    }),
    getResults: protectedProcedure.input(z.object({
      jobId: z.number(),
      limit: z.number().default(50),
      offset: z.number().default(0),
      status: z.string().optional(),
    })).query(async ({ input }) => {
      const [results, total] = await Promise.all([
        db.getBulkAnalysisResults(input.jobId, input.limit, input.offset, input.status),
        db.getBulkAnalysisResultsCount(input.jobId, input.status),
      ]);
      return { results, total };
    }),
    createJob: protectedProcedure.input(z.object({
      jobName: z.string(),
      urls: z.array(z.object({ domain: z.string(), privacyUrl: z.string() })),
      sourceType: z.enum(['csv_import', 'manual', 'crawl_results']).default('manual'),
    })).mutation(async ({ input, ctx }) => {
      const jobId = await db.createBulkAnalysisJob({
        jobName: input.jobName,
        totalUrls: input.urls.length,
        sourceType: input.sourceType,
        createdBy: ctx.user.id,
        status: 'pending',
      });
      // Store URLs in results table as pending
      for (const u of input.urls) {
        await db.insertBulkAnalysisResult({
          jobId,
          domain: u.domain,
          privacyUrl: u.privacyUrl || null,
          complianceStatus: 'no_policy',
          overallScore: 0,
        });
      }
      return { jobId };
    }),
    startJob: protectedProcedure.input(z.object({ jobId: z.number() })).mutation(async ({ input }) => {
      const job = await db.getBulkAnalysisJob(input.jobId);
      if (!job) throw new TRPCError({ code: 'NOT_FOUND', message: 'Job not found' });
      if (job.status === 'running') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Job already running' });
      await db.updateBulkAnalysisJob(input.jobId, { status: 'running', startedAt: new Date() });
      // Start processing in background
      processBulkAnalysisJob(input.jobId).catch(err => {
        console.error('[BulkAnalysis] Job failed:', err);
        db.updateBulkAnalysisJob(input.jobId, { status: 'failed' });
      });
      return { success: true };
    }),
    pauseJob: protectedProcedure.input(z.object({ jobId: z.number() })).mutation(async ({ input }) => {
      await db.updateBulkAnalysisJob(input.jobId, { status: 'paused' });
      return { success: true };
    }),
    cancelJob: protectedProcedure.input(z.object({ jobId: z.number() })).mutation(async ({ input }) => {
      await db.updateBulkAnalysisJob(input.jobId, { status: 'cancelled', completedAt: new Date() });
      return { success: true };
    }),
    deleteJob: adminProcedure.input(z.object({ jobId: z.number() })).mutation(async ({ input }) => {
      await db.deleteBulkAnalysisJob(input.jobId);
      return { success: true };
    }),
    importCrawlResults: protectedProcedure.input(z.object({
      jobName: z.string(),
    })).mutation(async ({ input, ctx }) => {
      // Import from the crawl results already in the system
      const allSites = await db.getSites({ limit: 20000 });
      const sitesWithPrivacy = (allSites.sites || []).filter((s: any) => s.privacyUrl && s.privacyUrl.length > 5);
      const jobId = await db.createBulkAnalysisJob({
        jobName: input.jobName,
        totalUrls: sitesWithPrivacy.length,
        sourceType: 'crawl_results',
        createdBy: ctx.user.id,
        status: 'pending',
      });
      for (const site of sitesWithPrivacy) {
        await db.insertBulkAnalysisResult({
          jobId,
          domain: site.domain,
          privacyUrl: site.privacyUrl || null,
          complianceStatus: 'no_policy',
          overallScore: 0,
        });
      }
      return { jobId, count: sitesWithPrivacy.length };
    }),
    exportExcel: protectedProcedure.input(z.object({ jobId: z.number() })).mutation(async ({ input, ctx }) => {
      const job = await db.getBulkAnalysisJob(input.jobId);
      if (!job) throw new TRPCError({ code: 'NOT_FOUND' });
      const results = await db.getAllBulkAnalysisResultsForExport(input.jobId);
      const clauseNames = [
        'تحديد الغرض من جمع البيانات',
        'تحديد محتوى البيانات المطلوب جمعها',
        'تحديد طريقة جمع البيانات',
        'تحديد وسيلة حفظ البيانات',
        'تحديد كيفية معالجة البيانات',
        'تحديد كيفية إتلاف البيانات',
        'تحديد حقوق صاحب البيانات',
        'تحديد كيفية ممارسة الحقوق',
      ];
      const statusMap: Record<string, string> = {
        compliant: 'ممتثل',
        partially_compliant: 'ممتثل جزئياً',
        non_compliant: 'غير ممتثل',
        no_policy: 'لا يوجد سياسة',
        error: 'خطأ',
      };
      const rows = results.map((r: any) => ({
        'النطاق': r.domain,
        'رابط سياسة الخصوصية': r.privacyUrl || '-',
        'النتيجة %': r.overallScore || 0,
        'حالة الامتثال': statusMap[r.complianceStatus] || r.complianceStatus,
        [clauseNames[0]]: r.clause1 ? '✅' : '❌',
        [clauseNames[1]]: r.clause2 ? '✅' : '❌',
        [clauseNames[2]]: r.clause3 ? '✅' : '❌',
        [clauseNames[3]]: r.clause4 ? '✅' : '❌',
        [clauseNames[4]]: r.clause5 ? '✅' : '❌',
        [clauseNames[5]]: r.clause6 ? '✅' : '❌',
        [clauseNames[6]]: r.clause7 ? '✅' : '❌',
        [clauseNames[7]]: r.clause8 ? '✅' : '❌',
        'الملخص': r.summary || '-',
      }));
      // Use the existing Excel helper
      const { createProfessionalExcel } = await import('./excelHelper');
      const allHeaders = ['النطاق', 'رابط سياسة الخصوصية', 'النتيجة %', 'حالة الامتثال', ...clauseNames, 'الملخص'];
      const base64 = await createProfessionalExcel({
        title: `تقرير تحليل سياسات الخصوصية - ${job.jobName}`,
        userName: ctx.user.name || '',
        userRole: ctx.user.role || 'user',
        sheets: [{
          name: 'نتائج التحليل',
          columns: allHeaders.map((h, i) => ({ header: h, key: `col${i}`, width: i === 0 ? 25 : i === 1 ? 40 : i === allHeaders.length - 1 ? 50 : 15 })),
          rows: rows.map((r: any) => {
            const vals = Object.values(r);
            const obj: Record<string, any> = {};
            vals.forEach((v, i) => { obj[`col${i}`] = v; });
            return obj;
          }),
        }, {
          name: 'ملخص الوظيفة',
          columns: [{ header: 'البند', key: 'item', width: 25 }, { header: 'القيمة', key: 'value', width: 25 }],
          rows: [
            { item: 'اسم الوظيفة', value: job.jobName },
            { item: 'إجمالي المواقع', value: String(job.totalUrls) },
            { item: 'تم تحليلها', value: String(job.analyzedUrls) },
            { item: 'فشل', value: String(job.failedUrls) },
            { item: 'ممتثل', value: String(job.compliantCount) },
            { item: 'ممتثل جزئياً', value: String(job.partialCount) },
            { item: 'غير ممتثل', value: String(job.nonCompliantCount) },
            { item: 'لا يوجد سياسة', value: String(job.noPolicyCount) },
            { item: 'متوسط النتيجة', value: String(Math.round(job.avgScore || 0)) + '%' },
          ],
        }],
      });
      return { base64, filename: `bulk-analysis-${job.jobName}.xlsx` };
    }),
  }),

  // ===== Deep Scan System =====
  deepScan: router({
    // Import domains from CSV text (one domain per line)
    importDomains: protectedProcedure.input(z.object({
      jobName: z.string().min(1),
      domains: z.array(z.string()).min(1),
    })).mutation(async ({ input }) => {
      // Create batch job
      const result = await db.insertBatchScanJob({
        jobName: input.jobName,
        totalUrls: input.domains.length,
        completedUrls: 0,
        failedUrls: 0,
        status: 'pending',
      });
      if (!result) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'فشل إنشاء المهمة' });
      const jobId = result.id;

      // Insert all domains into queue
      const items = input.domains.map(domain => ({
        jobId,
        domain: domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '').trim(),
        url: `https://${domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '').trim()}`,
        status: 'pending' as const,
      }));

      await db.insertDeepScanQueueItems(items);

      return { jobId, totalDomains: input.domains.length };
    }),

    // Start scanning a job
    startJob: protectedProcedure.input(z.object({
      jobId: z.number(),
      concurrency: z.number().min(1).max(10).optional().default(3),
    })).mutation(async ({ input }) => {
      // Start in background
      startDeepScanJob(input.jobId, input.concurrency).catch(e => {
        console.error('[DeepScan] Job failed:', e);
      });
      return { success: true, message: 'تم بدء المسح العميق' };
    }),

    // Pause scanning
    pauseJob: protectedProcedure.mutation(async () => {
      pauseScan();
      return { success: true, message: 'تم إيقاف المسح مؤقتاً' };
    }),

    // Resume scanning
    resumeJob: protectedProcedure.mutation(async () => {
      resumeScan();
      return { success: true, message: 'تم استئناف المسح' };
    }),

    // Cancel scanning
    cancelJob: protectedProcedure.mutation(async () => {
      cancelScan();
      return { success: true, message: 'تم إلغاء المسح' };
    }),

    // Get scan status
    getStatus: protectedProcedure.input(z.object({
      jobId: z.number(),
    })).query(async ({ input }) => {
      const job = await db.getBatchScanJob(input.jobId);
      if (!job) return null;
      const stats = await db.getDeepScanQueueStats(input.jobId);
      const clauseStats = await db.getDeepScanClauseStats(input.jobId);
      return {
        job,
        stats,
        clauseStats,
        isActive: getActiveScanJobId() === input.jobId,
        isPaused: isScanPaused(),
      };
    }),

    // List all deep scan jobs
    listJobs: protectedProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      const { batchScanJobs } = await import('../drizzle/schema');
      const { desc } = await import('drizzle-orm');
      return dbInstance.select().from(batchScanJobs).orderBy(desc(batchScanJobs.createdAt)).limit(50);
    }),

    // Get results with pagination and filtering
    getResults: protectedProcedure.input(z.object({
      jobId: z.number(),
      limit: z.number().min(1).max(100).optional().default(50),
      offset: z.number().min(0).optional().default(0),
      status: z.string().optional(),
      search: z.string().optional(),
    })).query(async ({ input }) => {
      return db.getDeepScanResults(input.jobId, {
        limit: input.limit,
        offset: input.offset,
        status: input.status,
        search: input.search,
      });
    }),

    // Get single scan result detail
    getResultDetail: protectedProcedure.input(z.object({
      id: z.number(),
    })).query(async ({ input }) => {
      return db.getDeepScanItemById(input.id);
    }),

    // Retry failed items
    retryFailed: protectedProcedure.input(z.object({
      jobId: z.number(),
    })).mutation(async ({ input }) => {
      await db.resetFailedItems(input.jobId);
      return { success: true, message: 'تم إعادة تعيين العناصر الفاشلة' };
    }),

    // Delete a job and its queue
    deleteJob: protectedProcedure.input(z.object({
      jobId: z.number(),
    })).mutation(async ({ input }) => {
      await db.deleteDeepScanQueueByJob(input.jobId);
      return { success: true };
    }),

    // Scan single domain (for testing)
    scanSingle: protectedProcedure.input(z.object({
      domain: z.string().min(1),
    })).mutation(async ({ input }) => {
      const result = await deepScanDomain(input.domain);
      return result;
    }),

    // ===== LLM Compliance Analysis =====
    llmAnalysisStatus: protectedProcedure.input(z.object({
      jobId: z.number(),
    })).query(async ({ input }) => {
      const needsAnalysis = await db.countItemsNeedingLLMAnalysis(input.jobId);
      const stats = await db.getDeepScanQueueStats(input.jobId);
      return {
        needsAnalysis,
        totalCompleted: stats?.completed || 0,
        alreadyAnalyzed: (stats?.completed || 0) - needsAnalysis,
      };
    }),

    startLLMAnalysis: protectedProcedure.input(z.object({
      jobId: z.number(),
      batchSize: z.number().min(1).max(50).optional().default(10),
    })).mutation(async ({ input }) => {
      // Run LLM analysis in background
      runLLMAnalysisBatch(input.jobId, input.batchSize).catch(e => {
        console.error('[LLM Analysis] Error:', e);
      });
      return { success: true, message: 'تم بدء تحليل الامتثال بالذكاء الاصطناعي' };
    }),

    // ===== Live Scan Progress =====
    liveProgress: publicProcedure.input(z.object({
      jobId: z.number().optional(),
    })).query(async ({ input }) => {
      const jobId = input.jobId || 30001;
      const progress = await db.getScanProgressLive(jobId);
      if (!progress) return null;
      return {
        ...progress,
        isActive: getActiveScanJobId() === jobId,
        isPaused: isScanPaused(),
      };
    }),

    // ===== Failure Report Export =====
    exportFailureReport: protectedProcedure.input(z.object({
      jobId: z.number(),
    })).mutation(async ({ input }) => {
      const failures = await db.getFailureBreakdown(input.jobId);
      if (!failures || failures.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'لا توجد عناصر فاشلة' });
      }

      // Categorize failures
      const categories: Record<string, { label: string; labelEn: string; domains: { domain: string; error: string; httpStatus: number | null }[] }> = {
        unreachable: { label: 'غير قابل للوصول', labelEn: 'Unreachable', domains: [] },
        dns: { label: 'خطأ DNS', labelEn: 'DNS Error', domains: [] },
        timeout: { label: 'انتهاء المهلة', labelEn: 'Timeout', domains: [] },
        ssl: { label: 'خطأ SSL/TLS', labelEn: 'SSL Error', domains: [] },
        http_4xx: { label: 'خطأ العميل (4xx)', labelEn: 'Client Error (4xx)', domains: [] },
        http_5xx: { label: 'خطأ الخادم (5xx)', labelEn: 'Server Error (5xx)', domains: [] },
        error_page: { label: 'صفحة خطأ', labelEn: 'Error Page', domains: [] },
        connection: { label: 'خطأ اتصال', labelEn: 'Connection Error', domains: [] },
        other: { label: 'أخرى', labelEn: 'Other', domains: [] },
      };

      for (const f of failures) {
        const err = (f.errorMessage || '').toLowerCase();
        const entry = { domain: f.domain, error: f.errorMessage || 'غير محدد', httpStatus: f.httpStatus };

        if (err.includes('غير قابل للوصول') || err.includes('unreachable') || err.includes('لا يوجد استجابة')) {
          categories.unreachable.domains.push(entry);
        } else if (err.includes('dns') || err.includes('getaddrinfo') || err.includes('enotfound')) {
          categories.dns.domains.push(entry);
        } else if (err.includes('timeout') || err.includes('انتهاء المهلة') || err.includes('timed out') || err.includes('aborted')) {
          categories.timeout.domains.push(entry);
        } else if (err.includes('ssl') || err.includes('tls') || err.includes('cert') || err.includes('526') || err.includes('525')) {
          categories.ssl.domains.push(entry);
        } else if (err.includes('http 4') || err.includes('403') || err.includes('404') || err.includes('401') || err.includes('410') || err.includes('409')) {
          categories.http_4xx.domains.push(entry);
        } else if (err.includes('http 5') || err.includes('500') || err.includes('502') || err.includes('503') || err.includes('521') || err.includes('520') || err.includes('540')) {
          categories.http_5xx.domains.push(entry);
        } else if (err.includes('صفحة خطأ') || err.includes('error page')) {
          categories.error_page.domains.push(entry);
        } else if (err.includes('fetch') || err.includes('connection') || err.includes('econnrefused') || err.includes('econnreset')) {
          categories.connection.domains.push(entry);
        } else {
          categories.other.domains.push(entry);
        }
      }

      // Build Excel
      const wb = new ExcelJS.Workbook();

      // Summary sheet
      const summaryWs = wb.addWorksheet('ملخص أسباب الفشل');
      summaryWs.columns = [
        { header: 'التصنيف', key: 'category', width: 25 },
        { header: 'التصنيف (English)', key: 'categoryEn', width: 25 },
        { header: 'عدد المواقع', key: 'count', width: 15 },
        { header: 'النسبة', key: 'percentage', width: 12 },
      ];
      const totalFailed = failures.length;
      for (const [key, cat] of Object.entries(categories)) {
        if (cat.domains.length > 0) {
          summaryWs.addRow({
            category: cat.label,
            categoryEn: cat.labelEn,
            count: cat.domains.length,
            percentage: `${Math.round(cat.domains.length / totalFailed * 100)}%`,
          });
        }
      }
      summaryWs.addRow({ category: 'الإجمالي', categoryEn: 'Total', count: totalFailed, percentage: '100%' });
      summaryWs.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0392B' } };
      });
      // Bold the total row
      const lastRow = summaryWs.lastRow;
      if (lastRow) lastRow.eachCell(cell => { cell.font = { bold: true }; });

      // Detail sheets per category
      for (const [key, cat] of Object.entries(categories)) {
        if (cat.domains.length === 0) continue;
        // Sanitize sheet name: remove * ? : \ / [ ] characters not allowed by Excel
        const safeName = cat.label.replace(/[*?:\\/\[\]]/g, '-').substring(0, 31);
        const ws = wb.addWorksheet(safeName);
        ws.columns = [
          { header: '#', key: 'num', width: 8 },
          { header: 'النطاق', key: 'domain', width: 30 },
          { header: 'رسالة الخطأ', key: 'error', width: 50 },
          { header: 'HTTP Status', key: 'httpStatus', width: 15 },
        ];
        cat.domains.forEach((d, i) => {
          ws.addRow({ num: i + 1, domain: d.domain, error: d.error, httpStatus: d.httpStatus || '' });
        });
        ws.getRow(1).eachCell(cell => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF273470' } };
        });
      }

      const buffer = await wb.xlsx.writeBuffer();
      const base64 = Buffer.from(buffer as ArrayBuffer).toString('base64');
      return {
        base64,
        filename: `failure-report-job-${input.jobId}.xlsx`,
        summary: Object.entries(categories)
          .filter(([_, cat]) => cat.domains.length > 0)
          .map(([_, cat]) => ({ label: cat.label, count: cat.domains.length })),
        total: totalFailed,
      };
    }),

    // Export results as Excel
    exportExcel: protectedProcedure.input(z.object({
      jobId: z.number(),
    })).mutation(async ({ input }) => {
      const job = await db.getBatchScanJob(input.jobId);
      if (!job) throw new TRPCError({ code: 'NOT_FOUND', message: 'المهمة غير موجودة' });

      const { results } = await db.getDeepScanResults(input.jobId, { limit: 50000, offset: 0 });

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('نتائج المسح العميق');

      ws.columns = [
        { header: 'النطاق', key: 'domain', width: 25 },
        { header: 'الحالة', key: 'status', width: 12 },
        { header: 'اسم الموقع', key: 'siteName', width: 30 },
        { header: 'رابط الخصوصية', key: 'privacyUrl', width: 40 },
        { header: 'طريقة الاكتشاف', key: 'privacyMethod', width: 15 },
        { header: 'الدرجة', key: 'score', width: 10 },
        { header: 'حالة الامتثال', key: 'compliance', width: 18 },
        { header: 'البند 1', key: 'c1', width: 8 },
        { header: 'البند 2', key: 'c2', width: 8 },
        { header: 'البند 3', key: 'c3', width: 8 },
        { header: 'البند 4', key: 'c4', width: 8 },
        { header: 'البند 5', key: 'c5', width: 8 },
        { header: 'البند 6', key: 'c6', width: 8 },
        { header: 'البند 7', key: 'c7', width: 8 },
        { header: 'البند 8', key: 'c8', width: 8 },
        { header: 'البريد الإلكتروني', key: 'emails', width: 30 },
        { header: 'الهاتف', key: 'phones', width: 20 },
        { header: 'صفحة التواصل', key: 'contactUrl', width: 35 },
        { header: 'الملخص', key: 'summary', width: 50 },
        { header: 'الخطأ', key: 'error', width: 30 },
      ];

      for (const r of results) {
        ws.addRow({
          domain: r.domain,
          status: r.status,
          siteName: r.siteName || '',
          privacyUrl: r.privacyUrl || '',
          privacyMethod: r.privacyMethod || '',
          score: r.overallScore || 0,
          compliance: statusToArabic(r.complianceStatus || ''),
          c1: r.clause1Compliant ? '✓' : '✗',
          c2: r.clause2Compliant ? '✓' : '✗',
          c3: r.clause3Compliant ? '✓' : '✗',
          c4: r.clause4Compliant ? '✓' : '✗',
          c5: r.clause5Compliant ? '✓' : '✗',
          c6: r.clause6Compliant ? '✓' : '✗',
          c7: r.clause7Compliant ? '✓' : '✗',
          c8: r.clause8Compliant ? '✓' : '✗',
          emails: r.contactEmails || '',
          phones: r.contactPhones || '',
          contactUrl: r.contactUrl || '',
          summary: r.summary || '',
          error: r.errorMessage || '',
        });
      }

      // Style header
      ws.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF273470' } };
      });

      const buffer = await wb.xlsx.writeBuffer();
      const base64 = Buffer.from(buffer as ArrayBuffer).toString('base64');
      return { base64, filename: `deep-scan-${job.jobName || 'results'}.xlsx` };
    }),
  }),
  // ─── Platform Usage Analytics ──────────────────────────────────────
  platformAnalytics: router({
    overview: adminProcedure.input(z.object({ days: z.number().min(1).max(365).default(30) }).optional()).query(async ({ input }) => {
      return await db.getPlatformAnalyticsOverview(input?.days || 30);
    }),
    dailyTrends: adminProcedure.input(z.object({ days: z.number().min(1).max(365).default(30) }).optional()).query(async ({ input }) => {
      return await db.getDailyEventTrends(input?.days || 30);
    }),
    mostVisitedPages: adminProcedure.input(z.object({ days: z.number().default(30), limit: z.number().default(20) }).optional()).query(async ({ input }) => {
      return await db.getMostVisitedPages(input?.days || 30, input?.limit || 20);
    }),
    hourlyActivity: adminProcedure.input(z.object({ days: z.number().default(7) }).optional()).query(async ({ input }) => {
      return await db.getHourlyActivity(input?.days || 7);
    }),
    activeUsersDaily: adminProcedure.input(z.object({ days: z.number().default(30) }).optional()).query(async ({ input }) => {
      return await db.getActiveUsersDaily(input?.days || 30);
    }),
    dailyScanRate: adminProcedure.input(z.object({ days: z.number().default(30) }).optional()).query(async ({ input }) => {
      return await db.getDailyScanRate(input?.days || 30);
    }),
    trackEvent: protectedProcedure.input(z.object({
      eventType: z.enum(["page_view", "scan", "report", "login", "export", "search", "api_call"]),
      page: z.string().optional(),
      metadata: z.any().optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.trackPlatformEvent({ ...input, userId: ctx.user.id });
      return { success: true };
    }),
  }),
  // ─── Session Management ──────────────────────────────────────────
  sessionManagement: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSessions(ctx.user.id);
    }),
    deactivate: protectedProcedure.input(z.object({ sessionId: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deactivateSession(input.sessionId, ctx.user.id);
      return { success: true };
    }),
    deactivateAll: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deactivateAllSessions(ctx.user.id);
      return { success: true };
    }),
  }),
  // ─── Compliance Change Notifications ──────────────────────────────
  complianceNotifications: router({
    unsent: adminProcedure.input(z.object({ limit: z.number().default(50) }).optional()).query(async ({ input }) => {
      return await db.getUnsentComplianceNotifications(input?.limit || 50);
    }),
    history: adminProcedure.input(z.object({ limit: z.number().default(50) }).optional()).query(async ({ input }) => {
      return await db.getComplianceNotificationHistory(input?.limit || 50);
    }),
    sendPending: adminProcedure.mutation(async () => {
      const unsent = await db.getUnsentComplianceNotifications(50);
      if (unsent.length === 0) return { sent: 0, total: 0 };
      const { sendNotificationEmail, isEmailConfigured } = await import('./email');
      if (!isEmailConfigured()) return { sent: 0, total: unsent.length, error: 'البريد غير مُعد' };
      const prefs = await db.getActiveEmailPrefs();
      let sent = 0;
      for (const notif of unsent) {
        for (const pref of prefs) {
          try {
            const emailAddr = (pref as any).emailAddress;
            if (!emailAddr) continue;
            await sendNotificationEmail({
              to: emailAddr,
              title: `تغيير حالة الامتثال: ${notif.domain}`,
              message: `تغيرت حالة الامتثال للموقع ${notif.domain} من "${notif.previousStatus || 'غير محدد'}" إلى "${notif.newStatus}" (النقاط: ${notif.previousScore || 0} → ${notif.newScore})`,
              type: 'warning',
            });
            sent++;
          } catch { /* skip */ }
        }
        await db.markNotificationEmailSent(notif.id, 'batch');
      }
      return { sent, total: unsent.length };
    }),
  }),
  // ─── Deep Scan Final Report ──────────────────────────────────────
  deepScanReport: router({
    finalReport: protectedProcedure.input(z.object({ jobId: z.number() })).query(async ({ input }) => {
      return await db.getDeepScanFinalReport(input.jobId);
    }),
  }),
  // ─── Comparison Export ──────────────────────────────────────────
  comparisonExport: router({
    exportPdf: protectedProcedure.input(z.object({
      siteIds: z.array(z.number()).min(2).max(10),
      title: z.string().default('تقرير المقارنة'),
    })).mutation(async ({ input }) => {
      const data = await db.getDetailedComparisonData(input.siteIds);
      return { success: true, data, title: input.title };
    }),
    exportExcel: protectedProcedure.input(z.object({
      siteIds: z.array(z.number()).min(2).max(10),
    })).mutation(async ({ input }) => {
      const data = await db.getDetailedComparisonData(input.siteIds);
      const ExcelJS = (await import('exceljs')).default;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('المقارنة');
      if (Array.isArray(data) && data.length > 0) {
        const headers = ['الموقع', 'النطاق', 'حالة الامتثال', 'النقاط', 'القطاع', 'التصنيف'];
        ws.addRow(headers);
        for (const site of data) {
          ws.addRow([(site as any).name || '', (site as any).domain || '', (site as any).complianceStatus || '', (site as any).complianceScore || 0, (site as any).sectorType || '', (site as any).classification || '']);
        }
        ws.getRow(1).eachCell(cell => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF273470' } };
        });
      }
      const buffer = await wb.xlsx.writeBuffer();
      const base64 = Buffer.from(buffer as ArrayBuffer).toString('base64');
      return { base64, filename: `comparison-report.xlsx` };
    }),
  }),

  // ============================================
  // Super Admin Control Panel
  // ============================================
  superAdmin: router({
    // Platform Settings
    getSettings: protectedProcedure.query(async () => {
      return db.getAllPlatformSettings();
    }),
    getSettingsByCategory: protectedProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
      return db.getPlatformSettingsByCategory(input.category);
    }),
    upsertSetting: protectedProcedure.input(z.object({
      settingKey: z.string(),
      settingValue: z.string(),
      settingType: z.string().optional(),
      category: z.string().optional(),
      label: z.string().optional(),
      description: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = db.upsertPlatformSetting({ ...input, updatedBy: ctx.user.id });
      configCache = null; configCacheTime = null; // Invalidate config cache
      return result;
    }),
    deleteSetting: protectedProcedure.input(z.object({ key: z.string() })).mutation(async ({ input }) => {
      await db.deletePlatformSetting(input.key);
      configCache = null; configCacheTime = null; // Invalidate config cache
      return { success: true };
    }),

    // Page Configs
    getPages: protectedProcedure.query(async () => {
      return db.getAllPageConfigs();
    }),
    upsertPage: protectedProcedure.input(z.object({
      pageKey: z.string(),
      titleAr: z.string().optional(),
      titleEn: z.string().optional(),
      icon: z.string().optional(),
      path: z.string().optional(),
      isVisible: z.boolean().optional(),
      sortOrder: z.number().optional(),
      parentKey: z.string().optional(),
      requiredRole: z.string().optional(),
      description: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      return db.upsertPageConfig({ ...input, updatedBy: ctx.user.id });
    }),
    deletePage: protectedProcedure.input(z.object({ pageKey: z.string() })).mutation(async ({ input }) => {
      await db.deletePageConfig(input.pageKey);
      return { success: true };
    }),
    reorderPages: protectedProcedure.input(z.object({
      pages: z.array(z.object({ pageKey: z.string(), sortOrder: z.number() }))
    })).mutation(async ({ input }) => {
      await db.reorderPages(input.pages);
      return { success: true };
    }),

    // Theme Settings
    getTheme: protectedProcedure.query(async () => {
      return db.getAllThemeSettings();
    }),
    getThemeByCategory: protectedProcedure.input(z.object({ category: z.string() })).query(async ({ input }) => {
      return db.getThemeSettingsByCategory(input.category);
    }),
    upsertTheme: protectedProcedure.input(z.object({
      themeKey: z.string(),
      themeValue: z.string(),
      category: z.string().optional(),
      label: z.string().optional(),
      cssVariable: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      return db.upsertThemeSetting({ ...input, updatedBy: ctx.user.id });
    }),
    deleteTheme: protectedProcedure.input(z.object({ key: z.string() })).mutation(async ({ input }) => {
      await db.deleteThemeSetting(input.key);
      return { success: true };
    }),

    // Content Blocks
    getContent: protectedProcedure.input(z.object({ pageKey: z.string().optional() })).query(async ({ input }) => {
      if (input.pageKey) return db.getContentBlocksByPage(input.pageKey);
      return db.getAllContentBlocks();
    }),
    upsertContent: protectedProcedure.input(z.object({
      pageKey: z.string(),
      blockKey: z.string(),
      blockType: z.string().optional(),
      contentAr: z.string().optional(),
      contentEn: z.string().optional(),
      mediaUrl: z.string().optional(),
      sortOrder: z.number().optional(),
      isVisible: z.boolean().optional(),
      metadata: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      return db.upsertContentBlock({ ...input, updatedBy: ctx.user.id });
    }),
    deleteContent: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteContentBlock(input.id);
      return { success: true };
    }),

    // Members Management
    getMembers: protectedProcedure.query(async () => {
      return db.adminGetAllUsers();
    }),
    updateMemberRole: protectedProcedure.input(z.object({
      userId: z.number(),
      role: z.string(),
    })).mutation(async ({ input, ctx }) => {
      return db.adminUpdateUserRole(input.userId, input.role, ctx.user.id);
    }),
    deleteMember: protectedProcedure.input(z.object({ userId: z.number() })).mutation(async ({ input }) => {
      await db.adminDeleteUser(input.userId);
      return { success: true };
    }),

    // Data Transfer Logs
    getTransferLogs: protectedProcedure.query(async () => {
      return db.getDataTransferLogs();
    }),

    // Export Data
    exportData: protectedProcedure.input(z.object({
      section: z.enum(["all", "sites", "scans", "users", "letters", "cases"]),
    })).mutation(async ({ input, ctx }) => {
      const log = await db.createDataTransferLog({ operation: "export", section: input.section, userId: ctx.user.id, status: "processing" });
      try {
        let data: any = {};
        if (input.section === "all" || input.section === "sites") data.sites = await db.exportSitesData();
        if (input.section === "all" || input.section === "scans") data.scans = await db.exportScansData();
        if (input.section === "all" || input.section === "users") data.users = await db.exportUsersData();
        if (input.section === "all" || input.section === "letters") data.letters = await db.exportLettersData();
        if (input.section === "all" || input.section === "cases") data.cases = await db.exportCasesData();
        const totalRecords = Object.values(data).reduce((sum: number, arr: any) => sum + (arr?.length || 0), 0);
        await db.updateDataTransferLog(log.id, { status: "completed", recordCount: totalRecords as number, completedAt: new Date() });
        return { success: true, data, recordCount: totalRecords };
      } catch (e: any) {
        await db.updateDataTransferLog(log.id, { status: "failed", errorMessage: e.message });
        throw e;
      }
    }),

    // Import Data
    importData: protectedProcedure.input(z.object({
      section: z.string(),
      data: z.any(),
    })).mutation(async ({ input, ctx }) => {
      const log = await db.createDataTransferLog({ operation: "import", section: input.section, userId: ctx.user.id, status: "processing" });
      try {
        let recordCount = 0;
        if (input.section === "settings" && Array.isArray(input.data)) {
          for (const item of input.data) {
            await db.upsertPlatformSetting({ ...item, updatedBy: ctx.user.id });
            recordCount++;
          }
        } else if (input.section === "pages" && Array.isArray(input.data)) {
          for (const item of input.data) {
            await db.upsertPageConfig({ ...item, updatedBy: ctx.user.id });
            recordCount++;
          }
        } else if (input.section === "theme" && Array.isArray(input.data)) {
          for (const item of input.data) {
            await db.upsertThemeSetting({ ...item, updatedBy: ctx.user.id });
            recordCount++;
          }
        } else if (input.section === "content" && Array.isArray(input.data)) {
          for (const item of input.data) {
            await db.upsertContentBlock({ ...item, updatedBy: ctx.user.id });
            recordCount++;
          }
        }
        await db.updateDataTransferLog(log.id, { status: "completed", recordCount, completedAt: new Date() });
        return { success: true, recordCount };
      } catch (e: any) {
        await db.updateDataTransferLog(log.id, { status: "failed", errorMessage: e.message });
        throw e;
      }
    }),

    // System Overview
    getSystemOverview: protectedProcedure.query(async () => {
      const dbConn = await db.getDb();
      const [siteCount] = await dbConn!.select({ count: count() }).from(sites);
      const [scanCount] = await dbConn!.select({ count: count() }).from(scans);
      const [userCount] = await dbConn!.select({ count: count() }).from(users);
      const [letterCount] = await dbConn!.select({ count: count() }).from(letters);
      const [caseCount] = await dbConn!.select({ count: count() }).from(cases);
      const [settingCount] = await dbConn!.select({ count: count() }).from(platformSettings);
      const [pageCount] = await dbConn!.select({ count: count() }).from(pageConfigs);
      const [themeCount] = await dbConn!.select({ count: count() }).from(themeSettings);
      const [contentCount] = await dbConn!.select({ count: count() }).from(contentBlocks);
      return {
        sites: siteCount.count,
        scans: scanCount.count,
        users: userCount.count,
        letters: letterCount.count,
        cases: caseCount.count,
        settings: settingCount.count,
        pages: pageCount.count,
        themes: themeCount.count,
        contentBlocks: contentCount.count,
      };
    }),
    // ============================================
    // Live Config Endpoint (for PlatformSettingsContext)
    // ============================================
    getAllConfig: publicProcedure.query(async () => {
      // Cache config for 60 seconds to reduce DB load
      const now = Date.now();
      if (configCache && configCacheTime && (now - configCacheTime) < 60000) {
        return configCache;
      }
      const result = await db.getAllPlatformConfig();
      configCache = result;
      configCacheTime = now;
      return result;
    }),

    // ============================================
    // Audit Log Endpoints
    // ============================================
    getAuditLogs: protectedProcedure.input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    })).query(async ({ input }) => {
      const [logs, total] = await Promise.all([
        db.getAuditLogs(input.limit, input.offset),
        db.getAuditLogCount(),
      ]);
      return { logs, total };
    }),

    getAuditLogsByRecord: protectedProcedure.input(z.object({
      tableName: z.string(),
      recordKey: z.string(),
    })).query(async ({ input }) => {
      return await db.getAuditLogsByRecord(input.tableName, input.recordKey);
    }),

    // Rollback a setting to a previous value from audit log
    rollbackSetting: protectedProcedure.input(z.object({
      auditLogId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.getAuditLogs(1000, 0) as unknown;
      const logs = (Array.isArray(result) ? result : []) as any[];
      const logEntry = logs.find((l: any) => l.id === input.auditLogId);
      if (!logEntry) throw new TRPCError({ code: 'NOT_FOUND', message: 'سجل التغيير غير موجود' });

      const oldValue = logEntry.old_value;
      if (oldValue === null || oldValue === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'لا يمكن التراجع - لا توجد قيمة سابقة' });
      }

      // Apply rollback based on table
      if (logEntry.table_name === 'platform_settings') {
        await db.upsertPlatformSetting({
          settingKey: logEntry.record_key,
          settingValue: oldValue,
          category: 'branding',
        });
      } else if (logEntry.table_name === 'theme_settings') {
        await db.upsertThemeSetting({
          themeKey: logEntry.record_key,
          themeValue: oldValue,
          category: 'primary',
        });
      }

      // Log the rollback
      await db.createAuditLogEntry({
        tableName: logEntry.table_name,
        recordKey: logEntry.record_key,
        fieldName: logEntry.field_name,
        oldValue: logEntry.new_value,
        newValue: oldValue,
        changeType: 'rollback',
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.username,
      });

      return { success: true };
    }),

    // Tracked update - updates setting and logs the change
    trackedUpdateSetting: protectedProcedure.input(z.object({
      settingKey: z.string(),
      settingValue: z.string(),
      category: z.string(),
    })).mutation(async ({ input, ctx }) => {
      // Get old value
      const existing = await db.getPlatformSettingsByCategory(input.category as any);
      const old = (existing as any[]).find((s: any) => s.settingKey === input.settingKey);
      const oldValue = old?.settingValue || null;

      // Update
      await db.upsertPlatformSetting({
        settingKey: input.settingKey,
        settingValue: input.settingValue,
        category: input.category as any,
      });

      // Log
      await db.createAuditLogEntry({
        tableName: 'platform_settings',
        recordKey: input.settingKey,
        fieldName: 'settingValue',
        oldValue,
        newValue: input.settingValue,
        changeType: old ? 'update' : 'create',
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.username,
      });

      return { success: true };
    }),

    trackedUpdateTheme: protectedProcedure.input(z.object({
      themeKey: z.string(),
      themeValue: z.string(),
      category: z.string(),
    })).mutation(async ({ input, ctx }) => {
      const existing = await db.getThemeSettingsByCategory(input.category as any);
      const old = (existing as any[]).find((t: any) => t.themeKey === input.themeKey);
      const oldValue = old?.themeValue || null;

      await db.upsertThemeSetting({
        themeKey: input.themeKey,
        themeValue: input.themeValue,
        category: input.category as any,
      });

      await db.createAuditLogEntry({
        tableName: 'theme_settings',
        recordKey: input.themeKey,
        fieldName: 'themeValue',
        oldValue,
        newValue: input.themeValue,
        changeType: old ? 'update' : 'create',
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.username,
      });

      return { success: true };
    }),

    // ===== Seed Database from CSV Data =====
    seedDatabase: rootAdminProcedure.input(z.object({
      clearExisting: z.boolean().default(false),
    })).mutation(async ({ input }) => {
      const fs = await import('fs');
      const path = await import('path');
      const zlib = await import('zlib');
      const { promisify } = await import('util');
      const gunzip = promisify(zlib.gunzip);
      
      const gzPath = path.join(process.cwd(), 'server', 'seed-data.json.gz');
      const jsonPath = path.join(process.cwd(), 'server', 'seed-data.json');
      
      let seedData: any[];
      if (fs.existsSync(gzPath)) {
        const compressed = fs.readFileSync(gzPath);
        const decompressed = await gunzip(compressed);
        seedData = JSON.parse(decompressed.toString());
      } else if (fs.existsSync(jsonPath)) {
        seedData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      } else {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Seed data file not found' });
      }
      
      const currentCount = await db.getSitesCount();
      if (currentCount > 0 && !input.clearExisting) {
        return { success: false, message: `Database already has ${currentCount} sites. Set clearExisting=true to replace.`, currentCount };
      }
      
      if (input.clearExisting) {
        await db.clearAllScans();
        await db.clearAllSites();
      }
      
      const sitesData = seedData.map((s: any) => ({
        domain: s.d,
        url: s.u,
        siteNameAr: s.na || null,
        siteNameEn: s.ne || null,
        title: s.t || null,
        classification: s.cl || null,
        siteStatus: s.s === 1 ? 'active' as const : 'unreachable' as const,
        complianceStatus: s.s !== 1 ? 'not_working' as const : (s.p ? 'partial' as const : 'non_compliant' as const),
        hasPrivacyPolicy: s.p ? 1 : 0,
        privacyUrl: s.p || null,
        cms: s.cm || null,
        sslStatus: s.ssl || null,
        sectorType: (s.cl && s.cl.includes('\u062d\u0643\u0648\u0645')) ? 'public' as const : 'private' as const,
      }));
      
      const result = await db.bulkInsertSites(sitesData);
      return { success: true, sites: result, totalSeedData: seedData.length };
    }),

  }),

  // ===== Strategy Coverage Report =====
  strategyReport: router({
    coverage: protectedProcedure.query(async () => {
      const { scans, sites } = await import('../drizzle/schema');
      const { getDb } = await import('./db');
      const dbInstance = await getDb();
      
      if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB not available' });
      // Get all scans with privacy discovery method
      const allScans = await dbInstance.select({
        id: scans.id,
        domain: scans.domain,
        privacyDiscoveryMethod: scans.privacyDiscoveryMethod,
        complianceStatus: scans.complianceStatus,
        overallScore: scans.overallScore,
        crawlStatus: scans.crawlStatus,
      }).from(scans).orderBy(desc(scans.id)).limit(50000);
      
      const totalScans = allScans.length;
      const withPrivacy = allScans.filter(s => s.privacyDiscoveryMethod && s.privacyDiscoveryMethod !== '');
      const withoutPrivacy = allScans.filter(s => !s.privacyDiscoveryMethod || s.privacyDiscoveryMethod === '');
      
      // Count by strategy
      const strategyCounts: Record<string, { count: number; compliant: number; partial: number; nonCompliant: number; avgScore: number; scores: number[] }> = {};
      for (const scan of withPrivacy) {
        const method = scan.privacyDiscoveryMethod || 'unknown';
        if (!strategyCounts[method]) strategyCounts[method] = { count: 0, compliant: 0, partial: 0, nonCompliant: 0, avgScore: 0, scores: [] };
        strategyCounts[method].count++;
        if (scan.complianceStatus === 'compliant') strategyCounts[method].compliant++;
        else if (scan.complianceStatus === 'partially_compliant') strategyCounts[method].partial++;
        else strategyCounts[method].nonCompliant++;
        if (scan.overallScore) strategyCounts[method].scores.push(scan.overallScore);
      }
      
      const strategies = Object.entries(strategyCounts).map(([name, data]) => ({
        name,
        arabicName: getStrategyArabicName(name),
        count: data.count,
        percentage: totalScans > 0 ? Math.round((data.count / totalScans) * 100 * 10) / 10 : 0,
        compliant: data.compliant,
        partial: data.partial,
        nonCompliant: data.nonCompliant,
        avgScore: data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10 : 0,
      })).sort((a, b) => b.count - a.count);
      
      // CMS coverage
      const allSitesData = await dbInstance.select({
        cms: sites.cms,
        domain: sites.domain,
      }).from(sites).limit(50000);
      
      const cmsCounts: Record<string, number> = {};
      for (const site of allSitesData) {
        const cms = site.cms || 'غير محدد';
        cmsCounts[cms] = (cmsCounts[cms] || 0) + 1;
      }
      const cmsCoverage = Object.entries(cmsCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20);
      
      return {
        strategies,
        totalScans,
        totalWithPrivacy: withPrivacy.length,
        totalWithoutPrivacy: withoutPrivacy.length,
        cmsCoverage,
        topStrategies: strategies.slice(0, 10),
      };
    }),
    
    // Get recent scans with strategy details
    recentScans: protectedProcedure.input(z.object({
      limit: z.number().optional().default(100),
      strategy: z.string().optional(),
    })).query(async ({ input }) => {
      const { scans } = await import('../drizzle/schema');
      const { getDb: getDb2 } = await import('./db');
      const dbInstance2 = await getDb2();
      if (!dbInstance2) throw new Error('DB not available');
      
      let query = dbInstance2.select({
        id: scans.id,
        domain: scans.domain,
        privacyDiscoveryMethod: scans.privacyDiscoveryMethod,
        complianceStatus: scans.complianceStatus,
        overallScore: scans.overallScore,
        createdAt: scans.createdAt,
      }).from(scans).orderBy(desc(scans.id)).limit(input.limit);
      
      const results = await query;  
      if (input.strategy) {
        return results.filter(r => r.privacyDiscoveryMethod === input.strategy);
      }
      return results;
    }),
  }),

  // ===== Mass Re-scan =====
  massRescan: router({
    start: protectedProcedure.input(z.object({
      filter: z.enum(['all', 'no_policy', 'non_compliant', 'unreachable']).optional().default('all'),
      limit: z.number().optional().default(100),
    })).mutation(async ({ input, ctx }) => {
      const allSites = await db.getSites({ page: 1, limit: 50000 });
      let sitesToScan = allSites.sites;
      
      if (input.filter === 'no_policy') {
        sitesToScan = sitesToScan.filter((s: any) => !s.privacyUrl);
      } else if (input.filter === 'non_compliant') {
        // Get latest scan for each site
        sitesToScan = sitesToScan; // Will be filtered by scan results
      } else if (input.filter === 'unreachable') {
        sitesToScan = sitesToScan.filter((s: any) => s.siteStatus === 'unreachable');
      }
      
      const limitedSites = sitesToScan.slice(0, input.limit);
      
      // Create batch scan job
      const job = await db.insertBatchScanJob({
        jobName: `إعادة فحص جماعي - ${input.filter === 'all' ? 'جميع المواقع' : input.filter === 'no_policy' ? 'بدون سياسة' : input.filter === 'non_compliant' ? 'غير ممتثل' : 'غير قابل للوصول'} (${limitedSites.length} موقع)`,
        totalUrls: limitedSites.length,
        completedUrls: 0,
        failedUrls: 0,
        status: 'running',
        createdBy: ctx.user.id,
        startedAt: new Date(),
      });
      if (!job) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'فشل في إنشاء مهمة إعادة الفحص' });
      
      // Process in background
      const urls = limitedSites.map((s: any) => ({ url: s.domain, entityName: s.siteName, sectorType: s.sectorType, classification: s.classification }));
      processBatchScan(job.id, urls, ctx.user.id).catch(console.error);
      
      await db.insertActivityLog({
        userId: ctx.user.id,
        username: ctx.user.name || '',
        action: 'mass_rescan',
        details: `بدء إعادة فحص جماعي: ${limitedSites.length} موقع (فلتر: ${input.filter})`,
        ipAddress: ctx.req.ip || ctx.req.headers['x-forwarded-for']?.toString() || '',
      });
      
      return { jobId: job.id, totalSites: limitedSites.length };
    }),
    
    status: protectedProcedure.input(z.object({ jobId: z.number() })).query(async ({ input }) => {
      return await db.getBatchScanJob(input.jobId);
    }),
  }),

  // ─── Presentation Builder ──────────────────────────────────
  presentationBuilder: router({
    // Templates
    listTemplates: publicProcedure.input(z.object({ category: z.string().optional() }).optional()).query(async ({ input }) => {
      return db.getTemplates(input?.category);
    }),
    getTemplate: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getTemplateById(input.id);
    }),
    seedTemplates: protectedProcedure.mutation(async () => {
      const builtInTemplates = [
        {
          name: 'خطة عمل',
          nameEn: 'Business Plan',
          description: 'قالب خطة عمل احترافي يشمل الرؤية والأهداف والاستراتيجية والتحليل المالي',
          category: 'business_plan' as const,
          isBuiltIn: 1,
          slides: JSON.stringify([
            { id: 's1', type: 'cover', title: 'خطة العمل', subtitle: 'اسم المشروع', content: '', bgColor: '#0B1D35', textColor: '#ffffff', layout: 'center' },
            { id: 's2', type: 'content', title: 'الرؤية والرسالة', subtitle: '', content: 'رؤيتنا: [أدخل الرؤية هنا]\n\nرسالتنا: [أدخل الرسالة هنا]\n\nقيمنا الأساسية:\n• الابتكار\n• الجودة\n• الشفافية', bgColor: '#ffffff', textColor: '#0B1D35', layout: 'right' },
            { id: 's3', type: 'content', title: 'تحليل السوق', subtitle: 'الفرص والتحديات', content: 'حجم السوق: [أدخل البيانات]\n\nالفئة المستهدفة: [أدخل التفاصيل]\n\nالمنافسون الرئيسيون:\n• [منافس 1]\n• [منافس 2]\n• [منافس 3]\n\nالميزة التنافسية: [أدخل الميزة]', bgColor: '#f8f9fa', textColor: '#0B1D35', layout: 'right' },
            { id: 's4', type: 'content', title: 'الاستراتيجية', subtitle: 'خارطة الطريق', content: 'المرحلة الأولى (3 أشهر):\n[أدخل التفاصيل]\n\nالمرحلة الثانية (6 أشهر):\n[أدخل التفاصيل]\n\nالمرحلة الثالثة (12 شهر):\n[أدخل التفاصيل]', bgColor: '#ffffff', textColor: '#0B1D35', layout: 'right' },
            { id: 's5', type: 'stats', title: 'التحليل المالي', subtitle: 'التوقعات المالية', content: 'رأس المال المطلوب: [المبلغ] ريال\n\nالإيرادات المتوقعة (سنة 1): [المبلغ] ريال\nالإيرادات المتوقعة (سنة 2): [المبلغ] ريال\nالإيرادات المتوقعة (سنة 3): [المبلغ] ريال\n\nنقطة التعادل: [الفترة]', bgColor: '#f8f9fa', textColor: '#0B1D35', layout: 'center' },
            { id: 's6', type: 'content', title: 'الفريق', subtitle: 'فريق العمل', content: '[الاسم] - [المنصب]\n[الخبرة والمؤهلات]\n\n[الاسم] - [المنصب]\n[الخبرة والمؤهلات]\n\n[الاسم] - [المنصب]\n[الخبرة والمؤهلات]', bgColor: '#ffffff', textColor: '#0B1D35', layout: 'right' },
            { id: 's7', type: 'closing', title: 'شكراً لكم', subtitle: 'نتطلع للتعاون معكم', content: 'للتواصل:\n[البريد الإلكتروني]\n[رقم الهاتف]\n[الموقع الإلكتروني]', bgColor: '#0B1D35', textColor: '#ffffff', layout: 'center' },
          ]),
        },
        {
          name: 'تقرير',
          nameEn: 'Report',
          description: 'قالب تقرير رسمي يشمل الملخص التنفيذي والنتائج والتوصيات',
          category: 'report' as const,
          isBuiltIn: 1,
          slides: JSON.stringify([
            { id: 's1', type: 'cover', title: 'التقرير', subtitle: 'عنوان التقرير', content: '', bgColor: '#1a5276', textColor: '#ffffff', layout: 'center' },
            { id: 's2', type: 'content', title: 'الملخص التنفيذي', subtitle: '', content: '[أدخل ملخصاً موجزاً للتقرير يشمل أهم النتائج والتوصيات في فقرة واحدة أو فقرتين]', bgColor: '#ffffff', textColor: '#1a5276', layout: 'right' },
            { id: 's3', type: 'content', title: 'المقدمة', subtitle: 'خلفية التقرير', content: 'الهدف من التقرير:\n[أدخل الهدف]\n\nالنطاق:\n[أدخل النطاق]\n\nالمنهجية:\n[أدخل المنهجية المستخدمة]\n\nالفترة الزمنية:\n[أدخل الفترة]', bgColor: '#f8f9fa', textColor: '#1a5276', layout: 'right' },
            { id: 's4', type: 'stats', title: 'النتائج الرئيسية', subtitle: 'الأرقام والإحصائيات', content: 'النتيجة 1: [أدخل النتيجة مع الأرقام]\n\nالنتيجة 2: [أدخل النتيجة مع الأرقام]\n\nالنتيجة 3: [أدخل النتيجة مع الأرقام]\n\nالنتيجة 4: [أدخل النتيجة مع الأرقام]', bgColor: '#ffffff', textColor: '#1a5276', layout: 'center' },
            { id: 's5', type: 'content', title: 'التحليل', subtitle: 'تحليل مفصل للنتائج', content: '[أدخل التحليل التفصيلي للنتائج مع الرسوم البيانية والمقارنات]', bgColor: '#f8f9fa', textColor: '#1a5276', layout: 'right' },
            { id: 's6', type: 'content', title: 'التوصيات', subtitle: '', content: '1. [التوصية الأولى]\n\n2. [التوصية الثانية]\n\n3. [التوصية الثالثة]\n\n4. [التوصية الرابعة]\n\n5. [التوصية الخامسة]', bgColor: '#ffffff', textColor: '#1a5276', layout: 'right' },
            { id: 's7', type: 'closing', title: 'الخلاصة', subtitle: '', content: '[أدخل خلاصة موجزة للتقرير والخطوات التالية المقترحة]', bgColor: '#1a5276', textColor: '#ffffff', layout: 'center' },
          ]),
        },
        {
          name: 'عرض مبيعات',
          nameEn: 'Sales Pitch',
          description: 'قالب عرض مبيعات جذاب يشمل المشكلة والحل والمزايا والتسعير',
          category: 'sales_pitch' as const,
          isBuiltIn: 1,
          slides: JSON.stringify([
            { id: 's1', type: 'cover', title: 'عرض المنتج', subtitle: 'اسم المنتج/الخدمة', content: '', bgColor: '#0B1D35', textColor: '#C5A55A', layout: 'center' },
            { id: 's2', type: 'content', title: 'المشكلة', subtitle: 'التحدي الذي يواجه عملاءنا', content: '[صف المشكلة الرئيسية التي يعاني منها العملاء المستهدفون]\n\nالأثر:\n• [أثر 1]\n• [أثر 2]\n• [أثر 3]', bgColor: '#ffffff', textColor: '#0B1D35', layout: 'right' },
            { id: 's3', type: 'content', title: 'الحل', subtitle: 'كيف نحل هذه المشكلة', content: '[صف الحل الذي تقدمه بشكل واضح ومقنع]\n\nالمزايا الرئيسية:\n• [ميزة 1]\n• [ميزة 2]\n• [ميزة 3]', bgColor: '#f0f4f8', textColor: '#0B1D35', layout: 'right' },
            { id: 's4', type: 'stats', title: 'النتائج', subtitle: 'أرقام تتحدث عن نفسها', content: 'نسبة رضا العملاء: 95%\n\nعدد العملاء: +500\n\nتوفير التكاليف: 40%\n\nزيادة الإنتاجية: 60%', bgColor: '#0B1D35', textColor: '#C5A55A', layout: 'center' },
            { id: 's5', type: 'content', title: 'قصص النجاح', subtitle: 'شهادات عملائنا', content: '"[شهادة العميل 1]"\n- [اسم العميل], [المنصب], [الشركة]\n\n"[شهادة العميل 2]"\n- [اسم العميل], [المنصب], [الشركة]', bgColor: '#ffffff', textColor: '#0B1D35', layout: 'right' },
            { id: 's6', type: 'stats', title: 'الباقات والأسعار', subtitle: '', content: 'الباقة الأساسية: [السعر] ريال/شهر\n[المميزات]\n\nالباقة المتقدمة: [السعر] ريال/شهر\n[المميزات]\n\nباقة المؤسسات: تواصل معنا\n[المميزات]', bgColor: '#f0f4f8', textColor: '#0B1D35', layout: 'center' },
            { id: 's7', type: 'closing', title: 'ابدأ الآن', subtitle: 'لا تفوت الفرصة', content: 'تواصل معنا:\n[البريد الإلكتروني]\n[رقم الهاتف]\n[الموقع الإلكتروني]\n\nعرض خاص: [تفاصيل العرض]', bgColor: '#0B1D35', textColor: '#C5A55A', layout: 'center' },
          ]),
        },
      ];
      return db.seedBuiltInTemplates(builtInTemplates);
    }),

    // User Presentations CRUD
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPresentations(ctx.user.id);
    }),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getPresentationById(input.id);
    }),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      templateId: z.number().optional(),
      slides: z.any(),
    })).mutation(async ({ input, ctx }) => {
      return db.createPresentation({ ...input, userId: ctx.user.id });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      slides: z.any().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updatePresentation(id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return db.deletePresentation(input.id);
    }),

    // PPTX Export
    exportPptx: protectedProcedure.input(z.object({
      presentationId: z.number().optional(),
      slides: z.any().optional(),
      title: z.string().optional(),
    })).mutation(async ({ input }) => {
      let slides: any[];
      let title: string;
      if (input.presentationId) {
        const pres = await db.getPresentationById(input.presentationId);
        if (!pres) throw new Error('العرض غير موجود');
        slides = typeof pres.slides === 'string' ? JSON.parse(pres.slides) : pres.slides as any[];
        title = pres.title;
      } else {
        slides = input.slides || [];
        title = input.title || 'عرض تقديمي';
      }

      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'منصة راصد';
      pptx.title = title;

      for (const slide of slides) {
        const s = pptx.addSlide();
        const bgColor = (slide.bgColor || '#0B1D35').replace('#', '');
        const txtColor = (slide.textColor || '#ffffff').replace('#', '');
        s.background = { color: bgColor };

        // Title
        if (slide.title) {
          s.addText(slide.title, {
            x: 0.5, y: slide.type === 'cover' ? 2.0 : 0.3,
            w: 12, h: slide.type === 'cover' ? 1.5 : 0.8,
            fontSize: slide.type === 'cover' ? 40 : 28,
            color: txtColor, bold: true, align: 'right', fontFace: 'Arial',
          });
        }

        // Subtitle
        if (slide.subtitle) {
          s.addText(slide.subtitle, {
            x: 0.5, y: slide.type === 'cover' ? 3.5 : 1.1,
            w: 12, h: 0.6,
            fontSize: slide.type === 'cover' ? 24 : 18,
            color: txtColor, align: 'right', fontFace: 'Arial',
            italic: slide.type === 'cover',
          });
        }

        // Content
        if (slide.content) {
          s.addText(slide.content, {
            x: 0.5, y: slide.type === 'cover' ? 4.5 : 2.0,
            w: 12, h: slide.type === 'cover' ? 1.5 : 4.5,
            fontSize: 16, color: txtColor, align: 'right', fontFace: 'Arial',
            lineSpacingMultiple: 1.3, valign: 'top',
          });
        }

        // Footer
        s.addText('منصة راصد - الهيئة السعودية للبيانات والذكاء الاصطناعي', {
          x: 0.5, y: 6.8, w: 12, h: 0.4,
          fontSize: 10, color: txtColor, align: 'center', fontFace: 'Arial',
          transparency: 50,
        });
      }

      const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
      const { storagePut } = await import('./storage');
      const filename = `presentations/${title.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '_')}_${Date.now()}.pptx`;
      const { url } = await storagePut(filename, buffer, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      return { url, filename: `${title}.pptx` };
    }),
  }),

  // ========== Platform 2 Unique Routers ==========

  platformAuth: router({
    seedUsers: publicProcedure.mutation(async () => {
      const defaultUsers = [
        { userId: "mruhaily", name: "Muhammed ALRuhaily", email: "prog.muhammed@gmail.com", mobile: "+966553445533", displayName: "Admin Rasid System", platformRole: "root_admin" as const },
        { userId: "aalrebdi", name: "Alrebdi Fahad Alrebdi", email: "aalrebdi@ndmo.gov.sa", mobile: "", displayName: "NDMO's president/director", platformRole: "director" as const },
        { userId: "msarhan", name: "Mashal Abdullah Alsarhan", email: "msarhan@nic.gov.sa", mobile: "0555113675", displayName: "Vice President of NDMO", platformRole: "vice_president" as const },
        { userId: "malmoutaz", name: "Manal Mohammed Almoutaz", email: "malmoutaz@ndmo.gov.sa", mobile: "0542087872", displayName: "Manager of Smart Rasid Platform", platformRole: "manager" as const },
      ];
      const passwordHash = await bcrypt.hash("15001500", 12);
      const results: string[] = [];
      for (const u of defaultUsers) {
        const existing = await getPlatformUserByUserId(u.userId);
        if (existing) {
          await updatePlatformUser(existing.id, { passwordHash, status: "active" });
          results.push(`Updated: ${u.userId}`);
        } else {
          await createPlatformUser({ ...u, passwordHash });
          results.push(`Created: ${u.userId}`);
        }
      }
      return { success: true, results };
    }),
    login: publicProcedure
      .input(z.object({
        userId: z.string().min(1),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await getPlatformUserByUserId(input.userId.toUpperCase());
        if (!user) {
          // Also try lowercase
          const userLower = await getPlatformUserByUserId(input.userId);
          if (!userLower) {
            throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
          }
          const valid = await bcrypt.compare(input.password, userLower.passwordHash);
          if (!valid) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
          if (userLower.status !== "active") throw new Error("الحساب معطل. تواصل مع المسؤول.");

          // Create JWT
          const secret = new TextEncoder().encode(ENV.cookieSecret);
          const token = await new SignJWT({ platformUserId: userLower.id, userId: userLower.userId })
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .setExpirationTime(Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000))
            .sign(secret);

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie("platform_session", token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });

          await updatePlatformUser(userLower.id, { lastLoginAt: new Date() });
          await logAudit(userLower.id, "auth.platform_login", `Platform user ${userLower.displayName} logged in`, "auth", userLower.displayName);

          return { success: true, displayName: userLower.displayName, role: userLower.platformRole };
        }

        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
        if (user.status !== "active") throw new Error("الحساب معطل. تواصل مع المسؤول.");

        // Create JWT
        const secret = new TextEncoder().encode(ENV.cookieSecret);
        const token = await new SignJWT({ platformUserId: user.id, userId: user.userId })
          .setProtectedHeader({ alg: "HS256", typ: "JWT" })
          .setExpirationTime(Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000))
          .sign(secret);

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie("platform_session", token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });

        await updatePlatformUser(user.id, { lastLoginAt: new Date() });
        await logAudit(user.id, "auth.platform_login", `Platform user ${user.displayName} logged in`, "auth", user.displayName);

        return { success: true, displayName: user.displayName, role: user.platformRole };
      }),
  }),

  userManagement: router({
    list: protectedProcedure.query(async () => {
      const users = await getAllPlatformUsers();
      // Return without password hashes
      return users.map(u => ({
        id: u.id,
        userId: u.userId,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        displayName: u.displayName,
        platformRole: u.platformRole,
        status: u.status,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await getPlatformUserById(input.id);
        if (!user) throw new Error("المستخدم غير موجود");
        return {
          id: user.id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          displayName: user.displayName,
          platformRole: user.platformRole,
          status: user.status,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }),
    create: adminProcedure
      .input(z.object({
        userId: z.string().min(1),
        password: z.string().min(6),
        name: z.string().min(1),
        email: z.string().email().optional(),
        mobile: z.string().optional(),
        displayName: z.string().min(1),
        platformRole: z.enum(["root_admin", "director", "vice_president", "manager", "analyst", "viewer"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getPlatformUserByUserId(input.userId);
        if (existing) throw new Error("اسم المستخدم مستخدم بالفعل");
        const hash = await bcrypt.hash(input.password, 12);
        await createPlatformUser({
          userId: input.userId,
          passwordHash: hash,
          name: input.name,
          email: input.email ?? null,
          mobile: input.mobile ?? null,
          displayName: input.displayName,
          platformRole: input.platformRole,
        });
        const who = ctx.platformUser?.displayName ?? ctx.user?.name ?? "System";
        await logAudit(ctx.platformUser?.id ?? ctx.user?.id ?? 0, "user.create", `Created platform user ${input.userId}`, "user_management", who);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        mobile: z.string().optional(),
        displayName: z.string().optional(),
        platformRole: z.enum(["root_admin", "director", "vice_president", "manager", "analyst", "viewer"]).optional(),
        status: z.enum(["active", "inactive", "suspended"]).optional(),
        password: z.string().min(6).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // ═══ PROTECTED ROOT ADMINS — Cannot modify role/status for any of the 4 protected admins ═══
        const targetUser = await getPlatformUserById(input.id);
        if (targetUser && isProtectedAdmin(targetUser.userId)) {
          // Protected admins: block role downgrade
          if (input.platformRole && input.platformRole !== "root_admin") {
            throw new Error("لا يمكن تغيير صلاحية مدير النظام المحمي — هذا الحساب محمي من التعديل");
          }
          // Protected admins: block deactivation
          if (input.status && input.status !== "active") {
            throw new Error("لا يمكن تعطيل حساب مدير النظام المحمي — هذا الحساب محمي من التعديل");
          }
          // Protected admins: block name/email/mobile/displayName changes by non-protected users
          if (!ctx.platformUser || !isProtectedAdmin(ctx.platformUser.userId)) {
            throw new Error("لا يمكن تعديل حساب مدير النظام المحمي — فقط المديرون المحميون يمكنهم التعديل");
          }
        }
        const updates: Record<string, unknown> = {};
        if (input.name) updates.name = input.name;
        if (input.email !== undefined) updates.email = input.email;
        if (input.mobile !== undefined) updates.mobile = input.mobile;
        if (input.displayName) updates.displayName = input.displayName;
        if (input.platformRole) updates.platformRole = input.platformRole;
        if (input.status) updates.status = input.status;
        if (input.password) updates.passwordHash = await bcrypt.hash(input.password, 12);
        await updatePlatformUser(input.id, updates as any);
        const who = ctx.platformUser?.displayName ?? ctx.user?.name ?? "System";
        await logAudit(ctx.platformUser?.id ?? ctx.user?.id ?? 0, "user.update", `Updated platform user #${input.id}`, "user_management", who);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // ═══ PROTECTED ROOT ADMINS — Cannot delete any of the 4 protected admins ═══
        const targetUser = await getPlatformUserById(input.id);
        if (targetUser && isProtectedAdmin(targetUser.userId)) {
          throw new Error("لا يمكن حذف حساب مدير النظام المحمي — هذا الحساب محمي بشكل دائم");
        }
        await deletePlatformUser(input.id);
        const who = ctx.platformUser?.displayName ?? ctx.user?.name ?? "System";
        await logAudit(ctx.platformUser?.id ?? ctx.user?.id ?? 0, "user.delete", `Deleted platform user #${input.id}`, "user_management", who);
        return { success: true };
      }),
    resetPassword: adminProcedure
      .input(z.object({
        id: z.number(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        // ═══ PROTECTED ROOT ADMINS — Only protected admins can reset each other's passwords ═══
        const targetUser = await getPlatformUserById(input.id);
        if (targetUser && isProtectedAdmin(targetUser.userId)) {
          if (!ctx.platformUser || !isProtectedAdmin(ctx.platformUser.userId)) {
            throw new Error("لا يمكن إعادة تعيين كلمة مرور مدير النظام المحمي — فقط المديرون المحميون يمكنهم ذلك");
          }
        }
        const hash = await bcrypt.hash(input.newPassword, 12);
        await updatePlatformUser(input.id, { passwordHash: hash });
        const who = ctx.platformUser?.displayName ?? ctx.user?.name ?? "System";
        await logAudit(ctx.platformUser?.id ?? ctx.user?.id ?? 0, "user.reset_password", `Reset password for platform user #${input.id}`, "user_management", who);
        return { success: true };
      }),
  }),

  leaks: router({
    list: publicProcedure
      .input(
        z
          .object({
            source: z.string().optional(),
            severity: z.string().optional(),
            status: z.string().optional(),
            search: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return getLeaks(input);
      }),

    getById: publicProcedure
      .input(z.object({ leakId: z.string() }))
      .query(async ({ input }) => {
        return getLeakById(input.leakId);
      }),

    // Full detail with evidence chain for modal
    detail: publicProcedure
      .input(z.object({ leakId: z.string() }))
      .query(async ({ input }) => {
        const leak = await getLeakById(input.leakId);
        if (!leak) return null;
        const evidence = await getEvidenceChain(input.leakId);
        return { ...leak, evidence };
      }),

    create: protectedProcedure
      .input(
        z.object({
          leakId: z.string(),
          title: z.string(),
          titleAr: z.string(),
          source: z.enum(["telegram", "darkweb", "paste"]),
          severity: z.enum(["critical", "high", "medium", "low"]),
          sector: z.string(),
          sectorAr: z.string(),
          piiTypes: z.array(z.string()),
          recordCount: z.number(),
          description: z.string().optional(),
          descriptionAr: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await createLeak(input);
        await logAudit(getAuthUser(ctx).id, "leak.create", `Created leak ${input.leakId}`, "leak", getAuthUser(ctx).name);
        return { success: true };
      }),

    bulkCreate: publicProcedure
      .input(z.object({
        leaks: z.array(z.object({
          leakId: z.string(),
          title: z.string(),
          titleAr: z.string(),
          source: z.enum(["telegram", "darkweb", "paste"]),
          severity: z.enum(["critical", "high", "medium", "low"]),
          sector: z.string(),
          sectorAr: z.string(),
          piiTypes: z.array(z.string()),
          recordCount: z.number(),
          description: z.string().optional(),
          descriptionAr: z.string().optional(),
          sourceUrl: z.string().optional(),
          sourcePlatform: z.string().optional(),
          threatActor: z.string().optional(),
          leakPrice: z.string().optional(),
          breachMethod: z.string().optional(),
          breachMethodAr: z.string().optional(),
          region: z.string().optional(),
          regionAr: z.string().optional(),
          sampleData: z.any().optional(),
          detectedAt: z.string().optional(),
        }))
      }))
      .mutation(async ({ input }) => {
        let success = 0;
        let failed = 0;
        for (const leak of input.leaks) {
          try {
            await db.createLeak(leak as any);
            success++;
          } catch (e: any) {
            if (e?.message?.includes('Duplicate')) {
              // skip duplicates
            } else {
              failed++;
            }
          }
        }
        return { success, failed, total: input.leaks.length };
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          leakId: z.string(),
          status: z.enum(["new", "analyzing", "documented", "reported"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await updateLeakStatus(input.leakId, input.status);
        await logAudit(getAuthUser(ctx).id, "leak.updateStatus", `Updated ${input.leakId} to ${input.status}`, "leak", getAuthUser(ctx).name);

        // Broadcast status change notification
        broadcastNotification({
          type: "status_change",
          title: `Leak ${input.leakId} status updated to ${input.status}`,
          titleAr: `تم تحديث حالة حالة الرصد ${input.leakId} إلى ${input.status === "analyzing" ? "قيد التحليل" : input.status === "documented" ? "موثق" : input.status === "reported" ? "تم التوثيق" : "جديد"}`,
          severity: "info",
          relatedId: input.leakId,
          createdAt: new Date().toISOString(),
        });

        return { success: true };
      }),

    exportCsv: publicProcedure
      .input(
        z
          .object({
            source: z.string().optional(),
            severity: z.string().optional(),
            status: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input, ctx }) => {
        const data = await getLeaks(input);
        const headers = [
          "Leak ID",
          "Title",
          "Title (AR)",
          "Source",
          "Severity",
          "Sector",
          "PII Types",
          "Record Count",
          "Status",
          "Detected At",
        ];
        const rows = data.map((leak) => [
          leak.leakId,
          `"${leak.title}"`,
          `"${leak.titleAr}"`,
          leak.source,
          leak.severity,
          leak.sector,
          `"${(leak.piiTypes as string[]).join(", ")}"`,
          leak.recordCount,
          leak.status,
          leak.detectedAt?.toISOString() ?? "",
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        if (ctx.user) {
          await logAudit(getAuthUser(ctx).id, "leak.export", `Exported ${data.length} leaks as CSV`, "export", getAuthUser(ctx).name);
        }
        return { csv, filename: `ndmo-leaks-export-${Date.now()}.csv` };
      }),
  }),

  channels: router({
    list: publicProcedure
      .input(z.object({ platform: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getChannels(input?.platform);
      }),
  }),

  pii: router({
    scan: publicProcedure
      .input(z.object({ text: z.string().min(1).max(50000) }))
      .mutation(async ({ input, ctx }) => {
        const patterns = [
          // Identity Data
          { type: "National ID", typeAr: "رقم الهوية الوطنية", regex: /\b1\d{9}\b/g },
          { type: "Iqama Number", typeAr: "رقم الإقامة", regex: /\b2\d{9}\b/g },
          { type: "Passport", typeAr: "رقم جواز السفر", regex: /\b[A-Z]\d{8}\b/g },
          { type: "Driving License", typeAr: "رقم رخصة القيادة", regex: /\bDL[-]?\d{10}\b/gi },
          // Contact Data
          { type: "Saudi Phone", typeAr: "رقم جوال سعودي", regex: /\b05\d{8}\b/g },
          { type: "Saudi Email", typeAr: "بريد إلكتروني سعودي", regex: /\b[\w.-]+@[\w.-]+\.sa\b/gi },
          { type: "National Address", typeAr: "العنوان الوطني", regex: /\b[A-Z]{4}\d{4}\b/g },
          // Financial Data
          { type: "IBAN", typeAr: "رقم الحساب البنكي", regex: /\bSA\d{22}\b/g },
          { type: "Credit Card", typeAr: "بطاقة ائتمان", regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g },
          { type: "Tax Number", typeAr: "الرقم الضريبي", regex: /\b3\d{14}\b/g },
          { type: "Salary", typeAr: "الراتب", regex: /(?:راتب|salary|أجر)[:\s]*[\d,]+(?:\s*(?:ريال|SAR|SR))?/gi },
          // Sensitive Data
          { type: "Date of Birth", typeAr: "تاريخ الميلاد", regex: /\b(?:19|20)\d{2}[\/\-]\d{2}[\/\-]\d{2}\b/g },
          { type: "Medical Record", typeAr: "السجل الطبي", regex: /\bMRN[-]?\d{4}[-]?\d{5}\b/gi },
          { type: "IP Address", typeAr: "عنوان IP", regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g },
          // InfoStealer Detection
          { type: "Credentials", typeAr: "بيانات تسجيل الدخول", regex: /(?:password|passwd|pass|كلمة.?(?:المرور|السر))[:\s]+\S+/gi },
          { type: "InfoStealer URL", typeAr: "رابط InfoStealer", regex: /(?:URL|Host)[:\s]+https?:\/\/[^\s]+(?:login|auth|bank|pay)/gi },
          // Smart Detection
          { type: "SQL Pattern", typeAr: "نمط SQL", regex: /\b(?:SELECT|INSERT|UPDATE|DELETE|DROP)\b.*(?:national_id|phone|email|iqama|salary|password)/gi },
          { type: "Masked Data", typeAr: "بيانات مقنّعة", regex: /\b(?:05|10|20)\d*X{3,}\d*\b/g },
          { type: "Base64 Encoded", typeAr: "بيانات مشفرة Base64", regex: /\b[A-Za-z0-9+/]{20,}={1,2}\b/g },
        ];

        const lines = input.text.split("\n");
        const results: Array<{ type: string; typeAr: string; value: string; line: number }> = [];

        lines.forEach((line, lineIdx) => {
          for (const pattern of patterns) {
            const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
            let match;
            while ((match = regex.exec(line)) !== null) {
              results.push({
                type: pattern.type,
                typeAr: pattern.typeAr,
                value: match[0],
                line: lineIdx + 1,
              });
            }
          }
        });

        // Save scan if user is authenticated
        if (ctx.user) {
          await savePiiScan({
            userId: getAuthUser(ctx).id,
            inputText: input.text.substring(0, 5000),
            results,
            totalMatches: results.length,
          });
          await logAudit(getAuthUser(ctx).id, "pii.scan", `PII scan: ${results.length} matches found`, "pii", getAuthUser(ctx).name);

          // Send notification if matches found
          if (results.length > 0) {
            const notifId = await createNotification({
              userId: getAuthUser(ctx).id,
              type: "scan_complete",
              title: `PII Scan Complete: ${results.length} matches`,
              titleAr: `اكتمل فحص PII: ${results.length} تطابق`,
              message: `Found ${results.length} PII items across ${new Set(results.map(r => r.type)).size} categories`,
              messageAr: `تم العثور على ${results.length} عنصر PII في ${new Set(results.map(r => r.type)).size} فئات`,
              severity: results.length > 10 ? "high" : results.length > 5 ? "medium" : "low",
            });

            broadcastNotification({
              id: notifId,
              type: "scan_complete",
              title: `PII Scan Complete: ${results.length} matches`,
              titleAr: `اكتمل فحص PII: ${results.length} تطابق`,
              severity: results.length > 10 ? "high" : results.length > 5 ? "medium" : "low",
              createdAt: new Date().toISOString(),
            });
          }
        }

        // LLM-based intelligent analysis
        let aiAnalysis = null;
        if (results.length > 0) {
          try {
            const uniqueTypes = Array.from(new Set(results.map(r => r.type)));
            const llmResponse = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: `أنت محلل حماية بيانات شخصية متخصص في نظام حماية البيانات الشخصية السعودي (PDPL). حلل نتائج فحص PII التالية وقدم تقييماً شاملاً. أجب بصيغة JSON فقط:\n{\n  "riskLevel\": \"critical|high|medium|low\",\n  \"riskScore\": 0-100,\n  \"pdplViolations\": [\"...\"],\n  \"recommendations\": [\"...\"],\n  \"dataClassification\": {\"sensitive\": [...], \"personal\": [...], \"public\": [...]},\n  \"summary\": \"...\"\n}`
                },
                {
                  role: "user",
                  content: `تم العثور على ${results.length} تطابق في ${uniqueTypes.length} فئة:\n${uniqueTypes.map(t => `- ${t}: ${results.filter(r => r.type === t).length} تطابق`).join("\n")}\n\nعينة من البيانات المكتشفة (أول 5):\n${results.slice(0, 5).map(r => `${r.typeAr}: ${r.value.substring(0, 20)}...`).join("\n")}`
                },
              ],
            });
            try {
              const content = String(llmResponse.choices?.[0]?.message?.content || "");
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) aiAnalysis = JSON.parse(jsonMatch[0]);
            } catch { /* ignore parse errors */ }
          } catch { /* ignore LLM errors */ }
        }

        return { results, totalMatches: results.length, aiAnalysis };
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      return getPiiScans(getAuthUser(ctx).id);
    }),
  }),

  darkweb: router({
    listings: publicProcedure.query(async () => {
      return getDarkWebListings();
    }),
  }),

  pastes: router({
    list: publicProcedure.query(async () => {
      return getPasteEntries();
    }),
  }),

  users: router({
    list: adminProcedure.query(async () => {
      return getAllUsers();
    }),

    updateRole: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          ndmoRole: z.enum(["executive", "manager", "analyst", "viewer"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await updateUserRole(input.userId, input.ndmoRole);
        await logAudit(getAuthUser(ctx).id, "user.updateRole", `Updated user ${input.userId} to ${input.ndmoRole}`, "user", getAuthUser(ctx).name);
        return { success: true };
      }),
  }),

  audit: router({
    list: adminProcedure
      .input(
        z
          .object({
            category: z.string().optional(),
            limit: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return getAuditLogs(input);
      }),

    exportCsv: adminProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const csv = await exportAuditLogsCsv(input);
        await logAudit(getAuthUser(ctx).id, "audit.export", "Exported audit logs as CSV", "export", getAuthUser(ctx).name);
        return { csv, filename: `ndmo-audit-log-${Date.now()}.csv` };
      }),
  }),

  enrichment: router({
    enrichLeak: protectedProcedure
      .input(z.object({ leakId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const leak = await getLeakById(input.leakId);
        if (!leak) throw new Error("Leak not found");
        const result = await enrichLeak({
          ...leak,
          piiTypes: (leak.piiTypes as string[]) || [],
        });
        await logAudit(getAuthUser(ctx).id, "enrichment.run", `AI enriched leak ${input.leakId} (confidence: ${result.aiConfidence}%)`, "system", getAuthUser(ctx).name);
        return result;
      }),

    enrichAll: adminProcedure.mutation(async ({ ctx }) => {
      const count = await enrichAllPending();
      await logAudit(getAuthUser(ctx).id, "enrichment.batch", `Batch enriched ${count} leaks`, "system", getAuthUser(ctx).name);
      return { enriched: count };
    }),
  }),

  retention: router({
    list: publicProcedure.query(async () => getRetentionPolicies()),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        retentionDays: z.number().optional(),
        archiveAction: z.enum(["delete", "archive"]).optional(),
        isEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await updateRetentionPolicy(id, data);
        await logAudit(getAuthUser(ctx).id, "retention.update", `Updated retention policy #${id}`, "system", getAuthUser(ctx).name);
        return { success: true };
      }),
    execute: adminProcedure.mutation(async ({ ctx }) => {
      const results = await executeRetentionPolicies();
      await logAudit(getAuthUser(ctx).id, "retention.execute", `Executed retention policies: ${results.length} processed`, "system", getAuthUser(ctx).name);
      return results;
    }),
    preview: adminProcedure.query(async () => previewRetention()),
  }),

  threatMap: router({
    data: publicProcedure.query(async () => {
      return getThreatMapData();
    }),
  }),

  jobs: router({
    list: publicProcedure.query(async () => {
      return getMonitoringJobs();
    }),

    getById: publicProcedure
      .input(z.object({ jobId: z.string() }))
      .query(async ({ input }) => {
        return getMonitoringJobById(input.jobId);
      }),

    trigger: protectedProcedure
      .input(z.object({ jobId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await logAudit(getAuthUser(ctx).id, "monitoring.trigger", `Manually triggered job ${input.jobId}`, "monitoring", getAuthUser(ctx).name);
        // Run asynchronously so we don't block the response
        triggerJob(input.jobId).catch((err) => {
          console.error(`[Jobs] Failed to trigger ${input.jobId}:`, err);
        });
        return { success: true, message: "Job triggered" };
      }),

    toggleStatus: protectedProcedure
      .input(
        z.object({
          jobId: z.string(),
          status: z.enum(["active", "paused"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await toggleJobStatus(input.jobId, input.status);
        await logAudit(
          getAuthUser(ctx).id,
          `monitoring.${input.status === "active" ? "resume" : "pause"}`,
          `${input.status === "active" ? "Resumed" : "Paused"} job ${input.jobId}`,
          "monitoring",
          getAuthUser(ctx).name,
        );
        return { success: true };
      }),
  }),

  threatRules: router({
    list: publicProcedure.query(async () => {
      return getThreatRules();
    }),

    getById: publicProcedure
      .input(z.object({ ruleId: z.string() }))
      .query(async ({ input }) => {
        return getThreatRuleById(input.ruleId);
      }),

    create: protectedProcedure
      .input(z.object({
        ruleId: z.string(),
        name: z.string(),
        nameAr: z.string(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
        category: z.enum(["data_leak", "credentials", "sale_ad", "db_dump", "financial", "health", "government", "telecom", "education", "infrastructure"]),
        severity: z.enum(["critical", "high", "medium", "low"]),
        patterns: z.array(z.string()),
        keywords: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createThreatRule(input);
        await logAudit(getAuthUser(ctx).id, "threatRule.create", `Created threat rule ${input.ruleId}`, "system", getAuthUser(ctx).name);
        return { id };
      }),

    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isEnabled: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        await toggleThreatRule(input.id, input.isEnabled);
        await logAudit(getAuthUser(ctx).id, "threatRule.toggle", `${input.isEnabled ? "Enabled" : "Disabled"} threat rule #${input.id}`, "system", getAuthUser(ctx).name);
        return { success: true };
      }),
  }),

  evidence: router({
    list: publicProcedure
      .input(z.object({ leakId: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getEvidenceChain(input?.leakId);
      }),

    stats: publicProcedure.query(async () => {
      return getEvidenceStats();
    }),

    create: protectedProcedure
      .input(z.object({
        evidenceId: z.string(),
        leakId: z.string(),
        evidenceType: z.enum(["text", "screenshot", "file", "metadata"]),
        contentHash: z.string(),
        previousHash: z.string().optional(),
        blockIndex: z.number(),
        capturedBy: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createEvidenceEntry(input);
        await logAudit(getAuthUser(ctx).id, "evidence.create", `Added evidence ${input.evidenceId} for leak ${input.leakId}`, "leak", getAuthUser(ctx).name);
        return { id };
      }),
  }),

  sellers: router({
    list: publicProcedure
      .input(z.object({ riskLevel: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getSellerProfiles(input);
      }),

    getById: publicProcedure
      .input(z.object({ sellerId: z.string() }))
      .query(async ({ input }) => {
        return getSellerById(input.sellerId);
      }),

    create: protectedProcedure
      .input(z.object({
        sellerId: z.string(),
        name: z.string(),
        aliases: z.array(z.string()).optional(),
        platforms: z.array(z.string()),
        totalLeaks: z.number().optional(),
        totalRecords: z.number().optional(),
        riskScore: z.number().optional(),
        riskLevel: z.enum(["critical", "high", "medium", "low"]).optional(),
        sectors: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createSellerProfile(input);
        await logAudit(getAuthUser(ctx).id, "seller.create", `Created seller profile ${input.sellerId}`, "system", getAuthUser(ctx).name);
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          aliases: z.array(z.string()).optional(),
          riskScore: z.number().optional(),
          riskLevel: z.enum(["critical", "high", "medium", "low"]).optional(),
          notes: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateSellerProfile(input.id, input.data);
        await logAudit(getAuthUser(ctx).id, "seller.update", `Updated seller profile #${input.id}`, "system", getAuthUser(ctx).name);
        return { success: true };
      }),
  }),

  osint: router({
    list: publicProcedure
      .input(z.object({ queryType: z.string().optional(), category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getOsintQueries(input);
      }),

    create: protectedProcedure
      .input(z.object({
        queryId: z.string(),
        name: z.string(),
        nameAr: z.string(),
        queryType: z.enum(["google_dork", "shodan", "recon", "spiderfoot"]),
        category: z.string(),
        categoryAr: z.string().optional(),
        query: z.string(),
        description: z.string().optional(),
        descriptionAr: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createOsintQuery(input);
        await logAudit(getAuthUser(ctx).id, "osint.create", `Created OSINT query ${input.queryId}`, "system", getAuthUser(ctx).name);
        return { id };
      }),
  }),

  feedback: router({
    list: publicProcedure.query(async () => {
      return getFeedbackEntries();
    }),

    stats: publicProcedure.query(async () => {
      return getFeedbackStats();
    }),

    create: protectedProcedure
      .input(z.object({
        leakId: z.string(),
        systemClassification: z.enum(["personal_data", "cybersecurity", "clean", "unknown"]),
        analystClassification: z.enum(["personal_data", "cybersecurity", "clean", "unknown"]),
        isCorrect: z.boolean(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createFeedbackEntry({
          ...input,
          userId: getAuthUser(ctx).id,
          userName: getAuthUser(ctx).name,
        });
        await logAudit(getAuthUser(ctx).id, "feedback.create", `Submitted feedback for leak ${input.leakId}`, "system", getAuthUser(ctx).name);
        return { id };
      }),
  }),

  knowledgeGraph: router({
    data: publicProcedure.query(async () => {
      return getKnowledgeGraphData();
    }),
  }),

  smartRasid: router({
    search: publicProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input }) => {
        const q = input.query.toLowerCase();
        const results: Array<{ type: string; items: any[] }> = [];
        const allLeaks = await getLeaks({ search: input.query });
        if (allLeaks.length > 0) results.push({ type: "leaks", items: allLeaks.slice(0, 10) });
        const sellers = await getSellerProfiles();
        const matchedSellers = sellers.filter((s: any) =>
          s.alias?.toLowerCase().includes(q) || s.aliasAr?.toLowerCase().includes(q) || s.sellerId?.toLowerCase().includes(q)
        );
        if (matchedSellers.length > 0) results.push({ type: "sellers", items: matchedSellers.slice(0, 5) });
        const darkweb = await getDarkWebListings();
        const matchedDW = darkweb.filter((d: any) => d.title?.toLowerCase().includes(q) || d.titleAr?.toLowerCase().includes(q));
        if (matchedDW.length > 0) results.push({ type: "darkweb", items: matchedDW.slice(0, 5) });
        const pastes = await getPasteEntries();
        const matchedPastes = pastes.filter((p: any) => p.title?.toLowerCase().includes(q) || p.titleAr?.toLowerCase().includes(q));
        if (matchedPastes.length > 0) results.push({ type: "pastes", items: matchedPastes.slice(0, 5) });
        const jobs = await getMonitoringJobs();
        const matchedJobs = jobs.filter((j: any) => j.name?.toLowerCase().includes(q) || j.nameAr?.toLowerCase().includes(q));
        if (matchedJobs.length > 0) results.push({ type: "jobs", items: matchedJobs.slice(0, 5) });
        return { results, totalResults: results.reduce((s, r) => s + r.items.length, 0) };
      }),

    suggestions: publicProcedure
      .input(z.object({ partial: z.string() }))
      .query(async ({ input }) => {
        if (input.partial.length < 2) return { suggestions: [] };
        const q = input.partial.toLowerCase();
        const suggestions: string[] = [];
        const allLeaks = await getLeaks();
        for (const leak of allLeaks) {
          if (leak.titleAr?.toLowerCase().includes(q)) suggestions.push(leak.titleAr);
          if (leak.title?.toLowerCase().includes(q)) suggestions.push(leak.title);
          if (leak.sectorAr?.toLowerCase().includes(q)) suggestions.push(leak.sectorAr);
          if (suggestions.length >= 8) break;
        }
        const commonTerms = [
          "حالات رصد واسعة النطاق", "القطاع الحكومي", "القطاع الصحي", "القطاع المالي",
          "تليجرام", "دارك ويب", "مواقع لصق", "بيانات شخصية",
          "هوية وطنية", "أرقام هواتف", "بريد إلكتروني", "سجلات طبية",
          "ملخص لوحة المعلومات", "تقرير أسبوعي", "حالة الحماية",
          "تحليل شامل", "البائعون", "الأدلة الرقمية", "خريطة التهديدات",
        ];
        for (const term of commonTerms) {
          if (term.includes(q) && !suggestions.includes(term)) suggestions.push(term);
        }
        return { suggestions: Array.from(new Set(suggestions)).slice(0, 8) };
      }),

    chat: protectedProcedure
      .input(z.object({
        message: z.string().min(1),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const who = getAuthUser(ctx);
        const result = await rasidAIChat(
          input.message,
          input.history ?? [],
          who.name,
          who.id,
        );
        return {
          response: result.response,
          toolsUsed: result.toolsUsed,
          thinkingSteps: result.thinkingSteps,
          followUpSuggestions: result.followUpSuggestions,
          processingMeta: result.processingMeta,
        };
      }),

    dashboardSummary: publicProcedure.query(async () => {
      const stats = await getDashboardStats();
      const recentLeaks = await getLeaks();
      const criticalLeaks = recentLeaks.filter((l: any) => l.severity === "critical");
      const highLeaks = recentLeaks.filter((l: any) => l.severity === "high");
      return {
        stats,
        criticalCount: criticalLeaks.length,
        highCount: highLeaks.length,
        recentLeaks: recentLeaks.slice(0, 5),
        totalLeaks: recentLeaks.length,
      };
    }),
  }),

  aiRatings: router({
    rate: protectedProcedure
      .input(z.object({
        messageId: z.string(),
        rating: z.number().min(1).max(5),
        userMessage: z.string().optional(),
        aiResponse: z.string().optional(),
        toolsUsed: z.array(z.string()).optional(),
        feedback: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        const id = await createAiRating({
          messageId: input.messageId,
          userId: who.id,
          userName: who.name,
          rating: input.rating,
          userMessage: input.userMessage,
          aiResponse: input.aiResponse,
          toolsUsed: input.toolsUsed,
          feedback: input.feedback,
        });
        return { id };
      }),
    list: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
        minRating: z.number().optional(),
        maxRating: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getAiRatings(input);
      }),
    stats: protectedProcedure.query(async () => {
      return getAiRatingStats();
    }),
  }),

  knowledgeBaseAdmin: router({
    list: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        isPublished: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getKnowledgeBaseEntries(input);
      }),
    getById: protectedProcedure
      .input(z.object({ entryId: z.string() }))
      .query(async ({ input }) => {
        return getKnowledgeBaseEntryById(input.entryId);
      }),
    create: protectedProcedure
      .input(z.object({
        category: z.enum(["article", "faq", "glossary", "instruction", "policy", "regulation"]),
        title: z.string().min(1),
        titleAr: z.string().min(1),
        content: z.string().min(1),
        contentAr: z.string().min(1),
        tags: z.array(z.string()).optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        const entryId = `KB-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const id = await createKnowledgeBaseEntry({
          entryId,
          category: input.category,
          title: input.title,
          titleAr: input.titleAr,
          content: input.content,
          contentAr: input.contentAr,
          tags: input.tags || [],
          isPublished: input.isPublished ?? true,
          createdBy: who.id,
          createdByName: who.name,
        });
        await logAudit(who.id, "knowledgeBase.create", `Created knowledge base entry: ${input.titleAr}`, "system", who.name);
        return { id, entryId };
      }),
    update: protectedProcedure
      .input(z.object({
        entryId: z.string(),
        category: z.enum(["article", "faq", "glossary", "instruction", "policy", "regulation"]).optional(),
        title: z.string().optional(),
        titleAr: z.string().optional(),
        content: z.string().optional(),
        contentAr: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        const { entryId, ...data } = input;
        await updateKnowledgeBaseEntry(entryId, { ...data, updatedBy: who.id } as any);
        await logAudit(who.id, "knowledgeBase.update", `Updated knowledge base entry: ${entryId}`, "system", who.name);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ entryId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        await deleteKnowledgeBaseEntry(input.entryId);
        await logAudit(who.id, "knowledgeBase.delete", `Deleted knowledge base entry: ${input.entryId}`, "system", who.name);
        return { success: true };
      }),
    stats: protectedProcedure.query(async () => {
      return getKnowledgeBaseStats();
    }),
    incrementView: publicProcedure
      .input(z.object({ entryId: z.string() }))
      .mutation(async ({ input }) => {
        await incrementKnowledgeBaseViewCount(input.entryId);
        return { success: true };
      }),
  }),

  liveScan: router({
    execute: protectedProcedure
      .input(z.object({
        targets: z.array(z.object({
          type: z.enum(["email", "domain", "keyword", "phone", "national_id"]),
          value: z.string().min(1),
        })),
        sources: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        const sources = input.sources ?? ["xposedornot", "crtsh", "psbdmp", "googledork", "breachdirectory", "github", "dehashed", "intelx"];
        const session = await executeScan(input.targets, sources);
        await logAudit(
          who.id,
          "liveScan.execute",
          `Executed scan on ${input.targets.map(t => `${t.type}:${t.value}`).join(", ")} — ${session.totalFindings} findings`,
          "monitoring",
          who.name
        );
        return session;
      }),
    quick: protectedProcedure
      .input(z.object({
        value: z.string().min(1),
        type: z.enum(["email", "domain", "keyword", "phone", "national_id"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        const session = await quickScan(input.value, input.type ?? "email");
        await logAudit(
          who.id,
          "liveScan.quick",
          `Quick scan: ${input.value} — ${session.totalFindings} findings`,
          "monitoring",
          who.name
        );
        return session;
      }),
    saveAsLeak: protectedProcedure
      .input(z.object({
        scanResult: z.object({
          id: z.string(),
          source: z.string(),
          type: z.string(),
          severity: z.string(),
          title: z.string(),
          description: z.string(),
          details: z.any().optional(),
          url: z.string().optional(),
          affectedRecords: z.number().optional(),
          dataTypes: z.array(z.string()).optional(),
        }),
        targetValue: z.string(),
        targetType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        const { scanResult, targetValue, targetType } = input;

        // Map scan source to leak source
        const sourceMap: Record<string, "telegram" | "darkweb" | "paste"> = {
          xposedornot: "darkweb",
          breachdirectory: "darkweb",
          crtsh: "paste",
          psbdmp: "paste",
          googledork: "paste",
        };
        const leakSource = sourceMap[scanResult.source.toLowerCase()] || "darkweb";

        // Map severity
        const sevMap: Record<string, "critical" | "high" | "medium" | "low"> = {
          critical: "critical",
          high: "high",
          medium: "medium",
          low: "low",
          info: "low",
        };
        const leakSeverity = sevMap[scanResult.severity] || "medium";

        // Generate unique leakId
        const leakId = `SCAN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        await createLeak({
          leakId,
          title: scanResult.title,
          titleAr: scanResult.title,
          source: leakSource,
          severity: leakSeverity,
          sector: "عام",
          sectorAr: "عام",
          piiTypes: scanResult.dataTypes || ["بيانات شخصية"],
          recordCount: scanResult.affectedRecords || 0,
          status: "new",
          description: `${scanResult.description}\n\nTarget: ${targetType}:${targetValue}\nSource: ${scanResult.source}`,
          descriptionAr: scanResult.description,
          sourceUrl: scanResult.url || null,
          sourcePlatform: scanResult.source,
          breachMethod: scanResult.type,
          breachMethodAr: scanResult.type === "breach" ? "اختراق" : scanResult.type === "paste" ? "حالة رصد لصق" : scanResult.type === "certificate" ? "شهادة مكتشفة" : scanResult.type === "exposure" ? "تعرض" : "دارك ويب",
        });

        await logAudit(
          who.id,
          "liveScan.saveAsLeak",
          `Saved scan result as leak incident: ${leakId} — ${scanResult.title}`,
          "leak",
          who.name
        );

        return { leakId, success: true };
      }),

    saveAllAsLeaks: protectedProcedure
      .input(z.object({
        scanResults: z.array(z.object({
          id: z.string(),
          source: z.string(),
          type: z.string(),
          severity: z.string(),
          title: z.string(),
          description: z.string(),
          details: z.any().optional(),
          url: z.string().optional(),
          affectedRecords: z.number().optional(),
          dataTypes: z.array(z.string()).optional(),
        })),
        targetValue: z.string(),
        targetType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        const saved: string[] = [];

        const sourceMap: Record<string, "telegram" | "darkweb" | "paste"> = {
          xposedornot: "darkweb",
          breachdirectory: "darkweb",
          crtsh: "paste",
          psbdmp: "paste",
          googledork: "paste",
        };
        const sevMap: Record<string, "critical" | "high" | "medium" | "low"> = {
          critical: "critical",
          high: "high",
          medium: "medium",
          low: "low",
          info: "low",
        };

        for (const sr of input.scanResults) {
          const leakId = `SCAN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          try {
            await createLeak({
              leakId,
              title: sr.title,
              titleAr: sr.title,
              source: sourceMap[sr.source.toLowerCase()] || "darkweb",
              severity: sevMap[sr.severity] || "medium",
              sector: "عام",
              sectorAr: "عام",
              piiTypes: sr.dataTypes || ["بيانات شخصية"],
              recordCount: sr.affectedRecords || 0,
              status: "new",
              description: `${sr.description}\n\nTarget: ${input.targetType}:${input.targetValue}\nSource: ${sr.source}`,
              descriptionAr: sr.description,
              sourceUrl: sr.url || null,
              sourcePlatform: sr.source,
              breachMethod: sr.type,
              breachMethodAr: sr.type === "breach" ? "اختراق" : sr.type === "paste" ? "حالة رصد لصق" : sr.type === "certificate" ? "شهادة مكتشفة" : sr.type === "exposure" ? "تعرض" : "دارك ويب",
            });
            saved.push(leakId);
          } catch (e) {
            // skip duplicates
          }
        }

        await logAudit(
          who.id,
          "liveScan.saveAllAsLeaks",
          `Bulk saved ${saved.length} scan results as leak incidents`,
          "leak",
          who.name
        );

        return { savedCount: saved.length, leakIds: saved };
      }),
  }),

  personality: router({
    getGreeting: protectedProcedure.query(async ({ ctx }) => {
      const who = getAuthUser(ctx);
      return getGreetingForUser(String(who.id), who.name);
    }),

    checkLeader: protectedProcedure
      .input(z.object({ message: z.string() }))
      .query(async ({ input }) => {
        const result = await checkLeaderMention(input.message);
        return { found: !!result, respectPhrase: result };
      }),

    scenarios: router({
      list: protectedProcedure.query(async () => {
        return getAllPersonalityScenarios();
      }),

      create: adminProcedure
        .input(z.object({
          scenarioType: z.enum(["greeting_first", "greeting_return", "leader_respect", "custom"]),
          triggerKeyword: z.string().optional(),
          responseTemplate: z.string().min(1),
          isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const who = getAuthUser(ctx);
          const id = await createPersonalityScenario({
            scenarioType: input.scenarioType,
            triggerKeyword: input.triggerKeyword ?? null,
            responseTemplate: input.responseTemplate,
            isActive: input.isActive !== false,
          });
          await logAudit(who.id, "personality.create", `Created scenario: ${input.scenarioType}`, "system", who.name);
          return { id };
        }),

      update: adminProcedure
        .input(z.object({
          id: z.number(),
          scenarioType: z.enum(["greeting_first", "greeting_return", "leader_respect", "custom"]).optional(),
          triggerKeyword: z.string().optional(),
          responseTemplate: z.string().optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const who = getAuthUser(ctx);
          const { id, ...data } = input;
          await updatePersonalityScenario(id, data);
          await logAudit(who.id, "personality.update", `Updated scenario #${id}`, "system", who.name);
          return { success: true };
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const who = getAuthUser(ctx);
          await deletePersonalityScenario(input.id);
          await logAudit(who.id, "personality.delete", `Deleted scenario #${input.id}`, "system", who.name);
          return { success: true };
        }),
    }),
  }),

  chatHistory: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const who = getAuthUser(ctx);
      return getUserConversations(String(who.id));
    }),

    get: protectedProcedure
      .input(z.object({ conversationId: z.string() }))
      .query(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        const conv = await getConversationById(input.conversationId);
        if (!conv || conv.userId !== String(who.id)) return null;
        const messages = await getConversationMessages(input.conversationId);
        return { conversation: conv, messages };
      }),

    save: protectedProcedure
      .input(z.object({
        conversationId: z.string(),
        title: z.string(),
        messages: z.array(z.object({
          messageId: z.string(),
          role: z.enum(["user", "assistant"]),
          content: z.string(),
          toolsUsed: z.any().optional(),
          thinkingSteps: z.any().optional(),
          rating: z.number().optional(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        const existing = await getConversationById(input.conversationId);

        if (!existing) {
          await createConversation({
            conversationId: input.conversationId,
            userId: String(who.id),
            userName: who.name,
            title: input.title,
            messageCount: input.messages.length,
            totalToolsUsed: input.messages.reduce((sum, m) => sum + (Array.isArray(m.toolsUsed) ? m.toolsUsed.length : 0), 0),
          });
        } else {
          await updateConversation(input.conversationId, {
            title: input.title,
            messageCount: input.messages.length,
          });
        }

        // Save each message
        for (const msg of input.messages) {
          await addChatMessage({
            conversationId: input.conversationId,
            messageId: msg.messageId,
            role: msg.role,
            content: msg.content,
            toolsUsed: msg.toolsUsed || null,
            thinkingSteps: msg.thinkingSteps || null,
            rating: msg.rating || null,
          });
        }

        await logAudit(who.id, "chatHistory.save", `Saved conversation: ${input.title}`, "system", who.name);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ conversationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        const conv = await getConversationById(input.conversationId);
        if (!conv || conv.userId !== String(who.id)) {
          throw new Error("Conversation not found or access denied");
        }
        await deleteConversation(input.conversationId);
        await logAudit(who.id, "chatHistory.delete", `Deleted conversation: ${conv.title}`, "system", who.name);
        return { success: true };
      }),

    updateTitle: protectedProcedure
      .input(z.object({ conversationId: z.string(), title: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const who = getAuthUser(ctx);
        await updateConversation(input.conversationId, { title: input.title });
        return { success: true };
      }),
  }),

  // ===== Privacy Sites Router =====
  privacy: router({
    sites: protectedProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      search: z.string().optional(),
      status: z.string().optional(),
      complianceStatus: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getSites(input || {});
    }),
    siteById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getSiteById(input.id);
    }),
    siteScans: protectedProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      return await db.getSiteScans(input.siteId);
    }),
    siteRequirements: protectedProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      const scans = await db.getSiteScans(input.siteId);
      return scans.length > 0 ? (scans[0] as any).requirements || [] : [];
    }),
    stats: protectedProcedure.query(async () => {
      const sites = await db.getSites({ limit: 100000 });
      const siteList = Array.isArray((sites as any).sites) ? (sites as any).sites : Array.isArray(sites) ? sites : [];
      return {
        totalSites: siteList.length,
        totalScans: siteList.length,
        compliant: siteList.filter((s: any) => s.complianceStatus === 'compliant').length,
        nonCompliant: siteList.filter((s: any) => s.complianceStatus === 'non_compliant').length,
        partiallyCompliant: siteList.filter((s: any) => s.complianceStatus === 'partially_compliant' || s.complianceStatus === 'partial').length,
        notWorking: siteList.filter((s: any) => s.complianceStatus === 'not_working' || s.siteStatus === 'not_working' || s.siteStatus === 'inactive').length,
        noPolicy: siteList.filter((s: any) => !s.privacyPageUrl && s.complianceStatus !== 'compliant').length,
      };
    }),
    policyVersions: protectedProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
      return await db.getSiteComplianceHistory(input.siteId);
    }),
  }),

  // ===== Incidents Router =====
  incidents: router({
    list: protectedProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      search: z.string().optional(),
      status: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getAllIncidentDocuments();
    }),
    byId: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      return await db.getIncidentDocumentByDocumentId(input.id);
    }),
    stats: protectedProcedure.query(async () => {
      const docs = await db.getAllIncidentDocuments();
      return {
        total: docs.length,
        open: docs.filter((d: any) => d.status === 'open').length,
        resolved: docs.filter((d: any) => d.status === 'resolved').length,
        inProgress: docs.filter((d: any) => d.status === 'in_progress').length,
      };
    }),
    datasets: protectedProcedure.query(async () => {
      const docs = await db.getAllIncidentDocuments();
      return { incidents: docs };
    }),
  }),

  // ===== Followups Router =====
  followups: router({
    list: protectedProcedure.input(z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
    }).optional()).query(async () => {
      // Followups are derived from cases/letters
      return [];
    }),
  }),

  // ===== Overview Router =====
   overview: router({
    stats: protectedProcedure.query(async () => {
      const sites = await db.getSites({});
      const siteList = (sites as any).sites || sites || [];
      return {
        totalSites: Array.isArray(siteList) ? siteList.length : 0,
        totalScans: 0,
        complianceRate: 0,
        activeCases: 0,
      };
    }),
  }),

  // ===== Custom Pages =====
  customPages: router({
    list: protectedProcedure.input(z.object({
      workspace: z.string().optional(),
    }).optional()).query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return db.getCustomPages(ctx.user.id, input?.workspace);
    }),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getCustomPageById(input.id);
    }),
    create: protectedProcedure.input(z.object({
      workspace: z.string(),
      pageType: z.enum(['dashboard', 'table', 'report']),
      title: z.string().min(1),
      icon: z.string().optional(),
      sortOrder: z.number().optional(),
      config: z.any().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return db.createCustomPage({
        userId: ctx.user.id,
        workspace: input.workspace,
        pageType: input.pageType,
        title: input.title,
        icon: input.icon || 'LayoutDashboard',
        sortOrder: input.sortOrder || 0,
        config: input.config || {},
      });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      icon: z.string().optional(),
      sortOrder: z.number().optional(),
      config: z.any().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateCustomPage(id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteCustomPage(input.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;

// ===== Helper: Crawl for privacy page =====
async function crawlForPrivacy(url: string) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RasidBot/1.0)' },
      signal: AbortSignal.timeout(15000),
    });

    // Check for HTTP error status codes
    if (!response.ok) {
      console.warn(`[Crawl] HTTP ${response.status} for ${url}`);
      return { siteName: '', privacyUrl: '', privacyText: '', contactUrl: '', emails: [], classification: '', isErrorPage: true };
    }

    const html = await response.text();

    // Detect error pages by content patterns
    const errorPagePatterns = [
      /this\s*site\s*can'?t\s*be\s*reached/i,
      /err_connection_refused/i,
      /err_name_not_resolved/i,
      /err_connection_timed_out/i,
      /err_connection_reset/i,
      /dns_probe_finished/i,
      /page\s*not\s*found/i,
      /404\s*not\s*found/i,
      /500\s*internal\s*server\s*error/i,
      /502\s*bad\s*gateway/i,
      /503\s*service\s*unavailable/i,
      /403\s*forbidden/i,
      /server\s*error/i,
      /الصفحة\s*غير\s*موجودة/i,
      /خطأ\s*في\s*الخادم/i,
      /الموقع\s*غير\s*متاح/i,
      /unexpectedly\s*closed\s*the\s*connection/i,
      /took\s*too\s*long\s*to\s*respond/i,
      /refused\s*to\s*connect/i,
      /check.*your.*internet/i,
    ];

    const htmlLower = html.toLowerCase();
    const isErrorPage = errorPagePatterns.some(p => p.test(html)) ||
      (html.length < 2000 && (htmlLower.includes('error') || htmlLower.includes('not found') || htmlLower.includes('cannot')));

    if (isErrorPage) {
      console.warn(`[Crawl] Error page detected for ${url}`);
      return { siteName: '', privacyUrl: '', privacyText: '', contactUrl: '', emails: [], classification: '', isErrorPage: true };
    }

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const siteName = titleMatch ? titleMatch[1].trim() : '';

    // Extract emails
    const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const emails = Array.from(new Set(emailMatches)).filter(e => !e.includes('example.com') && !e.includes('wixpress'));

    // Find privacy link
    const privacyPatterns = [
      /href=["']([^"']*(?:privacy|خصوصية|policy|سياسة)[^"']*)["']/gi,
      /href=["']([^"']*(?:legal|قانوني|terms|شروط)[^"']*)["']/gi,
    ];

    let privacyUrl = '';
    for (const pattern of privacyPatterns) {
      const match = pattern.exec(html);
      if (match) {
        privacyUrl = match[1];
        if (!privacyUrl.startsWith('http')) {
          const base = new URL(url);
          privacyUrl = new URL(privacyUrl, base.origin).href;
        }
        break;
      }
    }

    // Find contact link
    const contactMatch = html.match(/href=["']([^"']*(?:contact|تواصل|اتصل)[^"']*)["']/i);
    const contactUrl = contactMatch ? contactMatch[1] : '';

    // Get privacy text
    let privacyText = '';
    if (privacyUrl) {
      try {
        const privResp = await fetch(privacyUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RasidBot/1.0)' },
          signal: AbortSignal.timeout(15000),
        });
        const privHtml = await privResp.text();
        privacyText = privHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 10000);
      } catch {}
    }

    return { siteName, privacyUrl, privacyText, contactUrl, emails, classification: '', isErrorPage: false };
  } catch (e) {
    return { siteName: '', privacyUrl: '', privacyText: '', contactUrl: '', emails: [], classification: '', isErrorPage: true };
  }
}

// ===== Helper: AI Compliance Analysis =====
async function analyzeCompliance(text: string, domain: string) {
  try {
    const truncated = text.length > 8000 ? text.slice(0, 8000) : text;
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `أنت محلل قانوني متخصص في نظام حماية البيانات الشخصية السعودي (PDPL).
حلل نص سياسة الخصوصية وقيّم مدى امتثالها للبنود الثمانية من المادة 12.
التحليل يجب أن يكون ذكياً - لا يشترط وجود النص حرفياً بل يكفي وجود المعنى.
أجب بصيغة JSON فقط:
{
  "clause_1": {"compliant": true/false, "evidence": "دليل مختصر"},
  "clause_2": {"compliant": true/false, "evidence": "..."},
  "clause_3": {"compliant": true/false, "evidence": "..."},
  "clause_4": {"compliant": true/false, "evidence": "..."},
  "clause_5": {"compliant": true/false, "evidence": "..."},
  "clause_6": {"compliant": true/false, "evidence": "..."},
  "clause_7": {"compliant": true/false, "evidence": "..."},
  "clause_8": {"compliant": true/false, "evidence": "..."},
  "overall_score": 0-100,
  "rating": "ممتاز/جيد/مقبول/ضعيف",
  "summary": "ملخص مختصر",
  "recommendations": ["توصية 1", "توصية 2"]
}`
        },
        { role: "user", content: `حلل سياسة الخصوصية للموقع ${domain}:\n\n${truncated}` }
      ],
      response_format: { type: "json_object" as any },
    });
    const content = response.choices[0].message.content;
    return JSON.parse(typeof content === 'string' ? content : '{}');
  } catch (e) {
    console.error('AI analysis error:', e);
    return null;
  }
}

// ===== LLM Batch Analysis Engine =====
let llmAnalysisRunning = false;
let llmAnalysisProgress = { total: 0, processed: 0, succeeded: 0, failed: 0 };

async function runLLMAnalysisBatch(jobId: number, batchSize: number = 10) {
  if (llmAnalysisRunning) {
    console.log('[LLM Analysis] Already running, skipping...');
    return;
  }
  llmAnalysisRunning = true;
  llmAnalysisProgress = { total: 0, processed: 0, succeeded: 0, failed: 0 };

  try {
    const totalNeeded = await db.countItemsNeedingLLMAnalysis(jobId);
    llmAnalysisProgress.total = totalNeeded;
    console.log(`[LLM Analysis] Starting analysis for ${totalNeeded} items`);

    while (true) {
      const items = await db.getItemsNeedingLLMAnalysis(jobId, batchSize);
      if (!items || items.length === 0) {
        console.log('[LLM Analysis] No more items to analyze');
        break;
      }

      for (const item of items) {
        try {
          const text = item.privacyTextContent || '';
          if (text.length < 100) {
            llmAnalysisProgress.processed++;
            continue;
          }

          const analysis = await analyzeCompliance(text, item.domain);
          if (!analysis) {
            llmAnalysisProgress.processed++;
            llmAnalysisProgress.failed++;
            continue;
          }

          const score = analysis.overall_score || 0;
          let complianceStatus: 'compliant' | 'partially_compliant' | 'non_compliant' | 'no_policy' | 'error' = 'non_compliant';
          if (score >= 60) complianceStatus = 'compliant';
          else if (score >= 40) complianceStatus = 'partially_compliant';

          await db.updateItemLLMAnalysis(item.id, {
            overallScore: score,
            complianceStatus,
            clause1Compliant: analysis.clause_1?.compliant || false,
            clause1Evidence: analysis.clause_1?.evidence || null,
            clause2Compliant: analysis.clause_2?.compliant || false,
            clause2Evidence: analysis.clause_2?.evidence || null,
            clause3Compliant: analysis.clause_3?.compliant || false,
            clause3Evidence: analysis.clause_3?.evidence || null,
            clause4Compliant: analysis.clause_4?.compliant || false,
            clause4Evidence: analysis.clause_4?.evidence || null,
            clause5Compliant: analysis.clause_5?.compliant || false,
            clause5Evidence: analysis.clause_5?.evidence || null,
            clause6Compliant: analysis.clause_6?.compliant || false,
            clause6Evidence: analysis.clause_6?.evidence || null,
            clause7Compliant: analysis.clause_7?.compliant || false,
            clause7Evidence: analysis.clause_7?.evidence || null,
            clause8Compliant: analysis.clause_8?.compliant || false,
            clause8Evidence: analysis.clause_8?.evidence || null,
            summary: analysis.summary || null,
            recommendations: analysis.recommendations || [],
            rating: analysis.rating || null,
          });

          llmAnalysisProgress.processed++;
          llmAnalysisProgress.succeeded++;
          console.log(`[LLM Analysis] ${item.domain}: score=${score}, status=${complianceStatus} (${llmAnalysisProgress.processed}/${llmAnalysisProgress.total})`);

          // Small delay between LLM calls to avoid rate limiting
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          console.error(`[LLM Analysis] Error analyzing ${item.domain}:`, e);
          llmAnalysisProgress.processed++;
          llmAnalysisProgress.failed++;
        }
      }
    }

    console.log(`[LLM Analysis] Complete. Processed: ${llmAnalysisProgress.processed}, Succeeded: ${llmAnalysisProgress.succeeded}, Failed: ${llmAnalysisProgress.failed}`);
  } catch (e) {
    console.error('[LLM Analysis] Fatal error:', e);
  } finally {
    llmAnalysisRunning = false;
  }
}

// ===== Helper: Capture Website Screenshot =====
async function captureScreenshot(url: string, domain: string): Promise<string | null> {
  try {
    // Use a free screenshot API to capture the website
    const screenshotApiUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${url}`;
    
    const response = await fetch(screenshotApiUrl, {
      signal: AbortSignal.timeout(20000),
    });
    
    if (!response.ok) {
      console.warn(`Screenshot API returned ${response.status} for ${domain}`);
      return null;
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    
    if (buffer.length < 1000) {
      console.warn(`Screenshot too small for ${domain}, likely an error`);
      return null;
    }
    
    // Upload to S3
    const filename = domain.replace(/\./g, '_') + '.png';
    const { url: s3Url } = await storagePut(`screenshots/${filename}`, buffer, 'image/png');
    
    return s3Url;
  } catch (e) {
    console.warn(`Screenshot capture failed for ${domain}:`, e);
    return null;
  }
}


// Helper: Extract app info from store URL
async function extractAppInfo(storeUrl: string, platform: string): Promise<{
  appName?: string; developer?: string; packageName?: string;
  privacyPolicyUrl?: string; iconUrl?: string; downloads?: string; category?: string;
}> {
  try {
    const resp = await fetch(storeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(15000),
    });
    const html = await resp.text();
    
    if (platform === 'android') {
      // Extract from Google Play
      const appName = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1] || '';
      const developer = html.match(/developer[^"]*"[^"]*"[^>]*>([^<]+)/i)?.[1] || '';
      const packageMatch = storeUrl.match(/id=([^&]+)/);
      const packageName = packageMatch?.[1] || '';
      const privacyMatch = html.match(/href="(https?:\/\/[^"]*privacy[^"]*)"/i);
      const privacyPolicyUrl = privacyMatch?.[1] || '';
      const iconMatch = html.match(/src="(https:\/\/play-lh\.googleusercontent\.com\/[^"]+)"/);
      const iconUrl = iconMatch?.[1] || '';
      return { appName, developer, packageName, privacyPolicyUrl, iconUrl, downloads: '', category: '' };
    } else if (platform === 'ios') {
      // Extract from App Store
      const appName = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1] || '';
      const developer = html.match(/developer[^"]*"[^"]*"[^>]*>([^<]+)/i)?.[1] || '';
      const privacyMatch = html.match(/href="(https?:\/\/[^"]*privacy[^"]*)"/i);
      const privacyPolicyUrl = privacyMatch?.[1] || '';
      return { appName, developer, packageName: '', privacyPolicyUrl, iconUrl: '', downloads: '', category: '' };
    } else {
      // Huawei AppGallery
      const appName = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1] || '';
      const privacyMatch = html.match(/href="(https?:\/\/[^"]*privacy[^"]*)"/i);
      const privacyPolicyUrl = privacyMatch?.[1] || '';
      return { appName, developer: '', packageName: '', privacyPolicyUrl, iconUrl: '', downloads: '', category: '' };
    }
  } catch {
    return {};
  }
}

// Helper: Process batch scan in background
async function processBatchScan(jobId: number, urls: Array<{ url: string; entityName?: string; sectorType?: string; classification?: string }>, userId: number) {
  let completed = 0;
  let failed = 0;
  
  for (const item of urls) {
    try {
      let domain = item.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
      
      // Check if site exists
      const existingSites = await db.getSites({ search: domain, page: 1, limit: 1 });
      let siteId: number;
      
      if (existingSites.sites.length > 0) {
        siteId = existingSites.sites[0].id;
      } else {
        const siteResult = await db.insertSite({
          domain,
          siteName: item.entityName || domain,
          sectorType: (item.sectorType as any) || 'private',
          classification: item.classification || 'other',
        } as any);
        if (!siteResult) { failed++; continue; }
        siteId = (siteResult as any).id;
      }
      
      // Use advanced deep scanner engine for comprehensive scanning
      try {
        setFastScanMode(false);
        const scanResult = await deepScanDomain(domain);
        setFastScanMode(true);
        
        // Update site with scan results
        await db.updateSite(siteId, {
          privacyUrl: scanResult.privacyUrl || undefined,
          privacyMethod: scanResult.privacyMethod || undefined,
          emails: scanResult.contactEmails || undefined,
          phones: scanResult.contactPhones || undefined,
          cms: scanResult.detectedCMS || undefined,
          siteStatus: scanResult.siteReachable ? 'active' : 'unreachable',
          siteTitle: scanResult.siteTitle || undefined,
          screenshotUrl: scanResult.screenshotUrl || undefined,
        } as any);
        
        // Insert scan record
        await db.insertScan({
          siteId,
          domain,
          overallScore: scanResult.overallScore || 0,
          complianceStatus: scanResult.complianceStatus || 'no_policy',
          summary: scanResult.summary || '',
          clause1Compliant: scanResult.clause1Compliant || false,
          clause1Evidence: scanResult.clause1Evidence || '',
          clause2Compliant: scanResult.clause2Compliant || false,
          clause2Evidence: scanResult.clause2Evidence || '',
          clause3Compliant: scanResult.clause3Compliant || false,
          clause3Evidence: scanResult.clause3Evidence || '',
          clause4Compliant: scanResult.clause4Compliant || false,
          clause4Evidence: scanResult.clause4Evidence || '',
          clause5Compliant: scanResult.clause5Compliant || false,
          clause5Evidence: scanResult.clause5Evidence || '',
          clause6Compliant: scanResult.clause6Compliant || false,
          clause6Evidence: scanResult.clause6Evidence || '',
          clause7Compliant: scanResult.clause7Compliant || false,
          clause7Evidence: scanResult.clause7Evidence || '',
          clause8Compliant: scanResult.clause8Compliant || false,
          clause8Evidence: scanResult.clause8Evidence || '',
          recommendations: scanResult.recommendations || [],
          scannedBy: userId,
          privacyDiscoveryMethod: scanResult.privacyMethod || '',
          screenshotUrl: scanResult.screenshotUrl || '',
        });
      } catch {}
      
      completed++;
    } catch {
      failed++;
    }
    
    // Update progress
    await db.updateBatchScanJob(jobId, { completedUrls: completed, failedUrls: failed });
  }
  
  await db.updateBatchScanJob(jobId, {
    completedUrls: completed,
    failedUrls: failed,
    status: 'completed',
    completedAt: new Date(),
  });
}


// ===== Cron Engine for Scheduled Scanning =====
// Config cache for superAdmin.getAllConfig
let configCache: any = null;
let configCacheTime: number | null = null;

let cronEngineRunning = false;
let lastCronCheck: Date | null = null;
let cronTask: ReturnType<typeof cron.schedule> | null = null;

function startCronEngine() {
  if (cronEngineRunning && cronTask) return;
  
  // Run every 5 minutes to check for due schedules
  cronTask = cron.schedule('*/5 * * * *', async () => {
    lastCronCheck = new Date();
    console.log(`[CronEngine] Checking schedules at ${lastCronCheck.toISOString()}`);
    
    try {
      const schedules = await db.getActiveScanSchedules();
      const now = new Date();
      
      for (const schedule of schedules) {
        const shouldRun = isScheduleDue(schedule, now);
        if (shouldRun) {
          console.log(`[CronEngine] Executing schedule: ${schedule.name} (ID: ${schedule.id})`);
          try {
            await executeSchedule(schedule.id);
          } catch (err) {
            console.error(`[CronEngine] Error executing schedule ${schedule.id}:`, err);
          }
        }
      }
    } catch (err) {
      console.error('[CronEngine] Error checking schedules:', err);
    }
  });
  
  cronEngineRunning = true;
  console.log('[CronEngine] Started');
}

function stopCronEngine() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
  cronEngineRunning = false;
  console.log('[CronEngine] Stopped');
}

function isScheduleDue(schedule: any, now: Date): boolean {
  const lastRun = schedule.lastRunAt ? new Date(schedule.lastRunAt) : null;
  const hour = schedule.hour ?? 2;
  const currentHour = now.getUTCHours();
  
  // Only run at the specified hour (within a 10-minute window)
  if (Math.abs(currentHour - hour) > 0 && !(currentHour === hour)) return false;
  
  if (!lastRun) return true; // Never run before
  
  const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);
  
  switch (schedule.frequency) {
    case 'daily':
      return hoursSinceLastRun >= 23; // At least 23 hours since last run
    case 'weekly': {
      if (hoursSinceLastRun < 167) return false; // Less than ~7 days
      const dayOfWeek = schedule.dayOfWeek ?? 0;
      return now.getUTCDay() === dayOfWeek;
    }
    case 'monthly': {
      if (hoursSinceLastRun < 672) return false; // Less than ~28 days
      const dayOfMonth = schedule.dayOfMonth ?? 1;
      return now.getUTCDate() === dayOfMonth;
    }
    default:
      return false;
  }
}

async function executeSchedule(scheduleId: number) {
  const schedules = await db.getActiveScanSchedules();
  const schedule = schedules.find((s: any) => s.id === scheduleId);
  if (!schedule) throw new Error('Schedule not found');
  
  const startTime = new Date();
  let sitesToScan: Array<{ id: number; domain: string }> = [];
  
  // Determine which sites to scan based on target type
  const targetType = schedule.targetType || schedule.target_type || 'all_sites';
  const targetFilter = schedule.targetFilter || schedule.target_filter;
  
  if (targetType === 'all_sites') {
    const result = await db.getSites({ page: 1, limit: 50000 });
    sitesToScan = result.sites.map((s: any) => ({ id: s.id, domain: s.domain }));
  } else if (targetType === 'sector') {
    const filter = typeof targetFilter === 'string' ? JSON.parse(targetFilter) : targetFilter;
    const sectorType = filter?.sectorType || 'public';
    const result = await db.getSites({ page: 1, limit: 50000 });
    sitesToScan = result.sites
      .filter((s: any) => s.sectorType === sectorType)
      .map((s: any) => ({ id: s.id, domain: s.domain }));
  } else if (targetType === 'category') {
    const filter = typeof targetFilter === 'string' ? JSON.parse(targetFilter) : targetFilter;
    const classification = filter?.classification || '';
    const result = await db.getSites({ page: 1, limit: 50000, classification });
    sitesToScan = result.sites.map((s: any) => ({ id: s.id, domain: s.domain }));
  }
  
  let completed = 0;
  let failed = 0;
  
  for (const site of sitesToScan) {
    try {
      const url = `https://${site.domain}`;
      const crawlResult = await crawlForPrivacy(url);
      
      if (crawlResult.privacyText && crawlResult.privacyText.length > 100) {
        const analysis = await analyzeCompliance(crawlResult.privacyText, site.domain);
        if (analysis) {
          // Check for compliance change
          const prevScan = await db.getLatestScanForSite(site.id);
          
          await db.insertScan({
            siteId: site.id,
            domain: site.domain,
            overallScore: analysis.overall_score,
            complianceStatus: analysis.overall_score >= 75 ? 'compliant' : analysis.overall_score >= 40 ? 'partially_compliant' : 'non_compliant',
            summary: analysis.summary || '',
            clause1Compliant: analysis.clause_1?.compliant || false,
            clause1Evidence: analysis.clause_1?.evidence || '',
            clause2Compliant: analysis.clause_2?.compliant || false,
            clause2Evidence: analysis.clause_2?.evidence || '',
            clause3Compliant: analysis.clause_3?.compliant || false,
            clause3Evidence: analysis.clause_3?.evidence || '',
            clause4Compliant: analysis.clause_4?.compliant || false,
            clause4Evidence: analysis.clause_4?.evidence || '',
            clause5Compliant: analysis.clause_5?.compliant || false,
            clause5Evidence: analysis.clause_5?.evidence || '',
            clause6Compliant: analysis.clause_6?.compliant || false,
            clause6Evidence: analysis.clause_6?.evidence || '',
            clause7Compliant: analysis.clause_7?.compliant || false,
            clause7Evidence: analysis.clause_7?.evidence || '',
            clause8Compliant: analysis.clause_8?.compliant || false,
            clause8Evidence: analysis.clause_8?.evidence || '',
            recommendations: analysis.recommendations || [],
            scannedBy: schedule.createdBy || schedule.created_by,
          });
          
          // Create compliance alert if status changed
          const newStatus = analysis.overall_score >= 75 ? 'compliant' : analysis.overall_score >= 40 ? 'partially_compliant' : 'non_compliant';
          if (prevScan && prevScan.complianceStatus !== newStatus) {
            await db.createComplianceAlert({
              siteId: site.id,
              domain: site.domain,
              previousStatus: prevScan.complianceStatus || undefined,
              newStatus,
              previousScore: Number(prevScan.overallScore || 0),
              newScore: analysis.overall_score,
            });
          }
          
          completed++;
        } else {
          failed++;
        }
      } else {
        failed++;
      }
    } catch (err) {
      console.warn(`[CronEngine] Failed to scan ${site.domain}:`, err);
      failed++;
    }
  }
  
  // Update schedule last run time and next run
  const nextRun = calculateNextRun(schedule);
  await db.updateScanSchedule(scheduleId, {
    lastRunAt: startTime,
    nextRunAt: nextRun,
  } as any);
  
  // Log execution history
  await db.insertScheduleExecution({
    scheduleId,
    startedAt: startTime,
    completedAt: new Date(),
    totalSites: sitesToScan.length,
    completedSites: completed,
    failedSites: failed,
    status: failed === sitesToScan.length ? 'failed' : 'completed',
  });
  
  console.log(`[CronEngine] Schedule ${scheduleId} completed: ${completed} success, ${failed} failed out of ${sitesToScan.length}`);
  
  // Send notification to owner about scan completion
  try {
    const statusText = failed === sitesToScan.length ? 'فشل' : (failed > 0 ? 'مكتمل جزئياً' : 'مكتمل بنجاح');
    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
    const durationText = duration > 60 ? `${Math.floor(duration / 60)} دقيقة و ${duration % 60} ثانية` : `${duration} ثانية`;
    
    await notifyOwner({
      title: `🔍 اكتمال الفحص الدوري: ${schedule.name || 'جدولة #' + scheduleId}`,
      content: [
        `📋 ملخص نتائج الفحص الدوري`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `📌 الجدولة: ${schedule.name || 'جدولة #' + scheduleId}`,
        `📊 الحالة: ${statusText}`,
        `🌐 إجمالي المواقع: ${sitesToScan.length}`,
        `✅ مواقع تم فحصها بنجاح: ${completed}`,
        `❌ مواقع فشل فحصها: ${failed}`,
        `⏱️ مدة التنفيذ: ${durationText}`,
        `📅 وقت البدء: ${startTime.toLocaleString('ar-SA-u-nu-latn', { timeZone: 'Asia/Riyadh' })}`,
        `📅 وقت الانتهاء: ${new Date().toLocaleString('ar-SA-u-nu-latn', { timeZone: 'Asia/Riyadh' })}`,
        `━━━━━━━━━━━━━━━━━━━━`,
        completed > 0 ? `✅ تم تحديث نتائج الامتثال للمواقع المفحوصة` : '',
        failed > 0 ? `⚠️ يرجى مراجعة المواقع التي فشل فحصها` : '',
      ].filter(Boolean).join('\n'),
    });
    console.log(`[CronEngine] Notification sent for schedule ${scheduleId}`);
  } catch (notifErr) {
    console.warn(`[CronEngine] Failed to send notification for schedule ${scheduleId}:`, notifErr);
  }
  
  // Send email notifications to subscribed users
  try {
    const { sendEmail, buildRasidEmailTemplate, isEmailConfigured } = await import('./email');
    if (isEmailConfigured()) {
      const emailPrefs = await db.getActiveEmailPrefs();
      const usersWithEmail = await db.getUsersWithEmailNotifications();
      const statusText = failed === sitesToScan.length ? '\u0641\u0634\u0644' : (failed > 0 ? '\u0645\u0643\u062a\u0645\u0644 \u062c\u0632\u0626\u064a\u0627\u064b' : '\u0645\u0643\u062a\u0645\u0644 \u0628\u0646\u062c\u0627\u062d');
      const duration = Math.round((new Date().getTime() - startTime.getTime()) / 1000);
      const durationText = duration > 60 ? `${Math.floor(duration / 60)} \u062f\u0642\u064a\u0642\u0629 \u0648 ${duration % 60} \u062b\u0627\u0646\u064a\u0629` : `${duration} \u062b\u0627\u0646\u064a\u0629`;
      
      const html = buildRasidEmailTemplate({
        title: `\u0627\u0643\u062a\u0645\u0627\u0644 \u0627\u0644\u0641\u062d\u0635 \u0627\u0644\u062f\u0648\u0631\u064a: ${schedule.name || '\u062c\u062f\u0648\u0644\u0629 #' + scheduleId}`,
        body: `
          <p>\u062a\u0645 \u0627\u0643\u062a\u0645\u0627\u0644 \u0627\u0644\u0641\u062d\u0635 \u0627\u0644\u062f\u0648\u0631\u064a \u0627\u0644\u0645\u062c\u062f\u0648\u0644.</p>
          <table>
            <tr><th>\u0627\u0644\u062c\u062f\u0648\u0644\u0629</th><td>${schedule.name || '\u062c\u062f\u0648\u0644\u0629 #' + scheduleId}</td></tr>
            <tr><th>\u0627\u0644\u062d\u0627\u0644\u0629</th><td>${statusText}</td></tr>
            <tr><th>\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u0648\u0627\u0642\u0639</th><td>${sitesToScan.length}</td></tr>
            <tr><th>\u0646\u062c\u062d</th><td style="color: #22c55e">${completed}</td></tr>
            <tr><th>\u0641\u0634\u0644</th><td style="color: #ef4444">${failed}</td></tr>
            <tr><th>\u0627\u0644\u0645\u062f\u0629</th><td>${durationText}</td></tr>
          </table>
        `,
      });
      
      // Send to all users with email notifications enabled
      const emailRecipients = new Set<string>();
      usersWithEmail.forEach((u: any) => { if (u.email) emailRecipients.add(u.email); });
      emailPrefs.forEach((p: any) => { if (p.emailAddress && p.notifyOnNewScan) emailRecipients.add(p.emailAddress); });
      
      for (const email of Array.from(emailRecipients)) {
        await sendEmail({
          to: email,
          subject: `\ud83d\udd0d \u0627\u0643\u062a\u0645\u0627\u0644 \u0627\u0644\u0641\u062d\u0635 \u0627\u0644\u062f\u0648\u0631\u064a: ${schedule.name || '\u062c\u062f\u0648\u0644\u0629 #' + scheduleId}`,
          html,
        }).catch(() => {});
      }
      console.log(`[CronEngine] Email notifications sent to ${emailRecipients.size} recipients for schedule ${scheduleId}`);
    }
  } catch (emailErr) {
    console.warn(`[CronEngine] Failed to send email notifications for schedule ${scheduleId}:`, emailErr);
  }
}

function calculateNextRun(schedule: any): Date {
  const now = new Date();
  const hour = schedule.hour ?? 2;
  
  switch (schedule.frequency) {
    case 'daily': {
      const next = new Date(now);
      next.setUTCDate(next.getUTCDate() + 1);
      next.setUTCHours(hour, 0, 0, 0);
      return next;
    }
    case 'weekly': {
      const dayOfWeek = schedule.dayOfWeek ?? 0;
      const next = new Date(now);
      const daysUntilNext = (dayOfWeek - now.getUTCDay() + 7) % 7 || 7;
      next.setUTCDate(next.getUTCDate() + daysUntilNext);
      next.setUTCHours(hour, 0, 0, 0);
      return next;
    }
    case 'monthly': {
      const dayOfMonth = schedule.dayOfMonth ?? 1;
      const next = new Date(now);
      next.setUTCMonth(next.getUTCMonth() + 1);
      next.setUTCDate(dayOfMonth);
      next.setUTCHours(hour, 0, 0, 0);
      return next;
    }
    default: {
      const next = new Date(now);
      next.setUTCDate(next.getUTCDate() + 1);
      next.setUTCHours(hour, 0, 0, 0);
      return next;
    }
  }
}

// ===== Escalation Checker =====
async function checkAndEscalateCases(): Promise<number> {
  try {
    const overdueCases = await db.getOverdueCases();
    let escalatedCount = 0;
    
    for (const caseItem of overdueCases) {
      try {
        // Update case stage and priority
        const updates: any = {
          stage: caseItem.escalateToStage,
          status: 'escalated',
        };
        if (caseItem.escalatePriority) {
          updates.priority = caseItem.escalatePriority;
        }
        await db.updateCase(caseItem.id, updates);
        
        // Add case history entry
        await db.insertCaseHistoryEntry({
          caseId: caseItem.id,
          fromStage: caseItem.stage,
          toStage: caseItem.escalateToStage,
          action: `تصعيد تلقائي - القاعدة: ${caseItem.ruleName}`,
          comment: `تم التصعيد تلقائياً بعد تجاوز ${caseItem.maxHours} ساعة دون استجابة (منذ ${Math.round(caseItem.hoursInStage)} ساعة)`,
          performedBy: null as any, // system action
        });
        
        // Log escalation
        await db.insertEscalationLog({
          caseId: caseItem.id,
          ruleId: caseItem.ruleId,
          previousStage: caseItem.stage,
          newStage: caseItem.escalateToStage,
          previousPriority: caseItem.priority,
          newPriority: caseItem.escalatePriority || caseItem.priority,
          hoursOverdue: caseItem.hoursInStage,
          notified: true,
        });
        
        // Create notification for assigned user
        if (caseItem.assignedTo) {
          await db.insertNotification({
            userId: caseItem.assignedTo,
            title: 'تصعيد تلقائي',
            message: `تم تصعيد الحالة ${caseItem.caseNumber}: ${caseItem.title} - تجاوزت ${caseItem.maxHours} ساعة دون استجابة`,
            type: 'warning',
            link: `/cases`,
          });
        }
        
        // Notify owner
        try {
          const { notifyOwner } = await import('./_core/notification');
          await notifyOwner({
            title: `تصعيد تلقائي: ${caseItem.caseNumber}`,
            content: `تم تصعيد الحالة "${caseItem.title}" من مرحلة ${caseItem.stage} إلى ${caseItem.escalateToStage} بعد ${Math.round(caseItem.hoursInStage)} ساعة دون استجابة. القاعدة: ${caseItem.ruleName}`,
          });
        } catch (notifErr) {
          console.warn(`[Escalation] Failed to notify owner for case ${caseItem.id}:`, notifErr);
        }
        
        escalatedCount++;
        console.log(`[Escalation] Case ${caseItem.caseNumber} escalated: ${caseItem.stage} -> ${caseItem.escalateToStage} (overdue by ${Math.round(caseItem.hoursInStage)}h)`);
      } catch (err) {
        console.error(`[Escalation] Error escalating case ${caseItem.id}:`, err);
      }
    }
    
    if (escalatedCount > 0) {
      console.log(`[Escalation] Completed: ${escalatedCount} cases escalated`);
    }
    return escalatedCount;
  } catch (err) {
    console.error('[Escalation] Error checking overdue cases:', err);
    return 0;
  }
}

// Escalation checker cron - runs every 15 minutes
let escalationTask: ReturnType<typeof cron.schedule> | null = null;

function startEscalationChecker() {
  if (escalationTask) return;
  escalationTask = cron.schedule('*/15 * * * *', async () => {
    console.log(`[Escalation] Checking overdue cases at ${new Date().toISOString()}`);
    await checkAndEscalateCases();
  });
  console.log('[Escalation] Checker started (every 15 minutes)');
}

function stopEscalationChecker() {
  if (escalationTask) {
    escalationTask.stop();
    escalationTask = null;
  }
  console.log('[Escalation] Checker stopped');
}

// Helper: Process advanced scan with options
async function processAdvancedScan(
  jobId: number,
  sites: Array<{ url: string; siteId?: number; siteName?: string; sectorType?: string; classification?: string }>,
  userId: number,
  options: { deepScan?: boolean; parallelScan?: boolean; captureScreenshots?: boolean; extractText?: boolean; scanApps?: boolean; bypassDynamic?: boolean; scanDepth?: number; timeout?: number }
) {
  let completed = 0;
  let failed = 0;
  const timeoutMs = (options.timeout || 30) * 1000;
  const concurrency = options.parallelScan ? 5 : 1;

  // Process in batches for parallel scanning
  for (let i = 0; i < sites.length; i += concurrency) {
    // Check if job was cancelled
    const jobCheck = await db.getBatchScanJob(jobId);
    if (jobCheck?.status === 'cancelled') {
      console.log(`[AdvancedScan] Job ${jobId} was cancelled, stopping...`);
      return;
    }
    const batch = sites.slice(i, i + concurrency);
    const promises = batch.map(async (item) => {
      try {
        let domain = item.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');

        // Capture screenshot if enabled
        let screenshotUrl: string | null = null;
        if (options.captureScreenshots) {
          try {
            screenshotUrl = await captureScreenshot(item.url, domain);
          } catch (e) {
            console.warn(`[AdvancedScan] Screenshot failed for ${domain}:`, e);
          }
        }

        // Crawl for privacy page
        const crawlResult = await crawlForPrivacy(item.url);

        // If error page detected, skip further processing and mark as failed
        if (crawlResult.isErrorPage) {
          console.warn(`[AdvancedScan] Error page detected for ${domain}, marking as failed`);
          failed++;
          await db.updateBatchScanJob(jobId, { completedUrls: completed, failedUrls: failed });
          return;
        }

        // Deep scan: if no privacy found, try common privacy page URLs
        if (options.deepScan && !crawlResult.privacyUrl) {
          const commonPaths = [
            '/privacy', '/privacy-policy', '/policy', '/legal/privacy',
            '/ar/privacy', '/en/privacy', '/about/privacy',
            '/%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9',
          ];
          for (const path of commonPaths) {
            try {
              const testUrl = new URL(path, item.url).href;
              const resp = await fetch(testUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RasidBot/2.0; +https://rasid.sa)' },
                signal: AbortSignal.timeout(timeoutMs),
                redirect: 'follow',
              });
              if (resp.ok) {
                const html = await resp.text();
                // Check if this is an error page
                const errorCheck = /this\s*site\s*can'?t\s*be\s*reached|err_connection|404\s*not\s*found|page\s*not\s*found|server\s*error|unexpectedly\s*closed/i;
                if (errorCheck.test(html)) continue;
                const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                  .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                if (text.length > 200 && (text.includes('خصوصية') || text.includes('privacy') || text.includes('بيانات شخصية') || text.includes('personal data'))) {
                  crawlResult.privacyUrl = testUrl;
                  crawlResult.privacyText = text.slice(0, 10000);
                  break;
                }
              }
            } catch {}
          }
        }

        // Analyze compliance
        let complianceResult = null;
        if (crawlResult.privacyText && crawlResult.privacyText.length > 50) {
          complianceResult = await analyzeCompliance(crawlResult.privacyText, domain);
        }

        // Save/update site
        let site = await db.getSiteByDomain(domain);
        if (!site) {
          await db.insertSite({
            domain,
            siteName: item.siteName || crawlResult.siteName || domain,
            siteStatus: 'active',
            privacyUrl: crawlResult.privacyUrl || null,
            contactUrl: crawlResult.contactUrl || null,
            emails: crawlResult.emails?.join(', ') || null,
            classification: item.classification || crawlResult.classification || 'سعودي عام',
            sectorType: (item.sectorType as any) || 'private',
            screenshotUrl: screenshotUrl || undefined,
          });
          site = await db.getSiteByDomain(domain);
        } else {
          if (screenshotUrl) await db.updateSiteScreenshot(site.id, screenshotUrl);
        }
        if (!site) { failed++; return; }

        // Calculate status
        const score = complianceResult?.overall_score || 0;
        let status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'no_policy' = 'no_policy';
        if (!crawlResult.privacyUrl) status = 'no_policy';
        else if (score >= 60) status = 'compliant';
        else if (score >= 40) status = 'partially_compliant';
        else status = 'non_compliant';

        const c = complianceResult || {};
        await db.insertScan({
          siteId: site.id,
          domain,
          overallScore: score,
          rating: c.rating || (status === 'no_policy' ? 'غير ممتثل' : 'ضعيف'),
          complianceStatus: status,
          summary: c.summary || (status === 'no_policy' ? 'الموقع لا يحتوي على صفحة سياسة خصوصية' : 'تحليل غير مكتمل'),
          clause1Compliant: c.clause_1?.compliant || false,
          clause1Evidence: c.clause_1?.evidence || '',
          clause2Compliant: c.clause_2?.compliant || false,
          clause2Evidence: c.clause_2?.evidence || '',
          clause3Compliant: c.clause_3?.compliant || false,
          clause3Evidence: c.clause_3?.evidence || '',
          clause4Compliant: c.clause_4?.compliant || false,
          clause4Evidence: c.clause_4?.evidence || '',
          clause5Compliant: c.clause_5?.compliant || false,
          clause5Evidence: c.clause_5?.evidence || '',
          clause6Compliant: c.clause_6?.compliant || false,
          clause6Evidence: c.clause_6?.evidence || '',
          clause7Compliant: c.clause_7?.compliant || false,
          clause7Evidence: c.clause_7?.evidence || '',
          clause8Compliant: c.clause_8?.compliant || false,
          clause8Evidence: c.clause_8?.evidence || '',
          recommendations: c.recommendations || [],
          screenshotUrl: screenshotUrl || undefined,
          scannedBy: userId,
        });

        completed++;
      } catch (e) {
        console.error(`[AdvancedScan] Error scanning:`, e);
        failed++;
      }
    });

    await Promise.all(promises);
    await db.updateBatchScanJob(jobId, { completedUrls: completed, failedUrls: failed });
  }

  await db.updateBatchScanJob(jobId, {
    completedUrls: completed,
    failedUrls: failed,
    status: 'completed',
    completedAt: new Date(),
  });

  // Notify owner
  try {
    const { notifyOwner } = await import('./_core/notification');
    await notifyOwner({
      title: `اكتمل الفحص المتقدم`,
      content: `تم الانتهاء من فحص ${completed + failed} موقع. ناجح: ${completed}، فاشل: ${failed}`,
    });
  } catch {}
}

// Auto-start cron engine and escalation checker on server startup
setTimeout(() => {
  startCronEngine();
  startEscalationChecker();
}, 5000);


// ===== Helper: Format uptime =====
function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

// ===== Helper: Calculate next send time for scheduled reports =====
function calculateNextSendTime(frequency: string, hour: number, dayOfWeek?: number, dayOfMonth?: number): Date {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);
  
  if (frequency === 'daily') {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequency === 'weekly') {
    const targetDay = dayOfWeek ?? 0; // Sunday default
    const currentDay = next.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0 || (daysUntil === 0 && next <= now)) daysUntil += 7;
    next.setDate(next.getDate() + daysUntil);
  } else if (frequency === 'monthly') {
    const targetDate = dayOfMonth ?? 1;
    next.setDate(targetDate);
    if (next <= now) next.setMonth(next.getMonth() + 1);
  }
  
  return next;
}

// ===== Helper: Execute a scheduled report =====
async function executeScheduledReport(report: any) {
  const execution = await db.createReportExecution({
    reportId: report.id,
    status: 'running',
    startedAt: new Date(),
    recipientCount: Array.isArray(report.recipients) ? report.recipients.length : 0,
  }) as { id: number } | null;
  
  try {
    // Generate report content based on type
    let summary = '';
    const stats = await db.getLeadershipStats();
    const g = stats?.general;
    
    if (report.reportType === 'compliance_summary') {
      summary = `📊 تقرير ملخص الامتثال\n\n`;
      summary += `إجمالي المواقع: ${g?.totalSites || 0}\n`;
      summary += `ممتثل: ${g?.compliant || 0} (${g && g.totalSites > 0 ? Math.round(g.compliant / g.totalSites * 100) : 0}%)\n`;
      summary += `ممتثل جزئياً: ${g?.partiallyCompliant || 0}\n`;
      summary += `غير ممتثل: ${g?.nonCompliant || 0}\n`;
      summary += `لا يعمل: ${g?.noPolicy || 0}\n`;
    } else if (report.reportType === 'sector_comparison') {
      summary = `📊 تقرير مقارنة القطاعات\n\n`;
      const sectors = stats?.sectors || [];
      sectors.forEach((s: any) => {
        summary += `${s.sector}: ${s.total} موقع (${s.complianceRate}% امتثال)\n`;
      });
    } else if (report.reportType === 'trend_analysis') {
      summary = `📊 تقرير تحليل الاتجاهات\n\n`;
      summary += `إجمالي الفحوصات: ${g?.totalScans || 0}\n`;
      summary += `المواقع المفحوصة: ${g?.totalSites || 0}\n`;
    } else if (report.reportType === 'monthly_comparison') {
      summary = `📊 تقرير المقارنة الشهرية\n\n`;
      const monthlyData = await db.getMonthlyComparisonStats();
      if (monthlyData) {
        const curr = monthlyData.thisMonth;
        const prev = monthlyData.lastMonth;
        const totalSites = monthlyData.totalSites || 1;
        summary += `الشهر الحالي:\n`;
        summary += `  إجمالي الفحوصات: ${curr.totalScans}\n`;
        summary += `  ممتثل: ${curr.compliant} (${curr.totalScans > 0 ? Math.round(curr.compliant / curr.totalScans * 100) : 0}%)\n`;
        summary += `  غير ممتثل: ${curr.nonCompliant}\n`;
        summary += `  ممتثل جزئياً: ${curr.partiallyCompliant}\n\n`;
        summary += `الشهر السابق:\n`;
        summary += `  إجمالي الفحوصات: ${prev.totalScans}\n`;
        summary += `  ممتثل: ${prev.compliant} (${prev.totalScans > 0 ? Math.round(prev.compliant / prev.totalScans * 100) : 0}%)\n`;
        summary += `  غير ممتثل: ${prev.nonCompliant}\n`;
        summary += `  ممتثل جزئياً: ${prev.partiallyCompliant}\n\n`;
        const complianceDiff = (curr.totalScans > 0 ? Math.round(curr.compliant / curr.totalScans * 100) : 0) - (prev.totalScans > 0 ? Math.round(prev.compliant / prev.totalScans * 100) : 0);
        summary += `التغيير في نسبة الامتثال: ${complianceDiff > 0 ? '+' : ''}${complianceDiff}%\n`;
      } else {
        summary += `لا تتوفر بيانات مقارنة شهرية حالياً\n`;
      }
    } else {
      summary = `📊 التقرير الشامل\n\n`;
      summary += `إجمالي المواقع: ${g?.totalSites || 0}\n`;
      summary += `إجمالي الفحوصات: ${g?.totalScans || 0}\n`;
      summary += `ممتثل: ${g?.compliant || 0}\n`;
      summary += `غير ممتثل: ${g?.nonCompliant || 0}\n`;
      summary += `ممتثل جزئياً: ${g?.partiallyCompliant || 0}\n`;
      summary += `لا يعمل: ${g?.noPolicy || 0}\n`;
      const clauses = stats?.clauses || [];
      if (clauses.length > 0) {
        summary += `\nبنود المادة 12:\n`;
        clauses.forEach((c: any) => {
          summary += `  البند ${c.clause}: ${c.compliant}/${c.total} (${c.percentage}%)\n`;
        });
      }
    }
    
    // Send notification to owner
    const { notifyOwner } = await import('./_core/notification');
    await notifyOwner({
      title: `📋 ${report.name}`,
      content: summary,
    });

    // Create in-app notification for all recipients
    if (Array.isArray(report.recipients)) {
      for (const recipientEmail of report.recipients) {
        try {
          // Find user by email
          const recipientUser = await db.getUserByEmail(recipientEmail);
          if (recipientUser) {
            await db.insertNotification({
              userId: recipientUser.id,
              title: `تقرير جاهز: ${report.name}`,
              message: `تم إنشاء التقرير المجدول "${report.name}" بنجاح. يمكنك مراجعته من صفحة التقارير.`,
              type: 'success',
              link: '/reports',
            });
          }
        } catch (e) { /* skip */ }
      }
    }

    // Send email if SMTP is configured
    try {
      const { sendReportEmail, isEmailConfigured } = await import('./email');
      if (isEmailConfigured() && Array.isArray(report.recipients) && report.recipients.length > 0) {
        await sendReportEmail({
          to: report.recipients,
          reportName: report.name,
          reportType: report.reportType || 'comprehensive',
          summary: summary.replace(/\n/g, '<br>'),
        });
        console.log(`[ReportCron] Email sent for report: ${report.name}`);
      }
    } catch (emailErr: any) {
      console.warn(`[ReportCron] Email send failed: ${emailErr.message}`);
    }
    
    // Update execution
    if (execution) {
      await db.updateReportExecution(execution.id, {
        status: 'completed',
        summary,
        completedAt: new Date(),
      });
    }
    
    // Update report lastSentAt and nextSendAt
    const nextSendAt = calculateNextSendTime(report.frequency, report.hour ?? 8, report.dayOfWeek ?? undefined, report.dayOfMonth ?? undefined);
    await db.updateScheduledReport(report.id, {
      lastSentAt: new Date(),
      nextSendAt,
    });
    
  } catch (error: any) {
    if (execution) {
      await db.updateReportExecution(execution.id, {
        status: 'failed',
        summary: `Error: ${error.message}`,
        completedAt: new Date(),
      });
    }
  }
}

// ===== Scheduled Reports Cron Checker =====
let reportCronTask: any = null;

function startReportCronChecker() {
  if (reportCronTask) return;
  reportCronTask = cron.schedule('0 */30 * * * *', async () => { // every 30 minutes
    try {
      const reports = await db.getActiveScheduledReports();
      const now = new Date();
      for (const report of reports) {
        if (report.nextSendAt && new Date(report.nextSendAt) <= now) {
          console.log(`[ReportCron] Executing report: ${report.name}`);
          await executeScheduledReport(report);
        }
      }
    } catch (error: any) {
      console.error('[ReportCron] Error:', error.message);
    }
  });
  reportCronTask.start();
  console.log('[ReportCron] Scheduled reports checker started (every 30 minutes)');
}

// Auto-start report cron checker
setTimeout(() => {
  startReportCronChecker();
}, 7000);

// ===== Background: Bulk Analysis Job Processor =====
async function processBulkAnalysisJob(jobId: number) {
  console.log(`[BulkAnalysis] Starting job ${jobId}`);
  const job = await db.getBulkAnalysisJob(jobId);
  if (!job) return;

  // Get all pending results for this job
  const results = await db.getBulkAnalysisResults(jobId, 50000, 0);
  const BATCH_SIZE = 3; // Process 3 at a time to avoid rate limits
  
  for (let i = 0; i < results.length; i += BATCH_SIZE) {
    // Check if job was paused or cancelled
    const currentJob = await db.getBulkAnalysisJob(jobId);
    if (!currentJob || currentJob.status === 'paused' || currentJob.status === 'cancelled') {
      console.log(`[BulkAnalysis] Job ${jobId} was ${currentJob?.status || 'deleted'}`);
      return;
    }

    const batch = results.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (result: any) => {
      try {
        let privacyUrl = result.privacyUrl;
        let privacyText = '';

        // If we have a privacy URL, fetch the content
        if (privacyUrl) {
          try {
            const resp = await fetch(privacyUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RasidBot/1.0)' },
              signal: AbortSignal.timeout(15000),
            });
            if (resp.ok) {
              const html = await resp.text();
              privacyText = html
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            }
          } catch (e: any) {
            console.warn(`[BulkAnalysis] Failed to fetch ${privacyUrl}:`, e.message);
          }
        }

        // If no privacy URL, try to crawl for it
        if (!privacyUrl || !privacyText) {
          try {
            const crawlResult = await crawlForPrivacy(`https://${result.domain}`);
            if (crawlResult.privacyUrl) {
              privacyUrl = crawlResult.privacyUrl;
              privacyText = crawlResult.privacyText || '';
            }
          } catch (e: any) {
            console.warn(`[BulkAnalysis] Crawl failed for ${result.domain}:`, e.message);
          }
        }

        if (privacyText && privacyText.length > 50) {
          // Analyze with AI
          const analysis = await analyzeCompliance(privacyText, result.domain);
          if (analysis) {
            const score = analysis.overall_score || 0;
            let status: 'compliant' | 'partially_compliant' | 'non_compliant' = 'non_compliant';
            if (score >= 60) status = 'compliant';
            else if (score >= 40) status = 'partially_compliant';

            await db.updateBulkAnalysisResult(result.id, {
              privacyUrl: privacyUrl || result.privacyUrl,
              overallScore: score,
              complianceStatus: status,
              clause1: analysis.clause_1?.compliant || false,
              clause1Evidence: analysis.clause_1?.evidence || '',
              clause2: analysis.clause_2?.compliant || false,
              clause2Evidence: analysis.clause_2?.evidence || '',
              clause3: analysis.clause_3?.compliant || false,
              clause3Evidence: analysis.clause_3?.evidence || '',
              clause4: analysis.clause_4?.compliant || false,
              clause4Evidence: analysis.clause_4?.evidence || '',
              clause5: analysis.clause_5?.compliant || false,
              clause5Evidence: analysis.clause_5?.evidence || '',
              clause6: analysis.clause_6?.compliant || false,
              clause6Evidence: analysis.clause_6?.evidence || '',
              clause7: analysis.clause_7?.compliant || false,
              clause7Evidence: analysis.clause_7?.evidence || '',
              clause8: analysis.clause_8?.compliant || false,
              clause8Evidence: analysis.clause_8?.evidence || '',
              summary: analysis.summary || '',
              recommendations: analysis.recommendations || [],
              privacyTextLength: privacyText.length,
              analyzedAt: new Date(),
            });

            await db.incrementJobProgress(jobId, 'analyzedUrls');
            if (status === 'compliant') await db.incrementJobProgress(jobId, 'compliantCount');
            else if (status === 'partially_compliant') await db.incrementJobProgress(jobId, 'partialCount');
            else await db.incrementJobProgress(jobId, 'nonCompliantCount');
          } else {
            // AI analysis failed
            await db.updateBulkAnalysisResult(result.id, {
              complianceStatus: 'error',
              errorMessage: 'فشل التحليل بالذكاء الاصطناعي',
              analyzedAt: new Date(),
            });
            await db.incrementJobProgress(jobId, 'failedUrls');
          }
        } else {
          // No privacy text found
          await db.updateBulkAnalysisResult(result.id, {
            complianceStatus: 'no_policy',
            privacyUrl: privacyUrl || null,
            errorMessage: privacyUrl ? 'لم يتم العثور على نص سياسة خصوصية كافٍ' : 'لم يتم العثور على صفحة سياسة خصوصية',
            analyzedAt: new Date(),
          });
          await db.incrementJobProgress(jobId, 'analyzedUrls');
          await db.incrementJobProgress(jobId, 'noPolicyCount');
        }
      } catch (e: any) {
        console.error(`[BulkAnalysis] Error processing ${result.domain}:`, e.message);
        await db.updateBulkAnalysisResult(result.id, {
          complianceStatus: 'error',
          errorMessage: e.message || 'خطأ غير متوقع',
          analyzedAt: new Date(),
        });
        await db.incrementJobProgress(jobId, 'failedUrls');
      }
    }));

    // Update average score every batch
    await db.updateJobAvgScore(jobId);

    // Small delay between batches to avoid overloading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if ((i + BATCH_SIZE) % 30 === 0) {
      console.log(`[BulkAnalysis] Job ${jobId}: processed ${Math.min(i + BATCH_SIZE, results.length)}/${results.length}`);
    }
  }

  // Mark job as completed
  await db.updateBulkAnalysisJob(jobId, { status: 'completed', completedAt: new Date() });
  await db.updateJobAvgScore(jobId);
  console.log(`[BulkAnalysis] Job ${jobId} completed`);
}


// ===== Helper: Strategy Arabic Names =====
function getStrategyArabicName(strategy: string): string {
  const names: Record<string, string> = {
    'direct_url': 'رابط مباشر',
    'link_text_match': 'مطابقة نص الرابط',
    'footer_link': 'رابط في التذييل',
    'sitemap': 'خريطة الموقع',
    'robots_txt': 'ملف robots.txt',
    'google_search': 'بحث جوجل',
    'cms_specific': 'خاص بنظام إدارة المحتوى',
    'meta_tag': 'وسوم Meta',
    'json_ld': 'بيانات JSON-LD المنظمة',
    'common_paths': 'مسارات شائعة',
    'subdomain': 'نطاق فرعي',
    'pdf_link': 'رابط PDF',
    'google_cache': 'ذاكرة جوجل المؤقتة',
    'wayback_machine': 'أرشيف الإنترنت',
    'terms_embedded': 'مدمج في صفحة الشروط',
    'hreflang': 'روابط Hreflang متعددة اللغات',
    'iframe': 'محتوى iframe',
    'about_page': 'صفحة حول/اتصل بنا',
    'third_party_service': 'خدمة خصوصية خارجية',
    'external_docs': 'مستندات خارجية',
    'image_map_svg': 'خريطة صور/SVG',
    'puppeteer_dom': 'متصفح Headless',
    'deep_crawl': 'زحف عميق',
    'link_crawl': 'زحف الروابط',
    'navigation_menu': 'قائمة التنقل',
    'search_engine': 'محرك البحث',
    'cookie_consent': 'إشعار الكوكيز',
    'registration_page': 'صفحة التسجيل',
  };
  return names[strategy] || strategy;
}
