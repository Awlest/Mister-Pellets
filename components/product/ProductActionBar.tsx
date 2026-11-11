import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MenuTrigger } from "@/components/layout/MenuTrigger";

/**
 * Bouton principal de la page quand la barre d'action est affichée (sous
 * 1 024 px) : style secondaire, vert plein. L'aplat orange de l'écran est
 * celui de la barre, un seul par écran (DESIGN.md).
 */
export const YIELDS_TO_ACTION_BAR = "max-lg:bg-mp-green-deep max-lg:text-white max-lg:hover:bg-mp-green-mid";

/**
 * Barre d'action d'une fiche produit, sous 1 024 px : le prix et le bouton qui
 * chiffre restent à portée dès le premier écran (le prix tombait au 2e écran,
 * le bouton au 3e).
 *
 * Elle REMPLACE la barre de navigation du bas sur ce gabarit (globals.css,
 * .mp-actionbar-nav) : empilées, les deux couvraient 18 % de l'écran et
 * montraient deux aplats orange. L'entrée Menu ouvre le même volet que
 * l'onglet de la barre du bas, où se trouvent l'appel et le rendez-vous.
 *
 * À rendre en DERNIER élément de la page : en `sticky`, elle colle au bas de
 * l'écran pendant la lecture puis reprend sa place avant le pied de page,
 * sans script. Fond opaque et filet, ni flou ni ombre. Classe mp-actionbar :
 * le bandeau cookies se pose au-dessus (globals.css).
 */
export function ProductActionBar({
  name,
  price,
  href,
  action = "estimate",
}: {
  name: string;
  /** « Dès 2 283 € TVAC », déjà formaté, ou « Prix sur devis ». */
  price: string;
  /** Configurateur ouvert sur ce modèle, ou demande de prix d'une fiche sur devis. */
  href: string;
  /** Fiche sur devis : le bouton demande le prix (lib/price-request.ts). */
  action?: "estimate" | "price-request";
}) {
  return (
    <div className="mp-actionbar mp-actionbar-nav sticky z-20 min-h-[var(--mp-actionbar-h)] border-t border-mp-sand/40 bg-mp-cream px-3 pt-3 lg:hidden">
      <div className="flex items-center gap-2">
        <MenuTrigger />
        <p className="min-w-0 flex-1">
          <span className="block truncate text-xs text-mp-ink-soft">{name}</span>
          <span
            className="block text-base font-semibold leading-tight tabular-nums text-mp-green-deep"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {price}
          </span>
        </p>
        <Button asChild variant="primary" className="shrink-0 px-4">
          <Link href={href} rel="nofollow">
            {/* Sous 360 px, « Estimer » seul à l'écran : le prix garde sa place.
                Un seul enfant : le bouton est en flex, deux enfants seraient
                écartés par son `gap`. */}
            {action === "price-request" ? (
              <span>
                Demander<span className="max-[359px]:sr-only"> le prix</span>
              </span>
            ) : (
              <span>
                Estimer<span className="max-[359px]:sr-only"> mon projet</span>
              </span>
            )}
          </Link>
        </Button>
      </div>
    </div>
  );
}
