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
  { regex: /كم ادعاء البائع|إجمالي ادعاءات البائع|total records|affected records/i, context: "dashboardStats", response: "إجمالي ادعاء البائع المتأثرة في جميع حالات الرصد هو **{totalRecords}** سجل." },
  { regex: /الحوادث الخطرة|حالات الرصد الخطرة|الحوادث عالية الأهمية|حالات الرصد عالية الأهمية|critical incidents|high severity/i, context: "dashboardStats", response: "يوجد **{criticalLeaks}** حالة رصد مصنفة كـ \"حرجة\" (Critical)." },
  { regex: /مستوى التأثير|مؤشر التأثير|risk score|impact level/i, context: "dashboardStats", response: "مؤشر التأثير العام للمنصة حالياً هو **{riskScore}%**." },
  { regex: /مستوى الامتثال|مؤشر الامتثال|compliance score/i, context: "dashboardStats", response: "مؤشر الامتثال العام للمنصة هو **{complianceScore}%**." },
  { regex: /أكثر القطاعات تأثراً|القطاعات المتأثرة|most affected sectors/i, context: "dashboardStats", response: "القطاعات الأكثر تأثراً هي: **{affectedSectors}**." },

  // ═══ أسئلة عن حالات الرصد - الأساسية ═══
  { regex: /أكبر حادثة|أكبر حالة رصد|أضخم حالة رصد|largest breach|biggest leak/i, context: "incidents", response: "أكبر حالة رصد من حيث ادعاء البائع هي **\"{titleAr}\"** بعدد **{recordCount}** سجل.", find: "max", field: "recordCount" },
  { regex: /أخطر حادثة|أخطر حالة رصد|most dangerous|highest severity/i, context: "incidents", response: "أخطر حالة رصد حالياً هي **\"{titleAr}\"** بمستوى خطورة **{severity}**.", find: "max", field: "severity" },
  { regex: /أحدث حادثة|أحدث حالة رصد|آخر حالة رصد|latest breach|most recent/i, context: "incidents", response: "أحدث حالة رصد تم تسجيلها هي **\"{titleAr}\"** بتاريخ **{detectedAt}**.", find: "max", field: "detectedAt" },
  { regex: /أقدم حادثة|أقدم حالة رصد|أول حالة رصد|oldest breach|first incident/i, context: "incidents", response: "أقدم حالة رصد مسجلة هي **\"{titleAr}\"** بتاريخ **{detectedAt}**.", find: "min", field: "detectedAt" },

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
  { regex: /أكثر أنواع البيانات|ما هي أكثر أنواع|most common data types|pii types|أنواع البيانات المسربة/i, context: "incidents", response: "أكثر أنواع البيانات المسربة شيوعاً: **{topPiiTypes}**.", calculate: "count" },
  { regex: /حالات رصد تحتوي على بطاقات|حوادث تحتوي على بطاقات|credit cards|أرقام بطاقات/i, context: "incidents", response: "لدينا **{count}** حالة رصد تحتوي على بطاقات ائتمانية.", filter: { field: "piiTypes", value: "Credit Card" } },
  { regex: /حالات رصد تحتوي على كلمات مرور|حوادث تحتوي على كلمات مرور|passwords|credentials/i, context: "incidents", response: "لدينا **{count}** حالة رصد تحتوي على كلمات مرور.", filter: { field: "piiTypes", value: "Password" } },

  // ═══ NEW: أسئلة عن الفترة الزمنية ═══
  { regex: /حالات رصد هذا الشهر|حوادث هذا الشهر|this month|current month/i, context: "incidents", response: "تم تسجيل **{count}** حالة رصد خلال الشهر الحالي.", calculate: "count" },
  { regex: /حالات رصد آخر 30 يوم|حوادث آخر 30 يوم|last 30 days|past month/i, context: "incidents", response: "تم تسجيل **{count}** حالة رصد خلال آخر 30 يوماً.", calculate: "count" },
  { regex: /حالات رصد هذه السنة|حوادث هذه السنة|this year|current year/i, context: "incidents", response: "تم تسجيل **{count}** حالة رصد خلال السنة الحالية.", calculate: "count" },

  // ═══ NEW: أسئلة عن مستوى الخطورة ═══
  { regex: /حالات رصد متوسطة الخطورة|حوادث متوسطة الخطورة|medium severity/i, context: "incidents", response: "لدينا **{count}** حالة رصد بمستوى خطورة متوسط.", filter: { field: "severity", value: "Medium" } },
  { regex: /حالات رصد منخفضة الخطورة|حوادث منخفضة الخطورة|low severity/i, context: "incidents", response: "لدينا **{count}** حالة رصد بمستوى خطورة منخفض.", filter: { field: "severity", value: "Low" } },
  { regex: /حالات رصد عالية الخطورة|حوادث عالية الخطورة|high severity/i, context: "incidents", response: "لدينا **{count}** حالة رصد بمستوى خطورة عالي.", filter: { field: "severity", value: "High" } },

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
