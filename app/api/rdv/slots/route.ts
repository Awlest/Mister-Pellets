import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { getService, ONLINE_SERVICES } from "@/lib/services";
import { availableSlots, belgianDayKey, formatSlotTime, bookingWindow } from "@/lib/booking";
import { getBusyIntervals, isCalendarConfigured } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

/** Durée d'un rendez-vous, en minutes, déduite du libellé du service. */
function durationFor(slug: string): number {
  return slug === "visite-showroom" ? 45 : 60;
}

/**
 * Créneaux disponibles pour un service réservable en ligne.
 *
 * Ne renvoie que des intervalles : le contenu de l'agenda de Dorian n'est
 * jamais exposé, seulement le fait qu'un créneau soit libre ou non.
 */
export async function GET(request: Request) {
  const limited = rateLimitResponse(request, { routeKey: "rdv-slots", max: 60 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("service") ?? "";

  const service = getService(slug);
  if (!service || service.booking !== "online") {
    return NextResponse.json(
      {
        error:
          "Ce service ne se réserve pas en ligne. Entretien, ramonage et dépannage se prennent par téléphone au 081 13 83 09.",
      },
      { status: 400 },
    );
  }

  if (!isCalendarConfigured()) {
    return NextResponse.json(
      { configured: false, days: [] },
      { status: 200 },
    );
  }

  const now = Date.now();
  const { from, to } = bookingWindow(now);

  try {
    const busy = await getBusyIntervals(from, to);
    const slots = availableSlots(now, durationFor(slug), busy);

    // Regroupement par jour, pour que l'interface affiche un calendrier.
    const byDay = new Map<string, Array<{ start: number; label: string }>>();
    for (const s of slots) {
      const key = belgianDayKey(s.start);
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push({ start: s.start, label: formatSlotTime(s.start) });
    }

    return NextResponse.json({
      configured: true,
      durationMin: durationFor(slug),
      days: [...byDay.entries()].map(([date, times]) => ({ date, times })),
    });
  } catch (e) {
    // On ne renvoie jamais le détail Google au navigateur : il peut contenir
    // l'adresse du compte de service ou l'identifiant de l'agenda.
    console.error("[rdv/slots]", e);
    return NextResponse.json(
      {
        error:
          "Impossible de lire les disponibilités pour le moment. Appelez le 081 13 83 09, on cale un créneau tout de suite.",
      },
      { status: 502 },
    );
  }
}
