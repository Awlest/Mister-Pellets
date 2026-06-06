"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartTrigger } from "@/components/cart/CartDrawer";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
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

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        // ZÉRO header sur mobile (cf. doc corrections-mobile-v1 §3.1).
        // Le header apparaît uniquement à partir de lg (1024 px).
        "hidden lg:block",
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "h-16 bg-mp-cream/92 backdrop-blur-md shadow-sm"
          : "h-20 md:h-24 bg-mp-cream"
      )}
    >
      <div className="container mx-auto h-full max-w-[1280px] px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Mister Pellets, accueil">
          <Image
            src="/logo-mister-pellets-mascotte.svg"
            alt=""
            width={scrolled ? 36 : 44}
            height={scrolled ? 36 : 44}
            priority
            className="transition-all duration-300"
          />
          <span
            className={cn(
              "font-semibold text-mp-green-deep transition-all duration-300 hidden sm:inline",
              scrolled ? "text-lg" : "text-xl"
            )}
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mister Pellets
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => item.children && setOpenDropdown(item.href)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium",
                  "text-mp-ink hover:text-mp-orange-flame transition-colors"
                )}
              >
                {item.label}
                {item.children && <ChevronDown className="h-3.5 w-3.5" />}
              </Link>

              {/* Mega menu */}
              {item.children && openDropdown === item.href && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-72"
                  role="menu"
                >
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

        {/* Actions droite (desktop uniquement, le Header est masqué sur mobile) */}
        <div className="flex items-center gap-2 shrink-0">
          <CartTrigger />
          <Button asChild variant="primary" size="default">
            <Link href="/demande-de-devis">Devis →</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
