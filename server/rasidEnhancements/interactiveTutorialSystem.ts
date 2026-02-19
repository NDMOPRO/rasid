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
      title: 'كيفية إضافة حادثة جديدة',
      description: 'تعلم كيفية إضافة حادثة تسريب بيانات جديدة إلى المنصة خطوة بخطوة',
      category: 'incidents',
      difficulty: 'beginner',
      estimatedTime: 3,
      steps: [
        {
          id: 'step-1',
          title: 'الانتقال لصفحة الحوادث',
          description: 'أولاً، نحتاج للانتقال إلى صفحة حالات الرصد',
          targetElement: 'a[href="/leaks"]',
          action: 'click',
          position: 'right',
          narration: 'مرحباً! دعني أريك كيف تضيف حادثة جديدة. أولاً، سننتقل إلى صفحة حالات الرصد. لاحظ القائمة الجانبية على اليسار.',
          autoExecute: true,
          duration: 3000,
        },
        {
          id: 'step-2',
          title: 'النقر على زر إضافة حادثة',
          description: 'ابحث عن زر "إضافة حادثة جديدة" في أعلى الصفحة',
          targetElement: 'button:contains("إضافة"), button:contains("جديد")',
          action: 'click',
          position: 'bottom',
          narration: 'رائع! الآن نحن في صفحة الحوادث. انظر إلى الزر الأزرق في الأعلى - هذا هو زر "إضافة حادثة جديدة". سأنقر عليه الآن.',
          autoExecute: true,
          duration: 2000,
        },
        {
          id: 'step-3',
          title: 'ملء معلومات الحادثة',
          description: 'املأ العنوان والوصف والقطاع المتأثر',
          targetElement: 'input[name="title"], input[name="titleAr"]',
          action: 'type',
          actionData: { value: 'حادثة تسريب بيانات - مثال تعليمي' },
          position: 'right',
          narration: 'ممتاز! الآن ظهر نموذج إضافة الحادثة. دعني أملأ الحقول المطلوبة. أولاً العنوان...',
          autoExecute: false, // User should fill this
          duration: 5000,
        },
        {
          id: 'step-4',
          title: 'اختيار درجة الخطورة',
          description: 'حدد مستوى خطورة الحادثة',
          targetElement: 'select[name="severity"]',
          action: 'click',
          position: 'right',
          narration: 'الآن نحتاج لتحديد درجة الخطورة. هل الحادثة حرجة؟ عالية؟ متوسطة؟ أم منخفضة؟',
          autoExecute: false,
          duration: 3000,
        },
        {
          id: 'step-5',
          title: 'حفظ الحادثة',
          description: 'انقر على زر حفظ لإضافة الحادثة',
          targetElement: 'button[type="submit"]',
          action: 'click',
          position: 'bottom',
          narration: 'بعد ملء جميع الحقول المطلوبة، نضغط على زر "حفظ". تهانينا! لقد أضفت حادثة جديدة بنجاح! 🎉',
          autoExecute: false,
          duration: 2000,
        },
      ],
    });

    // Tutorial 2: Generating a report
    this.addTutorial({
      id: 'generate-report',
      title: 'كيفية إنشاء تقرير',
      description: 'تعلم كيفية إنشاء وتصدير تقرير شامل عن الحوادث',
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
          narration: 'الآن نحدد ماذا نريد في التقرير: إحصائيات؟ رسومات بيانية؟ قائمة الحوادث؟ كل شيء متاح!',
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
      description: 'تعلم كيفية إنشاء قواعد تنبيه تلقائية للحوادث الجديدة',
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
          narration: 'مرحباً بك في دليل إعداد التنبيهات! هذه ميزة متقدمة ستساعدك على متابعة الحوادث الجديدة تلقائياً.',
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
          narration: 'الآن الجزء المهم! نحدد الشروط: مثلاً "عند إضافة حادثة خطورتها حرجة" أو "عند تسريب أكثر من 10,000 سجل".',
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
          actionData: { value: 'كم عدد الحوادث الحرجة؟' },
          position: 'top',
          narration: 'يمكنك سؤالي أي شيء عن المنصة! جرب: "كم عدد الحوادث الحرجة؟" أو "ما هي القطاعات الأكثر تأثراً؟"',
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
          actionData: { value: 'ارسم رسم بياني لتوزيع الحوادث حسب القطاع' },
          position: 'top',
          narration: 'يمكنني أيضاً رسم رسومات بيانية! جرب: "ارسم رسم بياني لتوزيع الحوادث حسب القطاع" - سأنشئ رسماً احترافياً!',
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
        'رائع! دعني أريك كيف تضيف حادثة جديدة بسهولة.',
        'عملية إضافة الحادثة بسيطة جداً، تابع معي!',
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
