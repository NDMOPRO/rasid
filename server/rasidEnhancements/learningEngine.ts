/**
 * Learning Engine - Issue #7
 * Self-learning system that uses feedback to improve responses
 */

import type { AiResponseRating } from '../../drizzle/schema';

interface LearningPattern {
  query: string;
  response: string;
  rating: number;
  frequency: number;
  toolsUsed: string[];
  lastSeen: number;
}

interface SystemPromptModification {
  pattern: string;
  modification: string;
  confidence: number;
  occurrences: number;
}

export class LearningEngine {
  private positivePatterns: Map<string, LearningPattern> = new Map();
  private negativePatterns: Map<string, LearningPattern> = new Map();
  private systemPromptMods: SystemPromptModification[] = [];

  /**
   * Analyze a rating and extract learning patterns
   */
  analyzeRating(rating: AiResponseRating): void {
    const {
      userMessage,
      aiResponse,
      rating: score,
      toolsUsed,
    } = rating;

    if (!userMessage || !aiResponse) return;

    const normalizedQuery = this.normalizeQuery(userMessage);
    const timestamp = Date.now();

    const pattern: LearningPattern = {
      query: normalizedQuery,
      response: aiResponse,
      rating: score,
      frequency: 1,
      toolsUsed: (toolsUsed as string[]) || [],
      lastSeen: timestamp,
    };

    // Positive rating (4-5 stars) - add to training data
    if (score >= 4) {
      const existing = this.positivePatterns.get(normalizedQuery);
      if (existing) {
        existing.frequency++;
        existing.lastSeen = timestamp;
        // Update response if newer rating is higher
        if (score > existing.rating) {
          existing.response = aiResponse;
          existing.rating = score;
          existing.toolsUsed = pattern.toolsUsed;
        }
      } else {
        this.positivePatterns.set(normalizedQuery, pattern);
      }
    }
    // Negative rating (1-2 stars) - analyze for issues
    else if (score <= 2) {
      const existing = this.negativePatterns.get(normalizedQuery);
      if (existing) {
        existing.frequency++;
        existing.lastSeen = timestamp;
      } else {
        this.negativePatterns.set(normalizedQuery, pattern);
      }

      // Analyze what went wrong
      this.analyzeNegativeFeedback(pattern);
    }
  }

  /**
   * Normalize query for pattern matching
   */
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[؟?!.،,]/g, '');
  }

  /**
   * Analyze negative feedback to identify recurring issues
   */
  private analyzeNegativeFeedback(pattern: LearningPattern): void {
    // Check if this is a recurring negative pattern
    if (pattern.frequency >= 3) {
      // Detect common issues in negative responses
      const issues = this.detectIssues(pattern);
      
      issues.forEach(issue => {
        this.suggestSystemPromptModification(issue);
      });
    }
  }

  /**
   * Detect issues in negative feedback
   */
  private detectIssues(pattern: LearningPattern): string[] {
    const issues: string[] = [];
    const response = pattern.response.toLowerCase();

    // Issue: Too verbose
    if (response.length > 1000 && pattern.rating <= 2) {
      issues.push('responses_too_verbose');
    }

    // Issue: Not using tools when should
    if (
      (pattern.query.includes('كم') || pattern.query.includes('how many')) &&
      pattern.toolsUsed.length === 0
    ) {
      issues.push('missing_data_tools');
    }

    // Issue: Hallucination (definitive statements without tool use)
    if (
      /^\d+/.test(response) &&
      pattern.toolsUsed.length === 0 &&
      !response.includes('تقريب')
    ) {
      issues.push('potential_hallucination');
    }

    // Issue: Not answering in Arabic when expected
    const arabicChars = (response.match(/[\u0600-\u06FF]/g) || []).length;
    const totalChars = response.length;
    if (arabicChars / totalChars < 0.3 && pattern.query.match(/[\u0600-\u06FF]/)) {
      issues.push('language_mismatch');
    }

    return issues;
  }

  /**
   * Suggest system prompt modifications based on recurring issues
   */
  private suggestSystemPromptModification(issue: string): void {
    const modifications: Record<string, string> = {
      responses_too_verbose:
        '# تنبيه: اجعل ردودك موجزة ومباشرة. لا تتجاوز 300 كلمة إلا للتحليلات المعقدة.',
      missing_data_tools:
        '# تنبيه: استخدم الأدوات المتاحة دائماً للإجابة على أسئلة البيانات والإحصائيات. لا تخمن الأرقام.',
      potential_hallucination:
        '# تنبيه: لا تقدم أرقام أو إحصائيات محددة إلا إذا حصلت عليها من الأدوات. استخدم عبارات مثل "تقريباً" إذا لم تكن متأكداً.',
      language_mismatch:
        '# تنبيه: أجب دائماً بنفس لغة السؤال. إذا سأل المستخدم بالعربية، أجب بالعربية بالكامل.',
    };

    const modification = modifications[issue];
    if (!modification) return;

    const existing = this.systemPromptMods.find(m => m.modification === modification);
    if (existing) {
      existing.occurrences++;
      existing.confidence = Math.min(existing.confidence + 0.1, 1.0);
    } else {
      this.systemPromptMods.push({
        pattern: issue,
        modification,
        confidence: 0.5,
        occurrences: 1,
      });
    }
  }

  /**
   * Get high-quality Q&A pairs for training
   */
  getTrainingData(minRating: number = 4, maxResults: number = 100): LearningPattern[] {
    return Array.from(this.positivePatterns.values())
      .filter(p => p.rating >= minRating)
      .sort((a, b) => {
        // Sort by rating, then frequency
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.frequency - a.frequency;
      })
      .slice(0, maxResults);
  }

  /**
   * Get suggested system prompt enhancements
   */
  getSystemPromptEnhancements(minConfidence: number = 0.6): string {
    const enhancements = this.systemPromptMods
      .filter(m => m.confidence >= minConfidence && m.occurrences >= 2)
      .map(m => m.modification);

    if (enhancements.length === 0) return '';

    return '\n\n# تحسينات مبنية على التعلم الذاتي:\n' + enhancements.join('\n');
  }

  /**
   * Get problematic query patterns
   */
  getProblematicPatterns(minOccurrences: number = 2): LearningPattern[] {
    return Array.from(this.negativePatterns.values())
      .filter(p => p.frequency >= minOccurrences)
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get learning statistics
   */
  getStats() {
    const positiveCount = this.positivePatterns.size;
    const negativeCount = this.negativePatterns.size;
    const totalPatterns = positiveCount + negativeCount;
    const avgPositiveRating =
      Array.from(this.positivePatterns.values()).reduce((sum, p) => sum + p.rating, 0) /
        positiveCount || 0;

    return {
      positivePatterns: positiveCount,
      negativePatterns: negativeCount,
      totalPatterns,
      avgPositiveRating: avgPositiveRating.toFixed(2),
      systemPromptMods: this.systemPromptMods.length,
      highConfidenceMods: this.systemPromptMods.filter(m => m.confidence >= 0.7).length,
    };
  }

  /**
   * Check if we have a learned response for a query
   */
  getLearnedResponse(query: string): LearningPattern | null {
    const normalized = this.normalizeQuery(query);
    const pattern = this.positivePatterns.get(normalized);
    
    // Only return if high quality (rating >= 4.5) and seen multiple times
    if (pattern && pattern.rating >= 4.5 && pattern.frequency >= 2) {
      return pattern;
    }

    return null;
  }

  /**
   * Export training data in a format suitable for fine-tuning
   */
  exportTrainingData(): Array<{ prompt: string; completion: string; rating: number }> {
    return Array.from(this.positivePatterns.values())
      .filter(p => p.rating >= 4)
      .map(p => ({
        prompt: p.query,
        completion: p.response,
        rating: p.rating,
      }));
  }
}

// Singleton instance
export const learningEngine = new LearningEngine();
