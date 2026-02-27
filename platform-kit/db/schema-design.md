# تصميم قاعدة البيانات - راصد الذكي

## المبدأ: كل جدول مشترك يحمل `domain`

---

## 1. جداول المعرفة والفهم

### 1.1 Glossary (قاموس المصطلحات) - DB-03

```sql
CREATE TABLE ai_glossary_terms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  term VARCHAR(255) NOT NULL,
  synonyms JSON COMMENT 'مرادفات المصطلح ["حالة رصد", "كيس مراقبة"]',
  definition TEXT NOT NULL,
  related_page VARCHAR(255) COMMENT 'الصفحة المرتبطة (route)',
  related_entity VARCHAR(255) COMMENT 'الكيان المرتبط',
  example_questions JSON COMMENT '["كم عدد حالات الرصد؟", "ما آخر حالة رصد؟"]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_term (term),
  UNIQUE KEY uk_domain_term (domain, term)
);
```

### 1.2 Page Descriptors (واصفات الصفحات) - DB-04

```sql
CREATE TABLE ai_page_descriptors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  page_id VARCHAR(255) NOT NULL COMMENT 'معرف الصفحة الفريد',
  route VARCHAR(255) NOT NULL COMMENT 'المسار /app/leaks/dashboard',
  page_purpose TEXT NOT NULL COMMENT 'هدف الصفحة',
  main_elements JSON COMMENT '["جدول حالات الرصد", "فلتر الحالة", "مؤشرات KPI"]',
  common_tasks JSON COMMENT '["عرض حالات الرصد الجديدة", "فلترة حسب القطاع"]',
  available_actions JSON COMMENT '["إنشاء حالة رصد", "تصدير", "فلترة"]',
  drillthrough_links JSON COMMENT '[{"label": "تفاصيل الحالة", "route": "/app/leaks/cases/:id"}]',
  suggested_questions_by_role JSON COMMENT '{"admin": ["كم حالة رصد جديدة؟"], "analyst": ["ما أعلى حالة خطورة؟"]}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  UNIQUE KEY uk_domain_page (domain, page_id)
);
```

---

## 2. جداول الدليل الحي (Guide)

### 2.1 Guide Catalog (كتالوج الأدلة) - DB-05

```sql
CREATE TABLE ai_guide_catalog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  purpose TEXT NOT NULL COMMENT 'هدف الدليل',
  visibility_roles JSON COMMENT '["admin", "analyst", "viewer"]',
  visibility_conditions JSON COMMENT '{"minRole": "analyst", "requiresFeature": "guides"}',
  steps_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain)
);
```

### 2.2 Guide Steps (خطوات الدليل) - DB-06

```sql
CREATE TABLE ai_guide_steps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  guide_id INT NOT NULL,
  step_number INT NOT NULL,
  route VARCHAR(255) NOT NULL COMMENT 'الصفحة التي تُنفذ فيها الخطوة',
  selector VARCHAR(500) COMMENT 'CSS selector للعنصر المستهدف',
  step_text TEXT NOT NULL COMMENT 'نص الخطوة الموجّه للمستخدم',
  action_type ENUM('click', 'type', 'select', 'scroll', 'wait', 'observe') NOT NULL,
  highlight_type ENUM('spotlight', 'border', 'pulse', 'arrow') DEFAULT 'spotlight',
  action_data JSON COMMENT '{"value": "test", "delay": 500}',
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guide_id) REFERENCES ai_guide_catalog(id) ON DELETE CASCADE,
  UNIQUE KEY uk_guide_step (guide_id, step_number)
);
```

### 2.3 Guide Sessions (جلسات الدليل) - DB-07

```sql
CREATE TABLE ai_guide_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  guide_id INT NOT NULL,
  user_id INT NOT NULL,
  domain ENUM('leaks', 'privacy') NOT NULL,
  status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
  current_step INT DEFAULT 1,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  abandoned_at TIMESTAMP NULL,
  FOREIGN KEY (guide_id) REFERENCES ai_guide_catalog(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_domain (domain)
);
```

---

## 3. جداول الذاكرة والمحادثات

### 3.1 Task Memory (ذاكرة المهمة) - DB-08

```sql
CREATE TABLE ai_task_memory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  user_id INT NOT NULL,
  conversation_id VARCHAR(255) NOT NULL,
  objective TEXT COMMENT 'هدف المهمة الحالية',
  current_entity_type VARCHAR(100) COMMENT 'نوع الكيان: case/site/report',
  current_entity_id VARCHAR(255) COMMENT 'معرف الكيان',
  active_filters JSON COMMENT '{"status": "حالة رصد", "sector": "بنوك"}',
  current_step VARCHAR(255) COMMENT 'الخطوة الحالية',
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP COMMENT 'وقت انتهاء صلاحية الذاكرة',
  INDEX idx_domain_user (domain, user_id),
  INDEX idx_conversation (conversation_id)
);
```

### 3.2 Conversations (المحادثات) - DB-09

```sql
CREATE TABLE ai_conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id VARCHAR(255) NOT NULL UNIQUE,
  domain ENUM('leaks', 'privacy') NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(500) COMMENT 'عنوان ذكي مُولّد',
  tags JSON COMMENT '["حالات رصد", "تقارير", "إحصائيات"]',
  context_page VARCHAR(255) COMMENT 'الصفحة التي بدأت منها المحادثة',
  context_entity_id VARCHAR(255) COMMENT 'الكيان المرتبط',
  message_count INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain_user (domain, user_id),
  INDEX idx_created (created_at DESC)
);
```

### 3.3 Conversation Messages (رسائل المحادثات)

```sql
CREATE TABLE ai_conversation_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id VARCHAR(255) NOT NULL,
  role ENUM('user', 'assistant', 'system', 'tool') NOT NULL,
  content TEXT NOT NULL,
  tool_calls JSON COMMENT 'استدعاءات الأدوات إن وجدت',
  tool_results JSON COMMENT 'نتائج الأدوات',
  page_context JSON COMMENT 'Page Context Pack عند إرسال الرسالة',
  tokens_used INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conversation (conversation_id),
  INDEX idx_created (created_at)
);
```

### 3.4 Session Summary (ملخص الجلسات) - DB-10

```sql
CREATE TABLE ai_session_summaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  user_id INT NOT NULL,
  conversation_id VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL COMMENT 'ملخص المحادثة',
  key_topics JSON COMMENT '["حالات رصد جديدة", "تقرير شهري"]',
  last_entity_type VARCHAR(100),
  last_entity_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain_user (domain, user_id),
  INDEX idx_created (created_at DESC)
);
```

---

## 4. جداول مركز التدريب

### 4.1 Training Documents (وثائق التدريب) - DB-11

```sql
CREATE TABLE ai_training_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  doc_type ENUM('guide', 'procedure', 'scenario', 'faq', 'policy') NOT NULL,
  tags JSON,
  is_active BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_type (doc_type)
);
```

### 4.2 Custom Action Triggers (ربط الكلمات بمهام) - DB-11

```sql
CREATE TABLE ai_action_triggers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  trigger_phrases JSON NOT NULL COMMENT '["أنشئ حالة رصد", "سجّل حالة جديدة"]',
  action_type VARCHAR(100) NOT NULL COMMENT 'create_case / generate_report / ...',
  action_config JSON COMMENT '{"defaultStatus": "حالة رصد", "requireConfirm": true}',
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_priority (priority DESC)
);
```

### 4.3 Feedback (ملاحظات المستخدمين) - DB-12

```sql
CREATE TABLE ai_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  conversation_id VARCHAR(255),
  message_id INT,
  tool_name VARCHAR(100),
  user_id INT NOT NULL,
  rating ENUM('helpful', 'not_helpful') NOT NULL,
  reason VARCHAR(500),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_conversation (conversation_id),
  INDEX idx_rating (rating)
);
```

---

## 5. جداول القوالب والرسائل

### 5.1 Official Letter Templates (قوالب الرسائل الرسمية) - DB-13

```sql
CREATE TABLE ai_letter_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  template_type VARCHAR(100) NOT NULL COMMENT 'notification/warning/response/report',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL COMMENT 'المحتوى مع placeholders',
  placeholders JSON COMMENT '[{"key": "{{entity_name}}", "description": "اسم الجهة"}]',
  tone ENUM('brief', 'balanced', 'very_formal') DEFAULT 'balanced',
  example_input JSON COMMENT 'مثال إدخال',
  example_output TEXT COMMENT 'مثال إخراج',
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_type (template_type)
);
```

---

## 6. جداول الأحداث والمعرفة

### 6.1 System Events (أحداث النظام) - DB-14

```sql
CREATE TABLE ai_system_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  event_type ENUM('create', 'update', 'delete') NOT NULL,
  entity_type VARCHAR(100) NOT NULL COMMENT 'page/template/column/setting/...',
  entity_id VARCHAR(255),
  changes JSON COMMENT '{"before": {...}, "after": {...}}',
  triggered_by INT COMMENT 'المستخدم أو النظام',
  processed BOOLEAN DEFAULT FALSE COMMENT 'هل تم تحديث RAG؟',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_processed (processed),
  INDEX idx_created (created_at)
);
```

### 6.2 Knowledge Refresh Status (حالة تحديث المعرفة) - DB-15

```sql
CREATE TABLE ai_knowledge_refresh (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  source_type VARCHAR(100) NOT NULL COMMENT 'glossary/pages/training/...',
  source_id VARCHAR(255),
  status ENUM('idle', 'running', 'completed', 'error') DEFAULT 'idle',
  last_refresh TIMESTAMP NULL,
  next_refresh TIMESTAMP NULL,
  error_message TEXT,
  items_processed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_domain_source (domain, source_type, source_id),
  INDEX idx_status (status)
);
```

---

## 7. جداول التدقيق والتأكيد

### 7.1 Audit Log (سجل التدقيق) - SEC-01

```sql
CREATE TABLE ai_audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL COMMENT 'chat/tool_call/create/update/delete/export',
  target_type VARCHAR(100) COMMENT 'case/report/template/...',
  target_id VARCHAR(255),
  details JSON COMMENT '{"tool": "query_cases", "params": {...}, "result_count": 5}',
  before_state JSON COMMENT 'الحالة قبل التغيير',
  after_state JSON COMMENT 'الحالة بعد التغيير',
  result ENUM('success', 'failure', 'denied', 'cancelled') NOT NULL,
  ip_address VARCHAR(45),
  conversation_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
);
```

### 7.2 Action Runs (سجل الإجراءات) - API-08

```sql
CREATE TABLE ai_action_runs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  conversation_id VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  plan JSON NOT NULL COMMENT 'ما الذي سيتغير',
  preview JSON COMMENT 'معاينة قبل/بعد',
  status ENUM('pending', 'confirmed', 'cancelled', 'executed', 'rolled_back', 'failed') DEFAULT 'pending',
  executed_at TIMESTAMP NULL,
  rollback_data JSON COMMENT 'بيانات التراجع إن أمكن',
  rolled_back_at TIMESTAMP NULL,
  result JSON COMMENT 'نتيجة التنفيذ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_conversation (conversation_id),
  INDEX idx_status (status)
);
```

---

## ملخص الجداول

| # | الجدول | الوصف | المتطلب |
|---|--------|-------|---------|
| 1 | `ai_glossary_terms` | قاموس المصطلحات | DB-03 |
| 2 | `ai_page_descriptors` | واصفات الصفحات | DB-04 |
| 3 | `ai_guide_catalog` | كتالوج الأدلة | DB-05 |
| 4 | `ai_guide_steps` | خطوات الأدلة | DB-06 |
| 5 | `ai_guide_sessions` | جلسات الأدلة | DB-07 |
| 6 | `ai_task_memory` | ذاكرة المهمة | DB-08 |
| 7 | `ai_conversations` | المحادثات | DB-09 |
| 8 | `ai_conversation_messages` | رسائل المحادثات | DB-09 |
| 9 | `ai_session_summaries` | ملخصات الجلسات | DB-10 |
| 10 | `ai_training_documents` | وثائق التدريب | DB-11 |
| 11 | `ai_action_triggers` | ربط الكلمات بمهام | DB-11 |
| 12 | `ai_feedback` | ملاحظات المستخدمين | DB-12 |
| 13 | `ai_letter_templates` | قوالب الرسائل | DB-13 |
| 14 | `ai_system_events` | أحداث النظام | DB-14 |
| 15 | `ai_knowledge_refresh` | حالة تحديث المعرفة | DB-15 |
| 16 | `ai_audit_log` | سجل التدقيق | SEC-01 |
| 17 | `ai_action_runs` | سجل الإجراءات | API-08 |
