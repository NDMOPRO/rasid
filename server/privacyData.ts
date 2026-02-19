/**
 * Privacy & Compliance Data Functions
 * Provides data for the privacy platform tools in rasidAI
 */

export async function getPrivacyAssessments(entityId?: number, status?: string) {
  try {
    const data = [
      { id: 1, entityName: "وزارة الصحة", sector: "صحي", complianceScore: 78, status: "completed", lastAssessment: "2026-01-15", gaps: 5, recommendations: 12 },
      { id: 2, entityName: "البنك الأهلي", sector: "بنكي", complianceScore: 92, status: "completed", lastAssessment: "2026-02-01", gaps: 2, recommendations: 4 },
      { id: 3, entityName: "جامعة الملك سعود", sector: "تعليمي", complianceScore: 65, status: "in_progress", lastAssessment: "2025-12-20", gaps: 8, recommendations: 18 },
      { id: 4, entityName: "شركة الاتصالات", sector: "اتصالات", complianceScore: 85, status: "completed", lastAssessment: "2026-01-28", gaps: 3, recommendations: 7 },
      { id: 5, entityName: "وزارة التعليم", sector: "حكومي", complianceScore: 71, status: "in_progress", lastAssessment: "2026-02-10", gaps: 6, recommendations: 14 },
      { id: 6, entityName: "شركة أرامكو", sector: "طاقة", complianceScore: 95, status: "completed", lastAssessment: "2026-02-05", gaps: 1, recommendations: 2 },
    ];
    return data.filter(a => (!entityId || a.id === entityId) && (!status || a.status === status));
  } catch { return []; }
}

export async function getPrivacyPolicies(entityId?: number, status?: string) {
  try {
    const data = [
      { id: 1, entityName: "وزارة الصحة", policyName: "سياسة خصوصية المرضى", status: "active", version: "2.1", lastReview: "2026-01-10", coverage: 85 },
      { id: 2, entityName: "البنك الأهلي", policyName: "سياسة خصوصية العملاء", status: "active", version: "3.0", lastReview: "2026-02-05", coverage: 95 },
      { id: 3, entityName: "جامعة الملك سعود", policyName: "سياسة خصوصية الطلاب", status: "under_review", version: "1.5", lastReview: "2025-11-15", coverage: 60 },
      { id: 4, entityName: "شركة الاتصالات", policyName: "سياسة خصوصية المشتركين", status: "active", version: "2.8", lastReview: "2026-01-20", coverage: 90 },
    ];
    return data.filter(p => (!entityId || p.id === entityId) && (!status || p.status === status));
  } catch { return []; }
}

export async function getDsarRequests(status?: string, requestType?: string) {
  try {
    const data = [
      { id: 1, requesterName: "أحمد محمد", entityName: "البنك الأهلي", type: "access", status: "completed", submittedAt: "2026-02-10", respondedAt: "2026-02-12", daysToRespond: 2 },
      { id: 2, requesterName: "فاطمة علي", entityName: "وزارة الصحة", type: "deletion", status: "in_progress", submittedAt: "2026-02-15", respondedAt: null, daysToRespond: null },
      { id: 3, requesterName: "خالد سعد", entityName: "شركة الاتصالات", type: "correction", status: "pending", submittedAt: "2026-02-18", respondedAt: null, daysToRespond: null },
      { id: 4, requesterName: "نورة فهد", entityName: "جامعة الملك سعود", type: "portability", status: "overdue", submittedAt: "2026-01-20", respondedAt: null, daysToRespond: null },
      { id: 5, requesterName: "سارة عبدالله", entityName: "شركة أرامكو", type: "access", status: "completed", submittedAt: "2026-02-08", respondedAt: "2026-02-09", daysToRespond: 1 },
    ];
    return data.filter(r => (!status || r.status === status) && (!requestType || r.type === requestType));
  } catch { return []; }
}

export async function getProcessingRecords(entityId?: number, lawfulBasis?: string) {
  try {
    const data = [
      { id: 1, entityName: "وزارة الصحة", purpose: "تقديم الخدمات الصحية", dataCategories: ["بيانات صحية", "هوية"], lawfulBasis: "legal_obligation", retentionPeriod: "10 سنوات", thirdParties: ["شركات التأمين"] },
      { id: 2, entityName: "البنك الأهلي", purpose: "فتح حسابات مصرفية", dataCategories: ["هوية", "مالية"], lawfulBasis: "contract", retentionPeriod: "5 سنوات", thirdParties: ["ساما", "سمة"] },
      { id: 3, entityName: "شركة الاتصالات", purpose: "تقديم خدمات الاتصالات", dataCategories: ["هوية", "اتصالات"], lawfulBasis: "contract", retentionPeriod: "3 سنوات", thirdParties: ["هيئة الاتصالات"] },
      { id: 4, entityName: "جامعة الملك سعود", purpose: "إدارة شؤون الطلاب", dataCategories: ["هوية", "أكاديمية"], lawfulBasis: "public_interest", retentionPeriod: "20 سنة", thirdParties: ["وزارة التعليم"] },
    ];
    return data.filter(r => (!entityId || r.id === entityId) && (!lawfulBasis || r.lawfulBasis === lawfulBasis));
  } catch { return []; }
}

export async function getPrivacyImpactAssessments(status?: string, riskLevel?: string) {
  try {
    const data = [
      { id: 1, projectName: "نظام السجلات الصحية الإلكتروني", entityName: "وزارة الصحة", status: "completed", riskLevel: "high", risksIdentified: 8, mitigations: 8, date: "2026-01-20" },
      { id: 2, projectName: "تطبيق الخدمات المصرفية", entityName: "البنك الأهلي", status: "completed", riskLevel: "medium", risksIdentified: 5, mitigations: 5, date: "2026-02-01" },
      { id: 3, projectName: "منصة التعلم الإلكتروني", entityName: "جامعة الملك سعود", status: "in_progress", riskLevel: "high", risksIdentified: 6, mitigations: 3, date: "2026-02-10" },
      { id: 4, projectName: "نظام إدارة المشتركين", entityName: "شركة الاتصالات", status: "completed", riskLevel: "low", risksIdentified: 3, mitigations: 3, date: "2026-01-15" },
    ];
    return data.filter(p => (!status || p.status === status) && (!riskLevel || p.riskLevel === riskLevel));
  } catch { return []; }
}

export async function getConsentRecords(entityId?: number, status?: string) {
  try {
    const data = [
      { id: 1, entityName: "البنك الأهلي", purpose: "التسويق", method: "إلكتروني", status: "active", count: 45000, collectedAt: "2026-01-01" },
      { id: 2, entityName: "شركة الاتصالات", purpose: "تحليل الاستخدام", method: "إلكتروني", status: "active", count: 120000, collectedAt: "2025-12-15" },
      { id: 3, entityName: "وزارة الصحة", purpose: "البحث العلمي", method: "ورقي", status: "active", count: 8500, collectedAt: "2026-01-20" },
    ];
    return data.filter(c => (!entityId || c.id === entityId) && (!status || c.status === status));
  } catch { return []; }
}

export async function getComplianceDashboard() {
  try {
    return {
      overallCompliance: 80,
      totalEntities: 6,
      compliantEntities: 3,
      partiallyCompliant: 2,
      nonCompliant: 1,
      assessmentsCompleted: 4,
      assessmentsPending: 2,
      pendingDSARs: 2,
      overdueDSARs: 1,
      activePolicies: 4,
      expiredPolicies: 0,
      totalProcessingRecords: 4,
      totalConsentRecords: 3,
      recentAlerts: [
        { type: "overdue_dsar", message: "طلب DSAR متأخر: نورة فهد — جامعة الملك سعود", date: "2026-02-18" },
        { type: "low_compliance", message: "نسبة امتثال منخفضة: جامعة الملك سعود (65%)", date: "2026-02-15" },
        { type: "policy_review", message: "سياسة خصوصية الطلاب تحتاج مراجعة", date: "2026-02-12" },
      ],
    };
  } catch {
    return { overallCompliance: 0, totalEntities: 0, info: "بيانات غير متاحة" };
  }
}

export async function getEntitiesComplianceStatus(sector?: string, complianceLevel?: string) {
  try {
    const entities = [
      { id: 1, name: "وزارة الصحة", sector: "صحي", complianceScore: 78, level: "partially_compliant", violations: 2 },
      { id: 2, name: "البنك الأهلي", sector: "بنكي", complianceScore: 92, level: "compliant", violations: 0 },
      { id: 3, name: "جامعة الملك سعود", sector: "تعليمي", complianceScore: 65, level: "non_compliant", violations: 4 },
      { id: 4, name: "شركة الاتصالات", sector: "اتصالات", complianceScore: 85, level: "compliant", violations: 1 },
      { id: 5, name: "وزارة التعليم", sector: "حكومي", complianceScore: 71, level: "partially_compliant", violations: 3 },
      { id: 6, name: "شركة أرامكو", sector: "طاقة", complianceScore: 95, level: "compliant", violations: 0 },
    ];
    return entities.filter(e => (!sector || e.sector === sector) && (!complianceLevel || e.level === complianceLevel));
  } catch { return []; }
}

export function getPdplArticleInfo(articleNumber?: number, topic?: string) {
  const articles: Record<number, { title: string; summary: string; requirements: string[]; penalties: string }> = {
    1: { title: "التعريفات", summary: "تعريف المصطلحات الأساسية في النظام", requirements: ["فهم التعريفات"], penalties: "لا توجد عقوبات مباشرة" },
    5: { title: "مبادئ المعالجة", summary: "المبادئ الأساسية لمعالجة البيانات الشخصية", requirements: ["الشفافية", "تحديد الغرض", "تقليل البيانات", "الدقة", "التخزين المحدود"], penalties: "غرامة حتى 5 مليون ريال" },
    6: { title: "الموافقة", summary: "شروط الحصول على موافقة صاحب البيانات", requirements: ["موافقة صريحة", "حرية الاختيار", "إمكانية السحب"], penalties: "غرامة حتى 5 مليون ريال" },
    10: { title: "حقوق صاحب البيانات", summary: "حقوق الوصول والتصحيح والحذف والنقل", requirements: ["حق الوصول", "حق التصحيح", "حق الحذف", "حق النقل", "حق الاعتراض"], penalties: "غرامة حتى 5 مليون ريال" },
    14: { title: "الإفصاح عن التسريبات", summary: "واجب الإبلاغ عن تسريبات البيانات الشخصية", requirements: ["إبلاغ الجهة المختصة خلال 72 ساعة", "إبلاغ أصحاب البيانات المتأثرين", "توثيق التسريب"], penalties: "غرامة حتى 5 مليون ريال + سجن حتى سنتين" },
    22: { title: "تقييم الأثر", summary: "إجراء تقييم أثر على الخصوصية للمعالجة عالية المخاطر", requirements: ["تقييم المخاطر", "إجراءات التخفيف", "المراجعة الدورية"], penalties: "غرامة حتى 3 مليون ريال" },
    29: { title: "النقل الدولي", summary: "شروط نقل البيانات الشخصية خارج المملكة", requirements: ["مستوى حماية كافٍ", "ضمانات مناسبة", "موافقة صاحب البيانات"], penalties: "غرامة حتى 5 مليون ريال" },
    32: { title: "مسؤول حماية البيانات", summary: "تعيين مسؤول حماية البيانات الشخصية", requirements: ["تعيين DPO", "الاستقلالية", "الصلاحيات الكافية"], penalties: "غرامة حتى 1 مليون ريال" },
    36: { title: "العقوبات", summary: "العقوبات المقررة على المخالفات", requirements: ["الالتزام بأحكام النظام"], penalties: "غرامات مالية + سجن + تشهير + إيقاف نشاط" },
  };

  if (articleNumber && articles[articleNumber]) {
    return articles[articleNumber];
  }
  if (topic) {
    const topicLower = topic.toLowerCase();
    const matches = Object.entries(articles).filter(([_, a]) =>
      a.title.includes(topic) || a.summary.includes(topic) || a.requirements.some(r => r.includes(topic))
    );
    if (matches.length > 0) return Object.fromEntries(matches);
  }
  return articles;
}

export async function analyzeLeakComplianceImpact(leakId: number, entityId?: number) {
  // Simulated cross-platform analysis
  return {
    leakId,
    entityId: entityId || 1,
    entityName: "وزارة الصحة",
    impactAnalysis: {
      pdplViolations: [
        { article: 14, title: "الإفصاح عن التسريبات", status: "مخالفة محتملة", details: "يجب الإبلاغ خلال 72 ساعة" },
        { article: 5, title: "مبادئ المعالجة", status: "مخالفة", details: "عدم كفاية إجراءات الحماية" },
      ],
      complianceImpact: {
        beforeLeak: 78,
        afterLeak: 62,
        drop: 16,
        newLevel: "non_compliant",
      },
      requiredActions: [
        "إبلاغ الجهة المختصة فوراً (المادة 14)",
        "إبلاغ أصحاب البيانات المتأثرين",
        "توثيق التسريب وإجراءات الاحتواء",
        "مراجعة إجراءات الحماية التقنية",
        "تحديث تقييم الأثر على الخصوصية",
      ],
      estimatedPenalty: "غرامة حتى 5 مليون ريال + احتمال سجن حتى سنتين",
      affectedDataSubjects: 15000,
      dataCategories: ["بيانات صحية", "هوية وطنية", "معلومات اتصال"],
    },
  };
}
