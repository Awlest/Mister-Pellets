/**
 * Lecture seule — état du catalogue vu par le configurateur de devis (/estimation).
 *
 * Le configurateur ne peut chiffrer un poêle que s'il a un prix (priceTTC ou
 * priceHT) et une puissance. Ce script compte ce qui est exploitable, par
 * marque et par type, et liste les produits visibles en boutique mais sans
 * prix (ils basculent en « sur devis » dans le configurateur).
 *
 * Usage : npx tsx scripts/diag-quote-catalog.ts
 * N'écrit RIEN en base.
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

interface Row {
  slug: string;
  name: string;
  brand: string;
  productType: string;
  power?: number | null;
  priceHT?: number | null;
  priceTTC?: number | null;
  installationPrice?: number | null;
  hiddenFromBoutique?: boolean | null;
  mainImage?: unknown;
}

async function main(): Promise<void> {
  loadEnv();
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  const res = await payload.find({ collection: "products", depth: 0, limit: 1000, pagination: false });
  const docs = res.docs as unknown as Row[];

  const visible = docs.filter((d) => !d.hiddenFromBoutique);
  const priced = visible.filter((d) => (d.priceTTC ?? 0) > 0 || (d.priceHT ?? 0) > 0);
  const withPower = priced.filter((d) => (d.power ?? 0) > 0);
  const withInstall = visible.filter((d) => (d.installationPrice ?? 0) > 0);

  console.log(`Produits en base ............ ${docs.length}`);
  console.log(`Visibles en boutique ........ ${visible.length}`);
  console.log(`… avec un prix .............. ${priced.length}`);
  console.log(`… avec prix ET puissance .... ${withPower.length}  (chiffrables dans le configurateur)`);
  console.log(`… avec installationPrice .... ${withInstall.length}  (pose propre au produit)`);
  console.log(`… avec priceHT .............. ${visible.filter((d) => (d.priceHT ?? 0) > 0).length}  (nécessaire pour la TVA 6 %)`);

  const by = (key: keyof Row) => {
    const m = new Map<string, { total: number; ok: number }>();
    for (const d of visible) {
      const k = String(d[key] ?? "—");
      const e = m.get(k) ?? { total: 0, ok: 0 };
      e.total += 1;
      if (((d.priceTTC ?? 0) > 0 || (d.priceHT ?? 0) > 0) && (d.power ?? 0) > 0) e.ok += 1;
      m.set(k, e);
    }
    return [...m.entries()].sort((a, b) => b[1].total - a[1].total);
  };

  console.log("\nPar marque (chiffrables / visibles) :");
  for (const [k, v] of by("brand")) console.log(`  ${k.padEnd(14)} ${v.ok}/${v.total}`);
  console.log("\nPar type (chiffrables / visibles) :");
  for (const [k, v] of by("productType")) console.log(`  ${k.padEnd(14)} ${v.ok}/${v.total}`);

  const powers = withPower.map((d) => d.power as number).sort((a, b) => a - b);
  if (powers.length) {
    console.log(
      `\nPuissances chiffrables : ${powers[0]} → ${powers[powers.length - 1]} kW ` +
        `(médiane ${powers[Math.floor(powers.length / 2)]} kW)`,
    );
  }
  const prices = withPower
    .map((d) => d.priceTTC ?? Math.round((d.priceHT as number) * 1.21))
    .sort((a, b) => a - b);
  if (prices.length) {
    console.log(
      `Prix matériel TTC ..... ${prices[0]} → ${prices[prices.length - 1]} € ` +
        `(médiane ${prices[Math.floor(prices.length / 2)]} €)`,
    );
  }

  const noPrice = visible.filter((d) => !((d.priceTTC ?? 0) > 0 || (d.priceHT ?? 0) > 0));
  if (noPrice.length) {
    console.log(`\nVisibles SANS prix (${noPrice.length}) — « sur devis » dans le configurateur :`);
    for (const d of noPrice.slice(0, 25)) console.log(`  ${d.brand} · ${d.name} (${d.slug})`);
    if (noPrice.length > 25) console.log(`  … et ${noPrice.length - 25} autres`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
