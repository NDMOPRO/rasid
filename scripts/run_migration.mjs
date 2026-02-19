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
