/**
 * Domain Isolation Module
 * عزل المجال - GOV-01, GOV-02, GOV-03, API-01, API-02
 *
 * Ensures leaks assistant and privacy assistant are logically and operationally
 * separate. No sharing of training data, memory, knowledge, or RAG indices.
 */

export type Domain = 'leaks' | 'privacy';

// ═══ Tool Access Control ═══
const LEAKS_ONLY_TOOLS = new Set([
  'query_leaks', 'get_leak_details', 'get_dashboard_stats',
  'get_channels_info', 'get_monitoring_status', 'get_sellers_info',
  'get_evidence_info', 'get_threat_rules_info', 'analyze_trends',
  'get_correlations', 'analyze_atlas_trends', 'create_leak',
  'scan_direct', 'scan_pii', 'create_monitoring_case',
  'query_monitoring_cases', 'get_case_details',
  'get_dark_web_listings', 'get_paste_entries',
]);

const PRIVACY_ONLY_TOOLS = new Set([
  'get_compliance_summary', 'get_privacy_assessments',
  'get_policy_versions', 'compare_policies',
  'search_sites', 'get_site_details', 'get_site_scan_history',
  'get_clause_stats', 'get_clause_detail', 'get_sector_compliance',
  'get_leadership_stats', 'perform_scan',
  'get_privacy_policies', 'get_dsar_requests',
  'get_processing_records', 'get_privacy_impact_assessments',
  'get_consent_records', 'get_compliance_dashboard',
  'get_pdpl_article_info', 'get_entities_compliance_status',
]);

const SHARED_TOOLS = new Set([
  'search_knowledge_base', 'get_platform_guide',
  'get_reports_and_documents', 'get_activity_logs',
  'get_audit_log', 'get_platform_users_info',
  'get_system_health', 'create_report', 'create_alert_contact',
  'create_alert_rule', 'get_page_context', 'search_glossary',
  'start_live_guide', 'list_guides', 'guide_step_action',
  'manage_task_memory', 'do_it_for_me', 'rollback_action',
]);

/**
 * Get the list of allowed tools for a given domain
 */
export function getToolsForDomain(domain: Domain): string[] {
  const domainTools = domain === 'leaks' ? LEAKS_ONLY_TOOLS : PRIVACY_ONLY_TOOLS;
  return [...domainTools, ...SHARED_TOOLS];
}

/**
 * Check if a tool is allowed for the specified domain
 */
export function isToolAllowedForDomain(toolName: string, domain: Domain): boolean {
  if (SHARED_TOOLS.has(toolName)) return true;
  if (domain === 'leaks') return LEAKS_ONLY_TOOLS.has(toolName);
  if (domain === 'privacy') return PRIVACY_ONLY_TOOLS.has(toolName);
  return false;
}

/**
 * Domain Guard - validates domain access and prevents cross-domain access
 * Returns an error message if the access is denied, null if allowed
 */
export function domainGuard(requestedTool: string, domain: Domain): string | null {
  if (isToolAllowedForDomain(requestedTool, domain)) return null;

  const otherDomain = domain === 'leaks' ? 'privacy' : 'leaks';
  const otherDomainTools = otherDomain === 'leaks' ? LEAKS_ONLY_TOOLS : PRIVACY_ONLY_TOOLS;

  if (otherDomainTools.has(requestedTool)) {
    return `الأداة "${requestedTool}" تنتمي لمجال ${otherDomain === 'leaks' ? 'التسربات' : 'الخصوصية'} ولا يمكن استخدامها في مجال ${domain === 'leaks' ? 'التسربات' : 'الخصوصية'}. يرجى استخدام المساعد المناسب.`;
  }

  return `الأداة "${requestedTool}" غير معرّفة أو غير متاحة في هذا المجال.`;
}

// ═══ Naming Policy Enforcement (NAME-01 to NAME-08) ═══

interface NamingCorrection {
  forbidden: string;
  correct: string;
  explanation: string;
}

const NAMING_CORRECTIONS: NamingCorrection[] = [
  { forbidden: 'حادثة تسرب', correct: 'حالة رصد', explanation: 'لا يُؤكد التسرب قبل التحقق الرسمي' },
  { forbidden: 'حادثة تسريب', correct: 'حالة رصد', explanation: 'مصطلح محظور قبل التحقق' },
  { forbidden: 'تسرب بيانات شخصية', correct: 'حالة رصد', explanation: 'يُستخدم فقط بعد التحقق الكامل' },
  { forbidden: 'حادثة', correct: 'حالة رصد', explanation: 'المصطلح المعتمد هو حالة رصد' },
  { forbidden: 'عدد السجلات المسربة', correct: 'العدد المُدّعى', explanation: 'هو ادعاء من البائع/الناشر وليس تحققاً' },
  { forbidden: 'عدد السجلات', correct: 'العدد المُدّعى', explanation: 'يجب استخدام العدد المُدّعى لأنه ادعاء' },
  { forbidden: 'السجلات المجمعة', correct: 'العينات المتاحة', explanation: 'ما تم توثيقه فعلياً داخل المنصة' },
  { forbidden: 'البيانات المسربة', correct: 'العينات المتاحة', explanation: 'المصطلح المعتمد هو العينات المتاحة' },
];

/**
 * Check text for forbidden naming terms and return corrections
 * Used by AI prompt to auto-correct user messages (NAME-07)
 */
export function checkNamingPolicy(text: string): NamingCorrection[] {
  const found: NamingCorrection[] = [];
  for (const correction of NAMING_CORRECTIONS) {
    if (text.includes(correction.forbidden)) {
      found.push(correction);
    }
  }
  return found;
}

/**
 * Apply naming corrections to response text
 * Used in AI responses and reports (NAME-07, NAME-08)
 */
export function enforceNamingPolicy(text: string): string {
  let result = text;
  for (const correction of NAMING_CORRECTIONS) {
    result = result.replaceAll(correction.forbidden, correction.correct);
  }
  return result;
}

/**
 * Get the naming policy rules as a prompt section for the AI
 */
export function getNamingPolicyPrompt(): string {
  return `
## قواعد سياسة التسمية الإلزامية (NAME-01 إلى NAME-08):

### المصطلحات المعتمدة:
1. **«حالة رصد»** — التسمية الافتراضية لأي ادعاء بوجود تسرب بيانات شخصية. لا تستخدم أبداً: حادثة تسرب، حادثة تسريب، تسرب بيانات.
2. **«العدد المُدّعى»** — أي رقم يذكره البائع/الناشر عن عدد السجلات. لا تستخدم أبداً: عدد السجلات المسربة، عدد السجلات.
3. **«العينات المتاحة»** — ما تم جمعه وتوثيقه داخل المنصة. لا تستخدم أبداً: السجلات المجمعة، البيانات المسربة.

### مراحل الحالة المعتمدة:
حالة رصد (افتراضي) → قيد التحقق → تسرب مؤكد (بعد التحقق فقط) → مغلق

### قواعد التصحيح:
- إذا استخدم المستخدم مصطلحاً قديماً/محظوراً، صحّحه بلطف مع شرح السبب.
- لا تصف أي حالة بـ «تسرب مؤكد» إلا إذا كانت حالتها في النظام = «تسرب مؤكد».
- في التقارير والتصديرات: أوضح أن «العدد المُدّعى» هو ادعاء مع ذكر مصدره.
`;
}

// ═══ Page Context Pack (UI-06, UI-07) ═══

export interface PageContextPack {
  route: string;
  pageId: string;
  activeFilters: Record<string, any>;
  currentEntityId?: number;
  currentEntityType?: string;
  availableActions: string[];
  userRole: string;
  featureFlags: Record<string, boolean>;
  domain: Domain;
}

/**
 * Validate and normalize a page context pack
 */
export function validatePageContext(ctx: Partial<PageContextPack>): PageContextPack {
  return {
    route: ctx.route || '/',
    pageId: ctx.pageId || 'unknown',
    activeFilters: ctx.activeFilters || {},
    currentEntityId: ctx.currentEntityId,
    currentEntityType: ctx.currentEntityType,
    availableActions: ctx.availableActions || [],
    userRole: ctx.userRole || 'viewer',
    featureFlags: ctx.featureFlags || {},
    domain: ctx.domain || 'leaks',
  };
}

// ═══ Status Constants ═══

export const CASE_STATUSES = ['حالة رصد', 'قيد التحقق', 'تسرب مؤكد', 'مغلق'] as const;
export type CaseStatus = typeof CASE_STATUSES[number];

// ═══ Domain Labels ═══

export const DOMAIN_LABELS: Record<Domain, { ar: string; en: string }> = {
  leaks: { ar: 'منصة التسربات', en: 'Leaks Platform' },
  privacy: { ar: 'منصة الخصوصية', en: 'Privacy Platform' },
};

/**
 * Get domain from the current route/page
 */
export function getDomainFromRoute(route: string): Domain {
  if (route.startsWith('/privacy') || route.startsWith('/compliance') || route.startsWith('/pdpl')) {
    return 'privacy';
  }
  return 'leaks';
}

// ═══ Audit Logging Helper (SEC-01) ═══

export interface AuditEntry {
  domain: Domain;
  action: string;
  toolName?: string;
  userId: number;
  result: 'success' | 'failure' | 'denied';
  domainViolation: boolean;
  details?: Record<string, any>;
  before?: any;
  after?: any;
}

/**
 * Create an audit log entry for AI operations
 */
export function createAuditEntry(params: Omit<AuditEntry, 'domainViolation'> & { domainViolation?: boolean }): AuditEntry {
  return {
    ...params,
    domainViolation: params.domainViolation ?? false,
  };
}
