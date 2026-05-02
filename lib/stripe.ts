import Stripe from "stripe";

/**
 * Singleton Stripe (server-only).
 * Lance une erreur claire si STRIPE_SECRET_KEY n'est pas configuré.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY non configuré. Ajoute la clé dans .env.local et sur Vercel."
    );
  }

  _stripe = new Stripe(key, {
    typescript: true,
    // apiVersion par défaut = la plus récente compatible avec la lib installée
  });

  return _stripe;
}

/**
 * Indique si Stripe est configuré (pour afficher des messages adaptés au front).
 */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Helper : convertit un montant EUR (ex. 2890.50) en centimes (ex. 289050)
 * pour les Stripe API qui attendent l'unité minimale de la devise.
 */
export function eurosToCents(amount: number): number {
  return Math.round(amount * 100);
}
