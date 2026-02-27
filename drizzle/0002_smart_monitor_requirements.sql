-- ═══════════════════════════════════════════════════════════════
-- Smart Monitor Requirements Migration
-- متطلبات راصد الذكي - ترحيل قاعدة البيانات
-- Date: 2026-02-27
-- Requirements: DB-01 to DB-15, API-08, GOV-01 to GOV-03
-- ═══════════════════════════════════════════════════════════════

-- ═══ Phase 1: Add domain column to existing AI tables (DB-01, DB-02) ═══

ALTER TABLE `ai_chat_messages` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_chat_sessions` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_chat_sessions` ADD COLUMN `tags` JSON;
ALTER TABLE `ai_chat_sessions` ADD COLUMN `summary` TEXT;
ALTER TABLE `ai_conversations` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_conversations` ADD COLUMN `tags` JSON;
ALTER TABLE `ai_conversations` ADD COLUMN `linked_entity_type` VARCHAR(100);
ALTER TABLE `ai_conversations` ADD COLUMN `linked_entity_id` INT;
ALTER TABLE `ai_custom_commands` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_feedback` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_feedback` ADD COLUMN `tool_name` VARCHAR(100);
ALTER TABLE `ai_feedback` ADD COLUMN `conversation_id` INT;
ALTER TABLE `ai_messages` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_scenarios` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_search_log` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_search_log` ADD COLUMN `user_id` INT;
ALTER TABLE `ai_task_state` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_task_state` ADD COLUMN `last_activity` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `ai_task_state` ADD COLUMN `expires_at` TIMESTAMP NULL;
ALTER TABLE `ai_training_logs` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_user_sessions` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `knowledge_base` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_session_memory` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_tool_usage` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_tool_usage` ADD COLUMN `conversation_id` INT;
ALTER TABLE `ai_confirmation_requests` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_confirmation_requests` ADD COLUMN `conversation_id` INT;
ALTER TABLE `ai_navigation_history` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_navigation_history` ADD COLUMN `conversation_id` INT;
ALTER TABLE `ai_navigation_history` ADD COLUMN `consent_status` ENUM('pending','approved','denied') NOT NULL DEFAULT 'pending';
ALTER TABLE `ai_keyword_task_map` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_guide_steps` ADD COLUMN `guide_id` INT;
ALTER TABLE `ai_guide_steps` ADD COLUMN `action_type` ENUM('click','type','select','scroll','wait','highlight') NOT NULL DEFAULT 'highlight';
ALTER TABLE `ai_guide_steps` ADD COLUMN `highlight_type` ENUM('border','overlay','pulse','tooltip') NOT NULL DEFAULT 'border';
ALTER TABLE `ai_guide_steps` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';
ALTER TABLE `ai_auto_learning` ADD COLUMN `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks';

-- ═══ Phase 2: Create new tables ═══

-- DB-03: Glossary Terms (قاموس المصطلحات)
CREATE TABLE IF NOT EXISTS `glossary_terms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `domain` ENUM('leaks','privacy') NOT NULL,
  `term` VARCHAR(255) NOT NULL,
  `term_en` VARCHAR(255),
  `synonyms` JSON,
  `definition` TEXT NOT NULL,
  `definition_en` TEXT,
  `related_page` VARCHAR(255),
  `related_entity` VARCHAR(100),
  `example_questions` JSON,
  `is_forbidden` TINYINT NOT NULL DEFAULT 0,
  `correct_alternative` VARCHAR(255),
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `created_by` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `glossary_terms_domain_idx` (`domain`),
  INDEX `glossary_terms_term_idx` (`term`)
);

-- DB-04: Page Descriptors (أوصاف الصفحات)
CREATE TABLE IF NOT EXISTS `page_descriptors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `domain` ENUM('leaks','privacy') NOT NULL,
  `page_id` VARCHAR(100) NOT NULL,
  `route` VARCHAR(500) NOT NULL,
  `title_ar` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255),
  `purpose` TEXT NOT NULL,
  `purpose_en` TEXT,
  `main_elements` JSON,
  `common_tasks` JSON,
  `available_actions` JSON,
  `drillthrough_links` JSON,
  `suggested_questions` JSON,
  `role_based_questions` JSON,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `created_by` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `page_descriptors_domain_idx` (`domain`),
  INDEX `page_descriptors_pageId_idx` (`page_id`)
);

-- DB-05: Guide Catalog (كتالوج الأدلة)
CREATE TABLE IF NOT EXISTS `guide_catalog` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `domain` ENUM('leaks','privacy') NOT NULL,
  `title_ar` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255),
  `description_ar` TEXT,
  `description_en` TEXT,
  `objective` TEXT,
  `category` VARCHAR(100) NOT NULL DEFAULT 'general',
  `visibility_roles` JSON,
  `visibility_conditions` JSON,
  `step_count` INT NOT NULL DEFAULT 0,
  `estimated_minutes` INT,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `created_by` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `guide_catalog_domain_idx` (`domain`)
);

-- DB-07: Guide Sessions (جلسات الدليل)
CREATE TABLE IF NOT EXISTS `guide_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `user_id` INT NOT NULL,
  `guide_id` INT NOT NULL,
  `domain` ENUM('leaks','privacy') NOT NULL,
  `current_step_order` INT NOT NULL DEFAULT 1,
  `total_steps` INT NOT NULL,
  `status` ENUM('active','completed','abandoned','paused') NOT NULL DEFAULT 'active',
  `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` TIMESTAMP NULL,
  `last_activity_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `guide_sessions_user_idx` (`user_id`),
  INDEX `guide_sessions_domain_idx` (`domain`)
);

-- DB-10: Session Summaries (ملخصات الجلسات)
CREATE TABLE IF NOT EXISTS `session_summaries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `user_id` INT NOT NULL,
  `session_id` VARCHAR(64) NOT NULL,
  `domain` ENUM('leaks','privacy') NOT NULL,
  `summary` TEXT NOT NULL,
  `key_topics` JSON,
  `entities_discussed` JSON,
  `actions_performed` JSON,
  `message_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `session_summaries_user_domain_idx` (`user_id`, `domain`)
);

-- DB-13: Letter Templates (قوالب الرسائل الرسمية)
CREATE TABLE IF NOT EXISTS `letter_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `domain` ENUM('leaks','privacy') NOT NULL,
  `template_type` ENUM('notification','warning','compliance','report','followup','response','custom') NOT NULL,
  `title_ar` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255),
  `content_ar` TEXT NOT NULL,
  `content_en` TEXT,
  `placeholders` JSON,
  `example_input` JSON,
  `example_output` TEXT,
  `tone_level` ENUM('brief','balanced','formal') NOT NULL DEFAULT 'balanced',
  `version` INT NOT NULL DEFAULT 1,
  `parent_id` INT,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `created_by` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `letter_templates_domain_idx` (`domain`),
  INDEX `letter_templates_type_idx` (`template_type`)
);

-- DB-14: System Events (أحداث النظام)
CREATE TABLE IF NOT EXISTS `system_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `domain` ENUM('leaks','privacy') NOT NULL DEFAULT 'leaks',
  `event_type` ENUM(
    'page_created','page_updated','page_deleted',
    'template_created','template_updated','template_deleted',
    'column_added','column_removed','column_updated',
    'category_created','category_updated','category_deleted',
    'setting_changed','requirement_added','requirement_updated',
    'knowledge_refreshed','glossary_updated','guide_updated'
  ) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` VARCHAR(100),
  `entity_name` VARCHAR(500),
  `old_value` JSON,
  `new_value` JSON,
  `triggered_by` INT,
  `is_processed` TINYINT NOT NULL DEFAULT 0,
  `processed_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `system_events_domain_idx` (`domain`),
  INDEX `system_events_type_idx` (`event_type`),
  INDEX `system_events_processed_idx` (`is_processed`)
);

-- DB-15: Knowledge Refresh Status (حالة تحديث المعرفة)
CREATE TABLE IF NOT EXISTS `knowledge_refresh_status` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `domain` ENUM('leaks','privacy') NOT NULL,
  `source_name` VARCHAR(255) NOT NULL,
  `source_type` ENUM('glossary','page_descriptors','knowledge_base','training_docs','rag_index','guide_catalog') NOT NULL,
  `status` ENUM('idle','running','completed','error') NOT NULL DEFAULT 'idle',
  `last_run_at` TIMESTAMP NULL,
  `last_success_at` TIMESTAMP NULL,
  `records_processed` INT DEFAULT 0,
  `error_message` TEXT,
  `next_scheduled_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `knowledge_refresh_domain_idx` (`domain`)
);

-- API-08: Action Runs (سجل الإجراءات التنفيذية)
CREATE TABLE IF NOT EXISTS `action_runs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `domain` ENUM('leaks','privacy') NOT NULL,
  `user_id` INT NOT NULL,
  `conversation_id` INT,
  `tool_name` VARCHAR(100) NOT NULL,
  `action_type` ENUM('create','update','delete','export','import','scan','notify') NOT NULL,
  `status` ENUM('planned','previewed','confirmed','executing','completed','failed','rolled_back') NOT NULL DEFAULT 'planned',
  `plan_description` TEXT,
  `preview_data` JSON,
  `input_params` JSON,
  `result_data` JSON,
  `rollback_data` JSON,
  `is_rollbackable` TINYINT NOT NULL DEFAULT 0,
  `confirmed_at` TIMESTAMP NULL,
  `completed_at` TIMESTAMP NULL,
  `rolled_back_at` TIMESTAMP NULL,
  `rolled_back_by` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `action_runs_domain_idx` (`domain`),
  INDEX `action_runs_user_idx` (`user_id`),
  INDEX `action_runs_conversation_idx` (`conversation_id`)
);

-- Evaluation Sets (مجموعات التقييم لكل مجال)
CREATE TABLE IF NOT EXISTS `ai_evaluation_sets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `domain` ENUM('leaks','privacy') NOT NULL,
  `question` TEXT NOT NULL,
  `expected_answer` TEXT NOT NULL,
  `expected_tools` JSON,
  `category` VARCHAR(100),
  `difficulty` ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
  `last_tested_at` TIMESTAMP NULL,
  `last_result` ENUM('pass','fail','partial'),
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `created_by` INT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `ai_evaluation_sets_domain_idx` (`domain`)
);

-- ═══ Phase 3: Seed Naming Policy Glossary (NAME-01 to NAME-08) ═══

INSERT INTO `glossary_terms` (`domain`, `term`, `term_en`, `synonyms`, `definition`, `is_forbidden`, `correct_alternative`, `is_active`) VALUES
('leaks', 'حالة رصد', 'Monitoring Case', '["حالة مراقبة", "حالة متابعة"]', 'التسمية الافتراضية لأي ادعاء بوجود تسرب بيانات شخصية، بغض النظر عن مصداقية البائع أو الناشر. تبقى "حالة رصد" حتى يتم التحقق الرسمي.', 0, NULL, 1),
('leaks', 'العدد المُدّعى', 'Claimed Count', '["العدد المزعوم"]', 'أي رقم يذكره البائع أو الناشر عن عدد السجلات. هو ادعاء وليس تحققاً.', 0, NULL, 1),
('leaks', 'العينات المتاحة', 'Available Samples', '["البيانات الموثقة"]', 'ما تم جمعه وتوثيقه فعلياً داخل المنصة وفق الصلاحيات.', 0, NULL, 1),
('leaks', 'حادثة تسرب', 'Leak Incident', '["حادثة تسريب", "حادثة"]', 'مصطلح محظور - يُستخدم "حالة رصد" بدلاً منه حتى يتم التحقق.', 1, 'حالة رصد', 1),
('leaks', 'حادثة تسريب', 'Data Leak Incident', '["تسريب بيانات"]', 'مصطلح محظور - يُستخدم "حالة رصد" بدلاً منه.', 1, 'حالة رصد', 1),
('leaks', 'تسرب بيانات شخصية', 'Personal Data Leak', '["تسرب بيانات"]', 'مصطلح محظور قبل التحقق - يُستخدم "حالة رصد" بدلاً منه.', 1, 'حالة رصد', 1),
('leaks', 'عدد السجلات المسربة', 'Leaked Record Count', '["عدد السجلات", "السجلات المسربة"]', 'مصطلح محظور - يُستخدم "العدد المُدّعى" بدلاً منه لأنه ادعاء وليس تحققاً.', 1, 'العدد المُدّعى', 1),
('leaks', 'السجلات المجمعة', 'Collected Records', '["البيانات المسربة", "البيانات المجمعة"]', 'مصطلح محظور - يُستخدم "العينات المتاحة" بدلاً منه.', 1, 'العينات المتاحة', 1),
('leaks', 'تسرب مؤكد', 'Confirmed Leak', '[]', 'يُستخدم فقط عندما تكون حالة الرصد في النظام = "تسرب مؤكد" بعد اكتمال إجراءات التحقق الرسمي.', 0, NULL, 1),
('leaks', 'قيد التحقق', 'Under Verification', '[]', 'حالة تُستخدم عندما يبدأ فريق التحقق بالعمل على حالة الرصد.', 0, NULL, 1);
