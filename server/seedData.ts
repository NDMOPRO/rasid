/**
 * Seed Data System — بذر البيانات الأولية
 * Seeds all new RASID ULTIMATE tables with initial data
 */
import { getDb, bulkInsertPrivacyDomains, clearAllPrivacyDomains } from "./db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";

// ═══════════════════════════════════════════════════════════════
// PATRIOTIC PHRASES — 35+ عبارة وطنية تشجيعية
// ═══════════════════════════════════════════════════════════════
const PATRIOTIC_PHRASES = [
  // عام
  { phrase: "معاً نحمي بيانات وطننا الغالي 🇸🇦", category: "general" },
  { phrase: "حماية البيانات واجب وطني نفخر به", category: "general" },
  { phrase: "في خدمة الوطن، كل بايت محمي", category: "general" },
  { phrase: "راصد يحرس بيانات المملكة بعين لا تنام", category: "general" },
  { phrase: "أمن المعلومات ركيزة من ركائز أمننا الوطني", category: "general" },
  { phrase: "نحن حراس البيانات في أرض الحرمين", category: "general" },
  { phrase: "بيانات وطننا أمانة في أعناقنا", category: "general" },
  // نجاح
  { phrase: "أحسنت! هكذا نبني منظومة حماية متينة للوطن", category: "success" },
  { phrase: "عمل متميز يليق بطموحات المملكة", category: "success" },
  { phrase: "إنجاز يُضاف لسجل حماية بيانات الوطن", category: "success" },
  { phrase: "تم بنجاح — خطوة أخرى نحو أمان رقمي شامل", category: "success" },
  { phrase: "بارك الله جهودكم في حماية خصوصية المواطنين", category: "success" },
  { phrase: "نتيجة ممتازة تعكس التزامنا بأعلى المعايير", category: "success" },
  // ترحيب
  { phrase: "أهلاً بحارس بيانات الوطن!", category: "greeting" },
  { phrase: "مرحباً بك في خط الدفاع الأول عن خصوصية المملكة", category: "greeting" },
  { phrase: "حياك الله — راصد جاهز لخدمتك وخدمة الوطن", category: "greeting" },
  { phrase: "أهلاً بالمحارب الرقمي — كيف أخدمك اليوم؟", category: "greeting" },
  { phrase: "مرحباً — معاً نصنع الفرق في حماية بيانات بلادنا", category: "greeting" },
  // تحفيز
  { phrase: "كل تحليل تقوم به يقرّبنا من أمان رقمي شامل", category: "motivation" },
  { phrase: "جهودك اليوم تحمي أجيال الغد", category: "motivation" },
  { phrase: "استمر — فالوطن يعتمد على يقظتك", category: "motivation" },
  { phrase: "أنت الدرع الرقمي للمملكة — واصل", category: "motivation" },
  { phrase: "كل تقرير تصدره يعزز منظومة الحماية الوطنية", category: "motivation" },
  { phrase: "العمل الدؤوب يصنع الأمان — وأنت تصنعه كل يوم", category: "motivation" },
  // اليوم الوطني
  { phrase: "في يوم وطننا — نجدد العهد بحماية بياناته", category: "national_day" },
  { phrase: "المملكة العربية السعودية — وطن الأمان الرقمي", category: "national_day" },
  { phrase: "93 عاماً من العطاء — ومستقبل رقمي آمن بإذن الله", category: "national_day" },
  { phrase: "فخرنا بوطننا يدفعنا لحماية كل معلومة فيه", category: "national_day" },
  // رؤية 2030
  { phrase: "رؤية 2030 — مملكة رقمية آمنة ومزدهرة", category: "vision2030" },
  { phrase: "نحو اقتصاد رقمي آمن — تماشياً مع رؤية المملكة 2030", category: "vision2030" },
  { phrase: "حماية البيانات ركيزة التحول الرقمي في رؤية 2030", category: "vision2030" },
  { phrase: "بيانات محمية = مستقبل مزدهر — هذه رؤيتنا", category: "vision2030" },
  { phrase: "نبني مستقبلاً رقمياً آمناً يليق بطموحات المملكة", category: "vision2030" },
  { phrase: "الأمن السيبراني عمود من أعمدة رؤية 2030", category: "vision2030" },
  { phrase: "من أرض الحرمين ننطلق نحو ريادة رقمية عالمية", category: "vision2030" },
];

// ═══════════════════════════════════════════════════════════════
// KEYWORD-TASK MAPPING — ربط الكلمات بالمهام
// ═══════════════════════════════════════════════════════════════
const KEYWORD_TASK_MAPPINGS = [
  { keyword: "لوحة المعلومات", taskType: "navigate", targetAction: '{"route": "/", "description": "الانتقال للوحة المعلومات الرئيسية"}', priority: 10 },
  { keyword: "حالات الرصد", taskType: "navigate", targetAction: '{"route": "/cases", "description": "عرض حالات الرصد"}', priority: 10 },
  { keyword: "فحص", taskType: "navigate", targetAction: '{"route": "/scan", "description": "بدء فحص جديد"}', priority: 9 },
  { keyword: "تقارير", taskType: "navigate", targetAction: '{"route": "/reports", "description": "عرض التقارير"}', priority: 9 },
  { keyword: "إعدادات", taskType: "navigate", targetAction: '{"route": "/settings", "description": "فتح الإعدادات"}', priority: 8 },
  { keyword: "مستخدمين", taskType: "navigate", targetAction: '{"route": "/user-management", "description": "إدارة المستخدمين"}', priority: 8 },
  { keyword: "تنبيهات", taskType: "navigate", targetAction: '{"route": "/smart-alerts", "description": "التنبيهات الذكية"}', priority: 8 },
  { keyword: "بحث", taskType: "query", targetAction: '{"tool": "query_leaks", "description": "البحث في حالات الرصد"}', priority: 9 },
  { keyword: "تحليل", taskType: "analyze", targetAction: '{"tool": "analyze_trends", "description": "تحليل الاتجاهات"}', priority: 9 },
  { keyword: "إحصائيات", taskType: "query", targetAction: '{"tool": "get_dashboard_stats", "description": "جلب الإحصائيات"}', priority: 10 },
  { keyword: "بائعين", taskType: "query", targetAction: '{"tool": "get_sellers_info", "description": "معلومات البائعين"}', priority: 8 },
  { keyword: "أدلة", taskType: "query", targetAction: '{"tool": "get_evidence_info", "description": "الأدلة الرقمية"}', priority: 8 },
  { keyword: "خريطة التهديدات", taskType: "query", targetAction: '{"tool": "get_threat_map", "description": "خريطة التهديدات"}', priority: 9 },
  { keyword: "امتثال", taskType: "navigate", targetAction: '{"route": "/pdpl-compliance", "description": "حالة الامتثال"}', priority: 9 },
  { keyword: "خصوصية", taskType: "navigate", targetAction: '{"route": "/leadership", "description": "لوحة الخصوصية"}', priority: 8 },
  { keyword: "دارك ويب", taskType: "query", targetAction: '{"tool": "get_darkweb_pastes", "description": "رصد الدارك ويب"}', priority: 9 },
  { keyword: "سجل المراجعة", taskType: "query", targetAction: '{"tool": "get_audit_log", "description": "سجل المراجعة"}', priority: 8 },
  { keyword: "قاعدة المعرفة", taskType: "navigate", targetAction: '{"route": "/knowledge-base", "description": "قاعدة المعرفة"}', priority: 7 },
  { keyword: "تدريب", taskType: "navigate", targetAction: '{"route": "/training-center", "description": "مركز التدريب"}', priority: 7 },
  { keyword: "عرض تقديمي", taskType: "navigate", targetAction: '{"route": "/presentation-builder", "description": "منشئ العروض"}', priority: 7 },
];

// ═══════════════════════════════════════════════════════════════
// AI RATE LIMITS — Default rate limits per tool category
// ═══════════════════════════════════════════════════════════════
const DEFAULT_RATE_LIMITS = [
  { toolName: "query_leaks", maxPerMin: 15, maxPerHour: 200, maxPerDay: 2000, cooldown: 1 },
  { toolName: "execute_live_scan", maxPerMin: 3, maxPerHour: 20, maxPerDay: 100, cooldown: 10 },
  { toolName: "execute_pii_scan", maxPerMin: 3, maxPerHour: 20, maxPerDay: 100, cooldown: 10 },
  { toolName: "create_leak_record", maxPerMin: 5, maxPerHour: 50, maxPerDay: 200, cooldown: 5 },
  { toolName: "update_leak_status", maxPerMin: 10, maxPerHour: 100, maxPerDay: 500, cooldown: 2 },
  { toolName: "generate_report", maxPerMin: 3, maxPerHour: 30, maxPerDay: 100, cooldown: 10 },
  { toolName: "create_alert_channel", maxPerMin: 5, maxPerHour: 30, maxPerDay: 100, cooldown: 5 },
  { toolName: "create_alert_rule", maxPerMin: 5, maxPerHour: 30, maxPerDay: 100, cooldown: 5 },
  { toolName: "generate_chart", maxPerMin: 10, maxPerHour: 100, maxPerDay: 500, cooldown: 2 },
  { toolName: "generate_dashboard", maxPerMin: 5, maxPerHour: 50, maxPerDay: 200, cooldown: 5 },
  { toolName: "get_dashboard_stats", maxPerMin: 20, maxPerHour: 300, maxPerDay: 3000, cooldown: 1 },
  { toolName: "analyze_trends", maxPerMin: 10, maxPerHour: 100, maxPerDay: 500, cooldown: 2 },
  { toolName: "_default", maxPerMin: 15, maxPerHour: 200, maxPerDay: 2000, cooldown: 1 },
];

// ═══════════════════════════════════════════════════════════════
// GUIDE CATALOG SEED — بذر كتالوج الأدلة الإرشادية
// ═══════════════════════════════════════════════════════════════
const GUIDE_STEPS = [
  { guideId: "onboarding", stepId: "welcome", title: "مرحباً بك في راصد", order: 1 },
  { guideId: "onboarding", stepId: "dashboard_tour", title: "جولة في لوحة المعلومات", order: 2 },
  { guideId: "onboarding", stepId: "first_scan", title: "أول عملية فحص", order: 3 },
  { guideId: "onboarding", stepId: "smart_rasid", title: "تعرف على راصد الذكي", order: 4 },
  { guideId: "onboarding", stepId: "reports", title: "إنشاء أول تقرير", order: 5 },
  { guideId: "scanning", stepId: "basic_scan", title: "الفحص الأساسي", order: 1 },
  { guideId: "scanning", stepId: "advanced_scan", title: "الفحص المتقدم", order: 2 },
  { guideId: "scanning", stepId: "batch_scan", title: "الفحص الجماعي", order: 3 },
  { guideId: "scanning", stepId: "schedule_scan", title: "جدولة الفحوصات", order: 4 },
  { guideId: "privacy", stepId: "pdpl_overview", title: "نظرة عامة على PDPL", order: 1 },
  { guideId: "privacy", stepId: "compliance_check", title: "فحص الامتثال", order: 2 },
  { guideId: "privacy", stepId: "privacy_assessment", title: "تقييم الخصوصية", order: 3 },
];

// ═══════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════
export async function seedAllNewTables(): Promise<{ results: Record<string, { seeded: number; status: string }> }> {
  const db = await getDb();
  if (!db) { console.warn('[SeedData] Database not available'); return { results: {} }; }
  const results: Record<string, { seeded: number; status: string }> = {};

  // 1. Seed Patriotic Phrases
  try {
    const [existing] = await db.execute(sql`SELECT COUNT(*) as cnt FROM patriotic_phrases`);
    if ((existing as any)[0]?.cnt === 0 || (existing as any)[0]?.cnt === '0') {
      for (let i = 0; i < PATRIOTIC_PHRASES.length; i++) {
        const p = PATRIOTIC_PHRASES[i];
        await db.execute(sql`INSERT INTO patriotic_phrases (phrase, category, is_active, display_order) VALUES (${p.phrase}, ${p.category}, 1, ${i})`);
      }
      results.patriotic_phrases = { seeded: PATRIOTIC_PHRASES.length, status: "completed" };
    } else {
      results.patriotic_phrases = { seeded: 0, status: "already_seeded" };
    }
  } catch (e: any) {
    results.patriotic_phrases = { seeded: 0, status: `error: ${e.message}` };
  }

  // 2. Seed Keyword-Task Mappings
  try {
    const [existing] = await db.execute(sql`SELECT COUNT(*) as cnt FROM ai_keyword_task_map`);
    if ((existing as any)[0]?.cnt === 0 || (existing as any)[0]?.cnt === '0') {
      for (const m of KEYWORD_TASK_MAPPINGS) {
        await db.execute(sql`INSERT INTO ai_keyword_task_map (keyword, task_type, target_action, priority, is_active) VALUES (${m.keyword}, ${m.taskType}, ${m.targetAction}, ${m.priority}, 1)`);
      }
      results.keyword_task_map = { seeded: KEYWORD_TASK_MAPPINGS.length, status: "completed" };
    } else {
      results.keyword_task_map = { seeded: 0, status: "already_seeded" };
    }
  } catch (e: any) {
    results.keyword_task_map = { seeded: 0, status: `error: ${e.message}` };
  }

  // 3. Seed AI Rate Limits
  try {
    const [existing] = await db.execute(sql`SELECT COUNT(*) as cnt FROM ai_rate_limits`);
    if ((existing as any)[0]?.cnt === 0 || (existing as any)[0]?.cnt === '0') {
      for (const r of DEFAULT_RATE_LIMITS) {
        await db.execute(sql`INSERT INTO ai_rate_limits (tool_name, max_calls_per_minute, max_calls_per_hour, max_calls_per_day, cooldown_seconds, is_enabled) VALUES (${r.toolName}, ${r.maxPerMin}, ${r.maxPerHour}, ${r.maxPerDay}, ${r.cooldown}, 1)`);
      }
      results.rate_limits = { seeded: DEFAULT_RATE_LIMITS.length, status: "completed" };
    } else {
      results.rate_limits = { seeded: 0, status: "already_seeded" };
    }
  } catch (e: any) {
    results.rate_limits = { seeded: 0, status: `error: ${e.message}` };
  }

  // 4. Seed Privacy Domains from seed-privacy-data.json.gz
  try {
    const [existingPrivacy] = await db.execute(sql`SELECT COUNT(*) as cnt FROM privacy_domains`);
    const privacyCount = Number((existingPrivacy as any)[0]?.cnt || 0);
    if (privacyCount < 1000) {
      console.log('[SeedData] Seeding privacy domains from seed-privacy-data.json.gz...');
      const gzPath = path.join(process.cwd(), 'server', 'seed-privacy-data.json.gz');
      const jsonPath = path.join(process.cwd(), 'server', 'seed-privacy-data.json');
      let privacyData: any[] = [];
      if (fs.existsSync(gzPath)) {
        const compressed = fs.readFileSync(gzPath);
        const decompressed = zlib.gunzipSync(compressed);
        privacyData = JSON.parse(decompressed.toString());
      } else if (fs.existsSync(jsonPath)) {
        privacyData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      }
      if (privacyData.length > 0) {
        if (privacyCount > 0) await clearAllPrivacyDomains();
        const insertResult = await bulkInsertPrivacyDomains(privacyData);
        results.privacy_domains = { seeded: insertResult.inserted, status: 'completed' };
        console.log(`[SeedData] Seeded ${insertResult.inserted} privacy domains`);
      } else {
        results.privacy_domains = { seeded: 0, status: 'no_data_file' };
      }
    } else {
      results.privacy_domains = { seeded: 0, status: `already_seeded (${privacyCount} records)` };
    }
  } catch (e: any) {
    console.error('[SeedData] Privacy seed error:', e.message);
    results.privacy_domains = { seeded: 0, status: `error: ${e.message}` };
  }

  // 5. Log the seed operation
  try {
    await db.execute(sql`INSERT INTO seed_data_logs (seed_type, records_created, status, details) VALUES ('ultimate_upgrade', ${Object.values(results).reduce((sum, r) => sum + r.seeded, 0)}, 'completed', ${JSON.stringify(results)})`);
  } catch {
    // Ignore logging errors
  }

  return { results };
}

// ═══════════════════════════════════════════════════════════════
// ENSURE TABLES EXIST — Safe table creation
// ═══════════════════════════════════════════════════════════════
export async function ensureNewTablesExist(): Promise<void> {
  const db = await getDb();
  if (!db) { console.warn('[SeedData] Database not available for table creation'); return; }
  const tables = [
    `CREATE TABLE IF NOT EXISTS ai_session_memory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      session_key VARCHAR(255) NOT NULL,
      memory_type VARCHAR(50) NOT NULL DEFAULT 'context',
      content TEXT NOT NULL,
      importance INT NOT NULL DEFAULT 5,
      expires_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_asm_user (user_id),
      INDEX idx_asm_key (session_key)
    )`,
    `CREATE TABLE IF NOT EXISTS ai_tool_usage (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tool_name VARCHAR(100) NOT NULL,
      execution_time_ms INT,
      success TINYINT NOT NULL DEFAULT 1,
      error_message TEXT,
      input_summary TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_atu_user (user_id),
      INDEX idx_atu_tool (tool_name),
      INDEX idx_atu_created (created_at)
    )`,
    `CREATE TABLE IF NOT EXISTS ai_rate_limits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tool_name VARCHAR(100) NOT NULL,
      max_calls_per_minute INT NOT NULL DEFAULT 10,
      max_calls_per_hour INT NOT NULL DEFAULT 100,
      max_calls_per_day INT NOT NULL DEFAULT 1000,
      cooldown_seconds INT NOT NULL DEFAULT 2,
      is_enabled TINYINT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE INDEX idx_arl_tool (tool_name)
    )`,
    `CREATE TABLE IF NOT EXISTS ai_confirmation_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tool_name VARCHAR(100) NOT NULL,
      action_description TEXT NOT NULL,
      params TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      expires_at TIMESTAMP NOT NULL,
      confirmed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_acr_user (user_id),
      INDEX idx_acr_status (status)
    )`,
    `CREATE TABLE IF NOT EXISTS bulk_imports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      file_name VARCHAR(500) NOT NULL,
      file_type VARCHAR(20) NOT NULL,
      total_records INT NOT NULL DEFAULT 0,
      processed_records INT NOT NULL DEFAULT 0,
      failed_records INT NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      error_log TEXT,
      target_table VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      INDEX idx_bi_user (user_id),
      INDEX idx_bi_status (status)
    )`,
    `CREATE TABLE IF NOT EXISTS guide_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      guide_id VARCHAR(100) NOT NULL,
      step_id VARCHAR(100) NOT NULL,
      completed TINYINT NOT NULL DEFAULT 0,
      skipped TINYINT NOT NULL DEFAULT 0,
      completed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_gp_user (user_id),
      UNIQUE INDEX idx_gp_unique (user_id, guide_id, step_id)
    )`,
    `CREATE TABLE IF NOT EXISTS auto_learning_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source_type VARCHAR(50) NOT NULL,
      trigger_pattern TEXT NOT NULL,
      learned_response TEXT NOT NULL,
      confidence DECIMAL(5,2) NOT NULL DEFAULT 0.50,
      usage_count INT NOT NULL DEFAULT 0,
      last_used_at TIMESTAMP NULL,
      is_active TINYINT NOT NULL DEFAULT 1,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS seed_data_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seed_type VARCHAR(100) NOT NULL,
      records_created INT NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'completed',
      executed_by INT,
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ai_navigation_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      from_page VARCHAR(255),
      to_page VARCHAR(255) NOT NULL,
      reason TEXT,
      triggered_by VARCHAR(50) NOT NULL DEFAULT 'ai',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_anh_user (user_id)
    )`,
    `CREATE TABLE IF NOT EXISTS patriotic_phrases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phrase TEXT NOT NULL,
      category VARCHAR(50) NOT NULL DEFAULT 'general',
      is_active TINYINT NOT NULL DEFAULT 1,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ai_keyword_task_map (
      id INT AUTO_INCREMENT PRIMARY KEY,
      keyword VARCHAR(255) NOT NULL,
      task_type VARCHAR(100) NOT NULL,
      target_action TEXT NOT NULL,
      priority INT NOT NULL DEFAULT 5,
      is_active TINYINT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_aktm_keyword (keyword)
    )`,
    `CREATE TABLE IF NOT EXISTS sse_stream_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      session_token VARCHAR(255) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      message_count INT NOT NULL DEFAULT 0,
      total_tokens INT NOT NULL DEFAULT 0,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP NULL,
      INDEX idx_sss_user (user_id),
      INDEX idx_sss_token (session_token)
    )`,
    `CREATE TABLE IF NOT EXISTS ai_guide_steps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      step_order INT NOT NULL,
      title_ar VARCHAR(255) NOT NULL,
      title_en VARCHAR(255) NOT NULL,
      description_ar TEXT NOT NULL,
      description_en TEXT,
      target_selector VARCHAR(255),
      target_page VARCHAR(255),
      category VARCHAR(50) NOT NULL DEFAULT 'general',
      is_active TINYINT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS ai_auto_learning (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      pattern_type VARCHAR(100) NOT NULL,
      input_pattern TEXT NOT NULL,
      learned_response TEXT NOT NULL,
      confidence DECIMAL(5,2) NOT NULL DEFAULT 0.50,
      usage_count INT NOT NULL DEFAULT 0,
      is_approved TINYINT NOT NULL DEFAULT 0,
      source VARCHAR(50) NOT NULL DEFAULT 'auto',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_aal_pattern (pattern_type),
      INDEX idx_aal_user (user_id)
    )`,
    `CREATE TABLE IF NOT EXISTS custom_pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      workspace VARCHAR(20) NOT NULL,
      page_type VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL,
      icon VARCHAR(50) DEFAULT 'LayoutDashboard',
      sort_order INT NOT NULL DEFAULT 0,
      config JSON,
      is_default TINYINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_cp_user_workspace (user_id, workspace)
    )`,
    `CREATE TABLE IF NOT EXISTS import_jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      jobId VARCHAR(64) NOT NULL,
      fileName VARCHAR(500) NOT NULL,
      fileType ENUM('zip','json','xlsx','csv') NOT NULL,
      fileSizeBytes INT NOT NULL DEFAULT 0,
      status ENUM('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
      totalRecords INT NOT NULL DEFAULT 0,
      processedRecords INT NOT NULL DEFAULT 0,
      successRecords INT NOT NULL DEFAULT 0,
      failedRecords INT NOT NULL DEFAULT 0,
      errorLog JSON,
      importedBy INT NOT NULL DEFAULT 0,
      importedByName VARCHAR(200),
      startedAt TIMESTAMP NULL,
      completedAt TIMESTAMP NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ij_jobId (jobId)
    )`,
    `CREATE TABLE IF NOT EXISTS privacy_domains (
      pd_id INT AUTO_INCREMENT PRIMARY KEY,
      pd_domain VARCHAR(255) NOT NULL,
      pd_status VARCHAR(20),
      pd_working_url TEXT,
      pd_final_url TEXT,
      pd_name_ar VARCHAR(500),
      pd_name_en VARCHAR(500),
      pd_title TEXT,
      pd_description TEXT,
      pd_category VARCHAR(100),
      pd_cms VARCHAR(100),
      pd_ssl_status VARCHAR(50),
      pd_mx_records TEXT,
      pd_email TEXT,
      pd_phone TEXT,
      pd_policy_url TEXT,
      pd_policy_title TEXT,
      pd_policy_status_code VARCHAR(10),
      pd_policy_language VARCHAR(20),
      pd_policy_last_update VARCHAR(100),
      pd_discovery_method VARCHAR(100),
      pd_policy_confidence VARCHAR(50),
      pd_policy_word_count INT,
      pd_policy_char_count INT,
      pd_robots_status VARCHAR(50),
      pd_entity_name VARCHAR(500),
      pd_entity_email TEXT,
      pd_entity_phone TEXT,
      pd_entity_address TEXT,
      pd_dpo VARCHAR(300),
      pd_contact_form TEXT,
      pd_mentions_data_types TINYINT DEFAULT 0,
      pd_data_types_list TEXT,
      pd_mentions_purpose TINYINT DEFAULT 0,
      pd_purpose_list TEXT,
      pd_mentions_legal_basis TINYINT DEFAULT 0,
      pd_mentions_rights TINYINT DEFAULT 0,
      pd_rights_list TEXT,
      pd_mentions_retention TINYINT DEFAULT 0,
      pd_mentions_third_parties TINYINT DEFAULT 0,
      pd_third_parties_list TEXT,
      pd_mentions_cross_border TINYINT DEFAULT 0,
      pd_mentions_security TINYINT DEFAULT 0,
      pd_mentions_cookies TINYINT DEFAULT 0,
      pd_mentions_children TINYINT DEFAULT 0,
      pd_compliance_score INT DEFAULT 0,
      pd_compliance_status VARCHAR(30),
      pd_screenshot_url TEXT,
      pd_https_www VARCHAR(10),
      pd_https_no_www VARCHAR(10),
      pd_http_www VARCHAR(10),
      pd_http_no_www VARCHAR(10),
      pd_classification VARCHAR(200),
      pd_policy_final_url TEXT,
      pd_internal_links TEXT,
      pd_crawl_status VARCHAR(50),
      pd_full_text_path TEXT,
      pd_imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      pd_last_scan_at TIMESTAMP NULL,
      pd_scan_run_id INT,
      INDEX idx_pd_domain (pd_domain),
      INDEX idx_pd_status (pd_status),
      INDEX idx_pd_category (pd_category)
    )`,
    `CREATE TABLE IF NOT EXISTS privacy_screenshots (
      ps_id INT AUTO_INCREMENT PRIMARY KEY,
      ps_domain_id INT NOT NULL,
      ps_scan_run_id INT,
      ps_capture_type VARCHAR(30),
      ps_file_path TEXT,
      ps_file_hash VARCHAR(64),
      ps_file_size INT,
      ps_is_primary TINYINT DEFAULT 0,
      ps_captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ps_domain (ps_domain_id)
    )`,
    `CREATE TABLE IF NOT EXISTS privacy_scan_runs (
      psr_id INT AUTO_INCREMENT PRIMARY KEY,
      psr_source_type VARCHAR(30),
      psr_source_file VARCHAR(255),
      psr_total_domains INT DEFAULT 0,
      psr_scanned INT DEFAULT 0,
      psr_with_policy INT DEFAULT 0,
      psr_without_policy INT DEFAULT 0,
      psr_errors INT DEFAULT 0,
      psr_status VARCHAR(20) DEFAULT 'pending',
      psr_started_at TIMESTAMP NULL,
      psr_completed_at TIMESTAMP NULL,
      psr_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const ddl of tables) {
    try {
      await db.execute(sql.raw(ddl));
    } catch (e: any) {
      console.warn(`[SeedData] Table creation warning: ${e.message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// AUTO-INIT — Call on server startup
// ═══════════════════════════════════════════════════════════════
export async function initSeedData(): Promise<void> {
  try {
    console.log("[SeedData] Ensuring new tables exist...");
    await ensureNewTablesExist();
    console.log("[SeedData] Tables verified. Running seed...");
    const result = await seedAllNewTables();
    const totalSeeded = Object.values(result.results).reduce((sum, r) => sum + r.seeded, 0);
    if (totalSeeded > 0) {
      console.log(`[SeedData] Seeded ${totalSeeded} records across ${Object.keys(result.results).length} tables`);
    } else {
      console.log("[SeedData] All tables already seeded — skipping");
    }
  } catch (e: any) {
    console.error("[SeedData] Init error:", e.message);
  }
}
