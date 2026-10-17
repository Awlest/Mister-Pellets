import Link from "next/link";
import { ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, isFilterLink, visibleNav } from "@/config/navigation";
import { PHONE_DISPLAY, PHONE_HREF } from "@/config/site";
import { cn } from "@/lib/utils";
import { HeaderShell } from "./HeaderShell";

// Menu commun aux sites Mister (config/navigation.ts, MAIN_NAV, standard du
// 17/10/2026) : Catalogue, Marques, Services, Aides, Réalisations, Conseils,
// Contact. Seules les pages publiées apparaissent.
const NAV_ITEMS = visibleNav();

/**
 * En-tête desktop, rendu côté serveur. Seule HeaderShell (suivi du
 * défilement) envoie du JavaScript : avant, tout l'en-tête partait vers les
 * téléphones, qui ne l'affichent jamais, avec le préchargement prioritaire de
 * son logo (68 Ko) au détriment des images de la page.
 *
 * Sous-menus en CSS : ouverts au survol comme avant, et désormais au clavier
 * (focus visible dans l'entrée), ce que la version React ne faisait pas.
 * `:focus-visible` plutôt que `:focus-within` : après un clic souris, le lien
 * garde le focus et un focus-within laisserait le sous-menu ouvert sur la page
 * suivante. Masqués par `visibility`, avec 100 ms de délai à la fermeture
 * seulement, pas par `display: none` : au Tab, Chrome retire le focus du lien
 * parent avant de le donner au sous-menu, qui disparaissait entre les deux
 * (focus perdu). L'ouverture reste immédiate (delay-0).
 */
export function Header() {
  return (
    <HeaderShell
      className={cn(
        // ZÉRO header sur mobile et tablette (cf. doc corrections-mobile-v1 §3.1).
        // Le header n'apparaît qu'à partir de xl (1280 px) : c'est la première
        // largeur où logo + 7 entrées + téléphone + 2 boutons tiennent sur une ligne.
        // À 1024 px (iPad paysage) la barre débordait et les libellés se
        // cassaient lettre par lettre — audit 2026-09-05. En dessous de xl,
        // c'est la NavbarSticky du bas qui porte la navigation.
        "group/header hidden xl:block",
        // Au défilement : barre plus basse et filet sable, fond toujours
        // opaque (ni flou ni transparence, DESIGN.md). Hauteur et logo
        // changent sans animation : seuls opacité et transform s'animent.
        "sticky top-0 z-40 w-full border-b border-transparent transition-colors",
        "h-20 md:h-24 bg-mp-cream",
        "data-scrolled:h-16 data-scrolled:border-mp-sand/50"
      )}
    >
      <div className="mp-shell h-full flex items-center justify-between gap-4">
        {/* Logo. Chargement différé : l'en-tête est masqué sous 1280 px, les
            téléphones n'ont pas à télécharger ce fichier. */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Mister Pellets, accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mister-pellets-mascotte.svg"
            alt=""
            width={44}
            height={44}
            loading="lazy"
            decoding="async"
            className="size-11 group-data-scrolled/header:size-9"
          />
          <span
            className="font-semibold text-mp-green-deep hidden sm:inline text-xl group-data-scrolled/header:text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mister Pellets
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden xl:flex items-center gap-1 mx-auto">
          {NAV_ITEMS.map((item) => (
            <div key={item.key} className="group/item relative">
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium 2xl:px-4",
                  // whitespace-nowrap : sans ça, un libellé comme « Nos marques »
                  // se casse en colonne dès que la barre manque de place.
                  "whitespace-nowrap text-mp-ink hover:text-mp-orange-flame transition-colors"
                )}
              >
                {item.label}
                {item.children && <ChevronDown className="h-3.5 w-3.5" aria-hidden />}
              </Link>

              {/* Mega menu */}
              {item.children && (
                <div className="invisible absolute left-1/2 -translate-x-1/2 top-full pt-2 w-72 transition-[visibility] duration-0 delay-100 group-hover/item:visible group-hover/item:delay-0 group-has-[:focus-visible]/item:visible group-has-[:focus-visible]/item:delay-0">
                  <div className="rounded-2xl bg-mp-cream border border-mp-sand/50 shadow-lg p-2">
                    {item.children.map((child) => {
                      const Item = isFilterLink(child.href) ? "a" : Link;
                      return (
                      <Item
                        key={child.href}
                        href={child.href}
                        className="block rounded-xl px-3 py-2.5 hover:bg-mp-beige-warm transition-colors"
                      >
                        <div className="text-sm font-semibold text-mp-green-deep">
                          {child.label}
                        </div>
                        {child.desc && (
                          <div className="text-xs text-mp-ink-soft mt-0.5">
                            {child.desc}
                          </div>
                        )}
                      </Item>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Actions droite (desktop uniquement, le Header est masqué sur mobile).
          * Le numéro est cliquable : sur ce métier, l'appel reste le premier
          * réflexe, et il n'apparaissait jusqu'ici nulle part dans la navigation. */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={PHONE_HREF}
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-mp-green-deep transition-colors hover:text-mp-orange-flame"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {PHONE_DISPLAY}
          </a>
          <Button asChild variant="outline" size="default">
            <Link href={ROUTES.bookingWidget}>Rendez-vous</Link>
          </Button>
          <Button asChild variant="primary" size="default">
            <Link href={ROUTES.configurator}>Estimer mon projet</Link>
          </Button>
        </div>
      </div>
    </HeaderShell>
  );
}
