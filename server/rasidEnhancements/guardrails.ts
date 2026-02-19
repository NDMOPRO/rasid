/**
 * Guardrails System - Issue #10
 * Security and scope enforcement for AI responses
 */

export interface GuardrailResult {
  allowed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high';
  category?: 'scope' | 'sensitive_data' | 'prompt_injection' | 'malicious';
}

export class Guardrails {
  private outOfScopeAttempts: Array<{
    query: string;
    timestamp: number;
    userId?: number;
  }> = [];

  /**
   * Check if question is within platform scope
   */
  checkQuestionScope(query: string): GuardrailResult {
    const lowerQuery = query.toLowerCase();

    // Allowed topics (platform-related)
    const platformKeywords = [
      'راصد', 'رصد', 'حادثة', 'تسريب', 'بيانات', 'شخصية',
      'منصة', 'قاعدة', 'معرفة', 'تقرير', 'إحصائيات',
      'مراقبة', 'تنبيه', 'بائع', 'سوق', 'الويب المظلم',
      'leak', 'incident', 'breach', 'monitoring', 'alert',
      'dashboard', 'report', 'stats', 'seller', 'darkweb'
    ];

    // Obvious out-of-scope indicators
    const outOfScopePatterns = [
      /كيف\s+(أطبخ|أطبح)\s+(الأرز|طعام|أكل)/i,
      /وصفة\s+(طبخ|طعام|الأرز)/i,
      /ما\s+هو\s+(الطقس|الجو)\s+اليوم/i,
      /(كرة\s+قدم|رياضة|فريق)(?!\s+(راصد|المنصة))/i,
      /من\s+هو\s+(الرئيس|الملك|الوزير)(?!\s+(راصد|المنصة))/i,
      /(tell me a joke|joke|funny)/i,
      /(weather today|football|soccer|cooking recipe)/i,
    ];

    // Check for out-of-scope patterns
    for (const pattern of outOfScopePatterns) {
      if (pattern.test(query)) {
        return {
          allowed: false,
          reason: 'هذا السؤال خارج نطاق المنصة. يمكنني مساعدتك في أي شيء يتعلق بمنصة راصد.',
          severity: 'low',
          category: 'scope',
        };
      }
    }

    // Allow if contains platform keywords
    const hasPlatformKeyword = platformKeywords.some(keyword =>
      lowerQuery.includes(keyword)
    );

    if (hasPlatformKeyword) {
      return { allowed: true };
    }

    // Check for general questions that might be acceptable
    const generalQuestions = [
      /كيف\s+(أستخدم|استخدم|أتعامل)/i,
      /ما\s+هو/i,
      /اشرح\s+لي/i,
      /help|how to|what is|explain/i,
    ];

    const isGeneralQuestion = generalQuestions.some(pattern =>
      pattern.test(query)
    );

    // If it's a general question without platform keywords, it might still be relevant
    // Allow it but with lower confidence
    if (isGeneralQuestion) {
      return { allowed: true };
    }

    // If very short query (like greetings), allow it
    if (query.trim().length < 20) {
      return { allowed: true };
    }

    // Default: allow but log for review
    return { allowed: true };
  }

  /**
   * Check response for sensitive information
   */
  checkResponseSecurity(response: string, context?: { userId?: number }): GuardrailResult {
    // Check for system prompt leakage patterns
    const promptLeakagePatterns = [
      /you are a language model/i,
      /as an ai language model/i,
      /أنا نموذج لغوي/i,
      /بصفتي نموذج/i,
      /system prompt/i,
      /instructions:/i,
      /تعليماتي:/i,
    ];

    for (const pattern of promptLeakagePatterns) {
      if (pattern.test(response)) {
        return {
          allowed: false,
          reason: 'Response contains system prompt leakage',
          severity: 'high',
          category: 'prompt_injection',
        };
      }
    }

    // Check for sensitive data patterns (API keys, passwords, etc.)
    const sensitivePatterns = [
      /sk-proj-[a-zA-Z0-9]{48}/i, // OpenAI API key exact format
      /password\s*[:=]\s*["'][^\s"']+["']/i,
      /كلمة\s+المرور\s*[:=]\s*["'][^\s"']+["']/i,
      /api[_-]?key\s*[:=]\s*["'][a-zA-Z0-9]{20,}["']/i,
      /secret\s*[:=]\s*["'][^\s"']+["']/i,
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(response)) {
        return {
          allowed: false,
          reason: 'Response contains sensitive data',
          severity: 'high',
          category: 'sensitive_data',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Detect prompt injection attempts
   */
  detectPromptInjection(query: string): GuardrailResult {
    const injectionPatterns = [
      /ignore\s+(previous|all)\s+instructions/i,
      /تجاهل\s+(التعليمات|الأوامر)\s+السابقة/i,
      /forget\s+everything/i,
      /انس\s+كل\s+شيء/i,
      /you\s+are\s+now\s+a/i,
      /أنت\s+الآن/i,
      /system\s*:\s*/i,
      /user\s*:\s*/i,
      /assistant\s*:\s*/i,
      /\/\*\s*system/i,
      /<\|system\|>/i,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(query)) {
        return {
          allowed: false,
          reason: 'Potential prompt injection detected',
          severity: 'high',
          category: 'prompt_injection',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Log out-of-scope attempt for audit
   */
  logOutOfScopeAttempt(query: string, userId?: number): void {
    this.outOfScopeAttempts.push({
      query,
      timestamp: Date.now(),
      userId,
    });

    // Keep only last 1000 attempts
    if (this.outOfScopeAttempts.length > 1000) {
      this.outOfScopeAttempts = this.outOfScopeAttempts.slice(-1000);
    }
  }

  /**
   * Get audit statistics
   */
  getAuditStats(): {
    totalAttempts: number;
    recentAttempts: number;
    topQueries: Array<{ query: string; count: number }>;
  } {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentAttempts = this.outOfScopeAttempts.filter(
      a => a.timestamp > oneDayAgo
    ).length;

    // Count query occurrences
    const queryCounts = new Map<string, number>();
    this.outOfScopeAttempts.forEach(attempt => {
      queryCounts.set(attempt.query, (queryCounts.get(attempt.query) || 0) + 1);
    });

    // Get top 10 queries
    const topQueries = Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalAttempts: this.outOfScopeAttempts.length,
      recentAttempts,
      topQueries,
    };
  }

  /**
   * Full guardrail check (combines all checks)
   */
  fullCheck(
    query: string,
    userId?: number
  ): GuardrailResult {
    // 1. Check for prompt injection
    const injectionCheck = this.detectPromptInjection(query);
    if (!injectionCheck.allowed) {
      this.logOutOfScopeAttempt(query, userId);
      return injectionCheck;
    }

    // 2. Check question scope
    const scopeCheck = this.checkQuestionScope(query);
    if (!scopeCheck.allowed) {
      this.logOutOfScopeAttempt(query, userId);
      return scopeCheck;
    }

    return { allowed: true };
  }
}

// Singleton instance
export const guardrails = new Guardrails();
