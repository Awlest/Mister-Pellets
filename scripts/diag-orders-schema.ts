/**
 * Diagnostic LECTURE SEULE du schéma de la table `orders`.
 *
 * Sert à comprendre pourquoi l'insertion d'une commande échoue en production :
 * on liste les colonnes, leur nullabilité et leur défaut, puis on tente une
 * insertion identique à celle de Payload DANS UNE TRANSACTION ANNULÉE, pour
 * obtenir le message d'erreur exact sans rien écrire.
 *
 * Exécution : ./node_modules/.bin/tsx scripts/diag-orders-schema.ts
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

  for (const table of ["orders", "orders_items"]) {
    const cols = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
         FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position`,
      [table],
    );
    console.log(`\n=== ${table} ===`);
    if (cols.rows.length === 0) {
      console.log("  TABLE ABSENTE");
      continue;
    }
    for (const c of cols.rows) {
      const nn = c.is_nullable === "NO" ? "NOT NULL" : "        ";
      const def = c.column_default ? ` def=${String(c.column_default).slice(0, 45)}` : "";
      const len = c.character_maximum_length ? `(${c.character_maximum_length})` : "";
      console.log(`  ${String(c.column_name).padEnd(26)} ${(String(c.data_type) + len).padEnd(26)} ${nn}${def}`);
    }
  }

  const enums = await pool.query(
    `SELECT t.typname, e.enumlabel
       FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid
      WHERE t.typname LIKE '%order%'
      ORDER BY t.typname, e.enumsortorder`,
  );
  console.log("\n=== enums lies aux commandes ===");
  for (const r of enums.rows) console.log(`  ${r.typname}: ${r.enumlabel}`);

  console.log("\n=== insertion a blanc (ROLLBACK) ===");
  await pool.query("BEGIN");
  try {
    await pool.query(
      `INSERT INTO "orders" ("order_number","customer_name","customer_email","customer_phone",
         "customer_address","subtotal","vat","shipping","total","payment_status",
         "fulfillment_status","access_token","updated_at","created_at")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [
        "DIAG-0000",
        "diagnostic",
        "diag@example.com",
        "",
        "rue, 5380 Fernelmont, BE",
        2629.75,
        552.25,
        0,
        3182,
        "pending",
        "new",
        "00000000-0000-0000-0000-000000000000",
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    );
    console.log("  insertion acceptee (annulee ensuite)");
  } catch (e) {
    const err = e as { message?: string; code?: string; column?: string; constraint?: string; detail?: string };
    console.log("  ERREUR POSTGRES :", err.message);
    if (err.code) console.log("  code       :", err.code);
    if (err.column) console.log("  colonne    :", err.column);
    if (err.constraint) console.log("  contrainte :", err.constraint);
    if (err.detail) console.log("  detail     :", err.detail);
  } finally {
    await pool.query("ROLLBACK");
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
