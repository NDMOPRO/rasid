/**
 * Admin Dashboard — Database Helpers
 * CRUD operations for roles, groups, permissions, feature flags, audit logs, theme, menus
 */
import { eq, desc, and, inArray, like, sql, gte, lte, or } from "drizzle-orm";
import { getDb } from "./db";
import {
  adminRoles, type AdminRole, type InsertAdminRole,
  adminPermissions, type AdminPermission, type InsertAdminPermission,
  adminRolePermissions, type AdminRolePermission, type InsertAdminRolePermission,
  adminGroups, type AdminGroup, type InsertAdminGroup,
  adminGroupMemberships, type AdminGroupMembership, type InsertAdminGroupMembership,
  adminGroupPermissions, type AdminGroupPermission, type InsertAdminGroupPermission,
  adminUserOverrides, type AdminUserOverride, type InsertAdminUserOverride,
  adminFeatureFlags, type AdminFeatureFlag, type InsertAdminFeatureFlag,
  adminAuditLogs, type AdminAuditLog, type InsertAdminAuditLog,
  adminThemeSettings, type AdminThemeSetting, type InsertAdminThemeSetting,
  adminMenus, type AdminMenu, type InsertAdminMenu,
  adminMenuItems, type AdminMenuItem, type InsertAdminMenuItem,
  adminUserRoles, type AdminUserRole, type InsertAdminUserRole,
  platformUsers,
} from "../drizzle/schema";

// ═══════════════════════════════════════════════════════════════
// ═══ Roles ═══════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getAllRoles(): Promise<AdminRole[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminRoles).orderBy(desc(adminRoles.priority));
}

export async function getRoleById(id: string): Promise<AdminRole | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [role] = await db.select().from(adminRoles).where(eq(adminRoles.id, id)).limit(1);
  return role;
}

export async function createRole(role: InsertAdminRole): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminRoles).values(role);
}

export async function updateRole(id: string, updates: Partial<AdminRole>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminRoles).set({ ...updates, updatedAt: Date.now() }).where(eq(adminRoles.id, id));
}

export async function deleteRole(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete role permissions first
  await db.delete(adminRolePermissions).where(eq(adminRolePermissions.roleId, id));
  // Delete user-role assignments
  await db.delete(adminUserRoles).where(eq(adminUserRoles.roleId, id));
  // Delete the role
  await db.delete(adminRoles).where(eq(adminRoles.id, id));
}

// ═══════════════════════════════════════════════════════════════
// ═══ Permissions ═════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getAllPermissions(): Promise<AdminPermission[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminPermissions).orderBy(adminPermissions.resourceType, adminPermissions.resourceId);
}

export async function createPermission(perm: InsertAdminPermission): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminPermissions).values(perm);
}

export async function deletePermission(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminRolePermissions).where(eq(adminRolePermissions.permissionId, id));
  await db.delete(adminGroupPermissions).where(eq(adminGroupPermissions.permissionId, id));
  await db.delete(adminUserOverrides).where(eq(adminUserOverrides.permissionId, id));
  await db.delete(adminPermissions).where(eq(adminPermissions.id, id));
}

// ═══════════════════════════════════════════════════════════════
// ═══ Role Permissions ═══════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getRolePermissions(roleId: string): Promise<AdminRolePermission[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminRolePermissions).where(eq(adminRolePermissions.roleId, roleId));
}

export async function setRolePermission(rp: InsertAdminRolePermission): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminRolePermissions).values(rp);
}

export async function removeRolePermission(roleId: string, permissionId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminRolePermissions).where(
    and(eq(adminRolePermissions.roleId, roleId), eq(adminRolePermissions.permissionId, permissionId))
  );
}

export async function bulkSetRolePermissions(
  roleId: string,
  permissions: Array<{ permissionId: string; effect: "allow" | "deny" }>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete existing
  await db.delete(adminRolePermissions).where(eq(adminRolePermissions.roleId, roleId));
  // Insert new
  if (permissions.length > 0) {
    const now = Date.now();
    await db.insert(adminRolePermissions).values(
      permissions.map((p) => ({
        id: crypto.randomUUID(),
        roleId,
        permissionId: p.permissionId,
        effect: p.effect,
        createdAt: now,
      }))
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ═══ Groups ═════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getAllGroups(): Promise<AdminGroup[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminGroups).orderBy(desc(adminGroups.createdAt));
}

export async function getGroupById(id: string): Promise<AdminGroup | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [group] = await db.select().from(adminGroups).where(eq(adminGroups.id, id)).limit(1);
  return group;
}

export async function createGroup(group: InsertAdminGroup): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminGroups).values(group);
}

export async function updateGroup(id: string, updates: Partial<AdminGroup>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminGroups).set({ ...updates, updatedAt: Date.now() }).where(eq(adminGroups.id, id));
}

export async function deleteGroup(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminGroupMemberships).where(eq(adminGroupMemberships.groupId, id));
  await db.delete(adminGroupPermissions).where(eq(adminGroupPermissions.groupId, id));
  await db.delete(adminGroups).where(eq(adminGroups.id, id));
}

// ═══════════════════════════════════════════════════════════════
// ═══ Group Memberships ══════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getGroupMembers(groupId: string): Promise<AdminGroupMembership[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminGroupMemberships).where(eq(adminGroupMemberships.groupId, groupId));
}

export async function getUserGroups(userId: number): Promise<AdminGroupMembership[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminGroupMemberships).where(eq(adminGroupMemberships.userId, userId));
}

export async function addGroupMember(membership: InsertAdminGroupMembership): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminGroupMemberships).values(membership);
}

export async function removeGroupMember(groupId: string, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminGroupMemberships).where(
    and(eq(adminGroupMemberships.groupId, groupId), eq(adminGroupMemberships.userId, userId))
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Group Permissions ══════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getGroupPermissions(groupId: string): Promise<AdminGroupPermission[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminGroupPermissions).where(eq(adminGroupPermissions.groupId, groupId));
}

export async function bulkSetGroupPermissions(
  groupId: string,
  permissions: Array<{ permissionId: string; effect: "allow" | "deny" }>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminGroupPermissions).where(eq(adminGroupPermissions.groupId, groupId));
  if (permissions.length > 0) {
    const now = Date.now();
    await db.insert(adminGroupPermissions).values(
      permissions.map((p) => ({
        id: crypto.randomUUID(),
        groupId,
        permissionId: p.permissionId,
        effect: p.effect,
        createdAt: now,
      }))
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ═══ User Overrides ═════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getUserOverrides(userId: number): Promise<AdminUserOverride[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminUserOverrides).where(eq(adminUserOverrides.userId, userId));
}

export async function createUserOverride(override: InsertAdminUserOverride): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminUserOverrides).values(override);
}

export async function removeUserOverride(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminUserOverrides).where(eq(adminUserOverrides.id, id));
}

// ═══════════════════════════════════════════════════════════════
// ═══ User Roles ═════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getUserRoles(userId: number): Promise<AdminUserRole[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminUserRoles).where(eq(adminUserRoles.userId, userId));
}

export async function assignUserRole(assignment: InsertAdminUserRole): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminUserRoles).values(assignment);
}

export async function removeUserRole(userId: number, roleId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminUserRoles).where(
    and(eq(adminUserRoles.userId, userId), eq(adminUserRoles.roleId, roleId))
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Feature Flags ══════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getAllFeatureFlags(): Promise<AdminFeatureFlag[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminFeatureFlags).orderBy(desc(adminFeatureFlags.updatedAt));
}

export async function getFeatureFlagByKey(key: string): Promise<AdminFeatureFlag | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [flag] = await db.select().from(adminFeatureFlags).where(eq(adminFeatureFlags.key, key)).limit(1);
  return flag;
}

export async function createFeatureFlag(flag: InsertAdminFeatureFlag): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminFeatureFlags).values(flag);
}

export async function updateFeatureFlag(id: string, updates: Partial<AdminFeatureFlag>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminFeatureFlags).set({ ...updates, updatedAt: Date.now() }).where(eq(adminFeatureFlags.id, id));
}

export async function deleteFeatureFlag(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminFeatureFlags).where(eq(adminFeatureFlags.id, id));
}

export async function toggleFeatureFlag(id: string, enabled: boolean, updatedBy?: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminFeatureFlags).set({
    isEnabled: enabled,
    updatedBy: updatedBy ?? null,
    updatedAt: Date.now(),
  }).where(eq(adminFeatureFlags.id, id));
}

// ═══════════════════════════════════════════════════════════════
// ═══ Admin Audit Logs ═══════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function createAdminAuditLog(log: InsertAdminAuditLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(adminAuditLogs).values(log);
}

export async function getAdminAuditLogs(filters?: {
  userId?: number;
  action?: string;
  resourceType?: string;
  from?: number;
  to?: number;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AdminAuditLog[]; total: number }> {
  const db = await getDb();
  if (!db) return { logs: [], total: 0 };

  const conditions = [];
  if (filters?.userId) conditions.push(eq(adminAuditLogs.userId, filters.userId));
  if (filters?.action) conditions.push(eq(adminAuditLogs.action, filters.action));
  if (filters?.resourceType) conditions.push(eq(adminAuditLogs.resourceType, filters.resourceType));
  if (filters?.from) conditions.push(gte(adminAuditLogs.createdAt, filters.from));
  if (filters?.to) conditions.push(lte(adminAuditLogs.createdAt, filters.to));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(adminAuditLogs)
    .where(where);

  const logs = await db
    .select()
    .from(adminAuditLogs)
    .where(where)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(filters?.limit ?? 50)
    .offset(filters?.offset ?? 0);

  return { logs, total: countResult?.count ?? 0 };
}

export async function rollbackAuditLog(logId: string, rolledBackBy: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminAuditLogs).set({
    rolledBack: true,
    rolledBackBy: rolledBackBy,
  }).where(eq(adminAuditLogs.id, logId));
}

// ═══════════════════════════════════════════════════════════════
// ═══ Theme Settings ═════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getAllThemeSettings(): Promise<AdminThemeSetting[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminThemeSettings).orderBy(adminThemeSettings.category, adminThemeSettings.key);
}

export async function getThemeSettingsByCategory(category: string): Promise<AdminThemeSetting[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminThemeSettings).where(eq(adminThemeSettings.category, category as any));
}

export async function upsertThemeSetting(setting: InsertAdminThemeSetting): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminThemeSettings).values(setting).onDuplicateKeyUpdate({
    set: {
      value: setting.value,
      valueLight: setting.valueLight,
      valueDark: setting.valueDark,
      updatedBy: setting.updatedBy,
      updatedAt: Date.now(),
    },
  });
}

// ═══════════════════════════════════════════════════════════════
// ═══ Menus ══════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getAllMenus(): Promise<AdminMenu[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminMenus).orderBy(adminMenus.location);
}

export async function getMenuById(id: string): Promise<AdminMenu | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const [menu] = await db.select().from(adminMenus).where(eq(adminMenus.id, id)).limit(1);
  return menu;
}

export async function createMenu(menu: InsertAdminMenu): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminMenus).values(menu);
}

export async function updateMenu(id: string, updates: Partial<AdminMenu>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminMenus).set({ ...updates, updatedAt: Date.now() }).where(eq(adminMenus.id, id));
}

export async function deleteMenu(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminMenuItems).where(eq(adminMenuItems.menuId, id));
  await db.delete(adminMenus).where(eq(adminMenus.id, id));
}

// ═══════════════════════════════════════════════════════════════
// ═══ Menu Items ═════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

export async function getMenuItems(menuId: string): Promise<AdminMenuItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminMenuItems).where(eq(adminMenuItems.menuId, menuId)).orderBy(adminMenuItems.sortOrder);
}

export async function createMenuItem(item: InsertAdminMenuItem): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminMenuItems).values(item);
}

export async function updateMenuItem(id: string, updates: Partial<AdminMenuItem>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminMenuItems).set({ ...updates, updatedAt: Date.now() }).where(eq(adminMenuItems.id, id));
}

export async function deleteMenuItem(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete children first
  await db.delete(adminMenuItems).where(eq(adminMenuItems.parentId, id));
  await db.delete(adminMenuItems).where(eq(adminMenuItems.id, id));
}

export async function reorderMenuItems(items: Array<{ id: string; sortOrder: number }>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (const item of items) {
    await db.update(adminMenuItems).set({ sortOrder: item.sortOrder, updatedAt: Date.now() }).where(eq(adminMenuItems.id, item.id));
  }
}

// ═══════════════════════════════════════════════════════════════
// ═══ Admin Audit Helper ═════════════════════════════════════
// ═══════════════════════════════════════════════════════════════

/**
 * Convenience function to log an admin action with full context
 */
export async function logAdminAction(params: {
  userId: number;
  userName: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  isRollbackable?: boolean;
}): Promise<void> {
  await createAdminAuditLog({
    id: crypto.randomUUID(),
    userId: params.userId,
    userName: params.userName,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId ?? null,
    resourceName: params.resourceName ?? null,
    oldValue: params.oldValue ?? null,
    newValue: params.newValue ?? null,
    reason: params.reason ?? null,
    ipAddress: params.ipAddress ?? null,
    userAgent: params.userAgent ?? null,
    isRollbackable: params.isRollbackable ?? false,
    rolledBack: false,
    rolledBackBy: null,
    createdAt: Date.now(),
  });
}
