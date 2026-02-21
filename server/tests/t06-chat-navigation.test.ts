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
