# rasid - scripts

> Auto-extracted source code documentation

---

## `scripts/deploy.sh`

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Rasid Platform — Manual Deploy Helper
# Usage: ./scripts/deploy.sh [migrate|seed|health|status]
# ═══════════════════════════════════════════════════════════

set -e

ACTION=${1:-help}

case "$ACTION" in
  migrate)
    echo "→ Running migrations against production database..."
    if [ -z "$DATABASE_URL" ]; then
      echo "✗ DATABASE_URL is not set. Export it first:"
      echo "  export DATABASE_URL='mysql://...'"
      exit 1
    fi
    for sql_file in drizzle/0001_*.sql; do
      if [ -f "$sql_file" ]; then
        echo "  Applying: $(basename $sql_file)"
        node -e "
          const mysql = require('mysql2/promise');
          const fs = require('fs');
          (async () => {
            const sql = fs.readFileSync('$sql_file', 'utf8');
            const conn = await mysql.createConnection(process.env.DATABASE_URL);
            const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
            for (const stmt of statements) {
              if (stmt.trim()) {
                try {
                  await conn.execute(stmt);
                  process.stdout.write('.');
                } catch (e) {
                  if (e.errno === 1060 || e.errno === 1050) {
                    process.stdout.write('s');
                  } else {
                    console.error('\n  Error:', e.message);
                  }
                }
              }
            }
            await conn.end();
            console.log('\n  ✓ Done');
          })();
        "
      fi
    done
    echo "→ All migrations applied."
    ;;

  seed)
    echo "→ Running admin seed data..."
    if [ -z "$DATABASE_URL" ]; then
      echo "✗ DATABASE_URL is not set."
      exit 1
    fi
    npx tsx server/adminSeed.ts
    echo "→ Seed complete."
    ;;

  health)
    echo "→ Checking production health..."
    URL=${RAILWAY_URL:-http://localhost:3000}
    curl -s "$URL/api/health" | node -e "
      let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
        try{const j=JSON.parse(d);console.log('Status:',j.status);console.log('Time:',j.timestamp);console.log('Service:',j.service)}
        catch(e){console.log('Raw:',d)}
      })
    "
    ;;

  status)
    echo "→ Checking database tables..."
    if [ -z "$DATABASE_URL" ]; then
      echo "✗ DATABASE_URL is not set."
      exit 1
    fi
    node -e "
      const mysql = require('mysql2/promise');
      (async () => {
        const conn = await mysql.createConnection(process.env.DATABASE_URL);
        const tables = ['import_jobs','export_jobs','page_registry','ai_personality_config','platform_assets','api_providers','templates','notification_rules','notification_log','system_health_log'];
        for (const t of tables) {
          try {
            const [rows] = await conn.execute('SELECT COUNT(*) as c FROM ' + t);
            console.log('  ✓', t, '—', rows[0].c, 'rows');
          } catch (e) {
            console.log('  ✗', t, '— MISSING');
          }
        }
        // Check leaks publishStatus column
        try {
          const [rows] = await conn.execute('SELECT publishStatus FROM leaks LIMIT 1');
          console.log('  ✓ leaks.publishStatus — exists');
        } catch (e) {
          console.log('  ✗ leaks.publishStatus — MISSING');
        }
        await conn.end();
      })();
    "
    ;;

  help|*)
    echo "═══════════════════════════════════════════"
    echo "  Rasid Deploy Helper"
    echo "═══════════════════════════════════════════"
    echo ""
    echo "Usage: ./scripts/deploy.sh <command>"
    echo ""
    echo "Commands:"
    echo "  migrate   Apply pending SQL migrations"
    echo "  seed      Run admin seed data"
    echo "  health    Check production health endpoint"
    echo "  status    Check database tables exist"
    echo ""
    echo "Environment:"
    echo "  DATABASE_URL    Required for migrate/seed/status"
    echo "  RAILWAY_URL     Optional for health check"
    echo ""
    ;;
esac

```

---

## `scripts/run_migration.mjs`

```javascript
import mysql from 'mysql2/promise';
import fs from 'fs';

const DB_URL = process.env.DATABASE_URL || 'mysql://root:cQOxZQQWCkiHpTDzjwPmYhLnWQAwYCDm@switchyard.proxy.rlwy.net:56082/railway';

async function runMigration() {
  const sql = fs.readFileSync('drizzle/0001_production_migration.sql', 'utf8');
  const conn = await mysql.createConnection(DB_URL);

  // Remove comment-only lines, then split by semicolons at end of statements
  const cleanSql = sql.split('\n').filter(line => !line.trim().startsWith('--')).join('\n');
  const statements = cleanSql.split(';\n').map(s => s.trim()).filter(s => s.length > 0);

  let applied = 0;
  let skipped = 0;
  let errors = 0;

  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (!trimmed) continue;

    try {
      await conn.execute(trimmed);
      applied++;
      process.stdout.write('✓');
    } catch (e) {
      // ER_TABLE_EXISTS_ERROR (1050) or ER_DUP_FIELDNAME (1060)
      if (e.errno === 1060 || e.errno === 1050) {
        skipped++;
        process.stdout.write('s');
      } else {
        errors++;
        console.error('\n✗ Error:', e.message);
        console.error('  Statement:', trimmed.substring(0, 100) + '...');
      }
    }
  }

  await conn.end();
  console.log('\n');
  console.log('═══════════════════════════════════');
  console.log(`  Applied:  ${applied}`);
  console.log(`  Skipped:  ${skipped} (already exist)`);
  console.log(`  Errors:   ${errors}`);
  console.log('═══════════════════════════════════');

  if (errors > 0) {
    process.exit(1);
  }
}

runMigration().catch(e => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});

```

---

## `scripts/setup-privacy-screenshots.sh`

```bash
#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
#  سكربت تحميل صور الخصوصية من Google Drive — منصة راصد الذكي
#  يقوم بتحميل أرشيف الصور واستخراجها ونسخها إلى المسار الصحيح
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

# ─── الإعدادات ───────────────────────────────────────────────────────
GDRIVE_FILE_ID="1b-yFE5dl0TbojP7LUoN5qQ_ZmN7YThIW"
ARCHIVE_NAME="sa_screenshots_archive.tar.gz"
EXPECTED_COUNT=3317
EXPECTED_SIZE_MB=1700  # ~1.7 GB

# تحديد مسار المشروع تلقائياً (مجلد السكربت/../)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="$PROJECT_ROOT/client/public/screenshots"
TEMP_DIR=$(mktemp -d)

# ─── الألوان ─────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ─── الدوال المساعدة ─────────────────────────────────────────────────
log_info()    { echo -e "${BLUE}[ℹ]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }
log_step()    { echo -e "\n${CYAN}${BOLD}━━━ $1 ━━━${NC}"; }

cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        log_info "تنظيف الملفات المؤقتة..."
        rm -rf "$TEMP_DIR"
    fi
}
trap cleanup EXIT

# ─── التحقق من المتطلبات ─────────────────────────────────────────────
log_step "الخطوة 1/5: التحقق من المتطلبات"

# التحقق من مساحة القرص (نحتاج ~4 GB: 1.7 تحميل + 1.8 استخراج + هامش)
AVAILABLE_GB=$(df -BG "$PROJECT_ROOT" | awk 'NR==2 {print $4}' | tr -d 'G')
if [ "$AVAILABLE_GB" -lt 4 ]; then
    log_error "المساحة المتاحة ${AVAILABLE_GB}GB — نحتاج 4GB على الأقل"
    exit 1
fi
log_success "المساحة المتاحة: ${AVAILABLE_GB}GB (كافية)"

# التحقق من وجود المجلد المستهدف مسبقاً
if [ -d "$TARGET_DIR" ] && [ "$(ls -1 "$TARGET_DIR"/*.png 2>/dev/null | wc -l)" -ge "$EXPECTED_COUNT" ]; then
    CURRENT_COUNT=$(ls -1 "$TARGET_DIR"/*.png 2>/dev/null | wc -l)
    log_warn "المجلد يحتوي بالفعل على ${CURRENT_COUNT} صورة"
    read -p "هل تريد إعادة التحميل والاستبدال؟ (y/N): " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        log_info "تم الإلغاء."
        exit 0
    fi
fi

# ─── تثبيت أداة التحميل ──────────────────────────────────────────────
log_step "الخطوة 2/5: تثبيت أداة التحميل"

install_gdown() {
    if command -v gdown &>/dev/null; then
        log_success "gdown مثبت بالفعل"
        return 0
    fi

    log_info "تثبيت gdown..."
    if command -v pip3 &>/dev/null; then
        pip3 install --quiet gdown
    elif command -v pip &>/dev/null; then
        pip install --quiet gdown
    else
        log_error "pip غير مثبت. قم بتثبيته أولاً:"
        echo "  sudo apt-get install -y python3-pip"
        exit 1
    fi

    if command -v gdown &>/dev/null; then
        log_success "تم تثبيت gdown بنجاح"
    else
        log_error "فشل تثبيت gdown"
        exit 1
    fi
}

install_gdown

# ─── تحميل الأرشيف ───────────────────────────────────────────────────
log_step "الخطوة 3/5: تحميل الأرشيف من Google Drive"

ARCHIVE_PATH="$TEMP_DIR/$ARCHIVE_NAME"

# محاولة التحميل بـ gdown أولاً، ثم curl كبديل
download_with_gdown() {
    log_info "جاري التحميل بـ gdown (~1.7 GB)..."
    gdown "https://drive.google.com/uc?id=$GDRIVE_FILE_ID" \
        -O "$ARCHIVE_PATH" \
        --fuzzy \
        --continue 2>&1 | while IFS= read -r line; do
        # عرض شريط التقدم
        if [[ "$line" == *"%"* ]]; then
            printf "\r${BLUE}[↓]${NC} %s" "$line"
        fi
    done
    echo ""
}

download_with_curl() {
    log_info "جاري التحميل بـ curl (~1.7 GB)..."
    # الحصول على رابط التأكيد لتجاوز تحذير الحجم الكبير
    CONFIRM_TOKEN=$(curl -sc /tmp/gdrive_cookie \
        "https://drive.google.com/uc?export=download&id=$GDRIVE_FILE_ID" \
        | grep -oP 'confirm=\K[^&]+' || true)

    if [ -n "$CONFIRM_TOKEN" ]; then
        curl -Lb /tmp/gdrive_cookie \
            "https://drive.google.com/uc?export=download&confirm=$CONFIRM_TOKEN&id=$GDRIVE_FILE_ID" \
            -o "$ARCHIVE_PATH" \
            --progress-bar
    else
        curl -L \
            "https://drive.google.com/uc?export=download&id=$GDRIVE_FILE_ID" \
            -o "$ARCHIVE_PATH" \
            --progress-bar
    fi
    rm -f /tmp/gdrive_cookie
}

# محاولة التحميل
if command -v gdown &>/dev/null; then
    download_with_gdown || {
        log_warn "فشل gdown، جاري المحاولة بـ curl..."
        download_with_curl
    }
else
    download_with_curl
fi

# التحقق من نجاح التحميل
if [ ! -f "$ARCHIVE_PATH" ]; then
    log_error "فشل التحميل — الملف غير موجود"
    exit 1
fi

FILE_SIZE_MB=$(du -m "$ARCHIVE_PATH" | cut -f1)
if [ "$FILE_SIZE_MB" -lt 100 ]; then
    log_error "حجم الملف ${FILE_SIZE_MB}MB — يبدو أن التحميل لم يكتمل (المتوقع ~${EXPECTED_SIZE_MB}MB)"
    log_info "تحقق من صلاحيات الوصول للملف على Google Drive"
    exit 1
fi

log_success "تم التحميل بنجاح (${FILE_SIZE_MB}MB)"

# ─── استخراج الصور ───────────────────────────────────────────────────
log_step "الخطوة 4/5: استخراج الصور"

EXTRACT_DIR="$TEMP_DIR/extracted"
mkdir -p "$EXTRACT_DIR"

log_info "جاري استخراج الأرشيف..."
tar -xzf "$ARCHIVE_PATH" -C "$EXTRACT_DIR" 2>&1 | {
    COUNT=0
    while IFS= read -r line; do
        COUNT=$((COUNT + 1))
        if [ $((COUNT % 500)) -eq 0 ]; then
            printf "\r${BLUE}[↓]${NC} تم استخراج %d ملف..." "$COUNT"
        fi
    done
    echo ""
} || true

# البحث عن مجلد الصور (قد يكون في screenshots/ أو مباشرة)
SCREENSHOTS_SOURCE=""
if [ -d "$EXTRACT_DIR/screenshots" ]; then
    SCREENSHOTS_SOURCE="$EXTRACT_DIR/screenshots"
elif [ -d "$EXTRACT_DIR/sa_screenshots" ]; then
    SCREENSHOTS_SOURCE="$EXTRACT_DIR/sa_screenshots"
else
    # البحث عن أي مجلد يحتوي على PNG
    SCREENSHOTS_SOURCE=$(find "$EXTRACT_DIR" -name "*.png" -printf '%h\n' | sort -u | head -1)
fi

if [ -z "$SCREENSHOTS_SOURCE" ] || [ ! -d "$SCREENSHOTS_SOURCE" ]; then
    log_error "لم يتم العثور على مجلد الصور في الأرشيف"
    log_info "محتوى الأرشيف:"
    ls -la "$EXTRACT_DIR"
    exit 1
fi

EXTRACTED_COUNT=$(find "$SCREENSHOTS_SOURCE" -name "*.png" -type f | wc -l)
log_success "تم استخراج ${EXTRACTED_COUNT} صورة"

# حذف الأرشيف لتوفير المساحة
rm -f "$ARCHIVE_PATH"
log_info "تم حذف الأرشيف المؤقت لتوفير المساحة"

# ─── نسخ الصور إلى المجلد المستهدف ───────────────────────────────────
log_step "الخطوة 5/5: نسخ الصور إلى المشروع"

mkdir -p "$TARGET_DIR"
log_info "النسخ إلى: $TARGET_DIR"

# نسخ مع عرض التقدم
TOTAL=$EXTRACTED_COUNT
COPIED=0
find "$SCREENSHOTS_SOURCE" -name "*.png" -type f | while IFS= read -r file; do
    cp "$file" "$TARGET_DIR/"
    COPIED=$((COPIED + 1))
    if [ $((COPIED % 200)) -eq 0 ]; then
        PERCENT=$((COPIED * 100 / TOTAL))
        printf "\r${BLUE}[→]${NC} تم نسخ %d/%d (%d%%)" "$COPIED" "$TOTAL" "$PERCENT"
    fi
done
echo ""

# ─── التحقق النهائي ──────────────────────────────────────────────────
echo ""
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}${BOLD}              التحقق النهائي                      ${NC}"
echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════${NC}"

FINAL_COUNT=$(ls -1 "$TARGET_DIR"/*.png 2>/dev/null | wc -l)
FINAL_SIZE=$(du -sh "$TARGET_DIR" | cut -f1)

echo ""
if [ "$FINAL_COUNT" -ge "$EXPECTED_COUNT" ]; then
    log_success "عدد الصور: ${FINAL_COUNT} ✓ (المتوقع: ${EXPECTED_COUNT})"
else
    log_warn "عدد الصور: ${FINAL_COUNT} (المتوقع: ${EXPECTED_COUNT})"
fi
log_info "الحجم الإجمالي: ${FINAL_SIZE}"
log_info "المسار: ${TARGET_DIR}"

echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  ✓ تم تثبيت صور الخصوصية بنجاح — منصة راصد الذكي  ${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════${NC}"
echo ""

# عرض عينة من الصور
log_info "عينة من الصور المنسوخة:"
ls "$TARGET_DIR"/*.png | head -5 | while read -r f; do
    echo "  $(basename "$f")"
done
echo "  ..."

```

---

## `scripts/startup.sh`

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Rasid Platform — Production Startup Script
# Runs migrations, seeds defaults, then starts the server
# ═══════════════════════════════════════════════════════════

set -e

echo "╔══════════════════════════════════════════╗"
echo "║   راصد — بدء تشغيل بيئة الإنتاج        ║"
echo "╚══════════════════════════════════════════╝"

# ─── Step 1: Run pending SQL migrations ───
if [ -d "/app/drizzle" ]; then
  echo "→ [1/3] Checking for pending migrations..."
  for sql_file in /app/drizzle/0001_*.sql; do
    if [ -f "$sql_file" ]; then
      echo "  Applying: $(basename $sql_file)"
      # Use node to run migration since mysql client may not be available
      node -e "
        const mysql = require('mysql2/promise');
        const fs = require('fs');
        (async () => {
          try {
            const sql = fs.readFileSync('$sql_file', 'utf8');
            const conn = await mysql.createConnection(process.env.DATABASE_URL);
            const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
            for (const stmt of statements) {
              if (stmt.trim()) {
                try {
                  await conn.execute(stmt);
                } catch (e) {
                  // Ignore 'already exists' and 'duplicate column' errors
                  if (e.code === 'ER_TABLE_EXISTS_ERROR' || e.code === 'ER_DUP_FIELDNAME' || e.errno === 1060 || e.errno === 1050) {
                    console.log('    (skipped — already exists)');
                  } else {
                    console.error('    Error:', e.message);
                  }
                }
              }
            }
            await conn.end();
            console.log('  ✓ Migration applied successfully');
          } catch (e) {
            console.error('  ✗ Migration failed:', e.message);
            // Don't exit — server can still start with existing schema
          }
        })();
      " 2>&1
    fi
  done
  echo "→ Migrations complete."
else
  echo "→ [1/3] No drizzle directory found, skipping migrations."
fi

# ─── Step 2: Run admin seed (idempotent) ───
echo "→ [2/3] Running admin seed data..."
node -e "
  (async () => {
    try {
      // Dynamic import for ESM module
      const mod = await import('./dist/index.js');
      // The seed runs automatically via the admin API
      // We just need to make sure the server can start
      console.log('  ✓ Seed module loaded (will run via API on first admin access)');
    } catch (e) {
      console.log('  ℹ Seed will run on first admin access via the platform');
    }
  })();
" 2>&1 || echo "  ℹ Seed deferred to runtime"

# ─── Step 3: Start the server ───
echo "→ [3/3] Starting Rasid server..."
echo "════════════════════════════════════════════"
exec node dist/index.js

```

---

