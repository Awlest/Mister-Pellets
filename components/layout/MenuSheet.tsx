"use client";

import Link from "next/link";
import { BrushCleaning, ChevronRight, Phone, TriangleAlert, Wrench, X } from "lucide-react";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { cn, formatPhone } from "@/lib/utils";

/**
 * Drawer du 5e onglet de la barre du bas (NavbarSticky). Module à part, chargé
 * à la demande : avec la fenêtre Radix (Dialog, verrouillage du défilement,
 * piège à focus), il pesait sur le JavaScript de chaque page alors qu'il ne
 * sert qu'à l'ouverture du menu.
 */

const PHONE = "081 13 83 09";

// Les trois prestations n'avaient aucune entrée sur mobile : le menu du haut,
// qui les liste, n'existe qu'à partir de 1280 px. Mêmes libellés que ce menu.
const SERVICE_LINKS = [
  { href: "/entretien-poele-a-pellets", label: "Entretien", icon: Wrench },
  { href: "/ramonage",                  label: "Ramonage",  icon: BrushCleaning },
  { href: "/depannage-poele-a-pellets", label: "Dépannage", icon: TriangleAlert },
];

const MENU_LINKS = [
  { href: "/nos-marques",                  label: "Nos marques",          desc: "Edilkamin · EK63 · Girolami" },
  { href: "/guides",                       label: "Guides",               desc: "Conseils, comparatifs, dimensionnement" },
  { href: "/primes-energie-wallonie-2026", label: "Aides 2026",           desc: "Fin de la prime, ce qui reste" },
  { href: "/zones-d-intervention",         label: "Zones d'intervention", desc: "10 villes en Wallonie" },
  { href: "/blog",                         label: "Blog",                 desc: "Articles et actualités" },
  { href: "/faq",                          label: "FAQ",                  desc: "Réponses aux questions courantes" },
  { href: "/a-propos",                     label: "À propos",             desc: "Mister Pellets, Fernelmont" },
  { href: "/contact",                      label: "Contact",              desc: "Téléphone, email, formulaire" },
];

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
            Plus d&apos;options
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
          Services
        </p>
        <ul className="mb-5 grid grid-cols-3 gap-2">
          {SERVICE_LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <SheetClose asChild>
                <Link
                  href={href}
                  className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border border-mp-sand/40 bg-mp-cream px-2 py-3 text-center text-sm font-semibold text-mp-green-deep transition-colors hover:border-mp-orange-flame hover:bg-mp-orange-light/30"
                >
                  <Icon className="h-5 w-5 text-mp-orange-flame" aria-hidden />
                  {label}
                </Link>
              </SheetClose>
            </li>
          ))}
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
          href={`tel:${formatPhone(PHONE)}`}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-mp-green-deep px-6 text-base font-semibold text-mp-green-deep transition-colors hover:bg-mp-green-deep hover:text-white"
        >
          <Phone className="h-5 w-5" aria-hidden />
          Appeler le {PHONE}
        </a>
      </SheetContent>
    </Sheet>
  );
}
