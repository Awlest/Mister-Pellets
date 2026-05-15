/**
 * Réconciliation du journal payload_migrations — one-shot.
 *
 * Retire la ligne parasite « dev » (batch -1) laissée par le mécanisme
 * dev-push de Payload le 2026-05-15. Après ça, `payload migrate` peut
 * enregistrer proprement la migration 20260515_180000_products_variants.
 *
 * N'agit QUE sur la table de bookkeeping payload_migrations — aucune donnée
 * métier touchée. Idempotent (WHERE name='dev').
 *
 * Exécution : ./node_modules/.bin/tsx scripts/reconcile-migrations.ts
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
  const pool = (
    payload.db as unknown as {
      pool: { query: (q: string) => Promise<{ rows: unknown[]; rowCount: number | null }> };
    }
  ).pool;

  const before = await pool.query(`SELECT name, batch FROM payload_migrations ORDER BY id`);
  console.log("[reconcile] Avant :");
  for (const r of before.rows as Array<{ name: string; batch: number }>) {
    console.log(`  [batch ${r.batch}] ${r.name}`);
  }

  const del = await pool.query(`DELETE FROM payload_migrations WHERE name = 'dev'`);
  console.log(`[reconcile] Lignes 'dev' supprimées : ${del.rowCount ?? 0}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("[reconcile] Fatal :", err);
  process.exit(1);
});
