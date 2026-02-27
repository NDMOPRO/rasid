# rasid - shared

> Auto-extracted source code documentation

---

## `shared/compliance.ts`

```typescript
/**
 * Unified Compliance Terminology for RASID Platform
 * 
 * Four compliance statuses:
 * 1. compliant (ممتثل) - Has privacy policy page with all 8 Article 12 clauses
 * 2. partially_compliant (ممتثل جزئياً) - Has privacy policy but missing some clauses
 * 3. non_compliant (غير ممتثل) - No privacy policy page at all
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

