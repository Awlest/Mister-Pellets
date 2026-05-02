import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { formatPhone } from "@/lib/utils";

/**
 * Footer mobile-first refondu (Hotfix V1.1 §H3).
 *
 * Specs strictes :
 * - Fond vert deep #174724 + texte beige #FAF7F0 (contraste 11,8:1, WCAG AAA)
 * - Padding intérieur : 32 px haut, 96 px bas (navbar 72 + 24 respiration), 16 px latéral
 * - Hauteur cible mobile : 400-550 px
 * - 4 blocs verticaux : Logo+tagline / Navigation / Contact / Légal + Copyright
 * - Logo Mister Pellets EN COULEUR sur card cream (cf. §H4)
 * - Liens hover orange flame
 * - Largeur 100 % viewport, jamais de débordement
 */

const PHONE = "0472 04 32 22";
const EMAIL = "info@awlest.com";
const ADDRESS_LINE_1 = "Rue des Fagotis 3A";
const ADDRESS_LINE_2 = "5380 Fernelmont";

const NAV_LINKS = [
  { label: "Boutique", href: "/boutique" },
  { label: "Nos marques", href: "/nos-marques" },
  { label: "Demander un devis", href: "/demande-de-devis" },
  { label: "Prendre rendez-vous", href: "/prendre-rendez-vous" },
  { label: "Guides", href: "/guides" },
  { label: "Blog", href: "/blog" },
  { label: "Prime Wallonie 2026", href: "/primes-energie-wallonie-2026" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGV", href: "/cgv" },
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
  { label: "Politique cookies", href: "/politique-cookies" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-mp bg-mp-green-deep text-mp-cream w-full px-4 pt-8 lg:px-6 lg:pt-12">
      <div className="max-w-3xl mx-auto lg:max-w-[1280px]">
        {/* Bloc 1 — Logo couleur + tagline */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 mb-4"
            aria-label="Mister Pellets, accueil"
          >
            {/* Logo couleur sur fond cream pour préserver les couleurs (les
              * verts sombres du logo seraient invisibles sur le fond vert deep
              * du footer). */}
            <span className="inline-block bg-mp-cream rounded-2xl p-2.5 shadow-sm">
              <Image
                src="/logo-mister-pellets-full.svg"
                alt="Mister Pellets"
                width={120}
                height={120}
                className="h-16 w-16 object-contain"
              />
            </span>
            <span
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Mister Pellets
            </span>
          </Link>
          <p className="text-sm text-mp-cream/85 leading-relaxed max-w-md">
            Vente, pose et entretien de poêles à pellets en Wallonie depuis 2016.
            Edilkamin, EK63, Dielle, Ferlux.
          </p>
        </div>

        {/* Bloc 2 — Navigation */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-mp-orange-warm mb-3">
            Navigation
          </h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-mp-cream/90 hover:text-mp-orange-flame transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bloc 3 — Contact */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-mp-orange-warm mb-3">
            Nous contacter
          </h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a
                href={`tel:${formatPhone(PHONE)}`}
                className="inline-flex items-center gap-2.5 text-mp-cream hover:text-mp-orange-flame transition-colors"
              >
                <Phone className="h-4 w-4 shrink-0 text-mp-orange-warm" aria-hidden />
                <span className="font-medium">{PHONE}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2.5 text-mp-cream hover:text-mp-orange-flame transition-colors"
              >
                <Mail className="h-4 w-4 shrink-0 text-mp-orange-warm" aria-hidden />
                <span>{EMAIL}</span>
              </a>
            </li>
            <li>
              <span className="inline-flex items-start gap-2.5 text-mp-cream/90">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-mp-orange-warm" aria-hidden />
                <span>
                  {ADDRESS_LINE_1}
                  <br />
                  {ADDRESS_LINE_2}
                </span>
              </span>
            </li>
          </ul>
        </div>

        {/* Bloc 4 — Informations légales */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-mp-orange-warm mb-3">
            Informations légales
          </h3>
          <ul className="flex flex-col gap-3 text-sm">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-mp-cream/90 hover:text-mp-orange-flame transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Copyright + cadre légal Awlest */}
        <div className="pt-5 border-t border-mp-cream/15 text-xs text-mp-cream/70 leading-relaxed space-y-1">
          <p>Awlest SRL · TVA BE 0656.514.212</p>
          <p>© {year} Mister Pellets. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
