import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { bonusPhase, brusselsDay, isBonusSwitchDay } from "@/lib/bonus";

export const dynamic = "force-dynamic";

/**
 * Invalide tout le site la nuit où le bonus de saison commence ou s'arrête.
 *
 * Boutique, fiches produit et pages ville sont en ISR : passé minuit, Vercel
 * sert encore la version de la veille au premier visiteur de chaque page et ne
 * la régénère qu'en arrière-plan. Constaté le 01/10/2026 : chaque fiche a
 * servi une fois son prix sans bonus le premier matin. Le 25/12, ce serait
 * l'inverse (un -15 % affiché après la fin). Après revalidatePath, la visite
 * suivante est rendue avec le bon prix.
 *
 * Appelé par le cron Vercel (vercel.json) à 22 h et 23 h UTC, soit minuit à
 * Bruxelles en heure d'été comme en heure d'hiver. Le plan Hobby déclenche
 * dans l'heure, pas à la minute. Les autres jours, l'appel ne fait rien.
 * Si CRON_SECRET est défini sur Vercel, le cron l'envoie en en-tête
 * Authorization et toute autre requête est refusée.
 */
export async function GET(request: Request) {
  const limited = rateLimitResponse(request, { routeKey: "cron-bonus", max: 5 });
  if (limited) return limited;

  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const day = brusselsDay(now);
  if (!isBonusSwitchDay(now)) {
    return NextResponse.json({ day, revalidated: false });
  }

  const phase = bonusPhase(now);
  revalidatePath("/", "layout");
  console.log("[cron/bonus] site invalidé", { day, phase });
  return NextResponse.json({ day, phase, revalidated: true });
}
