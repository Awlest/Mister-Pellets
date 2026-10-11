"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Flame,
  Calendar,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Phone,
  Wrench,
  BrushCleaning,
  TriangleAlert,
} from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { cn, formatPhone } from "@/lib/utils";

/**
 * Navbar FLOTTANTE sticky bottom, mobile ET tablette (jusqu'à xl / 1280 px).
 * 5 onglets : Accueil / Boutique / Devis / RDV / Menu (drawer)
 * La pastille orange est un FOND ACTIF derrière l'onglet courant qui glisse
 * latéralement avec un léger dépassement dans le sens du déplacement.
 *
 * Design :
 * - Navbar pill rounded, marges externes (lévite au-dessus du contenu)
 * - Backdrop blur + shadow douce
 * - Pastille orange = un seul élément derrière les onglets, déplacé en CSS
 *   (transform). framer-motion servait à cette seule animation et chargeait
 *   plus de 40 Ko de JavaScript sur chaque page (audit mobile du 11/10/2026).
 * - Libellé et icône de l'onglet actif en vert le plus sombre : le blanc sur
 *   l'orange flamme ne fait que 2,5:1, le vert 6,2:1.
 */

const PHONE = "081 13 83 09";

type TabId = "home" | "shop" | "quote" | "rdv" | "menu";

interface Tab {
  id: TabId;
  href?: string;
  icon: typeof Home;
  label: string;
  matches: (path: string) => boolean;
}

const TABS: Tab[] = [
  // « /index » : c'est le chemin que voit le rendu serveur de l'accueil en
  // production (régénération ISR). Sans lui, le HTML marquait l'onglet Menu
  // et le navigateur l'onglet Accueil : React levait l'erreur d'hydratation
  // #418 et recalculait toute la page côté navigateur (constaté le 11/10/2026).
  { id: "home",  href: "/",                    icon: Home,        label: "Accueil",  matches: (p) => p === "/" || p === "/index" || p === "" },
  { id: "shop",  href: "/boutique",            icon: ShoppingBag, label: "Boutique", matches: (p) => p.startsWith("/boutique") || p.startsWith("/produit/") },
  // L'onglet Devis mène au configurateur : il chiffre, calcule la mensualité et
  // déduit la prime. Le formulaire /demande-de-devis reste accessible, mais il
  // n'est plus le chemin par défaut depuis le retrait du paiement en ligne.
  { id: "quote", href: "/estimation",          icon: Flame,       label: "Devis",    matches: (p) => p === "/estimation" || p === "/demande-de-devis" },
  // #reserver : l'onglet ouvre directement l'agenda, pas la présentation du showroom.
  { id: "rdv",   href: "/prendre-rendez-vous#reserver", icon: Calendar, label: "RDV", matches: (p) => p === "/prendre-rendez-vous" },
  { id: "menu",                                icon: MenuIcon,    label: "Menu",     matches: () => false },
];

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

export function NavbarSticky() {
  const pathname = usePathname();
  // Visible par défaut. Comportement iOS-like : hide on scroll down, show on scroll up.
  const [visible, setVisible] = React.useState(true);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const SCROLL_THRESHOLD = 8; // ignore micro-scrolls (rebond iOS, trackpad)
    const TOP_ZONE = 80;        // toujours visible dans cette zone (haut de page)
    let lastY = window.scrollY;
    let ticking = false;

    const handle = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const current = window.scrollY;
        const delta = current - lastY;

        if (current < TOP_ZONE) {
          setVisible(true);
        } else if (delta > SCROLL_THRESHOLD) {
          // scroll down significatif → hide
          setVisible(false);
        } else if (delta < -SCROLL_THRESHOLD) {
          // scroll up significatif → show
          setVisible(true);
        }

        lastY = current;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Audit V20260503 §2.H.2 : forcer visible quand le drawer Menu s'ouvre,
  // sans setState dans useEffect. On dérive l'état effectif.
  const effectiveVisible = visible || menuOpen;

  // La barre publie son état sur <html> : une barre d'action collante (celle
  // du configurateur) se pose au-dessus d'elle grâce à --mp-bottomnav-h, puis
  // redescend quand elle se replie (globals.css, « Barre du bas »).
  React.useEffect(() => {
    const root = document.documentElement;
    if (effectiveVisible) root.removeAttribute("data-bottomnav");
    else root.setAttribute("data-bottomnav", "hidden");
  }, [effectiveVisible]);
  React.useEffect(() => () => document.documentElement.removeAttribute("data-bottomnav"), []);

  const activeTabId: TabId = React.useMemo(() => {
    if (menuOpen) return "menu";
    const match = TABS.find((t) => t.matches(pathname ?? "/"));
    return match ? match.id : "menu";
  }, [pathname, menuOpen]);
  const activeIndex = TABS.findIndex((t) => t.id === activeTabId);

  return (
    <>
      {/* WRAPPER FLOTTANT : marges externes + safe-area iOS */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 xl:hidden",
          "px-3 pb-3",
          "transition-[transform,opacity] duration-300",
          effectiveVisible ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0 pointer-events-none"
        )}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <nav
          className={cn(
            "relative mx-auto max-w-md",
            "rounded-full bg-mp-cream/92 backdrop-blur-xl",
            "border border-mp-sand/50",
            "shadow-[0_8px_32px_rgba(20,36,27,0.18)]",
            "overflow-hidden"
          )}
          aria-label="Navigation rapide"
        >
          {/* Pastille active : glisse d'un onglet à l'autre, avec un léger
              dépassement (courbe à rebond), coupée si l'utilisateur réduit
              les animations. */}
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-1.5 left-1.5 rounded-full bg-mp-orange-flame",
              "shadow-[0_4px_14px_rgba(242,138,32,0.45)]",
              "transition-transform duration-300 ease-[cubic-bezier(0.34,1.36,0.64,1)] motion-reduce:transition-none"
            )}
            style={{
              width: `calc((100% - 0.75rem) / ${TABS.length})`,
              transform: `translateX(${Math.max(0, activeIndex) * 100}%)`,
            }}
          />
          <ul className="relative flex items-stretch h-16 p-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabId === tab.id;

              const itemContent = (
                <span
                  className={cn(
                    "relative z-10 flex flex-col items-center justify-center gap-0.5 h-full w-full px-1",
                    "text-[10px] font-semibold tracking-tight transition-colors duration-200",
                    isActive ? "text-mp-green-darkest" : "text-mp-ink-soft"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                  <span>{tab.label}</span>
                </span>
              );

              return (
                <li key={tab.id} className="flex-1 relative">
                  {tab.id === "menu" ? (
                    <button
                      type="button"
                      onClick={() => setMenuOpen(true)}
                      className="relative z-10 flex flex-col items-center justify-center h-full w-full"
                      aria-label="Ouvrir le menu"
                      aria-expanded={menuOpen}
                    >
                      {itemContent}
                    </button>
                  ) : (
                    <Link
                      href={tab.href!}
                      className="relative z-10 flex flex-col items-center justify-center h-full w-full"
                      aria-current={isActive ? "page" : undefined}
                    >
                      {itemContent}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Drawer Menu (5e onglet) */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
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
            paddingTop: "max(2rem, env(safe-area-inset-top))",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 6.5rem)",
            // ↑ 6.5rem = espace pour la NavbarSticky flottante (~88px) + air en bas
          }}
        >
          {/* Drag handle visuel */}
          <div className="flex justify-center -mt-3 mb-3" aria-hidden>
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
    </>
  );
}
