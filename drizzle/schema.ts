import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, text, timestamp, mysqlEnum, json, float, date, index, decimal, tinyint, boolean, bigint, double } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const activityLogs = mysqlTable("activity_logs", {
	id: int().autoincrement().notNull(),
	userId: int(),
	username: varchar({ length: 64 }),
	action: varchar({ length: 100 }).notNull(),
	details: text(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const aiChatMessages = mysqlTable("ai_chat_messages", {
	id: int().autoincrement().notNull(),
	sessionId: varchar({ length: 64 }).notNull(),
	messageId: varchar({ length: 64 }).notNull(),
	msgRole: mysqlEnum(['user','assistant','system']).notNull(),
	content: text().notNull(),
	sources: json(),
	tokensUsed: int(),
	durationMs: int(),
	model: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const aiChatSessions = mysqlTable("ai_chat_sessions", {
	id: int().autoincrement().notNull(),
	sessionId: varchar({ length: 64 }).notNull(),
	userId: int().notNull(),
	userName: varchar({ length: 255 }),
	title: varchar({ length: 500 }),
	messageCount: int().default(0),
	totalTokens: int().default(0),
	totalDurationMs: int().default(0),
	sessionStatus: mysqlEnum(['active','archived','exported']).default('active').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const aiCustomCommands = mysqlTable("ai_custom_commands", {
	id: int().autoincrement().notNull(),
	command: varchar({ length: 100 }).notNull(),
	description: text(),
	handler: varchar({ length: 255 }).notNull(),
	parameters: json(),
	exampleUsage: text(),
	isEnabled: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const aiFeedback = mysqlTable("ai_feedback", {
	id: int().autoincrement().notNull(),
	chatHistoryId: int().notNull(),
	userId: int().notNull(),
	rating: mysqlEnum(['good','bad']).notNull(),
	category: mysqlEnum(['accuracy','relevance','completeness','tone','other']),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const aiRatings = mysqlTable("ai_ratings", {
	id: int().autoincrement().notNull(),
	messageId: varchar({ length: 64 }).notNull(),
	sessionId: varchar({ length: 64 }).notNull(),
	userId: int().notNull(),
	rating: int().notNull(),
	feedback: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const aiScenarios = mysqlTable("ai_scenarios", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	scenarioType: mysqlEnum(['greeting','farewell','help','error','report','custom_command','persona','escalation','vip_response']).notNull(),
	triggerPattern: text(),
	systemPrompt: text(),
	responseTemplate: text(),
	conditions: json(),
	priority: int().default(0),
	isEnabled: tinyint().default(1).notNull(),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const aiSearchLog = mysqlTable("ai_search_log", {
	id: int().autoincrement().notNull(),
	query: text().notNull(),
	resultsCount: int().default(0),
	topScore: float(),
	wasHelpful: tinyint(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const aiTrainingLogs = mysqlTable("ai_training_logs", {
	id: int().autoincrement().notNull(),
	action: mysqlEnum(['knowledge_added','knowledge_updated','knowledge_deleted','document_uploaded','document_processed','scenario_added','scenario_updated','action_added','action_updated','feedback_received']).notNull(),
	entityType: varchar({ length: 50 }).notNull(),
	entityId: int(),
	details: text(),
	performedBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const aiUserSessions = mysqlTable("ai_user_sessions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	sessionDate: date({ mode: 'string' }).notNull(),
	visitCount: int().default(1).notNull(),
	lastGreetingId: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const apiKeys = mysqlTable("api_keys", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	keyHash: varchar({ length: 255 }).notNull(),
	keyPrefix: varchar({ length: 16 }).notNull(),
	name: varchar({ length: 100 }).notNull(),
	permissions: json(),
	lastUsedAt: timestamp({ mode: 'string' }),
	expiresAt: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1),
	requestCount: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const appScans = mysqlTable("app_scans", {
	id: int().autoincrement().notNull(),
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
	scanDate: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const batchScanJobs = mysqlTable("batch_scan_jobs", {
	id: int().autoincrement().notNull(),
	jobName: text(),
	totalUrls: int().default(0),
	completedUrls: int().default(0),
	failedUrls: int().default(0),
	status: mysqlEnum(['pending','running','completed','failed','cancelled']).default('pending'),
	results: json(),
	createdBy: int(),
	startedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const bulkAnalysisJobs = mysqlTable("bulk_analysis_jobs", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const bulkAnalysisResults = mysqlTable("bulk_analysis_results", {
	id: int().autoincrement().notNull(),
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
	analyzedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const caseComments = mysqlTable("case_comments", {
	id: int().autoincrement().notNull(),
	caseId: int().notNull(),
	userId: int().notNull(),
	content: text().notNull(),
	parentId: int(),
	isInternal: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const caseHistory = mysqlTable("case_history", {
	id: int().autoincrement().notNull(),
	caseId: int().notNull(),
	fromStage: varchar({ length: 50 }),
	toStage: varchar({ length: 50 }).notNull(),
	action: varchar({ length: 100 }).notNull(),
	comment: text(),
	attachments: json(),
	performedBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const cases = mysqlTable("cases", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("cases_caseNumber_unique").on(table.caseNumber),
]);

export const changeDetectionLogs = mysqlTable("change_detection_logs", {
	id: int().autoincrement().notNull(),
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
	detectedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const chatHistory = mysqlTable("chat_history", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	message: text().notNull(),
	response: text().notNull(),
	rating: mysqlEnum(['good','bad']),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const complianceAlerts = mysqlTable("compliance_alerts", {
	id: int().autoincrement().notNull(),
	siteId: int().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	previousStatus: varchar({ length: 50 }),
	newStatus: varchar({ length: 50 }).notNull(),
	previousScore: float(),
	newScore: float(),
	scanId: int(),
	isRead: tinyint().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const complianceChangeNotifications = mysqlTable("compliance_change_notifications", {
	id: int().autoincrement().notNull(),
	siteId: int().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	previousStatus: varchar({ length: 50 }),
	newStatus: varchar({ length: 50 }).notNull(),
	previousScore: int(),
	newScore: int().notNull(),
	emailSent: tinyint().default(0).notNull(),
	emailSentTo: text(),
	emailSentAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const contentBlocks = mysqlTable("content_blocks", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("content_blocks_blockKey_unique").on(table.blockKey),
]);

export const customActions = mysqlTable("custom_actions", {
	id: int().autoincrement().notNull(),
	triggerPhrase: varchar({ length: 255 }).notNull(),
	aliases: json(),
	actionType: mysqlEnum(['call_function','custom_code','redirect','api_call']).notNull(),
	actionTarget: text(),
	description: text(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const dashboardSnapshots = mysqlTable("dashboard_snapshots", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const dataTransferLogs = mysqlTable("data_transfer_logs", {
	id: int().autoincrement().notNull(),
	transferType: mysqlEnum(['export','import']).notNull(),
	dataSection: varchar({ length: 100 }).notNull(),
	fileName: varchar({ length: 255 }),
	fileUrl: text(),
	recordCount: int().default(0),
	status: mysqlEnum(['pending','processing','completed','failed']).default('pending'),
	errorMessage: text(),
	userId: int().notNull(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp({ mode: 'string' }),
});

export const deepScanQueue = mysqlTable("deep_scan_queue", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const documents = mysqlTable("documents", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("documents_documentId_unique").on(table.documentId),
	index("documents_verificationCode_unique").on(table.verificationCode),
]);

export const emailNotificationPrefs = mysqlTable("email_notification_prefs", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const escalationLogs = mysqlTable("escalation_logs", {
	id: int().autoincrement().notNull(),
	caseId: int().notNull(),
	ruleId: int().notNull(),
	previousStage: varchar({ length: 50 }).notNull(),
	newStage: varchar({ length: 50 }).notNull(),
	previousPriority: varchar({ length: 20 }),
	newPriority: varchar({ length: 20 }),
	hoursOverdue: float(),
	notified: tinyint().default(0),
	escalatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const escalationRules = mysqlTable("escalation_rules", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const executiveAlerts = mysqlTable("executive_alerts", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const executiveReports = mysqlTable("executive_reports", {
	id: int().autoincrement().notNull(),
	reportType: mysqlEnum(['daily','weekly','monthly']).default('weekly'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	reportDate: date({ mode: 'string' }).notNull(),
	contentJson: json(),
	pdfUrl: text(),
	isSent: tinyint().default(0),
	sentAt: timestamp({ mode: 'string' }),
	recipients: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const knowledgeBase = mysqlTable("knowledge_base", {
	id: int().autoincrement().notNull(),
	type: mysqlEnum(['document','qa','feedback','article','faq','regulation','term','guide','document_chunk']).notNull(),
	question: text(),
	answer: text(),
	content: text(),
	source: varchar({ length: 1000 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
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

export const kpiTargets = mysqlTable("kpi_targets", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const letters = mysqlTable("letters", {
	id: int().autoincrement().notNull(),
	siteId: int().notNull(),
	scanId: int(),
	recipientEmail: varchar({ length: 320 }),
	subject: text(),
	body: text(),
	status: mysqlEnum(['draft','sent','delivered','read','responded','escalated']).default('draft'),
	escalationLevel: int().default(0),
	sentAt: timestamp({ mode: 'string' }),
	respondedAt: timestamp({ mode: 'string' }),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	templateId: int(),
	deadline: timestamp({ mode: 'string' }),
	reminderSentAt: timestamp({ mode: 'string' }),
	notes: text(),
});

export const messageTemplates = mysqlTable("message_templates", {
	id: int().autoincrement().notNull(),
	templateKey: varchar({ length: 100 }).notNull(),
	nameAr: text().notNull(),
	nameEn: varchar({ length: 255 }),
	subject: text().notNull(),
	body: text().notNull(),
	variables: json(),
	category: varchar({ length: 50 }),
	isActive: tinyint().default(1),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("message_templates_templateKey_unique").on(table.templateKey),
]);

export const mobileApps = mysqlTable("mobile_apps", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: int(),
	title: text(),
	message: text(),
	type: mysqlEnum(['info','warning','success','error']).default('info'),
	isRead: tinyint().default(0),
	link: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const pageConfigs = mysqlTable("page_configs", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("page_configs_pageKey_unique").on(table.pageKey),
]);

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	used: tinyint().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("password_reset_tokens_token_unique").on(table.token),
]);

export const pdfReportHistory = mysqlTable("pdf_report_history", {
	id: int().autoincrement().notNull(),
	reportType: mysqlEnum(['compliance_summary','sector_comparison','trend_analysis','full_report','monthly_comparison']).default('compliance_summary'),
	title: varchar({ length: 255 }).notNull(),
	pdfUrl: text(),
	fileSize: int(),
	generatedBy: int(),
	scheduledReportId: int(),
	recipientsSent: json(),
	isAutoGenerated: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const personalityScenarios = mysqlTable("personality_scenarios", {
	id: int().autoincrement().notNull(),
	type: mysqlEnum(['welcome_first','welcome_return','leader_respect','farewell','encouragement','occasion']).notNull(),
	triggerKeyword: varchar({ length: 100 }),
	textAr: text().notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const platformAnalytics = mysqlTable("platform_analytics", {
	id: int().autoincrement().notNull(),
	eventType: mysqlEnum(['page_view','scan','report','login','export','search','api_call']).notNull(),
	userId: int(),
	page: varchar({ length: 255 }),
	metadata: json(),
	sessionId: varchar({ length: 100 }),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const platformSettings = mysqlTable("platform_settings", {
	id: int().autoincrement().notNull(),
	settingKey: varchar({ length: 150 }).notNull(),
	settingValue: text(),
	settingType: mysqlEnum(['string','number','boolean','json','image','color']).default('string'),
	category: mysqlEnum(['branding','theme','typography','layout','pages','content','login_page','sidebar','header','stats_cards','tables','forms','dialogs','reports','letters','scans','ai_assistant','error_pages','email_templates','export','in_app_notifications','executive_dashboard','advanced','members','data_transfer','seo','dashboard','notifications','security']).default('branding'),
	label: text(),
	labelEn: text(),
	description: text(),
	isEditable: tinyint().default(1),
	sortOrder: int().default(0),
	updatedBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("platform_settings_settingKey_unique").on(table.settingKey),
]);

export const reportAudit = mysqlTable("report_audit", {
	id: int().autoincrement().notNull(),
	reportId: varchar({ length: 64 }),
	documentId: varchar({ length: 64 }),
	reportType: varchar({ length: 100 }),
	generatedBy: int(),
	generatedByName: varchar({ length: 200 }),
	complianceAcknowledged: tinyint().default(0).notNull(),
	acknowledgedAt: timestamp({ mode: 'string' }),
	filters: json(),
	metadata: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const reportExecutions = mysqlTable("report_executions", {
	id: int().autoincrement().notNull(),
	reportId: int().notNull(),
	status: mysqlEnum(['running','completed','failed']).default('running'),
	recipientCount: int().default(0),
	summary: text(),
	startedAt: timestamp({ mode: 'string' }).notNull(),
	completedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const savedFilters = mysqlTable("saved_filters", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	filters: json().notNull(),
	isDefault: tinyint().default(0),
	isShared: tinyint().default(0),
	usageCount: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const scanSchedules = mysqlTable("scan_schedules", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const scans = mysqlTable("scans", {
	id: int().autoincrement().notNull(),
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
	scanDate: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
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
	id: int().autoincrement().notNull(),
	scheduleId: int().notNull(),
	startedAt: timestamp({ mode: 'string' }).notNull(),
	completedAt: timestamp({ mode: 'string' }),
	totalSites: int().default(0),
	completedSites: int().default(0),
	failedSites: int().default(0),
	status: mysqlEnum(['running','completed','failed']).default('running'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const scheduledReports = mysqlTable("scheduled_reports", {
	id: int().autoincrement().notNull(),
	name: text().notNull(),
	description: text(),
	reportType: mysqlEnum(['compliance_summary','sector_comparison','trend_analysis','full_report','monthly_comparison']).default('compliance_summary'),
	frequency: mysqlEnum(['daily','weekly','monthly']).notNull(),
	dayOfWeek: int(),
	dayOfMonth: int(),
	hour: int().default(8),
	recipients: json(),
	filters: json(),
	includeCharts: tinyint().default(1),
	isActive: tinyint().default(1),
	lastSentAt: timestamp({ mode: 'string' }),
	nextSendAt: timestamp({ mode: 'string' }),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const siteWatchers = mysqlTable("site_watchers", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	siteId: int().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const sites = mysqlTable("sites", {
	id: int().autoincrement().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	siteName: text(),
	sectorType: mysqlEnum(['public','private']).default('private'),
	classification: varchar({ length: 100 }),
	privacyUrl: text(),
	privacyMethod: varchar({ length: 100 }),
	contactUrl: text(),
	emails: text(),
	siteStatus: mysqlEnum(['active','unreachable']).default('active'),
	screenshotUrl: text(),
	privacyTextUrl: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	siteNameAr: text(),
	siteNameEn: text(),
	siteTitle: text(),
	siteDescription: text(),
	phones: text(),
	workingUrl: text(),
	finalUrl: text(),
	httpsWww: varchar({ length: 50 }),
	httpsNoWww: varchar({ length: 50 }),
	httpWww: varchar({ length: 50 }),
	httpNoWww: varchar({ length: 50 }),
	mxRecords: text(),
	cms: varchar({ length: 100 }),
	sslStatus: varchar({ length: 50 }),
},
(table) => [
	index("sites_domain_unique").on(table.domain),
]);

export const smartAlerts = mysqlTable("smart_alerts", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const systemSettings = mysqlTable("system_settings", {
	id: int().autoincrement().notNull(),
	settingKey: varchar({ length: 100 }).notNull(),
	settingValue: text(),
	settingType: mysqlEnum(['string','number','boolean','json']).default('string'),
	category: varchar({ length: 50 }).default('general'),
	label: text(),
	description: text(),
	isEditable: tinyint().default(1),
	updatedBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("system_settings_settingKey_unique").on(table.settingKey),
]);

export const themeSettings = mysqlTable("theme_settings", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("theme_settings_themeKey_unique").on(table.themeKey),
]);

export const trainingDocuments = mysqlTable("training_documents", {
	id: int().autoincrement().notNull(),
	fileName: varchar({ length: 255 }).notNull(),
	fileUrl: text().notNull(),
	fileSize: int(),
	mimeType: varchar({ length: 100 }),
	status: mysqlEnum(['pending','processing','completed','failed']).default('pending').notNull(),
	extractedContent: text(),
	chunksCount: int().default(0),
	uploadedBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const userDashboardWidgets = mysqlTable("user_dashboard_widgets", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	widgetType: varchar({ length: 50 }).notNull(),
	title: text(),
	position: int().default(0).notNull(),
	gridWidth: int().default(1).notNull(),
	isVisible: tinyint().default(1).notNull(),
	config: json(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const userSessions = mysqlTable("user_sessions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	sessionToken: varchar({ length: 512 }).notNull(),
	deviceInfo: varchar({ length: 255 }),
	ipAddress: varchar({ length: 45 }),
	isActive: tinyint().default(1).notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	lastActivity: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
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
	index("users_username_unique").on(table.username),
]);

export const visualAlerts = mysqlTable("visual_alerts", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const settingsAuditLog = mysqlTable("settings_audit_log", {
	id: int().autoincrement().notNull(),
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
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});


// ─── Presentation Builder ─────────────────────────────────────
export const presentationTemplates = mysqlTable("presentation_templates", {
	id: int().autoincrement().notNull().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	nameEn: varchar({ length: 255 }),
	description: text(),
	category: mysqlEnum(['business_plan', 'report', 'sales_pitch', 'compliance', 'executive', 'custom']).default('custom').notNull(),
	thumbnail: text(),
	slides: json().notNull(), // JSON array of slide objects
	isBuiltIn: tinyint().default(0).notNull(),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const presentations = mysqlTable("presentations", {
	id: int().autoincrement().notNull().primaryKey(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	templateId: int(),
	slides: json().notNull(), // JSON array of slide objects with content
	userId: int().notNull(),
	isPublic: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});


// ========== Platform 2 Unique Tables ==========

export const leaks = mysqlTable("leaks", {
  id: int("id").autoincrement().primaryKey(),
  leakId: varchar("leakId", { length: 32 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }).notNull(),
  source: mysqlEnum("source", ["telegram", "darkweb", "paste"]).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
  sector: varchar("sector", { length: 100 }).notNull(),
  sectorAr: varchar("sectorAr", { length: 100 }).notNull(),
  piiTypes: json("piiTypes").$type<string[]>().notNull(),
  recordCount: int("recordCount").notNull().default(0),
  status: mysqlEnum("status", ["new", "analyzing", "documented", "reported"])
    .default("new")
    .notNull(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  // AI Enrichment fields
  aiSeverity: mysqlEnum("aiSeverity", ["critical", "high", "medium", "low"]),
  aiSummary: text("aiSummary"),
  aiSummaryAr: text("aiSummaryAr"),
  aiRecommendations: json("aiRecommendations").$type<string[]>(),
  aiRecommendationsAr: json("aiRecommendationsAr").$type<string[]>(),
  aiConfidence: int("aiConfidence"),
  enrichedAt: timestamp("enrichedAt"),
  // Sample leaked data (fake but realistic PII examples)
  sampleData: json("sampleData").$type<Array<Record<string, string>>>(),
  // Source URL where the leak was found
  sourceUrl: text("sourceUrl"),
  // Source platform name
  sourcePlatform: varchar("sourcePlatform", { length: 255 }),
  // Screenshot URLs showing the leak evidence
  screenshotUrls: json("screenshotUrls").$type<string[]>(),
  // Seller/threat actor name
  threatActor: varchar("threatActor", { length: 255 }),
  // Price if sold on dark web
  price: varchar("leakPrice", { length: 100 }),
  // Breach method
  breachMethod: varchar("breachMethod", { length: 255 }),
  breachMethodAr: varchar("breachMethodAr", { length: 255 }),
  // Geographic data for threat map
  region: varchar("region", { length: 100 }),
  regionAr: varchar("regionAr", { length: 100 }),
  city: varchar("city", { length: 100 }),
  cityAr: varchar("cityAr", { length: 100 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const channels = mysqlTable("channels", {
  id: int("id").autoincrement().primaryKey(),
  channelId: varchar("channelId", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ["telegram", "darkweb", "paste"]).notNull(),
  subscribers: int("subscribers").default(0),
  status: mysqlEnum("status", ["active", "paused", "flagged"])
    .default("active")
    .notNull(),
  lastActivity: timestamp("lastActivity"),
  leaksDetected: int("leaksDetected").default(0),
  riskLevel: mysqlEnum("riskLevel", ["high", "medium", "low"])
    .default("medium")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const piiScans = mysqlTable("pii_scans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  inputText: text("inputText").notNull(),
  results: json("results")
    .$type<
      Array<{
        type: string;
        typeAr: string;
        value: string;
        line: number;
      }>
    >()
    .notNull(),
  totalMatches: int("totalMatches").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  type: mysqlEnum("type", ["monthly", "quarterly", "special"]).notNull(),
  status: mysqlEnum("reportStatus", ["draft", "published"])
    .default("draft")
    .notNull(),
  pageCount: int("pageCount").default(0),
  generatedBy: int("generatedBy"),
  fileUrl: text("fileUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const darkWebListings = mysqlTable("dark_web_listings", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  severity: mysqlEnum("listingSeverity", ["critical", "high", "medium", "low"]).notNull(),
  sourceChannelId: int("sourceChannelId"),
  sourceName: varchar("sourceName", { length: 255 }),
  price: varchar("price", { length: 50 }),
  recordCount: int("recordCount").default(0),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pasteEntries = mysqlTable("paste_entries", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  sourceName: varchar("sourceName", { length: 255 }).notNull(),
  fileSize: varchar("fileSize", { length: 50 }),
  piiTypes: json("pastePiiTypes").$type<string[]>(),
  preview: text("preview"),
  status: mysqlEnum("pasteStatus", ["flagged", "analyzing", "documented", "reported"])
    .default("flagged")
    .notNull(),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(),
  category: mysqlEnum("auditCategory", ["auth", "leak", "export", "pii", "user", "report", "system", "monitoring", "enrichment", "alert", "retention", "api", "user_management"])
    .default("system")
    .notNull(),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const monitoringJobs = mysqlTable("monitoring_jobs", {
  id: int("id").autoincrement().primaryKey(),
  jobId: varchar("jobId", { length: 64 }).notNull().unique(),
  name: varchar("jobName", { length: 255 }).notNull(),
  nameAr: varchar("jobNameAr", { length: 255 }).notNull(),
  platform: mysqlEnum("jobPlatform", ["telegram", "darkweb", "paste", "all"]).notNull(),
  cronExpression: varchar("cronExpression", { length: 50 }).notNull(),
  status: mysqlEnum("jobStatus", ["active", "paused", "running", "error"])
    .default("active")
    .notNull(),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  lastResult: text("lastResult"),
  leaksFound: int("leaksFound").default(0),
  totalRuns: int("totalRuns").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const alertContacts = mysqlTable("alert_contacts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("contactName", { length: 255 }).notNull(),
  nameAr: varchar("contactNameAr", { length: 255 }),
  email: varchar("contactEmail", { length: 320 }),
  phone: varchar("contactPhone", { length: 20 }),
  role: varchar("contactRole", { length: 100 }),
  roleAr: varchar("contactRoleAr", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  channels: json("alertChannels").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const alertRules = mysqlTable("alert_rules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("ruleName", { length: 255 }).notNull(),
  nameAr: varchar("ruleNameAr", { length: 255 }),
  severityThreshold: mysqlEnum("severityThreshold", ["critical", "high", "medium", "low"]).notNull(),
  channel: mysqlEnum("alertChannel", ["email", "sms", "both"]).default("email").notNull(),
  isEnabled: boolean("isEnabled").default(true).notNull(),
  recipients: json("ruleRecipients").$type<number[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const alertHistory = mysqlTable("alert_history", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: int("ruleId"),
  contactId: int("contactId"),
  contactName: varchar("alertContactName", { length: 255 }),
  channel: mysqlEnum("deliveryChannel", ["email", "sms"]).notNull(),
  subject: varchar("alertSubject", { length: 500 }).notNull(),
  body: text("alertBody"),
  status: mysqlEnum("deliveryStatus", ["sent", "failed", "pending"]).default("pending").notNull(),
  leakId: varchar("alertLeakId", { length: 32 }),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export const retentionPolicies = mysqlTable("retention_policies", {
  id: int("id").autoincrement().primaryKey(),
  entity: mysqlEnum("retentionEntity", ["leaks", "audit_logs", "notifications", "pii_scans", "paste_entries"]).notNull().unique(),
  entityLabel: varchar("entityLabel", { length: 100 }).notNull(),
  entityLabelAr: varchar("entityLabelAr", { length: 100 }).notNull(),
  retentionDays: int("retentionDays").notNull().default(365),
  archiveAction: mysqlEnum("archiveAction", ["delete", "archive"]).default("archive").notNull(),
  isEnabled: boolean("isEnabled").default(false).notNull(),
  lastRunAt: timestamp("lastRunAt"),
  recordsArchived: int("recordsArchived").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const threatRules = mysqlTable("threat_rules", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: varchar("ruleId", { length: 32 }).notNull().unique(),
  name: varchar("ruleName", { length: 255 }).notNull(),
  nameAr: varchar("ruleNameAr", { length: 255 }).notNull(),
  description: text("ruleDescription"),
  descriptionAr: text("ruleDescriptionAr"),
  category: mysqlEnum("ruleCategory", [
    "data_leak", "credentials", "sale_ad", "db_dump", "financial",
    "health", "government", "telecom", "education", "infrastructure",
  ]).notNull(),
  severity: mysqlEnum("ruleSeverity", ["critical", "high", "medium", "low"]).notNull(),
  patterns: json("rulePatterns").$type<string[]>().notNull(),
  keywords: json("ruleKeywords").$type<string[]>(),
  isEnabled: boolean("ruleEnabled").default(true).notNull(),
  matchCount: int("ruleMatchCount").default(0),
  lastMatchAt: timestamp("ruleLastMatchAt"),
  createdAt: timestamp("ruleCreatedAt").defaultNow().notNull(),
});

export const evidenceChain = mysqlTable("evidence_chain", {
  id: int("id").autoincrement().primaryKey(),
  evidenceId: varchar("evidenceId", { length: 64 }).notNull().unique(),
  leakId: varchar("evidenceLeakId", { length: 32 }).notNull(),
  evidenceType: mysqlEnum("evidenceType", ["text", "screenshot", "file", "metadata"]).notNull(),
  contentHash: varchar("contentHash", { length: 128 }).notNull(),
  previousHash: varchar("previousHash", { length: 128 }),
  blockIndex: int("blockIndex").notNull(),
  capturedBy: varchar("capturedBy", { length: 255 }),
  metadata: json("evidenceMetadata").$type<Record<string, unknown>>(),
  isVerified: boolean("isVerified").default(true).notNull(),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
  createdAt: timestamp("evidenceCreatedAt").defaultNow().notNull(),
});

export const sellerProfiles = mysqlTable("seller_profiles", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: varchar("sellerId", { length: 64 }).notNull().unique(),
  name: varchar("sellerName", { length: 255 }).notNull(),
  aliases: json("sellerAliases").$type<string[]>(),
  platforms: json("sellerPlatforms").$type<string[]>().notNull(),
  totalLeaks: int("totalLeaks").default(0),
  totalRecords: int("sellerTotalRecords").default(0),
  riskScore: int("sellerRiskScore").default(0),
  riskLevel: mysqlEnum("sellerRiskLevel", ["critical", "high", "medium", "low"]).default("medium").notNull(),
  sectors: json("sellerSectors").$type<string[]>(),
  lastActivity: timestamp("sellerLastActivity"),
  firstSeen: timestamp("sellerFirstSeen").defaultNow().notNull(),
  notes: text("sellerNotes"),
  isActive: boolean("sellerIsActive").default(true).notNull(),
  createdAt: timestamp("sellerCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("sellerUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export const osintQueries = mysqlTable("osint_queries", {
  id: int("id").autoincrement().primaryKey(),
  queryId: varchar("queryId", { length: 32 }).notNull().unique(),
  name: varchar("queryName", { length: 255 }).notNull(),
  nameAr: varchar("queryNameAr", { length: 255 }).notNull(),
  queryType: mysqlEnum("queryType", ["google_dork", "shodan", "recon", "spiderfoot"]).notNull(),
  category: varchar("queryCategory", { length: 100 }).notNull(),
  categoryAr: varchar("queryCategoryAr", { length: 100 }),
  query: text("queryText").notNull(),
  description: text("queryDescription"),
  descriptionAr: text("queryDescriptionAr"),
  resultsCount: int("queryResultsCount").default(0),
  lastRunAt: timestamp("queryLastRunAt"),
  isEnabled: boolean("queryEnabled").default(true).notNull(),
  createdAt: timestamp("queryCreatedAt").defaultNow().notNull(),
});

export const feedbackEntries = mysqlTable("feedback_entries", {
  id: int("id").autoincrement().primaryKey(),
  leakId: varchar("feedbackLeakId", { length: 32 }).notNull(),
  userId: int("feedbackUserId"),
  userName: varchar("feedbackUserName", { length: 255 }),
  systemClassification: mysqlEnum("systemClassification", ["personal_data", "cybersecurity", "clean", "unknown"]).notNull(),
  analystClassification: mysqlEnum("analystClassification", ["personal_data", "cybersecurity", "clean", "unknown"]).notNull(),
  isCorrect: boolean("isCorrect").notNull(),
  notes: text("feedbackNotes"),
  createdAt: timestamp("feedbackCreatedAt").defaultNow().notNull(),
});

export const knowledgeGraphNodes = mysqlTable("knowledge_graph_nodes", {
  id: int("id").autoincrement().primaryKey(),
  nodeId: varchar("nodeId", { length: 64 }).notNull().unique(),
  nodeType: mysqlEnum("nodeType", ["leak", "seller", "entity", "sector", "pii_type", "platform", "campaign"]).notNull(),
  label: varchar("nodeLabel", { length: 255 }).notNull(),
  labelAr: varchar("nodeLabelAr", { length: 255 }),
  metadata: json("nodeMetadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("nodeCreatedAt").defaultNow().notNull(),
});

export const knowledgeGraphEdges = mysqlTable("knowledge_graph_edges", {
  id: int("id").autoincrement().primaryKey(),
  sourceNodeId: varchar("sourceNodeId", { length: 64 }).notNull(),
  targetNodeId: varchar("targetNodeId", { length: 64 }).notNull(),
  relationship: varchar("edgeRelationship", { length: 100 }).notNull(),
  relationshipAr: varchar("edgeRelationshipAr", { length: 100 }),
  weight: int("edgeWeight").default(1),
  metadata: json("edgeMetadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("edgeCreatedAt").defaultNow().notNull(),
});

export const platformUsers = mysqlTable("platform_users", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 50 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  mobile: varchar("mobile", { length: 20 }),
  displayName: varchar("displayName", { length: 200 }).notNull(),
  platformRole: mysqlEnum("platformRole", [
    "root_admin",
    "director",
    "vice_president",
    "manager",
    "analyst",
    "viewer",
  ])
    .default("viewer")
    .notNull(),
  status: mysqlEnum("status", ["active", "inactive", "suspended"])
    .default("active")
    .notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const incidentDocuments = mysqlTable("incident_documents", {
  id: int("id").autoincrement().primaryKey(),
  documentId: varchar("documentId", { length: 64 }).notNull().unique(),
  leakId: varchar("leakId", { length: 32 }).notNull(),
  verificationCode: varchar("verificationCode", { length: 32 }).notNull().unique(),
  contentHash: varchar("contentHash", { length: 128 }).notNull(),
  documentType: mysqlEnum("documentType", ["incident_report", "custom_report", "executive_summary"]).default("incident_report").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }).notNull(),
  generatedBy: int("generatedBy").notNull(),
  generatedByName: varchar("generatedByName", { length: 200 }),
  pdfUrl: text("pdfUrl"),
  metadata: json("docMetadata").$type<Record<string, unknown>>(),
  isVerified: boolean("isVerified").default(true),
  createdAt: timestamp("docCreatedAt").defaultNow().notNull(),
});

export const aiResponseRatings = mysqlTable("ai_response_ratings", {
  id: int("id").autoincrement().primaryKey(),
  messageId: varchar("messageId", { length: 64 }).notNull(),
  userId: int("ratingUserId").notNull(),
  userName: varchar("ratingUserName", { length: 255 }),
  rating: int("rating").notNull(), // 1-5 stars
  userMessage: text("userMessage"), // The user's original question
  aiResponse: text("aiResponse"), // The AI's response text
  toolsUsed: json("toolsUsed").$type<string[]>(), // Which tools the AI used
  feedback: text("ratingFeedback"), // Optional text feedback
  createdAt: timestamp("ratingCreatedAt").defaultNow().notNull(),
});

export const chatConversations = mysqlTable("chat_conversations", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: varchar("ccConversationId", { length: 64 }).notNull().unique(),
  userId: varchar("ccUserId", { length: 64 }).notNull(),
  userName: varchar("ccUserName", { length: 255 }),
  title: varchar("ccTitle", { length: 500 }).notNull(),
  summary: text("ccSummary"),
  messageCount: int("ccMessageCount").default(0).notNull(),
  totalToolsUsed: int("ccTotalToolsUsed").default(0).notNull(),
  status: mysqlEnum("ccStatus", ["active", "archived", "exported"]).default("active").notNull(),
  createdAt: timestamp("ccCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("ccUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: varchar("cmConversationId", { length: 64 }).notNull(),
  messageId: varchar("cmMessageId", { length: 64 }).notNull(),
  role: mysqlEnum("cmRole", ["user", "assistant"]).notNull(),
  content: text("cmContent").notNull(),
  toolsUsed: json("cmToolsUsed"),
  thinkingSteps: json("cmThinkingSteps"),
  rating: int("cmRating"),
  createdAt: timestamp("cmCreatedAt").defaultNow().notNull(),
});

export const kbSearchLog = mysqlTable("kb_search_log", {
  id: int("id").autoincrement().primaryKey(),
  query: text("kbsQuery").notNull(),
  resultsCount: int("kbsResultsCount").default(0),
  matchedIds: json("kbsMatchedIds").$type<number[]>(),
  userId: int("kbsUserId"),
  source: mysqlEnum("kbsSource", ["manual", "ai_auto", "api"]).default("manual").notNull(),
  createdAt: timestamp("kbsCreatedAt").defaultNow().notNull(),
});

export const incidentCertifications = mysqlTable("incident_certifications", {
  id: int("id").autoincrement().primaryKey(),
  certCode: varchar("certCode", { length: 64 }).notNull().unique(),
  incidentId: varchar("incidentId", { length: 64 }).notNull(), // e.g. REAL-001
  incidentTitle: varchar("incidentTitle", { length: 500 }).notNull(),
  incidentTitleAr: varchar("incidentTitleAr", { length: 500 }),
  severity: varchar("certSeverity", { length: 20 }),
  sector: varchar("certSector", { length: 200 }),
  recordsExposed: bigint("certRecordsExposed", { mode: "number" }),
  issuedBy: varchar("issuedBy", { length: 255 }).notNull(), // user displayName
  issuedByUserId: varchar("issuedByUserId", { length: 64 }).notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  pdfUrl: text("certPdfUrl"), // S3 URL of the generated PDF
  htmlContent: text("certHtmlContent"), // full HTML of the certification letter
  sha256Hash: varchar("certSha256Hash", { length: 128 }), // hash for verification
  status: mysqlEnum("certStatus", ["active", "revoked"]).default("active").notNull(),
  revokedAt: timestamp("revokedAt"),
  revokedBy: varchar("revokedBy", { length: 255 }),
  verifiedCount: int("verifiedCount").default(0), // how many times QR was scanned
  lastVerifiedAt: timestamp("lastVerifiedAt"),
});

export const adminRoles = mysqlTable("admin_roles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("roleName", { length: 200 }).notNull(),
  nameEn: varchar("roleNameEn", { length: 200 }).notNull(),
  description: text("roleDescription"),
  descriptionEn: text("roleDescriptionEn"),
  isSystem: boolean("isSystem").default(false).notNull(),
  priority: int("rolePriority").default(0).notNull(),
  color: varchar("roleColor", { length: 20 }),
  status: mysqlEnum("roleStatus", ["active", "disabled"]).default("active").notNull(),
  createdAt: bigint("roleCreatedAt", { mode: "number" }).notNull(),
  updatedAt: bigint("roleUpdatedAt", { mode: "number" }).notNull(),
});

export const adminPermissions = mysqlTable("admin_permissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  resourceType: mysqlEnum("resourceType", [
    "page", "section", "component", "content_type", "task", "feature", "api", "menu",
  ]).notNull(),
  resourceId: varchar("resourceId", { length: 200 }).notNull(),
  resourceName: varchar("resourceName", { length: 300 }).notNull(),
  resourceNameEn: varchar("resourceNameEn", { length: 300 }),
  action: mysqlEnum("permAction", [
    "view", "create", "edit", "delete", "publish", "unpublish",
    "enable", "disable", "manage", "export", "approve",
  ]).notNull(),
  description: text("permDescription"),
  createdAt: bigint("permCreatedAt", { mode: "number" }).notNull(),
});

export const adminRolePermissions = mysqlTable("admin_role_permissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  roleId: varchar("rpRoleId", { length: 36 }).notNull(),
  permissionId: varchar("rpPermissionId", { length: 36 }).notNull(),
  effect: mysqlEnum("rpEffect", ["allow", "deny"]).default("allow").notNull(),
  conditions: json("rpConditions").$type<Record<string, unknown>>(),
  createdAt: bigint("rpCreatedAt", { mode: "number" }).notNull(),
});

export const adminGroups = mysqlTable("admin_groups", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("groupName", { length: 200 }).notNull(),
  nameEn: varchar("groupNameEn", { length: 200 }).notNull(),
  description: text("groupDescription"),
  descriptionEn: text("groupDescriptionEn"),
  status: mysqlEnum("groupStatus", ["active", "disabled"]).default("active").notNull(),
  createdAt: bigint("groupCreatedAt", { mode: "number" }).notNull(),
  updatedAt: bigint("groupUpdatedAt", { mode: "number" }).notNull(),
});

export const adminGroupMemberships = mysqlTable("admin_group_memberships", {
  id: varchar("id", { length: 36 }).primaryKey(),
  groupId: varchar("gmGroupId", { length: 36 }).notNull(),
  userId: int("gmUserId").notNull(),
  joinedAt: bigint("gmJoinedAt", { mode: "number" }).notNull(),
});

export const adminGroupPermissions = mysqlTable("admin_group_permissions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  groupId: varchar("gpGroupId", { length: 36 }).notNull(),
  permissionId: varchar("gpPermissionId", { length: 36 }).notNull(),
  effect: mysqlEnum("gpEffect", ["allow", "deny"]).default("allow").notNull(),
  createdAt: bigint("gpCreatedAt", { mode: "number" }).notNull(),
});

export const adminUserOverrides = mysqlTable("admin_user_overrides", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("ouUserId").notNull(),
  permissionId: varchar("ouPermissionId", { length: 36 }).notNull(),
  effect: mysqlEnum("ouEffect", ["allow", "deny"]).notNull(),
  reason: text("ouReason").notNull(),
  expiresAt: bigint("ouExpiresAt", { mode: "number" }),
  createdBy: int("ouCreatedBy").notNull(),
  createdAt: bigint("ouCreatedAt", { mode: "number" }).notNull(),
});

export const adminFeatureFlags = mysqlTable("admin_feature_flags", {
  id: varchar("id", { length: 36 }).primaryKey(),
  key: varchar("ffKey", { length: 200 }).notNull().unique(),
  displayName: varchar("ffDisplayName", { length: 300 }).notNull(),
  displayNameEn: varchar("ffDisplayNameEn", { length: 300 }),
  description: text("ffDescription"),
  isEnabled: boolean("ffIsEnabled").default(true).notNull(),
  targetType: mysqlEnum("ffTargetType", ["all", "roles", "groups", "users", "percentage"]).default("all").notNull(),
  targetIds: json("ffTargetIds").$type<string[]>(),
  enableAt: bigint("ffEnableAt", { mode: "number" }),
  disableAt: bigint("ffDisableAt", { mode: "number" }),
  updatedBy: int("ffUpdatedBy"),
  createdAt: bigint("ffCreatedAt", { mode: "number" }).notNull(),
  updatedAt: bigint("ffUpdatedAt", { mode: "number" }).notNull(),
});

export const adminAuditLogs = mysqlTable("admin_audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("aalUserId"),
  userName: varchar("aalUserName", { length: 255 }),
  action: varchar("aalAction", { length: 100 }).notNull(),
  resourceType: varchar("aalResourceType", { length: 100 }).notNull(),
  resourceId: varchar("aalResourceId", { length: 255 }),
  resourceName: varchar("aalResourceName", { length: 500 }),
  oldValue: json("aalOldValue").$type<Record<string, unknown>>(),
  newValue: json("aalNewValue").$type<Record<string, unknown>>(),
  reason: text("aalReason"),
  ipAddress: varchar("aalIpAddress", { length: 45 }),
  userAgent: text("aalUserAgent"),
  isRollbackable: boolean("aalIsRollbackable").default(false).notNull(),
  rolledBack: boolean("aalRolledBack").default(false).notNull(),
  rolledBackBy: int("aalRolledBackBy"),
  createdAt: bigint("aalCreatedAt", { mode: "number" }).notNull(),
});

export const adminThemeSettings = mysqlTable("admin_theme_settings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  category: mysqlEnum("tsCategory", ["colors", "typography", "layout", "shadows", "animations"]).notNull(),
  key: varchar("tsKey", { length: 200 }).notNull(),
  value: text("tsValue").notNull(),
  valueLight: text("tsValueLight"),
  valueDark: text("tsValueDark"),
  label: varchar("tsLabel", { length: 300 }),
  labelEn: varchar("tsLabelEn", { length: 300 }),
  updatedBy: int("tsUpdatedBy"),
  updatedAt: bigint("tsUpdatedAt", { mode: "number" }).notNull(),
});

export const adminMenus = mysqlTable("admin_menus", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("menuName", { length: 200 }).notNull(),
  nameEn: varchar("menuNameEn", { length: 200 }),
  location: mysqlEnum("menuLocation", ["sidebar", "top_nav", "footer", "contextual", "mobile"]).notNull(),
  status: mysqlEnum("menuStatus", ["active", "disabled"]).default("active").notNull(),
  createdAt: bigint("menuCreatedAt", { mode: "number" }).notNull(),
  updatedAt: bigint("menuUpdatedAt", { mode: "number" }).notNull(),
});

export const adminMenuItems = mysqlTable("admin_menu_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  menuId: varchar("miMenuId", { length: 36 }).notNull(),
  parentId: varchar("miParentId", { length: 36 }),
  title: varchar("miTitle", { length: 300 }).notNull(),
  titleEn: varchar("miTitleEn", { length: 300 }),
  icon: varchar("miIcon", { length: 100 }),
  linkType: mysqlEnum("miLinkType", ["internal", "external", "anchor", "none"]).default("internal").notNull(),
  linkTarget: varchar("miLinkTarget", { length: 500 }),
  openNewTab: boolean("miOpenNewTab").default(false).notNull(),
  visibilityRules: json("miVisibilityRules").$type<{
    roles?: string[];
    groups?: string[];
    users?: string[];
    featureFlags?: string[];
  }>(),
  badge: varchar("miBadge", { length: 50 }),
  badgeColor: varchar("miBadgeColor", { length: 20 }),
  sortOrder: int("miSortOrder").default(0).notNull(),
  status: mysqlEnum("miStatus", ["active", "disabled"]).default("active").notNull(),
  createdAt: bigint("miCreatedAt", { mode: "number" }).notNull(),
  updatedAt: bigint("miUpdatedAt", { mode: "number" }).notNull(),
});

export const adminUserRoles = mysqlTable("admin_user_roles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("urUserId").notNull(),
  roleId: varchar("urRoleId", { length: 36 }).notNull(),
  assignedAt: bigint("urAssignedAt", { mode: "number" }).notNull(),
  assignedBy: int("urAssignedBy"),
});

