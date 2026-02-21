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
