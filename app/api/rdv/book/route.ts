import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimitResponse, csrfOriginCheck, isHoneypotTriggered } from "@/lib/rate-limit";
import { getService } from "@/lib/services";
import { availableSlots, formatSlotTime, belgianDayKey } from "@/lib/booking";
import { getBusyIntervals, createEvent, isCalendarConfigured } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

function durationFor(slug: string): number {
  return slug === "visite-showroom" ? 45 : 60;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max = 500): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * Enregistre un rendez-vous commercial dans l'agenda de Dorian.
 *
 * Le créneau est REVALIDÉ ici contre l'agenda réel avant création. Le
 * navigateur a beau avoir affiché une liste de créneaux, rien ne garantit
 * qu'ils soient encore libres au moment de l'envoi — ni que le client n'ait
 * pas modifié la requête. La disponibilité affichée n'est qu'un confort ; la
 * seule vérification qui fait foi est celle-ci.
 */
export async function POST(request: Request) {
  const csrf = csrfOriginCheck(request);
  if (csrf) return csrf;

  const limited = rateLimitResponse(request, { routeKey: "rdv-book", max: 10 });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  if (isHoneypotTriggered(payload)) {
    // On répond comme si tout allait bien : inutile de renseigner un robot.
    return NextResponse.json({ ok: true });
  }

  const slug = str(payload.service, 60);
  const service = getService(slug);
  if (!service || service.booking !== "online") {
    return NextResponse.json(
      { error: "Ce service ne se réserve pas en ligne. Appelez le 081 13 83 09." },
      { status: 400 },
    );
  }

  const startInstant = Number(payload.start);
  if (!Number.isFinite(startInstant)) {
    return NextResponse.json({ error: "Créneau invalide." }, { status: 400 });
  }

  const name = str(payload.name, 120);
  const email = str(payload.email, 160);
  const phone = str(payload.phone, 40);
  const address = str(payload.address, 200);
  const notes = str(payload.notes, 1000);

  if (name.length < 2) {
    return NextResponse.json({ error: "Merci d'indiquer votre nom." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (service.location === "domicile" && address.length < 5) {
    return NextResponse.json(
      { error: "Merci d'indiquer l'adresse de la visite." },
      { status: 400 },
    );
  }

  if (!isCalendarConfigured()) {
    return NextResponse.json(
      {
        error:
          "La réservation en ligne n'est pas encore active. Appelez le 081 13 83 09, on cale un créneau tout de suite.",
      },
      { status: 503 },
    );
  }

  const durationMin = durationFor(slug);
  const endInstant = startInstant + durationMin * 60000;

  try {
    // Revalidation : le créneau demandé doit toujours figurer parmi les
    // créneaux réellement disponibles au moment présent.
    const now = Date.now();
    const busy = await getBusyIntervals(now, startInstant + 7 * 86400000);
    const stillFree = availableSlots(now, durationMin, busy).some(
      (s) => s.start === startInstant,
    );
    if (!stillFree) {
      return NextResponse.json(
        {
          error:
            "Ce créneau vient d'être pris ou n'est plus disponible. Choisissez-en un autre.",
          code: "SLOT_TAKEN",
        },
        { status: 409 },
      );
    }

    const locationLabel =
      service.location === "showroom"
        ? "Showroom Mister Pellets, Rue des Fagotis 3A, 5380 Fernelmont"
        : "À domicile";

    const event = await createEvent({
      serviceName: service.name,
      startInstant,
      endInstant,
      customerName: name,
      customerEmail: email,
      customerPhone: phone || undefined,
      address: service.location === "domicile" ? address : undefined,
      notes: notes || undefined,
      locationLabel,
    });

    const dayKey = belgianDayKey(startInstant);
    const timeLabel = formatSlotTime(startInstant);

    // Notification interne. L'invitation client part déjà via Google Agenda
    // (sendUpdates=all) : cet email prévient l'équipe, il n'est pas critique.
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.MAIL_FROM ?? "Mister Pellets <info@awlest.com>",
          to: process.env.MAIL_TO ?? "info@awlest.com",
          replyTo: email,
          subject: `Nouveau RDV : ${service.name} — ${dayKey} à ${timeLabel}`,
          text: [
            `${service.name}`,
            `${dayKey} à ${timeLabel} (${durationMin} min)`,
            ``,
            `Client : ${name}`,
            `Email : ${email}`,
            phone ? `Téléphone : ${phone}` : null,
            address ? `Adresse : ${address}` : null,
            notes ? `\nPrécisions :\n${notes}` : null,
            ``,
            `Réservé depuis mister-pellets.be, ajouté à l'agenda.`,
          ]
            .filter((l) => l !== null)
            .join("\n"),
        });
      } catch (mailError) {
        // Le rendez-vous est déjà dans l'agenda : un email de notification
        // qui échoue ne doit pas faire croire au client que ça n'a pas marché.
        console.error("[rdv/book] notification email", mailError);
      }
    }

    return NextResponse.json({
      ok: true,
      eventId: event.id,
      date: dayKey,
      time: timeLabel,
      durationMin,
    });
  } catch (e) {
    console.error("[rdv/book]", e);
    return NextResponse.json(
      {
        error:
          "La réservation n'a pas pu aboutir. Appelez le 081 13 83 09, on cale votre créneau directement.",
      },
      { status: 502 },
    );
  }
}
