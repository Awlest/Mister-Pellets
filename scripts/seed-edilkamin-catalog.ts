/**
 * Seed Edilkamin — import du catalogue distributeur (nov 2025).
 *
 * Lance via :
 *   pnpm tsx --env-file=.env.local scripts/seed-edilkamin-catalog.ts
 *
 * Idempotent : update si slug existe, sinon create.
 */

import { getPayload } from "payload";
import config from "../payload.config";
import type { SeedProduct } from "./ek63-products";
import { EDILKAMIN_PRODUCTS } from "./edilkamin-products";

function buildPayloadData(p: SeedProduct) {
  return {
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    model: p.model,
    productType: p.productType,
    diffusion: p.diffusion,
    color: p.color,
    priceHT: 0,
    priceTTC: 0,
    power: p.power,
    heatedVolumeM3: p.heatedVolumeM3,
    efficiency: p.efficiency,
    hopperCapacity: p.hopperCapacity,
    isAirtight: p.isAirtight,
    isConnected: p.isConnected,
    isCanalizable: p.isCanalizable,
    isHydro: p.isHydro,
    shortDescription: p.shortDescription,
    features: p.features,
    colorVariants: p.colorVariants?.map((cv) => ({
      colorName: cv.colorName,
      colorHex: cv.colorHex,
    })),
    stockStatus: p.stockStatus,
    deliveryDelay: p.deliveryDelay,
    googleProductCategory: "Home & Garden > Household Appliances > Heating > Pellet Stoves",
  };
}

async function main() {
  console.log(`\n[seed-edilkamin] Démarrage import de ${EDILKAMIN_PRODUCTS.length} produits Edilkamin...`);
  console.log(`[seed-edilkamin] DB host : ${process.env.DATABASE_URI?.split("@")[1]?.split("/")[0] ?? "?"}\n`);

  const payload = await getPayload({ config });

  let created = 0;
  let updated = 0;
  let errored = 0;

  for (const product of EDILKAMIN_PRODUCTS) {
    try {
      const existing = await payload.find({
        collection: "products",
        where: { slug: { equals: product.slug } },
        limit: 1,
      });

      const data = buildPayloadData(product);

      if (existing.docs.length > 0) {
        const existingDoc = existing.docs[0];
        if (!existingDoc) {
          console.error(`[seed-edilkamin]   ✗ ${product.slug} : doc found mais sans contenu, skip`);
          errored++;
          continue;
        }
        await payload.update({
          collection: "products",
          id: existingDoc.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: data as any,
        });
        console.log(`[seed-edilkamin]   ↻ ${product.slug} (${product.name}) — mis à jour`);
        updated++;
      } else {
        await payload.create({
          collection: "products",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: data as any,
        });
        console.log(`[seed-edilkamin]   ✓ ${product.slug} (${product.name}) — créé`);
        created++;
      }
    } catch (err) {
      console.error(
        `[seed-edilkamin]   ✗ ${product.slug} :`,
        err instanceof Error ? err.message : err,
      );
      errored++;
    }
  }

  console.log(
    `\n[seed-edilkamin] Terminé : ${created} créés, ${updated} mis à jour, ${errored} erreurs.`,
  );
  process.exit(errored > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[seed-edilkamin] Fatal :", err);
  process.exit(1);
});
