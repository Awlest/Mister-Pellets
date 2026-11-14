import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

/**
 * Le logo en haut de page, sous 1280 px (même construction que Mister Bois).
 * Il n'y a pas d'en-tête mobile (la barre du bas porte la navigation) : sans
 * lui, le visiteur arrivé sur une page intérieure par une recherche ne voyait
 * la marque qu'au pied de page. Une ligne dans le flux, non collante, sans
 * menu : ce n'est pas un en-tête. Sur l'accueil, elle remplace le logo
 * complet qui ouvrait le héros.
 */
export function MobileBrand() {
  return (
    <div className="bg-mp-cream xl:hidden">
      <div className="mp-shell pt-2">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-md" aria-label="Mister Pellets, accueil">
          <Logo variant="ligne" className="h-9" />
        </Link>
      </div>
    </div>
  );
}
