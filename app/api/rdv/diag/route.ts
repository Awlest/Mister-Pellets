import { NextResponse } from "next/server";
import { getBusyIntervals, isCalendarConfigured } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

/**
 * Diagnostic TEMPORAIRE de la configuration Google Agenda.
 *
 * Ne renvoie que des booléens, des longueurs et le message d'erreur renvoyé
 * par Google : aucune valeur de variable, aucun fragment de clé privée.
 *
 * ⚠️ À SUPPRIMER une fois la réservation opérationnelle.
 */
export async function GET() {
  const email = process.env.GOOGLE_SA_EMAIL ?? "";
  const key = process.env.GOOGLE_SA_PRIVATE_KEY ?? "";
  const calendar = process.env.GOOGLE_CALENDAR_ID ?? "";
  const subject = process.env.GOOGLE_SA_SUBJECT ?? "";
  const restored = key.replace(/\\n/g, "\n");

  const variables = {
    GOOGLE_SA_EMAIL: {
      present: email.length > 0,
      longueur: email.length,
      formatAttendu: email.endsWith(".iam.gserviceaccount.com"),
    },
    GOOGLE_SA_PRIVATE_KEY: {
      present: key.length > 0,
      longueur: key.length,
      debutAttendu: restored.startsWith("-----BEGIN PRIVATE KEY-----"),
      finAttendue: restored.trimEnd().endsWith("-----END PRIVATE KEY-----"),
      sautsDeLigne: (restored.match(/\n/g) ?? []).length,
    },
    GOOGLE_CALENDAR_ID: {
      present: calendar.length > 0,
      longueur: calendar.length,
    },
    GOOGLE_SA_SUBJECT: {
      present: subject.length > 0,
      mode: subject.length > 0 ? "délégation domaine" : "partage d'agenda",
    },
  };

  // Appel réel : c'est la seule façon de distinguer une clé invalide d'un
  // agenda non partagé ou d'une délégation non autorisée.
  let acces: { ok: boolean; plagesOccupees?: number; erreur?: string };
  if (!isCalendarConfigured()) {
    acces = { ok: false, erreur: "Variables incomplètes : appel non tenté." };
    return NextResponse.json({ variables, acces });
  }
  try {
    const now = Date.now();
    const busy = await getBusyIntervals(now, now + 7 * 86400000);
    acces = { ok: true, plagesOccupees: busy.length };
  } catch (e) {
    acces = { ok: false, erreur: e instanceof Error ? e.message.slice(0, 400) : String(e) };
  }

  return NextResponse.json({ variables, acces });
}
