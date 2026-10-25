import { NextResponse } from "next/server";
import { rateLimitResponse, isHoneypotTriggered, csrfOriginCheck } from "@/lib/rate-limit";
import { getPayloadClient } from "@/lib/payload-client";
import { confirmCustomerContact, notifyInternalContact } from "@/lib/email";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent: boolean;
}

function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return "[invalid]";
  return `${email.slice(0, 2)}***${email.slice(at)}`;
}
function redactName(name: string): string {
  return name.length > 0 ? `${name.charAt(0)}***` : "[empty]";
}

function validate(payload: Partial<ContactPayload>): string | null {
  if (!payload.name || typeof payload.name !== "string" || payload.name.length < 2) {
    return "Merci d'indiquer votre nom.";
  }
  if (
    !payload.email ||
    typeof payload.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
  ) {
    return "Cette adresse e-mail ne semble pas valide. Pouvez-vous la vérifier ?";
  }
  if (!payload.subject || typeof payload.subject !== "string") {
    return "Merci de choisir le sujet de votre message.";
  }
  if (!payload.message || typeof payload.message !== "string" || payload.message.length < 10) {
    return "Votre message est un peu court : décrivez votre demande en quelques mots (10 caractères au moins).";
  }
  if (payload.consent !== true) {
    return "Merci de cocher la case d'accord : sans elle, nous ne pouvons pas enregistrer votre message.";
  }
  return null;
}

/**
 * Reçoit les messages du formulaire de contact.
 * Phase 5 : envoie un email via Resend + sauvegarde dans Payload (collection ContactMessages).
 * Pour l'instant : log + accepte. On branche l'email plus tard quand RESEND_API_KEY sera configuré.
 */
export async function POST(request: Request) {
  // 1. CSRF check : Origin ou Referer doit correspondre à notre site
  const csrf = csrfOriginCheck(request);
  if (csrf) return csrf;

  // 2. Rate limit anti-spam (5 requêtes / heure / IP, cf. audit §3.BLOQUANT.2)
  const limited = rateLimitResponse(request, { routeKey: "contact", max: 5 });
  if (limited) return limited;

  let body: Partial<ContactPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Votre message n'a pas pu être lu. Rechargez la page et réessayez." }, { status: 400 });
  }

  // 2. Honeypot
  if (isHoneypotTriggered(body as Record<string, unknown>)) {
    console.warn("[contact] honeypot triggered, dropping silently");
    return NextResponse.json({ ok: true });
  }

  // 3. Validation métier
  const error = validate(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // PII redactés dans les logs (cf. audit §3.H.1)
  console.log("[contact] new message", {
    name: redactName(body.name!),
    email: redactEmail(body.email!),
    subject: body.subject,
    timestamp: new Date().toISOString(),
  });

  // 4. Sauvegarde Payload (collection ContactMessages). Ne bloque pas
  // l'envoi de l'email si la base est injoignable. Cast subject vers
  // l'union type stricte (déjà validé par le formulaire + validate()).
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "contact-messages",
      overrideAccess: true, // création serveur de confiance (REST public verrouillé côté collection)
      data: {
        name: body.name!,
        email: body.email!,
        phone: body.phone ?? "",
        subject: body.subject as never,
        message: body.message!,
        consent: true,
        status: "new",
      } as never,
    });
  } catch (err) {
    console.error("[contact] payload save failed", err);
  }

  // 5. Notification email staff (info@awlest.com) et accusé de réception au
  // visiteur, en parallèle : l'un ne bloque pas l'autre.
  await Promise.allSettled([
    notifyInternalContact({
      name: body.name!,
      email: body.email!,
      phone: body.phone ?? undefined,
      subject: body.subject!,
      message: body.message!,
    }),
    confirmCustomerContact({ name: body.name!, email: body.email! }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
