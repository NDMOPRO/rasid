// @ts-nocheck
// Data loaded from CDN
const BREACH_DATA_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/bUJvkvCfCGUNRpsw.json";
let rawData: any[] = [];
try {
  const resp = await fetch(BREACH_DATA_URL);
  rawData = await resp.json();
} catch(e) { /* fallback empty */ }

export interface BreachOverview {
  discovery_date: string;
  attack_method: string;
  attack_method_ar: string;
  attack_method_en: string;
  exposed_records: number;
  data_size: string;
  source_platform: string;
  source_url: string;
  severity: string;
  confidence_level: string;
}

export interface LeakSource {
  platform: string;
  url: string;
  discovery_date: string;
  price?: string;
  price_usd?: number;
}

export interface AttackerInfo {
  name: string;
  aliases: string[];
  known_targets: string[];
  threat_level: string;
  profile_url: string;
}

export interface AiAnalysis {
  analysis_date: string;
  impact_assessment: string;
  impact_assessment_en: string;
  confidence_percentage: number;
  executive_summary: string;
  executive_summary_en: string;
  recommendations: string[];
  recommendations_en: string[];
  pdpl_analysis: {
    violated_articles: string[];
    estimated_fine_sar: string;
    compliance_gaps: string[];
    compliance_gaps_en: string[];
    required_actions: string[];
    required_actions_en: string[];
  };
  confidence_level: string;
}

export interface PdplAnalysis {
  violated_articles: string[];
  estimated_fine_sar: string;
  compliance_gaps: string[];
  compliance_gaps_en: string[];
  required_actions: string[];
  required_actions_en: string[];
}

export interface BreachRecord {
  id: string;
  victim: string;
  title_en: string;
  title_ar: string;
  date: string;
  category: string;
  overview: BreachOverview;
  leak_source: LeakSource;
  attacker_info: AttackerInfo;
  data_types: string[];
  data_types_ar: string[];
  data_types_count: number;
  data_sensitivity: string;
  data_samples: any[];
  sample_fields: string[];
  sample_fields_en: string[];
  total_sample_records: number;
  ai_analysis: AiAnalysis;
  pdpl_analysis: PdplAnalysis;
  description_en: string;
  description_ar: string;
  sector: string;
  threat_actor: string;
  sources: any[];
}

export const breachRecords: BreachRecord[] = rawData as BreachRecord[];

export const totalIncidents = breachRecords.length;
export const totalRecordsExposed = breachRecords.reduce(
  (sum, r) => sum + (r.overview?.exposed_records || 0),
  0
);

export const allSectors = [...new Set(breachRecords.map((r) => r.sector).filter(Boolean))];
export const allThreatActors = [...new Set(breachRecords.map((r) => r.threat_actor).filter(Boolean))];
export const allPlatforms = [...new Set(breachRecords.map((r) => r.overview?.source_platform).filter(Boolean))];
export const allDataTypes = [...new Set(breachRecords.flatMap((r) => r.data_types || []))];
export const allDataTypesAr = [...new Set(breachRecords.flatMap((r) => r.data_types_ar || []))];
export const allSeverities = [...new Set(breachRecords.map((r) => r.overview?.severity).filter(Boolean))];
export const allAttackMethods = [...new Set(breachRecords.map((r) => r.overview?.attack_method_en).filter(Boolean))];
