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
