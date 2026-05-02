"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Flame, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Navbar sticky bottom mobile only.
 * 4 actions : Accueil / Boutique / Devis (surélevé central) / RDV
 * Apparaît après 200px de scroll.
 * Cf. brief §5.3
 */
export function NavbarSticky() {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handle = () => setVisible(window.scrollY > 200);
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const items: Array<{
    href: string;
    icon: typeof Home;
    label: string;
    primary?: boolean;
  }> = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/boutique", icon: ShoppingBag, label: "Boutique" },
    { href: "/demande-de-devis", icon: Flame, label: "Devis", primary: true },
    { href: "/prendre-rendez-vous", icon: Calendar, label: "RDV" },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 inset-x-0 z-30 lg:hidden",
        "bg-mp-cream/95 backdrop-blur-md",
        "border-t border-mp-sand/40 shadow-[0_-8px_24px_rgba(20,36,27,0.08)]",
        "transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation rapide"
    >
      <ul className="flex items-stretch justify-around h-[72px] max-w-md mx-auto px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          if (item.primary) {
            return (
              <li key={item.href} className="flex-1 flex justify-center -mt-5">
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-full",
                    "bg-mp-orange-flame text-white shadow-lg ring-4 ring-mp-cream",
                    "hover:bg-mp-orange-warm hover:shadow-xl active:scale-95",
                    "transition-all duration-200"
                  )}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-[10px] font-bold leading-none">{item.label}</span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 h-full px-2",
                  "text-xs font-medium transition-colors",
                  active ? "text-mp-orange-flame" : "text-mp-ink-soft hover:text-mp-green-deep"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "text-mp-orange-flame")} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
