/** Lecture seule — vérification rapide de la migration des sous-champs. */
import fs from "fs";
function loadEnv() {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const t = line.trim(); if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("="); if (eq < 0) continue;
    const k = t.slice(0, eq).trim(); let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}
(async () => {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const pool = (payload.db as unknown as { pool: { query: (q: string) => Promise<{ rows: Record<string, unknown>[] }> } }).pool;

  console.log("=== Edilkamin Cherie 9 (id 45) — 2 variantes ===");
  const r1 = await pool.query("SELECT _order, sku, mpn, manufacturer_structure_sku, manufacturer_color_sku, coding_system, computed_price_h_t, price_source, tariff_source, import_batch_id FROM products_variants WHERE _parent_id=45 ORDER BY _order LIMIT 2");
  for (const r of r1.rows) console.log(JSON.stringify(r));
  console.log("\n=== EK63 Tweed (id 4) — 2 variantes (new fields doivent etre NULL) ===");
  const r2 = await pool.query("SELECT _order, sku, mpn, manufacturer_structure_sku, manufacturer_color_sku, coding_system, computed_price_h_t, tariff_source FROM products_variants WHERE _parent_id=4 ORDER BY _order LIMIT 2");
  for (const r of r2.rows) console.log(JSON.stringify(r));
  console.log("\n=== Comptage EK63 vs Edilkamin avec metadata ===");
  const cEK = await pool.query("SELECT COUNT(*) as n FROM products_variants v JOIN products p ON p.id=v._parent_id WHERE p.brand='EK63' AND v.manufacturer_structure_sku IS NOT NULL");
  const cED = await pool.query("SELECT COUNT(*) as n FROM products_variants v JOIN products p ON p.id=v._parent_id WHERE p.brand='Edilkamin' AND v.manufacturer_structure_sku IS NOT NULL");
  console.log(`EK63 variants avec manufacturer_structure_sku: ${cEK.rows[0]!.n} (doit etre 0)`);
  console.log(`Edilkamin variants avec manufacturer_structure_sku: ${cED.rows[0]!.n}`);
  process.exit(0);
})().catch((e) => { console.error("Fatal:", e); process.exit(1); });
