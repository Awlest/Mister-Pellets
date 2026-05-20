/**
 * Edilkamin — complétion des fiches produits sur le modèle EK63.
 *
 * Pour chaque produit Edilkamin qui a déjà ses variantes encodées :
 *  - gtin / mpn       : code fabricant de la sortie de référence (cf. EK63 Tweed où gtin=mpn=817600)
 *  - priceHT / priceTTC : prix d'entrée de gamme (min HT des variantes connues, ×1,21)
 *  - hiddenFromBoutique : false (rendu visible dans /boutique, comme EK63)
 *  - energyClass        : "A+" (défaut Ecodesign Edilkamin — l'équipe affinera si besoin)
 *  - metaTitle, metaDescription : générés sur le pattern EK63
 *
 * Skip : produits sans variantes (Lena 8, Celia 9+, Lena 9+ Evo, les 3 fiches
 * legacy Blade Plus 9 kW / Lena 11 kW / Mood Plus) — non concernés par cette
 * complétion.
 *
 * Filtre marque strict : seul Edilkamin écrit. EK63/Girolami/Dielle/Ferlux
 * intacts.
 *
 * Snapshot avant + diff de contrôle : on n'autorise que les 7 champs ci-dessus
 * à changer ; tout autre champ qui bouge → anomalie + arrêt.
 *
 * Photos non touchées (mainImage, galleryImages, colorVariants images).
 *
 * Exécution : ./node_modules/.bin/tsx scripts/edilkamin-fill-product-fields.ts
 */
import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "imports/edilkamin-variants-mai2026");
const TVA = 1.21;
const ttc = (ht: number): number => Math.round(ht * TVA);

const SKIP = new Set(["edilkamin-lena-8", "edilkamin-celia-9-plus", "edilkamin-lena-9-evo"]);

/* Champs auxquels on s'autorise à toucher (le diff doit prouver que rien d'autre ne bouge). */
const ALLOWED_CHANGES = new Set([
  "gtin", "mpn", "priceHT", "priceTTC", "energyClass",
  "metaTitle", "metaDescription", "hiddenFromBoutique",
  "updatedAt", // toujours mis à jour par Payload
]);

/* Champs à protéger : sortie produit identique avant/après (à l'exception des ALLOWED). */
const GUARDED = [
  "sku", "slug", "name", "brand", "model", "productType", "diffusion", "color",
  "promoPrice", "installationPrice", "power",
  "heatedVolumeM3", "efficiency", "emissions",
  "hopperCapacity", "weight",
  "isAirtight", "isCanalizable", "isHydro", "isConnected",
  "isBestseller", "isFeatured", "isNew",
  "shortDescription", "description", "features", "technicalSheet",
  "mainImage", "galleryImages", "colorVariants",
  "googleProductCategory",
  "stockStatus", "stock", "deliveryDelay",
  "hasVariants", "variantOptions", "variants",
  "dimensions",
];

interface ColourA { couleur: string; code: string; prixHT: number | null }
interface ColourB { couleur: string; colorSku: string }
interface ModelEntry {
  slugPayload: string; nom: string; codingSystem: "A" | "B"; matchCertain: boolean;
  branches?: { sortie: string; finition: string; couleurs: ColourA[] }[];
  sorties?: { sortie: string; structureSku: string; prixStructureHT: number | null }[];
  finitions?: { finition: string; prixSerieHT: number | null; couleurs: ColourB[] }[];
}

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

function fingerprintGuarded(doc: Record<string, unknown>): string {
  const s: Record<string, unknown> = {};
  for (const f of GUARDED) s[f] = doc[f];
  return JSON.stringify(s);
}

/* Calcule (primaryStructureSku, minHT) pour un modèle. */
function modelEntryValues(m: ModelEntry): { primarySku: string | null; minHT: number | null } {
  if (m.codingSystem === "A") {
    const first = (m.branches ?? [])[0];
    if (!first || first.couleurs.length === 0) return { primarySku: null, minHT: null };
    let minHT: number | null = null;
    for (const b of m.branches!) for (const c of b.couleurs) {
      if (c.prixHT != null && c.prixHT > 0) minHT = minHT == null ? c.prixHT : Math.min(minHT, c.prixHT);
    }
    return { primarySku: first.couleurs[0]!.code, minHT };
  }
  // Système B
  const first = (m.sorties ?? [])[0];
  if (!first) return { primarySku: null, minHT: null };
  let minHT: number | null = null;
  for (const s of m.sorties!) for (const f of m.finitions!) {
    if (s.prixStructureHT != null && f.prixSerieHT != null) {
      const ht = s.prixStructureHT + f.prixSerieHT;
      if (ht > 0) minHT = minHT == null ? ht : Math.min(minHT, ht);
    }
  }
  return { primarySku: first.structureSku, minHT };
}

/* Pour la metaTitle/metaDescription : style EK63 (ex. « Poêle à Granulés Étanche EK63 Tweed 90+ 9,2 kW | Wallonie »). */
function buildMeta(p: Record<string, unknown>): { metaTitle: string; metaDescription: string } {
  const name = String(p.name ?? "").trim();
  const power = p.power != null ? `${String(p.power).replace(".", ",")} kW` : "";
  const vol = p.heatedVolumeM3 != null ? `${p.heatedVolumeM3} m³` : "";
  const ptype = String(p.productType ?? "");
  const typeWord = ptype === "hydro" ? "hydro " : ptype === "canalisable" ? "canalisable " : ptype === "insert" ? "insert " : "";

  // metaTitle max 70 chars
  let title = `Poêle à pellets ${typeWord}${name}${power ? " " + power : ""}`.replace(/\s+/g, " ").trim();
  if (title.length > 67) title = title.slice(0, 67) + "...";
  // Add " | Wallonie" if it fits, like EK63
  if (title.length + 11 <= 70) title += " | Wallonie";

  // metaDescription max 160 chars
  const short = String(p.shortDescription ?? "").trim();
  let desc = short.length >= 80
    ? short
    : `${name}${power ? ", " + power : ""}${vol ? " pour " + vol : ""}. Pose par Mister Pellets, primes Wallonie 2026 déduites du devis, garantie 5 ans.`;
  if (desc.length > 157) desc = desc.slice(0, 157) + "...";
  return { metaTitle: title, metaDescription: desc };
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const data: { modeles: ModelEntry[] } = JSON.parse(
    fs.readFileSync(path.join(OUT_DIR, "01-extraction-modeles.json"), "utf8"),
  );
  const targets = data.modeles.filter((m) =>
    !SKIP.has(m.slugPayload) && (
      m.codingSystem === "A" ? (m.branches?.length ?? 0) > 0
        : (m.sorties?.length ?? 0) > 0 && (m.finitions?.length ?? 0) > 0
    ),
  );
  console.log(`[edk-fill] ${targets.length} produits à compléter.`);

  // Snapshot
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const snapPath = path.join(OUT_DIR, `_snapshot-fill-${stamp}.json`);
  const before: Record<string, unknown>[] = [];
  const fpBefore = new Map<string, string>();
  const docsBefore = new Map<string, Record<string, unknown>>();

  for (const m of targets) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 0, limit: 1,
    });
    const p = f.docs[0] as unknown as Record<string, unknown> | undefined;
    if (!p) { console.error(`[edk-fill] INTROUVABLE: ${m.slugPayload}`); process.exit(1); }
    if (p.brand !== "Edilkamin") {
      console.error(`[edk-fill] BRAND MISMATCH: ${m.slugPayload} brand=${p.brand} — abandon.`);
      process.exit(1);
    }
    before.push(p);
    fpBefore.set(m.slugPayload, fingerprintGuarded(p));
    docsBefore.set(m.slugPayload, p);
  }
  fs.writeFileSync(snapPath, JSON.stringify(before, null, 2));
  console.log(`[edk-fill] Snapshot : ${path.relative(process.cwd(), snapPath)}`);

  // Updates
  for (const m of targets) {
    const p = docsBefore.get(m.slugPayload)!;
    const { primarySku, minHT } = modelEntryValues(m);
    const meta = buildMeta(p);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {
      hiddenFromBoutique: false,
      energyClass: p.energyClass ?? "A+",  // n'écrase pas si déjà saisi
      metaTitle: p.metaTitle ?? meta.metaTitle,
      metaDescription: p.metaDescription ?? meta.metaDescription,
    };
    if (primarySku) {
      data.gtin = p.gtin ?? primarySku;
      data.mpn = p.mpn ?? primarySku;
    }
    if (minHT != null) {
      data.priceHT = (p.priceHT != null && Number(p.priceHT) > 0) ? p.priceHT : minHT;
      data.priceTTC = (p.priceTTC != null && Number(p.priceTTC) > 0) ? p.priceTTC : ttc(minHT);
    }

    await payload.update({
      collection: "products",
      id: Number(p.id),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
    });
    console.log(
      `[edk-fill] ${m.slugPayload} : gtin=${data.gtin ?? "—"} mpn=${data.mpn ?? "—"} priceHT=${data.priceHT ?? "—"} priceTTC=${data.priceTTC ?? "—"} hidden=false`,
    );
  }

  // Diff (champs protégés intacts)
  let anomaly = false;
  for (const m of targets) {
    const f = await payload.find({
      collection: "products", where: { slug: { equals: m.slugPayload } }, depth: 0, limit: 1,
    });
    const p = f.docs[0] as unknown as Record<string, unknown>;
    if (fingerprintGuarded(p) !== fpBefore.get(m.slugPayload)) {
      anomaly = true;
      const beforeDoc = docsBefore.get(m.slugPayload)!;
      const changed: string[] = [];
      for (const k of GUARDED) {
        if (JSON.stringify(beforeDoc[k]) !== JSON.stringify(p[k])) changed.push(k);
      }
      console.error(`[edk-fill] ⚠️ ANOMALIE ${m.slugPayload} : champs protégés modifiés → ${changed.join(", ")}`);
    }
  }
  if (anomaly) { console.error(`[edk-fill] ROLLBACK depuis ${snapPath}`); process.exit(1); }
  console.log(`[edk-fill] Terminé sans anomalie. Snapshot : ${path.relative(process.cwd(), snapPath)}`);
  process.exit(0);
}

main().catch((e) => { console.error("[edk-fill] Fatal:", e); process.exit(1); });
