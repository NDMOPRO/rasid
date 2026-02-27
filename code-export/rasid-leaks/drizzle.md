# rasid-leaks - drizzle

> Auto-extracted source code documentation

---

## `drizzle/0000_condemned_mongoose.sql`

```sql
CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`username` varchar(64),
	`action` varchar(100) NOT NULL,
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `admin_audit_logs` (
	`id` varchar(36) NOT NULL,
	`aalUserId` int,
	`aalUserName` varchar(255),
	`aalAction` varchar(100) NOT NULL,
	`aalResourceType` varchar(100) NOT NULL,
	`aalResourceId` varchar(255),
	`aalResourceName` varchar(500),
	`aalOldValue` json,
	`aalNewValue` json,
	`aalReason` text,
	`aalIpAddress` varchar(45),
	`aalUserAgent` text,
	`aalIsRollbackable` boolean NOT NULL DEFAULT false,
	`aalRolledBack` boolean NOT NULL DEFAULT false,
	`aalRolledBackBy` int,
	`aalCreatedAt` bigint NOT NULL,
	CONSTRAINT `admin_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_feature_flags` (
	`id` varchar(36) NOT NULL,
	`ffKey` varchar(200) NOT NULL,
	`ffDisplayName` varchar(300) NOT NULL,
	`ffDisplayNameEn` varchar(300),
	`ffDescription` text,
	`ffIsEnabled` boolean NOT NULL DEFAULT true,
	`ffTargetType` enum('all','roles','groups','users','percentage') NOT NULL DEFAULT 'all',
	`ffTargetIds` json,
	`ffEnableAt` bigint,
	`ffDisableAt` bigint,
	`ffUpdatedBy` int,
	`ffCreatedAt` bigint NOT NULL,
	`ffUpdatedAt` bigint NOT NULL,
	CONSTRAINT `admin_feature_flags_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_feature_flags_ffKey_unique` UNIQUE(`ffKey`)
);
--> statement-breakpoint
CREATE TABLE `admin_group_memberships` (
	`id` varchar(36) NOT NULL,
	`gmGroupId` varchar(36) NOT NULL,
	`gmUserId` int NOT NULL,
	`gmJoinedAt` bigint NOT NULL,
	CONSTRAINT `admin_group_memberships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_group_permissions` (
	`id` varchar(36) NOT NULL,
	`gpGroupId` varchar(36) NOT NULL,
	`gpPermissionId` varchar(36) NOT NULL,
	`gpEffect` enum('allow','deny') NOT NULL DEFAULT 'allow',
	`gpCreatedAt` bigint NOT NULL,
	CONSTRAINT `admin_group_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_groups` (
	`id` varchar(36) NOT NULL,
	`groupName` varchar(200) NOT NULL,
	`groupNameEn` varchar(200) NOT NULL,
	`groupDescription` text,
	`groupDescriptionEn` text,
	`groupStatus` enum('active','disabled') NOT NULL DEFAULT 'active',
	`groupCreatedAt` bigint NOT NULL,
	`groupUpdatedAt` bigint NOT NULL,
	CONSTRAINT `admin_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_menu_items` (
	`id` varchar(36) NOT NULL,
	`miMenuId` varchar(36) NOT NULL,
	`miParentId` varchar(36),
	`miTitle` varchar(300) NOT NULL,
	`miTitleEn` varchar(300),
	`miIcon` varchar(100),
	`miLinkType` enum('internal','external','anchor','none') NOT NULL DEFAULT 'internal',
	`miLinkTarget` varchar(500),
	`miOpenNewTab` boolean NOT NULL DEFAULT false,
	`miVisibilityRules` json,
	`miBadge` varchar(50),
	`miBadgeColor` varchar(20),
	`miSortOrder` int NOT NULL DEFAULT 0,
	`miStatus` enum('active','disabled') NOT NULL DEFAULT 'active',
	`miCreatedAt` bigint NOT NULL,
	`miUpdatedAt` bigint NOT NULL,
	CONSTRAINT `admin_menu_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_menus` (
	`id` varchar(36) NOT NULL,
	`menuName` varchar(200) NOT NULL,
	`menuNameEn` varchar(200),
	`menuLocation` enum('sidebar','top_nav','footer','contextual','mobile') NOT NULL,
	`menuStatus` enum('active','disabled') NOT NULL DEFAULT 'active',
	`menuCreatedAt` bigint NOT NULL,
	`menuUpdatedAt` bigint NOT NULL,
	CONSTRAINT `admin_menus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_permissions` (
	`id` varchar(36) NOT NULL,
	`resourceType` enum('page','section','component','content_type','task','feature','api','menu') NOT NULL,
	`resourceId` varchar(200) NOT NULL,
	`resourceName` varchar(300) NOT NULL,
	`resourceNameEn` varchar(300),
	`permAction` enum('view','create','edit','delete','publish','unpublish','enable','disable','manage','export','approve') NOT NULL,
	`permDescription` text,
	`permCreatedAt` bigint NOT NULL,
	CONSTRAINT `admin_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_role_permissions` (
	`id` varchar(36) NOT NULL,
	`rpRoleId` varchar(36) NOT NULL,
	`rpPermissionId` varchar(36) NOT NULL,
	`rpEffect` enum('allow','deny') NOT NULL DEFAULT 'allow',
	`rpConditions` json,
	`rpCreatedAt` bigint NOT NULL,
	CONSTRAINT `admin_role_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_roles` (
	`id` varchar(36) NOT NULL,
	`roleName` varchar(200) NOT NULL,
	`roleNameEn` varchar(200) NOT NULL,
	`roleDescription` text,
	`roleDescriptionEn` text,
	`isSystem` boolean NOT NULL DEFAULT false,
	`rolePriority` int NOT NULL DEFAULT 0,
	`roleColor` varchar(20),
	`roleStatus` enum('active','disabled') NOT NULL DEFAULT 'active',
	`roleCreatedAt` bigint NOT NULL,
	`roleUpdatedAt` bigint NOT NULL,
	CONSTRAINT `admin_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_theme_settings` (
	`id` varchar(36) NOT NULL,
	`tsCategory` enum('colors','typography','layout','shadows','animations') NOT NULL,
	`tsKey` varchar(200) NOT NULL,
	`tsValue` text NOT NULL,
	`tsValueLight` text,
	`tsValueDark` text,
	`tsLabel` varchar(300),
	`tsLabelEn` varchar(300),
	`tsUpdatedBy` int,
	`tsUpdatedAt` bigint NOT NULL,
	CONSTRAINT `admin_theme_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_user_overrides` (
	`id` varchar(36) NOT NULL,
	`ouUserId` int NOT NULL,
	`ouPermissionId` varchar(36) NOT NULL,
	`ouEffect` enum('allow','deny') NOT NULL,
	`ouReason` text NOT NULL,
	`ouExpiresAt` bigint,
	`ouCreatedBy` int NOT NULL,
	`ouCreatedAt` bigint NOT NULL,
	CONSTRAINT `admin_user_overrides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_user_roles` (
	`id` varchar(36) NOT NULL,
	`urUserId` int NOT NULL,
	`urRoleId` varchar(36) NOT NULL,
	`urAssignedAt` bigint NOT NULL,
	`urAssignedBy` int,
	CONSTRAINT `admin_user_roles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`msgRole` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`sources` json,
	`tokensUsed` int,
	`durationMs` int,
	`model` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `ai_chat_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255),
	`title` varchar(500),
	`messageCount` int DEFAULT 0,
	`totalTokens` int DEFAULT 0,
	`totalDurationMs` int DEFAULT 0,
	`sessionStatus` enum('active','archived','exported') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `ai_custom_commands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`command` varchar(100) NOT NULL,
	`description` text,
	`handler` varchar(255) NOT NULL,
	`parameters` json,
	`exampleUsage` text,
	`isEnabled` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `ai_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chatHistoryId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` enum('good','bad') NOT NULL,
	`category` enum('accuracy','relevance','completeness','tone','other'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `ai_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `ai_response_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` varchar(64) NOT NULL,
	`ratingUserId` int NOT NULL,
	`ratingUserName` varchar(255),
	`rating` int NOT NULL,
	`userMessage` text,
	`aiResponse` text,
	`toolsUsed` json,
	`ratingFeedback` text,
	`ratingCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_response_ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`scenarioType` enum('greeting','farewell','help','error','report','custom_command','persona','escalation','vip_response') NOT NULL,
	`triggerPattern` text,
	`systemPrompt` text,
	`responseTemplate` text,
	`conditions` json,
	`priority` int DEFAULT 0,
	`isEnabled` tinyint NOT NULL DEFAULT 1,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `ai_search_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`query` text NOT NULL,
	`resultsCount` int DEFAULT 0,
	`topScore` float,
	`wasHelpful` tinyint,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `ai_training_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` enum('knowledge_added','knowledge_updated','knowledge_deleted','document_uploaded','document_processed','scenario_added','scenario_updated','action_added','action_updated','feedback_received') NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`details` text,
	`performedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `ai_user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionDate` date NOT NULL,
	`visitCount` int NOT NULL DEFAULT 1,
	`lastGreetingId` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `alert_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`contactNameAr` varchar(255),
	`contactEmail` varchar(320),
	`contactPhone` varchar(20),
	`contactRole` varchar(100),
	`contactRoleAr` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`alertChannels` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alert_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` int,
	`contactId` int,
	`alertContactName` varchar(255),
	`deliveryChannel` enum('email','sms') NOT NULL,
	`alertSubject` varchar(500) NOT NULL,
	`alertBody` text,
	`deliveryStatus` enum('sent','failed','pending') NOT NULL DEFAULT 'pending',
	`alertLeakId` varchar(32),
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alert_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alert_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleName` varchar(255) NOT NULL,
	`ruleNameAr` varchar(255),
	`severityThreshold` enum('critical','high','medium','low') NOT NULL,
	`alertChannel` enum('email','sms','both') NOT NULL DEFAULT 'email',
	`isEnabled` boolean NOT NULL DEFAULT true,
	`ruleRecipients` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`keyHash` varchar(255) NOT NULL,
	`keyPrefix` varchar(16) NOT NULL,
	`name` varchar(100) NOT NULL,
	`permissions` json,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` tinyint DEFAULT 1,
	`requestCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `app_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appId` int NOT NULL,
	`overallScore` float,
	`complianceStatus` enum('compliant','partially_compliant','non_compliant','no_policy') DEFAULT 'no_policy',
	`summary` text,
	`clause1Compliant` tinyint DEFAULT 0,
	`clause1Evidence` text,
	`clause2Compliant` tinyint DEFAULT 0,
	`clause2Evidence` text,
	`clause3Compliant` tinyint DEFAULT 0,
	`clause3Evidence` text,
	`clause4Compliant` tinyint DEFAULT 0,
	`clause4Evidence` text,
	`clause5Compliant` tinyint DEFAULT 0,
	`clause5Evidence` text,
	`clause6Compliant` tinyint DEFAULT 0,
	`clause6Evidence` text,
	`clause7Compliant` tinyint DEFAULT 0,
	`clause7Evidence` text,
	`clause8Compliant` tinyint DEFAULT 0,
	`clause8Evidence` text,
	`privacyTextContent` text,
	`detectedLanguage` varchar(10),
	`recommendations` json,
	`scannedBy` int,
	`scanDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`userName` varchar(255),
	`action` varchar(100) NOT NULL,
	`auditCategory` enum('auth','leak','export','pii','user','report','system','monitoring','enrichment','alert','retention','api','user_management') NOT NULL DEFAULT 'system',
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `batch_scan_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobName` text,
	`totalUrls` int DEFAULT 0,
	`completedUrls` int DEFAULT 0,
	`failedUrls` int DEFAULT 0,
	`status` enum('pending','running','completed','failed','cancelled') DEFAULT 'pending',
	`results` json,
	`createdBy` int,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `bulk_analysis_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobName` text NOT NULL,
	`totalUrls` int NOT NULL DEFAULT 0,
	`analyzedUrls` int NOT NULL DEFAULT 0,
	`failedUrls` int NOT NULL DEFAULT 0,
	`compliantCount` int NOT NULL DEFAULT 0,
	`partialCount` int NOT NULL DEFAULT 0,
	`nonCompliantCount` int NOT NULL DEFAULT 0,
	`noPolicyCount` int NOT NULL DEFAULT 0,
	`avgScore` float,
	`status` enum('pending','running','paused','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`sourceType` enum('csv_import','manual','crawl_results') NOT NULL DEFAULT 'manual',
	`createdBy` int,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `bulk_analysis_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`privacyUrl` text,
	`overallScore` float,
	`complianceStatus` enum('compliant','partially_compliant','non_compliant','no_policy','error') NOT NULL DEFAULT 'no_policy',
	`clause1` tinyint DEFAULT 0,
	`clause1Evidence` text,
	`clause2` tinyint DEFAULT 0,
	`clause2Evidence` text,
	`clause3` tinyint DEFAULT 0,
	`clause3Evidence` text,
	`clause4` tinyint DEFAULT 0,
	`clause4Evidence` text,
	`clause5` tinyint DEFAULT 0,
	`clause5Evidence` text,
	`clause6` tinyint DEFAULT 0,
	`clause6Evidence` text,
	`clause7` tinyint DEFAULT 0,
	`clause7Evidence` text,
	`clause8` tinyint DEFAULT 0,
	`clause8Evidence` text,
	`summary` text,
	`recommendations` json,
	`privacyTextLength` int DEFAULT 0,
	`errorMessage` text,
	`analyzedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `case_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`parentId` int,
	`isInternal` tinyint DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `case_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`fromStage` varchar(50),
	`toStage` varchar(50) NOT NULL,
	`action` varchar(100) NOT NULL,
	`comment` text,
	`attachments` json,
	`performedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseNumber` varchar(50) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`siteId` int,
	`appId` int,
	`requesterId` int,
	`assignedTo` int,
	`stage` enum('submission','intake_validation','define_field','legal_review','jurisdiction_check','measure_justification','decision','registered','closed') DEFAULT 'submission',
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('open','in_progress','pending_review','escalated','resolved','closed') DEFAULT 'open',
	`dueDate` timestamp,
	`resolvedAt` timestamp,
	`closedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `change_detection_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`scanId` int NOT NULL,
	`previousScanId` int NOT NULL,
	`changeType` enum('added','removed','modified','no_change') DEFAULT 'no_change',
	`previousScore` float,
	`newScore` float,
	`scoreDelta` float,
	`previousStatus` varchar(50),
	`newStatus` varchar(50),
	`clauseChanges` json,
	`textDiffSummary` text,
	`policyAdded` tinyint DEFAULT 0,
	`policyRemoved` tinyint DEFAULT 0,
	`significantChange` tinyint DEFAULT 0,
	`detectedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `channels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channelId` varchar(32) NOT NULL,
	`name` varchar(255) NOT NULL,
	`platform` enum('telegram','darkweb','paste') NOT NULL,
	`subscribers` int DEFAULT 0,
	`status` enum('active','paused','flagged') NOT NULL DEFAULT 'active',
	`lastActivity` timestamp,
	`leaksDetected` int DEFAULT 0,
	`riskLevel` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `channels_id` PRIMARY KEY(`id`),
	CONSTRAINT `channels_channelId_unique` UNIQUE(`channelId`)
);
--> statement-breakpoint
CREATE TABLE `chat_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ccConversationId` varchar(64) NOT NULL,
	`ccUserId` varchar(64) NOT NULL,
	`ccUserName` varchar(255),
	`ccTitle` varchar(500) NOT NULL,
	`ccSummary` text,
	`ccMessageCount` int NOT NULL DEFAULT 0,
	`ccTotalToolsUsed` int NOT NULL DEFAULT 0,
	`ccStatus` enum('active','archived','exported') NOT NULL DEFAULT 'active',
	`ccCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`ccUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `chat_conversations_ccConversationId_unique` UNIQUE(`ccConversationId`)
);
--> statement-breakpoint
CREATE TABLE `chat_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`response` text NOT NULL,
	`rating` enum('good','bad'),
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cmConversationId` varchar(64) NOT NULL,
	`cmMessageId` varchar(64) NOT NULL,
	`cmRole` enum('user','assistant') NOT NULL,
	`cmContent` text NOT NULL,
	`cmToolsUsed` json,
	`cmThinkingSteps` json,
	`cmRating` int,
	`cmCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`previousStatus` varchar(50),
	`newStatus` varchar(50) NOT NULL,
	`previousScore` float,
	`newScore` float,
	`scanId` int,
	`isRead` tinyint DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `compliance_change_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`previousStatus` varchar(50),
	`newStatus` varchar(50) NOT NULL,
	`previousScore` int,
	`newScore` int NOT NULL,
	`emailSent` tinyint NOT NULL DEFAULT 0,
	`emailSentTo` text,
	`emailSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `content_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockKey` varchar(150) NOT NULL,
	`pageKey` varchar(100),
	`blockType` enum('text','html','image','logo','banner','footer','header','widget') DEFAULT 'text',
	`titleAr` text,
	`titleEn` text,
	`contentAr` text,
	`contentEn` text,
	`imageUrl` text,
	`linkUrl` text,
	`sortOrder` int DEFAULT 0,
	`isVisible` tinyint DEFAULT 1,
	`customCss` text,
	`metadata` json,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `custom_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`triggerPhrase` varchar(255) NOT NULL,
	`aliases` json,
	`actionType` enum('call_function','custom_code','redirect','api_call') NOT NULL,
	`actionTarget` text,
	`description` text,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `dark_web_listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`listingSeverity` enum('critical','high','medium','low') NOT NULL,
	`sourceChannelId` int,
	`sourceName` varchar(255),
	`price` varchar(50),
	`recordCount` int DEFAULT 0,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dark_web_listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dashboard_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`snapshotDate` date NOT NULL,
	`totalWebsites` int DEFAULT 0,
	`compliantCount` int DEFAULT 0,
	`partialCount` int DEFAULT 0,
	`nonCompliantCount` int DEFAULT 0,
	`noPolicyCount` int DEFAULT 0,
	`averageScore` decimal(5,2) DEFAULT '0',
	`criterion1Rate` decimal(5,2) DEFAULT '0',
	`criterion2Rate` decimal(5,2) DEFAULT '0',
	`criterion3Rate` decimal(5,2) DEFAULT '0',
	`criterion4Rate` decimal(5,2) DEFAULT '0',
	`criterion5Rate` decimal(5,2) DEFAULT '0',
	`criterion6Rate` decimal(5,2) DEFAULT '0',
	`criterion7Rate` decimal(5,2) DEFAULT '0',
	`criterion8Rate` decimal(5,2) DEFAULT '0',
	`sectorBreakdown` json,
	`domainTypeBreakdown` json,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `data_transfer_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transferType` enum('export','import') NOT NULL,
	`dataSection` varchar(100) NOT NULL,
	`fileName` varchar(255),
	`fileUrl` text,
	`recordCount` int DEFAULT 0,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`errorMessage` text,
	`userId` int NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`completedAt` timestamp
);
--> statement-breakpoint
CREATE TABLE `deep_scan_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`status` enum('pending','scanning','completed','failed','skipped') NOT NULL DEFAULT 'pending',
	`siteReachable` tinyint DEFAULT 0,
	`siteName` text,
	`siteTitle` text,
	`httpStatus` int,
	`redirectUrl` text,
	`privacyUrl` text,
	`privacyMethod` varchar(100),
	`privacyTextContent` text,
	`privacyTextLength` int DEFAULT 0,
	`privacyLanguage` varchar(10),
	`screenshotUrl` text,
	`privacyScreenshotUrl` text,
	`contactUrl` text,
	`contactEmails` text,
	`contactPhones` text,
	`socialLinks` json,
	`overallScore` float,
	`complianceStatus` enum('compliant','partially_compliant','non_compliant','no_policy','error') DEFAULT 'no_policy',
	`clause1Compliant` tinyint DEFAULT 0,
	`clause1Evidence` text,
	`clause2Compliant` tinyint DEFAULT 0,
	`clause2Evidence` text,
	`clause3Compliant` tinyint DEFAULT 0,
	`clause3Evidence` text,
	`clause4Compliant` tinyint DEFAULT 0,
	`clause4Evidence` text,
	`clause5Compliant` tinyint DEFAULT 0,
	`clause5Evidence` text,
	`clause6Compliant` tinyint DEFAULT 0,
	`clause6Evidence` text,
	`clause7Compliant` tinyint DEFAULT 0,
	`clause7Evidence` text,
	`clause8Compliant` tinyint DEFAULT 0,
	`clause8Evidence` text,
	`summary` text,
	`recommendations` json,
	`rating` varchar(50),
	`errorMessage` text,
	`retryCount` int DEFAULT 0,
	`scanDuration` int DEFAULT 0,
	`scannedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` varchar(64) NOT NULL,
	`recordId` varchar(32),
	`verificationCode` varchar(32) NOT NULL,
	`contentHash` varchar(128) NOT NULL,
	`documentType` enum('incident_report','custom_report','executive_summary','compliance_report','sector_report') DEFAULT 'incident_report',
	`title` varchar(500),
	`titleAr` varchar(500),
	`generatedBy` int,
	`generatedByName` varchar(200),
	`pdfUrl` text,
	`htmlContent` text,
	`metadata` json,
	`isVerified` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `email_notification_prefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailAddress` varchar(255) NOT NULL,
	`notifyOnStatusChange` tinyint NOT NULL DEFAULT 1,
	`notifyOnScoreChange` tinyint NOT NULL DEFAULT 1,
	`notifyOnNewScan` tinyint NOT NULL DEFAULT 0,
	`notifyOnCriticalOnly` tinyint NOT NULL DEFAULT 0,
	`minScoreChangeThreshold` int DEFAULT 10,
	`sectorFilter` json,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`lastNotifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `escalation_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`caseId` int NOT NULL,
	`ruleId` int NOT NULL,
	`previousStage` varchar(50) NOT NULL,
	`newStage` varchar(50) NOT NULL,
	`previousPriority` varchar(20),
	`newPriority` varchar(20),
	`hoursOverdue` float,
	`notified` tinyint DEFAULT 0,
	`escalatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `escalation_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`fromStage` enum('submission','intake_validation','define_field','legal_review','jurisdiction_check','measure_justification','decision','registered') NOT NULL,
	`toStage` enum('submission','intake_validation','define_field','legal_review','jurisdiction_check','measure_justification','decision','registered','closed') NOT NULL,
	`maxHours` int NOT NULL DEFAULT 48,
	`escalatePriority` enum('low','medium','high','critical'),
	`appliesTo` enum('low','medium','high','critical'),
	`notifyRoles` json,
	`isActive` tinyint DEFAULT 1,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `evidence_chain` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evidenceId` varchar(64) NOT NULL,
	`evidenceLeakId` varchar(32) NOT NULL,
	`evidenceType` enum('text','screenshot','file','metadata') NOT NULL,
	`contentHash` varchar(128) NOT NULL,
	`previousHash` varchar(128),
	`blockIndex` int NOT NULL,
	`capturedBy` varchar(255),
	`evidenceMetadata` json,
	`isVerified` boolean NOT NULL DEFAULT true,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	`evidenceCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidence_chain_id` PRIMARY KEY(`id`),
	CONSTRAINT `evidence_chain_evidenceId_unique` UNIQUE(`evidenceId`)
);
--> statement-breakpoint
CREATE TABLE `executive_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`severity` enum('critical','high','medium','low') DEFAULT 'medium',
	`alertType` varchar(50) NOT NULL,
	`entityId` int,
	`entityName` varchar(255),
	`title` varchar(255) NOT NULL,
	`description` text,
	`suggestedAction` text,
	`isAcknowledged` tinyint DEFAULT 0,
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `executive_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportType` enum('daily','weekly','monthly') DEFAULT 'weekly',
	`reportDate` date NOT NULL,
	`contentJson` json,
	`pdfUrl` text,
	`isSent` tinyint DEFAULT 0,
	`sentAt` timestamp,
	`recipients` json,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `feedback_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feedbackLeakId` varchar(32) NOT NULL,
	`feedbackUserId` int,
	`feedbackUserName` varchar(255),
	`systemClassification` enum('personal_data','cybersecurity','clean','unknown') NOT NULL,
	`analystClassification` enum('personal_data','cybersecurity','clean','unknown') NOT NULL,
	`isCorrect` boolean NOT NULL,
	`feedbackNotes` text,
	`feedbackCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incident_certifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certCode` varchar(64) NOT NULL,
	`incidentId` varchar(64) NOT NULL,
	`incidentTitle` varchar(500) NOT NULL,
	`incidentTitleAr` varchar(500),
	`certSeverity` varchar(20),
	`certSector` varchar(200),
	`certRecordsExposed` bigint,
	`issuedBy` varchar(255) NOT NULL,
	`issuedByUserId` varchar(64) NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`certPdfUrl` text,
	`certHtmlContent` text,
	`certSha256Hash` varchar(128),
	`certStatus` enum('active','revoked') NOT NULL DEFAULT 'active',
	`revokedAt` timestamp,
	`revokedBy` varchar(255),
	`verifiedCount` int DEFAULT 0,
	`lastVerifiedAt` timestamp,
	CONSTRAINT `incident_certifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `incident_certifications_certCode_unique` UNIQUE(`certCode`)
);
--> statement-breakpoint
CREATE TABLE `incident_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` varchar(64) NOT NULL,
	`leakId` varchar(32) NOT NULL,
	`verificationCode` varchar(32) NOT NULL,
	`contentHash` varchar(128) NOT NULL,
	`documentType` enum('incident_report','custom_report','executive_summary') NOT NULL DEFAULT 'incident_report',
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500) NOT NULL,
	`generatedBy` int NOT NULL,
	`generatedByName` varchar(200),
	`pdfUrl` text,
	`docMetadata` json,
	`isVerified` boolean DEFAULT true,
	`docCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `incident_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `incident_documents_documentId_unique` UNIQUE(`documentId`),
	CONSTRAINT `incident_documents_verificationCode_unique` UNIQUE(`verificationCode`)
);
--> statement-breakpoint
CREATE TABLE `kb_search_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kbsQuery` text NOT NULL,
	`kbsResultsCount` int DEFAULT 0,
	`kbsMatchedIds` json,
	`kbsUserId` int,
	`kbsSource` enum('manual','ai_auto','api') NOT NULL DEFAULT 'manual',
	`kbsCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `kb_search_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_base` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('document','qa','feedback','article','faq','regulation','term','guide','document_chunk') NOT NULL,
	`question` text,
	`answer` text,
	`content` text,
	`source` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`title` varchar(500),
	`category` varchar(100),
	`tags` json,
	`embedding` json,
	`embeddingModel` varchar(100),
	`tokenCount` int,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`viewCount` int DEFAULT 0,
	`useCount` int DEFAULT 0,
	`createdBy` int
);
--> statement-breakpoint
CREATE TABLE `knowledge_graph_edges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceNodeId` varchar(64) NOT NULL,
	`targetNodeId` varchar(64) NOT NULL,
	`edgeRelationship` varchar(100) NOT NULL,
	`edgeRelationshipAr` varchar(100),
	`edgeWeight` int DEFAULT 1,
	`edgeMetadata` json,
	`edgeCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledge_graph_edges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_graph_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nodeId` varchar(64) NOT NULL,
	`nodeType` enum('leak','seller','entity','sector','pii_type','platform','campaign') NOT NULL,
	`nodeLabel` varchar(255) NOT NULL,
	`nodeLabelAr` varchar(255),
	`nodeMetadata` json,
	`nodeCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `knowledge_graph_nodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `knowledge_graph_nodes_nodeId_unique` UNIQUE(`nodeId`)
);
--> statement-breakpoint
CREATE TABLE `kpi_targets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`nameAr` text NOT NULL,
	`category` enum('compliance','scanning','response','coverage','quality') DEFAULT 'compliance',
	`targetValue` float NOT NULL,
	`currentValue` float,
	`unit` varchar(20) DEFAULT '%',
	`period` enum('monthly','quarterly','yearly') DEFAULT 'monthly',
	`direction` enum('higher_is_better','lower_is_better') DEFAULT 'higher_is_better',
	`thresholdGreen` float DEFAULT 80,
	`thresholdYellow` float DEFAULT 60,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `leaks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leakId` varchar(32) NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500) NOT NULL,
	`source` enum('telegram','darkweb','paste') NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`sector` varchar(100) NOT NULL,
	`sectorAr` varchar(100) NOT NULL,
	`piiTypes` json NOT NULL,
	`recordCount` int NOT NULL DEFAULT 0,
	`status` enum('new','analyzing','documented','reported') NOT NULL DEFAULT 'new',
	`description` text,
	`descriptionAr` text,
	`aiSeverity` enum('critical','high','medium','low'),
	`aiSummary` text,
	`aiSummaryAr` text,
	`aiRecommendations` json,
	`aiRecommendationsAr` json,
	`aiConfidence` int,
	`enrichedAt` timestamp,
	`sampleData` json,
	`sourceUrl` text,
	`sourcePlatform` varchar(255),
	`screenshotUrls` json,
	`threatActor` varchar(255),
	`leakPrice` varchar(100),
	`breachMethod` varchar(255),
	`breachMethodAr` varchar(255),
	`region` varchar(100),
	`regionAr` varchar(100),
	`city` varchar(100),
	`cityAr` varchar(100),
	`latitude` varchar(20),
	`longitude` varchar(20),
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaks_id` PRIMARY KEY(`id`),
	CONSTRAINT `leaks_leakId_unique` UNIQUE(`leakId`)
);
--> statement-breakpoint
CREATE TABLE `letters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`scanId` int,
	`recipientEmail` varchar(320),
	`subject` text,
	`body` text,
	`status` enum('draft','sent','delivered','read','responded','escalated') DEFAULT 'draft',
	`escalationLevel` int DEFAULT 0,
	`sentAt` timestamp,
	`respondedAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`templateId` int,
	`deadline` timestamp,
	`reminderSentAt` timestamp,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `message_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateKey` varchar(100) NOT NULL,
	`nameAr` text NOT NULL,
	`nameEn` varchar(255),
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`variables` json,
	`category` varchar(50),
	`isActive` tinyint DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `mobile_apps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appName` text,
	`appNameAr` text,
	`developer` text,
	`platform` enum('android','ios','huawei') NOT NULL,
	`storeUrl` text NOT NULL,
	`packageName` varchar(255),
	`privacyPolicyUrl` text,
	`iconUrl` text,
	`downloads` varchar(50),
	`rating` float,
	`category` varchar(100),
	`sectorType` enum('public','private') DEFAULT 'private',
	`entityName` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `monitoring_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`jobName` varchar(255) NOT NULL,
	`jobNameAr` varchar(255) NOT NULL,
	`jobPlatform` enum('telegram','darkweb','paste','all') NOT NULL,
	`cronExpression` varchar(50) NOT NULL,
	`jobStatus` enum('active','paused','running','error') NOT NULL DEFAULT 'active',
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`lastResult` text,
	`leaksFound` int DEFAULT 0,
	`totalRuns` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monitoring_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `monitoring_jobs_jobId_unique` UNIQUE(`jobId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`title` text,
	`message` text,
	`type` enum('info','warning','success','error') DEFAULT 'info',
	`isRead` tinyint DEFAULT 0,
	`link` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `osint_queries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryId` varchar(32) NOT NULL,
	`queryName` varchar(255) NOT NULL,
	`queryNameAr` varchar(255) NOT NULL,
	`queryType` enum('google_dork','shodan','recon','spiderfoot') NOT NULL,
	`queryCategory` varchar(100) NOT NULL,
	`queryCategoryAr` varchar(100),
	`queryText` text NOT NULL,
	`queryDescription` text,
	`queryDescriptionAr` text,
	`queryResultsCount` int DEFAULT 0,
	`queryLastRunAt` timestamp,
	`queryEnabled` boolean NOT NULL DEFAULT true,
	`queryCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `osint_queries_id` PRIMARY KEY(`id`),
	CONSTRAINT `osint_queries_queryId_unique` UNIQUE(`queryId`)
);
--> statement-breakpoint
CREATE TABLE `page_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageKey` varchar(100) NOT NULL,
	`titleAr` varchar(200) NOT NULL,
	`titleEn` varchar(200),
	`description` text,
	`icon` varchar(50),
	`path` varchar(200) NOT NULL,
	`parentGroup` varchar(100),
	`sortOrder` int DEFAULT 0,
	`isVisible` tinyint DEFAULT 1,
	`isEnabled` tinyint DEFAULT 1,
	`requiredRole` varchar(50),
	`customCss` text,
	`customTitle` text,
	`customDescription` text,
	`badgeText` varchar(50),
	`badgeColor` varchar(20),
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`used` tinyint DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `paste_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(255) NOT NULL,
	`sourceName` varchar(255) NOT NULL,
	`fileSize` varchar(50),
	`pastePiiTypes` json,
	`preview` text,
	`pasteStatus` enum('flagged','analyzing','documented','reported') NOT NULL DEFAULT 'flagged',
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paste_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pdf_report_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportType` enum('compliance_summary','sector_comparison','trend_analysis','full_report','monthly_comparison') DEFAULT 'compliance_summary',
	`title` varchar(255) NOT NULL,
	`pdfUrl` text,
	`fileSize` int,
	`generatedBy` int,
	`scheduledReportId` int,
	`recipientsSent` json,
	`isAutoGenerated` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `personality_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('welcome_first','welcome_return','leader_respect','farewell','encouragement','occasion') NOT NULL,
	`triggerKeyword` varchar(100),
	`textAr` text NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `pii_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`inputText` text NOT NULL,
	`results` json NOT NULL,
	`totalMatches` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pii_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('page_view','scan','report','login','export','search','api_call') NOT NULL,
	`userId` int,
	`page` varchar(255),
	`metadata` json,
	`sessionId` varchar(100),
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(150) NOT NULL,
	`settingValue` text,
	`settingType` enum('string','number','boolean','json','image','color') DEFAULT 'string',
	`category` enum('branding','theme','typography','layout','pages','content','login_page','sidebar','header','stats_cards','tables','forms','dialogs','reports','letters','scans','ai_assistant','error_pages','email_templates','export','in_app_notifications','executive_dashboard','advanced','members','data_transfer','seo','dashboard','notifications','security') DEFAULT 'branding',
	`label` text,
	`labelEn` text,
	`description` text,
	`isEditable` tinyint DEFAULT 1,
	`sortOrder` int DEFAULT 0,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `platform_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(50) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(320),
	`mobile` varchar(20),
	`displayName` varchar(200) NOT NULL,
	`platformRole` enum('root_admin','director','vice_president','manager','analyst','viewer') NOT NULL DEFAULT 'viewer',
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_users_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `presentation_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`nameEn` varchar(255),
	`description` text,
	`category` enum('business_plan','report','sales_pitch','compliance','executive','custom') NOT NULL DEFAULT 'custom',
	`thumbnail` text,
	`slides` json NOT NULL,
	`isBuiltIn` tinyint NOT NULL DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `presentation_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `presentations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`templateId` int,
	`slides` json NOT NULL,
	`userId` int NOT NULL,
	`isPublic` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `presentations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` varchar(64),
	`documentId` varchar(64),
	`reportType` varchar(100),
	`generatedBy` int,
	`generatedByName` varchar(200),
	`complianceAcknowledged` tinyint NOT NULL DEFAULT 0,
	`acknowledgedAt` timestamp,
	`filters` json,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `report_executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`status` enum('running','completed','failed') DEFAULT 'running',
	`recipientCount` int DEFAULT 0,
	`summary` text,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleAr` varchar(500),
	`type` enum('monthly','quarterly','special') NOT NULL,
	`reportStatus` enum('draft','published') NOT NULL DEFAULT 'draft',
	`pageCount` int DEFAULT 0,
	`generatedBy` int,
	`fileUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `retention_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`retentionEntity` enum('leaks','audit_logs','notifications','pii_scans','paste_entries') NOT NULL,
	`entityLabel` varchar(100) NOT NULL,
	`entityLabelAr` varchar(100) NOT NULL,
	`retentionDays` int NOT NULL DEFAULT 365,
	`archiveAction` enum('delete','archive') NOT NULL DEFAULT 'archive',
	`isEnabled` boolean NOT NULL DEFAULT false,
	`lastRunAt` timestamp,
	`recordsArchived` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `retention_policies_id` PRIMARY KEY(`id`),
	CONSTRAINT `retention_policies_retentionEntity_unique` UNIQUE(`retentionEntity`)
);
--> statement-breakpoint
CREATE TABLE `saved_filters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`filters` json NOT NULL,
	`isDefault` tinyint DEFAULT 0,
	`isShared` tinyint DEFAULT 0,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `scan_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`dayOfWeek` int,
	`dayOfMonth` int,
	`hour` int DEFAULT 2,
	`targetType` enum('all_sites','sector','category','specific_sites','all_apps') DEFAULT 'all_sites',
	`targetFilter` json,
	`isActive` tinyint DEFAULT 1,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`overallScore` float,
	`rating` varchar(50),
	`complianceStatus` enum('compliant','partially_compliant','non_compliant','no_policy') DEFAULT 'no_policy',
	`summary` text,
	`clause1Compliant` tinyint DEFAULT 0,
	`clause1Evidence` text,
	`clause2Compliant` tinyint DEFAULT 0,
	`clause2Evidence` text,
	`clause3Compliant` tinyint DEFAULT 0,
	`clause3Evidence` text,
	`clause4Compliant` tinyint DEFAULT 0,
	`clause4Evidence` text,
	`clause5Compliant` tinyint DEFAULT 0,
	`clause5Evidence` text,
	`clause6Compliant` tinyint DEFAULT 0,
	`clause6Evidence` text,
	`clause7Compliant` tinyint DEFAULT 0,
	`clause7Evidence` text,
	`clause8Compliant` tinyint DEFAULT 0,
	`clause8Evidence` text,
	`recommendations` json,
	`screenshotUrl` text,
	`privacyTextContent` text,
	`scannedBy` int,
	`scanDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`detectedLanguage` varchar(10),
	`privacyTitle` text,
	`privacyStatusCode` varchar(10),
	`privacyLanguage` varchar(50),
	`privacyLastUpdate` text,
	`privacyEntityName` text,
	`privacyEmails` text,
	`privacyPhones` text,
	`privacyAddress` text,
	`privacyDpo` text,
	`privacyContactForm` text,
	`privacyInternalLinks` text,
	`privacyWordCount` int,
	`privacyCharCount` int,
	`privacyRobotsStatus` varchar(50),
	`privacyDiscoveryMethod` varchar(50),
	`privacyConfidence` int,
	`mentionsDataTypes` varchar(10),
	`dataTypesList` text,
	`mentionsPurpose` varchar(10),
	`purposeList` text,
	`mentionsLegalBasis` varchar(10),
	`mentionsRights` varchar(10),
	`rightsList` text,
	`mentionsRetention` varchar(10),
	`mentionsThirdParties` varchar(10),
	`thirdPartiesList` text,
	`mentionsCrossBorder` varchar(10),
	`mentionsSecurity` varchar(10),
	`mentionsCookies` varchar(10),
	`mentionsChildren` varchar(10),
	`privacyFinalUrl` text,
	`crawlStatus` varchar(50)
);
--> statement-breakpoint
CREATE TABLE `schedule_executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` int NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`totalSites` int DEFAULT 0,
	`completedSites` int DEFAULT 0,
	`failedSites` int DEFAULT 0,
	`status` enum('running','completed','failed') DEFAULT 'running',
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `scheduled_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`reportType` enum('compliance_summary','sector_comparison','trend_analysis','full_report','monthly_comparison') DEFAULT 'compliance_summary',
	`frequency` enum('daily','weekly','monthly') NOT NULL,
	`dayOfWeek` int,
	`dayOfMonth` int,
	`hour` int DEFAULT 8,
	`recipients` json,
	`filters` json,
	`includeCharts` tinyint DEFAULT 1,
	`isActive` tinyint DEFAULT 1,
	`lastSentAt` timestamp,
	`nextSendAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `seller_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` varchar(64) NOT NULL,
	`sellerName` varchar(255) NOT NULL,
	`sellerAliases` json,
	`sellerPlatforms` json NOT NULL,
	`totalLeaks` int DEFAULT 0,
	`sellerTotalRecords` int DEFAULT 0,
	`sellerRiskScore` int DEFAULT 0,
	`sellerRiskLevel` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`sellerSectors` json,
	`sellerLastActivity` timestamp,
	`sellerFirstSeen` timestamp NOT NULL DEFAULT (now()),
	`sellerNotes` text,
	`sellerIsActive` boolean NOT NULL DEFAULT true,
	`sellerCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`sellerUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seller_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `seller_profiles_sellerId_unique` UNIQUE(`sellerId`)
);
--> statement-breakpoint
CREATE TABLE `settings_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tableName` varchar(100) NOT NULL,
	`recordKey` varchar(255) NOT NULL,
	`fieldName` varchar(255) NOT NULL,
	`oldValue` text,
	`newValue` text,
	`changeType` enum('create','update','delete','rollback') NOT NULL DEFAULT 'update',
	`userId` int,
	`userName` varchar(255),
	`ipAddress` varchar(45),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `site_watchers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`siteId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `sites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`siteName` text,
	`sectorType` enum('public','private') DEFAULT 'private',
	`classification` varchar(100),
	`privacyUrl` text,
	`privacyMethod` varchar(100),
	`contactUrl` text,
	`emails` text,
	`siteStatus` enum('active','unreachable') DEFAULT 'active',
	`screenshotUrl` text,
	`privacyTextUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`siteNameAr` text,
	`siteNameEn` text,
	`siteTitle` text,
	`siteDescription` text,
	`phones` text,
	`workingUrl` text,
	`finalUrl` text,
	`httpsWww` varchar(50),
	`httpsNoWww` varchar(50),
	`httpWww` varchar(50),
	`httpNoWww` varchar(50),
	`mxRecords` text,
	`cms` varchar(100),
	`sslStatus` varchar(50)
);
--> statement-breakpoint
CREATE TABLE `smart_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`riskLevel` enum('low','medium','high','critical') DEFAULT 'medium',
	`riskScore` float,
	`predictedChange` text,
	`factors` json,
	`recommendations` json,
	`analysisData` json,
	`isActive` tinyint DEFAULT 1,
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`settingType` enum('string','number','boolean','json') DEFAULT 'string',
	`category` varchar(50) DEFAULT 'general',
	`label` text,
	`description` text,
	`isEditable` tinyint DEFAULT 1,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `theme_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`themeKey` varchar(100) NOT NULL,
	`themeValue` text,
	`themeType` enum('color','font','size','gradient','shadow','border','animation') DEFAULT 'color',
	`category` enum('primary','secondary','accent','background','text','border','shadow','font','layout') DEFAULT 'primary',
	`label` text,
	`description` text,
	`cssVariable` varchar(100),
	`previewValue` text,
	`isActive` tinyint DEFAULT 1,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `threat_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` varchar(32) NOT NULL,
	`ruleName` varchar(255) NOT NULL,
	`ruleNameAr` varchar(255) NOT NULL,
	`ruleDescription` text,
	`ruleDescriptionAr` text,
	`ruleCategory` enum('data_leak','credentials','sale_ad','db_dump','financial','health','government','telecom','education','infrastructure') NOT NULL,
	`ruleSeverity` enum('critical','high','medium','low') NOT NULL,
	`rulePatterns` json NOT NULL,
	`ruleKeywords` json,
	`ruleEnabled` boolean NOT NULL DEFAULT true,
	`ruleMatchCount` int DEFAULT 0,
	`ruleLastMatchAt` timestamp,
	`ruleCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `threat_rules_id` PRIMARY KEY(`id`),
	CONSTRAINT `threat_rules_ruleId_unique` UNIQUE(`ruleId`)
);
--> statement-breakpoint
CREATE TABLE `training_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`extractedContent` text,
	`chunksCount` int DEFAULT 0,
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `user_dashboard_widgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`widgetType` varchar(50) NOT NULL,
	`title` text,
	`position` int NOT NULL DEFAULT 0,
	`gridWidth` int NOT NULL DEFAULT 1,
	`isVisible` tinyint NOT NULL DEFAULT 1,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionToken` varchar(512) NOT NULL,
	`deviceInfo` varchar(255),
	`ipAddress` varchar(45),
	`isActive` tinyint NOT NULL DEFAULT 1,
	`expiresAt` timestamp NOT NULL,
	`lastActivity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`rasidRole` enum('root','admin','smart_monitor_manager','monitoring_director','monitoring_specialist','monitoring_officer','requester','respondent','ndmo_desk','legal_advisor','director','board_secretary','auditor') DEFAULT 'monitoring_officer',
	`username` varchar(64),
	`passwordHash` varchar(255),
	`displayName` varchar(255),
	`mobile` varchar(20),
	`failedLoginAttempts` int NOT NULL DEFAULT 0,
	`lockedUntil` timestamp,
	`emailNotifications` tinyint NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `visual_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siteId` int NOT NULL,
	`domain` varchar(255) NOT NULL,
	`siteName` text,
	`alertType` enum('status_change','score_change','policy_added','policy_removed','clause_change') DEFAULT 'status_change',
	`severity` enum('info','warning','critical','success') DEFAULT 'info',
	`previousStatus` varchar(50),
	`newStatus` varchar(50),
	`previousScore` float,
	`newScore` float,
	`message` text,
	`details` json,
	`isRead` tinyint NOT NULL DEFAULT 0,
	`isDismissed` tinyint NOT NULL DEFAULT 0,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `cases_caseNumber_unique` ON `cases` (`caseNumber`);--> statement-breakpoint
CREATE INDEX `content_blocks_blockKey_unique` ON `content_blocks` (`blockKey`);--> statement-breakpoint
CREATE INDEX `documents_documentId_unique` ON `documents` (`documentId`);--> statement-breakpoint
CREATE INDEX `documents_verificationCode_unique` ON `documents` (`verificationCode`);--> statement-breakpoint
CREATE INDEX `message_templates_templateKey_unique` ON `message_templates` (`templateKey`);--> statement-breakpoint
CREATE INDEX `page_configs_pageKey_unique` ON `page_configs` (`pageKey`);--> statement-breakpoint
CREATE INDEX `password_reset_tokens_token_unique` ON `password_reset_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `platform_settings_settingKey_unique` ON `platform_settings` (`settingKey`);--> statement-breakpoint
CREATE INDEX `sites_domain_unique` ON `sites` (`domain`);--> statement-breakpoint
CREATE INDEX `system_settings_settingKey_unique` ON `system_settings` (`settingKey`);--> statement-breakpoint
CREATE INDEX `theme_settings_themeKey_unique` ON `theme_settings` (`themeKey`);--> statement-breakpoint
CREATE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE INDEX `users_username_unique` ON `users` (`username`);
```

---

## `drizzle/0001_production_migration.sql`

```sql
-- ═══════════════════════════════════════════════════════════════
-- Migration: Production deployment for Prompts 2-5
-- Date: 2026-02-19
-- Description: Add 10 new tables + 4 new columns on leaks table
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Add publishStatus columns to leaks table ───
ALTER TABLE `leaks`
  ADD COLUMN `publishStatus` ENUM('draft','pending_review','published','archived') NOT NULL DEFAULT 'draft',
  ADD COLUMN `publishedAt` TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN `publishedBy` INT NULL DEFAULT NULL,
  ADD COLUMN `reviewNotes` TEXT NULL DEFAULT NULL;

-- ─── 2. import_jobs ───
CREATE TABLE IF NOT EXISTS `import_jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `jobId` VARCHAR(64) NOT NULL,
  `fileName` VARCHAR(500) NOT NULL,
  `fileType` ENUM('zip','json','xlsx','csv') NOT NULL,
  `fileSizeBytes` INT NOT NULL DEFAULT 0,
  `status` ENUM('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `totalRecords` INT NOT NULL DEFAULT 0,
  `processedRecords` INT NOT NULL DEFAULT 0,
  `successRecords` INT NOT NULL DEFAULT 0,
  `failedRecords` INT NOT NULL DEFAULT 0,
  `errorLog` JSON NULL,
  `importedBy` INT NOT NULL,
  `importedByName` VARCHAR(200) NULL,
  `startedAt` TIMESTAMP NULL DEFAULT NULL,
  `completedAt` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `import_jobs_jobId_unique` (`jobId`)
);

-- ─── 3. export_jobs ───
CREATE TABLE IF NOT EXISTS `export_jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `jobId` VARCHAR(64) NOT NULL,
  `exportType` ENUM('full_platform','section','page','single_record','custom_query') NOT NULL,
  `exportFormat` ENUM('zip','json','xlsx','csv','pdf') NOT NULL,
  `scope` VARCHAR(255) NULL,
  `filters` JSON NULL,
  `status` ENUM('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
  `totalRecords` INT NOT NULL DEFAULT 0,
  `fileSizeBytes` INT NULL DEFAULT 0,
  `fileUrl` TEXT NULL,
  `exportedBy` INT NOT NULL,
  `exportedByName` VARCHAR(200) NULL,
  `startedAt` TIMESTAMP NULL DEFAULT NULL,
  `completedAt` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `export_jobs_jobId_unique` (`jobId`)
);

-- ─── 4. page_registry ───
CREATE TABLE IF NOT EXISTS `page_registry` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `pageId` VARCHAR(100) NOT NULL,
  `path` VARCHAR(500) NOT NULL,
  `nameAr` VARCHAR(200) NOT NULL,
  `nameEn` VARCHAR(200) NOT NULL,
  `icon` VARCHAR(100) NULL,
  `category` ENUM('main','monitoring','analysis','admin','privacy') NOT NULL DEFAULT 'main',
  `sortOrder` INT NOT NULL DEFAULT 0,
  `isActive` TINYINT NOT NULL DEFAULT 1,
  `features` JSON NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `page_registry_pageId_unique` (`pageId`)
);

-- ─── 5. ai_personality_config ───
CREATE TABLE IF NOT EXISTS `ai_personality_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `apcKey` VARCHAR(100) NOT NULL,
  `apcValue` TEXT NOT NULL,
  `apcType` ENUM('string','number','boolean','json') NOT NULL DEFAULT 'string',
  `apcDescription` TEXT NULL,
  `apcUpdatedBy` INT NULL,
  `apcUpdatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `ai_personality_config_key_unique` (`apcKey`)
);

-- ─── 6. platform_assets ───
CREATE TABLE IF NOT EXISTS `platform_assets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `paKey` VARCHAR(100) NOT NULL,
  `paUrl` TEXT NOT NULL,
  `paType` ENUM('image','svg','icon') NOT NULL,
  `paWidth` INT NULL,
  `paHeight` INT NULL,
  `paFileSize` INT NULL,
  `paUpdatedBy` INT NULL,
  `paUpdatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `platform_assets_key_unique` (`paKey`)
);

-- ─── 7. api_providers ───
CREATE TABLE IF NOT EXISTS `api_providers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `apProviderId` VARCHAR(64) NOT NULL,
  `apName` VARCHAR(200) NOT NULL,
  `apType` ENUM('llm','search','sms','email','storage') NOT NULL,
  `apBaseUrl` TEXT NULL,
  `apKeyEncrypted` TEXT NULL,
  `apModel` VARCHAR(100) NULL,
  `apIsActive` TINYINT NOT NULL DEFAULT 1,
  `apRateLimit` INT NULL,
  `apUsedToday` INT NULL DEFAULT 0,
  `apLastChecked` TIMESTAMP NULL DEFAULT NULL,
  `apStatus` ENUM('active','inactive','error') NOT NULL DEFAULT 'active',
  `apCreatedBy` INT NULL,
  `apCreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `apUpdatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `api_providers_providerId_unique` (`apProviderId`)
);

-- ─── 8. templates ───
CREATE TABLE IF NOT EXISTS `templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `tplId` VARCHAR(64) NOT NULL,
  `tplName` VARCHAR(200) NOT NULL,
  `tplNameAr` VARCHAR(200) NOT NULL,
  `tplType` ENUM('report','notification','export','import') NOT NULL,
  `tplFormat` ENUM('pdf','docx','xlsx','csv','html','email','sms') NOT NULL,
  `tplContent` TEXT NOT NULL,
  `tplVariables` JSON NULL,
  `tplIsDefault` TINYINT NOT NULL DEFAULT 0,
  `tplIsActive` TINYINT NOT NULL DEFAULT 1,
  `tplCreatedBy` INT NULL,
  `tplCreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tplUpdatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `templates_templateId_unique` (`tplId`)
);

-- ─── 9. notification_rules ───
CREATE TABLE IF NOT EXISTS `notification_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `nrRuleId` VARCHAR(64) NOT NULL,
  `nrName` VARCHAR(200) NOT NULL,
  `nrNameAr` VARCHAR(200) NOT NULL,
  `nrTrigger` ENUM('new_leak','critical_leak','wide_impact_leak','system_failure','llm_failure','db_failure','weekly_report','monthly_report','user_login','user_locked','permission_change','import_complete','export_complete') NOT NULL,
  `nrConditions` JSON NULL,
  `nrChannels` JSON NOT NULL,
  `nrRecipients` JSON NOT NULL,
  `nrTemplateId` VARCHAR(64) NULL,
  `nrIsActive` TINYINT NOT NULL DEFAULT 1,
  `nrCreatedBy` INT NULL,
  `nrCreatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `notification_rules_ruleId_unique` (`nrRuleId`)
);

-- ─── 10. notification_log ───
CREATE TABLE IF NOT EXISTS `notification_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `nlRuleId` VARCHAR(64) NULL,
  `nlChannel` ENUM('internal','email','sms','slack','teams') NOT NULL,
  `nlRecipientId` INT NULL,
  `nlRecipientEmail` VARCHAR(320) NULL,
  `nlSubject` VARCHAR(500) NULL,
  `nlContent` TEXT NULL,
  `nlStatus` ENUM('sent','delivered','failed','bounced') NOT NULL,
  `nlErrorMessage` TEXT NULL,
  `nlSentAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── 11. system_health_log ───
CREATE TABLE IF NOT EXISTS `system_health_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `shService` ENUM('database','llm','api','railway') NOT NULL,
  `shStatus` ENUM('healthy','degraded','down','recovered') NOT NULL,
  `shResponseTime` INT NULL,
  `shErrorMessage` TEXT NULL,
  `shMetadata` JSON NULL,
  `shCheckedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

```

---

## `drizzle/0002_smart_monitor_requirements.sql`

```sql
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

```

---

## `drizzle/0003_seed_ai_infrastructure.sql`

```sql
-- ═══════════════════════════════════════════════════════════════
-- SEED DATA: AI Infrastructure — Glossary, Page Descriptors, Templates
-- DB-01 to DB-13 seed data for Smart Monitor requirements
-- ═══════════════════════════════════════════════════════════════

-- ═══ GLOSSARY TERMS — حالات الرصد (breaches domain) ═══

INSERT INTO `ai_glossary` (`domain`, `term`, `term_en`, `synonyms`, `definition`, `related_page`, `related_entity`, `example_questions`, `is_active`) VALUES
('breaches', 'حالة رصد', 'Detection Case', '["حالات رصد","رصد","حالة"]', 'ادعاء بوجود تسريب بيانات شخصية يتم رصده ومتابعته. لا يُعتبر تسريباً مؤكداً حتى اكتمال التحقق.', '/leaks', 'leak', '["كم حالة رصد جديدة؟","أعرض حالات الرصد واسعة النطاق"]', 1),
('breaches', 'العدد المُدّعى', 'Claimed Count', '["ادعاء البائع","العدد المزعوم"]', 'الرقم الذي يذكره البائع أو الناشر عن حجم البيانات — لم يتم التحقق منه.', '/leaks', 'leak', '["كم العدد المُدّعى؟","ما ادعاء البائع؟"]', 1),
('breaches', 'العينات المتاحة', 'Available Samples', '["عينات","بيانات موثقة"]', 'البيانات التي تم جمعها وتوثيقها فعلياً داخل منصة راصد.', '/leaks', 'leak', '["كم عينة متاحة؟","أعرض العينات"]', 1),
('breaches', 'تسريب مؤكد', 'Confirmed Breach', '["مؤكد","حالة مؤكدة"]', 'حالة رصد تم التحقق منها وتأكيد صحة التسريب — فقط بعد اكتمال التحقق الرسمي.', '/leaks', 'leak', '["هل هذا تسريب مؤكد؟","كم تسريب مؤكد؟"]', 1),
('breaches', 'سلسلة الأدلة', 'Evidence Chain', '["أدلة رقمية","توثيق"]', 'تسلسل موثق للأدلة الرقمية المرتبطة بحالة رصد — يحافظ على سلامة الدليل.', '/evidence-chain', 'evidence', '["وثّق دليل جديد","أعرض سلسلة الأدلة"]', 1),
('breaches', 'الدارك ويب', 'Dark Web', '["الويب المظلم","دارك نت"]', 'مواقع الإنترنت المخفية التي يُتداول فيها البيانات المسربة.', '/dark-web', 'darkweb_listing', '["ما آخر عروض الدارك ويب؟","كم قائمة نشطة؟"]', 1),
('breaches', 'ملف البائع', 'Seller Profile', '["بائع","مهاجم","ملف تعريف"]', 'ملف تعريفي لبائع بيانات مرصود — يتضمن مستوى الخطورة والنشاط.', '/sellers', 'seller', '["من أخطر البائعين؟","كم بائع مرصود؟"]', 1),
('breaches', 'واسعة النطاق', 'Large-Scale', '["critical","كبيرة"]', 'حالة رصد ذات عدد مُدّعى يتجاوز 10,000 سجل — أعلى مستوى تأثير.', '/leaks', 'leak', '["كم حالة رصد واسعة النطاق؟"]', 1);

-- ═══ GLOSSARY TERMS — الخصوصية (privacy domain) ═══

INSERT INTO `ai_glossary` (`domain`, `term`, `term_en`, `synonyms`, `definition`, `related_page`, `related_entity`, `example_questions`, `is_active`) VALUES
('privacy', 'المادة 12', 'Article 12', '["بنود الامتثال","article 12"]', 'المادة 12 من نظام حماية البيانات الشخصية (PDPL) — تتضمن 8 بنود إلزامية.', '/privacy', 'clause', '["كم نسبة الامتثال للمادة 12؟","ما البنود الناقصة؟"]', 1),
('privacy', 'نظام حماية البيانات الشخصية', 'PDPL', '["PDPL","النظام","قانون حماية البيانات"]', 'النظام السعودي لحماية البيانات الشخصية — يُلزم الجهات بحماية خصوصية البيانات.', '/privacy', NULL, '["ما متطلبات PDPL؟","هل الجهة ملتزمة؟"]', 1),
('privacy', 'سياسة الخصوصية', 'Privacy Policy', '["سياسة","إفصاح"]', 'وثيقة إلزامية تُوضح كيفية جمع ومعالجة البيانات الشخصية.', '/sites', 'site', '["هل الموقع يملك سياسة خصوصية؟","حلل سياسة الخصوصية"]', 1),
('privacy', 'حقوق أصحاب البيانات', 'Data Subject Rights', '["DSAR","حقوق","طلبات"]', 'حقوق الأفراد في الوصول لبياناتهم وتعديلها وحذفها وفقاً لـ PDPL.', '/privacy', NULL, '["كم طلب DSAR ورد؟","ما حقوق صاحب البيانات؟"]', 1),
('privacy', 'تقييم الأثر على الخصوصية', 'PIA/DPIA', '["DPIA","PIA","تقييم أثر"]', 'تقييم منهجي لتأثير أنشطة المعالجة على خصوصية البيانات الشخصية.', '/privacy', NULL, '["هل يلزم إجراء DPIA؟","ما نتيجة تقييم الأثر؟"]', 1),
('privacy', 'بند الامتثال', 'Compliance Clause', '["بند","clause","متطلب"]', 'أحد البنود الثمانية في المادة 12 — يُقيّم مدى التزام الجهة.', '/clauses', 'clause', '["ما أكثر البنود نقصاً؟","قارن البنود بين القطاعات"]', 1);

-- ═══ PAGE DESCRIPTORS ═══

INSERT INTO `ai_page_descriptors` (`domain`, `page_id`, `route`, `page_name`, `page_name_en`, `purpose`, `main_elements`, `common_tasks`, `available_actions`, `suggested_questions`, `is_active`) VALUES
('breaches', 'overview_dashboard', '/overview', 'لوحة المعلومات', 'Dashboard', 'عرض ملخص شامل لحالات الرصد والإحصائيات الرئيسية', '["بطاقات KPI","رسم بياني زمني","توزيع القطاعات","آخر حالات الرصد"]', '["عرض الملخص","تصفية بالفترة","تصدير تقرير"]', '["view_stats","filter_by_period","export_report"]', '[{"role":"analyst","question":"أعطني ملخص تنفيذي"},{"role":"manager","question":"ما أبرز حالات الرصد واسعة النطاق؟"}]', 1),
('breaches', 'incidents_list', '/leaks', 'حالات الرصد', 'Detection Cases', 'عرض وإدارة جميع حالات الرصد المكتشفة', '["جدول حالات الرصد","فلاتر التصفية","شريط البحث","أزرار التصدير"]', '["البحث عن حالة","تصفية بالتصنيف","تصدير البيانات","عرض التفاصيل"]', '["view_details","filter","create_case","export"]', '[{"role":"analyst","question":"صنف حالات الرصد حسب القطاع"},{"role":"manager","question":"كم حالة رصد واسعة النطاق؟"}]', 1),
('privacy', 'privacy_dashboard', '/privacy', 'لوحة الخصوصية', 'Privacy Dashboard', 'مؤشرات الامتثال لنظام حماية البيانات الشخصية', '["نسبة الامتثال العامة","توزيع البنود","مقارنة القطاعات","تنبيهات الامتثال"]', '["عرض نسبة الامتثال","مقارنة القطاعات","تحليل البنود"]', '["view_compliance","filter_by_sector","generate_report"]', '[{"role":"compliance_officer","question":"كم نسبة الامتثال العامة؟"},{"role":"manager","question":"ما أكثر البنود نقصاً؟"}]', 1),
('privacy', 'privacy_sites', '/sites', 'المواقع المراقبة', 'Monitored Sites', 'إدارة المواقع الخاضعة لمراقبة سياسات الخصوصية', '["جدول المواقع","حالة الامتثال","تاريخ آخر فحص","أزرار الفحص"]', '["فحص موقع جديد","عرض تفاصيل الموقع","تصدير النتائج"]', '["view_site","filter","scan","export"]', '[{"role":"analyst","question":"كم موقع تم رصده؟"},{"role":"compliance_officer","question":"أي المواقع لا تملك سياسة خصوصية؟"}]', 1),
('breaches', 'smart_rasid_full', '/smart-rasid', 'راصد الذكي', 'Smart Rasid', 'المساعد الذكي الشامل للمنصة — يدعم الاستفسارات والتحليلات والمهام', '["واجهة المحادثة","أزرار الإجراءات السريعة","سجل المحادثات","خطوات التفكير"]', '["طرح سؤال","تحليل بيانات","إنشاء تقرير","طلب دليل"]', '["chat","analyze","generate_report","guide"]', '[{"role":"all","question":"ما الجديد في المنصة؟"},{"role":"all","question":"حلل بياناتي"}]', 1),
('breaches', 'reports_list', '/reports', 'التقارير', 'Reports', 'إنشاء وعرض وتصدير التقارير المهنية', '["جدول التقارير","أزرار الإنشاء","خيارات التصدير","الجدولة"]', '["إنشاء تقرير جديد","عرض تقرير","تصدير PDF","جدولة تقرير"]', '["create_report","view_report","export","schedule"]', '[{"role":"manager","question":"أنشئ تقرير تنفيذي"},{"role":"analyst","question":"كم تقرير تم إنشاؤه هذا الشهر؟"}]', 1),
('breaches', 'dark_web_monitor', '/dark-web', 'مراقبة الويب المظلم', 'Dark Web Monitor', 'رصد التهديدات والعروض في الويب المظلم', '["قوائم الدارك ويب","تفاصيل العروض","مستوى الخطورة"]', '["عرض القوائم النشطة","البحث عن تهديد","تحليل الاتجاهات"]', '["view_listings","search"]', '[{"role":"analyst","question":"ما آخر عروض الدارك ويب؟"},{"role":"analyst","question":"كم قائمة نشطة؟"}]', 1),
('breaches', 'evidence_chain', '/evidence-chain', 'سلسلة الأدلة', 'Evidence Chain', 'توثيق الأدلة الرقمية والحفاظ على سلسلة الحفظ', '["جدول الأدلة","حالة التحقق","ملفات مرفقة","سجل التغييرات"]', '["توثيق دليل جديد","التحقق من سلامة الدليل","عرض السلسلة"]', '["view_evidence","add_evidence","verify"]', '[{"role":"analyst","question":"كم دليل موثق؟"},{"role":"legal","question":"تحقق من سلامة الأدلة"}]', 1);

-- ═══ MESSAGE TEMPLATES — قوالب الرسائل الرسمية (DB-13) ═══

INSERT INTO `ai_message_templates` (`domain`, `template_type`, `title`, `title_en`, `content`, `placeholders`, `example_input`, `example_output`, `is_active`) VALUES
('breaches', 'executive_summary', 'ملخص تنفيذي', 'Executive Summary', '### ملخص تنفيذي — {date}\n\n| المؤشر | القيمة |\n|--------|--------|\n| إجمالي حالات الرصد | {total_cases} |\n| واسعة النطاق | {critical_cases} |\n| العدد المُدّعى الإجمالي | {claimed_total} |\n| أجهزة الرصد النشطة | {active_monitors} |\n\n#### أبرز حالات الرصد\n{top_cases}\n\n#### توصيات\n{recommendations}', '["date","total_cases","critical_cases","claimed_total","active_monitors","top_cases","recommendations"]', 'ملخص تنفيذي ليوم 2026-02-20', NULL, 1),
('breaches', 'incident_notification', 'إشعار حالة رصد', 'Incident Notification', '## 🔴 إشعار حالة رصد جديدة\n\n**المعرّف:** {case_id}\n**التصنيف:** {severity}\n**المصدر:** {source}\n**القطاع:** {sector}\n**العدد المُدّعى:** {claimed_count}\n\n### الوصف\n{description}\n\n### الإجراءات المطلوبة\n{actions}', '["case_id","severity","source","sector","claimed_count","description","actions"]', NULL, NULL, 1),
('privacy', 'compliance_report', 'تقرير امتثال', 'Compliance Report', '### تقرير امتثال — {entity_name}\n\n**التاريخ:** {date}\n**نسبة الامتثال:** {compliance_rate}%\n\n| البند | الحالة | التفاصيل |\n|-------|--------|----------|\n{clauses_table}\n\n#### ملاحظات\n{notes}\n\n#### توصيات التحسين\n{recommendations}', '["entity_name","date","compliance_rate","clauses_table","notes","recommendations"]', NULL, NULL, 1),
('breaches', 'weekly_report', 'تقرير أسبوعي', 'Weekly Report', '### التقرير الأسبوعي — {week_range}\n\n#### ملخص الأسبوع\n- حالات رصد جديدة: {new_cases}\n- حالات تم إغلاقها: {closed_cases}\n- واسعة النطاق: {critical_new}\n\n#### توزيع حسب المصدر\n{source_distribution}\n\n#### توزيع حسب القطاع\n{sector_distribution}\n\n#### الأحداث البارزة\n{highlights}', '["week_range","new_cases","closed_cases","critical_new","source_distribution","sector_distribution","highlights"]', NULL, NULL, 1);

-- ═══ GUIDE CATALOG — أدلة استرشادية (DB-05) ═══

INSERT INTO `ai_guide_catalog` (`domain`, `title`, `title_en`, `purpose`, `visibility_roles`, `is_active`, `sort_order`) VALUES
('breaches', 'التعرف على لوحة المعلومات', 'Dashboard Tour', 'جولة سريعة في لوحة المعلومات الرئيسية', '["admin","analyst","manager","viewer"]', 1, 1),
('breaches', 'تحليل حالة رصد', 'Analyze Detection Case', 'كيفية تحليل حالة رصد وتوثيق الأدلة', '["admin","analyst"]', 1, 2),
('breaches', 'إنشاء تقرير تنفيذي', 'Create Executive Report', 'خطوات إنشاء تقرير تنفيذي مهني', '["admin","analyst","manager"]', 1, 3),
('privacy', 'فحص امتثال موقع', 'Site Compliance Scan', 'كيفية فحص موقع إلكتروني لمعرفة حالة الامتثال', '["admin","compliance_officer","analyst"]', 1, 4),
('privacy', 'مقارنة امتثال القطاعات', 'Sector Compliance Comparison', 'مقارنة نسب الامتثال بين القطاعات المختلفة', '["admin","manager","compliance_officer"]', 1, 5);

-- ═══ GUIDE STEPS — خطوات الأدلة (DB-06) ═══

-- Guide 1: Dashboard Tour
INSERT INTO `ai_guide_steps` (`guide_id`, `step_order`, `route`, `selector`, `step_text`, `action_type`, `highlight_type`) VALUES
(1, 1, '/app/overview', '[data-testid="kpi-cards"]', 'هذه بطاقات المؤشرات الرئيسية — تعرض إجمالي حالات الرصد، حالات الرصد واسعة النطاق، والعدد المُدّعى الإجمالي', 'observe', 'border'),
(1, 2, '/app/overview', '[data-testid="chart-timeline"]', 'الرسم البياني الزمني يعرض توزيع حالات الرصد عبر الزمن — يمكنك تغيير الفترة', 'observe', 'pulse'),
(1, 3, '/app/overview', '[data-testid="recent-leaks"]', 'جدول آخر حالات الرصد — اضغط على أي حالة لعرض تفاصيلها الكاملة', 'click', 'border');

-- Guide 2: Analyze Detection Case
INSERT INTO `ai_guide_steps` (`guide_id`, `step_order`, `route`, `selector`, `step_text`, `action_type`, `highlight_type`) VALUES
(2, 1, '/app/leaks', '[data-testid="leaks-table"]', 'اختر حالة رصد من الجدول لبدء التحليل', 'click', 'border'),
(2, 2, '/app/leaks', '[data-testid="leak-details"]', 'هنا تجد كل تفاصيل حالة الرصد: المصدر، التصنيف، العدد المُدّعى، والعينات المتاحة', 'observe', 'overlay'),
(2, 3, '/app/evidence-chain', '[data-testid="add-evidence"]', 'اضغط هنا لتوثيق دليل رقمي جديد — احرص على رفع لقطات الشاشة والملفات', 'click', 'pulse');

-- Guide 4: Site Compliance Scan
INSERT INTO `ai_guide_steps` (`guide_id`, `step_order`, `route`, `selector`, `step_text`, `action_type`, `highlight_type`) VALUES
(4, 1, '/app/sites', '[data-testid="scan-button"]', 'اضغط هنا لبدء فحص موقع جديد', 'click', 'border'),
(4, 2, '/app/sites', '[data-testid="scan-url-input"]', 'أدخل رابط الموقع المراد فحصه', 'type', 'pulse'),
(4, 3, '/app/sites', '[data-testid="scan-results"]', 'نتائج الفحص تظهر هنا — تشمل البنود الثمانية ونسبة الامتثال', 'observe', 'overlay');

-- ═══ TRAINING DOCUMENTS — وثائق تدريب (DB-11) ═══

INSERT INTO `ai_training_documents` (`domain`, `title`, `title_en`, `content`, `category`, `is_active`) VALUES
('breaches', 'سياسة التسمية المعتمدة', 'Naming Policy', 'سياسة التسمية المعتمدة لمنصة راصد:\n\n1. «حالة رصد» — التسمية الوحيدة لأي ادعاء بتسريب بيانات\n2. «العدد المُدّعى» — التسمية الوحيدة لأي رقم يذكره البائع\n3. «العينات المتاحة» — التسمية الوحيدة لما تم توثيقه\n4. مراحل الحالة: حالة رصد → قيد التحقق → تسريب مؤكد → مغلق\n5. لا يُوصف أي حدث بـ «تسريب مؤكد» إلا بعد التحقق الرسمي\n6. إذا استخدم المستخدم مصطلحاً قديماً، يُصحح بلطف', 'policy', 1),
('breaches', 'مستويات تأثير حالات الرصد', 'Severity Levels', 'مستويات تأثير حالات الرصد:\n\n- واسع النطاق (critical): العدد المُدّعى أكثر من 10,000 سجل\n- كبير (high): العدد المُدّعى بين 1,000 و 10,000 سجل\n- متوسط (medium): العدد المُدّعى أقل من 1,000 سجل\n- محدود (low): تأثير محدود أو عينات قليلة', 'reference', 1),
('privacy', 'بنود المادة 12 — PDPL', 'Article 12 Clauses', 'بنود المادة 12 من نظام حماية البيانات الشخصية:\n\n1. الإفصاح عن الهوية — تعريف الجهة المسؤولة\n2. غرض المعالجة — توضيح أسباب جمع البيانات\n3. نطاق البيانات — تحديد أنواع البيانات المجموعة\n4. حقوق صاحب البيانات — إبلاغ الأفراد بحقوقهم\n5. مدة الاحتفاظ — تحديد فترة حفظ البيانات\n6. الإفصاح لأطراف ثالثة — الشفافية في مشاركة البيانات\n7. النقل خارج المملكة — سياسة النقل الدولي\n8. آليات الحماية — الإجراءات التقنية والتنظيمية', 'reference', 1),
('breaches', 'مصادر الرصد المدعومة', 'Supported Sources', 'مصادر الرصد المدعومة في منصة راصد:\n\n1. تليجرام — رصد القنوات والمجموعات المشبوهة\n2. الدارك ويب — رصد المنتديات والأسواق\n3. مواقع اللصق — رصد Pastebin وأشباهها\n4. الرصد المباشر — فحص فوري باستخدام APIs متعددة\n5. OSINT — أدوات استخبارات مفتوحة المصدر', 'reference', 1);

-- ═══ KNOWLEDGE REFRESH STATUS — حالة تحديث المعرفة (DB-15) ═══

INSERT INTO `ai_knowledge_refresh_status` (`domain`, `source_name`, `source_type`, `status`, `item_count`) VALUES
('breaches', 'قاعدة المعرفة', 'knowledge_base', 'completed', 0),
('breaches', 'وثائق التدريب', 'training_documents', 'completed', 0),
('breaches', 'المصطلحات', 'glossary', 'completed', 0),
('privacy', 'قاعدة المعرفة', 'knowledge_base', 'completed', 0),
('privacy', 'وثائق التدريب', 'training_documents', 'completed', 0),
('privacy', 'المصطلحات', 'glossary', 'completed', 0);

```

---

## `drizzle/0004_privacy_workspace_tables.sql`

```sql
-- Privacy Workspace Migration
-- New tables for DSAR, Consent, Processing Records, DPIA, Assessments, Mobile Apps

-- DSAR Requests (Data Subject Access Requests)
CREATE TABLE IF NOT EXISTS `dsar_requests` (
  `id` int AUTO_INCREMENT NOT NULL,
  `requestNumber` varchar(50) NOT NULL,
  `requesterName` varchar(255) NOT NULL,
  `requesterEmail` varchar(255),
  `requesterPhone` varchar(50),
  `requestType` enum('access','correction','deletion','portability','objection','restriction') NOT NULL,
  `status` enum('pending','in_progress','completed','rejected','overdue') NOT NULL DEFAULT 'pending',
  `description` text,
  `entityName` varchar(255),
  `entityDomain` varchar(500),
  `deadline` timestamp,
  `completedAt` timestamp,
  `assignedTo` int,
  `notes` text,
  `attachments` json,
  `createdAt` timestamp DEFAULT (now()),
  `updatedAt` timestamp DEFAULT (now()),
  CONSTRAINT `dsar_requests_id` PRIMARY KEY(`id`)
);

-- Consent Records
CREATE TABLE IF NOT EXISTS `consent_records` (
  `id` int AUTO_INCREMENT NOT NULL,
  `siteDomain` varchar(500) NOT NULL,
  `siteName` varchar(255),
  `consentType` enum('cookie','marketing','analytics','third_party','data_processing','other') NOT NULL,
  `status` enum('active','withdrawn','expired','not_implemented') NOT NULL DEFAULT 'not_implemented',
  `consentMechanism` varchar(255),
  `consentText` text,
  `lastVerified` timestamp,
  `expiresAt` timestamp,
  `notes` text,
  `createdAt` timestamp DEFAULT (now()),
  `updatedAt` timestamp DEFAULT (now()),
  CONSTRAINT `consent_records_id` PRIMARY KEY(`id`)
);

-- Processing Records (ROPA - Record of Processing Activities)
CREATE TABLE IF NOT EXISTS `processing_records` (
  `id` int AUTO_INCREMENT NOT NULL,
  `activityName` varchar(500) NOT NULL,
  `activityNameAr` varchar(500),
  `purpose` text NOT NULL,
  `purposeAr` text,
  `dataCategories` json,
  `dataSubjectCategories` json,
  `lawfulBasis` enum('consent','contract','legal_obligation','vital_interest','public_interest','legitimate_interest') NOT NULL,
  `retentionPeriod` varchar(255),
  `recipientCategories` json,
  `crossBorderTransfer` tinyint DEFAULT 0,
  `transferSafeguards` text,
  `securityMeasures` text,
  `entityName` varchar(255),
  `controllerName` varchar(255),
  `dpoContact` varchar(255),
  `status` enum('active','under_review','archived') NOT NULL DEFAULT 'active',
  `createdBy` int,
  `createdAt` timestamp DEFAULT (now()),
  `updatedAt` timestamp DEFAULT (now()),
  CONSTRAINT `processing_records_id` PRIMARY KEY(`id`)
);

-- DPIA (Data Protection Impact Assessment)
CREATE TABLE IF NOT EXISTS `dpia_assessments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `projectName` varchar(500) NOT NULL,
  `projectNameAr` varchar(500),
  `description` text,
  `entityName` varchar(255),
  `riskLevel` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `status` enum('not_started','in_progress','completed','needs_review') NOT NULL DEFAULT 'not_started',
  `assessorName` varchar(255),
  `assessorId` int,
  `dataTypes` json,
  `risks` json,
  `mitigations` json,
  `recommendations` text,
  `dpoApproval` tinyint DEFAULT 0,
  `dpoApprovalDate` timestamp,
  `completedAt` timestamp,
  `createdAt` timestamp DEFAULT (now()),
  `updatedAt` timestamp DEFAULT (now()),
  CONSTRAINT `dpia_assessments_id` PRIMARY KEY(`id`)
);

-- Privacy Assessments
CREATE TABLE IF NOT EXISTS `privacy_assessments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `entityName` varchar(255) NOT NULL,
  `entityDomain` varchar(500),
  `assessmentType` enum('full','quick','clause_specific','follow_up') NOT NULL DEFAULT 'full',
  `overallScore` int DEFAULT 0,
  `clause1Score` int DEFAULT 0,
  `clause2Score` int DEFAULT 0,
  `clause3Score` int DEFAULT 0,
  `clause4Score` int DEFAULT 0,
  `clause5Score` int DEFAULT 0,
  `clause6Score` int DEFAULT 0,
  `clause7Score` int DEFAULT 0,
  `clause8Score` int DEFAULT 0,
  `findings` json,
  `recommendations` json,
  `status` enum('draft','in_progress','completed','overdue') NOT NULL DEFAULT 'draft',
  `assessorId` int,
  `assessorName` varchar(255),
  `completedAt` timestamp,
  `createdAt` timestamp DEFAULT (now()),
  `updatedAt` timestamp DEFAULT (now()),
  CONSTRAINT `privacy_assessments_id` PRIMARY KEY(`id`)
);

-- Mobile App Privacy Analysis
CREATE TABLE IF NOT EXISTS `mobile_app_privacy` (
  `id` int AUTO_INCREMENT NOT NULL,
  `appName` varchar(500) NOT NULL,
  `appNameAr` varchar(500),
  `packageId` varchar(500),
  `platform` enum('ios','android','both') NOT NULL,
  `developer` varchar(255),
  `category` varchar(100),
  `permissions` json,
  `privacyPolicyUrl` text,
  `complianceScore` int DEFAULT 0,
  `hasPrivacyPolicy` tinyint DEFAULT 0,
  `hasConsentMechanism` tinyint DEFAULT 0,
  `dataCollected` json,
  `thirdPartySharing` json,
  `findings` json,
  `lastScanDate` timestamp,
  `status` enum('compliant','partial','non_compliant','pending') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp DEFAULT (now()),
  `updatedAt` timestamp DEFAULT (now()),
  CONSTRAINT `mobile_app_privacy_id` PRIMARY KEY(`id`)
);

-- Indexes for performance
CREATE INDEX `idx_dsar_status` ON `dsar_requests` (`status`);
CREATE INDEX `idx_dsar_type` ON `dsar_requests` (`requestType`);
CREATE INDEX `idx_consent_domain` ON `consent_records` (`siteDomain`(255));
CREATE INDEX `idx_consent_status` ON `consent_records` (`status`);
CREATE INDEX `idx_processing_basis` ON `processing_records` (`lawfulBasis`);
CREATE INDEX `idx_dpia_risk` ON `dpia_assessments` (`riskLevel`);
CREATE INDEX `idx_dpia_status` ON `dpia_assessments` (`status`);
CREATE INDEX `idx_assessment_status` ON `privacy_assessments` (`status`);
CREATE INDEX `idx_mobile_platform` ON `mobile_app_privacy` (`platform`);
CREATE INDEX `idx_mobile_status` ON `mobile_app_privacy` (`status`);

```

---

## `drizzle/0005_workspace_scope_shared_tables.sql`

```sql
-- ═══════════════════════════════════════════════════════════════
-- Migration 0005: إضافة عمود workspace_scope للجداول المشتركة
-- يسمح بفصل البيانات بين مساحتي العمل (التسريبات / الخصوصية)
-- ═══════════════════════════════════════════════════════════════

-- الإشعارات
ALTER TABLE `notifications`
  ADD COLUMN `workspace` ENUM('leaks', 'privacy', 'both') NOT NULL DEFAULT 'both' AFTER `createdAt`;

-- التقارير
ALTER TABLE `reports`
  ADD COLUMN `workspace` ENUM('leaks', 'privacy', 'both') NOT NULL DEFAULT 'leaks' AFTER `createdBy`;

-- تنفيذ التقارير
ALTER TABLE `report_executions`
  ADD COLUMN `workspace` ENUM('leaks', 'privacy', 'both') NOT NULL DEFAULT 'leaks' AFTER `createdBy`;

-- القضايا
ALTER TABLE `cases`
  ADD COLUMN `workspace` ENUM('leaks', 'privacy', 'both') NOT NULL DEFAULT 'leaks' AFTER `updatedAt`;

-- سجل المراجعة الإداري
ALTER TABLE `admin_audit_logs`
  ADD COLUMN `workspace` ENUM('leaks', 'privacy', 'both') NOT NULL DEFAULT 'both' AFTER `aal_created_at`;

-- أعلام الميزات
ALTER TABLE `admin_feature_flags`
  ADD COLUMN `workspace` ENUM('leaks', 'privacy', 'both') NOT NULL DEFAULT 'both' AFTER `ff_updated_at`;

-- سجل النشاطات
ALTER TABLE `activity_logs`
  ADD COLUMN `workspace` ENUM('leaks', 'privacy', 'both') NOT NULL DEFAULT 'both' AFTER `createdAt`;

-- قواعد التنبيه
ALTER TABLE `alert_rules`
  ADD COLUMN `workspace` ENUM('leaks', 'privacy', 'both') NOT NULL DEFAULT 'leaks' AFTER `createdAt`;

-- قواعد التصعيد
ALTER TABLE `escalation_rules`
  ADD COLUMN `workspace` ENUM('leaks', 'privacy', 'both') NOT NULL DEFAULT 'leaks' AFTER `createdAt`;

-- قوالب الرسائل
ALTER TABLE `message_templates`
  ADD COLUMN `workspace` ENUM('leaks', 'privacy', 'both') NOT NULL DEFAULT 'both' AFTER `updatedAt`;

-- تحديث البيانات الموجودة: كل البيانات الحالية تنتمي لمساحة التسريبات
UPDATE `reports` SET `workspace` = 'leaks' WHERE `workspace` = 'leaks';
UPDATE `cases` SET `workspace` = 'leaks' WHERE `workspace` = 'leaks';
UPDATE `alert_rules` SET `workspace` = 'leaks' WHERE `workspace` = 'leaks';

-- إنشاء فهارس للبحث السريع حسب المساحة
CREATE INDEX `idx_notifications_workspace` ON `notifications` (`workspace`);
CREATE INDEX `idx_reports_workspace` ON `reports` (`workspace`);
CREATE INDEX `idx_cases_workspace` ON `cases` (`workspace`);
CREATE INDEX `idx_activity_logs_workspace` ON `activity_logs` (`workspace`);
CREATE INDEX `idx_alert_rules_workspace` ON `alert_rules` (`workspace`);

```

---

## `drizzle/relations.ts`

```typescript
import { relations } from "drizzle-orm/relations";
import {  } from "./schema";


```

---

## `drizzle/schema.ts`

```typescript
import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, text, timestamp, json, index, mysqlEnum, float, date, decimal, tinyint, bigint, boolean } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const activityLogs = mysqlTable("activity_logs", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int(),
	username: varchar({ length: 64 }),
	action: varchar({ length: 100 }).notNull(),
	details: text(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	workspace: mysqlEnum('workspace', ['leaks', 'privacy', 'both']).default('both').notNull(),
});

export const adminAuditLogs = mysqlTable("admin_audit_logs", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	aalUserId: int(),
	aalUserName: varchar({ length: 255 }),
	aalAction: varchar({ length: 100 }).notNull(),
	aalResourceType: varchar({ length: 100 }).notNull(),
	aalResourceId: varchar({ length: 255 }),
	aalResourceName: varchar({ length: 500 }),
	aalOldValue: json(),
	aalNewValue: json(),
	aalReason: text(),
	aalIpAddress: varchar({ length: 45 }),
	aalUserAgent: text(),
	aalIsRollbackable: tinyint().default(0).notNull(),
	aalRolledBack: tinyint().default(0).notNull(),
	aalRolledBackBy: int(),
	aalCreatedAt: bigint({ mode: "number" }).notNull(),
	workspace: mysqlEnum('workspace', ['leaks', 'privacy', 'both']).default('both').notNull(),
});

export const adminFeatureFlags = mysqlTable("admin_feature_flags", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	ffKey: varchar({ length: 200 }).notNull(),
	ffDisplayName: varchar({ length: 300 }).notNull(),
	ffDisplayNameEn: varchar({ length: 300 }),
	ffDescription: text(),
	ffIsEnabled: tinyint().default(1).notNull(),
	ffTargetType: mysqlEnum(['all','roles','groups','users','percentage']).default('all').notNull(),
	ffTargetIds: json(),
	ffEnableAt: bigint({ mode: "number" }),
	ffDisableAt: bigint({ mode: "number" }),
	ffUpdatedBy: int(),
	ffCreatedAt: bigint({ mode: "number" }).notNull(),
	ffUpdatedAt: bigint({ mode: "number" }).notNull(),
	workspace: mysqlEnum('workspace', ['leaks', 'privacy', 'both']).default('both').notNull(),
},
(table) => [
	index("admin_feature_flags_ffKey_unique").on(table.ffKey),
]);

export const adminGroupMemberships = mysqlTable("admin_group_memberships", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	gmGroupId: varchar({ length: 36 }).notNull(),
	gmUserId: int().notNull(),
	gmJoinedAt: bigint({ mode: "number" }).notNull(),
});

export const adminGroupPermissions = mysqlTable("admin_group_permissions", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	gpGroupId: varchar({ length: 36 }).notNull(),
	gpPermissionId: varchar({ length: 36 }).notNull(),
	gpEffect: mysqlEnum(['allow','deny']).default('allow').notNull(),
	gpCreatedAt: bigint({ mode: "number" }).notNull(),
});

export const adminGroups = mysqlTable("admin_groups", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	groupName: varchar({ length: 200 }).notNull(),
	groupNameEn: varchar({ length: 200 }).notNull(),
	groupDescription: text(),
	groupDescriptionEn: text(),
	groupStatus: mysqlEnum(['active','disabled']).default('active').notNull(),
	groupCreatedAt: bigint({ mode: "number" }).notNull(),
	groupUpdatedAt: bigint({ mode: "number" }).notNull(),
});

export const adminMenuItems = mysqlTable("admin_menu_items", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	miMenuId: varchar({ length: 36 }).notNull(),
	miParentId: varchar({ length: 36 }),
	miTitle: varchar({ length: 300 }).notNull(),
	miTitleEn: varchar({ length: 300 }),
	miIcon: varchar({ length: 100 }),
	miLinkType: mysqlEnum(['internal','external','anchor','none']).default('internal').notNull(),
	miLinkTarget: varchar({ length: 500 }),
	miOpenNewTab: tinyint().default(0).notNull(),
	miVisibilityRules: json(),
	miBadge: varchar({ length: 50 }),
	miBadgeColor: varchar({ length: 20 }),
	miSortOrder: int().default(0).notNull(),
	miStatus: mysqlEnum(['active','disabled']).default('active').notNull(),
	miCreatedAt: bigint({ mode: "number" }).notNull(),
	miUpdatedAt: bigint({ mode: "number" }).notNull(),
});

export const adminMenus = mysqlTable("admin_menus", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	menuName: varchar({ length: 200 }).notNull(),
	menuNameEn: varchar({ length: 200 }),
	menuLocation: mysqlEnum(['sidebar','top_nav','footer','contextual','mobile']).notNull(),
	menuStatus: mysqlEnum(['active','disabled']).default('active').notNull(),
	menuCreatedAt: bigint({ mode: "number" }).notNull(),
	menuUpdatedAt: bigint({ mode: "number" }).notNull(),
});

export const adminPermissions = mysqlTable("admin_permissions", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	resourceType: mysqlEnum(['page','section','component','content_type','task','feature','api','menu']).notNull(),
	resourceId: varchar({ length: 200 }).notNull(),
	resourceName: varchar({ length: 300 }).notNull(),
	resourceNameEn: varchar({ length: 300 }),
	permAction: mysqlEnum(['view','create','edit','delete','publish','unpublish','enable','disable','manage','export','approve']).notNull(),
	permDescription: text(),
	permCreatedAt: bigint({ mode: "number" }).notNull(),
});

export const adminRolePermissions = mysqlTable("admin_role_permissions", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	rpRoleId: varchar({ length: 36 }).notNull(),
	rpPermissionId: varchar({ length: 36 }).notNull(),
	rpEffect: mysqlEnum(['allow','deny']).default('allow').notNull(),
	rpConditions: json(),
	rpCreatedAt: bigint({ mode: "number" }).notNull(),
});

export const adminRoles = mysqlTable("admin_roles", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	roleName: varchar({ length: 200 }).notNull(),
	roleNameEn: varchar({ length: 200 }).notNull(),
	roleDescription: text(),
	roleDescriptionEn: text(),
	isSystem: tinyint().default(0).notNull(),
	rolePriority: int().default(0).notNull(),
	roleColor: varchar({ length: 20 }),
	roleStatus: mysqlEnum(['active','disabled']).default('active').notNull(),
	roleCreatedAt: bigint({ mode: "number" }).notNull(),
	roleUpdatedAt: bigint({ mode: "number" }).notNull(),
});

export const adminThemeSettings = mysqlTable("admin_theme_settings", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	tsCategory: mysqlEnum(['colors','typography','layout','shadows','animations']).notNull(),
	tsKey: varchar({ length: 200 }).notNull(),
	tsValue: text().notNull(),
	tsValueLight: text(),
	tsValueDark: text(),
	tsLabel: varchar({ length: 300 }),
	tsLabelEn: varchar({ length: 300 }),
	tsUpdatedBy: int(),
	tsUpdatedAt: bigint({ mode: "number" }).notNull(),
});

export const adminUserOverrides = mysqlTable("admin_user_overrides", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	ouUserId: int().notNull(),
	ouPermissionId: varchar({ length: 36 }).notNull(),
	ouEffect: mysqlEnum(['allow','deny']).notNull(),
	ouReason: text().notNull(),
	ouExpiresAt: bigint({ mode: "number" }),
	ouCreatedBy: int().notNull(),
	ouCreatedAt: bigint({ mode: "number" }).notNull(),
});

export const adminUserRoles = mysqlTable("admin_user_roles", {
	id: varchar({ length: 36 }).notNull().primaryKey(),
	urUserId: int().notNull(),
	urRoleId: varchar({ length: 36 }).notNull(),
	urAssignedAt: bigint({ mode: "number" }).notNull(),
	urAssignedBy: int(),
});

export const aiChatMessages = mysqlTable("ai_chat_messages", {
	id: int().autoincrement().primaryKey().notNull(),
	sessionId: varchar({ length: 64 }).notNull(),
	messageId: varchar({ length: 64 }).notNull(),
	msgRole: mysqlEnum(['user','assistant','system']).notNull(),
	content: text().notNull(),
	sources: json(),
	tokensUsed: int(),
	durationMs: int(),
	model: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiChatSessions = mysqlTable("ai_chat_sessions", {
	id: int().autoincrement().primaryKey().notNull(),
	sessionId: varchar({ length: 64 }).notNull(),
	userId: int().notNull(),
	userName: varchar({ length: 255 }),
	title: varchar({ length: 500 }),
	messageCount: int().default(0),
	totalTokens: int().default(0),
	totalDurationMs: int().default(0),
	sessionStatus: mysqlEnum(['active','archived','exported']).default('active').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const aiConversationsLegacy = mysqlTable("ai_conversations", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	title: varchar({ length: 500 }),
	pageContext: varchar({ length: 500 }),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const aiCustomCommands = mysqlTable("ai_custom_commands", {
	id: int().autoincrement().primaryKey().notNull(),
	command: varchar({ length: 100 }).notNull(),
	description: text(),
	handler: varchar({ length: 255 }).notNull(),
	parameters: json(),
	exampleUsage: text(),
	isEnabled: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiFeedbackLegacy = mysqlTable("ai_feedback", {
	id: int().autoincrement().primaryKey().notNull(),
	chatHistoryId: int().notNull(),
	userId: int().notNull(),
	rating: mysqlEnum(['good','bad']).notNull(),
	category: mysqlEnum(['accuracy','relevance','completeness','tone','other']),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiMessages = mysqlTable("ai_messages", {
	id: int().autoincrement().primaryKey().notNull(),
	conversationId: int().notNull(),
	role: mysqlEnum(['user','assistant','system']).notNull(),
	content: text().notNull(),
	metadata: json(),
	toolCalls: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiRatings = mysqlTable("ai_ratings", {
	id: int().autoincrement().primaryKey().notNull(),
	messageId: varchar({ length: 64 }).notNull(),
	sessionId: varchar({ length: 64 }).notNull(),
	userId: int().notNull(),
	rating: int().notNull(),
	feedback: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiResponseRatings = mysqlTable("ai_response_ratings", {
	id: int().autoincrement().primaryKey().notNull(),
	messageId: varchar({ length: 64 }).notNull(),
	ratingUserId: int().notNull(),
	ratingUserName: varchar({ length: 255 }),
	rating: int().notNull(),
	userMessage: text(),
	aiResponse: text(),
	toolsUsed: json(),
	ratingFeedback: text(),
	ratingCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiScenarios = mysqlTable("ai_scenarios", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	scenarioType: mysqlEnum(['greeting','farewell','help','error','report','custom_command','persona','escalation','vip_response']).notNull(),
	triggerPattern: text(),
	systemPrompt: text(),
	responseTemplate: text(),
	conditions: json(),
	priority: int().default(0),
	isEnabled: tinyint().default(1).notNull(),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiSearchLog = mysqlTable("ai_search_log", {
	id: int().autoincrement().primaryKey().notNull(),
	query: text().notNull(),
	resultsCount: int().default(0),
	topScore: float(),
	wasHelpful: tinyint(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiTaskState = mysqlTable("ai_task_state", {
	id: int().autoincrement().primaryKey().notNull(),
	conversationId: int().notNull(),
	goal: text(),
	filters: json(),
	lastEntityType: varchar({ length: 100 }),
	lastEntityId: int(),
	currentStep: varchar({ length: 200 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const aiTrainingLogs = mysqlTable("ai_training_logs", {
	id: int().autoincrement().primaryKey().notNull(),
	action: mysqlEnum(['knowledge_added','knowledge_updated','knowledge_deleted','document_uploaded','document_processed','scenario_added','scenario_updated','action_added','action_updated','feedback_received']).notNull(),
	entityType: varchar({ length: 50 }).notNull(),
	entityId: int(),
	details: text(),
	performedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiUserSessions = mysqlTable("ai_user_sessions", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	sessionDate: date({ mode: 'string' }).notNull(),
	visitCount: int().default(1).notNull(),
	lastGreetingId: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const alertContacts = mysqlTable("alert_contacts", {
	id: int().autoincrement().primaryKey().notNull(),
	contactName: varchar({ length: 255 }).notNull(),
	contactNameAr: varchar({ length: 255 }),
	contactEmail: varchar({ length: 320 }),
	contactPhone: varchar({ length: 20 }),
	contactRole: varchar({ length: 100 }),
	contactRoleAr: varchar({ length: 100 }),
	isActive: tinyint().default(1).notNull(),
	alertChannels: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const alertRules = mysqlTable("alert_rules", {
	id: int().autoincrement().primaryKey().notNull(),
	ruleName: varchar({ length: 255 }).notNull(),
	ruleNameAr: varchar({ length: 255 }),
	conditionType: mysqlEnum('conditionType', ['compliance_drop','new_non_compliant','scan_failure','threshold','custom']).notNull(),
	conditionValue: json(),
	severity: mysqlEnum('severity', ['low','medium','high','critical']).default('medium').notNull(),
	notifyContacts: json(),
	deliveryChannels: json(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	workspace: mysqlEnum('workspace', ['leaks', 'privacy', 'both']).default('leaks').notNull(),
});

export const alertHistory = mysqlTable("alert_history", {
	id: int().autoincrement().primaryKey().notNull(),
	ruleId: int(),
	contactId: int(),
	alertContactName: varchar({ length: 255 }),
	deliveryChannel: mysqlEnum(['email','sms']).notNull(),
	alertSubject: varchar({ length: 500 }).notNull(),
	alertBody: text(),
	deliveryStatus: mysqlEnum(['sent','failed','pending']).default('pending').notNull(),
	alertLeakId: varchar({ length: 32 }),
	sentAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const apiKeys = mysqlTable("api_keys", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	keyHash: varchar({ length: 255 }).notNull(),
	keyPrefix: varchar({ length: 16 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	permissions: json(),
	lastUsedAt: timestamp({ mode: 'string' }),
	expiresAt: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1),
	requestCount: int().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const appScans = mysqlTable("app_scans", {
	id: int().autoincrement().primaryKey().notNull(),
	appId: int().notNull(),
	overallScore: float(),
	complianceStatus: mysqlEnum(['compliant','partially_compliant','non_compliant','no_policy']).default('no_policy'),
	summary: text(),
	clause1Compliant: tinyint().default(0),
	clause1Evidence: text(),
	clause2Compliant: tinyint().default(0),
	clause2Evidence: text(),
	clause3Compliant: tinyint().default(0),
	clause3Evidence: text(),
	clause4Compliant: tinyint().default(0),
	clause4Evidence: text(),
	clause5Compliant: tinyint().default(0),
	clause5Evidence: text(),
	clause6Compliant: tinyint().default(0),
	clause6Evidence: text(),
	clause7Compliant: tinyint().default(0),
	clause7Evidence: text(),
	clause8Compliant: tinyint().default(0),
	clause8Evidence: text(),
	privacyTextContent: text(),
	detectedLanguage: varchar({ length: 10 }),
	recommendations: json(),
	scannedBy: int(),
	scanDate: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const approvals = mysqlTable("approvals", {
	id: int().autoincrement().primaryKey().notNull(),
	entityType: varchar({ length: 100 }).notNull(),
	entityId: int().notNull(),
	requestedBy: int(),
	approvedBy: int(),
	status: mysqlEnum(['pending','approved','rejected','cancelled']).default('pending'),
	comments: text(),
	requestedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	decidedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const auditLog = mysqlTable("audit_log", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int(),
	userName: varchar({ length: 200 }),
	action: varchar({ length: 200 }).notNull(),
	entityType: varchar({ length: 100 }),
	entityId: int(),
	details: json(),
	ipAddress: varchar({ length: 50 }),
	userAgent: text(),
	before: json(),
	after: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const backups = mysqlTable("backups", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 500 }),
	type: mysqlEnum(['full','incremental','config_only']).default('full'),
	status: mysqlEnum(['pending','running','completed','failed']).default('pending'),
	fileUrl: text(),
	fileSize: bigint({ mode: "number" }),
	schedule: varchar({ length: 50 }),
	errorMessage: text(),
	createdBy: int(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const batchScanJobs = mysqlTable("batch_scan_jobs", {
	id: int().autoincrement().primaryKey().notNull(),
	jobName: text(),
	totalUrls: int().default(0),
	completedUrls: int().default(0),
	failedUrls: int().default(0),
	status: mysqlEnum(['pending','running','completed','failed','cancelled']).default('pending'),
	results: json(),
	createdBy: int(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const breachSources = mysqlTable("breach_sources", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 500 }).notNull(),
	type: varchar({ length: 100 }),
	url: text(),
	isActive: tinyint().default(1),
	lastChecked: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const bulkAnalysisJobs = mysqlTable("bulk_analysis_jobs", {
	id: int().autoincrement().primaryKey().notNull(),
	jobName: text().notNull(),
	totalUrls: int().default(0).notNull(),
	analyzedUrls: int().default(0).notNull(),
	failedUrls: int().default(0).notNull(),
	compliantCount: int().default(0).notNull(),
	partialCount: int().default(0).notNull(),
	nonCompliantCount: int().default(0).notNull(),
	noPolicyCount: int().default(0).notNull(),
	avgScore: float(),
	status: mysqlEnum(['pending','running','paused','completed','failed','cancelled']).default('pending').notNull(),
	sourceType: mysqlEnum(['csv_import','manual','crawl_results']).default('manual').notNull(),
	createdBy: int(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const bulkAnalysisResults = mysqlTable("bulk_analysis_results", {
	id: int().autoincrement().primaryKey().notNull(),
	jobId: int().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	privacyUrl: text(),
	overallScore: float(),
	complianceStatus: mysqlEnum(['compliant','partially_compliant','non_compliant','no_policy','error']).default('no_policy').notNull(),
	clause1: tinyint().default(0),
	clause1Evidence: text(),
	clause2: tinyint().default(0),
	clause2Evidence: text(),
	clause3: tinyint().default(0),
	clause3Evidence: text(),
	clause4: tinyint().default(0),
	clause4Evidence: text(),
	clause5: tinyint().default(0),
	clause5Evidence: text(),
	clause6: tinyint().default(0),
	clause6Evidence: text(),
	clause7: tinyint().default(0),
	clause7Evidence: text(),
	clause8: tinyint().default(0),
	clause8Evidence: text(),
	summary: text(),
	recommendations: json(),
	privacyTextLength: int().default(0),
	errorMessage: text(),
	analyzedAt: timestamp({ mode: 'string' }).defaultNow(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const caseComments = mysqlTable("case_comments", {
	id: int().autoincrement().primaryKey().notNull(),
	caseId: int().notNull(),
	userId: int().notNull(),
	content: text().notNull(),
	parentId: int(),
	isInternal: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const caseHistory = mysqlTable("case_history", {
	id: int().autoincrement().primaryKey().notNull(),
	caseId: int().notNull(),
	fromStage: varchar({ length: 50 }),
	toStage: varchar({ length: 50 }).notNull(),
	action: varchar({ length: 100 }).notNull(),
	comment: text(),
	attachments: json(),
	performedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const cases = mysqlTable("cases", {
	id: int().autoincrement().primaryKey().notNull(),
	caseNumber: varchar({ length: 50 }).notNull(),
	title: text().notNull(),
	description: text(),
	siteId: int(),
	appId: int(),
	requesterId: int(),
	assignedTo: int(),
	stage: mysqlEnum(['submission','intake_validation','define_field','legal_review','jurisdiction_check','measure_justification','decision','registered','closed']).default('submission'),
	priority: mysqlEnum(['low','medium','high','critical']).default('medium'),
	status: mysqlEnum(['open','in_progress','pending_review','escalated','resolved','closed']).default('open'),
	dueDate: timestamp({ mode: 'string' }),
	resolvedAt: timestamp({ mode: 'string' }),
	closedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	workspace: mysqlEnum('workspace', ['leaks', 'privacy', 'both']).default('leaks').notNull(),
},
(table) => [
	index("cases_caseNumber_unique").on(table.caseNumber),
]);

export const catalogs = mysqlTable("catalogs", {
	id: int().autoincrement().primaryKey().notNull(),
	catalogType: varchar({ length: 100 }).notNull(),
	key: varchar({ length: 200 }).notNull(),
	nameAr: varchar({ length: 500 }).notNull(),
	nameEn: varchar({ length: 500 }),
	description: text(),
	definition: text(),
	formula: text(),
	drillPath: varchar({ length: 500 }),
	format: varchar({ length: 50 }),
	category: varchar({ length: 200 }),
	sortOrder: int().default(0),
	isVisible: tinyint().default(1),
	requiredRole: varchar({ length: 50 }),
	config: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const changeDetectionLogs = mysqlTable("change_detection_logs", {
	id: int().autoincrement().primaryKey().notNull(),
	siteId: int().notNull(),
	scanId: int().notNull(),
	previousScanId: int().notNull(),
	changeType: mysqlEnum(['added','removed','modified','no_change']).default('no_change'),
	previousScore: float(),
	newScore: float(),
	scoreDelta: float(),
	previousStatus: varchar({ length: 50 }),
	newStatus: varchar({ length: 50 }),
	clauseChanges: json(),
	textDiffSummary: text(),
	policyAdded: tinyint().default(0),
	policyRemoved: tinyint().default(0),
	significantChange: tinyint().default(0),
	detectedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const channels = mysqlTable("channels", {
	id: int().autoincrement().primaryKey().notNull(),
	channelId: varchar({ length: 32 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	platform: mysqlEnum(['telegram','darkweb','paste']).notNull(),
	subscribers: int().default(0),
	status: mysqlEnum(['active','paused','flagged']).default('active').notNull(),
	lastActivity: timestamp({ mode: 'string' }),
	leaksDetected: int().default(0),
	riskLevel: mysqlEnum(['high','medium','low']).default('medium').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("channels_channelId_unique").on(table.channelId),
]);

export const chatConversations = mysqlTable("chat_conversations", {
	id: int().autoincrement().primaryKey().notNull(),
	ccConversationId: varchar({ length: 64 }).notNull(),
	ccUserId: varchar({ length: 64 }).notNull(),
	ccUserName: varchar({ length: 255 }),
	ccTitle: varchar({ length: 500 }).notNull(),
	ccSummary: text(),
	ccMessageCount: int().default(0).notNull(),
	ccTotalToolsUsed: int().default(0).notNull(),
	ccStatus: mysqlEnum(['active','archived','exported']).default('active').notNull(),
	ccCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ccUpdatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("chat_conversations_ccConversationId_unique").on(table.ccConversationId),
]);

export const chatHistory = mysqlTable("chat_history", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	message: text().notNull(),
	response: text().notNull(),
	rating: mysqlEnum(['good','bad']),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const chatMessages = mysqlTable("chat_messages", {
	id: int().autoincrement().primaryKey().notNull(),
	cmConversationId: varchar({ length: 64 }).notNull(),
	cmMessageId: varchar({ length: 64 }).notNull(),
	cmRole: mysqlEnum(['user','assistant']).notNull(),
	cmContent: text().notNull(),
	cmToolsUsed: json(),
	cmThinkingSteps: json(),
	cmRating: int(),
	cmCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const complianceAlerts = mysqlTable("compliance_alerts", {
	id: int().autoincrement().primaryKey().notNull(),
	siteId: int().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	previousStatus: varchar({ length: 50 }),
	newStatus: varchar({ length: 50 }).notNull(),
	previousScore: float(),
	newScore: float(),
	scanId: int(),
	isRead: tinyint().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const complianceChangeNotifications = mysqlTable("compliance_change_notifications", {
	id: int().autoincrement().primaryKey().notNull(),
	siteId: int().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	previousStatus: varchar({ length: 50 }),
	newStatus: varchar({ length: 50 }).notNull(),
	previousScore: int(),
	newScore: int().notNull(),
	emailSent: tinyint().default(0).notNull(),
	emailSentTo: text(),
	emailSentAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const complianceClauses = mysqlTable("compliance_clauses", {
	id: int().autoincrement().primaryKey().notNull(),
	clauseNumber: varchar({ length: 20 }).notNull(),
	nameAr: varchar({ length: 500 }).notNull(),
	nameEn: varchar({ length: 500 }),
	descriptionAr: text(),
	descriptionEn: text(),
	category: varchar({ length: 100 }),
	weight: float().default(1),
	isActive: tinyint().default(1),
	sortOrder: int().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const contentBlocks = mysqlTable("content_blocks", {
	id: int().autoincrement().primaryKey().notNull(),
	blockKey: varchar({ length: 150 }).notNull(),
	pageKey: varchar({ length: 100 }),
	blockType: mysqlEnum(['text','html','image','logo','banner','footer','header','widget']).default('text'),
	titleAr: text(),
	titleEn: text(),
	contentAr: text(),
	contentEn: text(),
	imageUrl: text(),
	linkUrl: text(),
	sortOrder: int().default(0),
	isVisible: tinyint().default(1),
	customCss: text(),
	metadata: json(),
	updatedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("content_blocks_blockKey_unique").on(table.blockKey),
]);

export const customActions = mysqlTable("custom_actions", {
	id: int().autoincrement().primaryKey().notNull(),
	triggerPhrase: varchar({ length: 255 }).notNull(),
	aliases: json(),
	actionType: mysqlEnum(['call_function','custom_code','redirect','api_call']).notNull(),
	actionTarget: text(),
	description: text(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const darkWebListings = mysqlTable("dark_web_listings", {
	id: int().autoincrement().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	titleAr: varchar({ length: 500 }),
	listingSeverity: mysqlEnum(['critical','high','medium','low']).notNull(),
	sourceChannelId: int(),
	sourceName: varchar({ length: 255 }),
	price: varchar({ length: 50 }),
	recordCount: int().default(0),
	detectedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const dashboardLayouts = mysqlTable("dashboard_layouts", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int(),
	name: varchar({ length: 500 }),
	nameAr: varchar({ length: 500 }),
	dataSource: varchar({ length: 100 }),
	layout: json(),
	filters: json(),
	isDefault: tinyint().default(0),
	isTemplate: tinyint().default(0),
	isLocked: tinyint().default(0),
	targetRole: varchar({ length: 100 }),
	targetGroupId: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const dashboardSnapshots = mysqlTable("dashboard_snapshots", {
	id: int().autoincrement().primaryKey().notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	snapshotDate: date({ mode: 'string' }).notNull(),
	totalWebsites: int().default(0),
	compliantCount: int().default(0),
	partialCount: int().default(0),
	nonCompliantCount: int().default(0),
	noPolicyCount: int().default(0),
	averageScore: decimal({ precision: 5, scale: 2 }).default('0'),
	criterion1Rate: decimal({ precision: 5, scale: 2 }).default('0'),
	criterion2Rate: decimal({ precision: 5, scale: 2 }).default('0'),
	criterion3Rate: decimal({ precision: 5, scale: 2 }).default('0'),
	criterion4Rate: decimal({ precision: 5, scale: 2 }).default('0'),
	criterion5Rate: decimal({ precision: 5, scale: 2 }).default('0'),
	criterion6Rate: decimal({ precision: 5, scale: 2 }).default('0'),
	criterion7Rate: decimal({ precision: 5, scale: 2 }).default('0'),
	criterion8Rate: decimal({ precision: 5, scale: 2 }).default('0'),
	sectorBreakdown: json(),
	domainTypeBreakdown: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const dataTransferLogs = mysqlTable("data_transfer_logs", {
	id: int().autoincrement().primaryKey().notNull(),
	transferType: mysqlEnum(['export','import']).notNull(),
	dataSection: varchar({ length: 100 }).notNull(),
	fileName: varchar({ length: 255 }),
	fileUrl: text(),
	recordCount: int().default(0),
	status: mysqlEnum(['pending','processing','completed','failed']).default('pending'),
	errorMessage: text(),
	userId: int().notNull(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp({ mode: 'string' }),
});

export const deepScanQueue = mysqlTable("deep_scan_queue", {
	id: int().autoincrement().primaryKey().notNull(),
	jobId: int().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	url: text().notNull(),
	status: mysqlEnum(['pending','scanning','completed','failed','skipped']).default('pending').notNull(),
	siteReachable: tinyint().default(0),
	siteName: text(),
	siteTitle: text(),
	httpStatus: int(),
	redirectUrl: text(),
	privacyUrl: text(),
	privacyMethod: varchar({ length: 100 }),
	privacyTextContent: text(),
	privacyTextLength: int().default(0),
	privacyLanguage: varchar({ length: 10 }),
	screenshotUrl: text(),
	privacyScreenshotUrl: text(),
	contactUrl: text(),
	contactEmails: text(),
	contactPhones: text(),
	socialLinks: json(),
	overallScore: float(),
	complianceStatus: mysqlEnum(['compliant','partially_compliant','non_compliant','no_policy','error']).default('no_policy'),
	clause1Compliant: tinyint().default(0),
	clause1Evidence: text(),
	clause2Compliant: tinyint().default(0),
	clause2Evidence: text(),
	clause3Compliant: tinyint().default(0),
	clause3Evidence: text(),
	clause4Compliant: tinyint().default(0),
	clause4Evidence: text(),
	clause5Compliant: tinyint().default(0),
	clause5Evidence: text(),
	clause6Compliant: tinyint().default(0),
	clause6Evidence: text(),
	clause7Compliant: tinyint().default(0),
	clause7Evidence: text(),
	clause8Compliant: tinyint().default(0),
	clause8Evidence: text(),
	summary: text(),
	recommendations: json(),
	rating: varchar({ length: 50 }),
	errorMessage: text(),
	retryCount: int().default(0),
	scanDuration: int().default(0),
	scannedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const documents = mysqlTable("documents", {
	id: int().autoincrement().primaryKey().notNull(),
	documentId: varchar({ length: 64 }).notNull(),
	recordId: varchar({ length: 32 }),
	verificationCode: varchar({ length: 32 }).notNull(),
	contentHash: varchar({ length: 128 }).notNull(),
	documentType: mysqlEnum(['incident_report','custom_report','executive_summary','compliance_report','sector_report']).default('incident_report'),
	title: varchar({ length: 500 }),
	titleAr: varchar({ length: 500 }),
	generatedBy: int(),
	generatedByName: varchar({ length: 200 }),
	pdfUrl: text(),
	htmlContent: text(),
	metadata: json(),
	isVerified: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("documents_documentId_unique").on(table.documentId),
	index("documents_verificationCode_unique").on(table.verificationCode),
]);

export const emailNotificationPrefs = mysqlTable("email_notification_prefs", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	emailAddress: varchar({ length: 255 }).notNull(),
	notifyOnStatusChange: tinyint().default(1).notNull(),
	notifyOnScoreChange: tinyint().default(1).notNull(),
	notifyOnNewScan: tinyint().default(0).notNull(),
	notifyOnCriticalOnly: tinyint().default(0).notNull(),
	minScoreChangeThreshold: int().default(10),
	sectorFilter: json(),
	isActive: tinyint().default(1).notNull(),
	lastNotifiedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const escalationLogs = mysqlTable("escalation_logs", {
	id: int().autoincrement().primaryKey().notNull(),
	caseId: int().notNull(),
	ruleId: int().notNull(),
	previousStage: varchar({ length: 50 }).notNull(),
	newStage: varchar({ length: 50 }).notNull(),
	previousPriority: varchar({ length: 20 }),
	newPriority: varchar({ length: 20 }),
	hoursOverdue: float(),
	notified: tinyint().default(0),
	escalatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const escalationRules = mysqlTable("escalation_rules", {
	id: int().autoincrement().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	fromStage: mysqlEnum(['submission','intake_validation','define_field','legal_review','jurisdiction_check','measure_justification','decision','registered']).notNull(),
	toStage: mysqlEnum(['submission','intake_validation','define_field','legal_review','jurisdiction_check','measure_justification','decision','registered','closed']).notNull(),
	maxHours: int().default(48).notNull(),
	escalatePriority: mysqlEnum(['low','medium','high','critical']),
	appliesTo: mysqlEnum(['low','medium','high','critical']),
	notifyRoles: json(),
	isActive: tinyint().default(1),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	workspace: mysqlEnum('workspace', ['leaks', 'privacy', 'both']).default('leaks').notNull(),
});

export const evidenceChain = mysqlTable("evidence_chain", {
	id: int().autoincrement().primaryKey().notNull(),
	evidenceId: varchar({ length: 64 }).notNull(),
	evidenceLeakId: varchar({ length: 32 }).notNull(),
	evidenceType: mysqlEnum(['text','screenshot','file','metadata']).notNull(),
	contentHash: varchar({ length: 128 }).notNull(),
	previousHash: varchar({ length: 128 }),
	blockIndex: int().notNull(),
	capturedBy: varchar({ length: 255 }),
	evidenceMetadata: json(),
	isVerified: tinyint().default(1).notNull(),
	capturedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	evidenceCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("evidence_chain_evidenceId_unique").on(table.evidenceId),
]);

export const executiveAlerts = mysqlTable("executive_alerts", {
	id: int().autoincrement().primaryKey().notNull(),
	severity: mysqlEnum(['critical','high','medium','low']).default('medium'),
	alertType: varchar({ length: 50 }).notNull(),
	entityId: int(),
	entityName: varchar({ length: 255 }),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	suggestedAction: text(),
	isAcknowledged: tinyint().default(0),
	acknowledgedBy: int(),
	acknowledgedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const executiveReports = mysqlTable("executive_reports", {
	id: int().autoincrement().primaryKey().notNull(),
	reportType: mysqlEnum(['daily','weekly','monthly']).default('weekly'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	reportDate: date({ mode: 'string' }).notNull(),
	contentJson: json(),
	pdfUrl: text(),
	isSent: tinyint().default(0),
	sentAt: timestamp({ mode: 'string' }),
	recipients: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const featureFlags = mysqlTable("feature_flags", {
	id: int().autoincrement().primaryKey().notNull(),
	featureKey: varchar({ length: 200 }).notNull(),
	nameAr: varchar({ length: 500 }).notNull(),
	nameEn: varchar({ length: 500 }),
	description: text(),
	isEnabled: tinyint().default(1),
	scope: mysqlEnum(['platform','entity','group','user']).default('platform'),
	scopeValue: varchar({ length: 200 }),
	expiresAt: timestamp({ mode: 'string' }),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const feedbackEntries = mysqlTable("feedback_entries", {
	id: int().autoincrement().primaryKey().notNull(),
	feedbackLeakId: varchar({ length: 32 }).notNull(),
	feedbackUserId: int(),
	feedbackUserName: varchar({ length: 255 }),
	systemClassification: mysqlEnum(['personal_data','cybersecurity','clean','unknown']).notNull(),
	analystClassification: mysqlEnum(['personal_data','cybersecurity','clean','unknown']).notNull(),
	isCorrect: tinyint().notNull(),
	feedbackNotes: text(),
	feedbackCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const followupTasks = mysqlTable("followup_tasks", {
	id: int().autoincrement().primaryKey().notNull(),
	followupId: int().notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	status: mysqlEnum(['pending','in_progress','completed','cancelled']).default('pending'),
	assignedTo: int(),
	dueDate: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	sortOrder: int().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const followups = mysqlTable("followups", {
	id: int().autoincrement().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	description: text(),
	type: mysqlEnum(['site_followup','incident_followup','general','corrective_action']).default('general'),
	status: mysqlEnum(['open','in_progress','pending_approval','approved','rejected','completed','overdue']).default('open'),
	priority: mysqlEnum(['critical','high','medium','low']).default('medium'),
	relatedSiteId: int(),
	relatedIncidentId: int(),
	assignedTo: int(),
	assignedBy: int(),
	dueDate: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const glossaryTerms = mysqlTable("glossary_terms", {
	id: int().autoincrement().primaryKey().notNull(),
	term: varchar({ length: 500 }).notNull(),
	synonyms: json(),
	definition: text(),
	relatedPage: varchar({ length: 200 }),
	relatedEntity: varchar({ length: 200 }),
	exampleQuestions: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const groupMembers = mysqlTable("group_members", {
	id: int().autoincrement().primaryKey().notNull(),
	groupId: int().notNull(),
	userId: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const groups = mysqlTable("groups", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	nameAr: varchar({ length: 200 }),
	description: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const guideCatalog = mysqlTable("guide_catalog", {
	id: int().autoincrement().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	titleAr: varchar({ length: 500 }),
	purpose: text(),
	steps: json(),
	requiredRole: varchar({ length: 50 }),
	isActive: tinyint().default(1),
	sortOrder: int().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const incidentAttachments = mysqlTable("incident_attachments", {
	id: int().autoincrement().primaryKey().notNull(),
	incidentId: int().notNull(),
	fileName: varchar({ length: 500 }),
	fileUrl: text(),
	fileKey: varchar({ length: 500 }),
	fileType: varchar({ length: 100 }),
	fileSize: bigint({ mode: "number" }),
	uploadedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const incidentCertifications = mysqlTable("incident_certifications", {
	id: int().autoincrement().primaryKey().notNull(),
	certCode: varchar({ length: 64 }).notNull(),
	incidentId: varchar({ length: 64 }).notNull(),
	incidentTitle: varchar({ length: 500 }).notNull(),
	incidentTitleAr: varchar({ length: 500 }),
	certSeverity: varchar({ length: 20 }),
	certSector: varchar({ length: 200 }),
	certRecordsExposed: bigint({ mode: "number" }),
	issuedBy: varchar({ length: 255 }).notNull(),
	issuedByUserId: varchar({ length: 64 }).notNull(),
	issuedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	certPdfUrl: text(),
	certHtmlContent: text(),
	certSha256Hash: varchar({ length: 128 }),
	certStatus: mysqlEnum(['active','revoked']).default('active').notNull(),
	revokedAt: timestamp({ mode: 'string' }),
	revokedBy: varchar({ length: 255 }),
	verifiedCount: int().default(0),
	lastVerifiedAt: timestamp({ mode: 'string' }),
},
(table) => [
	index("incident_certifications_certCode_unique").on(table.certCode),
]);

export const incidentDatasets = mysqlTable("incident_datasets", {
	id: int().autoincrement().primaryKey().notNull(),
	incidentId: int().notNull(),
	datasetName: varchar({ length: 500 }),
	piiCategory: varchar({ length: 200 }),
	recordCount: bigint({ mode: "number" }),
	sampleFields: json(),
	sensitivity: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const incidentDocuments = mysqlTable("incident_documents", {
	id: int().autoincrement().primaryKey().notNull(),
	documentId: varchar({ length: 64 }).notNull(),
	leakId: varchar({ length: 32 }).notNull(),
	verificationCode: varchar({ length: 32 }).notNull(),
	contentHash: varchar({ length: 128 }).notNull(),
	documentType: mysqlEnum(['incident_report','custom_report','executive_summary']).default('incident_report').notNull(),
	title: varchar({ length: 500 }).notNull(),
	titleAr: varchar({ length: 500 }).notNull(),
	generatedBy: int().notNull(),
	generatedByName: varchar({ length: 200 }),
	pdfUrl: text(),
	docMetadata: json(),
	isVerified: tinyint().default(1),
	docCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("incident_documents_documentId_unique").on(table.documentId),
	index("incident_documents_verificationCode_unique").on(table.verificationCode),
]);

export const incidentTimeline = mysqlTable("incident_timeline", {
	id: int().autoincrement().primaryKey().notNull(),
	incidentId: int().notNull(),
	eventType: varchar({ length: 100 }).notNull(),
	title: varchar({ length: 500 }),
	description: text(),
	performedBy: int(),
	metadata: json(),
	eventDate: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const incidents = mysqlTable("incidents", {
	id: int().autoincrement().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	titleAr: varchar({ length: 500 }),
	description: text(),
	status: mysqlEnum(['investigating','confirmed','contained','resolved','closed']).default('investigating'),
	severity: mysqlEnum(['critical','high','medium','low']).default('medium'),
	impactLevel: mysqlEnum(['catastrophic','severe','moderate','minor','negligible']).default('moderate'),
	sensitivity: mysqlEnum(['very_high','high','medium','low']).default('medium'),
	source: varchar({ length: 200 }),
	sourceType: varchar({ length: 100 }),
	affectedEntity: varchar({ length: 500 }),
	affectedEntityType: varchar({ length: 100 }),
	sector: varchar({ length: 200 }),
	estimatedRecords: bigint({ mode: "number" }),
	estimatedIndividuals: bigint({ mode: "number" }),
	piiCategories: json(),
	dataTypes: json(),
	discoveredAt: timestamp({ mode: 'string' }),
	confirmedAt: timestamp({ mode: 'string' }),
	containedAt: timestamp({ mode: 'string' }),
	resolvedAt: timestamp({ mode: 'string' }),
	reportedBy: int(),
	assignedTo: int(),
	relatedSiteId: int(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const kbSearchLog = mysqlTable("kb_search_log", {
	id: int().autoincrement().primaryKey().notNull(),
	kbsQuery: text().notNull(),
	kbsResultsCount: int().default(0),
	kbsMatchedIds: json(),
	kbsUserId: int(),
	kbsSource: mysqlEnum(['manual','ai_auto','api']).default('manual').notNull(),
	kbsCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const knowledgeBase = mysqlTable("knowledge_base", {
	id: int().autoincrement().primaryKey().notNull(),
	type: mysqlEnum(['document','qa','feedback','article','faq','regulation','term','guide','document_chunk']).notNull(),
	question: text(),
	answer: text(),
	content: text(),
	source: varchar({ length: 1000 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	title: varchar({ length: 500 }),
	category: varchar({ length: 100 }),
	tags: json(),
	embedding: json(),
	embeddingModel: varchar({ length: 100 }),
	tokenCount: int(),
	isActive: tinyint().default(1).notNull(),
	viewCount: int().default(0),
	useCount: int().default(0),
	createdBy: int(),
});

export const knowledgeGraphEdges = mysqlTable("knowledge_graph_edges", {
	id: int().autoincrement().primaryKey().notNull(),
	sourceNodeId: varchar({ length: 64 }).notNull(),
	targetNodeId: varchar({ length: 64 }).notNull(),
	edgeRelationship: varchar({ length: 100 }).notNull(),
	edgeRelationshipAr: varchar({ length: 100 }),
	edgeWeight: int().default(1),
	edgeMetadata: json(),
	edgeCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const knowledgeGraphNodes = mysqlTable("knowledge_graph_nodes", {
	id: int().autoincrement().primaryKey().notNull(),
	nodeId: varchar({ length: 64 }).notNull(),
	nodeType: mysqlEnum(['leak','seller','entity','sector','pii_type','platform','campaign']).notNull(),
	nodeLabel: varchar({ length: 255 }).notNull(),
	nodeLabelAr: varchar({ length: 255 }),
	nodeMetadata: json(),
	nodeCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("knowledge_graph_nodes_nodeId_unique").on(table.nodeId),
]);

export const kpiTargets = mysqlTable("kpi_targets", {
	id: int().autoincrement().primaryKey().notNull(),
	name: text().notNull(),
	nameAr: text().notNull(),
	category: mysqlEnum(['compliance','scanning','response','coverage','quality']).default('compliance'),
	targetValue: float().notNull(),
	currentValue: float(),
	unit: varchar({ length: 20 }).default('%'),
	period: mysqlEnum(['monthly','quarterly','yearly']).default('monthly'),
	direction: mysqlEnum(['higher_is_better','lower_is_better']).default('higher_is_better'),
	thresholdGreen: float().default(80),
	thresholdYellow: float().default(60),
	updatedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const leaks = mysqlTable("leaks", {
	id: int().autoincrement().primaryKey().notNull(),
	leakId: varchar({ length: 32 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	titleAr: varchar({ length: 500 }).notNull(),
	source: mysqlEnum(['telegram','darkweb','paste']).notNull(),
	severity: mysqlEnum(['critical','high','medium','low']).notNull(),
	sector: varchar({ length: 100 }).notNull(),
	sectorAr: varchar({ length: 100 }).notNull(),
	piiTypes: json().notNull(),
	recordCount: int().default(0).notNull(),
	status: mysqlEnum(['new','analyzing','documented','reported']).default('new').notNull(),
	description: text(),
	descriptionAr: text(),
	aiSeverity: mysqlEnum(['critical','high','medium','low']),
	aiSummary: text(),
	aiSummaryAr: text(),
	aiRecommendations: json(),
	aiRecommendationsAr: json(),
	aiConfidence: int(),
	enrichedAt: timestamp({ mode: 'string' }),
	sampleData: json(),
	sourceUrl: text(),
	sourcePlatform: varchar({ length: 255 }),
	screenshotUrls: json(),
	threatActor: varchar({ length: 255 }),
	leakPrice: varchar({ length: 100 }),
	breachMethod: varchar({ length: 255 }),
	breachMethodAr: varchar({ length: 255 }),
	region: varchar({ length: 100 }),
	regionAr: varchar({ length: 100 }),
	city: varchar({ length: 100 }),
	cityAr: varchar({ length: 100 }),
	victim: varchar({ length: 500 }),
	category: varchar({ length: 100 }),
	dataSensitivity: varchar({ length: 100 }),
	piiTypesAr: json(),
	piiTypesCount: int(),
	sampleFields: json(),
	sampleFieldsEn: json(),
	totalSampleRecords: int(),
	attackerInfo: json(),
	aiAnalysis: json(),
	pdplAnalysis: json(),
	sourcesInfo: json(),
	evidenceFiles: json(),
	overviewData: json(),
	latitude: varchar({ length: 20 }),
	longitude: varchar({ length: 20 }),
	detectedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	publishStatus: mysqlEnum('publishStatus', ['draft','pending_review','published','archived']).default('draft').notNull(),
	publishedAt: timestamp('publishedAt', { mode: 'string' }),
	publishedBy: int('publishedBy'),
	reviewNotes: text('reviewNotes'),
},
(table) => [
	index("leaks_leakId_unique").on(table.leakId),
]);

export const letters = mysqlTable("letters", {
	id: int().autoincrement().primaryKey().notNull(),
	letterNumber: varchar({ length: 100 }),
	title: varchar({ length: 500 }).notNull(),
	type: varchar({ length: 100 }),
	content: text(),
	recipientEntity: varchar({ length: 500 }),
	status: mysqlEnum(['draft','pending_approval','approved','sent','archived']).default('draft'),
	templateId: int(),
	fileUrl: text(),
	verificationCode: varchar({ length: 64 }),
	createdBy: int(),
	approvedBy: int(),
	sentAt: timestamp({ mode: 'string' }),
	deadline: timestamp({ mode: 'string' }),
	notes: text(),
	reminderSentAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const menus = mysqlTable("menus", {
	id: int().autoincrement().primaryKey().notNull(),
	key: varchar({ length: 100 }).notNull(),
	labelAr: varchar({ length: 500 }).notNull(),
	labelEn: varchar({ length: 500 }),
	icon: varchar({ length: 100 }),
	path: varchar({ length: 500 }),
	parentId: int(),
	workspace: varchar({ length: 100 }),
	sortOrder: int().default(0),
	isVisible: tinyint().default(1),
	requiredRole: varchar({ length: 50 }),
	badge: varchar({ length: 50 }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const messageTemplates = mysqlTable("message_templates", {
	id: int().autoincrement().primaryKey().notNull(),
	templateKey: varchar({ length: 100 }).notNull(),
	nameAr: text().notNull(),
	nameEn: varchar({ length: 255 }),
	subject: text().notNull(),
	body: text().notNull(),
	variables: json(),
	category: varchar({ length: 50 }),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	workspace: mysqlEnum('workspace', ['leaks', 'privacy', 'both']).default('both').notNull(),
},
(table) => [
	index("message_templates_templateKey_unique").on(table.templateKey),
]);

export const messageTemplatesCatalog = mysqlTable("message_templates_catalog", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 500 }).notNull(),
	type: varchar({ length: 100 }),
	templateText: text(),
	placeholders: json(),
	examples: json(),
	version: int().default(1),
	isActive: tinyint().default(1),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const mobileApps = mysqlTable("mobile_apps", {
	id: int().autoincrement().primaryKey().notNull(),
	appName: text(),
	appNameAr: text(),
	developer: text(),
	platform: mysqlEnum(['android','ios','huawei']).notNull(),
	storeUrl: text().notNull(),
	packageName: varchar({ length: 255 }),
	privacyPolicyUrl: text(),
	iconUrl: text(),
	downloads: varchar({ length: 50 }),
	rating: float(),
	category: varchar({ length: 100 }),
	sectorType: mysqlEnum(['public','private']).default('private'),
	entityName: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const monitoringJobs = mysqlTable("monitoring_jobs", {
	id: int().autoincrement().primaryKey().notNull(),
	jobId: varchar({ length: 64 }).notNull(),
	jobName: varchar({ length: 255 }).notNull(),
	jobNameAr: varchar({ length: 255 }).notNull(),
	jobPlatform: mysqlEnum(['telegram','darkweb','paste','all']).notNull(),
	cronExpression: varchar({ length: 50 }).notNull(),
	jobStatus: mysqlEnum(['active','paused','running','error']).default('active').notNull(),
	lastRunAt: timestamp({ mode: 'string' }),
	nextRunAt: timestamp({ mode: 'string' }),
	lastResult: text(),
	leaksFound: int().default(0),
	totalRuns: int().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("monitoring_jobs_jobId_unique").on(table.jobId),
]);

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	title: varchar({ length: 500 }).notNull(),
	message: text(),
	type: varchar({ length: 100 }),
	entityType: varchar({ length: 100 }),
	entityId: int(),
	isRead: tinyint().default(0),
	link: text(),
	readAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	workspace: mysqlEnum('workspace', ['leaks', 'privacy', 'both']).default('both').notNull(),
});

export const osintQueries = mysqlTable("osint_queries", {
	id: int().autoincrement().primaryKey().notNull(),
	queryId: varchar({ length: 32 }).notNull(),
	queryName: varchar({ length: 255 }).notNull(),
	queryNameAr: varchar({ length: 255 }).notNull(),
	queryType: mysqlEnum(['google_dork','shodan','recon','spiderfoot']).notNull(),
	queryCategory: varchar({ length: 100 }).notNull(),
	queryCategoryAr: varchar({ length: 100 }),
	queryText: text().notNull(),
	queryDescription: text(),
	queryDescriptionAr: text(),
	queryResultsCount: int().default(0),
	queryLastRunAt: timestamp({ mode: 'string' }),
	queryEnabled: tinyint().default(1).notNull(),
	queryCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("osint_queries_queryId_unique").on(table.queryId),
]);

export const pageConfigs = mysqlTable("page_configs", {
	id: int().autoincrement().primaryKey().notNull(),
	pageKey: varchar({ length: 100 }).notNull(),
	titleAr: varchar({ length: 200 }).notNull(),
	titleEn: varchar({ length: 200 }),
	description: text(),
	icon: varchar({ length: 50 }),
	path: varchar({ length: 200 }).notNull(),
	parentGroup: varchar({ length: 100 }),
	sortOrder: int().default(0),
	isVisible: tinyint().default(1),
	isEnabled: tinyint().default(1),
	requiredRole: varchar({ length: 50 }),
	customCss: text(),
	customTitle: text(),
	customDescription: text(),
	badgeText: varchar({ length: 50 }),
	badgeColor: varchar({ length: 20 }),
	updatedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("page_configs_pageKey_unique").on(table.pageKey),
]);

export const pageDescriptors = mysqlTable("page_descriptors", {
	id: int().autoincrement().primaryKey().notNull(),
	pageSlug: varchar({ length: 200 }).notNull(),
	purpose: text(),
	mainElements: json(),
	commonTasks: json(),
	drillLinks: json(),
	suggestedQuestions: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const pages = mysqlTable("pages", {
	id: int().autoincrement().primaryKey().notNull(),
	slug: varchar({ length: 200 }).notNull(),
	titleAr: varchar({ length: 500 }).notNull(),
	titleEn: varchar({ length: 500 }),
	description: text(),
	workspace: varchar({ length: 100 }),
	isVisible: tinyint().default(1),
	sortOrder: int().default(0),
	icon: varchar({ length: 100 }),
	parentId: int(),
	requiredRole: varchar({ length: 50 }),
	config: json(),
	version: int().default(1),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	used: tinyint().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("password_reset_tokens_token_unique").on(table.token),
]);

export const pasteEntries = mysqlTable("paste_entries", {
	id: int().autoincrement().primaryKey().notNull(),
	filename: varchar({ length: 255 }).notNull(),
	sourceName: varchar({ length: 255 }).notNull(),
	fileSize: varchar({ length: 50 }),
	pastePiiTypes: json(),
	preview: text(),
	pasteStatus: mysqlEnum(['flagged','analyzing','documented','reported']).default('flagged').notNull(),
	detectedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const pdfReportHistory = mysqlTable("pdf_report_history", {
	id: int().autoincrement().primaryKey().notNull(),
	reportType: mysqlEnum(['compliance_summary','sector_comparison','trend_analysis','full_report','monthly_comparison']).default('compliance_summary'),
	title: varchar({ length: 255 }).notNull(),
	pdfUrl: text(),
	fileSize: int(),
	generatedBy: int(),
	scheduledReportId: int(),
	recipientsSent: json(),
	isAutoGenerated: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const personalityScenarios = mysqlTable("personality_scenarios", {
	id: int().autoincrement().primaryKey().notNull(),
	type: mysqlEnum(['welcome_first','welcome_return','leader_respect','farewell','encouragement','occasion']).notNull(),
	triggerKeyword: varchar({ length: 100 }),
	textAr: text().notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const piiScans = mysqlTable("pii_scans", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	inputText: text().notNull(),
	results: json().notNull(),
	totalMatches: int().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const platformAnalytics = mysqlTable("platform_analytics", {
	id: int().autoincrement().primaryKey().notNull(),
	eventType: mysqlEnum(['page_view','scan','report','login','export','search','api_call']).notNull(),
	userId: int(),
	page: varchar({ length: 255 }),
	metadata: json(),
	sessionId: varchar({ length: 100 }),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const platformSettings = mysqlTable("platform_settings", {
	id: int().autoincrement().primaryKey().notNull(),
	settingKey: varchar({ length: 200 }).notNull(),
	settingValue: text(),
	settingType: varchar({ length: 50 }).default('string'),
	category: varchar({ length: 100 }),
	description: text(),
	updatedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	label: text(),
	labelEn: text(),
	isEditable: tinyint().default(1),
	sortOrder: int().default(0),
},
(table) => [
	index("platform_settings_settingKey_unique").on(table.settingKey),
]);

export const platformUsers = mysqlTable("platform_users", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: varchar({ length: 50 }).notNull(),
	passwordHash: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 200 }).notNull(),
	email: varchar({ length: 320 }),
	mobile: varchar({ length: 20 }),
	displayName: varchar({ length: 200 }).notNull(),
	platformRole: mysqlEnum(['root_admin','director','vice_president','manager','analyst','viewer']).default('viewer').notNull(),
	status: mysqlEnum(['active','inactive','suspended']).default('active').notNull(),
	lastLoginAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("platform_users_userId_unique").on(table.userId),
]);

export const presentationTemplates = mysqlTable("presentation_templates", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	nameEn: varchar({ length: 255 }),
	description: text(),
	category: mysqlEnum(['business_plan','report','sales_pitch','compliance','executive','custom']).default('custom').notNull(),
	thumbnail: text(),
	slides: json().notNull(),
	isBuiltIn: tinyint().default(0).notNull(),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const presentations = mysqlTable("presentations", {
	id: int().autoincrement().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	templateId: int(),
	slides: json().notNull(),
	userId: int().notNull(),
	isPublic: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});


export const reportAudit = mysqlTable("report_audit", {
	id: int().autoincrement().primaryKey().notNull(),
	reportId: varchar({ length: 64 }),
	documentId: varchar({ length: 64 }),
	reportType: varchar({ length: 100 }),
	generatedBy: int(),
	generatedByName: varchar({ length: 200 }),
	complianceAcknowledged: tinyint().default(0).notNull(),
	acknowledgedAt: timestamp({ mode: 'string' }),
	filters: json(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const reportExecutions = mysqlTable("report_executions", {
	id: int().autoincrement().primaryKey().notNull(),
	reportId: int().notNull(),
	status: mysqlEnum(['running','completed','failed']).default('running'),
	recipientCount: int().default(0),
	summary: text(),
	startedAt: timestamp({ mode: 'string' }).notNull(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	workspace: mysqlEnum('workspace', ['leaks', 'privacy', 'both']).default('leaks').notNull(),
});

export const reportTemplates = mysqlTable("report_templates", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 500 }).notNull(),
	nameAr: varchar({ length: 500 }),
	description: text(),
	type: varchar({ length: 100 }),
	structure: json(),
	headerConfig: json(),
	footerConfig: json(),
	isActive: tinyint().default(1),
	version: int().default(1),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const reports = mysqlTable("reports", {
	id: int().autoincrement().primaryKey().notNull(),
	title: varchar({ length: 500 }).notNull(),
	titleAr: varchar({ length: 500 }),
	description: text(),
	summaryAr: text(),
	type: mysqlEnum(['privacy_compliance','incident_summary','executive_brief','custom','scheduled','monthly','quarterly','special']).default('custom'),
	templateId: int(),
	status: mysqlEnum(['draft','generating','ready','archived']).default('draft'),
	filters: json(),
	content: text(),
	fileUrl: text(),
	fileKey: varchar({ length: 500 }),
	format: varchar({ length: 20 }),
	pageCount: int(),
	verificationCode: varchar({ length: 64 }),
	qrCodeUrl: text(),
	generatedBy: int(),
	generatedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	workspace: mysqlEnum('workspace', ['leaks', 'privacy', 'both']).default('leaks').notNull(),
});

export const retentionPolicies = mysqlTable("retention_policies", {
	id: int().autoincrement().primaryKey().notNull(),
	retentionEntity: mysqlEnum(['leaks','audit_logs','notifications','pii_scans','paste_entries']).notNull(),
	entityLabel: varchar({ length: 100 }).notNull(),
	entityLabelAr: varchar({ length: 100 }).notNull(),
	retentionDays: int().default(365).notNull(),
	archiveAction: mysqlEnum(['delete','archive']).default('archive').notNull(),
	isEnabled: tinyint().default(0).notNull(),
	lastRunAt: timestamp({ mode: 'string' }),
	recordsArchived: int().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("retention_policies_retentionEntity_unique").on(table.retentionEntity),
]);

export const roles = mysqlTable("roles", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	nameAr: varchar({ length: 200 }),
	description: text(),
	isSystem: tinyint().default(0),
	permissions: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const savedFilters = mysqlTable("saved_filters", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	filters: json().notNull(),
	isDefault: tinyint().default(0),
	isShared: tinyint().default(0),
	usageCount: int().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const scanSchedules = mysqlTable("scan_schedules", {
	id: int().autoincrement().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	frequency: mysqlEnum(['daily','weekly','monthly']).notNull(),
	dayOfWeek: int(),
	dayOfMonth: int(),
	hour: int().default(2),
	targetType: mysqlEnum(['all_sites','sector','category','specific_sites','all_apps']).default('all_sites'),
	targetFilter: json(),
	isActive: tinyint().default(1),
	lastRunAt: timestamp({ mode: 'string' }),
	nextRunAt: timestamp({ mode: 'string' }),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const scans = mysqlTable("scans", {
	id: int().autoincrement().primaryKey().notNull(),
	siteId: int().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	overallScore: float(),
	rating: varchar({ length: 50 }),
	complianceStatus: mysqlEnum(['compliant','partially_compliant','non_compliant','no_policy']).default('no_policy'),
	summary: text(),
	clause1Compliant: tinyint().default(0),
	clause1Evidence: text(),
	clause2Compliant: tinyint().default(0),
	clause2Evidence: text(),
	clause3Compliant: tinyint().default(0),
	clause3Evidence: text(),
	clause4Compliant: tinyint().default(0),
	clause4Evidence: text(),
	clause5Compliant: tinyint().default(0),
	clause5Evidence: text(),
	clause6Compliant: tinyint().default(0),
	clause6Evidence: text(),
	clause7Compliant: tinyint().default(0),
	clause7Evidence: text(),
	clause8Compliant: tinyint().default(0),
	clause8Evidence: text(),
	recommendations: json(),
	screenshotUrl: text(),
	privacyTextContent: text(),
	scannedBy: int(),
	scanDate: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	detectedLanguage: varchar({ length: 10 }),
	privacyTitle: text(),
	privacyStatusCode: varchar({ length: 10 }),
	privacyLanguage: varchar({ length: 50 }),
	privacyLastUpdate: text(),
	privacyEntityName: text(),
	privacyEmails: text(),
	privacyPhones: text(),
	privacyAddress: text(),
	privacyDpo: text(),
	privacyContactForm: text(),
	privacyInternalLinks: text(),
	privacyWordCount: int(),
	privacyCharCount: int(),
	privacyRobotsStatus: varchar({ length: 50 }),
	privacyDiscoveryMethod: varchar({ length: 50 }),
	privacyConfidence: int(),
	mentionsDataTypes: varchar({ length: 10 }),
	dataTypesList: text(),
	mentionsPurpose: varchar({ length: 10 }),
	purposeList: text(),
	mentionsLegalBasis: varchar({ length: 10 }),
	mentionsRights: varchar({ length: 10 }),
	rightsList: text(),
	mentionsRetention: varchar({ length: 10 }),
	mentionsThirdParties: varchar({ length: 10 }),
	thirdPartiesList: text(),
	mentionsCrossBorder: varchar({ length: 10 }),
	mentionsSecurity: varchar({ length: 10 }),
	mentionsCookies: varchar({ length: 10 }),
	mentionsChildren: varchar({ length: 10 }),
	privacyFinalUrl: text(),
	crawlStatus: varchar({ length: 50 }),
});

export const scheduleExecutions = mysqlTable("schedule_executions", {
	id: int().autoincrement().primaryKey().notNull(),
	scheduleId: int().notNull(),
	startedAt: timestamp({ mode: 'string' }).notNull(),
	completedAt: timestamp({ mode: 'string' }),
	totalSites: int().default(0),
	completedSites: int().default(0),
	failedSites: int().default(0),
	status: mysqlEnum(['running','completed','failed']).default('running'),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const scheduledReports = mysqlTable("scheduled_reports", {
	id: int().autoincrement().primaryKey().notNull(),
	templateId: int().notNull(),
	name: varchar({ length: 500 }),
	description: text(),
	reportType: varchar({ length: 50 }),
	frequency: varchar({ length: 50 }),
	dayOfWeek: int(),
	dayOfMonth: int(),
	hour: int().default(8),
	schedule: varchar({ length: 50 }),
	cronExpression: varchar({ length: 100 }),
	filters: json(),
	recipients: json(),
	format: varchar({ length: 20 }).default('pdf'),
	isActive: tinyint().default(1),
	includeCharts: tinyint().default(1),
	lastSentAt: timestamp({ mode: 'string' }),
	nextSendAt: timestamp({ mode: 'string' }),
	lastRunAt: timestamp({ mode: 'string' }),
	nextRunAt: timestamp({ mode: 'string' }),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const sellerProfiles = mysqlTable("seller_profiles", {
	id: int().autoincrement().primaryKey().notNull(),
	sellerId: varchar({ length: 64 }).notNull(),
	sellerName: varchar({ length: 255 }).notNull(),
	sellerAliases: json(),
	sellerPlatforms: json().notNull(),
	totalLeaks: int().default(0),
	sellerTotalRecords: int().default(0),
	sellerRiskScore: int().default(0),
	sellerRiskLevel: mysqlEnum(['critical','high','medium','low']).default('medium').notNull(),
	sellerSectors: json(),
	sellerLastActivity: timestamp({ mode: 'string' }),
	sellerFirstSeen: timestamp({ mode: 'string' }).defaultNow().notNull(),
	sellerNotes: text(),
	sellerIsActive: tinyint().default(1).notNull(),
	sellerCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	sellerUpdatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("seller_profiles_sellerId_unique").on(table.sellerId),
]);

export const settingsAuditLog = mysqlTable("settings_audit_log", {
	id: int().autoincrement().primaryKey().notNull(),
	tableName: varchar({ length: 100 }).notNull(),
	recordKey: varchar({ length: 255 }).notNull(),
	fieldName: varchar({ length: 255 }).notNull(),
	oldValue: text(),
	newValue: text(),
	changeType: mysqlEnum(['create','update','delete','rollback']).default('update').notNull(),
	userId: int(),
	userName: varchar({ length: 255 }),
	ipAddress: varchar({ length: 45 }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const siteRequirements = mysqlTable("site_requirements", {
	id: int().autoincrement().primaryKey().notNull(),
	siteId: int().notNull(),
	scanId: int(),
	requirementCode: varchar({ length: 50 }).notNull(),
	requirementNameAr: varchar({ length: 500 }),
	requirementNameEn: varchar({ length: 500 }),
	clauseNumber: varchar({ length: 20 }),
	status: mysqlEnum(['met','partial','not_met','not_applicable']).default('not_met'),
	evidence: text(),
	recommendation: text(),
	severity: mysqlEnum(['critical','high','medium','low']).default('medium'),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const siteScans = mysqlTable("site_scans", {
	id: int().autoincrement().primaryKey().notNull(),
	siteId: int().notNull(),
	scanType: varchar({ length: 50 }).default('standard'),
	status: mysqlEnum(['pending','running','completed','failed']).default('pending'),
	complianceScore: float(),
	complianceStatus: varchar({ length: 50 }),
	findings: json(),
	rawData: json(),
	privacyPolicyText: text(),
	privacyPolicyHash: varchar({ length: 64 }),
	duration: int(),
	errorMessage: text(),
	scannedBy: int(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const siteWatchers = mysqlTable("site_watchers", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	siteId: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const sites = mysqlTable("sites", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: varchar({ length: 255 }),
	siteName: text(),
	sectorType: mysqlEnum(['public','private']).default('private'),
	classification: varchar({ length: 100 }),
	privacyUrl: text(),
	privacyMethod: varchar({ length: 100 }),
	contactUrl: text(),
	url: text().notNull(),
	workingUrl: text(),
	finalUrl: text(),
	siteNameAr: varchar({ length: 500 }),
	siteNameEn: varchar({ length: 500 }),
	siteTitle: text(),
	siteDescription: text(),
	title: text(),
	description: text(),
	entityType: varchar({ length: 100 }),
	entityNameAr: varchar({ length: 500 }),
	entityNameEn: varchar({ length: 500 }),
	sector: varchar({ length: 200 }),
	complianceStatus: mysqlEnum(['compliant','partial','non_compliant','not_working']).default('non_compliant'),
	hasPrivacyPolicy: tinyint().default(0),
	hasContactInfo: tinyint().default(0),
	privacyPolicyUrl: text(),
	phones: json(),
	emails: json(),
	siteStatus: mysqlEnum(['active','unreachable']).default('active'),
	screenshotUrl: text(),
	privacyTextUrl: text(),
	mxRecords: json(),
	cms: varchar({ length: 100 }),
	sslStatus: varchar({ length: 50 }),
	httpStatus: int(),
	httpsStatus: int(),
	lastScanDate: timestamp({ mode: 'string' }),
	lastChangeDate: timestamp({ mode: 'string' }),
	followupPriority: int().default(0),
	isActive: tinyint().default(1),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	httpsWww: varchar({ length: 50 }),
	httpsNoWww: varchar({ length: 50 }),
	httpWww: varchar({ length: 50 }),
	httpNoWww: varchar({ length: 50 }),
});

export const smartAlerts = mysqlTable("smart_alerts", {
	id: int().autoincrement().primaryKey().notNull(),
	siteId: int().notNull(),
	riskLevel: mysqlEnum(['low','medium','high','critical']).default('medium'),
	riskScore: float(),
	predictedChange: text(),
	factors: json(),
	recommendations: json(),
	analysisData: json(),
	isActive: tinyint().default(1),
	acknowledgedBy: int(),
	acknowledgedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const systemEvents = mysqlTable("system_events", {
	id: int().autoincrement().primaryKey().notNull(),
	eventType: varchar({ length: 200 }).notNull(),
	source: varchar({ length: 200 }),
	severity: mysqlEnum(['info','warning','error','critical']).default('info'),
	message: text(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const systemSettings = mysqlTable("system_settings", {
	id: int().autoincrement().primaryKey().notNull(),
	settingKey: varchar({ length: 100 }).notNull(),
	settingValue: text(),
	settingType: mysqlEnum(['string','number','boolean','json']).default('string'),
	category: varchar({ length: 50 }).default('general'),
	label: text(),
	description: text(),
	isEditable: tinyint().default(1),
	updatedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("system_settings_settingKey_unique").on(table.settingKey),
]);

export const themeSettings = mysqlTable("theme_settings", {
	id: int().autoincrement().primaryKey().notNull(),
	themeKey: varchar({ length: 100 }).notNull(),
	themeValue: text(),
	themeType: mysqlEnum(['color','font','size','gradient','shadow','border','animation']).default('color'),
	category: mysqlEnum(['primary','secondary','accent','background','text','border','shadow','font','layout']).default('primary'),
	label: text(),
	description: text(),
	cssVariable: varchar({ length: 100 }),
	previewValue: text(),
	isActive: tinyint().default(1),
	updatedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("theme_settings_themeKey_unique").on(table.themeKey),
]);

export const threatActors = mysqlTable("threat_actors", {
	id: int().autoincrement().primaryKey().notNull(),
	name: varchar({ length: 500 }).notNull(),
	aliases: json(),
	description: text(),
	threatLevel: varchar({ length: 50 }),
	activityCount: int().default(0),
	lastActivity: timestamp({ mode: 'string' }),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const threatRules = mysqlTable("threat_rules", {
	id: int().autoincrement().primaryKey().notNull(),
	ruleId: varchar({ length: 32 }).notNull(),
	ruleName: varchar({ length: 255 }).notNull(),
	ruleNameAr: varchar({ length: 255 }).notNull(),
	ruleDescription: text(),
	ruleDescriptionAr: text(),
	ruleCategory: mysqlEnum(['data_leak','credentials','sale_ad','db_dump','financial','health','government','telecom','education','infrastructure']).notNull(),
	ruleSeverity: mysqlEnum(['critical','high','medium','low']).notNull(),
	rulePatterns: json().notNull(),
	ruleKeywords: json(),
	ruleEnabled: tinyint().default(1).notNull(),
	ruleMatchCount: int().default(0),
	ruleLastMatchAt: timestamp({ mode: 'string' }),
	ruleCreatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("threat_rules_ruleId_unique").on(table.ruleId),
]);

export const trainingDocuments = mysqlTable("training_documents", {
	id: int().autoincrement().primaryKey().notNull(),
	fileName: varchar({ length: 255 }).notNull(),
	fileUrl: text().notNull(),
	fileSize: int(),
	mimeType: varchar({ length: 100 }),
	status: mysqlEnum(['pending','processing','completed','failed']).default('pending').notNull(),
	extractedContent: text(),
	chunksCount: int().default(0),
	uploadedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const uiPolicies = mysqlTable("ui_policies", {
	id: int().autoincrement().primaryKey().notNull(),
	pageSlug: varchar({ length: 200 }),
	elementSelector: varchar({ length: 500 }),
	action: mysqlEnum(['show','hide','disable','relabel']).default('show'),
	newLabel: varchar({ length: 500 }),
	targetScope: varchar({ length: 100 }),
	targetValue: varchar({ length: 200 }),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const userDashboardWidgets = mysqlTable("user_dashboard_widgets", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	widgetType: varchar({ length: 50 }).notNull(),
	title: text(),
	position: int().default(0).notNull(),
	gridWidth: int().default(1).notNull(),
	isVisible: tinyint().default(1).notNull(),
	config: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const userRoles = mysqlTable("user_roles", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	roleId: int().notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	grantedBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const userSessions = mysqlTable("user_sessions", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int().notNull(),
	sessionToken: varchar({ length: 512 }).notNull(),
	deviceInfo: varchar({ length: 255 }),
	ipAddress: varchar({ length: 45 }),
	isActive: tinyint().default(1).notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	lastActivity: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().primaryKey().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 20 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin','superadmin']).default('user').notNull(),
	department: varchar({ length: 255 }),
	organization: varchar({ length: 255 }),
	avatarUrl: text(),
	preferences: json(),
	isActive: tinyint().default(1),
	lastSignedIn: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	rasidRole: mysqlEnum(['root','admin','smart_monitor_manager','monitoring_director','monitoring_specialist','monitoring_officer','requester','respondent','ndmo_desk','legal_advisor','director','board_secretary','auditor']).default('monitoring_officer'),
	username: varchar({ length: 64 }),
	passwordHash: varchar({ length: 255 }),
	displayName: varchar({ length: 255 }),
	mobile: varchar({ length: 20 }),
	failedLoginAttempts: int().default(0).notNull(),
	lockedUntil: timestamp({ mode: 'string' }),
	emailNotifications: tinyint().default(1).notNull(),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);

export const verificationRecords = mysqlTable("verification_records", {
	id: int().autoincrement().primaryKey().notNull(),
	code: varchar({ length: 64 }).notNull(),
	entityType: varchar({ length: 100 }).notNull(),
	entityId: int().notNull(),
	summary: text(),
	isValid: tinyint().default(1),
	verifiedCount: int().default(0),
	lastVerifiedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("verification_records_code_unique").on(table.code),
]);

export const visualAlerts = mysqlTable("visual_alerts", {
	id: int().autoincrement().primaryKey().notNull(),
	siteId: int().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	siteName: text(),
	alertType: mysqlEnum(['status_change','score_change','policy_added','policy_removed','clause_change']).default('status_change'),
	severity: mysqlEnum(['info','warning','critical','success']).default('info'),
	previousStatus: varchar({ length: 50 }),
	newStatus: varchar({ length: 50 }),
	previousScore: float(),
	newScore: float(),
	message: text(),
	details: json(),
	isRead: tinyint().default(0).notNull(),
	isDismissed: tinyint().default(0).notNull(),
	userId: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});


// ═══════════════════════════════════════════════════════════════
// TYPE EXPORTS
// ═══════════════════════════════════════════════════════════════
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
export type AiChatMessage = typeof aiChatMessages.$inferSelect;
export type InsertAiChatMessage = typeof aiChatMessages.$inferInsert;
export type AiChatSession = typeof aiChatSessions.$inferSelect;
export type InsertAiChatSession = typeof aiChatSessions.$inferInsert;
export type AiCustomCommand = typeof aiCustomCommands.$inferSelect;
export type InsertAiCustomCommand = typeof aiCustomCommands.$inferInsert;
export type AiFeedbackLegacy = typeof aiFeedbackLegacy.$inferSelect;
export type InsertAiFeedbackLegacy = typeof aiFeedbackLegacy.$inferInsert;
export type AiRating = typeof aiRatings.$inferSelect;
export type InsertAiRating = typeof aiRatings.$inferInsert;
export type AiScenario = typeof aiScenarios.$inferSelect;
export type InsertAiScenario = typeof aiScenarios.$inferInsert;
export type AiSearchLogEntry = typeof aiSearchLog.$inferSelect;
export type InsertAiSearchLogEntry = typeof aiSearchLog.$inferInsert;
export type AiTrainingLog = typeof aiTrainingLogs.$inferSelect;
export type InsertAiTrainingLog = typeof aiTrainingLogs.$inferInsert;
export type AiUserSession = typeof aiUserSessions.$inferSelect;
export type InsertAiUserSession = typeof aiUserSessions.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;
export type AppScan = typeof appScans.$inferSelect;
export type InsertAppScan = typeof appScans.$inferInsert;
export type BatchScanJob = typeof batchScanJobs.$inferSelect;
export type InsertBatchScanJob = typeof batchScanJobs.$inferInsert;
export type BulkAnalysisJob = typeof bulkAnalysisJobs.$inferSelect;
export type InsertBulkAnalysisJob = typeof bulkAnalysisJobs.$inferInsert;
export type BulkAnalysisResult = typeof bulkAnalysisResults.$inferSelect;
export type InsertBulkAnalysisResult = typeof bulkAnalysisResults.$inferInsert;
export type CaseComment = typeof caseComments.$inferSelect;
export type InsertCaseComment = typeof caseComments.$inferInsert;
export type CaseHistoryEntry = typeof caseHistory.$inferSelect;
export type InsertCaseHistoryEntry = typeof caseHistory.$inferInsert;
export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;
export type ChangeDetectionLog = typeof changeDetectionLogs.$inferSelect;
export type InsertChangeDetectionLog = typeof changeDetectionLogs.$inferInsert;
export type ChatHistoryEntry = typeof chatHistory.$inferSelect;
export type InsertChatHistoryEntry = typeof chatHistory.$inferInsert;
export type ComplianceAlert = typeof complianceAlerts.$inferSelect;
export type InsertComplianceAlert = typeof complianceAlerts.$inferInsert;
export type ComplianceChangeNotification = typeof complianceChangeNotifications.$inferSelect;
export type InsertComplianceChangeNotification = typeof complianceChangeNotifications.$inferInsert;
export type ContentBlock = typeof contentBlocks.$inferSelect;
export type InsertContentBlock = typeof contentBlocks.$inferInsert;
export type CustomAction = typeof customActions.$inferSelect;
export type InsertCustomAction = typeof customActions.$inferInsert;
export type DashboardSnapshot = typeof dashboardSnapshots.$inferSelect;
export type InsertDashboardSnapshot = typeof dashboardSnapshots.$inferInsert;
export type DataTransferLog = typeof dataTransferLogs.$inferSelect;
export type InsertDataTransferLog = typeof dataTransferLogs.$inferInsert;
export type DeepScanQueueItem = typeof deepScanQueue.$inferSelect;
export type InsertDeepScanQueueItem = typeof deepScanQueue.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type EmailNotificationPref = typeof emailNotificationPrefs.$inferSelect;
export type InsertEmailNotificationPref = typeof emailNotificationPrefs.$inferInsert;
export type EscalationLog = typeof escalationLogs.$inferSelect;
export type InsertEscalationLog = typeof escalationLogs.$inferInsert;
export type EscalationRule = typeof escalationRules.$inferSelect;
export type InsertEscalationRule = typeof escalationRules.$inferInsert;
export type ExecutiveAlert = typeof executiveAlerts.$inferSelect;
export type InsertExecutiveAlert = typeof executiveAlerts.$inferInsert;
export type ExecutiveReport = typeof executiveReports.$inferSelect;
export type InsertExecutiveReport = typeof executiveReports.$inferInsert;
export type KnowledgeBaseEntry = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBaseEntry = typeof knowledgeBase.$inferInsert;
export type KpiTarget = typeof kpiTargets.$inferSelect;
export type InsertKpiTarget = typeof kpiTargets.$inferInsert;
export type Letter = typeof letters.$inferSelect;
export type InsertLetter = typeof letters.$inferInsert;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = typeof messageTemplates.$inferInsert;
export type MobileApp = typeof mobileApps.$inferSelect;
export type InsertMobileApp = typeof mobileApps.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type PageConfig = typeof pageConfigs.$inferSelect;
export type InsertPageConfig = typeof pageConfigs.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type PdfReportHistory = typeof pdfReportHistory.$inferSelect;
export type InsertPdfReportHistory = typeof pdfReportHistory.$inferInsert;
export type PersonalityScenario = typeof personalityScenarios.$inferSelect;
export type InsertPersonalityScenario = typeof personalityScenarios.$inferInsert;
export type PlatformAnalytic = typeof platformAnalytics.$inferSelect;
export type InsertPlatformAnalytic = typeof platformAnalytics.$inferInsert;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type InsertPlatformSetting = typeof platformSettings.$inferInsert;
export type ReportAudit = typeof reportAudit.$inferSelect;
export type InsertReportAudit = typeof reportAudit.$inferInsert;
export type ReportExecution = typeof reportExecutions.$inferSelect;
export type InsertReportExecution = typeof reportExecutions.$inferInsert;
export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;
export type ScanSchedule = typeof scanSchedules.$inferSelect;
export type InsertScanSchedule = typeof scanSchedules.$inferInsert;
export type Scan = typeof scans.$inferSelect;
export type InsertScan = typeof scans.$inferInsert;
export type ScheduleExecution = typeof scheduleExecutions.$inferSelect;
export type InsertScheduleExecution = typeof scheduleExecutions.$inferInsert;
export type ScheduledReport = typeof scheduledReports.$inferSelect;
export type InsertScheduledReport = typeof scheduledReports.$inferInsert;
export type SiteWatcher = typeof siteWatchers.$inferSelect;
export type InsertSiteWatcher = typeof siteWatchers.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type InsertSite = typeof sites.$inferInsert;
export type SmartAlert = typeof smartAlerts.$inferSelect;
export type InsertSmartAlert = typeof smartAlerts.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
export type ThemeSetting = typeof themeSettings.$inferSelect;
export type InsertThemeSetting = typeof themeSettings.$inferInsert;
export type TrainingDocument = typeof trainingDocuments.$inferSelect;
export type InsertTrainingDocument = typeof trainingDocuments.$inferInsert;
export type UserDashboardWidget = typeof userDashboardWidgets.$inferSelect;
export type InsertUserDashboardWidget = typeof userDashboardWidgets.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type VisualAlert = typeof visualAlerts.$inferSelect;
export type InsertVisualAlert = typeof visualAlerts.$inferInsert;
export type SettingsAuditLogEntry = typeof settingsAuditLog.$inferSelect;
export type InsertSettingsAuditLogEntry = typeof settingsAuditLog.$inferInsert;
export type PresentationTemplate = typeof presentationTemplates.$inferSelect;
export type InsertPresentationTemplate = typeof presentationTemplates.$inferInsert;
export type Presentation = typeof presentations.$inferSelect;
export type InsertPresentation = typeof presentations.$inferInsert;
export type Leak = typeof leaks.$inferSelect;
export type InsertLeak = typeof leaks.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type InsertChannel = typeof channels.$inferInsert;
export type PiiScan = typeof piiScans.$inferSelect;
export type InsertPiiScan = typeof piiScans.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type DarkWebListing = typeof darkWebListings.$inferSelect;
export type InsertDarkWebListing = typeof darkWebListings.$inferInsert;
export type PasteEntry = typeof pasteEntries.$inferSelect;
export type InsertPasteEntry = typeof pasteEntries.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type InsertAuditLogEntry = typeof auditLog.$inferInsert;
export type MonitoringJob = typeof monitoringJobs.$inferSelect;
export type InsertMonitoringJob = typeof monitoringJobs.$inferInsert;
export type AlertContact = typeof alertContacts.$inferSelect;
export type InsertAlertContact = typeof alertContacts.$inferInsert;
export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = typeof alertRules.$inferInsert;
export type AlertHistoryEntry = typeof alertHistory.$inferSelect;
export type InsertAlertHistoryEntry = typeof alertHistory.$inferInsert;
export type RetentionPolicy = typeof retentionPolicies.$inferSelect;
export type InsertRetentionPolicy = typeof retentionPolicies.$inferInsert;
export type ThreatRule = typeof threatRules.$inferSelect;
export type InsertThreatRule = typeof threatRules.$inferInsert;
export type EvidenceChainEntry = typeof evidenceChain.$inferSelect;
export type InsertEvidenceChainEntry = typeof evidenceChain.$inferInsert;
export type SellerProfile = typeof sellerProfiles.$inferSelect;
export type InsertSellerProfile = typeof sellerProfiles.$inferInsert;
export type OsintQuery = typeof osintQueries.$inferSelect;
export type InsertOsintQuery = typeof osintQueries.$inferInsert;
export type FeedbackEntry = typeof feedbackEntries.$inferSelect;
export type InsertFeedbackEntry = typeof feedbackEntries.$inferInsert;
export type KnowledgeGraphNode = typeof knowledgeGraphNodes.$inferSelect;
export type KnowledgeGraphEdge = typeof knowledgeGraphEdges.$inferSelect;
export type PlatformUser = typeof platformUsers.$inferSelect;
export type InsertPlatformUser = typeof platformUsers.$inferInsert;
export type IncidentDocument = typeof incidentDocuments.$inferSelect;
export type InsertIncidentDocument = typeof incidentDocuments.$inferInsert;
export type AiResponseRating = typeof aiResponseRatings.$inferSelect;
export type InsertAiResponseRating = typeof aiResponseRatings.$inferInsert;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type KbSearchLogEntry = typeof kbSearchLog.$inferSelect;
export type InsertKbSearchLogEntry = typeof kbSearchLog.$inferInsert;
export type IncidentCertification = typeof incidentCertifications.$inferSelect;
export type InsertIncidentCertification = typeof incidentCertifications.$inferInsert;
export type AdminRole = typeof adminRoles.$inferSelect;
export type InsertAdminRole = typeof adminRoles.$inferInsert;
export type AdminPermission = typeof adminPermissions.$inferSelect;
export type InsertAdminPermission = typeof adminPermissions.$inferInsert;
export type AdminRolePermission = typeof adminRolePermissions.$inferSelect;
export type InsertAdminRolePermission = typeof adminRolePermissions.$inferInsert;
export type AdminGroup = typeof adminGroups.$inferSelect;
export type InsertAdminGroup = typeof adminGroups.$inferInsert;
export type AdminGroupMembership = typeof adminGroupMemberships.$inferSelect;
export type InsertAdminGroupMembership = typeof adminGroupMemberships.$inferInsert;
export type AdminGroupPermission = typeof adminGroupPermissions.$inferSelect;
export type InsertAdminGroupPermission = typeof adminGroupPermissions.$inferInsert;
export type AdminUserOverride = typeof adminUserOverrides.$inferSelect;
export type InsertAdminUserOverride = typeof adminUserOverrides.$inferInsert;
export type AdminFeatureFlag = typeof adminFeatureFlags.$inferSelect;
export type InsertAdminFeatureFlag = typeof adminFeatureFlags.$inferInsert;
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLogs.$inferInsert;
export type AdminThemeSetting = typeof adminThemeSettings.$inferSelect;
export type InsertAdminThemeSetting = typeof adminThemeSettings.$inferInsert;
export type AdminMenu = typeof adminMenus.$inferSelect;
export type InsertAdminMenu = typeof adminMenus.$inferInsert;
export type AdminMenuItem = typeof adminMenuItems.$inferSelect;
export type InsertAdminMenuItem = typeof adminMenuItems.$inferInsert;
export type AdminUserRole = typeof adminUserRoles.$inferSelect;
export type InsertAdminUserRole = typeof adminUserRoles.$inferInsert;

/* ═══ Custom Pages — user-created dynamic pages ═══ */
export const customPages = mysqlTable("custom_pages", {
id: int().autoincrement().primaryKey().notNull(),
userId: int().notNull(),
workspace: varchar({ length: 20 }).notNull(),
pageType: varchar({ length: 20 }).notNull(),
title: varchar({ length: 255 }).notNull(),
description: text(),
icon: varchar({ length: 50 }).default("LayoutDashboard"),
sortOrder: int().default(0).notNull(),
config: json(),
dataSource: varchar({ length: 50 }).default("leaks"),
isDefault: tinyint().default(0),
shareToken: varchar({ length: 64 }),
createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("idx_custom_pages_share").on(table.shareToken),
	index("idx_custom_pages_user_ws").on(table.userId, table.workspace),
]);

export type CustomPage = typeof customPages.$inferSelect;
export type InsertCustomPage = typeof customPages.$inferInsert;

/* ═══ Shared Page Links ═══ */
export const sharedPageLinks = mysqlTable("shared_page_links", {
	id: int().autoincrement().primaryKey().notNull(),
	pageId: int().notNull(),
	shareToken: varchar({ length: 64 }).notNull(),
	createdBy: int().notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1).notNull(),
	viewCount: int().default(0).notNull(),
	lastViewedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("idx_shared_page_links_token").on(table.shareToken),
	index("idx_shared_page_links_page").on(table.pageId),
]);

export type SharedPageLink = typeof sharedPageLinks.$inferSelect;
export type InsertSharedPageLink = typeof sharedPageLinks.$inferInsert;

/* ═══ CMS — Import Jobs ═══ */
export const importJobs = mysqlTable("import_jobs", {
	id: int().autoincrement().primaryKey().notNull(),
	jobId: varchar({ length: 64 }).notNull(),
	fileName: varchar({ length: 500 }).notNull(),
	fileType: mysqlEnum('fileType', ['zip','json','xlsx','csv']).notNull(),
	fileSizeBytes: int().default(0).notNull(),
	status: mysqlEnum('status', ['pending','processing','completed','failed','cancelled']).default('pending').notNull(),
	totalRecords: int().default(0).notNull(),
	processedRecords: int().default(0).notNull(),
	successRecords: int().default(0).notNull(),
	failedRecords: int().default(0).notNull(),
	errorLog: json(),
	importedBy: int().notNull(),
	importedByName: varchar({ length: 200 }),
	startedAt: timestamp('startedAt', { mode: 'string' }),
	completedAt: timestamp('completedAt', { mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("import_jobs_jobId_unique").on(table.jobId),
]);

export type ImportJob = typeof importJobs.$inferSelect;
export type InsertImportJob = typeof importJobs.$inferInsert;

/* ═══ CMS — Export Jobs ═══ */
export const exportJobs = mysqlTable("export_jobs", {
	id: int().autoincrement().primaryKey().notNull(),
	jobId: varchar({ length: 64 }).notNull(),
	exportType: mysqlEnum('exportType', ['full_platform','section','page','single_record','custom_query']).notNull(),
	exportFormat: mysqlEnum('exportFormat', ['zip','json','xlsx','csv','pdf']).notNull(),
	scope: varchar({ length: 255 }),
	filters: json(),
	status: mysqlEnum('status', ['pending','processing','completed','failed']).default('pending').notNull(),
	totalRecords: int().default(0).notNull(),
	fileSizeBytes: int().default(0),
	fileUrl: text(),
	exportedBy: int().notNull(),
	exportedByName: varchar({ length: 200 }),
	startedAt: timestamp('startedAt', { mode: 'string' }),
	completedAt: timestamp('completedAt', { mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("export_jobs_jobId_unique").on(table.jobId),
]);

export type ExportJob = typeof exportJobs.$inferSelect;
export type InsertExportJob = typeof exportJobs.$inferInsert;

/* ═══ Control Panel — Page Registry ═══ */
export const pageRegistry = mysqlTable("page_registry", {
	id: int().autoincrement().primaryKey().notNull(),
	pageId: varchar({ length: 100 }).notNull(),
	path: varchar({ length: 500 }).notNull(),
	nameAr: varchar({ length: 200 }).notNull(),
	nameEn: varchar({ length: 200 }).notNull(),
	icon: varchar({ length: 100 }),
	category: mysqlEnum('category', ['main','monitoring','analysis','admin']).default('main').notNull(),
	sortOrder: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	features: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("page_registry_pageId_unique").on(table.pageId),
]);

export type PageRegistryEntry = typeof pageRegistry.$inferSelect;
export type InsertPageRegistryEntry = typeof pageRegistry.$inferInsert;

/* ═══ Control Panel — AI Personality Config ═══ */
export const aiPersonalityConfig = mysqlTable("ai_personality_config", {
	id: int().autoincrement().primaryKey().notNull(),
	configKey: varchar("apcKey", { length: 100 }).notNull(),
	configValue: text("apcValue").notNull(),
	configType: mysqlEnum("apcType", ["string", "number", "boolean", "json"]).default("string").notNull(),
	description: text("apcDescription"),
	updatedBy: int("apcUpdatedBy"),
	updatedAt: timestamp("apcUpdatedAt", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("ai_personality_config_key_unique").on(table.configKey),
]);

export type AiPersonalityConfigEntry = typeof aiPersonalityConfig.$inferSelect;
export type InsertAiPersonalityConfigEntry = typeof aiPersonalityConfig.$inferInsert;

/* ═══════════════════════════════════════════════════════════════ */
/* ═══ Prompt 5 — System Settings & Operations Center Tables ═══ */
/* ═══════════════════════════════════════════════════════════════ */

/* ═══ Platform Assets (logos, favicons, mascot) ═══ */
export const platformAssets = mysqlTable("platform_assets", {
	id: int().autoincrement().primaryKey().notNull(),
	assetKey: varchar("paKey", { length: 100 }).notNull(),
	assetUrl: text("paUrl").notNull(),
	assetType: mysqlEnum("paType", ["image", "svg", "icon"]).notNull(),
	width: int("paWidth"),
	height: int("paHeight"),
	fileSize: int("paFileSize"),
	updatedBy: int("paUpdatedBy"),
	updatedAt: timestamp("paUpdatedAt", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("platform_assets_key_unique").on(table.assetKey),
]);
export type PlatformAsset = typeof platformAssets.$inferSelect;
export type InsertPlatformAsset = typeof platformAssets.$inferInsert;

/* ═══ API Providers (LLM, SMS, Email, Storage) ═══ */
export const apiProviders = mysqlTable("api_providers", {
	id: int().autoincrement().primaryKey().notNull(),
	providerId: varchar("apProviderId", { length: 64 }).notNull(),
	name: varchar("apName", { length: 200 }).notNull(),
	type: mysqlEnum("apType", ["llm", "search", "sms", "email", "storage"]).notNull(),
	baseUrl: text("apBaseUrl"),
	keyEncrypted: text("apKeyEncrypted"),
	model: varchar("apModel", { length: 100 }),
	isActive: tinyint("apIsActive").default(1).notNull(),
	rateLimit: int("apRateLimit"),
	usedToday: int("apUsedToday").default(0),
	lastChecked: timestamp("apLastChecked", { mode: 'string' }),
	status: mysqlEnum("apStatus", ["active", "inactive", "error"]).default("active").notNull(),
	createdBy: int("apCreatedBy"),
	createdAt: timestamp("apCreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("apUpdatedAt", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("api_providers_providerId_unique").on(table.providerId),
]);
export type ApiProvider = typeof apiProviders.$inferSelect;
export type InsertApiProvider = typeof apiProviders.$inferInsert;

/* ═══ Templates (reports, notifications, exports) ═══ */
export const templates = mysqlTable("templates", {
	id: int().autoincrement().primaryKey().notNull(),
	templateId: varchar("tplId", { length: 64 }).notNull(),
	name: varchar("tplName", { length: 200 }).notNull(),
	nameAr: varchar("tplNameAr", { length: 200 }).notNull(),
	type: mysqlEnum("tplType", ["report", "notification", "export", "import"]).notNull(),
	format: mysqlEnum("tplFormat", ["pdf", "docx", "xlsx", "csv", "html", "email", "sms"]).notNull(),
	content: text("tplContent").notNull(),
	variables: json("tplVariables"),
	isDefault: tinyint("tplIsDefault").default(0).notNull(),
	isActive: tinyint("tplIsActive").default(1).notNull(),
	createdBy: int("tplCreatedBy"),
	createdAt: timestamp("tplCreatedAt", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("tplUpdatedAt", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("templates_templateId_unique").on(table.templateId),
]);
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

/* ═══ Notification Rules ═══ */
export const notificationRules = mysqlTable("notification_rules", {
	id: int().autoincrement().primaryKey().notNull(),
	ruleId: varchar("nrRuleId", { length: 64 }).notNull(),
	name: varchar("nrName", { length: 200 }).notNull(),
	nameAr: varchar("nrNameAr", { length: 200 }).notNull(),
	trigger: mysqlEnum("nrTrigger", [
		"new_leak", "critical_leak", "wide_impact_leak",
		"system_failure", "llm_failure", "db_failure",
		"weekly_report", "monthly_report",
		"user_login", "user_locked", "permission_change",
		"import_complete", "export_complete",
	]).notNull(),
	conditions: json("nrConditions"),
	channels: json("nrChannels").notNull(),
	recipients: json("nrRecipients").notNull(),
	templateId: varchar("nrTemplateId", { length: 64 }),
	isActive: tinyint("nrIsActive").default(1).notNull(),
	createdBy: int("nrCreatedBy"),
	createdAt: timestamp("nrCreatedAt", { mode: 'string' }).defaultNow().notNull(),
},
(table) => [
	index("notification_rules_ruleId_unique").on(table.ruleId),
]);
export type NotificationRule = typeof notificationRules.$inferSelect;
export type InsertNotificationRule = typeof notificationRules.$inferInsert;

/* ═══ Notification Log ═══ */
export const notificationLog = mysqlTable("notification_log", {
	id: int().autoincrement().primaryKey().notNull(),
	ruleId: varchar("nlRuleId", { length: 64 }),
	channel: mysqlEnum("nlChannel", ["internal", "email", "sms", "slack", "teams"]).notNull(),
	recipientId: int("nlRecipientId"),
	recipientEmail: varchar("nlRecipientEmail", { length: 320 }),
	subject: varchar("nlSubject", { length: 500 }),
	content: text("nlContent"),
	status: mysqlEnum("nlStatus", ["sent", "delivered", "failed", "bounced"]).notNull(),
	errorMessage: text("nlErrorMessage"),
	sentAt: timestamp("nlSentAt", { mode: 'string' }).defaultNow().notNull(),
});
export type NotificationLogEntry = typeof notificationLog.$inferSelect;
export type InsertNotificationLogEntry = typeof notificationLog.$inferInsert;

/* ═══ System Health Log ═══ */
export const systemHealthLog = mysqlTable("system_health_log", {
	id: int().autoincrement().primaryKey().notNull(),
	service: mysqlEnum("shService", ["database", "llm", "api", "railway"]).notNull(),
	status: mysqlEnum("shStatus", ["healthy", "degraded", "down", "recovered"]).notNull(),
	responseTime: int("shResponseTime"),
	errorMessage: text("shErrorMessage"),
	metadata: json("shMetadata"),
	checkedAt: timestamp("shCheckedAt", { mode: 'string' }).defaultNow().notNull(),
});
export type SystemHealthLogEntry = typeof systemHealthLog.$inferSelect;
export type InsertSystemHealthLogEntry = typeof systemHealthLog.$inferInsert;

/* ═══ Dashboard Layouts — already defined above (line ~750) ═══ */


/* ═══════════════════════════════════════════════════════════════
   RASID ULTIMATE UPGRADE — 12 New Tables
   ═══════════════════════════════════════════════════════════════ */

export const aiSessionMemory = mysqlTable("ai_session_memory", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int("user_id").notNull(),
	sessionKey: varchar("session_key", { length: 255 }).notNull(),
	memoryType: varchar("memory_type", { length: 50 }).notNull().default("context"),
	content: text("content").notNull(),
	importance: int("importance").notNull().default(5),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiToolUsage = mysqlTable("ai_tool_usage", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int("user_id").notNull(),
	toolName: varchar("tool_name", { length: 100 }).notNull(),
	executionTimeMs: int("execution_time_ms"),
	success: tinyint("success").notNull().default(1),
	errorMessage: text("error_message"),
	inputSummary: text("input_summary"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiRateLimitsConfig = mysqlTable("ai_rate_limits", {
	id: int().autoincrement().primaryKey().notNull(),
	toolName: varchar("tool_name", { length: 100 }).notNull(),
	maxCallsPerMinute: int("max_calls_per_minute").notNull().default(10),
	maxCallsPerHour: int("max_calls_per_hour").notNull().default(100),
	maxCallsPerDay: int("max_calls_per_day").notNull().default(1000),
	cooldownSeconds: int("cooldown_seconds").notNull().default(2),
	isEnabled: tinyint("is_enabled").notNull().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiConfirmationRequests = mysqlTable("ai_confirmation_requests", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int("user_id").notNull(),
	toolName: varchar("tool_name", { length: 100 }).notNull(),
	actionDescription: text("action_description").notNull(),
	params: text("params"),
	status: varchar("status", { length: 20 }).notNull().default("pending"),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	confirmedAt: timestamp("confirmed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const bulkImports = mysqlTable("bulk_imports", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int("user_id").notNull(),
	fileName: varchar("file_name", { length: 500 }).notNull(),
	fileType: varchar("file_type", { length: 20 }).notNull(),
	totalRecords: int("total_records").notNull().default(0),
	processedRecords: int("processed_records").notNull().default(0),
	failedRecords: int("failed_records").notNull().default(0),
	status: varchar("status", { length: 20 }).notNull().default("pending"),
	errorLog: text("error_log"),
	targetTable: varchar("target_table", { length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
});

export const guideProgressTable = mysqlTable("guide_progress", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int("user_id").notNull(),
	guideId: varchar("guide_id", { length: 100 }).notNull(),
	stepId: varchar("step_id", { length: 100 }).notNull(),
	completed: tinyint("completed").notNull().default(0),
	skipped: tinyint("skipped").notNull().default(0),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const autoLearningEntries = mysqlTable("auto_learning_entries", {
	id: int().autoincrement().primaryKey().notNull(),
	sourceType: varchar("source_type", { length: 50 }).notNull(),
	triggerPattern: text("trigger_pattern").notNull(),
	learnedResponse: text("learned_response").notNull(),
	confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull().default("0.50"),
	usageCount: int("usage_count").notNull().default(0),
	lastUsedAt: timestamp("last_used_at", { mode: 'string' }),
	isActive: tinyint("is_active").notNull().default(1),
	createdBy: int("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const seedDataLogs = mysqlTable("seed_data_logs", {
	id: int().autoincrement().primaryKey().notNull(),
	seedType: varchar("seed_type", { length: 100 }).notNull(),
	recordsCreated: int("records_created").notNull().default(0),
	status: varchar("status", { length: 20 }).notNull().default("completed"),
	executedBy: int("executed_by"),
	details: text("details"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiNavigationHistory = mysqlTable("ai_navigation_history", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int("user_id").notNull(),
	fromPage: varchar("from_page", { length: 255 }),
	toPage: varchar("to_page", { length: 255 }).notNull(),
	reason: text("reason"),
	triggeredBy: varchar("triggered_by", { length: 50 }).notNull().default("ai"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const patrioticPhrases = mysqlTable("patriotic_phrases", {
	id: int().autoincrement().primaryKey().notNull(),
	phrase: text("phrase").notNull(),
	category: varchar("category", { length: 50 }).notNull().default("general"),
	isActive: tinyint("is_active").notNull().default(1),
	displayOrder: int("display_order").notNull().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const aiKeywordTaskMap = mysqlTable("ai_keyword_task_map", {
	id: int().autoincrement().primaryKey().notNull(),
	keyword: varchar("keyword", { length: 255 }).notNull(),
	taskType: varchar("task_type", { length: 100 }).notNull(),
	targetAction: text("target_action").notNull(),
	priority: int("priority").notNull().default(5),
	isActive: tinyint("is_active").notNull().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const sseStreamSessions = mysqlTable("sse_stream_sessions", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int("user_id").notNull(),
	sessionToken: varchar("session_token", { length: 255 }).notNull(),
	status: varchar("status", { length: 20 }).notNull().default("active"),
	messageCount: int("message_count").notNull().default(0),
	totalTokens: int("total_tokens").notNull().default(0),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow().notNull(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
});

export const aiGuideStepsLegacy = mysqlTable("ai_guide_steps", {
	id: int().autoincrement().primaryKey().notNull(),
	stepOrder: int("step_order").notNull(),
	titleAr: varchar("title_ar", { length: 255 }).notNull(),
	titleEn: varchar("title_en", { length: 255 }).notNull(),
	descriptionAr: text("description_ar").notNull(),
	descriptionEn: text("description_en"),
	targetSelector: varchar("target_selector", { length: 255 }),
	targetPage: varchar("target_page", { length: 255 }),
	category: varchar("category", { length: 50 }).notNull().default("general"),
	isActive: tinyint("is_active").notNull().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});
export const aiAutoLearning = mysqlTable("ai_auto_learning", {
	id: int().autoincrement().primaryKey().notNull(),
	userId: int("user_id"),
	patternType: varchar("pattern_type", { length: 100 }).notNull(),
	inputPattern: text("input_pattern").notNull(),
	learnedResponse: text("learned_response").notNull(),
	confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull().default("0.50"),
	usageCount: int("usage_count").notNull().default(0),
	isApproved: tinyint("is_approved").notNull().default(0),
	source: varchar("source", { length: 50 }).notNull().default("auto"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});


// ═══════════════════════════════════════════════════════════════
// SMART MONITOR REQUIREMENTS — Domain Isolation & AI Infrastructure
// DB-01 to DB-17: Glossary, Page Descriptors, Guides, Task Memory,
// Training Center, Message Templates, System Events, Feedback
// ═══════════════════════════════════════════════════════════════

// DB-01, DB-02, GOV-01: Domain-isolated Glossary
export const aiGlossary = mysqlTable("ai_glossary", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	term: varchar({ length: 200 }).notNull(),
	termEn: varchar({ length: 200 }),
	synonyms: json().$type<string[]>(),
	definition: text().notNull(),
	definitionEn: text(),
	relatedPage: varchar({ length: 200 }),
	relatedEntity: varchar({ length: 200 }),
	exampleQuestions: json().$type<string[]>(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// DB-04: Page Descriptors per domain
export const aiPageDescriptors = mysqlTable("ai_page_descriptors", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	pageId: varchar({ length: 100 }).notNull(),
	route: varchar({ length: 300 }).notNull(),
	pageName: varchar({ length: 200 }).notNull(),
	pageNameEn: varchar({ length: 200 }),
	purpose: text().notNull(),
	mainElements: json().$type<string[]>(),
	commonTasks: json().$type<string[]>(),
	availableActions: json().$type<string[]>(),
	drillthroughLinks: json().$type<Array<{ label: string; route: string }>>(),
	suggestedQuestions: json().$type<Array<{ role: string; question: string }>>(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// DB-05: Guide Catalog
export const aiGuideCatalog = mysqlTable("ai_guide_catalog", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	title: varchar({ length: 300 }).notNull(),
	titleEn: varchar({ length: 300 }),
	purpose: text(),
	visibilityRoles: json().$type<string[]>(),
	isActive: tinyint().default(1).notNull(),
	sortOrder: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// DB-06: Guide Steps (new version with guideId and actionType)
export const aiGuideSteps = mysqlTable("ai_guide_steps_v2", {
	id: int().autoincrement().primaryKey().notNull(),
	guideId: int().notNull(),
	stepOrder: int().notNull(),
	route: varchar({ length: 300 }).notNull(),
	selector: varchar({ length: 500 }),
	stepText: text().notNull(),
	stepTextEn: text(),
	actionType: mysqlEnum(["click", "type", "select", "scroll", "wait", "observe"]).default("observe").notNull(),
	highlightType: mysqlEnum(["border", "overlay", "pulse", "arrow"]).default("border").notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// DB-07: Guide Sessions
export const aiGuideSessions = mysqlTable("ai_guide_sessions", {
	id: int().autoincrement().primaryKey().notNull(),
	guideId: int().notNull(),
	userId: int().notNull(),
	currentStep: int().default(0).notNull(),
	totalSteps: int().notNull(),
	status: mysqlEnum(["active", "completed", "abandoned"]).default("active").notNull(),
	startedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	completedAt: timestamp({ mode: 'string' }),
});

// DB-08: Task Memory per domain
export const aiTaskMemory = mysqlTable("ai_task_memory", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	userId: int().notNull(),
	conversationId: varchar({ length: 100 }),
	goal: text(),
	currentEntity: varchar({ length: 200 }),
	currentEntityId: varchar({ length: 100 }),
	activeFilters: json(),
	currentStep: varchar({ length: 200 }),
	lastActivity: timestamp({ mode: 'string' }).defaultNow().notNull(),
	expiresAt: timestamp({ mode: 'string' }),
});

// DB-09, DB-10: Enhanced Conversations with domain isolation
export const aiConversations = mysqlTable("ai_conversations_v2", {
	id: int().autoincrement().primaryKey().notNull(),
	conversationId: varchar({ length: 100 }).notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	userId: int().notNull(),
	title: varchar({ length: 500 }),
	tags: json().$type<string[]>(),
	contextPage: varchar({ length: 200 }),
	contextEntityId: varchar({ length: 100 }),
	summary: text(),
	messageCount: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// DB-11: Training Center — Documents
export const aiTrainingDocuments = mysqlTable("ai_training_documents", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	title: varchar({ length: 500 }).notNull(),
	titleEn: varchar({ length: 500 }),
	content: text().notNull(),
	category: varchar({ length: 100 }),
	isActive: tinyint().default(1).notNull(),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// DB-11: Training Center — Custom Action Triggers
export const aiActionTriggers = mysqlTable("ai_action_triggers", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	triggerPhrase: varchar({ length: 300 }).notNull(),
	actionType: varchar({ length: 100 }).notNull(),
	actionConfig: json(),
	priority: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// DB-12: AI Feedback per domain (new version with domain isolation)
export const aiFeedback = mysqlTable("ai_feedback_v2", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	conversationId: varchar({ length: 100 }),
	messageIndex: int(),
	toolName: varchar({ length: 100 }),
	rating: mysqlEnum(["helpful", "not_helpful"]).notNull(),
	reason: text(),
	userId: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// DB-13: Official Message Templates
export const aiMessageTemplates = mysqlTable("ai_message_templates", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	templateType: varchar({ length: 100 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	titleEn: varchar({ length: 500 }),
	content: text().notNull(),
	placeholders: json().$type<string[]>(),
	exampleInput: text(),
	exampleOutput: text(),
	version: int().default(1).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// DB-14: System Events for knowledge refresh
export const aiSystemEvents = mysqlTable("ai_system_events", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	eventType: mysqlEnum(["create", "update", "delete"]).notNull(),
	resourceType: varchar({ length: 100 }).notNull(),
	resourceId: varchar({ length: 100 }),
	resourceName: varchar({ length: 500 }),
	changes: json(),
	triggeredBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// DB-15: Knowledge Refresh Status
export const aiKnowledgeRefreshStatus = mysqlTable("ai_knowledge_refresh_status", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	sourceName: varchar({ length: 200 }).notNull(),
	sourceType: varchar({ length: 100 }).notNull(),
	status: mysqlEnum(["idle", "running", "completed", "error"]).default("idle").notNull(),
	lastRefreshedAt: timestamp({ mode: 'string' }),
	lastError: text(),
	itemCount: int().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// SEC-01, API-08: Action Runs — audit trail for confirmed actions
export const aiActionRuns = mysqlTable("ai_action_runs", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	conversationId: varchar({ length: 100 }),
	userId: int().notNull(),
	actionType: varchar({ length: 100 }).notNull(),
	actionDescription: text(),
	previewData: json(),
	status: mysqlEnum(["pending", "confirmed", "cancelled", "executed", "rolled_back", "failed"]).default("pending").notNull(),
	resultData: json(),
	confirmedAt: timestamp({ mode: 'string' }),
	executedAt: timestamp({ mode: 'string' }),
	rolledBackAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// SEC-04: Retention Policies — configurable retention for conversations/training/reports
export const aiRetentionPolicies = mysqlTable("ai_retention_policies", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	resourceType: mysqlEnum(["conversations", "training_documents", "feedback", "action_runs", "task_memory", "reports"]).notNull(),
	retentionDays: int().notNull().default(365),
	autoDeleteEnabled: boolean().default(false).notNull(),
	lastCleanupAt: timestamp({ mode: 'string' }),
	deletedCount: int().default(0),
	isActive: boolean().default(true).notNull(),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// API-11/12: RAG Index per domain — tracks domain-specific knowledge indexes
export const aiRagIndexes = mysqlTable("ai_rag_indexes", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	sourceName: varchar({ length: 200 }).notNull(),
	sourceType: mysqlEnum(["glossary", "page_descriptors", "training_documents", "knowledge_base", "guides"]).notNull(),
	documentCount: int().default(0),
	lastIndexedAt: timestamp({ mode: 'string' }),
	indexStatus: mysqlEnum(["idle", "indexing", "ready", "error"]).default("idle").notNull(),
	lastError: text(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiDomainConversations = mysqlTable("ai_domain_conversations", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	userId: int().notNull(),
	sessionId: varchar({ length: 100 }).notNull(),
	title: varchar({ length: 300 }),
	messageCount: int().default(0),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const aiDomainFeedback = mysqlTable("ai_domain_feedback", {
	id: int().autoincrement().primaryKey().notNull(),
	domain: mysqlEnum(["breaches"]).notNull(),
	userId: int().notNull(),
	messageId: int(),
	rating: mysqlEnum(["positive", "negative", "neutral"]).notNull(),
	comment: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// Type exports for new AI infrastructure tables
export type AiGlossary = typeof aiGlossary.$inferSelect;
export type InsertAiGlossary = typeof aiGlossary.$inferInsert;
export type AiPageDescriptor = typeof aiPageDescriptors.$inferSelect;
export type InsertAiPageDescriptor = typeof aiPageDescriptors.$inferInsert;
export type AiGuideCatalog = typeof aiGuideCatalog.$inferSelect;
export type InsertAiGuideCatalog = typeof aiGuideCatalog.$inferInsert;
export type AiGuideStep = typeof aiGuideSteps.$inferSelect;
export type InsertAiGuideStep = typeof aiGuideSteps.$inferInsert;
export type AiGuideSession = typeof aiGuideSessions.$inferSelect;
export type InsertAiGuideSession = typeof aiGuideSessions.$inferInsert;
export type AiTaskMemory = typeof aiTaskMemory.$inferSelect;
export type InsertAiTaskMemory = typeof aiTaskMemory.$inferInsert;
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;
export type AiTrainingDocument = typeof aiTrainingDocuments.$inferSelect;
export type InsertAiTrainingDocument = typeof aiTrainingDocuments.$inferInsert;
export type AiActionTrigger = typeof aiActionTriggers.$inferSelect;
export type InsertAiActionTrigger = typeof aiActionTriggers.$inferInsert;
export type AiFeedback = typeof aiFeedback.$inferSelect;
export type InsertAiFeedback = typeof aiFeedback.$inferInsert;
export type AiMessageTemplate = typeof aiMessageTemplates.$inferSelect;
export type InsertAiMessageTemplate = typeof aiMessageTemplates.$inferInsert;
export type AiSystemEvent = typeof aiSystemEvents.$inferSelect;
export type InsertAiSystemEvent = typeof aiSystemEvents.$inferInsert;
export type AiKnowledgeRefreshStatus = typeof aiKnowledgeRefreshStatus.$inferSelect;
export type InsertAiKnowledgeRefreshStatus = typeof aiKnowledgeRefreshStatus.$inferInsert;
export type AiActionRun = typeof aiActionRuns.$inferSelect;
export type InsertAiActionRun = typeof aiActionRuns.$inferInsert;
export type AiRetentionPolicy = typeof aiRetentionPolicies.$inferSelect;
export type InsertAiRetentionPolicy = typeof aiRetentionPolicies.$inferInsert;
export type AiRagIndex = typeof aiRagIndexes.$inferSelect;
export type InsertAiRagIndex = typeof aiRagIndexes.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// Contracts
// ═══════════════════════════════════════════════════════════════
export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  contractNumber: varchar("contractNumber", { length: 50 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  vendor: varchar("vendor", { length: 300 }),
  vendorAr: varchar("vendorAr", { length: 300 }),
  type: mysqlEnum("type", ["service", "license", "maintenance", "consulting", "development", "other"]).default("service"),
  status: mysqlEnum("status", ["draft", "active", "expired", "terminated", "pending_renewal"]).default("draft"),
  startDate: date("startDate"),
  endDate: date("endDate"),
  value: decimal("value", { precision: 15, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  description: text("description"),
  attachmentUrl: varchar("attachmentUrl", { length: 1000 }),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// Teams
// ═══════════════════════════════════════════════════════════════
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  nameAr: varchar("nameAr", { length: 200 }),
  description: text("description"),
  leaderId: int("leaderId"),
  leaderName: varchar("leaderName", { length: 200 }),
  department: varchar("department", { length: 200 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  memberCount: int("memberCount").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["leader", "member", "viewer"]).default("member"),
  joinedAt: timestamp("joinedAt").defaultNow(),
});
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// Privacy Workspace — DSAR Requests
// ═══════════════════════════════════════════════════════════════
export const dsarRequests = mysqlTable("dsar_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestNumber: varchar("requestNumber", { length: 50 }).notNull(),
  requesterName: varchar("requesterName", { length: 255 }).notNull(),
  requesterEmail: varchar("requesterEmail", { length: 255 }),
  requesterPhone: varchar("requesterPhone", { length: 50 }),
  requestType: mysqlEnum("requestType", ["access", "correction", "deletion", "portability", "objection", "restriction"]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "rejected", "overdue"]).default("pending").notNull(),
  description: text("description"),
  entityName: varchar("entityName", { length: 255 }),
  entityDomain: varchar("entityDomain", { length: 500 }),
  deadline: timestamp("deadline"),
  completedAt: timestamp("completedAt"),
  assignedTo: int("assignedTo"),
  notes: text("notes"),
  attachments: json("attachments"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
export type DsarRequest = typeof dsarRequests.$inferSelect;
export type InsertDsarRequest = typeof dsarRequests.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// Privacy Workspace — Consent Records
// ═══════════════════════════════════════════════════════════════
export const consentRecords = mysqlTable("consent_records", {
  id: int("id").autoincrement().primaryKey(),
  siteDomain: varchar("siteDomain", { length: 500 }).notNull(),
  siteName: varchar("siteName", { length: 255 }),
  consentType: mysqlEnum("consentType", ["cookie", "marketing", "analytics", "third_party", "data_processing", "other"]).notNull(),
  status: mysqlEnum("status", ["active", "withdrawn", "expired", "not_implemented"]).default("not_implemented").notNull(),
  consentMechanism: varchar("consentMechanism", { length: 255 }),
  consentText: text("consentText"),
  lastVerified: timestamp("lastVerified"),
  expiresAt: timestamp("expiresAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
export type ConsentRecord = typeof consentRecords.$inferSelect;
export type InsertConsentRecord = typeof consentRecords.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// Privacy Workspace — Processing Records (ROPA)
// ═══════════════════════════════════════════════════════════════
export const processingRecords = mysqlTable("processing_records", {
  id: int("id").autoincrement().primaryKey(),
  activityName: varchar("activityName", { length: 500 }).notNull(),
  activityNameAr: varchar("activityNameAr", { length: 500 }),
  purpose: text("purpose").notNull(),
  purposeAr: text("purposeAr"),
  dataCategories: json("dataCategories"),
  dataSubjectCategories: json("dataSubjectCategories"),
  lawfulBasis: mysqlEnum("lawfulBasis", ["consent", "contract", "legal_obligation", "vital_interest", "public_interest", "legitimate_interest"]).notNull(),
  retentionPeriod: varchar("retentionPeriod", { length: 255 }),
  recipientCategories: json("recipientCategories"),
  crossBorderTransfer: tinyint("crossBorderTransfer").default(0),
  transferSafeguards: text("transferSafeguards"),
  securityMeasures: text("securityMeasures"),
  entityName: varchar("entityName", { length: 255 }),
  controllerName: varchar("controllerName", { length: 255 }),
  dpoContact: varchar("dpoContact", { length: 255 }),
  status: mysqlEnum("status", ["active", "under_review", "archived"]).default("active").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
export type ProcessingRecord = typeof processingRecords.$inferSelect;
export type InsertProcessingRecord = typeof processingRecords.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// Privacy Workspace — DPIA (Data Protection Impact Assessment)
// ═══════════════════════════════════════════════════════════════
export const dpiaAssessments = mysqlTable("dpia_assessments", {
  id: int("id").autoincrement().primaryKey(),
  projectName: varchar("projectName", { length: 500 }).notNull(),
  projectNameAr: varchar("projectNameAr", { length: 500 }),
  description: text("description"),
  entityName: varchar("entityName", { length: 255 }),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "needs_review"]).default("not_started").notNull(),
  assessorName: varchar("assessorName", { length: 255 }),
  assessorId: int("assessorId"),
  dataTypes: json("dataTypes"),
  risks: json("risks"),
  mitigations: json("mitigations"),
  recommendations: text("recommendations"),
  dpoApproval: tinyint("dpoApproval").default(0),
  dpoApprovalDate: timestamp("dpoApprovalDate"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
export type DpiaAssessment = typeof dpiaAssessments.$inferSelect;
export type InsertDpiaAssessment = typeof dpiaAssessments.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// Privacy Workspace — Privacy Assessments
// ═══════════════════════════════════════════════════════════════
export const privacyAssessments = mysqlTable("privacy_assessments", {
  id: int("id").autoincrement().primaryKey(),
  entityName: varchar("entityName", { length: 255 }).notNull(),
  entityDomain: varchar("entityDomain", { length: 500 }),
  assessmentType: mysqlEnum("assessmentType", ["full", "quick", "clause_specific", "follow_up"]).default("full").notNull(),
  overallScore: int("overallScore").default(0),
  clause1Score: int("clause1Score").default(0),
  clause2Score: int("clause2Score").default(0),
  clause3Score: int("clause3Score").default(0),
  clause4Score: int("clause4Score").default(0),
  clause5Score: int("clause5Score").default(0),
  clause6Score: int("clause6Score").default(0),
  clause7Score: int("clause7Score").default(0),
  clause8Score: int("clause8Score").default(0),
  findings: json("findings"),
  recommendations: json("recommendations"),
  status: mysqlEnum("status", ["draft", "in_progress", "completed", "overdue"]).default("draft").notNull(),
  assessorId: int("assessorId"),
  assessorName: varchar("assessorName", { length: 255 }),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
export type PrivacyAssessment = typeof privacyAssessments.$inferSelect;
export type InsertPrivacyAssessment = typeof privacyAssessments.$inferInsert;

// ═══════════════════════════════════════════════════════════════
// Privacy Workspace — Mobile App Privacy Analysis
// ═══════════════════════════════════════════════════════════════
export const mobileAppPrivacy = mysqlTable("mobile_app_privacy", {
  id: int("id").autoincrement().primaryKey(),
  appName: varchar("appName", { length: 500 }).notNull(),
  appNameAr: varchar("appNameAr", { length: 500 }),
  packageId: varchar("packageId", { length: 500 }),
  platform: mysqlEnum("platform", ["ios", "android", "both"]).notNull(),
  developer: varchar("developer", { length: 255 }),
  category: varchar("category", { length: 100 }),
  permissions: json("permissions"),
  privacyPolicyUrl: text("privacyPolicyUrl"),
  complianceScore: int("complianceScore").default(0),
  hasPrivacyPolicy: tinyint("hasPrivacyPolicy").default(0),
  hasConsentMechanism: tinyint("hasConsentMechanism").default(0),
  dataCollected: json("dataCollected"),
  thirdPartySharing: json("thirdPartySharing"),
  findings: json("findings"),
  lastScanDate: timestamp("lastScanDate"),
  status: mysqlEnum("status", ["compliant", "partial", "non_compliant", "pending"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
export type MobileAppPrivacy = typeof mobileAppPrivacy.$inferSelect;
export type InsertMobileAppPrivacy = typeof mobileAppPrivacy.$inferInsert;

```

---

## `drizzle/schema_custom_pages_ext.ts`

```typescript
/**
 * Extended schema for custom pages - shared_page_links table
 * Added columns to custom_pages: shareToken, description, dataSource
 */
import { mysqlTable, int, varchar, text, tinyint, timestamp, index } from "drizzle-orm/mysql-core";

export const sharedPageLinks = mysqlTable("shared_page_links", {
  id: int().autoincrement().primaryKey().notNull(),
  pageId: int().notNull(),
  shareToken: varchar({ length: 64 }).notNull(),
  createdBy: int().notNull(),
  expiresAt: timestamp({ mode: 'string' }),
  isActive: tinyint().default(1).notNull(),
  viewCount: int().default(0).notNull(),
  lastViewedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_share_token").on(table.shareToken),
  index("idx_share_page").on(table.pageId),
]);

export type SharedPageLink = typeof sharedPageLinks.$inferSelect;
export type InsertSharedPageLink = typeof sharedPageLinks.$inferInsert;

```

---

