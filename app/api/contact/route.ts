import { NextResponse } from "next/server";
import { rateLimitResponse, isHoneypotTriggered, csrfOriginCheck } from "@/lib/rate-limit";
import { getPayloadClient } from "@/lib/payload-client";
import { confirmCustomerContact, notifyInternalContact } from "@/lib/email";
import { clip, hasLink, oneLine } from "@/lib/form-text";
import { errorInfo } from "@/lib/log-error";
import { CONTACT_SUBJECTS } from "@/collections/ContactMessages";

interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBJECTS: readonly string[] = CONTACT_SUBJECTS.map((s) => s.value);

/**
 * Champs du formulaire, bornés comme dans /api/rdv/book. Nom, e-mail,
 * téléphone et sujet tiennent sur une ligne : le nom et le sujet partent dans
 * le sujet de la notification interne.
 */
function read(body: Record<string, unknown>): ContactPayload {
  return {
    name: oneLine(body.name, 120),
    email: oneLine(body.email, 160),
    phone: oneLine(body.phone, 40),
    subject: oneLine(body.subject, 40),
    message: clip(body.message, 2000),
  };
}

function validate(payload: ContactPayload, consent: unknown): string | null {
  if (payload.name.length < 2) {
    return "Merci d'indiquer votre nom.";
  }
  if (hasLink(payload.name)) {
    return "Indiquez votre nom sans adresse web ni e-mail.";
  }
  if (!EMAIL_RE.test(payload.email)) {
    return "Cette adresse e-mail ne semble pas valide. Pouvez-vous la vérifier ?";
  }
  if (!SUBJECTS.includes(payload.subject)) {
    return "Merci de choisir le sujet de votre message.";
  }
  if (payload.message.length < 10) {
    return "Votre message est un peu court : décrivez votre demande en quelques mots (10 caractères au moins).";
  }
  if (consent !== true) {
    return "Merci de cocher la case d'accord : sans elle, nous ne pouvons pas enregistrer votre message.";
  }
  return null;
}

/**
 * Reçoit les messages du formulaire de contact : enregistrement dans Payload
 * (collection ContactMessages), notification interne par Resend et accusé de
 * réception au visiteur.
 */
export async function POST(request: Request) {
  // 1. CSRF check : Origin ou Referer doit correspondre à notre site
  const csrf = csrfOriginCheck(request);
  if (csrf) return csrf;

  // 2. Rate limit anti-spam (5 requêtes / heure / IP, cf. audit §3.BLOQUANT.2)
  const limited = rateLimitResponse(request, { routeKey: "contact", max: 5 });
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Votre message n'a pas pu être lu. Rechargez la page et réessayez." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Votre message n'a pas pu être lu. Rechargez la page et réessayez." }, { status: 400 });
  }

  // 2. Honeypot
  if (isHoneypotTriggered(body)) {
    console.warn("[contact] honeypot triggered, dropping silently");
    return NextResponse.json({ ok: true });
  }

  // 3. Validation métier
  const message = read(body);
  const error = validate(message, body.consent);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  // Aucune donnée du client dans les logs : le sujet est une valeur de la liste.
  console.log("[contact] new message", {
    subject: message.subject,
    timestamp: new Date().toISOString(),
  });

  // 4. Sauvegarde Payload (collection ContactMessages). Ne bloque pas
  // l'envoi de l'email si la base est injoignable. Cast subject vers
  // l'union type stricte (validé par la liste CONTACT_SUBJECTS).
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "contact-messages",
      overrideAccess: true, // création serveur de confiance (REST public verrouillé côté collection)
      data: {
        name: message.name,
        email: message.email,
        phone: message.phone,
        subject: message.subject as never,
        message: message.message,
        consent: true,
        status: "new",
      } as never,
    });
  } catch (err) {
    console.error("[contact] payload save failed", errorInfo(err));
  }

  // 5. Notification email staff (info@awlest.com) et accusé de réception au
  // visiteur, en parallèle : l'un ne bloque pas l'autre.
  await Promise.allSettled([
    notifyInternalContact({
      name: message.name,
      email: message.email,
      phone: message.phone || undefined,
      subject: message.subject,
      message: message.message,
    }),
    confirmCustomerContact({ name: message.name, email: message.email }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
