import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { getService, bookingDurationMin } from "@/lib/services";
import { bookingCalendarEntry, buildIcs } from "@/lib/booking-calendar";

export const dynamic = "force-dynamic";

const MIN_INSTANT = Date.UTC(2026, 0, 1);
const MAX_INSTANT = Date.UTC(2100, 0, 1);

/**
 * Fichier .ics d'un rendez-vous, pour l'ajouter à Apple Calendar, Outlook ou
 * tout autre agenda. Lien de l'écran de confirmation et de l'e-mail.
 *
 * La requête ne porte que le service et l'instant de début, jamais de donnée
 * du client : le fichier est reconstruit ici, identique pour tout le monde.
 * Il ne prouve pas qu'un rendez-vous existe, il ne fait que le décrire.
 */
export async function GET(request: Request) {
  const limited = rateLimitResponse(request, { routeKey: "rdv-ics", max: 30 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const service = getService(searchParams.get("service") ?? "");
  const start = Number(searchParams.get("start"));

  if (!service || service.booking !== "online") {
    return NextResponse.json({ error: "Service inconnu." }, { status: 400 });
  }
  if (!Number.isSafeInteger(start) || start < MIN_INSTANT || start > MAX_INSTANT) {
    return NextResponse.json({ error: "Créneau invalide." }, { status: 400 });
  }

  const ics = buildIcs(
    bookingCalendarEntry(service, start, bookingDurationMin(service.slug)),
  );

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rendez-vous-mister-pellets.ics"',
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
