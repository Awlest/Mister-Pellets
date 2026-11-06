import { NextResponse } from "next/server";
import { rateLimitResponse, isHoneypotTriggered, csrfOriginCheck } from "@/lib/rate-limit";
import { getPayloadClient } from "@/lib/payload-client";
import { notifyInternalQuote, confirmCustomerQuote } from "@/lib/email";
import { clip, hasLink, oneLine } from "@/lib/form-text";
import { errorInfo } from "@/lib/log-error";
import { QUOTE_OPTIONS } from "@/collections/Quotes";

type Choice = keyof typeof QUOTE_OPTIONS;

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
  phone: string;
  message: string;
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

/** Questions à choix : la réponse doit figurer dans la liste de la collection Quotes. */
const CHOICES: Choice[] = ["surface", "peb", "chimney", "style", "budget", "delay"];

const isChoice = (key: Choice, value: string): boolean =>
  QUOTE_OPTIONS[key].some((o) => o.value === value);

/** Champs du formulaire, bornés comme dans /api/rdv/book, le nom sur une ligne. */
function read(body: Record<string, unknown>): QuotePayload {
  return {
    surface: oneLine(body.surface, 40),
    peb: oneLine(body.peb, 40),
    chimney: oneLine(body.chimney, 40),
    style: oneLine(body.style, 40),
    budget: oneLine(body.budget, 40),
    delay: oneLine(body.delay, 40),
    postalCode: oneLine(body.postalCode, 10),
    name: oneLine(body.name, 120),
    email: oneLine(body.email, 160),
    phone: oneLine(body.phone, 40),
    message: clip(body.message, 2000),
  };
}

function validate(payload: QuotePayload, consent: unknown): string | null {
  for (const key of CHOICES) {
    if (!isChoice(key, payload[key])) {
      return `Champ manquant : ${key}`;
    }
  }
  if (payload.name.length < 2) {
    return "Champ manquant : name";
  }
  if (hasLink(payload.name)) {
    return "Indiquez votre nom sans adresse web ni e-mail.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return "Cette adresse e-mail ne semble pas valide. Pouvez-vous la vérifier ?";
  }
  if (!/^[1-9]\d{3}$/.test(payload.postalCode)) {
    return "Ce code postal ne semble pas belge : il compte 4 chiffres, entre 1000 et 9999.";
  }
  // Téléphone belge requis (V1.3 audit §3.H.3)
  if (!isValidBelgianPhone(payload.phone)) {
    return "Merci d'indiquer un numéro de téléphone belge, par exemple 0470 12 34 56 ou +32 470 12 34 56.";
  }
  if (consent !== true) {
    return "Merci de cocher la case d'accord : sans elle, nous ne pouvons pas enregistrer votre demande.";
  }
  return null;
}

/**
 * Reçoit les demandes de devis du formulaire 6 étapes : enregistrement dans
 * Payload (collection Quotes), notification interne par Resend et e-mail de
 * confirmation au client.
 */
export async function POST(request: Request) {
  // 1. CSRF check : Origin ou Referer doit correspondre à notre site
  const csrf = csrfOriginCheck(request);
  if (csrf) return csrf;

  // 2. Rate limit anti-spam (5 requêtes / heure / IP, cf. audit §3.BLOQUANT.2)
  const limited = rateLimitResponse(request, { routeKey: "quote", max: 5 });
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Votre demande n'a pas pu être lue. Rechargez la page et réessayez." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Votre demande n'a pas pu être lue. Rechargez la page et réessayez." }, { status: 400 });
  }

  // 2. Honeypot : si un champ caché est rempli, c'est un bot. Renvoyer 200
  // pour ne pas l'aider à apprendre, mais ne rien traiter.
  if (isHoneypotTriggered(body)) {
    console.warn("[quote] honeypot triggered, dropping silently");
    return NextResponse.json({ ok: true });
  }

  // 3. Validation métier
  const quote = read(body);
  const error = validate(quote, body.consent);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // Aucune donnée du client dans les logs : seulement les réponses à choix.
  console.log("[quote] new request", {
    surface: quote.surface,
    budget: quote.budget,
    delay: quote.delay,
    timestamp: new Date().toISOString(),
  });

  // 4. Sauvegarde Payload (collection Quotes) — leadtracking. Si la base est
  // injoignable, on ne bloque pas l'envoi de l'email pour ne pas perdre
  // le lead. On log l'erreur et on continue. Les valeurs des enums (surface,
  // peb, etc.) sont validées par les listes de QUOTE_OPTIONS, on cast pour
  // satisfaire les types Payload générés.
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "quotes",
      overrideAccess: true, // création serveur de confiance (REST public verrouillé côté collection)
      data: {
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        postalCode: quote.postalCode,
        surface: quote.surface as never,
        peb: quote.peb as never,
        chimney: quote.chimney as never,
        style: quote.style as never,
        budget: quote.budget as never,
        delay: quote.delay as never,
        message: quote.message,
        consent: true,
        status: "new",
      } as never,
    });
  } catch (err) {
    console.error("[quote] payload save failed", errorInfo(err));
    // On n'arrête pas le flux : le lead part quand même par e-mail.
  }

  // 5. Notifications email (Resend) en parallèle. Si Resend non configuré,
  // le helper bascule sur console fallback (cf. lib/email.ts).
  await Promise.allSettled([
    notifyInternalQuote({
      name: quote.name,
      email: quote.email,
      phone: quote.phone || undefined,
      postalCode: quote.postalCode,
      surface: quote.surface,
      peb: quote.peb,
      chimney: quote.chimney,
      style: quote.style,
      budget: quote.budget,
      delay: quote.delay,
      message: quote.message || undefined,
    }),
    confirmCustomerQuote({ name: quote.name, email: quote.email }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
