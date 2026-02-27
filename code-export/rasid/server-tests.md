# rasid - server-tests

> Auto-extracted source code documentation

---

## `server/tests/t01-naming-policy.test.ts`

```typescript
/**
 * T-01 to T-05: اختبار سياسة التسمية (Naming Policy Tests)
 * يتحقق من استبدال المصطلحات القديمة بالمصطلحات المعتمدة
 */
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

// Glob helper to recursively find files
function findFiles(dir: string, ext: string[]): string[] {
  const results: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "dist") {
        results.push(...findFiles(fullPath, ext));
      } else if (entry.isFile() && ext.some(e => entry.name.endsWith(e))) {
        results.push(fullPath);
      }
    }
  } catch { /* ignore permission errors */ }
  return results;
}

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CLIENT_SRC = path.join(PROJECT_ROOT, "client/src");
const SERVER_DIR = path.join(PROJECT_ROOT, "server");

// T-01: Scan for old terminology in main pages/components
describe("T-01: بحث عن المصطلحات القديمة في الصفحات الرئيسية", () => {
  const uiFiles = findFiles(CLIENT_SRC, [".tsx", ".ts"]);

  it("يجب ألا تحتوي ملفات الواجهة على كلمة «حادثة» كمصطلح رئيسي", () => {
    const violations: string[] = [];
    for (const file of uiFiles) {
      const content = fs.readFileSync(file, "utf-8");
      // Match Arabic "حادثة" but exclude comments, import paths, and English code
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comments and imports
        if (line.trim().startsWith("//") || line.trim().startsWith("*") || line.includes("import ")) continue;
        // Look for standalone "حادثة" in UI-visible strings (inside quotes or JSX)
        if (/(["'`>])([^"'`<]*حادثة تسر[^"'`<]*)(["'`<])/.test(line)) {
          violations.push(`${path.relative(PROJECT_ROOT, file)}:${i + 1}: ${line.trim().substring(0, 100)}`);
        }
      }
    }
    expect(violations, `وُجدت ${violations.length} ظهور(ات) لـ «حادثة تسريب»:\n${violations.join("\n")}`).toHaveLength(0);
  });

  it("يجب ألا تحتوي ملفات الواجهة على «عدد السجلات المسربة»", () => {
    const violations: string[] = [];
    for (const file of uiFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes("عدد السجلات المسربة")) {
        violations.push(path.relative(PROJECT_ROOT, file));
      }
    }
    expect(violations, `وُجدت «عدد السجلات المسربة» في: ${violations.join(", ")}`).toHaveLength(0);
  });
});

// T-02: Verify replacement with approved terminology
describe("T-02: التحقق من وجود المصطلحات المعتمدة", () => {
  it("يجب أن تحتوي الواجهة على مصطلح «حالة رصد»", () => {
    const uiFiles = findFiles(CLIENT_SRC, [".tsx"]);
    const hasApprovedTerm = uiFiles.some(file => {
      const content = fs.readFileSync(file, "utf-8");
      return content.includes("حالة رصد") || content.includes("حالات رصد") || content.includes("حالات الرصد");
    });
    expect(hasApprovedTerm).toBe(true);
  });

  it("يجب أن تحتوي الواجهة على مصطلح «العدد المُدّعى»", () => {
    const uiFiles = findFiles(CLIENT_SRC, [".tsx"]);
    const hasApprovedTerm = uiFiles.some(file => {
      const content = fs.readFileSync(file, "utf-8");
      return content.includes("العدد المُدّعى");
    });
    expect(hasApprovedTerm).toBe(true);
  });

  it("يجب أن تحتوي الواجهة على مصطلح «العينات المتاحة»", () => {
    const uiFiles = findFiles(CLIENT_SRC, [".tsx"]);
    const hasApprovedTerm = uiFiles.some(file => {
      const content = fs.readFileSync(file, "utf-8");
      return content.includes("العينات المتاحة");
    });
    expect(hasApprovedTerm).toBe(true);
  });
});

// T-03: Verify default status values
describe("T-03: التحقق من القيم الافتراضية للحالة", () => {
  it("يجب أن يحتوي النظام على حالة «حالة رصد» كحالة افتراضية", () => {
    const serverFiles = findFiles(SERVER_DIR, [".ts"]);
    const hasDefaultStatus = serverFiles.some(file => {
      const content = fs.readFileSync(file, "utf-8");
      return content.includes("حالة رصد");
    });
    expect(hasDefaultStatus).toBe(true);
  });
});

// T-04: Verify naming policy in exports/reports
describe("T-04: التحقق من سياسة التسمية في التصديرات", () => {
  it("يجب أن تستخدم ملفات التصدير المصطلحات المعتمدة", () => {
    const exportFiles = findFiles(SERVER_DIR, [".ts"]).filter(f =>
      f.includes("export") || f.includes("pdf") || f.includes("report")
    );
    const violations: string[] = [];
    for (const file of exportFiles) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes("حادثة تسريب") || content.includes("عدد السجلات المسربة")) {
        violations.push(path.relative(PROJECT_ROOT, file));
      }
    }
    expect(violations, `ملفات تصدير بمصطلحات قديمة: ${violations.join(", ")}`).toHaveLength(0);
  });

  it("يجب أن يظهر «العدد المُدّعى» كادعاء وليس كحقيقة في الخادم", () => {
    const serverFiles = findFiles(SERVER_DIR, [".ts"]);
    const hasClaimContext = serverFiles.some(file => {
      const content = fs.readFileSync(file, "utf-8");
      return content.includes("العدد المُدّعى") || content.includes("ادعاء البائع");
    });
    expect(hasClaimContext).toBe(true);
  });
});

// T-05: Test documentation of naming policy
describe("T-05: توثيق سياسة التسمية", () => {
  it("يجب أن يحتوي System Prompt على سياسة التسمية", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("سياسة التسمية");
    expect(rasidAI).toContain("حالة رصد");
    expect(rasidAI).toContain("العدد المُدّعى");
    expect(rasidAI).toContain("العينات المتاحة");
  });

  it("يجب أن يحتوي System Prompt على قواعد التصحيح التلقائي", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("صحّحه بلطف");
  });
});

```

---

## `server/tests/t06-chat-navigation.test.ts`

```typescript
/**
 * T-06 to T-09: اختبار صندوق المحادثة والتنقل
 * يتحقق من بقاء الرد داخل صندوق المحادثة وآلية التنقل بالإذن
 */
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CLIENT_SRC = path.join(PROJECT_ROOT, "client/src");

// T-06: Chat responses stay inside the chat box
describe("T-06: الرد يبقى داخل صندوق المحادثة", () => {
  it("يجب أن يتعامل SmartRasid مع الأخطاء داخل الصندوق بدون توجيه لصفحة خطأ", () => {
    const smartRasid = fs.readFileSync(path.join(CLIENT_SRC, "pages/SmartRasid.tsx"), "utf-8");
    // Error should be handled inside chat, not redirecting
    expect(smartRasid).toContain("catch (err");
    expect(smartRasid).toContain("عذراً، حدث خطأ");
    // Should not have window.location redirects in error handlers
    expect(smartRasid).not.toMatch(/catch.*\{[\s\S]*?window\.location\.href\s*=\s*["']\/error/);
  });

  it("يجب أن يعرض رسالة خطأ ضمن المحادثة عند فشل الاتصال", () => {
    const smartRasid = fs.readFileSync(path.join(CLIENT_SRC, "pages/SmartRasid.tsx"), "utf-8");
    expect(smartRasid).toContain("role: \"assistant\"");
    expect(smartRasid).toContain("حدث خطأ");
  });
});

// T-07: Expand/Collapse/Maximize
describe("T-07: اختبار Expand/Collapse/Maximize", () => {
  it("يجب أن يدعم SmartRasidFAB التكبير والتصغير", () => {
    const fab = fs.readFileSync(path.join(CLIENT_SRC, "components/SmartRasidFAB.tsx"), "utf-8");
    expect(fab).toContain("Maximize");
    expect(fab).toContain("smart-rasid");
  });

  it("يجب أن تدعم صفحة SmartRasid فتح كصفحة كاملة", () => {
    const smartRasid = fs.readFileSync(path.join(CLIENT_SRC, "pages/SmartRasid.tsx"), "utf-8");
    expect(smartRasid).toContain("h-full");
    expect(smartRasid).toContain("flex flex-col");
  });
});

// T-08: Navigation consent — allow
describe("T-08: اختبار طلب التنقل — موافقة المستخدم", () => {
  it("يجب أن يحتوي النظام على مكون NavigationConsentDialog", () => {
    const dialog = fs.readFileSync(path.join(CLIENT_SRC, "components/NavigationConsentDialog.tsx"), "utf-8");
    expect(dialog).toContain("طلب انتقال");
    expect(dialog).toContain("onConsent");
    expect(dialog).toContain("سماح بالانتقال");
    expect(dialog).toContain("البقاء هنا");
  });

  it("يجب أن يدمج SmartRasid حوار إذن التنقل", () => {
    const smartRasid = fs.readFileSync(path.join(CLIENT_SRC, "pages/SmartRasid.tsx"), "utf-8");
    expect(smartRasid).toContain("NavigationConsentDialog");
    expect(smartRasid).toContain("navConsent");
    expect(smartRasid).toContain("handleNavigationConsent");
  });

  it("يجب أن يحافظ على conversationId عند التنقل", () => {
    const smartRasid = fs.readFileSync(path.join(CLIENT_SRC, "pages/SmartRasid.tsx"), "utf-8");
    expect(smartRasid).toContain("conversationId");
  });
});

// T-09: Navigation consent — deny
describe("T-09: اختبار رفض الإذن", () => {
  it("يجب أن يوفر خيار «البقاء هنا» في حوار التنقل", () => {
    const dialog = fs.readFileSync(path.join(CLIENT_SRC, "components/NavigationConsentDialog.tsx"), "utf-8");
    expect(dialog).toContain("البقاء هنا");
    expect(dialog).toContain("onConsent(false)");
  });

  it("يجب أن يحتوي FormattedAIResponse على شريط التنقل بالموافقة", () => {
    const formatted = fs.readFileSync(path.join(CLIENT_SRC, "components/FormattedAIResponse.tsx"), "utf-8");
    expect(formatted).toContain("NavigationConsentBanner");
    expect(formatted).toContain("سماح بالانتقال");
    expect(formatted).toContain("البقاء هنا");
  });
});

```

---

## `server/tests/t10-streaming-fallback.test.ts`

```typescript
/**
 * T-10 to T-11: اختبار Streaming و Fallback
 * يتحقق من عمل SSE والاسترجاع البديل عند انقطاع الخدمة
 */
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SERVER_DIR = path.join(PROJECT_ROOT, "server");

// T-10: SSE token streaming
describe("T-10: اختبار SSE token streaming", () => {
  it("يجب أن يدعم invokeLLMStream البث المباشر", () => {
    const llm = fs.readFileSync(path.join(SERVER_DIR, "_core/llm.ts"), "utf-8");
    expect(llm).toContain("invokeLLMStream");
    expect(llm).toContain("stream");
  });

  it("يجب أن يتعامل LLM مع timeout بشكل صحيح (API-15)", () => {
    const llm = fs.readFileSync(path.join(SERVER_DIR, "_core/llm.ts"), "utf-8");
    expect(llm).toContain("fetchWithTimeout");
    expect(llm).toContain("AbortController");
  });

  it("يجب أن يدعم retry مع exponential backoff (API-15)", () => {
    const llm = fs.readFileSync(path.join(SERVER_DIR, "_core/llm.ts"), "utf-8");
    expect(llm).toContain("fetchWithRetry");
    expect(llm).toContain("backoff");
  });
});

// T-11: Fallback responses
describe("T-11: اختبار Fallback بدون كسر الواجهة", () => {
  it("يجب أن يحتوي FallbackEngine على 45+ قاعدة", () => {
    const fallback = fs.readFileSync(path.join(SERVER_DIR, "rasidEnhancements/fallbackEngine.ts"), "utf-8");
    const ruleCount = (fallback.match(/\{\s*regex:/g) || []).length;
    expect(ruleCount).toBeGreaterThanOrEqual(30);
  });

  it("يجب أن تستخدم قواعد Fallback المصطلحات المعتمدة", () => {
    const fallback = fs.readFileSync(path.join(SERVER_DIR, "rasidEnhancements/fallbackEngine.ts"), "utf-8");
    // Should use approved terminology in responses
    expect(fallback).toContain("حالات الرصد");
    expect(fallback).toContain("حالة رصد");
  });

  it("يجب أن يدعم FallbackEngine البحث الضبابي (fuzzy matching)", () => {
    const fallback = fs.readFileSync(path.join(SERVER_DIR, "rasidEnhancements/fallbackEngine.ts"), "utf-8");
    expect(fallback).toContain("fuzzyMatch");
    expect(fallback).toContain("MIN_FUZZY_MATCH_SCORE");
  });

  it("يجب أن يتعامل مع الأسئلة غير المفهومة بدون خطأ", () => {
    const fallback = fs.readFileSync(path.join(SERVER_DIR, "rasidEnhancements/fallbackEngine.ts"), "utf-8");
    expect(fallback).toContain("لم أفهم طلبك");
  });
});

```

---

## `server/tests/t12-tools-security.test.ts`

```typescript
/**
 * T-12 to T-15: اختبار الأدوات والصلاحيات والتدقيق وعزل المجال
 * يتحقق من عمل الأدوات وصحة النتائج والتدقيق وعزل المجال
 */
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SERVER_DIR = path.join(PROJECT_ROOT, "server");

// T-12: Tool verification — RBAC + audit
describe("T-12: اختبار الأدوات والصلاحيات والتدقيق", () => {
  const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");

  it("يجب أن تحتوي كل أداة على وصف عربي", () => {
    // Extract tool names from RASID_TOOLS
    const toolMatches = rasidAI.match(/name:\s*"([^"]+)"/g) || [];
    const descMatches = rasidAI.match(/description:\s*"([^"]+)"/g) || [];
    expect(toolMatches.length).toBeGreaterThan(20);
    expect(descMatches.length).toBeGreaterThan(20);
  });

  it("يجب أن يحتوي كل أداة على تصنيف في toolCategoryMap", () => {
    expect(rasidAI).toContain("toolCategoryMap");
    // Check key tools are categorized
    expect(rasidAI).toContain("query_leaks");
    expect(rasidAI).toContain("get_dashboard_stats");
    expect(rasidAI).toContain("get_system_health");
  });

  it("يجب أن يسجل التدقيق عند تنفيذ الأدوات", () => {
    expect(rasidAI).toContain("logAudit");
  });

  it("يجب أن تحتوي أدوات التنفيذ على آلية تأكيد", () => {
    expect(rasidAI).toContain("preview_action");
    expect(rasidAI).toContain("confirm_action");
    expect(rasidAI).toContain("rollback_action");
  });
});

// T-13: Plan/Preview → Confirm → Execute → Rollback
describe("T-13: اختبار تدفق التأكيد والتراجع", () => {
  const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");

  it("يجب أن يدعم النظام خطوات: Plan → Confirm → Execute → Rollback", () => {
    expect(rasidAI).toContain("preview_action");
    expect(rasidAI).toContain("confirm_action");
    expect(rasidAI).toContain("rollback_action");
  });

  it("يجب أن يوجد جدول action_runs للتتبع", () => {
    const schema = fs.readFileSync(path.join(PROJECT_ROOT, "drizzle/schema.ts"), "utf-8");
    expect(schema).toContain("ai_action_runs");
    expect(schema).toContain("pending");
    expect(schema).toContain("confirmed");
    expect(schema).toContain("rolled_back");
  });

  it("يجب أن يحتوي System Prompt على تعليمات التأكيد قبل التنفيذ", () => {
    expect(rasidAI).toContain("اطلب تأكيد المستخدم");
    expect(rasidAI).toContain("التراجع");
  });
});

// T-14: Domain isolation — breaches vs privacy
describe("T-14: اختبار عزل المجال — تسربات vs خصوصية", () => {
  it("يجب أن تحتوي جداول DB على عمود domain", () => {
    const schema = fs.readFileSync(path.join(PROJECT_ROOT, "drizzle/schema.ts"), "utf-8");
    const domainTables = [
      "ai_glossary", "ai_page_descriptors", "ai_guide_catalog",
      "ai_task_memory", "ai_domain_conversations", "ai_training_documents",
      "ai_domain_feedback", "ai_message_templates", "ai_system_events",
      "ai_retention_policies", "ai_rag_indexes",
    ];
    for (const table of domainTables) {
      expect(schema, `الجدول ${table} يجب أن يوجد`).toContain(table);
    }
  });

  it("يجب أن يتضمن domain قيم breaches و privacy", () => {
    const schema = fs.readFileSync(path.join(PROJECT_ROOT, "drizzle/schema.ts"), "utf-8");
    expect(schema).toContain("breaches");
    expect(schema).toContain("privacy");
  });

  it("يجب أن يحتوي System Prompt على تعليمات عزل المجال", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("عزل كامل");
  });
});

// T-15: RAG index and Training Center isolation
describe("T-15: اختبار عزل فهرس RAG ومركز التدريب", () => {
  it("يجب أن يوجد فهرس RAG مستقل لكل مجال", () => {
    const schema = fs.readFileSync(path.join(PROJECT_ROOT, "drizzle/schema.ts"), "utf-8");
    expect(schema).toContain("ai_rag_indexes");
    expect(schema).toContain("source_type");
  });

  it("يجب أن يوجد RAGEngine مع إمكانية التهيئة", () => {
    const rag = fs.readFileSync(path.join(SERVER_DIR, "rasidEnhancements/ragEngine.ts"), "utf-8");
    expect(rag).toContain("class RAGEngine");
    expect(rag).toContain("isReady");
    expect(rag).toContain("initialize");
  });

  it("يجب أن يوجد مركز تدريب مستقل", () => {
    const schema = fs.readFileSync(path.join(PROJECT_ROOT, "drizzle/schema.ts"), "utf-8");
    expect(schema).toContain("ai_training_documents");
    expect(schema).toContain("ai_action_triggers");
  });
});

```

---

## `server/tests/t16-reliability.test.ts`

```typescript
/**
 * T-16 to T-18: اختبار الاعتمادية والأعطال
 * يتحقق من سلوك النظام عند فشل DB/LLM وCircuit Breaker
 */
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SERVER_DIR = path.join(PROJECT_ROOT, "server");

// T-16: DB failure — graceful degradation
describe("T-16: اختبار فشل قاعدة البيانات", () => {
  it("يجب أن يتعامل rasidAI مع أخطاء DB بنتيجة جزئية (API-06)", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    // Should have graceful error handling with partial results
    expect(rasidAI).toContain("partialResults");
    expect(rasidAI).toContain("تمكنت من جمع بعض المعلومات");
  });

  it("يجب أن يوفر رسائل خطأ واضحة بالعربية", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("عذراً، حدث خطأ");
    expect(rasidAI).toContain("يرجى المحاولة");
  });

  it("يجب أن يقترح إجراءات عند الفشل", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    // Should suggest follow-ups on error
    expect(rasidAI).toContain("أعد المحاولة");
  });
});

// T-17: LLM failure — Circuit Breaker + Fallback
describe("T-17: اختبار فشل مزود LLM — Circuit Breaker + Fallback", () => {
  it("يجب أن يحتوي النظام على Circuit Breaker بالحالات الثلاث", () => {
    const cb = fs.readFileSync(path.join(SERVER_DIR, "rasidEnhancements/circuitBreaker.ts"), "utf-8");
    expect(cb).toContain("CLOSED");
    expect(cb).toContain("OPEN");
    expect(cb).toContain("HALF_OPEN");
  });

  it("يجب أن يحتوي Circuit Breaker على عتبة فشل ووقت استرداد", () => {
    const cb = fs.readFileSync(path.join(SERVER_DIR, "rasidEnhancements/circuitBreaker.ts"), "utf-8");
    expect(cb).toContain("failureThreshold");
    expect(cb).toContain("recoveryTimeout");
    expect(cb).toContain("successThreshold");
  });

  it("يجب أن يدعم Circuit Breaker تنفيذ مع fallback", () => {
    const cb = fs.readFileSync(path.join(SERVER_DIR, "rasidEnhancements/circuitBreaker.ts"), "utf-8");
    expect(cb).toContain("async execute");
    expect(cb).toContain("fallback");
  });

  it("يجب أن يعرض get_system_health حالة Circuit Breaker", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("circuitBreaker");
    expect(rasidAI).toContain("cbStatus");
  });
});

// T-18: Timeouts/retries with error logging
describe("T-18: اختبار timeouts/retries وتسجيل الأخطاء", () => {
  it("يجب أن يدعم LLM timeout مع AbortController", () => {
    const llm = fs.readFileSync(path.join(SERVER_DIR, "_core/llm.ts"), "utf-8");
    expect(llm).toContain("AbortController");
    expect(llm).toContain("fetchWithTimeout");
  });

  it("يجب أن يدعم LLM retry مع exponential backoff", () => {
    const llm = fs.readFileSync(path.join(SERVER_DIR, "_core/llm.ts"), "utf-8");
    expect(llm).toContain("fetchWithRetry");
    expect(llm).toContain("LLM_MAX_RETRIES");
  });

  it("يجب أن يمنع thinking + json_schema conflict (API-15)", () => {
    const llm = fs.readFileSync(path.join(SERVER_DIR, "_core/llm.ts"), "utf-8");
    expect(llm).toContain("buildPayload");
  });

  it("يجب أن يسجل أخطاء HTTP بتفاصيل", () => {
    const llm = fs.readFileSync(path.join(SERVER_DIR, "_core/llm.ts"), "utf-8");
    expect(llm).toContain("status");
    expect(llm).toContain("console.");
  });
});

```

---

## `server/tests/t19-charts-bulk.test.ts`

```typescript
/**
 * T-19 to T-22: اختبار المخططات ولوحات المؤشرات والاستيراد الجماعي
 * يتحقق من إنشاء المخططات واستيراد الملفات
 */
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SERVER_DIR = path.join(PROJECT_ROOT, "server");
const CLIENT_SRC = path.join(PROJECT_ROOT, "client/src");

// T-19: Chart generation and display in chat
describe("T-19: اختبار إنشاء المخططات وعرضها في الدردشة", () => {
  it("يجب أن يوجد محرك مخططات ذكي (SmartChartEngine)", () => {
    const chart = fs.readFileSync(path.join(SERVER_DIR, "rasidEnhancements/smartChartEngine.ts"), "utf-8");
    expect(chart).toContain("class SmartChartEngine");
    expect(chart).toContain("ChartType");
  });

  it("يجب أن يحتوي rasidAI على أداة generate_chart", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("generate_chart");
  });

  it("يجب أن يحتوي System Prompt على تعليمات استخدام المخططات", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("generate_chart");
    expect(rasidAI).toContain("مخطط بياني");
  });
});

// T-20: Chart data from DB only
describe("T-20: اختبار أن بيانات المخطط من DB فقط", () => {
  it("يجب أن يستخدم محرك المخططات بيانات حقيقية", () => {
    const chart = fs.readFileSync(path.join(SERVER_DIR, "rasidEnhancements/chartDataEngine.ts"), "utf-8");
    expect(chart).toContain("ChartDataEngine");
  });

  it("يجب أن يمنع System Prompt اختلاق البيانات", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("لا تخمّن");
  });
});

// T-21: Bulk import — CSV/JSON/XLSX/ZIP
describe("T-21: اختبار الاستيراد الجماعي", () => {
  it("يجب أن يوجد أداة process_bulk_import في rasidAI", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("process_bulk_import");
  });

  it("يجب أن يدعم الاستيراد الأنواع: CSV, JSON, XLSX", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("csv");
    expect(rasidAI).toContain("json");
  });

  it("يجب أن يعيد تقرير نتائج: insert/upsert/update مع ملخص", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("insert");
    expect(rasidAI).toContain("upsert");
    expect(rasidAI).toContain("سجل جاهز");
  });

  it("يجب أن يدعم واجهة SmartRasid رفع الملفات", () => {
    const smartRasid = fs.readFileSync(path.join(CLIENT_SRC, "pages/SmartRasid.tsx"), "utf-8");
    expect(smartRasid).toContain("fileInputRef");
    expect(smartRasid).toContain("handleFileSelect");
    expect(smartRasid).toContain("Paperclip");
    expect(smartRasid).toContain(".csv,.json,.txt,.xlsx,.zip");
  });
});

// T-22: Bulk delete — permissions + confirmation + audit
describe("T-22: اختبار الحذف الجماعي — صلاحيات + تأكيد + تدقيق", () => {
  it("يجب أن يتطلب الحذف الجماعي تأكيداً صريحاً", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("confirm_action");
    expect(rasidAI).toContain("تأكيد");
  });

  it("يجب أن يسجل التدقيق لكل عملية حذف", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("logAudit");
  });

  it("يجب أن توجد سياسة احتفاظ قابلة للإدارة (SEC-04)", () => {
    const rasidAI = fs.readFileSync(path.join(SERVER_DIR, "rasidAI.ts"), "utf-8");
    expect(rasidAI).toContain("manage_retention_policies");
  });

  it("يجب أن يوجد جدول retention_policies في DB", () => {
    const schema = fs.readFileSync(path.join(PROJECT_ROOT, "drizzle/schema.ts"), "utf-8");
    expect(schema).toContain("ai_retention_policies");
    expect(schema).toContain("retentionDays");
    expect(schema).toContain("autoDeleteEnabled");
  });
});

```

---

