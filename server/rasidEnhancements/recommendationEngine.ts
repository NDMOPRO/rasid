/**
 * Recommendation Engine - Smart Proactive Suggestions
 * محرك التوصيات - اقتراحات استباقية ذكية
 * 
 * Features:
 * - Context-aware recommendations
 * - Pattern-based suggestions
 * - Smart question generation
 * - Next-step analysis suggestions
 * - Hidden relationship discovery
 */

export interface Recommendation {
  id: string;
  type: 'analysis' | 'action' | 'question' | 'relationship' | 'alert';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    type: string;
    params: Record<string, any>;
  };
  relatedEntities?: string[];
  createdAt: Date;
}

export interface UserContext {
  currentPage?: string;
  recentQueries?: string[];
  viewedIncidents?: string[];
  viewedSectors?: string[];
  timeSpent?: Record<string, number>;
  lastActivity?: Date;
}

export interface Pattern {
  id: string;
  type: 'anomaly' | 'trend' | 'correlation' | 'clustering';
  description: string;
  confidence: number;
  affectedEntities: string[];
  detectedAt: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export class RecommendationEngine {
  private recommendations: Recommendation[] = [];
  private detectedPatterns: Pattern[] = [];
  
  /**
   * Generate contextual recommendations based on user activity
   */
  getContextualRecommendations(context: UserContext): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Page-based recommendations
    if (context.currentPage) {
      recommendations.push(...this.getPageRecommendations(context.currentPage));
    }

    // Query-based recommendations
    if (context.recentQueries && context.recentQueries.length > 0) {
      recommendations.push(...this.getQueryRecommendations(context.recentQueries));
    }

    // Sector-based recommendations
    if (context.viewedSectors && context.viewedSectors.length > 0) {
      recommendations.push(...this.getSectorRecommendations(context.viewedSectors));
    }

    // Incident-based recommendations
    if (context.viewedIncidents && context.viewedIncidents.length > 0) {
      recommendations.push(...this.getIncidentRecommendations(context.viewedIncidents));
    }

    // Sort by priority and confidence
    return this.sortAndLimit(recommendations, 5);
  }

  /**
   * Get page-specific recommendations
   */
  private getPageRecommendations(page: string): Recommendation[] {
    const pageRecommendations: Record<string, Recommendation[]> = {
      '/dashboard': [
        {
          id: 'dash-1',
          type: 'analysis',
          title: 'تحليل الاتجاهات الشهرية',
          description: 'قم بتحليل كيف تغيرت حالات الرصد خلال آخر 6 أشهر',
          confidence: 0.8,
          priority: 'medium',
          action: {
            type: 'generate_chart',
            params: { chart_type: 'line', data_type: 'monthly_trend' },
          },
          createdAt: new Date(),
        },
        {
          id: 'dash-2',
          type: 'action',
          title: 'إنشاء تقرير دوري',
          description: 'أنشئ تقرير دوري شهري لملخص حالات الرصد',
          confidence: 0.7,
          priority: 'low',
          createdAt: new Date(),
        },
      ],
      '/leaks': [
        {
          id: 'leak-1',
          type: 'analysis',
          title: 'مقارنة القطاعات',
          description: 'قارن بين القطاع المالي والصحي من حيث عدد حالات الرصد',
          confidence: 0.75,
          priority: 'medium',
          action: {
            type: 'compare_sectors',
            params: { sectors: ['المالي', 'الصحي'] },
          },
          createdAt: new Date(),
        },
      ],
      '/evidence': [
        {
          id: 'ev-1',
          type: 'relationship',
          title: 'استكشاف العلاقات',
          description: 'اكتشف العلاقات بين حالات الرصد المتصلة في سلسلة الأدلة',
          confidence: 0.85,
          priority: 'high',
          createdAt: new Date(),
        },
      ],
    };

    return pageRecommendations[page] || [];
  }

  /**
   * Get recommendations based on recent queries
   */
  private getQueryRecommendations(queries: string[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const latestQuery = queries[queries.length - 1]?.toLowerCase() || '';

    // If user asked about specific sector
    const sectorMatch = latestQuery.match(/القطاع (المالي|الصحي|التعليمي|الحكومي)/);
    if (sectorMatch) {
      const sector = sectorMatch[1];
      recommendations.push({
        id: 'query-sector-1',
        type: 'analysis',
        title: `تحليل عميق للقطاع ${sector}`,
        description: `احصل على تحليل شامل لحالات رصد القطاع ${sector} بما في ذلك الاتجاهات والأنماط`,
        confidence: 0.9,
        priority: 'high',
        action: {
          type: 'deep_analysis',
          params: { sector },
        },
        createdAt: new Date(),
      });
    }

    // If user asked about statistics
    if (latestQuery.includes('إحصائيات') || latestQuery.includes('stats')) {
      recommendations.push({
        id: 'query-stats-1',
        type: 'action',
        title: 'عرض رسومات بيانية تفاعلية',
        description: 'احصل على رسوم بيانية تفاعلية للإحصائيات بدلاً من النصوص',
        confidence: 0.85,
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    // If user asked about incidents
    if (latestQuery.includes('حادثة') || latestQuery.includes('تسريب')) {
      recommendations.push({
        id: 'query-incident-1',
        type: 'question',
        title: 'أسئلة ذات صلة',
        description: 'من هم البائعون الأكثر نشاطاً؟ ما هي أنواع البيانات الأكثر تسريباً؟',
        confidence: 0.75,
        priority: 'low',
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Get recommendations based on viewed sectors
   */
  private getSectorRecommendations(sectors: string[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (sectors.length >= 2) {
      const [sector1, sector2] = sectors.slice(-2);
      recommendations.push({
        id: 'sector-compare-1',
        type: 'analysis',
        title: `مقارنة: ${sector1} مقابل ${sector2}`,
        description: `قارن بين القطاعين من حيث عدد حالات الرصد، حجم البيانات، والخطورة`,
        confidence: 0.8,
        priority: 'medium',
        action: {
          type: 'compare_sectors',
          params: { sectors: [sector1, sector2] },
        },
        relatedEntities: [sector1, sector2],
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Get recommendations based on viewed incidents
   */
  private getIncidentRecommendations(incidents: string[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (incidents.length >= 3) {
      recommendations.push({
        id: 'incident-pattern-1',
        type: 'relationship',
        title: 'اكتشاف أنماط مشتركة',
        description: 'هل لاحظت أنماطاً مشتركة بين حالات الرصد التي شاهدتها؟ دعني أحللها لك',
        confidence: 0.7,
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Suggest next analysis steps
   */
  suggestNextAnalysis(currentAnalysis: {
    type: string;
    data: any;
    results: any;
  }): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // If analyzed sector distribution, suggest drill-down
    if (currentAnalysis.type === 'sector_distribution') {
      recommendations.push({
        id: 'next-1',
        type: 'analysis',
        title: 'تحليل تفصيلي للقطاع الأكثر تأثراً',
        description: 'احفر أعمق في القطاع الذي يحتوي أكبر عدد من حالات الرصد',
        confidence: 0.85,
        priority: 'high',
        createdAt: new Date(),
      });
    }

    // If analyzed monthly trend, suggest forecasting
    if (currentAnalysis.type === 'monthly_trend') {
      recommendations.push({
        id: 'next-2',
        type: 'analysis',
        title: 'توقع الاتجاهات المستقبلية',
        description: 'استخدم البيانات التاريخية للتنبؤ بعدد حالات الرصد في الأشهر القادمة',
        confidence: 0.7,
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Generate smart questions
   */
  generateSmartQuestions(context: UserContext): string[] {
    const questions: string[] = [
      '🔍 ما هي القطاعات الأكثر تعرضاً للتسريبات؟',
      '📊 كيف تطورت حالات الرصد خلال الأشهر الستة الماضية؟',
      '🏪 من هم البائعون الأكثر نشاطاً في السوق السوداء؟',
      '🔐 ما هي أنواع البيانات الشخصية الأكثر تسريباً؟',
      '⚠️ ما هي حالات الرصد ذات الخطورة الحرجة المفتوحة حالياً؟',
      '📈 هل هناك ارتباط بين حجم البيانات المسربة والقطاع؟',
    ];

    // Filter based on context
    if (context.currentPage === '/dashboard') {
      return questions.slice(0, 3);
    }

    return questions.slice(0, 5);
  }

  /**
   * Discover hidden relationships
   */
  discoverHiddenRelations(entities: any[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Example: Find sellers that appear in multiple incidents
    const sellerFrequency = new Map<string, number>();
    entities.forEach(entity => {
      if (entity.seller) {
        sellerFrequency.set(
          entity.seller,
          (sellerFrequency.get(entity.seller) || 0) + 1
        );
      }
    });

    const frequentSellers = Array.from(sellerFrequency.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1]);

    if (frequentSellers.length > 0) {
      const [seller, count] = frequentSellers[0];
      recommendations.push({
        id: 'relation-seller-1',
        type: 'alert',
        title: 'بائع نشط متكرر',
        description: `البائع "${seller}" ظهر في ${count} حالات رصد. يُنصح بإنشاء قاعدة مراقبة خاصة به`,
        confidence: 0.9,
        priority: 'high',
        relatedEntities: [seller],
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Detect patterns and anomalies
   */
  detectPatterns(incidents: any[]): Pattern[] {
    const patterns: Pattern[] = [];

    // Anomaly detection: Sudden spike in incidents
    const recentIncidents = incidents.filter(i => {
      const date = new Date(i.detectedAt || i.createdAt);
      const daysSince = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7;
    });

    const previousIncidents = incidents.filter(i => {
      const date = new Date(i.detectedAt || i.createdAt);
      const daysSince = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7 && daysSince <= 14;
    });

    const recentCount = recentIncidents.length;
    const previousCount = previousIncidents.length;

    if (previousCount > 0 && recentCount > previousCount * 1.5) {
      patterns.push({
        id: 'anomaly-spike-1',
        type: 'anomaly',
        description: `زيادة غير عادية في حالات الرصد: ${recentCount} حالة رصد هذا الأسبوع مقارنة بـ ${previousCount} الأسبوع الماضي (زيادة ${Math.round((recentCount / previousCount - 1) * 100)}%)`,
        confidence: 0.85,
        affectedEntities: recentIncidents.map(i => i.id),
        detectedAt: new Date(),
        severity: 'high',
      });
    }

    // Trend detection: Growing sector
    const sectorCounts = new Map<string, number>();
    recentIncidents.forEach(i => {
      const sector = i.sector || i.sectorAr || 'غير محدد';
      sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1);
    });

    const topSector = Array.from(sectorCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (topSector && topSector[1] >= 5) {
      patterns.push({
        id: 'trend-sector-1',
        type: 'trend',
        description: `القطاع ${topSector[0]} يشهد نشاطاً متزايداً مع ${topSector[1]} حالات رصد خلال الأسبوع الماضي`,
        confidence: 0.8,
        affectedEntities: [topSector[0]],
        detectedAt: new Date(),
        severity: 'medium',
      });
    }

    this.detectedPatterns = patterns;
    return patterns;
  }

  /**
   * Get proactive alerts based on patterns
   */
  getProactiveAlerts(patterns?: Pattern[]): Recommendation[] {
    const patternsToUse = patterns || this.detectedPatterns;
    return patternsToUse.map(pattern => ({
      id: `alert-${pattern.id}`,
      type: 'alert' as const,
      title: pattern.type === 'anomaly' ? '⚠️ شذوذ مكتشف' : '📊 نمط مكتشف',
      description: pattern.description,
      confidence: pattern.confidence,
      priority: pattern.severity || 'medium',
      relatedEntities: pattern.affectedEntities,
      createdAt: pattern.detectedAt,
    }));
  }

  /**
   * Sort recommendations by priority and confidence
   */
  private sortAndLimit(recommendations: Recommendation[], limit: number): Recommendation[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return recommendations
      .sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, limit);
  }

  /**
   * Get all recommendations (for display)
   */
  getAllRecommendations(): Recommendation[] {
    return this.recommendations;
  }

  /**
   * Clear old recommendations
   */
  clearOldRecommendations(olderThan: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - olderThan;
    this.recommendations = this.recommendations.filter(
      r => r.createdAt.getTime() > cutoff
    );
  }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine();
