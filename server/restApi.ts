import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import * as db from "./db";

const apiRouter = Router();

// Rate limiting store (in-memory, per-key)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

// API Key authentication middleware
async function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "unauthorized",
      message: "مفتاح API مطلوب. أضف Authorization: Bearer <your_api_key> في الطلب",
    });
  }

  const rawKey = authHeader.substring(7);
  if (!rawKey.startsWith("rsk_")) {
    return res.status(401).json({
      error: "invalid_key",
      message: "صيغة مفتاح API غير صحيحة",
    });
  }

  // Find matching key by checking all active keys
  const allKeys = await db.getApiKeys();
  let matchedKey = null;
  for (const key of allKeys) {
    if (!key.isActive) continue;
    const match = await bcrypt.compare(rawKey, key.keyHash);
    if (match) {
      matchedKey = key;
      break;
    }
  }

  if (!matchedKey) {
    return res.status(401).json({
      error: "invalid_key",
      message: "مفتاح API غير صالح أو تم إلغاؤه",
    });
  }

  // Check expiration
  if (matchedKey.expiresAt && new Date(matchedKey.expiresAt) < new Date()) {
    return res.status(401).json({
      error: "key_expired",
      message: "مفتاح API منتهي الصلاحية",
    });
  }

  // Rate limiting
  const keyId = String(matchedKey.id);
  const now = Date.now();
  const rateData = rateLimitStore.get(keyId);
  if (rateData && rateData.resetAt > now) {
    if (rateData.count >= RATE_LIMIT) {
      res.setHeader("X-RateLimit-Limit", RATE_LIMIT);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset", Math.ceil(rateData.resetAt / 1000));
      return res.status(429).json({
        error: "rate_limit_exceeded",
        message: "تم تجاوز حد الطلبات. حاول مرة أخرى لاحقاً",
        retryAfter: Math.ceil((rateData.resetAt - now) / 1000),
      });
    }
    rateData.count++;
  } else {
    rateLimitStore.set(keyId, { count: 1, resetAt: now + RATE_WINDOW });
  }

  // Update usage
  await db.incrementApiKeyUsage(matchedKey.id);

  // Attach key info to request
  (req as any).apiKey = matchedKey;
  next();
}

// Apply auth middleware to all routes
apiRouter.use(authenticateApiKey);

// GET /api/v1/sites - List all sites
apiRouter.get("/sites", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const sector = req.query.sector as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const result = await db.getSites({ page, limit, search, status, complianceStatus: undefined, classification: undefined });
    const paginated = result.sites;
    const total = result.total;

    res.json({
      success: true,
      data: paginated.map((s: any) => ({
        id: s.id,
        domain: s.domain,
        siteName: s.siteName,
        sectorType: s.sectorType,
        classification: s.classification,
        siteStatus: s.siteStatus,
        privacyUrl: s.privacyUrl,
        createdAt: s.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "server_error", message: "خطأ في الخادم" });
  }
});

// GET /api/v1/sites/:id - Get site details
apiRouter.get("/sites/:id", async (req: Request, res: Response) => {
  try {
    const siteId = parseInt(req.params.id);
    const site = await db.getSiteById(siteId);
    if (!site) {
      return res.status(404).json({ error: "not_found", message: "الموقع غير موجود" });
    }

    const latestScan = await db.getLatestScanForSite(siteId);

    res.json({
      success: true,
      data: {
        site: {
          id: site.id,
          domain: site.domain,
          siteName: site.siteName,
          sectorType: site.sectorType,
          classification: site.classification,
          siteStatus: site.siteStatus,
          privacyUrl: site.privacyUrl,
          contactUrl: site.contactUrl,
          emails: site.emails,
          createdAt: site.createdAt,
        },
        latestScan: latestScan ? {
          id: latestScan.id,
          overallScore: latestScan.overallScore,
          complianceStatus: latestScan.complianceStatus,
          rating: latestScan.rating,
          clauses: {
            clause1: latestScan.clause1Compliant,
            clause2: latestScan.clause2Compliant,
            clause3: latestScan.clause3Compliant,
            clause4: latestScan.clause4Compliant,
            clause5: latestScan.clause5Compliant,
            clause6: latestScan.clause6Compliant,
            clause7: latestScan.clause7Compliant,
            clause8: latestScan.clause8Compliant,
          },
          scanDate: latestScan.scanDate,
        } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "server_error", message: "خطأ في الخادم" });
  }
});

// GET /api/v1/scans - List scans with optional filters
apiRouter.get("/scans", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const siteId = req.query.siteId ? parseInt(req.query.siteId as string) : undefined;

    let allScans;
    if (siteId) {
      allScans = await db.getSiteScans(siteId);
    } else {
      allScans = await db.getRecentScans(1000);
    }

    const total = allScans.length;
    const offset = (page - 1) * limit;
    const paginated = allScans.slice(offset, offset + limit);

    res.json({
      success: true,
      data: paginated.map((s: any) => ({
        id: s.id,
        siteId: s.siteId,
        domain: s.domain,
        overallScore: s.overallScore,
        complianceStatus: s.complianceStatus,
        rating: s.rating,
        scanDate: s.scanDate,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "server_error", message: "خطأ في الخادم" });
  }
});

// GET /api/v1/compliance/status - Get overall compliance status
apiRouter.get("/compliance/status", async (req: Request, res: Response) => {
  try {
    const stats = await db.getDashboardStats();
    const s = stats || { totalSites: 0, activeSites: 0, compliant: 0, partiallyCompliant: 0, nonCompliant: 0, noPolicy: 0, totalScans: 0 };
    res.json({
      success: true,
      data: {
        totalSites: s.totalSites,
        activeSites: s.activeSites,
        compliant: s.compliant,
        partiallyCompliant: s.partiallyCompliant,
        nonCompliant: s.nonCompliant,
        noPolicy: s.noPolicy,
        complianceRate: s.totalSites > 0
          ? ((s.compliant / s.totalSites) * 100).toFixed(2) + "%"
          : "0%",
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "server_error", message: "خطأ في الخادم" });
  }
});

// GET /api/v1/stats - Get comprehensive statistics
apiRouter.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = await db.getDashboardStats();
    const st = stats || { totalSites: 0, activeSites: 0, compliant: 0, partiallyCompliant: 0, nonCompliant: 0, noPolicy: 0, totalScans: 0 };
    const clauseStats = await db.getClauseStats();
    const trends = await db.getMonthlyComplianceTrends(6);

    res.json({
      success: true,
      data: {
        overview: {
          totalSites: st.totalSites,
          activeSites: st.activeSites,
          totalScans: st.totalScans,
          compliant: st.compliant,
          partiallyCompliant: st.partiallyCompliant,
          nonCompliant: st.nonCompliant,
          noPolicy: st.noPolicy,
        },
        article12Clauses: clauseStats,
        monthlyTrends: trends,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "server_error", message: "خطأ في الخادم" });
  }
});

// GET /api/v1/docs - API documentation
apiRouter.get("/docs", (_req: Request, res: Response) => {
  res.json({
    name: "Rasid Platform API",
    version: "1.0",
    description: "واجهة برمجية للوصول إلى بيانات منصة راصد لمراقبة الامتثال",
    baseUrl: "/api/v1",
    authentication: "Bearer Token (API Key)",
    endpoints: [
      { method: "GET", path: "/api/v1/sites", description: "قائمة المواقع", params: "page, limit, sector, status, search" },
      { method: "GET", path: "/api/v1/sites/:id", description: "تفاصيل موقع محدد" },
      { method: "GET", path: "/api/v1/scans", description: "قائمة الفحوصات", params: "page, limit, siteId" },
      { method: "GET", path: "/api/v1/compliance/status", description: "حالة الامتثال العامة" },
      { method: "GET", path: "/api/v1/stats", description: "إحصائيات شاملة" },
      { method: "GET", path: "/api/v1/docs", description: "توثيق الواجهة البرمجية" },
    ],
    rateLimit: {
      limit: 100,
      window: "1 minute",
      headers: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    },
  });
});

export { apiRouter };
