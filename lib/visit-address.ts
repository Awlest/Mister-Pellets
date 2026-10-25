/**
 * Adresse de la visite à domicile, vérifiée pareil dans le navigateur et dans
 * la route /api/rdv/book. Trois champs séparés plutôt qu'une zone libre : un
 * seul champ « Rue, numéro, code postal, commune » acceptait n'importe quel
 * texte de 5 caractères, sans garantie d'avoir le code postal.
 */
export interface VisitAddress {
  street: string;
  postalCode: string;
  city: string;
}

/** Code postal belge : 4 chiffres, de 1000 à 9999. */
export const POSTAL_RE = /^[1-9]\d{3}$/;

/** Une ligne : contrôles et sauts de ligne remplacés par une espace, blancs resserrés. */
function oneLine(v: unknown, max: number): string {
  return typeof v === "string"
    ? v.replace(/\p{Cc}+/gu, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

export function readVisitAddress(raw: Record<string, unknown>): VisitAddress {
  return {
    street: oneLine(raw.street, 150),
    postalCode: oneLine(raw.postalCode, 10).replace(/\s/g, ""),
    city: oneLine(raw.city, 80),
  };
}

/** Premier problème trouvé, ou null si l'adresse est complète. */
export function visitAddressError(a: VisitAddress): string | null {
  if (a.street.length < 4) return "Merci d'indiquer la rue et le numéro de la visite.";
  if (!POSTAL_RE.test(a.postalCode)) return "Le code postal belge compte 4 chiffres.";
  if (a.city.length < 2) return "Merci d'indiquer la commune de la visite.";
  return null;
}

/** Sur une ligne, ex. « Rue des Fagotis 3A, 5380 Fernelmont ». */
export function formatVisitAddress(a: VisitAddress): string {
  return `${a.street}, ${a.postalCode} ${a.city}`;
}
