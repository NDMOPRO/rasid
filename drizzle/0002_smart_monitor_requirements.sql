-- Smart Monitor Requirements Migration
-- DB-01 to DB-17: Domain Isolation & AI Infrastructure Tables

-- DB-01, DB-02, GOV-01: Domain-isolated Glossary
CREATE TABLE IF NOT EXISTS `ai_glossary` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `term` varchar(200) NOT NULL,
  `term_en` varchar(200),
  `synonyms` json,
  `definition` text NOT NULL,
  `definition_en` text,
  `related_page` varchar(200),
  `related_entity` varchar(200),
  `example_questions` json,
  `is_active` tinyint NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_glossary_id` PRIMARY KEY(`id`)
);

-- DB-04: Page Descriptors per domain
CREATE TABLE IF NOT EXISTS `ai_page_descriptors` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `page_id` varchar(100) NOT NULL,
  `route` varchar(300) NOT NULL,
  `page_name` varchar(200) NOT NULL,
  `page_name_en` varchar(200),
  `purpose` text NOT NULL,
  `main_elements` json,
  `common_tasks` json,
  `available_actions` json,
  `drillthrough_links` json,
  `suggested_questions` json,
  `is_active` tinyint NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_page_descriptors_id` PRIMARY KEY(`id`)
);

-- DB-05: Guide Catalog
CREATE TABLE IF NOT EXISTS `ai_guide_catalog` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `title` varchar(300) NOT NULL,
  `title_en` varchar(300),
  `purpose` text,
  `visibility_roles` json,
  `is_active` tinyint NOT NULL DEFAULT 1,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_guide_catalog_id` PRIMARY KEY(`id`)
);

-- DB-06: Guide Steps (v2 — new version with guideId and actionType)
CREATE TABLE IF NOT EXISTS `ai_guide_steps_v2` (
  `id` int AUTO_INCREMENT NOT NULL,
  `guide_id` int NOT NULL,
  `step_order` int NOT NULL,
  `route` varchar(300) NOT NULL,
  `selector` varchar(500),
  `step_text` text NOT NULL,
  `step_text_en` text,
  `action_type` enum('click','type','select','scroll','wait','observe') NOT NULL DEFAULT 'observe',
  `highlight_type` enum('border','overlay','pulse','arrow') NOT NULL DEFAULT 'border',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_guide_steps_v2_id` PRIMARY KEY(`id`)
);

-- DB-07: Guide Sessions
CREATE TABLE IF NOT EXISTS `ai_guide_sessions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `guide_id` int NOT NULL,
  `user_id` int NOT NULL,
  `current_step` int NOT NULL DEFAULT 0,
  `total_steps` int NOT NULL,
  `status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
  `started_at` timestamp NOT NULL DEFAULT (now()),
  `completed_at` timestamp,
  CONSTRAINT `ai_guide_sessions_id` PRIMARY KEY(`id`)
);

-- DB-08: Task Memory per domain
CREATE TABLE IF NOT EXISTS `ai_task_memory` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `user_id` int NOT NULL,
  `conversation_id` varchar(100),
  `goal` text,
  `current_entity` varchar(200),
  `current_entity_id` varchar(100),
  `active_filters` json,
  `current_step` varchar(200),
  `last_activity` timestamp NOT NULL DEFAULT (now()),
  `expires_at` timestamp,
  CONSTRAINT `ai_task_memory_id` PRIMARY KEY(`id`)
);

-- DB-09, DB-10: Enhanced Conversations with domain isolation (v2)
CREATE TABLE IF NOT EXISTS `ai_conversations_v2` (
  `id` int AUTO_INCREMENT NOT NULL,
  `conversation_id` varchar(100) NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(500),
  `tags` json,
  `context_page` varchar(200),
  `context_entity_id` varchar(100),
  `summary` text,
  `message_count` int NOT NULL DEFAULT 0,
  `is_active` tinyint NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_conversations_v2_id` PRIMARY KEY(`id`)
);

-- DB-11: Training Center — Documents
CREATE TABLE IF NOT EXISTS `ai_training_documents` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `title` varchar(500) NOT NULL,
  `title_en` varchar(500),
  `content` text NOT NULL,
  `category` varchar(100),
  `is_active` tinyint NOT NULL DEFAULT 1,
  `created_by` int,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_training_documents_id` PRIMARY KEY(`id`)
);

-- DB-11: Training Center — Custom Action Triggers
CREATE TABLE IF NOT EXISTS `ai_action_triggers` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `trigger_phrase` varchar(300) NOT NULL,
  `action_type` varchar(100) NOT NULL,
  `action_config` json,
  `priority` int NOT NULL DEFAULT 0,
  `is_active` tinyint NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_action_triggers_id` PRIMARY KEY(`id`)
);

-- DB-12: AI Feedback per domain (v2 — new version with domain isolation)
CREATE TABLE IF NOT EXISTS `ai_feedback_v2` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `conversation_id` varchar(100),
  `message_index` int,
  `tool_name` varchar(100),
  `rating` enum('helpful','not_helpful') NOT NULL,
  `reason` text,
  `user_id` int,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_feedback_v2_id` PRIMARY KEY(`id`)
);

-- DB-13: Official Message Templates
CREATE TABLE IF NOT EXISTS `ai_message_templates` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `template_type` varchar(100) NOT NULL,
  `title` varchar(500) NOT NULL,
  `title_en` varchar(500),
  `content` text NOT NULL,
  `placeholders` json,
  `example_input` text,
  `example_output` text,
  `version` int NOT NULL DEFAULT 1,
  `is_active` tinyint NOT NULL DEFAULT 1,
  `created_by` int,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_message_templates_id` PRIMARY KEY(`id`)
);

-- DB-14: System Events for knowledge refresh
CREATE TABLE IF NOT EXISTS `ai_system_events` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `event_type` enum('create','update','delete') NOT NULL,
  `resource_type` varchar(100) NOT NULL,
  `resource_id` varchar(100),
  `resource_name` varchar(500),
  `changes` json,
  `triggered_by` int,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_system_events_id` PRIMARY KEY(`id`)
);

-- DB-15: Knowledge Refresh Status
CREATE TABLE IF NOT EXISTS `ai_knowledge_refresh_status` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `source_name` varchar(200) NOT NULL,
  `source_type` varchar(100) NOT NULL,
  `status` enum('idle','running','completed','error') NOT NULL DEFAULT 'idle',
  `last_refreshed_at` timestamp,
  `last_error` text,
  `item_count` int DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_knowledge_refresh_status_id` PRIMARY KEY(`id`)
);

-- SEC-01, API-08: Action Runs — audit trail for confirmed actions
CREATE TABLE IF NOT EXISTS `ai_action_runs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `conversation_id` varchar(100),
  `user_id` int NOT NULL,
  `action_type` varchar(100) NOT NULL,
  `action_description` text,
  `preview_data` json,
  `status` enum('pending','confirmed','cancelled','executed','rolled_back','failed') NOT NULL DEFAULT 'pending',
  `result_data` json,
  `confirmed_at` timestamp,
  `executed_at` timestamp,
  `rolled_back_at` timestamp,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_action_runs_id` PRIMARY KEY(`id`)
);

-- SEC-04: Retention Policies
CREATE TABLE IF NOT EXISTS `ai_retention_policies` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `resource_type` enum('conversations','training_documents','feedback','action_runs','task_memory','reports') NOT NULL,
  `retention_days` int NOT NULL DEFAULT 365,
  `auto_delete_enabled` tinyint NOT NULL DEFAULT 0,
  `last_cleanup_at` timestamp,
  `deleted_count` int DEFAULT 0,
  `is_active` tinyint NOT NULL DEFAULT 1,
  `created_by` int,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_retention_policies_id` PRIMARY KEY(`id`)
);

-- API-11/12: RAG Index per domain
CREATE TABLE IF NOT EXISTS `ai_rag_indexes` (
  `id` int AUTO_INCREMENT NOT NULL,
  `domain` enum('breaches','privacy') NOT NULL,
  `source_name` varchar(200) NOT NULL,
  `source_type` enum('glossary','page_descriptors','training_documents','knowledge_base','guides') NOT NULL,
  `document_count` int DEFAULT 0,
  `last_indexed_at` timestamp,
  `index_status` enum('idle','indexing','ready','error') NOT NULL DEFAULT 'idle',
  `last_error` text,
  `metadata` json,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ai_rag_indexes_id` PRIMARY KEY(`id`)
);

-- Indexes for performance
CREATE INDEX `idx_glossary_domain` ON `ai_glossary` (`domain`);
CREATE INDEX `idx_glossary_term` ON `ai_glossary` (`term`);
CREATE INDEX `idx_page_descriptors_domain_route` ON `ai_page_descriptors` (`domain`, `route`);
CREATE INDEX `idx_guide_catalog_domain` ON `ai_guide_catalog` (`domain`);
CREATE INDEX `idx_guide_steps_v2_guide_id` ON `ai_guide_steps_v2` (`guide_id`);
CREATE INDEX `idx_guide_sessions_user_id` ON `ai_guide_sessions` (`user_id`);
CREATE INDEX `idx_task_memory_user_domain` ON `ai_task_memory` (`user_id`, `domain`);
CREATE INDEX `idx_conversations_v2_user_domain` ON `ai_conversations_v2` (`user_id`, `domain`);
CREATE INDEX `idx_conversations_v2_conversation_id` ON `ai_conversations_v2` (`conversation_id`);
CREATE INDEX `idx_training_documents_domain` ON `ai_training_documents` (`domain`);
CREATE INDEX `idx_action_triggers_domain` ON `ai_action_triggers` (`domain`);
CREATE INDEX `idx_feedback_v2_domain` ON `ai_feedback_v2` (`domain`);
CREATE INDEX `idx_message_templates_domain_type` ON `ai_message_templates` (`domain`, `template_type`);
CREATE INDEX `idx_system_events_domain` ON `ai_system_events` (`domain`);
CREATE INDEX `idx_action_runs_user_domain` ON `ai_action_runs` (`user_id`, `domain`);
CREATE INDEX `idx_retention_policies_domain` ON `ai_retention_policies` (`domain`);
CREATE INDEX `idx_rag_indexes_domain` ON `ai_rag_indexes` (`domain`, `source_type`);
