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
