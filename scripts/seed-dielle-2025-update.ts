/**
 * Update Dielle 2024-25 sur Supabase prod.
 *
 * Lance via :
 *   pnpm tsx --env-file=.env.local scripts/seed-dielle-2025-update.ts
 *
 * 2 actions :
 * 1. Update prix HT/TTC des 23 produits Dielle déjà importés (catalogue 2022)
 *    avec les vrais prix HT du catalogue 2024-25.
 * 2. Création de 15 nouveaux produits Dielle 2024-25 (ETHESIA, PONENTE
 *    HYBRID, BOREA, GARBIN, FBX).
 *
 * Le prix TTC est calculé automatiquement = priceHT × 1.21 (TVA 21% Belgique).
 */

import { getPayload } from "payload";
import config from "../payload.config";
import type { SeedProduct } from "./ek63-products";
import {
  DIELLE_PRICE_UPDATES,
  DIELLE_NEW_PRODUCTS,
  DIELLE_NEW_PRICES,
} from "./dielle-2025-update";

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
    surfaceMin: p.surfaceMin,
    surfaceMax: p.surfaceMax,
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
  console.log(`\n[seed-dielle-2025] Démarrage update Dielle 2024-25...`);
  console.log(`[seed-dielle-2025] DB host : ${process.env.DATABASE_URI?.split("@")[1]?.split("/")[0] ?? "?"}\n`);

  const payload = await getPayload({ config });

  let pricesUpdated = 0;
  let newCreated = 0;
  let errored = 0;

  // ============================================================================
  // 1. Update prix sur produits existants
  // ============================================================================
  console.log(`[seed-dielle-2025] === Phase 1 : Update prix (${Object.keys(DIELLE_PRICE_UPDATES).length} slugs) ===\n`);

  for (const [slug, { priceHT }] of Object.entries(DIELLE_PRICE_UPDATES)) {
    try {
      const existing = await payload.find({
        collection: "products",
        where: { slug: { equals: slug } },
        limit: 1,
      });

      if (existing.docs.length === 0) {
        console.log(`[seed-dielle-2025]   ⏭  ${slug} — pas en DB, skip`);
        continue;
      }

      const existingDoc = existing.docs[0];
      if (!existingDoc) continue;

      const priceTTC = calcTTC(priceHT);

      await payload.update({
        collection: "products",
        id: existingDoc.id,
        data: { priceHT, priceTTC },
      });

      console.log(`[seed-dielle-2025]   💰 ${slug} → ${priceHT} € HT / ${priceTTC} € TTC`);
      pricesUpdated++;
    } catch (err) {
      console.error(
        `[seed-dielle-2025]   ✗ ${slug} :`,
        err instanceof Error ? err.message : err,
      );
      errored++;
    }
  }

  // ============================================================================
  // 2. Créer les nouveaux produits 2024-25
  // ============================================================================
  console.log(`\n[seed-dielle-2025] === Phase 2 : Création nouveautés 2024-25 (${DIELLE_NEW_PRODUCTS.length} produits) ===\n`);

  for (const product of DIELLE_NEW_PRODUCTS) {
    try {
      const existing = await payload.find({
        collection: "products",
        where: { slug: { equals: product.slug } },
        limit: 1,
      });

      const priceHT = DIELLE_NEW_PRICES[product.slug] ?? 0;
      const data = buildPayloadData(product, priceHT);

      if (existing.docs.length > 0) {
        const existingDoc = existing.docs[0];
        if (!existingDoc) continue;
        await payload.update({
          collection: "products",
          id: existingDoc.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: data as any,
        });
        console.log(`[seed-dielle-2025]   ↻ ${product.slug} (${product.name}) — mis à jour @ ${priceHT} € HT`);
      } else {
        await payload.create({
          collection: "products",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: data as any,
        });
        console.log(`[seed-dielle-2025]   ✨ ${product.slug} (${product.name}) — créé @ ${priceHT} € HT`);
        newCreated++;
      }
    } catch (err) {
      console.error(
        `[seed-dielle-2025]   ✗ ${product.slug} :`,
        err instanceof Error ? err.message : err,
      );
      errored++;
    }
  }

  console.log(
    `\n[seed-dielle-2025] Terminé : ${pricesUpdated} prix mis à jour, ${newCreated} nouveaux créés, ${errored} erreurs.`,
  );
  process.exit(errored > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[seed-dielle-2025] Fatal :", err);
  process.exit(1);
});
