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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn, formatPhone } from "@/lib/utils";

/**
 * Navbar sticky bottom mobile only.
 * 5 onglets : Accueil / Boutique / Devis / RDV / Menu (drawer)
 * La pastille orange surélevée est un INDICATEUR ACTIF qui glisse
 * sous l'onglet courant avec un spring/recoil (Framer Motion shared layout).
 *
 * Cf. brief §5.3 + customisation user 2026-05-02.
 */

const PHONE = "0472 04 32 22";

type TabId = "home" | "shop" | "quote" | "rdv" | "menu";

interface Tab {
  id: TabId;
  href?: string;            // null pour le tab "menu" (qui ouvre un Sheet)
  icon: typeof Home;
  label: string;
  matches: (path: string) => boolean;
}

const TABS: Tab[] = [
  {
    id: "home",
    href: "/",
    icon: Home,
    label: "Accueil",
    matches: (p) => p === "/",
  },
  {
    id: "shop",
    href: "/boutique",
    icon: ShoppingBag,
    label: "Boutique",
    matches: (p) => p.startsWith("/boutique") || p.startsWith("/produit/"),
  },
  {
    id: "quote",
    href: "/demande-de-devis",
    icon: Flame,
    label: "Devis",
    matches: (p) => p === "/demande-de-devis",
  },
  {
    id: "rdv",
    href: "/prendre-rendez-vous",
    icon: Calendar,
    label: "RDV",
    matches: (p) => p === "/prendre-rendez-vous",
  },
  {
    id: "menu",
    icon: MenuIcon,
    label: "Menu",
    matches: () => false, // jamais "actif" via path — actif uniquement quand le drawer est ouvert
  },
];

const MENU_LINKS = [
  { href: "/nos-marques", label: "Nos marques", desc: "Edilkamin · EK63 · Dielle · Ferlux" },
  { href: "/guides", label: "Guides", desc: "Conseils, comparatifs, dimensionnement" },
  { href: "/primes-energie-wallonie-2026", label: "Primes 2026", desc: "Jusqu'à 1 750 €" },
  { href: "/zones-d-intervention", label: "Zones d'intervention", desc: "10 villes en Wallonie" },
  { href: "/blog", label: "Blog", desc: "Articles et actualités" },
  { href: "/faq", label: "FAQ", desc: "Réponses aux questions courantes" },
  { href: "/a-propos", label: "À propos", desc: "Mister Pellets, Fernelmont" },
  { href: "/contact", label: "Contact", desc: "Téléphone, email, formulaire" },
];

export function NavbarSticky() {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const handle = () => setVisible(window.scrollY > 200);
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Détermine l'onglet actif selon le pathname
  // (priorité : si menu drawer ouvert → menu, sinon match path, sinon menu par défaut)
  const activeTabId: TabId = React.useMemo(() => {
    if (menuOpen) return "menu";
    const match = TABS.find((t) => t.matches(pathname ?? "/"));
    if (match) return match.id;
    // Page hors des 4 principaux (ex: /a-propos, /contact, /nos-marques) → indicateur sur "menu"
    return "menu";
  }, [pathname, menuOpen]);

  return (
    <>
      <nav
        className={cn(
          "fixed bottom-0 inset-x-0 z-30 lg:hidden",
          "bg-mp-cream/95 backdrop-blur-md",
          "border-t border-mp-sand/40 shadow-[0_-8px_24px_rgba(20,36,27,0.08)]",
          "transition-transform duration-300",
          visible ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navigation rapide"
      >
        <ul className="relative flex items-stretch h-[72px] max-w-md mx-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabId === tab.id;

            // L'onglet Menu = bouton qui ouvre le Sheet
            if (tab.id === "menu") {
              return (
                <li key={tab.id} className="flex-1 relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className="relative z-10 flex flex-col items-center justify-center gap-1 h-full w-full px-2 text-xs font-medium transition-colors"
                    aria-label="Ouvrir le menu"
                    aria-expanded={menuOpen}
                  >
                    <TabContent isActive={isActive} icon={<Icon className="h-5 w-5" />} label={tab.label} />
                  </button>
                  {isActive && <ActiveIndicator reduceMotion={!!reduceMotion} />}
                </li>
              );
            }

            // Onglets normaux = Link
            return (
              <li key={tab.id} className="flex-1 relative">
                <Link
                  href={tab.href!}
                  className="relative z-10 flex flex-col items-center justify-center gap-1 h-full w-full px-2 text-xs font-medium transition-colors"
                  aria-current={isActive ? "page" : undefined}
                >
                  <TabContent isActive={isActive} icon={<Icon className="h-5 w-5" />} label={tab.label} />
                </Link>
                {isActive && <ActiveIndicator reduceMotion={!!reduceMotion} />}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Drawer Menu (5e onglet) */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t-0 max-h-[85vh] overflow-y-auto px-6 pt-8 pb-safe lg:hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-semibold text-mp-green-deep"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Plus d'options
            </h2>
            <SheetClose className="rounded-full p-2 hover:bg-mp-beige" aria-label="Fermer">
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

/**
 * Contenu d'un onglet (icône + label) avec coloration selon état actif.
 */
function TabContent({
  isActive,
  icon,
  label,
}: {
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <>
      {/* L'icône s'efface légèrement quand l'indicateur passe par-dessus pour donner du contraste */}
      <span
        className={cn(
          "transition-all duration-200 relative",
          isActive ? "text-white -translate-y-3" : "text-mp-ink-soft"
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "transition-colors duration-200",
          isActive ? "text-mp-orange-flame font-bold" : "text-mp-ink-soft"
        )}
      >
        {label}
      </span>
    </>
  );
}

/**
 * Pastille orange surélevée qui glisse de tab en tab.
 * Animée via Framer Motion shared layout (transition spring avec recoil).
 */
function ActiveIndicator({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.span
      layoutId="navbar-sticky-indicator"
      className={cn(
        "absolute left-1/2 -translate-x-1/2 top-0",
        "-mt-5 h-14 w-14 rounded-full",
        "bg-mp-orange-flame ring-4 ring-mp-cream shadow-[0_8px_24px_rgba(242,138,32,0.4)]",
        "pointer-events-none"
      )}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 380,
              damping: 22, // lower damping = more bounce/recoil
              mass: 0.9,
            }
      }
      aria-hidden
    />
  );
}
