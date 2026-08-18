require('dotenv').config();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Client } = require('pg');

async function main() {
  const tmpSql = path.join(os.tmpdir(), `prisma-diff-${Date.now()}.sql`);
  execSync(`npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > ${JSON.stringify(tmpSql)}`, { stdio: 'pipe' });
  const sql = fs.readFileSync(tmpSql, 'utf8');
  fs.unlinkSync(tmpSql);
  if (!sql.trim()) {
    console.log('Схема пуста или совпадает — применять нечего.');
    return;
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
  await client.connect();
  await client.query('BEGIN');
  try {
    await client.query(sql);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  }
  const r = await client.query("select table_name from information_schema.tables where table_schema='public' order by table_name");
  console.log('Готово. Таблицы:', r.rows.map(x => x.table_name).join(', ') || '(нет)');
  await client.end();
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
