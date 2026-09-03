/**
 * Disponibilité d'un produit — SOURCE UNIQUE.
 *
 * Google recoupe la valeur `availability` du flux Merchant avec le balisage
 * Schema.org de la page produit. Deux calculs séparés finissent toujours par
 * diverger : le flux annonçait `backorder` pendant que la page affichait
 * `InStock` sur 141 articles, ce qui est exactement le genre d'écart qui fait
 * refuser un compte pour « informations trompeuses ».
 *
 * Les deux fonctions ci-dessous partent donc du même `stockStatus` interne et
 * doivent rester alignées ligne à ligne.
 */

/** stockStatus interne → valeur `availability` du flux Google Merchant. */
export function merchantAvailability(
  status: string | undefined | null,
): "in_stock" | "backorder" | "out_of_stock" {
  if (status === "out_of_stock" || status === "discontinued") return "out_of_stock";
  if (status === "on_order") return "backorder";
  return "in_stock";
}

/** Même statut, exprimé en URL Schema.org pour le JSON-LD de la page produit. */
export function schemaAvailability(status: string | undefined | null): string {
  switch (merchantAvailability(status)) {
    case "out_of_stock":
      return "https://schema.org/OutOfStock";
    case "backorder":
      return "https://schema.org/BackOrder";
    default:
      return "https://schema.org/InStock";
  }
}
