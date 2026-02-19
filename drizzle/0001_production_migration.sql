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
