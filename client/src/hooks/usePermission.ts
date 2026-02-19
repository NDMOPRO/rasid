/**
 * usePermission — Client-side permission hook
 * Uses tRPC to check permissions against the server-side permission engine
 * Returns: { state: "allowed" | "read_only" | "hidden", isLoading }
 */
import { trpc } from "@/lib/trpc";

export type PermissionState = "allowed" | "read_only" | "hidden";

interface UsePermissionOptions {
  targetType: string;
  targetId: string;
  enabled?: boolean;
}

export function usePermission({ targetType, targetId, enabled = true }: UsePermissionOptions) {
  const { data, isLoading } = trpc.controlPanel.permissions.check.useQuery(
    { targetType, targetId },
    { enabled, retry: false, refetchOnWindowFocus: false }
  );

  return {
    state: (data?.state || "hidden") as PermissionState,
    isLoading,
    isAllowed: data?.state === "allowed",
    isReadOnly: data?.state === "read_only",
    isHidden: data?.state === "hidden",
  };
}

/**
 * useEffectivePermissions — Get all effective permissions for the current user
 */
export function useEffectivePermissions() {
  const { data, isLoading } = trpc.controlPanel.permissions.getEffective.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    permissions: data || [],
    isLoading,
    hasPermission: (resourceId: string) => {
      return (data || []).some((p: any) => p.resourceId === resourceId && p.allowed);
    },
  };
}
