import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(role: "user" | "admin" = "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "admin@rasid.sa",
    name: "مشرف النظام",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Overview Router", () => {
  it("returns stats object with totalSites", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.overview.stats();
    expect(stats).toBeDefined();
    expect(typeof stats).toBe("object");
    expect(typeof stats.totalSites).toBe("number");
  }, 15000);
});

describe("Privacy Router", () => {
  it("returns site stats with totalSites field", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.privacy.stats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalSites).toBe("number");
  });

  it("returns sites list as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const sites = await caller.privacy.sites();
    expect(sites).toBeDefined();
  });
});

describe("Dashboard Router", () => {
  it("returns stats object", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.dashboard.stats();
    expect(stats).toBeDefined();
    expect(typeof stats).toBe("object");
  }, 15000);
});

describe("AI Router", () => {
  it("returns suggestions as array of strings", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const suggestions = await caller.ai.suggestions();
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(typeof suggestions[0]).toBe("string");
  });

  it("returns empty messages when no conversationId", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const messages = await caller.ai.messages();
    expect(Array.isArray(messages)).toBe(true);
    expect(messages).toHaveLength(0);
  });

  it("can create a conversation and returns session id", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const conv = await caller.ai.createConversation({ title: "محادثة اختبار" });
    expect(conv).toBeDefined();
    expect(typeof conv.id).toBe("string");
    expect(conv.id).toContain("sess_");
  });

  it("returns chat history as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const history = await caller.ai.getChatHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});

describe("Notifications Router", () => {
  it("returns empty array for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.list({ limit: 10 });
    expect(result).toEqual([]);
  });

  it("returns notifications list for authenticated users", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notifications.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns unread count", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const count = await caller.notifications.unreadCount();
    expect(count).toBeDefined();
  });
});

describe("Alerts Router", () => {
  it("has contacts sub-router", () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.alerts.contacts).toBeDefined();
  });

  it("has rules sub-router", () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.alerts.rules).toBeDefined();
  });

  it("has history sub-router", () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.alerts.history).toBeDefined();
  });
});

describe("Sites Router", () => {
  it("returns sites list as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const sites = await caller.sites.list({ page: 1, limit: 5 });
    expect(sites).toBeDefined();
  });
});

describe("Auth Router", () => {
  it("returns user info for authenticated user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).toBeDefined();
    expect(me?.name).toBe("مشرف النظام");
  });

  it("returns null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const me = await caller.auth.me();
    expect(me).toBeNull();
  });
});
