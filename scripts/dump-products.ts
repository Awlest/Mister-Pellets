/**
 * Lecture seule — dump JSON complet (depth 2) d'un ou plusieurs produits par slug.
 * N'écrit RIEN en base. Exécution :
 *   ./node_modules/.bin/tsx scripts/dump-products.ts <slug> [slug...] [--out fichier.json]
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
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  const out = outIdx !== -1 ? args[outIdx + 1] : null;
  const slugs = args.filter((a, i) => a !== "--out" && i !== outIdx + 1);
  if (slugs.length === 0) { console.error("usage: dump-products.ts <slug> [slug...] [--out f.json]"); process.exit(1); }
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });
  const docs: unknown[] = [];
  for (const slug of slugs) {
    const f = await payload.find({ collection: "products", where: { slug: { equals: slug } }, depth: 2, limit: 1 });
    if (f.docs.length === 0) { console.error(`introuvable: ${slug}`); continue; }
    docs.push(f.docs[0]);
  }
  const json = JSON.stringify(docs, null, 2);
  if (out) { fs.writeFileSync(out, json); console.log(`${docs.length} produit(s) → ${out}`); }
  else console.log(json);
  process.exit(0);
}
main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
