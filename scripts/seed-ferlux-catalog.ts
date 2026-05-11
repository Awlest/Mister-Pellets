/**
 * Seed Ferlux — import du catalogue distributeur 2025 (LECOQ S.A. Belgique).
 *
 * Lance via :
 *   pnpm tsx --env-file=.env.local scripts/seed-ferlux-catalog.ts
 *
 * Idempotent : update si slug existe, sinon create. Prix HT issus de la
 * price list 06/2025, TTC calculé à TVA 21% Belgique.
 */

import { getPayload } from "payload";
import config from "../payload.config";
import type { SeedProduct } from "./ek63-products";
import { FERLUX_PRODUCTS, FERLUX_PRICES } from "./ferlux-products";

function calcTTC(priceHT: number): number {
  return Math.round(priceHT * 1.21);
}

function buildPayloadData(p: SeedProduct, priceHT: number) {
  return {
    sku: p.sku,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    model: p.model,
    productType: p.productType,
    diffusion: p.diffusion,
    color: p.color,
    priceHT,
    priceTTC: calcTTC(priceHT),
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
  console.log(`\n[seed-ferlux] Démarrage import de ${FERLUX_PRODUCTS.length} produits Ferlux...`);
  console.log(`[seed-ferlux] DB host : ${process.env.DATABASE_URI?.split("@")[1]?.split("/")[0] ?? "?"}\n`);

  const payload = await getPayload({ config });

  let created = 0;
  let updated = 0;
  let errored = 0;

  for (const product of FERLUX_PRODUCTS) {
    try {
      const existing = await payload.find({
        collection: "products",
        where: { slug: { equals: product.slug } },
        limit: 1,
      });

      const priceHT = FERLUX_PRICES[product.slug] ?? 0;
      const data = buildPayloadData(product, priceHT);

      if (existing.docs.length > 0) {
        const existingDoc = existing.docs[0];
        if (!existingDoc) {
          console.error(`[seed-ferlux]   ✗ ${product.slug} : doc found mais sans contenu, skip`);
          errored++;
          continue;
        }
        await payload.update({
          collection: "products",
          id: existingDoc.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: data as any,
        });
        console.log(`[seed-ferlux]   ↻ ${product.slug} (${product.name}) — mis à jour @ ${priceHT} € HT`);
        updated++;
      } else {
        await payload.create({
          collection: "products",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: data as any,
        });
        console.log(`[seed-ferlux]   ✓ ${product.slug} (${product.name}) — créé @ ${priceHT} € HT`);
        created++;
      }
    } catch (err) {
      console.error(
        `[seed-ferlux]   ✗ ${product.slug} :`,
        err instanceof Error ? err.message : err,
      );
      errored++;
    }
  }

  console.log(
    `\n[seed-ferlux] Terminé : ${created} créés, ${updated} mis à jour, ${errored} erreurs.`,
  );
  process.exit(errored > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[seed-ferlux] Fatal :", err);
  process.exit(1);
});
