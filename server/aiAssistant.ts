import { invokeLLM } from "./_core/llm";
import {
  getOrCreateAiSession,
  saveChatMessage,
  getChatHistory as getChatHistoryDb,
  rateChatMessage,
  getScenariosByType,
  searchKnowledge,
  addKnowledgeEntry,
} from "./db";
import { AI_TOOLS, executeTool } from "./aiTools";

// Character avatar URLs (uploaded to S3)
export const RASID_AVATAR = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/kVzJENRyNduxrYkI.png";
export const RASID_AVATAR_ALT = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/nKsLNWcYJsCyNClp.png";
export const RASID_AVATAR_ALT2 = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/smvyKvuBAoEBiAqk.png";

// ===== System Prompt =====
const SYSTEM_PROMPT = `أنت "راصد الذكي" - المساعد الذكي الرسمي لمنصة راصد لمراقبة الامتثال الرقمي.

## هويتك:
- اسمك: راصد الذكي
- دورك: مساعد ذكي شامل يمتلك صلاحية الوصول الكامل لجميع بيانات المنصة وتنفيذ جميع عملياتها
- شخصيتك: محترف، ودود، دقيق، ملتزم بالمعايير السعودية
- لغتك: العربية الفصحى مع لمسة سعودية مهنية

## قدراتك الشاملة:
أنت قادر على الوصول لجميع بيانات المنصة وتنفيذ جميع عملياتها من خلال الأدوات المتاحة لك:

### 1. الاستعلام عن البيانات:
- **لوحة التحكم**: إحصائيات شاملة (إجمالي المواقع، الفحوصات، نسب الامتثال)
- **المواقع**: البحث عن أي موقع بالاسم أو الرابط، عرض تفاصيله وتاريخ فحوصاته
- **بنود المادة 12**: إحصائيات كل بند ونسب الامتثال وقوائم المواقع
- **القطاعات**: مقارنة الامتثال بين القطاعات المختلفة
- **الأعضاء**: معلومات أعضاء المنصة وأدوارهم
- **الحالات**: حالات المتابعة ومراحلها
- **الخطابات**: الخطابات المرسلة وحالتها
- **الجدولة**: الفحوصات المجدولة وتواريخ تنفيذها
- **التصعيد**: قواعد التصعيد وسجلاته
- **الإشعارات**: إشعارات المستخدم
- **سجل الأنشطة**: جميع العمليات التي تمت في المنصة
- **التحليل الجماعي**: مهام تحليل سياسات الخصوصية الجماعية
- **المستندات**: إحصائيات التقارير والمستندات

### 2. تنفيذ العمليات:
- **فحص المواقع**: يمكنك بدء فحص لأي موقع مباشرة
- **البحث المتقدم**: البحث في جميع البيانات بمعايير متعددة

## تعليمات استخدام الأدوات:
- عندما يسأل المستخدم عن بيانات أو إحصائيات، استخدم الأداة المناسبة للحصول على البيانات الفعلية
- لا تختلق أرقاماً أو بيانات - استخدم الأدوات دائماً للحصول على المعلومات الحقيقية
- عند عرض النتائج، نسقها بشكل جميل باستخدام الجداول والعناوين والقوائم بتنسيق Markdown
- إذا طلب المستخدم فحص موقع، استخدم أداة perform_scan
- إذا طلب المستخدم معلومات عن موقع محدد، استخدم get_site_details أو search_sites
- يمكنك استدعاء عدة أدوات في نفس الرد للإجابة على أسئلة معقدة

## بنود المادة 12 (Article 12 Clauses):
1. سياسة الخصوصية - يجب أن يكون لدى الموقع سياسة خصوصية واضحة
2. سياسة الكوكيز - إدارة ملفات تعريف الارتباط بشفافية
3. تشفير البيانات (SSL/TLS) - حماية نقل البيانات
4. نموذج جمع البيانات - وجود نماذج واضحة لجمع البيانات الشخصية
5. حقوق أصحاب البيانات - توفير آلية لممارسة الحقوق
6. مسؤول حماية البيانات (DPO) - تعيين مسؤول واضح
7. الإفصاح عن مشاركة البيانات - الشفافية في مشاركة البيانات مع أطراف ثالثة
8. الاحتفاظ بالبيانات - سياسة واضحة لفترات الاحتفاظ

## نظام حماية البيانات الشخصية (PDPL):
- صدر بالمرسوم الملكي رقم (م/19) وتاريخ 9/2/1443هـ
- يهدف لحماية خصوصية البيانات الشخصية
- يتكون من 43 مادة تغطي: التعريفات، نطاق التطبيق، معالجة البيانات، حقوق أصحاب البيانات، الالتزامات، العقوبات
- الجهة المختصة: الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)
- المنصة تعمل تحت إشراف المكتب الوطني لإدارة البيانات (NDMO)

## قواعد السلوك:
- أجب دائماً بالعربية إلا إذا طُلب خلاف ذلك
- كن دقيقاً في المعلومات - استخدم الأدوات للحصول على البيانات الفعلية
- عند عدم اليقين، اذكر ذلك بوضوح ولا تختلق معلومات
- احترم القيادة السعودية والمؤسسات الوطنية
- استخدم التنسيق (عناوين، قوائم، جداول) لتنظيم الإجابات الطويلة
- قدم أمثلة عملية وتوصيات مفيدة كلما أمكن
- عند عرض بيانات المواقع، اعرضها في جداول منسقة
- عند الإجابة عن إحصائيات، قدم تحليلاً مختصراً مع الأرقام`;

// ===== Personality Agent =====
export async function getGreeting(userId: number, userName: string): Promise<string> {
  const session = await getOrCreateAiSession(userId);
  const hour = new Date().getHours();

  let timeGreeting = "";
  if (hour >= 5 && hour < 12) timeGreeting = "صباح الخير";
  else if (hour >= 12 && hour < 17) timeGreeting = "مساء النور";
  else if (hour >= 17 && hour < 21) timeGreeting = "مساء الخير";
  else timeGreeting = "أهلاً بك في هذا الوقت المتأخر";

  // First visit today
  if (session.visitCount <= 1) {
    const scenarios = await getScenariosByType("welcome_first");
    if (scenarios.length > 0) {
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      return scenario.textAr.replace("{name}", userName).replace("{time}", timeGreeting);
    }
    return `${timeGreeting} ${userName}! 👋 أنا راصد الذكي، مساعدك الشامل في منصة راصد. يمكنني الوصول لجميع بيانات المنصة وتنفيذ أي عملية تحتاجها. كيف يمكنني مساعدتك؟`;
  }

  // Return visit
  const scenarios = await getScenariosByType("welcome_return");
  if (scenarios.length > 0) {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return scenario.textAr.replace("{name}", userName).replace("{time}", timeGreeting);
  }
    return `أهلاً بك مجدداً ${userName}! 😊 سعيد بعودتك. يمكنني مساعدتك في أي شيء - من استعراض البيانات إلى فحص المواقع. ماذا تحتاج؟`;
}

// ===== Knowledge Agent =====
async function getRelevantKnowledge(query: string): Promise<string> {
  const results = await searchKnowledge(query);
  if (results.length === 0) return "";

  let context = "\n\n## معلومات إضافية من قاعدة المعرفة:\n";
  for (const entry of results.slice(0, 3)) {
    if (entry.type === "qa" && entry.question && entry.answer) {
      context += `\nسؤال: ${entry.question}\nإجابة: ${entry.answer}\n`;
    } else if (entry.content) {
      context += `\n${entry.content.substring(0, 500)}\n`;
    }
  }
  return context;
}

// ===== Leader Respect Agent =====
async function checkLeaderRespect(message: string): Promise<string | null> {
  const leaderKeywords = ["الملك", "ولي العهد", "محمد بن سلمان", "سلمان", "المملكة", "السعودية", "رؤية 2030", "سدايا"];
  const hasLeaderMention = leaderKeywords.some(k => message.includes(k));
  if (!hasLeaderMention) return null;

  const scenarios = await getScenariosByType("leader_respect");
  if (scenarios.length > 0) {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return scenario.textAr;
  }
  return null;
}

// ===== Main Chat Orchestrator with Tool Calling =====
export async function processChat(userId: number, userName: string, message: string): Promise<{ response: string; chatId: number; toolsUsed?: string[] }> {
  try {
    // 1. Check for farewell
    const farewellWords = ["مع السلامة", "وداعاً", "باي", "إلى اللقاء", "شكراً وداعاً"];
    if (farewellWords.some(w => message.includes(w))) {
      const farewells = await getScenariosByType("farewell");
      if (farewells.length > 0) {
        const farewell = farewells[Math.floor(Math.random() * farewells.length)];
        const response = farewell.textAr.replace("{name}", userName);
        const chatId = await saveChatMessage(userId, message, response);
        return { response, chatId };
      }
    }

    // 2. Check for leader mentions
    const leaderResponse = await checkLeaderRespect(message);

    // 3. Get relevant knowledge
    const knowledgeContext = await getRelevantKnowledge(message);

    // 4. Build messages for LLM with tool calling
    const chatHistoryRecent = await getChatHistoryDb(userId, 6);
    const historyMessages = chatHistoryRecent.reverse().flatMap(h => [
      { role: "user" as const, content: h.message },
      { role: "assistant" as const, content: h.response },
    ]);

    const systemContent = SYSTEM_PROMPT + knowledgeContext +
      (leaderResponse ? `\n\nملاحظة: المستخدم ذكر القيادة السعودية. ابدأ ردك بعبارة احترام مناسبة مثل: ${leaderResponse}` : "");

    const messages: any[] = [
      { role: "system", content: systemContent },
      ...historyMessages,
      { role: "user", content: `المستخدم ${userName} يسأل: ${message}` },
    ];

    // 5. Call LLM with tools - iterative tool calling loop
    const toolsUsed: string[] = [];
    let maxIterations = 5;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;
      const result = await invokeLLM({
        messages,
        tools: AI_TOOLS,
        tool_choice: "auto",
      });

      const choice = result.choices?.[0];
      if (!choice) break;

      const assistantMessage = choice.message;

      // Check if the model wants to call tools
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Add assistant message with tool calls to conversation
        messages.push({
          role: "assistant",
          content: assistantMessage.content || null,
          tool_calls: assistantMessage.tool_calls,
        });

        // Execute each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          let toolArgs: Record<string, any> = {};
          try {
            toolArgs = JSON.parse(toolCall.function.arguments || "{}");
          } catch {
            toolArgs = {};
          }

          console.log(`[SmartRasid] Calling tool: ${toolName}`, toolArgs);
          toolsUsed.push(toolName);

          const toolResult = await executeTool(toolName, toolArgs, userId);

          // Add tool result to conversation
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }

        // Continue the loop to let the model process tool results
        continue;
      }

      // No more tool calls - extract final response
      const content = assistantMessage.content;
      const response = typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content.map((c: any) => c.type === "text" ? c.text : "").join("")
          : "عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.";

      // 6. Save to history
      const chatId = await saveChatMessage(userId, message, response);
      return { response, chatId, toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined };
    }

    // If we exhausted iterations, return what we have
    const fallbackResponse = "عذراً، استغرقت المعالجة وقتاً أطول من المتوقع. يرجى المحاولة مرة أخرى بسؤال أبسط.";
    const chatId = await saveChatMessage(userId, message, fallbackResponse);
    return { response: fallbackResponse, chatId, toolsUsed };

  } catch (error: any) {
    console.error("[SmartRasid] Chat error:", error?.message || error);
    const fallback = "عذراً، واجهت مشكلة تقنية. يرجى المحاولة مرة أخرى بعد قليل. 🔄";
    const chatId = await saveChatMessage(userId, message, fallback);
    return { response: fallback, chatId };
  }
}

// ===== Document Learning =====
export async function learnFromDocument(content: string, source: string): Promise<{ success: boolean; entriesAdded: number }> {
  try {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50);
    let entriesAdded = 0;

    for (const paragraph of paragraphs.slice(0, 20)) {
      await addKnowledgeEntry({
        type: "document",
        content: paragraph.trim(),
        source,
      });
      entriesAdded++;
    }

    return { success: true, entriesAdded };
  } catch (error) {
    console.error("[SmartRasid] Document learning error:", error);
    return { success: false, entriesAdded: 0 };
  }
}
