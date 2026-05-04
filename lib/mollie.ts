import createMollieClient, { MollieClient } from "@mollie/api-client";

/**
 * Singleton Mollie (server-only).
 * Mollie remplace Stripe (V1.6) pour profiter du forfait fixe Bancontact à
 * 0,39 € en Belgique (vs 1,4 % + 0,25 € chez Stripe). Sur un poêle à 5 000 €,
 * économie de ~70 € par transaction Bancontact.
 *
 * Lance une erreur claire si MOLLIE_API_KEY n'est pas configuré.
 */

let _mollie: MollieClient | null = null;

export function getMollie(): MollieClient {
  if (_mollie) return _mollie;

  const key = process.env.MOLLIE_API_KEY;
  if (!key) {
    throw new Error(
      "MOLLIE_API_KEY non configuré. Ajoute la clé dans .env.local et sur Vercel.",
    );
  }

  _mollie = createMollieClient({ apiKey: key });
  return _mollie;
}

/**
 * Indique si Mollie est configuré (pour afficher des messages adaptés au front).
 */
export function isMollieConfigured(): boolean {
  return Boolean(process.env.MOLLIE_API_KEY);
}

/**
 * Helper : formate un montant EUR pour l'API Mollie (string avec 2 décimales).
 * Mollie attend un objet `{ value: "29.95", currency: "EUR" }`.
 */
export function formatMollieAmount(amount: number): { value: string; currency: "EUR" } {
  return {
    value: amount.toFixed(2),
    currency: "EUR",
  };
}
