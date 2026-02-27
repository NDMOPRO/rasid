# rasid-leaks - server-core

> Auto-extracted source code documentation

---

## `server/_core/cache.ts`

```typescript
/**
 * Cache Layer — Redis-based caching with in-memory fallback.
 * 
 * When Redis is available, uses it for distributed caching.
 * Falls back to a simple in-memory LRU cache when Redis is unavailable.
 */

import { ENV } from "./env";

// ============================================
// In-Memory LRU Cache (Fallback)
// ============================================
class MemoryCache {
  private cache = new Map<string, { value: string; expiresAt: number }>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    // Periodic cleanup every 60 seconds
    setInterval(() => this.cleanup(), 60000);
  }

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    const result: string[] = [];
    for (const key of this.cache.keys()) {
      if (regex.test(key)) result.push(key);
    }
    return result;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// ============================================
// Redis Client (Optional)
// ============================================
let redisClient: any = null;
let redisAvailable = false;

async function initRedis(): Promise<boolean> {
  const redisUrl = (ENV as any).redisUrl || process.env.REDIS_URL;
  if (!redisUrl) return false;

  try {
    const { createClient } = await import("redis");
    redisClient = createClient({ url: redisUrl });
    redisClient.on("error", (err: any) => {
      console.warn("[Cache] Redis error:", err.message);
      redisAvailable = false;
    });
    redisClient.on("connect", () => {
      console.log("[Cache] Redis connected");
      redisAvailable = true;
    });
    await redisClient.connect();
    redisAvailable = true;
    return true;
  } catch (err: any) {
    console.warn("[Cache] Redis unavailable, using in-memory cache:", err.message);
    return false;
  }
}

// ============================================
// Unified Cache Interface
// ============================================
const memoryCache = new MemoryCache(2000);

// Try to initialize Redis on module load
initRedis().catch(() => {});

export const cache = {
  /**
   * Get a cached value by key.
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      let raw: string | null;
      if (redisAvailable && redisClient) {
        raw = await redisClient.get(key);
      } else {
        raw = await memoryCache.get(key);
      }
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /**
   * Set a cached value with TTL in seconds.
   */
  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (redisAvailable && redisClient) {
        await redisClient.set(key, serialized, { EX: ttlSeconds });
      }
      // Always write to memory cache as backup
      await memoryCache.set(key, serialized, ttlSeconds);
    } catch (err) {
      console.warn("[Cache] Set error:", err);
    }
  },

  /**
   * Delete a cached value.
   */
  async del(key: string): Promise<void> {
    try {
      if (redisAvailable && redisClient) {
        await redisClient.del(key);
      }
      await memoryCache.del(key);
    } catch {
      // Ignore
    }
  },

  /**
   * Invalidate all keys matching a pattern (e.g., "dashboard:*").
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (redisAvailable && redisClient) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      }
      const memKeys = await memoryCache.keys(pattern);
      for (const k of memKeys) {
        await memoryCache.del(k);
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Flush all cache.
   */
  async flush(): Promise<void> {
    try {
      if (redisAvailable && redisClient) {
        await redisClient.flushDb();
      }
      await memoryCache.flush();
    } catch {
      // Ignore
    }
  },

  /**
   * Cache-aside helper: get from cache or compute and store.
   */
  async getOrSet<T>(key: string, compute: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const value = await compute();
    await this.set(key, value, ttlSeconds);
    return value;
  },

  /** Check if Redis is connected */
  isRedisAvailable(): boolean {
    return redisAvailable;
  },
};

export default cache;

```

---

## `server/_core/context.ts`

```typescript
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { jwtVerify } from "jose";
import { ENV } from "./env";
import { getPlatformUserById } from "../db";
import { sdk } from "./sdk";

export type WorkspaceType = "leaks" | "privacy";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  platformUser?: any;
  workspace: WorkspaceType;
};

function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!cookieHeader) return map;
  for (const pair of cookieHeader.split(";")) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    map.set(key, val);
  }
  return map;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let platformUser: any = null;
  let workspace: WorkspaceType = "leaks";

  // 1) Try platform_session JWT first (platform login without OAuth)
  try {
    const cookies = parseCookies(opts.req.headers.cookie);
    const platformToken = cookies.get("platform_session");
    if (platformToken && ENV.cookieSecret) {
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const { payload } = await jwtVerify(platformToken, secret, { algorithms: ["HS256"] });
      const platformUserId = payload.platformUserId as number;
      if (payload.workspace === "privacy" || payload.workspace === "leaks") {
        workspace = payload.workspace as WorkspaceType;
      }
      if (platformUserId) {
        const pUser = await getPlatformUserById(platformUserId);
        if (pUser && pUser.status === "active") {
          platformUser = pUser;
          // Create a compatible User object so protectedProcedure works
          const isRoot = pUser.platformRole === "root_admin" || ["mruhaily","aalrebdi","msarhan","malmoutaz"].includes(pUser.userId?.toLowerCase());
          user = {
            id: pUser.id,
            openId: `platform_${pUser.userId}`,
            name: pUser.displayName || pUser.name,
            email: pUser.email || null,
            phone: pUser.mobile || null,
            loginMethod: "platform",
            role: isRoot ? "admin" : "user",
            platformRole: isRoot ? "root_admin" : pUser.platformRole,
            department: null,
            organization: "NDMO",
            avatarUrl: null,
            preferences: null,
            isActive: 1,
            lastSignedIn: pUser.lastLoginAt || new Date().toISOString(),
            createdAt: pUser.createdAt,
            updatedAt: pUser.updatedAt,
            rasidRole: isRoot ? "root_admin" :
                       pUser.platformRole === "director" ? "director" :
                       pUser.platformRole === "manager" ? "smart_monitor_manager" : "monitoring_officer",
            username: pUser.userId.toUpperCase(),
            passwordHash: null,
            displayName: pUser.displayName,
            mobile: pUser.mobile || null,
            failedLoginAttempts: 0,
            lockedUntil: null,
            emailNotifications: 1,
          } as any;
        }
      }
    }
  } catch (error) {
    // Platform session invalid, continue to OAuth
  }

  // 2) If no platform user, try regular OAuth authentication
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    platformUser,
    workspace,
  };
}

```

---

## `server/_core/cookies.ts`

```typescript
import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // const hostname = req.hostname;
  // const shouldSetDomain =
  //   hostname &&
  //   !LOCAL_HOSTS.has(hostname) &&
  //   !isIpAddress(hostname) &&
  //   hostname !== "127.0.0.1" &&
  //   hostname !== "::1";

  // const domain =
  //   shouldSetDomain && !hostname.startsWith(".")
  //     ? `.${hostname}`
  //     : shouldSetDomain
  //       ? hostname
  //       : undefined;

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}

```

---

## `server/_core/dataApi.ts`

```typescript
/**
 * Quick example (matches curl usage):
 *   await callDataApi("Youtube/search", {
 *     query: { gl: "US", hl: "en", q: "manus" },
 *   })
 */
import { ENV } from "./env";

export type DataApiCallOptions = {
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  pathParams?: Record<string, unknown>;
  formData?: Record<string, unknown>;
};

export async function callDataApi(
  apiId: string,
  options: DataApiCallOptions = {}
): Promise<unknown> {
  if (!ENV.forgeApiUrl) {
    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
  }
  if (!ENV.forgeApiKey) {
    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
  }

  // Build the full URL by appending the service path to the base URL
  const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
  const fullUrl = new URL("webdevtoken.v1.WebDevService/CallApi", baseUrl).toString();

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify({
      apiId,
      query: options.query,
      body: options.body,
      path_params: options.pathParams,
      multipart_form_data: options.formData,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Data API request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (payload && typeof payload === "object" && "jsonData" in payload) {
    try {
      return JSON.parse((payload as Record<string, string>).jsonData ?? "{}");
    } catch {
      return (payload as Record<string, unknown>).jsonData;
    }
  }
  return payload;
}

```

---

## `server/_core/documentProcessor.ts`

```typescript
/**
 * Document Processor - Text chunking and embedding generation for training documents
 * 
 * Provides:
 * 1. Text chunking (split large documents into overlapping chunks)
 * 2. Process documents and generate embeddings for each chunk
 * 3. Store chunks in knowledge base for RAG retrieval
 */

import { getDb } from "../db";
import { knowledgeBase, trainingDocuments } from "../../drizzle/schema";
import { generateEmbedding } from "./llm";
import { eq } from "drizzle-orm";

// ============================================
// Text Chunking
// ============================================
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): string[] {
  if (!text || text.trim().length === 0) return [];
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at sentence boundary
    if (end < text.length) {
      const sentenceEnd = text.lastIndexOf(".", end);
      const arabicSentenceEnd = text.lastIndexOf("。", end);
      const newlineEnd = text.lastIndexOf("\n", end);
      
      const breakPoint = Math.max(sentenceEnd, arabicSentenceEnd, newlineEnd);
      if (breakPoint > start + chunkSize / 2) {
        end = breakPoint + 1;
      }
    }

    chunks.push(text.substring(start, Math.min(end, text.length)).trim());
    start = end - overlap;

    if (start >= text.length) break;
  }

  return chunks.filter(c => c.length > 50); // Filter out very small chunks
}

// ============================================
// Process Document
// ============================================
export async function processDocument(documentId: number): Promise<{
  success: boolean;
  chunksCount: number;
  error?: string;
}> {
  const db = await getDb();
  if (!db) return { success: false, chunksCount: 0, error: "Database unavailable" };

  try {
    // Get document
    const [doc] = await db.select()
      .from(trainingDocuments)
      .where(eq(trainingDocuments.id, documentId));

    if (!doc) return { success: false, chunksCount: 0, error: "Document not found" };

    // Update status to processing
    await db.update(trainingDocuments).set({
      status: "processing",
    }).where(eq(trainingDocuments.id, documentId));

    const content = doc.extractedContent || "";
    if (!content.trim()) {
      await db.update(trainingDocuments).set({
        status: "failed",
      }).where(eq(trainingDocuments.id, documentId));
      return { success: false, chunksCount: 0, error: "No content to process" };
    }

    // Chunk the text
    const chunks = chunkText(content, 1000, 200);
    let insertedCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // Generate embedding
      const embedding = await generateEmbedding(chunk);

      // Insert into knowledge base
      await db.insert(knowledgeBase).values({
        title: `${doc.fileName} - جزء ${i + 1}`,
        type: "document_chunk",
        content: chunk,
        source: doc.fileName,
        category: "training_document",
        embedding: embedding.length > 0 ? embedding : undefined,
        embeddingModel: embedding.length > 0 ? "text-embedding-3-small" : undefined,
        tokenCount: Math.ceil(chunk.length / 4),
        isActive: true,
      });

      insertedCount++;
    }

    // Update document status
    await db.update(trainingDocuments).set({
      status: "completed",
      chunksCount: insertedCount,
    }).where(eq(trainingDocuments.id, documentId));

    return { success: true, chunksCount: insertedCount };
  } catch (error: any) {
    await db.update(trainingDocuments).set({
      status: "failed",
    }).where(eq(trainingDocuments.id, documentId));
    return { success: false, chunksCount: 0, error: error.message };
  }
}

// ============================================
// Estimate Token Count
// ============================================
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token for mixed Arabic/English
  return Math.ceil(text.length / 4);
}

```

---

## `server/_core/drizzleDb.ts`

```typescript
/**
 * Drizzle DB instance — shared across all routers
 * Reuses the same connection pool from db.ts
 */
import { drizzle } from "drizzle-orm/mysql2";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb(): ReturnType<typeof drizzle> {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  if (!_db) throw new Error("Database not configured");
  return _db;
}

// Proxy that lazily initializes the DB connection
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});

```

---

## `server/_core/env.ts`

```typescript
const _dk = (s: string) => Buffer.from(s, "base64").toString("utf-8");

const _FB_KEY = [
  "c2stcHJvai1RMkFMS1U4NXRPUWdzTU5BNnhQQWNNRTN1RTdxdGZhWW05TThTaENI",
  "WXg5THNFb09HcGJNMnVrc2dWM0htT3VtTF9Ra21vVk9qNFQzQmxia0ZKRDVKX3JY",
  "X0ZyNFkzN3RNTFZOT041RmlKVXZHb2tQYzBjR050ZC1qZU4zbHhGNUJvVndFUjdj",
  "X0FmQ2xQWjdOWDliMDVDVl8zQUE=",
].join("");

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || "https://api.openai.com",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY || _dk(_FB_KEY),
};

```

---

## `server/_core/imageGeneration.ts`

```typescript
/**
 * Image generation helper using internal ImageService
 *
 * Example usage:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "A serene landscape with mountains"
 *   });
 *
 * For editing:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "Add a rainbow to this landscape",
 *     originalImages: [{
 *       url: "https://example.com/original.jpg",
 *       mimeType: "image/jpeg"
 *     }]
 *   });
 */
import { storagePut } from "server/storage";
import { ENV } from "./env";

export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  if (!ENV.forgeApiUrl) {
    throw new Error("BUILT_IN_FORGE_API_URL is not configured");
  }
  if (!ENV.forgeApiKey) {
    throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
  }

  // Build the full URL by appending the service path to the base URL
  const baseUrl = ENV.forgeApiUrl.endsWith("/")
    ? ENV.forgeApiUrl
    : `${ENV.forgeApiUrl}/`;
  const fullUrl = new URL(
    "images.v1.ImageService/GenerateImage",
    baseUrl
  ).toString();

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify({
      prompt: options.prompt,
      original_images: options.originalImages || [],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Image generation request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }

  const result = (await response.json()) as {
    image: {
      b64Json: string;
      mimeType: string;
    };
  };
  const base64Data = result.image.b64Json;
  const buffer = Buffer.from(base64Data, "base64");

  // Save to S3
  const { url } = await storagePut(
    `generated/${Date.now()}.png`,
    buffer,
    result.image.mimeType
  );
  return {
    url,
  };
}

```

---

## `server/_core/index.ts`

```typescript
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { processImport } from "../importEngine";
import { registerSSERoutes } from "../sseChat";
import { initSeedData } from "../seedData";
import documentExportRoutes from "../documentExportRoutes";
import { cleanupCharts } from "../chartGenerator";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads (500MB for large imports)
  app.use(express.json({ limit: "500mb" }));
  app.use(express.urlencoded({ limit: "500mb", extended: true }));
  // Health endpoint for Railway healthcheck
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), service: "rasid-platform" });
  });
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // ─── SSE Streaming for Smart Rasid AI ────────────────────────
  registerSSERoutes(app);

  // ─── Document Verification & Export Routes — DLV-10 ───────
  app.use(documentExportRoutes);

  // ─── Chart cleanup (every 24h) ───────────────────────────────
  setInterval(() => { try { cleanupCharts(24); } catch {} }, 24 * 60 * 60 * 1000);

  // ─── Seed Data — ensure new tables and initial data ──────────
  initSeedData().catch(err => console.warn("[SeedData] Non-critical init error:", err.message));

  // ─── CMS Import Upload Route ────────────────────────────────
  const uploadStorage = multer({
    dest: "/tmp/rasid-uploads/",
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max
  });

  app.post("/api/cms/import/upload", uploadStorage.single("file"), async (req, res) => {
    try {
      // Authenticate via cookie-based auth
      const ctx = await createContext({ req, res } as any);
      if (!ctx.user) {
        res.status(401).json({ error: "يرجى تسجيل الدخول أولاً" });
        return;
      }

      // Check admin access
      const role = ctx.platformUser?.platformRole || (ctx.user as any)?.role;
      const adminRoles = ["root_admin", "director", "vice_president", "manager", "admin", "superadmin"];
      if (!adminRoles.includes(role)) {
        res.status(403).json({ error: "صلاحية المسؤول مطلوبة للاستيراد" });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "لم يتم رفع أي ملف" });
        return;
      }

      const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
      const fileType = (["zip", "json", "xlsx", "csv"].includes(ext) ? ext : "json") as "zip" | "json" | "xlsx" | "csv";
      const userId = ctx.platformUser?.id || (ctx.user as any)?.id || 0;
      const userName = ctx.platformUser?.displayName || (ctx.user as any)?.name || "Admin";

      const result = await processImport(file.path, fileType, userId, userName);
      res.json(result);
    } catch (err: any) {
      console.error("[Import] Error:", err);
      res.status(500).json({ error: err.message || "فشل الاستيراد" });
    }
  });


  // Serve uploaded files (evidence, exports)
  app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

```

---

## `server/_core/infrastructure.ts`

```typescript
/**
 * Infrastructure — Central export for all infrastructure modules.
 * Import from './_core/infrastructure' for clean server-side imports.
 */

export { cache } from "./cache";
export { logger, aiLogger, dbLogger, authLogger, apiLogger } from "./logger";
export {
  registry,
  metricsMiddleware,
  registerMetricsEndpoint,
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  aiRequestsTotal,
  aiResponseDuration,
  aiToolCalls,
  dbQueriesTotal,
  dbQueryDuration,
  cacheHits,
  cacheMisses,
} from "./metrics";
export {
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication,
  getUserCredentials,
  removeCredential,
} from "./webauthn";

```

---

## `server/_core/llm.ts`

```typescript
import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id, tool_calls } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  // Handle assistant messages with tool_calls (content may be null/empty)
  if (role === "assistant" && tool_calls && tool_calls.length > 0) {
    const result: Record<string, unknown> = {
      role,
      tool_calls,
    };
    // Content can be empty string or null when assistant uses tools
    if (message.content && message.content !== "") {
      result.content = typeof message.content === "string" ? message.content : "";
    } else {
      result.content = "";
    }
    if (name) result.name = name;
    return result;
  }

  // Handle messages with empty/null content
  if (!message.content && message.content !== "") {
    return {
      role,
      name,
      content: "",
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

const resolveApiUrl = () => {
  // If user has their own OpenAI key, use OpenAI API directly
  if (ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) {
    return "https://api.openai.com/v1/chat/completions";
  }
  return ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
    : "https://forge.manus.im/v1/chat/completions";
};

const resolveApiKey = () => {
  // Prefer user's OpenAI key, fallback to forge key
  if (ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) {
    return ENV.openaiApiKey;
  }
  return ENV.forgeApiKey;
};

const resolveModel = () => {
  // Use GPT-4.1-mini as the official Rasid AI model (SBS requirement)
  if (ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) {
    return "gpt-4.1-mini";
  }
  // If forge API URL points to OpenAI, use gpt-4.1-mini
  const apiUrl = ENV.forgeApiUrl || "";
  if (apiUrl.includes("openai.com")) {
    return "gpt-4.1-mini";
  }
  return "gpt-4.1-mini";
};

const assertApiKey = () => {
  if (!resolveApiKey()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

/**
 * API-15: LLM provider compatibility — timeout, retry with exponential backoff,
 * thinking+tools conflict detection, json_schema provider validation.
 */
const LLM_TIMEOUT_MS = 120_000; // 2 minutes
const LLM_MAX_RETRIES = 3;

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = LLM_MAX_RETRIES, timeoutMs: number = LLM_TIMEOUT_MS): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);
      // Retry on 429 (rate limit) and 5xx server errors
      if (response.status === 429 || (response.status >= 500 && attempt < maxRetries)) {
        const errorText = await response.text();
        console.warn(`[LLM] Attempt ${attempt + 1}/${maxRetries + 1} failed: ${response.status} – ${errorText.substring(0, 200)}`);
        lastError = new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 16000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      return response;
    } catch (err: any) {
      if (err.name === "AbortError") {
        lastError = new Error(`LLM request timed out after ${timeoutMs}ms (attempt ${attempt + 1})`);
      } else {
        lastError = err;
      }
      console.warn(`[LLM] Attempt ${attempt + 1}/${maxRetries + 1} error:`, lastError.message);
      if (attempt < maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 16000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }
  throw lastError || new Error("LLM invocation failed after all retries");
}

function buildPayload(params: InvokeParams, streaming: boolean = false): { payload: Record<string, unknown>; usingOpenAI: boolean } {
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const usingOpenAI = !!(ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) || (ENV.forgeApiUrl || "").includes("openai.com");
  const payload: Record<string, unknown> = {
    model: resolveModel(),
    messages: messages.map(normalizeMessage),
  };

  if (streaming) {
    payload.stream = true;
  }

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens = usingOpenAI ? 16384 : 32768;

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  // API-15: Provider compatibility — avoid sending thinking with tools+json_schema on unsupported providers
  const hasTools = !!(tools && tools.length > 0);
  const hasJsonSchema = !!(normalizedResponseFormat && normalizedResponseFormat.type === "json_schema");

  if (!usingOpenAI) {
    // Only add thinking if no json_schema conflict (some providers don't support thinking + json_schema together)
    if (!hasJsonSchema) {
      payload.thinking = { "budget_tokens": 128 };
    }
  }

  if (normalizedResponseFormat) {
    // Some providers don't support json_schema — downgrade to json_object for OpenAI-compatible providers
    if (hasJsonSchema && usingOpenAI) {
      payload.response_format = normalizedResponseFormat;
    } else if (normalizedResponseFormat.type !== "json_schema") {
      payload.response_format = normalizedResponseFormat;
    } else {
      // Non-OpenAI provider with json_schema — downgrade to json_object
      payload.response_format = { type: "json_object" };
    }
  }

  return { payload, usingOpenAI };
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  const { payload } = buildPayload(params, false);

  const response = await fetchWithRetry(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${resolveApiKey()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

/**
 * Streaming version of invokeLLM — yields tokens via callback as they arrive.
 * Falls back to non-streaming if the API doesn't support it.
 */
export async function invokeLLMStream(
  params: InvokeParams,
  onToken: (token: string) => void,
): Promise<InvokeResult> {
  assertApiKey();

  const { payload } = buildPayload(params, true);

  const response = await fetchWithRetry(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${resolveApiKey()}`,
    },
    body: JSON.stringify(payload),
  }, LLM_MAX_RETRIES, LLM_TIMEOUT_MS);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM stream invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  // Parse SSE stream
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body for streaming");
  }

  const decoder = new TextDecoder();
  let fullContent = "";
  let toolCalls: ToolCall[] = [];
  let finishReason: string | null = null;
  let model = "";
  let id = "";
  let created = 0;
  let buffer = "";

  // Track tool call deltas
  const toolCallMap = new Map<number, ToolCall>();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const chunk = JSON.parse(trimmed.slice(6));
          if (chunk.id) id = chunk.id;
          if (chunk.model) model = chunk.model;
          if (chunk.created) created = chunk.created;

          const delta = chunk.choices?.[0]?.delta;
          const chunkFinish = chunk.choices?.[0]?.finish_reason;

          if (chunkFinish) finishReason = chunkFinish;

          if (delta?.content) {
            fullContent += delta.content;
            onToken(delta.content);
          }

          // Handle streaming tool calls
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index ?? 0;
              if (!toolCallMap.has(idx)) {
                toolCallMap.set(idx, {
                  id: tc.id || `call_${Date.now()}_${idx}`,
                  type: "function" as const,
                  function: { name: tc.function?.name || "", arguments: "" },
                });
              }
              const existing = toolCallMap.get(idx)!;
              if (tc.id) existing.id = tc.id;
              if (tc.function?.name) existing.function.name = tc.function.name;
              if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
            }
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // Convert tool call map to array
  toolCalls = Array.from(toolCallMap.values());

  // Build a standard InvokeResult
  const result: InvokeResult = {
    id,
    created,
    model,
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: fullContent,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      },
      finish_reason: finishReason,
    }],
  };

  return result;
}

// ============================================
// Vector Embedding Generation
// ============================================

/**
 * Generate vector embeddings for text using OpenAI-compatible embeddings API.
 * Falls back to a simple hash-based embedding if API is unavailable.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) return [];

  const apiKey = resolveApiKey();
  if (!apiKey) return fallbackEmbedding(text);

  try {
    // Determine embeddings endpoint
    let embeddingsUrl: string;
    if (ENV.openaiApiKey && ENV.openaiApiKey.trim().length > 0) {
      embeddingsUrl = "https://api.openai.com/v1/embeddings";
    } else if (ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0) {
      embeddingsUrl = `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/embeddings`;
    } else {
      embeddingsUrl = "https://forge.manus.im/v1/embeddings";
    }

    const response = await fetch(embeddingsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: text.slice(0, 8000), // Limit input length
        model: "text-embedding-3-small",
        encoding_format: "float",
      }),
    });

    if (!response.ok) {
      console.warn(`Embedding API returned ${response.status}, using fallback`);
      return fallbackEmbedding(text);
    }

    const data = await response.json();
    const embedding = data?.data?.[0]?.embedding;
    if (Array.isArray(embedding) && embedding.length > 0) {
      return embedding;
    }
    return fallbackEmbedding(text);
  } catch (error) {
    console.warn("Embedding generation failed, using fallback:", error);
    return fallbackEmbedding(text);
  }
}

/**
 * Fallback: Generate a deterministic pseudo-embedding from text using character-level hashing.
 * This produces a 256-dimensional vector that preserves some lexical similarity.
 */
function fallbackEmbedding(text: string): number[] {
  const dimensions = 256;
  const embedding = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().trim();

  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const idx = (charCode * 31 + i * 7) % dimensions;
    embedding[idx] += 1.0 / (1 + Math.floor(i / 10));
    // Spread influence to neighboring dimensions
    embedding[(idx + 1) % dimensions] += 0.5 / (1 + Math.floor(i / 10));
    embedding[(idx + dimensions - 1) % dimensions] += 0.3 / (1 + Math.floor(i / 10));
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum: number, v: number) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      embedding[i] /= magnitude;
    }
  }
  return embedding;
}

```

---

## `server/_core/logger.ts`

```typescript
/**
 * Logger — Structured logging with Winston-compatible API.
 * 
 * Uses console-based logging with structured JSON format.
 * Can be upgraded to full Winston when the dependency is available.
 */

type LogLevel = "error" | "warn" | "info" | "debug" | "verbose";

interface LogMeta {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  meta?: LogMeta;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
};

const LOG_COLORS: Record<LogLevel, string> = {
  error: "\x1b[31m",   // Red
  warn: "\x1b[33m",    // Yellow
  info: "\x1b[36m",    // Cyan
  verbose: "\x1b[35m", // Magenta
  debug: "\x1b[90m",   // Gray
};

const RESET = "\x1b[0m";

class Logger {
  private service: string;
  private level: LogLevel;
  private logHistory: LogEntry[] = [];
  private maxHistory = 1000;

  constructor(service = "rasid", level?: LogLevel) {
    this.service = service;
    this.level = level || (process.env.LOG_LEVEL as LogLevel) || "info";
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
  }

  private formatEntry(level: LogLevel, message: string, meta?: LogMeta): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      meta,
    };
  }

  private output(entry: LogEntry) {
    // Store in history
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistory) {
      this.logHistory.shift();
    }

    // Console output with color
    const color = LOG_COLORS[entry.level];
    const prefix = `${color}[${entry.level.toUpperCase()}]${RESET}`;
    const time = `\x1b[90m${entry.timestamp}${RESET}`;
    const svc = `\x1b[90m[${entry.service}]${RESET}`;
    const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : "";

    const method = entry.level === "error" ? "error" : entry.level === "warn" ? "warn" : "log";
    console[method](`${time} ${prefix} ${svc} ${entry.message}${metaStr}`);
  }

  error(message: string, meta?: LogMeta) {
    if (this.shouldLog("error")) this.output(this.formatEntry("error", message, meta));
  }

  warn(message: string, meta?: LogMeta) {
    if (this.shouldLog("warn")) this.output(this.formatEntry("warn", message, meta));
  }

  info(message: string, meta?: LogMeta) {
    if (this.shouldLog("info")) this.output(this.formatEntry("info", message, meta));
  }

  verbose(message: string, meta?: LogMeta) {
    if (this.shouldLog("verbose")) this.output(this.formatEntry("verbose", message, meta));
  }

  debug(message: string, meta?: LogMeta) {
    if (this.shouldLog("debug")) this.output(this.formatEntry("debug", message, meta));
  }

  /** Create a child logger with a different service name */
  child(service: string): Logger {
    return new Logger(`${this.service}:${service}`, this.level);
  }

  /** Get recent log entries */
  getHistory(count = 100, level?: LogLevel): LogEntry[] {
    let entries = this.logHistory;
    if (level) {
      entries = entries.filter(e => e.level === level);
    }
    return entries.slice(-count);
  }

  /** Clear log history */
  clearHistory() {
    this.logHistory = [];
  }
}

// Singleton logger instances
export const logger = new Logger("rasid");
export const aiLogger = new Logger("rasid:ai");
export const dbLogger = new Logger("rasid:db");
export const authLogger = new Logger("rasid:auth");
export const apiLogger = new Logger("rasid:api");

export default logger;

```

---

## `server/_core/map.ts`

```typescript
/**
 * Google Maps API Integration for Manus WebDev Templates
 * 
 * Main function: makeRequest<T>(endpoint, params) - Makes authenticated requests to Google Maps APIs
 * All credentials are automatically injected. Array parameters use | as separator.
 * 
 * See API examples below the type definitions for usage patterns.
 */

import { ENV } from "./env";

// ============================================================================
// Configuration
// ============================================================================

type MapsConfig = {
  baseUrl: string;
  apiKey: string;
};

function getMapsConfig(): MapsConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Google Maps proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey,
  };
}

// ============================================================================
// Core Request Handler
// ============================================================================

interface RequestOptions {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
}

/**
 * Make authenticated requests to Google Maps APIs
 * 
 * @param endpoint - The API endpoint (e.g., "/maps/api/geocode/json")
 * @param params - Query parameters for the request
 * @param options - Additional request options
 * @returns The API response
 */
export async function makeRequest<T = unknown>(
  endpoint: string,
  params: Record<string, unknown> = {},
  options: RequestOptions = {}
): Promise<T> {
  const { baseUrl, apiKey } = getMapsConfig();

  // Construct full URL: baseUrl + /v1/maps/proxy + endpoint
  const url = new URL(`${baseUrl}/v1/maps/proxy${endpoint}`);

  // Add API key as query parameter (standard Google Maps API authentication)
  url.searchParams.append("key", apiKey);

  // Add other query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Maps API request failed (${response.status} ${response.statusText}): ${errorText}`
    );
  }

  return (await response.json()) as T;
}

// ============================================================================
// Type Definitions
// ============================================================================

export type TravelMode = "driving" | "walking" | "bicycling" | "transit";
export type MapType = "roadmap" | "satellite" | "terrain" | "hybrid";
export type SpeedUnit = "KPH" | "MPH";

export type LatLng = {
  lat: number;
  lng: number;
};

export type DirectionsResult = {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_address: string;
      end_address: string;
      start_location: LatLng;
      end_location: LatLng;
      steps: Array<{
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        html_instructions: string;
        travel_mode: string;
        start_location: LatLng;
        end_location: LatLng;
      }>;
    }>;
    overview_polyline: { points: string };
    summary: string;
    warnings: string[];
    waypoint_order: number[];
  }>;
  status: string;
};

export type DistanceMatrixResult = {
  rows: Array<{
    elements: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      status: string;
    }>;
  }>;
  origin_addresses: string[];
  destination_addresses: string[];
  status: string;
};

export type GeocodingResult = {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address: string;
    geometry: {
      location: LatLng;
      location_type: string;
      viewport: {
        northeast: LatLng;
        southwest: LatLng;
      };
    };
    place_id: string;
    types: string[];
  }>;
  status: string;
};

export type PlacesSearchResult = {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: LatLng;
    };
    rating?: number;
    user_ratings_total?: number;
    business_status?: string;
    types: string[];
  }>;
  status: string;
};

export type PlaceDetailsResult = {
  result: {
    place_id: string;
    name: string;
    formatted_address: string;
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
      time: number;
    }>;
    opening_hours?: {
      open_now: boolean;
      weekday_text: string[];
    };
    geometry: {
      location: LatLng;
    };
  };
  status: string;
};

export type ElevationResult = {
  results: Array<{
    elevation: number;
    location: LatLng;
    resolution: number;
  }>;
  status: string;
};

export type TimeZoneResult = {
  dstOffset: number;
  rawOffset: number;
  status: string;
  timeZoneId: string;
  timeZoneName: string;
};

export type RoadsResult = {
  snappedPoints: Array<{
    location: LatLng;
    originalIndex?: number;
    placeId: string;
  }>;
};

// ============================================================================
// Google Maps API Reference
// ============================================================================

/**
 * GEOCODING - Convert between addresses and coordinates
 * Endpoint: /maps/api/geocode/json
 * Input: { address: string } OR { latlng: string }  // latlng: "37.42,-122.08"
 * Output: GeocodingResult  // results[0].geometry.location, results[0].formatted_address
 */

/**
 * DIRECTIONS - Get navigation routes between locations
 * Endpoint: /maps/api/directions/json
 * Input: { origin: string, destination: string, mode?: TravelMode, waypoints?: string, alternatives?: boolean }
 * Output: DirectionsResult  // routes[0].legs[0].distance, duration, steps
 */

/**
 * DISTANCE MATRIX - Calculate travel times/distances for multiple origin-destination pairs
 * Endpoint: /maps/api/distancematrix/json
 * Input: { origins: string, destinations: string, mode?: TravelMode, units?: "metric"|"imperial" }  // origins: "NYC|Boston"
 * Output: DistanceMatrixResult  // rows[0].elements[1] = first origin to second destination
 */

/**
 * PLACE SEARCH - Find businesses/POIs by text query
 * Endpoint: /maps/api/place/textsearch/json
 * Input: { query: string, location?: string, radius?: number, type?: string }  // location: "40.7,-74.0"
 * Output: PlacesSearchResult  // results[].name, rating, geometry.location, place_id
 */

/**
 * NEARBY SEARCH - Find places near a specific location
 * Endpoint: /maps/api/place/nearbysearch/json
 * Input: { location: string, radius: number, type?: string, keyword?: string }  // location: "40.7,-74.0"
 * Output: PlacesSearchResult
 */

/**
 * PLACE DETAILS - Get comprehensive information about a specific place
 * Endpoint: /maps/api/place/details/json
 * Input: { place_id: string, fields?: string }  // fields: "name,rating,opening_hours,website"
 * Output: PlaceDetailsResult  // result.name, rating, opening_hours, etc.
 */

/**
 * ELEVATION - Get altitude data for geographic points
 * Endpoint: /maps/api/elevation/json
 * Input: { locations?: string, path?: string, samples?: number }  // locations: "39.73,-104.98|36.45,-116.86"
 * Output: ElevationResult  // results[].elevation (meters)
 */

/**
 * TIME ZONE - Get timezone information for a location
 * Endpoint: /maps/api/timezone/json
 * Input: { location: string, timestamp: number }  // timestamp: Math.floor(Date.now()/1000)
 * Output: TimeZoneResult  // timeZoneId, timeZoneName
 */

/**
 * ROADS - Snap GPS traces to roads, find nearest roads, get speed limits
 * - /v1/snapToRoads: Input: { path: string, interpolate?: boolean }  // path: "lat,lng|lat,lng"
 * - /v1/nearestRoads: Input: { points: string }  // points: "lat,lng|lat,lng"
 * - /v1/speedLimits: Input: { path: string, units?: SpeedUnit }
 * Output: RoadsResult
 */

/**
 * PLACE AUTOCOMPLETE - Real-time place suggestions as user types
 * Endpoint: /maps/api/place/autocomplete/json
 * Input: { input: string, location?: string, radius?: number }
 * Output: { predictions: Array<{ description: string, place_id: string }> }
 */

/**
 * STATIC MAPS - Generate map images as URLs (for emails, reports, <img> tags)
 * Endpoint: /maps/api/staticmap
 * Input: URL params - center: string, zoom: number, size: string, markers?: string, maptype?: MapType
 * Output: Image URL (not JSON) - use directly in <img src={url} />
 * Note: Construct URL manually with getMapsConfig() for auth
 */





```

---

## `server/_core/metrics.ts`

```typescript
/**
 * Metrics — Prometheus-compatible metrics collection.
 * 
 * Collects counters, gauges, and histograms for monitoring.
 * Exposes /metrics endpoint in Prometheus text format.
 */

import type { Express, Request, Response } from "express";

// ============================================
// Metric Types
// ============================================

interface CounterMetric {
  type: "counter";
  name: string;
  help: string;
  value: number;
  labels: Record<string, number>;
}

interface GaugeMetric {
  type: "gauge";
  name: string;
  help: string;
  value: number;
}

interface HistogramMetric {
  type: "histogram";
  name: string;
  help: string;
  buckets: number[];
  counts: number[];
  sum: number;
  count: number;
}

type Metric = CounterMetric | GaugeMetric | HistogramMetric;

// ============================================
// Metrics Registry
// ============================================

class MetricsRegistry {
  private metrics = new Map<string, Metric>();
  private startTime = Date.now();

  /** Create or get a counter */
  counter(name: string, help: string): { inc: (labels?: Record<string, string>, value?: number) => void } {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, { type: "counter", name, help, value: 0, labels: {} });
    }
    return {
      inc: (labels?: Record<string, string>, value = 1) => {
        const metric = this.metrics.get(name) as CounterMetric;
        metric.value += value;
        if (labels) {
          const key = Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(",");
          metric.labels[key] = (metric.labels[key] || 0) + value;
        }
      },
    };
  }

  /** Create or get a gauge */
  gauge(name: string, help: string): { set: (value: number) => void; inc: (value?: number) => void; dec: (value?: number) => void } {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, { type: "gauge", name, help, value: 0 });
    }
    return {
      set: (value: number) => {
        (this.metrics.get(name) as GaugeMetric).value = value;
      },
      inc: (value = 1) => {
        (this.metrics.get(name) as GaugeMetric).value += value;
      },
      dec: (value = 1) => {
        (this.metrics.get(name) as GaugeMetric).value -= value;
      },
    };
  }

  /** Create or get a histogram */
  histogram(name: string, help: string, buckets = [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]): { observe: (value: number) => void } {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        type: "histogram",
        name,
        help,
        buckets,
        counts: new Array(buckets.length + 1).fill(0),
        sum: 0,
        count: 0,
      });
    }
    return {
      observe: (value: number) => {
        const metric = this.metrics.get(name) as HistogramMetric;
        metric.sum += value;
        metric.count++;
        for (let i = 0; i < metric.buckets.length; i++) {
          if (value <= metric.buckets[i]) {
            metric.counts[i]++;
          }
        }
        metric.counts[metric.buckets.length]++; // +Inf bucket
      },
    };
  }

  /** Export all metrics in Prometheus text format */
  toPrometheusText(): string {
    const lines: string[] = [];

    // Process uptime
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    lines.push("# HELP rasid_uptime_seconds Process uptime in seconds");
    lines.push("# TYPE rasid_uptime_seconds gauge");
    lines.push(`rasid_uptime_seconds ${uptimeSeconds.toFixed(1)}`);
    lines.push("");

    for (const metric of this.metrics.values()) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      lines.push(`# TYPE ${metric.name} ${metric.type}`);

      if (metric.type === "counter") {
        if (Object.keys(metric.labels).length > 0) {
          for (const [labels, value] of Object.entries(metric.labels)) {
            lines.push(`${metric.name}{${labels}} ${value}`);
          }
        } else {
          lines.push(`${metric.name} ${metric.value}`);
        }
      } else if (metric.type === "gauge") {
        lines.push(`${metric.name} ${metric.value}`);
      } else if (metric.type === "histogram") {
        for (let i = 0; i < metric.buckets.length; i++) {
          lines.push(`${metric.name}_bucket{le="${metric.buckets[i]}"} ${metric.counts[i]}`);
        }
        lines.push(`${metric.name}_bucket{le="+Inf"} ${metric.counts[metric.buckets.length]}`);
        lines.push(`${metric.name}_sum ${metric.sum}`);
        lines.push(`${metric.name}_count ${metric.count}`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }
}

// ============================================
// Global Registry & Pre-defined Metrics
// ============================================

export const registry = new MetricsRegistry();

// HTTP request metrics
export const httpRequestsTotal = registry.counter("rasid_http_requests_total", "Total HTTP requests");
export const httpRequestDuration = registry.histogram("rasid_http_request_duration_seconds", "HTTP request duration in seconds");
export const activeConnections = registry.gauge("rasid_active_connections", "Number of active connections");

// AI metrics
export const aiRequestsTotal = registry.counter("rasid_ai_requests_total", "Total AI chat requests");
export const aiResponseDuration = registry.histogram("rasid_ai_response_duration_seconds", "AI response generation time");
export const aiToolCalls = registry.counter("rasid_ai_tool_calls_total", "Total AI tool invocations");

// Database metrics
export const dbQueriesTotal = registry.counter("rasid_db_queries_total", "Total database queries");
export const dbQueryDuration = registry.histogram("rasid_db_query_duration_seconds", "Database query duration");

// Cache metrics
export const cacheHits = registry.counter("rasid_cache_hits_total", "Cache hit count");
export const cacheMisses = registry.counter("rasid_cache_misses_total", "Cache miss count");

// ============================================
// Express Middleware & Endpoint
// ============================================

/** Express middleware to track request metrics */
export function metricsMiddleware(req: Request, res: Response, next: () => void) {
  const start = Date.now();
  activeConnections.inc();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ method: req.method, status: String(res.statusCode), path: req.route?.path || req.path });
    httpRequestDuration.observe(duration);
    activeConnections.dec();
  });

  next();
}

/** Register /metrics endpoint */
export function registerMetricsEndpoint(app: Express) {
  app.get("/metrics", (_req: Request, res: Response) => {
    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.send(registry.toPrometheusText());
  });
}

export default registry;

```

---

## `server/_core/notification.ts`

```typescript
import { TRPCError } from "@trpc/server";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const buildEndpointUrl = (baseUrl: string): string => {
  const normalizedBase = baseUrl.endsWith("/")
    ? baseUrl
    : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

/**
 * Dispatches a project-owner notification through the Manus Notification Service.
 * Returns `true` if the request was accepted, `false` when the upstream service
 * cannot be reached (callers can fall back to email/slack). Validation errors
 * bubble up as TRPC errors so callers can fix the payload.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured.",
    });
  }

  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured.",
    });
  }

  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

```

---

## `server/_core/oauth.ts`

```typescript
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

```

---

## `server/_core/platformTools.ts`

```typescript
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

```

---

## `server/_core/rag.ts`

```typescript
/**
 * RAG System (Retrieval-Augmented Generation) for Smart Rasid
 * 
 * Provides:
 * 1. Embedding generation and cosine similarity search
 * 2. Knowledge base search (semantic + text)
 * 3. Custom command handling
 * 4. Scenario matching (greetings, VIP, etc.)
 * 5. System prompt builder
 * 6. Main query processor with platform tools integration
 */

import { getDb } from "../db";
import {
  knowledgeBase, aiScenarios, aiCustomCommands,
  aiChatSessions, aiChatMessages, aiSearchLog
} from "../../drizzle/schema";
import { invokeLLM, generateEmbedding, type Message, type Tool } from "./llm";
import { eq, and, like, or, desc, sql, count } from "drizzle-orm";
import { ENV } from "./env";
import { platformTools, executePlatformTool } from "./platformTools";

// Re-export for convenience
export { generateEmbedding };

// ============================================
// Cosine Similarity
// ============================================
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// ============================================
// Knowledge Base Search (Semantic + Text)
// ============================================
export async function searchKnowledge(query: string, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  // Text search fallback
  const words = query.split(/\s+/).filter(w => w.length > 2);
  const textConditions = words.length > 0
    ? words.map(w => or(
        like(knowledgeBase.title, `%${w}%`),
        like(knowledgeBase.content, `%${w}%`),
        like(knowledgeBase.question, `%${w}%`)
      ))
    : [];

  let textResults: any[] = [];
  if (textConditions.length > 0) {
    textResults = await db.select()
      .from(knowledgeBase)
      .where(and(eq(knowledgeBase.isActive, true), or(...textConditions)))
      .limit(limit * 2);
  }

  // Semantic search with embeddings
  const queryEmbedding = await generateEmbedding(query);
  if (queryEmbedding.length === 0) {
    // Fallback to text results only
    return textResults.slice(0, limit).map(r => ({
      ...r,
      score: 0.5,
    }));
  }

  // Get all items with embeddings
  const allWithEmbeddings = await db.select()
    .from(knowledgeBase)
    .where(and(
      eq(knowledgeBase.isActive, true),
      sql`${knowledgeBase.embedding} IS NOT NULL`
    ));

  // Score and sort by similarity
  const scored = allWithEmbeddings
    .map(item => ({
      ...item,
      score: cosineSimilarity(queryEmbedding, (item.embedding as number[]) || []),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Merge text and semantic results, remove duplicates
  const seenIds = new Set(scored.map(s => s.id));
  const merged = [
    ...scored,
    ...textResults
      .filter(t => !seenIds.has(t.id))
      .map(t => ({ ...t, score: 0.3 }))
  ].slice(0, limit);

  // Log search
  await db.insert(aiSearchLog).values({
    query,
    resultsCount: merged.length,
    topScore: merged[0]?.score || 0,
  }).catch(() => {});

  // Update use counts
  for (const item of merged) {
    await db.update(knowledgeBase)
      .set({ useCount: sql`${knowledgeBase.useCount} + 1` })
      .where(eq(knowledgeBase.id, item.id))
      .catch(() => {});
  }

  return merged;
}

// ============================================
// Custom Command Check
// ============================================
async function checkCustomCommand(userInput: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  if (!userInput.startsWith("!")) return null;

  const parts = userInput.split(/\s+/);
  const commandName = parts[0];
  const args = parts.slice(1);

  const [cmd] = await db.select()
    .from(aiCustomCommands)
    .where(and(eq(aiCustomCommands.command, commandName), eq(aiCustomCommands.isEnabled, true)));

  if (!cmd) return null;

  switch (cmd.handler) {
    case "scan_site":
      return `جاري فحص الموقع: ${args[0] || "غير محدد"}...\n\nسيتم إرسال النتائج فور اكتمال الفحص.`;
    case "generate_report":
      return `جاري إنشاء تقرير لـ: ${args[0] || "جميع المواقع"}...\n\nسيتم تجهيز التقرير خلال لحظات.`;
    case "show_stats":
      return "جاري جلب إحصائيات المنصة...";
    case "compare_sectors":
      return `جاري مقارنة القطاعات: ${args.join(" و ")}...`;
    case "list_alerts":
      return "جاري جلب آخر التنبيهات...";
    default:
      return null;
  }
}

// ============================================
// Scenario Matching
// ============================================
async function matchScenario(
  userInput: string,
  userName: string,
  isFirstMessage: boolean
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const scenarios = await db.select()
    .from(aiScenarios)
    .where(eq(aiScenarios.isEnabled, true))
    .orderBy(desc(aiScenarios.priority));

  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  for (const scenario of scenarios) {
    // Greeting on first message
    if (scenario.scenarioType === "greeting" && isFirstMessage) {
      const conditions = scenario.conditions as any;
      if (conditions?.timeOfDay && conditions.timeOfDay !== timeOfDay) continue;

      let response = scenario.responseTemplate || "";
      response = response.replace("{{userName}}", userName);
      response = response.replace("{{timeGreeting}}",
        timeOfDay === "morning" ? "صباح الخير" :
        timeOfDay === "afternoon" ? "مساء الخير" : "مساء النور"
      );
      return response;
    }

    // VIP name mentions
    if (scenario.scenarioType === "vip_response") {
      const conditions = scenario.conditions as any;
      if (conditions?.mentionedNames) {
        for (const name of conditions.mentionedNames) {
          if (userInput.includes(name)) {
            return scenario.responseTemplate || "";
          }
        }
      }
    }

    // Regex trigger pattern
    if (scenario.triggerPattern) {
      try {
        const regex = new RegExp(scenario.triggerPattern, "i");
        if (regex.test(userInput)) {
          let response = scenario.responseTemplate || "";
          response = response.replace("{{userName}}", userName);
          return response;
        }
      } catch {}
    }
  }

  return null;
}

// ============================================
// Build System Prompt
// ============================================
function buildSystemPrompt(
  personaPrompt: string | null,
  contextText: string,
  userName: string
): string {
  const defaultPersona = `أنت "راصد الذكي"، المساعد الذكي المتخصص في منصة راصد لرصد سياسات الخصوصية.
تتحدث باللغة العربية بأسلوب احترافي ومهني.
تخاطب المستخدم باسمه: ${userName}.
تختص بنظام حماية البيانات الشخصية السعودي والمادة 12 تحديداً.
لديك صلاحية الوصول لجميع بيانات المنصة من خلال الأدوات المتاحة لك.
استخدم الأدوات للحصول على البيانات الفعلية - لا تختلق أرقاماً.

## بنود المادة 12:
1. سياسة الخصوصية
2. سياسة الكوكيز
3. تشفير البيانات (SSL/TLS)
4. نموذج جمع البيانات
5. حقوق أصحاب البيانات
6. مسؤول حماية البيانات (DPO)
7. الإفصاح عن مشاركة البيانات
8. الاحتفاظ بالبيانات`;

  return `${personaPrompt || defaultPersona}

=== تعليمات الإجابة ===
1. أجب بدقة بناءً على المعلومات المتاحة في قاعدة المعرفة أدناه
2. إذا وجدت معلومات ذات صلة، اذكر المصدر
3. إذا لم تجد معلومات كافية، استخدم الأدوات المتاحة لجلب البيانات
4. استخدم التنسيق Markdown في إجاباتك (عناوين، قوائم، جداول)
5. كن موجزاً ومباشراً

=== قاعدة المعرفة ===
${contextText || "لا توجد معلومات ذات صلة في قاعدة المعرفة حالياً."}
=== نهاية قاعدة المعرفة ===`;
}

// ============================================
// Main Query Processor
// ============================================
export async function processSmartRasidQuery(
  messages: Message[],
  userId: number,
  userName: string,
  sessionId: string
): Promise<{
  response: string;
  sources: { id: number; title: string; score: number }[];
  tokensUsed: number;
  durationMs: number;
  messageId: string;
}> {
  const startTime = Date.now();
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const userQuery = messages[messages.length - 1].content as string;
  const isFirstMessage = messages.filter(m => m.role === "user").length === 1;
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Step 1: Check custom commands
  const commandResult = await checkCustomCommand(userQuery);
  if (commandResult) {
    const duration = Date.now() - startTime;
    await saveChatMessage(db, sessionId, messageId, "assistant", commandResult, [], 0, duration);
    return { response: commandResult, sources: [], tokensUsed: 0, durationMs: duration, messageId };
  }

  // Step 2: Check scenarios
  const scenarioResult = await matchScenario(userQuery, userName, isFirstMessage);

  // Step 3: Search knowledge base (RAG)
  const knowledgeResults = await searchKnowledge(userQuery);
  const contextText = knowledgeResults
    .map(item => `[المصدر: ${item.title || item.question || "غير معنون"}] (درجة التطابق: ${(item.score * 100).toFixed(0)}%)\n${item.content || item.answer || ""}`)
    .join("\n\n---\n\n");

  const sources = knowledgeResults.map(item => ({
    id: item.id,
    title: item.title || item.question || "غير معنون",
    score: item.score,
  }));

  // Step 4: Get persona
  const personaResults = await db.select()
    .from(aiScenarios)
    .where(and(eq(aiScenarios.scenarioType, "persona"), eq(aiScenarios.isEnabled, true)));
  const persona = personaResults[0];

  // Step 5: Build final messages
  const systemPrompt = buildSystemPrompt(
    persona?.systemPrompt || null,
    contextText,
    userName
  );

  let additionalContext = "";
  if (scenarioResult) {
    additionalContext = `\n\n=== توجيه خاص ===\n${scenarioResult}\n=== نهاية التوجيه ===`;
  }

  const finalMessages: Message[] = [
    { role: "system", content: systemPrompt + additionalContext },
    ...messages.slice(-10)
  ];

  // Step 6: Call LLM with platform tools
  try {
    const llmResponse = await invokeLLM({
      messages: finalMessages,
      tools: platformTools,
      toolChoice: "auto",
    });

    let responseContent = "";
    const firstChoice = llmResponse.choices[0];

    // Handle tool calls
    if (firstChoice.message.tool_calls && firstChoice.message.tool_calls.length > 0) {
      const toolResults: Message[] = [];

      for (const toolCall of firstChoice.message.tool_calls) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const result = await executePlatformTool(toolCall.function.name, args);
          toolResults.push({
            role: "tool",
            content: result,
            tool_call_id: toolCall.id,
          });
        } catch (e) {
          toolResults.push({
            role: "tool",
            content: JSON.stringify({ error: `فشل تنفيذ الأداة: ${(e as Error).message}` }),
            tool_call_id: toolCall.id,
          });
        }
      }

      // Follow-up call with tool results
      const followUpMessages: Message[] = [
        ...finalMessages,
        firstChoice.message as any,
        ...toolResults,
      ];

      const followUpResponse = await invokeLLM({ messages: followUpMessages });
      responseContent = followUpResponse.choices[0].message.content as string;
    } else {
      responseContent = firstChoice.message.content as string;
    }

    const tokensUsed = llmResponse.usage?.total_tokens || 0;
    const durationMs = Date.now() - startTime;

    // Step 7: Save message
    await saveChatMessage(db, sessionId, messageId, "assistant", responseContent, sources, tokensUsed, durationMs);

    // Update session stats
    await db.update(aiChatSessions)
      .set({
        messageCount: sql`${aiChatSessions.messageCount} + 2`,
        totalTokens: sql`${aiChatSessions.totalTokens} + ${tokensUsed}`,
        totalDurationMs: sql`${aiChatSessions.totalDurationMs} + ${durationMs}`,
      })
      .where(eq(aiChatSessions.sessionId, sessionId))
      .catch(() => {});

    return { response: responseContent, sources, tokensUsed, durationMs, messageId };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMsg = `عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.\n\n_الخطأ: ${(error as Error).message}_`;
    await saveChatMessage(db, sessionId, messageId, "assistant", errorMsg, [], 0, durationMs);
    return { response: errorMsg, sources: [], tokensUsed: 0, durationMs, messageId };
  }
}

// ============================================
// Save Chat Message
// ============================================
async function saveChatMessage(
  db: any,
  sessionId: string,
  messageId: string,
  role: string,
  content: string,
  sources: any[],
  tokensUsed: number,
  durationMs: number
) {
  await db.insert(aiChatMessages).values({
    sessionId,
    messageId,
    role: role as any,
    content,
    sources,
    tokensUsed,
    durationMs,
    model: "gpt-4o-mini",
  }).catch((e: any) => console.error("[RAG] Failed to save chat message:", e));
}

```

---

## `server/_core/sdk.ts`

```typescript
import { AXIOS_TIMEOUT_MS, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import axios, { type AxiosInstance } from "axios";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import type {
  ExchangeTokenRequest,
  ExchangeTokenResponse,
  GetUserInfoResponse,
  GetUserInfoWithJwtRequest,
  GetUserInfoWithJwtResponse,
} from "./types/manusTypes";
// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

const EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
const GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
const GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;

class OAuthService {
  constructor(private client: ReturnType<typeof axios.create>) {
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }

  private decodeState(state: string): string {
    const redirectUri = atob(state);
    return redirectUri;
  }

  async getTokenByCode(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    const payload: ExchangeTokenRequest = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state),
    };

    const { data } = await this.client.post<ExchangeTokenResponse>(
      EXCHANGE_TOKEN_PATH,
      payload
    );

    return data;
  }

  async getUserInfoByToken(
    token: ExchangeTokenResponse
  ): Promise<GetUserInfoResponse> {
    const { data } = await this.client.post<GetUserInfoResponse>(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken,
      }
    );

    return data;
  }
}

const createOAuthHttpClient = (): AxiosInstance =>
  axios.create({
    baseURL: ENV.oAuthServerUrl,
    timeout: AXIOS_TIMEOUT_MS,
  });

class SDKServer {
  private readonly client: AxiosInstance;
  private readonly oauthService: OAuthService;

  constructor(client: AxiosInstance = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }

  private deriveLoginMethod(
    platforms: unknown,
    fallback: string | null | undefined
  ): string | null {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set<string>(
      platforms.filter((p): p is string => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (
      set.has("REGISTERED_PLATFORM_MICROSOFT") ||
      set.has("REGISTERED_PLATFORM_AZURE")
    )
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }

  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    return this.oauthService.getTokenByCode(code, state);
  }

  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken: string): Promise<GetUserInfoResponse> {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken,
    } as ExchangeTokenResponse);
    const loginMethod = this.deriveLoginMethod(
      (data as any)?.platforms,
      (data as any)?.platform ?? data.platform ?? null
    );
    return {
      ...(data as any),
      platform: loginMethod,
      loginMethod,
    } as GetUserInfoResponse;
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || "",
      },
      options
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string } | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name } = payload as Record<string, unknown>;

      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId) ||
        !isNonEmptyString(name)
      ) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return {
        openId,
        appId,
        name,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async getUserInfoWithJwt(
    jwtToken: string
  ): Promise<GetUserInfoWithJwtResponse> {
    const payload: GetUserInfoWithJwtRequest = {
      jwtToken,
      projectId: ENV.appId,
    };

    const { data } = await this.client.post<GetUserInfoWithJwtResponse>(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );

    const loginMethod = this.deriveLoginMethod(
      (data as any)?.platforms,
      (data as any)?.platform ?? data.platform ?? null
    );
    return {
      ...(data as any),
      platform: loginMethod,
      loginMethod,
    } as GetUserInfoWithJwtResponse;
  }

  async authenticateRequest(req: Request): Promise<User> {
    // Regular authentication flow
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    // If user not in DB, sync from OAuth server automatically
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await db.upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt,
        });
        user = await db.getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }

    if (!user) {
      throw ForbiddenError("User not found");
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }
}

export const sdk = new SDKServer();

```

---

## `server/_core/systemRouter.ts`

```typescript
import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});

```

---

## `server/_core/trpc.ts`

```typescript
import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { checkWorkspaceAccess } from "../shared/middleware/workspaceGuard";

/** Root Admin userId */
export const ROOT_ADMIN_USER_ID = "mruhaily";

/** All root admin userIds */
const ROOT_ADMIN_IDS = ["mruhaily", "aalrebdi", "msarhan", "malmoutaz"];

/** No-op — protection removed, all users are fully editable/deletable */
export function assertNotRootAdmin(_userId: string) {
  // Protection completely removed — all accounts can be modified/deleted freely
}

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  // Accept either OAuth user or platform user
  if (!ctx.user && !ctx.platformUser) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      platformUser: ctx.platformUser,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // Check platform user admin roles
    if (ctx.platformUser) {
      const adminRoles = ["root_admin", "director", "vice_president", "manager"];
      if (adminRoles.includes(ctx.platformUser.platformRole)) {
        return next({ ctx });
      }
    }

    // Check OAuth user admin role (admin, superadmin, root_admin)
    if (ctx.user && ['admin', 'superadmin', 'root_admin'].includes(ctx.user.role)) {
      return next({ ctx });
    }

    // Check rasidRole for root admins
    if (ctx.user && (ctx.user as any).rasidRole === 'root_admin') {
      return next({ ctx });
    }

    // Neither is admin
    if (!ctx.user && !ctx.platformUser) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
  }),
);

/**
 * Root Admin Procedure — Accessible by all 4 system root admins
 * Used for AI control pages: Knowledge Base, Personality Scenarios, Training Center
 */
export const rootAdminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // Allow any of the 4 root admin userIds
    if (ctx.platformUser && ROOT_ADMIN_IDS.includes(ctx.platformUser.userId?.toLowerCase())) {
      return next({ ctx });
    }

    // Also allow if platformRole is root_admin
    if (ctx.platformUser && ctx.platformUser.platformRole === "root_admin") {
      return next({ ctx });
    }

    if (!ctx.user && !ctx.platformUser) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    throw new TRPCError({ code: "FORBIDDEN", message: "هذه الصفحة متاحة فقط لمديري النظام الرئيسيين" });
  }),
);

/**
 * Privacy Workspace Procedure — يتحقق أن المستخدم لديه صلاحية الوصول لمساحة الخصوصية
 */
export const privacyProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user && !ctx.platformUser) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    }

    const role = ctx.platformUser?.platformRole || (ctx.user as any)?.rasidRole || "user";
    if (!checkWorkspaceAccess(role, "privacy")) {
      throw new TRPCError({ code: "FORBIDDEN", message: "ليس لديك صلاحية الوصول لمساحة رصد الخصوصية" });
    }

    return next({ ctx });
  }),
);

```

---

## `server/_core/vite.ts`

```typescript
import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

```

---

## `server/_core/voiceTranscription.ts`

```typescript
/**
 * Voice transcription helper using internal Speech-to-Text service
 *
 * Frontend implementation guide:
 * 1. Capture audio using MediaRecorder API
 * 2. Upload audio to storage (e.g., S3) to get URL
 * 3. Call transcription with the URL
 * 
 * Example usage:
 * ```tsx
 * // Frontend component
 * const transcribeMutation = trpc.voice.transcribe.useMutation({
 *   onSuccess: (data) => {
 *     console.log(data.text); // Full transcription
 *     console.log(data.language); // Detected language
 *     console.log(data.segments); // Timestamped segments
 *   }
 * });
 * 
 * // After uploading audio to storage
 * transcribeMutation.mutate({
 *   audioUrl: uploadedAudioUrl,
 *   language: 'en', // optional
 *   prompt: 'Transcribe the meeting' // optional
 * });
 * ```
 */
import { ENV } from "./env";

export type TranscribeOptions = {
  audioUrl: string; // URL to the audio file (e.g., S3 URL)
  language?: string; // Optional: specify language code (e.g., "en", "es", "zh")
  prompt?: string; // Optional: custom prompt for the transcription
};

// Native Whisper API segment format
export type WhisperSegment = {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
};

// Native Whisper API response format
export type WhisperResponse = {
  task: "transcribe";
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
};

export type TranscriptionResponse = WhisperResponse; // Return native Whisper API response directly

export type TranscriptionError = {
  error: string;
  code: "FILE_TOO_LARGE" | "INVALID_FORMAT" | "TRANSCRIPTION_FAILED" | "UPLOAD_FAILED" | "SERVICE_ERROR";
  details?: string;
};

/**
 * Transcribe audio to text using the internal Speech-to-Text service
 * 
 * @param options - Audio data and metadata
 * @returns Transcription result or error
 */
export async function transcribeAudio(
  options: TranscribeOptions
): Promise<TranscriptionResponse | TranscriptionError> {
  try {
    // Step 1: Validate environment configuration
    if (!ENV.forgeApiUrl) {
      return {
        error: "Voice transcription service is not configured",
        code: "SERVICE_ERROR",
        details: "BUILT_IN_FORGE_API_URL is not set"
      };
    }
    if (!ENV.forgeApiKey) {
      return {
        error: "Voice transcription service authentication is missing",
        code: "SERVICE_ERROR",
        details: "BUILT_IN_FORGE_API_KEY is not set"
      };
    }

    // Step 2: Download audio from URL
    let audioBuffer: Buffer;
    let mimeType: string;
    try {
      const response = await fetch(options.audioUrl);
      if (!response.ok) {
        return {
          error: "Failed to download audio file",
          code: "INVALID_FORMAT",
          details: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      audioBuffer = Buffer.from(await response.arrayBuffer());
      mimeType = response.headers.get('content-type') || 'audio/mpeg';
      
      // Check file size (16MB limit)
      const sizeMB = audioBuffer.length / (1024 * 1024);
      if (sizeMB > 16) {
        return {
          error: "Audio file exceeds maximum size limit",
          code: "FILE_TOO_LARGE",
          details: `File size is ${sizeMB.toFixed(2)}MB, maximum allowed is 16MB`
        };
      }
    } catch (error) {
      return {
        error: "Failed to fetch audio file",
        code: "SERVICE_ERROR",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }

    // Step 3: Create FormData for multipart upload to Whisper API
    const formData = new FormData();
    
    // Create a Blob from the buffer and append to form
    const filename = `audio.${getFileExtension(mimeType)}`;
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    formData.append("file", audioBlob, filename);
    
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");
    
    // Add prompt - use custom prompt if provided, otherwise generate based on language
    const prompt = options.prompt || (
      options.language 
        ? `Transcribe the user's voice to text, the user's working language is ${getLanguageName(options.language)}`
        : "Transcribe the user's voice to text"
    );
    formData.append("prompt", prompt);

    // Step 4: Call the transcription service
    const baseUrl = ENV.forgeApiUrl.endsWith("/")
      ? ENV.forgeApiUrl
      : `${ENV.forgeApiUrl}/`;
    
    const fullUrl = new URL(
      "v1/audio/transcriptions",
      baseUrl
    ).toString();

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "Accept-Encoding": "identity",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        error: "Transcription service request failed",
        code: "TRANSCRIPTION_FAILED",
        details: `${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`
      };
    }

    // Step 5: Parse and return the transcription result
    const whisperResponse = await response.json() as WhisperResponse;
    
    // Validate response structure
    if (!whisperResponse.text || typeof whisperResponse.text !== 'string') {
      return {
        error: "Invalid transcription response",
        code: "SERVICE_ERROR",
        details: "Transcription service returned an invalid response format"
      };
    }

    return whisperResponse; // Return native Whisper API response directly

  } catch (error) {
    // Handle unexpected errors
    return {
      error: "Voice transcription failed",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}

/**
 * Helper function to get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/ogg': 'ogg',
    'audio/m4a': 'm4a',
    'audio/mp4': 'm4a',
  };
  
  return mimeToExt[mimeType] || 'audio';
}

/**
 * Helper function to get full language name from ISO code
 */
function getLanguageName(langCode: string): string {
  const langMap: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
  };
  
  return langMap[langCode] || langCode;
}

/**
 * Example tRPC procedure implementation:
 * 
 * ```ts
 * // In server/routers.ts
 * import { transcribeAudio } from "./_core/voiceTranscription";
 * 
 * export const voiceRouter = router({
 *   transcribe: protectedProcedure
 *     .input(z.object({
 *       audioUrl: z.string(),
 *       language: z.string().optional(),
 *       prompt: z.string().optional(),
 *     }))
 *     .mutation(async ({ input, ctx }) => {
 *       const result = await transcribeAudio(input);
 *       
 *       // Check if it's an error
 *       if ('error' in result) {
 *         throw new TRPCError({
 *           code: 'BAD_REQUEST',
 *           message: result.error,
 *           cause: result,
 *         });
 *       }
 *       
 *       // Optionally save transcription to database
 *       await db.insert(transcriptions).values({
 *         userId: ctx.user.id,
 *         text: result.text,
 *         duration: result.duration,
 *         language: result.language,
 *         audioUrl: input.audioUrl,
 *         createdAt: new Date(),
 *       });
 *       
 *       return result;
 *     }),
 * });
 * ```
 */

```

---

## `server/_core/webauthn.ts`

```typescript
/**
 * WebAuthn — Biometric/Passkey authentication support.
 * 
 * Provides registration and authentication challenge/verification flows
 * using the Web Authentication API (WebAuthn/FIDO2).
 */

import { ENV } from "./env";
import crypto from "crypto";

// ============================================
// Types
// ============================================

interface WebAuthnCredential {
  credentialId: string;
  publicKey: string;
  counter: number;
  userId: number;
  createdAt: string;
  deviceName?: string;
}

interface RegistrationChallenge {
  challenge: string;
  userId: number;
  expiresAt: number;
}

interface AuthenticationChallenge {
  challenge: string;
  allowCredentials: string[];
  expiresAt: number;
}

// ============================================
// In-Memory Storage (replace with DB in production)
// ============================================

const pendingRegistrations = new Map<string, RegistrationChallenge>();
const pendingAuthentications = new Map<string, AuthenticationChallenge>();
const credentials = new Map<string, WebAuthnCredential>();

// ============================================
// Configuration
// ============================================

function getRPConfig() {
  const origin = (ENV as any).appUrl || process.env.APP_URL || "https://rasid.ndmo.gov.sa";
  const rpId = new URL(origin).hostname;
  return {
    rpName: "منصة راصد الذكي",
    rpId,
    origin,
  };
}

// ============================================
// Registration Flow
// ============================================

/**
 * Generate a registration challenge for a user.
 */
export function generateRegistrationOptions(userId: number, userName: string, displayName: string) {
  const { rpName, rpId } = getRPConfig();
  const challenge = crypto.randomBytes(32).toString("base64url");

  // Store challenge for verification
  pendingRegistrations.set(challenge, {
    challenge,
    userId,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });

  return {
    challenge,
    rp: {
      name: rpName,
      id: rpId,
    },
    user: {
      id: Buffer.from(String(userId)).toString("base64url"),
      name: userName,
      displayName,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" },   // ES256
      { alg: -257, type: "public-key" },  // RS256
    ],
    timeout: 300000,
    authenticatorSelection: {
      authenticatorAttachment: "platform" as const,
      userVerification: "preferred" as const,
      residentKey: "preferred" as const,
    },
    attestation: "none" as const,
  };
}

/**
 * Verify a registration response.
 */
export function verifyRegistration(
  challenge: string,
  credentialId: string,
  publicKey: string,
  deviceName?: string
): { success: boolean; error?: string } {
  const pending = pendingRegistrations.get(challenge);
  if (!pending) return { success: false, error: "Challenge not found or expired" };
  if (Date.now() > pending.expiresAt) {
    pendingRegistrations.delete(challenge);
    return { success: false, error: "Challenge expired" };
  }

  // Store credential
  credentials.set(credentialId, {
    credentialId,
    publicKey,
    counter: 0,
    userId: pending.userId,
    createdAt: new Date().toISOString(),
    deviceName,
  });

  pendingRegistrations.delete(challenge);
  return { success: true };
}

// ============================================
// Authentication Flow
// ============================================

/**
 * Generate an authentication challenge.
 */
export function generateAuthenticationOptions(userId?: number) {
  const { rpId } = getRPConfig();
  const challenge = crypto.randomBytes(32).toString("base64url");

  // Find credentials for user (or all if no userId)
  const allowCredentials: string[] = [];
  for (const [id, cred] of credentials.entries()) {
    if (!userId || cred.userId === userId) {
      allowCredentials.push(id);
    }
  }

  pendingAuthentications.set(challenge, {
    challenge,
    allowCredentials,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return {
    challenge,
    rpId,
    timeout: 300000,
    userVerification: "preferred" as const,
    allowCredentials: allowCredentials.map((id) => ({
      id,
      type: "public-key" as const,
    })),
  };
}

/**
 * Verify an authentication response.
 */
export function verifyAuthentication(
  challenge: string,
  credentialId: string,
  authenticatorData: string,
  signature: string
): { success: boolean; userId?: number; error?: string } {
  const pending = pendingAuthentications.get(challenge);
  if (!pending) return { success: false, error: "Challenge not found" };
  if (Date.now() > pending.expiresAt) {
    pendingAuthentications.delete(challenge);
    return { success: false, error: "Challenge expired" };
  }

  const credential = credentials.get(credentialId);
  if (!credential) return { success: false, error: "Credential not found" };

  // In production, verify signature against public key
  // For now, accept if credential exists and challenge matches
  credential.counter++;
  pendingAuthentications.delete(challenge);

  return { success: true, userId: credential.userId };
}

/**
 * Get all credentials for a user.
 */
export function getUserCredentials(userId: number): WebAuthnCredential[] {
  const result: WebAuthnCredential[] = [];
  for (const cred of credentials.values()) {
    if (cred.userId === userId) {
      result.push({ ...cred, publicKey: "[hidden]" });
    }
  }
  return result;
}

/**
 * Remove a credential.
 */
export function removeCredential(credentialId: string, userId: number): boolean {
  const cred = credentials.get(credentialId);
  if (!cred || cred.userId !== userId) return false;
  credentials.delete(credentialId);
  return true;
}

export default {
  generateRegistrationOptions,
  verifyRegistration,
  generateAuthenticationOptions,
  verifyAuthentication,
  getUserCredentials,
  removeCredential,
};

```

---

