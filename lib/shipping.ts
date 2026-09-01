/**
 * Frais de port des commandes en ligne, selon les CGV §7.
 *
 * Trois zones :
 *  - zone locale (rayon d'environ 20 km autour de Fernelmont) : offerte
 *  - reste de la Wallonie : 50 €
 *  - Bruxelles et Flandre : 100 €
 *
 * ⚠️ Ce barème est la SOURCE DE VÉRITÉ du prix payé. Il doit rester identique à
 * ce que les CGV annoncent, à l'encart des fiches produit et au `g:shipping`
 * du flux Google Merchant (`app/api/feed/google-merchant/route.ts`). Un écart
 * entre ces quatre endroits est exactement le motif de « déclarations
 * trompeuses » qui a fait suspendre le compte Merchant.
 */

/** Barème, en euros TTC. */
export const SHIPPING_LOCAL = 0;
export const SHIPPING_WALLONIA = 50;
export const SHIPPING_BRUSSELS_FLANDERS = 100;

/**
 * Codes postaux de la zone de livraison offerte, validés par le client
 * (2026-09-01). Un rayon kilométrique ne se code pas : c'est cette liste qui
 * fait foi. À faire évoluer ici et nulle part ailleurs.
 */
export const FREE_ZONE_POSTAL_CODES: ReadonlySet<number> = new Set([
  5380, // Fernelmont
  5310, // Éghezée
  5300, // Andenne
  // Namur et sa périphérie
  5000, 5001, 5002, 5003, 5004, 5020, 5021, 5022, 5024,
  // La Bruyère
  5080, 5081,
  // Jambes, Naninne, Wierde, Dave
  5100,
  // Gembloux
  5030, 5031, 5032,
  5340, // Gesves
  5350, // Ohey
  4219, // Wasseiges
  4260, // Braives
]);

export type ShippingZone = "local" | "wallonia" | "brussels-flanders";

/**
 * Zone tarifaire d'un code postal belge.
 *
 * Découpage postal belge utilisé pour distinguer Wallonie et Flandre :
 *   1000-1299 Bruxelles-Capitale · 1300-1499 Brabant wallon
 *   1500-3999 Flandre            · 4000-7999 Wallonie
 *   8000-9999 Flandre
 */
export function shippingZoneFor(postalCode: number): ShippingZone {
  if (FREE_ZONE_POSTAL_CODES.has(postalCode)) return "local";
  const isWallonia =
    (postalCode >= 1300 && postalCode <= 1499) ||
    (postalCode >= 4000 && postalCode <= 7999);
  return isWallonia ? "wallonia" : "brussels-flanders";
}

/**
 * Frais de port pour un code postal belge, en euros TTC.
 *
 * `postalCode` est accepté sous forme de texte parce qu'il vient d'un
 * formulaire. Une saisie qui n'est pas un code postal belge à 4 chiffres est
 * facturée au tarif le plus élevé plutôt que refusée : mieux vaut surestimer,
 * quitte à corriger à la main, que livrer à perte sur une faute de frappe.
 */
export function shippingCostFor(postalCode: string | number | undefined | null): number {
  const digits = String(postalCode ?? "").replace(/\D/g, "");
  if (digits.length !== 4) return SHIPPING_BRUSSELS_FLANDERS;
  const code = Number(digits);
  if (code < 1000 || code > 9999) return SHIPPING_BRUSSELS_FLANDERS;
  switch (shippingZoneFor(code)) {
    case "local":
      return SHIPPING_LOCAL;
    case "wallonia":
      return SHIPPING_WALLONIA;
    default:
      return SHIPPING_BRUSSELS_FLANDERS;
  }
}
