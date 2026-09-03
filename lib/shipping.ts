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

/**
 * Zones postales hors zone offerte, exprimées en PRÉFIXES, pour le flux
 * Google Merchant (`g:shipping` / `g:postal_code`).
 *
 * ⚠️ Ne pas revenir à des plages « 1000-1299 ». Google exige que les deux
 * bornes d'une plage soient des codes postaux réellement attribués : 1299,
 * 1499, 3999, 7999 et 9999 n'existent pas en Belgique, et le flux entier était
 * refusé pour « Code postal non valide » — 242 produits sur 242, plus aucune
 * diffusion en Belgique (constaté le 03/09/2026). Le préfixe suivi de `*` est
 * l'autre forme documentée, et il ne peut pas contenir de code inexistant.
 *
 *   10-12 Bruxelles · 13-14 Brabant wallon · 15-19, 2, 3 Flandre
 *   4 à 7 Wallonie  · 8, 9 Flandre
 * Couverture complète de 1000 à 9999, sans trou ni chevauchement.
 * `scripts/check-shipping.ts` vérifie que ce découpage donne exactement le
 * même prix que `shippingCostFor` sur les 9000 codes possibles.
 */
export const SHIPPING_PREFIXES: ReadonlyArray<{ prefix: string; price: number }> = [
  { prefix: "10", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "11", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "12", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "13", price: SHIPPING_WALLONIA },
  { prefix: "14", price: SHIPPING_WALLONIA },
  { prefix: "15", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "16", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "17", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "18", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "19", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "2", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "3", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "4", price: SHIPPING_WALLONIA },
  { prefix: "5", price: SHIPPING_WALLONIA },
  { prefix: "6", price: SHIPPING_WALLONIA },
  { prefix: "7", price: SHIPPING_WALLONIA },
  { prefix: "8", price: SHIPPING_BRUSSELS_FLANDERS },
  { prefix: "9", price: SHIPPING_BRUSSELS_FLANDERS },
];

/**
 * Prix qu'un client verra sur Google pour un code postal donné : préfixe le
 * plus long qui correspond, sauf si le code figure dans la zone offerte
 * (déclarée en exact, donc plus spécifique que tout préfixe).
 */
export function declaredShippingFor(postalCode: number): number | null {
  if (FREE_ZONE_POSTAL_CODES.has(postalCode)) return SHIPPING_LOCAL;
  const code = String(postalCode);
  const match = [...SHIPPING_PREFIXES]
    .filter((p) => code.startsWith(p.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return match ? match.price : null;
}

export type ShippingZone = "local" | "wallonia" | "brussels-flanders";

/**
 * Zone tarifaire d'un code postal belge.
 *
 * Découpage postal belge utilisé pour distinguer Wallonie et Flandre :
 *   1000-1299 Bruxelles-Capitale · 1300-1499 Brabant wallon
 *   1500-3999 Flandre            · 4000-7999 Wallonie
 *   8000-9999 Flandre
 *
 * Ces bornes servent au calcul interne. Elles ne sont PAS transposables telles
 * quelles dans le flux Merchant : 1299, 1499, 3999, 7999 et 9999 ne sont pas
 * des codes postaux attribués, et Google refuse toute plage dont une borne
 * n'existe pas. Le flux utilise des préfixes (cf. SHIPPING_PREFIXES).
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
