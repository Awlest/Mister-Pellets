import { cn } from "@/lib/utils";
import { formatEur } from "@/lib/pose/moteur";

/**
 * Prix d'une prestation remisée (lib/pose/tarifs.ts, REMISES) : prix remisé,
 * prix plein barré et badge du pourcentage, comme le bonus des fiches produit.
 * Sans remise, ou avec `showStrike` coupé, seul le prix s'affiche. Le prix
 * barré est annoncé « au lieu de » aux lecteurs d'écran.
 */
export function DiscountedPrice({
  amount,
  full,
  pct,
  showStrike,
  format = formatEur,
  className,
}: {
  amount: number;
  full?: number;
  pct?: number;
  showStrike?: boolean;
  format?: (n: number) => string;
  className?: string;
}) {
  const strike = Boolean(showStrike && full !== undefined && pct && full > amount);
  return (
    <span className={cn("inline-flex flex-wrap items-baseline justify-end gap-x-1.5 gap-y-0.5", className)}>
      <span className="tabular-nums">{format(amount)}</span>
      {strike ? (
        <>
          <span className="text-xs tabular-nums text-mp-ink-soft line-through">
            <span className="sr-only">au lieu de </span>
            {format(full!)}
          </span>
          <span className="rounded-full bg-mp-orange-flame px-2 py-0.5 text-xs font-semibold text-mp-green-darkest">
            -{pct}&nbsp;%
          </span>
        </>
      ) : null}
    </span>
  );
}
