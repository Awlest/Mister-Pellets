import Link from "next/link";
import { ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeaderShell } from "./HeaderShell";

// « Rendez-vous » a pris la place d'« Estimation » (01/10/2026) : le
// configurateur garde le bouton « Chiffrer mon poêle » à droite, et la prise
// de rendez-vous n'avait aucune entrée visible dans la barre. Le lien mène
// directement à l'agenda (#reserver), pas au haut de la page.
const NAV_ITEMS = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
  { label: "Rendez-vous", href: "/prendre-rendez-vous#reserver" },
  {
    label: "Nos marques",
    href: "/nos-marques",
    children: [
      { label: "Edilkamin", href: "/nos-marques/edilkamin", desc: "Premium · Italie" },
      { label: "EK63", href: "/nos-marques/ek63", desc: "Connecté · Italie" },
      { label: "Girolami", href: "/nos-marques/girolami", desc: "Polycombustible · Italie" },
    ],
  },
  {
    label: "Services",
    href: "/prendre-rendez-vous",
    children: [
      { label: "Entretien annuel", href: "/entretien-poele-a-pellets", desc: "Révision complète, par téléphone" },
      { label: "Ramonage", href: "/ramonage", desc: "Certificat remis sur place" },
      { label: "Dépannage", href: "/depannage-poele-a-pellets", desc: "Panne, code erreur, extinction" },
      { label: "Prendre rendez-vous", href: "/prendre-rendez-vous#reserver", desc: "Devis et showroom, en ligne" },
    ],
  },
  {
    label: "Guides",
    href: "/guides",
    children: [
      { label: "Guide d'achat", href: "/guides/guide-achat-poele-pellets-wallonie", desc: "Tout savoir avant l'achat" },
      { label: "Canalisable", href: "/guides/poele-pellets-canalisable", desc: "Chauffer plusieurs pièces" },
      { label: "Hydro", href: "/guides/poele-pellets-hydro", desc: "Remplacer une chaudière" },
      { label: "Quelle puissance ?", href: "/guides/quelle-puissance-poele-pellets", desc: "Calcul rapide" },
      { label: "Entretien", href: "/guides/comment-entretenir-poele-pellets", desc: "Check-list annuelle" },
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

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
        // largeur où logo + 8 entrées + téléphone + CTA tiennent sur une ligne.
        // À 1024 px (iPad paysage) la barre débordait et les libellés se
        // cassaient lettre par lettre — audit 2026-09-05. En dessous de xl,
        // c'est la NavbarSticky du bas qui porte la navigation.
        "group/header hidden xl:block",
        "sticky top-0 z-40 w-full transition-all duration-300",
        "h-20 md:h-24 bg-mp-cream",
        "data-scrolled:h-16 data-scrolled:bg-mp-cream/92 data-scrolled:backdrop-blur-md data-scrolled:shadow-sm"
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
            className="size-11 transition-all duration-300 group-data-scrolled/header:size-9"
          />
          <span
            className="font-semibold text-mp-green-deep transition-all duration-300 hidden sm:inline text-xl group-data-scrolled/header:text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mister Pellets
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden xl:flex items-center gap-1 mx-auto">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} className="group/item relative">
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
                    {item.children.map((child) => (
                      <Link
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
                      </Link>
                    ))}
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
            href="tel:+3281138309"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-mp-green-deep transition-colors hover:text-mp-orange-flame"
          >
            <Phone className="h-4 w-4" aria-hidden />
            081 13 83 09
          </a>
          <Button asChild variant="primary" size="default">
            <Link href="/estimation">Chiffrer mon poêle →</Link>
          </Button>
        </div>
      </div>
    </HeaderShell>
  );
}
