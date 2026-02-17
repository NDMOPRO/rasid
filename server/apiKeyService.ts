// API Key Service module - manages API key issuance and permissions
import * as db from "./db";
import crypto from "crypto";

export const API_PERMISSIONS = [
  "read:leaks",
  "write:leaks",
  "read:scans",
  "write:scans",
  "read:reports",
  "write:reports",
  "admin",
] as const;

export async function issueApiKey(params: {
  name: string;
  permissions: string[];
  userId: number;
  expiresInDays?: number;
}) {
  const key = `rsd_${crypto.randomBytes(32).toString("hex")}`;
  const hashedKey = crypto.createHash("sha256").update(key).digest("hex");
  
  return {
    key, // Only shown once
    hashedKey,
    name: params.name,
    permissions: params.permissions,
  };
}
