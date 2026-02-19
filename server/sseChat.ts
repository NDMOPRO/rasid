/**
 * SSE Chat Endpoint — Streams Rasid AI responses token-by-token
 * 
 * POST /api/rasid/stream
 * Body: { message: string, history: Array<{ role: "user" | "assistant", content: string }> }
 * Response: Server-Sent Events stream with typed events:
 *   - event: token      → { text: string }
 *   - event: thinking   → ThinkingStep
 *   - event: tool       → { name: string, status: string }
 *   - event: toolResult → { type: string, data: any }
 *   - event: meta       → { toolsUsed, followUpSuggestions, processingMeta }
 *   - event: done       → { response: string }
 *   - event: error      → { message: string }
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

    const { message, history } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
    });

    // Helper to send SSE events
    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Track if client disconnected
    let clientDisconnected = false;
    req.on("close", () => {
      clientDisconnected = true;
    });

    try {
      await rasidAIChatStreaming(
        message,
        history ?? [],
        user.name,
        user.id,
        {
          onToken: (text: string) => {
            if (!clientDisconnected) sendEvent("token", { text });
          },
          onThinkingStep: (step: any) => {
            if (!clientDisconnected) sendEvent("thinking", step);
          },
          onToolStart: (name: string) => {
            if (!clientDisconnected) sendEvent("tool", { name, status: "running" });
          },
          onToolEnd: (name: string, result: any) => {
            if (!clientDisconnected) {
              sendEvent("tool", { name, status: "completed" });
              if (result?.__type === "chart" || result?.__type === "dashboard") {
                sendEvent("toolResult", result);
              }
            }
          },
          onFollowUp: (suggestions: string[]) => {
            if (!clientDisconnected) sendEvent("meta", { followUpSuggestions: suggestions });
          },
          onDone: (result: any) => {
            if (!clientDisconnected) {
              sendEvent("done", {
                response: result.response,
                toolsUsed: result.toolsUsed,
                thinkingSteps: result.thinkingSteps,
                followUpSuggestions: result.followUpSuggestions,
                processingMeta: result.processingMeta,
                toolResults: result.toolResults,
              });
            }
          },
          onError: (error: string) => {
            if (!clientDisconnected) sendEvent("error", { message: error });
          },
        }
      );
    } catch (err: any) {
      console.error("[SSE] Stream error:", err);
      if (!clientDisconnected) {
        sendEvent("error", { message: err.message || "Internal error" });
      }
    } finally {
      if (!clientDisconnected) {
        res.end();
      }
    }
  });
}
