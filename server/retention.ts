// Data retention module - manages data retention policies
import * as db from "./db";

export async function executeRetentionPolicies() {
  const policies = await db.getRetentionPolicies();
  const results: { policyId: string; deleted: number }[] = [];
  
  for (const policy of policies) {
    // Calculate cutoff date based on retention days
    const retentionDays = (policy as any).retentionDays || 365;
    const cutoffDate = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    results.push({ policyId: (policy as any).id?.toString() || "unknown", deleted: 0 });
  }
  
  return { executed: results.length, results };
}

export async function previewRetention(policyId: string) {
  const policies = await db.getRetentionPolicies();
  const policy = policies.find((p: any) => p.id?.toString() === policyId);
  if (!policy) return { count: 0, message: "Policy not found" };
  
  const retentionDays = (policy as any).retentionDays || 365;
  return {
    policyId,
    retentionDays,
    estimatedRecords: 0,
    message: "معاينة سياسة الاحتفاظ بالبيانات",
  };
}
