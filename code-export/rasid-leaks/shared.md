# rasid-leaks - shared

> Auto-extracted source code documentation

---

## `shared/NAMING_POLICY.ts`

```typescript
/**
 * NAMING_POLICY.ts — ملف مركزي لإدارة سياسة التسمية في منصة راصد
 * ─────────────────────────────────────────────────────────────────
 * DLV-01-01-001 / DLV-03-01-004
 *
 * القاعدة الذهبية:
 *   التسمية الافتراضية لأي ادعاء بوجود تسرب بيانات شخصية هي "حالة رصد"
 *   وليس "حادثة تسرب بيانات شخصية"، بغض النظر عن مصداقية البائع/الناشر.
 *
 * هذا الملف يُصدّر:
 *   1. TERMS — قاموس المصطلحات المعتمدة
 *   2. STATUS_LABELS — تسميات حالات الرصد (labels فقط، enum values لا تتغير)
 *   3. FORBIDDEN_TERMS — المصطلحات المحظورة مع البدائل المعتمدة
 *   4. NAMING_POLICY_PROMPT — نص سياسة التسمية لتضمينه في System Prompt
 *   5. checkNamingCompliance() — دالة فحص امتثال النصوص لسياسة التسمية
 */

// ─── 1. المصطلحات المعتمدة ───────────────────────────────────────

export const TERMS = {
  /** التسمية الافتراضية لأي ادعاء بوجود تسرب */
  CASE: "حالة رصد",
  CASES: "حالات الرصد",
  CASE_NEW: "حالة رصد جديدة",
  CASE_CONFIRMED: "حالة رصد موثقة",

  /** الأرقام التي يذكرها البائع/الناشر */
  CLAIMED_COUNT: "العدد المدعى",
  CLAIMED_COUNT_EN: "Exposed Count",

  /** البيانات التي تم جمعها/توثيقها داخل المنصة */
  AVAILABLE_SAMPLES: "العينات المتاحة",
  AVAILABLE_SAMPLES_EN: "Available Samples",

  /** البيانات الشخصية */
  DISCOVERED_PII: "البيانات الشخصية المكتشفة",

  /** حالات الرصد واسعة النطاق */
  LARGE_SCALE: "حالات الرصد واسعة النطاق",

  /** مصطلحات إضافية */
  MONITORING_PLATFORM: "منصة رصد الحالات",
  SMART_ASSISTANT: "راصد الذكي",
  EVIDENCE_CHAIN: "سلسلة الأدلة",
  SELLER_PROFILE: "ملف البائع",
} as const;

// ─── 2. تسميات حالات الرصد (Labels فقط — enum values لا تتغير) ───

export const STATUS_LABELS: Record<string, string> = {
  new: "حالة رصد",
  analyzing: "قيد التحقق",
  documented: "حالة رصد موثقة",
  reported: "مغلق",
  monitoring: "تحت المراقبة",
  closed: "مغلق",
  escalated: "مصعدة",
  "under-review": "قيد المراجعة",
  archived: "مؤرشفة",
};

// ─── 3. المصطلحات المحظورة مع البدائل المعتمدة ──────────────────

export const FORBIDDEN_TERMS: Array<{
  forbidden: string;
  regex: RegExp;
  replacement: string;
  context: string;
}> = [
  {
    forbidden: "حادثة تسرب",
    regex: /حادث[ةه]\s*تسر[يّ]?ب/g,
    replacement: TERMS.CASE,
    context: "التسمية العامة",
  },
  {
    forbidden: "حادثة حالة رصد",
    regex: /حادث[ةه]\s*تسر[يّ]ب/g,
    replacement: TERMS.CASE,
    context: "التسمية العامة",
  },
  {
    forbidden: "حالة رصد موثقة",
    regex: /تسر[يّ]?ب\s*مؤكد/g,
    replacement: TERMS.CASE_CONFIRMED,
    context: "حالة documented فقط",
  },
  {
    forbidden: "حالة رصد مؤكد",
    regex: /تسر[يّ]ب\s*مؤكد/g,
    replacement: TERMS.CASE_CONFIRMED,
    context: "حالة documented فقط",
  },
  {
    forbidden: "عدد السجلات المسربة",
    regex: /عدد\s*السجلات\s*المسرب[ةه]/g,
    replacement: TERMS.CLAIMED_COUNT,
    context: "أرقام البائع/الناشر",
  },
  {
    forbidden: "السجلات المسربة فعلياً",
    regex: /السجلات\s*المسرب[ةه]\s*فعلي[اًّ]/g,
    replacement: TERMS.AVAILABLE_SAMPLES,
    context: "البيانات المجمعة داخل المنصة",
  },
  {
    forbidden: "البيانات الشخصية المسربة",
    regex: /البيانات\s*الشخصي[ةه]\s*المسرب[ةه]/g,
    replacement: TERMS.DISCOVERED_PII,
    context: "البيانات الشخصية",
  },
  {
    forbidden: "سجل مسرب",
    regex: /سجل\s*مسرب/g,
    replacement: TERMS.CLAIMED_COUNT,
    context: "أرقام البائع/الناشر",
  },
  {
    forbidden: "سجل متأثر",
    regex: /سجل\s*متأثر/g,
    replacement: TERMS.CLAIMED_COUNT,
    context: "أرقام البائع/الناشر",
  },
];

// ─── 4. نص سياسة التسمية لـ System Prompt ──────────────────────

export const NAMING_POLICY_PROMPT = `
## سياسة التسمية المعتمدة (إلزامية)

أنت ملزم باتباع سياسة التسمية التالية في جميع ردودك بدون استثناء:

1. التسمية الافتراضية لأي ادعاء بوجود تسرب بيانات شخصية هي "${TERMS.CASE}" وليس "حادثة تسرب".
2. لا يُستخدم مصطلح "حادثة تسرب" أو "حالة رصد موثقة" إلا بعد اكتمال التحقق (حالة documented).
3. أي رقم يذكره البائع/الناشر عن عدد السجلات يسمى "${TERMS.CLAIMED_COUNT}" وليس "عدد السجلات المسربة".
4. البيانات المجمعة داخل المنصة تسمى "${TERMS.AVAILABLE_SAMPLES}" وليس "السجلات المسربة فعلياً".
5. البيانات الشخصية تسمى "${TERMS.DISCOVERED_PII}" وليس "البيانات الشخصية المسربة".
6. إذا استخدم المستخدم مصطلحاً قديماً، صحّحه بلطف واستخدم المصطلح المعتمد.

### تسميات الحالات:
| القيمة البرمجية | التسمية المعتمدة |
|---|---|
| new | ${STATUS_LABELS.new} |
| analyzing | ${STATUS_LABELS.analyzing} |
| documented | ${STATUS_LABELS.documented} |
| monitoring | ${STATUS_LABELS.monitoring} |
| closed | ${STATUS_LABELS.closed} |
| escalated | ${STATUS_LABELS.escalated} |
`.trim();

// ─── 5. دالة فحص الامتثال ────────────────────────────────────────

export interface ComplianceViolation {
  forbidden: string;
  replacement: string;
  context: string;
  position: number;
}

export interface ComplianceResult {
  compliant: boolean;
  violations: ComplianceViolation[];
  correctedText: string;
}

/**
 * checkNamingCompliance — DLV-01-01-002
 * فحص امتثال نص لسياسة التسمية وإرجاع المخالفات مع النص المصحح
 */
export function checkNamingCompliance(text: string): ComplianceResult {
  const violations: ComplianceViolation[] = [];
  let correctedText = text;

  for (const term of FORBIDDEN_TERMS) {
    const regex = new RegExp(term.regex.source, term.regex.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      violations.push({
        forbidden: match[0],
        replacement: term.replacement,
        context: term.context,
        position: match.index,
      });
    }

    correctedText = correctedText.replace(
      new RegExp(term.regex.source, term.regex.flags),
      term.replacement,
    );
  }

  return {
    compliant: violations.length === 0,
    violations,
    correctedText,
  };
}

/**
 * getStatusLabel — إرجاع التسمية المعتمدة لحالة الرصد
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}

/**
 * formatClaimedCount — تنسيق العدد المدعى مع التوضيح
 */
export function formatClaimedCount(count: number | string): string {
  const num = typeof count === "string" ? parseInt(count, 10) : count;
  if (isNaN(num)) return "غير محدد";
  return `${num.toLocaleString("ar-SA")} (${TERMS.CLAIMED_COUNT})`;
}

/**
 * formatAvailableSamples — تنسيق عدد العينات المتاحة
 */
export function formatAvailableSamples(count: number | string): string {
  const num = typeof count === "string" ? parseInt(count, 10) : count;
  if (isNaN(num)) return "غير محدد";
  return `${num.toLocaleString("ar-SA")} (${TERMS.AVAILABLE_SAMPLES})`;
}

```

---

## `shared/compliance.ts`

```typescript
/**
 * Unified Compliance Terminology for RASID Platform
 * 
 * Four compliance statuses:
 * 1. compliant (ممتثل) - Has data protection policy page with all 8 Article 12 clauses
 * 2. partially_compliant (ممتثل جزئياً) - Has data protection policy but missing some clauses
 * 3. non_compliant (غير ممتثل) - No data protection policy page at all
 * 4. not_working (لا يعمل) - Website is not accessible/working
 */

export const COMPLIANCE_STATUS = {
  COMPLIANT: "compliant",
  PARTIALLY_COMPLIANT: "partially_compliant",
  NON_COMPLIANT: "non_compliant",
  NOT_WORKING: "not_working",
} as const;

export type ComplianceStatus = (typeof COMPLIANCE_STATUS)[keyof typeof COMPLIANCE_STATUS];

export const COMPLIANCE_LABELS: Record<string, string> = {
  compliant: "ممتثل",
  partially_compliant: "ممتثل جزئياً",
  non_compliant: "غير ممتثل",
  not_working: "لا يعمل",
};

export const COMPLIANCE_COLORS: Record<string, string> = {
  compliant: "#22c55e",
  partially_compliant: "#f59e0b",
  non_compliant: "#ef4444",
  not_working: "#71717a",
};

export const COMPLIANCE_BADGE_CLASSES: Record<string, string> = {
  compliant: "badge-compliant",
  partially_compliant: "badge-partial",
  non_compliant: "badge-non-compliant",
  not_working: "badge-no-policy",
};

/**
 * Article 12 of Saudi Personal Data Protection System - 8 Clauses
 */
export const ARTICLE_12_CLAUSES = [
  { number: 1, name: "تحديد الغرض من جمع البيانات الشخصية", shortName: "الغرض" },
  { number: 2, name: "تحديد محتوى البيانات الشخصية المطلوب جمعها", shortName: "المحتوى" },
  { number: 3, name: "تحديد طريقة جمع البيانات الشخصية", shortName: "طريقة الجمع" },
  { number: 4, name: "تحديد وسيلة حفظ البيانات الشخصية", shortName: "وسيلة الحفظ" },
  { number: 5, name: "تحديد كيفية معالجة البيانات الشخصية", shortName: "المعالجة" },
  { number: 6, name: "تحديد كيفية إتلاف البيانات الشخصية", shortName: "الإتلاف" },
  { number: 7, name: "تحديد حقوق صاحب البيانات الشخصية فيما يتعلق ببياناته", shortName: "الحقوق" },
  { number: 8, name: "تحديد كيفية ممارسة صاحب البيانات الشخصية لهذه الحقوق", shortName: "ممارسة الحقوق" },
] as const;

export const CLAUSE_NAMES = ARTICLE_12_CLAUSES.map(c => c.name);
export const CLAUSE_SHORT_NAMES = ARTICLE_12_CLAUSES.map(c => c.shortName);

```

---

## `shared/const.ts`

```typescript
export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

```

---

## `shared/types.ts`

```typescript
/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

```

---

