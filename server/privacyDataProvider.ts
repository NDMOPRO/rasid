/**
 * Privacy Data Provider — reads privacy domains from compressed JSON
 * Used as fallback when database is not available
 */
import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";

interface PrivacyDomainRecord {
  id?: number;
  domain: string;
  status: string;
  workingUrl?: string;
  finalUrl?: string;
  httpsWww?: string;
  httpsNoWww?: string;
  httpWww?: string;
  httpNoWww?: string;
  nameAr?: string;
  nameEn?: string;
  title?: string;
  description?: string;
  classification?: string;
  email?: string;
  phone?: string;
  mxRecords?: string;
  cms?: string;
  sslStatus?: string;
  policyUrl?: string;
  policyTitle?: string;
  policyStatusCode?: string;
  policyLanguage?: string;
  policyLastUpdate?: string;
  entityName?: string;
  entityEmail?: string;
  entityPhone?: string;
  entityAddress?: string;
  dpo?: string;
  contactForm?: string;
  internalLinks?: string;
  policyWordCount?: number;
  policyCharCount?: number;
  robotsStatus?: string;
  discoveryMethod?: string;
  policyConfidence?: string;
  mentionsDataTypes?: number;
  dataTypesList?: string;
  mentionsPurpose?: number;
  purposeList?: string;
  mentionsLegalBasis?: number;
  mentionsRights?: number;
  rightsList?: string;
  mentionsRetention?: number;
  mentionsThirdParties?: number;
  thirdPartiesList?: string;
  mentionsCrossBorder?: number;
  mentionsSecurity?: number;
  mentionsCookies?: number;
  mentionsChildren?: number;
  policyFinalUrl?: string;
  crawlStatus?: string;
  screenshotUrl?: string;
  fullTextPath?: string;
  category?: string;
  complianceScore?: number;
  complianceStatus?: string;
}

let _cachedData: PrivacyDomainRecord[] | null = null;

function loadData(): PrivacyDomainRecord[] {
  if (_cachedData) return _cachedData;

  const gzPath = path.join(process.cwd(), "server", "seed-privacy-data.json.gz");
  const jsonPath = path.join(process.cwd(), "server", "seed-privacy-data.json");

  try {
    let raw: string;
    if (fs.existsSync(gzPath)) {
      const buf = fs.readFileSync(gzPath);
      raw = zlib.gunzipSync(buf).toString("utf-8");
    } else if (fs.existsSync(jsonPath)) {
      raw = fs.readFileSync(jsonPath, "utf-8");
    } else {
      console.warn("[PrivacyData] No data file found");
      return [];
    }

    const data: PrivacyDomainRecord[] = JSON.parse(raw);
    // Assign IDs
    _cachedData = data.map((d, i) => ({ ...d, id: i + 1 }));
    console.log(`[PrivacyData] Loaded ${_cachedData.length} domains from file`);
    return _cachedData;
  } catch (err) {
    console.error("[PrivacyData] Failed to load:", err);
    return [];
  }
}

export function getPrivacyDomainsFromFile(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  complianceStatus?: string;
}): { items: PrivacyDomainRecord[]; total: number } {
  const data = loadData();
  let filtered = data;

  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.domain?.toLowerCase().includes(s) ||
        d.nameAr?.toLowerCase().includes(s) ||
        d.nameEn?.toLowerCase().includes(s) ||
        d.entityName?.toLowerCase().includes(s) ||
        d.category?.toLowerCase().includes(s)
    );
  }

  if (params.category && params.category !== "all") {
    filtered = filtered.filter((d) => d.category === params.category);
  }

  if (params.complianceStatus && params.complianceStatus !== "all") {
    filtered = filtered.filter((d) => d.complianceStatus === params.complianceStatus);
  }

  const total = filtered.length;
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;
  const items = filtered.slice(offset, offset + limit);

  return { items, total };
}

export function getPrivacyDomainByIdFromFile(id: number): PrivacyDomainRecord | null {
  const data = loadData();
  return data.find((d) => d.id === id) || null;
}

export function getPrivacyDomainStatsFromFile() {
  const data = loadData();
  const total = data.length;
  const working = data.filter((d) => d.status === "working").length;
  const hasPolicy = data.filter((d) => d.policyUrl && d.policyUrl.trim() !== "").length;
  const hasSSL = data.filter((d) => d.sslStatus === "valid").length;

  // Compliance breakdown
  const compliant = data.filter((d) => d.complianceStatus === "compliant").length;
  const partial = data.filter((d) => d.complianceStatus === "partial").length;
  const nonCompliant = data.filter((d) => d.complianceStatus === "non_compliant").length;
  const unknown = total - compliant - partial - nonCompliant;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  for (const d of data) {
    const cat = d.category || "غير مصنف";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }
  const categories = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Average compliance score
  const scored = data.filter((d) => d.complianceScore != null && d.complianceScore > 0);
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((sum, d) => sum + (d.complianceScore || 0), 0) / scored.length)
    : 0;

  return {
    total,
    working,
    hasPolicy,
    hasSSL,
    compliant,
    partial,
    nonCompliant,
    unknown,
    avgScore,
    categories,
  };
}
