/**
 * Diagnostic LECTURE SEULE : les dernières commandes enregistrées.
 * N'écrit rien. Sert à savoir si l'échec du checkout survient avant ou après
 * l'insertion de la commande.
 *
 * Exécution : ./node_modules/.bin/tsx scripts/diag-last-orders.ts
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

type Pool = {
  query: (q: string, params?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;
};

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const pool = (payload.db as unknown as { pool: Pool }).pool;

  const rows = await pool.query(
    `SELECT id, order_number, customer_name, customer_email, total, shipping,
            payment_status, mollie_payment_id, access_token IS NOT NULL AS a_un_jeton, created_at
       FROM orders ORDER BY id DESC LIMIT 10`,
  );
  console.log(`=== ${rows.rows.length} dernieres commandes ===`);
  for (const r of rows.rows) {
    console.log(
      `#${r.id} ${r.order_number} | ${String(r.customer_name).slice(0, 34).padEnd(34)} | ${r.total} EUR | port ${r.shipping} | ${r.payment_status} | mollie=${r.mollie_payment_id ?? "-"} | jeton=${r.a_un_jeton} | ${r.created_at}`,
    );
  }

  const count = await pool.query(`SELECT count(*)::int AS n FROM orders`);
  console.log(`\ntotal commandes en base : ${count.rows[0]?.n}`);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
