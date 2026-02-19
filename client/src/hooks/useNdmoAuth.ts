import { useAuth } from "@/_core/hooks/useAuth";

/** Root Admin userId — must match server-side constant */
const ROOT_ADMIN_USER_IDS = ["mruhaily", "aalrebdi", "msarhan", "malmoutaz"];

export type NdmoRole = "executive" | "manager" | "analyst" | "viewer";

export function useNdmoAuth() {
  const auth = useAuth();

  const ndmoRole: NdmoRole = (auth.user as any)?.ndmoRole ?? "viewer";
  const isAdmin = auth.user?.role === "admin" || auth.user?.role === "root_admin";

  // Root Admin check — only mruhaily has root admin privileges
  const platformUserId = (auth.user as any)?.userId ?? "";
  const isRootAdmin = ROOT_ADMIN_USER_IDS.includes(platformUserId.toLowerCase());

  // Permission checks based on NDMO role hierarchy
  const canManageLeaks = isAdmin || ndmoRole === "executive" || ndmoRole === "manager" || ndmoRole === "analyst";
  const canExport = isAdmin || ndmoRole === "executive" || ndmoRole === "manager";
  const canManageUsers = isAdmin || ndmoRole === "executive";
  const canCreateReports = isAdmin || ndmoRole === "executive" || ndmoRole === "manager";
  const canViewDashboard = true; // Everyone can view
  const canClassifyPii = isAdmin || ndmoRole === "executive" || ndmoRole === "manager" || ndmoRole === "analyst";

  // AI Control pages — only root admin
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
