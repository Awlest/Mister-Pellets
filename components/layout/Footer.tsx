import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Star } from "lucide-react";
import { formatPhone } from "@/lib/utils";

// Lucide n'expose plus les logos de marque, on inline les SVG officiels.
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const PHONE = "0472 04 32 22";
const EMAIL = "info@awlest.com";
const ADDRESS_LINE_1 = "Rue des Fagotis 3A";
const ADDRESS_LINE_2 = "5380 Fernelmont";

// Liens sociaux : à remplacer par les vraies URLs quand les comptes seront actifs.
const SOCIAL = {
  facebook: "https://www.facebook.com/misterpellets",
  instagram: "https://www.instagram.com/misterpellets",
  google: "https://g.page/r/mister-pellets",
};

const NAV_COLUMNS = [
  {
    title: "Acheter",
    links: [
      { label: "Boutique complète", href: "/boutique" },
      { label: "Nos marques", href: "/nos-marques" },
      { label: "Demande de devis", href: "/demande-de-devis" },
      { label: "Prendre rendez-vous", href: "/prendre-rendez-vous" },
    ],
  },
  {
    title: "Comprendre",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Blog", href: "/blog" },
      { label: "Prime Wallonie 2026", href: "/primes-energie-wallonie-2026" },
      { label: "Zones d'intervention", href: "/zones-d-intervention" },
    ],
  },
  {
    title: "Mister Pellets",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Contact", href: "/contact" },
    ],
  },
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
    <footer className="bg-mp-green-deep text-mp-cream pt-12 pb-6 lg:pt-16 lg:pb-8">
      <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
        {/* Brand block, centré mobile, aligné gauche desktop */}
        <div className="text-center lg:text-left mb-10 lg:mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-4" aria-label="Mister Pellets, accueil">
            <Image
              src="/logo-mister-pellets-mascotte.svg"
              alt=""
              width={56}
              height={56}
              className="brightness-0 invert opacity-95"
            />
            <span
              className="text-2xl lg:text-3xl font-semibold text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Mister Pellets
            </span>
          </Link>
          <p className="text-sm text-mp-cream/75 leading-relaxed max-w-md mx-auto lg:mx-0">
            Vente, pose et entretien de poêles à pellets en Wallonie depuis 2016.
            Edilkamin, EK63, Dielle, Ferlux.
          </p>
        </div>

        {/* Coordonnées + réseaux sociaux, mobile compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-10 lg:mb-12">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mp-orange-warm mb-4">
              Nous joindre
            </h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a
                  href={`tel:${formatPhone(PHONE)}`}
                  className="inline-flex items-center gap-2.5 text-mp-cream hover:text-mp-orange-flame transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 text-mp-orange-warm" />
                  <span className="font-medium">{PHONE}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2.5 text-mp-cream hover:text-mp-orange-flame transition-colors break-all"
                >
                  <Mail className="h-4 w-4 shrink-0 text-mp-orange-warm" />
                  <span>{EMAIL}</span>
                </a>
              </li>
              <li>
                <span className="inline-flex items-start gap-2.5 text-mp-cream/85">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-mp-orange-warm" />
                  <span>
                    {ADDRESS_LINE_1}
                    <br />
                    {ADDRESS_LINE_2}
                  </span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mp-orange-warm mb-4">
              Suis-nous
            </h3>
            <ul className="flex items-center gap-3">
              <li>
                <a
                  href={SOCIAL.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mister Pellets sur Facebook"
                  className="flex items-center justify-center h-11 w-11 rounded-full bg-mp-cream/10 hover:bg-mp-orange-flame transition-colors"
                >
                  <FacebookIcon className="h-5 w-5" />
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mister Pellets sur Instagram"
                  className="flex items-center justify-center h-11 w-11 rounded-full bg-mp-cream/10 hover:bg-mp-orange-flame transition-colors"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mister Pellets sur Google, 4,9 sur 200 avis"
                  className="flex items-center justify-center h-11 w-11 rounded-full bg-mp-cream/10 hover:bg-mp-orange-flame transition-colors"
                >
                  <Star className="h-5 w-5" />
                </a>
              </li>
            </ul>
            <p className="text-xs text-mp-cream/65 mt-3">
              <span className="text-mp-orange-warm">★</span> 4,9 / 5 sur 200 avis Google
            </p>
          </div>
        </div>

        {/* Navigation secondaire, 3 petites colonnes mobile (scrollable horizontal si besoin) */}
        <nav
          aria-label="Navigation footer"
          className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8 mb-10 lg:mb-12"
        >
          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-mp-orange-warm mb-3">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2">
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
        </nav>

        {/* Liens légaux, wrap horizontal */}
        <div className="border-t border-mp-cream/10 pt-6 mb-4">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-mp-cream/70">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-mp-orange-flame transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom bar, copyright + cadre légal */}
        <div className="text-xs text-mp-cream/55 leading-relaxed space-y-1">
          <p>
            © {year} Mister Pellets. Tous droits réservés.
          </p>
          <p>
            Mister Pellets est la marque commerciale d'Awlest SRL,
            inscrite à la Banque-Carrefour des Entreprises sous le numéro
            BE 0656.514.212, siège social {ADDRESS_LINE_1}, {ADDRESS_LINE_2}, Belgique.
          </p>
        </div>
      </div>
    </footer>
  );
}
