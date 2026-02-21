/**
 * Chart Data Engine — 12 data types for chart generation
 * Processes breach incidents into chart-ready data structures
 */

export class ChartDataEngine {
  public incidents: any[];

  constructor(incidents: any[]) {
    this.incidents = incidents || [];
  }

  // 1. Sector Distribution
  getSectorDistribution(): { labels: string[]; data: number[] } {
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      const sector = i.sectorAr || i.sector || "غير محدد";
      counts[sector] = (counts[sector] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { labels: sorted.map((s) => s[0]), data: sorted.map((s) => s[1]) };
  }

  // 2. Source Distribution
  getSourceDistribution(): { labels: string[]; data: number[] } {
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      const source = i.source || "غير محدد";
      counts[source] = (counts[source] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { labels: sorted.map((s) => s[0]), data: sorted.map((s) => s[1]) };
  }

  // 3. Severity Distribution
  getSeverityDistribution(): { labels: string[]; data: number[] } {
    const order = ["Critical", "High", "Medium", "Low"];
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      const sev = i.severity || "Unknown";
      counts[sev] = (counts[sev] || 0) + 1;
    });
    return {
      labels: order.filter((s) => counts[s]),
      data: order.filter((s) => counts[s]).map((s) => counts[s]),
    };
  }

  // 4. Monthly Trend
  getMonthlyTrend(): { labels: string[]; incidents: number[]; records: number[] } {
    const timeline: Record<string, { incidents: number; records: number }> = {};
    this.incidents.forEach((i) => {
      const date = new Date(i.detectedAt || i.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!timeline[key]) timeline[key] = { incidents: 0, records: 0 };
      timeline[key].incidents++;
      timeline[key].records += i.recordCount || 0;
    });
    const sortedKeys = Object.keys(timeline).sort();
    return {
      labels: sortedKeys,
      incidents: sortedKeys.map((k) => timeline[k].incidents),
      records: sortedKeys.map((k) => timeline[k].records),
    };
  }

  // 5. Top Incidents by Records
  getTopIncidentsByRecords(limit = 10): { labels: string[]; data: number[] } {
    const sorted = [...this.incidents].sort((a, b) => (b.recordCount || 0) - (a.recordCount || 0)).slice(0, limit);
    return {
      labels: sorted.map((i) => (i.titleAr || i.title || "").substring(0, 30)),
      data: sorted.map((i) => i.recordCount || 0),
    };
  }

  // 6. PII Distribution
  getPiiDistribution(limit = 8): { labels: string[]; data: number[] } {
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      (i.piiTypes || []).forEach((pii: string) => {
        counts[pii] = (counts[pii] || 0) + 1;
      });
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return { labels: sorted.map((p) => p[0]), data: sorted.map((p) => p[1]) };
  }

  // 7. Breach Method Distribution
  getBreachMethodDistribution(limit = 7): { labels: string[]; data: number[] } {
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      const method = i.breachMethodAr || i.breachMethod || "غير معروف";
      counts[method] = (counts[method] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return { labels: sorted.map((m) => m[0]), data: sorted.map((m) => m[1]) };
  }

  // 8. Region Distribution
  getRegionDistribution(limit = 8): { labels: string[]; data: number[] } {
    const counts: Record<string, number> = {};
    this.incidents.forEach((i) => {
      const region = i.regionAr || i.region || "غير محددة";
      counts[region] = (counts[region] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
    return { labels: sorted.map((r) => r[0]), data: sorted.map((r) => r[1]) };
  }

  // 9. Fine Distribution
  getFineDistribution(): { labels: string[]; data: number[] } {
    const ranges: Record<string, number> = {
      "0 - 100K": 0,
      "100K - 500K": 0,
      "500K - 1M": 0,
      "1M - 5M": 0,
      "5M+": 0,
    };
    this.incidents.forEach((i) => {
      const fine = i.estimatedFineSar || 0;
      if (fine <= 100000) ranges["0 - 100K"]++;
      else if (fine <= 500000) ranges["100K - 500K"]++;
      else if (fine <= 1000000) ranges["500K - 1M"]++;
      else if (fine <= 5000000) ranges["1M - 5M"]++;
      else ranges["5M+"]++;
    });
    return { labels: Object.keys(ranges), data: Object.values(ranges) };
  }

  // 10. Sector Comparison
  compareSectors(sectors: string[]): { labels: string[]; incidentCounts: number[]; avgRecords: number[] } {
    const results = sectors.map((sector) => {
      const sectorLower = sector.toLowerCase();
      const sectorIncidents = this.incidents.filter(
        (i) =>
          (i.sector || "").toLowerCase().includes(sectorLower) ||
          (i.sectorAr || "").includes(sector)
      );
      const totalRecords = sectorIncidents.reduce((sum: number, i: any) => sum + (i.recordCount || 0), 0);
      return {
        sector,
        incidentCount: sectorIncidents.length,
        avgRecords: sectorIncidents.length > 0 ? totalRecords / sectorIncidents.length : 0,
      };
    });
    return {
      labels: results.map((r) => r.sector),
      incidentCounts: results.map((r) => r.incidentCount),
      avgRecords: results.map((r) => r.avgRecords),
    };
  }

  // 11. Sector Radar Data
  getSectorRadarData(sectorName: string): { labels: string[]; data: number[] } {
    const sectorLower = sectorName.toLowerCase();
    const sectorIncidents = this.incidents.filter(
      (i) =>
        (i.sector || "").toLowerCase().includes(sectorLower) ||
        (i.sectorAr || "").includes(sectorName)
    );
    const totalIncidents = this.incidents.length;
    const totalRecordsAll = this.incidents.reduce((sum: number, i: any) => sum + (i.recordCount || 0), 0);
    const sectorRecords = sectorIncidents.reduce((sum: number, i: any) => sum + (i.recordCount || 0), 0);
    const criticalCount = sectorIncidents.filter((i: any) => i.severity === "Critical").length;
    const highCount = sectorIncidents.filter((i: any) => i.severity === "High").length;

    const incidentsRatio = totalIncidents > 0 ? (sectorIncidents.length / totalIncidents) * 100 : 0;
    const recordsRatio = totalRecordsAll > 0 ? (sectorRecords / totalRecordsAll) * 100 : 0;
    const criticalRatio = sectorIncidents.length > 0 ? (criticalCount / sectorIncidents.length) * 100 : 0;
    const highRatio = sectorIncidents.length > 0 ? (highCount / sectorIncidents.length) * 100 : 0;

    return {
      labels: ["نسبة حالات الرصد", "نسبة السجلات", "نسبة عالي الأهمية", "نسبة العالي"],
      data: [incidentsRatio, recordsRatio, criticalRatio, highRatio].map((v) => Math.min(100, Math.round(v))),
    };
  }

  // 12. Data Type Selector (used by AI tools)
  getChartData(dataType: string, params: any = {}): any {
    switch (dataType) {
      case "sector_distribution": return this.getSectorDistribution();
      case "source_distribution": return this.getSourceDistribution();
      case "severity_distribution": return this.getSeverityDistribution();
      case "monthly_trend": return this.getMonthlyTrend();
      case "top_incidents": return this.getTopIncidentsByRecords(params.limit || 10);
      case "pii_distribution": return this.getPiiDistribution();
      case "breach_methods": return this.getBreachMethodDistribution();
      case "region_distribution": return this.getRegionDistribution();
      case "fine_distribution": return this.getFineDistribution();
      case "sector_comparison": return this.compareSectors(params.sectors || []);
      case "sector_radar": return this.getSectorRadarData(params.sector || "");
      default: return { error: `نوع بيانات غير معروف: ${dataType}` };
    }
  }
}
