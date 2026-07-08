import { getAllProducts } from "@/lib/products";
import { slugify } from "@/lib/slugify";
import type {
  ProductDemo,
  ProductColorVariant,
  ProductVariantData,
  VariantOptionAxis,
} from "@/lib/products-demo";

/**
 * Feed Google Merchant — Section 5 du brief variantes.
 *
 * Expose le catalogue au format RSS 2.0 / namespace `g:` attendu par Google
 * Merchant Center. Route : /api/feed/google-merchant
 *
 * Règle variantes :
 *  - produit AVEC variantes génériques → une ligne <item> PAR combinaison ;
 *  - produit AVEC déclinaisons de couleur → une ligne <item> PAR couleur ;
 *  - produit simple → une ligne <item> unique.
 *  Les lignes d'un même produit sont regroupées via `item_group_id`.
 *
 * Ne référence que les produits visibles en boutique (getAllProducts filtre
 * déjà hiddenFromBoutique).
 */

export const revalidate = 3600; // 1 h — le catalogue bouge peu

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mister-pellets.be"
).replace(/\/$/, "");

/**
 * Catégories issues de la taxonomie officielle Google
 * (google.com/basepages/producttype/taxonomy.en-US.txt). Il n'existe PAS de
 * catégorie « Pellet Stoves » : les poêles (pellets = granulés de bois)
 * relèvent de « Wood Stoves », les inserts/foyers encastrables de
 * « Fireplaces ».
 */
const CATEGORY_STOVES = "Home & Garden > Wood Stoves";
const CATEGORY_FIREPLACES = "Home & Garden > Fireplaces";

/**
 * Ancienne valeur par défaut, hors taxonomie Google, encore stockée sur les
 * produits existants en DB (defaultValue Payload historique). On l'ignore et
 * on recalcule une catégorie valide à partir du type de produit.
 */
const LEGACY_INVALID_CATEGORY =
  "Home & Garden > Household Appliances > Heating > Pellet Stoves";

function googleCategory(p: ProductDemo): string {
  if (
    p.googleProductCategory &&
    p.googleProductCategory !== LEGACY_INVALID_CATEGORY
  ) {
    return p.googleProductCategory;
  }
  return p.type === "insert" ? CATEGORY_FIREPLACES : CATEGORY_STOVES;
}

/** Libellé produit selon combustible/type — évite « poêle à pellets » sur un insert à bois. */
function productKindLabel(p: ProductDemo): string {
  const fuel =
    p.combustible === "bois"
      ? "à bois"
      : p.combustible === "hybride"
        ? "hybride bois/pellets"
        : "à pellets";
  return p.type === "insert" ? `insert ${fuel}` : `poêle ${fuel}`;
}

/** `g:product_type` : taxonomie interne libre, utile pour segmenter les campagnes. */
function productTypePath(p: ProductDemo): string {
  if (p.type === "insert") return "Inserts";
  const family =
    p.combustible === "bois"
      ? "Poêles à bois"
      : p.combustible === "hybride"
        ? "Poêles hybrides"
        : "Poêles à pellets";
  if (p.type === "canalisable") return `${family} > Canalisable`;
  if (p.type === "hydro") return `${family} > Hydro`;
  return family;
}

/** Échappe les caractères réservés XML. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** URL absolue (les imageSrc Payload sont relatives same-origin). */
function absUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Hash court déterministe (base36) — suffixes d'unicité. */
function shortHash(raw: string): string {
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 5);
}

/**
 * Google Merchant impose 50 caractères max pour l'attribut `id`. Certains
 * skus internes de variantes (ex. "EDK-CHERIE-11-EVO-TOP-PIERRE-OLLAIRE-
 * PIERRE-OLLAIRE") dépassent. On tronque à 50 en conservant un suffixe de
 * hash court pour préserver l'unicité.
 */
function safeMerchantId(raw: string): string {
  if (raw.length <= 50) return raw;
  return `${raw.slice(0, 44)}-${shortHash(raw)}`;
}

/** stockStatus interne → valeur d'availability Google Merchant. */
function availability(status: string | undefined): string {
  if (status === "out_of_stock" || status === "discontinued") return "out_of_stock";
  if (status === "on_order") return "backorder";
  return "in_stock";
}

/** Pour une variante, retourne la valeur choisie sur chaque axe. */
function variantAxisValues(
  axes: VariantOptionAxis[],
  variant: ProductVariantData,
): Array<{ axis: VariantOptionAxis; valueLabel: string; valueSlug: string }> {
  const out: Array<{ axis: VariantOptionAxis; valueLabel: string; valueSlug: string }> =
    [];
  for (const axis of axes) {
    const value = axis.values.find((v) => variant.optionValueIds.includes(v.id));
    if (value) out.push({ axis, valueLabel: value.label, valueSlug: value.slug });
  }
  return out;
}

/**
 * Une entrée du feed avant rendu XML. L'id définitif n'est fixé qu'après une
 * passe de déduplication globale : deux produits différents peuvent partager
 * un même SKU de variante (erreur de saisie catalogue — cas réel : Celia ATC
 * vs Celia ATC Magic). Google refuse les `id` dupliqués, donc en cas de
 * collision chaque occurrence est suffixée d'un hash court de son
 * `dedupSeed` (item_group_id) — déterministe et indépendant de l'ordre DB.
 */
type FeedEntry = {
  rawId: string;
  dedupSeed: string;
  fields: Array<[string, string | undefined]>;
};

/** Construit un bloc <item> à partir de paires clé/valeur (valeurs déjà prêtes). */
function buildItem(fields: Array<[string, string | undefined]>): string {
  const lines = fields
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => {
      const tag = k.startsWith("g:") ? k : `g:${k}`;
      return `      <${tag}>${esc(String(v))}</${tag}>`;
    });
  return `    <item>\n${lines.join("\n")}\n    </item>`;
}

/** Entrée pour un produit sans variantes. */
function productEntry(p: ProductDemo): FeedEntry | null {
  if (!p.priceTTC || p.priceTTC <= 0) return null;
  const imageLink = absUrl(p.imageSrc);
  if (!imageLink) return null; // image obligatoire chez Google Merchant
  const hasIdentifier = Boolean(p.gtin || p.mpn);
  const typeSuffix =
    p.type === "canalisable" || p.type === "hydro" ? ` ${p.type}` : "";
  return {
    rawId: safeMerchantId(p.sku || p.slug),
    dedupSeed: p.slug,
    fields: [
      ["title", p.name],
      [
        "description",
        p.shortDescription ||
          `${p.name}, ${productKindLabel(p)}${typeSuffix}${
            p.heatedVolume ? ` pour ${p.heatedVolume}` : ""
          }. Distribué et posé par Mister Pellets.`,
      ],
      ["link", `${SITE_URL}/produit/${p.slug}`],
      ["image_link", imageLink],
      ["availability", availability(p.stockStatus)],
      ["price", `${p.priceTTC.toFixed(2)} EUR`],
      ["brand", p.brand],
      ["gtin", p.gtin],
      ["mpn", p.mpn],
      ["identifier_exists", hasIdentifier ? undefined : "no"],
      ["condition", "new"],
      ["google_product_category", googleCategory(p)],
      ["product_type", productTypePath(p)],
    ],
  };
}

/** Entrée pour une variante d'un produit à variantes. */
function variantEntry(
  p: ProductDemo,
  variant: ProductVariantData,
): FeedEntry | null {
  const price = variant.price;
  if (!price || price <= 0) return null;
  const imageLink = absUrl(variant.image?.url || p.imageSrc);
  if (!imageLink) return null; // image obligatoire chez Google Merchant

  const axes = [...(p.variantOptions ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const chosen = variantAxisValues(axes, variant);

  const config = chosen.map((c) => c.valueLabel).join(", ");
  const query = new URLSearchParams();
  for (const c of chosen) query.set(c.axis.slug, c.valueSlug);
  const link = `${SITE_URL}/produit/${p.slug}${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const color = chosen.find((c) => c.axis.slug === "couleur")?.valueLabel;
  const material = chosen.find((c) => c.axis.slug === "materiau")?.valueLabel;
  const hasIdentifier = Boolean(variant.gtin || variant.mpn);
  const salePrice =
    variant.salePrice && variant.salePrice > 0 && variant.salePrice < price
      ? `${variant.salePrice.toFixed(2)} EUR`
      : undefined;
  const groupId = p.sku || p.slug;

  return {
    rawId: safeMerchantId(variant.sku || `${p.slug}-v-${variant.id}`),
    dedupSeed: groupId,
    fields: [
      ["item_group_id", groupId],
      ["title", config ? `${p.name}, ${config}` : p.name],
      [
        "description",
        p.shortDescription ||
          `${p.name}${config ? ` (${config})` : ""}, ${productKindLabel(p)} distribué et posé par Mister Pellets.`,
      ],
      ["link", link],
      ["image_link", imageLink],
      ["availability", availability(variant.stockStatus)],
      ["price", `${price.toFixed(2)} EUR`],
      ["sale_price", salePrice],
      ["brand", p.brand],
      ["gtin", variant.gtin],
      ["mpn", variant.mpn],
      ["identifier_exists", hasIdentifier ? undefined : "no"],
      ["condition", "new"],
      ["google_product_category", googleCategory(p)],
      ["product_type", productTypePath(p)],
      ["color", color],
      ["material", material],
    ],
  };
}

/** Entrée pour une déclinaison de couleur d'un produit. */
function colorVariantEntry(
  p: ProductDemo,
  cv: ProductColorVariant,
): FeedEntry | null {
  if (!p.priceTTC || p.priceTTC <= 0) return null;
  const imageLink = absUrl(cv.mainImage?.url || p.imageSrc);
  if (!imageLink) return null; // image obligatoire chez Google Merchant
  // Chaque couleur a son propre GTIN (EAN). L'identifiant retombe sur le MPN
  // produit si la couleur n'a pas de GTIN.
  const hasIdentifier = Boolean(cv.gtin || p.mpn);
  const kind = productKindLabel(p);
  const groupId = p.sku || p.slug;
  return {
    rawId: safeMerchantId(
      cv.gtin || `${p.sku || p.slug}-${slugify(cv.colorName)}`,
    ),
    dedupSeed: groupId,
    fields: [
      ["item_group_id", groupId],
      ["title", `${p.name} - ${cv.colorName}`],
      [
        "description",
        p.shortDescription
          ? `${p.shortDescription} Finition ${cv.colorName}.`
          : `${p.name}, finition ${cv.colorName}. ${kind.charAt(0).toUpperCase()}${kind.slice(1)} distribué et posé par Mister Pellets.`,
      ],
      ["link", `${SITE_URL}/produit/${p.slug}`],
      ["image_link", imageLink],
      ["availability", availability(p.stockStatus)],
      ["price", `${p.priceTTC.toFixed(2)} EUR`],
      ["brand", p.brand],
      ["gtin", cv.gtin],
      ["mpn", p.mpn],
      ["identifier_exists", hasIdentifier ? undefined : "no"],
      ["condition", "new"],
      ["google_product_category", googleCategory(p)],
      ["product_type", productTypePath(p)],
      ["color", cv.colorName],
    ],
  };
}

export async function GET(): Promise<Response> {
  const products = await getAllProducts();

  const entries: FeedEntry[] = [];
  for (const p of products) {
    // Produit discontinué : exclu du feed (pas de valeur availability Google).
    if (p.stockStatus === "discontinued") continue;
    if (p.hasVariants && p.variants && p.variants.length > 0) {
      // Variantes génériques multi-axes : une ligne par combinaison.
      for (const variant of p.variants) {
        const entry = variantEntry(p, variant);
        if (entry) entries.push(entry);
      }
    } else if (p.colorVariants && p.colorVariants.length > 0) {
      // Déclinaisons de couleur : une ligne par couleur, regroupées.
      for (const cv of p.colorVariants) {
        const entry = colorVariantEntry(p, cv);
        if (entry) entries.push(entry);
      }
    } else {
      // Produit simple : une seule ligne.
      const entry = productEntry(p);
      if (entry) entries.push(entry);
    }
  }

  // Passe de déduplication des id (voir doc de FeedEntry).
  const idCounts = new Map<string, number>();
  for (const e of entries) {
    idCounts.set(e.rawId, (idCounts.get(e.rawId) ?? 0) + 1);
  }
  const items = entries.map((e) => {
    const isDuplicate = (idCounts.get(e.rawId) ?? 0) > 1;
    const id = isDuplicate
      ? safeMerchantId(`${e.rawId}-${shortHash(e.dedupSeed)}`)
      : e.rawId;
    return buildItem([["id", id], ...e.fields]);
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Mister Pellets, Catalogue poêles à pellets</title>
    <link>${SITE_URL}</link>
    <description>Flux produits Mister Pellets pour Google Merchant Center.</description>
${items.join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
