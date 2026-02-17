/**
 * RAG System (Retrieval-Augmented Generation) for Smart Rasid
 * 
 * Provides:
 * 1. Embedding generation and cosine similarity search
 * 2. Knowledge base search (semantic + text)
 * 3. Custom command handling
 * 4. Scenario matching (greetings, VIP, etc.)
 * 5. System prompt builder
 * 6. Main query processor with platform tools integration
 */

import { getDb } from "../db";
import {
  knowledgeBase, aiScenarios, aiCustomCommands,
  aiChatSessions, aiChatMessages, aiSearchLog
} from "../../drizzle/schema";
import { invokeLLM, generateEmbedding, type Message, type Tool } from "./llm";
import { eq, and, like, or, desc, sql, count } from "drizzle-orm";
import { ENV } from "./env";
import { platformTools, executePlatformTool } from "./platformTools";

// Re-export for convenience
export { generateEmbedding };

// ============================================
// Cosine Similarity
// ============================================
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// ============================================
// Knowledge Base Search (Semantic + Text)
// ============================================
export async function searchKnowledge(query: string, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  // Text search fallback
  const words = query.split(/\s+/).filter(w => w.length > 2);
  const textConditions = words.length > 0
    ? words.map(w => or(
        like(knowledgeBase.title, `%${w}%`),
        like(knowledgeBase.content, `%${w}%`),
        like(knowledgeBase.question, `%${w}%`)
      ))
    : [];

  let textResults: any[] = [];
  if (textConditions.length > 0) {
    textResults = await db.select()
      .from(knowledgeBase)
      .where(and(eq(knowledgeBase.isActive, true), or(...textConditions)))
      .limit(limit * 2);
  }

  // Semantic search with embeddings
  const queryEmbedding = await generateEmbedding(query);
  if (queryEmbedding.length === 0) {
    // Fallback to text results only
    return textResults.slice(0, limit).map(r => ({
      ...r,
      score: 0.5,
    }));
  }

  // Get all items with embeddings
  const allWithEmbeddings = await db.select()
    .from(knowledgeBase)
    .where(and(
      eq(knowledgeBase.isActive, true),
      sql`${knowledgeBase.embedding} IS NOT NULL`
    ));

  // Score and sort by similarity
  const scored = allWithEmbeddings
    .map(item => ({
      ...item,
      score: cosineSimilarity(queryEmbedding, (item.embedding as number[]) || []),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Merge text and semantic results, remove duplicates
  const seenIds = new Set(scored.map(s => s.id));
  const merged = [
    ...scored,
    ...textResults
      .filter(t => !seenIds.has(t.id))
      .map(t => ({ ...t, score: 0.3 }))
  ].slice(0, limit);

  // Log search
  await db.insert(aiSearchLog).values({
    query,
    resultsCount: merged.length,
    topScore: merged[0]?.score || 0,
  }).catch(() => {});

  // Update use counts
  for (const item of merged) {
    await db.update(knowledgeBase)
      .set({ useCount: sql`${knowledgeBase.useCount} + 1` })
      .where(eq(knowledgeBase.id, item.id))
      .catch(() => {});
  }

  return merged;
}

// ============================================
// Custom Command Check
// ============================================
async function checkCustomCommand(userInput: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  if (!userInput.startsWith("!")) return null;

  const parts = userInput.split(/\s+/);
  const commandName = parts[0];
  const args = parts.slice(1);

  const [cmd] = await db.select()
    .from(aiCustomCommands)
    .where(and(eq(aiCustomCommands.command, commandName), eq(aiCustomCommands.isEnabled, true)));

  if (!cmd) return null;

  switch (cmd.handler) {
    case "scan_site":
      return `جاري فحص الموقع: ${args[0] || "غير محدد"}...\n\nسيتم إرسال النتائج فور اكتمال الفحص.`;
    case "generate_report":
      return `جاري إنشاء تقرير لـ: ${args[0] || "جميع المواقع"}...\n\nسيتم تجهيز التقرير خلال لحظات.`;
    case "show_stats":
      return "جاري جلب إحصائيات المنصة...";
    case "compare_sectors":
      return `جاري مقارنة القطاعات: ${args.join(" و ")}...`;
    case "list_alerts":
      return "جاري جلب آخر التنبيهات...";
    default:
      return null;
  }
}

// ============================================
// Scenario Matching
// ============================================
async function matchScenario(
  userInput: string,
  userName: string,
  isFirstMessage: boolean
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const scenarios = await db.select()
    .from(aiScenarios)
    .where(eq(aiScenarios.isEnabled, true))
    .orderBy(desc(aiScenarios.priority));

  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  for (const scenario of scenarios) {
    // Greeting on first message
    if (scenario.type === "greeting" && isFirstMessage) {
      const conditions = scenario.conditions as any;
      if (conditions?.timeOfDay && conditions.timeOfDay !== timeOfDay) continue;

      let response = scenario.responseTemplate || "";
      response = response.replace("{{userName}}", userName);
      response = response.replace("{{timeGreeting}}",
        timeOfDay === "morning" ? "صباح الخير" :
        timeOfDay === "afternoon" ? "مساء الخير" : "مساء النور"
      );
      return response;
    }

    // VIP name mentions
    if (scenario.type === "vip_response") {
      const conditions = scenario.conditions as any;
      if (conditions?.mentionedNames) {
        for (const name of conditions.mentionedNames) {
          if (userInput.includes(name)) {
            return scenario.responseTemplate || "";
          }
        }
      }
    }

    // Regex trigger pattern
    if (scenario.triggerPattern) {
      try {
        const regex = new RegExp(scenario.triggerPattern, "i");
        if (regex.test(userInput)) {
          let response = scenario.responseTemplate || "";
          response = response.replace("{{userName}}", userName);
          return response;
        }
      } catch {}
    }
  }

  return null;
}

// ============================================
// Build System Prompt
// ============================================
function buildSystemPrompt(
  personaPrompt: string | null,
  contextText: string,
  userName: string
): string {
  const defaultPersona = `أنت "راصد الذكي"، المساعد الذكي المتخصص في منصة راصد لرصد سياسات الخصوصية.
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
8. الاحتفاظ بالبيانات`;

  return `${personaPrompt || defaultPersona}

=== تعليمات الإجابة ===
1. أجب بدقة بناءً على المعلومات المتاحة في قاعدة المعرفة أدناه
2. إذا وجدت معلومات ذات صلة، اذكر المصدر
3. إذا لم تجد معلومات كافية، استخدم الأدوات المتاحة لجلب البيانات
4. استخدم التنسيق Markdown في إجاباتك (عناوين، قوائم، جداول)
5. كن موجزاً ومباشراً

=== قاعدة المعرفة ===
${contextText || "لا توجد معلومات ذات صلة في قاعدة المعرفة حالياً."}
=== نهاية قاعدة المعرفة ===`;
}

// ============================================
// Main Query Processor
// ============================================
export async function processSmartRasidQuery(
  messages: Message[],
  userId: number,
  userName: string,
  sessionId: string
): Promise<{
  response: string;
  sources: { id: number; title: string; score: number }[];
  tokensUsed: number;
  durationMs: number;
  messageId: string;
}> {
  const startTime = Date.now();
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const userQuery = messages[messages.length - 1].content as string;
  const isFirstMessage = messages.filter(m => m.role === "user").length === 1;
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Step 1: Check custom commands
  const commandResult = await checkCustomCommand(userQuery);
  if (commandResult) {
    const duration = Date.now() - startTime;
    await saveChatMessage(db, sessionId, messageId, "assistant", commandResult, [], 0, duration);
    return { response: commandResult, sources: [], tokensUsed: 0, durationMs: duration, messageId };
  }

  // Step 2: Check scenarios
  const scenarioResult = await matchScenario(userQuery, userName, isFirstMessage);

  // Step 3: Search knowledge base (RAG)
  const knowledgeResults = await searchKnowledge(userQuery);
  const contextText = knowledgeResults
    .map(item => `[المصدر: ${item.title || item.question || "غير معنون"}] (درجة التطابق: ${(item.score * 100).toFixed(0)}%)\n${item.content || item.answer || ""}`)
    .join("\n\n---\n\n");

  const sources = knowledgeResults.map(item => ({
    id: item.id,
    title: item.title || item.question || "غير معنون",
    score: item.score,
  }));

  // Step 4: Get persona
  const personaResults = await db.select()
    .from(aiScenarios)
    .where(and(eq(aiScenarios.type, "persona"), eq(aiScenarios.isEnabled, true)));
  const persona = personaResults[0];

  // Step 5: Build final messages
  const systemPrompt = buildSystemPrompt(
    persona?.systemPrompt || null,
    contextText,
    userName
  );

  let additionalContext = "";
  if (scenarioResult) {
    additionalContext = `\n\n=== توجيه خاص ===\n${scenarioResult}\n=== نهاية التوجيه ===`;
  }

  const finalMessages: Message[] = [
    { role: "system", content: systemPrompt + additionalContext },
    ...messages.slice(-10)
  ];

  // Step 6: Call LLM with platform tools
  try {
    const llmResponse = await invokeLLM({
      messages: finalMessages,
      tools: platformTools,
      toolChoice: "auto",
    });

    let responseContent = "";
    const firstChoice = llmResponse.choices[0];

    // Handle tool calls
    if (firstChoice.message.tool_calls && firstChoice.message.tool_calls.length > 0) {
      const toolResults: Message[] = [];

      for (const toolCall of firstChoice.message.tool_calls) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await executePlatformTool(toolCall.function.name, args);
          toolResults.push({
            role: "tool",
            content: result,
            tool_call_id: toolCall.id,
          });
        } catch (e) {
          toolResults.push({
            role: "tool",
            content: JSON.stringify({ error: `فشل تنفيذ الأداة: ${(e as Error).message}` }),
            tool_call_id: toolCall.id,
          });
        }
      }

      // Follow-up call with tool results
      const followUpMessages: Message[] = [
        ...finalMessages,
        firstChoice.message as any,
        ...toolResults,
      ];

      const followUpResponse = await invokeLLM({ messages: followUpMessages });
      responseContent = followUpResponse.choices[0].message.content as string;
    } else {
      responseContent = firstChoice.message.content as string;
    }

    const tokensUsed = llmResponse.usage?.total_tokens || 0;
    const durationMs = Date.now() - startTime;

    // Step 7: Save message
    await saveChatMessage(db, sessionId, messageId, "assistant", responseContent, sources, tokensUsed, durationMs);

    // Update session stats
    await db.update(aiChatSessions)
      .set({
        messageCount: sql`${aiChatSessions.messageCount} + 2`,
        totalTokens: sql`${aiChatSessions.totalTokens} + ${tokensUsed}`,
        totalDurationMs: sql`${aiChatSessions.totalDurationMs} + ${durationMs}`,
      })
      .where(eq(aiChatSessions.sessionId, sessionId))
      .catch(() => {});

    return { response: responseContent, sources, tokensUsed, durationMs, messageId };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMsg = `عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.\n\n_الخطأ: ${(error as Error).message}_`;
    await saveChatMessage(db, sessionId, messageId, "assistant", errorMsg, [], 0, durationMs);
    return { response: errorMsg, sources: [], tokensUsed: 0, durationMs, messageId };
  }
}

// ============================================
// Save Chat Message
// ============================================
async function saveChatMessage(
  db: any,
  sessionId: string,
  messageId: string,
  role: string,
  content: string,
  sources: any[],
  tokensUsed: number,
  durationMs: number
) {
  await db.insert(aiChatMessages).values({
    sessionId,
    messageId,
    role: role as any,
    content,
    sources,
    tokensUsed,
    durationMs,
    model: "gemini-2.5-flash",
  }).catch((e: any) => console.error("[RAG] Failed to save chat message:", e));
}
