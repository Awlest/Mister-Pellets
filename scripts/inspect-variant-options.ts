/** Lecture seule — types et valeurs d'options de variantes. N'écrit RIEN. */
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const pool = (payload.db as unknown as { pool: { query: (q: string) => Promise<{ rows: Record<string, unknown>[] }> } }).pool;

  const types = await pool.query(`SELECT id, label, slug, display_mode, sort_order FROM variant_option_types ORDER BY sort_order`);
  console.log("=== variant_option_types ===");
  for (const t of types.rows) console.log(`  id=${t.id} | ${t.label} | slug=${t.slug} | mode=${t.display_mode} | sort=${t.sort_order}`);

  const vals = await pool.query(
    `SELECT v.id, v.label, v.slug, v.option_type_id, v.color_hex, t.label AS type_label
     FROM variant_option_values v JOIN variant_option_types t ON t.id = v.option_type_id
     ORDER BY v.option_type_id, v.id`,
  );
  console.log("\n=== variant_option_values ===");
  for (const v of vals.rows) console.log(`  id=${v.id} | [${v.type_label}] ${v.label} | slug=${v.slug} | hex=${v.color_hex ?? "-"}`);
  process.exit(0);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
