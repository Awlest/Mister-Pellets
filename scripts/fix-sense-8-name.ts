/**
 * Edilkamin Sense 8 (id 291) — corrige le nom « Edilkamin Sense 6 » (copié de
 * la fiche Sense 6 à la création) en « Edilkamin Sense 8 », et la référence de
 * sa variante « EDK-SENSE-6-TOP-ACIER-NOIR » (affichée au visiteur) en
 * « EDK-SENSE-8-TOP-ACIER-NOIR ». Rien d'autre n'est touché : prix, photo et
 * alt de l'image restent à ajuster par l'équipe dans l'admin.
 *
 * Usage :
 *   ./node_modules/.bin/tsx scripts/fix-sense-8-name.ts            # DRY-RUN
 *   ./node_modules/.bin/tsx scripts/fix-sense-8-name.ts --apply    # écrit en base
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "imports/edilkamin-variants-mai2026");
const APPLY = process.argv.includes("--apply");
const SLUG = "edilkamin-sense-8";
const WRONG_NAME = "Edilkamin Sense 6";
const RIGHT_NAME = "Edilkamin Sense 8";
const WRONG_SKU = "EDK-SENSE-6-TOP-ACIER-NOIR";
const RIGHT_SKU = "EDK-SENSE-8-TOP-ACIER-NOIR";

function loadEnv(): void {
  const envPath = path.resolve(ROOT, ".env.local");
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
  console.log(`[sense8] ${APPLY ? "ÉCRITURE EN BASE" : "DRY-RUN (n'écrit rien)"}`);
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const f = await payload.find({ collection: "products", where: { slug: { equals: SLUG } }, depth: 0, limit: 1 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = f.docs[0] as any;
  if (!doc) throw new Error(`${SLUG} introuvable`);
  if (doc.brand !== "Edilkamin") throw new Error(`${SLUG} : brand=${doc.brand}, abandon`);
  console.log(`[sense8] id ${doc.id} | name="${doc.name}" | model="${doc.model}" | sku=${doc.sku} | visible=${!doc.hiddenFromBoutique}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: any[] = Array.isArray(doc.variants) ? doc.variants : [];
  console.log(`[sense8] variantes : ${variants.map((v) => v.sku).join(", ") || "(aucune)"}`);

  const changes: Record<string, unknown> = {};
  if (doc.name === WRONG_NAME) changes.name = RIGHT_NAME;
  else if (doc.name === RIGHT_NAME) console.log(`[sense8] nom déjà correct`);
  else throw new Error(`nom inattendu "${doc.name}" — je ne touche à rien`);

  if (variants.some((v) => v.sku === WRONG_SKU)) {
    const dup = await payload.find({ collection: "products", where: { "variants.sku": { equals: RIGHT_SKU } }, depth: 0, limit: 1 });
    if (dup.docs.length > 0) throw new Error(`${RIGHT_SKU} déjà utilisé par ${dup.docs[0]!.slug}`);
    changes.variants = variants.map((v) => (v.sku === WRONG_SKU ? { ...v, sku: RIGHT_SKU } : v));
  }

  if (Object.keys(changes).length === 0) { console.log(`[sense8] rien à corriger.`); process.exit(0); }
  console.log(`[sense8] changements : name → "${changes.name ?? doc.name}"${changes.variants ? ` ; variante ${WRONG_SKU} → ${RIGHT_SKU}` : ""}`);
  if (!APPLY) { console.log(`[sense8] DRY-RUN terminé. Relancer avec --apply.`); process.exit(0); }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snap = path.join(OUT_DIR, `_snapshot-sense8-${stamp}.json`);
  fs.writeFileSync(snap, JSON.stringify(doc, null, 2));
  console.log(`[sense8] Snapshot → ${path.relative(ROOT, snap)}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await payload.update({ collection: "products", id: Number(doc.id), data: changes as any });

  const after = await payload.find({ collection: "products", where: { slug: { equals: SLUG } }, depth: 0, limit: 1 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = after.docs[0] as any;
  const ok = d.name === RIGHT_NAME && !(d.variants ?? []).some((v: { sku: string }) => v.sku === WRONG_SKU)
    && d.model === doc.model && d.sku === doc.sku && d.priceTTC === doc.priceTTC && d.mainImage === doc.mainImage
    && d.hiddenFromBoutique === doc.hiddenFromBoutique;
  console.log(`[sense8] relecture : name="${d.name}" | variantes ${(d.variants ?? []).map((v: { sku: string }) => v.sku).join(", ")} | prix ${d.priceTTC} € | photo ${d.mainImage ?? "aucune"} | visible=${!d.hiddenFromBoutique} → ${ok ? "OK" : "ANOMALIE"}`);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => { console.error("[sense8] Fatal:", e); process.exit(1); });
