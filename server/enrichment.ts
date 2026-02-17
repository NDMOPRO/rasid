// Enrichment module - enriches leak data with additional context
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export async function enrichLeak(leakId: string) {
  const leak = await db.getLeakById(leakId);
  if (!leak) throw new Error("Leak not found");
  
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "أنت محلل أمن سيبراني. قم بتحليل التسريب التالي وتقديم تقييم للمخاطر." },
        { role: "user", content: `تحليل التسريب: ${leak.title || ""}\nالوصف: ${leak.description || ""}\nالنوع: ${leak.leakType || ""}` },
      ],
    });
    
    const analysis = response?.choices?.[0]?.message?.content || "تحليل غير متوفر";
    return { success: true, analysis, leakId };
  } catch (e) {
    return { success: false, error: "فشل في إثراء البيانات", leakId };
  }
}

export async function enrichAllPending() {
  const leaks = await db.getLeaks({ status: "pending" });
  const results = [];
  for (const leak of (leaks as any[]).slice(0, 10)) {
    try {
      const result = await enrichLeak(leak.leakId || leak.id);
      results.push(result);
    } catch (e) {
      results.push({ success: false, leakId: leak.leakId || leak.id });
    }
  }
  return { processed: results.length, results };
}
