/**
 * SSE Chat Endpoint — Streams Rasid AI responses token-by-token
 * 
 * POST /api/rasid/stream
 * Body: { message: string, history: Array<{ role: "user" | "assistant", content: string }>, pageContext?: object }
 * Response: Server-Sent Events stream with typed events:
 *   - event: token      → { text: string }
 *   - event: thinking   → ThinkingStep
 *   - event: tool       → { name: string, status: string }
 *   - event: toolResult → { type: string, data: any }
 *   - event: meta       → { toolsUsed, followUpSuggestions, processingMeta }
 *   - event: done       → { response: string }
 *   - event: error      → { message: string }
 *   - event: heartbeat  → { ts: number }
 */
import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { jwtVerify } from "jose";
import { ENV } from "./_core/env";
import { getPlatformUserById } from "./db";
import { rasidAIChatStreaming } from "./rasidAI";

const PLATFORM_COOKIE = "platform_session";

async function authenticateSSE(req: Request): Promise<{ id: number; name: string } | null> {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    const cookies = parseCookieHeader(cookieHeader);
    const token = cookies[PLATFORM_COOKIE];
    if (!token) return null;
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const platformUserId = payload.platformUserId as number | undefined;
    if (!platformUserId) return null;
    const user = await getPlatformUserById(platformUserId);
    if (!user || user.status !== "active") return null;
    return { id: user.id, name: (user.displayName ?? user.name) as string };
  } catch {
    return null;
  }
}

export function registerSSERoutes(app: Express) {
  app.post("/api/rasid/stream", async (req: Request, res: Response) => {
    // Authenticate
    const user = await authenticateSSE(req);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { message, history, pageContext } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Set SSE headers with reconnection support
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
      "Access-Control-Allow-Origin": "*",
    });

    // Send initial retry interval for auto-reconnection (3 seconds)
    res.write("retry: 3000\n\n");

    // Helper to send SSE events with ID for reconnection
    let eventId = 0;
    const sendEvent = (event: string, data: any) => {
      if (clientDisconnected) return;
      eventId++;
      res.write(`id: ${eventId}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Track if client disconnected
    let clientDisconnected = false;
    req.on("close", () => {
      clientDisconnected = true;
      clearInterval(heartbeatInterval);
    });

    // Heartbeat to keep connection alive (every 15 seconds)
    const heartbeatInterval = setInterval(() => {
      if (!clientDisconnected) {
        res.write(`event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);
      }
    }, 15000);

    // Build enhanced message with page context if available
    let enhancedMessage = message;
    if (pageContext && typeof pageContext === "object") {
      const ctx = pageContext as Record<string, any>;
      const contextParts: string[] = [];
      if (ctx.pageName) contextParts.push(`الصفحة الحالية: ${ctx.pageName}`);
      if (ctx.pageUrl) contextParts.push(`الرابط: ${ctx.pageUrl}`);
      if (ctx.selectedData) contextParts.push(`البيانات المحددة: ${JSON.stringify(ctx.selectedData)}`);
      if (ctx.filters) contextParts.push(`الفلاتر النشطة: ${JSON.stringify(ctx.filters)}`);
      if (contextParts.length > 0) {
        enhancedMessage = `[سياق الصفحة: ${contextParts.join(" | ")}]\n\n${message}`;
      }
    }

    try {
      const startTime = Date.now();

      await rasidAIChatStreaming(
        enhancedMessage,
        history ?? [],
        user.name,
        user.id,
        {
          onToken: (text: string) => {
            sendEvent("token", { text });
          },
          onThinkingStep: (step: any) => {
            sendEvent("thinking", step);
          },
          onToolStart: (name: string) => {
            sendEvent("tool", { name, status: "running" });
          },
          onToolEnd: (name: string, result: any) => {
            sendEvent("tool", { name, status: "completed" });
            if (result?.__type === "chart" || result?.__type === "dashboard") {
              sendEvent("toolResult", result);
            }
          },
          onFollowUp: (suggestions: string[]) => {
            sendEvent("meta", { followUpSuggestions: suggestions });
          },
          onDone: (result: any) => {
            const processingTime = Date.now() - startTime;
            sendEvent("done", {
              response: result.response,
              toolsUsed: result.toolsUsed,
              thinkingSteps: result.thinkingSteps,
              followUpSuggestions: result.followUpSuggestions,
              processingMeta: {
                ...result.processingMeta,
                totalProcessingTimeMs: processingTime,
                streamedAt: new Date().toISOString(),
              },
              toolResults: result.toolResults,
            });
          },
          onError: (error: string) => {
            sendEvent("error", { message: error, recoverable: true });
          },
        }
      );
    } catch (err: any) {
      console.error("[SSE] Stream error:", err);
      sendEvent("error", { message: err.message || "Internal error", recoverable: false });
    } finally {
      clearInterval(heartbeatInterval);
      if (!clientDisconnected) {
        res.end();
      }
    }
  });
}
