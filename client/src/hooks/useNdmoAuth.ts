import { useAuth } from "@/_core/hooks/useAuth";

/** Root Admin userIds — all 4 system admins have full root privileges */
const ROOT_ADMIN_USER_IDS = ["mruhaily", "aalrebdi", "msarhan", "malmoutaz"];

export type NdmoRole = "executive" | "manager" | "analyst" | "viewer";

export function useNdmoAuth() {
  const auth = useAuth();

  const ndmoRole: NdmoRole = (auth.user as any)?.ndmoRole ?? "viewer";

  // Root Admin check — all 4 system admins have root privileges
  // context.ts sets username = pUser.userId.toUpperCase(), so we check both username and userId fields
  const platformUserId = (auth.user as any)?.username ?? (auth.user as any)?.userId ?? "";
  const isRootAdmin = ROOT_ADMIN_USER_IDS.includes(String(platformUserId).toLowerCase()) || auth.user?.role === "root_admin" || (auth.user as any)?.rasidRole === "root_admin";

  // If root admin, grant admin status regardless of DB role
  const isAdmin = isRootAdmin || auth.user?.role === "admin" || auth.user?.role === "root_admin" || auth.user?.role === "superadmin";

  // Permission checks — root admins get everything
  const canManageLeaks = isAdmin || ndmoRole === "executive" || ndmoRole === "manager" || ndmoRole === "analyst";
  const canExport = isAdmin || ndmoRole === "executive" || ndmoRole === "manager";
  const canManageUsers = isAdmin || ndmoRole === "executive";
  const canCreateReports = isAdmin || ndmoRole === "executive" || ndmoRole === "manager";
  const canViewDashboard = true; // Everyone can view
  const canClassifyPii = isAdmin || ndmoRole === "executive" || ndmoRole === "manager" || ndmoRole === "analyst";

  // AI Control pages — all root admins
  const canManageAI = isRootAdmin;

  return {
    ...auth,
    ndmoRole,
    isAdmin,
    isRootAdmin,
    canManageLeaks,
    canExport,
    canManageUsers,
    canCreateReports,
    canViewDashboard,
    canClassifyPii,
    canManageAI,
  };
}
