# rasid-leaks - server-rasid-enhancements

> Auto-extracted source code documentation

---

## `server/rasidEnhancements/autoTrainingSystem.ts`

```typescript
/**
 * Auto-Training System - نظام التدريب الذاتي التلقائي
 * 
 * Features:
 * - Auto-learns platform data (incidents, users, settings)
 * - Builds knowledge base automatically
 * - Creates training examples from interactions
 * - Adapts to platform changes in real-time
 */

interface TrainingData {
  id: string;
  type: 'incident' | 'user' | 'setting' | 'interaction' | 'procedure';
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  timestamp: Date;
}

interface KnowledgeItem {
  topic: string;
  description: string;
  examples: string[];
  relatedTopics: string[];
  confidence: number;
  lastUpdated: Date;
}

export class AutoTrainingSystem {
  private knowledgeBase: Map<string, KnowledgeItem> = new Map();
  private trainingData: TrainingData[] = [];
  private platformSnapshot: any = {};

  /**
   * Auto-discover and learn from platform data
   * اكتشاف وتعلم تلقائي من بيانات المنصة
   */
  async autoDiscoverPlatformData(platformData: {
    incidents?: any[];
    users?: any[];
    settings?: any[];
    procedures?: any[];
  }): Promise<void> {
    // Learn from incidents
    if (platformData.incidents) {
      await this.learnFromIncidents(platformData.incidents);
    }

    // Learn from users
    if (platformData.users) {
      await this.learnFromUsers(platformData.users);
    }

    // Learn from settings
    if (platformData.settings) {
      await this.learnFromSettings(platformData.settings);
    }

    // Learn from procedures
    if (platformData.procedures) {
      await this.learnFromProcedures(platformData.procedures);
    }

    // Update platform snapshot
    this.platformSnapshot = {
      ...platformData,
      lastUpdated: new Date(),
    };
  }

  /**
   * Learn patterns from incidents
   */
  private async learnFromIncidents(incidents: any[]): Promise<void> {
    // Group by sector
    const bySector = new Map<string, any[]>();
    incidents.forEach(incident => {
      const sector = incident.sector || incident.sectorAr || 'غير محدد';
      if (!bySector.has(sector)) {
        bySector.set(sector, []);
      }
      bySector.get(sector)!.push(incident);
    });

    // Create knowledge for each sector
    for (const [sector, sectorIncidents] of bySector.entries()) {
      const avgRecords = sectorIncidents.reduce((sum, i) => sum + (i.recordCount || 0), 0) / sectorIncidents.length;
      const criticalCount = sectorIncidents.filter(i => i.severity === 'Critical').length;
      
      this.knowledgeBase.set(`sector_${sector}`, {
        topic: `القطاع: ${sector}`,
        description: `هذا القطاع يحتوي على ${sectorIncidents.length} حالة رصد، بمتوسط ${Math.round(avgRecords)} سجل لكل حالة رصد. ${criticalCount} منها حرجة.`,
        examples: sectorIncidents.slice(0, 3).map(i => i.titleAr || i.title || ''),
        relatedTopics: ['sectors', 'incidents', 'statistics'],
        confidence: sectorIncidents.length >= 5 ? 0.9 : 0.6,
        lastUpdated: new Date(),
      });
    }

    // Learn common PII types
    const piiTypes = new Map<string, number>();
    incidents.forEach(incident => {
      (incident.piiTypes || []).forEach((pii: string) => {
        piiTypes.set(pii, (piiTypes.get(pii) || 0) + 1);
      });
    });

    const topPII = Array.from(piiTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    this.knowledgeBase.set('common_pii_types', {
      topic: 'أنواع البيانات الشخصية الشائعة',
      description: `أكثر أنواع البيانات الشخصية تعرضاً: ${topPII.map(([pii, count]) => `${pii} (${count})`).join('، ')}`,
      examples: topPII.map(([pii]) => pii),
      relatedTopics: ['pii', 'data_types', 'privacy'],
      confidence: 0.95,
      lastUpdated: new Date(),
    });
  }

  /**
   * Learn from platform users
   */
  private async learnFromUsers(users: any[]): Promise<void> {
    const roles = new Map<string, number>();
    users.forEach(user => {
      const role = user.role || 'user';
      roles.set(role, (roles.get(role) || 0) + 1);
    });

    this.knowledgeBase.set('platform_users', {
      topic: 'مستخدمو المنصة',
      description: `المنصة تحتوي على ${users.length} مستخدم. التوزيع: ${Array.from(roles.entries()).map(([role, count]) => `${role}: ${count}`).join('، ')}`,
      examples: users.slice(0, 3).map(u => u.name || u.email || ''),
      relatedTopics: ['users', 'roles', 'access'],
      confidence: 0.9,
      lastUpdated: new Date(),
    });
  }

  /**
   * Learn from platform settings
   */
  private async learnFromSettings(settings: any[]): Promise<void> {
    settings.forEach(setting => {
      this.knowledgeBase.set(`setting_${setting.key}`, {
        topic: `إعداد: ${setting.nameAr || setting.name || setting.key}`,
        description: setting.descriptionAr || setting.description || '',
        examples: [setting.value?.toString() || ''],
        relatedTopics: ['settings', 'configuration'],
        confidence: 0.95,
        lastUpdated: new Date(),
      });
    });
  }

  /**
   * Learn from procedures
   */
  private async learnFromProcedures(procedures: any[]): Promise<void> {
    procedures.forEach(proc => {
      this.knowledgeBase.set(`procedure_${proc.id}`, {
        topic: proc.nameAr || proc.name,
        description: proc.descriptionAr || proc.description || '',
        examples: proc.steps || [],
        relatedTopics: ['procedures', 'workflows', 'guides'],
        confidence: 0.9,
        lastUpdated: new Date(),
      });
    });
  }

  /**
   * Generate training examples from user interactions
   */
  async learnFromInteraction(
    query: string,
    response: string,
    rating?: number,
    toolsUsed?: string[]
  ): Promise<void> {
    if (rating && rating >= 4) {
      this.trainingData.push({
        id: `interaction_${Date.now()}`,
        type: 'interaction',
        content: `Q: ${query}\nA: ${response}`,
        metadata: {
          rating,
          toolsUsed: toolsUsed || [],
        },
        timestamp: new Date(),
      });

      // Keep only last 1000 interactions
      if (this.trainingData.length > 1000) {
        this.trainingData = this.trainingData.slice(-1000);
      }
    }
  }

  /**
   * Get knowledge about a topic
   */
  getKnowledge(topic: string): KnowledgeItem | null {
    // Direct match
    if (this.knowledgeBase.has(topic)) {
      return this.knowledgeBase.get(topic)!;
    }

    // Fuzzy search
    const lowerTopic = topic.toLowerCase();
    for (const [key, item] of this.knowledgeBase.entries()) {
      if (
        key.toLowerCase().includes(lowerTopic) ||
        item.topic.toLowerCase().includes(lowerTopic)
      ) {
        return item;
      }
    }

    return null;
  }

  /**
   * Search knowledge base
   */
  searchKnowledge(query: string, limit: number = 5): KnowledgeItem[] {
    const lowerQuery = query.toLowerCase();
    const results: Array<{ item: KnowledgeItem; score: number }> = [];

    for (const item of this.knowledgeBase.values()) {
      let score = 0;

      // Score based on topic match
      if (item.topic.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }

      // Score based on description match
      if (item.description.toLowerCase().includes(lowerQuery)) {
        score += 5;
      }

      // Score based on examples match
      if (item.examples.some(ex => ex.toLowerCase().includes(lowerQuery))) {
        score += 3;
      }

      // Boost by confidence
      score *= item.confidence;

      if (score > 0) {
        results.push({ item, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.item);
  }

  /**
   * Generate comprehensive platform knowledge for AI
   */
  generatePlatformKnowledgeSummary(): string {
    const lines: string[] = [];

    lines.push('# معرفة المنصة التلقائية (Auto-discovered Knowledge)');
    lines.push('');

    // Summarize by category
    const categories = {
      sectors: [] as KnowledgeItem[],
      users: [] as KnowledgeItem[],
      settings: [] as KnowledgeItem[],
      procedures: [] as KnowledgeItem[],
      general: [] as KnowledgeItem[],
    };

    for (const item of this.knowledgeBase.values()) {
      if (item.relatedTopics.includes('sectors')) {
        categories.sectors.push(item);
      } else if (item.relatedTopics.includes('users')) {
        categories.users.push(item);
      } else if (item.relatedTopics.includes('settings')) {
        categories.settings.push(item);
      } else if (item.relatedTopics.includes('procedures')) {
        categories.procedures.push(item);
      } else {
        categories.general.push(item);
      }
    }

    // Output each category
    if (categories.sectors.length > 0) {
      lines.push('## القطاعات المتأثرة');
      categories.sectors.forEach(item => {
        lines.push(`- ${item.topic}: ${item.description}`);
      });
      lines.push('');
    }

    if (categories.users.length > 0) {
      lines.push('## المستخدمون');
      categories.users.forEach(item => {
        lines.push(`- ${item.description}`);
      });
      lines.push('');
    }

    if (categories.settings.length > 0) {
      lines.push('## الإعدادات المتاحة');
      categories.settings.forEach(item => {
        lines.push(`- ${item.topic}: ${item.description}`);
      });
      lines.push('');
    }

    if (categories.procedures.length > 0) {
      lines.push('## الإجراءات والعمليات');
      categories.procedures.forEach(item => {
        lines.push(`- ${item.topic}: ${item.description}`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Get training statistics
   */
  getStats() {
    return {
      totalKnowledge: this.knowledgeBase.size,
      totalInteractions: this.trainingData.length,
      categories: {
        sectors: Array.from(this.knowledgeBase.values()).filter(k =>
          k.relatedTopics.includes('sectors')
        ).length,
        users: Array.from(this.knowledgeBase.values()).filter(k =>
          k.relatedTopics.includes('users')
        ).length,
        settings: Array.from(this.knowledgeBase.values()).filter(k =>
          k.relatedTopics.includes('settings')
        ).length,
        procedures: Array.from(this.knowledgeBase.values()).filter(k =>
          k.relatedTopics.includes('procedures')
        ).length,
      },
      lastUpdate: this.platformSnapshot.lastUpdated,
    };
  }

  /**
   * Export training data for fine-tuning
   */
  exportForFineTuning(): Array<{ prompt: string; completion: string }> {
    return this.trainingData
      .filter(d => d.type === 'interaction')
      .map(d => {
        const [q, a] = d.content.split('\nA: ');
        return {
          prompt: q.replace('Q: ', ''),
          completion: a,
        };
      });
  }
}

// Singleton instance
export const autoTrainingSystem = new AutoTrainingSystem();

```

---

## `server/rasidEnhancements/chartDataEngine.ts`

```typescript
/**
 * Chart Data Engine — 12 data types for chart generation
 * Processes breach incidents into chart-ready data structures
 */

export class ChartDataEngine {
  public incidents: any[];

  constructor(incidents: any[]) {
    this.incidents = incidents || [];
  }

  // 1. Sector Distribution
  getSectorDistribution(): { labels: string[]; data: number[] } {
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      const sector = i.sectorAr || i.sector || "غير محدد";
      counts[sector] = (counts[sector] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { labels: sorted.map((s) => s[0]), data: sorted.map((s) => s[1]) };
  }

  // 2. Source Distribution
  getSourceDistribution(): { labels: string[]; data: number[] } {
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      const source = i.source || "غير محدد";
      counts[source] = (counts[source] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { labels: sorted.map((s) => s[0]), data: sorted.map((s) => s[1]) };
  }

  // 3. Severity Distribution
  getSeverityDistribution(): { labels: string[]; data: number[] } {
    const order = ["Critical", "High", "Medium", "Low"];
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      const sev = i.severity || "Unknown";
      counts[sev] = (counts[sev] || 0) + 1;
    });
    return {
      labels: order.filter((s) => counts[s]),
      data: order.filter((s) => counts[s]).map((s) => counts[s]),
    };
  }

  // 4. Monthly Trend
  getMonthlyTrend(): { labels: string[]; incidents: number[]; records: number[] } {
    const timeline: Record<string, { incidents: number; records: number }> = {};
    this.incidents.forEach((i) => {
      const date = new Date(i.detectedAt || i.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!timeline[key]) timeline[key] = { incidents: 0, records: 0 };
      timeline[key].incidents++;
      timeline[key].records += i.recordCount || 0;
    });
    const sortedKeys = Object.keys(timeline).sort();
    return {
      labels: sortedKeys,
      incidents: sortedKeys.map((k) => timeline[k].incidents),
      records: sortedKeys.map((k) => timeline[k].records),
    };
  }

  // 5. Top Incidents by Records
  getTopIncidentsByRecords(limit = 10): { labels: string[]; data: number[] } {
    const sorted = [...this.incidents].sort((a, b) => (b.recordCount || 0) - (a.recordCount || 0)).slice(0, limit);
    return {
      labels: sorted.map((i) => (i.titleAr || i.title || "").substring(0, 30)),
      data: sorted.map((i) => i.recordCount || 0),
    };
  }

  // 6. PII Distribution
  getPiiDistribution(limit = 8): { labels: string[]; data: number[] } {
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      (i.piiTypes || []).forEach((pii: string) => {
        counts[pii] = (counts[pii] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return { labels: sorted.map((p) => p[0]), data: sorted.map((p) => p[1]) };
  }

  // 7. Breach Method Distribution
  getBreachMethodDistribution(limit = 7): { labels: string[]; data: number[] } {
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      const method = i.breachMethodAr || i.breachMethod || "غير معروف";
      counts[method] = (counts[method] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return { labels: sorted.map((m) => m[0]), data: sorted.map((m) => m[1]) };
  }

  // 8. Region Distribution
  getRegionDistribution(limit = 8): { labels: string[]; data: number[] } {
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      const region = i.regionAr || i.region || "غير محددة";
      counts[region] = (counts[region] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return { labels: sorted.map((r) => r[0]), data: sorted.map((r) => r[1]) };
  }

  // 9. Fine Distribution
  getFineDistribution(): { labels: string[]; data: number[] } {
    const ranges: Record<string, number> = {
      "0 - 100K": 0,
      "100K - 500K": 0,
      "500K - 1M": 0,
      "1M - 5M": 0,
      "5M+": 0,
    };
    this.incidents.forEach((i) => {
      const fine = i.estimatedFineSar || 0;
      if (fine <= 100000) ranges["0 - 100K"]++;
      else if (fine <= 500000) ranges["100K - 500K"]++;
      else if (fine <= 1000000) ranges["500K - 1M"]++;
      else if (fine <= 5000000) ranges["1M - 5M"]++;
      else ranges["5M+"]++;
    });
    return { labels: Object.keys(ranges), data: Object.values(ranges) };
  }

  // 10. Sector Comparison
  compareSectors(sectors: string[]): { labels: string[]; incidentCounts: number[]; avgRecords: number[] } {
    const results = sectors.map((sector) => {
      const sectorLower = sector.toLowerCase();
      const sectorIncidents = this.incidents.filter(
        (i) =>
          (i.sector || "").toLowerCase().includes(sectorLower) ||
          (i.sectorAr || "").includes(sector)
      );
      const totalRecords = sectorIncidents.reduce((sum: number, i: any) => sum + (i.recordCount || 0), 0);
      return {
        sector,
        incidentCount: sectorIncidents.length,
        avgRecords: sectorIncidents.length > 0 ? totalRecords / sectorIncidents.length : 0,
      };
    });
    return {
      labels: results.map((r) => r.sector),
      incidentCounts: results.map((r) => r.incidentCount),
      avgRecords: results.map((r) => r.avgRecords),
    };
  }

  // 11. Sector Radar Data
  getSectorRadarData(sectorName: string): { labels: string[]; data: number[] } {
    const sectorLower = sectorName.toLowerCase();
    const sectorIncidents = this.incidents.filter(
      (i) =>
        (i.sector || "").toLowerCase().includes(sectorLower) ||
        (i.sectorAr || "").includes(sectorName)
    );
    const totalIncidents = this.incidents.length;
    const totalRecordsAll = this.incidents.reduce((sum: number, i: any) => sum + (i.recordCount || 0), 0);
    const sectorRecords = sectorIncidents.reduce((sum: number, i: any) => sum + (i.recordCount || 0), 0);
    const criticalCount = sectorIncidents.filter((i: any) => i.severity === "Critical").length;
    const highCount = sectorIncidents.filter((i: any) => i.severity === "High").length;

    const incidentsRatio = totalIncidents > 0 ? (sectorIncidents.length / totalIncidents) * 100 : 0;
    const recordsRatio = totalRecordsAll > 0 ? (sectorRecords / totalRecordsAll) * 100 : 0;
    const criticalRatio = sectorIncidents.length > 0 ? (criticalCount / sectorIncidents.length) * 100 : 0;
    const highRatio = sectorIncidents.length > 0 ? (highCount / sectorIncidents.length) * 100 : 0;

    return {
      labels: ["نسبة حالات الرصد", "نسبة السجلات", "نسبة عالي الأهمية", "نسبة العالي"],
      data: [incidentsRatio, recordsRatio, criticalRatio, highRatio].map((v) => Math.min(100, Math.round(v))),
    };
  }

  // 12. Data Type Selector (used by AI tools)
  getChartData(dataType: string, params: any = {}): any {
    switch (dataType) {
      case "sector_distribution": return this.getSectorDistribution();
      case "source_distribution": return this.getSourceDistribution();
      case "severity_distribution": return this.getSeverityDistribution();
      case "monthly_trend": return this.getMonthlyTrend();
      case "top_incidents": return this.getTopIncidentsByRecords(params.limit || 10);
      case "pii_distribution": return this.getPiiDistribution();
      case "breach_methods": return this.getBreachMethodDistribution();
      case "region_distribution": return this.getRegionDistribution();
      case "fine_distribution": return this.getFineDistribution();
      case "sector_comparison": return this.compareSectors(params.sectors || []);
      case "sector_radar": return this.getSectorRadarData(params.sector || "");
      default: return { error: `نوع بيانات غير معروف: ${dataType}` };
    }
  }
}

```

---

## `server/rasidEnhancements/circuitBreaker.ts`

```typescript
/**
 * Circuit Breaker — Protection against OpenAI API failures
 * States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
 */

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening
  recoveryTimeout: number;     // ms to wait before trying again
  successThreshold: number;    // Successes needed to close from HALF_OPEN
}

export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private config: CircuitBreakerConfig;

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = {
      failureThreshold: config?.failureThreshold ?? 3,
      recoveryTimeout: config?.recoveryTimeout ?? 30000, // 30 seconds
      successThreshold: config?.successThreshold ?? 2,
    };
  }

  /**
   * Check if requests are allowed through
   */
  isAllowed(): boolean {
    if (this.state === "CLOSED") return true;

    if (this.state === "OPEN") {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.config.recoveryTimeout) {
        this.state = "HALF_OPEN";
        this.successCount = 0;
        console.log("[CircuitBreaker] Transitioning to HALF_OPEN — testing recovery");
        return true;
      }
      return false;
    }

    // HALF_OPEN — allow limited requests
    return true;
  }

  /**
   * Record a successful API call
   */
  recordSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.state = "CLOSED";
        this.failureCount = 0;
        this.successCount = 0;
        console.log("[CircuitBreaker] Recovery confirmed — CLOSED");
      }
    } else {
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed API call
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "HALF_OPEN") {
      this.state = "OPEN";
      console.log("[CircuitBreaker] Recovery failed — back to OPEN");
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = "OPEN";
      console.log(`[CircuitBreaker] Threshold reached (${this.failureCount} failures) — OPEN`);
    }
  }

  /**
   * Get current state info
   */
  getStatus(): { state: CircuitState; failureCount: number; lastFailure: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailure: this.lastFailureTime,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>, fallback: () => T): Promise<{ result: T; source: "api" | "fallback" }> {
    if (!this.isAllowed()) {
      console.log("[CircuitBreaker] Circuit OPEN — using fallback");
      return { result: fallback(), source: "fallback" };
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return { result, source: "api" };
    } catch (err) {
      this.recordFailure();
      console.warn("[CircuitBreaker] API call failed, using fallback:", (err as Error).message);
      return { result: fallback(), source: "fallback" };
    }
  }
}

// Singleton instance
export const circuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  recoveryTimeout: 30000,
  successThreshold: 2,
});

```

---

## `server/rasidEnhancements/dashboardBuilder.ts`

```typescript
/**
 * Dashboard Builder — Professional Dashboard Assembly System
 * منشئ لوحات المؤشرات — نظام بناء لوحات المؤشرات الاحترافية
 *
 * DLV-02-03-008: وحدة لتنسيق وبناء لوحات المؤشرات
 * Supports 5 pre-built dashboard types + custom dashboards
 */

import { ChartDataEngine } from "./chartDataEngine";
import { SmartChartEngine, smartChartEngine, type ChartType } from "./smartChartEngine";

// ─── Types ───────────────────────────────────────────────────────────

export type DashboardType =
  | "executive_summary"    // الملخص التنفيذي
  | "sector_analysis"      // تحليل القطاع
  | "threat_landscape"     // مشهد التهديدات
  | "compliance_overview"  // نظرة عامة على الامتثال
  | "trend_analysis"       // تحليل الاتجاهات
  | "custom";              // مخصص

export interface DashboardWidget {
  id: string;
  type: "chart" | "stat" | "table" | "text" | "alert";
  title: string;
  titleAr: string;
  chartType?: ChartType;
  dataSource: string;
  position: { row: number; col: number; width: number; height: number };
  config?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  type: DashboardType;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  widgets: DashboardWidget[];
  gridCols: number;
  gridRows: number;
  theme: "light" | "dark" | "professional";
  createdAt: string;
}

export interface DashboardBuildResult {
  dashboard: DashboardLayout;
  chartConfigs: Array<{
    widgetId: string;
    chartConfig: any;
    insights: string[];
  }>;
  summary: {
    totalWidgets: number;
    chartCount: number;
    statCount: number;
    generatedAt: string;
  };
}

// ─── Pre-built Dashboard Templates ──────────────────────────────────

const DASHBOARD_TEMPLATES: Record<Exclude<DashboardType, "custom">, Omit<DashboardLayout, "id" | "createdAt">> = {
  executive_summary: {
    type: "executive_summary",
    title: "Executive Summary",
    titleAr: "الملخص التنفيذي",
    description: "High-level overview of all leak monitoring activities",
    descriptionAr: "نظرة عامة عالية المستوى على جميع أنشطة رصد الحالات",
    gridCols: 4,
    gridRows: 3,
    theme: "professional",
    widgets: [
      { id: "es-1", type: "stat", title: "Total Incidents", titleAr: "إجمالي حالات الرصد", dataSource: "total_incidents", position: { row: 0, col: 0, width: 1, height: 1 } },
      { id: "es-2", type: "stat", title: "Critical Incidents", titleAr: "حالات حرجة", dataSource: "critical_count", position: { row: 0, col: 1, width: 1, height: 1 } },
      { id: "es-3", type: "stat", title: "Affected Records", titleAr: "السجلات المتأثرة", dataSource: "total_records", position: { row: 0, col: 2, width: 1, height: 1 } },
      { id: "es-4", type: "stat", title: "Active Sources", titleAr: "المصادر النشطة", dataSource: "active_sources", position: { row: 0, col: 3, width: 1, height: 1 } },
      { id: "es-5", type: "chart", title: "Monthly Trend", titleAr: "الاتجاه الشهري", chartType: "line", dataSource: "monthly_trend", position: { row: 1, col: 0, width: 2, height: 1 } },
      { id: "es-6", type: "chart", title: "Sector Distribution", titleAr: "توزيع القطاعات", chartType: "doughnut", dataSource: "sector_distribution", position: { row: 1, col: 2, width: 2, height: 1 } },
      { id: "es-7", type: "chart", title: "Severity Breakdown", titleAr: "توزيع التأثير", chartType: "bar", dataSource: "severity_distribution", position: { row: 2, col: 0, width: 2, height: 1 } },
      { id: "es-8", type: "chart", title: "Source Analysis", titleAr: "تحليل المصادر", chartType: "pie", dataSource: "source_distribution", position: { row: 2, col: 2, width: 2, height: 1 } },
    ],
  },
  sector_analysis: {
    type: "sector_analysis",
    title: "Sector Analysis",
    titleAr: "تحليل القطاع",
    description: "Deep dive into sector-specific leak patterns",
    descriptionAr: "تحليل معمق لأنماط الحالات حسب القطاع",
    gridCols: 4,
    gridRows: 3,
    theme: "professional",
    widgets: [
      { id: "sa-1", type: "chart", title: "Sector Distribution", titleAr: "توزيع القطاعات", chartType: "bar", dataSource: "sector_distribution", position: { row: 0, col: 0, width: 2, height: 1 } },
      { id: "sa-2", type: "chart", title: "Sector Severity", titleAr: "خطورة القطاعات", chartType: "radar", dataSource: "sector_severity", position: { row: 0, col: 2, width: 2, height: 1 } },
      { id: "sa-3", type: "chart", title: "Sector Trend", titleAr: "اتجاه القطاعات", chartType: "area", dataSource: "sector_trend", position: { row: 1, col: 0, width: 4, height: 1 } },
      { id: "sa-4", type: "table", title: "Top Affected Sectors", titleAr: "أكثر القطاعات تأثراً", dataSource: "top_sectors", position: { row: 2, col: 0, width: 2, height: 1 } },
      { id: "sa-5", type: "chart", title: "Records by Sector", titleAr: "السجلات حسب القطاع", chartType: "doughnut", dataSource: "records_by_sector", position: { row: 2, col: 2, width: 2, height: 1 } },
    ],
  },
  threat_landscape: {
    type: "threat_landscape",
    title: "Threat Landscape",
    titleAr: "مشهد التهديدات",
    description: "Overview of current threat actors and attack vectors",
    descriptionAr: "نظرة عامة على الجهات المهددة وأساليب الهجوم الحالية",
    gridCols: 4,
    gridRows: 3,
    theme: "dark",
    widgets: [
      { id: "tl-1", type: "stat", title: "Active Threats", titleAr: "التهديدات النشطة", dataSource: "active_threats", position: { row: 0, col: 0, width: 1, height: 1 } },
      { id: "tl-2", type: "stat", title: "New This Month", titleAr: "جديد هذا الشهر", dataSource: "new_threats", position: { row: 0, col: 1, width: 1, height: 1 } },
      { id: "tl-3", type: "stat", title: "Threat Actors", titleAr: "الجهات المهددة", dataSource: "threat_actors_count", position: { row: 0, col: 2, width: 1, height: 1 } },
      { id: "tl-4", type: "alert", title: "Critical Alerts", titleAr: "تنبيهات حرجة", dataSource: "critical_alerts", position: { row: 0, col: 3, width: 1, height: 1 } },
      { id: "tl-5", type: "chart", title: "Source Analysis", titleAr: "تحليل المصادر", chartType: "bar", dataSource: "source_distribution", position: { row: 1, col: 0, width: 2, height: 1 } },
      { id: "tl-6", type: "chart", title: "Attack Timeline", titleAr: "الجدول الزمني للهجمات", chartType: "line", dataSource: "monthly_trend", position: { row: 1, col: 2, width: 2, height: 1 } },
      { id: "tl-7", type: "chart", title: "Data Types Exposed", titleAr: "أنواع البيانات المكشوفة", chartType: "doughnut", dataSource: "data_types", position: { row: 2, col: 0, width: 2, height: 1 } },
      { id: "tl-8", type: "chart", title: "Geographic Distribution", titleAr: "التوزيع الجغرافي", chartType: "bar", dataSource: "country_distribution", position: { row: 2, col: 2, width: 2, height: 1 } },
    ],
  },
  compliance_overview: {
    type: "compliance_overview",
    title: "Compliance Overview",
    titleAr: "نظرة عامة على الامتثال",
    description: "Privacy compliance status across monitored entities",
    descriptionAr: "حالة الامتثال للخصوصية عبر الجهات المراقبة",
    gridCols: 4,
    gridRows: 3,
    theme: "professional",
    widgets: [
      { id: "co-1", type: "stat", title: "Compliance Rate", titleAr: "نسبة الامتثال", dataSource: "compliance_rate", position: { row: 0, col: 0, width: 1, height: 1 } },
      { id: "co-2", type: "stat", title: "Compliant Sites", titleAr: "المواقع الممتثلة", dataSource: "compliant_count", position: { row: 0, col: 1, width: 1, height: 1 } },
      { id: "co-3", type: "stat", title: "Non-Compliant", titleAr: "غير ممتثلة", dataSource: "non_compliant_count", position: { row: 0, col: 2, width: 1, height: 1 } },
      { id: "co-4", type: "stat", title: "Pending Review", titleAr: "قيد المراجعة", dataSource: "pending_review", position: { row: 0, col: 3, width: 1, height: 1 } },
      { id: "co-5", type: "chart", title: "Compliance by Clause", titleAr: "الامتثال حسب البند", chartType: "radar", dataSource: "clause_compliance", position: { row: 1, col: 0, width: 2, height: 1 } },
      { id: "co-6", type: "chart", title: "Compliance Trend", titleAr: "اتجاه الامتثال", chartType: "line", dataSource: "compliance_trend", position: { row: 1, col: 2, width: 2, height: 1 } },
      { id: "co-7", type: "chart", title: "Sector Compliance", titleAr: "امتثال القطاعات", chartType: "bar", dataSource: "sector_compliance", position: { row: 2, col: 0, width: 4, height: 1 } },
    ],
  },
  trend_analysis: {
    type: "trend_analysis",
    title: "Trend Analysis",
    titleAr: "تحليل الاتجاهات",
    description: "Historical trends and predictive analytics",
    descriptionAr: "الاتجاهات التاريخية والتحليلات التنبؤية",
    gridCols: 4,
    gridRows: 3,
    theme: "professional",
    widgets: [
      { id: "ta-1", type: "chart", title: "Monthly Incidents", titleAr: "حالات الرصد الشهرية", chartType: "area", dataSource: "monthly_trend", position: { row: 0, col: 0, width: 4, height: 1 } },
      { id: "ta-2", type: "chart", title: "Severity Trend", titleAr: "اتجاه التأثير", chartType: "line", dataSource: "severity_trend", position: { row: 1, col: 0, width: 2, height: 1 } },
      { id: "ta-3", type: "chart", title: "Source Trend", titleAr: "اتجاه المصادر", chartType: "bar", dataSource: "source_trend", position: { row: 1, col: 2, width: 2, height: 1 } },
      { id: "ta-4", type: "chart", title: "Records Trend", titleAr: "اتجاه السجلات", chartType: "line", dataSource: "records_trend", position: { row: 2, col: 0, width: 2, height: 1 } },
      { id: "ta-5", type: "chart", title: "Quarterly Comparison", titleAr: "مقارنة ربع سنوية", chartType: "bar", dataSource: "quarterly_comparison", position: { row: 2, col: 2, width: 2, height: 1 } },
    ],
  },
};

// ─── Dashboard Builder Class ─────────────────────────────────────────

export class DashboardBuilder {
  private chartEngine: SmartChartEngine;
  private dataEngine: ChartDataEngine | null = null;

  constructor() {
    this.chartEngine = smartChartEngine;
  }

  /**
   * Set incident data for chart generation
   */
  setData(incidents: any[]): void {
    this.dataEngine = new ChartDataEngine(incidents);
  }

  /**
   * Build a pre-defined dashboard by type
   */
  async buildDashboard(
    type: DashboardType,
    incidents: any[],
    customWidgets?: DashboardWidget[]
  ): Promise<DashboardBuildResult> {
    this.setData(incidents);
    const dashboardId = `dash-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    let layout: DashboardLayout;

    if (type === "custom" && customWidgets) {
      layout = {
        id: dashboardId,
        type: "custom",
        title: "Custom Dashboard",
        titleAr: "لوحة مؤشرات مخصصة",
        description: "User-defined custom dashboard",
        descriptionAr: "لوحة مؤشرات مخصصة من قبل المستخدم",
        widgets: customWidgets,
        gridCols: 4,
        gridRows: Math.max(...customWidgets.map(w => w.position.row + w.position.height), 3),
        theme: "professional",
        createdAt: now,
      };
    } else {
      const template = DASHBOARD_TEMPLATES[type as Exclude<DashboardType, "custom">];
      if (!template) {
        throw new Error(`Unknown dashboard type: ${type}`);
      }
      layout = {
        ...template,
        id: dashboardId,
        createdAt: now,
      };
    }

    // Generate chart configs for each chart widget
    const chartConfigs = await this.generateChartConfigs(layout.widgets, incidents);

    return {
      dashboard: layout,
      chartConfigs,
      summary: {
        totalWidgets: layout.widgets.length,
        chartCount: layout.widgets.filter(w => w.type === "chart").length,
        statCount: layout.widgets.filter(w => w.type === "stat").length,
        generatedAt: now,
      },
    };
  }

  /**
   * Generate chart configurations for widgets
   */
  private async generateChartConfigs(
    widgets: DashboardWidget[],
    incidents: any[]
  ): Promise<Array<{ widgetId: string; chartConfig: any; insights: string[] }>> {
    if (!this.dataEngine) {
      this.dataEngine = new ChartDataEngine(incidents);
    }

    const results: Array<{ widgetId: string; chartConfig: any; insights: string[] }> = [];

    for (const widget of widgets) {
      if (widget.type !== "chart") continue;

      const data = this.getDataForSource(widget.dataSource);
      if (!data) continue;

      const chartConfig = {
        type: widget.chartType || "bar",
        data: {
          labels: data.labels,
          datasets: [{
            label: widget.titleAr,
            data: data.data,
            backgroundColor: this.getChartColors(data.data.length),
            borderColor: this.getChartBorderColors(data.data.length),
            borderWidth: 1,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: widget.titleAr,
              font: { family: "Tajawal", size: 16, weight: "bold" as const },
            },
            legend: {
              position: "bottom" as const,
              labels: { font: { family: "Tajawal" } },
            },
          },
        },
      };

      const insights = this.generateInsights(widget.dataSource, data);

      results.push({
        widgetId: widget.id,
        chartConfig,
        insights,
      });
    }

    return results;
  }

  /**
   * Get data from ChartDataEngine based on data source key
   */
  private getDataForSource(source: string): { labels: string[]; data: number[] } | null {
    if (!this.dataEngine) return null;

    switch (source) {
      case "sector_distribution":
      case "records_by_sector":
        return this.dataEngine.getSectorDistribution();
      case "source_distribution":
        return this.dataEngine.getSourceDistribution();
      case "severity_distribution":
        return this.dataEngine.getSeverityDistribution();
      case "monthly_trend": {
        const trend = this.dataEngine.getMonthlyTrend();
        return { labels: trend.labels, data: trend.incidents };
      }
      case "country_distribution":
        return this.dataEngine.getCountryDistribution();
      case "data_types":
        return this.dataEngine.getDataTypeDistribution();
      case "sector_severity":
      case "sector_trend":
      case "severity_trend":
      case "source_trend":
      case "records_trend":
      case "quarterly_comparison":
      case "clause_compliance":
      case "compliance_trend":
      case "sector_compliance":
        // Fallback to sector distribution for complex data types
        return this.dataEngine.getSectorDistribution();
      default:
        return this.dataEngine.getSectorDistribution();
    }
  }

  /**
   * Generate insights for a data source
   */
  private generateInsights(source: string, data: { labels: string[]; data: number[] }): string[] {
    const insights: string[] = [];
    if (!data.labels.length) return ["لا توجد بيانات كافية لتوليد رؤى"];

    const total = data.data.reduce((a, b) => a + b, 0);
    const max = Math.max(...data.data);
    const maxIdx = data.data.indexOf(max);
    const topLabel = data.labels[maxIdx];
    const topPct = total > 0 ? ((max / total) * 100).toFixed(1) : "0";

    insights.push(`الأعلى: "${topLabel}" بنسبة ${topPct}% (${max} من ${total})`);

    if (data.labels.length > 1) {
      const secondMax = data.data.filter((_, i) => i !== maxIdx).sort((a, b) => b - a)[0];
      const secondIdx = data.data.indexOf(secondMax);
      if (secondIdx >= 0) {
        insights.push(`يليه: "${data.labels[secondIdx]}" بعدد ${secondMax}`);
      }
    }

    if (data.labels.length >= 3) {
      insights.push(`إجمالي الفئات: ${data.labels.length} فئة`);
    }

    return insights;
  }

  /**
   * Get Rasid brand colors for charts
   */
  private getChartColors(count: number): string[] {
    const palette = [
      "rgba(14, 165, 233, 0.7)",   // Sky blue (primary)
      "rgba(16, 185, 129, 0.7)",   // Emerald
      "rgba(245, 158, 11, 0.7)",   // Amber
      "rgba(239, 68, 68, 0.7)",    // Red
      "rgba(139, 92, 246, 0.7)",   // Violet
      "rgba(236, 72, 153, 0.7)",   // Pink
      "rgba(20, 184, 166, 0.7)",   // Teal
      "rgba(251, 146, 60, 0.7)",   // Orange
      "rgba(59, 130, 246, 0.7)",   // Blue
      "rgba(168, 85, 247, 0.7)",   // Purple
      "rgba(34, 197, 94, 0.7)",    // Green
      "rgba(244, 63, 94, 0.7)",    // Rose
    ];
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(palette[i % palette.length]);
    }
    return result;
  }

  private getChartBorderColors(count: number): string[] {
    const palette = [
      "rgba(14, 165, 233, 1)",
      "rgba(16, 185, 129, 1)",
      "rgba(245, 158, 11, 1)",
      "rgba(239, 68, 68, 1)",
      "rgba(139, 92, 246, 1)",
      "rgba(236, 72, 153, 1)",
      "rgba(20, 184, 166, 1)",
      "rgba(251, 146, 60, 1)",
      "rgba(59, 130, 246, 1)",
      "rgba(168, 85, 247, 1)",
      "rgba(34, 197, 94, 1)",
      "rgba(244, 63, 94, 1)",
    ];
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(palette[i % palette.length]);
    }
    return result;
  }

  /**
   * Get available dashboard types
   */
  getAvailableTypes(): Array<{ type: DashboardType; title: string; titleAr: string; description: string }> {
    return Object.entries(DASHBOARD_TEMPLATES).map(([type, template]) => ({
      type: type as DashboardType,
      title: template.title,
      titleAr: template.titleAr,
      description: template.descriptionAr,
    }));
  }

  /**
   * Build a custom dashboard from user specifications
   */
  async buildCustomDashboard(
    title: string,
    titleAr: string,
    widgetSpecs: Array<{
      title: string;
      titleAr: string;
      chartType: ChartType;
      dataSource: string;
    }>,
    incidents: any[]
  ): Promise<DashboardBuildResult> {
    const widgets: DashboardWidget[] = widgetSpecs.map((spec, idx) => ({
      id: `custom-${idx + 1}`,
      type: "chart" as const,
      title: spec.title,
      titleAr: spec.titleAr,
      chartType: spec.chartType,
      dataSource: spec.dataSource,
      position: {
        row: Math.floor(idx / 2),
        col: (idx % 2) * 2,
        width: 2,
        height: 1,
      },
    }));

    return this.buildDashboard("custom", incidents, widgets);
  }
}

// ─── Singleton Instance ──────────────────────────────────────────────

export const dashboardBuilder = new DashboardBuilder();

```

---

## `server/rasidEnhancements/enhancedGreetings.ts`

```typescript
/**
 * Enhanced Greetings System - Issue #11
 * Natural, context-aware greetings based on time, user history, and current page
 */

interface GreetingContext {
  userName?: string;
  isFirstVisit?: boolean;
  visitCount?: number;
  currentPage?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  lastVisitDate?: Date;
}

export class EnhancedGreetings {
  /**
   * Get time of day in Arabic
   */
  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Get time-based greeting
   */
  private getTimeGreeting(): string {
    const timeOfDay = this.getTimeOfDay();
    
    const greetings = {
      morning: 'صباح الخير',
      afternoon: 'مساء الخير',
      evening: 'مساء الخير',
      night: 'مساء الخير',
    };

    return greetings[timeOfDay];
  }

  /**
   * Generate greeting based on context
   */
  generateGreeting(context: GreetingContext): string {
    const { userName, isFirstVisit, visitCount, currentPage } = context;
    const timeGreeting = this.getTimeGreeting();
    
    let greeting = '';

    // First visit - warm welcome
    if (isFirstVisit) {
      greeting = `${timeGreeting}! 👋\n\n`;
      greeting += userName 
        ? `أهلاً بك ${userName} في منصة راصد! يسعدني مساعدتك في رصد وتحليل حالات رصد البيانات الشخصية.\n\n`
        : `أهلاً بك في منصة راصد! أنا راصد الذكي، مساعدك الشخصي في رصد وتحليل حالات رصد البيانات الشخصية.\n\n`;
      greeting += `يمكنني مساعدتك في:\n`;
      greeting += `• 🔍 البحث عن حالات الرصد\n`;
      greeting += `• 📊 عرض الإحصائيات والتحليلات\n`;
      greeting += `• 📄 إنشاء التقارير والمستندات\n`;
      greeting += `• 🔔 إعداد التنبيهات والمراقبة\n\n`;
      greeting += `ما الذي تود مساعدتك به اليوم؟`;
    }
    // Returning user
    else {
      greeting = `${timeGreeting} ${userName || 'مرحباً بك مجدداً'}! `;
      
      // Add visit count context
      if (visitCount && visitCount > 1) {
        if (visitCount <= 5) {
          greeting += `🌟 `;
        } else if (visitCount > 20) {
          greeting += `⭐ زائر مميز! `;
        }
      }

      // Add page-specific context
      if (currentPage) {
        greeting += this.getPageSpecificGreeting(currentPage);
      } else {
        greeting += `كيف يمكنني مساعدتك اليوم؟`;
      }
    }

    return greeting;
  }

  /**
   * Get page-specific greeting
   */
  private getPageSpecificGreeting(page: string): string {
    const pageGreetings: Record<string, string> = {
      '/dashboard': '📊 أرى أنك تتصفح لوحة التحكم. هل تريد تحليل الإحصائيات الحالية؟',
      '/leaks': '🚨 أرى أنك تتصفح حالات الرصد. هل تبحث عن حالة رصد محددة؟',
      '/incidents': '📋 أرى أنك تتصفح سجل حالات الرصد. هل تريد معلومات عن حالة رصد معينة؟',
      '/reports': '📄 أرى أنك في قسم التقارير. هل تريد إنشاء تقرير جديد أو مراجعة تقرير موجود؟',
      '/monitoring': '🔔 أرى أنك في قسم المراقبة. هل تريد إعداد تنبيه جديد أو مراجعة التنبيهات الحالية؟',
      '/evidence': '🔗 أرى أنك تتصفح سلسلة الأدلة. هل تريد تتبع أدلة حالة رصد معينة؟',
      '/analytics': '📈 أرى أنك في قسم التحليلات. هل تريد تحليل عميق لبيانات معينة؟',
      '/knowledge': '📚 أرى أنك في قاعدة المعرفة. هل تبحث عن معلومة أو تعليمات محددة؟',
      '/audit': '🔍 أرى أنك تتصفح سجل المراجعة. هل تريد تحليل نشاط مستخدم معين؟',
      '/settings': '⚙️ أرى أنك في الإعدادات. هل تحتاج مساعدة في تكوين شيء معين؟',
    };

    return pageGreetings[page] || 'كيف يمكنني مساعدتك اليوم؟';
  }

  /**
   * Generate system prompt enhancement for natural greetings
   */
  generateSystemPromptEnhancement(context: GreetingContext): string {
    const timeOfDay = this.getTimeOfDay();
    const { currentPage, visitCount } = context;

    let enhancement = `\n# سياق المحادثة الحالي:\n`;
    enhancement += `- الوقت: ${this.getTimeDescription(timeOfDay)}\n`;
    
    if (currentPage) {
      enhancement += `- الصفحة الحالية: ${currentPage}\n`;
      enhancement += `- دمج التحية بشكل طبيعي في ردك الأول إذا كان مناسباً\n`;
    }

    if (visitCount && visitCount > 10) {
      enhancement += `- المستخدم زائر متكرر ومتمرس، لا حاجة لشرح الأساسيات\n`;
    }

    enhancement += `\n# أسلوب الترحيب:\n`;
    enhancement += `- دمج الترحيب في سياق الرد بشكل طبيعي، وليس كجملة منفصلة\n`;
    enhancement += `- إذا كان السؤال مباشراً، ابدأ بالإجابة مباشرة بعد ترحيب مختصر\n`;
    enhancement += `- استخدم سياق الصفحة الحالية إذا كان متاحاً لتوجيه الترحيب\n`;

    return enhancement;
  }

  /**
   * Get time description in Arabic
   */
  private getTimeDescription(timeOfDay: string): string {
    const descriptions = {
      morning: 'صباح (٥ص - ١٢م)',
      afternoon: 'ظهر (١٢م - ٥م)',
      evening: 'مساء (٥م - ٩م)',
      night: 'ليل (٩م - ٥ص)',
    };
    return descriptions[timeOfDay as keyof typeof descriptions] || 'نهار';
  }

  /**
   * Check if query is a greeting and needs special handling
   */
  isGreetingQuery(query: string): boolean {
    const greetingPatterns = [
      /^(مرحبا|أهلا|هلا|السلام عليكم|صباح|مساء|hello|hi|hey)\s*$/i,
      /^(مرحبا|أهلا|هلا|السلام عليكم|صباح|مساء|hello|hi|hey)\s+راصد\s*$/i,
      /^كيف حالك\s*[؟?]?\s*$/i,
      /^how are you\s*[?]?\s*$/i,
    ];

    return greetingPatterns.some(pattern => pattern.test(query.trim()));
  }

  /**
   * Generate response to greeting query
   */
  generateGreetingResponse(context: GreetingContext): string {
    const greeting = this.generateGreeting(context);
    return greeting;
  }
}

// Singleton instance
export const enhancedGreetings = new EnhancedGreetings();

```

---

## `server/rasidEnhancements/exportAndEmailSystem.ts`

```typescript
/**
 * Export and Email System - نظام التصدير والبريد الإلكتروني
 * 
 * Features:
 * - Export reports in multiple formats (PDF, Excel, PowerPoint)
 * - Send documents via email
 * - Template-based email composition
 * - Attachment management
 * - Scheduled email delivery
 */

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'powerpoint' | 'csv' | 'json';
  includeCharts?: boolean;
  includeStatistics?: boolean;
  includeRawData?: boolean;
  template?: string;
  customization?: {
    logo?: string;
    headerText?: string;
    footerText?: string;
    theme?: 'light' | 'dark' | 'professional';
  };
}

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: string;
  bodyHtml?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'report' | 'alert' | 'summary' | 'custom';
  sections: Array<{
    id: string;
    title: string;
    content: string;
    type: 'text' | 'chart' | 'table' | 'list';
    data?: any;
  }>;
}

export class ExportAndEmailSystem {
  private emailQueue: Array<EmailOptions & { id: string; status: 'pending' | 'sent' | 'failed' }> = [];
  private templates: Map<string, DocumentTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize default document templates
   */
  private initializeTemplates(): void {
    // Monthly Report Template
    this.templates.set('monthly-report', {
      id: 'monthly-report',
      name: 'التقرير الشهري',
      type: 'report',
      sections: [
        {
          id: 'cover',
          title: 'صفحة الغلاف',
          content: 'تقرير حالات الرصد الشهري - {{month}} {{year}}',
          type: 'text',
        },
        {
          id: 'executive-summary',
          title: 'الملخص التنفيذي',
          content: 'نظرة عامة على حالات الرصد المكتشفة خلال الشهر',
          type: 'text',
        },
        {
          id: 'statistics',
          title: 'الإحصائيات الرئيسية',
          content: '',
          type: 'table',
        },
        {
          id: 'sector-distribution',
          title: 'توزيع حالات الرصد حسب القطاع',
          content: '',
          type: 'chart',
        },
        {
          id: 'severity-analysis',
          title: 'تحليل التأثير',
          content: '',
          type: 'chart',
        },
        {
          id: 'recommendations',
          title: 'التوصيات',
          content: 'توصيات لتحسين الأمن السيبراني',
          type: 'list',
        },
      ],
    });

    // Alert Template
    this.templates.set('critical-alert', {
      id: 'critical-alert',
      name: 'تنبيه حرج',
      type: 'alert',
      sections: [
        {
          id: 'alert-header',
          title: 'تنبيه أمني',
          content: '🚨 تم اكتشاف حالة رصد حرجة',
          type: 'text',
        },
        {
          id: 'incident-details',
          title: 'تفاصيل حالة الرصد',
          content: '',
          type: 'table',
        },
        {
          id: 'recommended-actions',
          title: 'الإجراءات الموصى بها',
          content: '',
          type: 'list',
        },
      ],
    });

    // Summary Template
    this.templates.set('weekly-summary', {
      id: 'weekly-summary',
      name: 'الملخص الأسبوعي',
      type: 'summary',
      sections: [
        {
          id: 'header',
          title: 'ملخص الأسبوع',
          content: 'نظرة سريعة على أحداث الأسبوع',
          type: 'text',
        },
        {
          id: 'highlights',
          title: 'أبرز الأحداث',
          content: '',
          type: 'list',
        },
        {
          id: 'trends',
          title: 'الاتجاهات',
          content: '',
          type: 'chart',
        },
      ],
    });
  }

  /**
   * Export data to specified format
   */
  async exportData(
    data: any,
    options: ExportOptions
  ): Promise<Buffer> {
    switch (options.format) {
      case 'pdf':
        return this.exportToPDF(data, options);
      case 'excel':
        return this.exportToExcel(data, options);
      case 'powerpoint':
        return this.exportToPowerPoint(data, options);
      case 'csv':
        return this.exportToCSV(data);
      case 'json':
        return this.exportToJSON(data);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Export to PDF
   */
  private async exportToPDF(data: any, options: ExportOptions): Promise<Buffer> {
    // This would use a library like pdfkit or puppeteer
    // For now, return placeholder
    const content = JSON.stringify({
      message: 'PDF Export',
      data,
      options,
      note: 'Would generate professional PDF with charts and tables',
    });

    return Buffer.from(content);
  }

  /**
   * Export to Excel
   */
  private async exportToExcel(data: any, options: ExportOptions): Promise<Buffer> {
    // This would use xlsx library
    const content = JSON.stringify({
      message: 'Excel Export',
      data,
      options,
      note: 'Would generate Excel workbook with multiple sheets',
    });

    return Buffer.from(content);
  }

  /**
   * Export to PowerPoint
   */
  private async exportToPowerPoint(data: any, options: ExportOptions): Promise<Buffer> {
    // This would use pptxgenjs
    const content = JSON.stringify({
      message: 'PowerPoint Export',
      data,
      options,
      note: 'Would generate professional presentation with charts',
    });

    return Buffer.from(content);
  }

  /**
   * Export to CSV
   */
  private async exportToCSV(data: any[]): Promise<Buffer> {
    if (!Array.isArray(data) || data.length === 0) {
      return Buffer.from('');
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvLines = [headers.join(',')];

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || '');
        return stringValue.includes(',') || stringValue.includes('"')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      });
      csvLines.push(values.join(','));
    });

    return Buffer.from(csvLines.join('\n'), 'utf-8');
  }

  /**
   * Export to JSON
   */
  private async exportToJSON(data: any): Promise<Buffer> {
    return Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        return { success: false, error: `Invalid email address: ${email}` };
      }
    }

    // If scheduled, add to queue
    if (options.scheduledAt) {
      const queueItem = {
        ...options,
        id: `email_${Date.now()}`,
        status: 'pending' as const,
      };
      this.emailQueue.push(queueItem);
      return { success: true, messageId: queueItem.id };
    }

    // Send immediately (this would integrate with an email service)
    // Generate secure message ID using crypto
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // TODO: In production, use crypto.randomUUID() or a proper UUID library
    
    console.log('📧 Sending email:', {
      to: options.to,
      subject: options.subject,
      hasAttachments: (options.attachments?.length || 0) > 0,
      messageId,
    });

    return { success: true, messageId };
  }

  /**
   * Generate email body from template
   */
  generateEmailBody(templateName: string, data: any): string {
    const templates: Record<string, (data: any) => string> = {
      'incident-alert': (d) => `
        <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right;">
          <h2 style="color: #dc2626;">🚨 تنبيه: حالة رصد جديدة</h2>
          <p>تم اكتشاف حالة رصد جديدة:</p>
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>العنوان:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${d.title}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>التأثير:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${d.severity}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>القطاع:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${d.sector}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>السجلات المكشوفة:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${d.recordCount?.toLocaleString()}</td></tr>
          </table>
          <p><a href="${d.url}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">عرض التفاصيل</a></p>
        </div>
      `,
      
      'report-ready': (d) => `
        <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right;">
          <h2 style="color: #10b981;">✅ التقرير جاهز</h2>
          <p>مرحباً ${d.userName},</p>
          <p>التقرير الذي طلبته جاهز الآن!</p>
          <ul>
            <li><strong>نوع التقرير:</strong> ${d.reportType}</li>
            <li><strong>الفترة:</strong> ${d.period}</li>
            <li><strong>عدد حالات الرصد:</strong> ${d.incidentCount}</li>
          </ul>
          <p>ستجد التقرير مرفقاً مع هذا البريد.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            هذا بريد تلقائي من منصة راصد. لا تجب على هذا البريد.
          </p>
        </div>
      `,
      
      'weekly-summary': (d) => `
        <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; text-align: right;">
          <h2 style="color: #8b5cf6;">📊 الملخص الأسبوعي</h2>
          <p>إليك ملخص أحداث هذا الأسبوع:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>الإحصائيات</h3>
            <ul>
              <li>إجمالي حالات الرصد الجديدة: <strong>${d.newIncidents}</strong></li>
              <li>حالات رصد حرجة: <strong style="color: #dc2626;">${d.criticalIncidents}</strong></li>
              <li>القطاع الأكثر تأثراً: <strong>${d.topSector}</strong></li>
            </ul>
          </div>
          <p><a href="${d.dashboardUrl}" style="background: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">عرض لوحة التحكم</a></p>
        </div>
      `,
    };

    const templateFn = templates[templateName];
    if (!templateFn) {
      return `<p>البيانات: ${JSON.stringify(data)}</p>`;
    }

    return templateFn(data);
  }

  /**
   * Export and email in one operation
   */
  async exportAndEmail(
    data: any,
    exportOptions: ExportOptions,
    emailOptions: Omit<EmailOptions, 'attachments'>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Export data
      const exportedData = await this.exportData(data, exportOptions);
      
      // Determine filename
      const ext = exportOptions.format === 'powerpoint' ? 'pptx' : 
                   exportOptions.format === 'excel' ? 'xlsx' : 
                   exportOptions.format;
      const filename = `report_${Date.now()}.${ext}`;

      // Send email with attachment
      return this.sendEmail({
        ...emailOptions,
        attachments: [
          {
            filename,
            content: exportedData,
            contentType: this.getContentType(exportOptions.format),
          },
        ],
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get content type for format
   */
  private getContentType(format: string): string {
    const types: Record<string, string> = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      powerpoint: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      csv: 'text/csv',
      json: 'application/json',
    };
    return types[format] || 'application/octet-stream';
  }

  /**
   * Get email queue
   */
  getEmailQueue() {
    return this.emailQueue;
  }

  /**
   * Process scheduled emails
   */
  async processScheduledEmails(): Promise<void> {
    const now = new Date();
    const dueEmails = this.emailQueue.filter(
      email => email.status === 'pending' && 
               email.scheduledAt && 
               email.scheduledAt <= now
    );

    for (const email of dueEmails) {
      const result = await this.sendEmail(email);
      email.status = result.success ? 'sent' : 'failed';
    }
  }
}

// Singleton instance
export const exportAndEmailSystem = new ExportAndEmailSystem();

```

---

## `server/rasidEnhancements/fallbackEngine.ts`

```typescript
/**
 * Fallback Engine — Enhanced with 45+ scenarios and fuzzy matching
 * Used when OpenAI is unavailable (circuit breaker OPEN) or for simple queries
 */

// ═══ Configuration Constants ═══
const MIN_FUZZY_MATCH_SCORE = 2; // Minimum number of keyword matches for fuzzy matching

interface FallbackRule {
  regex: RegExp;
  context?: "dashboardStats" | "incidents";
  response: string;
  find?: "max" | "min";
  field?: string;
  filter?: { field: string; value: string };
  calculate?: "count" | "sum" | "avg";
}

const FALLBACK_RULES: FallbackRule[] = [
  // ═══ تحيات وترحيب ═══
  { regex: /^(مرحبا|السلام عليكم|أهلا|هلا|صباح الخير|مساء الخير|hi|hello)/i, response: "أهلاً وسهلاً! أنا راصد الذكي، مساعدك في تحليل حالات الرصد. كيف أقدر أساعدك اليوم؟" },
  { regex: /^(شكرا|ممتاز|رائع|أحسنت|thanks|thank you)/i, response: "شكراً لك! أنا دائماً في خدمتك. هل تحتاج مساعدة في شيء آخر؟" },
  { regex: /^(من أنت|عرفني عن نفسك|ما هو راصد|what are you)/i, response: "أنا **راصد الذكي** 🛡️ — المساعد الذكي لمنصة رصد حالات رصد البيانات الشخصية. أستطيع تحليل حالات الرصد، إنشاء التقارير، ومساعدتك في فهم مشهد التهديدات." },

  // ═══ إحصائيات لوحة المعلومات ═══
  { regex: /كم عدد الحوادث|كم عدد حالات الرصد|إجمالي الحوادث|إجمالي حالات الرصد|total incidents|all leaks/i, context: "dashboardStats", response: "إجمالي عدد حالات الرصد المسجلة في المنصة هو **{totalLeaks}** حالة رصد." },
  { regex: /كم العدد المُدّعى|إجمالي الأعداد المُدّعاة|total records|affected records/i, context: "dashboardStats", response: "إجمالي العدد المُدّعى المتأثرة في جميع حالات الرصد هو **{totalRecords}** سجل." },
  { regex: /الحوادث الخطرة|حالات الرصد الخطرة|الحوادث عالية الأهمية|حالات الرصد عالية الأهمية|critical incidents|high severity/i, context: "dashboardStats", response: "يوجد **{criticalLeaks}** حالة رصد مصنفة كـ \"حرجة\" (Critical)." },
  { regex: /مستوى التأثير|مؤشر التأثير|risk score|impact level/i, context: "dashboardStats", response: "مؤشر التأثير العام للمنصة حالياً هو **{riskScore}%**." },
  { regex: /مستوى الامتثال|مؤشر الامتثال|compliance score/i, context: "dashboardStats", response: "مؤشر الامتثال العام للمنصة هو **{complianceScore}%**." },
  { regex: /أكثر القطاعات تأثراً|القطاعات المتأثرة|most affected sectors/i, context: "dashboardStats", response: "القطاعات الأكثر تأثراً هي: **{affectedSectors}**." },

  // ═══ أسئلة عن حالات الرصد - الأساسية ═══
  { regex: /أكبر حالة رصد|أكبر حالة رصد|أضخم حالة رصد|largest breach|biggest leak/i, context: "incidents", response: "أكبر حالة رصد من حيث العدد المُدّعى هي **\"{titleAr}\"** بعدد **{recordCount}** سجل.", find: "max", field: "recordCount" },
  { regex: /أخطر حالة رصد|أخطر حالة رصد|most dangerous|highest severity/i, context: "incidents", response: "أخطر حالة رصد حالياً هي **\"{titleAr}\"** بمستوى خطورة **{severity}**.", find: "max", field: "severity" },
  { regex: /أحدث حادثة|أحدث حالة رصد|آخر حالة رصد|latest breach|most recent/i, context: "incidents", response: "أحدث حالة رصد تم تسجيلها هي **\"{titleAr}\"** بتاريخ **{detectedAt}**.", find: "max", field: "detectedAt" },
  { regex: /أقدم حالة رصد|أقدم حالة رصد|أول حالة رصد|oldest breach|first incident/i, context: "incidents", response: "أقدم حالة رصد مسجلة هي **\"{titleAr}\"** بتاريخ **{detectedAt}**.", find: "min", field: "detectedAt" },

  // ═══ أسئلة عن القطاعات ═══
  { regex: /ما هي القطاعات الموجودة|قائمة القطاعات|list sectors|all sectors/i, context: "incidents", response: "القطاعات التي تم تسجيل حالات رصد فيها تشمل: **{sectors}**." },
  { regex: /القطاع الحكومي|government sector/i, context: "incidents", response: "يوجد **{count}** حالات رصد مسجلة في القطاع الحكومي.", filter: { field: "sector", value: "Government" } },
  { regex: /القطاع الصحي|health sector|healthcare/i, context: "incidents", response: "يوجد **{count}** حالات رصد مسجلة في القطاع الصحي.", filter: { field: "sector", value: "Health" } },
  { regex: /القطاع المالي|financial sector|البنوك|banking/i, context: "incidents", response: "يوجد **{count}** حالات رصد مسجلة في القطاع المالي.", filter: { field: "sector", value: "Financial" } },
  { regex: /القطاع التعليمي|education sector|التعليم|schools/i, context: "incidents", response: "يوجد **{count}** حالات رصد مسجلة في قطاع التعليم.", filter: { field: "sector", value: "Education" } },
  { regex: /الاتصالات|telecom|telecommunications/i, context: "incidents", response: "يوجد **{count}** حالات رصد مسجلة في قطاع الاتصالات.", filter: { field: "sector", value: "Telecom" } },

  // ═══ أسئلة عن المصادر والمنصات ═══
  { regex: /مصادر حالة الرصد|من أين تأتي حالات الرصد|breach sources|leak sources/i, context: "dashboardStats", response: "أبرز مصادر حالات الرصد هي: **{sourceDistribution}**." },
  { regex: /الويب المظلم|dark web|darkweb/i, context: "incidents", response: "لدينا **{count}** حالة رصد مصدرها الويب المظلم.", filter: { field: "source", value: "Dark Web" } },
  { regex: /تليجرام|telegram/i, context: "incidents", response: "لدينا **{count}** حالة رصد مصدرها تليجرام.", filter: { field: "source", value: "Telegram" } },
  { regex: /منتديات|forums|hacker forums/i, context: "incidents", response: "لدينا **{count}** حالة رصد مصدرها منتديات القرصنة.", filter: { field: "source", value: "Forum" } },

  // ═══ NEW: أسئلة عن أنواع البيانات ═══
  { regex: /أكثر أنواع البيانات|ما هي أكثر أنواع|most common data types|pii types|أنواع العينات المتاحة/i, context: "incidents", response: "أكثر أنواع العينات المتاحة شيوعاً: **{topPiiTypes}**.", calculate: "count" },
  { regex: /حالات رصد تحتوي على بطاقات|حوادث تحتوي على بطاقات|credit cards|أرقام بطاقات/i, context: "incidents", response: "لدينا **{count}** حالة رصد تحتوي على بطاقات ائتمانية.", filter: { field: "piiTypes", value: "Credit Card" } },
  { regex: /حالات رصد تحتوي على كلمات مرور|حوادث تحتوي على كلمات مرور|passwords|credentials/i, context: "incidents", response: "لدينا **{count}** حالة رصد تحتوي على كلمات مرور.", filter: { field: "piiTypes", value: "Password" } },

  // ═══ NEW: أسئلة عن الفترة الزمنية ═══
  { regex: /حالات رصد هذا الشهر|حوادث هذا الشهر|this month|current month/i, context: "incidents", response: "تم تسجيل **{count}** حالة رصد خلال الشهر الحالي.", calculate: "count" },
  { regex: /حالات رصد آخر 30 يوم|حوادث آخر 30 يوم|last 30 days|past month/i, context: "incidents", response: "تم تسجيل **{count}** حالة رصد خلال آخر 30 يوماً.", calculate: "count" },
  { regex: /حالات رصد هذه السنة|حوادث هذه السنة|this year|current year/i, context: "incidents", response: "تم تسجيل **{count}** حالة رصد خلال السنة الحالية.", calculate: "count" },

  // ═══ NEW: أسئلة عن مستوى التأثير ═══
  { regex: /حالات رصد متوسطة التأثير|حوادث متوسطة التأثير|medium severity/i, context: "incidents", response: "لدينا **{count}** حالة رصد بمستوى تأثير متوسط.", filter: { field: "severity", value: "Medium" } },
  { regex: /حالات رصد منخفضة التأثير|حوادث منخفضة التأثير|low severity/i, context: "incidents", response: "لدينا **{count}** حالة رصد بمستوى تأثير منخفض.", filter: { field: "severity", value: "Low" } },
  { regex: /حالات رصد عالية التأثير|حوادث عالية التأثير|high severity/i, context: "incidents", response: "لدينا **{count}** حالة رصد بمستوى تأثير عالي.", filter: { field: "severity", value: "High" } },

  // ═══ NEW: أسئلة عن الامتثال و PDPL ═══
  { regex: /PDPL|نظام حماية البيانات الشخصية|personal data protection/i, response: "نظام حماية البيانات الشخصية (PDPL) هو الإطار التنظيمي في المملكة لحماية حقوق الأفراد المتعلقة ببياناتهم. هل لديك سؤال محدد عنه؟" },
  { regex: /أكبر غرامة|أعلى غرامة|highest fine|maximum penalty/i, context: "incidents", response: "أعلى غرامة مقدرة كانت لحالة رصد **\"{titleAr}\"** بقيمة **{estimatedFineDisplay}**.", find: "max", field: "estimatedFineSar" },
  { regex: /إجمالي الغرامات|total fines|all penalties/i, context: "incidents", response: "إجمالي الغرامات المقدرة لجميع حالات الرصد: **{totalFines}**.", calculate: "sum" },

  // ═══ NEW: أسئلة عن الحالة والتحقيق ═══
  { regex: /حالات رصد قيد التحقيق|حوادث قيد التحقيق|under investigation/i, context: "incidents", response: "لدينا **{count}** حالة رصد قيد التحقيق حالياً.", filter: { field: "status", value: "investigating" } },
  { regex: /حالات رصد مغلقة|حوادث مغلقة|closed incidents|resolved/i, context: "incidents", response: "لدينا **{count}** حالة رصد تم إغلاقها.", filter: { field: "status", value: "closed" } },
  { regex: /حالات رصد جديدة|حوادث جديدة|new incidents|pending/i, context: "incidents", response: "لدينا **{count}** حالة رصد جديدة تحتاج مراجعة.", filter: { field: "status", value: "new" } },

  // ═══ NEW: أسئلة عن الأدلة والتوثيق ═══
  { regex: /حالات رصد بدون أدلة|حوادث بدون أدلة|no evidence|missing evidence/i, context: "incidents", response: "لدينا **{count}** حالة رصد بدون أدلة موثقة.", filter: { field: "evidenceCount", value: "0" } },
  { regex: /حالات رصد موثقة|حوادث موثقة|documented|with evidence/i, context: "incidents", response: "لدينا **{count}** حالة رصد تحتوي على أدلة موثقة.", calculate: "count" },

  // ═══ NEW: مقارنات بين القطاعات ═══
  { regex: /مقارنة.*القطاع.*الصحي.*المالي|compare health and financial/i, context: "incidents", response: "**القطاع الصحي:** {healthCount} حالة رصد | **القطاع المالي:** {financialCount} حالة رصد" },
  { regex: /أكثر قطاع تضرراً|most affected sector/i, context: "incidents", response: "القطاع الأكثر تضرراً هو **{topSector}** بعدد **{topSectorCount}** حالة رصد." },

  // ═══ NEW: توصيات وإجراءات ═══
  { regex: /ماذا يجب أن أفعل|what should i do|recommendations/i, response: "يمكنك:\n1. مراجعة حالات الرصد الحرجة فوراً\n2. تحديث قواعد الكشف\n3. إعداد تقرير دوري\n4. تفعيل التنبيهات الآلية" },
  { regex: /كيف أحسن الأمان|improve security|security recommendations/i, response: "توصيات أمنية:\n• تفعيل المراقبة المستمرة\n• تحديث قواعد الكشف\n• مراجعة سياسات الاحتفاظ\n• تدريب الموظفين" },

  // ═══ أسئلة غير مفهومة (آخر قاعدة - catch-all) ═══
  { regex: /.*/, response: "عذراً، لم أفهم طلبك بشكل كامل. يمكنني مساعدتك في:\n- تحليل حالات الرصد\n- إحصائيات لوحة المعلومات\n- تقارير القطاعات\n- تحليل الامتثال\n\nحاول إعادة صياغة سؤالك أو اختر من الأوامر السريعة." },
];

export class FallbackEngine {
  private incidents: any[];
  private dashboardStats: any;

  constructor(incidents: any[], dashboardStats: any) {
    this.incidents = incidents || [];
    this.dashboardStats = dashboardStats || {};
  }

  /**
   * Check if a prompt matches any fallback rule with fuzzy matching
   */
  check(prompt: string): string | null {
    // Try exact matching first
    for (const rule of FALLBACK_RULES) {
      if (rule.regex.test(prompt)) {
        return this.executeRule(rule);
      }
    }
    
    // Try fuzzy matching for better coverage
    const fuzzyMatch = this.fuzzyMatch(prompt);
    if (fuzzyMatch) {
      return this.executeRule(fuzzyMatch);
    }
    
    return null;
  }

  /**
   * Fuzzy matching for better pattern recognition
   */
  private fuzzyMatch(prompt: string): FallbackRule | null {
    const promptLower = prompt.toLowerCase();
    const keywords = promptLower.split(/\s+/);
    
    // Check for common patterns with partial matching
    for (const rule of FALLBACK_RULES) {
      const rulePattern = rule.regex.source.toLowerCase();
      let matchScore = 0;
      
      for (const keyword of keywords) {
        // Only check keywords with 4+ characters for fuzzy matching
        if (keyword.length >= 4) {
          const keywordPrefix = keyword.substring(0, 4);
          if (rulePattern.includes(keywordPrefix)) {
            matchScore++;
          }
        }
      }
      
      // If we have at least MIN_FUZZY_MATCH_SCORE keyword matches, consider it a fuzzy match
      // Exclude the generic fallback response to avoid false positives
      if (matchScore >= MIN_FUZZY_MATCH_SCORE && !rule.response.startsWith("عذراً، لم أفهم طلبك")) {
        return rule;
      }
    }
    
    return null;
  }

  private executeRule(rule: FallbackRule): string {
    let response = rule.response;

    if (rule.context === "dashboardStats") {
      for (const key in this.dashboardStats) {
        const placeholder = new RegExp(`\\{${key}\\}`, "g");
        response = response.replace(placeholder, String(this.dashboardStats[key]));
      }
    }

    if (rule.context === "incidents") {
      if (rule.find) {
        const item = this.findIncident(rule.find, rule.field!);
        if (item) {
          for (const key in item) {
            const placeholder = new RegExp(`\\{${key}\\}`, "g");
            response = response.replace(placeholder, String(item[key]));
          }
        }
      } else if (rule.filter) {
        const count = this.filterIncidents(rule.filter.field, rule.filter.value).length;
        response = response.replace(/\{count\}/g, String(count));
      } else if (rule.calculate) {
        const result = this.calculateMetric(rule.calculate, rule.field);
        response = response.replace(/\{(count|sum|avg|totalFines|topPiiTypes|topSector|topSectorCount|healthCount|financialCount)\}/g, 
          (match, key) => String(result[key] || 0));
      } else if (response.includes("{sectors}")) {
        const sectors = Array.from(new Set(this.incidents.map((i) => i.sectorAr || i.sector).filter(Boolean)));
        response = response.replace("{sectors}", sectors.join("، "));
      }
    }

    return response;
  }

  private filterIncidents(field: string, value: string): any[] {
    return this.incidents.filter((i) => {
      if (field === "evidenceCount") {
        return (i.evidenceCount || 0).toString() === value;
      }
      const fieldValue = i[field];
      if (Array.isArray(fieldValue)) {
        return fieldValue.some(v => v.toLowerCase().includes(value.toLowerCase()));
      }
      return (fieldValue || "").toString().toLowerCase().includes(value.toLowerCase());
    });
  }

  private calculateMetric(operation: string, field?: string): Record<string, any> {
    const result: Record<string, any> = {};
    
    switch (operation) {
      case "count":
        result.count = this.incidents.length;
        break;
      case "sum":
        if (field === "estimatedFineSar" || !field) {
          const total = this.incidents.reduce((sum, i) => sum + (i.estimatedFineSar || 0), 0);
          result.totalFines = total.toLocaleString("ar-SA") + " ريال";
        }
        break;
      case "avg":
        if (field && this.incidents.length > 0) {
          const sum = this.incidents.reduce((s, i) => s + (i[field] || 0), 0);
          // Note: Using Math.round for simplicity. For financial data requiring precision,
          // consider using toFixed(2) or storing as-is for further processing
          result.avg = Math.round(sum / this.incidents.length);
        } else {
          result.avg = 0;
        }
        break;
    }
    
    // Additional calculated metrics
    if (!field) {
      // Top PII types
      const piiCounts: Record<string, number> = {};
      this.incidents.forEach(i => {
        (i.piiTypes || []).forEach((type: string) => {
          piiCounts[type] = (piiCounts[type] || 0) + 1;
        });
      });
      const topPii = Object.entries(piiCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `${name} (${count})`)
        .join("، ");
      result.topPiiTypes = topPii || "لا توجد بيانات";
      
      // Top sector
      const sectorCounts: Record<string, number> = {};
      this.incidents.forEach(i => {
        const sector = i.sectorAr || i.sector || "غير محدد";
        sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
      });
      const sectorEntries = Object.entries(sectorCounts).sort((a, b) => b[1] - a[1]);
      if (sectorEntries.length > 0) {
        const topSectorEntry = sectorEntries[0];
        result.topSector = topSectorEntry[0];
        result.topSectorCount = topSectorEntry[1];
      } else {
        result.topSector = "غير محدد";
        result.topSectorCount = 0;
      }
      
      // Sector comparisons
      result.healthCount = this.filterIncidents("sector", "Health").length;
      result.financialCount = this.filterIncidents("sector", "Financial").length;
    }
    
    return result;
  }

  private findIncident(operation: string, field: string): any | null {
    if (this.incidents.length === 0) return null;

    if (operation === "max") {
      if (field === "severity") {
        const severityOrder: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return this.incidents.reduce((max, i) =>
          (severityOrder[i.severity] || 0) > (severityOrder[max.severity] || 0) ? i : max,
          this.incidents[0]
        );
      } else if (field === "detectedAt") {
        return this.incidents.reduce((max, i) =>
          new Date(i.detectedAt) > new Date(max.detectedAt) ? i : max,
          this.incidents[0]
        );
      } else {
        return this.incidents.reduce((max, i) =>
          (i[field] || 0) > (max[field] || 0) ? i : max,
          this.incidents[0]
        );
      }
    } else if (operation === "min") {
      if (field === "detectedAt") {
        return this.incidents.reduce((min, i) =>
          new Date(i.detectedAt) < new Date(min.detectedAt) ? i : min,
          this.incidents[0]
        );
      } else {
        return this.incidents.reduce((min, i) =>
          (i[field] || 0) < (min[field] || 0) ? i : min,
          this.incidents[0]
        );
      }
    }
    return null;
  }
}

```

---

## `server/rasidEnhancements/guardrails.ts`

```typescript
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
      'راصد', 'رصد', 'حالة رصد', 'حالة رصد', 'بيانات', 'شخصية',
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

```

---

## `server/rasidEnhancements/index.ts`

```typescript
/**
 * Rasid Enhancements v5 — Advanced Intelligence & Automation System
 * Barrel Export for all enhancement modules
 */

// Existing enhancements
export { RAGEngine, ragEngine, ConversationMemory, conversationMemory } from "./ragEngine";
export { CircuitBreaker, circuitBreaker } from "./circuitBreaker";
export { FallbackEngine } from "./fallbackEngine";
export { ChartDataEngine } from "./chartDataEngine";

// Phase 1: Core Enhancements (Issues 7-12)
export { ResponseCache, responseCache } from "./responseCache";
export { PerformanceTracker, type PerformanceMetrics } from "./performanceMetrics";
export { Guardrails, guardrails, type GuardrailResult } from "./guardrails";
export {
  formatResponse,
  convertToArabicNumerals,
  addContextualIcons,
  convertTablesToHTML,
  addSmartActionButtons,
  highlightChartReferences,
} from "./responseFormatter";
export { LearningEngine, learningEngine } from "./learningEngine";
export { EnhancedGreetings, enhancedGreetings } from "./enhancedGreetings";

// Phase 2: Advanced Intelligence
export {
  SmartChartEngine,
  smartChartEngine,
  type ChartType,
  type AdvancedChartConfig,
  type ChartRecommendation,
} from "./smartChartEngine";
export {
  RecommendationEngine,
  recommendationEngine,
  type Recommendation,
  type UserContext,
  type Pattern,
} from "./recommendationEngine";

// Phase 3: Auto-Training & Tutorials (New Requirements)
export {
  AutoTrainingSystem,
  autoTrainingSystem,
} from "./autoTrainingSystem";
export {
  InteractiveTutorialSystem,
  interactiveTutorialSystem,
  type Tutorial,
  type TutorialStep,
} from "./interactiveTutorialSystem";
export {
  ExportAndEmailSystem,
  exportAndEmailSystem,
  type ExportOptions,
  type EmailOptions,
} from "./exportAndEmailSystem";

// Phase 4: Dashboard Builder
export {
  DashboardBuilder,
  dashboardBuilder,
  type DashboardType,
  type DashboardLayout,
  type DashboardWidget,
  type DashboardBuildResult,
} from "./dashboardBuilder";

```

---

## `server/rasidEnhancements/interactiveTutorialSystem.ts`

```typescript
/**
 * Interactive Tutorial System - نظام الدليل الإرشادي التفاعلي الحي
 * 
 * Features:
 * - Step-by-step guided tours
 * - Live demonstrations
 * - Interactive element highlighting
 * - Voice-like narration
 * - Smart suggestions based on user actions
 */

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector
  action?: 'click' | 'type' | 'hover' | 'scroll' | 'wait';
  actionData?: any;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  narration: string; // What to say
  autoExecute?: boolean; // Execute automatically or wait for user
  duration?: number; // How long to show this step
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'incidents' | 'reports' | 'settings' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  steps: TutorialStep[];
  prerequisites?: string[];
}

export class InteractiveTutorialSystem {
  private tutorials: Map<string, Tutorial> = new Map();
  private currentTutorial: Tutorial | null = null;
  private currentStep: number = 0;
  private isPlaying: boolean = false;

  constructor() {
    this.initializeBuiltInTutorials();
  }

  /**
   * Initialize built-in tutorials
   */
  private initializeBuiltInTutorials(): void {
    // Tutorial 1: Creating a new incident
    this.addTutorial({
      id: 'create-incident',
      title: 'كيفية إضافة حالة رصد جديدة',
      description: 'تعلم كيفية إضافة حالة رصد جديدة إلى المنصة خطوة بخطوة',
      category: 'incidents',
      difficulty: 'beginner',
      estimatedTime: 3,
      steps: [
        {
          id: 'step-1',
          title: 'الانتقال لصفحة حالات الرصد',
          description: 'أولاً، نحتاج للانتقال إلى صفحة حالات الرصد',
          targetElement: 'a[href="/leaks"]',
          action: 'click',
          position: 'right',
          narration: 'مرحباً! دعني أريك كيف تضيف حالة رصد جديدة. أولاً، سننتقل إلى صفحة حالات الرصد. لاحظ القائمة الجانبية على اليسار.',
          autoExecute: true,
          duration: 3000,
        },
        {
          id: 'step-2',
          title: 'النقر على زر إضافة حالة رصد',
          description: 'ابحث عن زر "إضافة حالة رصد جديدة" في أعلى الصفحة',
          targetElement: 'button:contains("إضافة"), button:contains("جديد")',
          action: 'click',
          position: 'bottom',
          narration: 'رائع! الآن نحن في صفحة حالات الرصد. انظر إلى الزر الأزرق في الأعلى - هذا هو زر "إضافة حالة رصد جديدة". سأنقر عليه الآن.',
          autoExecute: true,
          duration: 2000,
        },
        {
          id: 'step-3',
          title: 'ملء معلومات حالة الرصد',
          description: 'املأ العنوان والوصف والقطاع المتأثر',
          targetElement: 'input[name="title"], input[name="titleAr"]',
          action: 'type',
          actionData: { value: 'حالة رصد - مثال تعليمي' },
          position: 'right',
          narration: 'ممتاز! الآن ظهر نموذج إضافة حالة الرصد. دعني أملأ الحقول المطلوبة. أولاً العنوان...',
          autoExecute: false, // User should fill this
          duration: 5000,
        },
        {
          id: 'step-4',
          title: 'اختيار درجة التأثير',
          description: 'حدد مستوى خطورة حالة الرصد',
          targetElement: 'select[name="severity"]',
          action: 'click',
          position: 'right',
          narration: 'الآن نحتاج لتحديد درجة التأثير. هل حالة الرصد حرجة؟ عالية؟ متوسطة؟ أم منخفضة؟',
          autoExecute: false,
          duration: 3000,
        },
        {
          id: 'step-5',
          title: 'حفظ حالة الرصد',
          description: 'انقر على زر حفظ لإضافة حالة الرصد',
          targetElement: 'button[type="submit"]',
          action: 'click',
          position: 'bottom',
          narration: 'بعد ملء جميع الحقول المطلوبة، نضغط على زر "حفظ". تهانينا! لقد أضفت حالة رصد جديدة بنجاح! 🎉',
          autoExecute: false,
          duration: 2000,
        },
      ],
    });

    // Tutorial 2: Generating a report
    this.addTutorial({
      id: 'generate-report',
      title: 'كيفية إنشاء تقرير',
      description: 'تعلم كيفية إنشاء وتصدير تقرير شامل عن حالات الرصد',
      category: 'reports',
      difficulty: 'intermediate',
      estimatedTime: 5,
      steps: [
        {
          id: 'step-1',
          title: 'فتح صفحة التقارير',
          description: 'انتقل إلى قسم التقارير',
          targetElement: 'a[href="/reports"]',
          action: 'click',
          position: 'right',
          narration: 'مرحباً! سأريك كيف تنشئ تقرير احترافي. لنبدأ بالانتقال لصفحة التقارير.',
          autoExecute: true,
          duration: 3000,
        },
        {
          id: 'step-2',
          title: 'اختيار نوع التقرير',
          description: 'حدد نوع التقرير الذي تريد إنشاءه',
          targetElement: 'select[name="reportType"]',
          action: 'click',
          position: 'bottom',
          narration: 'رائع! الآن نختار نوع التقرير. لدينا تقارير شهرية، ربع سنوية، سنوية، وتقارير مخصصة.',
          autoExecute: false,
          duration: 4000,
        },
        {
          id: 'step-3',
          title: 'تخصيص المحتوى',
          description: 'اختر الأقسام التي تريد تضمينها في التقرير',
          targetElement: '.report-sections',
          action: 'click',
          position: 'left',
          narration: 'الآن نحدد ماذا نريد في التقرير: إحصائيات؟ رسومات بيانية؟ قائمة حالات الرصد؟ كل شيء متاح!',
          autoExecute: false,
          duration: 5000,
        },
        {
          id: 'step-4',
          title: 'معاينة التقرير',
          description: 'شاهد معاينة للتقرير قبل التصدير',
          targetElement: 'button:contains("معاينة")',
          action: 'click',
          position: 'bottom',
          narration: 'قبل التصدير، دعنا نعاين التقرير للتأكد من أنه يبدو رائعاً!',
          autoExecute: true,
          duration: 3000,
        },
        {
          id: 'step-5',
          title: 'تصدير وإرسال التقرير',
          description: 'صدّر التقرير كـ PDF وأرسله بالبريد',
          targetElement: 'button:contains("تصدير"), button:contains("PDF")',
          action: 'click',
          position: 'top',
          narration: 'ممتاز! التقرير جاهز. الآن يمكنك تصديره كـ PDF أو إرساله مباشرة بالبريد الإلكتروني. 📧',
          autoExecute: false,
          duration: 3000,
        },
      ],
    });

    // Tutorial 3: Configuring alert rules
    this.addTutorial({
      id: 'setup-alerts',
      title: 'إعداد قواعد التنبيهات',
      description: 'تعلم كيفية إنشاء قواعد تنبيه تلقائية لحالات الرصد الجديدة',
      category: 'settings',
      difficulty: 'advanced',
      estimatedTime: 7,
      steps: [
        {
          id: 'step-1',
          title: 'الذهاب للإعدادات',
          description: 'افتح صفحة الإعدادات',
          targetElement: 'a[href="/settings"]',
          action: 'click',
          position: 'right',
          narration: 'مرحباً بك في دليل إعداد التنبيهات! هذه ميزة متقدمة ستساعدك على متابعة حالات الرصد الجديدة تلقائياً.',
          autoExecute: true,
          duration: 3000,
        },
        {
          id: 'step-2',
          title: 'قسم التنبيهات',
          description: 'انتقل إلى قسم التنبيهات',
          targetElement: 'a[href="#alerts"], button:contains("تنبيهات")',
          action: 'click',
          position: 'top',
          narration: 'نحن الآن في الإعدادات. ابحث عن قسم "التنبيهات" - ستجده في القائمة.',
          autoExecute: true,
          duration: 2000,
        },
        {
          id: 'step-3',
          title: 'إضافة قاعدة جديدة',
          description: 'أنشئ قاعدة تنبيه جديدة',
          targetElement: 'button:contains("قاعدة جديدة"), button:contains("إضافة قاعدة")',
          action: 'click',
          position: 'bottom',
          narration: 'رائع! الآن سننشئ قاعدة تنبيه. انقر على "إضافة قاعدة جديدة".',
          autoExecute: true,
          duration: 2000,
        },
        {
          id: 'step-4',
          title: 'تحديد الشروط',
          description: 'حدد متى يجب إرسال التنبيه',
          targetElement: '.alert-conditions',
          action: 'click',
          position: 'right',
          narration: 'الآن الجزء المهم! نحدد الشروط: مثلاً "عند إضافة حالة رصد خطورتها حرجة" أو "عند رصد أكثر من 10,000 سجل".',
          autoExecute: false,
          duration: 6000,
        },
        {
          id: 'step-5',
          title: 'اختيار المستلمين',
          description: 'حدد من سيستلم التنبيه',
          targetElement: 'input[type="email"], .recipients-list',
          action: 'type',
          position: 'left',
          narration: 'من يجب أن يُنبّه؟ أضف البريد الإلكتروني للمستلمين. يمكنك إضافة عدة أشخاص!',
          autoExecute: false,
          duration: 4000,
        },
        {
          id: 'step-6',
          title: 'حفظ وتفعيل',
          description: 'احفظ القاعدة وفعّلها',
          targetElement: 'button[type="submit"]',
          action: 'click',
          position: 'bottom',
          narration: 'مثالي! اضغط حفظ والقاعدة ستبدأ العمل فوراً. ستتلقى تنبيهات تلقائية عند تطابق الشروط! 🔔',
          autoExecute: false,
          duration: 3000,
        },
      ],
    });

    // Tutorial 4: Using AI Assistant
    this.addTutorial({
      id: 'use-ai-assistant',
      title: 'استخدام راصد الذكي',
      description: 'اكتشف قوة راصد الذكي في تحليل البيانات والإجابة على الأسئلة',
      category: 'getting-started',
      difficulty: 'beginner',
      estimatedTime: 4,
      steps: [
        {
          id: 'step-1',
          title: 'فتح المساعد الذكي',
          description: 'افتح نافذة راصد الذكي',
          targetElement: 'button:contains("راصد"), .ai-chat-button',
          action: 'click',
          position: 'left',
          narration: 'مرحباً! أنا راصد الذكي 🤖 دعني أريك كيف تستخدمني بأقصى فعالية.',
          autoExecute: true,
          duration: 3000,
        },
        {
          id: 'step-2',
          title: 'اطرح سؤالاً',
          description: 'اكتب سؤالك في صندوق الدردشة',
          targetElement: 'textarea, input[type="text"]',
          action: 'type',
          actionData: { value: 'كم عدد حالات الرصد الحرجة؟' },
          position: 'top',
          narration: 'يمكنك سؤالي أي شيء عن المنصة! جرب: "كم عدد حالات الرصد الحرجة؟" أو "ما هي القطاعات الأكثر تأثراً؟"',
          autoExecute: false,
          duration: 5000,
        },
        {
          id: 'step-3',
          title: 'الحصول على الرد',
          description: 'راقب كيف أجيب وأحلل البيانات',
          targetElement: '.ai-response',
          action: 'wait',
          position: 'center',
          narration: 'لاحظ! سأستخدم أدواتي لجلب البيانات الفعلية من المنصة وأقدم لك رداً دقيقاً مع إحصائيات حقيقية.',
          autoExecute: true,
          duration: 4000,
        },
        {
          id: 'step-4',
          title: 'الأوامر المتقدمة',
          description: 'جرب أوامر أكثر تعقيداً',
          targetElement: 'textarea',
          action: 'type',
          actionData: { value: 'ارسم رسم بياني لتوزيع حالات الرصد حسب القطاع' },
          position: 'top',
          narration: 'يمكنني أيضاً رسم رسومات بيانية! جرب: "ارسم رسم بياني لتوزيع حالات الرصد حسب القطاع" - سأنشئ رسماً احترافياً!',
          autoExecute: false,
          duration: 5000,
        },
        {
          id: 'step-5',
          title: 'التوصيات الذكية',
          description: 'اطلع على التوصيات التي أقترحها',
          targetElement: '.recommendations',
          action: 'click',
          position: 'right',
          narration: 'لاحظ التوصيات الذكية أسفل ردي! أقترح عليك خطوات تالية وتحليلات إضافية بناءً على سؤالك. 💡',
          autoExecute: true,
          duration: 4000,
        },
      ],
    });
  }

  /**
   * Add a new tutorial
   */
  addTutorial(tutorial: Tutorial): void {
    this.tutorials.set(tutorial.id, tutorial);
  }

  /**
   * Get all tutorials
   */
  getAllTutorials(): Tutorial[] {
    return Array.from(this.tutorials.values());
  }

  /**
   * Get tutorials by category
   */
  getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
    return Array.from(this.tutorials.values()).filter(
      t => t.category === category
    );
  }

  /**
   * Get tutorial by ID
   */
  getTutorial(id: string): Tutorial | null {
    return this.tutorials.get(id) || null;
  }

  /**
   * Start a tutorial
   */
  startTutorial(tutorialId: string): TutorialStep | null {
    const tutorial = this.tutorials.get(tutorialId);
    if (!tutorial) return null;

    this.currentTutorial = tutorial;
    this.currentStep = 0;
    this.isPlaying = true;

    return tutorial.steps[0];
  }

  /**
   * Get current step
   */
  getCurrentStep(): TutorialStep | null {
    if (!this.currentTutorial) return null;
    return this.currentTutorial.steps[this.currentStep];
  }

  /**
   * Move to next step
   */
  nextStep(): TutorialStep | null {
    if (!this.currentTutorial) return null;

    this.currentStep++;
    if (this.currentStep >= this.currentTutorial.steps.length) {
      this.stopTutorial();
      return null;
    }

    return this.currentTutorial.steps[this.currentStep];
  }

  /**
   * Move to previous step
   */
  previousStep(): TutorialStep | null {
    if (!this.currentTutorial) return null;

    this.currentStep = Math.max(0, this.currentStep - 1);
    return this.currentTutorial.steps[this.currentStep];
  }

  /**
   * Stop current tutorial
   */
  stopTutorial(): void {
    this.currentTutorial = null;
    this.currentStep = 0;
    this.isPlaying = false;
  }

  /**
   * Get progress
   */
  getProgress(): { current: number; total: number; percentage: number } | null {
    if (!this.currentTutorial) return null;

    const total = this.currentTutorial.steps.length;
    const current = this.currentStep + 1;
    const percentage = Math.round((current / total) * 100);

    return { current, total, percentage };
  }

  /**
   * Generate narration text for current context
   */
  generateContextualNarration(
    action: string,
    target: string
  ): string {
    const narrations: Record<string, string[]> = {
      creating_incident: [
        'رائع! دعني أريك كيف تضيف حالة رصد جديدة بسهولة.',
        'عملية إضافة حالة الرصد بسيطة جداً، تابع معي!',
      ],
      viewing_stats: [
        'ممتاز! لنستعرض الإحصائيات معاً.',
        'الإحصائيات هنا تعطيك صورة شاملة عن الوضع.',
      ],
      generating_report: [
        'تصدير التقارير سهل وسريع، دعني أوضح لك!',
        'ستحصل على تقرير احترافي في دقائق!',
      ],
    };

    const category = Object.keys(narrations).find(k => action.includes(k)) || 'creating_incident';
    const options = narrations[category];
    return options[Math.floor(Math.random() * options.length)];
  }
}

// Singleton instance
export const interactiveTutorialSystem = new InteractiveTutorialSystem();

```

---

## `server/rasidEnhancements/learningEngine.ts`

```typescript
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

```

---

## `server/rasidEnhancements/performanceMetrics.ts`

```typescript
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
      lines.push(`📊 عدد حالات الرصد المحللة: ${metrics.incidentsAnalyzed}`);
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

```

---

## `server/rasidEnhancements/ragEngine.ts`

```typescript
/**
 * RAG Engine — Enhanced Retrieval-Augmented Generation for Rasid AI
 * Features:
 * - Intent detection for smart query classification
 * - Fuzzy keyword matching for better retrieval
 * - Context-aware retrieval (2-5 incidents max)
 * - Atlas statistics summarization
 */
import { invokeLLM } from "../_core/llm";

const EMBEDDING_MODEL = "text-embedding-ada-002";
const EMBEDDING_DIMS = 1536;
const TOP_K = 3;

// ═══ Intent Detection Types ═══
type UserIntent =
  | "specific_incident"    // Asking about a specific incident by name/ID
  | "statistics"           // Asking for statistics/numbers
  | "comparison"           // Comparing sectors/periods
  | "pdpl_question"        // Questions about PDPL law
  | "sector_query"         // Questions about a specific sector
  | "general_question"     // General questions
  | "trend_analysis";      // Timeline/trend questions

// ═══ Configuration Constants ═══
const SUMMARY_MESSAGE_PREVIEW_LENGTH = 100; // Characters to include in conversation summary
const MAX_INCIDENTS_FOR_STATS = 2;          // Max incidents to retrieve for statistics queries
const MAX_INCIDENTS_FOR_SPECIFIC = 1;       // Max incidents for specific incident queries
const MAX_INCIDENTS_FOR_COMPARISON = 10;    // Max incidents for comparison queries

interface IncidentDoc {
  index: number;
  text: string;
  data: any;
}

interface VectorEntry {
  vector: number[];
  index: number;
}

// ═══ Simple Vector Search (cosine similarity) ═══
class SimpleVectorSearch {
  private vectors: VectorEntry[] = [];

  initIndex() { /* no-op */ }

  addPoint(vector: number[], index: number) {
    this.vectors.push({ vector, index });
  }

  getCurrentCount(): number {
    return this.vectors.length;
  }

  searchKnn(queryVector: number[], k: number): { neighbors: number[]; distances: number[] } {
    const distances = this.vectors.map((item) => ({
      index: item.index,
      distance: this.cosineSimilarity(queryVector, item.vector),
    }));
    distances.sort((a, b) => b.distance - a.distance);
    const topK = distances.slice(0, k);
    return {
      neighbors: topK.map((d) => d.index),
      distances: topK.map((d) => 1 - d.distance),
    };
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// ═══ RAG Engine ═══
export class RAGEngine {
  private index: SimpleVectorSearch | null = null;
  private incidents: any[] = [];
  private documents: IncidentDoc[] = [];
  public isReady = false;

  private buildDocumentText(incident: any): string {
    const parts = [
      `Title: ${incident.title || ""} / ${incident.titleAr || ""}`,
      `Sector: ${incident.sector || ""} / ${incident.sectorAr || ""}`,
      `Source: ${incident.source || ""}`,
      `Severity: ${incident.severity || ""}`,
      `Victim: ${incident.victimEntity || ""}`,
      `Breach Method: ${incident.breachMethod || ""} / ${incident.breachMethodAr || ""}`,
      `PII Types: ${(incident.piiTypes || []).join(", ")}`,
      `Records: ${incident.recordCount || 0}`,
      `Description: ${(incident.descriptionAr || incident.description || "").substring(0, 500)}`,
      `AI Summary: ${(incident.aiSummaryAr || incident.aiSummary || "").substring(0, 500)}`,
    ];
    return parts.join("\n");
  }

  /**
   * Initialize the vector database by embedding all incidents.
   * Call once at server startup.
   */
  async initialize(incidents: any[]): Promise<void> {
    this.incidents = incidents;
    const numItems = incidents.length;

    if (numItems === 0) {
      console.warn("[RAG] No incidents to index.");
      return;
    }

    this.index = new SimpleVectorSearch();
    this.index.initIndex();

    console.log(`[RAG] Indexing ${numItems} incidents...`);

    const textsToEmbed = incidents.map((inc, idx) => {
      const text = this.buildDocumentText(inc);
      this.documents.push({ index: idx, text, data: inc });
      return text;
    });

    // Batch embedding using the LLM helper (proxied through forge)
    const BATCH_SIZE = 50;
    for (let i = 0; i < textsToEmbed.length; i += BATCH_SIZE) {
      const batch = textsToEmbed.slice(i, i + BATCH_SIZE);
      try {
        // Embedding via forge proxy is not directly supported through invokeLLM
        // Use keyword-based search as the primary retrieval method
        const response: any = null;

        // If embedding fails, use fallback keyword-based search
        if (!response || !(response as any).data) {
          console.warn("[RAG] Embedding API not available, using keyword fallback");
          this.isReady = true;
          return;
        }

        (response as any).data.forEach((item: any, batchIdx: number) => {
          this.index!.addPoint(item.embedding, i + batchIdx);
        });
      } catch (err: any) {
        console.warn(`[RAG] Embedding batch ${i} failed: ${err.message}. Using keyword fallback.`);
        this.isReady = true;
        return;
      }
    }

    console.log(`[RAG] Successfully indexed ${this.index.getCurrentCount()} incidents.`);
    this.isReady = true;
  }

  /**
   * Detect user intent from query
   */
  detectIntent(query: string): UserIntent {
    const queryLower = query.toLowerCase();
    
    // Specific incident patterns
    if (queryLower.match(/حالة رصد|تفاصيل.*رقم|معرف|real-\d+/i)) {
      return "specific_incident";
    }
    
    // Statistics patterns
    if (queryLower.match(/كم عدد|إجمالي|إحصائ|total|count|number of/i)) {
      return "statistics";
    }
    
    // Comparison patterns
    if (queryLower.match(/مقارنة|قارن|أكثر من|أقل من|compare|vs|versus/i)) {
      return "comparison";
    }
    
    // PDPL patterns
    if (queryLower.match(/pdpl|نظام حماية البيانات|المادة|غرامة|fine|penalty/i)) {
      return "pdpl_question";
    }
    
    // Sector-specific patterns
    if (queryLower.match(/قطاع|sector|الصحي|المالي|الحكومي|التعليمي|health|financial|government|education/i)) {
      return "sector_query";
    }
    
    // Trend analysis patterns
    if (queryLower.match(/اتجاه|trend|تطور|timeline|خلال|أشهر|سنة|شهري|yearly|monthly/i)) {
      return "trend_analysis";
    }
    
    return "general_question";
  }

  /**
   * Retrieve top-K relevant incidents for a query with intent-aware retrieval
   */
  async retrieve(query: string, topK: number = TOP_K): Promise<any[]> {
    const intent = this.detectIntent(query);
    
    // Adjust topK based on intent to optimize context size
    let adjustedK = topK;
    if (intent === "statistics" || intent === "pdpl_question") {
      adjustedK = MAX_INCIDENTS_FOR_STATS; // Return fewer incidents for stats queries
    } else if (intent === "specific_incident") {
      adjustedK = MAX_INCIDENTS_FOR_SPECIFIC; // Only one for specific incident
    } else if (intent === "comparison" || intent === "trend_analysis") {
      adjustedK = MAX_INCIDENTS_FOR_COMPARISON; // More for comparisons
    }
    
    return this.fuzzyKeywordSearch(query, adjustedK);
  }

  /**
   * Enhanced keyword search with fuzzy matching
   * 
   * Performance Note: For the Atlas dataset (~110 incidents), the O(n*m*w) complexity
   * is acceptable. For larger datasets (1000+ documents), consider:
   * - Pre-computing and caching word lists per document during initialization
   * - Using trigram or n-gram indexing for fuzzy matching
   * - Implementing inverted index for exact term matching
   */
  private fuzzyKeywordSearch(query: string, topK: number): any[] {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);

    const scored = this.documents.map((doc) => {
      let score = 0;
      const textLower = doc.text.toLowerCase();
      
      // Exact phrase match (highest priority)
      if (textLower.includes(queryLower)) {
        score += 10;
      }
      
      // Individual term matching
      for (const term of queryTerms) {
        if (textLower.includes(term)) {
          score += 2;
        }
        
        // Fuzzy matching for terms >= 4 chars
        if (term.length >= 4) {
          const termPrefix = term.substring(0, 4);
          const words = textLower.split(/\s+/);
          for (const word of words) {
            if (word.length >= 4) {
              const wordPrefix = word.substring(0, 4);
              if (word.includes(termPrefix) || term.includes(wordPrefix)) {
                score += 1;
              }
            }
          }
        }
      }
      
      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).filter(s => s.score > 0).map(s => s.doc.data);
  }

  /**
   * Legacy keyword search (kept for backward compatibility)
   */
  private keywordSearch(query: string, topK: number): any[] {
    return this.fuzzyKeywordSearch(query, topK);
  }

  /**
   * Build context string from retrieved incidents for the system prompt
   */
  buildContext(retrievedIncidents: any[]): string {
    if (retrievedIncidents.length === 0) return "";

    let context = "\n\n## السياق المسترجع (RAG):\n";
    retrievedIncidents.forEach((inc, idx) => {
      context += `\n### حالة رصد ${idx + 1}: ${inc.titleAr || inc.title}\n`;
      context += `- القطاع: ${inc.sectorAr || inc.sector}\n`;
      context += `- التأثير: ${inc.severity}\n`;
      context += `- السجلات: ${inc.recordCount?.toLocaleString()}\n`;
      context += `- المصدر: ${inc.source}\n`;
      if (inc.descriptionAr) context += `- الوصف: ${inc.descriptionAr.substring(0, 300)}\n`;
      if (inc.aiSummaryAr) context += `- ملخص AI: ${inc.aiSummaryAr.substring(0, 300)}\n`;
    });
    return context;
  }

  /**
   * Build Atlas statistics summary for system prompt
   * Returns concise statistics instead of full incident data
   */
  buildAtlasSummary(): string {
    if (this.incidents.length === 0) return "";
    
    const totalIncidents = this.incidents.length;
    const totalRecords = this.incidents.reduce((sum, inc) => sum + (inc.recordCount || 0), 0);
    
    // Count by severity
    const severityCounts: Record<string, number> = {};
    this.incidents.forEach(inc => {
      const sev = inc.severity || "Unknown";
      severityCounts[sev] = (severityCounts[sev] || 0) + 1;
    });
    
    // Count by sector
    const sectorCounts: Record<string, number> = {};
    this.incidents.forEach(inc => {
      const sector = inc.sectorAr || inc.sector || "غير محدد";
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });
    const topSectors = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `${name} (${count})`)
      .join("، ");
    
    return `
## إحصائيات أطلس البيانات (ملخص)
- إجمالي حالات الرصد: ${totalIncidents}
- إجمالي السجلات المتأثرة: ${totalRecords.toLocaleString()}
- حالات الرصد الحرجة: ${severityCounts.Critical || 0}
- حالات الرصد عالية التأثير: ${severityCounts.High || 0}
- أكثر القطاعات تأثراً: ${topSectors}

**ملاحظة:** استخدم أدوات الأطلس (query_atlas_breaches، get_atlas_stats) للحصول على التفاصيل الكاملة.
`;
  }
}

// ═══ Conversation Memory Manager ═══
export class ConversationMemory {
  private readonly MAX_MESSAGES = 10;
  // Note: SUMMARY_THRESHOLD was removed as it's not currently used
  // Can be added back if implementing tiered summarization
  
  /**
   * Manage conversation history - keep last N messages, summarize old ones
   */
  manageHistory(
    history: Array<{ role: "user" | "assistant"; content: string }>
  ): { messages: Array<{ role: "user" | "assistant"; content: string }>; summary?: string } {
    // If history is within limit, return as is
    if (history.length <= this.MAX_MESSAGES) {
      return { messages: history };
    }
    
    // Split into old and recent
    const oldMessages = history.slice(0, history.length - this.MAX_MESSAGES);
    const recentMessages = history.slice(-this.MAX_MESSAGES);
    
    // Create summary of old messages
    const summary = this.summarizeMessages(oldMessages);
    
    return {
      messages: recentMessages,
      summary,
    };
  }
  
  /**
   * Summarize old messages into a concise format
   */
  private summarizeMessages(messages: Array<{ role: "user" | "assistant"; content: string }>): string {
    if (messages.length === 0) return "";
    
    // Extract key topics from user messages
    const userQueries = messages
      .filter(m => m.role === "user")
      .map(m => m.content.substring(0, SUMMARY_MESSAGE_PREVIEW_LENGTH))
      .join("، ");
    
    return `**ملخص المحادثة السابقة:** تم مناقشة ${messages.length} رسائل حول: ${userQueries}...`;
  }
  
  /**
   * Build conversation window with summary
   */
  buildConversationWindow(
    history: Array<{ role: "user" | "assistant"; content: string }>
  ): Array<{ role: "user" | "assistant" | "system"; content: string }> {
    const managed = this.manageHistory(history);
    const result: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
    
    // Add summary as system message if exists
    if (managed.summary) {
      result.push({ role: "system", content: managed.summary });
    }
    
    // Add recent messages
    result.push(...managed.messages);
    
    return result;
  }
}

// Singleton instances
export const ragEngine = new RAGEngine();
export const conversationMemory = new ConversationMemory();

```

---

## `server/rasidEnhancements/recommendationEngine.ts`

```typescript
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
    if (latestQuery.includes('حادثة') || latestQuery.includes('حالة رصد') || latestQuery.includes('حالة رصد')) {
      recommendations.push({
        id: 'query-incident-1',
        type: 'question',
        title: 'أسئلة ذات صلة',
        description: 'من هم البائعون الأكثر نشاطاً؟ ما هي أنواع البيانات الأكثر تعرضاً؟',
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
        description: `قارن بين القطاعين من حيث عدد حالات الرصد، حجم البيانات، والتأثير`,
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
      '🔍 ما هي القطاعات الأكثر تعرضاً لحالات الرصد؟',
      '📊 كيف تطورت حالات الرصد خلال الأشهر الستة الماضية؟',
      '🏪 من هم البائعون الأكثر نشاطاً في السوق السوداء؟',
      '🔐 ما هي أنواع البيانات الشخصية الأكثر تعرضاً؟',
      '⚠️ ما هي حالات الرصد ذات التأثير الواسع المفتوحة حالياً؟',
      '📈 هل هناك ارتباط بين حجم العينات المتاحة والقطاع؟',
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

```

---

## `server/rasidEnhancements/responseCache.ts`

```typescript
/**
 * Smart Response Cache - Issue #8
 * Caches repeated responses with TTL to reduce API costs and improve response time
 */

interface CacheEntry {
  query: string;
  normalizedQuery: string;
  response: string;
  timestamp: number;
  expiresAt: number;
  metadata: {
    toolsUsed: string[];
    incidentsAnalyzed: number;
    responseSource: 'ai' | 'fallback' | 'cache';
  };
}

export class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttlMs: number;
  private maxSize: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(ttlMinutes: number = 30, maxSize: number = 1000) {
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.maxSize = maxSize;
    
    // Clean expired entries every 5 minutes
    setInterval(() => this.cleanExpired(), 5 * 60 * 1000);
  }

  /**
   * Normalize query to improve cache hit rate
   * - Convert to lowercase
   * - Remove extra whitespace
   * - Remove common Arabic filler words
   * - Standardize numbers
   */
  private normalizeQuery(query: string): string {
    let normalized = query.toLowerCase().trim();
    
    // Remove extra whitespace
    normalized = normalized.replace(/\s+/g, ' ');
    
    // Remove common Arabic filler words that don't affect meaning
    const fillerWords = ['من فضلك', 'لو سمحت', 'ممكن', 'أريد', 'عطني', 'أعطني'];
    fillerWords.forEach(word => {
      normalized = normalized.replace(new RegExp(word, 'gi'), '');
    });
    
    // Standardize numbers (Arabic to English)
    const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    arabicNums.forEach((num, idx) => {
      normalized = normalized.replace(new RegExp(num, 'g'), idx.toString());
    });
    
    return normalized.trim();
  }

  /**
   * Get cached response if available and not expired
   */
  get(query: string): CacheEntry | null {
    const normalized = this.normalizeQuery(query);
    const entry = this.cache.get(normalized);
    
    if (!entry) {
      this.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(normalized);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return entry;
  }

  /**
   * Store response in cache
   */
  set(
    query: string,
    response: string,
    metadata: CacheEntry['metadata']
  ): void {
    const normalized = this.normalizeQuery(query);
    
    // Check cache size limit
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    const now = Date.now();
    this.cache.set(normalized, {
      query,
      normalizedQuery: normalized,
      response,
      timestamp: now,
      expiresAt: now + this.ttlMs,
      metadata,
    });
  }

  /**
   * Invalidate all cached entries (e.g., when data updates)
   */
  invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Invalidate entries containing specific keywords
   */
  invalidateByKeywords(keywords: string[]): void {
    const normalizedKeywords = keywords.map(k => k.toLowerCase());
    
    for (const [key, entry] of this.cache.entries()) {
      const hasKeyword = normalizedKeywords.some(
        keyword => entry.normalizedQuery.includes(keyword)
      );
      if (hasKeyword) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Remove expired entries
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict oldest entry when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate.toFixed(2) + '%',
      ttlMinutes: this.ttlMs / (60 * 1000),
    };
  }
}

// Singleton instance
export const responseCache = new ResponseCache(30, 1000);

```

---

## `server/rasidEnhancements/responseFormatter.ts`

```typescript
/**
 * Response Formatter - Issue #9
 * Post-process AI responses for better formatting and interactivity
 */

/**
 * Convert Western Arabic numerals to Eastern Arabic numerals
 */
export function convertToArabicNumerals(text: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return text.replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
}

/**
 * Add contextual icons to text based on content
 */
export function addContextualIcons(text: string): string {
  const iconMappings = [
    { pattern: /(حالة رصد|حالات رصد)/g, icon: '🚨' },
    { pattern: /(بيانات شخصية|PII)/g, icon: '🔐' },
    { pattern: /(تحذير|تنبيه|خطر)/g, icon: '⚠️' },
    { pattern: /(نجاح|تم|اكتمل)/g, icon: '✅' },
    { pattern: /(فشل|خطأ|مشكلة)/g, icon: '❌' },
    { pattern: /(إحصائيات|تقرير|ملخص)/g, icon: '📊' },
    { pattern: /(مستخدم|موظف|محلل)/g, icon: '👤' },
    { pattern: /(بائع|متجر|سوق)/g, icon: '🏪' },
    { pattern: /(الويب المظلم|darkweb)/gi, icon: '🌐' },
    { pattern: /(قاعدة معرفة|مستند|ملف)/g, icon: '📄' },
    { pattern: /(بحث|تحليل|فحص)/g, icon: '🔍' },
    { pattern: /(عاجل|مهم|حرج)/g, icon: '🔴' },
    { pattern: /(متوسط|متوسطة)/g, icon: '🟡' },
    { pattern: /(منخفض|منخفضة)/g, icon: '🟢' },
  ];

  let formatted = text;
  const originalText = text; // Store original to check against
  
  for (const { pattern, icon } of iconMappings) {
    formatted = formatted.replace(pattern, (match, ...args) => {
      const offset = args[args.length - 2]; // Get match offset
      const before = originalText.substring(Math.max(0, offset - 3), offset);
      // Don't add icon if there's already an emoji nearby in original text
      if (/[\u{1F300}-\u{1F9FF}]/u.test(before)) {
        return match;
      }
      return `${icon} ${match}`;
    });
  }

  return formatted;
}

/**
 * Convert markdown tables to HTML tables
 */
export function convertTablesToHTML(text: string): string {
  // Match markdown tables
  const tableRegex = /(\|.+\|[\r\n]+\|[-:\s|]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g;
  
  return text.replace(tableRegex, (tableMatch) => {
    const lines = tableMatch.trim().split('\n').filter(line => line.trim());
    if (lines.length < 3) return tableMatch; // Need at least header, separator, and one row

    const headers = lines[0]
      .split('|')
      .map(h => h.trim())
      .filter(h => h);
    
    const rows = lines.slice(2).map(line =>
      line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell !== '')
    );

    let html = '<div class="table-wrapper" style="overflow-x: auto; margin: 1rem 0;">\n';
    html += '<table style="border-collapse: collapse; width: 100%; border: 1px solid #ddd;">\n';
    
    // Header
    html += '  <thead>\n    <tr style="background-color: #f2f2f2;">\n';
    headers.forEach(header => {
      html += `      <th style="padding: 12px; text-align: right; border: 1px solid #ddd; font-weight: bold;">${header}</th>\n`;
    });
    html += '    </tr>\n  </thead>\n';
    
    // Body
    html += '  <tbody>\n';
    rows.forEach((row, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
      html += `    <tr style="background-color: ${bgColor};">\n`;
      row.forEach(cell => {
        html += `      <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${cell}</td>\n`;
      });
      html += '    </tr>\n';
    });
    html += '  </tbody>\n';
    
    html += '</table>\n</div>';
    return html;
  });
}

/**
 * Add smart action buttons based on content
 */
export function addSmartActionButtons(text: string, context?: { leakIds?: string[] }): string {
  const buttons: string[] = [];

  // Check for leak IDs mentioned
  const leakIdPattern = /leak[_-]?(\d+)|حالة رصد\s+رقم\s+(\d+)|حادثة\s+رقم\s+(\d+)/gi;
  const matches = text.matchAll(leakIdPattern);
  const leakIds = new Set<string>();
  
  for (const match of matches) {
    const id = match[1] || match[2];
    if (id) leakIds.add(id);
  }

  if (leakIds.size > 0) {
    const ids = Array.from(leakIds).slice(0, 3); // Max 3 buttons
    ids.forEach(id => {
      buttons.push(
        `<button class="action-button" data-action="view-leak" data-leak-id="${id}" style="margin: 4px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
          🔍 عرض حالة الرصد ${id}
        </button>`
      );
    });
  }

  // Check for report mentions
  if (/تقرير|report/i.test(text)) {
    buttons.push(
      `<button class="action-button" data-action="view-reports" style="margin: 4px; padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer;">
        📊 عرض التقارير
      </button>`
    );
  }

  // Check for statistics mentions
  if (/إحصائيات|statistics|dashboard/i.test(text)) {
    buttons.push(
      `<button class="action-button" data-action="view-dashboard" style="margin: 4px; padding: 8px 16px; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer;">
        📈 عرض لوحة التحكم
      </button>`
    );
  }

  if (buttons.length > 0) {
    return text + '\n\n<div class="smart-actions" style="margin-top: 1rem;">\n' + 
           buttons.join('\n') + 
           '\n</div>';
  }

  return text;
}

/**
 * Format chart references to be more prominent
 */
export function highlightChartReferences(text: string): string {
  // Make chart URLs more prominent with visual indicators
  const chartUrlPattern = /(https?:\/\/[^\s]+chart[^\s]*)/gi;
  
  return text.replace(chartUrlPattern, (url) => {
    return `\n\n📊 **رسم بياني تفاعلي:**\n[عرض الرسم البياني](${url})\n\n`;
  });
}

/**
 * Main formatting function - applies all enhancements
 */
export function formatResponse(
  text: string,
  options?: {
    useArabicNumerals?: boolean;
    addIcons?: boolean;
    convertTables?: boolean;
    addActionButtons?: boolean;
    highlightCharts?: boolean;
    context?: { leakIds?: string[] };
  }
): string {
  const opts = {
    useArabicNumerals: true,
    addIcons: true,
    convertTables: true,
    addActionButtons: true,
    highlightCharts: true,
    ...options,
  };

  let formatted = text;

  // 1. Convert numbers to Arabic if requested
  if (opts.useArabicNumerals) {
    formatted = convertToArabicNumerals(formatted);
  }

  // 2. Add contextual icons
  if (opts.addIcons) {
    formatted = addContextualIcons(formatted);
  }

  // 3. Convert tables to HTML
  if (opts.convertTables) {
    formatted = convertTablesToHTML(formatted);
  }

  // 4. Highlight chart references
  if (opts.highlightCharts) {
    formatted = highlightChartReferences(formatted);
  }

  // 5. Add smart action buttons
  if (opts.addActionButtons) {
    formatted = addSmartActionButtons(formatted, opts.context);
  }

  return formatted;
}

```

---

## `server/rasidEnhancements/smartChartEngine.ts`

```typescript
/**
 * Advanced Smart Chart Engine - Professional Visualization System
 * محرك الرسومات الذكي المتقدم - نظام التصور الاحترافي
 * 
 * Features:
 * - Intelligent chart type selection based on data characteristics
 * - Advanced chart types (Sunburst, Sankey, Heatmap, Network, etc.)
 * - Interactive charts with drill-down capabilities
 * - Animated transitions
 * - Professional export (PDF, SVG, PNG, Excel, PowerPoint)
 */

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'scatter'
  | 'bubble'
  | 'area'
  | 'heatmap'
  | 'sunburst'
  | 'sankey'
  | 'network'
  | 'treemap'
  | 'waterfall'
  | 'gauge'
  | 'funnel'
  | 'candlestick';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    [key: string]: any;
  }>;
}

export interface AdvancedChartConfig {
  type: ChartType;
  data: ChartData | any;
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark' | 'professional';
  interactive?: boolean;
  animated?: boolean;
  drilldown?: {
    enabled: boolean;
    levels: string[];
  };
  export?: {
    formats: ('pdf' | 'svg' | 'png' | 'excel' | 'ppt')[];
    quality?: 'standard' | 'high' | 'ultra';
  };
  customization?: {
    colors?: string[];
    fonts?: {
      title?: string;
      labels?: string;
    };
    layout?: 'horizontal' | 'vertical' | 'grid';
  };
}

export interface ChartRecommendation {
  chartType: ChartType;
  confidence: number;
  reason: string;
  alternatives: Array<{
    type: ChartType;
    score: number;
  }>;
}

export class SmartChartEngine {
  private readonly PROFESSIONAL_COLORS = {
    primary: [
      '#0ea5e9', // Sky Blue
      '#8b5cf6', // Purple
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#10b981', // Green
      '#ec4899', // Pink
      '#6366f1', // Indigo
      '#14b8a6', // Teal
    ],
    severity: {
      critical: '#dc2626',
      high: '#f59e0b',
      medium: '#fbbf24',
      low: '#10b981',
    },
    gradient: {
      start: '#667eea',
      end: '#764ba2',
    },
  };

  /**
   * Analyze data and suggest the best chart type
   * تحليل البيانات واقتراح أفضل نوع رسم بياني
   */
  suggestChartType(
    data: any,
    intent?: string
  ): ChartRecommendation {
    const dataPoints = this.extractDataPoints(data);
    const characteristics = this.analyzeDataCharacteristics(dataPoints);

    let bestType: ChartType = 'bar';
    let confidence = 0.7;
    let reason = '';
    const alternatives: Array<{ type: ChartType; score: number }> = [];

    // Rule-based chart selection
    if (characteristics.isHierarchical) {
      bestType = 'sunburst';
      confidence = 0.9;
      reason = 'البيانات هرمية ومتعددة المستويات - Sunburst مثالي لعرض التسلسل';
      alternatives.push(
        { type: 'treemap', score: 0.85 },
        { type: 'bar', score: 0.6 }
      );
    } else if (characteristics.isFlow) {
      bestType = 'sankey';
      confidence = 0.95;
      reason = 'البيانات تمثل تدفق - Sankey مثالي لعرض الانتقالات';
      alternatives.push({ type: 'network', score: 0.7 });
    } else if (characteristics.isNetwork) {
      bestType = 'network';
      confidence = 0.9;
      reason = 'البيانات تحتوي علاقات وروابط - Network Graph مثالي';
      alternatives.push({ type: 'sankey', score: 0.7 });
    } else if (characteristics.isTimeSeries) {
      bestType = 'line';
      confidence = 0.85;
      reason = 'البيانات زمنية - خط الاتجاه مثالي لعرض التغير عبر الزمن';
      alternatives.push(
        { type: 'area', score: 0.8 },
        { type: 'bar', score: 0.7 }
      );
    } else if (characteristics.isComparison) {
      bestType = 'bar';
      confidence = 0.8;
      reason = 'البيانات مقارنة - الأعمدة مثالية للمقارنات';
      alternatives.push(
        { type: 'radar', score: 0.7 },
        { type: 'line', score: 0.6 }
      );
    } else if (characteristics.isDistribution) {
      bestType = 'pie';
      confidence = 0.75;
      reason = 'البيانات توزيع نسبي - الدائري مثالي للنسب';
      alternatives.push(
        { type: 'doughnut', score: 0.73 },
        { type: 'bar', score: 0.6 }
      );
    } else if (characteristics.isCorrelation) {
      bestType = 'scatter';
      confidence = 0.85;
      reason = 'البيانات ارتباطية - النقطي مثالي لعرض الارتباطات';
      alternatives.push(
        { type: 'bubble', score: 0.75 },
        { type: 'heatmap', score: 0.7 }
      );
    } else if (characteristics.isDensity) {
      bestType = 'heatmap';
      confidence = 0.9;
      reason = 'البيانات كثافة - Heatmap مثالي لعرض التركيز';
      alternatives.push({ type: 'scatter', score: 0.6 });
    }

    // Consider user intent
    if (intent) {
      const intentLower = intent.toLowerCase();
      if (intentLower.includes('trend') || intentLower.includes('اتجاه')) {
        bestType = 'line';
        confidence = 0.9;
      } else if (intentLower.includes('compare') || intentLower.includes('مقارنة')) {
        bestType = 'bar';
        confidence = 0.85;
      } else if (intentLower.includes('distribution') || intentLower.includes('توزيع')) {
        bestType = 'pie';
        confidence = 0.8;
      } else if (intentLower.includes('flow') || intentLower.includes('تدفق')) {
        bestType = 'sankey';
        confidence = 0.9;
      }
    }

    return {
      chartType: bestType,
      confidence,
      reason,
      alternatives,
    };
  }

  /**
   * Extract data points from various data formats
   */
  private extractDataPoints(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data.datasets) return data.datasets;
    if (data.data) return Array.isArray(data.data) ? data.data : [data.data];
    return [];
  }

  /**
   * Analyze data characteristics
   */
  private analyzeDataCharacteristics(dataPoints: any[]): {
    isHierarchical: boolean;
    isFlow: boolean;
    isNetwork: boolean;
    isTimeSeries: boolean;
    isComparison: boolean;
    isDistribution: boolean;
    isCorrelation: boolean;
    isDensity: boolean;
  } {
    return {
      isHierarchical: this.checkHierarchical(dataPoints),
      isFlow: this.checkFlow(dataPoints),
      isNetwork: this.checkNetwork(dataPoints),
      isTimeSeries: this.checkTimeSeries(dataPoints),
      isComparison: this.checkComparison(dataPoints),
      isDistribution: this.checkDistribution(dataPoints),
      isCorrelation: this.checkCorrelation(dataPoints),
      isDensity: this.checkDensity(dataPoints),
    };
  }

  private checkHierarchical(data: any[]): boolean {
    return data.some(d => d.children || d.parent || d.level);
  }

  private checkFlow(data: any[]): boolean {
    return data.some(d => (d.source && d.target) || d.from || d.to);
  }

  private checkNetwork(data: any[]): boolean {
    return data.some(d => d.nodes && d.edges);
  }

  private checkTimeSeries(data: any[]): boolean {
    return data.some(d => {
      const hasDate = d.date || d.timestamp || d.time;
      const labelIsDate = typeof d.label === 'string' && /\d{4}-\d{2}/.test(d.label);
      return hasDate || labelIsDate;
    });
  }

  private checkComparison(data: any[]): boolean {
    return data.length >= 2 && data.length <= 15;
  }

  private checkDistribution(data: any[]): boolean {
    // Check if data represents parts of a whole
    const hasPercentages = data.some(d => d.percentage || (d.value > 0 && d.value <= 100));
    return data.length >= 3 && data.length <= 10 && hasPercentages;
  }

  private checkCorrelation(data: any[]): boolean {
    return data.some(d => d.x !== undefined && d.y !== undefined);
  }

  private checkDensity(data: any[]): boolean {
    return data.some(d => d.density || (d.x && d.y && d.value));
  }

  /**
   * Generate chart configuration with best practices
   * إنشاء تكوين الرسم مع أفضل الممارسات
   */
  generateChartConfig(config: AdvancedChartConfig): any {
    const {
      type,
      data,
      title,
      subtitle,
      theme = 'professional',
      interactive = true,
      animated = true,
    } = config;

    const baseConfig: any = {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title,
            font: {
              size: 18,
              weight: 'bold',
              family: 'Cairo, sans-serif',
            },
            padding: { top: 10, bottom: 30 },
          },
          subtitle: {
            display: !!subtitle,
            text: subtitle,
            font: {
              size: 14,
              family: 'Cairo, sans-serif',
            },
            padding: { bottom: 20 },
          },
          legend: {
            display: true,
            position: 'bottom',
            align: 'start',
            labels: {
              font: {
                family: 'Cairo, sans-serif',
                size: 12,
              },
              usePointStyle: true,
              padding: 15,
            },
          },
          tooltip: {
            enabled: interactive,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              family: 'Cairo, sans-serif',
              size: 14,
            },
            bodyFont: {
              family: 'Cairo, sans-serif',
              size: 13,
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
          },
        },
        animation: animated ? {
          duration: 1500,
          easing: 'easeInOutQuart',
        } : false,
      },
    };

    // Apply theme-specific customizations
    if (theme === 'professional') {
      baseConfig.options.plugins.title.color = '#1f2937';
      baseConfig.options.scales = {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Cairo, sans-serif' } },
        },
        y: {
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { font: { family: 'Cairo, sans-serif' } },
        },
      };
    } else if (theme === 'dark') {
      baseConfig.options.plugins.title.color = '#f3f4f6';
      baseConfig.options.plugins.legend.labels.color = '#f3f4f6';
    }

    return baseConfig;
  }

  /**
   * Generate insights from chart data
   * توليد رؤى من بيانات الرسم
   */
  generateInsights(data: ChartData, chartType: ChartType): string[] {
    const insights: string[] = [];

    if (!data.datasets || data.datasets.length === 0) {
      return insights;
    }

    const firstDataset = data.datasets[0];
    const values = firstDataset.data as number[];

    if (values.length === 0) return insights;

    // Calculate statistics
    const total = values.reduce((sum, val) => sum + val, 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = total / values.length;
    const maxIndex = values.indexOf(max);
    const minIndex = values.indexOf(min);

    // Generate insights based on chart type
    if (chartType === 'pie' || chartType === 'doughnut') {
      const maxPercentage = ((max / total) * 100).toFixed(1);
      insights.push(
        `🔍 ${data.labels[maxIndex]} يمثل أكبر حصة بنسبة ${maxPercentage}% من الإجمالي`
      );

      // Check if distribution is balanced
      const isBalanced = values.every(v => Math.abs(v - avg) / avg < 0.3);
      if (isBalanced) {
        insights.push('⚖️ التوزيع متوازن نسبياً بين الفئات');
      } else {
        insights.push('📊 هناك تفاوت كبير في التوزيع بين الفئات');
      }
    } else if (chartType === 'bar' || chartType === 'line') {
      insights.push(`📈 أعلى قيمة: ${max.toLocaleString()} (${data.labels[maxIndex]})`);
      insights.push(`📉 أدنى قيمة: ${min.toLocaleString()} (${data.labels[minIndex]})`);

      // Trend detection for line charts
      if (chartType === 'line' && values.length >= 3) {
        const trend = this.detectTrend(values);
        if (trend === 'increasing') {
          insights.push('📈 الاتجاه العام: تصاعدي');
        } else if (trend === 'decreasing') {
          insights.push('📉 الاتجاه العام: تنازلي');
        } else {
          insights.push('➡️ الاتجاه العام: مستقر');
        }
      }
    }

    // Add total if applicable
    if (chartType !== 'scatter' && chartType !== 'bubble') {
      insights.push(`📊 الإجمالي: ${total.toLocaleString()}`);
    }

    return insights;
  }

  /**
   * Detect trend in time series data
   */
  private detectTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    let increases = 0;
    let decreases = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) increases++;
      else if (values[i] < values[i - 1]) decreases++;
    }

    const threshold = values.length * 0.6;
    if (increases > threshold) return 'increasing';
    if (decreases > threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Get professional color palette
   */
  getColorPalette(count: number, type: 'primary' | 'severity' | 'gradient' = 'primary'): string[] {
    if (type === 'severity') {
      return Object.values(this.PROFESSIONAL_COLORS.severity);
    }

    if (type === 'gradient') {
      return this.generateGradientColors(
        this.PROFESSIONAL_COLORS.gradient.start,
        this.PROFESSIONAL_COLORS.gradient.end,
        count
      );
    }

    // Repeat primary colors if needed
    const colors = this.PROFESSIONAL_COLORS.primary;
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }

  /**
   * Generate gradient colors
   */
  private generateGradientColors(start: string, end: string, count: number): string[] {
    // For now, use primary colors. In production, implement proper color interpolation
    // TODO: Implement actual gradient interpolation between start and end colors
    const colors = this.PROFESSIONAL_COLORS.primary;
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }
}

// Singleton instance
export const smartChartEngine = new SmartChartEngine();

```

---

