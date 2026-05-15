/**
 * Seed des produits Girolami — brief marques §D.
 *
 * Encode les 6 modèles du tableau éditorial Girolami dans la collection
 * Payload `products`. Les prix ne sont pas fournis par le brief : les fiches
 * sont créées « sur devis » (sans priceHT/priceTTC) et `hiddenFromBoutique`
 * est coché — elles n'apparaissent donc PAS dans le listing public tant que
 * l'équipe Awlest n'a pas ajouté les prix et les photos via l'admin, puis
 * décoché « Masquer de la boutique ». Leur page /produit/{slug} fonctionne
 * déjà pour relecture.
 *
 * IDEMPOTENT : skip si le slug existe déjà.
 *
 * Exécution : ./node_modules/.bin/tsx scripts/seed-girolami-products.ts
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

interface GirolamiSeed {
  slug: string;
  sku: string;
  model: string;
  productType: "standard" | "canalisable" | "hydro";
  power: number;
  shortDescription: string;
  isCanalizable?: boolean;
  isHydro?: boolean;
  isConnected?: boolean;
}

/** Les 6 modèles Girolami du brief §D.2 (puissance = borne basse de la plage). */
const GIROLAMI_PRODUCTS: GirolamiSeed[] = [
  {
    slug: "girolami-soft",
    sku: "GIR-SOFT",
    model: "Soft",
    productType: "hydro",
    power: 14,
    isHydro: true,
    shortDescription:
      "Hybride bois-pellet hydro, 14 à 26 kW. Best-seller Girolami, Good Design Award 2022, idéal en remplacement de chaudière.",
  },
  {
    slug: "girolami-vert",
    sku: "GIR-VERT",
    model: "Vert",
    productType: "canalisable",
    power: 9,
    isCanalizable: true,
    shortDescription:
      "Hybride bois-pellet canalisable, 9 à 15 kW. Pour une maison ouverte qui veut canaliser deux pièces.",
  },
  {
    slug: "girolami-flow",
    sku: "GIR-FLOW",
    model: "Flow",
    productType: "standard",
    power: 9,
    isConnected: true,
    shortDescription:
      "Poêle à pellets au design moderne et lignes droites, 9 à 15 kW. Wi-Fi de série, pour un intérieur contemporain.",
  },
  {
    slug: "girolami-curvy",
    sku: "GIR-CURVY",
    model: "Curvy",
    productType: "standard",
    power: 9,
    isConnected: true,
    shortDescription:
      "Poêle à pellets habillé de maïolique galbée, 9 à 14 kW. Wi-Fi de série, pour un intérieur classique ou bohème.",
  },
  {
    slug: "girolami-split",
    sku: "GIR-SPLIT",
    model: "Split",
    productType: "standard",
    power: 9,
    shortDescription:
      "Poêle à pellets à chambre céramique haut rendement, jusqu'à 94,1 %. Plusieurs puissances disponibles.",
  },
  {
    slug: "girolami-biotec",
    sku: "GIR-BIOTEC",
    model: "Biotec",
    productType: "hydro",
    power: 26,
    isHydro: true,
    shortDescription:
      "Chaudière à pellets ou hybride, 26 à 34 kW. Pour les grandes maisons, eau chaude sanitaire et remplacement de chaudière fioul.",
  },
];

async function main(): Promise<void> {
  loadEnv();

  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  let created = 0;
  let skipped = 0;
  let errored = 0;

  for (const p of GIROLAMI_PRODUCTS) {
    try {
      const existing = await payload.find({
        collection: "products",
        where: { slug: { equals: p.slug } },
        limit: 1,
      });
      if (existing.docs.length > 0) {
        console.log(`[seed-girolami]   ⏭  ${p.slug} existe déjà, skip`);
        skipped++;
        continue;
      }

      await payload.create({
        collection: "products",
        data: {
          sku: p.sku,
          slug: p.slug,
          name: `Girolami ${p.model}`,
          brand: "Girolami",
          model: p.model,
          productType: p.productType,
          diffusion: "ventilation-forcee",
          color: "dark",
          power: p.power,
          isCanalizable: Boolean(p.isCanalizable),
          isHydro: Boolean(p.isHydro),
          isConnected: Boolean(p.isConnected),
          shortDescription: p.shortDescription,
          stockStatus: "on_order",
          deliveryDelay: "4-6 sem.",
          // Masqué tant que prix + photos ne sont pas ajoutés via l'admin.
          hiddenFromBoutique: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      });
      console.log(`[seed-girolami]   ✓ ${p.slug} créé`);
      created++;
    } catch (err) {
      console.error(
        `[seed-girolami]   ✗ ${p.slug} :`,
        err instanceof Error ? err.message : err,
      );
      errored++;
    }
  }

  console.log(
    `\n[seed-girolami] Terminé : ${created} créés, ${skipped} skip, ${errored} erreurs.`,
  );
  process.exit(errored > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[seed-girolami] Fatal :", err);
  process.exit(1);
});
