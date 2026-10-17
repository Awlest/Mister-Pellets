"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Home, ShoppingBag, Flame, Calendar, Menu as MenuIcon } from "lucide-react";

/**
 * Navbar FLOTTANTE sticky bottom, mobile ET tablette (jusqu'à xl / 1280 px).
 * 5 onglets : Accueil / Boutique / Devis / RDV / Menu (drawer)
 * La pastille orange est un FOND ACTIF derrière l'onglet courant qui glisse
 * latéralement d'un onglet à l'autre (courbe en sortie douce, sans rebond).
 *
 * Design :
 * - Navbar pill rounded, marges externes (lévite au-dessus du contenu)
 * - Fond crème opaque, filet sable et ombre douce (aucun flou : DESIGN.md)
 * - Pastille orange = un seul élément derrière les onglets, déplacé en CSS
 *   (transform). framer-motion servait à cette seule animation et chargeait
 *   plus de 40 Ko de JavaScript sur chaque page (audit mobile du 11/10/2026).
 * - Libellé et icône de l'onglet actif en vert le plus sombre : le blanc sur
 *   l'orange flamme ne fait que 2,5:1, le vert 6,2:1.
 *
 * Poids : la barre est sur chaque page, son JavaScript aussi. Le drawer du
 * 5e onglet vit dans MenuSheet.tsx, téléchargé au premier geste vers l'onglet,
 * et les classes passent par clsx plutôt que par cn : aucune ne se contredit,
 * tailwind-merge n'a rien à fusionner ici.
 */

// La plupart des visiteurs n'ouvrent jamais le menu : sa fenêtre Radix
// (verrou du défilement, piège à focus) ne pèse plus sur le premier chargement.
const loadMenuSheet = () => import("./MenuSheet");
const preloadMenuSheet = () => {
  loadMenuSheet().catch(() => {});
};

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

export function NavbarSticky() {
  const pathname = usePathname();
  // Visible par défaut. Comportement iOS-like : hide on scroll down, show on scroll up.
  const [visible, setVisible] = React.useState(true);
  const [menuOpen, setMenuOpen] = React.useState(false);
  // Gardé une fois téléchargé : les ouvertures suivantes sont immédiates et
  // l'animation de fermeture se joue.
  const [MenuSheet, setMenuSheet] = React.useState<typeof import("./MenuSheet").default | null>(null);

  const openMenu = () => {
    // La pastille part tout de suite vers Menu, le drawer suit dès que son
    // code est là (déjà en route depuis le doigt posé sur l'onglet).
    setMenuOpen(true);
    if (MenuSheet) return;
    loadMenuSheet().then(
      (mod) => setMenuSheet(() => mod.default),
      // Réseau coupé, ou version remplacée entre-temps : Turbopack ne retente
      // pas un morceau en échec. La pastille revient sur l'onglet courant
      // plutôt que de rester bloquée sur Menu.
      () => setMenuOpen(false),
    );
  };

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
        className={clsx(
          "fixed inset-x-0 bottom-0 z-30 xl:hidden",
          "px-3 pb-3",
          // translate-y-* écrit la propriété translate (Tailwind 4), d'où
          // transition-[translate,opacity]. Retour en --mp-duration-enter,
          // repli plus court.
          "transition-[translate,opacity] ease-out",
          effectiveVisible
            ? "translate-y-0 opacity-100 duration-(--mp-duration-enter)"
            : "translate-y-[120%] opacity-0 pointer-events-none duration-(--mp-duration-exit)"
        )}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <nav
          className={clsx(
            "relative mx-auto max-w-md",
            "rounded-full bg-mp-cream",
            "border border-mp-sand/50",
            "shadow-md",
            "overflow-hidden"
          )}
          aria-label="Navigation rapide"
        >
          {/* Pastille active : glisse d'un onglet à l'autre (180 ms, sortie
              douce, sans rebond), coupée si l'utilisateur réduit les
              animations. */}
          <span
            aria-hidden
            className={clsx(
              "pointer-events-none absolute inset-y-1.5 left-1.5 rounded-full bg-mp-orange-flame",
              "transition-transform ease-out motion-reduce:transition-none"
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
                  className={clsx(
                    "relative z-10 flex flex-col items-center justify-center gap-0.5 h-full w-full px-1",
                    "text-[10px] font-semibold tracking-tight transition-colors",
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
                      onPointerDown={preloadMenuSheet}
                      onFocus={preloadMenuSheet}
                      onClick={openMenu}
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

      {/* Drawer Menu (5e onglet), monté au premier clic */}
      {MenuSheet && <MenuSheet open={menuOpen} onOpenChange={setMenuOpen} />}
    </>
  );
}
