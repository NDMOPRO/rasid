# أعلام الميزات والإعدادات - راصد الذكي

---

## 1. أعلام الميزات (Feature Flags)

```typescript
interface SmartMonitorFeatureFlags {
  // المساعد الذكي - عام
  ai_assistant_enabled: boolean;          // تفعيل/تعطيل المساعد بالكامل
  ai_streaming_enabled: boolean;          // SSE streaming
  ai_fallback_enabled: boolean;           // Fallback للأسئلة الشائعة

  // مساعد التسربات
  ai_leaks_enabled: boolean;              // تفعيل مساعد التسربات
  ai_leaks_execute_tools: boolean;        // السماح بأدوات التنفيذ
  ai_leaks_bulk_import: boolean;          // الاستيراد الجماعي
  ai_leaks_charts: boolean;              // إنشاء المخططات
  ai_leaks_pii_scan: boolean;            // فحص PII
  ai_leaks_direct_scan: boolean;         // الفحص المباشر

  // مساعد الخصوصية
  ai_privacy_enabled: boolean;            // تفعيل مساعد الخصوصية
  ai_privacy_execute_tools: boolean;      // السماح بأدوات التنفيذ
  ai_privacy_charts: boolean;            // إنشاء المخططات
  ai_privacy_reassess: boolean;          // إعادة التقييم

  // الأدلة الحية
  ai_guides_enabled: boolean;            // تفعيل الأدلة الحية
  ai_guide_auto_resume: boolean;         // استعادة الجلسة تلقائياً

  // المبادرة
  ai_proactive_enabled: boolean;         // المبادرة بعد 60 ثانية
  ai_proactive_interval_ms: number;      // الفاصل بين المبادرات (افتراضي: 300000)

  // الصوت
  ai_voice_stt_enabled: boolean;         // Speech-to-Text
  ai_voice_tts_enabled: boolean;         // Text-to-Speech

  // العبارات التشجيعية
  ai_encouragement_enabled: boolean;      // عبارات تشجيعية

  // مركز التدريب
  ai_training_center_enabled: boolean;    // مركز التدريب
  ai_training_triggers_enabled: boolean;  // ربط الكلمات بمهام

  // الرسائل الرسمية
  ai_letter_templates_enabled: boolean;   // قوالب الرسائل

  // التقارير
  ai_report_generation_enabled: boolean;  // إنشاء التقارير
  ai_report_pdf_enabled: boolean;        // تصدير PDF
  ai_report_excel_enabled: boolean;      // تصدير Excel
  ai_report_charts_in_report: boolean;   // إدراج مخططات في التقارير
}
```

---

## 2. إعدادات قابلة للتحكم من لوحة الإدارة

```typescript
interface SmartMonitorSettings {
  // LLM Provider
  llm_provider: 'openai' | 'anthropic' | 'azure' | 'custom';
  llm_model: string;
  llm_api_key: string;           // مشفر
  llm_base_url?: string;
  llm_timeout_ms: number;        // افتراضي: 30000
  llm_max_retries: number;       // افتراضي: 3
  llm_max_tokens: number;        // افتراضي: 4096

  // Circuit Breaker
  cb_failure_threshold: number;   // افتراضي: 5
  cb_recovery_timeout_ms: number; // افتراضي: 60000
  cb_half_open_max: number;       // افتراضي: 2

  // RAG
  rag_top_k: number;             // افتراضي: 5
  rag_similarity_threshold: number; // افتراضي: 0.7
  rag_auto_refresh: boolean;     // افتراضي: true
  rag_refresh_interval_ms: number; // افتراضي: 3600000

  // المحادثات
  chat_max_history: number;       // افتراضي: 50 رسالة
  chat_session_timeout_ms: number; // افتراضي: 1800000
  chat_summary_last_n: number;    // افتراضي: 3 محادثات

  // سياسات الاحتفاظ
  retention_conversations_days: number;  // افتراضي: 90
  retention_audit_days: number;          // افتراضي: 365
  retention_reports_days: number;        // افتراضي: 180
  retention_training_docs_days: number;  // افتراضي: -1 (بلا حد)

  // المبادرة
  proactive_idle_threshold_ms: number;  // افتراضي: 60000
  proactive_cooldown_ms: number;        // افتراضي: 300000

  // العبارات التشجيعية
  encouragement_frequency: number;      // كل N ردود (افتراضي: 4)
  encouragement_on_session_start: boolean; // افتراضي: true
  encouragement_on_task_success: boolean;  // افتراضي: true

  // التصدير
  export_max_rows: number;        // افتراضي: 100000
  export_include_metadata: boolean; // افتراضي: true
}
```

---

## 3. إعدادات المستخدم الشخصية

```typescript
interface UserAIPreferences {
  // عام
  ai_enabled: boolean;                    // تفعيل المساعد لهذا المستخدم
  preferred_response_length: 'short' | 'balanced' | 'detailed';

  // المبادرة
  proactive_enabled: boolean;             // تفعيل المبادرة
  proactive_custom_threshold_ms?: number; // عتبة مخصصة

  // العبارات التشجيعية
  encouragement_enabled: boolean;         // تفعيل العبارات

  // الصوت
  voice_stt_enabled: boolean;            // تفعيل STT
  voice_tts_enabled: boolean;            // تفعيل TTS
  voice_tts_speed: number;               // سرعة القراءة (0.5-2.0)

  // العرض
  show_tool_trace: boolean;              // عرض الأدوات المستدعاة
  show_thinking_steps: boolean;          // عرض خطوات التفكير
  auto_expand_charts: boolean;           // تكبير المخططات تلقائياً
}
```

---

## 4. القيم الافتراضية

```json
{
  "featureFlags": {
    "ai_assistant_enabled": true,
    "ai_streaming_enabled": true,
    "ai_fallback_enabled": true,
    "ai_leaks_enabled": true,
    "ai_privacy_enabled": true,
    "ai_guides_enabled": true,
    "ai_proactive_enabled": true,
    "ai_voice_stt_enabled": false,
    "ai_voice_tts_enabled": false,
    "ai_encouragement_enabled": true,
    "ai_training_center_enabled": true,
    "ai_report_generation_enabled": true
  },
  "settings": {
    "llm_timeout_ms": 30000,
    "llm_max_retries": 3,
    "cb_failure_threshold": 5,
    "rag_top_k": 5,
    "chat_max_history": 50,
    "retention_conversations_days": 90,
    "proactive_idle_threshold_ms": 60000,
    "proactive_cooldown_ms": 300000
  }
}
```
