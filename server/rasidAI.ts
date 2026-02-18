// Rasid AI Chat module - handles AI-powered chat interactions
import { invokeLLM } from "./_core/llm";
import * as db from "./db";

export async function rasidAIChat(params: {
  message: string;
  userId: number;
  userName: string;
  conversationId?: string;
  context?: string;
}) {
  const { message, userId, userName, conversationId, context } = params;
  
  try {
    const systemPrompt = `أنت "راصد الذكي"، مساعد ذكي متخصص في منصة رصد البيانات الشخصية.
مهمتك مساعدة المستخدمين في:
- تحليل حالات الرصد والبيانات المكشوفة
- تقديم توصيات أمنية
- شرح مفاهيم الخصوصية وحماية البيانات
- المساعدة في إدارة الحوادث الأمنية

تحدث باللغة العربية بشكل احترافي ومهذب.
اسم المستخدم: ${userName}`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];
    
    if (context) {
      messages.push({ role: "assistant", content: context });
    }
    
    messages.push({ role: "user", content: message });

    const response = await invokeLLM({ messages });
    const reply = response?.choices?.[0]?.message?.content || "عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.";

    return {
      reply,
      conversationId: conversationId || crypto.randomUUID(),
      toolsUsed: [] as string[],
    };
  } catch (error) {
    return {
      reply: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة لاحقاً.",
      conversationId: conversationId || crypto.randomUUID(),
      toolsUsed: [] as string[],
    };
  }
}
