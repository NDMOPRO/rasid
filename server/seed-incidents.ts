/**
 * سكربت استيراد حالات الرصد — استبدال كامل
 * يحذف جميع السجلات القديمة ويستبدلها بـ 110 حالة من final_v3_database.json
 * 
 * التشغيل: npx tsx server/seed-incidents.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDb } from "./db";
import { leaks } from "../drizzle/schema";
import { sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawIncident {
  id: string;
  victim: string;
  title_en: string;
  title_ar: string;
  date: string;
  category: string;
  overview: {
    discovery_date: string;
    attack_method: string;
    attack_method_ar: string;
    exposed_records: number;
    data_size: string;
    source_platform: string;
    source_url: string;
    severity: string;
    confidence_level: number;
  };
  leak_source: {
    sector: string;
    sector_en: string;
    region: string;
    region_en: string;
    original_url: string;
  };
  attacker_info: {
    alias: string;
    price_usd: number;
    price_display: string;
    platform: string;
    group: string;
    known_attacks: string;
    price: string;
  };
  data_types: string[];
  data_types_ar: string[];
  data_types_count: number;
  data_sensitivity: string;
  data_samples: any[];
  sample_fields: string[];
  sample_fields_en: string[];
  total_sample_records: number;
  ai_analysis: {
    analysis_date: string;
    impact_assessment: string;
    impact_assessment_en: string;
    confidence_percentage: number;
    executive_summary: string;
    executive_summary_en: string;
    recommendations: string[];
    recommendations_ar: string[];
  };
  pdpl_analysis: {
    violated_articles: string;
    estimated_fine_sar: string;
    risk_level: string;
  };
  description_en: string;
  description_ar: string;
  sector: string;
  threat_actor: string;
  sources: { name: string; url: string }[];
}

function mapSeverity(sev: string): "critical" | "high" | "medium" | "low" {
  const s = (sev || "").toLowerCase();
  if (s === "critical" || s === "حرج") return "critical";
  if (s === "high" || s === "مرتفع") return "high";
  if (s === "medium" || s === "متوسط") return "medium";
  return "low";
}

function mapSource(platform: string): "telegram" | "darkweb" | "paste" {
  const p = (platform || "").toLowerCase();
  if (p.includes("telegram")) return "telegram";
  if (p.includes("breach") || p.includes("tor") || p.includes("dark") || p.includes("xss")) return "darkweb";
  if (p.includes("paste")) return "paste";
  return "darkweb";
}

function mapRegion(region: string): { region: string; regionAr: string; city: string; cityAr: string } {
  const r = region || "";
  // Extract city from region like "الرياض" or "مكة المكرمة - جدة"
  const parts = r.split(" - ");
  const regionAr = parts[0] || "غير محدد";
  const cityAr = parts.length > 1 ? parts[1] : parts[0] || "";
  
  // Map to English
  const regionMap: Record<string, string> = {
    "الرياض": "Riyadh",
    "مكة المكرمة": "Makkah",
    "المنطقة الشرقية": "Eastern Province",
    "تبوك": "Tabuk",
    "جدة": "Jeddah",
    "الظهران": "Dhahran",
    "نيوم": "NEOM",
  };
  
  const regionEn = regionMap[regionAr] || regionAr;
  const cityEn = regionMap[cityAr] || cityAr;
  
  return { region: regionEn, regionAr, city: cityEn, cityAr };
}

function transformIncident(raw: RawIncident) {
  const geo = mapRegion(raw.leak_source?.region || "");
  const severity = mapSeverity(raw.overview?.severity || "medium");
  const source = mapSource(raw.overview?.source_platform || "");
  
  return {
    leakId: raw.id,
    title: raw.title_en || raw.title_ar,
    titleAr: raw.title_ar || raw.title_en,
    source,
    severity,
    sector: raw.leak_source?.sector_en || raw.sector || "Unknown",
    sectorAr: raw.leak_source?.sector || raw.sector || "غير محدد",
    piiTypes: JSON.stringify(raw.data_types || []),
    recordCount: raw.overview?.exposed_records || 0,
    status: "documented" as const,
    description: raw.description_en || "",
    descriptionAr: raw.description_ar || "",
    aiSeverity: mapSeverity(raw.ai_analysis?.impact_assessment_en || raw.overview?.severity || "medium"),
    aiSummary: raw.ai_analysis?.executive_summary_en || "",
    aiSummaryAr: raw.ai_analysis?.executive_summary || "",
    aiRecommendations: JSON.stringify(raw.ai_analysis?.recommendations || []),
    aiRecommendationsAr: JSON.stringify(raw.ai_analysis?.recommendations_ar || []),
    aiConfidence: raw.ai_analysis?.confidence_percentage || raw.overview?.confidence_level || 0,
    sampleData: JSON.stringify(raw.data_samples || []),
    sourceUrl: raw.overview?.source_url || raw.leak_source?.original_url || "",
    sourcePlatform: raw.overview?.source_platform || raw.attacker_info?.platform || "",
    screenshotUrls: JSON.stringify((raw.sources || []).map(s => s.url)),
    threatActor: raw.threat_actor || raw.attacker_info?.alias || "",
    leakPrice: raw.attacker_info?.price || "",
    breachMethod: raw.overview?.attack_method || "",
    breachMethodAr: raw.overview?.attack_method_ar || "",
    region: geo.region,
    regionAr: geo.regionAr,
    city: geo.city,
    cityAr: geo.cityAr,
    detectedAt: raw.date ? new Date(raw.date).toISOString().slice(0, 19).replace("T", " ") : new Date().toISOString().slice(0, 19).replace("T", " "),
    publishStatus: "published" as const,
  };
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  استيراد حالات الرصد — استبدال كامل");
  console.log("═══════════════════════════════════════════════════");

  // 1. قراءة ملف البيانات
  const dataPath = path.join(__dirname, "..", "data", "final_v3_database.json");
  if (!fs.existsSync(dataPath)) {
    console.error("❌ ملف البيانات غير موجود:", dataPath);
    process.exit(1);
  }

  const rawData: RawIncident[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  console.log(`📄 تم قراءة ${rawData.length} حالة من الملف`);

  // 2. الاتصال بقاعدة البيانات
  const db = await getDb();
  if (!db) {
    console.error("❌ لا يمكن الاتصال بقاعدة البيانات");
    process.exit(1);
  }

  // 3. حذف جميع السجلات القديمة
  console.log("🗑️  حذف جميع السجلات القديمة...");
  await db.delete(leaks);
  console.log("✅ تم حذف جميع السجلات القديمة");

  // 4. تحويل وإدخال البيانات الجديدة بدفعات
  const BATCH_SIZE = 25;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
    const batch = rawData.slice(i, i + BATCH_SIZE);
    const transformed = batch.map(r => {
      try {
        return transformIncident(r);
      } catch (err: any) {
        console.error(`⚠️ خطأ في تحويل ${r.id}: ${err.message}`);
        errors++;
        return null;
      }
    }).filter(Boolean);

    if (transformed.length > 0) {
      try {
        await db.insert(leaks).values(transformed as any);
        inserted += transformed.length;
        console.log(`  ✅ دفعة ${Math.floor(i / BATCH_SIZE) + 1}: ${transformed.length} حالة (${inserted}/${rawData.length})`);
      } catch (err: any) {
        console.error(`  ❌ خطأ في الدفعة ${Math.floor(i / BATCH_SIZE) + 1}: ${err.message}`);
        // محاولة إدخال واحدة تلو الأخرى
        for (const item of transformed) {
          try {
            await db.insert(leaks).values(item as any);
            inserted++;
          } catch (e: any) {
            console.error(`    ❌ فشل إدخال ${(item as any).leakId}: ${e.message}`);
            errors++;
          }
        }
      }
    }
  }

  // 5. التحقق
  const [countResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(leaks);
  const totalInDb = countResult?.count || 0;

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`✅ تم استيراد ${inserted} حالة رصد`);
  console.log(`❌ أخطاء: ${errors}`);
  console.log(`📊 إجمالي في قاعدة البيانات: ${totalInDb}`);
  console.log("═══════════════════════════════════════════════════");

  // 6. إحصائيات سريعة
  const severityStats = await db.select({
    severity: leaks.severity,
    count: sql<number>`COUNT(*)`
  }).from(leaks).groupBy(leaks.severity);
  
  console.log("\n📊 توزيع الخطورة:");
  for (const s of severityStats) {
    console.log(`  ${s.severity}: ${s.count}`);
  }

  const sourceStats = await db.select({
    source: leaks.source,
    count: sql<number>`COUNT(*)`
  }).from(leaks).groupBy(leaks.source);
  
  console.log("\n📊 توزيع المصادر:");
  for (const s of sourceStats) {
    console.log(`  ${s.source}: ${s.count}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error("❌ خطأ عام:", err);
  process.exit(1);
});
