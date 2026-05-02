import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { formatPhone } from "@/lib/utils";

const PHONE = "0472 04 32 22";
const EMAIL = "info@awlest.com";
const ADDRESS = "Rue des Fagotis 3A, 5380 Fernelmont";

const COLUMNS = [
  {
    title: "Boutique",
    links: [
      { label: "Tous les modèles", href: "/boutique" },
      { label: "Étanches BBC", href: "/boutique?type=etanche" },
      { label: "Canalisables", href: "/boutique?type=canalisable" },
      { label: "Hydros", href: "/boutique?type=hydro" },
      { label: "Inserts encastrables", href: "/boutique?type=insert" },
    ],
  },
  {
    title: "Nos marques",
    links: [
      { label: "Edilkamin", href: "/nos-marques/edilkamin" },
      { label: "EK63", href: "/nos-marques/ek63" },
      { label: "Dielle", href: "/nos-marques/dielle" },
      { label: "Ferlux", href: "/nos-marques/ferlux" },
      { label: "Comparatif", href: "/guides/comparatif-marques" },
    ],
  },
  {
    title: "Aide",
    links: [
      { label: "Guide d'achat", href: "/guides/guide-achat-poele-pellets-wallonie" },
      { label: "Primes Wallonie 2026", href: "/primes-energie-wallonie-2026" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Prendre RDV", href: "/prendre-rendez-vous" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "CGV", href: "/cgv" },
      { label: "Vie privée", href: "/politique-confidentialite" },
      { label: "Cookies", href: "/politique-cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-mp-green-deep text-mp-cream pt-16 pb-8 mt-20">
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
        {/* Brand + columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 mb-12">
          {/* Brand block */}
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo-mister-pellets-mascotte.svg"
                alt=""
                width={48}
                height={48}
                className="brightness-0 invert opacity-90"
              />
              <span
                className="text-2xl font-semibold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Mister Pellets
              </span>
            </Link>
            <p className="text-sm text-mp-cream/70 leading-relaxed mb-6">
              Vente, pose et entretien de poêles à pellets en Wallonie.
              Edilkamin, EK63, Dielle, Ferlux. Pose en 1 jour, primes incluses.
            </p>
            <div className="flex flex-col gap-2.5 text-sm">
              <a
                href={`tel:${formatPhone(PHONE)}`}
                className="inline-flex items-center gap-2 text-mp-cream hover:text-mp-orange-flame transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {PHONE}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 text-mp-cream hover:text-mp-orange-flame transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {EMAIL}
              </a>
              <span className="inline-flex items-start gap-2 text-mp-cream/80">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                {ADDRESS}
              </span>
            </div>
          </div>

          {/* 4 columns */}
          <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-mp-orange-warm mb-4">
                  {col.title}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-mp-cream/80 hover:text-mp-orange-flame transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-mp-cream/10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-mp-cream/60">
          <p>
            © {new Date().getFullYear()} Awlest SRL · TVA BE 0656.514.212 · Mister Pellets · Fernelmont
          </p>
          <p className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <span className="text-mp-orange-warm">★</span>
              4.9 / 5 sur 200 avis Google
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
