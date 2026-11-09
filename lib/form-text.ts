/**
 * Mise en forme des champs texte des formulaires publics, avant qu'ils
 * n'arrivent en base, dans l'agenda ou dans le sujet d'un e-mail. Pas de
 * dépendance : le navigateur (lib/visit-address.ts) s'en sert aussi.
 */

/** Une ligne : contrôles et sauts de ligne remplacés par une espace, blancs resserrés. */
export function oneLine(v: unknown, max: number): string {
  return typeof v === "string"
    ? v.replace(/\p{Cc}+/gu, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

/** Texte libre borné (message, précisions) : les retours à la ligne restent. */
export function clip(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * Adresse web ou e-mail glissée dans un nom, une rue ou une commune : c'est
 * ainsi qu'un robot fait porter son lien par nos e-mails de confirmation
 * (« Bonjour <nom>, ») et par l'agenda. Le « / » reste permis : « 12/3 » est
 * un numéro de boîte.
 */
export function hasLink(v: string): boolean {
  return /:\/\/|www\.|http|@/i.test(v);
}
