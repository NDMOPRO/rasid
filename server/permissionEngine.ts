/**
 * Permission Engine — 7-step evaluation algorithm
 * Implements: User Overrides → Role → Group → Feature Flags → Deny-by-Default
 * Rule: Deny > Allow (deny always wins when both exist at same level)
 */
import { eq, and, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  adminRoles,
  adminPermissions,
  adminRolePermissions,
  adminGroups,
  adminGroupMemberships,
  adminGroupPermissions,
  adminUserOverrides,
  adminFeatureFlags,
  adminUserRoles,
  platformUsers,
} from "../drizzle/schema";

export type PermissionDecision = {
  allowed: boolean;
  reason: string;
  source: "super_admin" | "user_override" | "role" | "group" | "feature_flag" | "default";
};

/**
 * Main permission check — 7-step decision algorithm
 * @param userId - platform_users.id
 * @param resourceId - e.g. "page:dashboard", "feature:ai-chat"
 * @param action - e.g. "view", "edit", "manage"
 */
export async function checkPermission(
  userId: number,
  resourceId: string,
  action: string
): Promise<PermissionDecision> {
  const db = await getDb();
  if (!db) return { allowed: false, reason: "Database unavailable", source: "default" };

  // ─── Step 1: Super Admin check ───
  const [user] = await db
    .select()
    .from(platformUsers)
    .where(eq(platformUsers.id, userId))
    .limit(1);

  if (!user) return { allowed: false, reason: "User not found", source: "default" };

  if (user.platformRole === "root_admin") {
    return { allowed: true, reason: "Super Admin — full access", source: "super_admin" };
  }

  // ─── Step 2: User Overrides ───
  // Find the permission record for this resource+action
  const permRecords = await db
    .select()
    .from(adminPermissions)
    .where(
      and(
        eq(adminPermissions.resourceId, resourceId),
        eq(adminPermissions.action, action as any)
      )
    );

  if (permRecords.length === 0) {
    // No permission defined for this resource+action — check feature flags then deny
    return await checkFeatureFlagAndDefault(db, userId, resourceId);
  }

  const permIds = permRecords.map((p) => p.id);

  // Check user overrides
  const overrides = await db
    .select()
    .from(adminUserOverrides)
    .where(
      and(
        eq(adminUserOverrides.userId, userId),
        inArray(adminUserOverrides.permissionId, permIds)
      )
    );

  // Filter out expired overrides
  const now = Date.now();
  const activeOverrides = overrides.filter(
    (o) => !o.expiresAt || o.expiresAt > now
  );

  // Deny overrides take priority
  const denyOverride = activeOverrides.find((o) => o.effect === "deny");
  if (denyOverride) {
    return {
      allowed: false,
      reason: `User override deny: ${denyOverride.reason}`,
      source: "user_override",
    };
  }

  const allowOverride = activeOverrides.find((o) => o.effect === "allow");
  if (allowOverride) {
    return {
      allowed: true,
      reason: `User override allow: ${allowOverride.reason}`,
      source: "user_override",
    };
  }

  // ─── Step 3: Role Permissions ───
  const userRoles = await db
    .select()
    .from(adminUserRoles)
    .where(eq(adminUserRoles.userId, userId));

  let roleDeny = false;
  let roleAllow = false;

  if (userRoles.length > 0) {
    const roleIds = userRoles.map((r) => r.roleId);
    const rolePerms = await db
      .select()
      .from(adminRolePermissions)
      .where(
        and(
          inArray(adminRolePermissions.roleId, roleIds),
          inArray(adminRolePermissions.permissionId, permIds)
        )
      );

    roleDeny = rolePerms.some((rp) => rp.effect === "deny");
    roleAllow = rolePerms.some((rp) => rp.effect === "allow");
  }

  // ─── Step 4: Group Permissions ───
  const memberships = await db
    .select()
    .from(adminGroupMemberships)
    .where(eq(adminGroupMemberships.userId, userId));

  let groupDeny = false;
  let groupAllow = false;

  if (memberships.length > 0) {
    const groupIds = memberships.map((m) => m.groupId);
    const groupPerms = await db
      .select()
      .from(adminGroupPermissions)
      .where(
        and(
          inArray(adminGroupPermissions.groupId, groupIds),
          inArray(adminGroupPermissions.permissionId, permIds)
        )
      );

    groupDeny = groupPerms.some((gp) => gp.effect === "deny");
    groupAllow = groupPerms.some((gp) => gp.effect === "allow");
  }

  // ─── Step 5: Deny > Allow rule ───
  if (roleDeny || groupDeny) {
    const source = roleDeny ? "role" : "group";
    return {
      allowed: false,
      reason: `Denied by ${source} permission`,
      source,
    };
  }

  if (roleAllow || groupAllow) {
    const source = roleAllow ? "role" : "group";
    return {
      allowed: true,
      reason: `Allowed by ${source} permission`,
      source,
    };
  }

  // ─── Step 6 & 7: Feature Flags + Default ───
  return await checkFeatureFlagAndDefault(db, userId, resourceId);
}

/**
 * Steps 6-7: Check feature flags, then apply deny-by-default
 */
async function checkFeatureFlagAndDefault(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  userId: number,
  resourceId: string
): Promise<PermissionDecision> {
  // Check if there's a feature flag for this resource
  const flags = await db
    .select()
    .from(adminFeatureFlags)
    .where(eq(adminFeatureFlags.key, resourceId));

  if (flags.length > 0) {
    const flag = flags[0];

    // Globally disabled
    if (!flag.isEnabled) {
      return {
        allowed: false,
        reason: `Feature "${flag.displayName}" is globally disabled`,
        source: "feature_flag",
      };
    }

    // Check targeting
    if (flag.targetType !== "all" && flag.targetIds) {
      const targetIds = flag.targetIds as string[];

      if (flag.targetType === "users") {
        if (!targetIds.includes(String(userId))) {
          return {
            allowed: false,
            reason: `Feature "${flag.displayName}" not targeted to this user`,
            source: "feature_flag",
          };
        }
      }

      if (flag.targetType === "roles") {
        const userRoles = await db
          .select()
          .from(adminUserRoles)
          .where(eq(adminUserRoles.userId, userId));
        const userRoleIds = userRoles.map((r) => r.roleId);
        const hasTargetRole = targetIds.some((t) => userRoleIds.includes(t));
        if (!hasTargetRole) {
          return {
            allowed: false,
            reason: `Feature "${flag.displayName}" not targeted to user's roles`,
            source: "feature_flag",
          };
        }
      }

      if (flag.targetType === "groups") {
        const memberships = await db
          .select()
          .from(adminGroupMemberships)
          .where(eq(adminGroupMemberships.userId, userId));
        const userGroupIds = memberships.map((m) => m.groupId);
        const hasTargetGroup = targetIds.some((t) => userGroupIds.includes(t));
        if (!hasTargetGroup) {
          return {
            allowed: false,
            reason: `Feature "${flag.displayName}" not targeted to user's groups`,
            source: "feature_flag",
          };
        }
      }

      // Check scheduled enable/disable
      const now = Date.now();
      if (flag.enableAt && now < flag.enableAt) {
        return {
          allowed: false,
          reason: `Feature "${flag.displayName}" not yet enabled (scheduled)`,
          source: "feature_flag",
        };
      }
      if (flag.disableAt && now > flag.disableAt) {
        return {
          allowed: false,
          reason: `Feature "${flag.displayName}" has been disabled (expired)`,
          source: "feature_flag",
        };
      }
    }
  }

  // Step 7: Deny-by-Default
  return {
    allowed: false,
    reason: "No explicit permission found — deny by default",
    source: "default",
  };
}

/**
 * Get all effective permissions for a user (for UI display)
 */
export async function getEffectivePermissions(userId: number): Promise<
  Array<{
    permissionId: string;
    resourceId: string;
    action: string;
    effect: "allow" | "deny";
    source: "user_override" | "role" | "group";
    sourceId: string;
    sourceName: string;
  }>
> {
  const db = await getDb();
  if (!db) return [];

  const results: Array<{
    permissionId: string;
    resourceId: string;
    action: string;
    effect: "allow" | "deny";
    source: "user_override" | "role" | "group";
    sourceId: string;
    sourceName: string;
  }> = [];

  // Get all permissions
  const allPerms = await db.select().from(adminPermissions);
  const permMap = new Map(allPerms.map((p) => [p.id, p]));

  // User overrides
  const now = Date.now();
  const overrides = await db
    .select()
    .from(adminUserOverrides)
    .where(eq(adminUserOverrides.userId, userId));

  for (const ov of overrides) {
    if (ov.expiresAt && ov.expiresAt <= now) continue;
    const perm = permMap.get(ov.permissionId);
    if (!perm) continue;
    results.push({
      permissionId: ov.permissionId,
      resourceId: perm.resourceId,
      action: perm.action,
      effect: ov.effect,
      source: "user_override",
      sourceId: "override",
      sourceName: ov.reason,
    });
  }

  // Role permissions
  const userRoles = await db
    .select()
    .from(adminUserRoles)
    .where(eq(adminUserRoles.userId, userId));

  if (userRoles.length > 0) {
    const roleIds = userRoles.map((r) => r.roleId);
    const roles = await db
      .select()
      .from(adminRoles)
      .where(inArray(adminRoles.id, roleIds));
    const roleMap = new Map(roles.map((r) => [r.id, r]));

    const rolePerms = await db
      .select()
      .from(adminRolePermissions)
      .where(inArray(adminRolePermissions.roleId, roleIds));

    for (const rp of rolePerms) {
      const perm = permMap.get(rp.permissionId);
      const role = roleMap.get(rp.roleId);
      if (!perm || !role) continue;
      results.push({
        permissionId: rp.permissionId,
        resourceId: perm.resourceId,
        action: perm.action,
        effect: rp.effect,
        source: "role",
        sourceId: rp.roleId,
        sourceName: role.name,
      });
    }
  }

  // Group permissions
  const memberships = await db
    .select()
    .from(adminGroupMemberships)
    .where(eq(adminGroupMemberships.userId, userId));

  if (memberships.length > 0) {
    const groupIds = memberships.map((m) => m.groupId);
    const groups = await db
      .select()
      .from(adminGroups)
      .where(inArray(adminGroups.id, groupIds));
    const groupMap = new Map(groups.map((g) => [g.id, g]));

    const groupPerms = await db
      .select()
      .from(adminGroupPermissions)
      .where(inArray(adminGroupPermissions.groupId, groupIds));

    for (const gp of groupPerms) {
      const perm = permMap.get(gp.permissionId);
      const group = groupMap.get(gp.groupId);
      if (!perm || !group) continue;
      results.push({
        permissionId: gp.permissionId,
        resourceId: perm.resourceId,
        action: perm.action,
        effect: gp.effect,
        source: "group",
        sourceId: gp.groupId,
        sourceName: group.name,
      });
    }
  }

  return results;
}

/**
 * Batch check multiple permissions at once (for UI rendering)
 */
export async function checkPermissions(
  userId: number,
  checks: Array<{ resourceId: string; action: string }>
): Promise<Map<string, PermissionDecision>> {
  const results = new Map<string, PermissionDecision>();
  for (const check of checks) {
    const key = `${check.resourceId}:${check.action}`;
    const decision = await checkPermission(userId, check.resourceId, check.action);
    results.set(key, decision);
  }
  return results;
}
