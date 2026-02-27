# rasid - server-middleware

> Auto-extracted source code documentation

---

## `server/middleware/chartPersistence.ts`

```typescript
/**
 * API-16: Chart PNG Persistence
 * حفظ المخططات كـ PNG وتقديمها عبر مسار ثابت
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const CHARTS_DIR = path.join(process.cwd(), "public", "uploads", "charts");

/**
 * Ensure charts directory exists
 */
function ensureChartsDir(): void {
  if (!fs.existsSync(CHARTS_DIR)) {
    fs.mkdirSync(CHARTS_DIR, { recursive: true });
  }
}

/**
 * Generate a unique chart filename
 */
function generateChartFilename(chartType: string, dataType: string): string {
  const timestamp = Date.now();
  const hash = crypto.randomBytes(4).toString("hex");
  return `chart_${chartType}_${dataType}_${timestamp}_${hash}.json`;
}

/**
 * Save chart configuration to disk for later rendering
 * Returns the URL path to access the chart
 */
export function persistChartConfig(
  chartConfig: any,
  chartType: string,
  dataType: string,
  insights?: string[],
  summary?: string
): { chartId: string; chartUrl: string; configPath: string } {
  ensureChartsDir();

  const filename = generateChartFilename(chartType, dataType);
  const chartId = filename.replace(".json", "");
  const filePath = path.join(CHARTS_DIR, filename);

  const chartPayload = {
    chartId,
    chartConfig,
    chartType,
    dataType,
    insights: insights || [],
    summary: summary || "",
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(filePath, JSON.stringify(chartPayload, null, 2), "utf-8");

  const chartUrl = `/uploads/charts/${filename}`;

  return { chartId, chartUrl, configPath: filePath };
}

/**
 * Load a persisted chart config by ID
 */
export function loadChartConfig(chartId: string): any | null {
  const filename = chartId.endsWith(".json") ? chartId : `${chartId}.json`;
  const filePath = path.join(CHARTS_DIR, filename);

  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * List all persisted charts
 */
export function listCharts(): Array<{ chartId: string; chartUrl: string; createdAt: string }> {
  ensureChartsDir();

  const files = fs.readdirSync(CHARTS_DIR).filter(f => f.endsWith(".json"));
  return files.map(f => {
    try {
      const raw = fs.readFileSync(path.join(CHARTS_DIR, f), "utf-8");
      const data = JSON.parse(raw);
      return {
        chartId: data.chartId || f.replace(".json", ""),
        chartUrl: `/uploads/charts/${f}`,
        createdAt: data.createdAt || "",
      };
    } catch {
      return { chartId: f.replace(".json", ""), chartUrl: `/uploads/charts/${f}`, createdAt: "" };
    }
  });
}

/**
 * Delete old charts (retention cleanup)
 */
export function cleanupOldCharts(maxAgeDays: number = 30): number {
  ensureChartsDir();

  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(CHARTS_DIR).filter(f => f.endsWith(".json"));
  let deleted = 0;

  for (const file of files) {
    const filePath = path.join(CHARTS_DIR, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    } catch {
      // skip
    }
  }

  return deleted;
}

```

---

## `server/middleware/rbacRedaction.ts`

```typescript
/**
 * SEC-03: RBAC Field-Level Redaction Middleware
 * حجب الحقول الحساسة حسب الدور — لا يعرض بيانات بدون صلاحية
 *
 * GOV-03: Domain Enforcement Middleware
 * يمنع الوصول عبر المجالات — كل مكون مقيد بمجال واحد
 */

export type Domain = "breaches" | "privacy";

export interface RbacRole {
  role: string;
  /** Fields this role is NOT allowed to see */
  redactedFields: string[];
  /** Domains this role can access */
  allowedDomains: Domain[];
}

/**
 * Role-based redaction configuration
 * Defines which fields each role CANNOT see
 */
const RBAC_REDACTION_RULES: Record<string, RbacRole> = {
  root_admin: {
    role: "root_admin",
    redactedFields: [],
    allowedDomains: ["breaches", "privacy"],
  },
  director: {
    role: "director",
    redactedFields: [],
    allowedDomains: ["breaches", "privacy"],
  },
  vice_president: {
    role: "vice_president",
    redactedFields: ["passwordHash", "apiKeyHash", "rawPiiData"],
    allowedDomains: ["breaches", "privacy"],
  },
  manager: {
    role: "manager",
    redactedFields: ["passwordHash", "apiKeyHash", "rawPiiData", "ipAddress"],
    allowedDomains: ["breaches", "privacy"],
  },
  smart_monitor_manager: {
    role: "smart_monitor_manager",
    redactedFields: ["passwordHash", "apiKeyHash", "rawPiiData", "ipAddress", "email"],
    allowedDomains: ["breaches"],
  },
  monitoring_officer: {
    role: "monitoring_officer",
    redactedFields: ["passwordHash", "apiKeyHash", "rawPiiData", "ipAddress", "email", "phone", "mobile", "nationalId"],
    allowedDomains: ["breaches"],
  },
  privacy_officer: {
    role: "privacy_officer",
    redactedFields: ["passwordHash", "apiKeyHash", "rawPiiData", "ipAddress"],
    allowedDomains: ["privacy"],
  },
  viewer: {
    role: "viewer",
    redactedFields: ["passwordHash", "apiKeyHash", "rawPiiData", "ipAddress", "email", "phone", "mobile", "nationalId", "sampleData", "evidenceRaw"],
    allowedDomains: ["breaches"],
  },
  admin: {
    role: "admin",
    redactedFields: ["passwordHash", "apiKeyHash"],
    allowedDomains: ["breaches", "privacy"],
  },
  user: {
    role: "user",
    redactedFields: ["passwordHash", "apiKeyHash", "rawPiiData", "ipAddress", "email", "phone", "mobile"],
    allowedDomains: ["breaches"],
  },
};

const REDACTED_PLACEHOLDER = "██████";

/**
 * Get the RBAC rule for a user role
 */
export function getRbacRule(role: string): RbacRole {
  return RBAC_REDACTION_RULES[role] || RBAC_REDACTION_RULES["viewer"];
}

/**
 * Redact sensitive fields from a data object based on user role
 */
export function redactFields<T extends Record<string, any>>(data: T, role: string): T {
  const rule = getRbacRule(role);
  if (rule.redactedFields.length === 0) return data;

  const redacted = { ...data };
  for (const field of rule.redactedFields) {
    if (field in redacted && redacted[field] != null) {
      redacted[field] = REDACTED_PLACEHOLDER;
    }
  }
  return redacted;
}

/**
 * Redact sensitive fields from an array of data objects
 */
export function redactArrayFields<T extends Record<string, any>>(dataArray: T[], role: string): T[] {
  const rule = getRbacRule(role);
  if (rule.redactedFields.length === 0) return dataArray;
  return dataArray.map(item => redactFields(item, role));
}

/**
 * Check if a user role is allowed to access a specific domain
 * GOV-03: Domain enforcement
 */
export function isDomainAllowed(role: string, domain: Domain): boolean {
  const rule = getRbacRule(role);
  return rule.allowedDomains.includes(domain);
}

/**
 * Enforce domain isolation — throws if role cannot access domain
 */
export function enforceDomain(role: string, domain: Domain): void {
  if (!isDomainAllowed(role, domain)) {
    throw new Error(`الوصول مرفوض: الدور "${role}" غير مصرح له بالوصول إلى مجال "${domain}"`);
  }
}

/**
 * Get user role from context (platform user or OAuth user)
 */
export function getUserRole(ctx: { user?: any; platformUser?: any }): string {
  if (ctx.platformUser?.platformRole) {
    return ctx.platformUser.platformRole;
  }
  if (ctx.user?.rasidRole) {
    return ctx.user.rasidRole;
  }
  if (ctx.user?.role) {
    return ctx.user.role;
  }
  return "viewer";
}

/**
 * Get user's allowed domain from context
 */
export function getUserDomain(ctx: { user?: any; platformUser?: any }): Domain {
  // Default to breaches — can be extended based on user assignment
  const role = getUserRole(ctx);
  const rule = getRbacRule(role);
  // Return the first allowed domain as primary
  return rule.allowedDomains[0] || "breaches";
}

/**
 * Domain-aware data filter — only returns records matching the user's domain
 */
export function filterByDomain<T extends Record<string, any>>(
  data: T[],
  role: string,
  domainField: string = "domain"
): T[] {
  const rule = getRbacRule(role);
  return data.filter(item => {
    const itemDomain = item[domainField];
    if (!itemDomain) return true; // No domain field means shared data
    return rule.allowedDomains.includes(itemDomain as Domain);
  });
}

/**
 * Combined middleware: filter by domain + redact fields
 */
export function secureData<T extends Record<string, any>>(
  data: T[],
  role: string,
  domainField: string = "domain"
): T[] {
  const filtered = filterByDomain(data, role, domainField);
  return redactArrayFields(filtered, role);
}

```

---

