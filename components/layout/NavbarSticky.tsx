"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Home,
  ShoppingBag,
  Flame,
  Calendar,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Phone,
} from "lucide-react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { cn, formatPhone } from "@/lib/utils";

/**
 * Navbar FLOTTANTE sticky bottom mobile only.
 * 5 onglets : Accueil / Boutique / Devis / RDV / Menu (drawer)
 * La pastille orange est un FOND ACTIF derrière l'onglet courant qui glisse
 * latéralement avec un overshoot doux dans le sens du déplacement.
 *
 * Design :
 * - Navbar pill rounded, marges externes (lévite au-dessus du contenu)
 * - Backdrop blur + shadow douce
 * - Pastille orange = motion.span derrière l'item actif (pas surélevée)
 * - Animation : spring purement horizontal, doux, léger overshoot
 */

const PHONE = "0472 04 32 22";

type TabId = "home" | "shop" | "quote" | "rdv" | "menu";

interface Tab {
  id: TabId;
  href?: string;
  icon: typeof Home;
  label: string;
  matches: (path: string) => boolean;
}

const TABS: Tab[] = [
  { id: "home",  href: "/",                    icon: Home,        label: "Accueil",  matches: (p) => p === "/" },
  { id: "shop",  href: "/boutique",            icon: ShoppingBag, label: "Boutique", matches: (p) => p.startsWith("/boutique") || p.startsWith("/produit/") },
  { id: "quote", href: "/demande-de-devis",    icon: Flame,       label: "Devis",    matches: (p) => p === "/demande-de-devis" },
  { id: "rdv",   href: "/prendre-rendez-vous", icon: Calendar,    label: "RDV",      matches: (p) => p === "/prendre-rendez-vous" },
  { id: "menu",                                icon: MenuIcon,    label: "Menu",     matches: () => false },
];

const MENU_LINKS = [
  { href: "/nos-marques",                  label: "Nos marques",          desc: "Edilkamin · EK63 · Dielle · Ferlux" },
  { href: "/guides",                       label: "Guides",               desc: "Conseils, comparatifs, dimensionnement" },
  { href: "/primes-energie-wallonie-2026", label: "Prime 2026",           desc: "Jusqu'à 960 € selon revenus" },
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
  const reduceMotion = useReducedMotion();

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

        // Toujours visible si le drawer est ouvert (sécurité au cas où on ferme le drawer
        // sans scroll : la nav doit rester accessible derrière)
        lastY = current;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Force visible si le drawer Menu est ouvert (UX : on ne veut pas que la nav
  // disparaisse pendant que le drawer est ouvert)
  React.useEffect(() => {
    if (menuOpen) setVisible(true);
  }, [menuOpen]);

  const activeTabId: TabId = React.useMemo(() => {
    if (menuOpen) return "menu";
    const match = TABS.find((t) => t.matches(pathname ?? "/"));
    return match ? match.id : "menu";
  }, [pathname, menuOpen]);

  return (
    <>
      {/* WRAPPER FLOTTANT : marges externes + safe-area iOS */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 lg:hidden",
          "px-3 pb-3",
          "transition-all duration-300",
          visible ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0 pointer-events-none"
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
          <ul className="relative flex items-stretch h-16 p-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabId === tab.id;

              const itemContent = (
                <span
                  className={cn(
                    "relative z-10 flex flex-col items-center justify-center gap-0.5 h-full w-full px-1",
                    "text-[10px] font-semibold tracking-tight transition-colors duration-200",
                    isActive ? "text-white" : "text-mp-ink-soft"
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-white" : "text-mp-ink-soft")} />
                  <span>{tab.label}</span>
                </span>
              );

              return (
                <li key={tab.id} className="flex-1 relative">
                  {/* Pastille active (fond), animation horizontale douce */}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-pill"
                      className={cn(
                        "absolute inset-0 rounded-full bg-mp-orange-flame",
                        "shadow-[0_4px_14px_rgba(242,138,32,0.45)]",
                        "pointer-events-none"
                      )}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              // Spring doux horizontal avec léger overshoot dans le sens du déplacement
                              type: "spring",
                              stiffness: 260,   // pas trop raide
                              damping: 26,      // sous-amorti pour overshoot léger
                              mass: 0.8,        // léger pour répondre rapidement
                              restDelta: 0.5,   // arrêt net, pas de micro-tremblement
                            }
                      }
                      aria-hidden
                    />
                  )}

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
          className={cn(
            "rounded-t-3xl border-t-0",
            // Hauteur max + scroll interne
            "max-h-[88vh] overflow-y-auto overscroll-contain",
            // Padding horizontal
            "px-6",
            "lg:hidden"
          )}
          // Padding vertical via style pour combiner valeur fixe + safe-area iOS
          style={{
            paddingTop: "max(2.5rem, env(safe-area-inset-top))",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 6.5rem)",
            // ↑ 6.5rem = espace pour la NavbarSticky flottante (~88px) + air en bas
          }}
        >
          {/* Drag handle visuel */}
          <div className="flex justify-center -mt-4 mb-4" aria-hidden>
            <div className="h-1.5 w-12 rounded-full bg-mp-sand/60" />
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-semibold text-mp-green-deep"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Plus d'options
            </h2>
            <SheetClose className="rounded-full p-2 hover:bg-mp-beige transition-colors" aria-label="Fermer">
              <X className="h-5 w-5" />
            </SheetClose>
          </div>

          <div className="grid grid-cols-1 gap-2 mb-6">
            {MENU_LINKS.map((link) => (
              <SheetClose asChild key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-mp-cream border border-mp-sand/40 hover:border-mp-orange-flame hover:bg-mp-orange-light/30 transition-all group"
                >
                  <div>
                    <span className="block text-base font-semibold text-mp-green-deep">
                      {link.label}
                    </span>
                    <span className="block text-xs text-mp-ink-soft mt-0.5">
                      {link.desc}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-mp-ink-soft group-hover:text-mp-orange-flame group-hover:translate-x-1 transition-all" />
                </Link>
              </SheetClose>
            ))}
          </div>

          <div className="pt-4 border-t border-mp-sand/40 flex items-center justify-center">
            <a
              href={`tel:${formatPhone(PHONE)}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors"
            >
              <Phone className="h-4 w-4" />
              {PHONE}
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
