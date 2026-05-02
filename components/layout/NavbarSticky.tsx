"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Home, ShoppingBag, Flame, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Navbar FLOTTANTE sticky bottom mobile only — UNIQUE point de navigation
 * sur mobile (cf. doc corrections-mobile-v1 §3.1 : aucun header mobile).
 *
 * 4 actions :
 *   🏠 Accueil
 *   🛒 Boutique
 *   🔥 Devis (bouton central surélevé en orange flame, plus gros, ressort visuellement)
 *   📅 Rendez-vous
 *
 * Design :
 * - Pill rounded, marges externes (lévite au-dessus du contenu)
 * - Backdrop blur + shadow douce
 * - Bouton Devis : plus grand, translate-y vers le haut, fond orange permanent,
 *   c'est le focus de conversion principal
 * - Pour les 3 autres tabs : pastille orange = motion.span derrière l'item actif
 *   qui glisse latéralement avec un overshoot doux
 * - Hide on scroll down, show on scroll up. Toujours visible dans les 80 premiers px.
 * - Safe-area iOS respectée.
 */

type TabId = "home" | "shop" | "quote" | "rdv";

interface Tab {
  id: TabId;
  href: string;
  icon: typeof Home;
  label: string;
  matches: (path: string) => boolean;
}

const TABS: Tab[] = [
  { id: "home",  href: "/",                    icon: Home,        label: "Accueil",  matches: (p) => p === "/" },
  { id: "shop",  href: "/boutique",            icon: ShoppingBag, label: "Boutique", matches: (p) => p.startsWith("/boutique") || p.startsWith("/produit/") },
  { id: "quote", href: "/demande-de-devis",    icon: Flame,       label: "Devis",    matches: (p) => p === "/demande-de-devis" },
  { id: "rdv",   href: "/prendre-rendez-vous", icon: Calendar,    label: "RDV",      matches: (p) => p === "/prendre-rendez-vous" },
];

export function NavbarSticky() {
  const pathname = usePathname();
  // Visible par défaut. Comportement iOS-like : hide on scroll down, show on scroll up.
  const [visible, setVisible] = React.useState(true);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const SCROLL_THRESHOLD = 8; // ignore micro-scrolls
    const TOP_ZONE = 80;        // toujours visible dans cette zone
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
          setVisible(false);
        } else if (delta < -SCROLL_THRESHOLD) {
          setVisible(true);
        }

        lastY = current;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const activeTabId: TabId | null = React.useMemo(() => {
    const match = TABS.find((t) => t.matches(pathname ?? "/"));
    return match ? match.id : null;
  }, [pathname]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 lg:hidden",
        "px-3",
        "transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0 pointer-events-none"
      )}
      style={{
        // Le bouton Devis dépasse vers le haut, donc on garde un padding-top pour
        // que la zone tap soit toujours dans l'écran.
        paddingTop: "1.5rem",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <nav
        className={cn(
          "relative mx-auto max-w-md",
          "rounded-full bg-mp-cream/92 backdrop-blur-xl",
          "border border-mp-sand/50",
          "shadow-[0_8px_32px_rgba(20,36,27,0.18)]"
        )}
        aria-label="Navigation principale"
      >
        <ul className="relative flex items-stretch h-16 p-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabId === tab.id;
            const isQuote = tab.id === "quote";

            return (
              <li key={tab.id} className={cn("relative", isQuote ? "flex-[1.1]" : "flex-1")}>
                {/* Bouton DEVIS — surélevé, orange permanent, plus gros */}
                {isQuote ? (
                  <Link
                    href={tab.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 -top-7",
                      "flex flex-col items-center justify-center",
                      "h-16 w-16 rounded-full",
                      "bg-mp-orange-flame text-white",
                      "shadow-[0_10px_24px_rgba(242,138,32,0.45)]",
                      "ring-4 ring-mp-cream",
                      "transition-transform duration-200 active:scale-95"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-[10px] font-bold tracking-tight mt-0.5">
                      {tab.label}
                    </span>
                  </Link>
                ) : (
                  <>
                    {/* Pastille active (fond) — animation horizontale douce */}
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
                                type: "spring",
                                stiffness: 260,
                                damping: 26,
                                mass: 0.8,
                                restDelta: 0.5,
                              }
                        }
                        aria-hidden
                      />
                    )}

                    <Link
                      href={tab.href}
                      aria-current={isActive ? "page" : undefined}
                      className="relative z-10 flex flex-col items-center justify-center h-full w-full"
                    >
                      <span
                        className={cn(
                          "flex flex-col items-center justify-center gap-0.5",
                          "text-[10px] font-semibold tracking-tight transition-colors duration-200",
                          isActive ? "text-white" : "text-mp-ink-soft"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px]",
                            isActive ? "text-white" : "text-mp-ink-soft"
                          )}
                        />
                        <span>{tab.label}</span>
                      </span>
                    </Link>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
