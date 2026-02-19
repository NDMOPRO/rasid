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
