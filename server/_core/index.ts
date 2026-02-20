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

  // ─── Seed Data — ensure new tables and initial data ──────────
  initSeedData().catch(err => console.warn("[SeedData] Non-critical init error:", err.message));

  // ─── CMS Import Upload Route ────────────────────────────────
  const uploadStorage = multer({
    dest: "/tmp/rasid-uploads/",
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max
  });

  app.post("/api/cms/import/upload", uploadStorage.single("file"), async (req, res) => {
    try {
      // Basic auth check via session cookie
      if (!(req as any).session?.userId && !(req as any).user) {
        // Try to get user from cookie-based auth
        const ctx = await createContext({ req, res } as any);
        if (!ctx.user || (ctx.user as any).platformRole === "viewer") {
          res.status(403).json({ error: "Admin access required" });
          return;
        }
        const file = req.file;
        if (!file) {
          res.status(400).json({ error: "No file uploaded" });
          return;
        }
        const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
        const fileType = (["zip", "json", "xlsx", "csv"].includes(ext) ? ext : "json") as "zip" | "json" | "xlsx" | "csv";
        const result = await processImport(
          file.path,
          fileType,
          (ctx.user as any).id || 0,
          (ctx.user as any).displayName || "Admin"
        );
        res.json(result);
        return;
      }
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
      const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
      const fileType = (["zip", "json", "xlsx", "csv"].includes(ext) ? ext : "json") as "zip" | "json" | "xlsx" | "csv";
      const result = await processImport(file.path, fileType, 0, "Admin");
      res.json(result);
    } catch (err: any) {
      console.error("Import error:", err);
      res.status(500).json({ error: err.message || "Import failed" });
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
