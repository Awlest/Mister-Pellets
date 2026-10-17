"use client";

import Link from "next/link";
import { ArrowUpRight, BrushCleaning, ChevronRight, Phone, TriangleAlert, Wrench, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import {
  CATALOGUE_LINKS,
  INFO_LINKS,
  ROUTES,
  SERVICE_LINKS as ALL_SERVICE_LINKS,
  isFilterLink,
  published,
  type NavLink,
} from "@/config/navigation";
import { FAMILY_SITES, PHONE_DISPLAY, PHONE_HREF } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Drawer du 5e onglet de la barre du bas (NavbarSticky). Module à part, chargé
 * à la demande : avec la fenêtre Radix (Dialog, verrouillage du défilement,
 * piège à focus), il pesait sur le JavaScript de chaque page alors qu'il ne
 * sert qu'à l'ouverture du menu.
 *
 * Ordre commun aux sites Mister (standard du 17/10/2026) : catalogue,
 * services, rendez-vous, puis les pages dans l'ordre du menu, appel, et la
 * famille Awlest.
 */

// Les trois prestations n'avaient aucune entrée sur mobile : le menu du haut,
// qui les liste, n'existe qu'à partir de 1280 px. Mêmes libellés que ce menu.
const SERVICE_ICONS = {
  [ROUTES.maintenance]: Wrench,
  [ROUTES.sweeping]: BrushCleaning,
  [ROUTES.repair]: TriangleAlert,
} as const;
const SERVICE_LINKS = ALL_SERVICE_LINKS.filter((l) => l.href in SERVICE_ICONS);

// Le rendez-vous n'a pas d'onglet dans la barre : il ouvre la liste.
const BOOKING = ALL_SERVICE_LINKS.find((l) => l.href === ROUTES.booking)!;
const MENU_LINKS: NavLink[] = published([
  { ...BOOKING, href: ROUTES.bookingWidget },
  { href: ROUTES.brands, label: "Nos marques", desc: "Edilkamin · EK63 · Girolami" },
  ...ALL_SERVICE_LINKS.filter((l) => !(l.href in SERVICE_ICONS) && l !== BOOKING),
  ...INFO_LINKS,
]);

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

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
          Catalogue
        </p>
        <ul className="mb-5 grid grid-cols-2 gap-2">
          {CATALOGUE_LINKS.map((link) => {
            const cls =
              "flex min-h-14 items-center justify-center rounded-2xl border border-mp-sand/40 bg-mp-cream px-3 py-3 text-center text-sm font-semibold text-mp-green-deep transition-colors hover:border-mp-orange-flame hover:bg-mp-orange-light/30";
            return (
              <li key={link.href}>
                {isFilterLink(link.href) ? (
                  <a href={link.href} className={cls}>
                    {link.short ?? link.label}
                  </a>
                ) : (
                  <SheetClose asChild>
                    <Link href={link.href} className={cls}>
                      {link.short ?? link.label}
                    </Link>
                  </SheetClose>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-mp-ink-soft">
          Services
        </p>
        <ul className="mb-5 grid grid-cols-3 gap-2">
          {SERVICE_LINKS.map(({ href, short, label }) => {
            const Icon = SERVICE_ICONS[href as keyof typeof SERVICE_ICONS];
            return (
            <li key={href}>
              <SheetClose asChild>
                <Link
                  href={href}
                  className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border border-mp-sand/40 bg-mp-cream px-2 py-3 text-center text-sm font-semibold text-mp-green-deep transition-colors hover:border-mp-orange-flame hover:bg-mp-orange-light/30"
                >
                  <Icon className="h-5 w-5 text-mp-orange-flame" aria-hidden />
                  {short ?? label}
                </Link>
              </SheetClose>
            </li>
            );
          })}
        </ul>

        <ul className="grid grid-cols-1 gap-2 mb-5">
          {MENU_LINKS.map((link) => (
            <li key={link.href}>
              <SheetClose asChild>
                <Link
                  href={link.href}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-mp-cream border border-mp-sand/40 hover:border-mp-orange-flame hover:bg-mp-orange-light/30 transition-colors group"
                >
                  <span>
                    <span className="block text-base font-semibold text-mp-green-deep">
                      {link.label}
                    </span>
                    <span className="block text-sm text-mp-ink-soft mt-0.5">
                      {link.desc}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-mp-ink-soft transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </SheetClose>
            </li>
          ))}
        </ul>

        <a
          href={PHONE_HREF}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-mp-green-deep px-6 text-base font-semibold text-mp-green-deep transition-colors hover:bg-mp-green-deep hover:text-white"
        >
          <Phone className="h-5 w-5" aria-hidden />
          Appeler le {PHONE_DISPLAY}
        </a>

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
