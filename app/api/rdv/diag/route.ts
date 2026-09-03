import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Diagnostic TEMPOIRE de la configuration Google Calendar.
 *
 * Ne renvoie que des booléens et des longueurs : aucune valeur de variable,
 * aucun fragment de clé privée. Sert à savoir laquelle des trois variables
 * manque quand la réservation reste inactive.
 *
 * ⚠️ À SUPPRIMER une fois la réservation opérationnelle.
 */
export async function GET() {
  const email = process.env.GOOGLE_SA_EMAIL ?? "";
  const key = process.env.GOOGLE_SA_PRIVATE_KEY ?? "";
  const calendar = process.env.GOOGLE_CALENDAR_ID ?? "";
  const restored = key.replace(/\\n/g, "\n");

  return NextResponse.json({
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
  });
}
