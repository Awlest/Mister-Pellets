import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEuros } from "./typo";

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
 * Formate un prix en EUR, arrondi à l'euro (ex. 2890 → "2 890 €"). Le montant
 * ne se coupe pas en fin de ligne : lib/typo.ts.
 */
export function formatPrice(amountInEuros: number): string {
  return formatEuros(amountInEuros);
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
