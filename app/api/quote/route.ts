import { NextResponse } from "next/server";
import { rateLimitResponse, isHoneypotTriggered, csrfOriginCheck } from "@/lib/rate-limit";
import { getPayloadClient } from "@/lib/payload-client";
import { notifyInternalQuote, confirmCustomerQuote } from "@/lib/email";

interface QuotePayload {
  surface: string;
  peb: string;
  chimney: string;
  style: string;
  budget: string;
  postalCode: string;
  delay: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  consent: boolean;
}

/**
 * Validation téléphone belge stricte (cf. audit V20260503 §3.H.3) :
 * dupliquée côté serveur même si déjà présente côté client (un script peut
 * poster directement à l'API en bypassant le formulaire React).
 */
function isValidBelgianPhone(input: string): boolean {
  const cleaned = input.replace(/[\s.\-()/]/g, "");
  if (cleaned === "") return false;
  if (/^\+(?!32)/.test(cleaned)) return false;
  if (/^00(?!32)/.test(cleaned)) return false;
  return [
    /^\+32[1-9]\d{7,8}$/,
    /^0032[1-9]\d{7,8}$/,
    /^0[1-9]\d{7,8}$/,
  ].some((re) => re.test(cleaned));
}

/**
 * Logger qui redact les PII (cf. audit V20260503 §3.H.1).
 * Conserve uniquement les premiers caractères pour debug, pas l'identité
 * complète qui se retrouverait dans les logs Vercel.
 */
function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return "[invalid]";
  return `${email.slice(0, 2)}***${email.slice(at)}`;
}
function redactName(name: string): string {
  return name.length > 0 ? `${name.charAt(0)}***` : "[empty]";
}

const REQUIRED_STEPS: (keyof QuotePayload)[] = [
  "surface", "peb", "chimney", "style", "budget", "postalCode", "delay", "name", "email",
];

function validate(payload: Partial<QuotePayload>): string | null {
  for (const key of REQUIRED_STEPS) {
    const v = payload[key];
    if (!v || typeof v !== "string" || v.length === 0) {
      return `Champ manquant : ${key}`;
    }
  }
  if (typeof payload.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return "Email invalide.";
  }
  if (typeof payload.postalCode !== "string" || !/^[1-9]\d{3}$/.test(payload.postalCode)) {
    return "Code postal belge invalide (4 chiffres entre 1000 et 9999).";
  }
  // Téléphone belge requis (V1.3 audit §3.H.3)
  if (!payload.phone || !isValidBelgianPhone(payload.phone)) {
    return "Téléphone belge requis (formats : 0470 12 34 56 ou +32 470 12 34 56).";
  }
  if (payload.consent !== true) {
    return "Le consentement est obligatoire.";
  }
  return null;
}

/**
 * Reçoit les demandes de devis du formulaire 6 étapes.
 * Phase 5 : sauvegarde dans Payload (collection Quotes) + envoi email Resend
 *           à info@awlest.com + email de confirmation client.
 * Pour l'instant : log + accepte. Wiring complet plus tard.
 */
export async function POST(request: Request) {
  // 1. CSRF check : Origin ou Referer doit correspondre à notre site
  const csrf = csrfOriginCheck(request);
  if (csrf) return csrf;

  // 2. Rate limit anti-spam (5 requêtes / heure / IP, cf. audit §3.BLOQUANT.2)
  const limited = rateLimitResponse(request, { routeKey: "quote", max: 5 });
  if (limited) return limited;

  let body: Partial<QuotePayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  // 2. Honeypot : si un champ caché est rempli, c'est un bot. Renvoyer 200
  // pour ne pas l'aider à apprendre, mais ne rien traiter.
  if (isHoneypotTriggered(body as Record<string, unknown>)) {
    console.warn("[quote] honeypot triggered, dropping silently");
    return NextResponse.json({ ok: true });
  }

  // 3. Validation métier
  const error = validate(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // PII redactés dans les logs (cf. audit §3.H.1)
  console.log("[quote] new request", {
    name: redactName(body.name!),
    email: redactEmail(body.email!),
    postalCode: body.postalCode,
    surface: body.surface,
    budget: body.budget,
    delay: body.delay,
    timestamp: new Date().toISOString(),
  });

  // 4. Sauvegarde Payload (collection Quotes) — leadtracking. Si la base est
  // injoignable, on ne bloque pas l'envoi de l'email pour ne pas perdre
  // le lead. On log l'erreur et on continue. Les valeurs des enums (surface,
  // peb, etc.) sont déjà validées en amont par le formulaire client + le
  // validate() serveur, on cast pour satisfaire les types Payload générés.
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "quotes",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        name: body.name!,
        email: body.email!,
        phone: body.phone ?? "",
        postalCode: body.postalCode!,
        surface: body.surface as never,
        peb: body.peb as never,
        chimney: body.chimney as never,
        style: body.style as never,
        budget: body.budget as never,
        delay: body.delay as never,
        message: body.message ?? "",
        consent: true,
        status: "new",
      } as never,
    });
  } catch (err) {
    console.error("[quote] payload save failed", err);
    // On n'arrête pas le flux : le lead reste dans les logs Vercel + email.
  }

  // 5. Notifications email (Resend) en parallèle. Si Resend non configuré,
  // le helper bascule sur console fallback (cf. lib/email.ts).
  await Promise.allSettled([
    notifyInternalQuote({
      name: body.name!,
      email: body.email!,
      phone: body.phone ?? undefined,
      postalCode: body.postalCode!,
      surface: body.surface!,
      peb: body.peb!,
      chimney: body.chimney!,
      style: body.style!,
      budget: body.budget!,
      delay: body.delay!,
      message: body.message ?? undefined,
    }),
    confirmCustomerQuote({ name: body.name!, email: body.email! }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
