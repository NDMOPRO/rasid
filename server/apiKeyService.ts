/**
 * API Key Management Service
 * Handles generation, validation, and lifecycle of API keys
 * for external SIEM/SOC tool integrations
 */
import crypto from "crypto";
import { createApiKey, getApiKeyByHash } from "./db";

const API_KEY_PREFIX = "ndmo_";

/**
 * Generate a new API key with a secure random value
 * Returns both the raw key (shown once) and the hash (stored in DB)
 */
export function generateApiKey(): { rawKey: string; keyHash: string; keyPrefix: string } {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const rawKey = `${API_KEY_PREFIX}${randomBytes}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.substring(0, 12);
  return { rawKey, keyHash, keyPrefix };
}

/**
 * Create a new API key and store it in the database
 */
export async function issueApiKey(opts: {
  name: string;
  permissions: string[];
  rateLimit?: number;
  expiresAt?: Date | null;
  createdBy?: number;
}): Promise<{ id: number; rawKey: string; keyPrefix: string }> {
  const { rawKey, keyHash, keyPrefix } = generateApiKey();
  
  const id = await createApiKey({
    name: opts.name,
    keyHash,
    keyPrefix,
    permissions: opts.permissions,
    rateLimit: opts.rateLimit ?? 1000,
    expiresAt: opts.expiresAt ?? null,
    createdBy: opts.createdBy ?? null,
  });
  
  return { id, rawKey, keyPrefix };
}

/**
 * Validate an API key and return the associated record
 */
export async function validateApiKey(rawKey: string) {
  if (!rawKey.startsWith(API_KEY_PREFIX)) return null;
  
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const apiKey = await getApiKeyByHash(keyHash);
  
  if (!apiKey) return null;
  if (!apiKey.isActive) return null;
  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) return null;
  
  return apiKey;
}

/**
 * Available API permissions
 */
export const API_PERMISSIONS = [
  { id: "leaks.read", label: "Read Leaks", labelAr: "قراءة التسريبات" },
  { id: "leaks.write", label: "Create Leaks", labelAr: "إنشاء التسريبات" },
  { id: "channels.read", label: "Read Channels", labelAr: "قراءة القنوات" },
  { id: "pii.scan", label: "PII Scanning", labelAr: "فحص PII" },
  { id: "reports.read", label: "Read Reports", labelAr: "قراءة التقارير" },
  { id: "alerts.read", label: "Read Alerts", labelAr: "قراءة التنبيهات" },
  { id: "dashboard.read", label: "Read Dashboard", labelAr: "قراءة لوحة القيادة" },
  { id: "threatmap.read", label: "Read Threat Map", labelAr: "قراءة خريطة التهديدات" },
] as const;
