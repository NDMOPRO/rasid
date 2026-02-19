/**
 * Performance Metrics - Issue #12
 * Track and display performance indicators for transparency
 */

export interface PerformanceMetrics {
  responseTimeMs: number;
  responseSource: 'ai' | 'fallback' | 'cache';
  incidentsAnalyzed: number;
  confidenceScore: number; // 0-100
  toolsUsed: string[];
  startTime: number;
  endTime: number;
  cacheHit: boolean;
  fallbackUsed: boolean;
}

export class PerformanceTracker {
  private metrics: PerformanceMetrics | null = null;
  private startTime: number = 0;

  /**
   * Start tracking a response
   */
  start(): void {
    this.startTime = Date.now();
    this.metrics = {
      responseTimeMs: 0,
      responseSource: 'ai',
      incidentsAnalyzed: 0,
      confidenceScore: 0,
      toolsUsed: [],
      startTime: this.startTime,
      endTime: 0,
      cacheHit: false,
      fallbackUsed: false,
    };
  }

  /**
   * Mark response as coming from cache
   */
  markCacheHit(): void {
    if (this.metrics) {
      this.metrics.cacheHit = true;
      this.metrics.responseSource = 'cache';
    }
  }

  /**
   * Mark response as using fallback
   */
  markFallback(): void {
    if (this.metrics) {
      this.metrics.fallbackUsed = true;
      this.metrics.responseSource = 'fallback';
    }
  }

  /**
   * Record tools used
   */
  recordToolsUsed(tools: string[]): void {
    if (this.metrics) {
      this.metrics.toolsUsed = [...new Set([...this.metrics.toolsUsed, ...tools])];
    }
  }

  /**
   * Record number of incidents analyzed
   */
  recordIncidentsAnalyzed(count: number): void {
    if (this.metrics) {
      this.metrics.incidentsAnalyzed += count;
    }
  }

  /**
   * Calculate confidence score based on various factors
   */
  calculateConfidence(factors: {
    hasToolResults?: boolean;
    toolCount?: number;
    dataPointsUsed?: number;
    fallbackUsed?: boolean;
    cacheHit?: boolean;
  }): void {
    if (!this.metrics) return;

    let score = 50; // Base score

    // Cache hit = high confidence (data is recent)
    if (factors.cacheHit) {
      score += 40;
    }
    // Fallback = lower confidence (pattern-based, not AI)
    else if (factors.fallbackUsed) {
      score = 60;
    }
    // AI with tools = high confidence
    else if (factors.hasToolResults && factors.toolCount) {
      score += 20 + Math.min(factors.toolCount * 5, 25);
    }
    // AI without tools = medium confidence
    else {
      score = 70;
    }

    // Adjust based on data points
    if (factors.dataPointsUsed) {
      score += Math.min(factors.dataPointsUsed / 10, 10);
    }

    this.metrics.confidenceScore = Math.min(Math.round(score), 100);
  }

  /**
   * End tracking and finalize metrics
   */
  end(): PerformanceMetrics | null {
    if (!this.metrics) return null;

    this.metrics.endTime = Date.now();
    this.metrics.responseTimeMs = this.metrics.endTime - this.metrics.startTime;

    return this.metrics;
  }

  /**
   * Get current metrics (for real-time updates)
   */
  getCurrent(): PerformanceMetrics | null {
    return this.metrics;
  }

  /**
   * Format metrics for display
   */
  formatForDisplay(metrics: PerformanceMetrics): string {
    const lines: string[] = [];

    // Response time
    if (metrics.responseTimeMs < 1000) {
      lines.push(`⚡ وقت الاستجابة: ${metrics.responseTimeMs}ms`);
    } else {
      lines.push(`⏱️ وقت الاستجابة: ${(metrics.responseTimeMs / 1000).toFixed(2)}s`);
    }

    // Response source
    const sourceEmoji = {
      ai: '🤖',
      cache: '⚡',
      fallback: '🔄',
    };
    const sourceText = {
      ai: 'الذكاء الاصطناعي',
      cache: 'التخزين المؤقت',
      fallback: 'النظام الاحتياطي',
    };
    lines.push(
      `${sourceEmoji[metrics.responseSource]} المصدر: ${sourceText[metrics.responseSource]}`
    );

    // Incidents analyzed
    if (metrics.incidentsAnalyzed > 0) {
      lines.push(`📊 عدد الحوادث المحللة: ${metrics.incidentsAnalyzed}`);
    }

    // Confidence score
    const confidenceEmoji = metrics.confidenceScore >= 80 ? '✅' : metrics.confidenceScore >= 60 ? '✔️' : '⚠️';
    lines.push(`${confidenceEmoji} مستوى الثقة: ${metrics.confidenceScore}%`);

    // Tools used
    if (metrics.toolsUsed.length > 0) {
      lines.push(`🔧 الأدوات المستخدمة: ${metrics.toolsUsed.length}`);
    }

    return lines.join('\n');
  }
}
