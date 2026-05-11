/**
 * Seed EK63 — import du catalogue distributeur BM Energies (nov 2025).
 *
 * Lance via :
 *   pnpm tsx --env-file=.env.local scripts/seed-ek63-catalog.ts
 *
 * Comportement :
 * - Pour chaque produit dans EK63_PRODUCTS :
 *   · Si un produit avec le même slug existe déjà → UPDATE avec les nouvelles
 *     données (les EK63 déjà en DB depuis le seed initial seront corrigés)
 *   · Sinon → CREATE
 * - Idempotent : safe à relancer.
 * - Ne touche pas aux produits non-EK63 (filtre via slug startsWith "ek63-")
 *
 * priceHT et priceTTC sont laissés à 0 — l'équipe Awlest les complétera
 * après validation. Le composant page produit affiche "Sur devis" quand
 * priceTTC est 0 ou undefined.
 */

import { getPayload } from "payload";
import config from "../payload.config";
import { EK63_PRODUCTS, type SeedProduct } from "./ek63-products";

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
  console.log(`\n[seed-ek63] Démarrage import de ${EK63_PRODUCTS.length} produits EK63...`);
  console.log(`[seed-ek63] DB host : ${process.env.DATABASE_URI?.split("@")[1]?.split("/")[0] ?? "?"}\n`);

  const payload = await getPayload({ config });

  let created = 0;
  let updated = 0;
  let errored = 0;

  for (const product of EK63_PRODUCTS) {
    try {
      // Lookup par slug
      const existing = await payload.find({
        collection: "products",
        where: { slug: { equals: product.slug } },
        limit: 1,
      });

      const data = buildPayloadData(product);

      if (existing.docs.length > 0) {
        // Update existant — préserve l'ID, refresh tous les autres champs
        const existingDoc = existing.docs[0];
        if (!existingDoc) {
          console.error(`[seed-ek63]   ✗ ${product.slug} : doc found mais sans contenu, skip`);
          errored++;
          continue;
        }
        await payload.update({
          collection: "products",
          id: existingDoc.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: data as any,
        });
        console.log(`[seed-ek63]   ↻ ${product.slug} (${product.name}) — mis à jour`);
        updated++;
      } else {
        await payload.create({
          collection: "products",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: data as any,
        });
        console.log(`[seed-ek63]   ✓ ${product.slug} (${product.name}) — créé`);
        created++;
      }
    } catch (err) {
      console.error(
        `[seed-ek63]   ✗ ${product.slug} :`,
        err instanceof Error ? err.message : err,
      );
      errored++;
    }
  }

  console.log(
    `\n[seed-ek63] Terminé : ${created} créés, ${updated} mis à jour, ${errored} erreurs.`,
  );
  process.exit(errored > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[seed-ek63] Fatal :", err);
  process.exit(1);
});
