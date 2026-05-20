/**
 * Lecture seule — comparaison champ par champ entre un produit Edilkamin
 * et un produit EK63 (référence du style attendu).
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
  const slugs = process.argv.slice(2);
  if (slugs.length === 0) {
    console.error("Usage: tsx compare-brand-fields.ts <slug1> <slug2> ...");
    process.exit(1);
  }
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  for (const slug of slugs) {
    const f = await payload.find({ collection: "products", where: { slug: { equals: slug } }, depth: 2, limit: 1 });
    const p = f.docs[0] as unknown as Record<string, unknown> | undefined;
    if (!p) { console.log(`${slug}: INTROUVABLE`); continue; }
    console.log(`\n=== ${slug} (${p.brand}) ===`);
    const fields = [
      "name", "model", "productType", "diffusion", "color",
      "sku", "gtin", "mpn", "googleProductCategory",
      "priceHT", "priceTTC", "promoPrice", "installationPrice",
      "power", "heatedVolumeM3", "efficiency", "energyClass", "emissions",
      "hopperCapacity", "weight",
      "isAirtight", "isCanalizable", "isHydro", "isConnected",
      "isBestseller", "isFeatured", "isNew",
      "shortDescription", "metaTitle", "metaDescription",
      "stockStatus", "stock", "deliveryDelay",
      "hiddenFromBoutique",
    ];
    for (const k of fields) {
      const v = p[k];
      const summary = v == null ? "NULL"
        : typeof v === "string" ? (v.length > 60 ? `"${v.slice(0,57)}..." (${v.length}ch)` : `"${v}"`)
        : typeof v === "object" ? "[obj]"
        : String(v);
      console.log(`  ${k.padEnd(24)} ${summary}`);
    }
    console.log("  --- arrays ---");
    const dims = p.dimensions as Record<string, unknown> | null | undefined;
    console.log(`  dimensions: ${dims ? `w=${dims.width} h=${dims.height} d=${dims.depth}` : "NULL"}`);
    console.log(`  description (richText): ${p.description ? "présent" : "NULL"}`);
    console.log(`  mainImage:    ${p.mainImage ? "présent" : "NULL"}`);
    console.log(`  technicalSheet: ${p.technicalSheet ? "présent" : "NULL"}`);
    console.log(`  features: ${(p.features as unknown[] | undefined)?.length ?? 0}`);
    console.log(`  galleryImages: ${(p.galleryImages as unknown[] | undefined)?.length ?? 0}`);
    console.log(`  colorVariants: ${(p.colorVariants as unknown[] | undefined)?.length ?? 0}`);
    const variants = p.variants as Array<Record<string, unknown>> | undefined;
    console.log(`  variants: ${variants?.length ?? 0}`);
    if (variants && variants[0]) {
      const v0 = variants[0];
      console.log(`  variants[0]: sku=${v0.sku} gtin=${v0.gtin ?? "NULL"} mpn=${v0.mpn ?? "NULL"} price=${v0.price} stock=${v0.stockStatus}`);
    }
  }
  process.exit(0);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
