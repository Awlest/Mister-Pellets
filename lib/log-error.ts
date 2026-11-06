/**
 * Ce qu'un log serveur garde d'une erreur : son nom et son code technique,
 * jamais son message ni l'objet entier. Le message d'une erreur de requête
 * Drizzle reprend la requête et ses paramètres, donc le nom, l'e-mail et le
 * téléphone du client au moment d'enregistrer un lead ; celui d'une erreur
 * Google peut citer le compte de service ou l'agenda.
 *
 * Le code vient de `err.cause.code` : code PostgreSQL ou réseau sous une
 * erreur Drizzle, étape et statut HTTP pour les appels Google
 * (lib/google-calendar.ts).
 */
export function errorInfo(err: unknown): { name: string; code?: string | number } {
  if (!(err instanceof Error)) return { name: typeof err };
  const cause: unknown = err.cause;
  const code =
    cause && typeof cause === "object" && "code" in cause ? (cause as { code?: unknown }).code : undefined;
  return typeof code === "string" || typeof code === "number" ? { name: err.name, code } : { name: err.name };
}
