/**
 * Control Panel Router — tRPC procedures for Admin Control Panel
 * Handles: Page Registry, AI Personality Config, Permission checks
 */
import { z } from "zod";
import { router, adminProcedure, rootAdminProcedure, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, count } from "drizzle-orm";
import { getDb } from "./db";
import {
  pageRegistry, aiPersonalityConfig, platformUsers,
  adminGroups, adminGroupMemberships, adminGroupPermissions,
  adminPermissions, adminAuditLogs,
} from "../drizzle/schema";
import { checkPermission, getEffectivePermissions } from "./permissionEngine";

export const controlPanelRouter = router({
  // ═══════════════════════════════════════════════════════════════
  // ═══ Page Registry ════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  pages: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(pageRegistry).orderBy(pageRegistry.sortOrder);
    }),

    update: adminProcedure.input(z.object({
      id: z.number(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().optional(),
      features: z.any().optional(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { id, isActive, ...rest } = input;
      const updateData: Record<string, any> = { ...rest };
      if (isActive !== undefined) updateData.isActive = isActive ? 1 : 0;
      await db.update(pageRegistry).set(updateData).where(eq(pageRegistry.id, id));
      return { success: true };
    }),

    toggleActive: adminProcedure.input(z.object({
      id: z.number(),
      isActive: z.boolean(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.update(pageRegistry).set({ isActive: input.isActive ? 1 : 0 }).where(eq(pageRegistry.id, input.id));
      return { success: true };
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ AI Personality Config ════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  aiConfig: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(aiPersonalityConfig);
    }),

    upsert: adminProcedure.input(z.object({
      configKey: z.string(),
      configValue: z.string(),
      configType: z.enum(["string", "number", "boolean", "json"]).default("string"),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const existing = await db.select().from(aiPersonalityConfig)
        .where(eq(aiPersonalityConfig.configKey, input.configKey)).limit(1);

      const userId = (ctx as any).platformUser?.id || null;

      if (existing.length > 0) {
        await db.update(aiPersonalityConfig).set({
          configValue: input.configValue,
          configType: input.configType,
          description: input.description || existing[0].description,
          updatedBy: userId,
        }).where(eq(aiPersonalityConfig.configKey, input.configKey));
      } else {
        await db.insert(aiPersonalityConfig).values({
          configKey: input.configKey,
          configValue: input.configValue,
          configType: input.configType,
          description: input.description || null,
          updatedBy: userId,
        });
      }

      return { success: true };
    }),

    delete: rootAdminProcedure.input(z.object({
      configKey: z.string(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.delete(aiPersonalityConfig).where(eq(aiPersonalityConfig.configKey, input.configKey));
      return { success: true };
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Permission Check (Client-side) ═══════════════════════════
  // ═══════════════════════════════════════════════════════════════
  permissions: router({
    check: protectedProcedure.input(z.object({
      targetType: z.string(),
      targetId: z.string(),
    })).query(async ({ ctx, input }) => {
      const userId = (ctx as any).platformUser?.id;
      if (!userId) return { state: "hidden" as const };

      const result = await checkPermission(userId, `${input.targetType}:${input.targetId}`, "view");

      if (result.allowed) {
        return { state: "allowed" as const };
      }

      // Check read_only
      const readResult = await checkPermission(userId, `${input.targetType}:${input.targetId}`, "view");
      if (readResult.allowed) {
        return { state: "read_only" as const };
      }

      return { state: "hidden" as const };
    }),

    getEffective: protectedProcedure.query(async ({ ctx }) => {
      const userId = (ctx as any).platformUser?.id;
      if (!userId) return [];
      return getEffectivePermissions(userId);
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Groups with Members ══════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  groups: router({
    listWithMembers: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];

      const groups = await db.select().from(adminGroups);
      const memberships = await db.select().from(adminGroupMemberships);
      const users = await db.select({
        id: platformUsers.id,
        name: platformUsers.name,
        displayName: platformUsers.displayName,
        platformRole: platformUsers.platformRole,
      }).from(platformUsers);

      return groups.map((g) => {
        const memberIds = memberships
          .filter((m) => m.gmGroupId === g.id)
          .map((m) => m.gmUserId);
        const members = users.filter((u) => memberIds.includes(u.id));
        return { ...g, members, memberCount: members.length };
      });
    }),

    getPermissions: adminProcedure.input(z.object({
      groupId: z.string(),
    })).query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(adminGroupPermissions)
        .where(eq(adminGroupPermissions.gpGroupId, input.groupId));
    }),

    setPermissions: adminProcedure.input(z.object({
      groupId: z.string(),
      permissions: z.array(z.object({
        permissionId: z.string(),
        effect: z.enum(["allow", "deny"]),
      })),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Delete existing permissions for this group
      await db.delete(adminGroupPermissions)
        .where(eq(adminGroupPermissions.gpGroupId, input.groupId));

      // Insert new permissions
      for (const perm of input.permissions) {
        const id = `gp-${input.groupId}-${perm.permissionId}-${Date.now()}`;
        await db.insert(adminGroupPermissions).values({
          id,
          gpGroupId: input.groupId,
          gpPermissionId: perm.permissionId,
          gpEffect: perm.effect,
          gpCreatedAt: Date.now(),
        });
      }

      return { success: true };
    }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Training Center Stats ════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  trainingStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;

    // Return basic stats — more can be added later
    return {
      totalKnowledgeEntries: 0,
      totalCustomActions: 0,
      totalTrainingDocs: 0,
      avgRating: 0,
      totalConversations: 0,
    };
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Overview Stats ═══════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  overview: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;

    const [usersCount] = await db.select({ count: count() }).from(platformUsers);
    const [groupsCount] = await db.select({ count: count() }).from(adminGroups);
    const [pagesCount] = await db.select({ count: count() }).from(pageRegistry);
    const [permissionsCount] = await db.select({ count: count() }).from(adminPermissions);

    return {
      totalUsers: usersCount.count,
      totalGroups: groupsCount.count,
      totalPages: pagesCount.count,
      totalPermissions: permissionsCount.count,
    };
  }),
});
