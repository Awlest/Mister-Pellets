import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATALOGUE_LINKS, INFO_LINKS, LEGAL_LINKS, SERVICE_LINKS, isFilterLink, published, type NavLink } from "@/config/navigation";
import {
  ADDRESS,
  EMAIL,
  FAMILY_SITES,
  LEGAL_ENTITY,
  OPENING_HOURS,
  PARENT_BRAND,
  PHONE_DISPLAY,
  PHONE_HREF,
  SITE_NAME,
} from "@/config/site";

/**
 * Pied de page, grille commune aux sites Mister (standard du 17/10/2026) :
 * marque et coordonnées, Catalogue, Services, S'informer, puis les bandes
 * « Un service Awlest » et « La famille Awlest », et la ligne légale.
 * Remplace la version minimale du Hotfix V1.3 (logo, réseaux, liens légaux).
 *
 * Couleurs sur vert deep #174724 : texte crème #F4EDE1 (9,2:1), liens et
 * textes secondaires beige à 85 %, titres de colonne beige à 75 % (5,9:1),
 * survol orange flame #F28A20 (4,6:1).
 *
 * Padding-bottom : place pour la NavbarSticky sous 1280 px (.footer-mp).
 */

// Réseaux sociaux. Tant qu'une URL reste vide, l'icône correspondante n'est
// pas rendue : trois liens morts vers "#tiktok" pointaient jusqu'ici vers
// nulle part, ce qui dégrade l'expérience et la confiance. Dès que les profils
// existent, coller l'URL complète ici et compléter SAME_AS dans
// components/seo/JsonLd.tsx pour que le balisage les déclare aussi.
const SOCIAL = {
  tiktok: "",
  instagram: "",
  youtube: "",
};

const hasSocial = Object.values(SOCIAL).some(Boolean);

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

const LINK =
  "inline-flex min-h-11 items-center text-[0.9375rem] text-mp-cream/85 transition-colors hover:text-mp-orange-flame pointer-fine:min-h-9";
const TITLE = "mb-2 text-xs font-semibold uppercase tracking-wider text-mp-cream/75";

function Column({ title, links }: { title: string; links: readonly NavLink[] }) {
  const shown = published(links);
  if (shown.length === 0) return null;
  return (
    <div>
      <p className={TITLE}>{title}</p>
      <ul>
        {shown.map((link) => (
          <li key={link.href}>
            {isFilterLink(link.href) ? (
              <a href={link.href} className={LINK}>
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className={LINK}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-mp w-full bg-mp-green-deep pt-10 text-mp-cream lg:pt-12">
      <div className="mp-shell">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            {/* Le contour du logo est en vert sombre, le même que ce fond : posé
              * à nu, il disparaît. Il repose donc sur un médaillon crème plein
              * (pas de contour lumineux en drop-shadow, DESIGN.md). */}
            <Link href="/" aria-label="Mister Pellets, accueil" className="inline-block rounded-[28px] bg-mp-cream p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-mister-pellets-ref.svg"
                alt="Mister Pellets"
                width={320}
                height={320}
                loading="lazy"
                decoding="async"
                className="h-24 w-24 object-contain"
              />
            </Link>
            <p className="mt-3 text-base text-mp-cream/85">Poêles à pellets vendus, posés et entretenus en Wallonie.</p>
            <div className="mt-4 flex flex-col items-start">
              <a
                href={PHONE_HREF}
                className="inline-flex min-h-11 items-center text-base font-semibold text-mp-cream transition-colors hover:text-mp-orange-flame"
              >
                {PHONE_DISPLAY}
              </a>
              <a href={`mailto:${EMAIL}`} className={LINK}>
                {EMAIL}
              </a>
              <p className="mt-1 text-[0.9375rem] text-mp-cream/85">{OPENING_HOURS}</p>
              <p className="mt-1 text-[0.9375rem] text-mp-cream/85">
                Showroom sur rendez-vous, {ADDRESS.street}, {ADDRESS.postalCode} {ADDRESS.city}
              </p>
            </div>

            {/* Réseaux sociaux : masqués tant qu'aucun profil n'est renseigné. */}
            {hasSocial && (
              <div className="mt-5">
                <p className={TITLE}>Suivez-nous</p>
                <div className="flex items-center gap-4">
                  {SOCIAL.tiktok && (
                    <a
                      href={SOCIAL.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Mister Pellets sur TikTok"
                      className="text-mp-cream transition-colors hover:text-mp-orange-flame"
                    >
                      <TikTokIcon className="h-7 w-7" />
                    </a>
                  )}
                  {SOCIAL.instagram && (
                    <a
                      href={SOCIAL.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Mister Pellets sur Instagram"
                      className="text-mp-cream transition-colors hover:text-mp-orange-flame"
                    >
                      <InstagramIcon className="h-7 w-7" />
                    </a>
                  )}
                  {SOCIAL.youtube && (
                    <a
                      href={SOCIAL.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Mister Pellets sur YouTube"
                      className="text-mp-cream transition-colors hover:text-mp-orange-flame"
                    >
                      <YoutubeIcon className="h-7 w-7" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:gap-x-12">
            <Column title="Catalogue" links={CATALOGUE_LINKS} />
            <Column title="Services" links={SERVICE_LINKS} />
            <Column title="S'informer" links={INFO_LINKS} />
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-mp-cream/25 pt-6 lg:grid-cols-2">
          <div>
            <p className={TITLE}>Un service {PARENT_BRAND.name}</p>
            <p className="max-w-md text-[0.9375rem] text-mp-cream/85">
              {SITE_NAME} est une marque d&apos;{PARENT_BRAND.name}, installateur de chauffage en Wallonie depuis{" "}
              {PARENT_BRAND.since}. Ce sont ses techniciens qui posent et entretiennent votre poêle.
            </p>
            <a href={PARENT_BRAND.href} className={`${LINK} gap-1 font-semibold text-mp-cream`}>
              Découvrir {PARENT_BRAND.name}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <div>
            <p className={TITLE}>La famille {PARENT_BRAND.name}</p>
            <ul className="flex flex-col">
              {FAMILY_SITES.filter((site) => site.href !== PARENT_BRAND.href).map((site) => (
                <li key={site.href}>
                  <a href={site.href} className={`${LINK} gap-1`}>
                    {site.name} · {site.description}
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-mp-cream/25 pt-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Liens légaux" className="flex flex-wrap gap-x-4">
            {published(LEGAL_LINKS).map((link) => (
              <Link key={link.href} href={link.href} className={LINK}>
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-mp-cream/75">
            © {year} {SITE_NAME}, une marque d&apos;{LEGAL_ENTITY.name} · BCE {LEGAL_ENTITY.enterpriseNumber}
          </p>
        </div>
      </div>
    </footer>
  );
}
