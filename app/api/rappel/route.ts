import { NextResponse } from "next/server";
import { rateLimitResponse, isHoneypotTriggered, csrfOriginCheck } from "@/lib/rate-limit";
import { getPayloadClient } from "@/lib/payload-client";
import { notifyInternalCallback } from "@/lib/email";
import {
  CALLBACK_NO_EMAIL,
  isValidBelgianPhone,
  isValidEmail,
  isValidPostalCode,
  situationLabel,
} from "@/lib/callback";

interface CallbackPayload {
  name: string;
  phone: string;
  email?: string;
  postalCode?: string;
  situation?: string;
  origin?: string;
  consent: boolean;
}

/** Champ facultatif : absent ou vide, il est ignoré ; rempli, il doit être valide. */
const filled = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";

function validate(body: Partial<CallbackPayload>): string | null {
  if (typeof body.name !== "string" || body.name.trim().length < 2) return "Merci d'indiquer votre nom.";
  if (typeof body.phone !== "string" || !isValidBelgianPhone(body.phone)) {
    return "Merci d'indiquer un numéro de téléphone belge, par exemple 0470 12 34 56 ou +32 470 12 34 56.";
  }
  // Le formulaire ne demande plus que le nom et le téléphone. Une page restée
  // en cache peut encore envoyer l'e-mail, le code postal et la cheminée : ils
  // restent acceptés, et vérifiés quand ils sont remplis.
  if (filled(body.email) && !isValidEmail(body.email)) return "Cette adresse e-mail ne semble pas valide. Pouvez-vous la vérifier ?";
  if (filled(body.postalCode) && !isValidPostalCode(body.postalCode)) {
    return "Ce code postal ne semble pas belge : il compte 4 chiffres.";
  }
  if (filled(body.situation) && !situationLabel(body.situation)) {
    return "Merci de choisir une réponse pour la cheminée.";
  }
  if (body.consent !== true) return "Merci de cocher la case d'accord : sans elle, nous ne pouvons pas enregistrer votre demande.";
  return null;
}

/**
 * Demande de rappel de /prix-poele-pellets. Rangée avec les messages de
 * contact (sujet « Pose / installation ») pour ne pas toucher au schéma de la
 * base (sans e-mail : voir CALLBACK_NO_EMAIL), et notifiée à l'adresse interne
 * des demandes. Les logs ne gardent qu'un libellé
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
    return NextResponse.json({ error: "Votre demande n'a pas pu être lue. Rechargez la page et réessayez." }, { status: 400 });
  }

  if (isHoneypotTriggered(body as Record<string, unknown>)) {
    console.warn("[rappel] honeypot triggered, dropping silently");
    return NextResponse.json({ ok: true });
  }

  const error = validate(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const name = body.name!.trim();
  const phone = body.phone!.trim();
  const email = filled(body.email) ? body.email.trim() : undefined;
  const postalCode = filled(body.postalCode) ? body.postalCode.trim() : undefined;
  const situation = filled(body.situation) ? situationLabel(body.situation) : undefined;
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
        email: email ?? CALLBACK_NO_EMAIL,
        phone,
        subject: "info-pose",
        message: [
          "Demande de rappel pour un prix posé (page Prix d'un poêle à pellets posé).",
          email ? null : "Pas d'e-mail demandé : rappeler au téléphone.",
          postalCode ? `Code postal : ${postalCode}` : null,
          situation ? `Évacuation des fumées : ${situation}` : null,
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
      { error: "Votre demande n'a pas pu être envoyée. Réessayez dans un instant, ou appelez-nous au 081 13 83 09." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
