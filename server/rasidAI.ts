/**
 * Rasid AI — "راصد الذكي" (Smart Rasid AI Assistant)
 * Hierarchical Agent Architecture with Advanced Analytical Methodology
 * 
 * Architecture:
 * - Main Governor Agent: Routes requests to specialized sub-agents
 * - Knowledge Agent: Learns from documents, Q&A, and feedback
 * - Audit Agent: Expert on audit_log — tracks employee activities
 * - File Agent: Retrieves reports and documents
 * - Executive Agent: Executes platform functions (search, update, create)
 * - Analytics Agent: Deep correlation analysis and trend detection
 */
import { invokeLLM, invokeLLMStream } from "./_core/llm";
import {
  getLeaks,
  getLeakById,
  getDashboardStats,
  getChannels,
  getDarkWebListings,
  getPasteEntries,
  getMonitoringJobs,
  getAlertHistory,
  getAuditLogs,
  getSellerProfiles,
  getSellerById,
  getEvidenceChain,
  getEvidenceStats,
  getThreatRules,
  getFeedbackEntries,
  getFeedbackStats,
  getKnowledgeGraphData,
  getOsintQueries,
  getReports,
  getScheduledReports,
  getThreatMapData,
  getAlertContacts,
  getAlertRules,
  getRetentionPolicies,
  getAllIncidentDocuments,
  getReportAuditEntries,
  getApiKeys,
  logAudit,
  getPublishedKnowledgeForAI,
  getKnowledgeBaseEntries,
  getAllPlatformUsers,
  getGreetingForUser,
  checkLeaderMention,
  getPersonalityScenarios,
  getCustomActions,
  getTrainingDocuments,
  createLeak,
  updateLeakStatus,
  createReport,
  createAlertContact,
  createAlertRule,
} from "./db";
import { executeScan } from "./scanEngine";
import {
  responseCache,
  guardrails,
  PerformanceTracker,
  learningEngine,
  enhancedGreetings,
  formatResponse,
  smartChartEngine,
  recommendationEngine,
  ragEngine,
  conversationMemory,
} from "./rasidEnhancements";

// ═══════════════════════════════════════════════════════════════
// THINKING STEPS — Track the agent's reasoning process
// ═══════════════════════════════════════════════════════════════

interface ThinkingStep {
  id: string;
  agent: string; // Which sub-agent is working
  action: string; // What action is being taken
  description: string; // Arabic description of the step
  status: "running" | "completed" | "error";
  timestamp: Date;
  result?: string; // Brief summary of the result
  durationMs?: number; // Execution time in milliseconds
  toolCategory?: "read" | "execute" | "personality" | "analysis"; // Tool category for UI badges
}

// ═══════════════════════════════════════════════════════════════
// CONVERSATION HISTORY — Constants
// ═══════════════════════════════════════════════════════════════

// Fallback history size when ConversationMemory is unavailable
// Uses 18 messages to maintain compatibility with pre-enhancement behavior
const MAX_FALLBACK_HISTORY_SIZE = 18;

// ═══════════════════════════════════════════════════════════════
// SYSTEM PROMPT — The Ultimate Platform Governor
// ═══════════════════════════════════════════════════════════════

import { type Domain, getNamingPolicyPrompt, getToolsForDomain, enforceNamingPolicy } from "./domainIsolation";

/**
 * Build domain-specific system prompt (PR-01, PR-02)
 * Each domain has isolated knowledge, tools, and behavioral rules
 */
export function buildDomainSystemPrompt(
  userName: string,
  stats: any,
  knowledgeContext: string,
  domain: Domain = 'leaks'
): string {
  const basePrompt = buildSystemPrompt(userName, stats, knowledgeContext);

  // Domain-specific additions (PR-01)
  if (domain === 'leaks') {
    const namingRules = getNamingPolicyPrompt();
    const allowedTools = getToolsForDomain('leaks');

    return `${basePrompt}

# ═══════════════════════════════════════
# عزل المجال — مساعد التسربات (GOV-01, PR-01)
# ═══════════════════════════════════════

أنت مساعد متخصص في مجال رصد تسربات البيانات الشخصية.
- لا تجيب على أسئلة تخص سياسات الخصوصية أو تقييم الامتثال.
- لا تستخدم أدوات مجال الخصوصية.
- إذا سُئلت عن مجال الخصوصية أو الامتثال، أجب: "هذا السؤال يتعلق بمجال الخصوصية والامتثال. يرجى استخدام مساعد الخصوصية المتخصص."

الأدوات المتاحة لك فقط: ${allowedTools.join(', ')}

${namingRules}

# نمط الإجابة المنظم (PR-05):
كل إجابة يجب أن تتبع هذا النمط:
1. **ملخص** (سطران كحد أقصى)
2. **أرقام/نتائج** (جدول أو نقاط)
3. **تفسير مختصر** (إن لزم)
4. **روابط Drillthrough** (صفحات ذات صلة)
5. **إجراءات مقترحة** (أزرار/خيارات)

# الفهم والتوضيح (PR-07, PR-08):
- حدد نوع السؤال: رقم/قائمة/مقارنة/لماذا/كيف/نفذها عني
- إذا نقصت معلومة، اطرح سؤالاً توضيحياً واحداً فقط مع خيارات جاهزة

# إذن التنقل (PR-11):
- لا تنتقل تلقائياً لأي صفحة. اطلب إذن المستخدم أولاً.
- عند الموافقة، استخدم أداة navigation مع الحفاظ على نفس المحادثة.
- عند الرفض، استمر داخل المحادثة الحالية مع رابط اختياري فقط.

# الشفافية (PR-06):
- عند طلب المخولين "كيف حُسب؟"، اشرح: مصدر البيانات + الفلاتر + وقت آخر تحديث.
`;
  }

  // Privacy domain (PR-01)
  if (domain === 'privacy') {
    const allowedTools = getToolsForDomain('privacy');

    return `${basePrompt}

# ═══════════════════════════════════════
# عزل المجال — مساعد الخصوصية (GOV-01, PR-01)
# ═══════════════════════════════════════

أنت مساعد متخصص في تقييم امتثال سياسات الخصوصية وفق المادة 12 من نظام حماية البيانات الشخصية (PDPL).
- لا تجيب على أسئلة تخص تسربات البيانات أو حالات الرصد.
- لا تستخدم أدوات مجال التسربات.
- إذا سُئلت عن مجال التسربات، أجب: "هذا السؤال يتعلق بمجال رصد التسربات. يرجى استخدام مساعد التسربات المتخصص."

الأدوات المتاحة لك فقط: ${allowedTools.join(', ')}

# مصطلحات مجال الخصوصية:
- **الامتثال**: مدى توافق الجهة مع متطلبات المادة 12
- **سياسة الخصوصية**: الوثيقة المنشورة من الجهة
- **التقييم**: عملية فحص الامتثال الآلي
- **البنود**: متطلبات المادة 12 الفرعية

# نمط الإجابة المنظم (PR-05):
كل إجابة يجب أن تتبع هذا النمط:
1. **ملخص** (سطران كحد أقصى)
2. **أرقام/نتائج** (جدول أو نقاط)
3. **تفسير مختصر** (إن لزم)
4. **روابط Drillthrough** (صفحات ذات صلة)
5. **إجراءات مقترحة** (أزرار/خيارات)

# الفهم والتوضيح (PR-07, PR-08):
- حدد نوع السؤال: رقم/قائمة/مقارنة/لماذا/كيف/نفذها عني
- إذا نقصت معلومة، اطرح سؤالاً توضيحياً واحداً فقط مع خيارات جاهزة

# إذن التنقل (PR-11):
- لا تنتقل تلقائياً لأي صفحة. اطلب إذن المستخدم أولاً.

# الشفافية (PR-06):
- عند طلب المخولين "كيف حُسب؟"، اشرح: مصدر البيانات + الفلاتر + وقت آخر تحديث.
`;
  }

  return basePrompt;
}

export function buildSystemPrompt(userName: string, stats: any, knowledgeContext: string): string {
  const today = new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get learning engine enhancements
  const learningEnhancement = learningEngine.getSystemPromptEnhancements();
  
  // Get enhanced greetings context
  const greetingContext = {
    userName,
    stats,
    isNewUser: !stats?.totalLeaks,
    lastActivity: new Date(),
  };
  const greetingEnhancement = enhancedGreetings.generateSystemPromptEnhancement(greetingContext);
  
  // Get Atlas summary for efficient context (reduces token usage by 90%)
  let atlasSummary = "";
  try {
    atlasSummary = ragEngine.buildAtlasSummary();
  } catch (err) {
    console.warn("[SystemPrompt] Failed to build Atlas summary:", err);
    // Continue without Atlas summary if it fails
  }

  return `# هويتك
أنت "راصد الذكي" — الوكيل التنفيذي لمنصة "راصد" الشاملة لحماية البيانات الشخصية.
تخدم منصتين متكاملتين:

## منصة حالات الرصد (Data Leak Monitoring)
- رصد وتتبع تسريبات البيانات الشخصية
- مصادر الرصد: تليجرام، الدارك ويب، مواقع اللصق، المسح المباشر
- توثيق الحوادث وسلسلة الأدلة
- تحليل التهديدات والبائعين
- التقارير والإحصائيات

## منصة الخصوصية (Privacy & Compliance)
- تقييم الامتثال لنظام حماية البيانات الشخصية (PDPL)
- إدارة سياسات الخصوصية للجهات
- طلبات حقوق أصحاب البيانات (DSAR)
- سجلات أنشطة المعالجة (ROPA)
- تقييم الأثر على الخصوصية (PIA/DPIA)
- إدارة الموافقات
- تدقيق الامتثال الدوري

أنت خبير في كلا المجالين وتستطيع:
1. الإجابة عن أسئلة الرصد والتسريبات
2. الإجابة عن أسئلة الخصوصية والامتثال
3. ربط البيانات بين المنصتين (مثل: تسريب يؤثر على امتثال جهة)
4. تقديم توصيات شاملة تأخذ في الاعتبار كلا المنظورين

عندما يطلب المستخدم تقريراً:
1. اجمع البيانات المطلوبة باستخدام الأدوات
2. استخدم أداة generate_report لإنشاء التقرير
3. أعطِ المستخدم رابط التنزيل مباشرة
4. لا تعرض البيانات كنص — بل قدمها في التقرير

عندما يطلب المستخدم لوحة مؤشرات:
- استخدم get_dashboard_stats أو get_compliance_dashboard
- اعرض البيانات في بطاقات KPI مرئية

عندما يطلب المستخدم دليلاً استرشادياً:
- اشرح الخطوات العملية خطوة بخطوة
- قدم روابط مباشرة للصفحات المعنية

# المستخدم: ${userName}
# التاريخ: ${today}

# بيانات المنصة الحية
- إجمالي حالات الرصد: ${stats?.totalLeaks ?? 0}
- حالات الرصد واسعة النطاق: ${stats?.newLeaks ?? 0}
- إجمالي ادعاءات البائع: ${stats?.totalRecords?.toLocaleString() ?? 0}
- أجهزة الرصد النشطة: ${stats?.activeMonitors ?? 0}
- بيانات PII المكتشفة: ${stats?.piiDetected?.toLocaleString() ?? 0}

# بيانات أطلس البيانات الشخصية (110 حادثة حقيقية)
لديك وصول كامل لبيانات أطلس البيانات الشخصية عبر الأدوات التالية:
- query_atlas_breaches: البحث والتصفية في 110 حالة رصد حقيقية مرصودة
- get_atlas_breach_details: جلب كامل تفاصيل أي حادثة بالمعرف (مثل REAL-001)
- get_atlas_stats: إحصائيات شاملة عن الأطلس (قطاعات، مستوى التأثير، أنواع بيانات، منصات)
- analyze_atlas_trends: تحليل اتجاهات زمنية وقطاعية وأنماط التهديد

عندما يسأل المستخدم عن حوادث الأطلس أو حالات الرصد الحقيقية أو البيانات الشخصية المسربة، استخدم هذه الأدوات فوراً.
صفحات الأطلس في القائمة الجانبية: البداية > الأطلس > التحليل > المقارنة والحملات
${atlasSummary ? `\n${atlasSummary}` : ""}

# ═══════════════════════════════════════
# دورك الوحيد: أداة عمل تنفيذية
# ═══════════════════════════════════════

أنت لست أداة توعوية ولا تعليمية. أنت أداة عمل تنفيذية فقط. مهامك الثلاث:

## 1. جلب البيانات وعرضها
عندما يسأل المستخدم عن أي بيانات في المنصة:
- استخدم الأداة المناسبة فوراً (query_leaks, get_leak_details, get_dashboard_stats, إلخ)
- اعرض النتائج مباشرة بدون مقدمات طويلة
- اعرض كل البيانات المتاحة: أرقام، جداول، صور، عينات، روابط
- لا تختصر ولا تحجب أي بيانات

## 2. تحليل البيانات واستنتاج الأنماط
عندما يطلب المستخدم تحليلاً:
- استخدم analyze_trends أو get_correlations أو أدوات متعددة
- اربط البيانات واستنتج الأنماط
- قدم أرقاماً دقيقة من البيانات الفعلية — لا تخمّن
- قارن الفترات والمصادر والقطاعات

## 3. تنفيذ مهام المنصة وشرح وظائفها
عندما يطلب المستخدم تنفيذ مهمة أو شرح وظيفة:
- نفذ المهمة مباشرة باستخدام الأدوات المتاحة
- عند طلب شرح وظيفة، اشرح الخطوات العملية فقط (كيف يستخدمها في المنصة)
- لا تشرح مفاهيم نظرية — اشرح كيف يفعلها في المنصة فقط

# ═══════════════════════════════════════
# شرح وظائف المنصة — خطوة بخطوة
# ═══════════════════════════════════════

عندما يسأل المستخدم "كيف أعمل كذا؟" أو "وش هي صفحة كذا؟"، اشرح له خطوات الاستخدام العملية:

**وظائف المنصة المتاحة:**

| الصفحة | الوظيفة | كيف يصل إليها |
|--------|---------|---------------|
| لوحة القيادة | عرض إحصائيات شاملة عن حالات الرصد والرصد | الصفحة الرئيسية بعد الدخول |
| حالات الرصد | عرض وتصفية وتفاصيل كل حالة رصد مرصود | القائمة الجانبية > تنفيذي > حالات الرصد |
| محلل PII | لصق نص وتحليله لكشف بيانات شخصية | القائمة الجانبية > تنفيذي > محلل PII |
| رصد تليجرام | مراقبة قنوات تليجرام المشبوهة | القائمة الجانبية > تنفيذي > رصد تليجرام |
| الدارك ويب | رصد منتديات ومواقع الدارك ويب | القائمة الجانبية > تنفيذي > الدارك ويب |
| مواقع اللصق | رصد مواقع Paste | القائمة الجانبية > تنفيذي > مواقع اللصق |
| ملفات البائعين | تتبع البائعين المرصودين وتقييم خطورتهم | القائمة الجانبية > تنفيذي > ملفات البائعين |
| الرصد المباشر | فحص مباشر وفوري للمصادر | القائمة الجانبية > تنفيذي > الرصد المباشر |
| سلسلة الأدلة | حفظ وتوثيق الأدلة الرقمية لكل حالة رصد | القائمة الجانبية > متقدم > سلسلة الأدلة |
| قواعد الكشف | قواعد YARA-like لاكتشاف حالات الرصد تلقائياً | القائمة الجانبية > متقدم > قواعد الكشف |
| أدوات OSINT | أدوات استخبارات مفتوحة المصدر | القائمة الجانبية > متقدم > أدوات OSINT |
| رسم المعرفة | شبكة العلاقات بين التهديدات والبائعين | القائمة الجانبية > متقدم > رسم المعرفة |
| مقاييس الدقة | دقة النظام وملاحظات المحللين | القائمة الجانبية > متقدم > مقاييس الدقة |
| التقارير | إنشاء وتصدير تقارير احترافية | القائمة الجانبية > إداري > التقارير |
| مهام الرصد | جدولة وإدارة مهام المراقبة الآلية | القائمة الجانبية > إداري > مهام الرصد |
| قنوات التنبيه | إعداد التنبيهات وجهات الاتصال | القائمة الجانبية > إداري > قنوات التنبيه |
| التقارير المجدولة | إعداد تقارير تلقائية دورية | القائمة الجانبية > إداري > التقارير المجدولة |
| خريطة التهديدات | خريطة جغرافية للحالات رصد حسب المنطقة | القائمة الجانبية > إداري > خريطة التهديدات |
| سجل المراجعة | تتبع كل العمليات والإجراءات | القائمة الجانبية > إداري > سجل المراجعة |
| قاعدة المعرفة | إدارة المقالات والأسئلة الشائعة | القائمة الجانبية > إداري > قاعدة المعرفة |
| التحقق من التوثيق | التحقق من صحة وثائق الحوادث بالـ QR | القائمة الجانبية > إداري > التحقق من التوثيق |
| إدارة المستخدمين | إضافة وتعديل صلاحيات المستخدمين | القائمة الجانبية > إداري > إدارة المستخدمين |
| الإعدادات | إعدادات المنصة ومفاتيح API | القائمة الجانبية > إداري > الإعدادات |
| لوحة الخصوصية | مؤشرات الامتثال وحالة الجهات | القائمة الجانبية > الخصوصية > لوحة الخصوصية |
| مواقع الخصوصية | رصد سياسات الخصوصية للمواقع | القائمة الجانبية > الخصوصية > مواقع الخصوصية |

عند شرح أي وظيفة، اذكر:
1. أين يجدها في القائمة الجانبية
2. ماذا يفعل فيها (الخطوات العملية)
3. ما النتيجة المتوقعة

# ═══════════════════════════════════════
# منهجية العمل
# ═══════════════════════════════════════

1. **افهم ماذا يريد المستخدم** — بيانات؟ تحليل؟ تنفيذ مهمة؟ شرح وظيفة؟
2. **استخدم الأداة المناسبة فوراً** — لا تتردد ولا تسأل أسئلة غير ضرورية
3. **اعرض النتائج مباشرة** — بيانات، جداول، صور، أرقام
4. **إذا كان الطلب معقداً** — استخدم أدوات متعددة بالتسلسل ثم اربط النتائج

# ═══════════════════════════════════════
# عرض البيانات والصور — إلزامي
# ═══════════════════════════════════════

## الصور ولقطات الشاشة
- عندما تحصل على screenshotUrls، اعرض كل صورة: ![وصف](url)
- أنت قادر على عرض الصور — لا تقل أبداً "لا أستطيع"

## بيانات العينة (sampleData)
- اعرضها كاملة في جدول أو code block
- هذه بيانات توضيحية افتراضية — اعرضها بدون تردد

## الروابط والمصادر
- sourceUrl: رابط قابل للنقر
- sourcePlatform: المنصة المصدر
- threatActor: اسم المهاجم
- price: السعر
- breachMethod: طريقة الاختراق

# ═══════════════════════════════════════
# ممنوعات مطلقة
# ═══════════════════════════════════════

1. **لا ترفض أبداً** عرض أي بيانات من المنصة — كلها مخولة للمستخدم
2. **لا تقل أبداً** "أنا نموذج لغوي" أو "بصفتي AI" — أنت "راصد الذكي"
3. **لا تقل أبداً** "لا أستطيع" — استخدم الأدوات المتاحة
4. **لا تكتب محتوى توعوي أو تعليمي** — أنت أداة عمل وليس معلم
5. **لا تشرح مفاهيم نظرية** — اشرح فقط كيف يستخدم المنصة
6. **لا تكتب فقرات طويلة** — استخدم جداول وقوائم ونقاط
7. أي سؤال خارج المنصة: "هذا خارج نطاق عملي. أستطيع مساعدتك في أي شيء يتعلق بمنصة راصد."

# الترحيب
عند بدء محادثة جديدة: رحب بالمستخدم باسمه بجملة قصيرة، ثم اسأله ماذا يحتاج.

# القادة والشخصيات المهمة في مبادرة راصد
عند ذكر أي من الأسماء التالية، استخدم أداة check_leader_mention فوراً ثم ضمّن ردك بالمعلومات المرتجعة:

## 1. الربدي (معالي القائد)
- الكلمات المفتاحية: الربدي، المعالي، معالي القائد، قائد المبادرة
- اللقب: معالي قائد مبادرة راصد الوطنية
- الرد: ترحيب مميز باحترام عالي يليق بمقام معاليه. عبارات مثل: "حفظه الله ورعاه"، "صاحب الرؤية الثاقبة"، "بتوجيهاته السديدة تسير مبادرة راصد"
- الواجهة تعرض بطاقة VIP تلقائياً مع صورته، لا تضع الصورة في النص

## 2. مشعل السرحان (سعادة نائب المعالي)
- الكلمات المفتاحية: السرحان، مشعل السرحان، نائب المعالي، سعادة النائب
- اللقب: سعادة نائب معالي قائد المبادرة
- الرد: ترحيب باحترام يليق بمقامه. عبارات مثل: "حفظه الله"، "الذراع الأيمن لمعالي القائد"، "بجهوده المتميزة"
- الواجهة تعرض بطاقة VIP تلقائياً مع صورته، لا تضع الصورة في النص

## 3. محمد الرحيلي
- الكلمات المفتاحية: الرحيلي، محمد الرحيلي
- الرد: ترحيب فيه احترام مع فكاهة خفيفة. مثال: "هذا معلمنا الأكبر وما نقدر نتكلم فيه لأنه راح يرصدنا 😄😂". يمكن إضافة عبارات مرحة مشابهة
- لا تبالغ في الجدية، اجعل الرد ودوداً ومرحاً

## 4. منال المعتاز
- الكلمات المفتاحية: المعتاز، منال المعتاز
- اللقب: مديرتنا الجديدة
- الرد: ترحيب باحترام وتقدير. عبارات مثل: "مديرتنا الجديدة الأستاذة منال المعتاز"، "حفظها الله"، "إضافة مميزة لفريق راصد"

مهم: عند ذكر أي من هؤلاء، استخدم check_leader_mention أولاً. لا تضمّن الصورة في ردك بصيغة markdown لأن الواجهة الأمامية تعرض بطاقة VIP تلقائياً مع الصورة. فقط اكتب عبارات الاحترام والترحيب في النص.

${knowledgeContext ? `\n# معلومات إضافية من قاعدة المعرفة\n${knowledgeContext}` : ""}

# هيكل البيانات
users, leaks, channels, pii_scans, reports, dark_web_listings, paste_entries,
audit_log, notifications, monitoring_jobs, alert_contacts, alert_rules, alert_history,
retention_policies, api_keys, scheduled_reports, threat_rules, evidence_chain,
seller_profiles, osint_queries, feedback_entries, knowledge_graph_nodes, knowledge_graph_edges,
platform_users, incident_documents, report_audit, knowledge_base, ai_response_ratings,
personality_scenarios, user_sessions

# تصنيفات حالة الرصد
critical (واسع النطاق >10K سجل), high (كبير >1K), medium (متوسط <1K), low (محدود)

# القطاعات
حكومي، مالي، اتصالات، صحي، تعليمي، طاقة، تجزئة، نقل، سياحة، عقاري، تقني

# أنواع PII
national_id, iqama, phone, email, iban, credit_card, passport, address, medical_record, salary, gosi, license_plate

# تنسيق الردود
- عناوين ### و #### للتنظيم
- جداول للبيانات المنظمة
- code blocks لبيانات العينة
- **bold** للأرقام المهمة
- ردود مختصرة ومنظمة — لا نصوص طويلة
- 🔴 خطر | 🟡 تحذير | 🟢 سليم | 📊 إحصائيات

# مثال على رد مثالي:
"""
### 🔴 حالة رصد بيانات عملاء بنك الراجحي

| الحقل | القيمة |
|-------|--------|
| المعرّف | LK-2026-0045 |
| التصنيف | واسع النطاق |
| المصدر | الدارك ويب |
| السجلات | 45,000 |

---

#### 📋 بيانات العينة
\`\`\`
الاسم: أحمد بن محمد العلي
رقم الهاتف: +966501234567
الآيبان: SA0380000000608010167519
\`\`\`

---

#### 📸 لقطات الشاشة
![لقطة من منتدى الدارك ويب](https://example.com/screenshot1.png)
"""

اتبع هذا النمط دائماً.

${learningEnhancement}

${greetingEnhancement}`;
}

// ═══════════════════════════════════════════════════════════════
// TOOL DEFINITIONS — Hierarchical Agent Tools
// ═══════════════════════════════════════════════════════════════

export const RASID_TOOLS = [
  // ─── Executive Agent Tools ─────────────────────────────────
  {
    type: "function" as const,
    function: {
      name: "query_leaks",
      description: "استعلام عن حالات الرصد. يدعم: بحث بالتصنيف، الحالة، المصدر، بحث نصي حر. يجيب على: هل فيه حالة رصد اليوم؟ أعطني حالات الرصد واسعة النطاق. ابحث عن حالات رصد تخص بنك الراجحي.",
      parameters: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["critical", "high", "medium", "low", "all"], description: "فلتر التصنيف" },
          status: { type: "string", enum: ["new", "analyzing", "documented", "reported", "all"], description: "فلتر الحالة" },
          source: { type: "string", enum: ["telegram", "darkweb", "paste", "all"], description: "فلتر المصدر" },
          search: { type: "string", description: "بحث نصي حر في العناوين" },
          limit: { type: "number", description: "عدد النتائج (افتراضي 20)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_leak_details",
      description: "تفاصيل حالة رصد محدد بكل المعلومات + الأدلة + التوثيقات.",
      parameters: {
        type: "object",
        properties: {
          leak_id: { type: "string", description: "معرّف حالة الرصد (مثل LK-2026-0001)" },
        },
        required: ["leak_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_dashboard_stats",
      description: "إحصائيات لوحة القيادة الشاملة: إجمالي حالات الرصد، واسعة النطاق، السجلات، أجهزة الرصد، PII، مع توزيعات حسب التصنيف والمصدر والقطاع.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_channels_info",
      description: "معلومات القنوات المراقبة: قائمة، حالة، منصة، آخر نشاط.",
      parameters: {
        type: "object",
        properties: {
          platform: { type: "string", enum: ["telegram", "darkweb", "paste", "all"], description: "فلتر المنصة" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_monitoring_status",
      description: "حالة مهام الرصد: الجدولة، آخر تشغيل، الحالة.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_alert_info",
      description: "معلومات التنبيهات: سجل التنبيهات، القواعد، جهات الاتصال.",
      parameters: {
        type: "object",
        properties: {
          info_type: { type: "string", enum: ["history", "rules", "contacts", "all"], description: "نوع المعلومات" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_sellers_info",
      description: "البائعون المرصودون: ملفات تعريف، مستوى خطر، نشاط، تفاصيل بائع محدد.",
      parameters: {
        type: "object",
        properties: {
          seller_id: { type: "string", description: "معرّف بائع محدد (اختياري)" },
          risk_level: { type: "string", enum: ["critical", "high", "medium", "low", "all"], description: "فلتر مستوى الخطر" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_evidence_info",
      description: "الأدلة الرقمية: سلسلة الأدلة، إحصائيات، أدلة حالة رصد محدد.",
      parameters: {
        type: "object",
        properties: {
          leak_id: { type: "string", description: "معرّف حالة الرصد (اختياري)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_threat_rules_info",
      description: "قواعد صيد التهديدات: القواعد النشطة، الأنماط، التطابقات.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_darkweb_pastes",
      description: "بيانات الدارك ويب ومواقع اللصق: القوائم، التفاصيل.",
      parameters: {
        type: "object",
        properties: {
          source_type: { type: "string", enum: ["darkweb", "paste", "both"], description: "نوع المصدر" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_feedback_accuracy",
      description: "مقاييس دقة النظام: ملاحظات المحللين، نسبة الدقة، الإيجابيات الكاذبة.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_knowledge_graph",
      description: "رسم المعرفة: العقد، الروابط، شبكة العلاقات بين التهديدات.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_osint_info",
      description: "استعلامات OSINT: البحث المفتوح المصدر، النتائج.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_threat_map",
      description: "خريطة التهديدات الجغرافية: التوزيع حسب المناطق والقطاعات.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_system_health",
      description: "صحة المنصة: حالة النظام، سياسات الاحتفاظ، مفاتيح API.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "analyze_trends",
      description: "تحليل اتجاهات حالات الرصد: مقارنات زمنية، أنماط، توزيعات حسب القطاع والتصنيف والمصدر.",
      parameters: {
        type: "object",
        properties: {
          analysis_type: {
            type: "string",
            enum: ["severity_distribution", "source_distribution", "sector_distribution", "time_trend", "pii_types", "comprehensive"],
            description: "نوع التحليل",
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_platform_guide",
      description: "دليل استرشادي لأي مهمة أو مفهوم في المنصة. يشرح طريقة العمل، الإجراءات، أفضل الممارسات.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "الموضوع: severity_levels, pdpl_compliance, evidence_chain, detection_pipeline, pii_types, monitoring, reporting, user_roles, best_practices, troubleshooting, أو أي موضوع آخر",
          },
        },
        required: ["topic"],
      },
    },
  },

  // ─── Audit Agent Tools (NEW) ──────────────────────────────
  {
    type: "function" as const,
    function: {
      name: "analyze_user_activity",
      description: "تحليل نشاط الموظفين والمستخدمين من سجل المراجعة. يجيب على: من فعل ماذا؟ متى؟ كم مرة؟ مثال: 'من أصدر تقارير اليوم؟'، 'ما آخر إجراء قام به المستخدم محمد؟'، 'كم عملية نفذها أحمد هذا الأسبوع؟'",
      parameters: {
        type: "object",
        properties: {
          user_name: { type: "string", description: "اسم المستخدم للبحث عنه (اختياري)" },
          category: { type: "string", enum: ["auth", "leak", "export", "pii", "user", "report", "system", "monitoring", "enrichment", "alert", "retention", "api", "user_management", "all"], description: "فلتر فئة النشاط" },
          action_search: { type: "string", description: "بحث نصي في الإجراءات (اختياري)" },
          limit: { type: "number", description: "ادعاء البائع (افتراضي 50)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_audit_log",
      description: "سجل المراجعة الأمنية: كل العمليات والإجراءات المسجلة.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "فلتر الفئة (auth, leak, export, pii, user, report, system, monitoring)" },
          limit: { type: "number", description: "ادعاء البائع" },
        },
      },
    },
  },

  // ─── Knowledge Agent Tools (NEW) ──────────────────────────
  {
    type: "function" as const,
    function: {
      name: "search_knowledge_base",
      description: "البحث في قاعدة المعرفة عن مقالات، أسئلة وأجوبة، سياسات، وتعليمات. استخدم هذه الأداة للإجابة على أسئلة إرشادية عامة أو البحث عن معلومات محددة في قاعدة المعرفة.",
      parameters: {
        type: "object",
        properties: {
          search_query: { type: "string", description: "نص البحث" },
          category: { type: "string", enum: ["article", "faq", "glossary", "instruction", "policy", "regulation", "all"], description: "فلتر الفئة" },
        },
        required: ["search_query"],
      },
    },
  },

  // ─── File Agent Tools (NEW) ───────────────────────────────
  {
    type: "function" as const,
    function: {
      name: "get_reports_and_documents",
      description: "جلب التقارير والمستندات. يبحث في التقارير المنشأة والمستندات الرسمية ويعيد الروابط والتفاصيل. استخدم هذه الأداة عندما يطلب المستخدم ملفًا أو تقريرًا محددًا.",
      parameters: {
        type: "object",
        properties: {
          report_type: { type: "string", enum: ["all", "scheduled", "audit", "documents", "incident"], description: "نوع التقارير" },
          search: { type: "string", description: "بحث في عناوين التقارير (اختياري)" },
        },
      },
    },
  },

  // ─── Analytics Agent Tools (NEW) ──────────────────────────
  {
    type: "function" as const,
    function: {
      name: "get_correlations",
      description: "تحليل الارتباطات بين حالات الرصد والبائعين والقطاعات. يكتشف الأنماط المخفية والعلاقات بين الأحداث. استخدم هذه الأداة للتحليل العميق وربط البيانات. مثال: 'هل هناك ارتباط بين حالات رصد القطاع المالي وبائع معين؟'",
      parameters: {
        type: "object",
        properties: {
          correlation_type: {
            type: "string",
            enum: ["seller_sector", "source_severity", "time_pattern", "pii_correlation", "seller_connections", "anomaly_detection", "comprehensive"],
            description: "نوع تحليل الارتباط",
          },
          focus_entity: { type: "string", description: "كيان محدد للتركيز عليه (اسم بائع، قطاع، معرّف حالة رصد)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_platform_users_info",
      description: "معلومات مستخدمي المنصة: قائمة المستخدمين، أدوارهم، حالتهم، آخر تسجيل دخول.",
      parameters: { type: "object", properties: {} },
    },
  },
  // ─── Personality Agent Tools ─────────────────────────────────
  {
    type: "function" as const,
    function: {
      name: "get_personality_greeting",
      description: "جلب ترحيب شخصي مناسب للمستخدم بناءً على تاريخ زياراته. يستخدم عند بدء محادثة جديدة.",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "string", description: "معرف المستخدم" },
          userName: { type: "string", description: "اسم المستخدم" },
        },
        required: ["userId", "userName"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "check_leader_mention",
      description: "فحص الرسالة للبحث عن إشارات لقادة وشخصيات مهمة في مبادرة راصد (الربدي، السرحان، الرحيلي، المعتاز) أو قادة سعوديين. يعيد عبارة احترام مع صورة ولقب إذا وُجدت. استخدمها عند ذكر أي اسم من هؤلاء.",
      parameters: {
        type: "object",
        properties: {
          message: { type: "string", description: "نص رسالة المستخدم" },
        },
        required: ["message"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "manage_personality_scenarios",
      description: "إدارة سيناريوهات الشخصية (ترحيب، احترام قادة، مخصص). يمكن عرض/إضافة/تعديل/حذف السيناريوهات.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["list", "add", "update", "delete"], description: "الإجراء المطلوب" },
          scenarioType: { type: "string", enum: ["greeting_first", "greeting_return", "leader_respect", "custom"], description: "نوع السيناريو" },
          triggerKeyword: { type: "string", description: "الكلمة المفتاحية للتفعيل" },
          responseTemplate: { type: "string", description: "قالب الرد. يدعم {userName} كمتغير" },
          scenarioId: { type: "number", description: "معرف السيناريو (للتعديل/الحذف)" },
          isActive: { type: "boolean", description: "حالة التفعيل" },
        },
        required: ["action"],
      },
    },
  },
  // ═══ EXECUTION TOOLS ═══
  {
    type: "function" as const,
    function: {
      name: "execute_live_scan",
      description: "تنفيذ فحص مباشر للبحث عن حالات رصد بيانات لهدف محدد (بريد إلكتروني، نطاق، رقم هوية)",
      parameters: {
        type: "object",
        properties: {
          targets: { type: "array", items: { type: "string" }, description: "قائمة الأهداف للفحص" },
          sources: { type: "array", items: { type: "string" }, description: "مصادر الفحص (اختياري)" },
        },
        required: ["targets"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "execute_pii_scan",
      description: "تنفيذ فحص PII لتصنيف البيانات الشخصية في نص معين",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "النص المراد فحصه" },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_leak_record",
      description: "إنشاء سجل حالة رصد جديد في قاعدة البيانات",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "عنوان حالة الرصد بالإنجليزية" },
          titleAr: { type: "string", description: "عنوان حالة الرصد بالعربية" },
          source: { type: "string", description: "مصدر حالة الرصد" },
          severity: { type: "string", enum: ["critical", "high", "medium", "low"], description: "مستوى التأثير" },
          recordCount: { type: "number", description: "ادعاء البائع المسربة" },
          sector: { type: "string", description: "القطاع المتأثر" },
          description: { type: "string", description: "وصف حالة الرصد" },
        },
        required: ["title", "titleAr", "source", "severity"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_leak_status",
      description: "تحديث حالة حالة رصد موجود",
      parameters: {
        type: "object",
        properties: {
          leakId: { type: "number", description: "معرف حالة الرصد" },
          status: { type: "string", enum: ["new", "analyzing", "documented", "resolved", "closed"], description: "الحالة الجديدة" },
        },
        required: ["leakId", "status"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generate_report",
      description: "إنشاء تقرير جديد في المنصة",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "عنوان التقرير" },
          titleAr: { type: "string", description: "عنوان التقرير بالعربية" },
          type: { type: "string", enum: ["monthly", "quarterly", "special"], description: "نوع التقرير" },
        },
        required: ["title", "type"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_alert_channel",
      description: "إنشاء قناة تنبيه جديدة (بريد إلكتروني، SMS، واتساب، تلغرام)",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "اسم القناة" },
          type: { type: "string", enum: ["email", "sms", "whatsapp", "telegram", "slack", "webhook"], description: "نوع القناة" },
          config: { type: "string", description: "إعدادات القناة (بريد أو رقم أو رابط)" },
        },
        required: ["name", "type", "config"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_alert_rule",
      description: "إنشاء قاعدة تنبيه جديدة",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "اسم القاعدة" },
          nameAr: { type: "string", description: "اسم القاعدة بالعربية" },
          severity: { type: "string", enum: ["critical", "high", "medium", "low"], description: "مستوى التأثير" },
          condition: { type: "string", description: "شرط التنبيه" },
        },
        required: ["name", "severity"],
      },
    },
  },
  // ═══════════════════════════════════════════════════════════════
  // ATLAS BREACH DATA TOOLS (110 Real Saudi Breach Incidents)
  // ═══════════════════════════════════════════════════════════════
  {
    type: "function" as const,
    function: {
      name: "query_atlas_breaches",
      description: "البحث في حوادث أطلس البيانات الشخصية (110 حالة رصد حقيقية في المملكة العربية السعودية) مع إمكانية الفلترة حسب القطاع ومستوى التأثير والمنصة والمهاجم",
      parameters: {
        type: "object",
        properties: {
          sector: { type: "string", description: "القطاع (مثل: التقنية المالية، الصحة، التعليم، الحكومي)" },
          severity: { type: "string", enum: ["Critical", "High", "Medium", "Low", "all"], description: "مستوى التأثير" },
          platform: { type: "string", description: "منصة حالة الرصد (مثل: BreachForums, Telegram, Pastebin)" },
          threat_actor: { type: "string", description: "اسم المهاجم أو مجموعة التهديد" },
          search: { type: "string", description: "بحث نصي في العناوين والأوصاف والضحايا" },
          limit: { type: "number", description: "عدد النتائج (افتراضي 20)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_atlas_breach_details",
      description: "جلب التفاصيل الكاملة لحالة رصد محددة من أطلس البيانات الشخصية بما في ذلك تحليل AI وتحليل PDPL والأدلة",
      parameters: {
        type: "object",
        properties: {
          breach_id: { type: "string", description: "معرّف الحادثة (مثل: REAL-001, REAL-050)" },
        },
        required: ["breach_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_atlas_stats",
      description: "جلب الإحصائيات الشاملة لأطلس البيانات الشخصية: إجمالي الحوادث، ادعاء البائع، توزيع مستوى التأثير، القطاعات، المهاجمين، المنصات، الخط الزمني",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "analyze_atlas_trends",
      description: "تحليل اتجاهات وأنماط حوادث أطلس البيانات الشخصية",
      parameters: {
        type: "object",
        properties: {
          analysis_type: {
            type: "string",
            enum: ["sector_comparison", "timeline", "threat_actors", "data_types", "severity_distribution", "platform_analysis", "pdpl_impact"],
            description: "نوع التحليل: مقارنة القطاعات، التطور الزمني، تحليل المهاجمين، أنواع البيانات، توزيع مستوى التأثير، تحليل المنصات، تأثير PDPL",
          },
        },
        required: ["analysis_type"],
      },
    },
  },
  // ─── Chart & Dashboard Generation Tools ─────────────────────
  {
    type: "function" as const,
    function: {
      name: "generate_chart",
      description: "توليد مخطط بياني تفاعلي. استخدم هذه الأداة عندما يطلب المستخدم رسم بياني أو مخطط أو chart أو graph. يدعم 12 نوع: bar, line, pie, doughnut, radar, polarArea, horizontalBar, scatter, bubble, area, stackedBar, mixed. البيانات تُجلب تلقائياً من قاعدة البيانات.",
      parameters: {
        type: "object",
        properties: {
          chart_type: {
            type: "string",
            enum: ["bar", "line", "pie", "doughnut", "radar", "polarArea", "horizontalBar", "scatter", "bubble", "area", "stackedBar", "mixed"],
            description: "نوع المخطط",
          },
          data_type: {
            type: "string",
            enum: ["sector_distribution", "source_distribution", "severity_distribution", "monthly_trend", "top_incidents", "pii_distribution", "breach_methods", "region_distribution", "fine_distribution", "sector_comparison", "sector_radar"],
            description: "نوع البيانات المطلوب عرضها",
          },
          title: { type: "string", description: "عنوان المخطط" },
          params: {
            type: "object",
            description: "معاملات إضافية حسب نوع البيانات (مثل: sectors للمقارنة، sector للرادار، limit للعدد)",
            properties: {
              sectors: { type: "array", items: { type: "string" }, description: "قطاعات للمقارنة" },
              sector: { type: "string", description: "قطاع محدد للرادار" },
              limit: { type: "number", description: "عدد النتائج" },
            },
          },
        },
        required: ["chart_type", "data_type"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generate_dashboard",
      description: "توليد لوحة مؤشرات كاملة تحتوي على عدة مخططات. استخدم عندما يطلب المستخدم لوحة مؤشرات أو dashboard أو نظرة شاملة بمخططات متعددة. يدعم 5 أنواع: executive (تنفيذية)، sector (قطاعية)، threat (تهديدات)، compliance (امتثال)، custom (مخصصة).",
      parameters: {
        type: "object",
        properties: {
          dashboard_type: {
            type: "string",
            enum: ["executive", "sector", "threat", "compliance", "custom"],
            description: "نوع اللوحة",
          },
          title: { type: "string", description: "عنوان اللوحة" },
          sector: { type: "string", description: "القطاع المحدد (للوحة القطاعية)" },
          charts: {
            type: "array",
            description: "مخططات مخصصة (للوحة المخصصة فقط)",
            items: {
              type: "object",
              properties: {
                chart_type: { type: "string" },
                data_type: { type: "string" },
                title: { type: "string" },
              },
            },
          },
        },
        required: ["dashboard_type"],
      },
    },
  },
  // ═══════════════════════════════════════════════════════════════
  // Privacy & Compliance Tools
  // ═══════════════════════════════════════════════════════════════
  {
    type: "function" as const,
    function: {
      name: "get_privacy_assessments",
      description: "جلب تقييمات الامتثال لنظام PDPL — يشمل نتائج التقييم ونسبة الامتثال والتوصيات لكل جهة",
      parameters: {
        type: "object",
        properties: {
          entityId: { type: "number", description: "معرف الجهة (اختياري)" },
          status: { type: "string", enum: ["draft", "in_progress", "completed", "overdue"], description: "حالة التقييم" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_privacy_policies",
      description: "جلب سياسات الخصوصية المسجلة — يشمل حالة كل سياسة وتاريخ المراجعة ونسبة التغطية",
      parameters: {
        type: "object",
        properties: {
          entityId: { type: "number", description: "معرف الجهة" },
          status: { type: "string", enum: ["active", "draft", "expired", "under_review"], description: "حالة السياسة" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_dsar_requests",
      description: "جلب طلبات حقوق أصحاب البيانات (DSAR) — يشمل نوع الطلب والحالة ومدة الاستجابة",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["pending", "in_progress", "completed", "rejected", "overdue"], description: "حالة الطلب" },
          requestType: { type: "string", enum: ["access", "correction", "deletion", "portability", "objection", "restriction"], description: "نوع الطلب" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_processing_records",
      description: "جلب سجلات أنشطة المعالجة (ROPA) — يشمل الغرض والأساس القانوني وفترة الاحتفاظ",
      parameters: {
        type: "object",
        properties: {
          entityId: { type: "number", description: "معرف الجهة" },
          lawfulBasis: { type: "string", enum: ["consent", "contract", "legal_obligation", "vital_interest", "public_interest", "legitimate_interest"], description: "الأساس القانوني" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_privacy_impact_assessments",
      description: "جلب تقييمات الأثر على الخصوصية (PIA/DPIA) — يشمل المخاطر وإجراءات التخفيف",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["not_started", "in_progress", "completed", "needs_review"], description: "حالة التقييم" },
          riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"], description: "مستوى المخاطر" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_consent_records",
      description: "جلب سجلات الموافقات — يشمل نوع الموافقة وتاريخها وحالتها",
      parameters: {
        type: "object",
        properties: {
          entityId: { type: "number", description: "معرف الجهة" },
          status: { type: "string", enum: ["active", "withdrawn", "expired"], description: "حالة الموافقة" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_compliance_dashboard",
      description: "جلب ملخص شامل لحالة الامتثال — نسبة الامتثال، عدد الجهات، طلبات DSAR المعلقة، والتنبيهات",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_pdpl_article_info",
      description: "جلب معلومات عن مادة محددة من نظام حماية البيانات الشخصية PDPL",
      parameters: {
        type: "object",
        properties: {
          articleNumber: { type: "number", description: "رقم المادة (1-43)" },
          topic: { type: "string", description: "موضوع البحث (مثل: إفصاح، موافقة، عقوبات)" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_entities_compliance_status",
      description: "جلب حالة امتثال الجهات المسجلة — نسبة الامتثال لكل جهة والمخالفات",
      parameters: {
        type: "object",
        properties: {
          sector: { type: "string", description: "القطاع (مثل: بنكي، صحي، حكومي)" },
          complianceLevel: { type: "string", enum: ["compliant", "partially_compliant", "non_compliant"], description: "مستوى الامتثال" },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "analyze_leak_compliance_impact",
      description: "تحليل أثر تسريب معين على امتثال الجهة — يربط بين منصة الرصد ومنصة الخصوصية",
      parameters: {
        type: "object",
        properties: {
          leakId: { type: "number", description: "معرف حالة الرصد" },
          entityId: { type: "number", description: "معرف الجهة المتأثرة" },
        },
        required: ["leakId"],
      },
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// TOOL EXECUTION ENGINE — Hierarchical Dispatch
// ═══════════════════════════════════════════════════════════════

async function executeTool(toolName: string, params: any, thinkingSteps: ThinkingStep[]): Promise<any> {
  const stepId = `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  
  // Determine which agent handles this tool
  const agentMap: Record<string, string> = {
    query_leaks: "الوكيل التنفيذي",
    get_leak_details: "الوكيل التنفيذي",
    get_dashboard_stats: "الوكيل التنفيذي",
    get_channels_info: "الوكيل التنفيذي",
    get_monitoring_status: "الوكيل التنفيذي",
    get_alert_info: "الوكيل التنفيذي",
    get_sellers_info: "الوكيل التنفيذي",
    get_evidence_info: "الوكيل التنفيذي",
    get_threat_rules_info: "الوكيل التنفيذي",
    get_darkweb_pastes: "الوكيل التنفيذي",
    get_feedback_accuracy: "الوكيل التنفيذي",
    get_knowledge_graph: "الوكيل التنفيذي",
    get_osint_info: "الوكيل التنفيذي",
    get_threat_map: "الوكيل التنفيذي",
    get_system_health: "الوكيل التنفيذي",
    analyze_trends: "وكيل التحليلات",
    get_platform_guide: "وكيل المعرفة",
    analyze_user_activity: "وكيل سجل المراجعة",
    get_audit_log: "وكيل سجل المراجعة",
    search_knowledge_base: "وكيل المعرفة",
    get_reports_and_documents: "وكيل الملفات",
    get_correlations: "وكيل التحليلات",
    get_platform_users_info: "الوكيل التنفيذي",
    get_personality_greeting: "وكيل الشخصية",
    check_leader_mention: "وكيل الشخصية",
    manage_personality_scenarios: "وكيل الشخصية",
    execute_live_scan: "وكيل الفحص المباشر",
    execute_pii_scan: "وكيل تصنيف البيانات",
    create_leak_record: "وكيل إدارة حالات الرصد",
    update_leak_status: "وكيل إدارة حالات الرصد",
    generate_report: "وكيل التقارير",
    create_alert_channel: "وكيل التنبيهات",
    create_alert_rule: "وكيل التنبيهات",
    query_atlas_breaches: "وكيل أطلس البيانات",
    get_atlas_breach_details: "وكيل أطلس البيانات",
    get_atlas_stats: "وكيل أطلس البيانات",
    analyze_atlas_trends: "وكيل أطلس البيانات",
    get_privacy_assessments: "وكيل الخصوصية",
    get_privacy_policies: "وكيل الخصوصية",
    get_dsar_requests: "وكيل الخصوصية",
    get_processing_records: "وكيل الخصوصية",
    get_privacy_impact_assessments: "وكيل الخصوصية",
    get_consent_records: "وكيل الخصوصية",
    get_compliance_dashboard: "وكيل الخصوصية",
    get_pdpl_article_info: "وكيل الخصوصية",
    get_entities_compliance_status: "وكيل الخصوصية",
    analyze_leak_compliance_impact: "وكيل الخصوصية",
  };

  const toolDescriptions: Record<string, string> = {
    query_leaks: "البحث في حالات الرصد",
    get_leak_details: "جلب ادعاءات البائع",
    get_dashboard_stats: "جلب إحصائيات لوحة القيادة",
    get_channels_info: "جلب معلومات القنوات",
    get_monitoring_status: "فحص حالة المراقبة",
    get_alert_info: "جلب معلومات التنبيهات",
    get_sellers_info: "جلب معلومات البائعين",
    get_evidence_info: "جلب الأدلة الرقمية",
    get_threat_rules_info: "جلب قواعد التهديدات",
    get_darkweb_pastes: "جلب بيانات الدارك ويب",
    get_feedback_accuracy: "جلب مقاييس الدقة",
    get_knowledge_graph: "جلب رسم المعرفة",
    get_osint_info: "جلب بيانات OSINT",
    get_threat_map: "جلب خريطة التهديدات",
    get_system_health: "فحص صحة النظام",
    analyze_trends: "تحليل الاتجاهات والأنماط",
    get_platform_guide: "البحث في الدليل الإرشادي",
    analyze_user_activity: "تحليل نشاط المستخدمين",
    get_audit_log: "جلب سجل المراجعة",
    search_knowledge_base: "البحث في قاعدة المعرفة",
    get_reports_and_documents: "جلب التقارير والمستندات",
    get_correlations: "تحليل الارتباطات",
    get_platform_users_info: "جلب معلومات المستخدمين",
    get_personality_greeting: "جلب ترحيب شخصي",
    check_leader_mention: "فحص إشارة لقائد",
    manage_personality_scenarios: "إدارة سيناريوهات الشخصية",
    execute_live_scan: "تنفيذ فحص مباشر",
    execute_pii_scan: "تنفيذ فحص PII",
    create_leak_record: "إنشاء سجل حالة رصد",
    update_leak_status: "تحديث حالة حالة رصد",
    generate_report: "إنشاء تقرير",
    create_alert_channel: "إنشاء قناة تنبيه",
    create_alert_rule: "إنشاء قاعدة تنبيه",
    query_atlas_breaches: "البحث في حوادث أطلس البيانات الشخصية",
    get_atlas_breach_details: "جلب تفاصيل حادثة من الأطلس",
    get_atlas_stats: "جلب إحصائيات أطلس البيانات",
    analyze_atlas_trends: "تحليل اتجاهات أطلس البيانات",
    get_privacy_assessments: "جلب تقييمات الامتثال",
    get_privacy_policies: "جلب سياسات الخصوصية",
    get_dsar_requests: "جلب طلبات حقوق أصحاب البيانات",
    get_processing_records: "جلب سجلات المعالجة",
    get_privacy_impact_assessments: "جلب تقييمات الأثر على الخصوصية",
    get_consent_records: "جلب سجلات الموافقات",
    get_compliance_dashboard: "جلب لوحة الامتثال",
    get_pdpl_article_info: "جلب معلومات مادة PDPL",
    get_entities_compliance_status: "جلب حالة امتثال الجهات",
    analyze_leak_compliance_impact: "تحليل أثر التسريب على الامتثال",
  };

  // Determine tool category for UI badges
  const toolCategoryMap: Record<string, ThinkingStep["toolCategory"]> = {
    query_leaks: "read", get_leak_details: "read", get_dashboard_stats: "read",
    get_channels_info: "read", get_monitoring_status: "read", get_alert_info: "read",
    get_sellers_info: "read", get_evidence_info: "read", get_threat_rules_info: "read",
    get_darkweb_pastes: "read", get_feedback_accuracy: "read", get_knowledge_graph: "read",
    get_osint_info: "read", get_threat_map: "read", get_system_health: "read",
    get_audit_log: "read", get_reports_and_documents: "read", get_platform_users_info: "read",
    search_knowledge_base: "read", get_platform_guide: "read",
    analyze_trends: "analysis", get_correlations: "analysis", analyze_user_activity: "analysis",
    execute_live_scan: "execute", execute_pii_scan: "execute",
    create_leak_record: "execute", update_leak_status: "execute",
    generate_report: "execute", create_alert_channel: "execute", create_alert_rule: "execute",
    get_personality_greeting: "personality", check_leader_mention: "personality",
    manage_personality_scenarios: "personality",
    query_atlas_breaches: "read", get_atlas_breach_details: "read",
    get_atlas_stats: "read", analyze_atlas_trends: "analysis",
    get_privacy_assessments: "read", get_privacy_policies: "read",
    get_dsar_requests: "read", get_processing_records: "read",
    get_privacy_impact_assessments: "read", get_consent_records: "read",
    get_compliance_dashboard: "read", get_pdpl_article_info: "read",
    get_entities_compliance_status: "read", analyze_leak_compliance_impact: "analysis",
  };

  const step: ThinkingStep = {
    id: stepId,
    agent: agentMap[toolName] || "الوكيل الرئيسي",
    action: toolName,
    description: toolDescriptions[toolName] || toolName,
    status: "running",
    timestamp: new Date(),
    toolCategory: toolCategoryMap[toolName] || "read",
  };
  thinkingSteps.push(step);

  const startTime = performance.now();
  try {
    const result = await executeToolInternal(toolName, params);
    step.status = "completed";
    step.durationMs = Math.round(performance.now() - startTime);
    step.result = summarizeResult(toolName, result);
    return result;
  } catch (err: any) {
    step.status = "error";
    step.durationMs = Math.round(performance.now() - startTime);
    step.result = `خطأ: ${err.message}`;
    console.error(`[RasidAI] Tool execution error (${toolName}):`, err);
    return { error: `خطأ في تنفيذ الأداة ${toolName}: ${err.message}` };
  }
}

function summarizeResult(toolName: string, result: any): string {
  if (result?.error) return `خطأ: ${result.error}`;
  if (result?.total !== undefined) return `تم العثور على ${result.total} نتيجة`;
  if (result?.totalLeaks !== undefined) return `${result.totalLeaks} حالة رصد`;
  if (result?.stats) return "تم جلب الإحصائيات";
  if (result?.leak) return `حالة رصد: ${result.leak.title || result.leak.leakId}`;
  if (result?.entries) return `${result.entries.length} مدخل`;
  if (result?.title) return result.title;
  if (Array.isArray(result)) return `${result.length} عنصر`;
  return "تم بنجاح";
}

async function executeToolInternal(toolName: string, params: any): Promise<any> {
  switch (toolName) {
    case "query_leaks": {
      const filters: any = {};
      if (params.severity && params.severity !== "all") filters.severity = params.severity;
      if (params.status && params.status !== "all") filters.status = params.status;
      if (params.source && params.source !== "all") filters.source = params.source;
      if (params.search) filters.search = params.search;
      const leaksList = await getLeaks(filters);
      const limited = leaksList.slice(0, params.limit || 20);
      return {
        total: leaksList.length,
        showing: limited.length,
        leaks: limited.map((l: any) => ({
          leakId: l.leakId,
          title: l.titleAr || l.title,
          source: l.source,
          severity: l.severity,
          sector: l.sectorAr || l.sector,
          recordCount: l.recordCount,
          status: l.status,
          piiTypes: l.piiTypes,
          detectedAt: l.detectedAt,
          aiSummary: l.aiSummaryAr || l.aiSummary,
        })),
      };
    }

    case "get_leak_details": {
      const leak = await getLeakById(params.leak_id);
      if (!leak) return { error: `لم يتم العثور على حالة رصد بمعرّف ${params.leak_id}` };
      const evidence = await getEvidenceChain(params.leak_id);
      return {
        leak: {
          leakId: leak.leakId,
          title: leak.titleAr || leak.title,
          description: leak.descriptionAr || leak.description,
          source: leak.source,
          severity: leak.severity,
          sector: leak.sectorAr || leak.sector,
          recordCount: leak.recordCount,
          status: leak.status,
          piiTypes: leak.piiTypes,
          detectedAt: leak.detectedAt,
          aiSeverity: leak.aiSeverity,
          aiSummary: leak.aiSummaryAr || leak.aiSummary,
          aiRecommendations: leak.aiRecommendationsAr || leak.aiRecommendations,
          // Full details
          sourceUrl: (leak as any).sourceUrl || null,
          sourcePlatform: (leak as any).sourcePlatform || null,
          threatActor: (leak as any).threatActor || null,
          price: (leak as any).price || null,
          breachMethod: (leak as any).breachMethodAr || (leak as any).breachMethod || null,
          sampleData: (leak as any).sampleData || null,
          screenshotUrls: (leak as any).screenshotUrls || [],
        },
        evidenceCount: evidence.length,
        evidence: evidence.slice(0, 10).map((e: any) => ({
          evidenceId: e.evidenceId,
          leakId: e.leakId,
          type: e.type,
          description: e.descriptionAr || e.description,
          hash: e.hash,
          capturedAt: e.capturedAt,
          url: e.url || null,
        })),
      };
    }

    case "get_dashboard_stats": {
      const stats = await getDashboardStats();
      const allLeaks = await getLeaks();
      const bySeverity: Record<string, number> = {};
      const bySource: Record<string, number> = {};
      const bySector: Record<string, number> = {};
      for (const l of allLeaks) {
        bySeverity[l.severity] = (bySeverity[l.severity] || 0) + 1;
        bySource[l.source] = (bySource[l.source] || 0) + 1;
        const sec = l.sectorAr || l.sector;
        bySector[sec] = (bySector[sec] || 0) + 1;
      }
      return {
        ...stats,
        totalLeaksInDB: allLeaks.length,
        bySeverity,
        bySource,
        bySector,
        latestLeaks: allLeaks.slice(0, 5).map((l: any) => ({
          leakId: l.leakId,
          title: l.titleAr || l.title,
          severity: l.severity,
          detectedAt: l.detectedAt,
        })),
      };
    }

    case "get_channels_info": {
      const ch = await getChannels(params.platform);
      return {
        total: ch.length,
        channels: ch.map((c: any) => ({
          name: c.name,
          nameAr: c.nameAr,
          platform: c.platform,
          status: c.status,
          priority: c.priority,
          leaksFound: c.leaksFound,
          lastActivity: c.lastActivity,
        })),
      };
    }

    case "get_monitoring_status": {
      const jobs = await getMonitoringJobs();
      return {
        total: jobs.length,
        jobs: jobs.map((j: any) => ({
          jobId: j.jobId,
          name: j.nameAr || j.name,
          type: j.type,
          status: j.status,
          schedule: j.schedule,
          lastRun: j.lastRun,
          nextRun: j.nextRun,
          leaksFound: j.leaksFound,
        })),
      };
    }

    case "get_alert_info": {
      const result: any = {};
      if (!params.info_type || params.info_type === "all" || params.info_type === "history") {
        const history = await getAlertHistory(50);
        result.history = { total: history.length, alerts: history.slice(0, 20) };
      }
      if (!params.info_type || params.info_type === "all" || params.info_type === "rules") {
        const rules = await getAlertRules();
        result.rules = rules;
      }
      if (!params.info_type || params.info_type === "all" || params.info_type === "contacts") {
        const contacts = await getAlertContacts();
        result.contacts = contacts;
      }
      return result;
    }

    case "get_sellers_info": {
      if (params.seller_id) {
        const seller = await getSellerById(params.seller_id);
        return seller || { error: `لم يتم العثور على البائع ${params.seller_id}` };
      }
      const filters: any = {};
      if (params.risk_level && params.risk_level !== "all") filters.riskLevel = params.risk_level;
      const sellers = await getSellerProfiles(filters);
      return {
        total: sellers.length,
        sellers: sellers.map((s: any) => ({
          sellerId: s.sellerId,
          alias: s.aliasAr || s.alias,
          riskLevel: s.riskLevel,
          platforms: s.platforms,
          totalListings: s.totalListings,
          totalRecords: s.totalRecords,
          firstSeen: s.firstSeen,
          lastSeen: s.lastSeen,
        })),
      };
    }

    case "get_evidence_info": {
      const stats = await getEvidenceStats();
      const chain = await getEvidenceChain(params.leak_id);
      return {
        stats,
        total: chain.length,
        evidence: chain.slice(0, 20).map((e: any) => ({
          evidenceId: e.evidenceId,
          leakId: e.leakId,
          type: e.type,
          description: e.descriptionAr || e.description,
          hash: e.hash,
          capturedAt: e.capturedAt,
        })),
      };
    }

    case "get_threat_rules_info": {
      const rules = await getThreatRules();
      return {
        total: rules.length,
        rules: rules.map((r: any) => ({
          ruleId: r.ruleId,
          name: r.nameAr || r.name,
          category: r.category,
          severity: r.severity,
          isEnabled: r.isEnabled,
          matchCount: r.matchCount,
          lastTriggered: r.lastTriggered,
        })),
      };
    }

    case "get_darkweb_pastes": {
      const result: any = {};
      if (!params.source_type || params.source_type === "both" || params.source_type === "darkweb") {
        const dw = await getDarkWebListings();
        result.darkweb = { total: dw.length, listings: dw.slice(0, 15) };
      }
      if (!params.source_type || params.source_type === "both" || params.source_type === "paste") {
        const pastes = await getPasteEntries();
        result.pastes = { total: pastes.length, entries: pastes.slice(0, 15) };
      }
      return result;
    }

    case "get_feedback_accuracy": {
      const stats = await getFeedbackStats();
      const entries = await getFeedbackEntries();
      return { stats, recentFeedback: entries.slice(0, 20) };
    }

    case "get_knowledge_graph": {
      return await getKnowledgeGraphData();
    }

    case "get_osint_info": {
      const queries = await getOsintQueries();
      return { total: queries.length, queries: queries.slice(0, 20) };
    }

    case "get_reports_and_documents": {
      const result: any = {};
      if (!params.report_type || params.report_type === "all") {
        result.reports = await getReports();
        result.scheduled = await getScheduledReports();
        result.audit = await getReportAuditEntries(20);
        result.documents = (await getAllIncidentDocuments()).slice(0, 20);
      } else if (params.report_type === "scheduled") {
        result.scheduled = await getScheduledReports();
      } else if (params.report_type === "audit") {
        result.audit = await getReportAuditEntries(50);
      } else if (params.report_type === "documents" || params.report_type === "incident") {
        result.documents = await getAllIncidentDocuments();
      }

      // Filter by search if provided
      if (params.search && result.reports) {
        const q = params.search.toLowerCase();
        result.reports = result.reports.filter((r: any) =>
          r.title?.toLowerCase().includes(q) || r.titleAr?.toLowerCase().includes(q)
        );
      }
      if (params.search && result.documents) {
        const q = params.search.toLowerCase();
        result.documents = result.documents.filter((d: any) =>
          d.title?.toLowerCase().includes(q) || d.titleAr?.toLowerCase().includes(q) || d.documentId?.toLowerCase().includes(q)
        );
      }
      return result;
    }

    case "get_threat_map": {
      return await getThreatMapData();
    }

    case "get_audit_log": {
      const logs = await getAuditLogs({
        category: params.category,
        limit: params.limit || 50,
      });
      return {
        total: logs.length,
        logs: logs.slice(0, 30).map((l: any) => ({
          action: l.action,
          category: l.category,
          userName: l.userName,
          details: l.details?.substring(0, 200),
          createdAt: l.createdAt,
        })),
      };
    }

    case "get_system_health": {
      const retention = await getRetentionPolicies();
      const stats = await getDashboardStats();
      const apiKeys = await getApiKeys();
      return {
        status: "operational",
        database: stats ? "connected" : "disconnected",
        retentionPolicies: retention,
        apiKeysCount: apiKeys.length,
        stats,
      };
    }

    case "analyze_trends": {
      const allLeaks = await getLeaks();
      const result: any = { totalLeaks: allLeaks.length };

      if (params.analysis_type === "severity_distribution" || params.analysis_type === "comprehensive") {
        const dist: Record<string, number> = {};
        allLeaks.forEach((l: any) => { dist[l.severity] = (dist[l.severity] || 0) + 1; });
        result.severityDistribution = dist;
      }
      if (params.analysis_type === "source_distribution" || params.analysis_type === "comprehensive") {
        const dist: Record<string, number> = {};
        allLeaks.forEach((l: any) => { dist[l.source] = (dist[l.source] || 0) + 1; });
        result.sourceDistribution = dist;
      }
      if (params.analysis_type === "sector_distribution" || params.analysis_type === "comprehensive") {
        const dist: Record<string, number> = {};
        allLeaks.forEach((l: any) => {
          const sec = l.sectorAr || l.sector;
          dist[sec] = (dist[sec] || 0) + 1;
        });
        result.sectorDistribution = dist;
      }
      if (params.analysis_type === "pii_types" || params.analysis_type === "comprehensive") {
        const dist: Record<string, number> = {};
        allLeaks.forEach((l: any) => {
          if (Array.isArray(l.piiTypes)) {
            l.piiTypes.forEach((p: string) => { dist[p] = (dist[p] || 0) + 1; });
          }
        });
        result.piiTypeDistribution = dist;
      }
      if (params.analysis_type === "time_trend" || params.analysis_type === "comprehensive") {
        const byMonth: Record<string, number> = {};
        allLeaks.forEach((l: any) => {
          if (l.detectedAt) {
            const d = new Date(l.detectedAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            byMonth[key] = (byMonth[key] || 0) + 1;
          }
        });
        result.monthlyTrend = byMonth;
      }
      if (params.analysis_type === "comprehensive") {
        const totalRecords = allLeaks.reduce((s: number, l: any) => s + (l.recordCount || 0), 0);
        result.totalRecordsExposed = totalRecords;
        result.averageRecordsPerLeak = allLeaks.length > 0 ? Math.round(totalRecords / allLeaks.length) : 0;
      }
      return result;
    }

    case "get_platform_guide": {
      return getPlatformGuide(params.topic);
    }

    // ─── Audit Agent ────────────────────────────────────────
    case "analyze_user_activity": {
      const logs = await getAuditLogs({
        category: params.category !== "all" ? params.category : undefined,
        limit: params.limit || 100,
      });

      let filtered = logs;

      // Filter by user name
      if (params.user_name) {
        const nameQuery = params.user_name.toLowerCase();
        filtered = filtered.filter((l: any) =>
          l.userName?.toLowerCase().includes(nameQuery)
        );
      }

      // Filter by action search
      if (params.action_search) {
        const actionQuery = params.action_search.toLowerCase();
        filtered = filtered.filter((l: any) =>
          l.action?.toLowerCase().includes(actionQuery) ||
          l.details?.toLowerCase().includes(actionQuery)
        );
      }

      // Build activity summary
      const userSummary: Record<string, { count: number; actions: string[]; lastAction: any }> = {};
      for (const log of filtered) {
        const name = log.userName || "غير معروف";
        if (!userSummary[name]) {
          userSummary[name] = { count: 0, actions: [], lastAction: null };
        }
        userSummary[name].count++;
        if (!userSummary[name].actions.includes(log.action)) {
          userSummary[name].actions.push(log.action);
        }
        if (!userSummary[name].lastAction || new Date(log.createdAt) > new Date(userSummary[name].lastAction.createdAt)) {
          userSummary[name].lastAction = {
            action: log.action,
            category: log.category,
            details: log.details?.substring(0, 200),
            createdAt: log.createdAt,
          };
        }
      }

      // Category breakdown
      const categoryBreakdown: Record<string, number> = {};
      filtered.forEach((l: any) => {
        categoryBreakdown[l.category] = (categoryBreakdown[l.category] || 0) + 1;
      });

      return {
        totalActivities: filtered.length,
        userSummary,
        categoryBreakdown,
        recentActivities: filtered.slice(0, 20).map((l: any) => ({
          userName: l.userName,
          action: l.action,
          category: l.category,
          details: l.details?.substring(0, 200),
          createdAt: l.createdAt,
        })),
      };
    }

    // ─── Knowledge Agent ────────────────────────────────────
    case "search_knowledge_base": {
      const entries = await getKnowledgeBaseEntries({
        search: params.search_query,
        category: params.category !== "all" ? params.category : undefined,
        isPublished: true,
        limit: 10,
      });

      if (entries.length === 0) {
        // Fall back to platform guide
        const guide = getPlatformGuide(params.search_query);
        return {
          source: "platform_guide",
          entries: [],
          fallbackGuide: guide,
        };
      }

      return {
        source: "knowledge_base",
        total: entries.length,
        entries: entries.map((e) => ({
          entryId: e.entryId,
          category: e.category,
          title: e.titleAr || e.title,
          content: (e.contentAr || e.content)?.substring(0, 2000),
          tags: e.tags,
          viewCount: e.viewCount,
          helpfulCount: e.helpfulCount,
        })),
      };
    }

    // ─── Analytics Agent — Correlations ─────────────────────
    case "get_correlations": {
      const allLeaks = await getLeaks();
      const sellers = await getSellerProfiles();
      const result: any = { analysisType: params.correlation_type };

      if (params.correlation_type === "seller_sector" || params.correlation_type === "comprehensive") {
        // Which sellers target which sectors
        const sellerSectorMap: Record<string, Record<string, number>> = {};
        for (const leak of allLeaks) {
          const sector = leak.sectorAr || leak.sector;
          // Try to match seller from leak data
          for (const seller of sellers) {
            const sellerName = (seller as any).aliasAr || (seller as any).alias;
            if (leak.description?.includes(sellerName) || leak.title?.includes(sellerName)) {
              if (!sellerSectorMap[sellerName]) sellerSectorMap[sellerName] = {};
              sellerSectorMap[sellerName][sector] = (sellerSectorMap[sellerName][sector] || 0) + 1;
            }
          }
        }
        result.sellerSectorCorrelations = sellerSectorMap;
      }

      if (params.correlation_type === "source_severity" || params.correlation_type === "comprehensive") {
        // Source vs severity distribution
        const matrix: Record<string, Record<string, number>> = {};
        for (const leak of allLeaks) {
          if (!matrix[leak.source]) matrix[leak.source] = {};
          matrix[leak.source][leak.severity] = (matrix[leak.source][leak.severity] || 0) + 1;
        }
        result.sourceSeverityMatrix = matrix;
      }

      if (params.correlation_type === "time_pattern" || params.correlation_type === "comprehensive") {
        // Day-of-week and hour patterns
        const dayPattern: Record<string, number> = {};
        const hourPattern: Record<string, number> = {};
        const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        for (const leak of allLeaks) {
          if (leak.detectedAt) {
            const d = new Date(leak.detectedAt);
            dayPattern[dayNames[d.getDay()]] = (dayPattern[dayNames[d.getDay()]] || 0) + 1;
            const hour = `${String(d.getHours()).padStart(2, "0")}:00`;
            hourPattern[hour] = (hourPattern[hour] || 0) + 1;
          }
        }
        result.dayOfWeekPattern = dayPattern;
        result.hourOfDayPattern = hourPattern;
      }

      if (params.correlation_type === "pii_correlation" || params.correlation_type === "comprehensive") {
        // Which PII types appear together
        const coOccurrence: Record<string, Record<string, number>> = {};
        for (const leak of allLeaks) {
          if (Array.isArray(leak.piiTypes) && leak.piiTypes.length > 1) {
            for (let i = 0; i < leak.piiTypes.length; i++) {
              for (let j = i + 1; j < leak.piiTypes.length; j++) {
                const key = leak.piiTypes[i];
                const val = leak.piiTypes[j];
                if (!coOccurrence[key]) coOccurrence[key] = {};
                coOccurrence[key][val] = (coOccurrence[key][val] || 0) + 1;
              }
            }
          }
        }
        result.piiCoOccurrence = coOccurrence;
      }

      if (params.correlation_type === "anomaly_detection" || params.correlation_type === "comprehensive") {
        // Detect anomalies: sudden spikes, unusual sources, etc.
        const anomalies: string[] = [];
        
        // Check for severity spikes
        const recentLeaks = allLeaks.filter((l: any) => {
          const d = new Date(l.detectedAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d > weekAgo;
        });
        const olderLeaks = allLeaks.filter((l: any) => {
          const d = new Date(l.detectedAt);
          const weekAgo = new Date();
          const twoWeeksAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          return d > twoWeeksAgo && d <= weekAgo;
        });

        if (recentLeaks.length > olderLeaks.length * 1.5 && olderLeaks.length > 0) {
          anomalies.push(`زيادة ملحوظة: ${recentLeaks.length} حالة رصد هذا الأسبوع مقابل ${olderLeaks.length} الأسبوع الماضي (زيادة ${Math.round((recentLeaks.length / olderLeaks.length - 1) * 100)}%)`);
        }

        const recentCritical = recentLeaks.filter((l: any) => l.severity === "critical");
        if (recentCritical.length > 3) {
          anomalies.push(`تنبيه: ${recentCritical.length} حالات رصد واسعة النطاق هذا الأسبوع — يتطلب اهتمام فوري`);
        }

        // Check for new sources
        const recentSources = new Set(recentLeaks.map((l: any) => l.source));
        const olderSources = new Set(olderLeaks.map((l: any) => l.source));
        for (const src of Array.from(recentSources)) {
          if (!olderSources.has(src)) {
            anomalies.push(`مصدر جديد: ظهور حالات رصد من مصدر "${src}" لأول مرة هذا الأسبوع`);
          }
        }

        result.anomalies = anomalies.length > 0 ? anomalies : ["لم يتم اكتشاف أنماط غير عادية"];
        result.recentLeaksCount = recentLeaks.length;
        result.previousWeekCount = olderLeaks.length;
      }

      if (params.focus_entity) {
        // Focus analysis on a specific entity
        const entity = params.focus_entity.toLowerCase();
        const relatedLeaks = allLeaks.filter((l: any) =>
          l.title?.toLowerCase().includes(entity) ||
          l.titleAr?.toLowerCase().includes(entity) ||
          l.description?.toLowerCase().includes(entity) ||
          l.descriptionAr?.toLowerCase().includes(entity) ||
          l.sectorAr?.toLowerCase().includes(entity) ||
          l.sector?.toLowerCase().includes(entity)
        );
        result.focusEntity = params.focus_entity;
        result.relatedLeaksCount = relatedLeaks.length;
        result.relatedLeaks = relatedLeaks.slice(0, 10).map((l: any) => ({
          leakId: l.leakId,
          title: l.titleAr || l.title,
          severity: l.severity,
          source: l.source,
          detectedAt: l.detectedAt,
        }));
      }

      return result;
    }

    case "get_platform_users_info": {
      const platformUsersData = await getAllPlatformUsers();
      return {
        total: platformUsersData.length,
        users: platformUsersData.map((u: any) => ({
          id: u.id,
          userId: u.userId,
          name: u.name,
          displayName: u.displayName,
          email: u.email,
          role: u.platformRole,
          status: u.status,
          lastLogin: u.lastLoginAt,
          createdAt: u.createdAt,
        })),
      };
    }

    // ─── Personality Agent Cases ─────────────────────────────
    case "get_personality_greeting": {
      const result = await getGreetingForUser(params.userId || "unknown", params.userName || "مستخدم");
      return result;
    }

    case "check_leader_mention": {
      const msg = (params.message || "").toLowerCase();
      
      // VIP Leaders of Rasid Initiative - hardcoded for reliability
      const VIP_LEADERS = [
        {
          keywords: ["الربدي", "المعالي", "معالي القائد", "قائد المبادرة"],
          name: "الربدي",
          title: "معالي قائد مبادرة راصد الوطنية",
          imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/EyXIbPHjtTKGlhZg.png",
          type: "leader" as const,
          respectPhrases: [
            "حفظه الله ورعاه — صاحب الرؤية الثاقبة والتوجيهات السديدة التي تقود مبادرة راصد الوطنية نحو التميز",
            "حفظه الله — بتوجيهاته الحكيمة تسير مبادرة راصد بخطى ثابتة لحماية البيانات الوطنية",
            "أدام الله عزه — قائد ملهم يرسم مستقبل حماية البيانات الشخصية في المملكة",
          ],
        },
        {
          keywords: ["السرحان", "مشعل السرحان", "مشعل", "نائب المعالي", "سعادة النائب"],
          name: "مشعل السرحان",
          title: "سعادة نائب معالي قائد المبادرة",
          imageUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/jZnDsXzrTXOCeTwv.jpg",
          type: "deputy" as const,
          respectPhrases: [
            "حفظه الله — الذراع الأيمن لمعالي القائد، وبجهوده المتميزة تتقدم مبادرة راصد",
            "حفظه الله — ركيزة أساسية في نجاح مبادرة راصد والساعد الأول لمعالي القائد",
            "حفظه الله — بمتابعته الدقيقة وإشرافه المستمر تتحقق أهداف راصد",
          ],
        },
        {
          keywords: ["الرحيلي", "محمد الرحيلي"],
          name: "محمد الرحيلي",
          title: "معلمنا الأكبر",
          imageUrl: null,
          type: "team" as const,
          respectPhrases: [
            "هذا معلمنا الأكبر وما نقدر نتكلم فيه لأنه راح يرصدنا 😄😂 الله يحفظه ويوفقه!",
            "أبو محمد! هذا الرجال اللي ما نقدر نتكلم عنه براحة لأنه راح يرصدنا قبل لا نكمل الجملة 😂😄 الله يعطيه العافية!",
            "محمد الرحيلي — معلمنا وأستاذنا! بس خلني أخفض صوتي لأنه راح يرصدنا 😄😂 الله يحفظه!",
          ],
        },
        {
          keywords: ["المعتاز", "منال المعتاز", "منال"],
          name: "منال المعتاز",
          title: "مديرتنا الجديدة",
          imageUrl: null,
          type: "team" as const,
          respectPhrases: [
            "مديرتنا الجديدة الأستاذة منال المعتاز — حفظها الله، إضافة مميزة لفريق راصد ونتطلع لإنجازاتها",
            "الأستاذة منال المعتاز — مديرتنا الجديدة حفظها الله، نرحب بها ونتمنى لها التوفيق في قيادة فريق راصد",
            "الأستاذة منال المعتاز — حفظها الله، مديرتنا الجديدة وإضافة قيمة لمسيرة راصد",
          ],
        },
      ];

      // Check for VIP leader mentions first
      for (const leader of VIP_LEADERS) {
        for (const keyword of leader.keywords) {
          if (msg.includes(keyword)) {
            const phrase = leader.respectPhrases[Math.floor(Math.random() * leader.respectPhrases.length)];
            return {
              found: true,
              name: leader.name,
              title: leader.title,
              imageUrl: leader.imageUrl,
              type: leader.type,
              respectPhrase: phrase,
              message: `تم العثور على إشارة لـ: ${leader.name} (${leader.title})`,
              instruction: "لا تضع الصورة في ردك. الواجهة الأمامية تعرض بطاقة VIP تلقائياً مع الصورة. اكتب فقط عبارات الاحترام والترحيب في النص.",
            };
          }
        }
      }

      // Fallback to database scenarios
      const respectPhrase = await checkLeaderMention(params.message || "");
      return {
        found: !!respectPhrase,
        respectPhrase: respectPhrase || null,
        name: null,
        title: null,
        imageUrl: null,
        type: null,
        message: respectPhrase ? "تم العثور على إشارة لقائد" : "لا توجد إشارة لقائد",
      };
    }

    case "manage_personality_scenarios": {
      const { action: scenarioAction, scenarioType, triggerKeyword, responseTemplate, scenarioId, isActive } = params;
      switch (scenarioAction) {
        case "list": {
          const scenarios = scenarioType
            ? await getPersonalityScenarios(scenarioType)
            : await getPersonalityScenarios();
          return { scenarios, total: scenarios.length };
        }
        case "add": {
          if (!responseTemplate) return { error: "يجب توفير قالب الرد" };
          const { createPersonalityScenario } = await import("./db");
          const newId = await createPersonalityScenario({
            scenarioType: scenarioType || "custom",
            triggerKeyword: triggerKeyword || null,
            responseTemplate,
            isActive: isActive !== false,
          });
          return { success: true, id: newId, message: "تم إضافة السيناريو بنجاح" };
        }
        case "update": {
          if (!scenarioId) return { error: "يجب توفير معرف السيناريو" };
          const { updatePersonalityScenario } = await import("./db");
          const updateData: any = {};
          if (responseTemplate) updateData.responseTemplate = responseTemplate;
          if (triggerKeyword !== undefined) updateData.triggerKeyword = triggerKeyword;
          if (isActive !== undefined) updateData.isActive = isActive;
          if (scenarioType) updateData.scenarioType = scenarioType;
          await updatePersonalityScenario(scenarioId, updateData);
          return { success: true, message: "تم تحديث السيناريو بنجاح" };
        }
        case "delete": {
          if (!scenarioId) return { error: "يجب توفير معرف السيناريو" };
          const { deletePersonalityScenario } = await import("./db");
          await deletePersonalityScenario(scenarioId);
          return { success: true, message: "تم حذف السيناريو بنجاح" };
        }
        default:
          return { error: "إجراء غير معروف" };
      }
    }

    // ═══ EXECUTION TOOLS ═══
    case "execute_live_scan": {
      const targets = params.targets || [];
      const sources = params.sources || ["xposedornot", "crtsh", "psbdmp", "googledork", "breachdirectory", "github", "dehashed", "intelx"];
      try {
        const session = await executeScan(targets, sources);
        await logAudit(0, "rasid.live_scan", `راصد الذكي نفذ فحص مباشر لـ: ${targets.join(", ")}`, "monitoring", "راصد الذكي");
        return {
          success: true,
          scanId: session.id,
          status: session.status,
          totalFindings: session.totalFindings,
          findings: session.results.slice(0, 10),
          message: `تم الفحص بنجاح. تم العثور على ${session.totalFindings} نتيجة.`,
        };
      } catch (e: any) {
        return { success: false, error: e.message || "فشل الفحص" };
      }
    }

    case "execute_pii_scan": {
      const text = params.text || "";
      const patterns = [
        { type: "National ID", typeAr: "رقم الهوية الوطنية", regex: /\b1\d{9}\b/g },
        { type: "Iqama Number", typeAr: "رقم الإقامة", regex: /\b2\d{9}\b/g },
        { type: "Saudi Phone", typeAr: "رقم جوال سعودي", regex: /\b05\d{8}\b/g },
        { type: "IBAN", typeAr: "رقم الحساب البنكي", regex: /\bSA\d{22}\b/g },
        { type: "Credit Card", typeAr: "بطاقة ائتمان", regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g },
        { type: "Email", typeAr: "بريد إلكتروني", regex: /\b[\w.-]+@[\w.-]+\.\w+\b/gi },
        { type: "Credentials", typeAr: "بيانات تسجيل الدخول", regex: /(?:password|passwd|pass|كلمة.?(?:المرور|السر))[:\s]+\S+/gi },
        { type: "IP Address", typeAr: "عنوان IP", regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g },
      ];
      const results: Array<{ type: string; typeAr: string; value: string; line: number }> = [];
      const lines = text.split("\n");
      lines.forEach((line: string, lineIdx: number) => {
        for (const pattern of patterns) {
          const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
          let match;
          while ((match = regex.exec(line)) !== null) {
            results.push({ type: pattern.type, typeAr: pattern.typeAr, value: match[0], line: lineIdx + 1 });
          }
        }
      });
      await logAudit(0, "rasid.pii_scan", `راصد الذكي نفذ فحص PII: ${results.length} تطابق`, "pii", "راصد الذكي");
      return { success: true, totalMatches: results.length, results: results.slice(0, 20), message: `تم العثور على ${results.length} بيانات شخصية` };
    }

    case "create_leak_record": {
      try {
        const leakId = await createLeak({
          leakId: `RASID-${Date.now()}`,
          title: params.title || "Leak from Rasid AI",
          titleAr: params.titleAr || "حالة رصد من راصد الذكي",
          source: (params.source === "telegram" || params.source === "darkweb" || params.source === "paste") ? params.source : "darkweb",
          severity: params.severity || "medium",
          status: "new",
          recordCount: params.recordCount || 0,
          sector: params.sector || "غير محدد",
          sectorAr: params.sector || "غير محدد",
          piiTypes: [],
          description: params.description || null,
          descriptionAr: params.descriptionAr || params.description || null,
          detectedAt: new Date(),
        });
        await logAudit(0, "rasid.create_leak", `راصد الذكي أنشأ حالة رصد: ${params.titleAr || params.title}`, "leak", "راصد الذكي");
        return { success: true, leakId, message: `تم إنشاء حالة الرصد بنجاح (رقم: ${leakId})` };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }

    case "update_leak_status": {
      try {
        await updateLeakStatus(params.leakId, params.status);
        await logAudit(0, "rasid.update_leak", `راصد الذكي حدث حالة حالة الرصد #${params.leakId} إلى ${params.status}`, "leak", "راصد الذكي");
        return { success: true, message: `تم تحديث حالة حالة الرصد #${params.leakId} إلى ${params.status}` };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }

    case "generate_report": {
      try {
        const reportId = await createReport({
          title: params.title || "AI Generated Report",
          titleAr: params.titleAr || "تقرير من راصد الذكي",
          type: params.type || "special",
          generatedBy: 0,
        });
        await logAudit(0, "rasid.create_report", `راصد الذكي أنشأ تقرير: ${params.titleAr || params.title}`, "report", "راصد الذكي");
        return { success: true, reportId, message: `تم إنشاء التقرير بنجاح (رقم: ${reportId})` };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }

    case "create_alert_channel": {
      try {
        const channelId = await createAlertContact({
          name: params.name || "قناة جديدة",
          email: params.config || null,
          channels: [params.type || "email"],
          isActive: true,
        });
        await logAudit(0, "rasid.create_channel", `راصد الذكي أنشأ قناة تنبيه: ${params.name}`, "monitoring", "راصد الذكي");
        return { success: true, channelId, message: `تم إنشاء قناة التنبيه بنجاح` };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }

    case "create_alert_rule": {
      try {
        const ruleId = await createAlertRule({
          name: params.name || "New Rule",
          nameAr: params.nameAr || "قاعدة جديدة",
          severityThreshold: params.severity || "medium",
          channel: "email",
          isEnabled: true,
        });
        await logAudit(0, "rasid.create_rule", `راصد الذكي أنشأ قاعدة تنبيه: ${params.nameAr || params.name}`, "monitoring", "راصد الذكي");
        return { success: true, ruleId, message: `تم إنشاء قاعدة التنبيه بنجاح` };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // ATLAS BREACH DATA TOOLS
    // ═══════════════════════════════════════════════════════════════
    case "query_atlas_breaches": {
      const { queryAtlasBreaches } = await import("./atlasData");
      return queryAtlasBreaches({
        sector: params.sector,
        severity: params.severity,
        platform: params.platform,
        threat_actor: params.threat_actor,
        search: params.search,
        limit: params.limit,
      });
    }

    case "get_atlas_breach_details": {
      const { getAtlasBreachDetails } = await import("./atlasData");
      return getAtlasBreachDetails(params.breach_id);
    }

    case "get_atlas_stats": {
      const { getAtlasStats } = await import("./atlasData");
      return getAtlasStats();
    }

    case "analyze_atlas_trends": {
      const { analyzeAtlasTrends } = await import("./atlasData");
      return analyzeAtlasTrends(params.analysis_type);
    }

    // ═══ CHART & DASHBOARD GENERATION ═══
    case "generate_chart": {
      const { ChartDataEngine } = await import("./rasidEnhancements/chartDataEngine");
      const allLeaks = await getLeaks();
      const engine = new ChartDataEngine(allLeaks);
      const chartData = engine.getChartData(params.data_type, params.params || {});
      
      if (chartData.error) return chartData;

      // Use smartChartEngine to suggest chart type if not specified
      let chartType = params.chart_type;
      if (!chartType) {
        const suggestion = smartChartEngine.suggestChartType(
          chartData,
          params.data_type
        );
        chartType = suggestion.chartType;
      }

      // Color palettes for different chart types
      const CHART_COLORS = [
        "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981",
        "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#06b6d4",
        "#84cc16", "#a855f7"
      ];
      const SEVERITY_COLORS: Record<string, string> = {
        "Critical": "#ef4444", "High": "#f97316", "Medium": "#f59e0b", "Low": "#10b981"
      };

      let chartConfig: any;
      const title = params.title || `مخطط ${params.data_type}`;

      // Build datasets based on data structure
      if (params.data_type === "monthly_trend") {
        chartConfig = {
          type: chartType === "area" ? "line" : chartType,
          data: {
            labels: chartData.labels,
            datasets: [
              {
                label: "عدد الحوادث",
                data: chartData.incidents,
                borderColor: CHART_COLORS[0],
                backgroundColor: chartType === "area" || chartType === "line" ? `${CHART_COLORS[0]}33` : CHART_COLORS[0],
                fill: chartType === "area",
                tension: 0.4,
              },
              {
                label: "ادعاء البائع",
                data: chartData.records,
                borderColor: CHART_COLORS[1],
                backgroundColor: chartType === "area" || chartType === "line" ? `${CHART_COLORS[1]}33` : CHART_COLORS[1],
                fill: chartType === "area",
                tension: 0.4,
                yAxisID: "y1",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { title: { display: true, text: title, font: { family: "Tajawal", size: 16 } } },
            scales: {
              y: { position: "left", title: { display: true, text: "الحوادث" } },
              y1: { position: "right", title: { display: true, text: "السجلات" }, grid: { drawOnChartArea: false } },
            },
          },
        };
      } else if (params.data_type === "sector_comparison") {
        chartConfig = {
          type: "bar",
          data: {
            labels: chartData.labels,
            datasets: [
              { label: "عدد الحوادث", data: chartData.incidentCounts, backgroundColor: CHART_COLORS[0] },
              { label: "متوسط السجلات", data: chartData.avgRecords, backgroundColor: CHART_COLORS[1] },
            ],
          },
          options: {
            responsive: true,
            plugins: { title: { display: true, text: title, font: { family: "Tajawal", size: 16 } } },
          },
        };
      } else if (params.data_type === "sector_radar") {
        chartConfig = {
          type: "radar",
          data: {
            labels: chartData.labels,
            datasets: [{
              label: params.params?.sector || "القطاع",
              data: chartData.data,
              borderColor: CHART_COLORS[0],
              backgroundColor: `${CHART_COLORS[0]}33`,
              pointBackgroundColor: CHART_COLORS[0],
            }],
          },
          options: {
            responsive: true,
            plugins: { title: { display: true, text: title, font: { family: "Tajawal", size: 16 } } },
            scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } },
          },
        };
      } else {
        // Standard single-dataset charts (bar, pie, doughnut, etc.)
        const colors = params.data_type === "severity_distribution"
          ? chartData.labels.map((l: string) => SEVERITY_COLORS[l] || CHART_COLORS[0])
          : chartData.labels.map((_: any, i: number) => CHART_COLORS[i % CHART_COLORS.length]);

        const mappedType = chartType === "horizontalBar" ? "bar" : chartType === "area" ? "line" : chartType;
        chartConfig = {
          type: mappedType,
          data: {
            labels: chartData.labels,
            datasets: [{
              label: title,
              data: chartData.data,
              backgroundColor: ["pie", "doughnut", "polarArea"].includes(mappedType) ? colors : colors[0],
              borderColor: ["pie", "doughnut", "polarArea"].includes(mappedType) ? colors.map((c: string) => c) : colors[0],
              borderWidth: 1,
              fill: chartType === "area",
              tension: 0.4,
            }],
          },
          options: {
            responsive: true,
            indexAxis: chartType === "horizontalBar" ? "y" : "x",
            plugins: { title: { display: true, text: title, font: { family: "Tajawal", size: 16 } } },
          },
        };
      }

      // Generate insights using smartChartEngine
      const insights = smartChartEngine.generateInsights(chartData, chartType as any);

      return {
        __type: "chart",
        chartConfig,
        insights,
        summary: `تم توليد مخطط ${chartType} لـ ${params.data_type} (${chartData.labels?.length || 0} عنصر)`,
      };
    }

    case "generate_dashboard": {
      const { ChartDataEngine } = await import("./rasidEnhancements/chartDataEngine");
      const allLeaks = await getLeaks();
      const engine = new ChartDataEngine(allLeaks);
      const stats = await getDashboardStats();

      const CHART_COLORS = [
        "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981",
        "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#06b6d4"
      ];

      const title = params.title || "لوحة المؤشرات";
      const dashboardType = params.dashboard_type || "executive";

      // Define chart configurations per dashboard type
      let chartsConfig: Array<{ type: string; title: string; data: any }> = [];

      const buildSimpleChart = (type: string, chartTitle: string, dataResult: any, colors?: string[]) => {
        const c = colors || dataResult.labels.map((_: any, i: number) => CHART_COLORS[i % CHART_COLORS.length]);
        return {
          type,
          title: chartTitle,
          data: {
            labels: dataResult.labels,
            datasets: [{
              label: chartTitle,
              data: dataResult.data,
              backgroundColor: ["pie", "doughnut", "polarArea"].includes(type) ? c : c[0],
              borderColor: c,
              borderWidth: 1,
              tension: 0.4,
            }],
          },
        };
      };

      switch (dashboardType) {
        case "executive":
          chartsConfig = [
            buildSimpleChart("doughnut", "توزيع مستوى التأثير", engine.getSeverityDistribution(), ["#ef4444", "#f97316", "#f59e0b", "#10b981"]),
            buildSimpleChart("bar", "توزيع القطاعات", engine.getSectorDistribution()),
            buildSimpleChart("pie", "توزيع المصادر", engine.getSourceDistribution()),
            buildSimpleChart("bar", "أكبر 10 حوادث", engine.getTopIncidentsByRecords(10)),
          ];
          break;
        case "sector":
          chartsConfig = [
            buildSimpleChart("bar", "توزيع القطاعات", engine.getSectorDistribution()),
            buildSimpleChart("bar", "طرق الاختراق", engine.getBreachMethodDistribution()),
            buildSimpleChart("doughnut", "أنواع البيانات المعروضة", engine.getPiiDistribution()),
          ];
          if (params.sector) {
            chartsConfig.push({
              type: "radar",
              title: `تحليل قطاع ${params.sector}`,
              data: {
                labels: engine.getSectorRadarData(params.sector).labels,
                datasets: [{
                  label: params.sector,
                  data: engine.getSectorRadarData(params.sector).data,
                  borderColor: CHART_COLORS[0],
                  backgroundColor: `${CHART_COLORS[0]}33`,
                }],
              },
            });
          }
          break;
        case "threat":
          chartsConfig = [
            buildSimpleChart("doughnut", "توزيع مستوى التأثير", engine.getSeverityDistribution(), ["#ef4444", "#f97316", "#f59e0b", "#10b981"]),
            buildSimpleChart("bar", "طرق الاختراق", engine.getBreachMethodDistribution()),
            buildSimpleChart("pie", "توزيع المصادر", engine.getSourceDistribution()),
            buildSimpleChart("bar", "توزيع المناطق", engine.getRegionDistribution()),
          ];
          break;
        case "compliance":
          chartsConfig = [
            buildSimpleChart("bar", "توزيع الغرامات", engine.getFineDistribution()),
            buildSimpleChart("doughnut", "أنواع البيانات المعروضة", engine.getPiiDistribution()),
            buildSimpleChart("bar", "توزيع القطاعات", engine.getSectorDistribution()),
          ];
          break;
        case "custom":
          if (params.charts && Array.isArray(params.charts)) {
            for (const ch of params.charts) {
              const d = engine.getChartData(ch.data_type, {});
              if (!d.error) {
                chartsConfig.push(buildSimpleChart(ch.chart_type || "bar", ch.title || ch.data_type, d));
              }
            }
          }
          break;
      }

      return {
        __type: "dashboard",
        title,
        dashboardType,
        kpis: {
          totalIncidents: stats?.totalLeaks || allLeaks.length,
          totalRecords: stats?.totalRecords || allLeaks.reduce((s: number, l: any) => s + (l.recordCount || 0), 0),
          criticalCount: allLeaks.filter((l: any) => l.severity === "Critical" || l.severity === "critical").length,
          highCount: allLeaks.filter((l: any) => l.severity === "High" || l.severity === "high").length,
        },
        charts: chartsConfig,
        summary: `لوحة مؤشرات ${dashboardType} تحتوي على ${chartsConfig.length} مخطط`,
      };
    }

    // ═══ PRIVACY & COMPLIANCE TOOLS ═══
    case "get_privacy_assessments": {
      const { getPrivacyAssessments } = await import("./privacyData");
      return await getPrivacyAssessments(params.entityId, params.status);
    }
    case "get_privacy_policies": {
      const { getPrivacyPolicies } = await import("./privacyData");
      return await getPrivacyPolicies(params.entityId, params.status);
    }
    case "get_dsar_requests": {
      const { getDsarRequests } = await import("./privacyData");
      return await getDsarRequests(params.status, params.requestType);
    }
    case "get_processing_records": {
      const { getProcessingRecords } = await import("./privacyData");
      return await getProcessingRecords(params.entityId, params.lawfulBasis);
    }
    case "get_privacy_impact_assessments": {
      const { getPrivacyImpactAssessments } = await import("./privacyData");
      return await getPrivacyImpactAssessments(params.status, params.riskLevel);
    }
    case "get_consent_records": {
      const { getConsentRecords } = await import("./privacyData");
      return await getConsentRecords(params.entityId, params.status);
    }
    case "get_compliance_dashboard": {
      const { getComplianceDashboard } = await import("./privacyData");
      return await getComplianceDashboard();
    }
    case "get_pdpl_article_info": {
      const { getPdplArticleInfo } = await import("./privacyData");
      return getPdplArticleInfo(params.articleNumber, params.topic);
    }
    case "get_entities_compliance_status": {
      const { getEntitiesComplianceStatus } = await import("./privacyData");
      return await getEntitiesComplianceStatus(params.sector, params.complianceLevel);
    }
    case "analyze_leak_compliance_impact": {
      const { analyzeLeakComplianceImpact } = await import("./privacyData");
      return await analyzeLeakComplianceImpact(params.leakId, params.entityId);
    }

    default:
      return { error: `أداة غير معروفة: ${toolName}` };
  }
}

// ═══════════════════════════════════════════════════════════════
// PLATFORM KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════

function getPlatformGuide(topic: string): any {
  const guides: Record<string, any> = {
    severity_levels: {
      title: "تصنيف حوادث التسرب",
      content: `
تصنيف حوادث التسرب في منصة راصد:

| المستوى | الوصف | المعايير |
|---------|-------|----------|
| critical | واسع النطاق | بيانات حساسة جداً (هوية، مالية) + أكثر من 10,000 سجل |
| high | كبير | بيانات شخصية حساسة + أكثر من 1,000 سجل |
| medium | متوسط | بيانات شخصية عامة أو أقل من 1,000 سجل |
| low | محدود | حالة رصد محدود أو بيانات غير حساسة |

الإجراءات المطلوبة:
- critical: توثيق فوري + تحقيق عاجل + تقرير خلال 24 ساعة
- high: تحقيق خلال 48 ساعة + تقرير أسبوعي
- medium: مراجعة خلال أسبوع
- low: أرشفة ومتابعة`
    },
    pdpl_compliance: {
      title: "نظام حماية البيانات الشخصية PDPL",
      content: `
نظام حماية البيانات الشخصية (PDPL) — المواد ذات الصلة:

المادة 10: حماية البيانات الشخصية — يجب اتخاذ التدابير اللازمة لحماية البيانات
المادة 14: الإفصاح عن حالات الرصد — يجب إشعار الجهة المختصة خلال 72 ساعة
المادة 19: حقوق أصحاب البيانات — حق الوصول والتصحيح والحذف
المادة 24: العقوبات — غرامات تصل إلى 5 ملايين ريال
المادة 32: الالتزامات الأمنية — تطبيق معايير أمنية مناسبة`,
    },
    evidence_chain: {
      title: "سلسلة حفظ الأدلة",
      content: `
سلسلة حفظ الأدلة الرقمية في راصد:
1. الالتقاط: تسجيل الدليل فور اكتشافه (screenshot, web archive, file)
2. التجزئة: حساب SHA-256 hash للملف
3. التوقيع: HMAC-SHA256 لضمان السلامة
4. التخزين: حفظ آمن مع metadata
5. التحقق: فحص دوري لسلامة الأدلة
6. التوثيق: ربط الدليل بحالة الرصد والمحلل`,
    },
    pii_types: {
      title: "أنواع البيانات الشخصية المدعومة",
      content: `
أنواع PII المدعومة في راصد:
- national_id: رقم الهوية الوطنية (10 أرقام تبدأ بـ 1 أو 2)
- iqama: رقم الإقامة (10 أرقام تبدأ بـ 2)
- phone: رقم هاتف سعودي (+966 أو 05)
- email: بريد إلكتروني
- iban: رقم آيبان سعودي (SA + 22 رقم)
- credit_card: بطاقة ائتمان (Luhn validation)
- passport: رقم جواز سفر
- address: عنوان وطني
- medical_record: سجل طبي
- salary: معلومات راتب
- gosi: رقم تأمينات اجتماعية
- license_plate: لوحة مركبة`,
    },
    monitoring: {
      title: "نظام المراقبة",
      content: `
مصادر المراقبة في راصد:
1. تليجرام: مراقبة قنوات ومجموعات
2. الدارك ويب: بحث في منتديات ومواقع
3. مواقع اللصق: Pastebin وبدائلها
4. وسائل التواصل: HIBP + Reddit + Twitter/X

أنواع الفحص:
- فحص مجدول: يعمل تلقائياً حسب الجدول
- فحص يدوي: يُشغّل بواسطة المحلل
- فحص مباشر: رصد في الوقت الحقيقي`,
    },
    reporting: {
      title: "نظام التقارير",
      content: `
أنواع التقارير في راصد:
1. تقرير تنفيذي PDF: ملخص شامل للإدارة العليا
2. تقرير NDMO Word: تقرير رسمي للمكتب الوطني
3. تقرير Excel شهري: بيانات مفصلة للتحليل
4. تقرير أدلة: توثيق أدلة حالة رصد محدد
5. تقرير مخصص: حسب معايير محددة
6. تقارير مجدولة: تلقائية حسب الجدول`,
    },
    user_roles: {
      title: "أدوار المستخدمين",
      content: `
أدوار المستخدمين في راصد:
- executive (تنفيذي): وصول كامل + تقارير + قرارات
- manager (مدير): إدارة حالات الرصد + التقارير + المستخدمين
- analyst (محلل): تحليل + تصنيف + ملاحظات
- viewer (مشاهد): عرض لوحة المعلومات فقط`,
    },
    best_practices: {
      title: "أفضل الممارسات",
      content: `
أفضل ممارسات إدارة حالات الرصد:
1. مراجعة حالات الرصد واسعة النطاق فوراً
2. توثيق الأدلة قبل أي إجراء
3. تحديث الحالة بانتظام
4. إشعار الجهات المعنية خلال 72 ساعة
5. مراجعة دقة النظام أسبوعياً
6. تحديث قواعد الكشف شهرياً
7. نسخ احتياطي يومي`,
    },
    troubleshooting: {
      title: "حل المشاكل",
      content: `
حل المشاكل الشائعة:
- فحص فاشل: تحقق من اتصال الإنترنت وصلاحيات API
- false positives كثيرة: راجع قواعد الكشف وعدّل الحدود
- بطء المنصة: تحقق من حجم قاعدة البيانات وسياسات الاحتفاظ
- قناة لا تعمل: تحقق من حالة القناة وصلاحيات الوصول
- أدلة تالفة: أعد فحص سلامة الأدلة`,
    },
  };

  const guide = guides[topic.toLowerCase()];
  if (guide) return guide;

  // Fuzzy match
  const topicLower = topic.toLowerCase();
  for (const [key, value] of Object.entries(guides)) {
    if (topicLower.includes(key) || key.includes(topicLower)) return value;
  }

  return {
    title: "دليل عام",
    content: `لم أجد دليلاً محدداً للموضوع "${topic}". المواضيع المتاحة: ${Object.keys(guides).join(", ")}. يمكنني مساعدتك في أي سؤال آخر عن المنصة.`,
    availableTopics: Object.keys(guides),
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN CHAT FUNCTION — Governor Agent with Thinking Steps
// ═══════════════════════════════════════════════════════════════

export async function rasidAIChat(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  userName: string,
  userId: number,
): Promise<{ response: string; toolsUsed: string[]; thinkingSteps: ThinkingStep[]; followUpSuggestions: string[]; processingMeta: { totalDurationMs: number; toolCount: number; agentsUsed: string[] }; toolResults?: any[] }> {
  // Initialize performance tracking
  const performanceTracker = new PerformanceTracker();
  performanceTracker.start();

  const thinkingSteps: ThinkingStep[] = [];
  const stats = await getDashboardStats();
  
  // Fetch knowledge base context
  let knowledgeContext = "";
  try {
    knowledgeContext = await getPublishedKnowledgeForAI();
  } catch {
    // Knowledge base may not be populated yet
  }

  // Validate question with guardrails
  const scopeCheck = guardrails.checkQuestionScope(message);
  if (!scopeCheck.allowed) {
    return {
      response: scopeCheck.reason || "هذا السؤال خارج نطاق المنصة",
      toolsUsed: [],
      thinkingSteps: [],
      followUpSuggestions: [],
      processingMeta: { totalDurationMs: 0, toolCount: 0, agentsUsed: [] },
    };
  }

  const injectionCheck = guardrails.detectPromptInjection(message);
  if (!injectionCheck.allowed) {
    return {
      response: injectionCheck.reason || "تم اكتشاف محاولة تلاعب",
      toolsUsed: [],
      thinkingSteps: [],
      followUpSuggestions: [],
      processingMeta: { totalDurationMs: 0, toolCount: 0, agentsUsed: [] },
    };
  }

  // Check cache for existing response
  const cachedResponse = responseCache.get(message);
  if (cachedResponse) {
    performanceTracker.markCacheHit();
    const metrics = performanceTracker.end();
    
    return {
      response: cachedResponse.response,
      toolsUsed: cachedResponse.metadata.toolsUsed,
      thinkingSteps: [],
      followUpSuggestions: [],
      processingMeta: { 
        totalDurationMs: metrics?.responseTimeMs || 0,
        toolCount: 0,
        agentsUsed: [],
      },
    };
  }

  // Use domain-aware system prompt (PR-01)
  const systemPrompt = buildDomainSystemPrompt(userName, stats, knowledgeContext);

  // Use conversation memory to manage history (reduces context size by 50%+)
  let conversationWindow: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
  try {
    conversationWindow = conversationMemory.buildConversationWindow(history);
  } catch (err) {
    console.warn("[ConversationMemory] Failed to build window, using fallback:", err);
    // Fallback to simple history slice if conversation memory fails
    conversationWindow = history.slice(-MAX_FALLBACK_HISTORY_SIZE).map((h) => ({ role: h.role, content: h.content }));
  }
  
  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...conversationWindow,
    { role: "user", content: message },
  ];

  const toolsUsed: string[] = [];
  let maxIterations = 8; // Increased for complex multi-step analysis

  // Add initial thinking step
  thinkingSteps.push({
    id: `think-${Date.now()}`,
    agent: "راصد الذكي",
    action: "analyze_intent",
    description: "تحليل نية المستخدم وتحديد الوكيل المختص",
    status: "completed",
    timestamp: new Date(),
    result: `استلام الطلب: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
  });

  try {
    let response = await invokeLLM({
      messages,
      tools: RASID_TOOLS,
      tool_choice: "auto",
    });

    // Collect all tool results for frontend rendering (charts, dashboards, etc.)
    const allToolResults: any[] = [];

    // Tool use loop — process tool calls iteratively
    while (maxIterations > 0) {
      const choice = response.choices?.[0];
      if (!choice) break;

      const hasToolCalls = choice.message?.tool_calls && choice.message.tool_calls.length > 0;
      
      if (hasToolCalls) {
        const toolCalls = choice.message!.tool_calls!;
        
        const normalizedToolCalls = toolCalls.map((tc: any, idx: number) => ({
          ...tc,
          id: tc.id || `call_${Date.now()}_${idx}`,
        }));

        messages.push({
          role: "assistant" as const,
          content: choice.message?.content || "",
          tool_calls: normalizedToolCalls,
        });

        // Execute each tool call with thinking step tracking
        for (const toolCall of normalizedToolCalls) {
          const fnName = toolCall.function?.name;
          let fnArgs: any = {};
          try {
            fnArgs = JSON.parse(toolCall.function?.arguments || "{}");
          } catch {
            fnArgs = {};
          }

          toolsUsed.push(fnName);
          let result: any;
          try {
            result = await executeTool(fnName, fnArgs, thinkingSteps);
          } catch (toolErr: any) {
            console.error(`[RasidAI] Tool ${fnName} error:`, toolErr.message);
            result = { error: `Tool execution failed: ${toolErr.message}` };
          }

          // Collect chart/dashboard results for frontend rendering
          if (result?.__type === 'chart' || result?.__type === 'dashboard') {
            allToolResults.push(result);
          }

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: typeof result === 'string' ? result.substring(0, 8000) : JSON.stringify(result, null, 0).substring(0, 8000),
          });
        }

        // Get next response
        response = await invokeLLM({
          messages,
          tools: RASID_TOOLS,
          tool_choice: "auto",
        });

        maxIterations--;
      } else {
        break;
      }
    }

    const rawContent = response.choices?.[0]?.message?.content;
    let content: string = typeof rawContent === "string" ? rawContent : "عذراً، لم أتمكن من معالجة طلبك. حاول مرة أخرى.";

    // Format response using enhancedFormatter
    content = formatResponse(content);

    // Security check on response
    const securityCheck = guardrails.checkResponseSecurity(content);
    if (!securityCheck.allowed) {
      content = "تم حظر الرد لاحتوائه على معلومات حساسة.";
    }

    // Add final thinking step
    thinkingSteps.push({
      id: `think-final-${Date.now()}`,
      agent: "راصد الذكي",
      action: "synthesize",
      description: "تجميع النتائج وصياغة الرد النهائي",
      status: "completed",
      timestamp: new Date(),
      result: `تم استخدام ${toolsUsed.length} أداة لصياغة الرد`,
    });

    // Generate dynamic follow-up suggestions via LLM
    let followUpSuggestions: string[] = [];
    try {
      const followUpResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `أنت مساعد منصة راصد. بناءً على المحادثة التالية، اقترح 3 أسئلة متابعة ذكية ومختصرة (كل سؤال أقل من 50 حرف) يمكن للمستخدم طرحها. الأسئلة يجب أن تكون:
1. مرتبطة بالسياق الحالي ومفيدة عملياً
2. متنوعة (تحليل، تفاصيل، إجراء)
3. باللغة العربية فقط

أجب بـ JSON فقط: {"suggestions": ["سؤال1", "سؤال2", "سؤال3"]}`,
          },
          { role: "user", content: `سؤال المستخدم: ${message}\n\nرد راصد: ${content.substring(0, 500)}\n\nالأدوات المستخدمة: ${toolsUsed.join(", ") || "لا شيء"}` },
        ],
        response_format: { type: "json_object" },
      });
      const rawContent = followUpResponse.choices?.[0]?.message?.content;
      const contentStr = typeof rawContent === "string" ? rawContent : "{}";
      const parsed = JSON.parse(contentStr);
      followUpSuggestions = (parsed.suggestions || []).slice(0, 3);
    } catch (e) {
      console.warn("[RasidAI] Follow-up suggestions generation failed:", e);
    }

    // Cache the response
    responseCache.set(message, content, {
      toolsUsed,
      incidentsAnalyzed: allToolResults.length,
      responseSource: 'ai',
    });

    // Record performance metrics
    performanceTracker.recordToolsUsed(toolsUsed);
    performanceTracker.recordIncidentsAnalyzed(allToolResults.length);
    const metrics = performanceTracker.end();

    // Calculate processing metadata
    const agentsUsed = Array.from(new Set(thinkingSteps.map(s => s.agent)));
    const totalDurationMs = metrics?.responseTimeMs || 0;

    // Log the interaction
    await logAudit(
      userId,
      "smart_rasid.chat",
      `Query: ${message.substring(0, 100)} | Tools: ${toolsUsed.join(", ") || "none"} | Steps: ${thinkingSteps.length} | Response length: ${content.length}`,
      "system",
      userName,
    );

    return {
      response: content,
      toolsUsed,
      thinkingSteps,
      followUpSuggestions,
      processingMeta: { totalDurationMs, toolCount: toolsUsed.length, agentsUsed },
      toolResults: allToolResults,
    };
  } catch (err: any) {
    console.error("[RasidAI] Chat error:", err);
    await logAudit(userId, "smart_rasid.error", `Error: ${err.message}`, "system", userName);

    thinkingSteps.push({
      id: `think-error-${Date.now()}`,
      agent: "راصد الذكي",
      action: "error_recovery",
      description: "معالجة خطأ",
      status: "error",
      timestamp: new Date(),
      result: err.message,
    });

    return {
      response: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.",
      toolsUsed,
      thinkingSteps,
      followUpSuggestions: [],
      processingMeta: { totalDurationMs: 0, toolCount: toolsUsed.length, agentsUsed: [] },
    };
  }
}


// ═══════════════════════════════════════════════════════════════
// STREAMING VERSION — SSE token-by-token streaming
// ═══════════════════════════════════════════════════════════════

export interface StreamCallbacks {
  onToken: (text: string) => void;
  onThinkingStep: (step: ThinkingStep) => void;
  onToolStart: (name: string) => void;
  onToolEnd: (name: string, result: any) => void;
  onFollowUp: (suggestions: string[]) => void;
  onDone: (result: any) => void;
  onError: (error: string) => void;
}

export async function rasidAIChatStreaming(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  userName: string,
  userId: number,
  callbacks: StreamCallbacks,
): Promise<void> {
  // Initialize performance tracking
  const performanceTracker = new PerformanceTracker();
  performanceTracker.start();

  const thinkingSteps: ThinkingStep[] = [];
  const stats = await getDashboardStats();
  
  // Fetch knowledge base context
  let knowledgeContext = "";
  try {
    knowledgeContext = await getPublishedKnowledgeForAI();
  } catch {
    // Knowledge base may not be populated yet
  }

  // Validate question with guardrails
  const scopeCheck = guardrails.checkQuestionScope(message);
  if (!scopeCheck.allowed) {
    callbacks.onError(scopeCheck.reason || "هذا السؤال خارج نطاق المنصة");
    return;
  }

  const injectionCheck = guardrails.detectPromptInjection(message);
  if (!injectionCheck.allowed) {
    callbacks.onError(injectionCheck.reason || "تم اكتشاف محاولة تلاعب");
    return;
  }

  // Check cache for existing response
  const cachedResponse = responseCache.get(message);
  if (cachedResponse) {
    performanceTracker.markCacheHit();
    const metrics = performanceTracker.end();
    
    callbacks.onToken(cachedResponse.response);
    callbacks.onDone({
      response: cachedResponse.response,
      toolsUsed: cachedResponse.metadata.toolsUsed,
      thinkingSteps: [],
      followUpSuggestions: [],
      processingMeta: { 
        totalDurationMs: metrics?.responseTimeMs || 0,
        toolCount: 0,
        agentsUsed: [],
        cacheHit: true,
      },
      toolResults: [],
    });
    return;
  }

  // Use domain-aware system prompt (PR-01)
  const systemPrompt = buildDomainSystemPrompt(userName, stats, knowledgeContext);

  // Use conversation memory to manage history (reduces context size by 50%+)
  let conversationWindow: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
  try {
    conversationWindow = conversationMemory.buildConversationWindow(history);
  } catch (err) {
    console.warn("[ConversationMemory] Failed to build window, using fallback:", err);
    // Fallback to simple history slice if conversation memory fails
    conversationWindow = history.slice(-MAX_FALLBACK_HISTORY_SIZE).map((h) => ({ role: h.role, content: h.content }));
  }

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...conversationWindow,
    { role: "user", content: message },
  ];

  const toolsUsed: string[] = [];
  let maxIterations = 8;

  // Initial thinking step
  const initialStep: ThinkingStep = {
    id: `think-${Date.now()}`,
    agent: "راصد الذكي",
    action: "analyze_intent",
    description: "تحليل نية المستخدم وتحديد الوكيل المختص",
    status: "completed",
    timestamp: new Date(),
    result: `استلام الطلب: "${message.substring(0, 80)}${message.length > 80 ? '...' : ''}"`,
  };
  thinkingSteps.push(initialStep);
  callbacks.onThinkingStep(initialStep);

  const allToolResults: any[] = [];

  try {
    // First call: use non-streaming to check for tool calls
    let response = await invokeLLM({
      messages,
      tools: RASID_TOOLS,
      tool_choice: "auto",
    });

    // Tool use loop — process tool calls iteratively (non-streaming for tool calls)
    while (maxIterations > 0) {
      const choice = response.choices?.[0];
      if (!choice) break;

      const hasToolCalls = choice.message?.tool_calls && choice.message.tool_calls.length > 0;
      
      if (hasToolCalls) {
        const toolCalls = choice.message!.tool_calls!;
        
        const normalizedToolCalls = toolCalls.map((tc: any, idx: number) => ({
          ...tc,
          id: tc.id || `call_${Date.now()}_${idx}`,
        }));

        messages.push({
          role: "assistant" as const,
          content: choice.message?.content || "",
          tool_calls: normalizedToolCalls,
        });

        // Execute each tool call
        for (const toolCall of normalizedToolCalls) {
          const fnName = toolCall.function?.name;
          let fnArgs: any = {};
          try {
            fnArgs = JSON.parse(toolCall.function?.arguments || "{}");
          } catch {
            fnArgs = {};
          }

          toolsUsed.push(fnName);
          callbacks.onToolStart(fnName);

          let result: any;
          try {
            result = await executeTool(fnName, fnArgs, thinkingSteps);
            // Send thinking steps as they happen
            const latestStep = thinkingSteps[thinkingSteps.length - 1];
            if (latestStep) callbacks.onThinkingStep(latestStep);
          } catch (toolErr: any) {
            console.error(`[RasidAI Stream] Tool ${fnName} error:`, toolErr.message);
            result = { error: `Tool execution failed: ${toolErr.message}` };
          }

          callbacks.onToolEnd(fnName, result);

          if (result?.__type === 'chart' || result?.__type === 'dashboard') {
            allToolResults.push(result);
          }

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: typeof result === 'string' ? result.substring(0, 8000) : JSON.stringify(result, null, 0).substring(0, 8000),
          });
        }

        // Get next response (non-streaming for tool iteration)
        response = await invokeLLM({
          messages,
          tools: RASID_TOOLS,
          tool_choice: "auto",
        });

        maxIterations--;
      } else {
        // No tool calls — this is the final response, stream it!
        // We already have the non-streamed content, so we'll simulate streaming
        const rawContent = choice.message?.content;
        let content: string = typeof rawContent === "string" ? rawContent : "عذراً، لم أتمكن من معالجة طلبك.";
        
        // Format response
        content = formatResponse(content);
        
        // Security check
        const securityCheck = guardrails.checkResponseSecurity(content);
        if (!securityCheck.allowed) {
          content = "تم حظر الرد لاحتوائه على معلومات حساسة.";
        }
        
        // Stream the final response token by token (simulate with chunks)
        const chunkSize = 3; // characters per chunk for smooth streaming
        for (let i = 0; i < content.length; i += chunkSize) {
          const chunk = content.substring(i, i + chunkSize);
          callbacks.onToken(chunk);
          // Small delay for visual effect
          await new Promise(resolve => setTimeout(resolve, 15));
        }
        
        break;
      }
    }

    // If we exhausted iterations, get the final content
    const rawContent = response.choices?.[0]?.message?.content;
    let content: string = typeof rawContent === "string" ? rawContent : "عذراً، لم أتمكن من معالجة طلبك.";

    // Format response using enhancedFormatter
    content = formatResponse(content);

    // Security check on response
    const securityCheck = guardrails.checkResponseSecurity(content);
    if (!securityCheck.allowed) {
      content = "تم حظر الرد لاحتوائه على معلومات حساسة.";
    }

    // If we broke out of the loop without streaming (tool calls exhausted iterations)
    // Check if we already streamed — if not, stream now
    if (maxIterations <= 0) {
      const chunkSize = 3;
      for (let i = 0; i < content.length; i += chunkSize) {
        const chunk = content.substring(i, i + chunkSize);
        callbacks.onToken(chunk);
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    }

    // Final thinking step
    const finalStep: ThinkingStep = {
      id: `think-final-${Date.now()}`,
      agent: "راصد الذكي",
      action: "synthesize",
      description: "تجميع النتائج وصياغة الرد النهائي",
      status: "completed",
      timestamp: new Date(),
      result: `تم استخدام ${toolsUsed.length} أداة لصياغة الرد`,
    };
    thinkingSteps.push(finalStep);
    callbacks.onThinkingStep(finalStep);

    // Generate follow-up suggestions
    let followUpSuggestions: string[] = [];
    try {
      const followUpResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `أنت مساعد منصة راصد. بناءً على المحادثة التالية، اقترح 3 أسئلة متابعة ذكية ومختصرة (كل سؤال أقل من 50 حرف) يمكن للمستخدم طرحها. الأسئلة يجب أن تكون:
1. مرتبطة بالسياق الحالي ومفيدة عملياً
2. متنوعة (تحليل، تفاصيل، إجراء)
3. باللغة العربية فقط

أجب بـ JSON فقط: {"suggestions": ["سؤال1", "سؤال2", "سؤال3"]}`,
          },
          { role: "user", content: `سؤال المستخدم: ${message}\n\nرد راصد: ${content.substring(0, 500)}\n\nالأدوات المستخدمة: ${toolsUsed.join(", ") || "لا شيء"}` },
        ],
        response_format: { type: "json_object" },
      });
      const rawFollowUp = followUpResponse.choices?.[0]?.message?.content;
      const contentStr = typeof rawFollowUp === "string" ? rawFollowUp : "{}";
      const parsed = JSON.parse(contentStr);
      followUpSuggestions = (parsed.suggestions || []).slice(0, 3);
    } catch (e) {
      console.warn("[RasidAI Stream] Follow-up suggestions generation failed:", e);
    }

    callbacks.onFollowUp(followUpSuggestions);

    // Cache the response
    responseCache.set(message, content, {
      toolsUsed,
      incidentsAnalyzed: allToolResults.length,
      responseSource: 'ai',
    });

    // Record performance metrics
    performanceTracker.recordToolsUsed(toolsUsed);
    performanceTracker.recordIncidentsAnalyzed(allToolResults.length);
    const metrics = performanceTracker.end();

    // Calculate processing metadata
    const agentsUsed = Array.from(new Set(thinkingSteps.map(s => s.agent)));
    const totalDurationMs = metrics?.responseTimeMs || 0;

    // Log the interaction
    await logAudit(
      userId,
      "smart_rasid.stream_chat",
      `Query: ${message.substring(0, 100)} | Tools: ${toolsUsed.join(", ") || "none"} | Steps: ${thinkingSteps.length} | Response length: ${content.length}`,
      "system",
      userName,
    );

    // Send done event
    callbacks.onDone({
      response: content,
      toolsUsed,
      thinkingSteps,
      followUpSuggestions,
      processingMeta: { 
        totalDurationMs, 
        toolCount: toolsUsed.length, 
        agentsUsed,
        performanceMetrics: metrics,
      },
      toolResults: allToolResults,
    });

  } catch (err: any) {
    console.error("[RasidAI Stream] Chat error:", err);
    await logAudit(userId, "smart_rasid.stream_error", `Error: ${err.message}`, "system", userName);
    callbacks.onError(err.message || "حدث خطأ غير متوقع");
  }
}


// ═══════════════════════════════════════════════════════════════
// PDPL Article Knowledge Base
// ═══════════════════════════════════════════════════════════════
function getPDPLArticleInfo(articleNumber?: number, topic?: string): any {
  const articles: Record<number, { title: string; summary: string; requirements: string[] }> = {
    1: { title: "التعريفات", summary: "تعريف المصطلحات الأساسية في النظام مثل البيانات الشخصية وصاحب البيانات والمعالجة", requirements: ["فهم التعريفات", "تطبيقها على العمليات"] },
    2: { title: "نطاق التطبيق", summary: "يسري النظام على كل معالجة للبيانات الشخصية داخل المملكة أو المتعلقة بمقيمين فيها", requirements: ["تحديد نطاق المعالجة", "تقييم الانطباق"] },
    5: { title: "مبادئ المعالجة", summary: "يجب أن تكون المعالجة مشروعة وعادلة وشفافة ومحددة الغرض", requirements: ["الشفافية", "تحديد الغرض", "تقليل البيانات", "الدقة", "تحديد فترة الاحتفاظ"] },
    6: { title: "الموافقة", summary: "يجب الحصول على موافقة صريحة من صاحب البيانات قبل المعالجة", requirements: ["موافقة صريحة", "حرية الاختيار", "إمكانية السحب", "توثيق الموافقة"] },
    10: { title: "حقوق صاحب البيانات", summary: "لصاحب البيانات حق الوصول والتصحيح والحذف والنقل والاعتراض", requirements: ["حق الوصول", "حق التصحيح", "حق الحذف", "حق النقل", "حق الاعتراض", "حق تقييد المعالجة"] },
    14: { title: "الإفصاح والنقل", summary: "ضوابط نقل البيانات خارج المملكة", requirements: ["تقييم مستوى الحماية", "ضمانات كافية", "موافقة صاحب البيانات", "إذن الجهة المختصة"] },
    19: { title: "أمن البيانات", summary: "يجب اتخاذ التدابير التقنية والتنظيمية لحماية البيانات", requirements: ["التشفير", "التحكم في الوصول", "النسخ الاحتياطي", "اختبارات الأمان", "خطة الاستجابة للحوادث"] },
    20: { title: "الإبلاغ عن الحوادث", summary: "يجب إبلاغ الجهة المختصة خلال 72 ساعة من اكتشاف أي حادثة تسريب", requirements: ["إبلاغ خلال 72 ساعة", "وصف الحادثة", "تقييم الأثر", "إجراءات التخفيف", "إبلاغ المتضررين"] },
    22: { title: "مسؤول حماية البيانات", summary: "تعيين مسؤول لحماية البيانات الشخصية في الجهات الكبيرة", requirements: ["تعيين DPO", "استقلالية", "صلاحيات كافية", "تقارير دورية"] },
    24: { title: "تقييم الأثر", summary: "إجراء تقييم أثر على الخصوصية قبل المعالجة عالية المخاطر", requirements: ["تحديد المخاطر", "تقييم الضرورة", "إجراءات التخفيف", "مراجعة دورية"] },
    32: { title: "العقوبات", summary: "عقوبات مالية تصل إلى 5 مليون ريال وعقوبات جنائية", requirements: ["غرامات مالية", "إنذارات", "إيقاف المعالجة", "عقوبات جنائية"] },
  };

  if (articleNumber && articles[articleNumber]) {
    return { found: true, article: { number: articleNumber, ...articles[articleNumber] } };
  }
  if (topic) {
    const matches = Object.entries(articles).filter(([_, a]) =>
      a.title.includes(topic) || a.summary.includes(topic) || a.requirements.some(r => r.includes(topic))
    ).map(([num, a]) => ({ number: parseInt(num), ...a }));
    return { found: matches.length > 0, articles: matches, query: topic };
  }
  return { found: true, articles: Object.entries(articles).map(([num, a]) => ({ number: parseInt(num), title: a.title })), total: Object.keys(articles).length };
}
