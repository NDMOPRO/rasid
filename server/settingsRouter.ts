/**
 * settingsRouter.ts — إعدادات النظام
 * الأقسام: الهوية البصرية | الإعدادات العامة | مزودي API | الثيم | القوائم | القوالب
 * rootAdminProcedure فقط — لا يمكن لأي مستخدم آخر الوصول
 */

import { z } from "zod";
import { router, rootAdminProcedure } from "./_core/trpc";
import { eq, desc, sql, like, and, count } from "drizzle-orm";
import { getDb } from "./db";
import {
  platformAssets, apiProviders, templates,
  platformSettings, themeSettings, systemSettings,
  adminMenus, adminMenuItems,
} from "../drizzle/schema";
import crypto from "crypto";

// ─── AES-256 Encryption Helpers (toolkit-ready) ───
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || "rasid-default-key-change-in-prod!!";

function deriveKey(secret: string): Buffer {
  return crypto.scryptSync(secret, "rasid-salt", 32);
}

function encryptValue(plaintext: string): string {
  const key = deriveKey(ENCRYPTION_KEY);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptValue(ciphertext: string): string {
  try {
    const key = deriveKey(ENCRYPTION_KEY);
    const [ivHex, encHex] = ciphertext.split(":");
    if (!ivHex || !encHex) return "••••••••";
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "••••••••";
  }
}

function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return key.substring(0, 4) + "••••" + key.substring(key.length - 4);
}

export const settingsRouter = router({
  // ═══════════════════════════════════════════
  // القسم 1: الهوية البصرية (Brand Identity)
  // ═══════════════════════════════════════════

  getAssets: rootAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(platformAssets);
    return rows;
  }),

  upsertAsset: rootAdminProcedure
    .input(z.object({
      assetKey: z.string().min(1),
      assetUrl: z.string().url(),
      assetType: z.enum(["image", "svg", "icon"]),
      width: z.number().optional(),
      height: z.number().optional(),
      fileSize: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const existing = await db.select().from(platformAssets)
        .where(eq(platformAssets.assetKey, input.assetKey)).limit(1);
      if (existing.length > 0) {
        await db.update(platformAssets)
          .set({
            assetUrl: input.assetUrl,
            assetType: input.assetType,
            width: input.width ?? null,
            height: input.height ?? null,
            fileSize: input.fileSize ?? null,
            updatedBy: ctx.user?.id ?? null,
          })
          .where(eq(platformAssets.assetKey, input.assetKey));
      } else {
        await db.insert(platformAssets).values({
          assetKey: input.assetKey,
          assetUrl: input.assetUrl,
          assetType: input.assetType,
          width: input.width ?? null,
          height: input.height ?? null,
          fileSize: input.fileSize ?? null,
          updatedBy: ctx.user?.id ?? null,
        });
      }
      return { success: true };
    }),

  deleteAsset: rootAdminProcedure
    .input(z.object({ assetKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(platformAssets).where(eq(platformAssets.assetKey, input.assetKey));
      return { success: true };
    }),

  // ═══════════════════════════════════════════
  // القسم 2: الإعدادات العامة (General Settings)
  // ═══════════════════════════════════════════

  getPlatformSettings: rootAdminProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.category) conditions.push(eq(platformSettings.category, input.category));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const rows = await db.select().from(platformSettings).where(where);
      return rows;
    }),

  updatePlatformSetting: rootAdminProcedure
    .input(z.object({
      settingKey: z.string().min(1),
      settingValue: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(platformSettings)
        .set({
          settingValue: input.settingValue,
          updatedBy: ctx.user?.id ?? null,
        })
        .where(eq(platformSettings.settingKey, input.settingKey));
      return { success: true };
    }),

  bulkUpdateSettings: rootAdminProcedure
    .input(z.object({
      settings: z.array(z.object({
        settingKey: z.string(),
        settingValue: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, updated: 0 };
      let updated = 0;
      for (const s of input.settings) {
        await db.update(platformSettings)
          .set({ settingValue: s.settingValue, updatedBy: ctx.user?.id ?? null })
          .where(eq(platformSettings.settingKey, s.settingKey));
        updated++;
      }
      return { success: true, updated };
    }),

  // ═══════════════════════════════════════════
  // القسم 3: مزودي API (API Providers)
  // ═══════════════════════════════════════════

  getApiProviders: rootAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(apiProviders);
    // Never return raw keys — mask them
    return rows.map(r => ({
      ...r,
      keyEncrypted: r.keyEncrypted ? maskKey(decryptValue(r.keyEncrypted)) : null,
      _hasKey: !!r.keyEncrypted,
    }));
  }),

  upsertApiProvider: rootAdminProcedure
    .input(z.object({
      providerId: z.string().min(1),
      name: z.string().min(1),
      type: z.enum(["llm", "search", "sms", "email", "storage"]),
      baseUrl: z.string().optional(),
      apiKey: z.string().optional(), // raw key — will be encrypted
      model: z.string().optional(),
      isActive: z.boolean().default(true),
      rateLimit: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const existing = await db.select().from(apiProviders)
        .where(eq(apiProviders.providerId, input.providerId)).limit(1);

      const encrypted = input.apiKey ? encryptValue(input.apiKey) : undefined;

      if (existing.length > 0) {
        const updateData: Record<string, unknown> = {
          name: input.name,
          type: input.type,
          baseUrl: input.baseUrl ?? null,
          model: input.model ?? null,
          isActive: input.isActive ? 1 : 0,
          rateLimit: input.rateLimit ?? null,
        };
        if (encrypted) updateData.keyEncrypted = encrypted;
        await db.update(apiProviders).set(updateData).where(eq(apiProviders.providerId, input.providerId));
      } else {
        await db.insert(apiProviders).values({
          providerId: input.providerId,
          name: input.name,
          type: input.type,
          baseUrl: input.baseUrl ?? null,
          keyEncrypted: encrypted ?? null,
          model: input.model ?? null,
          isActive: input.isActive ? 1 : 0,
          rateLimit: input.rateLimit ?? null,
          status: "active",
          createdBy: ctx.user?.id ?? null,
        });
      }
      return { success: true };
    }),

  deleteApiProvider: rootAdminProcedure
    .input(z.object({ providerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(apiProviders).where(eq(apiProviders.providerId, input.providerId));
      return { success: true };
    }),

  testApiProvider: rootAdminProcedure
    .input(z.object({ providerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, message: "لا يوجد اتصال بقاعدة البيانات" };
      const [provider] = await db.select().from(apiProviders)
        .where(eq(apiProviders.providerId, input.providerId)).limit(1);
      if (!provider) return { success: false, message: "المزود غير موجود" };
      if (!provider.keyEncrypted) return { success: false, message: "لا يوجد مفتاح API" };

      try {
        const key = decryptValue(provider.keyEncrypted);
        const start = Date.now();
        // Simple connectivity test based on provider type
        if (provider.type === "llm" && provider.baseUrl) {
          const res = await fetch(`${provider.baseUrl}/models`, {
            headers: { Authorization: `Bearer ${key}` },
            signal: AbortSignal.timeout(10000),
          });
          const elapsed = Date.now() - start;
          await db.update(apiProviders).set({
            lastChecked: sql`NOW()`,
            status: res.ok ? "active" : "error",
          }).where(eq(apiProviders.providerId, input.providerId));
          return { success: res.ok, message: res.ok ? `متصل (${elapsed}ms)` : `خطأ: ${res.status}`, responseTime: elapsed };
        }
        // Generic HTTP check
        if (provider.baseUrl) {
          const res = await fetch(provider.baseUrl, { signal: AbortSignal.timeout(10000) });
          const elapsed = Date.now() - start;
          await db.update(apiProviders).set({
            lastChecked: sql`NOW()`,
            status: res.ok ? "active" : "error",
          }).where(eq(apiProviders.providerId, input.providerId));
          return { success: res.ok, message: res.ok ? `متصل (${elapsed}ms)` : `خطأ: ${res.status}`, responseTime: elapsed };
        }
        return { success: false, message: "لا يوجد عنوان URL للاختبار" };
      } catch (err: any) {
        await db.update(apiProviders).set({
          lastChecked: sql`NOW()`,
          status: "error",
        }).where(eq(apiProviders.providerId, input.providerId));
        return { success: false, message: `فشل الاتصال: ${err.message}` };
      }
    }),

  // ═══════════════════════════════════════════
  // القسم 4: الثيم والألوان (Theme & Colors)
  // ═══════════════════════════════════════════

  getThemeSettings: rootAdminProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.category) conditions.push(eq(themeSettings.category, input.category as any));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const rows = await db.select().from(themeSettings).where(where);
      return rows;
    }),

  updateThemeSetting: rootAdminProcedure
    .input(z.object({
      themeKey: z.string().min(1),
      themeValue: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(themeSettings)
        .set({ themeValue: input.themeValue, updatedBy: ctx.user?.id ?? null })
        .where(eq(themeSettings.themeKey, input.themeKey));
      return { success: true };
    }),

  bulkUpdateTheme: rootAdminProcedure
    .input(z.object({
      settings: z.array(z.object({
        themeKey: z.string(),
        themeValue: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, updated: 0 };
      let updated = 0;
      for (const s of input.settings) {
        await db.update(themeSettings)
          .set({ themeValue: s.themeValue, updatedBy: ctx.user?.id ?? null })
          .where(eq(themeSettings.themeKey, s.themeKey));
        updated++;
      }
      return { success: true, updated };
    }),

  resetThemeToDefault: rootAdminProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: false };
    // Reset all theme values to their preview (default) values
    await db.execute(sql`UPDATE theme_settings SET themeValue = previewValue WHERE previewValue IS NOT NULL`);
    return { success: true };
  }),

  // ═══════════════════════════════════════════
  // القسم 5: القوائم والترتيب (Menus & Ordering)
  // ═══════════════════════════════════════════

  getMenus: rootAdminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(adminMenus);
    return rows;
  }),

  getMenuItems: rootAdminProcedure
    .input(z.object({ menuId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(adminMenuItems)
        .where(eq(adminMenuItems.miMenuId, input.menuId));
      // Sort by miSortOrder
      return rows.sort((a, b) => a.miSortOrder - b.miSortOrder);
    }),

  reorderMenuItems: rootAdminProcedure
    .input(z.object({
      items: z.array(z.object({
        id: z.string(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      for (const item of input.items) {
        await db.update(adminMenuItems)
          .set({ miSortOrder: item.sortOrder, miUpdatedAt: Date.now() })
          .where(eq(adminMenuItems.id, item.id));
      }
      return { success: true };
    }),

  toggleMenuItem: rootAdminProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(["active", "disabled"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(adminMenuItems)
        .set({ miStatus: input.status, miUpdatedAt: Date.now() })
        .where(eq(adminMenuItems.id, input.id));
      return { success: true };
    }),

  // ═══════════════════════════════════════════
  // القسم 6: القوالب (Templates)
  // ═══════════════════════════════════════════

  getTemplates: rootAdminProcedure
    .input(z.object({
      type: z.enum(["report", "notification", "export", "import"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [];
      if (input?.type) conditions.push(eq(templates.type, input.type));
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      const rows = await db.select().from(templates).where(where);
      return rows;
    }),

  upsertTemplate: rootAdminProcedure
    .input(z.object({
      templateId: z.string().min(1),
      name: z.string().min(1),
      nameAr: z.string().min(1),
      type: z.enum(["report", "notification", "export", "import"]),
      format: z.enum(["pdf", "docx", "xlsx", "csv", "html", "email", "sms"]),
      content: z.string(),
      variables: z.any().optional(),
      isDefault: z.boolean().default(false),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const existing = await db.select().from(templates)
        .where(eq(templates.templateId, input.templateId)).limit(1);

      if (existing.length > 0) {
        await db.update(templates).set({
          name: input.name,
          nameAr: input.nameAr,
          type: input.type,
          format: input.format,
          content: input.content,
          variables: input.variables ?? null,
          isDefault: input.isDefault ? 1 : 0,
          isActive: input.isActive ? 1 : 0,
        }).where(eq(templates.templateId, input.templateId));
      } else {
        await db.insert(templates).values({
          templateId: input.templateId,
          name: input.name,
          nameAr: input.nameAr,
          type: input.type,
          format: input.format,
          content: input.content,
          variables: input.variables ?? null,
          isDefault: input.isDefault ? 1 : 0,
          isActive: input.isActive ? 1 : 0,
          createdBy: ctx.user?.id ?? null,
        });
      }
      return { success: true };
    }),

  deleteTemplate: rootAdminProcedure
    .input(z.object({ templateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(templates).where(eq(templates.templateId, input.templateId));
      return { success: true };
    }),

  duplicateTemplate: rootAdminProcedure
    .input(z.object({ templateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const [original] = await db.select().from(templates)
        .where(eq(templates.templateId, input.templateId)).limit(1);
      if (!original) return { success: false };
      const newId = `${input.templateId}-copy-${Date.now()}`;
      await db.insert(templates).values({
        templateId: newId,
        name: `${original.name} (نسخة)`,
        nameAr: `${original.nameAr} (نسخة)`,
        type: original.type,
        format: original.format,
        content: original.content,
        variables: original.variables,
        isDefault: 0,
        isActive: 1,
        createdBy: ctx.user?.id ?? null,
      });
      return { success: true, newTemplateId: newId };
    }),
});
