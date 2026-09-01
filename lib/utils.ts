import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with conditional logic + tailwind-merge to dedupe conflicting classes.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-mp-orange-flame", "px-8")
 * // → "py-2 bg-mp-orange-flame px-8" (px-4 dedupe par px-8)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Helper pour générer des liens téléphoniques cliquables formatés.
 */
export function formatPhone(phone: string): string {
  return phone.replace(/\s/g, "");
}

/**
 * Formate un prix en EUR (ex. 2890 → "2 890 €")
 */
export function formatPrice(amountInEuros: number): string {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInEuros);
}

/**
 * Taux de TVA belge. Les prix produit sont stockés TTC au taux standard.
 *
 * ⚠️ Le prix mis en avant auprès d'un consommateur doit être le prix TOTAL,
 * TVA comprise (art. VI.3 CDE). C'est aussi le prix que Google Merchant exige
 * pour la Belgique et celui que le panier facture. Le HTVA ne s'affiche donc
 * qu'en mention secondaire, à l'intention des professionnels.
 */
export const VAT_RATE = 1.21;

/** TVA réduite : pose sur une habitation privée de plus de 10 ans. */
export const VAT_RATE_REDUCED = 1.06;

/**
 * Formate le prix HTVA (hors TVA) à partir d'un prix TTC stocké.
 * Ex. 2890 (TTC) → "2 388 €" (HTVA), arrondi à l'euro comme formatPrice.
 */
export function formatPriceHT(amountTTC: number): string {
  return formatPrice(amountTTC / VAT_RATE);
}

/**
 * Prix TVAC au taux réduit de 6 %, applicable quand le poêle est posé par nos
 * soins sur une habitation privée de plus de 10 ans. C'est le prix réellement
 * payé par la grande majorité des clients, et le seul argument tarifaire
 * honnête face aux concurrents qui affichent du HTVA.
 * Ex. 3182 (TTC 21 %) → 2 630 HTVA → "2 788 €" (TVAC 6 %).
 */
export function formatPriceReducedVat(amountTTC: number): string {
  return formatPrice((amountTTC / VAT_RATE) * VAT_RATE_REDUCED);
}

/**
 * Slugifie une string (pour URL produits, etc.)
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
