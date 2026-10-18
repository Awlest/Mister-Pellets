import { NextResponse } from "next/server";
import { rateLimitResponse, isHoneypotTriggered, csrfOriginCheck } from "@/lib/rate-limit";
import { getPayloadClient } from "@/lib/payload-client";
import { notifyInternalCallback } from "@/lib/email";
import {
  isValidBelgianPhone,
  isValidEmail,
  isValidPostalCode,
  situationLabel,
} from "@/lib/callback";

interface CallbackPayload {
  name: string;
  phone: string;
  email: string;
  postalCode: string;
  situation: string;
  origin?: string;
  consent: boolean;
}

function validate(body: Partial<CallbackPayload>): string | null {
  if (typeof body.name !== "string" || body.name.trim().length < 2) return "Indiquez votre nom.";
  if (typeof body.phone !== "string" || !isValidBelgianPhone(body.phone)) {
    return "Téléphone belge requis (formats : 0470 12 34 56 ou +32 470 12 34 56).";
  }
  if (typeof body.email !== "string" || !isValidEmail(body.email)) return "E-mail invalide.";
  if (typeof body.postalCode !== "string" || !isValidPostalCode(body.postalCode)) {
    return "Code postal belge invalide (4 chiffres).";
  }
  if (typeof body.situation !== "string" || !situationLabel(body.situation)) {
    return "Dites-nous si vous avez une cheminée.";
  }
  if (body.consent !== true) return "Le consentement est obligatoire.";
  return null;
}

/**
 * Demande de rappel de /prix-poele-pellets. Rangée avec les messages de
 * contact (sujet « Pose / installation ») pour ne pas toucher au schéma de la
 * base, et notifiée à info@awlest.com. Les logs ne gardent qu'un libellé
 * technique, jamais de donnée du client.
 */
export async function POST(request: Request) {
  const csrf = csrfOriginCheck(request);
  if (csrf) return csrf;

  const limited = rateLimitResponse(request, { routeKey: "rappel", max: 5 });
  if (limited) return limited;

  let body: Partial<CallbackPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  if (isHoneypotTriggered(body as Record<string, unknown>)) {
    console.warn("[rappel] honeypot triggered, dropping silently");
    return NextResponse.json({ ok: true });
  }

  const error = validate(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const name = body.name!.trim();
  const phone = body.phone!.trim();
  const email = body.email!.trim();
  const postalCode = body.postalCode!.trim();
  const situation = situationLabel(body.situation!)!;
  // Origine de la visite (utm_campaign, présence d'un gclid), lue par le
  // formulaire dans l'adresse de la page d'arrivée. Bornée et sans balise.
  const origin =
    typeof body.origin === "string" && body.origin.length > 0
      ? body.origin.replace(/[<>]/g, "").slice(0, 120)
      : undefined;

  console.log("[rappel] new request", { timestamp: new Date().toISOString() });

  let saved = false;
  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: "contact-messages",
      overrideAccess: true,
      data: {
        name,
        email,
        phone,
        subject: "info-pose",
        message: [
          "Demande de rappel pour un prix posé (page Prix d'un poêle à pellets posé).",
          `Code postal : ${postalCode}`,
          `Évacuation des fumées : ${situation}`,
          origin ? `Origine : ${origin}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        consent: true,
        status: "new",
      } as never,
    });
    saved = true;
  } catch (err) {
    console.error("[rappel] payload save failed", err);
  }

  const sent = await notifyInternalCallback({ name, email, phone, postalCode, situation, origin });
  if (!sent.ok) console.error("[rappel] notification failed");

  // Ni rangée ni envoyée : la demande serait perdue, le visiteur doit le savoir.
  if (!saved && !sent.ok) {
    return NextResponse.json(
      { error: "Envoi impossible pour le moment. Appelez-nous au 081 13 83 09." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
