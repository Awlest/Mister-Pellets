import Link from "next/link";
import Image from "next/image";

/**
 * Footer mobile MINIMAL (Hotfix V1.3 §P1).
 *
 * Annule et remplace les versions V1.1 et V1.2.
 *
 * Contenu strict, UNIQUEMENT :
 *   1. Logo couleur (60-70 px de hauteur)
 *   2. Bloc "Suivez-nous" + 3 icônes sociales (TikTok, Instagram, YouTube)
 *      en pleine opacité pour bonne visibilité
 *   3. 4 liens légaux compacts horizontaux séparés par "·"
 *   4. Copyright Awlest SRL + TVA + © year
 *
 * Retiré du V1.2 :
 *   - Téléphone, email, adresse (déjà accessibles via la page Contact en 1 clic
 *     depuis la navbar, pas de doublon dans le footer)
 *
 * Couleurs (WCAG AAA) :
 *   - Fond vert deep #174724
 *   - Texte / icônes / liens légaux : beige #FAF7F0 PLEINE OPACITÉ (11.8:1)
 *   - Séparateurs "·" : beige opacité 60 % (7.1:1)
 *   - Hover : orange flame #F28A20 (4.6:1)
 *   - Texte légal en bas : beige opacité 75 % (8.8:1)
 *
 * Padding-bottom : 96 px sur mobile (libère NavbarSticky 72 + 24) + safe-area iOS
 *                  via classe .footer-mp dans globals.css. 32 px sur lg+.
 */

// TODO : remplacer par les vraies URLs des profils Mister Pellets quand le
// client les communiquera. Placeholder pour l'instant.
const SOCIAL = {
  tiktok: "#tiktok",
  instagram: "#instagram",
  youtube: "#youtube",
};

const LEGAL_LINKS = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "CGV", href: "/cgv" },
  { label: "Confidentialité", href: "/politique-confidentialite" },
  { label: "Cookies", href: "/politique-cookies" },
];

// SVG officiels des marques (lucide-react n'expose plus les logos de marque).
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.69a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.12z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-mp bg-mp-green-deep text-mp-cream w-full px-4 pt-8 lg:px-6 lg:pt-12">
      <div className="max-w-md mx-auto lg:max-w-3xl flex flex-col items-center text-center gap-6">
        {/* Bloc identité : logo (×2 = 160 px) côte à côte avec les sociaux.
          * Drop-shadow cream empilé pour un fin contour lumineux qui suit
          * exactement les contours du SVG (vs un rectangle de bordure).
          *
          * justify-between + w-full : le logo est collé au bord gauche du
          * conteneur, les sociaux au bord droit. L'espace gauche-au-logo et
          * sociaux-au-bord-droit est strictement identique (= padding
          * horizontal du footer), symétrie parfaite. */}
        <div className="flex items-center justify-between gap-4 w-full">
          <Link href="/" aria-label="Mister Pellets, accueil" className="shrink-0">
            <Image
              src="/logo-mister-pellets-ref.svg"
              alt="Mister Pellets"
              width={320}
              height={320}
              className="h-40 w-40 object-contain"
              style={{
                filter:
                  "drop-shadow(0 0 1px #FAF7F0) drop-shadow(0 0 1px #FAF7F0) drop-shadow(0 0 0.5px #FAF7F0)",
              }}
            />
          </Link>

          {/* Réseaux sociaux : titre + 3 icônes BIEN VISIBLES (pleine opacité) */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs uppercase tracking-wider text-mp-cream/85">
              Suivez-nous
            </p>
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mister Pellets sur TikTok"
                className="text-mp-cream hover:text-mp-orange-flame transition-colors"
              >
                <TikTokIcon className="h-7 w-7" />
              </a>
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mister Pellets sur Instagram"
                className="text-mp-cream hover:text-mp-orange-flame transition-colors"
              >
                <InstagramIcon className="h-7 w-7" />
              </a>
              <a
                href={SOCIAL.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mister Pellets sur YouTube"
                className="text-mp-cream hover:text-mp-orange-flame transition-colors"
              >
                <YoutubeIcon className="h-7 w-7" />
              </a>
            </div>
          </div>
        </div>

        {/* Liens légaux compacts : pleine opacité pour la lisibilité */}
        <nav
          aria-label="Liens légaux"
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-mp-cream pt-4 border-t border-mp-cream/25 w-full"
        >
          {LEGAL_LINKS.map((link, i) => (
            <span key={link.href} className="inline-flex items-center gap-2">
              <Link
                href={link.href}
                className="text-mp-cream hover:text-mp-orange-flame transition-colors"
              >
                {link.label}
              </Link>
              {i < LEGAL_LINKS.length - 1 && (
                <span className="text-mp-cream/60" aria-hidden>·</span>
              )}
            </span>
          ))}
        </nav>

        {/* Copyright */}
        <div className="text-xs text-mp-cream/75 leading-relaxed">
          <p>Awlest SRL · TVA BE 0656.514.212</p>
          <p>© {year} Mister Pellets</p>
        </div>
      </div>
    </footer>
  );
}
