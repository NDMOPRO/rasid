// @ts-nocheck
import { breachRecords, BreachRecord } from "./breachData";

function topN(map: Record<string, number>, n = 10) {
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

function countBy(arr: string[]) {
  const m: Record<string, number> = {};
  arr.forEach((v) => { if (v) m[v] = (m[v] || 0) + 1; });
  return m;
}

export function getPiiFrequency(lang: "en" | "ar" = "ar", records?: BreachRecord[]) {
  const data = records || breachRecords;
  const field = lang === "ar" ? "data_types_ar" : "data_types";
  const all = data.flatMap((r) => (r as any)[field] || []);
  return topN(countBy(all), 30);
}

export function getPiiCoOccurrence(topK = 15, records?: BreachRecord[]) {
  const data = records || breachRecords;
  const freq = getPiiFrequency("ar", data);
  const topTypes = freq.slice(0, topK).map((t) => t.name);
  const matrix: { type1: string; type2: string; count: number }[] = [];
  data.forEach((r) => {
    const types = (r.data_types_ar || []).filter((t: string) => topTypes.includes(t));
    for (let i = 0; i < types.length; i++)
      for (let j = i + 1; j < types.length; j++)
        matrix.push({ type1: types[i], type2: types[j], count: 1 });
  });
  const agg: Record<string, number> = {};
  matrix.forEach((m) => {
    const k = `${m.type1}||${m.type2}`;
    agg[k] = (agg[k] || 0) + 1;
  });
  return Object.entries(agg)
    .map(([k, count]) => { const [type1, type2] = k.split("||"); return { type1, type2, count }; })
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
}

export function getSectorBreakdown(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const sectorMap: Record<string, { count: number; records: number }> = {};
  data.forEach((r) => {
    const s = r.sector || "غير محدد";
    if (!sectorMap[s]) sectorMap[s] = { count: 0, records: 0 };
    sectorMap[s].count++;
    sectorMap[s].records += r.overview?.exposed_records || 0;
  });
  return Object.entries(sectorMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count);
}

export function getSectorPiiMatrix(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const matrix: Record<string, Record<string, number>> = {};
  data.forEach((r) => {
    const s = r.sector || "غير محدد";
    if (!matrix[s]) matrix[s] = {};
    (r.data_types_ar || []).forEach((t: string) => { matrix[s][t] = (matrix[s][t] || 0) + 1; });
  });
  return matrix;
}

export function getTimelineData(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const monthly: Record<string, { count: number; records: number }> = {};
  data.forEach((r) => {
    const d = r.date || r.overview?.discovery_date;
    if (!d) return;
    const month = d.substring(0, 7);
    if (!monthly[month]) monthly[month] = { count: 0, records: 0 };
    monthly[month].count++;
    monthly[month].records += r.overview?.exposed_records || 0;
  });
  return Object.entries(monthly).map(([month, v]) => ({ month, ...v })).sort((a, b) => a.month.localeCompare(b.month));
}

export function getYearlyTrend(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const yearly: Record<string, number> = {};
  data.forEach((r) => {
    const d = r.date || r.overview?.discovery_date;
    if (!d) return;
    const year = d.substring(0, 4);
    yearly[year] = (yearly[year] || 0) + 1;
  });
  return Object.entries(yearly).map(([year, count]) => ({ year, count })).sort((a, b) => a.year.localeCompare(b.year));
}

export function getThreatActorProfiles(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const actors: Record<string, { count: number; records: number; sectors: Set<string>; methods: Set<string> }> = {};
  data.forEach((r) => {
    const a = r.threat_actor || r.attacker_info?.name || "Unknown";
    if (!actors[a]) actors[a] = { count: 0, records: 0, sectors: new Set(), methods: new Set() };
    actors[a].count++;
    actors[a].records += r.overview?.exposed_records || 0;
    if (r.sector) actors[a].sectors.add(r.sector);
    if (r.overview?.attack_method_en) actors[a].methods.add(r.overview.attack_method_en);
  });
  return Object.entries(actors)
    .map(([name, v]) => ({ name, count: v.count, records: v.records, sectors: [...v.sectors], methods: [...v.methods] }))
    .sort((a, b) => b.count - a.count);
}

export function getImpactDistribution(records?: BreachRecord[]) {
  const data = records || breachRecords;
  return data
    .map((r) => ({
      id: r.id, title: r.title_ar,
      records: r.overview?.exposed_records || 0,
      severity: r.overview?.severity || "Unknown",
      sector: r.sector, piiCount: r.data_types_count || 0,
      fine: parseFloat(String(r.pdpl_analysis?.estimated_fine_sar || r.ai_analysis?.pdpl_analysis?.estimated_fine_sar || "0").replace(/[^0-9.]/g, "")) || 0,
    }))
    .sort((a, b) => b.records - a.records);
}

export function getSeverityBreakdown(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const sev = countBy(data.map((r) => r.overview?.severity).filter(Boolean) as string[]);
  return Object.entries(sev).map(([name, count]) => ({ name, count }));
}

export function getPlatformDistribution(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const platforms = countBy(data.map((r) => r.overview?.source_platform).filter(Boolean) as string[]);
  return topN(platforms, 10);
}

export function getPriceAnalysis(records?: BreachRecord[]) {
  const data = records || breachRecords;
  return data
    .filter((r) => r.leak_source?.price_usd && r.leak_source.price_usd > 0)
    .map((r) => ({ id: r.id, title: r.title_ar, price: r.leak_source.price_usd, records: r.overview?.exposed_records || 0, pricePerRecord: r.leak_source.price_usd / Math.max(r.overview?.exposed_records || 1, 1) }))
    .sort((a, b) => (b.price || 0) - (a.price || 0));
}

export function getAttackMethodBreakdown(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const methods = countBy(data.map((r) => r.overview?.attack_method_en || r.overview?.attack_method).filter(Boolean) as string[]);
  return topN(methods, 15);
}

export function getPdplViolations(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const articles: Record<string, number> = {};
  let totalFines = 0;
  data.forEach((r) => {
    const pdpl = r.pdpl_analysis || r.ai_analysis?.pdpl_analysis;
    if (!pdpl) return;
    const va = pdpl.violated_articles;
    const artList = Array.isArray(va) ? va : typeof va === 'string' ? va.replace(/Articles?\s*/i, '').split(/[,،]+/).map((s: string) => s.trim()).filter(Boolean) : [];
    artList.forEach((a: string) => { articles[`Article ${a.replace(/^Article\s*/i, '')}`] = (articles[`Article ${a.replace(/^Article\s*/i, '')}`] || 0) + 1; });
    const fineStr = String(pdpl.estimated_fine_sar || "0");
    const fineParts = fineStr.split(/[-–]/).map((s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0).filter((n: number) => n > 0);
    const fine = fineParts.length > 0 ? fineParts.reduce((a: number, b: number) => a + b, 0) / fineParts.length : 0;
    totalFines += fine;
  });
  return {
    articles: topN(articles, 20), totalFines,
    incidentsWithViolations: data.filter((r) => { const pdpl = r.pdpl_analysis || r.ai_analysis?.pdpl_analysis; return pdpl?.violated_articles?.length > 0; }).length,
  };
}

export function getComplianceGaps(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const gaps: Record<string, number> = {};
  data.forEach((r) => {
    const pdpl = r.pdpl_analysis || r.ai_analysis?.pdpl_analysis;
    (pdpl?.compliance_gaps || []).forEach((g: string) => { gaps[g] = (gaps[g] || 0) + 1; });
  });
  return topN(gaps, 15);
}

export function getRecommendationFrequency(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const recs: Record<string, number> = {};
  data.forEach((r) => {
    (r.ai_analysis?.recommendations || []).forEach((rec: string) => { recs[rec] = (recs[rec] || 0) + 1; });
  });
  return topN(recs, 20);
}

export function getCampaigns(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const groups: Record<string, BreachRecord[]> = {};
  data.forEach((r) => {
    const actor = r.threat_actor || r.attacker_info?.name || "Unknown";
    if (!groups[actor]) groups[actor] = [];
    groups[actor].push(r);
  });
  return Object.entries(groups)
    .filter(([, recs]) => recs.length >= 2)
    .map(([actor, recs]) => {
      const sorted = recs.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      return {
        actor, incidents: recs.length,
        totalRecords: recs.reduce((s, r) => s + (r.overview?.exposed_records || 0), 0),
        sectors: [...new Set(recs.map((r) => r.sector).filter(Boolean))],
        dateRange: `${sorted[0]?.date || "?"} → ${sorted[sorted.length - 1]?.date || "?"}`,
        breaches: sorted,
      };
    })
    .sort((a, b) => b.incidents - a.incidents);
}

export function compareIncidents(ids: string[], records?: BreachRecord[]) {
  const data = records || breachRecords;
  return data.filter((r) => ids.includes(r.id));
}

export function getExecutiveSummary(records?: BreachRecord[]) {
  const data = records || breachRecords;
  const totalRecords = data.reduce((s, r) => s + (r.overview?.exposed_records || 0), 0);
  const sectors = getSectorBreakdown(data);
  const actors = getThreatActorProfiles(data);
  const platforms = getPlatformDistribution(data);
  const severities = getSeverityBreakdown(data);
  const pdpl = getPdplViolations(data);
  return {
    totalIncidents: data.length, totalRecords,
    totalSectors: sectors.length, totalActors: actors.length,
    totalPiiTypes: new Set(data.flatMap((r) => r.data_types_ar || [])).size,
    topSector: sectors[0] || { name: "N/A", count: 0 },
    topAttacker: actors[0] || { name: "N/A", count: 0 },
    topPlatform: platforms[0] || { name: "N/A", count: 0 },
    topMethod: getAttackMethodBreakdown(data)[0] || { name: "N/A", count: 0 },
    severities, estimatedFines: pdpl.totalFines,
    criticalCount: severities.find((s) => s.name === "Critical")?.count || 0,
    highCount: severities.find((s) => s.name === "High")?.count || 0,
  };
}

export function getIncidentById(id: string) {
  return breachRecords.find((r) => r.id === id);
}
