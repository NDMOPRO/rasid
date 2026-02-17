import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Platform Router Structure", () => {
  it("should have all required top-level routers", () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // Check that key routers exist by verifying the router structure
    expect(caller.auth).toBeDefined();
    expect(caller.dashboard).toBeDefined();
    expect(caller.sites).toBeDefined();
    expect(caller.scans).toBeDefined();
    expect(caller.notifications).toBeDefined();
    expect(caller.ai).toBeDefined();
    expect(caller.alerts).toBeDefined();
    expect(caller.admin).toBeDefined();
  });

  it("should have ai sub-procedures for SmartRasidFAB", () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    // These are needed by SmartRasidFAB component
    expect(caller.ai.messages).toBeDefined();
    expect(caller.ai.suggestions).toBeDefined();
    expect(caller.ai.createConversation).toBeDefined();
    expect(caller.ai.sendMessage).toBeDefined();
  });

  it("should have alerts sub-routers", () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    expect(caller.alerts.contacts).toBeDefined();
    expect(caller.alerts.rules).toBeDefined();
    expect(caller.alerts.history).toBeDefined();
    expect(caller.alerts.stats).toBeDefined();
  });

  it("notifications.list should return empty array for unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.notifications.list({ limit: 10 });
    expect(result).toEqual([]);
  });

  it("should have privacy, incidents, followups, overview routers", () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    expect(caller.privacy).toBeDefined();
    expect(caller.incidents).toBeDefined();
    expect(caller.followups).toBeDefined();
    expect(caller.overview).toBeDefined();
  });
});
