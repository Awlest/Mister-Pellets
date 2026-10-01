import { NextResponse } from "next/server";
import { confirmCustomerBooking, notifyInternalBooking } from "@/lib/email";
import { rateLimitResponse, csrfOriginCheck, isHoneypotTriggered } from "@/lib/rate-limit";
import { getService, bookingDurationMin } from "@/lib/services";
import { availableSlots, formatSlotTime, belgianDayKey } from "@/lib/booking";
import {
  getBusyIntervals,
  createEvent,
  deleteEvent,
  isCalendarConfigured,
} from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

/**
 * Le créneau figure-t-il parmi les créneaux réellement libres de l'agenda ?
 * `excludeEventId` : ne pas compter le rendez-vous qu'on vient de créer.
 */
async function isSlotFree(
  now: number,
  startInstant: number,
  durationMin: number,
  excludeEventId?: string,
): Promise<boolean> {
  const busy = await getBusyIntervals(now, startInstant + 7 * 86400000, excludeEventId);
  return availableSlots(now, durationMin, busy).some((s) => s.start === startInstant);
}

function slotTaken() {
  return NextResponse.json(
    {
      error: "Ce créneau vient d'être pris ou n'est plus disponible. Choisissez-en un autre.",
      code: "SLOT_TAKEN",
    },
    { status: 409 },
  );
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

  const durationMin = bookingDurationMin(slug);
  const endInstant = startInstant + durationMin * 60000;

  try {
    // Revalidation : le créneau demandé doit toujours figurer parmi les
    // créneaux réellement disponibles au moment présent.
    const now = Date.now();
    if (!(await isSlotFree(now, startInstant, durationMin))) return slotTaken();

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
      // Le client reçoit la confirmation Mister Pellets ci-dessous, pas
      // l'invitation Google au nom de l'agenda de Dorian.
      sendGoogleInvite: false,
    });

    // Contre-vérification : mister-clim.be écrit dans le même agenda, et
    // l'équipe peut y poser un rendez-vous à tout moment. Si un autre
    // événement est arrivé sur le créneau entre la vérification et la
    // création, on retire le nôtre plutôt que de laisser un doublon. Le
    // client n'a encore rien reçu : suppression sans notification.
    if (!(await isSlotFree(now, startInstant, durationMin, event.id))) {
      await deleteEvent(event.id, { notifyGuests: false });
      return slotTaken();
    }

    const dayKey = belgianDayKey(startInstant);
    const timeLabel = formatSlotTime(startInstant);

    // Confirmation client puis notification interne, toutes deux par
    // lib/email.ts (EMAIL_FROM / EMAIL_TO_QUOTES). sendEmail ne lève pas
    // d'exception et logge lui-même un refus (« [email] envoi refusé ») : le
    // rendez-vous est dans l'agenda, on ne fait pas croire au client que sa
    // réservation a échoué. Si sa confirmation n'est pas partie, la
    // notification interne le dit, pour que l'équipe l'appelle.
    const confirmation = await confirmCustomerBooking({
      service,
      start: startInstant,
      durationMin,
      name,
      email,
      address: service.location === "domicile" ? address : undefined,
    });

    await notifyInternalBooking({
      serviceName: service.name,
      dayKey,
      timeLabel,
      durationMin,
      name,
      email,
      phone: phone || undefined,
      address: address || undefined,
      notes: notes || undefined,
      customerConfirmed: confirmation.ok,
    });

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
