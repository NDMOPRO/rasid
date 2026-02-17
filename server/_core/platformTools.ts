/**
 * Platform Tools - Enable LLM to query live platform data via function calling
 * 
 * These tools allow Smart Rasid to access real data from the platform:
 * - Dashboard statistics
 * - Site search and details
 * - Scan results
 * - Sector compliance
 * - Article 12 clauses
 * - Members info
 * - Cases and letters
 */

import * as db from "../db";
import type { Tool } from "./llm";

// Tool definitions for the LLM
export const platformTools: Tool[] = [
  {
    type: "function",
    function: {
      name: "get_platform_stats",
      description: "جلب إحصائيات المنصة العامة: عدد المواقع، الفحوصات، نسب الامتثال",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_sites",
      description: "البحث عن موقع محدد بالاسم أو الرابط",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "اسم الموقع أو الرابط" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_site_details",
      description: "جلب تفاصيل موقع محدد بمعرفه",
      parameters: {
        type: "object",
        properties: {
          siteId: { type: "number", description: "معرف الموقع" },
        },
        required: ["siteId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_scan_results",
      description: "جلب نتائج فحص موقع محدد",
      parameters: {
        type: "object",
        properties: {
          siteId: { type: "number", description: "معرف الموقع" },
          limit: { type: "number", description: "عدد النتائج (افتراضي 5)" },
        },
        required: ["siteId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_compliance_by_sector",
      description: "جلب نسب الامتثال حسب القطاع",
      parameters: {
        type: "object",
        properties: {
          sector: { type: "string", description: "اسم القطاع (اختياري - إذا لم يحدد يعرض الكل)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_article12_clauses",
      description: "جلب بنود المادة 12 ونسب الامتثال لكل بند",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_members_list",
      description: "جلب قائمة أعضاء المنصة",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "عدد النتائج (افتراضي 20)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_cases_summary",
      description: "جلب ملخص الحالات والقضايا",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

// Execute platform tools with real data
export async function executePlatformTool(
  toolName: string,
  args: Record<string, any>
): Promise<string> {
  try {
    switch (toolName) {
      case "get_platform_stats": {
        const stats = await db.getDashboardStats();
        const clauseStats = await db.getClauseStats();
        return JSON.stringify({
          stats,
          clauseStats,
          timestamp: new Date().toISOString(),
        });
      }

      case "search_sites": {
        const results = await db.getSites({
          search: args.query || "",
          limit: 20,
          page: 1,
        });
        return JSON.stringify({
          query: args.query,
          results: results.sites?.slice(0, 10) || [],
          total: results.total || 0,
        });
      }

      case "get_site_details": {
        const site = await db.getSiteById(args.siteId);
        if (!site) return JSON.stringify({ error: "الموقع غير موجود" });
        const scans = await db.getSiteScans(args.siteId);
        return JSON.stringify({ site, recentScans: (scans as any[])?.slice(0, 3) || [] });
      }

      case "get_scan_results": {
        const scans = await db.getSiteScans(args.siteId);
        const limited = (scans as any[])?.slice(0, args.limit || 5) || [];
        return JSON.stringify({
          siteId: args.siteId,
          scans: limited,
          total: limited.length,
        });
      }

      case "get_compliance_by_sector": {
        const sectorData = await db.getSectorCompliance();
        if (args.sector) {
          const filtered = (sectorData as any[])?.filter(
            (s: any) => s.sector?.includes(args.sector) || s.sectorType?.includes(args.sector)
          );
          return JSON.stringify({ sector: args.sector, data: filtered });
        }
        return JSON.stringify({ data: sectorData });
      }

      case "get_article12_clauses": {
        const clauses = await db.getClauseStats();
        return JSON.stringify({ clauses });
      }

      case "get_members_list": {
        const members = await db.getMembers();
        const memberList = Array.isArray(members) ? members.slice(0, args.limit || 20) : [];
        return JSON.stringify({
          members: memberList,
          total: memberList.length,
        });
      }

      case "get_cases_summary": {
        const cases = await db.getCases({ limit: 10 });
        return JSON.stringify({
          cases: cases.cases?.slice(0, 10) || [],
          total: cases.total || 0,
        });
      }

      default:
        return JSON.stringify({ error: `أداة غير معروفة: ${toolName}` });
    }
  } catch (error) {
    return JSON.stringify({
      error: `فشل تنفيذ الأداة ${toolName}: ${(error as Error).message}`,
    });
  }
}
