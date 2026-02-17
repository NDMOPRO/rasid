import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

const ROOT_ADMIN_USERNAME = "MRUHAILY";

export const rootAdminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: "صلاحيات غير كافية" });
    }
    if (ctx.user.name?.toUpperCase() !== ROOT_ADMIN_USERNAME) {
      throw new TRPCError({ code: "FORBIDDEN", message: "هذا القسم متاح فقط لمشرف النظام الرئيسي" });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

export function assertNotRootAdmin(targetUsername: string | null | undefined) {
  if (targetUsername?.toUpperCase() === ROOT_ADMIN_USERNAME) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "لا يمكن تعديل أو حذف حساب المشرف الرئيسي",
    });
  }
}
