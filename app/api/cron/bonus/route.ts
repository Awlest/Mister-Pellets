import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { bonusPhase, brusselsDay, isBonusSwitchDay } from "@/lib/bonus";
import { isPelletSwitchDay } from "@/lib/pellets";

export const dynamic = "force-dynamic";

/**
 * Comparaison en temps constant : les deux valeurs passent par SHA-256, qui
 * leur donne la même longueur, avant timingSafeEqual (qui exige des tampons
 * de même taille).
 */
function sameSecret(received: string, expected: string): boolean {
  const digest = (v: string) => createHash("sha256").update(v).digest();
  return timingSafeEqual(digest(received), digest(expected));
}

/**
 * Invalide tout le site la nuit où le bonus de saison commence ou s'arrête,
 * et celle où le prix de lancement des pellets Comfo prend fin.
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
 * Le cron Vercel envoie CRON_SECRET en en-tête Authorization ; toute autre
 * requête est refusée, et toutes le sont tant que la variable n'est pas posée
 * sur Vercel (sinon n'importe qui pourrait vider le cache du site).
 */
export async function GET(request: Request) {
  const limited = rateLimitResponse(request, { routeKey: "cron-bonus", max: 5 });
  if (limited) return limited;

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/bonus] CRON_SECRET absent : appel refusé");
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!sameSecret(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const day = brusselsDay(now);
  // Même nuit pour la fin du prix de lancement des pellets (lib/pellets.ts) :
  // bandeau du site, page de la palette et prix réservé changent à minuit.
  const pellets = isPelletSwitchDay(now);
  if (!isBonusSwitchDay(now) && !pellets) {
    return NextResponse.json({ day, revalidated: false });
  }

  const phase = bonusPhase(now);
  revalidatePath("/", "layout");
  console.log("[cron/bonus] site invalidé", { day, phase, pellets });
  return NextResponse.json({ day, phase, pellets, revalidated: true });
}
