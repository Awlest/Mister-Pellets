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

const DEFAULT_CATEGORY =
  "Home & Garden > Household Appliances > Heating > Pellet Stoves";

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

/**
 * Google Merchant impose 50 caractères max pour l'attribut `id`. Certains
 * skus internes de variantes (ex. "EDK-CHERIE-11-EVO-TOP-PIERRE-OLLAIRE-
 * PIERRE-OLLAIRE") dépassent. On tronque à 50 en conservant un suffixe de
 * hash court pour préserver l'unicité.
 */
function safeMerchantId(raw: string): string {
  if (raw.length <= 50) return raw;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) | 0;
  const tag = Math.abs(h).toString(36).slice(0, 5);
  return `${raw.slice(0, 44)}-${tag}`;
}

/** stockStatus interne → valeur d'availability Google Merchant. */
function availability(status: string | undefined): string {
  if (status === "out_of_stock") return "out_of_stock";
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

/** <item> pour un produit sans variantes. */
function productItem(p: ProductDemo): string | null {
  if (!p.priceTTC || p.priceTTC <= 0) return null;
  const hasIdentifier = Boolean(p.gtin || p.mpn);
  return buildItem([
    ["id", safeMerchantId(p.sku || p.slug)],
    ["title", p.name],
    [
      "description",
      p.shortDescription ||
        `${p.name}, poêle à pellets ${p.type}${
          p.heatedVolume ? ` pour ${p.heatedVolume}` : ""
        }. Distribué et posé par Mister Pellets.`,
    ],
    ["link", `${SITE_URL}/produit/${p.slug}`],
    ["image_link", absUrl(p.imageSrc)],
    ["availability", "in_stock"],
    ["price", `${p.priceTTC.toFixed(2)} EUR`],
    ["brand", p.brand],
    ["gtin", p.gtin],
    ["mpn", p.mpn],
    ["identifier_exists", hasIdentifier ? undefined : "no"],
    ["condition", "new"],
    ["google_product_category", p.googleProductCategory || DEFAULT_CATEGORY],
  ]);
}

/** <item> pour une variante d'un produit à variantes. */
function variantItem(p: ProductDemo, variant: ProductVariantData): string | null {
  const price = variant.price;
  if (!price || price <= 0) return null;

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

  return buildItem([
    ["id", safeMerchantId(variant.sku || `${p.slug}-v-${variant.id}`)],
    ["item_group_id", p.sku || p.slug],
    ["title", config ? `${p.name}, ${config}` : p.name],
    [
      "description",
      p.shortDescription ||
        `${p.name}${config ? ` (${config})` : ""}, poêle à pellets distribué et posé par Mister Pellets.`,
    ],
    ["link", link],
    ["image_link", absUrl(variant.image?.url || p.imageSrc)],
    ["availability", availability(variant.stockStatus)],
    ["price", `${price.toFixed(2)} EUR`],
    ["sale_price", salePrice],
    ["brand", p.brand],
    ["gtin", variant.gtin],
    ["mpn", variant.mpn],
    ["identifier_exists", hasIdentifier ? undefined : "no"],
    ["condition", "new"],
    ["google_product_category", p.googleProductCategory || DEFAULT_CATEGORY],
    ["color", color],
    ["material", material],
  ]);
}

/** <item> pour une déclinaison de couleur d'un produit. */
function colorVariantItem(p: ProductDemo, cv: ProductColorVariant): string | null {
  if (!p.priceTTC || p.priceTTC <= 0) return null;
  // Chaque couleur a son propre GTIN (EAN). L'identifiant retombe sur le MPN
  // produit si la couleur n'a pas de GTIN.
  const hasIdentifier = Boolean(cv.gtin || p.mpn);
  return buildItem([
    ["id", safeMerchantId(cv.gtin || `${p.sku || p.slug}-${slugify(cv.colorName)}`)],
    ["item_group_id", p.sku || p.slug],
    ["title", `${p.name} - ${cv.colorName}`],
    [
      "description",
      p.shortDescription
        ? `${p.shortDescription} Finition ${cv.colorName}.`
        : `${p.name}, finition ${cv.colorName}. Poêle à pellets distribué et posé par Mister Pellets.`,
    ],
    ["link", `${SITE_URL}/produit/${p.slug}`],
    ["image_link", absUrl(cv.mainImage?.url || p.imageSrc)],
    ["availability", "in_stock"],
    ["price", `${p.priceTTC.toFixed(2)} EUR`],
    ["brand", p.brand],
    ["gtin", cv.gtin],
    ["mpn", p.mpn],
    ["identifier_exists", hasIdentifier ? undefined : "no"],
    ["condition", "new"],
    ["google_product_category", p.googleProductCategory || DEFAULT_CATEGORY],
    ["color", cv.colorName],
  ]);
}

export async function GET(): Promise<Response> {
  const products = await getAllProducts();

  const items: string[] = [];
  for (const p of products) {
    if (p.hasVariants && p.variants && p.variants.length > 0) {
      // Variantes génériques multi-axes : une ligne par combinaison.
      for (const variant of p.variants) {
        const item = variantItem(p, variant);
        if (item) items.push(item);
      }
    } else if (p.colorVariants && p.colorVariants.length > 0) {
      // Déclinaisons de couleur : une ligne par couleur, regroupées.
      for (const cv of p.colorVariants) {
        const item = colorVariantItem(p, cv);
        if (item) items.push(item);
      }
    } else {
      // Produit simple : une seule ligne.
      const item = productItem(p);
      if (item) items.push(item);
    }
  }

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
