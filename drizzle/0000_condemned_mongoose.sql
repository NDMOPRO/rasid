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