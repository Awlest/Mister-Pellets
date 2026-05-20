/**
 * Lecture seule — diagnostic complet des produits d'une marque (Edilkamin par défaut).
 * N'écrit RIEN. Exécution : ./node_modules/.bin/tsx scripts/inspect-brand.ts [marque]
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

async function main(): Promise<void> {
  loadEnv();
  const brand = process.argv[2] ?? "Edilkamin";
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const pool = (payload.db as unknown as { pool: { query: (q: string) => Promise<{ rows: Record<string, unknown>[] }> } }).pool;

  const cols = ["id", "slug", "name", "model", "has_variants", "price_h_t", "price_t_t_c",
    "power", "heated_volume_m3", "efficiency", "hopper_capacity",
    "short_description", "stock_status", "delivery_delay",
    "main_image_id", "is_airtight", "is_connected", "is_canalizable", "is_hydro"];
  const sel = cols.join(", ");
  const r = await pool.query(
    `SELECT ${sel} FROM products WHERE brand = '${brand}' ORDER BY slug`,
  );
  console.log(`=== ${brand} (${r.rows.length} produits) ===`);
  for (const p of r.rows) {
    const id = Number(p.id);
    const vCount = (await pool.query(`SELECT count(*)::int AS n FROM products_variants WHERE _parent_id = ${id}`)).rows[0]?.n ?? 0;
    const cvCount = (await pool.query(`SELECT count(*)::int AS n FROM products_color_variants WHERE _parent_id = ${id}`)).rows[0]?.n ?? 0;
    const featCount = (await pool.query(`SELECT count(*)::int AS n FROM products_features WHERE _parent_id = ${id}`)).rows[0]?.n ?? 0;
    const gallCount = (await pool.query(`SELECT count(*)::int AS n FROM products_gallery_images WHERE _parent_id = ${id}`)).rows[0]?.n ?? 0;
    const shortLen = typeof p.short_description === "string" ? p.short_description.length : 0;
    console.log(
      `  id=${id} ${p.slug} | "${p.name}" model="${p.model}" | hv=${p.has_variants} variants=${vCount} colorVariants=${cvCount} features=${featCount} gallery=${gallCount} | short=${shortLen}ch | pwr=${p.power} eff=${p.efficiency} vol=${p.heated_volume_m3} hopper=${p.hopper_capacity} | air=${p.is_airtight} conn=${p.is_connected} canal=${p.is_canalizable} hydro=${p.is_hydro} | mainImg=${p.main_image_id ?? "NULL"} | stock=${p.stock_status} delay="${p.delivery_delay}"`,
    );
  }
  process.exit(0);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
