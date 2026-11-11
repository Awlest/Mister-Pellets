import { schemaAvailability } from "./availability";
import { BONUS } from "./bonus";
import { formatKw } from "./power";
import { productFuel, productKindLabel } from "./product-kind";
import { shownPriceTTC } from "./product-price";
import type { ProductDemo, ProductVariantData } from "./products-demo";
import {
  FREE_ZONE_POSTAL_CODES,
  SHIPPING_BRUSSELS_FLANDERS,
  SHIPPING_LOCAL,
  SHIPPING_PREFIXES,
  SHIPPING_WALLONIA,
} from "./shipping";

/**
 * Titre, description et données structurées d'une fiche produit.
 *
 * Fonctions pures, sans base ni réseau : scripts/check-catalogue.ts les
 * éprouve (longueur des titres, jamais de prix à 0, pas de Product sans
 * offre).
 */

const SITE = "https://mister-pellets.be";
const ORGANIZATION_ID = `${SITE}/#organization`;
const SUFFIX = " | Mister Pellets";
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 158;

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** « 8,1 kW », ou « 8,3 à 13 kW » pour une fiche qui regroupe plusieurs puissances. */
export function powerLabel(p: Pick<ProductDemo, "power" | "powers">): string {
  if (p.powers && p.powers.length > 1) {
    return `${formatKw(p.powers[0]!)} à ${formatKw(p.powers[p.powers.length - 1]!)} kW`;
  }
  return p.power ?? "";
}

/** Libellé lisible du type : « Poêle à pellets canalisable », « Insert à pellets ». */
export function productTypeLabel(p: ProductDemo): string {
  const kind = productKindLabel(p);
  const canalisable = (p.isCanalizable || p.type === "canalisable") && !/hydro/.test(kind);
  return capitalize(`${kind}${canalisable ? " canalisable" : ""}`);
}

/**
 * Titre de la fiche : « Poêle à pellets MCZ Ego Air 8 R 8,1 kW ». Le nom de la
 * fiche porte déjà la marque. Si le titre dépasse 60 caractères, on retire
 * d'abord le détail du type, puis le type : jamais de titre coupé.
 * Le suffixe « | Mister Pellets » n'est ajouté par buildPageMetadata que s'il
 * tient dans les 60 caractères.
 */
export function productTitle(p: ProductDemo): string {
  const power = powerLabel(p);
  const name = p.name.trim();
  const candidates = [
    `${productTypeLabel(p)} ${name} ${power}`,
    `${productTypeLabel(p).replace(/ (?:hydro|canalisable)$/, "")} ${name} ${power}`,
    `${name} ${power}`,
    name,
  ].map((t) => t.replace(/\s+/g, " ").trim());
  return candidates.find((t) => t.length <= TITLE_MAX) ?? candidates[candidates.length - 1]!;
}

/** Le suffixe de marque tient-il derrière ce titre ? */
export function titleFitsSuffix(title: string): boolean {
  return title.length + SUFFIX.length <= TITLE_MAX;
}

/** Coupe un texte à la dernière phrase entière qui tient, sinon au dernier mot. */
export function fitText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sentences = clean.match(/[^.!?]+[.!?]+/g) ?? [];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).trim().length > max) break;
    out += sentence;
  }
  if (out.trim().length >= 40) return out.trim();
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`;
}

/**
 * Description de la fiche : la description courte saisie dans l'admin (propre
 * à chaque fiche), puis le prix du poêle seul ou « Prix sur devis ». 158
 * caractères au plus. `priceText` est déjà formaté (« Dès 2 856 € TVAC, hors
 * pose. »).
 */
export function productDescription(p: ProductDemo, priceText: string): string {
  const name = p.name.trim();
  const short = p.shortDescription?.trim();
  let base: string;
  if (!short) {
    base = `${productTypeLabel(p)} ${name} de ${powerLabel(p)}${p.heatedVolume ? `, pour ${p.heatedVolume}` : ""}.`;
  } else if (mentions(short, name, p.brand)) {
    base = short;
  } else {
    // Plusieurs fiches d'une même gamme partagent leur description courte
    // (versions R, UP, XUP) : le nom du modèle en tête rend chaque description
    // unique.
    const lower = COMMON_OPENING.test(short) ? short.charAt(0).toLowerCase() + short.slice(1) : short;
    base = `${name} : ${lower}`;
  }
  const lead = /[.!?]$/.test(base) ? base : `${base}.`;
  const room = DESCRIPTION_MAX - priceText.length - 1;
  return `${fitText(lead, room)} ${priceText}`.trim();
}

/** Premier mot courant d'une description (« Poêle », « Insert », « Le »), qui passe en minuscule après « Nom : ». */
const COMMON_OPENING = /^(?:Po[êe]le|Insert|Foyer|Thermopo[êe]le|Chaudi[èe]re|Mod[èe]le|Version|Le|La|Les|Un|Une|Petit|Grand|Compact)(?=[\s,])/;

/** La description cite-t-elle déjà le modèle (nom complet, ou nom sans la marque) ? */
function mentions(text: string, name: string, brand: string): boolean {
  const haystack = text.toLowerCase();
  const model = (name.toLowerCase().startsWith(`${brand.toLowerCase()} `) ? name.slice(brand.length + 1) : name).toLowerCase();
  return haystack.includes(name.toLowerCase()) || (model.length > 3 && haystack.includes(model));
}

// =====================================================================
// Caractéristiques
// =====================================================================

export interface SpecRow {
  label: string;
  value: string;
}

const fr = (n: number): string => n.toLocaleString("fr-BE", { maximumFractionDigits: 1 });

/**
 * Lignes du tableau de caractéristiques, reprises telles quelles dans le
 * JSON-LD (`additionalProperty`). Une ligne n'existe que si la donnée est
 * saisie ; une case non cochée (étanche, canalisable, hydro, Wi-Fi) ne donne
 * pas de ligne « Non », la fiche pouvant simplement ne pas être renseignée.
 */
export function productSpecs(p: ProductDemo): SpecRow[] {
  const rows: SpecRow[] = [];
  const add = (label: string, value: string | undefined | null | false) => {
    if (value) rows.push({ label, value });
  };
  const s = p.specs ?? {};
  add("Type d'appareil", productTypeLabel(p));
  add("Combustible", productFuel(p) === "hybride" ? "Bûches et pellets" : "Pellets");
  if (p.powers && p.powers.length > 1) add("Puissances disponibles", `${p.powers.map(formatKw).join(" · ")} kW`);
  else add("Puissance nominale", p.power);
  if (p.heatedVolumes && p.heatedVolumes.length > 1)
    add("Volume chauffé maximal", `${p.heatedVolumes[0]} à ${p.heatedVolumes[p.heatedVolumes.length - 1]} m³`);
  else add("Volume chauffé maximal", p.heatedVolume);
  add("Rendement", s.efficiency ? `${fr(s.efficiency)} %` : null);
  add("Classe énergétique", s.energyClass);
  add("Réservoir à pellets", s.hopperKg ? `${fr(s.hopperKg)} kg` : null);
  add("Poids", s.weightKg ? `${fr(s.weightKg)} kg` : null);
  add(
    "Dimensions (L × H × P)",
    s.widthCm && s.heightCm && s.depthCm ? `${fr(s.widthCm)} × ${fr(s.heightCm)} × ${fr(s.depthCm)} cm` : null,
  );
  add("Étanche", p.isAirtight && "Oui, air de combustion pris à l'extérieur");
  add("Canalisable", (p.isCanalizable || p.type === "canalisable") && "Oui");
  add("Raccordement au chauffage central", (p.isHydro || p.type === "hydro" || p.type === "hybride-hydro") && "Oui (hydro)");
  add("Wi-Fi", p.isConnected && "Oui");
  add("Référence fabricant", p.mpn);
  return rows;
}

// =====================================================================
// Données structurées
// =====================================================================

/** Un code EAN/GTIN valide compte 8, 12, 13 ou 14 chiffres : une référence fabricant saisie par erreur n'en est pas un. */
export function validGtin(code: string | undefined | null): string | undefined {
  const digits = (code ?? "").replace(/\s/g, "");
  return /^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(digits) ? digits : undefined;
}

const absolute = (url: string): string => (url.startsWith("http") ? url : `${SITE}${url}`);

/** Photos de la fiche en adresses absolues, la principale d'abord. */
export function productImages(p: ProductDemo): string[] {
  const main = p.image?.sizes?.full ?? p.image?.url ?? p.imageSrc;
  const gallery = (p.galleryImages ?? []).map((g) => g.sizes?.full ?? g.url);
  return [...new Set([main, ...gallery].filter((u): u is string => Boolean(u)).map(absolute))];
}

const price = (amountTTC: number) => ({ "@type": "MonetaryAmount", value: amountTTC, currency: "EUR" });

/**
 * Frais de livraison, mêmes montants et mêmes zones que lib/shipping.ts et le
 * flux Merchant : offerte dans les communes proches de Fernelmont, forfait en
 * Wallonie, forfait à Bruxelles et en Flandre.
 */
export function shippingDetails(): Record<string, unknown>[] {
  const prefixes = (amount: number) => SHIPPING_PREFIXES.filter((p) => p.price === amount).map((p) => p.prefix);
  const zone = (amount: number, region: Record<string, unknown>) => ({
    "@type": "OfferShippingDetails",
    shippingRate: price(amount),
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "BE", ...region },
  });
  return [
    zone(SHIPPING_LOCAL, { postalCode: [...FREE_ZONE_POSTAL_CODES].sort((a, b) => a - b).map(String) }),
    zone(SHIPPING_WALLONIA, { postalCodePrefix: prefixes(SHIPPING_WALLONIA) }),
    zone(SHIPPING_BRUSSELS_FLANDERS, { postalCodePrefix: prefixes(SHIPPING_BRUSSELS_FLANDERS) }),
  ];
}

/** Prix réellement affiché d'une variante : bonus de saison, sinon promo, sinon catalogue. 0 = pas de prix. */
export function variantPrice(v: ProductVariantData): number {
  const shown = v.bonusPrice ?? (v.salePrice && v.salePrice > 0 ? v.salePrice : v.price);
  return typeof shown === "number" && shown > 0 ? shown : 0;
}

/** « Acier, Blanc » : les valeurs choisies sur chaque axe de la variante. */
function variantLabel(p: ProductDemo, v: ProductVariantData): string {
  return [...(p.variantOptions ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((axis) => axis.values.find((value) => v.optionValueIds.includes(value.id))?.label)
    .filter(Boolean)
    .join(", ");
}

/**
 * Offres de la fiche : une par variante CHIFFRÉE (jamais de prix à 0), une par
 * couleur dotée d'un vrai code EAN, sinon une seule. Tableau vide quand la
 * fiche est « Sur devis ».
 *
 * Pas de politique de retour : le site ne vend plus en ligne (paiement retiré
 * le 04/09/2026), la commande passe par un devis signé. À rétablir seulement
 * avec une politique écrite dans les CGV.
 */
export function productOffers(p: ProductDemo, now: Date = new Date()): Record<string, unknown>[] {
  const url = `${SITE}/produit/${p.slug}`;
  const validUntil = p.bonusPriceTTC != null ? BONUS.to : `${now.getFullYear()}-12-31`;
  const offer = (amount: number, extra: Record<string, unknown>, status: string | undefined) => ({
    "@type": "Offer",
    url,
    priceCurrency: "EUR",
    price: amount,
    priceValidUntil: validUntil,
    availability: schemaAvailability(status),
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@id": ORGANIZATION_ID },
    ...extra,
  });

  let offers: Record<string, unknown>[] = [];
  const variants = p.hasVariants ? (p.variants ?? []) : [];
  if (variants.length > 0) {
    offers = variants
      .filter((v) => variantPrice(v) > 0)
      .map((v) => {
        const label = variantLabel(p, v);
        const gtin = validGtin(v.gtin);
        return offer(
          variantPrice(v),
          {
            ...(label ? { name: `${p.name.trim()}, ${label}` } : {}),
            ...(v.sku ? { sku: v.sku } : {}),
            ...(v.mpn ? { mpn: v.mpn } : {}),
            ...(gtin ? { gtin } : {}),
          },
          v.stockStatus ?? p.stockStatus,
        );
      });
  } else {
    const shown = shownPriceTTC(p);
    if (shown && shown > 0) {
      const colours = (p.colorVariants ?? []).filter((c) => validGtin(c.gtin));
      offers =
        colours.length > 0
          ? colours.map((c) => offer(shown, { name: `${p.name.trim()}, ${c.colorName}`, gtin: validGtin(c.gtin), color: c.colorName }, p.stockStatus))
          : [offer(shown, {}, p.stockStatus)];
    }
  }
  // Livraison : décrite une fois, sur la première offre, puis citée par son @id.
  const shippingId = `${url}#livraison`;
  return offers.map((o, i) => ({
    ...o,
    shippingDetails: i === 0 ? shippingDetails().map((d, n) => ({ "@id": `${shippingId}-${n + 1}`, ...d })) : shippingDetails().map((_, n) => ({ "@id": `${shippingId}-${n + 1}` })),
  }));
}

/**
 * Données structurées de la fiche.
 *
 * - Au moins un prix affiché : `Product` avec `sku`, `mpn`, `gtin` valide,
 *   `brand`, `image`, `category`, caractéristiques en `additionalProperty` et
 *   les seules offres chiffrées.
 * - Aucun prix (« Sur devis ») : pas de `Product` (Google le classe « non
 *   valide » sans `offers`, `review` ni `aggregateRating`, et les avis ne sont
 *   jamais balisés). La page se décrit par un `WebPage` : nom, description,
 *   photo principale, marque.
 */
export function productJsonLd(p: ProductDemo, description: string, now: Date = new Date()): Record<string, unknown> {
  const url = `${SITE}/produit/${p.slug}`;
  const images = productImages(p);
  const brand = { "@type": "Brand", name: p.brand };
  const offers = productOffers(p, now);

  if (offers.length === 0) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: p.name.trim(),
      description,
      ...(images[0] ? { primaryImageOfPage: { "@type": "ImageObject", url: images[0] } } : {}),
      about: brand,
      publisher: { "@id": ORGANIZATION_ID },
    };
  }

  const gtin = validGtin(p.gtin);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    url,
    name: p.name.trim(),
    description,
    ...(images.length > 0 ? { image: images } : {}),
    ...(p.sku ? { sku: p.sku } : {}),
    ...(p.mpn ? { mpn: p.mpn } : {}),
    ...(gtin ? { gtin } : {}),
    brand,
    category: capitalize(productKindLabel(p)),
    additionalProperty: productSpecs(p).map((row) => ({ "@type": "PropertyValue", name: row.label, value: row.value })),
    offers: offers.length === 1 ? offers[0] : offers,
  };
}
