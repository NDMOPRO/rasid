import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { jwtVerify } from "jose";
import { ENV } from "./env";
import { getPlatformUserById } from "../db";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  platformUser?: any;
};

function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!cookieHeader) return map;
  for (const pair of cookieHeader.split(";")) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    map.set(key, val);
  }
  return map;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let platformUser: any = null;

  // 1) Try platform_session JWT first (platform login without OAuth)
  try {
    const cookies = parseCookies(opts.req.headers.cookie);
    const platformToken = cookies.get("platform_session");
    if (platformToken && ENV.cookieSecret) {
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const { payload } = await jwtVerify(platformToken, secret, { algorithms: ["HS256"] });
      const platformUserId = payload.platformUserId as number;
      if (platformUserId) {
        const pUser = await getPlatformUserById(platformUserId);
        if (pUser && pUser.status === "active") {
          platformUser = pUser;
          // Create a compatible User object so protectedProcedure works
          const isRoot = pUser.platformRole === "root_admin" || ["mruhaily","aalrebdi","msarhan","malmoutaz"].includes(pUser.userId?.toLowerCase());
          user = {
            id: pUser.id,
            openId: `platform_${pUser.userId}`,
            name: pUser.displayName || pUser.name,
            email: pUser.email || null,
            phone: pUser.mobile || null,
            loginMethod: "platform",
            role: isRoot ? "admin" : "user",
            platformRole: isRoot ? "root_admin" : pUser.platformRole,
            department: null,
            organization: "NDMO",
            avatarUrl: null,
            preferences: null,
            isActive: 1,
            lastSignedIn: pUser.lastLoginAt || new Date().toISOString(),
            createdAt: pUser.createdAt,
            updatedAt: pUser.updatedAt,
            rasidRole: isRoot ? "root_admin" :
                       pUser.platformRole === "director" ? "director" :
                       pUser.platformRole === "manager" ? "smart_monitor_manager" : "monitoring_officer",
            username: pUser.userId.toUpperCase(),
            passwordHash: null,
            displayName: pUser.displayName,
            mobile: pUser.mobile || null,
            failedLoginAttempts: 0,
            lockedUntil: null,
            emailNotifications: 1,
          } as any;
        }
      }
    }
  } catch (error) {
    // Platform session invalid, continue to OAuth
  }

  // 2) If no platform user, try regular OAuth authentication
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    platformUser,
  };
}
