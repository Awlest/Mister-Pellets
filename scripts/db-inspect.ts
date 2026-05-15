/**
 * Introspection lecture seule de la base prod — diagnostic migration variantes.
 * N'écrit RIEN. Exécution : ./node_modules/.bin/tsx scripts/db-inspect.ts
 */
import fs from "fs";
import path from "path";

function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const pool = (payload.db as unknown as { pool: { query: (q: string) => Promise<{ rows: Array<Record<string, unknown>> }> }; }).pool;

  const cols = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name='products' AND table_schema='public' ORDER BY ordinal_position`,
  );
  console.log("=== products columns ===");
  console.log(cols.rows.map((r) => r.column_name).join(", "));

  const tables = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema='public' ORDER BY table_name`,
  );
  console.log("\n=== all tables ===");
  console.log(tables.rows.map((r) => r.table_name).join(", "));

  const migs = await pool.query(`SELECT name, batch FROM payload_migrations ORDER BY id`);
  console.log("\n=== payload_migrations (applied) ===");
  for (const m of migs.rows) console.log(`  [batch ${m.batch}] ${m.name}`);

  const focusTables = [
    "variant_option_types",
    "variant_option_values",
    "products_variant_options",
    "products_variants",
    "products_rels",
  ];
  for (const tbl of focusTables) {
    const c = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default, udt_name
       FROM information_schema.columns
       WHERE table_name='${tbl}' AND table_schema='public' ORDER BY ordinal_position`,
    );
    console.log(`\n=== ${tbl} columns ===`);
    for (const r of c.rows) {
      console.log(
        `  ${r.column_name} | ${r.udt_name} | nullable=${r.is_nullable} | default=${r.column_default ?? "-"}`,
      );
    }
    const fk = await pool.query(
      `SELECT conname, pg_get_constraintdef(oid) AS def
       FROM pg_constraint
       WHERE conrelid = '"public"."${tbl}"'::regclass ORDER BY conname`,
    );
    console.log(`  -- constraints:`);
    for (const r of fk.rows) console.log(`     ${r.conname}: ${r.def}`);
    const idx = await pool.query(
      `SELECT indexname, indexdef FROM pg_indexes
       WHERE schemaname='public' AND tablename='${tbl}' ORDER BY indexname`,
    );
    console.log(`  -- indexes:`);
    for (const r of idx.rows) console.log(`     ${r.indexdef}`);
  }

  const enums = await pool.query(
    `SELECT t.typname, string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS labels
     FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid
     WHERE t.typname LIKE '%variant%' OR t.typname LIKE '%display_mode%'
     GROUP BY t.typname`,
  );
  console.log(`\n=== variant-related enums ===`);
  for (const r of enums.rows) console.log(`  ${r.typname}: ${r.labels}`);

  process.exit(0);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
