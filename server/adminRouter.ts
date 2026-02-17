/**
 * Admin Dashboard — tRPC Router
 * All admin CRUD operations for roles, groups, permissions, feature flags, audit, theme, menus
 */
import { z } from "zod";
import { router, rootAdminProcedure, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllRoles, getRoleById, createRole, updateRole, deleteRole,
  getAllPermissions, createPermission, deletePermission,
  getRolePermissions, bulkSetRolePermissions,
  getAllGroups, getGroupById, createGroup, updateGroup, deleteGroup,
  getGroupMembers, getUserGroups, addGroupMember, removeGroupMember,
  getGroupPermissions, bulkSetGroupPermissions,
  getUserOverrides, createUserOverride, removeUserOverride,
  getUserRoles, assignUserRole, removeUserRole,
  getAllFeatureFlags, getFeatureFlagByKey, createFeatureFlag, updateFeatureFlag, deleteFeatureFlag, toggleFeatureFlag,
  getAdminAuditLogs, rollbackAuditLog, logAdminAction,
  getAllThemeSettings, getThemeSettingsByCategory, upsertThemeSetting,
  getAllMenus, getMenuById, createMenu, updateMenu, deleteMenu,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems,
} from "./adminDb";
import { checkPermission, getEffectivePermissions } from "./permissionEngine";
import { seedAdminData } from "./adminSeed";
import { getAllPlatformUsers } from "./db";

export const adminRouter = router({
  // ═══════════════════════════════════════════════════════════════
  // ═══ Dashboard Overview ═══════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  overview: rootAdminProcedure.query(async () => {
    const [roles, groups, flags, permissions, users] = await Promise.all([
      getAllRoles(),
      getAllGroups(),
      getAllFeatureFlags(),
      getAllPermissions(),
      getAllPlatformUsers(),
    ]);
    const activeFlags = flags.filter((f) => f.isEnabled).length;
    const disabledFlags = flags.filter((f) => !f.isEnabled).length;
    return {
      totalRoles: roles.length,
      totalGroups: groups.length,
      totalPermissions: permissions.length,
      totalUsers: users.length,
      activeFeatureFlags: activeFlags,
      disabledFeatureFlags: disabledFlags,
      totalFeatureFlags: flags.length,
    };
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Roles ═══════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  roles: router({
    list: rootAdminProcedure.query(async () => {
      return getAllRoles();
    }),

    getById: rootAdminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const role = await getRoleById(input.id);
        if (!role) throw new TRPCError({ code: "NOT_FOUND", message: "Role not found" });
        return role;
      }),

    create: rootAdminProcedure
      .input(z.object({
        name: z.string().min(1),
        nameEn: z.string().min(1),
        description: z.string().optional(),
        descriptionEn: z.string().optional(),
        priority: z.number().default(0),
        color: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        await createRole({
          id,
          name: input.name,
          nameEn: input.nameEn,
          description: input.description ?? null,
          descriptionEn: input.descriptionEn ?? null,
          isSystem: false,
          priority: input.priority,
          color: input.color ?? null,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "role.create",
          resourceType: "role",
          resourceId: id,
          resourceName: input.name,
          newValue: input as any,
        });
        return { id };
      }),

    update: rootAdminProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        descriptionEn: z.string().optional(),
        priority: z.number().optional(),
        color: z.string().optional(),
        status: z.enum(["active", "disabled"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getRoleById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        if (existing.isSystem && input.status === "disabled") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Cannot disable system roles" });
        }
        const { id, ...updates } = input;
        await updateRole(id, updates as any);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "role.update",
          resourceType: "role",
          resourceId: id,
          resourceName: existing.name,
          oldValue: existing as any,
          newValue: updates as any,
          isRollbackable: true,
        });
        return { success: true };
      }),

    delete: rootAdminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getRoleById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
        if (existing.isSystem) throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete system roles" });
        await deleteRole(input.id);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "role.delete",
          resourceType: "role",
          resourceId: input.id,
          resourceName: existing.name,
          oldValue: existing as any,
        });
        return { success: true };
      }),

    getPermissions: rootAdminProcedure
      .input(z.object({ roleId: z.string() }))
      .query(async ({ input }) => {
        return getRolePermissions(input.roleId);
      }),

    setPermissions: rootAdminProcedure
      .input(z.object({
        roleId: z.string(),
        permissions: z.array(z.object({
          permissionId: z.string(),
          effect: z.enum(["allow", "deny"]),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        await bulkSetRolePermissions(input.roleId, input.permissions);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "role.setPermissions",
          resourceType: "role",
          resourceId: input.roleId,
          newValue: { count: input.permissions.length } as any,
        });
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Permissions ═════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  permissions: router({
    list: rootAdminProcedure.query(async () => {
      return getAllPermissions();
    }),

    create: rootAdminProcedure
      .input(z.object({
        resourceType: z.enum(["page", "section", "component", "content_type", "task", "feature", "api", "menu"]),
        resourceId: z.string(),
        resourceName: z.string(),
        resourceNameEn: z.string().optional(),
        action: z.enum(["view", "create", "edit", "delete", "publish", "unpublish", "enable", "disable", "manage", "export", "approve"]),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = crypto.randomUUID();
        await createPermission({
          id,
          ...input,
          resourceNameEn: input.resourceNameEn ?? null,
          description: input.description ?? null,
          createdAt: Date.now(),
        });
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "permission.create",
          resourceType: "permission",
          resourceId: id,
          resourceName: input.resourceName,
        });
        return { id };
      }),

    delete: rootAdminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await deletePermission(input.id);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "permission.delete",
          resourceType: "permission",
          resourceId: input.id,
        });
        return { success: true };
      }),

    checkPermission: protectedProcedure
      .input(z.object({
        resourceId: z.string(),
        action: z.string(),
      }))
      .query(async ({ input, ctx }) => {
        const userId = ctx.platformUser?.id;
        if (!userId) return { allowed: false, reason: "Not authenticated", source: "default" as const };
        return checkPermission(userId, input.resourceId, input.action);
      }),

    getEffective: rootAdminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getEffectivePermissions(input.userId);
      }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Groups ═══════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  groups: router({
    list: rootAdminProcedure.query(async () => {
      const groups = await getAllGroups();
      // Enrich with member count
      const enriched = await Promise.all(
        groups.map(async (g) => {
          const members = await getGroupMembers(g.id);
          return { ...g, memberCount: members.length };
        })
      );
      return enriched;
    }),

    getById: rootAdminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const group = await getGroupById(input.id);
        if (!group) throw new TRPCError({ code: "NOT_FOUND" });
        const members = await getGroupMembers(input.id);
        const permissions = await getGroupPermissions(input.id);
        return { ...group, members, permissions };
      }),

    create: rootAdminProcedure
      .input(z.object({
        name: z.string().min(1),
        nameEn: z.string().min(1),
        description: z.string().optional(),
        descriptionEn: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        await createGroup({
          id,
          name: input.name,
          nameEn: input.nameEn,
          description: input.description ?? null,
          descriptionEn: input.descriptionEn ?? null,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "group.create",
          resourceType: "group",
          resourceId: id,
          resourceName: input.name,
        });
        return { id };
      }),

    update: rootAdminProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        descriptionEn: z.string().optional(),
        status: z.enum(["active", "disabled"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        await updateGroup(id, updates as any);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "group.update",
          resourceType: "group",
          resourceId: id,
        });
        return { success: true };
      }),

    delete: rootAdminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await deleteGroup(input.id);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "group.delete",
          resourceType: "group",
          resourceId: input.id,
        });
        return { success: true };
      }),

    addMember: rootAdminProcedure
      .input(z.object({ groupId: z.string(), userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await addGroupMember({
          id: crypto.randomUUID(),
          groupId: input.groupId,
          userId: input.userId,
          joinedAt: Date.now(),
        });
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "group.addMember",
          resourceType: "group",
          resourceId: input.groupId,
          newValue: { memberId: input.userId } as any,
        });
        return { success: true };
      }),

    removeMember: rootAdminProcedure
      .input(z.object({ groupId: z.string(), userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await removeGroupMember(input.groupId, input.userId);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "group.removeMember",
          resourceType: "group",
          resourceId: input.groupId,
          oldValue: { memberId: input.userId } as any,
        });
        return { success: true };
      }),

    setPermissions: rootAdminProcedure
      .input(z.object({
        groupId: z.string(),
        permissions: z.array(z.object({
          permissionId: z.string(),
          effect: z.enum(["allow", "deny"]),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        await bulkSetGroupPermissions(input.groupId, input.permissions);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "group.setPermissions",
          resourceType: "group",
          resourceId: input.groupId,
        });
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ User Overrides ═══════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  userOverrides: router({
    list: rootAdminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getUserOverrides(input.userId);
      }),

    create: rootAdminProcedure
      .input(z.object({
        userId: z.number(),
        permissionId: z.string(),
        effect: z.enum(["allow", "deny"]),
        reason: z.string().min(1),
        expiresAt: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = crypto.randomUUID();
        await createUserOverride({
          id,
          userId: input.userId,
          permissionId: input.permissionId,
          effect: input.effect,
          reason: input.reason,
          expiresAt: input.expiresAt ?? null,
          createdBy: ctx.platformUser!.id,
          createdAt: Date.now(),
        });
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "override.create",
          resourceType: "user_override",
          resourceId: id,
          newValue: input as any,
        });
        return { id };
      }),

    remove: rootAdminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await removeUserOverride(input.id);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "override.remove",
          resourceType: "user_override",
          resourceId: input.id,
        });
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ User Roles ═══════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  userRoles: router({
    list: rootAdminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getUserRoles(input.userId);
      }),

    assign: rootAdminProcedure
      .input(z.object({ userId: z.number(), roleId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await assignUserRole({
          id: crypto.randomUUID(),
          userId: input.userId,
          roleId: input.roleId,
          assignedAt: Date.now(),
          assignedBy: ctx.platformUser!.id,
        });
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "userRole.assign",
          resourceType: "user_role",
          newValue: input as any,
        });
        return { success: true };
      }),

    remove: rootAdminProcedure
      .input(z.object({ userId: z.number(), roleId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await removeUserRole(input.userId, input.roleId);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "userRole.remove",
          resourceType: "user_role",
          oldValue: input as any,
        });
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Feature Flags ═══════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  featureFlags: router({
    list: rootAdminProcedure.query(async () => {
      return getAllFeatureFlags();
    }),

    getByKey: rootAdminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return getFeatureFlagByKey(input.key);
      }),

    create: rootAdminProcedure
      .input(z.object({
        key: z.string().min(1),
        displayName: z.string().min(1),
        displayNameEn: z.string().optional(),
        description: z.string().optional(),
        isEnabled: z.boolean().default(true),
        targetType: z.enum(["all", "roles", "groups", "users", "percentage"]).default("all"),
        targetIds: z.array(z.string()).optional(),
        enableAt: z.number().optional(),
        disableAt: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        await createFeatureFlag({
          id,
          key: input.key,
          displayName: input.displayName,
          displayNameEn: input.displayNameEn ?? null,
          description: input.description ?? null,
          isEnabled: input.isEnabled,
          targetType: input.targetType,
          targetIds: input.targetIds ?? null,
          enableAt: input.enableAt ?? null,
          disableAt: input.disableAt ?? null,
          updatedBy: ctx.platformUser!.id,
          createdAt: now,
          updatedAt: now,
        });
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "featureFlag.create",
          resourceType: "feature_flag",
          resourceId: id,
          resourceName: input.displayName,
        });
        return { id };
      }),

    update: rootAdminProcedure
      .input(z.object({
        id: z.string(),
        displayName: z.string().optional(),
        displayNameEn: z.string().optional(),
        description: z.string().optional(),
        targetType: z.enum(["all", "roles", "groups", "users", "percentage"]).optional(),
        targetIds: z.array(z.string()).optional(),
        enableAt: z.number().nullable().optional(),
        disableAt: z.number().nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        await updateFeatureFlag(id, updates as any);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "featureFlag.update",
          resourceType: "feature_flag",
          resourceId: id,
        });
        return { success: true };
      }),

    toggle: rootAdminProcedure
      .input(z.object({ id: z.string(), enabled: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        await toggleFeatureFlag(input.id, input.enabled, ctx.platformUser!.id);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: input.enabled ? "featureFlag.enable" : "featureFlag.disable",
          resourceType: "feature_flag",
          resourceId: input.id,
        });
        return { success: true };
      }),

    delete: rootAdminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await deleteFeatureFlag(input.id);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "featureFlag.delete",
          resourceType: "feature_flag",
          resourceId: input.id,
        });
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Admin Audit Logs ═══════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  auditLogs: router({
    list: rootAdminProcedure
      .input(z.object({
        userId: z.number().optional(),
        action: z.string().optional(),
        resourceType: z.string().optional(),
        from: z.number().optional(),
        to: z.number().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getAdminAuditLogs(input ?? undefined);
      }),

    rollback: rootAdminProcedure
      .input(z.object({ logId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await rollbackAuditLog(input.logId, ctx.platformUser!.id);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "auditLog.rollback",
          resourceType: "audit_log",
          resourceId: input.logId,
        });
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Theme Settings ═══════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  theme: router({
    getAll: rootAdminProcedure.query(async () => {
      return getAllThemeSettings();
    }),

    getByCategory: rootAdminProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return getThemeSettingsByCategory(input.category);
      }),

    update: rootAdminProcedure
      .input(z.object({
        id: z.string(),
        category: z.enum(["colors", "typography", "layout", "shadows", "animations"]),
        key: z.string(),
        value: z.string(),
        valueLight: z.string().optional(),
        valueDark: z.string().optional(),
        label: z.string().optional(),
        labelEn: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await upsertThemeSetting({
          id: input.id,
          category: input.category,
          key: input.key,
          value: input.value,
          valueLight: input.valueLight ?? null,
          valueDark: input.valueDark ?? null,
          label: input.label ?? null,
          labelEn: input.labelEn ?? null,
          updatedBy: ctx.platformUser!.id,
          updatedAt: Date.now(),
        });
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "theme.update",
          resourceType: "theme",
          resourceId: input.key,
          newValue: { value: input.value } as any,
        });
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Menus ═══════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  menus: router({
    list: rootAdminProcedure.query(async () => {
      return getAllMenus();
    }),

    getById: rootAdminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const menu = await getMenuById(input.id);
        if (!menu) throw new TRPCError({ code: "NOT_FOUND" });
        const items = await getMenuItems(input.id);
        return { ...menu, items };
      }),

    create: rootAdminProcedure
      .input(z.object({
        name: z.string().min(1),
        nameEn: z.string().optional(),
        location: z.enum(["sidebar", "top_nav", "footer", "contextual", "mobile"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        await createMenu({
          id,
          name: input.name,
          nameEn: input.nameEn ?? null,
          location: input.location,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "menu.create",
          resourceType: "menu",
          resourceId: id,
          resourceName: input.name,
        });
        return { id };
      }),

    update: rootAdminProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        nameEn: z.string().optional(),
        status: z.enum(["active", "disabled"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        await updateMenu(id, updates as any);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "menu.update",
          resourceType: "menu",
          resourceId: id,
        });
        return { success: true };
      }),

    delete: rootAdminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await deleteMenu(input.id);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "menu.delete",
          resourceType: "menu",
          resourceId: input.id,
        });
        return { success: true };
      }),

    // Menu Items
    addItem: rootAdminProcedure
      .input(z.object({
        menuId: z.string(),
        parentId: z.string().optional(),
        title: z.string().min(1),
        titleEn: z.string().optional(),
        icon: z.string().optional(),
        linkType: z.enum(["internal", "external", "anchor", "none"]).default("internal"),
        linkTarget: z.string().optional(),
        openNewTab: z.boolean().default(false),
        visibilityRules: z.object({
          roles: z.array(z.string()).optional(),
          groups: z.array(z.string()).optional(),
          users: z.array(z.string()).optional(),
          featureFlags: z.array(z.string()).optional(),
        }).optional(),
        badge: z.string().optional(),
        badgeColor: z.string().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        await createMenuItem({
          id,
          menuId: input.menuId,
          parentId: input.parentId ?? null,
          title: input.title,
          titleEn: input.titleEn ?? null,
          icon: input.icon ?? null,
          linkType: input.linkType,
          linkTarget: input.linkTarget ?? null,
          openNewTab: input.openNewTab,
          visibilityRules: input.visibilityRules ?? null,
          badge: input.badge ?? null,
          badgeColor: input.badgeColor ?? null,
          sortOrder: input.sortOrder,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "menuItem.create",
          resourceType: "menu_item",
          resourceId: id,
          resourceName: input.title,
        });
        return { id };
      }),

    updateItem: rootAdminProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        titleEn: z.string().optional(),
        icon: z.string().optional(),
        linkType: z.enum(["internal", "external", "anchor", "none"]).optional(),
        linkTarget: z.string().optional(),
        openNewTab: z.boolean().optional(),
        visibilityRules: z.object({
          roles: z.array(z.string()).optional(),
          groups: z.array(z.string()).optional(),
          users: z.array(z.string()).optional(),
          featureFlags: z.array(z.string()).optional(),
        }).optional(),
        badge: z.string().optional(),
        badgeColor: z.string().optional(),
        status: z.enum(["active", "disabled"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        await updateMenuItem(id, updates as any);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "menuItem.update",
          resourceType: "menu_item",
          resourceId: id,
        });
        return { success: true };
      }),

    deleteItem: rootAdminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await deleteMenuItem(input.id);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "menuItem.delete",
          resourceType: "menu_item",
          resourceId: input.id,
        });
        return { success: true };
      }),

    reorderItems: rootAdminProcedure
      .input(z.object({
        items: z.array(z.object({ id: z.string(), sortOrder: z.number() })),
      }))
      .mutation(async ({ input, ctx }) => {
        await reorderMenuItems(input.items);
        await logAdminAction({
          userId: ctx.platformUser!.id,
          userName: ctx.platformUser!.displayName,
          action: "menuItem.reorder",
          resourceType: "menu_item",
        });
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════
  // ═══ Seed Default Data ═══════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  seed: rootAdminProcedure.mutation(async () => {
    return seedAdminData();
  }),

  // ═══ Users List ═══
  users: rootAdminProcedure.query(async () => {
    return getAllPlatformUsers();
  }),
});
