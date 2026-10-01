import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BONUS, isBonusPeriod } from "@/lib/bonus";

/** « 24 décembre », tiré de BONUS.to : la date de fin n'est écrite qu'à un endroit. */
const lastDay = new Intl.DateTimeFormat("fr-BE", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
}).format(new Date(`${BONUS.to}T12:00:00Z`));

/**
 * Annonce du bonus de saison dans le héros de l'accueil, entre le logo et le
 * titre, pour qu'elle tienne dans le premier écran, mobile compris. Rendue
 * côté serveur et seulement pendant la période (lib/bonus.ts) : la nuit de
 * la bascule, le cron app/api/cron/bonus invalide la page, et son
 * `revalidate` d'une heure rattrape un cron manqué.
 *
 * Contrastes AA : crème sur vert profond 10:1, vert le plus sombre sur orange
 * flamme 6,2:1 (le blanc sur cet orange ne fait que 2,3:1), orange chaud sur
 * vert profond 6,2:1.
 */
export function BonusAnnouncement() {
  if (!isBonusPeriod()) return null;

  return (
    <Link
      href="/boutique"
      className="group mx-auto mb-6 flex w-fit max-w-full items-center gap-3 rounded-xl bg-mp-green-deep py-2 pl-2 pr-4 text-left text-mp-cream shadow-md transition-[background-color,transform] duration-200 ease-out hover:bg-mp-green-darkest focus-visible:outline-mp-green-darkest focus-visible:outline-offset-[3px] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 sm:gap-4 sm:pr-5"
    >
      <span className="shrink-0 whitespace-nowrap rounded-lg bg-mp-orange-flame px-3 py-2 font-display text-xl font-semibold leading-none tabular-nums text-mp-green-darkest sm:text-2xl">
        {BONUS.badge}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold leading-snug sm:text-base">
          sur tous nos poêles jusqu&apos;au {lastDay}
        </span>
        <span className="block text-[13px] leading-snug text-mp-cream/85 sm:text-sm">
          Bonus de saison sur le prix du poêle, pose au tarif normal.
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-mp-orange-warm sm:inline-flex">
        Voir les prix
        <ArrowRight
          aria-hidden
          className="h-4 w-4 transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-0.5"
        />
      </span>
      <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-mp-orange-warm sm:hidden" />
    </Link>
  );
}
