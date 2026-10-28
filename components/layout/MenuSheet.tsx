"use client";

import Link from "next/link";
import { ArrowUpRight, Calculator, CalendarDays, ChevronRight, Phone, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { INFO_LINKS, ROUTES, isFilterLink, visibleNav, type NavLink } from "@/config/navigation";
import { FAMILY_SITES, PHONE_DISPLAY, PHONE_HREF } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Drawer du 5e onglet de la barre du bas (NavbarSticky). Module à part, chargé
 * à la demande : avec la fenêtre Radix (Dialog, verrouillage du défilement,
 * piège à focus), il pesait sur le JavaScript de chaque page alors qu'il ne
 * sert qu'à l'ouverture du menu.
 *
 * Même structure que le menu du haut, sur les trois sites Mister : les
 * entrées de visibleNav() dans leur ordre (Catalogue, Marques, Services,
 * Aides, Réalisations, Conseils, Contact), puis les actions de l'en-tête dans
 * leur ordre (téléphone, rendez-vous, estimation) et la famille Awlest.
 * Accueil en tête : la barre du bas n'a plus cet onglet sur Mister Pellets,
 * et aucun en-tête ne s'affiche sous 1 280 px.
 */

const NAV_ITEMS = visibleNav();

// Catalogue et marques en tuiles sur deux colonnes, le reste en lignes.
const TILES = new Set(["catalogue", "marques"]);

const TILE =
  "flex min-h-14 items-center justify-center rounded-2xl border border-mp-sand/40 bg-mp-cream px-3 py-3 text-center text-sm font-semibold text-mp-green-deep transition-colors hover:border-mp-orange-flame hover:bg-mp-orange-light/30";
const ROW =
  "group flex items-center justify-between gap-3 rounded-2xl border border-mp-sand/40 bg-mp-cream px-4 py-3 transition-colors hover:border-mp-orange-flame hover:bg-mp-orange-light/30";
const LABEL = "text-xs font-semibold uppercase tracking-wider text-mp-ink-soft";

/** Description d'une entrée sans sous-menu (Aides, Contact) : celle du pied de page. */
const descOf = (href: string) => INFO_LINKS.find((l) => l.href === href)?.desc;

/**
 * Un lien filtré de la boutique se suit par un chargement complet
 * (isFilterLink) : pas de navigation client, le volet se ferme avec la page.
 */
function SheetLink({ link, className, children }: { link: NavLink; className: string; children: React.ReactNode }) {
  if (isFilterLink(link.href)) {
    return (
      <a href={link.href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <SheetClose asChild>
      <Link href={link.href} className={className}>
        {children}
      </Link>
    </SheetClose>
  );
}

function Row({ link }: { link: NavLink }) {
  return (
    <SheetLink link={link} className={ROW}>
      <span>
        <span className="block text-base font-semibold text-mp-green-deep">{link.label}</span>
        {link.desc && <span className="mt-0.5 block text-sm text-mp-ink-soft">{link.desc}</span>}
      </span>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-mp-ink-soft transition-transform group-hover:translate-x-1"
        aria-hidden
      />
    </SheetLink>
  );
}

export default function MenuSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        hideClose
        className={cn(
          "rounded-t-3xl border-t-0",
          // Hauteur max + scroll interne
          "max-h-[88dvh] overflow-y-auto overscroll-contain",
          // Padding horizontal
          "px-5",
          "xl:hidden"
        )}
        // Padding vertical via style pour combiner valeur fixe + safe-area iOS
        style={{
          paddingTop: "max(1.25rem, env(safe-area-inset-top))",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 6.5rem)",
          // ↑ 6.5rem = espace pour la NavbarSticky flottante (~88px) + air en bas
        }}
      >
        {/* Drag handle visuel */}
        <div className="flex justify-center mb-3" aria-hidden>
          <div className="h-1.5 w-12 rounded-full bg-mp-sand/60" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-2xl font-semibold text-mp-green-deep"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Menu
          </h2>
          {/* Une seule croix, 44 × 44 px (spec mobile V1). */}
          <SheetClose
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-mp-ink transition-colors hover:bg-mp-beige"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" aria-hidden />
          </SheetClose>
        </div>

        <nav aria-label="Menu" className="flex flex-col gap-5">
          <Row link={{ href: ROUTES.home, label: "Accueil" }} />
          {NAV_ITEMS.map((item) => {
            if (!item.children) {
              return <Row key={item.key} link={{ href: item.href, label: item.label, desc: descOf(item.href) }} />;
            }
            const overview = !item.children.some((c) => c.href === item.href);
            return (
              <section key={item.key} aria-label={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className={LABEL}>{item.label}</p>
                  {overview && (
                    <SheetClose asChild>
                      <Link
                        href={item.href}
                        className="inline-flex min-h-11 items-center text-sm font-semibold text-mp-orange-ink hover:underline"
                      >
                        Tout voir
                      </Link>
                    </SheetClose>
                  )}
                </div>
                {TILES.has(item.key) ? (
                  <ul className="grid grid-cols-2 gap-2">
                    {item.children.map((link) => (
                      <li key={link.href}>
                        <SheetLink link={link} className={TILE}>
                          {link.short ?? link.label}
                        </SheetLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="grid grid-cols-1 gap-2">
                    {item.children.map((link) => (
                      <li key={link.href}>
                        <Row link={link} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </nav>

        <div className="mt-6 grid grid-cols-1 gap-2">
          <a href={PHONE_HREF} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
            <Phone aria-hidden />
            Appeler le {PHONE_DISPLAY}
          </a>
          <SheetClose asChild>
            <Link href={ROUTES.bookingWidget} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
              <CalendarDays aria-hidden />
              Prendre rendez-vous
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href={ROUTES.configurator} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full")}>
              <Calculator aria-hidden />
              Estimer mon projet
            </Link>
          </SheetClose>
        </div>

        <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
          La famille Awlest
        </p>
        <ul className="grid grid-cols-1 gap-2">
          {FAMILY_SITES.map((site) => (
            <li key={site.href}>
              <a
                href={site.href}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-mp-cream border border-mp-sand/40 hover:border-mp-orange-flame hover:bg-mp-orange-light/30 transition-colors"
              >
                <span>
                  <span className="block text-base font-semibold text-mp-green-deep">{site.name}</span>
                  <span className="block text-sm text-mp-ink-soft mt-0.5">{site.description}</span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-mp-ink-soft" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
