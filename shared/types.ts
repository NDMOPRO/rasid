/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ═══ Smart Monitor Domain Types ═══

export type Domain = 'leaks' | 'privacy';

export interface PageContextPack {
  route: string;
  pageId: string;
  activeFilters: Record<string, any>;
  currentEntityId?: number;
  currentEntityType?: string;
  availableActions: string[];
  userRole: string;
  featureFlags: Record<string, boolean>;
  domain: Domain;
}

export const CASE_STATUSES = ['حالة رصد', 'قيد التحقق', 'تسرب مؤكد', 'مغلق'] as const;
export type CaseStatus = typeof CASE_STATUSES[number];

export const DOMAIN_LABELS: Record<Domain, { ar: string; en: string }> = {
  leaks: { ar: 'منصة التسربات', en: 'Leaks Platform' },
  privacy: { ar: 'منصة الخصوصية', en: 'Privacy Platform' },
};
