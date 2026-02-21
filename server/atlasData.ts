/**
 * Atlas Breach Data — Server-side access for Smart Rasid AI
 * Reads from shared/breachRawData.json (110 real Saudi breach incidents)
 */
import fs from "fs";
import path from "path";

interface AtlasRecord {
  id: string;
  victim: string;
  title_en: string;
  title_ar: string;
  date: string;
  category: string;
  sector: string;
  overview: {
    discovery_date: string;
    attack_method: string;
    attack_method_ar: string;
    exposed_records: number;
    data_size: string;
    source_platform: string;
    source_url: string;
    severity: string;
    confidence_level: string;
  };
  leak_source: any;
  attacker_info: {
    alias: string;
    price_usd: number;
    price_display: string;
    platform: string;
    group: string;
    known_attacks: string;
  };
  threat_actor: string;
  data_types: string[];
  data_types_ar: string[];
  data_types_count: number;
  data_sensitivity: string;
  data_samples: any;
  sample_fields: string[];
  sample_fields_en: string[];
  total_sample_records: number;
  ai_analysis: any;
  pdpl_analysis: any;
  description_en: string;
  description_ar: string;
  sources: Array<{ name: string; url: string }>;
  evidence_images: Array<{ url: string; description: string }>;
}

let _cachedData: AtlasRecord[] | null = null;

function loadAtlasData(): AtlasRecord[] {
  if (_cachedData) return _cachedData;
  try {
    const filePath = path.join(process.cwd(), "shared", "breachRawData.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    _cachedData = JSON.parse(raw) as AtlasRecord[];
    return _cachedData;
  } catch (err) {
    console.error("[AtlasData] Failed to load breachRawData.json:", err);
    return [];
  }
}

/**
 * Query atlas breaches with filters
 */
export function queryAtlasBreaches(params: {
  sector?: string;
  severity?: string;
  platform?: string;
  threat_actor?: string;
  search?: string;
  limit?: number;
}): any {
  const data = loadAtlasData();
  let filtered = [...data];

  if (params.sector) {
    const s = params.sector.toLowerCase();
    filtered = filtered.filter(r => 
      r.sector?.toLowerCase().includes(s) || 
      r.category?.toLowerCase().includes(s)
    );
  }

  if (params.severity && params.severity !== "all") {
    const sev = params.severity.toLowerCase();
    filtered = filtered.filter(r => r.overview?.severity?.toLowerCase() === sev);
  }

  if (params.platform) {
    const p = params.platform.toLowerCase();
    filtered = filtered.filter(r => 
      r.overview?.source_platform?.toLowerCase().includes(p) ||
      r.attacker_info?.platform?.toLowerCase().includes(p)
    );
  }

  if (params.threat_actor) {
    const ta = params.threat_actor.toLowerCase();
    filtered = filtered.filter(r => 
      r.threat_actor?.toLowerCase().includes(ta) ||
      r.attacker_info?.alias?.toLowerCase().includes(ta)
    );
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(r =>
      r.title_ar?.toLowerCase().includes(q) ||
      r.title_en?.toLowerCase().includes(q) ||
      r.victim?.toLowerCase().includes(q) ||
      r.description_ar?.toLowerCase().includes(q) ||
      r.description_en?.toLowerCase().includes(q) ||
      r.sector?.toLowerCase().includes(q)
    );
  }

  const limit = params.limit || 20;
  const limited = filtered.slice(0, limit);

  return {
    total: filtered.length,
    showing: limited.length,
    breaches: limited.map(r => ({
      id: r.id,
      title_ar: r.title_ar,
      title_en: r.title_en,
      victim: r.victim,
      date: r.date,
      sector: r.sector,
      severity: r.overview?.severity,
      records_exposed: r.overview?.exposed_records,
      platform: r.overview?.source_platform,
      threat_actor: r.threat_actor || r.attacker_info?.alias,
      price: r.attacker_info?.price_display,
      data_types_count: r.data_types_count,
      attack_method: r.overview?.attack_method_ar || r.overview?.attack_method,
    })),
  };
}

/**
 * Get full details of a specific atlas breach
 */
export function getAtlasBreachDetails(breachId: string): any {
  const data = loadAtlasData();
  const record = data.find(r => r.id === breachId);
  if (!record) return { error: `لم يتم العثور على حالة رصد بمعرّف ${breachId}` };

  return {
    id: record.id,
    title_ar: record.title_ar,
    title_en: record.title_en,
    victim: record.victim,
    date: record.date,
    sector: record.sector,
    category: record.category,
    overview: {
      discovery_date: record.overview?.discovery_date,
      attack_method: record.overview?.attack_method_ar || record.overview?.attack_method,
      attack_method_en: record.overview?.attack_method,
      exposed_records: record.overview?.exposed_records,
      data_size: record.overview?.data_size,
      source_platform: record.overview?.source_platform,
      source_url: record.overview?.source_url,
      severity: record.overview?.severity,
      confidence_level: record.overview?.confidence_level,
    },
    attacker: {
      alias: record.attacker_info?.alias || record.threat_actor,
      price: record.attacker_info?.price_display,
      price_usd: record.attacker_info?.price_usd,
      platform: record.attacker_info?.platform,
      group: record.attacker_info?.group,
      known_attacks: record.attacker_info?.known_attacks,
    },
    data_types: record.data_types,
    data_types_ar: record.data_types_ar,
    data_types_count: record.data_types_count,
    data_sensitivity: record.data_sensitivity,
    data_samples: record.data_samples,
    sample_fields: record.sample_fields,
    total_sample_records: record.total_sample_records,
    description_ar: record.description_ar,
    description_en: record.description_en,
    ai_analysis: record.ai_analysis,
    pdpl_analysis: record.pdpl_analysis,
    sources: record.sources,
    evidence_images: record.evidence_images,
  };
}

/**
 * Get atlas statistics summary
 */
export function getAtlasStats(): any {
  const data = loadAtlasData();
  
  const totalRecords = data.reduce((sum, r) => sum + (r.overview?.exposed_records || 0), 0);
  
  // Severity distribution
  const severityDist: Record<string, number> = {};
  data.forEach(r => {
    const sev = r.overview?.severity || "Unknown";
    severityDist[sev] = (severityDist[sev] || 0) + 1;
  });

  // Sector distribution
  const sectorDist: Record<string, number> = {};
  data.forEach(r => {
    const sec = r.sector || "غير محدد";
    sectorDist[sec] = (sectorDist[sec] || 0) + 1;
  });

  // Top threat actors
  const actorDist: Record<string, number> = {};
  data.forEach(r => {
    const actor = r.threat_actor || r.attacker_info?.alias || "مجهول";
    if (actor) actorDist[actor] = (actorDist[actor] || 0) + 1;
  });
  const topActors = Object.entries(actorDist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Platform distribution
  const platformDist: Record<string, number> = {};
  data.forEach(r => {
    const p = r.overview?.source_platform || "غير محدد";
    platformDist[p] = (platformDist[p] || 0) + 1;
  });

  // Monthly timeline
  const monthlyTimeline: Record<string, number> = {};
  data.forEach(r => {
    const date = r.date || r.overview?.discovery_date;
    if (date) {
      const month = date.substring(0, 7); // YYYY-MM
      monthlyTimeline[month] = (monthlyTimeline[month] || 0) + 1;
    }
  });

  // Data types frequency
  const dataTypesFreq: Record<string, number> = {};
  data.forEach(r => {
    (r.data_types || []).forEach((dt: string) => {
      dataTypesFreq[dt] = (dataTypesFreq[dt] || 0) + 1;
    });
  });
  const topDataTypes = Object.entries(dataTypesFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([type, count]) => ({ type, count }));

  // Total asking price
  const totalPrice = data.reduce((sum, r) => sum + (r.attacker_info?.price_usd || 0), 0);

  return {
    total_incidents: data.length,
    total_records_exposed: totalRecords,
    total_asking_price_usd: totalPrice,
    unique_sectors: Object.keys(sectorDist).length,
    unique_threat_actors: Object.keys(actorDist).length,
    unique_data_types: Object.keys(dataTypesFreq).length,
    severity_distribution: severityDist,
    sector_distribution: sectorDist,
    platform_distribution: platformDist,
    top_threat_actors: topActors,
    top_data_types: topDataTypes,
    monthly_timeline: monthlyTimeline,
  };
}

/**
 * Analyze atlas trends
 */
export function analyzeAtlasTrends(analysisType: string): any {
  const data = loadAtlasData();

  switch (analysisType) {
    case "sector_comparison": {
      const sectors: Record<string, { count: number; records: number; avgRecords: number; severities: Record<string, number> }> = {};
      data.forEach(r => {
        const sec = r.sector || "غير محدد";
        if (!sectors[sec]) sectors[sec] = { count: 0, records: 0, avgRecords: 0, severities: {} };
        sectors[sec].count++;
        sectors[sec].records += r.overview?.exposed_records || 0;
        const sev = r.overview?.severity || "Unknown";
        sectors[sec].severities[sev] = (sectors[sec].severities[sev] || 0) + 1;
      });
      Object.values(sectors).forEach(s => { s.avgRecords = Math.round(s.records / s.count); });
      return { analysis: "مقارنة القطاعات", sectors };
    }

    case "timeline": {
      const monthly: Record<string, { count: number; records: number; critical: number }> = {};
      data.forEach(r => {
        const date = r.date || r.overview?.discovery_date;
        if (date) {
          const month = date.substring(0, 7);
          if (!monthly[month]) monthly[month] = { count: 0, records: 0, critical: 0 };
          monthly[month].count++;
          monthly[month].records += r.overview?.exposed_records || 0;
          if (r.overview?.severity?.toLowerCase() === "critical") monthly[month].critical++;
        }
      });
      return { analysis: "التطور الزمني", monthly };
    }

    case "threat_actors": {
      const actors: Record<string, { count: number; sectors: Set<string>; platforms: Set<string>; totalRecords: number }> = {};
      data.forEach(r => {
        const actor = r.threat_actor || r.attacker_info?.alias || "مجهول";
        if (!actors[actor]) actors[actor] = { count: 0, sectors: new Set(), platforms: new Set(), totalRecords: 0 };
        actors[actor].count++;
        if (r.sector) actors[actor].sectors.add(r.sector);
        if (r.overview?.source_platform) actors[actor].platforms.add(r.overview.source_platform);
        actors[actor].totalRecords += r.overview?.exposed_records || 0;
      });
      const result = Object.entries(actors).map(([name, info]) => ({
        name,
        count: info.count,
        sectors: Array.from(info.sectors),
        platforms: Array.from(info.platforms),
        totalRecords: info.totalRecords,
      })).sort((a, b) => b.count - a.count);
      return { analysis: "تحليل المهاجمين", actors: result };
    }

    case "data_types": {
      const types: Record<string, { count: number; sectors: Set<string> }> = {};
      data.forEach(r => {
        (r.data_types || []).forEach((dt: string) => {
          if (!types[dt]) types[dt] = { count: 0, sectors: new Set() };
          types[dt].count++;
          if (r.sector) types[dt].sectors.add(r.sector);
        });
      });
      const result = Object.entries(types).map(([type, info]) => ({
        type,
        count: info.count,
        sectors: Array.from(info.sectors),
      })).sort((a, b) => b.count - a.count);
      return { analysis: "تحليل أنواع البيانات المعروضة", data_types: result };
    }

    case "severity_distribution": {
      const dist: Record<string, { count: number; totalRecords: number; sectors: string[] }> = {};
      data.forEach(r => {
        const sev = r.overview?.severity || "Unknown";
        if (!dist[sev]) dist[sev] = { count: 0, totalRecords: 0, sectors: [] };
        dist[sev].count++;
        dist[sev].totalRecords += r.overview?.exposed_records || 0;
        if (r.sector && !dist[sev].sectors.includes(r.sector)) dist[sev].sectors.push(r.sector);
      });
      return { analysis: "توزيع مستوى التأثير", distribution: dist };
    }

    case "platform_analysis": {
      const platforms: Record<string, { count: number; actors: Set<string>; sectors: Set<string> }> = {};
      data.forEach(r => {
        const p = r.overview?.source_platform || "غير محدد";
        if (!platforms[p]) platforms[p] = { count: 0, actors: new Set(), sectors: new Set() };
        platforms[p].count++;
        const actor = r.threat_actor || r.attacker_info?.alias;
        if (actor) platforms[p].actors.add(actor);
        if (r.sector) platforms[p].sectors.add(r.sector);
      });
      const result = Object.entries(platforms).map(([name, info]) => ({
        name,
        count: info.count,
        actors: Array.from(info.actors),
        sectors: Array.from(info.sectors),
      })).sort((a, b) => b.count - a.count);
      return { analysis: "تحليل المنصات", platforms: result };
    }

    case "pdpl_impact": {
      const violations: Record<string, number> = {};
      let totalFine = 0;
      data.forEach(r => {
        const pdpl = r.pdpl_analysis;
        if (pdpl) {
          if (typeof pdpl === "object") {
            const articles = pdpl.violated_articles || pdpl.articles || [];
            if (Array.isArray(articles)) {
              articles.forEach((a: any) => {
                const name = typeof a === "string" ? a : a.article || a.name;
                if (name) violations[name] = (violations[name] || 0) + 1;
              });
            }
            totalFine += pdpl.estimated_fine || pdpl.max_fine || 0;
          }
        }
      });
      return { analysis: "تأثير نظام PDPL", violations, estimated_total_fines: totalFine };
    }

    default:
      return { error: `نوع تحليل غير معروف: ${analysisType}` };
  }
}
