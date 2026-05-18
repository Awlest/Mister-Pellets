/**
 * Lecture seule — état des produits EK63 pour le brief d'import des variantes.
 * N'écrit RIEN. Exécution : ./node_modules/.bin/tsx scripts/inspect-ek63-variants.ts
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

type Row = Record<string, unknown>;

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const pool = (
    payload.db as unknown as {
      pool: { query: (q: string) => Promise<{ rows: Row[] }> };
    }
  ).pool;

  const products = await pool.query(
    `SELECT id, slug, name, model, brand, has_variants
     FROM products WHERE brand = 'EK63' ORDER BY slug`,
  );
  console.log(`=== Produits marque EK63 (${products.rows.length}) ===`);
  for (const p of products.rows) {
    const variantCount = await pool.query(
      `SELECT count(*)::int AS n FROM products_variants WHERE _parent_id = ${Number(p.id)}`,
    );
    console.log(
      `  id=${p.id} | ${p.slug} | "${p.name}" | model="${p.model}" | has_variants=${p.has_variants} | variants=${variantCount.rows[0]?.n ?? 0}`,
    );
  }

  // Colonnes réelles de products_variants
  const cols = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name='products_variants' AND table_schema='public'
     ORDER BY ordinal_position`,
  );
  console.log(
    `\n=== products_variants colonnes ===\n  ${cols.rows.map((r) => r.column_name).join(", ")}`,
  );

  // Variantes existantes des produits hasVariants=true
  for (const p of products.rows.filter((x) => x.has_variants === true)) {
    console.log(`\n=== Variantes existantes : ${p.slug} (id=${p.id}) ===`);
    const v = await pool.query(
      `SELECT * FROM products_variants WHERE _parent_id = ${Number(p.id)} ORDER BY _order`,
    );
    for (const row of v.rows) {
      console.log("  " + JSON.stringify(row));
      const rels = await pool.query(
        `SELECT pr.path, pr."order", vov.id AS vov_id, vov.label, vov.slug,
                vot.label AS type_label
         FROM products_rels pr
         JOIN variant_option_values vov ON vov.id = pr.variant_option_values_id
         JOIN variant_option_types vot ON vot.id = vov.option_type_id
         WHERE pr.parent_id = ${Number(p.id)} AND pr.path LIKE 'variants.%'
         ORDER BY pr."order"`,
      );
      if (rels.rows.length) {
        for (const r of rels.rows) {
          console.log(
            `      rel: ${r.path} → [${r.type_label}] ${r.label} (vov_id=${r.vov_id}, slug=${r.slug})`,
          );
        }
      }
    }
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
