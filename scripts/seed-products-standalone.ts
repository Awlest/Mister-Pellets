/**
 * Seed standalone — exécute via tsx :
 *   pnpm tsx -r dotenv/config scripts/seed-products-standalone.ts dotenv_config_path=.env.local
 *
 * Importe les 10 produits du fichier statique lib/products-demo.ts vers la
 * collection Payload `products` de la DB pointée par DATABASE_URI.
 *
 * Idempotent : skip si déjà existant (lookup par slug).
 */

import { getPayload } from "payload";
import config from "../payload.config";
import { PRODUCTS_DEMO, type ProductDemo } from "../lib/products-demo";

function mapDemoToPayload(p: ProductDemo) {
  const surfaceMatch = p.surface?.match(/(\d+)\s*-\s*(\d+)/);
  const surfaceMin = surfaceMatch ? Number(surfaceMatch[1]) : undefined;
  const surfaceMax = surfaceMatch ? Number(surfaceMatch[2]) : undefined;

  if (typeof p.priceTTC !== "number") {
    throw new Error(`[seed] ${p.slug} sans priceTTC`);
  }
  const priceHT = Math.round((p.priceTTC / 1.21) * 100) / 100;

  const model = p.name.replace(new RegExp(`^${p.brand}\\s+`, "i"), "").trim();
  const sku = p.slug.toUpperCase().replace(/-/g, "_");

  return {
    sku,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    model,
    productType: p.type,
    diffusion: p.diffusion,
    color: p.color,
    priceHT,
    priceTTC: p.priceTTC,
    power: p.powerKw,
    surfaceMin,
    surfaceMax,
    isAirtight: p.isAirtight,
    isConnected: p.isConnected,
    isCanalizable: p.type === "canalisable",
    isHydro: p.type === "hydro",
    isBestseller: Boolean((p as ProductDemo & { isBestseller?: boolean }).isBestseller),
    isNew: Boolean((p as ProductDemo & { isNew?: boolean }).isNew),
    stockStatus: "in_stock" as const,
    deliveryDelay: "48-72h",
  };
}

async function main() {
  console.log(`[seed] Démarrage import de ${PRODUCTS_DEMO.length} produits...`);
  console.log(`[seed] DATABASE_URI host : ${process.env.DATABASE_URI?.split("@")[1]?.split("/")[0] ?? "?"}`);

  const payload = await getPayload({ config });

  let created = 0;
  let skipped = 0;
  let errored = 0;

  for (const product of PRODUCTS_DEMO) {
    try {
      const existing = await payload.find({
        collection: "products",
        where: { slug: { equals: product.slug } },
        limit: 1,
      });

      if (existing.docs.length > 0) {
        console.log(`[seed]   ⏭  ${product.slug} — existe déjà, skip`);
        skipped++;
        continue;
      }

      const data = mapDemoToPayload(product);
      await payload.create({
        collection: "products",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: data as any,
      });

      console.log(`[seed]   ✓ ${product.slug} créé`);
      created++;
    } catch (err) {
      console.error(`[seed]   ✗ ${product.slug} :`, err instanceof Error ? err.message : err);
      errored++;
    }
  }

  console.log(`\n[seed] Terminé : ${created} créés, ${skipped} skip, ${errored} erreurs.`);
  process.exit(errored > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[seed] Fatal :", err);
  process.exit(1);
});
