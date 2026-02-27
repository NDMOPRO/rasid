/**
 * SSE Chat Endpoint — Streams Rasid AI responses token-by-token
 * Supports domain isolation (GOV-01), naming policy (NAME-07), and page context pack (UI-06)
 *
 * POST /api/rasid/stream
 * Body: {
 *   message: string,
 *   domain?: "leaks" | "privacy",
 *   conversationId?: string,
 *   history: Array<{ role: "user" | "assistant", content: string }>,
 *   pageContext?: PageContextPack
 * }
 * Response: Server-Sent Events stream with typed events:
 *   - event: status     → { phase: string, message: string }
 *   - event: token      → { text: string }
 *   - event: thinking   → ThinkingStep
 *   - event: tool       → { name: string, status: string, domain: string }
 *   - event: toolResult → { type: string, data: any }
 *   - event: navigation → { targetPage: string, reason: string, requiresConsent: true }
 *   - event: meta       → { toolsUsed, followUpSuggestions, processingMeta, domain }
 *   - event: done       → { response: string, domain: string }
 *   - event: error      → { message: string }
 *   - event: heartbeat  → { ts: number }
 */
import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { jwtVerify } from "jose";
import { ENV } from "./_core/env";
import { getPlatformUserById } from "./db";
import { rasidAIChatStreaming } from "./rasidAI";
import { type Domain, getDomainFromRoute, validatePageContext, enforceNamingPolicy } from "./domainIsolation";

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

    const { message, history, pageContext, domain: requestedDomain, conversationId } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Determine domain from request or page context (GOV-01, API-01)
    const domain: Domain = requestedDomain ||
      (pageContext?.route ? getDomainFromRoute(pageContext.route) : 'leaks');

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

    // Build enhanced Page Context Pack (UI-06, UI-07, PR-12)
    let enhancedMessage = message;
    if (pageContext && typeof pageContext === "object") {
      const ctx = validatePageContext(pageContext);
      const contextParts: string[] = [];
      contextParts.push(`المجال: ${domain === 'leaks' ? 'التسربات' : 'الخصوصية'}`);
      if (ctx.route) contextParts.push(`المسار: ${ctx.route}`);
      if (ctx.pageId) contextParts.push(`الصفحة: ${ctx.pageId}`);
      if (ctx.userRole) contextParts.push(`الدور: ${ctx.userRole}`);
      if (ctx.currentEntityId) contextParts.push(`الكيان: ${ctx.currentEntityType}#${ctx.currentEntityId}`);
      if (Object.keys(ctx.activeFilters).length > 0) contextParts.push(`الفلاتر: ${JSON.stringify(ctx.activeFilters)}`);
      if (ctx.availableActions.length > 0) contextParts.push(`الإجراءات: ${ctx.availableActions.join(', ')}`);
      enhancedMessage = `[سياق الصفحة: ${contextParts.join(" | ")}]\n\n${message}`;
    }

    try {
      const startTime = Date.now();

      // Send initial status (API-04)
      sendEvent("status", { phase: "understanding", message: "جارٍ فهم السؤال..." });

      await rasidAIChatStreaming(
        enhancedMessage,
        history ?? [],
        user.name,
        user.id,
        {
          onToken: (text: string) => {
            // Enforce naming policy on streamed tokens for leaks domain (NAME-07)
            const safeText = domain === 'leaks' ? enforceNamingPolicy(text) : text;
            sendEvent("token", { text: safeText });
          },
          onThinkingStep: (step: any) => {
            sendEvent("thinking", step);
          },
          onToolStart: (name: string) => {
            sendEvent("status", { phase: "fetching", message: "جارٍ جلب البيانات..." });
            sendEvent("tool", { name, status: "running", domain });
          },
          onToolEnd: (name: string, result: any) => {
            sendEvent("tool", { name, status: "completed", domain });
            if (result?.__type === "chart" || result?.__type === "dashboard") {
              sendEvent("toolResult", result);
            }
            // Handle navigation suggestion (CHAT-03, PR-11)
            if (result?.__type === "navigation") {
              sendEvent("navigation", {
                targetPage: result.targetPage,
                reason: result.reason,
                requiresConsent: true,
              });
            }
          },
          onFollowUp: (suggestions: string[]) => {
            sendEvent("meta", { followUpSuggestions: suggestions, domain });
          },
          onDone: (result: any) => {
            const processingTime = Date.now() - startTime;
            // Enforce naming policy on final response (NAME-07)
            const safeResponse = domain === 'leaks'
              ? enforceNamingPolicy(result.response)
              : result.response;
            sendEvent("done", {
              response: safeResponse,
              domain,
              conversationId,
              toolsUsed: result.toolsUsed,
              thinkingSteps: result.thinkingSteps,
              followUpSuggestions: result.followUpSuggestions,
              processingMeta: {
                ...result.processingMeta,
                domain,
                totalProcessingTimeMs: processingTime,
                streamedAt: new Date().toISOString(),
              },
              toolResults: result.toolResults,
            });
          },
          onError: (error: string) => {
            sendEvent("error", { message: error, recoverable: true, domain });
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
