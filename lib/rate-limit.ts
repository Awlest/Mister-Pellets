import { NextResponse } from "next/server";

/**
 * Rate limiting in-memory simple pour les endpoints publics
 * (cf. audit V20260503 §3.BLOQUANT.2).
 *
 * Limite par IP : 5 requêtes par fenêtre glissante de 60 minutes par défaut.
 *
 * Limites de cette implémentation :
 * - In-memory : ne tient pas en cluster (chaque instance Vercel a son propre
 *   compteur). Pour une protection cluster-wide, migrer vers @upstash/ratelimit
 *   + Vercel KV ou Redis.
 * - Pas de persistence : redémarrage Vercel reset les compteurs.
 *
 * Pour le besoin actuel (anti-spam basique sur formulaires de devis et
 * contact, ~10 leads par jour attendus), c'est suffisant. Le honeypot
 * complémentaire bloque les bots non-humains.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

// Clé : `${routeKey}:${ip}` → Bucket
const buckets = new Map<string, Bucket>();

// Cleanup périodique pour éviter croissance mémoire infinie
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 min
let cleanupTimer: NodeJS.Timeout | null = null;
function ensureCleanupRunning() {
  if (cleanupTimer) return;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  // Permet à Node de quitter même avec ce timer actif
  timer.unref?.();
  cleanupTimer = timer;
}

/**
 * Extrait l'IP client depuis les headers de requête (Vercel, Combell, dev).
 * Fallback sur 'unknown' si rien trouvé (compteur partagé pour ces requêtes).
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0];
    if (first) return first.trim();
  }
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

interface RateLimitOptions {
  /** Identifiant unique de la route (ex. "quote", "contact"). */
  routeKey: string;
  /** Nombre max de requêtes autorisées dans la fenêtre. Défaut 5. */
  max?: number;
  /** Durée de la fenêtre en ms. Défaut 60 minutes. */
  windowMs?: number;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  request: Request,
  options: RateLimitOptions,
): RateLimitResult {
  ensureCleanupRunning();
  const max = options.max ?? 5;
  const windowMs = options.windowMs ?? 60 * 60 * 1000;
  const ip = getClientIp(request);
  const key = `${options.routeKey}:${ip}`;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const ok = bucket.count <= max;
  return { ok, remaining: Math.max(0, max - bucket.count), resetAt: bucket.resetAt };
}

/**
 * Helper qui renvoie une NextResponse 429 prête à renvoyer si la limite est
 * dépassée, ou null si la requête peut continuer.
 */
export function rateLimitResponse(
  request: Request,
  options: RateLimitOptions,
): NextResponse | null {
  const result = checkRateLimit(request, options);
  if (result.ok) return null;
  const retryAfterSec = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return NextResponse.json(
    {
      error:
        "Trop de requêtes envoyées depuis cette adresse. Merci de réessayer dans quelques minutes ou de nous contacter par téléphone au 0472 04 32 22.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
      },
    },
  );
}

/**
 * Vérification honeypot : un champ caché côté client qui doit rester vide.
 * Tout bot qui remplit aveuglément les inputs sera détecté.
 *
 * Usage côté client : ajouter un input texte invisible (CSS) avec un nom
 * trompeur (ex. "website") et autocomplete="off" tabIndex=-1.
 *
 * Usage côté serveur : passer le payload reçu, retourne true si suspect.
 */
export function isHoneypotTriggered(payload: Record<string, unknown>): boolean {
  // Champs honeypot qu'on accepte côté serveur (à synchroniser avec côté client)
  const HONEYPOT_FIELDS = ["website", "url", "company_url"];
  for (const field of HONEYPOT_FIELDS) {
    const v = payload[field];
    if (typeof v === "string" && v.trim().length > 0) return true;
  }
  return false;
}
