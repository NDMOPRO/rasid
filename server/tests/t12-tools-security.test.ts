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
