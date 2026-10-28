import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  PELLET_OFFER,
  formatEuro,
  isPelletLaunchPeriod,
  launchLastDayLabel,
} from "@/lib/pellets";

/**
 * Bandeau du prix de lancement de la palette de pellets Comfo, en haut de
 * chaque page, jusqu'au dernier jour de l'offre (lib/pellets.ts). Rendu côté
 * serveur : la nuit de la fin, le cron app/api/cron/bonus invalide tout le
 * site, et le bandeau disparaît à la visite suivante.
 *
 * Une seule ligne de texte sur téléphone, la phrase complète dès 640 px.
 * Lien de 44 px de haut au moins. Crème sur vert profond 10:1, orange chaud
 * sur vert profond 6,2:1. Pas de prix barré (voir lib/pellets.ts).
 */
export function PelletPromoBanner() {
  if (!isPelletLaunchPeriod()) return null;

  const price = formatEuro(PELLET_OFFER.launch.priceTTC);

  return (
    <Link
      href={PELLET_OFFER.path}
      className="group block bg-mp-green-deep text-mp-cream transition-colors hover:bg-mp-green-darkest focus-visible:outline-mp-orange-warm focus-visible:-outline-offset-4"
    >
      <span className="mp-shell flex min-h-11 items-center justify-center gap-x-3 py-2 text-center text-sm leading-snug">
        <span className="min-w-0">
          <span className="font-semibold">Pellets Comfo&nbsp;: la palette à {price} TVAC</span>
          <span className="sm:hidden"> jusqu&apos;au {launchLastDayLabel}</span>
          <span className="hidden sm:inline">
            {" "}
            jusqu&apos;au {launchLastDayLabel}, retrait à Fernelmont. Stock limité à{" "}
            {PELLET_OFFER.stock}&nbsp;palettes.
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-mp-orange-warm">
          <span className="hidden md:inline">Réserver</span>
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5"
          />
        </span>
      </span>
    </Link>
  );
}
