import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import * as db from "./db";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
    throw new Error("Forbidden: Admin access required");
  }
  return next({ ctx });
});

// ═══════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════
const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ═══════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════
const overviewRouter = router({
  stats: protectedProcedure.query(async () => {
    return db.getOverviewStats();
  }),
});

// ═══════════════════════════════════════════════════
// PRIVACY / SITES
// ═══════════════════════════════════════════════════
const privacyRouter = router({
  stats: protectedProcedure.query(async () => {
    return db.getSiteStats();
  }),
  sectorDistribution: protectedProcedure.query(async () => {
    return db.getSiteSectorDistribution();
  }),
  sites: protectedProcedure.input(z.object({
    status: z.string().optional(),
    sector: z.string().optional(),
    search: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getSites(input);
  }),
  siteById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return db.getSiteById(input.id);
  }),
  createSite: adminProcedure.input(z.object({
    url: z.string(),
    siteNameAr: z.string().optional(),
    siteNameEn: z.string().optional(),
    entityType: z.string().optional(),
    entityNameAr: z.string().optional(),
    sector: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    return db.createSite({ ...input, url: input.url, createdBy: ctx.user.id } as any);
  }),
  updateSite: adminProcedure.input(z.object({
    id: z.number(),
    data: z.record(z.string(), z.any()),
  })).mutation(async ({ input }) => {
    return db.updateSite(input.id, input.data as any);
  }),
  siteScans: protectedProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
    return db.getScansBySiteId(input.siteId);
  }),
  siteRequirements: protectedProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
    return db.getRequirementsBySiteId(input.siteId);
  }),
  policyVersions: protectedProcedure.input(z.object({ siteId: z.number() })).query(async ({ input }) => {
    return db.getPolicyVersionsBySiteId(input.siteId);
  }),
});

// ═══════════════════════════════════════════════════
// INCIDENTS
// ═══════════════════════════════════════════════════
const incidentsRouter = router({
  stats: protectedProcedure.query(async () => {
    return db.getIncidentStats();
  }),
  list: protectedProcedure.input(z.object({
    status: z.string().optional(),
    severity: z.string().optional(),
    sector: z.string().optional(),
    search: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getIncidents(input);
  }),
  byId: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return db.getIncidentById(input.id);
  }),
  create: adminProcedure.input(z.object({
    title: z.string(),
    titleAr: z.string().optional(),
    description: z.string().optional(),
    severity: z.enum(["critical", "high", "medium", "low"]).optional(),
    source: z.string().optional(),
    affectedEntity: z.string().optional(),
    sector: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    return db.createIncident({ ...input, title: input.title, reportedBy: ctx.user.id } as any);
  }),
  update: adminProcedure.input(z.object({
    id: z.number(),
    data: z.record(z.string(), z.any()),
  })).mutation(async ({ input }) => {
    return db.updateIncident(input.id, input.data as any);
  }),
  timeline: protectedProcedure.input(z.object({ incidentId: z.number() })).query(async ({ input }) => {
    return db.getIncidentTimeline(input.incidentId);
  }),
  datasets: protectedProcedure.input(z.object({ incidentId: z.number() })).query(async ({ input }) => {
    return db.getIncidentDatasets(input.incidentId);
  }),
});

// ═══════════════════════════════════════════════════
// FOLLOW-UPS
// ═══════════════════════════════════════════════════
const followupsRouter = router({
  stats: protectedProcedure.query(async () => {
    return db.getFollowupStats();
  }),
  list: protectedProcedure.input(z.object({
    status: z.string().optional(),
    type: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getFollowups(input);
  }),
  byId: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return db.getFollowupById(input.id);
  }),
  create: protectedProcedure.input(z.object({
    title: z.string(),
    description: z.string().optional(),
    type: z.enum(["site_followup", "incident_followup", "general", "corrective_action"]).optional(),
    priority: z.enum(["critical", "high", "medium", "low"]).optional(),
    relatedSiteId: z.number().optional(),
    relatedIncidentId: z.number().optional(),
    assignedTo: z.number().optional(),
    dueDate: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    return db.createFollowup({ ...input, assignedBy: ctx.user.id, dueDate: input.dueDate ? new Date(input.dueDate) : undefined });
  }),
});

// ═══════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════
const reportsRouter = router({
  list: protectedProcedure.input(z.object({
    type: z.string().optional(),
    status: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getReports(input);
  }),
  byId: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return db.getReportById(input.id);
  }),
  create: protectedProcedure.input(z.object({
    title: z.string(),
    description: z.string().optional(),
    type: z.enum(["privacy_compliance", "incident_summary", "executive_brief", "custom", "scheduled"]).optional(),
    templateId: z.number().optional(),
    filters: z.any().optional(),
  })).mutation(async ({ input, ctx }) => {
    return db.createReport({ ...input, title: input.title, generatedBy: ctx.user.id } as any);
  }),
  templates: protectedProcedure.query(async () => {
    return db.getReportTemplates();
  }),
  scheduled: protectedProcedure.query(async () => {
    return db.getScheduledReports();
  }),
});

// ═══════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════
const notificationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserNotifications(ctx.user.id);
  }),
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return db.getUnreadNotificationCount(ctx.user.id);
  }),
  markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    return db.markNotificationRead(input.id);
  }),
});

// ═══════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════
const adminRouter = router({
  users: adminProcedure.query(async () => {
    return db.getAllUsers();
  }),
  updateUser: adminProcedure.input(z.object({
    id: z.number(),
    data: z.record(z.string(), z.any()),
  })).mutation(async ({ input }) => {
    return db.updateUser(input.id, input.data as any);
  }),
  roles: adminProcedure.query(async () => {
    return db.getRoles();
  }),
  groups: adminProcedure.query(async () => {
    return db.getGroups();
  }),
  pages: adminProcedure.query(async () => {
    return db.getPages();
  }),
  menus: adminProcedure.query(async () => {
    return db.getMenus();
  }),
  catalogs: adminProcedure.input(z.object({ type: z.string().optional() }).optional()).query(async ({ input }) => {
    return db.getCatalogs(input?.type);
  }),
  featureFlags: adminProcedure.query(async () => {
    return db.getFeatureFlags();
  }),
  settings: adminProcedure.query(async () => {
    return db.getSettings();
  }),
  updateSetting: adminProcedure.input(z.object({
    key: z.string(),
    value: z.string(),
  })).mutation(async ({ input, ctx }) => {
    return db.updateSetting(input.key, input.value, ctx.user.id);
  }),
  auditLog: adminProcedure.input(z.object({
    userId: z.number().optional(),
    action: z.string().optional(),
    entityType: z.string().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional()).query(async ({ input }) => {
    return db.getAuditLog(input);
  }),
});

// ═══════════════════════════════════════════════════
// AI ASSISTANT
// ═══════════════════════════════════════════════════
const aiRouter = router({
  conversations: protectedProcedure.query(async ({ ctx }) => {
    return db.getConversations(ctx.user.id);
  }),
  messages: protectedProcedure.input(z.object({ conversationId: z.number() })).query(async ({ input }) => {
    return db.getConversationMessages(input.conversationId);
  }),
  createConversation: protectedProcedure.input(z.object({
    title: z.string().optional(),
    pageContext: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    return db.createConversation(ctx.user.id, input.title, input.pageContext);
  }),
  sendMessage: protectedProcedure.input(z.object({
    conversationId: z.number(),
    content: z.string(),
    pageContext: z.string().optional(),
    currentRoute: z.string().optional(),
    entityId: z.number().optional(),
    entityType: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const userMsg = await db.addMessage(input.conversationId, "user", input.content);
    // Fetch platform data for context
    const siteStats = await db.getSiteStats();
    const incidentStats = await db.getIncidentStats();
    const followupStats = await db.getFollowupStats();
    const history = await db.getConversationMessages(input.conversationId);
    const glossary = await db.getGlossary();
    // Build system prompt
    const systemPrompt = `أنت "راصد الذكي" — المساعد التشغيلي الذكي لمنصة راصد الوطنية.
أنت تعمل داخل المنصة الوطنية لرصد امتثال المواقع الإلكترونية لنظام حماية البيانات الشخصية ومتابعة وقائع تسرب البيانات الشخصية.

المبادئ:
- كل رقم أو نسبة تقدمها يجب أن تكون من بيانات المنصة الفعلية المتاحة لك.
- قدم ملخصاً قصيراً أولاً ثم التفاصيل عند الطلب.
- استخدم لغة عربية رسمية مهنية مختصرة.
- قدم روابط Drillthrough داخل المنصة عند الإمكان.
- رحب بالمستخدم باسمه في أول تفاعل.

بيانات المنصة الحالية:
- إجمالي المواقع: ${siteStats.total}
- ممتثل: ${siteStats.compliant} | جزئي: ${siteStats.partial} | غير ممتثل: ${siteStats.nonCompliant} | لا يعمل: ${siteStats.notWorking}
- بدون سياسة: ${siteStats.noPolicy} | بدون تواصل: ${siteStats.noContact}
- إجمالي الوقائع: ${incidentStats.total}
- قيد التحقق: ${incidentStats.investigating} | مؤكدة: ${incidentStats.confirmed} | محتواة: ${incidentStats.contained} | تم الحل: ${incidentStats.resolved} | مغلقة: ${incidentStats.closed}
- إجمالي المتابعات: ${followupStats.total} | مفتوحة: ${followupStats.open} | قيد التنفيذ: ${followupStats.inProgress} | مكتملة: ${followupStats.completed}

اسم المستخدم: ${ctx.user.name || 'مستخدم'}
الصفحة الحالية: ${input.currentRoute || 'غير محدد'}
${input.entityType ? `الكيان الحالي: ${input.entityType} #${input.entityId}` : ''}
${glossary.length > 0 ? `\nمصطلحات المنصة: ${glossary.slice(0, 20).map((g: any) => g.term + ': ' + (g.definition || '')).join(' | ')}` : ''}

عند الإجابة:
1. ملخص قصير (سطران)
2. الأرقام/النتيجة
3. تفسير مختصر
4. روابط مقترحة (مثل: [عرض المواقع غير الممتثلة](/app/privacy/sites?status=non_compliant))
5. إجراءات مقترحة`;

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
    ];
    // Add conversation history (last 20 messages)
    const recentHistory = history.slice(-20);
    for (const msg of recentHistory) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({ role: msg.role as "user" | "assistant", content: msg.content });
      }
    }
    // Add current message
    messages.push({ role: "user", content: input.content });

    try {
      const { invokeLLM } = await import("./_core/llm");
      const response = await invokeLLM({ messages });
      const rawContent = response.choices?.[0]?.message?.content;
      const aiContent = (typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent)) || "عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.";
      const aiMsg = await db.addMessage(input.conversationId, "assistant", aiContent);
      return aiMsg;
    } catch (error) {
      console.error("[AI] LLM error:", error);
      const errorMsg = await db.addMessage(input.conversationId, "assistant", "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.");
      return errorMsg;
    }
  }),

  suggestions: protectedProcedure.input(z.object({
    route: z.string().optional(),
    entityType: z.string().optional(),
  })).query(async ({ input }) => {
    const route = input.route || '';
    const suggestions: string[] = [];
    if (route.includes('privacy') || route.includes('sites')) {
      suggestions.push('كم عدد المواقع الممتثلة؟', 'ما المواقع بدون سياسة خصوصية؟', 'أظهر توزيع الامتثال حسب القطاع', 'أنشئ متابعة للمواقع غير الممتثلة');
    } else if (route.includes('incidents')) {
      suggestions.push('كم واقعة تسرب مؤكدة؟', 'ما أعلى الوقائع من حيث الأثر؟', 'أظهر توزيع الوقائع حسب الحالة', 'لخص آخر واقعة');
    } else if (route.includes('followups')) {
      suggestions.push('ما المتابعات المتأخرة؟', 'كم متابعة مفتوحة؟', 'أظهر المتابعات حسب الأولوية');
    } else if (route.includes('reports')) {
      suggestions.push('أنشئ تقريراً شهرياً', 'ما التقارير المجدولة؟', 'أظهر آخر التقارير');
    } else {
      suggestions.push('أعطني ملخصاً عاماً للمنصة', 'كم موقع ممتثل؟', 'كم واقعة تسرب مفتوحة؟', 'ما المتابعات المتأخرة؟', 'اكتب رسالة رسمية', 'ابدأ دليلاً حياً');
    }
    return suggestions;
  }),
  glossary: protectedProcedure.query(async () => {
    return db.getGlossary();
  }),
  pageDescriptor: protectedProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    return db.getPageDescriptor(input.slug);
  }),
  guides: protectedProcedure.query(async () => {
    return db.getGuides();
  }),
});

// ═══════════════════════════════════════════════════
// MY DASHBOARD
// ═══════════════════════════════════════════════════
const myDashboardRouter = router({
  layouts: protectedProcedure.query(async ({ ctx }) => {
    return db.getUserDashboardLayouts(ctx.user.id);
  }),
  saveLayout: protectedProcedure.input(z.object({
    id: z.number().optional(),
    name: z.string().optional(),
    nameAr: z.string().optional(),
    dataSource: z.string().optional(),
    layout: z.any().optional(),
    filters: z.any().optional(),
    isDefault: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    return db.saveDashboardLayout({ ...input, userId: ctx.user.id });
  }),
});

// ═══════════════════════════════════════════════════
// VERIFICATION (PUBLIC)
// ═══════════════════════════════════════════════════
const verifyRouter = router({
  check: publicProcedure.input(z.object({ code: z.string() })).query(async ({ input }) => {
    return db.verifyDocument(input.code);
  }),
});

// ═══════════════════════════════════════════════════
// APP ROUTER
// ═══════════════════════════════════════════════════
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  overview: overviewRouter,
  privacy: privacyRouter,
  incidents: incidentsRouter,
  followups: followupsRouter,
  reports: reportsRouter,
  notifications: notificationsRouter,
  admin: adminRouter,
  ai: aiRouter,
  myDashboard: myDashboardRouter,
  verify: verifyRouter,
});

export type AppRouter = typeof appRouter;
