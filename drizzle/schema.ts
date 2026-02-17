import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, bigint, float, decimal } from "drizzle-orm/mysql-core";

// ═══════════════════════════════════════════════════
// CORE TABLES
// ═══════════════════════════════════════════════════

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "superadmin"]).default("user").notNull(),
  department: varchar("department", { length: 255 }),
  organization: varchar("organization", { length: 255 }),
  avatarUrl: text("avatarUrl"),
  preferences: json("preferences"),
  isActive: boolean("isActive").default(true),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ═══════════════════════════════════════════════════
// PRIVACY / COMPLIANCE TABLES (Platform 1)
// ═══════════════════════════════════════════════════

export const sites = mysqlTable("sites", {
  id: int("id").autoincrement().primaryKey(),
  url: text("url").notNull(),
  workingUrl: text("workingUrl"),
  finalUrl: text("finalUrl"),
  siteNameAr: varchar("siteNameAr", { length: 500 }),
  siteNameEn: varchar("siteNameEn", { length: 500 }),
  title: text("title"),
  description: text("description"),
  entityType: varchar("entityType", { length: 100 }),
  entityNameAr: varchar("entityNameAr", { length: 500 }),
  entityNameEn: varchar("entityNameEn", { length: 500 }),
  sector: varchar("sector", { length: 200 }),
  complianceStatus: mysqlEnum("complianceStatus", ["compliant", "partial", "non_compliant", "not_working"]).default("non_compliant"),
  hasPrivacyPolicy: boolean("hasPrivacyPolicy").default(false),
  hasContactInfo: boolean("hasContactInfo").default(false),
  privacyPolicyUrl: text("privacyPolicyUrl"),
  phones: json("phones"),
  emails: json("emails"),
  mxRecords: json("mxRecords"),
  cms: varchar("cms", { length: 100 }),
  sslStatus: varchar("sslStatus", { length: 50 }),
  httpStatus: int("httpStatus"),
  httpsStatus: int("httpsStatus"),
  lastScanDate: timestamp("lastScanDate"),
  lastChangeDate: timestamp("lastChangeDate"),
  followupPriority: int("followupPriority").default(0),
  isActive: boolean("isActive").default(true),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const siteScans = mysqlTable("site_scans", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull(),
  scanType: varchar("scanType", { length: 50 }).default("standard"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending"),
  complianceScore: float("complianceScore"),
  complianceStatus: varchar("complianceStatus", { length: 50 }),
  findings: json("findings"),
  rawData: json("rawData"),
  privacyPolicyText: text("privacyPolicyText"),
  privacyPolicyHash: varchar("privacyPolicyHash", { length: 64 }),
  duration: int("duration"),
  errorMessage: text("errorMessage"),
  scannedBy: int("scannedBy"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const siteRequirements = mysqlTable("site_requirements", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull(),
  scanId: int("scanId"),
  requirementCode: varchar("requirementCode", { length: 50 }).notNull(),
  requirementNameAr: varchar("requirementNameAr", { length: 500 }),
  requirementNameEn: varchar("requirementNameEn", { length: 500 }),
  clauseNumber: varchar("clauseNumber", { length: 20 }),
  status: mysqlEnum("status", ["met", "partial", "not_met", "not_applicable"]).default("not_met"),
  evidence: text("evidence"),
  recommendation: text("recommendation"),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).default("medium"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const privacyPolicyVersions = mysqlTable("privacy_policy_versions", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull(),
  scanId: int("scanId"),
  policyText: text("policyText"),
  policyHash: varchar("policyHash", { length: 64 }),
  changeType: mysqlEnum("changeType", ["new", "minor", "major", "removed"]).default("new"),
  changeSummary: text("changeSummary"),
  diffFromPrevious: text("diffFromPrevious"),
  version: int("version").default(1),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const complianceClauses = mysqlTable("compliance_clauses", {
  id: int("id").autoincrement().primaryKey(),
  clauseNumber: varchar("clauseNumber", { length: 20 }).notNull(),
  nameAr: varchar("nameAr", { length: 500 }).notNull(),
  nameEn: varchar("nameEn", { length: 500 }),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  category: varchar("category", { length: 100 }),
  weight: float("weight").default(1),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════
// INCIDENTS / DATA BREACH TABLES (Platform 2)
// ═══════════════════════════════════════════════════

export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  description: text("description"),
  status: mysqlEnum("status", ["investigating", "confirmed", "contained", "resolved", "closed"]).default("investigating"),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).default("medium"),
  impactLevel: mysqlEnum("impactLevel", ["catastrophic", "severe", "moderate", "minor", "negligible"]).default("moderate"),
  sensitivity: mysqlEnum("sensitivity", ["very_high", "high", "medium", "low"]).default("medium"),
  source: varchar("source", { length: 200 }),
  sourceType: varchar("sourceType", { length: 100 }),
  affectedEntity: varchar("affectedEntity", { length: 500 }),
  affectedEntityType: varchar("affectedEntityType", { length: 100 }),
  sector: varchar("sector", { length: 200 }),
  estimatedRecords: bigint("estimatedRecords", { mode: "number" }),
  estimatedIndividuals: bigint("estimatedIndividuals", { mode: "number" }),
  piiCategories: json("piiCategories"),
  dataTypes: json("dataTypes"),
  discoveredAt: timestamp("discoveredAt"),
  confirmedAt: timestamp("confirmedAt"),
  containedAt: timestamp("containedAt"),
  resolvedAt: timestamp("resolvedAt"),
  reportedBy: int("reportedBy"),
  assignedTo: int("assignedTo"),
  relatedSiteId: int("relatedSiteId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const incidentTimeline = mysqlTable("incident_timeline", {
  id: int("id").autoincrement().primaryKey(),
  incidentId: int("incidentId").notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }),
  description: text("description"),
  performedBy: int("performedBy"),
  metadata: json("metadata"),
  eventDate: timestamp("eventDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const incidentAttachments = mysqlTable("incident_attachments", {
  id: int("id").autoincrement().primaryKey(),
  incidentId: int("incidentId").notNull(),
  fileName: varchar("fileName", { length: 500 }),
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 500 }),
  fileType: varchar("fileType", { length: 100 }),
  fileSize: bigint("fileSize", { mode: "number" }),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const incidentDatasets = mysqlTable("incident_datasets", {
  id: int("id").autoincrement().primaryKey(),
  incidentId: int("incidentId").notNull(),
  datasetName: varchar("datasetName", { length: 500 }),
  piiCategory: varchar("piiCategory", { length: 200 }),
  recordCount: bigint("recordCount", { mode: "number" }),
  sampleFields: json("sampleFields"),
  sensitivity: varchar("sensitivity", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════
// FOLLOW-UPS & APPROVALS
// ═══════════════════════════════════════════════════

export const followups = mysqlTable("followups", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["site_followup", "incident_followup", "general", "corrective_action"]).default("general"),
  status: mysqlEnum("status", ["open", "in_progress", "pending_approval", "approved", "rejected", "completed", "overdue"]).default("open"),
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).default("medium"),
  relatedSiteId: int("relatedSiteId"),
  relatedIncidentId: int("relatedIncidentId"),
  assignedTo: int("assignedTo"),
  assignedBy: int("assignedBy"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const followupTasks = mysqlTable("followup_tasks", {
  id: int("id").autoincrement().primaryKey(),
  followupId: int("followupId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  assignedTo: int("assignedTo"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const approvals = mysqlTable("approvals", {
  id: int("id").autoincrement().primaryKey(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId").notNull(),
  requestedBy: int("requestedBy"),
  approvedBy: int("approvedBy"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled"]).default("pending"),
  comments: text("comments"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  decidedAt: timestamp("decidedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════
// REPORTS & TEMPLATES
// ═══════════════════════════════════════════════════

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["privacy_compliance", "incident_summary", "executive_brief", "custom", "scheduled"]).default("custom"),
  templateId: int("templateId"),
  status: mysqlEnum("status", ["draft", "generating", "ready", "archived"]).default("draft"),
  filters: json("filters"),
  content: text("content"),
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 500 }),
  format: varchar("format", { length: 20 }),
  verificationCode: varchar("verificationCode", { length: 64 }),
  qrCodeUrl: text("qrCodeUrl"),
  generatedBy: int("generatedBy"),
  generatedAt: timestamp("generatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reportTemplates = mysqlTable("report_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 500 }).notNull(),
  nameAr: varchar("nameAr", { length: 500 }),
  description: text("description"),
  type: varchar("type", { length: 100 }),
  structure: json("structure"),
  headerConfig: json("headerConfig"),
  footerConfig: json("footerConfig"),
  isActive: boolean("isActive").default(true),
  version: int("version").default(1),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const scheduledReports = mysqlTable("scheduled_reports", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  name: varchar("name", { length: 500 }),
  schedule: varchar("schedule", { length: 50 }),
  cronExpression: varchar("cronExpression", { length: 100 }),
  filters: json("filters"),
  recipients: json("recipients"),
  format: varchar("format", { length: 20 }).default("pdf"),
  isActive: boolean("isActive").default(true),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ═══════════════════════════════════════════════════
// ADMIN / CMS TABLES
// ═══════════════════════════════════════════════════

export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }).notNull(),
  titleEn: varchar("titleEn", { length: 500 }),
  description: text("description"),
  workspace: varchar("workspace", { length: 100 }),
  isVisible: boolean("isVisible").default(true),
  sortOrder: int("sortOrder").default(0),
  icon: varchar("icon", { length: 100 }),
  parentId: int("parentId"),
  requiredRole: varchar("requiredRole", { length: 50 }),
  config: json("config"),
  version: int("version").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const menus = mysqlTable("menus", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull(),
  labelAr: varchar("labelAr", { length: 500 }).notNull(),
  labelEn: varchar("labelEn", { length: 500 }),
  icon: varchar("icon", { length: 100 }),
  path: varchar("path", { length: 500 }),
  parentId: int("parentId"),
  workspace: varchar("workspace", { length: 100 }),
  sortOrder: int("sortOrder").default(0),
  isVisible: boolean("isVisible").default(true),
  requiredRole: varchar("requiredRole", { length: 50 }),
  badge: varchar("badge", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const catalogs = mysqlTable("catalogs", {
  id: int("id").autoincrement().primaryKey(),
  catalogType: varchar("catalogType", { length: 100 }).notNull(),
  key: varchar("key", { length: 200 }).notNull(),
  nameAr: varchar("nameAr", { length: 500 }).notNull(),
  nameEn: varchar("nameEn", { length: 500 }),
  description: text("description"),
  definition: text("definition"),
  formula: text("formula"),
  drillPath: varchar("drillPath", { length: 500 }),
  format: varchar("format", { length: 50 }),
  category: varchar("category", { length: 200 }),
  sortOrder: int("sortOrder").default(0),
  isVisible: boolean("isVisible").default(true),
  requiredRole: varchar("requiredRole", { length: 50 }),
  config: json("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const featureFlags = mysqlTable("feature_flags", {
  id: int("id").autoincrement().primaryKey(),
  featureKey: varchar("featureKey", { length: 200 }).notNull(),
  nameAr: varchar("nameAr", { length: 500 }).notNull(),
  nameEn: varchar("nameEn", { length: 500 }),
  description: text("description"),
  isEnabled: boolean("isEnabled").default(true),
  scope: mysqlEnum("scope", ["platform", "entity", "group", "user"]).default("platform"),
  scopeValue: varchar("scopeValue", { length: 200 }),
  expiresAt: timestamp("expiresAt"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const platformSettings = mysqlTable("platform_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 200 }).notNull(),
  settingValue: text("settingValue"),
  settingType: varchar("settingType", { length: 50 }).default("string"),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ═══════════════════════════════════════════════════
// ROLES & PERMISSIONS
// ═══════════════════════════════════════════════════

export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  nameAr: varchar("nameAr", { length: 200 }),
  description: text("description"),
  isSystem: boolean("isSystem").default(false),
  permissions: json("permissions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const userRoles = mysqlTable("user_roles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  roleId: int("roleId").notNull(),
  expiresAt: timestamp("expiresAt"),
  grantedBy: int("grantedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const groups = mysqlTable("groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  nameAr: varchar("nameAr", { length: 200 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const groupMembers = mysqlTable("group_members", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("groupId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════
// AUDIT & EVENTS
// ═══════════════════════════════════════════════════

export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  userName: varchar("userName", { length: 200 }),
  action: varchar("action", { length: 200 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  before: json("before"),
  after: json("after"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const systemEvents = mysqlTable("system_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 200 }).notNull(),
  source: varchar("source", { length: 200 }),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).default("info"),
  message: text("message"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message"),
  type: varchar("type", { length: 100 }),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════
// SMART RASID AI TABLES
// ═══════════════════════════════════════════════════

export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 500 }),
  pageContext: varchar("pageContext", { length: 500 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const aiMessages = mysqlTable("ai_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  toolCalls: json("toolCalls"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const aiTaskState = mysqlTable("ai_task_state", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  goal: text("goal"),
  filters: json("filters"),
  lastEntityType: varchar("lastEntityType", { length: 100 }),
  lastEntityId: int("lastEntityId"),
  currentStep: varchar("currentStep", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const glossaryTerms = mysqlTable("glossary_terms", {
  id: int("id").autoincrement().primaryKey(),
  term: varchar("term", { length: 500 }).notNull(),
  synonyms: json("synonyms"),
  definition: text("definition"),
  relatedPage: varchar("relatedPage", { length: 200 }),
  relatedEntity: varchar("relatedEntity", { length: 200 }),
  exampleQuestions: json("exampleQuestions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const pageDescriptors = mysqlTable("page_descriptors", {
  id: int("id").autoincrement().primaryKey(),
  pageSlug: varchar("pageSlug", { length: 200 }).notNull(),
  purpose: text("purpose"),
  mainElements: json("mainElements"),
  commonTasks: json("commonTasks"),
  drillLinks: json("drillLinks"),
  suggestedQuestions: json("suggestedQuestions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const guideCatalog = mysqlTable("guide_catalog", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  titleAr: varchar("titleAr", { length: 500 }),
  purpose: text("purpose"),
  steps: json("steps"),
  requiredRole: varchar("requiredRole", { length: 50 }),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const messageTemplatesCatalog = mysqlTable("message_templates_catalog", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 500 }).notNull(),
  type: varchar("type", { length: 100 }),
  templateText: text("templateText"),
  placeholders: json("placeholders"),
  examples: json("examples"),
  version: int("version").default(1),
  isActive: boolean("isActive").default(true),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ═══════════════════════════════════════════════════
// MY DASHBOARD (Custom Layouts)
// ═══════════════════════════════════════════════════

export const dashboardLayouts = mysqlTable("dashboard_layouts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 500 }),
  nameAr: varchar("nameAr", { length: 500 }),
  dataSource: varchar("dataSource", { length: 100 }),
  layout: json("layout"),
  filters: json("filters"),
  isDefault: boolean("isDefault").default(false),
  isTemplate: boolean("isTemplate").default(false),
  isLocked: boolean("isLocked").default(false),
  targetRole: varchar("targetRole", { length: 100 }),
  targetGroupId: int("targetGroupId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ═══════════════════════════════════════════════════
// LETTERS & DOCUMENTS
// ═══════════════════════════════════════════════════

export const letters = mysqlTable("letters", {
  id: int("id").autoincrement().primaryKey(),
  letterNumber: varchar("letterNumber", { length: 100 }),
  title: varchar("title", { length: 500 }).notNull(),
  type: varchar("type", { length: 100 }),
  content: text("content"),
  recipientEntity: varchar("recipientEntity", { length: 500 }),
  status: mysqlEnum("status", ["draft", "pending_approval", "approved", "sent", "archived"]).default("draft"),
  templateId: int("templateId"),
  fileUrl: text("fileUrl"),
  verificationCode: varchar("verificationCode", { length: 64 }),
  createdBy: int("createdBy"),
  approvedBy: int("approvedBy"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ═══════════════════════════════════════════════════
// VERIFICATION
// ═══════════════════════════════════════════════════

export const verificationRecords = mysqlTable("verification_records", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId").notNull(),
  summary: text("summary"),
  isValid: boolean("isValid").default(true),
  verifiedCount: int("verifiedCount").default(0),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════
// BREACH RAW DATA (from Platform 2)
// ═══════════════════════════════════════════════════

export const breachSources = mysqlTable("breach_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 500 }).notNull(),
  type: varchar("type", { length: 100 }),
  url: text("url"),
  isActive: boolean("isActive").default(true),
  lastChecked: timestamp("lastChecked"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const threatActors = mysqlTable("threat_actors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 500 }).notNull(),
  aliases: json("aliases"),
  description: text("description"),
  threatLevel: varchar("threatLevel", { length: 50 }),
  activityCount: int("activityCount").default(0),
  lastActivity: timestamp("lastActivity"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ═══════════════════════════════════════════════════
// BACKUP & RESTORE
// ═══════════════════════════════════════════════════

export const backups = mysqlTable("backups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 500 }),
  type: mysqlEnum("type", ["full", "incremental", "config_only"]).default("full"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending"),
  fileUrl: text("fileUrl"),
  fileSize: bigint("fileSize", { mode: "number" }),
  schedule: varchar("schedule", { length: 50 }),
  errorMessage: text("errorMessage"),
  createdBy: int("createdBy"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════
// UI POLICIES
// ═══════════════════════════════════════════════════

export const uiPolicies = mysqlTable("ui_policies", {
  id: int("id").autoincrement().primaryKey(),
  pageSlug: varchar("pageSlug", { length: 200 }),
  elementSelector: varchar("elementSelector", { length: 500 }),
  action: mysqlEnum("action", ["show", "hide", "disable", "relabel"]).default("show"),
  newLabel: varchar("newLabel", { length: 500 }),
  targetScope: varchar("targetScope", { length: 100 }),
  targetValue: varchar("targetValue", { length: 200 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
