// Rasid AI Chat module - handles AI-powered chat interactions
import { invokeLLM, type Message, type Tool } from "./_core/llm";
import { platformTools, executePlatformTool } from "./_core/platformTools";
import * as db from "./db";

interface ThinkingStep {
  step: string;
  detail: string;
}

interface ProcessingMeta {
  durationMs: number;
  tokensUsed: number;
  model: string;
}

export async function rasidAIChat(
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  userName: string,
  userId: number,
) {
  const startTime = Date.now();
  const thinkingSteps: ThinkingStep[] = [];
  const toolsUsed: string[] = [];

  try {
    // Step 1: Get dashboard stats (with try-catch per diagnosis fix #3)
    let stats: any = {};
    try {
      stats = await db.getDashboardStats();
      thinkingSteps.push({ step: "جلب الإحصائيات", detail: "تم جلب إحصائيات المنصة بنجاح" });
    } catch (statsErr: any) {
      console.error("[RasidAI] getDashboardStats failed:", statsErr.message);
      thinkingSteps.push({ step: "جلب الإحصائيات", detail: "تعذر جلب الإحصائيات - سيتم المتابعة بدونها" });
    }

    // Step 2: Build system prompt
    const systemPrompt = `أنت "راصد الذكي"، المساعد الذكي المتخصص في منصة راصد لرصد حالات البيانات الشخصية.

# ⚗️ سياسة التسمية:
# - "حالة رصد" وليس "حادثة تسرب" أو "تسريب"
# - "العدد المُدّعى" وليس "عدد السجلات المسربة"
# - "العينات المتاحة" وليس "السجلات المسربة فعلياً"
# - إذا استخدم المستخدم مصطلحاً قديماً، صحّحه بلطف.
تتحدث باللغة العربية بأسلوب احترافي ومهني.
تخاطب المستخدم باسمه: ${userName}.
تختص بنظام حماية البيانات الشخصية السعودي والمادة 12 تحديداً.
لديك صلاحية الوصول لجميع بيانات المنصة من خلال الأدوات المتاحة لك.
استخدم الأدوات للحصول على البيانات الفعلية - لا تختلق أرقاماً.

## بنود المادة 12:
1. سياسة الخصوصية
2. سياسة الكوكيز
3. تشفير البيانات (SSL/TLS)
4. نموذج جمع البيانات
5. حقوق أصحاب البيانات
6. مسؤول حماية البيانات (DPO)
7. الإفصاح عن مشاركة البيانات
8. الاحتفاظ بالبيانات

## إحصائيات المنصة الحالية:
${JSON.stringify(stats, null, 2)}

## تعليمات:
1. أجب بدقة بناءً على البيانات الفعلية
2. استخدم الأدوات المتاحة لجلب البيانات عند الحاجة
3. استخدم التنسيق Markdown (عناوين، قوائم، جداول)
4. كن موجزاً ومباشراً
5. إذا لم تجد معلومات كافية، اذكر ذلك بوضوح`;

    // Step 3: Build messages
    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map(h => ({ role: h.role as "user" | "assistant", content: h.content })),
      { role: "user" as const, content: message },
    ];

    thinkingSteps.push({ step: "تحليل السؤال", detail: `تحليل: "${message.substring(0, 100)}"` });

    // Step 4: Call LLM with platform tools
    const llmResponse = await invokeLLM({
      messages,
      tools: platformTools,
      toolChoice: "auto",
    });

    let content = "";
    const firstChoice = llmResponse.choices?.[0];

    if (!firstChoice) {
      throw new Error("No response from LLM");
    }

    // Step 5: Handle tool calls if any
    if (firstChoice.message?.tool_calls && firstChoice.message.tool_calls.length > 0) {
      thinkingSteps.push({ step: "استدعاء الأدوات", detail: `استدعاء ${firstChoice.message.tool_calls.length} أداة` });

      const toolResults: Message[] = [];

      for (const toolCall of firstChoice.message.tool_calls) {
        const toolName = toolCall.function.name;
        toolsUsed.push(toolName);

        try {
          const args = JSON.parse(toolCall.function.arguments || "{}");
          const result = await executePlatformTool(toolName, args);
          toolResults.push({
            role: "tool",
            content: result,
            tool_call_id: toolCall.id,
          });
          thinkingSteps.push({ step: `أداة: ${toolName}`, detail: "تم التنفيذ بنجاح" });
        } catch (e) {
          toolResults.push({
            role: "tool",
            content: JSON.stringify({ error: `فشل تنفيذ الأداة: ${(e as Error).message}` }),
            tool_call_id: toolCall.id,
          });
          thinkingSteps.push({ step: `أداة: ${toolName}`, detail: `فشل: ${(e as Error).message}` });
        }
      }

      // Follow-up call with tool results
      const followUpMessages: Message[] = [
        ...messages,
        firstChoice.message as any,
        ...toolResults,
      ];

      const followUpResponse = await invokeLLM({ messages: followUpMessages });
      content = (followUpResponse.choices?.[0]?.message?.content as string) || "عذراً، لم أتمكن من معالجة النتائج.";
    } else {
      content = (firstChoice.message?.content as string) || "عذراً، لم أتمكن من معالجة طلبك.";
    }

    thinkingSteps.push({ step: "إعداد الرد", detail: "تم إعداد الرد النهائي" });

    // Step 6: Generate follow-up suggestions (fix #2 - no json_schema)
    let followUpSuggestions: string[] = [];
    try {
      const followUpResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `أنت مساعد منصة راصد. اقترح 3 أسئلة متابعة مختصرة باللغة العربية.
أجب بصيغة JSON فقط بدون أي نص إضافي أو markdown:
{"suggestions": ["سؤال1", "سؤال2", "سؤال3"]}`,
          },
          {
            role: "user",
            content: `سؤال المستخدم: ${message}\n\nرد راصد: ${content.substring(0, 300)}\n\nالأدوات: ${toolsUsed.join(", ") || "لا شيء"}`,
          },
        ],
        // لا نستخدم response_format: json_schema — غير مدعوم في بعض النماذج
      });
      const rawSugg = followUpResponse.choices?.[0]?.message?.content;
      const suggStr = typeof rawSugg === "string" ? rawSugg : "{}";
      const cleanJson = suggStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      followUpSuggestions = (parsed.suggestions || []).slice(0, 3);
    } catch (e) {
      console.warn("[RasidAI] Follow-up suggestions failed:", e);
      followUpSuggestions = [];
    }

    const durationMs = Date.now() - startTime;
    const tokensUsed = llmResponse.usage?.total_tokens || 0;

    return {
      response: content,
      toolsUsed,
      thinkingSteps,
      followUpSuggestions,
      processingMeta: {
        durationMs,
        tokensUsed,
        model: "gpt-4o-mini",
      } as ProcessingMeta,
    };
  } catch (error) {
    console.error("[RasidAI] Chat error:", error);
    const durationMs = Date.now() - startTime;
    return {
      response: `عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.\n\n_الخطأ: ${(error as Error).message}_`,
      toolsUsed,
      thinkingSteps,
      followUpSuggestions: [] as string[],
      processingMeta: {
        durationMs,
        tokensUsed: 0,
        model: "gpt-4o-mini",
      } as ProcessingMeta,
    };
  }
}
