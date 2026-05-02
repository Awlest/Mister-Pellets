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
