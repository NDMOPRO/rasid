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

export const privacyPolicyVersions = mysqlTable("privacy_policy_versions", {
	id: int().autoincrement().primaryKey().notNull(),
	siteId: int().notNull(),
	scanId: int(),
	policyText: text(),
	policyHash: varchar({ length: 64 }),
	changeType: mysqlEnum(['new','minor','major','removed']).default('new'),
	changeSummary: text(),
	diffFromPrevious: text(),
	version: int().default(1),
	detectedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
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
	description: text(),
	type: mysqlEnum(['privacy_compliance','incident_summary','executive_brief','custom','scheduled']).default('custom'),
	templateId: int(),
	status: mysqlEnum(['draft','generating','ready','archived']).default('draft'),
	filters: json(),
	content: text(),
	fileUrl: text(),
	fileKey: varchar({ length: 500 }),
	format: varchar({ length: 20 }),
	verificationCode: varchar({ length: 64 }),
	qrCodeUrl: text(),
	generatedBy: int(),
	generatedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
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
icon: varchar({ length: 50 }).default("LayoutDashboard"),
sortOrder: int().default(0).notNull(),
config: json(),
isDefault: tinyint().default(0),
createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export type CustomPage = typeof customPages.$inferSelect;
export type InsertCustomPage = typeof customPages.$inferInsert;

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
	category: mysqlEnum('category', ['main','monitoring','analysis','admin','privacy']).default('main').notNull(),
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
// جداول الخصوصية — privacy_domains + screenshots + scan_runs
// ═══════════════════════════════════════════════════════════════

export const privacyDomains = mysqlTable("privacy_domains", {
	id: int("pd_id").autoincrement().primaryKey(),
	domain: varchar("pd_domain", { length: 255 }).notNull(),
	status: varchar("pd_status", { length: 20 }),
	workingUrl: text("pd_working_url"),
	finalUrl: text("pd_final_url"),
	nameAr: varchar("pd_name_ar", { length: 500 }),
	nameEn: varchar("pd_name_en", { length: 500 }),
	title: text("pd_title"),
	description: text("pd_description"),
	category: varchar("pd_category", { length: 100 }),
	cms: varchar("pd_cms", { length: 100 }),
	sslStatus: varchar("pd_ssl_status", { length: 50 }),
	mxRecords: text("pd_mx_records"),
	email: text("pd_email"),
	phone: text("pd_phone"),
	policyUrl: text("pd_policy_url"),
	policyTitle: text("pd_policy_title"),
	policyStatusCode: varchar("pd_policy_status_code", { length: 10 }),
	policyLanguage: varchar("pd_policy_language", { length: 20 }),
	policyLastUpdate: varchar("pd_policy_last_update", { length: 100 }),
	discoveryMethod: varchar("pd_discovery_method", { length: 100 }),
	policyConfidence: varchar("pd_policy_confidence", { length: 50 }),
	policyWordCount: int("pd_policy_word_count"),
	policyCharCount: int("pd_policy_char_count"),
	robotsStatus: varchar("pd_robots_status", { length: 50 }),
	entityName: varchar("pd_entity_name", { length: 500 }),
	entityEmail: text("pd_entity_email"),
	entityPhone: text("pd_entity_phone"),
	entityAddress: text("pd_entity_address"),
	dpo: varchar("pd_dpo", { length: 300 }),
	contactForm: text("pd_contact_form"),
	mentionsDataTypes: tinyint("pd_mentions_data_types").default(0),
	dataTypesList: text("pd_data_types_list"),
	mentionsPurpose: tinyint("pd_mentions_purpose").default(0),
	purposeList: text("pd_purpose_list"),
	mentionsLegalBasis: tinyint("pd_mentions_legal_basis").default(0),
	mentionsRights: tinyint("pd_mentions_rights").default(0),
	rightsList: text("pd_rights_list"),
	mentionsRetention: tinyint("pd_mentions_retention").default(0),
	mentionsThirdParties: tinyint("pd_mentions_third_parties").default(0),
	thirdPartiesList: text("pd_third_parties_list"),
	mentionsCrossBorder: tinyint("pd_mentions_cross_border").default(0),
	mentionsSecurity: tinyint("pd_mentions_security").default(0),
	mentionsCookies: tinyint("pd_mentions_cookies").default(0),
	mentionsChildren: tinyint("pd_mentions_children").default(0),
	complianceScore: int("pd_compliance_score").default(0),
	complianceStatus: varchar("pd_compliance_status", { length: 30 }),
	screenshotUrl: text("pd_screenshot_url"),
	// New columns for full Excel data
	httpsWww: varchar("pd_https_www", { length: 10 }),
	httpsNoWww: varchar("pd_https_no_www", { length: 10 }),
	httpWww: varchar("pd_http_www", { length: 10 }),
	httpNoWww: varchar("pd_http_no_www", { length: 10 }),
	classification: varchar("pd_classification", { length: 200 }),
	policyFinalUrl: text("pd_policy_final_url"),
	internalLinks: text("pd_internal_links"),
	crawlStatus: varchar("pd_crawl_status", { length: 50 }),
	fullTextPath: text("pd_full_text_path"),
	importedAt: timestamp("pd_imported_at", { mode: 'string' }).defaultNow(),
	lastScanAt: timestamp("pd_last_scan_at", { mode: 'string' }),
	scanRunId: int("pd_scan_run_id"),
});

export const privacyScreenshots = mysqlTable("privacy_screenshots", {
	id: int("ps_id").autoincrement().primaryKey(),
	domainId: int("ps_domain_id").notNull(),
	scanRunId: int("ps_scan_run_id"),
	captureType: varchar("ps_capture_type", { length: 30 }),
	filePath: text("ps_file_path"),
	fileHash: varchar("ps_file_hash", { length: 64 }),
	fileSize: int("ps_file_size"),
	isPrimary: tinyint("ps_is_primary").default(0),
	capturedAt: timestamp("ps_captured_at", { mode: 'string' }).defaultNow(),
});

export const privacyScanRuns = mysqlTable("privacy_scan_runs", {
	id: int("psr_id").autoincrement().primaryKey(),
	sourceType: varchar("psr_source_type", { length: 30 }),
	sourceFile: varchar("psr_source_file", { length: 255 }),
	startedAt: timestamp("psr_started_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("psr_completed_at", { mode: 'string' }),
	totalSites: int("psr_total_sites").default(0),
	successCount: int("psr_success_count").default(0),
	failCount: int("psr_fail_count").default(0),
	notes: text("psr_notes"),
});

export type PrivacyDomain = typeof privacyDomains.$inferSelect;
export type InsertPrivacyDomain = typeof privacyDomains.$inferInsert;
export type PrivacyScreenshot = typeof privacyScreenshots.$inferSelect;
export type InsertPrivacyScreenshot = typeof privacyScreenshots.$inferInsert;
export type PrivacyScanRun = typeof privacyScanRuns.$inferSelect;
export type InsertPrivacyScanRun = typeof privacyScanRuns.$inferInsert;
