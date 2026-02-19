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
        ? `أهلاً بك ${userName} في منصة راصد! يسعدني مساعدتك في رصد وتحليل حالات تسريب البيانات الشخصية.\n\n`
        : `أهلاً بك في منصة راصد! أنا راصد الذكي، مساعدك الشخصي في رصد وتحليل حالات تسريب البيانات الشخصية.\n\n`;
      greeting += `يمكنني مساعدتك في:\n`;
      greeting += `• 🔍 البحث عن حالات الرصد والحوادث\n`;
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
      '/leaks': '🚨 أرى أنك تتصفح حالات الرصد. هل تبحث عن حادثة محددة؟',
      '/incidents': '📋 أرى أنك تتصفح سجل الحوادث. هل تريد معلومات عن حادثة معينة؟',
      '/reports': '📄 أرى أنك في قسم التقارير. هل تريد إنشاء تقرير جديد أو مراجعة تقرير موجود؟',
      '/monitoring': '🔔 أرى أنك في قسم المراقبة. هل تريد إعداد تنبيه جديد أو مراجعة التنبيهات الحالية؟',
      '/evidence': '🔗 أرى أنك تتصفح سلسلة الأدلة. هل تريد تتبع أدلة حادثة معينة؟',
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
