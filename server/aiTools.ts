/**
 * AI Tools for Smart Rasid (راصد الذكي)
 * Comprehensive tool-calling system that gives the AI assistant
 * full access to all platform data and operations.
 */

import * as db from "./db";

// ===== Tool Definitions for LLM Function Calling =====
export const AI_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_dashboard_stats",
      description: "احصل على إحصائيات لوحة التحكم الرئيسية: إجمالي المواقع، الفحوصات، نسب الامتثال، المواقع الممتثلة وغير الممتثلة",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_sites",
      description: "ابحث عن المواقع الإلكترونية في قاعدة البيانات بالاسم أو الرابط أو التصنيف أو حالة الامتثال",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "نص البحث (اسم الموقع أو الرابط)" },
          complianceStatus: { type: "string", enum: ["compliant", "partially_compliant", "non_compliant", "no_policy"], description: "حالة الامتثال" },
          classification: { type: "string", description: "تصنيف الموقع (حكومي، خاص، شبه حكومي، إلخ)" },
          sectorType: { type: "string", enum: ["public", "private"], description: "نوع القطاع" },
          limit: { type: "number", description: "عدد النتائج (الافتراضي 10)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_site_details",
      description: "احصل على تفاصيل موقع محدد بما في ذلك نتائج الفحص وبنود الامتثال والتوصيات. يمكن البحث بالمعرف أو اسم النطاق",
      parameters: {
        type: "object",
        properties: {
          siteId: { type: "number", description: "معرف الموقع" },
          domain: { type: "string", description: "اسم النطاق (مثل example.com)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_site_scan_history",
      description: "احصل على سجل الفحوصات لموقع محدد مع تفاصيل كل فحص ونتائجه",
      parameters: {
        type: "object",
        properties: {
          siteId: { type: "number", description: "معرف الموقع" },
        },
        required: ["siteId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_clause_stats",
      description: "احصل على إحصائيات بنود المادة 12 الثمانية مع نسب الامتثال لكل بند",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_clause_detail",
      description: "احصل على تفاصيل بند محدد من بنود المادة 12 مع قائمة المواقع الممتثلة وغير الممتثلة",
      parameters: {
        type: "object",
        properties: {
          clauseNum: { type: "number", description: "رقم البند (1-8)" },
          compliant: { type: "boolean", description: "true للممتثلة، false لغير الممتثلة" },
          limit: { type: "number", description: "عدد النتائج" },
        },
        required: ["clauseNum"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_sector_compliance",
      description: "احصل على مقارنة الامتثال بين القطاعات (حكومي، خاص، شبه حكومي، إلخ)",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_leadership_stats",
      description: "احصل على إحصائيات لوحة المؤشرات القيادية الشاملة",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "perform_scan",
      description: "قم بفحص موقع إلكتروني جديد للتحقق من امتثاله لنظام حماية البيانات الشخصية. أدخل الرابط الكامل للموقع",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "رابط الموقع المراد فحصه (مثل https://example.com)" },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_recent_scans",
      description: "احصل على آخر الفحوصات التي تمت في المنصة",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "عدد النتائج (الافتراضي 10)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_members",
      description: "احصل على قائمة أعضاء المنصة مع أدوارهم ومعلوماتهم",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_cases",
      description: "احصل على قائمة الحالات/الطلبات في نظام إدارة الحالات مع حالتها ومراحلها",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "حالة الطلب (open, in_progress, resolved, closed)" },
          limit: { type: "number", description: "عدد النتائج" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_letters",
      description: "احصل على قائمة الخطابات المرسلة والمعلقة مع حالتها",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "حالة الخطاب (draft, sent, delivered, responded)" },
          limit: { type: "number", description: "عدد النتائج" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_scan_schedules",
      description: "احصل على قائمة الفحوصات المجدولة مع حالتها وتواريخ التنفيذ",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_escalation_stats",
      description: "احصل على إحصائيات التصعيد التلقائي للحالات",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_notifications",
      description: "احصل على آخر الإشعارات للمستخدم الحالي",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "عدد الإشعارات" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_activity_logs",
      description: "احصل على سجل الأنشطة والعمليات في المنصة",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "عدد السجلات" },
          action: { type: "string", description: "نوع النشاط (login, scan_site, create_case, إلخ)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_classification_stats",
      description: "احصل على إحصائيات التصنيفات (صحة، تعليم، تجارة، إلخ) مع نسب الامتثال",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_bulk_analysis_jobs",
      description: "احصل على قائمة مهام التحليل الجماعي لسياسات الخصوصية مع حالتها",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_document_stats",
      description: "احصل على إحصائيات المستندات والتقارير في المنصة",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_letter_stats",
      description: "احصل على إحصائيات الخطابات (مسودة، مرسل، مستلم، تم الرد)",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

// ===== Tool Execution Functions =====

export async function executeTool(toolName: string, args: Record<string, any>, userId: number): Promise<string> {
  try {
    switch (toolName) {
      case "get_dashboard_stats":
        return await toolGetDashboardStats();
      case "search_sites":
        return await toolSearchSites(args);
      case "get_site_details":
        return await toolGetSiteDetails(args);
      case "get_site_scan_history":
        return await toolGetSiteScanHistory(args);
      case "get_clause_stats":
        return await toolGetClauseStats();
      case "get_clause_detail":
        return await toolGetClauseDetail(args);
      case "get_sector_compliance":
        return await toolGetSectorCompliance();
      case "get_leadership_stats":
        return await toolGetLeadershipStats();
      case "perform_scan":
        return JSON.stringify({ action: "perform_scan", url: args.url, message: "سيتم تنفيذ الفحص عبر واجهة المنصة. يرجى استخدام صفحة الفحص الجديد." });
      case "get_recent_scans":
        return await toolGetRecentScans(args);
      case "get_members":
        return await toolGetMembers();
      case "get_cases":
        return await toolGetCases(args);
      case "get_letters":
        return await toolGetLetters(args);
      case "get_scan_schedules":
        return await toolGetScanSchedules();
      case "get_escalation_stats":
        return await toolGetEscalationStats();
      case "get_notifications":
        return await toolGetNotifications(userId, args);
      case "get_activity_logs":
        return await toolGetActivityLogs(args);
      case "get_classification_stats":
        return await toolGetClassificationStats();
      case "get_bulk_analysis_jobs":
        return await toolGetBulkAnalysisJobs();
      case "get_document_stats":
        return await toolGetDocumentStats();
      case "get_letter_stats":
        return await toolGetLetterStats();
      default:
        return JSON.stringify({ error: `أداة غير معروفة: ${toolName}` });
    }
  } catch (error: any) {
    console.error(`[AI Tool] Error executing ${toolName}:`, error?.message);
    return JSON.stringify({ error: `خطأ في تنفيذ الأداة: ${error?.message || 'خطأ غير معروف'}` });
  }
}

// ===== Individual Tool Implementations =====

async function toolGetDashboardStats(): Promise<string> {
  const stats = await db.getDashboardStats();
  return JSON.stringify({
    totalSites: stats?.totalSites || 0,
    totalScans: stats?.totalScans || 0,
    compliantSites: stats?.compliant || 0,
    partiallyCompliant: stats?.partiallyCompliant || 0,
    nonCompliant: stats?.nonCompliant || 0,
    noPolicy: stats?.noPolicy || 0,
    complianceRate: (stats?.totalSites || 0) > 0 ? Math.round(((stats?.compliant || 0) / stats!.totalSites) * 100) : 0,
    summary: `إجمالي المواقع: ${stats?.totalSites || 0} | الفحوصات: ${stats?.totalScans || 0} | ممتثل: ${stats?.compliant || 0} | جزئي: ${stats?.partiallyCompliant || 0} | غير ممتثل: ${stats?.nonCompliant || 0} | بدون سياسة: ${stats?.noPolicy || 0}`,
  });
}

async function toolSearchSites(args: Record<string, any>): Promise<string> {
  const result = await db.getSites({
    search: args.search || undefined,
    complianceStatus: args.complianceStatus || undefined,
    classification: args.classification || undefined,
    sectorType: args.sectorType || undefined,
    limit: Math.min(args.limit || 10, 20),
    page: 1,
  });
  const sites = result.sites.map((s: any) => ({
    id: s.id,
    domain: s.domain,
    siteName: s.siteName,
    classification: s.classification,
    sectorType: s.sectorType,
    complianceStatus: s.complianceStatus,
    overallScore: s.overallScore,
    privacyUrl: s.privacyUrl,
    lastScanDate: s.lastScanDate,
  }));
  return JSON.stringify({
    total: result.total,
    sites,
    summary: `تم العثور على ${result.total} موقع. عرض ${sites.length} نتيجة.`,
  });
}

async function toolGetSiteDetails(args: Record<string, any>): Promise<string> {
  let site: any = null;
  if (args.siteId) {
    site = await db.getSiteById(args.siteId);
  } else if (args.domain) {
    // Try exact match first
    site = await db.getSiteByDomain(args.domain);
    if (!site) {
      // Try search
      const result = await db.getSites({ search: args.domain, limit: 1, page: 1 });
      if (result.sites.length > 0) site = await db.getSiteById(result.sites[0].id);
    }
  }
  if (!site) return JSON.stringify({ error: "لم يتم العثور على الموقع" });

  // Get latest scan
  const scans = await db.getSiteScans(site.id);
  const latestScan = scans?.[0];

  const clauseNames = [
    "سياسة الخصوصية", "سياسة الكوكيز", "تشفير البيانات (SSL/TLS)",
    "نموذج جمع البيانات", "حقوق أصحاب البيانات", "مسؤول حماية البيانات (DPO)",
    "الإفصاح عن مشاركة البيانات", "الاحتفاظ بالبيانات"
  ];

  const clauses = latestScan ? Array.from({ length: 8 }, (_, i) => ({
    clauseNum: i + 1,
    name: clauseNames[i],
    compliant: (latestScan as any)[`clause${i + 1}Compliant`] || false,
    evidence: (latestScan as any)[`clause${i + 1}Evidence`] || "",
  })) : [];

  const compliantCount = clauses.filter(c => c.compliant).length;

  return JSON.stringify({
    site: {
      id: site.id,
      domain: site.domain,
      siteName: site.siteName,
      classification: site.classification,
      sectorType: site.sectorType,
      siteStatus: site.siteStatus,
      privacyUrl: site.privacyUrl,
      contactUrl: site.contactUrl,
      emails: site.emails,
    },
    latestScan: latestScan ? {
      date: latestScan.createdAt,
      overallScore: latestScan.overallScore,
      complianceStatus: latestScan.complianceStatus,
      rating: latestScan.rating,
      summary: latestScan.summary,
      recommendations: latestScan.recommendations,
    } : null,
    clauses,
    totalScans: scans?.length || 0,
    complianceSummary: `${site.siteName} (${site.domain}): ${compliantCount}/8 بنود ممتثلة | النتيجة: ${latestScan?.overallScore || 0}% | الحالة: ${latestScan?.complianceStatus || 'لم يتم الفحص'}`,
  });
}

async function toolGetSiteScanHistory(args: Record<string, any>): Promise<string> {
  const result = await db.getSiteComplianceHistory(args.siteId);
  const history = (result as any)?.history || result;
  if (!history || !Array.isArray(history) || history.length === 0) {
    return JSON.stringify({ error: "لا يوجد سجل فحوصات لهذا الموقع", siteId: args.siteId });
  }
  return JSON.stringify({
    siteId: args.siteId,
    totalScans: history.length,
    scans: history.slice(0, 20).map((s: any) => ({
      date: s.scanDate || s.createdAt,
      score: s.overallScore,
      status: s.complianceStatus,
      rating: s.rating,
    })),
  });
}

async function toolGetClauseStats(): Promise<string> {
  const stats = await db.getClauseStats();
  const clauseNames = [
    "سياسة الخصوصية", "سياسة الكوكيز", "تشفير البيانات (SSL/TLS)",
    "نموذج جمع البيانات", "حقوق أصحاب البيانات", "مسؤول حماية البيانات (DPO)",
    "الإفصاح عن مشاركة البيانات", "الاحتفاظ بالبيانات"
  ];
  return JSON.stringify({
    clauses: stats.map((s: any, i: number) => ({
      clauseNum: i + 1,
      name: clauseNames[i],
      compliantCount: s.compliant,
      nonCompliantCount: s.nonCompliant,
      complianceRate: s.total > 0 ? Math.round((s.compliant / s.total) * 100) : 0,
    })),
  });
}

async function toolGetClauseDetail(args: Record<string, any>): Promise<string> {
  const result = await db.getClauseDetail(args.clauseNum, {
    compliant: args.compliant,
    limit: Math.min(args.limit || 10, 20),
    page: 1,
  });
  return JSON.stringify(result);
}

async function toolGetSectorCompliance(): Promise<string> {
  const data = await db.getSectorCompliance();
  return JSON.stringify(data);
}

async function toolGetLeadershipStats(): Promise<string> {
  const stats = await db.getLeadershipStats();
  return JSON.stringify(stats);
}

async function toolGetRecentScans(args: Record<string, any>): Promise<string> {
  const scans = await db.getRecentScans(Math.min(args.limit || 10, 20));
  return JSON.stringify({
    scans: scans.map((s: any) => ({
      id: s.id,
      domain: s.domain,
      score: s.overallScore,
      status: s.complianceStatus,
      rating: s.rating,
      date: s.createdAt,
    })),
  });
}

async function toolGetMembers(): Promise<string> {
  const members = await db.getMembers();
  return JSON.stringify({
    total: members.length,
    members: members.map((m: any) => ({
      id: m.id,
      username: m.username,
      displayName: m.displayName,
      email: m.email,
      mobile: m.mobile,
      role: m.role,
      rasidRole: m.rasidRole,
      lastSignedIn: m.lastSignedIn,
    })),
  });
}

async function toolGetCases(args: Record<string, any>): Promise<string> {
  try {
    const dbInstance = await db.getDb();
    const { cases: casesTable } = await import("../drizzle/schema");
    const { desc, eq, sql } = await import("drizzle-orm");
    
    if (!dbInstance) return JSON.stringify({ error: 'Database not available' });
    const rows = await dbInstance.select().from(casesTable).orderBy(desc(casesTable.createdAt)).limit(Math.min(args.limit || 20, 50));
    
    return JSON.stringify({
      total: rows.length,
      cases: rows.map((c: any) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        stage: c.stage,
        priority: c.priority,
        createdAt: c.createdAt,
      })),
    });
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}

async function toolGetLetters(args: Record<string, any>): Promise<string> {
  const result = await db.getLetters({
    status: args.status,
    limit: Math.min(args.limit || 20, 50),
    page: 1,
  });
  return JSON.stringify(result);
}

async function toolGetScanSchedules(): Promise<string> {
  try {
    const dbInstance = await db.getDb();
    const { scanSchedules } = await import("../drizzle/schema");
    const { desc } = await import("drizzle-orm");
    
    if (!dbInstance) return JSON.stringify({ error: 'Database not available' });
    const schedules = await dbInstance.select().from(scanSchedules).orderBy(desc(scanSchedules.createdAt)).limit(20);
    return JSON.stringify({
      total: schedules.length,
      schedules: schedules.map((s: any) => ({
        id: s.id,
        name: s.name,
        frequency: s.frequency,
        targetType: s.targetType,
        isActive: s.isActive,
        lastRun: s.lastRun,
        nextRun: s.nextRun,
      })),
    });
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}

async function toolGetEscalationStats(): Promise<string> {
  try {
    const dbInstance = await db.getDb();
    const { escalationRules, escalationLogs } = await import("../drizzle/schema");
    const { count, eq } = await import("drizzle-orm");
    
    if (!dbInstance) return JSON.stringify({ error: 'Database not available' });
    const rules = await dbInstance.select().from(escalationRules).limit(20);
    const [logCount] = await dbInstance.select({ count: count() }).from(escalationLogs);
    
    return JSON.stringify({
      totalRules: rules.length,
      activeRules: rules.filter((r: any) => r.isActive).length,
      totalEscalations: logCount?.count || 0,
      rules: rules.map((r: any) => ({
        id: r.id,
        name: r.name,
        fromStage: r.fromStage,
        toStage: r.toStage,
        maxHours: r.maxHours,
        isActive: r.isActive,
      })),
    });
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}

async function toolGetNotifications(userId: number, args: Record<string, any>): Promise<string> {
  const notifications = await db.getUserNotifications(userId);
  const limited = notifications.slice(0, Math.min(args.limit || 10, 20));
  return JSON.stringify({
    total: notifications.length,
    unread: notifications.filter((n: any) => !n.isRead).length,
    notifications: limited.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
    })),
  });
}

async function toolGetActivityLogs(args: Record<string, any>): Promise<string> {
  const result = await db.getActivityLogs({
    limit: Math.min(args.limit || 20, 50),
    action: args.action,
    page: 1,
  });
  return JSON.stringify(result);
}

async function toolGetClassificationStats(): Promise<string> {
  const stats = await db.getClassificationStats();
  return JSON.stringify(stats);
}

async function toolGetBulkAnalysisJobs(): Promise<string> {
  const jobs = await db.listBulkAnalysisJobs(20);
  return JSON.stringify({
    total: jobs.length,
    jobs: jobs.map((j: any) => ({
      id: j.id,
      name: j.name,
      status: j.status,
      totalUrls: j.totalUrls,
      analyzedUrls: j.analyzedUrls,
      compliantCount: j.compliantCount,
      nonCompliantCount: j.nonCompliantCount,
      createdAt: j.createdAt,
    })),
  });
}

async function toolGetDocumentStats(): Promise<string> {
  try {
    const stats = await db.getDocumentStats();
    return JSON.stringify(stats);
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}

async function toolGetLetterStats(): Promise<string> {
  try {
    const stats = await db.getLetterStats();
    return JSON.stringify(stats);
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}
