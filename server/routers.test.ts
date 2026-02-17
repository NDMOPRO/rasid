import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(role: "user" | "admin" | "superadmin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@ndmo.gov.sa",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Overview Router", () => {
  it("returns stats object with sites, incidents, and followups", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.overview.stats();
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty("sites");
    expect(stats).toHaveProperty("incidents");
    expect(stats).toHaveProperty("followups");
    expect(typeof stats.sites.total).toBe("number");
    expect(typeof stats.incidents.total).toBe("number");
    expect(typeof stats.followups.total).toBe("number");
  }, 15000);
});

describe("Privacy Router", () => {
  it("returns site stats with expected fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.privacy.stats();
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("compliant");
    expect(stats).toHaveProperty("nonCompliant");
    expect(stats).toHaveProperty("noPolicy");
    expect(stats).toHaveProperty("noContact");
  });

  it("returns sites list as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const sites = await caller.privacy.sites({ limit: 10, offset: 0 });
    expect(Array.isArray(sites)).toBe(true);
  });
});

describe("Incidents Router", () => {
  it("returns incident stats with expected fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.incidents.stats();
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("investigating");
    expect(stats).toHaveProperty("confirmed");
  });

  it("returns incidents list as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const incidents = await caller.incidents.list({ limit: 10, offset: 0 });
    expect(Array.isArray(incidents)).toBe(true);
  });
});

describe("Followups Router", () => {
  it("returns followup stats with expected fields", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.followups.stats();
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty("total");
    expect(stats).toHaveProperty("open");
    expect(stats).toHaveProperty("inProgress");
    expect(stats).toHaveProperty("completed");
  });

  it("returns followups list as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const followups = await caller.followups.list({ limit: 10, offset: 0 });
    expect(Array.isArray(followups)).toBe(true);
  });
});

describe("AI Router", () => {
  it("returns conversations as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const conversations = await caller.ai.conversations();
    expect(Array.isArray(conversations)).toBe(true);
  });

  it("returns glossary as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const glossary = await caller.ai.glossary();
    expect(Array.isArray(glossary)).toBe(true);
    // We seeded 10 terms
    expect(glossary.length).toBeGreaterThanOrEqual(1);
  });

  it("returns suggestions based on route", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const suggestions = await caller.ai.suggestions({ route: "/app/privacy" });
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it("returns different suggestions for different routes", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const privacySuggestions = await caller.ai.suggestions({ route: "/app/privacy" });
    const incidentSuggestions = await caller.ai.suggestions({ route: "/app/incidents" });
    expect(privacySuggestions).not.toEqual(incidentSuggestions);
  });

  it("can create a conversation", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const conv = await caller.ai.createConversation({ title: "Test Conversation" });
    expect(conv).toBeDefined();
    expect(conv.id).toBeDefined();
    expect(conv.title).toBe("Test Conversation");
  });
});

describe("Admin Router", () => {
  it("returns users list for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    const users = await caller.admin.users();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThanOrEqual(1);
  });

  it("returns settings list for admin", async () => {
    const ctx = createMockContext("admin");
    const caller = appRouter.createCaller(ctx);
    const settings = await caller.admin.settings();
    expect(Array.isArray(settings)).toBe(true);
  });
});

describe("Verify Router (Public)", () => {
  it("returns null for non-existent verification code", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.verify.check({ code: "NONEXISTENT_CODE" });
    expect(result).toBeUndefined();
  });
});

describe("Reports Router", () => {
  it("returns reports list as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const reports = await caller.reports.list({ limit: 10, offset: 0 });
    expect(Array.isArray(reports)).toBe(true);
  });
});

describe("Notifications Router", () => {
  it("returns unread count as number", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const count = await caller.notifications.unreadCount();
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("returns notifications list as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const notifications = await caller.notifications.list();
    expect(Array.isArray(notifications)).toBe(true);
  });
});

describe("My Dashboard Router", () => {
  it("returns dashboard layouts as array", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const layouts = await caller.myDashboard.layouts();
    expect(Array.isArray(layouts)).toBe(true);
  });
});
