/**
 * Patch ciblé : passe isConnected = true sur les Girolami qui ont le Wi-Fi
 * (pellet / hybride / hydro-pellet), confirmé par Dorian. Le lot 100 % bois
 * (Frame, Alfa, MBS, Vision Evo, TC Evo) reste false (pas de Wi-Fi). Le TC Bio
 * Evo (hybride) est inclus. Ne modifie QUE le champ isConnected, rien d'autre.
 *
 *   tsx scripts/girolami-set-connected.ts --dry-run
 *   tsx scripts/girolami-set-connected.ts
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry-run");

function loadEnv(): void {
  const p = path.resolve(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim(); if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("="); if (eq === -1) continue;
    const k = t.slice(0, eq).trim(); let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(k in process.env)) process.env[k] = v;
  }
}

async function main(): Promise<void> {
  loadEnv();
  // Lot bois = pas de Wi-Fi, SAUF tc-bio-evo (hybride, pellet inclus).
  const bois = JSON.parse(fs.readFileSync(path.join(ROOT, "imports/girolami-catalogue-2026/01b-extraction-girolami-bois.json"), "utf8"));
  const noWifi = new Set<string>(
    bois.products.map((p: { slug: string }) => p.slug).filter((s: string) => !s.startsWith("girolami-tc-bio-evo")),
  );

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const all = await payload.find({ collection: "products", where: { brand: { equals: "Girolami" } }, depth: 0, limit: 300 });
  const docs = all.docs as any[];

  if (!DRY) {
    const snap = docs.map((p) => ({ slug: p.slug, isConnected: p.isConnected }));
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const f = path.join(ROOT, "imports/girolami-catalogue-2026", `_snapshot-connected-${stamp}.json`);
    fs.writeFileSync(f, JSON.stringify(snap, null, 2));
    console.log(`[conn] snapshot ${snap.length} états -> ${path.relative(ROOT, f)}`);
  }

  let setTrue = 0, woodLeft = 0, already = 0, errored = 0;
  for (const p of docs) {
    if (noWifi.has(p.slug)) { woodLeft++; continue; }            // bois : on ne touche pas
    if (p.isConnected === true) { already++; continue; }          // déjà connecté
    if (DRY) { setTrue++; continue; }
    try {
      await payload.update({ collection: "products", id: Number(p.id), data: { isConnected: true } as any });
      setTrue++;
    } catch (e) {
      errored++;
      console.error(`[conn] ✗ ${p.slug}:`, e instanceof Error ? e.message : e);
    }
  }
  console.log(`[conn] ${DRY ? "(dry) " : ""}Wi-Fi -> connecté : ${setTrue} | déjà true : ${already} | bois laissés false : ${woodLeft} | erreurs : ${errored} | total Girolami : ${docs.length}`);
  process.exit(errored > 0 ? 1 : 0);
}

main().catch((e) => { console.error("[conn] Fatal:", e); process.exit(1); });
