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
        description: `هذا القطاع يحتوي على ${sectorIncidents.length} حادثة، بمتوسط ${Math.round(avgRecords)} سجل لكل حادثة. ${criticalCount} منها حرجة.`,
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
      description: `أكثر أنواع البيانات الشخصية تسريباً: ${topPII.map(([pii, count]) => `${pii} (${count})`).join('، ')}`,
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
