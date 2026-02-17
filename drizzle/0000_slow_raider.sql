CREATE TABLE `ai_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500),
	`pageContext` varchar(500),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`metadata` json,
	`toolCalls` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_task_state` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`goal` text,
	`filters` json,
	`lastEntityType` varchar(100),
	`lastEntityId` int,
	`currentStep` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_task_state_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int NOT NULL,
	`requestedBy` int,
	`approvedBy` int,
	`status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
	`comments` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`decidedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(200),
	`action` varchar(200) NOT NULL,
	`entityType` varchar(100),
	`entityId` int,
	`details` json,
	`ipAddress` varchar(50),
	`userAgent` text,
	`before` json,
	`after` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(500),
	`type` enum('full','incremental','config_only') DEFAULT 'full',
	`status` enum('pending','running','completed','failed') DEFAULT 'pending',
	`fileUrl` text,
	`fileSize` bigint,
	`schedule` varchar(50),
	`errorMessage` text,
	`createdBy` int,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `breach_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(500) NOT NULL,
	`type` varchar(100),
	`url` text,
	`isActive` boolean DEFAULT true,
	`lastChecked` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `breach_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`catalogType` varchar(100) NOT NULL,
	`key` varchar(200) NOT NULL,
	`nameAr` varchar(500) NOT NULL,
	`nameEn` varchar(500),
	`description` text,
	`definition` text,
	`formula` text,
	`drillPath` varchar(500),
	`format` varchar(50),
	`category` varchar(200),
	`sortOrder` int DEFAULT 0,
	`isVisible` boolean DEFAULT true,
	`requiredRole` varchar(50),
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_clauses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clauseNumber` varchar(20) NOT NULL,
	`nameAr` varchar(500) NOT NULL,
	`nameEn` varchar(500),
	`descriptionAr` text,
	`descriptionEn` text,
	`category` varchar(100),
	`weight` float DEFAULT 1,
	`isActive` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_clauses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_layouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(500),
	`nameAr` varchar(500),
	`dataSource` varchar(100),
	`layout` json,
	`filters` json,
	`isDefault` boolean DEFAULT false,
	`isTemplate` boolean DEFAULT false,
	`isLocked` boolean DEFAULT false,
	`targetRole` varchar(100),
	`targetGroupId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dashboard_layouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feature_flags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`featureKey` varchar(200) NOT NULL,
	`nameAr` varchar(500) NOT NULL,
	`nameEn` varchar(500),
	`description` text,
	`isEnabled` boolean DEFAULT true,
	`scope` enum('platform','entity','group','user') DEFAULT 'platform',
	`scopeValue` varchar(200),
	`expiresAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feature_flags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `followup_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`followupId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
	`assignedTo` int,
	`dueDate` timestamp,
	`completedAt` timestamp,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `followup_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `followups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`type` enum('site_followup','incident_followup','general','corrective_action') DEFAULT 'general',
	`status` enum('open','in_progress','pending_approval','approved','rejected','completed','overdue') DEFAULT 'open',
	`priority` enum('critical','high','medium','low') DEFAULT 'medium',
	`relatedSiteId` int,
	`relatedIncidentId` int,
	`assignedTo` int,
	`assignedBy` int,
	`dueDate` timestamp,
	`completedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `followups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `glossary_terms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`term` varchar(500) NOT NULL,
	`synonyms` json,
	`definition` text,
	`relatedPage` varchar(200),
	`relatedEntity` varchar(200),
	`exampleQuestions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `glossary_terms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `group_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`nameAr` varchar(200),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guide_catalog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`purpose` text,
	`steps` json,
	`requiredRole` varchar(50),
	`isActive` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guide_catalog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incident_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incidentId` int NOT NULL,
	`fileName` varchar(500),
	`fileUrl` text,
	`fileKey` varchar(500),
	`fileType` varchar(100),
	`fileSize` bigint,
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `incident_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incident_datasets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incidentId` int NOT NULL,
	`datasetName` varchar(500),
	`piiCategory` varchar(200),
	`recordCount` bigint,
	`sampleFields` json,
	`sensitivity` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `incident_datasets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incident_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`incidentId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`title` varchar(500),
	`description` text,
	`performedBy` int,
	`metadata` json,
	`eventDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `incident_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`description` text,
	`status` enum('investigating','confirmed','contained','resolved','closed') DEFAULT 'investigating',
	`severity` enum('critical','high','medium','low') DEFAULT 'medium',
	`impactLevel` enum('catastrophic','severe','moderate','minor','negligible') DEFAULT 'moderate',
	`sensitivity` enum('very_high','high','medium','low') DEFAULT 'medium',
	`source` varchar(200),
	`sourceType` varchar(100),
	`affectedEntity` varchar(500),
	`affectedEntityType` varchar(100),
	`sector` varchar(200),
	`estimatedRecords` bigint,
	`estimatedIndividuals` bigint,
	`piiCategories` json,
	`dataTypes` json,
	`discoveredAt` timestamp,
	`confirmedAt` timestamp,
	`containedAt` timestamp,
	`resolvedAt` timestamp,
	`reportedBy` int,
	`assignedTo` int,
	`relatedSiteId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `letters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`letterNumber` varchar(100),
	`title` varchar(500) NOT NULL,
	`type` varchar(100),
	`content` text,
	`recipientEntity` varchar(500),
	`status` enum('draft','pending_approval','approved','sent','archived') DEFAULT 'draft',
	`templateId` int,
	`fileUrl` text,
	`verificationCode` varchar(64),
	`createdBy` int,
	`approvedBy` int,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `letters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `menus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`labelAr` varchar(500) NOT NULL,
	`labelEn` varchar(500),
	`icon` varchar(100),
	`path` varchar(500),
	`parentId` int,
	`workspace` varchar(100),
	`sortOrder` int DEFAULT 0,
	`isVisible` boolean DEFAULT true,
	`requiredRole` varchar(50),
	`badge` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message_templates_catalog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(500) NOT NULL,
	`type` varchar(100),
	`templateText` text,
	`placeholders` json,
	`examples` json,
	`version` int DEFAULT 1,
	`isActive` boolean DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `message_templates_catalog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`message` text,
	`type` varchar(100),
	`entityType` varchar(100),
	`entityId` int,
	`isRead` boolean DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `page_descriptors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageSlug` varchar(200) NOT NULL,
	`purpose` text,
	`mainElements` json,
	`commonTasks` json,
	`drillLinks` json,
	`suggestedQuestions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `page_descriptors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(200) NOT NULL,
	`titleAr` varchar(500) NOT NULL,
	`titleEn` varchar(500),
	`description` text,
	`workspace` varchar(100),
	`isVisible` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`icon` varchar(100),
	`parentId` int,
	`requiredRole` varchar(50),
	`config` json,
	`version` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(200) NOT NULL,
	`settingValue` text,
	`settingType` varchar(50) DEFAULT 'string',
	`category` varchar(100),
	`description` text,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `privacy_policy_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`scanId` int,
	`policyText` text,
	`policyHash` varchar(64),
	`changeType` enum('new','minor','major','removed') DEFAULT 'new',
	`changeSummary` text,
	`diffFromPrevious` text,
	`version` int DEFAULT 1,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `privacy_policy_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(500) NOT NULL,
	`nameAr` varchar(500),
	`description` text,
	`type` varchar(100),
	`structure` json,
	`headerConfig` json,
	`footerConfig` json,
	`isActive` boolean DEFAULT true,
	`version` int DEFAULT 1,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`type` enum('privacy_compliance','incident_summary','executive_brief','custom','scheduled') DEFAULT 'custom',
	`templateId` int,
	`status` enum('draft','generating','ready','archived') DEFAULT 'draft',
	`filters` json,
	`content` text,
	`fileUrl` text,
	`fileKey` varchar(500),
	`format` varchar(20),
	`verificationCode` varchar(64),
	`qrCodeUrl` text,
	`generatedBy` int,
	`generatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`nameAr` varchar(200),
	`description` text,
	`isSystem` boolean DEFAULT false,
	`permissions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`name` varchar(500),
	`schedule` varchar(50),
	`cronExpression` varchar(100),
	`filters` json,
	`recipients` json,
	`format` varchar(20) DEFAULT 'pdf',
	`isActive` boolean DEFAULT true,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_requirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`scanId` int,
	`requirementCode` varchar(50) NOT NULL,
	`requirementNameAr` varchar(500),
	`requirementNameEn` varchar(500),
	`clauseNumber` varchar(20),
	`status` enum('met','partial','not_met','not_applicable') DEFAULT 'not_met',
	`evidence` text,
	`recommendation` text,
	`severity` enum('critical','high','medium','low') DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_requirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`scanType` varchar(50) DEFAULT 'standard',
	`status` enum('pending','running','completed','failed') DEFAULT 'pending',
	`complianceScore` float,
	`complianceStatus` varchar(50),
	`findings` json,
	`rawData` json,
	`privacyPolicyText` text,
	`privacyPolicyHash` varchar(64),
	`duration` int,
	`errorMessage` text,
	`scannedBy` int,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `site_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` text NOT NULL,
	`workingUrl` text,
	`finalUrl` text,
	`siteNameAr` varchar(500),
	`siteNameEn` varchar(500),
	`title` text,
	`description` text,
	`entityType` varchar(100),
	`entityNameAr` varchar(500),
	`entityNameEn` varchar(500),
	`sector` varchar(200),
	`complianceStatus` enum('compliant','partial','non_compliant','not_working') DEFAULT 'non_compliant',
	`hasPrivacyPolicy` boolean DEFAULT false,
	`hasContactInfo` boolean DEFAULT false,
	`privacyPolicyUrl` text,
	`phones` json,
	`emails` json,
	`mxRecords` json,
	`cms` varchar(100),
	`sslStatus` varchar(50),
	`httpStatus` int,
	`httpsStatus` int,
	`lastScanDate` timestamp,
	`lastChangeDate` timestamp,
	`followupPriority` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(200) NOT NULL,
	`source` varchar(200),
	`severity` enum('info','warning','error','critical') DEFAULT 'info',
	`message` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `threat_actors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(500) NOT NULL,
	`aliases` json,
	`description` text,
	`threatLevel` varchar(50),
	`activityCount` int DEFAULT 0,
	`lastActivity` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `threat_actors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ui_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageSlug` varchar(200),
	`elementSelector` varchar(500),
	`action` enum('show','hide','disable','relabel') DEFAULT 'show',
	`newLabel` varchar(500),
	`targetScope` varchar(100),
	`targetValue` varchar(200),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ui_policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roleId` int NOT NULL,
	`expiresAt` timestamp,
	`grantedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`phone` varchar(20),
	`loginMethod` varchar(64),
	`role` enum('user','admin','superadmin') NOT NULL DEFAULT 'user',
	`department` varchar(255),
	`organization` varchar(255),
	`avatarUrl` text,
	`preferences` json,
	`isActive` boolean DEFAULT true,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `verification_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int NOT NULL,
	`summary` text,
	`isValid` boolean DEFAULT true,
	`verifiedCount` int DEFAULT 0,
	`lastVerifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `verification_records_code_unique` UNIQUE(`code`)
);
